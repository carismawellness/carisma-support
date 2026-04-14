# Sales Feedback Agent — Design Document

**Date:** 2026-04-14
**Status:** Approved
**Architecture:** Hub-and-Spoke Multi-Agent

---

## 1. Problem Statement

The SDR team across all 3 brands (Spa, Aesthetics, Slimming) has inconsistent sales quality:
- Low close rates — conversations happen but don't convert
- Off-brand messaging — reps go off-script, miss key value props
- Poor follow-up — leads go cold from lack of re-engagement
- Inconsistent quality — no standardized measurement across reps

**Solution:** An AI-powered Sales Feedback Agent that monitors all conversation channels (WhatsApp, phone, email, in-person), scores each conversation against a rubric, and delivers automated per-conversation coaching feedback directly to the rep.

---

## 2. Data Sources

| Source | Location | Content |
|--------|----------|---------|
| Brand voice configs | `config/brand-voice/spa.md`, `aesthetics.md`, `slimming.md` | Tone, persona, taglines, do's/don'ts |
| CRM brand knowledge | `CRM-SPA/knowledge/`, `CRM-AES/knowledge/`, `CRM-SLIM/knowledge/` | Pricing, menus, booking policies, vouchers, promos, operations |
| CRM Master scripts | Google Sheet `1bHF_7bXic08pcyXQhq310zG6McqXD50oT0EuVkjzDdI` — Scripts tabs (Aes, Spa, Slm) | Per-brand phone/chat scripts by conversation stage |
| Hospitality program | Google Drive folder `1FKWvhE9x6hEaDpIlWBJZ6L4OQswPn0hc` | Best-in-class sales tips, guides, training material |
| Slimming SOPs | Google Doc `15RNYXPtvPbEYlDu_aLJ06sZgKuk47IA3AWkktP47vxs` + `CRM-SLIM/knowledge/Slimming_Guide_vFINAL.md` | Medical positioning, consultation protocols, treatment knowledge |

### Conversation Channels

- **WhatsApp** — text-based, ingested via WhatsApp MCP
- **Phone calls** — mix of recorded/not recorded, transcripts where available
- **Email** — via Gmail MCP
- **In-person consultations** — logged where available
- **Other** — booking platform chat, social DMs

---

## 3. Architecture — Hub-and-Spoke

### Folder Structure

```
sales/
├── CLAUDE.md
├── README.md
├── AGENT-ONBOARDING-CHECKLIST.md
├── AGENT-WORKFLOW-SETUP.md
├── DOCUMENTATION-INDEX.md
├── QUICK-START-GUIDE.md
│
├── sales-crm/                         # Existing CRM agents (moved from CRM/)
│   ├── CRM-SPA/
│   ├── CRM-AES/
│   ├── CRM-SLIM/
│   ├── knowledge-base/
│   ├── hooks/
│   └── skills/
│
└── sales-feedback-agent/
    ├── CLAUDE.md                      # Orchestrator instructions
    ├── README.md
    │
    ├── knowledge/
    │   ├── brand-intelligence/        # Brand voice, positioning (per brand)
    │   ├── scripts/                   # Extracted scripts from CRM Master
    │   ├── sales-excellence/          # Best-in-class sales methodology
    │   ├── domain/                    # SOPs, treatment knowledge, protocols
    │   └── hospitality-program/       # Google hospitality program materials
    │
    ├── skills/
    │   ├── brand-intelligence.md      # Sub-agent 1: Brand knowledge evaluation
    │   ├── script-compliance.md       # Sub-agent 2: Script adherence scoring
    │   ├── sales-excellence.md        # Sub-agent 3: Sales CRO expert
    │   ├── domain-knowledge.md        # Sub-agent 4: Domain/SOP compliance
    │   ├── scoring-feedback.md        # Sub-agent 5: Rubric scoring & delivery
    │   └── qc-reviewer.md            # Sub-agent 6: QC all outputs
    │
    ├── rubric/
    │   ├── scoring-rubric.md          # Master rubric (categories, weights, scales)
    │   ├── brand-criteria.md          # Brand-specific scoring adjustments
    │   └── benchmarks.md             # Good/average/poor examples
    │
    ├── templates/
    │   ├── per-conversation-report.md
    │   ├── weekly-summary.md
    │   └── manager-dashboard.md
    │
    └── workflows/
        ├── ingest-conversation.md
        ├── score-conversation.md
        └── deliver-feedback.md
```

### Operational Sub-Agents

| # | Agent | Input | Knowledge Source | Output |
|---|-------|-------|-----------------|--------|
| 1 | Brand Intelligence | Transcript + brand ID | Brand voice configs | Brand Voice score (1-10) + on/off brand moments |
| 2 | Script Compliance | Transcript + brand ID | CRM Master scripts | Script score (1-10) + hit/missed checklist |
| 3 | Sales Excellence | Transcript + conversation type | Hospitality program, sales methodology | Discovery (1-10) + Objection Handling (1-10) + Close (1-10) + Follow-Up (1-10) + expert commentary |
| 4 | Domain Knowledge | Transcript + brand ID | SOPs, treatment knowledge, pricing | Factual accuracy (pass/fail) + incorrect claims + missed upsell opportunities |
| 5 | Scoring & Feedback | Outputs from agents 1-4 | Scoring rubric, benchmarks, templates | Final scorecard + top strength + top 2 improvements + suggested script snippets |
| 6 | QC Reviewer | Final scorecard | Rubric calibration examples, fairness guidelines | Approved/revised scorecard |

### Orchestration Flow

```
Conversation Ingested (WhatsApp / Email / Call Transcript)
        │
        ▼
┌─── Orchestrator (CLAUDE.md) ───┐
│  Detects brand + channel type   │
│  Routes to sub-agents in parallel│
└────────────────────────────────┘
        │
        ├──▶ Brand Intelligence Agent ──┐
        ├──▶ Script Compliance Agent ───┤
        ├──▶ Sales Excellence Agent ────┤  (parallel)
        └──▶ Domain Knowledge Agent ────┘
                                        │
                                        ▼
                              Scoring & Feedback Agent
                              (aggregates all assessments)
                                        │
                                        ▼
                                QC Reviewer Agent
                              (validates & approves)
                                        │
                                        ▼
                              Feedback delivered to rep
                              (WhatsApp / Email)
```

---

## 4. Scoring Rubric

### Dimensions

| # | Dimension | Weight | What It Measures |
|---|-----------|--------|-----------------|
| 1 | Script Compliance | 20% | Adherence to prescribed script structure, required talking points, opening/closing |
| 2 | Brand Voice & Positioning | 15% | On-brand tone, terminology, value props for specific brand |
| 3 | Discovery & Needs Assessment | 20% | Quality of questions, understanding prospect's situation/pain/goals/timeline |
| 4 | Objection Handling & Persuasion | 20% | Resistance handling, evidence use, social proof, urgency, reframing |
| 5 | Close & Next Steps | 15% | Asking for booking/sale, clear next step, commitment creation |
| 6 | Follow-Up & Re-engagement | 10% | Appropriate follow-up, re-engagement of cold leads, timing, persistence |

### Scoring Scale (1-10)

| Score | Label | Meaning |
|-------|-------|---------|
| 9-10 | Elite | Textbook execution, usable as training material |
| 7-8 | Strong | Hit most points, minor improvements |
| 5-6 | Developing | Missed key elements, clear coaching opportunities |
| 3-4 | Needs Improvement | Significant gaps, likely lost the sale |
| 1-2 | Critical | Off-brand, off-script, or damaging |

**Composite Score** = weighted average × 10 → out of 100

### Per-Conversation Feedback Output

1. Composite score (e.g., 74/100)
2. Score per dimension with 1-2 sentence explanation
3. Top strength — reinforce good behavior
4. Top 2 improvement areas — specific, actionable coaching
5. Suggested script snippet — exact phrasing for weak moments
6. Domain check — factual accuracy pass/fail
7. Brand compliance flag — pass/fail

---

## 5. Knowledge Ingestion — Research Sub-Agents

### Phase 1: Folder Structure
- **Sub-Agent 6 (Folder Structure Builder):** Creates `sales/` directory, moves `CRM/` contents into `sales/sales-crm/`, scaffolds `sales-feedback-agent/` structure

### Phase 2: Research & Extraction (parallel)

| Sub-Agent | Source | Produces |
|-----------|--------|----------|
| 1: Brand Intelligence Collector | `config/brand-voice/*.md` + brand `knowledge/brand-voice.md` files | `knowledge/brand-intelligence/spa.md`, `aesthetics.md`, `slimming.md` |
| 2: Brand Knowledge Base Collector | All `CRM-*/knowledge/` files | `knowledge/domain/spa-operations.md`, `aesthetics-protocols.md`, `slimming-sops.md` |
| 3: Hospitality Program Scraper | Google Drive folder `1FKWvhE9x6hEaDpIlWBJZ6L4OQswPn0hc` | `knowledge/hospitality-program/` organized by topic |
| 4: Script Extractor | CRM Master Sheet — Scripts tabs | `knowledge/scripts/spa-scripts.md`, `aes-scripts.md`, `slim-scripts.md` |
| 5: Slimming SOP Specialist | Google Doc `15RNYXPtvPbEYlDu_aLJ06sZgKuk47IA3AWkktP47vxs` + CRM-SLIM knowledge | Enhanced `knowledge/domain/slimming-sops.md` |

### Phase 3: QC Review
- **Sub-Agent 7:** Reviews all knowledge files for completeness, consistency, gaps, duplications. Produces QC report.

### Phase 4: Implement Improvements
- **Sub-Agent 8:** Implements QC recommendations, fills gaps, polishes all knowledge files to production-ready.

---

## 6. Feedback Delivery

### Channels
- **WhatsApp:** Direct feedback to rep via WhatsApp MCP
- **Email:** CC manager via Gmail MCP
- **Google Sheet:** Every score logged for trend analysis

### Feedback Message Format

```
📊 Sales Conversation Review — [Rep Name]
Brand: Carisma [Spa/Aesthetics/Slimming]
Channel: [WhatsApp / Phone / Email]
Date: [timestamp]

Overall Score: 74/100 (Strong)

━━━ Dimension Scores ━━━
Script Compliance:    7/10 — [explanation]
Brand Voice:          8/10 — [explanation]
Discovery:            6/10 — [explanation]
Objection Handling:   8/10 — [explanation]
Close:                7/10 — [explanation]
Follow-Up:            7/10 — [explanation]

✅ Top Strength: [specific positive behavior]
⚠️ Improve #1: [specific, actionable coaching]
⚠️ Improve #2: [specific, actionable coaching with script reference]
🏥 Domain Check: ✅ Pass / ❌ [issues]
```

---

## 7. Future Cron Integration (Phase 2)

| Cron Job | Frequency | Action |
|----------|-----------|--------|
| WhatsApp monitor | Every 2 hours | Pull new conversations, score completed ones |
| Email monitor | Every 4 hours | Pull sales email threads, score them |
| Call transcript processor | Daily | Pick up new transcripts from Drive, score |
| Weekly rep report | Monday 8am | Aggregate weekly scores per rep, send to manager |
| Monthly calibration | 1st of month | Check scoring consistency, flag rubric drift |

**Not built in Phase 1.** Built after user QCs the knowledge base and agent skills.

---

## 8. Implementation Phases

| Phase | Scope | Deliverable |
|-------|-------|-------------|
| **Phase 1** | Folder restructure + knowledge ingestion (8 research sub-agents) | `sales/` folder with complete knowledge base |
| **Phase 2** | Build operational agent skills + scoring rubric + feedback templates | 6 agent skills + rubric + templates |
| **Phase 3** | User QC checkpoint | User reviews, provides feedback |
| **Phase 4** | Wire up cron jobs + connect to all channels | Automated continuous scoring |
