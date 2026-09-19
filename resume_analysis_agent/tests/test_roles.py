"""Unit tests for role rubrics and RoleManager."""

import pytest
from resume_analysis_agent.core.models import RoleRubric, ScoringCategory
from resume_analysis_agent.roles.manager import RoleManager


def test_list_builtin_roles():
    roles = RoleManager.list_roles()
    assert "software_engineering_intern" in roles
    assert "backend_engineer" in roles
    assert "ai_ml_engineer" in roles


def test_load_software_engineering_intern_rubric():
    rubric = RoleManager.get_role("software_engineering_intern")
    assert rubric.name == "software_engineering_intern"
    assert rubric.position_title == "Software Engineering Intern"
    assert len(rubric.categories) >= 3
    # Check that category max points sum to 100
    category_total = sum(c.max for c in rubric.categories)
    assert category_total == 100
    assert rubric.bonus_max > 0


def test_load_all_roles_valid():
    roles = RoleManager.get_all_roles()
    assert len(roles) >= 3
    for role in roles:
        assert isinstance(role, RoleRubric)
        assert len(role.categories) > 0
        assert role.passing_cutoff > 0


def test_dynamic_role_registration():
    custom = RoleRubric(
        name="test_embedded_engineer",
        position_title="Embedded Firmware Engineer",
        categories=[
            ScoringCategory(key="c_cpp", label="C/C++ & RTOS", max=50, description="C programming"),
            ScoringCategory(key="hardware", label="PCB & Schematics", max=50, description="Hardware debugging"),
        ],
        bonus_max=10,
        passing_cutoff=60,
    )
    RoleManager.register_role(custom)
    fetched = RoleManager.get_role("test_embedded_engineer")
    assert fetched.name == "test_embedded_engineer"
    assert fetched.position_title == "Embedded Firmware Engineer"


def test_missing_role_raises_key_error():
    with pytest.raises(KeyError) as exc_info:
        RoleManager.get_role("non_existent_role_xyz")
    assert "not found" in str(exc_info.value)
