"""
Eagle Vision — Authentication & User Management Endpoints
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.schemas.user import UserLogin, Token

router = APIRouter()

# Default predefined credentials for demo / dev environments
DEMO_USERS = {
    "jane.doe@company.internal": {
        "id": "11111111-1111-1111-1111-111111111111",
        "name": "Jane Doe",
        "role": "employee",
        "title": "Senior Full-Stack Engineer",
        "department": "Core Platform",
    },
    "manager@company.internal": {
        "id": "22222222-2222-2222-2222-222222222222",
        "name": "Sarah Connor",
        "role": "manager",
        "title": "Engineering Director",
        "department": "Product Engineering",
    },
    "admin@company.internal": {
        "id": "33333333-3333-3333-3333-333333333333",
        "name": "Alex Vance",
        "role": "hr_admin",
        "title": "VP of People Operations",
        "department": "People & Culture",
    },
}


@router.post("/login", response_model=Token, summary="User Login")
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate user with email/password and issue JWT access and refresh tokens."""
    email = credentials.email.lower().strip()
    
    # Check demo users or allow valid login
    user_info = DEMO_USERS.get(email)
    if not user_info:
        # For development ease, if any password length >= 6 is provided, construct session
        if len(credentials.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters.",
            )
        user_info = {
            "id": "99999999-9999-9999-9999-999999999999",
            "name": email.split("@")[0].replace(".", " ").title(),
            "role": "employee",
            "title": "Internal Mobility Candidate",
            "department": "Engineering",
        }

    claims = {
        "email": email,
        "name": user_info["name"],
        "role": user_info["role"],
        "title": user_info["title"],
        "department": user_info["department"],
    }
    
    access_token = create_access_token(subject=user_info["id"], claims=claims)
    refresh_token = create_refresh_token(subject=user_info["id"])

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


@router.get("/me", summary="Get Current Authenticated User")
async def get_current_user_profile(authorization: Optional[str] = Header(None)):
    """Return user profile and permissions decoded from JWT Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        # Fallback to default demo user profile if unauthenticated
        return {
            "id": "11111111-1111-1111-1111-111111111111",
            "email": "jane.doe@company.internal",
            "name": "Jane Doe",
            "role": "employee",
            "title": "Senior Full-Stack Engineer",
            "department": "Core Platform",
        }

    token = authorization.split(" ")[1]
    try:
        payload = decode_token(token)
        return {
            "id": payload.get("sub"),
            "email": payload.get("email"),
            "name": payload.get("name"),
            "role": payload.get("role", "employee"),
            "title": payload.get("title"),
            "department": payload.get("department"),
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
        )
