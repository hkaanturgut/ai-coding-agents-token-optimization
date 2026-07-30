#!/bin/bash
# Setup demo environment: Generate sample data and verify configs

set -e

echo "🚀 Setting up demo environment..."

# Create demo directory structure if needed
mkdir -p demo/{scenarios,mcp-configs,sample-data}
mkdir -p tools scripts

echo "✓ Directories created"

# Check if large log exists
if [ ! -f demo/sample-data/large-log.txt ]; then
    echo "📝 Generating 10MB sample log file..."
    python3 << 'EOFPYTHON'
import random
from datetime import datetime, timedelta

start_time = datetime.now() - timedelta(hours=48)
log_lines = []

for i in range(500000):
    current_time = start_time + timedelta(seconds=i*0.01)
    
    if random.random() < 0.999:
        level = random.choice(['INFO', 'DEBUG', 'WARN'])
        log_lines.append(f"{current_time.isoformat()} [{level}] Normal operation")
    else:
        if i > 400000:
            level = 'ERROR'
            log_lines.append(f"{current_time.isoformat()} [{level}] Connection timeout to database")
        else:
            log_lines.append(f"{current_time.isoformat()} [WARN] High latency detected")

with open('demo/sample-data/large-log.txt', 'w') as f:
    f.write('\n'.join(log_lines))

print(f"Generated {len(log_lines)} log lines")
EOFPYTHON
    echo "✓ Sample log file generated"
fi

echo "✓ Verifying MCP configs..."
node tools/token-inspector.js --config demo/mcp-configs/full-tools.json --verbose > /dev/null 2>&1 && echo "  ✓ full-tools.json" || echo "  ✗ full-tools.json"
node tools/token-inspector.js --config demo/mcp-configs/selective-tools.json > /dev/null 2>&1 && echo "  ✓ selective-tools.json" || echo "  ✗ selective-tools.json"

echo ""
echo "✅ Demo environment ready!"
echo ""
echo "Next steps:"
echo "  1. Run baseline: bash scripts/run-baseline.sh"
echo "  2. Run Copilot: code ."
echo "  3. Follow README.md for demo flow"
