# Google Review Response System

## Overview

Automated Google review monitoring and response generation for all 3 Carisma brands across 7 locations.

| Brand | Locations | Response Cadence |
|-------|-----------|-----------------|
| Carisma Spa | 5 (AX Sunny Coast, Hugo's, Hyatt, InterContinental, Ramla Bay) | Daily |
| Carisma Aesthetics | 1 (St Julian's) | Daily |
| Carisma Slimming | 1 (Floriana) | Daily |

## How to Use

### Manual Trigger (Phase 1)
Say "respond to reviews" or invoke the `/review-response` skill. The agent will:
1. Fetch recent Google reviews via Playwright browser automation
2. Filter for unresponded reviews and categorise by rating
3. Generate brand-appropriate responses using response rules and templates
4. Run AI quality review (tone + brand voice)
5. Post responses via Playwright
6. Log results to Google Sheets and send email notification

### Automated Fetch (Phase 2)
A launchd job runs daily at 8am, generating a review fetch plan to `.tmp/reviews/fetched/`. On your next session start, the agent processes unresponded reviews and generates responses.

## File Structure

```
marketing/google-reviews/
├── README.md                       # This file
├── review-response-rules.json      # Response rules per rating tier, brand contacts, forbidden phrases
└── response-templates.md           # Per-brand response templates for each rating tier
```

## Related Files

| File | Location | Purpose |
|------|----------|---------|
| Skill definition | `marketing/google-reviews/skill/SKILL.md` | Skill metadata and triggers |
| Execution guide | `marketing/google-reviews/skill/AGENT.md` | 7-phase response workflow |
| Skill config | `marketing/google-reviews/skill/config.json` | Skill configuration and brand settings |
| Review fetcher | `marketing/google-reviews/tools/fetch_google_reviews.py` | Python review fetch and plan generation tool |
| Workflow SOP | `marketing/google-reviews/workflow.md` | Full workflow documentation |
| Brand config | `config/brands.json` | Brand voice, targeting, GBP settings |
| Location data | `marketing/google-gmb/locations.json` | GBP profile URLs and location details |
| Launchd plist | `marketing/google-reviews/scheduling/com.carisma.review-response.plist` | macOS daily scheduling config |

## Key Rules

- **Approval gate:** 1-2 star reviews are flagged for human review before responding (MANDATORY)
- **Response via Playwright:** Browser automation to GBP dashboard (requires Google sign-in)
- **Daily cadence:** Reviews are checked and responded to every day
- **Brand voice:** Each brand has a distinct persona and sign-off (Sarah Caballeri / Sarah / Katya)
- **Forbidden phrases:** Never use defensive or dismissive language (see `review-response-rules.json`)
- **Abusive reviews:** Flagged and skipped -- never respond to abusive or spam reviews
- **UK English:** All responses must use British English spelling throughout
- **Contact details:** Include email and phone for 3-star and below reviews
