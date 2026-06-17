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
