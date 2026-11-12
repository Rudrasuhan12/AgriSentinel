import asyncio
from sqlalchemy import select, or_
from app.database import AsyncSessionLocal, engine, Base
from app.models.user import User, UserRole, AccountStatus
from app.models.farmer_profile import FarmerProfile
from app.models.official_request import OfficialAccessRequest, ApprovalStatus
from app.core.security import hash_password
from app.config import settings

async def seed_all_personas():
    async with AsyncSessionLocal() as db:
        print("[SEED] Inspecting users...")
        res = await db.execute(select(User))
        users = list(res.scalars())
        print(f"[SEED] Found {len(users)} existing users:")
        for u in users:
            print(f"  - {u.email} | {u.mobile_number} | {u.role}")

        # 1. Admin Persona
        res_admin = await db.execute(
            select(User).where(or_(User.email == "admin@agrisentinel.local", User.role == UserRole.ADMIN))
        )
        admin = res_admin.scalar_one_or_none()
        if admin:
            admin.email = "admin@agrisentinel.local"
            admin.mobile_number = "9000000001"
            admin.password_hash = hash_password("AdminSecurePass@2026")
            admin.role = UserRole.ADMIN
            admin.account_status = AccountStatus.APPROVED
            admin.is_email_verified = True
            admin.is_mobile_verified = True
            print("[SEED] Admin persona synchronized: admin@agrisentinel.local (mobile: 9000000001)")
        else:
            admin = User(
                email="admin@agrisentinel.local",
                mobile_number="9000000001",
                password_hash=hash_password("AdminSecurePass@2026"),
                role=UserRole.ADMIN,
                account_status=AccountStatus.APPROVED,
                is_email_verified=True,
                is_mobile_verified=True,
            )
            db.add(admin)
            print("[SEED] Admin persona created: admin@agrisentinel.local")

        # 2. Farmer Persona
        res_farmer = await db.execute(
            select(User).where(or_(User.email == "farmer@agrisentinel.local", User.mobile_number == "9000000002"))
        )
        farmer = res_farmer.scalar_one_or_none()
        if farmer:
            farmer.email = "farmer@agrisentinel.local"
            farmer.mobile_number = "9000000002"
            farmer.password_hash = hash_password("FarmerPass@2026")
            farmer.role = UserRole.FARMER
            farmer.account_status = AccountStatus.APPROVED
            farmer.is_email_verified = True
            farmer.is_mobile_verified = True
            print("[SEED] Farmer persona synchronized: farmer@agrisentinel.local (mobile: 9000000002)")
        else:
            farmer = User(
                email="farmer@agrisentinel.local",
                mobile_number="9000000002",
                password_hash=hash_password("FarmerPass@2026"),
                role=UserRole.FARMER,
                account_status=AccountStatus.APPROVED,
                is_email_verified=True,
                is_mobile_verified=True,
            )
            db.add(farmer)
            await db.flush()

            profile = FarmerProfile(
                user_id=farmer.id,
                full_name="Ramesh Chandra Sahoo",
                preferred_language="Odia",
                state="Odisha",
                district="Cuttack",
                sub_district="Baranga",
                village="Mundali",
                gram_panchayat="Mundali GP",
                pin_code="754005",
                primary_crop="Paddy (Swarna Sub-1)",
                land_ownership_type="Owner",
                approximate_land_area=4.8,
                farming_category="Medium Farmer",
                number_of_fields=3,
            )
            db.add(profile)
            print("[SEED] Farmer persona created: farmer@agrisentinel.local")

        # 3. Government Official Persona
        res_official = await db.execute(
            select(User).where(or_(User.email == "official@agrisentinel.local", User.mobile_number == "9000000003"))
        )
        official = res_official.scalar_one_or_none()
        if official:
            official.email = "official@agrisentinel.local"
            official.mobile_number = "9000000003"
            official.password_hash = hash_password("OfficialPass@2026")
            official.role = UserRole.GOVERNMENT_OFFICIAL
            official.account_status = AccountStatus.APPROVED
            official.is_email_verified = True
            official.is_mobile_verified = True
            print("[SEED] Official persona synchronized: official@agrisentinel.local (mobile: 9000000003)")
        else:
            official = User(
                email="official@agrisentinel.local",
                mobile_number="9000000003",
                password_hash=hash_password("OfficialPass@2026"),
                role=UserRole.GOVERNMENT_OFFICIAL,
                account_status=AccountStatus.APPROVED,
                is_email_verified=True,
                is_mobile_verified=True,
            )
            db.add(official)
            await db.flush()

            req = OfficialAccessRequest(
                user_id=official.id,
                department="Department of Agriculture & Farmers' Empowerment",
                organization="Government of Odisha",
                designation="District Agricultural Officer (DAO)",
                employee_id="OD-AGRI-4091",
                requested_state="Odisha",
                requested_district="Cuttack",
                reason="District-wide UAV cadastral monitoring and paddy yield assessment.",
                approval_status=ApprovalStatus.APPROVED,
            )
            db.add(req)
            print("[SEED] Official persona created: official@agrisentinel.local")

        await db.commit()
        print("[SEED] All 3 personas successfully seeded and committed to PostGIS database!")

if __name__ == "__main__":
    asyncio.run(seed_all_personas())

