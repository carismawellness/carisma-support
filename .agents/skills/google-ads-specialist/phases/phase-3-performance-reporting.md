# Phase 3: Performance Reporting (Report)

## Purpose

Pull Google Ads performance data for the requested brand(s) and period. Produce a CMO-ready performance report with key metrics, trends, and flags.

## Procedure

1. **Determine reporting period:** Default to last 7 days. Accept custom date ranges.
2. **Pull Google Ads data** per campaign per brand:
   - Clicks
   - Impressions
   - CPC (Cost Per Click)
   - CTR (Click-Through Rate)
   - Conversions
   - Cost (total spend)
   - Conversion rate
3. **Compare to targets** from `config/kpi_thresholds.json`
4. **Classify campaigns:**
   - **Winner:** CPL below target, conversion rate above benchmark
   - **Watchlist:** CPL within 20% of target, needs monitoring
   - **Loser:** CPL exceeds target by >20%, recommend action
5. **Flag anomalies:**
   - Spend spikes (>30% above daily average)
   - CPC jumps (competitor activity or quality score drop)
   - Conversion drops (landing page issue or tracking problem)
6. **Output** the report

## Output Format

### Summary Table

| Brand | Campaign | Clicks | CPC | Conversions | Spend | CPL | Status |
|-------|----------|--------|-----|-------------|-------|-----|--------|
| Spa | Search: Spa Day | ... | ... | ... | ... | ... | Winner/Watchlist/Loser |

### Key Findings
- Top 3 findings with specific numbers
- Any demand-toggle recommendations (Spa LHR: should it be ON or OFF?)
- Cross-brand patterns (e.g., "LHR search volume rising across both Spa and Aesthetics")

### Recommendations
- Budget shift recommendations (within Google channel)
- Campaigns needing attention
- Opportunities identified

## Data Source

**Current state:** Google Ads API access is not yet configured via MCP. Until a Google Ads MCP is available:
- Pull data manually from Google Ads dashboard
- Use Google Sheets if performance data is exported there
- Use Google Analytics conversion data as a proxy

**Future state:** When Google Ads MCP is configured, this phase will pull data programmatically.

## Reporting Cadence

- **Weekly:** Standard performance report → CMO
- **Monthly:** Trend analysis with month-over-month comparison
- **On-demand:** When CMO or CEO requests a specific campaign review
