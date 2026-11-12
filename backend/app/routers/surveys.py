import uuid
import os
import cv2
import numpy as np
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User
from app.models.parcel import FarmerParcel
from app.models.survey import UAVSurvey, FlightStatus, SurveyImage, ImageSourceType
from app.schemas.farmer import UAVSurveyResponse
from app.core.dependencies import get_current_user
from app.config import settings

router = APIRouter(tags=["UAV Surveys & Imagery"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_SURVEY_DIR = os.path.join(BASE_DIR, "uploads", "surveys")
os.makedirs(UPLOAD_SURVEY_DIR, exist_ok=True)


def _validate_image_quality(file_bytes: bytes) -> tuple[int, int, float, bool, str]:
    """
    Validate image:
    1. Decode image
    2. Check resolution >= 300x300
    3. Measure Laplacian variance (blur detection threshold >= 25.0)
    """
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return 0, 0, 0.0, False, "Corrupted or unsupported image file format."

    h, w = img.shape[:2]
    if h < 300 or w < 300:
        return w, h, 0.0, False, f"Resolution {w}x{h} px is below minimum threshold (300x300 px)."

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    is_valid = blur_score >= 25.0
    reason = "Image meets quality criteria" if is_valid else f"Image is blurry (Laplacian variance {blur_score:.1f} < 25.0)."

    return w, h, blur_score, is_valid, reason


@router.get("/api/surveys", response_model=List[UAVSurveyResponse])
async def list_surveys(
    parcel_id: Optional[uuid.UUID] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List UAV surveys for the authenticated farmer, optionally filtered by parcel."""
    stmt = (
        select(UAVSurvey)
        .join(FarmerParcel, UAVSurvey.parcel_id == FarmerParcel.id)
        .where(FarmerParcel.farmer_id == current_user.id)
        .options(selectinload(UAVSurvey.parcel))
        .order_by(desc(UAVSurvey.scheduled_datetime))
    )
    if parcel_id:
        stmt = stmt.where(UAVSurvey.parcel_id == parcel_id)

    result = await db.execute(stmt)
    surveys = result.scalars().all()

    return [
        UAVSurveyResponse(
            id=str(s.id),
            survey_code=s.survey_code,
            parcel_id=str(s.parcel_id),
            parcel_code=s.parcel.parcel_code if s.parcel else "UNKNOWN",
            scheduled_datetime=s.scheduled_datetime.isoformat(),
            actual_flight_datetime=s.actual_flight_datetime.isoformat() if s.actual_flight_datetime else None,
            altitude_meters=s.altitude_meters,
            front_overlap_percent=s.front_overlap_percent,
            side_overlap_percent=s.side_overlap_percent,
            ground_sampling_distance_cm=s.ground_sampling_distance_cm,
            flight_status=s.flight_status.value,
            drone_model=s.drone_model,
        )
        for s in surveys
    ]


@router.post("/api/surveys", response_model=UAVSurveyResponse, status_code=status.HTTP_201_CREATED)
async def create_survey(
    parcel_id: uuid.UUID,
    scheduled_datetime: Optional[datetime] = None,
    drone_model: str = "AgriSentinel Survey UAV X-4",
    altitude_meters: float = 35.0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Schedule or record a new UAV survey mission."""
    stmt = select(FarmerParcel).where(
        FarmerParcel.id == parcel_id,
        FarmerParcel.farmer_id == current_user.id
    )
    res = await db.execute(stmt)
    parcel = res.scalar_one_or_none()
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found or unauthorized.")

    flight_time = scheduled_datetime or datetime.now(timezone.utc)
    survey_code = f"SRV-OD-{uuid.uuid4().hex[:6].upper()}"

    survey = UAVSurvey(
        parcel_id=parcel_id,
        survey_code=survey_code,
        scheduled_datetime=flight_time,
        actual_flight_datetime=flight_time,
        altitude_meters=altitude_meters,
        front_overlap_percent=80.0,
        side_overlap_percent=75.0,
        ground_sampling_distance_cm=1.12,
        flight_status=FlightStatus.COMPLETED,
        drone_model=drone_model,
        pilot_in_command="Field UAV Pilot, Cuttack Unit"
    )
    db.add(survey)
    await db.commit()
    await db.refresh(survey)

    return UAVSurveyResponse(
        id=str(survey.id),
        survey_code=survey.survey_code,
        parcel_id=str(survey.parcel_id),
        parcel_code=parcel.parcel_code,
        scheduled_datetime=survey.scheduled_datetime.isoformat(),
        actual_flight_datetime=survey.actual_flight_datetime.isoformat() if survey.actual_flight_datetime else None,
        altitude_meters=survey.altitude_meters,
        front_overlap_percent=survey.front_overlap_percent,
        side_overlap_percent=survey.side_overlap_percent,
        ground_sampling_distance_cm=survey.ground_sampling_distance_cm,
        flight_status=survey.flight_status.value,
        drone_model=survey.drone_model,
    )


@router.get("/api/surveys/{survey_id}", response_model=UAVSurveyResponse)
async def get_survey(
    survey_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get single survey details."""
    stmt = (
        select(UAVSurvey)
        .join(FarmerParcel, UAVSurvey.parcel_id == FarmerParcel.id)
        .where(UAVSurvey.id == survey_id, FarmerParcel.farmer_id == current_user.id)
        .options(selectinload(UAVSurvey.parcel))
    )
    res = await db.execute(stmt)
    survey = res.scalar_one_or_none()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found.")

    return UAVSurveyResponse(
        id=str(survey.id),
        survey_code=survey.survey_code,
        parcel_id=str(survey.parcel_id),
        parcel_code=survey.parcel.parcel_code if survey.parcel else "UNKNOWN",
        scheduled_datetime=survey.scheduled_datetime.isoformat(),
        actual_flight_datetime=survey.actual_flight_datetime.isoformat() if survey.actual_flight_datetime else None,
        altitude_meters=survey.altitude_meters,
        front_overlap_percent=survey.front_overlap_percent,
        side_overlap_percent=survey.side_overlap_percent,
        ground_sampling_distance_cm=survey.ground_sampling_distance_cm,
        flight_status=survey.flight_status.value,
        drone_model=survey.drone_model,
    )


@router.post("/api/images/upload", status_code=status.HTTP_201_CREATED)
async def upload_survey_images(
    survey_id: uuid.UUID = Form(...),
    source_type: ImageSourceType = Form(ImageSourceType.USER_UPLOADED),
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload imagery for a UAV survey mission.
    Validates resolution (>= 300x300), format, and blur score (Laplacian var >= 25.0).
    Tags with origin: Public dataset, User uploaded, UAV captured, or Demonstration sample.
    """
    stmt = (
        select(UAVSurvey)
        .join(FarmerParcel, UAVSurvey.parcel_id == FarmerParcel.id)
        .where(UAVSurvey.id == survey_id, FarmerParcel.farmer_id == current_user.id)
    )
    res = await db.execute(stmt)
    survey = res.scalar_one_or_none()
    if not survey:
        raise HTTPException(status_code=404, detail="UAV Survey not found or unauthorized.")

    survey_target_dir = os.path.join(UPLOAD_SURVEY_DIR, str(survey_id))
    os.makedirs(survey_target_dir, exist_ok=True)

    results = []
    saved_entities = []

    for f in files:
        contents = await f.read()
        w, h, blur_score, is_valid, msg = _validate_image_quality(contents)

        safe_name = f"{uuid.uuid4().hex[:8]}_{f.filename.replace(' ', '_')}"
        file_path = os.path.join(survey_target_dir, safe_name)
        with open(file_path, "wb") as out_file:
            out_file.write(contents)

        file_url = f"/uploads/surveys/{survey_id}/{safe_name}"

        img_record = SurveyImage(
            survey_id=survey_id,
            filename=f.filename,
            file_path=file_path,
            file_url=file_url,
            source_type=source_type,
            resolution_width=float(w),
            resolution_height=float(h),
            blur_score=blur_score,
            is_valid=is_valid,
            file_size_bytes=float(len(contents))
        )
        db.add(img_record)
        saved_entities.append(img_record)

        results.append({
            "filename": f.filename,
            "width": w,
            "height": h,
            "blur_score": round(blur_score, 2),
            "is_valid": is_valid,
            "validation_message": msg,
            "source_type": source_type.value,
            "url": file_url
        })

    await db.commit()

    return {
        "survey_id": str(survey_id),
        "total_uploaded": len(files),
        "valid_images": sum(1 for r in results if r["is_valid"]),
        "images": results
    }


@router.get("/api/surveys/{survey_id}/images")
async def list_survey_images(
    survey_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List images for a specific survey mission."""
    stmt = (
        select(SurveyImage)
        .join(UAVSurvey, SurveyImage.survey_id == UAVSurvey.id)
        .join(FarmerParcel, UAVSurvey.parcel_id == FarmerParcel.id)
        .where(SurveyImage.survey_id == survey_id, FarmerParcel.farmer_id == current_user.id)
        .order_by(SurveyImage.created_at)
    )
    res = await db.execute(stmt)
    images = res.scalars().all()

    return [
        {
            "id": str(img.id),
            "filename": img.filename,
            "file_url": img.file_url,
            "source_type": img.source_type.value,
            "width": int(img.resolution_width),
            "height": int(img.resolution_height),
            "blur_score": round(img.blur_score, 2),
            "is_valid": img.is_valid,
            "created_at": img.created_at.isoformat()
        }
        for img in images
    ]
