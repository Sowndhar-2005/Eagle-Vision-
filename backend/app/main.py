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
    from app.models import User, Employee, EmployeeSkill, Skill, SkillTaxonomyCategory
    from app.models.hr_models import Department, HRProject, LearningResource
    from app.core.seed_data import get_seed_data
    from app.core.security import get_password_hash
    from sqlalchemy import select

    async with AsyncSessionLocal() as session:
        # Check if already seeded
        q = await session.execute(select(User))
        existing_users = q.scalars().all()
        if existing_users:
            for u in existing_users:
                if u.email in ("hr@eaglevision.ai", "talent@eaglevision.ai"):
                    u.hashed_password = get_password_hash("password123")
            await session.commit()
            print("[Seed] Database already seeded. Updated demo credentials.")
            return

        print("[Seed] Seeding database with demo data...")
        data = get_seed_data()

        # Departments
        for d in data["departments"]:
            session.add(Department(
                id=d["id"], name=d["name"],
                description=d["description"], head_count=d["head_count"],
            ))

        # Skill categories
        for cat in data["skill_categories"]:
            session.add(SkillTaxonomyCategory(
                id=cat["id"], name=cat["name"],
            ))

        # Skills
        for s in data["skills"]:
            session.add(Skill(
                id=s["id"], name=s["name"],
                category_id=s["category_id"], skill_type=s["skill_type"],
            ))

        # Users
        for u in data["users"]:
            session.add(User(
                id=u["id"], email=u["email"],
                hashed_password=u["hashed_password"],
                full_name=u["full_name"], role=u["role"],
                is_active=u["is_active"],
            ))

        await session.flush()

        # Employees + skills
        for emp_data in data["employees"]:
            emp = Employee(
                id=emp_data["id"],
                first_name=emp_data["first_name"],
                last_name=emp_data["last_name"],
                job_title=emp_data["job_title"],
                department=emp_data["department"],
                location=emp_data.get("location", "India"),
                bio=emp_data.get("bio", ""),
                years_of_experience=emp_data.get("years_of_experience", 0.0),
                open_to_remote=emp_data.get("open_to_remote", True),
                open_to_gigs=emp_data.get("open_to_gigs", True),
            )
            session.add(emp)
            await session.flush()

            for skill_data in emp_data.get("skills", []):
                es = EmployeeSkill(
                    employee_id=emp_data["id"],
                    skill_id=skill_data["skill_id"],
                    proficiency_level=skill_data["proficiency_level"],
                    years_of_experience=skill_data["years_of_experience"],
                    is_verified=True,
                )
                session.add(es)

        # HR Projects
        for p in data["projects"]:
            session.add(HRProject(
                id=p["id"], name=p["name"], department=p["department"],
                description=p["description"],
                business_objective=p.get("business_objective"),
                duration_months=p.get("duration_months"),
                location=p.get("location"),
                work_mode=p.get("work_mode", "hybrid"),
                headcount=p.get("headcount", 1),
                priority=p.get("priority", "medium"),
                status=p.get("status", "draft"),
            ))

        # Learning resources
        for lr in data["learning_resources"]:
            session.add(LearningResource(
                id=lr["id"], title=lr["title"],
                description=lr.get("description"),
                provider=lr["provider"],
                url=lr.get("url"),
                skill_name=lr["skill_name"],
                skill_level=lr.get("skill_level", "beginner"),
                duration_hours=lr.get("duration_hours"),
                resource_type=lr.get("resource_type", "course"),
                is_free=lr.get("is_free", False),
            ))

        await session.commit()
        print("[Seed] ✓ Demo data seeded successfully.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: create tables and seed data on startup."""
    from app.core.database import create_tables
    print("[Startup] Creating database tables...")
    await create_tables()
    await seed_database()
    print("[Startup] ✓ Eagle Vision backend ready.")
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
