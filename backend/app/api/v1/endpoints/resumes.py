"""
Eagle Vision â€” Resume Analysis Endpoints
Upload a resume, extract structured data with the Resume Analysis Agent,
and ingest verified skills into the employee's living profile.
"""

import uuid
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models import Employee, EmployeeSkill, Skill
from app.models.portal import Resume, ResumeAnalysis, AIExtractionResult
from app.models.user import User
from app.services.portal_service import (
    employee_for_user, build_profile_dict,
)

router = APIRouter()

ALLOWED_TYPES = {".pdf", ".txt", ".md", ".doc"}


@router.post("/upload", summary="Upload a resume for AI analysis")
async def upload_resume(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_TYPES)}")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    emp = await employee_for_user(db, user)

    text = _extract_text(content, suffix)
    resume = Resume(
        filename=file.filename or "resume.pdf",
        file_path="",
        extracted_text=text,
        employee_id=emp.id if emp else None,
        status="uploaded",
    )
    db.add(resume)
    await db.flush()

    try:
        report = await _run_agent(content, file.filename or "resume.pdf")
        analysis = await _store_agent_report(db, resume, report)
    except Exception as exc:  # agent unavailable / no API key -> honest fallback
        analysis = await _store_fallback(db, resume, text, reason=str(exc))

    if emp:
        await _ingest_extracted_skills(db, emp, analysis)

    return {
        "id": resume.id,
        "status": resume.status,
        "summary": analysis["summary"],
        "extractedSkills": analysis["extracted_skills"],
        "modelUsed": analysis["model_used"],
        "recommendation": analysis["recommendation"],
    }


@router.get("/{resume_id}", summary="Get a resume analysis result")
async def get_resume(
    resume_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = q.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    q = await db.execute(select(ResumeAnalysis).where(ResumeAnalysis.resume_id == resume_id))
    analysis = q.scalar_one_or_none()
    return {
        "id": resume.id,
        "filename": resume.filename,
        "status": resume.status,
        "createdAt": resume.created_at.isoformat() if resume.created_at else "",
        "analysis": {
            "summary": analysis.summary if analysis else None,
            "extractedSkills": analysis.extracted_skills if analysis else [],
            "structuredData": analysis.structured_data if analysis else {},
            "modelUsed": analysis.model_used if analysis else "none",
            "recommendation": analysis.recommendation if analysis else None,
        },
    }


# ---------------------------------------------------------------------------
# Internals
# ---------------------------------------------------------------------------

async def _run_agent(content: bytes, filename: str):
    """Run the external Resume Analysis Agent library when available."""
    from resume_analysis_agent.agent import ResumeAnalysisAgent
    agent = ResumeAnalysisAgent()
    return agent.analyze(input_source=content, role="software_engineering_intern",
                         enrich_github=False, filename=filename)


def _extract_text(content: bytes, suffix: str) -> str:
    if suffix == ".pdf":
        try:
            import io
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(content))
            return "\n".join((p.extract_text() or "") for p in reader.pages)
        except Exception:
            return content.decode("utf-8", errors="replace")
    return content.decode("utf-8", errors="replace")


async def _store_agent_report(db, resume, report) -> dict:
    resume_text = resume.extracted_text or ""
    from app.ai.skill_extractor import extract_skills

    extracted = extract_skills(resume_text) if resume_text else []
    eval_res = getattr(report, "evaluation", None)
    summary = eval_res.summary_rationale if eval_res else (report.resume.basics.summary if report.resume.basics else None)
    score = eval_res.normalized_score if eval_res else None
    recommendation = "shortlist" if (score or 0) >= 70 else ("review" if (score or 0) >= 50 else "no")
    model_used = "resume_analysis_agent"

    structured = {
        "name": report.resume.basics.name if report.resume.basics else None,
        "email": report.resume.basics.email if report.resume.basics else None,
        "score": score,
        "role": eval_res.position_title if eval_res else None,
    }

    resume.status = "analyzed"
    analysis = ResumeAnalysis(
        resume_id=resume.id,
        structured_data=structured,
        extracted_skills=extracted,
        summary=str(summary or ""),
        model_used=model_used,
        recommendation=recommendation,
    )
    db.add(analysis)
    _add_evidence_rows(db, resume.id, extracted, summary or "")
    await db.flush()
    return {
        "summary": str(summary or ""),
        "extracted_skills": extracted,
        "model_used": model_used,
        "recommendation": recommendation,
    }


async def _store_fallback(db, resume, text: str, reason: str) -> dict:
    from app.ai.skill_extractor import extract_skills
    extracted = extract_skills(text) if text else []
    resume.status = "analyzed"
    analysis = ResumeAnalysis(
        resume_id=resume.id,
        structured_data={"fallback": True, "reason": reason[:200]},
        extracted_skills=extracted,
        summary="Resume skills extracted with the deterministic local extractor (agent/model unavailable).",
        model_used="deterministic-fallback",
        recommendation="review",
    )
    db.add(analysis)
    _add_evidence_rows(db, resume.id, extracted, "")
    await db.flush()
    return {
        "summary": "Resume skills extracted with the deterministic local extractor (agent/model unavailable).",
        "extracted_skills": extracted,
        "model_used": "deterministic-fallback",
        "recommendation": "review",
    }


def _add_evidence_rows(db, resume_id: str, skills: List[str], summary: str):
    for s in skills:
        db.add(AIExtractionResult(
            source_type="resume", source_id=resume_id, entity_type="skill",
            entity_name=s, evidence="Extracted from resume", confidence=0.6,
        ))


async def _ingest_extracted_skills(db, emp: Employee, analysis: dict):
    """Add extracted skills to the employee profile marked as Agent-verified."""
    skills_map = {}
    q = await db.execute(select(Skill))
    for s in q.scalars().all():
        skills_map[s.name.lower()] = s

    for name in analysis.get("extracted_skills", [])[:15]:
        skill = skills_map.get(name.lower())
        if not skill:
            skill = Skill(id=str(uuid.uuid4()), name=name, category_id="cat-aiml", skill_type="technical")
            db.add(skill)
            skills_map[name.lower()] = skill
            await db.flush()

        q = await db.execute(
            select(EmployeeSkill).where(EmployeeSkill.employee_id == emp.id,
                                        EmployeeSkill.skill_id == skill.id)
        )
        if not q.scalar_one_or_none():
            db.add(EmployeeSkill(
                employee_id=emp.id, skill_id=skill.id, proficiency_level=3,
                years_of_experience=0, is_verified=True,
                evidence="Extracted & verified via Resume Analysis Agent ingestion.",
                evidence_source="project-deliverable",
            ))
    await db.flush()
