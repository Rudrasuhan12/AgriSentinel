from __future__ import annotations
import uuid
import enum
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional, List
from sqlalchemy import String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

if TYPE_CHECKING:
    from app.models.farmer_profile import FarmerProfile
    from app.models.official_request import OfficialAccessRequest
    from app.models.session import UserSession
    from app.models.consent import ConsentRecord


class UserRole(str, enum.Enum):
    FARMER = "FARMER"
    GOVERNMENT_OFFICIAL = "GOVERNMENT_OFFICIAL"
    ADMIN = "ADMIN"


class AccountStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    SUSPENDED = "SUSPENDED"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True, index=True)
    mobile_number: Mapped[Optional[str]] = mapped_column(String(20), unique=True, nullable=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role_enum"), nullable=False, default=UserRole.FARMER, index=True
    )
    account_status: Mapped[AccountStatus] = mapped_column(
        Enum(AccountStatus, name="account_status_enum"),
        nullable=False,
        default=AccountStatus.APPROVED,
        index=True
    )
    is_mobile_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    farmer_profile: Mapped[Optional[FarmerProfile]] = relationship(
        "FarmerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    official_request: Mapped[Optional[OfficialAccessRequest]] = relationship(
        "OfficialAccessRequest",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
        foreign_keys="OfficialAccessRequest.user_id"
    )
    sessions: Mapped[List[UserSession]] = relationship(
        "UserSession", back_populates="user", cascade="all, delete-orphan"
    )
    consent_records: Mapped[List[ConsentRecord]] = relationship(
        "ConsentRecord", back_populates="user", cascade="all, delete-orphan"
    )
