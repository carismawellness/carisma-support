# Weekly EBITDA Calculation System — Design

**Date:** 2026-03-23
**Status:** Approved
**Approach:** Knowledge-Driven Agent (WAT architecture)

---

## Overview

A skill-based system that automates the weekly EBITDA reconciliation and compilation process for Carisma Wellness Group. The agent reads raw financial data from Google Sheet input tabs, applies business logic (revenue calculation, COGS, salary allocation, SG&A allocation, rent), computes per-spa and group-level EBITDA, runs reconciliation checks, and writes results to output tabs.

## Business Units

- **Spa** — 8 locations: InterContinental, Hugos, Hyatt, Ramla, Labranda, Sunny Coast, Excelsior, Novotel + Corporate overhead
- **Aesthetics** — Single unit with doctor payouts, separate staff
- **Slimming** — Newly added (Feb 2026), separate P&L
- **Velvet** — Separate line item (currently dormant)

## EBITDA Formula

Per-spa: `EBITDA = Gross Profit - Salaries - SG&A - Rent`

Where:
- `Gross Profit = Revenue - COGS`
- `Revenue = Service Revenue + Product Revenue` (VAT excluded: 18% standard, 12% for doctor services)
- `COGS` = by product line (Phytomer, Purest, Others)
- `Salaries` = Payroll (bank) + Cash payments, allocated per spa by employee assignment
- `SG&A` = Allocated from central pool using configurable methods
- `Rent` = Fixed per spa per period

Group: Sum of Spa Total + Aesthetics Total + Slimming Total + Velvet Total

## Data Sources

All manual exports, pasted into Google Sheet input tabs:

| Source | Data | Format |
|--------|------|--------|
| Lapis (POS) | Revenue by spa (Service + Product) | Export → paste |
| Lapis (POS) | COGS by product line | Export → paste |
| Zoho Books | P&L per entity (Spa, Aesthetics) | Export → paste |
| Google Sheet | Payroll data (bank salaries) | Already in Sheets |
| Manual | Cash salary payments per employee | Manual entry |
| Zoho Books | SG&A detail with categories | Export → paste |
| Manual | Aesthetics doctor payouts, staff costs | Manual entry |

## Folder Structure

```
finance/Weekly EBITDA Calculation/
├── CLAUDE.md                      # Agent instructions for EBITDA workflow
├── knowledge/
│   ├── ebitda-structure.md        # Line-item definitions, hierarchy
│   ├── spa-locations.md           # Per-spa details (8 spas + corporate)
│   ├── aesthetics-slimming.md     # Aesthetics & Slimming P&L structure
│   ├── sga-allocation-rules.md    # SG&A methodology explanation
│   ├── data-sources.md            # Where each number comes from
│   ├── reconciliation-rules.md    # Checks and thresholds
│   └── velvet.md                  # Velvet EBITDA structure
├── skills/
│   ├── 00-weekly-ebitda.md        # Master orchestration
│   ├── 01-ingest-data.md          # Read raw input tabs
│   ├── 02-calculate-revenue.md    # Revenue by spa, excl VAT
│   ├── 03-calculate-cogs.md       # COGS by product line
│   ├── 04-process-salaries.md     # Payroll + cash allocation
│   ├── 05-allocate-sga.md         # SG&A split per config
│   ├── 06-calculate-ebitda.md     # Per-spa → group rollup
│   └── 07-reconcile.md            # Checks and anomaly detection
└── config/
    ├── sga-split-config.json      # Allocation methods and rules
    ├── rent-schedule.json         # Fixed rent per spa
    ├── spa-list.json              # Active spas with metadata
    └── sheet-mapping.json         # Sheet IDs, tab names, cell ranges
```

## Google Sheet Layout

### Input Tabs (user pastes raw data)

| Tab Name | Contents | Source |
|----------|----------|--------|
| `Raw - Zoho Spa P&L` | Full P&L for Carisma Spa entity | Zoho Books export |
| `Raw - Zoho Aesthetics P&L` | Full P&L for Aesthetics entity | Zoho Books export |
| `Raw - Lapis Revenue` | Revenue by spa, service vs product | Lapis export |
| `Raw - Lapis COGS` | Cost of goods sold detail | Lapis export |
| `Raw - Payroll` | Monthly payroll by employee | Payroll Sheet |
| `Raw - Cash Salaries` | Cash payments by employee + spa | Manual entry |
| `Raw - SG&A Detail` | SG&A line items with categories | Zoho Books export |
| `Raw - Aesthetics Data` | Revenue, doctor payouts, staff costs | Manual/Zoho |

### Output Tabs (agent writes results)

| Tab Name | Contents |
|----------|----------|
| `EBITDA Summary` | Group-level EBITDA by period |
| `Spa P&L` | Consolidated spa P&L |
| `Spa Detail` | Per-spa breakdowns |
| `Aesthetics P&L` | Aesthetics + Slimming P&L |
| `SG&A Allocation` | Allocation audit trail |
| `Reconciliation` | All checks with pass/fail |

## Workflow Sequence

1. **Ingest Data** — Read all `Raw -` tabs. Validate target period data exists. Flag missing/empty tabs.
2. **Calculate Revenue** — Sum Service + Product per spa. Apply VAT exclusion. Cross-ref vs Zoho totals.
3. **Calculate COGS** — By product line per spa. Compute gross profit and margin %.
4. **Process Salaries** — Combine payroll + cash. Allocate per employee → spa mapping.
5. **Allocate SG&A** — Read `sga-split-config.json`. Apply allocation methods. Write audit trail.
6. **Calculate EBITDA** — Per-spa, then roll up. Include EBITDA % and "Excluding Center" variant.
7. **Reconcile** — Revenue Check, Salaries Check, SG&A Check, Rent Check. Flag variances > threshold.
8. **Write Results** — Push to output tabs after user approval.

**Approval gate:** Agent presents summary + flagged issues before writing output.

## SG&A Allocation Config

The methodology evolves over time. Rules live in `sga-split-config.json`:

```json
{
  "period": "YYYY-MM",
  "active_spas": ["list of active spa names"],
  "allocation_methods": {
    "by_salary_ratio": { "enabled": true, "pool_amount": null },
    "by_sales_ratio": { "enabled": true, "pool_amount": null },
    "equal_split": { "enabled": true, "pool_amount": null }
  },
  "direct_allocations": {
    "SpaName": ["matched from raw data by description"]
  }
}
```

Pool amounts are read dynamically from the `Raw - SG&A Detail` tab. Direct allocations are matched by spa name in the description field. When methodology changes, update this config.

## Reconciliation Checks

| Check | Logic | Threshold |
|-------|-------|-----------|
| Revenue | Total P&L revenue vs sum of per-spa revenues | < 1.00 variance |
| Salaries | Payroll + cash total vs P&L salary line | < 1.00 variance |
| SG&A | Sum of allocated SG&A vs source total | < 1.00 variance |
| Rent | Expected fixed rent vs actual booked | Exact match |

Thresholds configurable in `reconciliation-rules.md`.

## Key Design Decisions

1. **SG&A rules are config-driven** — methodology changes don't require code changes
2. **Google Sheet as I/O surface** — no new systems; user pastes data in, agent writes results out
3. **Approval gate before writing** — agent never silently overwrites output
4. **Reconciliation is mandatory** — every run ends with checks, no skipping
5. **Follows WAT architecture** — skills define what to do, tools execute deterministically
