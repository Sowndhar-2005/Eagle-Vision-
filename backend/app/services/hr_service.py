"""
Eagle Vision — HR Service Layer
Orchestrates project management, AI analysis, talent matching, and learning recommendations.
"""

import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.matching_engine import MatchingEngine
from app.ai.recommendation_engine import RecommendationEngine
from app.ai.requirement_analyzer import RequirementAnalyzer, StructuredRequirement
from app.ai.skill_extractor import normalize_skill
from app.core.config import settings
from app.models import (
    HRProject,
    ProjectRequirement,
    MatchResult,
    LearningResource,
    AuditLog,
    Employee,
    EmployeeSkill,
    Skill,
)
from app.schemas.hr_schemas import (
    ProjectCreate,
    ProjectUpdate,
    AnalyzeRequirementRequest,
    RequirementUpdateRequest,
    StructuredRequirementSchema,
)


class HRService:
    """
    Central HR service coordinating all HR module business logic.
    API endpoints call this service, never the DB directly.
    """

    def __init__(self):
        self._analyzer = RequirementAnalyzer()
        self._matcher = MatchingEngine()
        self._recommender = RecommendationEngine()

    # ─── Dashboard ────────────────────────────────────────────────────────────

    async def get_dashboard(self, db: AsyncSession) -> Dict[str, Any]:
        # Active projects
        active_proj_q = await db.execute(
            select(func.count()).where(HRProject.status.in_(["active", "draft"]))
        )
        active_projects = active_proj_q.scalar() or 0

        # Open requirements
        open_req_q = await db.execute(
            select(func.count()).where(ProjectRequirement.status == "published")
        )
        open_requirements = open_req_q.scalar() or 0

        # Total matches recorded
        match_q = await db.execute(select(func.count()).select_from(MatchResult))
        total_matches = match_q.scalar() or 0

        # Critical skill gaps (skills that appear as gaps)
        gap_q = await db.execute(select(MatchResult.skill_gaps_json))
        gap_rows = gap_q.scalars().all()
        gap_counts: Dict[str, int] = {}
        for row in gap_rows:
            gaps = row if isinstance(row, list) else (json.loads(row) if row else [])
            for g in gaps:
                gap_counts[g] = gap_counts.get(g, 0) + 1
        critical_gap_count = len([v for v in gap_counts.values() if v >= 2])

        # Recent projects
        recent_q = await db.execute(
            select(HRProject).order_by(HRProject.created_at.desc()).limit(5)
        )
        recent_projects = recent_q.scalars().all()

        # Top internal skills
        skill_q = await db.execute(
            select(Skill.name, func.count(EmployeeSkill.id).label("cnt"))
            .join(EmployeeSkill, EmployeeSkill.skill_id == Skill.id)
            .group_by(Skill.name)
            .order_by(func.count(EmployeeSkill.id).desc())
            .limit(6)
        )
        top_skills = [{"skill_name": r[0], "count": r[1], "trend": "stable"} for r in skill_q]

        # Most requested skills (from published requirements)
        req_q = await db.execute(
            select(ProjectRequirement.required_skills_json).where(
                ProjectRequirement.status == "published"
            )
        )
        req_rows = req_q.scalars().all()
        requested_counts: Dict[str, int] = {}
        for row in req_rows:
            skills_data = row if isinstance(row, list) else (json.loads(row) if row else [])
            for s in skills_data:
                name = s.get("name", "") if isinstance(s, dict) else str(s)
                if name:
                    requested_counts[name] = requested_counts.get(name, 0) + 1
        most_requested = [
            {"skill_name": k, "count": v, "trend": "up"}
            for k, v in sorted(requested_counts.items(), key=lambda x: -x[1])[:6]
        ]

        # Gaps sorted by frequency
        top_gaps = [
            {"skill_name": k, "count": v, "trend": "down"}
            for k, v in sorted(gap_counts.items(), key=lambda x: -x[1])[:5]
        ]

        # Employees ready for mobility
        emp_q = await db.execute(
            select(func.count()).where(Employee.open_to_gigs == True)
        )
        ready_count = emp_q.scalar() or 0

        recent_proj_dicts = []
        for p in recent_projects:
            match_count_q = await db.execute(
                select(func.count()).where(MatchResult.project_id == p.id)
            )
            mc = match_count_q.scalar() or 0
            req_q2 = await db.execute(
                select(ProjectRequirement.status)
                .where(ProjectRequirement.project_id == p.id)
                .order_by(ProjectRequirement.created_at.desc())
                .limit(1)
            )
            req_status = req_q2.scalar()
            recent_proj_dicts.append({
                "id": p.id,
                "name": p.name,
                "department": p.department,
                "description": p.description,
                "business_objective": p.business_objective,
                "duration_months": p.duration_months,
                "location": p.location,
                "work_mode": p.work_mode,
                "headcount": p.headcount,
                "priority": p.priority,
                "status": p.status,
                "created_at": p.created_at,
                "updated_at": p.updated_at,
                "candidate_count": mc,
                "requirement_status": req_status,
            })

        return {
            "kpis": {
                "active_projects": active_projects,
                "open_requirements": open_requirements,
                "total_matches": total_matches,
                "critical_skill_gaps": critical_gap_count,
            },
            "recent_projects": recent_proj_dicts,
            "top_internal_skills": top_skills,
            "most_requested_skills": most_requested,
            "critical_gaps": top_gaps,
            "employees_ready_for_mobility": ready_count,
        }

    # ─── Projects ─────────────────────────────────────────────────────────────

    async def create_project(
        self, db: AsyncSession, data: ProjectCreate, user_id: Optional[str] = None
    ) -> HRProject:
        project = HRProject(
            name=data.name,
            department=data.department,
            description=data.description,
            business_objective=data.business_objective,
            duration_months=data.duration_months,
            location=data.location,
            work_mode=data.work_mode,
            headcount=data.headcount,
            priority=data.priority,
            status="draft",
            created_by=user_id,
        )
        db.add(project)
        await db.flush()
        await self._audit(db, user_id, "project_created", "hr_project", project.id)
        return project

    async def list_projects(self, db: AsyncSession) -> List[Dict[str, Any]]:
        q = await db.execute(select(HRProject).order_by(HRProject.created_at.desc()))
        projects = q.scalars().all()
        result = []
        for p in projects:
            match_count_q = await db.execute(
                select(func.count()).where(MatchResult.project_id == p.id)
            )
            mc = match_count_q.scalar() or 0
            req_q = await db.execute(
                select(ProjectRequirement.status)
                .where(ProjectRequirement.project_id == p.id)
                .order_by(ProjectRequirement.created_at.desc())
                .limit(1)
            )
            req_status = req_q.scalar()
            result.append({
                "id": p.id,
                "name": p.name,
                "department": p.department,
                "description": p.description,
                "business_objective": p.business_objective,
                "duration_months": p.duration_months,
                "location": p.location,
                "work_mode": p.work_mode,
                "headcount": p.headcount,
                "priority": p.priority,
                "status": p.status,
                "created_at": p.created_at,
                "updated_at": p.updated_at,
                "candidate_count": mc,
                "requirement_status": req_status,
            })
        return result

    async def get_project(self, db: AsyncSession, project_id: str) -> Optional[HRProject]:
        q = await db.execute(select(HRProject).where(HRProject.id == project_id))
        return q.scalar_one_or_none()

    async def update_project(
        self, db: AsyncSession, project_id: str, data: ProjectUpdate
    ) -> Optional[HRProject]:
        project = await self.get_project(db, project_id)
        if not project:
            return None
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(project, field, value)
        project.updated_at = datetime.now(timezone.utc)
        await db.flush()
        return project

    # ─── Requirement Analysis ─────────────────────────────────────────────────

    async def analyze_requirement(
        self,
        db: AsyncSession,
        project_id: str,
        req: AnalyzeRequirementRequest,
        user_id: Optional[str] = None,
    ) -> ProjectRequirement:
        project = await self.get_project(db, project_id)
        if not project:
            raise ValueError(f"Project {project_id} not found")

        # Run AI analysis
        structured: StructuredRequirement = self._analyzer.analyze(
            project_name=req.project_name or project.name,
            description=req.raw_description,
            department=req.department or project.department,
            duration_months=req.duration_months or project.duration_months,
            headcount=req.headcount or project.headcount,
        )

        # Generate embedding text and embedding
        from app.ai.embedding_service import get_embedding_singleton
        emb_text = self._analyzer.to_embedding_text(structured)
        embedder = get_embedding_singleton()
        embedding = embedder.embed(emb_text)

        # Persist to DB
        requirement = ProjectRequirement(
            project_id=project_id,
            raw_description=req.raw_description,
            project_title=structured.project_title,
            roles_json=[r.model_dump() for r in structured.roles],
            required_skills_json=[s.model_dump() for s in structured.required_skills],
            preferred_skills_json=structured.preferred_skills,
            experience_years=structured.experience_years,
            responsibilities_json=structured.responsibilities,
            constraints_json=structured.constraints.model_dump(),
            embedding_json=embedding,
            status="analyzed",
            analyzed_at=datetime.now(timezone.utc),
        )
        db.add(requirement)

        # Update project status
        project.status = "active"
        project.updated_at = datetime.now(timezone.utc)
        await db.flush()

        await self._audit(db, user_id, "requirement_analyzed", "project_requirement", requirement.id)
        return requirement

    async def update_requirement(
        self,
        db: AsyncSession,
        requirement_id: str,
        data: RequirementUpdateRequest,
        user_id: Optional[str] = None,
    ) -> Optional[ProjectRequirement]:
        q = await db.execute(
            select(ProjectRequirement).where(ProjectRequirement.id == requirement_id)
        )
        req = q.scalar_one_or_none()
        if not req:
            return None

        if data.project_title is not None:
            req.project_title = data.project_title
        if data.roles is not None:
            req.roles_json = [r.model_dump() for r in data.roles]
        if data.required_skills is not None:
            req.required_skills_json = [s.model_dump() for s in data.required_skills]
        if data.preferred_skills is not None:
            req.preferred_skills_json = data.preferred_skills
        if data.experience_years is not None:
            req.experience_years = data.experience_years
        if data.responsibilities is not None:
            req.responsibilities_json = data.responsibilities
        if data.constraints is not None:
            req.constraints_json = data.constraints.model_dump()

        await db.flush()
        await self._audit(db, user_id, "requirement_edited", "project_requirement", requirement_id)
        return req

    async def publish_requirement(
        self,
        db: AsyncSession,
        requirement_id: str,
        user_id: Optional[str] = None,
    ) -> Optional[ProjectRequirement]:
        q = await db.execute(
            select(ProjectRequirement).where(ProjectRequirement.id == requirement_id)
        )
        req = q.scalar_one_or_none()
        if not req:
            return None
        req.status = "published"
        req.published_at = datetime.now(timezone.utc)
        await db.flush()
        await self._audit(db, user_id, "requirement_published", "project_requirement", requirement_id)
        return req

    async def get_requirement_for_project(
        self, db: AsyncSession, project_id: str
    ) -> Optional[ProjectRequirement]:
        q = await db.execute(
            select(ProjectRequirement)
            .where(ProjectRequirement.project_id == project_id)
            .order_by(ProjectRequirement.created_at.desc())
            .limit(1)
        )
        return q.scalar_one_or_none()

    # ─── Matching ─────────────────────────────────────────────────────────────

    async def match_talent(
        self,
        db: AsyncSession,
        project_id: str,
        user_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Run the full matching pipeline for a project."""
        # Load the published (or latest analyzed) requirement
        req = await self.get_requirement_for_project(db, project_id)
        if not req:
            raise ValueError("No requirement found for this project. Please analyze a requirement first.")

        # Reconstruct StructuredRequirement from DB JSON
        from app.ai.requirement_analyzer import StructuredRequirement, RequiredSkill, ProjectRole, RequirementConstraints
        required_skills = []
        for s in (req.required_skills_json or []):
            if isinstance(s, dict):
                required_skills.append(RequiredSkill(**s))
        roles = []
        for r in (req.roles_json or []):
            if isinstance(r, dict):
                roles.append(ProjectRole(**r))
        constraints_data = req.constraints_json or {}
        if isinstance(constraints_data, str):
            constraints_data = json.loads(constraints_data)

        structured_req = StructuredRequirement(
            project_title=req.project_title or "Project",
            roles=roles,
            required_skills=required_skills,
            preferred_skills=req.preferred_skills_json or [],
            experience_years=req.experience_years or 0.0,
            responsibilities=req.responsibilities_json or [],
            constraints=RequirementConstraints(**constraints_data),
        )

        emp_q = await db.execute(
            select(Employee).where(Employee.open_to_gigs == True)
        )
        employees = emp_q.scalars().unique().all()

        employee_dicts = []
        for emp in employees:
            skills_q = await db.execute(
                select(EmployeeSkill, Skill)
                .join(Skill, EmployeeSkill.skill_id == Skill.id)
                .where(EmployeeSkill.employee_id == emp.id)
            )
            skill_rows = skills_q.all()
            skills = [
                {
                    "name": s.name,
                    "skill_id": es.skill_id,
                    "proficiency_level": es.proficiency_level,
                    "years_of_experience": es.years_of_experience,
                }
                for es, s in skill_rows
            ]
            employee_dicts.append({
                "id": emp.id,
                "full_name": f"{emp.first_name} {emp.last_name}",
                "job_title": emp.job_title,
                "department": emp.department,
                "years_of_experience": emp.years_of_experience,
                "skills": skills,
            })

        # Get requirement embedding text
        emb_text = self._analyzer.to_embedding_text(structured_req)

        # Run matching engine
        scores = self._matcher.match_candidates(
            requirement=structured_req,
            employees=employee_dicts,
            requirement_text=emb_text,
        )

        # Clear previous match results for this project
        from sqlalchemy import delete
        await db.execute(delete(MatchResult).where(MatchResult.project_id == project_id))

        # Persist new results
        results: List[Dict[str, Any]] = []
        for rank, score in enumerate(scores, 1):
            mr = MatchResult(
                project_id=project_id,
                requirement_id=req.id,
                employee_id=score.employee_id,
                overall_score=score.overall_score,
                required_skill_score=score.required_skill_score,
                semantic_score=score.semantic_score,
                experience_score=score.experience_score,
                proficiency_score=score.proficiency_score,
                preferred_skill_score=score.preferred_skill_score,
                matched_skills_json=score.matched_skills,
                skill_gaps_json=score.skill_gaps,
                partial_matches_json=score.partial_matches,
                explanation=score.explanation,
                rank=rank,
            )
            db.add(mr)

            emp_dict = next((e for e in employee_dicts if e["id"] == score.employee_id), {})
            results.append({
                "employee_id": score.employee_id,
                "full_name": emp_dict.get("full_name", ""),
                "job_title": emp_dict.get("job_title", ""),
                "department": emp_dict.get("department", ""),
                "years_of_experience": emp_dict.get("years_of_experience", 0),
                "overall_score": score.overall_score,
                "required_skill_score": score.required_skill_score,
                "semantic_score": score.semantic_score,
                "experience_score": score.experience_score,
                "proficiency_score": score.proficiency_score,
                "preferred_skill_score": score.preferred_skill_score,
                "matched_skills": score.matched_skills,
                "skill_gaps": score.skill_gaps,
                "partial_matches": score.partial_matches,
                "explanation": score.explanation,
                "rank": rank,
                "skills": emp_dict.get("skills", []),
            })

        await db.flush()
        await self._audit(db, user_id, "talent_search_executed", "hr_project", project_id)
        return results

    async def get_candidates(
        self, db: AsyncSession, project_id: str
    ) -> List[Dict[str, Any]]:
        """Return cached match results for a project."""
        q = await db.execute(
            select(MatchResult, Employee)
            .join(Employee, MatchResult.employee_id == Employee.id)
            .where(MatchResult.project_id == project_id)
            .order_by(MatchResult.rank)
        )
        rows = q.all()

        results = []
        for mr, emp in rows:
            skills_q = await db.execute(
                select(EmployeeSkill, Skill)
                .join(Skill, EmployeeSkill.skill_id == Skill.id)
                .where(EmployeeSkill.employee_id == emp.id)
            )
            skill_rows = skills_q.all()
            skills = [
                {
                    "name": s.name,
                    "proficiency_level": es.proficiency_level,
                    "years_of_experience": es.years_of_experience,
                }
                for es, s in skill_rows
            ]

            results.append({
                "employee_id": emp.id,
                "full_name": f"{emp.first_name} {emp.last_name}",
                "job_title": emp.job_title,
                "department": emp.department,
                "years_of_experience": emp.years_of_experience,
                "overall_score": mr.overall_score,
                "required_skill_score": mr.required_skill_score,
                "semantic_score": mr.semantic_score,
                "experience_score": mr.experience_score,
                "proficiency_score": mr.proficiency_score,
                "preferred_skill_score": mr.preferred_skill_score,
                "matched_skills": mr.matched_skills_json or [],
                "skill_gaps": mr.skill_gaps_json or [],
                "partial_matches": mr.partial_matches_json or [],
                "explanation": mr.explanation or "",
                "rank": mr.rank,
                "skills": skills,
            })
        return results

    async def get_candidate_detail(
        self,
        db: AsyncSession,
        employee_id: str,
        project_id: Optional[str] = None,
        user_id: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        emp_q = await db.execute(select(Employee).where(Employee.id == employee_id))
        emp = emp_q.scalar_one_or_none()
        if not emp:
            return None

        skills_q = await db.execute(
            select(EmployeeSkill, Skill)
            .join(Skill, EmployeeSkill.skill_id == Skill.id)
            .where(EmployeeSkill.employee_id == employee_id)
        )
        skill_rows = skills_q.all()
        skills = [
            {
                "name": s.name,
                "skill_id": es.skill_id,
                "proficiency_level": es.proficiency_level,
                "years_of_experience": es.years_of_experience,
                "is_verified": es.is_verified,
            }
            for es, s in skill_rows
        ]

        match_analysis = None
        learning_recs = []
        if project_id:
            mr_q = await db.execute(
                select(MatchResult).where(
                    MatchResult.project_id == project_id,
                    MatchResult.employee_id == employee_id,
                )
            )
            mr = mr_q.scalar_one_or_none()
            if mr:
                match_analysis = {
                    "overall_score": mr.overall_score,
                    "required_skill_score": mr.required_skill_score,
                    "semantic_score": mr.semantic_score,
                    "experience_score": mr.experience_score,
                    "proficiency_score": mr.proficiency_score,
                    "preferred_skill_score": mr.preferred_skill_score,
                    "matched_skills": mr.matched_skills_json or [],
                    "skill_gaps": mr.skill_gaps_json or [],
                    "partial_matches": mr.partial_matches_json or [],
                    "explanation": mr.explanation or "",
                }

                # Generate learning recommendations for gaps
                gaps = mr.skill_gaps_json or []
                if gaps:
                    recs = self._recommender.recommend_for_gaps(
                        employee_name=f"{emp.first_name} {emp.last_name}",
                        current_role=emp.job_title,
                        skill_gaps=gaps,
                        project_context=project_id,
                    )
                    learning_recs = [r.to_dict() for r in recs]

        await self._audit(db, user_id, "candidate_viewed", "employee", employee_id)

        return {
            "employee_id": emp.id,
            "full_name": f"{emp.first_name} {emp.last_name}",
            "first_name": emp.first_name,
            "last_name": emp.last_name,
            "job_title": emp.job_title,
            "department": emp.department,
            "location": emp.location,
            "bio": emp.bio,
            "years_of_experience": emp.years_of_experience,
            "open_to_remote": emp.open_to_remote,
            "open_to_gigs": emp.open_to_gigs,
            "skills": skills,
            "work_experiences": [],
            "educations": [],
            "match_analysis": match_analysis,
            "learning_recommendations": learning_recs,
        }

    async def compare_candidates(
        self,
        db: AsyncSession,
        project_id: str,
        employee_ids: List[str],
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        candidates = []
        for eid in employee_ids:
            mr_q = await db.execute(
                select(MatchResult, Employee)
                .join(Employee, MatchResult.employee_id == Employee.id)
                .where(
                    MatchResult.project_id == project_id,
                    MatchResult.employee_id == eid,
                )
            )
            row = mr_q.first()
            if not row:
                continue
            mr, emp = row

            skills_q = await db.execute(
                select(EmployeeSkill, Skill)
                .join(Skill, EmployeeSkill.skill_id == Skill.id)
                .where(EmployeeSkill.employee_id == eid)
            )
            skill_rows = skills_q.all()
            skills = [
                {"name": s.name, "proficiency_level": es.proficiency_level, "years_of_experience": es.years_of_experience}
                for es, s in skill_rows
            ]

            candidates.append({
                "employee_id": emp.id,
                "full_name": f"{emp.first_name} {emp.last_name}",
                "job_title": emp.job_title,
                "department": emp.department,
                "years_of_experience": emp.years_of_experience,
                "overall_score": mr.overall_score,
                "required_skill_score": mr.required_skill_score,
                "semantic_score": mr.semantic_score,
                "experience_score": mr.experience_score,
                "proficiency_score": mr.proficiency_score,
                "preferred_skill_score": mr.preferred_skill_score,
                "matched_skills": mr.matched_skills_json or [],
                "skill_gaps": mr.skill_gaps_json or [],
                "partial_matches": mr.partial_matches_json or [],
                "explanation": mr.explanation or "",
                "rank": mr.rank,
                "skills": skills,
            })

        await self._audit(db, user_id, "candidate_comparison_executed", "hr_project", project_id)
        return {"project_id": project_id, "candidates": candidates}

    # ─── Analytics ────────────────────────────────────────────────────────────

    async def get_analytics(self, db: AsyncSession) -> Dict[str, Any]:
        emp_count_q = await db.execute(select(func.count()).select_from(Employee))
        skill_count_q = await db.execute(select(func.count()).select_from(Skill))
        proj_count_q = await db.execute(select(func.count()).select_from(HRProject))
        avg_score_q = await db.execute(select(func.avg(MatchResult.overall_score)))

        emp_count = emp_count_q.scalar() or 0
        skill_count = skill_count_q.scalar() or 0
        proj_count = proj_count_q.scalar() or 0
        avg_score = round(avg_score_q.scalar() or 0.0, 1)

        # Skill distribution
        skill_dist_q = await db.execute(
            select(Skill.name, func.count(EmployeeSkill.id).label("cnt"))
            .join(EmployeeSkill, EmployeeSkill.skill_id == Skill.id)
            .group_by(Skill.name)
            .order_by(func.count(EmployeeSkill.id).desc())
            .limit(10)
        )
        skill_distribution = [{"name": r[0], "count": r[1]} for r in skill_dist_q]

        # Department distribution
        dept_dist_q = await db.execute(
            select(Employee.department, func.count(Employee.id).label("cnt"))
            .group_by(Employee.department)
            .order_by(func.count(Employee.id).desc())
        )
        dept_distribution = [{"name": r[0], "count": r[1]} for r in dept_dist_q]

        # Top skill gaps
        gap_q = await db.execute(select(MatchResult.skill_gaps_json))
        gap_rows = gap_q.scalars().all()
        gap_counts: Dict[str, int] = {}
        for row in gap_rows:
            gaps = row if isinstance(row, list) else (json.loads(row) if row else [])
            for g in gaps:
                gap_counts[g] = gap_counts.get(g, 0) + 1
        top_gaps = [
            {"skill": k, "count": v}
            for k, v in sorted(gap_counts.items(), key=lambda x: -x[1])[:8]
        ]

        return {
            "total_employees": emp_count,
            "total_skills": skill_count,
            "total_projects": proj_count,
            "avg_match_score": avg_score,
            "skill_distribution": skill_distribution,
            "department_distribution": dept_distribution,
            "top_skill_gaps": top_gaps,
        }

    # ─── Learning ─────────────────────────────────────────────────────────────

    async def get_learning_resources(
        self, db: AsyncSession, skill_name: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        q = select(LearningResource).order_by(LearningResource.skill_name)
        if skill_name:
            q = q.where(LearningResource.skill_name.ilike(f"%{skill_name}%"))
        result = await db.execute(q)
        resources = result.scalars().all()
        return [
            {
                "id": r.id,
                "title": r.title,
                "description": r.description,
                "provider": r.provider,
                "url": r.url,
                "skill_name": r.skill_name,
                "skill_level": r.skill_level,
                "duration_hours": r.duration_hours,
                "resource_type": r.resource_type,
                "is_free": r.is_free,
            }
            for r in resources
        ]

    # ─── Settings ─────────────────────────────────────────────────────────────

    def get_settings(self) -> Dict[str, Any]:
        return {
            "llm_provider": settings.LLM_PROVIDER,
            "embedding_provider": settings.EMBEDDING_PROVIDER,
            "db_mode": settings.DB_MODE,
            "scoring_weights": {
                "required_skill": settings.WEIGHT_REQUIRED_SKILL,
                "semantic": settings.WEIGHT_SEMANTIC,
                "experience": settings.WEIGHT_EXPERIENCE,
                "proficiency": settings.WEIGHT_PROFICIENCY,
                "preferred_skill": settings.WEIGHT_PREFERRED_SKILL,
            },
        }

    # ─── Audit ────────────────────────────────────────────────────────────────

    async def _audit(
        self,
        db: AsyncSession,
        user_id: Optional[str],
        action: str,
        resource_type: str,
        resource_id: Optional[str] = None,
        details: Optional[Dict] = None,
    ):
        try:
            log = AuditLog(
                user_id=user_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                details_json=details,
            )
            db.add(log)
        except Exception:
            pass  # Never let audit failure break the main flow


# Singleton instance (instantiated once, shared across requests)
hr_service = HRService()
