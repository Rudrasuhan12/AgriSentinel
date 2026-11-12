import time
import uuid
import pytest
import pytest_asyncio
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.config import settings
from app.database import Base, get_db
from app.core.bootstrap import bootstrap_initial_admin

test_engine = create_async_engine(settings.DATABASE_URL, poolclass=NullPool)
TestSessionLocal = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with TestSessionLocal() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with TestSessionLocal() as session:
        await bootstrap_initial_admin(session)
    yield
    await test_engine.dispose()


@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_farmer_registration_and_login():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Unique mobile and email for test run
        uid = str(int(time.time() * 1000))[-7:]
        mobile = f"943{uid}"
        farmer_payload = {
            "full_name": "Babula Mohanty",
            "mobile_number": mobile,
            "email": f"babula_{uid}@example.com",
            "password": "FarmerPassword@123",
            "preferred_language": "Odia",
            "state": "Odisha",
            "district": "Cuttack",
            "sub_district": "Salepur",
            "village": "Bhatapatana",
            "pin_code": "754202",
            "primary_crop": "Paddy (Swarna)",
            "land_ownership_type": "Owner",
            "approximate_land_area": 2.5,
            "farming_category": "Small",
            "number_of_fields": 2,
            "consent_terms": True,
            "consent_privacy": True,
            "consent_field_data": True,
        }

        resp = await client.post("/api/auth/register/farmer", json=farmer_payload)
        assert resp.status_code == 201
        data = resp.json()
        assert data["role"] == "FARMER"
        assert data["account_status"] == "APPROVED"
        assert "access_token" in data
        assert "refresh_token" in data

        # Duplicate mobile rejection
        dup_resp = await client.post("/api/auth/register/farmer", json=farmer_payload)
        assert dup_resp.status_code == 409
        assert "already exists" in dup_resp.json()["detail"]

        # Login with mobile
        login_resp = await client.post(
            "/api/auth/login",
            json={"identifier": mobile, "password": "FarmerPassword@123"}
        )
        assert login_resp.status_code == 200
        tokens = login_resp.json()
        assert tokens["role"] == "FARMER"
        assert tokens["account_status"] == "APPROVED"

        # Access /api/auth/me
        me_resp = await client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {tokens['access_token']}"}
        )
        assert me_resp.status_code == 200
        me_data = me_resp.json()
        assert me_data["role"] == "FARMER"
        assert me_data["display_name"] == "Babula Mohanty"
        assert me_data["profile"]["district"] == "Cuttack"


@pytest.mark.asyncio
async def test_official_request_and_admin_approval():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        uid = uuid.uuid4().hex[:6]
        email = f"officer_{uid}@odisha.gov.in"
        official_payload = {
            "full_name": "Dr. Subhashree Dash",
            "official_email": email,
            "mobile_number": f"986{str(int(time.time()))[-7:]}",
            "password": "OfficialSecurePass@2026",
            "department": "Department of Agriculture & Farmers' Empowerment",
            "organization": "Govt of Odisha",
            "designation": "District Agricultural Officer (DAO)",
            "employee_id": f"OR-AGRI-{uid.upper()}",
            "requested_state": "Odisha",
            "requested_district": "Puri",
            "reason": "Requires UAV-based paddy heap volumetric verification for district post-harvest auditing.",
        }

        req_resp = await client.post("/api/auth/register/official-request", json=official_payload)
        assert req_resp.status_code in [201, 409]

        # Login while PENDING -> Must be 403 Forbidden!
        login_fail = await client.post(
            "/api/auth/login",
            json={"identifier": email, "password": "OfficialSecurePass@2026"}
        )
        assert login_fail.status_code == 403
        assert "pending administrative review" in login_fail.json()["detail"].lower()

        # Admin login
        admin_login = await client.post(
            "/api/auth/login",
            json={"identifier": settings.INITIAL_ADMIN_EMAIL, "password": settings.INITIAL_ADMIN_PASSWORD}
        )
        assert admin_login.status_code == 200
        admin_token = admin_login.json()["access_token"]

        # Admin lists requests
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        list_resp = await client.get("/api/admin/official-requests", headers=admin_headers)
        assert list_resp.status_code == 200
        requests_list = list_resp.json()
        target_req = next(r for r in requests_list if r["official_email"] == email)
        req_id = target_req["id"]

        # Admin approves
        approve_resp = await client.post(f"/api/admin/official-requests/{req_id}/approve", headers=admin_headers)
        assert approve_resp.status_code == 200
        assert approve_resp.json()["status"] == "APPROVED"

        # Now Official can log in successfully!
        official_login = await client.post(
            "/api/auth/login",
            json={"identifier": email, "password": "OfficialSecurePass@2026"}
        )
        assert official_login.status_code == 200
        official_data = official_login.json()
        assert official_data["role"] == "GOVERNMENT_OFFICIAL"
        assert official_data["account_status"] == "APPROVED"


@pytest.mark.asyncio
async def test_refresh_token_and_logout():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Admin login
        login_resp = await client.post(
            "/api/auth/login",
            json={"identifier": settings.INITIAL_ADMIN_EMAIL, "password": settings.INITIAL_ADMIN_PASSWORD}
        )
        tokens = login_resp.json()
        refresh_token = tokens["refresh_token"]

        # Rotate refresh token
        ref_resp = await client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
        assert ref_resp.status_code == 200
        new_tokens = ref_resp.json()
        assert new_tokens["access_token"] != tokens["access_token"]
        assert new_tokens["refresh_token"] != refresh_token

        # Old refresh token is revoked
        old_ref_resp = await client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
        assert old_ref_resp.status_code == 401
