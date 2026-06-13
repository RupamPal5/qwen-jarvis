import asyncio
import json
import psutil
import ollama
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow React (localhost:3000) to talk to Python (localhost:8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_real_telemetry():
    """Fetches REAL stats from your WSL2 machine."""
    cpu = psutil.cpu_percent(interval=0.1)
    ram = psutil.virtual_memory().percent
    # Simulate threat level for now (we will hook up eBPF later)
    return {
        "cpu": cpu,
        "ram": ram,
        "threat": "LOW",
        "active_window": "VS Code" 
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("🔌 UI CONNECTED TO JARVIS BRAIN!")
    
    try:
        while True:
            # 1. Push Real Telemetry to UI every 2 seconds
            telemetry = get_real_telemetry()
            await websocket.send_json({
                "type": "telemetry",
                "data": telemetry
            })
            
            # 2. Listen for Commands from UI
            try:
                # Wait for 1 second for a message, otherwise loop back to telemetry
                data = await asyncio.wait_for(websocket.receive_json(), timeout=1.0)
                
                if data.get("type") == "command":
                    user_text = data.get("text", "")
                    print(f" Received command: {user_text}")
                    
                    # Send "Thinking" status
                    await websocket.send_json({"type": "status", "status": "thinking"})
                    
                    # Actually ask Ollama!
                    response = ollama.chat(
                        model='qwen2.5:7b', 
                        messages=[{'role': 'user', 'content': user_text}]
                    )
                    ai_reply = response['message']['content']
                    
                    # Send the real AI response back
                    await websocket.send_json({
                        "type": "response",
                        "text": ai_reply
                    })
                    
            except asyncio.TimeoutError:
                pass # No command received, just keep sending telemetry
                
    except WebSocketDisconnect:
        print(" UI Disconnected.")

if __name__ == "__main__":
    import uvicorn
    print("🚀 JARVIS API SERVER STARTING ON PORT 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
