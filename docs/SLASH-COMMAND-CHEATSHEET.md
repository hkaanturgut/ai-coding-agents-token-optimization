# Slash-Command Cheatsheet: Copilot ↔ Claude Code

Same intent, mapped across both agents. Use this as the Part 1 reference card.

## Context & session control (native)

| Intent | Claude Code | GitHub Copilot |
|--------|-------------|----------------|
| Start fresh, drop history | `/clear` | `/clear` (new chat thread) |
| Compress old turns, keep going | `/compact [instructions]` | `/compact` / **Summarize conversation** |
| See context usage | `/context` | Context-window indicator (Chat view) |
| See spend this session | `/cost` | Usage view / request counter |
| Open settings | `/config` | Settings UI |
| Edit standing memory | `/memory` | Edit `.github/copilot-instructions.md` |
| Get help | `/help` | `/help` |

## Standing rules (custom instructions)

| Scope | Claude Code | GitHub Copilot |
|-------|-------------|----------------|
| Whole project | `CLAUDE.md` (repo root) | `.github/copilot-instructions.md` |
| Every project (personal) | `~/.claude/CLAUDE.md` | VS Code user settings / profile |
| Path-scoped rules | one `CLAUDE.md` per folder | `*.instructions.md` with `applyTo` glob |
| Generate a starter | write it | `/generateInstructions` command |

## Reusable prompts (custom prompt files)

| Intent | Claude Code | GitHub Copilot |
|--------|-------------|----------------|
| Save a reusable prompt | `.claude/commands/name.md` | `.github/prompts/name.prompt.md` |
| Save from a good chat | copy into a command file | `/savePrompt` command |
| Parameters | `$ARGUMENTS` | `${input:var}` in front matter |
| Invoke | `/name` | `/name` in Chat |

## Code-assist slash commands (Copilot, in-editor)

Handy but not part of the token story: `/explain`, `/fix`, `/tests`, `/doc`,
`/optimize`, `/generate`. Setting intent this way is still cheaper than a long
free-text prompt.

## Added by the tools (Part 2)

| From | Commands |
|------|----------|
| **caveman** | `/caveman [lite\|full\|ultra\|wenyan]`, `/caveman-commit`, `/caveman-review`, `/caveman-stats`, `/caveman-compress <file>` |
| **ponytail** | `/ponytail [lite\|full\|ultra\|off]`, `/ponytail-review`, `/ponytail-audit`, `/ponytail-debt`, `/ponytail-gain`, `/ponytail-help` |
