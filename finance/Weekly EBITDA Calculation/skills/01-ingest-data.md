# 01 — Ingest Data

## Objective

Read all raw input tabs from the Google Sheet and validate that the target period has complete data.

## Required Inputs

- `config/sheet-mapping.json` — spreadsheet ID and tab names
- Google Sheets MCP access

## Execution Steps

### Step 1: Read Sheet Mapping

Read `config/sheet-mapping.json` to get:
- `spreadsheet_id`
- All input tab names and their expected column structures

### Step 2: Read Each Input Tab

For each tab in `input_tabs`, use Google Sheets MCP `sheets_read_values` to read the data:

1. `Raw - Zoho Spa P&L` — expect columns: Account, Account Code, Total
2. `Raw - Zoho Aesthetics P&L` — expect columns: Account, Account Code, Total
3. `Raw - Lapis Revenue` — expect columns: Spa, Type, Amount
4. `Raw - Lapis COGS` — expect columns: Spa, Product Line, Amount
5. `Raw - Payroll` — expect columns: Employee, Salary, Spa/Department
6. `Raw - Cash Salaries` — expect columns: Employee ID, Employee Name, Cash Amount, Spa/Department
7. `Raw - SG&A Detail` — expect columns: Description, Amount, Category
8. `Raw - Aesthetics Data` — expect columns: Line Item, Amount
9. `Raw - Fixed Costs` — expect columns: Cost Item, Category, Weekly Amount

### Step 3: Validate Each Tab

For each tab:
- Confirm the tab exists in the spreadsheet
- Confirm it has data (not empty)
- Confirm the column headers match expected structure (allow for minor variations)
- Count data rows
- Identify the target period from the data (look for date columns, period headers)

### Step 4: Report Status

Present a validation report:

| Tab | Status | Rows | Period | Notes |
|-----|--------|------|--------|-------|
| Raw - Zoho Spa P&L | OK | 150 | Feb 2026 | |
| Raw - Lapis Revenue | OK | 24 | Feb 2026 | |
| ... | ... | ... | ... | ... |

### Step 5: Confirm or Stop

- If ALL tabs are valid: confirm and proceed to Skill 02
- If ANY required tab is missing or empty: STOP and tell the user exactly which tab needs data and what format to paste it in (reference `config/sheet-mapping.json` for the expected structure)

## Failure Modes

- Tab doesn't exist → "Please create tab '[name]' in the Google Sheet and paste [source] data"
- Tab is empty → "Tab '[name]' has no data. Please paste [source] export for [period]"
- Wrong columns → "Tab '[name]' has unexpected columns. Expected: [list]. Found: [list]"
- Period mismatch → "Tab '[name]' appears to have data for [found period], not [target period]"

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
