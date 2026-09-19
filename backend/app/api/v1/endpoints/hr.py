"""
Eagle Vision — HR Module API Endpoints
All HR-specific routes served under /api/hr/
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import verify_password, create_access_token, decode_token
from app.schemas.hr_schemas import (
    LoginRequest,
    TokenResponse,
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    AnalyzeRequirementRequest,
    RequirementResponse,
    RequirementUpdateRequest,
    MatchResultResponse,
    CandidateDetailResponse,
    CompareRequest,
    CompareResponse,
    DashboardResponse,
    AnalyticsResponse,
    HRSettingsResponse,
)
from app.services.hr_service import hr_service
from app.models import User

from sqlalchemy import select

router = APIRouter()


# ─── Auth ─────────────────────────────────────────────────────────────────────

@router.post("/auth/login", response_model=TokenResponse, summary="HR Login")
async def hr_login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate HR user and return JWT."""
    q = await db.execute(select(User).where(User.email == data.email))
    user = q.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if user.role not in ("hr", "hr_admin", "sys_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. HR role required.",
        )

    token = create_access_token(
        subject=user.id,
        claims={"role": user.role, "email": user.email},
    )

    return TokenResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
    )


# ─── Dashboard ────────────────────────────────────────────────────────────────

@router.get("/dashboard", summary="HR Dashboard")
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    """Return HR dashboard KPIs, recent projects, and talent insights."""
    return await hr_service.get_dashboard(db)


# ─── Projects ─────────────────────────────────────────────────────────────────

@router.post("/projects", summary="Create Project")
async def create_project(data: ProjectCreate, db: AsyncSession = Depends(get_db)):
    """Create a new HR project."""
    project = await hr_service.create_project(db, data)
    return {
        "id": project.id,
        "name": project.name,
        "department": project.department,
        "description": project.description,
        "business_objective": project.business_objective,
        "duration_months": project.duration_months,
        "location": project.location,
        "work_mode": project.work_mode,
        "headcount": project.headcount,
        "priority": project.priority,
        "status": project.status,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
        "candidate_count": 0,
        "requirement_status": None,
    }


@router.get("/projects", summary="List Projects")
async def list_projects(db: AsyncSession = Depends(get_db)):
    """List all HR projects."""
    return await hr_service.list_projects(db)


@router.get("/projects/{project_id}", summary="Get Project")
async def get_project(project_id: str, db: AsyncSession = Depends(get_db)):
    """Get project details."""
    project = await hr_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    req = await hr_service.get_requirement_for_project(db, project_id)
    from sqlalchemy import select, func
    from app.models import MatchResult
    mc_q = await db.execute(
        select(func.count()).where(MatchResult.project_id == project_id)
    )
    mc = mc_q.scalar() or 0
    return {
        "id": project.id,
        "name": project.name,
        "department": project.department,
        "description": project.description,
        "business_objective": project.business_objective,
        "duration_months": project.duration_months,
        "location": project.location,
        "work_mode": project.work_mode,
        "headcount": project.headcount,
        "priority": project.priority,
        "status": project.status,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
        "candidate_count": mc,
        "requirement_status": req.status if req else None,
        "requirement": {
            "id": req.id,
            "project_id": req.project_id,
            "raw_description": req.raw_description,
            "status": req.status,
            "project_title": req.project_title,
            "roles": req.roles_json or [],
            "required_skills": req.required_skills_json or [],
            "preferred_skills": req.preferred_skills_json or [],
            "experience_years": req.experience_years,
            "responsibilities": req.responsibilities_json or [],
            "constraints": req.constraints_json,
            "analyzed_at": req.analyzed_at,
            "published_at": req.published_at,
            "created_at": req.created_at,
        } if req else None,
    }


@router.put("/projects/{project_id}", summary="Update Project")
async def update_project(
    project_id: str, data: ProjectUpdate, db: AsyncSession = Depends(get_db)
):
    """Update project metadata."""
    project = await hr_service.update_project(db, project_id, data)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project updated", "id": project.id}


# ─── Requirement Analysis ────────────────────────────────────────────────────

@router.post("/projects/{project_id}/analyze", summary="Analyze Requirement with AI")
async def analyze_requirement(
    project_id: str,
    data: AnalyzeRequirementRequest,
    db: AsyncSession = Depends(get_db),
):
    """Send raw requirement text to AI for structured extraction."""
    try:
        req = await hr_service.analyze_requirement(db, project_id, data)
        return {
            "id": req.id,
            "project_id": req.project_id,
            "raw_description": req.raw_description,
            "status": req.status,
            "project_title": req.project_title,
            "roles": req.roles_json or [],
            "required_skills": req.required_skills_json or [],
            "preferred_skills": req.preferred_skills_json or [],
            "experience_years": req.experience_years,
            "responsibilities": req.responsibilities_json or [],
            "constraints": req.constraints_json,
            "analyzed_at": req.analyzed_at,
            "published_at": req.published_at,
            "created_at": req.created_at,
        }
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"AI analysis temporarily unavailable. Your project data is safe. Please retry. ({type(e).__name__})"
        )


@router.put("/requirements/{requirement_id}", summary="Update Requirement")
async def update_requirement(
    requirement_id: str,
    data: RequirementUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """HR edits the AI-generated requirement."""
    req = await hr_service.update_requirement(db, requirement_id, data)
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")
    return {
        "id": req.id,
        "project_id": req.project_id,
        "raw_description": req.raw_description,
        "status": req.status,
        "project_title": req.project_title,
        "roles": req.roles_json or [],
        "required_skills": req.required_skills_json or [],
        "preferred_skills": req.preferred_skills_json or [],
        "experience_years": req.experience_years,
        "responsibilities": req.responsibilities_json or [],
        "constraints": req.constraints_json,
        "analyzed_at": req.analyzed_at,
        "published_at": req.published_at,
        "created_at": req.created_at,
    }


@router.post("/requirements/{requirement_id}/publish", summary="Publish Requirement")
async def publish_requirement(
    requirement_id: str, db: AsyncSession = Depends(get_db)
):
    """Publish the requirement (marks it as finalized by HR)."""
    req = await hr_service.publish_requirement(db, requirement_id)
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")
    return {"message": "Requirement published", "id": req.id, "status": req.status}


# ─── Talent Matching ─────────────────────────────────────────────────────────

@router.post("/projects/{project_id}/match", summary="Find Internal Talent")
async def match_talent(
    project_id: str, db: AsyncSession = Depends(get_db)
):
    """Run the hybrid matching engine for a project."""
    try:
        results = await hr_service.match_talent(db, project_id)
        return {"project_id": project_id, "candidates": results, "count": len(results)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Matching engine error: {type(e).__name__}: {str(e)[:200]}"
        )


@router.get("/projects/{project_id}/candidates", summary="Get Project Candidates")
async def get_candidates(
    project_id: str, db: AsyncSession = Depends(get_db)
):
    """Return cached match results for a project."""
    results = await hr_service.get_candidates(db, project_id)
    return {"project_id": project_id, "candidates": results, "count": len(results)}


# ─── Candidate Detail ────────────────────────────────────────────────────────

@router.get("/candidates/{employee_id}", summary="Get Candidate Detail")
async def get_candidate_detail(
    employee_id: str,
    project_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get detailed employee profile with match analysis and learning recommendations."""
    detail = await hr_service.get_candidate_detail(db, employee_id, project_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Employee not found")
    return detail


# ─── Comparison ───────────────────────────────────────────────────────────────

@router.post("/projects/{project_id}/compare", summary="Compare Candidates")
async def compare_candidates(
    project_id: str,
    data: CompareRequest,
    db: AsyncSession = Depends(get_db),
):
    """Compare selected candidates side-by-side."""
    if len(data.employee_ids) < 2:
        raise HTTPException(status_code=400, detail="Select at least 2 candidates to compare")
    result = await hr_service.compare_candidates(db, project_id, data.employee_ids)
    return result


# ─── Skill Gap ────────────────────────────────────────────────────────────────

@router.post("/projects/{project_id}/skill-gap", summary="Project Skill Gap Analysis")
async def skill_gap_analysis(
    project_id: str, db: AsyncSession = Depends(get_db)
):
    """Get aggregated skill gaps for a project across all candidates."""
    candidates = await hr_service.get_candidates(db, project_id)
    gap_counts = {}
    for c in candidates:
        for gap in c.get("skill_gaps", []):
            gap_counts[gap] = gap_counts.get(gap, 0) + 1
    return {
        "project_id": project_id,
        "total_candidates": len(candidates),
        "skill_gaps": [
            {"skill": k, "affected_candidates": v}
            for k, v in sorted(gap_counts.items(), key=lambda x: -x[1])
        ],
    }


# ─── Learning ─────────────────────────────────────────────────────────────────

@router.get("/learning", summary="Get Learning Resources")
async def get_learning_resources(
    skill: Optional[str] = None, db: AsyncSession = Depends(get_db)
):
    """Get learning resources, optionally filtered by skill."""
    return await hr_service.get_learning_resources(db, skill)


# ─── Analytics ────────────────────────────────────────────────────────────────

@router.get("/analytics", summary="HR Analytics")
async def get_analytics(db: AsyncSession = Depends(get_db)):
    """Get HR workforce analytics."""
    return await hr_service.get_analytics(db)


# ─── Settings ─────────────────────────────────────────────────────────────────

@router.get("/settings", summary="HR Settings")
async def get_settings():
    """Get current HR module configuration."""
    return hr_service.get_settings()
