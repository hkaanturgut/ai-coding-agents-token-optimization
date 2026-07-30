# Code Review Scenario - Live Demo

## Objective
Review a large pull request using **Isolate** methodology: split work across specialized agents instead of one mega-agent.

---

## The Problem
A 500-line PR changes core authentication logic. Traditional approach:

```
Single Agent (SLOW + EXPENSIVE):
├─ Turn 1: Read entire PR (25K tokens)
├─ Turn 2: Analyze for bugs (28K tokens)
├─ Turn 3: Check security issues (30K tokens)
├─ Turn 4: Suggest improvements (32K tokens)
├─ Turn 5: Generate refactored code (35K tokens)
└─ Turn 6: Review refactor quality (38K tokens)
   TOTAL: 188K tokens | 3 min execution
```

---

## The Better Way: Multi-Agent Pipeline

### Agent 1: Code Analyzer (Fast, Shallow)
**Context:** 30K
**Task:** Read diff, categorize issues
**Input:** The PR
**Output:** Summary of issues (bugs, security, style)

```
Copilot Prompt (Agent 1):
"Review this PR diff and categorize issues:
- CRITICAL bugs (logic errors)
- SECURITY issues (auth/validation flaws)
- CODE STYLE (maintainability)

<paste diff>

Output format:
## CRITICAL
- Line 45: Missing null check
- Line 89: Race condition in token refresh

## SECURITY
- Line 120: SQL injection vulnerable

## STYLE
- Inconsistent error handling pattern
"
```

**Tokens:** ~10K for this analysis
**Output:** 50-line summary of issues

---

### Agent 2: Code Implementer (Deep, Focused)
**Context:** 50K
**Task:** Generate fixes for each category
**Input:** Issue summary from Agent 1 (not full PR!)
**Output:** Fixed code

```
Copilot Prompt (Agent 2):
"Given these issues from a code review:

## CRITICAL
- Line 45: Missing null check on user object
- Line 89: Race condition in token refresh

Fix each issue and show the corrected code.
<provide concise before/after code snippets>
"
```

**Tokens:** ~25K for implementation
**Output:** Fixed code blocks

---

### Agent 3: Quality Reviewer (Final Check)
**Context:** 25K
**Task:** Verify fixes, check for regressions
**Input:** Original issues + proposed fixes
**Output:** Approval report

```
Copilot Prompt (Agent 3):
"Review these fixes for the authentication PR:
<paste Agent 2's fixes>

Checklist:
- Do fixes address the issues?
- Any new bugs introduced?
- Tests needed?
"
```

**Tokens:** ~8K for review
**Output:** Approval/rejection + reasoning

---

## Demo Timeline (4 minutes)

### Setup
1. Open terminal
2. Show PR: `wc -l demo/scenarios/code-changes.diff` → "500 lines"
3. **Narrator:** "Traditional: one agent reads & rewrites everything. Let's do better."

### Single Agent (Bad)
1. Show the timeline above
2. **Narrator:** "188K tokens for one PR review. Do this 20 times/month → $11 per review"

### Multi-Agent Pipeline (Good)
1. Show the three-agent architecture diagram
2. Run: `python3 demo/04-multi-agent-pipeline.py --scenario code-review`
3. **Expected output:**
   ```
   Agent 1 - Analyzer:      10K tokens
   Agent 2 - Implementer:   25K tokens
   Agent 3 - Reviewer:       8K tokens
   ────────────────────────
   TOTAL:                   43K tokens (77% savings!)
   ```
4. **Narrator:** "Same result, 77% fewer tokens. And we got specialized expertise."

### Live Demo
1. Open first agent prompt (analysis)
2. Show output: categorized issues
3. Open second agent prompt (implementation)
4. Show output: fixed code
5. Open third agent prompt (review)
6. Show output: approval report
7. **Narrator:** "Three focused agents > one confused mega-agent"

---

## Key Advantages

| Metric | Single Agent | Multi-Agent |
|--------|--------------|-------------|
| Tokens | 188K | 43K |
| Time | 3 min | 2 min |
| Cost | $0.0056 | $0.0013 |
| Error Rate | Moderate | Low (3 reviews) |
| Specialization | Generic | Expert per role |

**Real-World:** 20 PR reviews/month
- Single agent: $0.11/month
- Multi-agent: $0.026/month
- **Savings:** $2.04/month (and better quality!)

---

## Pattern: Task Decomposition

**Question:** When should you split agents?

**Answer:** When context can be compressed:
- Agent 1 output ✅ (can be 1/10th of input size)
- Agent 2 input ❌ (shouldn't need full original context)

**Example:**
- Full PR = 50K tokens
- Agent 1 summary = 5K tokens (90% compression)
- Agent 2 uses summary + snippets = 35K context (vs 85K full PR)

This is where big savings come from.
