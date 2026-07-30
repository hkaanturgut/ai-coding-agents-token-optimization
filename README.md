# Stop Burning Tokens — an AI Coding Agent Runbook

## DevOps Toronto Demo Session

> **Note:** This session is **agent-agnostic** — the ideas apply to any AI coding
> agent (Claude Code, Cursor, Windsurf, Codex, Gemini CLI, …). The presenter
> demos in **GitHub Copilot** (VS Code), so live commands are shown Copilot-first
> with each agent's equivalent noted alongside. Nothing here is Copilot-only.

A single, copy-paste demo that tells one story in three acts, each attacking a
different source of wasted tokens:

1. **Native first** — the slash commands and config files your agent already
   ships.
2. **Spec Kit** — build the *right* thing once instead of re-prompting your way
   there (the biggest hidden token cost is rework).
3. **Two tools** — **ponytail** shrinks the *code* the agent writes, **caveman**
   shrinks the *text* it writes.

**Event:** [DevOps Toronto Meetup - July 30, 2026](https://www.meetup.com/devopsto/events/315582119/)
**Duration:** ~30 minutes · **Demoed on:** GitHub Copilot (VS Code) · **Applies to:** any agent

---

## The story in one picture

Four ways tokens leak, and what plugs each:

| Leak | What it is | Act |
|------|-----------|-----|
| **Context** | Stale conversation re-sent every turn | Act 1 — `/clear`, `/compact` |
| **Rework** | Building the wrong thing, then redoing it | Act 2 — Spec Kit |
| **Code** | The agent over-building what you asked for | Act 3 — ponytail |
| **Output** | Verbose replies on every turn | Act 3 — caveman |

Native gets you far for free. Spec Kit kills the expensive rework loop. The two
tools make the last two leaks automatic.

---

## Prerequisites

- Any AI coding agent. The presenter uses **GitHub Copilot** + **Copilot Chat**
  in VS Code, signed in, with this repo open as the workspace folder.
- Copilot only: instruction files enabled (usually on by default) — Settings →
  search **"copilot instruction files"** → *Use Instruction Files*, or in
  `.vscode/settings.json`:
  ```json
  { "github.copilot.chat.codeGeneration.useInstructionFiles": true }
  ```
- For Act 2: [uv](https://docs.astral.sh/uv/), Python 3.11+, and Git.
- Run the code demos in your agent's **agent/edit** mode.

---

# Act 1 — Native optimization (no installs)

The biggest waste is context you forgot you were carrying. Fix it with what your
agent already ships. (Commands shown for Copilot; Claude Code uses the same
`/clear` and `/compact`, plus `/context` and `/cost`.)

### 1.1 — See the bill

Every turn re-sends the whole conversation. A long thread pays for every past
turn. In Copilot Chat, hover the **context-window indicator** below the input and
watch it climb as the thread grows. (Claude Code: run `/context`.)

> **Say:** "We haven't touched the model. Most of what we're paying for is old
> conversation."

### 1.2 — Reclaim it with two commands

| Goal | Command |
|------|---------|
| New, unrelated task — drop all history | `/clear` (fresh chat) |
| Same task, long thread — keep a summary | `/compact` (or **Summarize conversation**) |

**Do it live:** type `/compact` in a long thread — the agent swaps the transcript
for a summary and keeps going. Start the next task with `/clear`.

> **Highest-leverage habit in this talk:** `/clear` between unrelated tasks.
> Costs nothing, and nobody does it.

### 1.3 — Point at data, don't paste it

The classic waste is pasting a huge log into chat.

```bash
wc -l demo/sample-data/large-log.txt        # ~500,000 lines
```

Filter first, paste only the result:

```bash
grep -iE "error|fatal|exception" demo/sample-data/large-log.txt \
  | sort | uniq -c | sort -rn | head
```

You get a handful of lines pointing at a Postgres connection timeout.

**Prompt (paste only the grep output):**
> Here are the top error lines from a production log:
> ```
> <paste the ~5 lines>
> ```
> Most likely root cause and the smallest fix?

Same answer, ~99% fewer tokens. Your local `grep` was free.

### 1.4 — Write standing rules once (custom instructions)

Stop retyping "use the stdlib, no comments, keep it small" every prompt. Put
standing rules in a file the agent reads automatically every turn.

- **Copilot, repo-wide:** `.github/copilot-instructions.md`. Generate a starter
  with `/generateInstructions`, or copy
  [demo/part1-native/copilot-instructions.example.md](demo/part1-native/copilot-instructions.example.md).
- **Copilot, path-scoped / multiple:** `.github/instructions/*.instructions.md`
  with an `applyTo` glob in the front matter. (This is exactly how the two tools
  in Act 3 ship.)
- **Other agents:** Claude Code → `CLAUDE.md`; Cursor → `.cursor/rules/`;
  Windsurf → `.windsurf/rules/`; most others → `AGENTS.md`.

**Prove it:** with the example rules in place, ask a normal question — the agent
already follows the rules without you repeating them.

### 1.5 — Turn repeated prompts into files (prompt files)

For prompts you run often, save them as files and run them by name instead of
pasting from a notes doc.

1. Copilot: copy
   [demo/part1-native/optimize-logs.prompt.md](demo/part1-native/optimize-logs.prompt.md)
   into `.github/prompts/`. (Claude Code: `.claude/commands/*.md`.)
2. In Chat, run `/optimize-logs` (or Command Palette → **Chat: Run Prompt**). It
   reruns 1.3 as a one-word command.
3. Capture a good ad-hoc prompt into a file with `/savePrompt`.

> **Say:** "Every rule and prompt you write here is a paragraph you never
> retype — and a wrong first draft you never pay to correct."

---

# Act 2 — GitHub Spec Kit (build the right thing once)

Act 1 trims context. The bigger money leak is **rework**: you prompt, the agent
builds the wrong thing, you re-prompt, it rebuilds — burning tokens each lap.

### 2.0 — First, the practice: Spec-Driven Development (SDD)

**Vibe-coding** is prompt → code → notice it's wrong → re-prompt. Every lap
re-reads the context and re-generates code you throw away. On a fuzzy task the
agent guesses the missing details, and it guesses differently each turn.

**Spec-Driven Development** flips the order. You make the *specification* the
source of truth and settle the decisions **before** any code is generated:

```
Constitution  →  Specify   →  Clarify   →  Plan     →  Tasks    →  Implement
(principles)     (what/why)   (fill gaps)  (how/stack) (steps)     (build once)
```

- The **spec** is a cheap artifact (a few KB of text). Fixing a misunderstanding
  there costs almost nothing.
- The **code** is the expensive artifact. Discovering the same misunderstanding
  after tens of thousands of generated tokens costs a full rebuild.
- Settling principles, scope, and stack up front means the agent generates the
  right thing on the **first** pass — the single biggest token saver of the day.

> **Say:** "Vibe-coding pays for the wrong build *and* the right build. SDD pays
> for the spec, then one build."

### 2.1 — Why Spec Kit (not just 'write a spec')

You could hand-write specs, but you'd redo the same scaffolding every project and
your agent wouldn't know the workflow. [Spec Kit](https://github.com/github/spec-kit)
is GitHub's open-source toolkit that makes SDD **repeatable**:

- Installs a **`specify` CLI** and drops ready-made **slash commands** into your
  repo (`/speckit.constitution`, `/speckit.specify`, `/speckit.plan`, …).
- Ships **templates** for each artifact so specs, plans, and tasks come out
  consistent and reviewable.
- Adds quality gates — `/speckit.clarify` (surface unknowns before planning) and
  `/speckit.analyze` (cross-check spec ↔ plan ↔ tasks) — so gaps are caught in
  cheap text, not expensive code.
- Works with **30+ agents** (Copilot, Claude Code, Cursor, Gemini CLI, …), so the
  same workflow travels with you.

### 2.2 — Install the Specify CLI

```bash
# Needs uv, Python 3.11+, Git
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# (also on PyPI)
uv tool install specify-cli
```

### 2.3 — Initialize for your agent

```bash
# Presenter uses Copilot:
specify init token-demo --integration copilot
cd token-demo

# Any other agent — same command, swap the integration:
#   --integration claude   (Claude Code)
#   --integration cursor   (Cursor)
#   --integration gemini   (Gemini CLI)
# Run `specify integration list` to see all supported agents.
```

This drops Spec Kit's `/speckit.*` prompt files into the repo so your agent's
chat can run them.

### 2.4 — Run the spec-driven workflow (all in your agent's chat)

| Step | Command | What it does |
|------|---------|--------------|
| 1. Principles | `/speckit.constitution` | Set project-wide rules (languages, quality, testing, security, UX, performance) |
| 2. What & why | `/speckit.specify` | Describe the feature — no tech stack yet |
| 3. Clarify | `/speckit.clarify` | Answer the gaps *before* planning (recommended) |
| 4. How | `/speckit.plan` | Give the tech stack + architecture |
| 5. Break down | `/speckit.tasks` | Generate an actionable task list |
| 6. Sanity check | `/speckit.analyze` | Cross-check spec ↔ plan ↔ tasks (optional) |
| 7. Build | `/speckit.implement` | Execute the tasks in one pass |

**Step 1 — a real constitution prompt** (this is where you pin languages,
versions, and non-negotiables so every later step inherits them):
```
/speckit.constitution Establish principles for this project.
Languages & stack: TypeScript (strict) on Node 20; Python 3.11 for tooling.
Style: prefer the standard library and native platform features before adding a
  dependency; small, focused functions; no dead abstractions.
Testing: every feature ships one runnable test; no framework churn.
Security: validate all input at trust boundaries; never log secrets.
Accessibility: semantic HTML, keyboard-navigable, labelled inputs.
Delivery: smallest working diff; conventional-commit messages.
```

**Step 2 — specify (what & why, no stack):**
```
/speckit.specify Build a page where users organize photos into date-grouped
albums, reordered by drag-and-drop. Albums are never nested. Within an album,
photos show as a tile grid. Metadata only — no image uploads.
```

**Step 3 — clarify (let it interview you):**
```
/speckit.clarify
```

**Step 4 — plan (now the stack):**
```
/speckit.plan Vanilla HTML/CSS/JS built with Vite, minimal libraries. Album and
photo metadata in a local SQLite database. No backend service.
```

**Steps 5–7:**
```
/speckit.tasks
/speckit.analyze
/speckit.implement
```

> **Say:** "The spec is the cheap artifact. Agreeing in a 2K-token spec beats
> discovering the misunderstanding after 60K tokens of generated code."

> **Note:** Spec Kit slash commands are `/speckit.*` in current releases. Run
> `specify integration list` to confirm your version's exact command names.

---

# Act 3 — Two tools that ship as instruction files

The finale: two tiny tools that ship in this repo as instruction files —
[.github/instructions/ponytail.instructions.md](.github/instructions/ponytail.instructions.md)
and
[.github/instructions/caveman.instructions.md](.github/instructions/caveman.instructions.md).
Both use `applyTo: '**'`, so Copilot loads them on every request. **Opening this
folder is the install.** To use them in your own repo, copy the two files into
its `.github/instructions/`.

> **Other agents:** both tools also install natively — ponytail as a Claude
> Code / Codex plugin (`/plugin install ponytail@ponytail`), caveman via its
> one-line installer (`curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash`),
> which auto-detects Cursor, Gemini, and 30+ others. See
> [docs/PART-2-CAVEMAN-PONYTAIL.md](docs/PART-2-CAVEMAN-PONYTAIL.md).

## 3.1 — ponytail: shrink what Copilot BUILDS

**The over-build trap.** Open
[demo/part2-tools/signup-form.html](demo/part2-tools/signup-form.html).

**Prompt (run twice to compare):**
> Add a date-of-birth field to the signup form.

- **Without ponytail** (rename the instructions file, or use a scratch repo):
  Copilot pulls in a datepicker library, a wrapper component, and styles.
- **With ponytail** (default here): it climbs the YAGNI ladder to the native
  platform feature and writes one line:
  ```html
  <input type="date" name="dob" required />
  ```

One line instead of a dependency — and it kept `required` (validation is never
cut).

**Prompt — audit a diff:**
> Review the current changes for over-engineering. Delete-list only:
> file:line → remove → why. Keep validation, security, accessibility.

> **Numbers (upstream benchmark):** ~54% less code on average, up to 94% where an
> agent over-builds, ~20% cheaper, ~27% faster — 100% safe.

## 3.2 — caveman: shrink what Copilot SAYS

**Prompt:**
> Explain how database connection pooling works.

- **Without caveman:** a paragraph with intro, filler, and a wrap-up.
- **With caveman** (default here): terse, e.g.
  > "Pool reuses open DB connections. No new connection per request. Skips
  > handshake overhead → faster under load. Size pool to DB max connections."

Same facts, ~a third of the words. Code, commands, and error strings stay
byte-for-byte exact.

**Toggle for the demo:** say `normal mode` to show the "before", `talk like
caveman` to bring it back.

> **Honest caveat (say it):** as an instruction file, caveman shrinks *output*
> tokens only. `/caveman-stats` and the statusline counter are Claude Code hook
> features — not available in Copilot. The win here is readable, fast answers.

## 3.3 — they stack

Ask Copilot to implement one small feature *and* explain it:
- **ponytail** keeps the code minimal.
- **caveman** keeps the explanation short.

> caveman = smaller mouth. ponytail = smaller hands. No overlap — run both.

---

## Repository map

```
README.md                                   # This runbook (the whole story)
.github/instructions/
  ponytail.instructions.md                  # Act 3 tool — installed for Copilot
  caveman.instructions.md                   # Act 3 tool — installed for Copilot
docs/
  PART-1-NATIVE.md                          # Deeper reference: native commands
  PART-2-CAVEMAN-PONYTAIL.md                # Deeper reference: the tools
  SLASH-COMMAND-CHEATSHEET.md               # Copilot <-> Claude Code map
  ATTENDEE-HANDOUT.md                       # One-page takeaway
demo/
  part1-native/                             # Example instructions + prompt file
  part2-tools/signup-form.html              # ponytail over-build trap
  sample-data/                              # Log used in Act 1.3
```

Sources (all MIT, no telemetry):
[Spec Kit](https://github.com/github/spec-kit) ·
[ponytail](https://github.com/DietrichGebert/ponytail) ·
[caveman](https://github.com/JuliusBrussee/caveman).
