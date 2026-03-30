# Budget Allocation Skill — Design Document

**Date:** 2026-03-30
**Status:** Approved
**Approach:** Central config + calendar-strategy reference (Approach 3)

## Problem

The marketing calendar strategy skill needs to assign budgets to every campaign it plans, but there's no persistent source of truth for how much each brand can spend, how to split across channels, or how to handle Q4 seasonal surges. Budget decisions currently live only in session context and get lost between conversations.

## Solution

Two files working together:

1. **`config/budget-allocation.json`** — Single source of truth for all budget numbers. Any skill can read this.
2. **`marketing/calendar-strategy/skill/references/budget-allocation.md`** — Instructions for how the calendar-strategy skill uses the numbers during Phase 3 (Campaign Planning).

## Budget Parameters

### Weekly Budgets by Brand (Q1-Q3 Default)

| Brand | Meta/wk | Google/wk | Total/wk | Meta/day | Google/day |
|-------|---------|-----------|----------|----------|------------|
| Spa | €350 | €840 | €1,190 | ~€50 | €120 |
| Aesthetics | €560 | €140 | €700 | ~€80 | ~€20 |
| Slimming | €400 | €100 | €500 | ~€57 | ~€14 |
| **Total** | **€1,310** | **€1,080** | **€2,390** | **€187** | **€154** |

### Channel Split Rationale

- **Spa:** 30/70 Meta/Google — Spa has strong Google Search intent (hotel spa, spa day Malta). Google gets the majority.
- **Aesthetics:** 80/20 Meta/Google — Meta is the primary lead gen engine. Google supplements with search campaigns.
- **Slimming:** 80/20 Meta/Google — Same as Aesthetics. Meta drives awareness and leads for a newer brand.

### Meta Campaign Type Split

Within each brand's Meta budget:
- **60% Evergreen** — Always-on campaigns (Spa Day, Massage, Fat Freeze, Botox, etc.)
- **40% Seasonal** — Occasion-based campaigns tied to the monthly calendar (Easter, Mother's Day, BFCM, etc.)

| Brand | Meta Evergreen/wk | Meta Seasonal/wk |
|-------|-------------------|-------------------|
| Spa | €210 | €140 |
| Aesthetics | €336 | €224 |
| Slimming | €240 | €160 |

### Q4 Override (October–December)

Q4 budgets are NOT hardcoded. Instead:

1. Read actual Q4 2025 data from the marketing calendar spreadsheet (`1q40Ke8wRsjnoVOngDupVdwxIWiTFXwYfh1ZwvUa9xtc`, sheet `Calendar '25`)
2. Extract budget values from the Budget rows for each brand's Meta and Google campaigns in Oct/Nov/Dec
3. Use those as the baseline for Q4 2026 planning
4. Key Q4 moments: October (Anniversary), November (BFCM — biggest sale), December (Christmas)

## File 1: `config/budget-allocation.json`

```json
{
  "version": "1.0.0",
  "last_updated": "2026-03-30",
  "currency": "EUR",
  "weekly_budgets": {
    "spa": {
      "meta_eur": 350,
      "google_eur": 840,
      "total_eur": 1190,
      "channel_split_note": "Spa skews Google-heavy due to strong search intent for hotel spa / spa day queries"
    },
    "aesthetics": {
      "meta_eur": 560,
      "google_eur": 140,
      "total_eur": 700,
      "channel_split_note": "Meta-primary. Google supplements with search/remarketing"
    },
    "slimming": {
      "meta_eur": 400,
      "google_eur": 100,
      "total_eur": 500,
      "channel_split_note": "Meta-primary. Newer brand, awareness-driven"
    }
  },
  "meta_campaign_split": {
    "evergreen_pct": 60,
    "seasonal_pct": 40,
    "note": "Evergreen = always-on campaigns. Seasonal = occasion-based campaigns from the quarterly calendar."
  },
  "q4_override": {
    "months": [10, 11, 12],
    "method": "spreadsheet_read",
    "spreadsheet_id": "1q40Ke8wRsjnoVOngDupVdwxIWiTFXwYfh1ZwvUa9xtc",
    "sheet_name": "Calendar '25",
    "instructions": "Read actual Q4 2025 budget values from Meta and Google Budget rows for each brand. Use as baseline for Q4 planning."
  }
}
```

## File 2: `marketing/calendar-strategy/skill/references/budget-allocation.md`

This reference file contains the logic/instructions that the calendar-strategy AGENT.md follows during Phase 3:

### Budget Allocation Logic

1. **Load config:** Read `config/budget-allocation.json` at the start of Phase 3
2. **Check month:** If target month is Oct/Nov/Dec, execute Q4 override (read from 2025 spreadsheet)
3. **Compute daily budgets:**
   - Meta daily = `meta_eur / 7`
   - Google daily = `google_eur / 7`
4. **Distribute Meta across campaigns:**
   - Count evergreen campaigns planned for the month
   - Count seasonal campaigns planned for the month
   - Evergreen pool = `meta_eur * 0.60`
   - Seasonal pool = `meta_eur * 0.40`
   - Each evergreen campaign daily budget = `evergreen_pool / 7 / num_evergreen_campaigns`
   - Each seasonal campaign daily budget = `seasonal_pool / 7 / num_seasonal_campaigns`
5. **Distribute Google across campaigns:**
   - Split evenly across active Google campaign types (Search, Pmax, Remarketing)
6. **Write to spreadsheet:**
   - Campaign Budget rows get the computed daily budget (rounded to nearest €1)
   - Campaign Name rows include budget in naming convention: `Name | CPL XX |`

### Minimum Campaign Budget Rule

No single Meta campaign should receive less than **€5/day** — below this, Meta's delivery algorithm underperforms. If a budget computation produces <€5/day for any campaign, consolidate: reduce campaign count rather than spreading too thin.

### Q4 Spreadsheet Read Procedure

1. Use Google Sheets MCP `sheets_read_values` on `Calendar '25`
2. Read Budget rows (see `config.json` row maps) for columns covering Oct, Nov, Dec
3. Sum daily budgets per brand per channel
4. Use these sums as the weekly budgets for Q4 planning (replacing the defaults in `weekly_budgets`)

## Calendar-Strategy Integration

### Changes to AGENT.md Phase 3

Current Phase 3 says "Name every Meta campaign" and "Map Google campaigns" but has no budget assignment step. Add:

> **Budget Assignment (Phase 3.5):**
> 1. Load `config/budget-allocation.json`
> 2. Load `references/budget-allocation.md` for allocation logic
> 3. For Q4 months, read 2025 spreadsheet for override values
> 4. Compute per-campaign daily budgets using the evergreen/seasonal split
> 5. Assign budgets to each campaign in the plan
> 6. Validate: no campaign below €5/day minimum
> 7. Present budget allocation table to user for approval before Phase 4

### Changes to AGENT.md Phase 4

Phase 4 (Spreadsheet Write) already writes campaign names. Add:
> Write computed daily budget to the Budget row immediately below each campaign Name row.

### Files to Load (add to SKILL.md)

Add to the "Files to Load Before Starting" list:
- `config/budget-allocation.json` — Weekly budgets, channel splits, campaign type splits

## Verification

1. Invoke calendar-strategy for a Q1-Q3 month (e.g., "build May 2026 calendar")
2. Confirm Phase 3 loads budget config and computes per-campaign budgets
3. Verify Spa gets €350/wk Meta and €840/wk Google
4. Verify no campaign is below €5/day
5. Invoke for a Q4 month (e.g., "build November 2026 calendar")
6. Confirm it reads from the 2025 spreadsheet instead of using defaults
7. Verify budget assignment appears in the campaign plan before spreadsheet write
