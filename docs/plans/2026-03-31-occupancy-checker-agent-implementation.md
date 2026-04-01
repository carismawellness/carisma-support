# Occupancy Checker Agent Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Paperclip agent skill under the CMO that combines Fresha capacity data with Meta Ads performance to generate budget reallocation proposals.

**Architecture:** Single-skill agent with 5-phase pipeline (Scrape -> Pull Ads -> Cross-Reference -> Reallocate -> Publish). Follows the Email Designer agent pattern: `config.json` + `SKILL.md` + `phases/*.md` + `references/`. Depends on existing `tools/check_fresha_availability.py` and a new `tools/optimize_ad_budget.py`.

**Tech Stack:** Paperclip agent skill (markdown), Python (optimizer tool), Meta Ads MCP (read insights), Google Sheets MCP (write reports), Playwright (Fresha scraping via existing tool)

---

## Task 1: Scaffold Agent Directory and config.json

**Files:**
- Create: `.agents/skills/occupancy-checker/config.json`

**Step 1: Create directory structure**

```bash
mkdir -p ".agents/skills/occupancy-checker/phases"
mkdir -p ".agents/skills/occupancy-checker/references"
```

**Step 2: Write config.json**

Model after `.agents/skills/email-designer/config.json`. Key differences: different MCP tools (meta-ads, google-sheets, playwright instead of figma-write/nano-banana), different inputs (venue instead of brand), reports to CMO instead of Email Strategist.

```json
{
  "name": "occupancy-checker",
  "type": "skill",
  "description": "Supply-demand optimizer for the CMO. Scrapes Fresha for practitioner availability, pulls Meta Ads performance data, cross-references capacity vs ad spend, and generates budget reallocation proposals. Advisory role — publishes proposals, does not modify campaigns.",
  "version": "1.0.0",
  "author": "Carisma",
  "user-invocable": true,
  "allowed-tools": "Bash, Read, Write, Edit, Glob, Grep, Task, ToolSearch",
  "argument-hint": "[slimming|aesthetics|all]",
  "metadata": {
    "agent-role": "Occupancy Checker",
    "reports-to": "CMO",
    "runtime": "Claude Code",
    "org-layer": "CMO Sub-Team",
    "tags": ["fresha", "capacity", "meta-ads", "budget", "optimization", "paperclip"],
    "triggers": [
      "occupancy",
      "capacity check",
      "check availability",
      "budget reallocation",
      "supply demand"
    ]
  },
  "inputs": {
    "venue": {
      "type": "string",
      "enum": ["slimming", "aesthetics", "all"],
      "description": "Which venue(s) to check. Defaults to all.",
      "required": false,
      "default": "all"
    },
    "days": {
      "type": "integer",
      "description": "Number of days to check ahead on Fresha. Defaults to 14.",
      "required": false,
      "default": 14
    }
  },
  "outputs": {
    "capacity_report": {
      "type": "object",
      "description": "Per-service capacity data from Fresha at .tmp/performance/fresha_capacity_report.json"
    },
    "optimizer_report": {
      "type": "string",
      "description": "Markdown report with reallocation proposals at .tmp/performance/occupancy-optimizer-report.md"
    },
    "google_sheet": {
      "type": "string",
      "description": "Updated Google Sheet with capacity + spend + proposed reallocation"
    }
  },
  "execution": {
    "timeout": 600,
    "environment": "python",
    "requires_context": ["meta-ads MCP", "google-workspace MCP"]
  },
  "integrations": {
    "reads": [
      "config/fresha_venues.json",
      "config/brands.json",
      "config/naming_conventions.json",
      "config/kpi_thresholds.json",
      "workflows/12_capacity_check.md",
      ".tmp/performance/fresha_capacity_report.json",
      ".tmp/performance/meta_ads_by_service.json"
    ],
    "mcp_servers": ["meta-ads", "google-workspace", "playwright"]
  }
}
```

**Step 3: Commit**

```bash
git add .agents/skills/occupancy-checker/config.json
git commit -m "feat: scaffold occupancy-checker agent with config.json"
```

---

## Task 2: Write the Main SKILL.md (Router + Pipeline)

**Files:**
- Create: `.agents/skills/occupancy-checker/SKILL.md`

**Step 1: Write SKILL.md**

This is the main entry point. It defines the agent identity, input/output contract, and the 5-phase execution flow. It routes to phase files for detailed instructions.

```markdown
---
name: occupancy-checker
description: "Supply-demand optimizer for the CMO. Scrapes Fresha for practitioner availability, cross-references with Meta Ads performance, and generates budget reallocation proposals. Advisory only — does not modify campaigns or budgets."
version: "1.0.0"
user-invocable: true
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Task, ToolSearch
argument-hint: "[slimming|aesthetics|all]"
metadata:
  author: Carisma
  agent-role: Occupancy Checker
  reports-to: CMO
  runtime: Claude Code
  org-layer: CMO Sub-Team
  tags:
    - fresha
    - capacity
    - meta-ads
    - budget
    - optimization
    - paperclip
  triggers:
    - "occupancy"
    - "capacity check"
    - "check availability"
    - "budget reallocation"
    - "supply demand"
---

# Occupancy Checker — Paperclip Agent

You are the **Occupancy Checker**, a specialist agent in the CMO's sub-team. You ensure ad spend matches practitioner availability. No point advertising a service when the practitioner is fully booked.

## Agent Identity

| Property | Value |
|----------|-------|
| Title | Occupancy Checker |
| Reports to | CMO |
| Runtime | Claude Code |
| Trigger | `/occupancy [venue]` or delegated by CMO/GM |
| MCP tools | meta-ads (read insights), google-workspace (sheets), playwright (Fresha) |
| Venues | slimming, aesthetics, all (default) |

## Input/Output Contract

### Receives

| Input | Source | Required | Default |
|-------|--------|----------|---------|
| Venue | User/CMO | No | `all` |
| Days | User | No | `14` |

### Delivers

| Output | Path | Consumer |
|--------|------|----------|
| Capacity report JSON | `.tmp/performance/fresha_capacity_report.json` | Pipeline agents |
| Optimizer markdown | `.tmp/performance/occupancy-optimizer-report.md` | CMO, CEO |
| Google Sheet update | Configured sheet | CEO (human review) |
| Console summary | Printed | Whoever triggered |

---

## Execution Flow

When triggered with `/occupancy [venue]`:

1. **Parse venue** from argument (default: `all`)
2. **Load shared references:** Read `references/decision-matrix.md`
3. **Load config files:** Read `config/fresha_venues.json`, `config/brands.json`, `config/naming_conventions.json`, `config/kpi_thresholds.json`
4. **Execute Phase 1** — Scrape Fresha capacity (`phases/phase-1-scrape.md`)
5. **Execute Phase 2** — Pull Meta Ads data (`phases/phase-2-pull-ads.md`)
6. **Execute Phase 3** — Cross-reference supply vs demand (`phases/phase-3-crossref.md`)
7. **Execute Phase 4** — Generate reallocation proposal (`phases/phase-4-reallocate.md`)
8. **Execute Phase 5** — Publish reports (`phases/phase-5-publish.md`)
9. **Print executive summary** to console

### Phase File Resolution

For each phase, read `.agents/skills/occupancy-checker/phases/<phase>.md`. Phase files contain the HOW. Config files contain the WHAT.

### MCP Tool Loading

Before any external API work, load MCP tools:
```
ToolSearch: "+meta-ads"         → loads Meta Ads insights tools
ToolSearch: "+google-workspace" → loads Google Sheets tools
```

Fresha scraping uses `tools/check_fresha_availability.py` via Bash (Playwright headless).

---

## Autonomy Boundaries

| Action | Authority |
|--------|-----------|
| Run Fresha scraper | Autonomous |
| Pull Meta Ads insights (read-only) | Autonomous |
| Generate capacity report | Autonomous |
| Generate reallocation proposal | Autonomous |
| Publish to Google Sheet | Autonomous |
| Modify campaign budgets | **Escalate to CEO** |
| Pause/activate campaigns | **Escalate to CEO** |
| Add new venue/service to config | Escalate to CMO |

---

## If No Venue Argument

Default to `all` and process both venues:
- **slimming** — Carisma Slimming (Floriana, 9 services, 4 team members)
- **aesthetics** — Carisma Aesthetics (St Julian's, 4 services)

---

## Error Handling

### Meta Ads Token Expired
If Meta Ads API returns auth error, skip Phases 2-4. Run Phase 1 only and publish a capacity-only report. Flag: "Meta Ads token expired. Capacity-only mode. Reallocation requires valid token."

### Fresha Scraper Failure
If a service fails to scrape, continue with remaining services. Log failures in the report under a "Scraper Issues" section. Check debug screenshots at `.tmp/performance/debug/`.

### No Active Campaigns
If a service has open capacity but no campaigns, flag as "Launch Opportunity" in the reallocation proposal.

---

## Related Files

| File | Purpose |
|------|---------|
| `references/decision-matrix.md` | Capacity → ad action decision rules |
| `phases/phase-1-scrape.md` | Fresha scraping instructions |
| `phases/phase-2-pull-ads.md` | Meta Ads data pull |
| `phases/phase-3-crossref.md` | Supply-demand crossref |
| `phases/phase-4-reallocate.md` | Budget reallocation logic |
| `phases/phase-5-publish.md` | Report + Sheet publishing |
| `tools/check_fresha_availability.py` | Fresha scraper (existing) |
| `tools/optimize_ad_budget.py` | Budget optimizer (new) |
| `config/fresha_venues.json` | Venue URLs and services |
| `config/brands.json` | Meta ad account IDs |
| `config/naming_conventions.json` | Campaign naming patterns |
| `config/kpi_thresholds.json` | CPL targets |
| `workflows/12_capacity_check.md` | Capacity workflow docs |
```

**Step 2: Commit**

```bash
git add .agents/skills/occupancy-checker/SKILL.md
git commit -m "feat: add occupancy-checker SKILL.md with 5-phase pipeline"
```

---

## Task 3: Write the Decision Matrix Reference

**Files:**
- Create: `.agents/skills/occupancy-checker/references/decision-matrix.md`

**Step 1: Write decision-matrix.md**

This is the core logic reference that Phase 3 and Phase 4 use. Extracted from `workflows/12_capacity_check.md` and extended with ads crossref rules.

```markdown
# Decision Matrix — Capacity x Ad Spend

## Capacity Classification

Thresholds from `config/fresha_venues.json` → `scraper_config.capacity_thresholds`:

| Level | Avg Slots/Day | Fully Booked % | Classification |
|-------|--------------|----------------|----------------|
| Full | 0 | 90%+ | PAUSE |
| Limited | < 3 | 60%+ | REDUCE |
| Moderate | 3-6 | < 60% | MAINTAIN |
| Open | 6+ | < 60% | SCALE |

## Reallocation Rules

| Capacity | Current Ad Status | Proposed Action | Budget Impact |
|----------|-------------------|-----------------|---------------|
| PAUSE | Running campaigns | Pause all campaigns for this service | Save EUR X/day |
| PAUSE | No campaigns | No action needed | None |
| REDUCE | High budget (>EUR 20/day) | Reduce to EUR 5/day awareness minimum | Save EUR (X-5)/day |
| REDUCE | Low budget (<EUR 10/day) | Keep as-is | None |
| REDUCE | No campaigns | No action needed | None |
| MAINTAIN | Running campaigns | Keep current budget | None |
| MAINTAIN | No campaigns | Consider launching (low priority) | Allocate from savings |
| SCALE | Running at low budget | Increase budget from savings pool | Spend EUR Y/day more |
| SCALE | Running at high budget | Keep current budget | None |
| SCALE | No campaigns | **Launch Opportunity** — recommend new campaign | Allocate from savings |

## Override Rule

**Capacity ALWAYS overrides performance.**

A winning ad (CPL below target, 5+ leads) should still be REDUCED or PAUSED if its service has no available slots. Present both data points:
- Performance verdict: WINNER / LOSER / MARGINAL
- Capacity verdict: PAUSE / REDUCE / MAINTAIN / SCALE
- Final action: Capacity verdict wins

## Budget Redistribution Logic

1. Calculate total savings from PAUSE + REDUCE actions
2. Rank SCALE opportunities by: open capacity (highest first), then CPL efficiency (lowest first)
3. Distribute savings to SCALE opportunities proportionally
4. Never exceed 30% budget increase per service in a single cycle
5. Keep EUR 5/day minimum for REDUCE services (brand awareness)
6. Flag any reallocation >EUR 50/day for CEO approval

## Service-to-Campaign Mapping

Use `config/naming_conventions.json` to map:
- Campaign offer code → Fresha service name
- Brand code (CS/CA) → Venue (slimming/aesthetics)

Mapping table (extend as new campaigns launch):

| Campaign Offer Code | Fresha Service | Venue |
|---------------------|----------------|-------|
| SPADAY | [Spa services - TBD] | spa |
| BOTOX | [Aesthetics - TBD] | aesthetics |
| FILLER | [Aesthetics - TBD] | aesthetics |
| LIPO | Lipocavitation | slimming |
| COOLSC | CoolSculpting | slimming |
| EMSC | Emsculpt NEO | slimming |
| VELA | VelaShape | slimming |
| HYDRA | 4-1 hydrafacial | aesthetics |
| JAWLINE | Snatch jawline | aesthetics |
| LIPGLOW | Lip & Glow | aesthetics |
| FACELIFT | Ultimate facelift | aesthetics |

**Note:** This mapping will grow as new campaigns launch. When a campaign can't be mapped, flag it in the report as "unmapped" and fall back to brand-level analysis.
```

**Step 2: Commit**

```bash
git add .agents/skills/occupancy-checker/references/decision-matrix.md
git commit -m "feat: add decision matrix reference for occupancy-checker"
```

---

## Task 4: Write Phase 1 — Scrape Capacity

**Files:**
- Create: `.agents/skills/occupancy-checker/phases/phase-1-scrape.md`

**Step 1: Write phase-1-scrape.md**

```markdown
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
```

**Step 2: Commit**

```bash
git add .agents/skills/occupancy-checker/phases/phase-1-scrape.md
git commit -m "feat: add phase 1 (scrape capacity) for occupancy-checker"
```

---

## Task 5: Write Phase 2 — Pull Ad Performance

**Files:**
- Create: `.agents/skills/occupancy-checker/phases/phase-2-pull-ads.md`

**Step 1: Write phase-2-pull-ads.md**

```markdown
# Phase 2 — Pull Meta Ads Performance Data

## Objective
Get current ad spend and performance metrics for all active campaigns, mapped to services.

## Prerequisites
- Phase 1 complete (capacity data available)
- Meta Ads MCP loaded: `ToolSearch: "+meta-ads"`
- `config/brands.json` loaded (ad account IDs)
- `config/naming_conventions.json` loaded (campaign naming patterns)

## Procedure

### Step 1: Load MCP tools

```
ToolSearch: "+meta-ads"
```

### Step 2: Pull campaign insights for each brand

For each brand in `config/brands.json`:

1. Get the `meta_ad_account_id`
2. Call `mcp__meta-ads__get_campaigns` to list active campaigns
3. For each active campaign, call `mcp__meta-ads__get_insights` with:
   - `date_preset`: `last_7d`
   - `fields`: `campaign_name,spend,impressions,clicks,actions,cost_per_action_type`
4. Extract: campaign name, total spend (7d), leads (7d), CPL, status

### Step 3: Map campaigns to services

Using `config/naming_conventions.json` and `references/decision-matrix.md` mapping table:

1. Parse campaign name: `{brand_code}_{objective}_{offer}_{date}`
2. Extract the `offer` component
3. Look up the offer code in the mapping table to find the Fresha service name
4. Group campaigns by service

Example:
- `CS_LEAD_LIPO_20260301` → offer=LIPO → service=Lipocavitation → venue=slimming
- `CA_LEAD_HYDRA_20260315` → offer=HYDRA → service=4-1 hydrafacial → venue=aesthetics

### Step 4: Handle unmapped campaigns

If a campaign's offer code isn't in the mapping table:
- Log it as "unmapped"
- Include it in the brand-level summary but not service-level crossref
- Flag in the report for human review

### Step 5: Handle Meta Ads auth errors

If the Meta Ads API returns an OAuth error (token expired):
- Log: "Meta Ads token expired. Skipping Phases 2-4."
- Write a capacity-only report (Phase 1 data only) to `.tmp/performance/occupancy-optimizer-report.md`
- Skip to Phase 5 (publish capacity-only)
- Set phase status: SKIPPED (auth_error)

### Step 6: Save ads data

Write the mapped data to `.tmp/performance/meta_ads_by_service.json`:

```json
{
  "generated_at": "2026-03-31T10:00:00",
  "date_range": "last_7d",
  "brands": {
    "carisma_spa": {
      "ad_account_id": "act_654279452039150",
      "campaigns": [...]
    },
    "carisma_aesthetics": {
      "ad_account_id": "act_382359687910745",
      "campaigns": [...]
    }
  },
  "by_service": {
    "Lipocavitation": {
      "venue": "slimming",
      "campaigns": [...],
      "total_spend_7d": 45.00,
      "total_leads_7d": 6,
      "avg_cpl": 7.50,
      "daily_spend": 6.43
    }
  },
  "unmapped_campaigns": [...]
}
```

## Output
- `.tmp/performance/meta_ads_by_service.json` — ads data mapped to services
- Phase status: COMPLETE, SKIPPED (auth_error), or FAILED
```

**Step 2: Commit**

```bash
git add .agents/skills/occupancy-checker/phases/phase-2-pull-ads.md
git commit -m "feat: add phase 2 (pull ads) for occupancy-checker"
```

---

## Task 6: Write Phase 3 — Cross-Reference Supply vs Demand

**Files:**
- Create: `.agents/skills/occupancy-checker/phases/phase-3-crossref.md`

**Step 1: Write phase-3-crossref.md**

```markdown
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
- `.tmp/performance/fresha_capacity_report.json` → capacity data
- `.tmp/performance/meta_ads_by_service.json` → ads data

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

For each service:
```
efficiency_score = (capacity_verdict_weight * ad_alignment_weight)
```

Where:
- PAUSE + high spend = 0 (worst — pure waste)
- SCALE + high performing campaign = 100 (best — maximizing opportunity)
- MAINTAIN + moderate spend = 75 (good — steady state)

Simplified scoring:
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
```

**Step 2: Commit**

```bash
git add .agents/skills/occupancy-checker/phases/phase-3-crossref.md
git commit -m "feat: add phase 3 (crossref supply-demand) for occupancy-checker"
```

---

## Task 7: Write Phase 4 — Generate Reallocation Proposal

**Files:**
- Create: `.agents/skills/occupancy-checker/phases/phase-4-reallocate.md`

**Step 1: Write phase-4-reallocate.md**

```markdown
# Phase 4 — Generate Budget Reallocation Proposal

## Objective
Using the crossref data, produce specific EUR-denominated budget shifts between services.

## Prerequisites
- Phase 3 complete: `.tmp/performance/occupancy-crossref.json`
- `references/decision-matrix.md` loaded (redistribution rules)
- `config/kpi_thresholds.json` loaded (CPL targets)

## Procedure

### Step 1: Calculate savings pool

For each service where action = PAUSE or REDUCE:
- PAUSE: savings = current daily_spend (entire budget freed)
- REDUCE: savings = current daily_spend - EUR 5 (keep minimum awareness)
- Total savings = sum of all freed budget

### Step 2: Rank scale opportunities

For each service where action = SCALE or MISSED OPPORTUNITY:
- Sort by: open capacity (highest avg_slots_per_day first)
- Secondary sort: CPL efficiency (lowest CPL first, if campaigns exist)
- Tertiary: new campaign opportunities last (no CPL data yet)

### Step 3: Distribute savings

Apply redistribution rules from decision-matrix.md:
1. Distribute savings proportionally to SCALE opportunities
2. Cap any single increase at 30% above current spend
3. For new campaign launches (no existing campaigns), allocate EUR 15/day starting budget
4. If total savings exceeds total scale needs, note the surplus

### Step 4: Build reallocation table

| Priority | Service | Current Spend | Proposed Spend | Change | Reason |
|----------|---------|---------------|----------------|--------|--------|
| 1 | Lipocavitation | EUR 20/day | EUR 5/day | -EUR 15 | 79% booked, 0.4 slots/day |
| 2 | 4-1 hydrafacial | EUR 8/day | EUR 20/day | +EUR 12 | 3.1 slots/day, MAINTAIN capacity |
| ... | ... | ... | ... | ... | ... |
| **Net** | | **EUR X** | **EUR X** | **EUR 0** | Budget-neutral reallocation |

### Step 5: Flag CEO approvals

If any single reallocation exceeds EUR 50/day change, flag:
```
CEO APPROVAL REQUIRED: [Service] budget change of EUR X/day exceeds EUR 50 threshold
```

### Step 6: Generate executive summary

```
OCCUPANCY OPTIMIZER — Executive Summary
========================================
Date: {date}
Venues scanned: {count}
Services analyzed: {count}

WASTE DETECTED: {N} services over-advertised (EUR X/day wasted)
OPPORTUNITIES: {M} services under-advertised (EUR Y/day potential)
PROPOSED SHIFT: EUR Z/day from constrained → open services

Top 3 Actions:
1. [Highest impact action]
2. [Second highest]
3. [Third highest]
```

## Output
- Reallocation proposal (structured data for Phase 5)
- Executive summary text
- CEO approval flags (if any)
- Phase status: COMPLETE
```

**Step 2: Commit**

```bash
git add .agents/skills/occupancy-checker/phases/phase-4-reallocate.md
git commit -m "feat: add phase 4 (reallocation proposal) for occupancy-checker"
```

---

## Task 8: Write Phase 5 — Publish Reports

**Files:**
- Create: `.agents/skills/occupancy-checker/phases/phase-5-publish.md`

**Step 1: Write phase-5-publish.md**

```markdown
# Phase 5 — Publish Reports

## Objective
Publish the optimizer results as a markdown report, Google Sheet update, and console summary.

## Prerequisites
- Phase 4 complete (reallocation proposal generated)
- Google Workspace MCP loaded: `ToolSearch: "+google-workspace"`

## Procedure

### Step 1: Write markdown report

Save to `.tmp/performance/occupancy-optimizer-report.md`:

```markdown
# Occupancy Optimizer Report
## Date: {date} | Venues: {venues scanned}

### Executive Summary
{executive summary from Phase 4}

### Service-by-Service Analysis

| Service | Venue | Capacity | Booked % | Slots/Day | Campaigns | Spend/Day | CPL | Efficiency | Action |
|---------|-------|----------|----------|-----------|-----------|-----------|-----|------------|--------|
| {for each service} |

### Budget Reallocation Proposal

| Priority | Service | Current | Proposed | Change | Reason |
|----------|---------|---------|----------|--------|--------|
| {reallocation table from Phase 4} |

### Mismatch Alerts

**WASTE (high spend, no capacity):**
{list waste services}

**OPPORTUNITIES (open capacity, low/no spend):**
{list opportunity services}

### Data Sources
- Fresha: scraped {date}, {N} days lookahead
- Meta Ads: last 7 days, {M} active campaigns
- Services mapped: {X} of {Y} campaigns

### Scraper Issues
{any services that failed to scrape, with debug screenshot paths}

### CEO Approval Required
{any reallocation exceeding EUR 50/day threshold}
```

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

Print the executive summary from Phase 4 directly to console output. This is what the CMO/CEO sees immediately when the skill finishes.

## Output
- `.tmp/performance/occupancy-optimizer-report.md` — full markdown report
- Google Sheet updated (if access available)
- Console summary printed
- Phase status: COMPLETE
```

**Step 2: Commit**

```bash
git add .agents/skills/occupancy-checker/phases/phase-5-publish.md
git commit -m "feat: add phase 5 (publish reports) for occupancy-checker"
```

---

## Task 9: Create the Budget Optimizer Tool

**Files:**
- Create: `tools/optimize_ad_budget.py`

**Step 1: Write the optimizer tool**

This Python script takes the capacity report JSON and Meta Ads JSON, applies the decision matrix, and outputs the reallocation proposal. It's the deterministic counterpart to the agent's reasoning — pure data transformation.

```python
"""
Ad Budget Optimizer
Cross-references Fresha capacity data with Meta Ads performance to generate
budget reallocation proposals.

Usage:
    python tools/optimize_ad_budget.py \
        --capacity .tmp/performance/fresha_capacity_report.json \
        --ads .tmp/performance/meta_ads_by_service.json \
        --output .tmp/performance/occupancy-optimizer-report.md

If --ads is omitted, generates a capacity-only report.
"""

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

# Capacity thresholds (matching config/fresha_venues.json)
THRESHOLDS = {
    "full": {"avg_slots": 0, "booked_pct": 90},
    "limited": {"avg_slots": 3, "booked_pct": 60},
    "open": {"avg_slots": 6, "booked_pct": 60}
}

AWARENESS_MINIMUM_EUR = 5.0
MAX_INCREASE_PCT = 0.30
CEO_APPROVAL_THRESHOLD_EUR = 50.0
NEW_CAMPAIGN_BUDGET_EUR = 15.0


def classify_capacity(avg_slots, booked_pct):
    """Classify service capacity level."""
    if avg_slots == 0 or booked_pct >= 90:
        return "PAUSE"
    elif avg_slots < 3 or booked_pct >= 60:
        return "REDUCE"
    elif avg_slots >= 6:
        return "SCALE"
    else:
        return "MAINTAIN"


def compute_efficiency(capacity_verdict, has_campaigns, daily_spend):
    """Compute efficiency score 0-100."""
    if capacity_verdict == "PAUSE" and has_campaigns:
        return 0
    elif capacity_verdict == "REDUCE" and daily_spend > 20:
        return 20
    elif capacity_verdict == "REDUCE" and daily_spend <= 10:
        return 60
    elif capacity_verdict == "MAINTAIN":
        return 75
    elif capacity_verdict == "SCALE" and has_campaigns and daily_spend > 10:
        return 90
    elif capacity_verdict == "SCALE" and has_campaigns:
        return 40
    elif capacity_verdict == "SCALE" and not has_campaigns:
        return 10
    return 50


def generate_proposal(capacity_data, ads_data=None):
    """Generate budget reallocation proposal."""
    services = []

    for venue_key, venue in capacity_data.get("venues", {}).items():
        for svc_name, svc in venue.get("services", {}).items():
            if svc.get("error"):
                continue

            days_checked = svc.get("days_checked", 1) or 1
            avg_slots = svc.get("total_slots", 0) / days_checked
            booked_pct = (svc.get("fully_booked_days", 0) / days_checked) * 100

            capacity_verdict = classify_capacity(avg_slots, booked_pct)

            # Get ads data for this service
            ads_info = {}
            if ads_data and "by_service" in ads_data:
                ads_info = ads_data["by_service"].get(svc_name, {})

            daily_spend = ads_info.get("daily_spend", 0)
            has_campaigns = bool(ads_info.get("campaigns", []))
            cpl = ads_info.get("avg_cpl", None)
            leads_7d = ads_info.get("total_leads_7d", 0)

            efficiency = compute_efficiency(capacity_verdict, has_campaigns, daily_spend)

            # Determine mismatch type
            if capacity_verdict in ("PAUSE", "REDUCE") and daily_spend > 10:
                mismatch = "WASTE"
            elif capacity_verdict == "SCALE" and (daily_spend < 5 or not has_campaigns):
                mismatch = "OPPORTUNITY"
            else:
                mismatch = "ALIGNED"

            services.append({
                "service": svc_name,
                "venue": venue_key,
                "venue_name": venue.get("venue", venue_key),
                "capacity_verdict": capacity_verdict,
                "avg_slots_per_day": round(avg_slots, 1),
                "booked_pct": round(booked_pct, 0),
                "has_campaigns": has_campaigns,
                "campaign_count": len(ads_info.get("campaigns", [])),
                "daily_spend": round(daily_spend, 2),
                "cpl": round(cpl, 2) if cpl else None,
                "leads_7d": leads_7d,
                "efficiency": efficiency,
                "mismatch": mismatch,
                "next_available": svc.get("next_available")
            })

    # Calculate reallocation
    savings = 0
    for svc in services:
        if svc["capacity_verdict"] == "PAUSE":
            svc["proposed_spend"] = 0
            svc["change"] = -svc["daily_spend"]
            savings += svc["daily_spend"]
        elif svc["capacity_verdict"] == "REDUCE" and svc["daily_spend"] > AWARENESS_MINIMUM_EUR:
            svc["proposed_spend"] = AWARENESS_MINIMUM_EUR
            svc["change"] = -(svc["daily_spend"] - AWARENESS_MINIMUM_EUR)
            savings += svc["daily_spend"] - AWARENESS_MINIMUM_EUR
        else:
            svc["proposed_spend"] = svc["daily_spend"]
            svc["change"] = 0

    # Distribute savings to SCALE opportunities
    scale_services = [s for s in services if s["capacity_verdict"] == "SCALE"]
    scale_services.sort(key=lambda s: (-s["avg_slots_per_day"], s.get("cpl") or 999))

    remaining_savings = savings
    for svc in scale_services:
        if remaining_savings <= 0:
            break
        if svc["has_campaigns"]:
            max_increase = svc["daily_spend"] * MAX_INCREASE_PCT
            increase = min(max_increase, remaining_savings)
        else:
            increase = min(NEW_CAMPAIGN_BUDGET_EUR, remaining_savings)
        svc["proposed_spend"] = round(svc["daily_spend"] + increase, 2)
        svc["change"] = round(increase, 2)
        remaining_savings -= increase

    # Flag CEO approvals
    for svc in services:
        svc["ceo_approval"] = abs(svc.get("change", 0)) > CEO_APPROVAL_THRESHOLD_EUR

    return {
        "generated_at": datetime.now().isoformat(),
        "total_savings_per_day": round(savings, 2),
        "total_redistributed": round(savings - remaining_savings, 2),
        "surplus": round(remaining_savings, 2),
        "services": services,
        "waste_count": sum(1 for s in services if s["mismatch"] == "WASTE"),
        "opportunity_count": sum(1 for s in services if s["mismatch"] == "OPPORTUNITY"),
    }


def render_markdown(proposal, capacity_only=False):
    """Render the proposal as markdown."""
    lines = [
        "# Occupancy Optimizer Report",
        f"## Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        ""
    ]

    if capacity_only:
        lines.append("> **Note:** Meta Ads data unavailable. This is a capacity-only report.")
        lines.append("")

    # Executive summary
    lines.append("### Executive Summary")
    lines.append(f"- **{proposal['waste_count']}** services over-advertised (wasting budget on full capacity)")
    lines.append(f"- **{proposal['opportunity_count']}** services under-advertised (open capacity, low/no spend)")
    if not capacity_only:
        lines.append(f"- **Proposed daily shift:** EUR {proposal['total_redistributed']:.2f}/day from constrained to open services")
        if proposal['surplus'] > 0:
            lines.append(f"- **Surplus:** EUR {proposal['surplus']:.2f}/day unallocated (can bank or distribute)")
    lines.append("")

    # Service table
    lines.append("### Service-by-Service Analysis")
    lines.append("")
    if capacity_only:
        lines.append("| Service | Venue | Capacity | Booked % | Slots/Day | Next Available |")
        lines.append("|---------|-------|----------|----------|-----------|----------------|")
        for svc in sorted(proposal["services"], key=lambda s: s["efficiency"]):
            lines.append(f"| {svc['service']} | {svc['venue']} | {svc['capacity_verdict']} | {svc['booked_pct']:.0f}% | {svc['avg_slots_per_day']} | {svc.get('next_available', 'N/A')} |")
    else:
        lines.append("| Service | Venue | Capacity | Booked % | Slots/Day | Campaigns | Spend/Day | CPL | Score | Mismatch |")
        lines.append("|---------|-------|----------|----------|-----------|-----------|-----------|-----|-------|----------|")
        for svc in sorted(proposal["services"], key=lambda s: s["efficiency"]):
            cpl_str = f"EUR {svc['cpl']:.2f}" if svc["cpl"] else "N/A"
            lines.append(
                f"| {svc['service']} | {svc['venue']} | {svc['capacity_verdict']} "
                f"| {svc['booked_pct']:.0f}% | {svc['avg_slots_per_day']} "
                f"| {svc['campaign_count']} | EUR {svc['daily_spend']:.2f} "
                f"| {cpl_str} | {svc['efficiency']} | {svc['mismatch']} |"
            )
    lines.append("")

    # Reallocation table
    if not capacity_only:
        lines.append("### Budget Reallocation Proposal")
        lines.append("")
        lines.append("| Priority | Service | Current | Proposed | Change | Reason |")
        lines.append("|----------|---------|---------|----------|--------|--------|")
        priority = 1
        for svc in sorted(proposal["services"], key=lambda s: s.get("change", 0)):
            if svc.get("change", 0) != 0:
                direction = "save" if svc["change"] < 0 else "invest"
                reason = f"{svc['capacity_verdict']}: {svc['booked_pct']:.0f}% booked, {svc['avg_slots_per_day']} slots/day"
                flag = " **CEO APPROVAL**" if svc.get("ceo_approval") else ""
                lines.append(
                    f"| {priority} | {svc['service']} "
                    f"| EUR {svc['daily_spend']:.2f} "
                    f"| EUR {svc['proposed_spend']:.2f} "
                    f"| EUR {svc['change']:+.2f} "
                    f"| {reason}{flag} |"
                )
                priority += 1
        lines.append("")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Ad Budget Optimizer")
    parser.add_argument("--capacity", required=True, help="Path to fresha_capacity_report.json")
    parser.add_argument("--ads", help="Path to meta_ads_by_service.json (optional)")
    parser.add_argument("--output", default=".tmp/performance/occupancy-optimizer-report.md")
    args = parser.parse_args()

    # Load capacity data
    capacity_path = Path(args.capacity)
    if not capacity_path.exists():
        print(f"ERROR: Capacity report not found: {args.capacity}")
        sys.exit(1)

    with open(capacity_path) as f:
        capacity_data = json.load(f)

    # Load ads data (optional)
    ads_data = None
    capacity_only = True
    if args.ads:
        ads_path = Path(args.ads)
        if ads_path.exists():
            with open(ads_path) as f:
                ads_data = json.load(f)
            capacity_only = False
        else:
            print(f"WARNING: Ads data not found: {args.ads}. Running capacity-only mode.")

    # Generate proposal
    proposal = generate_proposal(capacity_data, ads_data)

    # Render and save markdown
    markdown = render_markdown(proposal, capacity_only)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        f.write(markdown)

    # Also save raw proposal JSON
    json_path = output_path.with_suffix(".json")
    with open(json_path, "w") as f:
        json.dump(proposal, f, indent=2)

    # Print executive summary
    print(f"\n{'='*60}")
    print("OCCUPANCY OPTIMIZER — Executive Summary")
    print(f"{'='*60}")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"WASTE: {proposal['waste_count']} services over-advertised")
    print(f"OPPORTUNITIES: {proposal['opportunity_count']} services under-advertised")
    if not capacity_only:
        print(f"PROPOSED SHIFT: EUR {proposal['total_redistributed']:.2f}/day")
    print(f"\nFull report: {args.output}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
```

**Step 2: Test with capacity-only mode (no ads data yet)**

Run:
```bash
python tools/optimize_ad_budget.py \
    --capacity .tmp/performance/fresha_capacity_report.json \
    --output .tmp/performance/occupancy-optimizer-report.md
```

Expected: Markdown report generated with capacity-only data, all services listed with PAUSE/REDUCE/MAINTAIN/SCALE verdicts.

**Step 3: Verify the markdown output**

Read `.tmp/performance/occupancy-optimizer-report.md` and check:
- [ ] Executive summary present
- [ ] Service table has all 13 services (9 slimming + 4 aesthetics)
- [ ] Capacity verdicts match the raw report
- [ ] No Python errors

**Step 4: Commit**

```bash
git add tools/optimize_ad_budget.py
git commit -m "feat: add budget optimizer tool for occupancy-checker agent"
```

---

## Task 10: Update Paperclip Org Design

**Files:**
- Modify: `docs/plans/2026-03-31-paperclip-org-design.md`

**Step 1: Add Occupancy Checker to CMO sub-team in org chart**

In the org chart ASCII art, add the new agent under CMO after Email Designer:

```
│   └── Occupancy Checker (AI — Claude Code)
│       Fresha capacity scraping, Meta Ads crossref,
│       budget reallocation proposals
│       Advisory role — publishes proposals, does not modify campaigns
```

**Step 2: Update total agent count**

Change "Total agents: 20" to "Total agents: 21" and update the parenthetical.

**Step 3: Add CMO Specialist section**

After the Email Designer section, add:

```markdown
#### Occupancy Checker (Claude Code)

**Responsibilities:**
- Scrape Fresha booking pages for practitioner availability across venues
- Pull Meta Ads performance data for active campaigns
- Cross-reference capacity vs ad spend to detect waste and opportunities
- Generate budget reallocation proposals with specific EUR amounts
- Publish reports to markdown + Google Sheets

**Relationship with GMs:** Advisory only. Publishes capacity alerts and reallocation proposals. Does not directly modify campaigns.

**MCP Tools:** Meta Ads (read insights), Google Workspace (Sheets), Playwright (Fresha scraping)

**Context injection:** `config/fresha_venues.json`, `config/brands.json`, `config/naming_conventions.json`, `config/kpi_thresholds.json`
```

**Step 4: Update context injection table**

Add row: `| Occupancy Checker | config/fresha_venues.json, config/brands.json, config/naming_conventions.json, config/kpi_thresholds.json, Fresha capacity report, Meta Ads insights |`

**Step 5: Update scalability section**

Agent count projection should be:
- Current (3 brands): 21 (was 20)
- With Brand 4: 25 (was 24)
- With Brand 5: 29 (was 28)

**Step 6: Commit**

```bash
git add docs/plans/2026-03-31-paperclip-org-design.md
git commit -m "feat: add occupancy-checker to paperclip org design (21 agents)"
```

---

## Task 11: Smoke Test the Full Agent

**Step 1: Run Phase 1 (Fresha scrape)**

```bash
python tools/check_fresha_availability.py --days 14
```

Verify `.tmp/performance/fresha_capacity_report.json` has fresh data.

**Step 2: Run the optimizer in capacity-only mode**

```bash
python tools/optimize_ad_budget.py \
    --capacity .tmp/performance/fresha_capacity_report.json \
    --output .tmp/performance/occupancy-optimizer-report.md
```

Verify:
- [ ] Report generated at `.tmp/performance/occupancy-optimizer-report.md`
- [ ] JSON generated at `.tmp/performance/occupancy-optimizer-report.json`
- [ ] Executive summary printed to console
- [ ] All 13 services present in report
- [ ] Capacity verdicts are reasonable

**Step 3: Verify skill structure**

```bash
find .agents/skills/occupancy-checker -type f | sort
```

Expected output:
```
.agents/skills/occupancy-checker/SKILL.md
.agents/skills/occupancy-checker/config.json
.agents/skills/occupancy-checker/phases/phase-1-scrape.md
.agents/skills/occupancy-checker/phases/phase-2-pull-ads.md
.agents/skills/occupancy-checker/phases/phase-3-crossref.md
.agents/skills/occupancy-checker/phases/phase-4-reallocate.md
.agents/skills/occupancy-checker/phases/phase-5-publish.md
.agents/skills/occupancy-checker/references/decision-matrix.md
```

**Step 4: Final commit**

```bash
git add -A .agents/skills/occupancy-checker/
git commit -m "feat: complete occupancy-checker agent skill scaffold"
```
