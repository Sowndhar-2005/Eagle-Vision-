"""Pytest fixtures for Resume Analysis Agent."""

import pytest
from pathlib import Path


@pytest.fixture
def sample_resume_text() -> str:
    fixture_path = Path(__file__).parent / "fixtures" / "sample_resume.txt"
    with open(fixture_path, "r", encoding="utf-8") as f:
        return f.read()


@pytest.fixture
def sample_resume_path() -> Path:
    return Path(__file__).parent / "fixtures" / "sample_resume.txt"
