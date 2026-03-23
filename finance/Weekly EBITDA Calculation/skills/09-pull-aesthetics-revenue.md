# 09 — Pull Aesthetics Revenue

## Objective

Extract weekly aesthetics revenue from Leticia's transaction-level sales sheet, aggregate by week (Mon-Sun), and write to the Aesthetics P&L output tab.

## Required Inputs

- Leticia's Aesthetics Sales sheet: `1Mr_aRRbRf3ex--WmUJIqXwko7okCyD82KxBOXWYnW24`
- Output spreadsheet: `1WWM7W6S5wtSC-5hdlcuJgW3zbYaO7YRgg4_-Bju4-5s`
- `config/sheet-mapping.json` — column mapping

## Execution Steps

### Step 1: Identify Monthly Tabs

Tab naming pattern: `Sale {Month} {Year}` or `Sales {Month} {Year}`
- Examples: "Sale January 2026", "Sales February 2026"
- Try both patterns when looking for a month

For YTD 2026, read tabs for January 2026, February 2026, and March 2026.

### Step 2: Read Transaction Data

For each monthly tab, read all rows. Key columns (from `sheet-mapping.json`):
| Column | Data |
|--------|------|
| A | Invoice |
| B | Customer |
| C | Service |
| D | Date of service |
| E | Price (revenue) |
| F | Payment |
| G | Sales staff |

**Revenue column is E (Price).**
**Date column is D (Date of service).**

### Step 3: Parse Dates and Group by Week

Dates may appear in inconsistent formats: D/M/YYYY, DD/MM/YYYY, D/M.
- Parse flexibly — try multiple formats
- Assign each transaction to a Monday-start week
- Week boundaries: Monday 00:00 to Sunday 23:59

### Step 4: Aggregate Weekly Revenue

For each week, sum all Price (column E) values. Skip rows with blank dates or blank prices.

**Important:** Prices may show with `$` symbol but are EUR. Strip currency symbols before summing.

### Step 5: Write to Aesthetics P&L Tab

Write weekly totals to: `Aesthetics P&L!B4:M4` (Net Revenue row)

Column mapping (same as Spa Detail):
- B = 05-01-2026, C = 12-01-2026, ... M = 23-03-2026

Also write to EBITDA Summary: `EBITDA Summary!B15:M15`

### Step 6: Verify

Cross-check YTD total against any known aesthetics revenue figures from the Growth sheet's "Aesthetics sales" row.

## Known Quirks

- Some months have tab name "Sale" (singular), others "Sales" (plural) — check both
- Dollar symbol on EUR prices — parse as numbers, strip `$` and `,`
- Some rows may have dates but no price (consultation-only) — skip these
- Commission columns (I, J) are for tracking, not for revenue calculation
- Retail column (L) is separate from service revenue

## Known Issues & Learnings

_No issues logged yet._
