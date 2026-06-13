#!/bin/bash
# JARVIS SOVEREIGN CAGED LAUNCHER

# 1. Activate the isolated Python environment
source ~/jarvis_sovereign/venv/bin/activate

# 2. Execute JARVIS inside the systemd resource cage
# -p MemoryMax=6G       : Hard limit. Kills process if it exceeds 6GB.
# -p MemoryHigh=5G      : Throttles process if it goes over 5GB.
# -p CPUQuota=400%      : Limits to 400% CPU (exactly 4 cores).
echo "🔒 INITIATING SOVEREIGN CAGE: 4 Cores | 6GB RAM Limit"

exec sudo systemd-run --scope \
  -p MemoryMax=6G \
  -p MemoryHigh=5G \
  -p CPUQuota=400% \
  --uid=$USER --gid=$USER \
  ~/jarvis_sovereign/venv/bin/python ~/jarvis_sovereign/core/jarvis_core.py
