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


async def bootstrap_initial_admin(db: AsyncSession | None = None) -> bool:
    """Bootstrap initial admin user if none exists."""
    close_session = False
    if db is None:
        db = AsyncSessionLocal()
        close_session = True

    try:
        query = select(User).where(User.role == UserRole.ADMIN)
        result = await db.execute(query)
        admin = result.scalar_one_or_none()

        if admin is None:
            new_admin = User(
                email=settings.INITIAL_ADMIN_EMAIL,
                mobile_number=settings.INITIAL_ADMIN_MOBILE,
                password_hash=hash_password(settings.INITIAL_ADMIN_PASSWORD),
                role=UserRole.ADMIN,
                account_status=AccountStatus.APPROVED,
                is_email_verified=True,
                is_mobile_verified=True,
            )
            db.add(new_admin)
            await db.commit()
            print(f"[BOOTSTRAP] Initial administrator created: {settings.INITIAL_ADMIN_EMAIL}")
            return True
        else:
            return False
    finally:
        if close_session:
            await db.close()


if __name__ == "__main__":
    async def main():
        await init_db_tables()
        await bootstrap_initial_admin()

    asyncio.run(main())
