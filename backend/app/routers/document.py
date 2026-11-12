import os
import uuid
import shutil
import logging
from typing import List, Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, UserRole
from app.models.document import PattaDocument, DocumentProcessingStatus
from app.models.administrative import AdministrativeDistrict, AdministrativeTahasil, AdministrativeVillage
from app.models.cadastral import CadastralParcel
from app.schemas.document import (
    PattaExtractionResponse,
    PattaDocumentSummaryResponse,
    PattaConfirmRequest,
    ExtractedLandDetails,
)
from app.core.dependencies import require_role
from app.core.patta_extractor import patta_extractor

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/documents", tags=["Patta Document Processing & AI Extraction"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "patta")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload-patta", response_model=PattaExtractionResponse)
async def upload_and_extract_patta(
    file: UploadFile = File(...),
    current_farmer: User = Depends(require_role(UserRole.FARMER)),
    db: AsyncSession = Depends(get_db),
):
    """
    Accepts Odisha Patta / Record of Rights document (PDF, JPG, PNG up to 10MB).
    Runs multi-strategy digital text and deep learning OCR extraction.
    Cross-references official Odisha administrative hierarchy and cadastral PostGIS database.
    Persists document record in database linked to authenticated farmer.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided in upload."
        )

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: PDF, JPG, JPEG, PNG, WEBP."
        )

    # Generate unique secure storage filename
    doc_id = uuid.uuid4()
    sanitized_filename = f"{doc_id}_{os.path.basename(file.filename)}"
    destination_path = os.path.join(UPLOAD_DIR, sanitized_filename)

    # Stream to file while verifying size
    file_size = 0
    try:
        with open(destination_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):  # 1MB chunks
                file_size += len(chunk)
                if file_size > MAX_FILE_SIZE:
                    buffer.close()
                    if os.path.exists(destination_path):
                        os.remove(destination_path)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File exceeds maximum allowed size of 10 MB (uploaded {file_size / (1024*1024):.2f} MB)."
                    )
                buffer.write(chunk)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving uploaded file: {e}")
        if os.path.exists(destination_path):
            os.remove(destination_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save uploaded document."
        )

    # Execute extraction pipeline
    try:
        extraction_result = patta_extractor.extract_from_file(destination_path, file.content_type or "")
        fields_data = extraction_result["fields"]
        confidence_scores = extraction_result["confidence_scores"]
        overall_conf = extraction_result["overall_confidence"]
        raw_text = extraction_result["raw_text"]
    except Exception as e:
        logger.error(f"Extraction error on {sanitized_filename}: {e}")
        # Record failed document in DB
        doc_record = PattaDocument(
            id=doc_id,
            farmer_id=current_farmer.id,
            original_filename=file.filename,
            file_path=destination_path,
            file_size_bytes=file_size,
            mime_type=file.content_type or "application/octet-stream",
            document_type="ODISHA_PATTA_ROR",
            status=DocumentProcessingStatus.FAILED.value,
            error_message=str(e),
        )
        db.add(doc_record)
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unable to extract text from document: {str(e)}"
        )

    # Validate document page limit (Standard Odisha Patta / ROR is 1-3 pages)
    page_count = fields_data.get("page_count", 1)
    if page_count > 6:
        doc_record = PattaDocument(
            id=doc_id,
            farmer_id=current_farmer.id,
            original_filename=file.filename,
            file_path=destination_path,
            file_size_bytes=file_size,
            mime_type=file.content_type or "application/octet-stream",
            document_type="ODISHA_PATTA_ROR",
            status=DocumentProcessingStatus.FAILED.value,
            error_message=f"Uploaded document has {page_count} pages. Standard Odisha Record of Rights (Patta) is 1 to 3 pages.",
        )
        db.add(doc_record)
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The uploaded document contains {page_count} pages. Official Odisha Patta / Record of Rights documents (Schedule I Form No. 39-A) are typically 1 to 3 pages. Please upload only the official Patta/ROR document pages."
        )

    # Validate that at least one key land identifier was detected
    has_khata = bool(fields_data.get("khata_number"))
    has_plot = bool(fields_data.get("plot_number"))
    has_village = bool(fields_data.get("village"))
    if not (has_khata or has_plot or has_village):
        doc_record = PattaDocument(
            id=doc_id,
            farmer_id=current_farmer.id,
            original_filename=file.filename,
            file_path=destination_path,
            file_size_bytes=file_size,
            mime_type=file.content_type or "application/octet-stream",
            document_type="ODISHA_PATTA_ROR",
            status=DocumentProcessingStatus.FAILED.value,
            error_message="Uploaded document does not contain recognizable Odisha Patta land records (Khata, Plot, or Mouza).",
        )
        db.add(doc_record)
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The uploaded document could not be identified as an Odisha Record of Rights (Patta). Mandatory land-record details (Khata Number, Plot Number, or Mouza) were not detected. Please upload an official Odisha Patta / ROR (Schedule I Form No. 39-A)."
        )

    # Cross-reference with administrative master tables in PostgreSQL
    admin_match_info = {}
    if fields_data.get("district"):
        dist_stmt = select(AdministrativeDistrict).where(
            AdministrativeDistrict.district_name.ilike(fields_data["district"])
        )
        dist_res = await db.execute(dist_stmt)
        dist_obj = dist_res.scalars().first()
        if dist_obj:
            fields_data["district"] = dist_obj.district_name
            admin_match_info["district_lgd"] = dist_obj.lgd_code
            confidence_scores["district"] = max(confidence_scores.get("district", 0.0), 0.98)

    if fields_data.get("tahasil") and fields_data.get("district"):
        tah_stmt = select(AdministrativeTahasil).where(
            AdministrativeTahasil.district_name.ilike(fields_data["district"]),
            AdministrativeTahasil.tahasil_name.ilike(fields_data["tahasil"])
        )
        tah_res = await db.execute(tah_stmt)
        tah_obj = tah_res.scalars().first()
        if tah_obj:
            fields_data["tahasil"] = tah_obj.tahasil_name
            admin_match_info["tahasil_code"] = tah_obj.tahasil_code
            confidence_scores["tahasil"] = max(confidence_scores.get("tahasil", 0.0), 0.96)

    # Check cadastral parcel availability in PostGIS
    cadastral_found = False
    if fields_data.get("plot_number"):
        cad_stmt = select(CadastralParcel).where(
            CadastralParcel.plot_number == fields_data["plot_number"]
        )
        if fields_data.get("khata_number"):
            cad_stmt = cad_stmt.where(CadastralParcel.khata_number == fields_data["khata_number"])
        
        cad_res = await db.execute(cad_stmt)
        cad_obj = cad_res.scalars().first()
        if cad_obj:
            cadastral_found = True
            confidence_scores["cadastral_plot_verified"] = 1.0

    # Persist document metadata and extracted payload in PostgreSQL
    doc_record = PattaDocument(
        id=doc_id,
        farmer_id=current_farmer.id,
        original_filename=file.filename,
        file_path=destination_path,
        file_size_bytes=file_size,
        mime_type=file.content_type or "application/octet-stream",
        document_type="ODISHA_PATTA_ROR",
        status=DocumentProcessingStatus.COMPLETED.value,
        extracted_fields=fields_data,
        confidence_scores=confidence_scores,
        overall_confidence=overall_conf,
        raw_ocr_text=raw_text[:4000] if raw_text else None,
        is_verified=False,
    )
    db.add(doc_record)
    await db.commit()
    await db.refresh(doc_record)

    details = ExtractedLandDetails(**fields_data)

    return PattaExtractionResponse(
        success=True,
        document_id=doc_id,
        filename=file.filename,
        file_size_bytes=file_size,
        mime_type=file.content_type or "application/octet-stream",
        status=DocumentProcessingStatus.COMPLETED.value,
        extracted_fields=details,
        confidence_scores=confidence_scores,
        overall_confidence=overall_conf,
        matched_administrative_record=admin_match_info if admin_match_info else None,
        cadastral_polygon_found=cadastral_found,
        message="Odisha Patta / ROR successfully extracted with AI OCR and administrative verification."
    )


@router.get("/patta", response_model=List[PattaDocumentSummaryResponse])
async def list_farmer_patta_documents(
    current_farmer: User = Depends(require_role(UserRole.FARMER)),
    db: AsyncSession = Depends(get_db),
):
    """
    Lists all Patta / ROR documents uploaded by the authenticated farmer.
    Strictly isolated to current farmer's records.
    """
    stmt = (
        select(PattaDocument)
        .where(PattaDocument.farmer_id == current_farmer.id)
        .order_by(PattaDocument.created_at.desc())
    )
    res = await db.execute(stmt)
    docs = res.scalars().all()

    return [
        PattaDocumentSummaryResponse(
            id=d.id,
            filename=d.original_filename,
            file_size_bytes=d.file_size_bytes,
            mime_type=d.mime_type,
            status=d.status,
            created_at=d.created_at.isoformat(),
            overall_confidence=d.overall_confidence,
            extracted_fields=d.extracted_fields,
            confidence_scores=d.confidence_scores,
            is_verified=d.is_verified,
            applied_to_parcel_id=d.applied_to_parcel_id,
        )
        for d in docs
    ]


@router.post("/patta/{document_id}/confirm")
async def confirm_and_link_patta(
    document_id: uuid.UUID,
    payload: PattaConfirmRequest,
    current_farmer: User = Depends(require_role(UserRole.FARMER)),
    db: AsyncSession = Depends(get_db),
):
    """
    Marks extracted document as reviewed and verified by farmer,
    and optionally links to registered FarmerParcel.
    """
    stmt = select(PattaDocument).where(
        PattaDocument.id == document_id,
        PattaDocument.farmer_id == current_farmer.id
    )
    res = await db.execute(stmt)
    doc = res.scalars().first()

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or access denied."
        )

    doc.is_verified = True
    if payload.applied_parcel_id:
        doc.applied_to_parcel_id = payload.applied_parcel_id
    if payload.verified_fields:
        doc.extracted_fields = payload.verified_fields

    await db.commit()
    return {"success": True, "message": "Patta document verified and linked successfully."}

