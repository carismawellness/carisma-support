# 00 - Master Orchestration

## Objective

Coordinate the entire Carisma Performance Marketing weekly cycle from research through reporting. This workflow defines the end-to-end schedule, gate dependencies, and trigger mechanisms that connect all other workflows into a single repeatable system.

## Weekly Cycle Overview

```
MONDAY AM     Research Phase        (01, 02, 03)  --> GATE 1: Research Review
MONDAY PM     Creative Strategy     (04, 05)      --> GATE 2: Script & Brief Review
TUESDAY       Production Phase      (06, 07)      --> GATE 3: Creative Review
WEDNESDAY     Publishing Phase      (08)          --> GATE 4: Campaign Review
EVERY 3 DAYS  Performance Review    (09)          --> GATE 5: Optimisation Decisions
ONGOING       Iteration             (10)          feeds back to Phase 2
FRIDAY        Weekly Report         (11)          delivered to Google Sheets
```

## Required Inputs

- `config/brands.json` -- brand definitions, CPL targets, audiences
- `config/competitors.json` -- competitor brand names and Ad Library search terms
- `config/offers.json` -- active offers per brand with landing pages
- `config/script_frameworks.json` -- script templates by format
- `.env` -- Meta API tokens, Google credentials, Creatomate API key

## Trigger Mechanism

All workflows are **human-initiated via Claude Code**. There is no autonomous scheduling. The human operator starts each phase by instructing the agent to execute the relevant workflow.

**How to trigger a phase:**
```
"Run workflow 01 for all brands"
"Execute competitor research for carisma_spa"
"Start the Monday AM research phase"
```

The agent reads the relevant workflow markdown file, executes the tools in sequence, and reports results at each gate.

---

## Phase 1: Research (Monday AM)

### Workflow 01 - Competitor Research
- **Trigger:** Human says "Run competitor research"
- **Action:** Execute `workflows/01_competitor_research.md` for each brand
- **Duration:** ~15-20 minutes per brand
- **Output:** `.tmp/research/report_competitor_{brand}_{date}.md` per competitor

### Workflow 02 - Own Ad Analysis
- **Trigger:** Runs after 01 completes (or in parallel)
- **Action:** Execute `workflows/02_own_ad_analysis.md` for each brand
- **Duration:** ~5-10 minutes per brand
- **Output:** `.tmp/performance/analysis_{brand}_{date}.json`

### Workflow 03 - Hook & Angle Mining
- **Trigger:** Runs after 01 and 02 complete (needs both outputs)
- **Action:** Execute `workflows/03_hook_angle_mining.md` for each brand
- **Duration:** ~5 minutes per brand
- **Output:** `.tmp/research/hooks_{brand}_{date}.json`

### GATE 1: Research Review
- **What human reviews:**
  - Competitor research reports for accuracy and relevance
  - Own ad classification (winner/loser/marginal) for correctness
  - Hook bank for quality and brand-appropriateness
- **Decision:** Approve to proceed to Phase 2, or flag issues for re-run
- **Blocker:** Do NOT proceed to script generation until Gate 1 is passed

---

## Phase 2: Creative Strategy (Monday PM)

### Workflow 04 - Script Generation
- **Trigger:** Human approves Gate 1 and says "Generate scripts"
- **Action:** Execute `workflows/04_script_generation.md` for each brand
- **Duration:** ~10-15 minutes per brand
- **Output:** `.tmp/scripts/script_{brand}_{offer}_{format}_{date}.json`

### Workflow 05 - Creative Briefs
- **Trigger:** Runs after 04 completes
- **Action:** Execute `workflows/05_creative_brief.md` for each approved script
- **Duration:** ~5-10 minutes per brand
- **Output:** `.tmp/briefs/brief_{ad_name}_{date}.md`

### GATE 2: Script & Brief Review
- **What human reviews:**
  - Scripts for brand voice accuracy, offer correctness, Meta policy compliance
  - Creative briefs for feasibility (can this actually be produced?)
  - Automated vs manual classification is correct
- **Decision:** Approve, request revisions, or reject specific scripts
- **Blocker:** Do NOT proceed to production until Gate 2 is passed

---

## Phase 3: Production (Tuesday)

### Workflow 06 - Video Production
- **Trigger:** Human approves Gate 2 and says "Start video production"
- **Action:** Execute `workflows/06_video_production.md`
- **Duration:** Automated renders: ~5 min each. Manual: depends on human
- **Output:** `.tmp/creatives/*.mp4`

### Workflow 07 - Static Production
- **Trigger:** Runs alongside or after 06
- **Action:** Execute `workflows/07_static_production.md`
- **Duration:** Text-only: ~2 min each. Image swaps: depends on human
- **Output:** `.tmp/creatives/*.png`

### GATE 3: Creative Review
- **What human reviews:**
  - All rendered videos for quality, branding, readability
  - All static creatives for visual accuracy
  - Manual production items completed by human
- **Decision:** Approve, request re-renders, or reject
- **Blocker:** Do NOT proceed to publishing until Gate 3 is passed

---

## Phase 4: Publishing (Wednesday)

### Workflow 08 - Campaign Publishing
- **Trigger:** Human approves Gate 3 and says "Publish campaigns"
- **Action:** Execute `workflows/08_campaign_publishing.md`
- **Duration:** ~10-15 minutes per brand
- **Output:** Campaigns created in Meta Ads Manager in PAUSED state

### GATE 4: Campaign Review
- **What human reviews:**
  - Campaign structure in Ads Manager (correct targeting, budgets, placements)
  - Ad creative previews render correctly
  - Naming conventions are correct
  - Google Sheets log is accurate
- **Decision:** Human manually activates campaigns in Ads Manager
- **Critical:** The system NEVER activates campaigns. Only the human does.

---

## Phase 5: Performance Review (Every 3 Days)

### Workflow 09 - Performance Review
- **Trigger:** Human says "Run performance review" (typically Wed, Sat, Tue)
- **Action:** Execute `workflows/09_performance_review.md`
- **Duration:** ~10 minutes per brand
- **Output:** Performance classifications + Google Sheets dashboard update

### GATE 5: Optimisation Decisions
- **What human reviews:**
  - Proposed pause recommendations (losers)
  - Proposed scale recommendations (winners)
  - Marginal ads flagged for more data
- **Decision:** Human confirms which ads to pause/scale in Ads Manager
- **Critical:** The system NEVER pauses or activates ads. Only the human does.

---

## Phase 6: Iteration (Ongoing)

### Workflow 10 - Iteration
- **Trigger:** Human says "Generate iterations for winners" after a performance review
- **Action:** Execute `workflows/10_iteration.md`
- **Duration:** ~10 minutes per winner
- **Output:** New scripts and briefs that feed back into workflows 06-08
- **Note:** This creates a loop back to Phase 3 (Production)

---

## Phase 7: Weekly Report (Friday)

### Workflow 11 - Weekly Reporting
- **Trigger:** Human says "Generate weekly report"
- **Action:** Execute `workflows/11_weekly_reporting.md`
- **Duration:** ~10 minutes
- **Output:** Google Sheets "Weekly Report" tab updated

---

## Error Handling

### Workflow Failure
If any workflow fails mid-execution:
1. Log the error with full traceback
2. Report to the human what failed and why
3. Do NOT proceed to the next phase
4. Attempt to fix and re-run if the fix is obvious
5. If the fix requires human input, stop and ask

### API Rate Limits
- Meta API: respect rate limits, implement exponential backoff in tools
- Creatomate API: check rendering credits before batch renders
- Google Sheets API: batch writes where possible

### Missing Data
If a required input file is missing:
1. Report which file is missing and what it should contain
2. Check if a previous workflow should have generated it
3. Suggest running the prerequisite workflow first

## Dependency Graph

```
01 (Competitor Research) ──┐
                           ├──> 03 (Hook Mining) ──> 04 (Scripts) ──> 05 (Briefs)
02 (Own Ad Analysis) ──────┘                              │
                                                          v
                                              06 (Video) + 07 (Static)
                                                          │
                                                          v
                                                    08 (Publishing)
                                                          │
                                                          v
                                                 09 (Performance Review)
                                                          │
                                                          v
                                                    10 (Iteration)
                                                     │         │
                                                     v         v
                                              back to 04   back to 06

11 (Weekly Report) ── runs independently every Friday
```

## Brands Covered

This cycle runs for each brand defined in `config/brands.json`:
- **Carisma Spa** (brand_id: `carisma_spa`, code: `CS`) -- CPL target: EUR 8.00
- **Carisma Aesthetics** (brand_id: `carisma_aesthetics`, code: `CA`) -- CPL target: EUR 12.00

When additional brands are added to `brands.json`, they are automatically included in the cycle.

---

## Known Issues & Learnings

> Updated when this workflow encounters failures, edge cases, or better methods.
> Always check this section before executing the workflow.
> Log full context in `miscellaneous/learnings/LEARNINGS.md` under Workflow Learnings.

<!--
Entry format:
### [YYYY-MM-DD] — [Issue Title]
**What happened:** Brief description
**Root cause:** Why it happened
**Fix:** What was changed
**Rule:** ALWAYS/NEVER directive (also added to root CLAUDE.md if universal)
-->

_No issues logged yet._
