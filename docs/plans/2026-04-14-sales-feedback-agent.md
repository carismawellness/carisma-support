# Sales Feedback Agent — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a hub-and-spoke multi-agent system that scores every SDR conversation across all channels (WhatsApp, phone, email, in-person) against a 6-dimension rubric and delivers automated per-conversation coaching feedback to reps.

**Architecture:** Hub-and-spoke with a Sales Feedback Orchestrator coordinating 6 specialized sub-agents (Brand Intelligence, Script Compliance, Sales Excellence, Domain Knowledge, Scoring & Feedback, QC Reviewer). Knowledge base built by 8 research sub-agents that extract from local brand configs, CRM Master scripts, Google hospitality program, and Slimming SOPs.

**Tech Stack:** Claude Code agent skills (markdown), Google Workspace MCP (Sheets, Docs, Drive), WhatsApp MCP, Gmail MCP

---

## Phase 1: Folder Restructure

### Task 1: Create the sales/ directory structure and move CRM contents

**Files:**
- Rename: `CRM/` → `sales/`
- Create: `sales/sales-crm/` (move existing CRM brand folders here)
- Create: `sales/sales-feedback-agent/` (full scaffold)

**Step 1: Rename CRM/ to sales/**

```bash
cd "/Users/mertgulen/Library/CloudStorage/GoogleDrive-mertgulen98@gmail.com/My Drive/Carisma Wellness Group/Carisma AI /Carisma AI"
git mv CRM sales
```

**Step 2: Create sales-crm/ and move existing brand folders into it**

```bash
cd sales
mkdir sales-crm
git mv CRM-SPA sales-crm/
git mv CRM-AES sales-crm/
git mv CRM-SLIM sales-crm/
git mv knowledge-base sales-crm/
git mv hooks sales-crm/
git mv skills sales-crm/
```

**Step 3: Update sales/CLAUDE.md**

Update the existing `CLAUDE.md` (formerly `CRM/CLAUDE.md`) to reflect the new `sales/` scope. Change title from "CRM — Customer Relationship Management" to "Sales — Sales Department". Update folder references from `CRM-SPA/` to `sales-crm/CRM-SPA/` etc. Add a new section pointing to `sales-feedback-agent/`.

**Step 4: Scaffold the sales-feedback-agent/ directory**

Create the following empty directory structure:

```
sales/sales-feedback-agent/
├── CLAUDE.md
├── README.md
├── knowledge/
│   ├── brand-intelligence/
│   ├── scripts/
│   ├── sales-excellence/
│   ├── domain/
│   └── hospitality-program/
├── skills/
├── rubric/
├── templates/
└── workflows/
```

Create each directory with `mkdir -p`. Write a placeholder `README.md` that describes the Sales Feedback Agent purpose and links to the design doc at `docs/plans/2026-04-14-sales-feedback-agent-design.md`.

**Step 5: Commit**

```bash
git add sales/
git add -A  # catch the CRM/ deletion
git commit -m "refactor: rename CRM/ to sales/, create sales-crm/ and sales-feedback-agent/ scaffold"
```

---

## Phase 2: Knowledge Ingestion (5 Research Sub-Agents in Parallel)

> **Execution note:** Tasks 2-6 are independent and MUST run as parallel sub-agents. Each agent writes to a specific subfolder of `sales/sales-feedback-agent/knowledge/`.

### Task 2: Brand Intelligence Collector (Sub-Agent 1)

**Goal:** Consolidate all brand voice, positioning, tone, and persona information into per-brand reference files that the Brand Intelligence scoring agent will use.

**Files:**
- Read: `config/brand-voice/spa.md`, `config/brand-voice/aesthetics.md`, `config/brand-voice/slimming.md`
- Read: `sales/sales-crm/CRM-SPA/knowledge/brand-voice.md`
- Read: `sales/sales-crm/CRM-AES/knowledge/brand-voice.md`
- Read: `sales/sales-crm/CRM-SLIM/knowledge/brand-voice.md`
- Read: `sales/sales-crm/CRM-SPA/CLAUDE.md` (response rules, tone reference)
- Read: `sales/sales-crm/CRM-AES/CLAUDE.md`
- Read: `sales/sales-crm/CRM-SLIM/CLAUDE.md`
- Create: `sales/sales-feedback-agent/knowledge/brand-intelligence/spa.md`
- Create: `sales/sales-feedback-agent/knowledge/brand-intelligence/aesthetics.md`
- Create: `sales/sales-feedback-agent/knowledge/brand-intelligence/slimming.md`

**Step 1: Read all brand voice sources**

Read each of the 9 files listed above. Extract:
- Brand identity (tagline, persona, signature, tone keywords)
- Brand pillars and personality traits
- Key voice phrases and language patterns
- DO / DON'T tone reference tables
- Response rules (max length, question limits, forbidden phrases)
- Sign-off conventions
- Pricing psychology approach

**Step 2: Write consolidated brand intelligence files**

For each brand, create a structured markdown file with these sections:

```markdown
# [Brand Name] — Brand Intelligence Reference

## Identity
- Tagline, persona, signature, tone

## Brand Voice Summary
- 3-5 bullet points capturing the essence

## Tone Keywords
- Exact adjectives from brand config

## Language Patterns — DO
- Phrases, structures, and approaches that are on-brand
- Include real examples from the brand voice config

## Language Patterns — DON'T
- Phrases, tones, and approaches that are off-brand
- Include the forbidden phrases and cliches list

## Response Rules
- Max sentence count, question limits, emoji policy
- Sign-off conventions

## Scoring Indicators
- What "on-brand" looks like in a sales conversation (specific signals to look for)
- What "off-brand" looks like (red flags)
```

**Step 3: Commit**

```bash
git add sales/sales-feedback-agent/knowledge/brand-intelligence/
git commit -m "feat(sales-feedback): add brand intelligence knowledge base for all 3 brands"
```

---

### Task 3: Script Extractor (Sub-Agent 2)

**Goal:** Extract all SDR scripts from the CRM Master Google Sheet and structure them into per-brand reference files.

**Files:**
- Read: Google Sheet `1bHF_7bXic08pcyXQhq310zG6McqXD50oT0EuVkjzDdI`
  - Tab " Aes " (Scripts section, sheet ID 460169408)
  - Tab "Spa " (Scripts section, sheet ID 1390192628)
  - Tab " Slm " (Scripts section, sheet ID 1788213224)
- Create: `sales/sales-feedback-agent/knowledge/scripts/aesthetics-scripts.md`
- Create: `sales/sales-feedback-agent/knowledge/scripts/spa-scripts.md`
- Create: `sales/sales-feedback-agent/knowledge/scripts/slimming-scripts.md`

**Step 1: Read all 3 script tabs from the CRM Master sheet**

Use `mcp__google-workspace__sheets_read_values` to read each tab. Read the full range (A1:Z100 to capture all rows).

The Aesthetics tab structure (others are similar):
- Rows 8-18: **Call Script** — 10 steps from greeting to close (Step, Purpose, What to Say, CRM Actions)
- Rows 22+: **Dials scripts** — WhatsApp/text templates for 11 scenarios:
  1. New leads (Consult)
  2. New leads (Offer)
  3. Missed chats follow-ups
  4. No-shows & cancellations recovery
  5. Booking follow-ups
  6. Consultation follow-ups
  7. Appointment confirmation + upsell
  8. 1 week post-procedure + rebook + referral
  9. Abandoned carts
  10. Re-engage older leads (4-6 months)
  11. Reach out to new followers (DM)
  12. Corporate collab outreach (email)

**Step 2: Structure each brand's scripts**

For each brand, create a markdown file:

```markdown
# [Brand] — SDR Scripts Reference

## Call Script (Inbound/Outbound)

### Step 1: [Purpose]
**What to say:** "[exact script text]"
**CRM Action:** [action]
**Scoring note:** [what the feedback agent should check — e.g., "Rep must confirm caller name and phone number"]

[... repeat for all steps ...]

## WhatsApp/Text Scripts by Scenario

### Scenario 1: New Leads (Consult)
**Trigger:** [when to use]
**Script:** "[exact text]"
**Key elements to check:** [list of must-hit points]

[... repeat for all scenarios ...]

## Script Compliance Checklist
- [ ] Used correct greeting with brand name
- [ ] Confirmed caller identity
- [ ] Asked about treatment history / previous experience
- [ ] Explored specific concerns
- [ ] Explained value proposition with pricing anchor
- [ ] Presented the offer with perceived value vs actual price
- [ ] Asked for the booking
- [ ] Collected deposit
- [ ] Confirmed appointment details
- [ ] Closed warmly
```

**Step 3: Commit**

```bash
git add sales/sales-feedback-agent/knowledge/scripts/
git commit -m "feat(sales-feedback): extract and structure SDR scripts from CRM Master for all 3 brands"
```

---

### Task 4: Hospitality Program Scraper (Sub-Agent 3)

**Goal:** Extract all sales training material from the Google hospitality program folder and organize into a structured sales excellence knowledge base.

**Files:**
- Read: Google Drive folder `1FKWvhE9x6hEaDpIlWBJZ6L4OQswPn0hc` and all subfolders
- Create: `sales/sales-feedback-agent/knowledge/hospitality-program/reception.md`
- Create: `sales/sales-feedback-agent/knowledge/hospitality-program/consultation.md`
- Create: `sales/sales-feedback-agent/knowledge/hospitality-program/retention.md`
- Create: `sales/sales-feedback-agent/knowledge/hospitality-program/intake-forms.md`
- Create: `sales/sales-feedback-agent/knowledge/hospitality-program/general.md`

**Step 1: List and read all files in the Google Drive folder**

The folder contains 5 subfolders and standalone docs:

**Reception/** (folder `1Gkaxz2skk895D-FFGDFsvX0DIH3c4wL5`):
- `1YJaEBo4sx3uWgNIt2FLqsOcC2yH6jsse` — Inbound Call Flow.docx
- `1P4U68vAwLs1Hsm48cKfM9jbjbE95Fq9t` — Copy of BLANK PHONE AUDIT.docx
- `1FNonJWKgGGnjDSxCpOeXTp0aQjfHrG_I` — Example Receptionist Questions to Ask.docx
- `1hnrBu05sZ7er-U7H0tGS4RYlzV_X6R4T` — BLANK PHONE AUDIT.docx
- `1PkXsNBV4Xhkf-aCN99mbZnPWDRepIdqO` — Outbound Call Flow.docx
- `1YX7LOdIYD_dlAzD1yREosvRmsl316FOX` — Daily Prospecting Tracker for Reception and Providers.docx
- `1NT1i2SQbH59NMaGxkJvoH0vXwyTT3nAj` — Weekly Reception KPI Log.docx
- `1734yIpOZcd-0SbuvcB96zecBGb_WO7nV` — Daily Reception KPI Log.docx

**Consultation/** (folder `1p7UPmS-AMnQ74stRK7tz7L4AQtXndPht`):
- `1WUP-svJ-zLNY8Jf9bpUgymtBTICeXFmj` — Objection Handling Examples.docx
- `12qjJdChx6yuTtn6eA-EU7Pt1BmZilE_M` — Fallacy vs Truth in Sales.docx
- `1U298OH61d3_vQX__yLQqGhB6_pCdRHe6` — Consultation Visual Diagram.docx
- `1lZJo0E5qM6M7LhRPGt0OzWnsjItBg6Z6` — Discovery, Qualifying, Consequence Questions.docx
- `14QuuPcfFxDD4j_7kMfKmsdWxFaYg7c2j` — Objection Handling Examples.docx
- `1Hvmb1RK5bOgp9lc7zJZdh88o0SupIhrm` — Actions for Increasing Status.docx
- `16htofIDxuPWMoQfxfYShk7VOpntVWtUH` — Focused Questions.docx
- `1W_NI2cU0Kr1JR-xXVXHFhf_QctTSAWuC` — Example Patient Consultation Worksheet.docx
- `1tcX5zcR20mrszsapWmRtxp0doL8sL6AK` — Building Unwavering Confidence.docx
- `179euh2w_19iYYAXFuSVvRhyaHqFh2FtH` — Objections in Consultation Story Framework.docx

**Retention/** (folder `1VOrstZAXqAtN7WW4k7LP8xvLd85GEqrg`):
- `1OhO3go4psvqPO9HjnUJyQ5JsxAOG4c6opTv9GrORPkk` — Astra Verbiage Swap (Google Doc)
- `1SEWs8f2XxpVW8QXSUiQ2MLtgmQJwa2Ogkt0lWRbWmy4` — Steps of Service Hospitality and Sales Guide Example (Google Doc)
- `1QuWX4ZdCf_qcz3NVMpmwfk0UlGAuXUkL` — Team Member Goals and Growth.docx
- `1AwDDBRWWoQ1ZCg_yX_nSBg3AU6JRcZk-3e9PsjhUY6w` — The Friendly Bust (Google Doc)
- `1KvQIMXyd0ZK8wQNVVbDJZw66RqEQzwokhWwIJklJ994` — The CHEF Method (Google Doc)
- `1k3YQ0qnQxZUe21dCj0YfSodSyWRDBAh-YkOfjxqzjbw` — The AOA (Google Doc)

**Standalone docs** (in root folder):
- `1D7-cIjtqmqym4iCCvi9P2GUsGa3Vgw6Wiqe_sem8Moo` — Open House Room Micro Presentation (Google Doc)
- `1kzNEwrOUtYHiFznR5cDG58lC-Axd50aZ` — Consult short form hero's journey.docx
- `1ZQYTCq_DFfOXOD_WrrA5I4LpwlpYt2Xo` — Patient Journey Checklist.docx
- `1vIAmDtF9lWkUJ3xFBCiTBMDVhlCL1YZj` — Master your mind - Dopamine Boosting Worksheet.docx
- `1fejeCJspSwkaqMIAh4EW8OvIkiee5zLl` — Patient Testimonial Emsculpt NEO short form hero's journey.docx

Use `mcp__google-workspace__drive_read_file` for Google Docs (by document ID). For .docx files, attempt to read via Drive MCP — if not readable as text, note in the output file that the content was not extractable and needs manual review.

**Step 2: Organize extracted content by topic**

For each output file, structure as:

```markdown
# Hospitality Program — [Topic]

## Source Documents
- [list of files read with IDs]

## Key Principles
- [extracted principles]

## Best Practices
- [actionable items]

## Scripts & Templates
- [any specific language or templates found]

## Scoring Relevance
- [how this material maps to the scoring rubric dimensions]
```

**Step 3: Create a sales-excellence synthesis file**

After reading all materials, create `sales/sales-feedback-agent/knowledge/sales-excellence/methodology.md` that synthesizes the best practices across all hospitality program materials into a unified sales excellence framework organized by:
1. Greeting & first impression
2. Discovery & qualification
3. Consultation & presentation
4. Objection handling
5. Closing
6. Follow-up & retention
7. Upselling & cross-selling
8. Referral generation

**Step 4: Commit**

```bash
git add sales/sales-feedback-agent/knowledge/hospitality-program/
git add sales/sales-feedback-agent/knowledge/sales-excellence/
git commit -m "feat(sales-feedback): extract hospitality program knowledge and synthesize sales excellence methodology"
```

---

### Task 5: Domain Knowledge Collector (Sub-Agent 4)

**Goal:** Consolidate all treatment knowledge, pricing, booking policies, and operational information from all 3 brand knowledge bases into structured reference files for the Domain Knowledge scoring agent.

**Files:**
- Read: All files in `sales/sales-crm/CRM-SPA/knowledge/`
- Read: All files in `sales/sales-crm/CRM-AES/knowledge/`
- Read: All files in `sales/sales-crm/CRM-SLIM/knowledge/` (excluding Slimming SOPs — handled by Task 6)
- Read: CRM Master Sheet tabs for pricing: "AES pricing" (sheet 1277435160), "Offers" (sheet 2102169363), "Packages" (sheet 1825931795), "Product List" (sheet 793743498), "Sales / Services" (sheet 2080882094), "Treatment list" (sheet 1785919881)
- Create: `sales/sales-feedback-agent/knowledge/domain/spa-operations.md`
- Create: `sales/sales-feedback-agent/knowledge/domain/aesthetics-protocols.md`
- Create: `sales/sales-feedback-agent/knowledge/domain/pricing-reference.md`

**Step 1: Read all brand knowledge files**

For each brand folder, read every `.md` and `.json` file. Key files:
- `pricing-and-menu.md` — all treatments with prices
- `booking-policy.md` — booking rules, cancellation, deposits
- `seasonal-promotions.md` — current offers
- `vouchers-and-gift-cards.md` — voucher policies
- `kb-spa.json` / `kb-aes.json` / `kb-slim.json` — structured knowledge base data

**Step 2: Read pricing/product sheets from CRM Master**

Use `mcp__google-workspace__sheets_read_values` to read:
- `AES pricing!A1:Z100`
- `Offers!A1:Z100`
- `Packages!A1:Z100`
- `Product List!A1:Z100`
- `Sales / Services!A1:Z100`
- `Treatment list!A1:Z100`

**Step 3: Write domain reference files**

For Spa and Aesthetics, create structured files:

```markdown
# [Brand] — Domain Knowledge Reference

## Treatments & Services
- [Full list with descriptions, durations, what they treat]

## Pricing
- [All prices, packages, bundles]
- [Current promotions and offers]

## Booking Policy
- [Deposit requirements, cancellation rules, rebooking process]

## Vouchers & Gift Cards
- [How they work, restrictions, expiry]

## Common Customer Questions
- [FAQ from knowledge base]

## Factual Claims Reps Must Get Right
- [List of facts that if stated incorrectly would be a scoring penalty]
- [e.g., wrong price, wrong treatment duration, incorrect claim about results]

## Upsell Opportunities Matrix
- [For each treatment: what pairs well, what to suggest next]
```

Also create a cross-brand `pricing-reference.md` with a unified pricing table from the CRM Master data.

**Step 4: Commit**

```bash
git add sales/sales-feedback-agent/knowledge/domain/
git commit -m "feat(sales-feedback): add domain knowledge for spa and aesthetics operations"
```

---

### Task 6: Slimming SOP Specialist (Sub-Agent 5)

**Goal:** Build the definitive slimming consultation knowledge base by combining the Slimming SOPs Google Doc with the existing CRM-SLIM knowledge base.

**Files:**
- Read: Google Doc `15RNYXPtvPbEYlDu_aLJ06sZgKuk47IA3AWkktP47vxs` (full document)
- Read: `sales/sales-crm/CRM-SLIM/knowledge/Slimming_Guide_vFINAL.md`
- Read: `sales/sales-crm/CRM-SLIM/knowledge/philosophy-and-structure.md`
- Read: `sales/sales-crm/CRM-SLIM/knowledge/nutrition-fundamentals.md`
- Read: `sales/sales-crm/CRM-SLIM/knowledge/meal-building-practical.md`
- Read: `sales/sales-crm/CRM-SLIM/knowledge/timing-strategy.md`
- Read: `sales/sales-crm/CRM-SLIM/knowledge/troubleshooting-faq.md`
- Read: `sales/sales-crm/CRM-SLIM/knowledge/operations-quick-reference.md`
- Read: `sales/sales-crm/CRM-SLIM/knowledge/website-knowledge-base.md`
- Read: `sales/sales-crm/CRM-SLIM/knowledge/pricing-and-menu.md`
- Read: `sales/sales-crm/CRM-SLIM/knowledge/booking-policy.md`
- Create: `sales/sales-feedback-agent/knowledge/domain/slimming-sops.md`

**Step 1: Read the full Slimming SOPs Google Doc**

Use `mcp__google-workspace__docs_read_document` with ID `15RNYXPtvPbEYlDu_aLJ06sZgKuk47IA3AWkktP47vxs`. This contains:
- Who we are & why we exist
- Medical positioning
- Core philosophy & principles
- What problem we solve
- Consultation protocols
- Treatment details
- And more

**Step 2: Read all CRM-SLIM knowledge files**

Read each file listed above to get the full picture of slimming operations, nutrition guidance, meal building, troubleshooting, and pricing.

**Step 3: Write the definitive slimming SOP reference**

```markdown
# Carisma Slimming — Consultation & Sales SOP Reference

## Medical Positioning (Critical — Reps Must Convey This)
- Doctor-led weight loss as standard
- Medical-grade assessment first
- GLP-1 only as appropriate, never standalone
- Holistic methodology

## Core Philosophy
- [From SOPs doc — principles that drive us]

## The Problem We Solve (Key Messaging for Reps)
- [What prospects are experiencing]
- [Why traditional approaches fail]
- [The gap Carisma fills]

## Consultation Flow
- [Step-by-step consultation protocol]
- [What reps should cover at each stage]
- [Questions to ask, information to gather]

## Treatment Knowledge
- [All treatments with descriptions]
- [Who each treatment is for]
- [Expected outcomes — what reps can and cannot promise]

## Nutrition & Lifestyle Guidance
- [Key principles reps should know]
- [Common questions and answers]

## Pricing & Packages
- [All pricing from CRM-SLIM knowledge]

## Critical Claims — What Reps MUST Get Right
- [Medical claims that must be accurate]
- [Results language — what's allowed vs not]
- [GLP-1 positioning — never a quick fix]

## Red Flags in Conversations
- [Things reps should NEVER say about slimming]
- [Unrealistic promises to watch for]
- [Medical claims that cross the line]

## Consultation Best Practices
- [Synthesized from SOPs + existing knowledge]
- [Compassionate truth-telling approach]
- [5 pillars: compassionate truth, gentle structure, evidence-led, shame-free, future-focused]
```

**Step 4: Commit**

```bash
git add sales/sales-feedback-agent/knowledge/domain/slimming-sops.md
git commit -m "feat(sales-feedback): add comprehensive slimming consultation SOP knowledge base"
```

---

## Phase 3: Build Operational Agent Skills, Rubric, and Templates

> **Depends on:** Phase 2 completion (knowledge base must exist before skills reference it)

### Task 7: Write the Scoring Rubric

**Files:**
- Create: `sales/sales-feedback-agent/rubric/scoring-rubric.md`
- Create: `sales/sales-feedback-agent/rubric/brand-criteria.md`
- Create: `sales/sales-feedback-agent/rubric/benchmarks.md`

**Step 1: Write the master scoring rubric**

```markdown
# Sales Feedback Agent — Scoring Rubric

## Scoring Dimensions

### 1. Script Compliance (Weight: 20%)

**What it measures:** Did the rep follow the prescribed script structure for their brand and scenario?

**Score 9-10 (Elite):**
- Hit every required script element in correct order
- Personalized the script naturally (didn't sound robotic)
- Adapted script to conversation flow while keeping all key points

**Score 7-8 (Strong):**
- Hit 80%+ of script elements
- Correct opening and closing
- Missed 1-2 non-critical elements

**Score 5-6 (Developing):**
- Hit 50-80% of script elements
- May have skipped important sections (e.g., value explanation, deposit mention)
- Structure was recognizable but incomplete

**Score 3-4 (Needs Improvement):**
- Hit less than 50% of script elements
- Missed critical steps (no value prop, no close attempt)
- Conversation felt unstructured

**Score 1-2 (Critical):**
- No recognizable script adherence
- Free-form conversation with no structure
- Critical information missing or wrong

### 2. Brand Voice & Positioning (Weight: 15%)

**What it measures:** Did the rep sound on-brand? Correct tone, terminology, value props?

**Score 9-10:** Perfect brand alignment. Tone, language, and personality match the brand guide exactly. Natural, not forced.
**Score 7-8:** Mostly on-brand. 1-2 minor tone inconsistencies.
**Score 5-6:** Generic — could be any brand. Not off-brand, but not distinctly on-brand either.
**Score 3-4:** Noticeable off-brand moments. Wrong tone, used forbidden phrases, or sounded like a different brand.
**Score 1-2:** Completely off-brand. Used cliches, AI-speak, or tone that contradicts brand guidelines.

### 3. Discovery & Needs Assessment (Weight: 20%)

**What it measures:** Quality of questions asked and understanding demonstrated.

**Score 9-10:** Asked open-ended discovery questions, explored timeline, past attempts, specific concerns, and emotional drivers. Demonstrated genuine understanding of the prospect's situation.
**Score 7-8:** Good discovery — covered main concerns and goals. Missed 1-2 deeper questions (timeline, past experience).
**Score 5-6:** Basic discovery — asked about goals but didn't go deeper. Surface-level understanding.
**Score 3-4:** Minimal discovery — jumped to pitch too fast. Asked 0-1 questions before recommending.
**Score 1-2:** No discovery. Launched straight into selling without understanding the prospect.

### 4. Objection Handling & Persuasion (Weight: 20%)

**What it measures:** How well the rep handled resistance, used evidence, and reframed objections.

**Score 9-10:** Masterful — acknowledged the concern with empathy, reframed using value (not discounts), used social proof or evidence naturally, maintained relationship warmth throughout.
**Score 7-8:** Good handling — addressed the objection directly, offered a reasonable reframe. May have missed the emotional layer.
**Score 5-6:** Adequate — acknowledged the objection but response was generic or scripted-sounding. Didn't fully resolve the concern.
**Score 3-4:** Weak — ignored the objection, repeated the pitch, or offered a discount as first response.
**Score 1-2:** Harmful — argued with the prospect, dismissed their concern, or used high-pressure tactics.

**Note:** If no objection arose in the conversation, score based on persuasion techniques used (value anchoring, social proof, urgency creation).

### 5. Close & Next Steps (Weight: 15%)

**What it measures:** Did the rep ask for the booking/sale? Create commitment?

**Score 9-10:** Clear, confident close with urgency. Set specific next step with date/time. Created commitment mechanism (deposit, calendar hold).
**Score 7-8:** Asked for the booking. Set a next step. Could have been more specific or created more urgency.
**Score 5-6:** Soft close — hinted at booking but didn't directly ask. Next step was vague ("let me know").
**Score 3-4:** No close attempt. Conversation ended without asking for the sale or setting a next step.
**Score 1-2:** Actively sabotaged the close — said "no pressure" without any follow-up mechanism, or let the prospect leave with no way to re-engage.

### 6. Follow-Up & Re-engagement (Weight: 10%)

**What it measures:** Appropriate follow-up behavior and timing.

**Score 9-10:** Timely, personalized follow-up referencing the specific conversation. Multiple touchpoints without being pushy.
**Score 7-8:** Follow-up sent within appropriate timeframe. Somewhat personalized.
**Score 5-6:** Follow-up sent but generic/templated. Or slightly late timing.
**Score 3-4:** Very late follow-up or overly generic (could have been sent to anyone).
**Score 1-2:** No follow-up at all, or follow-up was inappropriate/spammy.

**Note:** This dimension may not be scorable from a single conversation. Score as "N/A — requires multi-conversation view" if follow-up data is not available.

## Composite Score Calculation

```
Composite = (Script × 0.20) + (Brand × 0.15) + (Discovery × 0.20) + (Objection × 0.20) + (Close × 0.15) + (FollowUp × 0.10)
Final Score = Composite × 10 (out of 100)
```

## Score Interpretation

| Range | Label | Action |
|-------|-------|--------|
| 90-100 | Elite | Use as training material. Recognize the rep. |
| 75-89 | Strong | Minor coaching. Acknowledge strengths. |
| 60-74 | Developing | Targeted coaching on 2-3 dimensions. |
| 40-59 | Needs Improvement | Intensive coaching. Manager involvement. |
| 0-39 | Critical | Immediate intervention. Script retraining. |
```

**Step 2: Write brand-specific scoring criteria**

Create `brand-criteria.md` with adjustments per brand:
- **Spa:** Extra weight on tone (peaceful, soothing). Zero tolerance for AI-speak. Em-dash usage is an automatic flag. Max 2-3 sentence responses in chat.
- **Aesthetics:** Medical accuracy is critical. Must convey doctor-led positioning. Pricing psychology (3-tier framework) compliance.
- **Slimming:** Compassionate truth-telling is paramount. Must convey medical-first positioning. GLP-1 must never be positioned as standalone. Shame-free language required.

**Step 3: Write benchmarks with real examples**

Create `benchmarks.md` with 3 annotated example conversations per score tier (Elite, Strong, Developing, Needs Improvement, Critical) — 15 examples total. Use the script templates from Task 3 as the basis, showing what good vs bad execution looks like.

**Step 4: Commit**

```bash
git add sales/sales-feedback-agent/rubric/
git commit -m "feat(sales-feedback): add scoring rubric, brand criteria, and benchmark examples"
```

---

### Task 8: Write the 6 Operational Agent Skills

**Files:**
- Create: `sales/sales-feedback-agent/skills/brand-intelligence.md`
- Create: `sales/sales-feedback-agent/skills/script-compliance.md`
- Create: `sales/sales-feedback-agent/skills/sales-excellence.md`
- Create: `sales/sales-feedback-agent/skills/domain-knowledge.md`
- Create: `sales/sales-feedback-agent/skills/scoring-feedback.md`
- Create: `sales/sales-feedback-agent/skills/qc-reviewer.md`

**Step 1: Write each skill file**

Each skill follows this structure:

```markdown
---
name: [skill-name]
description: [one-line description]
---

# [Agent Name]

## Role
[What this agent does, its expertise, its perspective]

## Input
[What it receives — transcript, brand ID, conversation type, etc.]

## Knowledge Sources
[Exact file paths it must read before scoring]

## Evaluation Criteria
[Specific things to look for, check, and score]

## Output Format
[Exact structure of what it returns to the Scoring & Feedback Agent]

## Scoring Guidelines
[How to assign the 1-10 score with specific criteria]
```

**Skill 1: brand-intelligence.md**

Role: Brand voice compliance evaluator. 30 years experience in luxury brand management.
Knowledge: `knowledge/brand-intelligence/{brand}.md`
Evaluates: Tone alignment, persona consistency, forbidden phrases, language patterns, sign-off usage
Output: Brand Voice score (1-10), list of on-brand moments, list of off-brand moments with exact quotes and what should have been said instead.

**Skill 2: script-compliance.md**

Role: Script adherence auditor. Knows every script element for every brand and scenario.
Knowledge: `knowledge/scripts/{brand}-scripts.md`
Evaluates: Which script elements were hit vs missed, correct ordering, natural personalization vs robotic delivery
Output: Script Compliance score (1-10), checklist of hit/missed elements, percentage adherence.

**Skill 3: sales-excellence.md**

Role: Sales CRO expert with 30 years optimizing phone and chat conversations. Expert in consultative selling, objection handling, closing psychology, and follow-up strategy. Trained in Cialdini's influence principles, Hopkins' clarifying questions, Blount's Sales EQ, and luxury hospitality soft-close methodology.
Knowledge: `knowledge/sales-excellence/methodology.md`, `knowledge/hospitality-program/*.md`
Evaluates: Discovery quality, objection handling technique, close execution, urgency creation, follow-up appropriateness, persuasion sophistication
Output: Discovery score (1-10), Objection Handling score (1-10), Close score (1-10), Follow-Up score (1-10), expert commentary with specific coaching advice.

**Skill 4: domain-knowledge.md**

Role: Treatment and operations accuracy checker. Medical and factual claims auditor.
Knowledge: `knowledge/domain/{brand}.md`, `knowledge/domain/pricing-reference.md`
Evaluates: Factual accuracy of all claims (pricing, treatment details, results promises, medical statements), missed upsell opportunities based on prospect's stated needs
Output: Factual accuracy (pass/fail), list of inaccurate claims with corrections, list of missed upsell opportunities with reasoning.

**Skill 5: scoring-feedback.md**

Role: Scoring aggregator and coaching feedback writer. Combines all sub-agent outputs into a single actionable scorecard.
Knowledge: `rubric/scoring-rubric.md`, `rubric/brand-criteria.md`, `rubric/benchmarks.md`
Input: Outputs from agents 1-4
Process:
1. Calculate composite score using rubric weights
2. Identify top strength (highest relative score or most impactful positive moment)
3. Identify top 2 improvement areas (lowest scores or highest-impact fixes)
4. For each improvement, write a specific coaching note with a suggested script snippet
5. Format using the per-conversation report template
Output: Complete scorecard ready for QC review.

**Skill 6: qc-reviewer.md**

Role: Quality control reviewer. Ensures scoring is fair, consistent, and actionable. Catches bias, vague feedback, or harsh language.
Knowledge: `rubric/benchmarks.md` (calibration examples)
Evaluates:
- Score consistency: Are similar conversations getting similar scores?
- Feedback quality: Is each coaching note specific and actionable (not vague like "improve discovery")?
- Fairness: Is the feedback respectful and constructive? Would a rep feel coached, not attacked?
- Accuracy: Do the dimension scores align with the evidence cited?
Output: Approved scorecard (if passes QC) or revised scorecard with changes explained.

**Step 2: Commit**

```bash
git add sales/sales-feedback-agent/skills/
git commit -m "feat(sales-feedback): add 6 operational agent skills"
```

---

### Task 9: Write Feedback Templates

**Files:**
- Create: `sales/sales-feedback-agent/templates/per-conversation-report.md`
- Create: `sales/sales-feedback-agent/templates/weekly-summary.md`
- Create: `sales/sales-feedback-agent/templates/manager-dashboard.md`

**Step 1: Write per-conversation report template**

```markdown
# Per-Conversation Feedback Report Template

## Header
- Rep Name: {rep_name}
- Brand: Carisma {brand}
- Channel: {channel} (WhatsApp / Phone / Email / In-Person)
- Date: {date}
- Conversation ID: {id}
- Prospect Name: {prospect_name} (if available)
- Scenario Type: {scenario} (New Lead / Follow-Up / No-Show Recovery / Consultation / etc.)

## Overall Score
{composite_score}/100 ({score_label})

## Dimension Scores
| Dimension | Score | Weight | Weighted | Summary |
|-----------|-------|--------|----------|---------|
| Script Compliance | {score}/10 | 20% | {weighted} | {one_line_summary} |
| Brand Voice | {score}/10 | 15% | {weighted} | {one_line_summary} |
| Discovery | {score}/10 | 20% | {weighted} | {one_line_summary} |
| Objection Handling | {score}/10 | 20% | {weighted} | {one_line_summary} |
| Close & Next Steps | {score}/10 | 15% | {weighted} | {one_line_summary} |
| Follow-Up | {score}/10 | 10% | {weighted} | {one_line_summary} |

## Top Strength
{specific_positive_behavior_with_quote_from_conversation}

## Improvement Area #1
**What happened:** {specific_moment_with_quote}
**Why it matters:** {impact_on_conversion}
**What to do instead:** {specific_coaching_with_suggested_script_snippet}

## Improvement Area #2
**What happened:** {specific_moment_with_quote}
**Why it matters:** {impact_on_conversion}
**What to do instead:** {specific_coaching_with_suggested_script_snippet}

## Domain Check
{pass_or_fail_with_details}

## Brand Compliance
{pass_or_fail_with_details}
```

**Step 2: Write weekly summary template**

Template for aggregated weekly report per rep — includes: average scores across dimensions, trend vs previous week, top 3 patterns to work on, top 3 strengths to maintain, conversation count by channel.

**Step 3: Write manager dashboard template**

Template for team-wide view — includes: team average scores, individual rep rankings, dimension heatmap (which dimensions are weakest across the team), week-over-week trends, recommended team training topics.

**Step 4: Commit**

```bash
git add sales/sales-feedback-agent/templates/
git commit -m "feat(sales-feedback): add feedback report templates"
```

---

### Task 10: Write the Orchestrator CLAUDE.md and Workflows

**Files:**
- Create: `sales/sales-feedback-agent/CLAUDE.md`
- Create: `sales/sales-feedback-agent/workflows/ingest-conversation.md`
- Create: `sales/sales-feedback-agent/workflows/score-conversation.md`
- Create: `sales/sales-feedback-agent/workflows/deliver-feedback.md`

**Step 1: Write the orchestrator CLAUDE.md**

This is the master instruction file for the Sales Feedback Agent. It must:

1. Define the agent's identity: "You are the Sales Feedback Orchestrator for Carisma Wellness Group. You coordinate 6 specialized sub-agents to score every SDR conversation and deliver coaching feedback."

2. Define the orchestration flow:
   - Receive a conversation transcript
   - Auto-detect the brand (Spa/Aesthetics/Slimming) from context clues (brand name mentions, treatment names, rep name, phone number)
   - Auto-detect the channel (WhatsApp/Phone/Email/In-Person)
   - Auto-detect the scenario type (New Lead, Follow-Up, No-Show Recovery, etc.)
   - Dispatch to 4 scoring agents in parallel (brand-intelligence, script-compliance, sales-excellence, domain-knowledge)
   - Pass outputs to scoring-feedback agent
   - Pass scorecard to qc-reviewer agent
   - Deliver approved feedback via appropriate channel

3. Reference all knowledge, skills, rubric, and template paths

4. Include self-improvement loop section

**Step 2: Write ingest-conversation workflow**

How to receive and prepare conversation data:
- WhatsApp: Use WhatsApp MCP to pull conversation threads
- Email: Use Gmail MCP to read sales email threads
- Phone: Read transcripts from Google Drive or local files
- Format: Standardize all conversations into a common format before scoring

**Step 3: Write score-conversation workflow**

Step-by-step orchestration:
1. Parse the transcript
2. Detect brand, channel, scenario
3. Load relevant knowledge files for the detected brand
4. Dispatch to 4 sub-agents in parallel (using Agent tool with subagent_type)
5. Collect outputs
6. Pass to scoring-feedback skill
7. Pass to qc-reviewer skill
8. Return approved scorecard

**Step 4: Write deliver-feedback workflow**

How to send the feedback:
1. Format the scorecard using per-conversation-report template
2. Send to rep via WhatsApp (primary) or email (secondary)
3. Log the score to Google Sheet for tracking
4. If score < 60, flag for manager attention

**Step 5: Commit**

```bash
git add sales/sales-feedback-agent/CLAUDE.md
git add sales/sales-feedback-agent/workflows/
git commit -m "feat(sales-feedback): add orchestrator CLAUDE.md and operational workflows"
```

---

## Phase 4: QC Review (Sub-Agent 7)

### Task 11: QC Review of All Knowledge and Skills

**Goal:** A QC sub-agent reviews everything built in Phases 1-3 for completeness, consistency, gaps, and quality.

**Files:**
- Read: All files in `sales/sales-feedback-agent/`
- Read: Design doc at `docs/plans/2026-04-14-sales-feedback-agent-design.md`
- Create: `sales/sales-feedback-agent/QC-REPORT.md`

**Step 1: Review knowledge base completeness**

Check each knowledge file against its source:
- Does `brand-intelligence/spa.md` cover everything in `config/brand-voice/spa.md`?
- Do the script files cover ALL scenarios from the CRM Master sheet?
- Does the hospitality program extraction capture all key documents?
- Does the slimming SOP cover all sections of the Google Doc?
- Is the domain knowledge accurate against CRM knowledge bases?

**Step 2: Review skills quality**

For each of the 6 skills:
- Are the evaluation criteria specific enough to produce consistent scores?
- Is the output format well-defined?
- Are the knowledge source paths correct?
- Would a different agent reading this skill produce the same type of output?

**Step 3: Review rubric calibration**

- Are the score level descriptions (Elite/Strong/Developing/etc.) distinct enough?
- Are the benchmark examples realistic and correctly scored?
- Do the brand-specific criteria make sense?

**Step 4: Review template completeness**

- Does the per-conversation report template have all required fields?
- Is the format suitable for WhatsApp delivery (character limits, readability)?

**Step 5: Write QC report**

```markdown
# Sales Feedback Agent — QC Report

## Overall Assessment
[Pass/Needs Work]

## Knowledge Base Review
| File | Completeness | Accuracy | Issues |
|------|-------------|----------|--------|
| ... | ... | ... | ... |

## Skills Review
| Skill | Clarity | Specificity | Issues |
|-------|---------|-------------|--------|
| ... | ... | ... | ... |

## Rubric Review
[Findings]

## Template Review
[Findings]

## Recommendations
1. [Specific improvement with file path and what to change]
2. [...]
3. [...]
```

**Step 6: Commit**

```bash
git add sales/sales-feedback-agent/QC-REPORT.md
git commit -m "feat(sales-feedback): add QC review report"
```

---

## Phase 5: Implement QC Improvements (Sub-Agent 8)

### Task 12: Implement QC Recommendations

**Goal:** Take each recommendation from the QC report and implement it.

**Files:**
- Read: `sales/sales-feedback-agent/QC-REPORT.md`
- Modify: Various files based on QC findings

**Step 1: Read the QC report**

Parse all recommendations into a checklist.

**Step 2: Implement each recommendation**

For each item in the QC report's recommendations section:
1. Read the file that needs improvement
2. Make the specific change recommended
3. Verify the change addresses the QC finding

**Step 3: Update QC report status**

Mark each recommendation as "Implemented" in the QC report.

**Step 4: Commit**

```bash
git add -A
git commit -m "fix(sales-feedback): implement QC recommendations to improve knowledge base and skills"
```

---

## Phase 6: User QC Checkpoint

### Task 13: Present for User Review

**No files to create.** This is a human checkpoint.

Present to the user:
1. Full folder structure with file counts
2. Summary of each knowledge file (what it covers, word count, source)
3. Summary of each skill (what it evaluates, how it scores)
4. The QC report with all recommendations and their implementation status
5. Ask: "Ready to review? After your QC, we move to Phase 7: wiring up the cron jobs and connecting to all channels."

---

## Execution Summary

| Phase | Tasks | Parallel? | Depends On |
|-------|-------|-----------|------------|
| 1: Folder Restructure | Task 1 | No | — |
| 2: Knowledge Ingestion | Tasks 2-6 | YES (all 5 in parallel) | Phase 1 |
| 3: Skills & Rubric | Tasks 7-10 | Partially (7-9 parallel, 10 after) | Phase 2 |
| 4: QC Review | Task 11 | No | Phase 3 |
| 5: QC Implementation | Task 12 | No | Phase 4 |
| 6: User QC | Task 13 | No | Phase 5 |
