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
