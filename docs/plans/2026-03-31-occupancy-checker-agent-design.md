# Occupancy Checker Agent Design

**Date:** 2026-03-31
**Status:** Approved
**Platform:** Paperclip (open-source, MIT licensed)

---

## Overview

The Occupancy Checker is a **supply-demand optimizer** that sits under the CMO in the Paperclip org. It combines real-time practitioner availability from Fresha with Meta Ads performance data to generate budget reallocation proposals. The core insight: ad spend should match available capacity. If a service has no open slots, advertising it wastes money. If a service has plenty of capacity, it should receive more ad budget.

**Trigger:** On-demand only (`/occupancy [venue]` or delegated by CMO/GM)
**Output:** Local markdown report for the agent pipeline + Google Sheet for human review
**Authority:** Advisory only. Publishes proposals. Does not modify campaigns or budgets.

---

## Agent Identity

| Property | Value |
|----------|-------|
| Name | Occupancy Checker |
| Runtime | Claude Code |
| Reports to | CMO |
| Trigger | `/occupancy [venue]` or delegated by CMO/GM |
| Role | Supply-demand optimizer |
| Org Layer | CMO Sub-Team (4th specialist) |
| MCP Tools | Meta Ads (read insights), Google Sheets (write reports), Playwright (Fresha scraping) |

### Position in Org

```
CMO (AI -- Claude Sonnet)
|
+-- Marketing Finance Specialist (Claude Code)
+-- Email Marketing Strategist (Claude Sonnet)
+-- Email Designer (Claude Code)
+-- Occupancy Checker (Claude Code)  <-- NEW
    Fresha capacity scraping, Meta Ads crossref,
    budget reallocation proposals
    Advisory role -- publishes analysis, does not modify campaigns
```

Total agents: 21 (was 20).

---

## Five-Phase Pipeline

### Phase 1 -- Scrape Capacity

- Runs `tools/check_fresha_availability.py --days 14` for specified venue(s) or all
- Reads `config/fresha_venues.json` for venue URLs and services
- Output: `.tmp/performance/fresha_capacity_report.json`
- Per-service data: slot counts, booked %, avg slots/day, fully booked days, next available date
- Handles cookie banners, variable booking flows, add-on screens via state machine navigation

### Phase 2 -- Pull Ad Performance

- Calls Meta Ads MCP to pull active campaign/ad set insights for each brand
- Accounts: Spa (`act_654279452039150`), Aesthetics (`act_382359687910745`)
- Metrics: campaign name, ad set name, spend (7d), leads (7d), CPL, impressions, status
- Maps campaigns to services using naming conventions from `config/naming_conventions.json`
- Output: `.tmp/performance/meta_ads_by_service.json`

### Phase 3 -- Cross-Reference Supply vs Demand

For each service, merges:
- **Supply:** Fresha capacity data (avg slots/day, booked %, next available)
- **Demand:** Meta Ads data (active campaigns, current spend, CPL, lead volume)

Computes:
- **Efficiency Score:** Is ad spend proportional to available capacity?
- **Waste Detection:** High spend + no capacity = waste
- **Opportunity Detection:** Low spend + open capacity = missed opportunity
- **Service-to-Campaign Mapping:** Links Fresha service names to Meta campaign naming patterns

### Phase 4 -- Generate Reallocation Proposal

Decision matrix:

| Capacity Signal | Current Ads | Proposal |
|----------------|-------------|----------|
| PAUSE (0 avg slots, 90%+ booked) | Running | Pause campaigns, save budget |
| REDUCE (<3 avg slots, 60%+ booked) | Running at high budget | Reduce to minimum awareness spend |
| MAINTAIN (3-6 avg slots) | Running | Keep current budget |
| SCALE (6+ avg slots, <60% booked) | Running at low budget | Increase budget, shift from constrained services |
| SCALE (6+ avg slots, <60% booked) | No campaigns | Recommend launching new campaign |

Specific outputs:
- EUR amounts to shift between services (e.g., "Move EUR 15/day from Lipocavitation to Hydrafacial")
- Ranked priority list of changes
- Net budget impact (total doesn't change, just redistribution)
- Confidence level per recommendation (based on data quality and sample size)

### Phase 5 -- Publish

1. Write detailed markdown report to `.tmp/performance/occupancy-optimizer-report.md`
2. Push summary table to Google Sheet (capacity + current spend + proposed spend per service)
3. Print executive summary to console for CMO/CEO

Report format:
```markdown
# Occupancy Optimizer Report
## Date: {date} | Venues: {venues scanned}

### Executive Summary
- X services over-advertised (spending on full capacity)
- Y services under-advertised (capacity available, low/no spend)
- Proposed reallocation: EUR Z shift from constrained to open services

### Service-by-Service Analysis
| Service | Capacity | Booked % | Current Spend/Day | Proposed Spend/Day | Change | Reason |
|---------|----------|----------|-------------------|--------------------|--------|--------|
| ... | ... | ... | ... | ... | ... | ... |

### Reallocation Actions (Priority Order)
1. [ACTION] [Service]: [Specific change] -- [Reason]
2. ...

### Data Sources
- Fresha: scraped {date}, {N} days lookahead
- Meta Ads: {date range}, {M} active campaigns
```

---

## Autonomy Boundaries

| Action | Authority |
|--------|-----------|
| Run Fresha scraper | Autonomous |
| Pull Meta Ads insights (read-only) | Autonomous |
| Generate capacity report | Autonomous |
| Generate budget reallocation proposal | Autonomous |
| Publish to Google Sheet | Autonomous |
| Modify campaign budgets | **Escalate to CEO** |
| Pause/activate campaigns | **Escalate to CEO** |
| Add new venue/service to config | Escalate to CMO |

---

## Input/Output Contract

### Inputs

| Input | Source | Required |
|-------|--------|----------|
| Venue | User/CMO (`slimming`, `aesthetics`, `all`) | No (defaults to `all`) |
| Days to check | User (default: 14) | No |
| `config/fresha_venues.json` | Config file | Yes |
| `config/brands.json` | Config file (Meta ad account IDs) | Yes |
| `config/naming_conventions.json` | Config file (campaign-to-service mapping) | Yes |

### Outputs

| Output | Path | Consumer |
|--------|------|----------|
| Capacity report JSON | `.tmp/performance/fresha_capacity_report.json` | Other agents, pipeline |
| Optimizer markdown report | `.tmp/performance/occupancy-optimizer-report.md` | CMO, CEO |
| Google Sheet update | Configured Sheet ID | CEO (human review) |
| Console summary | Printed | Whoever triggered the agent |

---

## File Structure

```
.agents/skills/occupancy-checker/
+-- SKILL.md                    # Main agent skill (pipeline + routing)
+-- config.json                 # Paperclip agent metadata
+-- phases/
|   +-- phase-1-scrape.md       # Fresha capacity scraping instructions
|   +-- phase-2-pull-ads.md     # Meta Ads data pull instructions
|   +-- phase-3-crossref.md     # Supply-demand crossref logic
|   +-- phase-4-reallocate.md   # Budget reallocation proposal logic
|   +-- phase-5-publish.md      # Report + Sheet publishing
+-- references/
    +-- decision-matrix.md      # Capacity to ad action decision rules
```

### Existing Dependencies (Already Built)

| File | Purpose |
|------|---------|
| `tools/check_fresha_availability.py` | Playwright-based Fresha scraper |
| `config/fresha_venues.json` | Venue URLs, services, team members |
| `workflows/12_capacity_check.md` | Capacity check workflow documentation |

### New Tool Required

| File | Purpose |
|------|---------|
| `tools/optimize_ad_budget.py` | Takes capacity JSON + Meta Ads data, produces reallocation proposal |

---

## Integration with Existing Agents

### CMO
- Receives occupancy optimizer reports
- Uses proposals when setting quarterly themes and brand budget allocation
- Can trigger: `/occupancy all` before any cross-brand budget decision

### Marketing Finance Specialist
- Reads capacity report to inform budget allocation analysis
- Cross-references reallocation proposals with actual spend data

### GM Marketing Agents
- Receive service-level capacity alerts relevant to their brand
- Use proposals when deciding which campaigns to scale/pause

### Performance Review (Workflow 09)
- Occupancy Checker should run BEFORE performance review
- Capacity data overrides performance-only recommendations
- A winning ad for a fully booked service should still be reduced

---

## Edge Cases

### Meta Ads Token Expired
- If Meta Ads API returns auth error, skip Phase 2-4
- Run Phase 1 only and publish a capacity-only report
- Flag to user: "Meta Ads token expired. Run capacity-only mode. Reallocation proposals require valid token."

### New Service Not in Config
- If Fresha shows services not in `config/fresha_venues.json`, log them
- Don't fail -- scrape known services, note unknown ones in report

### No Active Campaigns for a Service
- If a service has open capacity but no campaigns exist, flag as "Launch Opportunity"
- Include in reallocation proposal as "New campaign recommended"

### Campaign Naming Doesn't Match Services
- If campaign names can't be mapped to Fresha services, fall back to brand-level analysis
- Flag unmapped campaigns in the report for human review

---

## Context Injection

The agent's SKILL.md will instruct it to read:

| File | Purpose |
|------|---------|
| `config/fresha_venues.json` | Venue URLs, services to check |
| `config/brands.json` | Ad account IDs, brand metadata |
| `config/naming_conventions.json` | Campaign naming patterns for service mapping |
| `config/kpi_thresholds.json` | CPL targets for reallocation math |
| `workflows/12_capacity_check.md` | Capacity decision thresholds |

---

## Org Design Update

The Paperclip org design (`docs/plans/2026-03-31-paperclip-org-design.md`) needs updating:
- Add Occupancy Checker to CMO sub-team in org chart
- Update total agent count from 20 to 21
- Add context injection row for Occupancy Checker
- Add MCP tool access note
