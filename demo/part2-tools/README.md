# Demo — Part 2: ponytail + caveman in GitHub Copilot

Both tools are already installed in this repo as instruction files:

- [../../.github/instructions/ponytail.instructions.md](../../.github/instructions/ponytail.instructions.md)
- [../../.github/instructions/caveman.instructions.md](../../.github/instructions/caveman.instructions.md)

They use `applyTo: '**'`, so Copilot loads them automatically when this folder is
your workspace. **Opening this repo is the install.** To use them elsewhere, copy
the two files into that repo's `.github/instructions/`.

---

## Demo 2.1 — ponytail (smaller hands)

**Target:** [signup-form.html](signup-form.html) — a form missing a birth-date
field.

**Prompt (Copilot Chat, Agent mode):**
> Add a date-of-birth field to the signup form.

**With ponytail on (default here):** Copilot climbs the YAGNI ladder to the
native platform feature and writes one line:
```html
<input type="date" name="dob" required />
```
No datepicker library, no wrapper component, no stylesheet — and it keeps
`required`, because validation is never cut.

**Show the "before":** rename `ponytail.instructions.md` to `.off`, reload the
window, and rerun the same prompt in a scratch file. Typical result: an installed
datepicker dependency + wrapper. Rename it back when done.

**Bonus prompt — audit a diff:**
> Review the current changes for over-engineering. Delete-list only:
> file:line → remove → why. Keep validation, security, accessibility.

---

## Demo 2.2 — caveman (smaller mouth)

**Prompt (Copilot Chat):**
> Explain how database connection pooling works.

**With caveman on (default here):** terse, telegraphic answer — same facts, ~a
third of the words, code/commands/errors untouched.

**Show the "before":** say `normal mode` and rerun — full verbose paragraph.
Bring it back with `talk like caveman`.

**Honest note to say out loud:** this instruction-file form shrinks *output*
tokens only. The `/caveman-stats` counter and statusline are Claude Code hook
features and won't appear in Copilot.

---

## Demo 2.3 — they stack

Ask Copilot to implement one small feature *and* explain it:

- **ponytail** keeps the code minimal.
- **caveman** keeps the explanation short.

Different halves, zero overlap. caveman = what Copilot says, ponytail = what
Copilot builds.

---

Recap card: [../../docs/ATTENDEE-HANDOUT.md](../../docs/ATTENDEE-HANDOUT.md).
