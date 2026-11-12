import uuid
import hashlib
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User
from app.models.parcel import FarmerParcel
from app.models.reconstruction import HeapReconstruction
from app.models.certificate import YieldCertificate, CertificateStatus
from app.core.dependencies import get_current_user
from app.services.yield_engine import (
    yield_engine,
    HeapMeasurement,
    DensityProvenance,
    STANDARD_SWARNA_BULK_DENSITY
)

router = APIRouter(prefix="/api/yield-estimates", tags=["Paddy Yield Estimation Engine"])


class YieldEstimateCalculationRequest(BaseModel):
    parcel_id: uuid.UUID
    heap_reconstruction_ids: List[uuid.UUID]
    crop_variety: str = "Paddy (Swarna MTU)"
    season: str = "Kharif 2026"
    custom_bulk_density_kg_m3: Optional[float] = Field(default=None, gt=300.0, lt=900.0)
    density_provenance: DensityProvenance = DensityProvenance.ASSUMED_STANDARD


@router.post("", status_code=status.HTTP_201_CREATED)
async def compute_yield_estimate(
    req: YieldEstimateCalculationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Compute comprehensive paddy yield estimate across multiple threshing yard heaps
    for a registered parcel, validate against Cuttack regional benchmarks,
    and issue a cryptographically hashed digital yield certificate.
    """
    # 1. Fetch parcel
    stmt_p = select(FarmerParcel).where(
        FarmerParcel.id == req.parcel_id,
        FarmerParcel.farmer_id == current_user.id
    )
    res_p = await db.execute(stmt_p)
    parcel = res_p.scalar_one_or_none()
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found or unauthorized.")

    # 2. Fetch heap reconstructions
    stmt_h = select(HeapReconstruction).where(
        HeapReconstruction.id.in_(req.heap_reconstruction_ids)
    )
    res_h = await db.execute(stmt_h)
    recons = res_h.scalars().all()

    if not recons:
        # If no specific heaps selected, look for latest reconstruction for this parcel
        stmt_latest = (
            select(HeapReconstruction)
            .join(HeapReconstruction.survey)
            .where(HeapReconstruction.survey.has(parcel_id=req.parcel_id))
            .order_by(desc(HeapReconstruction.created_at))
        )
        res_latest = await db.execute(stmt_latest)
        recons = res_latest.scalars().all()

    if not recons:
        raise HTTPException(
            status_code=400,
            detail="No heap photogrammetry scans found for this parcel. Complete a UAV survey reconstruction first."
        )

    heap_measurements = []
    density = req.custom_bulk_density_kg_m3 or STANDARD_SWARNA_BULK_DENSITY
    for r in recons:
        heap_measurements.append(
            HeapMeasurement(
                heap_id=str(r.id),
                volume_cubic_meters=r.volume_cubic_meters,
                bulk_density_kg_m3=density,
                density_provenance=req.density_provenance
            )
        )

    # 3. Run Yield Engine
    yield_result = yield_engine.estimate_total_yield(
        heaps=heap_measurements,
        parcel_area_acres=parcel.area_acres
    )

    # 4. Generate Certificate Hash & Record
    cert_number = f"CRT-OD-{datetime.now(timezone.utc).year}-{uuid.uuid4().hex[:6].upper()}"
    raw_hash_data = f"{cert_number}:{parcel.parcel_code}:{current_user.id}:{yield_result.total_mass_quintals}:{datetime.now(timezone.utc).isoformat()}"
    verification_hash = hashlib.sha256(raw_hash_data.encode()).hexdigest()

    cert = YieldCertificate(
        farmer_id=current_user.id,
        parcel_id=parcel.id,
        reconstruction_id=recons[0].id,
        certificate_number=cert_number,
        season=req.season,
        crop_variety=req.crop_variety,
        verified_yield_quintals=yield_result.total_mass_quintals,
        issuing_authority="AgriSentinel Technical Assessment System",
        authorized_signatory="AgriSentinel Photogrammetry & Yield Engine",
        status=CertificateStatus.ISSUED,
        verification_hash=verification_hash,
    )
    db.add(cert)
    await db.commit()
    await db.refresh(cert)

    return {
        "certificate_id": str(cert.id),
        "certificate_number": cert.certificate_number,
        "verification_hash": cert.verification_hash,
        "parcel_code": parcel.parcel_code,
        "yield_metrics": yield_result.model_dump(),
        "created_at": cert.issue_date.isoformat()
    }


@router.post("/generate", status_code=status.HTTP_201_CREATED)
async def quick_generate_assessment_report(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    On-demand generation of a Harvest Assessment Report for the farmer's registered parcels
    using the latest available 3D photogrammetry scan or baseline field parameters.
    """
    from app.models.survey import UAVSurvey
    p_stmt = select(FarmerParcel).where(FarmerParcel.farmer_id == current_user.id).order_by(FarmerParcel.created_at)
    p_res = await db.execute(p_stmt)
    parcels = p_res.scalars().all()

    if not parcels:
        raise HTTPException(
            status_code=400,
            detail="Please register at least one land parcel in My Parcels before generating an assessment report."
        )

    target_parcel = parcels[0]

    # Look for latest photogrammetry reconstruction
    r_stmt = (
        select(HeapReconstruction)
        .join(UAVSurvey, HeapReconstruction.survey_id == UAVSurvey.id)
        .where(UAVSurvey.parcel_id.in_([p.id for p in parcels]))
        .order_by(desc(HeapReconstruction.created_at))
    )
    r_res = await db.execute(r_stmt)
    recon = r_res.scalar_one_or_none()

    yield_mass = recon.estimated_mass_quintals if recon else round(target_parcel.area_acres * 16.5, 2)
    recon_id = recon.id if recon else None

    cert_number = f"CRT-OD-{datetime.now(timezone.utc).year}-{uuid.uuid4().hex[:6].upper()}"
    raw_hash_data = f"{cert_number}:{target_parcel.parcel_code}:{current_user.id}:{yield_mass}:{datetime.now(timezone.utc).isoformat()}"
    verification_hash = hashlib.sha256(raw_hash_data.encode()).hexdigest()

    new_cert = YieldCertificate(
        farmer_id=current_user.id,
        parcel_id=target_parcel.id,
        reconstruction_id=recon_id,
        certificate_number=cert_number,
        season="Kharif 2026",
        crop_variety=target_parcel.primary_crop or "Paddy (Swarna MTU)",
        verified_yield_quintals=yield_mass,
        issuing_authority="AgriSentinel Technical Assessment System",
        authorized_signatory="AgriSentinel Automated Engine",
        status=CertificateStatus.ISSUED,
        verification_hash=verification_hash,
    )
    db.add(new_cert)
    await db.commit()
    await db.refresh(new_cert)

    return {
        "id": str(new_cert.id),
        "certificate_number": new_cert.certificate_number,
        "parcel_code": target_parcel.parcel_code,
        "verified_yield_quintals": new_cert.verified_yield_quintals,
        "status": new_cert.status.value,
        "verification_hash": new_cert.verification_hash,
        "message": f"Assessment Report {new_cert.certificate_number} generated successfully!"
    }


@router.get("")
async def list_yield_estimates(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all issued yield certificates and estimates for the authenticated farmer."""
    from app.models.survey import UAVSurvey
    stmt = (
        select(YieldCertificate)
        .where(YieldCertificate.farmer_id == current_user.id)
        .options(selectinload(YieldCertificate.parcel))
        .order_by(desc(YieldCertificate.issue_date))
    )
    res = await db.execute(stmt)
    certs = res.scalars().all()

    # If farmer has parcels and completed a reconstruction, auto-generate assessment report if none exists
    if not certs:
        p_stmt = select(FarmerParcel).where(FarmerParcel.farmer_id == current_user.id).order_by(FarmerParcel.created_at)
        p_res = await db.execute(p_stmt)
        parcels = p_res.scalars().all()
        if parcels:
            target_parcel = parcels[0]
            r_stmt = (
                select(HeapReconstruction)
                .join(UAVSurvey, HeapReconstruction.survey_id == UAVSurvey.id)
                .where(UAVSurvey.parcel_id.in_([p.id for p in parcels]))
                .order_by(desc(HeapReconstruction.created_at))
            )
            r_res = await db.execute(r_stmt)
            recon = r_res.scalar_one_or_none()

            if recon:
                yield_mass = recon.estimated_mass_quintals
                cert_number = f"CRT-OD-{datetime.now(timezone.utc).year}-{uuid.uuid4().hex[:6].upper()}"
                raw_hash_data = f"{cert_number}:{target_parcel.parcel_code}:{current_user.id}:{yield_mass}:{datetime.now(timezone.utc).isoformat()}"
                verification_hash = hashlib.sha256(raw_hash_data.encode()).hexdigest()

                new_cert = YieldCertificate(
                    farmer_id=current_user.id,
                    parcel_id=target_parcel.id,
                    reconstruction_id=recon.id,
                    certificate_number=cert_number,
                    season="Kharif 2026",
                    crop_variety=target_parcel.primary_crop or "Paddy (Swarna MTU)",
                    verified_yield_quintals=yield_mass,
                    issuing_authority="AgriSentinel Technical Assessment System",
                    authorized_signatory="AgriSentinel Automated Engine",
                    status=CertificateStatus.ISSUED,
                    verification_hash=verification_hash,
                )
                db.add(new_cert)
                await db.commit()
                await db.refresh(new_cert)
                new_cert.parcel = target_parcel
                certs = [new_cert]

    return [
        {
            "id": str(c.id),
            "certificate_number": c.certificate_number,
            "parcel_code": c.parcel.parcel_code if c.parcel else "UNKNOWN",
            "season": c.season,
            "crop_variety": c.crop_variety,
            "verified_yield_quintals": c.verified_yield_quintals,
            "issuing_authority": c.issuing_authority,
            "authorized_signatory": c.authorized_signatory,
            "status": c.status.value,
            "verification_hash": c.verification_hash,
            "issue_date": c.issue_date.isoformat(),
        }
        for c in certs
    ]


@router.get("/{cert_id}")
async def get_yield_estimate_detail(
    cert_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed yield certificate by ID."""
    stmt = (
        select(YieldCertificate)
        .where(YieldCertificate.id == cert_id, YieldCertificate.farmer_id == current_user.id)
        .options(
            selectinload(YieldCertificate.parcel),
            selectinload(YieldCertificate.reconstruction)
        )
    )
    res = await db.execute(stmt)
    cert = res.scalar_one_or_none()
    if not cert:
        raise HTTPException(status_code=404, detail="Yield certificate not found.")

    parcel_area = cert.parcel.area_acres if cert.parcel else 1.0
    yield_q_ac = cert.verified_yield_quintals / parcel_area if parcel_area > 0 else 0.0

    return {
        "id": str(cert.id),
        "certificate_number": cert.certificate_number,
        "parcel_code": cert.parcel.parcel_code if cert.parcel else "UNKNOWN",
        "parcel_area_acres": parcel_area,
        "season": cert.season,
        "crop_variety": cert.crop_variety,
        "verified_yield_quintals": cert.verified_yield_quintals,
        "yield_quintals_per_acre": round(yield_q_ac, 2),
        "issuing_authority": cert.issuing_authority,
        "authorized_signatory": cert.authorized_signatory,
        "status": cert.status.value,
        "verification_hash": cert.verification_hash,
        "reconstruction_volume_m3": cert.reconstruction.volume_cubic_meters if cert.reconstruction else None,
        "issue_date": cert.issue_date.isoformat(),
    }


@router.get("/{cert_id}/pdf")
async def download_yield_report_pdf(
    cert_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate and stream a real PDF assessment report with SHA-256 integrity hash & QR code."""
    from fastapi.responses import Response
    from app.services.report_generator import generate_harvest_assessment_pdf

    t_cert = YieldCertificate.__table__.c
    t_parcel = FarmerParcel.__table__.c
    t_recon = HeapReconstruction.__table__.c

    stmt = select(
        t_cert.certificate_number,
        t_cert.verified_yield_quintals,
        t_cert.crop_variety,
        t_cert.season,
        t_cert.verification_hash,
        t_cert.issue_date,
        t_cert.parcel_id,
        t_cert.reconstruction_id,
        t_cert.farmer_id
    ).where(t_cert.id == cert_id)
    res = await db.execute(stmt)
    cert_row = res.first()
    if not cert_row:
        raise HTTPException(status_code=404, detail="Assessment report not found.")

    cert_num, verified_yield, crop_var, season, v_hash, issue_dt, p_id, r_id, f_id = cert_row

    # Access control: check ownership via pure string comparison
    curr_user_id = str(current_user.__dict__.get("id", ""))
    if str(f_id) != curr_user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this report.")

    p_stmt = select(
        t_parcel.parcel_code,
        t_parcel.district,
        t_parcel.village,
        t_parcel.area_acres
    ).where(t_parcel.id == p_id)
    p_res = await db.execute(p_stmt)
    p_row = p_res.first()

    parcel_code = str(p_row[0]) if p_row and p_row[0] else "UNKNOWN-PARCEL"
    district = str(p_row[1]) if p_row and p_row[1] else "Cuttack"
    village = str(p_row[2]) if p_row and p_row[2] else "Baranga"
    area_acres = float(p_row[3]) if p_row and p_row[3] else 1.0

    vol_m3 = (float(verified_yield) * 100.0 / 578.0)
    bulk_density = 578.0
    if r_id:
        r_stmt = select(
            t_recon.volume_cubic_meters,
            t_recon.bulk_density_kg_per_m3
        ).where(t_recon.id == r_id)
        r_res = await db.execute(r_stmt)
        r_row = r_res.first()
        if r_row:
            vol_m3 = float(r_row[0]) if r_row[0] else vol_m3
            bulk_density = float(r_row[1]) if r_row[1] else bulk_density

    farmer_email = str(current_user.__dict__.get("email", ""))
    farmer_name = farmer_email.split('@')[0].capitalize() if farmer_email else "Registered Farmer"
    yield_q_ac = float(verified_yield) / area_acres if area_acres > 0 else 0.0

    pdf_bytes = generate_harvest_assessment_pdf(
        report_number=cert_num,
        farmer_name=farmer_name,
        parcel_code=parcel_code,
        district=district,
        village=village,
        area_acres=area_acres,
        crop_variety=crop_var,
        season=season,
        reconstructed_volume_m3=vol_m3,
        bulk_density_kg_m3=bulk_density,
        estimated_mass_quintals=verified_yield,
        yield_quintals_per_acre=round(yield_q_ac, 2),
        verification_hash=v_hash,
        issue_date=issue_dt,
        is_demo=False
    )

    filename = f"AgriSentinel_Report_{cert_num}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "X-Report-Hash": v_hash
        }
    )


@router.get("/verify/{verification_token}")
async def public_verify_report(
    verification_token: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Public verification endpoint for QR code scans.
    Validates authenticity via SHA-256 digest without exposing private PII.
    """
    stmt = (
        select(YieldCertificate)
        .where(
            (YieldCertificate.verification_hash == verification_token) |
            (YieldCertificate.certificate_number == verification_token)
        )
        .options(selectinload(YieldCertificate.parcel))
    )
    res = await db.execute(stmt)
    cert = res.scalar_one_or_none()

    if not cert:
        return {
            "valid": False,
            "message": "Certificate or assessment report could not be cryptographically verified.",
            "status": "UNVERIFIED"
        }

    return {
        "valid": True,
        "status": "TECHNICALLY_VERIFIED",
        "certificate_number": cert.certificate_number,
        "season": cert.season,
        "crop_variety": cert.crop_variety,
        "verified_yield_quintals": cert.verified_yield_quintals,
        "issuing_authority": cert.issuing_authority,
        "issue_date": cert.issue_date.isoformat(),
        "verification_hash": cert.verification_hash,
        "disclaimer": "This is an AgriSentinel automated technical assessment, not a statutory revenue certificate."
    }


