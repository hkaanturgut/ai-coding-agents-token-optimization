---
mode: agent
description: Triage an error log without dumping the whole file into context
---
Do NOT read the full log into context.

1. Run: `grep -iE "error|fatal|exception" ${input:logfile} | sort | uniq -c | sort -rn | head`
2. From that output only, summarize the top 5 root causes, most frequent first.
3. For the #1 cause, propose the smallest fix.

Keep the answer terse. Show commands and file:line references, not prose.
