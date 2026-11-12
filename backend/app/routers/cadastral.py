import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.cadastral import (
    CadastralLookupRequest,
    CadastralLookupResponse,
    CadastralParcelResponse,
    SurroundingParcelItem,
    CadastralHierarchyResponse,
    DistrictItem,
    TahasilItem,
)

router = APIRouter(prefix="/api/cadastral", tags=["Cadastral Geospatial Intelligence"])


ADMINISTRATIVE_HIERARCHY = {
    "state": "Odisha",
    "districts": [
        {
            "name": "Cuttack",
            "code": "CUT",
            "tahasils": [
                {
                    "name": "Baranga",
                    "code": "BRG",
                    "villages": ["Mundali", "Naraj", "Madhupatna", "Ramdaspur", "Trisulia"]
                },
                {
                    "name": "Cuttack Sadar",
                    "code": "CSD",
                    "villages": ["Choudwar", "Jagatpur", "Bidyadharpur", "Telengapentha"]
                },
                {
                    "name": "Athagarh",
                    "code": "ATG",
                    "villages": ["Radhanagar", "Dorada", "Gobindapur"]
                },
                {
                    "name": "Salipur",
                    "code": "SLP",
                    "villages": ["Machhagan", "Balichandrapur"]
                }
            ]
        },
        {
            "name": "Khordha",
            "code": "KHD",
            "tahasils": [
                {
                    "name": "Bhubaneswar",
                    "code": "BBS",
                    "villages": ["Patia", "Chandaka", "Jatni", "Mendhasal"]
                },
                {
                    "name": "Balianta",
                    "code": "BLT",
                    "villages": ["Bhingarpur", "Pratapsasan"]
                }
            ]
        },
        {
            "name": "Puri",
            "code": "PRI",
            "tahasils": [
                {
                    "name": "Pipili",
                    "code": "PPL",
                    "villages": ["Dandamukundapur", "Teisipur"]
                },
                {
                    "name": "Nimapada",
                    "code": "NMP",
                    "villages": ["Alanda", "Bhaunri"]
                }
            ]
        },
        {
            "name": "Balasore",
            "code": "BLS",
            "tahasils": [
                {
                    "name": "Remuna",
                    "code": "REM",
                    "villages": ["Mandarpur", "Patripal"]
                }
            ]
        }
    ]
}


@router.get("/hierarchy", response_model=CadastralHierarchyResponse)
async def get_administrative_hierarchy():
    """
    Returns verified administrative hierarchy: State -> District -> Tahasil -> Village.
    Powers dependent dropdowns in the cadastral demarcation interface.
    """
    return ADMINISTRATIVE_HIERARCHY


@router.post("/lookup", response_model=CadastralLookupResponse)
async def lookup_cadastral_parcel(
    payload: CadastralLookupRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Cadastral Land Record Spatial Lookup:
    Queries PostGIS cadastral_parcels using administrative hierarchy, Khata, and Plot numbers.
    Returns authentic spatial polygon geometry, bounding box, calculated geodesic area, and surrounding plots.
    """
    district = payload.district.strip()
    tahasil = payload.tahasil.strip()
    village = payload.village.strip()
    khata = payload.khata_number.strip()
    plot = payload.plot_number.strip()

    if not district or not tahasil or not village or not plot:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="District, Tahasil, Village, and Plot number are mandatory for cadastral lookup."
        )

    # Search PostGIS cadastral_parcels
    query = text("""
        SELECT 
            id, state_code, district_name, tahasil_name, village_name,
            khata_number, plot_number, recorded_area_acres,
            ROUND(CAST(ST_Area(geom::geography) * 0.000247105 AS numeric), 2) as calc_area_acres,
            ST_AsGeoJSON(geom) as geom_json,
            ST_XMin(geom) as min_lon,
            ST_YMin(geom) as min_lat,
            ST_XMax(geom) as max_lon,
            ST_YMax(geom) as max_lat,
            source, source_reference, verification_status
        FROM cadastral_parcels
        WHERE district_name ILIKE :district
          AND tahasil_name ILIKE :tahasil
          AND village_name ILIKE :village
          AND (plot_number ILIKE :plot OR plot_number = :plot)
    """)

    result = await db.execute(query, {
        "district": district,
        "tahasil": tahasil,
        "village": village,
        "plot": plot
    })
    rows = result.fetchall()

    if not rows:
        # Flexible fallback matching across mouza variations or matching by plot & khata
        fallback_query = text("""
            SELECT 
                id, state_code, district_name, tahasil_name, village_name,
                khata_number, plot_number, recorded_area_acres,
                ROUND(CAST(ST_Area(geom::geography) * 0.000247105 AS numeric), 2) as calc_area_acres,
                ST_AsGeoJSON(geom) as geom_json,
                ST_XMin(geom) as min_lon,
                ST_YMin(geom) as min_lat,
                ST_XMax(geom) as max_lon,
                ST_YMax(geom) as max_lat,
                source, source_reference, verification_status
            FROM cadastral_parcels
            WHERE district_name ILIKE :district
              AND (plot_number ILIKE :plot OR plot_number = :plot)
              AND (:village ILIKE '%' || village_name || '%' OR village_name ILIKE '%' || :village || '%' OR khata_number = :khata)
        """)
        fb_result = await db.execute(fallback_query, {
            "district": district,
            "plot": plot,
            "village": village,
            "khata": khata
        })
        rows = fb_result.fetchall()

    if not rows:
        return CadastralLookupResponse(
            success=False,
            message="No cadastral polygon found for the supplied land-record details. You can manually digitize your field boundary or submit it for cadastral data verification.",
            fallback_allowed=True
        )

    # If multiple plots with same plot number exist, filter by khata
    matched_row = None
    if len(rows) > 1:
        exact_matches = [r for r in rows if r.khata_number.strip().lower() == khata.lower()]
        if len(exact_matches) == 1:
            matched_row = exact_matches[0]
        else:
            candidates = [
                {
                    "khata_number": r.khata_number,
                    "plot_number": r.plot_number,
                    "recorded_area_acres": float(r.recorded_area_acres),
                    "village": r.village_name
                }
                for r in rows
            ]
            return CadastralLookupResponse(
                success=False,
                multiple_matches=True,
                matches=candidates,
                message=f"Multiple cadastral plots found matching plot {plot}. Please specify the exact Khata number.",
                fallback_allowed=True
            )
    else:
        matched_row = rows[0]

    # Parse GeoJSON geometry
    geom_dict = json.loads(matched_row.geom_json)
    bbox = [
        float(matched_row.min_lon),
        float(matched_row.min_lat),
        float(matched_row.max_lon),
        float(matched_row.max_lat),
    ]

    # Fetch surrounding parcels in same village for contextual map rendering
    surrounding_query = text("""
        SELECT plot_number, khata_number, recorded_area_acres, ST_AsGeoJSON(geom) as geom_json
        FROM cadastral_parcels
        WHERE district_name ILIKE :district
          AND tahasil_name ILIKE :tahasil
          AND village_name ILIKE :village
          AND id != :matched_id
        LIMIT 10
    """)
    surr_res = await db.execute(surrounding_query, {
        "district": district,
        "tahasil": tahasil,
        "village": village,
        "matched_id": matched_row.id
    })
    surrounding_rows = surr_res.fetchall()
    surrounding_parcels = [
        SurroundingParcelItem(
            plot_number=s.plot_number,
            khata_number=s.khata_number,
            recorded_area_acres=float(s.recorded_area_acres),
            geometry=json.loads(s.geom_json)
        )
        for s in surrounding_rows
    ]

    parcel_data = CadastralParcelResponse(
        id=str(matched_row.id),
        khata_number=matched_row.khata_number,
        plot_number=matched_row.plot_number,
        state=matched_row.state_code,
        district=matched_row.district_name,
        tahasil=matched_row.tahasil_name,
        village=matched_row.village_name,
        recorded_area_acres=float(matched_row.recorded_area_acres),
        calculated_area_acres=float(matched_row.calc_area_acres),
        geometry=geom_dict,
        bbox=bbox,
        source=matched_row.source,
        source_reference=matched_row.source_reference,
        verification_status=matched_row.verification_status,
    )

    return CadastralLookupResponse(
        success=True,
        parcel=parcel_data,
        surrounding_parcels=surrounding_parcels,
        message=f"Cadastral plot #{matched_row.plot_number} successfully resolved from official cadastral survey records."
    )

