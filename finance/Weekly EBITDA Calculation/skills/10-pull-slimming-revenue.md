# 10 — Pull Slimming Revenue

## Objective

Extract weekly slimming revenue from the Slimming Sales transaction sheet, aggregate by week (Mon-Sun), and write to the Slimming P&L output tab.

## Required Inputs

- Slimming Sales sheet: `1j6tz8k8TRSulB35Sg4X1xSlcV_JLf-8QKx-32UUkoBc`
- Output spreadsheet: `1WWM7W6S5wtSC-5hdlcuJgW3zbYaO7YRgg4_-Bju4-5s`
- `config/sheet-mapping.json` — column mapping

## Execution Steps

### Step 1: Identify Monthly Tabs

Tab naming pattern: `Sales {Month}` (e.g., "Sales March", "Sales February")

For 2026, slimming started in February 2026.

### Step 2: Read Transaction Data

Key columns (from `sheet-mapping.json`):
| Column | Data |
|--------|------|
| A | Date |
| B | Client |
| C | Weight loss |
| D | Treatments |
| E | Medical consultation |
| F | Products |
| G | Full price (list price) |
| H | Paid (actual revenue) |
| I | Sale of |
| J | Commission |

**Revenue column is H (Paid)** — use this for actual revenue received, NOT column G (full price before payment plans).
**Date column is A.**

### Step 3: Parse Dates and Group by Week

Assign each transaction to a Monday-start week. Dates should be in standard format.

### Step 4: Aggregate Weekly Revenue

Sum column H (Paid) for each week. Skip blank rows.

### Step 5: Write to Slimming P&L Tab

Write weekly totals to: `Slimming P&L!B4:G4` (Net Revenue row)

Slimming P&L starts at 16-02-2026:
- B = 16-02-2026, C = 23-02-2026, D = 02-03-2026, E = 09-03-2026, F = 16-03-2026, G = 23-03-2026

Also write to EBITDA Summary: `EBITDA Summary!B20:M20` (full 12-week range, zeros for pre-Feb weeks)

### Step 6: Verify

Check that weekly totals roughly match the Growth sheet's slimming sales KPI data.

## Known Quirks

- Slimming business started February 2026 — no data before that
- Use "Paid" (H) not "Full price" (G) — some clients are on payment plans
- The Slimming P&L tab has fewer columns (starts 16-02) vs Spa Detail (starts 05-01)

## Known Issues & Learnings

_No issues logged yet._
