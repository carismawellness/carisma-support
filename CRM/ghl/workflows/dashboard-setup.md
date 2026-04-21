# GHL Dashboard Setup Guide — Carisma Aesthetics

**Brand:** Carisma Aesthetics  
**Framework Reference:** "Forever Booked" (Grade med spa AI framework)  
**Last Updated:** April 2026  
**Applies To:** GHL Sub-Account → Dashboard section

---

## Overview

This SOP walks through the complete setup of the Carisma Aesthetics GHL sub-account dashboard. The layout is modeled after the "Forever Booked" Grade framework for professional med spa operations.

### Target Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  HERO KPIs (Top Row)                                             │
│  [Tasks] [Leads] [Closed Sales] [Sales Value] [Conv. Rate]       │
├──────────────────────────────────────────────────────────────────┤
│  PIPELINE FUNNEL (Full Width)                                    │
├──────────────────────────────────────────────────────────────────┤
│  REPORTS (Bottom Section)                                        │
│  [Needs Source Report] [Facebook Ads] [Google Business Profile]  │
└──────────────────────────────────────────────────────────────────┘
```

### Sales Pipeline Reference

The pipeline used throughout this dashboard is named **"Sales Pipeline"** with these stages (in order):

1. COLD Leads
2. Warm Leads
3. HOT Leads
4. Manual Followup
5. AI Followup
6. Recycle List
7. Appt Booked
8. Cancel/No-Show
9. Showed

---

## Prerequisites

Before building the dashboard, complete these steps:

- [ ] GHL sub-account for Carisma Aesthetics is active
- [ ] "Sales Pipeline" exists in CRM → Pipelines (see `setup-new-pipeline.md`)
- [ ] Facebook Ad account connected under Settings → Integrations → Facebook (LeadConnector)
- [ ] Google Business Profile connected under Reputation → Settings → Google Business Profile
- [ ] Attribution tracking is active on all forms, surveys, and calendars
- [ ] GHL user has "Dashboard Stats" permission enabled

---

## Part 1: Create the Dashboard

### Step 1: Open Dashboard Settings

1. Log in to the Carisma Aesthetics sub-account
2. In the left sidebar, click **Dashboard** (home icon)
3. At the top of the page, click the **dashboard name dropdown** (shows the current dashboard name)
4. Click **+ Add Dashboard**

### Step 2: Configure Dashboard Properties

A modal will appear. Fill in:

| Field | Value |
|---|---|
| Dashboard Name | `Carisma Aesthetics — Operations` |
| Visibility | **Everyone** (all users in this sub-account can view it) |

Click **Create Dashboard**.

> **Note:** If you want a manager-only version with more detail, create a second dashboard set to **Private** named `Carisma Aesthetics — Manager View`.

---

## Part 2: Hero KPI Widgets (Top Row)

These five widgets form the top "scorecard" row. Each one is a **Numeric / Scorecard** type widget at **quarter-width** or **one-fifth width** depending on your plan's grid resolution.

Add each widget using this flow:
1. Click **+ Add Widget** (top right of the dashboard)
2. Select the widget category and metric as specified below
3. Set size to **Small** (quarter-width) for all five so they fit in one row
4. Click **Save Widget**

---

### Widget 1: Tasks (Open Task Count)

**Purpose:** Shows how many open tasks exist — a proxy for follow-up load on the team.

**Configuration:**

| Setting | Value |
|---|---|
| Widget Type | **Scorecard / Numeric** |
| Category | **Tasks** |
| Metric | **Open Tasks** |
| Date Range | This Month (or All Time — your preference) |
| Filter | None (shows all users) |
| Size | Small (quarter-width) |
| Label | `Open Tasks` |

> **Tip:** If you want to break this down by assigned user, create a duplicate widget per rep. For the top-level dashboard, keep it unfiltered.

---

### Widget 2: Leads Generated

**Purpose:** Total number of new contacts/leads created in the period.

**Configuration:**

| Setting | Value |
|---|---|
| Widget Type | **Scorecard / Numeric** |
| Category | **Contacts** |
| Metric | **New Contacts** (also labeled "Leads Created" or "Contacts Added") |
| Date Range | This Month |
| Filter | None |
| Size | Small (quarter-width) |
| Label | `Leads Generated` |

> **Note:** In GHL, "Leads Generated" maps to the **New Contacts** metric under the Contacts category. If you have a specific "Lead" tag applied at intake, you can add a Tag filter here.

---

### Widget 3: Number of Closed Sales

**Purpose:** Count of opportunities moved to the "Won" status in the Sales Pipeline.

**Configuration:**

| Setting | Value |
|---|---|
| Widget Type | **Scorecard / Numeric** |
| Category | **Opportunities** |
| Metric | **Won Opportunities** |
| Pipeline | Sales Pipeline |
| Date Range | This Month |
| Filter | Pipeline = "Sales Pipeline" |
| Size | Small (quarter-width) |
| Label | `Closed Sales` |

---

### Widget 4: Closed Sales Value

**Purpose:** Total monetary value of all Won opportunities this month.

**Configuration:**

| Setting | Value |
|---|---|
| Widget Type | **Scorecard / Numeric** |
| Category | **Opportunities** |
| Metric | **Won Opportunities Value** (also labeled "Pipeline Value — Won") |
| Pipeline | Sales Pipeline |
| Date Range | This Month |
| Filter | Pipeline = "Sales Pipeline" |
| Format | Currency (EUR) |
| Size | Small (quarter-width) |
| Label | `Closed Sales Value` |

> **Setup Note:** Ensure that opportunity monetary values are being entered when moving leads to Won. If values are blank, this widget will show €0. Brief your setters/closers to always populate the opportunity value field.

---

### Widget 5: Conversion Rate

**Purpose:** Percentage of leads that converted to Won (Closed Sales ÷ Leads Generated).

**Configuration:**

| Setting | Value |
|---|---|
| Widget Type | **Scorecard / Numeric** |
| Category | **Opportunities** |
| Metric | **Conversion Rate** |
| Pipeline | Sales Pipeline |
| Date Range | This Month |
| Filter | Pipeline = "Sales Pipeline" |
| Format | Percentage (%) |
| Size | Small (quarter-width) |
| Label | `Conversion Rate` |

> **How GHL calculates this:** Won Opportunities ÷ Total Opportunities × 100. This is opportunity-level conversion, not contact-level. If you need a contact-to-booking rate, that requires a custom metric (see Part 5).

---

## Part 3: Pipeline Funnel Widget

### Widget 6: Sales Pipeline Funnel

**Purpose:** Visual funnel showing how many opportunities are in each pipeline stage — the core operational view.

**Configuration:**

1. Click **+ Add Widget**
2. Select **Funnel** from the widget type options (under the Opportunities or Pipeline category)
3. Set the following:

| Setting | Value |
|---|---|
| Widget Type | **Funnel** |
| Pipeline | Sales Pipeline |
| Date Range | This Month (or All Time for cumulative view) |
| Size | **Full Width (Large)** |
| Label | `Sales Pipeline Funnel` |

4. Click **Save Widget**

**After saving — enable stages for the funnel chart:**

1. Go to **CRM → Pipelines**
2. Click the **"..." menu** on "Sales Pipeline" → **Edit**
3. For each stage, look for the **funnel chart visibility toggle** (eye icon or toggle on the right side of each stage row)
4. Enable all 9 stages:
   - COLD Leads ✓
   - Warm Leads ✓
   - HOT Leads ✓
   - Manual Followup ✓
   - AI Followup ✓
   - Recycle List ✓
   - Appt Booked ✓
   - Cancel/No-Show ✓
   - Showed ✓

> **How it works:** The funnel shows sequential stage-to-stage flow. Each section displays the count at that stage AND the percentage that advanced from the previous stage. This reveals where leads are dropping off — critical for a med spa funnel where "Appt Booked → Cancel/No-Show → Showed" is the money sequence.

> **Stage Distribution vs Funnel:** GHL offers two pipeline visualizations:
> - **Funnel Widget** — shows sequential flow (use this for the main dashboard)
> - **Stage Distribution Widget** — shows count of OPEN opportunities per stage as a bar/donut chart (add this to a manager view for instant inventory scan)

---

## Part 4: Report Widgets (Bottom Section)

These three report widgets go below the funnel, each at **full-width** or **half-width** depending on layout preference. Recommended: all three at full-width stacked vertically.

---

### Widget 7: Needs Source Report (Lead Attribution by Source)

**Purpose:** Shows which sources (Facebook, Google, Instagram, organic, referral, etc.) are generating leads. Essential for understanding where to invest.

**What "Needs Source" means:** In GHL, contacts that have no attribution source recorded appear in a "Needs Source" or "Unknown Source" bucket. The goal of this widget is to track source distribution and minimize the "Needs Source" percentage.

**Configuration:**

1. Click **+ Add Widget**
2. Choose category: **Contacts** or **Attribution**
3. Select metric type: **Chart (Donut or Bar)**

| Setting | Value |
|---|---|
| Widget Type | **Donut Chart** or **Bar Chart** |
| Category | **Contacts** |
| Metric | **Contact Source** (or "Attribution Source" depending on your GHL version) |
| Group By | **Source** |
| Date Range | This Month |
| Size | Full Width |
| Label | `Lead Source Breakdown` |

**Alternative — use the built-in Source Report:**

GHL has a dedicated **Source Report** under Reporting:
1. Go to **Reporting → Conversion Report**
2. In the dropdown (top right), switch to **Source Report**
3. This shows a table of all sources, contact counts, and conversion rates
4. To embed this view, use the **Reporting** widget type → **Source Report** if available in your plan

**Adding Attribution UTM Filter:**

If you have UTM parameters on ad traffic:
1. In the widget editor, click **+ Add Filter**
2. Choose **Attribution Type**: First Touch or Last Touch
3. Add UTM parameter filters (utm_source, utm_medium, utm_campaign) as needed

> **Critical setup note:** Attribution data is only captured when a contact submits a GHL-native Form, Survey, Calendar booking, Chat Widget, or Order Form. Any contact created manually or via third-party sync will show "Needs Source." Track this percentage weekly and investigate any spike.

---

### Widget 8: Facebook Ads Report

**Purpose:** Display Meta (Facebook/Instagram) ad performance metrics directly inside the GHL dashboard — spend, clicks, conversions, CPL.

**Prerequisites:**
- Facebook Ad account must be connected in **Settings → Integrations → Facebook (LeadConnector)**
- LeadConnector must have Business Manager permissions, ad account access, and page access

**Connection Steps (if not already done):**

1. Go to **Settings** (sub-account level) → **Integrations**
2. Click **Connect** next to **Facebook**
3. Log in with the Facebook account that has admin access to the Carisma Aesthetics Ad Account
4. Grant all requested permissions (LeadConnector needs: Manage Ads, Ads Management Standard Access, pages_read_engagement)
5. Select the correct **Ad Account** from the dropdown
6. Click **Save**

**Widget Configuration:**

1. Click **+ Add Widget**
2. Browse to **Meta / Facebook Ads** category (labeled "Meta Ad Widgets" in 2025 GHL)
3. Select the metric type:

| Widget Name | Metric | Type | Size |
|---|---|---|---|
| Ad Spend | Amount Spent | Scorecard | Quarter |
| Reach | Reach | Scorecard | Quarter |
| Link Clicks | Link Clicks | Scorecard | Quarter |
| CPL (Cost Per Lead) | Cost Per Lead | Scorecard | Quarter |
| Campaign Performance | Impressions + Clicks + Spend over time | Line Chart | Full Width |
| Top Campaigns | Campaign breakdown by spend/results | Table | Full Width |

> **Recommended layout for Aesthetics:** Start with the 4 scorecards in one row (Spend / Reach / Clicks / CPL), then add the Campaign Performance line chart full-width below it. This mirrors the "Forever Booked" reporting dashboard structure.

**Setting the Date Range:**

All Meta Ad widgets share the date filter set at the dashboard level. Use the date range picker at the top of the dashboard to switch between This Month, Last 7 Days, Last 30 Days, etc.

---

### Widget 9: Google Business Profile Report

**Purpose:** Track GBP-driven activity — calls, direction requests, website clicks, and review scores — to monitor local SEO performance.

**Important context:** As of 2025-2026, GHL does not have a dedicated "GBP Metrics Widget" for dashboard charts. GBP data in GHL flows through two channels:

1. **Reputation Tab** — review management, reply automation, review request campaigns
2. **Listings / GMB Sync** — profile data sync (hours, photos, address, posts)

GBP call/click/view metrics from the Google Business Profile API are not natively embedded as dashboard chart widgets in GHL. They are accessible via Google Analytics (if GA4 is connected) or directly in GBP Insights.

**Recommended approach for the Carisma Aesthetics dashboard:**

**Option A — Reputation Widget (native GHL):**

1. Click **+ Add Widget**
2. Category: **Reputation** (or **Reviews**)
3. Add these widgets:

| Widget | Metric | Size |
|---|---|---|
| Average Rating | Star rating average | Quarter-width scorecard |
| Total Reviews | Count of all reviews | Quarter-width scorecard |
| New Reviews (This Month) | Recent review count | Quarter-width scorecard |
| Review Requests Sent | Automation activity | Quarter-width scorecard |

**Option B — Google Analytics Widget (if GA4 is connected):**

If GA4 is linked under **Settings → Integrations → Google Analytics**:

1. Click **+ Add Widget**
2. Category: **Google Analytics**
3. Available metrics: Total Users, Sessions, Engagement Rate, Sessions by Channel
4. Add a **Bar Chart** for "Sessions by Channel" to show organic/direct/paid split
5. This gives an indirect view of GBP-driven traffic (shows as "Organic Search" or "Direct")

**Option C — Embed GBP Performance (manual workaround):**

Until GHL adds native GBP metric widgets, create a **Text/Link widget** or use an **iFrame widget** (if available) pointing to the GBP Insights dashboard at `https://business.google.com/`. This keeps the URL accessible from the GHL dashboard without leaving the platform.

**Label this section:** `Google Business Profile` with a note to the team that GBP call/view data is viewed directly in Google Search Console or GBP dashboard.

---

## Part 5: Final Layout Assembly

### Recommended Widget Order (Top to Bottom)

| Row | Widget(s) | Width |
|---|---|---|
| Row 1 | Open Tasks / Leads Generated / Closed Sales / Closed Sales Value / Conversion Rate | Five equal columns (small) |
| Row 2 | Sales Pipeline Funnel | Full width |
| Row 3 | Lead Source Breakdown (Donut/Bar) | Full width |
| Row 4 | Meta Ad Spend / Reach / Clicks / CPL | Four equal columns (small) |
| Row 5 | Campaign Performance (line chart) | Full width |
| Row 6 | Top Campaigns Table | Full width |
| Row 7 | Avg Rating / Total Reviews / New Reviews / Review Requests | Four equal columns (small) |

### Reordering Widgets

- Hover over a widget → a **drag handle** (six-dot icon) appears in the top-left corner
- Drag the widget to the desired position
- GHL snaps to a grid — widgets will align automatically

### Resizing Widgets

- Hover over a widget → drag the **resize handle** at the bottom-right corner
- Resize in increments of the grid columns
- Options typically: 1/4 width, 1/2 width, 3/4 width, full width

---

## Part 6: Dashboard Date Range

The dashboard has a **global date range filter** at the top of the page. All widgets without a hardcoded date range will respect this filter.

**Recommended default:** `This Month`

To set it:
1. Click the date picker at the top right of the dashboard
2. Select **This Month**
3. This becomes the default view every time a user opens the dashboard

Users can temporarily change the date range to investigate trends without permanently changing the dashboard configuration.

---

## Part 7: Scheduling Automated Reports

To have this dashboard emailed to the team automatically:

1. Click the **three-dot menu (...)** at the top right of the dashboard
2. Select **Schedule Report**
3. Configure:

| Setting | Value |
|---|---|
| Frequency | Weekly (every Monday, 8:00 AM Malta time) |
| Recipients | Add team leads and the Carisma Aesthetics GM email |
| Format | PDF snapshot of the current dashboard |
| Subject Line | `Carisma Aesthetics — Weekly Dashboard Report` |

4. Click **Save Schedule**

---

## Part 8: Permissions

Ensure the following user permissions are active for everyone who needs to view this dashboard:

- **Dashboard Stats** — required to see all dashboard widgets
- **Opportunities** — required for funnel and pipeline widgets
- **Contacts** — required for lead and attribution widgets
- **Reporting** — required for source reports
- **Reputation** — required for review widgets

To check: **Settings → Team → [User] → Permissions**

---

## Troubleshooting

| Issue | Likely Cause | Fix |
|---|---|---|
| Funnel widget shows no data | Pipeline not set as "Visible in Funnel Chart" | Go to CRM → Pipelines → Edit → enable toggle per stage |
| Meta Ads widget shows "Not Connected" | Facebook integration not authorized | Settings → Integrations → Facebook → Reconnect |
| Conversion Rate shows 0% | No Won opportunities recorded | Verify reps are marking deals as Won, not just moving to "Showed" |
| All leads show "Needs Source" | Forms not using GHL-native forms | Audit intake forms — must be GHL Forms/Surveys/Calendars for attribution to capture |
| GBP metrics not showing | No native GBP widget in GHL | Use Reputation widgets for review data; use GA4 widget for traffic data |
| Widget is missing from Add Widget menu | Plan limitation | Check if your GHL plan includes that widget type; contact GHL support |

---

## Notes and Known Limitations

- **Pipelines via API:** Pipelines cannot be created via GHL API — always use the UI. Stage IDs need to be pulled after UI creation (see `setup-new-pipeline.md`).
- **GBP native widgets:** As of April 2026, GHL does not expose GBP Insights (calls, direction requests, views) as chartable dashboard widgets. This is a known gap — monitor GHL changelog for updates.
- **Meta widget data lag:** Meta Ad data in GHL widgets can lag up to 24 hours behind the actual Meta Ads Manager figures. Use GHL for trend monitoring; use Meta Ads Manager for precise real-time figures.
- **Attribution requires GHL-native touchpoints:** Any lead that enters via a non-GHL form (manual add, CSV import, Zapier/n8n sync without attribution data) will show no source. Minimize this by ensuring all intake points route through GHL-native forms.
- **"Forever Booked" framework:** The Grade "Forever Booked" system is designed around fast response times and AI-assisted follow-up. This dashboard is designed to surface the Speed-to-Lead and pipeline health metrics that framework depends on. Pair with the GHL Setter Queue Task System for full operational visibility.

---

## Related Files

- `CRM/ghl/workflows/setup-new-pipeline.md` — how to create and configure the Sales Pipeline
- `CRM/ghl/workflows/data-operations.md` — data queries and CRM operations
- `CRM/ghl/config.py` — pipeline IDs and stage IDs for automation scripts
- `Config/brand-voice/aesthetics.md` — brand voice and persona reference
