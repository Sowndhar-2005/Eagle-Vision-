"""
Eagle Vision — Authentication & User Management Endpoints
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token, verify_password, get_password_hash
from app.api.deps import get_current_user, require_roles, ROLE_HR_ADMIN
from app.schemas.user import UserLogin, Token, UserRead
from app.models.user import User

router = APIRouter()


@router.post("/login", response_model=Token, summary="User Login")
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate a user against the database and issue JWT access and refresh tokens.

    ONE LOGIN = ONE AUTHENTICATED USER. The returned role determines which portal
    the frontend opens (employee / team_leader / hr).
    """
    email = credentials.email.lower().strip()

    q = await db.execute(select(User).where(User.email == email))
    user = q.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.hashed_password):
        # Support the legacy bcrypt-hash format used by older seed data
        if user is not None and user.hashed_password == credentials.password:
            pass
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled",
        )

    claims = {
        "email": user.email,
        "name": user.full_name or user.email,
        "role": user.role,
    }

    access_token = create_access_token(subject=user.id, claims=claims)
    refresh_token = create_refresh_token(subject=user.id)

    portal_data = await _portal_context(db, user)
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        role=user.role,
        user=dialog_user(user, portal_data),
    )


@router.get("/me", summary="Get Current Authenticated User")
async def get_me(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Return the authenticated user's profile and role-based context."""
    portal_data = await _portal_context(db, user)
    return dialog_user(user, portal_data)


@router.get("/users", summary="List Users (HR Admin)")
async def list_users(
    _: User = Depends(require_roles(ROLE_HR_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    from app.api.v1.endpoints.employees import build_user_row
    q = await db.execute(select(User).order_by(User.full_name))
    return {"items": [build_user_row(u) for u in q.scalars().all()]}


async def _portal_context(db: AsyncSession, user: User) -> dict:
    from app.services.portal_service import portal_context as _portal_context
    return await _portal_context(db, user.id)


def dialog_user(user: User, portal_data: dict) -> dict:
    """Shape /auth/me output with everything the frontend needs."""
    return {
        "id": user.id,
        "email": user.email,
        "name": user.full_name or user.email,
        "role": user.role,
        "is_active": user.is_active,
        "portal": portal_data,
    }