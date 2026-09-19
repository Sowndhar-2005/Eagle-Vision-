"""
Integration Reference & Example.
Demonstrates how external systems (Eagle Vision, ATS, HR tools, or third-party web apps)
can easily integrate with the Resume Analysis Agent via:
1. Direct Python SDK Import (embedded in-process)
2. Standalone HTTP REST Client (microservice architecture)
"""

import sys
from pathlib import Path

# Add project root to sys.path for standalone demonstration
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from resume_analysis_agent import ResumeAnalysisAgent


SAMPLE_RESUME_TEXT = """
# Alex Mercer
Email: alex.mercer@example.com | Phone: (555) 234-5678
GitHub: https://github.com/torvalds | LinkedIn: https://linkedin.com/in/alex-mercer

## Professional Summary
Software engineer with 2 years of experience building scalable backend microservices,
RESTful APIs, and distributed event pipelines in Python and Go. Passionate about open source,
clean architecture, and containerized cloud services.

## Technical Skills
- Languages: Python, Go, TypeScript, SQL
- Frameworks: FastAPI, Flask, Gin, React
- Databases & Storage: PostgreSQL, Redis, MongoDB
- Cloud & DevOps: Docker, Kubernetes, GitHub Actions, AWS (S3, ECS)
- Concepts: REST APIs, Async I/O, Unit & Integration Testing, CI/CD

## Experience
### Software Engineering Intern | CloudScale Systems
June 2024 – August 2024 | San Francisco, CA
- Developed asynchronous telemetry microservice using FastAPI and PostgreSQL, reducing latency by 35%.
- Implemented automated CI/CD pipeline using GitHub Actions, decreasing build failures by 40%.
- Authored comprehensive test suite achieving 92% code coverage using pytest and httpx.

## Projects
### Distributed Task Scheduler (Go, Redis)
- Built a high-concurrency background job processor handling 5,000 tasks/sec with exponential backoff.
- Integrated Redis pub/sub for real-time task status updates.
- Source: https://github.com/torvalds/task-scheduler

### AI Documentation Assistant (Python, FastAPI, Vector Search)
- Implemented RAG pipeline parsing API documentation with semantic embedding search.
- Deployed on AWS ECS with Docker containerization.

## Education
B.S. in Computer Science | State University (2021 – 2025)
"""


def demonstrate_python_sdk_integration():
    """Method 1: Direct in-process Python integration (3 lines of code)."""
    print("\n" + "=" * 70)
    print(" METHOD 1: Direct Python SDK In-Process Integration")
    print("=" * 70)

    # 1. Initialize agent
    agent = ResumeAnalysisAgent()

    # 2. Analyze resume text or PDF
    print("Evaluating candidate against 'software_engineering_intern' role...")
    report = agent.analyze(
        input_source=SAMPLE_RESUME_TEXT,
        role="software_engineering_intern",
        enrich_github=False,  # Skip external network calls during demo
    )

    # 3. Access structured results
    print(f"\nCandidate: {report.resume.basics.name}")
    print(f"Role: {report.evaluation.position_title}")
    print(f"Final Score: {report.evaluation.normalized_score}/100")
    print(f"Recommendation: {report.evaluation.recommendation}")
    print("\nCategory Breakdown:")
    for cat_key, cat in report.evaluation.category_scores.items():
        print(f"  • {cat.label}: {cat.score}/{cat.max} pts — {cat.evidence[:65]}...")

    print("\nExecutive Summary:")
    print(f"  {report.evaluation.summary_rationale}")


def demonstrate_custom_role_integration():
    """Method 2: Dynamically registering custom role rubrics from host application."""
    print("\n" + "=" * 70)
    print(" METHOD 2: Dynamic Custom Role Registration")
    print("=" * 70)

    from resume_analysis_agent.core.models import RoleRubric, ScoringCategory

    # Host app defines its own tailored rubric
    custom_rubric = RoleRubric(
        name="cloud_infrastructure_engineer",
        position_title="Cloud Infrastructure & DevOps Engineer",
        categories=[
            ScoringCategory(key="cloud_architecture", label="Cloud & Terraform", max=40, description="AWS/GCP, IaC"),
            ScoringCategory(key="container_orchestration", label="K8s & Docker", max=30, description="Kubernetes, Docker"),
            ScoringCategory(key="cicd_automation", label="CI/CD & Observability", max=30, description="GitHub Actions, Prometheus"),
        ],
        bonus_max=10,
        passing_cutoff=65,
    )

    agent = ResumeAnalysisAgent()
    agent.register_role(custom_rubric)

    print(f"Registered custom role '{custom_rubric.name}'.")
    report = agent.analyze(SAMPLE_RESUME_TEXT, role="cloud_infrastructure_engineer", enrich_github=False)
    print(f"Score for Custom Role: {report.evaluation.normalized_score}/100 -> {report.evaluation.recommendation}")


if __name__ == "__main__":
    demonstrate_python_sdk_integration()
    demonstrate_custom_role_integration()
