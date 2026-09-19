"""
Eagle Vision — Internal Opportunities Endpoints
Employee-facing opportunities are scored with genuine matched skill coverage.
"""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user, require_hr
from app.models.portal import InternalOpportunity, ExpressionOfInterest
from app.models.user import User
from app.services.portal_service import (
    list_opportunities, express_interest, employee_for_user,
)

router = APIRouter()


class CreateOpportunityPayload(BaseModel):
    title: str
    description: Optional[str] = ""
    type: str = "project"  # role | gig | project | mentorship
    team: Optional[str] = ""
    team_id: Optional[str] = ""
    teamLeaderName: Optional[str] = ""
    department: Optional[str] = "Engineering"
    location: Optional[str] = "Hybrid"
    isRemote: bool = True
    duration: Optional[str] = ""
    requiredSkills: list = []
    preferredSkills: list = []


@router.get("", summary="Opportunities matched for the viewing employee")
async def opportunities(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    emp = await employee_for_user(db, user)
    if not emp:
        return {"items": []}
    return {"items": await list_opportunities(db, emp.id, user)}


@router.post("", summary="Publish a new internal opportunity (HR / Team Leader)")
async def create_opportunity(
    payload: CreateOpportunityPayload,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.role not in ("hr", "hr_admin", "sys_admin", "team_leader"):
        raise HTTPException(status_code=403, detail="Only HR and Team Leaders may publish opportunities")

    opp = InternalOpportunity(
        id=f"opp-{uuid.uuid4().hex[:8]}",
        title=payload.title,
        description=payload.description,
        type=payload.type,
        team=payload.team or "",
        team_id=payload.team_id or "",
        team_leader_name=payload.teamLeaderName or "",
        department=payload.department,
        location=payload.location,
        is_remote=payload.isRemote,
        duration=payload.duration or "",
        required_skills=payload.requiredSkills,
        preferred_skills=payload.preferredSkills,
        status="open",
        created_by=user.id,
    )
    db.add(opp)
    await db.flush()
    return {"id": opp.id, "status": "open"}


@router.post("/{opportunity_id}/interest", summary="Express interest")
async def interest(
    opportunity_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    emp = await employee_for_user(db, user)
    if not emp:
        raise HTTPException(status_code=400, detail="No employee profile linked")
    await express_interest(db, emp.id, opportunity_id)
    return {"status": "registered"}