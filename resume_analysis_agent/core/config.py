"""
Configuration management for Resume Analysis Agent.
"""

from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class AgentSettings(BaseSettings):
    """Runtime configuration for Resume Analysis Agent."""

    # LLM Settings
    GEMINI_API_KEY: str = ""
    DEFAULT_MODEL: str = "gemini-2.5-flash"
    MODEL_TEMPERATURE: float = 0.2
    MODEL_TOP_P: float = 0.95

    # GitHub Enrichment Settings
    GITHUB_TOKEN: Optional[str] = None
    GITHUB_API_TIMEOUT: float = 8.0
    MAX_GITHUB_REPOSITORIES: int = 7

    # Microservice Settings
    AGENT_HOST: str = "0.0.0.0"
    AGENT_PORT: int = 8001
    DEBUG: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = AgentSettings()
