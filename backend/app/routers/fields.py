import uuid
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from geoalchemy2.shape import to_shape, from_shape
from shapely.geometry import shape, mapping, Polygon

from app.database import get_db
from app.models.user import User, UserRole
from app.models.parcel import FarmerParcel, ParcelVerificationStatus
from app.schemas.farmer import ParcelCreateRequest, ParcelResponse
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/fields", tags=["Field Parcel Management"])


def _calculate_geodesic_acres(geom_dict: Dict[str, Any]) -> float:
    """Calculate geodesic area in acres from GeoJSON coordinates."""
    try:
        geom = shape(geom_dict)
        # Approximate planar to geodesic conversion for Odisha (lat ~ 20 deg N)
        # 1 deg lat ~ 110.7 km, 1 deg lon ~ 104.6 km
        # Area in sq deg -> sq meters -> acres
        coords = list(geom.exterior.coords) if hasattr(geom, 'exterior') else []
        if len(coords) < 3:
            return 0.0
        # Shoelace formula on projected coordinates (meters)
        m_coords = [(lon * 104600.0, lat * 110700.0) for lon, lat in coords]
        area_m2 = 0.5 * abs(sum(m_coords[i][0] * m_coords[i+1][1] - m_coords[i+1][0] * m_coords[i][1] for i in range(len(m_coords)-1)))
        return round(area_m2 / 4046.8564224, 3)
    except Exception:
        return 0.0


@router.get("", response_model=List[ParcelResponse])
async def list_fields(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all registered fields/parcels for the authenticated user."""
    stmt = (
        select(FarmerParcel)
        .where(FarmerParcel.farmer_id == current_user.id)
        .order_by(desc(FarmerParcel.created_at))
    )
    result = await db.execute(stmt)
    parcels = result.scalars().all()

    responses = []
    for p in parcels:
        geom_dict = p.geojson_geometry
        if not geom_dict and p.geometry is not None:
            try:
                geom_dict = mapping(to_shape(p.geometry))
            except Exception:
                geom_dict = None

        responses.append(
            ParcelResponse(
                id=str(p.id),
                parcel_code=p.parcel_code,
                khata_number=p.khata_number,
                plot_number=p.plot_number,
                state=p.state,
                district=p.district,
                sub_district=p.sub_district,
                village=p.village,
                primary_crop=p.primary_crop,
                area_acres=round(p.area_acres, 2),
                recorded_area_acres=round(p.recorded_area_acres, 2) if p.recorded_area_acres else None,
                calculated_area_acres=round(p.calculated_area_acres, 2) if p.calculated_area_acres else None,
                farmer_entered_area=round(p.farmer_entered_area, 2) if p.farmer_entered_area else None,
                cadastral_reference=p.cadastral_reference,
                geojson_geometry=geom_dict,
                cadastral_source=p.cadastral_source,
                verification_status=p.verification_status.value,
                created_at=p.created_at.isoformat(),
            )
        )
    return responses


@router.post("", response_model=ParcelResponse, status_code=status.HTTP_201_CREATED)
async def create_field(
    req: ParcelCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Register a new field/parcel with PostGIS geometry."""
    calc_acres = None
    geom_wkb = None
    geom_dict = req.geojson_geometry

    if geom_dict:
        try:
            poly_shape = shape(geom_dict)
            if not poly_shape.is_valid:
                poly_shape = poly_shape.buffer(0)
            geom_wkb = from_shape(poly_shape, srid=4326)
            calc_acres = _calculate_geodesic_acres(geom_dict)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid GeoJSON geometry: {str(e)}")

    effective_area = calc_acres if (calc_acres and calc_acres > 0) else req.area_acres
    parcel_code = f"FLD-OD-{uuid.uuid4().hex[:6].upper()}"

    parcel = FarmerParcel(
        farmer_id=current_user.id,
        parcel_code=parcel_code,
        khata_number=req.khata_number,
        plot_number=req.plot_number,
        state=req.state,
        district=req.district,
        sub_district=req.sub_district,
        village=req.village,
        primary_crop=req.primary_crop,
        area_acres=effective_area,
        recorded_area_acres=req.area_acres,
        calculated_area_acres=calc_acres,
        farmer_entered_area=req.area_acres,
        geojson_geometry=geom_dict,
        geometry=geom_wkb,
        cadastral_source=req.cadastral_source or "Farmer Delineated GPS/GIS",
        verification_status=ParcelVerificationStatus.VERIFIED if calc_acres else ParcelVerificationStatus.PENDING,
    )

    db.add(parcel)
    await db.commit()
    await db.refresh(parcel)

    return ParcelResponse(
        id=str(parcel.id),
        parcel_code=parcel.parcel_code,
        khata_number=parcel.khata_number,
        plot_number=parcel.plot_number,
        state=parcel.state,
        district=parcel.district,
        sub_district=parcel.sub_district,
        village=parcel.village,
        primary_crop=parcel.primary_crop,
        area_acres=round(parcel.area_acres, 2),
        recorded_area_acres=round(parcel.recorded_area_acres, 2) if parcel.recorded_area_acres else None,
        calculated_area_acres=round(parcel.calculated_area_acres, 2) if parcel.calculated_area_acres else None,
        farmer_entered_area=round(parcel.farmer_entered_area, 2) if parcel.farmer_entered_area else None,
        geojson_geometry=parcel.geojson_geometry,
        cadastral_source=parcel.cadastral_source,
        verification_status=parcel.verification_status.value,
        created_at=parcel.created_at.isoformat(),
    )


@router.get("/{field_id}", response_model=ParcelResponse)
async def get_field(
    field_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve field by ID."""
    stmt = select(FarmerParcel).where(
        FarmerParcel.id == field_id,
        FarmerParcel.farmer_id == current_user.id
    )
    result = await db.execute(stmt)
    parcel = result.scalar_one_or_none()

    if not parcel:
        raise HTTPException(status_code=404, detail="Field parcel not found or access denied.")

    geom_dict = parcel.geojson_geometry
    if not geom_dict and parcel.geometry is not None:
        try:
            geom_dict = mapping(to_shape(parcel.geometry))
        except Exception:
            geom_dict = None

    return ParcelResponse(
        id=str(parcel.id),
        parcel_code=parcel.parcel_code,
        khata_number=parcel.khata_number,
        plot_number=parcel.plot_number,
        state=parcel.state,
        district=parcel.district,
        sub_district=parcel.sub_district,
        village=parcel.village,
        primary_crop=parcel.primary_crop,
        area_acres=round(parcel.area_acres, 2),
        recorded_area_acres=round(parcel.recorded_area_acres, 2) if parcel.recorded_area_acres else None,
        calculated_area_acres=round(parcel.calculated_area_acres, 2) if parcel.calculated_area_acres else None,
        farmer_entered_area=round(parcel.farmer_entered_area, 2) if parcel.farmer_entered_area else None,
        geojson_geometry=geom_dict,
        cadastral_source=parcel.cadastral_source,
        verification_status=parcel.verification_status.value,
        created_at=parcel.created_at.isoformat(),
    )


@router.put("/{field_id}", response_model=ParcelResponse)
async def update_field(
    field_id: uuid.UUID,
    req: ParcelCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update field details and geometry."""
    stmt = select(FarmerParcel).where(
        FarmerParcel.id == field_id,
        FarmerParcel.farmer_id == current_user.id
    )
    result = await db.execute(stmt)
    parcel = result.scalar_one_or_none()

    if not parcel:
        raise HTTPException(status_code=404, detail="Field parcel not found or access denied.")

    parcel.khata_number = req.khata_number
    parcel.plot_number = req.plot_number
    parcel.district = req.district
    parcel.sub_district = req.sub_district
    parcel.village = req.village
    parcel.primary_crop = req.primary_crop

    if req.geojson_geometry:
        try:
            poly_shape = shape(req.geojson_geometry)
            if not poly_shape.is_valid:
                poly_shape = poly_shape.buffer(0)
            parcel.geometry = from_shape(poly_shape, srid=4326)
            parcel.geojson_geometry = req.geojson_geometry
            calc_acres = _calculate_geodesic_acres(req.geojson_geometry)
            parcel.calculated_area_acres = calc_acres
            parcel.area_acres = calc_acres if calc_acres > 0 else req.area_acres
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid GeoJSON: {str(e)}")
    else:
        parcel.area_acres = req.area_acres

    await db.commit()
    await db.refresh(parcel)

    return ParcelResponse(
        id=str(parcel.id),
        parcel_code=parcel.parcel_code,
        khata_number=parcel.khata_number,
        plot_number=parcel.plot_number,
        state=parcel.state,
        district=parcel.district,
        sub_district=parcel.sub_district,
        village=parcel.village,
        primary_crop=parcel.primary_crop,
        area_acres=round(parcel.area_acres, 2),
        recorded_area_acres=round(parcel.recorded_area_acres, 2) if parcel.recorded_area_acres else None,
        calculated_area_acres=round(parcel.calculated_area_acres, 2) if parcel.calculated_area_acres else None,
        farmer_entered_area=round(parcel.farmer_entered_area, 2) if parcel.farmer_entered_area else None,
        geojson_geometry=parcel.geojson_geometry,
        cadastral_source=parcel.cadastral_source,
        verification_status=parcel.verification_status.value,
        created_at=parcel.created_at.isoformat(),
    )


@router.delete("/{field_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_field(
    field_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a registered field parcel."""
    stmt = select(FarmerParcel).where(
        FarmerParcel.id == field_id,
        FarmerParcel.farmer_id == current_user.id
    )
    result = await db.execute(stmt)
    parcel = result.scalar_one_or_none()

    if not parcel:
        raise HTTPException(status_code=404, detail="Field parcel not found or access denied.")

    await db.delete(parcel)
    await db.commit()
    return None

