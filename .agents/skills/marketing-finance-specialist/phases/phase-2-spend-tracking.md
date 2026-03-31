# Phase 2: Spend Tracking

## Purpose

Pull actual ad spend from Meta Ads and Google Ads for the current week. Compare actual vs. planned budgets. Flag overspend/underspend by brand and channel.

## Inputs Required

- `config/budget-allocation.json` (planned weekly budgets)
- `config/brands.json` (ad account IDs)
- Date range: current week (Monday-Sunday)

## Procedure

### Step 1: Determine Date Range

Calculate the current week's date range:
- `start_date`: Most recent Monday
- `end_date`: Today (or Sunday if running end-of-week)

### Step 2: Pull Meta Ads Spend

For each brand, use the Meta Ads MCP `get_insights` tool:

| Brand | Ad Account ID | Currency |
|-------|--------------|----------|
| Spa | `act_654279452039150` | EUR |
| Aesthetics | `act_382359687910745` | EUR |
| Slimming | `act_1496776195316716` | **USD** |

Request fields: `spend`, `impressions`, `clicks`, `actions` (leads)
Breakdown: `campaign_name`
Date range: `start_date` to `end_date`

### Step 3: Pull Google Ads Spend

Use Google Sheets or Google Ads API to pull Google campaign spend for the same date range. Source TBD based on available MCP tools.

### Step 4: Compute Variance

For each brand and channel:
```
planned_spend = weekly_budget * (days_elapsed / 7)
variance_eur = actual_spend - planned_spend
variance_pct = (variance_eur / planned_spend) * 100
```

### Step 5: Flag Anomalies

Flag if:
- Any brand > **80% budget consumed** before the week ends → escalate to CMO
- Any brand > **20% overspend** → flag in report
- Any brand < **50% spend** at midweek → flag as underspend (possible delivery issues)

### Step 6: Currency Conversion for Slimming

Convert Slimming USD spend to EUR for the consolidated view. Use a fixed rate or pull live rate. Note: budget planning is in EUR, Meta data is in USD.

## Output

A spend variance table:

| Brand | Channel | Planned (EUR) | Actual (EUR) | Variance | Status |
|-------|---------|--------------|-------------|----------|--------|
| Spa | Meta | XX | XX | +/-XX% | OK/OVER/UNDER |
| Spa | Google | XX | XX | +/-XX% | OK/OVER/UNDER |
| ... | ... | ... | ... | ... | ... |

Plus a list of flagged anomalies with recommended actions.
