"""
Eagle Vision — Authentication & User Management Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

router = APIRouter()


@router.post("/login", summary="User Login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """Authenticate a user and return JWT access/refresh tokens."""
    return {"message": "Login endpoint ready for implementation"}


@router.post("/refresh", summary="Refresh Token")
async def refresh_token():
    """Refresh access token using refresh token."""
    return {"message": "Token refresh endpoint ready for implementation"}


@router.get("/me", summary="Get Current Authenticated User")
async def get_current_user_profile():
    """Return user profile and permissions."""
    return {"message": "Current user profile endpoint ready for implementation"}
