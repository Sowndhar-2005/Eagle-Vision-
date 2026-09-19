"""
Eagle Vision — Skill & Graph Schemas
"""

import uuid
from typing import List, Optional
from pydantic import BaseModel, Field


class SkillBase(BaseModel):
    name: str = Field(..., max_length=150)
    description: Optional[str] = None
    skill_type: str = Field(default="technical")


class SkillCreate(SkillBase):
    category_id: Optional[uuid.UUID] = None


class SkillRead(SkillBase):
    id: uuid.UUID
    category_id: Optional[uuid.UUID] = None

    class Config:
        from_attributes = True


class SkillGraphNode(BaseModel):
    id: str
    label: str
    group: str
    weight: float = 1.0


class SkillGraphEdge(BaseModel):
    source: str
    target: str
    relationship: str
    weight: float = 1.0
