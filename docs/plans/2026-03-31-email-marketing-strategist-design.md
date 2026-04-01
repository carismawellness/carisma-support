# Email Marketing Strategist Agent — Design Document

**Date:** 2026-03-31
**Status:** Approved
**Approach:** Lightweight Agent + External Strategy Reference (Approach A)

---

## Context

Carisma Wellness Group has a comprehensive email marketing content strategy system (`marketing/email-marketing/`) covering all three brands (Spa, Aesthetics, Slimming) with 362KB of actionable strategy across 4 files. The Email Designer agent already handles production (Figma pipeline + QC). This design creates the **Email Marketing Strategist** — the planning and delegation layer that sits between the CMO and the Email Designer.

## Agent Identity

| Property | Value |
|----------|-------|
| Name | `email-marketing-strategist` |
| Title | Email Marketing Strategist |
| Reports to | CMO |
| Delegates to | Email Designer |
| Runtime | Claude Sonnet |
| Org Layer | CMO Sub-Team |
| Trigger | `/emailstrategy <action> [brand]` |

## File Structure

```
.agents/skills/email-marketing-strategist/
  SKILL.md       # Agent identity, workflows, decision trees, delegation protocol
  config.json    # Paperclip agent metadata
```

Two files only. All email marketing knowledge lives in `marketing/email-marketing/` and is referenced, not duplicated.

## 4 Actions

| Action | Purpose | Input | Output |
|--------|---------|-------|--------|
| `plan` | Generate email campaign plan for a brand/period | Brand + time period | Campaign calendar with topics, content types, audiences, flows |
| `brief` | Create a detailed brief for the Email Designer | Brand + campaign topic | Wireframe brief: subject lines, copy sections, content type, CTA, audience |
| `review` | Review QC scorecard and HTML output from Email Designer | Designer output + QC score | Approve, request revisions, or escalate |
| `audit` | Audit email performance and recommend optimizations | Brand + date range (via Klaviyo) | Performance report: open rates, CTR, flow performance, A/B results, recommendations |

## Knowledge Base (Context Injection)

The agent reads from these files — no duplication:

| File | When Loaded | Purpose |
|------|-------------|---------|
| `marketing/email-marketing/SKILL.md` | Always | Master strategy: 7 content types, 9-section template, flows, CTAs, seasonal calendar, segmentation, benchmarks |
| `marketing/email-marketing/spa-email-strategy.md` | When brand = Spa | Deep Spa reference: Sarah persona, 6 pillars, sensory writing, lifestyle segments |
| `marketing/email-marketing/aesthetics-email-strategy.md` | When brand = Aesthetics | Deep Aesthetics reference: Trust Ladder, Fear Framework, treatment mapping, compliance |
| `marketing/email-marketing/slimming-email-strategy.md` | When brand = Slimming | Deep Slimming reference: Katya persona, compassionate voice, ethical framework, programme flows |
| `marketing/marketing-calendar/` | For `plan` action | Quarterly campaign calendar context |
| `config/branding_guidelines.md` | Always | Brand voice quick reference |
| `config/kpi_thresholds.json` | For `audit` action | Performance targets and thresholds |

## Autonomy Boundaries

| Level | Actions |
|-------|---------|
| **Autonomous** | Campaign planning, content type selection, brief creation, QC review, performance analysis, A/B test recommendations |
| **Escalate to CMO** | Changing quarterly email themes, adding/removing flows, modifying content type rotation, brand voice changes |
| **Escalate to CEO** | Campaign activation in Klaviyo, budget decisions, new email tool adoption |

## Workflow: `plan`

```
1. Read quarterly marketing calendar for the brand
2. Load marketing/email-marketing/SKILL.md (Section 3: content types, Section 9: seasonal calendar)
3. Load brand-specific strategy file
4. Map each campaign period to:
   - Content type (from the 7 universal types)
   - Audience segment (from SKILL.md Section 10)
   - Subject line direction (from SKILL.md Section 7 formulas)
   - Flow integration (does this feed into Welcome/Win-back/etc?)
   - Emotional register (from brand-specific strategy)
5. Apply monthly content rotation (SKILL.md Quick-Reference):
   - Week 1: Emotional (Storytime POV or Pain-Solution)
   - Week 2: Educational (Insider Secrets or Hooked Insight)
   - Week 3: Proof (Before & After / Transformation Story)
   - Week 4: Positioning (Objection Flip or Us vs Them)
6. Output: email campaign plan (markdown) with week-by-week schedule
```

## Workflow: `brief`

```
1. Read the campaign plan
2. Load SKILL.md Section 4 (9-section template) + Section 7 (subject lines) + Section 8 (CTAs)
3. Load brand-specific strategy for deep content guidance
4. Generate brief with:
   - Content type + structural framework (from Section 3)
   - 3 subject line options (using formulas from Section 7)
   - Hero header direction
   - Opening copy draft (following the content type's emotional arc)
   - Educational/proof layer direction
   - CTA selection (from approved CTA library, Section 8)
   - Audience segment + send time recommendation (from Section 14)
   - Emotional register selection
5. Output: structured brief → delegated to Email Designer via /emaildesign <brand>
```

## Workflow: `review`

```
1. Receive Email Designer's output (QC scorecard + HTML)
2. Check QC score against threshold (>= 112/170 = pass)
3. Review brand voice compliance against brand-specific strategy file
4. Check subject line, CTA, and template adherence against SKILL.md
5. Run pre-send checklist (SKILL.md Section 11)
6. Decision:
   - Score >= 112 AND checklist passes → Approve → route to Klaviyo
   - Score >= 112 BUT checklist fails → Request specific revisions → back to Designer
   - Score < 112 → Escalate to CMO with analysis
```

## Workflow: `audit`

```
1. Pull email performance data (Klaviyo MCP)
2. Compare against benchmarks from SKILL.md Section 14:
   - Open rate target: 30-40%
   - CTR target: 4-6%
   - Click-to-open target: 15%+
   - Unsubscribe target: below 0.2%
3. Classify each email/flow: winner / watchlist / underperformer
4. Identify A/B test insights
5. Recommend: content type rotation changes, flow adjustments, segment refinements
6. Output: performance report → delivered to CMO
```

## Integration with Other Agents

| Agent | Relationship |
|-------|-------------|
| **CMO** | Receives quarterly themes and brand standards. Reports email performance weekly. |
| **Email Designer** | Sends briefs via `brief` action. Reviews output via `review` action. |
| **GM Marketing Agents** | Notifies when email assets are ready for their brand. Receives campaign context. |
| **Marketing Finance Specialist** | Receives budget guidance for email channel. Reports email revenue attribution. |
| **Meta Strategist** | Coordinates campaign timing — email campaigns should complement, not compete with, paid campaigns. |

## Input/Output Contract

### Receives

| Input | Source | Required |
|-------|--------|----------|
| Action (`plan`/`brief`/`review`/`audit`) | User or CMO | Yes |
| Brand (`spa`/`aesthetics`/`slimming`) | User or CMO | Yes |
| Time period | User (for `plan`/`audit`) | For `plan`/`audit` |
| Campaign topic | User or from plan (for `brief`) | For `brief` |
| Designer output | Email Designer (for `review`) | For `review` |

### Delivers

| Output | Destination |
|--------|-------------|
| Email campaign plan (markdown) | CMO + GM Marketing Agent |
| Design brief (structured markdown) | Email Designer |
| Review decision (approve/revise/escalate) | Email Designer or CMO |
| Performance report (markdown) | CMO |

## MCP Tools

| Tool | Purpose |
|------|---------|
| Klaviyo | Pull email performance data, list campaigns, check flow metrics |
| Google Sheets | Read/write campaign plans, performance dashboards |
| Google Workspace | Calendar coordination, document sharing |

## Org Chart Position

```
CMO (Claude Sonnet)
│
├── Marketing Finance Specialist (Claude Code)
├── Email Marketing Strategist (Claude Sonnet) ← THIS AGENT
│   └── Email Designer (Claude Code)
├── Meta Strategist (Claude Code)
└── SMM Expert Specialist (Claude Code)
```
