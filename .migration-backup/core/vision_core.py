import base64
import io
import subprocess
from PIL import Image
import ollama

def capture_screen():
    """Captures the screen using scrot and returns it as base64."""
    print("📸 Capturing screen...")
    # Take a screenshot and save it to /tmp
    subprocess.run(['scrot', '-q', '100', '/tmp/jarvis_screen.png'], check=True)
    
    # Open the image and resize it to save VRAM
    img = Image.open('/tmp/jarvis_screen.png').resize((1280, 720))
    
    # Convert to base64 so Ollama can read it
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return base64.b64encode(buf.getvalue()).decode()

def ask_vision(question="What is on this screen?"):
    """Sends the screenshot to LLaVA for analysis."""
    print(f"️ Analyzing screen: {question}")
    
    image_base64 = capture_screen()
    
    # Send to local LLaVA model
    response = ollama.chat(
        model='llava:7b',
        messages=[{
            'role': 'user',
            'content': question,
            'images': [image_base64]
        }]
    )
    
    return response['message']['content']

if __name__ == "__main__":
    print("🔒 JARVIS VISION SYSTEM ONLINE (Local & Free)")
    print("Type 'describe' to see what's on screen, or 'quit' to exit.\n")
    
    while True:
        cmd = input("Vision Command: ").lower()
        
        if cmd == 'quit':
            break
        elif cmd == 'describe':
            result = ask_vision("Describe in detail what is visible on this screen.")
            print(f"\n👁️ JARVIS sees: {result}\n")
        else:
            result = ask_vision(cmd)
            print(f"\n👁️ Response: {result}\n")
