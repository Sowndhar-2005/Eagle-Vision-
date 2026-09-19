"""
Eagle Vision — Application Configuration
"""

import json
from typing import Any, List, Optional, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class ScoringWeights:
    """Configurable weights for the hybrid matching engine."""
    REQUIRED_SKILL: float = 0.45
    SEMANTIC_SIMILARITY: float = 0.25
    EXPERIENCE_FIT: float = 0.15
    PROFICIENCY_FIT: float = 0.10
    PREFERRED_SKILL: float = 0.05


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=True,
    )

    # App
    APP_NAME: str = "Eagle Vision"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Backend
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000

    # Database
    POSTGRES_USER: str = "eagle_vision"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "eagle_vision_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432

    # Database mode — set to "sqlite" to auto-fallback without PostgreSQL
    DB_MODE: str = "sqlite"  # "postgresql" or "sqlite"

    @property
    def DATABASE_URL(self) -> str:
        if self.DB_MODE == "sqlite":
            return "sqlite+aiosqlite:///./eagle_vision.db"
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return self.DATABASE_URL

    @property
    def DATABASE_URL_SYNC(self) -> str:
        if self.DB_MODE == "sqlite":
            return "sqlite:///./eagle_vision.db"
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    # Redis (optional — graceful skip if unavailable)
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    @property
    def REDIS_URL(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"

    # JWT
    JWT_SECRET_KEY: str = "eagle-vision-super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours for demo
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Token expire aliases used in security.py
    @property
    def ACCESS_TOKEN_EXPIRE_MINUTES(self) -> int:
        return self.JWT_ACCESS_TOKEN_EXPIRE_MINUTES

    @property
    def REFRESH_TOKEN_EXPIRE_DAYS(self) -> int:
        return self.JWT_REFRESH_TOKEN_EXPIRE_DAYS

    # AI / LLM
    LLM_PROVIDER: str = "deterministic"  # "gemini", "openai", "deterministic"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Embeddings
    EMBEDDING_PROVIDER: str = "fallback"  # "sentence_transformers" or "fallback"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 384

    # Matching engine weights (overridable via env)
    WEIGHT_REQUIRED_SKILL: float = 0.45
    WEIGHT_SEMANTIC: float = 0.25
    WEIGHT_EXPERIENCE: float = 0.15
    WEIGHT_PROFICIENCY: float = 0.10
    WEIGHT_PREFERRED_SKILL: float = 0.05

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return v


settings = Settings()
