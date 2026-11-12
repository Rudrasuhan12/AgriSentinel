from __future__ import annotations
import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from sqlalchemy import Float, Integer, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

if TYPE_CHECKING:
    from app.models.survey import UAVSurvey
    from app.models.certificate import YieldCertificate


class HeapReconstruction(Base):
    __tablename__ = "heap_reconstructions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    survey_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("uav_surveys.id", ondelete="CASCADE"), unique=True, index=True
    )

    volume_cubic_meters: Mapped[float] = mapped_column(Float, nullable=False)
    bulk_density_kg_per_m3: Mapped[float] = mapped_column(Float, default=578.0) # Documented Swarna paddy bulk density
    estimated_mass_quintals: Mapped[float] = mapped_column(Float, nullable=False) # (volume * density) / 100
    point_cloud_count: Mapped[int] = mapped_column(Integer, default=0)

    mesh_point_cloud_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rmse_vertical_cm: Mapped[float] = mapped_column(Float, default=1.4) # Accuracy / RMS error in cm
    error_margin_percent: Mapped[float] = mapped_column(Float, default=1.4)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    survey: Mapped[UAVSurvey] = relationship("UAVSurvey", back_populates="reconstruction")
    certificates: Mapped[list[YieldCertificate]] = relationship("YieldCertificate", back_populates="reconstruction")

