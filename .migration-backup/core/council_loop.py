import ollama
import time

OLLAMA_BRAIN = "qwen2.5:7b"

def ask_architect(prompt):
    """The Architect: Proposes the fastest, most logical solution."""
    response = ollama.chat(
        model=OLLAMA_BRAIN,
        messages=[{
            'role': 'system', 
            'content': 'You are The Architect. You provide the most efficient, logical, and direct solution to any problem. Be concise.'
        }, {
            'role': 'user', 
            'content': prompt
        }]
    )
    return response['message']['content']

def ask_adversary(proposal):
    """The Adversary: Finds flaws, edge cases, and security risks in the proposal."""
    response = ollama.chat(
        model=OLLAMA_BRAIN,
        messages=[{
            'role': 'system', 
            'content': 'You are The Adversary. Your job is to ruthlessly critique the following proposal. Find logical flaws, security risks, edge cases, or better alternatives. Be brief and sharp.'
        }, {
            'role': 'user', 
            'content': f"Critique this proposal:\n{proposal}"
        }]
    )
    return response['message']['content']

def ask_arbiter(original_prompt, proposal, critique):
    """The Arbiter: Reviews both and delivers the final, perfected verdict."""
    response = ollama.chat(
        model=OLLAMA_BRAIN,
        messages=[{
            'role': 'system', 
            'content': 'You are The Arbiter. You review the original request, the Architect\'s proposal, and the Adversary\'s critique. Deliver the final, perfected, and safest solution. If the critique was valid, fix the proposal. If the critique was invalid, stick to the proposal.'
        }, {
            'role': 'user', 
            'content': f"Original Request: {original_prompt}\n\nArchitect's Proposal: {proposal}\n\nAdversary's Critique: {critique}"
        }]
    )
    return response['message']['content']

def council_decide(user_prompt):
    """Runs the Council of Three debate."""
    print("\n🏛️ INITIATING COUNCIL OF THREE PROTOCOL...")
    
    print("🧠 [1/3] The Architect is thinking...")
    proposal = ask_architect(user_prompt)
    print(f"   -> Proposal: {proposal[:100]}...")
    
    print("⚔️ [2/3] The Adversary is attacking...")
    critique = ask_adversary(proposal)
    print(f"   -> Critique: {critique[:100]}...")
    
    print("⚖️ [3/3] The Arbiter is deciding...")
    final_verdict = ask_arbiter(user_prompt, proposal, critique)
    
    print("\n✅ FINAL VERDICT DELIVERED:")
    print("="*50)
    print(final_verdict)
    print("="*50 + "\n")

if __name__ == "__main__":
    print("⚖️ COUNCIL OF THREE ONLINE")
    question = input("Enter a complex problem for the Council to debate: ")
    council_decide(question)
