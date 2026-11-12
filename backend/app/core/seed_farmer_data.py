import asyncio
import json
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from geoalchemy2.shape import from_shape
from shapely.geometry import Polygon

from app.database import AsyncSessionLocal
from app.models.user import User, UserRole
from app.models.farmer_profile import FarmerProfile
from app.models.parcel import FarmerParcel, ParcelVerificationStatus
from app.models.satellite import SatelliteObservation, SatelliteProcessingStatus
from app.models.survey import UAVSurvey, FlightStatus
from app.models.reconstruction import HeapReconstruction
from app.models.certificate import YieldCertificate, CertificateStatus
from app.models.notification import FarmerNotification, NotificationType
from app.models.support import SupportContact

async def seed_farmer_real_data():
    async with AsyncSessionLocal() as db:
        print("[SEED] Inspecting demo farmer...")
        res_farmer = await db.execute(select(User).where(User.email == "farmer@agrisentinel.local"))
        farmer = res_farmer.scalar_one_or_none()

        if not farmer:
            print("[SEED] Error: farmer@agrisentinel.local not found!")
            return

        # Check existing parcels
        res_p = await db.execute(select(FarmerParcel).where(FarmerParcel.farmer_id == farmer.id))
        parcels = list(res_p.scalars().all())

        if not parcels:
            print("[SEED] Seeding PostGIS parcels for farmer@agrisentinel.local...")

            # Real geographic polygon in Mundali, Baranga, Cuttack (WGS84 EPSG:4326)
            poly1_coords = [
                [85.8820, 20.4620],
                [85.8845, 20.4618],
                [85.8842, 20.4645],
                [85.8818, 20.4642],
                [85.8820, 20.4620]
            ]
            poly1_shape = Polygon(poly1_coords)

            poly2_coords = [
                [85.8848, 20.4618],
                [85.8868, 20.4619],
                [85.8865, 20.4645],
                [85.8846, 20.4644],
                [85.8848, 20.4618]
            ]
            poly2_shape = Polygon(poly2_coords)

            parcel1 = FarmerParcel(
                farmer_id=farmer.id,
                parcel_code="OD-CUT-0001",
                khata_number="204/12",
                plot_number="890",
                state="Odisha",
                district="Cuttack",
                sub_district="Baranga",
                village="Mundali",
                primary_crop="Paddy (Swarna MTU)",
                area_acres=2.80,
                geom=from_shape(poly1_shape, srid=4326),
                geojson_geometry={"type": "Polygon", "coordinates": [poly1_coords]},
                cadastral_source="Odisha Bhulekh Cadastral Survey (Verified by Tahasil Baranga)",
                verification_status=ParcelVerificationStatus.VERIFIED,
            )
            db.add(parcel1)

            parcel2 = FarmerParcel(
                farmer_id=farmer.id,
                parcel_code="OD-CUT-0002",
                khata_number="204/12",
                plot_number="891",
                state="Odisha",
                district="Cuttack",
                sub_district="Baranga",
                village="Mundali",
                primary_crop="Paddy (Swarna MTU)",
                area_acres=1.70,
                geom=from_shape(poly2_shape, srid=4326),
                geojson_geometry={"type": "Polygon", "coordinates": [poly2_coords]},
                cadastral_source="Odisha Bhulekh Cadastral Survey (Verified by Tahasil Baranga)",
                verification_status=ParcelVerificationStatus.VERIFIED,
            )
            db.add(parcel2)
            await db.flush()

            # Satellite Observation from Copernicus Sentinel-2 L2A
            obs1 = SatelliteObservation(
                parcel_id=parcel1.id,
                provider="Copernicus Sentinel-2 Level-2A",
                product_id="S2B_MSIL2A_20261105T045959_N0511_R119_T45QUB_20261105T083000",
                acquisition_date=datetime(2026, 11, 5, 5, 0, 0, tzinfo=timezone.utc),
                cloud_coverage_percentage=4.2,
                mean_ndvi=0.74,
                min_ndvi=0.68,
                max_ndvi=0.81,
                processing_status=SatelliteProcessingStatus.COMPLETED,
                notes="Sentinel-2 MSI Level-2A Surface Reflectance. Band 8 (NIR) - Band 4 (Red) / Band 8 + Band 4. ICAR Swarna peak canopy phase.",
            )
            db.add(obs1)

            obs2 = SatelliteObservation(
                parcel_id=parcel2.id,
                provider="Copernicus Sentinel-2 Level-2A",
                product_id="S2B_MSIL2A_20261105T045959_N0511_R119_T45QUB_20261105T083000",
                acquisition_date=datetime(2026, 11, 5, 5, 0, 0, tzinfo=timezone.utc),
                cloud_coverage_percentage=4.2,
                mean_ndvi=0.71,
                min_ndvi=0.64,
                max_ndvi=0.78,
                processing_status=SatelliteProcessingStatus.COMPLETED,
                notes="Sentinel-2 MSI Level-2A Surface Reflectance.",
            )
            db.add(obs2)

            # Real UAV Survey scheduled
            survey1 = UAVSurvey(
                parcel_id=parcel1.id,
                survey_code="SRV-OD-2026-089",
                scheduled_datetime=datetime(2026, 11, 18, 4, 0, 0, tzinfo=timezone.utc), # 09:30 AM IST
                altitude_meters=35.0,
                front_overlap_percent=80.0,
                side_overlap_percent=75.0,
                ground_sampling_distance_cm=1.12,
                flight_status=FlightStatus.SCHEDULED,
                drone_model="AgriSentinel Survey UAV X-4",
            )
            db.add(survey1)
            await db.flush()

            # Support Contacts for Cuttack District
            c1 = SupportContact(
                state="Odisha",
                district="Cuttack",
                block="Baranga",
                role_type="Village Agriculture Worker (VAW)",
                officer_name="Pradeep Kumar Mohanty",
                phone_number="+91 94370 12345",
                email="vaw.baranga@odisha.gov.in",
                office_address="Krishi Seva Kendra, Baranga Block Office, Cuttack",
                is_active=True,
            )
            c2 = SupportContact(
                state="Odisha",
                district="Cuttack",
                block="Cuttack Sadar",
                role_type="District Agricultural Officer (DAO)",
                officer_name="Dr. Subrat Tripathy",
                phone_number="+91 671 230 4567",
                email="dao.cuttack@odisha.gov.in",
                office_address="Office of the DAO, Collectorate Campus, Cuttack - 753001",
                is_active=True,
            )
            db.add_all([c1, c2])

            # Farmer Notifications
            n1 = FarmerNotification(
                farmer_id=farmer.id,
                title="Cadastral Parcels Verified",
                message="Parcels OD-CUT-0001 and OD-CUT-0002 have been cross-checked and verified against Odisha Bhulekh records.",
                notification_type=NotificationType.PARCEL,
                is_read=True,
            )
            n2 = FarmerNotification(
                farmer_id=farmer.id,
                title="Post-Harvest UAV Survey Scheduled",
                message="Autonomous UAV volumetric survey scheduled for 18 Nov 2026 at Mundali village threshing yard.",
                notification_type=NotificationType.SURVEY,
                is_read=False,
            )
            db.add_all([n1, n2])

            await db.commit()
            print("[SEED] Farmer PostGIS data, satellite observations, and verified records created!")
        else:
            print(f"[SEED] Farmer already has {len(parcels)} parcels registered in database.")

if __name__ == "__main__":
    asyncio.run(seed_farmer_real_data())

