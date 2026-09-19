"""
Resume Analysis Agent
=====================
An autonomous, fair, and explainable AI resume-to-score pipeline inspired by
HackerRank/InterviewStreet's hiring agent architecture.

Features:
- Markdown/PDF parsing using PyMuPDF and pymupdf4llm
- Structured JSONResume schema normalization
- Optional GitHub developer signal enrichment
- Role-based scoring rubrics with strict fairness constraints
- LLM evaluation powered by Google Gemini SDK with deterministic fallback
- Clean interfaces: Python SDK, CLI, and REST Microservice
"""

from resume_analysis_agent.agent import ResumeAnalysisAgent
from resume_analysis_agent.core.models import (
    AnalysisReport,
    CategoryScore,
    EvaluationResult,
    JSONResume,
    RoleRubric,
    ScoringCategory,
)

__version__ = "1.0.0"
__all__ = [
    "ResumeAnalysisAgent",
    "JSONResume",
    "RoleRubric",
    "ScoringCategory",
    "CategoryScore",
    "EvaluationResult",
    "AnalysisReport",
]
