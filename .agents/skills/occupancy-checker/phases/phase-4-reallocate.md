# Phase 4 — Generate Budget Reallocation Proposal + Dynamic Reallocation Protocol

## Objective

Using the crossref data, produce specific EUR-denominated budget shifts between services. When any location shows <60% Treatment Room Utilization (TRU), activate the full Dynamic Reallocation Protocol — not just an advisory note.

## Prerequisites

- Phase 3 complete: `.tmp/performance/occupancy-crossref.json`
- `references/decision-matrix.md` loaded (redistribution rules)
- `config/kpi_thresholds.json` loaded (CPL targets)

---

## Part A — Standard Budget Reallocation (all runs)

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

---

## Part B — Dynamic Reallocation Protocol (triggers when TRU <60%)

After completing Part A, scan every location's Treatment Room Utilization (TRU). TRU is calculated from Fresha capacity data:

```
TRU = (booked_slots / total_available_slots) * 100
```

If no location has TRU <60%, skip Part B entirely and proceed to Phase 5.

### TRU Tier Classification

| TRU Range | Tier | Label | Response Speed |
|-----------|------|-------|---------------|
| 50-60% | Tier 1 | Yellow Alert | Route within 1 hour |
| 35-50% | Tier 2 | Red Alert | Route immediately (URGENT) |
| <35% | Tier 3 | Critical Alert | Route immediately (same-day) |

---

### Tier 1 — Yellow Alert (50-60% TRU)

**Trigger condition:** Location TRU between 50% and 60% (inclusive of 50, exclusive of 60).

**Budget proposal to draft:**

- Meta spend for that brand: increase by **20%** for **72 hours**
  - Spa current: EUR 50/day → proposed: EUR 60/day
  - Aesthetics current: EUR 50/day → proposed: EUR 60/day
  - Slimming current: USD 93/day → proposed: USD 111.60/day
- Add 1 additional ad set targeting a **10km radius** of the specific low-occupancy location
- Google Ads: no mandatory change; note it as "monitor" unless CPL is elevated

**Routing:** Priority Brief to Meta Strategist + Google Ads Specialist
**Response deadline:** 4 hours

---

### Tier 2 — Red Alert (35-50% TRU)

**Trigger condition:** Location TRU between 35% and 50% (inclusive of 35, exclusive of 50).

**Budget proposal to draft:**

- Meta spend for that brand: increase by **35%** for **48 hours**
  - Spa current: EUR 50/day → proposed: EUR 67.50/day
  - Aesthetics current: EUR 50/day → proposed: EUR 67.50/day
  - Slimming current: USD 93/day → proposed: USD 125.55/day
- Activate Google Ads **demand-flex toggle** for the brand (flag explicitly in proposal)
- Google Ads spend for that brand: increase by **20%** for **48 hours**
  - Spa current: EUR 30/day → proposed: EUR 36/day
  - Aesthetics current: EUR 30/day → proposed: EUR 36/day
  - Slimming current: USD 20/day → proposed: USD 24/day
- Draft a flash offer creative brief using this angle:
  - "[X] available today at [location] — book by [time]"
  - Include the specific service(s) with open capacity
  - Include a time-based urgency hook (e.g., "Book before 6pm today")

**Routing:** URGENT to Meta Strategist + Google Ads Specialist; CC CMO
**Response deadline:** 2 hours

---

### Tier 3 — Critical Alert (<35% TRU)

**Trigger condition:** Location TRU below 35%.

**Budget proposal to draft:**

- Meta spend for that brand: increase by **50%** for **same day / 24 hours**
  - Spa: EUR 50 → EUR 75/day
  - Aesthetics: EUR 50 → EUR 75/day
  - Slimming: USD 93 → USD 139.50/day
- Google Ads spend for that brand: increase by **40%** for **same day / 24 hours**
  - Spa: EUR 30 → EUR 42/day
  - Aesthetics: EUR 30 → EUR 42/day
  - Slimming: USD 20 → USD 28/day
- Flash offer creative brief (same structure as Tier 2, maximum urgency)
- WhatsApp blast brief targeting lapsed clients who visited in the past 30 days:
  - Pull from CRM: clients with last visit > 14 days ago at the specific location
  - Message angle: "[Name], we have availability today — your usual [service] is open"
  - Include booking link and time limit

**Routing:** Same-day route to Meta Strategist + Google Ads Specialist + CMO + Email Manager (for WhatsApp blast)
**Response deadline:** Immediate — same-day implementation requested

---

### Budget Reallocation Proposal Format

For every location that triggers any Tier, draft a proposal using this exact structure. Save each proposal as a separate file:

`.tmp/performance/reallocation-brief-[brand]-[location-slug]-[date].md`

---

```
OCCUPANCY ALERT — [BRAND] — [LOCATION] — [DATE]
Alert Level: [Yellow / Red / Critical]
Current TRU: [X]%
Target TRU: 70%

Proposed Meta Budget Change:
- Current daily budget: EUR/USD [X]
- Proposed daily budget: EUR/USD [X] (+[X]%)
- Duration: [72 hours / 48 hours / immediate]
- Targeting adjustment: [specific radius or audience change]
- Suggested creative angle: [e.g., "Availability today — book now" / flash offer angle]

Proposed Google Ads Change:
- Current daily budget: EUR/USD [X]
- Proposed daily budget: EUR/USD [X] (+[X]%)
- Duration: [72 hours / 48 hours / immediate]
- Keyword focus: [e.g., "massage today Malta", "available appointment spa Malta"]
- Demand-flex toggle: [ON / already ON]

Expected Impact:
- Based on historical data: [X]% increase in booking volume expected per 20% budget increase
- Break-even occupancy uplift needed: [X] additional appointments

Action Required:
- Meta Strategist: approve and implement Meta budget change
- Google Ads Specialist: approve and implement Google budget change
- Response requested within: [2 hours for Red/Critical / 4 hours for Yellow]

Flagged by: Occupancy Checker
Data source: Fresha capacity data — [timestamp]
```

---

### Handling Multiple Alerts in One Run

If multiple locations trigger alerts in the same run:
1. Sort by severity (Critical first, then Red, then Yellow)
2. Draft a separate proposal file for each location
3. If multiple locations trigger the same brand, combine into a single brand-level brief noting each location separately
4. Do not batch proposals across different brands — each brand routes independently
5. Save a summary of all active alerts to `.tmp/performance/reallocation-alerts-[date].json`

### Alert Summary JSON Structure

```json
{
  "generated_at": "2026-03-31T10:00:00",
  "alerts": [
    {
      "brand": "carisma_spa",
      "location": "Sliema",
      "tru": 42.5,
      "tier": 2,
      "label": "Red Alert",
      "proposal_file": ".tmp/performance/reallocation-brief-spa-sliema-2026-03-31.md",
      "routed_to": ["934e4f63-5928-48c2-848a-389164a2740c", "b22a67f6-e6bb-4b22-8323-e07d1fb00345"],
      "cc": ["cmo"],
      "routing_status": "pending"
    }
  ]
}
```

---

## Output

- Standard reallocation proposal (Part A): structured data for Phase 5
- Executive summary text
- CEO approval flags (if any)
- Dynamic reallocation proposals (Part B): one `.md` file per triggered location
- Alert summary: `.tmp/performance/reallocation-alerts-[date].json`
- Phase status: COMPLETE

Phase 6 (route-and-track) picks up the alert summary JSON and executes all Paperclip message routing.
