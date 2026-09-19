"""
Eagle Vision — Test Suite Fixtures & Configuration
"""

import pytest


@pytest.fixture
def sample_candidate_skills():
    return [
        {"skill_id": "python", "proficiency": 4},
        {"skill_id": "fastapi", "proficiency": 4},
        {"skill_id": "docker", "proficiency": 3},
    ]


@pytest.fixture
def sample_opportunity_requirements():
    return [
        {"skill_id": "python", "min_proficiency": 3, "importance_weight": 1.0},
        {"skill_id": "fastapi", "min_proficiency": 4, "importance_weight": 1.0},
        {"skill_id": "kubernetes", "min_proficiency": 2, "importance_weight": 0.5},
    ]
