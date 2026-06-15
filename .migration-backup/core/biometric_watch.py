import sys
import tty
import termios
import time
import json
import os

LOG_DIR = os.path.expanduser("~/jarvis_sovereign/logs")
os.makedirs(LOG_DIR, exist_ok=True)
PROFILE_FILE = os.path.join(LOG_DIR, "biometric_profile.json")

timings = []

def get_char():
    """Reads a single character from the terminal without waiting for Enter."""
    fd = sys.stdin.fileno()
    old_settings = termios.tcgetattr(fd)
    try:
        tty.setraw(sys.stdin.fileno())
        ch = sys.stdin.read(1)
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
    return ch

print("🛡️ BIOMETRIC WATCHDOG ACTIVE (WSL2 Native Mode).")
print("⌨️ Type naturally for a few sentences...")
print("(The script will automatically stop after 50 keystrokes)\n")

last_time = time.time()

try:
    while True:
        char = get_char()
        
        # If they press Ctrl+C (ASCII 3), break
        if ord(char) == 3:
            raise KeyboardInterrupt
            
        current_time = time.time()
        delay = current_time - last_time
        last_time = current_time
        
        if delay < 2.0:
            timings.append(delay)
            # Show the typed character and the delay in real-time
            if char == ' ':
                print(f"␣[{delay:.3f}s]", end=' ', flush=True)
            elif char == '\n' or char == '\r':
                print(f"↵[{delay:.3f}s]\n", end='', flush=True)
            else:
                print(f"{char}[{delay:.3f}s]", end='', flush=True)
                
        # Automatically stop at 50 keystrokes
        if len(timings) >= 50:
            break
            
except KeyboardInterrupt:
    print("\n\n❌ Monitoring cancelled.")
    sys.exit(0)

# Calculate and save the baseline
avg_delay = sum(timings) / len(timings)
print(f"\n\n✅ Baseline Rhythm Established!")
print(f"⏱️ Average delay: {avg_delay:.4f} seconds per keystroke.")
print(f"📊 Total samples: {len(timings)}")
print("🔒 Biometric profile saved to logs/biometric_profile.json")

profile = {
    "avg_delay": avg_delay, 
    "samples": len(timings),
    "created_at": time.time()
}
with open(PROFILE_FILE, "w") as f:
    json.dump(profile, f, indent=2)
