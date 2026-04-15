# 12 - GBP Posting

## Objective

Generate and publish Google Business Profile (GBP) posts for all Carisma brands on a consistent schedule. Posts are optimised for local SEO with target keywords, brand voice alignment, and seasonal relevance. Content is generated deterministically via templates, quality-checked by a 3-layer AI review (SEO optimisation, human tone, brand voice), then auto-published via Playwright browser automation. All posts are logged to Google Sheets for tracking and performance analysis.

## Required Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `config/brands.json` | Manual config | Brand names, codes, website URLs, brand voice rules |
| `config/offers.json` | Manual config | Active offers with pricing, CTAs, seasonal angles |
| `marketing/google-gmb/keywords_{brand_id}.json` or `.md` | Manual / SEO research | Keyword banks per brand (primary, secondary, long-tail, local, seasonal) |
| `marketing/google-gmb/locations.json` | Manual config | GBP location data per brand (optional — falls back to Malta) |
| `marketing/google-gmb/content-calendar.json` | Manual config | Content calendar overrides (optional — falls back to auto scheduling) |
| `marketing/google-gmb/templates_{brand_id}.json` | Manual config | Custom post templates per brand (optional — falls back to built-in defaults) |
| `.tmp/gbp/logs/post_log_{brand_id}.json` | Auto-generated | Recent post log for rotation tracking (auto-created by the tool) |
| `.tmp/gbp/drafts/posts_{brand}_{date}.json` | Workflow 12 Step 2 output | Generated draft posts pending review |

## Tools Used

| Tool | Purpose |
|------|---------|
| `marketing/google-gmb/tools/gbp_generate_posts.py` | Generate deterministic GBP post content from templates, keywords, and brand config |
| `marketing/google-gmb/tools/check_pending_gbp_drafts.py` | Check for pending auto-generated drafts at session start |
| `tools/update_google_sheet.py` | Log published posts to Google Sheets |
| Playwright MCP | Browser automation to publish posts to GBP dashboard |
| Gmail MCP (`mcp__google-workspace__gmail_send_email`) | Send posting summary email after each session |

## Step-by-Step Procedure

### Step 1: Load Context

1. Read `config/brands.json` to identify active brands
2. Read `config/offers.json` for current offers and seasonal angles
3. Check `marketing/google-gmb/` for keyword banks, location data, and content calendar
4. Read `.tmp/gbp/logs/post_log_{brand_id}.json` for each brand to understand recent post history

**If keyword banks don't exist yet:**
- The tool will generate fallback keywords from brand interests in `brands.json`
- Flag this to the human: "No keyword bank found for {brand}. Using fallback keywords from brand config. Consider creating `marketing/google-gmb/keywords_{brand_id}.json` for better SEO targeting."

### Step 2: Generate / Plan Posts

**Automated path (cron):**

Run `marketing/google-gmb/tools/gbp_generate_posts.py`:

```
python marketing/google-gmb/tools/gbp_generate_posts.py \
    --brand_id all \
    --num_posts 2 \
    --output_dir .tmp/gbp/drafts
```

This generates draft JSON files at `.tmp/gbp/drafts/posts_{brand}_{date}.json` with fully formed post content, CTA links, keywords, and validation results.

**Manual path (agent-driven):**

When the user asks for GBP posts directly:
1. Run the generator tool as above
2. Read the output JSON
3. Present each post to the user for review
4. Optionally refine posts using agent reasoning (e.g. better hooks, adjusted tone)
5. Save refined versions back to the draft files

**Content calendar path:**

If `marketing/google-gmb/content-calendar.json` exists and has entries for today's date:
1. Load the calendar entry
2. Use the specified post_type, offer, and theme
3. Pass as overrides to the generator tool

### Step 3: Validate Posts

For each generated post, verify:

| Check | Criteria | Fail Action |
|-------|----------|-------------|
| Character count | 100-1500 characters | Truncate or flag for rewrite |
| Keyword presence | At least 1 target keyword in post text | Warn — suggest adding keyword naturally |
| CTA link valid | URL is not empty and matches brand website | Halt — fix before publishing |
| Brand voice alignment | Tone matches brand_voice config | Agent reviews — flag if off-brand |
| No duplicate content | Post text differs from last 5 posts | Regenerate with different template/hook |
| Hashtag count | 3-5 hashtags | Adjust if outside range |

The tool runs validation automatically and includes results in the output JSON under the `validation` key.

### Step 4: AI Quality Review (Auto)

Each post passes through a 3-layer AI quality review. No human approval required — the AI review layer ensures quality before auto-publishing.

**Layer 1 — SEO Optimisation:**
- Primary keyword appears in first 100 characters (preview zone)
- Secondary keywords present naturally in body text
- Location signal present (Malta, specific area, or landmark)
- Keyword density between 1-3% (natural, not stuffed)
- 3-5 relevant hashtags
- CTA link matches the service mentioned
- Post length in optimal range (400-700 chars preferred)

**Layer 2 — Human Tone:**
- No AI writing patterns (remove "Whether you're...", "Unlock", "Elevate", etc.)
- Conversational flow with varied sentence length
- Contractions used where natural
- At least one specific detail (named treatment, exact price, real location)
- Maltese language touches are authentic and not forced
- Post sounds like a real person wrote it, not a bot

**Layer 3 — Brand Voice:**
- Correct persona and sign-off (Sarah/Sarah/Katya)
- Tone matches brand (warm-sensory / clinical-warm / compassionate-evidence-led)
- Compliance: no medical claims, "from" pricing, no shame language, no before/after
- Clinical treatments include "subject to doctor approval"

**Auto-fix protocol:**
- If any check fails: rewrite the failing sections, re-run all 3 layers
- Maximum 3 revision rounds per post
- If still failing: generate a completely new post with a different template
- If replacement also fails: skip the post, log the issue, continue with remaining posts

Posts that pass all 3 layers proceed directly to Step 5 (auto-publish).

### Step 5: Check Browser Authentication

Before attempting to publish:

1. Navigate to `https://business.google.com/` using Playwright
2. Check if the user is logged in (look for account avatar or profile element)
3. If not logged in:
   - Alert the human: "GBP requires authentication. Please log in manually."
   - Pause and wait for the human to complete login
   - Verify login succeeded before proceeding
4. Navigate to the correct business profile for the brand

**GBP authentication cannot be automated — it requires human login. This is by design (Google enforces it).**

### Step 6: Post via Playwright

For each approved post, publish using browser automation:

1. **Navigate** to the GBP dashboard for the correct business location
2. **Click** "Add update" (or the appropriate post creation button)
3. **Select** post type (Update / Offer / Event)
4. **Enter** the post text into the content field
5. **Add CTA button** if supported (select button type, enter URL)
6. **Preview** the post to verify formatting
7. **Take screenshot** of the preview for the audit trail
8. **Publish** the post

**For Offer posts specifically:**
- Enter the offer title
- Enter the start and end dates (if applicable)
- Enter the offer details/terms
- Add the CTA link

**For Event posts specifically:**
- Enter the event title
- Enter the event date and time
- Enter the event details
- Add the CTA link

**Wait 3-5 seconds between actions** to ensure GBP UI has loaded fully. GBP is a relatively slow web application.

**If any step fails:**
1. Take a screenshot of the current state
2. Log the error
3. Move to the next post
4. Report the failure in the summary

### Step 7: Log to Sheets + Summary

**Log each published post to Google Sheets:**

Run `tools/update_google_sheet.py`:

```
--spreadsheet_id "<google_sheet_id>"
--tab "GBP Post Log"
--data ".tmp/gbp/published/published_{brand}_{date}.json"
```

| Column | Value |
|--------|-------|
| Date | Publication date |
| Brand | Brand name |
| Post ID | Unique post identifier |
| Post Type | update / offer / event |
| Post Text | Full post content |
| CTA Button | Button type |
| CTA Link | Destination URL |
| Target Keywords | Comma-separated keywords |
| Keywords in Text | Count of keywords present |
| Character Count | Post length |
| Season | Current season/event |
| Template | Template name used |
| Status | Published / Failed |
| Screenshot | Link to preview screenshot |
| Notes | Any issues or flags |

**Generate a summary for the human:**

```markdown
# GBP Posting Summary
## Date: {date}

### Posts Published: {count}

| Brand | Post ID | Type | Keywords | Status |
|-------|---------|------|----------|--------|
| Carisma Spa | CS_GBP_20260302_001 | update | spa malta, wellness | Published |
| Carisma Spa | CS_GBP_20260302_002 | offer | spa day package | Published |
| Carisma Aesthetics | CA_GBP_20260302_001 | update | botox malta | Published |
| ... | ... | ... | ... | ... |

### Failed: {count}
{failure_details}

### Next Scheduled: {next_date}

### Recommendations
- [Any keyword gaps or content suggestions]
- [Seasonal opportunities coming up]
```

**Clean up:** Move published draft files from `.tmp/gbp/drafts/` to `.tmp/gbp/published/` to prevent re-publishing.

### Step 8: Email Notification

Send a summary email via Gmail MCP after every posting session.

**Tool:** `mcp__google-workspace__gmail_send_email`
**Recipient:** `mertgulen98@gmail.com`
**Subject:** `GBP Posts Published — {date} — {total_posts} posts across {brand_count} brands`

**Body includes:**
- Total posts published and failure count
- Per-brand breakdown: post count, locations, status, first 50 chars of each post, keywords, CTA
- Failure details (if any)
- Next recommended posting date and keywords

**Always send** — even if some posts failed. If Gmail MCP fails, log the error but do not retry posts (they were already published).

## Expected Outputs

| Output | Path | Description |
|--------|------|-------------|
| Draft posts | `.tmp/gbp/drafts/posts_{brand}_{date}.json` | Generated post content pending review |
| Published posts | `.tmp/gbp/published/published_{brand}_{date}.json` | Record of published posts |
| Post log | `.tmp/gbp/logs/post_log_{brand_id}.json` | Rolling log for rotation tracking |
| Screenshots | `.tmp/gbp/screenshots/` | Preview screenshots of published posts |
| Google Sheet | "GBP Post Log" tab | Full audit trail of all published posts |
| Summary | Console output | Human-readable publishing report |
| Email notification | Gmail (mertgulen98@gmail.com) | Summary report sent after every posting session |

## Edge Cases and Error Handling

### Authentication Expired
- **Symptom:** Playwright lands on a Google login page instead of GBP dashboard
- **Action:** Alert the human. Pause workflow. Wait for manual re-authentication.
- **Prevention:** Check auth status at Step 5 before attempting any posts.

### GBP UI Changes
- **Symptom:** Playwright cannot find expected buttons or fields (selector fails)
- **Action:** Take a screenshot of the current state. Log the error with the selector that failed. Report to human for investigation.
- **Prevention:** Use resilient selectors (data attributes, aria labels, text content) rather than fragile CSS class selectors.
- **Recovery:** The human may need to update Playwright selectors in the workflow notes.

### Rate Limiting / Posting Limits
- **Symptom:** GBP shows an error when attempting to create a post (e.g. "You've reached the posting limit")
- **Action:** Log the error. Stop posting for this brand. Report remaining unposted drafts.
- **Note:** GBP typically allows up to 10 posts per day per location. Our cadence (2 posts per brand, 2x/week) is well within limits.

### Partial Failure
- **Symptom:** Some posts publish successfully, others fail
- **Action:** Log which posts succeeded and which failed. Do NOT retry failed posts automatically — flag for human review.
- **Recovery:** Failed drafts remain in `.tmp/gbp/drafts/` for the next session.

### Missing Keyword Banks
- **Symptom:** No keyword bank file exists for a brand
- **Action:** Tool generates fallback keywords from brand interests. Flag to human that proper SEO keyword research should be done.
- **Impact:** Posts will still be generated but may be less SEO-optimised.

### Duplicate Post Detection
- **Symptom:** Generated post text matches a recent post
- **Action:** The generator's rotation system should prevent this. If it still happens, regenerate with a forced template/hook change.

### Screenshot Failure
- **Symptom:** Playwright cannot take a screenshot (browser error)
- **Action:** Log the error but continue with publishing. The screenshot is for audit purposes only — its absence should not block publishing.

## AI QUALITY GATE

**This workflow uses an automated 3-layer AI quality review at Step 4.**

- All generated posts pass through SEO optimisation, human tone, and brand voice checks
- Posts that pass all 3 layers are auto-published without human intervention
- The AI auto-fixes issues (up to 3 revision rounds) before escalating
- Posts that cannot pass review after retries are skipped and logged
- The system operates fully autonomously — generate, review, publish, log

## Notes

### GBP Post Lifespan
- **Update posts** remain visible indefinitely on the GBP profile
- **Offer posts** expire after the specified end date
- **Event posts** expire after the event date
- Posts appear in Google Maps and Search results, making them valuable for local SEO
- Consistent posting frequency (2-4x/week) signals activity to Google's algorithm

### Posting Cadence
- **Target:** 2 posts per brand, twice per week (Monday and Thursday)
- **Total:** ~4 posts per brand per week, ~16 posts per week across all brands
- **Cron schedule:** Content generated automatically Mon/Thu at 8am. On next session start, AI reviews and auto-publishes via Playwright.

### Content Mix (Auto Mode)
- ~50% Update posts (service highlights, expertise, why choose us)
- ~35% Offer posts (current promotions, packages, pricing)
- ~15% Event posts (seasonal events, special occasions)

### Keyword Strategy
- Each post targets 3 keywords from the brand's keyword bank
- Keywords are rotated to avoid repetition (last 5 posts tracked)
- Priority: primary > seasonal > local > secondary > long-tail
- Hashtags are appended for discoverability: #{keyword} #Malta

### KPIs to Track
- **Post frequency:** Target 4 posts/brand/week
- **Keyword coverage:** % of keyword bank used over 30 days
- **GBP views:** Profile views attributed to posts (pull from GBP Insights)
- **Click-through rate:** CTA clicks from GBP posts
- **Direction requests:** Map direction requests (proxy for foot traffic intent)

### Competitor Cadence
- Monitor competitor GBP posting frequency during competitor research (Workflow 01)
- Match or exceed competitor posting cadence
- Note competitor post types and themes for content inspiration

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
