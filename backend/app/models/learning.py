"""
Eagle Vision — Learning Resources & Upskilling Paths ORM Models
"""

import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    provider: Mapped[str] = mapped_column(String(100), default="internal") # internal, Coursera, Udemy, etc.
    url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    duration_hours: Mapped[float] = mapped_column(Float, default=0.0)
    difficulty_level: Mapped[str] = mapped_column(String(50), default="intermediate") # beginner, intermediate, advanced


class LearningPath(Base):
    __tablename__ = "learning_paths"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    target_role_or_goal: Mapped[str] = mapped_column(String(200), nullable=False)
    estimated_weeks: Mapped[int] = mapped_column(Integer, default=4)
    status: Mapped[str] = mapped_column(String(50), default="in_progress") # in_progress, completed, paused
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    items: Mapped[List["LearningPathItem"]] = relationship(
        "LearningPathItem", back_populates="learning_path"
    )


class LearningPathItem(Base):
    __tablename__ = "learning_path_items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    learning_path_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("learning_paths.id"), nullable=False
    )
    course_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    sequence_order: Mapped[int] = mapped_column(Integer, default=1)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)

    learning_path: Mapped["LearningPath"] = relationship("LearningPath", back_populates="items")
