# Paperclip AI Org Design — Carisma Wellness Group

**Date:** 2026-03-31
**Status:** Approved
**Platform:** [Paperclip](https://paperclip.ing/) (open-source, MIT licensed)

---

## Architecture Overview

Carisma Wellness Group operates as a **GM-led org** inside Paperclip. Five C-suite AI agents handle cross-brand strategy and oversight. Three General Manager AI agents each own full execution (marketing, sales, operations) for their brand. The CEO (Mert) is the sole human, acting as the board.

**Total agents:** 18 (5 C-Suite + 3 GMs + 9 sub-agents + 1 CMO specialist)

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
│   └── Marketing Finance Specialist (AI — Claude Code)
│       Budget allocation, spend tracking, ROAS/CPL analysis
│       Revenue attribution, weekly CMO financial report
│       Advisory role — publishes analysis, does not modify campaigns
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
├── COO (AI — Claude Sonnet)
│   Group operations
│   Cross-brand capacity, quality standards, vendor coordination
│
├── GM Spa (AI — Claude Sonnet)
│   Owns all Spa execution — EUR 220k/mo revenue, 8 locations
│   Coordinates 3 sub-agents, reports to C-Suite
│   │
│   ├── Spa Marketing Agent (Claude Code)
│   │   Meta + Google Ads, Klaviyo, social, GMB, SEO
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
│   │   Meta + Google Ads, Klaviyo, social
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
| CMO | Claude Sonnet | Marketing strategist | Sets quarterly campaign themes, defines brand voice standards, reviews cross-brand marketing KPIs, identifies cross-pollination opportunities between brands. Reviews GM marketing reports weekly. Escalates to CEO only for budget reallocation >20%. Has one direct sub-agent: Marketing Finance Specialist (Claude Code). |
| CSO | Claude Sonnet | Sales strategist | Sets CPL/CPA targets per brand, defines lead qualification criteria, reviews conversion funnels, identifies upsell/cross-sell paths between brands. Reviews GM sales metrics weekly. Escalates pricing or offer changes to CEO. |
| CFO | Claude Sonnet | Group finance | Consolidated P&L, group EBITDA, budget allocation across brands, cash flow forecasting, vendor cost negotiation guidance. Owns group financial reporting. Escalates budget overruns to CEO. |
| CHRO | Claude Sonnet | Group HR | Hiring standards, payroll oversight, compliance, workforce planning across all brands. Escalates headcount changes to CEO. |
| COO | Claude Sonnet | Group operations | Location capacity management, service quality standards, scheduling optimization, vendor/supplier coordination. Escalates operational issues affecting multiple brands to CEO. |

### Layer 3: General Managers (Brand Execution)

Three AI agents that each act as a **mini-CEO for their brand**. They own marketing, sales, and operations execution. They coordinate their sub-agents, report upward to the C-Suite, and escalate only when thresholds are breached.

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
- Handle email marketing (Klaviyo), social media, SEO
- Spa agent also manages GMB posts across 5 locations

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

### CMO Specialist Agent

The Marketing Finance Specialist is a **Claude Code** agent that reports directly to the CMO. It is the first C-Suite agent to have its own specialist sub-agent.

**Responsibilities:**
- Budget allocation across brands, channels, and campaign types
- Weekly spend tracking (actual vs. planned) with variance analysis
- ROAS/CPL analysis with winner/loser/watchlist classification
- Revenue attribution matching ad spend to business revenue
- Weekly consolidated financial report for the CMO

**Relationship with GMs:** Advisory only. Publishes budget allocations and performance reports. Does not directly modify campaigns or instruct GM agents.

**MCP Tools:** Meta Ads (insights), Google Sheets (dashboards), Google Analytics (revenue)

**Context injection:** `config/budget-allocation.json`, `config/kpi_thresholds.json`, `config/brands.json`, Carisma Analytics sheet

---

## Information Flow

### Vertical Flow

```
CEO
  ↓ Sets company goals, approves budgets
  ↑ Receives consolidated dashboards, escalations

C-Suite
  ↓ Sets brand-level targets, standards, cross-brand strategy
  ↑ Receives weekly GM performance summaries

GMs
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
| GM → C-Suite reporting | GM → CMO/CSO/CFO | Weekly brand KPIs | GM Spa sends CPL, ROAS, revenue, conversion rate to CMO and CSO |
| C-Suite → GM direction | CMO/CSO → GM | Strategy updates, target changes | CMO tells all GMs: "Q3 theme is Summer Glow — align campaigns" |
| CFO ← GMs | GMs → CFO | Brand-level spend and revenue data | CFO consolidates into group P&L and EBITDA |
| COO ← Ops Agents | Ops sub-agents → COO | Capacity utilization, scheduling data | COO sees cross-brand capacity and flags underutilized locations |
| Cross-brand referral | GM → GM (via CSO) | Cross-sell opportunities | Spa client asks about weight loss → CSO routes to GM Slimming |

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
├── COO:  5% (capacity analysis, scheduling optimization)
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
- Performance analysis and reporting
- Lead follow-up sequences
- Email marketing sends within approved templates
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
| COO | `config/fresha_venues.json`, location capacity data, quality metrics |
| GM Spa | Spa brand config, spa offers, spa KPIs, spa CRM data, 8 location details |
| GM Aesthetics | Aesthetics brand config, aesthetics offers, treatment menu, consultation flow |
| GM Slimming | Slimming brand config, program details, nurture sequences, retention data |
| Marketing Finance Specialist | `config/budget-allocation.json`, `config/kpi_thresholds.json`, `config/brands.json`, Carisma Analytics sheet, Meta Ads insights |
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
- Budget reallocation from existing 40/25/15 split
- New brand config files and knowledge base
- No changes to C-Suite layer

### Agent Count Projection

| State | Agents |
|-------|--------|
| Current (3 brands) | 18 |
| With Brand 4 | 22 |
| With Brand 5 | 26 |

Each new brand adds exactly 4 agents (1 GM + 3 sub-agents).
