import uuid
from typing import Callable, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import jwt

from app.database import get_db
from app.models.user import User, UserRole, AccountStatus
from app.core.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


async def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Retrieve and authenticate the user from the Bearer token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        from app.config import settings
        if settings.ENVIRONMENT == "development":
            # Auto-fallback to verified demo farmer in development if session token is unprovided
            res = await db.execute(select(User).where(User.email == "farmer@agrisentinel.local"))
            dev_farmer = res.scalar_one_or_none()
            if dev_farmer:
                return dev_farmer
        raise credentials_exception

    try:
        payload = decode_access_token(token)
        user_id_str: str | None = payload.get("sub")
        if not user_id_str:
            raise ValueError("Token sub claim missing")
        user_id = uuid.UUID(user_id_str)
    except Exception:
        from app.config import settings
        if settings.ENVIRONMENT == "development":
            res = await db.execute(select(User).where(User.email == "farmer@agrisentinel.local"))
            dev_farmer = res.scalar_one_or_none()
            if dev_farmer:
                return dev_farmer
        raise credentials_exception

    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if user is None:
        from app.config import settings
        if settings.ENVIRONMENT == "development":
            res = await db.execute(select(User).where(User.email == "farmer@agrisentinel.local"))
            dev_farmer = res.scalar_one_or_none()
            if dev_farmer:
                return dev_farmer
        raise credentials_exception

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Ensure user account is APPROVED and not SUSPENDED or REJECTED."""
    if current_user.account_status == AccountStatus.SUSPENDED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended. Please contact system support.",
        )
    if current_user.account_status == AccountStatus.REJECTED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your access request was rejected by an administrator.",
        )
    if current_user.account_status == AccountStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is pending administrator review and approval.",
        )
    return current_user


def require_role(*allowed_roles: UserRole) -> Callable:
    """Dependency factory checking that active user holds one of allowed_roles."""
    async def role_checker(
        current_user: User = Depends(get_current_active_user),
    ) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of {[r.value for r in allowed_roles]}",
            )
        return current_user

    return role_checker

