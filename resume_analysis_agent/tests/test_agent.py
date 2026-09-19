"""End-to-end unit tests for ResumeAnalysisAgent SDK and Evaluator."""

import pytest
from resume_analysis_agent.agent import ResumeAnalysisAgent
from resume_analysis_agent.core.extractor import ResumeExtractor
from resume_analysis_agent.core.models import JSONResume


def test_github_handle_extraction(sample_resume_text):
    resume = ResumeExtractor.extract(sample_resume_text)
    assert isinstance(resume, JSONResume)
    handle = resume.extract_github_username()
    assert handle == "octocat"


def test_agent_analyze_end_to_end(sample_resume_text):
    agent = ResumeAnalysisAgent()
    report = agent.analyze(
        input_source=sample_resume_text,
        role="software_engineering_intern",
        enrich_github=False,  # deterministic unit test
    )

    assert report is not None
    assert report.resume.basics.name == "Maya Lin"
    assert report.evaluation.role_name == "software_engineering_intern"
    assert 0.0 <= report.evaluation.normalized_score <= 100.0
    assert report.evaluation.recommendation in ["Strong Hire", "Hire", "Borderline", "Do Not Advance"]
    assert len(report.evaluation.category_scores) >= 3

    # Check evidence exists for all scored categories
    for cat_key, cat_score in report.evaluation.category_scores.items():
        assert cat_score.score <= cat_score.max
        assert len(cat_score.evidence) > 0


def test_agent_analyze_multiple_roles(sample_resume_text):
    agent = ResumeAnalysisAgent()
    for role_name in ["backend_engineer", "ai_ml_engineer"]:
        report = agent.analyze(
            input_source=sample_resume_text,
            role=role_name,
            enrich_github=False,
        )
        assert report.evaluation.role_name == role_name
        assert 0.0 <= report.evaluation.normalized_score <= 100.0


def test_format_report_markdown(sample_resume_text):
    agent = ResumeAnalysisAgent()
    report = agent.analyze(
        input_source=sample_resume_text,
        role="software_engineering_intern",
        enrich_github=False,
    )
    md = agent.format_report_markdown(report)
    assert "# 📄 Resume Evaluation Report: Maya Lin" in md
    assert "Final Normalized Score" in md
    assert "Score Breakdown" in md
