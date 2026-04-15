# Dashboard V3 — Finance EBITDA + Sales (Brand-Adaptive) + CRM Redesign

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild three cockpit dashboards with mock data — Finance (EBITDA per-location deep dive), Sales (brand-adaptive: Spa locations / Aesthetics consults / Slimming funnels), CRM (comprehensive phone/messaging/lead KPIs per brand).

**Architecture:** All three pages follow the existing DashboardShell render-prop pattern `{({ dateFrom, dateTo, brandFilter }) => ...}`. Mock data is defined inline as constants. Each page uses the existing component library (KPICardRow, DataTable, Card, Recharts). Brand-adaptive Sales page conditionally renders different content based on `brandFilter`.

**Tech Stack:** Next.js 16, React, Recharts, shadcn/ui, Tailwind v4, TypeScript

---

## Dashboard 1: Finance — EBITDA per Location Deep Dive

### Changes from current Finance page:
- **Remove:** Budget vs Actual chart
- **Remove:** Revenue Forecast component (moves to Sales)
- **Keep:** EBITDA Trend chart, SSG chart, Contribution Margin chart
- **Add:** EBITDA by Location combo chart (bar = EBITDA amount, line = margin %)
- **Add:** Collapsible P&L drill-down table per location
- **Add:** Corporate view for group-level overhead items

### EBITDA by Location Combo Chart
- X-axis: location names (InterContinental, Hugo's, Hyatt, Ramla, Labranda, Odycy, Excelsior, Novotel, Aesthetics, Slimming)
- Left Y-axis: EUR (bar = EBITDA amount)
- Right Y-axis: % (line = EBITDA margin %)
- Total EBITDA shown as annotation/label

### P&L Drill-Down Table
Clickable rows that expand to show detail. Structure per location:

| Line Item | Amount |
|-----------|--------|
| **Trading Income (ex VAT)** | Revenue |
| Wages & Salaries | (expense) |
| Advertising & Marketing | (expense) |
| Rent | (expense) |
| Utilities | (expense) |
| COGS | (expense) |
| SG&A | (expense) |
| **OPEX (subtotal)** | Sum of above expenses |
| **EBITDA** | Trading Income - OPEX |

- Each location row is clickable → expands to show the P&L table
- EBITDA row shows margin % alongside amount
- Corporate view: separate section for group-level items (central salaries, group marketing, group SG&A) not allocated to any location
- Totals row at bottom summing all locations + corporate

### KPI Cards (updated):
- Group EBITDA (total)
- Group EBITDA Margin %
- Company HC%
- Best Performing Location (highest margin)

---

## Dashboard 2: Sales — Brand-Adaptive Layout

### When `brandFilter` is null/All or "Spa":

**KPI Cards:** Total Revenue, YoY Growth, Avg Retail %, Avg Add-on %, Avg Hotel Capture %, Avg AOV

**Section 1: Revenue by Spa**
Table with columns: Location | Revenue | YoY Delta (with up/down indicator) | AOV | Local Guest %
- Revenue bar chart by location with YoY comparison overlay

**Section 2: Add-on Sales by Spa**
Separate table: Location | Add-on Revenue (EUR) | Add-on % | YoY Delta
- Bar chart of add-on revenue per spa

**Section 3: Retail Sales by Spa**
Separate table: Location | Retail Revenue (EUR) | Retail % | YoY Delta
- Bar chart of retail revenue per spa

**Section 4: Hotel Capture Rate**
Horizontal bar chart per spa showing hotel capture %

### When `brandFilter` is "Aesthetics":

**KPI Cards:** Service Revenue, Retail Revenue, AOV, Consultation Conversion Rate, Booking Show Rate, Active Members

**Section 1: Consultation Funnel**
Table: Calendared | Showed Up | Conversion Rate | Show Rate

**Section 2: Bookings**
Table: Calendared | Showed Up | Show Rate

**Section 3: Client Metrics**
- Repeat customers (# and %)
- Follow-up sessions count
- Active members count
- Google reviews count

### When `brandFilter` is "Slimming":

**KPI Cards:** Service Revenue, Retail Revenue, Lead Conversion Rate, Course Conversion %, Max Course %, Dr Conversion Rate

**Section 1: Lead & Consultation Funnel**
Table: Leads | Consults Calendared | Showed Up | Converted to Course | Converted to Max Course
Target indicators: Lead conv 40-50%, Course conv 65%, Max course 10-15%, Consult showup 85%

**Section 2: Medical Consultations**
Table: First-time Medical Consults Calendared | Medical Consults Converted to Clients | Dr Conversion Rate %

**Section 3: Bookings & Members**
- Bookings calendared (target: 45/therapist)
- Bookings showed up
- Booking show rate
- Active members
- Google reviews
- Retail % (target: 20%)

---

## Dashboard 3: CRM — Comprehensive Redesign

Per-brand filtering. All metrics reported separately per brand.

### KPI Cards:
Speed to Lead (Median) | Speed to Lead (Mean) | Conversion Rate | Deposit % | Leads/Day | Meta vs CRM Gap

### Section 1: Phone Calls
**Outbound Calls Table:**
| Metric | Count |
|--------|-------|
| Calls Made | # |
| Calls Answered | # |
| Calls Booked (to appointment) | # |
| Answer Rate | % |
| Booking Rate | % |

**Inbound Calls Table:**
| Metric | Count |
|--------|-------|
| Total Inbound | # |
| Missed Calls | # |
| Missed % | % |
| After-Hours Calls (outside 9am-6pm) | # |

### Section 2: Lead Pipeline
- Leads per day trend chart (line chart over time)
- Meta leads vs CRM leads comparison (grouped bar chart)
- Lead source breakdown (pie/donut)

### Section 3: Appointments & Conversions
- Total appointments booked by sales rep (DataTable, sortable)
- Conversion rate = appointments booked / leads in period
- Speed to Lead distribution chart (bar chart by bucket)

### Section 4: Sales by Channel
- Total sales per brand by channel (stacked bar chart)
- Deposit percentage trend

### Section 5: Messaging Volume
| Channel | Conversations |
|---------|--------------|
| WhatsApp | # |
| Email | # |
| Meta DMs | # |
| Meta Comments | # |
| SalesIQ Chatbot | # |
| **Total** | # |

### Section 6: Rep Leaderboard
DataTable: Rep | Calls | Appointments | Conversions | Conv. Rate | Speed to Lead

---

## Mock Data Strategy

All three dashboards use inline mock data constants. Data is realistic for a Malta wellness group:
- 8 spa locations with varying revenue (EUR 15K-45K/week range)
- Aesthetics: ~200 consults/month, 65% conversion
- Slimming: ~150 leads/month, 40% conversion
- CRM: 3 brands, 8-12 reps, ~50 leads/day across all brands

Mock data is defined at the top of each page file as `const MOCK_*` arrays.
