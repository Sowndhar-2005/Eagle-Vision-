"""
Eagle Vision — Internal Opportunities Endpoints
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

router = APIRouter()


@router.get("", summary="List Opportunities")
async def list_opportunities(
    type: Optional[str] = None,
    status: Optional[str] = "open",
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List open jobs, gig projects, mentorships, and shadowing programs."""
    return {"items": [], "total": 0}


@router.post("", summary="Create Opportunity")
async def create_opportunity(payload: dict, db: AsyncSession = Depends(get_db)):
    """Create a new internal opportunity (Role, Project, Mentorship)."""
    return {"id": "new-opp-id", "status": "draft"}


@router.get("/{opportunity_id}", summary="Get Opportunity Details")
async def get_opportunity(opportunity_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve full opportunity specification including required and optional skill weights."""
    return {"id": opportunity_id}


@router.post("/{opportunity_id}/apply", summary="Apply to Opportunity")
async def apply_to_opportunity(opportunity_id: str, payload: dict, db: AsyncSession = Depends(get_db)):
    """Submit an application or expression of interest."""
    return {"message": "Application submitted successfully"}
