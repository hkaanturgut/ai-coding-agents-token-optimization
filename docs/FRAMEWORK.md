# Stop Burning Tokens: Framework & Deep Dive

## Overview
The **Write, Select, Compress, Isolate** framework is a systematic approach to reducing token waste across AI coding agents and MCP-powered workflows.

---

## 1. Write - Understand What You're Paying For

### The Problem
Most teams ship AI workflows without ever measuring what goes into context:
- Tool definitions (often 50K+ tokens)
- System prompts (1-5K tokens each)
- Conversation history (grows with every turn)
- Loaded context files (full file dumps)

**Before writing a single prompt, you're already paying for 50K+ tokens.**

### The Solution: Baseline Your Setup
```bash
node tools/token-inspector.js --config your-config.json --verbose
```

This shows:
```
System Prompt:         1,200 tokens
Tool Definitions:     52,340 tokens  ⚠️
Conversation History:  8,120 tokens
Loaded Context:        2,850 tokens
─────────────────────────────
TOTAL OVERHEAD:       64,510 tokens
```

### Key Questions to Answer
1. **Which tools are actually used?** (Often 50%+ are dead weight)
2. **Is your system prompt too verbose?** (Compress from 5K to 1.2K)
3. **Are you keeping full conversation history?** (Compress to summary)
4. **Are you loading full files into context?** (Load only snippets)

### Real-World Impact
- Baseline: 64.5K tokens overhead
- Typical task prompt: 2-5K tokens
- **Hidden cost: 90%+ of context before you type anything**

---

## 2. Select - Load Only What You Need

### The Problem: Tool Definition Bloat
MCP servers can define 100+ tools. You use 2-3 per task.

**Traditional approach:** Load all definitions (52K tokens per session)
**Smart approach:** Load only task-relevant tools (9.8K tokens per session)

### The Math
```
Full Config:        64.5K tokens
Selective Config:    9.8K tokens
────────────────────────────
Savings:            54.7K tokens (85% reduction!)
```

### Implementation Patterns

#### Pattern 1: Task-Based Tool Selection
```javascript
// When: Code refactoring task
tools: ['code-analyzer', 'code-generator', 'test-generator']  // 15K

// When: Bug hunting task
tools: ['log-analyzer', 'debugger', 'file-reader']  // 12K

// When: Database migration task
tools: ['schema-analyzer', 'migration-generator', 'sql-validator']  // 18K
```

#### Pattern 2: Dynamic Tool Discovery
Instead of loading definitions upfront, ask the agent what it needs:
```
User: "Refactor this authentication code"
Copilot (System): "To refactor auth, I'll need:
  - code-analyzer (to find issues)
  - code-generator (to write fixes)
  - test-generator (to verify)
  
Load these? [Y/n]"
```

### Costs Across Platforms

| Platform | Full Load | Selective | Savings |
|----------|-----------|-----------|---------|
| Copilot | 52K | 12K | 77% ↓ |
| Claude Code | 48K | 8K | 83% ↓ |
| Cursor | 55K | 15K | 73% ↓ |
| Roocode | 50K | 14K | 72% ↓ |

### Real-World Scenario: 20 Code Reviews/Month
- **Before:** 64.5K tokens per review × 20 = 1.29M tokens/month = $38.70/month
- **After:** 9.8K tokens per review × 20 = 196K tokens/month = $5.88/month
- **Savings:** $32.82/month (84%)

---

## 3. Compress - Code Beats Data

### The Problem: Raw Data Dumps
Teams often throw entire files, logs, or responses into context:
- 10MB log file → 80K tokens
- JSON response → 25K tokens
- Full CSV → 50K tokens

**All this could be analyzed locally for $0, instead of billed to AI.**

### The Solution: Use Local Compute First

#### Example 1: Log Analysis
```bash
# ❌ BAD: Dump full log to Copilot
Copilot: "Here's my 10MB log. Find errors."
Cost: 80K tokens

# ✅ GOOD: Use grep locally, feed results to Copilot
grep -i "error\|exception\|fatal" large-log.txt | head -50 > errors.txt
Copilot: "Here are 50 error lines. Root cause?"
Cost: 2K tokens (97.5% savings!)
```

#### Example 2: JSON Filtering
```bash
# ❌ BAD
Copilot: "Here's my API response JSON (50K tokens)..."

# ✅ GOOD
jq '.errors[] | {timestamp, message, stackTrace}' response.json | head -20
Copilot: "Here's the error summary..."
Cost: 3K tokens (94% savings!)
```

#### Example 3: CSV Analysis
```bash
# ❌ BAD
Copilot: "Here's my 1M-row CSV..."

# ✅ GOOD
awk -F, '$5 > 0.95 {print $1, $2, $5}' data.csv | head -30
Copilot: "These are the anomalies. What patterns?"
Cost: 1.5K tokens (98% savings!)
```

### Caveman Mode: Ultra-Compression

For multi-turn interactions, use ultra-compressed responses:

```bash
node tools/caveman-formatter.js --file response.txt --mode ultra
```

**Result:**
- Normal response: 2,450 tokens
- Caveman (ultra): 620 tokens
- **Savings: 75% per turn**

**Example:**
```
Normal: "The issue is that the connection pool exhausted because the timeout 
was set too low. This caused the database to close connections prematurely, 
which in turn led to the OOM killer..."

Caveman: "Connection pool exhausted due to low timeout → DB closed connections 
prematurely → OOM killer invoked."
```

### Pattern: Computation Migration

**Question:** When should you use local compute vs. AI?

**Answer:** When you can compress the result by 90%+:

| Task | Local | AI | Compression | Use |
|------|-------|----|----|-----|
| Find errors in 10MB log | grep | Summary | 97% | Local |
| Analyze error patterns | awk | Root cause | 85% | Local |
| Filter JSON by field | jq | Analysis | 90% | Local |
| Extract CSV columns | cut/awk | Insights | 95% | Local |
| Refactor code | ✗ | Code generation | 10% | AI |
| Write tests | ✗ | Test generation | 15% | AI |

**Rule:** If local compute can reduce data by 80%+, do it locally.

---

## 4. Isolate - Per-Agent Budgets, Not Mega-Agents

### The Problem: Bloated Single Agent
One agent doing all the work = high context consumption + slow execution:

```
Single Super-Agent (BAD):
├─ Turn 1: Read code        (25K tokens)
├─ Turn 2: Analyze          (28K tokens)
├─ Turn 3: Generate fixes   (30K tokens)
├─ Turn 4: Review fixes     (32K tokens)
├─ Turn 5: Write tests      (35K tokens)
└─ Turn 6: Final check      (38K tokens)
   ────────────────────────
   TOTAL: 188K tokens | 3 min execution
```

### The Solution: Specialized Agent Pipeline

```
Multi-Agent Pipeline (GOOD):
Analyzer    → 2 turns, 10K tokens → Categorized issues (2KB)
Implementer → 2 turns, 25K tokens → Fixed code (5KB)
Reviewer    → 1 turn, 8K tokens → Quality report (2KB)
────────────────────────────────────
TOTAL: 43K tokens | 2 min execution (77% savings!)
```

### Benefits of Multi-Agent

| Metric | Single | Multi | Benefit |
|--------|--------|-------|---------|
| Tokens | 188K | 43K | 77% ↓ |
| Time | 3 min | 2 min | 33% faster |
| Cost | $0.0056 | $0.0013 | 77% ↓ |
| Accuracy | Moderate | High | Specialist expertise |
| Parallelism | No | Yes | Can run in parallel |

### When to Split Agents

**✅ Split when:**
- Output of Agent A is <10% of input size (big compression)
- Tasks require different expertise (analysis vs. coding vs. review)
- Context budget allows multiple small agents vs. 1 large
- You need quality gates (specialist reviewers)

**❌ Don't split when:**
- Total task < 30K tokens (overhead not worth it)
- Tasks are deeply interdependent (A needs all context from B)
- You have few API calls/day (overhead swallows savings)

### Real-World Scenario: 100 Code Reviews/Month

| Approach | Tokens | Cost | Time | Benefit |
|----------|--------|------|------|---------|
| Single agent | 18.8M | $564 | 300 min | Baseline |
| Multi-agent | 4.3M | $129 | 200 min | **77% savings + 33% faster** |

**Savings: $435/month on just code reviews**

---

## Implementation Checklist

### Week 1: Measure
- [ ] Run `token-inspector.js` on your current setup
- [ ] Document baseline: system prompt + tools + history + context
- [ ] Calculate monthly token burn
- [ ] Identify lowest-hanging fruit (unused tools, verbose prompts)

### Week 2: Optimize
- [ ] Remove unused tools (50% of definitions often unused)
- [ ] Compress system prompt (2x compression typically possible)
- [ ] Implement caveman mode for multi-turn workflows
- [ ] Try local compute for log/data analysis (avoid data dumps)

### Week 3: Restructure
- [ ] Identify 1-2 workflows suitable for multi-agent
- [ ] Test single-agent vs. multi-agent on real tasks
- [ ] Measure actual token savings (not theoretical)
- [ ] Document best practices for your team

### Week 4: Systematic
- [ ] Create per-task tool configs (different tools for different jobs)
- [ ] Build agent pipeline templates (copy/paste setup for common patterns)
- [ ] Create team runbook for "design agents with budgets"
- [ ] Monitor ongoing token spend (monthly)

---

## Measurable Outcomes

After implementing the framework:

```
BEFORE:
├─ Avg task: 150K tokens
├─ Monthly (100 tasks): 15M tokens
├─ Monthly cost: $450
└─ Avg latency: 3 minutes

AFTER:
├─ Avg task: 45K tokens (70% reduction)
├─ Monthly (100 tasks): 4.5M tokens
├─ Monthly cost: $135 (70% savings)
└─ Avg latency: 1.5 minutes (50% faster)
```

**Annual savings: $3,780 per engineer using AI coding tools**

---

## Platform-Specific Notes

### GitHub Copilot
- Tool definitions: Load via extensions only when needed
- Compression: Use prompt compression in settings
- Multi-agent: Not natively supported; use external orchestration

### Claude Code
- Tool definitions: Supports dynamic loading natively
- Compression: caveman mode recommended
- Multi-agent: Supported via threads + context management

### Cursor
- Tool definitions: Selective loading available
- Compression: Manual via user prompts
- Multi-agent: Via external agent framework integration

### Roocode
- Tool definitions: Full load by default (improve!)
- Compression: Not built-in (use external tools)
- Multi-agent: Limited native support

---

## Common Pitfalls

1. **Loading all MCP tools upfront** → Use selective config
2. **Dumping full files for analysis** → Use grep/jq/awk first
3. **Keeping full conversation history** → Summarize after 5 turns
4. **One agent doing everything** → Split into 2-3 focused agents
5. **Verbose system prompts** → Compress by 50%+ possible
6. **Not measuring baseline** → Hard to know if optimizations work

---

## Resources

- **Token Counting:** https://github.com/openai/tiktoken
- **caveman** (compression): https://github.com/juliusbrussee/caveman
- **ponytail** (token tracking): https://github.com/DietrichGebert/ponytail
- **MCP Spec:** https://modelcontextprotocol.io/
