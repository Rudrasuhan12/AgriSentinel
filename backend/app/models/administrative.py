from __future__ import annotations
import uuid
from sqlalchemy import String, Index, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class AdministrativeDistrict(Base):
    """
    Official Odisha Districts from Local Government Directory (LGD), Ministry of Panchayati Raj / Revenue Dept.
    """
    __tablename__ = "administrative_districts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    state_code: Mapped[str] = mapped_column(String(10), default="OD", index=True)
    district_name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    district_code: Mapped[str] = mapped_column(String(10), unique=True, nullable=False, index=True)
    lgd_code: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    headquarters: Mapped[str] = mapped_column(String(100), nullable=False)

    tahasils: Mapped[list[AdministrativeTahasil]] = relationship(
        "AdministrativeTahasil", back_populates="district", cascade="all, delete-orphan"
    )


class AdministrativeTahasil(Base):
    """
    Official Tahasils / Sub-districts under each Odisha District.
    """
    __tablename__ = "administrative_tahasils"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    district_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("administrative_districts.id", ondelete="CASCADE"), index=True
    )
    district_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    tahasil_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    tahasil_code: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    lgd_code: Mapped[str | None] = mapped_column(String(20), nullable=True)

    district: Mapped[AdministrativeDistrict] = relationship("AdministrativeDistrict", back_populates="tahasils")
    villages: Mapped[list[AdministrativeVillage]] = relationship(
        "AdministrativeVillage", back_populates="tahasil", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_admin_dist_tahasil", "district_name", "tahasil_name"),
    )


class AdministrativeVillage(Base):
    """
    Cadastral Revenue Mouzas / Villages under each Tahasil.
    """
    __tablename__ = "administrative_villages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tahasil_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("administrative_tahasils.id", ondelete="CASCADE"), index=True
    )
    district_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    tahasil_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    village_name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    mouza_code: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    revenue_circle: Mapped[str | None] = mapped_column(String(100), nullable=True)
    ri_circle: Mapped[str | None] = mapped_column(String(100), nullable=True)

    tahasil: Mapped[AdministrativeTahasil] = relationship("AdministrativeTahasil", back_populates="villages")

    __table_args__ = (
        Index("idx_admin_tahasil_village", "tahasil_name", "village_name"),
        Index("idx_admin_dist_tah_vil", "district_name", "tahasil_name", "village_name"),
    )
