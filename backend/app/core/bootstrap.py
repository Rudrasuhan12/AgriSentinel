import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal, engine, Base
from app.models.user import User, UserRole, AccountStatus
from app.core.security import hash_password
from app.config import settings


async def init_db_tables():
    """Create all tables in PostgreSQL if not already present."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal, engine, Base
from app.models.user import User, UserRole, AccountStatus
from app.models.farmer_profile import FarmerProfile
from app.models.official_request import OfficialAccessRequest, ApprovalStatus
from app.core.security import hash_password
from app.config import settings


async def init_db_tables():
    """Create all tables in PostgreSQL if not already present."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


from app.core.seed_personas import seed_all_personas

async def bootstrap_initial_admin(db: AsyncSession | None = None) -> bool:
    """Bootstrap initial admin user and demo personas."""
    await seed_all_personas()
    return True


if __name__ == "__main__":
    async def main():
        await init_db_tables()
        await bootstrap_initial_admin()

    asyncio.run(main())

