# Weekly Competitor Ad Spy System

## Overview

Automated weekly intelligence on competitor Meta ad activity across all 3 Carisma verticals. Tracks new ads launched, ads killed, creative changes, pricing intelligence, and long-running winners via the Meta Ad Library API.

| Category | Competitors | Status |
|----------|-------------|--------|
| Spa | 3 competitors (hotel spas, day spas, wellness retreats) | TO_BE_FILLED |
| Aesthetics | 3 competitors (aesthetic clinics, medical spas, cosmetic practices) | TO_BE_FILLED |
| Slimming | TBD | TO_BE_FILLED |

## How to Use

### Manual Trigger (On-Demand)
Say "run competitor spy" or invoke the `/competitor-spy` skill. The agent will:
1. Fetch current ads for all configured competitors via Meta Ad Library API
2. Compare against the previous week's snapshot to detect changes
3. Analyse new ads for creative angles, pricing, and format trends
4. Generate a structured intelligence report
5. Log results to Google Sheets and email the report

### Automated Weekly Scan (Scheduled)
A launchd job runs every Sunday at 7pm, executing `marketing/competitor-intelligence/tools/scrape_competitor_ads.py --brand_category all`. The snapshot is saved and the intelligence report is generated automatically. On your next session start, the agent reviews the report and highlights key findings.

## File Structure

```
marketing/competitor-intelligence/
├── README.md                    # This file
├── strategy.md                  # Intelligence strategy, goals, analysis framework
└── analysis-templates.md        # Templates for ad analysis and weekly briefs
```

## Related Files

| File | Location | Purpose |
|------|----------|---------|
| Skill definition | `marketing/competitor-intelligence/skill/SKILL.md` | Skill metadata and triggers |
| Execution guide | `marketing/competitor-intelligence/skill/AGENT.md` | 5-phase intelligence workflow |
| Scraper tool | `marketing/competitor-intelligence/tools/scrape_competitor_ads.py` | Python snapshot and diff tool |
| Ad Library scraper | `tools/ad_library_scrape.py` | Playwright-based screenshot capture |
| Workflow SOP | `marketing/competitor-intelligence/workflow.md` | Full workflow documentation |
| Competitor config | `config/competitors.json` | Competitor Page IDs and metadata |
| Brand config | `config/brands.json` | Brand voice, targeting, positioning |
| Launchd plist | `marketing/competitor-intelligence/scheduling/com.carisma.competitor-spy.plist` | macOS scheduling config |
| Skill config | `marketing/competitor-intelligence/skill/config.json` | Skill input/output schema |

## Key Rules

- **No action without analysis:** Raw ad data is useless. Every fetch must produce an intelligence report with actionable insights.
- **Snapshot diffing is mandatory:** Always compare current ads against the previous snapshot. New ads, killed ads, and longevity are the key signals.
- **TO_BE_FILLED competitors:** The system handles missing competitor data gracefully -- warns, skips, and continues with available data.
- **Pricing intelligence:** Extract and track competitor pricing from ad copy. This feeds directly into Carisma's transparent pricing strategy.
- **Weekly cadence:** Sunday evening scan ensures a fresh intelligence brief is ready for Monday morning planning.
- **Long-running winners:** Ads active for 30+ days are likely profitable. Study their creative angles, hooks, and offers closely.
- **UK English:** All reports and analysis use British English spelling throughout.
