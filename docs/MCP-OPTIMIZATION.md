# MCP Tool Optimization Deep Dive

## What is MCP (Model Context Protocol)?

MCP is a standard for AI agents to access tools, data, and services. Tools are defined as JSON schemas that tell the AI what they can do.

**Problem:** Loading all tool definitions upfront wastes massive tokens on schemas you may never use.

---

## Tool Definition Bloat

### Example: Full Tool Definition
```json
{
  "name": "database-analyzer",
  "description": "Analyze database schemas for performance issues...",
  "inputSchema": {
    "type": "object",
    "properties": {
      "schema": { "type": "string", "description": "The SQL schema..." },
      "tables": { "type": "array", "items": { "type": "string" } },
      "indexes": { "type": "array", "items": { "type": "string" } },
      "constraints": { "type": "object", "properties": {...} },
      "performance_metrics": { "type": "object", "properties": {...} }
    },
    "required": ["schema"]
  }
}
```

**This one tool = 2.5K tokens in the definition alone**

With 8-10 tools: **20-25K tokens just for unused tool definitions**

---

## Selective Tool Loading Strategies

### Strategy 1: Task-Based Loading
Load different tools for different task types:

```javascript
{
  "taskProfiles": {
    "code-review": {
      "tools": ["code-analyzer", "test-generator"],
      "contextBudget": 30000
    },
    "refactoring": {
      "tools": ["code-analyzer", "code-generator", "performance-profiler"],
      "contextBudget": 60000
    },
    "bug-hunt": {
      "tools": ["log-analyzer", "code-finder", "debugger"],
      "contextBudget": 40000
    },
    "documentation": {
      "tools": ["documentation-generator"],
      "contextBudget": 20000
    }
  }
}
```

**Usage:**
```bash
# Start session with profile
TASK_PROFILE=code-review copilot --load-profile code-review

# Only loads 2 tools (5K tokens)
# vs. 8 tools (20K tokens)
# Savings: 75%
```

### Strategy 2: Dynamic Tool Discovery
Ask AI what it needs, then load only those:

```
User: "Refactor this database query"

AI Analysis: "To refactor a query, I need:
  - Schema analyzer (to understand current query)
  - Query optimizer (to optimize)
  - Test generator (to verify correctness)
  
Should I load these 3 tools? [Y/n]"

User: "Yes"

AI: Loads only the 3 tools (7.5K tokens instead of 25K)
```

### Strategy 3: Lazy Loading
Don't load any tools upfront. Load them only when AI requests them:

```
Turn 1: User asks "Analyze this schema"
AI: "I need database-analyzer tool. Loading..."
(5K tokens loaded here, not at session start)

Turn 2: AI uses tool, responds with analysis

Turn 3: User asks "Generate migration"
AI: "I need migration-generator tool. Loading..."
(Another 3K tokens loaded here)
```

**Benefit:** Total tokens = sum of tools actually used (not all possible tools)

---

## Platform Comparison

### GitHub Copilot
```json
// Extension config: .copilot/config.json
{
  "mcp": {
    "tools": ["code-analyzer", "test-generator"],  // Selective
    "autoload": false,  // Manual load
    "dynamicDiscovery": false  // Not supported
  }
}
```
**Result:** 12K tokens overhead (vs. 52K full)

### Claude Code
```json
// Native support for selective loading
{
  "mcp": {
    "tools": "selective",  // Automatic based on task
    "autoload": true,
    "dynamicDiscovery": true  // Supported!
  }
}
```
**Result:** 8K tokens overhead (AI requests tools on demand)

### Cursor
```json
// Cursor config
{
  "mcp": {
    "autoload": "selective",
    "tools": ["code-analyzer"],
    "loading": "lazy"  // Load only when used
  }
}
```
**Result:** 15K tokens overhead (mixed support)

### Roocode
```json
// Roocode config
{
  "mcp": {
    "autoload": true,  // Loads all by default (improvement needed!)
    "tools": "all"
  }
}
```
**Result:** 50K tokens overhead (opportunity for optimization)

---

## Building Your Custom Tool Config

### Step 1: Audit Current Usage
```bash
# Log tool usage for a week
# Track: which tools called, frequency, success rate

# Example output:
# code-analyzer:      127 calls (86% of calls)
# test-generator:     18 calls (12%)
# deployment-tools:   0 calls (0%) ❌ REMOVE
# api-generator:      1 call (0.7%) ❌ REMOVE
# performance-profiler: 15 calls (10%)
```

### Step 2: Create Minimal Config
```json
{
  "systemPrompt": "Expert code reviewer. Brief, technical.",
  "tools": [
    {
      "name": "code-analyzer",
      "description": "Find bugs, security issues, performance problems"
    },
    {
      "name": "test-generator",
      "description": "Generate unit tests"
    }
  ]
  // Tools NOT included: deployment, api-generator, etc.
}
```

### Step 3: Measure Baseline
```bash
node tools/token-inspector.js --config minimal-config.json
# Output: 9.8K tokens overhead (vs. 52K full config)
```

### Step 4: Create Task-Specific Variants
```json
// For code-review task
{
  "task": "code-review",
  "tools": ["code-analyzer", "test-generator"]
}

// For refactoring task
{
  "task": "refactoring",
  "tools": ["code-analyzer", "code-generator", "performance-profiler"]
}

// For debugging task
{
  "task": "debugging",
  "tools": ["log-analyzer", "debugger", "code-analyzer"]
}
```

---

## MCP Tool Size Breakdown

### Typical Tool Definition Sizes

| Tool | Size | Use % |
|------|------|-------|
| code-analyzer | 2.5K | 85% |
| test-generator | 2.2K | 70% |
| log-analyzer | 1.8K | 30% |
| code-generator | 3.2K | 60% |
| performance-profiler | 2.1K | 40% |
| deployment-tools | 4.5K | 5% ❌ |
| api-generator | 3.8K | 10% ⚠️ |
| documentation-generator | 2.0K | 25% |

**Full load (all 8):** 22.1K tokens
**Selective (code-review):** 4.7K tokens (78% savings!)

---

## Best Practices

### ✅ DO
1. **Audit tools monthly** - Remove unused ones
2. **Create task-specific configs** - Different jobs, different tools
3. **Use lazy loading** - Load tools only when needed
4. **Compress tool descriptions** - Can be 50% shorter
5. **Monitor tool usage** - Track which tools are actually called

### ❌ DON'T
1. **Load all tools by default** - Wastes 40K+ tokens
2. **Keep old/deprecated tools** - Clean up unused tools
3. **Use verbose descriptions** - Compress to essentials
4. **Load tools at session start** - Delay load until needed
5. **Ignore platform differences** - Some platforms support dynamic loading better

---

## Real-World MCP Optimization Example

### Scenario: Code Review Workflow

**Before:**
```json
{
  "tools": [
    "code-analyzer",
    "test-generator", 
    "performance-profiler",
    "deployment-tools",  // Not needed for review
    "api-generator",     // Not needed for review
    "database-analyzer", // Not needed for review
    "documentation-gen"  // Not needed for review
  ]
  // Total: 22K tokens overhead
}
```

**After:**
```json
{
  "task": "code-review",
  "tools": [
    "code-analyzer",     // Find bugs
    "test-generator"     // Generate tests
  ]
  // Total: 4.7K tokens overhead (78% savings!)
}
```

**Impact:**
- Baseline overhead: 22K → 4.7K tokens
- AI response quality: Same (has all needed tools)
- AI focus: Better (fewer distractions)
- Cost: 78% savings on overhead

---

## Tools Included in This Demo

### token-inspector.js
Measures token consumption across all dimensions:
```bash
node tools/token-inspector.js --config config.json --verbose

# Output includes tool-by-tool breakdown
```

### agent-budget-calculator.js
Plans multi-agent pipelines with tool budgets:
```bash
node tools/agent-budget-calculator.js --scenario code-review

# Shows: which tools each agent needs, token allocation
```

---

## Resources
- MCP Specification: https://modelcontextprotocol.io/
- OpenAI Token Counter: https://github.com/openai/tiktoken
- Anthropic Documentation: https://docs.anthropic.com
