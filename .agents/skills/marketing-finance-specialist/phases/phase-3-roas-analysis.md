# Phase 3: ROAS/CPL Analysis

## Purpose

Compute CPL, CPA, and ROAS per campaign across all brands. Classify each campaign as WINNER, LOSER, or WATCHLIST using thresholds from `config/kpi_thresholds.json`.

## Inputs Required

- Meta Ads data from Phase 2 (or pull fresh if running standalone)
- `config/kpi_thresholds.json` (loaded by router)
- `config/brands.json` (CPL targets per brand)

## KPI Thresholds Reference

| Brand | CPL Target | Kill Threshold (2x) | CTR Min | CPC Max |
|-------|-----------|---------------------|---------|---------|
| Spa | EUR 8.00 | EUR 16.00 | 1.0% | EUR 1.50 |
| Aesthetics | EUR 12.00 | EUR 24.00 | 0.8% | EUR 2.00 |
| Slimming | USD 10.00 | USD 20.00 | TBD | TBD |

**Review prerequisites:** Do NOT classify until a campaign has:
- Spent >= EUR 15 (or USD equivalent)
- Received >= 500 impressions
- Run for >= 3 days

## Procedure

### Step 1: Pull Campaign-Level Metrics

For each brand's Meta ad account, get:
- `spend`, `impressions`, `clicks`, `ctr`, `cpc`, `actions` (leads), `cost_per_action_type` (CPL)
- Breakdown: by `campaign_name`
- Date range: last 7 days

### Step 2: Compute KPIs Per Campaign

For each campaign:
```
CPL = spend / leads (if leads > 0, else "No Leads")
CTR = (clicks / impressions) * 100
CPC = spend / clicks (if clicks > 0)
ROAS = revenue / spend (if revenue data available from Phase 4)
```

### Step 3: Classify Each Campaign

Using `config/kpi_thresholds.json`:

**WINNER** (all must be true):
- CPL <= brand CPL target
- Leads >= 5
- Spend >= EUR 30

**LOSER** (all must be true):
- CPL > brand kill threshold (2x target)
- Spend >= EUR 30
- Leads < 2

**WATCHLIST** (everything else):
- CPL between target and kill threshold
- OR insufficient data (spend < EUR 15 or impressions < 500)

### Step 4: Check Alert Thresholds

From `config/kpi_thresholds.json` alert_thresholds:
- Daily budget overspend > 20%
- CPL spike > 50% vs. previous period
- CTR drop > 40% vs. previous period
- Frequency > 2.5 (warning) or > 4.0 (kill)
- No leads after EUR 25 spend

### Step 5: Generate Recommendations

For each classification:
- **WINNERS:** "Scale budget +20-30%. Duplicate to new audiences. Create hook variations."
- **LOSERS:** "Pause immediately. Analyse failure (hook, targeting, offer, landing page). Document learnings."
- **WATCHLIST:** "Continue monitoring. Review at next cycle. Consider minor adjustments."

## Output

A performance scorecard per brand:

| Campaign | Spend | Leads | CPL | CTR | CPC | Status | Action |
|----------|-------|-------|-----|-----|-----|--------|--------|
| Name | EUR X | X | EUR X | X% | EUR X | WINNER/LOSER/WATCH | Recommendation |

Plus a summary: X winners, Y losers, Z watchlist per brand.
