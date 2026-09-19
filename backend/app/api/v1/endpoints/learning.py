"""
Eagle Vision — Learning & Upskilling Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.portal_service import (
    list_courses, enroll_course, employee_for_user,
)

router = APIRouter()


@router.get("/courses", summary="Catalog of learning resources")
async def courses(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    emp = await employee_for_user(db, user)
    if not emp:
        return {"items": []}
    return {"items": await list_courses(db, emp.id)}


@router.post("/courses/{resource_id}/enroll", summary="Enroll in a course")
async def enroll(
    resource_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    emp = await employee_for_user(db, user)
    if not emp:
        raise HTTPException(status_code=400, detail="No employee profile linked")
    result = await enroll_course(db, emp.id, resource_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"status": "enrolled" if result != "already" else "already_enrolled"}