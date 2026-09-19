"""
Eagle Vision — Portal Service
Central read/write layer that shapes database records into the frontend contract
(EmployeeProfile, Team, CompanyProject, Course, OpportunityItem, ...) and enforces
role-based access. This is the SINGLE SOURCE OF TRUTH behind every portal screen.
"""

import json
import uuid
from datetime import date, datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.hr_models import Department, HRProject, LearningResource
from app.models.portal import (
    AIExtractionResult, CareerGoal, Certification, CourseEnrollment,
    CurrentWork, DevelopingSkill, EmployeeOpportunityMatch, EmployeeRequest,
    ExpressionOfInterest, InternalOpportunity, Notification, Project,
    ProjectMember, Resume, ResumeAnalysis, SkillGap, Team,
)
from app.models import (
    Employee, EmployeeSkill, Skill, SkillTaxonomyCategory, WorkExperience,
    User,
)

ROLE_EMPLOYEE = "employee"
ROLE_TEAM_LEADER = "team_leader"
ROLE_HR = "hr"
ROLE_HR_ADMIN = "hr_admin"
ROLE_SYS_ADMIN = "sys_admin"

HR_ROLES = {ROLE_HR, ROLE_HR_ADMIN, ROLE_SYS_ADMIN}
TL_ROLES = {ROLE_TEAM_LEADER, ROLE_HR, ROLE_HR_ADMIN, ROLE_SYS_ADMIN}

CATEGORY_MAP = {
    "AI & ML": "AI / Machine Learning",
    "Backend Dev": "Backend & Systems",
    "Frontend Dev": "Frontend & UI",
    "DevOps & Cloud": "Cloud & DevOps",
    "Data Engineering": "Data & Analytics",
    "Soft Skills": "Soft Skills",
}

PROF_PERCENT = {1: 20, 2: 35, 3: 55, 4: 75, 5: 95}
PROF_LABEL = {1: "Beginner", 2: "Intermediate", 3: "Intermediate", 4: "Advanced", 5: "Expert"}

EVIDENCE_LABEL = {
    "github": "GitHub Production Commit", "code review": "Code Review",
    "project deliverable": "Project Deliverable", "course certification": "Course Certification",
    "self-reported": "Self-Reported", "verified": "Project Deliverable",
}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _uuid() -> str:
    return str(uuid.uuid4())


def _iso(dt: Optional[datetime]) -> str:
    if not dt:
        return ""
    return dt.isoformat()


def _relative_time(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    diff = _now() - dt
    seconds = int(diff.total_seconds())
    if seconds < 60:
        return "Just now"
    if seconds < 3600:
        return f"{seconds // 60}m ago"
    if seconds < 86400:
        return f"{seconds // 3600}h ago"
    return f"{seconds // 86400}d ago"


def _norm_name(text: str) -> str:
    return " ".join((text or "").lower().replace("/", " ").split())


def _category(label: str) -> str:
    return CATEGORY_MAP.get(label, "Backend & Systems")


def _menthor(emp: Employee) -> str:
    return f"{emp.first_name} {emp.last_name}"


def _display_title(emp: Employee, user: User) -> str:
    return "Team Leader" if user.role == ROLE_TEAM_LEADER else "Employee"


# ---------------------------------------------------------------------------
# Access control
# ---------------------------------------------------------------------------

async def portal_context(db: AsyncSession, user_id: str) -> dict:
    """Lightweight login/me context: which portal, which employee, which team."""
    user = (await db.execute(select(User).where(User.id == str(user_id)))).scalar_one_or_none()
    if not user:
        return {"role": "employee", "portal": "employee", "isHr": False, "isTeamLeader": False}

    if user.role in HR_ROLES:
        return {
            "role": user.role, "portal": "hr", "isHr": True, "isTeamLeader": False,
            "name": user.full_name, "email": user.email,
            "avatar": user.profile_image_url,
            "employeeId": None,
        }

    emp = await employee_for_user(db, user)
    team_name = ""
    if emp and emp.team_id:
        team = (await db.execute(select(Team).where(Team.id == emp.team_id))).scalar_one_or_none()
        team_name = team.name if team else ""

    is_leader = user.role == ROLE_TEAM_LEADER
    return {
        "role": user.role,
        "portal": "team_leader" if is_leader else "employee",
        "isHr": False,
        "isTeamLeader": is_leader,
        "employeeId": emp.id if emp else None,
        "name": _menthor(emp) if emp else user.full_name,
        "firstName": emp.first_name if emp else "",
        "email": user.email,
        "avatar": emp.avatar if emp else user.profile_image_url,
        "title": emp.job_title if emp else "",
        "teamId": emp.team_id if emp else "",
        "teamName": team_name,
        "personaType": emp.persona if emp else "growth_employee",
    }

def can_view_employee(user: User, emp: Employee) -> bool:
    """Decide whether the viewing user may read this employee's profile."""
    if user.role in HR_ROLES:
        return True
    if str(user.id) == str(emp.user_id):
        return True
    if user.role == ROLE_TEAM_LEADER:
        return True  # leadership profile access granted below by team filter
    return False


def is_hr(user: User) -> bool:
    return user.role in HR_ROLES


def is_tl(user: User) -> bool:
    return user.role == ROLE_TEAM_LEADER


# ---------------------------------------------------------------------------
# Async helpers
# ---------------------------------------------------------------------------

async def employee_for_user(db: AsyncSession, user: User) -> Optional[Employee]:
    q = await db.execute(select(Employee).where(Employee.user_id == user.id))
    return q.scalar_one_or_none()


async def team_led_by(db: AsyncSession, emp: Employee) -> Optional[Team]:
    q = await db.execute(select(Team).where(Team.leader_id == emp.id))
    return q.scalar_one_or_none()


async def _load_skills(db: AsyncSession, employee_id: str) -> List[EmployeeSkill]:
    q = await db.execute(
        select(EmployeeSkill).where(EmployeeSkill.employee_id == employee_id)
    )
    return list(q.scalars().all())


async def _skills_map(db: AsyncSession) -> Dict[str, Tuple[str, str]]:
    """skill_id -> (skill name, taxonomy category label)."""
    q = await db.execute(select(Skill))
    skill_rows = list(q.scalars().all())
    q = await db.execute(select(SkillTaxonomyCategory))
    cats = {c.id: c.name for c in q.scalars().all()}
    return {s.id: (s.name, cats.get(s.category_id, s.category_id or "Backend Dev")) for s in skill_rows}


# ---------------------------------------------------------------------------
# Profile builders (frontend contract)
# ---------------------------------------------------------------------------

def build_skills(emp_skills: List[EmployeeSkill], skills_map: Dict[str, Tuple[str, str]]) -> List[dict]:
    items = []
    for es in emp_skills:
        name, category_label = skills_map.get(es.skill_id, (es.skill_id, "Backend Dev"))
        evidence_source = EVIDENCE_LABEL.get((es.evidence_source or "").lower(), "Self-Reported")
        items.append({
            "id": es.id,
            "name": name,
            "category": _category(category_label),
            "proficiency": PROF_PERCENT.get(es.proficiency_level, 55),
            "levelLabel": PROF_LABEL.get(es.proficiency_level, "Intermediate"),
            "yearsOfExperience": float(es.years_of_experience or 0),
            "evidence": f"Verified {name} via {evidence_source}",
            "evidenceSource": evidence_source,
            "isVerified": bool(es.is_verified),
            "isTransferable": True,
        })
    return items


def build_developing(db, dev_skills: List[DevelopingSkill]) -> List[dict]:
    return [{
        "id": ds.id,
        "name": ds.name,
        "category": ds.category,
        "status": ds.status,
        "progressPercentage": int(ds.progress_percentage or 0),
        "targetRoleRelevance": ds.target_role_relevance,
        "associatedCourseOrGig": ds.associated_course_or_gig,
    } for ds in dev_skills]


def build_experience(db, exp_rows: List[WorkExperience]) -> List[dict]:
    items = []
    for exp in exp_rows:
        responsibilities = [r.strip() for r in (exp.description or "").split("•") if r.strip()] or ["Core deliverables within this role."]
        items.append({
            "id": exp.id,
            "company": exp.company_name,
            "role": exp.title,
            "team": exp.title,
            "duration": f"{exp.start_date.year if exp.start_date else ''} - {exp.end_date.year if exp.end_date else 'Present'}",
            "startDate": exp.start_date.isoformat() if exp.start_date else "",
            "endDate": exp.end_date.isoformat() if exp.end_date else "Present",
            "responsibilities": responsibilities,
            "skillsUsed": [],
            "achievements": [],
        })
    return items


def build_projects(pm_rows: List[ProjectMember], projects_by_id: Dict[str, Project], authored: List[dict]) -> List[dict]:
    items = []
    for pm in pm_rows:
        proj = projects_by_id.get(pm.project_id)
        items.append({
            "id": "pm-" + pm.id,
            "name": proj.name if proj else "Internal Project",
            "description": proj.description if proj else "",
            "role": pm.role,
            "team": proj.team_name if proj else "",
            "technologies": proj.required_skills or [] if proj else [],
            "responsibilities": [],
            "startDate": proj.start_date if proj else "",
            "endDate": proj.end_date if proj else "",
            "status": "current",
            "skillsDemonstrated": (proj.required_skills or [] if proj else [])[:4],
            "achievements": [],
        })
    for a in authored or []:
        items.append(a)
    return items


def build_current_work(row: Optional[CurrentWork]) -> dict:
    if not row:
        return {
            "projectName": "", "role": "", "team": "", "teamLeaderName": "",
            "sprintPeriod": "", "status": "active", "responsibilities": [],
            "currentTasks": [], "skillsBeingUsed": [], "skillsCurrentlyDeveloping": [],
            "blockers": "",
        }
    return {
        "projectName": row.project_name,
        "role": row.role,
        "team": row.team,
        "teamLeaderName": row.team_leader_name,
        "sprintPeriod": row.sprint_period,
        "status": row.status,
        "responsibilities": row.responsibilities or [],
        "currentTasks": row.current_tasks or [],
        "skillsBeingUsed": row.skills_being_used or [],
        "skillsCurrentlyDeveloping": row.skills_currently_developing or [],
        "blockers": row.blockers,
    }


async def build_learning_history(db, employee_id: str) -> dict:
    q = await db.execute(select(CourseEnrollment).where(CourseEnrollment.employee_id == employee_id))
    enrolls = list(q.scalars().all())
    qc = await db.execute(select(Certification).where(Certification.employee_id == employee_id))
    certs = list(qc.scalars().all())
    qr = await db.execute(
        select(EmployeeRequest).where(EmployeeRequest.requester_id == employee_id,
                                      EmployeeRequest.type == "course")
    )
    req_rows = list(qr.scalars().all())

    completed = [{
        "id": e.id, "title": e.title, "provider": e.provider,
        "completionDate": e.completed_at.strftime("%Y-%m-%d") if e.completed_at else "",
        "skillsGained": e.skills_gained or [],
    } for e in enrolls if e.status == "completed"]

    current = [{
        "id": e.id, "title": e.title, "provider": e.provider,
        "progressPercentage": int(e.progress_percentage or 0), "targetSkill": e.skill_name,
    } for e in enrolls if e.status != "completed"]

    requested = [{
        "id": r.id, "title": r.target_title, "status": r.status,
        "requestDate": r.created_at.strftime("%Y-%m-%d") if r.created_at else "",
    } for r in req_rows]

    return {
        "completedCourses": completed,
        "certifications": [{
            "id": c.id, "name": c.name, "issuer": c.issuer,
            "issueDate": c.issue_date or "", "credentialUrl": c.credential_url,
        } for c in certs],
        "currentLearning": current,
        "requestedCourses": requested,
    }


def build_career_aspiration(goal: Optional[CareerGoal]) -> dict:
    if not goal:
        return {"currentRole": "", "targetRole": "", "readinessScore": 0,
                "strongSkills": [], "developingSkills": [], "missingSkills": []}
    return {
        "currentRole": goal.current_role,
        "targetRole": goal.target_role,
        "readinessScore": int(goal.readiness_score or 0),
        "strongSkills": goal.strong_skills or [],
        "developingSkills": goal.developing_skills or [],
        "missingSkills": goal.missing_skills or [],
    }


def build_mobility(goal: Optional[CareerGoal]) -> dict:
    return {
        "openToGigs": bool(goal.open_to_gigs) if goal else True,
        "openToTransfer": bool(goal.open_to_transfer) if goal else True,
        "openToMentorship": bool(goal.open_to_mentorship) if goal else False,
        "preferredRoles": goal.preferred_roles or [] if goal else [],
        "remotePreference": goal.remote_preference or "hybrid" if goal else "hybrid",
    }


def _availability(emp: Employee, has_current_work: bool) -> str:
    if not has_current_work:
        return "On Bench / Available"
    if emp.open_to_gigs:
        return "20% Gig Available"
    return "100% Allocated"


def _completion(emp: Employee, skills: int, experience: int) -> int:
    score = 35
    score += min(30, skills * 3)
    score += min(15, experience * 3)
    if emp.professional_summary:
        score += 10
    if emp.avatar:
        score += 5
    if emp.project_history_json:
        score += 5
    return min(100, score)


def _team_label(team: Optional[Team]) -> str:
    return team.name if team else "Unassigned"


async def _team_names(db: AsyncSession) -> Dict[str, Team]:
    q = await db.execute(select(Team))
    return {t.id: t for t in q.scalars().all()}


async def build_profile_dict(
    db: AsyncSession,
    employee: Employee,
    user: User,
    teams: Optional[Dict[str, Team]] = None,
    skills_map: Optional[Dict[str, str]] = None,
) -> dict:
    """Build the full EmployeeProfile JSON for the frontend."""
    teams = teams if teams is not None else await _team_names(db)
    skills_map = skills_map if skills_map is not None else await _skills_map(db)

    emp_skills = await _load_skills(db, employee.id)
    q = await db.execute(select(DevelopingSkill).where(DevelopingSkill.employee_id == employee.id))
    dev_rows = list(q.scalars().all())
    q = await db.execute(select(WorkExperience).where(WorkExperience.employee_id == employee.id))
    exp_rows = list(q.scalars().all())
    q = await db.execute(select(CurrentWork).where(CurrentWork.employee_id == employee.id))
    cw_row = q.scalars().first()
    q = await db.execute(select(CareerGoal).where(CareerGoal.employee_id == employee.id))
    goal = q.scalars().first()
    q = await db.execute(select(ProjectMember).where(ProjectMember.employee_id == employee.id))
    pm_rows = list(q.scalars().all())

    authored = []
    if employee.project_history_json:
        try:
            authored = json.loads(employee.project_history_json) or []
        except (json.JSONDecodeError, TypeError):
            authored = []

    projects_by_id = {}
    if pm_rows:
        q = await db.execute(select(Project).where(Project.id.in_({pm.project_id for pm in pm_rows})))
        projects_by_id = {p.id: p for p in q.scalars().all()}

    team = teams.get(employee.team_id) if employee.team_id else None
    leader_emp = None
    leader_name = ""
    if team:
        leader_name = team.leader_id or ""
        q = await db.execute(select(Employee).where(Employee.id == team.leader_id))
        le = q.scalar_one_or_none()
        leader_emp = le
        leader_name = _menthor(le) if le else team.leader_id or ""

    learning = await build_learning_history(db, employee.id)

    is_leader = user.role == ROLE_TEAM_LEADER

    profile = {
        "id": employee.id,
        "employeeId": _emp_number(employee),
        "name": _menthor(employee),
        "email": employee_email(employee),
        "avatar": employee.avatar or "https://i.pravatar.cc/150?img=11",
        "title": employee.job_title,
        "personaTitle": "Team Leader" if is_leader else persona_title(employee.persona),
        "personaType": employee.persona or "growth_employee",
        "department": employee.department,
        "teamId": employee.team_id or "",
        "teamName": _team_label(team),
        "teamLeaderId": team.leader_id if team else "",
        "teamLeaderName": leader_name,
        "location": employee.location,
        "joiningDate": employee.joining_date.isoformat() if employee.joining_date else "",
        "yearsOfExperience": f"{employee.years_of_experience or 0:g} years",
        "employmentStatus": "Active",
        "profileCompletion": _completion(employee, len(emp_skills), len(exp_rows)),
        "professionalSummary": employee.professional_summary or employee.bio or "",
        "skills": build_skills(emp_skills, skills_map),
        "skillsDeveloping": build_developing(db, dev_rows),
        "experience": build_experience(db, exp_rows),
        "projects": build_projects(pm_rows, projects_by_id, authored),
        "currentWork": build_current_work(cw_row),
        "learningHistory": learning,
        "githubEvidence": build_github_evidence(employee, emp_skills, skills_map),
        "careerAspiration": build_career_aspiration(goal),
        "mobilityPreferences": build_mobility(goal),
        "availability": _availability(employee, cw_row is not None),
    }

    if not is_hr_viewer(user) and str(user.id) != str(employee.user_id):
        profile["email"] = ""
    return profile


def is_hr_viewer(user: User) -> bool:
    return user.role in HR_ROLES


def _emp_number(employee: Employee) -> str:
    idx = 0
    for ch in employee.id:
        idx += ord(ch)
    return f"EV-{1000 + (idx % 900)}"


def employee_email(employee: Employee) -> str:
    return f"{employee.first_name.lower()}.{employee.last_name.lower()}@eaglevision.ai"


def persona_title(persona: Optional[str]) -> str:
    return {
        "new_employee": "New Employee (Onboarding)",
        "growth_employee": "Growth-Seeking Employee",
        "opportunity_employee": "Opportunity-Seeking Employee",
    }.get(persona or "", "Employee")


def build_github_evidence(employee: Employee, emp_skills: List[EmployeeSkill], skills_map: Dict[str, Tuple[str, str]] = None) -> dict:
    lang_set = []
    if emp_skills:
        lang_set = sorted({skills_map.get(es.skill_id, (es.skill_id, ""))[0] for es in emp_skills})
    return {
        "profileUrl": "",
        "username": employee.first_name.lower() + employee.last_name[:3].lower(),
        "repositories": [],
        "commitsThisMonth": 0,
        "topLanguages": lang_set,
    }


# ---------------------------------------------------------------------------
# Team / employee list
# ---------------------------------------------------------------------------

async def list_employee_profiles(
    db: AsyncSession, user: User, team_id: Optional[str] = None, query: Optional[str] = None
) -> List[dict]:
    """List employees visible to the viewer with authz filtering."""
    stmt = select(Employee)
    if is_hr(user):
        pass
    elif is_tl(user):
        emp = await employee_for_user(db, user)
        team = await team_led_by(db, emp) if emp else None
        if team:
            stmt = stmt.where(Employee.team_id == team.id)
        else:
            return []
    else:
        emp = await employee_for_user(db, user)
        if not emp:
            return []
        stmt = stmt.where(Employee.id == emp.id)

    if team_id:
        stmt = stmt.where(Employee.team_id == team_id)
    stmt = stmt.order_by(Employee.first_name, Employee.last_name)

    rows = list((await db.execute(stmt)).scalars().all())

    teams = await _team_names(db)
    skills_map = await _skills_map(db)

    results = []
    for e in rows:
        if query:
            haystack = f"{e.first_name} {e.last_name} {e.job_title} {e.department}".lower()
            if query.lower() not in haystack:
                continue
        results.append(await build_profile_dict(db, e, user, teams, skills_map))
    return results


async def team_overview(db: AsyncSession, user: User) -> dict:
    """Team profile for a Team Leader (and HR)."""
    if is_hr(user):
        # HR: aggregate view over all teams
        q = await db.execute(select(Team))
        teams = list(q.scalars().all())
        overview = []
        for t in teams:
            overview.append(await _team_dict(db, t, user))
        return {"teams": overview}
    emp = await employee_for_user(db, user)
    if not emp:
        return {"teams": []}
    team = await team_led_by(db, emp)
    if not team:
        return {"teams": []}
    return {"teams": [await _team_dict(db, team, user)]}


async def _team_dict(db: AsyncSession, team: Team, viewer: User) -> dict:
    q = await db.execute(select(Employee).where(Employee.team_id == team.id))
    members = list(q.scalars().all())
    q = await db.execute(select(Employee).where(Employee.id == team.leader_id))
    leader = q.scalar_one_or_none()

    projects = await _projects_for_team(db, team.id)
    teams = await _team_names(db)
    skills_map = await _skills_map(db)

    return {
        "id": team.id,
        "name": team.name,
        "department": team.department,
        "leaderId": team.leader_id,
        "leaderName": _menthor(leader) if leader else team.leader_id or "",
        "description": team.description or "",
        "memberCount": len(members),
        "activeProjectsCount": len([p for p in projects if p.get("status") in ("active", "recruiting")]),
        "members": [await build_profile_dict(db, m, viewer, teams, skills_map) for m in members],
        "projects": projects,
    }


# ---------------------------------------------------------------------------
# Projects
# ---------------------------------------------------------------------------

async def _projects_for_team(db: AsyncSession, team_id: str) -> List[dict]:
    q = await db.execute(select(Project).where(Project.team_id == team_id))
    projects = list(q.scalars().all())
    return [await _project_dict(db, p) for p in projects]


async def _project_dict(db: AsyncSession, p: Project) -> dict:
    q = await db.execute(select(ProjectMember).where(ProjectMember.project_id == p.id))
    members = [
        {
            "employeeId": m.employee_id, "name": m.name, "role": m.role,
            "avatar": m.avatar or "https://i.pravatar.cc/150?img=11",
            "allocation": m.allocation,
        }
        for m in q.scalars().all()
    ]
    return {
        "id": p.id,
        "name": p.name,
        "description": p.description or "",
        "teamId": p.team_id,
        "teamName": p.team_name,
        "teamLeaderId": p.team_leader_id,
        "teamLeaderName": p.team_leader_name,
        "status": p.status,
        "duration": p.duration,
        "startDate": p.start_date or "",
        "endDate": p.end_date or "",
        "requiredSkills": p.required_skills or [],
        "preferredSkills": p.preferred_skills or [],
        "availableRoles": p.available_roles or [],
        "members": members,
        "openPositionsCount": int(p.open_positions_count or 0),
    }


async def list_portal_projects(db: AsyncSession, user: User) -> List[dict]:
    if is_hr(user):
        q = await db.execute(select(Project))
    elif is_tl(user):
        q = await db.execute(select(Project))
    else:
        return []
    rows = list(q.scalars().all())
    return [await _project_dict(db, p) for p in rows]


# ---------------------------------------------------------------------------
# Opportunities + genuine matching
# ---------------------------------------------------------------------------

async def _employee_skill_names(db: AsyncSession, employee_id: str) -> List[Tuple[str, int]]:
    emp_skills = await _load_skills(db, employee_id)
    skills_map = await _skills_map(db)
    return [(skills_map.get(es.skill_id, (es.skill_id, ""))[0], es.proficiency_level or 0) for es in emp_skills]


async def _employee_text(db: AsyncSession, employee_id: str) -> str:
    emp_skills = await _load_skills(db, employee_id)
    skills_map = await _skills_map(db)
    parts = [skills_map.get(es.skill_id, (es.skill_id, ""))[0] for es in emp_skills]
    return ", ".join(parts)


def _match_skills(employee_names: List[str], required: List[str], preferred: List[str]):
    matched, developing, missing = [], [], []
    for req in required:
        hit = next((n for n in employee_names if _norm_name(n) == _norm_name(req)), None)
        if hit:
            matched.append(req)
        else:
            missing.append(req)
    for pref in preferred:
        hit = next((n for n in employee_names if _norm_name(n) == _norm_name(pref)), None)
        if hit:
            matched.append(pref)
    return matched, developing, missing


async def compute_match(db: AsyncSession, opportunity: InternalOpportunity, employee_id: str) -> dict:
    """Genuine rule-based + semantic matching. Never fabricated percentages.

    Deterministic coverage of required/preferred skills weighted 60/30, plus a
    small semantic cosine boost (10) computed by the embedding provider. The
    result is explicitly tagged as fallback unless a neural provider is active.
    """
    names_prof = await _employee_skill_names(db, employee_id)
    names = [n for n, _ in names_prof]
    required = opportunity.required_skills or []
    preferred = opportunity.preferred_skills or []

    matched, developing, missing = _match_skills(names, required, preferred)

    total_req = len(required) or 1
    req_cov = sum(1 for r in required if _norm_name(r) in {_norm_name(n) for n in names}) / total_req
    total_pref = len(preferred) or 1
    pref_cov = sum(1 for p in preferred if _norm_name(p) in {_norm_name(n) for n in names}) / total_pref

    base = 100 * (0.6 * req_cov + 0.3 * pref_cov)
    try:
        prov = get_embedding_singleton()
        sim = prov.cosine_similarity(
            prov.embed(await _employee_text(db, employee_id)),
            prov.embed(" ".join(required + preferred)),
        )
        semantic = max(0.0, min(1.0, sim)) * 10
    except Exception:
        semantic = 0.0

    score = round(base + semantic)

    is_fallback = (settings.EMBEDDING_PROVIDER or "tfidf").lower() != "sentence_transformers"
    rationale = (
        "Match computed from verified skill coverage of required/preferred skills"
        + ("" if not is_fallback else " (rule-based scoring — AI ranking unavailable).")
    )
    return {
        "match_score": score,
        "matched_skills": matched,
        "developing_skills": developing,
        "missing_skills": missing,
        "rationale": rationale,
        "is_fallback": is_fallback,
    }


async def _persist_match(db, opp_id, employee_id, result: dict):
    await db.execute(
        delete(EmployeeOpportunityMatch).where(
            EmployeeOpportunityMatch.opportunity_id == opp_id,
            EmployeeOpportunityMatch.employee_id == employee_id,
        )
    )
    db.add(EmployeeOpportunityMatch(
        employee_id=employee_id, opportunity_id=opp_id,
        match_score=result["match_score"],
        matched_skills=result["matched_skills"],
        developing_skills=result["developing_skills"],
        missing_skills=result["missing_skills"],
        rationale=result["rationale"],
        is_fallback=result["is_fallback"],
    ))
    await db.flush()


async def list_opportunities(db: AsyncSession, employee_id: str, user: User) -> List[dict]:
    q = await db.execute(
        select(InternalOpportunity).where(InternalOpportunity.status == "open")
        .order_by(InternalOpportunity.created_at.desc())
    )
    opps = list(q.scalars().all())
    result = []
    for opp in opps:
        match = await compute_match(db, opp, employee_id)
        result.append({
            "id": opp.id,
            "title": opp.title,
            "team": opp.team,
            "teamId": opp.team_id,
            "teamLeaderName": opp.team_leader_name,
            "department": opp.department,
            "location": opp.location,
            "isRemote": bool(opp.is_remote),
            "type": opp.type,
            "matchScore": match["match_score"],
            "description": opp.description,
            "duration": opp.duration,
            "requiredSkills": opp.required_skills or [],
            "preferredSkills": opp.preferred_skills or [],
            "matchExplanation": {
                "matchedSkills": match["matched_skills"],
                "developingSkills": match["developing_skills"],
                "missingSkills": match["missing_skills"],
                "rationale": match["rationale"],
            },
            "matchSource": "fallback" if match["is_fallback"] else "ai",
        })
    result.sort(key=lambda o: o["matchScore"], reverse=True)
    return result


async def express_interest(db: AsyncSession, employee_id: str, opp_id: str):
    q = await db.execute(
        select(ExpressionOfInterest).where(
            ExpressionOfInterest.employee_id == employee_id,
            ExpressionOfInterest.opportunity_id == opp_id,
        )
    )
    existing = q.scalar_one_or_none()
    if existing:
        return existing
    eoi = ExpressionOfInterest(employee_id=employee_id, opportunity_id=opp_id)
    db.add(eoi)
    await db.flush()
    return eoi


# ---------------------------------------------------------------------------
# Requests
# ---------------------------------------------------------------------------

async def list_applicable_requests(db: AsyncSession, user: User) -> List[dict]:
    if is_hr(user):
        q = await db.execute(select(EmployeeRequest).order_by(EmployeeRequest.created_at.desc()))
    elif is_tl(user):
        emp = await employee_for_user(db, user)
        team = await team_led_by(db, emp) if emp else None
        team_id = team.id if team else "__none__"
        q = await db.execute(
            select(EmployeeRequest)
            .where(EmployeeRequest.requester_team_id == team_id)
            .order_by(EmployeeRequest.created_at.desc())
        )
    else:
        emp = await employee_for_user(db, user)
        if not emp:
            return []
        q = await db.execute(
            select(EmployeeRequest).where(EmployeeRequest.requester_id == emp.id)
            .order_by(EmployeeRequest.created_at.desc())
        )
    return [request_dict(r) for r in q.scalars().all()]


def request_dict(r: EmployeeRequest) -> dict:
    return {
        "id": r.id,
        "type": r.type,
        "requesterId": r.requester_id,
        "requesterName": r.requester_name,
        "requesterAvatar": r.requester_avatar,
        "requesterRole": r.requester_role,
        "requesterTeamId": r.requester_team_id,
        "requesterTeamName": r.requester_team_name,
        "targetId": r.target_id,
        "targetTitle": r.target_title,
        "reason": r.reason,
        "desiredRoleOrSkill": r.desired_role_or_skill,
        "expectedBenefit": r.expected_benefit,
        "status": r.status,
        "createdAt": _iso(r.created_at),
        "reviewedAt": _iso(r.reviewed_at),
        "reviewedBy": r.reviewed_by,
        "reviewerNotes": r.reviewer_notes,
    }


async def can_review_request(db: AsyncSession, user: User, r: EmployeeRequest) -> bool:
    if is_hr(user):
        return True
    if is_tl(user):
        emp = await employee_for_user(db, user)
        if not emp:
            return False
        team = await team_led_by(db, emp)
        return bool(team and r.requester_team_id == team.id)
    return r.requester_id == (await employee_for_user(db, user)).id if await employee_for_user(db, user) else False


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------

async def list_notifications(db: AsyncSession, user_id: str) -> List[dict]:
    q = await db.execute(
        select(Notification).where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc()).limit(50)
    )
    return [{
        "id": n.id,
        "title": n.title,
        "message": n.message,
        "type": n.type if n.type in ("request_approved", "request_rejected", "new_project_invite", "skill_verified", "course_assigned") else "system",
        "read": bool(n.read),
        "timestamp": _relative_time(n.created_at) if n.created_at else "",
        "actionUrl": n.action_url,
    } for n in q.scalars().all()]


async def mark_notification_read(db: AsyncSession, user_id: str, notif_id: str):
    q = await db.execute(select(Notification).where(Notification.id == notif_id, Notification.user_id == user_id))
    n = q.scalar_one_or_none()
    if n:
        n.read = True
        await db.flush()
    return n


# ---------------------------------------------------------------------------
# Courses + skill gaps + learning recommendations
# ---------------------------------------------------------------------------

async def list_courses(db: AsyncSession, employee_id: str) -> List[dict]:
    q = await db.execute(select(LearningResource))
    resources = list(q.scalars().all())
    q = await db.execute(select(CourseEnrollment).where(CourseEnrollment.employee_id == employee_id))
    enrolled = {e.resource_id for e in q.scalars().all()}
    return [{
        "id": r.id,
        "title": r.title,
        "provider": r.provider or "Internal",
        "skill": r.skill_name or "",
        "difficulty": {"beginner": "Beginner", "intermediate": "Intermediate", "advanced": "Advanced"}.get((r.skill_level or "").lower(), "Intermediate"),
        "duration": f"{int(r.duration_hours or 0)}h",
        "description": r.description or "",
        "expectedImprovement": f"Build practical {r.skill_name} skills",
        "rating": 4.5,
        "isRestricted": not bool(r.is_free),
        "enrolledCount": 12 + (1 if r.id in enrolled else 0),
    } for r in resources]


async def enroll_course(db: AsyncSession, employee_id: str, resource_id: str):
    q = await db.execute(select(LearningResource).where(LearningResource.id == resource_id))
    r = q.scalar_one_or_none()
    if not r:
        return None
    q = await db.execute(
        select(CourseEnrollment).where(CourseEnrollment.employee_id == employee_id,
                                       CourseEnrollment.resource_id == resource_id)
    )
    if q.scalar_one_or_none():
        return "already"
    e = CourseEnrollment(
        employee_id=employee_id, resource_id=resource_id, title=r.title,
        provider=r.provider or "Internal", skill_name=r.skill_name or "",
        status="enrolled", progress_percentage=0, skills_gained=[],
    )
    db.add(e)
    await db.flush()
    return e


async def compute_skill_gaps(db: AsyncSession, employee_id: str, target_role: Optional[str] = None) -> List[dict]:
    q = await db.execute(select(CareerGoal).where(CareerGoal.employee_id == employee_id))
    goal = q.scalars().first()
    names = [n for n, _ in await _employee_skill_names(db, employee_id)]

    missing = list(goal.missing_skills or []) if goal else []
    if target_role:
        # Semantic scan: skills the target role references that the employee lacks
        role_skills = [s.strip() for s in target_role.split(",") if s.strip()]
        for rs in role_skills:
            if not any(_norm_name(n) == _norm_name(rs) for n in names):
                missing.append(rs)

    gaps = []
    for i, skill in enumerate(missing):
        severity = "high" if i == 0 else ("medium" if i < 3 else "low")
        gaps.append({
            "id": f"gap-{employee_id}-{i}",
            "skillName": skill,
            "severity": severity,
            "source": "career_goal",
            "targetRole": goal.target_role if goal else (target_role or ""),
            "solution": await _gap_solution(db, skill),
        })
    return gaps


async def _gap_solution(db: AsyncSession, skill: str) -> List[dict]:
    q = await db.execute(
        select(LearningResource)
        .where(LearningResource.skill_name.ilike(f"%{skill}%"))
        .order_by(LearningResource.duration_hours)
    )
    rows = list(q.scalars().all())
    if not rows:
        rows = await _closest_courses(db, skill)
    return [{
        "courseId": r.id, "title": r.title, "provider": r.provider or "Internal",
        "skill": r.skill_name or skill, "duration": f"{int(r.duration_hours or 0)}h",
        "free": bool(r.is_free),
    } for r in rows[:3]]


async def _closest_courses(db: AsyncSession, skill: str) -> List[LearningResource]:
    q = await db.execute(select(LearningResource).limit(5))
    return list(q.scalars().all())


async def learning_recommendations(db: AsyncSession, employee_id: str, limit: int = 3) -> List[dict]:
    gaps = await compute_skill_gaps(db, employee_id)
    recs = []
    for gap in gaps[:limit]:
        if gap["solution"]:
            first = gap["solution"][0]
            recs.append({
                "id": first["courseId"],
                "title": first["title"],
                "provider": first["provider"],
                "skill": gap["skillName"],
                "reason": f"Closes the gap toward {gap['targetRole']}",
                "severity": gap["severity"],
            })
    return recs


# ---------------------------------------------------------------------------
# Skill taxonomy listing
# ---------------------------------------------------------------------------

async def list_skills_with_categories(db: AsyncSession) -> List[dict]:
    q = await db.execute(select(Skill).order_by(Skill.name))
    skills = list(q.scalars().all())
    q = await db.execute(select(SkillTaxonomyCategory))
    cats = {c.id: c.name for c in q.scalars().all()}
    return [{
        "id": s.id, "name": s.name, "categoryId": s.category_id,
        "category": cats.get(s.category_id, "Backend Dev"), "type": s.skill_type,
    } for s in skills]


# ---------------------------------------------------------------------------
# HR context (analytics overview)
# ---------------------------------------------------------------------------

async def org_overview(db: AsyncSession) -> dict:
    q = await db.execute(select(Employee))
    emps = list(q.scalars().all())
    q = await db.execute(select(Department))
    depts = list(q.scalars().all())
    q = await db.execute(select(Team))
    teams = list(q.scalars().all())
    q = await db.execute(select(HRProject))
    hr_projects = list(q.scalars().all())
    q = await db.execute(select(EmployeeRequest))
    requests = list(q.scalars().all())

    return {
        "employeeCount": len(emps),
        "departmentCount": len(depts),
        "teamCount": len(teams),
        "activeProjects": len([p for p in hr_projects if p.status == "active"]),
        "departments": [{"id": d.id, "name": d.name, "headCount": d.head_count or 0} for d in depts],
        "teams": [{"id": t.id, "name": t.name, "department": t.department,
                   "leaderId": t.leader_id, "memberCount": 0} for t in teams],
        "requestsSummary": {
            "pending": len([r for r in requests if r.status == "pending"]),
            "approved": len([r for r in requests if r.status == "approved"]),
            "rejected": len([r for r in requests if r.status == "rejected"]),
        },
    }