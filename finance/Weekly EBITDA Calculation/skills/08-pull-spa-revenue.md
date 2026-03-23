# 08 — Pull Spa Revenue

## Objective

Extract weekly spa revenue (ex VAT) per location from the Weekly KPIs spreadsheet and write to the Spa Detail output tab.

## Required Inputs

- Weekly KPIs spreadsheet: `1JGlBdii7Zu25yha0zrmi72PPH1BFZRdVeGvcig3r6GE`
- Output spreadsheet: `1WWM7W6S5wtSC-5hdlcuJgW3zbYaO7YRgg4_-Bju4-5s`
- `config/sheet-mapping.json` — source sheet references

## Execution Steps

### Step 1: Identify 2026 Column Range

Read the Sales tab header row (row 2) to find week date columns. The data starts at column D.
- 2024 data starts at column D (~52 weeks)
- 2025 data continues (~52 more weeks)
- 2026 data starts approximately at column DD (week 05-01-2026)

Read `Sales!DD2:DR2` to confirm 2026 week dates. Look for the year change marker in row 1.

### Step 2: Read Per-Spa Revenue Data

From the Sales tab, the spa sales section is defined in `sheet-mapping.json`:
- Header row: 44 ("Sales - from guest sales report (Services & Packages)")
- Company Wide: row 45
- Per-spa rows:
  | Spa | Row |
  |-----|-----|
  | Inter | 46 |
  | Hugos | 47 |
  | Hyatt | 48 |
  | Ramla | 49 |
  | Labranda | 50 |
  | Odycy | 51 |
  | Novotel | 52 |
  | Excelsior | 53 |

Read `Sales!DD45:DR53` for all 2026 per-spa revenue data.

**Note:** These values are already ex VAT and weekly-aggregated.

### Step 3: Write to Spa Detail Tab

Write each spa's revenue to the Net Revenue row in the Spa Detail tab:

| Spa | Target Range |
|-----|-------------|
| INTER | `Spa Detail!B4:M4` |
| HUGOS | `Spa Detail!B15:M15` |
| HYATT | `Spa Detail!B26:M26` |
| RAMLA | `Spa Detail!B37:M37` |
| LABRANDA | `Spa Detail!B48:M48` |
| ODYCY | `Spa Detail!B59:M59` |
| NOVOTEL | `Spa Detail!B70:M70` |
| EXCELSIOR | `Spa Detail!B81:M81` |
| COMPANY WIDE | `Spa Detail!B92:M92` |

Also write Company Wide revenue to EBITDA Summary: `EBITDA Summary!B4:M4`

### Step 4: Verify

Spot-check: Sum per-spa values for any week and verify they equal the Company Wide total for that week.

## Spa Detail Tab Column Layout

Row 1 contains week headers (DD-MM-YYYY format):
- B = 05-01-2026, C = 12-01-2026, D = 19-01-2026, E = 26-01-2026
- F = 02-02-2026, G = 09-02-2026, H = 16-02-2026, I = 23-02-2026
- J = 02-03-2026, K = 09-03-2026, L = 16-03-2026, M = 23-03-2026

Each spa section repeats every 11 rows: Header, Net Revenue, Wages, Advertising, Rent, Utilities, COGS, SG&A, OPEX, EBITDA, blank.

## Known Quirks

- KPIs uses short names (Inter, Hugos, Hyatt, Ramla, Labranda, Odycy, Novotel, Excelsior) — map to EBITDA tab's uppercase names
- Novotel data starts mid-2025 (earlier weeks are 0)
- Excelsior data starts mid-2025
- Week dates use DD-MM-YYYY in KPIs but may show as D-MMM or other formats

## Known Issues & Learnings

_No issues logged yet._
