"""
Eagle Vision — AI Integration Service
"""

from typing import List, Optional
from google import genai
from app.core.config import settings


class AIService:
    """Service wrapping Google Gemini GenAI SDK for embeddings and explanations."""

    def __init__(self):
        self._client: Optional[genai.Client] = None
        if settings.GEMINI_API_KEY:
            self._client = genai.Client(api_key=settings.GEMINI_API_KEY)

    async def get_embedding(self, text: str) -> List[float]:
        """Generate text embedding vector using text-embedding-004."""
        if not self._client:
            # Fallback zero-vector if no API key in development
            return [0.0] * 768
        result = self._client.models.embed_content(
            model=settings.EMBEDDING_MODEL,
            contents=text,
        )
        return result.embedding.values

    async def explain_match(
        self, candidate_profile: str, opportunity_spec: str
    ) -> str:
        """Generate plain-English explainable match justification using Gemini."""
        if not self._client:
            return "Match explanation generated based on overlapping core competencies and project history."
        response = self._client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=f"""You are an expert HR Talent Mobility Advisor. 
Candidate Profile: {candidate_profile}
Opportunity: {opportunity_spec}
Provide a clear, unbiased 2-3 sentence explanation of why this candidate is a strong fit and highlight any transferable skills."""
        )
        return response.text


ai_service = AIService()
