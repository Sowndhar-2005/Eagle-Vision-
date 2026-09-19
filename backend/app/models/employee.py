"""
Eagle Vision — Employee Profile & Attributes ORM Models
"""

import uuid
from datetime import date, datetime, timezone
from typing import List, Optional
from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector

from app.core.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False
    )
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    job_title: Mapped[str] = mapped_column(String(150), nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    location: Mapped[str] = mapped_column(String(100), nullable=False)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    open_to_relocation: Mapped[bool] = mapped_column(Boolean, default=False)
    open_to_remote: Mapped[bool] = mapped_column(Boolean, default=True)
    open_to_gigs: Mapped[bool] = mapped_column(Boolean, default=True)
    open_to_roles: Mapped[bool] = mapped_column(Boolean, default=True)
    profile_embedding = mapped_column(Vector(768), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user: Mapped["User"] = relationship("User", back_populates="employee")
    skills: Mapped[List["EmployeeSkill"]] = relationship("EmployeeSkill", back_populates="employee")
    experiences: Mapped[List["WorkExperience"]] = relationship("WorkExperience", back_populates="employee")
    educations: Mapped[List["Education"]] = relationship("Education", back_populates="employee")


class EmployeeSkill(Base):
    __tablename__ = "employee_skills"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("skills.id"), nullable=False
    )
    proficiency_level: Mapped[int] = mapped_column(Integer, default=1) # 1-5 scale
    years_of_experience: Mapped[float] = mapped_column(Float, default=0.0)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_hidden_transferable: Mapped[bool] = mapped_column(Boolean, default=False)

    employee: Mapped["Employee"] = relationship("Employee", back_populates="skills")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="employee_skills")


class WorkExperience(Base):
    __tablename__ = "work_experiences"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False
    )
    company_name: Mapped[str] = mapped_column(String(150), nullable=False)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False)

    employee: Mapped["Employee"] = relationship("Employee", back_populates="experiences")


class Education(Base):
    __tablename__ = "educations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False
    )
    institution: Mapped[str] = mapped_column(String(200), nullable=False)
    degree: Mapped[str] = mapped_column(String(150), nullable=False)
    field_of_study: Mapped[str] = mapped_column(String(150), nullable=False)
    graduation_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    employee: Mapped["Employee"] = relationship("Employee", back_populates="educations")
