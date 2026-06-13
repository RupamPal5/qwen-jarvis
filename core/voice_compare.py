import subprocess
import sounddevice as sd
import soundfile as sf
import os

# Map the numbers to the voice files
VOICES = {
    "1": {"name": "Alan (Classic British JARVIS)", "path": os.path.expanduser("~/jarvis_sovereign/voices/alan.onnx")},
    "2": {"name": "Ryan (American Male)", "path": os.path.expanduser("~/jarvis_sovereign/voices/ryan.onnx")}
}

def speak(text, voice_path):
    # Generate the audio using Piper
    subprocess.run(
        f"piper --model {voice_path} --output_file /tmp/compare_voice.wav",
        input=text, text=True, shell=True, check=True
    )
    # Play it through your WSL2 speakers
    data, samplerate = sf.read("/tmp/compare_voice.wav")
    sd.play(data, samplerate)
    sd.wait()

print("\n🎙️ JARVIS VOICE A/B TEST")
print("1. Alan (Classic British JARVIS)")
print("2. Ryan (American Male)")
choice = input("\nType 1 or 2 and press ENTER: ")

if choice in VOICES:
    print(f"\n🗣️ Testing: {VOICES[choice]['name']}...")
    # The test phrase
    phrase = "Good evening, sir. The acoustic interface is fully operational. How may I assist you today?"
    speak(phrase, VOICES[choice]['path'])
    print("✅ Playback finished.\n")
else:
    print("❌ Invalid choice. Please run again and type 1 or 2.")
