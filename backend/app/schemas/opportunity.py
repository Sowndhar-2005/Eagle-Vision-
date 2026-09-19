"""
Eagle Vision — Opportunity & Application Schemas
"""

import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

from app.schemas.skill import SkillRead


class OpportunitySkillRead(BaseModel):
    id: uuid.UUID
    skill: SkillRead
    min_proficiency: int
    is_mandatory: bool
    importance_weight: float

    class Config:
        from_attributes = True


class OpportunityBase(BaseModel):
    title: str = Field(..., max_length=200)
    description: str
    type: str = Field(default="role") # role, gig, mentorship, shadowing
    department: str
    location: str
    is_remote: bool = True


class OpportunityCreate(OpportunityBase):
    pass


class OpportunityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    is_remote: Optional[bool] = None


class OpportunityRead(OpportunityBase):
    id: uuid.UUID
    status: str
    created_at: datetime
    required_skills: List[OpportunitySkillRead] = []

    class Config:
        from_attributes = True


class ApplicationCreate(BaseModel):
    opportunity_id: uuid.UUID


class ApplicationRead(BaseModel):
    id: uuid.UUID
    opportunity_id: uuid.UUID
    employee_id: uuid.UUID
    match_score: float
    status: str
    applied_at: datetime

    class Config:
        from_attributes = True
