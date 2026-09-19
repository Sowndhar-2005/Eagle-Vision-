"""
Eagle Vision — Pydantic Request/Response Schemas Package
"""

from app.schemas.user import UserCreate, UserRead, UserLogin, Token, TokenPayload
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeRead, EmployeeDetailRead
from app.schemas.skill import SkillCreate, SkillRead, SkillGraphNode, SkillGraphEdge
from app.schemas.opportunity import OpportunityCreate, OpportunityUpdate, OpportunityRead, ApplicationCreate, ApplicationRead
from app.schemas.learning import LearningPathCreate, LearningPathRead, CourseRead

__all__ = [
    "UserCreate",
    "UserRead",
    "UserLogin",
    "Token",
    "TokenPayload",
    "EmployeeCreate",
    "EmployeeUpdate",
    "EmployeeRead",
    "EmployeeDetailRead",
    "SkillCreate",
    "SkillRead",
    "SkillGraphNode",
    "SkillGraphEdge",
    "OpportunityCreate",
    "OpportunityUpdate",
    "OpportunityRead",
    "ApplicationCreate",
    "ApplicationRead",
    "LearningPathCreate",
    "LearningPathRead",
    "CourseRead",
]
