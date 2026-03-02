# 16 - Wix SEO Meta Optimiser

## Objective

Identify underperforming pages across all Carisma Wix websites using Google Search Console data, generate improved meta titles and descriptions aligned with brand voice and SEO best practices, push updates to Wix via MCP, and track all changes in a changelog for audit and revert. Runs monthly on the 1st, targeting pages with high impressions but below-average CTR. Content is quality-checked by a 2-layer AI review (SEO best practices + brand voice), then auto-pushed to Wix. All changes are logged to Google Sheets and an email report with before/after comparison is sent.

## Required Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `config/brands.json` | Manual config | Brand names, codes, website URLs, brand voice rules |
| `marketing/seo-optimisation/wix-seo-rules.json` | Manual config | Safety rules, optimisation config, brand meta voice, quality review checklists |
| `.tmp/seo/wix-meta/changelog_{brand}.json` | Auto-generated | Running changelog of all meta changes per brand (for revert and skip logic) |
| `.tmp/seo/wix-meta/optimisation_plan_{brand}_{date}.json` | Workflow 16 Step 5 output | Generated optimisation plan with before/after per page |

## Tools Used

| Tool | Purpose |
|------|---------|
| `tools/wix_meta_optimiser.py` | Generate agent instructions, filter candidates, build MCP call parameters |
| `mcp__google-search-console__search_analytics` | Pull page-level performance data (clicks, impressions, CTR, position) |
| `mcp__wix__CallWixSiteAPI` | Read current meta from Wix pages; push updated meta titles and descriptions |
| `mcp__google-workspace__gmail_send_email` | Send before/after report email after each run |
| `tools/update_google_sheet.py` | Log all changes to Google Sheets "Wix SEO Changes" tab |

## Step-by-Step Procedure

### Step 1: Load Context

1. Read `config/brands.json` to identify active brands and their website URLs
2. Read `marketing/seo-optimisation/wix-seo-rules.json` for safety rules, optimisation config, and brand voice
3. Read `.tmp/seo/wix-meta/changelog_{brand}.json` for each brand to understand previous changes
4. Check for previous optimisation plans in `.tmp/seo/wix-meta/`

**If wix-seo-rules.json does not exist:**
- HALT. This file is required for safe operation.
- Report: "Cannot run Wix SEO optimiser without wix-seo-rules.json. Create it first."

**If changelog does not exist:**
- This is normal for the first run. Proceed with an empty changelog.
- The tool will create the changelog file after the first successful update.

### Step 2: Pull GSC Page Data

Run `tools/wix_meta_optimiser.py` to generate MCP instructions:

```
python tools/wix_meta_optimiser.py \
    --brand_id all \
    --days 30 \
    --max_pages 10 \
    --output_dir .tmp/seo/wix-meta
```

Then execute the generated MCP instructions:

For each brand, call `mcp__google-search-console__search_analytics`:

```
Parameters:
  siteUrl:    {brand.website_url}
  startDate:  {today - 30 days}
  endDate:    {today}
  dimensions: ["page"]
  rowLimit:   100
```

**Expected response per page:**
- `page_url` -- the full URL of the page
- `clicks` -- number of clicks from search results
- `impressions` -- number of times the page appeared in search results
- `ctr` -- click-through rate (decimal, e.g. 0.032 = 3.2%)
- `position` -- average search position

**If GSC returns no data:**
- The brand's website may not be verified in GSC
- Log the issue and skip this brand
- Report in the final summary

### Step 3: Identify Candidates

Filter the GSC page data using safety rules from `wix-seo-rules.json`:

| Filter | Criteria | Purpose |
|--------|----------|---------|
| Minimum impressions | >= 100 | Only optimise pages with enough data |
| CTR below site average | < site_avg_ctr | Target underperformers |
| CTR below skip threshold | < 5.0% | Leave high performers alone |
| Not recently changed | Not in changelog within 30 days | Give previous changes time |
| CTR not improving | No upward trend | Don't interfere with self-correcting pages |

Sort remaining candidates by **impressions descending** (highest visibility = most impact).

Cap at **10 pages per brand per run** (configurable via --max_pages).

**If zero candidates:**
- All pages are performing well or were recently optimised
- Log: "No candidates found for {brand}. No action needed."
- Skip to Step 8 (report only)

### Step 4: Read Current Meta (Wix MCP)

For each candidate page, use `mcp__wix__CallWixSiteAPI` to read the current meta title and description:

```
Method: GET
Endpoint: /site-properties/v4/properties (or equivalent Wix SEO endpoint)
```

Extract:
- Current meta title (and character count)
- Current meta description (and character count)

Log the current state for before/after comparison.

**If Wix cannot read a page's meta:**
- Skip this page
- Log the error
- Continue with remaining candidates

### Step 5: Generate Improved Meta (AI + Brand Voice)

For each candidate page, the AI agent generates improved meta:

**Title rules:**
- Maximum 60 characters (HARD LIMIT)
- Primary keyword front-loaded (first 30 characters if possible)
- Compelling language that drives clicks
- Brand name not required (space is precious)
- Match brand meta voice tone from wix-seo-rules.json

**Description rules:**
- Maximum 155 characters (HARD LIMIT)
- Must include a CTA (Book, Learn more, Call, Visit, Discover)
- Must address the likely search intent for the page
- UK English spelling throughout
- Match brand meta voice tone

**Brand voice application:**
- Spa: warm, inviting, sensory language. Include: spa, Malta, wellness. Avoid: cheap, discount, deal
- Aesthetics: clinical-warm, confident language. Include: aesthetics, Malta, clinic. Avoid: anti-ageing, fix, flaws
- Slimming: compassionate, evidence-led language. Include: slimming, Malta, body. Avoid: fat, overweight, ugly

Save the optimisation plan to `.tmp/seo/wix-meta/optimisation_plan_{brand}_{date}.json`.

### Step 6: AI Quality Review (2-Layer)

Every improved meta passes through a 2-layer AI review before being pushed.

**Layer 1 -- SEO Best Practices:**

| Check | Criteria | Fail Action |
|-------|----------|-------------|
| Keyword in title | Primary keyword present, ideally in first 30 chars | Rewrite title |
| Title length | <= 60 characters | Trim and rewrite |
| Description length | <= 155 characters | Trim and rewrite |
| No keyword stuffing | Max 2 mentions of primary keyword | Remove excess |
| CTA in description | Contains Book/Learn more/Call/Visit/Discover | Add CTA |
| Search intent | Description addresses likely search intent | Rewrite description |

**Layer 2 -- Brand Voice:**

| Check | Criteria | Fail Action |
|-------|----------|-------------|
| Tone match | Matches brand_meta_voice tone | Rewrite in correct tone |
| Clinical claims | No claims without disclaimers (Aesthetics/Slimming) | Add disclaimer or remove claim |
| UK English | British spelling throughout | Fix spelling |
| Shame language | No shame words in Slimming meta (fat, overweight, ugly) | Replace with positive alternatives |
| Compelling | Would you click this? More compelling than a generic snippet? | Rewrite with stronger angle |

**Auto-fix protocol:**
1. If any check fails: rewrite the failing elements, re-run both layers
2. Maximum 3 revision rounds per page
3. If still failing after 3 rounds: skip the page, log the issue, continue
4. Log revision count per page in the quality review result

### Step 7: Push Updates (Wix MCP) + Save Changelog

**If dry_run is true:**
- Skip all Wix updates
- Still save the optimisation plan and changelog (marked as dry run)
- Proceed to Step 8

**If dry_run is false:**

For each page that passed quality review:

1. Execute `mcp__wix__CallWixSiteAPI`:
   ```
   Method: PATCH
   Body: { seoData: { title: "...", description: "..." } }
   ```
2. Wait for confirmation
3. Append to `changelog_{brand}.json`:
   ```json
   {
     "page_url": "https://www.carismaspa.com/spa-day",
     "old_title": "Spa Day - Carisma",
     "new_title": "Luxury Spa Day in Malta | Carisma Spa",
     "old_description": "Book a spa day at Carisma.",
     "new_description": "Escape into serenity with our signature spa day. Thermal pools, expert therapists, and complete relaxation. Book today.",
     "changed_at": "2026-03-02T10:00:00",
     "changed_by": "wix_meta_optimiser",
     "performance_at_change": {
       "clicks": 45,
       "impressions": 1200,
       "ctr_percent": 3.75,
       "position": 8.2
     }
   }
   ```
4. Keep only the last 200 changelog entries per brand
5. Wait 2 seconds between updates (rate limiting)

### Step 8: Log to Sheets + Email Report

**Log each change to Google Sheets:**

Tab: "Wix SEO Changes"

| Column | Value |
|--------|-------|
| Date | 2026-03-02 |
| Brand | Carisma Spa |
| Page URL | https://www.carismaspa.com/spa-day |
| Old Title | Spa Day - Carisma |
| New Title | Luxury Spa Day in Malta | Carisma Spa |
| Old Description | Book a spa day at Carisma. |
| New Description | Escape into serenity with our signature spa day... |
| CTR Before | 3.75% |
| Impressions | 1200 |
| Position | 8.2 |
| Status | Updated |
| Dry Run | No |

**Send email report via `mcp__google-workspace__gmail_send_email`:**

- **To:** mertgulen98@gmail.com
- **Subject:** `Wix SEO Meta Updates -- {date} -- {total_pages} pages across {brand_count} brands`
- **Body:** Full before/after comparison per page, skip reasons, failures, revert candidates, next run date

Always send the email, even if some updates failed or it was a dry run.

## Expected Outputs

| Output | Path | Description |
|--------|------|-------------|
| Agent instructions | `.tmp/seo/wix-meta/agent_instructions_{date}.json` | MCP call parameters and filtering instructions |
| Optimisation plan | `.tmp/seo/wix-meta/optimisation_plan_{brand}_{date}.json` | Before/after per page with quality review |
| Changelog | `.tmp/seo/wix-meta/changelog_{brand}.json` | Running log of all changes for revert |
| Google Sheet | "Wix SEO Changes" tab | Full audit trail of all meta changes |
| Email notification | Gmail (mertgulen98@gmail.com) | Before/after report sent after every run |

## Edge Cases and Error Handling

### Wix API Auth Expired
- **Symptom:** Wix MCP returns authentication error
- **Action:** Save optimisation plan locally. Report: "Wix API authentication expired. Optimisation plan saved but updates not pushed. Please reconnect Wix MCP."
- **Recovery:** Human reconnects Wix. Re-run with the saved plan or trigger a fresh run.

### Page Not Found in Wix
- **Symptom:** GSC has data for a page URL that Wix cannot find
- **Action:** Log: "Page not found in Wix: {url}. May have been deleted or redirected." Skip this page.
- **Prevention:** The changelog tracks page URLs. Stale URLs naturally drop out as they lose impressions in GSC.

### Insufficient GSC Data
- **Symptom:** GSC returns very few pages or no data
- **Action:** Check if the site property is verified. Try increasing --days. Report: "Insufficient GSC data for {brand}. Only {count} pages with data."
- **Recovery:** Wait for more data to accumulate (new sites need 2-4 weeks).

### All Pages Above Threshold
- **Symptom:** Every page with sufficient impressions already has CTR above site average or above 5%
- **Action:** This is a good outcome. Report: "No candidates found. All pages performing well."
- **Note:** Consider lowering the skip_above_ctr_percent threshold in wix-seo-rules.json to optimise further.

### Meta Update Fails
- **Symptom:** Wix MCP returns error when trying to update a page's meta
- **Action:** Log the specific error. Skip this page. Continue with remaining pages. Report the failure.
- **Common causes:** Locked SEO fields on dynamic pages, insufficient permissions, page type not supported.

### Changelog Revert Detection
- **Symptom:** A previously optimised page now has CTR that dropped >20% compared to when we changed it
- **Action:** Flag in the email report under "Revert Candidates". Do NOT auto-revert -- human decides.
- **Note:** CTR fluctuations can be seasonal or query-mix changes, not necessarily our fault.

## Integration Notes

### GSC Hunter Feeds Into This
- The GSC Hunter automation (`mcp__google-search-console__detect_quick_wins`) identifies "low CTR" pages
- These findings are natural candidates for this Wix SEO optimiser
- When GSC Hunter flags low-CTR pages, consider running this workflow with those pages prioritised

### Complementary Automations
- **GBP Posting (Workflow 12):** Local SEO content that drives branded searches -- improved meta captures that traffic
- **Keyword Research:** New target keywords discovered should be reflected in future meta optimisations
- **Performance Review (Workflow 09):** Monthly performance review may surface SEO opportunities

## Scheduling

- **Frequency:** Monthly (1st of each month)
- **Time:** 10:00am
- **Mechanism:** launchd plist runs `tools/wix_meta_optimiser.py` daily at 10am, but the script checks `datetime.now().day == 1` and exits early if it is not the 1st
- **Override:** Set environment variable `WIX_SEO_FORCE_RUN=1` to bypass the monthly gate
- **Plist:** `config/gbp/com.carisma.wix-seo.plist`

## AI QUALITY GATE

**This workflow uses an automated 2-layer AI quality review at Step 6.**

- All improved meta passes through SEO best practices and brand voice checks
- Meta that passes both layers is auto-pushed to Wix without human intervention
- The AI auto-fixes issues (up to 3 revision rounds) before skipping
- Pages that cannot pass review are skipped and logged
- The system operates fully autonomously: pull data, identify candidates, generate improvements, review, push, log, report

## Notes

### Meta Tag Impact Timeline
- Google typically re-crawls and re-indexes pages within 3-14 days of a meta change
- CTR impact becomes measurable after 2-4 weeks (need enough impressions for statistical significance)
- The 30-day cooling period before re-optimisation ensures we have reliable performance data

### Character Limits
- **Title:** 60 characters maximum. Google may truncate at 50-60 characters depending on pixel width
- **Description:** 155 characters maximum. Google may truncate at 150-160 characters depending on pixel width
- **Always aim for the lower end** of the range to ensure full display across devices

### UK English
- All meta content must use British English spelling
- Common differences: colour/center -> colour/centre, organize -> organise, program -> programme
- This is consistent with the Carisma brand voice across all channels

### KPIs to Track
- **CTR improvement:** Average CTR change 30 days post-optimisation (target: +15%)
- **Pages optimised per month:** 5-10 per brand
- **Revert rate:** <5% of optimised pages needing revert
- **Quality review pass rate:** 80%+ on first attempt
- **Changelog completeness:** 100% of changes logged

---

## Known Issues and Learnings

> Updated when this workflow encounters failures, edge cases, or better methods.
> Always check this section before executing the workflow.
> Log full context in `learnings/LEARNINGS.md` under Workflow Learnings.

<!--
Entry format:
### [YYYY-MM-DD] -- [Issue Title]
**What happened:** Brief description
**Root cause:** Why it happened
**Fix:** What was changed
**Rule:** ALWAYS/NEVER directive (also added to root CLAUDE.md if universal)
-->

_No issues logged yet._
