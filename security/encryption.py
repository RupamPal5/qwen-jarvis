import os
import logging
from typing import Optional
from cryptography.fernet import Fernet, InvalidToken
from pathlib import Path

logger = logging.getLogger(__name__)

class APIKeyEncryptor:
    """Handles encryption and decryption of API keys using Fernet symmetric encryption."""

    def __init__(self, encryption_key: Optional[str] = None):
        """Initialize the API key encryptor.

        Args:
            encryption_key: Optional encryption key. If not provided, will be loaded from .env
        """
        self.encryption_key = encryption_key or self._load_encryption_key()
        self.fernet = Fernet(self.encryption_key) if self.encryption_key else None

    def _load_encryption_key(self) -> Optional[str]:
        """Load encryption key from environment variable.

        Returns:
            Optional[str]: The encryption key if found, None otherwise
        """
        try:
            # Try to get encryption key from environment
            encryption_key = os.getenv("ENCRYPTION_KEY")

            if not encryption_key:
                logger.warning("ENCRYPTION_KEY not found in environment variables")
                return None

            # Ensure the key is valid
            if len(encryption_key) != 44:  # Fernet keys are 44 characters when base64 encoded
                logger.warning("Invalid ENCRYPTION_KEY length")
                return None

            return encryption_key.encode()

        except Exception as e:
            logger.error(f"Error loading encryption key: {str(e)}")
            return None

    def encrypt_api_key(self, api_key: str) -> Optional[str]:
        """Encrypt an API key.

        Args:
            api_key: The API key to encrypt

        Returns:
            Optional[str]: The encrypted API key, or None if encryption fails
        """
        if not api_key:
            return None

        if not self.fernet:
            logger.error("Cannot encrypt API key: encryption not initialized")
            return None

        try:
            encrypted = self.fernet.encrypt(api_key.encode())
            return encrypted.decode()
        except InvalidToken as e:
            logger.error(f"Invalid encryption token: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Failed to encrypt API key: {str(e)}", exc_info=True)
            return None

    def decrypt_api_key(self, encrypted_key: str) -> Optional[str]:
        """Decrypt an API key.

        Args:
            encrypted_key: The encrypted API key

        Returns:
            Optional[str]: The decrypted API key, or None if decryption fails
        """
        if not encrypted_key:
            return None

        if not self.fernet:
            logger.error("Cannot decrypt API key: encryption not initialized")
            return None

        try:
            decrypted = self.fernet.decrypt(encrypted_key.encode())
            return decrypted.decode()
        except InvalidToken as e:
            logger.error(f"Invalid encryption token during decryption: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Failed to decrypt API key: {str(e)}", exc_info=True)
            return None

    def generate_encryption_key(self) -> str:
        """Generate a new encryption key.

        Returns:
            str: The generated encryption key
        """
        return Fernet.generate_key().decode()

# Global encryptor instance
_encryptor = APIKeyEncryptor()

def get_api_key_encryptor() -> APIKeyEncryptor:
    """Get the global API key encryptor instance."""
    return _encryptor
