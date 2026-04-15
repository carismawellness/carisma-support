# /review-response Skill -- Monitor and Respond to Google Reviews

**Slash Command:** `/review-response`

**What This Does:**
When triggered, this skill:
1. Loads brand context, locations, response rules, and the response log
2. Fetches recent Google reviews via Playwright browser automation
3. Filters for unresponded reviews and categorises by rating tier
4. Generates personalised, brand-voice-aligned responses
5. Runs AI quality review (tone + brand voice) with auto-fix protocol
6. Posts responses via Playwright browser automation to GBP
7. Logs all responses to Google Sheets and sends email notification

**When to Use:**
User wants to check, respond to, or manage Google reviews for any Carisma brand.

---

## Usage

### Step 1: Specify Brand and Parameters

```
/review-response

Brand: all (or carisma_spa / carisma_aesthetics / carisma_slimming)
Days back: 30
Dry run: false
```

### Step 2: System Executes Phases 1-7 Automatically

The system loads context, fetches reviews via Playwright, categorises them, generates responses, runs AI quality review (tone + brand voice), and posts via Playwright. 1-2 star reviews are flagged for human approval before posting. All other ratings are auto-posted after passing AI quality review.

---

## System Process (Behind the Scenes)

### Phase 1: Load Context

```
CONTEXT LOADING SEQUENCE

1. Read marketing/google-gmb/locations.json
   → Extract GBP profile URLs per brand
   → Map brand → location(s)
   → Spa: 5 hotel locations
   → Aesthetics: 1 location
   → Slimming: 1 location

2. Read config/brands.json
   → Extract brand voice rules (tone, persona, signature)
   → Extract forbidden phrases per brand
   → Note required elements per brand

3. Read marketing/google-reviews/review-response-rules.json
   → Load response rules per rating tier (5-star, 4-star, 3-star, 1-2 star)
   → Load brand contacts (email, phone)
   → Load forbidden phrases list
   → Load abusive review policy and indicators
   → Load quality review layer definitions

4. Read marketing/google-reviews/response-templates.md
   → Load per-brand response templates for each rating tier
   → Note: templates are starting points, not rigid formats
   → Each response should be personalised to the specific review

5. Read .tmp/reviews/logs/response_log_{brand_id}.json
   → Load previously responded review IDs
   → Avoid duplicate responses
   → Note any flagged reviews from previous runs
```

**If any context file is missing:**
- Log the missing file
- Continue with available context
- Note limitations in the output
- Suggest creating the missing file

---

### Phase 2: Fetch Reviews via Playwright

#### Prerequisites Check

```
PLAYWRIGHT PREREQUISITES

1. Is the Playwright browser running?
   → IF no: STOP. Tell human: "Playwright browser is not running.
     Please start the browser session."

2. Can we access Google Maps?
   → Navigate to google.com/maps
   → Check if the page loads correctly
   → IF blocked or error: STOP. Tell human: "Cannot access Google
     Maps. Please check internet connection and browser state."
```

#### Fetch Sequence (Per Location)

```
REVIEW FETCH SEQUENCE

For each brand location:

Step 1: Navigate to Google Maps
  → Search for the business name + "Malta" on Google Maps
  → OR use the direct Google Maps URL if available in locations.json
  → Take snapshot to confirm correct business listing

Step 2: Open Reviews Section
  → Click the "Reviews" tab or review count link
  → Wait for reviews to load
  → Take snapshot to confirm reviews are visible

Step 3: Sort by Newest
  → Click the sort dropdown
  → Select "Newest" to see most recent reviews first
  → Take snapshot after sorting

Step 4: Parse Reviews
  → From the snapshot, extract for each visible review:
    - reviewer_name: The name displayed
    - rating: Star count (1-5)
    - review_date: When the review was posted
    - review_text: The full review content
    - has_owner_response: true/false
    - owner_response_text: The existing response (if any)
  → Store all parsed reviews in a structured list

Step 5: Scroll for More Reviews
  → Scroll down to load additional reviews
  → Take another snapshot
  → Parse any newly loaded reviews
  → Repeat until all reviews within the date range are captured
  → OR until no new reviews load after scrolling

Step 6: Move to Next Location
  → Log the total reviews found for this location
  → Proceed to the next location
```

**Output:** A complete list of parsed reviews per brand, per location, with all review metadata.

---

### Phase 3: Filter & Categorise

```
FILTER AND CATEGORISE SEQUENCE

1. Remove Already-Responded Reviews
   → Compare each parsed review against the response log
   → Remove any review that already has has_owner_response: true
   → Remove any review whose ID appears in the response log
   → Log: "Filtered out X already-responded reviews"

2. Remove Reviews Outside Date Range
   → Compare each review's date against the days_back threshold
   → Remove reviews older than the threshold
   → Log: "Filtered out X reviews older than {days_back} days"

3. Check for Abusive Reviews
   → Compare each review against abusive_review_policy indicators:
     - Profanity or vulgar language directed at staff
     - Racial, ethnic, or discriminatory slurs
     - Threats of violence or harm
     - Clearly fabricated or spam content
     - Personal attacks naming staff with abusive language
     - Reviews obviously for the wrong business
     - Repeated identical reviews from the same user
   → IF abusive indicators found:
     → Flag the review: status = "flagged_abusive"
     → Do NOT generate a response
     → Log: "Flagged review from {reviewer_name} as potentially abusive"
     → Include in summary report for human attention

4. Categorise by Rating Tier
   → Group remaining reviews into:
     - 5_star: rating == 5
     - 4_star: rating == 4
     - 3_star: rating == 3
     - 1_2_star: rating <= 2
   → Log category counts

5. Output: Categorised Review Summary
   → Total unresponded reviews: X
   → 5-star: X
   → 4-star: X
   → 3-star: X
   → 1-2 star: X
   → Flagged abusive: X
```

---

### Phase 4: Generate Responses

For each unresponded, non-abusive review, generate a personalised response.

#### Generation Rules

```
RESPONSE GENERATION CHECKLIST

For each review:

1. IDENTIFY THE RATING TIER
   → Look up the response rules for that tier in review-response-rules.json
   → Note: approach, tone, max_length, include_contact, flag_for_human

2. EXTRACT SPECIFIC DETAILS FROM THE REVIEW
   → What specific service, treatment, or experience did they mention?
   → Did they name a staff member?
   → Did they mention a specific location or facility?
   → What emotion or sentiment is expressed?
   → Use these details to personalise the {specific_detail} placeholder

3. SELECT A TEMPLATE (starting point only)
   → Choose a template from response-templates.md for the brand + rating tier
   → Alternate between Template 1 and Template 2 to avoid repetition
   → The template is a GUIDE, not a rigid format — personalise heavily

4. PERSONALISE THE RESPONSE
   → Replace {reviewer_name} with the actual reviewer's name
   → Replace {specific_detail} with something unique from their review
   → Adjust language to feel natural and genuine, not templated
   → Ensure the response addresses the specific points raised
   → For 3-star and below: address the concern directly but briefly

5. APPLY BRAND VOICE
   → SPA responses: warm, sensory, personal (Sarah Caballeri)
     - Sign-off: "Warm regards, Sarah Caballeri"
     - Contact: info@carismaspa.com / +356 2138 3838
   → AESTHETICS responses: professional, caring, confident (Sarah)
     - Sign-off: "Warm regards, Sarah"
     - Contact: info@carismaaesthetics.com / +356 2138 3838
   → SLIMMING responses: compassionate, understanding, supportive (Katya)
     - Sign-off: "Warmly, Katya"
     - Contact: info@carismaslimming.com / +356 2780 2062

6. VALIDATE AGAINST FORBIDDEN PHRASES
   → Check response does NOT contain any of:
     - "We're sorry you feel that way"
     - "As per our policy"
     - "Unfortunately we cannot"
     - "You should have"
     - "That's not what happened"
     - "We disagree"
     - "We offer compensation"
     - "We'll give you a discount"
   → IF found: rewrite the offending section

7. CHECK LENGTH
   → Verify response does not exceed max_length for the rating tier
   → IF over: tighten language, remove qualifiers, keep the core message

8. ADD CONTACT DETAILS (if required)
   → For 3-star and below: include email and phone at the end
   → Format: "Please reach out to us at {email} or call {phone}"
   → Verify contact details match the brand
```

---

### Phase 5: AI Quality Review (2 Layers)

Every generated response goes through a 2-layer AI review. Responses that pass both layers are approved for posting (except 1-2 star which require human approval).

#### Review Layer 1: Tone Check

```
TONE REVIEW CHECKLIST

For each response, verify:

□ EMPATHETIC — Response shows genuine understanding of the reviewer's experience
  → IF cold or robotic: rewrite with warmer, more personal language

□ GENUINE — Response feels authentic, not corporate or scripted
  → IF template-feeling: add more specific details from the review
  → IF generic: reference something unique the reviewer mentioned

□ NOT TEMPLATE-FEELING — Each response reads as individually crafted
  → IF two consecutive responses are too similar: rewrite one with different phrasing
  → Vary opening lines, sentence structures, and closing remarks

□ VARIED — Response structure differs from recent responses
  → IF same pattern as last 3 responses: restructure the flow
  → Mix up how you open (thank first vs acknowledge first vs name first)

□ APPROPRIATE LENGTH — Response fits the rating tier guidelines
  → 5-star: concise and grateful (~150 words max)
  → 4-star: warm with light curiosity (~180 words max)
  → 3-star: thorough but not over-explaining (~250 words max)
  → 1-2 star: brief, sincere, action-oriented (~250 words max)

□ USES CONTRACTIONS — Sounds natural, not formal
  → "We're" not "We are"
  → "It's" not "It is"
  → "You'll" not "You will"
  → "We'd" not "We would"
```

#### Review Layer 2: Brand Voice Check

```
BRAND VOICE REVIEW CHECKLIST

For each response, verify:

□ CORRECT PERSONA — Response is signed by the right person
  → Spa: Sarah Caballeri
  → Aesthetics: Sarah
  → Slimming: Katya
  → IF wrong persona: fix the sign-off immediately

□ CORRECT SIGN-OFF — Format matches the brand exactly
  → Spa: "Warm regards, Sarah Caballeri" (with surname)
  → Aesthetics: "Warm regards, Sarah" (no surname)
  → Slimming: "Warmly, Katya" (different greeting)
  → IF wrong format: fix immediately

□ CONTACT DETAILS (for 3-star and below)
  → Email is correct for the brand
  → Phone is correct for the brand
  → Both are present when required
  → Format is consistent

□ UK ENGLISH — British spelling throughout
  → "colour" not "color"
  → "centre" not "center"
  → "specialise" not "specialize"
  → "programme" not "program"
  → "apologise" not "apologize"
  → "organise" not "organize"
  → "favour" not "favor"
  → "behaviour" not "behavior"
  → IF American spelling found: fix all instances

□ NO FORBIDDEN PHRASES — None of the 8 forbidden phrases present
  → Run exact string match against each forbidden phrase
  → Also check for close variants (e.g. "sorry you feel" even without "we're")
  → IF found: rewrite the section completely

□ SPECIFIC DETAIL REFERENCED — Response mentions something from the review
  → Not just generic "your feedback" or "your experience"
  → Must reference a specific treatment, service, staff member, or detail
  → IF too generic: add a specific reference from the review text

□ NO DEFENSIVE LANGUAGE — Response does not argue, justify, or deflect
  → No "but" after an apology
  → No explaining away the issue
  → No blaming the customer, even subtly
  → No "we normally" or "this isn't typical" (these are deflections)
  → IF defensive: rewrite to fully own the experience
```

#### Auto-Fix Protocol

```
WHEN A RESPONSE FAILS ANY REVIEW LAYER:

1. Identify which checks failed
2. Rewrite ONLY the failing sections (preserve what passed)
3. Re-run BOTH review layers on the revised response
4. Maximum 3 revision rounds per response
5. IF still failing after 3 rounds:
   → Log the issue
   → Skip this response
   → Log: "Response skipped after 3 failed review rounds — manual response needed"
   → Continue with remaining responses
```

#### Review Output Format

After review, log the result internally (not shown to user):

```
RESPONSE REVIEW RESULT
  Review ID: {reviewer_name}_{date}_{brand}
  Brand: Carisma Spa
  Rating: 5 stars
  Tone Score: PASS (empathetic, genuine, varied, natural contractions)
  Voice Score: PASS (correct persona, sign-off, UK English, no forbidden phrases)
  Revisions: 0
  Status: APPROVED FOR AUTO-POST
```

---

### Phase 6: Post Responses via Playwright

#### Prerequisites Check

```
PLAYWRIGHT PREREQUISITES

1. Is the Playwright browser running?
   → IF no: STOP. Tell human: "Playwright browser is not running.
     Please start the browser session."

2. Is the browser signed into Google (business.google.com)?
   → Navigate to business.google.com
   → Check if the GBP dashboard is visible
   → IF not signed in: STOP. Tell human: "Please sign into
     Google Business Profile in the Playwright browser. I will
     wait for confirmation before proceeding."

3. Can we see the business reviews section?
   → Navigate to the brand's GBP profile
   → Verify the Reviews section is accessible
   → IF not visible: STOP. Tell human: "Cannot access the reviews
     section. Please verify account access."
```

#### Human Approval Gate (1-2 Star Only)

```
HUMAN APPROVAL GATE

For 1-2 star reviews ONLY:

1. Present the original review to the human:
   → Reviewer name, rating, date, full review text

2. Present the generated response:
   → Full response text with sign-off

3. Ask: "This review is rated {rating} star(s). Here is the proposed
   response. Would you like me to:
   a) Post this response as-is
   b) Edit the response (provide your changes)
   c) Skip this review (do not respond)
   d) Flag for offline handling"

4. Wait for human decision before proceeding
   → IF approved: add to posting queue
   → IF edited: apply edits, re-run quality review, then add to queue
   → IF skipped: log as "skipped_by_human" and continue
   → IF flagged: log as "flagged_for_offline" and continue
```

#### Posting Sequence (Per Response)

```
POSTING SEQUENCE

For each approved response:

Step 1: Navigate to GBP Reviews
  → Go to the brand's GBP dashboard
  → Navigate to the Reviews section
  → Take snapshot to confirm reviews are visible

Step 2: Find the Target Review
  → Locate the specific review by reviewer name and date
  → Take snapshot to confirm the correct review is found

Step 3: Click Reply
  → Click the "Reply" button on the target review
  → Wait for the reply text field to appear
  → Take snapshot to confirm the reply field is open

Step 4: Enter Response Text
  → Type the full response text into the reply field
  → Verify the text appears correctly
  → Take snapshot of the entered text

Step 5: Submit Response
  → Click the "Reply" or "Submit" button to post the response
  → Wait for confirmation that the response was posted
  → Take snapshot as proof of posting

Step 6: Verify
  → Confirm the response now appears under the review
  → Take snapshot showing the posted response
  → Log: reviewer_name, rating, response_text, timestamp, status

Step 7: Wait
  → Pause 5 seconds before processing the next review (rate limiting)
```

#### Error Handling

```
ERROR HANDLING

IF response fails to post:
  → Take snapshot of error
  → Log the error message
  → Skip to next response
  → Report failure in summary

IF review is no longer visible (deleted by reviewer):
  → Log: "Review by {reviewer_name} no longer visible — may have been deleted"
  → Skip and continue
  → Report in summary

IF "Reply" button is not available:
  → The review may already have a response (another team member responded)
  → Take snapshot
  → Log: "Reply button not available for review by {reviewer_name}"
  → Skip and continue

IF browser session expires:
  → STOP posting
  → Report: "Browser session expired after posting X of Y responses"
  → Tell human which responses were posted and which remain
  → Ask human to re-authenticate

IF Google rate-limits replies:
  → Increase wait time to 15 seconds between responses
  → IF still rate-limited: stop posting, report remaining responses
  → Log: "Rate limited after X responses. Y responses remaining"
```

---

### Phase 7: Log to Sheets + Email Notification

#### Log to Google Sheets

```
RESPONSE LOG ENTRY (one row per response)

| Column          | Value                                           |
|----------------|------------------------------------------------|
| Date            | 2026-03-02                                     |
| Brand           | Carisma Spa                                    |
| Location        | InterContinental                               |
| Reviewer Name   | Maria G                                        |
| Rating          | 5                                              |
| Review Text     | [first 100 chars of review]...                 |
| Response Text   | [first 100 chars of response]...               |
| Persona         | Sarah Caballeri                                |
| Status          | Posted                                         |
| Timestamp       | 2026-03-02T08:45:00+01:00                      |
| Notes           | Auto-posted after AI quality review             |
```

#### Update Local Response Log

```
For each posted response, add to .tmp/reviews/logs/response_log_{brand_id}.json:

{
  "review_id": "{reviewer_name}_{date}_{location}",
  "reviewer_name": "Maria G",
  "rating": 5,
  "review_date": "2026-02-28",
  "response_date": "2026-03-02",
  "brand": "carisma_spa",
  "location": "InterContinental",
  "status": "responded",
  "response_preview": "[first 80 chars]..."
}
```

#### Email Notification

Send a summary email via Gmail MCP (`mcp__google-workspace__gmail_send_email`).

**Send to:** `mertgulen98@gmail.com`

**Subject format:** `Google Reviews — {date} — {total_responses} responses across {brand_count} brands`

**Email body format (HTML):**

```
GOOGLE REVIEW RESPONSE REPORT — {DATE}

SUMMARY
  Total reviews found: {count}
  Unresponded reviews: {count}
  Responses posted: {count}
  Flagged for human: {count}
  Abusive/skipped: {count}
  Failures: {count}

PER BRAND BREAKDOWN

  {BRAND_NAME}
    Reviews found: {count}
    Responses posted: {count}
    Rating breakdown: 5★ ({count}) | 4★ ({count}) | 3★ ({count}) | 1-2★ ({count})

    Recent responses:
      → {reviewer_name} ({rating}★): "{first_50_chars_of_response}..."
      → {reviewer_name} ({rating}★): "{first_50_chars_of_response}..."

  (repeat for each brand)

FLAGGED REVIEWS (require human attention)
  {reviewer_name} ({rating}★, {brand}): "{first_80_chars_of_review}..."
  Action needed: {reason}

FAILURES (if any)
  {reviewer_name} ({brand}): {error_description}

---
Automated by Carisma AI — Google Review Response System
```

**When to send:**
- ALWAYS send after a response session (even if some responses failed)
- Include both successes and failures in the same email
- If ALL responses failed (zero posted), still send the email with failure details
- If no new reviews found, send a brief "No new reviews" notification

**If Gmail MCP fails:**
- Log the email sending failure
- The responses were still posted — do not retry the responses
- Report: "Responses posted successfully but email notification failed"

---

## Troubleshooting

**Issue: "Playwright browser not running"**
- Start the Playwright MCP server
- Navigate to business.google.com
- Sign in and confirm access to Carisma GBP accounts

**Issue: "Cannot find the Reviews section"**
- The GBP interface may have changed
- Take a snapshot and report the current UI state
- Try navigating directly to the brand's GBP profile reviews tab
- Ask human for guidance on the new UI layout

**Issue: "Reply button not available"**
- Another team member may have already responded
- The review may have been removed by Google
- Take a snapshot and log the issue
- Skip and continue with remaining reviews

**Issue: "Rate limited by Google"**
- Increase wait time between responses to 15 seconds
- If still rate-limited, stop and report remaining responses
- Google typically allows a reasonable number of review responses per day
- Our daily cadence should be well within limits

**Issue: "Review not found on GBP dashboard"**
- The review may appear on Google Maps but not yet in the GBP dashboard
- Try refreshing the page
- If persistent, log the issue and skip
- The review will be picked up in the next daily run

**Issue: "Response log file corrupted"**
- The tool handles this gracefully — starts with an empty log
- Previously responded reviews may be re-fetched but will be filtered out by the has_owner_response check
- No duplicate responses will be posted

---

## Best Practices

**DO:**
- Load ALL context files before generating any responses
- Reference specific details from the review in every response
- Use the correct persona and sign-off for each brand
- Include contact details for 3-star and below reviews
- Flag 1-2 star reviews for human approval
- Vary response language to avoid sounding templated
- Take snapshots at each step for verification
- Log every response immediately after posting
- Use UK English throughout

**DO NOT:**
- Use any of the 8 forbidden phrases
- Respond to abusive or spam reviews
- Post responses without passing AI quality review
- Use defensive or dismissive language
- Argue with reviewers or correct their account of events
- Offer compensation or discounts in public responses
- Use the same response for multiple reviews
- Skip the response log — tracking prevents duplicate responses
- Post more than 1 response within 5 seconds (rate limiting)
- Post 1-2 star responses without human approval

---

## Performance Metrics

Track these to measure review response effectiveness:
- **Response rate:** Target 100% of non-abusive reviews responded to within 24 hours
- **Average response time:** Target < 24 hours from review posting
- **AI quality review first-pass rate:** Target 85%+ (responses approved without revision)
- **Human approval rate (1-2 star):** Track approval vs rejection ratio
- **Response log completeness:** 100% of posted responses logged
- **Brand voice consistency:** All responses use correct persona and sign-off

---

**Last Updated:** 2026-03-02
**Version:** 1.0 Production
