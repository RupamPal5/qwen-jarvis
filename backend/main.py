from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict, Optional
import json
import asyncio

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
                # Process using tri-node architecture
                # For now, just echo back
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
                # Handle user's response to authorization request
                authorized = message.get("authorized", False)
                request_id = message.get("request_id")
                
                if authorized:
                    await manager.send_personal_message({
                        "type": "execution_started",
                        "request_id": request_id
                    }, client_id)
                    # Execute the action here
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
                    
    except WebSocketDisconnect:
        manager.disconnect(client_id)
