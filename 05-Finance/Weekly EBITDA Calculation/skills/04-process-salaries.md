# 04 — Process Salaries

## Objective

Combine payroll (bank-paid) and cash salary data, allocate each employee to their spa, and compute total salary cost per spa.

## Required Inputs

- Data from `Raw - Payroll` tab (ingested in Skill 01)
- Data from `Raw - Cash Salaries` tab (ingested in Skill 01)
- Data from `Raw - Aesthetics Data` tab (for Aesthetics staff costs)
- `knowledge/spa-locations.md` — employee-to-spa mapping reference
- `config/spa-list.json` — active spas

## Execution Steps

### Step 1: Process Payroll Data

From `Raw - Payroll` tab:
1. For each employee: read salary amount and spa/department assignment
2. Map department names to spa names (handle variations like "Hugo" → "Hugos", "Inter" → "InterContinental")
3. Corporate/Centre employees: track separately as overhead
4. Sum per-spa payroll totals

### Step 2: Process Cash Salaries

From `Raw - Cash Salaries` tab:
1. For each employee: read cash amount and spa/department assignment
2. Map department names to spa names
3. Handle known variations:
   - "Riveira/Labranda" → Labranda
   - "Hugo" → Hugos
   - "Centre" / "Center" → Corporate
4. Note part-time/rotational staff (may not appear every month)
5. Sum per-spa cash totals

### Step 3: Combine Totals

For each spa:
- `Total Salary = Payroll (bank) + Cash`
- Track separately: payroll component + cash component (for audit trail)

### Step 4: Process Aesthetics Salaries

From `Raw - Aesthetics Data`:
1. Read Doctor Payouts (variable, per-procedure)
2. Read Staff Salaries (named employees like Leticia, Adrianne)
3. Keep Doctor Payouts separate from Staff Salaries (different line items in EBITDA)

### Step 5: Process Slimming Salaries

If Slimming salary data exists:
1. Read staff costs
2. Read doctor payouts if applicable

### Step 6: Report

Present salary breakdown:

| Spa | Payroll (Bank) | Cash | Total Salary |
|-----|----------------|------|--------------|
| InterContinental | [value] | [value] | [value] |
| Hugos | [value] | [value] | [value] |
| Hyatt | [value] | [value] | [value] |
| Ramla | [value] | [value] | [value] |
| Labranda | [value] | [value] | [value] |
| Sunny Coast | [value] | [value] | [value] |
| Excelsior | [value] | [value] | [value] |
| Novotel | [value] | [value] | [value] |
| Corporate (Centre) | [value] | [value] | [value] |
| **Spa Total** | **[value]** | **[value]** | **[value]** |
| Aesthetics - Staff | | | [value] |
| Aesthetics - Doctor Payouts | | | [value] |
| Slimming - Staff | | | [value] |

## Known Quirks

- Employee IDs may change across months
- Part-time rotational staff (e.g., Kemi, Ihebeddin) may not appear every month — this is normal, not an error
- Department name variations are common — always normalize to spa names in `config/spa-list.json`
- Historical issue: Nov-Dec 2024 had salary check discrepancies

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
