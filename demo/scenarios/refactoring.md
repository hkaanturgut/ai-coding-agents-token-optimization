# Refactoring Scenario - Live Demo

## Objective
Refactor a database schema using **Isolate** methodology: four specialized agents with tight context budgets.

---

## The Bad Way: Single Bloated Agent

```
One Agent (EXPENSIVE + SLOW):
├─ Turn 1: Analyze current schema          (30K tokens)
├─ Turn 2: Design new schema               (35K tokens)
├─ Turn 3: Generate migration script       (40K tokens)
├─ Turn 4: Generate tests                  (38K tokens)
├─ Turn 5: Deploy verification logic       (32K tokens)
├─ Turn 6: Write documentation             (28K tokens)
└─ Turn 7: Review & optimize               (35K tokens)
   TOTAL: 238K tokens | 4+ min execution
```

**Cost:** 238K tokens = $0.0071
**Speed:** Slow (carries full context every turn)
**Quality:** Risky (no specialization, high error rate)

---

## The Good Way: Four-Agent Pipeline

### Architecture
```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐     ┌──────────┐
│  Analyzer   │────▶│  Designer   │────▶│  Implementer │────▶│  Tester  │
│  (Current)  │     │  (Future)   │     │  (Migration) │     │  (Verify)│
│  30K context│     │  40K context│     │  60K context │     │  20K ctx │
│  2 turns    │     │  2 turns    │     │  2 turns     │     │  1 turn  │
│  15K $      │     │  20K $      │     │  45K $       │     │  8K $    │
└─────────────┘     └─────────────┘     └──────────────┘     └──────────┘
        │                    │                    │                    │
        └─ Summary          └─ Plan             └─ Code              └─ Report
           (2K tokens)         (3K tokens)        (5K tokens)          (Final)
```

---

## Agent Details

### Agent 1: Schema Analyzer
**Role:** Understand current state  
**Context:** 30K tokens  
**Turns:** 2

```sql
-- Input
CREATE TABLE users (
  id INT,
  email VARCHAR(255),
  created_at TIMESTAMP
);

CREATE TABLE posts (
  id INT,
  user_id INT,
  body TEXT,
  created_at TIMESTAMP
);

-- Prompt to Analyzer:
"Analyze this schema for performance issues:
1. What's inefficient?
2. What's missing?
3. Priority ranking (critical→nice-to-have)

<schema>
"

-- Expected Output (2KB):
## CRITICAL
- No indexes on foreign keys
- No UUID for distributed systems
- Missing updated_at for auditing

## MODERATE
- VARCHAR(255) too long for email
- No soft deletes

## NICE-TO-HAVE
- No table partitioning strategy
- No default values
```

**Tokens:** 15K total (2 turns)
**Output:** 2KB summary

---

### Agent 2: Schema Designer
**Role:** Design new schema  
**Context:** 40K tokens (original schema + analyzer summary only!)  
**Turns:** 2

```
-- Prompt to Designer:
"Given these issues from a schema analysis:
<paste analyzer output (2KB, not full analysis trace)>

Design a new schema that fixes these issues.
Constraints:
- Must support 100M+ rows
- Zero-downtime migration required
- Backward compatibility needed

Output:
1. New DDL
2. Migration strategy (old→new table names)
3. Backward compat layer
"

-- Expected Output (5KB):
ALTER TABLE users ADD COLUMN id_v2 UUID UNIQUE;
CREATE INDEX idx_users_email ON users(email);
...
[Migration plan with staged approach]
```

**Tokens:** 20K total (2 turns)
**Output:** 5KB design doc

---

### Agent 3: Migration Implementer
**Role:** Generate production migration scripts  
**Context:** 60K tokens (original schema + designer plan)  
**Turns:** 2

```
-- Prompt to Implementer:
"Generate a zero-downtime migration based on this plan:
<paste designer output (5KB)>

Original schema:
<paste original schema only, not full analysis>

Requirements:
- Must support ongoing writes
- Rollback capability
- Transaction-safe

Output:
1. Pre-migration validation
2. Step-by-step SQL script
3. Rollback procedure
4. Testing checklist
"

-- Expected Output (10KB):
BEGIN;
-- Phase 1: Add new columns (no downtime)
ALTER TABLE users ADD COLUMN id_v2 UUID;
-- Phase 2: Migrate data
UPDATE users SET id_v2 = gen_random_uuid();
-- Phase 3: Add constraints
ALTER TABLE users ADD PRIMARY KEY (id_v2);
...
[Full migration script with rollback]
```

**Tokens:** 45K total (2 turns)
**Output:** 10KB migration script

---

### Agent 4: Migration Tester
**Role:** Verify migration & edge cases  
**Context:** 20K tokens (migration script + original schema)  
**Turns:** 1

```
-- Prompt to Tester:
"Review this migration script for risks:
<paste migration script (10KB)>

Check for:
1. Data loss risks
2. Performance issues (locking, indexes)
3. Concurrent write conflicts
4. Rollback capability
5. Monitoring needs

Output: Risk report + testing checklist
"

-- Expected Output (3KB):
## RISKS IDENTIFIED
- Risk: Lock held for 2 seconds during Phase 2
  Fix: Use pg_partman for parallel updates
- Risk: No validation of data migration
  Fix: Add row count check before cutover

## TESTING CHECKLIST
- [ ] Test on staging (100M rows)
- [ ] Run migration with concurrent writes
- [ ] Verify data integrity post-migration
- [ ] Rollback test
```

**Tokens:** 8K total (1 turn)
**Output:** 3KB risk report

---

## Demo Timeline (3 minutes)

### Setup
```bash
# Show the target schema
cat demo/sample-data/database-schema.sql
# Narrator: "500-line production schema. One agent would take 4+ min and 238K tokens."
```

### Single Agent (Expensive)
1. Show single-agent timeline above
2. **Narrator:** "238K tokens × 20 refactors/year = $8.36/year on ONE task type"

### Multi-Agent Pipeline (Efficient)
```bash
# Run calculator
python3 tools/agent-budget-calculator.js --scenario refactoring --budget 150K

# Expected output:
# Single agent: 238K tokens
# Multi-agent: 88K tokens
# Savings: 63%
```

### Live Demo Walkthrough
1. Open demo/sample-data/database-schema.sql
2. **"Agent 1: Analyze this schema"** → Open Copilot
   - Feed current schema
   - Show output: 3 CRITICAL issues identified
3. **"Agent 2: Design new schema"** → Open new Copilot tab
   - Feed analyzer summary (NOT full analysis)
   - Show output: New DDL with migration strategy
4. **"Agent 3: Generate migration"** → Open new Copilot tab
   - Feed designer plan + original schema
   - Show output: Zero-downtime SQL script
5. **"Agent 4: Test & validate"** → Open new Copilot tab
   - Feed migration script
   - Show output: Risk report + test checklist
6. **Narrator:** "Same result as single agent, 63% fewer tokens, better expertise"

---

## Token Breakdown

```
SINGLE AGENT:
Turn 1-7: 7 turns × ~34K = 238K tokens

MULTI-AGENT:
Analyzer:    2 turns × 7.5K = 15K
Designer:    2 turns × 10K  = 20K
Implementer: 2 turns × 22.5K = 45K
Tester:      1 turn × 8K     = 8K
────────────────────────────
Total:                        88K tokens

Savings: 63% (150K tokens)
```

---

## Real-World Impact

**Scenario:** Your team refactors 2 schemas/month

| Approach | Tokens | Cost | Time |
|----------|--------|------|------|
| Single Agent | 476K | $0.014 | 8 min |
| Multi-Agent | 176K | $0.005 | 5 min |
| **Savings** | **300K (63%)** | **$0.009** | **3 min faster** |

**Over a year (24 refactors):**
- Single: $0.34 in tokens + 192 min of work
- Multi: $0.12 in tokens + 120 min of work
- **Savings:** $0.22 in tokens + 72 min of time

Plus: Better quality (3 reviews vs 1), lower risk (specialization), faster iterations (parallel-ready).

---

## When to Use This Pattern

✅ **USE multi-agent for:**
- Large schema refactoring (100+ tables)
- Complex migrations requiring validation
- High-stakes changes (payment systems, auth)
- When quality review is essential

❌ **DON'T USE for:**
- Simple column additions (single agent is fine)
- Low-stakes exploratory work
- When total tokens < 50K (single agent cheaper)

**Rule of thumb:** If task requires 3+ distinct skills (analysis, design, implementation, testing), split agents.
