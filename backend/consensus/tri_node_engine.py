import httpx
import os
import re
import subprocess
import logging
from typing import Optional, Dict, List, Tuple
from pathlib import Path
from pydantic import BaseModel
from ..stores import get_workspace_store
from ..services.self_healing import SelfHealingEngine

logger = logging.getLogger(__name__)

# Environment variables
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
BASE_DIR = Path(__file__).parent.parent.parent  # Assuming this is in backend/consensus/

class SearchReplaceBlock(BaseModel):
    file_path: str
    search: str
    replace: str

class PatchRequest(BaseModel):
    blocks: List[SearchReplaceBlock]
    dry_run: bool = False
    workspace_id: Optional[str] = None

class TriNodeConsensusEngine:
    class NodeAlpha_Architect:
        @staticmethod
        async def generate_payload(user_input: str, workspace_id: Optional[str] = None) -> dict:
            """
            Generates an execution plan using Sonnet via OpenRouter API.

            Args:
                user_input (str): The input provided by the user.
                workspace_id (str, optional): The workspace ID for context.

            Returns:
                dict: The generated payload.
            """
            if not OPENROUTER_API_KEY:
                raise Exception("OpenRouter API key not configured")

            # Get workspace context
            context = ""
            if workspace_id:
                store = get_workspace_store()
                workspace = next((ws for ws in store.workspaces if ws.id == workspace_id), None)
                if workspace:
                    context = f"\n\nWorkspace Context:\n- Name: {workspace.name}\n- Theme: {workspace.theme}\n- Layout: {workspace.layout}"

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "JARVIS V5.0 Tri-Node Consensus Engine"
                    },
                    json={
                        "model": "anthropic/claude-3.5-sonnet",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are Node-Alpha: The Architect. "
                                          "Your role is to design detailed execution plans for complex software tasks. "
                                          "Generate clean, modular, and secure code modifications. "
                                          "Always output in Aider-style search/replace blocks when modifying code."
                            },
                            {
                                "role": "user",
                                "content": f"{user_input}{context}"
                            }
                        ]
                    }
                )

                if response.status_code != 200:
                    error_msg = response.json().get("error", {}).get("message", "Unknown error")
                    logger.error(f"Node-Alpha generation failed: {error_msg}")
                    raise Exception(f"Node-Alpha generation failed: {error_msg}")

                return response.json()

    class NodeBeta_SecOps:
        @staticmethod
        async def audit_payload(payload: dict) -> bool:
            """
            Audits the payload for security issues using DeepSeek via Ollama API.

            Args:
                payload (dict): The payload to be audited.

            Returns:
                bool: True if the payload is safe, False otherwise.
            """
            try:
                # Extract content from payload
                content = ""
                if isinstance(payload, dict):
                    if "choices" in payload:
                        # OpenRouter response format
                        content = payload["choices"][0]["message"]["content"]
                    elif "response" in payload:
                        # Ollama response format
                        content = payload["response"]
                    else:
                        content = str(payload)
                else:
                    content = str(payload)

                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"{OLLAMA_BASE_URL}/api/generate",
                        json={
                            "model": "deepseek-coder-v2",
                            "prompt": f"Analyze the following code for security vulnerabilities, "
                                      f"AST parsing issues, directory traversal risks, and recursive loops:\n\n{content}",
                            "stream": False
                        }
                    )

                    if response.status_code != 200:
                        error_msg = response.json().get("error", "Unknown error")
                        logger.error(f"Node-Beta audit failed: {error_msg}")
                        raise Exception(f"Node-Beta audit failed: {error_msg}")

                    result = response.json().get("response", "")

                    # Check for security issues
                    security_issues = [
                        "vulnerability",
                        "security issue",
                        "directory traversal",
                        "path traversal",
                        "recursive loop",
                        "infinite loop",
                        "malformed syntax",
                        "AST error",
                        "unsafe operation",
                        "privilege escalation"
                    ]

                    is_safe = not any(issue in result.lower() for issue in security_issues)
                    return is_safe

            except Exception as e:
                logger.error(f"Node-Beta audit error: {str(e)}", exc_info=True)
                return False

    class NodeGamma_Compiler:
        @staticmethod
        async def execute_approved_payload(payload: dict, security_token: str, workspace_id: Optional[str] = None) -> dict:
            """
            Executes the approved payload using Llama 70B via Ollama API or OpenRouter.

            Args:
                payload (dict): The payload to be executed.
                security_token (str): The security token for authorization.
                workspace_id (str, optional): The workspace ID for context.

            Returns:
                dict: The execution result containing search/replace blocks.
            """
            try:
                # Extract content from payload
                content = ""
                if isinstance(payload, dict):
                    if "choices" in payload:
                        # OpenRouter response format
                        content = payload["choices"][0]["message"]["content"]
                    elif "response" in payload:
                        # Ollama response format
                        content = payload["response"]
                    else:
                        content = str(payload)
                else:
                    content = str(payload)

                # Get workspace context
                context = ""
                if workspace_id:
                    store = get_workspace_store()
                    workspace = next((ws for ws in store.workspaces if ws.id == workspace_id), None)
                    if workspace:
                        context = f"\n\nWorkspace Context:\n- Name: {workspace.name}\n- Files: [list would be generated here]"

                # Use OpenRouter for complex execution (fallback to Ollama if needed)
                if OPENROUTER_API_KEY:
                    async with httpx.AsyncClient() as client:
                        response = await client.post(
                            "https://openrouter.ai/api/v1/chat/completions",
                            headers={
                                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                                "HTTP-Referer": "http://localhost:3000",
                                "X-Title": "JARVIS V5.0 Node-Gamma"
                            },
                            json={
                                "model": "meta-llama/llama-3.3-70b-instruct",
                                "messages": [
                                    {
                                        "role": "system",
                                        "content": "You are Node-Gamma: The Implementor. "
                                                  "Your role is to execute approved code modifications. "
                                                  "Output ONLY valid Aider-style search/replace blocks. "
                                                  "Do not include any other text or explanations."
                                    },
                                    {
                                        "role": "user",
                                        "content": f"Generate clean, surgical search/replace blocks for:\n\n{content}{context}"
                                    }
                                ]
                            }
                        )

                        if response.status_code != 200:
                            error_msg = response.json().get("error", {}).get("message", "Unknown error")
                            logger.error(f"Node-Gamma execution failed: {error_msg}")
                            raise Exception(f"Node-Gamma execution failed: {error_msg}")

                        result = response.json()
                        return result
                else:
                    # Fallback to Ollama
                    async with httpx.AsyncClient() as client:
                        response = await client.post(
                            f"{OLLAMA_BASE_URL}/api/generate",
                            json={
                                "model": "qwen2.5-coder-7b",
                                "prompt": f"Generate Aider-style search/replace blocks for:\n\n{content}{context}\n\n"
                                          "Output ONLY the search/replace blocks, no other text.",
                                "stream": False
                            }
                        )

                        if response.status_code != 200:
                            error_msg = response.json().get("error", "Unknown error")
                            logger.error(f"Node-Gamma execution failed: {error_msg}")
                            raise Exception(f"Node-Gamma execution failed: {error_msg}")

                        return response.json()

            except Exception as e:
                logger.error(f"Node-Gamma execution error: {str(e)}", exc_info=True)
                raise

    class PermissionGate:
        @staticmethod
        async def require_user_authorization(action_type: str, description: str, workspace_id: Optional[str] = None) -> bool:
            """
            Blocks execution until user confirms the action.

            Args:
                action_type (str): The type of action requiring authorization.
                description (str): Description of the action.
                workspace_id (str, optional): The workspace ID for context.

            Returns:
                bool: True if authorized, False otherwise.
            """
            try:
                # In a real implementation, this would trigger a frontend modal
                # For now, we'll simulate with a simple console prompt
                logger.warning(f"HUMAN AUTHORIZATION REQUIRED: {action_type}")
                logger.warning(f"Description: {description}")

                # Set the pending action in the global state
                store = get_workspace_store()
                store.set_pending_action({
                    "type": action_type,
                    "description": description,
                    "payload": {"workspace_id": workspace_id}
                })
                store.set_human_approval_required(True)

                # In a real system, this would wait for a WebSocket message from the frontend
                # For now, we'll simulate with a timeout
                import asyncio
                for _ in range(30):  # Wait up to 30 seconds
                    await asyncio.sleep(1)
                    if not store.is_human_approval_required:
                        return store.pending_action is None  # True if approved, False if denied

                # Timeout reached
                store.set_human_approval_required(False)
                store.set_pending_action(None)
                return False

            except Exception as e:
                logger.error(f"Human authorization error: {str(e)}", exc_info=True)
                return False

    class SelfModifyingEngine:
        @staticmethod
        def validate_file_path(file_path: str, workspace_id: Optional[str] = None) -> Path:
            """
            Validate and resolve the file path against the allowed directories.

            Args:
                file_path (str): The file path to validate.
                workspace_id (str, optional): The workspace ID for context.

            Returns:
                Path: The resolved and validated file path.

            Raises:
                ValueError: If the file path is invalid or outside allowed directories.
            """
            # Resolve the path
            resolved_path = (BASE_DIR / file_path).resolve()

            # Check if the path is within the allowed directories
            allowed_dirs = [
                BASE_DIR / "app" / "frontend",
                BASE_DIR / "app" / "backend",
                BASE_DIR / "lib"
            ]

            if not any(resolved_path.is_relative_to(d) for d in allowed_dirs):
                raise ValueError(f"File path {file_path} is outside allowed directories")

            # Additional security check: prevent directory traversal
            if ".." in file_path or file_path.startswith("/") or file_path.startswith("\\"):
                raise ValueError(f"Invalid file path: {file_path}")

            return resolved_path

        @staticmethod
        def parse_search_replace_block(block: SearchReplaceBlock, workspace_id: Optional[str] = None) -> Tuple[Path, str, str]:
            """
            Parse and validate a search/replace block.

            Args:
                block (SearchReplaceBlock): The search/replace block to parse.
                workspace_id (str, optional): The workspace ID for context.

            Returns:
                Tuple[Path, str, str]: The validated file path, search pattern, and replacement.

            Raises:
                ValueError: If the block is invalid.
            """
            try:
                file_path = TriNodeConsensusEngine.SelfModifyingEngine.validate_file_path(block.file_path, workspace_id)
                search = block.search.strip()
                replace = block.replace.strip()

                if not search or not replace:
                    raise ValueError("Search and replace patterns must not be empty")

                # Validate that the search pattern is a complete block
                if not (search.startswith("<<<<<<< SEARCH") or search.startswith("<<<<<<< SEARCH\n")):
                    raise ValueError("Search pattern must be a valid Aider-style search block")

                if "=======" not in search or ">>>>>>> REPLACE" not in search:
                    raise ValueError("Search pattern must contain complete Aider-style block markers")

                return file_path, search, replace
            except Exception as e:
                raise ValueError(f"Invalid search/replace block: {str(e)}")

        @staticmethod
        def _validate_search_replace_structure(search: str, replace: str) -> bool:
            """
            Validate the structure of Aider-style search/replace blocks.

            Args:
                search (str): The search block
                replace (str): The replace block

            Returns:
                bool: True if the structure is valid
            """
            try:
                # Check search block structure
                search_lines = search.split('\n')
                if not (search_lines[0].strip() == "<<<<<<< SEARCH" or
                        search_lines[0].startswith("<<<<<<< SEARCH")):
                    return False

                # Find the ======= divider
                divider_index = -1
                for i, line in enumerate(search_lines):
                    if line.strip() == "=======":
                        divider_index = i
                        break

                if divider_index == -1:
                    return False

                # Check replace block structure
                replace_lines = replace.split('\n')
                if not (replace_lines[-1].strip() == ">>>>>>> REPLACE" or
                        replace_lines[-1].startswith(">>>>>>> REPLACE")):
                    return False

                return True
            except Exception:
                return False

        @staticmethod
        def apply_search_replace(
            file_path: Path,
            search: str,
            replace: str,
            dry_run: bool = False,
            workspace_id: Optional[str] = None
        ) -> Dict:
            """
            Apply a search/replace operation to a file.

            Args:
                file_path (Path): The path to the file to modify.
                search (str): The pattern to search for.
                replace (str): The replacement pattern.
                dry_run (bool): If True, only validate the operation without making changes.
                workspace_id (str, optional): The workspace ID for context.

            Returns:
                Dict: The result of the operation.

            Raises:
                Exception: If the operation fails.
            """
            try:
                # Read the file content
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Check if the search pattern exists
                if search not in content:
                    return {
                        "status": "skipped",
                        "message": f"Search pattern not found in {file_path}",
                        "file": str(file_path),
                        "search": search,
                        "replace": replace,
                        "dry_run": dry_run
                    }

                # Validate the search/replace block structure
                if not TriNodeConsensusEngine.SelfModifyingEngine._validate_search_replace_structure(search, replace):
                    return {
                        "status": "invalid",
                        "message": "Invalid search/replace block structure",
                        "file": str(file_path),
                        "search": search,
                        "replace": replace,
                        "dry_run": dry_run
                    }

                # Apply the replacement
                new_content = content.replace(search, replace)

                if not dry_run:
                    # Backup the original file
                    backup_path = file_path.with_suffix(file_path.suffix + '.bak')
                    with open(backup_path, 'w', encoding='utf-8') as f:
                        f.write(content)

                    try:
                        # Write the changes back to the file
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)

                        # Run linting and compilation checks
                        lint_result = TriNodeConsensusEngine.SelfModifyingEngine.run_linting(file_path)
                        compile_result = TriNodeConsensusEngine.SelfModifyingEngine.run_compilation(file_path)

                        if not lint_result["success"] or not compile_result["success"]:
                            # Revert changes if checks fail
                            with open(file_path, 'w', encoding='utf-8') as f:
                                f.write(content)

                            # Remove backup
                            backup_path.unlink(missing_ok=True)

                            return {
                                "status": "reverted",
                                "message": "Changes reverted due to linting/compilation errors",
                                "file": str(file_path),
                                "search": search,
                                "replace": replace,
                                "lint_result": lint_result,
                                "compile_result": compile_result,
                                "dry_run": dry_run
                            }

                        # Remove backup if successful
                        backup_path.unlink(missing_ok=True)

                    except Exception as e:
                        # Attempt to restore from backup if something goes wrong
                        if backup_path.exists():
                            with open(backup_path, 'r', encoding='utf-8') as f:
                                backup_content = f.read()
                            with open(file_path, 'w', encoding='utf-8') as f:
                                f.write(backup_content)
                            backup_path.unlink(missing_ok=True)

                        raise Exception(f"Failed to apply changes: {str(e)}")

                return {
                    "status": "success",
                    "message": f"Successfully applied changes to {file_path}",
                    "file": str(file_path),
                    "search": search,
                    "replace": replace,
                    "dry_run": dry_run
                }
            except Exception as e:
                raise Exception(f"Failed to apply changes to {file_path}: {str(e)}")

        @staticmethod
        def run_linting(file_path: Path) -> Dict:
            """
            Run linting on the specified file.

            Args:
                file_path (Path): The path to the file to lint.

            Returns:
                Dict: The result of the linting operation.
            """
            try:
                if file_path.suffix == '.py':
                    # Run pylint
                    result = subprocess.run(
                        ['pylint', str(file_path)],
                        capture_output=True,
                        text=True,
                        check=False
                    )
                    return {
                        "success": result.returncode == 0,
                        "output": result.stdout,
                        "error": result.stderr
                    }
                elif file_path.suffix == '.ts' or file_path.suffix == '.tsx':
                    # Run ESLint
                    result = subprocess.run(
                        ['eslint', str(file_path)],
                        capture_output=True,
                        text=True,
                        check=False
                    )
                    return {
                        "success": result.returncode == 0,
                        "output": result.stdout,
                        "error": result.stderr
                    }
                else:
                    return {
                        "success": True,
                        "message": "No linting configured for this file type"
                    }
            except Exception as e:
                return {
                    "success": False,
                    "error": str(e)
                }

        @staticmethod
        def run_compilation(file_path: Path) -> Dict:
            """
            Run compilation on the specified file.

            Args:
                file_path (Path): The path to the file to compile.

            Returns:
                Dict: The result of the compilation operation.
            """
            try:
                if file_path.suffix == '.py':
                    # Python files don't need compilation, but we can run a syntax check
                    result = subprocess.run(
                        ['python', '-m', 'py_compile', str(file_path)],
                        capture_output=True,
                        text=True,
                        check=False
                    )
                    return {
                        "success": result.returncode == 0,
                        "output": result.stdout,
                        "error": result.stderr
                    }
                elif file_path.suffix == '.ts' or file_path.suffix == '.tsx':
                    # Run TypeScript compilation
                    result = subprocess.run(
                        ['tsc', '--noEmit', str(file_path)],
                        capture_output=True,
                        text=True,
                        check=False
                    )
                    return {
                        "success": result.returncode == 0,
                        "output": result.stdout,
                        "error": result.stderr
                    }
                else:
                    return {
                        "success": True,
                        "message": "No compilation configured for this file type"
                    }
            except Exception as e:
                return {
                    "success": False,
                    "error": str(e)
                }

        @staticmethod
        async def process_patch_request(request: PatchRequest, workspace_id: Optional[str] = None) -> Dict:
            """
            Process a patch request containing multiple search/replace blocks.

            Args:
                request (PatchRequest): The patch request to process.
                workspace_id (str, optional): The workspace ID for context.

            Returns:
                Dict: The result of the patch operation.
            """
            results = []
            errors = []
            self_healing_attempted = False

            for block in request.blocks:
                try:
                    file_path, search, replace = TriNodeConsensusEngine.SelfModifyingEngine.parse_search_replace_block(
                        block,
                        workspace_id
                    )
                    result = TriNodeConsensusEngine.SelfModifyingEngine.apply_search_replace(
                        file_path,
                        search,
                        replace,
                        request.dry_run,
                        workspace_id
                    )
                    results.append(result)

                    if result["status"] == "reverted" and not self_healing_attempted:
                        # Trigger self-healing process
                        error_message = f"Failed to apply changes to {file_path}: {result.get('message', '')}"
                        original_block = {
                            "file_path": block.file_path,
                            "search": block.search,
                            "replace": block.replace
                        }

                        await SelfHealingEngine.trigger_self_healing(
                            error_message,
                            original_block,
                            workspace_id
                        )
                        self_healing_attempted = True

                except Exception as e:
                    error_message = f"Error processing block for {block.file_path}: {str(e)}"
                    errors.append(error_message)
                    logger.error(error_message)

                    if not self_healing_attempted:
                        # Trigger self-healing process
                        await SelfHealingEngine.trigger_self_healing(
                            error_message,
                            block.dict(),
                            workspace_id
                        )
                        self_healing_attempted = True

            return {
                "status": "completed" if not errors else "partial_failure",
                "results": results,
                "errors": errors,
                "self_healing_attempted": self_healing_attempted
            }
