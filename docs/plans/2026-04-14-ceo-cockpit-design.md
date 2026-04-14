# Carisma CEO Cockpit — Design Document

**Date:** 14 April 2026  
**Status:** Approved  
**Author:** CEO + Carisma Intelligence  
**Location:** `cockpit/`

---

## 1. Overview

The Carisma CEO Cockpit is a full-stack business intelligence dashboard that consolidates data across three brands (Carisma Spa, Carisma Aesthetics, Carisma Slimming) and five departments (Marketing, Sales/CRM, Finance, HR, Operations). It provides a CEO consolidated view plus per-department and per-brand filtering, backed by an AI engine called Carisma Intelligence (CI) that analyzes data, sends email alerts with recommendations, and executes approved actions.

### Core Requirements

- **6 views:** CEO (consolidated), Marketing, Sales/CRM, Finance, HR, Operations
- **3 brand filters:** Spa, Aesthetics, Slimming (plus "All")
- **Date range picker** for time-based filtering
- **CI Chat Agent** embedded in dashboard for natural language data queries
- **CI Alert System:** Alert → Recommend → Email → Approve → Execute
- **Auth + User Management:** Role-based access, department heads see only their data
- **Cloud-hosted** with login (Vercel + Supabase)
- **Branded UI:** Deep Navy (#1B3A4B) + Muted Gold (#B8943E)

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   DATA SOURCES                       │
│  Meta Ads · Google Ads · GA4 · GSC · Klaviyo        │
│  Zoho CRM · Wix · We360 · Fresha · CarismaSoft     │
│  Weekly KPIs Sheet · CRM Master · EBITDA Sheet      │
│  Aesthetics Sales · Slimming Sales · Salary Master  │
└──────────────────────┬──────────────────────────────┘
                       │ ETL cron jobs (scheduled
                       │ triggers pulling via MCP)
                       ▼
┌─────────────────────────────────────────────────────┐
│          SUPABASE (PostgreSQL + Auth)                │
│                                                      │
│  20 tables: sales, CRM, marketing, finance, HR,     │
│  operations, CI alerts, chat history, ETL log        │
│                                                      │
│  Auth: email/password login, role-based access       │
│  RLS: department heads see only their data           │
│  Free tier: 500MB (plenty for KPI data)              │
└──────────────────────┬──────────────────────────────┘
                       │ Supabase JS client
                       ▼
┌─────────────────────────────────────────────────────┐
│              NEXT.JS COCKPIT APP                     │
│                                                      │
│  Sidebar: CEO | Marketing | Sales | Finance | HR |  │
│           Operations                                 │
│  Top Bar: Date Range + Brand Filter + User Menu      │
│  Content: KPI Cards + Charts + Tables                │
│  Bottom:  CI Chat Agent                              │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│            CARISMA INTELLIGENCE (CI)                  │
│                                                      │
│  Scheduled: SQL queries → Analyze → Gmail summary    │
│  On approval: Execute via MCP (Meta, Trello, WA)     │
│  Chat: Natural language → SQL → Claude analysis      │
└─────────────────────────────────────────────────────┘
```

### Deployment

- **Frontend:** Vercel (Next.js)
- **Database + Auth:** Supabase (PostgreSQL + Auth + RLS)
- **ETL Crons:** Claude Code scheduled triggers
- **CI Chat:** Claude API (Anthropic SDK)
- **CI Actions:** Meta Ads MCP, Trello MCP, WhatsApp MCP, Gmail MCP

---

## 3. Department KPI Breakdown

### 3.1 CEO View (Consolidated)

| KPI | Source | Target |
|---|---|---|
| Total Revenue (all brands, weekly) | sales_weekly | Trend vs prior week |
| Total Ad Spend + Blended ROAS | marketing_daily | ROAS > 5.0 |
| Blended Conversion Rate (leads → sales) | crm_daily | > 25% |
| Company HC% (salary / revenue) | hr_weekly | < 40% |
| Avg Speed to Lead (all brands) | crm_daily | < 5 min |

Charts: Revenue trend (stacked by brand), Department health radar chart.  
Table: CI Alert Feed (last 10 alerts across all departments).

### 3.2 Marketing View

| KPI | Source | Target |
|---|---|---|
| Ad Spend by brand | marketing_daily | vs budget |
| CPL by brand | marketing_daily | Spa < EUR 8, Aes < EUR 12, Slim < USD 10 |
| ROAS by brand | marketing_daily | > 5.0 |
| Website Sessions + Bounce Rate | ga4_daily | Trend |
| Email Revenue % | klaviyo_campaigns | > 35% |
| SEO Clicks + Avg Position | gsc_daily | Trend |
| Popup Capture Rate | ga4_daily | > 8% |

Charts: Spend vs Revenue by brand (dual-axis), CPL by brand (bar + target lines).  
Table: Campaign performance breakdown.

### 3.3 Sales / CRM View

| KPI | Source | Target |
|---|---|---|
| Speed to Lead (median + mean) | crm_daily | < 5 min |
| Total Leads: Meta vs CRM count | crm_daily | Match check |
| Conversion Rate (lead → booking → sale) | crm_daily | > 25% |
| Appointments Booked per Rep | crm_by_rep | Ranked |
| Outbound Calls (total + per rep) | crm_by_rep | 60 workable/SDR |
| Deposit Got % | crm_daily | Trend |
| Calls Outside Working Hours | crm_daily | Flag count |
| LTV + Retention Metrics | crm_daily | Trend |
| Retail % | sales_weekly | > 12% |
| Add-on % | sales_weekly | > 4% |
| Hotel Capture % (Spa only) | sales_weekly | > 5% |
| CRM Failed Check | crm_daily | Boolean alert |

Charts: Speed to Lead distribution (histogram), Conversion funnel.  
Table: Rep leaderboard (calls, bookings, conversion, ranked).

### 3.4 Finance View

| KPI | Source | Target |
|---|---|---|
| EBITDA (monthly, by brand) | ebitda_monthly | Trend |
| Revenue vs Budget | budget_vs_actual | Variance % |
| HC% by location | hr_weekly | < 40% |
| Revenue by location (weekly, ex VAT) | sales_weekly | YoY delta |
| Marketing Budget Spend vs Allocation | budget_vs_actual | Variance |

Charts: EBITDA trend by brand (monthly), Budget vs Actual by department (grouped bar).  
Table: Revenue by location with YoY delta.

### 3.5 HR View

| KPI | Source | Target |
|---|---|---|
| HC% per location (salary / revenue) | hr_weekly | < 40% |
| Utilization by spa + by therapist | therapist_utilization | > 75% |
| Headcount + Movement (joiners/leavers) | hr_weekly | Trend |
| Productivity % (We360) | we360_daily | Table view |
| Slimming Bookings per Therapist | therapist_utilization | > 45 |
| Advisory Commission Tracking | sales_by_rep | Audit flag |

Charts: HC% by location (bar + 40% target line), Utilization trend.  
Table: We360 Employee Productivity (online, active, idle, productive, unproductive, neutral, email, productivity %).

### 3.6 Operations View

| KPI | Source | Target |
|---|---|---|
| Google Reviews per Location | operations_weekly | Trend + avg |
| Complaints Count | operations_weekly | Trend |
| Consult Conversion % (Aesthetics) | consult_funnel | > 50% |
| Consult Show-up % (Slimming) | consult_funnel | > 85% |
| Course Conversion % (Slimming) | consult_funnel | > 65% |
| AOV (Aesthetics) | consult_funnel | > EUR 245 |

Charts: Google Reviews trend by location, Consult funnel (booked → attended → converted).  
Table: Location scorecard.

---

## 4. Database Schema

### 4.1 Auth & Profiles

```sql
profiles
  id            uuid PK (FK → auth.users)
  full_name     text
  role          enum (ceo, marketing_head, sales_head, finance_head, hr_head, ops_head, viewer)
  brands_access text[]
  created_at    timestamptz
  updated_at    timestamptz
```

### 4.2 Dimension Tables

```sql
brands
  id    serial PK
  slug  text (spa, aesthetics, slimming)
  name  text

locations
  id        serial PK
  brand_id  FK → brands
  slug      text
  name      text
  is_active bool

staff
  id          serial PK
  name        text
  role        text (therapist, advisor, receptionist, sdr)
  location_id FK → locations
  brand_id    FK → brands
  is_active   bool
```

### 4.3 Sales & Revenue

```sql
sales_weekly
  id                   serial PK
  week_start           date
  location_id          FK → locations
  brand_id             FK → brands
  revenue_ex_vat       numeric
  revenue_yoy_delta_pct numeric
  retail_pct           numeric
  addon_pct            numeric
  hotel_capture_pct    numeric (spa only)
  etl_synced_at        timestamptz

sales_by_rep
  id                 serial PK
  date               date
  staff_id           FK → staff
  brand_id           FK → brands
  revenue            numeric
  bookings_count     int
  deposits_collected numeric
  deposit_pct        numeric
```

### 4.4 CRM / Lead Management

```sql
crm_daily
  id                        serial PK
  date                      date
  brand_id                  FK → brands
  total_leads               int
  leads_meta                int
  leads_crm                 int
  leads_in_hours            int
  leads_out_hours           int
  speed_to_lead_median_min  numeric
  speed_to_lead_mean_min    numeric
  conversion_rate_pct       numeric
  total_calls               int
  outbound_calls            int
  calls_outside_hours       int
  appointments_booked       int
  etl_synced_at             timestamptz

crm_by_rep
  id                     serial PK
  date                   date
  staff_id               FK → staff
  brand_id               FK → brands
  leads_assigned         int
  calls_made             int
  appointments_booked    int
  conversions            int
  conversion_rate_pct    numeric
  speed_to_lead_avg_min  numeric

speed_to_lead_distribution
  id       serial PK
  date     date
  brand_id FK → brands
  bucket   text (<1min, 1-3min, 3-5min, 5-15min, 15-30min, 30min+)
  count    int
  pct      numeric
```

### 4.5 Marketing

```sql
marketing_daily
  id           serial PK
  date         date
  brand_id     FK → brands
  platform     text (meta, google)
  spend        numeric
  impressions  int
  clicks       int
  leads        int
  cpl          numeric
  roas         numeric
  ctr_pct      numeric
  cpc          numeric
  etl_synced_at timestamptz

ga4_daily
  id                       serial PK
  date                     date
  brand_id                 FK → brands
  sessions                 int
  total_users              int
  new_users                int
  page_views               int
  avg_session_duration_sec numeric
  bounce_rate_pct          numeric
  conversions              int

gsc_daily
  id           serial PK
  date         date
  brand_id     FK → brands
  clicks       int
  impressions  int
  ctr_pct      numeric
  avg_position numeric

klaviyo_campaigns
  id                   serial PK
  date                 date
  brand_id             FK → brands
  campaign_name        text
  sends                int
  opens                int
  clicks               int
  revenue              numeric
  revenue_pct_of_total numeric
```

### 4.6 Finance

```sql
ebitda_monthly
  id               serial PK
  month            date
  brand_id         FK → brands
  revenue          numeric
  cogs             numeric
  gross_profit     numeric
  opex             numeric
  ebitda           numeric
  ebitda_margin_pct numeric

budget_vs_actual
  id           serial PK
  month        date
  brand_id     FK → brands
  department   text
  budgeted     numeric
  actual       numeric
  variance_pct numeric
```

### 4.7 HR

```sql
hr_weekly
  id                serial PK
  week_start        date
  location_id       FK → locations
  brand_id          FK → brands
  total_salary_cost numeric
  revenue           numeric
  hc_pct            numeric
  utilization_pct   numeric
  headcount         int
  joiners           int
  leavers           int

we360_daily
  id                  serial PK
  date                date
  staff_id            FK → staff
  online_time_min     int
  active_time_min     int
  idle_time_min       int
  productive_time_min int
  unproductive_time_min int
  neutral_time_min    int
  email_time_min      int
  productivity_pct    numeric

therapist_utilization
  id              serial PK
  week_start      date
  staff_id        FK → staff
  location_id     FK → locations
  available_hours numeric
  booked_hours    numeric
  utilization_pct numeric
  bookings_count  int
```

### 4.8 Operations

```sql
operations_weekly
  id                   serial PK
  week_start           date
  location_id          FK → locations
  brand_id             FK → brands
  google_reviews_count int
  google_reviews_avg   numeric
  complaints_count     int

consult_funnel
  id                    serial PK
  week_start            date
  brand_id              FK → brands
  consults_booked       int
  consults_attended     int
  showup_pct            numeric
  conversions           int
  conversion_pct        numeric
  aov                   numeric (aesthetics)
  course_conversions    int (slimming)
  course_conversion_pct numeric (slimming)
```

### 4.9 CI System Tables

```sql
ci_alerts
  id              serial PK
  created_at      timestamptz
  department      text
  brand_id        FK → brands (nullable)
  severity        enum (info, warning, critical)
  title           text
  description     text
  recommendation  text
  status          enum (pending, emailed, approved, executed, dismissed)
  approved_at     timestamptz (nullable)
  executed_at     timestamptz (nullable)
  action_payload  jsonb

ci_chat_history
  id         serial PK
  user_id    FK → profiles
  created_at timestamptz
  role       text (user, assistant)
  message    text
  sql_query  text (nullable)
  context    jsonb

etl_sync_log
  id             serial PK
  source_name    text
  started_at     timestamptz
  completed_at   timestamptz
  status         text (success, partial, failed)
  rows_upserted  int
  error_message  text (nullable)
  duration_sec   numeric

kpi_targets
  id           serial PK
  department   text
  metric_name  text
  target_value numeric
  comparison   text (lt, gt, eq, between)
  brand_id     FK → brands (nullable)
  is_active    bool
```

**Total: 20 tables** (3 dimension + 3 sales + 3 CRM + 4 marketing + 2 finance + 3 HR + 2 operations + 4 system)

---

## 5. Frontend Design

### 5.1 Layout

```
┌──────────────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌──────────────────────────────────────────────┐│
│ │  SIDEBAR  │ │  TOP BAR: [Date Range] [Brand Filter] [User]││
│ │           │ ├──────────────────────────────────────────────┤│
│ │  COCKPIT  │ │  KPI CARDS (row of 3-5)                      ││
│ │  CEO      │ │  PRIMARY CHART | SECONDARY CHART             ││
│ │  Marketing│ │  DATA TABLE                                  ││
│ │  Sales    │ │  CI CHAT AGENT                               ││
│ │  Finance  │ │                                              ││
│ │  HR       │ │                                              ││
│ │  Ops      │ │                                              ││
│ └──────────┘ └──────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Component Tree

```
App
├── AuthProvider (Supabase)
├── Layout
│   ├── Sidebar (NavItems for each department)
│   ├── TopBar (DateRangePicker, BrandFilter, UserMenu, AlertBell)
│   └── MainContent
│       ├── KPICardRow → KPICard (value, label, trend, vs target)
│       ├── ChartSection → PrimaryChart + SecondaryChart (Recharts)
│       ├── DataTable (sortable, paginated)
│       ├── AlertFeed (CI alerts with status badges)
│       └── CIChat (MessageList, MessageInput, SQLPreview)
```

### 5.3 Design Tokens

```
Colors:
  --navy:       #1B3A4B  (sidebar, headers, backgrounds)
  --gold:       #B8943E  (accents, active states, highlights)
  --gold-light: #D4B86A  (hover states)
  --white:      #FFFFFF  (cards, content background)
  --gray-50:    #F9FAFB  (page background)
  --gray-200:   #E5E7EB  (borders, dividers)
  --gray-500:   #6B7280  (secondary text)
  --gray-900:   #111827  (primary text)
  --green:      #10B981  (positive trends, on-target)
  --red:        #EF4444  (negative trends, alerts)
  --amber:      #F59E0B  (warnings, approaching threshold)

Typography: Inter
  KPI values: 32px bold
  KPI labels: 14px gray-500
  Chart titles: 18px semibold
  Body: 14px regular

Spacing:
  Sidebar width: 240px
  Card padding: 24px
  Card gap: 16px
  Section gap: 24px

KPI Card:
  ┌─────────────────────┐
  │  Revenue        ^ 8%│
  │  EUR 42,350         │
  │  ████████░░ 94%     │
  │  Target: EUR 45,000 │
  └─────────────────────┘
```

---

## 6. ETL Pipeline

### 6.1 Scripts

15 ETL scripts in `cockpit/etl/`, each following the same pattern:
1. Read config from cockpit_sources.json
2. Pull data via MCP or API
3. Transform to match Supabase table schema
4. Upsert (INSERT ON CONFLICT UPDATE) keyed on date + brand/location
5. Log to etl_sync_log

### 6.2 Schedule

| Script | Schedule | Source |
|---|---|---|
| etl_meta_ads.py | Every 6h | Meta Ads MCP |
| etl_zoho_crm.py | Every 4h | Zoho CRM MCP |
| etl_ga4.py | Daily 06:00 | Google Analytics MCP |
| etl_gsc.py | Daily 06:00 | Google Search Console MCP |
| etl_wix.py | Daily 07:00 | Wix MCP |
| etl_klaviyo.py | Daily 08:00 | Klaviyo MCP |
| etl_we360.py | Daily 22:00 | We360 API |
| etl_weekly_kpis.py | Monday 09:00 | Google Sheets MCP |
| etl_crm_master.py | Daily 09:00 | Google Sheets MCP |
| etl_aesthetics_sales.py | Daily 20:00 | Google Sheets MCP |
| etl_slimming_sales.py | Daily 20:00 | Google Sheets MCP |
| etl_salary_master.py | 1st of month 10:00 | Google Sheets MCP |
| etl_ebitda.py | 5th of month 10:00 | Google Sheets MCP |
| etl_budget_calendar.py | Monday 08:00 | Google Sheets MCP |
| etl_google_ads.py | Every 6h | Google Ads API |

### 6.3 Shared Utilities

- `supabase_client.py` — Connection + upsert helpers
- `etl_logger.py` — Sync status tracking (writes to etl_sync_log)
- `etl_config.py` — Reads cockpit_sources.json
- `sheets_reader.py` — Google Sheets MCP helper

---

## 7. Carisma Intelligence (CI)

### 7.1 Alert Flow

```
ANALYZE (scheduled) → EMAIL (Gmail MCP) → APPROVE (dashboard or email reply) → EXECUTE (MCP actions)
```

### 7.2 Initial Rules

| Rule | Condition | Severity | Action |
|---|---|---|---|
| CPL Spike | CPL > 1.5x target for 3+ days | critical | Pause underperforming ad sets |
| ROAS Drop | ROAS < 3.0 for 7 days | critical | Review creative fatigue |
| Speed to Lead Breach | Median > 10 min | critical | Alert sales manager |
| Conversion Drop | Rate < 15% (7-day avg) | warning | Review lead quality + rep performance |
| HC% Over Budget | HC% > 45% at any location | warning | Flag to HR + Finance |
| Utilization Low | < 60% at any location | warning | Review scheduling |
| CRM Lead Mismatch | Meta vs CRM diff > 20% | warning | Audit CRM data entry |
| Consult No-Show Spike | Show-up < 70% for a week | warning | Increase reminders |
| Google Reviews Drop | Avg < 4.0 | info | Flag to ops manager |
| Budget Overspend | Actual > 120% of budget | critical | Pause campaigns |

### 7.3 CI Chat Agent

User asks natural language question → CI parses intent → generates SQL → queries Supabase → feeds results to Claude API with context → returns analysis with specific numbers and recommendations.

### 7.4 CI Schedule

| Schedule | Action |
|---|---|
| Daily 10:00 | CI Daily Brief (all rules evaluated) |
| Monday 10:30 | Weekly summary (aggregated trends) |
| 1st of month 11:00 | Monthly executive summary |

---

## 8. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| UI | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password, RLS) |
| ETL | Python 3.11 |
| ETL Scheduling | Claude Code scheduled triggers |
| CI Chat | Claude API (Anthropic SDK) |
| CI Email | Gmail MCP |
| CI Actions | Meta Ads, Trello, WhatsApp MCP |
| Deployment | Vercel (frontend) + Supabase (backend) |

---

## 9. File Structure

```
cockpit/
├── README.md
├── package.json
├── app/                          # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/page.tsx
│   ├── ceo/page.tsx
│   ├── marketing/page.tsx
│   ├── sales/page.tsx
│   ├── finance/page.tsx
│   ├── hr/page.tsx
│   ├── operations/page.tsx
│   └── api/
│       ├── ci/chat/route.ts
│       ├── ci/alerts/route.ts
│       ├── ci/approve/route.ts
│       └── etl/status/route.ts
├── components/
│   ├── layout/ (Sidebar, TopBar, DateRangePicker, BrandFilter)
│   ├── dashboard/ (KPICard, KPICardRow, PrimaryChart, SecondaryChart, DataTable, AlertFeed)
│   ├── ci/ (CIChat, MessageList, MessageInput, SQLPreview)
│   └── ui/ (shadcn/ui components)
├── lib/
│   ├── supabase/ (client, server, types)
│   ├── hooks/ (useKPIData, useDateRange, useBrandFilter, useAlerts)
│   ├── charts/config.ts
│   └── constants/ (departments, brands, design-tokens)
├── etl/
│   ├── requirements.txt
│   ├── shared/ (supabase_client, etl_logger, etl_config, sheets_reader)
│   ├── etl_weekly_kpis.py
│   ├── etl_crm_master.py
│   ├── etl_ebitda.py
│   ├── etl_aesthetics_sales.py
│   ├── etl_slimming_sales.py
│   ├── etl_salary_master.py
│   ├── etl_budget_calendar.py
│   ├── etl_meta_ads.py
│   ├── etl_google_ads.py
│   ├── etl_ga4.py
│   ├── etl_gsc.py
│   ├── etl_klaviyo.py
│   ├── etl_zoho_crm.py
│   ├── etl_we360.py
│   └── etl_wix.py
├── ci/
│   ├── ci_analyzer.py
│   ├── ci_rules.py
│   ├── ci_emailer.py
│   ├── ci_executor.py
│   └── ci_chat.py
├── supabase/
│   ├── migrations/ (001-011 SQL files)
│   └── seed/ (brands, locations, kpi_targets)
├── config/cockpit_sources.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── .env.local
```

---

## 10. Data Sources Reference

All source configurations (spreadsheet IDs, tab names, API endpoints, refresh schedules) are defined in `config/cockpit_sources.json`.

---

**Document Version:** 1.0  
**Approved:** 14 April 2026
