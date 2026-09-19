"""
Eagle Vision — FastAPI Application Entry Point
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.router import api_router


async def seed_database():
    """Seed the database with demo data on first startup."""
    from app.core.database import AsyncSessionLocal
    from app.core.seed_data import seed_database as _seed

    async with AsyncSessionLocal() as session:
        await _seed(session)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: create tables and seed data on startup."""
    from app.core.database import create_tables
    print("[Startup] Creating database tables...")
    await create_tables()
    await seed_database()
    print("[Startup] OK Eagle Vision backend ready.")
    yield
    print("[Shutdown] Eagle Vision backend shutting down.")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title=settings.APP_NAME,
        description="AI-Powered Talent Discovery & Internal Mobility Platform",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include API v1 routes
    app.include_router(api_router, prefix="/api/v1")

    # Health check endpoint
    @app.get("/health", tags=["Health"])
    async def health_check():
        return {"status": "healthy", "service": "Eagle Vision API"}

    return app


app = create_app()
