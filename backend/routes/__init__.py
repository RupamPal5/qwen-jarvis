from fastapi import APIRouter
from . import consensus, sensory, terminal, workspace, health

router = APIRouter()

# Include all routers
router.include_router(consensus.router, prefix="/api/consensus", tags=["consensus"])
router.include_router(sensory.router, prefix="/api/sensory", tags=["sensory"])
router.include_router(terminal.router, prefix="/api/terminal", tags=["terminal"])
router.include_router(workspace.router, prefix="/api/workspace", tags=["workspace"])
router.include_router(health.router, prefix="/api/health", tags=["health"])
