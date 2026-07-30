# Demo — Part 1: Native optimization (hands-on)

Three quick live demos. No installs. Uses `sample-data/` from the repo root.

---

## Demo 1.1 — Context is the bill

**In Claude Code:**
```
/context
```
Show the breakdown. Point out how much is old conversation vs. the actual task.

**In Copilot Chat:** open the context-window indicator and show usage climbing
as the thread grows.

**Then reclaim it:**
```
/clear          # unrelated next task — cheapest possible context
# or
/compact        # same task, long thread — keep a summary, drop the transcript
```

**Line:** "We didn't touch the model. We stopped paying for turns we don't need."

---

## Demo 1.2 — Point at data, don't paste it

The classic waste: pasting a 500K-line log into chat.

```bash
wc -l sample-data/large-log.txt          # ~500,000 lines
```

Pasting that is tens of thousands of tokens. Instead, pre-filter and hand the
agent only what matters:

```bash
grep -iE "error|fatal|exception" sample-data/large-log.txt | sort | uniq -c | sort -rn | head
```

You get a handful of lines showing the real story (a Postgres connection
timeout). Paste *that* and ask for root cause. Same answer, ~99% fewer tokens,
and your local `grep` was free.

**Line:** "The cheapest token is the one you filtered out before it ever reached
the model."

---

## Demo 1.3 — Rules once, prompts reusable

1. Drop [copilot-instructions.example.md](copilot-instructions.example.md) into a
   real repo as `.github/copilot-instructions.md` (or its contents into
   `CLAUDE.md`). Ask a question — the agent already follows the rules without you
   repeating them.

2. Drop [optimize-logs.prompt.md](optimize-logs.prompt.md) into
   `.github/prompts/`. Now `/optimize-logs` reruns Demo 1.2 as a one-word command.

**Line:** "Every rule you write here is a paragraph you never retype — and a
wrong first draft you never pay to correct."

---

Next: [../part2-tools/README.md](../part2-tools/README.md).
