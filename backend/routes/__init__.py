from fastapi import APIRouter
from routes import consensus, models, sensory, terminal, workspace, health

router = APIRouter()

# Include all routers
router.include_router(models.router, prefix="/models", tags=["models"])
router.include_router(consensus.router, prefix="/consensus", tags=["consensus"])
router.include_router(sensory.router, prefix="/api/sensory", tags=["sensory"])
router.include_router(terminal.router, prefix="/api/terminal", tags=["terminal"])
router.include_router(workspace.router, prefix="/api/workspace", tags=["workspace"])
router.include_router(health.router, prefix="/api/health", tags=["health"])
