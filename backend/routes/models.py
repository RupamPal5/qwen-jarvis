from fastapi import APIRouter, HTTPException
from typing import Dict, List, Optional
from models.registry import ModelEntry, get_model_registry
from core.role_manager import get_role_manager
from pydantic import BaseModel
import yaml
from pathlib import Path

router = APIRouter()

class ModelAssignmentRequest(BaseModel):
    role: str
    model_id: str

class PresetRequest(BaseModel):
    preset_name: str

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

@router.get("/presets")
async def list_presets() -> Dict:
    """List available presets"""
    try:
        presets_path = Path("config/presets.yaml")
        if not presets_path.exists():
            return {"presets": {}}

        with open(presets_path, 'r') as f:
            presets = yaml.safe_load(f) or {}

        return presets
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load presets: {str(e)}")

@router.post("/apply-preset")
async def apply_preset(request: PresetRequest) -> Dict:
    """Apply a preset configuration"""
    try:
        presets_path = Path("config/presets.yaml")
        if not presets_path.exists():
            raise HTTPException(status_code=404, detail="Presets file not found")

        with open(presets_path, 'r') as f:
            presets = yaml.safe_load(f) or {}

        preset = presets.get("presets", {}).get(request.preset_name)
        if not preset:
            raise HTTPException(status_code=404, detail="Preset not found")

        assignments = preset.get("assignments", {})
        if not assignments:
            raise HTTPException(status_code=400, detail="Preset has no assignments")

        role_manager = get_role_manager()

        # Apply each assignment
        for role, model_id in assignments.items():
            success = role_manager.assign_role(role, model_id)
            if not success:
                raise HTTPException(status_code=400, detail=f"Failed to assign {model_id} to {role}")

        return {
            "status": "success",
            "message": "Preset applied successfully",
            "preset": request.preset_name,
            "assignments": assignments
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to apply preset: {str(e)}")

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
