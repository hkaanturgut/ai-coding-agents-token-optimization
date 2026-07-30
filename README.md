# Stop Burning Tokens: Hands-On AI Agent Cost Optimization
## DevOps Toronto Demo Session

A hands-on walkthrough for diagnosing and fixing token waste in AI coding agents and MCP-powered workflows using the **Write, Select, Compress, Isolate** framework.

**Event:** [DevOps Toronto Meetup - July 30, 2026](https://www.meetup.com/devopsto/events/315582119/)  
**Duration:** 30 minutes (live demo + tools walkthrough)  
**Audience:** DevOps/SRE + developers + architects  
**Tools:** GitHub Copilot + Claude Code + MCP

---

## 🎯 What You'll Learn

- **Write:** How to baseline token overhead (50K+ tokens before your first prompt)
- **Select:** Dynamic tool discovery to reduce context by 85%
- **Compress:** Using code execution instead of dumping raw data
- **Isolate:** Multi-agent pipelines with per-agent context budgets

---

## 📁 Repository Structure

```
.
├── README.md                          # This file - full demo walkthrough
├── demo/
│   ├── scenarios/
│   │   ├── bug-hunt.md               # Live demo scenario 1: Find bug in logs
│   │   ├── code-review.md            # Live demo scenario 2: Review code changes
│   │   └── refactoring.md            # Live demo scenario 3: Refactor with constraints
│   ├── mcp-configs/
│   │   ├── full-tools.json           # MCP config: All tools loaded
│   │   ├── selective-tools.json      # MCP config: Selective tool loading
│   │   └── tool-budget.json          # MCP config: Per-agent tool budgets
│   └── sample-data/
│       ├── large-log.txt             # Sample 10MB log file
│       ├── code-changes.diff         # Sample code review scenario
│       └── database-schema.sql       # Sample refactoring target
├── tools/
│   ├── token-inspector.js            # Run this first: Measure token baseline
│   ├── caveman-formatter.js          # Compress output by 75%
│   └── agent-budget-calculator.js    # Plan multi-agent pipelines
├── docs/
│   ├── FRAMEWORK.md                  # Deep dive into Write-Select-Compress-Isolate
│   ├── COPILOT-SETUP.md             # GitHub Copilot configuration
│   ├── CLAUDE-CODE-SETUP.md         # Claude Code setup & best practices
│   ├── MCP-OPTIMIZATION.md          # MCP tool loading strategies
│   └── ATTENDEE-HANDOUT.md          # One-pager for attendees
└── scripts/
    ├── setup-demo.sh                 # Prepare demo environment
    ├── run-baseline.sh               # Quick baseline measurement
    └── run-demo.sh                   # One-command end-to-end run
```

---

## 🚀 Quick Start: Run the Demo End-to-End

### Prerequisites
```bash
# Ensure you have:
# - Node.js 18+ (for token counting scripts)
# - Python 3.8+ (for demo scripts)
# - GitHub Copilot or Claude Code enabled in VS Code/Cursor
# - jq (for JSON analysis)

npm install                    # Install dependencies
python3 -m pip install -r requirements.txt  # Install Python deps
```

### 1️⃣ Setup Demo Environment (5 min prep)
```bash
# Clone and prepare
git clone https://github.com/hkaanturgut/ai-coding-agents-token-optimization.git
cd ai-coding-agents-token-optimization

# Install dependencies
npm install
pip install -r requirements.txt

# Generate sample data + verify tools
bash scripts/setup-demo.sh
```

**What this does:**
- Creates sample MCP configurations
- Generates a 10MB log file for the "bug hunt" scenario
- Sets up token inspection baseline

### 2️⃣ Run End-to-End Demo (single command)
```bash
npm run demo
```

### 3️⃣ Open Scenarios in Copilot/Claude Code
```bash
code demo/scenarios/bug-hunt.md
code demo/scenarios/code-review.md
code demo/scenarios/refactoring.md
```

---

## 📊 Demo Flow (30 Minutes)

### **Segment 1: Write - Baseline It** (6 minutes)

**Goal:** Show where tokens actually go before typing a word.

#### Step 1.1: Run Token Baseline
```bash
node tools/token-inspector.js --config demo/mcp-configs/full-tools.json
```

**Expected Output:**
```
=== TOKEN BASELINE REPORT ===
System Prompt:          1,200 tokens
Tool Definitions:      52,340 tokens  ⚠️  (85% of total overhead!)
Conversation History:   8,120 tokens
Loaded Context:         2,850 tokens
─────────────────────────────
TOTAL OVERHEAD:        64,510 tokens
(Before you type a single prompt)
```

**Key Insight:** "52K tokens in tool definitions for tools you might never use."

#### Step 1.2: Open Demo in Copilot
1. Open Cursor or VS Code with Copilot
2. Load sample MCP tools (see `demo/mcp-configs/full-tools.json`)
3. Show the token count in the UI
4. **Narrator:** "Notice—tool definitions dominate. Our first optimization: don't load them all."

---

### **Segment 2: Select - Dynamic Tools** (5 minutes)

**Goal:** Load only what you need → 85% reduction.

#### Step 2.1: Compare Configurations
```bash
node tools/token-inspector.js --config demo/mcp-configs/full-tools.json
node tools/token-inspector.js --config demo/mcp-configs/selective-tools.json
```

**Expected Output:**
```
FULL CONFIG:       64,510 tokens
SELECTIVE CONFIG:   9,850 tokens
─────────────────────────────
SAVINGS:           54,660 tokens (85% reduction!)
```

#### Step 2.2: Show Tool Selection Strategy
- **Problem:** All MCP tools loaded = 52K tokens wasted on unused schema
- **Solution:** Load tools based on task type
  - Code refactoring? Load `code-analyzer`, `code-generator`, skip `deployment-tools`
  - Bug hunting? Load `log-analyzer`, `debugger`, skip `database-tools`
  - Code review? Load `quality-analyzer`, skip everything else

#### Step 2.3: Live in Copilot/Claude Code
1. Switch to `selective-tools.json` config
2. Run same prompt as before
3. **Show:** Same quality output, 10x fewer tokens consumed
4. **Narrator:** "85% reduction without losing capability."

---

### **Segment 3: Compress - Code Over Data** (8 minutes)

**Goal:** Use compute instead of dumping raw data into context.

#### Step 3.1: The Antipattern
**Scenario:** "Find the bug in this 10MB log file"

**Bad Approach:**
```javascript
// 🚫 DON'T DO THIS - costs 80K+ tokens
const fullLog = fs.readFileSync('demo/sample-data/large-log.txt', 'utf8');
const prompt = `Here's a log file:\n${fullLog}\n\nFind the error and explain it.`;
// This alone = 80K tokens before the AI even thinks
```

**Cost:** ~80K tokens for raw data dump

#### Step 3.2: The Better Approach
```bash
# ✅ DO THIS - costs 2K tokens
# 1. Execute analysis locally
grep -i "error\|exception\|fatal" demo/sample-data/large-log.txt | head -50 > /tmp/errors.txt

# 2. Share only the result
cat /tmp/errors.txt  # ~2KB of relevant data

# Cost: 2K tokens + your local compute (free)
```

#### Step 3.3: Demo in Copilot
```bash
# Live Demo: Bug Hunt Scenario
open demo/scenarios/bug-hunt.md
```

**Walkthrough:**
1. Show the full log file size (~10MB)
2. Run the selective analysis command
3. Feed Copilot only the 50 error lines
4. Copilot finds the bug in 2K tokens vs. 80K tokens
5. **Time saved:** 78K tokens, same accuracy

#### Step 3.4: Caveman Mode Ultra-Compression
```bash
# Compare: Normal output vs. Caveman-compressed
node tools/caveman-formatter.js --input "Long technical response..." --mode full
```

**Shows:**
- Same technical content, 75% fewer tokens
- Perfect for multi-turn interactions (you save on every turn)

**Example:**
```
Normal Response:  2,450 tokens
Caveman Response:   620 tokens  (75% reduction)
```

---

### **Segment 4: Isolate - Multi-Agent Pipelines** (7 minutes)

**Goal:** Per-agent budgets instead of one mega-agent.

#### Step 4.1: Compare Single vs. Multi-Agent
```bash
node tools/agent-budget-calculator.js --scenario code-review --budget 100K
```

**Expected Output:**
```
=== SCENARIO: CODE REVIEW ===

SINGLE AGENT (BAD):
├─ Turn 1 (read code):    25K tokens
├─ Turn 2 (analyze):      28K tokens
├─ Turn 3 (review):       30K tokens
├─ Turn 4 (suggest fix):  32K tokens
├─ Turn 5 (refactor):     35K tokens
└─ Turn 6 (test):         38K tokens
   TOTAL: 188K tokens | 3min execution

THREE-AGENT PIPELINE (GOOD):
Agent 1 - Analyzer:
├─ Read & categorize issues:  15K tokens (2 turns)
└─ Pass summary to Agent 2

Agent 2 - Implementer:
├─ Receive categorized issues: 8K tokens (header)
├─ Implement fixes:           45K tokens (2 turns)
└─ Pass code to Agent 3

Agent 3 - Reviewer:
├─ Review fix quality:        10K tokens
└─ Report

TOTAL: 78K tokens | 1.5min execution (2x faster!)
SAVINGS: 110K tokens (58% reduction)
```

#### Step 4.2: Architecture Diagram
```
SINGLE AGENT (200K context, bloated):
┌─────────────────────────────────┐
│  Super-Agent                    │
│  • Read code                    │
│  • Analyze issues               │
│  • Implement fixes              │
│  • Review & test                │
│  • Context: Full file history   │
│  • 8 turns × 28K = 224K tokens  │
└─────────────────────────────────┘

MULTI-AGENT PIPELINE (distributed):
┌──────────┐      ┌──────────┐      ┌──────────┐
│ Analyzer │──────│ Implmtr  │──────│ Reviewer │
│ 30K ctx  │      │  50K ctx │      │  25K ctx │
│ 2 turns  │      │ 2 turns  │      │ 1 turn   │
│ 15K $    │      │  45K $   │      │  10K $   │
└──────────┘      └──────────┘      └──────────┘
   TOTAL: 70K tokens (69% savings!)
```

#### Step 4.3: Live Demo: Refactoring Scenario
```bash
# Open the refactoring scenario
open demo/scenarios/refactoring.md
```

**Walkthrough:**
1. Show single agent attempting full refactor (slow + expensive)
2. Switch to multi-agent approach:
   - Agent 1 analyzes schema → 2 turns, 15K tokens
   - Agent 2 generates migration → 2 turns, 45K tokens
   - Agent 3 tests result → 1 turn, 10K tokens
3. **Result:** Same outcome, 70K tokens instead of 150K

---

## 🔧 Tools Breakdown

### Token Inspector (`tools/token-inspector.js`)
Measures token consumption across system prompt, tools, history, and context.

```bash
node tools/token-inspector.js --config <config-file> [--verbose]
```

**Usage in Demo:**
```bash
# Step 1: Full tools config
node tools/token-inspector.js --config demo/mcp-configs/full-tools.json

# Step 2: Selective tools config
node tools/token-inspector.js --config demo/mcp-configs/selective-tools.json

# Compare the difference
```

### Caveman Formatter (`tools/caveman-formatter.js`)
Compresses AI responses by 75% while preserving all technical information.

```bash
node tools/caveman-formatter.js --input "<long response>" --mode ultra
```

**Modes:**
- `lite`: 50% compression (keep more detail)
- `full`: 75% compression (balanced)
- `ultra`: 85% compression (extreme, for multi-turn)

### Budget Calculator (`tools/agent-budget-calculator.js`)
Plans multi-agent pipelines with per-agent context budgets.

```bash
node tools/agent-budget-calculator.js --scenario code-review --budget 100K
```

**Output:**
- Optimal agent split
- Token cost per agent
- Expected execution time
- Bottlenecks

---

## 📋 Live Demo Scenarios

### Scenario 1: Bug Hunt (Segment 3)
**File:** `demo/scenarios/bug-hunt.md`

- **Setup:** 10MB log file with embedded error
- **Antipattern:** Dump entire log to Copilot (80K tokens)
- **Better:** Grep relevant lines (2K tokens)
- **In Copilot:** Open the scenario, follow the instructions
- **Time:** 3 minutes

### Scenario 2: Code Review (Segment 4)
**File:** `demo/scenarios/code-review.md`

- **Setup:** 500-line diff with potential issues
- **Antipattern:** Single agent reads entire file repeatedly
- **Better:** Multi-agent pipeline (analyzer → reviewer)
- **In Copilot:** Step through the pipeline approach
- **Time:** 4 minutes

### Scenario 3: Refactoring (Segment 4)
**File:** `demo/scenarios/refactoring.md`

- **Setup:** Database schema modernization
- **Antipattern:** One agent handles analysis + implementation + testing
- **Better:** Three specialized agents with budgets
- **In Copilot:** Show agent communication pattern
- **Time:** 3 minutes

---

## 🛠️ MCP Configurations

### Full Tools Config (`demo/mcp-configs/full-tools.json`)
Loads all tool definitions upfront.

**Cost:** 64K tokens overhead  
**Use Case:** Learning, exploration (not production)

### Selective Tools Config (`demo/mcp-configs/selective-tools.json`)
Loads only task-relevant tools.

**Cost:** 9.8K tokens overhead  
**Use Case:** Production, real workflows

### Tool Budget Config (`demo/mcp-configs/tool-budget.json`)
Per-agent tool restrictions.

**Example:**
- `analyzer` agent: `log-tools`, `query-tools` only
- `implementer` agent: `code-generator`, `formatter` only
- `reviewer` agent: `quality-analyzer` only

**Cost:** 12K tokens overhead  
**Use Case:** Multi-agent orchestration

---

## 📖 Deep Dive Docs

### `FRAMEWORK.md`
Complete explanation of the Write-Select-Compress-Isolate framework with real-world examples.

### `COPILOT-SETUP.md`
Step-by-step setup for GitHub Copilot:
- Enable token monitoring
- Configure MCP tools
- Best practices for cost control

### `CLAUDE-CODE-SETUP.md`
Setup for Claude Code (VS Code extension):
- Enable Claude API
- Optimize context window
- Multi-turn cost tracking

### `MCP-OPTIMIZATION.md`
Deep dive into MCP tool optimization:
- Tool definition bloat
- Selective loading strategies
- Dynamic tool discovery patterns

### `ATTENDEE-HANDOUT.md`
One-pager takeaways:
- Quick reference for the framework
- Resource links
- Copy-paste commands

---

## 🎬 Step-by-Step Demo Walkthrough for Presenters

### Pre-Demo (10 min setup)
```bash
# 1. Run setup script
bash scripts/setup-demo.sh

# 2. Verify baseline measures
bash scripts/run-baseline.sh

# 3. Open demo scenarios in separate windows
code demo/scenarios/bug-hunt.md &
code demo/scenarios/code-review.md &
code demo/scenarios/refactoring.md &

# 4. Open Copilot/Claude Code in main window
code .
```

### During Demo (30 min)

**Timeline & Checkpoints:**

| Time | Segment | Action | Expected Output |
|------|---------|--------|-----------------|
| 0:00–0:30 | Intro | Title slide + problem statement | - |
| 0:30–0:45 | Write | Run `token-inspector.js` (full config) | 64.5K tokens |
| 0:45–2:00 | Write | Open Copilot, show tool definitions | Visual confirmation |
| 2:00–2:30 | Select | Run token-inspector (selective config) | 9.8K tokens (85% ↓) |
| 2:30–3:15 | Select | Switch Copilot config, show improvement | Same results, 10x fewer tokens |
| 3:15–4:00 | Compress | Show bug-hunt scenario (large log) | 10MB file displayed |
| 4:00–5:00 | Compress | Demo grep + Copilot analysis | 50-line error list → bug found |
| 5:00–5:30 | Compress | Run caveman-demo script | 75% compression shown |
| 5:30–6:30 | Isolate | Run multi-agent-pipeline script | Pipeline comparison displayed |
| 6:30–7:30 | Isolate | Show refactoring scenario | Three-agent architecture shown |
| 7:30–8:30 | Closing | Summary + Q&A | Handout distributed |

**Hard Stops:**
- If Copilot demo hangs: Use pre-recorded screenshots
- If scripts fail: Run individual components
- If short on time: Skip scenario 2 (code-review), focus on bug-hunt + refactoring

---

## 💡 Key Talking Points

### Opening (2 min)
- **"Tokens are the new cloud spend"** — DevOps knows cost sprawl; this is tokens instead of compute
- **"50K tokens before you type"** — Tool definitions consumed before first prompt
- **"85% is real"** — Concrete number that sticks

### Middle (20 min)
- **Write:** Show the baseline and shock people
- **Select:** "Don't load tools you won't use"
- **Compress:** "Code beats data—always"
- **Isolate:** "Specialize agents, distribute cost"

### Closing (8 min)
- **"This is scalable"** — Framework works from 1 agent to 100
- **"Cost = speed"** — Smaller context = faster execution
- **"Tools included"** — Token inspector, caveman, budget calc provided
- **"Resources"** — ponytail, caveman open-source references

---

## 📦 Attendee Takeaways

### Handout: `ATTENDEE-HANDOUT.md`
One-page cheat sheet including:

1. **The Framework (Write → Select → Compress → Isolate)**
2. **Quick Commands**
   ```bash
   # Baseline your setup
   node tools/token-inspector.js --config your-config.json
   
   # Compress output
   node tools/caveman-formatter.js --mode full
   
   # Plan multi-agent splits
   node tools/agent-budget-calculator.js --scenario your-task
   ```
3. **Resources**
   - ponytail: https://github.com/DietrichGebert/ponytail
   - caveman: https://github.com/juliusbrussee/caveman
   - spec-kit: https://github.com/github/spec-kit
   - This repo: https://github.com/hkaanturgut/ai-coding-agents-token-optimization
4. **Next Steps**
   - Audit your setup this week
   - Run token inspector
   - Implement selective tool loading
   - Measure savings

---

## 🎓 Platform Comparison: Copilot vs. Claude Code vs. Others

| Feature | Copilot | Claude Code | Cursor | Roocode |
|---------|---------|-------------|--------|---------|
| Tool Definitions | Full load | Selective* | Selective | Full load |
| Context Window | 128K | 200K | 256K | 100K |
| Token Billing | Per-call | Per-call | Per-call | Per-call |
| MCP Support | Via extension | Native | Native | Via plugin |
| Compression | Yes (partial) | Yes (caveman) | Yes | Minimal |
| Multi-Agent | No native | Yes (threads) | Via plugin | No native |

*Claude Code selectively loads tools based on task type in some scenarios.

---

## 📊 Expected Results

After implementing the framework:

| Metric | Before | After | Savings |
|--------|--------|-------|---------|
| Token overhead (baseline) | 64.5K | 9.8K | 85% ↓ |
| Single-task tokens | 150K | 45K | 70% ↓ |
| Multi-agent pipeline | 200K | 78K | 61% ↓ |
| Cost per task | $0.80 | $0.22 | 73% ↓ |
| Execution time | 3 min | 1.5 min | 50% faster |

**Real-World Scenario: 100 daily tasks**
- **Before:** 15,000K tokens/day → $120/day → $3,600/month
- **After:** 4,500K tokens/day → $36/day → $1,080/month
- **Savings:** $2,520/month (70%)

---

## 🚀 Running the Demo

### Quick Start (for presenters)
```bash
# 1. Clone and install
git clone <this-repo>
cd ai-coding-agents-token-optimization
npm install && pip install -r requirements.txt

# 2. Setup demo environment
bash scripts/setup-demo.sh

# 3. Run each segment in order
bash scripts/run-baseline.sh                    # Segment 1
node tools/token-inspector.js --config demo/mcp-configs/selective-tools.json  # Segment 2
node tools/caveman-formatter.js --input "Long technical response..." --mode full  # Segment 3
node tools/agent-budget-calculator.js --scenario code-review --budget 100K        # Segment 4

# 4. Open scenarios in Copilot
code demo/scenarios/bug-hunt.md
code demo/scenarios/code-review.md
code demo/scenarios/refactoring.md
```

### Full Demo (30 min, live)
Follow the timeline in the "Step-by-Step Demo Walkthrough" section above.

---

## 📚 Files Quick Reference

| File | Purpose | Use Case |
|------|---------|----------|
| `tools/token-inspector.js` | Measure token overhead | Baseline analysis |
| `tools/caveman-formatter.js` | Compress output 75% | Multi-turn reduction |
| `tools/agent-budget-calculator.js` | Plan agent pipelines | Architecture design |
| `demo/scenarios/bug-hunt.md` | Live demo scenario | Segment 3 (Compress) |
| `demo/scenarios/code-review.md` | Live demo scenario | Segment 4 (Isolate) |
| `demo/scenarios/refactoring.md` | Live demo scenario | Segment 4 (Isolate) |
| `docs/FRAMEWORK.md` | Theory & deep dive | Attendee reference |
| `spec-kit` | Spec-first workflow scaffolding | Reduce prompt thrash/rework |
| `docs/COPILOT-SETUP.md` | GitHub Copilot guide | Production setup |
| `docs/CLAUDE-CODE-SETUP.md` | Claude Code guide | Production setup |
| `docs/ATTENDEE-HANDOUT.md` | One-pager takeaways | Post-demo resource |

---

## ❓ FAQ

**Q: Can I run this demo without Copilot?**  
A: Yes—scripts work standalone. Copilot is used only to show real-time token counts in the UI. You can demo with screenshots if needed.

**Q: How do I adapt this for my platform (Cursor, Roocode, etc.)?**  
A: See `docs/MCP-OPTIMIZATION.md` for platform-specific adaptations. The framework is universal; implementation varies slightly.

**Q: What if scripts fail during demo?**  
A: Run `npm run demo` first; if a live step fails, continue using `demo/scenarios/*.md` walkthroughs.

**Q: How much does this actually cost to implement?**  
A: $0—all tools are open-source. Implementation time: 2–4 hours for initial setup.

**Q: Can I use this framework with other AI coding tools?**  
A: Yes. Framework is tool-agnostic. Adapt MCP configs to your platform.

---

## 🔗 Resources

- **ponytail** (Token analysis): https://github.com/DietrichGebert/ponytail
- **caveman** (Compression): https://github.com/juliusbrussee/caveman
- **spec-kit** (Spec-first workflows): https://github.com/github/spec-kit
- **OpenAI Token Counter** (tiktoken): https://github.com/openai/tiktoken
- **Anthropic Token Counting** (claude API): https://docs.anthropic.com/claude/reference/token-counting
- **MCP Spec**: https://modelcontextprotocol.io/

---

## 📝 License

This demo is open-source and free to use, modify, and share.

---

**Happy token optimization! 🚀**

Questions? Open an issue or reach out to the community.
