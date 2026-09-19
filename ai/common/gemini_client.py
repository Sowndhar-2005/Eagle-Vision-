"""
Eagle Vision — Common Gemini GenAI Helper
"""

import os
from typing import List, Optional
from google import genai


class GeminiAIClient:
    """Standardized wrapper around Google GenAI SDK for AI engine tasks."""

    def __init__(self, api_key: Optional[str] = None):
        key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.client = genai.Client(api_key=key) if key else None

    def embed_text(self, text: str, model: str = "text-embedding-004") -> List[float]:
        if not self.client:
            return [0.0] * 768
        res = self.client.models.embed_content(model=model, contents=text)
        return res.embedding.values

    def generate_text(self, prompt: str, model: str = "gemini-2.5-flash") -> str:
        if not self.client:
            return ""
        res = self.client.models.generate_content(model=model, contents=prompt)
        return res.text or ""
