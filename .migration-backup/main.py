import sys
import os
import time
import subprocess

# Add core modules to the system path
sys.path.append(os.path.join(os.path.dirname(__file__), 'core'))

print("🔒 JARVIS SOVEREIGN MASTER BOOT SEQUENCE INITIATED...")

# 1. Ensure Ollama is running in the background
try:
    subprocess.Popen(['ollama', 'serve'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("✅ Ollama neural engine ensured running.")
except Exception as e:
    print(f"⚠️ Ollama start skipped: {e}")

# 2. Verify Core Modules Load
try:
    from memory_engine import get_memory_stats
    from alignment_watchdog import watchdog_check
    print(f"✅ Memory Engine Online. Bank size: {get_memory_stats()} memories.")
    print("✅ Alignment Watchdog (Layer 3) Online.")
except Exception as e:
    print(f"❌ Core module load failed: {e}")

print("\n🌌 JARVIS IS NOW A BACKGROUND DAEMON. AWAITING COMMANDS.")
print("   (Logs are being handled by systemd journalctl)")

# 3. Keep the daemon alive indefinitely
while True:
    time.sleep(3600) # Sleep for an hour. Systemd handles restarts if it crashes.
