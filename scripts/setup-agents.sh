#!/bin/bash
set -e

echo "Setting up OpenClaw agents..."

AGENTS=("scout" "archer" "scribe" "oracle")
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

for agent in "${AGENTS[@]}"; do
  echo "Adding agent: $agent..."
  openclaw agents add "$agent" \
    --workspace "$PROJECT_DIR/agents/${agent}" \
    --model "anthropic/claude-sonnet-4-5" \
    --non-interactive \
    2>/dev/null || echo "Agent $agent already exists"
done

echo ""
echo "All agents configured. Verify with: openclaw agents list"
echo "Trigger an agent with: openclaw agent --agent scout --message 'Check for new bookings'"
