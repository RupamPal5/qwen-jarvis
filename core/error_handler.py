import logging
import traceback
import asyncio
from typing import Dict, Any, Optional, Callable
from datetime import datetime
from pathlib import Path
import sys
from models.registry import get_model_registry
from core.role_manager import get_role_manager
from core.network_manager import get_network_manager
from security.protocol import get_security_protocol

logger = logging.getLogger(__name__)

class ErrorHandler:
    """Global error handler for catching unhandled exceptions and implementing graceful degradation."""

    def __init__(self):
        """Initialize the error handler."""
        self.error_log_file = Path("logs/errors.log")
        self.max_errors = 1000
        self.error_count = 0
        self.last_error_time = None
        self.circuit_breaker_triggered = False
        self.fallback_model = "qwen2.5:1.5b"  # Fast local model for fallback

        # Ensure logs directory exists
        self.error_log_file.parent.mkdir(parents=True, exist_ok=True)

    def setup_global_exception_handling(self) -> None:
        """Set up global exception handlers for the application."""
        # Set up sys.excepthook for synchronous exceptions
        sys.excepthook = self._handle_sync_exception

        # Set up asyncio exception handler
        loop = asyncio.get_event_loop()
        loop.set_exception_handler(self._handle_async_exception)

        logger.info("Global exception handling configured")

    def _handle_sync_exception(self, exc_type, exc_value, exc_traceback) -> None:
        """Handle synchronous exceptions."""
        error_info = self._format_error_info(exc_type, exc_value, exc_traceback)
        self._log_error(error_info)
        self._trigger_graceful_degradation(error_info)

    def _handle_async_exception(self, loop, context) -> None:
        """Handle asynchronous exceptions."""
        error_info = self._format_async_error_info(context)
        self._log_error(error_info)
        self._trigger_graceful_degradation(error_info)

    def _format_error_info(self, exc_type, exc_value, exc_traceback) -> Dict[str, Any]:
        """Format error information for logging."""
        error_time = datetime.now().isoformat()
        error_details = {
            "timestamp": error_time,
            "error_type": exc_type.__name__ if exc_type else "Unknown",
            "error_message": str(exc_value) if exc_value else "No error message",
            "stack_trace": "".join(traceback.format_exception(exc_type, exc_value, exc_traceback)),
            "source": "synchronous"
        }
        return error_details

    def _format_async_error_info(self, context) -> Dict[str, Any]:
        """Format async error information for logging."""
        error_time = datetime.now().isoformat()
        error_details = {
            "timestamp": error_time,
            "error_type": context.get("exception", {}).__class__.__name__ if "exception" in context else "Unknown",
            "error_message": context.get("message", "No error message"),
            "stack_trace": context.get("exception", {}).get("stack_trace", "No stack trace"),
            "source": "asynchronous",
            "context": {k: v for k, v in context.items() if k != "exception"}
        }
        return error_details

    def _log_error(self, error_info: Dict[str, Any]) -> None:
        """Log error to file and console."""
        try:
            # Log to console
            logger.error(f"Unhandled {error_info['source']} exception: {error_info['error_message']}")

            # Log to file
            with open(self.error_log_file, 'a', encoding='utf-8') as f:
                f.write(f"[{error_info['timestamp']}] {error_info['error_type']}: {error_info['error_message']}\n")
                f.write(f"Stack Trace:\n{error_info['stack_trace']}\n")
                if "context" in error_info:
                    f.write(f"Context: {error_info['context']}\n")
                f.write("-" * 80 + "\n")

            # Update error count
            self.error_count += 1
            self.last_error_time = datetime.now()

            # Rotate error log if too large
            if self.error_count > self.max_errors:
                self._rotate_error_log()

        except Exception as e:
            logger.error(f"Failed to log error: {str(e)}")

    def _rotate_error_log(self) -> None:
        """Rotate the error log file."""
        try:
            rotated_file = self.error_log_file.with_suffix(f".{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
            if self.error_log_file.exists():
                self.error_log_file.rename(rotated_file)
            self.error_count = 0
            logger.info(f"Error log rotated to {rotated_file}")
        except Exception as e:
            logger.error(f"Failed to rotate error log: {str(e)}")

    def _trigger_graceful_degradation(self, error_info: Dict[str, Any]) -> None:
        """Trigger graceful degradation when errors occur."""
        try:
            logger.warning(f"Triggering graceful degradation due to error: {error_info['error_message']}")

            # Check if we should trigger circuit breaker
            if self._should_trigger_circuit_breaker():
                self.circuit_breaker_triggered = True
                logger.warning("CIRCUIT BREAKER TRIGGERED - Switching to fallback mode")

                # Switch to fallback model
                self._switch_to_fallback_model()

                # Schedule recovery check
                asyncio.create_task(self._check_circuit_breaker_recovery())

        except Exception as e:
            logger.error(f"Failed to trigger graceful degradation: {str(e)}")

    def _should_trigger_circuit_breaker(self) -> bool:
        """Determine if circuit breaker should be triggered."""
        # If circuit is already triggered, don't trigger again
        if self.circuit_breaker_triggered:
            return False

        # If we've had multiple errors in a short time, trigger circuit breaker
        if self.last_error_time and self.error_count >= 5:
            time_since_last_error = (datetime.now() - self.last_error_time).total_seconds()
            if time_since_last_error <= 60:  # 5 errors within 60 seconds
                return True

        return False

    async def _check_circuit_breaker_recovery(self) -> None:
        """Check if circuit breaker can be recovered."""
        try:
            # Wait 30 seconds before checking recovery
            await asyncio.sleep(30)

            logger.info("Checking circuit breaker recovery...")

            # Try to restore normal operation
            network_manager = await get_network_manager()
            model_registry = get_model_registry()

            # Check if primary models are available
            primary_models_available = True
            for role in ["ARCHITECT", "ARBITER", "JUDGE"]:
                model_id = get_role_manager().get_all_assignments().get(role)
                if model_id:
                    model = model_registry.get_model(model_id)
                    if model:
                        status = await network_manager._check_model_health(model)
                        if not status["available"]:
                            primary_models_available = False
                            logger.warning(f"Model {model_id} for role {role} still unavailable")
                            break

            if primary_models_available:
                # Restore normal operation
                self.circuit_breaker_triggered = False
                logger.info("CIRCUIT BREAKER RECOVERED - Restoring normal operation")
            else:
                # Stay in fallback mode and check again later
                logger.info("CIRCUIT BREAKER STILL OPEN - Remaining in fallback mode")
                asyncio.create_task(self._check_circuit_breaker_recovery())

        except Exception as e:
            logger.error(f"Error checking circuit breaker recovery: {str(e)}")
            # Try again later
            asyncio.create_task(self._check_circuit_breaker_recovery())

    def _switch_to_fallback_model(self) -> None:
        """Switch all roles to the fallback model."""
        try:
            role_manager = get_role_manager()
            fallback_model = self.fallback_model

            # Check if fallback model exists and is active
            model_registry = get_model_registry()
            fallback_entry = model_registry.get_model(fallback_model)

            if not fallback_entry or not fallback_entry.is_active:
                logger.warning(f"Fallback model {fallback_model} not available, using default local model")
                fallback_model = "qwen2.5:1.5b"  # Default fallback

            # Assign fallback model to all roles
            for role in ["ARCHITECT", "ARBITER", "JUDGE"]:
                role_manager.assign_role(role, fallback_model)

            logger.info(f"Switched all roles to fallback model: {fallback_model}")

        except Exception as e:
            logger.error(f"Failed to switch to fallback model: {str(e)}")

    def is_circuit_breaker_triggered(self) -> bool:
        """Check if circuit breaker is currently triggered."""
        return self.circuit_breaker_triggered

    def get_error_stats(self) -> Dict[str, Any]:
        """Get error statistics."""
        return {
            "total_errors": self.error_count,
            "last_error_time": self.last_error_time.isoformat() if self.last_error_time else None,
            "circuit_breaker_triggered": self.circuit_breaker_triggered
        }

# Global error handler instance
_error_handler = ErrorHandler()

def get_error_handler() -> ErrorHandler:
    """Get the global error handler instance."""
    return _error_handler
