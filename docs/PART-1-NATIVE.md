# Part 1 — Native Token Optimization

> No installs. Everything here ships inside GitHub Copilot and Claude Code today.

The single biggest source of token waste is **context you forgot you were
carrying** — a long conversation, stale file dumps, and rules you retype every
prompt. Both agents give you native tools to fix all three.

---

## 1. Context is the bill

Every turn re-sends the whole conversation. A 40-turn thread pays for all 40
turns on turn 41. Before optimizing the model, look at what you're re-sending.

| Goal | Claude Code | GitHub Copilot |
|------|-------------|----------------|
| See current context usage | `/context` | Context-window indicator in the Chat view |
| See spend this session | `/cost` | Usage view / request counter |

**Narration:** "We haven't changed the model. We've just looked at the receipt.
Most of it is old conversation."

---

## 2. The two commands that reclaim context

These are the workhorses. Same intent, one command each.

| Goal | Claude Code | GitHub Copilot |
|------|-------------|----------------|
| Start fresh, drop all history | `/clear` | `/clear` (starts a new chat thread) |
| Keep the thread but compress old turns | `/compact [instructions]` | `/compact` (or **Summarize conversation**) |

**Rule of thumb:**
- New task, unrelated to the last one → `/clear`. Cheapest possible context.
- Same task, thread got long → `/compact`. Copilot/Claude replace the old
  transcript with a summary and keep going.

**Narration:** "`/clear` between tasks is the highest-leverage habit in this
talk. It costs nothing and it's the thing nobody does."

See [SLASH-COMMAND-CHEATSHEET.md](SLASH-COMMAND-CHEATSHEET.md) for the full
side-by-side table.

---

## 3. Custom instructions — write the rules once

Stop retyping "use tabs, no comments, prefer the stdlib" every prompt. Put
standing rules in a file the agent reads automatically every turn.

### GitHub Copilot
- **Repo-wide:** `.github/copilot-instructions.md` — applies to every request in
  the repo. Generate a starter with the `/generateInstructions` command.
- **Path-scoped:** `*.instructions.md` files with an `applyTo` glob in front
  matter, e.g. only apply to `**/*.py`.

```markdown
---
applyTo: "**/*.ts"
---
- Prefer `type` over `interface`.
- No default exports.
- Never add comments unless asked.
```

### Claude Code
- **Project:** `CLAUDE.md` at the repo root.
- **Personal:** `~/.claude/CLAUDE.md` for every project.
- Add a memory mid-session by starting a line with `#`; edit with `/memory`.

**Why it saves tokens:** the rules load once from a compact file instead of being
re-explained (verbosely, inconsistently) in every prompt. It also cuts *rework*
tokens — fewer wrong first drafts to correct.

Example files in [demo/part1-native/](../demo/part1-native/).

---

## 4. Custom prompt files — reusable, parameterized prompts

For prompts you run repeatedly (review a diff, write a migration, triage a log),
save them as files instead of pasting from a notes doc.

### GitHub Copilot — `.github/prompts/*.prompt.md`
Invoke by name in Chat (`/optimize-logs`). Save one straight from a good
conversation with the `/savePrompt` command.

```markdown
---
mode: agent
description: Triage an error log without dumping the whole file
---
Run `grep -iE "error|fatal|exception" ${input:logfile}` and summarize the top 5
root causes. Do not read the full file into context.
```

### Claude Code — `.claude/commands/*.md`
Each file becomes a `/command`. Supports `$ARGUMENTS` for parameters.

```markdown
Review the staged diff for over-engineering and security issues.
Focus on: $ARGUMENTS
Return a bullet list of file:line -> problem -> fix. Nothing else.
```

**Why it saves tokens:** a tight, tested prompt beats an ad-hoc paragraph. It
scopes the task so the agent reads less and rewrites less.

---

## 5. Practices that beat any tool

1. **`/clear` between unrelated tasks.** The cheapest optimization there is.
2. **Don't paste big files — point at them.** Let the agent open the specific
   lines it needs, or pre-filter with `grep`/`jq` and paste only the result.
   (See [demo/part1-native/README.md](../demo/part1-native/README.md).)
3. **Scope the ask.** "Fix the null check in `auth.ts` line 42" reads and writes
   far fewer tokens than "review my auth code."
4. **Keep instructions terse.** Custom-instruction files are re-read every turn;
   bloat there is a tax on every prompt.

---

Next: [Part 2 — caveman + ponytail](PART-2-CAVEMAN-PONYTAIL.md) automates levers
3 and 4 (output + code) and makes the savings measurable.
