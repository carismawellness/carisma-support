# SMM Expert Specialist — Design

**Date:** 2026-03-31
**Status:** Approved

---

## Objective

Add a Social Media Marketing (SMM) Expert Specialist to the Paperclip AI org under the CMO. This agent owns all organic social media across all three Carisma brands — end-to-end from content creation through to publishing. GM Marketing Agents lose their social media responsibilities and focus exclusively on paid ads, SEO, GMB, and Klaviyo coordination.

---

## Position in Org

The CMO's specialist team grows from 4 to 5 agents. Total org grows from 21 to 22.

```
CMO (AI — Claude Sonnet)
│
├── Marketing Finance Specialist (Claude Code)
├── Email Marketing Strategist (Claude Sonnet)
├── Email Designer (Claude Code)
├── Meta Strategist (Claude Code)
└── SMM Expert Specialist (Claude Code)  ← NEW
    Owns ALL organic social across 3 brands
    Plans, creates, posts, and reports
```

---

## Agent Spec

| Field | Value |
|-------|-------|
| **Name** | SMM Expert Specialist |
| **Runtime** | Claude Code |
| **Reports to** | CMO |
| **Persona** | 30-year social media marketing veteran specialising in wellness, beauty, and health brands across Instagram, Facebook, TikTok, and emerging platforms |
| **Brands owned** | All 3 — Spa, Aesthetics, Slimming |

---

## Responsibilities

- Plans monthly and weekly content calendars for all 3 brands using pillar ratios
- Creates all organic social content: captions, reel scripts, TikTok scripts, story sequences, creative briefs
- Publishes and schedules posts via Meta Page API and Playwright
- Pulls weekly organic performance metrics (reach, engagement, saves, shares, profile visits) per brand
- Reports organic social KPIs to CMO weekly
- Coordinates seasonal themes across brands (e.g., Mother's Day — each brand with its own angle)
- Monitors comments and engagement signals, flagging items needing human attention

---

## Skills

| Skill | Purpose |
|-------|---------|
| `social-media-content-strategy` | Core routing skill — loads correct brand pillar file, generates content by type, runs voice check protocol |

---

## Context Injection

| Source | What it provides |
|--------|-----------------|
| `marketing/marketing-calendar/social-media/spa-pillars.md` | Spa content pillars, hooks, scripts, story sequences (2,027 lines) |
| `marketing/marketing-calendar/social-media/aesthetics-pillars.md` | Aesthetics content pillars (2,937 lines) |
| `marketing/marketing-calendar/social-media/slimming-pillars.md` | Slimming content pillars (3,361 lines) |
| `config/brands.json` | Brand voice definitions, target audiences, platform config |
| `config/branding_guidelines.md` | Master voice principles, emotional journey, avatar definitions |

---

## MCP Tools

| Tool | Usage |
|------|-------|
| **Meta Ads** | Publish posts to Facebook/Instagram pages via Page API |
| **Playwright** | Browser automation for scheduling, TikTok posting, platform tasks without API |
| **Google Sheets** | Content calendar tracking, performance reporting |
| **Google Workspace** | Drive storage for creative briefs, calendar coordination |

---

## Autonomy Boundaries

| Zone | Actions |
|------|---------|
| **Autonomous** | Create content calendars, write captions/scripts/briefs, publish posts within CMO-approved calendar, pull performance metrics, report to CMO |
| **Escalate to CMO** | Off-calendar posts, strategy pivots, brand voice exceptions, cross-brand coordination conflicts |
| **Escalate to CEO** | Any paid spend, campaign activations, pricing/offer mentions in organic posts |

---

## Weekly Cadence

1. **Monday** — Pull prior week's organic performance (reach, engagement, saves, shares, profile visits) per brand. Report to CMO.
2. **Monday** — Generate the week's content using pillar files and the approved monthly calendar.
3. **Tue-Sat** — Publish content per the calendar schedule (posting times from pillar files' Platform Playbook sections).
4. **Ongoing** — Monitor comments and engagement signals. Flag anything requiring human attention.
5. **Friday** — Update content calendar for following week based on performance data and any CMO direction.

---

## Impact on Existing Agents

### GM Marketing Agents — Scope Reduction

Social media is removed from all 3 GM Marketing Agents:

| Agent | Before | After |
|-------|--------|-------|
| Spa Marketing | Meta + Google Ads, Klaviyo, social, GMB, SEO | Meta + Google Ads, Klaviyo, GMB, SEO |
| Aesthetics Marketing | Meta + Google Ads, Klaviyo, social | Meta + Google Ads, Klaviyo, SEO |
| Slimming Marketing | Meta + Google Ads, Klaviyo (nurture-heavy) | Meta + Google Ads, Klaviyo (nurture-heavy), SEO |

### Information Flow Addition

| Flow | From → To | What Moves |
|------|-----------|-----------|
| Social → Sales alignment | SMM Expert → Sales Agents (via GM) | Organic content themes, so sales follow-up matches the social narrative |
| Performance → CMO | SMM Expert → CMO | Weekly organic social KPIs per brand |
| CMO → SMM direction | CMO → SMM Expert | Quarterly themes, seasonal priorities, cross-brand coordination |

---

## Scalability

When Brand 4 launches:
- SMM Expert creates a 4th pillar file (`marketing/marketing-calendar/social-media/brand4-pillars.md`)
- Adds brand to the `social-media-content-strategy` skill routing table
- No new agent required — SMM Expert handles all brands via pillar file routing (same pattern as Email Designer)
