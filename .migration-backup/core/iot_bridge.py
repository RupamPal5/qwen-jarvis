import time
import random

# --- SIMULATED SMART ROOM ---
# In a real setup, this would connect to Philips Hue or smart plugs via MQTT.
room_state = {
    'lights': 'bright_white',
    'music': 'off',
    'temperature': 24
}

def analyze_architect_mood():
    """Simulates reading your biometric data to guess your mood."""
    # In Phase 2, we tracked typing speed. Here we just simulate it.
    mood = random.choice(['focused', 'stressed', 'relaxed'])
    return mood

def adjust_environment(mood):
    """Automatically changes the room based on your mood."""
    print(f"\n JARVIS detected mood: {mood.upper()}")
    
    if mood == 'stressed':
        print("💡 Action: Dimming lights to warm amber...")
        print("🎵 Action: Playing Lo-Fi beats...")
        room_state['lights'] = 'warm_amber'
        room_state['music'] = 'lo_fi'
    elif mood == 'focused':
        print("💡 Action: Setting lights to bright cool white...")
        print(" Action: Playing deep focus ambient...")
        room_state['lights'] = 'bright_white'
        room_state['music'] = 'ambient'
    else:
        print(" Action: Restoring default lighting...")
        room_state['lights'] = 'default'
        room_state['music'] = 'off'

if __name__ == "__main__":
    print("🏠 SMART ROOM BRIDGE ONLINE")
    print("Monitoring Architect's biometric state...\n")
    
    # Run 3 simulation cycles
    for i in range(3):
        mood = analyze_architect_mood()
        adjust_environment(mood)
        time.sleep(2) # Wait 2 seconds between checks
        
    print("\n✅ Smart room logic verified. Ready for physical hardware.")
