# Apps Script ETL Deployment Tracker

## Status

| # | Sheet | Script File | Sheet ID | Apps Script Project ID | Code Deployed | Triggers Set | Status |
|---|-------|-------------|----------|------------------------|---------------|-------------|--------|
| 1 | Weekly KPIs | `apps_script_weekly_kpi.js` | `1JGlBdii7Zu25yha0zrmi72PPH1BFZRdVeGvcig3r6GE` | `1AHexXYnIrkG2fiAOx2qYJiUvH_jLx4yAd2Rr0ZvDtkHgebm2MGNhJVCW` | Yes | Yes (2) | Done |
| 2 | CRM Master | `apps_script_crm_master.js` | `1bHF_7bXic08pcyXQhq310zG6McqXD50oT0EuVkjzDdI` | `12LWTaeLTi0gjP1p4oQfbtuOSHqB-N_E4g2ZwX-vRTWvQkLSQb0YJYIBr` | Yes | Yes (2) | Done |
| 3 | EBITDA | `apps_script_ebitda.js` | `1WWM7W6S5wtSC-5hdlcuJgW3zbYaO7YRgg4_-Bju4-5s` | `1rqVPC2MEy3eQlcKClIKpMpuTyV02vUcopGZzR3QV6ciZt5OCvYHwx5zp` | Yes | Yes (2) | Done |
| 4 | Aesthetics Sales | `apps_script_aesthetics_sales.js` | `1Mr_aRRbRf3ex--WmUJIqXwko7okCyD82KxBOXWYnW24` | `1dEMmPbpRr5nvntxNMmDdzCLzmAMlyqcGfbnlWJOFCHyMMA3TNnW6Kz_L` | Yes | Yes (2) | Done |
| 5 | Slimming Sales | `apps_script_slimming_sales.js` | `1j6tz8k8TRSulB35Sg4X1xSlcV_JLf-8QKx-32UUkoBc` | `1awn3jfx8MxlgSGFcF52AEhKVAAb2uR0p7R3LlIiqpMlcUa85TxhEf3a3` | Yes | Yes (2) | Done |
| 6 | Salary Master | `apps_script_salary_master.js` | `1AAnfm-SAYso6RpJhbdhJbTbcGDH1Ftlk0FHBPHfN98w` | `1gCuUECDKwlxvA18CBcxlNnA35-nAlQTPnrPimYFxauzBjFg67EGTbJoS` | Yes | Yes (2) | Done |
| 7 | Budget Calendar | `apps_script_budget_calendar.js` | `1q40Ke8wRsjnoVOngDupVdwxIWiTFXwYfh1ZwvUa9xtc` | `1DU0n-AIuNu889u2iLtTQfdFmmGlNE1cQU3AHDtwMlD7scT2UWBlkItpp` | Yes | Yes (2) | Done |

## Deployment Steps (per sheet)

1. Open sheet URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
2. Extensions → Apps Script
3. Paste code via Monaco: `monaco.editor.getEditors()[0].setValue(code)`
4. Cmd+S to save
5. Rename project (click project name → dialog)
6. Go to Triggers page
7. Add Trigger 1: on-edit trigger for the edit handler function
8. Add Trigger 2: daily cron for the sync function (Day timer, 6am)
9. Handle OAuth if prompted (Advanced → Go to unsafe → check permissions → Continue)

## Trigger Configuration per Script

| Script | On-Edit Function | Cron Function | Cron Schedule |
|--------|-----------------|---------------|---------------|
| Weekly KPIs | `onEditTrigger` | `syncLatestWeek` | Daily 6am |
| CRM Master | `onEditTrigger` | `syncLatestDay` | Daily 6am |
| EBITDA | `onEditTrigger` | `syncLatestWeek` | Daily 6am |
| Aesthetics Sales | `onEditTrigger` | `syncLatestMonth` | Daily 6am |
| Slimming Sales | `onEditTrigger` | `syncLatestMonth` | Daily 6am |
| Salary Master | `onEditTrigger` | `syncLatestMonth` | Daily 6am |
| Budget Calendar | `onEditTrigger` | `syncLatestYear` | Daily 6am |

## Quick Trigger Setup (one-time per sheet)

Each script now has a `createTriggers()` function. For each sheet:

1. Open the sheet → Extensions → Apps Script
2. In the function dropdown (top bar), select `createTriggers`
3. Click Run (play button)
4. Grant OAuth permissions when prompted (Advanced → Go to unsafe → Allow)
5. Check Execution log confirms "Triggers created"

Links to script editors:
- CRM Master: `https://script.google.com/d/12LWTaeLTi0gjP1p4oQfbtuOSHqB-N_E4g2ZwX-vRTWvQkLSQb0YJYIBr/edit`
- EBITDA: `https://script.google.com/d/1rqVPC2MEy3eQlcKClIKpMpuTyV02vUcopGZzR3QV6ciZt5OCvYHwx5zp/edit`
- Aesthetics Sales: `https://script.google.com/d/1dEMmPbpRr5nvntxNMmDdzCLzmAMlyqcGfbnlWJOFCHyMMA3TNnW6Kz_L/edit`
- Slimming Sales: `https://script.google.com/d/1awn3jfx8MxlgSGFcF52AEhKVAAb2uR0p7R3LlIiqpMlcUa85TxhEf3a3/edit`
- Salary Master: `https://script.google.com/d/1gCuUECDKwlxvA18CBcxlNnA35-nAlQTPnrPimYFxauzBjFg67EGTbJoS/edit`
- Budget Calendar: `https://script.google.com/d/1DU0n-AIuNu889u2iLtTQfdFmmGlNE1cQU3AHDtwMlD7scT2UWBlkItpp/edit`

## Supabase Tables Needed

These tables must exist in Supabase before backfill:

```sql
-- CRM Master
CREATE TABLE IF NOT EXISTS crm_daily (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  metric TEXT NOT NULL,
  value NUMERIC,
  brand_id INTEGER NOT NULL,
  tab TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date, metric, brand_id, tab)
);

-- EBITDA (reuses weekly_revenue pattern)
CREATE TABLE IF NOT EXISTS ebitda_monthly (
  id BIGSERIAL PRIMARY KEY,
  week_start DATE NOT NULL,
  metric TEXT NOT NULL,
  value NUMERIC,
  tab TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(week_start, metric, tab)
);

-- Aesthetics + Slimming Sales
CREATE TABLE IF NOT EXISTS sales_by_rep (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  staff_name TEXT NOT NULL,
  brand_id INTEGER NOT NULL,
  revenue NUMERIC,
  bookings_count INTEGER,
  source_tab TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date, staff_name, brand_id, source_tab)
);

-- Salary Master
CREATE TABLE IF NOT EXISTS salary_monthly (
  id BIGSERIAL PRIMARY KEY,
  month DATE NOT NULL,
  metric TEXT NOT NULL,
  location TEXT NOT NULL,
  value NUMERIC,
  tab TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(month, metric, location, tab)
);

-- Budget Calendar
CREATE TABLE IF NOT EXISTS budget_vs_actual (
  id BIGSERIAL PRIMARY KEY,
  month DATE NOT NULL,
  brand_id INTEGER NOT NULL,
  department TEXT NOT NULL,
  platform TEXT NOT NULL,
  budgeted NUMERIC,
  tab TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(month, brand_id, department, platform, tab)
);
```
