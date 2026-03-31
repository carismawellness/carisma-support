# Phase 2 — Pull Meta Ads Performance Data

## Objective
Get current ad spend and performance metrics for all active campaigns, mapped to services.

## Prerequisites
- Phase 1 complete (capacity data available)
- Meta Ads MCP loaded: `ToolSearch: "+meta-ads"`
- `config/brands.json` loaded (ad account IDs)
- `config/naming_conventions.json` loaded (campaign naming patterns)

## Procedure

### Step 1: Load MCP tools

```
ToolSearch: "+meta-ads"
```

### Step 2: Pull campaign insights for each brand

For each brand in `config/brands.json`:

1. Get the `meta_ad_account_id`
2. Call `mcp__meta-ads__get_campaigns` to list active campaigns
3. For each active campaign, call `mcp__meta-ads__get_insights` with:
   - `date_preset`: `last_7d`
   - `fields`: `campaign_name,spend,impressions,clicks,actions,cost_per_action_type`
4. Extract: campaign name, total spend (7d), leads (7d), CPL, status

**Ad Account IDs:**
- Carisma Spa: `act_654279452039150`
- Carisma Aesthetics: `act_382359687910745`

### Step 3: Map campaigns to services

Using `config/naming_conventions.json` and `references/decision-matrix.md` mapping table:

1. Parse campaign name: `{brand_code}_{objective}_{offer}_{date}`
2. Extract the `offer` component
3. Look up the offer code in the mapping table to find the Fresha service name
4. Group campaigns by service

Example:
- `CS_LEAD_LIPO_20260301` -> offer=LIPO -> service=Lipocavitation -> venue=slimming
- `CA_LEAD_HYDRA_20260315` -> offer=HYDRA -> service=4-1 hydrafacial -> venue=aesthetics

### Step 4: Handle unmapped campaigns

If a campaign's offer code isn't in the mapping table:
- Log it as "unmapped"
- Include it in the brand-level summary but not service-level crossref
- Flag in the report for human review

### Step 5: Handle Meta Ads auth errors

If the Meta Ads API returns an OAuth error (token expired):
- Log: "Meta Ads token expired. Skipping Phases 2-4."
- Write a capacity-only report (Phase 1 data only) to `.tmp/performance/occupancy-optimizer-report.md`
- Skip to Phase 5 (publish capacity-only)
- Set phase status: SKIPPED (auth_error)

### Step 6: Save ads data

Write the mapped data to `.tmp/performance/meta_ads_by_service.json`:

```json
{
  "generated_at": "2026-03-31T10:00:00",
  "date_range": "last_7d",
  "brands": {
    "carisma_spa": {
      "ad_account_id": "act_654279452039150",
      "campaigns": [...]
    },
    "carisma_aesthetics": {
      "ad_account_id": "act_382359687910745",
      "campaigns": [...]
    }
  },
  "by_service": {
    "Lipocavitation": {
      "venue": "slimming",
      "campaigns": [...],
      "total_spend_7d": 45.00,
      "total_leads_7d": 6,
      "avg_cpl": 7.50,
      "daily_spend": 6.43
    }
  },
  "unmapped_campaigns": [...]
}
```

## Output
- `.tmp/performance/meta_ads_by_service.json` — ads data mapped to services
- Phase status: COMPLETE, SKIPPED (auth_error), or FAILED
