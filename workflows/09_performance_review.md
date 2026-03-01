# 09 - Performance Review

## Objective

Pull ad-level performance data every 3 days, classify each active ad as winner/loser/marginal/needs_data, generate scaling and pausing recommendations, and update the Google Sheets performance dashboard. All optimisation actions (pause/scale) require human confirmation before execution.

## Required Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `config/brands.json` | Manual config | Ad account IDs, CPL targets, kill thresholds |
| `.tmp/publishing/ads_{brand}_{date}.json` | Workflow 08 output | Published ad IDs and metadata |
| `.env` | Environment | `META_ACCESS_TOKEN`, Google Sheets credentials |

### Decision Thresholds (from brands.json)

| Brand | CPL Target | Kill Threshold | Min Spend | Min Leads (Winner) |
|-------|-----------|---------------|-----------|-------------------|
| Carisma Spa | EUR 8.00 | EUR 16.00 (2x) | EUR 30.00 | 5 |
| Carisma Aesthetics | EUR 12.00 | EUR 24.00 (2x) | EUR 30.00 | 5 |

## Tools Used

| Tool | Purpose |
|------|---------|
| `tools/pull_ad_insights.py` | Pull Meta Ads API insights for the last 3 days |
| `tools/analyze_performance.py` | Classify ads and compute metrics |
| `tools/compare_creatives.py` | Compare performance across creatives |
| `tools/update_google_sheet.py` | Update Google Sheets performance dashboard |

## Schedule

Run every 3 days while campaigns are active:

| Day | Action |
|-----|--------|
| Wednesday | First review (3 days after Monday launch) |
| Saturday | Second review |
| Tuesday | Third review (also informs next week's research) |

## Step-by-Step Procedure

### Step 1: Pull 3-Day Ad Insights

Run `tools/pull_ad_insights.py` for each brand:

```
--ad_account_id "<from brands.json>"
--level "ad"
--date_range "last_3d"
--fields "ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,spend,impressions,reach,frequency,clicks,ctr,cpc,actions,cost_per_action_type,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p100_watched_actions,video_thru_play_watched_actions"
--filtering '[{"field":"ad.effective_status","operator":"IN","value":["ACTIVE","PAUSED"]}]'
--output ".tmp/performance/review_raw_{brand}_{date}.json"
```

Also pull cumulative data (since ad creation) for context:
```
--date_range "lifetime"
--output ".tmp/performance/review_lifetime_{brand}_{date}.json"
```

### Step 2: Compute Per-Ad Metrics

For each ad, compute:

| Metric | Source | Calculation |
|--------|--------|-------------|
| Spend (3-day) | API | Sum of spend in last 3 days |
| Spend (lifetime) | API | Total spend since creation |
| Leads (3-day) | API `actions` | Lead events in last 3 days |
| Leads (lifetime) | API `actions` | Total lead events |
| CPL (3-day) | Computed | 3-day spend / 3-day leads |
| CPL (lifetime) | Computed | Lifetime spend / lifetime leads |
| CPL Trend | Computed | Compare 3-day CPL vs lifetime CPL |
| Impressions | API | 3-day impressions |
| CTR | API | 3-day click-through rate |
| Frequency | API | Average frequency in review period |
| Hook Rate | Computed | 3-sec video views / impressions |
| Hold Rate | Computed | ThruPlays / 3-sec video views |

### Step 3: Classify Each Ad

Run `tools/analyze_performance.py`:

```
--input ".tmp/performance/review_raw_{brand}_{date}.json"
--lifetime_data ".tmp/performance/review_lifetime_{brand}_{date}.json"
--brand_id "<brand_id>"
--brands_config "config/brands.json"
--review_type "3day"
--output ".tmp/performance/review_classified_{brand}_{date}.json"
```

Classification decision tree:

```
Is lifetime spend >= EUR 30?
├── NO --> "needs_data" (insufficient spend for decision)
│         Action: Let it run. Check again in 3 days.
│
└── YES --> Is lifetime leads >= 1?
            ├── NO --> Is lifetime spend >= EUR 60?
            │         ├── NO --> "needs_data" (borderline, give more time)
            │         └── YES --> "loser" (high spend, zero leads)
            │                    Action: RECOMMEND PAUSE
            │
            └── YES --> What is lifetime CPL?
                        ├── CPL <= CPL target AND leads >= 5
                        │   --> "winner"
                        │       Action: RECOMMEND SCALE
                        │
                        ├── CPL > 2x CPL target
                        │   --> "loser"
                        │       Action: RECOMMEND PAUSE
                        │
                        └── CPL between target and 2x target
                            --> "marginal"
                                Is 3-day CPL improving or declining?
                                ├── Improving (3d CPL < lifetime CPL)
                                │   --> "marginal_improving"
                                │       Action: Let it run, monitor
                                │
                                └── Declining (3d CPL > lifetime CPL)
                                    --> "marginal_declining"
                                        Action: Flag for review, may pause soon
```

### Step 4: Detect Creative Fatigue

For each active ad, check fatigue signals:

| Signal | Threshold | Interpretation |
|--------|-----------|---------------|
| Frequency > 3.0 | WARNING | Audience is seeing the ad too many times |
| Frequency > 4.5 | CRITICAL | Almost certainly experiencing fatigue |
| CTR declining 3 consecutive reviews | WARNING | Engagement dropping |
| CPL rising 3 consecutive reviews | WARNING | Efficiency dropping |
| CPL rising + Frequency rising | CRITICAL | Strong fatigue signal -- recommend pause |

### Step 5: Generate Recommendations

For each ad, produce a recommendation:

```json
{
  "ad_id": "123456",
  "ad_name": "CS_SpaDay_UGC_Question_v1",
  "classification": "winner",
  "recommendation": "scale",
  "confidence": "high",
  "reasoning": "CPL EUR 6.07 (target: 8.00), 14 leads, stable frequency at 1.8. No fatigue signals.",
  "suggested_action": "Increase ad set budget by 20% or duplicate to new audience",
  "metrics": {
    "spend_lifetime": 85.00,
    "leads_lifetime": 14,
    "cpl_lifetime": 6.07,
    "spend_3day": 28.50,
    "leads_3day": 5,
    "cpl_3day": 5.70,
    "frequency": 1.8,
    "ctr": 2.1,
    "trend": "stable"
  }
}
```

Recommendation types:

| Classification | Recommendation | Specific Action |
|---------------|----------------|----------------|
| **Winner** | Scale | Increase budget 20%, or create lookalike audience, or duplicate to new interest |
| **Loser** | Pause | Pause the ad immediately |
| **Marginal (improving)** | Hold | Keep running, review again in 3 days |
| **Marginal (declining)** | Watch | Keep running 3 more days, pause if continues declining |
| **Needs data** | Hold | Keep running, ensure sufficient budget allocation |
| **Fatigued winner** | Iterate | Pause current, create iteration (workflow 10) |

### Step 6: Compare Across Creatives

Run `tools/compare_creatives.py`:

```
--classified ".tmp/performance/review_classified_{brand}_{date}.json"
--output ".tmp/performance/review_comparison_{brand}_{date}.json"
```

Generate cross-creative insights:

- **Best performing hook type** across all ads
- **Best performing format** (video vs static vs carousel)
- **Best performing offer**
- **Best performing audience** (ad set level)
- **Cost efficiency ranking** of all active ads
- **Creative diversity check** -- are we testing enough variety?

### Step 7: Update Google Sheets Dashboard

Run `tools/update_google_sheet.py`:

```
--spreadsheet_id "<google_sheet_id>"
--tab "Performance Dashboard"
--data ".tmp/performance/review_classified_{brand}_{date}.json"
--mode "append_row"
```

Dashboard columns:

| Column | Description |
|--------|-------------|
| Review Date | Date of this review |
| Brand | Brand name |
| Ad ID | Meta ad ID |
| Ad Name | Full ad name |
| Classification | winner/loser/marginal/needs_data |
| CPL (3-day) | Cost per lead, last 3 days |
| CPL (lifetime) | Cost per lead, total |
| Leads (3-day) | Leads generated, last 3 days |
| Leads (lifetime) | Total leads generated |
| Spend (3-day) | Spend in last 3 days |
| Spend (lifetime) | Total spend |
| Frequency | Current frequency |
| Fatigue Risk | None/Warning/Critical |
| Recommendation | Scale/Pause/Hold/Watch/Iterate |
| Human Decision | (blank -- filled by human) |
| Notes | Additional context |

Also update a "Summary" section at the top of the dashboard:

| Metric | This Review | Previous Review | Trend |
|--------|------------|----------------|-------|
| Active Ads | 12 | 10 | +2 |
| Total Spend (3d) | EUR 180 | EUR 165 | +9% |
| Total Leads (3d) | 24 | 20 | +20% |
| Average CPL | EUR 7.50 | EUR 8.25 | -9% (improving) |
| Winners | 4 | 3 | +1 |
| Losers | 2 | 2 | stable |

### Step 8: Present Review to Human

Generate a human-readable review summary:

```markdown
# Performance Review: {brand_name}
## Review Date: {date} | Period: Last 3 Days

### Headlines
- Total spend: EUR 180 | Total leads: 24 | Average CPL: EUR 7.50
- 4 winners, 2 losers, 3 marginal, 3 needs data
- CPL trending DOWN (improving) vs previous review

### Actions Required

#### PAUSE (Losers)
| Ad | CPL | Spend | Leads | Reason |
|----|-----|-------|-------|--------|
| CS_SpaDay_Static_Bold_v2 | EUR 22.00 | EUR 44.00 | 2 | CPL 2.75x target |
| CS_GiftVoucher_UGC_Urgency_v1 | N/A | EUR 35.00 | 0 | Zero leads after EUR 35 spend |

#### SCALE (Winners)
| Ad | CPL | Spend | Leads | Suggestion |
|----|-----|-------|-------|-----------|
| CS_SpaDay_UGC_Question_v1 | EUR 6.07 | EUR 85.00 | 14 | Increase budget 20% |
| CS_SpaDay_Testimonial_v1 | EUR 5.50 | EUR 55.00 | 10 | Duplicate to lookalike audience |

#### WATCH (Marginal)
| Ad | CPL | Trend | Next Review |
|----|-----|-------|-------------|
| CS_GiftVoucher_Static_Social_v1 | EUR 11.00 | Improving | Saturday |

#### NEEDS DATA
| Ad | Spend | Days Active | Est. Days to Decision |
|----|-------|-------------|----------------------|
| CS_SpaDay_UGC_Curiosity_v1 | EUR 18.00 | 2 | ~2 more days |

### Fatigue Alerts
- CS_SpaDay_UGC_Question_v1: Frequency 2.8 (approaching warning threshold)
  Consider creating iteration before fatigue sets in.

### Insights
- Question hooks outperforming all other hook types (avg CPL EUR 6.50 vs EUR 9.80)
- Video formats outperforming static (avg CPL EUR 7.20 vs EUR 11.50)
- Spa Day offer converting better than Gift Voucher (CPL EUR 6.80 vs EUR 10.20)
```

## Expected Outputs

| Output | Path | Description |
|--------|------|-------------|
| Raw 3-day insights | `.tmp/performance/review_raw_{brand}_{date}.json` | API data |
| Lifetime insights | `.tmp/performance/review_lifetime_{brand}_{date}.json` | Cumulative API data |
| Classified ads | `.tmp/performance/review_classified_{brand}_{date}.json` | Ads with classifications |
| Comparison | `.tmp/performance/review_comparison_{brand}_{date}.json` | Cross-creative analysis |
| Google Sheet | "Performance Dashboard" tab | Updated dashboard |
| Review summary | `.tmp/performance/review_summary_{brand}_{date}.md` | Human-readable report |

## Edge Cases and Error Handling

### No Active Campaigns
- If a brand has no active campaigns (all paused or none published yet):
  - Report this to the human
  - Skip the review for this brand
  - Note: "No active campaigns to review. Run workflow 08 first."

### Zero Leads Across All Ads
- If no ads have generated any leads:
  - Check pixel/conversion tracking is firing correctly
  - Report that zero leads may indicate a tracking issue, not a creative issue
  - Suggest the human verify the pixel setup on landing pages

### API Data Delay
- Meta's reporting API can have a 24-48 hour delay for some metrics
- If data seems stale or incomplete, note the potential delay
- Use `date_range "last_3d"` which typically has better data freshness than custom date ranges

### Classification Edge Cases
- **New ad with one lucky lead:** If an ad has spent EUR 5 and has 1 lead (CPL EUR 5), don't call it a winner. The `needs_data` classification catches this via minimum spend threshold.
- **Ad with very high spend but moderate CPL:** If an ad has spent EUR 200 with CPL at 1.3x target, it's marginal but burning budget. Flag for human attention.
- **Paused ad with good data:** Include paused ads in the review so the human can see if a previously paused ad should be reactivated.

### Google Sheets API Errors
- **Quota exceeded:** Queue the update and retry after 60 seconds
- **Sheet not found:** Verify the spreadsheet ID and tab name
- **Permission denied:** Check Google credentials and sharing permissions

## APPROVAL GATE

**This workflow has a mandatory approval gate.**

After the review is generated:

1. Present the review summary to the human
2. Highlight all PAUSE and SCALE recommendations
3. Human reviews each recommendation and decides:
   - **Confirm pause:** Human pauses the ad in Ads Manager
   - **Confirm scale:** Human adjusts budget or duplicates in Ads Manager
   - **Override:** Human disagrees with recommendation and provides reasoning
   - **Defer:** Decision postponed to next review
4. Human logs their decision in the "Human Decision" column of the Google Sheet
5. **The system NEVER pauses or activates ads. Only the human does.**

## Notes

- The 3-day review cadence balances responsiveness with statistical significance. Reviewing daily leads to premature decisions.
- Creative fatigue is the silent killer of ad performance. Watch frequency closely.
- Winners should be iterated on proactively (workflow 10) before they fatigue out.
- The Google Sheets dashboard creates accountability and a historical record. Never skip the dashboard update.
- If CPL targets need adjustment (market conditions change, seasonal effects), update `brands.json` before running the review.
- Compare results week over week, not just review over review, to spot longer-term trends.

---

## Known Issues & Learnings

> Updated when this workflow encounters failures, edge cases, or better methods.
> Always check this section before executing the workflow.
> Log full context in `learnings/LEARNINGS.md` under Workflow Learnings.

<!--
Entry format:
### [YYYY-MM-DD] — [Issue Title]
**What happened:** Brief description
**Root cause:** Why it happened
**Fix:** What was changed
**Rule:** ALWAYS/NEVER directive (also added to root CLAUDE.md if universal)
-->

_No issues logged yet._
