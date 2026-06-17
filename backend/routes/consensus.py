from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
import logging
from consensus.tri_node_engine import TriNodeConsensusEngine

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
async def execute_consensus(request: ExecutionRequest):
    """
    Main endpoint for the Tri-Node Consensus Engine execution.
    """
    try:
        # Node-Alpha: Generate payload
        payload = await TriNodeConsensusEngine.NodeAlpha_Architect.generate_payload(
            request.input,
            workspace_id=request.workspace_id
        )

        # Node-Beta: Audit payload
        is_safe = await TriNodeConsensusEngine.NodeBeta_SecOps.audit_payload(payload)

        if not is_safe:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Payload failed security audit"
            )

        # Human-in-the-loop: Require user authorization
        authorized = await TriNodeConsensusEngine.PermissionGate.require_user_authorization(
            action_type="execute_payload",
            description=f"Execute code modification: {request.input[:100]}...",
            workspace_id=request.workspace_id
        )

        if not authorized:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User authorization denied"
            )

        # Node-Gamma: Execute approved payload
        result = await TriNodeConsensusEngine.NodeGamma_Compiler.execute_approved_payload(
            payload,
            security_token="verified",
            workspace_id=request.workspace_id
        )

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": "success",
                "result": result
            }
        )

    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={"status": "error", "detail": e.detail}
        )
    except Exception as e:
        logger.error(f"Consensus execution error: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"status": "error", "detail": str(e)}
        )

@router.post("/patch")
async def apply_patch(request: Request):
    """
    Endpoint for applying search/replace patches to files.
    """
    try:
        data = await request.json()
        patch_request = PatchRequest(**data)

        result = await TriNodeConsensusEngine.SelfModifyingEngine.process_patch_request(
            patch_request,
            workspace_id=patch_request.workspace_id
        )

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=result
        )
    except Exception as e:
        logger.error(f"Patch application error: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"status": "error", "detail": str(e)}
        )
