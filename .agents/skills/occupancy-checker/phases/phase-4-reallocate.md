# Phase 4 — Generate Budget Reallocation Proposal

## Objective
Using the crossref data, produce specific EUR-denominated budget shifts between services.

## Prerequisites
- Phase 3 complete: `.tmp/performance/occupancy-crossref.json`
- `references/decision-matrix.md` loaded (redistribution rules)
- `config/kpi_thresholds.json` loaded (CPL targets)

## Procedure

### Step 1: Calculate savings pool

For each service where action = PAUSE or REDUCE:
- PAUSE: savings = current daily_spend (entire budget freed)
- REDUCE: savings = current daily_spend - EUR 5 (keep minimum awareness)
- Total savings = sum of all freed budget

### Step 2: Rank scale opportunities

For each service where action = SCALE or MISSED OPPORTUNITY:
- Sort by: open capacity (highest avg_slots_per_day first)
- Secondary sort: CPL efficiency (lowest CPL first, if campaigns exist)
- Tertiary: new campaign opportunities last (no CPL data yet)

### Step 3: Distribute savings

Apply redistribution rules from decision-matrix.md:
1. Distribute savings proportionally to SCALE opportunities
2. Cap any single increase at 30% above current spend
3. For new campaign launches (no existing campaigns), allocate EUR 15/day starting budget
4. If total savings exceeds total scale needs, note the surplus

### Step 4: Build reallocation table

| Priority | Service | Current Spend | Proposed Spend | Change | Reason |
|----------|---------|---------------|----------------|--------|--------|
| 1 | [Service] | EUR X/day | EUR Y/day | EUR +/-Z | [Capacity verdict + data] |
| **Net** | | **EUR X** | **EUR X** | **EUR 0** | Budget-neutral reallocation |

### Step 5: Flag CEO approvals

If any single reallocation exceeds EUR 50/day change, flag:
```
CEO APPROVAL REQUIRED: [Service] budget change of EUR X/day exceeds EUR 50 threshold
```

### Step 6: Generate executive summary

```
OCCUPANCY OPTIMIZER — Executive Summary
========================================
Date: {date}
Venues scanned: {count}
Services analyzed: {count}

WASTE DETECTED: {N} services over-advertised (EUR X/day wasted)
OPPORTUNITIES: {M} services under-advertised (EUR Y/day potential)
PROPOSED SHIFT: EUR Z/day from constrained -> open services

Top 3 Actions:
1. [Highest impact action]
2. [Second highest]
3. [Third highest]
```

## Output
- Reallocation proposal (structured data for Phase 5)
- Executive summary text
- CEO approval flags (if any)
- Phase status: COMPLETE
