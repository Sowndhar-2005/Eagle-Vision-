"""
Standalone FastAPI REST Microservice for Resume Analysis Agent.
Enables seamless HTTP integration into any external ATS, platform, or dashboard.
"""

from typing import List, Optional
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from resume_analysis_agent.agent import ResumeAnalysisAgent
from resume_analysis_agent.core.config import settings
from resume_analysis_agent.core.models import AnalysisReport, RoleRubric

app = FastAPI(
    title="Resume Analysis Agent API",
    description=(
        "Autonomous, fair, and explainable AI resume-to-score microservice with "
        "GitHub signal enrichment and dynamic role rubrics."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = ResumeAnalysisAgent()


# Request / Response DTOs
class TextAnalysisRequest(BaseModel):
    text: str
    role: str = "software_engineering_intern"
    enrich_github: bool = True


@app.get("/health", tags=["System"])
@app.get("/api/v1/health", tags=["System"])
async def health_check():
    """Service health and capability status."""
    return {
        "status": "healthy",
        "service": "Resume Analysis Agent",
        "version": "1.0.0",
        "available_roles": agent.list_roles(),
    }


@app.get("/api/v1/roles", response_model=List[RoleRubric], tags=["Roles"])
async def get_roles():
    """List all available role rubrics and their scoring criteria."""
    from resume_analysis_agent.roles.manager import RoleManager
    return RoleManager.get_all_roles()


@app.post("/api/v1/roles", status_code=status.HTTP_201_CREATED, tags=["Roles"])
async def register_role(rubric: RoleRubric):
    """Register or update a custom role rubric at runtime."""
    agent.register_role(rubric)
    return {"message": f"Role '{rubric.name}' registered successfully.", "role": rubric.name}


@app.post("/api/v1/analyze", response_model=AnalysisReport, tags=["Analysis"])
async def analyze_resume_file(
    file: UploadFile = File(...),
    role: str = Form("software_engineering_intern"),
    enrich_github: bool = Form(True),
):
    """
    Upload a resume file (PDF or text) and receive a comprehensive scoring report.
    """
    try:
        content = await file.read()
        report = agent.analyze(
            input_source=content,
            role=role,
            enrich_github=enrich_github,
            filename=file.filename or "resume.pdf",
        )
        return report
    except KeyError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/api/v1/analyze/text", response_model=AnalysisReport, tags=["Analysis"])
async def analyze_resume_text(payload: TextAnalysisRequest):
    """
    Analyze raw resume text or markdown and receive a comprehensive scoring report.
    """
    try:
        report = agent.analyze(
            input_source=payload.text,
            role=payload.role,
            enrich_github=payload.enrich_github,
        )
        return report
    except KeyError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/api/v1/analyze/markdown", tags=["Analysis"])
async def analyze_resume_to_markdown(
    file: UploadFile = File(...),
    role: str = Form("software_engineering_intern"),
    enrich_github: bool = Form(True),
):
    """
    Upload a resume and receive a human-readable Markdown evaluation report.
    """
    try:
        content = await file.read()
        report = agent.analyze(
            input_source=content,
            role=role,
            enrich_github=enrich_github,
            filename=file.filename or "resume.pdf",
        )
        markdown_output = agent.format_report_markdown(report)
        return {"report_markdown": markdown_output}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.AGENT_HOST, port=settings.AGENT_PORT)
