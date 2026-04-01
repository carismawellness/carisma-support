# Google Ads Specialist Agent — Design

**Date:** 2026-03-31
**Status:** Approved
**Parent Org:** Paperclip CMO Team

---

## Overview

A new Claude Code agent that sits directly under the CMO in the Paperclip org chart. It is the cross-brand Google Ads authority — owning the proven campaign roster, layering Google campaigns into marketing calendars, reporting on performance, and publishing optimization recommendations.

**Org count change:** 22 → 23 agents.

## Org Position

```
CMO (Claude Sonnet)
│
├── Marketing Finance Specialist (Claude Code)
├── Email Marketing Strategist (Claude Sonnet)
├── Email Designer (Claude Code)
├── Meta Strategist (Claude Code)
├── Google Ads Specialist (Claude Code)  ← NEW
│   Proven Google Ads campaign roster across all 3 brands
│   Layers Google campaigns into marketing calendars
│   Performance reporting + optimization recommendations
│   Advisory role — publishes analysis, does not modify campaigns
│
└── SMM Expert Specialist (Claude Code)
```

**Relationship with GM Marketing Agents:** Advisory only. Publishes campaign knowledge, performance reports, and optimization briefs. Does NOT directly modify Google Ads campaigns. The CMO routes directives based on this agent's analysis.

## Responsibilities (4 Actions)

| Action | What It Does | Frequency | Outputs |
|--------|-------------|-----------|---------|
| **roster** | Source of truth for proven Google Ads campaigns per brand. References `google-ads-strategist` skill. Answers "what campaigns should be running?" | On-demand | Campaign roster per brand with type and status |
| **layer** | When building marketing calendars, provides the Google Ads layer — which campaigns to include, demand-toggle decisions (e.g. Spa LHR on/off based on occupancy) | On-demand (calendar planning) | Google Ads campaign list for calendar |
| **report** | Pulls Google Ads performance data (clicks, CPC, conversions, spend) per campaign per brand. Compares to targets. Classifies winner/watchlist/loser. | Weekly | Performance report → CMO |
| **optimize** | Analyses search terms, keyword performance, bid efficiency, quality scores. Recommends bid adjustments, negative keywords, new keyword opportunities. | Bi-weekly/Monthly | Optimization brief → CMO → GMs |

## Knowledge Base

The `google-ads-strategist` skill (`~/.claude/skills/google-ads-strategist/SKILL.md`) encodes:

### 11 Proven Campaigns Across 3 Brands

**Carisma Spa (4 campaigns):**
- Search: Spa Day (always-on)
- Performance Max: Remarketing (always-on)
- Search: Laser Hair Removal (demand-toggle — ON/OFF based on occupancy)
- Maps: Local (always-on)

**Carisma Aesthetics (5 campaigns):**
- Search: Botox (always-on)
- Search: Fillers (always-on)
- Search: Laser Hair Removal (always-on)
- Remarketing: LHR (always-on)
- Search: Micro-needling & Mesotherapy (always-on, **top performer**)

**Carisma Slimming (2 campaigns):**
- Search: Medical Weight Loss (always-on)
- Search: Weight Loss (always-on)

## Technical Specs

### Runtime

Claude Code — requires tool execution for data pulls and analysis.

### MCP Tool Access

| Tool | Used For |
|------|----------|
| **Google Ads API** | Performance data, search terms, keyword reports (future — not yet configured) |
| **Google Sheets** | Read/write performance dashboards |
| **Google Analytics** | Conversion tracking, revenue attribution |

### Context Injection

| File | Purpose |
|------|---------|
| `~/.claude/skills/google-ads-strategist/SKILL.md` | Source of truth for proven campaigns |
| `config/kpi_thresholds.json` | CPC/CPL targets for winner/loser classification |
| `config/brands.json` | Brand metadata |
| `config/budget-allocation.json` | Google budget splits (50% Search / 30% Pmax / 20% Remarketing) |

## File Structure

```
.agents/skills/google-ads-specialist/
├── SKILL.md                              # Agent identity, routing table, contracts
├── config.json                           # Agent metadata (triggers, tools, inputs/outputs)
└── phases/
    ├── phase-1-campaign-knowledge.md     # References google-ads-strategist skill
    ├── phase-2-calendar-integration.md   # Google Ads layer for marketing calendars
    ├── phase-3-performance-reporting.md  # Weekly Google Ads performance data
    └── phase-4-optimization.md           # Search term analysis, bid recommendations
```

**Knowledge skill (separate):** `~/.claude/skills/google-ads-strategist/SKILL.md` — the proven campaign roster

### Pattern Reference

Follows the **Email Designer pattern** (`agents/skills/email-designer/`) in the Paperclip org:
- Dedicated agent directory in `.agents/skills/`
- SKILL.md with agent identity, input/output contracts, routing table
- config.json for agent metadata and triggers
- Separate phase files for each action
- Advisory role with CMO escalation path

## Autonomy Boundaries

- **Autonomous:** Roster generation, calendar merging, performance analysis, optimization briefs
- **Escalate to CMO:** Adding/removing campaigns from the proven roster, demand-toggle overrides
- **Escalate to CEO:** Campaign activation, budget reallocation between brands

## Information Flow

```
google-ads-strategist skill ──→ Phase 1 (Campaign Knowledge)
                                      │
                                      ↓ proven roster
                              Phase 2 (Calendar Integration)
                                      │
                                      ↓ Google layer for calendar
Google Ads API ───────────────→ Phase 3 (Performance Reporting)
config/kpi_thresholds.json ──→       │
                                     ↓ performance report
                              Phase 4 (Optimization)
                                     │
                                     ↓ optimization brief → CMO → GMs
```

## Integration Points

| System | How This Agent Connects |
|--------|----------------------|
| **quarterly-marketing-calendar Phase 4** | Layers Google campaigns into the calendar alongside Meta evergreen |
| **calendar-strategy skill Phase 3** | Google campaigns placed in Google Campaign rows per brand |
| **meta-strategist** | Parallel channel specialist — Meta handles interruption, Google handles search intent |
| **Marketing Finance Specialist** | Shares Google spend data for budget tracking and ROAS analysis |
| **GM Marketing Agents** | Receives optimization recommendations via CMO |

## Escalation Rules

| Trigger | Action |
|---------|--------|
| CPC spike >50% on any campaign | Flag immediately in performance report |
| New high-volume keyword opportunity | Recommend to CMO for GM action |
| Quality score drop below 5 | Recommend landing page review |
| Competitor bidding on brand terms | Flag to CMO with defensive strategy |
| Demand-toggle conflict (occupancy unclear) | Ask CMO/GM for occupancy status |

## Paperclip Org Updates Made

- Agent count: 22 → 23
- CMO sub-agents: 5 → 6
- Added Google Ads Specialist to org chart, Layer 2 table, Agent Runtimes, Context Injection, Scalability section
- Updated agent count projections (Brand 4: 27, Brand 5: 31)
