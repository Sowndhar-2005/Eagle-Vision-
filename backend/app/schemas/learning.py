"""
Eagle Vision — Learning Path & Course Schemas
"""

import uuid
from typing import List, Optional
from pydantic import BaseModel, Field


class CourseRead(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    provider: str
    url: Optional[str] = None
    duration_hours: float
    difficulty_level: str

    class Config:
        from_attributes = True


class LearningPathItemRead(BaseModel):
    id: uuid.UUID
    title: str
    sequence_order: int
    is_completed: bool
    course: Optional[CourseRead] = None

    class Config:
        from_attributes = True


class LearningPathBase(BaseModel):
    title: str
    target_role_or_goal: str
    estimated_weeks: int = 4


class LearningPathCreate(LearningPathBase):
    pass


class LearningPathRead(LearningPathBase):
    id: uuid.UUID
    status: str
    items: List[LearningPathItemRead] = []

    class Config:
        from_attributes = True
