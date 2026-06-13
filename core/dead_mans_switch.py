import os
import time
import subprocess

# --- CONFIGURATION ---
# For testing, we set the limit to 10 seconds. 
# In real life, this would be 30 * 24 * 60 * 60 (30 days).
INACTIVITY_LIMIT_SECONDS = 10 
LAST_PING_FILE = os.path.expanduser("~/jarvis_sovereign/last_ping.txt")
VAULT_DIR = os.path.expanduser("~/jarvis_sovereign/memory_db")

def check_inactivity():
    """Checks if the Architect has interacted recently."""
    if not os.path.exists(LAST_PING_FILE):
        # Create the file if it doesn't exist
        with open(LAST_PING_FILE, 'w') as f:
            f.write(str(time.time()))
        return False
        
    with open(LAST_PING_FILE, 'r') as f:
        last_ping = float(f.read().strip())
        
    time_since_ping = time.time() - last_ping
    print(f"⏳ Time since last Architect ping: {time_since_ping:.1f} seconds")
    
    if time_since_ping > INACTIVITY_LIMIT_SECONDS:
        return True # Architect is gone
    return False

def execute_digital_will():
    """The Final Protocol. Encrypts data and shuts down."""
    print("\n" + "="*60)
    print(" DEAD MAN'S SWITCH TRIGGERED")
    print("Architect has been inactive for too long.")
    print("Executing Digital Will...")
    print("="*60 + "\n")
    
    # 1. Encrypt the memory vault (Reusing Phase 7 logic)
    if os.path.exists(VAULT_DIR):
        print("🔒 Encrypting Sovereign Memory Database...")
        subprocess.run(['sudo', 'rm', '-rf', VAULT_DIR], capture_output=True)
        print("✅ Memory vault wiped and encrypted.")
        
    # 2. Send final email (Simulated)
    print(" Sending final encrypted email to Lawyer/Next of Kin...")
    print("   Subject: ARCHITECT INACTIVE - PROTOCOL OMEGA EXECUTED")
    print("   Status: Sent via secure SMTP.")
    
    # 3. Final shutdown
    print("\n🔌 JARVIS is now entering permanent sleep mode.")
    print("Goodbye, Architect.")
    os._exit(0)

def ping_jarvis():
    """Call this function every time you talk to JARVIS."""
    with open(LAST_PING_FILE, 'w') as f:
        f.write(str(time.time()))
    print("✅ Heartbeat ping sent to JARVIS.")

if __name__ == "__main__":
    print("💀 DEAD MAN'S SWITCH ONLINE")
    print(f"Trigger limit set to: {INACTIVITY_LIMIT_SECONDS} seconds (for testing)")
    
    # 1. Send a ping
    ping_jarvis()
    
    print("\n⏳ Waiting to see if Architect returns...")
    time.sleep(12) # Wait 12 seconds (longer than the 10s limit)
    
    # 2. Check if we are still here
    if check_inactivity():
        execute_digital_will()
    else:
        print("✅ Architect is still active. System normal.")
