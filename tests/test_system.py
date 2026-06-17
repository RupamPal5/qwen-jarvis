#!/usr/bin/env python3
"""
Comprehensive test suite for JARVIS V5.0 system reliability and performance.

This test suite verifies the core functionality, error handling, and resilience
features of the JARVIS V5.0 architecture.
"""

import unittest
import asyncio
import os
import sys
import tempfile
import json
import time
import httpx
from pathlib import Path
from unittest.mock import patch, MagicMock, AsyncMock
from typing import Dict, Any, List
import yaml

# Add the project directory to the path
sys.path.insert(0, os.path.abspath('.'))

from models.registry import get_model_registry, ModelEntry
from core.consensus_v2 import get_consensus_engine, ConsensusEngineV2
from core.role_manager import get_role_manager
from core.network_manager import get_network_manager, NetworkManager
from core.health_monitor import get_health_monitor, HealthMonitor
from gateway.validator import get_request_validator, RequestValidator
from security.encryption import get_api_key_encryptor, APIKeyEncryptor
from security.protocol import get_security_protocol
from backend.main import app
from fastapi.testclient import TestClient

class TestSystem(unittest.TestCase):
    """Comprehensive test suite for JARVIS V5.0 system."""

    @classmethod
    def setUpClass(cls):
        """Set up test environment."""
        cls.client = TestClient(app)
        cls.test_api_key = "sk-or-test1234567890abcdef"
        cls.test_encryption_key = "Z2JGZ2h0aHlqbGtqbGtqbGtqbGtqbGtqbGtqbGtqYmU="

        # Create a temporary models.yaml for testing
        cls.temp_models_file = Path("config/models_test.yaml")
        cls._create_test_models_file()

        # Create a temporary encryption key file
        cls._setup_test_encryption()

    @classmethod
    def tearDownClass(cls):
        """Clean up test environment."""
        if cls.temp_models_file.exists():
            cls.temp_models_file.unlink()

    @classmethod
    def _create_test_models_file(cls):
        """Create a test models.yaml file."""
        test_models = {
            "models": {
                "qwen2.5-coder:7b": {
                    "provider": "ollama",
                    "model_name": "qwen2.5-coder:7b",
                    "endpoint": "http://localhost:11434",
                    "context_window": 32000,
                    "speed_rating": 7,
                    "is_local": True,
                    "is_active": True
                },
                "gemini-2.5-flash": {
                    "provider": "gemini",
                    "model_name": "gemini-1.5-flash-latest",
                    "api_key": cls.test_api_key,
                    "context_window": 1000000,
                    "speed_rating": 4,
                    "is_local": False,
                    "is_active": True
                },
                "mistral-codestral": {
                    "provider": "mistral",
                    "model_name": "codestral-latest",
                    "api_key": "mistral-test1234567890",
                    "context_window": 32000,
                    "speed_rating": 5,
                    "is_local": False,
                    "is_active": True
                },
                "llama3.2:3b": {
                    "provider": "ollama",
                    "model_name": "llama3.2:3b",
                    "endpoint": "http://localhost:11434",
                    "context_window": 8000,
                    "speed_rating": 9,
                    "is_local": True,
                    "is_active": True
                }
            }
        }

        with open(cls.temp_models_file, 'w') as f:
            yaml.dump(test_models, f)

    @classmethod
    def _setup_test_encryption(cls):
        """Set up test encryption environment."""
        # Set test encryption key
        os.environ["ENCRYPTION_KEY"] = cls.test_encryption_key

    def setUp(self):
        """Set up each test."""
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)

    def tearDown(self):
        """Clean up after each test."""
        self.loop.close()

    def test_01_model_registry_ping(self):
        """Test 1: Verify all models can be successfully pinged."""
        print("\n=== Test 1: Model Registry Ping ===")

        async def run_test():
            # Create a test registry with our test file
            with patch("models.registry.ModelRegistry.config_path", self.temp_models_file):
                registry = get_model_registry()

                # Mock the network manager to avoid actual network calls
                network_manager = await get_network_manager()

                # Test each model
                for model_id, model in registry.models.items():
                    print(f"Testing model: {model_id}")

                    if model.is_local:
                        # Mock Ollama ping
                        with patch.object(network_manager, '_check_port_open', return_value=True):
                            with patch.object(network_manager, '_check_local_model', return_value={"available": True}):
                                status = await network_manager._check_model_health(model)
                                self.assertTrue(status["available"], f"Model {model_id} should be available")
                                print(f"✓ Local model {model_id} ping successful")
                    else:
                        # Mock cloud API ping
                        with patch.object(network_manager, '_check_cloud_model', return_value={"available": True}):
                            status = await network_manager._check_model_health(model)
                            self.assertTrue(status["available"], f"Model {model_id} should be available")
                            print(f"✓ Cloud model {model_id} ping successful")

        self.loop.run_until_complete(run_test())

    def test_02_consensus_engine_combinations(self):
        """Test 2: Verify consensus engine works with different model combinations."""
        print("\n=== Test 2: Consensus Engine Combinations ===")

        async def run_test():
            # Create a test registry with our test file
            with patch("models.registry.ModelRegistry.config_path", self.temp_models_file):
                registry = get_model_registry()
                role_manager = get_role_manager()
                consensus_engine = await get_consensus_engine()

                # Define test combinations
                test_combinations = [
                    {
                        "name": "Qwen/Gemini/Mistral",
                        "models": {
                            "ARCHITECT": "qwen2.5-coder:7b",
                            "ARBITER": "gemini-2.5-flash",
                            "JUDGE": "mistral-codestral"
                        }
                    },
                    {
                        "name": "Llama/Llama/Llama",
                        "models": {
                            "ARCHITECT": "llama3.2:3b",
                            "ARBITER": "llama3.2:3b",
                            "JUDGE": "llama3.2:3b"
                        }
                    }
                ]

                test_input = "Create a simple Python function to add two numbers"

                for combo in test_combinations:
                    print(f"Testing combination: {combo['name']}")

                    # Assign models to roles
                    for role, model_id in combo["models"].items():
                        success = role_manager.assign_role(role, model_id)
                        self.assertTrue(success, f"Failed to assign {model_id} to {role}")

                    # Mock the model calls to avoid actual API calls
                    with patch.object(consensus_engine, '_call_architect', return_value=MagicMock(
                        content="Here's a simple function:\n```python\ndef add(a, b):\n    return a + b\n```",
                        model="test_model",
                        latency=0.1
                    )):
                        with patch.object(consensus_engine, '_call_arbiter', return_value={
                            "is_safe": True,
                            "details": "No security issues detected"
                        }):
                            with patch.object(consensus_engine, '_get_human_authorization', return_value=True):
                                with patch.object(consensus_engine, '_call_judge', return_value=MagicMock(
                                    content="path/to/file.py\n<<<<<<< SEARCH\n=======\ndef add(a, b):\n    return a + b\n>>>>>>> REPLACE",
                                    model="test_model",
                                    latency=0.1
                                )):
                                    # Execute consensus
                                    result = await consensus_engine.execute_consensus(test_input)

                                    # Verify result
                                    self.assertEqual(result["status"], "success")
                                    self.assertIsNotNone(result["architect_response"])
                                    self.assertIsNotNone(result["audit_result"])
                                    self.assertIsNotNone(result["execution_result"])
                                    print(f"✓ Combination {combo['name']} executed successfully")

        self.loop.run_until_complete(run_test())

    def test_03_hot_swap_models(self):
        """Test 3: Verify hot-swapping models without crashing."""
        print("\n=== Test 3: Hot Swap Models ===")

        async def run_test():
            # Create a test registry with our test file
            with patch("models.registry.ModelRegistry.config_path", self.temp_models_file):
                role_manager = get_role_manager()

                # Initial configuration
                initial_config = {
                    "architect": "qwen2.5-coder:7b",
                    "arbiter": "gemini-2.5-flash",
                    "judge": "mistral-codestral"
                }

                # New configuration
                new_config = {
                    "architect": "llama3.2:3b",
                    "arbiter": "gemini-2.5-flash",
                    "judge": "qwen2.5-coder:7b"
                }

                # Apply initial configuration
                response = self.client.post("/api/config/apply", json=initial_config)
                self.assertEqual(response.status_code, 200)
                result = response.json()
                self.assertEqual(result["status"], "success")
                print("✓ Initial configuration applied successfully")

                # Verify initial configuration
                current_assignments = role_manager.get_all_assignments()
                self.assertEqual(current_assignments["ARCHITECT"], initial_config["architect"])
                self.assertEqual(current_assignments["ARBITER"], initial_config["arbiter"])
                self.assertEqual(current_assignments["JUDGE"], initial_config["judge"])
                print("✓ Initial configuration verified")

                # Apply new configuration
                response = self.client.post("/api/config/apply", json=new_config)
                self.assertEqual(response.status_code, 200)
                result = response.json()
                self.assertEqual(result["status"], "success")
                print("✓ New configuration applied successfully")

                # Verify new configuration
                current_assignments = role_manager.get_all_assignments()
                self.assertEqual(current_assignments["ARCHITECT"], new_config["architect"])
                self.assertEqual(current_assignments["ARBITER"], new_config["arbiter"])
                self.assertEqual(current_assignments["JUDGE"], new_config["judge"])
                print("✓ New configuration verified")

                # Test that the system is still functional
                with patch("core.consensus_v2.ConsensusEngineV2._call_architect", return_value=MagicMock(
                    content="Test response",
                    model="test_model",
                    latency=0.1
                )):
                    with patch("core.consensus_v2.ConsensusEngineV2._call_arbiter", return_value={
                        "is_safe": True,
                        "details": "No issues"
                    }):
                        with patch("core.consensus_v2.ConsensusEngineV2._get_human_authorization", return_value=True):
                            with patch("core.consensus_v2.ConsensusEngineV2._call_judge", return_value=MagicMock(
                                content="Test execution",
                                model="test_model",
                                latency=0.1
                            )):
                                consensus_engine = await get_consensus_engine()
                                result = await consensus_engine.execute_consensus("Test input")
                                self.assertEqual(result["status"], "success")
                                print("✓ System remains functional after hot-swap")

        self.loop.run_until_complete(run_test())

    def test_04_error_handling_graceful_degradation(self):
        """Test 4: Verify graceful degradation on cloud API failure."""
        print("\n=== Test 4: Error Handling Graceful Degradation ===")

        async def run_test():
            # Create a test registry with our test file
            with patch("models.registry.ModelRegistry.config_path", self.temp_models_file):
                role_manager = get_role_manager()
                consensus_engine = await get_consensus_engine()
                from core.error_handler import get_error_handler
                error_handler = get_error_handler()

                # Configure with a cloud model as architect
                config = {
                    "architect": "gemini-2.5-flash",  # Cloud model
                    "arbiter": "qwen2.5-coder:7b",     # Local model
                    "judge": "mistral-codestral"      # Cloud model
                }

                # Apply configuration
                response = self.client.post("/api/config/apply", json=config)
                self.assertEqual(response.status_code, 200)

                # Verify initial state
                self.assertFalse(error_handler.is_circuit_breaker_triggered())
                print("✓ Initial state verified")

                # Mock the architect call to fail (simulate cloud API failure)
                with patch.object(consensus_engine, '_call_architect', side_effect=Exception("Cloud API failure")):
                    with patch.object(consensus_engine, '_call_arbiter', return_value={
                        "is_safe": True,
                        "details": "No issues"
                    }):
                        with patch.object(consensus_engine, '_get_human_authorization', return_value=True):
                            with patch.object(consensus_engine, '_call_judge', return_value=MagicMock(
                                content="Test execution",
                                model="test_model",
                                latency=0.1
                            )):
                                # Execute consensus - this should trigger graceful degradation
                                result = await consensus_engine.execute_consensus("Test input")

                                # The system should still return a result (fallback to local model)
                                self.assertEqual(result["status"], "success")
                                print("✓ System gracefully handled cloud API failure")

                                # Verify circuit breaker state (should not be triggered for single failure)
                                self.assertFalse(error_handler.is_circuit_breaker_triggered())
                                print("✓ Circuit breaker not triggered for single failure")

                # Test multiple failures to trigger circuit breaker
                with patch.object(consensus_engine, '_call_architect', side_effect=Exception("Cloud API failure")):
                    for i in range(5):  # Multiple failures
                        try:
                            await consensus_engine.execute_consensus("Test input")
                        except Exception:
                            pass  # Expected to fail

                    # Verify circuit breaker is triggered
                    self.assertTrue(error_handler.is_circuit_breaker_triggered())
                    print("✓ Circuit breaker triggered after multiple failures")

                    # Verify fallback model is used
                    current_assignments = role_manager.get_all_assignments()
                    self.assertEqual(current_assignments["ARCHITECT"], "qwen2.5:1.5b")  # Fallback model
                    print("✓ Fallback model assigned")

        self.loop.run_until_complete(run_test())

    def test_05_health_monitor_auto_disable(self):
        """Test 5: Verify health monitor auto-disables failing models."""
        print("\n=== Test 5: Health Monitor Auto Disable ===")

        async def run_test():
            # Create a test registry with our test file
            with patch("models.registry.ModelRegistry.config_path", self.temp_models_file):
                registry = get_model_registry()
                network_manager = await get_network_manager()
                health_monitor = await get_health_monitor()

                # Start monitoring
                await health_monitor.start_monitoring()

                # Mock a model to fail 3 consecutive times
                test_model_id = "gemini-2.5-flash"
                test_model = registry.get_model(test_model_id)

                # Mock the health check to fail
                with patch.object(network_manager, '_check_cloud_model', return_value={"available": False, "error": "API failure"}):
                    # Run 3 health checks (should trigger auto-disable)
                    for i in range(3):
                        await network_manager._check_model_health(test_model)

                    # Give the health monitor time to process
                    await asyncio.sleep(0.1)

                    # Check model status
                    model_status = network_manager.get_model_status(test_model_id)
                    self.assertIsNotNone(model_status)
                    self.assertTrue(model_status.is_disabled)
                    print("✓ Model auto-disabled after 3 consecutive failures")

                    # Verify the model is marked as inactive in the registry
                    # Note: The registry doesn't automatically update, but the network manager should track it
                    self.assertFalse(model_status.available)
                    print("✓ Model marked as unavailable")

                # Stop monitoring
                await health_monitor.stop_monitoring()

        self.loop.run_until_complete(run_test())

    def test_06_rate_limiting_enforcement(self):
        """Test 6: Verify rate limiting enforcement."""
        print("\n=== Test 6: Rate Limiting Enforcement ===")

        async def run_test():
            validator = get_request_validator()

            # Test resource and client
            test_resource = "test_model"
            test_client_ip = "192.168.1.100"

            # Make 100 requests (just under the limit)
            for i in range(100):
                allowed = validator.rate_limiter.check_rate_limit(test_resource, test_client_ip, "chat")
                self.assertTrue(allowed, f"Request {i+1} should be allowed")

            print("✓ 100 requests allowed (under limit)")

            # The 101st request should be rate limited
            allowed = validator.rate_limiter.check_rate_limit(test_resource, test_client_ip, "chat")
            self.assertFalse(allowed, "101st request should be rate limited")

            print("✓ 101st request correctly rate limited")

            # Test model switch rate limiting (10 requests per minute)
            test_resource = "model_assignment"
            for i in range(10):
                allowed = validator.rate_limiter.check_rate_limit(test_resource, test_client_ip, "model_switch")
                self.assertTrue(allowed, f"Model switch request {i+1} should be allowed")

            print("✓ 10 model switch requests allowed (under limit)")

            # The 11th request should be rate limited
            allowed = validator.rate_limiter.check_rate_limit(test_resource, test_client_ip, "model_switch")
            self.assertFalse(allowed, "11th model switch request should be rate limited")

            print("✓ 11th model switch request correctly rate limited")

            # Test that different clients have separate rate limits
            different_client_ip = "192.168.1.101"
            allowed = validator.rate_limiter.check_rate_limit(test_resource, different_client_ip, "chat")
            self.assertTrue(allowed, "Different client should have separate rate limit")

            print("✓ Different clients have separate rate limits")

        self.loop.run_until_complete(run_test())

    def test_07_api_key_encryption(self):
        """Test 7: Verify API key encryption and decryption."""
        print("\n=== Test 7: API Key Encryption ===")

        # Test with the test encryption key
        os.environ["ENCRYPTION_KEY"] = self.test_encryption_key
        encryptor = get_api_key_encryptor()

        # Test various API key formats
        test_keys = [
            "sk-or-test1234567890abcdef",  # OpenRouter
            "mistral-test1234567890",      # Mistral
            "together-test1234567890",     # Together
            "gemini-test1234567890abcdef", # Gemini
            "test-key-1234567890"          # Generic
        ]

        for test_key in test_keys:
            print(f"Testing encryption/decryption for key: {test_key[:8]}...")

            # Encrypt the key
            encrypted = encryptor.encrypt_api_key(test_key)
            self.assertIsNotNone(encrypted, "Encryption should succeed")
            self.assertNotEqual(encrypted, test_key, "Encrypted key should be different from plaintext")

            # Decrypt the key
            decrypted = encryptor.decrypt_api_key(encrypted)
            self.assertEqual(decrypted, test_key, "Decrypted key should match original")

            # Verify the encrypted key doesn't contain the original key
            self.assertNotIn(test_key, encrypted, "Encrypted key should not contain plaintext")

            print(f"✓ Key encryption/decryption successful for {test_key[:8]}...")

        # Test that the model registry properly encrypts API keys
        with patch("models.registry.ModelRegistry.config_path", self.temp_models_file):
            registry = get_model_registry()

            # Find a cloud model with an API key
            cloud_model = None
            for model_id, model in registry.models.items():
                if not model.is_local and model.api_key:
                    cloud_model = model
                    break

            self.assertIsNotNone(cloud_model, "Should have at least one cloud model with API key")

            if cloud_model:
                # Verify the API key is encrypted in memory
                self.assertNotIn(self.test_api_key, cloud_model.api_key,
                                "API key should be encrypted in memory")
                print("✓ API key is encrypted in model registry memory")

                # Test decryption
                decrypted_key = get_security_protocol().decrypt_api_key(cloud_model.api_key)
                self.assertEqual(decrypted_key, self.test_api_key,
                                "Decrypted API key should match original")
                print("✓ API key decryption from registry successful")

if __name__ == "__main__":
    unittest.main(verbosity=2)
