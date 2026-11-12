from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class CadastralLookupRequest(BaseModel):
    state: str = Field(default="Odisha", description="State name or code")
    district: str = Field(..., description="District name, e.g. Cuttack")
    tahasil: str = Field(..., description="Tahasil / Block name, e.g. Baranga")
    village: str = Field(..., description="Village name, e.g. Mundali")
    khata_number: str = Field(..., description="Bhulekh Khata number, e.g. 299/611 or 204/12")
    plot_number: str = Field(..., description="Plot / Dag number, e.g. 640/2536 or 890")


class CadastralParcelResponse(BaseModel):
    id: str
    khata_number: str
    plot_number: str
    state: str
    district: str
    tahasil: str
    village: str
    recorded_area_acres: float
    calculated_area_acres: float
    geometry: Dict[str, Any]
    bbox: List[float] # [min_lon, min_lat, max_lon, max_lat]
    source: str
    source_reference: Optional[str] = None
    verification_status: str


class SurroundingParcelItem(BaseModel):
    plot_number: str
    khata_number: str
    recorded_area_acres: float
    geometry: Dict[str, Any]


class CadastralLookupResponse(BaseModel):
    success: bool
    parcel: Optional[CadastralParcelResponse] = None
    surrounding_parcels: List[SurroundingParcelItem] = []
    multiple_matches: bool = False
    matches: List[Dict[str, Any]] = []
    message: str
    fallback_allowed: bool = False


class VillageItem(BaseModel):
    name: str


class TahasilItem(BaseModel):
    name: str
    code: Optional[str] = None
    villages: List[str]


class DistrictItem(BaseModel):
    name: str
    code: Optional[str] = None
    tahasils: List[TahasilItem]


class CadastralHierarchyResponse(BaseModel):
    state: str
    districts: List[DistrictItem]

