# 00 — Weekly EBITDA Master Orchestration

## Objective

Coordinate the end-to-end weekly EBITDA calculation from data ingestion through reconciliation. This skill defines the sequence, gates, and trigger for all EBITDA sub-skills.

## Trigger

User says "run weekly EBITDA", "calculate EBITDA for [month]", or "run EBITDA"

## Required Inputs

- All `Raw -` input tabs populated in the Google Sheet (see `config/sheet-mapping.json`)
- `config/sga-split-config.json` current for the target period
- `config/rent-schedule.json` current for the target period
- `config/proportional-fixed-costs.json` current with any new cost items

## Execution Sequence

```
01 (Ingest Data)
  ↓
02 (Calculate Revenue)
  ↓
03 (Calculate COGS)
  ↓
04 (Process Salaries)
  ↓
05 (Allocate SG&A + Proportional Fixed Costs)
  ↓
06 (Calculate EBITDA)  ──→  APPROVAL GATE
  ↓
07 (Reconcile + Write Output)
```

## Step-by-Step

### Step 1: Determine Target Period

Ask the user which month/period to calculate. Default to the most recent month if not specified.

### Step 2: Read Knowledge Base

Before any calculations, read:
- `knowledge/ebitda-structure.md` — formula definitions and hierarchy
- `knowledge/spa-locations.md` — spa details and account codes
- `knowledge/data-sources.md` — source context and gotchas

### Step 3: Execute Skills in Sequence

Run each skill in order. If any skill fails, STOP and report the error. Do NOT proceed to the next skill.

1. **Skill 01 — Ingest Data**: Read and validate all input tabs
2. **Skill 02 — Calculate Revenue**: Compute per-spa revenue
3. **Skill 03 — Calculate COGS**: Compute COGS and gross profit
4. **Skill 04 — Process Salaries**: Combine payroll + cash, allocate to spas
5. **Skill 05 — Allocate SG&A**: Apply allocation methods + proportional fixed costs
6. **Skill 06 — Calculate EBITDA**: Compute per-spa and group EBITDA

### Step 4: Approval Gate

After Skill 06, present summary to user:
- Per-spa EBITDA with % (format: "10,388    20%")
- Spa Total EBITDA
- EBITDA Excluding Center
- Aesthetics EBITDA
- Slimming EBITDA (if applicable)
- Velvet EBITDA
- Group Total EBITDA with %
- Month-over-month comparison if previous data exists
- Any anomalies or warnings

**WAIT for user approval before proceeding.**

### Step 5: Reconcile and Write Output

After approval:
7. **Skill 07 — Reconcile**: Run all 4 checks, write reconciliation results
8. Write all output tabs to Google Sheet

### Step 6: Report

Present final summary:
- All reconciliation checks (PASS/FAIL)
- Google Sheet updated confirmation
- Any notes or issues to document

## Error Handling

- If an input tab is missing: stop at Skill 01 and tell user which tab to populate
- If reconciliation check fails: report the specific check, variance, and suggested investigation
- If Google Sheets MCP fails: retry once, then report the error

---

## Known Issues & Learnings

> Updated when this skill encounters failures, edge cases, or better methods.
> Always check this section before executing the skill.
> Log full context in `miscellaneous/learnings/LEARNINGS.md` under Skill Learnings.

<!--
Entry format:
### [YYYY-MM-DD] — [Issue Title]
**What happened:** Brief description
**Root cause:** Why it happened
**Fix:** What was changed
**Rule:** ALWAYS/NEVER directive (also added to root CLAUDE.md if universal)
-->

_No issues logged yet._
