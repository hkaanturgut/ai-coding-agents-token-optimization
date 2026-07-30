# Part 2 — caveman + ponytail

> Two tiny, MIT-licensed tools. One shrinks what the agent **says**, the other
> shrinks what the agent **builds**. They do not overlap, so run both.

| Tool | Shrinks | Typical win | Touches your code? |
|------|---------|-------------|--------------------|
| **caveman** | Output tokens (the reply text) | ~65% fewer output tokens | No — code/commands/errors stay byte-for-byte |
| **ponytail** | Lines of code the agent writes | ~54% less code | Yes — writes less, never unsafe |

Think of it as: **caveman = smaller mouth, ponytail = smaller hands.**

---

## caveman — "why use many token when few do trick"

Makes the agent drop filler and answer in tight, telegraphic prose while keeping
every code block, command, and error string exact.

### Install — GitHub Copilot (VS Code)
In Copilot, caveman is an **instruction file**, not a plugin. This repo already
ships it at
[.github/instructions/caveman.instructions.md](../.github/instructions/caveman.instructions.md);
Copilot loads it automatically. To add it to your own repo:

```bash
# Writes .github/copilot-instructions.md from the caveman rule body
npx -y github:JuliusBrussee/caveman -- --only copilot --with-init

# ...or copy the rule body straight in yourself:
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/src/rules/caveman-activate.md \
  > .github/instructions/caveman.instructions.md   # add `applyTo: '**'` front matter
```

Turn it off for a session by saying "normal mode"; back on with "talk like
caveman".

> **Other agents:** the one-line installer
> (`curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash`)
> auto-detects Claude Code, Codex, Gemini, Cursor, and 30+ others. On Claude
> Code/Codex/Gemini caveman is on from message one and adds the hook-based
> commands below.

### Levels
Switch anytime with `/caveman <level>`; the level sticks for the session.

| Level | Example answer to "why re-render?" |
|-------|-----------------------------------|
| normal | "You should wrap the object in useMemo, since a new reference is created on every render." |
| lite | "Wrap object in useMemo. New ref created every render." |
| **full** (default) | "New ref each render. Wrap object in useMemo." |
| ultra | "New ref/render. useMemo it." |
| wenyan | classical-Chinese mode, shortest of all |

It keeps *your* language — write in Portuguese, it grunts in Portuguese. Only
`wenyan` translates, on purpose (most meaning per token).

### Commands (hook-capable agents — Claude Code / Codex / Gemini)
| Command | What it does |
|---------|--------------|
| `/caveman [lite\|full\|ultra\|wenyan]` | Compress every reply; level sticks |
| `/caveman-commit` | Conventional Commit messages, ≤50-char subject, why over what |
| `/caveman-review` | One-line PR comments: `L42: bug: user null. Add guard.` |
| `/caveman-stats [--share]` | Real session token usage + lifetime savings in USD |
| `/caveman-compress <file>` | Rewrite a memory file (e.g. `CLAUDE.md`) into caveman-speak; cuts ~46% input tokens every future session |

> **In GitHub Copilot** these slash commands and the `[CAVEMAN] ⛏` statusline are
> **not** available — they rely on Claude Code hooks. Copilot gets the core
> compression via the instruction file; toggle with "normal mode" / "talk like
> caveman".

### The honest caveat (say this out loud in the demo)
caveman only shrinks **output** tokens and adds ~1–1.5K **input** tokens per
turn for the skill itself. So whole-session savings are smaller than the 65%
headline, and on already-terse work it can go net-negative. The durable wins are
readability and speed; cost is the bonus. Full method:
[caveman/docs/HONEST-NUMBERS.md](https://github.com/JuliusBrussee/caveman/blob/main/docs/HONEST-NUMBERS.md).

### Ecosystem (mention, don't demo)
- **caveman-shrink** — MCP middleware that wraps any MCP server and compresses
  its *tool descriptions* (this attacks input-token bloat, unlike the core skill).
- **cavecrew-\*** — caveman subagents (investigator, builder, reviewer) whose
  compressed output keeps the main context small on long sessions.

---

## ponytail — the laziest senior dev, inside your agent

You ask for a date picker. A normal agent installs a library, writes a wrapper
component, and starts a discussion about timezones. ponytail writes:

```html
<!-- ponytail: browser has one -->
<input type="date">
```

It makes the agent stop at the first rung of a YAGNI ladder that actually holds,
**after** it has read the code and understood the problem:

```
1. Does this need to exist?   -> no: skip it (YAGNI)
2. Already in this codebase?  -> reuse it, don't rewrite
3. Stdlib does it?            -> use it
4. Native platform feature?   -> use it
5. Installed dependency?      -> use it
6. One line?                  -> one line
7. Only then: the minimum that works
```

**Lazy, not negligent.** Trust-boundary validation, data-loss handling,
security, and accessibility are never on the chopping block. In the benchmark it
was the only arm that cut every metric *and* stayed 100% safe.

### Install — GitHub Copilot (VS Code)
In Copilot, ponytail is an **instruction file** (its slash commands need a
plugin-capable host; the always-on ruleset does not). This repo already ships it
at
[.github/instructions/ponytail.instructions.md](../.github/instructions/ponytail.instructions.md);
Copilot loads it automatically. To add it to your own repo, copy that file into
`.github/instructions/`, or pull the upstream rule body:

```bash
curl -fsSL https://raw.githubusercontent.com/DietrichGebert/ponytail/main/.github/copilot-instructions.md \
  > .github/instructions/ponytail.instructions.md   # add `applyTo: '**'` front matter
```

> **Other agents:** Claude Code / Codex get the full plugin with slash commands:
> ```
> /plugin marketplace add DietrichGebert/ponytail
> /plugin install ponytail@ponytail
> ```
> Also ships for Cursor, Windsurf, Cline, Gemini CLI, and 20+ others — see the
> [ponytail install matrix](https://github.com/DietrichGebert/ponytail#install).

### Levels & commands (plugin-capable hosts — Claude Code / Codex)
> In GitHub Copilot the ruleset is always-on via the instruction file; the slash
> commands below are not available there.

| Command | What it does |
|---------|--------------|
| `/ponytail [lite\|full\|ultra\|off]` | Set intensity; no arg reports current level |
| `/ponytail-review` | Review the current diff for over-engineering, hands back a delete-list |
| `/ponytail-audit` | Audit the whole repo, not just the diff |
| `/ponytail-debt` | Collect the `<!-- ponytail: ... -->` shortcuts you deferred into a ledger |
| `/ponytail-gain` | Show the measured impact scoreboard |
| `/ponytail-help` | Quick reference |

Default level is `full`; set a global default with `PONYTAIL_DEFAULT_MODE` or
`~/.config/ponytail/config.json`. When it defers a corner-cut, it leaves a
`<!-- ponytail: reason -->` marker so "later" doesn't become "never".

### Numbers
Measured on real headless Claude Code sessions editing a real FastAPI + React
repo (12 feature tickets, Haiku 4.5, n=4), scored on the `git diff`:

- **−54% lines of code** on average (up to −94% where the agent would over-build)
- **−22% tokens, −20% cost, −27% time**
- **100% safe** — kept every guard a bare "write one-liners" prompt would drop

---

## Why run both

They attack different halves with zero overlap:

- **caveman** leaves your code byte-for-byte exact and only tightens the prose.
- **ponytail** stays out of the prose and only trims what gets built.

> caveman shrinks what the agent says; ponytail shrinks what it builds. Terse
> talk about minimal code.

Hands-on install + before/after: [demo/part2-tools/README.md](../demo/part2-tools/README.md).
