# 14 — Calculate Utilities

## Objective

Determine utilities expense per spa location using Zoho Books data, calculate monthly and weekly distribution, and write to the Utilities line in each P&L tab.

## Required Inputs

- Zoho Books MCP (organization: `20071987640`, EU region)
- Output spreadsheet: `1WWM7W6S5wtSC-5hdlcuJgW3zbYaO7YRgg4_-Bju4-5s`
- `knowledge/zoho-cost-reference.md` — Zoho account codes

## Execution Steps

### Step 1: Identify Utility Accounts in Zoho

Using Zoho Books MCP, search for utility-related expense accounts:
- Electricity
- Water
- Gas (if applicable)
- Common Zoho account codes: typically under Operating Expenses

### Step 2: Pull Utility Data

For each spa, determine monthly utility costs:
1. Pull transactions from utility account(s) for the past 3-6 months
2. Calculate average monthly cost per location
3. If Zoho Books MCP is unavailable, check the `Raw - Fixed Costs` tab

### Step 3: Calculate Weekly Utilities

Weekly utilities = Monthly average / 4.33

**Note:** Utilities may vary seasonally (higher in summer for AC). Use a rolling 3-month average for better accuracy, or use actual monthly data if available.

### Step 4: Write to Output Tabs

Write weekly utilities to the "Utilities" row in each section:

| Spa | Target Range |
|-----|-------------|
| INTER | `Spa Detail!B8:M8` |
| HUGOS | `Spa Detail!B19:M19` |
| HYATT | `Spa Detail!B30:M30` |
| RAMLA | `Spa Detail!B41:M41` |
| LABRANDA | `Spa Detail!B52:M52` |
| ODYCY | `Spa Detail!B63:M63` |
| NOVOTEL | `Spa Detail!B74:M74` |
| EXCELSIOR | `Spa Detail!B85:M85` |
| COMPANY WIDE | `Spa Detail!B96:M96` |
| Aesthetics | `Aesthetics P&L!B8:M8` |
| Slimming | `Slimming P&L!B8:G8` |

Also write Company Wide total to: `EBITDA Summary!B8:M8`

### Step 5: Verify

Compare monthly totals against Zoho Books utility expense totals.

## Allocation Notes

- Hotel-based spas may have utilities included in rent/management fee — in that case, utility line is zero for those locations
- Standalone locations (if any) will have direct utility bills
- Aesthetics clinic utility costs are separate from spa utilities
- Slimming clinic may share utilities with Aesthetics

## Known Quirks

- Malta electricity rates vary by consumption tier
- Summer months typically have higher utility costs (air conditioning)
- Some locations may have utilities billed quarterly — normalize to monthly

## Known Issues & Learnings

_No issues logged yet._
