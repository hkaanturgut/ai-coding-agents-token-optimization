# Attendee Handout — One Page

## The mental model

Two independent levers, plus the context you re-send every turn:

```
CONTEXT  = what the model reads each turn   -> Part 1 (native)
OUTPUT   = what the model writes back       -> caveman
CODE     = what the model builds in your repo -> ponytail
```

---

## Part 1 — Do this today, zero installs

| Habit | Claude Code | GitHub Copilot |
|-------|-------------|----------------|
| Fresh context between tasks | `/clear` | `/clear` |
| Compress a long thread | `/compact` | `/compact` (Summarize) |
| See the receipt | `/cost` · `/context` | Usage + context indicator |
| Write rules once | `CLAUDE.md` | `.github/copilot-instructions.md` |
| Reusable prompts | `.claude/commands/*.md` | `.github/prompts/*.prompt.md` |

**Highest-leverage habit:** `/clear` between unrelated tasks. Costs nothing.

---

## Part 2 — Two tools that stack

### caveman — smaller mouth (what the agent SAYS)
GitHub Copilot: copy `caveman.instructions.md` into `.github/instructions/`.
- ~65% fewer **output** tokens; code/commands/errors stay exact.
- Toggle with "normal mode" / "talk like caveman".
- Honest: output tokens only — real win is speed + readability. (`/caveman-stats`
  + statusline are Claude Code only.)

### ponytail — smaller hands (what the agent BUILDS)
GitHub Copilot: copy `ponytail.instructions.md` into `.github/instructions/`.
- ~54% less **code**; never cuts security, validation, or accessibility.
- YAGNI ladder: skip → reuse → stdlib → native → dep → one line → minimum.
- Killer demo: "add a date picker" → `<input type="date">` instead of a library.

---

## Do this week

1. **Mon:** `/clear` between every unrelated task. Notice the difference.
2. **Tue:** Add a `.github/copilot-instructions.md` with your top 5 rules.
3. **Wed:** Turn one repeated paste into a `.github/prompts/*.prompt.md` file.
4. **Thu:** Copy `ponytail.instructions.md` in; run the date-picker prompt.
5. **Fri:** Copy `caveman.instructions.md` in; feel the shorter answers.

---

Sources (MIT, no telemetry):
- caveman — https://github.com/JuliusBrussee/caveman
- ponytail — https://github.com/DietrichGebert/ponytail
