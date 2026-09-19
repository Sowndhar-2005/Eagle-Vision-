"""
Eagle Vision — Dual-Phase Talent Matching Engine
"""

from typing import Any, Dict, List
import numpy as np


class TalentMatcher:
    """Matches candidates to internal opportunities via weighted hybrid algorithm:
    Final Score = (w1 * DirectSkills) + (w2 * SemanticSimilarity) + (w3 * TransferableSkills)
    """

    def __init__(
        self,
        weight_direct: float = 0.50,
        weight_semantic: float = 0.35,
        weight_transferable: float = 0.15,
    ):
        self.w_direct = weight_direct
        self.w_semantic = weight_semantic
        self.w_transferable = weight_transferable

    def compute_match(
        self,
        direct_skill_score: float,
        semantic_sim_score: float,
        transferable_score: float = 0.0,
    ) -> Dict[str, Any]:
        """Compute composite weighted match score."""
        composite = (
            (self.w_direct * direct_skill_score)
            + (self.w_semantic * semantic_sim_score)
            + (self.w_transferable * transferable_score)
        )
        return {
            "overall_score": round(composite * 100, 1),
            "breakdown": {
                "direct_skills": round(direct_skill_score * 100, 1),
                "semantic_similarity": round(semantic_sim_score * 100, 1),
                "transferable_bonus": round(transferable_score * 100, 1),
            },
        }
