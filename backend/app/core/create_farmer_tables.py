import asyncio
from app.database import engine, Base
import app.models # Ensures all models are registered with Base.metadata

async def create_tables():
    print("[POSTGIS] Creating new farmer portal tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[POSTGIS] Tables created successfully!")

if __name__ == "__main__":
    asyncio.run(create_tables())
