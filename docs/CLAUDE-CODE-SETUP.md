# Claude Code Setup & Token Optimization

## Prerequisites
- VS Code with Claude Code extension
- Anthropic API key (https://console.anthropic.com)
- $5+ monthly credits recommended

---

## Setup

### 1. Install Extension
```
Extensions → Search "Claude Code" → Install
```

### 2. Add API Key
```
Settings → Extensions → Claude Code → API Key
Paste your Anthropic API key
```

### 3. Test Connection
Open Claude Code sidebar, send a message: "Hello"
Should respond within 2 seconds.

---

## Token Optimization for Claude Code

### Context Window Management
Claude Code has up to 200K context window. Manage it:

```javascript
// In Claude Code settings
{
  "contextWindow": 200000,
  "compressionMode": "caveman-full",  // 75% compression
  "conversationSummaryAfter": 8,       // Summarize every 8 turns
  "maxContextTurns": 20,               // Soft reset after 20 turns
  "toolBudget": {
    "analyzer": 30000,                 // Allocate 30K to analyzer agent
    "implementer": 100000,             // Allocate 100K to implementer
    "reviewer": 20000                  // Allocate 20K to reviewer
  }
}
```

### Multi-Agent Threading (Native Support)
Claude Code supports threads for multi-agent workflows:

```javascript
// Thread 1: Analyzer
// "Analyze this code for issues"
// Returns: Issue summary (compressed)

// Thread 2: Implementer (starts fresh, uses summary from Thread 1)
// "Given these issues, generate fixes"
// Returns: Fixed code

// Thread 3: Reviewer (starts fresh)
// "Review these fixes for quality"
// Returns: Approval
```

**Benefit:** Each thread gets full context window (200K) = efficient use

### Use caveman Mode for Compression
Claude Code integrates with caveman-compatible responses:

```
Settings → Compression Mode → "Full (75% reduction)"
```

Or use tool:
```bash
node tools/caveman-formatter.js --mode full
# Copy output back into Claude Code
```

---

## Best Practices for Claude Code

### ✅ DO
1. **Use threads for complex workflows**
   - Analyzer thread
   - Implementer thread
   - Reviewer thread
   - (Each gets fresh 200K context)

2. **Leverage long context window**
   - Load full files (up to 100K tokens of code)
   - Keep full conversation history
   - Reference multiple files in one thread

3. **Enable compression mode**
   - Reduces tokens/turn by 75%
   - Multi-turn sessions: 8 turns × 2.2K = 17.6K (vs. 70K normal)

4. **Task-based tool loading**
   ```
   Task: "Refactor this database query"
   Auto-loads: query-analyzer, query-optimizer, test-generator
   Skips: deployment-tools, api-generator
   ```

### ❌ DON'T
1. **Use single thread for multi-turn workflow**
   - Context gets fragmented
   - Loses focus over turns

2. **Keep conversation history forever**
   - After 8-10 turns, summarize
   - Start new thread for next task

3. **Disable compression on long sessions**
   - Costs 3x more tokens
   - Response quality unaffected with caveman mode

---

## Multi-Agent Architecture for Claude Code

### Pattern: Three-Thread Workflow
```
Main Orchestrator:
├─ Call Analyzer Thread
│  ├─ Task: Analyze code
│  ├─ Input: Source code
│  └─ Output: Issues (compressed summary)
│
├─ Call Implementer Thread
│  ├─ Task: Generate fixes
│  ├─ Input: Issues summary + code snippets
│  └─ Output: Fixed code
│
└─ Call Reviewer Thread
   ├─ Task: Verify quality
   ├─ Input: Fixes + original issues
   └─ Output: Approval report
```

### Token Accounting per Thread
```
Thread 1 (Analyzer):
├─ System prompt:     1.2K
├─ Tool definitions:  12K (selective)
├─ Task:             2K
├─ Code input:       80K
└─ Analysis output:  5K (compressed)
   TOTAL: 100.2K (uses 50% of 200K window)

Thread 2 (Implementer):
├─ System prompt:     1.2K
├─ Tool definitions:  15K (code-generation tools)
├─ Input from T1:     5K (summary, not full analysis)
├─ Code snippets:     60K
└─ Implementation:    30K
   TOTAL: 111.2K (uses 56% of 200K window)

Thread 3 (Reviewer):
├─ System prompt:     1.2K
├─ Tool definitions:  10K
├─ Input from T2:     15K (fixes summary)
└─ Review:           8K
   TOTAL: 34.2K (uses 17% of 200K window)
```

**Total tokens across 3 threads: 245.6K**  
**Cost: $0.0074 (at $0.00003/token)**

Compare to single-thread approach (400K tokens = $0.012): **38% savings**

---

## Real-World Claude Code Setup

### Recommended Configuration
```json
{
  "contextWindow": 200000,
  "compressionMode": "full",
  "toolLoadingStrategy": "selective",
  "conversationSummaryAfter": 8,
  "maxContextTurns": 15,
  "threadStrategy": "multi-agent",
  "budgetPerAgent": {
    "analyzer": 50000,
    "implementer": 120000,
    "reviewer": 30000
  },
  "monitoringEnabled": true,
  "tokenAlertThreshold": 150000
}
```

### Usage Patterns
- **Code analysis:** 80-100K tokens per file (full file in context)
- **Refactoring:** 120-150K tokens (with multi-agent split: 50K each)
- **Test generation:** 50-70K tokens (with full context of codebase)
- **Documentation:** 40-60K tokens

### Monthly Estimate
```
Weekly tasks (assume 40 hour week):
├─ 3 code reviews × 50K = 150K
├─ 2 refactoring × 50K = 100K
├─ 5 test generations × 30K = 150K
├─ 2 architecture designs × 40K = 80K
└─ 2 debugging sessions × 60K = 120K
   Weekly: 600K tokens

Monthly (4 weeks): 2.4M tokens
Cost: $72/month

With optimization (70% savings): $21.60/month
```

---

## Advanced: Custom Instructions

Create custom instructions for Claude Code:

```
System Instruction:
"
You are an expert software architect and code reviewer.

PRINCIPLES:
1. Analyze before generating (quick summary)
2. Write production-ready code (error handling, logging, tests)
3. Use compression mode in responses (concise, technical, no filler)
4. Prefer performance-critical solutions
5. Always include tests and documentation links

COMPRESSION:
Use ultra-concise responses. Remove: explanations, pleasantries, examples that aren't essential.
Example: Instead of 'The issue is that the database connection pool...' say 'Pool exhaustion → OOM → service crash'

TOOLS:
Only load: code-analyzer, test-generator, documentation-generator
Skip: deployment-tools, api-generator

BUDGET:
Max 50K tokens per analysis, 80K per implementation, 30K per review.
"
```

---

## Troubleshooting

**Q: Claude Code is rate-limited**  
A: You hit API rate limits. Wait 60s, then retry. Upgrade API tier for higher limits.

**Q: Context window warning**  
A: Summarize conversation or start new thread. Use compression mode.

**Q: Poor response quality**  
A: Too much context. Use selective tool loading. Enable compression.

**Q: Threads not working**  
A: Update extension. Restart VS Code.

---

## Comparison: Threads vs. Single Context

### Single Context (Old Way)
```
Turn 1: Analyze           (30K tokens, context: 30K)
Turn 2: Implement         (50K tokens, context: 80K cumulative)
Turn 3: Review            (20K tokens, context: 100K cumulative)
Turn 4: Refine            (25K tokens, context: 125K cumulative)
────────────────────────────────────
TOTAL: 125K tokens, but all 4 turns share single context (fragmented)
```

### Multi-Agent Threads (New Way)
```
Thread 1 (Analyzer):   
  Input: Code (80K) + System (2K) = 82K
  Output: Issues (5K)
  Cost: 87K tokens

Thread 2 (Implementer):
  Input: Issues (5K) + Snippets (60K) + System (2K) = 67K
  Output: Fixed code (30K)
  Cost: 97K tokens

Thread 3 (Reviewer):
  Input: Fixes (15K) + System (2K) = 17K
  Output: Approval (3K)
  Cost: 20K tokens
────────────────────────────────────
TOTAL: 204K tokens, but 3 FOCUSED threads (vs. 1 fragmented thread)
Quality: Higher (specialist expertise)
Speed: Faster (potentially parallel)
```

---

## Resources
- Claude Code Docs: https://www.anthropic.com
- API Reference: https://docs.anthropic.com
- Token Counter: https://token-counter.app (unofficial)
- caveman mode: https://github.com/juliusbrussee/caveman
