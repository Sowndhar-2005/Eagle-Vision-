"""
Eagle Vision — Development Request Endpoints (employee initiated)
"""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models import Employee
from app.models.portal import EmployeeRequest, Notification
from app.models.user import User
from app.services.portal_service import (
    list_applicable_requests, request_dict, employee_for_user,
    is_hr, team_led_by,
)

router = APIRouter()


class CreateRequestPayload(BaseModel):
    type: str  # course | project
    targetTitle: str
    targetId: Optional[str] = ""
    reason: Optional[str] = ""
    desiredRoleOrSkill: Optional[str] = ""
    expectedBenefit: Optional[str] = ""


@router.get("", summary="My requests")
async def my_requests(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"items": await list_applicable_requests(db, user)}


@router.post("", summary="Submit a development request to my Team Leader")
async def create_request(
    payload: CreateRequestPayload,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    emp = await employee_for_user(db, user)
    if not emp:
        raise HTTPException(status_code=400, detail="No employee profile linked")

    from app.models.portal import Team
    team = None
    if emp.team_id:
        team = (await db.execute(select(Team).where(Team.id == emp.team_id))).scalar_one_or_none()

    req = EmployeeRequest(
        id=f"req-{uuid.uuid4().hex[:8]}",
        type=payload.type,
        requester_id=emp.id,
        requester_name=f"{emp.first_name} {emp.last_name}",
        requester_avatar=emp.avatar,
        requester_role=emp.job_title,
        requester_team_id=emp.team_id or "",
        requester_team_name=team.name if team else "Unassigned",
        target_id=payload.targetId or "",
        target_title=payload.targetTitle,
        reason=payload.reason,
        desired_role_or_skill=payload.desiredRoleOrSkill,
        expected_benefit=payload.expectedBenefit,
        status="pending",
    )
    db.add(req)

    # Notify the team leader
    if team and team.leader_id:
        tl_emp = (await db.execute(select(Employee).where(Employee.id == team.leader_id))).scalar_one_or_none()
        if tl_emp:
            db.add(Notification(
                user_id=tl_emp.user_id,
                title="New Request",
                message=f"{req.requester_name} requested approval for \"{payload.targetTitle}\".",
                type="system", action_url="/tl/requests",
            ))
    await db.flush()
    return request_dict(req)