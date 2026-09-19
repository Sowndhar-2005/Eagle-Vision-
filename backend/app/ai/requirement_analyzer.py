"""
Eagle Vision — Requirement Analyzer
Orchestrates LLM-based or deterministic extraction of structured project requirements
"""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, field_validator, model_validator

from app.ai.llm_provider import get_llm_provider
from app.ai.skill_extractor import normalize_skill


class RequiredSkill(BaseModel):
    name: str
    level: str = "intermediate"  # beginner, intermediate, advanced, expert
    importance: str = "high"      # critical, high, medium, low

    @field_validator("level")
    @classmethod
    def validate_level(cls, v: str) -> str:
        valid = {"beginner", "intermediate", "advanced", "expert"}
        return v.lower() if v.lower() in valid else "intermediate"

    @field_validator("importance")
    @classmethod
    def validate_importance(cls, v: str) -> str:
        valid = {"critical", "high", "medium", "low"}
        return v.lower() if v.lower() in valid else "high"


class ProjectRole(BaseModel):
    title: str
    headcount: int = 1


class RequirementConstraints(BaseModel):
    duration_months: Optional[int] = None
    work_mode: str = "hybrid"
    location: Optional[str] = None


class StructuredRequirement(BaseModel):
    """Pydantic model for AI-extracted and HR-validated project requirements."""
    project_title: str
    roles: List[ProjectRole] = []
    required_skills: List[RequiredSkill] = []
    preferred_skills: List[str] = []
    experience_years: float = 0.0
    responsibilities: List[str] = []
    constraints: RequirementConstraints = RequirementConstraints()

    @model_validator(mode="after")
    def normalize_skills(self) -> "StructuredRequirement":
        """Normalize skill names and remove duplicates."""
        seen = set()
        normalized = []
        for skill in self.required_skills:
            canonical = normalize_skill(skill.name)
            if canonical.lower() not in seen:
                seen.add(canonical.lower())
                normalized.append(RequiredSkill(
                    name=canonical,
                    level=skill.level,
                    importance=skill.importance
                ))
        self.required_skills = normalized

        seen_pref = set()
        norm_pref = []
        for s in self.preferred_skills:
            canonical = normalize_skill(s)
            if canonical.lower() not in seen_pref:
                seen_pref.add(canonical.lower())
                norm_pref.append(canonical)
        self.preferred_skills = norm_pref

        # Clamp experience
        if self.experience_years < 0:
            self.experience_years = 0.0
        if self.experience_years > 30:
            self.experience_years = 30.0

        return self


class RequirementAnalyzer:
    """Orchestrates AI-powered requirement extraction."""

    def __init__(self):
        self._llm = get_llm_provider()
        self._system_prompt = self._load_prompt("requirement_analysis.txt")

    def _load_prompt(self, filename: str) -> str:
        prompt_path = Path(__file__).parent / "prompts" / filename
        if prompt_path.exists():
            return prompt_path.read_text(encoding="utf-8")
        return "You are an expert HR requirement analyst. Extract structured JSON from the input."

    def analyze(
        self,
        project_name: str,
        description: str,
        department: str = "",
        duration_months: Optional[int] = None,
        headcount: int = 1,
    ) -> StructuredRequirement:
        """
        Analyze a natural-language project requirement and return a StructuredRequirement.

        Raises ValueError if the AI output cannot be parsed or validated.
        """
        user_message = json.dumps({
            "project_name": project_name,
            "description": description,
            "department": department,
            "duration_months": duration_months,
            "headcount": headcount,
        })

        raw = self._llm.generate(self._system_prompt, user_message)

        # Parse JSON
        try:
            data = self._llm._parse_json(raw)
        except ValueError:
            # Try deterministic fallback on parse failure
            from app.ai.llm_provider import DeterministicLocalProvider
            fallback = DeterministicLocalProvider()
            raw2 = fallback.generate(self._system_prompt, user_message)
            data = json.loads(raw2)

        # Validate and normalize through Pydantic
        try:
            requirement = StructuredRequirement(**data)
        except Exception as e:
            raise ValueError(f"Requirement validation failed: {e}. Raw data: {data}")

        # Ensure project title is set
        if not requirement.project_title or requirement.project_title.lower() == "project":
            requirement.project_title = project_name

        return requirement

    def to_embedding_text(self, req: StructuredRequirement) -> str:
        """Convert a structured requirement to a rich text for embedding."""
        parts = [req.project_title]
        for r in req.roles:
            parts.append(f"Role: {r.title}")
        for s in req.required_skills:
            parts.append(f"{s.name} {s.level} {s.importance}")
        parts.extend(req.preferred_skills)
        if req.experience_years:
            parts.append(f"{req.experience_years} years experience")
        parts.extend(req.responsibilities[:3])
        return " ".join(parts)
