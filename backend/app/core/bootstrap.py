import asyncio
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal, engine, Base
from app.models.user import User, UserRole, AccountStatus
from app.models.farmer_profile import FarmerProfile
from app.models.official_request import OfficialAccessRequest, ApprovalStatus
from app.core.security import hash_password
from app.core.seed_personas import seed_all_personas
from app.config import settings


async def init_db_tables():
    """Create PostGIS extension and all database tables in PostgreSQL if not already present."""
    async with engine.begin() as conn:
        try:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
        except Exception as e:
            print(f"[BOOTSTRAP] Notice on postgis extension verification: {e}")
        await conn.run_sync(Base.metadata.create_all)


async def bootstrap_initial_admin(db: AsyncSession | None = None) -> bool:
    """Bootstrap initial admin user and demo personas."""
    await seed_all_personas()
    return True


if __name__ == "__main__":
    async def main():
        await init_db_tables()
        await bootstrap_initial_admin()

    asyncio.run(main())
