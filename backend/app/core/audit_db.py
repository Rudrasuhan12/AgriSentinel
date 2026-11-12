import asyncio
from sqlalchemy import text
from app.database import AsyncSessionLocal

async def audit():
    async with AsyncSessionLocal() as db:
        res = await db.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"))
        tables = [r[0] for r in res.fetchall()]
        print(f"=== Public Tables ({len(tables)}) ===")
        for t in tables:
            count_res = await db.execute(text(f"SELECT count(*) FROM \"{t}\""))
            count = count_res.scalar()
            print(f"  • {t}: {count} rows")

if __name__ == "__main__":
    asyncio.run(audit())

