import yaml
from pathlib import Path
from typing import Dict, List, Optional, Union
from pydantic import BaseModel, Field
import logging

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
            "llama3.2:3b": {
                "provider": "ollama",
                "model_name": "llama3.2:3b",
                "context_window": 8000,
                "speed_rating": 9,
                "is_local": True
            },
            "deepseek-r1:8b": {
                "provider": "ollama",
                "model_name": "deepseek-r1:8b",
                "context_window": 16000,
                "speed_rating": 6,
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
import yaml
from pathlib import Path
from typing import Dict, List, Optional, Union
from pydantic import BaseModel, Field
import logging

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
import yaml
from pathlib import Path
from typing import Dict, List, Optional, Union
from pydantic import BaseModel, Field
import logging

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
                "endpoint": "http://localhost:11434",
                "context_window": 32000,
                "speed_rating": 7,
                "is_local": True
            },
            "qwen2.5:1.5b": {
                "provider": "ollama",
                "model_name": "qwen2.5:1.5b",
                "endpoint": "http://localhost:11434",
                "context_window": 32000,
                "speed_rating": 8,
                "is_local": True
            },
            "qwen2.5-coder:32b": {
                "provider": "ollama",
                "model_name": "qwen2.5-coder:32b",
                "endpoint": "http://localhost:11434",
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
