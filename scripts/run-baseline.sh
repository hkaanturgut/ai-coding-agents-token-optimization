#!/bin/bash
# Run quick baseline measurement

echo "📊 Token Baseline Report"
echo "======================="
echo ""
echo "Full MCP Config (all tools loaded):"
node tools/token-inspector.js --config demo/mcp-configs/full-tools.json
echo ""
echo "Selective MCP Config (only needed tools):"
node tools/token-inspector.js --config demo/mcp-configs/selective-tools.json
echo ""
echo "Multi-Agent Pipeline Budget Calculator:"
node tools/agent-budget-calculator.js --scenario code-review
