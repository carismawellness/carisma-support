# 11 - Weekly Reporting

## Objective

Generate a comprehensive weekly performance report covering all brands. Pull 7-day data, compute key metrics with week-over-week trends, summarise what was launched/paused/scaled, and write the report to the Google Sheets "Weekly Report" tab. This report provides the strategic overview for planning the next week's cycle.

## Required Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `config/brands.json` | Manual config | Ad account IDs, CPL targets, monthly budgets |
| `.tmp/performance/review_classified_{brand}_{date}.json` | Workflow 09 output | Most recent performance review data |
| `.tmp/publishing/ads_{brand}_{date}.json` | Workflow 08 output | Published campaigns this week |
| `.tmp/iteration/lineage_{brand}_{date}.json` | Workflow 10 output | Iteration tracking data |
| Previous week's report data | Google Sheets | For week-over-week comparison |
| `.env` | Environment | `META_ACCESS_TOKEN`, Google Sheets credentials |

## Tools Used

| Tool | Purpose |
|------|---------|
| `tools/pull_ad_insights.py` | Pull 7-day performance data from Meta API |
| `tools/update_google_sheet.py` | Write report to Google Sheets |

## Schedule

Run every **Friday** as the final workflow of the weekly cycle.

## Step-by-Step Procedure

### Step 1: Pull 7-Day Data

Run `tools/pull_ad_insights.py` for each brand:

```
--ad_account_id "<from brands.json>"
--level "ad"
--date_range "last_7d"
--fields "ad_id,ad_name,adset_name,campaign_name,spend,impressions,reach,frequency,clicks,ctr,cpc,actions,cost_per_action_type"
--output ".tmp/reporting/weekly_raw_{brand}_{date}.json"
```

Also pull account-level summary:
```
--level "account"
--date_range "last_7d"
--output ".tmp/reporting/weekly_account_{brand}_{date}.json"
```

Also pull the previous 7 days (8-14 days ago) for comparison:
```
--level "account"
--date_range "last_14d"  (then subtract this week's data to get previous week)
--output ".tmp/reporting/weekly_previous_{brand}_{date}.json"
```

### Step 2: Compute Weekly Metrics

For each brand, compute:

| Metric | Calculation | Unit |
|--------|-------------|------|
| Total Spend | Sum of all ad spend in 7 days | EUR |
| Total Leads | Sum of all lead events in 7 days | Count |
| Average CPL | Total Spend / Total Leads | EUR |
| Total Impressions | Sum of impressions | Count |
| Total Reach | Unique people reached | Count |
| Average CTR | Weighted average CTR across ads | % |
| Average CPC | Total Spend / Total Clicks | EUR |
| Active Ads | Count of ads with status ACTIVE | Count |
| Budget Utilisation | (Total Spend / Weekly Budget Allocation) x 100 | % |

Week-over-week trend:
```
Trend = ((This Week - Last Week) / Last Week) x 100
```

Classify each trend:
- Improving: positive for leads/CTR, negative for CPL/CPC
- Declining: inverse
- Stable: < 5% change

### Step 3: Compile Activity Log

Gather what happened this week across all workflows:

#### Launched (from workflow 08)
- Parse `.tmp/publishing/ads_{brand}_{date}.json`
- List all new campaigns, ad sets, and ads created this week
- Include: ad name, format, hook, offer, launch date

#### Paused (from workflow 09 + human decisions)
- Parse the Google Sheets "Performance Dashboard" for human decisions
- List all ads paused this week with reason (loser, fatigue, budget)
- Include: ad name, CPL at time of pause, total spend, reason

#### Scaled (from workflow 09 + human decisions)
- List all ads/ad sets where budget was increased
- Include: ad name, previous budget, new budget, performance metrics

#### Iterated (from workflow 10)
- Parse `.tmp/iteration/lineage_{brand}_{date}.json`
- List all iteration variations created
- Include: parent ad name, variation type, status

### Step 4: Identify Top and Bottom Performers

**Top 3 Ads (by CPL, minimum 5 leads):**

| Rank | Ad Name | CPL | Leads | Spend | Status |
|------|---------|-----|-------|-------|--------|
| 1 | CS_SpaDay_UGC_Question_v1 | EUR 5.50 | 18 | EUR 99.00 | Winner |
| 2 | CS_SpaDay_Testimonial_v1 | EUR 6.20 | 12 | EUR 74.40 | Winner |
| 3 | CA_Botox_FounderLed_Social_v1 | EUR 9.80 | 8 | EUR 78.40 | Winner |

**Bottom 3 Ads (by CPL, minimum EUR 30 spend):**

| Rank | Ad Name | CPL | Leads | Spend | Status |
|------|---------|-----|-------|-------|--------|
| 1 | CS_GiftVoucher_UGC_Urgency_v1 | N/A | 0 | EUR 42.00 | Paused |
| 2 | CA_Fillers_Static_Bold_v2 | EUR 28.00 | 1 | EUR 28.00 | Loser |
| 3 | CS_SpaDay_Static_Bold_v1 | EUR 18.50 | 2 | EUR 37.00 | Paused |

### Step 5: Generate Insights and Learnings

Analyse the week's data to extract actionable insights:

**Creative Insights:**
- Which hook category performed best this week?
- Which format had the lowest average CPL?
- Were iterations outperforming originals?
- Any new patterns emerging?

**Audience Insights:**
- Which ad sets (audiences) were most efficient?
- Any signs of audience saturation?
- Should new audiences be tested next week?

**Offer Insights:**
- Which offer converted best?
- Is the offer still compelling or does it need refreshing?
- Any seasonal factors affecting performance?

**Budget Insights:**
- Is the monthly budget on track or over/under-spending?
- Should daily budget be adjusted?
- Is CBO allocating budget appropriately?

### Step 6: Draft Next Week Plan

Based on this week's data, outline priorities for next Monday:

```markdown
### Next Week Plan

#### Research (Monday AM)
- Refresh competitor research for: {competitors}
- Focus areas: {specific things to look for based on this week's learnings}

#### New Scripts (Monday PM)
- Priority hooks to test: {based on this week's winning patterns}
- Offers to focus on: {best converting offers}
- Formats to prioritise: {best converting formats}

#### Iterations
- Winners to iterate: {list}
- Variation types to prioritise: {based on what worked this week}

#### Budget Adjustments
- Recommended weekly budget: EUR {amount}
- Reallocation suggestions: {shift spend from underperforming to winning areas}

#### Open Questions
- {Any unresolved questions or decisions needed from stakeholders}
```

### Step 7: Write to Google Sheets

Run `tools/update_google_sheet.py`:

```
--spreadsheet_id "<google_sheet_id>"
--tab "Weekly Report"
--mode "new_section"
--data ".tmp/reporting/weekly_report_{date}.json"
```

The "Weekly Report" tab structure:

```
ROW 1: Week of {start_date} to {end_date}
ROW 2: (blank separator)
ROW 3-10: Summary Metrics Table (with WoW trends)
ROW 11: (blank separator)
ROW 12-20: Per-Brand Breakdown
ROW 21: (blank separator)
ROW 22-35: Activity Log (Launched / Paused / Scaled / Iterated)
ROW 36: (blank separator)
ROW 37-45: Top & Bottom Performers
ROW 46: (blank separator)
ROW 47-55: Insights & Learnings
ROW 56: (blank separator)
ROW 57-70: Next Week Plan
```

Each week's report is appended below the previous week's, creating a rolling history.

### Step 8: Generate Local Report Copy

Also generate a local markdown copy for reference:

Save to: `.tmp/reporting/weekly_report_{date}.md`

## Expected Outputs

| Output | Path | Description |
|--------|------|-------------|
| Raw 7-day data | `.tmp/reporting/weekly_raw_{brand}_{date}.json` | API data per brand |
| Account summary | `.tmp/reporting/weekly_account_{brand}_{date}.json` | Account-level metrics |
| Report data | `.tmp/reporting/weekly_report_{date}.json` | Structured report data |
| Local report | `.tmp/reporting/weekly_report_{date}.md` | Markdown copy |
| Google Sheet | "Weekly Report" tab | Published report |

### Full Report Structure

```markdown
# Weekly Performance Report
## Week of {Monday date} to {Friday date}

---

## Executive Summary
- **Total spend across brands:** EUR {total}
- **Total leads generated:** {total}
- **Blended CPL:** EUR {blended}
- **Week-over-week trend:** {improving/declining/stable}

---

## Brand: Carisma Spa

### Key Metrics
| Metric | This Week | Last Week | Trend | Target |
|--------|----------|-----------|-------|--------|
| Spend | EUR 350 | EUR 320 | +9.4% | EUR 375/wk |
| Leads | 48 | 40 | +20.0% | n/a |
| Avg CPL | EUR 7.29 | EUR 8.00 | -8.9% | EUR 8.00 |
| Active Ads | 8 | 6 | +2 | n/a |
| Impressions | 52,000 | 45,000 | +15.6% | n/a |
| Avg CTR | 1.8% | 1.6% | +12.5% | n/a |

### Monthly Budget Tracker
- Monthly budget: EUR 1,500
- Spent this month (MTD): EUR 850
- Projected month-end: EUR 1,460
- Status: On track

### Activity This Week
**Launched:** 4 new ads (2 UGC video, 1 static, 1 text overlay)
**Paused:** 2 ads (CS_SpaDay_Static_Bold_v2 - high CPL, CS_GiftVoucher_UGC_Urgency_v1 - zero leads)
**Scaled:** 1 ad (CS_SpaDay_UGC_Question_v1 - budget +20%)
**Iterated:** 3 variations of CS_SpaDay_UGC_Question_v1 in production

---

## Brand: Carisma Aesthetics

### Key Metrics
| Metric | This Week | Last Week | Trend | Target |
|--------|----------|-----------|-------|--------|
| Spend | EUR 280 | EUR 310 | -9.7% | EUR 375/wk |
| Leads | 20 | 22 | -9.1% | n/a |
| Avg CPL | EUR 14.00 | EUR 14.09 | -0.6% | EUR 12.00 |
| Active Ads | 6 | 8 | -2 | n/a |

(... same structure ...)

---

## Cross-Brand Insights

### What Worked
- Question hooks continue to outperform (avg CPL EUR 6.80 vs EUR 11.20 for other types)
- UGC video format is the strongest performer for Carisma Spa
- Spa Day package converts significantly better than Gift Voucher

### What Didn't Work
- Bold claim hooks underperformed for both brands
- Static ads struggling compared to video (consider reducing static volume)
- Urgency hooks with Gift Voucher offer had zero conversions

### Learnings
- Malta audience responds best to relatable, conversational UGC
- Social proof elements in the body section (not just as hooks) improve hold rates
- Aesthetics brand CPL is above target -- may need audience expansion or new offer

---

## Next Week Plan

### Monday AM: Research
- [ ] Refresh competitor research (check if competitors launched new campaigns)
- [ ] Focus on finding more question-style hooks (our best performing category)

### Monday PM: Scripts
- [ ] Generate 4 new Carisma Spa scripts (prioritise Spa Day offer, UGC format)
- [ ] Generate 4 new Carisma Aesthetics scripts (test new audiences + offers)
- [ ] Complete 3 iteration scripts for CS_SpaDay_UGC_Question_v1

### Tuesday: Production
- [ ] Film 2 new UGC videos for Carisma Spa
- [ ] Render 3 automated variations
- [ ] Film 1 founder-led video for Carisma Aesthetics

### Wednesday: Publishing
- [ ] Publish new week's campaigns (PAUSED)
- [ ] First performance review of this week's launched ads

### Budget Recommendation
- Carisma Spa: Maintain current daily budget (spending well, on track)
- Carisma Aesthetics: Consider reducing budget 10% until CPL improves, or test broader audience

### Open Questions for Stakeholder
- Should we add a new offer for Carisma Aesthetics? Current offers may be stale.
- Are there new spa treatments launching that could become ad content?
- Budget reallocation: should we shift more to Carisma Spa given better CPL?
```

## Edge Cases and Error Handling

### No Data for the Week
- If a brand had no active campaigns during the report week:
  - Report zeroes for all metrics
  - Note "No active campaigns this week" in the activity log
  - Still include the brand section with historical context

### Previous Week Data Unavailable
- If this is the first weekly report (no previous week to compare):
  - Skip week-over-week trends
  - Note "First report - no prior week comparison available"
  - Still compute and present all current week metrics

### Partial Week Data
- If campaigns were active for less than the full 7 days:
  - Note the actual active days
  - Compute metrics on actual data (do NOT annualise partial weeks)
  - Mark the week as "partial" in the report header

### Google Sheets Write Failure
- If the Google Sheets update fails:
  - Save the report locally (`.tmp/reporting/weekly_report_{date}.md`)
  - Report the Google Sheets error to the human
  - Retry the write after addressing the error
  - The local copy serves as a backup

### Metric Discrepancies
- Meta API data can occasionally differ from Ads Manager UI due to attribution windows
- If discrepancies are noted, flag them in the report
- Use the API data as the source of truth for consistency (same source every week)

### Monthly Budget Tracking
- At month boundaries (report spans two months):
  - Include MTD for BOTH months
  - Note the boundary in the report
  - Ensure projected spend is calculated correctly for the new month

## Approval Gate

This workflow has **no formal approval gate** -- it is an informational deliverable. However:

- The human should review the report for accuracy
- The "Next Week Plan" should be confirmed or adjusted before Monday's cycle begins
- Any budget reallocation recommendations need human approval before implementation
- Open questions should be addressed before the next week starts

## Notes

- Consistency is key. Run the report every Friday without fail. The value of weekly reporting compounds over time as trends become visible.
- The report should be honest. If performance is declining, say so clearly. Sugarcoating data leads to poor decisions.
- Keep historical reports in Google Sheets (never delete old sections). The rolling history is the most valuable asset for long-term strategy.
- Consider adding a monthly summary (aggregated from weekly reports) at month-end for higher-level stakeholder communication.
- The "Next Week Plan" section is what makes this report actionable rather than just informational. Every insight should connect to a concrete action.
- If running multiple reports in the same session, process all brands before writing to Google Sheets to ensure the report is complete.
