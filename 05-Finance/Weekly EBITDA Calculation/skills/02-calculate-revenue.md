# 02 — Calculate Revenue

## Objective

Calculate revenue per spa (Service + Product) from the ingested Lapis data and cross-reference against Zoho P&L totals.

## Required Inputs

- Data from `Raw - Lapis Revenue` tab (ingested in Skill 01)
- Data from `Raw - Zoho Spa P&L` tab (for cross-reference)
- Data from `Raw - Aesthetics Data` tab (for Aesthetics revenue)
- `config/spa-list.json` — active spas and their short names
- `knowledge/spa-locations.md` — Zoho account codes per spa

## Execution Steps

### Step 1: Read Spa Configuration

Read `config/spa-list.json` for the list of active spas and their short names.
Read `knowledge/spa-locations.md` for the Zoho account codes.

### Step 2: Calculate Spa Revenue

For each spa in the active list:
1. From `Raw - Lapis Revenue` data: sum Service Revenue + Product Revenue
2. Product Revenue breakdown: Phytomer + Purest Solutions (track separately for COGS calculation in Skill 03)
3. Record per-spa totals

Handle special revenue lines:
- **Sales Discount** (account 20000): deduct from total
- **Sales Refund** (account SALREF): deduct from total
- **Wholesale Product** (account 506200): assign to Corporate/Centre, not individual spas

### Step 3: Calculate Total Spa Revenue

Sum all per-spa revenues to get consolidated Spa revenue.

### Step 4: Calculate Aesthetics Revenue

From `Raw - Aesthetics Data`:
1. Read total revenue amounts
2. Apply VAT exclusion:
   - Standard services: `amount / 1.18`
   - Doctor services: `amount / 1.12`
3. Report VAT-exclusive revenue

### Step 5: Calculate Slimming Revenue

If Slimming data exists in the current period:
1. Read revenue (Services + Book/Product)
2. Apply appropriate VAT exclusion
3. Report separately

### Step 6: Cross-Reference Against Zoho

Compare calculated total revenue against the "Total for Operating Income" line from `Raw - Zoho Spa P&L`:
- If variance < €1.00: cross-reference PASSES
- If variance >= €1.00: FLAG for investigation — report both values and the difference

### Step 7: Report

Present revenue breakdown:

| Spa | Service Revenue | Product Revenue | Total Revenue |
|-----|----------------|----------------|---------------|
| InterContinental | [value] | [value] | [value] |
| Hugos | [value] | [value] | [value] |
| Hyatt | [value] | [value] | [value] |
| Ramla | [value] | [value] | [value] |
| Labranda | [value] | [value] | [value] |
| Sunny Coast | [value] | [value] | [value] |
| Excelsior | [value] | [value] | [value] |
| Novotel | [value] | [value] | [value] |
| Corporate/Centre | [value] | [value] | [value] |
| **Spa Total** | **[value]** | **[value]** | **[value]** |
| Aesthetics | — | — | [value] |
| Slimming | — | — | [value] |

Cross-reference: Lapis total [value] vs Zoho total [value] — PASS/FAIL

## Known Quirks

- The "Sales" line (no spa designation) in Zoho is a catch-all — use Lapis data for per-spa breakdown
- Labranda account codes (4007, 4008) differ from the standard pattern used by all other spas
- Sunny Coast may appear as "Seashells/Sunny Coast & Qawra" in some data sources — treat as the same spa
- Wholesale Product (506200) belongs to Centre/Corporate, not to any individual spa
- Aesthetics VAT rate is 18% for standard services and 12% for doctor services — confirm which lines fall under which rate before applying exclusion

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
