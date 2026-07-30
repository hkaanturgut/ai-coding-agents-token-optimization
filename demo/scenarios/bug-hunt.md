# Bug Hunt Scenario - Live Demo

## Objective
Find a critical bug in a 10MB production log file using **Compress** methodology: code execution beats raw data dumps.

---

## The Bad Way (80K+ tokens) 🚫

```javascript
// DON'T DO THIS:
const fullLog = fs.readFileSync('demo/sample-data/large-log.txt', 'utf8');
const prompt = `Here's a 10MB log file:\n${fullLog}\n\nFind the error and explain.`;
// This wastes ~80K tokens just loading data
```

**Cost:** 80K tokens
**Execution:** Copilot struggles with huge context, response is slow

---

## The Good Way (2K tokens) ✅

### Step 1: Execute Analysis Locally
```bash
# Use grep to find errors (FREE - runs locally)
grep -i "error\|exception\|fatal\|stack trace" demo/sample-data/large-log.txt | head -50 > /tmp/errors.txt

# View the extracted errors
cat /tmp/errors.txt
```

### Step 2: Feed Only Relevant Lines to Copilot
```
Copilot Prompt:
"I found these error lines from production logs. What's the root cause?

<paste /tmp/errors.txt content>
"
```

**Cost:** 2K tokens (95% reduction!)
**Result:** Copilot identifies bug instantly

---

## Demo Script (3 minutes)

### Setup
1. Open terminal
2. Run: `wc -l demo/sample-data/large-log.txt` → Show file size
3. Show file in editor: "This is 10MB of production logs"

### Antipattern
1. Show the JavaScript snippet above
2. **Narrator:** "If we dump this entire file to Copilot, we waste 80K tokens. Let's do better."

### Better Approach
1. Run: `grep -i "error\|exception\|fatal" demo/sample-data/large-log.txt | wc -l`
2. Show grep result: "Found 47 error lines from 500K total lines"
3. Run: `grep -i "error\|exception\|fatal" demo/sample-data/large-log.txt | head -20`
4. Copy output
5. Open Copilot, paste the 20 error lines
6. Ask: "What's happening here?"
7. **Copilot identifies:** Database connection timeout cascading to OOM kill
8. **Narrator:** "Found the bug in 2K tokens. Same accuracy, 40x cheaper."

---

## Key Insight
**Code beats data.** Always prefer:
- `grep` / `awk` / `jq` (local compute, free)
- Over: "Here's the full file, please analyze"

This principle applies to:
- Log files (grep errors)
- JSON responses (jq filter)
- CSVs (awk extract specific columns)
- Database dumps (SQL query, not full dump)

---

## Real-World Savings

| Approach | Token Cost | Execution | Accuracy |
|----------|------------|-----------|----------|
| Raw dump | 80K | Slow | Okay |
| Filtered grep | 2K | Instant | Excellent |
| **Savings** | **97.5%** | **10x faster** | **Better** |

Scale this to 100 bug hunts/month: **$2,880 saved/month**
