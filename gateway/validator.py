import re
import logging
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from pydantic import BaseModel, ValidationError
from models.registry import get_model_registry
from security.protocol import get_security_protocol
import time

logger = logging.getLogger(__name__)

class RateLimitTracker:
    """Track rate limits for different resources."""

    def __init__(self):
        """Initialize the rate limit tracker."""
        self.rate_limits: Dict[str, Dict[str, Any]] = {}
        self.rate_limit_window = 60  # 1 minute window
        self.chat_rate_limit = 100   # 100 requests per minute
        self.model_switch_rate_limit = 10  # 10 requests per minute

    def check_rate_limit(self, resource_id: str, client_ip: str, limit_type: str = "chat") -> bool:
        """Check and enforce rate limits.

        Args:
            resource_id: The resource being accessed (e.g., model_id)
            client_ip: The client IP address
            limit_type: Type of rate limit ("chat" or "model_switch")

        Returns:
            bool: True if request is allowed, False if rate limit exceeded
        """
        key = f"{resource_id}_{client_ip}"
        current_time = time.time()

        # Set limit based on type
        if limit_type == "chat":
            max_requests = self.chat_rate_limit
        elif limit_type == "model_switch":
            max_requests = self.model_switch_rate_limit
        else:
            max_requests = 10  # Default limit

        # Clean up old rate limit entries periodically
        if len(self.rate_limits) > 1000 and hash(key) % 100 == 0:
            self._cleanup_rate_limits()

        # Reset rate limit if window has passed
        if key in self.rate_limits and current_time - self.rate_limits[key]["last_request"] > self.rate_limit_window:
            self.rate_limits[key] = {"count": 1, "last_request": current_time, "first_request": current_time}
            return True

        # Initialize if not exists
        if key not in self.rate_limits:
            self.rate_limits[key] = {"count": 1, "last_request": current_time, "first_request": current_time}
            return True

        # Check rate limit
        if self.rate_limits[key]["count"] >= max_requests:
            # Calculate time until next allowed request
            time_since_first = current_time - self.rate_limits[key]["first_request"]
            wait_time = max(0, self.rate_limit_window - time_since_first)

            logger.warning(f"Rate limit exceeded for {resource_id} from {client_ip}. "
                          f"Wait {wait_time:.1f} seconds before next request.")
            return False

        self.rate_limits[key]["count"] += 1
        self.rate_limits[key]["last_request"] = current_time
        return True

    def _cleanup_rate_limits(self) -> None:
        """Clean up old rate limit entries to prevent memory leaks."""
        current_time = time.time()
        keys_to_delete = []

        for key, data in self.rate_limits.items():
            if current_time - data["last_request"] > self.rate_limit_window * 2:
                keys_to_delete.append(key)

        for key in keys_to_delete:
            del self.rate_limits[key]

        if keys_to_delete:
            logger.debug(f"Cleaned up {len(keys_to_delete)} old rate limit entries")

class RequestValidator:
    """Validate incoming requests for security and compliance."""

    def __init__(self):
        """Initialize the request validator."""
        self.model_registry = get_model_registry()
        self.security_protocol = get_security_protocol()
        self.rate_limiter = RateLimitTracker()
        self.dangerous_patterns = self._compile_dangerous_patterns()

    def _compile_dangerous_patterns(self) -> list:
        """Compile regex patterns for dangerous content."""
        patterns = [
            (r'\.\./', "Directory traversal"),
            (r'--', "SQL injection"),
            (r';', "Command injection"),
            (r'<script', "XSS attempt"),
            (r'\$\{', "Template injection"),
            (r'\{\{', "Template injection"),
            (r'%20', "URL encoded spaces"),
            (r'\\x', "Hex encoding"),
            (r'\\u', "Unicode encoding"),
            (r'1=1', "SQL injection"),
            (r'OR 1=1', "SQL injection"),
            (r'AND 1=1', "SQL injection"),
            (r'DROP TABLE', "SQL injection"),
            (r'EXEC ', "Command execution"),
            (r'UNION SELECT', "SQL injection"),
            (r'FROM INFORMATION_SCHEMA', "SQL injection"),
            (r'WAITFOR DELAY', "SQL injection"),
            (r'BENCHMARK\(', "SQL injection"),
            (r'LOAD_FILE\(', "SQL injection"),
            (r'INTO OUTFILE', "SQL injection"),
            (r'javascript:', "XSS attempt"),
            (r'onerror=', "XSS attempt"),
            (r'onload=', "XSS attempt"),
            (r'vbscript:', "XSS attempt"),
            (r'eval\(', "Code injection"),
            (r'exec\(', "Code injection"),
            (r'system\(', "Code injection"),
            (r'subprocess\.', "Code injection"),
            (r'os\.system', "Code injection"),
            (r'os\.popen', "Code injection"),
            (r'shell=True', "Code injection"),
            (r'import os', "Code injection"),
            (r'import subprocess', "Code injection"),
            (r'__import__', "Code injection"),
            (r'pickle\.', "Deserialization attack"),
            (r'marshal\.', "Deserialization attack"),
            (r'base64\.b64decode', "Encoding attack"),
            (r'base64\.decodestring', "Encoding attack"),
            (r'gzip\.', "Compression attack"),
            (r'zlib\.', "Compression attack"),
            (r'rm -rf', "File deletion"),
            (r':(){ :|:& };:', "Fork bomb"),
            (r'chmod 777', "Permission escalation"),
            (r'wget ', "Remote code execution"),
            (r'curl ', "Remote code execution"),
            (r'nc ', "Network attack"),
            (r'netcat', "Network attack"),
            (r'nmap', "Network scanning"),
            (r'ssh ', "SSH attack"),
            (r'ftp ', "FTP attack"),
            (r'passwd', "Password attack"),
            (r'shadow', "Password attack"),
            (r'sudo ', "Privilege escalation"),
            (r'su ', "Privilege escalation"),
            (r'python -c', "Code execution"),
            (r'bash -c', "Code execution"),
            (r'perl -e', "Code execution"),
            (r'ruby -e', "Code execution"),
            (r'php -r', "Code execution"),
            (r'node -e', "Code execution")
        ]

        return [(re.compile(pattern, re.IGNORECASE), description) for pattern, description in patterns]

    def validate_model_request(self, request_data: Dict[str, Any], client_ip: Optional[str] = None) -> Tuple[bool, str]:
        """Validate a model request.

        Args:
            request_data: The request data to validate
            client_ip: The client IP address for rate limiting

        Returns:
            Tuple[bool, str]: (is_valid, error_message)
        """
        try:
            # Validate required fields
            if not request_data.get("model"):
                return False, "Model field is required"

            if not request_data.get("messages"):
                return False, "Messages field is required"

            # Validate model exists and is active
            model_id = request_data["model"]
            model = self.model_registry.get_model(model_id)

            if not model:
                return False, f"Model {model_id} not found"

            if not model.is_active:
                return False, f"Model {model_id} is not active"

            # Check rate limit
            if client_ip and not self.rate_limiter.check_rate_limit(model_id, client_ip, "chat"):
                return False, "Rate limit exceeded. Please try again later."

            # Validate messages structure
            if not isinstance(request_data["messages"], list):
                return False, "Messages must be a list"

            for message in request_data["messages"]:
                if not isinstance(message, dict):
                    return False, "Each message must be a dictionary"

                if "role" not in message or "content" not in message:
                    return False, "Each message must have 'role' and 'content' fields"

                if not isinstance(message["content"], str):
                    return False, "Message content must be a string"

                # Validate message content for dangerous patterns
                if not self._validate_message_content(message["content"]):
                    return False, "Message content contains potentially dangerous patterns"

            # Validate optional fields
            if "temperature" in request_data:
                if not isinstance(request_data["temperature"], (int, float)):
                    return False, "Temperature must be a number"
                if not 0 <= request_data["temperature"] <= 2:
                    return False, "Temperature must be between 0 and 2"

            if "max_tokens" in request_data:
                if not isinstance(request_data["max_tokens"], int):
                    return False, "max_tokens must be an integer"
                if request_data["max_tokens"] <= 0:
                    return False, "max_tokens must be positive"

            if "stream" in request_data:
                if not isinstance(request_data["stream"], bool):
                    return False, "stream must be a boolean"

            return True, ""

        except Exception as e:
            logger.error(f"Error validating model request: {str(e)}")
            return False, f"Validation error: {str(e)}"

    def validate_model_assignment_request(self, request_data: Dict[str, Any], client_ip: Optional[str] = None) -> Tuple[bool, str]:
        """Validate a model assignment request.

        Args:
            request_data: The request data to validate
            client_ip: The client IP address for rate limiting

        Returns:
            Tuple[bool, str]: (is_valid, error_message)
        """
        try:
            # Validate required fields
            if "role" not in request_data:
                return False, "Role field is required"

            if "model_id" not in request_data:
                return False, "Model_id field is required"

            # Validate role
            role = request_data["role"]
            if role not in ["ARCHITECT", "ARBITER", "JUDGE"]:
                return False, "Role must be one of: ARCHITECT, ARBITER, JUDGE"

            # Validate model exists and is active
            model_id = request_data["model_id"]
            model = self.model_registry.get_model(model_id)

            if not model:
                return False, f"Model {model_id} not found"

            if not model.is_active:
                return False, f"Model {model_id} is not active"

            # Check rate limit
            if client_ip and not self.rate_limiter.check_rate_limit("model_assignment", client_ip, "model_switch"):
                return False, "Rate limit exceeded for model switching. Please try again later."

            return True, ""

        except Exception as e:
            logger.error(f"Error validating model assignment request: {str(e)}")
            return False, f"Validation error: {str(e)}"

    def validate_api_key(self, api_key: str, provider: str) -> bool:
        """Validate an API key format.

        Args:
            api_key: The API key to validate
            provider: The provider name

        Returns:
            bool: True if API key format is valid
        """
        if not api_key:
            return False

        # Provider-specific validation
        if provider == "openrouter":
            # OpenRouter API keys typically start with sk-or-
            return api_key.startswith("sk-or-") and len(api_key) > 20 and api_key.isalnum()
        elif provider == "gemini":
            # Gemini API keys are typically long alphanumeric strings
            return len(api_key) > 30 and re.match(r'^[a-zA-Z0-9_-]+$', api_key) is not None
        elif provider == "mistral":
            # Mistral API keys typically start with mistral-
            return api_key.startswith("mistral-") and len(api_key) > 20 and re.match(r'^[a-zA-Z0-9-]+$', api_key) is not None
        elif provider == "together":
            # Together API keys typically start with together-
            return api_key.startswith("together-") and len(api_key) > 20 and re.match(r'^[a-zA-Z0-9-]+$', api_key) is not None
        else:
            # Default validation: at least 10 characters, no dangerous characters
            return len(api_key) >= 10 and re.match(r'^[a-zA-Z0-9_-]+$', api_key) is not None

    def _validate_message_content(self, content: str) -> bool:
        """Validate message content for dangerous patterns.

        Args:
            content: The message content to validate

        Returns:
            bool: True if content is safe, False otherwise
        """
        if not content:
            return True

        for pattern, description in self.dangerous_patterns:
            if pattern.search(content):
                logger.warning(f"Potential {description} detected in message content")
                return False

        return True

    def sanitize_input(self, input_data: Any) -> Any:
        """Sanitize input data to prevent injection attacks.

        Args:
            input_data: The input data to sanitize

        Returns:
            Any: Sanitized data
        """
        if isinstance(input_data, str):
            # Remove potentially dangerous characters
            sanitized = re.sub(r'[;\|\&\$\<\>]', '', input_data)
            return sanitized[:1000]  # Limit string length
        elif isinstance(input_data, dict):
            return {k: self.sanitize_input(v) for k, v in input_data.items()}
        elif isinstance(input_data, list):
            return [self.sanitize_input(v) for v in input_data]
        else:
            return input_data

# Global validator instance
_validator = RequestValidator()

def get_request_validator() -> RequestValidator:
    """Get the global request validator instance."""
    return _validator
