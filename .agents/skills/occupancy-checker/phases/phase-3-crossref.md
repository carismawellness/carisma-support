# Phase 3 — Cross-Reference Supply vs Demand

## Objective
Merge capacity data (Phase 1) with ad performance data (Phase 2) to identify mismatches.

## Prerequisites
- Phase 1 complete: `.tmp/performance/fresha_capacity_report.json`
- Phase 2 complete: `.tmp/performance/meta_ads_by_service.json`
- `references/decision-matrix.md` loaded

## Procedure

### Step 1: Load both data sources

Read:
- `.tmp/performance/fresha_capacity_report.json` -> capacity data
- `.tmp/performance/meta_ads_by_service.json` -> ads data

### Step 2: For each service, compute crossref

For every service in the capacity report:

1. **Capacity metrics** (from Phase 1):
   - `avg_slots_per_day`
   - `booked_pct`
   - `capacity_verdict` (PAUSE/REDUCE/MAINTAIN/SCALE)

2. **Ad metrics** (from Phase 2, if campaigns exist):
   - `daily_spend` (7-day average)
   - `total_leads_7d`
   - `avg_cpl`
   - `campaign_count` (number of active campaigns)

3. **Mismatch detection:**
   - **WASTE:** capacity_verdict = PAUSE or REDUCE, but daily_spend > EUR 10
   - **MISSED OPPORTUNITY:** capacity_verdict = SCALE, but daily_spend < EUR 5 or no campaigns
   - **ALIGNED:** capacity_verdict matches ad spend level
   - **OVER-SERVING:** capacity_verdict = MAINTAIN, campaign is a WINNER but capacity is tightening

### Step 3: Compute efficiency score

| Capacity | Has Campaigns | Spend Level | Score |
|----------|---------------|-------------|-------|
| PAUSE | Yes | Any | 0 (WASTE) |
| REDUCE | Yes | High (>20/day) | 20 |
| REDUCE | Yes | Low (<10/day) | 60 |
| MAINTAIN | Yes | Any | 75 |
| SCALE | Yes | High | 90 |
| SCALE | Yes | Low | 40 (OPPORTUNITY) |
| SCALE | No | None | 10 (MISSED) |
| Any | No | None | 50 (NEUTRAL) |

### Step 4: Build the crossref table

Create a structured table with columns:
- Service name
- Venue
- Capacity verdict
- Avg slots/day
- Booked %
- Active campaigns
- Daily spend (EUR)
- CPL
- Leads (7d)
- Efficiency score
- Mismatch type (WASTE / OPPORTUNITY / ALIGNED / NEUTRAL)

### Step 5: Save crossref data

Write to `.tmp/performance/occupancy-crossref.json`

## Output
- `.tmp/performance/occupancy-crossref.json` — merged supply-demand data with efficiency scores
- Phase status: COMPLETE
