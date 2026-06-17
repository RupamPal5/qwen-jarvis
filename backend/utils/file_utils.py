import os
import re
import subprocess
from pathlib import Path
from typing import Dict, Tuple

BASE_DIR = Path(__file__).parent.parent

def validate_file_path(file_path: str, workspace_id: str = None) -> Path:
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
