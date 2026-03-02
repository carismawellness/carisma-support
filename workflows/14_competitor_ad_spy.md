# 14 - Competitor Ad Spy

## Objective

Track competitor Meta ad activity weekly across all Carisma verticals (spa, aesthetics, slimming). Fetch current active ads via the Meta Ad Library API, compare against previous snapshots to detect new launches and killed ads, analyse creative angles and pricing, and produce a structured intelligence brief with actionable recommendations. The output directly informs Carisma's creative strategy, offer positioning, and campaign timing.

## Required Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `config/competitors.json` | Manual config | Competitor Page IDs, names, categories, metadata |
| `config/brands.json` | Manual config | Carisma brand positioning for comparison context |
| `marketing/competitor-intelligence/strategy.md` | Manual config | Intelligence strategy and analysis framework |
| `marketing/competitor-intelligence/analysis-templates.md` | Manual config | Templates for ad classification and report structure |
| Previous snapshot | Auto-generated | Most recent `competitor-snapshot-*.json` in `.tmp/research/competitor-intel/` |

## Tools Used

| Tool | Purpose |
|------|---------|
| `tools/scrape_competitor_ads.py` | Generate MCP instructions, compare snapshots, build intelligence reports |
| Meta Ads MCP (`mcp__meta-ads__search_ads_archive`) | Fetch active competitor ads from Meta Ad Library API |
| `tools/update_google_sheet.py` | Log scan results to Google Sheets "Competitor Intel" tab |
| Gmail MCP (`mcp__google-workspace__gmail_send_email`) | Email intelligence report after each scan |

## Step-by-Step Procedure

### Step 1: Load Context

1. Read `config/competitors.json` to identify configured competitors per category
2. Read `config/brands.json` for Carisma brand positioning and pricing (comparison context)
3. Read `marketing/competitor-intelligence/strategy.md` for the analysis framework
4. Read `marketing/competitor-intelligence/analysis-templates.md` for classification and report templates
5. Scan `.tmp/research/competitor-intel/` for the most recent `competitor-snapshot-*.json`

**If competitors.json is missing:**
- STOP. This is a hard dependency. Report the error and suggest creating the file.

**If all competitors are TO_BE_FILLED:**
- Continue with an empty scan. Generate a report noting that config needs population.
- This is expected on first setup and is not an error.

**If no previous snapshot exists:**
- This is a first run. All fetched ads will be classified as "new".
- Note in the report: "First run — no baseline for comparison."

### Step 2: Fetch Competitor Ads via Meta Ad Library MCP

Run `tools/scrape_competitor_ads.py`:

```
python tools/scrape_competitor_ads.py \
    --brand_category all \
    --output_dir .tmp/research/competitor-intel
```

This generates a plan with MCP instructions. Then execute each instruction:

For each competitor with a valid Page ID:

1. Call `mcp__meta-ads__search_ads_archive` with:
   - `search_page_ids`: [page_id]
   - `ad_reached_countries`: ["MT"]
   - `ad_active_status`: "ACTIVE"
   - `limit`: 50
2. Extract from each result: ad_id, page_name, body_text (from ad_creative_bodies), link_url, call_to_action, start_date (ad_delivery_start_time), media_type, status
3. Organise results: `category -> competitor_id -> [ad objects]`
4. Wait 2 seconds between API calls to avoid rate limiting

**If a competitor's API call fails:**
- Log the error, skip that competitor, continue with the rest.
- If rate limited, wait 60 seconds, retry once, then skip if still failing.

### Step 3: Save Current Snapshot

Save the collected ad data as a dated snapshot:

```
File: .tmp/research/competitor-intel/competitor-snapshot-{YYYY-MM-DD}.json
```

This uses `save_snapshot()` from `tools/scrape_competitor_ads.py`. The snapshot contains all fetched ad data plus metadata (date, tool version, ad counts).

**Skip if --dry_run is set.**

### Step 4: Compare Snapshots (New / Killed / Longevity)

Call `compare_snapshots(current_ads, previous_snapshot)` from the tool. This produces:

| Category | Definition |
|----------|-----------|
| **New ads** | Present in current snapshot but not in previous |
| **Killed ads** | Present in previous snapshot but not in current |
| **Unchanged** | Present in both snapshots |
| **Long-running** | Active for 30+ days (calculated from start_date) |

**Longevity classification:**
- < 7 days active: Likely failed test
- 7-30 days active: Moderate performer
- 30+ days active: Likely profitable — study closely

**First run handling:** If no previous snapshot, all ads are "new" and no killed/longevity analysis is possible.

### Step 5: AI Intelligence Analysis

For each **new ad** detected, classify using the analysis framework:

| Dimension | Classification |
|-----------|---------------|
| Hook type | question / bold_claim / testimonial / fear_based / aspirational / educational / social_proof |
| Pain point | ageing / confidence / time_pressure / affordability / trust / body_image / stress / self_care_guilt |
| Offer type | discount / free_consultation / package_deal / limited_time / new_service / seasonal / none |
| Creative format | static_image / video / carousel / collection / slideshow |
| Media style | lifestyle / product / ugc / text_overlay / before_after / animation / talking_head |
| Target audience | women_25_34 / women_35_44 / women_45_plus / couples / gift_buyers / men |
| Pricing visible | true (extract amount and framing) / false |
| CTA type | book_now / learn_more / send_message / call / shop_now / get_offer |
| Compliance flags | medical_claims / shame_language / before_after / guaranteed_results / clean |
| Key insight | One sentence on what makes this ad notable or what Carisma can learn |

Also classify **long-running winners** (30+ days) using the same framework — these are the most valuable intelligence targets.

For **killed ads**, estimate the likely reason based on how long the ad was active.

### Step 6: Generate Report

Call `generate_intelligence_report(diff, competitors)` from the tool, then enrich with AI analysis:

1. Fill the executive summary (2-3 key findings)
2. Replace PENDING_AI_CLASSIFICATION entries with classifications from Step 5
3. Generate pricing comparison: competitor prices vs Carisma's pricing
4. Summarise creative trends: format distribution, hook type distribution, notable approaches
5. Generate recommended actions:
   - 2-3 immediate actions (this week)
   - 2-3 short-term actions (next 2-4 weeks)
   - 1-2 items to monitor

Save the report:

```
File: .tmp/research/competitor-intel/competitor-report-{YYYY-MM-DD}.json
```

### Step 7: Log to Sheets

Log the scan session to Google Sheets using `mcp__google-workspace__sheets_append_values`:

| Column | Value |
|--------|-------|
| Scan Date | {date} |
| Categories Scanned | spa, aesthetics, slimming |
| Competitors Scanned | {valid_count} of {total_count} |
| Total Active Ads | {count} |
| New Ads | {count} |
| Killed Ads | {count} |
| Long-Running (30+d) | {count} |
| Pricing Mentions | {count} |
| Top Finding | {one-liner from executive summary} |
| Report Path | {file path} |
| Status | Complete / Partial / Failed |
| Notes | {issues, skips, errors} |

**Tab:** "Competitor Intel"

**If Sheets fails:**
- Save data locally to `.tmp/research/competitor-intel/sheets-fallback-{date}.json`
- Report the failure but do not re-run the scan.

### Step 8: Email Intelligence Report

Send the intelligence brief via Gmail MCP:

**Tool:** `mcp__google-workspace__gmail_send_email`
**Recipient:** `mertgulen98@gmail.com`
**Subject:** `Competitor Intel — {date} — {new_count} new ads, {killed_count} killed`

**Body includes:**
- Executive summary (2-3 sentences)
- Key numbers: total active, new, killed, long-running
- New ads by category: competitor name, hook type, first 50 chars, format, pricing
- Pricing intel summary
- Top 3 recommended actions
- Report and snapshot file paths

**Always send** — even with partial data or TO_BE_FILLED competitors. If Gmail MCP fails, log the error but do not re-run the scan.

## Expected Outputs

| Output | Path | Description |
|--------|------|-------------|
| Snapshot | `.tmp/research/competitor-intel/competitor-snapshot-{date}.json` | Current state of all competitor ads |
| Intelligence report | `.tmp/research/competitor-intel/competitor-report-{date}.json` | Structured analysis with classifications and recommendations |
| Google Sheet log | "Competitor Intel" tab | One-row scan session summary |
| Email notification | Gmail (mertgulen98@gmail.com) | Intelligence brief with key findings |
| Console output | stdout | Scan plan and summary statistics |

## Edge Cases and Error Handling

### Competitor Page ID Invalid
- **Symptom:** Meta API returns an error for a specific page_id
- **Action:** Log the error with the page_id. Skip this competitor. Continue with others. Report the invalid ID in the intelligence brief so it can be corrected in config/competitors.json.
- **Prevention:** Verify Page IDs are numeric Meta Page IDs (not vanity URLs or page names).

### API Rate Limit
- **Symptom:** Meta API returns a rate limit error (HTTP 429 or similar)
- **Action:** Wait 60 seconds. Retry the failed call once. If still failing, skip and continue. Note in report: "Rate limited — {N} competitors could not be scanned."
- **Prevention:** Wait 2 seconds between API calls. Consider splitting categories across different days if rate limits persist.

### No Previous Snapshot (First Run)
- **Symptom:** No `competitor-snapshot-*.json` files exist in the output directory
- **Action:** Treat all fetched ads as "new". Skip killed ads and longevity analysis. Note in report: "First run — no baseline for comparison."
- **Prevention:** This is expected on the first run. Subsequent runs will have a baseline.

### Competitor Has No Active Ads
- **Symptom:** Meta API returns 0 results for a competitor
- **Action:** Log this as intelligence (the competitor may have paused all advertising). Include in the report: "{competitor_name} has 0 active ads."
- **Note:** This is valuable information, not an error. The competitor may be in a quiet period, budget exhaustion, or strategic pause.

### TO_BE_FILLED Competitors
- **Symptom:** Competitor entries in config/competitors.json have "TO_BE_FILLED" for name, page_id, or URLs
- **Action:** Warn in logs. Skip these competitors. Continue scanning any valid competitors. Include a note in the report and email: "X competitors are not yet configured. Update config/competitors.json with real data."
- **Prevention:** Populate config/competitors.json with real competitor data from manual Ad Library research.

### Snapshot Corruption
- **Symptom:** Previous snapshot file exists but cannot be parsed (JSON decode error)
- **Action:** Treat as first run (no previous baseline). Log warning: "Previous snapshot corrupted — treating as first run."
- **Recovery:** Delete the corrupted file. The next scan will create a fresh baseline.

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
