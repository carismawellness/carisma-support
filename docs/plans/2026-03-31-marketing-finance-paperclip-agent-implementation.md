# Marketing Finance Specialist — Paperclip Agent Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move the Marketing Finance Specialist agent to `.agents/skills/marketing-finance-specialist/` in the Paperclip-standard format and generate the platform registration payload.

**Architecture:** Move existing files from `marketing/marketing-finance/` into `.agents/skills/marketing-finance-specialist/`. Update config.json with Paperclip metadata fields. Update SKILL.md phase paths. Delete old directory. Update cross-references.

**Tech Stack:** Markdown skills, JSON config, Paperclip agent platform

---

### Task 1: Create Target Directory

**Files:**
- Create: `.agents/skills/marketing-finance-specialist/`
- Create: `.agents/skills/marketing-finance-specialist/phases/`
- Create: `.agents/skills/marketing-finance-specialist/references/`

**Step 1: Create directories**

```bash
mkdir -p ".agents/skills/marketing-finance-specialist/phases"
mkdir -p ".agents/skills/marketing-finance-specialist/references"
```

**Step 2: Verify**

```bash
ls -la ".agents/skills/marketing-finance-specialist/"
```

Expected: `phases/` and `references/` directories visible.

---

### Task 2: Move Phase Files

**Files:**
- Move: `marketing/marketing-finance/phases/phase-1-budget-allocation.md` → `.agents/skills/marketing-finance-specialist/phases/`
- Move: `marketing/marketing-finance/phases/phase-2-spend-tracking.md` → `.agents/skills/marketing-finance-specialist/phases/`
- Move: `marketing/marketing-finance/phases/phase-3-roas-analysis.md` → `.agents/skills/marketing-finance-specialist/phases/`
- Move: `marketing/marketing-finance/phases/phase-4-revenue-attribution.md` → `.agents/skills/marketing-finance-specialist/phases/`
- Move: `marketing/marketing-finance/phases/phase-5-weekly-report.md` → `.agents/skills/marketing-finance-specialist/phases/`
- Move: `marketing/marketing-finance/references/budget-allocation.md` → `.agents/skills/marketing-finance-specialist/references/`

**Step 1: Move all phase + reference files**

```bash
mv "marketing/marketing-finance/phases/phase-1-budget-allocation.md" ".agents/skills/marketing-finance-specialist/phases/"
mv "marketing/marketing-finance/phases/phase-2-spend-tracking.md" ".agents/skills/marketing-finance-specialist/phases/"
mv "marketing/marketing-finance/phases/phase-3-roas-analysis.md" ".agents/skills/marketing-finance-specialist/phases/"
mv "marketing/marketing-finance/phases/phase-4-revenue-attribution.md" ".agents/skills/marketing-finance-specialist/phases/"
mv "marketing/marketing-finance/phases/phase-5-weekly-report.md" ".agents/skills/marketing-finance-specialist/phases/"
mv "marketing/marketing-finance/references/budget-allocation.md" ".agents/skills/marketing-finance-specialist/references/"
```

**Step 2: Verify all 6 files moved**

```bash
ls ".agents/skills/marketing-finance-specialist/phases/"
ls ".agents/skills/marketing-finance-specialist/references/"
```

Expected: 5 phase files + 1 reference file.

---

### Task 3: Update and Move config.json

**Files:**
- Source: `marketing/marketing-finance/config.json`
- Target: `.agents/skills/marketing-finance-specialist/config.json`

**Step 1: Write updated config.json with Paperclip metadata**

Write to `.agents/skills/marketing-finance-specialist/config.json`:

```json
{
  "name": "marketing-finance-specialist",
  "type": "skill",
  "description": "Marketing finance specialist agent for the CMO. Handles budget allocation, spend tracking, ROAS/CPL analysis, revenue attribution, and weekly consolidated reporting across all 3 Carisma brands.",
  "version": "1.0.0",
  "author": "Carisma",
  "user-invocable": true,
  "allowed-tools": "Bash, Read, Write, Edit, Glob, Grep, Task, ToolSearch",
  "argument-hint": "<phase|all> [brand]",
  "metadata": {
    "agent-role": "Marketing Finance Specialist",
    "reports-to": "CMO",
    "runtime": "Claude Code",
    "org-layer": "CMO Sub-Team",
    "tags": ["finance", "budget", "roas", "cpl", "marketing", "analytics", "paperclip"],
    "triggers": [
      "marketing finance",
      "budget allocation",
      "spend tracking",
      "roas analysis",
      "marketing report"
    ]
  },
  "inputs": {
    "phase": {
      "type": "string",
      "enum": ["budget", "spend", "roas", "revenue", "report", "all"],
      "description": "Which phase to run. 'all' runs the full weekly cycle (phases 2-5).",
      "required": true
    },
    "brand": {
      "type": "string",
      "enum": ["spa", "aesthetics", "slimming", "all"],
      "description": "Which brand to analyse. Defaults to 'all'.",
      "required": false,
      "default": "all"
    }
  },
  "outputs": {
    "budget_table": {
      "type": "object",
      "description": "Per-campaign daily budgets by brand and channel (Phase 1)"
    },
    "spend_variance": {
      "type": "object",
      "description": "Actual vs. planned spend by brand (Phase 2)"
    },
    "performance_scorecard": {
      "type": "object",
      "description": "CPL/CPA/ROAS per campaign with winner/loser classification (Phase 3)"
    },
    "roi_analysis": {
      "type": "object",
      "description": "Revenue vs. spend by brand and campaign type (Phase 4)"
    },
    "weekly_report": {
      "type": "string",
      "description": "Consolidated CMO-ready report (Phase 5)"
    }
  },
  "execution": {
    "timeout": 300,
    "environment": "node",
    "requires_context": ["meta-ads MCP", "google-sheets MCP", "google-analytics MCP"]
  },
  "integrations": {
    "reads": [
      "config/budget-allocation.json",
      "config/kpi_thresholds.json",
      "config/brands.json"
    ],
    "mcp_servers": ["meta-ads", "google-workspace", "google-analytics"]
  }
}
```

**Step 2: Verify JSON is valid**

```bash
python3 -c "import json; j=json.load(open('.agents/skills/marketing-finance-specialist/config.json')); print(f'Role: {j[\"metadata\"][\"agent-role\"]}, Reports to: {j[\"metadata\"][\"reports-to\"]}')"
```

Expected: `Role: Marketing Finance Specialist, Reports to: CMO`

---

### Task 4: Update and Move SKILL.md

**Files:**
- Source: `marketing/marketing-finance/SKILL.md`
- Target: `.agents/skills/marketing-finance-specialist/SKILL.md`

**Step 1: Write updated SKILL.md with new paths and Paperclip routing description**

Write to `.agents/skills/marketing-finance-specialist/SKILL.md`:

```markdown
---
name: marketing-finance-specialist
description: >
  Use when allocating ad spend budgets across Carisma brands, tracking weekly
  spend vs. planned, analysing ROAS/CPL per campaign, attributing revenue to
  ad spend, or producing the weekly CMO financial report. Do NOT use for
  campaign creation or activation — this agent is advisory only.
version: "1.0.0"
user-invocable: true
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Task, ToolSearch
argument-hint: "<phase|all> [brand]"
metadata:
  author: Carisma
  agent-role: Marketing Finance Specialist
  reports-to: CMO
  runtime: Claude Code
  org-layer: CMO Sub-Team
  tags:
    - finance
    - budget
    - roas
    - cpl
    - marketing
    - analytics
    - paperclip
  triggers:
    - "marketing finance"
    - "budget allocation"
    - "spend tracking"
    - "roas analysis"
    - "marketing report"
---

# Marketing Finance Specialist — Router

This agent sits directly under the **CMO** in the Paperclip org chart. It is the financial brain of marketing — publishing budget allocations, tracking spend, analysing ROAS/CPL, attributing revenue, and producing weekly consolidated reports.

**Relationship with GM Marketing Agents:** Advisory only. This agent publishes numbers and analysis. It does NOT directly modify campaigns or instruct GM agents. The CMO routes directives based on this agent's outputs.

## How It Works

When invoked with `/marketing-finance <phase> [brand]`:

1. Parse the phase from the first argument
2. Parse the optional brand (defaults to `all`)
3. Load required config files
4. Route to the correct phase file
5. Execute the phase procedure

## Required Config Files

Load these BEFORE executing any phase:

| File | Purpose |
|------|---------|
| `config/budget-allocation.json` | Weekly budgets, channel splits, minimums, Q4 override |
| `config/kpi_thresholds.json` | CPL targets, kill thresholds, winner/loser criteria |
| `config/brands.json` | Ad account IDs, brand metadata |

## Phase Routing Table

| Argument | Phase File | What It Does |
|----------|-----------|-------------|
| `budget` | `.agents/skills/marketing-finance-specialist/phases/phase-1-budget-allocation.md` | Compute per-campaign daily budgets |
| `spend` | `.agents/skills/marketing-finance-specialist/phases/phase-2-spend-tracking.md` | Pull actuals, compare vs. planned |
| `roas` | `.agents/skills/marketing-finance-specialist/phases/phase-3-roas-analysis.md` | CPL/CPA/ROAS per campaign |
| `revenue` | `.agents/skills/marketing-finance-specialist/phases/phase-4-revenue-attribution.md` | Spend vs. revenue matching |
| `report` | `.agents/skills/marketing-finance-specialist/phases/phase-5-weekly-report.md` | Consolidated CMO report |
| `all` | Phases 2 → 3 → 4 → 5 in sequence | Full weekly cycle |

**Note:** `budget` (Phase 1) is on-demand only — run it when planning a new calendar, not as part of the weekly cycle.

## Brand Filtering

| Argument | Brands Included |
|----------|----------------|
| `spa` | Carisma Spa only (`act_654279452039150`) |
| `aesthetics` or `aes` | Carisma Aesthetics only (`act_382359687910745`) |
| `slimming` or `slim` | Carisma Slimming only (`act_1496776195316716`, **USD account**) |
| `all` (default) | All 3 brands |

## Execution

1. **Read the phase file** for the requested phase
2. **Load config files** listed above
3. **Follow the phase procedure** step by step
4. **Output results** in the format specified by each phase

## If No Phase Argument

Ask the user what they need:
- **Budget** — Allocate budgets for a new campaign calendar
- **Spend** — Check actual spend vs. planned this week
- **ROAS** — Analyse campaign performance (CPL, ROAS)
- **Revenue** — Match spend to revenue for ROI
- **Report** — Generate the full weekly CMO report
- **All** — Run the complete weekly cycle (spend → ROAS → revenue → report)

## Important Notes

- **Slimming uses USD:** Ad account `act_1496776195316716` is in USD. Budget planning is in EUR but Meta Ads data for Slimming will be in USD. Apply EUR/USD conversion when comparing.
- **EUR 5/day minimum:** No Meta campaign below EUR 5/day. Reduce campaign count rather than spreading thin.
- **Q4 override:** For Oct/Nov/Dec, budget baseline reads from 2025 spreadsheet instead of config defaults.
- **Advisory only:** This agent publishes analysis. Campaign changes flow through CMO → GMs.
```

**Step 2: Verify frontmatter**

```bash
head -5 ".agents/skills/marketing-finance-specialist/SKILL.md"
```

Expected: `---` followed by `name: marketing-finance-specialist`.

---

### Task 5: Delete Old Directory

**Files:**
- Delete: `marketing/marketing-finance/` (entire directory)

**Step 1: Verify new files exist before deleting old**

```bash
for f in \
  ".agents/skills/marketing-finance-specialist/SKILL.md" \
  ".agents/skills/marketing-finance-specialist/config.json" \
  ".agents/skills/marketing-finance-specialist/phases/phase-1-budget-allocation.md" \
  ".agents/skills/marketing-finance-specialist/phases/phase-2-spend-tracking.md" \
  ".agents/skills/marketing-finance-specialist/phases/phase-3-roas-analysis.md" \
  ".agents/skills/marketing-finance-specialist/phases/phase-4-revenue-attribution.md" \
  ".agents/skills/marketing-finance-specialist/phases/phase-5-weekly-report.md" \
  ".agents/skills/marketing-finance-specialist/references/budget-allocation.md"; do
  [ -f "$f" ] && echo "OK: $f" || echo "MISSING: $f"
done
```

Expected: All 8 files OK.

**Step 2: Delete old directory**

```bash
rm -rf "marketing/marketing-finance/"
```

**Step 3: Verify deletion**

```bash
ls "marketing/marketing-finance/" 2>&1
```

Expected: `No such file or directory`.

---

### Task 6: Update Cross-References

**Files:**
- Modify: `docs/plans/2026-03-31-paperclip-org-design.md`
- Modify: `docs/plans/2026-03-31-marketing-finance-specialist-design.md`

**Step 1: Update org design — context injection table**

In `docs/plans/2026-03-31-paperclip-org-design.md`, find the Context Injection table row for Marketing Finance Specialist (around line 367). The path reference should already point to `config/` files (not the marketing-finance directory), so verify it's correct. No change needed if it references config files directly.

**Step 2: Update the original design doc — file structure section**

In `docs/plans/2026-03-31-marketing-finance-specialist-design.md`, replace the file structure block (around lines 66-77):

Old:
```
marketing/marketing-finance/
├── SKILL.md
├── config.json
├── phases/
│   ├── phase-1-budget-allocation.md
│   ...
└── references/
    └── budget-allocation.md
```

New:
```
.agents/skills/marketing-finance-specialist/
├── SKILL.md
├── config.json
├── phases/
│   ├── phase-1-budget-allocation.md
│   ├── phase-2-spend-tracking.md
│   ├── phase-3-roas-analysis.md
│   ├── phase-4-revenue-attribution.md
│   └── phase-5-weekly-report.md
└── references/
    └── budget-allocation.md
```

Also update the "Pattern Reference" line (around line 81) from:
> Follows the **emailbabyskill pattern** (`marketing/email-marketing/emailbabyskill/`)

To:
> Follows the **Paperclip agent pattern** (`.agents/skills/email-designer/`)

---

### Task 7: Generate Paperclip Registration Payload

**Files:**
- Create: `.agents/skills/marketing-finance-specialist/paperclip-registration.json`

**Step 1: Write the registration payload**

```json
{
  "_instructions": "POST this to /api/companies/{companyId}/agents on your Paperclip instance. Replace <CMO_AGENT_ID> with the actual CMO agent ID from your Paperclip dashboard.",
  "name": "marketing-finance-specialist",
  "role": "specialist",
  "title": "Marketing Finance Specialist",
  "reportsTo": "<CMO_AGENT_ID>",
  "capabilities": "Budget allocation across Spa/Aesthetics/Slimming brands and Meta/Google channels. Weekly spend tracking (actual vs. planned). ROAS/CPL analysis with winner/loser classification. Revenue attribution matching ad spend to business revenue. Weekly consolidated financial report for the CMO.",
  "adapterType": "claude_local",
  "adapterConfig": {
    "model": "claude-sonnet-4-6",
    "skillsDirectory": ".agents/skills/marketing-finance-specialist"
  }
}
```

**Step 2: Verify JSON is valid**

```bash
python3 -c "import json; j=json.load(open('.agents/skills/marketing-finance-specialist/paperclip-registration.json')); print(f'Agent: {j[\"name\"]}, Adapter: {j[\"adapterType\"]}')"
```

Expected: `Agent: marketing-finance-specialist, Adapter: claude_local`

---

### Task 8: Commit All Changes

**Step 1: Stage all changes**

```bash
git add ".agents/skills/marketing-finance-specialist/"
git add "marketing/marketing-finance/"
git add "docs/plans/2026-03-31-marketing-finance-specialist-design.md"
git add "docs/plans/2026-03-31-marketing-finance-paperclip-agent-design.md"
git add "docs/plans/2026-03-31-marketing-finance-paperclip-agent-implementation.md"
```

**Step 2: Commit**

```bash
git commit -m "feat: move marketing-finance agent to Paperclip .agents/skills/ format

- Move all files from marketing/marketing-finance/ to .agents/skills/marketing-finance-specialist/
- Add Paperclip metadata (agent-role, reports-to, runtime, org-layer) to config.json
- Update SKILL.md description to Paperclip routing format and phase paths
- Add paperclip-registration.json payload for platform registration
- Update cross-references in design docs
- Delete old marketing/marketing-finance/ directory

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

**Step 3: Verify commit**

```bash
git log --oneline -1
git status
```

Expected: Clean working tree, commit message visible.

---

### Task 9: Final Verification

**Step 1: Verify all files exist at new location**

```bash
for f in \
  ".agents/skills/marketing-finance-specialist/SKILL.md" \
  ".agents/skills/marketing-finance-specialist/config.json" \
  ".agents/skills/marketing-finance-specialist/paperclip-registration.json" \
  ".agents/skills/marketing-finance-specialist/phases/phase-1-budget-allocation.md" \
  ".agents/skills/marketing-finance-specialist/phases/phase-2-spend-tracking.md" \
  ".agents/skills/marketing-finance-specialist/phases/phase-3-roas-analysis.md" \
  ".agents/skills/marketing-finance-specialist/phases/phase-4-revenue-attribution.md" \
  ".agents/skills/marketing-finance-specialist/phases/phase-5-weekly-report.md" \
  ".agents/skills/marketing-finance-specialist/references/budget-allocation.md"; do
  [ -f "$f" ] && echo "OK: $f" || echo "MISSING: $f"
done
```

Expected: All 9 files OK.

**Step 2: Verify old directory is gone**

```bash
ls "marketing/marketing-finance/" 2>&1
```

Expected: `No such file or directory`.

**Step 3: Verify config.json has Paperclip fields**

```bash
python3 -c "import json; j=json.load(open('.agents/skills/marketing-finance-specialist/config.json')); m=j['metadata']; print(f'Role: {m[\"agent-role\"]}, Reports to: {m[\"reports-to\"]}, Runtime: {m[\"runtime\"]}, Layer: {m[\"org-layer\"]}')"
```

Expected: `Role: Marketing Finance Specialist, Reports to: CMO, Runtime: Claude Code, Layer: CMO Sub-Team`

**Step 4: Verify SKILL.md paths point to new location**

```bash
grep "\.agents/skills/marketing-finance-specialist/phases/" ".agents/skills/marketing-finance-specialist/SKILL.md" | wc -l
```

Expected: `5` (one per phase in the routing table).

**Step 5: Verify no stale references to old path**

```bash
grep -r "marketing/marketing-finance/" docs/plans/ --include="*.md" | grep -v "paperclip-agent-implementation"
```

Expected: No matches (all references updated).
