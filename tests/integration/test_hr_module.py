"""
Eagle Vision — Integration Tests for HR Module
"""

import pytest
from httpx import AsyncClient, ASGITransport
try:
    from app.main import app
except ImportError:
    from backend.app.main import app


@pytest.mark.asyncio
async def test_hr_auth_login():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post(
            "/api/v1/hr/auth/login",
            json={"email": "hr@eaglevision.ai", "password": "password123"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["email"] == "hr@eaglevision.ai"
        assert data["role"] in ("hr_admin", "hr_manager", "hr")


@pytest.mark.asyncio
async def test_hr_dashboard_data():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post(
            "/api/v1/hr/auth/login",
            json={"email": "hr@eaglevision.ai", "password": "password123"},
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = await ac.get("/api/v1/hr/dashboard", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "kpis" in data
        assert "recent_projects" in data


@pytest.mark.asyncio
async def test_hr_create_project_and_analyze():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post(
            "/api/v1/hr/auth/login",
            json={"email": "hr@eaglevision.ai", "password": "password123"},
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Create project
        create_res = await ac.post(
            "/api/v1/hr/projects",
            json={
                "name": "Distributed ML Pipeline",
                "department": "AI & Data Science",
                "description": "Building high scale ML serving infra",
                "duration_months": 6,
                "headcount": 2,
                "work_mode": "remote",
                "priority": "high",
            },
            headers=headers,
        )
        assert create_res.status_code in (200, 201)
        project = create_res.json()
        project_id = project["id"]

        # 2. Analyze Requirement with AI NLP
        analyze_res = await ac.post(
            f"/api/v1/hr/projects/{project_id}/analyze",
            json={
                "raw_description": "We need a Senior MLOps engineer with Python, PyTorch, Kubernetes, and FastAPI to build model pipelines.",
                "project_name": "Distributed ML Pipeline",
                "department": "AI & Data Science",
                "duration_months": 6,
                "headcount": 2,
            },
            headers=headers,
        )
        assert analyze_res.status_code == 200
        analysis = analyze_res.json()
        assert len(analysis["required_skills"]) > 0

        # 3. Match Talent
        match_res = await ac.post(
            f"/api/v1/hr/projects/{project_id}/match",
            headers=headers,
        )
        assert match_res.status_code == 200
        match_data = match_res.json()
        candidates = match_data.get("candidates") or match_data.get("matches") or []
        assert len(candidates) > 0


@pytest.mark.asyncio
async def test_hr_analytics():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post(
            "/api/v1/hr/auth/login",
            json={"email": "hr@eaglevision.ai", "password": "password123"},
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = await ac.get("/api/v1/hr/analytics", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "total_employees" in data
        assert "total_projects" in data
