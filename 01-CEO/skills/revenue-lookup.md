# /ceo:revenue-lookup

Pull actual revenue figures and compare against 2026 budget targets.

## Syntax

/ceo:revenue-lookup --period [month] [--unit spa|aesthetics|slimming|group] [--compare-budget]

## Parameters

- --period (required) — Month to pull (e.g. "jan", "feb", "march-2026")
- --unit (optional) — Business unit filter. Default: all
- --compare-budget (optional) — Show variance against Budget 2026 targets

## Data Sources

### Budget Targets

| Field | Value |
|---|---|
| Spreadsheet | `1JGlBdii7Zu25yha0zrmi72PPH1BFZRdVeGvcig3r6GE` (Weekly KPIs) |
| Tab | `Budget 2026` |
| Budget rows | 6-14 (hotels), 15 (SPA TOTAL), 17 (Aesthetics), 18 (Slimming), 20 (GROUP TOTAL) |
| Actuals rows | 25-33 (hotels), 34 (SPA TOTAL), 36 (Aesthetics), 37 (Slimming), 39 (GROUP TOTAL) |
| Variance rows | 44-52 (hotels), 53 (SPA TOTAL), 55 (Aesthetics), 56 (Slimming), 58 (GROUP TOTAL) |
| Columns | A=Label, B=Jan, C=Feb, D=Mar, E=Apr, F=May, G=Jun, H=Jul, I=Aug, J=Sep, K=Oct, L=Nov, M=Dec, N=TOTAL |
| Annual target | **EUR 5,000,000** |

### Spa Actuals (Primary Source)

| Field | Value |
|---|---|
| Spreadsheet | `1JGlBdii7Zu25yha0zrmi72PPH1BFZRdVeGvcig3r6GE` (Weekly KPIs) |
| Tab | `YTD` |
| Total row | Row 6: "Company Wide - ex VAT" |
| Hotel rows | 7=Inter, 8=Hugos, 9=Hyatt, 10=Ramla, 11=Labranda (Riviera), 12=Odycy (Sunny Coast), 13=Excelsior, 14=Novotel |
| Columns | B=January, C=February, D=March, E=April, ... |
| Currency | EUR, **ex-VAT** (from Fresha booking system, services & packages only) |

**Hotel name mapping (YTD tab -> Budget tab):**
- "Inter" -> InterContinental
- "Labranda" -> Riviera
- "Odycy" -> Sunny Coast

**Important:** YTD tab figures are ex-VAT from Fresha. Budget was built from Salary Master Sheet (gross, all revenue). Expect ~45% gap between YTD and budget figures. For like-for-like comparison, use YTD data consistently.

### Spa Actuals (Secondary Source — Salary Master Sheet)

| Field | Value |
|---|---|
| Spreadsheet | `1AAnfm-SAYso6RpJhbdhJbTbcGDH1Ftlk0FHBPHfN98w` |
| Tab naming | `Jan 26 (C)`, `Feb 26 (C)`, `Mar 26 (C)`, ... (abbreviated month + year + (C)) |
| Layout | Row 2: InterContinental + Ramla, Row 3: Hugos + Labranda, Row 4: Hyatt + Sunny Coast, Row 5: Excelsior + Novotel |
| Sales columns | Varies by month — check column headers. Typically col C or D for first hotel, col F or I for second hotel |
| Currency | EUR, **gross** (incl. VAT, all revenue sources) |

**Use this source when:** Budget variance analysis requires gross revenue figures matching the budget baseline.

### Aesthetics Actuals

| Field | Value |
|---|---|
| Spreadsheet | `1Mr_aRRbRf3ex--WmUJIqXwko7okCyD82KxBOXWYnW24` (Leticia Aesthetics Sales) |
| Tab naming 2026 | `Sales January 2026`, `Sale February 2026`, `Sale March 2026` (note: "Sales" for Jan, "Sale" for Feb+) |
| Tab naming 2025 | `Sales January 2025` through `Sales December 2025` |
| Columns | A=Invoice, B=Customer, C=Service/Products, D=Date, E=Price, F=Payment |
| Revenue column | **E** (Price) — sum all rows to get monthly total |
| Currency | EUR (shown with $ symbol in sheet — these are EUR amounts) |

**To get monthly total:** Read full column E, sum all numeric values (skip header row 1). The sheet may have a SUM formula at the bottom.

### Slimming Actuals

| Field | Value |
|---|---|
| Spreadsheet | `1j6tz8k8TRSulB35Sg4X1xSlcV_JLf-8QKx-32UUkoBc` (Slimming Sales Master) |
| Tab naming | `Sales Feb`, `Sales March` (month without year) |
| Columns | A=Date, B=Client, C=Weight loss, D=Treatments, E=Medical consultation, F=Products, G=Full price |
| Revenue column | **G** (Full price) — sum all rows to get monthly total |
| Currency | EUR |

**To get monthly total:** Read full column G, sum all numeric values (skip header row 1 and any blank rows).

## Workflow

1. **Identify period** — Map requested month to column letter (B=Jan, C=Feb, ..., M=Dec)
2. **Pull actuals** per unit:
   - Spa: Read `YTD` tab row 6, appropriate column
   - Aesthetics: Read Leticia sheet, sum Price column from the month's tab
   - Slimming: Read Slimming Sales Master, sum Full price column from the month's tab
3. **Pull budget** — Read `Budget 2026` tab, appropriate row and column
4. **Calculate variance** — Actual minus Budget
5. **Update Budget 2026 sheet** — Write actuals to the Actuals section (rows 25-39) and variance to Variance section (rows 44-58)

## Column Reference (Month -> Column Letter)

| Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec | TOTAL |
|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-------|
| B   | C   | D   | E   | F   | G   | H   | I   | J   | K   | L   | M   | N     |

## Budget Targets Quick Reference (EUR)

| Unit | Annual | Monthly Avg |
|---|---|---|
| SPA (9 hotels) | 3,781,880 | ~315k |
| Aesthetics | 838,042 | ~70k |
| Slimming | 380,078 | ~32k |
| **GROUP** | **5,000,000** | **~417k** |

## Common Pitfalls

1. **Aesthetics tab naming is inconsistent** — "Sales January 2026" vs "Sale February 2026" (singular). Always check with `sheets_get_spreadsheet` if a tab read fails.
2. **Salary Master column layout shifts** between months. Always read header row first to identify the Sales column.
3. **YTD is ex-VAT, Budget is gross** — Don't mix sources. Pick one and be consistent.
4. **Slimming tabs don't include year** — "Sales Feb" not "Sales Feb 2026". New tabs are added monthly.
5. **Aesthetics prices show $** — These are EUR despite the dollar sign formatting.
