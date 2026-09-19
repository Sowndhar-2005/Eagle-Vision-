"""
Eagle Vision — Embedding Service
Supports: SentenceTransformer and TF-IDF fallback
"""

import json
import math
import re
from abc import ABC, abstractmethod
from typing import List

from app.core.config import settings


class EmbeddingProvider(ABC):
    """Abstract base for embedding generation."""

    @abstractmethod
    def embed(self, text: str) -> List[float]:
        """Generate embedding vector for a text string."""

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts."""
        return [self.embed(t) for t in texts]

    @staticmethod
    def cosine_similarity(a: List[float], b: List[float]) -> float:
        """Compute cosine similarity between two vectors."""
        if not a or not b or len(a) != len(b):
            return 0.0
        dot = sum(x * y for x, y in zip(a, b))
        mag_a = math.sqrt(sum(x ** 2 for x in a))
        mag_b = math.sqrt(sum(x ** 2 for x in b))
        if mag_a == 0 or mag_b == 0:
            return 0.0
        return dot / (mag_a * mag_b)


class SentenceTransformerProvider(EmbeddingProvider):
    """Uses sentence-transformers for high-quality semantic embeddings."""

    def __init__(self):
        try:
            from sentence_transformers import SentenceTransformer
            model_name = settings.EMBEDDING_MODEL or "all-MiniLM-L6-v2"
            print(f"[Embedding] Loading SentenceTransformer: {model_name}")
            self._model = SentenceTransformer(model_name)
        except ImportError:
            raise ImportError("sentence-transformers package required")

    def embed(self, text: str) -> List[float]:
        embedding = self._model.encode(text, normalize_embeddings=True)
        return embedding.tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        embeddings = self._model.encode(texts, normalize_embeddings=True, batch_size=32)
        return [e.tolist() for e in embeddings]


class FallbackTFIDFProvider(EmbeddingProvider):
    """
    Fast, zero-dependency fallback embedding using term-frequency vectorization.
    No external model loading required. Produces normalized sparse-like vectors
    using a fixed 256-dim vocabulary space from a curated tech skill vocabulary.
    """

    # Extended vocabulary covering common tech skills
    VOCAB = [
        "python", "fastapi", "django", "flask", "java", "javascript", "typescript",
        "react", "angular", "vue", "node", "css", "html", "tailwind",
        "postgresql", "mysql", "sqlite", "mongodb", "redis", "elasticsearch",
        "docker", "kubernetes", "aws", "azure", "gcp", "linux",
        "machine learning", "deep learning", "tensorflow", "pytorch", "nlp",
        "rest api", "graphql", "microservices", "devops", "ci/cd", "git",
        "pandas", "numpy", "scikit", "data analysis", "data science",
        "backend", "frontend", "fullstack", "api", "database", "sql",
        "authentication", "security", "jwt", "oauth",
        "testing", "pytest", "unittest",
        "async", "asyncio", "celery", "kafka",
        "nginx", "apache", "cloud", "serverless",
        "agile", "scrum", "leadership", "communication", "problem solving",
        "architecture", "design patterns", "solid", "clean code",
        "experience", "years", "senior", "junior", "mid", "level",
        "develop", "build", "create", "implement", "maintain", "design",
        "integrate", "optimize", "deploy", "manage", "support",
        "project", "team", "collaboration", "mentor",
        "performance", "scalable", "reliable", "robust",
        "real-time", "streaming", "batch", "etl",
        "visualization", "dashboard", "reporting",
        "mobile", "ios", "android", "flutter", "react native",
        "c++", "c#", "rust", "go", "golang", "php", "ruby", "scala",
        "spark", "hadoop", "airflow", "dbt",
        "monitoring", "logging", "observability",
        "git", "github", "gitlab", "jenkins", "terraform",
        "r", "matlab", "julia",
        "blockchain", "smart contracts", "web3",
        "computer vision", "image processing", "opencv",
        "speech", "audio", "nlg", "nlu",
        "recommendation", "ranking", "search",
        "ab testing", "analytics", "bi",
    ]
    VOCAB_INDEX = {w: i for i, w in enumerate(VOCAB)}
    DIM = len(VOCAB)

    def embed(self, text: str) -> List[float]:
        text_lower = text.lower()
        vector = [0.0] * self.DIM

        for word, idx in self.VOCAB_INDEX.items():
            # Count occurrences using word boundary detection
            count = len(re.findall(r'\b' + re.escape(word) + r'\b', text_lower))
            if count > 0:
                # Apply log TF normalization
                vector[idx] = 1.0 + math.log(count)

        # L2 normalize
        magnitude = math.sqrt(sum(v ** 2 for v in vector))
        if magnitude > 0:
            vector = [v / magnitude for v in vector]

        return vector


def get_embedding_provider() -> EmbeddingProvider:
    """Factory: returns configured embedding provider with fallback."""
    provider_name = settings.EMBEDDING_PROVIDER.lower()

    if provider_name == "sentence_transformers":
        try:
            provider = SentenceTransformerProvider()
            print("[Embedding] Using SentenceTransformerProvider")
            return provider
        except Exception as e:
            print(f"[Embedding] SentenceTransformer failed: {e}. Using TF-IDF fallback.")

    print("[Embedding] Using FallbackTFIDFProvider")
    return FallbackTFIDFProvider()


# Singleton instance
_embedding_provider: EmbeddingProvider | None = None


def get_embedding_singleton() -> EmbeddingProvider:
    """Return singleton embedding provider (avoids repeated model loading)."""
    global _embedding_provider
    if _embedding_provider is None:
        _embedding_provider = get_embedding_provider()
    return _embedding_provider
