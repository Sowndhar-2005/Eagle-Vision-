"""
Eagle Vision — Talent Pool & Succession Planning Endpoints
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

router = APIRouter()


@router.get("/pools", summary="List Talent Pools")
async def list_talent_pools(db: AsyncSession = Depends(get_db)):
    """Retrieve curated talent pools for strategic initiatives and succession planning."""
    return {"pools": []}


@router.get("/succession/{critical_role_id}", summary="Get Succession Bench")
async def get_succession_bench(critical_role_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve ready-now and ready-soon succession candidates for a key leadership or technical role."""
    return {"critical_role_id": critical_role_id, "candidates": []}
