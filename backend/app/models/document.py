from __future__ import annotations
import uuid
import enum
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional, Any, Dict
from sqlalchemy import String, Integer, Float, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.parcel import FarmerParcel


class DocumentProcessingStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class PattaDocument(Base):
    __tablename__ = "patta_documents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    farmer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    document_type: Mapped[str] = mapped_column(String(100), default="ODISHA_PATTA_ROR", nullable=False)
    
    status: Mapped[str] = mapped_column(
        String(50), default=DocumentProcessingStatus.PENDING.value, index=True
    )
    error_message: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Structured extracted land attributes
    extracted_fields: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    # Field-level confidence scores
    confidence_scores: Mapped[Optional[Dict[str, float]]] = mapped_column(JSON, nullable=True)
    overall_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    raw_ocr_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    applied_to_parcel_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("farmer_parcels.id", ondelete="SET NULL"), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    farmer: Mapped["User"] = relationship("User", foreign_keys=[farmer_id])
    parcel: Mapped[Optional["FarmerParcel"]] = relationship("FarmerParcel", foreign_keys=[applied_to_parcel_id])
