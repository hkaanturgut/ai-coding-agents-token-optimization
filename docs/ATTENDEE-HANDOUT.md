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

### caveman — smaller mouth
```bash
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash
```
- ~65% fewer **output** tokens; code/commands/errors stay exact.
- `/caveman ultra` to compress hard, `/caveman-stats` to see savings.
- Honest: only output tokens, adds ~1–1.5K input/turn — real win is speed + readability.

### ponytail — smaller hands
```
/plugin marketplace add DietrichGebert/ponytail
/plugin install ponytail@ponytail
```
- ~54% less **code**; never cuts security, validation, or accessibility.
- YAGNI ladder: skip → reuse → stdlib → native → dep → one line → minimum.
- `/ponytail-review` for a delete-list on your current diff.

---

## Do this week

1. **Mon:** `/clear` between every unrelated task. Notice the difference.
2. **Tue:** Add a `copilot-instructions.md` / `CLAUDE.md` with your top 5 rules.
3. **Wed:** Turn one repeated paste into a `.prompt.md` / `.claude/commands` file.
4. **Thu:** Install caveman, run a session, check `/caveman-stats`.
5. **Fri:** Install ponytail, run `/ponytail-review` on a real PR diff.

---

Sources (MIT, no telemetry):
- caveman — https://github.com/JuliusBrussee/caveman
- ponytail — https://github.com/DietrichGebert/ponytail
