"""
Eagle Vision — Skill & Taxonomy ORM Models (SQLite-compatible, no pgvector)
"""

import uuid
from typing import List, Optional
from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SkillTaxonomyCategory(Base):
    __tablename__ = "skill_taxonomy_categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    skills: Mapped[List["Skill"]] = relationship("Skill", back_populates="category")


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("skill_taxonomy_categories.id"), nullable=True
    )
    skill_type: Mapped[str] = mapped_column(String(50), default="technical", nullable=False)
    # Embedding stored as JSON list of floats in SQLite mode
    embedding_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    category: Mapped[Optional["SkillTaxonomyCategory"]] = relationship("SkillTaxonomyCategory", back_populates="skills")
    employee_skills: Mapped[List["EmployeeSkill"]] = relationship("EmployeeSkill", back_populates="skill")
