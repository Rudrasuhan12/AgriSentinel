import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True
    )
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    preferred_language: Mapped[str] = mapped_column(String(50), default="Odia")
    
    # Location
    state: Mapped[str] = mapped_column(String(100), default="Odisha", index=True)
    district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    sub_district: Mapped[str] = mapped_column(String(100), nullable=False)
    village: Mapped[str] = mapped_column(String(100), nullable=False)
    gram_panchayat: Mapped[str | None] = mapped_column(String(100), nullable=True)
    pin_code: Mapped[str] = mapped_column(String(20), nullable=False)

    # Agricultural Metrics
    primary_crop: Mapped[str] = mapped_column(String(100), default="Paddy (Swarna)")
    land_ownership_type: Mapped[str] = mapped_column(String(50), default="Owner")
    approximate_land_area: Mapped[float] = mapped_column(Float, default=1.0)
    farming_category: Mapped[str | None] = mapped_column(String(50), nullable=True) # e.g. Small, Marginal, Medium
    number_of_fields: Mapped[int] = mapped_column(Integer, default=1)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationship back to User
    user: Mapped["User"] = relationship("User", back_populates="farmer_profile")
