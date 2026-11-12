from __future__ import annotations
import uuid
import enum
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional, List
from sqlalchemy import String, Float, DateTime, Enum, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.satellite import SatelliteObservation
    from app.models.survey import UAVSurvey
    from app.models.certificate import YieldCertificate


class ParcelVerificationStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"


class FarmerParcel(Base):
    __tablename__ = "farmer_parcels"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    farmer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    parcel_code: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    khata_number: Mapped[str] = mapped_column(String(100), nullable=False)
    plot_number: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), default="Odisha")
    district: Mapped[str] = mapped_column(String(100), nullable=False)
    sub_district: Mapped[str] = mapped_column(String(100), nullable=False) # Tehsil / Block
    village: Mapped[str] = mapped_column(String(100), nullable=False)
    primary_crop: Mapped[str] = mapped_column(String(150), default="Paddy (Swarna MTU)")
    area_acres: Mapped[float] = mapped_column(Float, default=0.0)
    recorded_area_acres: Mapped[float | None] = mapped_column(Float, nullable=True) # Official Bhulekh Cadastral area
    calculated_area_acres: Mapped[float | None] = mapped_column(Float, nullable=True) # Area computed from PostGIS geometry
    farmer_entered_area: Mapped[float | None] = mapped_column(Float, nullable=True) # Area typed by farmer in form
    cadastral_reference: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # PostGIS Spatial Polygon (WGS 84, SRID 4326)
    geom = mapped_column(Geometry(geometry_type="POLYGON", srid=4326, spatial_index=True), nullable=True)
    geojson_geometry = mapped_column(JSON, nullable=True)

    cadastral_source: Mapped[str] = mapped_column(
        String(200), default="Farmer GPS Demarcation (Awaiting Bhulekh Cadastral Verification)"
    )
    verification_status: Mapped[ParcelVerificationStatus] = mapped_column(
        Enum(ParcelVerificationStatus, name="parcel_verification_status_enum"),
        default=ParcelVerificationStatus.PENDING_VERIFICATION,
        index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    farmer: Mapped[User] = relationship("User", back_populates="parcels")
    observations: Mapped[List[SatelliteObservation]] = relationship("SatelliteObservation", back_populates="parcel", cascade="all, delete-orphan")
    surveys: Mapped[List[UAVSurvey]] = relationship("UAVSurvey", back_populates="parcel", cascade="all, delete-orphan")
    certificates: Mapped[List[YieldCertificate]] = relationship("YieldCertificate", back_populates="parcel")

