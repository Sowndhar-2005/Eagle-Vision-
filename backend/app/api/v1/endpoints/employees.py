"""
Eagle Vision — Employee Portal Endpoints
Employees view and evolve their own living profile; Team Leaders / HR read members.
"""

import json
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user, require_hr
from app.models.user import User
from app.models import Employee, EmployeeSkill, Skill, DevelopingSkill, WorkExperience, CurrentWork, CareerGoal, Project
from app.services.portal_service import (
    build_profile_dict, compute_skill_gaps, employee_for_user, express_interest,
    learning_recommendations, list_employee_profiles, list_opportunities,
    can_view_employee, _emp_number,
)

router = APIRouter()


# ---------------------------------------------------------------------------
# Payloads
# ---------------------------------------------------------------------------

class UpdateProfilePayload(BaseModel):
    professionalSummary: Optional[str] = None
    location: Optional[str] = None
    title: Optional[str] = None


class SkillPayload(BaseModel):
    name: str
    proficiency: int = Field(3, ge=1, le=5)
    yearsOfExperience: float = 0
    evidence: Optional[str] = None
    isVerified: bool = True


class DevelopingSkillPayload(BaseModel):
    name: str
    category: Optional[str] = "Career Development"
    status: Optional[str] = "Learning"
    progressPercentage: int = 0
    targetRoleRelevance: Optional[str] = ""
    associatedCourseOrGig: Optional[str] = None


class ExperiencePayload(BaseModel):
    company: str
    role: str
    team: Optional[str] = ""
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    responsibilities: list = []
    skillsUsed: list = []


class ProjectPayload(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = ""
    role: Optional[str] = ""
    team: Optional[str] = ""
    technologies: list = []
    responsibilities: list = []
    startDate: Optional[str] = ""
    endDate: Optional[str] = ""
    status: Optional[str] = "completed"
    skillsDemonstrated: list = []


class CurrentWorkPayload(BaseModel):
    projectName: str
    role: str
    team: Optional[str] = ""
    teamLeaderName: Optional[str] = ""
    sprintPeriod: Optional[str] = ""
    status: Optional[str] = "active"
    responsibilities: list = []
    currentTasks: list = []
    skillsBeingUsed: list = []
    skillsCurrentlyDeveloping: list = []
    blockers: Optional[str] = None


class CareerPayload(BaseModel):
    targetRole: Optional[str] = None
    readinessScore: Optional[int] = None
    strongSkills: list = []
    developingSkills: list = []
    missingSkills: list = []
    openToGigs: Optional[bool] = None
    openToTransfer: Optional[bool] = None
    openToMentorship: Optional[bool] = None
    preferredRoles: list = []
    remotePreference: Optional[str] = "hybrid"


class InterestPayload(BaseModel):
    message: Optional[str] = None


class GapAnalysisPayload(BaseModel):
    targetRole: Optional[str] = None


async def _own_employee(db: AsyncSession, user: User) -> Employee:
    emp = await employee_for_user(db, user)
    if not emp:
        raise HTTPException(status_code=404, detail="No employee profile linked to this account")
    return emp


async def _find_skill(db: AsyncSession, name: str) -> Optional[Skill]:
    q = await db.execute(select(Skill).where(Skill.name.ilike(name)))
    return q.scalar_one_or_none()


def build_user_row(u: User) -> dict:
    return {
        "id": u.id, "email": u.email, "name": u.full_name,
        "role": u.role, "is_active": u.is_active,
    }


# ---------------------------------------------------------------------------
# Listing & soeking (RBAC enforced)
# ---------------------------------------------------------------------------

@router.get("", summary="List Employees (role-scoped)")
async def list_employees(
    team_id: Optional[str] = None,
    q: Optional[str] = Query(None, description="Search name/title"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    items = await list_employee_profiles(db, user, team_id=team_id, query=q)
    return {"items": items, "total": len(items)}


@router.get("/directory", summary="Login directory (employees + team leaders)")
async def directory_profiles(db: AsyncSession = Depends(get_db)):
    """Public-safe directory used by the login screen. Contains no credentials."""
    from app.models import Employee
    q = await db.execute(select(Employee).order_by(Employee.first_name))
    rows = list(q.scalars().all())
    items = []
    for e in rows:
        items.append({
            "id": e.id,
            "name": f"{e.first_name} {e.last_name}",
            "email": f"{e.first_name.lower()}.{e.last_name.lower()}@eaglevision.ai",
            "avatar": e.avatar,
            "title": e.job_title,
            "teamName": await _team_name(db, e.team_id),
            "personaType": e.persona or "growth_employee",
            "teamId": e.team_id,
        })
    return {"items": items}


async def _team_name(db: AsyncSession, team_id: Optional[str]) -> str:
    if not team_id:
        return "Unassigned"
    from app.models.portal import Team
    q = await db.execute(select(Team).where(Team.id == team_id))
    t = q.scalar_one_or_none()
    return t.name if t else "Unassigned"


@router.get("/me", summary="My Full Profile")
async def my_profile(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    emp = await _own_employee(db, user)
    return await build_profile_dict(db, emp, user)


@router.get("/me/skill-gaps", summary="My Skill Gaps")
async def my_skill_gaps(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    emp = await _own_employee(db, user)
    gaps = await compute_skill_gaps(db, emp.id)
    return {"items": gaps, "source": "rule-based"}


@router.post("/me/skill-gaps/analyze", summary="Analyze gaps toward a target role")
async def analyze_skill_gaps(
    payload: GapAnalysisPayload,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    emp = await _own_employee(db, user)
    gaps = await compute_skill_gaps(db, emp.id, target_role=payload.targetRole)
    return {"items": gaps, "targetRole": payload.targetRole, "source": "rule-based"}


@router.get("/me/learning-recommendations", summary="Recommended courses for my gaps")
async def my_learning_recommendations(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    emp = await _own_employee(db, user)
    return {"items": await learning_recommendations(db, emp.id)}


@router.get("/me/opportunities", summary="My matched opportunities (genuine match scores)")
async def my_opportunities(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    emp = await _own_employee(db, user)
    return {"items": await list_opportunities(db, emp.id, user)}


@router.post("/me/opportunities/{opportunity_id}/interest", summary="Express interest in an opportunity")
async def opt_in_opportunity(
    opportunity_id: str,
    _payload: InterestPayload,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    emp = await _own_employee(db, user)
    eoi = await express_interest(db, emp.id, opportunity_id)
    return {"status": "registered", "id": eoi.id}


@router.get("/{employee_id}", summary="Get Employee Profile (authorized)")
async def get_employee(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = q.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    if not can_view_employee(user, emp):
        raise HTTPException(status_code=403, detail="You do not have access to this employee profile")
    return await build_profile_dict(db, emp, user)


# ---------------------------------------------------------------------------
# Profile mutations (self-service)
# ---------------------------------------------------------------------------

@router.put("/me/profile", summary="Update my professional summary / basics")
async def update_profile(
    payload: UpdateProfilePayload,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    emp = await _own_employee(db, user)
    if payload.professionalSummary is not None:
        emp.professional_summary = payload.professionalSummary
    if payload.location is not None:
        emp.location = payload.location
    if payload.title is not None:
        emp.job_title = payload.title
    await db.flush()
    return await build_profile_dict(db, emp, user)


@router.post("/me/skills", summary="Add / update a verified skill on my profile")
async def add_skill(
    payload: SkillPayload,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    emp = await _own_employee(db, user)
    skill = await _find_skill(db, payload.name)
    if not skill:
        skill = Skill(id=str(uuid.uuid4()), name=payload.name,
                      category_id="cat-backend", skill_type="technical")
        db.add(skill)
        await db.flush()

    q = await db.execute(
        select(EmployeeSkill).where(EmployeeSkill.employee_id == emp.id,
                                    EmployeeSkill.skill_id == skill.id)
    )
    es = q.scalar_one_or_none()
    if es:
        es.proficiency_level = payload.proficiency
        es.years_of_experience = payload.yearsOfExperience
        es.evidence = payload.evidence
        es.is_verified = payload.isVerified
    else:
        es = EmployeeSkill(employee_id=emp.id, skill_id=skill.id,
                           proficiency_level=payload.proficiency,
                           years_of_experience=payload.yearsOfExperience,
                           evidence=payload.evidence, is_verified=payload.isVerified)
        db.add(es)
    await db.flush()
    return await build_profile_dict(db, emp, user)


@router.delete("/me/skills/{skill_id}", summary="Remove a skill from my profile")
async def remove_skill(
    skill_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    emp = await _own_employee(db, user)
    q = await db.execute(
        select(EmployeeSkill).where(EmployeeSkill.id == skill_id,
                                    EmployeeSkill.employee_id == emp.id)
    )
    es = q.scalar_one_or_none()
    if es:
        await db.delete(es)
        await db.flush()
    return await build_profile_dict(db, emp, user)


@router.post("/me/developing-skills", summary="Add a developing skill goal")
async def add_developing_skill(
    payload: DevelopingSkillPayload,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    emp = await _own_employee(db, user)
    q = await db.execute(
        select(DevelopingSkill).where(DevelopingSkill.employee_id == emp.id,
                                      DevelopingSkill.name.ilike(payload.name))
    )
    ds = q.scalar_one_or_none()
    if ds:
        ds.status = payload.status or ds.status
        ds.progress_percentage = payload.progressPercentage
        ds.target_role_relevance = payload.targetRoleRelevance or ""
    else:
        ds = DevelopingSkill(employee_id=emp.id, name=payload.name,
                             category=payload.category, status=payload.status,
                             progress_percentage=payload.progressPercentage,
                             target_role_relevance=payload.targetRoleRelevance or "",
                             associated_course_or_gig=payload.associatedCourseOrGig)
        db.add(ds)
    await db.flush()
    return await build_profile_dict(db, emp, user)


@router.delete("/me/developing-skills/{dev_skill_id}", summary="Remove a developing skill goal")
async def remove_developing_skill(
    dev_skill_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    emp = await _own_employee(db, user)
    q = await db.execute(
        select(DevelopingSkill).where(DevelopingSkill.id == dev_skill_id,
                                      DevelopingSkill.employee_id == emp.id)
    )
    ds = q.scalar_one_or_none()
    if ds:
        await db.delete(ds)
        await db.flush()
    return await build_profile_dict(db, emp, user)


@router.post("/me/experience", summary="Add a work experience entry")
async def add_experience(
    payload: ExperiencePayload,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from datetime import date
    emp = await _own_employee(db, user)

    def _parse(v: Optional[str]):
        if not v:
            return None
        try:
            return date.fromisoformat(v)
        except ValueError:
            return None

    we = WorkExperience(
        employee_id=emp.id, company_name=payload.company, title=payload.role,
        description=" • ".join(payload.responsibilities) if payload.responsibilities else "",
        start_date=_parse(payload.startDate), end_date=_parse(payload.endDate),
        is_current=payload.endDate in (None, "", "Present"),
    )
    db.add(we)
    await db.flush()
    return await build_profile_dict(db, emp, user)


@router.post("/me/projects", summary="Add / update an authored project on my profile")
async def add_project(
    payload: ProjectPayload,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    emp = await _own_employee(db, user)
    authored = []
    if emp.project_history_json:
        try:
            authored = json.loads(emp.project_history_json)
        except (json.JSONDecodeError, TypeError):
            authored = []

    project = payload.model_dump()
    if payload.id:
        project["id"] = payload.id
    else:
        project["id"] = f"authproj-{uuid.uuid4().hex[:8]}"

    exists = next((i for i, p in enumerate(authored) if p.get("id") == project["id"]), None)
    if exists is not None:
        authored[exists] = project
    else:
        authored = [project, *authored]

    emp.project_history_json = json.dumps(authored)
    await db.flush()
    return await build_profile_dict(db, emp, user)


@router.put("/me/current-work", summary="Update my current sprint work")
async def update_current_work(
    payload: CurrentWorkPayload,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    emp = await _own_employee(db, user)
    q = await db.execute(select(CurrentWork).where(CurrentWork.employee_id == emp.id))
    cw = q.scalar_one_or_none()
    if not cw:
        cw = CurrentWork(employee_id=emp.id)
        db.add(cw)
    cw.project_name = payload.projectName
    cw.role = payload.role
    cw.team = payload.team or ""
    cw.team_leader_name = payload.teamLeaderName or ""
    cw.sprint_period = payload.sprintPeriod or ""
    cw.status = payload.status or "active"
    cw.responsibilities = payload.responsibilities
    cw.current_tasks = payload.currentTasks
    cw.skills_being_used = payload.skillsBeingUsed
    cw.skills_currently_developing = payload.skillsCurrentlyDeveloping
    cw.blockers = payload.blockers
    await db.flush()
    return await build_profile_dict(db, emp, user)


@router.put("/me/career", summary="Update my career goals and mobility preferences")
async def update_career(
    payload: CareerPayload,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    emp = await _own_employee(db, user)
    q = await db.execute(select(CareerGoal).where(CareerGoal.employee_id == emp.id))
    goal = q.scalar_one_or_none()
    if not goal:
        goal = CareerGoal(employee_id=emp.id, current_role=emp.job_title, target_role=payload.targetRole or "")
        db.add(goal)
    if payload.targetRole is not None:
        goal.target_role = payload.targetRole
    if payload.readinessScore is not None:
        goal.readiness_score = payload.readinessScore
    if payload.strongSkills:
        goal.strong_skills = payload.strongSkills
    if payload.developingSkills:
        goal.developing_skills = payload.developingSkills
    if payload.missingSkills:
        goal.missing_skills = payload.missingSkills
    if payload.openToGigs is not None:
        goal.open_to_gigs = payload.openToGigs
    if payload.openToTransfer is not None:
        goal.open_to_transfer = payload.openToTransfer
    if payload.openToMentorship is not None:
        goal.open_to_mentorship = payload.openToMentorship
    if payload.preferredRoles:
        goal.preferred_roles = payload.preferredRoles
    if payload.remotePreference is not None:
        goal.remote_preference = payload.remotePreference
    await db.flush()
    return await build_profile_dict(db, emp, user)


# ---------------------------------------------------------------------------
# Admin helper (used by auth to list users)
# ---------------------------------------------------------------------------