from flight_recorder import trace_llm_call, recorder
import ollama
import time

@trace_llm_call("qwen2.5:7b")
def ask_qwen(question):
    """Traced LLM call"""
    response = ollama.chat(
        model='qwen2.5:7b',
        messages=[{'role': 'user', 'content': question}]
    )
    return response['message']['content']

print("📊 FLIGHT RECORDER TEST")
print("Making traced LLM calls...\n")

# Make some calls
questions = [
    "What is 2+2?",
    "Explain quantum computing in one sentence",
    "What is the capital of France?"
]

for q in questions:
    print(f"Asking: {q}")
    answer = ask_qwen(q)
    print(f"Answer: {answer}\n")
    time.sleep(1)

# Show recent logs
print("\n📋 RECENT FLIGHT LOG:")
logs = recorder.get_recent_logs(5)
for log in logs:
    print(f"  {log['timestamp']} - {log['type']} - {log.get('model', 'N/A')}")
