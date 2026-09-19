"""
Eagle Vision — Notifications & Alerts Endpoints
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

router = APIRouter()


@router.get("", summary="Get User Notifications")
async def get_notifications(
    unread_only: bool = Query(False),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Fetch notifications for matches, opportunity recommendations, and application status changes."""
    return {"notifications": [], "unread_count": 0}


@router.patch("/{notification_id}/read", summary="Mark Notification as Read")
async def mark_read(notification_id: str, db: AsyncSession = Depends(get_db)):
    """Mark a specific notification as viewed."""
    return {"message": "Notification marked as read"}
