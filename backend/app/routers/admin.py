import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User, UserRole, AccountStatus
from app.models.official_request import OfficialAccessRequest, ApprovalStatus
from app.schemas.admin import (
    OfficialRequestDetailResponse,
    ReviewActionRequest,
)
from app.core.dependencies import require_role

router = APIRouter(prefix="/api/admin", tags=["Administrator Workflows"])


@router.get("/official-requests", response_model=List[OfficialRequestDetailResponse])
async def list_official_requests(
    approval_status: ApprovalStatus | None = None,
    current_admin: User = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """List official access requests submitted by government officials."""
    query = select(OfficialAccessRequest).options(selectinload(OfficialAccessRequest.user))
    if approval_status:
        query = query.where(OfficialAccessRequest.approval_status == approval_status)
    query = query.order_by(OfficialAccessRequest.created_at.desc())

    res = await db.execute(query)
    requests = res.scalars().all()

    items = []
    for req in requests:
        items.append(
            OfficialRequestDetailResponse(
                id=str(req.id),
                user_id=str(req.user_id),
                official_email=req.user.email or "",
                mobile_number=req.user.mobile_number,
                department=req.department,
                organization=req.organization,
                designation=req.designation,
                employee_id=req.employee_id,
                requested_state=req.requested_state,
                requested_district=req.requested_district,
                reason=req.reason,
                invitation_code=req.invitation_code,
                approval_status=req.approval_status.value,
                created_at=req.created_at.isoformat(),
                reviewed_at=req.reviewed_at.isoformat() if req.reviewed_at else None,
                reviewed_by=str(req.reviewed_by) if req.reviewed_by else None,
                rejection_reason=req.rejection_reason,
            )
        )
    return items


@router.post("/official-requests/{request_id}/approve")
async def approve_official_request(
    request_id: uuid.UUID,
    current_admin: User = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Approve an official access request and grant the official active dashboard access."""
    stmt = (
        select(OfficialAccessRequest)
        .options(selectinload(OfficialAccessRequest.user))
        .where(OfficialAccessRequest.id == request_id)
    )
    res = await db.execute(stmt)
    req = res.scalar_one_or_none()

    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Official access request not found."
        )

    now = datetime.now(timezone.utc)
    req.approval_status = ApprovalStatus.APPROVED
    req.reviewed_at = now
    req.reviewed_by = current_admin.id

    # Activate User account
    req.user.account_status = AccountStatus.APPROVED
    await db.commit()

    return {
        "status": "APPROVED",
        "message": f"Official access request for {req.user.email} approved successfully.",
        "user_id": str(req.user.id),
        "reviewed_at": now.isoformat(),
    }


@router.post("/official-requests/{request_id}/reject")
async def reject_official_request(
    request_id: uuid.UUID,
    payload: ReviewActionRequest,
    current_admin: User = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Reject an official access request with an optional justification."""
    stmt = (
        select(OfficialAccessRequest)
        .options(selectinload(OfficialAccessRequest.user))
        .where(OfficialAccessRequest.id == request_id)
    )
    res = await db.execute(stmt)
    req = res.scalar_one_or_none()

    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Official access request not found."
        )

    now = datetime.now(timezone.utc)
    req.approval_status = ApprovalStatus.REJECTED
    req.reviewed_at = now
    req.reviewed_by = current_admin.id
    req.rejection_reason = payload.rejection_reason

    # Update User account status to REJECTED
    req.user.account_status = AccountStatus.REJECTED
    await db.commit()

    return {
        "status": "REJECTED",
        "message": f"Official access request for {req.user.email} rejected.",
        "user_id": str(req.user.id),
        "rejection_reason": payload.rejection_reason,
    }
