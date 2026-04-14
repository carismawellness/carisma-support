# CEO Cockpit V2 — Upgrade Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the cockpit from a V1 prototype with mock data into a production-grade BI platform with real KPIs from the Weekly KPI Sheet, security fixes, new Sales/CRM split, and full UI/UX polish.

**Architecture:** Fix security vulnerabilities first (SQL injection, hardcoded values), then add React Query as the data layer, then build new dashboard pages (Sales split from CRM), expand Marketing with Growth tab KPIs, add new metrics (MER, CAC, RevPAH, SSG), and polish all UI/UX issues flagged by the expert panel.

**Tech Stack:** Next.js 16, Tailwind v4, Supabase, @tanstack/react-query, Zod, Anthropic SDK (tool-use), shadcn/ui, Recharts

---

## Phase 1: Security & Foundation (Tasks 1–8)

These must be done first — everything else builds on top.

---

### Task 1: Install dependencies

**Files:**
- Modify: `cockpit/package.json`

Add `@tanstack/react-query`, `zod`, and update any needed deps.

```bash
cd cockpit && npm install @tanstack/react-query zod
```

**Commit:** `chore(cockpit): add react-query and zod dependencies`

---

### Task 2: Fix SQL injection — replace raw SQL with structured tool-use

**Files:**
- Modify: `cockpit/app/api/ci/chat/route.ts`

**Problem:** Lines 87-99 execute arbitrary LLM-generated SQL via `execute_readonly_query` using the service-role key (bypasses RLS). This allows data exfiltration from any table.

**Solution:** Replace the raw SQL approach with Anthropic's tool-use feature. Define safe, parameterized query tools that the LLM can call. The backend executes pre-written queries — never arbitrary SQL.

Replace the entire file with a tool-use architecture:

1. Define tools like `get_revenue({ brand, date_from, date_to, group_by })`, `get_marketing_metrics({ brand, date_from, date_to })`, `get_crm_metrics({ brand, date_from, date_to })`, etc.
2. Each tool maps to a pre-defined, parameterized Supabase query
3. Use the **user's authenticated** Supabase client (not service-role) so RLS applies
4. Load conversation history from `ci_chat_history` (last 20 messages) for multi-turn context
5. Stream the final interpretation response

**Tool definitions to implement:**
- `query_revenue` — Revenue by brand/location/week from `sales_weekly`
- `query_marketing` — Spend, CPL, ROAS from `marketing_daily` with platform breakdown
- `query_crm` — STL, conversion, calls from `crm_daily`
- `query_hr` — HC%, utilization, headcount from `hr_weekly`
- `query_operations` — Reviews, complaints from `operations_weekly`
- `query_finance` — EBITDA, budget from `ebitda_monthly` and `budget_vs_actual`
- `get_targets` — Load KPI targets from `kpi_targets` table
- `get_alerts` — Recent CI alerts from `ci_alerts`

Each tool executes a parameterized query (no string interpolation of user input) and returns JSON results. The LLM interprets the results.

**Commit:** `security(cockpit): replace raw SQL in CI chat with structured tool-use`

---

### Task 3: Make all hardcoded values dynamic from database

**Files:**
- Modify: `cockpit/app/api/ci/analyze/route.ts` (lines 23-36 — replace TARGETS object)
- Modify: `cockpit/app/api/ci/summary/route.ts` (lines 9-19 — replace hardcoded targets in prompt)
- Modify: `cockpit/app/api/ci/chat/route.ts` (line 41 — targets in system prompt)
- Modify: `cockpit/lib/hooks/useKPIData.ts` (lines 43-47 — hardcoded brand IDs)
- Create: `cockpit/lib/utils/lookups.ts` — shared server-side lookup functions
- Create: `cockpit/lib/hooks/useLookups.ts` — client-side brand/location lookup hook

**Changes:**

1. **`lookups.ts`** — Server-side functions:
   - `loadTargets()` — queries `kpi_targets` table, returns `Record<string, { target, direction, department, label }>`
   - `loadBrands()` — queries `brands` table, returns `Record<string, number>` (slug → id)
   - `loadLocations()` — queries `locations` table, returns `Record<number, string>` (id → name)

2. **`useLookups.ts`** — Client-side hook:
   - Fetches brands from Supabase on mount, caches in state
   - Returns `{ brandMap, locationMap, loading }`
   - Used by `useKPIData` to resolve brand slug → ID dynamically

3. **`analyze/route.ts`** — Replace `const TARGETS = {...}` with `const targets = await loadTargets()`. Replace hardcoded `brandTargetMap` (lines 72-76) with dynamic brand lookup.

4. **`summary/route.ts`** — Replace hardcoded targets in `SUMMARY_PROMPT` with `const targets = await loadTargets(); const targetStr = formatTargetsForPrompt(targets);`

5. **`useKPIData.ts`** — Replace hardcoded `brandIds` object (lines 43-47) with a lookup from the `brands` table. Cache the brand map at module level to avoid repeated queries.

6. **Cron auth** — In `analyze/route.ts` and `morning-brief/route.ts`, replace `x-cron-secret === SUPABASE_SERVICE_ROLE_KEY` with a new `CRON_SECRET` env var. Add `CRON_SECRET` to `.env.local`.

**Commit:** `feat(cockpit): load targets, brands, locations dynamically from database`

---

### Task 4: Add React Query as data fetching layer

**Files:**
- Create: `cockpit/lib/query-client.tsx` — QueryClientProvider wrapper
- Modify: `cockpit/app/layout.tsx` — wrap app in QueryClientProvider
- Rewrite: `cockpit/lib/hooks/useKPIData.ts` — use `useQuery` from react-query
- Create: `cockpit/lib/hooks/useSupabaseQuery.ts` — generic Supabase query hook

**Changes:**

1. **`query-client.tsx`** — Create a `QueryProvider` component:
```tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 min
        gcTime: 30 * 60 * 1000,   // 30 min cache
        refetchOnWindowFocus: false,
      },
    },
  }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

2. **`layout.tsx`** — Wrap `{children}` with `<QueryProvider>`.

3. **`useKPIData.ts`** — Rewrite to use `useQuery`:
```tsx
export function useKPIData<T>({ table, dateFrom, dateTo, brandFilter, dateColumn, brandColumn }: UseKPIDataOptions) {
  const queryKey = [table, dateFrom.toISOString(), dateTo.toISOString(), brandFilter, dateColumn];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const supabase = createClient();
      // ... same query logic but returns data directly
    },
    select: (data) => ({
      data: data ?? [],
      lastUpdated: computeLastUpdated(data, dateColumn),
    }),
  });
}
```

This gives us: deduplication, stale-while-revalidate, background refetch, request cancellation on unmount, and shared cache across components.

**Commit:** `feat(cockpit): add React Query as data fetching layer`

---

### Task 5: Fix broken Finance page

**Files:**
- Modify: `cockpit/app/finance/page.tsx`

**Fixes:**

1. **Budget column mismatch** (line 84): Change `budget` → `budgeted` in the TypeScript type and all references, OR rename the query to use `.select("budgeted as budget, actual, ...")` — match the migration schema which uses `budgeted`.

2. **YoY computation** (lines 158-162): Instead of hardcoding `yoy: 0`, fetch the prior period's `sales_weekly` data (same approach as CEO page comparison). Compute `yoy = ((currentRevenue - priorRevenue) / priorRevenue) * 100` per location.

3. **HC% from hr_weekly** (lines 158-162): Instead of hardcoding `hc: 0`, fetch latest `hr_weekly` per location and join by `location_id`. This requires a second `useKPIData` call for `hr_weekly` — already available on the page.

4. **Sales funnel math** (sales page, line 138-139): Move this fix to when the Sales page is rewritten in Task 10.

**Commit:** `fix(cockpit): compute real YoY and HC% on finance location table`

---

### Task 6: Fix Department Health radar on CEO page

**Files:**
- Modify: `cockpit/app/ceo/page.tsx` (lines 49-55)

**Problem:** `deptHealthData` is hardcoded static data. Replace with computed scores from real KPIs.

**Approach:** Compute a 0-100 "health score" per department based on how well each department's KPIs meet their targets. Use the data already fetched on the CEO page:

```tsx
const computeDeptHealth = () => {
  const score = (current: number, target: number, lowerIsBetter: boolean) => {
    const ratio = lowerIsBetter ? target / current : current / target;
    return Math.min(Math.max(ratio * 100, 0), 100);
  };
  
  return [
    { department: "Marketing", score: mktData.length > 0 ? score(avgRoas, 5.0, false) : 50 },
    { department: "Sales", score: crmData.length > 0 ? score(avgStl, 5, true) : 50 },
    { department: "Finance", score: salesData.length > 0 ? /* revenue growth score */ : 50 },
    { department: "HR", score: hrData.length > 0 ? score(avgHc, 40, true) : 50 },
    { department: "Operations", score: /* from google reviews */ : 50 },
  ];
};
```

**Commit:** `fix(cockpit): compute department health radar from real KPI data`

---

### Task 7: Add Zod validation to all API routes

**Files:**
- Modify: `cockpit/app/api/ci/chat/route.ts`
- Modify: `cockpit/app/api/ci/analyze/route.ts`
- Modify: `cockpit/app/api/ci/summary/route.ts`
- Modify: `cockpit/app/api/ci/root-cause/route.ts`
- Modify: `cockpit/app/api/ci/morning-brief/route.ts`
- Modify: `cockpit/app/api/annotations/route.ts`
- Modify: `cockpit/app/api/audit/route.ts`
- Create: `cockpit/lib/validations.ts` — shared Zod schemas

**For each route:**
1. Define a Zod schema for the request body
2. Parse the body with `.safeParse()` at the top of the handler
3. Return 400 with error details if validation fails
4. Add rate limiting for AI endpoints: track calls per user in a Map, limit to 20/hour for chat, 5/hour for summary/root-cause

**Commit:** `security(cockpit): add Zod validation and rate limiting to all API routes`

---

### Task 8: UI/UX foundation fixes

**Files:**
- Modify: `cockpit/app/globals.css` (colorblind-safe chart colors)
- Modify: `cockpit/components/dashboard/KPICardRow.tsx` (auto-fit grid)
- Modify: `cockpit/components/dashboard/ExecutiveSummary.tsx` (button-triggered, not auto)
- Modify: `cockpit/components/dashboard/Sparkline.tsx` (add tooltips + aria)
- Modify: `cockpit/components/dashboard/RevenueForecast.tsx` (fix dark mode colors, show skeleton)
- Modify: `cockpit/components/dashboard/AlertFeed.tsx` (fix `bg-white` → `bg-card`)
- Modify: `cockpit/components/layout/TopBar.tsx` (expose date picker on mobile)
- Create: `cockpit/components/ui/skeleton.tsx` — Skeleton loading component
- Modify: all 6 page files — replace mock fallbacks with skeleton states, swap KPIs above Executive Summary

**Specific changes:**

1. **Colorblind-safe chart colors** — In `globals.css`, change `--chart-3: #6B9080` to `--chart-3: #7C5CFC` (purple, distinguishable under deuteranopia/protanopia).

2. **Auto-fit KPI grid** — In `KPICardRow.tsx`, change `lg:grid-cols-5` to `lg:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]`.

3. **Button-triggered Executive Summary** — Remove the `useEffect` auto-fetch (lines 66-70). Keep only the manual button. Add a "Generate Summary" button that calls `fetchSummary()`. Show a placeholder message: "Click to generate AI summary".

4. **Sparkline tooltips** — Add `onMouseMove` handler to the SVG that shows a small tooltip with the nearest data point value. Add `role="img"` and `aria-label` with the trend description.

5. **Dark mode fixes** — In `RevenueForecast.tsx` line 77: change `stroke="#F0EDE8"` to `stroke="var(--border)"`. Line 94: change `fill="#FFFFFF"` to `fill="var(--card)"`. In `AlertFeed.tsx` line 106: change `bg-white` to `bg-card`.

6. **Mobile date picker** — In `TopBar.tsx`, remove `hidden lg:block` from the DateRangePicker wrapper. Show a compact version on mobile.

7. **Skeleton loading** — Create a basic Skeleton component. In each page, replace `isLoading ? mockKpis : [...]` with `isLoading ? <SkeletonKPIRow /> : <KPICardRow ... />`.

8. **Swap order** — In all 6 pages, move `<KPICardRow>` above `<ExecutiveSummary>`.

9. **RevenueForecast skeleton** — Instead of returning `null` on line 56-58, return a Card-shaped skeleton placeholder.

10. **Error boundaries** — Create a simple `ErrorBoundary` component. Wrap chart sections in each page with it.

**Commit:** `fix(cockpit): UI/UX polish — skeletons, dark mode, accessibility, layout fixes`

---

## Phase 2: New Dashboard Pages & KPIs (Tasks 9–14)

---

### Task 9: Create new Sales dashboard page (from Weekly KPI Sheet)

**Files:**
- Rename: `cockpit/app/sales/page.tsx` → `cockpit/app/crm/page.tsx`
- Create: `cockpit/app/sales/page.tsx` — new Sales page
- Modify: `cockpit/lib/constants/departments.ts` — add CRM department
- Modify: `cockpit/components/layout/Sidebar.tsx` — add CRM nav item

**The new Sales page** mirrors the Weekly KPI Sheet "Sales" tab structure. All data comes from `sales_weekly` which already has the columns we need:
- `revenue_ex_vat` — Total sales per location
- `revenue_yoy_delta_pct` — YoY delta
- `retail_pct` — Retail sales %
- `addon_pct` — Add-on sales %
- `hotel_capture_pct` — Hotel guest capture rate

**KPIs (top row):**
1. Total Revenue (sum of `revenue_ex_vat`)
2. YoY Growth (avg `revenue_yoy_delta_pct`)
3. Retail % (avg `retail_pct`, target: 12%)
4. Add-on % (avg `addon_pct`, target: 4%)
5. Hotel Capture % (avg `hotel_capture_pct`, target: 5%)

**Charts:**
1. Revenue by Location (bar chart) — group `sales_weekly` by location, sum revenue
2. YoY Delta by Location (bar chart) — latest `revenue_yoy_delta_pct` per location, with 0% reference line
3. Retail % by Location (bar chart) — with 12% target reference line
4. Add-on % by Location (bar chart) — with 4% target reference line

**Table:**
Location scorecard with columns: Location, Revenue, YoY%, Retail%, Add-on%, Hotel Capture%, AOV

**The CRM page** keeps the existing sales page content (STL, conversion, funnel, rep leaderboard) but is now at `/crm`.

**Navigation:** Add CRM to sidebar between Sales and Marketing. Icon: `Headphones` or `Phone`.

**Commit:** `feat(cockpit): split Sales into Sales + CRM dashboards`

---

### Task 10: Expand Marketing page with Growth tab KPIs

**Files:**
- Modify: `cockpit/app/marketing/page.tsx`
- Create: `cockpit/supabase/migrations/016_add_growth_kpi_tables.sql`

**New tables needed** (because the Growth tab has KPIs not in any existing table):

```sql
-- Marketing growth KPIs per brand per week
CREATE TABLE IF NOT EXISTS growth_weekly (
  week_start DATE NOT NULL,
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  website_sales NUMERIC(12,2) DEFAULT 0,
  aided_sales NUMERIC(12,2) DEFAULT 0,
  non_aided_sales NUMERIC(12,2) DEFAULT 0,
  direct_sales NUMERIC(12,2) DEFAULT 0,
  prev_year_sales NUMERIC(12,2) DEFAULT 0,
  yoy_growth_pct NUMERIC(8,2) DEFAULT 0,
  aov NUMERIC(8,2) DEFAULT 0,
  marketing_spend_google NUMERIC(10,2) DEFAULT 0,
  marketing_spend_meta NUMERIC(10,2) DEFAULT 0,
  marketing_spend_influencer NUMERIC(10,2) DEFAULT 0,
  marketing_spend_email NUMERIC(10,2) DEFAULT 0,
  marketing_spend_content NUMERIC(10,2) DEFAULT 0,
  roas_google NUMERIC(8,2) DEFAULT 0,
  roas_meta NUMERIC(8,2) DEFAULT 0,
  roas_overall NUMERIC(8,2) DEFAULT 0,
  cpl NUMERIC(8,2) DEFAULT 0,
  cpl_google NUMERIC(8,2) DEFAULT 0,
  cpl_meta NUMERIC(8,2) DEFAULT 0,
  cac NUMERIC(8,2) DEFAULT 0,
  cpa NUMERIC(8,2) DEFAULT 0,
  email_attributed_revenue NUMERIC(12,2) DEFAULT 0,
  active_email_subscribers INTEGER DEFAULT 0,
  popup_capture_rate_pct NUMERIC(6,2) DEFAULT 0,
  web_to_lead_pct NUMERIC(6,2) DEFAULT 0,
  lead_to_consult_pct NUMERIC(6,2) DEFAULT 0,
  consult_to_booking_pct NUMERIC(6,2) DEFAULT 0,
  lead_to_booking_pct NUMERIC(6,2) DEFAULT 0,
  total_leads INTEGER DEFAULT 0,
  google_leads INTEGER DEFAULT 0,
  meta_leads INTEGER DEFAULT 0,
  other_leads INTEGER DEFAULT 0,
  maltese_web_traffic INTEGER DEFAULT 0,
  ecomm_sales NUMERIC(12,2) DEFAULT 0,
  membership_count INTEGER DEFAULT 0,
  influencer_posts INTEGER DEFAULT 0,
  UNIQUE(week_start, brand_id)
);

-- Add RLS
ALTER TABLE growth_weekly ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users read growth_weekly" ON growth_weekly FOR SELECT TO authenticated USING (true);
```

**Marketing page redesign:**

**KPIs (top row):**
1. Total Marketing Spend (sum across brands)
2. Blended ROAS
3. Blended CPL
4. MER (Marketing Efficiency Ratio) = Total Revenue / Total Marketing Spend
5. Email Revenue % (email_attributed_revenue / total revenue)

**Section 1: Spend & ROAS by Channel**
- Stacked bar chart: Google / Meta / Influencer / Email / Content spend per week
- Line overlay: Google ROAS + Meta ROAS + Overall ROAS

**Section 2: CPL & CAC by Brand**
- Grouped bar chart: CPL and CAC per brand (Spa, Aesthetics, Slimming)
- Reference lines at target CPL per brand (Spa €8, Aes €12, Slim €10)

**Section 3: Conversion Funnel (Aes/Slim only)**
- Horizontal funnel: Web Traffic → Leads → Consults → Bookings
- Show conversion rates: web-to-lead %, lead-to-consult %, consult-to-booking %

**Section 4: Email & Subscribers**
- Dual-axis: Active subscribers (line) + Email attributed revenue (bar)
- Popup capture rate trend

**Section 5: Campaign Performance Table**
- Wire to real `marketing_daily` data grouped by platform, replacing `mockCampaignData`

**Commit:** `feat(cockpit): expand marketing page with Growth tab KPIs`

---

### Task 11: Add Revenue per Available Hour (RevPAH)

**Files:**
- Modify: `cockpit/app/hr/page.tsx` — add RevPAH KPI and chart
- The `therapist_utilization` table already has `available_hours` and `booked_hours`

**KPI:** RevPAH = Location Revenue / Sum(available_hours per location)

**Implementation:**
1. Add a `useKPIData` call for `therapist_utilization` (dateColumn: `week_start`)
2. Add a `useKPIData` call for `sales_weekly` to get location revenue
3. Compute RevPAH per location: join by `location_id`, divide revenue by available_hours
4. Add RevPAH as a KPI card (target: €35/hour)
5. Add a bar chart "RevPAH by Location" with a €35 reference line

**Also add to CEO page** as a secondary metric.

**Commit:** `feat(cockpit): add Revenue per Available Hour (RevPAH) to HR page`

---

### Task 12: Add Same-Store Growth (SSG) isolation

**Files:**
- Modify: `cockpit/supabase/migrations/016_add_growth_kpi_tables.sql` — add `opened_date` to locations table
- Modify: `cockpit/app/finance/page.tsx` — add SSG chart
- Modify: `cockpit/app/ceo/page.tsx` — add SSG KPI

**Approach:**
1. Add `opened_date DATE` column to `locations` table via migration
2. In the Finance page, when computing revenue trends, split locations into "mature" (opened > 12 months ago) and "new"
3. SSG = revenue growth from mature locations only
4. Show a line chart: Total Growth vs Same-Store Growth over time
5. Add SSG as a KPI on the CEO page

**Commit:** `feat(cockpit): add same-store growth isolation`

---

### Task 13: Add Contribution Margin per Location

**Files:**
- Modify: `cockpit/app/finance/page.tsx`

**Approach:** Combine `sales_weekly.revenue_ex_vat` with `hr_weekly.total_salary_cost` per location:
- Contribution Margin = Revenue - Salary Cost (per location)
- Margin % = (Revenue - Salary Cost) / Revenue * 100

Add a horizontal bar chart showing margin % per location, sorted descending. Color code: green (>20%), amber (10-20%), red (<10%).

**Commit:** `feat(cockpit): add contribution margin per location to finance page`

---

### Task 14: Add Clickable KPI Drill-Down

**Files:**
- Modify: `cockpit/components/dashboard/KPICard.tsx` — make cards clickable
- Modify: `cockpit/app/ceo/page.tsx` — pass drill-down targets

**Approach:**
1. Add optional `href?: string` prop to `KPICard`
2. When `href` is provided, wrap the card in a `<Link>` (next/link) with the URL
3. Add `cursor-pointer` styling when clickable
4. On the CEO page, map each KPI to its destination:
   - "Total Revenue" → `/finance`
   - "Blended ROAS" → `/marketing`
   - "Conversion Rate" → `/crm`
   - "Company HC%" → `/hr`
   - "Speed to Lead" → `/crm`

**Commit:** `feat(cockpit): add clickable KPI drill-down from CEO page`

---

## Phase 3: Additional Features (Tasks 15–19)

---

### Task 15: Push notifications via email for critical alerts

**Files:**
- Modify: `cockpit/app/api/ci/analyze/route.ts` — send email after generating critical alerts

**Approach:**
1. After inserting alerts (line 271), check for any with severity "critical"
2. If critical alerts exist, call the Gmail MCP to send an email:
   - To: CEO email (from env var `CEO_EMAIL`)
   - Subject: "🚨 Carisma Cockpit — Critical Alert"
   - Body: formatted list of critical alerts with metrics and recommendations
3. Update alert status to "emailed" after sending
4. Add `CEO_EMAIL` to `.env.local`

**Commit:** `feat(cockpit): send email push notifications for critical CI alerts`

---

### Task 16: Customer Retention & CLV schemas (future-ready)

**Files:**
- Create: `cockpit/supabase/migrations/017_add_customer_tables.sql`

**Note:** Cannot connect to Fresha/Lapis yet. Create the schema and mock data so the dashboard is ready when data flows.

```sql
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  external_id TEXT,
  name TEXT,
  email TEXT,
  first_visit_date DATE,
  last_visit_date DATE,
  total_spend NUMERIC(12,2) DEFAULT 0,
  visit_count INTEGER DEFAULT 0,
  primary_brand_id INTEGER REFERENCES brands(id),
  primary_location_id INTEGER REFERENCES locations(id),
  referral_source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  location_id INTEGER REFERENCES locations(id),
  brand_id INTEGER REFERENCES brands(id),
  staff_id INTEGER REFERENCES staff(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'booked', -- booked, attended, no_show, cancelled
  treatment_type TEXT,
  duration_min INTEGER,
  revenue NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Add RLS policies and seed some sample data (50 customers, 200 appointments across brands).

Create a simple `/cockpit/app/customers/page.tsx` with:
- KPIs: Total Customers, Avg CLV, Retention Rate, Avg Visits
- Chart: CLV by Brand (bar)
- Chart: Retention Cohort (basic heatmap placeholder)
- Table: Top customers by total spend

**Commit:** `feat(cockpit): add customer & appointment schemas with CLV dashboard`

---

### Task 17: Appointment Pipeline (next 7 days)

**Files:**
- Modify: `cockpit/app/ceo/page.tsx` — add pipeline widget
- Create: `cockpit/components/dashboard/AppointmentPipeline.tsx`

**Approach:** Use the `appointments` table created in Task 16. Query appointments where `scheduled_at` is within the next 7 days, grouped by day and location.

Show a horizontal stacked bar chart: each bar is a day (Mon-Sun), stacked by location. Shows booking density. If a day has unusually low bookings compared to the same day last week, flag it with an amber indicator.

If no real data exists (appointments table empty), show a placeholder: "Connect Fresha/Lapis to see your booking pipeline."

**Commit:** `feat(cockpit): add 7-day appointment pipeline widget`

---

### Task 18: MER on Marketing page

**Files:**
- Modify: `cockpit/app/marketing/page.tsx`

**MER (Marketing Efficiency Ratio)** = Total Revenue / Total Marketing Spend.

This is already partially computed (ROAS is per-channel). MER is the blended version including organic revenue:
1. Total Revenue comes from `sales_weekly` (sum all revenue in period)
2. Total Marketing Spend comes from `marketing_daily` (sum all spend)
3. MER = Total Revenue / Total Spend

Add as the 4th KPI card on the marketing page (target: >8x). Already included in Task 10's design — ensure it's wired up.

**Commit:** `feat(cockpit): add MER to marketing page KPIs`

---

### Task 19: Fix remaining CRM page (moved from sales)

**Files:**
- Modify: `cockpit/app/crm/page.tsx` (was sales/page.tsx)

**Fixes:**
1. Fix funnel math (line 138): Replace `Math.round(totalAppointments * (avgConv / 100))` with actual conversions from `crm_daily` — sum `total_leads * conversion_rate_pct / 100` or better yet, track actual sales count (if available).
2. Wire campaign table to real data (currently uses `mockCampaignData`)
3. Update page title from "Sales / CRM Dashboard" to "CRM Dashboard"
4. Update sidebar label and route

**Commit:** `fix(cockpit): fix CRM funnel math and wire real campaign data`

---

## Phase 4: Remaining Technical Debt (Tasks 20–22)

---

### Task 20: AI response streaming

**Files:**
- Modify: `cockpit/app/api/ci/chat/route.ts`
- Modify: `cockpit/components/ci/CIChat.tsx`
- Modify: `cockpit/components/ci/MessageList.tsx`

**Approach:** Use Anthropic's streaming API for the interpretation step:
1. In the chat route, after getting tool results, stream the final response using `stream: true`
2. Return a `ReadableStream` instead of JSON
3. In the CIChat component, consume the stream with `getReader()` and update the message incrementally
4. Show text appearing word-by-word in the chat panel

**Commit:** `feat(cockpit): stream AI responses in CI chat`

---

### Task 21: Conversation memory for CI Chat

**Files:**
- Modify: `cockpit/app/api/ci/chat/route.ts`

**Already partially done in Task 2 (tool-use rewrite).** Ensure:
1. Load last 20 messages from `ci_chat_history` for the current user
2. Include them in the `messages` array sent to Anthropic
3. This enables follow-up questions like "break that down by location"

**Commit:** `feat(cockpit): add conversation memory to CI chat`

---

### Task 22: Surface unused data — ga4, gsc, therapist_utilization, consult_funnel

**Files:**
- Modify: `cockpit/app/marketing/page.tsx` — add organic traffic section from ga4_daily/gsc_daily
- Modify: `cockpit/app/operations/page.tsx` — surface consult_funnel.aov, course_conversions, showup_pct

**Marketing additions:**
- New section "Organic Performance": Sessions, New Users, Bounce Rate from `ga4_daily`
- GSC: Clicks, Impressions, Avg Position from `gsc_daily`

**Operations additions:**
- Show `aov` (Average Order Value) as a KPI
- Show `showup_pct` (Show-up Rate) as a KPI
- Show `course_conversions` and `course_conversion_pct` in the funnel chart

**Commit:** `feat(cockpit): surface ga4, gsc, and full consult_funnel data`

---

## Verification

After all tasks:

1. **TypeScript build:** `cd cockpit && npx tsc --noEmit` — zero errors
2. **Production build:** `cd cockpit && npm run build` — completes successfully
3. **Security check:** Verify CI Chat no longer executes arbitrary SQL — test by asking "DROP TABLE brands" and confirming it uses tool-use instead
4. **Data flow:** Verify each page loads with skeleton states, falls back gracefully when Supabase has no data
5. **Dark mode:** Toggle dark mode on every page, verify no white artifacts
6. **Mobile:** Test on 375px viewport — date picker accessible, sidebar drawer works, KPIs stack properly
7. **New pages:** `/sales` shows location-level data, `/crm` shows the old STL/funnel/rep data
8. **Marketing Growth KPIs:** Verify Growth tab metrics appear (will show empty until ETL populates `growth_weekly`)

---

## Migration Execution Order

Run these SQL files in the Supabase SQL Editor in order:
1. `016_add_growth_kpi_tables.sql` (growth_weekly table + locations.opened_date)
2. `017_add_customer_tables.sql` (customers + appointments tables)

---

## Environment Variables to Add

```env
CRON_SECRET=<generate-random-64-char-token>
CEO_EMAIL=mert@carismawellness.com
```
