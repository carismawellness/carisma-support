# /wix-seo Skill -- Optimise Wix Page Meta Titles and Descriptions

**Slash Command:** `/wix-seo`

**What This Does:**
When triggered, this skill:
1. Loads brand context, SEO rules, and meta changelog
2. Pulls page-level performance data from Google Search Console
3. Identifies underperforming pages (high impressions, low CTR)
4. Reads current meta titles and descriptions from Wix
5. Generates improved meta with keyword front-loading and CTAs
6. Runs AI quality review (SEO best practices + brand voice)
7. Pushes approved updates to Wix, logs to Sheets, and emails a before/after report

**When to Use:**
User wants to improve search click-through rates by optimising Wix page meta titles and descriptions for any Carisma brand.

---

## Usage

### Step 1: Specify Brand and Parameters

```
/wix-seo

Brand: all (or carisma_spa / carisma_aesthetics / carisma_slimming)
Days: 30 (GSC data window)
Max pages: 10
Dry run: false
```

### Step 2: System Executes Phases 1-6 Automatically

The system loads context, pulls GSC data, identifies candidates, reads current meta from Wix, generates improvements, runs AI quality review, pushes updates, and sends a report. No human review needed -- the 2-layer AI review handles quality assurance.

---

## System Process (Behind the Scenes)

### Phase 1: Load Context

```
CONTEXT LOADING SEQUENCE

1. Read config/brands.json
   -> Extract website URLs per brand
   -> carisma_spa:        https://www.carismaspa.com
   -> carisma_aesthetics: https://www.carismaaesthetics.com
   -> carisma_slimming:   https://www.carismaslimming.com

2. Read marketing/seo-optimisation/wix-seo-rules.json
   -> Load optimisation_rules (title max 60 chars, description max 155 chars)
   -> Load safety_rules (skip thresholds, max pages, changelog settings)
   -> Load brand_meta_voice per brand (tone, keywords to include, words to avoid)
   -> Load quality_review checklists (layer 1 SEO, layer 2 brand voice)

3. Read .tmp/seo/wix-meta/changelog_{brand}.json (per brand)
   -> Load previous changes with dates
   -> Identify pages changed within last 30 days (skip these)
   -> Identify pages where CTR dropped >20% after our changes (flag for revert)

4. Check for previous optimisation plans
   -> Read .tmp/seo/wix-meta/optimisation_plan_{brand}_*.json
   -> Note any pending or failed optimisations from previous runs
```

**If any context file is missing:**
- Log the missing file
- Continue with available context
- Note limitations in the output
- wix-seo-rules.json is REQUIRED -- halt if missing

---

### Phase 2: Pull Page Performance

```
GSC DATA PULL SEQUENCE

For each brand:

1. Execute mcp__google-search-console__search_analytics
   Parameters:
     siteUrl:    {brand.website_url}
     startDate:  {today - days}  (e.g. 2026-02-01)
     endDate:    {today}          (e.g. 2026-03-02)
     dimensions: ["page"]
     rowLimit:   100

2. Parse the response
   For each row, extract:
     -> page_url:    the full page URL
     -> clicks:      total clicks in the period
     -> impressions: total impressions in the period
     -> ctr:         click-through rate (as decimal, e.g. 0.032 = 3.2%)
     -> position:    average search position

3. Calculate site-wide metrics
   -> total_clicks     = sum of all page clicks
   -> total_impressions = sum of all page impressions
   -> site_avg_ctr     = total_clicks / total_impressions
   -> Log: "Site average CTR: X.XX% (Y clicks / Z impressions)"

4. Store raw data for filtering
   -> Pass full page list to Phase 3

IF GSC returns no data:
  -> Log: "No GSC data available for {brand}. Ensure the property is verified."
  -> Skip this brand
  -> Continue with remaining brands
```

---

### Phase 3: Identify Candidates

```
CANDIDATE FILTERING SEQUENCE

Apply these filters IN ORDER:

Filter 1: Minimum Impressions
  -> Keep only pages with impressions >= 100
  -> Pages with too few impressions lack statistical significance
  -> Log: "Filtered out X pages with <100 impressions"

Filter 2: CTR Below Site Average
  -> Keep only pages with CTR < site_avg_ctr
  -> Pages already above average don't need help
  -> Log: "Filtered out X pages already above site average CTR"

Filter 3: CTR Below Skip Threshold
  -> Keep only pages with CTR < 5.0%
  -> Pages with CTR >= 5% are performing very well -- leave them alone
  -> Log: "Filtered out X pages with CTR >= 5%"

Filter 4: Not Recently Changed
  -> Cross-reference with changelog_{brand}.json
  -> Skip pages where changed_at is within the last 30 days
  -> Give previous optimisations time to take effect
  -> Log: "Filtered out X pages changed within last 30 days"

Filter 5: CTR Not Improving
  -> If historical data shows CTR trending upward, skip
  -> The page is self-correcting -- no intervention needed
  -> Log: "Filtered out X pages with improving CTR trend"

Cap: Max Pages Per Run
  -> Sort remaining candidates by impressions DESC (highest visibility first)
  -> Take top 10 (or --max_pages value)
  -> Log: "Selected X candidates from Y remaining pages"

OUTPUT:
  -> List of candidate pages with: page_url, clicks, impressions, ctr_percent,
     position, site_avg_ctr_percent, ctr_gap_percent
  -> If zero candidates: log "No candidates found -- all pages are performing
     well or were recently optimised. No action needed." and skip to Phase 6 (report only).
```

---

### Phase 4: Read Current Meta and Generate Improvements

```
META READ + GENERATION SEQUENCE

For each candidate page:

Step 1: Read Current Meta from Wix
  -> Execute mcp__wix__CallWixSiteAPI
     Method: GET
     Endpoint: Read the page's SEO/meta data
  -> Extract current meta title and description
  -> Log: "Current title ({X} chars): {title}"
  -> Log: "Current description ({Y} chars): {description}"

  IF Wix API cannot read the page:
    -> Log the error
    -> Skip this page
    -> Continue with remaining candidates

Step 2: Analyse Current Meta Issues
  -> Is the title too long (>60 chars)?
  -> Is the description too long (>155 chars)?
  -> Is the primary keyword missing from the title?
  -> Is the keyword front-loaded (first 30 chars)?
  -> Does the description contain a CTA?
  -> Does the description address search intent?
  -> Log all issues found

Step 3: Generate Improved Title
  -> Maximum 60 characters
  -> Front-load the primary keyword (first 30 chars if possible)
  -> Use compelling language that drives clicks
  -> Match brand meta voice tone
  -> Include brand keywords_to_include where natural
  -> Avoid brand-specific forbidden words
  -> Do NOT include brand name unless space allows
  -> UK English spelling

Step 4: Generate Improved Description
  -> Maximum 155 characters
  -> Include a CTA: Book, Learn more, Call, Visit
  -> Address the likely search intent for this page
  -> Match brand meta voice tone
  -> Include at least one keyword naturally
  -> UK English spelling

Step 5: Validate Character Counts
  -> Title MUST be <= 60 characters (hard limit)
  -> Description MUST be <= 155 characters (hard limit)
  -> IF over limit: trim and regenerate
  -> NEVER truncate mid-word or mid-sentence

OUTPUT per page:
  -> page_url
  -> current_title, current_description
  -> improved_title (with char count), improved_description (with char count)
  -> issues_found in current meta
  -> status: pending_quality_review
```

---

### Phase 5: AI Quality Review (2 Layers)

Every improved meta goes through a 2-layer AI review before being pushed to Wix.

#### Review Layer 1: SEO Best Practices

```
SEO REVIEW CHECKLIST

For each improved title + description pair:

[] PRIMARY KEYWORD appears in the title
   -> Ideally in the first 30 characters
   -> IF missing: rewrite the title to include it naturally
   -> IF keyword is too long for front-loading: place it naturally within the 60 chars

[] TITLE under 60 characters
   -> HARD LIMIT. Reject and trim if over
   -> Count characters precisely (including spaces and punctuation)

[] DESCRIPTION under 155 characters
   -> HARD LIMIT. Reject and trim if over
   -> Count characters precisely

[] NO KEYWORD STUFFING
   -> Maximum 2 mentions of the primary keyword across title + description combined
   -> IF over 2 mentions: remove excess, replace with synonyms or related terms

[] CTA IN DESCRIPTION
   -> Must contain one of: Book, Learn more, Call, Visit, Discover, Start, Get
   -> IF missing: add a natural CTA at the end of the description

[] DESCRIPTION ADDRESSES SEARCH INTENT
   -> What would someone searching for this page want to know?
   -> Does the description answer or promise to answer that?
   -> IF unclear: rewrite to match the likely intent
```

#### Review Layer 2: Brand Voice

```
BRAND VOICE REVIEW

For each improved title + description pair:

[] TONE MATCHES BRAND VOICE
   -> SPA: warm, inviting, sensory -- evokes feelings of relaxation
   -> AESTHETICS: clinical-warm, confident, professional -- inspires trust
   -> SLIMMING: compassionate, evidence-led, supportive -- validates the journey

[] NO CLINICAL CLAIMS WITHOUT DISCLAIMERS (Aesthetics/Slimming)
   -> No guaranteed results
   -> No specific outcome promises
   -> Clinical treatments mention "consultation" or "assessment"

[] UK ENGLISH SPELLING
   -> colour (not color), centre (not center), specialise (not specialize)
   -> programme (not program), organisation (not organization)
   -> Check every word

[] NO SHAME LANGUAGE (Slimming)
   -> No: fat, overweight, ugly, problem, fix, struggle
   -> Replace with: body confidence, wellness, journey, goals, care

[] COMPELLING -- WOULD YOU CLICK THIS?
   -> Read the title + description as a search result
   -> Is it more compelling than a generic competitor snippet?
   -> Does it stand out from other results on the same search page?
   -> IF not compelling: rewrite with stronger language or a unique angle
```

#### Auto-Fix Protocol

```
WHEN AN IMPROVED META FAILS ANY REVIEW LAYER:

1. Identify which checks failed
2. Rewrite ONLY the failing elements (preserve what passed)
3. Re-run BOTH review layers on the revised meta
4. Maximum 3 revision rounds per page
5. IF still failing after 3 rounds:
   -> Skip this page
   -> Log: "Page skipped after 3 review failures: {page_url} -- {failing_checks}"
   -> Continue with remaining pages
```

#### Review Output Format

After review, log the result internally:

```
META REVIEW RESULT
  Page URL: https://www.carismaspa.com/spa-day
  Brand: Carisma Spa
  SEO Score: PASS (keyword front-loaded, 52 chars title, 148 chars description, CTA present)
  Brand Voice: PASS (warm/inviting tone, UK English, no forbidden words)
  Revisions: 1 (shortened description from 162 to 148 chars)
  Status: APPROVED FOR PUSH
```

---

### Phase 6: Push Updates, Log, and Report

#### Push Updates to Wix

```
WIX UPDATE SEQUENCE

IF dry_run is true:
  -> Skip all Wix updates
  -> Log: "DRY RUN -- updates not pushed to Wix"
  -> Still save the optimisation plan and changelog
  -> Still send the email report (marked as dry run)

IF dry_run is false:
  For each approved page:

  Step 1: Push via Wix MCP
    -> Execute mcp__wix__CallWixSiteAPI
       Method: PATCH
       Body: { seoData: { title: "...", description: "..." } }
    -> Wait for confirmation

  Step 2: Verify Update
    -> Re-read the page meta to confirm the update took effect
    -> IF verification fails: log the error, continue

  Step 3: Save to Changelog
    -> Append to changelog_{brand}.json:
       {
         "page_url": "...",
         "old_title": "...",
         "new_title": "...",
         "old_description": "...",
         "new_description": "...",
         "changed_at": "2026-03-02T10:00:00",
         "changed_by": "wix_meta_optimiser",
         "performance_at_change": {
           "clicks": 45,
           "impressions": 1200,
           "ctr_percent": 3.75,
           "position": 8.2
         }
       }
    -> Keep last 200 entries

  Step 4: Wait
    -> Pause 2 seconds between updates (rate limiting)

ERROR HANDLING:
  IF Wix API auth expired:
    -> Log: "Wix API authentication expired. Cannot push updates."
    -> Save optimisation plan for manual push later
    -> Continue to report phase

  IF page not found in Wix:
    -> Log: "Page not found in Wix: {page_url}. Skipping."
    -> Continue with remaining pages

  IF meta update fails:
    -> Log: "Meta update failed for {page_url}: {error}"
    -> Continue with remaining pages
    -> Include failure in report
```

#### Log to Google Sheets

```
SHEETS LOGGING

Log each change to the "Wix SEO Changes" tab in the Carisma tracking spreadsheet.

| Column | Value |
|--------|-------|
| Date | 2026-03-02 |
| Brand | Carisma Spa |
| Page URL | https://www.carismaspa.com/spa-day |
| Old Title | Spa Day - Carisma |
| New Title | Luxury Spa Day in Malta | Carisma Spa |
| Old Title Chars | 18 |
| New Title Chars | 38 |
| Old Description | Book a spa day at Carisma. |
| New Description | Escape into serenity with our signature spa day. Thermal pools, expert therapists, and complete relaxation. Book your visit today. |
| Old Desc Chars | 26 |
| New Desc Chars | 138 |
| CTR Before | 3.75% |
| Impressions | 1200 |
| Position | 8.2 |
| Status | Updated |
| Dry Run | No |
```

#### Email Report

```
EMAIL REPORT

Send via mcp__google-workspace__gmail_send_email
To: mertgulen98@gmail.com
Subject: Wix SEO Meta Updates -- {date} -- {total_pages} pages across {brand_count} brands

Body:

WIX SEO META OPTIMISATION REPORT -- {DATE}

SUMMARY
  Pages optimised: {count}
  Brands: {brand_list}
  Dry run: {yes/no}
  Failures: {failure_count}

PER BRAND BREAKDOWN

  {BRAND_NAME} ({site_url})
    Pages updated: {count}
    Site average CTR: {avg_ctr}%

    Page 1: {page_url}
      Old title: {old_title} ({chars} chars)
      New title: {new_title} ({chars} chars)
      Old description: {old_description} ({chars} chars)
      New description: {new_description} ({chars} chars)
      CTR: {ctr}% | Impressions: {impressions} | Position: {position}
      Quality review: PASS (SEO + Brand Voice)

    Page 2: ...

  (repeat for each brand)

SKIPPED PAGES
  {count} pages skipped:
    - {X} below minimum impressions (<100)
    - {X} above CTR threshold (>5%)
    - {X} above site average CTR
    - {X} recently changed (within 30 days)
    - {X} CTR already improving

FAILURES (if any)
  {page_url}: {error_description}

REVERT CANDIDATES
  Pages where CTR dropped >20% since our last change:
  {page_url}: CTR was {old_ctr}%, now {new_ctr}% (changed on {date})

NEXT RUN
  Scheduled: 1st of next month
  Pages to watch: {pages_changed_this_run} (monitor CTR over next 30 days)

---
Automated by Carisma AI -- Wix SEO Meta Optimiser
```

**When to send:**
- ALWAYS send after a run (even if dry run, even if some updates failed)
- Include both successes and failures in the same email
- If ALL updates failed (zero pushed), still send the email with failure details

**If Gmail MCP fails:**
- Log the email sending failure
- The Wix updates were still successful -- do not retry them
- Report: "Updates pushed successfully but email notification failed"

---

## Troubleshooting

**Issue: "GSC returns no data for this brand"**
- Verify the site property is verified in Google Search Console
- Check that the siteUrl matches exactly (https://www. vs https://)
- The property may be too new to have data (needs 2-4 weeks minimum)
- Try increasing the --days parameter for a wider data window

**Issue: "Wix API authentication expired"**
- The Wix MCP connection may need re-authentication
- Save the optimisation plan locally for manual push
- Report the auth issue and ask the human to reconnect Wix MCP

**Issue: "Page not found in Wix"**
- The page URL from GSC may not match the Wix page structure
- Check for URL path differences (trailing slashes, query params)
- The page may have been deleted or redirected since GSC data was collected

**Issue: "All pages above CTR threshold"**
- This is a good outcome -- the site is performing well
- Report: "No candidates found. All pages with sufficient impressions have CTR above site average or above 5%. No action needed."
- Consider lowering the threshold in wix-seo-rules.json if you want to optimise further

**Issue: "Meta update fails on Wix"**
- Check Wix API permissions (the connected site must allow write access)
- Some Wix pages may have locked SEO fields (e.g. dynamic pages)
- Log the failure and continue with remaining pages
- Report the specific error message for debugging

**Issue: "Changelog is getting large"**
- The tool automatically caps at 200 entries per brand
- Old entries are pruned automatically
- If you need historical data beyond 200 entries, check the Google Sheets log

---

## Best Practices

**DO:**
- Load ALL context files before starting
- Check the changelog before optimising (respect the 30-day cooling period)
- Front-load keywords in titles -- the first 30 characters matter most
- Include a clear CTA in every description
- Use UK English throughout
- Save before/after data for every change (changelog is essential for revert)
- Monitor CTR changes over the next 30 days after optimising

**DO NOT:**
- Optimise pages with CTR above 5% (they are performing well)
- Re-optimise pages changed within the last 30 days
- Stuff keywords (max 2 mentions of primary keyword)
- Exceed character limits (60 title, 155 description -- HARD LIMITS)
- Use shame language in Slimming meta descriptions
- Make clinical claims without disclaimers in Aesthetics/Slimming
- Push updates without saving to the changelog
- Skip the quality review layers

---

## Performance Metrics

Track these to measure the optimiser's effectiveness:
- **CTR improvement:** Average CTR change 30 days after optimisation (target: +15%)
- **Pages optimised per month:** Target 5-10 per brand
- **Quality review first-pass rate:** Target 80%+ (meta approved without revision)
- **Revert rate:** Target <5% of optimised pages needing revert
- **Character efficiency:** Average title chars used (target: 45-58 of 60)
- **Changelog completeness:** 100% of changes logged

---

**Last Updated:** 2026-03-02
**Version:** 1.0.0
