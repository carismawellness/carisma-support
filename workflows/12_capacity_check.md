# 12 - Capacity-Aware Ad Spend Check

## Objective

Before making any ad spend decision (scale, pause, launch), check practitioner availability on Fresha to ensure there's actual capacity to serve new clients. No point advertising a service when the practitioner is fully booked.

## When to Run

- **Before every performance review** (Workflow 09) — run this first to overlay capacity data
- **Before launching new campaigns** (Workflow 08) — check if the service has capacity
- **Weekly on Monday** — standalone capacity report for the week ahead
- **On demand** — when planning budget allocation or campaign strategy

## Required Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `config/fresha_venues.json` | Manual config | Venue URLs, services to check, team info |
| `.tmp/performance/fresha_capacity_report.json` | Tool output | Latest capacity data (auto-generated) |

## Tools Used

| Tool | Purpose |
|------|---------|
| `tools/check_fresha_availability.py` | Scrape Fresha booking pages for availability data |

## Step-by-Step Procedure

### Step 1: Run the Fresha Scraper

```bash
python tools/check_fresha_availability.py --days 14
```

Options:
- `--venue slimming` — scrape only Slimming venue
- `--venue aesthetics` — scrape only Aesthetics venue
- `--days 7` — check fewer days for a quick scan

Output: `.tmp/performance/fresha_capacity_report.json`

### Step 2: Read and Interpret the Report

The report contains per-service data with these key fields:

| Field | Meaning |
|-------|---------|
| `total_slots` | Total available time slots across all days |
| `fully_booked_days` | Number of days with zero availability |
| `days_checked` | Total days in the scan window |
| `next_available` | Earliest date with an open slot |
| `ad_recommendation.action` | PAUSE / REDUCE / MAINTAIN / SCALE |

### Step 3: Apply Capacity Decisions to Ad Strategy

Use this decision matrix when making ad spend recommendations:

| Fresha Signal | Ad Action | Rationale |
|---------------|-----------|-----------|
| **PAUSE** (0 avg slots, 90%+ booked) | Stop ads for this service | No capacity to serve new clients. Ad spend is wasted money. |
| **REDUCE** (<3 avg slots, 60%+ booked) | Lower budget to minimum | Keep brand awareness warm but don't push volume. |
| **MAINTAIN** (3-6 avg slots) | Keep current spend | Moderate capacity — can handle some new bookings. |
| **SCALE** (6+ avg slots, <60% booked) | Increase ad spend | Plenty of open slots — fill them with paid traffic. |

### Step 4: Override Performance Recommendations

When Workflow 09 (Performance Review) says to scale a winning ad but Fresha says capacity is full:

> **Fresha capacity always overrides performance data.**

A winning ad with great CPL should still be paused/reduced if the service has no slots. Present both data points to the human:

```
Service: Lipocavitation
Ad Performance: WINNER (CPL EUR 6.07, 14 leads)
Fresha Capacity: PAUSE (79% days fully booked, 0.4 avg slots/day)

Recommendation: REDUCE budget to minimum. Great creative — keep it warm
for when capacity opens. Next available slots: April 8.
```

### Step 5: Present Capacity Report

Generate a human-readable summary:

```markdown
# Capacity Report: {date}

## Carisma Slimming
| Service | Booked % | Avg Slots/Day | Total Slots (14d) | Action |
|---------|----------|---------------|--------------------|--------|
| Lipocavitation | 79% | 0.4 | 6 | REDUCE |
| VelaShape | 86% | 0.1 | 1 | REDUCE |
| ... | ... | ... | ... | ... |

## Carisma Aesthetics
| Service | Booked % | Avg Slots/Day | Total Slots (14d) | Action |
|---------|----------|---------------|--------------------|--------|
| 4-1 hydrafacial | 0% | 3.1 | 43 | MAINTAIN |
| ... | ... | ... | ... | ... |

## Ad Spend Implications
- PAUSE ads: [list services at full capacity]
- REDUCE budget: [list limited capacity services]
- SCALE opportunity: [list services with open capacity]
```

## Capacity Thresholds

Defined in `config/fresha_venues.json` under `scraper_config.capacity_thresholds`:

| Level | Avg Slots/Day | Meaning |
|-------|--------------|---------|
| Full | 0 | No availability at all |
| Limited | < 3 | Some gaps but mostly booked |
| Open | 6+ | Plenty of room for new bookings |

## Integration with Other Workflows

### With Workflow 09 (Performance Review)
Run capacity check BEFORE performance review. In the review output, add a "Capacity Override" column:

| Ad | Performance | Capacity | Final Action |
|----|------------|----------|-------------|
| Lipo_UGC_v1 | SCALE (winner) | REDUCE (79% booked) | REDUCE |
| Emsculpt_Static_v2 | HOLD (marginal) | MAINTAIN (57% booked) | HOLD |

### With Workflow 08 (Campaign Publishing)
Before building new campaigns, check which services have capacity. Only create campaigns for services where capacity action is MAINTAIN or SCALE.

### With Budget Allocation
Shift budget away from capacity-constrained services toward services with open slots:
- If Lipocavitation is at 79% booked but Tanita consultations are at 50%, redirect budget to Tanita
- If all Slimming services are constrained, shift total brand budget toward Aesthetics

## Expected Outputs

| Output | Path | Description |
|--------|------|-------------|
| Capacity report | `.tmp/performance/fresha_capacity_report.json` | Full JSON report |
| Debug screenshots | `.tmp/performance/debug/` | Screenshots saved on scraper failures |

## Edge Cases

### Scraper Failures
- If a service returns `REVIEW` action with an error, the scraper couldn't navigate the booking flow
- Check debug screenshots in `.tmp/performance/debug/` for diagnosis
- Common issues: Fresha UI changes, cookie banner blocking clicks, SPA hydration delays

### Sundays and Holidays
- Carisma Slimming is closed Sundays — slots will show as 0 but this is expected, not "fully booked"
- The scraper reports these as `closed_or_booked` status
- When computing booked %, account for closed days in interpretation

### Service Not Found
- If Fresha updates service names, the scraper will fail for those services
- Check Fresha venue pages and update `config/fresha_venues.json` with new names

### Date Navigation Limits
- Fresha only shows dates in a scrollable date picker (~2-3 weeks ahead)
- The `--days` parameter should not exceed 21 days
- For longer-term planning, use historical capacity trends

## Notes

- The scraper runs in headless Chromium and takes ~3-5 minutes for all venues
- Each service requires a full page reload + booking flow navigation
- Fresha doesn't have a public API — scraping is the only option
- If Fresha changes their UI structure significantly, the scraper's state machine navigation may need updates
- Always verify scraper results against the actual Fresha booking page for a few services as a spot-check

---

## Known Issues & Learnings

### [2026-03-30] — networkidle timeout
**What happened:** Scraper hung waiting for `networkidle` on Fresha pages
**Root cause:** Fresha's SPA continuously fires analytics/tracking requests, never reaching network idle
**Fix:** Changed to `wait_until="domcontentloaded"` with explicit 5-second wait for SPA hydration
**Rule:** NEVER use `networkidle` with Fresha — their SPA never stops making requests

### [2026-03-30] — Cookie banner blocking all clicks
**What happened:** All click interactions failed silently
**Root cause:** Fresha's cookie consent banner covers the page and intercepts pointer events
**Fix:** Added `Accept all` button dismissal before any page interactions
**Rule:** ALWAYS dismiss cookie banner first when scraping Fresha

### [2026-03-30] — Clicking service name doesn't enter booking flow
**What happened:** Clicking the service heading only expanded the description, didn't start booking
**Root cause:** Fresha uses separate "Book" buttons — the service heading is just for info expansion
**Fix:** Used JavaScript `page.evaluate()` to find the h3 heading, traverse to container, and click the "Book" button specifically
**Rule:** ALWAYS click the "Book" button, NEVER the service name heading

### [2026-03-30] — Some services have extra booking steps
**What happened:** 6/9 services failed to reach time selection screen
**Root cause:** Some services have intermediate steps (add-ons, variant selection) between Book and time picker
**Fix:** Replaced linear navigation with state machine that repeatedly detects current screen and takes appropriate action (Continue, Select, Skip, Next, or radio button selection)
**Rule:** ALWAYS use the state machine navigation loop — booking flows vary by service
