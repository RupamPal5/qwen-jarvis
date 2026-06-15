import ollama
import os
import subprocess

# 1. Create a folder to save the custom websites
UI_FOLDER = os.path.expanduser("~/jarvis_sovereign/ui_renders")
os.makedirs(UI_FOLDER, exist_ok=True)

def make_custom_chart(topic):
    """Asks Ollama to write a custom HTML chart."""
    print(f"\n JARVIS is designing a custom chart for: '{topic}'...")
    
    # The prompt we send to Ollama
    prompt = f"""Write a SINGLE, standalone HTML file that shows a beautiful, dark-themed line chart for: {topic}.
    Use Chart.js via CDN (https://cdn.jsdelivr.net/npm/chart.js).
    Make the background black, lines neon green, and text white.
    Include some fake data that fits the topic.
    Return ONLY the raw HTML code. Do not include ```html or ``` at the start or end."""
    
    # Ask Ollama
    response = ollama.generate(model='qwen2.5:7b', prompt=prompt)
    html_code = response['response']
    
    # Clean up any accidental markdown formatting
    html_code = html_code.replace('```html', '').replace('```', '').strip()
    
    # Save the file
    file_path = os.path.join(UI_FOLDER, "custom_chart.html")
    with open(file_path, 'w') as f:
        f.write(html_code)
        
    print(f"✅ Chart created! Saved to: {file_path}")
    
    # Try to open it in your Windows browser automatically
    try:
        subprocess.run(['powershell.exe', '-Command', f'Start-Process "{file_path}"'], capture_output=True)
        print(" Opening in your browser...")
    except:
        print("💡 Just go to your folder and double-click 'custom_chart.html' to see it.")

if __name__ == "__main__":
    print("="*50)
    print("🎨 GENERATIVE UI ENGINE TEST")
    print("="*50)
    
    # Let's test it with a cool topic
    make_custom_chart("Bitcoin price over the last 7 days")
    
    print("\n🎉 Done! Check your browser or the ui_renders folder.")
