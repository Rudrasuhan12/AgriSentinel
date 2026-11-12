import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy import select, or_, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User, UserRole, AccountStatus
from app.models.farmer_profile import FarmerProfile
from app.models.official_request import OfficialAccessRequest, ApprovalStatus
from app.models.session import UserSession
from app.models.consent import ConsentRecord
from app.schemas.auth import (
    FarmerRegisterRequest,
    OfficialRequestCreate,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyMobileRequest,
    UserResponse,
)
from app.core.security import (
    hash_password,
    verify_password,
    hash_token,
    create_access_token,
    create_refresh_token,
)
from app.core.dependencies import get_current_user, get_current_active_user
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register/farmer", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_farmer(
    payload: FarmerRegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Register a new farmer account and initialize their agricultural profile."""
    # Check for existing mobile number
    stmt = select(User).where(User.mobile_number == payload.mobile_number)
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A farmer account with this mobile number already exists."
        )

    # Check for existing email if provided
    if payload.email:
        stmt = select(User).where(User.email == payload.email)
        res = await db.execute(stmt)
        if res.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email address already exists."
            )

    # Create User
    new_user = User(
        email=payload.email,
        mobile_number=payload.mobile_number,
        password_hash=hash_password(payload.password),
        role=UserRole.FARMER,
        account_status=AccountStatus.APPROVED,
        is_mobile_verified=False,
    )
    db.add(new_user)
    await db.flush()

    # Create Farmer Profile
    profile = FarmerProfile(
        user_id=new_user.id,
        full_name=payload.full_name,
        preferred_language=payload.preferred_language,
        state=payload.state,
        district=payload.district,
        sub_district=payload.sub_district,
        village=payload.village,
        gram_panchayat=payload.gram_panchayat,
        pin_code=payload.pin_code,
        primary_crop=payload.primary_crop,
        land_ownership_type=payload.land_ownership_type,
        approximate_land_area=payload.approximate_land_area,
        farming_category=payload.farming_category,
        number_of_fields=payload.number_of_fields,
    )
    db.add(profile)

    # Record explicit user consents
    now = datetime.now(timezone.utc)
    consents = [
        ConsentRecord(user_id=new_user.id, consent_type="TERMS_AND_CONDITIONS", accepted=payload.consent_terms, accepted_at=now),
        ConsentRecord(user_id=new_user.id, consent_type="PRIVACY_NOTICE", accepted=payload.consent_privacy, accepted_at=now),
        ConsentRecord(user_id=new_user.id, consent_type="FIELD_DATA_PROCESSING", accepted=payload.consent_field_data, accepted_at=now),
    ]
    db.add_all(consents)

    # Generate session tokens
    raw_refresh, refresh_hash, refresh_expires = create_refresh_token(str(new_user.id))
    session_record = UserSession(
        user_id=new_user.id,
        refresh_token_hash=refresh_hash,
        expires_at=refresh_expires,
    )
    db.add(session_record)
    await db.commit()

    access_token = create_access_token(
        subject=str(new_user.id),
        role=new_user.role.value,
        account_status=new_user.account_status.value,
        extra_claims={"name": payload.full_name}
    )

    # Set secure HTTP-only refresh cookie
    response.set_cookie(
        key="agrisentinel_refresh",
        value=raw_refresh,
        httponly=True,
        samesite="lax",
        secure=False,  # Set to True in production HTTPS
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=raw_refresh,
        token_type="bearer",
        role=new_user.role.value,
        account_status=new_user.account_status.value,
        user_id=str(new_user.id),
        display_name=payload.full_name,
    )


@router.post("/register/official-request", status_code=status.HTTP_201_CREATED)
async def register_official_request(
    payload: OfficialRequestCreate,
    db: AsyncSession = Depends(get_db),
):
    """Submit an official government access request requiring verification and approval."""
    # Check email
    stmt = select(User).where(User.email == payload.official_email)
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account or request with this official email already exists."
        )

    # Check mobile
    stmt = select(User).where(User.mobile_number == payload.mobile_number)
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this mobile number already exists."
        )

    # Check invitation code auto-approval (e.g. pre-shared secure agency token)
    is_auto_approved = payload.invitation_code == "ODISHA-AGRI-2026"
    status_val = AccountStatus.APPROVED if is_auto_approved else AccountStatus.PENDING
    approval_val = ApprovalStatus.APPROVED if is_auto_approved else ApprovalStatus.PENDING

    new_user = User(
        email=payload.official_email,
        mobile_number=payload.mobile_number,
        password_hash=hash_password(payload.password),
        role=UserRole.GOVERNMENT_OFFICIAL,
        account_status=status_val,
        is_email_verified=False,
    )
    db.add(new_user)
    await db.flush()

    official_req = OfficialAccessRequest(
        user_id=new_user.id,
        department=payload.department,
        organization=payload.organization,
        designation=payload.designation,
        employee_id=payload.employee_id,
        requested_state=payload.requested_state,
        requested_district=payload.requested_district,
        reason=payload.reason,
        invitation_code=payload.invitation_code,
        approval_status=approval_val,
        reviewed_at=datetime.now(timezone.utc) if is_auto_approved else None,
    )
    db.add(official_req)
    await db.commit()

    return {
        "status": status_val.value,
        "message": (
            "Access request approved via validated agency invitation code."
            if is_auto_approved
            else "Your official access request has been submitted. It is subject to organization verification and administrator approval."
        ),
        "user_id": str(new_user.id),
        "official_email": payload.official_email,
    }


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate user with identifier (email or mobile) and password."""
    # Find user by email or mobile number
    stmt = (
        select(User)
        .options(selectinload(User.farmer_profile), selectinload(User.official_request))
        .where(
            or_(
                User.email == payload.identifier.strip().lower(),
                User.mobile_number == payload.identifier.strip(),
            )
        )
    )
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid mobile number/email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Enforce role-based account statuses
    if user.account_status == AccountStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your official access request is currently pending administrative review. You will receive authorization once approved.",
        )
    elif user.account_status == AccountStatus.REJECTED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your official access request was reviewed and rejected by an administrator.",
        )
    elif user.account_status == AccountStatus.SUSPENDED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been suspended. Please contact system support.",
        )

    # Update last login
    user.last_login_at = datetime.now(timezone.utc)

    # Derive display name
    display_name = "User"
    if user.role == UserRole.FARMER and user.farmer_profile:
        display_name = user.farmer_profile.full_name
    elif user.role == UserRole.GOVERNMENT_OFFICIAL and user.official_request:
        display_name = f"{user.official_request.designation} ({user.official_request.department})"
    elif user.role == UserRole.ADMIN:
        display_name = "System Administrator"

    # Issue tokens
    raw_refresh, refresh_hash, refresh_expires = create_refresh_token(str(user.id))
    session_record = UserSession(
        user_id=user.id,
        refresh_token_hash=refresh_hash,
        expires_at=refresh_expires,
    )
    db.add(session_record)
    await db.commit()

    access_token = create_access_token(
        subject=str(user.id),
        role=user.role.value,
        account_status=user.account_status.value,
        extra_claims={"name": display_name}
    )

    # Set secure HTTP-only refresh cookie
    response.set_cookie(
        key="agrisentinel_refresh",
        value=raw_refresh,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=raw_refresh,
        token_type="bearer",
        role=user.role.value,
        account_status=user.account_status.value,
        user_id=str(user.id),
        display_name=display_name,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(
    payload: RefreshTokenRequest | None = None,
    request: Request = None,
    response: Response = None,
    db: AsyncSession = Depends(get_db),
):
    """Rotate refresh token and issue a fresh access token."""
    # Obtain refresh token from body or HTTP-only cookie
    token_val = payload.refresh_token if payload and payload.refresh_token else None
    if not token_val and request:
        token_val = request.cookies.get("agrisentinel_refresh")

    if not token_val:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not supplied.",
        )

    t_hash = hash_token(token_val)
    stmt = (
        select(UserSession)
        .options(selectinload(UserSession.user))
        .where(
            UserSession.refresh_token_hash == t_hash,
            UserSession.revoked_at.is_(None),
        )
    )
    res = await db.execute(stmt)
    sess = res.scalar_one_or_none()

    if not sess:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked refresh token.",
        )

    now = datetime.now(timezone.utc)
    if sess.expires_at < now:
        sess.revoked_at = now
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired. Please log in again.",
        )

    # Revoke old session and rotate
    sess.revoked_at = now
    user = sess.user

    new_raw_refresh, new_hash, new_expires = create_refresh_token(str(user.id))
    new_sess = UserSession(
        user_id=user.id,
        refresh_token_hash=new_hash,
        expires_at=new_expires,
    )
    db.add(new_sess)
    await db.commit()

    display_name = user.email or user.mobile_number or "User"
    new_access_token = create_access_token(
        subject=str(user.id),
        role=user.role.value,
        account_status=user.account_status.value,
        extra_claims={"name": display_name}
    )

    if response:
        response.set_cookie(
            key="agrisentinel_refresh",
            value=new_raw_refresh,
            httponly=True,
            samesite="lax",
            secure=False,
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        )

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_raw_refresh,
        token_type="bearer",
        role=user.role.value,
        account_status=user.account_status.value,
        user_id=str(user.id),
        display_name=display_name,
    )


@router.post("/logout")
async def logout(
    response: Response,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Revoke user's refresh token and clear session cookies."""
    token_val = request.cookies.get("agrisentinel_refresh")
    now = datetime.now(timezone.utc)

    if token_val:
        t_hash = hash_token(token_val)
        await db.execute(
            update(UserSession)
            .where(UserSession.refresh_token_hash == t_hash)
            .values(revoked_at=now)
        )
    else:
        # Revoke all active sessions for this user
        await db.execute(
            update(UserSession)
            .where(UserSession.user_id == current_user.id, UserSession.revoked_at.is_(None))
            .values(revoked_at=now)
        )
    await db.commit()

    response.delete_cookie(key="agrisentinel_refresh")
    return {"message": "Logged out successfully."}


@router.post("/verify-mobile")
async def verify_mobile(
    payload: VerifyMobileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify mobile number with OTP (supports development mock OTP)."""
    if settings.MOCK_OTP_MODE and payload.otp_code == settings.MOCK_OTP_CODE:
        current_user.is_mobile_verified = True
        await db.commit()
        return {"verified": True, "message": "Mobile number verified successfully (Mock Mode)."}

    # In production, this verifies via SMS gateway provider
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid OTP code. In development, use mock OTP '123456'."
    )


@router.post("/forgot-password")
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Initiate password reset flow."""
    # Lookup user
    stmt = select(User).where(
        or_(User.email == payload.identifier.strip().lower(), User.mobile_number == payload.identifier.strip())
    )
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    # Always return success message to prevent user enumeration
    return {
        "message": "If an account exists with that identifier, password recovery instructions have been dispatched.",
        "mock_note": "In development, reset tokens can be simulated or administered by the system admin."
    }


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get profile and verification details of current authenticated user."""
    # Load relationships
    stmt = (
        select(User)
        .options(selectinload(User.farmer_profile), selectinload(User.official_request))
        .where(User.id == current_user.id)
    )
    res = await db.execute(stmt)
    user = res.scalar_one()

    profile_data = None
    display_name = user.email or user.mobile_number or "User"

    if user.role == UserRole.FARMER and user.farmer_profile:
        fp = user.farmer_profile
        display_name = fp.full_name
        profile_data = {
            "full_name": fp.full_name,
            "preferred_language": fp.preferred_language,
            "state": fp.state,
            "district": fp.district,
            "sub_district": fp.sub_district,
            "village": fp.village,
            "primary_crop": fp.primary_crop,
            "approximate_land_area": fp.approximate_land_area,
            "number_of_fields": fp.number_of_fields,
        }
    elif user.role == UserRole.GOVERNMENT_OFFICIAL and user.official_request:
        oq = user.official_request
        display_name = f"{oq.designation} - {oq.department}"
        profile_data = {
            "department": oq.department,
            "organization": oq.organization,
            "designation": oq.designation,
            "requested_state": oq.requested_state,
            "requested_district": oq.requested_district,
            "approval_status": oq.approval_status.value,
        }

    return UserResponse(
        id=str(user.id),
        email=user.email,
        mobile_number=user.mobile_number,
        role=user.role.value,
        account_status=user.account_status.value,
        is_mobile_verified=user.is_mobile_verified,
        is_email_verified=user.is_email_verified,
        created_at=user.created_at.isoformat(),
        display_name=display_name,
        profile=profile_data,
    )

