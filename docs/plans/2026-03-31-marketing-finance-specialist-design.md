# Marketing Finance Specialist Agent — Design

**Date:** 2026-03-31
**Status:** Approved
**Parent Org:** Paperclip CMO Team

---

## Overview

A new Claude Code agent that sits directly under the CMO in the Paperclip org chart. It is the financial brain of marketing — handling budget allocation, spend tracking, ROAS/CPL analysis, revenue attribution, and weekly consolidated reporting. This is the first C-Suite agent to have its own specialist sub-agent.

**Org count change:** 17 → 18 agents.

## Org Position

```
CMO (Claude Sonnet)
│
├── Marketing Finance Specialist (Claude Code)  ← NEW
│   Budget allocation, spend tracking, ROAS/CPL,
│   revenue attribution, weekly financial report
│
└── (still reviews 3 GM marketing reports)
```

**Relationship with GM Marketing Agents:** Advisory. Publishes budget allocations and performance reports. Does NOT directly modify campaigns or instruct GM agents — the CMO routes directives based on this agent's analysis.

## Responsibilities (5 Phases)

| Phase | What It Does | Frequency | Outputs |
|-------|-------------|-----------|---------|
| **1. Budget Allocation** | Computes per-campaign daily budgets using `config/budget-allocation.json`. Splits by brand, channel (Meta/Google), and campaign type (evergreen/seasonal). Enforces EUR 5/day minimum. | On-demand (calendar planning) | Budget table per brand/channel/campaign |
| **2. Spend Tracking** | Pulls actual spend from Meta Ads + Google Ads APIs. Compares actual vs. planned. Flags overspend/underspend by brand. | Weekly | Spend variance report |
| **3. ROAS/CPL Analysis** | Computes CPL, CPA, ROAS per campaign. Classifies winners/losers against `config/kpi_thresholds.json`. | Weekly | Performance scorecard per brand |
| **4. Revenue Attribution** | Matches ad spend to revenue data from Carisma Analytics sheet. Computes ROI by brand and campaign type. | Weekly/Monthly | ROI analysis |
| **5. Weekly Report** | Consolidates phases 2-4 into a CMO-ready summary with key metrics, anomalies, and recommendations. | Weekly | Formatted report → CMO + Google Sheets |

## Technical Specs

### Runtime

Claude Code — requires MCP tool execution for API calls and data processing.

### MCP Tool Access

| Tool | Used For |
|------|----------|
| **Meta Ads** | `get_insights` for spend, CPL, CPA, ROAS per campaign |
| **Google Sheets** | Read/write budget dashboards, KPI sheets, revenue data |
| **Google Analytics** | Revenue attribution, conversion tracking |
| **Google Workspace** | Calendar integration for reporting cadence |

### Context Injection

| File | Purpose |
|------|---------|
| `config/budget-allocation.json` | Budget source of truth (weekly budgets, splits, minimums) |
| `config/kpi_thresholds.json` | CPL/ROAS targets for winner/loser classification |
| `config/brands.json` | Ad account IDs, brand metadata |
| Carisma Analytics sheet `1q_aqO9QpCaRoqhOI0Fd41YPO7NMrRAlv5EjShmZK6RM` | Revenue data |

## File Structure

```
.agents/skills/marketing-finance-specialist/
├── SKILL.md                              # Router skill (agent identity + phase dispatch)
├── config.json                           # Agent metadata (Paperclip fields + triggers + inputs/outputs)
├── paperclip-registration.json           # Paperclip platform registration payload
├── phases/
│   ├── phase-1-budget-allocation.md      # Wraps budget-allocation procedure
│   ├── phase-2-spend-tracking.md         # Meta Ads + Google Ads actuals
│   ├── phase-3-roas-analysis.md          # CPL/CPA/ROAS computation
│   ├── phase-4-revenue-attribution.md    # Spend vs. revenue matching
│   └── phase-5-weekly-report.md          # Consolidated CMO report
└── references/
    └── budget-allocation.md              # Reference copy of budget allocation procedure
```

### Pattern Reference

Follows the **Paperclip agent pattern** (`.agents/skills/email-designer/`):
- Router SKILL.md with frontmatter metadata and Paperclip routing description
- config.json with agent-role, reports-to, runtime, org-layer metadata
- Separate phase files for each responsibility area
- References folder for supporting documentation

## Information Flow

```
config/budget-allocation.json ──→ Phase 1 (Budget Allocation)
                                      │
                                      ↓ publishes budget tables
                              GM Marketing Agents consume

Meta Ads API ──────────────→ Phase 2 (Spend Tracking)
Google Ads ────────────────→      │
                                  ↓ spend variance
                              Phase 3 (ROAS Analysis)
config/kpi_thresholds.json ──→    │
                                  ↓ performance scorecard
Carisma Analytics Sheet ───→ Phase 4 (Revenue Attribution)
                                  │
                                  ↓ all data consolidated
                              Phase 5 (Weekly Report) → CMO
```

## Escalation Rules

| Trigger | Action |
|---------|--------|
| Any brand >80% budget consumed before week-end | Flag to CMO immediately |
| CPL exceeds 2x target for 3+ consecutive days | Flag to CMO with recommendation |
| ROAS drops below threshold for a campaign | Include in weekly report with pause recommendation |
| Cross-brand budget reallocation needed | Escalate to CMO → CEO (requires CEO approval) |

## Integration Points

| System | How This Agent Connects |
|--------|----------------------|
| **calendar-strategy skill Phase 3** | Budget allocation is invoked after campaign planning |
| **quarterly-marketing-calendar** | Campaign counts feed into budget computation |
| **meta-strategist** | Evergreen campaign budgets from 60% pool |
| **google-ads-strategist** | Google budgets from Google weekly allocation |
| **CFO agent** | Shares spend data for group P&L consolidation |

## Paperclip Org Update

The paperclip org design (`docs/plans/2026-03-31-paperclip-org-design.md`) needs updating:
- Add Marketing Finance Specialist under CMO in org chart
- Update agent count: 17 → 18
- Add to Context Injection table
- Add to MCP Tool Access notes
