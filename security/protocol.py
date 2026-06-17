import logging
import hashlib
import os
import json
from typing import Dict, Optional, Any, List
from cryptography.fernet import Fernet, InvalidToken
import time
from pathlib import Path
from datetime import datetime
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class AuditEvent(BaseModel):
    """Represents an audit event in the security log."""

    timestamp: str
    event_type: str
    details: Dict[str, Any]
    severity: str = "info"
    user: Optional[str] = None
    ip_address: Optional[str] = None

class SecurityProtocol:
    """Handles security-related operations including encryption, rate limiting, and auditing."""

    def __init__(self, key_file: str = ".security_key"):
        """Initialize the security protocol.

        Args:
            key_file: Path to the file storing the encryption key
        """
        self.key_file = Path(key_file)
        self.fernet: Optional[Fernet] = None
        self.rate_limits: Dict[str, Dict[str, Any]] = {}
        self.audit_log: List[AuditEvent] = []
        self.rate_limit_window = 60  # seconds
        self.rate_limit_max_requests = 10
        self.initialize_encryption()

    def initialize_encryption(self) -> None:
        """Initialize or load encryption key.

        This creates a Fernet key for encrypting sensitive data like API keys.
        """
        try:
            if self.key_file.exists():
                with open(self.key_file, 'rb') as f:
                    key = f.read()
            else:
                # Ensure directory exists
                self.key_file.parent.mkdir(parents=True, exist_ok=True)
                key = Fernet.generate_key()
                with open(self.key_file, 'wb') as f:
                    f.write(key)

            self.fernet = Fernet(key)
            logger.info("Encryption initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize encryption: {str(e)}", exc_info=True)
            raise

    def encrypt_api_key(self, api_key: str) -> str:
        """Encrypt an API key.

        Args:
            api_key: The API key to encrypt

        Returns:
            str: The encrypted API key

        Raises:
            ValueError: If encryption fails
        """
        if not api_key:
            return ""

        try:
            encrypted = self.fernet.encrypt(api_key.encode())
            return encrypted.decode()
        except InvalidToken as e:
            logger.error(f"Invalid encryption token: {str(e)}")
            raise ValueError("Encryption token is invalid")
        except Exception as e:
            logger.error(f"Failed to encrypt API key: {str(e)}", exc_info=True)
            raise ValueError(f"Failed to encrypt API key: {str(e)}")

    def decrypt_api_key(self, encrypted_key: str) -> str:
        """Decrypt an API key.

        Args:
            encrypted_key: The encrypted API key

        Returns:
            str: The decrypted API key

        Raises:
            ValueError: If decryption fails
        """
        if not encrypted_key:
            return ""

        try:
            decrypted = self.fernet.decrypt(encrypted_key.encode())
            return decrypted.decode()
        except InvalidToken as e:
            logger.error(f"Invalid encryption token during decryption: {str(e)}")
            raise ValueError("Encryption token is invalid or data is corrupted")
        except Exception as e:
            logger.error(f"Failed to decrypt API key: {str(e)}", exc_info=True)
            raise ValueError(f"Failed to decrypt API key: {str(e)}")

    def validate_request(self, request: Dict[str, Any], client_ip: Optional[str] = None) -> bool:
        """Validate an incoming request for potential injection or malicious content.

        Args:
            request: The request data to validate
            client_ip: The client IP address for logging

        Returns:
            bool: True if request is valid, False if malicious content detected
        """
        # Check for common injection patterns
        dangerous_patterns = [
            (r'\.\./', "Directory traversal"),
            (r'--', "SQL injection"),
            (r';', "Command injection"),
            (r'<script', "XSS attempt"),
            (r'${', "Template injection"),
            (r'{{', "Template injection"),
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
            (r'BENCHMARK(', "SQL injection"),
            (r'LOAD_FILE(', "SQL injection"),
            (r'INTO OUTFILE', "SQL injection"),
            (r'javascript:', "XSS attempt"),
            (r'onerror=', "XSS attempt"),
            (r'onload=', "XSS attempt"),
            (r'vbscript:', "XSS attempt")
        ]

        # Check each value in the request
        for key, value in request.items():
            if value is None:
                continue

            value_str = str(value)

            for pattern, description in dangerous_patterns:
                if re.search(pattern, value_str, re.IGNORECASE):
                    logger.warning(f"Potential {description} detected in request field '{key}' from {client_ip or 'unknown IP'}")
                    self.log_audit_event(
                        "security_violation",
                        {
                            "type": description,
                            "field": key,
                            "value": value_str[:100],  # Truncate long values
                            "client_ip": client_ip
                        },
                        severity="high"
                    )
                    return False

        return True

    def check_rate_limit(self, resource_id: str, client_ip: str, max_requests: int = None, window_seconds: int = None) -> bool:
        """Check and enforce rate limits.

        Args:
            resource_id: The resource being accessed (e.g., model_id)
            client_ip: The client IP address
            max_requests: Maximum allowed requests in the window (default: 10)
            window_seconds: Time window in seconds (default: 60)

        Returns:
            bool: True if request is allowed, False if rate limit exceeded
        """
        if max_requests is None:
            max_requests = self.rate_limit_max_requests
        if window_seconds is None:
            window_seconds = self.rate_limit_window

        key = f"{resource_id}_{client_ip}"
        current_time = time.time()

        # Clean up old rate limit entries periodically
        if len(self.rate_limits) > 1000 and hash(key) % 100 == 0:
            self._cleanup_rate_limits()

        # Reset rate limit if window has passed
        if key in self.rate_limits and current_time - self.rate_limits[key]["last_request"] > window_seconds:
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
            wait_time = max(0, window_seconds - time_since_first)

            logger.warning(f"Rate limit exceeded for {resource_id} from {client_ip}. "
                          f"Wait {wait_time:.1f} seconds before next request.")
            self.log_audit_event(
                "rate_limit_exceeded",
                {
                    "resource_id": resource_id,
                    "client_ip": client_ip,
                    "request_count": self.rate_limits[key]["count"],
                    "max_requests": max_requests,
                    "window_seconds": window_seconds,
                    "wait_time": wait_time
                },
                severity="medium"
            )
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

    def log_audit_event(self, event_type: str, details: Dict[str, Any], severity: str = "info",
                       user: Optional[str] = None, ip_address: Optional[str] = None) -> None:
        """Log an audit event.

        Args:
            event_type: Type of the event (e.g., "security_violation", "authentication")
            details: Dictionary containing event details
            severity: Severity level (info, low, medium, high, critical)
            user: User associated with the event
            ip_address: IP address associated with the event
        """
        try:
            # Truncate large values to prevent memory issues
            safe_details = {}
            for key, value in details.items():
                if isinstance(value, str) and len(value) > 500:
                    safe_details[key] = value[:500] + "...[truncated]"
                else:
                    safe_details[key] = value

            event = AuditEvent(
                timestamp=datetime.now().isoformat(),
                event_type=event_type,
                details=safe_details,
                severity=severity,
                user=user,
                ip_address=ip_address
            )

            self.audit_log.append(event)

            # Keep audit log size reasonable
            if len(self.audit_log) > 1000:
                self.audit_log = self.audit_log[-1000:]

            # Log based on severity
            if severity == "critical":
                logger.critical(f"Audit event: {event_type} - {safe_details}")
            elif severity == "high":
                logger.error(f"Audit event: {event_type} - {safe_details}")
            elif severity == "medium":
                logger.warning(f"Audit event: {event_type} - {safe_details}")
            else:
                logger.info(f"Audit event: {event_type} - {safe_details}")

        except Exception as e:
            logger.error(f"Failed to log audit event: {str(e)}", exc_info=True)

    def get_audit_log(self, limit: int = 100, severity_filter: Optional[str] = None) -> List[AuditEvent]:
        """Get recent audit events.

        Args:
            limit: Maximum number of events to return
            severity_filter: Filter by severity level (None for all)

        Returns:
            List[AuditEvent]: List of audit events
        """
        events = self.audit_log[-limit:]

        if severity_filter:
            events = [event for event in events if event.severity == severity_filter]

        return events

    def save_audit_log(self, log_file: str = "logs/audit_log.json") -> bool:
        """Save the audit log to a file.

        Args:
            log_file: Path to the log file

        Returns:
            bool: True if save was successful, False otherwise
        """
        try:
            # Ensure logs directory exists
            log_path = Path(log_file)
            log_path.parent.mkdir(parents=True, exist_ok=True)

            # Convert to serializable format
            serializable_log = []
            for event in self.audit_log:
                serializable_log.append(event.dict())

            with open(log_path, 'w') as f:
                json.dump(serializable_log, f, indent=2)

            return True
        except Exception as e:
            logger.error(f"Failed to save audit log: {str(e)}", exc_info=True)
            return False

    def load_audit_log(self, log_file: str = "logs/audit_log.json") -> bool:
        """Load the audit log from a file.

        Args:
            log_file: Path to the log file

        Returns:
            bool: True if load was successful, False otherwise
        """
        try:
            log_path = Path(log_file)
            if not log_path.exists():
                return False

            with open(log_path, 'r') as f:
                loaded_log = json.load(f)

            # Convert back to AuditEvent objects
            self.audit_log = [AuditEvent(**event) for event in loaded_log]
            return True
        except Exception as e:
            logger.error(f"Failed to load audit log: {str(e)}", exc_info=True)
            return False

# Global security protocol instance
_security_protocol = SecurityProtocol()

def get_security_protocol() -> SecurityProtocol:
    return _security_protocol
