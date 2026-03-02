# Marketing Automations Design — 4 Autonomous Systems

**Date:** 2026-03-02
**Status:** Approved
**Builds on:** GBP Posting System (Workflow 12, already live)

## Summary

Four autonomous marketing automations that run on schedules, self-review with AI quality gates, and email reports. Each follows the WAT pattern: Workflow + Skill + Tool + Config + Sheets logging + Gmail notification.

| # | Automation | Cadence | Revenue Mechanism |
|---|-----------|---------|-------------------|
| 1 | Google Review Response | Daily | Reputation → trust → bookings |
| 2 | Weekly Competitor Ad Spy | Weekly | Intelligence → better ads → lower CPL |
| 3 | GSC Quick-Win Hunter + Auto GBP Targeting | Bi-weekly | SEO flywheel → organic traffic → free bookings |
| 4 | Wix SEO Auto-Optimiser | Monthly | Higher CTR → more traffic from existing rankings |

## Shared Architecture

All 4 automations share:
- **3-layer AI quality review** (adapted per automation)
- **Gmail notification** via `mcp__google-workspace__gmail_send_email` to mertgulen98@gmail.com
- **Google Sheets logging** for audit trail and performance tracking
- **macOS launchd scheduling** for automated execution
- **Temp files** in `.tmp/{automation}/` for intermediate outputs
- **WAT structure:** Workflow in `workflows/`, Skill in `.agents/skills/`, Tool in `tools/`

## 1. Google Review Response Automation

### Purpose
Auto-respond to Google reviews across all 3 brands within 24 hours. Fast response time improves local SEO ranking and shows potential customers the business cares.

### Files
| File | Purpose |
|------|---------|
| `workflows/13_review_response.md` | SOP |
| `.agents/skills/review-response/SKILL.md` | Skill metadata |
| `.agents/skills/review-response/AGENT.md` | Execution guide |
| `.agents/skills/review-response/config.json` | I/O definition |
| `tools/fetch_google_reviews.py` | Scrape reviews via Playwright |
| `config/gbp/review-response-rules.json` | Response templates and rules |

### Data Flow
```
Google Business Profile → Playwright scrapes reviews
→ Filter: new/unresponded reviews
→ AI generates response (brand voice, empathetic, professional)
→ 2-layer quality review (tone + brand voice)
→ Post response via Playwright
→ Log to Sheets → Email summary
```

### Response Rules by Rating
| Rating | Approach |
|--------|----------|
| 5 stars | Thank by name, reference specifics, invite back |
| 4 stars | Thank, acknowledge minor concern, offer improvement |
| 3 stars | Thank, apologise for specifics, offer to make it right (provide contact) |
| 1-2 stars | Empathetic acknowledgment, sincere apology, invite offline resolution |

### Constraints
- Never argue, never be defensive, never offer compensation publicly
- Each brand uses its persona (Sarah for Spa/Aesthetics, Katya for Slimming)
- Abusive reviews flagged and skipped
- Negative reviews (1-2 stars) still auto-responded but flagged in email for human awareness

### Quality Review
- **Layer 1 — Tone:** Empathetic, professional, not robotic. No copy-paste feeling.
- **Layer 2 — Brand Voice:** Correct persona, sign-off, brand-appropriate language.

### Schedule
Daily at 8am via launchd (`com.carisma.review-response.plist`)

---

## 2. Weekly Competitor Ad Spy

### Purpose
Track competitor Meta ad activity weekly. Detect new ads, killed ads, creative changes, and emerging angles. Provides intelligence for creative strategy and offer positioning.

### Files
| File | Purpose |
|------|---------|
| `workflows/14_competitor_ad_spy.md` | SOP |
| `.agents/skills/competitor-spy/SKILL.md` | Skill metadata |
| `.agents/skills/competitor-spy/AGENT.md` | Execution guide |
| `.agents/skills/competitor-spy/config.json` | I/O definition |
| `tools/scrape_competitor_ads.py` | Pull ads from Meta Ad Library |
| `config/competitors.json` | Competitor Page IDs (needs populating) |

### Data Flow
```
Meta Ad Library API → pull active competitor ads
→ Compare against last week's snapshot (.tmp/research/competitor-snapshot-{date}.json)
→ Detect: new ads, killed ads, creative changes, new angles
→ AI analysis: hooks, offers, creative formats, pricing intelligence
→ Generate actionable brief
→ Log to Sheets → Email intelligence report
```

### Intelligence Categories
- **New creative angles:** hooks, pain points, offers competitors are testing
- **Pricing intelligence:** undercutting, flash sales, new packages
- **Creative format trends:** video vs static, UGC vs polished
- **Seasonal patterns:** what they're pushing this month
- **Ad longevity:** ads running 30+ days = likely winners

### Prerequisite
`config/competitors.json` needs Malta spa/aesthetics/slimming competitor Page IDs populated. Currently all slots are TO_BE_FILLED.

### Schedule
Weekly, Sunday 7pm via launchd (`com.carisma.competitor-spy.plist`)

---

## 3. GSC Quick-Win Hunter + Auto GBP Targeting

### Purpose
Mine Google Search Console data to find keywords where Carisma already ranks but could rank higher. Auto-inject those keywords into GBP keyword banks so the next posting session targets them. Creates a compounding SEO flywheel.

### Files
| File | Purpose |
|------|---------|
| `workflows/15_gsc_quick_wins.md` | SOP |
| `.agents/skills/gsc-hunter/SKILL.md` | Skill metadata |
| `.agents/skills/gsc-hunter/AGENT.md` | Execution guide |
| `.agents/skills/gsc-hunter/config.json` | I/O definition |
| `tools/gsc_quick_win_finder.py` | Pull and analyse GSC data |
| `config/gbp/keywords_{brand}_auto_additions.json` | Auto-discovered keywords |

### Data Flow
```
GSC API → pull search analytics (last 28 days)
→ Identify quick wins:
  - Position 4-20 + high impressions → almost page 1
  - High impressions + low CTR → ranking but not clicked
  - New emerging queries in last 7 days
  - Local intent queries (malta, near me, area names)
→ Cross-reference with GBP keyword banks
→ Auto-add missing keywords, boost priority of underused ones
→ Feed updated priorities into next GBP posting session
→ Log to Sheets → Email report
```

### Quick-Win Categories
| Category | Criteria | Action |
|----------|----------|--------|
| Almost Page 1 | Position 8-20, impressions > 50/mo | Target aggressively in GBP posts |
| Low CTR | Position 1-10, CTR < 3% | Pass to Wix SEO Optimiser |
| Emerging queries | New in last 7 days | Capitalise early with GBP post |
| Local intent | Contains "malta", area names | Perfect for GBP, high priority |

### Integration
- Feeds keywords into `config/gbp/keywords_{brand}_auto_additions.json`
- GBP posting tool (`tools/gbp_generate_posts.py`) reads these additions
- Low CTR findings passed to Wix SEO Optimiser for meta rewrites

### Schedule
Bi-weekly, 1st and 15th at 9am via launchd (`com.carisma.gsc-hunter.plist`)

---

## 4. Wix SEO Auto-Optimiser

### Purpose
Rewrite meta titles and descriptions on underperforming Wix pages to improve click-through rate from Google search results. Targets pages that rank well but don't get clicked.

### Files
| File | Purpose |
|------|---------|
| `workflows/16_wix_seo_optimiser.md` | SOP |
| `.agents/skills/wix-seo/SKILL.md` | Skill metadata |
| `.agents/skills/wix-seo/AGENT.md` | Execution guide |
| `.agents/skills/wix-seo/config.json` | I/O definition |
| `tools/wix_meta_optimiser.py` | Read/write Wix page meta |

### Data Flow
```
GSC API → pull page-level performance (last 30 days)
→ Identify underperforming pages:
  - Impressions > threshold, CTR below site average
  - Pages that dropped in CTR vs previous month
→ Read current meta via Wix MCP
→ AI generates improved meta:
  - Title: <60 chars, keyword front-loaded, compelling
  - Description: <155 chars, includes CTA, addresses search intent
→ 2-layer quality review (SEO best practices + brand voice)
→ Push updates via Wix MCP
→ Log before/after to Sheets → Email summary
```

### Safety Rules
- Never touch pages already above 5% CTR
- Never change meta for pages that improved CTR in the last month
- Maximum 10 pages per run
- Keep a changelog for reverting if CTR drops
- Each brand's website uses its own voice in meta copy

### Quality Review
- **Layer 1 — SEO Best Practices:** Keyword placement, character limits, no keyword stuffing, compelling language
- **Layer 2 — Brand Voice:** Correct tone per brand, no clinical claims without disclaimers

### Schedule
Monthly, 1st of each month at 10am via launchd (`com.carisma.wix-seo.plist`)

---

## Scheduling Summary

| Automation | Cadence | Day/Time | Plist |
|-----------|---------|----------|-------|
| GBP Posting | 2x/week | Mon/Thu 8am | `com.carisma.gbp-content-gen` (active) |
| Review Response | Daily | Every day 8am | `com.carisma.review-response` |
| Competitor Ad Spy | Weekly | Sunday 7pm | `com.carisma.competitor-spy` |
| GSC Quick-Win Hunter | Bi-weekly | 1st/15th 9am | `com.carisma.gsc-hunter` |
| Wix SEO Optimiser | Monthly | 1st 10am | `com.carisma.wix-seo` |

## Cross-Automation Data Flow

```
GSC Quick-Win Hunter ──→ GBP Keyword Banks ──→ GBP Posting
         │
         └──→ Wix SEO Optimiser (low CTR pages)

Competitor Ad Spy ──→ Email Intel Report ──→ Human decisions

Google Reviews ──→ Auto-response ──→ Sheets log
```

The GSC Hunter feeds both the GBP posting system and the Wix optimiser, creating a compounding SEO flywheel. The competitor spy and review response are independent loops.

## Build Order

Build in dependency order. Automations 1 and 2 are independent. Automation 3 must precede 4 (GSC Hunter feeds Wix Optimiser).

| Phase | Automation | Dependencies |
|-------|-----------|-------------|
| A | Google Review Response | None |
| A | Competitor Ad Spy | Needs competitors.json populated |
| B | GSC Quick-Win Hunter | None (but feeds into Phase C) |
| C | Wix SEO Optimiser | Benefits from GSC Hunter data |

Phase A automations can be built in parallel. Phase B after A. Phase C after B.

## MCP Servers Required

| Server | Used By |
|--------|---------|
| playwright | Review Response (scrape + post reviews) |
| google-workspace | All 4 (Sheets logging + Gmail notifications) |
| google-search-console | GSC Hunter, Wix Optimiser |
| wix | Wix Optimiser |
| meta-ads | Competitor Ad Spy |
