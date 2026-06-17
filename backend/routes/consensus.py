from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from core.consensus_v2 import get_consensus_engine

router = APIRouter()

class ConsensusRequest(BaseModel):
    input: str
    workspace_id: Optional[str] = None

router = APIRouter()
logger = logging.getLogger(__name__)

class ExecutionRequest(BaseModel):
    input: str
    workspace_id: Optional[str] = None

class PatchRequest(BaseModel):
    blocks: List[Dict[str, str]]
    dry_run: bool = False
    workspace_id: Optional[str] = None

@router.post("/execute")
async def execute_consensus(request: ConsensusRequest):
    """Execute the consensus process with dynamic model assignments"""
    try:
        consensus_engine = await get_consensus_engine()
        result = await consensus_engine.execute_consensus(
            request.input,
            request.workspace_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
