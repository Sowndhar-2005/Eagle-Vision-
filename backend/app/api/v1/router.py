"""
Eagle Vision — API v1 Router Registration
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    ai,
    analytics,
    auth,
    employees,
    hr,
    learning,
    notifications,
    opportunities,
    requests,
    resumes,
    skills,
    talent,
    teams,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(hr.router, prefix="/hr", tags=["HR Module"])
api_router.include_router(employees.router, prefix="/employees", tags=["Employees & Portal"])
api_router.include_router(teams.router, prefix="/teams", tags=["Team Leader"])
api_router.include_router(requests.router, prefix="/requests", tags=["Development Requests"])
api_router.include_router(skills.router, prefix="/skills", tags=["Skills & Graph"])
api_router.include_router(opportunities.router, prefix="/opportunities", tags=["Opportunities"])
api_router.include_router(learning.router, prefix="/learning", tags=["Learning & Development"])
api_router.include_router(resumes.router, prefix="/resumes", tags=["Resume Analysis"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Engine"])
api_router.include_router(talent.router, prefix="/talent", tags=["Talent & Succession"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & Reporting"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
