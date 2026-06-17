import httpx
import logging
from typing import Dict, Optional, Union, Any, List
from models.registry import ModelEntry, get_model_registry
from pydantic import BaseModel, Field
import time
import asyncio
import os
from datetime import datetime, timedelta
from enum import Enum
from core.error_handler import get_error_handler
from gateway.connection_pool import get_connection_pool

logger = logging.getLogger(__name__)

class CircuitState(Enum):
    """Circuit breaker states."""
    CLOSED = "CLOSED"
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"

class ModelRequest(BaseModel):
    """Represents a request to be sent to a model."""

    model: str
    messages: List[Dict[str, Any]]
    stream: bool = False
    temperature: float = 0.7
    max_tokens: Optional[int] = None

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "model": "qwen2.5-coder:7b",
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": "Hello, how are you?"}
                ],
                "stream": False,
                "temperature": 0.7
            }
        }

class ModelResponse(BaseModel):
    """Represents a response from a model."""

    content: str
    model: str
    provider: str
    latency: float
    tokens_used: Optional[int] = None
    timestamp: datetime = Field(default_factory=datetime.now)
    success: bool = True
    error_message: Optional[str] = None

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "content": "I'm doing well, thank you for asking!",
                "model": "qwen2.5-coder:7b",
                "provider": "ollama",
                "latency": 0.45,
                "tokens_used": 15,
                "timestamp": "2023-11-15T12:34:56.789Z",
                "success": True
            }
        }

class CircuitBreaker:
    """Circuit breaker pattern implementation for model providers."""

    def __init__(self, max_failures: int = 5, reset_timeout: int = 30):
        """Initialize the circuit breaker.

        Args:
            max_failures: Maximum number of consecutive failures before opening circuit
            reset_timeout: Time in seconds to wait before trying to recover
        """
        self.max_failures = max_failures
        self.reset_timeout = reset_timeout
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time = None
        self.next_attempt_time = None

    def record_success(self) -> None:
        """Record a successful call."""
        if self.state != CircuitState.CLOSED:
            logger.info(f"Circuit breaker: {self.state.value} -> CLOSED (success)")
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time = None
        self.next_attempt_time = None

    def record_failure(self) -> None:
        """Record a failed call."""
        self.failure_count += 1
        self.last_failure_time = datetime.now()

        if self.failure_count >= self.max_failures:
            self._open_circuit()

    def _open_circuit(self) -> None:
        """Open the circuit."""
        if self.state != CircuitState.OPEN:
            logger.warning(f"Circuit breaker: {self.state.value} -> OPEN (too many failures)")
        self.state = CircuitState.OPEN
        self.next_attempt_time = datetime.now() + timedelta(seconds=self.reset_timeout)

    def is_call_allowed(self) -> bool:
        """Check if a call is allowed based on circuit state."""
        if self.state == CircuitState.CLOSED:
            return True
        elif self.state == CircuitState.OPEN:
            if datetime.now() >= self.next_attempt_time:
                logger.info(f"Circuit breaker: OPEN -> HALF_OPEN (attempting recovery)")
                self.state = CircuitState.HALF_OPEN
                return True
            return False
        elif self.state == CircuitState.HALF_OPEN:
            return True
        return False

    def get_state(self) -> Dict[str, Any]:
        """Get the current circuit breaker state."""
        return {
            "state": self.state.value,
            "failure_count": self.failure_count,
            "last_failure_time": self.last_failure_time.isoformat() if self.last_failure_time else None,
            "next_attempt_time": self.next_attempt_time.isoformat() if self.next_attempt_time else None
        }

class UniversalClient:
    """Universal client for calling different model providers with consistent interface."""

    def __init__(self):
        """Initialize the universal client with default settings."""
        self.connection_pool = get_connection_pool()
        self.timeouts = {
            "ollama": 30.0,
            "openrouter": 60.0,
            "gemini": 60.0,
            "mistral": 60.0,
            "together": 60.0
        }
        self.max_retries = 3
        self.retry_delay = 1.0
        self.request_metrics: List[Dict[str, Any]] = []
        self.circuit_breakers: Dict[str, CircuitBreaker] = {}  # provider -> CircuitBreaker
        self.error_handler = get_error_handler()
        self.metrics_collection_interval = 60  # seconds
        self.last_metrics_collection = time.time()

    async def get_client(self, provider: str) -> httpx.AsyncClient:
        """Get an HTTP client from the connection pool for a provider.

        Args:
            provider: The provider name

        Returns:
            httpx.AsyncClient: A client from the connection pool
        """
        return await self.connection_pool.get_client(provider)

    async def initialize(self) -> None:
        """Initialize the universal client with any required setup.

        This can be called to start background tasks.
        """
        # Start periodic metrics collection
        asyncio.create_task(self._periodic_metrics_collection())

    async def close(self) -> None:
        """Close all HTTP clients and clean up resources.

        This should be called when the application is shutting down.
        """
        try:
            # Collect final metrics before closing
            self._collect_and_report_metrics()
            await self.connection_pool.close_all()
        except Exception as e:
            logger.error(f"Error during client cleanup: {str(e)}")
            raise

    def _collect_and_report_metrics(self) -> None:
        """Collect and report performance metrics."""
        try:
            if not self.request_metrics:
                return

            # Calculate statistics
            total_requests = len(self.request_metrics)
            successful_requests = sum(1 for m in self.request_metrics if m.get("success", False))
            failed_requests = total_requests - successful_requests
            success_rate = (successful_requests / total_requests * 100) if total_requests > 0 else 0

            # Calculate latency statistics
            latencies = [m["latency"] for m in self.request_metrics if "latency" in m]
            avg_latency = sum(latencies) / len(latencies) if latencies else 0
            min_latency = min(latencies) if latencies else 0
            max_latency = max(latencies) if latencies else 0

            # Calculate token usage statistics
            token_usages = [m.get("tokens_used", 0) for m in self.request_metrics if m.get("tokens_used") is not None]
            avg_tokens = sum(token_usages) / len(token_usages) if token_usages else 0

            # Log metrics
            logger.info(f"Model API Performance Metrics (last {len(self.request_metrics)} requests):")
            logger.info(f"  Total requests: {total_requests}")
            logger.info(f"  Successful requests: {successful_requests} ({success_rate:.1f}%)")
            logger.info(f"  Failed requests: {failed_requests}")
            logger.info(f"  Latency - Avg: {avg_latency:.3f}s, Min: {min_latency:.3f}s, Max: {max_latency:.3f}s")
            logger.info(f"  Token usage - Avg: {avg_tokens:.1f} tokens per request")

            # Log circuit breaker states
            for provider, breaker in self.circuit_breakers.items():
                state = breaker.get_state()
                logger.info(f"  Circuit breaker for {provider}: {state['state']} "
                          f"(failures: {state['failure_count']})")

            # Get connection pool metrics
            pool_metrics = self.connection_pool.get_metrics()
            for provider, metrics in pool_metrics.items():
                logger.info(f"  Connection pool for {provider}: "
                          f"hits={metrics['pool_hits']}, misses={metrics['pool_misses']}, "
                          f"avg_wait={metrics['avg_wait_time']:.3f}s")

        except Exception as e:
            logger.error(f"Error collecting metrics: {str(e)}")

    async def _periodic_metrics_collection(self) -> None:
        """Periodically collect and report metrics."""
        while True:
            try:
                await asyncio.sleep(self.metrics_collection_interval)
                self._collect_and_report_metrics()

                # Clear metrics after collection to avoid memory buildup
                self.request_metrics = []

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in periodic metrics collection: {str(e)}")

    async def call_model(self, model: ModelEntry, request: ModelRequest) -> ModelResponse:
        """Call a model with retry logic, fallback, and circuit breaker protection.

        Args:
            model: The model to call
            request: The request to send to the model

        Returns:
            ModelResponse: The response from the model

        Raises:
            Exception: If all retry attempts fail
        """
        start_time = time.time()
        last_error = None
        attempt = 0

        # Record request metrics
        request_metric = {
            "model_id": model.model_id,
            "provider": model.provider,
            "timestamp": datetime.now().isoformat(),
            "attempts": 0,
            "success": False,
            "latency": 0,
            "error": None,
            "circuit_state": None
        }

        try:
            # Check circuit breaker state
            circuit_breaker = self._get_circuit_breaker(model.provider)
            if not circuit_breaker.is_call_allowed():
                error_msg = f"Circuit breaker is OPEN for provider {model.provider}"
                request_metric["error"] = error_msg
                request_metric["circuit_state"] = circuit_breaker.get_state()
                self.request_metrics.append(request_metric)

                # Try fallback model if available
                fallback_response = await self._try_fallback_model(request)
                if fallback_response:
                    return fallback_response
                else:
                    raise Exception(error_msg)

            for attempt in range(self.max_retries):
                try:
                    if model.is_local:
                        response = await self._call_local_model(model, request)
                    else:
                        response = await self._call_cloud_model(model, request)

                    # Record successful response
                    request_metric.update({
                        "attempts": attempt + 1,
                        "success": True,
                        "latency": time.time() - start_time,
                        "circuit_state": circuit_breaker.get_state()
                    })
                    self.request_metrics.append(request_metric)

                    # Record success in circuit breaker
                    circuit_breaker.record_success()
                    return response

                except Exception as e:
                    last_error = e
                    logger.warning(f"Attempt {attempt + 1} failed for {model.model_id}: {str(e)}")
                    request_metric["error"] = str(e)

                    # Record failure in circuit breaker
                    circuit_breaker.record_failure()

                    if attempt < self.max_retries - 1:
                        await asyncio.sleep(self.retry_delay * (attempt + 1))

            # If we get here, all attempts failed
            latency = time.time() - start_time
            error_msg = f"All {self.max_retries} attempts failed for {model.model_id}: {str(last_error)}"

            request_metric.update({
                "attempts": self.max_retries,
                "latency": latency,
                "error": error_msg,
                "circuit_state": circuit_breaker.get_state()
            })
            self.request_metrics.append(request_metric)

            # Try fallback model if available
            fallback_response = await self._try_fallback_model(request)
            if fallback_response:
                return fallback_response
            else:
                raise Exception(error_msg)

        except Exception as e:
            # Record failed request
            if not request_metric.get("error"):
                request_metric["error"] = str(e)
            if not request_metric.get("latency"):
                request_metric["latency"] = time.time() - start_time
            if not request_metric.get("circuit_state"):
                circuit_breaker = self._get_circuit_breaker(model.provider)
                request_metric["circuit_state"] = circuit_breaker.get_state()

            self.request_metrics.append(request_metric)

            # Clean up old metrics to prevent memory leaks
            if len(self.request_metrics) > 1000:
                self.request_metrics = self.request_metrics[-1000:]

            raise

    def _get_circuit_breaker(self, provider: str) -> CircuitBreaker:
        """Get or create a circuit breaker for a provider."""
        if provider not in self.circuit_breakers:
            self.circuit_breakers[provider] = CircuitBreaker()
        return self.circuit_breakers[provider]

    async def _try_fallback_model(self, request: ModelRequest) -> Optional[ModelResponse]:
        """Try to use a fallback model if the primary fails.

        Args:
            request: The original request

        Returns:
            Optional[ModelResponse]: Response from fallback model if available, None otherwise
        """
        try:
            logger.warning(f"Attempting fallback for model {request.model}")

            # Get fallback model (fast local model)
            model_registry = get_model_registry()
            fallback_model = model_registry.get_model(self.error_handler.fallback_model)

            if not fallback_model or not fallback_model.is_active:
                logger.warning("No active fallback model available")
                return None

            # Create new request for fallback model
            fallback_request = ModelRequest(
                model=fallback_model.model_name,
                messages=request.messages,
                stream=request.stream,
                temperature=request.temperature,
                max_tokens=request.max_tokens
            )

            # Call fallback model
            response = await self._call_local_model(fallback_model, fallback_request)
            logger.info(f"Fallback to {fallback_model.model_id} successful")
            return response

        except Exception as e:
            logger.error(f"Fallback failed: {str(e)}")
            return None

    async def _call_local_model(self, model: ModelEntry, request: ModelRequest) -> ModelResponse:
        """Call a local Ollama model with circuit breaker protection.

        Args:
            model: The local model to call
            request: The request to send to the model

        Returns:
            ModelResponse: The response from the model

        Raises:
            Exception: If the call fails
        """
        if not model.is_local:
            raise ValueError(f"Model {model.model_id} is not a local model")

        # Check circuit breaker state
        circuit_breaker = self._get_circuit_breaker(model.provider)
        if not circuit_breaker.is_call_allowed():
            raise Exception(f"Circuit breaker is OPEN for provider {model.provider}")

        client = await self.get_client("ollama")
        endpoint = model.endpoint or "http://localhost:11434/api/chat"

        try:
            start_time = time.time()

            payload = {
                "model": model.model_name,
                "messages": request.messages,
                "stream": request.stream,
                "options": {
                    "temperature": request.temperature
                }
            }

            # Add max_tokens if specified
            if request.max_tokens:
                payload["options"]["num_predict"] = request.max_tokens

            response = await client.post(
                endpoint,
                json=payload,
                headers={"Content-Type": "application/json"}
            )

            latency = time.time() - start_time

            if response.status_code != 200:
                try:
                    error_data = response.json()
                    error_msg = error_data.get("error", f"HTTP {response.status_code}")
                except:
                    error_msg = f"HTTP {response.status_code}: {response.text}"

                # Record failure in circuit breaker
                circuit_breaker.record_failure()
                raise Exception(f"Local model {model.model_id} failed: {error_msg}")

            result = response.json()

            # Handle different response formats
            if "message" in result:
                content = result["message"].get("content", "")
                tokens_used = result.get("prompt_eval_count", 0) + result.get("eval_count", 0)
            elif "response" in result:
                content = result.get("response", "")
                tokens_used = result.get("prompt_eval_count", 0) + result.get("eval_count", 0)
            else:
                content = str(result)
                tokens_used = None

            # Record success in circuit breaker
            circuit_breaker.record_success()

            return ModelResponse(
                content=content,
                model=model.model_id,
                provider=model.provider,
                latency=latency,
                tokens_used=tokens_used
            )

        except httpx.HTTPError as e:
            logger.error(f"HTTP error calling local model {model.model_id}: {str(e)}")
            circuit_breaker.record_failure()
            raise Exception(f"HTTP error calling local model {model.model_id}: {str(e)}")
        except Exception as e:
            logger.error(f"Error calling local model {model.model_id}: {str(e)}", exc_info=True)
            circuit_breaker.record_failure()
            raise

    async def _call_cloud_model(self, model: ModelEntry, request: ModelRequest) -> ModelResponse:
        """Call a cloud API model with circuit breaker protection.

        Args:
            model: The cloud model to call
            request: The request to send to the model

        Returns:
            ModelResponse: The response from the model

        Raises:
            Exception: If the call fails
        """
        if model.is_local:
            raise ValueError(f"Model {model.model_id} is not a cloud model")

        if not model.api_key:
            raise ValueError(f"API key not configured for cloud model {model.model_id}")

        # Check circuit breaker state
        circuit_breaker = self._get_circuit_breaker(model.provider)
        if not circuit_breaker.is_call_allowed():
            raise Exception(f"Circuit breaker is OPEN for provider {model.provider}")

        async with self.connection_pool.acquire(model.provider) as client:
            try:
            start_time = time.time()

            # Prepare headers and payload based on provider
            headers = {}
            payload = {}
            endpoint = model.endpoint

            if model.provider == "openrouter":
                headers = {
                    "Authorization": f"Bearer {model.api_key}",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "JARVIS V5.0",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": model.model_name,
                    "messages": request.messages,
                    "stream": request.stream,
                    "temperature": request.temperature
                }
                if request.max_tokens:
                    payload["max_tokens"] = request.max_tokens
                endpoint = endpoint or "https://openrouter.ai/api/v1/chat/completions"

            elif model.provider == "gemini":
                headers = {
                    "Content-Type": "application/json",
                    "x-goog-api-key": model.api_key
                }
                payload = {
                    "contents": [{"parts": [{"text": msg["content"]}]} for msg in request.messages],
                    "generationConfig": {
                        "temperature": request.temperature,
                        "maxOutputTokens": request.max_tokens or 8192
                    }
                }
                endpoint = endpoint or f"https://generativelanguage.googleapis.com/v1beta/models/{model.model_name}:generateContent"

            elif model.provider == "mistral":
                headers = {
                    "Authorization": f"Bearer {model.api_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": model.model_name,
                    "messages": request.messages,
                    "stream": request.stream,
                    "temperature": request.temperature
                }
                if request.max_tokens:
                    payload["max_tokens"] = request.max_tokens
                endpoint = endpoint or "https://api.mistral.ai/v1/chat/completions"

            elif model.provider == "together":
                headers = {
                    "Authorization": f"Bearer {model.api_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": model.model_name,
                    "messages": request.messages,
                    "stream": request.stream,
                    "temperature": request.temperature
                }
                if request.max_tokens:
                    payload["max_tokens"] = request.max_tokens
                endpoint = endpoint or "https://api.together.xyz/v1/chat/completions"

            else:
                raise ValueError(f"Unsupported cloud provider: {model.provider}")

            if not endpoint:
                raise ValueError(f"No endpoint configured for model {model.model_id}")

            response = await client.post(
                endpoint,
                headers=headers,
                json=payload
            )

            latency = time.time() - start_time

            if response.status_code != 200:
                try:
                    error_data = response.json()
                    if "error" in error_data:
                        error_msg = error_data["error"].get("message", str(error_data["error"]))
                    else:
                        error_msg = str(error_data)
                except:
                    error_msg = f"HTTP {response.status_code}: {response.text}"

                # Record failure in circuit breaker
                circuit_breaker.record_failure()
                raise Exception(f"Cloud model {model.model_id} failed: {error_msg}")

            result = response.json()

            # Normalize response format
            content = ""
            tokens_used = None

            try:
                if model.provider == "gemini":
                    if "candidates" in result and len(result["candidates"]) > 0:
                        candidate = result["candidates"][0]
                        if "content" in candidate and "parts" in candidate["content"]:
                            parts = candidate["content"]["parts"]
                            if len(parts) > 0 and "text" in parts[0]:
                                content = parts[0]["text"]
                    tokens_used = result.get("usageMetadata", {}).get("totalTokenCount", 0)
                else:
                    if "choices" in result and len(result["choices"]) > 0:
                        choice = result["choices"][0]
                        if "message" in choice and "content" in choice["message"]:
                            content = choice["message"]["content"]
                    tokens_used = result.get("usage", {}).get("total_tokens", 0)
            except Exception as e:
                logger.warning(f"Failed to parse response from {model.model_id}: {str(e)}")
                content = str(result)
                tokens_used = None

            # Record success in circuit breaker
            circuit_breaker.record_success()

            return ModelResponse(
                content=content,
                model=model.model_id,
                provider=model.provider,
                latency=latency,
                tokens_used=tokens_used
            )

        except httpx.HTTPError as e:
            logger.error(f"HTTP error calling cloud model {model.model_id}: {str(e)}")
            circuit_breaker.record_failure()
            raise Exception(f"HTTP error calling cloud model {model.model_id}: {str(e)}")
        except Exception as e:
            logger.error(f"Error calling cloud model {model.model_id}: {str(e)}", exc_info=True)
            circuit_breaker.record_failure()
            raise

# Global client instance
_universal_client = UniversalClient()

async def get_universal_client() -> UniversalClient:
    """Get the global universal client instance.

    Returns:
        UniversalClient: The global universal client instance
    """
    await _universal_client.initialize()
    return _universal_client
import httpx
import logging
from typing import Dict, Optional, Union
from models.registry import ModelEntry
from pydantic import BaseModel
import time
import asyncio

logger = logging.getLogger(__name__)

class ModelRequest(BaseModel):
    model: str
    messages: list
    stream: bool = False
    temperature: float = 0.7
    max_tokens: Optional[int] = None

class ModelResponse(BaseModel):
    content: str
    model: str
    provider: str
    latency: float
    tokens_used: Optional[int] = None

class UniversalClient:
    def __init__(self):
        self.clients = {}
        self.timeouts = {
            "ollama": 30.0,
            "openrouter": 60.0,
            "gemini": 60.0,
            "mistral": 60.0,
            "together": 60.0
        }
        self.max_retries = 3
        self.retry_delay = 1.0

    async def get_client(self, provider: str) -> httpx.AsyncClient:
        """Get or create an HTTP client for a provider"""
        if provider not in self.clients:
            self.clients[provider] = httpx.AsyncClient(
                timeout=self.timeouts.get(provider, 30.0)
            )
        return self.clients[provider]

    async def close(self):
        """Close all HTTP clients"""
        for client in self.clients.values():
            await client.aclose()
        self.clients = {}

    async def call_model(self, model: ModelEntry, request: ModelRequest) -> ModelResponse:
        """Call a model with retry logic and fallback"""
        start_time = time.time()
        last_error = None

        for attempt in range(self.max_retries):
            try:
                if model.is_local:
                    return await self._call_local_model(model, request)
                else:
                    return await self._call_cloud_model(model, request)
            except Exception as e:
                last_error = e
                logger.warning(f"Attempt {attempt + 1} failed for {model.model_id}: {str(e)}")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.retry_delay * (attempt + 1))

        latency = time.time() - start_time
        raise Exception(f"All {self.max_retries} attempts failed for {model.model_id}: {str(last_error)}")

    async def _call_local_model(self, model: ModelEntry, request: ModelRequest) -> ModelResponse:
        """Call a local Ollama model"""
        client = await self.get_client("ollama")
        endpoint = model.endpoint or "http://localhost:11434/api/chat"

        try:
            start_time = time.time()
            response = await client.post(
                endpoint,
                json={
                    "model": model.model_name,
                    "messages": request.messages,
                    "stream": request.stream,
                    "options": {
                        "temperature": request.temperature
                    }
                }
            )

            latency = time.time() - start_time

            if response.status_code != 200:
                error_msg = response.json().get("error", "Unknown error")
                raise Exception(f"Local model {model.model_id} failed: {error_msg}")

            result = response.json()
            content = result.get("message", {}).get("content", "")
            tokens_used = result.get("prompt_eval_count", 0) + result.get("eval_count", 0)

            return ModelResponse(
                content=content,
                model=model.model_id,
                provider=model.provider,
                latency=latency,
                tokens_used=tokens_used
            )

        except Exception as e:
            logger.error(f"Error calling local model {model.model_id}: {str(e)}")
            raise

    async def _call_cloud_model(self, model: ModelEntry, request: ModelRequest) -> ModelResponse:
        """Call a cloud API model"""
        client = await self.get_client(model.provider)

        try:
            start_time = time.time()

            # Prepare headers and payload based on provider
            headers = {}
            payload = {}

            if model.provider == "openrouter":
                headers = {
                    "Authorization": f"Bearer {model.api_key}",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "JARVIS V5.0"
                }
                payload = {
                    "model": model.model_name,
                    "messages": request.messages,
                    "stream": request.stream,
                    "temperature": request.temperature
                }
                endpoint = model.endpoint or "https://openrouter.ai/api/v1/chat/completions"

            elif model.provider == "gemini":
                headers = {
                    "Content-Type": "application/json",
                    "x-goog-api-key": model.api_key
                }
                payload = {
                    "contents": [{"parts": [{"text": msg["content"]}]} for msg in request.messages],
                    "generationConfig": {
                        "temperature": request.temperature,
                        "maxOutputTokens": request.max_tokens or 8192
                    }
                }
                endpoint = model.endpoint or f"https://generativelanguage.googleapis.com/v1beta/models/{model.model_name}:generateContent"

            elif model.provider == "mistral":
                headers = {
                    "Authorization": f"Bearer {model.api_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": model.model_name,
                    "messages": request.messages,
                    "stream": request.stream,
                    "temperature": request.temperature,
                    "max_tokens": request.max_tokens
                }
                endpoint = model.endpoint or "https://api.mistral.ai/v1/chat/completions"

            elif model.provider == "together":
                headers = {
                    "Authorization": f"Bearer {model.api_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": model.model_name,
                    "messages": request.messages,
                    "stream": request.stream,
                    "temperature": request.temperature,
                    "max_tokens": request.max_tokens
                }
                endpoint = model.endpoint or "https://api.together.xyz/v1/chat/completions"

            else:
                raise Exception(f"Unsupported cloud provider: {model.provider}")

            response = await client.post(
                endpoint,
                headers=headers,
                json=payload
            )

            latency = time.time() - start_time

            if response.status_code != 200:
                error_msg = response.json().get("error", {}).get("message", "Unknown error")
                raise Exception(f"Cloud model {model.model_id} failed: {error_msg}")

            result = response.json()

            # Normalize response format
            if model.provider == "gemini":
                content = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                tokens_used = result.get("usageMetadata", {}).get("totalTokenCount", 0)
            else:
                content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
                tokens_used = result.get("usage", {}).get("total_tokens", 0)

            return ModelResponse(
                content=content,
                model=model.model_id,
                provider=model.provider,
                latency=latency,
                tokens_used=tokens_used
            )

        except Exception as e:
            logger.error(f"Error calling cloud model {model.model_id}: {str(e)}")
            raise

# Global client instance
_universal_client = UniversalClient()

async def get_universal_client() -> UniversalClient:
    return _universal_client
