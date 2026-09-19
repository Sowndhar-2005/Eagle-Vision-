"""
Eagle Vision — Employee Profile Schemas
"""

import uuid
from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field

from app.schemas.skill import SkillRead


class EmployeeSkillRead(BaseModel):
    id: uuid.UUID
    skill: SkillRead
    proficiency_level: int
    years_of_experience: float
    is_verified: bool
    is_hidden_transferable: bool

    class Config:
        from_attributes = True


class WorkExperienceRead(BaseModel):
    id: uuid.UUID
    company_name: str
    title: str
    description: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    is_current: bool

    class Config:
        from_attributes = True


class EducationRead(BaseModel):
    id: uuid.UUID
    institution: str
    degree: str
    field_of_study: str
    graduation_year: Optional[int] = None

    class Config:
        from_attributes = True


class EmployeeBase(BaseModel):
    first_name: str
    last_name: str
    job_title: str
    department: str
    location: str
    bio: Optional[str] = None
    open_to_relocation: bool = False
    open_to_remote: bool = True
    open_to_gigs: bool = True
    open_to_roles: bool = True


class EmployeeCreate(EmployeeBase):
    user_id: uuid.UUID


class EmployeeUpdate(BaseModel):
    job_title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    open_to_relocation: Optional[bool] = None
    open_to_remote: Optional[bool] = None
    open_to_gigs: Optional[bool] = None
    open_to_roles: Optional[bool] = None


class EmployeeRead(EmployeeBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


class EmployeeDetailRead(EmployeeRead):
    skills: List[EmployeeSkillRead] = []
    experiences: List[WorkExperienceRead] = []
    educations: List[EducationRead] = []
