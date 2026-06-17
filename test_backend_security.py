#!/usr/bin/env python3

import asyncio
import sys
import os
from pathlib import Path
import json
import tempfile

# Add the project directory to the path
sys.path.insert(0, os.path.abspath('.'))

async def test_error_handler():
    """Test the error handler functionality"""
    try:
        from core.error_handler import get_error_handler

        error_handler = get_error_handler()
        print("✓ Error handler initialized successfully")

        # Test error stats
        stats = error_handler.get_error_stats()
        print(f"✓ Error stats: {stats}")

        return True
    except Exception as e:
        print(f"✗ Error handler test failed: {e}")
        return False

async def test_request_validator():
    """Test the request validator functionality"""
    try:
        from gateway.validator import get_request_validator

        validator = get_request_validator()
        print("✓ Request validator initialized successfully")

        # Test safe input
        safe_input = {"role": "ARCHITECT", "model_id": "qwen2.5-coder:7b"}
        is_valid, msg = validator.validate_model_assignment_request(safe_input)
        if is_valid:
            print("✓ Safe input validation passed")
        else:
            print(f"✗ Safe input validation failed: {msg}")
            return False

        # Test dangerous input
        dangerous_input = {"role": "ARCHITECT", "model_id": "qwen2.5-coder:7b; rm -rf /"}
        is_valid, msg = validator.validate_model_assignment_request(dangerous_input)
        if not is_valid:
            print("✓ Dangerous input validation correctly rejected")
        else:
            print("✗ Dangerous input validation failed")
            return False

        # Test rate limiting
        for i in range(15):
            validator.rate_limiter.check_rate_limit("test_resource", "127.0.0.1", "chat")

        if not validator.rate_limiter.check_rate_limit("test_resource", "127.0.0.1", "chat"):
            print("✓ Rate limiting working correctly")
        else:
            print("✗ Rate limiting not working")
            return False

        return True
    except Exception as e:
        print(f"✗ Request validator test failed: {e}")
        return False

async def test_api_key_encryption():
    """Test the API key encryption functionality"""
    try:
        from security.encryption import get_api_key_encryptor

        encryptor = get_api_key_encryptor()
        print("✓ API key encryptor initialized successfully")

        # Test encryption/decryption
        test_key = "sk-or-test1234567890abcdef"
        encrypted = encryptor.encrypt_api_key(test_key)
        if encrypted:
            print("✓ API key encryption successful")
        else:
            print("✗ API key encryption failed")
            return False

        decrypted = encryptor.decrypt_api_key(encrypted)
        if decrypted == test_key:
            print("✓ API key decryption successful")
        else:
            print(f"✗ API key decryption failed: {decrypted}")
            return False

        # Test validation
        if encryptor.validate_api_key(test_key, "openrouter"):
            print("✓ API key validation successful")
        else:
            print("✗ API key validation failed")
            return False

        return True
    except Exception as e:
        print(f"✗ API key encryption test failed: {e}")
        return False

async def test_circuit_breaker():
    """Test the circuit breaker functionality"""
    try:
        from gateway.universal_client import CircuitBreaker

        cb = CircuitBreaker(max_failures=3, reset_timeout=5)
        print("✓ Circuit breaker initialized successfully")

        # Test initial state
        if cb.is_call_allowed():
            print("✓ Initial circuit state is CLOSED")
        else:
            print("✗ Initial circuit state is not CLOSED")
            return False

        # Test failure recording
        for i in range(3):
            cb.record_failure()

        if not cb.is_call_allowed():
            print("✓ Circuit opened after max failures")
        else:
            print("✗ Circuit did not open after max failures")
            return False

        # Test state reporting
        state = cb.get_state()
        if state["state"] == "OPEN":
            print("✓ Circuit state reporting correct")
        else:
            print(f"✗ Circuit state reporting incorrect: {state['state']}")
            return False

        return True
    except Exception as e:
        print(f"✗ Circuit breaker test failed: {e}")
        return False

async def test_model_registry_encryption():
    """Test that model registry properly encrypts API keys"""
    try:
        from models.registry import get_model_registry
        import yaml

        registry = get_model_registry()
        print("✓ Model registry initialized successfully")

        # Test that API keys are encrypted in memory
        for model_id, model in registry.models.items():
            if model.api_key and model.provider != "ollama":  # Cloud models should have encrypted keys
                # Check that the key doesn't look like plaintext
                if model.api_key.startswith("sk-") or model.api_key.startswith("mistral-") or model.api_key.startswith("together-"):
                    print(f"✗ Model {model_id} appears to have plaintext API key in memory")
                    return False
                else:
                    print(f"✓ Model {model_id} has encrypted API key in memory")
                    break

        return True
    except Exception as e:
        print(f"✗ Model registry encryption test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing JARVIS V5.0 Security and Resilience Features...")

    # Run all tests
    tests = [
        test_error_handler(),
        test_request_validator(),
        test_api_key_encryption(),
        test_circuit_breaker(),
        test_model_registry_encryption()
    ]

    results = asyncio.run(asyncio.gather(*tests))

    if all(results):
        print("\n✓ All security and resilience tests passed!")
        sys.exit(0)
    else:
        print("\n✗ Some security and resilience tests failed.")
        sys.exit(1)
