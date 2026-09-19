"""
Structured Resume Extractor.
Extracts normalized JSONResume objects from raw text using Gemini or deterministic heuristic parser.
"""

import json
import logging
import re
from typing import Optional

from resume_analysis_agent.core.config import settings
from resume_analysis_agent.core.models import (
    Basics,
    Education,
    JSONResume,
    Location,
    ProfileLink,
    Project,
    SkillItem,
    WorkExperience,
)
from resume_analysis_agent.core.prompts import EXTRACTION_SYSTEM_PROMPT

logger = logging.getLogger(__name__)


def clean_llm_json(response_text: str) -> str:
    """Extract and sanitize raw JSON payload from model response."""
    cleaned = response_text.strip()
    # Strip markdown code fencing if present
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return cleaned.strip()


class ResumeExtractor:
    """Extracts JSONResume data structure from markdown text."""

    @classmethod
    def extract(cls, markdown_text: str, api_key: Optional[str] = None, model: Optional[str] = None) -> JSONResume:
        """
        Extract structured resume data.

        Args:
            markdown_text: Raw markdown text of resume.
            api_key: Optional Gemini API key (defaults to settings.GEMINI_API_KEY).
            model: Optional model name (defaults to settings.DEFAULT_MODEL).

        Returns:
            Validated JSONResume object.
        """
        gemini_key = api_key or settings.GEMINI_API_KEY
        target_model = model or settings.DEFAULT_MODEL

        if gemini_key and gemini_key.strip():
            try:
                from google import genai
                client = genai.Client(api_key=gemini_key)
                prompt = f"{EXTRACTION_SYSTEM_PROMPT}\n\nRESUME CONTENT TO EXTRACT:\n{markdown_text[:15000]}"
                response = client.models.generate_content(
                    model=target_model,
                    contents=prompt,
                )
                if response and response.text:
                    clean_json = clean_llm_json(response.text)
                    parsed_dict = json.loads(clean_json)
                    return JSONResume.model_validate(parsed_dict)
            except Exception as e:
                logger.warning(f"LLM resume extraction failed or timed out ({e}). Falling back to heuristic extractor.")

        # Fallback to deterministic heuristic parser
        return cls._heuristic_fallback(markdown_text)

    @classmethod
    def _heuristic_fallback(cls, text: str) -> JSONResume:
        """
        Deterministic parser that extracts basic resume components
        using regex and heuristic section segmenting without requiring LLM calls.
        """
        basics = Basics()

        # 1. Extract Email
        email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
        if email_match:
            basics.email = email_match.group(0)

        # 2. Extract Phone
        phone_match = re.search(r"(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}", text)
        if phone_match:
            basics.phone = phone_match.group(0).strip()

        # 3. Extract Links & Profiles
        profiles = []
        # GitHub
        github_match = re.search(r"(?:https?://)?(?:www\.)?github\.com/([a-zA-Z0-9\-_]+)", text, re.I)
        if github_match:
            handle = github_match.group(1)
            profiles.append(ProfileLink(network="GitHub", username=handle, url=f"https://github.com/{handle}"))

        # LinkedIn
        linkedin_match = re.search(r"(?:https?://)?(?:www\.)?linkedin\.com/in/([a-zA-Z0-9\-_]+)", text, re.I)
        if linkedin_match:
            handle = linkedin_match.group(1)
            profiles.append(ProfileLink(network="LinkedIn", username=handle, url=f"https://linkedin.com/in/{handle}"))

        basics.profiles = profiles

        # 4. Extract Candidate Name (usually first line or heading)
        first_lines = [line.strip().replace("#", "").strip() for line in text.split("\n") if line.strip()]
        if first_lines:
            candidate_name = first_lines[0]
            # Avoid picking a generic header
            if len(candidate_name) < 40 and not any(kw in candidate_name.lower() for kw in ["resume", "cv", "curriculum", "page"]):
                basics.name = candidate_name

        # 5. Extract Skills Keywords
        skills_list = []
        skills_section = re.search(r"(?i)(?:skills|technologies|technical stack|competencies)[\s\S]*?(?=(?:\n\s*#{1,3}\s|\n\s*(?:education|experience|projects|work|certifications)|$))", text)
        if skills_section:
            skills_content = skills_section.group(0)
            # Find words/tokens
            keywords = re.findall(r"[A-Za-z0-9+#\.\-]+", skills_content)
            common_tech = {"python", "javascript", "typescript", "react", "fastapi", "docker", "aws", "postgresql", "sql", "git", "c++", "java", "node", "html", "css", "mongodb", "kubernetes", "redis", "linux"}
            found = [k for k in keywords if k.lower() in common_tech]
            if found:
                skills_list.append(SkillItem(name="Technical Skills", keywords=list(dict.fromkeys(found))))

        # 6. Extract Projects
        projects = []
        projects_section = re.search(r"(?i)(?:projects|personal projects|key projects)[\s\S]*?(?=(?:\n\s*#{1,3}\s|\n\s*(?:education|experience|work|skills)|$))", text)
        if projects_section:
            lines = projects_section.group(0).split("\n")
            for line in lines:
                line_clean = line.strip().lstrip("-*# ").strip()
                if line_clean and len(line_clean) > 5 and ":" in line_clean:
                    title, _, desc = line_clean.partition(":")
                    projects.append(Project(name=title.strip(), description=desc.strip()))

        return JSONResume(
            basics=basics,
            skills=skills_list,
            projects=projects[:5],
        )
