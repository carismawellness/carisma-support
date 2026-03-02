# /competitor-spy Skill -- Weekly Competitor Ad Intelligence

**Slash Command:** `/competitor-spy`

**What This Does:**
When triggered, this skill:
1. Loads competitor config, brand context, and the most recent snapshot
2. Fetches current active ads for all configured competitors via Meta Ad Library API
3. Saves the current state as a dated snapshot
4. Compares against the previous snapshot to detect new ads, killed ads, and long-running winners
5. Analyses each new ad for creative angles, pricing, format, and compliance
6. Generates a structured intelligence report
7. Logs results to Google Sheets and emails the report

**When to Use:**
User wants to check what competitors are running on Meta, get an ad library scan, or produce a weekly competitive intelligence brief.

---

## Usage

### Step 1: Specify Category and Parameters

```
/competitor-spy

Category: all (or spa / aesthetics / slimming)
Dry run: false
```

### Step 2: System Executes Phases 1-5 Automatically

The system loads context, fetches competitor ads via Meta Ad Library API, diffs snapshots, analyses new ads with the AI intelligence framework, generates the report, logs to Sheets, and emails the brief.

---

## System Process (Behind the Scenes)

### Phase 1: Load Context

```
CONTEXT LOADING SEQUENCE

1. Read config/competitors.json
   → Extract competitor entries per category (spa, aesthetics, slimming)
   → Identify TO_BE_FILLED entries — warn and skip them
   → Extract page_id for each valid competitor
   → Count: valid competitors vs total configured

2. Read config/brands.json
   → Extract Carisma brand positioning per vertical
   → Note pricing, offers, and unique selling points
   → This provides comparison context for the intelligence report

3. Read marketing/competitor-intelligence/strategy.md
   → Load the analysis framework dimensions
   → Load intelligence categories and KPIs
   → Reference for classifying each new ad

4. Read marketing/competitor-intelligence/analysis-templates.md
   → Load New Ad Analysis Template (classification schema)
   → Load Weekly Intelligence Brief Template (report structure)
   → Load Competitor Profile Template (per-competitor tracking)

5. Load previous snapshot
   → Scan .tmp/research/competitor-intel/ for competitor-snapshot-*.json
   → Load the most recent one (sorted by date)
   → IF no previous snapshot: this is a first run — all ads will be classified as "new"
   → Note the previous snapshot date for the report header

6. Run tools/scrape_competitor_ads.py --brand_category {category}
   → This generates the MCP instruction plan
   → Returns: list of mcp__meta-ads__search_ads_archive calls to execute
   → Returns: competitor metadata for each instruction
```

**If any context file is missing:**
- Log the missing file
- Continue with available context
- Note limitations in the output
- Suggest creating the missing file

---

### Phase 2: Fetch Competitor Ads

```
AD FETCHING SEQUENCE

For each instruction from the plan:

1. Call mcp__meta-ads__search_ads_archive
   → Parameters from the instruction:
     - search_page_ids: [page_id]
     - ad_reached_countries: ["MT"]
     - ad_active_status: "ACTIVE"
     - fields: [id, page_id, page_name, ad_creative_bodies,
                ad_creative_link_captions, ad_creative_link_titles,
                ad_delivery_start_time, ad_delivery_stop_time,
                publisher_platforms, estimated_audience_size,
                spend, impressions, currency]
     - limit: 50

2. Process the response
   → For each ad in the response, extract:
     - ad_id: the ad's unique identifier
     - page_name: competitor business name
     - body_text: ad copy (from ad_creative_bodies)
     - link_url: destination URL (from ad_creative_link_captions)
     - call_to_action: CTA button type
     - start_date: ad_delivery_start_time
     - media_type: IMAGE / VIDEO / CAROUSEL / COLLECTION
     - status: active / inactive

3. Store results
   → Organise into: category -> competitor_id -> [ad objects]
   → Keep raw API response for reference

4. Handle errors per competitor
   → IF API returns error: log the error, skip this competitor, continue
   → IF rate limited: wait 60 seconds, retry once, then skip if still failing
   → IF page_id is invalid: log warning, skip, continue with others
   → IF no ads found: log "0 active ads for {competitor}", continue

5. After all fetches complete
   → Log total: "{N} ads fetched across {M} competitors in {K} categories"
   → Log any competitors that failed or returned 0 ads
```

**Wait 2 seconds between MCP calls to avoid rate limiting.**

---

### Phase 3: Compare & Analyse

```
COMPARISON AND ANALYSIS SEQUENCE

1. Save Current Snapshot
   → Call save_snapshot(current_ads, output_dir)
   → File: .tmp/research/competitor-intel/competitor-snapshot-{YYYY-MM-DD}.json
   → Skip if dry_run is true

2. Compare Snapshots
   → Call compare_snapshots(current_ads, previous_snapshot)
   → Returns:
     - new_ads: ads in current but not in previous
     - killed_ads: ads in previous but not in current
     - unchanged: ads in both current and previous
     - long_running: ads active for 30+ days
     - summary: counts for each category

3. AI Classification of New Ads
   → For each new ad detected:

   CLASSIFICATION CHECKLIST

   □ HOOK TYPE — Read the first line of body_text:
     - Question? ("Are you tired of...") → question
     - Bold statement? ("The #1 spa in Malta") → bold_claim
     - Customer quote? ("I couldn't believe...") → testimonial
     - Fear/urgency? ("Don't miss out...") → fear_based
     - Aspirational? ("Imagine feeling...") → aspirational
     - Educational? ("Did you know that...") → educational
     - Numbers/stats? ("500+ happy clients") → social_proof

   □ PAIN POINT — What problem does the ad address?
     - Visible ageing signs → ageing
     - Lack of self-confidence → confidence
     - Too busy for self-care → time_pressure
     - Price sensitivity → affordability
     - Trust/safety concerns → trust
     - Body dissatisfaction → body_image
     - Stress/burnout → stress
     - Guilt about self-care → self_care_guilt

   □ OFFER TYPE — Is there a specific value proposition?
     - Percentage or EUR off → discount
     - Free initial assessment → free_consultation
     - Bundle/package pricing → package_deal
     - Expiry date mentioned → limited_time
     - New treatment launch → new_service
     - Seasonal tie-in → seasonal
     - No specific offer → none

   □ CREATIVE FORMAT — from media_type field:
     - Single image → static_image
     - Video content → video
     - Multiple images → carousel
     - Product collection → collection
     - Animated slides → slideshow

   □ MEDIA STYLE — Infer from ad context:
     - Real person in natural setting → lifestyle
     - Product/treatment closeup → product
     - Customer-generated content → ugc
     - Text over image → text_overlay
     - Before/after comparison → before_after
     - Motion graphics → animation
     - Person speaking to camera → talking_head

   □ TARGET AUDIENCE — Infer from language and offer:
     - Young professional language → women_25_34
     - Mature/established language → women_35_44
     - Anti-ageing focus → women_45_plus
     - "For two" / partner language → couples
     - Gift/voucher focus → gift_buyers
     - Male-targeted → men

   □ PRICING — Scan body_text for EUR / currency:
     - Exact price found → pricing_visible: true, extract amount
     - "From EUR X" → pricing_visible: true, note framing
     - Price range → pricing_visible: true, note range
     - No pricing → pricing_visible: false
     - Free consultation only → extract this

   □ CTA TYPE — from call_to_action field or ad copy:
     - Booking-related → book_now
     - Information-seeking → learn_more
     - Messaging-related → send_message
     - Phone-related → call
     - Shopping-related → shop_now
     - Offer-claiming → get_offer

   □ COMPLIANCE FLAGS — Check for:
     - Medical claims ("cures", "treats", "heals") → medical_claims
     - Shame language ("fix your flaws", "hide your...") → shame_language
     - Before/after imagery references → before_after
     - Guaranteed results ("100% results", "guaranteed") → guaranteed_results
     - None of the above → clean

   □ KEY INSIGHT — Write one sentence:
     - What makes this ad notable?
     - What can Carisma learn from it?
     - How does it compare to Carisma's positioning?

4. Classify Killed Ads
   → For each killed ad, estimate why it was removed:
     - Active < 7 days → "Likely failed test"
     - Active 7-14 days → "Underperformer"
     - Active 14-30 days → "Campaign ended or refreshed"
     - Active 30+ days → "Long runner retired — may have new creative"

5. Analyse Long-Running Winners
   → For each ad active 30+ days:
     - Apply the full classification checklist above
     - Note: these ads are likely profitable
     - Pay special attention to hook type, offer, and creative format
     - Flag any approaches Carisma is not currently using
```

---

### Phase 4: Generate Report

```
REPORT GENERATION SEQUENCE

1. Call generate_intelligence_report(diff, competitors)
   → This produces the structured JSON report

2. Enrich with AI Analysis
   → Replace all "PENDING_AI_CLASSIFICATION" entries with the
     classifications from Phase 3
   → Fill in the executive summary with 2-3 key findings
   → Generate recommended actions:
     - 2-3 immediate actions (this week)
     - 2-3 short-term actions (next 2-4 weeks)
     - 1-2 items to monitor

3. Generate Pricing Comparison
   → Compare extracted competitor prices against Carisma's pricing:
     - Spa: EUR 89 Spa Day, EUR 159 Couples Package
     - Aesthetics: Botox from EUR 180, Fillers from EUR 250, Free consultation
     - Slimming: Starter packs EUR 199 (value EUR 625), Free medical consultation
   → Note where Carisma is cheaper, comparable, or more expensive
   → Highlight Carisma's transparent pricing advantage

4. Generate Creative Trend Summary
   → Count format distribution (static vs video vs carousel)
   → Count hook type distribution
   → Identify trends vs previous week (if previous snapshot exists)
   → Note any creative approaches Carisma hasn't tested

5. Format the Weekly Brief
   → Follow the template in marketing/competitor-intelligence/analysis-templates.md
   → Sections: Executive Summary, New Ads, Killed Ads, Long-Running Winners,
     Pricing Intel, Creative Trends, Recommended Actions

6. Save Report
   → Call save_report(report, output_dir)
   → File: .tmp/research/competitor-intel/competitor-report-{YYYY-MM-DD}.json
   → Skip if dry_run is true
```

---

### Phase 5: Log and Notify

#### Log to Google Sheets

```
SHEETS LOG ENTRY (one row per scan session)

Use mcp__google-workspace__sheets_append_values to log:

| Column | Value |
|--------|-------|
| Scan Date | {YYYY-MM-DD} |
| Categories Scanned | spa, aesthetics, slimming |
| Competitors Scanned | {count valid} of {count total} |
| Total Active Ads | {count} |
| New Ads | {count} |
| Killed Ads | {count} |
| Long-Running (30+d) | {count} |
| Pricing Mentions | {count} |
| Top Finding | {executive summary one-liner} |
| Report Path | {path to report JSON} |
| Snapshot Path | {path to snapshot JSON} |
| Status | Complete / Partial / Failed |
| Notes | {any issues, skipped competitors, errors} |

Tab: "Competitor Intel"
```

#### Email Intelligence Report

```
EMAIL NOTIFICATION

Tool: mcp__google-workspace__gmail_send_email
Recipient: mertgulen98@gmail.com

Subject format:
  Competitor Intel — {date} — {new_count} new ads, {killed_count} killed

Body format (HTML):

  COMPETITOR INTELLIGENCE BRIEF — {DATE}

  EXECUTIVE SUMMARY
    {2-3 sentence overview of key findings}

  KEY NUMBERS
    Total active competitor ads: {count}
    New ads this week: {count}
    Killed ads this week: {count}
    Long-running winners (30+ days): {count}

  NEW ADS BY CATEGORY

    SPA COMPETITORS
      {competitor_name}: {new_ad_count} new ads
        - [{hook_type}] {first_50_chars_of_body}... ({format}, {pricing})

    AESTHETICS COMPETITORS
      {competitor_name}: {new_ad_count} new ads
        - [{hook_type}] {first_50_chars_of_body}... ({format}, {pricing})

    SLIMMING COMPETITORS
      {competitor_name}: {new_ad_count} new ads
        - [{hook_type}] {first_50_chars_of_body}... ({format}, {pricing})

  PRICING INTEL
    {Summary of competitor pricing vs Carisma pricing}

  RECOMMENDED ACTIONS
    1. {immediate action}
    2. {immediate action}
    3. {short-term action}

  ---
  Automated by Carisma AI — Competitor Ad Spy System

When to send:
  - ALWAYS send after a completed scan (even with partial data)
  - Include both successes and failures/skips in the same email
  - If ALL competitors are TO_BE_FILLED, still send with a note to fill config

If Gmail MCP fails:
  - Log the email sending failure
  - The scan data is still saved — do not re-run the scan
  - Report: "Scan completed successfully but email notification failed"
```

---

## Error Handling

```
ERROR HANDLING

IF competitors.json is missing:
  → STOP. Report: "Cannot run competitor spy — config/competitors.json not found."
  → Suggest creating the file with competitor Page IDs.

IF all competitors are TO_BE_FILLED:
  → Log warning for each category
  → Generate an empty report structure with instructions to fill config
  → Send email noting that config needs to be populated
  → Do NOT treat this as a failure — it is expected on first setup

IF mcp__meta-ads__search_ads_archive fails for a competitor:
  → Log the specific error (rate limit, invalid page_id, auth issue)
  → Skip this competitor
  → Continue with remaining competitors
  → Include the failure in the report and email

IF Meta API rate limited:
  → Wait 60 seconds
  → Retry the failed call once
  → If still failing, skip and continue
  → Note in report: "Rate limited — {N} competitors could not be scanned"

IF no previous snapshot (first run):
  → All fetched ads are classified as "new"
  → No killed ads or long-running calculations possible
  → Note in report: "First run — no baseline for comparison"
  → This is normal, not an error

IF a competitor has 0 active ads:
  → Log: "{competitor_name} has no active ads"
  → This is valuable intelligence — include it in the report
  → Note: competitor may have paused all ads (seasonal, budget, strategic)

IF Google Sheets logging fails:
  → Log the error
  → Save data locally to .tmp/research/competitor-intel/sheets-fallback-{date}.json
  → Report: "Sheets logging failed — data saved locally"
  → Do not retry during this session
```

---

## Troubleshooting

**Issue: "All competitors are TO_BE_FILLED"**
- This is expected on first setup
- Research competitors using Meta Ad Library web interface
- Fill in config/competitors.json with real Page IDs, names, and URLs
- Re-run the scan after populating the config

**Issue: "Meta API returns no results for a known competitor"**
- Verify the page_id is correct (numeric Meta Page ID, not vanity URL)
- Check if the competitor is actually running ads (visit facebook.com/ads/library manually)
- The competitor may have paused all ads — this is valid intelligence

**Issue: "Rate limited by Meta API"**
- The tool waits 2 seconds between calls by default
- If still rate limited, increase the delay or scan fewer categories per run
- Consider splitting: run spa on Sunday, aesthetics on Monday, etc.

**Issue: "Snapshot file is corrupted"**
- Delete the corrupted snapshot file
- Re-run the scan — it will treat this as a first run
- Previous comparison data is lost but the system recovers automatically

**Issue: "Report has PENDING_AI_CLASSIFICATION entries"**
- The AI classification step in Phase 3 was skipped or failed
- Re-run the classification manually using the analysis templates
- Check that marketing/competitor-intelligence/analysis-templates.md exists

---

## Best Practices

**DO:**
- Run the scan weekly (Sunday evening) for consistent trending data
- Fill in competitor config as soon as you identify competitors
- Study long-running winners closely — they reveal what works
- Compare competitor pricing against Carisma's transparent pricing
- Act on intelligence — feed insights into creative strategy and offer planning
- Keep historical snapshots — they enable trend analysis over months

**DO NOT:**
- Run scans more than once per day (wastes API calls, minimal new data)
- Ignore TO_BE_FILLED warnings — the system is only as good as its config
- Copy competitor creative directly — use it as inspiration, not templates
- Assume killed ads failed — they may have been replaced with updated versions
- Skip the pricing comparison — transparent pricing is Carisma's key advantage
- Delete old snapshots — they are the foundation for trend analysis

---

## Performance Metrics

Track these to measure the intelligence system's effectiveness:
- **Scan completion rate:** Target 100% of configured competitors scanned per week
- **Intelligence coverage:** Target 100% of new ads classified with the analysis framework
- **Actionable insights per week:** Target 2-3 concrete recommendations per report
- **Config completeness:** Target 100% of competitors with real data (no TO_BE_FILLED)
- **Time-to-report:** Target report available within 1 hour of scan completion

---

**Last Updated:** 2026-03-02
**Version:** 1.0 Production
