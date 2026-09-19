"""
Eagle Vision — Hybrid Matching Engine
Implements explainable scoring: Required Skills + Semantic + Experience + Proficiency + Preferred Skills
"""

import json
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

from app.ai.embedding_service import EmbeddingProvider, get_embedding_singleton
from app.ai.llm_provider import DeterministicLocalProvider, get_llm_provider
from app.ai.requirement_analyzer import StructuredRequirement, RequiredSkill
from app.ai.skill_extractor import normalize_skill
from app.core.config import settings

# ──────────────────────────────────────────────────────────────────────────────
# Scoring Configuration (configurable via settings)
# ──────────────────────────────────────────────────────────────────────────────

WEIGHTS = {
    "required_skill": settings.WEIGHT_REQUIRED_SKILL,
    "semantic": settings.WEIGHT_SEMANTIC,
    "experience": settings.WEIGHT_EXPERIENCE,
    "proficiency": settings.WEIGHT_PROFICIENCY,
    "preferred_skill": settings.WEIGHT_PREFERRED_SKILL,
}

PROFICIENCY_REQUIRED = {
    "beginner": 1, "intermediate": 2, "advanced": 3, "expert": 4,
}


@dataclass
class MatchScoreBreakdown:
    """Full explainable score breakdown for a single candidate."""
    employee_id: str
    overall_score: float = 0.0
    required_skill_score: float = 0.0
    semantic_score: float = 0.0
    experience_score: float = 0.0
    proficiency_score: float = 0.0
    preferred_skill_score: float = 0.0
    matched_skills: List[str] = field(default_factory=list)
    skill_gaps: List[str] = field(default_factory=list)
    partial_matches: List[Dict[str, str]] = field(default_factory=list)
    explanation: str = ""


class MatchingEngine:
    """
    Hybrid matching engine combining:
    1. Required Skill Match (exact + normalized, weighted by importance)
    2. Semantic Similarity (cosine similarity of requirement vs employee embeddings)
    3. Experience Fit (years of experience vs requirement)
    4. Proficiency Fit (skill proficiency level match)
    5. Preferred Skill Bonus
    """

    def __init__(self):
        self._embedder: EmbeddingProvider = get_embedding_singleton()
        self._llm = get_llm_provider()
        self._explanation_provider = DeterministicLocalProvider()  # Always available

    # ─── Public API ─────────────────────────────────────────────────────────

    def match_candidates(
        self,
        requirement: StructuredRequirement,
        employees: List[Dict[str, Any]],
        requirement_text: str = "",
    ) -> List[MatchScoreBreakdown]:
        """
        Score and rank all employees against a project requirement.

        Args:
            requirement: Structured extracted requirement
            employees: List of dicts with keys: id, full_name, years_of_experience,
                       skills=[{name, proficiency_level, years_of_experience}],
                       skill_text (optional, for embedding)
            requirement_text: Rich text representation of the requirement (for embedding)
        Returns:
            List of MatchScoreBreakdown, sorted by overall_score descending
        """
        if not employees:
            return []

        # Generate requirement embedding
        req_text = requirement_text or self._requirement_to_text(requirement)
        req_embedding = self._embedder.embed(req_text)

        results: List[MatchScoreBreakdown] = []
        for emp in employees:
            score = self._score_employee(requirement, emp, req_embedding)
            results.append(score)

        # Sort descending by overall score
        results.sort(key=lambda x: x.overall_score, reverse=True)

        # Assign ranks
        for i, r in enumerate(results):
            pass  # rank is positional index + 1

        return results

    # ─── Scoring Components ──────────────────────────────────────────────────

    def _score_employee(
        self,
        req: StructuredRequirement,
        emp: Dict[str, Any],
        req_embedding: List[float],
    ) -> MatchScoreBreakdown:
        """Compute full hybrid score for one employee."""
        result = MatchScoreBreakdown(employee_id=emp["id"])

        emp_skills = emp.get("skills", [])  # [{name, proficiency_level, years_of_experience}]
        emp_skill_names = {normalize_skill(s["name"]).lower() for s in emp_skills}
        emp_skill_map = {normalize_skill(s["name"]).lower(): s for s in emp_skills}
        emp_years = emp.get("years_of_experience", 0.0)

        # 1. Required Skill Match Score
        req_skill_score, matched, gaps, partial = self._score_required_skills(
            req.required_skills, emp_skill_names, emp_skill_map
        )
        result.required_skill_score = req_skill_score
        result.matched_skills = matched
        result.skill_gaps = gaps
        result.partial_matches = partial

        # 2. Semantic Similarity Score
        emp_text = self._employee_to_text(emp)
        emp_embedding = self._embedder.embed(emp_text)
        from app.ai.embedding_service import EmbeddingProvider
        sim = EmbeddingProvider.cosine_similarity(req_embedding, emp_embedding)
        result.semantic_score = round(min(sim * 100, 100.0), 1)

        # 3. Experience Fit Score
        result.experience_score = self._score_experience(req.experience_years, emp_years)

        # 4. Proficiency Fit Score
        result.proficiency_score = self._score_proficiency(
            req.required_skills, emp_skill_map, matched
        )

        # 5. Preferred Skill Bonus Score
        result.preferred_skill_score = self._score_preferred(
            req.preferred_skills, emp_skill_names
        )

        # Weighted overall score
        result.overall_score = round(
            WEIGHTS["required_skill"] * result.required_skill_score
            + WEIGHTS["semantic"] * result.semantic_score
            + WEIGHTS["experience"] * result.experience_score
            + WEIGHTS["proficiency"] * result.proficiency_score
            + WEIGHTS["preferred_skill"] * result.preferred_skill_score,
            1
        )

        # Generate explanation
        result.explanation = self._generate_explanation(
            emp_name=emp.get("full_name", "The candidate"),
            matched=result.matched_skills,
            gaps=result.skill_gaps,
            score=result.overall_score,
            exp_required=req.experience_years,
            emp_experience=emp_years,
        )

        return result

    def _score_required_skills(
        self,
        required: List[RequiredSkill],
        emp_skill_set: set,
        emp_skill_map: dict,
    ) -> Tuple[float, List[str], List[str], List[Dict]]:
        """
        Score based on required skill coverage, weighted by importance.
        Returns (score 0-100, matched_skills, gaps, partial_matches)
        """
        if not required:
            return 100.0, [], [], []

        IMPORTANCE_WEIGHT = {"critical": 3.0, "high": 2.0, "medium": 1.0, "low": 0.5}

        total_weight = 0.0
        earned_weight = 0.0
        matched = []
        gaps = []
        partial = []

        for skill in required:
            canonical = normalize_skill(skill.name)
            canonical_lower = canonical.lower()
            weight = IMPORTANCE_WEIGHT.get(skill.importance, 1.0)
            total_weight += weight

            if canonical_lower in emp_skill_set:
                earned_weight += weight
                matched.append(canonical)
            else:
                # Check for semantic near-match (simplified: substring)
                near_match = next(
                    (es for es in emp_skill_set if canonical_lower in es or es in canonical_lower),
                    None
                )
                if near_match:
                    earned_weight += weight * 0.5
                    partial.append({"required": canonical, "employee_has": near_match})
                else:
                    gaps.append(canonical)

        score = (earned_weight / total_weight) * 100 if total_weight > 0 else 100.0
        return round(score, 1), matched, gaps, partial

    def _score_experience(self, required_years: float, employee_years: float) -> float:
        """Score experience fit on 0-100 scale."""
        if required_years <= 0:
            return 100.0  # No requirement → full score
        if employee_years >= required_years:
            # Bonus for more experience, capped at 100
            bonus = min((employee_years - required_years) / required_years * 10, 10.0)
            return min(100.0 + bonus, 100.0)
        ratio = employee_years / required_years
        return round(ratio * 100, 1)

    def _score_proficiency(
        self,
        required: List[RequiredSkill],
        emp_skill_map: dict,
        matched_names: List[str],
    ) -> float:
        """Score whether employee's proficiency meets or exceeds requirement."""
        if not matched_names:
            return 0.0

        total = 0.0
        earned = 0.0
        for skill in required:
            canonical = normalize_skill(skill.name)
            if canonical not in matched_names:
                continue
            req_level = PROFICIENCY_REQUIRED.get(skill.level, 2)
            emp_data = emp_skill_map.get(canonical.lower())
            if emp_data:
                # proficiency_level on 1-5 scale; map to 1-4 for comparison
                emp_level = min(emp_data.get("proficiency_level", 2), 4)
                if emp_level >= req_level:
                    earned += 1.0
                else:
                    # Partial credit for close matches
                    earned += max(0, 1.0 - (req_level - emp_level) * 0.25)
            total += 1.0

        return round((earned / total) * 100, 1) if total > 0 else 100.0

    def _score_preferred(self, preferred: List[str], emp_skill_set: set) -> float:
        """Score how many preferred skills the employee has."""
        if not preferred:
            return 100.0
        norm_preferred = [normalize_skill(s).lower() for s in preferred]
        matched_count = sum(1 for s in norm_preferred if s in emp_skill_set)
        return round((matched_count / len(preferred)) * 100, 1)

    # ─── Text Helpers ─────────────────────────────────────────────────────────

    def _requirement_to_text(self, req: StructuredRequirement) -> str:
        parts = [req.project_title]
        for r in req.roles:
            parts.append(r.title)
        for s in req.required_skills:
            parts.append(f"{s.name} {s.level} {s.importance}")
        parts.extend(req.preferred_skills)
        if req.experience_years:
            parts.append(f"{req.experience_years} years experience")
        parts.extend(req.responsibilities[:3])
        return " ".join(parts)

    def _employee_to_text(self, emp: Dict[str, Any]) -> str:
        parts = [emp.get("full_name", ""), emp.get("job_title", ""), emp.get("department", "")]
        for s in emp.get("skills", []):
            name = normalize_skill(s.get("name", ""))
            level_map = {1: "beginner", 2: "basic", 3: "intermediate", 4: "advanced", 5: "expert"}
            level = level_map.get(s.get("proficiency_level", 3), "intermediate")
            parts.append(f"{name} {level}")
        yrs = emp.get("years_of_experience", 0)
        if yrs:
            parts.append(f"{yrs} years experience")
        return " ".join(filter(None, parts))

    # ─── Explanation ──────────────────────────────────────────────────────────

    def _generate_explanation(
        self,
        emp_name: str,
        matched: List[str],
        gaps: List[str],
        score: float,
        exp_required: float,
        emp_experience: float,
    ) -> str:
        """Generate a human-readable match explanation."""
        payload = json.dumps({
            "employee_name": emp_name,
            "matched_skills": matched,
            "skill_gaps": gaps,
            "overall_score": score,
            "experience_required": exp_required,
            "employee_experience": emp_experience,
        })

        try:
            prompt_path = __file__
            from pathlib import Path
            prompt_file = Path(__file__).parent / "prompts" / "matching_explanation.txt"
            system_prompt = prompt_file.read_text(encoding="utf-8") if prompt_file.exists() else ""
            return self._explanation_provider.generate(
                system_prompt or "You are a talent analyst. Explain the match briefly.",
                payload
            )
        except Exception:
            # Ultra-simple fallback
            if score >= 85:
                fit = "strong"
            elif score >= 70:
                fit = "good"
            else:
                fit = "partial"
            skills_str = ", ".join(matched[:3]) if matched else "some"
            return (
                f"{emp_name} is a {fit} match with experience in {skills_str}. "
                f"Overall compatibility: {score:.0f}%."
            )
