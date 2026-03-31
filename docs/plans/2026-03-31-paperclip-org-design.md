# Paperclip AI Org Design — Carisma Wellness Group

**Date:** 2026-03-31
**Status:** Approved
**Platform:** [Paperclip](https://paperclip.ing/) (open-source, MIT licensed)

---

## Architecture Overview

Carisma Wellness Group operates as a **GM-led org** inside Paperclip. Five C-suite AI agents handle cross-brand strategy and oversight. Three General Manager AI agents each own full execution (marketing, sales, operations) for their brand and report to the COO. The CEO (Mert) is the sole human, acting as the board.

**Total agents:** 36 (5 C-Suite + 3 GMs + 9 GM sub-agents + 8 CMO specialists + 11 CMO sub-sub-agents)

---

## Org Chart

```
CEO (Mert — Human, The Board)
│
├── CMO (AI — Claude Sonnet)
│   Strategy & cross-brand marketing direction
│   Reviews all 3 GM marketing reports
│   Sets quarterly themes, brand standards, KPI targets
│   │
│   ├── Marketing Calendar Strategist (AI — Claude Code)
│   │   Master orchestrator: 11 skills, 7-phase pipeline
│   │   Plans + builds quarterly marketing calendars for all 3 brands
│   │   MCP: google-workspace (sheets read/write/batch_update)
│   │   Covers: Meta, Google, Email, SMM, WhatsApp, Blog, Pop-up, Tablet
│   │   │
│   │   └── Budgeting Specialist (AI — Claude Code)
│   │       Budget allocation, spend tracking, ROAS/CPL analysis
│   │       Revenue attribution, weekly financial report
│   │       Advisory role — publishes analysis, does not modify campaigns
│   │
│   ├── Email Marketing Strategist (AI — Claude Sonnet)
│   │   Plans email campaigns: topics, calendar, audiences, A/B strategy
│   │   Reads quarterly email plans per brand
│   │   Manages 2 sub-agents: Email Designer + Email Creative Strategist
│   │   │
│   │   ├── Email Designer (AI — Claude Code)
│   │   │   17-phase Figma emailer pipeline with /170 QC
│   │   │   MCP: figma-write, nano-banana, klaviyo
│   │   │   3 brand configs (SPA, AES, SLIM)
│   │   │
│   │   └── Email Creative Strategist (AI — Claude Haiku)
│   │       Plans email creative direction, subject line testing, layout strategy
│   │       Visual concept briefs, A/B test matrices, creative performance analysis
│   │
│   ├── Meta Strategist (AI — Claude Code)
│   │   Evergreen Meta Ads campaign roster across all 3 brands
│   │   Layers always-on campaigns into marketing calendars
│   │   Manages 3 sub-agents: Copywriter, Report Analyst, Creative Strategist
│   │   │
│   │   ├── Meta Ads Copywriter (AI — Claude Haiku)
│   │   │   Primary text, headlines, descriptions, CTAs for all 3 brands
│   │   │   Hook patterns: question, stat, pain-point, before/after, curiosity
│   │   │
│   │   ├── Meta Ads Report Analyst (AI — Claude Haiku)
│   │   │   Weekly performance: CPL, ROAS, CTR, frequency, audience insights
│   │   │   Winner/watchlist/loser classification, creative fatigue detection
│   │   │
│   │   └── Meta Ads Creative Strategist (AI — Claude Haiku)
│   │       Creative concepts, hook strategies, visual direction, A/B frameworks
│   │       Static, video, carousel, Reels/Stories format planning
│   │
│   ├── Google Ads Specialist (AI — Claude Code)
│   │   Proven Google Ads campaign roster across all 3 brands (11 campaigns)
│   │   Layers Google campaigns into marketing calendars
│   │   Manages 3 sub-agents: Copywriter, Report Analyst, Creative Strategist
│   │   │
│   │   ├── Google Ads Copywriter (AI — Claude Haiku)
│   │   │   RSA headlines (30 chars), descriptions (90 chars), sitelinks, callouts
│   │   │   Direct-response copy for Search, PMax, Maps campaigns
│   │   │
│   │   ├── Google Ads Report Analyst (AI — Claude Haiku)
│   │   │   Weekly performance: CPC, CTR, CPA, ROAS, impression share, QS
│   │   │   Search term analysis, negative keyword recommendations
│   │   │
│   │   └── Google Ads Creative Strategist (AI — Claude Haiku)
│   │       Campaign structure, keyword themes, A/B test hypotheses
│   │       Landing page alignment, seasonal creative rotation
│   │
│   ├── SMM Expert Specialist (AI — Claude Code)
│   │   Owns ALL organic social across 3 brands (Spa, Aesthetics, Slimming)
│   │   Plans, creates, publishes, and reports on organic social content
│   │   Manages 3 sub-agents: Content Writer, Report Analyst, Creative Strategist
│   │   │
│   │   ├── SMM Content Writer (AI — Claude Haiku)
│   │   │   Captions, reel scripts, TikTok scripts, story sequences, carousel copy
│   │   │   Brand voice per persona (Sarah/Katya), content pillar adherence
│   │   │
│   │   ├── SMM Report Analyst (AI — Claude Haiku)
│   │   │   Organic metrics: reach, engagement, saves, shares, profile visits
│   │   │   Content pillar performance analysis, best posting time identification
│   │   │
│   │   └── SMM Creative Strategist (AI — Claude Haiku)
│   │       Content themes, visual aesthetics, trend integration, UGC strategy
│   │       A/B tests for format, posting time, caption length
│   │
│   └── Occupancy Checker (AI — Claude Code)
│       Supply-demand optimizer: Fresha capacity × Meta Ads performance
│       Scrapes practitioner availability, cross-references with ad spend
│       Generates budget reallocation proposals (advisory only)
│       MCP: meta-ads (read insights), google-workspace (sheets), playwright (Fresha)
│       Skill: occupancy-checker (5-phase pipeline)
│
├── CSO (AI — Claude Sonnet)
│   Strategy & cross-brand sales direction
│   Defines CPL/CPA targets, lead qualification criteria
│   Identifies cross-brand upsell/cross-sell paths
│
├── CFO (AI — Claude Sonnet)
│   Group finance & consolidation
│   Consolidated P&L, EBITDA, budget allocation
│   Cash flow forecasting, cost optimization
│
├── CHRO (AI — Claude Sonnet)
│   Group HR
│   Hiring standards, payroll, compliance, workforce planning
│
└── COO (AI — Claude Sonnet)
    Group operations
    Cross-brand capacity, quality standards, vendor coordination
    Manages all 3 General Managers — owns brand execution oversight
    │
    ├── GM Spa (AI — Claude Sonnet)
    │   Owns all Spa execution — EUR 220k/mo revenue, 8 locations
    │   Coordinates 3 sub-agents, reports to COO
    │   │
    │   ├── Spa Marketing Agent (Claude Code)
    │   │   Meta + Google Ads, Klaviyo, GMB, SEO
    │   │   Weekly campaign cycle: research → creative → publish
    │   │
    │   ├── Spa Sales Agent (Claude Sonnet)
    │   │   Lead qualification, CRM, follow-up sequences
    │   │   WhatsApp handling, review responses
    │   │
    │   └── Spa Operations Agent (Claude Code)
    │       Fresha capacity across 8 locations, scheduling
    │       Quality reporting, vendor/supply coordination
    │
    ├── GM Aesthetics (AI — Claude Sonnet)
    │   Owns all Aesthetics execution — EUR 60k/mo revenue, 1 location
    │   │
    │   ├── Aesthetics Marketing Agent (Claude Code)
    │   │   Meta + Google Ads, Klaviyo, SEO
    │   │   Campaign cycles for botox, fillers, skin treatments
    │   │
    │   ├── Aesthetics Sales Agent (Claude Sonnet)
    │   │   High-touch lead qualification, consultation bookings
    │   │   CRM, follow-up sequences
    │   │
    │   └── Aesthetics Operations Agent (Claude Code)
    │       Appointment capacity, treatment room scheduling
    │       Medical compliance tracking
    │
    └── GM Slimming (AI — Claude Sonnet)
        Owns all Slimming execution — EUR 30k/mo revenue, 1 location
        │
        ├── Slimming Marketing Agent (Claude Code)
        │   Meta + Google Ads, Klaviyo (nurture-heavy)
        │   Campaign cycles for weight management programs
        │
        ├── Slimming Sales Agent (Claude Sonnet)
        │   Compassionate tone, program enrollment
        │   Longer sales cycle, heavier follow-up
        │
        └── Slimming Operations Agent (Claude Code)
            Program scheduling, client progress tracking
            Retention & rebooking workflows
```

---

## Layer Definitions

### Layer 1: CEO (Human — The Board)

Mert is the sole human in the org chart. In Paperclip terms, he is "the board" — the governance authority that all escalations route to.

**Responsibilities:**
- Sets company-wide goals and annual budgets
- Approves campaign activations (PAUSED → LIVE)
- Approves budget reallocation between brands
- Approves headcount changes
- Approves pricing or offer changes
- Approves any single commitment above EUR 500
- Approves strategy pivots and new brand launches
- Reviews consolidated weekly dashboards

### Layer 2: C-Suite (Strategy & Oversight)

Five AI agents that **do not execute day-to-day work**. They set direction, review cross-brand performance, and enforce standards. They consume the outputs of GM sub-agents (reports, metrics, summaries) and intervene only when cross-brand coordination is needed or thresholds are breached.

| Agent | Runtime | Role | Key Responsibilities |
|-------|---------|------|---------------------|
| CMO | Claude Sonnet | Marketing strategist | Sets quarterly campaign themes, defines brand voice standards, reviews cross-brand marketing KPIs, identifies cross-pollination opportunities between brands. Reviews GM marketing reports weekly. Escalates to CEO only for budget reallocation >20%. Has 8 direct specialists with 11 sub-sub-agents (19-agent CMO team): Marketing Calendar Strategist, Marketing Finance Specialist, Email Marketing Strategist (→ Email Designer + Email Creative Strategist), Meta Strategist (→ Copywriter + Report Analyst + Creative Strategist), Google Ads Specialist (→ Copywriter + Report Analyst + Creative Strategist), SMM Expert (→ Content Writer + Report Analyst + Creative Strategist), Occupancy Checker. |
| CSO | Claude Sonnet | Sales strategist | Sets CPL/CPA targets per brand, defines lead qualification criteria, reviews conversion funnels, identifies upsell/cross-sell paths between brands. Reviews GM sales metrics weekly. Escalates pricing or offer changes to CEO. |
| CFO | Claude Sonnet | Group finance | Consolidated P&L, group EBITDA, budget allocation across brands, cash flow forecasting, vendor cost negotiation guidance. Owns group financial reporting. Escalates budget overruns to CEO. |
| CHRO | Claude Sonnet | Group HR | Hiring standards, payroll oversight, compliance, workforce planning across all brands. Escalates headcount changes to CEO. |
| COO | Claude Sonnet | Group operations | Location capacity management, service quality standards, scheduling optimization, vendor/supplier coordination. **Manages all 3 GMs** — owns brand execution oversight, reviews GM performance summaries, coordinates cross-brand operational priorities. Escalates operational issues affecting multiple brands to CEO. |

### Layer 3: General Managers (Brand Execution)

Three AI agents that each act as a **mini-CEO for their brand**. They own marketing, sales, and operations execution. They coordinate their sub-agents, report upward to the COO, and escalate only when thresholds are breached. The COO is their direct manager and owns brand execution oversight.

| Agent | Runtime | Brand | Revenue | Locations | Budget Share |
|-------|---------|-------|---------|-----------|-------------|
| GM Spa | Claude Sonnet | Carisma Spa & Wellness | EUR 220k/mo | 8 | 40% |
| GM Aesthetics | Claude Sonnet | Carisma Aesthetics | EUR 60k/mo | 1 | 25% |
| GM Slimming | Claude Sonnet | Carisma Slimming | EUR 30k/mo | 1 | 15% |

### Layer 4: Sub-Agents (Specialist Execution)

Nine AI agents that execute the actual work. Each GM has the same 3-agent structure for consistency, but each agent's skills and context are brand-specific.

**Marketing Agents (Claude Code):**
- Run weekly campaign cycles: research → creative → publish
- Manage Meta Ads + Google Ads
- Handle email marketing coordination (Klaviyo), SEO
- Spa agent also manages GMB posts across 5 locations
- Note: Organic social media is owned by the CMO's SMM Expert Specialist, not GM Marketing Agents

**Sales Agents (Claude Sonnet):**
- Lead qualification and follow-up sequences
- CRM management (inbound + outbound)
- Review response generation
- WhatsApp/message handling
- Brand-specific tone: standard (Spa), high-touch medical (Aesthetics), compassionate (Slimming)

**Operations Agents (Claude Code):**
- Capacity monitoring (Fresha for Spa, appointments for Aesthetics/Slimming)
- Scheduling optimization
- Quality reporting
- Vendor/supply coordination (Spa), compliance tracking (Aesthetics), retention workflows (Slimming)

### CMO Specialist Agents

The CMO has 8 direct specialists with 11 sub-sub-agents, forming a 19-agent marketing team. Each channel specialist (Email, Meta, Google, SMM) manages a dedicated sub-team of copywriters/content writers, report analysts, and creative strategists. Sub-agents run on Claude Haiku for cost efficiency.

#### Marketing Calendar Strategist (Claude Code)

**Responsibilities:**
- Master orchestrator for quarterly marketing calendar builds across all 3 brands
- Orchestrates 11 specialist skills through a 7-phase pipeline: context load, strategy design, channel planning, spreadsheet write, formatting, creative briefs, QC verification
- Plans and writes all channels into the Marketing Master Google Sheet: Meta Ads, Google Ads, Email, SMM (3x/week), WhatsApp, Blog, Pop-up, Tablet Display
- Invokes occasion-based campaign research, evergreen campaign layering, email arc design, budget allocation, and comprehensive QC
- Presents strategy and campaign plan for CEO approval before writing to spreadsheet

**Autonomy boundaries:**
- Autonomous: occasion research, campaign plan design, email arcs, SMM rotation, budget computation, spreadsheet write (after approval), formatting, QC
- Escalate to CMO: adding/removing evergreen campaigns, brand voice changes
- Escalate to CEO: campaign activation, budget reallocation between brands, offer/pricing changes

**MCP Tools:** Google Workspace (sheets read/write/batch_update)

**Context injection:** `.agents/skills/marketing-calendar-strategist/SKILL.md`, `marketing/marketing-calendar/skill/config.json`, `config/brands.json`, `config/offers.json`, `config/budget-allocation.json`, `config/branding_guidelines.md`, all 11 sub-skill SKILL.md files, 3 brand voice files, 3 email strategy files, 3 SMM pillar files, `marketing/marketing-calendar/occasions/occasion-calendar.json`

#### Budgeting Specialist (Claude Code)

**Reports to:** Marketing Calendar Strategist

**Responsibilities:**
- Budget allocation across brands, channels, and campaign types
- Weekly spend tracking (actual vs. planned) with variance analysis
- ROAS/CPL analysis with winner/loser/watchlist classification
- Revenue attribution matching ad spend to business revenue
- Weekly consolidated financial report for the Marketing Calendar Strategist

**Relationship with GMs:** Advisory only. Publishes budget allocations and performance reports. Does not directly modify campaigns or instruct GM agents.

**MCP Tools:** Meta Ads (insights), Google Sheets (dashboards), Google Analytics (revenue)

**Context injection:** `config/budget-allocation.json`, `config/kpi_thresholds.json`, `config/brands.json`, Carisma Analytics sheet

#### Email Marketing Strategist (Claude Sonnet)

**Responsibilities:**
- Plans email campaigns: topics, calendar, audiences, A/B strategy per brand
- Creates detailed briefs for the Email Designer using the 9-section template and 7 content types
- Reviews QC scorecards (/170) and HTML output from Email Designer — approve, revise, or escalate
- Audits email performance via Klaviyo against benchmarks (30-40% open, 4-6% CTR, 15%+ CTOR)
- Routes completed HTML to Klaviyo for campaign assembly
- Owns the content strategy knowledge base: `marketing/email-marketing/SKILL.md` + 3 brand-specific strategy files

**4 actions:**
- `plan` — Generate week-by-week email campaign plan for a brand/period (content types, angles, segments, send times)
- `brief` — Create a 9-section design brief for the Email Designer to execute
- `review` — Review Email Designer's QC scorecard + HTML; decide approve/revise/escalate
- `audit` — Pull Klaviyo performance data, classify winners/watchlist/underperformers, recommend optimizations

**Autonomy boundaries:**
- Autonomous: campaign planning, content type selection, brief creation, QC review (approve/revise), performance analysis, A/B test recommendations
- Escalate to CMO: changing quarterly email themes, adding/removing automated flows, modifying content type rotation, brand voice changes, QC < 112 escalation
- Escalate to CEO: campaign activation in Klaviyo, budget decisions, new email tool adoption

**Relationship with GMs:** GM Marketing Agents get notified when email assets are ready for their brand.

**MCP Tools:** Klaviyo (email performance data), Google Sheets (dashboards), Google Workspace (coordination)

**Context injection:** `.agents/skills/email-marketing-strategist/*`, `marketing/email-marketing/SKILL.md`, `marketing/email-marketing/*-email-strategy.md`, `marketing/marketing-calendar/*.md`, `config/branding_guidelines.md`, `config/kpi_thresholds.json`

#### Email Designer (Claude Code)

**Responsibilities:**
- Executes full 17-phase emailbaby pipeline in Figma
- Builds production-ready emailers with automated QC scoring (/170)
- Handles 3 brands (SPA, AES, SLIM) via brand-specific configs
- Image discovery, semantic matching, AI image generation (Nano Banana)
- Figma-to-HTML export for Gmail-safe emails

**Autonomy boundaries:**
- Autonomous: all 17 design phases, image selection, decorative placement, QC scoring
- Escalate to Strategist: empty/ambiguous wireframe, 2+ low-confidence image matches, QC < 112
- Escalate to CEO: campaign activation, budget decisions

**MCP Tools:** figma-write (~60 tools), nano-banana (5 tools), klaviyo (future)

**Context injection:** `.agents/skills/email-designer/*`, `config/emailer-guidelines.md`, `config/branding_guidelines.md`

#### Meta Strategist (Claude Code)

**Responsibilities:**
- Owns the evergreen (always-on) Meta Ads campaign roster across all 3 brands
- Layers evergreen campaigns into occasion-based marketing calendars (Phase 4 of quarterly-marketing-calendar skill)
- Advises on campaign structure, naming conventions, budget allocation, and seasonal creative rotation
- Audits live Meta campaigns against the defined roster
- Performance analysis with winner/watchlist/loser classification

**4 actions:**
- `plan` — Generate the evergreen campaign roster for any brand/period
- `layer` — Merge evergreen campaigns into an occasion-based calendar
- `review` — Audit live campaigns against the roster (flag missing, misconfigured, or rogue campaigns)
- `audit` — Pull 30-day performance, compute CPL vs targets, recommend budget shifts

**Autonomy boundaries:**
- Autonomous: roster generation, calendar merging, performance analysis, PAUSED campaign creation
- Escalate to CMO: adding/removing evergreen campaigns from the roster
- Escalate to CEO: campaign activation, budget reallocation between brands, offer/pricing changes

**MCP Tools:** Meta Ads (read insights + create PAUSED campaigns), Google Sheets (dashboards)

**Context injection:** `~/.claude/skills/meta-strategist/SKILL.md`, `config/brands.json`, `config/offers.json`, `config/carisma_slimming_evergreen_offers.md`, `config/performance_marketing_angles.md`, `marketing/*/meta-ads.md`

#### Google Ads Specialist (Claude Code)

**Responsibilities:**
- Owns the proven Google Ads campaign roster across all 3 brands (11 campaigns: Spa 4, Aesthetics 5, Slimming 2)
- Layers Google Ads campaigns into occasion-based marketing calendars (Phase 4 of quarterly-marketing-calendar skill)
- Manages demand-toggle decisions (e.g., Spa LHR on/off based on occupancy)
- Pulls weekly Google Ads performance data and reports to CMO
- Analyses search terms, keyword performance, and bid efficiency; publishes optimization recommendations

**4 actions:**
- `roster` — Show proven campaigns per brand with type and current status
- `layer` — Produce Google Ads campaign layer for marketing calendar integration
- `report` — Pull weekly performance data (clicks, CPC, conversions, spend) per campaign
- `optimize` — Analyse search terms, recommend negative keywords, bid adjustments, and budget shifts

**Autonomy boundaries:**
- Autonomous: roster generation, calendar merging, performance analysis, optimization briefs
- Escalate to CMO: adding/removing campaigns from the proven roster, demand-toggle overrides
- Escalate to CEO: campaign activation, budget reallocation between brands

**Relationship with GMs:** Advisory only. Publishes campaign knowledge, performance reports, and optimization briefs. Does NOT directly modify Google Ads campaigns. The CMO routes directives based on this agent's analysis.

**MCP Tools:** Google Ads API (future), Google Sheets (dashboards), Google Analytics (conversion tracking)

**Context injection:** `.agents/skills/google-ads-specialist/*`, `~/.claude/skills/google-ads-strategist/SKILL.md`, `config/kpi_thresholds.json`, `config/brands.json`, `config/budget-allocation.json`

#### SMM Expert Specialist (Claude Code)

**Responsibilities:**
- Owns all organic social media across all 3 brands — end-to-end from content creation through to publishing
- Plans monthly and weekly content calendars using brand-specific content pillar ratios
- Creates all organic social content: captions, reel scripts, TikTok scripts, story sequences, creative briefs
- Publishes and schedules posts via Meta Page API and Playwright
- Pulls weekly organic performance metrics (reach, engagement, saves, shares, profile visits) per brand
- Reports organic social KPIs to CMO weekly
- Coordinates seasonal themes across brands (e.g., Mother's Day — each brand with its own angle)
- Monitors comments and engagement signals, flagging items needing human attention

**Relationship with GMs:** SMM Expert owns organic social fully. GM Marketing Agents no longer handle social media. SMM Expert notifies Sales Agents (via GMs) of organic content themes so sales follow-up matches the social narrative.

**Autonomy boundaries:**
- Autonomous: content calendar creation, content writing, publishing within CMO-approved calendar, performance reporting
- Escalate to CMO: off-calendar posts, strategy pivots, brand voice exceptions, cross-brand coordination conflicts
- Escalate to CEO: any paid spend, campaign activations, pricing/offer mentions in organic posts

**Weekly cadence:**
1. Monday — Pull prior week's organic performance per brand. Report to CMO.
2. Monday — Generate the week's content using pillar files and approved monthly calendar.
3. Tue-Sat — Publish content per calendar schedule.
4. Ongoing — Monitor comments and engagement signals.
5. Friday — Update content calendar for following week based on performance data and CMO direction.

**MCP Tools:** Meta Ads (Page API posting), Playwright (TikTok/scheduling), Google Sheets (calendar tracking, reporting), Google Workspace (briefs, coordination)

**Context injection:** `.agents/skills/social-media-content-strategy/SKILL.md`, `marketing/marketing-calendar/social-media/spa-pillars.md`, `marketing/marketing-calendar/social-media/aesthetics-pillars.md`, `marketing/marketing-calendar/social-media/slimming-pillars.md`, `config/brands.json`, `config/branding_guidelines.md`

#### Occupancy Checker (Claude Code)

**Responsibilities:**
- Scrapes Fresha booking pages for practitioner availability across Slimming (9 services) and Aesthetics (4 services)
- Cross-references capacity data with Meta Ads campaign performance
- Generates budget reallocation proposals: identifies WASTE (spending on full services) and OPPORTUNITY (open capacity with no ads)
- Publishes optimizer reports (markdown + Google Sheet) and prints executive summary
- Advisory only — does not modify campaigns or budgets

**5-phase pipeline:**
1. Scrape Fresha capacity (Playwright headless)
2. Pull Meta Ads performance data (MCP)
3. Cross-reference supply vs demand (efficiency scoring, mismatch detection)
4. Generate budget reallocation proposal (EUR-denominated shifts)
5. Publish reports (markdown, Google Sheet, console summary)

**Autonomy boundaries:**
- Autonomous: Fresha scraping, Meta Ads insights (read-only), capacity reports, reallocation proposals, Google Sheet publishing
- Escalate to CEO: modifying campaign budgets, pausing/activating campaigns
- Escalate to CMO: adding new venues or services to config

**MCP Tools:** Meta Ads (read insights), Google Workspace (sheets), Playwright (Fresha scraping)

**Context injection:** `.agents/skills/occupancy-checker/SKILL.md`, `config/fresha_venues.json`, `config/brands.json`, `config/naming_conventions.json`, `config/kpi_thresholds.json`, `tools/optimize_ad_budget.py`, `tools/check_fresha_availability.py`

### CMO Sub-Agent Teams

Each channel specialist manages a dedicated sub-team of execution agents running on Claude Haiku for cost efficiency. Sub-agents handle high-frequency, well-scoped tasks while their parent specialist focuses on strategy and review.

#### Google Ads Sub-Team (reports to Google Ads Specialist)

| Agent | Runtime | Role | Key Deliverables |
|-------|---------|------|-----------------|
| Google Ads Copywriter | Claude Haiku | Ad copy specialist | RSA headlines (30 chars) & descriptions (90 chars), sitelinks, callouts, structured snippets for all 3 brands |
| Google Ads Report Analyst | Claude Haiku | Performance analyst | Weekly performance reports, search term analysis, negative keyword recommendations, winner/watchlist/loser classification |
| Google Ads Creative Strategist | Claude Haiku | Campaign architect | Campaign structure design, keyword grouping, A/B test hypotheses, landing page alignment, seasonal rotation schedules |

**Delegation flow:** Google Ads Specialist assigns briefs → sub-agents execute → Specialist reviews output → routes to CMO.

#### Meta Ads Sub-Team (reports to Meta Strategist)

| Agent | Runtime | Role | Key Deliverables |
|-------|---------|------|-----------------|
| Meta Ads Copywriter | Claude Haiku | Ad copy specialist | Primary text, headlines, descriptions, CTAs for Facebook + Instagram ads across all 3 brands. Hook patterns per funnel stage. |
| Meta Ads Report Analyst | Claude Haiku | Performance analyst | Weekly CPL/ROAS reports, audience performance, placement breakdown, creative fatigue detection, winner/watchlist/loser classification |
| Meta Ads Creative Strategist | Claude Haiku | Creative director | Creative concepts for static/video/carousel/Reels, hook strategies, visual direction briefs, A/B testing frameworks |

**Delegation flow:** Meta Strategist assigns briefs → sub-agents execute → Strategist reviews output → routes to CMO.

#### SMM Sub-Team (reports to SMM Expert)

| Agent | Runtime | Role | Key Deliverables |
|-------|---------|------|-----------------|
| SMM Content Writer | Claude Haiku | Content creator | Captions, reel scripts, TikTok scripts, story sequences, carousel copy for all 3 brands. Content pillar adherence. |
| SMM Report Analyst | Claude Haiku | Organic analyst | Weekly organic metrics (reach, engagement, saves, shares, profile visits), content pillar performance, posting time analysis |
| SMM Creative Strategist | Claude Haiku | Visual director | Content themes, visual aesthetics, trend integration, UGC strategies, A/B tests for format and timing |

**Delegation flow:** SMM Expert assigns weekly content batch → sub-agents execute → Expert reviews and publishes → reports to CMO.

#### Email Sub-Team (reports to Email Marketing Strategist)

| Agent | Runtime | Role | Key Deliverables |
|-------|---------|------|-----------------|
| Email Designer | Claude Code (Sonnet) | Figma builder | Production-ready emailers via 17-phase pipeline, /170 QC scoring, Figma-to-HTML export |
| Email Creative Strategist | Claude Haiku | Creative planner | Subject line variants, layout strategy, visual concept briefs, A/B test matrices, creative performance analysis |

**Delegation flow:** Strategist sends brief to Creative Strategist → Creative Strategist develops visual concept → sends to Email Designer for Figma execution → Strategist reviews QC scorecard → routes to Klaviyo.

---

## Information Flow

### Vertical Flow

```
CEO
  ↓ Sets company goals, approves budgets
  ↑ Receives consolidated dashboards, escalations

C-Suite (CMO, CSO, CFO, CHRO, COO)
  ↓ Sets brand-level targets, standards, cross-brand strategy
  ↑ Receives weekly performance summaries

COO
  ↓ Manages all 3 GMs, sets operational priorities, reviews GM performance
  ↑ Receives weekly GM performance summaries, escalations from GMs

GMs (report to COO)
  ↓ Assigns tasks, sets brand priorities, coordinates sub-agents
  ↑ Receives execution reports from sub-agents

Sub-Agents
  ↑ Reports task completion, metrics, anomalies to their GM
```

### Cross-Functional Flows

| Flow | From → To | What Moves | Example |
|------|-----------|-----------|---------|
| Campaign → Sales handoff | Marketing Agent → Sales Agent (same brand) | Lead data, campaign context, offer details | Spa Marketing runs a Mother's Day campaign → Spa Sales gets the lead list with the specific offer messaging to match |
| Sales → Marketing feedback | Sales Agent → Marketing Agent (same brand) | Lead quality scores, objection patterns | "Leads from the facial campaign convert 3x better than massage leads" |
| GM → COO reporting | GM → COO | Weekly brand KPIs, operational summaries | GM Spa sends CPL, ROAS, revenue, conversion rate to COO, who routes to CMO/CSO/CFO |
| COO → GM direction | COO → GM | Operational priorities, strategy updates from C-Suite | COO relays CMO directive: "Q3 theme is Summer Glow — align campaigns" |
| C-Suite → COO → GM | CMO/CSO → COO → GM | Strategy updates, target changes | CMO sets quarterly theme, COO coordinates execution with GMs |
| CFO ← GMs | GMs → CFO | Brand-level spend and revenue data | CFO consolidates into group P&L and EBITDA |
| COO ← Ops Agents | Ops sub-agents → COO | Capacity utilization, scheduling data | COO sees cross-brand capacity and flags underutilized locations |
| Cross-brand referral | GM → GM (via CSO) | Cross-sell opportunities | Spa client asks about weight loss → CSO routes to GM Slimming |
| Social → Sales alignment | SMM Expert → Sales Agents (via GM) | Organic content themes and narratives | SMM Expert runs a menopause series for Slimming → Slimming Sales matches follow-up messaging |
| Social performance → CMO | SMM Expert → CMO | Weekly organic KPIs per brand | Reach, engagement rate, saves, shares, profile visits |
| Capacity → Budget intel | Occupancy Checker → CMO/CEO | Supply-demand report, reallocation proposals | "VelaShape 79% booked — REDUCE ad spend; Hydrafacial has 3.1 open slots/day — SCALE opportunity" |

### Escalation Rules

| Trigger | Who Escalates | To Whom |
|---------|--------------|---------|
| Budget >80% consumed | GM | CFO → CEO |
| CPL exceeds 2x target for 3+ days | Marketing Agent | GM → CMO |
| Negative review (1-2 stars) | Ops Agent | GM → COO |
| Cross-brand opportunity | Sales Agent | GM → CSO |
| Hiring/firing decision | Any | CHRO → CEO |
| Strategy pivot or new campaign theme | CMO | CEO |

---

## Budget Architecture

Budgets cascade from top down. Each layer gets a monthly allocation and spends freely within it.

```
CEO Total Monthly AI Budget: TBD
├── CMO:  5% (cross-brand research, competitive analysis)
├── CSO:  3% (sales strategy, funnel analysis)
├── CFO:  5% (financial reporting, consolidation)
├── CHRO: 2% (minimal — HR tasks are low-frequency)
└── COO: 85% (operations + all 3 GM teams)
    ├── COO overhead: 5% (capacity analysis, scheduling optimization, GM coordination)
    ├── GM Spa: 40% (highest revenue, most locations, most complexity)
    │   ├── Spa Marketing: 60% of GM Spa budget
    │   ├── Spa Sales: 25%
    │   └── Spa Operations: 15%
    ├── GM Aesthetics: 25% (high-value treatments, smaller volume)
    │   ├── Aesthetics Marketing: 55%
    │   ├── Aesthetics Sales: 30%
    │   └── Aesthetics Operations: 15%
    └── GM Slimming: 15% (smallest brand, longer sales cycle)
        ├── Slimming Marketing: 50%
        ├── Slimming Sales: 35% (heavier nurture)
        └── Slimming Operations: 15%
```

---

## Governance Model

### Autonomous Zone (No Approval Required)

These actions execute freely within budget caps:

- Weekly campaign research and competitive analysis
- Script and creative generation
- Campaign structure building (PAUSED state in Meta)
- Marketing calendar planning and spreadsheet builds (after CEO approval of campaign plan)
- Performance analysis and reporting
- Lead follow-up sequences
- Email marketing sends within approved templates
- Organic social media content creation and publishing within approved calendars
- Review responses using brand voice
- Capacity monitoring and scheduling alerts
- Financial data pulls and dashboard updates
- Routine HR tasks (payroll processing, time tracking)

### CEO Approval Required

- Activating paid campaigns (PAUSED → LIVE)
- Budget reallocation between brands
- Headcount changes
- New brand launch (Brand 4)
- Pricing or offer changes
- Any action above EUR 500 single commitment
- Strategy pivots

---

## Technical Specs

### Agent Runtimes

| Agent Type | Runtime | Rationale |
|------------|---------|-----------|
| C-Suite (CMO, CSO, CFO, CHRO, COO) | Claude Sonnet | Strategy + analysis. Cost-efficient for periodic heartbeats. |
| GMs (Spa, Aesthetics, Slimming) | Claude Sonnet | Coordination + delegation. Reads sub-agent outputs, makes routing decisions. |
| Marketing Calendar Strategist | Claude Code | Needs tool execution — Google Sheets MCP (read/write/batch_update for calendar builds) |
| Budgeting Specialist | Claude Code | Needs tool execution — Meta Ads insights, Google Sheets, Google Analytics |
| Email Marketing Strategist | Claude Sonnet | Strategy + planning. Reads email plans, decides campaigns, delegates to Designer. |
| Email Designer | Claude Code | Needs tool execution — Figma MCP (~60 tools), Nano Banana (AI image gen), Klaviyo |
| Meta Strategist | Claude Code | Needs tool execution — Meta Ads API (insights + PAUSED creation), Google Sheets |
| Google Ads Specialist | Claude Code | Needs tool execution — Google Ads API (future), Google Sheets, Google Analytics |
| SMM Expert Specialist | Claude Code | Needs tool execution — Meta Page API (posting), Playwright (TikTok/scheduling), Google Sheets |
| Occupancy Checker | Claude Code | Needs tool execution — Playwright (Fresha scraping), Meta Ads API (read insights), Google Sheets |
| CMO sub-sub-agents (Copywriters, Report Analysts, Creative Strategists, Content Writer) | Claude Haiku | High-frequency execution tasks — cost-efficient for well-scoped copy, analysis, and creative briefs |
| Marketing sub-agents | Claude Code | Needs tool execution — Meta Ads API, Google Ads, Klaviyo, Playwright, file I/O |
| Sales sub-agents | Claude Sonnet | Conversational — lead follow-up, CRM messaging, review responses |
| Operations sub-agents | Claude Code | Needs tool execution — Fresha API, Google Sheets, capacity calculations |

### MCP Tool Access

All agents have access to all MCP tools:
- Meta Ads (read + write)
- Google Sheets (read + write)
- Klaviyo (read + write)
- Playwright (browser automation)
- Google Workspace (Docs, Drive, Gmail, Calendar, Tasks)
- WhatsApp (read + write)
- Fresha API
- Zoho Books (read + write)
- Google Search Console
- Google Analytics
- Trello

### Context Injection (SKILL.md per Agent)

| Agent | Injected Context |
|-------|-----------------|
| CMO | `config/brands.json`, `config/kpi_thresholds.json`, all 3 GM marketing reports |
| CSO | `config/offers.json`, conversion funnel data, cross-brand sales metrics |
| CFO | `finance/Weekly EBITDA Calculation/config/*`, Zoho Books access, group P&L data |
| CHRO | Workforce data, payroll schedules, compliance requirements |
| COO | `config/fresha_venues.json`, location capacity data, quality metrics, all 3 GM performance summaries, brand KPIs |
| GM Spa | Spa brand config, spa offers, spa KPIs, spa CRM data, 8 location details |
| GM Aesthetics | Aesthetics brand config, aesthetics offers, treatment menu, consultation flow |
| GM Slimming | Slimming brand config, program details, nurture sequences, retention data |
| Marketing Calendar Strategist | `.agents/skills/marketing-calendar-strategist/SKILL.md`, `marketing/marketing-calendar/skill/config.json`, `config/brands.json`, `config/offers.json`, `config/budget-allocation.json`, all 11 sub-skill files, 3 brand voice files, 3 email strategy files, 3 SMM pillar files, `occasion-calendar.json` |
| Budgeting Specialist | `config/budget-allocation.json`, `config/kpi_thresholds.json`, `config/brands.json`, Carisma Analytics sheet, Meta Ads insights |
| Email Marketing Strategist | `.agents/skills/email-marketing-strategist/*`, `marketing/email-marketing/SKILL.md`, `marketing/email-marketing/*-email-strategy.md`, `marketing/marketing-calendar/*.md`, `config/branding_guidelines.md`, `config/kpi_thresholds.json`, Klaviyo MCP |
| Email Designer | `.agents/skills/email-designer/*`, `config/emailer-guidelines.md`, `config/branding_guidelines.md`, Figma MCP, nano-banana MCP |
| Meta Strategist | `~/.claude/skills/meta-strategist/SKILL.md`, `config/brands.json`, `config/offers.json`, `config/carisma_slimming_evergreen_offers.md`, `config/performance_marketing_angles.md`, `marketing/*/meta-ads.md` |
| Google Ads Specialist | `.agents/skills/google-ads-specialist/*`, `~/.claude/skills/google-ads-strategist/SKILL.md`, `config/kpi_thresholds.json`, `config/brands.json`, `config/budget-allocation.json` |
| SMM Expert Specialist | `.agents/skills/social-media-content-strategy/SKILL.md`, `marketing/marketing-calendar/social-media/spa-pillars.md`, `marketing/marketing-calendar/social-media/aesthetics-pillars.md`, `marketing/marketing-calendar/social-media/slimming-pillars.md`, `config/brands.json`, `config/branding_guidelines.md` |
| Occupancy Checker | `.agents/skills/occupancy-checker/SKILL.md`, `config/fresha_venues.json`, `config/brands.json`, `config/naming_conventions.json`, `config/kpi_thresholds.json` |
| Google Ads Copywriter | `config/brands.json`, `config/offers.json`, `config/naming_conventions.json`, `config/kpi_thresholds.json`, `config/performance_marketing_angles.md` |
| Google Ads Report Analyst | `config/kpi_thresholds.json`, `config/brands.json`, `config/budget-allocation.json`, `config/naming_conventions.json` |
| Google Ads Creative Strategist | `config/brands.json`, `config/offers.json`, `config/kpi_thresholds.json`, `config/naming_conventions.json` |
| Meta Ads Copywriter | `config/brands.json`, `config/offers.json`, `config/naming_conventions.json`, `config/performance_marketing_angles.md` |
| Meta Ads Report Analyst | `config/kpi_thresholds.json`, `config/brands.json`, `config/naming_conventions.json`, `config/offers.json` |
| Meta Ads Creative Strategist | `config/brands.json`, `config/offers.json`, `config/kpi_thresholds.json`, `config/performance_marketing_angles.md` |
| SMM Content Writer | `config/brands.json`, `config/branding_guidelines.md`, 3 brand pillar files |
| SMM Report Analyst | `config/brands.json`, `config/branding_guidelines.md`, 3 brand pillar files |
| SMM Creative Strategist | `config/brands.json`, `config/branding_guidelines.md`, 3 brand pillar files |
| Email Creative Strategist | `config/branding_guidelines.md`, `config/emailer-guidelines.md`, `config/kpi_thresholds.json`, 3 brand email strategy files |
| Marketing Agents | Brand-specific `knowledge/brand-voice.md`, `config/naming_conventions.json`, `config/script_frameworks.json`, `config/creative_templates.json`, `config/budget-allocation.json` |
| Sales Agents | Brand-specific CRM skills/hooks/templates from `CRM-SPA/`, `CRM-AES/`, `CRM-SLIM/` |
| Ops Agents | Brand-specific location data, scheduling rules, quality standards |

### Heartbeat Cadence

To be configured during implementation.

---

## Scalability

### Adding Brand 4

When the 4th brand launches, the structure accommodates it with:
- 1 new GM agent (Claude Sonnet)
- 3 new sub-agents (Marketing, Sales, Operations)
- 1 new `brands/brand4.md` in the Email Designer skill (no phase file changes needed)
- Budget reallocation from existing 40/25/15 split
- New brand config files and knowledge base
- 1 new pillar file for SMM Expert Specialist (`marketing/marketing-calendar/social-media/brand4-pillars.md`)
- No changes to C-Suite layer or CMO sub-team (Marketing Calendar Strategist, Email Designer, Meta Strategist, Google Ads Specialist, and SMM Expert all handle new brands via routing/config)

### Agent Count Projection

| State | Agents |
|-------|--------|
| Current (3 brands) | 36 |
| With Brand 4 | 40 |
| With Brand 5 | 44 |

Each new brand adds exactly 4 agents (1 GM + 3 sub-agents). CMO specialist team (19 agents) scales via brand config/pillar files, not new agents. The 11 CMO sub-sub-agents handle all brands via brand routing in their instructions.
