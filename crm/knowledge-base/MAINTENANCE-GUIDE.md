# Knowledge Base Maintenance Guide

Comprehensive guide for keeping the KB current, accurate, and useful.

---

## Overview

KB maintenance happens at multiple cadences:

| Frequency | Task | Time | Owner |
|-----------|------|------|-------|
| Daily | Capture missed questions | 5 min | Support team |
| Weekly | Review captured questions | 10 min | KB manager |
| Monthly | Verify Tier 1, update entries | 30 min | KB owners |
| Quarterly | Strategic review | 2 hrs | Product + KB team |
| Annually | Complete audit | 4 hrs | All teams |

---

## Daily Tasks

### Capture Customer Questions Not in KB

**Who:** Support team (anyone using /crmrespond)

**What:** When you answer a customer question that the KB doesn't have (or KB score <75%), note it.

**How:**
```bash
# Option 1: Use the backlog tool
python3 tools/kb_backlog_manager.py add "Customer's exact question?" BRAND

# Option 2: Manual - add to .backlog.json with timestamp
```

**Example:**
- Customer: "Do you have a loyalty program?"
- KB search: No 90%+ match
- Action: `python3 tools/kb_backlog_manager.py add "Do you have a loyalty program?" SPA`

**Why:** These questions tell us what gaps exist in our KB.

---

## Weekly Tasks (10 minutes)

### Step 1: Review Backlog Items

```bash
# View all backlog items
cat CRM/knowledge-base/.backlog.json | jq '.backlog[] | "\(.id): \(.question) (\(.count) times)"'
```

**Look for:**
- **Frequency ≥2** — Same question asked multiple times this week
- **Tier 1 topics** — Booking, pricing, cancellation, payment
- **Brand-specific patterns** — One brand has higher volume?

**Example output:**
```
BL-001: "How do I change my appointment date?" (3 times)
BL-002: "Do you have gift cards?" (1 time)
BL-003: "What's your refund policy?" (2 times)
BL-004: "Can I combine treatments?" (1 time)
```

### Step 2: Flag High-Priority Items

Create a note or spreadsheet:

```
This week's top backlog:
- BL-001 (3x) - Rescheduling question (probably already in KB as S4.1, check match)
- BL-003 (2x) - Refund policy (MISSING, should be Tier 2)
- BL-002 (1x) - Gift cards (already in KB as S2.2, check score)
```

---

## Monthly Tasks (30 minutes)

### Step 1: Run Health Dashboard (5 minutes)

```bash
python3 tools/kb_analytics.py
```

**Review these sections:**

1. **Any entries marked ⚠️ URGENT?**
   - Entries >60 days old without review → Schedule immediate review

2. **Confidence trending?**
   - Down from last month → Investigate why
   - Up → Keep current maintenance cadence

3. **Owner overwhelmed?**
   - One owner has 40%+ of entries → Consider rebalancing
   - Unassigned entries → Assign owner

4. **Tier 1 look good?**
   - 8+ entries? Confidence ≥85%? All recently verified?
   - If not → Plan deep review

### Step 2: Verify Tier 1 Entries (15 minutes)

**Target:** All Tier 1 entries reviewed and verified monthly

**Process for each Tier 1 entry:**

1. **Open:** `CRM/knowledge-base/kb-data.json`
2. **Find:** All entries with `"tier": 1`
3. **For each entry:**
   - Read the answer carefully
   - Ask: "Is this 100% accurate right now?"
   - Check against current operations:
     - Pricing still correct?
     - Hours/availability current?
     - Policies unchanged?
     - Contact info still valid?
   - If ✅ still correct:
     ```json
     "last_reviewed": "2026-02-22",
     "verified_date": "2026-02-22",
     "confidence_level": 95
     ```
   - If ❌ needs updating:
     - Fix the answer
     - Update verified_date, last_reviewed
     - Set confidence based on your certainty
       - 95% = Very confident, recent confirmation
       - 88% = Reasonably confident, minor uncertainty
       - 80% = Updated but needs double-check

4. **Commit your changes:**
   ```bash
   git add CRM/knowledge-base/kb-data.json
   git commit -m "docs: verify Tier 1 entries (2026-02-22)"
   ```

**Tier 1 entries to always check:**
- S1.1 — Booking process (has Fresha link? Still accurate?)
- S1.2 — Cancellation policy (24-hour window still correct?)
- S4.1 — Rescheduling (24-hour window match S1.2?)
- S4.2 — No-show policy (50% fee still accurate?)
- S5.1 — Payment methods (still accept all these methods?)

### Step 3: Review Flagged Entries (5 minutes)

From the analytics dashboard, address any flagged entries:

**Low confidence (<75%):**
- S3.2 confidence=80 (Aesthetics results timeline)
  - Verify with aesthetics team: Still 2-4 weeks for skin, 4-12 for body?
  - Update if different
  - Set confidence to 95 if verified

**Not reviewed recently (31-60 days):**
- S2.2 last_reviewed=2026-01-15 (Gift cards)
  - Check: Still €50, €100, €150 denominations?
  - Still valid 12 months?
  - Update reviewed_date if still accurate

**Unassigned entries:**
- owner="Unassigned"
  - Assign to appropriate team member
  - Notify them of assignment

### Step 4: Add New Entries from Backlog (5 minutes)

**If backlog item appears 2+ times this month:**

1. Evaluate: Should we add to KB?
   - Is it a common/important question?
   - Is it specific or too niche?
   - Does KB already have similar answer?

2. If yes:
   ```bash
   python3 tools/kb_backlog_manager.py promote BL-XXX
   ```

3. Follow the entry creation process (see "Adding New Entries" section)

---

## Monthly Verification Checklist

Copy this and check off as you go:

```
MONTHLY KB VERIFICATION — [Month/Year]

□ Run analytics: python3 tools/kb_analytics.py
  Result: Health score = ___/100

□ Review Tier 1 entries:
  □ S1.1 - Booking (last verified: ______)
  □ S1.2 - Cancellation (last verified: ______)
  □ S4.1 - Rescheduling (last verified: ______)
  □ S4.2 - No-show (last verified: ______)
  □ S5.1 - Payment (last verified: ______)

□ Address low-confidence entries:
  □ Reviewed: ______ entries
  □ Updated: ______ entries
  □ Confidence improved from: __% to __%

□ Review unreviewed entries (>30 days old):
  □ Count: ______ entries
  □ Action: Reviewed / Scheduled / Escalated

□ Process backlog:
  □ High-frequency items: ____
  □ Promoted to KB: BL-___, BL-___, BL-___
  □ Scheduled for next month: BL-___, BL-___

□ Commit changes:
  ```bash
  git add CRM/knowledge-base/
  git commit -m "docs: monthly KB verification (2026-02-22)"
  ```

Verified by: ________________  Date: __________
```

---

## When to Update (Decision Tree)

Use this to decide how urgently to update KB entries:

### Immediate (Stop other work)
```
Does this affect customer safety?
├─ YES → Update immediately, notify all staff
└─ NO → Check next

Does this affect billing/legal compliance?
├─ YES → Update within 2 hours, notify manager
└─ NO → Check next

Is this a policy the staff uses daily?
├─ YES → Update within 4 hours
└─ NO → Schedule for monthly review
```

**Examples:**
- 🔴 IMMEDIATE: Allergy warning discovered → Update S3.1 now
- 🔴 IMMEDIATE: Pricing changes → Update S2.1 now
- 🟡 WITHIN 2 HRS: Cancellation policy changes → Update S1.2
- 🟢 MONTHLY: Massage durations expanded → Schedule review, update S3.1

### Within 1 Week
- Common customer confusion (showing in backlog repeatedly)
- New service added
- Seasonal information (holiday hours, summer schedule)
- Minor clarifications

### Within 1 Month
- Keywords could be better
- Answer could be clearer
- Related Q&As could be stronger
- Low-priority structural improvements

---

## Adding New Entries

### From Backlog → KB

When a backlog item gets promoted:

```bash
# Promote the item
python3 tools/kb_backlog_manager.py promote BL-001

# Open kb-data.json and create new entry
```

**New entry template:**
```json
{
  "qid": "S6.1",                          // Auto-generate next in sequence
  "section": "New Section Name",          // Group related entries
  "tier": 2,                              // 1=critical, 2=important, 3=standard, 4=reference
  "brands": ["SPA"],                      // ["ALL"] or ["SPA", "AES", "SLIM"]
  "question": "Exact customer question?",
  "answer": "Clear, helpful answer...",
  "keywords": [                           // 10-15 searchable terms
    "keyword1",
    "keyword2",
    "specific-phrase"
  ],
  "related_qids": ["S1.1", "S5.1"],      // Link to related entries
  "status": "ACTIVE",
  "owner": "Your Name",
  "verified_date": "2026-02-22",
  "last_reviewed": "2026-02-22",
  "confidence_level": 90
}
```

**Guidance:**

| Field | Rules |
|-------|-------|
| qid | Format: Letter + Tier + Number (S1.1, S3.4, etc.) |
| section | Group by topic (Booking, Pricing, Cancellation, etc.) |
| tier | 1=top 20% by frequency, 2=next 30%, 3=next 30%, 4=reference |
| brands | ALL, or list specific brands |
| question | Write as customer would ask it |
| answer | Helpful, specific, 2-4 sentences max |
| keywords | Think: How would someone search for this? |
| related_qids | 2-3 entries that relate to this one |
| confidence_level | Your certainty (80-100%). Lower for new/uncertain. |

### Testing New Entries

Before committing:

```bash
# Add entry to kb-data.json, then:
python3 tests/test_crmrespond_kb_integration.py

# Check if entry shows up in results
# Check if keywords work
# Check if related entries make sense
```

---

## Escalation Thresholds

When to involve management or halt other work:

### Red Flags — Stop & Escalate

- [ ] 3+ Tier 1 entries are factually incorrect
- [ ] Customer safety compromised (allergy, medical, security info wrong)
- [ ] Pricing wrong (customers charged incorrectly because of KB)
- [ ] Legal/compliance issue (privacy, terms, policy wrong)
- [ ] 50%+ of KB outdated (confidence <70%)

**Action:** Message manager immediately in Slack/email

### Yellow Flags — Schedule Review

- [ ] 30%+ of Tier 1 entries unreviewed >30 days
- [ ] Confidence levels trending down month-over-month
- [ ] Same question appearing 5+ times in backlog (coverage gap)
- [ ] One brand's KB coverage is <50% of other brands
- [ ] Support team asking "Is this KB entry still accurate?" more than once

**Action:** Schedule deep review within 1 week

### Green Flags — Continue As-Is

- [ ] Health score ≥80
- [ ] ≥80% of entries reviewed within 30 days
- [ ] Confidence levels stable or trending up
- [ ] Backlog items are 1x only (not repeating questions)

**Action:** Continue monthly maintenance

---

## Roles & Responsibilities

### Support Agents
- [ ] Capture questions KB doesn't answer
- [ ] Report inaccurate KB entries
- [ ] Use /crmrespond with KB
- [ ] Provide feedback on KB usefulness

### KB Owners (By Brand)
- [ ] Verify Tier 1 entries monthly
- [ ] Flag outdated information
- [ ] Suggest new Q&As
- [ ] Maintain confidence scores
- [ ] Own specific sections

### KB Manager (Central)
- [ ] Coordinate monthly reviews
- [ ] Process backlog → KB promotions
- [ ] Maintain kb-data.json
- [ ] Run analytics & report health
- [ ] Handle escalations

### Product/Leadership
- [ ] Strategic quarterly reviews
- [ ] Approve major restructuring
- [ ] Assign new KB owners
- [ ] Set KB priorities

---

## Maintenance Files & Commands

### Key Files

```
CRM/knowledge-base/
├── kb-data.json              ← Edit here for content changes
├── .backlog.json             ← Review weekly for patterns
├── KB-AUDIT-LOG.md           ← Log all changes here
├── ANALYTICS.md              ← Dashboard guide
├── QUICK-REFERENCE.md        ← Agent guide
└── MAINTENANCE-GUIDE.md      ← You are here
```

### Key Commands

```bash
# View KB health
python3 tools/kb_analytics.py

# View all backlog items
cat CRM/knowledge-base/.backlog.json | jq '.backlog[]'

# Add to backlog
python3 tools/kb_backlog_manager.py add "Question?" BRAND

# Promote backlog to KB
python3 tools/kb_backlog_manager.py promote BL-001

# Tag suggestions for new entries
python3 tools/kb_keyword_tagger.py "Your new entry answer here"

# Run monthly verification
python3 tools/kb_monthly_update.py

# Test KB before deploying changes
python3 tests/test_crmrespond_kb_integration.py

# Regenerate brand KBs from master
python3 tools/kb_split_by_brand.py
```

### Git Workflow

```bash
# Monthly verification commit
git add CRM/knowledge-base/
git commit -m "docs: monthly KB verification (YYYY-MM-DD)"
git push origin main

# New entry commit
git add CRM/knowledge-base/kb-data.json
git commit -m "docs: add new KB entry S6.1 - [description]"
git push origin main

# Urgent fix commit
git add CRM/knowledge-base/kb-data.json
git commit -m "fix: update S1.2 cancellation policy (URGENT)"
git push origin main
```

---

## Troubleshooting

### Issue: Backlog item won't promote
**Cause:** Missing fields or invalid JSON
**Fix:** Check `.backlog.json` syntax, ensure all required fields present

### Issue: Analytics show old dates
**Cause:** Date format not ISO (YYYY-MM-DD)
**Fix:** Fix date fields in kb-data.json, rerun analytics

### Issue: Brand KBs out of sync with master
**Cause:** Master updated but split not run
**Fix:** Run `python3 tools/kb_split_by_brand.py` to regenerate

### Issue: Can't find an entry by QID
**Cause:** QID wrong or entry archived
**Fix:** Search kb-data.json for partial QID, check status field

### Issue: Confidence levels don't match reality
**Cause:** Entries not reviewed/updated
**Fix:** Run monthly verification, update last_reviewed dates

---

## Success Metrics

**Track monthly:**

| Metric | Target | Action if below |
|--------|--------|-----------------|
| Health Score | ≥80/100 | Schedule deep review |
| Tier 1 Verified | ≥95% | Assign verification task |
| Confidence (avg) | ≥80% | Update low entries |
| Recently reviewed | ≥80% (<30 days) | Prioritize verification |
| Backlog promotion | ≥2/month | Monitor for patterns |

---

## Template: Monthly Status Report

Share this with stakeholders monthly:

```
KNOWLEDGE BASE STATUS — [Month/Year]

📊 Metrics
- Health Score: [__]/100
- Total Entries: [__]
- Tier 1: [__] entries (Target: 8+)
- Confidence (avg): [__]%
- Recently Reviewed: [__]%

✅ Completed
- Verified [__] Tier 1 entries
- Promoted [__] backlog items to KB
- Updated [__] entries for accuracy
- Fixed [__] issues

⚠️  Outstanding
- [__] entries need review (>30 days)
- [__] backlog items pending evaluation
- [__] low-confidence entries need update

📈 Trends
- Health score: [UP/DOWN/STABLE]
- Confidence: [UP/DOWN/STABLE]
- Backlog frequency: [UP/DOWN/STABLE]

🎯 Next Month
- Priority: [Description]
- Action: [What we'll do]
- Owner: [Who's responsible]

```

---

## Quick Reference Links

- **For agents:** See `QUICK-REFERENCE.md`
- **For analytics:** See `ANALYTICS.md`
- **For keywords:** See `KEYWORD-GUIDE.md`
- **For monthly process:** This page, "Monthly Tasks"
- **For adding entries:** This page, "Adding New Entries"

---

## Questions?

- **About specific entries:** Check kb-data.json or QUICK-REFERENCE.md
- **About monthly process:** This guide, "Monthly Tasks"
- **About analytics:** ANALYTICS.md
- **About escalations:** Ask KB manager or product lead

Last updated: 2026-02-22
