import logging
import hashlib
import os
from typing import Dict, Optional
from cryptography.fernet import Fernet
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class SecurityProtocol:
    def __init__(self, key_file: str = ".security_key"):
        self.key_file = Path(key_file)
        self.fernet = None
        self.rate_limits = {}
        self.audit_log = []
        self.initialize_encryption()

    def initialize_encryption(self):
        """Initialize or load encryption key"""
        if self.key_file.exists():
            with open(self.key_file, 'rb') as f:
                key = f.read()
        else:
            key = Fernet.generate_key()
            with open(self.key_file, 'wb') as f:
                f.write(key)

        self.fernet = Fernet(key)

    def encrypt_api_key(self, api_key: str) -> str:
        """Encrypt an API key"""
        if not api_key:
            return ""

        try:
            encrypted = self.fernet.encrypt(api_key.encode())
            return encrypted.decode()
        except Exception as e:
            logger.error(f"Failed to encrypt API key: {str(e)}")
            raise

    def decrypt_api_key(self, encrypted_key: str) -> str:
        """Decrypt an API key"""
        if not encrypted_key:
            return ""

        try:
            decrypted = self.fernet.decrypt(encrypted_key.encode())
            return decrypted.decode()
        except Exception as e:
            logger.error(f"Failed to decrypt API key: {str(e)}")
            raise

    def validate_request(self, request: Dict) -> bool:
        """Validate an incoming request for potential injection"""
        # Check for common injection patterns
        dangerous_patterns = [
            r'\.\./',  # Directory traversal
            r'--',     # SQL injection
            r';',      # Command injection
            r'<script', # XSS
            r'${',     # Template injection
            r'{{',     # Template injection
            r'%20'     # URL encoded spaces
        ]

        for pattern in dangerous_patterns:
            if any(pattern in str(value) for value in request.values()):
                logger.warning(f"Potential injection attempt detected: {request}")
                return False

        return True

    def check_rate_limit(self, model_id: str, client_ip: str) -> bool:
        """Check and enforce rate limits"""
        key = f"{model_id}_{client_ip}"
        current_time = time.time()

        # Reset rate limit if it's been more than 1 minute
        if key in self.rate_limits and current_time - self.rate_limits[key]["last_request"] > 60:
            self.rate_limits[key] = {"count": 1, "last_request": current_time}
            return True

        # Initialize if not exists
        if key not in self.rate_limits:
            self.rate_limits[key] = {"count": 1, "last_request": current_time}
            return True

        # Check rate limit (5 requests per minute)
        if self.rate_limits[key]["count"] >= 5:
            logger.warning(f"Rate limit exceeded for {model_id} from {client_ip}")
            return False

        self.rate_limits[key]["count"] += 1
        self.rate_limits[key]["last_request"] = current_time
        return True

    def log_audit_event(self, event_type: str, details: Dict):
        """Log an audit event"""
        timestamp = time.time()
        event = {
            "timestamp": timestamp,
            "type": event_type,
            "details": details
        }
        self.audit_log.append(event)

        # Keep audit log size reasonable
        if len(self.audit_log) > 1000:
            self.audit_log = self.audit_log[-1000:]

        logger.info(f"Audit event: {event_type} - {details}")

    def get_audit_log(self, limit: int = 100) -> list:
        """Get recent audit events"""
        return self.audit_log[-limit:]

# Global security protocol instance
_security_protocol = SecurityProtocol()

def get_security_protocol() -> SecurityProtocol:
    return _security_protocol
