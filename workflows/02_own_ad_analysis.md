# 02 - Own Ad Analysis

## Objective

Pull performance data for our own active and recently active ads, classify each ad as winner/loser/marginal/needs_data, and identify patterns in what creative formats, hooks, audiences, and offers are performing best. This analysis informs script generation and iteration decisions.

## Required Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `config/brands.json` | Manual config | Brand definitions with ad account IDs, CPL targets |
| `.env` | Environment | `META_ACCESS_TOKEN`, `META_APP_ID`, `META_APP_SECRET` |

### Key Thresholds (from brands.json)

| Brand | CPL Target | Kill Threshold (2x CPL) | Min Spend for Decision | Min Leads for Winner |
|-------|-----------|------------------------|----------------------|---------------------|
| Carisma Spa | EUR 8.00 | EUR 16.00 | EUR 30.00 | 5 |
| Carisma Aesthetics | EUR 12.00 | EUR 24.00 | EUR 30.00 | 5 |

## Tools Used

| Tool | Purpose |
|------|---------|
| `tools/pull_ad_insights.py` | Pull Meta Ads API insights at ad, ad set, and campaign level |
| `tools/analyze_performance.py` | Classify ads and compute performance metrics |
| `tools/compare_creatives.py` | Cross-compare creatives to find patterns |

## Step-by-Step Procedure

### Step 1: Pull Ad-Level Insights

Run `tools/pull_ad_insights.py` for each brand:

```
--ad_account_id "<from brands.json>"
--level "ad"
--date_range "last_14d"
--fields "ad_id,ad_name,adset_name,campaign_name,spend,impressions,clicks,ctr,cpc,actions,cost_per_action_type,reach,frequency"
--breakdowns "none"
--output ".tmp/performance/raw_insights_{brand}_{date}.json"
```

Also pull at ad set and campaign level for context:
```
--level "adset"  --> .tmp/performance/raw_insights_adset_{brand}_{date}.json
--level "campaign"  --> .tmp/performance/raw_insights_campaign_{brand}_{date}.json
```

### Step 2: Extract Key Metrics

For each ad, extract and compute:

| Metric | Source | Calculation |
|--------|--------|-------------|
| Spend | API direct | Total spend in EUR |
| Impressions | API direct | Total impressions |
| Clicks | API direct | Link clicks (not all clicks) |
| CTR | API direct | Link click-through rate |
| Leads | API `actions` | Count of `lead` or `offsite_conversion.fb_pixel_lead` |
| CPL | Computed | Spend / Leads |
| CPC | API direct | Cost per link click |
| Reach | API direct | Unique people reached |
| Frequency | API direct | Average times each person saw the ad |
| Hook Rate | Computed | 3-second video views / impressions (video only) |
| Hold Rate | Computed | ThruPlays / 3-second video views (video only) |

### Step 3: Classify Each Ad

Run `tools/analyze_performance.py`:

```
--input ".tmp/performance/raw_insights_{brand}_{date}.json"
--brand_id "<brand_id>"
--brands_config "config/brands.json"
--output ".tmp/performance/analysis_{brand}_{date}.json"
```

Classification logic:

| Classification | Criteria |
|---------------|----------|
| **Winner** | CPL <= CPL target AND leads >= 5 AND spend >= EUR 30 |
| **Loser** | CPL >= 2x CPL target AND spend >= EUR 30 |
| **Marginal** | CPL between target and 2x target AND spend >= EUR 30 |
| **Needs Data** | Spend < EUR 30 (insufficient data to classify) |

### Step 4: Identify Patterns

Run `tools/compare_creatives.py`:

```
--analysis ".tmp/performance/analysis_{brand}_{date}.json"
--output ".tmp/performance/patterns_{brand}_{date}.json"
```

Pattern analysis should identify:

1. **By Format:** Which creative formats (video, static, carousel) have the lowest average CPL?
2. **By Hook Type:** Do question hooks outperform bold claims? (requires ad naming convention to encode hook type)
3. **By Audience:** Which ad sets (audience segments) are producing the cheapest leads?
4. **By Offer:** Which offers (spa day, couples, botox, fillers) are converting best?
5. **By Time:** Are there day-of-week or time-of-day patterns?
6. **By Fatigue:** Are any ads showing rising CPL + rising frequency (creative fatigue)?

### Step 5: Generate Analysis Summary

The output JSON should contain:

```json
{
  "brand_id": "carisma_spa",
  "analysis_date": "2026-02-15",
  "date_range": "2026-02-01 to 2026-02-14",
  "summary": {
    "total_spend": 450.00,
    "total_leads": 62,
    "average_cpl": 7.26,
    "total_active_ads": 12,
    "winners": 4,
    "losers": 3,
    "marginal": 2,
    "needs_data": 3
  },
  "ads": [
    {
      "ad_id": "123456",
      "ad_name": "CS_SpaDay_UGC_QuestionHook_v1",
      "classification": "winner",
      "spend": 85.00,
      "leads": 14,
      "cpl": 6.07,
      "impressions": 12500,
      "ctr": 2.1,
      "hook_rate": 0.45,
      "hold_rate": 0.22,
      "frequency": 1.8,
      "days_active": 10,
      "trend": "stable"
    }
  ],
  "patterns": {
    "best_format": "ugc_video",
    "best_hook_type": "question",
    "best_offer": "spa_day_package",
    "best_audience": "interest_spa_wellness_25_45",
    "fatigue_alerts": ["ad_id_789: frequency 3.2, CPL rising 40% over 5 days"]
  }
}
```

## Expected Outputs

| Output | Path | Description |
|--------|------|-------------|
| Raw insights (ad level) | `.tmp/performance/raw_insights_{brand}_{date}.json` | Full API response |
| Raw insights (ad set) | `.tmp/performance/raw_insights_adset_{brand}_{date}.json` | Ad set level data |
| Raw insights (campaign) | `.tmp/performance/raw_insights_campaign_{brand}_{date}.json` | Campaign level data |
| Analysis | `.tmp/performance/analysis_{brand}_{date}.json` | Classified ads with patterns |
| Patterns | `.tmp/performance/patterns_{brand}_{date}.json` | Cross-creative pattern analysis |

## Edge Cases and Error Handling

### No Active Ads
- If a brand has no active ads in the date range, report this clearly
- Still pull data for recently paused ads (last 14 days) to inform future decisions
- Output an analysis file with `total_active_ads: 0` and a note

### Insufficient Data
- Ads with fewer than 1,000 impressions: classify as `needs_data` regardless of CPL
- Ads running for fewer than 3 days: classify as `needs_data`
- Do NOT make winner/loser calls on thin data

### API Errors
- **Token expired:** Report to human for re-authentication
- **Rate limiting:** Exponential backoff, max 5 retries
- **Account access denied:** Verify ad account ID in `brands.json` and permissions

### Missing Actions Data
- If the `actions` array does not contain lead events, the pixel or conversion tracking may not be set up
- Report this prominently -- no lead data means we cannot compute CPL
- Fall back to click-based metrics (CPC, CTR) as secondary indicators

### Naming Convention Parsing
- The analysis relies on ad names following a convention like: `{BrandCode}_{Offer}_{Format}_{HookType}_{Version}`
- If ad names don't follow the convention, pattern analysis by format/hook will be limited
- Log a warning and fall back to API-level format detection (image vs video)

## Approval Gate

This workflow feeds into **Gate 1** (Research Review) defined in `workflows/00_master_orchestration.md`.

The human should verify:
- Classifications make sense (no obviously wrong winner/loser calls)
- CPL targets in `brands.json` are still appropriate
- Any ads flagged for creative fatigue should be reviewed for pausing
- Pattern insights align with human intuition about what's working

## Notes

- The 14-day lookback provides enough data for most classification decisions while still being responsive to recent trends
- For new campaigns (< 7 days), use 7-day data and be more conservative with classifications
- This analysis directly feeds workflow 03 (Hook Mining) -- winning ad hooks get prioritised
- Consider running a 7-day AND 14-day analysis to spot trends (improving or declining performance)
