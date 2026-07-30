#!/bin/bash
# One-command demo runner for presenters

set -euo pipefail

echo "🎬 Stop Burning Tokens demo"
echo "============================"
echo

echo "1) Setup environment"
bash scripts/setup-demo.sh
echo

echo "2) Baseline and selective comparison"
bash scripts/run-baseline.sh
echo

echo "3) Compression demo (caveman)"
node tools/caveman-formatter.js \
  --input "The deployment failed because the database connection pool was exhausted and retries created cascading timeouts across services." \
  --mode full
echo

echo "4) Multi-agent budget demo"
node tools/agent-budget-calculator.js --scenario refactoring --budget 100K
echo

echo "✅ Demo complete"
echo "Next: open scenarios in your IDE:"
echo "  code demo/scenarios/bug-hunt.md"
echo "  code demo/scenarios/code-review.md"
echo "  code demo/scenarios/refactoring.md"
