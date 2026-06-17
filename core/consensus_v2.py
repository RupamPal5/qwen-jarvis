import logging
import json
from typing import Dict, Optional, List, Any
from models.registry import ModelEntry
from core.role_manager import get_role_manager
from gateway.universal_client import ModelRequest, ModelResponse, get_universal_client
import asyncio
from datetime import datetime
from pydantic import BaseModel

logger = logging.getLogger(__name__)

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

    async def initialize(self) -> None:
        """Initialize the consensus engine with required resources.

        This must be called before using the engine.
        """
        try:
            self.universal_client = await get_universal_client()
            logger.info("Consensus engine initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize consensus engine: {str(e)}")
            raise

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
        result: Dict[str, Any] = {
            "status": "error",
            "request_id": request_id,
            "timestamp": datetime.now().isoformat(),
            "steps": []
        }

        # Record metrics
        metrics = {
            "request_id": request_id,
            "user_input": user_input,
            "workspace_id": workspace_id,
            "start_time": datetime.now().isoformat(),
            "end_time": None,
            "duration": None,
            "steps": [],
            "success": False
        }

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
                return result

            # Step 1: Architect generates the initial plan
            step1_start = time.time()
            architect_response = await self._call_architect(
                user_input,
                architect_model,
                workspace_id
            )
            step1_duration = time.time() - step1_start

            result["steps"].append({
                "step": "architect",
                "model": architect_model.model_id,
                "status": "success",
                "duration": step1_duration,
                "timestamp": datetime.now().isoformat()
            })

            metrics["steps"].append({
                "step": "architect",
                "model": architect_model.model_id,
                "duration": step1_duration,
                "timestamp": datetime.now().isoformat()
            })

            # Step 2: Arbiter audits the plan
            step2_start = time.time()
            audit_result = await self._call_arbiter(
                architect_response.content,
                arbiter_model,
                workspace_id
            )
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
                return result

            # Step 3: Get human authorization
            step3_start = time.time()
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
                return result

            # Step 4: Judge executes the approved plan
            step4_start = time.time()
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

            result.update({
                "status": "success",
                "architect_response": architect_response.dict(),
                "audit_result": audit_result,
                "execution_result": execution_result.dict(),
                "performance_metrics": self._get_performance_metrics()
            })

            return result

        except Exception as e:
            logger.error(f"Consensus execution failed for request {request_id}: {str(e)}", exc_info=True)
            result["error"] = str(e)
            return result

        finally:
            # Record final metrics
            metrics["end_time"] = datetime.now().isoformat()
            metrics["duration"] = time.time() - start_time
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
                                  "Be specific, thorough, and ensure your plan addresses all aspects of the request."
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
            return response

        except Exception as e:
            logger.error(f"Architect call failed for model {model.model_id}: {str(e)}", exc_info=True)
            raise Exception(f"Architect call failed: {str(e)}")

    async def _call_arbiter(self, plan: str, model: ModelEntry, workspace_id: Optional[str] = None) -> Dict[str, Any]:
        """Call the Arbiter model to audit the plan.

        Args:
            plan: The plan to audit
            model: The model to use for arbiter role
            workspace_id: Optional workspace context

        Returns:
            Dict[str, Any]: The audit result containing 'is_safe' and 'details'

        Raises:
            Exception: If the call fails
        """
        try:
            request = ModelRequest(
                model=model.model_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are the Arbiter. Analyze the following plan for:\n"
                                  "1. Security vulnerabilities (injection, traversal, etc.)\n"
                                  "2. AST parsing issues\n"
                                  "3. Directory traversal risks\n"
                                  "4. Recursive loops or infinite recursion\n"
                                  "5. Resource exhaustion risks\n"
                                  "6. Compliance with coding standards\n"
                                  "7. Potential side effects\n\n"
                                  "Respond with JSON format: {\n"
                                  "  'is_safe': bool,\n"
                                  "  'details': str,\n"
                                  "  'warnings': [str],\n"
                                  "  'critical_issues': [str]\n"
                                  "}"
                    },
                    {
                        "role": "user",
                        "content": plan
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
                                  "7. Validate that search blocks match the exact content in the target files\n\n"
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
                "error_rate": 0.0
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

        if tokens_used is not None:
            stats["avg_tokens"] = stats["total_tokens"] / stats["total_calls"]

    def _get_performance_metrics(self) -> Dict[str, Any]:
        """Get performance metrics for all models.

        Returns:
            Dict[str, Any]: Performance metrics for all models
        """
        return self.model_performance

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
import logging
from typing import Dict, Optional, List
from models.registry import ModelEntry
from core.role_manager import get_role_manager
from gateway.universal_client import ModelRequest, ModelResponse, get_universal_client
import asyncio

logger = logging.getLogger(__name__)

class ConsensusEngineV2:
    def __init__(self):
        self.role_manager = get_role_manager()
        self.universal_client = None
        self.model_performance = {}

    async def initialize(self):
        """Initialize the consensus engine"""
        self.universal_client = await get_universal_client()

    async def execute_consensus(self, user_input: str, workspace_id: Optional[str] = None) -> Dict:
        """
        Execute the consensus process with dynamic model assignments.

        Args:
            user_input (str): The input provided by the user.
            workspace_id (str, optional): The workspace ID for context.

        Returns:
            dict: The consensus result.
        """
        try:
            # Get assigned models for each role
            architect_model = self.role_manager.get_assigned_model("ARCHITECT")
            arbiter_model = self.role_manager.get_assigned_model("ARBITER")
            judge_model = self.role_manager.get_assigned_model("JUDGE")

            if not all([architect_model, arbiter_model, judge_model]):
                raise Exception("Not all roles have models assigned")

            # Step 1: Architect generates the initial plan
            architect_response = await self._call_architect(
                user_input,
                architect_model,
                workspace_id
            )

            # Step 2: Arbiter audits the plan
            audit_result = await self._call_arbiter(
                architect_response.content,
                arbiter_model,
                workspace_id
            )

            if not audit_result.get("is_safe", False):
                return {
                    "status": "rejected",
                    "reason": "Security audit failed",
                    "details": audit_result.get("details", "")
                }

            # Step 3: Get human authorization
            authorized = await self._get_human_authorization(
                user_input,
                architect_response.content,
                workspace_id
            )

            if not authorized:
                return {
                    "status": "rejected",
                    "reason": "User authorization denied"
                }

            # Step 4: Judge executes the approved plan
            execution_result = await self._call_judge(
                architect_response.content,
                judge_model,
                workspace_id
            )

            return {
                "status": "success",
                "architect_response": architect_response.dict(),
                "audit_result": audit_result,
                "execution_result": execution_result.dict(),
                "performance_metrics": self._get_performance_metrics()
            }

        except Exception as e:
            logger.error(f"Consensus execution failed: {str(e)}", exc_info=True)
            return {
                "status": "error",
                "error": str(e)
            }

    async def _call_architect(self, user_input: str, model: ModelEntry, workspace_id: Optional[str]) -> ModelResponse:
        """Call the Architect model to generate a plan"""
        try:
            request = ModelRequest(
                model=model.model_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are the Architect. Generate a detailed execution plan. "
                                  "Output in Aider-style search/replace blocks when modifying code."
                    },
                    {
                        "role": "user",
                        "content": user_input
                    }
                ],
                stream=False
            )

            response = await self.universal_client.call_model(model, request)
            self._track_performance(model.model_id, response.latency, response.tokens_used)
            return response

        except Exception as e:
            logger.error(f"Architect call failed: {str(e)}")
            raise

    async def _call_arbiter(self, plan: str, model: ModelEntry, workspace_id: Optional[str]) -> Dict:
        """Call the Arbiter model to audit the plan"""
        try:
            request = ModelRequest(
                model=model.model_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are the Arbiter. Analyze the plan for security, "
                                  "AST parsing issues, directory traversal risks, and recursive loops. "
                                  "Respond with JSON: {'is_safe': bool, 'details': str}"
                    },
                    {
                        "role": "user",
                        "content": plan
                    }
                ],
                stream=False
            )

            response = await self.universal_client.call_model(model, request)
            self._track_performance(model.model_id, response.latency, response.tokens_used)

            # Try to parse the response as JSON
            try:
                import json
                result = json.loads(response.content)
                if not isinstance(result, dict):
                    raise ValueError("Response is not a dictionary")
                return result
            except Exception as e:
                logger.warning(f"Failed to parse Arbiter response as JSON: {str(e)}")
                return {
                    "is_safe": False,
                    "details": f"Failed to parse response: {response.content}"
                }

        except Exception as e:
            logger.error(f"Arbiter call failed: {str(e)}")
            raise

    async def _get_human_authorization(self, user_input: str, plan: str, workspace_id: Optional[str]) -> bool:
        """Get human authorization for the plan"""
        # In a real implementation, this would trigger a frontend modal
        # For now, we'll simulate with a simple console prompt
        logger.warning(f"HUMAN AUTHORIZATION REQUIRED for: {user_input[:50]}...")
        logger.warning(f"Plan summary: {plan[:200]}...")

        # In a real system, this would wait for a WebSocket message from the frontend
        # For now, we'll simulate with a timeout
        for _ in range(30):  # Wait up to 30 seconds
            await asyncio.sleep(1)
            # In a real implementation, check the global state for approval
            # For now, just return True to simulate approval
            return True

        return False

    async def _call_judge(self, plan: str, model: ModelEntry, workspace_id: Optional[str]) -> ModelResponse:
        """Call the Judge model to execute the approved plan"""
        try:
            request = ModelRequest(
                model=model.model_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are the Judge. Execute the approved plan. "
                                  "Output ONLY valid Aider-style search/replace blocks. "
                                  "Do not include any other text or explanations."
                    },
                    {
                        "role": "user",
                        "content": plan
                    }
                ],
                stream=False
            )

            response = await self.universal_client.call_model(model, request)
            self._track_performance(model.model_id, response.latency, response.tokens_used)
            return response

        except Exception as e:
            logger.error(f"Judge call failed: {str(e)}")
            raise

    def _track_performance(self, model_id: str, latency: float, tokens_used: Optional[int]):
        """Track model performance metrics"""
        if model_id not in self.model_performance:
            self.model_performance[model_id] = {
                "total_calls": 0,
                "total_latency": 0,
                "total_tokens": 0,
                "avg_latency": 0,
                "avg_tokens": 0
            }

        stats = self.model_performance[model_id]
        stats["total_calls"] += 1
        stats["total_latency"] += latency
        if tokens_used:
            stats["total_tokens"] += tokens_used

        stats["avg_latency"] = stats["total_latency"] / stats["total_calls"]
        stats["avg_tokens"] = stats["total_tokens"] / stats["total_calls"]

    def _get_performance_metrics(self) -> Dict:
        """Get performance metrics for all models"""
        return self.model_performance

# Global consensus engine instance
_consensus_engine = ConsensusEngineV2()

async def get_consensus_engine() -> ConsensusEngineV2:
    await _consensus_engine.initialize()
    return _consensus_engine
