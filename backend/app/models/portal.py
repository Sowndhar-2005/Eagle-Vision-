"""
Eagle Vision — Portal Domain ORM Models
Covers: Teams, Projects, Opportunities, Requests, Notifications, Learning,
Resume ingestion, and AI extraction evidence.

These models intentionally use String(36) identifiers and loose (non-constrained)
foreign-key columns so they work identically in both SQLite and PostgreSQL modes.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _uuid() -> str:
    return str(uuid.uuid4())


class Team(Base):
    """An organizational team led by a Team Leader."""

    __tablename__ = "teams"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    leader_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class CurrentWork(Base):
    """Employee's current active sprint / project work."""

    __tablename__ = "current_works"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    employee_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    project_name: Mapped[str] = mapped_column(String(200), nullable=False)
    role: Mapped[str] = mapped_column(String(150), nullable=False)
    team: Mapped[str] = mapped_column(String(150), nullable=False, default="")
    team_leader_name: Mapped[str] = mapped_column(String(150), nullable=False, default="")
    sprint_period: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")
    responsibilities: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    current_tasks: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    skills_being_used: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    skills_currently_developing: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    blockers: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)


class DevelopingSkill(Base):
    """Skill the employee is currently developing (learning goals)."""

    __tablename__ = "developing_skills"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    employee_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, default="Career Development")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="Learning")
    progress_percentage: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    target_role_relevance: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    associated_course_or_gig: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class CareerGoal(Base):
    """Employee career aspiration with skill ratings."""

    __tablename__ = "career_goals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    employee_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    current_role: Mapped[str] = mapped_column(String(150), nullable=False, default="")
    target_role: Mapped[str] = mapped_column(String(150), nullable=False)
    readiness_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    strong_skills: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    developing_skills: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    missing_skills: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    open_to_gigs: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    open_to_transfer: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    open_to_mentorship: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    preferred_roles: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    remote_preference: Mapped[str] = mapped_column(String(50), nullable=False, default="hybrid")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)


class Project(Base):
    """Internal project owned by a team / team leader."""

    __tablename__ = "portal_projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    team_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    team_name: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    team_leader_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    team_leader_name: Mapped[str] = mapped_column(String(150), nullable=False, default="")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="planning")
    duration: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    start_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    end_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    required_skills: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    preferred_skills: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    available_roles: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    open_positions_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class ProjectMember(Base):
    """Assignment of employees to a project."""

    __tablename__ = "project_members"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    project_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    employee_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    role: Mapped[str] = mapped_column(String(150), nullable=False, default="")
    avatar: Mapped[str] = mapped_column(String(500), nullable=True)
    allocation: Mapped[str] = mapped_column(String(50), nullable=False, default="100%")
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class EmployeeRequest(Base):
    """Development / course / project participation request from employee to team leader."""

    __tablename__ = "employee_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # course | project
    requester_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    requester_name: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    requester_avatar: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    requester_role: Mapped[str] = mapped_column(String(150), nullable=False, default="")
    requester_team_id: Mapped[str] = mapped_column(String(36), nullable=False, default="")
    requester_team_name: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    target_id: Mapped[str] = mapped_column(String(36), nullable=False, default="")
    target_title: Mapped[str] = mapped_column(String(300), nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    desired_role_or_skill: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    expected_benefit: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")  # pending | approved | rejected | completed
    reviewed_by: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    reviewer_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class Notification(Base):
    """Notification delivered to a user (employee or team leader)."""

    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False, default="")
    type: Mapped[str] = mapped_column(String(50), nullable=False, default="system")
    read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    action_url: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class InternalOpportunity(Base):
    """Internal role, gig, project, or mentorship opportunity."""

    __tablename__ = "internal_opportunities"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    type: Mapped[str] = mapped_column(String(50), nullable=False, default="project")  # role | gig | project | mentorship
    team: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    team_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    team_leader_name: Mapped[str] = mapped_column(String(150), nullable=False, default="")
    department: Mapped[str] = mapped_column(String(100), nullable=False, default="Engineering")
    location: Mapped[str] = mapped_column(String(100), nullable=False, default="Hybrid")
    is_remote: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    duration: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    required_skills: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    preferred_skills: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="open")
    created_by: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class EmployeeOpportunityMatch(Base):
    """Computed semantic match between an employee and an internal opportunity."""

    __tablename__ = "employee_opportunity_matches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    employee_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    opportunity_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    match_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    matched_skills: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    developing_skills: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    missing_skills: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    rationale: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_fallback: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class ExpressionOfInterest(Base):
    """Employee expresses interest / applies for an internal opportunity."""

    __tablename__ = "expression_of_interests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    employee_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    opportunity_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="expressed")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class CourseEnrollment(Base):
    """Employee enrollment in a learning resource / course."""

    __tablename__ = "course_enrollments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    employee_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    resource_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    provider: Mapped[str] = mapped_column(String(150), nullable=False, default="")
    skill_name: Mapped[str] = mapped_column(String(150), nullable=False, default="")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="enrolled")  # enrolled | completed
    progress_percentage: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    skills_gained: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class Certification(Base):
    """Employee certification."""

    __tablename__ = "certifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    employee_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    issuer: Mapped[str] = mapped_column(String(150), nullable=False, default="")
    issue_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    credential_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)


class SkillGap(Base):
    """Computed skill gap for an employee relative to a target role/opportunity."""

    __tablename__ = "skill_gaps"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    employee_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    skill_name: Mapped[str] = mapped_column(String(150), nullable=False)
    severity: Mapped[str] = mapped_column(String(50), nullable=False, default="medium")
    source: Mapped[str] = mapped_column(String(100), nullable=False, default="career_goal")
    target_role: Mapped[str] = mapped_column(String(150), nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Resume(Base):
    """Uploaded resume file metadata and extracted raw text."""

    __tablename__ = "resumes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    employee_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)
    filename: Mapped[str] = mapped_column(String(300), nullable=False)
    file_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    extracted_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="uploaded")  # uploaded | analyzed | failed
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class ResumeAnalysis(Base):
    """Structured analysis produced for a resume."""

    __tablename__ = "resume_analyses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    resume_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    structured_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    extracted_skills: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    model_used: Mapped[str] = mapped_column(String(100), nullable=False, default="deterministic")
    recommendation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    evaluated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class AIExtractionResult(Base):
    """Evidence rows produced by AI extraction (skills, experience, projects)."""

    __tablename__ = "ai_extraction_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)  # resume | project | profile_text
    source_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # skill | experience | project | achievement
    entity_name: Mapped[str] = mapped_column(String(300), nullable=False)
    evidence: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.5)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)