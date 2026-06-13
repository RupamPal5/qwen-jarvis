import os
import shutil
import subprocess
from cryptography.fernet import Fernet

# --- CONFIGURATION ---
MEMORY_DIR = os.path.expanduser("~/jarvis_sovereign/memory_db")
LOCKED_DIR = os.path.expanduser("~/jarvis_sovereign/.locked_vault")
KEY_FILE = os.path.expanduser("~/jarvis_sovereign/config/vault.key")

def generate_key():
    """Generates a secure encryption key."""
    key = Fernet.generate_key()
    with open(KEY_FILE, 'wb') as key_file:
        key_file.write(key)
    print("🔑 New vault encryption key generated.")

def load_key():
    """Loads the existing key."""
    return open(KEY_FILE, 'rb').read()

def encrypt_memory_db():
    """Zips and encrypts the ChromaDB memory folder."""
    if not os.path.exists(MEMORY_DIR):
        print("⚠️ No memory database found to lock.")
        return

    print("🔒 Encrypting Sovereign Memory Database...")
    
    # 1. Create locked vault directory
    os.makedirs(LOCKED_DIR, exist_ok=True)
    
    # 2. Load or generate key
    if not os.path.exists(KEY_FILE):
        generate_key()
    key = load_key()
    fernet = Fernet(key)
    
    # 3. Encrypt the sqlite database inside the memory folder
    db_file = os.path.join(MEMORY_DIR, "chroma.sqlite3")
    if os.path.exists(db_file):
        with open(db_file, 'rb') as file:
            original_data = file.read()
        
        encrypted_data = fernet.encrypt(original_data)
        
        with open(os.path.join(LOCKED_DIR, "chroma.sqlite3.enc"), 'wb') as enc_file:
            enc_file.write(encrypted_data)
            
        print("✅ Database encrypted and moved to .locked_vault.")
        
        # 4. Wipe the original unencrypted folder
        shutil.rmtree(MEMORY_DIR)
        print("🧹 Original unencrypted memory wiped from RAM/Disk.")
    else:
        print("⚠️ chroma.sqlite3 not found.")

def sever_network():
    """Drops all network interfaces (The Air-Gap)."""
    print("️ Severing network interfaces...")
    subprocess.run(['sudo', 'ip', 'link', 'set', 'eth0', 'down'], capture_output=True)
    subprocess.run(['sudo', 'ip', 'link', 'set', 'wlan0', 'down'], capture_output=True)
    subprocess.run(['sudo', 'ip', 'link', 'set', 'lo', 'down'], capture_output=True)
    print("✅ Network severed. System is now AIR-GAPPED.")

def trigger_panic_room(reason="Unknown Anomaly"):
    """The Master Trigger."""
    print("\n" + "="*60)
    print(f"🚨 PANIC ROOM TRIGGERED. REASON: {reason} 🚨")
    print("="*60 + "\n")
    
    encrypt_memory_db()
    sever_network()
    
    print("\n💀 SYSTEM LOCKED. AWAITING PHYSICAL KEY TO DECRYPT AND RESTORE.")
    os._exit(1)

if __name__ == "__main__":
    print("🛡️ PANIC ROOM PROTOCOL READY.")
    print("Type 'trigger' to simulate a lockdown test.")
    
    cmd = input("Command: ").lower()
    if cmd == 'trigger':
        trigger_panic_room(reason="Manual Test by Architect")
