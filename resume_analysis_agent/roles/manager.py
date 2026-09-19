"""
Role Manager and registry.
Loads built-in role rubrics and supports runtime registration of custom rubrics.
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Optional

from resume_analysis_agent.core.models import RoleRubric

logger = logging.getLogger(__name__)

ROLES_DIR = Path(__file__).parent


class RoleManager:
    """Manages role rubrics for candidate evaluation."""

    _custom_roles: Dict[str, RoleRubric] = {}

    @classmethod
    def list_roles(cls) -> List[str]:
        """Return all available built-in and dynamically registered role keys."""
        roles = set(cls._custom_roles.keys())
        if ROLES_DIR.is_dir():
            for p in ROLES_DIR.iterdir():
                if p.is_dir() and (p / "role.json").is_file():
                    roles.add(p.name)
        return sorted(list(roles))

    @classmethod
    def get_role(cls, role_name: str) -> RoleRubric:
        """
        Retrieve a role rubric by key.

        Args:
            role_name: Name key of role (e.g., 'software_engineering_intern')

        Returns:
            Validated RoleRubric object.

        Raises:
            KeyError: If role rubric is not found.
        """
        # Check custom registered roles first
        if role_name in cls._custom_roles:
            return cls._custom_roles[role_name]

        # Check built-in roles
        role_path = ROLES_DIR / role_name / "role.json"
        if role_path.is_file():
            try:
                with open(role_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                return RoleRubric.model_validate(data)
            except Exception as e:
                raise ValueError(f"Failed to load role '{role_name}' from {role_path}: {e}")

        available = ", ".join(cls.list_roles())
        raise KeyError(
            f"Role '{role_name}' not found. Available roles: [{available}]"
        )

    @classmethod
    def register_role(cls, rubric: RoleRubric) -> None:
        """
        Register or override a role rubric dynamically at runtime.

        Args:
            rubric: Validated RoleRubric instance.
        """
        cls._custom_roles[rubric.name] = rubric
        logger.info(f"Registered custom role rubric: '{rubric.name}' ({rubric.position_title})")

    @classmethod
    def get_all_roles(cls) -> List[RoleRubric]:
        """Return all loaded RoleRubric objects."""
        rubrics = []
        for name in cls.list_roles():
            try:
                rubrics.append(cls.get_role(name))
            except Exception as e:
                logger.warning(f"Could not load role {name}: {e}")
        return rubrics
