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
    from app.models.user import User
    from app.models.parcel import FarmerParcel
    from app.models.reconstruction import HeapReconstruction


class CertificateStatus(str, enum.Enum):
    ISSUED = "ISSUED"
    PENDING_AUDIT = "PENDING_AUDIT"
    REVOKED = "REVOKED"


class YieldCertificate(Base):
    __tablename__ = "yield_certificates"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    farmer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    parcel_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("farmer_parcels.id", ondelete="CASCADE"), index=True
    )
    reconstruction_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("heap_reconstructions.id", ondelete="SET NULL"), nullable=True
    )

    certificate_number: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    season: Mapped[str] = mapped_column(String(50), default="Kharif 2026")
    crop_variety: Mapped[str] = mapped_column(String(150), default="Paddy (Swarna MTU)")
    verified_yield_quintals: Mapped[float] = mapped_column(Float, nullable=False)
    issuing_authority: Mapped[str] = mapped_column(String(200), default="District Agriculture Office (DAO), Cuttack")
    authorized_signatory: Mapped[str] = mapped_column(String(150), default="DAO Verification Officer")

    status: Mapped[CertificateStatus] = mapped_column(
        Enum(CertificateStatus, name="certificate_status_enum"),
        default=CertificateStatus.ISSUED,
        index=True
    )
    verification_hash: Mapped[str] = mapped_column(String(64), unique=True) # SHA256 cryptographic verification
    issue_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    pdf_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    farmer: Mapped[User] = relationship("User")
    parcel: Mapped[FarmerParcel] = relationship("FarmerParcel", back_populates="certificates")
    reconstruction: Mapped[Optional[HeapReconstruction]] = relationship("HeapReconstruction", back_populates="certificates")

