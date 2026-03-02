# /gsc-hunter Skill -- Analyse GSC Data and Feed Quick Wins into GBP Posting

**Slash Command:** `/gsc-hunter`

**What This Does:**
When triggered, this skill:
1. Loads brand context, keyword banks, and quick-win analysis criteria
2. Pulls Google Search Console data for each brand website (28-day + 7-day)
3. Categorises queries into quick-win buckets and cross-references keyword banks
4. Writes new keywords to auto-addition files for GBP posting integration
5. Logs results to Google Sheets and emails a summary report

**When to Use:**
User wants to analyse GSC data, find SEO quick wins, discover keyword gaps, or feed new keywords into the GBP posting system.

---

## Phase 1: Load Context

```
CONTEXT LOADING SEQUENCE

1. Read config/brands.json
   → Extract website URLs per brand
   → Map brand_id → website_url for GSC site property
   → carisma_spa → sc-domain:carismaspa.com
   → carisma_aesthetics → sc-domain:carismaaesthetics.com
   → carisma_slimming → sc-domain:carismaslimming.com

2. Read marketing/seo-optimisation/quick-win-criteria.json
   → Load position ranges, CTR thresholds, local keywords
   → Load auto-addition caps and keyword bank mappings
   → Note: almost_page_1 → position 8-20, min 50 impressions
   → Note: low_ctr → position 1-10, CTR < 3%
   → Note: emerging → 7-day lookback, min 10 impressions
   → Note: local_intent → matches malta, gozo, valletta, sliema, etc.

3. Read marketing/google-gmb/keyword-banks/*.md
   → Load existing keyword banks for all 3 brands
   → Parse markdown tables and bullet lists into flat keyword sets
   → These are used for cross-referencing (deduplication)

4. Check config/gbp/keywords_{brand}_auto_additions.json (for each brand)
   → Load previous auto-additions if they exist
   → Include these in the existing keyword set for deduplication

5. Check .tmp/seo/quick-wins/ for previous reports
   → Note when the last analysis was run
   → Use for trend comparison if available
```

**If any context file is missing:**
- Log the missing file
- Continue with available context
- Note limitations in the output
- Suggest creating the missing file

---

## Phase 2: Pull GSC Data

For each brand, execute two MCP calls to Google Search Console.

```
GSC DATA RETRIEVAL SEQUENCE

For each brand in [carisma_spa, carisma_aesthetics, carisma_slimming]:

  Step 2a: Pull 28-day data
  → Tool: mcp__google-search-console__search_analytics
  → Parameters:
    - site_url: "sc-domain:{brand_domain}"
    - dimensions: ["query"]
    - date_range: "last_28d" (or custom range based on --days parameter)
    - row_limit: 500
    - data_state: "final"
  → Expected response: rows with query, clicks, impressions, ctr, position

  Step 2b: Pull 7-day data (for emerging query detection)
  → Tool: mcp__google-search-console__search_analytics
  → Parameters:
    - site_url: "sc-domain:{brand_domain}"
    - dimensions: ["query"]
    - date_range: "last_7d"
    - row_limit: 500
    - data_state: "final"
  → Expected response: rows with query, clicks, impressions, ctr, position

  Step 2c: Validate data
  → Check that both responses contain rows
  → Log row counts: "Carisma Spa: 243 queries (28d), 87 queries (7d)"
  → If no data: log warning, skip brand, continue to next
```

**Error handling:**
- If GSC site is not verified: log error "Site not verified: {site_url}". Skip brand. Include in report.
- If API returns empty data: log warning. The brand may be too new or have no search visibility.
- If API quota exceeded: stop all brands. Report partial results. Schedule retry.

---

## Phase 3: Analyse Quick Wins

```
ANALYSIS SEQUENCE

For each brand with valid GSC data:

  Step 3a: Run analysis tool
  → Call: tools/gsc_quick_win_finder.py functions
  → Pass: gsc_data_28d, gsc_data_7d, criteria config
  → The tool categorises each query:
    1. Check for local intent keywords (malta, gozo, near me, etc.)
    2. Check Almost Page 1 (position 8-20, 50+ impressions)
    3. Check Low CTR (position 1-10, CTR < 3%)
    4. Check Emerging (in 7-day data but not in 28-day data, 10+ impressions)
  → Queries can match multiple categories — highest priority wins

  Step 3b: Cross-reference keyword banks
  → Load existing keywords for the brand (markdown + JSON + previous auto-additions)
  → Compare each quick-win keyword against existing set (case-insensitive)
  → Split into: new_keywords and existing_matches
  → Log: "Found 18 quick wins: 12 new, 6 already in banks"

  Step 3c: Generate summary per brand
  → Count by category: X almost_page_1, Y low_ctr, Z emerging, W local_intent
  → Identify top 10 highest-priority keywords
  → Flag any "Already ranking well + in keyword bank" keywords for priority boost
```

**Validation checks:**
- [ ] All GSC data rows have valid query, position, impressions, ctr fields
- [ ] Category assignment follows priority order (local > almost_page_1 > low_ctr > emerging)
- [ ] Cross-reference uses case-insensitive comparison
- [ ] Max keywords per run does not exceed threshold (default: 30)

---

## Phase 4: Update Keyword Banks

```
KEYWORD BANK UPDATE SEQUENCE

For each brand with new keywords:

  Step 4a: Generate auto-additions
  → Select top keywords up to auto_addition_max_per_brand (default: 10)
  → Priority ordering: high > medium > low, then by impressions (descending)
  → Map each keyword to the correct bank category:
    - almost_page_1 → primary
    - low_ctr → primary
    - emerging → secondary
    - local_intent → local

  Step 4b: Write auto-additions file
  → Save to: config/gbp/keywords_{brand_id}_auto_additions.json
  → If file exists: merge new keywords (deduplicate by keyword, case-insensitive)
  → Format: see marketing/seo-optimisation/strategy.md for schema

  Step 4c: Flag underused keywords
  → Check existing keyword banks for keywords that appear in GSC data
    but have not been used in recent GBP posts (check post log)
  → Flag these for priority boost in the next posting cycle
  → Add a "priority_boost" field to the auto-additions file

  Step 4d: Verify file integrity
  → Re-read the saved auto-additions file
  → Confirm valid JSON
  → Confirm keyword count matches expected
  → Log: "Saved 8 auto-addition keywords for carisma_spa"
```

**Important rules:**
- [ ] Maximum 10 new keywords per brand per run
- [ ] Never overwrite existing auto-additions — always merge
- [ ] Deduplication is case-insensitive
- [ ] Every keyword must have: keyword, category, source_category, position, impressions, ctr, priority

---

## Phase 5: Log and Notify

### Log to Google Sheets

```
SHEETS LOGGING SEQUENCE

1. Open Google Sheets via mcp__google-workspace__sheets_append_values
2. Target tab: "SEO Quick Wins"
3. Append one row per quick-win keyword:

| Column | Value |
|--------|-------|
| Date | 2026-03-02 |
| Brand | Carisma Spa |
| Query | couples massage Malta |
| Category | almost_page_1 |
| Position | 12.3 |
| Impressions | 85 |
| Clicks | 2 |
| CTR | 0.024 |
| Priority | high |
| Status | new (or existing) |
| Action | Added to GBP auto-additions (primary) |
| Added to Bank | Yes / No |

4. If Sheets MCP fails:
   → Save data locally to .tmp/seo/sheets-fallback.json
   → Report: "Quick-win data saved locally — Sheets logging failed"
   → Retry on next session
```

### Email Report

```
EMAIL NOTIFICATION SEQUENCE

1. Send via: mcp__google-workspace__gmail_send_email
2. Recipient: mertgulen98@gmail.com
3. Subject: "GSC Quick Wins — {date} — {total_wins} opportunities across {brand_count} brands"

4. Email body format (HTML):

GSC QUICK-WIN REPORT — {DATE}

SUMMARY
  Brands analysed: {brand_count}
  Total quick wins found: {total_wins}
  New keywords added: {total_added}
  Already in banks: {total_existing}

PER BRAND BREAKDOWN

  {BRAND_NAME}
    Quick wins: {count}
    New keywords: {new_count}
    Already in banks: {existing_count}
    Keywords added to GBP rotation: {added_count}

    Top 10 Quick Wins:
    1. {query} — position {pos}, {impressions} imp, {category} [{priority}]
    2. {query} — position {pos}, {impressions} imp, {category} [{priority}]
    ...

    Recommended GBP Post Topics:
    - {topic_suggestion_1}
    - {topic_suggestion_2}
    - {topic_suggestion_3}

  (repeat for each brand)

LOW CTR PAGES (for Wix SEO Optimiser)
  {page_url}: "{query}" at position {pos} with {ctr}% CTR
  ...

NEXT RUN: {next_date} (1st or 15th of the month)

---
Automated by Carisma AI — GSC Quick-Win Hunter

5. Always send — even if no quick wins found (report "no opportunities this cycle")
6. If Gmail MCP fails: log error, analysis was still successful
```

---

## Troubleshooting

**Issue: "GSC site not verified"**
- The site must be verified in Google Search Console
- Check the site URL format: should be "sc-domain:example.com" (no https://)
- Ask human to verify the site in Search Console if not already done

**Issue: "No GSC data returned"**
- Brand website may be too new or have very low traffic
- Check that the site URL is correct in the brand config
- Try a longer lookback period (--days 90)
- GSC may take 2-3 days to process new data

**Issue: "All keywords already in banks"**
- This is normal for mature brands with comprehensive keyword banks
- The system still logs the analysis for trend tracking
- Focus on CTR improvements rather than new keyword discovery
- Consider expanding to page-level analysis (not just query-level)

**Issue: "API quota exceeded"**
- Google Search Console API has a daily quota
- Stop processing immediately — do not retry within the same day
- Report partial results for brands already analysed
- Schedule completion for the next day

**Issue: "Auto-additions file corrupt"**
- Delete the corrupt file and re-run the analysis
- The tool will create a fresh auto-additions file
- Existing keyword banks in markdown are unaffected

---

## Best Practices

**DO:**
- Run analysis for all brands in the same session for consistency
- Compare results with previous cycles to spot trends
- Prioritise local intent keywords — they have the highest GBP impact
- Include recommended GBP post topics in the email report
- Track which auto-added keywords actually appear in GBP posts (measure the loop)

**DO NOT:**
- Run more than once per bi-weekly cycle (GSC data does not change fast enough)
- Add more than 10 keywords per brand per run (prevents keyword bank bloat)
- Ignore the "existing_matches" list — these keywords confirm the banks are working
- Delete auto-additions files manually — they accumulate history across runs
- Assume position data is real-time (GSC data has a 2-3 day delay)

---

## Performance Metrics

Track these to measure the GSC Hunter's effectiveness:
- **Quick wins discovered per cycle:** Target 5-15 per brand
- **New keyword capture rate:** % of quick wins that are genuinely new
- **Keyword-to-post conversion:** % of auto-added keywords that appear in GBP posts within 2 cycles
- **Ranking improvement:** % of "Almost Page 1" keywords that reach page 1 within 8 weeks
- **CTR improvement:** Average CTR change for flagged low-CTR pages after meta rewrite

---

**Last Updated:** 2026-03-02
**Version:** 1.0.0
