# 15 - GSC Quick Wins

## Objective

Analyse Google Search Console data for all Carisma brands to identify quick-win ranking opportunities. Categorise queries into actionable buckets (Almost Page 1, Low CTR, Emerging, Local Intent), cross-reference against existing keyword banks, and automatically feed new keywords into the GBP Posting system via auto-addition files. Results are logged to Google Sheets and emailed as a summary report. Runs bi-weekly on the 1st and 15th of each month.

## Required Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `config/brands.json` | Manual config | Brand names, website URLs, GBP settings |
| `marketing/seo-optimisation/quick-win-criteria.json` | Manual config | Analysis criteria: position ranges, CTR thresholds, local keywords, auto-addition caps |
| `marketing/google-gmb/keyword-banks/*.md` | Manual / SEO research | Existing keyword banks per brand for cross-referencing |
| `config/gbp/keywords_{brand_id}_auto_additions.json` | Auto-generated | Previous auto-additions (for merge/deduplication) |
| `.tmp/seo/quick-wins/quick_wins_{brand}_{date}.json` | Auto-generated | Previous quick-win reports (for trend comparison) |

## Tools Used

| Tool | Purpose |
|------|---------|
| `tools/gsc_quick_win_finder.py` | Analyse GSC data, categorise queries, generate auto-additions |
| `mcp__google-search-console__search_analytics` | Pull search analytics data from Google Search Console |
| `mcp__google-workspace__sheets_append_values` | Log quick-win results to Google Sheets |
| `mcp__google-workspace__gmail_send_email` | Send summary report email |

## Step-by-Step Procedure

### Step 1: Load Context

1. Read `config/brands.json` to identify active brands and website URLs
2. Read `marketing/seo-optimisation/quick-win-criteria.json` for analysis criteria
3. Read `marketing/google-gmb/keyword-banks/*.md` to load existing keyword banks
4. Check `config/gbp/keywords_{brand_id}_auto_additions.json` for each brand (previous auto-additions)
5. Check `.tmp/seo/quick-wins/` for previous reports (trend comparison)

**Brand-to-site mapping:**
- carisma_spa → sc-domain:carismaspa.com
- carisma_aesthetics → sc-domain:carismaaesthetics.com
- carisma_slimming → sc-domain:carismaslimming.com

**If keyword banks don't exist yet:**
- Cross-referencing will treat all discovered keywords as "new"
- Flag to the human: "No keyword bank found for {brand}. All GSC keywords will be treated as new opportunities."

### Step 2: Pull GSC Data

For each brand, make two MCP calls to Google Search Console:

**Call 1: 28-day data (primary analysis)**

```
mcp__google-search-console__search_analytics
  site_url: "sc-domain:{brand_domain}"
  dimensions: ["query"]
  date_range: "last_28d"
  row_limit: 500
  data_state: "final"
```

**Call 2: 7-day data (emerging query detection)**

```
mcp__google-search-console__search_analytics
  site_url: "sc-domain:{brand_domain}"
  dimensions: ["query"]
  date_range: "last_7d"
  row_limit: 500
  data_state: "final"
```

**Validate:**
- Both calls return rows with query, clicks, impressions, ctr, position
- Log row counts per brand: "Carisma Spa: 243 queries (28d), 87 queries (7d)"

### Step 3: Analyse Quick Wins

For each brand with valid GSC data:

1. Run `tools/gsc_quick_win_finder.py` analysis functions:
   - `analyse_gsc_data(gsc_data_28d, gsc_data_7d, criteria)` — categorises all queries
   - Returns list of quick-win dicts with query, category, position, impressions, ctr, priority

2. Categories checked in order:
   - **local_intent:** Query contains location terms (malta, gozo, valletta, sliema, st julian, st julians, floriana, near me, mellieha, qawra, paceville)
   - **almost_page_1:** Position 8-20, minimum 50 impressions
   - **low_ctr:** Position 1-10, CTR below 3%
   - **emerging:** Present in 7-day data but not in 28-day data, minimum 10 impressions

3. Sort by priority (high → medium) then by impressions (descending)
4. Cap at max_keywords_per_run (default: 30)

### Step 4: Cross-Reference Keyword Banks

1. Call `load_existing_keywords(brand_id)` to get all existing keywords as a flat set
   - Parses markdown keyword bank tables and bullet lists
   - Includes JSON keyword banks from config/gbp/
   - Includes previous auto-additions

2. Call `cross_reference_keywords(quick_wins, existing_keywords)` to split results:
   - **new_keywords:** Not in any existing bank — candidates for auto-addition
   - **existing_matches:** Already in banks — confirms banks are well-targeted

3. Log: "Found {total} quick wins: {new} new, {existing} already in banks"

### Step 5: Update Keyword Auto-Additions

For each brand with new keywords:

1. Call `generate_auto_additions(new_keywords, brand_id, criteria)`:
   - Selects top keywords up to `auto_addition_max_per_brand` (default: 10)
   - Maps each keyword to the correct bank category via `keyword_bank_mapping`
   - Format: { keyword, category, source_category, position, impressions, ctr, priority }

2. Call `save_auto_additions(additions, brand_id)`:
   - Saves to `config/gbp/keywords_{brand_id}_auto_additions.json`
   - Merges with existing file if present (deduplicates case-insensitively)
   - Logs: "Saved {count} auto-addition keywords for {brand}"

3. Verify file integrity:
   - Re-read the saved file
   - Confirm valid JSON
   - Confirm keyword count matches expected

**Integration point:** These auto-additions are consumed by `tools/gbp_generate_posts.py` via the `merge_auto_additions()` function during the next GBP posting cycle.

### Step 6: Generate Report

Build a summary report containing:

```
GSC QUICK-WIN REPORT — {DATE}

SUMMARY
  Brands analysed: {count}
  Total quick wins: {total}
  New keywords added: {added}
  Already in banks: {existing}

PER BRAND:
  {Brand Name}
    Quick wins: {count} (by category: {breakdown})
    New keywords: {new_count}
    Added to GBP: {added_count}
    Top 10:
      1. {query} — pos {pos}, {imp} imp, {category} [{priority}]
      ...

LOW CTR PAGES (for Wix SEO):
  {query} — pos {pos}, CTR {ctr}%

NEXT RUN: {next_date}
```

Save to `.tmp/seo/quick-wins/quick_wins_{brand}_{date}.json` per brand.

### Step 7: Log to Sheets

Log quick-win results to Google Sheets:

```
mcp__google-workspace__sheets_append_values
  spreadsheet_id: "<google_sheet_id>"
  tab: "SEO Quick Wins"
  data: one row per quick-win keyword
```

| Column | Value |
|--------|-------|
| Date | Analysis date |
| Brand | Brand name |
| Query | Search query |
| Category | almost_page_1 / low_ctr / emerging / local_intent |
| Position | Average position |
| Impressions | Total impressions |
| Clicks | Total clicks |
| CTR | Click-through rate |
| Priority | high / medium |
| Status | new / existing |
| Action | Added to GBP auto-additions / Already in bank / Flagged for Wix SEO |
| Added to Bank | Yes / No |

**If Sheets MCP fails:**
- Save data locally to `.tmp/seo/sheets-fallback.json`
- Report: "Quick-win data saved locally — Sheets logging failed"

### Step 8: Email Report

Send summary email via Gmail MCP:

**Tool:** `mcp__google-workspace__gmail_send_email`
**Recipient:** `mertgulen98@gmail.com`
**Subject:** `GSC Quick Wins — {date} — {total_wins} opportunities across {brand_count} brands`

**Body includes:**
- Total quick wins found and breakdown by category
- Per-brand: quick wins count, new keywords added, top 10 opportunities
- Recommended GBP post topics based on top keywords
- Low CTR pages flagged for Wix SEO optimisation
- Next scheduled run date

**Always send** — even if no quick wins found (confirms the system ran). If Gmail MCP fails, log the error but the analysis was still successful.

## Expected Outputs

| Output | Path | Description |
|--------|------|-------------|
| Quick-win analysis | `.tmp/seo/quick-wins/quick_wins_{brand}_{date}.json` | Full analysis with all quick-win keywords |
| Auto-additions | `config/gbp/keywords_{brand}_auto_additions.json` | New keywords for GBP posting rotation |
| Google Sheet | "SEO Quick Wins" tab | Row-level quick-win log for tracking |
| Email report | Gmail (mertgulen98@gmail.com) | Summary with top opportunities |
| Console output | stdout | JSON summary of the run |

## Edge Cases and Error Handling

### GSC Site Not Verified
- **Symptom:** MCP call returns error about unverified site
- **Action:** Skip the brand. Log error. Include in report: "Site not verified: {site_url}"
- **Recovery:** Ask human to verify the site in Google Search Console

### No Data for Brand
- **Symptom:** MCP call returns empty rows
- **Action:** Log warning: "No GSC data for {brand}. Website may be too new or have no search visibility."
- **Recovery:** Try again with a longer lookback (--days 90). If still empty, the website needs more time to accumulate search data.

### All Keywords Already in Banks
- **Symptom:** Cross-referencing shows 100% existing matches, 0 new keywords
- **Action:** This is normal for mature brands. Log the analysis for trend tracking.
- **Note:** Focus the report on CTR improvements and position changes rather than new discoveries.
- **Suggestion:** Consider expanding the analysis to page-level data or longer-tail queries.

### API Quota Exceeded
- **Symptom:** GSC API returns quota error
- **Action:** Stop processing immediately. Save partial results for brands already analysed.
- **Recovery:** Do not retry within the same day. Schedule completion for next day.

### Auto-Additions File Corrupt
- **Symptom:** JSON parse error when reading existing auto-additions
- **Action:** Log warning. Create a fresh auto-additions file (existing data lost).
- **Prevention:** The tool validates JSON on save.

### Partial Brand Failure
- **Symptom:** GSC data succeeds for some brands but fails for others
- **Action:** Complete analysis for successful brands. Report failures. Do not block successful brands.

## Integration Notes

### Feeds Into: GBP Posting System (Workflow 12)
- Auto-addition files at `config/gbp/keywords_{brand}_auto_additions.json` are consumed by `tools/gbp_generate_posts.py`
- The `merge_auto_additions()` function loads these files during keyword bank loading
- New keywords enter the GBP post rotation on the next posting cycle
- No human approval required — keywords are logged and emailed for visibility

### Feeds Into: Wix SEO Auto-Optimiser (future)
- Low CTR pages are flagged in the quick-wins report
- The Wix SEO system picks up these pages for meta title/description optimisation
- Monthly cadence (1st of each month)

### Scheduling
- **Bi-weekly:** 1st and 15th of each month
- **Implemented via:** launchd plist (`config/gbp/com.carisma.gsc-hunter.plist`) that runs daily at 9am
- **Guard:** The Python script checks `datetime.now().day in (1, 15)` and exits early on other days
- **Why daily + guard:** macOS launchd does not support bi-monthly scheduling natively

## Notes

### GSC Data Latency
- Google Search Console data has a 2-3 day processing delay
- Running on the 1st analyses data through approximately the 28th-29th of the previous month
- "Final" data state is used to avoid volatile preliminary data

### Keyword Bank Growth
- Auto-additions accumulate across runs (merge, not replace)
- Maximum 10 new keywords per brand per run prevents bloat
- Quarterly review recommended: audit auto-additions, promote valuable keywords to main markdown banks, retire underperformers

### Emerging Query Strategy
- Emerging queries are detected by comparing 7-day and 28-day data sets
- Queries in the 7-day set but absent from the 28-day set are likely new search demand
- These receive "medium" priority but should be acted on quickly (create a GBP post within 48 hours)

### Cross-Pollination
- Keyword discoveries for one brand may be relevant to others (e.g., "wellness Malta" applies to all three)
- The agent should flag cross-brand opportunities in the report
- Each brand's auto-additions are kept separate to maintain brand-specific targeting

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
