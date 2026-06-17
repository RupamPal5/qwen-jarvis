from fastapi import APIRouter, HTTPException
from typing import Dict, List, Optional
from models.registry import ModelEntry, get_model_registry
from core.role_manager import get_role_manager
from pydantic import BaseModel

router = APIRouter()

class ModelAssignmentRequest(BaseModel):
    role: str
    model_id: str

@router.get("/")
async def list_models() -> Dict[str, ModelEntry]:
    """List all available models"""
    registry = get_model_registry()
    return registry.models

@router.get("/active")
async def list_active_models() -> List[ModelEntry]:
    """List all active models"""
    registry = get_model_registry()
    return registry.get_active_models()

@router.get("/local")
async def list_local_models() -> List[ModelEntry]:
    """List all local models"""
    registry = get_model_registry()
    return registry.get_local_models()

@router.get("/cloud")
async def list_cloud_models() -> List[ModelEntry]:
    """List all cloud models"""
    registry = get_model_registry()
    return registry.get_cloud_models()

@router.get("/roles")
async def get_role_assignments() -> Dict[str, Optional[str]]:
    """Get current role assignments"""
    role_manager = get_role_manager()
    return role_manager.get_all_assignments()

@router.post("/assign")
async def assign_model_to_role(request: ModelAssignmentRequest) -> Dict:
    """Assign a model to a role"""
    role_manager = get_role_manager()
    success = role_manager.assign_role(request.role, request.model_id)

    if not success:
        raise HTTPException(status_code=400, detail="Failed to assign model to role")

    return {
        "status": "success",
        "role": request.role,
        "model_id": request.model_id
    }

@router.get("/status/{model_id}")
async def get_model_status(model_id: str) -> Dict:
    """Get status of a specific model"""
    # In a real implementation, this would come from the network manager
    # For now, we'll simulate with random statuses
    statuses = ['healthy', 'degraded', 'unhealthy']
    status = statuses[hash(model_id) % len(statuses)]

    return {
        "model_id": model_id,
        "status": status,
        "latency": round(0.1 + (hash(model_id) % 10) * 0.1, 2),
        "last_checked": "2023-11-15T12:00:00Z"
    }
