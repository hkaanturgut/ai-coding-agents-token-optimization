# Stop Burning Tokens: Native Optimization + Two Tools

## DevOps Toronto Demo Session

A hands-on session in **two parts**:

1. **Part 1 — Use what's already there.** The native slash commands and
   configuration practices in **GitHub Copilot** and **Claude Code** that cut
   token waste before you install anything.
2. **Part 2 — Add two small tools.** How to install and use **caveman**
   (shrinks what the agent *says*) and **ponytail** (shrinks what the agent
   *builds*).

**Event:** [DevOps Toronto Meetup - July 30, 2026](https://www.meetup.com/devopsto/events/315582119/)
**Duration:** 30 minutes
**Audience:** DevOps/SRE + developers + architects

---

## The one idea

Every token you send costs money and slows the model down. There are two
independent levers:

| Lever | What it shrinks | Part 1 (native) | Part 2 (tools) |
|-------|-----------------|-----------------|----------------|
| **Context** | What the model *reads* each turn | `/compact`, `/clear`, custom instructions | — |
| **Output** | What the model *writes* back | terse instructions | **caveman** |
| **Code** | What the model *builds* into your repo | scoped prompts | **ponytail** |

Part 1 gets you most of the way with zero installs. Part 2 makes the last two
levers automatic and measurable.

---

## Repository structure

```
README.md                         # This file — the session spine
docs/
  PART-1-NATIVE.md                # Native slash commands + custom instructions + prompt files
  PART-2-CAVEMAN-PONYTAIL.md      # Install + use + when for both tools
  SLASH-COMMAND-CHEATSHEET.md     # Copilot <-> Claude Code command equivalents
  ATTENDEE-HANDOUT.md             # One-page takeaway
demo/
  part1-native/                   # Hands-on: context hygiene, custom instructions, prompt files
  part2-tools/                    # Hands-on: install caveman + ponytail, before/after
  sample-data/                    # Log + diff + schema used in live demos
```

---

## Session flow (30 minutes)

### Part 1 — Native optimization (15 min)
See [docs/PART-1-NATIVE.md](docs/PART-1-NATIVE.md).

1. **Context is the bill.** Show `/context` (Claude Code) and the context-window
   indicator (Copilot). Most waste is stale conversation, not the model.
2. **The four commands you already have.** `/clear`, `/compact`, `/cost`,
   `/context` — and their exact Copilot equivalents.
3. **Custom instructions.** `.github/copilot-instructions.md` and `CLAUDE.md`:
   write the rules once, stop repeating yourself every prompt.
4. **Custom prompt files.** `.github/prompts/*.prompt.md` and
   `.claude/commands/*.md`: reusable, parameterized prompts instead of paste.

### Part 2 — Two tools (15 min)
See [docs/PART-2-CAVEMAN-PONYTAIL.md](docs/PART-2-CAVEMAN-PONYTAIL.md).

1. **caveman** — "why use many token when few do trick." One install, agent
   drops filler, keeps code/commands/errors byte-for-byte. ~65% fewer *output*
   tokens. Live before/after with `/caveman-stats`.
2. **ponytail** — the laziest senior dev, inside your agent. A YAGNI ladder that
   stops the agent over-building. ~54% less *code*, and it never cuts security,
   validation, or accessibility.
3. **They stack.** caveman = smaller mouth, ponytail = smaller hands. No overlap.

---

## Quick start

Nothing to build. Part 1 needs only Copilot or Claude Code. Part 2 installs two
plugins live:

```bash
# caveman (macOS / Linux / WSL) — needs Node >= 18
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash

# ponytail (Claude Code) — run as two separate prompts inside Claude Code
/plugin marketplace add DietrichGebert/ponytail
/plugin install ponytail@ponytail
```

Full install matrix (Copilot CLI, Codex, Cursor, and 30+ agents) is in
[docs/PART-2-CAVEMAN-PONYTAIL.md](docs/PART-2-CAVEMAN-PONYTAIL.md).

---

## Honest numbers

- **caveman:** ~65% average *output* token reduction (range 22–87%). It only
  shrinks output and adds ~1–1.5K input tokens/turn, so whole-session savings
  are smaller — and on already-terse work it can be net-negative. The bigger win
  is readability and speed.
- **ponytail:** ~54% less code on average (up to 94% where an agent over-builds),
  ~20% cheaper, ~27% faster, measured on real Claude Code sessions editing a real
  FastAPI + React repo — while keeping every safety guard.

Both are MIT-licensed and phone home to nobody. Sources:
[caveman](https://github.com/JuliusBrussee/caveman) ·
[ponytail](https://github.com/DietrichGebert/ponytail).
