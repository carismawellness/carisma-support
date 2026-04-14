-- Carisma Cockpit Dashboard — Supabase PostgreSQL Schema
-- Run this against your Supabase SQL Editor to create all tables.

-- =============================================================================
-- 1. DAILY SALES — Revenue by brand/location/day
-- =============================================================================
CREATE TABLE IF NOT EXISTS daily_sales (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    brand TEXT NOT NULL CHECK (brand IN ('carisma_spa', 'carisma_aesthetics', 'carisma_slimming')),
    location TEXT NOT NULL,
    revenue_ex_vat NUMERIC(12,2) DEFAULT 0,
    retail_revenue NUMERIC(12,2) DEFAULT 0,
    addon_revenue NUMERIC(12,2) DEFAULT 0,
    memberships_count INTEGER DEFAULT 0,
    hotel_guest_capture_pct NUMERIC(5,2),
    consults_count INTEGER DEFAULT 0,
    aov NUMERIC(10,2),
    repeat_customer_count INTEGER DEFAULT 0,
    bookings_per_therapist NUMERIC(6,2),
    course_conversion_pct NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, brand, location)
);

CREATE INDEX idx_daily_sales_date ON daily_sales(date);
CREATE INDEX idx_daily_sales_brand ON daily_sales(brand);
CREATE INDEX idx_daily_sales_brand_date ON daily_sales(brand, date);

-- =============================================================================
-- 2. WEEKLY EBITDA — P&L by business unit/week
-- =============================================================================
CREATE TABLE IF NOT EXISTS weekly_ebitda (
    id BIGSERIAL PRIMARY KEY,
    week_start DATE NOT NULL,
    business_unit TEXT NOT NULL,
    location TEXT,
    trading_income NUMERIC(12,2) DEFAULT 0,
    wages NUMERIC(12,2) DEFAULT 0,
    cogs NUMERIC(12,2) DEFAULT 0,
    rent NUMERIC(12,2) DEFAULT 0,
    sga NUMERIC(12,2) DEFAULT 0,
    opex NUMERIC(12,2) DEFAULT 0,
    ebitda NUMERIC(12,2) DEFAULT 0,
    hc_pct NUMERIC(5,2),
    budget_revenue NUMERIC(12,2),
    budget_variance_pct NUMERIC(6,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(week_start, business_unit, location)
);

CREATE INDEX idx_weekly_ebitda_week ON weekly_ebitda(week_start);
CREATE INDEX idx_weekly_ebitda_unit ON weekly_ebitda(business_unit);

-- =============================================================================
-- 3. MARKETING PERFORMANCE — Ad spend/performance by channel/brand/day
-- =============================================================================
CREATE TABLE IF NOT EXISTS marketing_performance (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    brand TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('meta', 'google', 'organic', 'email', 'wix')),
    spend NUMERIC(10,2) DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    leads INTEGER DEFAULT 0,
    cpl NUMERIC(10,2),
    ctr NUMERIC(6,3),
    cpc NUMERIC(10,2),
    roas NUMERIC(8,2),
    conversions INTEGER DEFAULT 0,
    website_revenue NUMERIC(12,2) DEFAULT 0,
    email_attributed_revenue NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, brand, channel)
);

CREATE INDEX idx_marketing_perf_date ON marketing_performance(date);
CREATE INDEX idx_marketing_perf_brand ON marketing_performance(brand);
CREATE INDEX idx_marketing_perf_channel ON marketing_performance(channel);

-- =============================================================================
-- 4. CRM PERFORMANCE — Sales team metrics by rep/brand/day
-- =============================================================================
CREATE TABLE IF NOT EXISTS crm_performance (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    brand TEXT NOT NULL,
    rep_name TEXT NOT NULL,
    total_leads INTEGER DEFAULT 0,
    meta_leads INTEGER DEFAULT 0,
    crm_leads INTEGER DEFAULT 0,
    leads_in_hours INTEGER DEFAULT 0,
    leads_out_hours INTEGER DEFAULT 0,
    speed_to_lead_median_min NUMERIC(8,2),
    speed_to_lead_mean_min NUMERIC(8,2),
    outbound_calls INTEGER DEFAULT 0,
    total_calls INTEGER DEFAULT 0,
    calls_outside_hours INTEGER DEFAULT 0,
    conversion_rate_pct NUMERIC(5,2),
    deposit_got_pct NUMERIC(5,2),
    appointments_booked INTEGER DEFAULT 0,
    sales_amount NUMERIC(12,2) DEFAULT 0,
    unreplied_crm INTEGER DEFAULT 0,
    unreplied_wa INTEGER DEFAULT 0,
    unreplied_email INTEGER DEFAULT 0,
    crm_check_pass BOOLEAN DEFAULT TRUE,
    workable_leads INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, brand, rep_name)
);

CREATE INDEX idx_crm_perf_date ON crm_performance(date);
CREATE INDEX idx_crm_perf_brand ON crm_performance(brand);
CREATE INDEX idx_crm_perf_rep ON crm_performance(rep_name);

-- =============================================================================
-- 5. HR METRICS — Headcount, utilization, recruitment by location/week
-- =============================================================================
CREATE TABLE IF NOT EXISTS hr_metrics (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    location TEXT NOT NULL,
    brand TEXT NOT NULL,
    total_employees INTEGER DEFAULT 0,
    management_count INTEGER DEFAULT 0,
    ft_therapists INTEGER DEFAULT 0,
    pt_therapists INTEGER DEFAULT 0,
    interns INTEGER DEFAULT 0,
    advisors_reception INTEGER DEFAULT 0,
    utilisation_pct NUMERIC(5,2),
    hc_vs_pl_pct NUMERIC(5,2),
    therapist_mgmt_ratio NUMERIC(5,2),
    sick_leaves INTEGER DEFAULT 0,
    applications INTEGER DEFAULT 0,
    headhunted INTEGER DEFAULT 0,
    interviews INTEGER DEFAULT 0,
    offers_given INTEGER DEFAULT 0,
    offers_accepted INTEGER DEFAULT 0,
    new_employees INTEGER DEFAULT 0,
    left_employees INTEGER DEFAULT 0,
    net_movement INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, location, brand)
);

CREATE INDEX idx_hr_metrics_date ON hr_metrics(date);
CREATE INDEX idx_hr_metrics_brand ON hr_metrics(brand);

-- =============================================================================
-- 6. OPERATIONS METRICS — Reviews, complaints, maintenance by location/day
-- =============================================================================
CREATE TABLE IF NOT EXISTS operations_metrics (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    location TEXT NOT NULL,
    brand TEXT NOT NULL,
    google_rating NUMERIC(3,1),
    google_rating_weekly_delta NUMERIC(3,2),
    reviews_count INTEGER DEFAULT 0,
    bad_reviews_count INTEGER DEFAULT 0,
    complaints_count INTEGER DEFAULT 0,
    maintenance_open INTEGER DEFAULT 0,
    maintenance_done INTEGER DEFAULT 0,
    brand_standards_compliance_pct NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, location, brand)
);

CREATE INDEX idx_ops_metrics_date ON operations_metrics(date);
CREATE INDEX idx_ops_metrics_location ON operations_metrics(location);

-- =============================================================================
-- 7. EMPLOYEE PRODUCTIVITY — We360 time tracking per employee/day
-- =============================================================================
CREATE TABLE IF NOT EXISTS employee_productivity (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    employee_name TEXT NOT NULL,
    department TEXT,
    brand TEXT,
    attendance_status TEXT CHECK (attendance_status IN ('present', 'absent', 'late', 'half_day', 'leave')),
    online_time_min INTEGER DEFAULT 0,
    active_time_min INTEGER DEFAULT 0,
    idle_time_min INTEGER DEFAULT 0,
    productive_time_min INTEGER DEFAULT 0,
    unproductive_time_min INTEGER DEFAULT 0,
    neutral_time_min INTEGER DEFAULT 0,
    breaks_min INTEGER DEFAULT 0,
    productivity_pct NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, employee_name)
);

CREATE INDEX idx_emp_prod_date ON employee_productivity(date);
CREATE INDEX idx_emp_prod_employee ON employee_productivity(employee_name);
CREATE INDEX idx_emp_prod_brand ON employee_productivity(brand);

-- =============================================================================
-- 8. WEB ANALYTICS — GA4 + GSC metrics by brand/day
-- =============================================================================
CREATE TABLE IF NOT EXISTS web_analytics (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    brand TEXT NOT NULL,
    sessions INTEGER DEFAULT 0,
    users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    avg_session_duration_sec NUMERIC(8,2),
    bounce_rate_pct NUMERIC(5,2),
    conversion_events INTEGER DEFAULT 0,
    organic_clicks INTEGER DEFAULT 0,
    organic_impressions INTEGER DEFAULT 0,
    organic_ctr_pct NUMERIC(6,3),
    avg_position NUMERIC(6,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, brand)
);

CREATE INDEX idx_web_analytics_date ON web_analytics(date);
CREATE INDEX idx_web_analytics_brand ON web_analytics(brand);

-- =============================================================================
-- 9. EMAIL MARKETING — Klaviyo metrics by brand/day
-- =============================================================================
CREATE TABLE IF NOT EXISTS email_marketing (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    brand TEXT NOT NULL,
    active_subscribers INTEGER DEFAULT 0,
    popup_capture_rate_pct NUMERIC(5,2),
    campaign_revenue NUMERIC(12,2) DEFAULT 0,
    flow_revenue NUMERIC(12,2) DEFAULT 0,
    total_email_revenue NUMERIC(12,2) DEFAULT 0,
    email_revenue_pct NUMERIC(5,2),
    open_rate_pct NUMERIC(5,2),
    click_rate_pct NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, brand)
);

CREATE INDEX idx_email_mkt_date ON email_marketing(date);
CREATE INDEX idx_email_mkt_brand ON email_marketing(brand);

-- =============================================================================
-- 10. BUDGET TARGETS — Static reference table
-- =============================================================================
CREATE TABLE IF NOT EXISTS budget_targets (
    id BIGSERIAL PRIMARY KEY,
    period TEXT NOT NULL,
    brand TEXT NOT NULL,
    location TEXT,
    revenue_budget NUMERIC(12,2),
    ebitda_budget NUMERIC(12,2),
    cpl_target NUMERIC(10,2),
    hc_pct_target NUMERIC(5,2) DEFAULT 40.0,
    utilisation_target NUMERIC(5,2) DEFAULT 75.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(period, brand, location)
);

-- =============================================================================
-- HELPER: Auto-update updated_at on row changes
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'daily_sales', 'weekly_ebitda', 'marketing_performance',
            'crm_performance', 'hr_metrics', 'operations_metrics',
            'employee_productivity', 'web_analytics', 'email_marketing',
            'budget_targets'
        ])
    LOOP
        EXECUTE format(
            'CREATE TRIGGER update_%s_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
            tbl, tbl
        );
    END LOOP;
END;
$$;

-- =============================================================================
-- ROW LEVEL SECURITY (optional — enable if needed for API access)
-- =============================================================================
-- Uncomment to enable RLS with anon read access:
-- ALTER TABLE daily_sales ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow anon read" ON daily_sales FOR SELECT USING (true);
-- (repeat for each table)
