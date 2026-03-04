# Google Business Profile (GBP) Posting System

## Overview

Automated GBP content generation and publishing for all 3 Carisma brands across 7 locations.

| Brand | Locations | Posting Cadence |
|-------|-----------|----------------|
| Carisma Spa | 5 (AX Sunny Coast, Hugo's, Hyatt, InterContinental, Ramla Bay) | 2x/week, copied to all |
| Carisma Aesthetics | 1 (St Julian's) | 2x/week |
| Carisma Slimming | 1 (Floriana) | 2x/week |

## How to Use

### Manual Trigger (Phase 1)
Say "run GBP posting" or invoke the `/gbp-posting` skill. The agent will:
1. Generate posts using keyword banks and templates
2. Present drafts for your approval
3. Post to GBP via Playwright browser automation
4. Log results to Google Sheets

### Automated Draft Generation (Phase 2)
A launchd job runs every Monday and Thursday at 8am, generating draft posts to `.tmp/gbp/drafts/`. On your next session start, `check_pending_gbp_drafts.py` alerts you to review and publish.

## File Structure

```
marketing/google-gmb/
├── README.md                    # This file
├── locations.json               # GBP profile URLs and location data
├── strategy.md                  # Posting strategy, goals, KPIs, compliance
├── content-calendar.json        # Rotation rules, seasonal overrides
├── keyword-banks/
│   ├── spa-keywords.md          # Spa SEO keywords by category
│   ├── aesthetics-keywords.md   # Aesthetics keywords
│   └── slimming-keywords.md     # Slimming keywords
├── templates/
│   ├── update-templates.md      # "What's new" post templates (6 templates)
│   ├── offer-templates.md       # Offer post templates (3 templates)
│   └── event-templates.md       # Event post templates (2 templates)
└── post-log/
    └── README.md                # How posts are tracked in Google Sheets
```

## Related Files

| File | Location | Purpose |
|------|----------|---------|
| Skill definition | `marketing/google-gmb/skill/SKILL.md` | Skill metadata and triggers |
| Execution guide | `marketing/google-gmb/skill/AGENT.md` | 6-phase posting workflow |
| Post generator | `marketing/google-gmb/tools/gbp_generate_posts.py` | Python content generation tool |
| Draft checker | `marketing/google-gmb/tools/check_pending_gbp_drafts.py` | Session-start draft detection |
| Workflow SOP | `marketing/google-gmb/workflow.md` | Full workflow documentation |
| Brand config | `config/brands.json` | Brand voice, targeting, GBP settings |
| Offers config | `config/offers.json` | Active offers with GBP fields |
| Launchd plist | `marketing/google-gmb/scheduling/com.carisma.gbp-content-gen.plist` | macOS scheduling config |

## Key Rules

- **Approval gate:** Human always reviews posts before publishing (MANDATORY)
- **Posting via Playwright:** Browser automation to GBP dashboard (requires Google sign-in)
- **Spa multi-location:** Post once, use "Copy post" to replicate to all 5 locations
- **Keyword rotation:** No same primary keyword within 3 consecutive posts
- **Template rotation:** No same template within 4 consecutive posts
- **Character limit:** 1,500 max, 400-700 optimal
- **Brand voice:** Each brand has distinct voice (see `strategy.md` and keyword banks)
