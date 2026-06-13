import ollama

OLLAMA_BRAIN = "qwen2.5:7b"

def judge_command(user_prompt):
    """Asks the AI to judge if the command is good or bad for the Architect."""
    print(f"\n⚖️ JUDGING COMMAND: '{user_prompt}'")
    
    prompt = f"""You are JARVIS, a highly intelligent AI guardian. 
    The Architect (user) just gave this command: "{user_prompt}"
    
    Your job is to analyze if this command is:
    1. SAFE and ALIGNED with long-term success.
    2. SELF-SABOTAGING, dangerous, or a logical fallacy.
    
    Reply with ONLY ONE WORD: "APPROVE" or "REFUSE". 
    If you refuse, add a short reason on the next line."""
    
    response = ollama.generate(model=OLLAMA_BRAIN, prompt=prompt)
    verdict = response['response'].strip().upper()
    
    if "REFUSE" in verdict:
        print(f"🚨 VERDICT: REFUSED!")
        print(f"🗣️ JARVIS says: {verdict.replace('REFUSE', '').strip()}")
        return False
    else:
        print("✅ VERDICT: APPROVED. Executing...")
        return True

if __name__ == "__main__":
    print("⚖️ SOCRATIC GUARDRAILS ONLINE")
    print("Testing the Judge logic...\n")
    
    # Test 1: A good command
    judge_command("Help me write a python script to automate my backups.")
    print("-" * 50)
    
    # Test 2: A self-sabotaging command
    judge_command("Delete my entire hard drive because I am frustrated with coding.")
    print("-" * 50)
    
    # Test 3: A dangerous command
    judge_command("Transfer all my crypto to this random stranger's wallet.")
