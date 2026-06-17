#!/usr/bin/env python3

import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.abspath('.'))

async def test_imports():
    """Test that all imports work correctly"""
    try:
        from backend.main import app
        print("✓ Main app import successful")

        from consensus.tri_node_engine import TriNodeConsensusEngine
        print("✓ Tri-node engine import successful")

        from routes import router
        print("✓ Router import successful")

        from stores import get_workspace_store
        print("✓ Stores import successful")

        from utils.file_utils import validate_file_path
        print("✓ File utils import successful")

        from utils.safety import validate_search_replace_block
        print("✓ Safety utils import successful")

        return True
    except Exception as e:
        print(f"✗ Import failed: {e}")
        return False

def test_file_operations():
    """Test file operations"""
    try:
        from utils.file_utils import validate_file_path

        # Test with a sample file
        test_file = "backend/main.py"
        result = validate_file_path(test_file)
        print(f"✓ File validation successful: {result}")

        return True
    except Exception as e:
        print(f"✗ File operation failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing backend imports and functionality...")

    # Test imports
    import_success = asyncio.run(test_imports())

    # Test file operations
    file_success = test_file_operations()

    if import_success and file_success:
        print("\n✓ All tests passed! Backend is ready.")
        sys.exit(0)
    else:
        print("\n✗ Some tests failed.")
        sys.exit(1)
