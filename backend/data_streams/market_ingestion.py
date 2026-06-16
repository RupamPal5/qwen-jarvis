from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from backend.consensus.tri_node_engine import TriNodeConsensusEngine
from backend.audio.bidirectional_audio import AudioNeuralMatrix
from backend.system.wsl2_bridge import WSL2SystemBridge
from backend.code_evolution.hot_patcher import DynamicCodePatcher

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
consensus_engine = TriNodeConsensusEngine()
audio_matrix = AudioNeuralMatrix()
wsl_bridge = WSL2SystemBridge()
code_patcher = DynamicCodePatcher()

@app.post("/api/consensus/execute")
async def execute_command(command: str):
    try:
        result = consensus_engine.execute_wsl_command(command)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/audio/transcribe")
async def transcribe_audio(audio_data: bytes):
    # Placeholder for audio transcription logic
    return {"transcription": "Transcribed text"}

@app.websocket("/api/market/stream")
async def market_stream(websocket: WebSocket):
    await websocket.accept()
    while True:
        try:
            data = await websocket.recv()
            # Placeholder for processing market data
            await websocket.send_text("Market data received")
        except websockets.exceptions.ConnectionClosed as e:
            break

@app.post("/api/system/wsl")
async def execute_wsl_command(command: str):
    try:
        result = wsl_bridge.execute_wsl_command(command)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/code/patch")
async def patch_code(patch_request: dict):
    try:
        new_code = await code_patcher.apply_hot_patch("example.py", patch_request["new_code"])
        return {"success": new_code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Example usage
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
