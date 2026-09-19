"""
Pydantic schemas and domain models for Resume Analysis Agent.
Compatible with standard JSON Resume and dynamic Role Rubric definitions.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ==============================================================================
# 1. JSON Resume Specification Models
# ==============================================================================

class ProfileLink(BaseModel):
    """Social/Professional network profile link."""
    network: str = Field(default="", description="Platform name, e.g. GitHub, LinkedIn")
    username: str = Field(default="", description="Handle/Username on platform")
    url: str = Field(default="", description="Full profile URL")


class Location(BaseModel):
    """Geographical location details."""
    city: Optional[str] = None
    country_code: Optional[str] = None
    region: Optional[str] = None


class Basics(BaseModel):
    """Personal contact & identity information."""
    name: str = Field(default="Candidate", description="Full legal or professional name")
    email: Optional[str] = None
    phone: Optional[str] = None
    url: Optional[str] = None
    summary: Optional[str] = None
    location: Optional[Location] = None
    profiles: List[ProfileLink] = Field(default_factory=list)


class WorkExperience(BaseModel):
    """Professional work history."""
    company: str
    position: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    summary: Optional[str] = None
    highlights: List[str] = Field(default_factory=list)


class Education(BaseModel):
    """Academic credentials."""
    institution: str
    area: Optional[str] = None
    study_type: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    score: Optional[str] = None


class SkillItem(BaseModel):
    """Skills and proficiency keywords."""
    name: str
    level: Optional[str] = None
    keywords: List[str] = Field(default_factory=list)


class Project(BaseModel):
    """Key personal, open source, or professional projects."""
    name: str
    description: Optional[str] = None
    highlights: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    url: Optional[str] = None


class Certificate(BaseModel):
    """Professional certifications."""
    name: str
    date: Optional[str] = None
    issuer: Optional[str] = None
    url: Optional[str] = None


class Award(BaseModel):
    """Honors and recognitions."""
    title: str
    date: Optional[str] = None
    awarder: Optional[str] = None
    summary: Optional[str] = None


class JSONResume(BaseModel):
    """Standardized representation of a parsed resume."""
    basics: Basics = Field(default_factory=Basics)
    work: List[WorkExperience] = Field(default_factory=list)
    education: List[Education] = Field(default_factory=list)
    skills: List[SkillItem] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)
    certificates: List[Certificate] = Field(default_factory=list)
    awards: List[Award] = Field(default_factory=list)

    def extract_github_username(self) -> Optional[str]:
        """Extract GitHub handle from profile links or url if present."""
        import re
        # 1. Check profile links
        for profile in self.basics.profiles:
            if "github" in profile.network.lower() or "github.com" in profile.url.lower():
                if profile.username:
                    return profile.username.strip().lstrip("@")
                match = re.search(r"github\.com/([a-zA-Z0-9\-_]+)", profile.url)
                if match:
                    return match.group(1)
        # 2. Check main url
        if self.basics.url and "github.com" in self.basics.url:
            match = re.search(r"github\.com/([a-zA-Z0-9\-_]+)", self.basics.url)
            if match:
                return match.group(1)
        # 3. Check project URLs
        for proj in self.projects:
            if proj.url and "github.com" in proj.url:
                match = re.search(r"github\.com/([a-zA-Z0-9\-_]+)/", proj.url)
                if match:
                    return match.group(1)
        return None


# ==============================================================================
# 2. External GitHub Signal Models
# ==============================================================================

class GitHubRepoSignal(BaseModel):
    """Signals extracted from a single GitHub repository."""
    name: str
    description: Optional[str] = None
    stars: int = 0
    forks: int = 0
    language: Optional[str] = None
    is_fork: bool = False
    url: str = ""


class GitHubSignal(BaseModel):
    """Aggregated GitHub candidate signals."""
    username: str
    public_repos_count: int = 0
    total_stars: int = 0
    primary_languages: List[str] = Field(default_factory=list)
    top_repositories: List[GitHubRepoSignal] = Field(default_factory=list)
    bio: Optional[str] = None
    followers: int = 0


# ==============================================================================
# 3. Role Rubric & Evaluation Models
# ==============================================================================

class ScoringCategory(BaseModel):
    """Specification of a single evaluation category within a role rubric."""
    key: str = Field(description="Unique snake_case identifier")
    label: str = Field(description="Human readable category name")
    max: int = Field(gt=0, description="Maximum points attainable in this category")
    description: str = Field(default="", description="Scoring criteria guidance")
    icon: str = Field(default="•", description="Visual indicator emoji or glyph")


class RoleRubric(BaseModel):
    """Complete rubric definition for a role."""
    name: str = Field(description="Unique role key, e.g. software_engineering_intern")
    position_title: str = Field(description="Formal title, e.g. Software Engineering Intern")
    categories: List[ScoringCategory]
    bonus_max: int = Field(default=10, ge=0)
    bonus_criteria: str = Field(default="")
    deductions_criteria: str = Field(default="")
    min_final_score: int = Field(default=0)
    max_final_score: int = Field(default=110)
    passing_cutoff: int = Field(default=60)


class CategoryScore(BaseModel):
    """Evaluation result for one rubric category."""
    category_key: str
    label: str
    score: float
    max: int
    evidence: str = Field(description="Direct textual proof justifying this score")
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)


class EvaluationResult(BaseModel):
    """Comprehensive evaluation results against a specified role."""
    role_name: str
    position_title: str
    candidate_name: str
    category_scores: Dict[str, CategoryScore]
    bonus_points: float = 0.0
    bonus_evidence: str = ""
    deductions: float = 0.0
    deduction_evidence: str = ""
    raw_score: float
    max_possible_raw: float
    normalized_score: float = Field(description="Score scaled to 0-100")
    recommendation: str = Field(description="Strong Hire, Hire, Borderline, or Do Not Advance")
    summary_rationale: str = Field(description="Executive hiring summary explaining the score")


class AnalysisReport(BaseModel):
    """Complete end-to-end resume analysis output."""
    resume: JSONResume
    github_signals: Optional[GitHubSignal] = None
    evaluation: EvaluationResult
    evaluated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
