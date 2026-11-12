from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.core.bootstrap import init_db_tables, bootstrap_initial_admin
from app.routers.auth import router as auth_router
from app.routers.admin import router as admin_router
from app.routers.farmer import router as farmer_router
from app.routers.cadastral import router as cadastral_router
from app.routers.administrative import router as administrative_router
from app.routers.document import router as document_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and admin is initialized
    print(f"[{settings.PROJECT_NAME}] Starting up with PostgreSQL on {settings.DATABASE_URL.split('@')[-1]}")
    try:
        await init_db_tables()
        await bootstrap_initial_admin()
        print(f"[{settings.PROJECT_NAME}] Database tables and admin bootstrap verified.")
    except Exception as e:
        print(f"[{settings.PROJECT_NAME}] Error during database startup initialization: {e}")
    
    yield
    print(f"[{settings.PROJECT_NAME}] Shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AgriSentinel UAV Agricultural Field Assessment & Yield Analytics API",
    lifespan=lifespan,
)

# Secure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(farmer_router)
app.include_router(cadastral_router)
app.include_router(administrative_router)
app.include_router(document_router)


@app.get("", tags=["Root"], include_in_schema=False)
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "AgriSentinel API Backend is online and operational",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "healthy",
        "documentation": {
            "swagger_ui": "/docs",
            "redoc": "/redoc"
        },
        "endpoints": {
            "health": "/health",
            "auth": "/api/auth",
            "admin": "/api/admin",
            "farmer": "/api/farmer",
            "cadastral": "/api/cadastral",
        }
    }


@app.get("/health", tags=["System Health"])
@app.get("/api/health", tags=["System Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }

