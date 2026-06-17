from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Dict, Optional, List
import json
import asyncio
import logging
from pathlib import Path
from models.registry import get_model_registry
from core.role_manager import get_role_manager
from core.consensus_v2 import get_consensus_engine
from core.network_manager import get_network_manager
from security.protocol import get_security_protocol
from routes import router as api_router

logger = logging.getLogger(__name__)

app = FastAPI(
    title="JARVIS V5.0 Universal Multi-Model Orchestration System",
    description="Dynamic model assignment and orchestration system",
    version="5.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize core components
model_registry = get_model_registry()
role_manager = get_role_manager()
consensus_engine = None
network_manager = None
security_protocol = get_security_protocol()

# Configure upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Initialize async components
@app.on_event("startup")
async def startup_event():
    global consensus_engine, network_manager
    consensus_engine = await get_consensus_engine()
    network_manager = await get_network_manager()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.model_status_subscribers: Dict[str, List[str]] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]

        # Remove from any model status subscriptions
        for model_id, subscribers in list(self.model_status_subscribers.items()):
            if client_id in subscribers:
                subscribers.remove(client_id)
                if not subscribers:
                    del self.model_status_subscribers[model_id]

    async def send_personal_message(self, message: dict, client_id: str):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_json(message)

    async def subscribe_to_model_status(self, model_id: str, client_id: str):
        if model_id not in self.model_status_subscribers:
            self.model_status_subscribers[model_id] = []

        if client_id not in self.model_status_subscribers[model_id]:
            self.model_status_subscribers[model_id].append(client_id)

    async def unsubscribe_from_model_status(self, model_id: str, client_id: str):
        if model_id in self.model_status_subscribers and client_id in self.model_status_subscribers[model_id]:
            self.model_status_subscribers[model_id].remove(client_id)
            if not self.model_status_subscribers[model_id]:
                del self.model_status_subscribers[model_id]

    async def broadcast_model_status(self, model_id: str, status: dict):
        if model_id in self.model_status_subscribers:
            for client_id in self.model_status_subscribers[model_id]:
                await self.send_personal_message({
                    "type": "model_status_update",
                    "model_id": model_id,
                    "status": status
                }, client_id)


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
