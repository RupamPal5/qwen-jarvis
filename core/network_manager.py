import logging
import asyncio
import subprocess
import socket
from typing import Dict, Optional, Any, List
from models.registry import ModelEntry, get_model_registry
from gateway.universal_client import get_universal_client, ModelRequest
import time
from datetime import datetime
from pydantic import BaseModel
from core.error_handler import get_error_handler

logger = logging.getLogger(__name__)

class ModelStatus(BaseModel):
    """Represents the status of a model."""

    available: bool
    latency: Optional[float] = None
    last_checked: Optional[str] = None
    error: Optional[str] = None
    consecutive_failures: int = 0
    last_success: Optional[str] = None
    is_disabled: bool = False
    disabled_until: Optional[str] = None

class NetworkManager:
    """Manages network connectivity and health monitoring for all models."""

    def __init__(self):
        """Initialize the network manager."""
        self.model_registry = get_model_registry()
        self.universal_client = None
        self.model_status: Dict[str, ModelStatus] = {}
        self.health_check_interval = 60  # seconds
        self.health_check_task: Optional[asyncio.Task] = None
        self.max_consecutive_failures = 3
        self.recovery_cooldown = 120  # seconds
        self.health_metrics: List[Dict[str, Any]] = []
        self.performance_metrics: Dict[str, Dict] = {}  # model_id -> performance metrics
        self.last_metrics_collection = time.time()

    async def initialize(self) -> None:
        """Initialize the network manager with required resources.

        This must be called before using the network manager.
        """
        try:
            self.universal_client = await get_universal_client()
            await self.start_health_checks()
            logger.info("Network manager initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize network manager: {str(e)}")
            raise

    async def start_health_checks(self) -> None:
        """Start periodic health checks for all models."""
        if self.health_check_task:
            self.health_check_task.cancel()
            try:
                await self.health_check_task
            except asyncio.CancelledError:
                pass
            except Exception as e:
                logger.error(f"Error cancelling existing health check task: {str(e)}")

        self.health_check_task = asyncio.create_task(self._health_check_loop())

    async def _health_check_loop(self) -> None:
        """Periodic health check loop that runs indefinitely."""
        logger.info("Starting health check loop")
        while True:
            try:
                await self.check_all_models()
            except asyncio.CancelledError:
                logger.info("Health check loop cancelled")
                break
            except Exception as e:
                logger.error(f"Health check failed: {str(e)}", exc_info=True)

            try:
                await asyncio.sleep(self.health_check_interval)
            except asyncio.CancelledError:
                logger.info("Health check loop cancelled during sleep")
                break

    async def check_all_models(self) -> None:
        """Check health of all active models and update their status."""
        logger.debug("Starting health check for all models")
        check_start = time.time()

        # Group models by provider to optimize health checks
        models_by_provider = self._group_models_by_provider()

        # Check models in parallel by provider
        tasks = []
        for provider, models in models_by_provider.items():
            tasks.append(self._check_models_for_provider(provider, models))

        await asyncio.gather(*tasks)

        check_duration = time.time() - check_start
        logger.debug(f"Completed health check for all models in {check_duration:.2f} seconds")

        # Check for models that can be re-enabled
        await self._check_model_recovery()

    def _group_models_by_provider(self) -> Dict[str, List[ModelEntry]]:
        """Group active models by provider for optimized health checking."""
        models_by_provider: Dict[str, List[ModelEntry]] = {}

        for model_id, model in self.model_registry.models.items():
            if not model.is_active:
                continue

            if model.provider not in models_by_provider:
                models_by_provider[model.provider] = []
            models_by_provider[model.provider].append(model)

        return models_by_provider

    async def _check_models_for_provider(self, provider: str, models: List[ModelEntry]) -> None:
        """Check health of models for a specific provider."""
        for model in models:
            try:
                start_time = time.time()
                status = await self._check_model_health(model)
                latency = time.time() - start_time

                # Update model status
                if model.model_id not in self.model_status:
                    self.model_status[model.model_id] = ModelStatus(
                        available=status["available"],
                        latency=latency,
                        last_checked=datetime.now().isoformat(),
                        error=status.get("error"),
                        consecutive_failures=0 if status["available"] else 1
                    )
                else:
                    current_status = self.model_status[model.model_id]
                    if status["available"]:
                        current_status.available = True
                        current_status.latency = latency
                        current_status.last_checked = datetime.now().isoformat()
                        current_status.error = None
                        current_status.consecutive_failures = 0
                        current_status.last_success = datetime.now().isoformat()
                        current_status.is_disabled = False
                        current_status.disabled_until = None
                    else:
                        current_status.available = False
                        current_status.latency = latency
                        current_status.last_checked = datetime.now().isoformat()
                        current_status.error = status.get("error")
                        current_status.consecutive_failures += 1

                        # Auto-disable after too many failures
                        if (current_status.consecutive_failures >= self.max_consecutive_failures and
                            not current_status.is_disabled):
                            current_status.is_disabled = True
                            current_status.disabled_until = datetime.now().isoformat()
                            logger.warning(f"Auto-disabling model {model.model_id} after {self.max_consecutive_failures} consecutive failures")

                # Record metrics
                self._record_health_metrics(model.model_id, status["available"], latency, status.get("error"))

            except Exception as e:
                logger.error(f"Error checking model {model.model_id}: {str(e)}", exc_info=True)
                if model.model_id in self.model_status:
                    current_status = self.model_status[model.model_id]
                    current_status.available = False
                    current_status.last_checked = datetime.now().isoformat()
                    current_status.error = str(e)
                    current_status.consecutive_failures += 1
                else:
                    self.model_status[model.model_id] = ModelStatus(
                        available=False,
                        last_checked=datetime.now().isoformat(),
                        error=str(e),
                        consecutive_failures=1
                    )

    async def _check_local_model(self, model: ModelEntry) -> Dict[str, Any]:
        """Check if a local model is available with error handling.

        Args:
            model: The local model to check

        Returns:
            Dict[str, Any]: Dictionary containing 'available' status and optional 'error'
        """
        try:
            # First check if Ollama is running by testing the port
            if not await self._check_port_open("localhost", 11434):
                return {"available": False, "error": "Ollama service not running (port 11434 not open)"}

            # Then check if the model is available
            try:
                result = subprocess.run(
                    ["ollama", "list"],
                    capture_output=True,
                    text=True,
                    check=True,
                    timeout=10
                )
                if model.model_name not in result.stdout:
                    return {"available": False, "error": f"Model {model.model_name} not found in Ollama"}
            except subprocess.TimeoutExpired:
                return {"available": False, "error": "Ollama command timed out"}
            except subprocess.CalledProcessError as e:
                return {"available": False, "error": f"Ollama check failed: {e.stderr}"}
            except Exception as e:
                return {"available": False, "error": f"Ollama check failed: {str(e)}"}

            # Then make a simple test request
            test_request = ModelRequest(
                model=model.model_name,
                messages=[{"role": "user", "content": "Hello, this is a health check. Respond with 'OK'."}],
                stream=False,
                max_tokens=5
            )

            try:
                response = await self.universal_client._call_local_model(model, test_request)
                if not response.content or "OK" not in response.content.upper():
                    return {"available": False, "error": "Model did not respond with expected content"}
                return {"available": True}
            except Exception as e:
                return {"available": False, "error": f"Test request failed: {str(e)}"}

        except subprocess.SubprocessError as e:
            return {"available": False, "error": f"Subprocess error: {str(e)}"}
        except Exception as e:
            logger.error(f"Local model check failed for {model.model_id}: {str(e)}", exc_info=True)
            return {"available": False, "error": str(e)}

    async def _check_cloud_model(self, model: ModelEntry) -> Dict[str, Any]:
        """Check if a cloud model is available with error handling.

        Args:
            model: The cloud model to check

        Returns:
            Dict[str, Any]: Dictionary containing 'available' status and optional 'error'
        """
        try:
            if not model.api_key:
                return {"available": False, "error": "API key not configured"}

            test_request = ModelRequest(
                model=model.model_name,
                messages=[{"role": "user", "content": "Hello, this is a health check. Respond with 'OK'."}],
                stream=False,
                max_tokens=5
            )

            try:
                response = await self.universal_client._call_cloud_model(model, test_request)
                if not response.content or "OK" not in response.content.upper():
                    return {"available": False, "error": "Model did not respond with expected content"}
                return {"available": True}
            except Exception as e:
                return {"available": False, "error": f"Test request failed: {str(e)}"}

        except Exception as e:
            logger.error(f"Cloud model check failed for {model.model_id}: {str(e)}", exc_info=True)
            return {"available": False, "error": str(e)}

    async def _check_model_health(self, model: ModelEntry) -> Dict[str, Any]:
        """Check the health of a single model.

        Args:
            model: The model to check

        Returns:
            Dict[str, Any]: Dictionary containing 'available' status and optional 'error'
        """
        if model.is_local:
            return await self._check_local_model(model)
        else:
            return await self._check_cloud_model(model)

    async def _check_port_open(self, host: str, port: int, timeout: float = 2.0) -> bool:
        """Check if a port is open on a given host.

        Args:
            host: The host to check
            port: The port to check
            timeout: Timeout in seconds

        Returns:
            bool: True if port is open, False otherwise
        """
        try:
            _, writer = await asyncio.wait_for(
                asyncio.open_connection(host, port),
                timeout=timeout
            )
            writer.close()
            await writer.wait_closed()
            return True
        except (asyncio.TimeoutError, ConnectionRefusedError, socket.gaierror):
            return False
        except Exception as e:
            logger.warning(f"Error checking port {host}:{port}: {str(e)}")
            return False

    async def _check_model_recovery(self) -> None:
        """Check if any disabled models can be re-enabled."""
        current_time = datetime.now()

        for model_id, status in self.model_status.items():
            if status.is_disabled and status.disabled_until:
                try:
                    disabled_until = datetime.fromisoformat(status.disabled_until)
                    if (current_time - disabled_until).total_seconds() >= self.recovery_cooldown:
                        # Attempt to re-enable the model
                        logger.info(f"Attempting to re-enable model {model_id} after cooldown period")
                        model = self.model_registry.get_model(model_id)
                        if model:
                            health_status = await self._check_model_health(model)
                            if health_status["available"]:
                                status.available = True
                                status.is_disabled = False
                                status.disabled_until = None
                                status.consecutive_failures = 0
                                status.last_success = datetime.now().isoformat()
                                logger.info(f"Successfully re-enabled model {model_id}")
                            else:
                                # Reset the cooldown
                                status.disabled_until = datetime.now().isoformat()
                                logger.info(f"Model {model_id} still unavailable, extending cooldown")
                except Exception as e:
                    logger.error(f"Error checking recovery status for model {model_id}: {str(e)}")

    def get_circuit_breaker_states(self) -> Dict[str, Dict[str, Any]]:
        """Get the current state of all circuit breakers."""
        return {provider: breaker.get_state() for provider, breaker in self.circuit_breakers.items()}

    def get_model_status(self, model_id: str) -> Optional[ModelStatus]:
        """Get the current status of a model.

        Args:
            model_id: The ID of the model to check

        Returns:
            Optional[ModelStatus]: The model status if found, None otherwise
        """
        return self.model_status.get(model_id)

    async def download_local_model(self, model_id: str) -> bool:
        """Download a local model using Ollama with error handling.

        Args:
            model_id: The ID of the model to download

        Returns:
            bool: True if download was successful, False otherwise
        """
        model = self.model_registry.get_model(model_id)
        if not model or not model.is_local:
            logger.error(f"Model {model_id} is not a local model or not found")
            return False

        try:
            # First check if Ollama is running
            if not await self._check_port_open("localhost", 11434):
                logger.error("Cannot download model: Ollama service not running")
                return False

            try:
                result = subprocess.run(
                    ["ollama", "pull", model.model_name],
                    capture_output=True,
                    text=True,
                    check=True,
                    timeout=300  # 5 minute timeout
                )
                logger.info(f"Successfully downloaded model {model.model_name}")

                # Update model status
                if model_id in self.model_status:
                    self.model_status[model_id].available = True
                    self.model_status[model_id].consecutive_failures = 0
                    self.model_status[model_id].last_success = datetime.now().isoformat()
                    self.model_status[model_id].is_disabled = False
                    self.model_status[model_id].disabled_until = None

                return True
            except subprocess.TimeoutExpired:
                logger.error(f"Timeout while downloading model {model.model_name}")
                return False
            except subprocess.CalledProcessError as e:
                logger.error(f"Failed to download model {model.model_name}: {e.stderr}")
                return False
            except Exception as e:
                logger.error(f"Error downloading model {model.model_name}: {str(e)}", exc_info=True)
                return False

        except Exception as e:
            logger.error(f"Unexpected error downloading model {model_id}: {str(e)}", exc_info=True)
            return False

    async def start_local_model(self, model_id: str) -> bool:
        """Start a local model service.

        Args:
            model_id: The ID of the model to start

        Returns:
            bool: True if service was started successfully, False otherwise
        """
        model = self.model_registry.get_model(model_id)
        if not model or not model.is_local:
            logger.error(f"Model {model_id} is not a local model or not found")
            return False

        try:
            # For Ollama, we just need to ensure it's running
            # Check if it's already running
            if await self._check_port_open("localhost", 11434):
                logger.info("Ollama service is already running")
                return True

            # Start Ollama service
            process = await asyncio.create_subprocess_exec(
                "ollama", "serve",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            # Wait a moment to see if it starts successfully
            await asyncio.sleep(2)

            if await self._check_port_open("localhost", 11434):
                logger.info("Ollama service started successfully")
                return True
            else:
                stdout, stderr = await process.communicate()
                logger.error(f"Failed to start Ollama service: {stderr.decode()}")
                return False

        except subprocess.SubprocessError as e:
            logger.error(f"Subprocess error starting Ollama service: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Error starting Ollama service: {str(e)}", exc_info=True)
            return False

    async def stop_local_model(self, model_id: str) -> bool:
        """Stop a local model service.

        Args:
            model_id: The ID of the model to stop

        Returns:
            bool: True if service was stopped successfully, False otherwise

        Note:
            This stops the Ollama service entirely, affecting all local models.
        """
        model = self.model_registry.get_model(model_id)
        if not model or not model.is_local:
            logger.error(f"Model {model_id} is not a local model or not found")
            return False

        try:
            # Check if Ollama is running
            if not await self._check_port_open("localhost", 11434):
                logger.info("Ollama service is not running")
                return True

            result = subprocess.run(
                ["ollama", "stop"],
                capture_output=True,
                text=True,
                check=True,
                timeout=10
            )

            # Verify it stopped
            await asyncio.sleep(1)
            if not await self._check_port_open("localhost", 11434):
                logger.info("Ollama service stopped successfully")
                return True
            else:
                logger.error("Ollama service did not stop properly")
                return False

        except subprocess.TimeoutExpired:
            logger.error("Timeout while stopping Ollama service")
            return False
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to stop Ollama service: {e.stderr}")
            return False
        except Exception as e:
            logger.error(f"Error stopping Ollama service: {str(e)}", exc_info=True)
            return False

    async def close(self) -> None:
        """Clean up network resources and stop background tasks.

        This should be called when the application is shutting down.
        """
        try:
            # Cancel health check task
            if self.health_check_task:
                self.health_check_task.cancel()
                try:
                    await self.health_check_task
                except asyncio.CancelledError:
                    pass
                except Exception as e:
                    logger.error(f"Error cancelling health check task: {str(e)}")

            # Close universal client
            if self.universal_client:
                await self.universal_client.close()

            logger.info("Network manager closed successfully")
        except Exception as e:
            logger.error(f"Error closing network manager: {str(e)}")
            raise

# Global network manager instance
_network_manager = NetworkManager()

async def get_network_manager() -> NetworkManager:
    await _network_manager.initialize()
    return _network_manager
