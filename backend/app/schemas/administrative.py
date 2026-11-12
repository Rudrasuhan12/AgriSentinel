from typing import Optional, List
from pydantic import BaseModel


class DistrictItemResponse(BaseModel):
    id: str
    state_code: str
    district_name: str
    district_code: str
    lgd_code: str
    headquarters: str


class TahasilItemResponse(BaseModel):
    id: str
    district_name: str
    tahasil_name: str
    tahasil_code: str
    lgd_code: Optional[str] = None


class VillageItemResponse(BaseModel):
    id: str
    district_name: str
    tahasil_name: str
    village_name: str
    mouza_code: Optional[str] = None
    revenue_circle: Optional[str] = None
    ri_circle: Optional[str] = None


class AdministrativeHierarchySummary(BaseModel):
    total_districts: int
    districts: List[DistrictItemResponse]

