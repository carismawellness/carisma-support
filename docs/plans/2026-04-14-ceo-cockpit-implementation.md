# Carisma CEO Cockpit — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full-stack CEO business intelligence dashboard with Supabase backend, Next.js frontend, 15 ETL scripts, and Carisma Intelligence (CI) engine — all in `cockpit/`.

**Architecture:** Supabase (PostgreSQL + Auth + RLS) stores all KPI data. Python ETL scripts pull from Google Sheets, Meta Ads, GA4, GSC, Klaviyo, Zoho CRM, We360, and Wix via MCP on cron schedules and upsert into Supabase. Next.js 14 App Router frontend with Tailwind + shadcn/ui + Recharts renders 6 dashboard views (CEO, Marketing, Sales, Finance, HR, Operations) with brand/date filtering. CI engine analyzes data, emails alerts via Gmail MCP, and executes approved actions via Meta/Trello/WhatsApp MCP.

**Tech Stack:** Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Recharts, Supabase (Postgres + Auth), Python 3.11, Claude API (Anthropic SDK), Gmail/Meta/Trello/WhatsApp MCP

**Design doc:** `docs/plans/2026-04-14-ceo-cockpit-design.md`
**Data sources config:** `config/cockpit_sources.json`

---

## Phase 1: Project Scaffold + Supabase Database (Tasks 1-5)

### Task 1: Initialize Next.js project in cockpit/

**Files:**
- Create: `cockpit/package.json`
- Create: `cockpit/tsconfig.json`
- Create: `cockpit/next.config.js`
- Create: `cockpit/tailwind.config.ts`
- Create: `cockpit/postcss.config.js`
- Create: `cockpit/.env.local.example`
- Create: `cockpit/README.md`

**Step 1: Scaffold Next.js with TypeScript + Tailwind**

```bash
cd cockpit
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

Accept defaults. This creates the App Router structure.

**Step 2: Install dependencies**

```bash
cd cockpit
npm install @supabase/supabase-js @supabase/ssr recharts date-fns lucide-react @anthropic-ai/sdk clsx tailwind-merge class-variance-authority
```

**Step 3: Install shadcn/ui**

```bash
cd cockpit
npx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Slate
- CSS variables: Yes

Then install the components we need:

```bash
npx shadcn@latest add button card badge select dialog dropdown-menu separator avatar tabs table input scroll-area tooltip popover calendar
```

**Step 4: Create .env.local.example**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# Claude API (for CI Chat)
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_KEY
```

**Step 5: Update tailwind.config.ts with Carisma design tokens**

Replace the `extend` block in `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1B3A4B",
          light: "#2A5066",
          dark: "#0F2433",
        },
        gold: {
          DEFAULT: "#B8943E",
          light: "#D4B86A",
          dark: "#8A6F2E",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

**Step 6: Commit**

```bash
git add cockpit/
git commit -m "feat(cockpit): scaffold Next.js 14 + Tailwind + shadcn/ui project"
```

---

### Task 2: Create Supabase migration — dimension tables + auth

**Files:**
- Create: `cockpit/supabase/migrations/001_create_dimensions.sql`
- Create: `cockpit/supabase/migrations/002_create_profiles.sql`

**Step 1: Write dimension tables migration**

Create `cockpit/supabase/migrations/001_create_dimensions.sql`:

```sql
-- Brands
CREATE TABLE brands (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

-- Locations
CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Staff
CREATE TABLE staff (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  location_id INTEGER REFERENCES locations(id),
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_staff_brand ON staff(brand_id);
CREATE INDEX idx_staff_location ON staff(location_id);
CREATE INDEX idx_locations_brand ON locations(brand_id);
```

**Step 2: Write profiles + auth migration**

Create `cockpit/supabase/migrations/002_create_profiles.sql`:

```sql
-- User role enum
CREATE TYPE user_role AS ENUM (
  'ceo', 'marketing_head', 'sales_head', 'finance_head',
  'hr_head', 'ops_head', 'viewer'
);

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  brands_access TEXT[] NOT NULL DEFAULT ARRAY['spa', 'aesthetics', 'slimming'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'viewer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

**Step 3: Commit**

```bash
git add cockpit/supabase/
git commit -m "feat(cockpit): add dimension tables + auth profiles migrations"
```

---

### Task 3: Create Supabase migrations — data tables (sales, CRM, marketing)

**Files:**
- Create: `cockpit/supabase/migrations/003_create_sales.sql`
- Create: `cockpit/supabase/migrations/004_create_crm.sql`
- Create: `cockpit/supabase/migrations/005_create_marketing.sql`

**Step 1: Write sales tables migration**

Create `cockpit/supabase/migrations/003_create_sales.sql`:

```sql
CREATE TABLE sales_weekly (
  id SERIAL PRIMARY KEY,
  week_start DATE NOT NULL,
  location_id INTEGER NOT NULL REFERENCES locations(id),
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  revenue_ex_vat NUMERIC(12,2),
  revenue_yoy_delta_pct NUMERIC(6,2),
  retail_pct NUMERIC(5,2),
  addon_pct NUMERIC(5,2),
  hotel_capture_pct NUMERIC(5,2),
  etl_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(week_start, location_id)
);

CREATE TABLE sales_by_rep (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  staff_id INTEGER NOT NULL REFERENCES staff(id),
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  revenue NUMERIC(12,2),
  bookings_count INTEGER,
  deposits_collected NUMERIC(12,2),
  deposit_pct NUMERIC(5,2),
  UNIQUE(date, staff_id)
);

CREATE INDEX idx_sales_weekly_brand ON sales_weekly(brand_id, week_start);
CREATE INDEX idx_sales_by_rep_date ON sales_by_rep(date, brand_id);
```

**Step 2: Write CRM tables migration**

Create `cockpit/supabase/migrations/004_create_crm.sql`:

```sql
CREATE TABLE crm_daily (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  total_leads INTEGER,
  leads_meta INTEGER,
  leads_crm INTEGER,
  leads_in_hours INTEGER,
  leads_out_hours INTEGER,
  speed_to_lead_median_min NUMERIC(8,2),
  speed_to_lead_mean_min NUMERIC(8,2),
  conversion_rate_pct NUMERIC(5,2),
  total_calls INTEGER,
  outbound_calls INTEGER,
  calls_outside_hours INTEGER,
  appointments_booked INTEGER,
  etl_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(date, brand_id)
);

CREATE TABLE crm_by_rep (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  staff_id INTEGER NOT NULL REFERENCES staff(id),
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  leads_assigned INTEGER,
  calls_made INTEGER,
  appointments_booked INTEGER,
  conversions INTEGER,
  conversion_rate_pct NUMERIC(5,2),
  speed_to_lead_avg_min NUMERIC(8,2),
  UNIQUE(date, staff_id)
);

CREATE TABLE speed_to_lead_distribution (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  bucket TEXT NOT NULL,
  count INTEGER NOT NULL,
  pct NUMERIC(5,2),
  UNIQUE(date, brand_id, bucket)
);

CREATE INDEX idx_crm_daily_brand ON crm_daily(brand_id, date);
CREATE INDEX idx_crm_by_rep_date ON crm_by_rep(date, brand_id);
CREATE INDEX idx_stl_dist ON speed_to_lead_distribution(date, brand_id);
```

**Step 3: Write marketing tables migration**

Create `cockpit/supabase/migrations/005_create_marketing.sql`:

```sql
CREATE TABLE marketing_daily (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  platform TEXT NOT NULL,
  spend NUMERIC(10,2),
  impressions INTEGER,
  clicks INTEGER,
  leads INTEGER,
  cpl NUMERIC(8,2),
  roas NUMERIC(6,2),
  ctr_pct NUMERIC(5,2),
  cpc NUMERIC(8,2),
  etl_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(date, brand_id, platform)
);

CREATE TABLE ga4_daily (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  sessions INTEGER,
  total_users INTEGER,
  new_users INTEGER,
  page_views INTEGER,
  avg_session_duration_sec NUMERIC(8,2),
  bounce_rate_pct NUMERIC(5,2),
  conversions INTEGER,
  UNIQUE(date, brand_id)
);

CREATE TABLE gsc_daily (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  clicks INTEGER,
  impressions INTEGER,
  ctr_pct NUMERIC(5,2),
  avg_position NUMERIC(6,2),
  UNIQUE(date, brand_id)
);

CREATE TABLE klaviyo_campaigns (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  campaign_name TEXT NOT NULL,
  sends INTEGER,
  opens INTEGER,
  clicks INTEGER,
  revenue NUMERIC(10,2),
  revenue_pct_of_total NUMERIC(5,2),
  UNIQUE(date, brand_id, campaign_name)
);

CREATE INDEX idx_marketing_daily ON marketing_daily(brand_id, date, platform);
CREATE INDEX idx_ga4_daily ON ga4_daily(brand_id, date);
CREATE INDEX idx_gsc_daily ON gsc_daily(brand_id, date);
CREATE INDEX idx_klaviyo ON klaviyo_campaigns(brand_id, date);
```

**Step 4: Commit**

```bash
git add cockpit/supabase/migrations/
git commit -m "feat(cockpit): add sales, CRM, and marketing table migrations"
```

---

### Task 4: Create Supabase migrations — finance, HR, operations, CI, ETL

**Files:**
- Create: `cockpit/supabase/migrations/006_create_finance.sql`
- Create: `cockpit/supabase/migrations/007_create_hr.sql`
- Create: `cockpit/supabase/migrations/008_create_operations.sql`
- Create: `cockpit/supabase/migrations/009_create_ci.sql`
- Create: `cockpit/supabase/migrations/010_create_etl_log.sql`
- Create: `cockpit/supabase/migrations/011_create_kpi_targets.sql`

**Step 1: Write finance tables**

Create `cockpit/supabase/migrations/006_create_finance.sql`:

```sql
CREATE TABLE ebitda_monthly (
  id SERIAL PRIMARY KEY,
  month DATE NOT NULL,
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  revenue NUMERIC(12,2),
  cogs NUMERIC(12,2),
  gross_profit NUMERIC(12,2),
  opex NUMERIC(12,2),
  ebitda NUMERIC(12,2),
  ebitda_margin_pct NUMERIC(5,2),
  UNIQUE(month, brand_id)
);

CREATE TABLE budget_vs_actual (
  id SERIAL PRIMARY KEY,
  month DATE NOT NULL,
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  department TEXT NOT NULL,
  budgeted NUMERIC(12,2),
  actual NUMERIC(12,2),
  variance_pct NUMERIC(6,2),
  UNIQUE(month, brand_id, department)
);

CREATE INDEX idx_ebitda ON ebitda_monthly(brand_id, month);
CREATE INDEX idx_budget ON budget_vs_actual(brand_id, month);
```

**Step 2: Write HR tables**

Create `cockpit/supabase/migrations/007_create_hr.sql`:

```sql
CREATE TABLE hr_weekly (
  id SERIAL PRIMARY KEY,
  week_start DATE NOT NULL,
  location_id INTEGER NOT NULL REFERENCES locations(id),
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  total_salary_cost NUMERIC(12,2),
  revenue NUMERIC(12,2),
  hc_pct NUMERIC(5,2),
  utilization_pct NUMERIC(5,2),
  headcount INTEGER,
  joiners INTEGER DEFAULT 0,
  leavers INTEGER DEFAULT 0,
  UNIQUE(week_start, location_id)
);

CREATE TABLE we360_daily (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  staff_id INTEGER NOT NULL REFERENCES staff(id),
  online_time_min INTEGER,
  active_time_min INTEGER,
  idle_time_min INTEGER,
  productive_time_min INTEGER,
  unproductive_time_min INTEGER,
  neutral_time_min INTEGER,
  email_time_min INTEGER,
  productivity_pct NUMERIC(5,2),
  UNIQUE(date, staff_id)
);

CREATE TABLE therapist_utilization (
  id SERIAL PRIMARY KEY,
  week_start DATE NOT NULL,
  staff_id INTEGER NOT NULL REFERENCES staff(id),
  location_id INTEGER NOT NULL REFERENCES locations(id),
  available_hours NUMERIC(6,2),
  booked_hours NUMERIC(6,2),
  utilization_pct NUMERIC(5,2),
  bookings_count INTEGER,
  UNIQUE(week_start, staff_id)
);

CREATE INDEX idx_hr_weekly ON hr_weekly(brand_id, week_start);
CREATE INDEX idx_we360 ON we360_daily(date, staff_id);
CREATE INDEX idx_therapist_util ON therapist_utilization(week_start, staff_id);
```

**Step 3: Write operations tables**

Create `cockpit/supabase/migrations/008_create_operations.sql`:

```sql
CREATE TABLE operations_weekly (
  id SERIAL PRIMARY KEY,
  week_start DATE NOT NULL,
  location_id INTEGER NOT NULL REFERENCES locations(id),
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  google_reviews_count INTEGER,
  google_reviews_avg NUMERIC(3,2),
  complaints_count INTEGER DEFAULT 0,
  UNIQUE(week_start, location_id)
);

CREATE TABLE consult_funnel (
  id SERIAL PRIMARY KEY,
  week_start DATE NOT NULL,
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  consults_booked INTEGER,
  consults_attended INTEGER,
  showup_pct NUMERIC(5,2),
  conversions INTEGER,
  conversion_pct NUMERIC(5,2),
  aov NUMERIC(8,2),
  course_conversions INTEGER,
  course_conversion_pct NUMERIC(5,2),
  UNIQUE(week_start, brand_id)
);

CREATE INDEX idx_ops_weekly ON operations_weekly(brand_id, week_start);
CREATE INDEX idx_consult ON consult_funnel(brand_id, week_start);
```

**Step 4: Write CI tables**

Create `cockpit/supabase/migrations/009_create_ci.sql`:

```sql
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical');
CREATE TYPE alert_status AS ENUM ('pending', 'emailed', 'approved', 'executed', 'dismissed');

CREATE TABLE ci_alerts (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  department TEXT NOT NULL,
  brand_id INTEGER REFERENCES brands(id),
  severity alert_severity NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  status alert_status NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  action_payload JSONB
);

CREATE TABLE ci_chat_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  message TEXT NOT NULL,
  sql_query TEXT,
  context JSONB
);

CREATE INDEX idx_ci_alerts_status ON ci_alerts(status, created_at DESC);
CREATE INDEX idx_ci_alerts_dept ON ci_alerts(department, created_at DESC);
CREATE INDEX idx_ci_chat ON ci_chat_history(user_id, created_at DESC);
```

**Step 5: Write ETL log table**

Create `cockpit/supabase/migrations/010_create_etl_log.sql`:

```sql
CREATE TABLE etl_sync_log (
  id SERIAL PRIMARY KEY,
  source_name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'partial', 'failed')),
  rows_upserted INTEGER DEFAULT 0,
  error_message TEXT,
  duration_sec NUMERIC(8,2)
);

CREATE INDEX idx_etl_log ON etl_sync_log(source_name, started_at DESC);
```

**Step 6: Write KPI targets table + seed data**

Create `cockpit/supabase/migrations/011_create_kpi_targets.sql`:

```sql
CREATE TABLE kpi_targets (
  id SERIAL PRIMARY KEY,
  department TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  target_value NUMERIC(10,2) NOT NULL,
  comparison TEXT NOT NULL CHECK (comparison IN ('lt', 'gt', 'eq', 'between')),
  brand_id INTEGER REFERENCES brands(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(department, metric_name, brand_id)
);
```

**Step 7: Commit**

```bash
git add cockpit/supabase/migrations/
git commit -m "feat(cockpit): add finance, HR, operations, CI, ETL, and KPI target migrations"
```

---

### Task 5: Create Supabase seed data + RLS policies

**Files:**
- Create: `cockpit/supabase/seed/001_brands.sql`
- Create: `cockpit/supabase/seed/002_locations.sql`
- Create: `cockpit/supabase/seed/003_kpi_targets.sql`
- Create: `cockpit/supabase/migrations/012_create_rls.sql`

**Step 1: Write brand seed data**

Create `cockpit/supabase/seed/001_brands.sql`:

```sql
INSERT INTO brands (slug, name) VALUES
  ('spa', 'Carisma Spa & Wellness'),
  ('aesthetics', 'Carisma Aesthetics'),
  ('slimming', 'Carisma Slimming')
ON CONFLICT (slug) DO NOTHING;
```

**Step 2: Write location seed data**

Create `cockpit/supabase/seed/002_locations.sql`:

```sql
INSERT INTO locations (brand_id, slug, name) VALUES
  ((SELECT id FROM brands WHERE slug = 'spa'), 'inter', 'InterContinental'),
  ((SELECT id FROM brands WHERE slug = 'spa'), 'hugos', 'Hugo''s'),
  ((SELECT id FROM brands WHERE slug = 'spa'), 'hyatt', 'Hyatt'),
  ((SELECT id FROM brands WHERE slug = 'spa'), 'ramla', 'Ramla Bay'),
  ((SELECT id FROM brands WHERE slug = 'spa'), 'labranda', 'Labranda'),
  ((SELECT id FROM brands WHERE slug = 'spa'), 'odycy', 'Odycy'),
  ((SELECT id FROM brands WHERE slug = 'spa'), 'excelsior', 'Excelsior'),
  ((SELECT id FROM brands WHERE slug = 'spa'), 'novotel', 'Novotel'),
  ((SELECT id FROM brands WHERE slug = 'aesthetics'), 'aesthetics-clinic', 'Aesthetics Clinic'),
  ((SELECT id FROM brands WHERE slug = 'slimming'), 'slimming-clinic', 'Slimming Clinic')
ON CONFLICT (slug) DO NOTHING;
```

**Step 3: Write KPI target seed data**

Create `cockpit/supabase/seed/003_kpi_targets.sql`:

```sql
-- Sales targets
INSERT INTO kpi_targets (department, metric_name, target_value, comparison) VALUES
  ('sales', 'retail_pct', 12.0, 'gt'),
  ('sales', 'addon_pct', 4.0, 'gt'),
  ('sales', 'hotel_capture_pct', 5.0, 'gt');

-- Marketing targets
INSERT INTO kpi_targets (department, metric_name, target_value, comparison) VALUES
  ('marketing', 'roas', 5.0, 'gt'),
  ('marketing', 'email_revenue_pct', 35.0, 'gt'),
  ('marketing', 'popup_capture_pct', 8.0, 'gt');

-- Marketing targets per brand
INSERT INTO kpi_targets (department, metric_name, target_value, comparison, brand_id) VALUES
  ('marketing', 'cpl', 8.0, 'lt', (SELECT id FROM brands WHERE slug = 'spa')),
  ('marketing', 'cpl', 12.0, 'lt', (SELECT id FROM brands WHERE slug = 'aesthetics')),
  ('marketing', 'cpl', 10.0, 'lt', (SELECT id FROM brands WHERE slug = 'slimming'));

-- CRM targets
INSERT INTO kpi_targets (department, metric_name, target_value, comparison) VALUES
  ('crm', 'speed_to_lead_min', 5.0, 'lt'),
  ('crm', 'conversion_rate_pct', 25.0, 'gt'),
  ('crm', 'workable_leads_per_sdr', 60.0, 'gt');

-- HR targets
INSERT INTO kpi_targets (department, metric_name, target_value, comparison) VALUES
  ('hr', 'hc_pct', 40.0, 'lt'),
  ('hr', 'utilization_pct', 75.0, 'gt'),
  ('hr', 'therapist_mgmt_ratio', 3.0, 'gt');

-- Aesthetics targets
INSERT INTO kpi_targets (department, metric_name, target_value, comparison) VALUES
  ('operations', 'consult_conversion_pct_aes', 50.0, 'gt'),
  ('operations', 'aov_aes', 245.0, 'gt'),
  ('operations', 'consults_per_week_aes', 70.0, 'gt');

-- Slimming targets
INSERT INTO kpi_targets (department, metric_name, target_value, comparison) VALUES
  ('operations', 'course_conversion_pct', 65.0, 'gt'),
  ('operations', 'max_course_conversion_pct', 12.5, 'gt'),
  ('operations', 'bookings_per_therapist', 45.0, 'gt'),
  ('operations', 'consult_showup_pct', 85.0, 'gt'),
  ('operations', 'retail_pct_slim', 20.0, 'gt');
```

**Step 4: Write RLS policies**

Create `cockpit/supabase/migrations/012_create_rls.sql`:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_weekly ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_by_rep ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_by_rep ENABLE ROW LEVEL SECURITY;
ALTER TABLE speed_to_lead_distribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE ga4_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsc_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE klaviyo_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ebitda_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_vs_actual ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_weekly ENABLE ROW LEVEL SECURITY;
ALTER TABLE we360_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_utilization ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations_weekly ENABLE ROW LEVEL SECURITY;
ALTER TABLE consult_funnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE ci_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ci_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE etl_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_targets ENABLE ROW LEVEL SECURITY;

-- Helper: get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get current user brand access
CREATE OR REPLACE FUNCTION get_user_brands()
RETURNS TEXT[] AS $$
  SELECT brands_access FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- CEO sees everything; others see their brands
-- Dimension tables: everyone can read
CREATE POLICY "brands_read" ON brands FOR SELECT USING (true);
CREATE POLICY "locations_read" ON locations FOR SELECT USING (true);
CREATE POLICY "staff_read" ON staff FOR SELECT USING (true);
CREATE POLICY "kpi_targets_read" ON kpi_targets FOR SELECT USING (true);

-- Profiles: users see their own
CREATE POLICY "profiles_own" ON profiles FOR SELECT
  USING (id = auth.uid() OR get_user_role() = 'ceo');

-- Data tables: filter by brand access
-- CEO + relevant department head
CREATE POLICY "sales_weekly_read" ON sales_weekly FOR SELECT USING (
  get_user_role() = 'ceo'
  OR (get_user_role() IN ('sales_head', 'finance_head') AND
      (SELECT slug FROM brands WHERE id = brand_id) = ANY(get_user_brands()))
);

CREATE POLICY "sales_by_rep_read" ON sales_by_rep FOR SELECT USING (
  get_user_role() = 'ceo'
  OR (get_user_role() = 'sales_head' AND
      (SELECT slug FROM brands WHERE id = brand_id) = ANY(get_user_brands()))
);

CREATE POLICY "crm_daily_read" ON crm_daily FOR SELECT USING (
  get_user_role() = 'ceo'
  OR (get_user_role() = 'sales_head' AND
      (SELECT slug FROM brands WHERE id = brand_id) = ANY(get_user_brands()))
);

CREATE POLICY "crm_by_rep_read" ON crm_by_rep FOR SELECT USING (
  get_user_role() = 'ceo'
  OR (get_user_role() = 'sales_head' AND
      (SELECT slug FROM brands WHERE id = brand_id) = ANY(get_user_brands()))
);

CREATE POLICY "stl_dist_read" ON speed_to_lead_distribution FOR SELECT USING (
  get_user_role() = 'ceo'
  OR (get_user_role() = 'sales_head' AND
      (SELECT slug FROM brands WHERE id = brand_id) = ANY(get_user_brands()))
);

CREATE POLICY "marketing_daily_read" ON marketing_daily FOR SELECT USING (
  get_user_role() = 'ceo'
  OR (get_user_role() = 'marketing_head' AND
      (SELECT slug FROM brands WHERE id = brand_id) = ANY(get_user_brands()))
);

CREATE POLICY "ga4_daily_read" ON ga4_daily FOR SELECT USING (
  get_user_role() = 'ceo'
  OR (get_user_role() = 'marketing_head' AND
      (SELECT slug FROM brands WHERE id = brand_id) = ANY(get_user_brands()))
);

CREATE POLICY "gsc_daily_read" ON gsc_daily FOR SELECT USING (
  get_user_role() = 'ceo'
  OR (get_user_role() = 'marketing_head' AND
      (SELECT slug FROM brands WHERE id = brand_id) = ANY(get_user_brands()))
);

CREATE POLICY "klaviyo_read" ON klaviyo_campaigns FOR SELECT USING (
  get_user_role() = 'ceo'
  OR (get_user_role() = 'marketing_head' AND
      (SELECT slug FROM brands WHERE id = brand_id) = ANY(get_user_brands()))
);

CREATE POLICY "ebitda_read" ON ebitda_monthly FOR SELECT USING (
  get_user_role() IN ('ceo', 'finance_head')
);

CREATE POLICY "budget_read" ON budget_vs_actual FOR SELECT USING (
  get_user_role() IN ('ceo', 'finance_head')
);

CREATE POLICY "hr_weekly_read" ON hr_weekly FOR SELECT USING (
  get_user_role() IN ('ceo', 'hr_head', 'finance_head')
);

CREATE POLICY "we360_read" ON we360_daily FOR SELECT USING (
  get_user_role() IN ('ceo', 'hr_head')
);

CREATE POLICY "therapist_util_read" ON therapist_utilization FOR SELECT USING (
  get_user_role() IN ('ceo', 'hr_head', 'ops_head')
);

CREATE POLICY "ops_weekly_read" ON operations_weekly FOR SELECT USING (
  get_user_role() = 'ceo'
  OR (get_user_role() = 'ops_head' AND
      (SELECT slug FROM brands WHERE id = brand_id) = ANY(get_user_brands()))
);

CREATE POLICY "consult_funnel_read" ON consult_funnel FOR SELECT USING (
  get_user_role() = 'ceo'
  OR (get_user_role() = 'ops_head' AND
      (SELECT slug FROM brands WHERE id = brand_id) = ANY(get_user_brands()))
);

-- CI alerts: CEO sees all, dept heads see their department
CREATE POLICY "ci_alerts_read" ON ci_alerts FOR SELECT USING (
  get_user_role() = 'ceo'
  OR department = REPLACE(get_user_role()::TEXT, '_head', '')
);

-- CI chat: users see their own messages
CREATE POLICY "ci_chat_own" ON ci_chat_history FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "ci_chat_insert" ON ci_chat_history FOR INSERT WITH CHECK (user_id = auth.uid());

-- ETL log: CEO and all heads can view
CREATE POLICY "etl_log_read" ON etl_sync_log FOR SELECT USING (
  get_user_role() != 'viewer'
);

-- Service role bypass for ETL writes (service_role key bypasses RLS automatically)
```

**Step 5: Commit**

```bash
git add cockpit/supabase/
git commit -m "feat(cockpit): add seed data + RLS policies for role-based access"
```

---

## Phase 2: Supabase Client + Auth + Layout Shell (Tasks 6-9)

### Task 6: Set up Supabase client libraries

**Files:**
- Create: `cockpit/lib/supabase/client.ts`
- Create: `cockpit/lib/supabase/server.ts`
- Create: `cockpit/lib/supabase/middleware.ts`
- Create: `cockpit/middleware.ts`

**Step 1: Write browser client**

Create `cockpit/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Step 2: Write server client**

Create `cockpit/lib/supabase/server.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — ignored
          }
        },
      },
    }
  );
}
```

**Step 3: Write middleware for auth session refresh**

Create `cockpit/lib/supabase/middleware.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !request.nextUrl.pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

Create `cockpit/middleware.ts`:

```typescript
import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

**Step 4: Commit**

```bash
git add cockpit/lib/supabase/ cockpit/middleware.ts
git commit -m "feat(cockpit): add Supabase client + server + auth middleware"
```

---

### Task 7: Build login page

**Files:**
- Create: `cockpit/app/login/page.tsx`

**Step 1: Write login page**

Create `cockpit/app/login/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/ceo");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-gold/20">
        <CardHeader className="text-center">
          <div className="text-gold font-bold text-2xl mb-2">COCKPIT</div>
          <CardTitle className="text-gray-900">Sign in to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-navy hover:bg-navy-light text-white"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add cockpit/app/login/
git commit -m "feat(cockpit): add login page with Supabase auth"
```

---

### Task 8: Build layout shell (sidebar + top bar)

**Files:**
- Create: `cockpit/lib/constants/departments.ts`
- Create: `cockpit/lib/constants/brands.ts`
- Create: `cockpit/lib/constants/design-tokens.ts`
- Create: `cockpit/components/layout/Sidebar.tsx`
- Create: `cockpit/components/layout/TopBar.tsx`
- Create: `cockpit/components/layout/DateRangePicker.tsx`
- Create: `cockpit/components/layout/BrandFilter.tsx`
- Create: `cockpit/app/layout.tsx` (modify)

**Step 1: Write constants**

Create `cockpit/lib/constants/departments.ts`:

```typescript
import {
  LayoutDashboard,
  Megaphone,
  DollarSign,
  PiggyBank,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface Department {
  slug: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

export const departments: Department[] = [
  { slug: "ceo", label: "CEO", icon: LayoutDashboard, path: "/ceo" },
  { slug: "marketing", label: "Marketing", icon: Megaphone, path: "/marketing" },
  { slug: "sales", label: "Sales", icon: DollarSign, path: "/sales" },
  { slug: "finance", label: "Finance", icon: PiggyBank, path: "/finance" },
  { slug: "hr", label: "HR", icon: Users, path: "/hr" },
  { slug: "operations", label: "Operations", icon: Settings, path: "/operations" },
];
```

Create `cockpit/lib/constants/brands.ts`:

```typescript
export interface Brand {
  slug: string;
  label: string;
  id: number;
}

export const brands: Brand[] = [
  { slug: "spa", label: "Spa", id: 1 },
  { slug: "aesthetics", label: "Aesthetics", id: 2 },
  { slug: "slimming", label: "Slimming", id: 3 },
];
```

Create `cockpit/lib/constants/design-tokens.ts`:

```typescript
export const colors = {
  navy: "#1B3A4B",
  navyLight: "#2A5066",
  navyDark: "#0F2433",
  gold: "#B8943E",
  goldLight: "#D4B86A",
  goldDark: "#8A6F2E",
  green: "#10B981",
  red: "#EF4444",
  amber: "#F59E0B",
} as const;

export const chartColors = {
  spa: "#1B3A4B",
  aesthetics: "#B8943E",
  slimming: "#10B981",
  target: "#EF4444",
} as const;
```

**Step 2: Write Sidebar component**

Create `cockpit/components/layout/Sidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { departments } from "@/lib/constants/departments";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-screen bg-navy text-white flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-gold font-bold text-xl tracking-wide">COCKPIT</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {departments.map((dept) => {
          const isActive = pathname === dept.path;
          const Icon = dept.icon;
          return (
            <Link
              key={dept.slug}
              href={dept.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-gold/20 text-gold"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {dept.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

**Step 3: Write BrandFilter component**

Create `cockpit/components/layout/BrandFilter.tsx`:

```tsx
"use client";

import { brands } from "@/lib/constants/brands";
import { cn } from "@/lib/utils";

interface BrandFilterProps {
  selected: string | null;
  onChange: (brand: string | null) => void;
}

export function BrandFilter({ selected, onChange }: BrandFilterProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onChange(null)}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
          selected === null
            ? "bg-white text-navy shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        All
      </button>
      {brands.map((brand) => (
        <button
          key={brand.slug}
          onClick={() => onChange(brand.slug)}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            selected === brand.slug
              ? "bg-white text-navy shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          {brand.label}
        </button>
      ))}
    </div>
  );
}
```

**Step 4: Write DateRangePicker component**

Create `cockpit/components/layout/DateRangePicker.tsx`:

```tsx
"use client";

import { useState } from "react";
import { format, subDays, startOfWeek, startOfMonth } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  from: Date;
  to: Date;
  onChange: (from: Date, to: Date) => void;
}

const presets = [
  { label: "7d", fn: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: "30d", fn: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: "This Week", fn: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: new Date() }) },
  { label: "This Month", fn: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
];

export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {presets.map((preset) => (
        <Button
          key={preset.label}
          variant="ghost"
          size="sm"
          className="text-xs text-gray-500 hover:text-navy"
          onClick={() => {
            const range = preset.fn();
            onChange(range.from, range.to);
          }}
        >
          {preset.label}
        </Button>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("justify-start text-left font-normal text-sm")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(from, "MMM d")} - {format(to, "MMM d, yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{ from, to }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                onChange(range.from, range.to);
                setOpen(false);
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

**Step 5: Write TopBar component**

Create `cockpit/components/layout/TopBar.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "./DateRangePicker";
import { BrandFilter } from "./BrandFilter";

interface TopBarProps {
  dateFrom: Date;
  dateTo: Date;
  onDateChange: (from: Date, to: Date) => void;
  brandFilter: string | null;
  onBrandChange: (brand: string | null) => void;
  alertCount?: number;
}

export function TopBar({
  dateFrom,
  dateTo,
  onDateChange,
  brandFilter,
  onBrandChange,
  alertCount = 0,
}: TopBarProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 left-60 right-0 z-30">
      <DateRangePicker from={dateFrom} to={dateTo} onChange={onDateChange} />
      <div className="flex items-center gap-4">
        <BrandFilter selected={brandFilter} onChange={onBrandChange} />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-500" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {alertCount}
            </span>
          )}
        </Button>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5 text-gray-500" />
        </Button>
      </div>
    </header>
  );
}
```

**Step 6: Update root layout**

Modify `cockpit/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Carisma Cockpit",
  description: "CEO Business Intelligence Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

**Step 7: Commit**

```bash
git add cockpit/lib/constants/ cockpit/components/layout/ cockpit/app/layout.tsx
git commit -m "feat(cockpit): add sidebar, topbar, brand filter, date picker layout shell"
```

---

### Task 9: Build dashboard page wrapper with shared state

**Files:**
- Create: `cockpit/lib/hooks/useDateRange.ts`
- Create: `cockpit/lib/hooks/useBrandFilter.ts`
- Create: `cockpit/components/dashboard/DashboardShell.tsx`
- Create: `cockpit/components/dashboard/KPICard.tsx`
- Create: `cockpit/components/dashboard/KPICardRow.tsx`
- Create: `cockpit/components/dashboard/DataTable.tsx`
- Create: `cockpit/app/page.tsx`

**Step 1: Write hooks**

Create `cockpit/lib/hooks/useDateRange.ts`:

```typescript
"use client";

import { useState } from "react";
import { subDays } from "date-fns";

export function useDateRange() {
  const [from, setFrom] = useState(() => subDays(new Date(), 30));
  const [to, setTo] = useState(() => new Date());

  function setRange(newFrom: Date, newTo: Date) {
    setFrom(newFrom);
    setTo(newTo);
  }

  return { from, to, setRange };
}
```

Create `cockpit/lib/hooks/useBrandFilter.ts`:

```typescript
"use client";

import { useState } from "react";

export function useBrandFilter() {
  const [brand, setBrand] = useState<string | null>(null);
  return { brand, setBrand };
}
```

**Step 2: Write KPICard component**

Create `cockpit/components/dashboard/KPICard.tsx`:

```tsx
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";

interface KPICardProps {
  label: string;
  value: string;
  trend?: number;
  target?: string;
  targetValue?: number;
  currentValue?: number;
  format?: "currency" | "percent" | "number" | "time";
}

export function KPICard({
  label,
  value,
  trend,
  target,
  targetValue,
  currentValue,
}: KPICardProps) {
  const trendColor =
    trend === undefined || trend === 0
      ? "text-gray-400"
      : trend > 0
        ? "text-green-500"
        : "text-red-500";

  const TrendIcon =
    trend === undefined || trend === 0
      ? Minus
      : trend > 0
        ? TrendingUp
        : TrendingDown;

  const progressPct =
    targetValue && currentValue
      ? Math.min((currentValue / targetValue) * 100, 100)
      : null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        {trend !== undefined && (
          <span className={cn("flex items-center gap-1 text-sm font-medium", trendColor)}>
            <TrendIcon className="h-4 w-4" />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
      {progressPct !== null && (
        <div className="space-y-1">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                progressPct >= 90 ? "bg-green-500" : progressPct >= 70 ? "bg-amber-500" : "bg-red-500"
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {target && <span className="text-xs text-gray-400">Target: {target}</span>}
        </div>
      )}
    </Card>
  );
}
```

**Step 3: Write KPICardRow component**

Create `cockpit/components/dashboard/KPICardRow.tsx`:

```tsx
import { KPICard } from "./KPICard";

export interface KPIData {
  label: string;
  value: string;
  trend?: number;
  target?: string;
  targetValue?: number;
  currentValue?: number;
}

interface KPICardRowProps {
  kpis: KPIData[];
}

export function KPICardRow({ kpis }: KPICardRowProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((kpi) => (
        <KPICard key={kpi.label} {...kpi} />
      ))}
    </div>
  );
}
```

**Step 4: Write DataTable component**

Create `cockpit/components/dashboard/DataTable.tsx`:

```tsx
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  pageSize?: number;
}

export function DataTable({ columns, data, pageSize = 10 }: DataTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const aVal = a[sortKey] as number;
        const bVal = b[sortKey] as number;
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      })
    : data;

  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(data.length / pageSize);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.align === "right" ? "text-right" : ""}>
                {col.sortable ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  col.label
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paged.map((row, i) => (
            <TableRow key={i}>
              {columns.map((col) => (
                <TableCell key={col.key} className={col.align === "right" ? "text-right" : ""}>
                  {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <span className="text-sm text-gray-500">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 5: Write DashboardShell (page wrapper with sidebar + topbar + state)**

Create `cockpit/components/dashboard/DashboardShell.tsx`:

```tsx
"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useDateRange } from "@/lib/hooks/useDateRange";
import { useBrandFilter } from "@/lib/hooks/useBrandFilter";

interface DashboardShellProps {
  children: (props: {
    dateFrom: Date;
    dateTo: Date;
    brandFilter: string | null;
  }) => ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { from, to, setRange } = useDateRange();
  const { brand, setBrand } = useBrandFilter();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <TopBar
        dateFrom={from}
        dateTo={to}
        onDateChange={setRange}
        brandFilter={brand}
        onBrandChange={setBrand}
      />
      <main className="ml-60 pt-16 p-6 space-y-6">
        {children({ dateFrom: from, dateTo: to, brandFilter: brand })}
      </main>
    </div>
  );
}
```

**Step 6: Write root redirect**

Modify `cockpit/app/page.tsx`:

```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/ceo");
}
```

**Step 7: Commit**

```bash
git add cockpit/lib/hooks/ cockpit/components/dashboard/ cockpit/app/page.tsx
git commit -m "feat(cockpit): add dashboard shell, KPI cards, data table, shared hooks"
```

---

## Phase 3: Department Dashboard Views (Tasks 10-15)

### Task 10: Build CEO consolidated view

**Files:**
- Create: `cockpit/app/ceo/page.tsx`
- Create: `cockpit/lib/charts/config.ts`

**Step 1: Write chart config**

Create `cockpit/lib/charts/config.ts`:

```typescript
export const chartColors = {
  spa: "#1B3A4B",
  aesthetics: "#B8943E",
  slimming: "#10B981",
  target: "#EF4444",
  budget: "#6B7280",
} as const;

export const chartDefaults = {
  margin: { top: 5, right: 30, left: 20, bottom: 5 },
  strokeWidth: 2,
  dotRadius: 4,
  animationDuration: 300,
} as const;

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-MT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatMinutes(value: number): string {
  return value < 1 ? `${Math.round(value * 60)}s` : `${value.toFixed(1)}m`;
}
```

**Step 2: Write CEO page**

Create `cockpit/app/ceo/page.tsx`:

```tsx
"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, type KPIData } from "@/components/dashboard/KPICardRow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar,
} from "recharts";
import { chartColors } from "@/lib/charts/config";

// Placeholder data — will be replaced with Supabase queries
const mockKPIs: KPIData[] = [
  { label: "Total Revenue", value: "\u20AC42,350", trend: 8, target: "\u20AC45,000", targetValue: 45000, currentValue: 42350 },
  { label: "Blended ROAS", value: "5.2x", trend: 3, target: "5.0x", targetValue: 5.0, currentValue: 5.2 },
  { label: "Conversion Rate", value: "27.3%", trend: -2, target: "25%", targetValue: 25, currentValue: 27.3 },
  { label: "Company HC%", value: "38.2%", trend: -1, target: "40%", targetValue: 40, currentValue: 38.2 },
  { label: "Speed to Lead", value: "4.2m", trend: 5, target: "5m", targetValue: 5, currentValue: 4.2 },
];

const mockRevenueTrend = [
  { week: "W1", spa: 28000, aesthetics: 8500, slimming: 5200 },
  { week: "W2", spa: 30200, aesthetics: 9100, slimming: 5800 },
  { week: "W3", spa: 29500, aesthetics: 9800, slimming: 6100 },
  { week: "W4", spa: 32100, aesthetics: 10200, slimming: 6500 },
];

const mockRadar = [
  { dept: "Marketing", score: 85, target: 100 },
  { dept: "Sales", score: 72, target: 100 },
  { dept: "Finance", score: 95, target: 100 },
  { dept: "HR", score: 80, target: 100 },
  { dept: "Operations", score: 68, target: 100 },
];

export default function CEOPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <>
          <h2 className="text-2xl font-bold text-gray-900">CEO Overview</h2>
          <KPICardRow kpis={mockKPIs} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue by Brand (Weekly)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockRevenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="spa" stroke={chartColors.spa} strokeWidth={2} name="Spa" />
                    <Line type="monotone" dataKey="aesthetics" stroke={chartColors.aesthetics} strokeWidth={2} name="Aesthetics" />
                    <Line type="monotone" dataKey="slimming" stroke={chartColors.slimming} strokeWidth={2} name="Slimming" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Department Health</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={mockRadar}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis dataKey="dept" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar name="Current" dataKey="score" stroke={chartColors.spa} fill={chartColors.spa} fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
```

**Step 3: Commit**

```bash
git add cockpit/app/ceo/ cockpit/lib/charts/
git commit -m "feat(cockpit): add CEO consolidated dashboard view with mock data"
```

---

### Task 11: Build Marketing view

**Files:**
- Create: `cockpit/app/marketing/page.tsx`

**Step 1: Write marketing page**

Create `cockpit/app/marketing/page.tsx`:

```tsx
"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, type KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { chartColors, formatCurrency } from "@/lib/charts/config";

const mockKPIs: KPIData[] = [
  { label: "Total Spend", value: "\u20AC4,820", trend: 12 },
  { label: "Blended CPL", value: "\u20AC9.40", trend: -5 },
  { label: "Blended ROAS", value: "5.2x", trend: 3, target: "5.0x", targetValue: 5.0, currentValue: 5.2 },
  { label: "Email Revenue %", value: "32%", trend: -3, target: "35%", targetValue: 35, currentValue: 32 },
  { label: "SEO Clicks", value: "1,245", trend: 8 },
];

const mockSpendVsRevenue = [
  { week: "W1", spend: 1100, revenue: 5500 },
  { week: "W2", spend: 1200, revenue: 6200 },
  { week: "W3", spend: 1250, revenue: 5800 },
  { week: "W4", spend: 1270, revenue: 6800 },
];

const mockCPLByBrand = [
  { brand: "Spa", cpl: 7.2, target: 8 },
  { brand: "Aesthetics", cpl: 13.5, target: 12 },
  { brand: "Slimming", cpl: 8.8, target: 10 },
];

const mockCampaigns = [
  { campaign: "Spa Summer Promo", platform: "Meta", spend: 850, leads: 112, cpl: 7.59, roas: 6.2 },
  { campaign: "Filler Awareness", platform: "Meta", spend: 620, leads: 45, cpl: 13.78, roas: 4.1 },
  { campaign: "Slimming Consult", platform: "Google", spend: 480, leads: 55, cpl: 8.73, roas: 5.8 },
];

export default function MarketingPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <>
          <h2 className="text-2xl font-bold text-gray-900">Marketing</h2>
          <KPICardRow kpis={mockKPIs} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Spend vs Revenue (Weekly)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockSpendVsRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="spend" stroke={chartColors.target} strokeWidth={2} name="Spend" />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke={chartColors.spa} strokeWidth={2} name="Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">CPL by Brand</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockCPLByBrand}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="brand" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="cpl" fill={chartColors.spa} name="CPL" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" fill={chartColors.budget} name="Target" radius={[4, 4, 0, 0]} opacity={0.3} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  { key: "campaign", label: "Campaign" },
                  { key: "platform", label: "Platform" },
                  { key: "spend", label: "Spend", sortable: true, align: "right", render: (v) => formatCurrency(v as number) },
                  { key: "leads", label: "Leads", sortable: true, align: "right" },
                  { key: "cpl", label: "CPL", sortable: true, align: "right", render: (v) => `\u20AC${(v as number).toFixed(2)}` },
                  { key: "roas", label: "ROAS", sortable: true, align: "right", render: (v) => `${v}x` },
                ]}
                data={mockCampaigns}
              />
            </CardContent>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
```

**Step 2: Commit**

```bash
git add cockpit/app/marketing/
git commit -m "feat(cockpit): add Marketing dashboard view with mock data"
```

---

### Task 12: Build Sales/CRM view

**Files:**
- Create: `cockpit/app/sales/page.tsx`

**Step 1: Write sales page**

Create `cockpit/app/sales/page.tsx`:

```tsx
"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, type KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, FunnelChart, Funnel, LabelList, Cell,
} from "recharts";
import { chartColors } from "@/lib/charts/config";

const mockKPIs: KPIData[] = [
  { label: "Speed to Lead", value: "4.2m", trend: 5, target: "5m", targetValue: 5, currentValue: 4.2 },
  { label: "Conversion Rate", value: "27.3%", trend: 2, target: "25%", targetValue: 25, currentValue: 27.3 },
  { label: "Deposit %", value: "68%", trend: 4 },
  { label: "Total Calls", value: "342", trend: 12 },
  { label: "Meta vs CRM", value: "156/148", trend: -5 },
];

const mockSTLDistribution = [
  { bucket: "<1m", count: 45, pct: 30 },
  { bucket: "1-3m", count: 38, pct: 25 },
  { bucket: "3-5m", count: 22, pct: 15 },
  { bucket: "5-15m", count: 25, pct: 17 },
  { bucket: "15-30m", count: 12, pct: 8 },
  { bucket: "30m+", count: 8, pct: 5 },
];

const mockFunnel = [
  { name: "Leads", value: 156, fill: chartColors.spa },
  { name: "Calls Made", value: 120, fill: chartColors.aesthetics },
  { name: "Appointments", value: 68, fill: chartColors.slimming },
  { name: "Sales", value: 43, fill: "#10B981" },
];

const mockRepLeaderboard = [
  { rep: "Sarah M.", calls: 85, bookings: 22, conversions: 15, rate: "17.6%", stl: "3.2m" },
  { rep: "James K.", calls: 72, bookings: 18, conversions: 12, rate: "16.7%", stl: "4.8m" },
  { rep: "Maria L.", calls: 68, bookings: 15, conversions: 10, rate: "14.7%", stl: "5.1m" },
  { rep: "David R.", calls: 55, bookings: 13, conversions: 6, rate: "10.9%", stl: "8.2m" },
];

export default function SalesPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <>
          <h2 className="text-2xl font-bold text-gray-900">Sales / CRM</h2>
          <KPICardRow kpis={mockKPIs} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Speed to Lead Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockSTLDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill={chartColors.spa} name="Leads" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockFunnel} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {mockFunnel.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rep Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  { key: "rep", label: "Rep" },
                  { key: "calls", label: "Calls", sortable: true, align: "right" },
                  { key: "bookings", label: "Bookings", sortable: true, align: "right" },
                  { key: "conversions", label: "Conversions", sortable: true, align: "right" },
                  { key: "rate", label: "Conv. Rate", sortable: true, align: "right" },
                  { key: "stl", label: "Avg STL", align: "right" },
                ]}
                data={mockRepLeaderboard}
              />
            </CardContent>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
```

**Step 2: Commit**

```bash
git add cockpit/app/sales/
git commit -m "feat(cockpit): add Sales/CRM dashboard view with mock data"
```

---

### Task 13: Build Finance view

**Files:**
- Create: `cockpit/app/finance/page.tsx`

**Step 1: Write finance page**

Create `cockpit/app/finance/page.tsx`:

```tsx
"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, type KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { chartColors, formatCurrency } from "@/lib/charts/config";

const mockKPIs: KPIData[] = [
  { label: "EBITDA", value: "\u20AC18,200", trend: 6 },
  { label: "Rev vs Budget", value: "+4.2%", trend: 4 },
  { label: "Company HC%", value: "38.2%", trend: -1, target: "40%", targetValue: 40, currentValue: 38.2 },
  { label: "Marketing ROI", value: "5.2x", trend: 3 },
  { label: "Budget Variance", value: "-2.1%", trend: 2 },
];

const mockEBITDATrend = [
  { month: "Jan", spa: 12000, aesthetics: 4500, slimming: 3200 },
  { month: "Feb", spa: 13500, aesthetics: 5000, slimming: 3500 },
  { month: "Mar", spa: 14200, aesthetics: 5200, slimming: 3800 },
  { month: "Apr", spa: 15000, aesthetics: 5500, slimming: 4000 },
];

const mockBudgetVsActual = [
  { dept: "Marketing", budgeted: 5000, actual: 4820 },
  { dept: "Operations", budgeted: 12000, actual: 12500 },
  { dept: "HR", budgeted: 18000, actual: 17200 },
  { dept: "Sales", budgeted: 8000, actual: 8400 },
];

const mockLocationRevenue = [
  { location: "InterContinental", revenue: 8200, yoy: "+12%", hc: "36.2%" },
  { location: "Hugo's", revenue: 6800, yoy: "+8%", hc: "38.5%" },
  { location: "Hyatt", revenue: 5400, yoy: "+3%", hc: "42.1%" },
  { location: "Ramla Bay", revenue: 4200, yoy: "-2%", hc: "39.8%" },
  { location: "Aesthetics Clinic", revenue: 10200, yoy: "+15%", hc: "34.2%" },
  { location: "Slimming Clinic", revenue: 6500, yoy: "+10%", hc: "37.5%" },
];

export default function FinancePage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <>
          <h2 className="text-2xl font-bold text-gray-900">Finance</h2>
          <KPICardRow kpis={mockKPIs} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">EBITDA Trend by Brand</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockEBITDATrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="spa" stroke={chartColors.spa} strokeWidth={2} name="Spa" />
                    <Line type="monotone" dataKey="aesthetics" stroke={chartColors.aesthetics} strokeWidth={2} name="Aesthetics" />
                    <Line type="monotone" dataKey="slimming" stroke={chartColors.slimming} strokeWidth={2} name="Slimming" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Budget vs Actual by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockBudgetVsActual}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="dept" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="budgeted" fill={chartColors.budget} name="Budget" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actual" fill={chartColors.spa} name="Actual" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Revenue by Location</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  { key: "location", label: "Location" },
                  { key: "revenue", label: "Revenue (ex VAT)", sortable: true, align: "right", render: (v) => formatCurrency(v as number) },
                  { key: "yoy", label: "YoY", align: "right" },
                  { key: "hc", label: "HC%", align: "right" },
                ]}
                data={mockLocationRevenue}
              />
            </CardContent>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
```

**Step 2: Commit**

```bash
git add cockpit/app/finance/
git commit -m "feat(cockpit): add Finance dashboard view with mock data"
```

---

### Task 14: Build HR view

**Files:**
- Create: `cockpit/app/hr/page.tsx`

**Step 1: Write HR page**

Create `cockpit/app/hr/page.tsx`:

```tsx
"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, type KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { chartColors } from "@/lib/charts/config";

const mockKPIs: KPIData[] = [
  { label: "Avg HC%", value: "38.2%", trend: -1, target: "40%", targetValue: 40, currentValue: 38.2 },
  { label: "Avg Utilization", value: "76.5%", trend: 3, target: "75%", targetValue: 75, currentValue: 76.5 },
  { label: "Headcount", value: "47", trend: 2 },
  { label: "Avg Productivity", value: "72%", trend: 1 },
  { label: "Slim Bookings/Therapist", value: "48", trend: 5, target: "45", targetValue: 45, currentValue: 48 },
];

const mockHCByLocation = [
  { location: "Inter", hc: 36.2 },
  { location: "Hugo's", hc: 38.5 },
  { location: "Hyatt", hc: 42.1 },
  { location: "Ramla", hc: 39.8 },
  { location: "Labranda", hc: 37.2 },
  { location: "Odycy", hc: 41.5 },
  { location: "Excelsior", hc: 35.8 },
  { location: "Novotel", hc: 38.9 },
  { location: "Aes Clinic", hc: 34.2 },
  { location: "Slim Clinic", hc: 37.5 },
];

const mockUtilTrend = [
  { week: "W1", inter: 72, hugos: 78, hyatt: 65, aesthetics: 82 },
  { week: "W2", inter: 75, hugos: 76, hyatt: 68, aesthetics: 85 },
  { week: "W3", inter: 73, hugos: 80, hyatt: 70, aesthetics: 83 },
  { week: "W4", inter: 78, hugos: 82, hyatt: 72, aesthetics: 86 },
];

const mockWe360 = [
  { employee: "Abdul M.", attendance: 1, online: "07h 42m", active: "07h 03m", idle: "00h 39m", productive: "06h 01m", unproductive: "00h 33m", productivity: "78.0%" },
  { employee: "Anit C.", attendance: 1, online: "07h 57m", active: "04h 03m", idle: "03h 54m", productive: "03h 15m", unproductive: "00h 19m", productivity: "40.8%" },
  { employee: "Dolores E.", attendance: 1, online: "07h 30m", active: "06h 12m", idle: "01h 18m", productive: "05h 42m", unproductive: "00h 14m", productivity: "76.0%" },
  { employee: "Ariane V.", attendance: 1, online: "08h 27m", active: "06h 28m", idle: "01h 59m", productive: "05h 08m", unproductive: "00h 35m", productivity: "60.7%" },
  { employee: "Wanda T.", attendance: 1, online: "07h 24m", active: "06h 22m", idle: "01h 02m", productive: "05h 52m", unproductive: "00h 08m", productivity: "79.4%" },
];

export default function HRPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <>
          <h2 className="text-2xl font-bold text-gray-900">HR</h2>
          <KPICardRow kpis={mockKPIs} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">HC% by Location</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockHCByLocation}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="location" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, 50]} />
                    <Tooltip />
                    <ReferenceLine y={40} stroke={chartColors.target} strokeDasharray="5 5" label="Target 40%" />
                    <Bar dataKey="hc" fill={chartColors.spa} name="HC%" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Utilization Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockUtilTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[50, 100]} />
                    <Tooltip />
                    <Legend />
                    <ReferenceLine y={75} stroke={chartColors.target} strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="inter" stroke={chartColors.spa} strokeWidth={2} name="Inter" />
                    <Line type="monotone" dataKey="hugos" stroke={chartColors.aesthetics} strokeWidth={2} name="Hugo's" />
                    <Line type="monotone" dataKey="hyatt" stroke={chartColors.slimming} strokeWidth={2} name="Hyatt" />
                    <Line type="monotone" dataKey="aesthetics" stroke="#8B5CF6" strokeWidth={2} name="Aesthetics" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Employee Productivity (We360)</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  { key: "employee", label: "Employee" },
                  { key: "online", label: "Online", align: "right" },
                  { key: "active", label: "Active", align: "right" },
                  { key: "idle", label: "Idle", align: "right" },
                  { key: "productive", label: "Productive", align: "right" },
                  { key: "unproductive", label: "Unproductive", align: "right" },
                  { key: "productivity", label: "Productivity %", sortable: true, align: "right" },
                ]}
                data={mockWe360}
              />
            </CardContent>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
```

**Step 2: Commit**

```bash
git add cockpit/app/hr/
git commit -m "feat(cockpit): add HR dashboard view with mock data"
```

---

### Task 15: Build Operations view

**Files:**
- Create: `cockpit/app/operations/page.tsx`

**Step 1: Write operations page**

Create `cockpit/app/operations/page.tsx`:

```tsx
"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, type KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";
import { chartColors } from "@/lib/charts/config";

const mockKPIs: KPIData[] = [
  { label: "Avg Google Rating", value: "4.6", trend: 1 },
  { label: "Complaints", value: "3", trend: -25 },
  { label: "Consult Conv (Aes)", value: "52%", trend: 4, target: "50%", targetValue: 50, currentValue: 52 },
  { label: "Show-up (Slim)", value: "83%", trend: -2, target: "85%", targetValue: 85, currentValue: 83 },
  { label: "AOV (Aes)", value: "\u20AC258", trend: 5, target: "\u20AC245", targetValue: 245, currentValue: 258 },
];

const mockReviewsTrend = [
  { week: "W1", inter: 4.7, hugos: 4.5, hyatt: 4.3, ramla: 4.6 },
  { week: "W2", inter: 4.6, hugos: 4.6, hyatt: 4.4, ramla: 4.5 },
  { week: "W3", inter: 4.7, hugos: 4.5, hyatt: 4.5, ramla: 4.7 },
  { week: "W4", inter: 4.8, hugos: 4.7, hyatt: 4.4, ramla: 4.6 },
];

const mockConsultFunnel = [
  { stage: "Booked", aesthetics: 70, slimming: 55 },
  { stage: "Attended", aesthetics: 58, slimming: 46 },
  { stage: "Converted", aesthetics: 30, slimming: 30 },
];

const mockLocationScorecard = [
  { location: "InterContinental", reviews: 4.8, reviewCount: 12, complaints: 0, notes: "" },
  { location: "Hugo's", reviews: 4.7, reviewCount: 8, complaints: 1, notes: "Noise complaint" },
  { location: "Hyatt", reviews: 4.4, reviewCount: 6, complaints: 1, notes: "Wait time" },
  { location: "Ramla Bay", reviews: 4.6, reviewCount: 9, complaints: 0, notes: "" },
  { location: "Aesthetics Clinic", reviews: 4.9, reviewCount: 15, complaints: 0, notes: "" },
  { location: "Slimming Clinic", reviews: 4.5, reviewCount: 7, complaints: 1, notes: "Scheduling issue" },
];

export default function OperationsPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <>
          <h2 className="text-2xl font-bold text-gray-900">Operations</h2>
          <KPICardRow kpis={mockKPIs} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Google Reviews Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockReviewsTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis domain={[4.0, 5.0]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="inter" stroke={chartColors.spa} strokeWidth={2} name="Inter" />
                    <Line type="monotone" dataKey="hugos" stroke={chartColors.aesthetics} strokeWidth={2} name="Hugo's" />
                    <Line type="monotone" dataKey="hyatt" stroke={chartColors.slimming} strokeWidth={2} name="Hyatt" />
                    <Line type="monotone" dataKey="ramla" stroke="#8B5CF6" strokeWidth={2} name="Ramla" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Consult Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockConsultFunnel}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="aesthetics" fill={chartColors.aesthetics} name="Aesthetics" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="slimming" fill={chartColors.slimming} name="Slimming" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location Scorecard</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  { key: "location", label: "Location" },
                  { key: "reviews", label: "Avg Rating", sortable: true, align: "right" },
                  { key: "reviewCount", label: "Reviews", sortable: true, align: "right" },
                  { key: "complaints", label: "Complaints", sortable: true, align: "right" },
                  { key: "notes", label: "Notes" },
                ]}
                data={mockLocationScorecard}
              />
            </CardContent>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
```

**Step 2: Commit**

```bash
git add cockpit/app/operations/
git commit -m "feat(cockpit): add Operations dashboard view with mock data"
```

---

## Phase 4: ETL Pipeline (Tasks 16-19)

### Task 16: ETL shared utilities

**Files:**
- Create: `cockpit/etl/requirements.txt`
- Create: `cockpit/etl/shared/__init__.py`
- Create: `cockpit/etl/shared/supabase_client.py`
- Create: `cockpit/etl/shared/etl_logger.py`
- Create: `cockpit/etl/shared/etl_config.py`
- Create: `cockpit/etl/shared/sheets_reader.py`

**Step 1: Write requirements.txt**

Create `cockpit/etl/requirements.txt`:

```
supabase>=2.0.0
python-dotenv>=1.0.0
```

**Step 2: Write Supabase client helper**

Create `cockpit/etl/shared/__init__.py` (empty file).

Create `cockpit/etl/shared/supabase_client.py`:

```python
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env.local'))

_client: Client | None = None

def get_client() -> Client:
    global _client
    if _client is None:
        url = os.environ['NEXT_PUBLIC_SUPABASE_URL']
        key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
        _client = create_client(url, key)
    return _client

def upsert(table: str, rows: list[dict], on_conflict: str) -> int:
    """Upsert rows into a Supabase table. Returns count of rows upserted."""
    if not rows:
        return 0
    client = get_client()
    result = client.table(table).upsert(rows, on_conflict=on_conflict).execute()
    return len(result.data) if result.data else 0
```

**Step 3: Write ETL logger**

Create `cockpit/etl/shared/etl_logger.py`:

```python
from datetime import datetime, timezone
from .supabase_client import get_client

class ETLLogger:
    def __init__(self, source_name: str):
        self.source_name = source_name
        self.started_at = datetime.now(timezone.utc)
        self.log_id: int | None = None

    def start(self):
        client = get_client()
        result = client.table('etl_sync_log').insert({
            'source_name': self.source_name,
            'started_at': self.started_at.isoformat(),
            'status': 'running',
        }).execute()
        if result.data:
            self.log_id = result.data[0]['id']

    def complete(self, rows_upserted: int):
        if not self.log_id:
            return
        now = datetime.now(timezone.utc)
        duration = (now - self.started_at).total_seconds()
        client = get_client()
        client.table('etl_sync_log').update({
            'completed_at': now.isoformat(),
            'status': 'success',
            'rows_upserted': rows_upserted,
            'duration_sec': round(duration, 2),
        }).eq('id', self.log_id).execute()

    def fail(self, error_message: str):
        if not self.log_id:
            return
        now = datetime.now(timezone.utc)
        duration = (now - self.started_at).total_seconds()
        client = get_client()
        client.table('etl_sync_log').update({
            'completed_at': now.isoformat(),
            'status': 'failed',
            'error_message': error_message[:500],
            'duration_sec': round(duration, 2),
        }).eq('id', self.log_id).execute()
```

**Step 4: Write ETL config loader**

Create `cockpit/etl/shared/etl_config.py`:

```python
import json
import os

_config: dict | None = None

def get_config() -> dict:
    global _config
    if _config is None:
        config_path = os.path.join(
            os.path.dirname(__file__), '..', '..', '..', 'config', 'cockpit_sources.json'
        )
        with open(config_path) as f:
            _config = json.load(f)
    return _config

def get_sheet_config(sheet_key: str) -> dict:
    return get_config()['google_sheets'][sheet_key]

def get_api_config(api_key: str) -> dict:
    return get_config()['api_sources'][api_key]

def get_brand_id(slug: str) -> int:
    mapping = {'spa': 1, 'aesthetics': 2, 'slimming': 3}
    return mapping[slug]
```

**Step 5: Write Google Sheets reader helper**

Create `cockpit/etl/shared/sheets_reader.py`:

```python
"""
Helper to read Google Sheets via the Google Workspace MCP.
This module is designed to be called from within Claude Code context
where MCP tools are available. For standalone testing, it falls back
to the Supabase service role reading from cached data.
"""

def parse_sheet_values(raw_values: list[list[str]], header_row: int = 0) -> list[dict]:
    """Convert raw sheet values (list of lists) into list of dicts using header row."""
    if not raw_values or len(raw_values) <= header_row:
        return []
    headers = [str(h).strip() for h in raw_values[header_row]]
    rows = []
    for row in raw_values[header_row + 1:]:
        if not any(cell for cell in row):
            continue
        padded = row + [''] * (len(headers) - len(row))
        rows.append(dict(zip(headers, padded)))
    return rows

def safe_float(value: str, default: float = 0.0) -> float:
    """Parse a string to float, handling EUR symbols, commas, percentages."""
    if not value or value.strip() == '' or value.strip() == '-':
        return default
    cleaned = value.replace('EUR', '').replace('\u20ac', '').replace(',', '').replace('%', '').strip()
    try:
        return float(cleaned)
    except ValueError:
        return default

def safe_int(value: str, default: int = 0) -> int:
    """Parse a string to int safely."""
    return int(safe_float(value, float(default)))
```

**Step 6: Commit**

```bash
git add cockpit/etl/
git commit -m "feat(cockpit): add ETL shared utilities (Supabase client, logger, config, sheets reader)"
```

---

### Task 17: Write Google Sheets ETL scripts (weekly KPIs, CRM master, sales)

**Files:**
- Create: `cockpit/etl/etl_weekly_kpis.py`
- Create: `cockpit/etl/etl_crm_master.py`
- Create: `cockpit/etl/etl_aesthetics_sales.py`
- Create: `cockpit/etl/etl_slimming_sales.py`

**Note:** These scripts are designed to be invoked by Claude Code scheduled triggers which have MCP access. Each script defines a `run()` function that accepts raw sheet data as input (read via MCP before calling the script), transforms it, and upserts to Supabase.

**Step 1: Write weekly KPIs ETL**

Create `cockpit/etl/etl_weekly_kpis.py`:

```python
"""
ETL: Weekly KPIs Google Sheet → Supabase
Reads: Sales tab, HR tab, Operations tab, Growth tab
Writes: sales_weekly, hr_weekly, operations_weekly, marketing_daily
Schedule: Monday 09:00
"""
from shared.supabase_client import upsert
from shared.etl_logger import ETLLogger
from shared.etl_config import get_sheet_config, get_brand_id
from shared.sheets_reader import safe_float, safe_int

def run(sheet_data: dict[str, list[list[str]]]) -> dict:
    """
    Args:
        sheet_data: dict mapping tab names to raw values (list of lists).
                    Expected tabs: 'Sales', 'HR ', 'Operations', 'Growth'
    Returns:
        dict with counts of rows upserted per table.
    """
    logger = ETLLogger('weekly_kpis')
    logger.start()
    total = 0

    try:
        # Process Sales tab
        if 'Sales' in sheet_data:
            sales_rows = _process_sales_tab(sheet_data['Sales'])
            count = upsert('sales_weekly', sales_rows, 'week_start,location_id')
            total += count

        # Process HR tab
        if 'HR ' in sheet_data:
            hr_rows = _process_hr_tab(sheet_data['HR '])
            count = upsert('hr_weekly', hr_rows, 'week_start,location_id')
            total += count

        # Process Operations tab
        if 'Operations' in sheet_data:
            ops_rows = _process_ops_tab(sheet_data['Operations'])
            count = upsert('operations_weekly', ops_rows, 'week_start,location_id')
            total += count

        logger.complete(total)
        return {'rows_upserted': total, 'status': 'success'}

    except Exception as e:
        logger.fail(str(e))
        return {'rows_upserted': total, 'status': 'failed', 'error': str(e)}


def _process_sales_tab(raw: list[list[str]]) -> list[dict]:
    """Extract weekly sales by location from Sales tab."""
    # Sales tab structure: week dates in row 2, location data starts at row 44+
    # See cockpit_sources.json for exact row mappings
    rows = []
    # Implementation will parse actual sheet structure
    # Placeholder pattern:
    # For each week column and each location row, extract revenue, retail%, addon%, etc.
    return rows


def _process_hr_tab(raw: list[list[str]]) -> list[dict]:
    """Extract HC%, utilization, headcount from HR tab."""
    rows = []
    return rows


def _process_ops_tab(raw: list[list[str]]) -> list[dict]:
    """Extract Google reviews, complaints from Operations tab."""
    rows = []
    return rows
```

**Step 2: Write CRM Master ETL**

Create `cockpit/etl/etl_crm_master.py`:

```python
"""
ETL: CRM Master Google Sheet → Supabase
Reads: ' Spa', ' Aes', ' Slm' tabs (KPIs), 'Spa', 'Aes', 'Slm' tabs (Dials)
Writes: crm_daily, crm_by_rep
Schedule: Daily 09:00
"""
from shared.supabase_client import upsert
from shared.etl_logger import ETLLogger
from shared.etl_config import get_brand_id
from shared.sheets_reader import safe_float, safe_int

def run(sheet_data: dict[str, list[list[str]]]) -> dict:
    logger = ETLLogger('crm_master')
    logger.start()
    total = 0

    try:
        brand_tabs = {
            ' Spa': 'spa',
            ' Aes': 'aesthetics',
            ' Slm': 'slimming',
        }

        for tab_name, brand_slug in brand_tabs.items():
            if tab_name in sheet_data:
                brand_id = get_brand_id(brand_slug)
                crm_rows = _process_kpi_tab(sheet_data[tab_name], brand_id)
                count = upsert('crm_daily', crm_rows, 'date,brand_id')
                total += count

        # Process dial tabs for per-rep data
        dial_tabs = {
            'Spa': 'spa',
            'Aes': 'aesthetics',
            'Slm': 'slimming',
        }

        for tab_name, brand_slug in dial_tabs.items():
            if tab_name in sheet_data:
                brand_id = get_brand_id(brand_slug)
                rep_rows = _process_dials_tab(sheet_data[tab_name], brand_id)
                count = upsert('crm_by_rep', rep_rows, 'date,staff_id')
                total += count

        logger.complete(total)
        return {'rows_upserted': total, 'status': 'success'}

    except Exception as e:
        logger.fail(str(e))
        return {'rows_upserted': total, 'status': 'failed', 'error': str(e)}


def _process_kpi_tab(raw: list[list[str]], brand_id: int) -> list[dict]:
    """Extract daily CRM KPIs from brand KPI tab."""
    rows = []
    # Parse: total_leads, leads_meta, speed_to_lead, conversion_rate, etc.
    return rows


def _process_dials_tab(raw: list[list[str]], brand_id: int) -> list[dict]:
    """Extract per-rep call data from dials tab."""
    rows = []
    # Parse: calls_made, appointments_booked, etc. per rep
    return rows
```

**Step 3: Write Aesthetics Sales ETL**

Create `cockpit/etl/etl_aesthetics_sales.py`:

```python
"""
ETL: Aesthetics Sales Google Sheet → Supabase
Reads: Monthly sales tabs (e.g., "Sales April 2026")
Writes: sales_by_rep, consult_funnel
Schedule: Daily 20:00
"""
from shared.supabase_client import upsert
from shared.etl_logger import ETLLogger
from shared.etl_config import get_sheet_config, get_brand_id
from shared.sheets_reader import safe_float, safe_int

def run(sheet_data: dict[str, list[list[str]]]) -> dict:
    logger = ETLLogger('aesthetics_sales')
    logger.start()
    total = 0
    brand_id = get_brand_id('aesthetics')

    try:
        for tab_name, raw in sheet_data.items():
            if tab_name.startswith('Sale'):
                rep_rows = _process_sales_tab(raw, brand_id)
                count = upsert('sales_by_rep', rep_rows, 'date,staff_id')
                total += count

        logger.complete(total)
        return {'rows_upserted': total, 'status': 'success'}

    except Exception as e:
        logger.fail(str(e))
        return {'rows_upserted': total, 'status': 'failed', 'error': str(e)}


def _process_sales_tab(raw: list[list[str]], brand_id: int) -> list[dict]:
    """Parse individual sales records from monthly tab."""
    config = get_sheet_config('aesthetics_sales')
    cols = config['columns']
    rows = []
    # Parse columns: customer, service, date, price, payment, sales_staff, commission
    return rows
```

**Step 4: Write Slimming Sales ETL**

Create `cockpit/etl/etl_slimming_sales.py`:

```python
"""
ETL: Slimming Sales Google Sheet → Supabase
Reads: Monthly sales tabs (e.g., "Sales April")
Writes: sales_by_rep, consult_funnel
Schedule: Daily 20:00
"""
from shared.supabase_client import upsert
from shared.etl_logger import ETLLogger
from shared.etl_config import get_sheet_config, get_brand_id
from shared.sheets_reader import safe_float, safe_int

def run(sheet_data: dict[str, list[list[str]]]) -> dict:
    logger = ETLLogger('slimming_sales')
    logger.start()
    total = 0
    brand_id = get_brand_id('slimming')

    try:
        for tab_name, raw in sheet_data.items():
            if tab_name.startswith('Sales'):
                rep_rows = _process_sales_tab(raw, brand_id)
                count = upsert('sales_by_rep', rep_rows, 'date,staff_id')
                total += count

        logger.complete(total)
        return {'rows_upserted': total, 'status': 'success'}

    except Exception as e:
        logger.fail(str(e))
        return {'rows_upserted': total, 'status': 'failed', 'error': str(e)}


def _process_sales_tab(raw: list[list[str]], brand_id: int) -> list[dict]:
    """Parse individual sales records from monthly tab."""
    config = get_sheet_config('slimming_sales')
    cols = config['columns']
    rows = []
    return rows
```

**Step 5: Commit**

```bash
git add cockpit/etl/
git commit -m "feat(cockpit): add Google Sheets ETL scripts (weekly KPIs, CRM master, sales)"
```

---

### Task 18: Write API-based ETL scripts (Meta Ads, GA4, GSC, Klaviyo, We360)

**Files:**
- Create: `cockpit/etl/etl_meta_ads.py`
- Create: `cockpit/etl/etl_ga4.py`
- Create: `cockpit/etl/etl_gsc.py`
- Create: `cockpit/etl/etl_klaviyo.py`
- Create: `cockpit/etl/etl_we360.py`
- Create: `cockpit/etl/etl_zoho_crm.py`
- Create: `cockpit/etl/etl_wix.py`
- Create: `cockpit/etl/etl_google_ads.py`

**Note:** These scripts define the transform + load logic. The extract step (MCP calls) happens in the Claude Code scheduled trigger that invokes them.

**Step 1: Write Meta Ads ETL**

Create `cockpit/etl/etl_meta_ads.py`:

```python
"""
ETL: Meta Ads API → Supabase
Reads: Meta Ads MCP (get_insights per ad account)
Writes: marketing_daily
Schedule: Every 6h
"""
from shared.supabase_client import upsert
from shared.etl_logger import ETLLogger
from shared.etl_config import get_api_config, get_brand_id
from shared.sheets_reader import safe_float, safe_int

AD_ACCOUNTS = {
    'act_654279452039150': 'spa',
    'act_382359687910745': 'aesthetics',
    'act_1496776195316716': 'slimming',
}

def run(insights_by_account: dict[str, list[dict]]) -> dict:
    """
    Args:
        insights_by_account: dict mapping ad account ID to list of daily insight rows
                             from Meta Ads MCP get_insights call.
    """
    logger = ETLLogger('meta_ads')
    logger.start()
    total = 0

    try:
        for account_id, insights in insights_by_account.items():
            brand_slug = AD_ACCOUNTS.get(account_id)
            if not brand_slug:
                continue
            brand_id = get_brand_id(brand_slug)

            rows = []
            for day in insights:
                actions = day.get('actions', [])
                leads = sum(
                    int(a.get('value', 0))
                    for a in actions
                    if a.get('action_type') == 'lead'
                )
                spend = safe_float(str(day.get('spend', 0)))
                cpl = spend / leads if leads > 0 else 0

                rows.append({
                    'date': day['date_start'],
                    'brand_id': brand_id,
                    'platform': 'meta',
                    'spend': round(spend, 2),
                    'impressions': safe_int(str(day.get('impressions', 0))),
                    'clicks': safe_int(str(day.get('clicks', 0))),
                    'leads': leads,
                    'cpl': round(cpl, 2),
                    'roas': safe_float(str(day.get('purchase_roas', [{}])[0].get('value', 0))) if day.get('purchase_roas') else 0,
                    'ctr_pct': safe_float(str(day.get('ctr', 0))),
                    'cpc': safe_float(str(day.get('cpc', 0))),
                })

            count = upsert('marketing_daily', rows, 'date,brand_id,platform')
            total += count

        logger.complete(total)
        return {'rows_upserted': total, 'status': 'success'}

    except Exception as e:
        logger.fail(str(e))
        return {'rows_upserted': total, 'status': 'failed', 'error': str(e)}
```

**Step 2: Write GA4 ETL**

Create `cockpit/etl/etl_ga4.py`:

```python
"""
ETL: Google Analytics 4 → Supabase
Reads: Google Analytics MCP (run_report)
Writes: ga4_daily
Schedule: Daily 06:00
"""
from shared.supabase_client import upsert
from shared.etl_logger import ETLLogger
from shared.etl_config import get_brand_id
from shared.sheets_reader import safe_float, safe_int

def run(report_data: dict[str, list[dict]]) -> dict:
    """
    Args:
        report_data: dict mapping brand slug to list of daily metric rows
                     from GA4 MCP run_report call.
    """
    logger = ETLLogger('ga4')
    logger.start()
    total = 0

    try:
        for brand_slug, daily_rows in report_data.items():
            brand_id = get_brand_id(brand_slug)
            rows = []
            for day in daily_rows:
                rows.append({
                    'date': day['date'],
                    'brand_id': brand_id,
                    'sessions': safe_int(str(day.get('sessions', 0))),
                    'total_users': safe_int(str(day.get('totalUsers', 0))),
                    'new_users': safe_int(str(day.get('newUsers', 0))),
                    'page_views': safe_int(str(day.get('screenPageViews', 0))),
                    'avg_session_duration_sec': safe_float(str(day.get('averageSessionDuration', 0))),
                    'bounce_rate_pct': round(safe_float(str(day.get('bounceRate', 0))) * 100, 2),
                    'conversions': safe_int(str(day.get('conversions', 0))),
                })
            count = upsert('ga4_daily', rows, 'date,brand_id')
            total += count

        logger.complete(total)
        return {'rows_upserted': total, 'status': 'success'}

    except Exception as e:
        logger.fail(str(e))
        return {'rows_upserted': total, 'status': 'failed', 'error': str(e)}
```

**Step 3: Write remaining API ETL scripts (GSC, Klaviyo, We360, Zoho CRM, Wix, Google Ads)**

Create `cockpit/etl/etl_gsc.py`:

```python
"""
ETL: Google Search Console → Supabase
Writes: gsc_daily
Schedule: Daily 06:00
"""
from shared.supabase_client import upsert
from shared.etl_logger import ETLLogger
from shared.etl_config import get_brand_id
from shared.sheets_reader import safe_float, safe_int

def run(report_data: dict[str, list[dict]]) -> dict:
    logger = ETLLogger('gsc')
    logger.start()
    total = 0
    try:
        for brand_slug, daily_rows in report_data.items():
            brand_id = get_brand_id(brand_slug)
            rows = [{
                'date': day['date'],
                'brand_id': brand_id,
                'clicks': safe_int(str(day.get('clicks', 0))),
                'impressions': safe_int(str(day.get('impressions', 0))),
                'ctr_pct': round(safe_float(str(day.get('ctr', 0))) * 100, 2),
                'avg_position': safe_float(str(day.get('position', 0))),
            } for day in daily_rows]
            total += upsert('gsc_daily', rows, 'date,brand_id')
        logger.complete(total)
        return {'rows_upserted': total, 'status': 'success'}
    except Exception as e:
        logger.fail(str(e))
        return {'rows_upserted': total, 'status': 'failed', 'error': str(e)}
```

Create `cockpit/etl/etl_klaviyo.py`:

```python
"""
ETL: Klaviyo → Supabase
Writes: klaviyo_campaigns
Schedule: Daily 08:00
"""
from shared.supabase_client import upsert
from shared.etl_logger import ETLLogger
from shared.etl_config import get_brand_id
from shared.sheets_reader import safe_float, safe_int

def run(campaign_data: dict[str, list[dict]]) -> dict:
    logger = ETLLogger('klaviyo')
    logger.start()
    total = 0
    try:
        for brand_slug, campaigns in campaign_data.items():
            brand_id = get_brand_id(brand_slug)
            rows = [{
                'date': c['send_date'],
                'brand_id': brand_id,
                'campaign_name': c['name'],
                'sends': safe_int(str(c.get('sends', 0))),
                'opens': safe_int(str(c.get('opens', 0))),
                'clicks': safe_int(str(c.get('clicks', 0))),
                'revenue': safe_float(str(c.get('revenue', 0))),
                'revenue_pct_of_total': safe_float(str(c.get('revenue_pct', 0))),
            } for c in campaigns]
            total += upsert('klaviyo_campaigns', rows, 'date,brand_id,campaign_name')
        logger.complete(total)
        return {'rows_upserted': total, 'status': 'success'}
    except Exception as e:
        logger.fail(str(e))
        return {'rows_upserted': total, 'status': 'failed', 'error': str(e)}
```

Create `cockpit/etl/etl_we360.py`:

```python
"""
ETL: We360 → Supabase
Writes: we360_daily
Schedule: Daily 22:00
"""
from shared.supabase_client import upsert
from shared.etl_logger import ETLLogger
from shared.sheets_reader import safe_float, safe_int

def run(employee_data: list[dict]) -> dict:
    logger = ETLLogger('we360')
    logger.start()
    total = 0
    try:
        rows = [{
            'date': e['date'],
            'staff_id': e['staff_id'],
            'online_time_min': safe_int(str(e.get('online_time_min', 0))),
            'active_time_min': safe_int(str(e.get('active_time_min', 0))),
            'idle_time_min': safe_int(str(e.get('idle_time_min', 0))),
            'productive_time_min': safe_int(str(e.get('productive_time_min', 0))),
            'unproductive_time_min': safe_int(str(e.get('unproductive_time_min', 0))),
            'neutral_time_min': safe_int(str(e.get('neutral_time_min', 0))),
            'email_time_min': safe_int(str(e.get('email_time_min', 0))),
            'productivity_pct': safe_float(str(e.get('productivity_pct', 0))),
        } for e in employee_data]
        total = upsert('we360_daily', rows, 'date,staff_id')
        logger.complete(total)
        return {'rows_upserted': total, 'status': 'success'}
    except Exception as e:
        logger.fail(str(e))
        return {'rows_upserted': total, 'status': 'failed', 'error': str(e)}
```

Create `cockpit/etl/etl_zoho_crm.py`:

```python
"""
ETL: Zoho CRM → Supabase
Writes: crm_daily (speed to lead data), speed_to_lead_distribution
Schedule: Every 4h
"""
from shared.supabase_client import upsert
from shared.etl_logger import ETLLogger
from shared.etl_config import get_brand_id
from shared.sheets_reader import safe_float

BUCKETS = ['<1min', '1-3min', '3-5min', '5-15min', '15-30min', '30min+']

def run(leads_data: dict[str, list[dict]]) -> dict:
    logger = ETLLogger('zoho_crm')
    logger.start()
    total = 0
    try:
        for brand_slug, leads in leads_data.items():
            brand_id = get_brand_id(brand_slug)
            # Calculate speed to lead metrics and distribution
            # Leads have Created_Time and Last_Activity_Time
            total += _process_speed_to_lead(leads, brand_id)
        logger.complete(total)
        return {'rows_upserted': total, 'status': 'success'}
    except Exception as e:
        logger.fail(str(e))
        return {'rows_upserted': total, 'status': 'failed', 'error': str(e)}

def _process_speed_to_lead(leads: list[dict], brand_id: int) -> int:
    """Calculate STL metrics and bucket distribution."""
    # Implementation: compute median, mean, and distribute into buckets
    return 0
```

Create `cockpit/etl/etl_wix.py`:

```python
"""
ETL: Wix → Supabase
Writes: ga4_daily (supplement with Wix-specific conversion data)
Schedule: Daily 07:00
"""
from shared.supabase_client import upsert
from shared.etl_logger import ETLLogger

def run(wix_data: dict) -> dict:
    logger = ETLLogger('wix')
    logger.start()
    try:
        # Wix data supplements GA4 with form submission and popup capture data
        logger.complete(0)
        return {'rows_upserted': 0, 'status': 'success'}
    except Exception as e:
        logger.fail(str(e))
        return {'rows_upserted': 0, 'status': 'failed', 'error': str(e)}
```

Create `cockpit/etl/etl_google_ads.py`:

```python
"""
ETL: Google Ads → Supabase
Writes: marketing_daily (platform='google')
Schedule: Every 6h
"""
from shared.supabase_client import upsert
from shared.etl_logger import ETLLogger
from shared.etl_config import get_brand_id
from shared.sheets_reader import safe_float, safe_int

def run(campaign_data: dict[str, list[dict]]) -> dict:
    logger = ETLLogger('google_ads')
    logger.start()
    total = 0
    try:
        for brand_slug, daily_rows in campaign_data.items():
            brand_id = get_brand_id(brand_slug)
            rows = [{
                'date': day['date'],
                'brand_id': brand_id,
                'platform': 'google',
                'spend': safe_float(str(day.get('cost', 0))),
                'impressions': safe_int(str(day.get('impressions', 0))),
                'clicks': safe_int(str(day.get('clicks', 0))),
                'leads': safe_int(str(day.get('conversions', 0))),
                'cpl': safe_float(str(day.get('cost_per_conversion', 0))),
                'roas': safe_float(str(day.get('conversion_value_per_cost', 0))),
                'ctr_pct': safe_float(str(day.get('ctr', 0))),
                'cpc': safe_float(str(day.get('average_cpc', 0))),
            } for day in daily_rows]
            total += upsert('marketing_daily', rows, 'date,brand_id,platform')
        logger.complete(total)
        return {'rows_upserted': total, 'status': 'success'}
    except Exception as e:
        logger.fail(str(e))
        return {'rows_upserted': total, 'status': 'failed', 'error': str(e)}
```

**Step 4: Commit**

```bash
git add cockpit/etl/
git commit -m "feat(cockpit): add API-based ETL scripts (Meta, GA4, GSC, Klaviyo, We360, Zoho, Wix, Google Ads)"
```

---

### Task 19: Write remaining Sheets ETL scripts (EBITDA, salary, budget)

**Files:**
- Create: `cockpit/etl/etl_ebitda.py`
- Create: `cockpit/etl/etl_salary_master.py`
- Create: `cockpit/etl/etl_budget_calendar.py`

**Step 1: Write EBITDA ETL**

Create `cockpit/etl/etl_ebitda.py`:

```python
"""
ETL: EBITDA Google Sheet → Supabase
Writes: ebitda_monthly
Schedule: 5th of month 10:00
"""
from shared.supabase_client import upsert
from shared.etl_logger import ETLLogger
from shared.etl_config import get_brand_id
from shared.sheets_reader import safe_float

def run(sheet_data: dict[str, list[list[str]]]) -> dict:
    logger = ETLLogger('ebitda')
    logger.start()
    total = 0
    try:
        # Parse EBITDA Summary and per-brand P&L tabs
        logger.complete(total)
        return {'rows_upserted': total, 'status': 'success'}
    except Exception as e:
        logger.fail(str(e))
        return {'rows_upserted': total, 'status': 'failed', 'error': str(e)}
```

Create `cockpit/etl/etl_salary_master.py`:

```python
"""
ETL: Salary Master Google Sheet → Supabase
Writes: hr_weekly (total_salary_cost, hc_pct)
Schedule: 1st of month 10:00
"""
from shared.supabase_client import upsert
from shared.etl_logger import ETLLogger
from shared.sheets_reader import safe_float

def run(sheet_data: dict[str, list[list[str]]]) -> dict:
    logger = ETLLogger('salary_master')
    logger.start()
    total = 0
    try:
        # Parse monthly salary tabs, aggregate by location
        logger.complete(total)
        return {'rows_upserted': total, 'status': 'success'}
    except Exception as e:
        logger.fail(str(e))
        return {'rows_upserted': total, 'status': 'failed', 'error': str(e)}
```

Create `cockpit/etl/etl_budget_calendar.py`:

```python
"""
ETL: Marketing Budget Calendar → Supabase
Writes: budget_vs_actual
Schedule: Monday 08:00
"""
from shared.supabase_client import upsert
from shared.etl_logger import ETLLogger
from shared.etl_config import get_brand_id
from shared.sheets_reader import safe_float

def run(sheet_data: dict[str, list[list[str]]]) -> dict:
    logger = ETLLogger('budget_calendar')
    logger.start()
    total = 0
    try:
        # Parse Calendar '26 tab for budget allocations
        logger.complete(total)
        return {'rows_upserted': total, 'status': 'success'}
    except Exception as e:
        logger.fail(str(e))
        return {'rows_upserted': total, 'status': 'failed', 'error': str(e)}
```

**Step 2: Commit**

```bash
git add cockpit/etl/
git commit -m "feat(cockpit): add EBITDA, salary master, and budget calendar ETL scripts"
```

---

## Phase 5: CI Engine (Tasks 20-23)

### Task 20: CI Rules engine

**Files:**
- Create: `cockpit/ci/__init__.py`
- Create: `cockpit/ci/ci_rules.py`
- Create: `cockpit/ci/ci_analyzer.py`

**Step 1: Write CI rules definitions**

Create `cockpit/ci/__init__.py` (empty file).

Create `cockpit/ci/ci_rules.py`:

```python
"""
Carisma Intelligence — Rule Definitions
Each rule defines: name, department, query, condition, severity, recommendation template, action payload.
"""

RULES = [
    {
        'name': 'cpl_spike',
        'department': 'marketing',
        'severity': 'critical',
        'query': """
            SELECT brand_id, AVG(cpl) as avg_cpl, COUNT(*) as days
            FROM marketing_daily
            WHERE date >= CURRENT_DATE - INTERVAL '3 days'
              AND platform = 'meta'
            GROUP BY brand_id
        """,
        'targets_query': """
            SELECT brand_id, target_value
            FROM kpi_targets
            WHERE department = 'marketing' AND metric_name = 'cpl' AND is_active = true
        """,
        'condition': lambda row, target: row['avg_cpl'] > target * 1.5,
        'title_template': '{brand} CPL at EUR {avg_cpl:.2f} — {pct:.0f}% above target',
        'recommendation': 'Pause underperforming ad sets and review creative fatigue.',
        'action_type': 'pause_meta_ad',
    },
    {
        'name': 'roas_drop',
        'department': 'marketing',
        'severity': 'critical',
        'query': """
            SELECT brand_id, AVG(roas) as avg_roas
            FROM marketing_daily
            WHERE date >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY brand_id
            HAVING AVG(roas) < 3.0
        """,
        'condition': lambda row, _: row['avg_roas'] < 3.0,
        'title_template': '{brand} ROAS dropped to {avg_roas:.1f}x (7-day avg)',
        'recommendation': 'Review creative fatigue and audience saturation. Consider refreshing top-of-funnel creatives.',
        'action_type': 'alert_only',
    },
    {
        'name': 'speed_to_lead_breach',
        'department': 'sales',
        'severity': 'critical',
        'query': """
            SELECT brand_id, AVG(speed_to_lead_median_min) as avg_stl
            FROM crm_daily
            WHERE date >= CURRENT_DATE - INTERVAL '3 days'
            GROUP BY brand_id
            HAVING AVG(speed_to_lead_median_min) > 10
        """,
        'condition': lambda row, _: row['avg_stl'] > 10,
        'title_template': '{brand} speed to lead at {avg_stl:.1f}m median — needs urgent attention',
        'recommendation': 'Alert sales manager. Review CRM team assignment and response workflow.',
        'action_type': 'send_email',
    },
    {
        'name': 'conversion_drop',
        'department': 'sales',
        'severity': 'warning',
        'query': """
            SELECT brand_id, AVG(conversion_rate_pct) as avg_conv
            FROM crm_daily
            WHERE date >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY brand_id
            HAVING AVG(conversion_rate_pct) < 15
        """,
        'condition': lambda row, _: row['avg_conv'] < 15,
        'title_template': '{brand} conversion rate at {avg_conv:.1f}% — below 15% threshold',
        'recommendation': 'Review lead quality and rep performance. Check if lead source mix changed.',
        'action_type': 'alert_only',
    },
    {
        'name': 'hc_over_budget',
        'department': 'hr',
        'severity': 'warning',
        'query': """
            SELECT location_id, brand_id, hc_pct, l.name as location_name
            FROM hr_weekly h
            JOIN locations l ON l.id = h.location_id
            WHERE week_start = (SELECT MAX(week_start) FROM hr_weekly)
              AND hc_pct > 45
        """,
        'condition': lambda row, _: row['hc_pct'] > 45,
        'title_template': '{location_name} HC% at {hc_pct:.1f}% — exceeds 45% threshold',
        'recommendation': 'Flag to HR and Finance. Review staffing levels vs revenue.',
        'action_type': 'alert_only',
    },
    {
        'name': 'utilization_low',
        'department': 'hr',
        'severity': 'warning',
        'query': """
            SELECT location_id, brand_id, utilization_pct, l.name as location_name
            FROM hr_weekly h
            JOIN locations l ON l.id = h.location_id
            WHERE week_start = (SELECT MAX(week_start) FROM hr_weekly)
              AND utilization_pct < 60
        """,
        'condition': lambda row, _: row['utilization_pct'] < 60,
        'title_template': '{location_name} utilization at {utilization_pct:.1f}% — below 60%',
        'recommendation': 'Review scheduling and consider rebalancing therapist allocation.',
        'action_type': 'alert_only',
    },
    {
        'name': 'crm_lead_mismatch',
        'department': 'sales',
        'severity': 'warning',
        'query': """
            SELECT brand_id, SUM(leads_meta) as total_meta, SUM(leads_crm) as total_crm
            FROM crm_daily
            WHERE date >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY brand_id
        """,
        'condition': lambda row, _: (
            row['total_meta'] > 0 and
            abs(row['total_meta'] - row['total_crm']) / row['total_meta'] > 0.2
        ),
        'title_template': '{brand} lead mismatch: {total_meta} Meta vs {total_crm} CRM ({diff_pct:.0f}% gap)',
        'recommendation': 'Audit CRM data entry. Check if leads are being logged correctly.',
        'action_type': 'alert_only',
    },
    {
        'name': 'consult_noshow_spike',
        'department': 'operations',
        'severity': 'warning',
        'query': """
            SELECT brand_id, showup_pct
            FROM consult_funnel
            WHERE week_start = (SELECT MAX(week_start) FROM consult_funnel)
              AND showup_pct < 70
        """,
        'condition': lambda row, _: row['showup_pct'] < 70,
        'title_template': '{brand} consult show-up at {showup_pct:.1f}% — below 70%',
        'recommendation': 'Increase reminder frequency. Consider adding WhatsApp confirmation.',
        'action_type': 'alert_only',
    },
    {
        'name': 'google_reviews_drop',
        'department': 'operations',
        'severity': 'info',
        'query': """
            SELECT location_id, brand_id, google_reviews_avg, l.name as location_name
            FROM operations_weekly o
            JOIN locations l ON l.id = o.location_id
            WHERE week_start = (SELECT MAX(week_start) FROM operations_weekly)
              AND google_reviews_avg < 4.0
        """,
        'condition': lambda row, _: row['google_reviews_avg'] < 4.0,
        'title_template': '{location_name} Google rating at {google_reviews_avg:.1f} — below 4.0',
        'recommendation': 'Flag to operations manager. Review recent negative reviews.',
        'action_type': 'alert_only',
    },
    {
        'name': 'budget_overspend',
        'department': 'finance',
        'severity': 'critical',
        'query': """
            SELECT brand_id, department, budgeted, actual, variance_pct
            FROM budget_vs_actual
            WHERE month = DATE_TRUNC('month', CURRENT_DATE)
              AND actual > budgeted * 1.2
        """,
        'condition': lambda row, _: row['actual'] > row['budgeted'] * 1.2,
        'title_template': '{department} overspend: EUR {actual:.0f} vs EUR {budgeted:.0f} budget ({variance_pct:.1f}%)',
        'recommendation': 'Pause discretionary spend. Alert department head.',
        'action_type': 'alert_only',
    },
]
```

**Step 2: Write CI analyzer**

Create `cockpit/ci/ci_analyzer.py`:

```python
"""
Carisma Intelligence — Analyzer
Runs all rules against Supabase, creates ci_alerts for breaches.
"""
import os
from supabase import create_client
from dotenv import load_dotenv
from .ci_rules import RULES

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

BRAND_NAMES = {1: 'Spa', 2: 'Aesthetics', 3: 'Slimming'}

def get_client():
    return create_client(
        os.environ['NEXT_PUBLIC_SUPABASE_URL'],
        os.environ['SUPABASE_SERVICE_ROLE_KEY'],
    )

def run_analysis() -> list[dict]:
    """Evaluate all rules and create alerts for breaches."""
    client = get_client()
    alerts = []

    for rule in RULES:
        try:
            result = client.rpc('', {}).execute()  # Raw SQL via Supabase
            # Use postgrest-py for complex queries, or use raw SQL via pg connection
            # For now, use the Supabase client's from_() with filters
            
            # Simplified: execute query and check conditions
            breaches = _evaluate_rule(client, rule)
            
            for breach in breaches:
                alert = {
                    'department': rule['department'],
                    'brand_id': breach.get('brand_id'),
                    'severity': rule['severity'],
                    'title': _format_title(rule, breach),
                    'description': f"Rule '{rule['name']}' triggered.",
                    'recommendation': rule['recommendation'],
                    'status': 'pending',
                    'action_payload': {
                        'type': rule['action_type'],
                        'rule': rule['name'],
                        'data': breach,
                    },
                }
                
                # Insert alert
                client.table('ci_alerts').insert(alert).execute()
                alerts.append(alert)

        except Exception as e:
            print(f"Rule '{rule['name']}' failed: {e}")
            continue

    return alerts


def _evaluate_rule(client, rule: dict) -> list[dict]:
    """Execute rule query and return rows that breach the condition."""
    # In production, this would execute the SQL query via Supabase's
    # postgres connection or via an Edge Function.
    # For now, placeholder that will be connected during integration.
    return []


def _format_title(rule: dict, breach: dict) -> str:
    """Format alert title with breach data."""
    data = {**breach}
    if 'brand_id' in data:
        data['brand'] = BRAND_NAMES.get(data['brand_id'], 'Unknown')
    if 'total_meta' in data and 'total_crm' in data and data['total_meta'] > 0:
        data['diff_pct'] = abs(data['total_meta'] - data['total_crm']) / data['total_meta'] * 100
    if 'avg_cpl' in data and 'target' in data and data['target'] > 0:
        data['pct'] = (data['avg_cpl'] - data['target']) / data['target'] * 100
    try:
        return rule['title_template'].format(**data)
    except KeyError:
        return f"Alert: {rule['name']}"
```

**Step 3: Commit**

```bash
git add cockpit/ci/
git commit -m "feat(cockpit): add CI rules engine and analyzer"
```

---

### Task 21: CI emailer (Gmail MCP)

**Files:**
- Create: `cockpit/ci/ci_emailer.py`

**Step 1: Write CI emailer**

Create `cockpit/ci/ci_emailer.py`:

```python
"""
Carisma Intelligence — Email Composer
Collects pending alerts and sends a formatted daily brief via Gmail MCP.
Designed to be called from Claude Code which has Gmail MCP access.
"""
import os
from datetime import datetime, timezone
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

SEVERITY_EMOJI = {
    'critical': '\U0001f534',
    'warning': '\U0001f7e1',
    'info': '\U0001f535',
}

def get_client():
    return create_client(
        os.environ['NEXT_PUBLIC_SUPABASE_URL'],
        os.environ['SUPABASE_SERVICE_ROLE_KEY'],
    )

def compose_daily_brief() -> dict | None:
    """
    Fetch all pending alerts and compose an email.
    Returns dict with 'to', 'subject', 'body' for Gmail MCP, or None if no alerts.
    """
    client = get_client()
    result = client.table('ci_alerts') \
        .select('*') \
        .eq('status', 'pending') \
        .order('severity') \
        .execute()

    alerts = result.data
    if not alerts:
        return None

    # Count by severity
    critical = sum(1 for a in alerts if a['severity'] == 'critical')
    warning = sum(1 for a in alerts if a['severity'] == 'warning')
    info = sum(1 for a in alerts if a['severity'] == 'info')

    today = datetime.now(timezone.utc).strftime('%d %B %Y')
    subject = f"CI Daily Brief — {len(alerts)} alert{'s' if len(alerts) != 1 else ''}"
    if critical > 0:
        subject += f" ({critical} critical)"

    body_lines = [
        f"# Carisma Intelligence Daily Brief",
        f"**Date:** {today}",
        f"**Alerts:** {critical} critical, {warning} warning, {info} info",
        "",
        "---",
        "",
    ]

    for alert in alerts:
        emoji = SEVERITY_EMOJI.get(alert['severity'], '')
        body_lines.extend([
            f"### {emoji} [{alert['severity'].upper()}] {alert['title']}",
            f"**Department:** {alert['department']}",
            f"",
            f"{alert['description']}",
            f"",
            f"**Recommendation:** {alert['recommendation']}",
            f"",
            f"**Action:** Reply with `approve {alert['id']}` or `dismiss {alert['id']}`",
            f"",
            "---",
            "",
        ])

    body = '\n'.join(body_lines)

    # Mark alerts as emailed
    alert_ids = [a['id'] for a in alerts]
    for aid in alert_ids:
        client.table('ci_alerts').update({'status': 'emailed'}).eq('id', aid).execute()

    return {
        'to': os.environ.get('CI_EMAIL_TO', 'mert@carismawellness.com'),
        'subject': subject,
        'body': body,
    }


def compose_weekly_summary() -> dict | None:
    """Compose a weekly trend summary email."""
    # Aggregate week-over-week changes across all departments
    # This will query Supabase for current vs previous week metrics
    return None


def compose_monthly_executive() -> dict | None:
    """Compose a monthly executive summary with EBITDA, HC%, budget variance."""
    return None
```

**Step 2: Commit**

```bash
git add cockpit/ci/ci_emailer.py
git commit -m "feat(cockpit): add CI email composer for daily/weekly/monthly briefs"
```

---

### Task 22: CI executor (action dispatcher)

**Files:**
- Create: `cockpit/ci/ci_executor.py`

**Step 1: Write CI executor**

Create `cockpit/ci/ci_executor.py`:

```python
"""
Carisma Intelligence — Action Executor
Dispatches approved alert actions to the appropriate MCP server.
Designed to be called from Claude Code which has MCP access.
"""
import os
from datetime import datetime, timezone
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

def get_client():
    return create_client(
        os.environ['NEXT_PUBLIC_SUPABASE_URL'],
        os.environ['SUPABASE_SERVICE_ROLE_KEY'],
    )

def get_approved_actions() -> list[dict]:
    """Fetch all approved alerts waiting for execution."""
    client = get_client()
    result = client.table('ci_alerts') \
        .select('*') \
        .eq('status', 'approved') \
        .execute()
    return result.data or []

def execute_action(alert: dict) -> dict:
    """
    Execute the action defined in alert's action_payload.
    Returns execution result.
    
    This function returns the action details for Claude Code to execute
    via the appropriate MCP server. The actual MCP calls happen in the
    Claude Code trigger that calls this module.
    """
    payload = alert.get('action_payload', {})
    action_type = payload.get('type', 'alert_only')

    result = {
        'alert_id': alert['id'],
        'action_type': action_type,
        'status': 'pending_execution',
    }

    if action_type == 'pause_meta_ad':
        result['mcp_server'] = 'meta-ads'
        result['mcp_action'] = 'update_adset'
        result['mcp_params'] = {
            'adset_id': payload.get('data', {}).get('adset_id'),
            'status': 'PAUSED',
        }

    elif action_type == 'send_email':
        result['mcp_server'] = 'google-workspace'
        result['mcp_action'] = 'gmail_send_email'
        result['mcp_params'] = {
            'to': payload.get('data', {}).get('recipient'),
            'subject': f"CI Alert: {alert['title']}",
            'body': alert['recommendation'],
        }

    elif action_type == 'create_trello_card':
        result['mcp_server'] = 'trello'
        result['mcp_action'] = 'create_card'
        result['mcp_params'] = {
            'name': alert['title'],
            'desc': alert['recommendation'],
            'idList': payload.get('data', {}).get('list_id'),
        }

    elif action_type == 'send_whatsapp':
        result['mcp_server'] = 'whatsapp'
        result['mcp_action'] = 'send_message'
        result['mcp_params'] = {
            'chatId': payload.get('data', {}).get('chat_id'),
            'message': f"CI Alert: {alert['title']}\n{alert['recommendation']}",
        }

    elif action_type == 'alert_only':
        result['status'] = 'no_action_needed'

    return result

def mark_executed(alert_id: int):
    """Mark an alert as executed after successful MCP action."""
    client = get_client()
    client.table('ci_alerts').update({
        'status': 'executed',
        'executed_at': datetime.now(timezone.utc).isoformat(),
    }).eq('id', alert_id).execute()

def process_all_approved() -> list[dict]:
    """Get all approved actions and return execution instructions."""
    alerts = get_approved_actions()
    results = []
    for alert in alerts:
        result = execute_action(alert)
        results.append(result)
    return results
```

**Step 2: Commit**

```bash
git add cockpit/ci/ci_executor.py
git commit -m "feat(cockpit): add CI action executor with MCP dispatch"
```

---

### Task 23: CI Chat API route + component

**Files:**
- Create: `cockpit/app/api/ci/chat/route.ts`
- Create: `cockpit/components/ci/CIChat.tsx`
- Create: `cockpit/components/ci/MessageList.tsx`
- Create: `cockpit/components/ci/MessageInput.tsx`

**Step 1: Write CI Chat API route**

Create `cockpit/app/api/ci/chat/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SYSTEM_PROMPT = `You are Carisma Intelligence (CI), the AI analytics assistant for Carisma Wellness Group.
You have access to the company's business data across three brands (Spa, Aesthetics, Slimming) and five departments (Marketing, Sales/CRM, Finance, HR, Operations).

When asked about data, generate a SQL query to answer the question. The database has these tables:
- sales_weekly (week_start, location_id, brand_id, revenue_ex_vat, retail_pct, addon_pct, hotel_capture_pct)
- sales_by_rep (date, staff_id, brand_id, revenue, bookings_count, deposit_pct)
- crm_daily (date, brand_id, total_leads, leads_meta, leads_crm, speed_to_lead_median_min, conversion_rate_pct, total_calls, outbound_calls, appointments_booked)
- crm_by_rep (date, staff_id, brand_id, calls_made, appointments_booked, conversions, conversion_rate_pct)
- marketing_daily (date, brand_id, platform, spend, leads, cpl, roas, ctr_pct)
- ga4_daily (date, brand_id, sessions, total_users, bounce_rate_pct, conversions)
- gsc_daily (date, brand_id, clicks, impressions, avg_position)
- klaviyo_campaigns (date, brand_id, campaign_name, sends, opens, revenue)
- ebitda_monthly (month, brand_id, revenue, ebitda, ebitda_margin_pct)
- budget_vs_actual (month, brand_id, department, budgeted, actual, variance_pct)
- hr_weekly (week_start, location_id, brand_id, hc_pct, utilization_pct, headcount)
- we360_daily (date, staff_id, productivity_pct)
- therapist_utilization (week_start, staff_id, location_id, utilization_pct, bookings_count)
- operations_weekly (week_start, location_id, brand_id, google_reviews_avg, complaints_count)
- consult_funnel (week_start, brand_id, consults_booked, consults_attended, showup_pct, conversion_pct, aov)
- brands (id, slug, name)
- locations (id, brand_id, slug, name)
- staff (id, name, role, brand_id)

KPI Targets: Spa CPL <EUR8, Aes CPL <EUR12, Slim CPL <USD10, ROAS >5.0, Conversion >25%, HC% <40%, Utilization >75%, Speed to Lead <5min.

Always be specific with numbers. Reference targets when relevant. Be concise but thorough.
When you generate SQL, wrap it in <sql> tags so it can be extracted and executed.`;

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    // Step 1: Ask Claude to analyze the question and generate SQL if needed
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: message }],
    });

    const assistantText = response.content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("");

    // Step 2: Extract and execute SQL if present
    const sqlMatch = assistantText.match(/<sql>([\s\S]*?)<\/sql>/);
    let queryResult = null;
    let sqlQuery = null;

    if (sqlMatch) {
      sqlQuery = sqlMatch[1].trim();
      try {
        const { data, error } = await supabase.rpc("execute_readonly_query", {
          query_text: sqlQuery,
        });
        if (!error) {
          queryResult = data;
        }
      } catch {
        // SQL execution failed — return the analysis without data
      }
    }

    // Step 3: If we got data, ask Claude to interpret it
    let finalResponse = assistantText.replace(/<sql>[\s\S]*?<\/sql>/g, "").trim();

    if (queryResult) {
      const interpretation = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          { role: "user", content: message },
          { role: "assistant", content: `I queried the database and got: ${JSON.stringify(queryResult)}` },
          { role: "user", content: "Now interpret these results specifically and concisely." },
        ],
      });

      finalResponse = interpretation.content
        .filter((c) => c.type === "text")
        .map((c) => c.text)
        .join("");
    }

    return NextResponse.json({
      message: finalResponse,
      sql_query: sqlQuery,
      data: queryResult,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "CI Chat failed" },
      { status: 500 }
    );
  }
}
```

**Step 2: Write CI Chat components**

Create `cockpit/components/ci/MessageList.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  sql_query?: string;
}

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-4 max-h-64 overflow-y-auto p-4">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={cn(
            "flex",
            msg.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          <div
            className={cn(
              "max-w-[80%] rounded-lg px-4 py-2 text-sm",
              msg.role === "user"
                ? "bg-navy text-white"
                : "bg-gray-100 text-gray-900"
            )}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
            {msg.sql_query && (
              <details className="mt-2">
                <summary className="text-xs text-gray-400 cursor-pointer">
                  View SQL query
                </summary>
                <pre className="mt-1 text-xs bg-gray-200 rounded p-2 overflow-x-auto">
                  {msg.sql_query}
                </pre>
              </details>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

Create `cockpit/components/ci/MessageInput.tsx`:

```tsx
"use client";

import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [input, setInput] = useState("");

  function handleSend() {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex items-center gap-2 p-4 border-t border-gray-200">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask Carisma Intelligence..."
        disabled={disabled}
        className="flex-1"
      />
      <Button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        size="icon"
        className="bg-navy hover:bg-navy-light"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

Create `cockpit/components/ci/CIChat.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sql_query?: string;
}

export function CIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSend(content: string) {
    const userMsg: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/ci/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        role: "assistant",
        content: data.message || "Sorry, I couldn't process that request.",
        sql_query: data.sql_query,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5 text-gold" />
          Carisma Intelligence
        </CardTitle>
      </CardHeader>
      <MessageList messages={messages} />
      <MessageInput onSend={handleSend} disabled={loading} />
    </Card>
  );
}
```

**Step 3: Commit**

```bash
git add cockpit/app/api/ci/ cockpit/components/ci/
git commit -m "feat(cockpit): add CI Chat API route + frontend components"
```

---

## Phase 6: CI Alert API Routes (Tasks 24-25)

### Task 24: Alert list + approve/dismiss API routes

**Files:**
- Create: `cockpit/app/api/ci/alerts/route.ts`
- Create: `cockpit/app/api/ci/approve/route.ts`

**Step 1: Write alerts list route**

Create `cockpit/app/api/ci/alerts/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const department = searchParams.get("department");
  const limit = parseInt(searchParams.get("limit") || "20");

  let query = supabase
    .from("ci_alerts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("status", status);
  if (department) query = query.eq("department", department);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ alerts: data });
}
```

**Step 2: Write approve/dismiss route**

Create `cockpit/app/api/ci/approve/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { alert_id, action } = await request.json();

  if (!alert_id || !["approve", "dismiss"].includes(action)) {
    return NextResponse.json(
      { error: "alert_id and action (approve|dismiss) required" },
      { status: 400 }
    );
  }

  const newStatus = action === "approve" ? "approved" : "dismissed";
  const updates: Record<string, unknown> = { status: newStatus };
  if (action === "approve") {
    updates.approved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("ci_alerts")
    .update(updates)
    .eq("id", alert_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ alert: data });
}
```

**Step 3: Commit**

```bash
git add cockpit/app/api/ci/
git commit -m "feat(cockpit): add CI alerts list and approve/dismiss API routes"
```

---

### Task 25: Alert Feed component + integrate CI Chat into all pages

**Files:**
- Create: `cockpit/components/dashboard/AlertFeed.tsx`
- Modify: `cockpit/app/ceo/page.tsx` (add CIChat + AlertFeed)

**Step 1: Write AlertFeed component**

Create `cockpit/components/dashboard/AlertFeed.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: number;
  created_at: string;
  department: string;
  severity: "info" | "warning" | "critical";
  title: string;
  recommendation: string;
  status: string;
}

export function AlertFeed() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    fetch("/api/ci/alerts?limit=10")
      .then((r) => r.json())
      .then((d) => setAlerts(d.alerts || []))
      .catch(() => {});
  }, []);

  async function handleAction(alertId: number, action: "approve" | "dismiss") {
    await fetch("/api/ci/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alert_id: alertId, action }),
    });
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? { ...a, status: action === "approve" ? "approved" : "dismissed" }
          : a
      )
    );
  }

  const severityConfig = {
    critical: { color: "bg-red-100 text-red-700", icon: AlertTriangle },
    warning: { color: "bg-amber-100 text-amber-700", icon: Bell },
    info: { color: "bg-blue-100 text-blue-700", icon: Bell },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5 text-gold" />
          CI Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 && (
          <p className="text-sm text-gray-400">No alerts</p>
        )}
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;
          return (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-gray-100"
            >
              <Icon className={cn("h-5 w-5 mt-0.5", alert.severity === "critical" ? "text-red-500" : alert.severity === "warning" ? "text-amber-500" : "text-blue-500")} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={config.color}>
                    {alert.severity}
                  </Badge>
                  <Badge variant="outline">{alert.department}</Badge>
                  <Badge variant="outline">{alert.status}</Badge>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{alert.title}</p>
                <p className="text-xs text-gray-500 mt-1">{alert.recommendation}</p>
              </div>
              {(alert.status === "emailed" || alert.status === "pending") && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-green-600 hover:text-green-700"
                    onClick={() => handleAction(alert.id, "approve")}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={() => handleAction(alert.id, "dismiss")}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
```

**Step 2: Add CIChat and AlertFeed to CEO page**

Add these imports and components to `cockpit/app/ceo/page.tsx` after the chart grid:

```tsx
// Add imports at top:
import { CIChat } from "@/components/ci/CIChat";
import { AlertFeed } from "@/components/dashboard/AlertFeed";

// Add after the chart grid, before the closing </>:
          <AlertFeed />
          <CIChat />
```

**Step 3: Commit**

```bash
git add cockpit/components/dashboard/AlertFeed.tsx cockpit/app/ceo/page.tsx
git commit -m "feat(cockpit): add AlertFeed component and integrate CI Chat into CEO view"
```

---

## Phase 7: ETL Status + Data Wiring (Tasks 26-27)

### Task 26: ETL status API route

**Files:**
- Create: `cockpit/app/api/etl/status/route.ts`

**Step 1: Write ETL status route**

Create `cockpit/app/api/etl/status/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("etl_sync_log")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ syncs: data });
}
```

**Step 2: Commit**

```bash
git add cockpit/app/api/etl/
git commit -m "feat(cockpit): add ETL sync status API route"
```

---

### Task 27: Wire dashboard pages to Supabase (replace mock data)

**Files:**
- Create: `cockpit/lib/hooks/useKPIData.ts`
- Modify: Each department page to use real data hooks

**Step 1: Write useKPIData hook**

Create `cockpit/lib/hooks/useKPIData.ts`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";

interface UseKPIDataOptions {
  table: string;
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
  dateColumn?: string;
  brandColumn?: string;
}

export function useKPIData<T = Record<string, unknown>>({
  table,
  dateFrom,
  dateTo,
  brandFilter,
  dateColumn = "date",
  brandColumn = "brand_id",
}: UseKPIDataOptions) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      let query = supabase
        .from(table)
        .select("*")
        .gte(dateColumn, format(dateFrom, "yyyy-MM-dd"))
        .lte(dateColumn, format(dateTo, "yyyy-MM-dd"))
        .order(dateColumn, { ascending: true });

      if (brandFilter) {
        // Look up brand_id from slug
        const brandIds: Record<string, number> = {
          spa: 1,
          aesthetics: 2,
          slimming: 3,
        };
        const brandId = brandIds[brandFilter];
        if (brandId) {
          query = query.eq(brandColumn, brandId);
        }
      }

      const { data: result, error: err } = await query;

      if (err) {
        setError(err.message);
        setData([]);
      } else {
        setData((result as T[]) || []);
      }

      setLoading(false);
    }

    fetchData();
  }, [table, dateFrom, dateTo, brandFilter, dateColumn, brandColumn]);

  return { data, loading, error };
}
```

**Note:** Each department page should be updated to replace mock data with `useKPIData` calls. This is a straightforward find-and-replace per page — swap `mockKPIs` with computed values from the hook's returned data. This wiring is best done once the Supabase project is live and seeded with real data, so the mock data serves as the visual scaffold.

**Step 2: Commit**

```bash
git add cockpit/lib/hooks/useKPIData.ts
git commit -m "feat(cockpit): add useKPIData hook for Supabase data fetching"
```

---

## Phase 8: Final Integration + Deployment (Tasks 28-30)

### Task 28: Add CI Chat to all department pages

**Files:**
- Modify: `cockpit/app/marketing/page.tsx`
- Modify: `cockpit/app/sales/page.tsx`
- Modify: `cockpit/app/finance/page.tsx`
- Modify: `cockpit/app/hr/page.tsx`
- Modify: `cockpit/app/operations/page.tsx`

**Step 1:** Add these two lines to each page file:

Import at top:
```tsx
import { CIChat } from "@/components/ci/CIChat";
```

Before the closing `</>` in each page's return:
```tsx
          <CIChat />
```

**Step 2: Commit**

```bash
git add cockpit/app/
git commit -m "feat(cockpit): add CI Chat to all department dashboard pages"
```

---

### Task 29: Verify build compiles

**Step 1: Install dependencies and build**

```bash
cd cockpit
npm install
npm run build
```

Expected: Build succeeds with no TypeScript errors.

**Step 2: Fix any build errors**

If there are type errors, fix them. Common issues:
- Missing type imports
- Unused imports from recharts
- shadcn/ui component props

**Step 3: Commit fixes**

```bash
git add cockpit/
git commit -m "fix(cockpit): resolve build errors"
```

---

### Task 30: Create README with setup instructions

**Files:**
- Modify: `cockpit/README.md`

**Step 1: Write README**

```markdown
# Carisma CEO Cockpit

Business intelligence dashboard for Carisma Wellness Group.

## Setup

### 1. Supabase

1. Create a Supabase project at https://supabase.com
2. Run migrations in order: `cockpit/supabase/migrations/001_*.sql` through `012_*.sql`
3. Run seed files: `cockpit/supabase/seed/001_*.sql` through `003_*.sql`
4. Copy project URL and anon key

### 2. Environment

```bash
cp .env.local.example .env.local
# Fill in Supabase URL, anon key, service role key, and Anthropic API key
```

### 3. Install & Run

```bash
cd cockpit
npm install
npm run dev
```

Open http://localhost:3000

### 4. Create First User

In Supabase Dashboard → Authentication → Users → Create User with email/password.
Then update their profile role:

```sql
UPDATE profiles SET role = 'ceo', full_name = 'Mert Gulen' WHERE id = '<user-uuid>';
```

### 5. ETL Setup

```bash
cd cockpit/etl
pip install -r requirements.txt
```

ETL scripts are invoked by Claude Code scheduled triggers. See `docs/plans/2026-04-14-ceo-cockpit-design.md` for schedule.

## Tech Stack

- **Frontend:** Next.js 14 + Tailwind + shadcn/ui + Recharts
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **ETL:** Python 3.11
- **CI Engine:** Claude API + Gmail/Meta/Trello/WhatsApp MCP
```

**Step 2: Commit**

```bash
git add cockpit/README.md
git commit -m "docs(cockpit): add setup README"
```

---

## Summary

| Phase | Tasks | What It Builds |
|---|---|---|
| 1 | 1-5 | Next.js scaffold + all 12 Supabase migrations + seed + RLS |
| 2 | 6-9 | Supabase client + auth + login + layout shell + reusable components |
| 3 | 10-15 | All 6 department dashboard views (CEO, Marketing, Sales, Finance, HR, Ops) |
| 4 | 16-19 | ETL shared utilities + all 15 ETL scripts |
| 5 | 20-23 | CI rules engine + analyzer + emailer + executor + chat |
| 6 | 24-25 | CI alert API routes + AlertFeed component |
| 7 | 26-27 | ETL status API + useKPIData hook for real data wiring |
| 8 | 28-30 | CI Chat on all pages + build verification + README |

**Total: 30 tasks, 8 phases, ~30 commits**
