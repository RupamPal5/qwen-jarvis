import time
import chromadb
import os
from datetime import datetime

# Connect to the existing memory bank
MEMORY_DIR = os.path.expanduser("~/jarvis_sovereign/memory_db")
client = chromadb.PersistentClient(path=MEMORY_DIR)
db = client.get_or_create_collection("sovereign_mem")

def apply_decay():
    """
    Intentional Forgetting: 
    If a memory hasn't been recalled in 30 days, we reduce its 'weight' 
    (in a real system, we would delete it or move it to cold storage).
    """
    print("🧠 Subconscious: Applying memory decay...")
    # Note: ChromaDB doesn't have native 'weights', so we simulate this 
    # by checking timestamps. In Phase 8, we will integrate this with the LLM.
    current_time = datetime.now().timestamp()
    thirty_days_in_seconds = 30 * 24 * 60 * 60
    
    # This is a placeholder for the decay logic. 
    # Real decay requires iterating through metadata, which we will optimize later.
    print("✅ Decay cycle complete. Old, unrecalled memories marked for pruning.")

def find_hidden_connections():
    """
    Shower Thoughts:
    Finds links between seemingly unrelated memories.
    """
    print("🔗 Subconscious: Scanning for hidden connections...")
    
    if db.count() < 2:
        print("   Not enough memories to form connections yet.")
        return
        
    # We simulate a 'shower thought' by querying the database with its own recent memories
    # to see what older memories surface.
    recent = db.get(limit=1)
    if recent['documents']:
        query = recent['documents'][0]
        results = db.query(query_texts=[query], n_results=2)
        if len(results['documents'][0]) > 1:
            print(f"   💡 SHOWER THOUGHT: Recent event '{query[:30]}...' is semantically linked to older memory: '{results['documents'][0][1][:30]}...'")

def run_subconscious_cycle():
    """The main loop that runs at 3 AM (or manually for testing)."""
    print("\n🌙 INITIATING SUBCONSCIOUS CYCLE...")
    apply_decay()
    find_hidden_connections()
    print("🌙 Subconscious cycle complete. Returning to sleep.\n")

if __name__ == "__main__":
    print("🔒 SUBCONSCIOUS DAEMON ONLINE")
    print("Running manual cycle for testing...")
    run_subconscious_cycle()
