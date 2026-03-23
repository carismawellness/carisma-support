# 03 — Calculate COGS

## Objective

Calculate cost of goods sold by product line per spa. Compute gross profit and gross margin.

## Required Inputs

- Data from `Raw - Lapis COGS` tab (ingested in Skill 01)
- Per-spa revenue from Skill 02
- Data from `Raw - Aesthetics Data` tab (for Aesthetics COGS)
- `knowledge/ebitda-structure.md` — COGS definitions and gross margin benchmarks

## Execution Steps

### Step 1: Calculate Spa COGS

For each spa:
1. From `Raw - Lapis COGS` data: identify COGS by product line
2. Product lines:
   - **Phytomer** — skincare products
   - **Purest Solutions** — beauty products
   - **Others** — all other product costs (including general allocation, e.g. €372.69/spa)
3. Sum to get total COGS per spa

### Step 2: Calculate Spa Gross Profit

For each spa:
- `Gross Profit = Revenue (from Skill 02) - COGS`
- `Gross Margin % = Gross Profit / Revenue`

Expected gross margin range: 96–100% for most spas (COGS is a small portion of spa revenue since services dominate). Flag any spa outside this range for review.

### Step 3: Calculate Aesthetics COGS

From `Raw - Aesthetics Data`:
1. Read COGS amount
2. Calculate Aesthetics Gross Profit: `Revenue (from Skill 02) - COGS`
3. Calculate Gross Margin %
4. Target gross margin: ~73%

### Step 4: Calculate Slimming COGS

If Slimming data exists in the current period:
1. Read COGS amount
2. Calculate Gross Profit: `Revenue (from Skill 02) - COGS`
3. Calculate Gross Margin %
4. Target gross margin: ~73%

### Step 5: Report

Present COGS and gross profit breakdown:

| Spa | Revenue | COGS (Phytomer) | COGS (Purest) | COGS (Others) | Total COGS | Gross Profit | Gross % |
|-----|---------|-----------------|---------------|---------------|------------|-------------|---------|
| InterContinental | [value] | [value] | [value] | [value] | [value] | [value] | [%] |
| Hugos | [value] | [value] | [value] | [value] | [value] | [value] | [%] |
| Hyatt | [value] | [value] | [value] | [value] | [value] | [value] | [%] |
| Ramla | [value] | [value] | [value] | [value] | [value] | [value] | [%] |
| Labranda | [value] | [value] | [value] | [value] | [value] | [value] | [%] |
| Sunny Coast | [value] | [value] | [value] | [value] | [value] | [value] | [%] |
| Excelsior | [value] | [value] | [value] | [value] | [value] | [value] | [%] |
| Novotel | [value] | [value] | [value] | [value] | [value] | [value] | [%] |
| Corporate/Centre | [value] | [value] | [value] | [value] | [value] | [value] | [%] |
| **Spa Total** | **[value]** | | | | **[value]** | **[value]** | **[%]** |
| Aesthetics | [value] | | | | [value] | [value] | [%] |
| Slimming | [value] | | | | [value] | [value] | [%] |

## Known Quirks

- Zoho COGS line "Cost of Goods Sold" may include errors for wholesale purposes (noted in workbook cell G29) — use Lapis COGS data as the authoritative source, not Zoho
- "Others" COGS often includes a flat per-spa allocation (e.g., €372.69) — verify this figure against the current period's data before applying
- Aesthetics has a higher COGS ratio than Spa because of product-heavy services; a gross margin significantly above 73% should be investigated
- Pass the per-spa `Gross Profit` figures directly to Skill 06 (Calculate EBITDA) — these are the starting point for the EBITDA formula

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
