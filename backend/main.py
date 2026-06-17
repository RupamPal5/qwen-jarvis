import logging
import asyncio
import sys
import time
from typing import Dict, Optional, List, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import json
import re
import subprocess
from pathlib import Path
from models.registry import get_model_registry
from core.role_manager import get_role_manager
from core.consensus_v2 import get_consensus_engine
from core.network_manager import get_network_manager
from security.protocol import get_security_protocol
from routes import router as api_router
from pydantic import BaseModel
from datetime import datetime
import os
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/backend.log'),
        logging.StreamHandler()
    ]
)

app = FastAPI(
    title="JARVIS V5.0 Universal Multi-Model Orchestration System",
    description="Dynamic model assignment and orchestration system",
    version="5.0.0"
)

# Configure CORS - restrict to only the frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=86400,  # Cache preflight response for 24 hours
)

# Initialize core components
model_registry = get_model_registry()
role_manager = get_role_manager()
consensus_engine = None
network_manager = None
security_protocol = get_security_protocol()

# Set up encryption key fallback for development
if not os.getenv("ENCRYPTION_KEY"):
    logger.warning("ENCRYPTION_KEY not found in environment variables, using development key")
    # Use the key from .env file or a secure default
    os.environ["ENCRYPTION_KEY"] = os.getenv("ENCRYPTION_KEY", "bIbGOuWHrhF5nkj-cVjtuGvt3rsHHbNRmGmPjHr9HuM==")

# Ensure logs directory exists
os.makedirs("logs", exist_ok=True)

# Configure directories
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

LOGS_DIR = Path("logs")
LOGS_DIR.mkdir(exist_ok=True)

async def initialize_services() -> None:
    """Initialize all core services."""
    global consensus_engine, network_manager

    try:
        logger.info("Initializing core services...")

        # Initialize universal client first (connection pool)
        from gateway.universal_client import get_universal_client
        universal_client = await get_universal_client()
        logger.info("Universal client initialized with connection pool")

        # Initialize consensus engine
        consensus_engine = await get_consensus_engine()

        # Initialize network manager
        network_manager = await get_network_manager()

        # Load audit log
        security_protocol.load_audit_log()

        logger.info("Core services initialized successfully")

    except Exception as e:
        logger.critical(f"Failed to initialize core services: {str(e)}", exc_info=True)
        raise

# Configure request size limit
from fastapi.middleware import Middleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

# Add middleware for request size limiting
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1"]
)

# Configure request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests with structured logging."""
    from core.logger import get_logger_manager
    logger_manager = get_logger_manager()

    start_time = time.time()
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent")

    try:
        response = await call_next(request)
    except Exception as e:
        duration = time.time() - start_time
        logger_manager.log_api_request(
            endpoint=request.url.path,
            method=request.method,
            status_code=500,
            duration=duration,
            client_ip=client_ip,
            user_agent=user_agent
        )
        raise

    duration = time.time() - start_time
    logger_manager.log_api_request(
        endpoint=request.url.path,
        method=request.method,
        status_code=response.status_code,
        duration=duration,
        client_ip=client_ip,
        user_agent=user_agent
    )

    return response

# Configure request size limit and validation
@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    """Limit request body size to 1MB globally and validate requests."""
    # Limit request size
    if request.url.path.startswith("/api/"):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > 1_000_000:  # 1MB limit
            return JSONResponse(
                status_code=413,
                content={"detail": "Request body too large. Maximum size is 1MB."}
            )

    # Validate API requests
    if request.url.path.startswith("/api/") and request.method in ["POST", "PUT", "PATCH"]:
        try:
            from gateway.validator import get_request_validator
            validator = get_request_validator()

            # Get client IP for rate limiting
            client_ip = request.client.host if request.client else "unknown"

            # Check if this is a model-related request
            if "/api/models/" in request.url.path or "/api/consensus/" in request.url.path:
                # Parse request body
                body = await request.body()
                if body:
                    try:
                        data = json.loads(body)
                        # Sanitize input
                        sanitized_data = validator.sanitize_input(data)

                        # Validate based on endpoint
                        if "/api/models/assign" in request.url.path:
                            is_valid, error_msg = validator.validate_model_assignment_request(sanitized_data, client_ip)
                            if not is_valid:
                                return JSONResponse(
                                    status_code=400,
                                    content={"detail": error_msg}
                                )
                        elif "/api/consensus/execute" in request.url.path:
                            if not validator._validate_message_content(sanitized_data.get("input", "")):
                                return JSONResponse(
                                    status_code=400,
                                    content={"detail": "Input contains potentially dangerous patterns"}
                                )

                    except json.JSONDecodeError:
                        # If we can't parse the JSON, let the endpoint handle it
                        pass
        except Exception as e:
            logger.error(f"Request validation middleware error: {str(e)}")
            # Continue with the request even if validation fails

    return await call_next(request)

# Initialize async components
@app.on_event("startup")
async def startup_event():
    # Set up global error handling
    from core.error_handler import get_error_handler
    error_handler = get_error_handler()
    error_handler.setup_global_exception_handling()

    # Initialize logger manager
    from core.logger import get_logger_manager
    logger_manager = get_logger_manager()
    logger.info("Logger manager initialized")

    # Run preflight checks before starting services
    from core.preflight import run_preflight_checks
    preflight_passed = await run_preflight_checks()

    if not preflight_passed:
        logger.critical("Preflight checks failed. Shutting down...")
        # Give some time for the critical log message to be written
        await asyncio.sleep(2)
        sys.exit(1)

    await initialize_services()

    # Start health monitoring
    from core.health_monitor import get_health_monitor
    from core.logger import get_logger_manager
    import psutil
    import time
    health_monitor = await get_health_monitor()
    await health_monitor.start_monitoring()

class ConnectionManager:
    """Manages WebSocket connections and subscriptions."""

    def __init__(self):
        """Initialize the connection manager."""
        self.active_connections: Dict[str, WebSocket] = {}
        self.model_status_subscribers: Dict[str, List[str]] = {}
        self.connection_metrics: List[Dict[str, Any]] = []

    async def connect(self, websocket: WebSocket, client_id: str) -> None:
        """Accept a new WebSocket connection.

        Args:
            websocket: The WebSocket connection
            client_id: Unique identifier for the client
        """
        await websocket.accept()
        self.active_connections[client_id] = websocket
        self._record_connection_event(client_id, "connect")
        logger.info(f"Client connected: {client_id}")

    def disconnect(self, client_id: str) -> None:
        """Disconnect a client and clean up subscriptions.

        Args:
            client_id: Unique identifier for the client
        """
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            self._record_connection_event(client_id, "disconnect")
            logger.info(f"Client disconnected: {client_id}")

        # Remove from any model status subscriptions
        for model_id, subscribers in list(self.model_status_subscribers.items()):
            if client_id in subscribers:
                subscribers.remove(client_id)
                if not subscribers:
                    del self.model_status_subscribers[model_id]

    async def send_personal_message(self, message: dict, client_id: str) -> bool:
        """Send a message to a specific client.

        Args:
            message: The message to send
            client_id: Unique identifier for the client

        Returns:
            bool: True if message was sent successfully, False otherwise
        """
        if client_id not in self.active_connections:
            logger.warning(f"Attempted to send message to non-existent client: {client_id}")
            return False

        try:
            await self.active_connections[client_id].send_json(message)
            return True
        except Exception as e:
            logger.error(f"Failed to send message to client {client_id}: {str(e)}")
            self.disconnect(client_id)
            return False

    async def subscribe_to_model_status(self, model_id: str, client_id: str) -> None:
        """Subscribe a client to model status updates.

        Args:
            model_id: The model ID to subscribe to
            client_id: Unique identifier for the client
        """
        if model_id not in self.model_status_subscribers:
            self.model_status_subscribers[model_id] = []

        if client_id not in self.model_status_subscribers[model_id]:
            self.model_status_subscribers[model_id].append(client_id)
            logger.debug(f"Client {client_id} subscribed to model {model_id} status updates")

    async def unsubscribe_from_model_status(self, model_id: str, client_id: str) -> None:
        """Unsubscribe a client from model status updates.

        Args:
            model_id: The model ID to unsubscribe from
            client_id: Unique identifier for the client
        """
        if model_id in self.model_status_subscribers and client_id in self.model_status_subscribers[model_id]:
            self.model_status_subscribers[model_id].remove(client_id)
            logger.debug(f"Client {client_id} unsubscribed from model {model_id} status updates")
            if not self.model_status_subscribers[model_id]:
                del self.model_status_subscribers[model_id]

    async def broadcast_model_status(self, model_id: str, status: dict) -> int:
        """Broadcast model status to all subscribed clients.

        Args:
            model_id: The model ID
            status: The status information to broadcast

        Returns:
            int: Number of clients that received the message
        """
        if model_id not in self.model_status_subscribers:
            return 0

        message = {
            "type": "model_status_update",
            "model_id": model_id,
            "status": status,
            "timestamp": datetime.now().isoformat()
        }

        sent_count = 0
        for client_id in self.model_status_subscribers[model_id]:
            success = await self.send_personal_message(message, client_id)
            if success:
                sent_count += 1

        logger.debug(f"Broadcast model {model_id} status to {sent_count} clients")
        return sent_count

    async def broadcast_to_all(self, message: Dict[str, Any]) -> int:
        """Broadcast a message to all connected clients.

        Args:
            message: The message to broadcast

        Returns:
            int: Number of clients that received the message
        """
        message["timestamp"] = datetime.now().isoformat()
        sent_count = 0

        for client_id, websocket in list(self.active_connections.items()):
            success = await self.send_personal_message(message, client_id)
            if success:
                sent_count += 1

        logger.debug(f"Broadcast message to {sent_count} clients")
        return sent_count

    def _record_connection_event(self, client_id: str, event_type: str) -> None:
        """Record connection metrics.

        Args:
            client_id: Unique identifier for the client
            event_type: Type of event (connect/disconnect)
        """
        metric = {
            "client_id": client_id,
            "event_type": event_type,
            "timestamp": datetime.now().isoformat(),
            "active_connections": len(self.active_connections)
        }

        self.connection_metrics.append(metric)

        # Clean up old metrics
        if len(self.connection_metrics) > 1000:
            self.connection_metrics = self.connection_metrics[-1000:]

class ModelConfigRequest(BaseModel):
    """Request to configure the tri-node architecture models."""

    architect: str
    arbiter: str
    judge: str

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "architect": "qwen2.5-coder:7b",
                "arbiter": "gemini-2.5-flash",
                "judge": "llama-3.3-70b"
            }
        }

# Include API routes
app.include_router(api_router, prefix="/api")

@app.get("/api/models")
async def list_models():
    """List all available models"""
    return model_registry.models

@app.post("/api/config/apply")
async def apply_model_config(config: ModelConfigRequest):
    """Apply a new model configuration"""
    try:
        # Assign models to roles
        role_manager.assign_role("ARCHITECT", config.architect)
        role_manager.assign_role("ARBITER", config.arbiter)
        role_manager.assign_role("JUDGE", config.judge)

        # Validate the configuration
        if not role_manager.validate_assignments():
            raise HTTPException(status_code=400, detail="Invalid model assignments")

        return {
            "status": "success",
            "message": "Model configuration applied successfully",
            "config": {
                "ARCHITECT": config.architect,
                "ARBITER": config.arbiter,
                "JUDGE": config.judge
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)

            # Handle different message types
            message_type = message.get("type")

            if message_type == "process_request":
                await manager.send_personal_message({
                    "type": "processing_started",
                    "request_id": message.get("request_id")
                }, client_id)

                # Execute consensus process
                try:
                    result = await consensus_engine.execute_consensus(
                        message.get("input", ""),
                        message.get("workspace_id")
                    )

                    await manager.send_personal_message({
                        "type": "consensus_result",
                        "request_id": message.get("request_id"),
                        "result": result
                    }, client_id)
                except Exception as e:
                    await manager.send_personal_message({
                        "type": "consensus_error",
                        "request_id": message.get("request_id"),
                        "error": str(e)
                    }, client_id)

            elif message_type == "subscribe_model_status":
                model_id = message.get("model_id")
                if model_id:
                    await manager.subscribe_to_model_status(model_id, client_id)
                    status = network_manager.get_model_status(model_id)
                    if status:
                        await manager.send_personal_message({
                            "type": "model_status_update",
                            "model_id": model_id,
                            "status": status
                        }, client_id)

            elif message_type == "unsubscribe_model_status":
                model_id = message.get("model_id")
                if model_id:
                    await manager.unsubscribe_from_model_status(model_id, client_id)

    except WebSocketDisconnect:
        manager.disconnect(client_id)

@app.websocket("/ws/control-plane")
async def control_plane_websocket(websocket: WebSocket):
    """WebSocket endpoint for control plane real-time updates"""
    await websocket.accept()
    client_id = f"control-plane-{id(websocket)}"

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)

            # Handle control plane specific messages
            if message.get("type") == "subscribe_model_status":
                model_id = message.get("model_id")
                if model_id:
                    # Add to manager's subscription list
                    if model_id not in manager.model_status_subscribers:
                        manager.model_status_subscribers[model_id] = []
                    if client_id not in manager.model_status_subscribers[model_id]:
                        manager.model_status_subscribers[model_id].append(client_id)

                    # Send current status
                    status = network_manager.get_model_status(model_id)
                    if status:
                        await websocket.send_json({
                            "type": "model_status_update",
                            "model_id": model_id,
                            "status": status
                        })

    except WebSocketDisconnect:
        # Clean up subscriptions
        for model_id, subscribers in list(manager.model_status_subscribers.items()):
            if client_id in subscribers:
                subscribers.remove(client_id)
                if not subscribers:
                    del manager.model_status_subscribers[model_id]


class DiffEngine:
    @staticmethod
    def parse_diff(diff_text: str) -> List[dict]:
        """Parse a diff text into a list of file changes"""
        # Split the diff into file sections
        file_pattern = r'([^\n]+?)\n<<<<<<< SEARCH\n(.*?)\n=======\n(.*?)\n>>>>>>> REPLACE'
        matches = re.findall(file_pattern, diff_text, re.DOTALL)
        
        changes = []
        for match in matches:
            file_path, search_content, replace_content = match
            changes.append({
                'file_path': file_path.strip(),
                'search': search_content,
                'replace': replace_content
            })
        return changes

    @staticmethod
    def apply_diff(change: dict) -> bool:
        """Apply a single diff change to a file"""
        try:
            file_path = Path(change['file_path'])
            if not file_path.exists():
                return False
                
            # Read the current content
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Replace the search pattern with replace content
            if change['search'] in content:
                new_content = content.replace(change['search'], change['replace'])
                # Write the new content
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                return True
            else:
                return False
        except Exception:
            return False

    @staticmethod
    def validate_build() -> tuple[bool, str]:
        """Validate the build by running appropriate commands"""
        try:
            # Check if it's a Python project by looking for requirements.txt or pyproject.toml
            if Path('requirements.txt').exists() or Path('pyproject.toml').exists():
                # Run Python syntax check and tests
                result = subprocess.run(['python', '-m', 'py_compile', '.'], 
                                      capture_output=True, text=True, cwd='.')
                if result.returncode != 0:
                    return False, result.stderr
                
            # Add other build validations for different project types
            return True, "Build validation passed"
        except Exception as e:
            return False, str(e)



manager = ConnectionManager()



# Include API routes
app.include_router(api_router, prefix="/api")

manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)

            # Handle different message types
            message_type = message.get("type")

            if message_type == "process_request":
                await manager.send_personal_message({
                    "type": "processing_started",
                    "request_id": message.get("request_id")
                }, client_id)

                # Execute consensus process
                try:
                    result = await consensus_engine.execute_consensus(
                        message.get("input", ""),
                        message.get("workspace_id")
                    )

                    await manager.send_personal_message({
                        "type": "consensus_result",
                        "request_id": message.get("request_id"),
                        "result": result
                    }, client_id)
                except Exception as e:
                    await manager.send_personal_message({
                        "type": "consensus_error",
                        "request_id": message.get("request_id"),
                        "error": str(e)
                    }, client_id)

            elif message_type == "subscribe_model_status":
                model_id = message.get("model_id")
                if model_id:
                    await manager.subscribe_to_model_status(model_id, client_id)
                    status = network_manager.get_model_status(model_id)
                    if status:
                        await manager.send_personal_message({
                            "type": "model_status_update",
                            "model_id": model_id,
                            "status": status
                        }, client_id)

            elif message_type == "unsubscribe_model_status":
                model_id = message.get("model_id")
                if model_id:
                    await manager.unsubscribe_from_model_status(model_id, client_id)

    except WebSocketDisconnect:
        manager.disconnect(client_id)
