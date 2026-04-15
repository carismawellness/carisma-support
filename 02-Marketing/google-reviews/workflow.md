# 13 - Google Review Response

## Objective

Monitor and respond to Google reviews for all Carisma brands on a daily basis. Responses are personalised to each review, aligned with brand voice, and validated through a 2-layer AI quality review (tone + brand voice). Positive reviews (5-star, 4-star) and mixed reviews (3-star) are auto-posted after passing quality review. Negative reviews (1-2 star) require human approval before posting. All responses are logged to Google Sheets and an email summary is sent after each session.

## Required Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `config/brands.json` | Manual config | Brand names, codes, website URLs, brand voice rules |
| `marketing/google-gmb/locations.json` | Manual config | GBP profile URLs and location data per brand |
| `marketing/google-reviews/review-response-rules.json` | Manual config | Response rules per rating tier, forbidden phrases, brand contacts |
| `marketing/google-reviews/response-templates.md` | Manual config | Per-brand response templates for each rating tier |
| `.tmp/reviews/logs/response_log_{brand_id}.json` | Auto-generated | Response log for tracking responded reviews (auto-created by the tool) |
| `.tmp/reviews/fetched/review_fetch_plan_{brand}_{date}.json` | Workflow 13 Step 2 output | Fetched review data pending response |

## Tools Used

| Tool | Purpose |
|------|---------|
| `marketing/google-reviews/tools/fetch_google_reviews.py` | Generate review fetch plans with Playwright MCP instructions |
| Playwright MCP | Browser automation to fetch reviews from Google Maps and post responses to GBP |
| `tools/update_google_sheet.py` | Log posted responses to Google Sheets |
| Gmail MCP (`mcp__google-workspace__gmail_send_email`) | Send response summary email after each session |

## Step-by-Step Procedure

### Step 1: Load Context

1. Read `config/brands.json` to identify active brands
2. Read `marketing/google-gmb/locations.json` for GBP profile URLs and location data
3. Read `marketing/google-reviews/review-response-rules.json` for response rules, forbidden phrases, and contacts
4. Read `marketing/google-reviews/response-templates.md` for per-brand response templates
5. Read `.tmp/reviews/logs/response_log_{brand_id}.json` for each brand to know which reviews have been responded to

**If response rules don't exist yet:**
- STOP. Flag to the human: "Response rules file not found at `marketing/google-reviews/review-response-rules.json`. This is required for the review response workflow."

### Step 2: Fetch Reviews via Playwright

**Automated path (cron):**

Run `marketing/google-reviews/tools/fetch_google_reviews.py`:

```
python marketing/google-reviews/tools/fetch_google_reviews.py \
    --brand_id all \
    --days_back 30 \
    --output_dir .tmp/reviews/fetched
```

This generates fetch plan JSON files with Playwright MCP instructions for navigating to Google Maps, locating reviews, and taking snapshots.

**Manual path (agent-driven):**

When the user triggers the skill directly:
1. Run the fetch tool to generate the plan
2. Execute the Playwright instructions from the plan:
   a. Navigate to Google Maps for each brand location
   b. Open the Reviews section
   c. Sort by Newest
   d. Take snapshots of reviews
   e. Scroll and snapshot to capture all recent reviews
3. Parse review data from the snapshots: reviewer name, rating, date, text, has response

### Step 3: Filter & Categorise Reviews

For each brand, process the fetched reviews:

| Filter | Criteria | Action |
|--------|----------|--------|
| Already responded | has_owner_response == true OR review_id in response log | Remove from queue |
| Outside date range | review_date older than days_back threshold | Remove from queue |
| Abusive content | Matches abusive_review_policy indicators | Flag and skip -- do not respond |
| Valid review | Passes all filters | Categorise by rating tier |

**Rating tier categorisation:**
- 5-star: rating == 5
- 4-star: rating == 4
- 3-star: rating == 3
- 1-2 star: rating <= 2

Output a summary: total unresponded reviews, count per tier, count of flagged abusive reviews.

### Step 4: Generate Responses

For each unresponded, non-abusive review:

1. Look up the response rules for the review's rating tier
2. Extract specific details from the review text (service mentioned, staff named, experience described)
3. Select a template from `response-templates.md` for the brand and rating tier (alternate templates to avoid repetition)
4. Personalise the response: replace `{reviewer_name}` and `{specific_detail}` with actual values
5. Apply brand voice: correct persona, sign-off, tone
6. Validate against forbidden phrases
7. Check response length against max_length for the tier
8. Add contact details (email + phone) for 3-star and below reviews

### Step 5: AI Quality Review (2-Layer)

Each generated response passes through a 2-layer AI quality review.

**Layer 1 -- Tone Check:**
- Response sounds empathetic, genuine, and human-written
- Not template-feeling -- each response reads as individually crafted
- Varied sentence structure, not robotic or formulaic
- Uses contractions where natural (we're, it's, you'll)
- Appropriate length for the rating tier
- No AI writing patterns (elevate, unlock, transform, in today's)

**Layer 2 -- Brand Voice Check:**
- Correct persona name in sign-off (Sarah Caballeri / Sarah / Katya)
- Correct sign-off format (Warm regards / Warmly)
- Contact details included and correct where required (3-star and below)
- UK English spelling throughout (colour, centre, specialise, programme)
- No forbidden phrases present
- Specific detail from the review is referenced
- No defensive or dismissive language

**Auto-fix protocol:**
- If any check fails: rewrite the failing sections, re-run both layers
- Maximum 3 revision rounds per response
- If still failing: skip the response, log the issue, continue with remaining responses

Responses that pass both layers proceed to Step 6 (auto-post for 3-5 star, human approval for 1-2 star).

### Step 6: Check Browser Authentication

Before attempting to post responses:

1. Navigate to `https://business.google.com/` using Playwright
2. Check if the user is logged in (look for account avatar or profile element)
3. If not logged in:
   - Alert the human: "GBP requires authentication. Please log in manually."
   - Pause and wait for the human to complete login
   - Verify login succeeded before proceeding
4. Navigate to the correct business profile reviews section

**GBP authentication cannot be automated -- it requires human login. This is by design (Google enforces it).**

### Step 7: Post Responses via Playwright

**For 1-2 star reviews:** Present the review and proposed response to the human for approval before posting. Wait for approval, edit, skip, or flag decision.

**For 3-5 star reviews:** Auto-post after passing AI quality review.

For each approved response:

1. **Navigate** to the brand's GBP reviews section
2. **Find** the target review by reviewer name and date
3. **Click** the "Reply" button on the review
4. **Enter** the response text into the reply field
5. **Submit** the response
6. **Verify** the response appears under the review
7. **Take screenshot** as proof of posting
8. **Wait** 5 seconds before processing the next response (rate limiting)

**If any step fails:**
1. Take a screenshot of the current state
2. Log the error
3. Move to the next response
4. Report the failure in the summary

### Step 8: Log to Sheets + Email Notification

**Log each posted response to Google Sheets:**

Run `tools/update_google_sheet.py`:

```
--spreadsheet_id "<google_sheet_id>"
--tab "Review Response Log"
--data ".tmp/reviews/logs/posted_{brand}_{date}.json"
```

| Column | Value |
|--------|-------|
| Date | Response date |
| Brand | Brand name |
| Location | Location name |
| Reviewer Name | Reviewer's display name |
| Rating | Star rating (1-5) |
| Review Text | First 100 characters of review |
| Response Text | First 100 characters of response |
| Persona | Responding persona name |
| Status | Posted / Failed / Skipped / Flagged |
| Timestamp | ISO timestamp |
| Notes | Any issues or flags |

**Send email notification:**

**Tool:** `mcp__google-workspace__gmail_send_email`
**Recipient:** `mertgulen98@gmail.com`
**Subject:** `Google Reviews — {date} — {total_responses} responses across {brand_count} brands`

**Body includes:**
- Total reviews found and unresponded count
- Responses posted, flagged for human, and failure counts
- Per-brand breakdown: review count, rating distribution, responses posted
- Flagged reviews requiring human attention (with review text preview)
- Failure details (if any)

**Always send** -- even if some responses failed. If Gmail MCP fails, log the error but do not retry responses (they were already posted).

## Expected Outputs

| Output | Path | Description |
|--------|------|-------------|
| Fetch plans | `.tmp/reviews/fetched/review_fetch_plan_{brand}_{date}.json` | Generated fetch plans with Playwright instructions |
| Response log | `.tmp/reviews/logs/response_log_{brand_id}.json` | Rolling log of responded reviews |
| Posted responses | `.tmp/reviews/logs/posted_{brand}_{date}.json` | Record of responses posted in this session |
| Screenshots | `.tmp/reviews/screenshots/` | Screenshots of posted responses |
| Google Sheet | "Review Response Log" tab | Full audit trail of all posted responses |
| Summary | Console output | Human-readable response report |
| Email notification | Gmail (mertgulen98@gmail.com) | Summary report sent after every session |

## Edge Cases and Error Handling

### Authentication Expired
- **Symptom:** Playwright lands on a Google login page instead of GBP dashboard
- **Action:** Alert the human. Pause workflow. Wait for manual re-authentication.
- **Prevention:** Check auth status at Step 6 before attempting any responses.

### Review Already Responded To
- **Symptom:** The "Reply" button is not available or an owner response already exists
- **Action:** Skip the review. Log: "Review already responded to (possibly by another team member)."
- **Prevention:** The filter in Step 3 catches most cases, but this handles edge cases where a response was posted between fetch and post.

### Abusive Review
- **Symptom:** Review content matches abusive policy indicators
- **Action:** Flag and skip. Do NOT respond publicly. Include in the email summary for human attention. The human may choose to report the review to Google for removal.

### GBP UI Changes
- **Symptom:** Playwright cannot find expected buttons or fields (selector fails)
- **Action:** Take a screenshot of the current state. Log the error with the selector that failed. Report to human for investigation.
- **Prevention:** Use resilient selectors (data attributes, aria labels, text content) rather than fragile CSS class selectors.
- **Recovery:** The human may need to update Playwright selectors in the workflow notes.

### Empty Reviews (No New Reviews Found)
- **Symptom:** All reviews within the date range already have responses
- **Action:** Log: "No new unresponded reviews found for {brand}." Send a brief email: "No new reviews to respond to." This is a normal outcome.

### Rate Limiting
- **Symptom:** Google shows an error or blocks reply submission
- **Action:** Increase wait time to 15 seconds. If still blocked, stop posting and report remaining responses. Our daily cadence should be within limits.

## AI QUALITY GATE

**This workflow uses an automated 2-layer AI quality review at Step 5.**

- All generated responses pass through tone and brand voice checks
- Responses that pass both layers are auto-posted (3-5 star) or presented for human approval (1-2 star)
- The AI auto-fixes issues (up to 3 revision rounds) before escalating
- Responses that cannot pass review after retries are skipped and logged
- 1-2 star reviews always require human approval regardless of AI review result

## Notes

### Response Cadence
- **Target:** Daily review monitoring and response
- **Schedule:** Automated fetch at 8am daily. Agent processes and responds during the session.
- **Goal:** Respond to all non-abusive reviews within 24 hours

### Response Philosophy
- Every response is unique and personalised to the specific review
- Templates are starting points, not rigid formats
- The goal is to make every reviewer feel heard and valued
- Negative reviews are opportunities to demonstrate excellent service recovery
- Never argue, deflect, or get defensive -- own the experience

### Brand Personas
- **Carisma Spa:** Sarah Caballeri -- warm, sensory, personal
- **Carisma Aesthetics:** Sarah -- professional, caring, confident
- **Carisma Slimming:** Katya -- compassionate, understanding, supportive

### KPIs to Track
- **Response rate:** 100% of non-abusive reviews responded to
- **Response time:** < 24 hours from review posting
- **AI quality first-pass rate:** 85%+ (no revisions needed)
- **Human approval rate (1-2 star):** Track approval vs edit vs skip ratio
- **Review sentiment trend:** Monitor rating distribution over time

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
