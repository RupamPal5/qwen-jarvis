import chromadb
from datetime import datetime
import os

# --- CONFIGURATION ---
# We store the database locally in the sovereign folder
MEMORY_DIR = os.path.expanduser("~/jarvis_sovereign/memory_db")
os.makedirs(MEMORY_DIR, exist_ok=True)

# Initialize the persistent client (survives reboots)
client = chromadb.PersistentClient(path=MEMORY_DIR)
db = client.get_or_create_collection("sovereign_mem")

def save_memory(text, emotion="neutral", context="general"):
    """Saves a memory with emotional and contextual tags."""
    timestamp = str(datetime.now().timestamp())
    
    db.add(
        documents=[text],
        metadatas=[{
            "emotion": emotion, 
            "context": context, 
            "timestamp": timestamp,
            "recall_count": 0
        }],
        ids=[timestamp]
    )
    print(f" Memory saved: '{text[:50]}...' (Emotion: {emotion})")

def recall_memory(query, n_results=3):
    """Recalls memories based on semantic similarity (meaning)."""
    if db.count() == 0:
        return ["No memories found yet, sir."]
        
    results = db.query(query_texts=[query], n_results=n_results)
    return results['documents'][0]

def get_memory_stats():
    """Returns the total number of memories stored."""
    return db.count()

if __name__ == "__main__":
    print("🔒 EPISODIC MEMORY ENGINE ONLINE")
    print(f"Current Memory Bank Size: {get_memory_stats()} memories\n")
    
    # --- TEST THE SYSTEM ---
    print("🧪 Testing Memory Ingestion...")
    save_memory("The Architect was frustrated with Google OAuth today.", emotion="frustrated", context="work")
    save_memory("We successfully built the Hardware Guillotine kill switch.", emotion="proud", context="security")
    save_memory("JARVIS needs to learn Bengali and Hindi accents.", emotion="determined", context="voice")
    
    print("\n🧪 Testing Memory Recall...")
    print("Query: 'How did the Architect feel today?'")
    memories = recall_memory("How did the Architect feel today?")
    for mem in memories:
        print(f"  -> {mem}")
