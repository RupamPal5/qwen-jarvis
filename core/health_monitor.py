import asyncio
import logging
import json
import time
from typing import Dict, Any, List, Optional
from pathlib import Path
from datetime import datetime, timedelta
from models.registry import get_model_registry
from core.network_manager import get_network_manager
from security.protocol import get_security_protocol
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class HealthMetric(BaseModel):
    """Represents a health metric for a model or service."""

    timestamp: str
    model_id: Optional[str] = None
    service: Optional[str] = None
    available: bool
    latency: Optional[float] = None
    error: Optional[str] = None
    consecutive_failures: int = 0
    is_local: bool = False
    response_time: Optional[float] = None

class HealthMonitor:
    """Background service that monitors the health of all models and services."""

    def __init__(self):
        """Initialize the health monitor."""
        self.model_registry = get_model_registry()
        self.network_manager = None
        self.security_protocol = get_security_protocol()
        self.monitoring_active = False
        self.monitor_task: Optional[asyncio.Task] = None
        self.metrics: List[HealthMetric] = []
        self.check_interval = 30  # seconds
        self.max_metrics = 1000  # Maximum number of metrics to keep in memory
        self.metrics_file = Path("logs/health_metrics.json")

        # Load previous metrics
        self._load_metrics()

    async def initialize(self) -> None:
        """Initialize the health monitor with required services."""
        try:
            self.network_manager = await get_network_manager()
            logger.info("Health monitor initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize health monitor: {str(e)}")
            raise

    async def start_monitoring(self) -> None:
        """Start the background monitoring service."""
        if self.monitoring_active:
            logger.warning("Health monitoring is already active")
            return

        self.monitoring_active = True
        self.monitor_task = asyncio.create_task(self._monitor_loop())
        logger.info("Health monitoring started")

    async def stop_monitoring(self) -> None:
        """Stop the background monitoring service."""
        if not self.monitoring_active:
            return

        self.monitoring_active = False
        if self.monitor_task:
            self.monitor_task.cancel()
            try:
                await self.monitor_task
            except asyncio.CancelledError:
                pass
            except Exception as e:
                logger.error(f"Error stopping health monitor: {str(e)}")

        # Save metrics before stopping
        self._save_metrics()
        logger.info("Health monitoring stopped")

    async def _monitor_loop(self) -> None:
        """Background monitoring loop."""
        logger.info("Starting health monitoring loop")

        while self.monitoring_active:
            try:
                start_time = time.time()
                await self._perform_health_checks()
                elapsed = time.time() - start_time

                # Calculate sleep time to maintain consistent interval
                sleep_time = max(0, self.check_interval - elapsed)
                await asyncio.sleep(sleep_time)

            except asyncio.CancelledError:
                logger.info("Health monitoring loop cancelled")
                break
            except Exception as e:
                logger.error(f"Error in health monitoring loop: {str(e)}", exc_info=True)
                await asyncio.sleep(10)  # Wait before retrying

        logger.info("Health monitoring loop stopped")

    async def _perform_health_checks(self) -> None:
        """Perform health checks for all models and services."""
        try:
            # Check all active models
            for model_id, model in self.model_registry.models.items():
                if not model.is_active:
                    continue

                try:
                    start_time = time.time()
                    status = await self.network_manager._check_model_health(model)
                    latency = time.time() - start_time

                    # Record metric
                    metric = HealthMetric(
                        timestamp=datetime.now().isoformat(),
                        model_id=model_id,
                        available=status["available"],
                        latency=latency,
                        error=status.get("error"),
                        consecutive_failures=self.network_manager.model_status.get(model_id, {}).get("consecutive_failures", 0),
                        is_local=model.is_local
                    )

                    self._record_metric(metric)

                except Exception as e:
                    logger.error(f"Error checking health for model {model_id}: {str(e)}")
                    metric = HealthMetric(
                        timestamp=datetime.now().isoformat(),
                        model_id=model_id,
                        available=False,
                        error=str(e),
                        is_local=model.is_local
                    )
                    self._record_metric(metric)

            # Check system services
            await self._check_system_services()

            # Save metrics periodically
            if len(self.metrics) % 10 == 0:  # Save every 10 checks
                self._save_metrics()

        except Exception as e:
            logger.error(f"Error performing health checks: {str(e)}", exc_info=True)

    async def _check_system_services(self) -> None:
        """Check the health of system services."""
        services = [
            {"name": "ollama_service", "check": self._check_ollama_service},
            {"name": "backend_api", "check": self._check_backend_api}
        ]

        for service in services:
            try:
                start_time = time.time()
                available, error = await service["check"]()
                latency = time.time() - start_time

                metric = HealthMetric(
                    timestamp=datetime.now().isoformat(),
                    service=service["name"],
                    available=available,
                    latency=latency,
                    error=error
                )

                self._record_metric(metric)

            except Exception as e:
                logger.error(f"Error checking service {service['name']}: {str(e)}")
                metric = HealthMetric(
                    timestamp=datetime.now().isoformat(),
                    service=service["name"],
                    available=False,
                    error=str(e)
                )
                self._record_metric(metric)

    async def _check_ollama_service(self) -> tuple[bool, Optional[str]]:
        """Check if Ollama service is running."""
        try:
            if not await self.network_manager._check_port_open("localhost", 11434):
                return False, "Port 11434 not open"

            # Make a simple API call
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.get("http://localhost:11434/api/version")
                if response.status_code != 200:
                    return False, f"HTTP {response.status_code}"
                return True, None

        except Exception as e:
            return False, str(e)

    async def _check_backend_api(self) -> tuple[bool, Optional[str]]:
        """Check if the backend API is responsive."""
        try:
            # This is a simple check that would be replaced with actual API call
            # For now, we'll assume it's working if we can reach the port
            if not await self.network_manager._check_port_open("localhost", 8000):
                return False, "Port 8000 not open"
            return True, None

        except Exception as e:
            return False, str(e)

    def _record_metric(self, metric: HealthMetric) -> None:
        """Record a health metric.

        Args:
            metric: The health metric to record
        """
        try:
            self.metrics.append(metric)

            # Keep only the most recent metrics
            if len(self.metrics) > self.max_metrics:
                self.metrics = self.metrics[-self.max_metrics:]

        except Exception as e:
            logger.error(f"Error recording health metric: {str(e)}")

    def _save_metrics(self) -> bool:
        """Save health metrics to file.

        Returns:
            bool: True if save was successful, False otherwise
        """
        try:
            # Ensure logs directory exists
            self.metrics_file.parent.mkdir(parents=True, exist_ok=True)

            # Convert to serializable format
            serializable_metrics = [metric.dict() for metric in self.metrics]

            with open(self.metrics_file, 'w') as f:
                json.dump(serializable_metrics, f, indent=2)

            return True
        except Exception as e:
            logger.error(f"Failed to save health metrics: {str(e)}")
            return False

    def _load_metrics(self) -> bool:
        """Load health metrics from file.

        Returns:
            bool: True if load was successful, False otherwise
        """
        try:
            if not self.metrics_file.exists():
                return False

            with open(self.metrics_file, 'r') as f:
                loaded_metrics = json.load(f)

            # Convert back to HealthMetric objects
            self.metrics = [HealthMetric(**metric) for metric in loaded_metrics]
            return True
        except Exception as e:
            logger.error(f"Failed to load health metrics: {str(e)}")
            return False

    def get_health_report(self, hours: float = 24) -> Dict[str, Any]:
        """Generate a health report for the specified time period.

        Args:
            hours: Time period in hours to include in the report

        Returns:
            Dict[str, Any]: Health report with statistics
        """
        try:
            cutoff_time = datetime.now() - timedelta(hours=hours)
            recent_metrics = [
                metric for metric in self.metrics
                if datetime.fromisoformat(metric.timestamp) >= cutoff_time
            ]

            if not recent_metrics:
                return {"status": "no_data", "message": "No metrics available for the specified time period"}

            # Group by model/service
            grouped_metrics: Dict[str, List[HealthMetric]] = {}

            for metric in recent_metrics:
                key = metric.model_id or metric.service or "unknown"
                if key not in grouped_metrics:
                    grouped_metrics[key] = []
                grouped_metrics[key].append(metric)

            # Generate report
            report = {
                "time_period": f"last {hours} hours",
                "generated_at": datetime.now().isoformat(),
                "overall_status": "healthy",
                "models": {},
                "services": {},
                "statistics": {
                    "total_checks": len(recent_metrics),
                    "start_time": recent_metrics[0].timestamp,
                    "end_time": recent_metrics[-1].timestamp
                }
            }

            # Process each group
            for key, metrics in grouped_metrics.items():
                if metrics[0].model_id:  # This is a model
                    report["models"][key] = self._generate_model_report(metrics)
                else:  # This is a service
                    report["services"][key] = self._generate_service_report(metrics)

            # Determine overall status
            for model_report in report["models"].values():
                if model_report["status"] == "unhealthy":
                    report["overall_status"] = "degraded"
                    break
                elif model_report["status"] == "degraded" and report["overall_status"] != "degraded":
                    report["overall_status"] = "degraded"

            for service_report in report["services"].values():
                if service_report["status"] == "unhealthy":
                    report["overall_status"] = "unhealthy"
                    break
                elif service_report["status"] == "degraded" and report["overall_status"] != "degraded":
                    report["overall_status"] = "degraded"

            return report

        except Exception as e:
            logger.error(f"Error generating health report: {str(e)}")
            return {
                "status": "error",
                "message": str(e),
                "generated_at": datetime.now().isoformat()
            }

    def _generate_model_report(self, metrics: List[HealthMetric]) -> Dict[str, Any]:
        """Generate a report for a specific model.

        Args:
            metrics: List of metrics for the model

        Returns:
            Dict[str, Any]: Model health report
        """
        total_checks = len(metrics)
        successful_checks = sum(1 for m in metrics if m.available)
        failed_checks = total_checks - successful_checks

        uptime_percentage = (successful_checks / total_checks) * 100 if total_checks > 0 else 0

        # Calculate average latency
        successful_latencies = [m.latency for m in metrics if m.available and m.latency is not None]
        avg_latency = sum(successful_latencies) / len(successful_latencies) if successful_latencies else None

        # Get current status
        current_status = metrics[-1].available if metrics else False
        current_error = metrics[-1].error if metrics and not metrics[-1].available else None

        # Determine status
        if uptime_percentage >= 99:
            status = "healthy"
        elif uptime_percentage >= 90:
            status = "degraded"
        else:
            status = "unhealthy"

        # Get recent errors
        recent_errors = []
        for metric in reversed(metrics):
            if not metric.available and metric.error:
                recent_errors.append({
                    "timestamp": metric.timestamp,
                    "error": metric.error
                })
                if len(recent_errors) >= 5:  # Limit to 5 most recent errors
                    break

        return {
            "status": status,
            "uptime_percentage": round(uptime_percentage, 2),
            "total_checks": total_checks,
            "successful_checks": successful_checks,
            "failed_checks": failed_checks,
            "avg_latency": round(avg_latency, 3) if avg_latency is not None else None,
            "current_status": current_status,
            "current_error": current_error,
            "recent_errors": recent_errors,
            "is_local": metrics[0].is_local if metrics else False
        }

    def _generate_service_report(self, metrics: List[HealthMetric]) -> Dict[str, Any]:
        """Generate a report for a specific service.

        Args:
            metrics: List of metrics for the service

        Returns:
            Dict[str, Any]: Service health report
        """
        return self._generate_model_report(metrics)

# Global health monitor instance
_health_monitor = HealthMonitor()

async def get_health_monitor() -> HealthMonitor:
    """Get the global health monitor instance.

    Returns:
        HealthMonitor: The global health monitor instance
    """
    await _health_monitor.initialize()
    return _health_monitor
