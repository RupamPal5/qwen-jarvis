#!/usr/bin/env python3

import asyncio
import sys
import os
from pathlib import Path

# Add the project directory to the path
sys.path.insert(0, os.path.abspath('.'))

async def test_model_registry():
    """Test the model registry functionality"""
    try:
        from models.registry import get_model_registry

        registry = get_model_registry()
        print(f"✓ Loaded {len(registry.models)} models from registry")

        # Test getting a model
        test_model = registry.get_model("qwen2.5-coder:7b")
        if not test_model:
            print("✗ Failed to get test model")
            return False

        print(f"✓ Successfully retrieved model: {test_model.model_id}")
        return True
    except Exception as e:
        print(f"✗ Model registry test failed: {e}")
        return False

async def test_role_manager():
    """Test the role manager functionality"""
    try:
        from core.role_manager import get_role_manager

        role_manager = get_role_manager()

        # Test assigning a role
        success = role_manager.assign_role("ARCHITECT", "qwen2.5-coder:7b")
        if not success:
            print("✗ Failed to assign role")
            return False

        print("✓ Successfully assigned role")

        # Test getting assigned model
        model = role_manager.get_assigned_model("ARCHITECT")
        if not model:
            print("✗ Failed to get assigned model")
            return False

        print(f"✓ Assigned model: {model.model_id}")
        return True
    except Exception as e:
        print(f"✗ Role manager test failed: {e}")
        return False

async def test_consensus_engine():
    """Test the consensus engine functionality"""
    try:
        from core.consensus_v2 import get_consensus_engine

        consensus_engine = await get_consensus_engine()

        # Test executing consensus
        result = await consensus_engine.execute_consensus("Test input")
        if not result or result.get("status") != "success":
            print("✗ Failed to execute consensus")
            return False

        print("✓ Successfully executed consensus")
        return True
    except Exception as e:
        print(f"✗ Consensus engine test failed: {e}")
        return False

async def test_network_manager():
    """Test the network manager functionality"""
    try:
        from core.network_manager import get_network_manager

        network_manager = await get_network_manager()

        # Test checking model status
        status = network_manager.get_model_status("qwen2.5-coder:7b")
        if not status:
            print("✗ Failed to get model status")
            return False

        print(f"✓ Model status: {status}")
        return True
    except Exception as e:
        print(f"✗ Network manager test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing JARVIS V5.0 architecture...")

    # Run all tests
    tests = [
        test_model_registry(),
        test_role_manager(),
        test_consensus_engine(),
        test_network_manager()
    ]

    results = asyncio.run(asyncio.gather(*tests))

    if all(results):
        print("\n✓ All tests passed! Architecture is ready.")
        sys.exit(0)
    else:
        print("\n✗ Some tests failed.")
        sys.exit(1)
