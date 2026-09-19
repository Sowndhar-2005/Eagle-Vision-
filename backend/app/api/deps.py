"""
Eagle Vision — FastAPI Dependencies: Authentication & RBAC
"""

from typing import Callable, List, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)

ROLE_EMPLOYEE = "employee"
ROLE_TEAM_LEADER = "team_leader"
ROLE_HR = "hr"
ROLE_HR_ADMIN = "hr_admin"
ROLE_SYS_ADMIN = "sys_admin"

HR_ROLES = {ROLE_HR, ROLE_HR_ADMIN, ROLE_SYS_ADMIN}


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Resolve the authenticated user from the JWT Bearer token. 401 otherwise."""
    missing = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise missing

    try:
        payload = decode_token(credentials.credentials)
    except Exception:
        raise missing

    if payload.get("type") != "access":
        raise missing

    user_id = payload.get("sub")
    if not user_id:
        raise missing

    q = await db.execute(select(User).where(User.id == str(user_id)))
    user = q.scalar_one_or_none()
    if not user or not user.is_active:
        raise missing

    return user


def require_roles(*roles: str) -> Callable:
    """Return a dependency enforcing that the user holds one of the given roles."""

    async def _guard(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for this resource",
            )
        return user

    return _guard


async def require_hr(user: User = Depends(get_current_user)) -> User:
    """Guard for HR-only endpoints."""
    if user.role not in HR_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="HR role required",
        )
    return user


async def require_team_leader(user: User = Depends(get_current_user)) -> User:
    """Guard for Team Leader endpoints."""
    if user.role not in (ROLE_TEAM_LEADER, ROLE_HR, ROLE_HR_ADMIN, ROLE_SYS_ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Team Leader role required",
        )
    return user


def ensure_self_or(employee_field: str = "id"):
    """Factory for helpers that confirm a resource belongs to the current user."""

    def _check(user: User, resource_owner_id: Optional[str], resource: str = "resource"):
        if str(user.id) != str(resource_owner_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You do not have access to this {resource}",
            )

    return _check


def is_hr(user: User) -> bool:
    return user.role in HR_ROLES