"""
Eagle Vision — Gap Analyzer & Learning Recommendation Engine
"""

import json
from pathlib import Path
from typing import Any, Dict, List

from app.ai.llm_provider import get_llm_provider, DeterministicLocalProvider
from app.ai.skill_extractor import normalize_skill


class RecommendedCourse:
    def __init__(
        self,
        skill: str,
        course_title: str,
        provider: str,
        duration_hours: int = 10,
        level: str = "intermediate",
        reason: str = "",
        url: str = "",
    ):
        self.skill = skill
        self.course_title = course_title
        self.provider = provider
        self.duration_hours = duration_hours
        self.level = level
        self.reason = reason
        self.url = url

    def to_dict(self) -> dict:
        return {
            "skill": self.skill,
            "course_title": self.course_title,
            "provider": self.provider,
            "duration_hours": self.duration_hours,
            "level": self.level,
            "reason": self.reason,
            "url": self.url,
        }


class RecommendationEngine:
    """
    Generates targeted learning recommendations for skill gaps,
    using LLM with deterministic fallback for reliability.
    """

    def __init__(self):
        self._llm = get_llm_provider()
        self._fallback = DeterministicLocalProvider()
        self._prompt = self._load_prompt()

    def _load_prompt(self) -> str:
        path = Path(__file__).parent / "prompts" / "learning_recommendation.txt"
        return path.read_text(encoding="utf-8") if path.exists() else ""

    def recommend_for_gaps(
        self,
        employee_name: str,
        current_role: str,
        skill_gaps: List[str],
        project_context: str = "",
    ) -> List[RecommendedCourse]:
        """Generate learning recommendations for identified skill gaps."""
        if not skill_gaps:
            return []

        payload = json.dumps({
            "employee_name": employee_name,
            "current_role": current_role,
            "skill_gaps": skill_gaps,
            "project_context": project_context,
        })

        try:
            raw = self._llm.generate(self._prompt, payload)
            data = self._llm._parse_json(raw)
            if isinstance(data, list):
                return [
                    RecommendedCourse(
                        skill=r.get("skill", ""),
                        course_title=r.get("course_title", ""),
                        provider=r.get("provider", ""),
                        duration_hours=r.get("duration_hours", 10),
                        level=r.get("level", "intermediate"),
                        reason=r.get("reason", ""),
                        url=r.get("url", ""),
                    )
                    for r in data
                ]
        except Exception:
            pass

        # Deterministic fallback
        try:
            raw2 = self._fallback.generate(
                "You are a learning specialist. Generate learning recommendations for skill gaps.",
                payload,
            )
            data2 = json.loads(raw2)
            if isinstance(data2, list):
                return [
                    RecommendedCourse(
                        skill=r.get("skill", ""),
                        course_title=r.get("course_title", f"{r.get('skill', 'Skill')} Fundamentals"),
                        provider=r.get("provider", "Udemy"),
                        duration_hours=r.get("duration_hours", 10),
                        level=r.get("level", "intermediate"),
                        reason=r.get("reason", ""),
                    )
                    for r in data2
                ]
        except Exception:
            pass

        # Hardcoded last resort
        return [
            RecommendedCourse(
                skill=gap,
                course_title=f"{gap} — Complete Guide",
                provider="Udemy",
                duration_hours=10,
                level="intermediate",
                reason=f"Closes the {gap} skill gap identified for this project.",
            )
            for gap in skill_gaps
        ]
