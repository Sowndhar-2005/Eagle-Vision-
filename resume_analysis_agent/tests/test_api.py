"""Unit tests for Resume Analysis Agent FastAPI REST microservice."""

import pytest
from fastapi.testclient import TestClient
from resume_analysis_agent.api import app

client = TestClient(app)


def test_api_health():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "software_engineering_intern" in data["available_roles"]


def test_api_get_roles():
    res = client.get("/api/v1/roles")
    assert res.status_code == 200
    roles = res.json()
    assert isinstance(roles, list)
    assert len(roles) >= 3
    role_names = [r["name"] for r in roles]
    assert "software_engineering_intern" in role_names


def test_api_analyze_text(sample_resume_text):
    payload = {
        "text": sample_resume_text,
        "role": "software_engineering_intern",
        "enrich_github": False,
    }
    res = client.post("/api/v1/analyze/text", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["resume"]["basics"]["name"] == "Maya Lin"
    assert data["evaluation"]["role_name"] == "software_engineering_intern"
    assert 0 <= data["evaluation"]["normalized_score"] <= 100


def test_api_analyze_file_upload(sample_resume_text):
    files = {
        "file": ("resume.txt", sample_resume_text.encode("utf-8"), "text/plain"),
    }
    data = {
        "role": "backend_engineer",
        "enrich_github": "false",
    }
    res = client.post("/api/v1/analyze", files=files, data=data)
    assert res.status_code == 200
    res_data = res.json()
    assert res_data["evaluation"]["role_name"] == "backend_engineer"


def test_api_analyze_markdown(sample_resume_text):
    files = {
        "file": ("resume.txt", sample_resume_text.encode("utf-8"), "text/plain"),
    }
    data = {
        "role": "software_engineering_intern",
        "enrich_github": "false",
    }
    res = client.post("/api/v1/analyze/markdown", files=files, data=data)
    assert res.status_code == 200
    res_data = res.json()
    assert "report_markdown" in res_data
    assert "Resume Evaluation Report" in res_data["report_markdown"]
