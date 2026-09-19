"""
Eagle Vision — Pydantic Schemas for HR Module
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr, field_validator


# ── Auth Schemas ──────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: Optional[str] = None
    role: str


# ── Project Schemas ───────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str
    department: str
    description: Optional[str] = None
    business_objective: Optional[str] = None
    duration_months: Optional[int] = None
    location: Optional[str] = None
    work_mode: str = "hybrid"
    headcount: int = 1
    priority: str = "medium"


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    description: Optional[str] = None
    business_objective: Optional[str] = None
    duration_months: Optional[int] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None
    headcount: Optional[int] = None
    priority: Optional[str] = None
    status: Optional[str] = None


class ProjectResponse(BaseModel):
    id: str
    name: str
    department: str
    description: Optional[str]
    business_objective: Optional[str]
    duration_months: Optional[int]
    location: Optional[str]
    work_mode: str
    headcount: int
    priority: str
    status: str
    created_at: datetime
    updated_at: datetime
    candidate_count: int = 0
    requirement_status: Optional[str] = None

    class Config:
        from_attributes = True


# ── Requirement Schemas ───────────────────────────────────────────────────────

class AnalyzeRequirementRequest(BaseModel):
    raw_description: str
    project_name: Optional[str] = None
    department: Optional[str] = None
    duration_months: Optional[int] = None
    headcount: Optional[int] = 1
    provider: Optional[str] = None  # "gemini", "claude", "openai", "groq", "deepseek", "ollama", "deterministic"
    api_key: Optional[str] = None
    model: Optional[str] = None


class RequiredSkillSchema(BaseModel):
    name: str
    level: str = "intermediate"
    importance: str = "high"


class ProjectRoleSchema(BaseModel):
    title: str
    headcount: int = 1


class RequirementConstraintsSchema(BaseModel):
    duration_months: Optional[int] = None
    work_mode: str = "hybrid"
    location: Optional[str] = None


class StructuredRequirementSchema(BaseModel):
    project_title: str
    roles: List[ProjectRoleSchema] = []
    required_skills: List[RequiredSkillSchema] = []
    preferred_skills: List[str] = []
    experience_years: float = 0.0
    responsibilities: List[str] = []
    constraints: RequirementConstraintsSchema = RequirementConstraintsSchema()


class RequirementResponse(BaseModel):
    id: str
    project_id: str
    raw_description: str
    status: str
    project_title: Optional[str]
    roles: List[Dict[str, Any]] = []
    required_skills: List[Dict[str, Any]] = []
    preferred_skills: List[str] = []
    experience_years: Optional[float]
    responsibilities: List[str] = []
    constraints: Optional[Dict[str, Any]]
    analyzed_at: Optional[datetime]
    published_at: Optional[datetime]
    created_at: datetime


class RequirementUpdateRequest(BaseModel):
    """HR can edit AI-generated requirement before publishing."""
    project_title: Optional[str] = None
    roles: Optional[List[ProjectRoleSchema]] = None
    required_skills: Optional[List[RequiredSkillSchema]] = None
    preferred_skills: Optional[List[str]] = None
    experience_years: Optional[float] = None
    responsibilities: Optional[List[str]] = None
    constraints: Optional[RequirementConstraintsSchema] = None


# ── Matching Schemas ─────────────────────────────────────────────────────────

class MatchResultResponse(BaseModel):
    employee_id: str
    full_name: str
    job_title: str
    department: str
    years_of_experience: float
    overall_score: float
    required_skill_score: float
    semantic_score: float
    experience_score: float
    proficiency_score: float
    preferred_skill_score: float
    matched_skills: List[str]
    skill_gaps: List[str]
    partial_matches: List[Dict[str, str]]
    explanation: str
    rank: int
    skills: List[Dict[str, Any]] = []


class CandidateDetailResponse(BaseModel):
    employee_id: str
    full_name: str
    first_name: str
    last_name: str
    job_title: str
    department: str
    location: str
    bio: Optional[str]
    years_of_experience: float
    open_to_remote: bool
    open_to_gigs: bool
    skills: List[Dict[str, Any]]
    work_experiences: List[Dict[str, Any]] = []
    educations: List[Dict[str, Any]] = []
    # Match analysis (populated when called in project context)
    match_analysis: Optional[Dict[str, Any]] = None
    learning_recommendations: List[Dict[str, Any]] = []


class CompareRequest(BaseModel):
    employee_ids: List[str]


class CompareResponse(BaseModel):
    project_id: str
    candidates: List[MatchResultResponse]


# ── Dashboard Schemas ─────────────────────────────────────────────────────────

class DashboardKPIs(BaseModel):
    active_projects: int
    open_requirements: int
    total_matches: int
    critical_skill_gaps: int


class SkillInsight(BaseModel):
    skill_name: str
    count: int
    trend: str = "stable"  # up, down, stable


class DashboardResponse(BaseModel):
    kpis: DashboardKPIs
    recent_projects: List[ProjectResponse]
    top_internal_skills: List[SkillInsight]
    most_requested_skills: List[SkillInsight]
    critical_gaps: List[SkillInsight]
    employees_ready_for_mobility: int


# ── Analytics Schemas ─────────────────────────────────────────────────────────

class AnalyticsResponse(BaseModel):
    total_employees: int
    total_skills: int
    total_projects: int
    avg_match_score: float
    skill_distribution: List[Dict[str, Any]]
    department_distribution: List[Dict[str, Any]]
    top_skill_gaps: List[Dict[str, Any]]


# ── Settings Schemas ──────────────────────────────────────────────────────────

class ScoringWeightsSchema(BaseModel):
    required_skill: float = 0.45
    semantic: float = 0.25
    experience: float = 0.15
    proficiency: float = 0.10
    preferred_skill: float = 0.05

    @field_validator("required_skill", "semantic", "experience", "proficiency", "preferred_skill")
    @classmethod
    def validate_weight(cls, v: float) -> float:
        if not 0.0 <= v <= 1.0:
            raise ValueError("Weight must be between 0.0 and 1.0")
        return round(v, 3)


class HRSettingsResponse(BaseModel):
    llm_provider: str
    embedding_provider: str
    scoring_weights: ScoringWeightsSchema
    db_mode: str
