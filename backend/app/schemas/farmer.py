from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class SatelliteObservationResponse(BaseModel):
    id: str
    provider: str
    product_id: str
    acquisition_date: str
    cloud_coverage_percentage: float
    mean_ndvi: Optional[float] = None
    min_ndvi: Optional[float] = None
    max_ndvi: Optional[float] = None
    processing_status: str
    notes: Optional[str] = None


class ParcelCreateRequest(BaseModel):
    khata_number: str = Field(..., min_length=1, description="Odisha Bhulekh Khata No.")
    plot_number: str = Field(..., min_length=1, description="Odisha Bhulekh Plot No.")
    state: str = "Odisha"
    district: str = Field(..., min_length=2)
    sub_district: str = Field(..., min_length=2, description="Tahasil or Block")
    village: str = Field(..., min_length=2)
    primary_crop: str = "Paddy (Swarna MTU)"
    area_acres: float = Field(..., gt=0.0, description="Field Area in Acres")
    geojson_geometry: Optional[Dict[str, Any]] = None # GeoJSON Polygon Feature or Geometry


class ParcelResponse(BaseModel):
    id: str
    parcel_code: str
    khata_number: str
    plot_number: str
    state: str
    district: str
    sub_district: str
    village: str
    primary_crop: str
    area_acres: float
    geojson_geometry: Optional[Dict[str, Any]] = None
    cadastral_source: str
    verification_status: str
    created_at: str
    latest_ndvi: Optional[float] = None
    latest_observation_date: Optional[str] = None


class UAVSurveyResponse(BaseModel):
    id: str
    survey_code: str
    parcel_id: str
    parcel_code: str
    scheduled_datetime: str
    actual_flight_datetime: Optional[str] = None
    altitude_meters: float
    front_overlap_percent: float
    side_overlap_percent: float
    ground_sampling_distance_cm: float
    flight_status: str
    drone_model: str


class HeapReconstructionResponse(BaseModel):
    id: str
    survey_id: str
    parcel_code: str
    volume_cubic_meters: float
    bulk_density_kg_per_m3: float
    estimated_mass_quintals: float
    point_cloud_count: int
    rmse_vertical_cm: float
    error_margin_percent: float
    created_at: str


class YieldCertificateResponse(BaseModel):
    id: str
    certificate_number: str
    parcel_code: str
    season: str
    crop_variety: str
    verified_yield_quintals: float
    issuing_authority: str
    authorized_signatory: str
    status: str
    verification_hash: str
    issue_date: str
    pdf_url: Optional[str] = None


class FarmerNotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: str


class SupportContactResponse(BaseModel):
    id: str
    state: str
    district: str
    block: str
    role_type: str
    officer_name: str
    phone_number: str
    email: Optional[str] = None
    office_address: str


class FarmerDashboardSummaryResponse(BaseModel):
    farmer_name: str
    farmer_email: str
    farmer_location: str
    total_registered_area_acres: float
    parcels_count: int
    verified_parcels_count: int
    active_crop_variety: str
    
    # Real UAV / Reconstruction metrics (None when no survey exists yet)
    estimated_volume_m3: Optional[float] = None
    estimated_mass_quintals: Optional[float] = None
    volume_analysis_comparison: Optional[str] = None

    # Next flight survey (None when not scheduled)
    next_uav_survey_date: Optional[str] = None
    next_uav_survey_purpose: Optional[str] = None

    # Photogrammetry protocol workflow progress (1 to 5)
    photogrammetry_protocol_step: int = 1

    # Parcels list
    parcels: List[ParcelResponse] = []

    # State flags to enforce strict honest empty states
    has_parcels: bool = False
    has_surveys: bool = False
    has_reconstructions: bool = False
    has_certificates: bool = False
