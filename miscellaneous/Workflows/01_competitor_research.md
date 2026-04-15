# 01 - Competitor Research

## Objective

Research competitor ads via the Meta Ad Library to understand what competitors are running, what creative formats they use, which hooks appear most frequently, and what spend/impression levels they achieve. Malta is in the EU, so the Ad Library API returns **full transparency data** including spend ranges and impression ranges for ALL ads.

## Required Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `config/competitors.json` | Manual config | Competitor brand names, Ad Library search terms, page IDs |
| `config/brands.json` | Manual config | Our brand definitions (to know which competitors map to which brand) |
| `.env` | Environment | `META_AD_LIBRARY_ACCESS_TOKEN` for API access |

### competitors.json Structure (Expected)

```json
{
  "carisma_spa": {
    "competitors": [
      {
        "name": "Competitor Spa A",
        "search_terms": ["competitor spa a", "competitor brand"],
        "page_id": "123456789",
        "country": "MT",
        "notes": "Main local competitor"
      }
    ]
  },
  "carisma_aesthetics": {
    "competitors": [
      {
        "name": "Competitor Aesthetics B",
        "search_terms": ["competitor aesthetics b"],
        "page_id": "987654321",
        "country": "MT",
        "notes": "Largest aesthetics clinic in Malta"
      }
    ]
  }
}
```

## Tools Used

| Tool | Purpose |
|------|---------|
| `tools/ad_library_search.py` | Query Meta Ad Library API by search term or page ID |
| `tools/ad_library_scrape.py` | Capture creative screenshots and video thumbnails via Playwright |
| `tools/export_research_report.py` | Compile raw data into a structured markdown report |

## Step-by-Step Procedure

### Step 1: Load Configuration

1. Read `config/brands.json` to get the list of active brands
2. Read `config/competitors.json` to get competitor search terms per brand
3. Determine which brand(s) to research (all brands, or a specific one if requested)

### Step 2: Query Ad Library API

For each competitor of each brand:

1. Run `tools/ad_library_search.py` with parameters:
   ```
   --search_terms "<term>"
   --page_id "<page_id>"  (if known)
   --country "MT"
   --ad_type "ALL"
   --active_status "ACTIVE"
   --limit 50
   ```
2. The API returns for each ad (EU transparency):
   - Ad ID, creation date, start date
   - Ad creative body text, link title, link description
   - Creative type (image, video, carousel)
   - **Spend range** (lower and upper bound in EUR) -- EU only
   - **Impression range** (lower and upper bound) -- EU only
   - Funding entity, disclaimer info
   - Target demographics summary (age, gender, location)

3. Store raw API response to `.tmp/research/raw_{competitor}_{date}.json`

### Step 3: Capture Creative Screenshots

For each active ad found:

1. Run `tools/ad_library_scrape.py` with parameters:
   ```
   --ad_ids "<comma_separated_ids>"
   --output_dir ".tmp/research/screenshots/"
   --format "png"
   --viewport "1080x1920"  (mobile portrait)
   ```
2. Uses Playwright to:
   - Navigate to the Ad Library page for each ad
   - Capture a full screenshot of the creative
   - For video ads: capture the thumbnail frame
3. Save screenshots as `.tmp/research/screenshots/{competitor}_{ad_id}.png`

### Step 4: Analyse and Classify

For each competitor, analyse the collected ads:

1. **Creative Format Distribution:** Count how many ads are image, video, carousel
2. **Hook Extraction:** Identify the first line / opening hook of each ad
3. **Offer Patterns:** What offers/CTAs are being promoted
4. **Spend Concentration:** Which ads have the highest spend ranges (likely winners)
5. **Longevity:** Ads running for 30+ days with high spend are likely proven winners
6. **Targeting Patterns:** What demographics are they targeting (from EU transparency data)

### Step 5: Generate Research Report

Run `tools/export_research_report.py` with parameters:
```
--brand "<brand_id>"
--competitor "<competitor_name>"
--raw_data ".tmp/research/raw_{competitor}_{date}.json"
--screenshots_dir ".tmp/research/screenshots/"
--output ".tmp/research/report_competitor_{brand}_{date}.md"
```

## Expected Outputs

| Output | Path | Description |
|--------|------|-------------|
| Raw API data | `.tmp/research/raw_{competitor}_{date}.json` | Full API response per competitor |
| Screenshots | `.tmp/research/screenshots/{competitor}_{ad_id}.png` | Creative screenshots |
| Research report | `.tmp/research/report_competitor_{brand}_{date}.md` | Structured analysis |

### Report Structure

```markdown
# Competitor Research: {Competitor Name}
## Date: {YYYY-MM-DD}
## Brand Context: {Our Brand}

### Summary
- Total active ads: X
- Format breakdown: X video, Y image, Z carousel
- Estimated total monthly spend: EUR X - Y
- Longest-running ad: X days

### Top Ads by Spend
1. Ad ID: ... | Spend: EUR X-Y | Impressions: X-Y | Running since: ...
   - Hook: "..."
   - Creative type: ...
   - Screenshot: [link]

### Hook Patterns
- Question hooks: X ads
- Bold claim hooks: X ads
- Social proof hooks: X ads
- (list actual hooks)

### Offer Patterns
- Discount offers: X ads
- Free consultation: X ads
- Limited time: X ads

### Targeting Insights (EU Transparency)
- Primary age range: ...
- Gender split: ...
- Geographic focus: ...

### Key Takeaways
- (AI-generated insights about what's working for this competitor)
- (Opportunities we could exploit)
- (Formats/hooks we should test)
```

## Edge Cases and Error Handling

### API Errors
- **Rate limiting (error 4):** Implement exponential backoff. Start at 5 seconds, double up to 60 seconds. Max 5 retries.
- **Invalid access token (error 190):** Report to human. Token may need refresh.
- **Page not found:** Competitor page ID may have changed. Log and skip, report in output.

### No Results Found
- If a search term returns zero results, try:
  1. Broader search terms (just the brand name)
  2. Remove country filter (they may run ads from a different country)
  3. Check "ALL" status instead of just "ACTIVE" to see if they paused
- Log the zero-result search in the report with a note

### Playwright Failures
- **Timeout loading Ad Library page:** Retry up to 3 times with 10-second delays
- **Ad no longer available:** Skip and note in report (ad may have been removed between API query and screenshot)
- **Captcha or block:** Report to human. May need to rotate user agent or use different browser profile.

### Large Result Sets
- If a competitor has 100+ active ads, only capture screenshots for the top 20 by spend range
- Always store the full API data regardless

## Approval Gate

This workflow feeds into **Gate 1** (Research Review) defined in `workflows/00_master_orchestration.md`.

The human should review:
- Are the right competitors being tracked?
- Are the spend/impression ranges plausible?
- Are the extracted hooks accurate and useful?
- Any competitors missing from the list that should be added to `config/competitors.json`?

## Notes

- Malta's EU membership means we get **full transparency data** that is not available for non-EU countries. This is a significant advantage -- we can see actual spend ranges and impression counts.
- Competitor research should capture trends over time. Consider keeping historical reports to track changes week over week.
- The Ad Library API has a rolling 7-year archive. Older ads may still be queryable even if inactive.

---

## Known Issues & Learnings

> Updated when this workflow encounters failures, edge cases, or better methods.
> Always check this section before executing the workflow.
> Log full context in `miscellaneous/learnings/LEARNINGS.md` under Workflow Learnings.

<!--
Entry format:
### [YYYY-MM-DD] — [Issue Title]
**What happened:** Brief description
**Root cause:** Why it happened
**Fix:** What was changed
**Rule:** ALWAYS/NEVER directive (also added to root CLAUDE.md if universal)
-->

_No issues logged yet._
