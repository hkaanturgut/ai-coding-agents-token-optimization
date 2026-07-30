# GitHub Copilot Setup & Token Optimization

## Prerequisites
- VS Code or JetBrains IDE with Copilot extension
- GitHub Copilot subscription ($10/month or through org)
- Node.js 18+ for token inspection tools

---

## Setup

### 1. Install Copilot Extension
- VS Code: Install "GitHub Copilot" extension from Marketplace
- JetBrains: Install GitHub Copilot plugin from IDE settings

### 2. Authenticate
```
Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux)
> GitHub Copilot: Sign In
Follow browser flow to authorize
```

### 3. Enable Token Visibility (if available)
Settings → GitHub Copilot → Show Token Count: ON

---

## Token Optimization for Copilot

### Selective MCP Tool Loading
Copilot loads MCP tools via VS Code extensions. To optimize:

```json
// .vscode/settings.json
{
  "github.copilot.enable": {
    "*": true,
    "plaintext": true
  },
  "copilot.mcp.enabled": true,
  "copilot.mcp.tools": [
    // Only load tools you actually use
    "codeAnalyzer",
    "testGenerator",
    // Skip: "deploymentTools", "apiGenerator" if not needed
  ]
}
```

### Compress System Prompts
Copilot uses default system prompts. Create custom, compressed ones:

**Default (4.2K tokens):**
```
You are an expert AI programming assistant. You help users write, debug, 
refactor, and optimize code. You understand best practices across many 
languages and frameworks. You provide clear explanations...
```

**Optimized (1.2K tokens):**
```
Expert code assistant. Write, debug, refactor code. Know best practices 
across languages. Give clear explanations.
```

**Compression: 71% savings**

### Caveman Mode for Multi-Turn Sessions
For long coding sessions, use caveman-mode responses:

```bash
# After Copilot responds, compress it
node tools/caveman-formatter.js --mode full
```

Example savings in a 10-turn session:
- Normal: 2,450 tokens/turn × 10 = 24.5K tokens
- Caveman: 620 tokens/turn × 10 = 6.2K tokens
- **Savings: 18.3K tokens (75%)**

---

## Best Practices for Copilot

### ✅ DO
1. **Use comments to guide Copilot**
   ```javascript
   // Function to validate email format
   // Should return true for valid, false otherwise
   // Use regex pattern: ^[^\s@]+@[^\s@]+\.[^\s@]+$
   function validateEmail(email) {
     // Copilot fills in the rest
   }
   ```

2. **Provide context in comments**
   ```javascript
   // Performance-critical function
   // Must complete in <10ms for 1M records
   // Input: array of user objects with id, name, email
   function processUsers(users) {
     // Copilot understands constraints
   }
   ```

3. **Separate concerns into focused functions**
   ```javascript
   // Instead of: "write a function that does auth + validation + logging"
   // Do:
   function validateToken(token) { ... }
   function logAuthAttempt(user, success) { ... }
   async function authenticate(credentials) { ... }
   ```

4. **Use snippets/templates to reduce tokens**
   - Create code templates in your IDE
   - Copilot completes within templates (fewer tokens to describe)

### ❌ DON'T
1. **Dump large files for analysis**
   ```javascript
   // 🚫 DON'T
   // Paste full 10MB log and ask "find errors"
   
   // ✅ DO
   // Run: grep -i "error" large.log | head -50
   // Then ask Copilot about the 50 lines
   ```

2. **Expect Copilot to hold full context forever**
   - After 10-15 turns, summarize conversation
   - Start new sessions for unrelated tasks
   - This resets context counter = cheaper

3. **Load all MCP tools by default**
   - Audit which tools you use monthly
   - Remove unused ones from config
   - Load task-specific tools only

---

## Measuring Token Usage

### Check Current Usage
```bash
# See what tokens Copilot sees in your current file
node tools/token-inspector.js --config demo/mcp-configs/full-tools.json --verbose
```

### Weekly Token Audit
```bash
# Query your Copilot dashboard
# GitHub.com → Settings → Copilot → Activity
# Note total tokens used
```

### Calculate Monthly Costs
```bash
# Copilot pricing: $0.3 per 1M input tokens
# If using 10M tokens/month:
# Cost = 10M × $0.0000003 = $3/month

# If team is 5 engineers:
# Team cost = $3 × 5 = $15/month
```

---

## Copilot-Specific Optimization Strategies

### 1. Use Workspace Settings for Tool Management
```json
// .copilot/config.json
{
  "taskType": "code-review",
  "enabledTools": ["codeAnalyzer", "testGenerator"],
  "contextBudget": 30000,
  "compressionMode": "full"
}
```

### 2. Slash Commands (if available in your Copilot version)
```
/explain         - Explain the selected code
/test            - Generate tests
/fix             - Fix the error
/refactor        - Refactor for readability
```

Use specific commands instead of free-form prompts (more efficient context use).

### 3. Inline Chat vs. Panel Chat
- **Panel Chat** (right sidebar): Holds context longer, good for deep work
- **Inline Chat** (Cmd+I): Single-focused task, fresh context

Use inline chat to keep token cost low per task.

### 4. Smart Prompting
```javascript
// ❌ BAD - Wastes tokens explaining
// "Refactor this function to use async/await and handle errors better"

// ✅ GOOD - Gives constraints
// @file current.js
// Refactor to async/await. Keep same API. Add error handling.
```

---

## Real-World Copilot Setup (30K Token Budget)

### Recommended Config
```json
{
  "systemPrompt": "Expert code assistant. Write, debug, refactor. Best practices across languages.",
  "tools": [
    "codeAnalyzer",
    "testGenerator"
  ],
  "contextBudget": 30000,
  "compressionMode": "full",
  "conversationSummaryAfter": 10,
  "maxContextTurns": 15
}
```

### Usage Patterns
- **Code completion:** 2-3K tokens per file
- **Code review:** 10-15K tokens per PR (with multi-agent split to 5K)
- **Test generation:** 5-8K tokens per file
- **Debugging:** 12-20K tokens per session

### Monthly Estimate
- 20 completions × 2.5K = 50K
- 5 code reviews × 10K = 50K
- 10 test generations × 6K = 60K
- 2 debug sessions × 15K = 30K
- **Total: 190K tokens/month = $0.57**

---

## Troubleshooting

**Q: Copilot is slow to respond**  
A: Token budget exceeded. Check context size. Try splitting into 2 agents.

**Q: Results are low quality**  
A: Too much context (confusion). Use compress mode or clear history.

**Q: Token count not showing**  
A: VS Code extension outdated. Update to latest version.

---

## Resources
- Copilot Docs: https://docs.github.com/en/copilot
- VS Code Integration: https://marketplace.visualstudio.com/items?itemName=GitHub.copilot
- Token Counter: `node tools/token-inspector.js`
