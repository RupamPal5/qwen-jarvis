import sys
import os
import time
import base64
import io
import subprocess

# Add current directory to path so we can import our flight recorder
sys.path.append(os.path.dirname(__file__))

from faster_whisper import WhisperModel
import sounddevice as sd
import soundfile as sf
import ollama
from PIL import Image

# Try to import flight recorder, fallback gracefully if missing
try:
    from flight_recorder import trace_llm_call, recorder
    TRACING_ENABLED = True
except ImportError:
    TRACING_ENABLED = False
    print("⚠️ Flight Recorder not found. Tracing disabled.")

# --- CONFIGURATION ---
WHISPER_MODEL_SIZE = "small" 
OLLAMA_TEXT = "qwen2.5:7b"
OLLAMA_VISION = "llava:7b"
AUDIO_FILE = "/tmp/jarvis_input.wav"
OUTPUT_FILE = "/tmp/jarvis_output.wav"
AUDIO_DEVICE = "default"
PIPER_EXECUTABLE = os.path.expanduser("~/jarvis_sovereign/venv/bin/piper")

PIPER_VOICES = {
    "english": os.path.expanduser("~/jarvis_sovereign/voices/ryan.onnx"),
    "hindi": os.path.expanduser("~/jarvis_sovereign/voices/hindi.onnx")
}

LANGUAGES = {
    "english": {"code": "en", "prompt": "You are Jarvis. Respond in English.", "tts": "piper"},
    "hindi": {"code": "hi", "prompt": "You are Jarvis. Respond in Hindi (Devanagari script).", "tts": "piper"},
    "bengali": {"code": "bn", "prompt": "You are Jarvis. Respond in Bengali (Bangla script).", "tts": "espeak"}
}
current_lang = "english"

# --- INITIALIZATION ---
print(f"👂 Loading Faster-Whisper '{WHISPER_MODEL_SIZE}'...")
ears = WhisperModel(WHISPER_MODEL_SIZE, device="cuda", compute_type="int8")

print("🧠 Checking Ollama connection...")
try:
    ollama.list()
except Exception:
    print("❌ ERROR: Ollama is not running.")
    exit(1)

print("🗣️ Voices Ready: English (Ryan), Hindi (Rohan), Bengali (eSpeak)")
print(f"\n🔒 JARVIS ULTIMATE ONLINE. Current Language: ENGLISH")
print("💡 Commands: Say 'Look' or 'Describe screen' to use Vision.")
print("Press ENTER to speak, 'quit' to exit.\n")

def listen():
    global current_lang
    print("🎤 Listening...")
    audio = sd.rec(int(6 * 16000), samplerate=16000, channels=1, dtype='float32', device=AUDIO_DEVICE)
    sd.wait()
    sf.write(AUDIO_FILE, audio, 16000)
    
    segments, info = ears.transcribe(
        AUDIO_FILE, language=LANGUAGES[current_lang]["code"], 
        beam_size=5, vad_filter=True, vad_parameters=dict(min_silence_duration_ms=500)
    )
    text = " ".join([segment.text for segment in segments]).strip()
    if text: print(f"👤 You said: {text}")
    return text

def see(question="Describe this screen in detail."):
    """Captures screen and asks LLaVA."""
    print("\n⚠️ Swapping VRAM models for Vision... please wait (5-10s)...")
    time.sleep(1) # Give Ollama a second to swap VRAM
    
    print("📸 Capturing screen...")
    subprocess.run(['scrot', '-q', '100', '/tmp/jarvis_screen.png'], check=True)
    img = Image.open('/tmp/jarvis_screen.png').resize((1280, 720))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    img_b64 = base64.b64encode(buf.getvalue()).decode()
    
    print("👁️ Analyzing with LLaVA...")
    response = ollama.chat(
        model=OLLAMA_VISION,
        messages=[{'role': 'user', 'content': question, 'images': [img_b64]}]
    )
    return response['message']['content']

def think_text(user_text):
    global current_lang
    user_lower = user_text.lower()
    
    # Language Switching
    if "switch to hindi" in user_lower or "hindi mein bolo" in user_lower:
        current_lang = "hindi"
        return "भाषा हिंदी में बदल दी गई है।"
    elif "switch to bengali" in user_lower or "bangla te bolo" in user_lower:
        current_lang = "bengali"
        return "ভাষা বাংলায় পরিবর্তন করা হয়েছে।"
    elif "switch to english" in user_lower:
        current_lang = "english"
        return "Language switched to English."
        
    # Vision Commands
    if "look" in user_lower or "describe screen" in user_lower or "what is on my screen" in user_lower:
        return see("Describe exactly what is visible on this screen right now.")
    elif "read text" in user_lower or "ocr" in user_lower:
        return see("Extract all visible text from this screen.")

    # Normal Text Thinking (Swaps VRAM back to Qwen)
    print("\n⚠️ Swapping VRAM models back to Text Brain... please wait...")
    time.sleep(1)
    
    response = ollama.chat(
        model=OLLAMA_TEXT, 
        messages=[
            {'role': 'system', 'content': f'You are Jarvis. {LANGUAGES[current_lang]["prompt"]} Be concise.'},
            {'role': 'user', 'content': user_text}
        ]
    )
    return response['message']['content']

def speak(text):
    tts_engine = LANGUAGES[current_lang]["tts"]
    print(f"️ Jarvis ({current_lang.upper()}): {text}\n")
    
    if tts_engine == "piper":
        current_voice = PIPER_VOICES[current_lang]
        with open("/tmp/piper_input.txt", "w") as f: f.write(text)
        subprocess.run(f"{PIPER_EXECUTABLE} --model {current_voice} --output_file {OUTPUT_FILE} < /tmp/piper_input.txt", shell=True, check=True)
        data, samplerate = sf.read(OUTPUT_FILE)
        sd.play(data, samplerate, device=AUDIO_DEVICE)
        sd.wait()
    elif tts_engine == "espeak":
        subprocess.run(["espeak", "-v", "bn", text], check=True)

# --- MAIN LOOP ---
while True:
    input("(Press ENTER to speak) ")
    user_text = listen()
    
    if not user_text: continue
    if user_text.lower() in ['quit', 'exit', 'stop']:
        speak("Shutting down. Goodbye, sir.")
        break
        
    reply = think_text(user_text)
    speak(reply)
