import whisper
import sounddevice as sd
import soundfile as sf

print(" Loading Whisper 'base' model (VRAM-Optimized for 3050)...")
# Explicitly target GPU. If CUDA fails, Whisper auto-falls back to CPU safely.
model = whisper.load_model("base", device="cuda")

print("\n🎤 RECORDING 3 SECONDS. SPEAK CLEARLY NOW!")
audio = sd.rec(int(3 * 16000), samplerate=16000, channels=1, dtype='float32')
sd.wait()
sf.write("/tmp/voice_test.wav", audio, 16000)

print("🔍 Transcribing with GPU acceleration...")
result = model.transcribe("/tmp/voice_test.wav")
print(f"\n✅ YOU SAID: {result['text']}")
