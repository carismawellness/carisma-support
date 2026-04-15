# 13 — Calculate Rent

## Objective

Determine rent expense per spa location using Zoho Books data, calculate monthly and weekly distribution, and write to the Rent line in each P&L tab.

## Required Inputs

- Zoho Books MCP (organization: `20071987640`, EU region)
- Output spreadsheet: `1WWM7W6S5wtSC-5hdlcuJgW3zbYaO7YRgg4_-Bju4-5s`
- `knowledge/zoho-cost-reference.md` — Zoho account codes

## Execution Steps

### Step 1: Identify Rent Accounts in Zoho

Using Zoho Books MCP, search for rent-related expense accounts:
- Look for accounts with "Rent" in the name under Expenses category
- Common Zoho account codes for rent: 600000-series
- Each spa location should have a separate rent charge or the rent may be allocated from a single account

### Step 2: Pull Annual Rent Data

For each spa, determine the annual rent:
1. Pull transactions from rent account(s) for the past 12 months
2. Or read the most recent annual rent agreement amounts
3. If Zoho Books MCP is unavailable, check for rent data in:
   - The `Raw - Fixed Costs` tab in the output spreadsheet
   - Any existing rent schedules in Google Drive

### Step 3: Calculate Monthly Rent

Monthly rent = Annual rent / 12

Rent is typically fixed per month per location.

### Step 4: Calculate Weekly Rent

Weekly rent = Monthly rent / 4.33

Apply the same weekly amount across all reporting weeks.

### Step 5: Write to Output Tabs

Write weekly rent to the "Rent" row in each section:

| Spa | Target Range |
|-----|-------------|
| INTER | `Spa Detail!B7:M7` |
| HUGOS | `Spa Detail!B18:M18` |
| HYATT | `Spa Detail!B29:M29` |
| RAMLA | `Spa Detail!B40:M40` |
| LABRANDA | `Spa Detail!B51:M51` |
| ODYCY | `Spa Detail!B62:M62` |
| NOVOTEL | `Spa Detail!B73:M73` |
| EXCELSIOR | `Spa Detail!B84:M84` |
| COMPANY WIDE | `Spa Detail!B95:M95` |
| Aesthetics | `Aesthetics P&L!B7:M7` |
| Slimming | `Slimming P&L!B7:G7` |

Also write Company Wide total to: `EBITDA Summary!B7:M7`

### Step 6: Verify

Cross-check monthly rent totals against Zoho Books P&L rent line.

## Allocation Notes

- Some spas operate within hotels — rent may be structured as revenue share or fixed fee
- Aesthetics and Slimming may share a location — allocate rent based on space usage or agreement
- Corporate HQ rent (if any) goes to Corporate overhead, not individual spas
- If rent varies by season, use the actual monthly amount rather than annualized average

## Known Quirks

- Hotel-based spas (Inter, Hugos, Hyatt, Ramla, Labranda, Odycy, Novotel, Excelsior) may have rent structured as management fees or revenue shares
- Some rent may be bundled with utilities in hotel agreements
- Excelsior rent started mid-2025 (new location)

## Known Issues & Learnings

_No issues logged yet._
