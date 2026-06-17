#!/usr/bin/env python3

import asyncio
import sys
import os
import httpx

# Add the project directory to the path
sys.path.insert(0, os.path.abspath('.'))

async def test_metrics_endpoint():
    """Test the metrics endpoint"""
    try:
        async with httpx.AsyncClient() as client:
            # Test from localhost
            response = await client.get("http://localhost:8000/api/metrics", headers={"Host": "localhost"})

            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success":
                    print("✓ Metrics endpoint working correctly")
                    print(f"  System uptime: {data.get('uptime', 0):.2f} seconds")
                    print(f"  Active models: {data.get('models', {}).get('active', 0)}")
                    print(f"  Total models: {data.get('models', {}).get('total', 0)}")
                    return True
                else:
                    print(f"✗ Metrics endpoint returned error: {data}")
                    return False
            else:
                print(f"✗ Metrics endpoint returned status code: {response.status_code}")
                return False
    except Exception as e:
        print(f"✗ Metrics endpoint test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing Metrics Endpoint...")

    result = asyncio.run(test_metrics_endpoint())

    if result:
        print("\n✓ Metrics endpoint test passed!")
        sys.exit(0)
    else:
        print("\n✗ Metrics endpoint test failed.")
        sys.exit(1)
