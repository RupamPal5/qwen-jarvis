import logging
from typing import Dict, Optional
from models.registry import ModelEntry, get_model_registry
from pydantic import BaseModel
from core.logger import get_logger_manager

logger = logging.getLogger(__name__)

class RoleAssignment(BaseModel):
    role: str
    model_id: str
    is_active: bool = True

class RoleManager:
    def __init__(self):
        self.roles = {
            "ARCHITECT": None,
            "ARBITER": None,
            "JUDGE": None
        }
        self.model_registry = get_model_registry()

    def assign_role(self, role: str, model_id: str) -> bool:
        """Assign a model to a role"""
        previous_model = self.roles.get(role)

        if role not in self.roles:
            logger.error(f"Invalid role: {role}")
            return False

        model = self.model_registry.get_model(model_id)
        if not model:
            logger.error(f"Model {model_id} not found in registry")
            return False

        if not model.is_active:
            logger.error(f"Model {model_id} is not active")
            return False

        self.roles[role] = model_id
        logger.info(f"Assigned {model_id} to role {role}")

        # Log the assignment event
        logger_manager = get_logger_manager()
        logger_manager.log_model_assignment(role, model_id, previous_model)

        return True

    def get_assigned_model(self, role: str) -> Optional[ModelEntry]:
        """Get the model assigned to a role"""
        if role not in self.roles:
            logger.error(f"Invalid role: {role}")
            return None

        model_id = self.roles.get(role)
        if not model_id:
            logger.error(f"No model assigned to role {role}")
            return None

        return self.model_registry.get_model(model_id)

    def get_all_assignments(self) -> Dict[str, Optional[str]]:
        """Get all current role assignments"""
        return self.roles

    def clear_role(self, role: str) -> bool:
        """Clear a role assignment"""
        if role not in self.roles:
            logger.error(f"Invalid role: {role}")
            return False

        self.roles[role] = None
        logger.info(f"Cleared role {role}")
        return True

    def validate_assignments(self) -> bool:
        """Validate that all required roles have models assigned"""
        for role in self.roles:
            if not self.roles[role]:
                logger.error(f"Role {role} has no model assigned")
                return False

            model = self.model_registry.get_model(self.roles[role])
            if not model or not model.is_active:
                logger.error(f"Assigned model for role {role} is invalid or inactive")
                return False

        return True

# Global role manager instance
_role_manager = RoleManager()

def get_role_manager() -> RoleManager:
    return _role_manager
