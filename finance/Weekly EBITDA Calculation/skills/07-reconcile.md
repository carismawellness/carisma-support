# 07 — Reconcile

## Objective

Run all reconciliation checks to verify data consistency. Flag any discrepancies. Write reconciliation results to the Google Sheet.

## Required Inputs

- All calculated values from Skills 02-06
- Data from `Raw - Zoho Spa P&L` tab (source totals)
- `config/rent-schedule.json` — expected rent
- `knowledge/reconciliation-rules.md` — check definitions and thresholds

## Execution Steps

### Step 1: Read Reconciliation Rules

Read `knowledge/reconciliation-rules.md` for check definitions and thresholds.

### Step 2: Revenue Check

Compare total Spa revenue (calculated in Skill 02) against Zoho P&L total operating income.

- **Expected:** Sum of per-spa revenues from Lapis
- **Actual:** Total operating income from `Raw - Zoho Spa P&L`
- **Threshold:** < €1.00 absolute variance
- **Result:** PASS or FAIL

If FAIL: Note the variance and suggest investigation — likely causes: missing spa data, uncaptured revenue line, discount/refund mismatch.

### Step 3: Salaries Check

Compare total calculated salary (payroll + cash from Skill 04) against the salary line from Zoho P&L.

- **Expected:** Sum of per-spa salaries (payroll + cash)
- **Actual:** Salary line from `Raw - Zoho Spa P&L`
- **Threshold:** < €1.00
- **Result:** PASS or FAIL

If FAIL: Check for missing cash salary entries, payroll period mismatch, or new employees not captured.

### Step 4: SG&A Check

Compare sum of allocated SG&A (from Skill 05) against total SG&A from Zoho P&L.

- **Expected:** Sum of all per-spa SG&A allocations
- **Actual:** SG&A line from `Raw - Zoho Spa P&L`
- **Threshold:** < €1.00
- **Result:** PASS or FAIL

If FAIL: Check for uncategorized SG&A items, pool total mismatch, or missing direct allocations.

### Step 5: Rent Check

Compare expected rent (from config) against actual rent in Zoho P&L.

- **Expected:** `total_rent` from `config/rent-schedule.json`
- **Actual:** Rent line from `Raw - Zoho Spa P&L`
- **Threshold:** Exact match (€0.00 variance)
- **Result:** PASS or FAIL

If FAIL: Rent likely changed — update `config/rent-schedule.json` with new amount and add to history.

### Step 6: Write Reconciliation Results

Write to the `Reconciliation` output tab:

| Check | Status | Expected | Actual | Variance | Notes |
|-------|--------|----------|--------|----------|-------|
| Revenue | PASS/FAIL | [value] | [value] | [diff] | [notes] |
| Salaries | PASS/FAIL | [value] | [value] | [diff] | [notes] |
| SG&A | PASS/FAIL | [value] | [value] | [diff] | [notes] |
| Rent | PASS/FAIL | [value] | [value] | [diff] | [notes] |

### Step 7: Report

Present reconciliation summary:
- Number of checks: 4
- Passed: [count]
- Failed: [count]
- For each failed check: specific variance and recommended action

If all 4 PASS: "All reconciliation checks passed. EBITDA output is verified."
If any FAIL: "WARNING: [count] reconciliation check(s) failed. Review flagged items before finalizing."

## Known Quirks

- Floating-point precision can cause tiny variances (< €0.01) — these are PASS
- Historical data shows some months had legitimate check failures (e.g., Nov-Dec 2024 salary discrepancy)

---

## Known Issues & Learnings

> Updated when this skill encounters failures, edge cases, or better methods.
> Always check this section before executing the skill.
> Log full context in `miscellaneous/learnings/LEARNINGS.md` under Skill Learnings.

<!--
Entry format:
### [YYYY-MM-DD] — [Issue Title]
**What happened:** Brief description
**Root cause:** Why it happened
**Fix:** What was changed
**Rule:** ALWAYS/NEVER directive (also added to root CLAUDE.md if universal)
-->

_No issues logged yet._
