# Phase 1: Budget Allocation

## Purpose

Compute per-campaign daily budgets for all 3 brands across Meta and Google channels. This phase is invoked **on-demand** when planning a new quarterly or monthly campaign calendar — it is NOT part of the weekly cycle.

## Inputs Required

- `config/budget-allocation.json` (loaded by router)
- Campaign count per brand (from quarterly-marketing-calendar or meta-strategist output)
- Target month (to determine if Q4 override applies)

## Procedure

### Step 1: Load Budget Config

Read `config/budget-allocation.json`. This is the single source of truth for weekly budgets.

### Step 2: Check for Q4 Override

- **January-September:** Use `weekly_budgets` from config directly
- **October-December:** Read actual Q4 2025 data from spreadsheet `1q40Ke8wRsjnoVOngDupVdwxIWiTFXwYfh1ZwvUa9xtc`, sheet `Calendar '25`. Extract weekly budget averages per brand per channel and use those as the baseline.

### Step 3: Split Meta Budget by Campaign Type

For each brand's Meta weekly budget:
- **Evergreen pool** = `meta_eur x 0.60`
- **Seasonal pool** = `meta_eur x 0.40`

| Brand | Meta/wk | Evergreen/wk (60%) | Seasonal/wk (40%) |
|-------|---------|--------------------|--------------------|
| Spa | EUR 350 | EUR 210 | EUR 140 |
| Aesthetics | EUR 560 | EUR 336 | EUR 224 |
| Slimming | EUR 400 | EUR 240 | EUR 160 |

### Step 4: Compute Per-Campaign Daily Budgets

```
evergreen_daily = (evergreen_pool / 7) / num_evergreen_campaigns
seasonal_daily = (seasonal_pool / 7) / num_seasonal_campaigns
```

Round to nearest EUR 1.

### Step 5: Validate EUR 5/Day Minimum

Check every campaign against EUR 5/day minimum. If any falls below:
- Do NOT spread budget thinner
- **Reduce campaign count** — cut lowest-priority seasonal campaigns first
- Priority order: LOW > MEDIUM > never cut HIGH (mandatory occasions)

### Step 6: Distribute Google Budget

| Type | Share | Spa/wk | AES/wk | SLIM/wk |
|------|-------|--------|--------|---------|
| Search | 50% | EUR 420 | EUR 70 | EUR 50 |
| Pmax | 30% | EUR 252 | EUR 42 | EUR 30 |
| Remarketing | 20% | EUR 168 | EUR 28 | EUR 20 |

If a brand doesn't run all three types, redistribute proportionally across active types.

### Step 7: Write to Campaign Plan

- Meta: `Campaign Name | CPL XX |` where XX = daily budget (whole number)
- Google: `Search: keyword | CPC XX | XXx`

## Output

A budget table per brand with:
- Daily budget per Meta campaign (evergreen + seasonal)
- Daily budget per Google campaign type
- Any campaigns cut to meet EUR 5/day minimum (with rationale)

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Same channel split for all brands | Spa is 30/70 Meta/Google. AES and SLIM are 80/20. |
| Budget below EUR 5/day | Cut campaigns, don't dilute. |
| Forgetting Q4 override | Always check the month first. |
| Hardcoding Q4 numbers | Read from spreadsheet dynamically. |
| Ignoring Slimming USD | Slimming Meta account is in USD. Convert for planning. |
