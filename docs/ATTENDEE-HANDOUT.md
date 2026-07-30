# Attendee Handout: Token Optimization Quick Reference

## 🎯 The Framework: Write → Select → Compress → Isolate

```
WRITE:    Baseline your token overhead (50K+ before first prompt)
SELECT:   Load only task-relevant tools (85% reduction)
COMPRESS: Use code, not data dumps (97.5% reduction)
ISOLATE:  Split agents by task (70% reduction per workflow)
```

---

## 📊 Quick Start Commands

### Baseline Your Setup
```bash
node tools/token-inspector.js --config your-config.json
```

### Compress Copilot Responses (75% reduction)
```bash
node tools/caveman-formatter.js --input "<response>" --mode full
```

### Plan Multi-Agent Pipelines
```bash
node tools/agent-budget-calculator.js --scenario code-review --budget 100K
```

---

## 💡 Key Numbers to Remember

| Metric | Impact | Action |
|--------|--------|--------|
| Tool overhead | 50K+ tokens | Audit & remove unused |
| Selective loading | 85% ↓ | Use task-based configs |
| Compression mode | 75% ↓ | Enable caveman for multi-turn |
| Multi-agent split | 70% ↓ | Specialize agents by task |
| **Combined impact** | **95% ↓** | Implement all 4 together |

**Real impact:** 150K tokens → 7.5K tokens per task

---

## ✅ Do This Week

1. **Monday:** Run token inspector on your setup
   ```bash
   node tools/token-inspector.js --config your-config.json
   ```

2. **Tuesday:** Identify & remove 3 unused MCP tools
   - Which tools do you use <5% of the time?
   - Remove from your config

3. **Wednesday:** Try caveman mode on one session
   ```bash
   node tools/caveman-formatter.js --mode full
   ```

4. **Thursday:** Plan one multi-agent workflow
   - Code review task? Split into analyzer + implementer + reviewer
   - Use the calculator to estimate savings

5. **Friday:** Measure actual savings
   - Compare tokens: before optimization vs. after
   - Document your baseline and improvements

---

## 🔍 Where Tokens Hide

| Source | Typical Cost | Optimization |
|--------|--------------|--------------|
| Tool definitions | 50K | Use selective config (85% ↓) |
| System prompt | 2K | Compress to 1K (50% ↓) |
| Conversation history | 10K | Summarize after 8 turns (80% ↓) |
| File dumps | 80K | Use grep/jq first (95% ↓) |
| Single mega-agent | 150K | Split into agents (70% ↓) |

---

## 🎓 Principles

### Principle 1: Write
**Question:** Where do tokens go?  
**Answer:** Run the token inspector

### Principle 2: Select
**Question:** Do you really need all these tools?  
**Answer:** Load only task-relevant ones (85% reduction)

### Principle 3: Compress
**Question:** Can you analyze locally instead?  
**Answer:** Yes—grep, jq, awk beat dumping data (95% reduction)

### Principle 4: Isolate
**Question:** Can you split the task into smaller pieces?  
**Answer:** Yes—specialized agents save 70% tokens

---

## 📈 Scaling Impact

### 1 Engineer
- Before: 150K tokens/day × 20 work days = 3M tokens/month = $90
- After: 45K tokens/day × 20 work days = 900K tokens/month = $27
- **Savings: $63/month**

### Team of 5 Engineers
- Before: $450/month
- After: $135/month
- **Savings: $315/month = $3,780/year**

### Org of 50 Engineers
- Before: $4,500/month
- After: $1,350/month
- **Savings: $3,150/month = $37,800/year**

---

## 🔗 Resources

- **ponytail** (Token tracking): https://github.com/DietrichGebert/ponytail
- **caveman** (Compression): https://github.com/juliusbrussee/caveman
- **MCP Spec**: https://modelcontextprotocol.io/
- **This repo**: https://github.com/hkaanturgut/ai-coding-agents-token-optimization

---

## 🚀 Three-Day Challenge

**Day 1:**
- [ ] Run token inspector (5 min)
- [ ] Note current baseline
- [ ] Identify 3 unused tools

**Day 2:**
- [ ] Remove unused tools from config (10 min)
- [ ] Re-run inspector, note savings
- [ ] Try caveman mode on one task (5 min)

**Day 3:**
- [ ] Plan 1 multi-agent workflow (15 min)
- [ ] Implement split (30 min)
- [ ] Measure total savings (5 min)

**Result:** Likely 60-70% token reduction in 2 hours of work

---

## ❓ FAQ

**Q: Will this affect code quality?**  
A: No. Research shows specialized agents produce better code than generalists.

**Q: Is setup complicated?**  
A: No. ~2 hours to get 70% savings. Scripts are provided.

**Q: Do all platforms support this?**  
A: Yes. Framework is tool-agnostic (Copilot, Claude, Cursor, Roocode).

**Q: What's the downside?**  
A: Multi-agent requires coordination (solved with templates in this repo).

**Q: How long to see ROI?**  
A: Immediate. Savings start on first optimized workflow.

---

## 💬 Share Your Results

Tag DevOps Toronto community if you implement this:
- What % token reduction did you achieve?
- Which principle saved the most tokens?
- What surprised you most?

---

**Happy token optimization! 🚀**

Questions? Check out the full framework: `docs/FRAMEWORK.md`
