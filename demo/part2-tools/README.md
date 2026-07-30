# Demo — Part 2: caveman + ponytail (hands-on)

Install both live, show a clean before/after for each. ~10 minutes.

---

## Demo 2.1 — caveman (smaller mouth)

**Install (once, ~30s, needs Node ≥ 18):**
```bash
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash
```

**Before / after — ask the same question twice.**

Normal:
> "You should wrap the object in `useMemo`, since a new reference is created on
> every render, which causes the child to re-render unnecessarily."

Caveman (`/caveman full`):
> "New ref each render → child re-renders. Wrap object in `useMemo`."

Same fix, a third of the words, nothing technical lost. Push it further with
`/caveman ultra`.

**Show the receipt:**
```
/caveman-stats
```
Real session token count + lifetime savings.

**Say the honest caveat:** caveman shrinks *output* only and adds ~1–1.5K input
tokens/turn — the durable win is readability and speed, cost is a bonus.

---

## Demo 2.2 — ponytail (smaller hands)

**Install (Claude Code — two separate prompts):**
```
/plugin marketplace add DietrichGebert/ponytail
/plugin install ponytail@ponytail
```

**Before / after — ask for a date picker.**

Without ponytail, a typical agent installs a library, writes a wrapper
component, and adds a stylesheet.

With ponytail:
```html
<!-- ponytail: browser has one -->
<input type="date">
```

The agent climbed the YAGNI ladder and stopped at "native platform feature."

**Run it on a real diff:**
```
/ponytail-review
```
Hands back a delete-list of over-engineering in the current changes — without
cutting validation, security, or accessibility.

**Optionally** point at `../sample-data/database-schema.sql` and ask for a
migration: ponytail writes the minimum that works instead of a migration
framework.

---

## Demo 2.3 — They stack

Turn both on and make one change:

- **caveman** keeps the reply short (code stays byte-for-byte exact).
- **ponytail** keeps the change small (prose untouched).

> caveman = what the agent says. ponytail = what the agent builds. No overlap —
> run both.

---

Recap card: [../../docs/ATTENDEE-HANDOUT.md](../../docs/ATTENDEE-HANDOUT.md).
