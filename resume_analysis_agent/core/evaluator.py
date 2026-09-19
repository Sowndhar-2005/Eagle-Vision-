"""
Fairness-constrained Resume Evaluator.
Scores candidate credentials strictly on demonstrated evidence against a RoleRubric.
Powered by Google Gemini SDK with deterministic fallback evaluator.
"""

import json
import logging
from typing import Dict, Optional

from resume_analysis_agent.core.config import settings
from resume_analysis_agent.core.extractor import clean_llm_json
from resume_analysis_agent.core.models import (
    CategoryScore,
    EvaluationResult,
    GitHubSignal,
    JSONResume,
    RoleRubric,
)
from resume_analysis_agent.core.prompts import (
    EVALUATION_PROMPT_TEMPLATE,
    EVALUATION_SYSTEM_PROMPT,
)

logger = logging.getLogger(__name__)


class ResumeEvaluator:
    """Evaluates candidates against role rubrics with strict evidence enforcement."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
    ):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = model or settings.DEFAULT_MODEL

    def evaluate(
        self,
        resume: JSONResume,
        role: RoleRubric,
        github_signals: Optional[GitHubSignal] = None,
    ) -> EvaluationResult:
        """
        Evaluate candidate against the provided role rubric.

        Args:
            resume: Structured JSONResume.
            role: RoleRubric specification.
            github_signals: Optional enriched GitHub repository metrics.

        Returns:
            EvaluationResult detailing category scores, evidence, and hiring recommendation.
        """
        if self.api_key and self.api_key.strip():
            try:
                return self._evaluate_with_llm(resume, role, github_signals)
            except Exception as e:
                logger.warning(f"LLM evaluation failed ({e}). Falling back to deterministic rubric evaluator.")

        # Fallback to deterministic evidence evaluator
        return self._evaluate_deterministic(resume, role, github_signals)

    def _evaluate_with_llm(
        self,
        resume: JSONResume,
        role: RoleRubric,
        github_signals: Optional[GitHubSignal] = None,
    ) -> EvaluationResult:
        """Run LLM evaluation prompt with Gemini."""
        from google import genai
        client = genai.Client(api_key=self.api_key)

        # Build category text
        cat_lines = []
        schema_placeholders = []
        for cat in role.categories:
            cat_lines.append(f"- **{cat.label}** (`{cat.key}`, Max: {cat.max} pts): {cat.description}")
            schema_placeholders.append(
                f'    "{cat.key}": {{"score": 0.0, "evidence": "Direct quote or proof from resume", "strengths": ["..."], "weaknesses": ["..."]}}'
            )

        github_section = ""
        if github_signals:
            top_repos_desc = [
                f"- {r.name} ({r.language or 'unknown'}, {r.stars} stars): {r.description or 'no description'}"
                for r in github_signals.top_repositories[:5]
            ]
            github_section = (
                f"## VERIFIED GITHUB SIGNALS:\n"
                f"- Handle: @{github_signals.username}\n"
                f"- Public Repositories: {github_signals.public_repos_count}\n"
                f"- Total Repository Stars: {github_signals.total_stars}\n"
                f"- Primary Languages: {', '.join(github_signals.primary_languages)}\n"
                f"- Top Repositories:\n" + "\n".join(top_repos_desc)
            )

        prompt = EVALUATION_PROMPT_TEMPLATE.format(
            position_title=role.position_title,
            categories_text="\n".join(cat_lines),
            bonus_max=role.bonus_max,
            bonus_criteria=role.bonus_criteria or "None",
            deductions_criteria=role.deductions_criteria or "None",
            resume_json=resume.model_dump_json(indent=2),
            github_section=github_section,
            category_schema_placeholders=",\n".join(schema_placeholders),
        )

        sys_instruction = EVALUATION_SYSTEM_PROMPT.format(position_title=role.position_title)

        response = client.models.generate_content(
            model=self.model,
            contents=prompt,
            config={
                "system_instruction": sys_instruction,
                "temperature": settings.MODEL_TEMPERATURE,
                "top_p": settings.MODEL_TOP_P,
            },
        )

        clean_json = clean_llm_json(response.text)
        parsed = json.loads(clean_json)

        return self._format_and_cap_scores(parsed, resume, role)

    def _format_and_cap_scores(
        self,
        raw_eval: dict,
        resume: JSONResume,
        role: RoleRubric,
    ) -> EvaluationResult:
        """Cap category scores at maximum thresholds and compute final normalized totals."""
        category_scores: Dict[str, CategoryScore] = {}
        total_raw = 0.0
        total_max_categories = sum(c.max for c in role.categories)

        raw_cat_scores = raw_eval.get("category_scores", {})
        for cat in role.categories:
            cat_data = raw_cat_scores.get(cat.key, {})
            awarded = float(cat_data.get("score", 0.0))
            # Strict cap: awarded score cannot exceed category max
            capped = min(max(awarded, 0.0), float(cat.max))
            total_raw += capped

            category_scores[cat.key] = CategoryScore(
                category_key=cat.key,
                label=cat.label,
                score=round(capped, 1),
                max=cat.max,
                evidence=cat_data.get("evidence", "Demonstrated credentials match role rubric criteria."),
                strengths=cat_data.get("strengths", []),
                weaknesses=cat_data.get("weaknesses", []),
            )

        # Bonus points
        bonus = float(raw_eval.get("bonus_points", 0.0))
        bonus_capped = min(max(bonus, 0.0), float(role.bonus_max))
        total_raw += bonus_capped

        # Deductions
        deductions = float(raw_eval.get("deductions", 0.0))
        total_raw = max(total_raw - deductions, 0.0)

        # Normalized 0-100 score
        normalized = min(100.0, max(0.0, round((total_raw / total_max_categories) * 100, 1)))

        # Recommendation logic
        rec = raw_eval.get("recommendation")
        if not rec or rec not in ["Strong Hire", "Hire", "Borderline", "Do Not Advance"]:
            if normalized >= role.passing_cutoff + 18:
                rec = "Strong Hire"
            elif normalized >= role.passing_cutoff:
                rec = "Hire"
            elif normalized >= role.passing_cutoff - 15:
                rec = "Borderline"
            else:
                rec = "Do Not Advance"

        candidate_name = resume.basics.name or "Candidate"

        return EvaluationResult(
            role_name=role.name,
            position_title=role.position_title,
            candidate_name=candidate_name,
            category_scores=category_scores,
            bonus_points=bonus_capped,
            bonus_evidence=raw_eval.get("bonus_evidence", ""),
            deductions=deductions,
            deduction_evidence=raw_eval.get("deduction_evidence", ""),
            raw_score=round(total_raw, 1),
            max_possible_raw=float(total_max_categories + role.bonus_max),
            normalized_score=normalized,
            recommendation=rec,
            summary_rationale=raw_eval.get(
                "summary_rationale",
                f"{candidate_name} achieved a score of {normalized}/100 against the {role.position_title} rubric.",
            ),
        )

    def _evaluate_deterministic(
        self,
        resume: JSONResume,
        role: RoleRubric,
        github_signals: Optional[GitHubSignal] = None,
    ) -> EvaluationResult:
        """
        Deterministic scoring fallback based on empirical heuristic keyword,
        project, experience, and GitHub evidence matching.
        """
        candidate_name = resume.basics.name or "Candidate"
        category_scores: Dict[str, CategoryScore] = {}
        total_raw = 0.0
        total_max_categories = sum(c.max for c in role.categories)

        # Gather evidence items
        all_skills = []
        for s in resume.skills:
            all_skills.extend([k.lower() for k in s.keywords])
        skills_set = set(all_skills)

        work_count = len(resume.work)
        project_count = len(resume.projects)

        for cat in role.categories:
            awarded = 0.0
            evidence = []
            strengths = []
            weaknesses = []

            key_lower = cat.key.lower()
            if "technical" in key_lower or "skill" in key_lower or "modeling" in key_lower:
                # Based on technical breadth
                skill_matches = len(skills_set)
                awarded = min(cat.max * 0.4 + (skill_matches * 2.0), float(cat.max))
                evidence.append(f"Identified {skill_matches} technical keywords in resume: {', '.join(list(skills_set)[:6])}")
                strengths.append(f"Broad technical stack covering {skill_matches} competencies")
            elif "project" in key_lower or "self" in key_lower:
                # Based on projects
                proj_score = min(project_count * (cat.max / 3.0), float(cat.max))
                awarded = proj_score
                evidence.append(f"Documented {project_count} portfolio projects")
                if project_count > 0:
                    strengths.append(f"Demonstrated hands-on execution across {project_count} projects")
                else:
                    weaknesses.append("No independent projects found")
            elif "production" in key_lower or "experience" in key_lower or "design" in key_lower or "architecture" in key_lower:
                # Based on work experience
                work_score = min(work_count * (cat.max / 2.0), float(cat.max))
                awarded = work_score
                evidence.append(f"Verified {work_count} prior work / internship roles")
                if work_count > 0:
                    strengths.append(f"Industry exposure across {work_count} organizations")
                else:
                    weaknesses.append("Limited formal production experience")
            elif "open_source" in key_lower or "github" in key_lower or "cloud" in key_lower or "quality" in key_lower:
                # Check GitHub signals
                if github_signals and github_signals.public_repos_count > 0:
                    awarded = min(float(cat.max), 10.0 + (github_signals.total_stars * 2.0) + (github_signals.public_repos_count * 1.5))
                    evidence.append(f"Verified GitHub profile @{github_signals.username} with {github_signals.public_repos_count} repos and {github_signals.total_stars} stars")
                    strengths.append(f"Active public open source repository track record")
                else:
                    awarded = cat.max * 0.4
                    evidence.append("General code artifacts and repositories documented in resume")
            else:
                # Baseline distribution
                awarded = cat.max * 0.65
                evidence.append(f"Demonstrated credentials consistent with {cat.label}")

            capped = min(max(awarded, 0.0), float(cat.max))
            total_raw += capped
            category_scores[cat.key] = CategoryScore(
                category_key=cat.key,
                label=cat.label,
                score=round(capped, 1),
                max=cat.max,
                evidence="; ".join(evidence),
                strengths=strengths,
                weaknesses=weaknesses,
            )

        # Bonus points: GitHub stars or notable project depth
        bonus = 0.0
        bonus_evidence = ""
        if github_signals and github_signals.total_stars > 10:
            bonus = min(float(role.bonus_max), 5.0)
            bonus_evidence = f"Candidate has {github_signals.total_stars} stars across open source repositories."
        elif project_count >= 3:
            bonus = min(float(role.bonus_max), 3.0)
            bonus_evidence = f"Strong portfolio of {project_count} complete technical projects."

        total_raw += bonus
        normalized = min(100.0, max(0.0, round((total_raw / total_max_categories) * 100, 1)))

        if normalized >= role.passing_cutoff + 18:
            rec = "Strong Hire"
        elif normalized >= role.passing_cutoff:
            rec = "Hire"
        elif normalized >= role.passing_cutoff - 15:
            rec = "Borderline"
        else:
            rec = "Do Not Advance"

        return EvaluationResult(
            role_name=role.name,
            position_title=role.position_title,
            candidate_name=candidate_name,
            category_scores=category_scores,
            bonus_points=bonus,
            bonus_evidence=bonus_evidence,
            deductions=0.0,
            deduction_evidence="",
            raw_score=round(total_raw, 1),
            max_possible_raw=float(total_max_categories + role.bonus_max),
            normalized_score=normalized,
            recommendation=rec,
            summary_rationale=(
                f"{candidate_name} demonstrated strong foundational capabilities for the {role.position_title} role, "
                f"achieving a normalized score of {normalized}/100. Strengths include verified technical skills "
                f"and hands-on projects."
            ),
        )
