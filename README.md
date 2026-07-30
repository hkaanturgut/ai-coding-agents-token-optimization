# Stop Burning Tokens — a GitHub Copilot Runbook

## DevOps Toronto Demo Session

A complete, copy-paste demo you can run **entirely in GitHub Copilot** (VS Code).
No Claude Code required. Two parts:

1. **Part 1 — Native optimization.** The slash commands and config files already
   in Copilot that cut token waste before you install anything.
2. **Part 2 — Two tools.** Add **ponytail** (shrinks the *code* Copilot writes)
   and **caveman** (shrinks the *text* Copilot writes) as instruction files.

**Event:** [DevOps Toronto Meetup - July 30, 2026](https://www.meetup.com/devopsto/events/315582119/)
**Duration:** ~30 minutes · **Agent:** GitHub Copilot in VS Code

---

## The one idea

Three levers, each an independent source of token spend:

| Lever | What it is | Fixed by |
|-------|-----------|----------|
| **Context** | What Copilot re-reads every turn | Part 1: `/clear`, `/compact`, instructions |
| **Output** | What Copilot writes back to you | Part 2: **caveman** |
| **Code** | What Copilot builds into your repo | Part 2: **ponytail** |

Part 1 is free and instant. Part 2 makes the other two levers automatic.

> **Copilot note on the tools:** ponytail and caveman are *instruction files*
> here — no plugin marketplace, no CLI. This repo already ships them in
> [.github/instructions/](.github/instructions/), so Copilot picks them up
> automatically when you open this folder. That's the whole install.

---

## Prerequisites

- VS Code with the **GitHub Copilot** + **Copilot Chat** extensions, signed in.
- This repo open as your workspace folder.
- Enable instruction files (usually on by default): Settings → search
  **"copilot instruction files"** → ensure *Use Instruction Files* is checked,
  or add to `.vscode/settings.json`:
  ```json
  { "github.copilot.chat.codeGeneration.useInstructionFiles": true }
  ```
- Open Copilot Chat in **Agent** mode for the code demos.

---

# Part 1 — Native optimization (no installs)

### Step 1.1 — See the bill

Every turn re-sends the whole conversation. Long threads pay for every past turn.

1. Open Copilot Chat. Hover the **context window indicator** (bottom of the chat
   input) to see how full the context is.
2. Have a few back-and-forth turns, then watch it climb.

> **Say:** "We haven't touched the model. Most of what we're paying for is old
> conversation."

### Step 1.2 — Reclaim context with two commands

| Goal | Command |
|------|---------|
| New, unrelated task — drop all history | `/clear` (starts a fresh chat) |
| Same task, thread got long — keep a summary | `/compact` (or **Summarize conversation**) |

**Do it live:** in a long thread, type `/compact`. Copilot replaces the old
transcript with a summary and keeps going. Then start the next task with `/clear`.

> **Highest-leverage habit in this talk:** `/clear` between unrelated tasks.
> Costs nothing, and nobody does it.

### Step 1.3 — Point at data, don't paste it

The classic waste is pasting a huge log into chat.

```bash
wc -l demo/sample-data/large-log.txt        # ~500,000 lines
```

Pasting that is tens of thousands of tokens. Instead, filter first and paste only
the result:

```bash
grep -iE "error|fatal|exception" demo/sample-data/large-log.txt \
  | sort | uniq -c | sort -rn | head
```

You get a handful of lines pointing at a Postgres connection timeout.

**Prompt to run in Copilot Chat (paste only the grep output):**
> Here are the top error lines from a production log:
> ```
> <paste the ~5 lines from the grep output>
> ```
> What's the most likely root cause, and the smallest fix?

Same answer as pasting the whole file, ~99% fewer tokens. Your local `grep` was
free.

### Step 1.4 — Write standing rules once (custom instructions)

Stop retyping "use the stdlib, no comments, keep it small" every prompt.

- **Repo-wide:** `.github/copilot-instructions.md`. Generate a starter by typing
  `/generateInstructions` in Chat, or copy
  [demo/part1-native/copilot-instructions.example.md](demo/part1-native/copilot-instructions.example.md).
- **Path-scoped / multiple:** `.github/instructions/*.instructions.md` with an
  `applyTo` glob in the front matter. (This is exactly how the two tools ship —
  see Part 2.)

**Prove it:** with the example rules in place, ask a normal question. Copilot
already follows the rules without you repeating them.

### Step 1.5 — Turn repeated prompts into files (prompt files)

For prompts you run often, save them as `.github/prompts/*.prompt.md` and run
them by name.

1. This repo ships
   [demo/part1-native/optimize-logs.prompt.md](demo/part1-native/optimize-logs.prompt.md).
   Copy it into `.github/prompts/`.
2. In Chat, run it: type `/optimize-logs` (or Command Palette → **Chat: Run
   Prompt**). It reruns Step 1.3 as a one-word command.
3. To capture a good ad-hoc prompt into a file, use the `/savePrompt` command.

> **Say:** "Every rule and prompt you write here is a paragraph you never retype —
> and a wrong first draft you never pay to correct."

---

# Part 2 — Two tools, as Copilot instruction files

The tools ship in this repo as
[.github/instructions/ponytail.instructions.md](.github/instructions/ponytail.instructions.md)
and
[.github/instructions/caveman.instructions.md](.github/instructions/caveman.instructions.md).
Both use `applyTo: '**'`, so Copilot loads them on every request. Opening this
folder **is** the install.

> Want them in your *own* repo? Copy those two files into your repo's
> `.github/instructions/`. That's it. (Upstream CLIs exist for other agents; in
> Copilot the instruction file is the supported path.)

---

## Demo 2.1 — ponytail: shrink what Copilot BUILDS

**The over-build trap.** Open
[demo/part2-tools/signup-form.html](demo/part2-tools/signup-form.html).

**Prompt (run it twice to compare):**
> Add a date-of-birth field to the signup form.

- **Without ponytail** (temporarily rename the instructions file, or try it in a
  scratch repo): Copilot typically pulls in a datepicker library, writes a
  wrapper component, and adds styles.
- **With ponytail** (default in this repo): Copilot climbs the YAGNI ladder to
  "native platform feature" and writes:
  ```html
  <input type="date" name="dob" required />
  ```

Same requirement. One line instead of a dependency. **And** it kept `required`
(validation is never on the chopping block).

**Prompt — review a real diff for over-engineering:**
> Review the current changes for over-engineering. Give me a delete-list:
> file:line → what to remove → why. Don't cut validation, security, or
> accessibility.

> **The numbers (upstream benchmark):** ~54% less code on average, up to 94%
> where an agent over-builds, ~20% cheaper, ~27% faster — 100% safe.

## Demo 2.2 — caveman: shrink what Copilot SAYS

**Prompt (conceptual question shows it best):**
> Explain how database connection pooling works.

- **Without caveman:** a paragraph with intro, filler, and a wrap-up.
- **With caveman** (default in this repo): something like
  > "Pool reuses open DB connections. No new connection per request. Skips
  > handshake overhead → faster under load. Size the pool to DB max connections."

Same facts, ~a third of the words. Code blocks, commands, and error strings stay
byte-for-byte exact.

**Toggle for the demo:** to show the "before", say `normal mode`; to bring it
back, say `talk like caveman`.

> **Honest caveat (say it):** caveman shrinks *output* tokens only. In this
> instruction-file form there's no `/caveman-stats` counter (that's a Claude Code
> hook). The win here is readable, fast answers — cost is the bonus.

## Demo 2.3 — they stack

Make one change with both on:
- **ponytail** keeps the *diff* small (code untouched by caveman).
- **caveman** keeps the *explanation* short (prose untouched by ponytail).

> caveman = smaller mouth. ponytail = smaller hands. No overlap — run both.

---

## Repository map

```
README.md                                   # This runbook
.github/instructions/
  ponytail.instructions.md                  # Tool 1 — installed for Copilot
  caveman.instructions.md                   # Tool 2 — installed for Copilot
docs/
  PART-1-NATIVE.md                          # Deeper reference: native commands
  PART-2-CAVEMAN-PONYTAIL.md                # Deeper reference: the tools
  SLASH-COMMAND-CHEATSHEET.md               # Copilot <-> Claude Code map
  ATTENDEE-HANDOUT.md                       # One-page takeaway
demo/
  part1-native/                             # Example instructions + prompt file
  part2-tools/signup-form.html              # ponytail over-build trap
  sample-data/                              # Log used in Step 1.3
```

---

## Do this week (attendee takeaway)

1. **Mon:** `/clear` between every unrelated Copilot task.
2. **Tue:** Add a `.github/copilot-instructions.md` with your top 5 rules.
3. **Wed:** Turn one repeated paste into a `.github/prompts/*.prompt.md`.
4. **Thu:** Copy `ponytail.instructions.md` into a real repo; run the date-picker
   prompt.
5. **Fri:** Copy `caveman.instructions.md` in; feel the shorter answers.

Sources (MIT, no telemetry): [ponytail](https://github.com/DietrichGebert/ponytail)
· [caveman](https://github.com/JuliusBrussee/caveman).
