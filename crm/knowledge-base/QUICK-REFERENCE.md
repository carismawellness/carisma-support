# Knowledge Base Quick Reference

Your guide to using and maintaining the KB. Bookmark this page.

---

## For Support Agents (Using /crmrespond)

### How KB Matching Works

When you use `/crmrespond` in a customer conversation:

1. **Brand detection** — System identifies customer's brand (SPA, AES, or SLIM)
2. **KB loading** — Brand-specific KB loads automatically
3. **Query matching** — Your question/customer message is matched against KB entries
4. **Results ranking** — Top 3 matches displayed with relevance scores

### Understanding Relevance Scores

Your KB results show a relevance percentage. Here's how to use it:

| Score | Meaning | What to do |
|-------|---------|-----------|
| 90-100% | Perfect match | Cite the KB entry directly. You can quote it verbatim. |
| 75-89% | Strong match | Paraphrase the KB answer with confidence. Good source. |
| 60-74% | Partial match | Use as reference, but add your own explanation. |
| <60% | Low relevance | Ignore. This entry doesn't apply to this question. |

### Example Workflow

**Scenario:** Customer asks "How much does a massage cost?"

**KB returns:**
```
[88%] S3.1: Treatment Details - Massage Duration
  "Our massage treatments vary in duration...
   A standard full-body massage lasts 50-60 minutes..."

[78%] S5.1: Payment Methods
  "We accept all major credit cards, bank transfers, and cash..."

[65%] S4.1: Cancellation & Rescheduling
  "You can reschedule your appointment for free..."
```

**Best approach:**
- ✅ Answer with S4.1 (88%) — Direct pricing information
- ✅ Mention S5.1 (78%) — Payment options the customer might have
- ❌ Ignore S4.1 (65%) — Not about pricing

**Response you might send:**
> "Our massage treatments start at €65 for a 30-minute express treatment. A standard 50-60 minute massage is €85. We also offer 90-minute deep restoration treatments. We accept all major credit cards, bank transfers, and cash."

---

### Finding Entries by QID

Each KB entry has a Quick ID (QID). If you need to reference an entry later:

```
QID Format: [Letter][Tier].[Number]

Examples:
S1.1  = Spa, Tier 1, Entry 1
S3.2  = Spa, Tier 3, Entry 2
A2.1  = Aesthetics, Tier 2, Entry 1
D1.1  = Department-wide (shared), Tier 1, Entry 1

Note: "S" is used for all entries, not just Spa (legacy naming)
```

### Common Questions & Quick Answers

**Q: Do I need to cite the KB source in my reply?**
A: No. Integrate KB information naturally into your answer. You're citing the knowledge, not the system.

**Q: What if the KB doesn't have an answer?**
A: Flag it! Use the backlog tool to add the question. See "For KB Owners" below.

**Q: Can I modify KB answers?**
A: No. KB is read-only for agents. Flag inaccurate entries to KB manager.

**Q: What if I disagree with a KB answer?**
A: Post in #kb-feedback channel or contact KB manager. Don't override KB in customer responses.

---

## For KB Owners (Monthly Maintenance)

### Quick Checklist (15 minutes)

Every month, spend 15 minutes on this:

- [ ] Run analytics: `python3 tools/kb_analytics.py`
- [ ] Review Tier 1 entries (spot check 3-5)
- [ ] Flag any outdated information
- [ ] Suggest 2-3 new Q&As from support inquiries
- [ ] Check confidence levels are ≥75%
- [ ] Verify keywords make sense for search

### Quick Commands

```bash
# View KB health metrics
python3 tools/kb_analytics.py

# Add a new Q&A to backlog
python3 tools/kb_backlog_manager.py add "How do I use gift cards?" SPA

# Promote backlog item to KB
python3 tools/kb_backlog_manager.py promote BL-001

# Run monthly verification cycle
python3 tools/kb_monthly_update.py

# Test KB matching (before deploy)
python3 tests/test_crmrespond_kb_integration.py
```

### When Things Change

Update the KB **immediately** if:

**Pricing changes**
- Example: Package prices updated from €199 to €219
- Action: Edit S2.1, update verified_date, set confidence_level=95

**Service offerings change**
- Example: New massage type added, old one discontinued
- Action: Add new entry, archive old one

**Policy changes**
- Example: Cancellation window changes from 24h to 48h
- Action: Edit S1.2, note change date

**Legal/compliance updates**
- Example: GDPR privacy policy changes
- Action: Flag to compliance team, update KB accordingly

**Safety-critical info**
- Example: Allergen warning discovered
- Action: Update immediately, notify all staff

### Monthly Verification Process

Every month, verify Tier 1 entries are still accurate:

```bash
# Edit CRM/knowledge-base/kb-data.json
# For each Tier 1 entry:
#   1. Read the answer
#   2. Confirm with current operations (pricing, hours, policies)
#   3. If correct:
#      - Update "last_reviewed": "2026-02-22"
#      - Optionally update "confidence_level" if changed
#   4. If incorrect:
#      - Update the answer
#      - Set "confidence_level" to your certainty (85-95%)
#   5. Commit with message "docs: verify [QID] - [description]"
```

### Tier 1 Entries (Your Focus)

These are what support agents use most. Review every month:

- **S1.1** — How to book
- **S1.2** — Cancellation policy
- **S4.1** — Rescheduling
- **S4.2** — No-show policy
- **S5.1** — Payment methods
- **D1.1** — Rescheduling (duplicate, consider archiving)

### From Support Feedback to KB

When support team reports a common question:

1. **Check if in KB** — Run quick search
2. **If not in KB:** Add to backlog
   ```bash
   python3 tools/kb_backlog_manager.py add "Your question here?" BRAND
   ```
3. **Backlog item created** — You'll be notified with BL-XXX ID
4. **Evaluate next month** — Promote top 2-3 backlog items to KB

### Useful Files

| File | Purpose | How to use |
|------|---------|-----------|
| `CRM/knowledge-base/kb-data.json` | Master KB | Read/edit here |
| `CRM/knowledge-base/KEYWORD-GUIDE.md` | How to tag entries | Reference when adding tags |
| `CRM/knowledge-base/UPDATE-CYCLE.md` | Monthly process | Follow monthly |
| `CRM/knowledge-base/.backlog.json` | Q&A queue | Check weekly |
| `CRM/knowledge-base/KB-AUDIT-LOG.md` | Change history | Reference for audits |

---

## For Product/Strategy (Quarterly Review)

### Quarterly Analytics Review (2 hours)

Every 3 months, run strategic analysis:

```bash
python3 tools/kb_analytics.py > /tmp/kb-health-q1-2026.txt

# Review the output:
# 1. Overall health score trend
# 2. Tier distribution alignment with support volume
# 3. Brand coverage balance
# 4. Confidence trending (up or down?)
# 5. Entry ownership distribution
```

### Questions to Answer

1. **Tier distribution** — Are Tier 1 entries where support needs them?
   - High support volume on topic X, but Tier 3? → Promote to Tier 1
   - Low support volume, Tier 1? → Consider demoting

2. **Brand balance** — Is coverage proportional to customer base?
   - SPA 50 entries, AES 10 entries, SLIM 5 entries?
   - Either brand imbalance is real (act on it) or KB is stale (update it)

3. **Confidence trend** — Is KB getting better or worse?
   - ↗ Trending up? Great! Keep the cadence.
   - ↘ Trending down? Investigate: policy changes? Team changes? Old entries?

4. **Ownership** — Is knowledge distributed well?
   - 1 person owns 70% of KB? Risk. Redistribute.
   - 8 people own 1 entry each? Fragmented. Consolidate.

5. **Keyword quality** — Are keywords helping search work well?
   - Have support team run test queries
   - Check if results make sense
   - Adjust keywords if needed

---

## Common Questions

### "I found an error in the KB. What do I do?"
1. **If you're a KB owner:** Edit it directly, update verified_date
2. **If you're a support agent:** Flag to KB manager (post in #kb-feedback)
3. **If it's critical/urgent:** Message KB manager in Slack immediately

### "The KB doesn't have an answer to a common question."
1. Run: `python3 tools/kb_backlog_manager.py add "question here?" BRAND`
2. Track the BL-ID you're given
3. Next month, KB manager will evaluate and promote if needed

### "A customer asked something different than the KB says."
- Possible causes:
  1. Customer's situation is different (KB is still correct)
  2. KB is outdated (flag for review)
  3. KB is confusing (flag for rewrite)

- Action: Ask the question in #kb-feedback with context

### "Should I ever correct a customer based on my own knowledge?"
- **If KB says X, you are 100% sure KB is wrong:** Contact KB manager immediately
- **If KB is just unclear:** Clarify for customer, but also flag to KB manager
- **General rule:** Trust KB unless you have recent operational confirmation KB is wrong

### "How do I know if my entry is considered 'Tier 1'?"
Tier 1 = Critical for support agents to know. Usually:
- Answers highest-frequency customer questions
- Contains time-sensitive info (policies, hours, pricing)
- Prevents service failures if agent gets it wrong

Examples:
- ✅ "How do I book?" → Tier 1 (every agent needs this)
- ✅ "What's your cancellation policy?" → Tier 1 (prevents mistakes)
- ✅ "How long does a treatment take?" → Tier 2 (useful but not critical)
- ❌ "What's the history of Carisma?" → Tier 4 (reference only)

---

## File Structure

```
CRM/knowledge-base/
├── kb-data.json              ← Master KB (read/edit here)
├── ANALYTICS.md              ← This dashboard guide
├── QUICK-REFERENCE.md        ← You are here
├── MAINTENANCE-GUIDE.md      ← Detailed maintenance workflows
├── UPDATE-CYCLE.md           ← Monthly verification process
├── KEYWORD-GUIDE.md          ← How to tag entries
├── KB-AUDIT-LOG.md           ← Change history
├── .backlog.json             ← New Q&As awaiting approval
├── schema.json               ← KB data structure
└── TEST-QUERIES.json         ← Test cases for KB matching

CRM/CRM-SPA/knowledge/
├── kb-spa.json               ← SPA-specific KB (generated from master)
├── cloud.md                  ← SPA brand overview
└── knowledge/...             ← Other brand docs

CRM/CRM-AES/knowledge/
├── kb-aes.json               ← AES-specific KB
└── ...

CRM/CRM-SLIM/knowledge/
├── kb-slim.json              ← SLIM-specific KB
└── ...

tools/
├── kb_analytics.py           ← Run health dashboard
├── kb_backlog_manager.py     ← Manage new Q&As
├── kb_keyword_tagger.py      ← Suggest keywords
├── kb_monthly_update.py      ← Verification workflow
└── kb_split_by_brand.py      ← Generate brand KBs
```

---

## Success Metrics

Track these monthly:

| Metric | Target | How to measure |
|--------|--------|-----------------|
| KB Health Score | ≥80 | Run `kb_analytics.py` |
| Tier 1 Coverage | 8+ entries | Count `"tier": 1` in kb-data.json |
| Average Confidence | ≥80% | Check dashboard output |
| Recent Review | ≥80% reviewed in 30 days | Dashboard "Recently reviewed" |
| Agent Satisfaction | ≥4/5 | Quarterly survey |

---

## Quick Start

**If you just got assigned KB maintenance:**

1. Read this entire page (5 min)
2. Read `MAINTENANCE-GUIDE.md` (10 min)
3. Run `python3 tools/kb_analytics.py` (2 min)
4. Spend 15 min on the monthly checklist
5. You're done! See you next month.

**If you're using /crmrespond:**

1. Understand relevance scores (this page, under "Understanding Relevance")
2. When KB returns results, check the % score
3. Cite directly if 90%+, paraphrase if 75-89%, reference if <75%
4. If KB is wrong or missing → flag to KB manager

---

## Questions?

- **About KB content:** Check `QUICK-REFERENCE.md` (you are here)
- **About maintenance:** See `MAINTENANCE-GUIDE.md`
- **About analytics:** See `ANALYTICS.md`
- **About keywords:** See `KEYWORD-GUIDE.md`
- **Need to report an issue?** Post in #kb-feedback or message KB manager

Last updated: 2026-02-22
