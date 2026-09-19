"""
Eagle Vision — Skill & Taxonomy ORM Models
"""

import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector

from app.core.database import Base


class SkillTaxonomyCategory(Base):
    __tablename__ = "skill_taxonomy_categories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    skills: Mapped[List["Skill"]] = relationship("Skill", back_populates="category")


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("skill_taxonomy_categories.id"), nullable=True
    )
    skill_type: Mapped[str] = mapped_column(String(50), default="technical", nullable=False) # technical, soft, domain
    embedding = mapped_column(Vector(768), nullable=True) # 768-dim text-embedding-004

    category: Mapped[Optional["SkillTaxonomyCategory"]] = relationship("SkillTaxonomyCategory", back_populates="skills")
    employee_skills: Mapped[List["EmployeeSkill"]] = relationship("EmployeeSkill", back_populates="skill")


class SkillRelationship(Base):
    __tablename__ = "skill_relationships"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    source_skill_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("skills.id"), nullable=False
    )
    target_skill_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("skills.id"), nullable=False
    )
    relationship_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    ) # parent_of, relates_to, transfers_to, requires
    weight: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
