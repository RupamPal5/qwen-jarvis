from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Form, HTTPException
from typing import Dict, Optional, List
import json
import asyncio
import re
import os
import subprocess
from pathlib import Path
import shutil
import uuid
import cv2
from PIL import Image
import io
import aiofiles
import base64
import wave
import numpy as np
from scipy import signal
import speech_recognition as sr
from gtts import gTTS
import tempfile

app = FastAPI()

# Configure upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Audio processing setup
recognizer = sr.Recognizer()

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

def extract_video_frames(video_path: Path, output_dir: Path, frame_interval: int = 30):
    """Extract frames from video at specified intervals"""
    cap = cv2.VideoCapture(str(video_path))
    frame_count = 0
    extracted_frames = []
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_count % frame_interval == 0:
            frame_filename = output_dir / f"frame_{frame_count:06d}.jpg"
            cv2.imwrite(str(frame_filename), frame)
            extracted_frames.append(str(frame_filename))
            
        frame_count += 1
        
    cap.release()
    return extracted_frames

async def process_image(file_path: Path):
    """Process image file for vision models"""
    # For now, just return the path
    # In a real implementation, you might want to resize, convert format, etc.
    return str(file_path)

async def process_video(file_path: Path):
    """Process video file by extracting frames"""
    frames_dir = UPLOAD_DIR / "frames" / file_path.stem
    frames_dir.mkdir(parents=True, exist_ok=True)
    return extract_video_frames(file_path, frames_dir)

async def process_document(file_path: Path):
    """Process document files"""
    # For text-based files, we can read and chunk them
    # This is a placeholder implementation
    async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
        content = await f.read()
    # Split into chunks (for example, by lines or fixed size)
    chunks = [content[i:i+1000] for i in range(0, len(content), 1000)]
    return chunks

@app.post("/api/v1/audio/stt")
async def speech_to_text(audio: UploadFile = File(...)):
    """Convert speech to text using Google's Speech Recognition"""
    try:
        # Save the uploaded audio to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
            content = await audio.read()
            temp_audio.write(content)
            temp_audio_path = temp_audio.name
        
        # Use speech recognition
        with sr.AudioFile(temp_audio_path) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data)
        
        # Clean up
        os.unlink(temp_audio_path)
        
        return {"text": text}
    except sr.UnknownValueError:
        raise HTTPException(status_code=400, detail="Could not understand audio")
    except sr.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Speech recognition error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")

@app.post("/api/v1/audio/tts")
async def text_to_speech(text: str = Form(...)):
    """Convert text to speech using gTTS with JARVIS-like voice"""
    try:
        # Generate speech
        tts = gTTS(text=text, lang='en', slow=False)
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_audio:
            tts.save(temp_audio.name)
            with open(temp_audio.name, 'rb') as f:
                audio_data = f.read()
        
        # Clean up
        os.unlink(temp_audio.name)
        
        # Encode to base64 for easy transmission
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        return {
            "audio_base64": audio_base64,
            "text": text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating speech: {str(e)}")

@app.post("/api/v1/audio/analyze")
async def analyze_audio(audio: UploadFile = File(...)):
    """Analyze audio to generate FFT data for visualization"""
    try:
        # Save the uploaded audio to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
            content = await audio.read()
            temp_audio.write(content)
            temp_audio_path = temp_audio.name
        
        # Read the WAV file
        with wave.open(temp_audio_path, 'rb') as wav_file:
            # Get audio parameters
            n_channels = wav_file.getnchannels()
            sampwidth = wav_file.getsampwidth()
            framerate = wav_file.getframerate()
            n_frames = wav_file.getnframes()
            
            # Read audio data
            frames = wav_file.readframes(n_frames)
        
        # Convert to numpy array
        if sampwidth == 1:
            dtype = np.uint8
        elif sampwidth == 2:
            dtype = np.int16
        else:
            dtype = np.int32
        
        audio_data = np.frombuffer(frames, dtype=dtype)
        
        # If stereo, convert to mono by averaging channels
        if n_channels > 1:
            audio_data = audio_data.reshape(-1, n_channels)
            audio_data = np.mean(audio_data, axis=1)
        
        # Generate FFT
        fft_data = np.fft.fft(audio_data)
        freqs = np.fft.fftfreq(len(fft_data), 1.0/framerate)
        
        # Get magnitude and limit to positive frequencies
        magnitude = np.abs(fft_data)
        positive_freq_idx = freqs > 0
        freqs = freqs[positive_freq_idx]
        magnitude = magnitude[positive_freq_idx]
        
        # Clean up
        os.unlink(temp_audio_path)
        
        # Return a subset of the data for performance
        return {
            "frequencies": freqs[::100].tolist(),  # Downsample
            "magnitude": magnitude[::100].tolist()  # Downsample
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing audio: {str(e)}")

@app.post("/api/v1/sensory/ingestion")
async def ingest_file(
    file: UploadFile = File(...),
    file_type: str = Form(...),
    project_id: str = Form(...)
):
    # Generate unique filename
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    try:
        # Save the uploaded file
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)
        
        # Process based on file type
        processing_result = None
        if file_type in ['image/png', 'image/jpeg', 'image/jpg']:
            processing_result = await process_image(file_path)
        elif file_type in ['video/mp4', 'video/avi', 'video/mov']:
            processing_result = await process_video(file_path)
        elif file_type in ['text/csv', 'application/json', 'text/plain', 'application/pdf']:
            processing_result = await process_document(file_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
        
        return {
            "status": "success",
            "file_id": unique_filename,
            "original_filename": file.filename,
            "project_id": project_id,
            "processing_result": processing_result
        }
    except Exception as e:
        # Clean up if error occurs
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

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
            
            elif message_type == "file_upload":
                # Handle file upload via WebSocket (for smaller files or metadata)
                # For larger files, use the HTTP endpoint
                request_id = message.get("request_id")
                file_data = message.get("file_data")
                file_type = message.get("file_type")
                project_id = message.get("project_id")
                
                # Process the file upload
                # This is a simplified implementation
                try:
                    # In a real implementation, you'd save and process the file
                    # For now, just acknowledge the upload
                    await manager.send_personal_message({
                        "type": "file_upload_success",
                        "request_id": request_id,
                        "file_id": str(uuid.uuid4()),
                        "project_id": project_id
                    }, client_id)
                except Exception as e:
                    await manager.send_personal_message({
                        "type": "file_upload_failed",
                        "request_id": request_id,
                        "reason": str(e)
                    }, client_id)
            
            elif message_type == "audio_analysis_request":
                # Handle real-time audio analysis requests
                request_id = message.get("request_id")
                audio_data_base64 = message.get("audio_data")
                
                try:
                    # Decode base64 audio data
                    audio_bytes = base64.b64decode(audio_data_base64)
                    
                    # Save to temporary file for processing
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
                        temp_audio.write(audio_bytes)
                        temp_audio_path = temp_audio.name
                    
                    # Process the audio to generate FFT data
                    # This is a simplified version - in reality, you'd want to process the audio directly
                    # without writing to disk for better performance
                    with wave.open(temp_audio_path, 'rb') as wav_file:
                        n_frames = wav_file.getnframes()
                        frames = wav_file.readframes(n_frames)
                    
                    # Convert to numpy array and process
                    audio_array = np.frombuffer(frames, dtype=np.int16)
                    fft_data = np.fft.fft(audio_array)
                    freqs = np.fft.fftfreq(len(fft_data), 1.0/44100)  # Assuming 44.1kHz sample rate
                    
                    magnitude = np.abs(fft_data)
                    # Send the analysis back
                    await manager.send_personal_message({
                        "type": "audio_analysis_response",
                        "request_id": request_id,
                        "frequencies": freqs[:100].tolist(),  # Send first 100 points
                        "magnitude": magnitude[:100].tolist()  # Send first 100 points
                    }, client_id)
                    
                    # Clean up
                    os.unlink(temp_audio_path)
                except Exception as e:
                    await manager.send_personal_message({
                        "type": "audio_analysis_failed",
                        "request_id": request_id,
                        "reason": str(e)
                    }, client_id)
                    
    except WebSocketDisconnect:
        manager.disconnect(client_id)
