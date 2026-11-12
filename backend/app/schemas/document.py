from __future__ import annotations
import uuid
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class ExtractedLandDetails(BaseModel):
    state: str = Field(default="Odisha", description="State name, e.g. Odisha")
    district: Optional[str] = Field(None, description="Extracted district name, e.g. Cuttack")
    tahasil: Optional[str] = Field(None, description="Extracted Tahasil name, e.g. Cuttack or Baranga")
    village: Optional[str] = Field(None, description="Extracted Mouza/Village name")
    thana: Optional[str] = Field(None, description="Extracted Thana/Police Station name")
    thana_number: Optional[str] = Field(None, description="Extracted Thana number")
    khata_number: Optional[str] = Field(None, description="Extracted Bhulekh Khata/Khatiyan number, e.g. 299/611")
    plot_number: Optional[str] = Field(None, description="Extracted Plot/Dag number, e.g. 640/2536")
    landowner_name: Optional[str] = Field(None, description="Extracted Tenant/Raiyat ownership name")
    land_classification: Optional[str] = Field(None, description="Extracted Kisam/Land classification, e.g. Gharabari")
    area_acres: Optional[float] = Field(None, description="Recorded land area in Acres")
    area_hectares: Optional[float] = Field(None, description="Recorded land area in Hectares")
    form_type: Optional[str] = Field(default="Schedule I Form No. 39-A", description="Odisha Patta Form type")
    page_count: Optional[int] = Field(default=1, description="Number of pages analyzed")
    extraction_method: str = Field(default="DEEP_LEARNING_OCR", description="OCR or PDF text extraction method used")


class PattaExtractionResponse(BaseModel):
    success: bool
    document_id: uuid.UUID
    filename: str
    file_size_bytes: int
    mime_type: str
    status: str
    extracted_fields: ExtractedLandDetails
    confidence_scores: Dict[str, float]
    overall_confidence: float
    matched_administrative_record: Optional[Dict[str, Any]] = None
    cadastral_polygon_found: bool = False
    message: str


class PattaDocumentSummaryResponse(BaseModel):
    id: uuid.UUID
    filename: str
    file_size_bytes: int
    mime_type: str
    status: str
    created_at: str
    overall_confidence: Optional[float]
    extracted_fields: Optional[Dict[str, Any]]
    confidence_scores: Optional[Dict[str, float]]
    is_verified: bool
    applied_to_parcel_id: Optional[uuid.UUID]


class PattaConfirmRequest(BaseModel):
    applied_parcel_id: Optional[uuid.UUID] = None
    verified_fields: Optional[Dict[str, Any]] = None
