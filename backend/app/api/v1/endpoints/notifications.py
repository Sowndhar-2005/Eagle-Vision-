"""
Eagle Vision — Notifications Endpoints (authenticated)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.portal_service import list_notifications, mark_notification_read

router = APIRouter()


@router.get("", summary="My notifications")
async def get_notifications(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    items = await list_notifications(db, user.id)
    return {"items": items, "unread_count": sum(1 for n in items if not n["read"])}


@router.patch("/{notification_id}/read", summary="Mark notification as read")
async def mark_read(
    notification_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    n = await mark_notification_read(db, user.id, notification_id)
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "read"}


@router.post("/read-all", summary="Mark all notifications as read")
async def mark_all_read(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    import sqlalchemy as sa
    from app.models.portal import Notification
    await db.execute(
        sa.update(Notification).where(Notification.user_id == user.id).values(read=True)
    )
    await db.flush()
    return {"status": "all_read"}