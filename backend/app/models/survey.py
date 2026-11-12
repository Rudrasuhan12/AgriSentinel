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
    from app.models.reconstruction import HeapReconstruction


class FlightStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class UAVSurvey(Base):
    __tablename__ = "uav_surveys"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    parcel_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("farmer_parcels.id", ondelete="CASCADE"), index=True
    )
    survey_code: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    scheduled_datetime: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    actual_flight_datetime: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    altitude_meters: Mapped[float] = mapped_column(Float, default=35.0)
    front_overlap_percent: Mapped[float] = mapped_column(Float, default=80.0)
    side_overlap_percent: Mapped[float] = mapped_column(Float, default=75.0)
    ground_sampling_distance_cm: Mapped[float] = mapped_column(Float, default=1.12)

    flight_status: Mapped[FlightStatus] = mapped_column(
        Enum(FlightStatus, name="flight_status_enum"),
        default=FlightStatus.SCHEDULED,
        index=True
    )
    pilot_in_command: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    drone_model: Mapped[str] = mapped_column(String(100), default="AgriSentinel Survey UAV X-4")
    orthomosaic_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    parcel: Mapped[FarmerParcel] = relationship("FarmerParcel", back_populates="surveys")
    reconstruction: Mapped[Optional[HeapReconstruction]] = relationship("HeapReconstruction", back_populates="survey", uselist=False)

