# 11 — Pull Marketing Expense

## Objective

Extract weekly marketing spend per brand (Spa, Aesthetics, Slimming) from the Weekly KPIs Growth sheet and write to the Advertising & marketing line in each P&L tab.

## Required Inputs

- Weekly KPIs spreadsheet: `1JGlBdii7Zu25yha0zrmi72PPH1BFZRdVeGvcig3r6GE`
- Output spreadsheet: `1WWM7W6S5wtSC-5hdlcuJgW3zbYaO7YRgg4_-Bju4-5s`

## Execution Steps

### Step 1: Identify 2026 Columns in Growth Sheet

The Growth sheet has the same column structure as the Sales tab.
- Read `Growth!DA1:DR2` to find where 2026 starts
- Row 1 shows year markers ("2026" at the boundary)
- Row 2 shows week dates ("5 Jan", "12 Jan", etc.)
- 2026 data starts at approximately column DG

### Step 2: Read SPA Marketing Spend

Row 19 in the Growth sheet: "Marketing spend week"
- Read `Growth!DG19:DR19` for 2026 weekly SPA marketing spend
- This is the total: Google + Meta + Influencer for the SPA brand

Sub-rows for breakdown:
- Row 20: Google spend
- Row 21: Meta spend

### Step 3: Read Aesthetics Marketing Spend

Row 58 in the Growth sheet: "Marketing spend week (500 max)"
- Read `Growth!DG58:DR58` for 2026 weekly Aesthetics marketing spend

Sub-rows:
- Row 59: Google spend
- Row 60: Facebook spend

### Step 4: Read Slimming Marketing Spend

Row 96 in the Growth sheet: "Marketing spend week (500 max)"
- Read `Growth!DG96:DR96` for 2026 weekly Slimming marketing spend

Sub-rows:
- Row 97: Google spend
- Row 98: Facebook spend

**Note:** Slimming marketing started late February 2026 — earlier weeks will be empty/zero.

### Step 5: Clean Values

Growth sheet values use euro symbol and comma separators (e.g., "€1,235").
Strip `€`, `,` and parse as numbers.

### Step 6: Write to Output Tabs

| Brand | Target Range |
|-------|-------------|
| SPA (Company Wide) | `Spa Detail!B94:M94` |
| SPA (Company Wide) | `EBITDA Summary!B6:M6` |
| Aesthetics | `Aesthetics P&L!B6:M6` |
| Slimming | `Slimming P&L!B6:G6` |

**Note:** Marketing is tracked at the brand level, not per individual spa. Write to Company Wide section in Spa Detail. Per-spa allocation of marketing can be done via revenue-weighted distribution if needed.

### Step 7: Verify

Compare written values against the Growth sheet ROAS calculations to ensure consistency.

## Known Quirks

- Growth sheet uses "1 Jan", "8 Jan" date format (without year) — need year from row 1
- Values include `€` symbol that must be stripped
- Aesthetics and Slimming marketing rows are much further down in the Growth sheet (rows 58 and 96 respectively)
- Empty cells = zero spend for that week

## Known Issues & Learnings

_No issues logged yet._
