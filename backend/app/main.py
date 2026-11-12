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
from app.routers.fields import router as fields_router
from app.routers.surveys import router as surveys_router
from app.routers.processing import router as processing_router
from app.routers.heaps import router as heaps_router
from app.routers.yields import router as yields_router


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

# Secure CORS Middleware allowing localhost and any Vercel/Render deployed domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|.*\.vercel\.app|.*\.onrender\.com)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers with standard /api prefix
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(farmer_router)
app.include_router(cadastral_router)
app.include_router(administrative_router)
app.include_router(document_router)
app.include_router(fields_router)
app.include_router(surveys_router)
app.include_router(processing_router)
app.include_router(heaps_router)
app.include_router(yields_router)

# Mount alias for /auth routes directly so both /api/auth/* and /auth/* are served
from fastapi import APIRouter
auth_alias = APIRouter(prefix="/auth", tags=["Auth Aliases"])
for route in auth_router.routes:
    if hasattr(route, "endpoint") and hasattr(route, "methods"):
        alias_path = route.path.replace("/api/auth", "")
        auth_alias.add_api_route(
            alias_path,
            route.endpoint,
            methods=route.methods,
            response_model=getattr(route, "response_model", None),
            status_code=getattr(route, "status_code", 200),
            include_in_schema=False
        )
app.include_router(auth_alias)


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

