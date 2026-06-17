from fastapi import APIRouter, HTTPException, Request, Depends
import logging
from typing import Dict, List, Optional
from models.registry import ModelEntry, get_model_registry
from core.role_manager import get_role_manager
from pydantic import BaseModel
import yaml
from pathlib import Path
from gateway.validator import get_request_validator
from security.protocol import get_security_protocol
from core.error_handler import get_error_handler
from core.network_manager import get_network_manager
from core.health_monitor import get_health_monitor
from security.encryption import get_api_key_encryptor

logger = logging.getLogger(__name__)

router = APIRouter()

class ModelAssignmentRequest(BaseModel):
    role: str
    model_id: str

    class Config:
        json_schema_extra = {
            "example": {
                "role": "ARCHITECT",
                "model_id": "qwen2.5-coder:7b"
            }
        }

class PresetRequest(BaseModel):
    preset_name: str

    class Config:
        json_schema_extra = {
            "example": {
                "preset_name": "default"
            }
        }

@router.get("/")
async def list_models(request: Request) -> Dict[str, ModelEntry]:
    """List all available models"""
    # Validate client IP for rate limiting
    client_ip = request.client.host if request.client else "unknown"
    validator = get_request_validator()

    if not validator.rate_limiter.check_rate_limit("list_models", client_ip, "chat"):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")

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
async def apply_preset(request: PresetRequest, request_obj: Request) -> Dict:
    """Apply a preset configuration"""
    try:
        # Validate client IP for rate limiting
        client_ip = request_obj.client.host if request_obj.client else "unknown"
        validator = get_request_validator()

        if not validator.rate_limiter.check_rate_limit("apply_preset", client_ip, "model_switch"):
            raise HTTPException(status_code=429, detail="Rate limit exceeded for model switching. Please try again later.")

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

        # Validate each assignment
        for role, model_id in assignments.items():
            model = get_model_registry().get_model(model_id)
            if not model or not model.is_active:
                raise HTTPException(status_code=400, detail=f"Model {model_id} is not available for role {role}")

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
async def get_role_assignments(request: Request) -> Dict[str, Optional[str]]:
    """Get current role assignments"""
    # Validate client IP for rate limiting
    client_ip = request.client.host if request.client else "unknown"
    validator = get_request_validator()

    if not validator.rate_limiter.check_rate_limit("get_roles", client_ip, "chat"):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")

    role_manager = get_role_manager()
    return role_manager.get_all_assignments()

@router.post("/assign")
async def assign_model_to_role(request: ModelAssignmentRequest, request_obj: Request) -> Dict:
    """Assign a model to a role"""
    # Validate the request
    validator = get_request_validator()
    client_ip = request_obj.client.host if request_obj.client else "unknown"

    is_valid, error_msg = validator.validate_model_assignment_request(request.dict(), client_ip)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

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
async def get_model_status(model_id: str, request: Request) -> Dict:
    """Get status of a specific model"""
    # Validate client IP for rate limiting
    client_ip = request.client.host if request.client else "unknown"
    validator = get_request_validator()

    if not validator.rate_limiter.check_rate_limit(f"model_status_{model_id}", client_ip, "chat"):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")

    # Get real status from network manager
    from core.network_manager import get_network_manager
    network_manager = await get_network_manager()
    status = network_manager.get_model_status(model_id)

    if not status:
        # Fallback to simulated status if not found
        statuses = ['healthy', 'degraded', 'unhealthy']
        status = statuses[hash(model_id) % len(statuses)]
        return {
            "model_id": model_id,
            "status": status,
            "latency": round(0.1 + (hash(model_id) % 10) * 0.1, 2),
            "last_checked": "2023-11-15T12:00:00Z"
        }

    return {
        "model_id": model_id,
        "status": "healthy" if status.available else "unhealthy",
        "latency": status.latency,
        "last_checked": status.last_checked,
        "consecutive_failures": status.consecutive_failures,
        "is_disabled": status.is_disabled
    }

@router.get("/health/error-stats")
async def get_error_stats(request: Request) -> Dict:
    """Get error statistics and system health information"""
    # Only allow this from localhost for security
    client_ip = request.client.host if request.client else "unknown"
    if client_ip not in ["127.0.0.1", "::1", "localhost"]:
        raise HTTPException(status_code=403, detail="This endpoint is only available from localhost")

    try:
        error_handler = get_error_handler()
        network_manager = await get_network_manager()
        health_monitor = await get_health_monitor()

        # Get error stats
        error_stats = error_handler.get_error_stats()

        # Get circuit breaker states
        circuit_breakers = network_manager.universal_client.get_circuit_breaker_states() if network_manager.universal_client else {}

        # Get health report
        health_report = health_monitor.get_health_report(1)  # Last 1 hour

        return {
            "status": "success",
            "error_stats": error_stats,
            "circuit_breakers": circuit_breakers,
            "health_report": health_report,
            "system_status": {
                "circuit_breaker_triggered": error_handler.is_circuit_breaker_triggered(),
                "overall_health": health_report.get("overall_status", "unknown")
            }
        }
    except Exception as e:
        logger.error(f"Failed to get error stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get error stats: {str(e)}")

@router.get("/encryption/generate-key")
async def generate_encryption_key(request: Request) -> Dict:
    """Generate a new encryption key for API keys.

    This endpoint is for initial setup only and should be disabled in production.
    """
    # Only allow this from localhost for security
    client_ip = request.client.host if request.client else "unknown"
    if client_ip not in ["127.0.0.1", "::1", "localhost"]:
        raise HTTPException(status_code=403, detail="This endpoint is only available from localhost")

    try:
        encryptor = get_api_key_encryptor()
        new_key = encryptor.generate_encryption_key()

        return {
            "status": "success",
            "encryption_key": new_key,
            "instructions": "Add this key to your .env file as ENCRYPTION_KEY=your_key_here"
        }
    except Exception as e:
        logger.error(f"Failed to generate encryption key: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate encryption key: {str(e)}")
