# 06 — Calculate EBITDA

## Objective

Calculate EBITDA per spa, per business unit, and group total. Present summary for user approval. After approval, write results to Google Sheet output tabs.

## Required Inputs

- Per-spa Gross Profit from Skill 03
- Per-spa Salaries from Skill 04
- Per-spa SG&A + Proportional Fixed Costs from Skill 05
- `config/rent-schedule.json` — fixed rent amounts
- `config/spa-list.json` — active spas and other units
- `knowledge/ebitda-structure.md` — formula definitions

## Execution Steps

### Step 1: Read Rent Schedule

Read `config/rent-schedule.json` for current rent per spa.

### Step 2: Calculate Per-Spa EBITDA

For each spa:
```
EBITDA = Gross Profit - Salaries - SG&A - Proportional Fixed Costs - Rent
```

Where:
- Gross Profit = from Skill 03
- Salaries = from Skill 04 (payroll + cash)
- SG&A = from Skill 05 (allocated amount)
- Proportional Fixed Costs = from Skill 05 (allocated amount)
- Rent = from `config/rent-schedule.json`

Calculate `EBITDA % = EBITDA / Revenue`

### Step 3: Calculate Spa Totals

1. **Spa Total EBITDA** = sum of all 8 spas + Corporate
2. **EBITDA Excluding Center** = Spa Total minus Corporate overhead
   - This variant strips out HQ costs to show operational spa performance
3. Calculate EBITDA % for both variants

### Step 4: Calculate Aesthetics EBITDA

```
Aesthetics EBITDA = Gross Profit - Doctor Payouts - Staff Salaries - SG&A
```

Calculate EBITDA %

### Step 5: Calculate Slimming EBITDA

If Slimming data exists for this period:
```
Slimming EBITDA = Gross Profit - Staff Salaries - SG&A
```
(Include Doctor Payouts if applicable)

### Step 6: Get Velvet EBITDA

Read Velvet data for this period. If dormant, use €0.

### Step 7: Calculate Group Total

```
Group EBITDA = Spa Total EBITDA + Aesthetics EBITDA + Slimming EBITDA + Velvet EBITDA
```

Calculate Group EBITDA %

### Step 8: APPROVAL GATE

Present summary to user. Format each line like the current EBITDA sheet: "10,388    20%"

```
=== EBITDA Summary — [Period] ===

Spa Level EBITDA:
  Inter:          [amount]    [%]
  Hugos:          [amount]    [%]
  Hyatt:          [amount]    [%]
  Ramla:          [amount]    [%]
  Labranda:       [amount]    [%]
  Sunny Coast:    [amount]    [%]
  Excelsior:      [amount]    [%]
  Novotel:        [amount]    [%]
  Corporate:      [amount]    0%
  ─────────────────────────────
  Spa Total:      [amount]    [%]
  Excl. Center:   [amount]    [%]

Aesthetics:       [amount]    [%]
Slimming:         [amount]    [%]
Velvet:           [amount]    [%]

═══════════════════════════════
GROUP TOTAL:      [amount]    [%]
```

If previous month data is available, also show month-over-month change.

Flag any anomalies:
- Negative EBITDA for any spa (highlight)
- EBITDA % below 10% or above 80% (unusual)
- Significant month-over-month swings (>20 percentage points)

**WAIT FOR USER APPROVAL before proceeding to write output.**

### Step 9: Write Output (After Approval)

Write to Google Sheet output tabs using Google Sheets MCP `sheets_update_values`:

**EBITDA Summary tab:**
- Row per spa/unit, columns: spa name, EBITDA amount, EBITDA %
- Section headers: "Spa level EBITDA", "Aesthetics level EBITDA", "Velvet EBITDA", "TOTAL - Group"
- Match the layout of the reference workbook EBITDA sheet

**Spa P&L tab:**
- Rows: Revenue, Cost, Gross Profit, Gross %, Salaries, SG&A, Rent, Proportional Fixed Costs, EBITDA, EBITDA %
- One column per period (accumulates over time)

**Spa Detail tab:**
- One section per spa
- Each section: Revenue (Service/Product), COGS (by product line), Gross Profit, Gross %, Salaries, SG&A, Rent, EBITDA, EBITDA %

**Aesthetics P&L tab:**
- Revenue, COGS, Gross Profit, Gross %, Doctor Payouts, Salaries, SG&A, EBITDA, EBITDA %
- Separate section for Slimming if applicable

## Known Quirks

- Corporate EBITDA is always negative (it's overhead)
- "EBITDA Excluding Center" is the metric most useful for evaluating spa operations
- Velvet may be €0 for extended periods — this is expected

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
