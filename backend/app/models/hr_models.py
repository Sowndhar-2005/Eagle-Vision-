"""
Eagle Vision — HR Module ORM Models
Covers: Projects, Project Requirements, Match Results, Skill Gaps, Audit Logs
"""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.dialects.sqlite import JSON as SQLITE_JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Department(Base):
    """Organizational departments."""
    __tablename__ = "departments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    head_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


class HRProject(Base):
    """HR-managed internal projects / opportunities requiring talent matching."""
    __tablename__ = "hr_projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    business_objective: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    duration_months: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    work_mode: Mapped[str] = mapped_column(String(50), default="hybrid")  # remote, hybrid, onsite
    headcount: Mapped[int] = mapped_column(Integer, default=1)
    priority: Mapped[str] = mapped_column(String(50), default="medium")  # low, medium, high, critical
    status: Mapped[str] = mapped_column(String(50), default="draft")  # draft, active, completed, cancelled
    created_by: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    requirements: Mapped[List["ProjectRequirement"]] = relationship(
        "ProjectRequirement", back_populates="project", cascade="all, delete-orphan"
    )
    match_results: Mapped[List["MatchResult"]] = relationship(
        "MatchResult", back_populates="project", cascade="all, delete-orphan"
    )


class ProjectRequirement(Base):
    """AI-analyzed and HR-approved structured project requirements."""
    __tablename__ = "project_requirements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("hr_projects.id"), nullable=False)

    # Raw input from HR
    raw_description: Mapped[str] = mapped_column(Text, nullable=False)

    # AI-extracted structured data (stored as JSON)
    project_title: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    roles_json: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)         # [{title, headcount}]
    required_skills_json: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)  # [{name, level, importance}]
    preferred_skills_json: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True) # [str]
    experience_years: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    responsibilities_json: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)  # [str]
    constraints_json: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)  # {duration_months, work_mode, ...}

    # Embedding of the full requirement text (stored as JSON list of floats)
    embedding_json: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)

    # Status
    status: Mapped[str] = mapped_column(String(50), default="draft")  # draft, analyzed, published

    # Metadata
    analyzed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    project: Mapped["HRProject"] = relationship("HRProject", back_populates="requirements")


class MatchResult(Base):
    """Stores hybrid matching results for a project-employee pair."""
    __tablename__ = "match_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("hr_projects.id"), nullable=False)
    requirement_id: Mapped[str] = mapped_column(String(36), ForeignKey("project_requirements.id"), nullable=False)
    employee_id: Mapped[str] = mapped_column(String(36), ForeignKey("employees.id"), nullable=False)

    # Score breakdown (0-100 scale for each component)
    overall_score: Mapped[float] = mapped_column(Float, default=0.0)
    required_skill_score: Mapped[float] = mapped_column(Float, default=0.0)
    semantic_score: Mapped[float] = mapped_column(Float, default=0.0)
    experience_score: Mapped[float] = mapped_column(Float, default=0.0)
    proficiency_score: Mapped[float] = mapped_column(Float, default=0.0)
    preferred_skill_score: Mapped[float] = mapped_column(Float, default=0.0)

    # Detailed result data
    matched_skills_json: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)   # [str]
    skill_gaps_json: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)        # [str]
    partial_matches_json: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)   # [{skill, gap}]
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Rank within the project's matching run
    rank: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    project: Mapped["HRProject"] = relationship("HRProject", back_populates="match_results")


class LearningResource(Base):
    """Internal and external learning resources for skill gap closure."""
    __tablename__ = "learning_resources"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    provider: Mapped[str] = mapped_column(String(100), nullable=False)  # Coursera, Udemy, Internal, etc.
    url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    skill_name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    skill_level: Mapped[str] = mapped_column(String(50), default="beginner")  # beginner, intermediate, advanced
    duration_hours: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    resource_type: Mapped[str] = mapped_column(String(50), default="course")  # course, book, workshop, video
    is_free: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


class AuditLog(Base):
    """Audit trail for important HR actions."""
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(50), nullable=False)
    resource_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    details_json: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
