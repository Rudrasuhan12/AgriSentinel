from typing import Optional
from pydantic import BaseModel


class ReviewActionRequest(BaseModel):
    rejection_reason: Optional[str] = None


class OfficialRequestDetailResponse(BaseModel):
    id: str
    user_id: str
    official_name: Optional[str] = None
    official_email: str
    mobile_number: Optional[str] = None
    department: str
    organization: str
    designation: str
    employee_id: Optional[str] = None
    requested_state: str
    requested_district: str
    reason: str
    invitation_code: Optional[str] = None
    approval_status: str
    created_at: str
    reviewed_at: Optional[str] = None
    reviewed_by: Optional[str] = None
    rejection_reason: Optional[str] = None

