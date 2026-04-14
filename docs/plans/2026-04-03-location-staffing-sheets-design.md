# Design: Per-Location Staffing Sub-Sheets
**Date:** 2026-04-03
**Status:** Approved — pending build
**Platform:** Excel (`hr/Carisma Spa Staffing Model.xlsx`)
**CEO Decision Memo:** `docs/plans/2026-04-03-location-staffing-sheets-design.md`

---

## Objective

Add 9 per-location sub-sheets to the existing Excel staffing model, each combining:
1. The non-therapist weekly reception roster (from Belt/North/Central Reception sheets)
2. The full therapist roster (from existing monthly sheets, with named staff and shift patterns)
3. Wage forecasts for all positions including rotational breakdowns
4. An annualised plan with seasonal headcount and revenue cyclicality
5. Leave reserve modelling (17% total per CEO decision)
6. A KPI dashboard with HC/Revenue flags

Plus: a **Portfolio Summary** sheet aggregating all 9 locations.

---

## Strategic Context (CEO Decisions — 3 April 2026)

### What changes vs. the current Excel model

| Change | Applies To | Detail |
|---|---|---|
| Dual-role Supervisor-Therapist | Phase 1: Riviera, Odycy, Ramla, Excelsior; Phase 2 (Month 3): all 9 | +€200/month allowance when treatment hours logged. 25hr/month cap. System trigger protocol. |
| Spa Attendants | Riviera, Inter, Hugos, Excelsior, Tigne | €950–1,100/month. Career pathway in offer letters. |
| Part-time Therapists | Riviera, Odycy (immediate); Excelsior (off-season Nov–Mar) | 16hr minimum, fixed recurring schedule, max 30% of roster |
| Leave Reserve | All 9 locations | 17% of base wages (12.5% annual leave + 4.5% sick) |
| Reduced Hours | On hold — pending 4-week hourly booking data at Hyatt and Novo | Decision framework: sub-20% occupancy after 17:30 required to trigger |

---

## Location-to-Cluster Mapping

| Location | Cluster | RM | Sheet name |
|---|---|---|---|
| Intercontinental (Inter) | A — Central | RM1 | `Inter` |
| Hugos | A — Central | RM1 | `Hugos` |
| Hyatt | A — Central | RM1 | `Hyatt` |
| Ramla | B — North | RM2 | `Ramla` |
| Riviera | B — North | RM2 | `Riviera` |
| Odycy (Sunny Coast) | B — North | RM2 | `Odycy` |
| Excelsior | C — Belt | RM3 | `Excelsior` |
| Novotel (Novo) | C — Belt | RM3 | `Novo` |
| Tigne (Sliema) | C — Belt | RM3 | `Tigne` |

---

## Per-Location Sheet Structure

Each sheet is divided into 6 sections. Colour coding follows the existing Excel conventions (navy headers, gold sub-headers, blue hardcoded inputs, black formulas).

### Row Layout (approximate — exact row numbers set per-location based on staff count)

```
Row 1:     [LOCATION NAME] — STAFFING SHEET  |  Cluster [X]  |  [Month/Year]
Row 2:     Subtitle: Revenue | Rooms | Hours | HC Target | Leave Reserve
Row 3:     (blank)

=== SECTION A: WEEKLY ROSTER ===
Row 4:     Header: SECTION A — WEEKLY RECEPTION & THERAPIST ROSTER
Row 5:     Column headers: Role | Staff | Contract | Salary | Mon | Tue | Wed | Thu | Fri | Sat | Sun | Days/Wk | Monthly Cost | Notes
Row 6+:    NON-THERAPIST STAFF (pulled from Belt/North/Central Reception)
           — RM ⅓ with rotational breakdown and salary split
           — Supervisor (with dual-role flag if applicable)
           — Advisor / Receptionist
           — RT Reception / Spa Attendant (where applicable)
           — Subtotal: Non-Therapist HC
Row N+:    THERAPIST STAFF (pulled from monthly sheets)
           — Each named therapist: T1, T2, ... with Shift A/B pattern
           — RT/Seasonal therapist rows (Apr–Oct)
           — Part-time therapist rows (where applicable)
           — Subtotal: Therapist HC
Row N+1:   TOTAL HC (formula: =Non-Therapist Subtotal + Therapist Subtotal)

=== SECTION B: WAGE FORECAST ===
Row:       Header: SECTION B — MONTHLY WAGE FORECAST
Rows:      Base wages (formula referencing Section A salary column)
           Dual-role allowance (€200/month × months dual-role active — hardcoded input per month)
           Part-time variable cost (PT therapist count × €1,100)
           Spa attendant cost (where applicable: €1,000)
           TOTAL MONTHLY HC (formula sum)
           HC% of Revenue (=Total HC / Monthly Revenue — blue input)

=== SECTION C: LEAVE RESERVE ===
Row:       Header: SECTION C — LEAVE RESERVE & TRUE HC COST
Rows:      Annual leave accrual (=Total HC × 9.58% / 12 — formula)
           Sick leave reserve (=Total HC × 4.5% / 12 — formula)
           Cover cost reserve (=Total HC × 3% / 12 — formula, for agency/cross-deploy)
           Total leave reserve (=SUM of above)
           Effective HC cost including reserve (=Total HC + Leave Reserve)
           True HC / Revenue % (=Effective HC / Monthly Revenue)
           Target HC / Revenue % (=40% — blue hardcoded input)
           Variance to target (=True HC% – Target HC% — conditional: green if ≤0, amber if ≤5%, red if >5%)

=== SECTION D: CAPACITY MODEL ===
Row:       Header: SECTION D — CAPACITY & UTILISATION
Rows:      Treatment rooms
           Operating hours
           Total shift hours/day
           Therapist FTE (current / with dual-role effective FTE)
           Contracted therapist hours available / month (=FTE × 21.7 days × shift_hours)
           Avg treatment price (€90 — blue input)
           Treatments / month (=Monthly Revenue / €90)
           Treatments / day (=Tx/Month / 21.7)
           Tx / Day / Therapist (=Tx/Day / FTE — KEY METRIC, highlighted)
           Target Tx/Day/T (3.5–5.5 optimal band — blue inputs)
           Status flag (=IF > 5.5, "⚠ OVER", IF < 3.5, "⚠ UNDER", "✓ OK")

=== SECTION E: ANNUALISED PLAN ===
Row:       Header: SECTION E — ANNUALISED STAFFING & REVENUE PLAN
Row:       Sub-header columns: Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec | FY Total
Rows:      Projected revenue (from monthly seasonal index — blue hardcoded)
           Core therapists (year-round permanent — blue hardcoded)
           Seasonal therapists active (blue hardcoded per month)
           Total therapist headcount (formula =Core + Seasonal)
           Tx/Day/T (formula =Revenue/90/21.7/Total_T)
           Total HC cost (formula, scaling with headcount)
           Leave reserve (=HC × 17% / 12)
           True total cost (=HC + Leave)
           HC/Revenue % (=True total cost / Revenue)
           Status (conditional: green ≤40%, amber ≤50%, red >50%)

=== SECTION F: FLAGS & ALERTS ===
Row:       Header: SECTION F — OPERATIONAL FLAGS
Rows:      HC/Revenue status (amber >40%, red >50%)
           Dual-role trigger log (treatment hours consumed MTD vs 25hr cap)
           Simultaneous absence status (flag if both therapists on leave at 3-room venue)
           Leave approval status (protected month flags: Aug always locked)
           Next action required (text cell — editable by RM)
```

---

## Section A Detail: Rotational Staff Wage Breakdown

For each role that is shared across locations (RM, RT Reception, floating therapist), the Notes column shows the full breakdown:

**RM ⅓ example (Inter):**
- Note: `RM1 cluster: 3/6 days here | Mon+Thu+Sat | €1,650/mo (= 3/6 × €3,300 cluster total)`

**Therapist shift pattern legend (reused from existing model):**
- `A` = Shift A (09:00–18:00)
- `B` = Shift B (11:00–20:00)
- `OFF` = Day off
- `S` = Seasonal (Apr–Oct only, row greyed out Nov–Mar)
- `PT` = Part-time (shows specific days only)
- `DR` = Dual-role day (supervisor available for treatments)

---

## Section E Detail: Annualised Seasonal Model

Revenue cyclicality indices (applied to each location's monthly average):

| Month | Index | Basis |
|---|---|---|
| Jan | 0.80 | Low season |
| Feb | 0.85 | Low-medium |
| Mar | 0.90 | Shoulder |
| Apr | 0.95 | Shoulder-peak |
| May | 1.00 | Peak begins |
| Jun | 1.10 | Peak |
| Jul | 1.20 | High peak |
| Aug | 1.25 | Absolute peak |
| Sep | 1.10 | Peak tail |
| Oct | 1.00 | Shoulder |
| Nov | 0.90 | Shoulder |
| Dec | 0.95 | Holiday uptick |

These indices are blue (hardcoded inputs) and can be overridden per location.

---

## Portfolio Summary Sheet

A new `Portfolio Summary` sheet (added after the 9 location sheets) shows:

| Row | Content |
|---|---|
| 1 | Title: CARISMA SPA — PORTFOLIO STAFFING SUMMARY |
| 2–10 | One row per location: Revenue | Base HC | Leave Reserve | True HC | HC% | Tx/Day/T | Status |
| 11 | Portfolio total row |
| 12 | (blank) |
| 13 | Section: OVER-BUDGET LOCATIONS (Ramla, Excelsior, Novo, Tigne) |
| 14–17 | Each with: Current HC% | Target HC% | Gap €/month | 6-month revenue target to close gap |
| 18 | (blank) |
| 19 | Section: 90-DAY IMPLEMENTATION TRACKER |
| 20–27 | One row per week from the CEO decision sequence |

---

## Data Sources

| Data | Source in existing Excel |
|---|---|
| Non-therapist roster (RM, Supervisor, Advisor, Reception) | Belt Reception, North Reception, Central Reception sheets |
| Named therapist rosters (T1–T9, shift patterns) | Inter Monthly, Hugos Monthly, etc. |
| Seasonal headcount by month | Dynamic Staffing Plan sheet |
| Monthly revenue by location | Staffing Model sheet (col B) |
| Workload (Tx/Day/T) | Workload Check sheet |
| Cluster/RM structure | Regional Rotation sheet |

---

## Leave Policy (CEO Decision 5 — codified)

| Parameter | Value |
|---|---|
| Annual leave — therapists/advisors | 28 days |
| Annual leave — supervisors | 28 days + 2 discretionary |
| Annual leave — spa attendants | 24 days |
| Annual leave — part-time | Pro-rata |
| Sick leave reserve | 4.5% of gross wages |
| Medical cert required from Day 1 | Mondays, Fridays, pre/post public holidays |
| Medical cert required from Day 3 | All other absences |
| August | Fully protected — no leave approvals |
| Primary draw-down window | January–March |
| Minimum therapists on floor | 2 at all times (3-room venues, non-negotiable) |
| Cross-cluster deployment clause | Mandatory in all Cluster C contracts |

---

## Build Plan Notes

- **Parallel build:** Agents can build Clusters A, B, C simultaneously (3 agents, 3 locations each)
- **QC agent:** After all 9 sheets built, a QC agent verifies: (a) all formula cross-references are intact, (b) Section A totals match Section B totals, (c) Section E monthly totals match Section C annualised figures, (d) Portfolio Summary aggregates correctly
- **Recalc:** Run `tools/recalc.py` after build to resolve any formula cache issues
- **Peak day optimisation:** Thursday–Sunday treatment slots prioritised in the rostering logic (maximise therapist availability on those days before assigning days off)
