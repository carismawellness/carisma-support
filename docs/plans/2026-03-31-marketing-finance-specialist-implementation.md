# Marketing Finance Specialist Agent — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a multi-phase marketing finance specialist agent under the CMO in the Paperclip org, following the emailbabyskill pattern.

**Architecture:** Router SKILL.md dispatches to 5 phase files. Each phase is a self-contained procedure. Budget allocation (Phase 1) wraps the existing `config/budget-allocation.json` and reference docs. Phases 2-5 define new capabilities for spend tracking, ROAS analysis, revenue attribution, and weekly reporting.

**Tech Stack:** Markdown skills, JSON config, MCP tools (Meta Ads, Google Sheets, Google Analytics)

---

### Task 1: Create Directory Structure

**Files:**
- Create: `marketing/marketing-finance/`
- Create: `marketing/marketing-finance/phases/`
- Create: `marketing/marketing-finance/references/`

**Step 1: Create the directory tree**

```bash
mkdir -p "marketing/marketing-finance/phases"
mkdir -p "marketing/marketing-finance/references"
```

**Step 2: Verify directories exist**

```bash
ls -la "marketing/marketing-finance/"
```

Expected: `phases/` and `references/` directories visible.

**Step 3: Commit**

```bash
git add "marketing/marketing-finance/"
git commit -m "chore: scaffold marketing-finance agent directory structure"
```

---

### Task 2: Create config.json

**Files:**
- Create: `marketing/marketing-finance/config.json`
- Reference: `marketing/email-marketing/emailbabyskill/config.json` (pattern to follow)

**Step 1: Write config.json**

```json
{
  "name": "marketing-finance-specialist",
  "type": "skill",
  "description": "Marketing finance specialist agent for the CMO. Handles budget allocation, spend tracking, ROAS/CPL analysis, revenue attribution, and weekly consolidated reporting across all 3 Carisma brands.",
  "version": "1.0.0",
  "author": "Carisma",
  "user-invocable": true,
  "allowed-tools": "Bash, Read, Write, Edit, Glob, Grep, Task, ToolSearch",
  "argument-hint": "<phase|all> [brand]",
  "metadata": {
    "tags": ["finance", "budget", "roas", "cpl", "marketing", "analytics"],
    "triggers": [
      "marketing finance",
      "budget allocation",
      "spend tracking",
      "roas analysis",
      "marketing report"
    ]
  },
  "inputs": {
    "phase": {
      "type": "string",
      "enum": ["budget", "spend", "roas", "revenue", "report", "all"],
      "description": "Which phase to run. 'all' runs the full weekly cycle (phases 2-5).",
      "required": true
    },
    "brand": {
      "type": "string",
      "enum": ["spa", "aesthetics", "slimming", "all"],
      "description": "Which brand to analyse. Defaults to 'all'.",
      "required": false,
      "default": "all"
    }
  },
  "outputs": {
    "budget_table": {
      "type": "object",
      "description": "Per-campaign daily budgets by brand and channel (Phase 1)"
    },
    "spend_variance": {
      "type": "object",
      "description": "Actual vs. planned spend by brand (Phase 2)"
    },
    "performance_scorecard": {
      "type": "object",
      "description": "CPL/CPA/ROAS per campaign with winner/loser classification (Phase 3)"
    },
    "roi_analysis": {
      "type": "object",
      "description": "Revenue vs. spend by brand and campaign type (Phase 4)"
    },
    "weekly_report": {
      "type": "string",
      "description": "Consolidated CMO-ready report (Phase 5)"
    }
  },
  "execution": {
    "timeout": 300,
    "environment": "node",
    "requires_context": ["meta-ads MCP", "google-sheets MCP", "google-analytics MCP"]
  },
  "integrations": {
    "reads": [
      "config/budget-allocation.json",
      "config/kpi_thresholds.json",
      "config/brands.json"
    ],
    "mcp_servers": ["meta-ads", "google-workspace", "google-analytics"]
  }
}
```

**Step 2: Verify JSON is valid**

```bash
python3 -c "import json; json.load(open('marketing/marketing-finance/config.json'))"
```

Expected: No output (valid JSON).

**Step 3: Commit**

```bash
git add "marketing/marketing-finance/config.json"
git commit -m "feat: add marketing-finance-specialist config.json"
```

---

### Task 3: Create Router SKILL.md

**Files:**
- Create: `marketing/marketing-finance/SKILL.md`
- Reference: `marketing/email-marketing/emailbabyskill/SKILL.md` (router pattern)
- Reference: `config/budget-allocation.json` (budget source of truth)
- Reference: `config/kpi_thresholds.json` (winner/loser thresholds)
- Reference: `config/brands.json` (ad account IDs: Spa `act_654279452039150`, Aesthetics `act_382359687910745`, Slimming `act_1496776195316716`)

**Step 1: Write SKILL.md**

Write the following to `marketing/marketing-finance/SKILL.md`:

```markdown
---
name: marketing-finance-specialist
description: "Marketing finance specialist for the CMO. Routes to phase-specific procedures for budget allocation, spend tracking, ROAS analysis, revenue attribution, and weekly reporting across all 3 Carisma brands."
version: "1.0.0"
user-invocable: true
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Task, ToolSearch
argument-hint: "<phase|all> [brand]"
metadata:
  author: Carisma
  tags:
    - finance
    - budget
    - roas
    - cpl
    - marketing
    - analytics
  triggers:
    - "marketing finance"
    - "budget allocation"
    - "spend tracking"
    - "roas analysis"
    - "marketing report"
---

# Marketing Finance Specialist — Router

This agent sits directly under the **CMO** in the Paperclip org chart. It is the financial brain of marketing — publishing budget allocations, tracking spend, analysing ROAS/CPL, attributing revenue, and producing weekly consolidated reports.

**Relationship with GM Marketing Agents:** Advisory only. This agent publishes numbers and analysis. It does NOT directly modify campaigns or instruct GM agents. The CMO routes directives based on this agent's outputs.

## How It Works

When invoked with `/marketing-finance <phase> [brand]`:

1. Parse the phase from the first argument
2. Parse the optional brand (defaults to `all`)
3. Load required config files
4. Route to the correct phase file
5. Execute the phase procedure

## Required Config Files

Load these BEFORE executing any phase:

| File | Purpose |
|------|---------|
| `config/budget-allocation.json` | Weekly budgets, channel splits, minimums, Q4 override |
| `config/kpi_thresholds.json` | CPL targets, kill thresholds, winner/loser criteria |
| `config/brands.json` | Ad account IDs, brand metadata |

## Phase Routing Table

| Argument | Phase File | What It Does |
|----------|-----------|-------------|
| `budget` | `marketing/marketing-finance/phases/phase-1-budget-allocation.md` | Compute per-campaign daily budgets |
| `spend` | `marketing/marketing-finance/phases/phase-2-spend-tracking.md` | Pull actuals, compare vs. planned |
| `roas` | `marketing/marketing-finance/phases/phase-3-roas-analysis.md` | CPL/CPA/ROAS per campaign |
| `revenue` | `marketing/marketing-finance/phases/phase-4-revenue-attribution.md` | Spend vs. revenue matching |
| `report` | `marketing/marketing-finance/phases/phase-5-weekly-report.md` | Consolidated CMO report |
| `all` | Phases 2 → 3 → 4 → 5 in sequence | Full weekly cycle |

**Note:** `budget` (Phase 1) is on-demand only — run it when planning a new calendar, not as part of the weekly cycle.

## Brand Filtering

| Argument | Brands Included |
|----------|----------------|
| `spa` | Carisma Spa only (`act_654279452039150`) |
| `aesthetics` or `aes` | Carisma Aesthetics only (`act_382359687910745`) |
| `slimming` or `slim` | Carisma Slimming only (`act_1496776195316716`, **USD account**) |
| `all` (default) | All 3 brands |

## Execution

1. **Read the phase file** for the requested phase
2. **Load config files** listed above
3. **Follow the phase procedure** step by step
4. **Output results** in the format specified by each phase

## If No Phase Argument

Ask the user what they need:
- **Budget** — Allocate budgets for a new campaign calendar
- **Spend** — Check actual spend vs. planned this week
- **ROAS** — Analyse campaign performance (CPL, ROAS)
- **Revenue** — Match spend to revenue for ROI
- **Report** — Generate the full weekly CMO report
- **All** — Run the complete weekly cycle (spend → ROAS → revenue → report)

## Important Notes

- **Slimming uses USD:** Ad account `act_1496776195316716` is in USD. Budget planning is in EUR but Meta Ads data for Slimming will be in USD. Apply EUR/USD conversion when comparing.
- **EUR 5/day minimum:** No Meta campaign below EUR 5/day. Reduce campaign count rather than spreading thin.
- **Q4 override:** For Oct/Nov/Dec, budget baseline reads from 2025 spreadsheet instead of config defaults.
- **Advisory only:** This agent publishes analysis. Campaign changes flow through CMO → GMs.
```

**Step 2: Verify the SKILL.md reads correctly**

```bash
head -5 "marketing/marketing-finance/SKILL.md"
```

Expected: Frontmatter starting with `---` and `name: marketing-finance-specialist`.

**Step 3: Commit**

```bash
git add "marketing/marketing-finance/SKILL.md"
git commit -m "feat: add marketing-finance-specialist router SKILL.md"
```

---

### Task 4: Create Phase 1 — Budget Allocation

**Files:**
- Create: `marketing/marketing-finance/phases/phase-1-budget-allocation.md`
- Reference: `config/budget-allocation.json`
- Reference: `marketing/marketing-calendar/skill/references/budget-allocation.md` (existing procedure)

**Step 1: Write phase-1-budget-allocation.md**

This phase wraps the existing budget-allocation procedure. Copy the core logic from `marketing/marketing-calendar/skill/references/budget-allocation.md` and adapt it to be a standalone phase.

```markdown
# Phase 1: Budget Allocation

## Purpose

Compute per-campaign daily budgets for all 3 brands across Meta and Google channels. This phase is invoked **on-demand** when planning a new quarterly or monthly campaign calendar — it is NOT part of the weekly cycle.

## Inputs Required

- `config/budget-allocation.json` (loaded by router)
- Campaign count per brand (from quarterly-marketing-calendar or meta-strategist output)
- Target month (to determine if Q4 override applies)

## Procedure

### Step 1: Load Budget Config

Read `config/budget-allocation.json`. This is the single source of truth for weekly budgets.

### Step 2: Check for Q4 Override

- **January-September:** Use `weekly_budgets` from config directly
- **October-December:** Read actual Q4 2025 data from spreadsheet `1q40Ke8wRsjnoVOngDupVdwxIWiTFXwYfh1ZwvUa9xtc`, sheet `Calendar '25`. Extract weekly budget averages per brand per channel and use those as the baseline.

### Step 3: Split Meta Budget by Campaign Type

For each brand's Meta weekly budget:
- **Evergreen pool** = `meta_eur x 0.60`
- **Seasonal pool** = `meta_eur x 0.40`

| Brand | Meta/wk | Evergreen/wk (60%) | Seasonal/wk (40%) |
|-------|---------|--------------------|--------------------|
| Spa | EUR 350 | EUR 210 | EUR 140 |
| Aesthetics | EUR 560 | EUR 336 | EUR 224 |
| Slimming | EUR 400 | EUR 240 | EUR 160 |

### Step 4: Compute Per-Campaign Daily Budgets

```
evergreen_daily = (evergreen_pool / 7) / num_evergreen_campaigns
seasonal_daily = (seasonal_pool / 7) / num_seasonal_campaigns
```

Round to nearest EUR 1.

### Step 5: Validate EUR 5/Day Minimum

Check every campaign against EUR 5/day minimum. If any falls below:
- Do NOT spread budget thinner
- **Reduce campaign count** — cut lowest-priority seasonal campaigns first
- Priority order: LOW > MEDIUM > never cut HIGH (mandatory occasions)

### Step 6: Distribute Google Budget

| Type | Share | Spa/wk | AES/wk | SLIM/wk |
|------|-------|--------|--------|---------|
| Search | 50% | EUR 420 | EUR 70 | EUR 50 |
| Pmax | 30% | EUR 252 | EUR 42 | EUR 30 |
| Remarketing | 20% | EUR 168 | EUR 28 | EUR 20 |

If a brand doesn't run all three types, redistribute proportionally across active types.

### Step 7: Write to Campaign Plan

- Meta: `Campaign Name | CPL XX |` where XX = daily budget (whole number)
- Google: `Search: keyword | CPC XX | XXx`

## Output

A budget table per brand with:
- Daily budget per Meta campaign (evergreen + seasonal)
- Daily budget per Google campaign type
- Any campaigns cut to meet EUR 5/day minimum (with rationale)

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Same channel split for all brands | Spa is 30/70 Meta/Google. AES and SLIM are 80/20. |
| Budget below EUR 5/day | Cut campaigns, don't dilute. |
| Forgetting Q4 override | Always check the month first. |
| Hardcoding Q4 numbers | Read from spreadsheet dynamically. |
| Ignoring Slimming USD | Slimming Meta account is in USD. Convert for planning. |
```

**Step 2: Commit**

```bash
git add "marketing/marketing-finance/phases/phase-1-budget-allocation.md"
git commit -m "feat: add phase-1 budget allocation procedure"
```

---

### Task 5: Create Phase 2 — Spend Tracking

**Files:**
- Create: `marketing/marketing-finance/phases/phase-2-spend-tracking.md`
- Reference: `config/brands.json` for ad account IDs
- Reference: `config/budget-allocation.json` for planned budgets

**Step 1: Write phase-2-spend-tracking.md**

```markdown
# Phase 2: Spend Tracking

## Purpose

Pull actual ad spend from Meta Ads and Google Ads for the current week. Compare actual vs. planned budgets. Flag overspend/underspend by brand and channel.

## Inputs Required

- `config/budget-allocation.json` (planned weekly budgets)
- `config/brands.json` (ad account IDs)
- Date range: current week (Monday-Sunday)

## Procedure

### Step 1: Determine Date Range

Calculate the current week's date range:
- `start_date`: Most recent Monday
- `end_date`: Today (or Sunday if running end-of-week)

### Step 2: Pull Meta Ads Spend

For each brand, use the Meta Ads MCP `get_insights` tool:

| Brand | Ad Account ID | Currency |
|-------|--------------|----------|
| Spa | `act_654279452039150` | EUR |
| Aesthetics | `act_382359687910745` | EUR |
| Slimming | `act_1496776195316716` | **USD** |

Request fields: `spend`, `impressions`, `clicks`, `actions` (leads)
Breakdown: `campaign_name`
Date range: `start_date` to `end_date`

### Step 3: Pull Google Ads Spend

Use Google Sheets or Google Ads API to pull Google campaign spend for the same date range. Source TBD based on available MCP tools.

### Step 4: Compute Variance

For each brand and channel:
```
planned_spend = weekly_budget * (days_elapsed / 7)
variance_eur = actual_spend - planned_spend
variance_pct = (variance_eur / planned_spend) * 100
```

### Step 5: Flag Anomalies

Flag if:
- Any brand > **80% budget consumed** before the week ends → escalate to CMO
- Any brand > **20% overspend** → flag in report
- Any brand < **50% spend** at midweek → flag as underspend (possible delivery issues)

### Step 6: Currency Conversion for Slimming

Convert Slimming USD spend to EUR for the consolidated view. Use a fixed rate or pull live rate. Note: budget planning is in EUR, Meta data is in USD.

## Output

A spend variance table:

| Brand | Channel | Planned (EUR) | Actual (EUR) | Variance | Status |
|-------|---------|--------------|-------------|----------|--------|
| Spa | Meta | XX | XX | +/-XX% | OK/OVER/UNDER |
| Spa | Google | XX | XX | +/-XX% | OK/OVER/UNDER |
| ... | ... | ... | ... | ... | ... |

Plus a list of flagged anomalies with recommended actions.
```

**Step 2: Commit**

```bash
git add "marketing/marketing-finance/phases/phase-2-spend-tracking.md"
git commit -m "feat: add phase-2 spend tracking procedure"
```

---

### Task 6: Create Phase 3 — ROAS/CPL Analysis

**Files:**
- Create: `marketing/marketing-finance/phases/phase-3-roas-analysis.md`
- Reference: `config/kpi_thresholds.json` (CPL targets, winner/loser criteria)

**Step 1: Write phase-3-roas-analysis.md**

```markdown
# Phase 3: ROAS/CPL Analysis

## Purpose

Compute CPL, CPA, and ROAS per campaign across all brands. Classify each campaign as WINNER, LOSER, or WATCHLIST using thresholds from `config/kpi_thresholds.json`.

## Inputs Required

- Meta Ads data from Phase 2 (or pull fresh if running standalone)
- `config/kpi_thresholds.json` (loaded by router)
- `config/brands.json` (CPL targets per brand)

## KPI Thresholds Reference

| Brand | CPL Target | Kill Threshold (2x) | CTR Min | CPC Max |
|-------|-----------|---------------------|---------|---------|
| Spa | EUR 8.00 | EUR 16.00 | 1.0% | EUR 1.50 |
| Aesthetics | EUR 12.00 | EUR 24.00 | 0.8% | EUR 2.00 |
| Slimming | USD 10.00 | USD 20.00 | TBD | TBD |

**Review prerequisites:** Do NOT classify until a campaign has:
- Spent >= EUR 15 (or USD equivalent)
- Received >= 500 impressions
- Run for >= 3 days

## Procedure

### Step 1: Pull Campaign-Level Metrics

For each brand's Meta ad account, get:
- `spend`, `impressions`, `clicks`, `ctr`, `cpc`, `actions` (leads), `cost_per_action_type` (CPL)
- Breakdown: by `campaign_name`
- Date range: last 7 days

### Step 2: Compute KPIs Per Campaign

For each campaign:
```
CPL = spend / leads (if leads > 0, else "No Leads")
CTR = (clicks / impressions) * 100
CPC = spend / clicks (if clicks > 0)
ROAS = revenue / spend (if revenue data available from Phase 4)
```

### Step 3: Classify Each Campaign

Using `config/kpi_thresholds.json`:

**WINNER** (all must be true):
- CPL <= brand CPL target
- Leads >= 5
- Spend >= EUR 30

**LOSER** (all must be true):
- CPL > brand kill threshold (2x target)
- Spend >= EUR 30
- Leads < 2

**WATCHLIST** (everything else):
- CPL between target and kill threshold
- OR insufficient data (spend < EUR 15 or impressions < 500)

### Step 4: Check Alert Thresholds

From `config/kpi_thresholds.json` alert_thresholds:
- Daily budget overspend > 20%
- CPL spike > 50% vs. previous period
- CTR drop > 40% vs. previous period
- Frequency > 2.5 (warning) or > 4.0 (kill)
- No leads after EUR 25 spend

### Step 5: Generate Recommendations

For each classification:
- **WINNERS:** "Scale budget +20-30%. Duplicate to new audiences. Create hook variations."
- **LOSERS:** "Pause immediately. Analyse failure (hook, targeting, offer, landing page). Document learnings."
- **WATCHLIST:** "Continue monitoring. Review at next cycle. Consider minor adjustments."

## Output

A performance scorecard per brand:

| Campaign | Spend | Leads | CPL | CTR | CPC | Status | Action |
|----------|-------|-------|-----|-----|-----|--------|--------|
| Name | EUR X | X | EUR X | X% | EUR X | WINNER/LOSER/WATCH | Recommendation |

Plus a summary: X winners, Y losers, Z watchlist per brand.
```

**Step 2: Commit**

```bash
git add "marketing/marketing-finance/phases/phase-3-roas-analysis.md"
git commit -m "feat: add phase-3 ROAS/CPL analysis procedure"
```

---

### Task 7: Create Phase 4 — Revenue Attribution

**Files:**
- Create: `marketing/marketing-finance/phases/phase-4-revenue-attribution.md`
- Reference: Carisma Analytics sheet `1q_aqO9QpCaRoqhOI0Fd41YPO7NMrRAlv5EjShmZK6RM`

**Step 1: Write phase-4-revenue-attribution.md**

```markdown
# Phase 4: Revenue Attribution

## Purpose

Match ad spend to revenue data. Compute ROI by brand, by channel, and by campaign type (evergreen vs. seasonal). This connects marketing activity to business outcomes.

## Inputs Required

- Spend data from Phase 2 (or pull fresh)
- Performance data from Phase 3
- Revenue data from Carisma Analytics sheet `1q_aqO9QpCaRoqhOI0Fd41YPO7NMrRAlv5EjShmZK6RM`
  - "Revenue Improved" sheet (ID: `856432233`)

## Procedure

### Step 1: Pull Revenue Data

Use Google Sheets MCP to read from the Carisma Analytics sheet:
- Spreadsheet: `1q_aqO9QpCaRoqhOI0Fd41YPO7NMrRAlv5EjShmZK6RM`
- Sheet: "Revenue Improved" (ID: `856432233`)
- Extract weekly revenue per brand for the current period

### Step 2: Match Spend to Revenue by Brand

For each brand:
```
total_spend = meta_spend + google_spend
total_revenue = brand_weekly_revenue
roi = (total_revenue - total_spend) / total_spend * 100
roas = total_revenue / total_spend
```

### Step 3: Break Down by Channel

| Brand | Channel | Spend | Revenue (attributed) | ROAS | ROI |
|-------|---------|-------|---------------------|------|-----|
| Spa | Meta | EUR X | EUR X | X.Xx | X% |
| Spa | Google | EUR X | EUR X | X.Xx | X% |
| ... | ... | ... | ... | ... | ... |

**Attribution method:** Last-click for Meta (standard Meta attribution window). Google attribution via Google Analytics UTM tracking where available.

### Step 4: Break Down by Campaign Type

| Brand | Type | Spend | Revenue | ROAS |
|-------|------|-------|---------|------|
| Spa | Evergreen | EUR X | EUR X | X.Xx |
| Spa | Seasonal | EUR X | EUR X | X.Xx |
| ... | ... | ... | ... | ... |

### Step 5: Trend Comparison

Compare current week's ROI vs. previous 4-week average:
```
trend = current_roi - avg_4week_roi
direction = "improving" if trend > 0 else "declining"
```

## Output

- ROI table by brand and channel
- ROI table by brand and campaign type
- 4-week trend direction per brand
- Key insight: which brand/channel combination is most and least efficient

## Limitations

- Revenue attribution is approximate — Fresha bookings don't always tie directly to ad clicks
- Slimming has a longer sales cycle (weeks, not days) — ROI for recent campaigns may be understated
- Google revenue attribution depends on UTM parameter consistency
```

**Step 2: Commit**

```bash
git add "marketing/marketing-finance/phases/phase-4-revenue-attribution.md"
git commit -m "feat: add phase-4 revenue attribution procedure"
```

---

### Task 8: Create Phase 5 — Weekly Report

**Files:**
- Create: `marketing/marketing-finance/phases/phase-5-weekly-report.md`

**Step 1: Write phase-5-weekly-report.md**

```markdown
# Phase 5: Weekly Report

## Purpose

Consolidate outputs from Phases 2-4 into a single CMO-ready report. This is the primary deliverable of the marketing finance specialist's weekly cycle.

## Inputs Required

- Phase 2 output: Spend variance table
- Phase 3 output: Performance scorecard (winners/losers/watchlist)
- Phase 4 output: Revenue attribution and ROI tables

## Report Structure

### Section 1: Executive Summary (3-5 bullet points)

- Total group ad spend this week (EUR) vs. planned
- Total leads generated across all brands
- Top performing campaign (highest ROAS or lowest CPL)
- Worst performing campaign (highest CPL or lowest ROAS)
- Key recommendation (one action for the CMO to consider)

### Section 2: Budget Health

From Phase 2 — spend variance table:
- Per-brand spend vs. plan
- Any overspend/underspend flags
- Budget consumption rate (% of monthly budget used)

### Section 3: Performance Scorecard

From Phase 3 — winner/loser classification:
- Winners: list with CPL, leads, recommendation
- Losers: list with CPL, spend wasted, failure analysis
- Watchlist: list with current metrics

### Section 4: Revenue & ROI

From Phase 4 — attribution:
- ROI by brand
- ROI by channel
- 4-week trend direction
- Most and least efficient brand/channel combination

### Section 5: Alerts & Escalations

Any thresholds breached:
- Budget >80% consumed
- CPL >2x target for 3+ days
- Frequency cap warnings
- No-leads-after-spend alerts

### Section 6: Recommendations

Specific, actionable items for the CMO:
- Campaigns to scale (with budget increase amount)
- Campaigns to pause (with savings amount)
- Budget reallocation suggestions (if cross-brand reallocation needed, flag for CEO approval)

## Delivery

1. **Google Sheets:** Write key metrics to the Carisma Analytics dashboard
2. **Report text:** Format as structured markdown for the CMO agent to consume
3. **Escalations:** Any items requiring CEO approval are flagged separately

## Report Cadence

- **Weekly:** Full report (Phases 2-5) — run every Monday for the prior week
- **Mid-week check:** Phase 2 only (spend tracking) — run Wednesday to catch budget anomalies early
```

**Step 2: Commit**

```bash
git add "marketing/marketing-finance/phases/phase-5-weekly-report.md"
git commit -m "feat: add phase-5 weekly report procedure"
```

---

### Task 9: Copy Budget Allocation Reference

**Files:**
- Create: `marketing/marketing-finance/references/budget-allocation.md`
- Source: `marketing/marketing-calendar/skill/references/budget-allocation.md`

**Step 1: Copy the reference file**

```bash
cp "marketing/marketing-calendar/skill/references/budget-allocation.md" "marketing/marketing-finance/references/budget-allocation.md"
```

**Step 2: Verify the copy**

```bash
diff "marketing/marketing-calendar/skill/references/budget-allocation.md" "marketing/marketing-finance/references/budget-allocation.md"
```

Expected: No output (files are identical).

**Step 3: Commit**

```bash
git add "marketing/marketing-finance/references/budget-allocation.md"
git commit -m "feat: add budget-allocation reference to marketing-finance agent"
```

---

### Task 10: Update Paperclip Org Design

**Files:**
- Modify: `docs/plans/2026-03-31-paperclip-org-design.md`

**Step 1: Update the org chart**

In the org chart ASCII art (around line 22), add the Marketing Finance Specialist under CMO:

```
├── CMO (AI — Claude Sonnet)
│   Strategy & cross-brand marketing direction
│   Reviews all 3 GM marketing reports
│   Sets quarterly themes, brand standards, KPI targets
│   │
│   └── Marketing Finance Specialist (Claude Code)
│       Budget allocation, spend tracking, ROAS/CPL analysis
│       Revenue attribution, weekly CMO financial report
```

**Step 2: Update agent count**

Change "Total agents: 17" to "Total agents: 18" on line 13.

**Step 3: Update Layer 2 description**

Add a note in the CMO row of the Layer 2 table (around line 116) that the CMO now has one direct sub-agent.

**Step 4: Add to Context Injection table**

In the Context Injection table (around line 288), add a new row:

```
| Marketing Finance Specialist | `config/budget-allocation.json`, `config/kpi_thresholds.json`, `config/brands.json`, Carisma Analytics sheet, Meta Ads insights |
```

**Step 5: Update Scalability section**

Update the agent count table (around line 320):
- Current (3 brands): 17 → 18
- With Brand 4: 21 → 22
- With Brand 5: 25 → 26

**Step 6: Commit**

```bash
git add "docs/plans/2026-03-31-paperclip-org-design.md"
git commit -m "feat: add marketing finance specialist to paperclip org design"
```

---

### Task 11: Final Verification

**Step 1: Verify all files exist**

```bash
ls -la "marketing/marketing-finance/"
ls -la "marketing/marketing-finance/phases/"
ls -la "marketing/marketing-finance/references/"
```

Expected files:
- `SKILL.md`, `config.json`
- `phases/phase-1-budget-allocation.md` through `phase-5-weekly-report.md`
- `references/budget-allocation.md`

**Step 2: Verify SKILL.md routes to all 5 phases**

Check that every phase file path in the routing table exists:

```bash
for f in \
  "marketing/marketing-finance/phases/phase-1-budget-allocation.md" \
  "marketing/marketing-finance/phases/phase-2-spend-tracking.md" \
  "marketing/marketing-finance/phases/phase-3-roas-analysis.md" \
  "marketing/marketing-finance/phases/phase-4-revenue-attribution.md" \
  "marketing/marketing-finance/phases/phase-5-weekly-report.md"; do
  [ -f "$f" ] && echo "OK: $f" || echo "MISSING: $f"
done
```

Expected: All OK.

**Step 3: Verify config.json is valid**

```bash
python3 -c "import json; j=json.load(open('marketing/marketing-finance/config.json')); print(f'Name: {j[\"name\"]}, Phases: {list(j[\"inputs\"][\"phase\"][\"enum\"])}')"
```

Expected: `Name: marketing-finance-specialist, Phases: ['budget', 'spend', 'roas', 'revenue', 'report', 'all']`

**Step 4: Verify org design update**

```bash
grep -c "Marketing Finance Specialist" "docs/plans/2026-03-31-paperclip-org-design.md"
```

Expected: >= 2 (org chart + context injection table).
