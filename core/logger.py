import logging
import logging.handlers
import json
import os
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime
import socket
import platform
import getpass

class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging."""

    def __init__(self):
        super().__init__()
        self.hostname = socket.gethostname()
        self.username = getpass.getuser()
        self.system = platform.system()
        self.release = platform.release()

    def format(self, record: logging.LogRecord) -> str:
        """Format the log record as JSON."""
        log_data = {
            "timestamp": datetime.fromtimestamp(record.created).isoformat(),
            "level": record.levelname,
            "name": record.name,
            "message": record.getMessage(),
            "host": self.hostname,
            "user": self.username,
            "system": self.system,
            "release": self.release,
            "pid": os.getpid(),
            "thread": record.threadName,
            "thread_id": record.thread,
            "process": record.processName,
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }

        # Add exception info if available
        if record.exc_info:
            log_data["exception"] = {
                "type": record.exc_info[0].__name__ if record.exc_info[0] else None,
                "message": str(record.exc_info[1]) if record.exc_info[1] else None,
                "traceback": self.formatException(record.exc_info)
            }

        # Add any custom attributes
        for key, value in record.__dict__.items():
            if key not in log_data and key not in ["msg", "args", "exc_info"]:
                log_data[key] = value

        return json.dumps(log_data)

class LoggerManager:
    """Manages structured JSON logging for the entire application."""

    def __init__(self):
        """Initialize the logger manager."""
        self.log_dir = Path("logs")
        self.log_dir.mkdir(exist_ok=True)

        # Configure root logger
        self._configure_root_logger()

        # Configure specific loggers
        self._configure_specific_loggers()

    def _configure_root_logger(self) -> None:
        """Configure the root logger with JSON formatting and rotation."""
        root_logger = logging.getLogger()
        root_logger.setLevel(logging.INFO)

        # Remove any existing handlers
        for handler in root_logger.handlers[:]:
            root_logger.removeHandler(handler)

        # Create console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        console_handler.setFormatter(console_formatter)
        root_logger.addHandler(console_handler)

        # Create JSON file handler with rotation
        json_handler = logging.handlers.TimedRotatingFileHandler(
            self.log_dir / "jarvis.json.log",
            when="midnight",
            interval=1,
            backupCount=7,
            encoding="utf-8"
        )
        json_handler.setLevel(logging.INFO)
        json_handler.setFormatter(JSONFormatter())
        json_handler.suffix = "%Y-%m-%d"
        root_logger.addHandler(json_handler)

        # Create error file handler
        error_handler = logging.handlers.RotatingFileHandler(
            self.log_dir / "errors.log",
            maxBytes=10_000_000,
            backupCount=5,
            encoding="utf-8"
        )
        error_handler.setLevel(logging.ERROR)
        error_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        error_handler.setFormatter(error_formatter)
        root_logger.addHandler(error_handler)

    def _configure_specific_loggers(self) -> None:
        """Configure specific loggers for different components."""
        # Model registry logger
        model_logger = logging.getLogger("models.registry")
        model_logger.setLevel(logging.INFO)

        # Consensus engine logger
        consensus_logger = logging.getLogger("core.consensus_v2")
        consensus_logger.setLevel(logging.INFO)

        # Network manager logger
        network_logger = logging.getLogger("core.network_manager")
        network_logger.setLevel(logging.INFO)

        # Security logger
        security_logger = logging.getLogger("security")
        security_logger.setLevel(logging.INFO)

        # API logger
        api_logger = logging.getLogger("uvicorn.access")
        api_logger.setLevel(logging.INFO)
        api_logger.propagate = False

        # Add JSON handler to API logger
        json_handler = logging.handlers.TimedRotatingFileHandler(
            self.log_dir / "api.json.log",
            when="midnight",
            interval=1,
            backupCount=7,
            encoding="utf-8"
        )
        json_handler.setLevel(logging.INFO)
        json_handler.setFormatter(JSONFormatter())
        json_handler.suffix = "%Y-%m-%d"
        api_logger.addHandler(json_handler)

    def log_event(self, event_type: str, event_data: Dict[str, Any], level: str = "info") -> None:
        """Log a custom event with structured data.

        Args:
            event_type: The type of event (e.g., "model_assignment", "consensus_execution")
            event_data: Dictionary containing event-specific data
            level: The log level (info, warning, error, etc.)
        """
        logger = logging.getLogger("jarvis.events")

        log_data = {
            "event_type": event_type,
            "event_data": event_data,
            "timestamp": datetime.now().isoformat()
        }

        if level.lower() == "info":
            logger.info("Custom event", extra=log_data)
        elif level.lower() == "warning":
            logger.warning("Custom event", extra=log_data)
        elif level.lower() == "error":
            logger.error("Custom event", extra=log_data)
        elif level.lower() == "debug":
            logger.debug("Custom event", extra=log_data)
        else:
            logger.info("Custom event", extra=log_data)

    def log_model_assignment(self, role: str, model_id: str, previous_model: Optional[str] = None) -> None:
        """Log a model assignment event."""
        event_data = {
            "role": role,
            "model_id": model_id,
            "previous_model": previous_model
        }
        self.log_event("model_assignment", event_data)

    def log_consensus_execution(self, request_id: str, status: str, duration: float,
                              models_used: Dict[str, str], error: Optional[str] = None) -> None:
        """Log a consensus execution event."""
        event_data = {
            "request_id": request_id,
            "status": status,
            "duration": duration,
            "models_used": models_used,
            "error": error
        }
        self.log_event("consensus_execution", event_data)

    def log_api_request(self, endpoint: str, method: str, status_code: int,
                       duration: float, client_ip: str, user_agent: Optional[str] = None) -> None:
        """Log an API request event."""
        event_data = {
            "endpoint": endpoint,
            "method": method,
            "status_code": status_code,
            "duration": duration,
            "client_ip": client_ip,
            "user_agent": user_agent
        }
        self.log_event("api_request", event_data)

    def log_health_check(self, service: str, status: str, latency: Optional[float] = None,
                        error: Optional[str] = None) -> None:
        """Log a health check event."""
        event_data = {
            "service": service,
            "status": status,
            "latency": latency,
            "error": error
        }
        self.log_event("health_check", event_data)

# Global logger manager instance
_logger_manager = LoggerManager()

def get_logger_manager() -> LoggerManager:
    """Get the global logger manager instance."""
    return _logger_manager
