from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict
from core.consensus_v2 import get_consensus_engine
from gateway.validator import get_request_validator
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class ConsensusRequest(BaseModel):
    input: str
    workspace_id: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "input": "Create a new Python function to calculate factorial",
                "workspace_id": "workspace-123"
            }
        }

class ExecutionRequest(BaseModel):
    input: str
    workspace_id: Optional[str] = None

class PatchRequest(BaseModel):
    blocks: List[Dict[str, str]]
    dry_run: bool = False
    workspace_id: Optional[str] = None

@router.post("/execute")
async def execute_consensus(request: ConsensusRequest, request_obj: Request):
    """Execute the consensus process with dynamic model assignments"""
    try:
        # Validate the request
        validator = get_request_validator()
        client_ip = request_obj.client.host if request_obj.client else "unknown"

        if not validator.rate_limiter.check_rate_limit("consensus_execute", client_ip, "chat"):
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")

        # Validate input content
        if not validator._validate_message_content(request.input):
            raise HTTPException(status_code=400, detail="Input contains potentially dangerous patterns")

        consensus_engine = await get_consensus_engine()
        result = await consensus_engine.execute_consensus(
            request.input,
            request.workspace_id
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Consensus execution failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
