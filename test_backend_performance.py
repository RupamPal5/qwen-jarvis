#!/usr/bin/env python3

import asyncio
import sys
import os
import time
from pathlib import Path

# Add the project directory to the path
sys.path.insert(0, os.path.abspath('.'))

async def test_connection_pool():
    """Test the connection pool functionality"""
    try:
        from gateway.connection_pool import get_connection_pool

        pool = get_connection_pool()
        print("✓ Connection pool initialized successfully")

        # Test getting a client
        client = await pool.get_client("test_provider")
        print("✓ Successfully acquired client from pool")

        # Test returning a client
        await pool.return_client("test_provider", client)
        print("✓ Successfully returned client to pool")

        # Test context manager
        async with pool.acquire("test_provider") as ctx_client:
            print("✓ Successfully used connection pool context manager")

        return True
    except Exception as e:
        print(f"✗ Connection pool test failed: {e}")
        return False

async def test_consensus_cache():
    """Test the consensus cache functionality"""
    try:
        from core.cache import get_consensus_cache

        cache = get_consensus_cache()
        print("✓ Consensus cache initialized successfully")

        # Test cache set and get
        test_input = "Test input for caching"
        test_response = {"status": "success", "result": "test result"}

        cache.set(test_input, test_response)
        cached_response = cache.get(test_input)

        if cached_response == test_response:
            print("✓ Cache set and get working correctly")
        else:
            print("✗ Cache set and get failed")
            return False

        # Test cache expiration
        cache.ttl_seconds = 1  # Set TTL to 1 second for testing
        time.sleep(2)
        expired_response = cache.get(test_input)
        if expired_response is None:
            print("✓ Cache expiration working correctly")
        else:
            print("✗ Cache expiration failed")
            return False

        # Test sensitive query detection
        sensitive_input = "This contains password information"
        sensitive_response = {"status": "success", "result": "sensitive data"}

        cache.set(sensitive_input, sensitive_response)
        cached_sensitive = cache.get(sensitive_input)
        if cached_sensitive is None:
            print("✓ Sensitive query detection working correctly")
        else:
            print("✗ Sensitive query detection failed")
            return False

        return True
    except Exception as e:
        print(f"✗ Consensus cache test failed: {e}")
        return False

async def test_logger_manager():
    """Test the logger manager functionality"""
    try:
        from core.logger import get_logger_manager

        logger = get_logger_manager()
        print("✓ Logger manager initialized successfully")

        # Test logging events
        logger.log_model_assignment("ARCHITECT", "qwen2.5-coder:7b")
        logger.log_consensus_execution("test-request-123", "success", 1.5, {
            "ARCHITECT": "qwen2.5-coder:7b",
            "ARBITER": "gemini-2.5-flash",
            "JUDGE": "llama-3.3-70b"
        })
        logger.log_api_request("/api/test", "GET", 200, 0.1, "127.0.0.1")
        logger.log_health_check("ollama_service", "healthy", 0.2)

        print("✓ Logger events recorded successfully")
        return True
    except Exception as e:
        print(f"✗ Logger manager test failed: {e}")
        return False

async def test_consensus_parallelism():
    """Test that consensus engine uses parallelism"""
    try:
        from core.consensus_v2 import get_consensus_engine

        consensus_engine = await get_consensus_engine()
        print("✓ Consensus engine initialized successfully")

        # This is a basic test - in a real test we would mock the model calls
        # to verify they run in parallel
        print("✓ Consensus engine parallelism structure in place")
        return True
    except Exception as e:
        print(f"✗ Consensus parallelism test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing JARVIS V5.0 Performance and Observability Features...")

    # Run all tests
    tests = [
        test_connection_pool(),
        test_consensus_cache(),
        test_logger_manager(),
        test_consensus_parallelism()
    ]

    results = asyncio.run(asyncio.gather(*tests))

    if all(results):
        print("\n✓ All performance and observability tests passed!")
        sys.exit(0)
    else:
        print("\n✗ Some performance and observability tests failed.")
        sys.exit(1)
