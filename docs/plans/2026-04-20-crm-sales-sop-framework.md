# CRM & Sales Team SOP Framework — Execution Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the most comprehensive Standard Operating Procedures document for Carisma's CRM & Sales team across all three brands (Spa, Aesthetics, Slimming), consolidating knowledge from Trello SOPs, Loom training videos, WhatsApp team conversations, the CRM Master Excel sheet, live Meta Ads campaigns, website packages, and industry best practices — into one actionable document designed to improve staff conversion rates.

**Architecture:** Multi-phase, sub-agent-driven approach. Phase 1 collects raw intelligence from 10 data sources in parallel. Phase 2 synthesizes findings per domain. Phase 3 assembles the final SOP document with QC review. Each sub-agent is given maximum context and time by operating independently on a focused scope.

**Output:** A single comprehensive SOP document saved to `03-Sales/CRM-Sales-SOP-Framework.md` with supplementary brand-specific appendices.

---

## Intelligence Already Gathered (Phase 0 — Complete)

### Trello SOP Board — 21 Cards with 16 Loom Videos

| # | Card Name | Attachment Type | URL/ID |
|---|-----------|----------------|--------|
| 1 | CRM supervisor daily tasks | None | — |
| 2 | Welcome video | Loom | `8e784e3fc93a4c6da88cfd070457996e` |
| 3 | Vision - WCWO | GAN.ai video | `video.gan.ai/qfnHhiD98vM2Ozpp` |
| 4 | Cultural pillars | Loom | `2794864120fb4acc9f5d816bfdc78078` |
| 5 | How to use CRM | Loom | `ed6d1275a7cc40958f784588bbd6b9ad` |
| 6 | Importance of lead response time | Image | (infographic) |
| 7 | Carisma AI logic for CRM | Loom | `27c41d2a90e74bcaa1727e549043075e` |
| 8 | How to manage gift card designs | Loom | `c3f4aa2c48c44f71b47de156140c37af` |
| 9 | High conversion scripts for bookings | Loom | `f102010ab1a24f0ebb36f7f02dfb940a` |
| 10 | Outbound phone call BEST PRACTICE | Loom | `bb0e66e3a2174c2aab04fab79cbccb8a` |
| 11 | Watch prank calling critique videos | Instagram | `@the.sam.patel` |
| 12 | Downsell options | Card description | (rich text — already captured) |
| 13 | Fresha training | 2x Loom | Lesson 1: `ae85fbac931242b7a7655d4a0cb37a0e`, Lesson 2: `c0d0472b0a5c4316a30dc765772a2706` |
| 14 | Carisma email system: zero inbox | Loom | `550357a294f34653992e46398c768ca2` |
| 15 | 10 Steps Consultation Protocol | Google Doc | `1eTMf5khc-e_cL8AG1XlDpT2F5k8SgLHIvm-f1Z-WpXM` |
| 16 | WhatsApp for comms | Loom | `27a555e67b904e6fa960ad7ecb84dd2a` |
| 17 | Chrome and tabs management | Loom | `c93680d7b347408598045a1a2afddb50` |
| 18 | Shortcuts & digital speed | Loom | `ac5dff32a1eb43db9e6bb8cfceab964b` |
| 19 | Daily EOD reports | Loom | `644c446668f44a1faab21a12ced712b9` |
| 20 | How to create WA message templates | Google Drive | `1cKH2-5p3pEDERW2zPIwgcWeobYwuG3f4` |
| 21 | Carisma Intelligence (AI) Overview | Loom (in desc) | `d8e0a06b18ce4f468827248f0dffeb10` |

### Card Descriptions Already Captured

**Downsell Options (Card #12):**
- Client doesn't have funds: 2-pay → membership financing → subtract treatments → skincare only → follow-up visit → follow-up call
- Client can't decide today: skincare as deposit → $100 deposit → follow-up visit → follow-up call

**10 Steps Consultation Protocol (Card #15):**
1. Greeting/Introduction → 2. Why (motivation) → 3. Where (ideal state) → 4. What (history/allergies/health) → 5. How (show B&As, recommend) → 6. Prescription (MoA 20% / benefits 80%) → 7. Inquiry ("How do you feel?") → 8. Price reveal (silent) → 9. Fast action bonus → 10. The close (urgency + book)

### CRM Master Google Sheet (ID: `1bHF_7bXic08pcyXQhq310zG6McqXD50oT0EuVkjzDdI`)

**Daily Task Matrix:**
- Columns: Task type → Spa / Aes / Slm → Squad
- Task types: Outbound calls, Apt reminders, Reactivations, Inbound calls, CRM Messages, Live chat, WhatsApp, Email, Meta DMs, Comments, Dials
- Tracked metrics: Unreplied CRM, Unread WA, Unread Emails, # New Leads, Total CRM/META Leads, Speed to Lead

**Staff (10 reps):**
- SDRs: Nicci, Anni, Dorianne, Natalia, Angela, Juliana
- Chat agents: Rana, Abid, Adeel
- Dialer: Mannan

**Rep KPIs tracked:** Sales (EUR), Dials, Bookings, Conv Rate %, Deposit %

**Weekly schedule:** Each rep assigned to specific brand each day of the week

### WhatsApp Groups Identified
- **"CRM team - Internal ⚓️"** — daily task assignments, operational issues, team coordination
- **"Carisma Wellness Group CRM"** — broader CRM team communications

### Existing CRM Automation (from Config)
- 7 workflow rules per brand (21 total): New Lead → First Contact → Follow-up 1/2/3 → Final Attempt
- Task outcomes: Connected-Booked, Connected-Interested, Connected-Not Interested, Connected-Call Back, No Answer, Voicemail Left, Wrong Number
- Lead scoring: 0-105 pts → Hot (60+) / Warm (30-59) / Nurture (<30)

### Brand Summary
| Brand | Industry | Target | CPL Target | Key Offers |
|-------|----------|--------|------------|------------|
| Carisma Spa | Hotel Spa | Women 25-65, Malta | EUR 8 | Spa Day (EUR 89), Couples (EUR 159), Gift Vouchers |
| Carisma Aesthetics | Medical Spa | Women 25-55, Malta | EUR 12 | Botox (from EUR 180), Fillers (from EUR 250) |
| Carisma Slimming | Weight Management | Women 25-55, Malta | USD 10 | Fat freeze, Muscle stim, Skin tightening, Medical weight loss |

---

## Execution Plan

### PHASE 1: Parallel Data Collection (10 Sub-Agents)

All Phase 1 agents run in parallel. Each writes its findings to a dedicated file in `.tmp/sop-research/`. No agent depends on another in this phase.

---

#### Sub-Agent 1: Trello SOP Deep-Dive Agent

**Mission:** For each of the 21 SOP cards, fetch the Loom video transcripts using Playwright, read attached Google Docs, and extract all training content into structured notes.

**Steps:**
1. For each Loom URL, navigate to `https://www.loom.com/share/{id}` using Playwright
2. Extract the video transcript (Loom shows transcripts on the page)
3. For the Google Doc (10 Steps Consultation Protocol), read via Google Workspace MCP
4. For the Google Drive file (WA message templates), download and read
5. Compile all findings into a structured document organized by card

**Output:** `.tmp/sop-research/01-trello-sop-findings.md`

**Key Loom Videos to Transcribe (16 total):**
- Welcome video, Cultural pillars, How to use CRM, Carisma AI logic, Gift card designs
- HIGH PRIORITY: High conversion scripts, Outbound phone call BEST PRACTICE
- Fresha training (Lesson 1 & 2), Email system zero inbox
- WhatsApp for comms, Chrome/tabs, Shortcuts/digital speed
- Daily EOD reports, Carisma Intelligence Overview

---

#### Sub-Agent 2: Website & Brand Research Agent

**Mission:** Browse all three brand websites using Playwright to document current services, packages, pricing, and value propositions that CRM staff need to know to sell effectively.

**Steps:**
1. Navigate to `https://www.carismaspa.com` — document all services, packages, pricing
2. Navigate to `https://www.carismaaesthetics.com` — document treatments, consultation flow
3. Navigate to `https://www.carismaslimming.com` — document programs, pricing, approach
4. Read brand voice configs: `Config/brand-voice/spa.md`, `aesthetics.md`, `slimming.md`
5. Read offers config: `Config/offers.json` (already captured above for reference)

**Output:** `.tmp/sop-research/02-brand-website-findings.md`

---

#### Sub-Agent 3: Meta Ads Active Campaigns Agent

**Mission:** Pull all active campaigns and ad creatives across all 3 Meta ad accounts to document what's currently being promised to leads so CRM staff know what messaging brought the lead in.

**Steps:**
1. Get active campaigns for Spa (`act_654279452039150`)
2. Get active campaigns for Aesthetics (`act_382359687910745`)
3. Get active campaigns for Slimming (`act_1496776195316716`)
4. For each active campaign, get ad creatives and copy
5. Map: campaign → offer → landing page → what the lead was told

**Output:** `.tmp/sop-research/03-meta-ads-findings.md`

---

#### Sub-Agent 4: WhatsApp — Internal CRM Team Agent

**Mission:** Scrape the "CRM team - Internal ⚓️" WhatsApp group to extract operational patterns, daily task assignments, common issues, escalation patterns, and team coordination insights.

**Steps:**
1. List all messages from "CRM team - Internal ⚓️" (last 90 days, paginated)
2. Search for key topics: "booking", "lead", "follow up", "script", "issue", "problem"
3. Extract: daily assignment patterns, recurring problems, best practices shared
4. Document: FAQs, common objections mentioned, escalation patterns

**Output:** `.tmp/sop-research/04-whatsapp-internal-crm.md`

---

#### Sub-Agent 5: WhatsApp — Spa/Aesthetics CRM Agent

**Mission:** Scrape the "Carisma Wellness Group CRM" WhatsApp group for spa and aesthetics CRM discussions — FAQs, customer scenarios, booking issues, team knowledge.

**Steps:**
1. List all messages from "Carisma Wellness Group CRM" (last 90 days, paginated)
2. Search for: "booking", "consultation", "price", "deposit", "no show", "cancel", "refund"
3. Extract: customer FAQ patterns, objection handling examples, process clarifications
4. Document: real-world scenarios and how they were resolved

**Output:** `.tmp/sop-research/05-whatsapp-spa-aes-crm.md`

---

#### Sub-Agent 6: WhatsApp — Slimming CRM Agent

**Mission:** Search WhatsApp for slimming-specific CRM discussions across all groups to capture slimming-specific FAQs, objections, and sales scenarios.

**Steps:**
1. Search all WhatsApp for "slimming" messages (last 90 days)
2. Search for: "weight", "fat freeze", "consultation", "slimming booking", "slimming lead"
3. Extract slimming-specific: objections, FAQs, treatment questions, pricing discussions
4. Document: unique slimming sales challenges vs spa/aesthetics

**Output:** `.tmp/sop-research/06-whatsapp-slimming-crm.md`

---

#### Sub-Agent 7: CRM Master Sheet Analysis Agent

**Mission:** Comprehensively analyze the CRM Master Google Sheet to extract all operational intelligence — staffing model, KPI benchmarks, task assignment logic, performance tracking structure.

**Steps:**
1. Read all sheets/tabs in spreadsheet `1bHF_7bXic08pcyXQhq310zG6McqXD50oT0EuVkjzDdI`
2. Document: daily task assignment matrix, who does what for which brand
3. Document: KPI targets and how performance is measured
4. Document: weekly schedule rotation logic
5. Document: lead volume patterns (842 spa leads vs 34 aesthetics vs 13 slimming)

**Output:** `.tmp/sop-research/07-crm-master-sheet-analysis.md`

---

#### Sub-Agent 8: Industry Best Practices Research Agent

**Mission:** Research best practices for sales teams in the wellness, med-spa, and weight management industries. Focus on conversion rate optimization, speed to lead, objection handling, and consultation booking.

**Steps:**
1. Web search: "med spa sales team best practices conversion rates"
2. Web search: "wellness spa CRM sales SOP framework"
3. Web search: "speed to lead statistics beauty wellness industry"
4. Web search: "consultation booking conversion optimization medspa"
5. Web search: "objection handling scripts aesthetic treatments"
6. Web search: "CRM team KPIs benchmarks beauty wellness"
7. Synthesize into actionable best practices applicable to Carisma's context

**Output:** `.tmp/sop-research/08-industry-best-practices.md`

---

#### Sub-Agent 9: Existing Workflows & Automation Agent

**Mission:** Read all existing CRM-related workflows and configs to ensure the SOP aligns with (and references) the automated systems already in place.

**Steps:**
1. Read `09-Miscellaneous/Workflows/crm_task_automation.md` (full)
2. Read `09-Miscellaneous/Workflows/lead_qualification_scoring.md` (full)
3. Read `09-Miscellaneous/Workflows/lifecycle_management.md`
4. Read `09-Miscellaneous/Workflows/auto_assign_deal_values.md`
5. Read `Config/crm_workflow_rules.json`, `Config/crm_field_ids.json`
6. Read `Config/campaign_deal_value_mapping.json`
7. Check for any existing SOPs in `03-Sales/`

**Output:** `.tmp/sop-research/09-existing-workflows-analysis.md`

---

#### Sub-Agent 10: Trello Board — Non-SOP Lists Agent

**Mission:** Pull knowledge from the other 12 Trello lists (Aesthetics, Telephone, Services/Packages, Sales Tips, CRM, Lapis Booking, Chat, Gift Cards, Trello, Email, Airbnb, General) to capture operational knowledge not in the SOP list.

**Steps:**
1. For each non-SOP list, get all cards
2. Read card descriptions and attachments for key cards
3. Focus on: sales tips, CRM usage, booking processes, service knowledge
4. Extract any training materials or reference documents

**Output:** `.tmp/sop-research/10-trello-non-sop-knowledge.md`

---

### PHASE 2: Synthesis (3 Synthesizer Agents)

Phase 2 starts after all Phase 1 agents complete. Three synthesizer agents each take a domain and produce a structured draft section.

---

#### Synthesizer A: Sales Process & Conversion SOP

**Inputs:** Files 01 (Trello SOPs), 03 (Meta Ads), 08 (Best Practices), 10 (Non-SOP Trello)

**Produces:**
- Lead lifecycle from ad click to booking confirmation
- Speed-to-lead protocols (what to do in first 5 min, 1 hr, 4 hr)
- Outbound calling scripts and frameworks
- Consultation protocol (10-step + downsell ladder)
- Objection handling playbook
- Follow-up cadence and escalation rules

**Output:** `.tmp/sop-synthesis/A-sales-process-conversion.md`

---

#### Synthesizer B: Operations, Tools & Daily Workflow SOP

**Inputs:** Files 01 (Trello SOPs), 07 (CRM Sheet), 09 (Existing Workflows), 10 (Non-SOP Trello)

**Produces:**
- Daily start-of-day checklist
- CRM usage guide (Zoho Deals, Tasks, Pipelines)
- Task assignment matrix and rotation logic
- Tool guides: Fresha, Lapis, WhatsApp, Email, SalesIQ, Meta DMs
- EOD reporting procedures
- CRM supervisor daily tasks
- Digital efficiency (Chrome, shortcuts, tabs)

**Output:** `.tmp/sop-synthesis/B-operations-tools-workflow.md`

---

#### Synthesizer C: Brand Knowledge & Customer Intelligence SOP

**Inputs:** Files 02 (Websites), 04-06 (WhatsApp x3), 03 (Meta Ads)

**Produces:**
- Brand-by-brand product/service encyclopedia
- Pricing and package details for each brand
- FAQs and common customer questions (from WhatsApp)
- Brand voice guidelines for customer communication
- Common objections by brand and how to handle them
- Gift card and voucher processes

**Output:** `.tmp/sop-synthesis/C-brand-knowledge-customer-intel.md`

---

### PHASE 3: Final Assembly & QC (1 QC Agent)

---

#### QC Agent: Final SOP Assembly

**Inputs:** All 3 synthesis documents + original 10 research documents for fact-checking

**Steps:**
1. Merge A + B + C into a single cohesive SOP document
2. Organize into clear chapters with table of contents
3. Add quick-reference cards for daily use
4. Cross-check all scripts/procedures against source materials
5. Ensure brand-specific variations are clearly marked
6. Add role-specific sections (SDR vs Chat Agent vs Dialer vs Supervisor)
7. Create appendices: brand product catalogs, script templates, checklist PDFs
8. Final proofread for clarity, actionability, and completeness

**Output:** `03-Sales/CRM-Sales-SOP-Framework.md`

---

## Proposed Final SOP Structure

```
CRM & Sales Team Standard Operating Procedures
================================================

PART 1: CULTURE & VISION
  1.1  Our Mission (WCWO — Why Carisma, Why Others)
  1.2  Cultural Pillars
  1.3  What Success Looks Like

PART 2: YOUR DAILY WORKFLOW
  2.1  Start-of-Day Checklist
  2.2  Daily Task Assignment Matrix (by brand & role)
  2.3  Priority Order: What to Do First
  2.4  End-of-Day Reporting
  2.5  Weekly Schedule & Rotation

PART 3: THE SALES PROCESS
  3.1  Lead Lifecycle (Ad → CRM → Contact → Consult → Book → Confirm)
  3.2  Speed to Lead — The Golden Rules
  3.3  First Contact Protocol
  3.4  The 10-Step Consultation Framework
  3.5  Outbound Calling Best Practices
  3.6  Follow-Up Cadence (Day 0 → Day 1 → Day 3 → Day 5 → Day 8)
  3.7  The Downsell Ladder
  3.8  Objection Handling Playbook
  3.9  Closing Techniques

PART 4: COMMUNICATION CHANNELS
  4.1  Phone Calls (Inbound & Outbound)
  4.2  WhatsApp Messaging
  4.3  Email Communication
  4.4  Live Chat (SalesIQ & Meta)
  4.5  Meta DMs & Comments
  4.6  Message Templates & Automations

PART 5: TOOLS & SYSTEMS
  5.1  Zoho CRM — Deals, Tasks, Pipelines
  5.2  Fresha — Booking & Confirmation
  5.3  Lapis — Booking System
  5.4  Figma — Gift Card Designs
  5.5  Chrome & Digital Efficiency
  5.6  Carisma AI — What It Does & How It Helps

PART 6: BRAND KNOWLEDGE
  6.1  Carisma Spa — Services, Packages, Pricing, Voice
  6.2  Carisma Aesthetics — Treatments, Consultation Flow, Voice
  6.3  Carisma Slimming — Programs, Approach, Voice
  6.4  Active Campaigns & What Leads Were Told
  6.5  Gift Cards & Vouchers

PART 7: FAQS & CUSTOMER SCENARIOS
  7.1  Spa — Common Questions & Answers
  7.2  Aesthetics — Common Questions & Answers
  7.3  Slimming — Common Questions & Answers
  7.4  Difficult Customer Scenarios

PART 8: KPIs & PERFORMANCE
  8.1  What Gets Measured
  8.2  Targets by Role (SDR / Chat / Dialer)
  8.3  Lead Scoring (Hot / Warm / Nurture)
  8.4  Conversion Rate Benchmarks
  8.5  How Your Performance Is Reviewed

PART 9: CRM SUPERVISOR GUIDE
  9.1  Daily Supervisor Checklist
  9.2  Task Assignment Logic
  9.3  Escalation Procedures
  9.4  Team Coaching Notes

APPENDICES
  A. Quick-Reference Script Cards
  B. Objection Response Templates
  C. Brand Product Catalog (Complete)
  D. CRM Field Reference
  E. Automation Rules Reference
```

---

## Execution Timeline

| Phase | Duration | Agents | Dependency |
|-------|----------|--------|------------|
| Phase 1 | ~15-20 min | 10 agents in parallel | None |
| Phase 2 | ~10-15 min | 3 synthesizers in parallel | Phase 1 complete |
| Phase 3 | ~10-15 min | 1 QC agent | Phase 2 complete |
| **Total** | **~35-50 min** | **14 agents total** | Sequential phases |

## Risk Mitigation

- **Loom transcripts may be unavailable:** Fall back to video page title + any description text
- **WhatsApp message volume:** Paginate with limits, focus on last 90 days
- **MCP disconnections:** Retry logic, cache intermediate results to `.tmp/`
- **Context limits per agent:** Each agent has a focused scope to avoid overload
- **Meta Ads MCP may be slow:** Run with generous timeout

## Decision Points for User

Before execution, confirm:
1. **Scope:** Is the proposed SOP structure above what you want? Any sections to add/remove?
2. **WhatsApp depth:** Should agents go back 90 days or further?
3. **Output format:** Single markdown file, or would you prefer a Google Doc?
4. **Other Trello boards:** Should we pull from any other Trello boards beyond this Sales CRM one?
5. **Loom fallback:** If Loom transcripts aren't accessible via browser, should we skip or flag for manual review?
