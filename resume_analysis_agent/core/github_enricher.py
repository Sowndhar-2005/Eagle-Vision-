"""
GitHub developer profile and repository signal enricher.
Fetches public repository metrics, star counts, languages, and top projects.
Includes graceful error handling and timeout protection.
"""

import logging
from typing import Optional
import httpx

from resume_analysis_agent.core.config import settings
from resume_analysis_agent.core.models import GitHubRepoSignal, GitHubSignal

logger = logging.getLogger(__name__)


class GitHubEnricher:
    """Enriches candidate evaluation with verified open source developer signals."""

    @classmethod
    def enrich(cls, username: str, token: Optional[str] = None) -> Optional[GitHubSignal]:
        """
        Fetch GitHub user profile and top repositories.

        Args:
            username: GitHub account handle.
            token: Optional GitHub Personal Access Token for higher rate limits.

        Returns:
            GitHubSignal object or None if user not found / rate-limited.
        """
        if not username:
            return None

        clean_username = username.strip().lstrip("@")
        auth_token = token or settings.GITHUB_TOKEN

        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Resume-Analysis-Agent/1.0",
        }
        if auth_token:
            headers["Authorization"] = f"token {auth_token}"

        try:
            with httpx.Client(timeout=settings.GITHUB_API_TIMEOUT) as client:
                # 1. Fetch user profile
                user_res = client.get(
                    f"https://api.github.com/users/{clean_username}",
                    headers=headers,
                )
                if user_res.status_code == 404:
                    logger.warning(f"GitHub user '{clean_username}' not found.")
                    return None
                elif user_res.status_code != 200:
                    logger.warning(
                        f"GitHub API returned status {user_res.status_code} for user '{clean_username}'."
                    )
                    return None

                user_data = user_res.json()

                # 2. Fetch repos
                repos_res = client.get(
                    f"https://api.github.com/users/{clean_username}/repos?sort=updated&per_page=30",
                    headers=headers,
                )
                repos_data = repos_res.json() if repos_res.status_code == 200 else []

                # Aggregate metrics
                languages = set()
                total_stars = 0
                repo_signals = []

                for repo in repos_data:
                    if not isinstance(repo, dict):
                        continue
                    stars = repo.get("stargazers_count", 0)
                    total_stars += stars
                    lang = repo.get("language")
                    if lang:
                        languages.add(lang)

                    repo_signals.append(
                        GitHubRepoSignal(
                            name=repo.get("name", "untitled"),
                            description=repo.get("description"),
                            stars=stars,
                            forks=repo.get("forks_count", 0),
                            language=lang,
                            is_fork=repo.get("fork", False),
                            url=repo.get("html_url", ""),
                        )
                    )

                # Sort repositories by stars, favoring non-fork original projects
                repo_signals.sort(
                    key=lambda r: (not r.is_fork, r.stars, r.forks),
                    reverse=True,
                )
                top_repos = repo_signals[: settings.MAX_GITHUB_REPOSITORIES]

                return GitHubSignal(
                    username=clean_username,
                    public_repos_count=user_data.get("public_repos", len(repos_data)),
                    total_stars=total_stars,
                    primary_languages=sorted(list(languages)),
                    top_repositories=top_repos,
                    bio=user_data.get("bio"),
                    followers=user_data.get("followers", 0),
                )

        except httpx.RequestError as e:
            logger.warning(f"Failed to connect to GitHub API for '{clean_username}': {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error during GitHub enrichment for '{clean_username}': {e}")
            return None
