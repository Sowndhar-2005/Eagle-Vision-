"""
Eagle Vision — Demo Seed Data
Single source of truth for the Company structure, Teams, Employees, and portal data.
"""

from app.models.user import User
from app.models.hr_models import Department, HRProject, LearningResource
from app.models import (
    Employee,
    EmployeeSkill,
    Skill,
    SkillTaxonomyCategory,
    WorkExperience,
    Team,
    CurrentWork,
    DevelopingSkill,
    CareerGoal,
    Project,
    ProjectMember,
    EmployeeRequest,
    Notification,
    InternalOpportunity,
    CourseEnrollment,
    Certification,
)
from app.core.security import get_password_hash

DEMO_PASSWORD = "password123"

# ---------------------------------------------------------------------------
# Skills taxonomy
# ---------------------------------------------------------------------------
SKILL_CATEGORIES = [
    ("cat-backend", "Backend Dev"),
    ("cat-frontend", "Frontend Dev"),
    ("cat-aiml", "AI & ML"),
    ("cat-devops", "DevOps & Cloud"),
    ("cat-data", "Data Engineering"),
    ("cat-soft", "Soft Skills"),
]

SKILLS = [
    ("sk-python", "Python", "cat-aiml", "technical"),
    ("sk-fastapi", "FastAPI", "cat-backend", "technical"),
    ("sk-django", "Django", "cat-backend", "technical"),
    ("sk-postgresql", "PostgreSQL", "cat-data", "technical"),
    ("sk-restapi", "REST API", "cat-backend", "technical"),
    ("sk-docker", "Docker", "cat-devops", "technical"),
    ("sk-kubernetes", "Kubernetes", "cat-devops", "technical"),
    ("sk-ml", "Machine Learning", "cat-aiml", "technical"),
    ("sk-pytorch", "PyTorch", "cat-aiml", "technical"),
    ("sk-react", "React", "cat-frontend", "technical"),
    ("sk-typescript", "TypeScript", "cat-frontend", "technical"),
    ("sk-redis", "Redis", "cat-backend", "technical"),
    ("sk-aws", "AWS", "cat-devops", "technical"),
    ("sk-nlp", "NLP", "cat-aiml", "technical"),
    ("sk-sql", "SQL", "cat-data", "technical"),
    ("sk-git", "Git", "cat-backend", "technical"),
    ("sk-celery", "Celery", "cat-backend", "technical"),
    ("sk-graphql", "GraphQL", "cat-backend", "technical"),
    ("sk-vuejs", "Vue.js", "cat-frontend", "technical"),
    ("sk-agile", "Agile", "cat-soft", "soft"),
]

# ---------------------------------------------------------------------------
# Departments
# ---------------------------------------------------------------------------
DEPARTMENTS = [
    ("dept-eng", "Engineering", "Product and platform engineering delivery", 30),
    ("dept-data", "Data & AI", "Data platforms, ML and AI research", 20),
    ("dept-prod", "Product", "Product management and design", 15),
    ("dept-ops", "Operations", "Cloud infrastructure and platform operations", 12),
    ("dept-hr", "Human Resources", "People operations and talent", 8),
]

# ---------------------------------------------------------------------------
# Teams
# ---------------------------------------------------------------------------
TEAMS = [
    ("team-ai-ml", "AI / Machine Learning Team", "Data & AI", "emp-sarah",
     "Builds the ML platform, model serving and AI product features."),
    ("team-backend", "Backend Engineering Team", "Engineering", "emp-michael",
     "Owns API services, data access and integration platform."),
    ("team-frontend", "Frontend Engineering Team", "Engineering", "emp-daniel",
     "Crafts the product UI, design systems and client apps."),
    ("team-data", "Data Engineering Team", "Data & AI", "emp-olivia",
     "Runs the data warehouse, pipelines and analytics foundation."),
]

TEAM_LEADER_MAP = {
    "team-ai-ml": "emp-sarah",
    "team-backend": "emp-michael",
    "team-frontend": "emp-daniel",
    "team-data": "emp-olivia",
}

# ---------------------------------------------------------------------------
# Employees
#   (id, first, last, title, team_id, persona, years, location, summary)
# ---------------------------------------------------------------------------
EMPLOYEES = [
    # Team Leaders
    ("emp-sarah", "Sarah", "Jenkins", "AI / ML Engineering Manager", "team-ai-ml", "growth_employee", 9.0, "Chennai, India",
     "Engineering leader building the ML and AI platform. Previously led model serving at a fintech scale-up."),
    ("emp-michael", "Michael", "Carter", "Backend Engineering Manager", "team-backend", "growth_employee", 11.0, "Bengaluru, India",
     "Hands-on backend engineering leader focused on reliable APIs and secure data services."),
    ("emp-daniel", "Daniel", "Smith", "Frontend Engineering Manager", "team-frontend", "growth_employee", 10.0, "Hyderabad, India",
     "Frontend leader passionate about design systems, accessibility and developer experience."),
    ("emp-olivia", "Olivia", "Taylor", "Data Engineering Manager", "team-data", "growth_employee", 8.5, "Pune, India",
     "Data engineering leader who has scaled warehouses and pipelines from zero to petabyte scale."),
    # AI / ML Team
    ("emp-jane", "Jane", "Doe", "Software Engineer II (AI Platform)", "team-ai-ml", "new_employee", 1.2, "Chennai, India",
     "New joiners building AI platform tooling. Eager to grow into model engineering."),
    ("emp-alex", "Alex", "Chen", "Senior ML Engineer", "team-ai-ml", "growth_employee", 6.0, "Bengaluru, India",
     "ML engineer shipping production models for ranking and recommendations."),
    ("emp-priya", "Priya", "Sharma", "ML Engineer", "team-ai-ml", "opportunity_employee", 4.0, "Hyderabad, India",
     "ML engineer looking to move into MLOps and platform engineering."),
    # Backend Team
    ("emp-arun", "Arun", "Kumar", "Senior Backend Engineer", "team-backend", "growth_employee", 5.5, "Chennai, India",
     "Backend engineer who enjoys designing resilient services and mentoring juniors."),
    ("emp-david", "David", "Wilson", "Backend Engineer", "team-backend", "opportunity_employee", 4.5, "Bengaluru, India",
     "Backend engineer pivoting toward cloud platform and infrastructure roles."),
    ("emp-emily", "Emily", "Davis", "Junior Backend Developer", "team-backend", "new_employee", 0.8, "Pune, India",
     "Early-career backend developer learning the platform inside out."),
    # Frontend Team
    ("emp-marcus", "Marcus", "Vance", "Senior Frontend Engineer", "team-frontend", "opportunity_employee", 6.5, "Bengaluru, India",
     "Senior frontend engineer exploring full-stack and product ownership."),
    ("emp-sophia", "Sophia", "Brown", "Frontend Developer", "team-frontend", "growth_employee", 3.5, "Chennai, India",
     "Frontend developer growing into staff-level design system ownership."),
    # Data Team
    ("emp-ryan", "Ryan", "Lee", "Data Engineer", "team-data", "new_employee", 1.5, "Hyderabad, India",
     "New data engineer building the foundations of the lakehouse."),
    ("emp-noah", "Noah", "Martin", "Data Engineer", "team-data", "growth_employee", 4.5, "Bengaluru, India",
     "Data engineer leading pipeline reliability and streaming work."),
]

# (emp_id -> list of (skill_name, proficiency 1-5, years))
EMPLOYEE_SKILLS = {
    "emp-sarah": [("Python", 5, 8), ("Machine Learning", 5, 8), ("PyTorch", 5, 6), ("NLP", 4, 5),
                  ("Docker", 3, 4), ("Git", 4, 8), ("Agile", 5, 8), ("FastAPI", 3, 3)],
    "emp-michael": [("Python", 5, 10), ("FastAPI", 5, 6), ("Django", 4, 7), ("PostgreSQL", 5, 9),
                    ("REST API", 5, 10), ("Docker", 4, 6), ("Redis", 4, 6), ("Celery", 4, 5),
                    ("Git", 5, 10), ("Agile", 5, 10)],
    "emp-daniel": [("React", 5, 9), ("TypeScript", 5, 8), ("Vue.js", 5, 6), ("GraphQL", 4, 5),
                   ("REST API", 4, 8), ("Git", 5, 9), ("Agile", 5, 9), ("Docker", 2, 2)],
    "emp-olivia": [("Python", 5, 8), ("SQL", 5, 9), ("PostgreSQL", 5, 8), ("Docker", 4, 5),
                   ("AWS", 4, 6), ("Machine Learning", 3, 2), ("Git", 4, 8)],
    "emp-jane": [("Python", 4, 1), ("FastAPI", 3, 1), ("React", 3, 1), ("TypeScript", 3, 1),
                 ("REST API", 4, 1), ("Machine Learning", 2, 0.5), ("Git", 3, 1), ("SQL", 3, 1)],
    "emp-alex": [("Python", 5, 6), ("Machine Learning", 5, 6), ("PyTorch", 4, 5), ("NLP", 4, 4),
                 ("Docker", 3, 3), ("FastAPI", 3, 2), ("Git", 4, 6)],
    "emp-priya": [("Python", 4, 4), ("PyTorch", 4, 3), ("Machine Learning", 4, 4), ("NLP", 3, 3),
                  ("SQL", 3, 3), ("FastAPI", 2, 1), ("Docker", 2, 1), ("Git", 3, 4)],
    "emp-arun": [("Python", 5, 5), ("FastAPI", 4, 4), ("PostgreSQL", 4, 5), ("REST API", 5, 5),
                 ("Redis", 3, 3), ("Docker", 3, 3), ("Git", 4, 5), ("Celery", 3, 3)],
    "emp-david": [("Python", 4, 4), ("Django", 4, 3), ("GraphQL", 4, 3), ("PostgreSQL", 3, 4),
                  ("REST API", 4, 4), ("Docker", 2, 2), ("Git", 4, 4)],
    "emp-emily": [("Python", 3, 0.5), ("FastAPI", 2, 0.5), ("SQL", 3, 1), ("REST API", 2, 0.5),
                  ("Git", 3, 1), ("PostgreSQL", 2, 0.5)],
    "emp-marcus": [("React", 5, 6), ("TypeScript", 5, 6), ("GraphQL", 4, 3), ("Git", 4, 6),
                   ("REST API", 4, 5), ("Python", 2, 1)],
    "emp-sophia": [("React", 4, 3), ("TypeScript", 4, 3), ("Vue.js", 3, 2), ("Git", 3, 3),
                   ("Agile", 3, 3), ("REST API", 3, 3)],
    "emp-ryan": [("Python", 3, 1), ("SQL", 4, 1), ("PostgreSQL", 4, 1), ("Docker", 2, 1),
                 ("Git", 3, 1), ("AWS", 2, 0.5)],
    "emp-noah": [("Python", 4, 4), ("SQL", 5, 4), ("PostgreSQL", 5, 4), ("AWS", 3, 3),
                 ("Docker", 3, 3), ("Machine Learning", 3, 2), ("Git", 4, 4)],
}

# ---------------------------------------------------------------------------
# Experience   (emp -> list of {company, role, team, start, end, is_current, responsibilities, skills_used})
# ---------------------------------------------------------------------------
EXP_PAIR = [
    ("company-fintech", "Finlytics", "FinTech platform"),
    ("company-cloud", "CloudRocket", "Cloud infrastructure"),
    ("company-ecom", "ShopNova", "E-commerce"),
    ("company-ai", "Neura Labs", "AI product lab"),
    ("company-data", "DataPulse", "Analytics"),
    ("company-saas", "AppBridge", "SaaS"),
    ("company-bank", "GlobalBank Systems", "Banking"),
    ("company-health", "HealthSync", "Health tech"),
]

EXPERIENCES = {
    "emp-sarah": [
        {"company": "Neura Labs", "role": "Senior ML Engineer", "team": "Recommendations", "start": "2019", "end": "2023",
         "current": False, "responsibilities": ["Led model serving architecture", "Shipped 6 recommender models to production"],
         "skills_used": ["Python", "Machine Learning", "PyTorch"]},
        {"company": "CloudRocket", "role": "ML Engineer", "team": "NLP", "start": "2016", "end": "2019",
         "current": False, "responsibilities": ["Built text classification pipelines"], "skills_used": ["NLP", "Python"]},
    ],
    "emp-michael": [
        {"company": "AppBridge", "role": "Staff Backend Engineer", "team": "Platform", "start": "2018", "end": "2023",
         "current": False, "responsibilities": ["Designed event-driven microservices", "Introduced API gateway and rate limiting"],
         "skills_used": ["FastAPI", "Redis", "Celery"]},
        {"company": "GlobalBank Systems", "role": "Backend Engineer", "team": "Payments", "start": "2013", "end": "2018",
         "current": False, "responsibilities": ["Built payment processing services"], "skills_used": ["Django", "PostgreSQL"]},
    ],
    "emp-daniel": [
        {"company": "ShopNova", "role": "Senior Frontend Engineer", "team": "Checkout", "start": "2017", "end": "2022",
         "current": False, "responsibilities": ["Rebuilt checkout flow in React", "Introduced design tokens"], "skills_used": ["React", "TypeScript"]},
        {"company": "AppBridge", "role": "Frontend Engineer", "team": "Console", "start": "2013", "end": "2017",
         "current": False, "responsibilities": ["Built admin console"], "skills_used": ["Vue.js", "TypeScript"]},
    ],
    "emp-olivia": [
        {"company": "DataPulse", "role": "Lead Data Engineer", "team": "Warehouse", "start": "2018", "end": "2023",
         "current": False, "responsibilities": ["Scaled warehouse to 40TB", "Standardized dbt models"], "skills_used": ["SQL", "AWS"]},
        {"company": "Finlytics", "role": "Data Engineer", "team": "Analytics", "start": "2014", "end": "2018",
         "current": False, "responsibilities": ["Built ETL pipelines"], "skills_used": ["Python", "PostgreSQL"]},
    ],
    "emp-jane": [
        {"company": "HealthSync", "role": "Software Engineer", "team": "Health AI", "start": "2022", "end": "2024",
         "current": False, "responsibilities": ["Built API for ML inference service"], "skills_used": ["Python", "FastAPI"]},
    ],
    "emp-alex": [
        {"company": "Neura Labs", "role": "ML Engineer", "team": "Ranking", "start": "2019", "end": "2024",
         "current": False, "responsibilities": ["Shipped search ranking models", "Built offline eval harness"], "skills_used": ["Machine Learning", "PyTorch"]},
        {"company": "Finlytics", "role": "Data Scientist", "team": "Risk", "start": "2016", "end": "2019",
         "current": False, "responsibilities": ["Built credit risk models"], "skills_used": ["Python", "SQL"]},
    ],
    "emp-priya": [
        {"company": "CloudRocket", "role": "ML Engineer", "team": "Data Products", "start": "2020", "end": "2024",
         "current": False, "responsibilities": ["Fine-tuned LLM pipelines", "Deployed batch inference"], "skills_used": ["PyTorch", "Python"]},
    ],
    "emp-arun": [
        {"company": "ShopNova", "role": "Backend Engineer", "team": "Ordering", "start": "2020", "end": "2024",
         "current": False, "responsibilities": ["Built order orchestration service", "Optimized Postgres queries"], "skills_used": ["FastAPI", "PostgreSQL"]},
    ],
    "emp-david": [
        {"company": "GlobalBank Systems", "role": "Backend Engineer", "team": "Loans", "start": "2020", "end": "2024",
         "current": False, "responsibilities": ["Built loan origination APIs", "Migrated services to Django"], "skills_used": ["Django", "GraphQL"]},
    ],
    "emp-emily": [
        {"company": "HealthSync", "role": "Software Engineering Intern", "team": "Backend", "start": "2023", "end": "2024",
         "current": False, "responsibilities": ["Wrote integration tests", "Fixed API bugs"], "skills_used": ["Python", "REST API"]},
    ],
    "emp-marcus": [
        {"company": "ShopNova", "role": "Senior Frontend Engineer", "team": "Platform UI", "start": "2019", "end": "2024",
         "current": False, "responsibilities": ["Built design system", "Lead micro-frontend migration"], "skills_used": ["React", "TypeScript"]},
    ],
    "emp-sophia": [
        {"company": "AppBridge", "role": "Frontend Developer", "team": "Web", "start": "2021", "end": "2024",
         "current": False, "responsibilities": ["Built onboarding flows", "Improved a11y compliance"], "skills_used": ["React", "TypeScript"]},
    ],
    "emp-ryan": [
        {"company": "DataPulse", "role": "Data Analyst", "team": "Reporting", "start": "2023", "end": "2024",
         "current": False, "responsibilities": ["Built reporting dashboards"], "skills_used": ["SQL"]},
    ],
    "emp-noah": [
        {"company": "Finlytics", "role": "Data Engineer", "team": "Streaming", "start": "2021", "end": "2024",
         "current": False, "responsibilities": ["Built Kafka streaming pipelines", "Owned CDC from Postgres"], "skills_used": ["Python", "AWS"]},
    ],
}

# ---------------------------------------------------------------------------
# Current work
# ---------------------------------------------------------------------------
CURRENT_WORK = {
    "emp-sarah": {"project_name": "Eagle AI Platform v2", "role": "Engineering Manager / ML", "team": "AI / ML",
                  "leader": "Sarah Jenkins", "sprint": "Sprint 24", "status": "active",
                  "responsibilities": ["Unblock model team", "Design ML platform roadmap"],
                  "tasks": ["Review model deploy pipeline", "Stakeholder sync for AI capabilities"],
                  "skills_being_used": ["Machine Learning", "Agile"], "skills_developing": ["Kubernetes", "MLOps"],
                  "blockers": None},
    "emp-michael": {"project_name": "API Gateway v3", "role": "Backend Lead", "team": "Backend Engineering",
                    "leader": "Michael Carter", "sprint": "Sprint 12", "status": "active",
                    "responsibilities": ["Own gateway migration", "Review service contracts"],
                    "tasks": ["Rate limiting layers", "Canary rollout plan"],
                    "skills_being_used": ["FastAPI", "Redis"], "skills_developing": ["Kubernetes"], "blockers": None},
    "emp-daniel": {"project_name": "Design System 2.0", "role": "Frontend Lead", "team": "Frontend Engineering",
                   "leader": "Daniel Smith", "sprint": "Sprint 18", "status": "active",
                   "responsibilities": ["Tokens & theming", "Component library"],
                   "tasks": ["Dark mode", "A11y audit"], "skills_being_used": ["React", "TypeScript"],
                   "skills_developing": ["GraphQL"], "blockers": None},
    "emp-olivia": {"project_name": "Lakehouse Migration", "role": "Data Lead", "team": "Data Engineering",
                   "leader": "Olivia Taylor", "sprint": "Sprint 9", "status": "active",
                   "responsibilities": ["Migrate warehouse workloads"],
                   "tasks": ["Iceberg table conversion", "Validation harness"],
                   "skills_being_used": ["SQL", "AWS"], "skills_developing": ["Machine Learning"], "blockers": None},
    "emp-jane": {"project_name": "Eagle AI Platform v2", "role": "AI Platform Engineer", "team": "AI / ML",
                 "leader": "Sarah Jenkins", "sprint": "Sprint 24", "status": "active",
                 "responsibilities": ["Build inference API endpoints", "Add model eval tooling"],
                 "tasks": ["RAG endpoint", "Latency benchmarks"],
                 "skills_being_used": ["Python", "FastAPI", "REST API"], "skills_developing": ["Machine Learning", "Kubernetes"],
                 "blockers": "Waiting on GPU quota"},
    "emp-alex": {"project_name": "Eagle AI Platform v2", "role": "Senior ML Engineer", "team": "AI / ML",
                 "leader": "Sarah Jenkins", "sprint": "Sprint 24", "status": "active",
                 "responsibilities": ["Own embedding service", "Tune retrieval pipeline"],
                 "tasks": ["HNSW index tuning", "Prompt regression suite"],
                 "skills_being_used": ["Machine Learning", "PyTorch"], "skills_developing": ["Kubernetes"], "blockers": None},
    "emp-priya": {"project_name": "Eagle AI Platform v2", "role": "ML Engineer", "team": "AI / ML",
                  "leader": "Sarah Jenkins", "sprint": "Sprint 24", "status": "active",
                  "responsibilities": ["Build fine-tuning datasets", "Monitor drift"],
                  "tasks": ["Labeling pipeline", "Drift dashboards"],
                  "skills_being_used": ["PyTorch", "Python"], "skills_developing": ["Docker", "MLOps"], "blockers": None},
    "emp-arun": {"project_name": "API Gateway v3", "role": "Senior Backend Engineer", "team": "Backend Engineering",
                 "leader": "Michael Carter", "sprint": "Sprint 12", "status": "active",
                 "responsibilities": ["Design rate limiting", "Build plugin registry"],
                 "tasks": ["Token bucket algorithm", "Contract tests"],
                 "skills_being_used": ["FastAPI", "Redis"], "skills_developing": ["Kubernetes"], "blockers": None},
    "emp-david": {"project_name": "Billing Overhaul", "role": "Backend Engineer", "team": "Backend Engineering",
                  "leader": "Michael Carter", "sprint": "Sprint 12", "status": "active",
                  "responsibilities": ["Migrate billing services", "Build GraphQL BFF"],
                  "tasks": ["Django to new contracts", "Idempotency layer"],
                  "skills_being_used": ["Python", "Django", "GraphQL"], "skills_developing": ["Docker", "AWS"], "blockers": None},
    "emp-emily": {"project_name": "API Gateway v3", "role": "Junior Backend Developer", "team": "Backend Engineering",
                  "leader": "Michael Carter", "sprint": "Sprint 12", "status": "active",
                  "responsibilities": ["Write integration tests", "Fix API defects"],
                  "tasks": ["Error schema tests", "Mock server"],
                  "skills_being_used": ["Python", "REST API"], "skills_developing": ["FastAPI", "PostgreSQL"], "blockers": None},
    "emp-marcus": {"project_name": "Design System 2.0", "role": "Senior Frontend Engineer", "team": "Frontend Engineering",
                   "leader": "Daniel Smith", "sprint": "Sprint 18", "status": "active",
                   "responsibilities": ["Lead component library", "Support app teams"],
                   "tasks": ["Data grid a11y", "Bundle budget"],
                   "skills_being_used": ["React", "TypeScript"], "skills_developing": ["Python", "FastAPI"], "blockers": None},
    "emp-sophia": {"project_name": "Admin Console Redesign", "role": "Frontend Developer", "team": "Frontend Engineering",
                   "leader": "Daniel Smith", "sprint": "Sprint 18", "status": "active",
                   "responsibilities": ["Redesign settings flows", "Contribute to design system"],
                   "tasks": ["RBAC screens", "Empty and loading states"],
                   "skills_being_used": ["React", "TypeScript"], "skills_developing": ["GraphQL"], "blockers": None},
    "emp-ryan": {"project_name": "Lakehouse Migration", "role": "Data Engineer", "team": "Data Engineering",
                 "leader": "Olivia Taylor", "sprint": "Sprint 9", "status": "active",
                 "responsibilities": ["Convert tables to Iceberg", "Write validation checks"],
                 "tasks": ["Schema migrations", "Data quality rules"],
                 "skills_being_used": ["SQL", "PostgreSQL"], "skills_developing": ["Python", "AWS"], "blockers": None},
    "emp-noah": {"project_name": "Lakehouse Migration", "role": "Data Engineer", "team": "Data Engineering",
                 "leader": "Olivia Taylor", "sprint": "Sprint 9", "status": "active",
                 "responsibilities": ["Own streaming ingestion", "Build CDC pipeline"],
                 "tasks": ["Kafka connect setup", "Backfill strategy"],
                 "skills_being_used": ["Python", "AWS"], "skills_developing": ["Kubernetes"], "blockers": None},
}

# ---------------------------------------------------------------------------
# Developing skills  (emp -> list of {name, category, status, progress, relevance, course})
# ---------------------------------------------------------------------------
DEVELOPING_SKILLS = {
    "emp-sarah": [{"name": "MLOps", "category": "DevOps & Cloud", "status": "Learning", "progress": 60,
                   "relevance": "ML Platform Leadership", "course": "AI Platform Engineering (Internal)"},
                  {"name": "Kubernetes", "category": "DevOps & Cloud", "status": "Beginner", "progress": 25,
                   "relevance": "Platform Ownership", "course": "Kubernetes Mastery"}],
    "emp-michael": [{"name": "Kubernetes", "category": "DevOps & Cloud", "status": "Developing", "progress": 70,
                     "relevance": "Platform Reliability", "course": "Kubernetes Mastery"},
                    {"name": "AWS", "category": "DevOps & Cloud", "status": "Learning", "progress": 40,
                     "relevance": "Infrastructure", "course": "AWS Solutions"}],
    "emp-daniel": [{"name": "GraphQL", "category": "Backend Dev", "status": "Learning", "progress": 45,
                    "relevance": "Frontend-Backend Integration", "course": "GraphQL in Practice"},
                   {"name": "TypeScript Advanced", "category": "Frontend Dev", "status": "Developing", "progress": 80,
                    "relevance": "Staff-level Craft", "course": "Advanced TypeScript"}],
    "emp-olivia": [{"name": "Machine Learning", "category": "AI & ML", "status": "Learning", "progress": 35,
                    "relevance": "ML Platform for Data Teams", "course": "Machine Learning Specialization"},
                   {"name": "Kafka", "category": "Data Engineering", "status": "Beginner", "progress": 15,
                    "relevance": "Streaming", "course": "Apache Kafka Fundamentals"}],
    "emp-jane": [{"name": "Machine Learning", "category": "AI & ML", "status": "Learning", "progress": 45,
                  "relevance": "AI Platform Role", "course": "Machine Learning Specialization"},
                 {"name": "Kubernetes", "category": "DevOps & Cloud", "status": "Beginner", "progress": 20,
                  "relevance": "Model Serving", "course": "Kubernetes Mastery"},
                 {"name": "PyTorch", "category": "AI & ML", "status": "Learning", "progress": 30,
                  "relevance": "Model Engineering", "course": "PyTorch for Production"}],
    "emp-alex": [{"name": "Kubernetes", "category": "DevOps & Cloud", "status": "Learning", "progress": 55,
                  "relevance": "Model Serving at Scale", "course": "Kubernetes Mastery"},
                 {"name": "MLOps", "category": "DevOps & Cloud", "status": "Developing", "progress": 65,
                  "relevance": "Lead ML Engineer", "course": "MLOps Foundations (Internal)"}],
    "emp-priya": [{"name": "Docker", "category": "DevOps & Cloud", "status": "Learning", "progress": 50,
                   "relevance": "MLOps Career Move", "course": "Docker for Developers"},
                  {"name": "MLOps", "category": "DevOps & Cloud", "status": "Beginner", "progress": 20,
                   "relevance": "MLOps Career Move", "course": "MLOps Foundations (Internal)"}],
    "emp-arun": [{"name": "Kubernetes", "category": "DevOps & Cloud", "status": "Developing", "progress": 60,
                  "relevance": "Staff Backend Engineer", "course": "Kubernetes Mastery"},
                 {"name": "System Design", "category": "Architecture", "status": "Learning", "progress": 55,
                  "relevance": "Staff Interviews", "course": "System Design Interview"}],
    "emp-david": [{"name": "Docker", "category": "DevOps & Cloud", "status": "Learning", "progress": 55,
                   "relevance": "Cloud Platform Move", "course": "Docker for Developers"},
                  {"name": "AWS", "category": "DevOps & Cloud", "status": "Learning", "progress": 40,
                   "relevance": "Cloud Platform Move", "course": "AWS Solutions"}],
    "emp-emily": [{"name": "FastAPI", "category": "Backend Dev", "status": "Developing", "progress": 60,
                   "relevance": "Core Backend Stack", "course": "FastAPI Advanced"},
                  {"name": "PostgreSQL", "category": "Data Engineering", "status": "Learning", "progress": 45,
                   "relevance": "Backend Data Access", "course": "PostgreSQL Deep Dive"}],
    "emp-marcus": [{"name": "Python", "category": "AI & ML", "status": "Learning", "progress": 35,
                    "relevance": "Full-Stack Product Ownership", "course": "Python for Everyone"},
                   {"name": "FastAPI", "category": "Backend Dev", "status": "Learning", "progress": 30,
                    "relevance": "Full-Stack Skills", "course": "FastAPI Advanced"}],
    "emp-sophia": [{"name": "GraphQL", "category": "Backend Dev", "status": "Learning", "progress": 40,
                    "relevance": "Staff Frontend Engineer", "course": "GraphQL in Practice"},
                   {"name": "Design Systems", "category": "Frontend Dev", "status": "Developing", "progress": 70,
                    "relevance": "Staff Frontend Engineer", "course": "Design System Foundations"}],
    "emp-ryan": [{"name": "Python", "category": "AI & ML", "status": "Learning", "progress": 50,
                  "relevance": "Data Engineering", "course": "Python for Data"},
                 {"name": "AWS", "category": "DevOps & Cloud", "status": "Beginner", "progress": 15,
                  "relevance": "Cloud Data Platforms", "course": "AWS Solutions"}],
    "emp-noah": [{"name": "Kubernetes", "category": "DevOps & Cloud", "status": "Learning", "progress": 45,
                  "relevance": "Streaming Infrastructure", "course": "Kubernetes Mastery"},
                 {"name": "Kafka", "category": "Data Engineering", "status": "Developing", "progress": 65,
                  "relevance": "Streaming Lead", "course": "Apache Kafka Fundamentals"}],
}

# ---------------------------------------------------------------------------
# Career goals  (emp -> {current_role, target_role, readiness 0-100, strong[], developing[], missing[]})
# ---------------------------------------------------------------------------
CAREER_GOALS = {
    "emp-sarah": {"target": "Director of AI Engineering", "readiness": 85, "strong": ["Machine Learning", "Python", "Agile"],
                  "developing": ["MLOps", "Kubernetes"], "missing": ["Budget Management", "Strategic Planning"]},
    "emp-michael": {"target": "Principal Backend Engineer", "readiness": 90, "strong": ["Python", "FastAPI", "PostgreSQL"],
                    "developing": ["Kubernetes"], "missing": ["Distributed Systems", "Staff Mentorship"]},
    "emp-daniel": {"target": "Principal Frontend Engineer", "readiness": 85, "strong": ["React", "TypeScript", "Vue.js"],
                   "developing": ["GraphQL"], "missing": ["Node.js", "Performance Profiling"]},
    "emp-olivia": {"target": "Head of Data Engineering", "readiness": 82, "strong": ["SQL", "Python", "AWS"],
                   "developing": ["Machine Learning"], "missing": ["Leadership", "Federated Architecture"]},
    "emp-jane": {"target": "Senior AI Platform Engineer", "readiness": 40, "strong": ["Python", "FastAPI", "REST API"],
                 "developing": ["Machine Learning", "Kubernetes"], "missing": ["PyTorch", "MLOps", "Docker"]},
    "emp-alex": {"target": "Lead ML Engineer", "readiness": 75, "strong": ["Machine Learning", "PyTorch", "Python"],
                 "developing": ["Kubernetes", "MLOps"], "missing": ["Team Leadership", "Kubernetes"]},
    "emp-priya": {"target": "MLOps Engineer", "readiness": 45, "strong": ["Machine Learning", "PyTorch", "Python"],
                  "developing": ["Docker", "MLOps"], "missing": ["Kubernetes", "AWS", "CI/CD"]},
    "emp-arun": {"target": "Staff Backend Engineer", "readiness": 72, "strong": ["Python", "FastAPI", "REST API"],
                 "developing": ["Kubernetes"], "missing": ["System Design", "Distributed Systems"]},
    "emp-david": {"target": "Cloud Platform Engineer", "readiness": 55, "strong": ["Python", "Django", "GraphQL"],
                  "developing": ["Docker", "AWS"], "missing": ["Kubernetes", "Terraform"]},
    "emp-emily": {"target": "Backend Engineer", "readiness": 35, "strong": ["Python", "SQL", "Git"],
                  "developing": ["FastAPI", "PostgreSQL"], "missing": ["Docker", "Redis", "Celery"]},
    "emp-marcus": {"target": "Full-Stack Engineer", "readiness": 65, "strong": ["React", "TypeScript", "GraphQL"],
                   "developing": ["Python", "FastAPI"], "missing": ["Python", "Databases"]},
    "emp-sophia": {"target": "Staff Frontend Engineer", "readiness": 58, "strong": ["React", "TypeScript"],
                   "developing": ["GraphQL", "Design Systems"], "missing": ["Node.js"]},
    "emp-ryan": {"target": "Senior Data Engineer", "readiness": 38, "strong": ["SQL", "PostgreSQL"],
                 "developing": ["Python", "AWS"], "missing": ["Airflow", "Spark"]},
    "emp-noah": {"target": "Data Engineering Lead", "readiness": 70, "strong": ["SQL", "Python", "AWS"],
                 "developing": ["Kubernetes", "Kafka"], "missing": ["Leadership"]},
}

# ---------------------------------------------------------------------------
# Portal projects (team-owned, surfaced on Team Projects pages)
# ---------------------------------------------------------------------------
PORTAL_PROJECTS = [
    {"id": "pp-eagle-ai", "name": "Eagle AI Platform v2", "description": "Next-gen internal talent & knowledge platform with semantic search.",
     "team_id": "team-ai-ml", "team_name": "AI / Machine Learning Team", "leader": "Sarah Jenkins", "leader_id": "emp-sarah",
     "status": "active", "duration": "6 months", "start": "2026-03-01", "end": "2026-09-01",
     "required": ["Machine Learning", "Python", "FastAPI", "Vector Search"], "preferred": ["NLP", "Kubernetes"],
     "roles": ["ML Engineer", "AI Platform Engineer", "Backend Engineer"], "open": 2},
    {"id": "pp-api-gw", "name": "API Gateway v3", "description": "Re-architecture of the internal API gateway with rate limiting and plugins.",
     "team_id": "team-backend", "team_name": "Backend Engineering Team", "leader": "Michael Carter", "leader_id": "emp-michael",
     "status": "active", "duration": "4 months", "start": "2026-02-15", "end": "2026-06-15",
     "required": ["FastAPI", "Python", "Redis"], "preferred": ["Kubernetes", "GraphQL"],
     "roles": ["Backend Engineer", "Platform Engineer"], "open": 1},
    {"id": "pp-ds-system", "name": "Design System 2.0", "description": "Token-based design system with full accessibility coverage.",
     "team_id": "team-frontend", "team_name": "Frontend Engineering Team", "leader": "Daniel Smith", "leader_id": "emp-daniel",
     "status": "active", "duration": "5 months", "start": "2026-01-10", "end": "2026-06-10",
     "required": ["React", "TypeScript"], "preferred": ["GraphQL", "Vue.js"],
     "roles": ["Frontend Engineer", "Design System Engineer"], "open": 1},
    {"id": "pp-lakehouse", "name": "Lakehouse Migration", "description": "Migrate warehouse to an Iceberg lakehouse on AWS.",
     "team_id": "team-data", "team_name": "Data Engineering Team", "leader": "Olivia Taylor", "leader_id": "emp-olivia",
     "status": "active", "duration": "6 months", "start": "2026-01-01", "end": "2026-07-01",
     "required": ["SQL", "AWS", "Python"], "preferred": ["Kubernetes", "Machine Learning"],
     "roles": ["Data Engineer", "Streaming Engineer"], "open": 1},
]

PORTAL_PROJECT_MEMBERS = {
    "pp-eagle-ai": [("emp-sarah", "Engineering Manager / ML", "100%"), ("emp-jane", "AI Platform Engineer", "100%"),
                    ("emp-alex", "Senior ML Engineer", "100%"), ("emp-priya", "ML Engineer", "80%")],
    "pp-api-gw": [("emp-michael", "Backend Lead", "100%"), ("emp-arun", "Senior Backend Engineer", "100%"),
                  ("emp-emily", "Junior Backend Developer", "60%")],
    "pp-ds-system": [("emp-daniel", "Frontend Lead", "100%"), ("emp-marcus", "Senior Frontend Engineer", "100%"),
                     ("emp-sophia", "Frontend Developer", "80%")],
    "pp-lakehouse": [("emp-olivia", "Data Lead", "100%"), ("emp-ryan", "Data Engineer", "100%"),
                     ("emp-noah", "Data Engineer", "100%")],
}

# ---------------------------------------------------------------------------
# Opportunities
# ---------------------------------------------------------------------------
OPPORTUNITIES = [
    {"id": "opp-1", "title": "MLOps Platform Engineer (Lead)", "type": "role", "team": "AI / Machine Learning Team",
     "team_id": "team-ai-ml", "leader": "Sarah Jenkins", "department": "Data & AI", "location": "Hybrid",
     "remote": True, "duration": "Full-time", "status": "open",
     "required": ["Docker", "Kubernetes", "Python", "MLOps"], "preferred": ["AWS", "CI/CD"],
     "description": "Lead the MLOps function: build CI/CD for ML, model registries and serving infrastructure."},
    {"id": "opp-2", "title": "20% Gig — Knowledge Graph Backend", "type": "gig", "team": "AI / Machine Learning Team",
     "team_id": "team-ai-ml", "leader": "Sarah Jenkins", "department": "Data & AI", "location": "Remote",
     "remote": True, "duration": "12 weeks", "status": "open",
     "required": ["FastAPI", "Python", "GraphQL"], "preferred": ["PostgreSQL"],
     "description": "Gig to build a knowledge-graph API for the talent platform."},
    {"id": "opp-3", "title": "Cross-Team Project — Streaming Data Platform", "type": "project", "team": "Data Engineering Team",
     "team_id": "team-data", "leader": "Olivia Taylor", "department": "Data & AI", "location": "Hybrid",
     "remote": True, "duration": "3 months", "status": "open",
     "required": ["Python", "AWS", "SQL"], "preferred": ["Kafka"],
     "description": "Contribute to the real-time streaming data platform used by every product team."},
    {"id": "opp-4", "title": "Mentorship — Backend Systems Design", "type": "mentorship", "team": "Backend Engineering Team",
     "team_id": "team-backend", "leader": "Michael Carter", "department": "Engineering", "location": "Remote",
     "remote": True, "duration": "6 sessions", "status": "open",
     "required": ["Python", "PostgreSQL"], "preferred": ["System Design", "Distributed Systems"],
     "description": "One-on-one mentorship on systems design and distributed systems fundamentals."},
]

# ---------------------------------------------------------------------------
# Requests
# ---------------------------------------------------------------------------
REQUESTS = [
    {"id": "req-101", "type": "course", "requester": "emp-jane", "target_id": "lr-pytorch", "target": "PyTorch for Production",
     "reason": "Need PyTorch to contribute to model fine-tuning work.", "skill": "PyTorch",
     "benefit": "Unblock participation in model engineering deliverables.", "status": "pending"},
    {"id": "req-102", "type": "project", "requester": "emp-priya", "target_id": "opp-3", "target": "Cross-Team Project — Streaming Data Platform",
     "reason": "Want to build streaming exposure as part of moving to MLOps.", "skill": "Kafka / Streaming",
     "benefit": "Add Kafka and streaming skills toward MLOps goal.", "status": "pending"},
    {"id": "req-103", "type": "course", "requester": "emp-emily", "target_id": "lr-fastapi", "target": "FastAPI Advanced",
     "reason": "Wants to become productive in the core backend stack.", "skill": "FastAPI",
     "benefit": "Accelerate onboarding to API Gateway team.", "status": "pending"},
    {"id": "req-104", "type": "course", "requester": "emp-marcus", "target_id": "lr-python", "target": "Python for Everyone",
     "reason": "Building full-stack skills for product ownership.", "skill": "Python",
     "benefit": "Unlock full-stack delivery on team projects.", "status": "pending"},
]

# ---------------------------------------------------------------------------
# Notifications  (user_id is the recipient)
# ---------------------------------------------------------------------------
NOTIFICATIONS = [
    ("emp-michael", "New Request", "Emily Davis requested approval for \"FastAPI Advanced\".", "system", "/tl/requests"),
    ("emp-sarah", "New Request", "Jane Doe requested approval for \"PyTorch for Production\".", "system", "/tl/requests"),
    ("emp-jane", "Request Approved", "Your request for \"Machine Learning Specialization\" was approved.", "request_approved", "/learning"),
    ("emp-daniel", "New Request", "Marcus Vance requested approval for \"Python for Everyone\".", "system", "/tl/requests"),
    ("emp-olivia", "New Project Match", "3 candidates matched the Lakehouse Migration project.", "system", "/tl/projects"),
]

# ---------------------------------------------------------------------------
# Learning resources (enriched for the Course UI)
# ---------------------------------------------------------------------------
LEARNING_RESOURCES = [
    {"id": "lr-docker", "title": "Docker for Developers", "provider": "Udemy", "skill": "Docker", "level": "beginner",
     "hours": 9, "type": "course", "free": False, "url": "https://udemy.com/docker", "desc": "Containerize, ship and run applications with Docker."},
    {"id": "lr-fastapi", "title": "FastAPI Advanced", "provider": "Official Docs", "skill": "FastAPI", "level": "intermediate",
     "hours": 5, "type": "course", "free": True, "url": "https://fastapi.tiangolo.com", "desc": "Dependencies, background tasks, testing and deployment."},
    {"id": "lr-ml", "title": "Machine Learning Specialization", "provider": "Coursera", "skill": "Machine Learning", "level": "beginner",
     "hours": 40, "type": "course", "free": False, "url": "https://coursera.org/ml-specialization", "desc": "Foundational ML theory and practice with supervised learning."},
    {"id": "lr-postgres", "title": "PostgreSQL Deep Dive", "provider": "Udemy", "skill": "PostgreSQL", "level": "intermediate",
     "hours": 12, "type": "course", "free": False, "url": "https://udemy.com/postgres", "desc": "Indexing, query planning, vacuum and performance tuning."},
    {"id": "lr-pytorch", "title": "PyTorch for Production", "provider": "freeCodeCamp", "skill": "PyTorch", "level": "intermediate",
     "hours": 15, "type": "video", "free": True, "url": "https://youtube.com/pytorch", "desc": "Build, train and deploy PyTorch models to production."},
    {"id": "lr-k8s", "title": "Kubernetes Mastery", "provider": "Pluralsight", "skill": "Kubernetes", "level": "intermediate",
     "hours": 20, "type": "course", "free": False, "url": "https://pluralsight.com/k8s", "desc": "Deploy, scale and operate clusters for production workloads."},
    {"id": "lr-aws", "title": "AWS Solutions", "provider": "AWS Training", "skill": "AWS", "level": "intermediate",
     "hours": 25, "type": "course", "free": False, "url": "https://aws.training", "desc": "Architecting on AWS with compute, storage and networking."},
    {"id": "lr-nlp", "title": "NLP with Transformers", "provider": "Coursera", "skill": "NLP", "level": "intermediate",
     "hours": 18, "type": "course", "free": False, "url": "https://coursera.org/nlp", "desc": "Modern NLP with transformers, fine-tuning and evaluation."},
    {"id": "lr-react", "title": "React 18 Masterclass", "provider": "Udemy", "skill": "React", "level": "intermediate",
     "hours": 22, "type": "course", "free": False, "url": "https://udemy.com/react", "desc": "Hooks, performance, and production patterns in React 18."},
    {"id": "lr-ts", "title": "Advanced TypeScript", "provider": "Udemy", "skill": "TypeScript", "level": "advanced",
     "hours": 10, "type": "course", "free": False, "url": "https://udemy.com/ts", "desc": "Generics, type gymnastics and design patterns in TypeScript."},
    {"id": "lr-redis", "title": "Redis in Production", "provider": "Udemy", "skill": "Redis", "level": "intermediate",
     "hours": 8, "type": "course", "free": False, "url": "https://udemy.com/redis", "desc": "Caching, message queues and data structures with Redis."},
    {"id": "lr-graphql", "title": "GraphQL in Practice", "provider": "Strawberry Docs", "skill": "GraphQL", "level": "intermediate",
     "hours": 6, "type": "course", "free": True, "url": "https://strawberry.rocks", "desc": "Schema design, resolvers and federation with GraphQL."},
    {"id": "lr-python", "title": "Python for Everyone", "provider": "Coursera", "skill": "Python", "level": "beginner",
     "hours": 18, "type": "course", "free": False, "url": "https://coursera.org/python", "desc": "Practical Python foundations for data and backend work."},
]

# ---------------------------------------------------------------------------
# Enrollments & certifications  (emp -> list of (resource_id, status, progress, skills))
# ---------------------------------------------------------------------------
ENROLLMENTS = {
    "emp-jane": [("lr-ml", "enrolled", 45, ["Machine Learning"]), ("lr-k8s", "enrolled", 20, ["Kubernetes"])],
    "emp-alex": [("lr-k8s", "enrolled", 55, ["Kubernetes"]), ("lr-postgres", "completed", 100, ["PostgreSQL"])],
    "emp-priya": [("lr-docker", "enrolled", 50, ["Docker"]), ("lr-ml", "completed", 100, ["Machine Learning"])],
    "emp-arun": [("lr-k8s", "enrolled", 60, ["Kubernetes"]), ("lr-redis", "completed", 100, ["Redis"])],
    "emp-david": [("lr-docker", "enrolled", 55, ["Docker"]), ("lr-aws", "enrolled", 40, ["AWS"])],
    "emp-emily": [("lr-fastapi", "enrolled", 60, ["FastAPI"]), ("lr-postgres", "enrolled", 45, ["PostgreSQL"])],
    "emp-marcus": [("lr-python", "enrolled", 35, ["Python"]), ("lr-fastapi", "enrolled", 30, ["FastAPI"])],
    "emp-sophia": [("lr-graphql", "enrolled", 40, ["GraphQL"]), ("lr-ts", "completed", 100, ["TypeScript"])],
    "emp-ryan": [("lr-aws", "enrolled", 15, ["AWS"]), ("lr-postgres", "enrolled", 30, ["PostgreSQL"])],
    "emp-noah": [("lr-k8s", "enrolled", 45, ["Kubernetes"]), ("lr-redis", "completed", 100, ["Redis"])],
    "emp-sarah": [("lr-k8s", "enrolled", 25, ["Kubernetes"]), ("lr-nlp", "completed", 100, ["NLP"])],
    "emp-michael": [("lr-k8s", "enrolled", 70, ["Kubernetes"]), ("lr-aws", "enrolled", 40, ["AWS"])],
    "emp-daniel": [("lr-graphql", "enrolled", 45, ["GraphQL"])],
    "emp-olivia": [("lr-ml", "enrolled", 35, ["Machine Learning"])],
}

CERTIFICATIONS = {
    "emp-alex": [("AWS Certified ML Specialty", "Amazon", "2025-11-05")],
    "emp-arun": [("Redis Certified Developer", "Redis", "2025-06-20")],
    "emp-sophia": [("TypeScript Certified", "Microsoft", "2025-09-12")],
    "emp-noah": [("AWS Solutions Architect Associate", "Amazon", "2024-08-30")],
    "emp-michael": [("AWS Solutions Architect Professional", "Amazon", "2024-03-15")],
}

# ---------------------------------------------------------------------------
# HR projects + learning resources already seeded by legacy flow; keep HR projects here
# ---------------------------------------------------------------------------
HR_PROJECTS = [
    {"id": "proj-ai-platform", "name": "Eagle AI Platform v2", "department": "Data & AI",
     "description": "Next-gen internal talent & knowledge platform with semantic search.",
     "business_objective": "Increase internal mobility by matching talent semantically.",
     "duration": 6, "location": "Hybrid", "work_mode": "hybrid", "headcount": 3, "priority": "critical", "status": "active"},
    {"id": "proj-api-gateway", "name": "API Gateway v3", "department": "Engineering",
     "description": "Re-architecture of the internal API gateway with plugins and rate limiting.",
     "business_objective": "Improve developer experience and API reliability.",
     "duration": 4, "location": "Hybrid", "work_mode": "hybrid", "headcount": 2, "priority": "high", "status": "active"},
    {"id": "proj-lakehouse", "name": "Lakehouse Migration", "department": "Data & AI",
     "description": "Migrate the data warehouse to an Iceberg lakehouse on AWS.",
     "business_objective": "Reduce warehouse costs and enable streaming analytics.",
     "duration": 6, "location": "Remote", "work_mode": "remote", "headcount": 2, "priority": "medium", "status": "active"},
]

# ---------------------------------------------------------------------------
# Build functions
# ---------------------------------------------------------------------------
def _emp_number(index: int) -> str:
    return f"EV-{1000 + index}"


def _str_date(iso: str):
    from datetime import date
    try:
        return date.fromisoformat(iso)
    except ValueError:
        return date.today()


def get_seed_data():
    """Return the full seed structure as nested dictionaries (legacy accessor)."""
    return {
        "departments": [{"id": d[0], "name": d[1], "description": d[2], "head_count": d[3]} for d in DEPARTMENTS],
        "skill_categories": [{"id": c[0], "name": c[1]} for c in SKILL_CATEGORIES],
        "skills": [{"id": s[0], "name": s[1], "category_id": s[2], "skill_type": s[3]} for s in SKILLS],
        "teams": [{"id": t[0], "name": t[1], "department": t[2], "leader_id": t[3], "description": t[4]} for t in TEAMS],
        "employees": [
            {
                "id": e[0], "first_name": e[1], "last_name": e[2], "job_title": e[3],
                "team_id": e[4], "persona": e[5], "years": e[6], "location": e[7], "summary": e[8],
            }
            for e in EMPLOYEES
        ],
        "projects": HR_PROJECTS,
        "learning_resources": LEARNING_RESOURCES,
    }


async def seed_database(session):
    """Seed the entire Eagle Vision database. Idempotent — skips if users exist."""
    from sqlalchemy import select

    existing = await session.execute(select(User).limit(1))
    if existing.scalar_one_or_none():
        return

    print("[Seed] Seeding Eagle Vision database...")

    skill_by_name = {}
    for cat_id, cat_name in SKILL_CATEGORIES:
        session.add(SkillTaxonomyCategory(id=cat_id, name=cat_name))
    for sk_id, sk_name, cat_id, sk_type in SKILLS:
        skill = Skill(id=sk_id, name=sk_name, category_id=cat_id, skill_type=sk_type)
        skill_by_name[sk_name] = skill
        session.add(skill)

    for d in DEPARTMENTS:
        session.add(Department(id=d[0], name=d[1], description=d[2], head_count=d[3]))

    for t in TEAMS:
        session.add(Team(id=t[0], name=t[1], department=t[2], leader_id=t[3], description=t[4]))

    password_hash = get_password_hash(DEMO_PASSWORD)

    # HR users
    session.add(User(id="user-hr-admin", email="hr@eaglevision.ai", hashed_password=password_hash,
                     full_name="Sarah Carter", role="hr_admin", is_active=True))
    session.add(User(id="user-hr-2", email="talent@eaglevision.ai", hashed_password=password_hash,
                     full_name="Meera Talent", role="hr", is_active=True))

    avatars = [
        "https://i.pravatar.cc/150?img=11", "https://i.pravatar.cc/150?img=12", "https://i.pravatar.cc/150?img=13",
        "https://i.pravatar.cc/150?img=14", "https://i.pravatar.cc/150?img=47", "https://i.pravatar.cc/150?img=32",
        "https://i.pravatar.cc/150?img=44", "https://i.pravatar.cc/150?img=68", "https://i.pravatar.cc/150?img=5",
        "https://i.pravatar.cc/150?img=3", "https://i.pravatar.cc/150?img=1", "https://i.pravatar.cc/150?img=15",
        "https://i.pravatar.cc/150?img=16", "https://i.pravatar.cc/150?img=59",
    ]

    employee_by_id = {}
    for idx, e in enumerate(EMPLOYEES):
        emp_id, first, last, title, team_id, persona, years, location, summary = e
        email = f"{first.lower()}.{last.lower().replace(' ', '.')}@eaglevision.ai"
        user = User(id=f"user-{emp_id}", email=email, hashed_password=password_hash,
                    full_name=f"{first} {last}",
                    role="team_leader" if emp_id in TEAM_LEADER_MAP.values() else "employee",
                    is_active=True)
        session.add(user)
        await session.flush()

        emp = Employee(
            id=emp_id,
            user_id=user.id,
            first_name=first,
            last_name=last,
            job_title=title,
            department=next(t[2] for t in TEAMS if t[0] == team_id),
            location=location,
            bio=summary,
            years_of_experience=years,
            open_to_remote=True,
            open_to_gigs=True,
            open_to_roles=True,
            team_id=team_id,
            persona=persona,
            professional_summary=summary,
            avatar=emp_avatar(emp_id, avatars),
            joining_date=_join_date(years),
        )
        session.add(emp)
        employee_by_id[emp_id] = emp

        for skill_name, prof, yrs in EMPLOYEE_SKILLS.get(emp_id, []):
            session.add(EmployeeSkill(
                employee_id=emp_id,
                skill_id=skill_by_name[skill_name].id,
                proficiency_level=prof,
                years_of_experience=yrs,
                is_verified=True,
            ))

        for exp in EXPERIENCES.get(emp_id, []):
            session.add(WorkExperience(
                employee_id=emp_id,
                company_name=exp["company"],
                title=exp["role"],
                description=" • ".join(exp["responsibilities"]),
                start_date=_str_date(f"{exp['start']}-01-01"),
                end_date=_str_date(f"{exp['end']}-12-31"),
                is_current=exp.get("current", False),
            ))

        cw = CURRENT_WORK.get(emp_id)
        if cw:
            session.add(CurrentWork(
                employee_id=emp_id,
                project_name=cw["project_name"],
                role=cw["role"],
                team=cw["team"],
                team_leader_name=cw["leader"],
                sprint_period=cw["sprint"],
                status=cw["status"],
                responsibilities=cw["responsibilities"],
                current_tasks=cw["tasks"],
                skills_being_used=cw["skills_being_used"],
                skills_currently_developing=cw["skills_developing"],
                blockers=cw.get("blockers"),
            ))

        for dev in DEVELOPING_SKILLS.get(emp_id, []):
            session.add(DevelopingSkill(
                employee_id=emp_id,
                name=dev["name"],
                category=dev["category"],
                status=dev["status"],
                progress_percentage=dev["progress"],
                target_role_relevance=dev["relevance"],
                associated_course_or_gig=dev["course"],
            ))

        goal = CAREER_GOALS.get(emp_id)
        if goal:
            session.add(CareerGoal(
                employee_id=emp_id,
                current_role=title,
                target_role=goal["target"],
                readiness_score=goal["readiness"],
                strong_skills=goal["strong"],
                developing_skills=goal["developing"],
                missing_skills=goal["missing"],
                open_to_gigs=True,
                open_to_transfer=True,
                open_to_mentorship=emp_id not in ("emp-suresh",),
                preferred_roles=[],
                remote_preference="hybrid",
            ))

        for res_id, status, progress, skills in ENROLLMENTS.get(emp_id, []):
            res = next(r for r in LEARNING_RESOURCES if r["id"] == res_id)
            session.add(CourseEnrollment(
                employee_id=emp_id,
                resource_id=res_id,
                title=res["title"],
                provider=res["provider"],
                skill_name=res["skill"],
                status=status,
                progress_percentage=progress,
                skills_gained=skills if status == "completed" else [],
                completed_at=_now_iso() if status == "completed" else None,
            ))

        for cert in CERTIFICATIONS.get(emp_id, []):
            session.add(Certification(employee_id=emp_id, name=cert[0], issuer=cert[1], issue_date=cert[2]))

    await session.flush()

    # Portal projects + members
    for p in PORTAL_PROJECTS:
        session.add(Project(
            id=p["id"], name=p["name"], description=p["description"],
            team_id=p["team_id"], team_name=p["team_name"], team_leader_id=p["leader_id"],
            team_leader_name=p["leader"], status=p["status"], duration=p["duration"],
            start_date=p["start"], end_date=p["end"],
            required_skills=p["required"], preferred_skills=p["preferred"],
            available_roles=p["roles"], open_positions_count=p["open"],
        ))
    for proj_id, members in PORTAL_PROJECT_MEMBERS.items():
        for emp_id, role, allocation in members:
            emp = employee_by_id[emp_id]
            session.add(ProjectMember(
                project_id=proj_id, employee_id=emp_id, name=f"{emp.first_name} {emp.last_name}",
                role=role, avatar=emp_avatar(emp_id, avatars), allocation=allocation,
            ))

    # Opportunities
    for o in OPPORTUNITIES:
        session.add(InternalOpportunity(
            id=o["id"], title=o["title"], description=o["description"], type=o["type"],
            team=o["team"], team_id=o["team_id"], team_leader_name=o["leader"],
            department=o["department"], location=o["location"], is_remote=o["remote"],
            duration=o["duration"], required_skills=o["required"], preferred_skills=o["preferred"],
            status=o["status"],
        ))

    # Requests + notifications
    for r in REQUESTS:
        emp = employee_by_id[r["requester"]]
        team_name = next(t[1] for t in TEAMS if t[0] == emp.team_id)
        session.add(EmployeeRequest(
            id=r["id"], type=r["type"], requester_id=r["requester"],
            requester_name=f"{emp.first_name} {emp.last_name}",
            requester_avatar=emp_avatar(r["requester"], avatars),
            requester_role=emp.job_title, requester_team_id=emp.team_id or "",
            requester_team_name=team_name, target_id=r["target_id"], target_title=r["target"],
            reason=r["reason"], desired_role_or_skill=r["skill"], expected_benefit=r["benefit"],
            status=r["status"],
        ))

    for n in NOTIFICATIONS:
        session.add(Notification(user_id=f"user-{n[0]}", title=n[1], message=n[2], type=n[3], action_url=n[4]))

    # HR projects
    for p in HR_PROJECTS:
        session.add(HRProject(
            id=p["id"], name=p["name"], department=p["department"], description=p["description"],
            business_objective=p["business_objective"], duration_months=p["duration"],
            location=p["location"], work_mode=p["work_mode"], headcount=p["headcount"],
            priority=p["priority"], status=p["status"],
        ))

    # Learning resources
    for lr in LEARNING_RESOURCES:
        session.add(LearningResource(
            id=lr["id"], title=lr["title"], description=lr["desc"], provider=lr["provider"],
            url=lr["url"], skill_name=lr["skill"], skill_level=lr["level"],
            duration_hours=lr["hours"], resource_type=lr["type"], is_free=lr["free"],
        ))

    await session.commit()
    print("[Seed] OK Eagle Vision database seeded.")


def emp_avatar(emp_id: str, avatars=None) -> str:
    idx = 0
    for e in EMPLOYEES:
        if e[0] == emp_id:
            return (avatars or _DEFAULT_AVATARS)[idx]
        idx += 1
    return "https://i.pravatar.cc/150?img=11"


def _join_date(years: float):
    from datetime import date, timedelta
    return date.today() - timedelta(days=int(years * 365))


_DEFAULT_AVATARS = [
    "https://i.pravatar.cc/150?img=11", "https://i.pravatar.cc/150?img=12", "https://i.pravatar.cc/150?img=13",
    "https://i.pravatar.cc/150?img=14", "https://i.pravatar.cc/150?img=47", "https://i.pravatar.cc/150?img=32",
    "https://i.pravatar.cc/150?img=44", "https://i.pravatar.cc/150?img=68", "https://i.pravatar.cc/150?img=5",
    "https://i.pravatar.cc/150?img=3", "https://i.pravatar.cc/150?img=1", "https://i.pravatar.cc/150?img=15",
    "https://i.pravatar.cc/150?img=16", "https://i.pravatar.cc/150?img=59",
]


def _now_iso():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc)