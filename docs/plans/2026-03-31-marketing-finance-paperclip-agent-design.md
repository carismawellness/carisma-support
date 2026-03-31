# Marketing Finance Specialist — Paperclip Agent Design

**Date:** 2026-03-31
**Status:** Approved
**Platform:** Paperclip (open-source, MIT licensed)
**Parent Agent:** CMO

---

## Overview

Move the existing Marketing Finance Specialist agent from `marketing/marketing-finance/` into the Paperclip-standard `.agents/skills/marketing-finance-specialist/` directory and register it as a Paperclip agent under the CMO. This agent handles budget allocation, spend tracking, ROAS/CPL analysis, revenue attribution, and weekly consolidated reporting across all 3 Carisma brands.

## Target File Structure

```
.agents/skills/marketing-finance-specialist/
├── SKILL.md                              # Router skill (updated paths)
├── config.json                           # Agent metadata (with Paperclip fields)
├── phases/
│   ├── phase-1-budget-allocation.md      # Wraps budget-allocation procedure
│   ├── phase-2-spend-tracking.md         # Meta Ads + Google Ads actuals
│   ├── phase-3-roas-analysis.md          # CPL/CPA/ROAS computation
│   ├── phase-4-revenue-attribution.md    # Spend vs. revenue matching
│   └── phase-5-weekly-report.md          # Consolidated CMO report
└── references/
    └── budget-allocation.md              # Reference copy of budget allocation procedure
```

## config.json — Paperclip Metadata Additions

Following the email-designer pattern, add these fields to `metadata`:

```json
{
  "metadata": {
    "agent-role": "Marketing Finance Specialist",
    "reports-to": "CMO",
    "runtime": "Claude Code",
    "org-layer": "CMO Sub-Team"
  }
}
```

## SKILL.md Path Updates

All phase file paths in the routing table change from:
- `marketing/marketing-finance/phases/phase-X-*.md`

To:
- `.agents/skills/marketing-finance-specialist/phases/phase-X-*.md`

SKILL.md frontmatter `description` field updated to follow Paperclip's routing description convention — written as decision logic ("use when...") rather than marketing copy.

## Paperclip Agent Registration

POST to `/api/companies/{companyId}/agents`:

```json
{
  "name": "marketing-finance-specialist",
  "role": "specialist",
  "title": "Marketing Finance Specialist",
  "reportsTo": "<CMO_AGENT_ID>",
  "capabilities": "Budget allocation across Spa/Aesthetics/Slimming brands and Meta/Google channels. Weekly spend tracking (actual vs. planned). ROAS/CPL analysis with winner/loser classification. Revenue attribution matching ad spend to business revenue. Weekly consolidated financial report for the CMO.",
  "adapterType": "claude_local",
  "adapterConfig": {
    "workingDirectory": "<REPO_PATH>",
    "model": "claude-sonnet-4-6",
    "skillsDirectory": ".agents/skills/marketing-finance-specialist"
  }
}
```

## Cleanup

1. Delete `marketing/marketing-finance/` directory (all content moved)
2. Update `docs/plans/2026-03-31-marketing-finance-specialist-design.md` file structure reference
3. Update `docs/plans/2026-03-31-paperclip-org-design.md` context injection table to new path

## Skills Retained (All 5 Phases)

| Phase | Trigger | Frequency | Description |
|-------|---------|-----------|-------------|
| 1. Budget Allocation | `budget` | On-demand | Per-campaign daily budgets from `config/budget-allocation.json` |
| 2. Spend Tracking | `spend` | Weekly | Meta Ads + Google Ads actuals vs. planned |
| 3. ROAS/CPL Analysis | `roas` | Weekly | Campaign performance with winner/loser classification |
| 4. Revenue Attribution | `revenue` | Weekly/Monthly | Ad spend matched to revenue data |
| 5. Weekly Report | `report` | Weekly | Consolidated CMO-ready summary |

## Existing Dependencies

| Dependency | Location | Status |
|-----------|----------|--------|
| `config/budget-allocation.json` | Repo root | Exists |
| `config/kpi_thresholds.json` | Repo root | Exists |
| `config/brands.json` | Repo root | Exists |
| Carisma Analytics sheet | Google Sheets `1q_aqO9QpCaRoqhOI0Fd41YPO7NMrRAlv5EjShmZK6RM` | Exists |
| Meta Ads MCP | `.mcp.json` | Configured |
| Google Workspace MCP | `.mcp.json` | Configured |
| Google Analytics MCP | `.mcp.json` | Configured |
