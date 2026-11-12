from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    # Project Identity
    PROJECT_NAME: str = "AgriSentinel API"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"

    # Database
    POSTGRES_DB: str = "agrisentinel_db"
    POSTGRES_USER: str = "agrisentinel_user"
    POSTGRES_PASSWORD: str = "agrisentinel_dev_secret_change_me"
    POSTGRES_PORT: int = 5436
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://agrisentinel_user:agrisentinel_dev_secret_change_me@127.0.0.1:5436/agrisentinel_db"
    )

    # JWT Authentication & Tokens
    JWT_SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14

    # Initial Administrator Bootstrap (Development Only)
    INITIAL_ADMIN_EMAIL: str = "admin@agrisentinel.local"
    INITIAL_ADMIN_MOBILE: str = "9876543210"
    INITIAL_ADMIN_PASSWORD: str = "AdminSecurePass@2026"

    # Server & Networking
    BACKEND_HOST: str = "127.0.0.1"
    BACKEND_PORT: int = 8000
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000"
    ]

    # Mock OTP / SMS Provider Mode
    MOCK_OTP_MODE: bool = True
    MOCK_OTP_CODE: str = "123456"

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
