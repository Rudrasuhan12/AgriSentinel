import uuid
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, field_validator


class FarmerRegisterRequest(BaseModel):
    # Personal info
    full_name: str = Field(..., min_length=2, max_length=150)
    mobile_number: str = Field(..., pattern=r"^[6-9]\d{9}$")
    email: Optional[EmailStr] = None
    password: str = Field(..., min_length=8, max_length=100)
    preferred_language: str = "Odia"

    # Location info
    state: str = "Odisha"
    district: str = Field(..., min_length=2)
    sub_district: str = Field(..., min_length=2)
    village: str = Field(..., min_length=2)
    gram_panchayat: Optional[str] = None
    pin_code: str = Field(..., pattern=r"^\d{6}$")

    # Agricultural info
    primary_crop: str = "Paddy (Swarna)"
    land_ownership_type: str = "Owner"
    approximate_land_area: float = Field(..., gt=0.0)
    farming_category: Optional[str] = "Small"
    number_of_fields: int = Field(default=1, ge=1)

    # Consent
    consent_terms: bool = True
    consent_privacy: bool = True
    consent_field_data: bool = True


class OfficialRequestCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    official_email: EmailStr
    mobile_number: str = Field(..., pattern=r"^[6-9]\d{9}$")
    password: str = Field(..., min_length=8, max_length=100)
    department: str = Field(..., min_length=2)
    organization: str = Field(..., min_length=2)
    designation: str = Field(..., min_length=2)
    employee_id: Optional[str] = None
    requested_state: str = "Odisha"
    requested_district: str = Field(..., min_length=2)
    reason: str = Field(..., min_length=10)
    invitation_code: Optional[str] = None


class LoginRequest(BaseModel):
    identifier: str = Field(..., description="Mobile number or Email address")
    password: str = Field(..., min_length=1)
    remember_me: bool = False


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    account_status: str
    user_id: str
    display_name: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    identifier: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class VerifyMobileRequest(BaseModel):
    mobile_number: str
    otp_code: str


class UserResponse(BaseModel):
    id: str
    email: Optional[str] = None
    mobile_number: Optional[str] = None
    role: str
    account_status: str
    is_mobile_verified: bool
    is_email_verified: bool
    created_at: str
    display_name: str
    profile: Optional[Dict[str, Any]] = None

