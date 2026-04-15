# Reconciliation Rules

## Overview

Every EBITDA calculation must end with 4 reconciliation checks. These catch data entry errors, missing transactions, and mismatches between sources. All checks must PASS before the output is finalized.

## Check 1: Revenue

**What:** Total revenue from Zoho P&L vs sum of per-spa Lapis revenues
**Formula:** `|zoho_total_revenue - sum(per_spa_lapis_revenue)| < threshold`
**Threshold:** < €1.00 absolute variance (near-zero, allows for floating point)
**If FAIL:**
- Most common cause: missing a spa's revenue data in Lapis export
- Check if any new revenue lines were added in Zoho that aren't captured in Lapis
- Check Sales Discounts and Sales Refunds — they must be included in both totals
- Check Wholesale Product (Centre) — may be in Zoho but not in per-spa Lapis data

## Check 2: Salaries

**What:** Total calculated salary (payroll + cash) vs salary line from Zoho P&L
**Formula:** `|calculated_salary_total - zoho_pl_salary_line| < threshold`
**Threshold:** < €1.00
**If FAIL:**
- Check if any cash salary employees were missed
- Check if payroll data matches the correct period
- Historical issue: Nov-Dec 2024 had salary check failures (see EBITDA sheet row B22)

## Check 3: SG&A

**What:** Sum of allocated SG&A across all spas vs total SG&A from Zoho P&L
**Formula:** `|sum(per_spa_allocated_sga) - zoho_pl_sga_total| < threshold`
**Threshold:** < €1.00
**If FAIL:**
- Check if all SG&A categories are accounted for in the allocation
- Verify pool totals sum to the source total
- Check for uncategorized expenses that fell outside the 3 pools + direct allocations

## Check 4: Rent

**What:** Expected rent (from config) vs actual rent in Zoho P&L
**Formula:** `|config_total_rent - zoho_pl_rent_line| == 0`
**Threshold:** Exact match
**If FAIL:**
- Rent changed and config wasn't updated — update `config/rent-schedule.json`
- New rent line was added in Zoho
- A rent payment was missed or duplicated

## Cross-Check: Revenue Detail

Additionally, the "Revenue Check" from the EBITDA sheet compares the total P&L revenue against the sum of each spa-level P&L revenue. This is a different check from Check 1 — it verifies internal consistency within the per-spa P&L breakdowns. Variance should be near-zero (floating point only).

## Output Format

Write results to the `Reconciliation` output tab:

| Check | Status | Expected | Actual | Variance | Notes |
|-------|--------|----------|--------|----------|-------|
| Revenue | PASS/FAIL | [value] | [value] | [diff] | [investigation notes if FAIL] |
| Salaries | PASS/FAIL | [value] | [value] | [diff] | |
| SG&A | PASS/FAIL | [value] | [value] | [diff] | |
| Rent | PASS/FAIL | [value] | [value] | [diff] | |
