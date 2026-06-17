import httpx
import logging
from typing import Dict, Optional, AsyncIterator
import asyncio
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)

class ConnectionPool:
    """Manages a pool of persistent HTTP connections for cloud API providers."""

    def __init__(self, max_connections: int = 10, connect_timeout: float = 10.0, read_timeout: float = 30.0):
        """Initialize the connection pool.

        Args:
            max_connections: Maximum number of connections per provider
            connect_timeout: Connection timeout in seconds
            read_timeout: Read timeout in seconds
        """
        self.max_connections = max_connections
        self.connect_timeout = connect_timeout
        self.read_timeout = read_timeout
        self.pools: Dict[str, asyncio.Queue] = {}
        self.locks: Dict[str, asyncio.Lock] = {}

    async def get_client(self, provider: str) -> httpx.AsyncClient:
        """Get a client from the pool for the specified provider.

        Args:
            provider: The provider name (e.g., 'openrouter', 'gemini')

        Returns:
            httpx.AsyncClient: A client from the pool
        """
        if provider not in self.pools:
            self.pools[provider] = asyncio.Queue(maxsize=self.max_connections)
            self.locks[provider] = asyncio.Lock()

        # Try to get an existing client
        try:
            return self.pools[provider].get_nowait()
        except asyncio.QueueEmpty:
            pass

        # If no existing client, create a new one under lock
        async with self.locks[provider]:
            # Double-check if another task created a client while we were waiting
            try:
                return self.pools[provider].get_nowait()
            except asyncio.QueueEmpty:
                pass

            # Create new client
            client = httpx.AsyncClient(
                timeout=httpx.Timeout(
                    connect=self.connect_timeout,
                    read=self.read_timeout
                ),
                limits=httpx.Limits(
                    max_connections=self.max_connections,
                    max_keepalive_connections=self.max_connections
                )
            )
            logger.debug(f"Created new HTTP client for provider {provider}")
            return client

    async def return_client(self, provider: str, client: httpx.AsyncClient) -> None:
        """Return a client to the pool.

        Args:
            provider: The provider name
            client: The client to return
        """
        if provider not in self.pools:
            await self.close_client(client)
            return

        try:
            # Reset client state before returning to pool
            await client.aclose()
            # Create a fresh client to avoid state leakage
            fresh_client = httpx.AsyncClient(
                timeout=httpx.Timeout(
                    connect=self.connect_timeout,
                    read=self.read_timeout
                ),
                limits=httpx.Limits(
                    max_connections=self.max_connections,
                    max_keepalive_connections=self.max_connections
                )
            )
            await self.pools[provider].put(fresh_client)
        except Exception as e:
            logger.error(f"Error returning client to pool for provider {provider}: {str(e)}")
            await self.close_client(client)

    async def close_client(self, client: httpx.AsyncClient) -> None:
        """Close a client and clean up resources."""
        try:
            await client.aclose()
        except Exception as e:
            logger.error(f"Error closing HTTP client: {str(e)}")

    async def close_all(self) -> None:
        """Close all clients in all pools."""
        for provider, pool in self.pools.items():
            while not pool.empty():
                try:
                    client = await pool.get()
                    await self.close_client(client)
                except Exception as e:
                    logger.error(f"Error closing client for provider {provider}: {str(e)}")
        self.pools.clear()
        logger.info("Connection pool closed")

    @asynccontextmanager
    async def acquire(self, provider: str) -> AsyncIterator[httpx.AsyncClient]:
        """Context manager for acquiring a client from the pool.

        Args:
            provider: The provider name

        Yields:
            httpx.AsyncClient: A client from the pool
        """
        client = None
        try:
            client = await self.get_client(provider)
            yield client
        finally:
            if client:
                await self.return_client(provider, client)

# Global connection pool instance
_connection_pool = ConnectionPool()

def get_connection_pool() -> ConnectionPool:
    """Get the global connection pool instance."""
    return _connection_pool
