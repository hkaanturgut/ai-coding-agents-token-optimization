# Demo — Part 1: Native optimization in GitHub Copilot (hands-on)

Three quick live demos. No installs. Run terminal commands from the **repo root**.

---

## Demo 1.1 — Context is the bill

In Copilot Chat, hover the **context-window indicator** (below the chat input)
and show usage climbing as the thread grows.

**Then reclaim it:**
```
/clear      # unrelated next task — cheapest possible context
/compact    # same task, long thread — keep a summary, drop the transcript
```

**Line:** "We didn't touch the model. We stopped paying for turns we don't need."

---

## Demo 1.2 — Point at data, don't paste it

The classic waste: pasting a 500K-line log into chat.

```bash
wc -l demo/sample-data/large-log.txt          # ~500,000 lines
```

Instead, pre-filter and hand Copilot only what matters:

```bash
grep -iE "error|fatal|exception" demo/sample-data/large-log.txt | sort | uniq -c | sort -rn | head
```

You get a handful of lines showing the real story (a Postgres connection
timeout). Paste **that** into Chat:

> Here are the top error lines from a production log:
> ```
> <paste the grep output>
> ```
> Most likely root cause and the smallest fix?

Same answer, ~99% fewer tokens, and your local `grep` was free.

**Line:** "The cheapest token is the one you filtered out before it reached the
model."

---

## Demo 1.3 — Rules once, prompts reusable

1. Copy [copilot-instructions.example.md](copilot-instructions.example.md) into a
   repo as `.github/copilot-instructions.md`. Ask a question — Copilot already
   follows the rules without you repeating them.

2. Copy [optimize-logs.prompt.md](optimize-logs.prompt.md) into
   `.github/prompts/`. Now `/optimize-logs` in Chat reruns Demo 1.2 as a
   one-word command. (Capture your own good prompts with `/savePrompt`.)

**Line:** "Every rule you write here is a paragraph you never retype — and a
wrong first draft you never pay to correct."

---

Next: [../part2-tools/README.md](../part2-tools/README.md).
