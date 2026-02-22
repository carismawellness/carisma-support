# Knowledge Base Analytics Dashboard

## Overview

The analytics dashboard provides real-time visibility into KB health, coverage, and maintenance status. Use it weekly to spot trends and quarterly for strategic planning.

---

## Running the Dashboard

### Command
```bash
python3 tools/kb_analytics.py
```

### Output Sections

The dashboard displays six key metrics:

### 1. Content Health
**What it measures:** Structure and completeness of the KB

- **Total entries** — Raw KB size
- **Tier distribution** — Are critical FAQs prioritized? (Target: 30%+ Tier 1)
- **Status distribution** — Breakdown by ACTIVE, REVIEW_NEEDED, ARCHIVED
- **Average confidence** — Overall answer currency (Target: ≥80%)
- **Brand coverage** — Distribution across SPA, AES, SLIM (Target: balanced)
- **Top sections** — Where most entries live (should align with support volume)

**What's good:**
- ✅ 8+ Tier 1 entries (critical for support agents)
- ✅ 30%+ of entries in Tier 1
- ✅ All brands have balanced coverage
- ✅ Confidence levels ≥90% for Tier 1

**What's concerning:**
- 🔴 <5 Tier 1 entries (gaps in critical knowledge)
- 🔴 <50% confidence on Tier 1 (answers unreliable)
- 🔴 One brand severely underrepresented (coverage gap)

---

### 2. Verification Status
**What it measures:** How current is the KB?

- **Recently reviewed (≤7 days)** — Fresh, current entries
- **Moderately old (8-30 days)** — Still recent, no action needed
- **Needs review (31-60 days)** — Schedule weekly maintenance
- **Urgent review (>60 days)** — Critical: Flag immediately

**Example:**
```
Recently reviewed (≤ 7 days):  6 (60.0%)
Moderately old (8-30 days):    2
Needs review (31-60 days):     1 (10.0%)
Urgent review (> 60 days):     1 (10.0%)
```

**Action thresholds:**
- **Green** — 80%+ recently reviewed, <5% urgent
- **Yellow** — 60-80% recently reviewed, 5-10% urgent
- **Red** — <60% recently reviewed OR >10% urgent → Schedule deep review

---

### 3. Confidence Analysis
**What it measures:** How reliable are KB answers?

- **High confidence (≥90%)** — Verified, accurate, ready to cite directly
- **Medium (75-89%)** — Generally accurate, minor update recommended
- **Low confidence (<75%)** — Outdated or uncertain, needs immediate review

**Example:**
```
High confidence (≥90%):   6 (60%)
Medium confidence (75-89%): 3 (30%)
Low confidence (<75%):    1 (10%)
```

**Low-confidence entries flagged with:**
- QID (e.g., S3.2)
- Tier (1-4, higher = more critical)
- Current confidence level

**Action:** Review entries marked <75% within the week. For Tier 1 entries, review within 2 days.

---

### 4. Entry Ownership
**What it measures:** Who owns which entries?

Lists entry count per owner/KB manager.

**What's good:**
- ✅ 4-6 different owners (team distribution)
- ✅ No single person owns >40% of entries (prevents knowledge silos)
- ✅ All Tier 1 entries have assigned owners

**What's concerning:**
- 🔴 1-2 owners (bottleneck if they're unavailable)
- 🔴 >50% owned by one person (single point of failure)
- 🔴 Unassigned entries (responsibility gap)

---

### 5. Recommendations
**What it suggests:** Prioritized action items

The dashboard automatically flags issues ranked by severity:

| Status | Action | Timeline |
|--------|--------|----------|
| ✅ | No action needed | — |
| ⚠️ Tier 1 count low | Add 2-3 critical FAQs | This month |
| ⚠️ Low confidence | Review/update answers | This week |
| ⚠️ Entries >60 days old | Deep review | This week |
| ⚠️ >20% unreviewed 31-60 days | Monthly maintenance | Next review |

---

### 6. Overall Health Score
**What it measures:** Combined KB quality on 0-100 scale

Calculated from five factors:

1. **Tier 1 coverage (20 points)** — Do we have enough critical FAQs?
2. **Confidence level (20 points)** — How current are answers?
3. **Recent reviews (20 points)** — Are entries up-to-date?
4. **Low-confidence entries (20 points)** — How many need work?
5. **Multiple owners (20 points)** — Is knowledge distributed?

**Score interpretation:**
- **85-100** — ✅ EXCELLENT. Continue monthly maintenance.
- **70-84** — 🟡 GOOD. Minor improvements recommended.
- **50-69** — 🟠 FAIR. Schedule comprehensive review.
- **<50** — 🔴 POOR. Urgent KB maintenance needed.

---

## Monthly Maintenance Workflow

### Week 1: Run Analytics
```bash
python3 tools/kb_analytics.py
```

**Review:**
- Any entries marked ⚠️ URGENT?
- Confidence trending up or down?
- Any owners overwhelmed (>30% of entries)?

### Week 2: Address Flags
- **Entries >60 days old:** Review + update + document
- **Low confidence entries:** Verify accuracy, update if needed
- **Missing ownership:** Assign unowned entries

### Week 3: Verify Tier 1
- Spot-check all Tier 1 entries (should take 15 min)
- Confirm accuracy with current operations
- Update verified_date, last_reviewed if OK

### Week 4: Plan Improvements
- Were there recurring question patterns this month?
- Any new entries ready to promote from backlog?
- Should any entries move to different tiers?

---

## Interpreting Specific Metrics

### Tier Distribution
**Target:** At least 30% Tier 1 (critical), rest balanced across 2-4

```
Current:  T1=8 (40%), T2=4 (20%), T3=5 (25%), T4=3 (15%) ✅ GOOD
Concern:  T1=2 (10%), T2=3 (15%), T3=8 (40%), T4=7 (35%) 🔴 Too bottom-heavy
```

Why it matters:
- Tier 1 entries = answers agents MUST have memorized
- Too many Tier 3-4 = agents spend time searching instead of resolving quickly

### Status Distribution
**Expected:**
- ACTIVE: 85-95% (main KB content)
- REVIEW_NEEDED: 0-5% (recent updates, awaiting verification)
- ARCHIVED: 5-10% (outdated, kept for reference)

```
ACTIVE:         9 (90%) ✅
REVIEW_NEEDED:  1 (10%) 🟡 (needs verification soon)
ARCHIVED:       0 (0%)  ✅
```

### Confidence Trending
**Track month-to-month:**

```
Month 1: 82%
Month 2: 85% ✅ Trending up
Month 3: 84% 🟡 Slight dip, investigate why
```

If trending down:
- Are entries becoming outdated?
- Did policies change without KB updates?
- Are owners being rushed through reviews?

### Brand Coverage
**Each brand should be roughly balanced:**

```
SPA:  28 entries ✅
AES:  26 entries ✅
SLIM: 25 entries ✅
(+ shared ALL entries)
```

Imbalance suggests:
- 🔴 One brand has different support needs
- 🔴 One brand's KB was recently updated or neglected
- Action: Investigate and rebalance

---

## Quarterly Deep Dive

Every 3 months, use analytics to assess KB strategy:

### Questions to Ask
1. **Is Tier 1 right-sized?** Do agents cite Tier 1 entries most?
2. **Is brand coverage aligned with demand?** Which brand gets most inquiries?
3. **Are sections organized logically?** Should we split/merge sections?
4. **Are confidence levels accurate?** Do agents trust low-confidence entries?
5. **Is ownership distributed well?** Should we reassign to balance load?

### Data to Collect
- Support volume by section (from support logs)
- Agent satisfaction with KB (survey or feedback)
- Time agents spend searching (proxy: response times)
- Customer satisfaction with responses (from feedback)

### Example Findings
**Finding:** Tier 1 "Booking & Scheduling" gets 40% of support inquiries.
**Action:** Split into two Tier 1 entries (online booking vs. phone/in-person).

**Finding:** Brand coverage is SLIM=15, SPA=20, AES=10.
**Action:** AES entries too few. Build 5 new Tier 2 entries for Aesthetics.

---

## Commands & Integration

### Standalone
```bash
# Run dashboard and save output to file
python3 tools/kb_analytics.py > kb-health-report.txt
```

### In Scripts
```bash
# Check KB health before running support system
health=$(python3 tools/kb_analytics.py | grep "Overall KB Health Score")
if [[ ! $health =~ "85|90|95|100" ]]; then
  echo "⚠️  KB health is below 85. Run monthly maintenance."
fi
```

### In CI/CD
```yaml
# GitHub Actions example
- name: Check KB Health
  run: python3 tools/kb_analytics.py
  # Fails if health score < 70
```

---

## Files Referenced

- **Master KB:** `CRM/knowledge-base/kb-data.json`
- **Brand KBs:** `CRM/CRM-{BRAND}/knowledge/kb-{brand}.json`
- **Monthly log:** `CRM/knowledge-base/KB-AUDIT-LOG.md`
- **Backlog:** `CRM/knowledge-base/.backlog.json`

---

## Maintenance Schedule

| Frequency | Task | Owner | Time |
|-----------|------|-------|------|
| Daily | Capture Q&As not in KB | Support team | 5 min |
| Weekly | Quick health check | KB manager | 5 min |
| Monthly | Full maintenance cycle | KB manager | 30 min |
| Quarterly | Deep strategic review | Product + CRM | 2 hrs |
| Annually | Complete audit & reorganization | All teams | 4 hrs |

---

## Troubleshooting

### Dashboard crashes with JSON error
- Check `kb-data.json` is valid JSON (use online validator)
- Ensure `last_reviewed` dates are ISO format (YYYY-MM-DD)

### Confidence levels always show 75%
- Entries missing `confidence_level` field get default of 75
- Update entries with explicit confidence values

### Brand coverage shows duplicates
- "ALL" brand entries are counted per individual brand
- This is correct — agents on all brands should see them

### Health score jumped 20 points
- Common causes: mass verification (last_reviewed updated), new entries added
- Check git log for recent KB changes

---

## Success Criteria

✅ Analytics run without errors
✅ All metrics display correctly
✅ Dashboard identifies high-priority issues
✅ Recommendations are actionable
✅ Health score correlates with actual support quality
