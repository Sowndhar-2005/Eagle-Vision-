"""
Eagle Vision — LLM Provider Abstraction
Supports: Gemini, OpenAI, Deterministic Local Parser (fallback)
"""

import json
import re
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

from app.core.config import settings


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    def generate(
        self,
        system_prompt: str,
        user_message: str,
        response_schema: Optional[Any] = None,
    ) -> str:
        """Generate text from the LLM. Returns raw string output."""

    def generate_json(
        self,
        system_prompt: str,
        user_message: str,
        response_schema: Optional[Any] = None,
    ) -> Any:
        """Generate and parse JSON from the LLM with error handling."""
        raw = self.generate(system_prompt, user_message, response_schema)
        return self._parse_json(raw)

    @staticmethod
    def _parse_json(text: str) -> Any:
        """Robustly extract JSON from LLM output."""
        # Try direct parse
        text = text.strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # Strip markdown code fences
        text = re.sub(r"```(?:json)?\s*", "", text).strip().rstrip("```").strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # Try extracting first JSON object or array
        match = re.search(r"(\{[\s\S]*\}|\[[\s\S]*\])", text)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass

        raise ValueError(f"Could not parse JSON from LLM response: {text[:300]}")


class GeminiProvider(LLMProvider):
    """Google Gemini LLM provider (supports google-genai SDK or direct REST API)."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self._api_key = api_key or settings.GEMINI_API_KEY
        self._model = model or settings.GEMINI_MODEL or "gemini-2.5-flash"
        if not self._api_key:
            raise ValueError("GEMINI_API_KEY is not configured")

    def generate(
        self,
        system_prompt: str,
        user_message: str,
        response_schema: Optional[Any] = None,
    ) -> str:
        # Try google-genai SDK first
        try:
            from google import genai
            from google.genai import types as genai_types
            client = genai.Client(api_key=self._api_key)
            config_args: Dict[str, Any] = {"system_instruction": system_prompt}
            if response_schema:
                config_args["response_mime_type"] = "application/json"
            response = client.models.generate_content(
                model=self._model,
                contents=user_message,
                config=genai_types.GenerateContentConfig(**config_args),
            )
            return response.text or ""
        except Exception:
            # Fallback to direct Gemini REST API via httpx
            import httpx
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{self._model}:generateContent?key={self._api_key}"
            payload = {
                "system_instruction": {"parts": [{"text": system_prompt}]},
                "contents": [{"parts": [{"text": user_message}]}],
            }
            if response_schema:
                payload["generationConfig"] = {"response_mime_type": "application/json"}
            resp = httpx.post(url, json=payload, timeout=30.0)
            if resp.status_code != 200:
                raise RuntimeError(f"Gemini API Error {resp.status_code}: {resp.text}")
            data = resp.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]


class ClaudeProvider(LLMProvider):
    """Anthropic Claude LLM provider via official REST API."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self._api_key = api_key or settings.ANTHROPIC_API_KEY or settings.CLAUDE_API_KEY
        self._model = model or settings.CLAUDE_MODEL or "claude-3-5-sonnet-20241022"
        if not self._api_key:
            raise ValueError("ANTHROPIC_API_KEY / CLAUDE_API_KEY is not configured")

    def generate(
        self,
        system_prompt: str,
        user_message: str,
        response_schema: Optional[Any] = None,
    ) -> str:
        import httpx
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": self._api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        prompt_with_instructions = user_message
        if response_schema:
            prompt_with_instructions += "\n\nCRITICAL: You MUST respond ONLY with valid JSON matching the requested schema. Do not enclose in markdown blocks unless needed."

        payload = {
            "model": self._model,
            "max_tokens": 4096,
            "system": system_prompt,
            "messages": [{"role": "user", "content": prompt_with_instructions}],
        }
        resp = httpx.post(url, headers=headers, json=payload, timeout=35.0)
        if resp.status_code != 200:
            raise RuntimeError(f"Claude API Error {resp.status_code}: {resp.text}")
        data = resp.json()
        return data["content"][0]["text"]


class OpenAIProvider(LLMProvider):
    """OpenAI LLM provider (supports GPT-4o, GPT-4o-mini, etc.)."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None, base_url: Optional[str] = None):
        self._api_key = api_key or settings.OPENAI_API_KEY
        self._model = model or settings.OPENAI_MODEL or "gpt-4o-mini"
        self._base_url = base_url or settings.OPENAI_BASE_URL or "https://api.openai.com/v1"
        if not self._api_key:
            raise ValueError("OPENAI_API_KEY is not configured")

    def generate(
        self,
        system_prompt: str,
        user_message: str,
        response_schema: Optional[Any] = None,
    ) -> str:
        import httpx
        url = f"{self._base_url.rstrip('/')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ]
        payload: Dict[str, Any] = {
            "model": self._model,
            "messages": messages,
        }
        if response_schema:
            payload["response_format"] = {"type": "json_object"}

        resp = httpx.post(url, headers=headers, json=payload, timeout=30.0)
        if resp.status_code != 200:
            raise RuntimeError(f"OpenAI API Error {resp.status_code}: {resp.text}")
        data = resp.json()
        return data["choices"][0]["message"]["content"] or ""


class GroqProvider(LLMProvider):
    """Groq ultra-fast Llama 3 / Mixtral provider."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self._api_key = api_key or settings.GROQ_API_KEY
        self._model = model or settings.GROQ_MODEL or "llama-3.3-70b-versatile"
        if not self._api_key:
            raise ValueError("GROQ_API_KEY is not configured")

    def generate(
        self,
        system_prompt: str,
        user_message: str,
        response_schema: Optional[Any] = None,
    ) -> str:
        import httpx
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ]
        payload: Dict[str, Any] = {
            "model": self._model,
            "messages": messages,
        }
        if response_schema:
            payload["response_format"] = {"type": "json_object"}

        resp = httpx.post(url, headers=headers, json=payload, timeout=25.0)
        if resp.status_code != 200:
            raise RuntimeError(f"Groq API Error {resp.status_code}: {resp.text}")
        data = resp.json()
        return data["choices"][0]["message"]["content"] or ""


class DeepSeekProvider(LLMProvider):
    """DeepSeek LLM provider (V3 / R1)."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self._api_key = api_key or settings.DEEPSEEK_API_KEY
        self._model = model or settings.DEEPSEEK_MODEL or "deepseek-chat"
        if not self._api_key:
            raise ValueError("DEEPSEEK_API_KEY is not configured")

    def generate(
        self,
        system_prompt: str,
        user_message: str,
        response_schema: Optional[Any] = None,
    ) -> str:
        import httpx
        url = "https://api.deepseek.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ]
        payload: Dict[str, Any] = {
            "model": self._model,
            "messages": messages,
        }
        if response_schema:
            payload["response_format"] = {"type": "json_object"}

        resp = httpx.post(url, headers=headers, json=payload, timeout=30.0)
        if resp.status_code != 200:
            raise RuntimeError(f"DeepSeek API Error {resp.status_code}: {resp.text}")
        data = resp.json()
        return data["choices"][0]["message"]["content"] or ""


class OllamaProvider(LLMProvider):
    """Ollama local open-source LLM provider."""

    def __init__(self, base_url: Optional[str] = None, model: Optional[str] = None):
        self._base_url = (base_url or settings.OLLAMA_BASE_URL or "http://localhost:11434").rstrip("/")
        self._model = model or settings.OLLAMA_MODEL or "llama3"

    def generate(
        self,
        system_prompt: str,
        user_message: str,
        response_schema: Optional[Any] = None,
    ) -> str:
        import httpx
        url = f"{self._base_url}/api/chat"
        payload = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "stream": False,
        }
        if response_schema:
            payload["format"] = "json"

        resp = httpx.post(url, json=payload, timeout=60.0)
        if resp.status_code != 200:
            raise RuntimeError(f"Ollama API Error {resp.status_code}: {resp.text}")
        data = resp.json()
        return data["message"]["content"]


class DeterministicLocalProvider(LLMProvider):
    """
    Deterministic local NLP-based provider — no external API required.
    Uses rule-based extraction for requirement analysis and template-based
    explanation generation for demo/offline use.
    """

    # Canonical skill dictionary: variants → canonical name
    SKILL_ALIASES = {
        "python": "Python", "py": "Python", "python3": "Python", "python programming": "Python",
        "fastapi": "FastAPI", "fast api": "FastAPI",
        "django": "Django", "flask": "Flask",
        "postgresql": "PostgreSQL", "postgres": "PostgreSQL", "pg": "PostgreSQL",
        "mysql": "MySQL", "sqlite": "SQLite",
        "mongodb": "MongoDB", "mongo": "MongoDB",
        "react": "React", "reactjs": "React", "react.js": "React",
        "angular": "Angular", "angularjs": "Angular",
        "vue": "Vue.js", "vuejs": "Vue.js", "vue.js": "Vue.js",
        "typescript": "TypeScript", "ts": "TypeScript",
        "javascript": "JavaScript", "js": "JavaScript",
        "docker": "Docker", "dockerfile": "Docker",
        "kubernetes": "Kubernetes", "k8s": "Kubernetes",
        "aws": "AWS", "amazon web services": "AWS",
        "azure": "Azure", "microsoft azure": "Azure",
        "gcp": "GCP", "google cloud": "GCP",
        "machine learning": "Machine Learning", "ml": "Machine Learning",
        "deep learning": "Deep Learning", "dl": "Deep Learning",
        "tensorflow": "TensorFlow", "tf": "TensorFlow",
        "pytorch": "PyTorch", "torch": "PyTorch",
        "rest api": "REST API", "restful api": "REST API", "rest": "REST API",
        "graphql": "GraphQL",
        "git": "Git", "github": "Git", "gitlab": "Git",
        "ci/cd": "CI/CD", "cicd": "CI/CD",
        "redis": "Redis",
        "celery": "Celery",
        "kafka": "Apache Kafka",
        "elasticsearch": "Elasticsearch",
        "nginx": "Nginx",
        "linux": "Linux",
        "data analysis": "Data Analysis",
        "data science": "Data Science",
        "nlp": "NLP", "natural language processing": "NLP",
        "computer vision": "Computer Vision",
        "node.js": "Node.js", "nodejs": "Node.js", "node": "Node.js",
        "java": "Java", "spring": "Spring Boot", "spring boot": "Spring Boot",
        "sql": "SQL", "nosql": "NoSQL",
        "agile": "Agile", "scrum": "Scrum",
        "devops": "DevOps",
        "microservices": "Microservices",
        "api": "REST API",
        "tailwind": "Tailwind CSS", "tailwindcss": "Tailwind CSS",
        "html": "HTML", "css": "CSS",
        "pandas": "Pandas", "numpy": "NumPy", "scikit-learn": "Scikit-learn",
    }

    SKILL_NAMES = set(SKILL_ALIASES.keys())

    def generate(
        self,
        system_prompt: str,
        user_message: str,
        response_schema: Optional[Any] = None,
    ) -> str:
        """Route to the appropriate deterministic handler based on system prompt."""
        prompt_lower = system_prompt.lower()

        if "requirement" in prompt_lower and "analyst" in prompt_lower:
            return self._analyze_requirement(user_message)
        elif "match" in prompt_lower and "explanation" in prompt_lower:
            return self._generate_match_explanation(user_message)
        elif "learning" in prompt_lower or "recommend" in prompt_lower:
            return self._generate_learning_recs(user_message)
        else:
            return json.dumps({"message": "Deterministic provider processed request"})

    def _normalize_skill(self, raw: str) -> str:
        lower = raw.lower().strip()
        return self.SKILL_ALIASES.get(lower, raw.strip().title())

    def _extract_skills_from_text(self, text: str) -> list:
        """Extract skill names from natural language text."""
        text_lower = text.lower()
        found = []
        # Check for all known aliases
        for alias, canonical in self.SKILL_ALIASES.items():
            pattern = r'\b' + re.escape(alias) + r'\b'
            if re.search(pattern, text_lower):
                if canonical not in found:
                    found.append(canonical)
        return found

    def _extract_experience_years(self, text: str) -> float:
        """Extract minimum years of experience from text."""
        patterns = [
            r'(\d+)\+?\s*years?\s+of\s+experience',
            r'(\d+)\+?\s*years?\s+experience',
            r'at\s+least\s+(\d+)\s+years?',
            r'minimum\s+(\d+)\s+years?',
            r'(\d+)\+\s*yrs?',
        ]
        for pattern in patterns:
            m = re.search(pattern, text.lower())
            if m:
                return float(m.group(1))
        return 0.0

    def _classify_skill_importance(self, skill: str, text: str) -> tuple:
        """Determine if a skill is critical, high, or preferred."""
        text_lower = text.lower()
        skill_lower = skill.lower()

        # Look for skill near mandatory/required keywords
        mandatory_patterns = [
            rf'{re.escape(skill_lower)}.{{0,50}}(mandatory|required|must|critical)',
            rf'(mandatory|required|must|critical).{{0,50}}{re.escape(skill_lower)}',
        ]
        preferred_patterns = [
            rf'{re.escape(skill_lower)}.{{0,50}}(preferred|nice.to.have|bonus|optional)',
            rf'(preferred|nice.to.have|bonus|optional).{{0,50}}{re.escape(skill_lower)}',
        ]

        for p in mandatory_patterns:
            if re.search(p, text_lower):
                return "critical", "advanced"
        for p in preferred_patterns:
            if re.search(p, text_lower):
                return "preferred", "intermediate"

        return "high", "intermediate"

    def _analyze_requirement(self, user_message: str) -> str:
        """Deterministically parse a requirement description."""
        try:
            data = json.loads(user_message)
            description = data.get("description", "")
            project_name = data.get("project_name", "Project")
            duration = data.get("duration_months")
            headcount = data.get("headcount", 1)
        except (json.JSONDecodeError, TypeError):
            description = user_message
            project_name = "New Project"
            duration = None
            headcount = 1

        all_skills = self._extract_skills_from_text(description)
        exp_years = self._extract_experience_years(description)

        required_skills = []
        preferred_skills = []

        for skill in all_skills:
            importance, level = self._classify_skill_importance(skill, description)
            if importance == "preferred":
                preferred_skills.append(skill)
            else:
                required_skills.append({
                    "name": skill,
                    "level": level,
                    "importance": importance
                })

        # Default work mode detection
        work_mode = "hybrid"
        if "remote" in description.lower():
            work_mode = "remote"
        elif "onsite" in description.lower() or "on-site" in description.lower():
            work_mode = "onsite"

        # Extract responsibilities (sentences with action verbs)
        responsibilities = []
        action_verbs = ["develop", "build", "design", "implement", "maintain", "integrate",
                        "create", "manage", "support", "analyze", "optimize", "deploy"]
        for sentence in re.split(r'[.!?\n]', description):
            s = sentence.strip()
            if len(s) > 10 and any(v in s.lower() for v in action_verbs):
                responsibilities.append(s[:120])

        if not responsibilities:
            responsibilities = ["Contribute to project deliverables", "Collaborate with the team"]

        result = {
            "project_title": project_name,
            "roles": [{"title": "Specialist", "headcount": headcount}],
            "required_skills": required_skills,
            "preferred_skills": preferred_skills,
            "experience_years": exp_years,
            "responsibilities": responsibilities[:5],
            "constraints": {
                "duration_months": duration,
                "work_mode": work_mode,
                "location": None,
            }
        }
        return json.dumps(result)

    def _generate_match_explanation(self, user_message: str) -> str:
        """Generate a template-based match explanation."""
        try:
            data = json.loads(user_message)
        except (json.JSONDecodeError, TypeError):
            data = {}

        employee_name = data.get("employee_name", "The candidate")
        matched = data.get("matched_skills", [])
        gaps = data.get("skill_gaps", [])
        score = data.get("overall_score", 0)
        exp_required = data.get("experience_required", 0)
        emp_experience = data.get("employee_experience", 0)

        if score >= 85:
            opening = f"{employee_name} is a strong match for this role"
        elif score >= 70:
            opening = f"{employee_name} is a good match for this role"
        else:
            opening = f"{employee_name} is a partial match for this role"

        skills_part = ""
        if matched:
            skills_str = ", ".join(matched[:4])
            skills_part = f" with direct experience in {skills_str}."
        else:
            skills_part = "."

        exp_part = ""
        if emp_experience >= exp_required and exp_required > 0:
            exp_part = f" Their {emp_experience} years of experience meets the {exp_required}+ year requirement."
        elif emp_experience < exp_required and exp_required > 0:
            exp_part = f" They have {emp_experience} years of experience vs. the {exp_required}+ required."

        gap_part = ""
        if gaps:
            gap_str = ", ".join(gaps[:3])
            gap_part = f" Primary development area: {gap_str}."

        return f"{opening}{skills_part}{exp_part}{gap_part}"

    def _generate_learning_recs(self, user_message: str) -> str:
        """Generate template learning recommendations for skill gaps."""
        try:
            data = json.loads(user_message)
            gaps = data.get("skill_gaps", [])
        except (json.JSONDecodeError, TypeError):
            gaps = []

        COURSES = {
            "Docker": {
                "course_title": "Docker & Kubernetes: The Practical Guide",
                "provider": "Udemy",
                "duration_hours": 23,
                "level": "beginner",
                "reason": "Covers containerization fundamentals needed for modern backend deployment."
            },
            "Machine Learning": {
                "course_title": "Machine Learning Specialization",
                "provider": "Coursera (DeepLearning.AI)",
                "duration_hours": 40,
                "level": "intermediate",
                "reason": "Builds ML fundamentals required for AI platform work."
            },
            "Kubernetes": {
                "course_title": "Kubernetes for Developers",
                "provider": "Pluralsight",
                "duration_hours": 16,
                "level": "intermediate",
                "reason": "Essential for container orchestration in cloud environments."
            },
            "AWS": {
                "course_title": "AWS Certified Solutions Architect – Associate",
                "provider": "AWS Training",
                "duration_hours": 30,
                "level": "intermediate",
                "reason": "Provides cloud architecture knowledge for scalable systems."
            },
            "React": {
                "course_title": "React - The Complete Guide",
                "provider": "Udemy",
                "duration_hours": 48,
                "level": "intermediate",
                "reason": "Covers React fundamentals through advanced hooks and state management."
            },
            "TypeScript": {
                "course_title": "Understanding TypeScript",
                "provider": "Udemy",
                "duration_hours": 15,
                "level": "beginner",
                "reason": "Adds type safety skills to existing JavaScript knowledge."
            },
            "PostgreSQL": {
                "course_title": "The Complete SQL Bootcamp",
                "provider": "Udemy",
                "duration_hours": 9,
                "level": "beginner",
                "reason": "Builds relational database fundamentals and PostgreSQL-specific features."
            },
            "Redis": {
                "course_title": "Redis: The Complete Developer's Guide",
                "provider": "Udemy",
                "duration_hours": 18,
                "level": "intermediate",
                "reason": "Covers caching, pub/sub, and session management with Redis."
            },
            "FastAPI": {
                "course_title": "FastAPI Tutorial - Building APIs with Python",
                "provider": "YouTube / Official Docs",
                "duration_hours": 6,
                "level": "intermediate",
                "reason": "Official FastAPI documentation and community tutorials cover production patterns."
            },
            "NLP": {
                "course_title": "Natural Language Processing Specialization",
                "provider": "Coursera (DeepLearning.AI)",
                "duration_hours": 36,
                "level": "advanced",
                "reason": "Provides NLP fundamentals needed for AI text processing tasks."
            },
        }

        DEFAULT = lambda skill: {
            "course_title": f"{skill} Fundamentals",
            "provider": "Pluralsight",
            "duration_hours": 10,
            "level": "beginner",
            "reason": f"Builds foundational {skill} knowledge required for the project."
        }

        result = []
        for skill in gaps:
            rec = COURSES.get(skill, DEFAULT(skill))
            result.append({"skill": skill, **rec})

        return json.dumps(result)


def get_llm_provider(
    provider_name: Optional[str] = None,
    api_key: Optional[str] = None,
    model: Optional[str] = None,
    base_url: Optional[str] = None,
) -> LLMProvider:
    """
    Factory: returns the requested or configured LLM provider with fallback chain.
    Supports dynamic runtime overrides from UI or backend settings.
    """
    selected = (provider_name or settings.LLM_PROVIDER or "deterministic").lower().strip()

    # 1. Google Gemini
    if selected == "gemini":
        key = api_key or settings.GEMINI_API_KEY
        if key:
            try:
                return GeminiProvider(api_key=key, model=model or settings.GEMINI_MODEL)
            except Exception as e:
                print(f"[LLM] Gemini initialization failed: {e}. Falling back.")

    # 2. Anthropic Claude
    if selected in ("claude", "anthropic"):
        key = api_key or settings.ANTHROPIC_API_KEY or settings.CLAUDE_API_KEY
        if key:
            try:
                return ClaudeProvider(api_key=key, model=model or settings.CLAUDE_MODEL)
            except Exception as e:
                print(f"[LLM] Claude initialization failed: {e}. Falling back.")

    # 3. OpenAI
    if selected == "openai":
        key = api_key or settings.OPENAI_API_KEY
        if key:
            try:
                return OpenAIProvider(api_key=key, model=model or settings.OPENAI_MODEL, base_url=base_url)
            except Exception as e:
                print(f"[LLM] OpenAI initialization failed: {e}. Falling back.")

    # 4. Groq
    if selected == "groq":
        key = api_key or settings.GROQ_API_KEY
        if key:
            try:
                return GroqProvider(api_key=key, model=model or settings.GROQ_MODEL)
            except Exception as e:
                print(f"[LLM] Groq initialization failed: {e}. Falling back.")

    # 5. DeepSeek
    if selected == "deepseek":
        key = api_key or settings.DEEPSEEK_API_KEY
        if key:
            try:
                return DeepSeekProvider(api_key=key, model=model or settings.DEEPSEEK_MODEL)
            except Exception as e:
                print(f"[LLM] DeepSeek initialization failed: {e}. Falling back.")

    # 6. Ollama
    if selected == "ollama":
        try:
            return OllamaProvider(base_url=base_url or settings.OLLAMA_BASE_URL, model=model or settings.OLLAMA_MODEL)
        except Exception as e:
            print(f"[LLM] Ollama initialization failed: {e}. Falling back.")

    # Fallback: Deterministic local rules
    return DeterministicLocalProvider()
