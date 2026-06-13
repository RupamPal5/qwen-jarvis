from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, SimpleSpanProcessor
from opentelemetry.trace import Status, StatusCode
import json
from datetime import datetime
import os

# Setup tracing
LOG_DIR = os.path.expanduser("~/jarvis_sovereign/logs")
os.makedirs(LOG_DIR, exist_ok=True)

# Configure tracer
provider = TracerProvider()
processor = SimpleSpanProcessor(ConsoleSpanExporter())
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

tracer = trace.get_tracer("jarvis.flight_recorder")

class FlightRecorder:
    def __init__(self):
        self.log_file = os.path.join(LOG_DIR, "flight_log.jsonl")
    
    def record_llm_call(self, model, prompt, response, duration_ms):
        """Record every LLM interaction"""
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "type": "llm_call",
            "model": model,
            "prompt_length": len(prompt),
            "response_length": len(response),
            "duration_ms": duration_ms,
            "status": "success"
        }
        
        with open(self.log_file, "a") as f:
            f.write(json.dumps(entry) + "\n")
    
    def record_error(self, error_type, error_msg, context):
        """Record errors for debugging"""
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "type": "error",
            "error_type": error_type,
            "error_msg": error_msg,
            "context": context
        }
        
        with open(self.log_file, "a") as f:
            f.write(json.dumps(entry) + "\n")
    
    def get_recent_logs(self, n=10):
        """Get last N log entries"""
        if not os.path.exists(self.log_file):
            return []
        
        with open(self.log_file, "r") as f:
            lines = f.readlines()
            return [json.loads(line) for line in lines[-n:]]

# Global instance
recorder = FlightRecorder()

def trace_llm_call(model_name):
    """Decorator to trace LLM calls"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            with tracer.start_as_current_span(f"llm.{model_name}") as span:
                span.set_attribute("model", model_name)
                span.set_attribute("timestamp", datetime.utcnow().isoformat())
                
                start_time = datetime.now()
                try:
                    result = func(*args, **kwargs)
                    duration = (datetime.now() - start_time).total_seconds() * 1000
                    
                    span.set_attribute("duration_ms", duration)
                    span.set_status(Status(StatusCode.OK))
                    
                    # Record to flight log
                    if result:
                        recorder.record_llm_call(
                            model=model_name,
                            prompt=str(args[0]) if args else "",
                            response=str(result)[:500],  # First 500 chars
                            duration_ms=duration
                        )
                    
                    return result
                except Exception as e:
                    span.set_status(Status(StatusCode.ERROR))
                    span.record_exception(e)
                    recorder.record_error(
                        error_type=type(e).__name__,
                        error_msg=str(e),
                        context={"model": model_name}
                    )
                    raise
        return wrapper
    return decorator
