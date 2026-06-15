import subprocess
import os
import time

# Path to the panic file
PANIC_FILE = "/mnt/c/Users/rupam/Desktop/jarvis_panic_switch.txt"

def trigger_omega_protocol():
    """The Kill Switch: Cuts network and wipes temp files."""
    print("\n" + "="*60)
    print("🚨 🚨 🚨 PANIC SWITCH ACTIVATED. INITIATING OMEGA PROTOCOL. 🚨 🚨 🚨")
    print("="*60 + "\n")
    
    # 1. Sever all network connections immediately
    print("🔪 Severing network interfaces...")
    subprocess.run(['sudo', 'ip', 'link', 'set', 'eth0', 'down'], capture_output=True)
    subprocess.run(['sudo', 'ip', 'link', 'set', 'wlan0', 'down'], capture_output=True)
    
    # 2. Wipe temporary AI memory from RAM
    print("🧹 Wiping volatile memory...")
    subprocess.run(['rm', '-rf', '/tmp/jarvis_*'], capture_output=True)
    
    print("💀 [TEST MODE] Halting system command skipped.")
    print("✅ OMEGA PROTOCOL COMPLETE. SYSTEM NEUTRALIZED.")
    os._exit(1)

def monitor_panic_file():
    """Polls the file every 0.5 seconds to see if it's gone."""
    print("🛡️ SOVEREIGN PANIC SWITCH ARMED (Polling Mode).")
    print(f"💡 Target File: {PANIC_FILE}")
    print("💡 ACTION: Delete the file. The script will detect it within 1 second.")
    print("   (Press Ctrl+C to disarm)\n")
    
    # Ensure file exists first
    if not os.path.exists(PANIC_FILE):
        print(f"⚠️ WARNING: File not found. Creating it now...")
        # Create it so we can test deleting it
        open(PANIC_FILE, 'a').close()
        time.sleep(1)

    print(" Watching for file deletion (checking every 0.5s)...")
    
    try:
        while True:
            # If the file is GONE, trigger the protocol
            if not os.path.exists(PANIC_FILE):
                trigger_omega_protocol()
                break
            
            # Wait 0.5 seconds before checking again
            time.sleep(0.5)
            
    except KeyboardInterrupt:
        print("\n✅ Panic switch disarmed. Exiting safely.")

if __name__ == "__main__":
    monitor_panic_file()
