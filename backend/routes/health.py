from fastapi import APIRouter, HTTPException
import logging
from typing import Dict
import time

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/status")
async def health_status() -> Dict:
    """Get the overall health status of the system"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "message": "JARVIS V5.0 is operational"
    }

@router.get("/ping")
async def ping() -> Dict:
    """Simple ping endpoint for health checks"""
    return {
        "status": "ok",
        "timestamp": time.time(),
        "message": "pong"
    }
