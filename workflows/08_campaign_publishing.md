# 08 - Campaign Publishing

## Objective

Publish approved creatives to Meta Ads Manager as fully structured campaigns. ALL campaigns, ad sets, and ads are created in **PAUSED** state. The system NEVER activates campaigns. Structure follows the pattern: 1 CBO campaign per brand per week, containing 1-3 ad sets, each with 2-4 ads. Everything is logged to Google Sheets for tracking.

## Required Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `.tmp/creatives/{ad_name}_{aspect_ratio}.mp4` | Workflow 06 output | Approved video creatives |
| `.tmp/creatives/{ad_name}_{aspect_ratio}.png` | Workflow 07 output | Approved static creatives |
| `.tmp/scripts/index_{brand}_{date}.json` | Workflow 04 output | Script metadata (hooks, offers, formats) |
| `.tmp/briefs/index_{brand}_{date}.json` | Workflow 05 output | Brief metadata (production types) |
| `config/brands.json` | Manual config | Ad account IDs, page IDs, targeting, budgets |
| `config/offers.json` | Manual config | Offer details, landing pages, CTAs |
| `.env` | Environment | `META_ACCESS_TOKEN`, `META_APP_ID`, `META_APP_SECRET` |

## Tools Used

| Tool | Purpose |
|------|---------|
| `tools/generate_naming.py` | Generate standardised names for campaigns, ad sets, and ads |
| `tools/validate_campaign_structure.py` | Validate the full campaign structure before API calls |
| `tools/upload_creative.py` | Upload video/image files to Meta as ad creatives |
| `tools/create_campaign_draft.py` | Create campaign object in PAUSED state via Meta API |
| `tools/create_adset_draft.py` | Create ad set objects within the campaign |
| `tools/create_ad_draft.py` | Create ad objects linking creatives to ad sets |
| `tools/update_google_sheet.py` | Log all created objects to Google Sheets |

## Step-by-Step Procedure

### Step 1: Plan Campaign Structure

For each brand, plan the weekly campaign structure:

```
Campaign: {BrandCode}_W{WeekNumber}_{Year}_CBO
├── Ad Set 1: {BrandCode}_{Offer1}_{Audience1}
│   ├── Ad: {BrandCode}_{Offer1}_{Format1}_{Hook1}_v1
│   ├── Ad: {BrandCode}_{Offer1}_{Format2}_{Hook2}_v1
│   └── Ad: {BrandCode}_{Offer1}_{Format3}_{Hook3}_v1
├── Ad Set 2: {BrandCode}_{Offer2}_{Audience1}
│   ├── Ad: {BrandCode}_{Offer2}_{Format1}_{Hook4}_v1
│   └── Ad: {BrandCode}_{Offer2}_{Format2}_{Hook5}_v1
└── Ad Set 3: {BrandCode}_{Offer1}_{Audience2} (if testing new audience)
    ├── Ad: {BrandCode}_{Offer1}_{Format1}_{Hook1}_v1
    └── Ad: {BrandCode}_{Offer1}_{Format2}_{Hook6}_v1
```

**Structure rules:**
- 1 CBO (Campaign Budget Optimisation) campaign per brand per week
- 1-3 ad sets per campaign (grouped by offer or audience)
- 2-4 ads per ad set (different creatives/hooks testing against each other)
- Total ads per campaign: 4-12

### Step 2: Generate Naming Convention

Run `tools/generate_naming.py`:

```
--brand_id "<brand_id>"
--week_number "<week_num>"
--year "<year>"
--scripts_index ".tmp/scripts/index_{brand}_{date}.json"
--output ".tmp/publishing/naming_{brand}_{date}.json"
```

Naming format:

| Level | Pattern | Example |
|-------|---------|---------|
| Campaign | `{BrandCode}_W{WW}_{YYYY}_CBO` | `CS_W07_2026_CBO` |
| Ad Set | `{BrandCode}_{Offer}_{Audience}` | `CS_SpaDay_InterestSpaWellness` |
| Ad | `{BrandCode}_{Offer}_{Format}_{HookType}_v{N}` | `CS_SpaDay_UGC_Question_v1` |

### Step 3: Validate Campaign Structure

Run `tools/validate_campaign_structure.py`:

```
--naming ".tmp/publishing/naming_{brand}_{date}.json"
--brands_config "config/brands.json"
--brand_id "<brand_id>"
--creatives_dir ".tmp/creatives/"
--output ".tmp/publishing/validation_{brand}_{date}.json"
```

Validation checks:

| Check | Criteria | Fail Action |
|-------|----------|-------------|
| Creative files exist | Every ad has a corresponding file in `.tmp/creatives/` | Report missing files |
| Ad account ID valid | `meta_ad_account_id` in brands.json is not `TO_BE_FILLED` | Halt and report |
| Page ID valid | `meta_page_id` in brands.json is not `TO_BE_FILLED` | Halt and report |
| Budget reasonable | Daily CBO budget <= monthly budget / 20 | Warn if exceeding |
| Ad count per set | 2-4 ads per ad set | Warn if outside range |
| Targeting complete | Age, gender, geo, interests all defined | Halt if missing |
| Landing pages valid | URLs from offers.json are accessible | Warn if HTTP error |
| Naming unique | No duplicate ad names within the campaign | Rename with suffix |

**If validation fails on any critical check (marked "Halt"), do NOT proceed to API calls.**

### Step 4: Upload Creatives

For each creative file, run `tools/upload_creative.py`:

```
--ad_account_id "<ad_account_id>"
--file_path ".tmp/creatives/{ad_name}_{aspect_ratio}.mp4"
--file_type "video"  (or "image")
--name "{ad_name}"
--output ".tmp/publishing/creative_ids_{brand}_{date}.json"
```

This uploads the file to Meta and returns a `creative_id` (either `video_id` or `image_hash`).

For video uploads:
1. Upload the video file via the Meta Video API
2. Poll for upload completion (video encoding is async)
3. Timeout after 10 minutes per video
4. Store the `video_id` for use in ad creation

For image uploads:
1. Upload the image via the Ad Image API
2. This is synchronous -- returns `image_hash` immediately
3. Store the `image_hash` for use in ad creation

### Step 5: Create Campaign (PAUSED)

Run `tools/create_campaign_draft.py`:

```
--ad_account_id "<ad_account_id>"
--name "CS_W07_2026_CBO"
--objective "OUTCOME_LEADS"
--status "PAUSED"
--special_ad_categories "[]"
--budget_optimization "CAMPAIGN_BUDGET"
--daily_budget "<daily_budget_cents>"
--output ".tmp/publishing/campaign_{brand}_{date}.json"
```

**CRITICAL:** The `status` parameter MUST be `"PAUSED"`. Never set to `"ACTIVE"`.

Campaign settings:
- **Objective:** `OUTCOME_LEADS` (lead generation)
- **Budget:** Campaign Budget Optimisation (CBO) with daily budget
- **Daily budget:** Calculated as: `monthly_budget_eur / 30 * 1.2` (allow some headroom for CBO to optimise)
- **Special ad categories:** Empty unless advertising credit/employment/housing (not applicable for spa/aesthetics)
- **Bid strategy:** Lowest cost (default for CBO)

Store the returned `campaign_id`.

### Step 6: Create Ad Sets

For each ad set in the structure, run `tools/create_adset_draft.py`:

```
--campaign_id "<campaign_id>"
--ad_account_id "<ad_account_id>"
--name "CS_SpaDay_InterestSpaWellness"
--status "PAUSED"
--targeting "<targeting_json>"
--optimization_goal "LEAD_GENERATION"
--billing_event "IMPRESSIONS"
--destination_type "WEBSITE"
--promoted_object '{"page_id": "<page_id>", "pixel_id": "<pixel_id>"}'
--output ".tmp/publishing/adsets_{brand}_{date}.json"
```

**CRITICAL:** The `status` parameter MUST be `"PAUSED"`.

Targeting JSON (from brands.json):
```json
{
  "age_min": 25,
  "age_max": 65,
  "genders": [2],
  "geo_locations": {
    "countries": ["MT"]
  },
  "flexible_spec": [
    {
      "interests": [
        {"id": "6003XXX", "name": "Spa"},
        {"id": "6003XXX", "name": "Wellness"}
      ]
    }
  ],
  "publisher_platforms": ["facebook", "instagram"],
  "facebook_positions": ["feed", "story", "reels"],
  "instagram_positions": ["stream", "story", "reels"]
}
```

Store the returned `adset_id` for each ad set.

### Step 7: Create Ads (PAUSED)

For each ad, run `tools/create_ad_draft.py`:

```
--adset_id "<adset_id>"
--ad_account_id "<ad_account_id>"
--name "CS_SpaDay_UGC_Question_v1"
--status "PAUSED"
--creative_spec "<creative_spec_json>"
--tracking_specs "<tracking_json>"
--output ".tmp/publishing/ads_{brand}_{date}.json"
```

**CRITICAL:** The `status` parameter MUST be `"PAUSED"`.

Creative spec for video ad:
```json
{
  "creative": {
    "name": "CS_SpaDay_UGC_Question_v1",
    "object_story_spec": {
      "page_id": "<page_id>",
      "instagram_actor_id": "<instagram_account_id>",
      "video_data": {
        "video_id": "<video_id>",
        "message": "Full ad copy text from script...",
        "title": "Spa Day Package - EUR 89",
        "link_description": "Book your escape today",
        "call_to_action": {
          "type": "LEARN_MORE",
          "value": {
            "link": "https://www.carismaspa.com/spa-day"
          }
        }
      }
    }
  }
}
```

Creative spec for image ad:
```json
{
  "creative": {
    "name": "CS_SpaDay_Static_Question_v1",
    "object_story_spec": {
      "page_id": "<page_id>",
      "instagram_actor_id": "<instagram_account_id>",
      "link_data": {
        "image_hash": "<image_hash>",
        "message": "Full ad copy text from script...",
        "name": "Spa Day Package - EUR 89",
        "description": "Book your escape today",
        "link": "https://www.carismaspa.com/spa-day",
        "call_to_action": {
          "type": "LEARN_MORE"
        }
      }
    }
  }
}
```

### Step 8: Log to Google Sheets

Run `tools/update_google_sheet.py`:

```
--spreadsheet_id "<google_sheet_id>"
--tab "Campaign Log"
--data ".tmp/publishing/ads_{brand}_{date}.json"
```

Log the following for each created object:

| Column | Value |
|--------|-------|
| Date | Creation date |
| Brand | Brand name |
| Campaign ID | Meta campaign ID |
| Campaign Name | Naming convention |
| Ad Set ID | Meta ad set ID |
| Ad Set Name | Naming convention |
| Ad ID | Meta ad ID |
| Ad Name | Naming convention |
| Format | UGC/Static/etc. |
| Hook | Hook text |
| Offer | Offer name |
| Status | PAUSED |
| Creative File | Local file path |
| Landing Page | URL |
| Notes | Any flags or issues |

### Step 9: Generate Publishing Summary

Output a summary for the human:

```markdown
# Publishing Summary
## Date: {date}
## Brand: {brand_name}

### Campaign Created
- **Name:** CS_W07_2026_CBO
- **Campaign ID:** {id}
- **Status:** PAUSED
- **Daily Budget:** EUR {amount}

### Ad Sets: {count}
| Ad Set | Offer | Audience | Ads |
|--------|-------|----------|-----|
| CS_SpaDay_InterestSpaWellness | Spa Day | Spa/Wellness interests | 3 |
| CS_GiftVoucher_InterestSpaWellness | Gift Voucher | Spa/Wellness interests | 2 |

### Ads: {count}
| Ad | Format | Hook | Status |
|----|--------|------|--------|
| CS_SpaDay_UGC_Question_v1 | UGC Video | Question | PAUSED |
| CS_SpaDay_Static_Emotional_v1 | Static | Emotional | PAUSED |
| ... | ... | ... | PAUSED |

### Next Steps
1. Review campaigns in Meta Ads Manager
2. Verify targeting and budgets
3. Preview ad creatives
4. When ready, activate campaigns manually
```

## Expected Outputs

| Output | Path | Description |
|--------|------|-------------|
| Creative IDs | `.tmp/publishing/creative_ids_{brand}_{date}.json` | Uploaded creative references |
| Campaign data | `.tmp/publishing/campaign_{brand}_{date}.json` | Campaign object ID and details |
| Ad set data | `.tmp/publishing/adsets_{brand}_{date}.json` | Ad set object IDs and details |
| Ad data | `.tmp/publishing/ads_{brand}_{date}.json` | Ad object IDs and details |
| Naming map | `.tmp/publishing/naming_{brand}_{date}.json` | Full naming convention mapping |
| Validation | `.tmp/publishing/validation_{brand}_{date}.json` | Pre-publish validation results |
| Google Sheet | "Campaign Log" tab | Full log of all created objects |
| Summary | `.tmp/publishing/summary_{brand}_{date}.md` | Human-readable publishing report |

## Edge Cases and Error Handling

### API Authentication Failure
- **Token expired:** Report to human. Meta tokens typically expire in 60 days.
- **Insufficient permissions:** Verify the token has `ads_management` permission on the ad account.
- **Wrong ad account:** Double-check `meta_ad_account_id` in brands.json.

### Upload Failures
- **Video too large:** Meta limit is 4GB. Compress and retry.
- **Video format unsupported:** Convert to MP4 H.264. Use ffmpeg if needed.
- **Image too large:** Meta limit is 30MB. Compress and retry.
- **Upload timeout:** Retry up to 3 times with exponential backoff.

### Campaign Creation Failures
- **Budget too low:** Meta minimum daily budget is approximately EUR 1. Ensure budget meets minimum.
- **Invalid targeting:** Interest IDs may have changed. Query the targeting search API to get current IDs.
- **Duplicate campaign name:** Append a timestamp suffix to make unique.
- **Policy violation at creation:** Meta may reject the ad at creation time. Log the rejection reason and flag for human review.

### Partial Failure
- If campaign creates successfully but an ad set fails:
  1. Log the partial state
  2. Report which objects were created and which failed
  3. Do NOT delete the successfully created objects
  4. The human can fix the issue in Ads Manager directly

### Rate Limiting
- Meta Marketing API has rate limits per ad account
- Implement a 1-second delay between API calls
- If rate limited, wait for the specified cooldown period
- For large batches, use the Meta Batch API to combine requests

## APPROVAL GATE

**This workflow has a mandatory approval gate. This is the most critical gate in the system.**

After all campaigns are created in PAUSED state:

1. Present the publishing summary to the human
2. Human reviews in Meta Ads Manager:
   - Campaign structure is correct
   - Targeting is appropriate
   - Budget is correct
   - Ad creative previews look right
   - Landing pages work
   - Naming conventions are followed
3. Human manually activates campaigns when satisfied
4. **The system NEVER activates campaigns. This is a hard rule with no exceptions.**

**Activation is a human-only action performed directly in Meta Ads Manager.**

## Notes

- The PAUSED-only approach is a safety mechanism. Mistakes in ad spend can be very expensive.
- Campaign Budget Optimisation (CBO) lets Meta allocate budget to the best-performing ad sets automatically.
- Always use `OUTCOME_LEADS` objective for lead generation campaigns. Do not use traffic or engagement objectives.
- The Google Sheets log creates an audit trail. Every campaign, ad set, and ad should be traceable from creation through performance review.
- Keep the `.tmp/publishing/` files for at least 2 weeks as a backup record of what was published.
- Interest targeting IDs change over time. Periodically refresh the interest ID mapping using Meta's targeting search API.
