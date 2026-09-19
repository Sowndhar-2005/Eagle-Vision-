"""
Eagle Vision — Team Leader Workspace Endpoints
Team overview, member profiles, project staffing, and 20% gig management.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user, require_hr
from app.models.portal import Team, Project, ProjectMember, Notification, EmployeeRequest
from app.models import Employee
from app.models.user import User
from app.services.portal_service import (
    build_profile_dict, employee_for_user, is_hr, team_led_by,
    team_overview, list_portal_projects, _project_dict, can_view_employee,
)

router = APIRouter()


class CreateProjectPayload(BaseModel):
    name: str
    description: Optional[str] = ""
    status: Optional[str] = "planning"
    duration: Optional[str] = ""
    startDate: Optional[str] = ""
    endDate: Optional[str] = ""
    requiredSkills: list = []
    preferredSkills: list = []
    availableRoles: list = []
    openPositionsCount: int = 0


class AddMemberPayload(BaseModel):
    employeeId: str
    role: str
    allocation: str = "20% Gig"


@router.get("/me", summary="My team overview (Team Leader / HR)")
async def my_team(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await team_overview(db, user)


@router.get("/me/members", summary="My team members (full profiles)")
async def my_team_members(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    overview = await team_overview(db, user)
    if is_hr(user):
        all_members = []
        for t in overview["teams"]:
            all_members.extend(t["members"])
        return {"items": all_members}
    team = overview["teams"][0]
    return {"items": team["members"]}


@router.get("/me/employees/{employee_id}", summary="View a member's full profile")
async def view_member_profile(
    employee_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = q.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    if not can_view_employee(user, emp):
        raise HTTPException(status_code=403, detail="Not authorized to view this employee")
    return await build_profile_dict(db, emp, user)


@router.get("/projects", summary="Company projects (Team Leader / HR)")
async def projects(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"items": await list_portal_projects(db, user)}


@router.post("/projects", summary="Create / publish a project for internal staffing")
async def create_project(
    payload: CreateProjectPayload,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.role not in ("team_leader", "hr", "hr_admin", "sys_admin"):
        raise HTTPException(status_code=403, detail="Only Team Leaders and HR can create projects")

    emp = await employee_for_user(db, user) if not is_hr(user) else None
    team = await team_led_by(db, emp) if (emp and not is_hr(user)) else None
    team_id = team.id if team else (emp.team_id if emp else "")
    team_name = team.name if team else ""

    proj = Project(
        name=payload.name,
        description=payload.description,
        team_id=team_id,
        team_name=team_name,
        team_leader_id=user.id,
        team_leader_name=user.full_name,
        status=payload.status or "planning",
        duration=payload.duration or "",
        start_date=payload.startDate,
        end_date=payload.endDate,
        required_skills=payload.requiredSkills,
        preferred_skills=payload.preferredSkills,
        available_roles=payload.availableRoles,
        open_positions_count=payload.openPositionsCount,
    )
    db.add(proj)
    await db.flush()

    # Invite the creating Team Leader as a member
    if emp:
        db.add(ProjectMember(project_id=proj.id, employee_id=emp.id, name=user.full_name,
                             role="Project Lead", avatar=emp.avatar, allocation="20%"))
    await db.flush()
    return await _project_dict(db, proj)


@router.post("/projects/{project_id}/members", summary="Assign an employee to a project")
async def add_project_member(
    project_id: str,
    payload: AddMemberPayload,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    req = await _authorize_project_staffing(db, user, project_id)

    q = await db.execute(
        select(ProjectMember).where(ProjectMember.project_id == project_id,
                                    ProjectMember.employee_id == payload.employeeId)
    )
    existing = q.scalar_one_or_none()
    if not existing:
        emp = (await db.execute(select(Employee).where(Employee.id == payload.employeeId))).scalar_one_or_none()
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found")
        pr = req
        pr.open_positions_count = max(0, (pr.open_positions_count or 0) - 1)
        db.add(ProjectMember(
            project_id=project_id, employee_id=payload.employeeId,
            name=f"{emp.first_name} {emp.last_name}", role=payload.role,
            avatar=emp.avatar, allocation=payload.allocation,
        ))
        db.add(Notification(
            user_id=emp.user_id,
            title="Added to Project",
            message=f"You were invited to join \"{pr.name}\" as {payload.role}.",
            type="new_project_invite", action_url="/projects",
        ))
        await db.flush()
    return await _project_dict(db, req)


@router.delete("/projects/{project_id}/members/{employee_id}", summary="Remove an employee from a project")
async def remove_project_member(
    project_id: str,
    employee_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    req = await _authorize_project_staffing(db, user, project_id)
    q = await db.execute(
        select(ProjectMember).where(ProjectMember.project_id == project_id,
                                    ProjectMember.employee_id == employee_id)
    )
    pm = q.scalar_one_or_none()
    if pm:
        req.open_positions_count = (req.open_positions_count or 0) + 1
        await db.delete(pm)
        await db.flush()
    return await _project_dict(db, req)


# --- Request approvals (Team Leader) ---------------------------------------

class ReviewRequestPayload(BaseModel):
    status: str  # approved | rejected
    reviewerNotes: Optional[str] = None


@router.get("/requests", summary="Requests pending my team's review")
async def team_requests(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    from app.services.portal_service import list_applicable_requests
    return {"items": await list_applicable_requests(db, user)}


@router.patch("/requests/{request_id}", summary="Approve / reject a development request")
async def review_request(
    request_id: str,
    payload: ReviewRequestPayload,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.services.portal_service import can_review_request, request_dict
    q = await db.execute(select(EmployeeRequest).where(EmployeeRequest.id == request_id))
    req = q.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if not await can_review_request(db, user, req):
        raise HTTPException(status_code=403, detail="You are not authorized to review this request")

    req.status = payload.status
    req.reviewed_by = user.full_name or user.email
    req.reviewer_notes = payload.reviewerNotes or ("Approved by Team Leader" if payload.status == "approved" else "Declined at this time")

    existing_emp = (await db.execute(select(Employee).where(Employee.id == req.requester_id))).scalar_one_or_none()
    recipient = existing_emp.user_id if existing_emp else None
    if recipient:
        db.add(Notification(
            user_id=recipient,
            title="Request Approved" if payload.status == "approved" else "Request Declined",
            message=f"Your request for \"{req.target_title}\" was {payload.status}.",
            type="request_approved" if payload.status == "approved" else "request_rejected",
            action_url="/requests",
        ))
    await db.flush()
    return request_dict(req)


async def _authorize_project_staffing(db, user, project_id):
    q = await db.execute(select(Project).where(Project.id == project_id))
    req = q.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Project not found")
    if is_hr(user):
        return req
    emp = await employee_for_user(db, user)
    team = await team_led_by(db, emp) if emp else None
    if not (emp and team and req.team_id == team.id):
        raise HTTPException(status_code=403, detail="You can only staff your own team's projects")
    return req