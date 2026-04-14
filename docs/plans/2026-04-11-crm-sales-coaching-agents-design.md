# CRM Sales Conversion Coaching System — Design Document

**Date:** 2026-04-11
**Status:** Approved
**Goal:** Double chat-to-booking conversion rates through daily AI-powered coaching

---

## Problem Statement

Carisma operates 3 brands (Spa, Aesthetics, Slimming) with 9 sales reps across 10 channels. Each brand has structured call scripts and 11 outreach types, but there is no systematic way to:
- Know whether reps are following scripts
- Identify why some reps convert better than others
- Catch factual errors, missed follow-ups, or dead leads
- Coach reps with specific, evidence-based feedback

## Solution Overview

Three specialized AI sub-agents run daily at 6:00 AM via cron job, analyzing every conversation from the previous day across all channels. An orchestrator agent coordinates data collection, dispatches work to the sub-agents, merges their assessments, and delivers coaching reports.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    DAILY CRON (6:00 AM)                  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │            ORCHESTRATOR AGENT                     │   │
│  │  Pulls yesterday's data from all channels,        │   │
│  │  organizes by rep + brand, dispatches to           │   │
│  │  sub-agents, assembles final reports               │   │
│  └──────────┬──────────┬──────────┬─────────────────┘   │
│             │          │          │                       │
│      ┌──────▼───┐ ┌────▼─────┐ ┌─▼──────────┐          │
│      │  CRM     │ │  SALES   │ │  BRAND     │          │
│      │  PROCESS │ │  COACHING│ │  DOMAIN    │          │
│      │  AGENT   │ │  AGENT   │ │  AGENT     │          │
│      └──────┬───┘ └────┬─────┘ └─┬──────────┘          │
│             │          │          │                       │
│             └──────────┼──────────┘                       │
│                        ▼                                  │
│              ┌─────────────────┐                         │
│              │  DAILY REPORTS  │                         │
│              │  (per rep, per  │                         │
│              │   brand)        │                         │
│              └────────┬────────┘                         │
│                       │                                   │
│            ┌──────────┼──────────┐                       │
│            ▼          ▼          ▼                        │
│       Google      WhatsApp    Email                      │
│       Sheet       Summary     to you                     │
│       Dashboard   to reps     (mgmt view)                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Team Roster (Current State)

| Role | Spa | Aesthetics | Slimming |
|------|-----|-----------|----------|
| SDR (outbound/reactivation) | Juli | Anni | Dorienne |
| Inbound (calls/live chat) | Nicci | Rana | Dorienne/Adeel |
| CRM (WA/Email/Meta/Comments) | Abid + Nathalia | Rana | Adeel |
| Dials/Reminders | Mannan (cross-brand) | | |

Weekly rotation schedule applies — agents cross-reference the Roster tab to know which rep covers which brand on which day.

## Channels (10)

1. Outbound calls
2. CRM messages
3. Reactivations
4. Inbound calls
5. Live chat (Zoho SalesIQ)
6. WhatsApp
7. Email
8. Meta DMs (Instagram + Facebook)
9. Social comments
10. Appointment reminders / Dials

## Outreach Types (11 per brand)

1. New leads (Consult)
2. New leads (Offer)
3. Missed chats follow-ups
4. No-Shows & Cancellations Recovery
5. Booking follow-ups
6. Consultation follow-ups
7. Appointment confirmation + upsell
8. Post-treatment check + referral
9. Abandoned carts
10. Re-engage older leads (4-6 months)
11. New follower outreach (DM only)
12. Company collab outreach (Email only)

## The Three Sub-Agents

### Agent 1: CRM Process Agent

**Purpose:** "Did the rep follow the process?"

**Analyzes:**
- **Speed to lead** — Time from first inbound message to rep's first response (target: <5 min)
- **Follow-up compliance** — Did the rep follow up on open leads? Which dial type should have been used?
- **Pipeline hygiene** — Did the conversation end with a clear next step (booked, follow-up scheduled, disqualified) or die silently?
- **Roster adherence** — Was the assigned rep actually covering their brand/channel per the roster?
- **Missed opportunities** — Leads with no response, or first reply but no follow-up within 24h

**Output per conversation:**
```
Thread: Maria C. → Slimming WhatsApp → Adeel (Tue Apr 8)
Response time: 47 min ⚠️ (target: <5 min)
Follow-up sent: No ❌ (lead went cold after initial reply)
Dial type match: Should have been "New lead (Offer)" — script not followed
Pipeline status: DEAD — no booking, no follow-up scheduled
```

### Agent 2: Sales Coaching Agent

**Purpose:** "Did the rep sell effectively?"

**Analyzes:**
- **Script adherence** — Scores each conversation against the brand's call/message script step by step (Greet → Confirm interest → Ask WHY → Explain value → Anchor perceived value before price → Book → Get deposit → Confirm → Close)
- **Objection handling** — When leads push back (price, timing, "I'll think about it"), how did the rep respond?
- **Closing technique** — Did the rep actually ask for the booking?
- **Tone & persuasion** — Message length, urgency creation, personalization vs robotic copy-paste
- **Top performer comparison** — What do high-converting reps do differently in their message patterns?

**Output per conversation:**
```
Thread: Julia K. → Aesthetics Meta DM → Rana (Mon Apr 7)
Script score: 8/10 — skipped Step 3 (Ask WHY)
Closing: ✅ Asked for booking at right moment
Strength: Excellent perceived value anchoring ("normally €350, yours for €199")
Improve: Jumped to booking without exploring concerns — 
         add "What specific concerns have you noticed?" before pitching
```

### Agent 3: Brand Domain Agent

**Purpose:** "Was the brand represented correctly?"

**Analyzes:**
- **Brand voice compliance** — Spa = peaceful/soothing (Sarah persona), Aesthetics = warm/confident (Sarah persona), Slimming = compassionate/shame-free (Katya persona)
- **Factual accuracy** — Correct pricing, current offers, right location details, correct opening hours
- **Treatment knowledge** — Did the rep explain treatments correctly? Could they answer questions?
- **Offer deployment** — Is the rep pitching the current active offer or using outdated packages?
- **Upsell/cross-sell intelligence** — Did the rep miss a natural upsell opportunity?

**Output per conversation:**
```
Thread: Anna M. → Spa WhatsApp → Abid (Wed Apr 9)
Brand voice: ⚠️ Too transactional — missing the "Beyond the Spa" warmth
Factual: ❌ Quoted €45 for aromatherapy — current price is €55
Offer: ✅ Correctly pitched the April spa package
Missed upsell: Could have suggested the couples add-on (Anna mentioned "anniversary")
```

## Data Sources & Integrations

| Source | Integration | Status |
|--------|-----------|--------|
| WhatsApp | WhatsApp MCP (existing) | Ready |
| Meta DMs | Meta Ads MCP (existing) | Ready |
| Zoho SalesIQ (Live Chat) | Zoho SalesIQ API | Needs integration |
| Arkafort (Call Recordings) | Arkafort Cloud PBX API → Whisper transcription | Needs investigation + build |
| CRM Master Sheet | Google Sheets MCP (existing) | Ready |

### Data Pipeline Flow

1. **6:00 AM** — Orchestrator wakes up, pulls all of yesterday's conversations across all channels
2. **6:01-6:10** — Conversations organized by rep and brand, call recordings transcribed
3. **6:10-6:30** — Three sub-agents analyze in parallel, each producing their assessment
4. **6:30-6:40** — Orchestrator merges three assessments into one coherent report per rep
5. **6:40-6:45** — Reports delivered to all three output channels

## Reference Data (Gold Standard)

The agents score conversations against these sources:

| Reference | Source | Used By |
|-----------|--------|---------|
| Call scripts (per brand) | CRM Master Sheet — Scripts tabs (Aes, Spa, Slm) | Sales Coaching Agent |
| Dial templates (11 types) | CRM Master Sheet — Aes/Spa/Slm dial sections | Sales Coaching Agent |
| Brand voice guides | `config/brand-voice/spa.md`, `aesthetics.md`, `slimming.md` | Brand Domain Agent |
| Knowledge bases | `CRM/CRM-SPA/knowledge/`, `CRM/CRM-AES/knowledge/`, `CRM/CRM-SLIM/knowledge/` | Brand Domain Agent |
| Current offers & pricing | CRM Master Sheet — Offers + Packages tabs | Brand Domain Agent |
| Roster schedule | CRM Master Sheet — Roster tab | CRM Process Agent |
| Response time benchmarks | Configured thresholds (default: <5 min first response) | CRM Process Agent |

**Self-updating:** Agents read the CRM Master Sheet and knowledge base files fresh every morning. Update the sheet or knowledge files → agents use the new version automatically. No code changes needed.

## Daily Outputs

### Output 1: Per-Rep WhatsApp Summary

Sent to each rep's WhatsApp before their shift starts. Short, actionable coaching.

```
☀️ Good morning Rana — here's your Apr 10 review

📊 Yesterday: 14 conversations, 4 bookings (29% conversion)
⏱️ Avg response time: 3 min ✅

🏆 Top win: Your thread with Julia K. — perfect value anchoring 
   before price. She booked within 8 messages.

📈 3 things to improve today:
1. You skipped "Ask WHY" in 6/14 threads — leads who get asked 
   their goals convert 2x higher
2. Thread with Marco R. died after he said "I'll think about it" 
   — try the booking follow-up script instead of going silent
3. Quoted old pricing (€250) for Snatch package — current is €199

💡 Tip: When a lead says "I'll think about it", respond with 
   "Totally understand — would it help if I check what times 
   are available this week so you have options?" 
   This converted 3x better across the team last week.
```

### Output 2: Google Sheets Management Dashboard

**Tab 1 — Team Overview:**
| Rep | Brand | Conversations | Bookings | Conv % | Avg Response Time | Script Score | Trend |
|-----|-------|--------------|----------|--------|-------------------|-------------|-------|
| Rana | Aes | 14 | 4 | 29% | 3 min | 8.1/10 | ↑ |
| Adeel | Slm | 11 | 2 | 18% | 12 min | 6.4/10 | ↓ |
| Abid | Spa | 9 | 3 | 33% | 2 min | 7.8/10 | → |

**Tab 2 — Conversation Log:** Every conversation scored, linked, filterable by rep/brand/score/outcome.

**Tab 3 — Trends:** Weekly rolling averages. Rep improvement tracking. Most-skipped script steps. Most common objections and how they're handled.

### Output 3: Manager Email

Daily email to management with:
- **Top 3 wins** — best conversations, what made them work
- **Top 3 red flags** — worst drops, biggest missed opportunities
- **Team conversion rate** — yesterday vs 7-day avg vs 30-day avg
- **One strategic insight** — pattern the agents spotted (e.g., "Slimming leads who mention GLP-1 convert at 45% when acknowledged — only 2/7 reps do this")

## Conversion Metric

**Conversion = booking secured via chat/message channel.** A conversation counts as converted when the rep secures a confirmed appointment booking with the lead.

## Key Design Decisions

1. **Daily batch, not real-time** — Reduces complexity, avoids alert fatigue, gives agents full conversation context
2. **Three specialized agents, not one generalist** — Each lens (process, sales technique, brand accuracy) requires different expertise and reference data
3. **Sheet-as-config** — CRM Master Sheet is the single source of truth for scripts and offers, avoiding config drift
4. **WhatsApp delivery to reps** — Meets reps where they already are, no new tools to learn
5. **Parallel analysis** — Three agents run simultaneously for speed, orchestrator merges results

## Future Enhancements (Not in Scope)

- Real-time mid-conversation coaching nudges
- Automated lead routing based on rep strengths
- Call recording sentiment analysis
- Predictive lead scoring
- Automated follow-up message drafting for rep approval
