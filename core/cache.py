import logging
import hashlib
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from functools import lru_cache
import json

logger = logging.getLogger(__name__)

class ConsensusCache:
    """Caches consensus responses to improve performance for identical prompts."""

    def __init__(self, max_size: int = 1000, ttl_seconds: int = 300):
        """Initialize the consensus cache.

        Args:
            max_size: Maximum number of entries to cache
            ttl_seconds: Time-to-live for cache entries in seconds
        """
        self.max_size = max_size
        self.ttl_seconds = ttl_seconds
        self.cache: Dict[str, Dict[str, Any]] = {}
        self._lru_order: Dict[str, datetime] = {}
        self.cache_hits = 0
        self.cache_misses = 0
        self.last_cleanup = datetime.now()
        self.cleanup_interval = timedelta(minutes=5)

    def _generate_cache_key(self, user_input: str, workspace_id: Optional[str] = None) -> str:
        """Generate a cache key for the given input and workspace.

        Args:
            user_input: The user input to cache
            workspace_id: Optional workspace ID for context

        Returns:
            str: A unique cache key
        """
        key_data = {"input": user_input}
        if workspace_id:
            key_data["workspace"] = workspace_id

        # Use SHA256 for consistent key length
        key_str = json.dumps(key_data, sort_keys=True)
        return hashlib.sha256(key_str.encode()).hexdigest()

    def get(self, user_input: str, workspace_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Get a cached response for the given input.

        Args:
            user_input: The user input to look up
            workspace_id: Optional workspace ID for context

        Returns:
            Optional[Dict[str, Any]]: The cached response if found and valid, None otherwise
        """
        # Periodic cleanup of expired entries
        self._cleanup_expired_entries()

        cache_key = self._generate_cache_key(user_input, workspace_id)

        if cache_key not in self.cache:
            self.cache_misses += 1
            return None

        cache_entry = self.cache[cache_key]

        # Check if entry is expired
        if datetime.now() - cache_entry["timestamp"] > timedelta(seconds=self.ttl_seconds):
            logger.debug(f"Cache entry expired for key {cache_key}")
            del self.cache[cache_key]
            del self._lru_order[cache_key]
            self.cache_misses += 1
            return None

        # Update LRU order
        self._lru_order[cache_key] = datetime.now()
        self.cache_hits += 1

        logger.debug(f"Cache hit for key {cache_key}")
        return cache_entry["response"]

    def set(self, user_input: str, response: Dict[str, Any], workspace_id: Optional[str] = None) -> None:
        """Set a response in the cache.

        Args:
            user_input: The user input to cache
            response: The response to cache
            workspace_id: Optional workspace ID for context
        """
        # Skip caching for sensitive queries
        if self._is_sensitive_query(user_input):
            logger.debug("Skipping cache for sensitive query")
            return

        # Periodic cleanup of expired entries
        self._cleanup_expired_entries()

        cache_key = self._generate_cache_key(user_input, workspace_id)

        # If cache is full, remove least recently used entry
        if len(self.cache) >= self.max_size and cache_key not in self.cache:
            self._evict_lru_entry()

        # Store the response
        self.cache[cache_key] = {
            "response": response,
            "timestamp": datetime.now()
        }
        self._lru_order[cache_key] = datetime.now()

        logger.debug(f"Cache set for key {cache_key}")

    def _cleanup_expired_entries(self) -> None:
        """Clean up expired cache entries to free up space."""
        now = datetime.now()
        if now - self.last_cleanup < self.cleanup_interval:
            return

        self.last_cleanup = now
        expired_keys = []

        for cache_key, entry in self.cache.items():
            if now - entry["timestamp"] > timedelta(seconds=self.ttl_seconds):
                expired_keys.append(cache_key)

        for cache_key in expired_keys:
            del self.cache[cache_key]
            if cache_key in self._lru_order:
                del self._lru_order[cache_key]

        if expired_keys:
            logger.debug(f"Cleaned up {len(expired_keys)} expired cache entries")

    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics.

        Returns:
            Dict[str, Any]: Cache statistics
        """
        return {
            "current_size": len(self.cache),
            "max_size": self.max_size,
            "cache_hits": self.cache_hits,
            "cache_misses": self.cache_misses,
            "hit_rate": (self.cache_hits / (self.cache_hits + self.cache_misses) * 100)
                          if (self.cache_hits + self.cache_misses) > 0 else 0,
            "ttl_seconds": self.ttl_seconds
        }

    def _evict_lru_entry(self) -> None:
        """Evict the least recently used cache entry."""
        if not self._lru_order:
            return

        # Find the oldest entry
        oldest_key = min(self._lru_order.items(), key=lambda x: x[1])[0]
        del self.cache[oldest_key]
        del self._lru_order[oldest_key]
        logger.debug(f"Evicted LRU cache entry {oldest_key}")

    def _is_sensitive_query(self, user_input: str) -> bool:
        """Check if the query contains sensitive information that shouldn't be cached.

        Args:
            user_input: The user input to check

        Returns:
            bool: True if the query is sensitive and shouldn't be cached
        """
        sensitive_keywords = [
            "password", "secret", "token", "api key", "credentials",
            "credit card", "ssn", "social security", "personal information",
            "private", "confidential", "authentication", "login", "signin"
        ]

        user_input_lower = user_input.lower()
        return any(keyword in user_input_lower for keyword in sensitive_keywords)

    def clear(self) -> None:
        """Clear the entire cache."""
        self.cache.clear()
        self._lru_order.clear()
        logger.info("Consensus cache cleared")

# Global cache instance
_consensus_cache = ConsensusCache()

def get_consensus_cache() -> ConsensusCache:
    """Get the global consensus cache instance."""
    return _consensus_cache
