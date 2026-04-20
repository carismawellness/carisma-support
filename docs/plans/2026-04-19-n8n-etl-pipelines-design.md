# N8N ETL Pipelines — Architecture Design

**Date:** 2026-04-19
**Status:** Approved (hybrid approach)

## Approach: Hybrid (Native n8n + Execute Command)

### Native n8n workflows (API-based, straightforward transforms)
- Pipeline 9: Meta Ads
- Pipeline 10: Google Ads
- Pipeline 11: GA4
- Pipeline 12: GSC
- Pipeline 13: Klaviyo
- Pipeline 14: Zoho CRM STL
- Pipeline 16: We360
- Pipeline 17-20: New sources

### Execute Command workflows (complex Sheets parsing)
- Pipeline 1: Weekly KPIs
- Pipeline 2: CRM Master
- Pipeline 3: EBITDA
- Pipeline 4: Aesthetics Sales
- Pipeline 5: Slimming Sales
- Pipeline 6: Salary Master
- Pipeline 7: Budget Calendar
- Pipeline 8: Brand Standards
- Pipeline 15: Wix

## Workflow JSON Standard

Every workflow follows this pattern:
1. Schedule Trigger (cron)
2. ETL Log Start (HTTP Request → Supabase)
3. Data extraction (API node or Execute Command)
4. Transform (Code node if needed)
5. Upsert to Supabase (HTTP Request with service role key)
6. ETL Log Complete (HTTP Request → Supabase)
7. Error handler (catches failures, logs to etl_sync_log)

## Multi-Agent Build Strategy

### Agent Groups (parallel execution)
- **Group A — API Pipelines:** Meta Ads, Google Ads, GA4, GSC (Pipelines 9-12)
- **Group B — CRM Pipelines:** CRM Master, Zoho STL, Klaviyo (Pipelines 2, 13, 14)
- **Group C — Sheets Pipelines:** Weekly KPIs, EBITDA, Sales, Salary, Budget, Brand Standards (Pipelines 1, 3-8)
- **Group D — Remaining:** Wix, We360, new sources (Pipelines 15-20)

### Shared Infrastructure (built first)
- Supabase credentials config
- ETL logging sub-workflow
- Error handler sub-workflow
- Common constants (brand IDs, location IDs, Supabase URL)

## File Output

All workflow JSON files saved to: `Tech/CEO-Cockpit/n8n/workflows/`
Naming: `pipeline-{NN}-{name}.json` (e.g., `pipeline-09-meta-ads.json`)

## Credentials

| Name | Type | Env Var |
|------|------|---------|
| Supabase | HTTP Header Auth | SUPABASE_SERVICE_ROLE_KEY |
| Meta Ads | Facebook Marketing API | META_ACCESS_TOKEN |
| Google OAuth | Google OAuth2 | (configured in n8n UI) |
| Klaviyo | API Key Header | PRIVATE_API_KEY |
| Zoho CRM | Zoho OAuth2 | ZOHO_CLIENT_ID/SECRET/REFRESH |

## n8n API

- Base: http://localhost:5678/api/v1
- API Key: n8n_api_2ea8a6d94ef958544d87252a74fe9c5675221a13
