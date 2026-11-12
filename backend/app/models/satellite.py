from __future__ import annotations
import uuid
import enum
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, Float, DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

if TYPE_CHECKING:
    from app.models.parcel import FarmerParcel


class SatelliteProcessingStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CLOUDY = "CLOUDY"


class SatelliteObservation(Base):
    __tablename__ = "satellite_observations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    parcel_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("farmer_parcels.id", ondelete="CASCADE"), index=True
    )
    provider: Mapped[str] = mapped_column(String(100), default="Copernicus Sentinel-2 Level-2A")
    product_id: Mapped[str] = mapped_column(String(255), nullable=False) # STAC / Granule ID
    acquisition_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    cloud_coverage_percentage: Mapped[float] = mapped_column(Float, default=0.0)

    # Real calculated NDVI metrics
    mean_ndvi: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    min_ndvi: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    max_ndvi: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    true_color_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    false_color_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    processing_status: Mapped[SatelliteProcessingStatus] = mapped_column(
        Enum(SatelliteProcessingStatus, name="satellite_processing_status_enum"),
        default=SatelliteProcessingStatus.PENDING,
        index=True
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationship
    parcel: Mapped[FarmerParcel] = relationship("FarmerParcel", back_populates="observations")
