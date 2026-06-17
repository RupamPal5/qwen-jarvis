import yaml
from pathlib import Path
from typing import Dict, List, Optional, Union, Any
from pydantic import BaseModel, Field, validator
import logging
import os
from security.encryption import get_api_key_encryptor

logger = logging.getLogger(__name__)

class ModelEntry(BaseModel):
    """Represents a model configuration in the registry."""

    model_id: str = Field(..., description="Unique identifier for the model")
    provider: str = Field(..., description="Provider type: ollama, openrouter, gemini, mistral, etc.")
    model_name: str = Field(..., description="Actual model name/identifier")
    api_key: Optional[str] = Field(None, description="API key if required")
    endpoint: Optional[str] = Field(None, description="API endpoint URL")
    context_window: int = Field(..., description="Context window in tokens")
    speed_rating: int = Field(..., ge=1, le=10, description="Speed rating (1-10, 10 being fastest)")
    is_local: bool = Field(False, description="Whether the model runs locally")
    is_active: bool = Field(True, description="Whether the model is currently active")

    @validator('speed_rating')
    def validate_speed_rating(cls, v: int) -> int:
        """Validate that speed rating is between 1 and 10."""
        if not 1 <= v <= 10:
            raise ValueError("Speed rating must be between 1 and 10")
        return v

    @validator('provider')
    def validate_provider(cls, v: str) -> str:
        """Validate that provider is supported."""
        supported_providers = ['ollama', 'openrouter', 'gemini', 'mistral', 'together']
        if v.lower() not in supported_providers:
            logger.warning(f"Unsupported provider: {v}. Supported providers are: {supported_providers}")
        return v.lower()

class ModelRegistry:
    """Manages the registry of available models and their configurations."""

    def __init__(self, config_path: str = "config/models.yaml"):
        """Initialize the model registry.

        Args:
            config_path: Path to the YAML configuration file
        """
        self.config_path = Path(config_path)
        self.models: Dict[str, ModelEntry] = {}
        self.load_registry()

    def load_registry(self) -> None:
        """Load model registry from YAML file or initialize with defaults if not found."""
        try:
            if not self.config_path.exists():
                logger.warning(f"Model registry config not found at {self.config_path}. Using defaults.")
                self.initialize_defaults()
                return

            with open(self.config_path, 'r') as f:
                config = yaml.safe_load(f) or {}

            # Ensure models section exists
            if "models" not in config:
                logger.warning("No 'models' section found in config. Using defaults.")
                self.initialize_defaults()
                return

            # Validate and load models
            models_data = config.get("models", {})
            self.models = {}
            encryptor = get_api_key_encryptor()

            for model_id, model_data in models_data.items():
                try:
                    # Ensure model_id is included in the model data
                    if "model_id" not in model_data:
                        model_data["model_id"] = model_id

                    # Decrypt API key if present
                    if "api_key" in model_data and model_data["api_key"]:
                        try:
                            decrypted_key = encryptor.decrypt_api_key(model_data["api_key"])
                            if decrypted_key:
                                model_data["api_key"] = decrypted_key
                            else:
                                logger.warning(f"Failed to decrypt API key for model {model_id}, setting to None")
                                model_data["api_key"] = None
                        except Exception as e:
                            logger.error(f"Failed to decrypt API key for model {model_id}: {str(e)}")
                            model_data["api_key"] = None

                    self.models[model_id] = ModelEntry(**model_data)
                except Exception as e:
                    logger.error(f"Failed to load model {model_id}: {str(e)}")
                    continue

            logger.info(f"Loaded {len(self.models)} models from registry")
        except yaml.YAMLError as e:
            logger.error(f"YAML parsing error in model registry: {str(e)}")
            self.initialize_defaults()
        except Exception as e:
            logger.error(f"Failed to load model registry: {str(e)}", exc_info=True)
            self.initialize_defaults()

    def initialize_defaults(self) -> None:
        """Initialize with default models if config is missing or invalid."""
        default_models = {
            # Ollama models
            "qwen2.5-coder:7b": {
                "provider": "ollama",
                "model_name": "qwen2.5-coder:7b",
                "endpoint": "http://localhost:11434",
                "context_window": 32000,
                "speed_rating": 7,
                "is_local": True,
                "is_active": True
            },
            "qwen2.5:1.5b": {
                "provider": "ollama",
                "model_name": "qwen2.5:1.5b",
                "endpoint": "http://localhost:11434",
                "context_window": 32000,
                "speed_rating": 8,
                "is_local": True,
                "is_active": True
            },
            "qwen2.5-coder:32b": {
                "provider": "ollama",
                "model_name": "qwen2.5-coder:32b",
                "endpoint": "http://localhost:11434",
                "context_window": 32000,
                "speed_rating": 5,
                "is_local": True,
                "is_active": True
            },
            "llama3.2:3b": {
                "provider": "ollama",
                "model_name": "llama3.2:3b",
                "endpoint": "http://localhost:11434",
                "context_window": 8000,
                "speed_rating": 9,
                "is_local": True,
                "is_active": True
            },
            "deepseek-r1:8b": {
                "provider": "ollama",
                "model_name": "deepseek-r1:8b",
                "endpoint": "http://localhost:11434",
                "context_window": 16000,
                "speed_rating": 6,
                "is_local": True,
                "is_active": True
            },

            # Cloud API models
            "gemini-2.5-flash": {
                "provider": "gemini",
                "model_name": "gemini-1.5-flash-latest",
                "api_key": os.getenv("GEMINI_API_KEY"),
                "context_window": 1000000,
                "speed_rating": 4,
                "is_local": False,
                "is_active": True
            },
            "mistral-codestral": {
                "provider": "mistral",
                "model_name": "codestral-latest",
                "api_key": os.getenv("MISTRAL_API_KEY"),
                "context_window": 32000,
                "speed_rating": 5,
                "is_local": False,
                "is_active": True
            },
            "llama-3.3-70b": {
                "provider": "together",
                "model_name": "meta-llama/Llama-3.3-70b-chat-hf",
                "api_key": os.getenv("TOGETHER_API_KEY"),
                "context_window": 8000,
                "speed_rating": 3,
                "is_local": False,
                "is_active": True
            }
        }

        self.models = {}
        for model_id, model_data in default_models.items():
            try:
                self.models[model_id] = ModelEntry(
                    model_id=model_id,
                    **model_data
                )
            except Exception as e:
                logger.error(f"Failed to create default model {model_id}: {str(e)}")
                continue

    def save_registry(self) -> bool:
        """Save current registry to YAML file with encrypted API keys.

        Returns:
            bool: True if save was successful, False otherwise
        """
        try:
            # Ensure config directory exists
            self.config_path.parent.mkdir(parents=True, exist_ok=True)

            encryptor = get_api_key_encryptor()
            config = {"models": {}}

            for model_id, model in self.models.items():
                # Create a copy of the model data to avoid modifying the original
                model_data = model.dict(exclude={"model_id"})

                # Encrypt API key if present
                if "api_key" in model_data and model_data["api_key"]:
                    try:
                        encrypted_key = encryptor.encrypt_api_key(model_data["api_key"])
                        if encrypted_key:
                            model_data["api_key"] = encrypted_key
                        else:
                            logger.warning(f"Failed to encrypt API key for model {model_id}, setting to None")
                            model_data["api_key"] = None
                    except Exception as e:
                        logger.error(f"Failed to encrypt API key for model {model_id}: {str(e)}")
                        model_data["api_key"] = None

                config["models"][model_id] = model_data

            with open(self.config_path, 'w') as f:
                yaml.dump(config, f, sort_keys=False)

            logger.info(f"Saved model registry with {len(self.models)} models")
            return True
        except Exception as e:
            logger.error(f"Failed to save model registry: {str(e)}", exc_info=True)
            return False

    def add_model(self, model: ModelEntry) -> bool:
        """Add a new model to the registry with encrypted API key.

        Args:
            model: ModelEntry object to add

        Returns:
            bool: True if model was added successfully, False otherwise
        """
        if model.model_id in self.models:
            logger.warning(f"Model {model.model_id} already exists in registry")
            return False

        try:
            # Create a copy to avoid modifying the original
            model_copy = model.copy()

            # Encrypt API key if present
            if model_copy.api_key:
                encryptor = get_api_key_encryptor()
                encrypted_key = encryptor.encrypt_api_key(model_copy.api_key)
                if encrypted_key:
                    model_copy.api_key = encrypted_key
                else:
                    logger.warning(f"Failed to encrypt API key for model {model.model_id}, setting to None")
                    model_copy.api_key = None

            self.models[model.model_id] = model_copy
            return self.save_registry()
        except Exception as e:
            logger.error(f"Failed to add model {model.model_id}: {str(e)}")
            return False

    def update_model(self, model_id: str, updates: Dict[str, Any]) -> bool:
        """Update an existing model in the registry with encrypted API key.

        Args:
            model_id: ID of the model to update
            updates: Dictionary of updates to apply

        Returns:
            bool: True if model was updated successfully, False otherwise
        """
        if model_id not in self.models:
            logger.warning(f"Model {model_id} not found in registry")
            return False

        try:
            model = self.models[model_id]

            # Handle API key update specially to ensure encryption
            if "api_key" in updates:
                encryptor = get_api_key_encryptor()
                if updates["api_key"]:
                    encrypted_key = encryptor.encrypt_api_key(updates["api_key"])
                    if encrypted_key:
                        setattr(model, "api_key", encrypted_key)
                    else:
                        logger.warning(f"Failed to encrypt API key for model {model_id}, keeping existing value")
                else:
                    setattr(model, "api_key", None)
                del updates["api_key"]  # Remove so we don't process it again

            # Apply other updates
            for key, value in updates.items():
                if hasattr(model, key):
                    setattr(model, key, value)

            return self.save_registry()
        except Exception as e:
            logger.error(f"Failed to update model {model_id}: {str(e)}")
            return False

    def remove_model(self, model_id: str) -> bool:
        """Remove a model from the registry.

        Args:
            model_id: ID of the model to remove

        Returns:
            bool: True if model was removed successfully, False otherwise
        """
        if model_id not in self.models:
            logger.warning(f"Model {model_id} not found in registry")
            return False

        try:
            del self.models[model_id]
            return self.save_registry()
        except Exception as e:
            logger.error(f"Failed to remove model {model_id}: {str(e)}")
            return False

    def get_model(self, model_id: str) -> Optional[ModelEntry]:
        """Get a model by ID.

        Args:
            model_id: ID of the model to retrieve

        Returns:
            Optional[ModelEntry]: The model if found, None otherwise
        """
        return self.models.get(model_id)

    def get_models_by_provider(self, provider: str) -> List[ModelEntry]:
        """Get all models for a specific provider.

        Args:
            provider: Provider name to filter by

        Returns:
            List[ModelEntry]: List of models from the specified provider
        """
        return [model for model in self.models.values() if model.provider == provider]

    def get_active_models(self) -> List[ModelEntry]:
        """Get all active models.

        Returns:
            List[ModelEntry]: List of active models
        """
        return [model for model in self.models.values() if model.is_active]

    def get_local_models(self) -> List[ModelEntry]:
        """Get all local models.

        Returns:
            List[ModelEntry]: List of local models
        """
        return [model for model in self.models.values() if model.is_local]

    def get_cloud_models(self) -> List[ModelEntry]:
        """Get all cloud models.

        Returns:
            List[ModelEntry]: List of cloud models
        """
        return [model for model in self.models.values() if not model.is_local]

    def enable_model(self, model_id: str) -> bool:
        """Enable a model in the registry.

        Args:
            model_id: ID of the model to enable

        Returns:
            bool: True if model was enabled successfully, False otherwise
        """
        if model_id not in self.models:
            logger.warning(f"Model {model_id} not found in registry")
            return False

        try:
            self.models[model_id].is_active = True
            return self.save_registry()
        except Exception as e:
            logger.error(f"Failed to enable model {model_id}: {str(e)}")
            return False

    def disable_model(self, model_id: str) -> bool:
        """Disable a model in the registry.

        Args:
            model_id: ID of the model to disable

        Returns:
            bool: True if model was disabled successfully, False otherwise
        """
        if model_id not in self.models:
            logger.warning(f"Model {model_id} not found in registry")
            return False

        try:
            self.models[model_id].is_active = False
            return self.save_registry()
        except Exception as e:
            logger.error(f"Failed to disable model {model_id}: {str(e)}")
            return False

# Global registry instance
_model_registry = ModelRegistry()

def get_model_registry() -> ModelRegistry:
    return _model_registry

logger = logging.getLogger(__name__)

class ModelEntry(BaseModel):
    model_id: str = Field(..., description="Unique identifier for the model")
    provider: str = Field(..., description="Provider type: ollama, openrouter, gemini, mistral, etc.")
    model_name: str = Field(..., description="Actual model name/identifier")
    api_key: Optional[str] = Field(None, description="API key if required")
    endpoint: Optional[str] = Field(None, description="API endpoint URL")
    context_window: int = Field(..., description="Context window in tokens")
    speed_rating: int = Field(..., description="Speed rating (1-10, 10 being fastest)")
    is_local: bool = Field(False, description="Whether the model runs locally")
    is_active: bool = Field(True, description="Whether the model is currently active")

class ModelRegistry:
    def __init__(self, config_path: str = "config/models.yaml"):
        self.config_path = Path(config_path)
        self.models: Dict[str, ModelEntry] = {}
        self.load_registry()

    def load_registry(self):
        """Load model registry from YAML file"""
        try:
            if not self.config_path.exists():
                logger.warning(f"Model registry config not found at {self.config_path}. Using defaults.")
                self.initialize_defaults()
                return

            with open(self.config_path, 'r') as f:
                config = yaml.safe_load(f) or {}

            self.models = {
                model_id: ModelEntry(**model_data)
                for model_id, model_data in config.get("models", {}).items()
            }

            logger.info(f"Loaded {len(self.models)} models from registry")
        except Exception as e:
            logger.error(f"Failed to load model registry: {str(e)}")
            self.initialize_defaults()

    def initialize_defaults(self):
        """Initialize with default models if config is missing"""
        default_models = {
            # Ollama models
            "qwen2.5-coder:7b": {
                "provider": "ollama",
                "model_name": "qwen2.5-coder:7b",
                "context_window": 32000,
                "speed_rating": 7,
                "is_local": True
            },
            "qwen2.5:1.5b": {
                "provider": "ollama",
                "model_name": "qwen2.5:1.5b",
                "context_window": 32000,
                "speed_rating": 8,
                "is_local": True
            },
            "qwen2.5-coder:32b": {
                "provider": "ollama",
                "model_name": "qwen2.5-coder:32b",
                "context_window": 32000,
                "speed_rating": 5,
                "is_local": True
            },

            # Cloud API models
            "gemini-2.5-flash": {
                "provider": "gemini",
                "model_name": "gemini-1.5-flash-latest",
                "context_window": 1000000,
                "speed_rating": 4,
                "is_local": False
            },
            "mistral-codestral": {
                "provider": "mistral",
                "model_name": "codestral-latest",
                "context_window": 32000,
                "speed_rating": 5,
                "is_local": False
            },
            "llama-3.3-70b": {
                "provider": "together",
                "model_name": "meta-llama/Llama-3.3-70b-chat-hf",
                "context_window": 8000,
                "speed_rating": 3,
                "is_local": False
            }
        }

        self.models = {
            model_id: ModelEntry(
                model_id=model_id,
                **model_data
            )
            for model_id, model_data in default_models.items()
        }

    def save_registry(self):
        """Save current registry to YAML file"""
        try:
            config = {
                "models": {
                    model_id: model.dict(exclude={"model_id"})
                    for model_id, model in self.models.items()
                }
            }

            with open(self.config_path, 'w') as f:
                yaml.dump(config, f)

            logger.info(f"Saved model registry with {len(self.models)} models")
        except Exception as e:
            logger.error(f"Failed to save model registry: {str(e)}")

    def add_model(self, model: ModelEntry) -> bool:
        """Add a new model to the registry"""
        if model.model_id in self.models:
            logger.warning(f"Model {model.model_id} already exists in registry")
            return False

        self.models[model.model_id] = model
        self.save_registry()
        return True

    def update_model(self, model_id: str, updates: Dict) -> bool:
        """Update an existing model in the registry"""
        if model_id not in self.models:
            logger.warning(f"Model {model_id} not found in registry")
            return False

        model = self.models[model_id]
        for key, value in updates.items():
            if hasattr(model, key):
                setattr(model, key, value)

        self.save_registry()
        return True

    def remove_model(self, model_id: str) -> bool:
        """Remove a model from the registry"""
        if model_id not in self.models:
            logger.warning(f"Model {model_id} not found in registry")
            return False

        del self.models[model_id]
        self.save_registry()
        return True

    def get_model(self, model_id: str) -> Optional[ModelEntry]:
        """Get a model by ID"""
        return self.models.get(model_id)

    def get_models_by_provider(self, provider: str) -> List[ModelEntry]:
        """Get all models for a specific provider"""
        return [model for model in self.models.values() if model.provider == provider]

    def get_active_models(self) -> List[ModelEntry]:
        """Get all active models"""
        return [model for model in self.models.values() if model.is_active]

    def get_local_models(self) -> List[ModelEntry]:
        """Get all local models"""
        return [model for model in self.models.values() if model.is_local]

    def get_cloud_models(self) -> List[ModelEntry]:
        """Get all cloud models"""
        return [model for model in self.models.values() if not model.is_local]

# Global registry instance
_model_registry = ModelRegistry()

def get_model_registry() -> ModelRegistry:
    return _model_registry
