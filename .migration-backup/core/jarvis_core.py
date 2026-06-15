import os
import ollama
import hashlib
import json
from datetime import datetime

# We no longer need an API key! The brain is in your house.
MODEL_NAME = "qwen2.5:7b"

# Setup the immutable Merkle Tree log paths
LOG_DIR = os.path.join(os.path.dirname(__file__), "../logs")
os.makedirs(LOG_DIR, exist_ok=True)
AUDIT_LOG = os.path.join(LOG_DIR, "merkle_audit.jsonl")
CHAIN_HEAD = os.path.join(LOG_DIR, "chain_head.txt")

def get_last_hash():
    if os.path.exists(CHAIN_HEAD):
        with open(CHAIN_HEAD, "r") as f:
            return f.read().strip()
    return "0" 

def log_exchange(role: str, content: str, prev_hash: str) -> str:
    timestamp = datetime.utcnow().isoformat()
    payload = f"{prev_hash}|{timestamp}|{role}|{content}"
    current_hash = hashlib.sha256(payload.encode()).hexdigest()
    
    entry = {
        "timestamp": timestamp,
        "role": role,
        "content": content,
        "hash": current_hash,
        "prev_hash": prev_hash
    }
    with open(AUDIT_LOG, "a") as f:
        f.write(json.dumps(entry) + "\n")
    
    with open(CHAIN_HEAD, "w") as f:
        f.write(current_hash)
        
    return current_hash

def ask_local_brain(conversation_history):
    """Talks to the local Qwen model via Ollama."""
    try:
        response = ollama.chat(model=MODEL_NAME, messages=conversation_history)
        return response['message']['content']
    except Exception as e:
        return f"Error talking to local brain: {e}"

print("🔒 JARVIS CORE ONLINE. 100% LOCAL & FREE. Merkle Audit Active.")
print("Type 'quit' to exit.\n")

conversation = []
while True:
    user_input = input("You: ")
    if user_input.lower() == "quit":
        break
    
    # 1. Hash user input into the unbreakable chain
    prev_hash = get_last_hash()
    log_exchange("user", user_input, prev_hash)
    
    # 2. Add to AI memory context
    conversation.append({"role": "user", "content": user_input})
    
    # 3. Ask the LOCAL AI brain (No internet required!)
    reply = ask_local_brain(conversation)
    
    # 4. Hash the AI's reply into the chain
    new_hash = get_last_hash()
    log_exchange("assistant", reply, new_hash)
    
    # 5. Add to AI memory context
    conversation.append({"role": "assistant", "content": reply})
    
    print(f"\nJarvis (Local): {reply}\n")

