import asyncio
import logging
import socket
import subprocess
import os
import sys
from typing import Dict, Any, Tuple
from pathlib import Path
import httpx
from models.registry import get_model_registry
from security.protocol import get_security_protocol
from security.encryption import get_api_key_encryptor

logger = logging.getLogger(__name__)

class PreflightCheck:
    """Performs preflight checks before server startup."""

    def __init__(self):
        """Initialize the preflight checker."""
        self.model_registry = get_model_registry()
        self.security_protocol = get_security_protocol()
        self.checks: Dict[str, Dict[str, Any]] = {}
        self.critical_failures = 0
        self.warning_count = 0

    async def run_all_checks(self) -> bool:
        """Run all preflight checks.

        Returns:
            bool: True if all critical checks passed, False otherwise
        """
        logger.info("Starting preflight checks...")

        # System checks
        await self.check_ports()
        await self.check_disk_space()
        await self.check_memory()

        # Service checks
        await self.check_ollama_service()
        await self.check_api_keys()

        # Model checks
        await self.check_local_models()
        await self.check_cloud_models()

        # Configuration checks
        self.check_model_assignments()
        self.check_security_configuration()

        # Report results
        self._report_results()

        if self.critical_failures > 0:
            logger.error(f"Preflight checks failed with {self.critical_failures} critical failures")
            return False
        else:
            logger.info("Preflight checks completed successfully")
            return True

    async def check_ports(self) -> None:
        """Check that required ports are available."""
        required_ports = {
            "Backend (8000)": 8000,
            "Frontend (5173)": 5173,
            "Ollama (11434)": 11434
        }

        self.checks["port_availability"] = {
            "name": "Port Availability",
            "description": "Check that required ports are not in use",
            "checks": {}
        }

        for name, port in required_ports.items():
            try:
                available = await self._check_port_available(port)
                self.checks["port_availability"]["checks"][name] = {
                    "port": port,
                    "available": available,
                    "status": "passed" if available else "failed",
                    "severity": "critical" if not available else "info"
                }

                if not available:
                    self.critical_failures += 1
                    logger.error(f"Port {port} ({name}) is already in use")
                else:
                    logger.info(f"Port {port} ({name}) is available")

            except Exception as e:
                self.checks["port_availability"]["checks"][name] = {
                    "port": port,
                    "available": False,
                    "status": "error",
                    "error": str(e),
                    "severity": "critical"
                }
                self.critical_failures += 1
                logger.error(f"Error checking port {port} ({name}): {str(e)}")

    async def check_disk_space(self) -> None:
        """Check available disk space."""
        self.checks["disk_space"] = {
            "name": "Disk Space",
            "description": "Check available disk space",
            "checks": {}
        }

        try:
            # Check root directory
            stat = os.statvfs('/')
            free_space_gb = (stat.f_frsize * stat.f_bavail) / (1024 ** 3)
            min_required = 5  # GB

            self.checks["disk_space"]["checks"]["root"] = {
                "free_space_gb": round(free_space_gb, 2),
                "min_required_gb": min_required,
                "status": "passed" if free_space_gb >= min_required else "warning",
                "severity": "warning" if free_space_gb < min_required else "info"
            }

            if free_space_gb < min_required:
                self.warning_count += 1
                logger.warning(f"Low disk space: {free_space_gb}GB available, {min_required}GB recommended")

        except Exception as e:
            self.checks["disk_space"]["checks"]["root"] = {
                "status": "error",
                "error": str(e),
                "severity": "warning"
            }
            self.warning_count += 1
            logger.warning(f"Error checking disk space: {str(e)}")

    async def check_memory(self) -> None:
        """Check available memory."""
        self.checks["memory"] = {
            "name": "Memory",
            "description": "Check available system memory",
            "checks": {}
        }

        try:
            # This is platform specific
            if sys.platform == "linux" or sys.platform == "darwin":
                result = subprocess.run(
                    ["free", "-g"] if sys.platform == "linux" else ["vm_stat"],
                    capture_output=True,
                    text=True
                )

                if result.returncode == 0:
                    self.checks["memory"]["checks"]["system"] = {
                        "status": "passed",
                        "details": result.stdout,
                        "severity": "info"
                    }
                    logger.info("Memory check completed")
                else:
                    self.checks["memory"]["checks"]["system"] = {
                        "status": "warning",
                        "error": result.stderr,
                        "severity": "warning"
                    }
                    self.warning_count += 1
                    logger.warning(f"Memory check failed: {result.stderr}")

            else:
                self.checks["memory"]["checks"]["system"] = {
                    "status": "skipped",
                    "message": "Memory check not supported on this platform",
                    "severity": "info"
                }
                logger.info("Memory check skipped (unsupported platform)")

        except Exception as e:
            self.checks["memory"]["checks"]["system"] = {
                "status": "error",
                "error": str(e),
                "severity": "warning"
            }
            self.warning_count += 1
            logger.warning(f"Error checking memory: {str(e)}")

    async def check_ollama_service(self) -> None:
        """Check if Ollama service is running and accessible."""
        self.checks["ollama_service"] = {
            "name": "Ollama Service",
            "description": "Check if Ollama service is running and accessible",
            "checks": {}
        }

        try:
            # Check if port is open
            port_open = await self._check_port_open("localhost", 11434)
            self.checks["ollama_service"]["checks"]["port"] = {
                "port": 11434,
                "open": port_open,
                "status": "passed" if port_open else "failed",
                "severity": "critical" if not port_open else "info"
            }

            if not port_open:
                self.critical_failures += 1
                logger.error("Ollama service is not running (port 11434 not open)")
                return

            # Check if we can communicate with Ollama
            try:
                async with httpx.AsyncClient(timeout=10) as client:
                    response = await client.get("http://localhost:11434/api/version")
                    if response.status_code == 200:
                        version = response.json().get("version", "unknown")
                        self.checks["ollama_service"]["checks"]["api"] = {
                            "status": "passed",
                            "version": version,
                            "severity": "info"
                        }
                        logger.info(f"Ollama service is running (version: {version})")
                    else:
                        self.checks["ollama_service"]["checks"]["api"] = {
                            "status": "failed",
                            "error": f"HTTP {response.status_code}",
                            "severity": "critical"
                        }
                        self.critical_failures += 1
                        logger.error(f"Ollama API returned HTTP {response.status_code}")

            except Exception as e:
                self.checks["ollama_service"]["checks"]["api"] = {
                    "status": "failed",
                    "error": str(e),
                    "severity": "critical"
                }
                self.critical_failures += 1
                logger.error(f"Failed to communicate with Ollama API: {str(e)}")

        except Exception as e:
            self.checks["ollama_service"]["checks"]["port"] = {
                "port": 11434,
                "open": False,
                "status": "error",
                "error": str(e),
                "severity": "critical"
            }
            self.critical_failures += 1
            logger.error(f"Error checking Ollama service: {str(e)}")

    async def check_api_keys(self) -> None:
        """Check that required API keys are configured and properly encrypted."""
        self.checks["api_keys"] = {
            "name": "API Keys",
            "description": "Check that required API keys are configured and properly encrypted",
            "checks": {}
        }

        required_keys = {
            "GEMINI_API_KEY": "Gemini API key",
            "MISTRAL_API_KEY": "Mistral API key",
            "TOGETHER_API_KEY": "Together API key",
            "OPENROUTER_API_KEY": "OpenRouter API key"
        }

        encryptor = get_api_key_encryptor()

        for env_var, description in required_keys.items():
            key_value = os.getenv(env_var)
            if key_value:
                # Validate API key format
                if env_var == "GEMINI_API_KEY":
                    is_valid = len(key_value) > 30 and key_value.isalnum()
                elif env_var == "MISTRAL_API_KEY":
                    is_valid = key_value.startswith("mistral-") and len(key_value) > 20
                elif env_var == "TOGETHER_API_KEY":
                    is_valid = key_value.startswith("together-") and len(key_value) > 20
                elif env_var == "OPENROUTER_API_KEY":
                    is_valid = key_value.startswith("sk-or-") and len(key_value) > 20
                else:
                    is_valid = len(key_value) >= 10

                if is_valid:
                    # Test encryption/decryption
                    try:
                        encrypted = encryptor.encrypt_api_key(key_value)
                        decrypted = encryptor.decrypt_api_key(encrypted) if encrypted else None
                        encryption_works = decrypted == key_value

                        self.checks["api_keys"]["checks"][env_var] = {
                            "status": "passed" if encryption_works else "failed",
                            "configured": True,
                            "valid_format": True,
                            "encryption_works": encryption_works,
                            "severity": "info" if encryption_works else "critical"
                        }

                        if encryption_works:
                            logger.info(f"{description} is configured and encryption works")
                        else:
                            self.critical_failures += 1
                            logger.error(f"{description} encryption/decryption failed")
                    except Exception as e:
                        self.checks["api_keys"]["checks"][env_var] = {
                            "status": "failed",
                            "configured": True,
                            "valid_format": True,
                            "encryption_works": False,
                            "error": str(e),
                            "severity": "critical"
                        }
                        self.critical_failures += 1
                        logger.error(f"{description} encryption test failed: {str(e)}")
                else:
                    self.checks["api_keys"]["checks"][env_var] = {
                        "status": "failed",
                        "configured": True,
                        "valid_format": False,
                        "severity": "warning"
                    }
                    self.warning_count += 1
                    logger.warning(f"{description} has invalid format")
            else:
                self.checks["api_keys"]["checks"][env_var] = {
                    "status": "warning",
                    "configured": False,
                    "severity": "warning"
                }
                self.warning_count += 1
                logger.warning(f"{description} is not configured")

    async def check_local_models(self) -> None:
        """Check that local models are available."""
        self.checks["local_models"] = {
            "name": "Local Models",
            "description": "Check that local models are available and accessible",
            "checks": {}
        }

        local_models = self.model_registry.get_local_models()

        if not local_models:
            self.checks["local_models"]["checks"]["overall"] = {
                "status": "warning",
                "message": "No local models configured",
                "severity": "warning"
            }
            self.warning_count += 1
            logger.warning("No local models configured")
            return

        for model in local_models:
            try:
                # Check if Ollama knows about this model
                result = subprocess.run(
                    ["ollama", "list"],
                    capture_output=True,
                    text=True,
                    timeout=10
                )

                if result.returncode == 0:
                    model_available = model.model_name in result.stdout
                    self.checks["local_models"]["checks"][model.model_id] = {
                        "status": "passed" if model_available else "failed",
                        "available": model_available,
                        "severity": "warning" if not model_available else "info"
                    }

                    if not model_available:
                        self.warning_count += 1
                        logger.warning(f"Local model {model.model_id} ({model.model_name}) not found in Ollama")
                    else:
                        logger.info(f"Local model {model.model_id} is available")
                else:
                    self.checks["local_models"]["checks"][model.model_id] = {
                        "status": "error",
                        "error": result.stderr,
                        "severity": "warning"
                    }
                    self.warning_count += 1
                    logger.warning(f"Error checking local model {model.model_id}: {result.stderr}")

            except subprocess.TimeoutExpired:
                self.checks["local_models"]["checks"][model.model_id] = {
                    "status": "error",
                    "error": "Command timed out",
                    "severity": "warning"
                }
                self.warning_count += 1
                logger.warning(f"Timeout checking local model {model.model_id}")
            except Exception as e:
                self.checks["local_models"]["checks"][model.model_id] = {
                    "status": "error",
                    "error": str(e),
                    "severity": "warning"
                }
                self.warning_count += 1
                logger.warning(f"Error checking local model {model.model_id}: {str(e)}")

    async def check_cloud_models(self) -> None:
        """Check that cloud models have valid API keys and can be decrypted."""
        self.checks["cloud_models"] = {
            "name": "Cloud Models",
            "description": "Check that cloud models have valid API keys and can be decrypted",
            "checks": {}
        }

        cloud_models = self.model_registry.get_cloud_models()

        if not cloud_models:
            self.checks["cloud_models"]["checks"]["overall"] = {
                "status": "info",
                "message": "No cloud models configured",
                "severity": "info"
            }
            logger.info("No cloud models configured")
            return

        for model in cloud_models:
            if not model.api_key:
                self.checks["cloud_models"]["checks"][model.model_id] = {
                    "status": "warning",
                    "message": "API key not configured",
                    "severity": "warning"
                }
                self.warning_count += 1
                logger.warning(f"Cloud model {model.model_id} has no API key configured")
                continue

            # Try to decrypt the API key to verify it's valid
            try:
                decrypted_key = self.security_protocol.decrypt_api_key(model.api_key)
                if decrypted_key:
                    # Validate the decrypted key format
                    encryptor = get_api_key_encryptor()
                    is_valid = encryptor.validate_api_key(decrypted_key, model.provider)

                    if is_valid:
                        self.checks["cloud_models"]["checks"][model.model_id] = {
                            "status": "passed",
                            "message": "API key is valid and properly encrypted",
                            "severity": "info"
                        }
                        logger.info(f"Cloud model {model.model_id} API key is valid and properly encrypted")
                    else:
                        self.checks["cloud_models"]["checks"][model.model_id] = {
                            "status": "failed",
                            "message": "API key format is invalid",
                            "severity": "warning"
                        }
                        self.warning_count += 1
                        logger.warning(f"Cloud model {model.model_id} API key format is invalid")
                else:
                    self.checks["cloud_models"]["checks"][model.model_id] = {
                        "status": "failed",
                        "message": "API key decryption failed",
                        "severity": "critical"
                    }
                    self.critical_failures += 1
                    logger.error(f"Cloud model {model.model_id} API key decryption failed")
            except Exception as e:
                self.checks["cloud_models"]["checks"][model.model_id] = {
                    "status": "failed",
                    "message": f"API key validation failed: {str(e)}",
                    "severity": "critical"
                }
                self.critical_failures += 1
                logger.error(f"Cloud model {model.model_id} API key validation failed: {str(e)}")

    def check_model_assignments(self) -> None:
        """Check that all roles have models assigned."""
        self.checks["model_assignments"] = {
            "name": "Model Assignments",
            "description": "Check that all roles have models assigned",
            "checks": {}
        }

        role_assignments = self.model_registry.get_role_manager().get_all_assignments()

        for role, model_id in role_assignments.items():
            if model_id:
                model = self.model_registry.get_model(model_id)
                if model and model.is_active:
                    self.checks["model_assignments"]["checks"][role] = {
                        "status": "passed",
                        "model_id": model_id,
                        "severity": "info"
                    }
                    logger.info(f"Role {role} assigned to model {model_id}")
                else:
                    self.checks["model_assignments"]["checks"][role] = {
                        "status": "failed",
                        "model_id": model_id,
                        "message": "Assigned model is not active or not found",
                        "severity": "critical"
                    }
                    self.critical_failures += 1
                    logger.error(f"Role {role} assigned to inactive or missing model {model_id}")
            else:
                self.checks["model_assignments"]["checks"][role] = {
                    "status": "failed",
                    "message": "No model assigned",
                    "severity": "critical"
                }
                self.critical_failures += 1
                logger.error(f"Role {role} has no model assigned")

    def check_security_configuration(self) -> None:
        """Check security configuration."""
        self.checks["security_configuration"] = {
            "name": "Security Configuration",
            "description": "Check security configuration",
            "checks": {}
        }

        try:
            # Check encryption key
            if self.security_protocol.fernet:
                self.checks["security_configuration"]["checks"]["encryption"] = {
                    "status": "passed",
                    "message": "Encryption is configured",
                    "severity": "info"
                }
                logger.info("Encryption is configured")
            else:
                self.checks["security_configuration"]["checks"]["encryption"] = {
                    "status": "failed",
                    "message": "Encryption is not configured",
                    "severity": "critical"
                }
                self.critical_failures += 1
                logger.error("Encryption is not configured")

            # Check audit log
            if len(self.security_protocol.audit_log) > 0:
                self.checks["security_configuration"]["checks"]["audit_log"] = {
                    "status": "passed",
                    "events": len(self.security_protocol.audit_log),
                    "severity": "info"
                }
                logger.info(f"Audit log contains {len(self.security_protocol.audit_log)} events")
            else:
                self.checks["security_configuration"]["checks"]["audit_log"] = {
                    "status": "warning",
                    "message": "Audit log is empty",
                    "severity": "warning"
                }
                self.warning_count += 1
                logger.warning("Audit log is empty")

        except Exception as e:
            self.checks["security_configuration"]["checks"]["overall"] = {
                "status": "error",
                "error": str(e),
                "severity": "critical"
            }
            self.critical_failures += 1
            logger.error(f"Error checking security configuration: {str(e)}")

    async def _check_port_available(self, port: int) -> bool:
        """Check if a port is available.

        Args:
            port: The port to check

        Returns:
            bool: True if port is available, False otherwise
        """
        try:
            _, writer = await asyncio.wait_for(
                asyncio.open_connection("127.0.0.1", port),
                timeout=2.0
            )
            writer.close()
            await writer.wait_closed()
            return False  # Port is in use
        except (asyncio.TimeoutError, ConnectionRefusedError):
            return True  # Port is available
        except Exception:
            return False  # Assume port is in use if we can't check

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

    def _report_results(self) -> None:
        """Generate a report of preflight check results."""
        total_checks = 0
        passed_checks = 0
        failed_checks = 0
        warning_checks = 0

        for check_group in self.checks.values():
            for check in check_group["checks"].values():
                total_checks += 1
                if check["status"] == "passed":
                    passed_checks += 1
                elif check["status"] == "failed":
                    failed_checks += 1
                elif check["status"] == "warning":
                    warning_checks += 1

        logger.info(f"Preflight check summary: {passed_checks}/{total_checks} passed, "
                   f"{failed_checks} failed, {warning_checks} warnings")

        if self.critical_failures > 0:
            logger.error(f"Critical failures: {self.critical_failures}")
            for check_group_name, check_group in self.checks.items():
                for check_name, check in check_group["checks"].items():
                    if check.get("severity") == "critical" and check["status"] != "passed":
                        logger.error(f"  - {check_group['name']}: {check_name} - {check.get('message', check.get('error', 'Failed'))}")

async def run_preflight_checks() -> bool:
    """Run preflight checks and return whether startup should proceed.

    Returns:
        bool: True if startup should proceed, False if critical failures found
    """
    checker = PreflightCheck()
    return await checker.run_all_checks()
