import os
import subprocess
import ollama

# 1. Create a safe folder to test fixes
SAFE_FOLDER = os.path.expanduser("~/jarvis_sovereign/staging")
os.makedirs(SAFE_FOLDER, exist_ok=True)

def fix_the_code(broken_code, error_message):
    """Asks Ollama to fix the broken code."""
    print("\n Step 1: JARVIS found an error. Asking brain to fix it...")
    
    # The prompt we send to Ollama
    prompt = f"""Fix this Python code. 
    Error message: {error_message}
    Broken code: {broken_code}
    Return ONLY the fixed python code. No explanations."""
    
    # Ask Ollama
    response = ollama.generate(model='qwen2.5:7b', prompt=prompt)
    return response['response']

def test_the_fix(fixed_code):
    """Tests the fixed code in the safe folder."""
    print("\n🧪 Step 2: Testing the fix in the safe folder...")
    
    file_path = os.path.join(SAFE_FOLDER, "fixed_test.py")
    
    # Save the fixed code to a file
    with open(file_path, 'w') as f:
        f.write(fixed_code)
        
    # Run the file to see if it works
    result = subprocess.run(['python', file_path], capture_output=True, text=True)
    
    if result.returncode == 0:
        print("✅ Step 3: SUCCESS! The fix works perfectly.")
    else:
        print("❌ Step 3: FAILED. The fix didn't work.")

if __name__ == "__main__":
    print("="*50)
    print("🩺 SELF-FIXING ENGINE TEST")
    print("="*50)
    
    # Let's fake a crash. This code will crash because you can't divide by zero.
    bad_code = "print(1 / 0)" 
    error_msg = "ZeroDivisionError: division by zero"
    
    print(f"\n⚠️ Simulated Crash: {error_msg}")
    
    # 1. Fix it
    fixed_version = fix_the_code(bad_code, error_msg)
    
    # 2. Test it
    test_the_fix(fixed_version)
    
    print("\n🎉 Done! Check your staging folder for the fixed file.")
