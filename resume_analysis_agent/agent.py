"""
Master ResumeAnalysisAgent SDK class.
Provides a unified, high-level API for resume ingestion, extraction, GitHub enrichment,
and fairness-constrained rubric evaluation.
"""

from pathlib import Path
from typing import List, Optional, Union

from resume_analysis_agent.core.config import settings
from resume_analysis_agent.core.evaluator import ResumeEvaluator
from resume_analysis_agent.core.extractor import ResumeExtractor
from resume_analysis_agent.core.github_enricher import GitHubEnricher
from resume_analysis_agent.core.models import (
    AnalysisReport,
    EvaluationResult,
    GitHubSignal,
    JSONResume,
    RoleRubric,
)
from resume_analysis_agent.core.parser import ResumeParser
from resume_analysis_agent.roles.manager import RoleManager


class ResumeAnalysisAgent:
    """
    Unified Resume Analysis & Candidate Evaluation Agent.

    Example:
        >>> from resume_analysis_agent import ResumeAnalysisAgent
        >>> agent = ResumeAnalysisAgent()
        >>> report = agent.analyze("candidate_resume.pdf", role="software_engineering_intern")
        >>> print(f"Score: {report.evaluation.normalized_score}/100")
        >>> print(f"Verdict: {report.evaluation.recommendation}")
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        github_token: Optional[str] = None,
    ):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = model or settings.DEFAULT_MODEL
        self.github_token = github_token or settings.GITHUB_TOKEN
        self.evaluator = ResumeEvaluator(api_key=self.api_key, model=self.model)

    def analyze(
        self,
        input_source: Union[str, Path, bytes],
        role: Union[str, RoleRubric] = "software_engineering_intern",
        enrich_github: bool = True,
        filename: str = "resume.pdf",
    ) -> AnalysisReport:
        """
        Run end-to-end resume ingestion, extraction, enrichment, and evaluation.

        Args:
            input_source: Path to PDF or text file, raw text string, or binary bytes.
            role: Name of role rubric (e.g. 'software_engineering_intern') or custom RoleRubric object.
            enrich_github: Whether to query GitHub for candidate public repository signals.
            filename: File name hint for bytes parsing.

        Returns:
            Comprehensive AnalysisReport containing structured resume, GitHub signals, and evaluation.
        """
        # 1. Parse document to markdown
        markdown_text = ResumeParser.parse(input_source, filename=filename)

        # 2. Extract structured JSONResume
        resume = ResumeExtractor.extract(
            markdown_text,
            api_key=self.api_key,
            model=self.model,
        )

        # 3. Optional GitHub developer signal enrichment
        github_signals: Optional[GitHubSignal] = None
        if enrich_github:
            github_user = resume.extract_github_username()
            if github_user:
                github_signals = GitHubEnricher.enrich(
                    github_user,
                    token=self.github_token,
                )

        # 4. Resolve RoleRubric
        if isinstance(role, str):
            rubric = RoleManager.get_role(role)
        elif isinstance(role, RoleRubric):
            rubric = role
        else:
            raise TypeError(f"Invalid role type: {type(role)}. Expected str or RoleRubric.")

        # 5. Evaluate against role rubric
        evaluation = self.evaluator.evaluate(
            resume=resume,
            role=rubric,
            github_signals=github_signals,
        )

        return AnalysisReport(
            resume=resume,
            github_signals=github_signals,
            evaluation=evaluation,
        )

    @staticmethod
    def list_roles() -> List[str]:
        """List all available role rubric names."""
        return RoleManager.list_roles()

    @staticmethod
    def register_role(rubric: RoleRubric) -> None:
        """Register a new custom role rubric at runtime."""
        RoleManager.register_role(rubric)

    @staticmethod
    def format_report_markdown(report: AnalysisReport) -> str:
        """Generate a clean, printable Markdown evaluation report."""
        eval_res = report.evaluation
        candidate = report.resume.basics.name or "Candidate"

        lines = [
            f"# 📄 Resume Evaluation Report: {candidate}",
            f"**Target Role**: {eval_res.position_title} (`{eval_res.role_name}`)",
            f"**Evaluation Timestamp**: {report.evaluated_at.strftime('%Y-%m-%d %H:%M:%S UTC')}",
            f"**Final Normalized Score**: **{eval_res.normalized_score}/100**",
            f"**Hiring Recommendation**: `{eval_res.recommendation}`",
            "",
            "---",
            "",
            "## 📊 Score Breakdown",
            "",
            "| Category | Score | Max | Evidence & Justification |",
            "|---|:---:|:---:|---|",
        ]

        for cat_key, cat_score in eval_res.category_scores.items():
            evidence_clean = cat_score.evidence.replace("|", "/")
            lines.append(
                f"| **{cat_score.label}** | `{cat_score.score}` | {cat_score.max} | {evidence_clean} |"
            )

        if eval_res.bonus_points > 0:
            lines.append(
                f"| ⭐ **Bonus Points** | `+{eval_res.bonus_points}` | - | {eval_res.bonus_evidence} |"
            )
        if eval_res.deductions > 0:
            lines.append(
                f"| ⚠️ **Deductions** | `-{eval_res.deductions}` | - | {eval_res.deduction_evidence} |"
            )

        lines.extend([
            "",
            "## 💡 Executive Rationale",
            eval_res.summary_rationale,
            "",
        ])

        if report.github_signals:
            gh = report.github_signals
            lines.extend([
                "## 🌐 Verified GitHub Developer Signals",
                f"- **Account**: [@{gh.username}](https://github.com/{gh.username})",
                f"- **Total Stars**: {gh.total_stars} ⭐ across {gh.public_repos_count} public repos",
                f"- **Primary Stack**: {', '.join(gh.primary_languages)}",
                "",
            ])

        return "\n".join(lines)
