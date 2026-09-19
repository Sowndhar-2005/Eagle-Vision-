"""
Eagle Vision — SQLAlchemy ORM Models Package
"""

from app.core.database import Base
from app.core.config import settings
from app.models.user import User
from app.models.hr_models import (
    Department,
    HRProject,
    ProjectRequirement,
    MatchResult,
    LearningResource,
    AuditLog,
)

# Load full employee/skill/opportunity models (these use pgvector conditionally)
if settings.DB_MODE == "sqlite":
    from app.models.employee_sqlite import Employee, EmployeeSkill, WorkExperience, Education
    from app.models.skill_sqlite import Skill, SkillTaxonomyCategory
else:
    from app.models.employee import Employee, EmployeeSkill, WorkExperience, Education
    from app.models.skill import Skill, SkillRelationship, SkillTaxonomyCategory

__all__ = [
    "Base",
    "User",
    "Department",
    "HRProject",
    "ProjectRequirement",
    "MatchResult",
    "LearningResource",
    "AuditLog",
    "Employee",
    "EmployeeSkill",
    "WorkExperience",
    "Education",
    "Skill",
    "SkillTaxonomyCategory",
]
