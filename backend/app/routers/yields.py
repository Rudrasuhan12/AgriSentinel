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
        issuing_authority="District Agriculture Office (DAO), Cuttack",
        authorized_signatory="Odisha Remote Sensing & Agriculture Sentinel System",
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


@router.get("")
async def list_yield_estimates(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all issued yield certificates and estimates for the authenticated farmer."""
    stmt = (
        select(YieldCertificate)
        .where(YieldCertificate.farmer_id == current_user.id)
        .options(selectinload(YieldCertificate.parcel))
        .order_by(desc(YieldCertificate.issue_date))
    )
    res = await db.execute(stmt)
    certs = res.scalars().all()

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
