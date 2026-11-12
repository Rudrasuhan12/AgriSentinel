from __future__ import annotations
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, DateTime, Index, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from geoalchemy2 import Geometry
from app.database import Base


class CadastralParcel(Base):
    """
    Official Master Cadastral Parcel Boundaries
    Originating from Revenue & Disaster Management Department / Odisha Bhulekh Cadastral Survey.
    Provides authoritative spatial geometries, plot IDs, and recorded acreages.
    """
    __tablename__ = "cadastral_parcels"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    state_code: Mapped[str] = mapped_column(String(10), default="OD", index=True)
    district_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    district_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    tahasil_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    tahasil_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    village_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    village_code: Mapped[str | None] = mapped_column(String(50), nullable=True)

    khata_number: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    plot_number: Mapped[str] = mapped_column(String(100), nullable=False, index=True) # Dag / Khesra No.
    recorded_area_acres: Mapped[float] = mapped_column(Float, nullable=False)

    # PostGIS Polygon Geometry (SRID 4326 - WGS84)
    geom = mapped_column(Geometry(geometry_type="POLYGON", srid=4326, spatial_index=True), nullable=False)
    geojson_geometry = mapped_column(JSON, nullable=False)

    source: Mapped[str] = mapped_column(
        String(255), default="Odisha Cadastral Survey Dataset (Revenue & Disaster Management Dept)"
    )
    source_reference: Mapped[str | None] = mapped_column(String(100), nullable=True)
    verification_status: Mapped[str] = mapped_column(String(50), default="OFFICIAL_CADASTRAL")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    __table_args__ = (
        Index("idx_cadastral_hierarchy_plot", "district_name", "tahasil_name", "village_name", "plot_number"),
        Index("idx_cadastral_hierarchy_khata_plot", "district_name", "tahasil_name", "village_name", "khata_number", "plot_number"),
    )

