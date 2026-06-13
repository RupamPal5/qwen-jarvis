from faster_whisper import WhisperModel
import sounddevice as sd
import soundfile as sf
import ollama
import subprocess
import os

# --- CONFIGURATION ---
WHISPER_MODEL_SIZE = "small" 
OLLAMA_BRAIN = "qwen2.5:7b"
AUDIO_FILE = "/tmp/jarvis_input.wav"
OUTPUT_FILE = "/tmp/jarvis_output.wav"
AUDIO_DEVICE = "default"
PIPER_EXECUTABLE = os.path.expanduser("~/jarvis_sovereign/venv/bin/piper")

# VOICE MAP: Piper voices for English and Hindi
PIPER_VOICES = {
    "english": os.path.expanduser("~/jarvis_sovereign/voices/ryan.onnx"),
    "hindi": os.path.expanduser("~/jarvis_sovereign/voices/hindi.onnx")
}

# LANGUAGE MAP: Whisper codes and system prompts
LANGUAGES = {
    "english": {
        "code": "en", 
        "prompt": "You are Jarvis. Respond in English.",
        "tts_engine": "piper"
    },
    "hindi": {
        "code": "hi", 
        "prompt": "You are Jarvis. Respond in Hindi (Devanagari script).",
        "tts_engine": "piper"
    },
    "bengali": {
        "code": "bn", 
        "prompt": "You are Jarvis. Respond in Bengali (Bangla script).",
        "tts_engine": "espeak"
    }
}
current_lang = "english"

# --- INITIALIZATION ---
print(f"👂 Loading Faster-Whisper '{WHISPER_MODEL_SIZE}' (VAD Active)...")
ears = WhisperModel(WHISPER_MODEL_SIZE, device="cuda", compute_type="int8")

print("🧠 Connecting to Local Brain (Qwen 7B)...")
try:
    ollama.list()
except Exception as e:
    print("❌ ERROR: Ollama is not running.")
    exit(1)

print("🗣️ Voices Ready: English (Ryan), Hindi (Rohan), Bengali (eSpeak)")
print(f"\n🔒 JARVIS ACOUSTIC INTERFACE ONLINE. Current Language: ENGLISH")
print("💡 Say 'Switch to Hindi' or 'Switch to Bengali' to change language.")
print("Press ENTER to speak, 'quit' to exit.\n")

def listen():
    global current_lang
    print("🎤 Listening... (Speak clearly)")
    
    audio = sd.rec(int(6 * 16000), samplerate=16000, channels=1, dtype='float32', device=AUDIO_DEVICE)
    sd.wait()
    sf.write(AUDIO_FILE, audio, 16000)
    
    print("🔍 Processing audio...")
    
    segments, info = ears.transcribe(
        AUDIO_FILE, 
        language=LANGUAGES[current_lang]["code"], 
        beam_size=5, 
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=500)
    )
    
    text = " ".join([segment.text for segment in segments]).strip()
    
    if not text:
        print("⚠️ No clear speech detected. Try speaking louder.")
        return ""
        
    print(f"👤 You said: {text}")
    return text

def think(user_text):
    global current_lang
    
    user_lower = user_text.lower()
    
    # Language switching logic
    if "switch to hindi" in user_lower or "hindi mein bolo" in user_lower:
        current_lang = "hindi"
        return "भाषा हिंदी में बदल दी गई है। अब मैं हिंदी में उत्तर दूंगा।"
    elif "switch to bengali" in user_lower or "bangla te bolo" in user_lower:
        current_lang = "bengali"
        return "ভাষা বাংলায় পরিবর্তন করা হয়েছে। এখন আমি বাংলায় উত্তর দেব।"
    elif "switch to english" in user_lower:
        current_lang = "english"
        return "Language switched to English. I will now respond in English."
    
    # Normal conversation
    response = ollama.chat(model=OLLAMA_BRAIN, messages=[
        {'role': 'system', 'content': f'You are Jarvis, Tony Stark\'s highly advanced, sovereign AI assistant. {LANGUAGES[current_lang]["prompt"]} Be professional, concise, and loyal. Address the user as "Sir" or "Architect".'},
        {'role': 'user', 'content': user_text}
    ])
    return response['message']['content']

def speak(text):
    tts_engine = LANGUAGES[current_lang]["tts_engine"]
    print(f"🗣️ Jarvis ({current_lang.upper()}): {text}")
    
    if tts_engine == "piper":
        # Use Piper for English and Hindi
        current_voice = PIPER_VOICES[current_lang]
        
        with open("/tmp/piper_input.txt", "w") as f:
            f.write(text)
            
        subprocess.run(
            f"{PIPER_EXECUTABLE} --model {current_voice} --output_file {OUTPUT_FILE} < /tmp/piper_input.txt",
            shell=True,
            check=True
        )
        
        data, samplerate = sf.read(OUTPUT_FILE)
        sd.play(data, samplerate, device=AUDIO_DEVICE)
        sd.wait()
        
    elif tts_engine == "espeak":
        # Use eSpeak for Bengali
        subprocess.run(
            ["espeak", "-v", "bn", text],
            check=True
        )

# --- MAIN LOOP ---
while True:
    input("(Press ENTER to speak) ")
    
    user_text = listen()
    if not user_text:
        continue
        
    if user_text.lower() in ['quit', 'exit', 'stop']:
        speak("Shutting down acoustic interface. Goodbye, sir.")
        break
        
    reply = think(user_text)
    speak(reply)

