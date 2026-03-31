# Phase 5 — Publish Reports

## Objective
Publish the optimizer results as a markdown report, Google Sheet update, and console summary.

## Prerequisites
- Phase 4 complete (reallocation proposal generated)
- Google Workspace MCP loaded: `ToolSearch: "+google-workspace"`

## Procedure

### Step 1: Write markdown report

Run the optimizer tool to generate the markdown report:

```bash
python tools/optimize_ad_budget.py \
    --capacity .tmp/performance/fresha_capacity_report.json \
    --ads .tmp/performance/meta_ads_by_service.json \
    --output .tmp/performance/occupancy-optimizer-report.md
```

If no ads data is available (Phase 2 was skipped), omit the `--ads` flag for capacity-only mode:

```bash
python tools/optimize_ad_budget.py \
    --capacity .tmp/performance/fresha_capacity_report.json \
    --output .tmp/performance/occupancy-optimizer-report.md
```

Verify the report at `.tmp/performance/occupancy-optimizer-report.md` contains:
- Executive summary
- Service-by-service analysis table
- Budget reallocation proposal (if ads data available)
- Data sources section

### Step 2: Push to Google Sheet

Load Google Sheets MCP:
```
ToolSearch: "+google-workspace"
```

Find or create a sheet named "Occupancy Optimizer" in the Carisma performance spreadsheet.

Update with columns:
- Date, Service, Venue, Capacity Verdict, Booked %, Avg Slots/Day, Active Campaigns, Current Spend/Day, Proposed Spend/Day, Change, Efficiency Score, Notes

Use `mcp__google-workspace__sheets_append_values` to add a new row block per run.

If Google Sheet access fails:
- Log the error
- Don't fail the pipeline — the markdown report is the primary output
- Note in the console: "Google Sheet update failed. Report saved locally."

### Step 3: Print console summary

Print the executive summary directly to console output. This is what the CMO/CEO sees immediately when the skill finishes.

Format:
```
============================================================
OCCUPANCY OPTIMIZER — Executive Summary
============================================================
Date: {date}
WASTE: {N} services over-advertised
OPPORTUNITIES: {M} services under-advertised
PROPOSED SHIFT: EUR {Z}/day from constrained -> open services

Full report: .tmp/performance/occupancy-optimizer-report.md
============================================================
```

## Output
- `.tmp/performance/occupancy-optimizer-report.md` — full markdown report
- `.tmp/performance/occupancy-optimizer-report.json` — raw proposal JSON
- Google Sheet updated (if access available)
- Console summary printed
- Phase status: COMPLETE
