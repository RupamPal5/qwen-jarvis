import logging
import asyncio
import subprocess
from typing import Dict, Optional
from models.registry import ModelEntry, get_model_registry
from gateway.universal_client import get_universal_client
import time

logger = logging.getLogger(__name__)

class NetworkManager:
    def __init__(self):
        self.model_registry = get_model_registry()
        self.universal_client = None
        self.model_status = {}
        self.health_check_interval = 60  # seconds
        self.health_check_task = None

    async def initialize(self):
        """Initialize the network manager"""
        self.universal_client = await get_universal_client()
        await self.start_health_checks()

    async def start_health_checks(self):
        """Start periodic health checks for all models"""
        if self.health_check_task:
            self.health_check_task.cancel()

        self.health_check_task = asyncio.create_task(self._health_check_loop())

    async def _health_check_loop(self):
        """Periodic health check loop"""
        while True:
            try:
                await self.check_all_models()
            except Exception as e:
                logger.error(f"Health check failed: {str(e)}")

            await asyncio.sleep(self.health_check_interval)

    async def check_all_models(self):
        """Check health of all models"""
        for model_id, model in self.model_registry.models.items():
            if model.is_active:
                try:
                    start_time = time.time()
                    if model.is_local:
                        # For local models, check if Ollama is running and model is available
                        is_available = await self._check_local_model(model)
                    else:
                        # For cloud models, make a simple test request
                        is_available = await self._check_cloud_model(model)

                    latency = time.time() - start_time
                    self.model_status[model_id] = {
                        "available": is_available,
                        "latency": latency,
                        "last_checked": time.time()
                    }

                    if not is_available:
                        logger.warning(f"Model {model_id} is unavailable")
                except Exception as e:
                    logger.error(f"Error checking model {model_id}: {str(e)}")
                    self.model_status[model_id] = {
                        "available": False,
                        "latency": None,
                        "last_checked": time.time()
                    }

    async def _check_local_model(self, model: ModelEntry) -> bool:
        """Check if a local model is available"""
        try:
            # First check if Ollama is running
            try:
                result = subprocess.run(
                    ["ollama", "list"],
                    capture_output=True,
                    text=True,
                    check=True
                )
                if model.model_name not in result.stdout:
                    logger.warning(f"Local model {model.model_name} not found in Ollama")
                    return False
            except subprocess.CalledProcessError as e:
                logger.error(f"Ollama check failed: {e.stderr}")
                return False

            # Then make a simple test request
            test_request = {
                "model": model.model_name,
                "messages": [{"role": "user", "content": "Hello"}],
                "stream": False
            }

            response = await self.universal_client._call_local_model(model, test_request)
            return len(response.content) > 0

        except Exception as e:
            logger.error(f"Local model check failed for {model.model_id}: {str(e)}")
            return False

    async def _check_cloud_model(self, model: ModelEntry) -> bool:
        """Check if a cloud model is available"""
        try:
            test_request = {
                "model": model.model_name,
                "messages": [{"role": "user", "content": "Hello"}],
                "stream": False
            }

            response = await self.universal_client._call_cloud_model(model, test_request)
            return len(response.content) > 0

        except Exception as e:
            logger.error(f"Cloud model check failed for {model.model_id}: {str(e)}")
            return False

    def get_model_status(self, model_id: str) -> Optional[Dict]:
        """Get the current status of a model"""
        return self.model_status.get(model_id)

    async def download_local_model(self, model_id: str) -> bool:
        """Download a local model using Ollama"""
        model = self.model_registry.get_model(model_id)
        if not model or not model.is_local:
            logger.error(f"Model {model_id} is not a local model")
            return False

        try:
            result = subprocess.run(
                ["ollama", "pull", model.model_name],
                capture_output=True,
                text=True,
                check=True
            )
            logger.info(f"Successfully downloaded model {model.model_name}")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to download model {model.model_name}: {e.stderr}")
            return False

    async def start_local_model(self, model_id: str) -> bool:
        """Start a local model service"""
        model = self.model_registry.get_model(model_id)
        if not model or not model.is_local:
            logger.error(f"Model {model_id} is not a local model")
            return False

        try:
            # For Ollama, we just need to ensure it's running
            # The actual model is pulled on demand
            result = subprocess.run(
                ["ollama", "serve"],
                capture_output=True,
                text=True,
                check=True
            )
            logger.info(f"Ollama service started for model {model.model_name}")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to start Ollama service: {e.stderr}")
            return False

    async def stop_local_model(self, model_id: str) -> bool:
        """Stop a local model service"""
        model = self.model_registry.get_model(model_id)
        if not model or not model.is_local:
            logger.error(f"Model {model_id} is not a local model")
            return False

        try:
            # For Ollama, we can't stop individual models, so we just stop the service
            # This would affect all local models
            result = subprocess.run(
                ["ollama", "stop"],
                capture_output=True,
                text=True,
                check=True
            )
            logger.info(f"Ollama service stopped for model {model.model_name}")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to stop Ollama service: {e.stderr}")
            return False

    async def close(self):
        """Clean up network resources"""
        if self.health_check_task:
            self.health_check_task.cancel()
            try:
                await self.health_check_task
            except asyncio.CancelledError:
                pass

        if self.universal_client:
            await self.universal_client.close()

# Global network manager instance
_network_manager = NetworkManager()

async def get_network_manager() -> NetworkManager:
    await _network_manager.initialize()
    return _network_manager
