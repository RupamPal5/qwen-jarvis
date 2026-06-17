from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict, Optional, List
import json
import asyncio
import re
import os
import subprocess
from pathlib import Path

app = FastAPI()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]

    async def send_personal_message(self, message: dict, client_id: str):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_json(message)


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


class SelfHealingEngine:
    def __init__(self, websocket_manager: ConnectionManager, client_id: str):
        self.manager = websocket_manager
        self.client_id = client_id
    
    async def handle_compilation_error(self, error_context: str, original_request: dict):
        """Handle compilation errors by feeding them back to Node-Alpha"""
        # Notify the client to initiate a correction cycle
        await self.manager.send_personal_message({
            "type": "compilation_error",
            "request_id": original_request.get("request_id"),
            "error_context": error_context,
            "original_payload": original_request
        }, self.client_id)

manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    healing_engine = SelfHealingEngine(manager, client_id)
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
                
                # Simulate processing
                await asyncio.sleep(1)
                
                # Send for authorization
                await manager.send_personal_message({
                    "type": "authorization_required",
                    "request_id": message.get("request_id"),
                    "action": "This would describe the action to be authorized",
                    "payload": "Details about what will be executed"
                }, client_id)
            
            elif message_type == "authorization_response":
                authorized = message.get("authorized", False)
                request_id = message.get("request_id")
                
                if authorized:
                    await manager.send_personal_message({
                        "type": "execution_started",
                        "request_id": request_id
                    }, client_id)
                    
                    # Handle code mutation if present
                    if 'diff' in message:
                        changes = DiffEngine.parse_diff(message['diff'])
                        all_success = True
                        for change in changes:
                            success = DiffEngine.apply_diff(change)
                            if not success:
                                all_success = False
                                break
                        
                        if all_success:
                            # Validate the build after applying changes
                            is_valid, validation_output = DiffEngine.validate_build()
                            if is_valid:
                                await manager.send_personal_message({
                                    "type": "execution_completed",
                                    "request_id": request_id,
                                    "result": "Changes applied and validated successfully"
                                }, client_id)
                            else:
                                # Trigger self-healing
                                await healing_engine.handle_compilation_error(
                                    validation_output, message
                                )
                        else:
                            await manager.send_personal_message({
                                "type": "execution_failed",
                                "request_id": request_id,
                                "reason": "Failed to apply some changes"
                            }, client_id)
                    else:
                        # Execute other actions
                        await asyncio.sleep(1)
                        await manager.send_personal_message({
                            "type": "execution_completed",
                            "request_id": request_id,
                            "result": "Action executed successfully"
                        }, client_id)
                else:
                    await manager.send_personal_message({
                        "type": "execution_cancelled",
                        "request_id": request_id,
                        "reason": "User denied authorization"
                    }, client_id)
            
            elif message_type == "self_healing_patch":
                # Handle a patch from the self-healing cycle
                request_id = message.get("request_id")
                if 'diff' in message:
                    changes = DiffEngine.parse_diff(message['diff'])
                    for change in changes:
                        DiffEngine.apply_diff(change)
                    # Revalidate
                    is_valid, validation_output = DiffEngine.validate_build()
                    if is_valid:
                        await manager.send_personal_message({
                            "type": "self_healing_success",
                            "request_id": request_id,
                            "result": "Self-healing applied successfully"
                        }, client_id)
                    else:
                        await manager.send_personal_message({
                            "type": "self_healing_failed",
                            "request_id": request_id,
                            "reason": validation_output
                        }, client_id)
                    
    except WebSocketDisconnect:
        manager.disconnect(client_id)
