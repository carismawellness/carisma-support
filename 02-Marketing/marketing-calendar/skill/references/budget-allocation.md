# Budget Allocation Reference

This reference is loaded during Phase 3 (Campaign Planning) of the calendar-strategy skill. It defines how to distribute ad spend budgets across channels, campaign types, and individual campaigns.

## Source of Truth

All budget numbers live in `config/budget-allocation.json`. Load that file first.

## Allocation Procedure

### Step 1: Determine Weekly Budgets

- If target month is **January-September**: use `weekly_budgets` from config directly
- If target month is **October-December**: execute the Q4 Override (see below)

### Step 2: Split Meta Budget by Campaign Type

For each brand's Meta weekly budget:
- **Evergreen pool** = `meta_eur x 0.60`
- **Seasonal pool** = `meta_eur x 0.40`

| Brand | Meta/wk | Evergreen/wk (60%) | Seasonal/wk (40%) |
|-------|---------|--------------------|--------------------|
| Spa | EUR 350 | EUR 210 | EUR 140 |
| Aesthetics | EUR 560 | EUR 336 | EUR 224 |
| Slimming | EUR 400 | EUR 240 | EUR 160 |

### Step 3: Compute Per-Campaign Daily Budgets

1. Count the number of **evergreen campaigns** planned for the month (from meta-strategist output)
2. Count the number of **seasonal campaigns** planned (from quarterly-marketing-calendar output)
3. Compute:
   - Each evergreen campaign daily = `(evergreen_pool / 7) / num_evergreen_campaigns`
   - Each seasonal campaign daily = `(seasonal_pool / 7) / num_seasonal_campaigns`
4. Round to nearest EUR 1

### Step 4: Validate Minimum Budget

Check every campaign against the **EUR 5/day minimum** (`minimum_campaign_daily_eur` in config).

If any campaign falls below EUR 5/day:
- Do NOT spread budget thinner
- Instead, **reduce the campaign count** — cut the lowest-priority campaigns until remaining campaigns each get >= EUR 5/day
- Priority order for cutting: LOW priority seasonal first, then MEDIUM, never cut HIGH (mandatory occasions)

### Step 5: Distribute Google Budget

Split each brand's Google weekly budget across active Google campaign types:
- **Search campaigns**: 50% of Google budget
- **Pmax campaigns**: 30% of Google budget
- **Remarketing**: 20% of Google budget

If a brand doesn't run all three types, redistribute proportionally across active types.

| Brand | Google/wk | Search (50%) | Pmax (30%) | Remarketing (20%) |
|-------|-----------|-------------|------------|-------------------|
| Spa | EUR 840 | EUR 420 | EUR 252 | EUR 168 |
| Aesthetics | EUR 140 | EUR 70 | EUR 42 | EUR 28 |
| Slimming | EUR 100 | EUR 50 | EUR 30 | EUR 20 |

### Step 6: Write Budgets to Campaign Plan

- Include daily budget in every Meta campaign name: `Campaign Name | CPL XX |` where XX = daily budget
- Write computed daily budget to the Budget row below each campaign Name row in the spreadsheet
- Include Google daily budget in Google campaign names: `Search: keyword | CPC XX | XXx`

## Q4 Override Procedure

For **October, November, December** planning:

1. Load the 2025 marketing calendar spreadsheet:
   - Spreadsheet: `1q40Ke8wRsjnoVOngDupVdwxIWiTFXwYfh1ZwvUa9xtc`
   - Sheet: `Calendar '25`
2. Use `sheets_read_values` to read the Budget rows for each brand:
   - Spa Meta Budget rows: rows 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41
   - Spa Google Budget rows: rows 46, 48, 50, 62, 64, 66, 68, 70, 72
   - Aesthetics Meta Budget rows: rows 100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 122, 124, 126, 128, 130, 132
   - Aesthetics Google Budget rows: rows 158, 160, 162, 164, 166, 168, 170
   - Slimming Meta Budget rows: rows 178, 180, 182, 184, 186, 188, 190, 192, 194, 196, 198, 200, 202, 204, 206, 208, 210, 212
   - Slimming Google Budget rows: rows 238, 240, 242, 244, 246, 248
3. Read columns for Oct (day 1-31), Nov (day 1-30), Dec (day 1-31)
4. Sum the daily budgets to compute weekly averages per brand per channel
5. Use those weekly averages as the budget baseline for Q4 2026 planning (replacing `weekly_budgets` defaults)

## Quick Reference Table

| Brand | Total/wk | Meta/wk | Google/wk | Meta/day | Google/day |
|-------|----------|---------|-----------|----------|------------|
| Spa | EUR 1,190 | EUR 350 | EUR 840 | ~EUR 50 | EUR 120 |
| Aesthetics | EUR 700 | EUR 560 | EUR 140 | ~EUR 80 | ~EUR 20 |
| Slimming | EUR 500 | EUR 400 | EUR 100 | ~EUR 57 | ~EUR 14 |
| **Total** | **EUR 2,390** | **EUR 1,310** | **EUR 1,080** | **EUR 187** | **EUR 154** |