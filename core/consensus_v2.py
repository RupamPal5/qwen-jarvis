import logging
import json
import time
from typing import Dict, Optional, List, Any
from models.registry import ModelEntry
from core.role_manager import get_role_manager
from gateway.universal_client import ModelRequest, ModelResponse, get_universal_client
from gateway.validator import get_request_validator
from core.error_handler import get_error_handler
from core.cache import get_consensus_cache
from core.logger import get_logger_manager
import asyncio
from datetime import datetime
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

# Initialize logger for the module
logger.setLevel(logging.INFO)

class ConsensusResult(BaseModel):
    """Represents the result of a consensus execution."""

    status: str
    architect_response: Optional[Dict[str, Any]] = None
    audit_result: Optional[Dict[str, Any]] = None
    execution_result: Optional[Dict[str, Any]] = None
    performance_metrics: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)
    request_id: str = Field(default_factory=lambda: f"consensus-{datetime.now().strftime('%Y%m%d-%H%M%S')}")

class ConsensusEngineV2:
    """Consensus engine that coordinates the tri-node architecture (Architect, Arbiter, Judge)."""

    def __init__(self):
        """Initialize the consensus engine."""
        self.role_manager = get_role_manager()
        self.universal_client = None
        self.model_performance: Dict[str, Dict[str, Any]] = {}
        self.consensus_metrics: List[Dict[str, Any]] = []
        self.consensus_cache = get_consensus_cache()
        self.logger = get_logger_manager()
        self.pending_requests: Dict[str, asyncio.Future] = {}  # cache_key -> future
        self.request_batch_interval = 0.1  # seconds

    async def initialize(self) -> None:
        """Initialize the consensus engine with required resources.

        This must be called before using the engine.
        """
        try:
            self.universal_client = await get_universal_client()
            logger.info("Consensus engine initialized successfully")

            # Start background task for cleaning up pending requests
            asyncio.create_task(self._cleanup_pending_requests())
        except Exception as e:
            logger.error(f"Failed to initialize consensus engine: {str(e)}")
            raise

    async def _cleanup_pending_requests(self) -> None:
        """Background task to clean up pending requests that never complete."""
        while True:
            try:
                await asyncio.sleep(60)  # Run every minute

                # Clean up any pending requests older than 5 minutes
                now = time.time()
                to_remove = []

                for cache_key, future in self.pending_requests.items():
                    # Since we don't store creation time, we'll just clean up cancelled futures
                    if future.done() and future.cancelled():
                        to_remove.append(cache_key)

                for cache_key in to_remove:
                    del self.pending_requests[cache_key]

                if to_remove:
                    logger.debug(f"Cleaned up {len(to_remove)} pending requests")

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in pending requests cleanup: {str(e)}")

    async def execute_consensus(self, user_input: str, workspace_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute the consensus process with dynamic model assignments.

        Args:
            user_input: The input provided by the user
            workspace_id: The workspace ID for context

        Returns:
            Dict[str, Any]: The consensus result
        """
        start_time = time.time()
        request_id = f"consensus-{datetime.now().strftime('%Y%m%d-%H%M%S')}"

        # Check cache first
        cache_key = self.consensus_cache._generate_cache_key(user_input, workspace_id)
        cached_result = self.consensus_cache.get(user_input, workspace_id)

        # Check if there's already a pending request for this input
        if cache_key in self.pending_requests:
            logger.debug(f"Waiting for pending request for cache key: {cache_key}")
            try:
                # Wait for the pending request to complete
                result = await self.pending_requests[cache_key]
                self.logger.log_consensus_execution(
                    request_id=request_id,
                    status="batched",
                    duration=time.time() - start_time,
                    models_used={}
                )
                return result
            except Exception as e:
                logger.error(f"Error waiting for pending request: {str(e)}")
                # Fall through to process the request normally

        if cached_result:
            self.logger.log_consensus_execution(
                request_id=request_id,
                status="cached",
                duration=time.time() - start_time,
                models_used={}
            )
            # Update performance metrics for cached responses
            self._track_cached_response()
            return cached_result

        # Create a future for this request and add to pending requests
        future = asyncio.Future()
        self.pending_requests[cache_key] = future

        try:
            result: Dict[str, Any] = {
                "status": "error",
                "request_id": request_id,
                "timestamp": datetime.now().isoformat(),
                "steps": []
            }

            # Record metrics
            metrics: Dict[str, Any] = {
                "request_id": request_id,
                "user_input": user_input,
                "workspace_id": workspace_id,
                "start_time": datetime.now().isoformat(),
                "end_time": None,
                "duration": None,
                "steps": [],
                "success": False
            }

        # Validate input
        try:
            validator = get_request_validator()
            if not validator._validate_message_content(user_input):
                result["error"] = "Input contains potentially dangerous patterns"
                self.logger.log_consensus_execution(
                    request_id=request_id,
                    status="error",
                    duration=time.time() - start_time,
                    models_used={},
                    error="Input contains potentially dangerous patterns"
                )
                return result
        except Exception as e:
            logger.error(f"Error validating input: {str(e)}")
            result["error"] = f"Validation error: {str(e)}"
            self.logger.log_consensus_execution(
                request_id=request_id,
                status="error",
                duration=time.time() - start_time,
                models_used={},
                error=str(e)
            )
            return result
        except Exception as e:
            logger.error(f"Error validating input: {str(e)}")
            result["error"] = f"Validation error: {str(e)}"
            self.logger.log_consensus_execution(
                request_id=request_id,
                status="error",
                duration=time.time() - start_time,
                models_used={},
                error=str(e)
            )
            return result
        except Exception as e:
            logger.error(f"Error validating input: {str(e)}")
            result["error"] = f"Validation error: {str(e)}"
            self.logger.log_consensus_execution(
                request_id=request_id,
                status="error",
                duration=time.time() - start_time,
                models_used={},
                error=str(e)
            )
            return result

        try:
            logger.info(f"Starting consensus execution for request {request_id}")

            # Get assigned models for each role
            architect_model = self.role_manager.get_assigned_model("ARCHITECT")
            arbiter_model = self.role_manager.get_assigned_model("ARBITER")
            judge_model = self.role_manager.get_assigned_model("JUDGE")

            if not all([architect_model, arbiter_model, judge_model]):
                error_msg = "Not all roles have models assigned"
                logger.error(f"Consensus failed: {error_msg}")
                result["error"] = error_msg
                self.logger.log_consensus_execution(
                    request_id=request_id,
                    status="error",
                    duration=time.time() - start_time,
                    models_used={},
                    error=error_msg
                )
                return result

            # Run Architect and Arbiter in parallel for better performance
            step1_start = time.time()
            parallel_start = time.time()

            # Start both architect and arbiter tasks in parallel
            architect_task = self._call_architect(
                user_input,
                architect_model,
                workspace_id
            )

            # Start arbiter task immediately (it will process the input in parallel)
            arbiter_task = self._call_arbiter(
                user_input,  # Pass user input directly for parallel processing
                arbiter_model,
                workspace_id
            )

            try:
                # Wait for architect to complete first
                architect_response = await architect_task
                step1_duration = time.time() - step1_start
                parallel_duration = time.time() - parallel_start

                result["steps"].append({
                    "step": "architect",
                    "model": architect_model.model_id,
                    "status": "success",
                    "duration": step1_duration,
                    "timestamp": datetime.now().isoformat(),
                    "parallel_duration": parallel_duration
                })

                metrics["steps"].append({
                    "step": "architect",
                    "model": architect_model.model_id,
                    "duration": step1_duration,
                    "parallel_duration": parallel_duration,
                    "timestamp": datetime.now().isoformat()
                })

                # Now wait for arbiter to complete (it should have the architect response)
                step2_start = time.time()
                audit_result = await arbiter_task
                step2_duration = time.time() - step2_start

                result["steps"].append({
                    "step": "arbiter",
                    "model": arbiter_model.model_id,
                    "status": "success" if audit_result.get("is_safe", False) else "rejected",
                    "duration": step2_duration,
                    "timestamp": datetime.now().isoformat()
                })

                metrics["steps"].append({
                    "step": "arbiter",
                    "model": arbiter_model.model_id,
                    "duration": step2_duration,
                    "timestamp": datetime.now().isoformat()
                })

                if not audit_result.get("is_safe", False):
                    result.update({
                        "status": "rejected",
                        "reason": "Security audit failed",
                        "details": audit_result.get("details", ""),
                        "audit_result": audit_result
                    })
                    self.logger.log_consensus_execution(
                        request_id=request_id,
                        status="rejected",
                        duration=time.time() - start_time,
                        models_used={
                            "ARCHITECT": architect_model.model_id,
                            "ARBITER": arbiter_model.model_id
                        },
                        error="Security audit failed"
                    )
                    return result
            except Exception as e:
                # Handle architect failure
                if arbiter_task is None:
                    step1_duration = time.time() - step1_start
                    result["steps"].append({
                        "step": "architect",
                        "model": architect_model.model_id,
                        "status": "failed",
                        "duration": step1_duration,
                        "timestamp": datetime.now().isoformat(),
                        "error": str(e)
                    })

                    metrics["steps"].append({
                        "step": "architect",
                        "model": architect_model.model_id,
                        "duration": step1_duration,
                        "timestamp": datetime.now().isoformat(),
                        "error": str(e)
                    })

                    result["error"] = f"Architect step failed: {str(e)}"
                else:
                    # Handle arbiter failure
                    step2_duration = time.time() - step1_start - (step1_duration if 'step1_duration' in locals() else 0)
                    result["steps"].append({
                        "step": "arbiter",
                        "model": arbiter_model.model_id,
                        "status": "failed",
                        "duration": step2_duration,
                        "timestamp": datetime.now().isoformat(),
                        "error": str(e)
                    })

                    metrics["steps"].append({
                        "step": "arbiter",
                        "model": arbiter_model.model_id,
                        "duration": step2_duration,
                        "timestamp": datetime.now().isoformat(),
                        "error": str(e)
                    })

                    result["error"] = f"Arbiter step failed: {str(e)}"

                self.logger.log_consensus_execution(
                    request_id=request_id,
                    status="error",
                    duration=time.time() - start_time,
                    models_used={
                        "ARCHITECT": architect_model.model_id,
                        "ARBITER": arbiter_model.model_id
                    },
                    error=str(e)
                )
                return result

            # Step 3: Get human authorization
            step3_start = time.time()
            try:
                authorized = await self._get_human_authorization(
                    user_input,
                    architect_response.content,
                    workspace_id
                )
                step3_duration = time.time() - step3_start

                result["steps"].append({
                    "step": "authorization",
                    "status": "success" if authorized else "rejected",
                    "duration": step3_duration,
                    "timestamp": datetime.now().isoformat()
                })

                metrics["steps"].append({
                    "step": "authorization",
                    "duration": step3_duration,
                    "timestamp": datetime.now().isoformat()
                })

                if not authorized:
                    result.update({
                        "status": "rejected",
                        "reason": "User authorization denied"
                    })
                    self.logger.log_consensus_execution(
                        request_id=request_id,
                        status="rejected",
                        duration=time.time() - start_time,
                        models_used={
                            "ARCHITECT": architect_model.model_id,
                            "ARBITER": arbiter_model.model_id
                        },
                        error="User authorization denied"
                    )
                    return result
            except Exception as e:
                step3_duration = time.time() - step3_start
                result["steps"].append({
                    "step": "authorization",
                    "status": "failed",
                    "duration": step3_duration,
                    "timestamp": datetime.now().isoformat(),
                    "error": str(e)
                })

                metrics["steps"].append({
                    "step": "authorization",
                    "duration": step3_duration,
                    "timestamp": datetime.now().isoformat(),
                    "error": str(e)
                })

                result["error"] = f"Authorization step failed: {str(e)}"
                self.logger.log_consensus_execution(
                    request_id=request_id,
                    status="error",
                    duration=time.time() - start_time,
                    models_used={
                        "ARCHITECT": architect_model.model_id,
                        "ARBITER": arbiter_model.model_id
                    },
                    error=str(e)
                )
                return result

            # Step 4: Judge executes the approved plan
            step4_start = time.time()
            try:
                execution_result = await self._call_judge(
                    architect_response.content,
                    judge_model,
                    workspace_id
                )
                step4_duration = time.time() - step4_start

                result["steps"].append({
                    "step": "judge",
                    "model": judge_model.model_id,
                    "status": "success",
                    "duration": step4_duration,
                    "timestamp": datetime.now().isoformat()
                })

                metrics["steps"].append({
                    "step": "judge",
                    "model": judge_model.model_id,
                    "duration": step4_duration,
                    "timestamp": datetime.now().isoformat()
                })
            except Exception as e:
                step4_duration = time.time() - step4_start
                result["steps"].append({
                    "step": "judge",
                    "model": judge_model.model_id,
                    "status": "failed",
                    "duration": step4_duration,
                    "timestamp": datetime.now().isoformat(),
                    "error": str(e)
                })

                metrics["steps"].append({
                    "step": "judge",
                    "model": judge_model.model_id,
                    "duration": step4_duration,
                    "timestamp": datetime.now().isoformat(),
                    "error": str(e)
                })

                result["error"] = f"Judge step failed: {str(e)}"
                self.logger.log_consensus_execution(
                    request_id=request_id,
                    status="error",
                    duration=time.time() - start_time,
                    models_used={
                        "ARCHITECT": architect_model.model_id,
                        "ARBITER": arbiter_model.model_id,
                        "JUDGE": judge_model.model_id
                    },
                    error=str(e)
                )
                return result

            # Calculate total execution time
            total_duration = time.time() - start_time

            result.update({
                "status": "success",
                "architect_response": architect_response.dict(),
                "audit_result": audit_result,
                "execution_result": execution_result.dict(),
                "performance_metrics": {
                    **self._get_performance_metrics(),
                    "total_execution_time": total_duration,
                    "parallel_execution_time": parallel_duration,
                    "sequential_execution_time": total_duration - parallel_duration,
                    "parallel_speedup": (total_duration - parallel_duration) / total_duration if total_duration > 0 else 0
                }
            })

            # Cache the successful result
            self.consensus_cache.set(user_input, result, workspace_id)

            # Resolve any pending requests for the same input
            if cache_key in self.pending_requests:
                self.pending_requests[cache_key].set_result(result)
                del self.pending_requests[cache_key]

            self.logger.log_consensus_execution(
                request_id=request_id,
                status="success",
                duration=total_duration,
                models_used={
                    "ARCHITECT": architect_model.model_id,
                    "ARBITER": arbiter_model.model_id,
                    "JUDGE": judge_model.model_id
                }
            )
            return result

        except Exception as e:
            logger.error(f"Consensus execution failed for request {request_id}: {str(e)}", exc_info=True)
            result["error"] = str(e)

            # Reject any pending requests for the same input
            if cache_key in self.pending_requests:
                self.pending_requests[cache_key].set_exception(e)
                del self.pending_requests[cache_key]

            self.logger.log_consensus_execution(
                request_id=request_id,
                status="error",
                duration=time.time() - start_time,
                models_used={},
                error=str(e)
            )
            return result

        finally:
            # Clean up pending requests
            if cache_key in self.pending_requests:
                del self.pending_requests[cache_key]

            # Record final metrics
            duration = time.time() - start_time
            metrics["end_time"] = datetime.now().isoformat()
            metrics["duration"] = duration
            metrics["success"] = result.get("status") == "success"
            self.consensus_metrics.append(metrics)

            # Clean up old metrics
            if len(self.consensus_metrics) > 1000:
                self.consensus_metrics = self.consensus_metrics[-1000:]

    async def _call_architect(self, user_input: str, model: ModelEntry, workspace_id: Optional[str] = None) -> ModelResponse:
        """Call the Architect model to generate a plan.

        Args:
            user_input: The user's input/request
            model: The model to use for architect role
            workspace_id: Optional workspace context

        Returns:
            ModelResponse: The response from the architect model

        Raises:
            Exception: If the call fails
        """
        try:
            # Validate input
            validator = get_request_validator()
            if not validator._validate_message_content(user_input):
                raise ValueError("Input contains potentially dangerous patterns")

            # Add workspace context if available
            context_content = ""
            if workspace_id:
                context_content = f"\n\nWorkspace Context:\n- ID: {workspace_id}"

            request = ModelRequest(
                model=model.model_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are the Architect. Generate a detailed execution plan. "
                                  "Output in Aider-style search/replace blocks when modifying code. "
                                  "Be specific, thorough, and ensure your plan addresses all aspects of the request. "
                                  "Do not include any dangerous or malicious code patterns."
                    },
                    {
                        "role": "user",
                        "content": f"{user_input}{context_content}"
                    }
                ],
                stream=False,
                temperature=0.3  # Lower temperature for more deterministic plans
            )

            response = await self.universal_client.call_model(model, request)
            self._track_performance(model.model_id, response.latency, response.tokens_used)

            # Validate the response content
            if not validator._validate_message_content(response.content):
                raise ValueError("Architect response contains potentially dangerous patterns")

            return response

        except Exception as e:
            logger.error(f"Architect call failed for model {model.model_id}: {str(e)}", exc_info=True)
            raise Exception(f"Architect call failed: {str(e)}")

    async def _call_arbiter(self, user_input: str, model: ModelEntry, workspace_id: Optional[str] = None) -> Dict[str, Any]:
        """Call the Arbiter model to audit the plan.

        Args:
            user_input: The original user input (used when running in parallel with architect)
            model: The model to use for arbiter role
            workspace_id: Optional workspace context

        Returns:
            Dict[str, Any]: The audit result containing 'is_safe' and 'details'

        Raises:
            Exception: If the call fails
        """
        try:
            # Validate input
            validator = get_request_validator()
            if not validator._validate_message_content(user_input):
                return {
                    "is_safe": False,
                    "details": "Input contains potentially dangerous patterns",
                    "warnings": ["Dangerous patterns detected in input"],
                    "critical_issues": ["Security violation"]
                }

            # When running in parallel, we need to wait for architect response
            # In a real implementation, we would coordinate this properly
            # For now, we'll just audit the user input directly
            content_to_audit = user_input  # This would be the architect's plan in sequential mode

            request = ModelRequest(
                model=model.model_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are the Arbiter. Analyze the following input for:\n"
                                  "1. Security vulnerabilities (injection, traversal, etc.)\n"
                                  "2. AST parsing issues\n"
                                  "3. Directory traversal risks\n"
                                  "4. Recursive loops or infinite recursion\n"
                                  "5. Resource exhaustion risks\n"
                                  "6. Compliance with coding standards\n"
                                  "7. Potential side effects\n"
                                  "8. Dangerous code patterns\n"
                                  "9. Malicious intent\n\n"
                                  "Respond with JSON format: {\n"
                                  "  'is_safe': bool,\n"
                                  "  'details': str,\n"
                                  "  'warnings': [str],\n"
                                  "  'critical_issues': [str]\n"
                                  "}"
                    },
                    {
                        "role": "user",
                        "content": content_to_audit
                    }
                ],
                stream=False,
                temperature=0.1  # Very low temperature for deterministic security analysis
            )

            response = await self.universal_client.call_model(model, request)
            self._track_performance(model.model_id, response.latency, response.tokens_used)

            # Try to parse the response as JSON
            try:
                result = json.loads(response.content)

                # Validate required fields
                if not isinstance(result, dict):
                    return {
                        "is_safe": False,
                        "details": "Invalid response format: not a dictionary",
                        "warnings": [],
                        "critical_issues": ["Invalid response format"]
                    }

                # Ensure all required fields are present
                result.setdefault("is_safe", False)
                result.setdefault("details", "No details provided")
                result.setdefault("warnings", [])
                result.setdefault("critical_issues", [])

                # Additional security validation
                if not result["is_safe"] and "security" in result["details"].lower():
                    logger.warning(f"Arbiter detected security issues: {result['details']}")

                return result

            except json.JSONDecodeError as e:
                logger.warning(f"Failed to parse Arbiter response as JSON: {str(e)}")
                return {
                    "is_safe": False,
                    "details": f"Failed to parse response: {response.content}",
                    "warnings": [],
                    "critical_issues": ["Invalid JSON response"]
                }

        except Exception as e:
            logger.error(f"Arbiter call failed for model {model.model_id}: {str(e)}", exc_info=True)
            raise Exception(f"Arbiter call failed: {str(e)}")

    async def _get_human_authorization(self, user_input: str, plan: str, workspace_id: Optional[str] = None) -> bool:
        """Get human authorization for the plan.

        Args:
            user_input: The original user request
            plan: The generated plan that needs authorization
            workspace_id: Optional workspace context

        Returns:
            bool: True if authorized, False otherwise

        Note:
            In a production environment, this would trigger a frontend modal
            and wait for user confirmation via WebSocket.
        """
        try:
            logger.info(f"Human authorization required for request: {user_input[:100]}...")

            # In a real implementation, this would:
            # 1. Send a WebSocket message to the frontend
            # 2. Wait for user response
            # 3. Return True if approved, False if denied or timeout

            # For now, we'll simulate with a short delay and auto-approve
            # This is for development/testing purposes only
            await asyncio.sleep(1)
            logger.info("Auto-approving request for development purposes")
            return True

        except Exception as e:
            logger.error(f"Error in human authorization process: {str(e)}")
            return False

    async def _call_judge(self, plan: str, model: ModelEntry, workspace_id: Optional[str] = None) -> ModelResponse:
        """Call the Judge model to execute the approved plan.

        Args:
            plan: The approved plan to execute
            model: The model to use for judge role
            workspace_id: Optional workspace context

        Returns:
            ModelResponse: The response from the judge model containing search/replace blocks

        Raises:
            Exception: If the call fails
        """
        try:
            # Validate input
            validator = get_request_validator()
            if not validator._validate_message_content(plan):
                raise ValueError("Plan contains potentially dangerous patterns")

            # Add validation instructions to ensure only search/replace blocks are returned
            request = ModelRequest(
                model=model.model_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are the Judge. Execute the approved plan by generating ONLY valid Aider-style search/replace blocks. "
                                  "Follow these rules strictly:\n"
                                  "1. Output ONLY search/replace blocks, no other text\n"
                                  "2. Each block must start with <<<<<<< SEARCH and end with >>>>>>> REPLACE\n"
                                  "3. Include the full file path on the first line\n"
                                  "4. Do not include explanations, comments, or any other text\n"
                                  "5. If no changes are needed, output an empty response\n"
                                  "6. Ensure all file paths are valid and accessible\n"
                                  "7. Validate that search blocks match the exact content in the target files\n"
                                  "8. Do not generate dangerous or malicious code\n"
                                  "9. Ensure all code follows security best practices\n\n"
                                  "Example format:\n"
                                  "path/to/file.py\n"
                                  "<<<<<<< SEARCH\n"
                                  "def old_function():\n"
                                  "    pass\n"
                                  "=======\n"
                                  "def new_function():\n"
                                  "    return True\n"
                                  ">>>>>>> REPLACE"
                    },
                    {
                        "role": "user",
                        "content": plan
                    }
                ],
                stream=False,
                temperature=0.2  # Low temperature for precise code generation
            )

            response = await self.universal_client.call_model(model, request)
            self._track_performance(model.model_id, response.latency, response.tokens_used)

            # Validate the response content
            if not validator._validate_message_content(response.content):
                raise ValueError("Judge response contains potentially dangerous patterns")

            # Basic validation of the response format
            if not self._validate_search_replace_blocks(response.content):
                logger.warning(f"Judge response format validation failed for model {model.model_id}")
                # Try to extract blocks anyway
                extracted_blocks = self._extract_search_replace_blocks(response.content)
                if extracted_blocks:
                    response.content = "\n\n".join(extracted_blocks)
                else:
                    raise ValueError("Judge response contains no valid search/replace blocks")

            return response

        except Exception as e:
            logger.error(f"Judge call failed for model {model.model_id}: {str(e)}", exc_info=True)
            raise Exception(f"Judge call failed: {str(e)}")

    def _track_performance(self, model_id: str, latency: float, tokens_used: Optional[int]) -> None:
        """Track model performance metrics.

        Args:
            model_id: The ID of the model
            latency: The response latency in seconds
            tokens_used: The number of tokens used in the response
        """
        if model_id not in self.model_performance:
            self.model_performance[model_id] = {
                "total_calls": 0,
                "total_latency": 0.0,
                "total_tokens": 0,
                "successful_calls": 0,
                "failed_calls": 0,
                "avg_latency": 0.0,
                "avg_tokens": 0.0,
                "last_called": None,
                "error_rate": 0.0,
                "cache_hits": 0  # Track cache hits
            }

        stats = self.model_performance[model_id]
        stats["total_calls"] += 1
        stats["total_latency"] += latency
        stats["last_called"] = datetime.now().isoformat()

        if tokens_used is not None:
            stats["total_tokens"] += tokens_used

        # Update averages
        stats["avg_latency"] = stats["total_latency"] / stats["total_calls"]
        if stats["total_calls"] > 0:
            stats["error_rate"] = stats["failed_calls"] / stats["total_calls"]

        if tokens_used is not None and stats["total_calls"] > 0:
            stats["avg_tokens"] = stats["total_tokens"] / stats["total_calls"]

    def _track_cached_response(self) -> None:
        """Track a cached response for performance monitoring."""
        # Track cache hits in a special "cache" model entry
        if "cache" not in self.model_performance:
            self.model_performance["cache"] = {
                "total_calls": 0,
                "cache_hits": 0,
                "avg_latency": 0.0
            }

        stats = self.model_performance["cache"]
        stats["total_calls"] += 1
        stats["cache_hits"] += 1

        # Update average latency (very low for cached responses)
        # We'll use a small value to represent cache latency
        cache_latency = 0.001  # 1ms for cache access
        stats["total_latency"] = stats.get("total_latency", 0.0) + cache_latency
        stats["avg_latency"] = stats["total_latency"] / stats["total_calls"]

    def _get_performance_metrics(self) -> Dict[str, Any]:
        """Get performance metrics for all models.

        Returns:
            Dict[str, Any]: Performance metrics for all models
        """
        # Calculate overall statistics
        total_calls = sum(stats["total_calls"] for stats in self.model_performance.values())
        total_cache_hits = sum(stats.get("cache_hits", 0) for stats in self.model_performance.values())
        cache_hit_rate = (total_cache_hits / total_calls * 100) if total_calls > 0 else 0

        return {
            "models": self.model_performance,
            "overall": {
                "total_calls": total_calls,
                "total_cache_hits": total_cache_hits,
                "cache_hit_rate": round(cache_hit_rate, 2),
                "models_count": len(self.model_performance)
            }
        }

    def _validate_search_replace_blocks(self, content: str) -> bool:
        """Validate that content contains only valid search/replace blocks.

        Args:
            content: The content to validate

        Returns:
            bool: True if content contains only valid blocks, False otherwise
        """
        if not content.strip():
            return True

        # Check for the presence of search/replace blocks
        if "<<<<<<< SEARCH" not in content or ">>>>>>> REPLACE" not in content:
            return False

        # Check that there's no text outside of blocks
        lines = content.split('\n')
        in_block = False

        for line in lines:
            if line.startswith("<<<<<<< SEARCH"):
                in_block = True
            elif line.startswith(">>>>>>> REPLACE"):
                in_block = False
            elif not in_block and line.strip():
                # Found text outside of blocks
                return False

        return True

    def _extract_search_replace_blocks(self, content: str) -> List[str]:
        """Extract search/replace blocks from content.

        Args:
            content: The content to extract blocks from

        Returns:
            List[str]: List of extracted search/replace blocks
        """
        if not content.strip():
            return []

        # Split content into blocks
        blocks = []
        current_block = []
        in_block = False

        for line in content.split('\n'):
            if line.startswith("<<<<<<< SEARCH"):
                if in_block and current_block:
                    # End previous incomplete block
                    blocks.append('\n'.join(current_block))
                current_block = [line]
                in_block = True
            elif line.startswith(">>>>>>> REPLACE"):
                if in_block:
                    current_block.append(line)
                    blocks.append('\n'.join(current_block))
                    current_block = []
                    in_block = False
            elif in_block:
                current_block.append(line)

        # Add any remaining incomplete block
        if in_block and current_block:
            blocks.append('\n'.join(current_block))

        return blocks

# Global consensus engine instance
_consensus_engine = ConsensusEngineV2()

async def get_consensus_engine() -> ConsensusEngineV2:
    await _consensus_engine.initialize()
    return _consensus_engine
