"""
Eagle Vision — Semantic Matching Service
"""

from typing import Any, Dict, List
import numpy as np


class MatchingService:
    """Service handling multi-modal talent matching: direct skills, cosine similarity, and transferability."""

    @staticmethod
    def calculate_skill_overlap(
        candidate_skills: List[Dict[str, Any]],
        opportunity_skills: List[Dict[str, Any]],
    ) -> float:
        """Calculate weighted direct skill match percentage."""
        if not opportunity_skills:
            return 1.0

        candidate_skill_map = {s["skill_id"]: s.get("proficiency", 1) for s in candidate_skills}
        total_weight = sum(req.get("importance_weight", 1.0) for req in opportunity_skills)
        matched_weight = 0.0

        for req in opportunity_skills:
            skill_id = req["skill_id"]
            weight = req.get("importance_weight", 1.0)
            if skill_id in candidate_skill_map:
                user_prof = candidate_skill_map[skill_id]
                min_prof = req.get("min_proficiency", 1)
                prof_ratio = min(1.0, user_prof / min_prof)
                matched_weight += weight * prof_ratio

        return round(matched_weight / total_weight, 4) if total_weight > 0 else 0.0

    @staticmethod
    def cosine_similarity(v1: List[float], v2: List[float]) -> float:
        """Calculate cosine similarity between two vector embeddings."""
        a = np.array(v1)
        b = np.array(v2)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(np.dot(a, b) / (norm_a * norm_b))


matching_service = MatchingService()
