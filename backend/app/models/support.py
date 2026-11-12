from __future__ import annotations
import uuid
from typing import Optional
from sqlalchemy import String, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class SupportContact(Base):
    __tablename__ = "support_contacts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    state: Mapped[str] = mapped_column(String(100), default="Odisha")
    district: Mapped[str] = mapped_column(String(100), index=True)
    block: Mapped[str] = mapped_column(String(100), index=True)
    role_type: Mapped[str] = mapped_column(String(100)) # e.g. "Village Field Assistant (VAW)", "Krishi Vigyan Kendra (KVK)"
    officer_name: Mapped[str] = mapped_column(String(150))
    phone_number: Mapped[str] = mapped_column(String(50))
    email: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    office_address: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

