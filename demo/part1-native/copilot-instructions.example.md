# Example: .github/copilot-instructions.md
# (or paste the body into CLAUDE.md for Claude Code)
#
# Standing rules the agent reads every turn. Keep it terse — this file is
# re-sent on every request, so bloat here is a tax on every prompt.

## Style
- Prefer the standard library and native platform features over new dependencies.
- No comments unless explicitly asked.
- Small, focused functions. No speculative abstractions.

## Scope discipline
- Do only what was asked. If a bigger change seems needed, say so and stop.
- Don't reformat or refactor code you weren't asked to touch.

## Output
- Answer in the fewest words that stay technically exact.
- Show only the changed lines, not whole files, unless asked.

## Safety (never skip)
- Keep input validation at trust boundaries, error handling, and access control.
- Flag anything that touches secrets, auth, or data loss.
