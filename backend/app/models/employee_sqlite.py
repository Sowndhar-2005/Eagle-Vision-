"""
Eagle Vision — Employee ORM Models (SQLite-compatible, no pgvector)
"""

import uuid
from datetime import date, datetime, timezone
from typing import List, Optional
from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), unique=True, nullable=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    job_title: Mapped[str] = mapped_column(String(150), nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    location: Mapped[str] = mapped_column(String(100), nullable=False, default="Chennai, India")
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    years_of_experience: Mapped[float] = mapped_column(Float, default=0.0)
    open_to_relocation: Mapped[bool] = mapped_column(Boolean, default=False)
    open_to_remote: Mapped[bool] = mapped_column(Boolean, default=True)
    open_to_gigs: Mapped[bool] = mapped_column(Boolean, default=True)
    open_to_roles: Mapped[bool] = mapped_column(Boolean, default=True)
    team_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)
    persona: Mapped[str] = mapped_column(String(50), default="growth_employee", nullable=False)
    professional_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    avatar: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    joining_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    project_history_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # profile_embedding stored as JSON (list of floats) in SQLite mode
    profile_embedding_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user: Mapped[Optional["User"]] = relationship("User", back_populates="employee")
    skills: Mapped[List["EmployeeSkill"]] = relationship("EmployeeSkill", back_populates="employee")
    experiences: Mapped[List["WorkExperience"]] = relationship("WorkExperience", back_populates="employee")
    educations: Mapped[List["Education"]] = relationship("Education", back_populates="employee")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"


class EmployeeSkill(Base):
    __tablename__ = "employee_skills"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id: Mapped[str] = mapped_column(String(36), ForeignKey("employees.id"), nullable=False)
    skill_id: Mapped[str] = mapped_column(String(36), ForeignKey("skills.id"), nullable=False)
    proficiency_level: Mapped[int] = mapped_column(Integer, default=1)  # 1-5 scale
    years_of_experience: Mapped[float] = mapped_column(Float, default=0.0)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_hidden_transferable: Mapped[bool] = mapped_column(Boolean, default=False)
    evidence: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    evidence_source: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    employee: Mapped["Employee"] = relationship("Employee", back_populates="skills")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="employee_skills")


class WorkExperience(Base):
    __tablename__ = "work_experiences"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id: Mapped[str] = mapped_column(String(36), ForeignKey("employees.id"), nullable=False)
    company_name: Mapped[str] = mapped_column(String(150), nullable=False)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False)

    employee: Mapped["Employee"] = relationship("Employee", back_populates="experiences")


class Education(Base):
    __tablename__ = "educations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id: Mapped[str] = mapped_column(String(36), ForeignKey("employees.id"), nullable=False)
    institution: Mapped[str] = mapped_column(String(200), nullable=False)
    degree: Mapped[str] = mapped_column(String(150), nullable=False)
    field_of_study: Mapped[str] = mapped_column(String(150), nullable=False)
    graduation_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    employee: Mapped["Employee"] = relationship("Employee", back_populates="educations")
