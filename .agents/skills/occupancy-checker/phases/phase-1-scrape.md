# Phase 1 — Scrape Fresha Capacity

## Objective
Get current practitioner availability for all services across specified venues.

## Prerequisites
- `config/fresha_venues.json` loaded (venue URLs, services to check)
- Python 3.9+ with playwright installed

## Procedure

### Step 1: Run the scraper

```bash
python tools/check_fresha_availability.py --venue {venue_arg} --days {days_arg}
```

Where:
- `{venue_arg}` = the venue argument passed to the skill (slimming, aesthetics, or omit for all)
- `{days_arg}` = the days argument passed to the skill (default: 14)

### Step 2: Verify output

Read `.tmp/performance/fresha_capacity_report.json` and verify:
- [ ] `generated_at` is within the last 5 minutes
- [ ] All expected venues are present
- [ ] Each venue has services with `days_checked` > 0
- [ ] No services have `error` field set (if any do, log but continue)

### Step 3: Extract key metrics

For each service, note:
- `total_slots` — total available slots across all checked days
- `fully_booked_days` — number of days with zero availability
- `days_checked` — total days in scan window
- `avg_slots_per_day` = total_slots / days_checked
- `booked_pct` = fully_booked_days / days_checked * 100
- `ad_recommendation.action` — the capacity-only verdict (PAUSE/REDUCE/MAINTAIN/SCALE)

### Step 4: Handle scraper failures

If the scraper fails entirely:
- Check if `.tmp/performance/fresha_capacity_report.json` exists from a previous run
- If it exists and is less than 24 hours old, use cached data (note "cached" in report)
- If no cached data, abort and report: "Fresha scraper failed. No capacity data available."
- Check `.tmp/performance/debug/` for failure screenshots

## Output
- `.tmp/performance/fresha_capacity_report.json` — fresh or cached capacity data
- Phase status: COMPLETE or FAILED (with reason)
