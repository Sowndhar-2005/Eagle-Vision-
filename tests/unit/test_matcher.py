"""
Unit tests for AI matching engine
"""

from ai.matching_engine.matcher import TalentMatcher
from backend.app.services.matching_service import MatchingService


def test_talent_matcher_composite():
    matcher = TalentMatcher(weight_direct=0.5, weight_semantic=0.3, weight_transferable=0.2)
    res = matcher.compute_match(
        direct_skill_score=0.9,
        semantic_sim_score=0.8,
        transferable_score=0.5,
    )
    # (0.5 * 0.9) + (0.3 * 0.8) + (0.2 * 0.5) = 0.45 + 0.24 + 0.10 = 0.79 -> 79.0%
    assert res["overall_score"] == 79.0
    assert res["breakdown"]["direct_skills"] == 90.0


def test_skill_overlap_calculation(sample_candidate_skills, sample_opportunity_requirements):
    score = MatchingService.calculate_skill_overlap(
        sample_candidate_skills, sample_opportunity_requirements
    )
    # Python (1.0) + FastAPI (1.0) + Kubernetes (0.0) out of total 2.5 weight = 2.0 / 2.5 = 0.8
    assert score == 0.8
