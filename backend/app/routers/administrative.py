from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.administrative import (
    AdministrativeDistrict,
    AdministrativeTahasil,
    AdministrativeVillage,
)
from app.schemas.administrative import (
    DistrictItemResponse,
    TahasilItemResponse,
    VillageItemResponse,
    AdministrativeHierarchySummary,
)

router = APIRouter(prefix="/api/administrative", tags=["Administrative Master Data"])


@router.get("/districts", response_model=List[DistrictItemResponse])
async def list_odisha_districts(
    db: AsyncSession = Depends(get_db),
):
    """
    Returns complete official Odisha Districts (30) from Local Government Directory (LGD).
    """
    stmt = select(AdministrativeDistrict).order_by(AdministrativeDistrict.district_name.asc())
    result = await db.execute(stmt)
    districts = result.scalars().all()
    return [
        DistrictItemResponse(
            id=str(d.id),
            state_code=d.state_code,
            district_name=d.district_name,
            district_code=d.district_code,
            lgd_code=d.lgd_code,
            headquarters=d.headquarters,
        )
        for d in districts
    ]


@router.get("/tahasils", response_model=List[TahasilItemResponse])
async def list_tahasils_for_district(
    district: Optional[str] = Query(None, description="District name, e.g. Cuttack"),
    district_code: Optional[str] = Query(None, description="District code, e.g. CUT"),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns verified Tahasils / Sub-districts for selected District.
    """
    stmt = select(AdministrativeTahasil)
    if district:
        stmt = stmt.where(AdministrativeTahasil.district_name.ilike(district.strip()))
    elif district_code:
        stmt = stmt.join(AdministrativeDistrict).where(
            AdministrativeDistrict.district_code.ilike(district_code.strip())
        )
    stmt = stmt.order_by(AdministrativeTahasil.tahasil_name.asc())
    result = await db.execute(stmt)
    tahasils = result.scalars().all()
    return [
        TahasilItemResponse(
            id=str(t.id),
            district_name=t.district_name,
            tahasil_name=t.tahasil_name,
            tahasil_code=t.tahasil_code,
            lgd_code=t.lgd_code,
        )
        for t in tahasils
    ]


@router.get("/villages", response_model=List[VillageItemResponse])
async def list_villages_for_tahasil(
    tahasil: Optional[str] = Query(None, description="Tahasil name, e.g. Baranga"),
    district: Optional[str] = Query(None, description="District name, e.g. Cuttack"),
    search: Optional[str] = Query(None, description="Search mouza/village by name prefix"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns revenue mouzas / villages under selected Tahasil with search and pagination support.
    """
    stmt = select(AdministrativeVillage)
    if tahasil:
        stmt = stmt.where(AdministrativeVillage.tahasil_name.ilike(tahasil.strip()))
    if district:
        stmt = stmt.where(AdministrativeVillage.district_name.ilike(district.strip()))
    if search and search.strip():
        term = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(
                AdministrativeVillage.village_name.ilike(term),
                AdministrativeVillage.mouza_code.ilike(term),
            )
        )
    stmt = stmt.order_by(AdministrativeVillage.village_name.asc()).offset(offset).limit(limit)
    result = await db.execute(stmt)
    villages = result.scalars().all()
    return [
        VillageItemResponse(
            id=str(v.id),
            district_name=v.district_name,
            tahasil_name=v.tahasil_name,
            village_name=v.village_name,
            mouza_code=v.mouza_code,
            revenue_circle=v.revenue_circle,
            ri_circle=v.ri_circle,
        )
        for v in villages
    ]
