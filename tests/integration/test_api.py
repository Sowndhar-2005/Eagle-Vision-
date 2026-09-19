"""
Integration tests for FastAPI endpoints
"""

import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import create_app

app = create_app()


@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_analytics_overview():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/analytics/overview")
        assert response.status_code == 200
        data = response.json()
        assert "internal_hire_rate" in data
