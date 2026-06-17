#!/usr/bin/env python3

import asyncio
import sys
import os
import time
import httpx
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
        client1 = await pool.get_client("test_provider")
        print("✓ Successfully acquired client from pool")

        # Test getting another client
        client2 = await pool.get_client("test_provider")
        print("✓ Successfully acquired second client from pool")

        # Test returning clients
        await pool.return_client("test_provider", client1)
        await pool.return_client("test_provider", client2)
        print("✓ Successfully returned clients to pool")

        # Test context manager
        async with pool.acquire("test_provider") as ctx_client:
            print("✓ Successfully used connection pool context manager")

        # Test metrics
        metrics = pool.get_metrics()
        if "test_provider" in metrics:
            print("✓ Connection pool metrics working correctly")
        else:
            print("✗ Connection pool metrics not found")
            return False

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

        # Test cache stats
        stats = cache.get_stats()
        if stats["cache_hits"] == 1 and stats["cache_misses"] == 0:
            print("✓ Cache statistics working correctly")
        else:
            print(f"✗ Cache statistics incorrect: {stats}")
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

async def test_consensus_parallelism():
    """Test that consensus engine uses parallelism"""
    try:
        from core.consensus_v2 import get_consensus_engine

        consensus_engine = await get_consensus_engine()
        print("✓ Consensus engine initialized successfully")

        # Test that the engine has the parallel execution structure
        if hasattr(consensus_engine, 'pending_requests'):
            print("✓ Consensus engine has batching/parallelism structure")
        else:
            print("✗ Consensus engine missing parallelism structure")
            return False

        return True
    except Exception as e:
        print(f"✗ Consensus parallelism test failed: {e}")
        return False

async def test_performance_metrics():
    """Test the performance metrics collection"""
    try:
        from core.consensus_v2 import get_consensus_engine
        from core.network_manager import get_network_manager
        from gateway.universal_client import get_universal_client

        # Test consensus engine metrics
        consensus_engine = await get_consensus_engine()
        metrics = consensus_engine._get_performance_metrics()
        if "models" in metrics and "overall" in metrics:
            print("✓ Consensus engine metrics structure correct")
        else:
            print("✗ Consensus engine metrics structure incorrect")
            return False

        # Test network manager metrics
        network_manager = await get_network_manager()
        perf_metrics = network_manager.get_performance_metrics()
        if isinstance(perf_metrics, dict):
            print("✓ Network manager performance metrics working")
        else:
            print("✗ Network manager performance metrics failed")
            return False

        # Test universal client metrics
        universal_client = await get_universal_client()
        if hasattr(universal_client, '_collect_and_report_metrics'):
            print("✓ Universal client metrics collection available")
        else:
            print("✗ Universal client metrics collection missing")
            return False

        return True
    except Exception as e:
        print(f"✗ Performance metrics test failed: {e}")
        return False

async def test_metrics_endpoint():
    """Test the metrics endpoint"""
    try:
        async with httpx.AsyncClient() as client:
            # Test from localhost
            response = await client.get("http://localhost:8000/api/metrics", headers={"Host": "localhost"})

            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success":
                    print("✓ Metrics endpoint working correctly")

                    # Check for performance metrics
                    if "performance" in data:
                        print("✓ Performance metrics available in endpoint")
                    else:
                        print("✗ Performance metrics missing from endpoint")
                        return False

                    return True
                else:
                    print(f"✗ Metrics endpoint returned error: {data}")
                    return False
            else:
                print(f"✗ Metrics endpoint returned status code: {response.status_code}")
                return False
    except Exception as e:
        print(f"✗ Metrics endpoint test failed: {e}")
        return False

async def test_health_monitor():
    """Test the health monitor functionality"""
    try:
        from core.health_monitor import get_health_monitor

        health_monitor = await get_health_monitor()
        print("✓ Health monitor initialized successfully")

        # Test health report generation
        report = health_monitor.get_health_report(0.1)  # Last 6 minutes
        if "overall_status" in report:
            print("✓ Health report generation working")
        else:
            print("✗ Health report generation failed")
            return False

        return True
    except Exception as e:
        print(f"✗ Health monitor test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing JARVIS V5.0 Performance Optimizations...")

    # Run all tests
    tests = [
        test_connection_pool(),
        test_consensus_cache(),
        test_consensus_parallelism(),
        test_performance_metrics(),
        test_metrics_endpoint(),
        test_health_monitor()
    ]

    results = asyncio.run(asyncio.gather(*tests))

    if all(results):
        print("\n✓ All performance optimization tests passed!")
        sys.exit(0)
    else:
        print("\n✗ Some performance optimization tests failed.")
        sys.exit(1)
