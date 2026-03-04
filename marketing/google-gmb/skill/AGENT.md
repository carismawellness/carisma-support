# /gbp-posting Skill -- Generate and Publish Google Business Profile Posts

**Slash Command:** `/gbp-posting`

**What This Does:**
When triggered, this skill:
1. Loads brand context, locations, keywords, and content calendar
2. Plans content based on rotation rules and active offers
3. Generates brand-validated GBP posts for Carisma brands
4. Runs AI quality review (SEO optimisation, brand voice, human tone check)
5. Auto-publishes to Google Business Profile via Playwright browser automation
6. Copies multi-location posts (Spa: 5 hotels) and logs results to Google Sheets
7. Sends email summary report via Gmail MCP

**When to Use:**
User wants to create, publish, or manage Google Business Profile posts for any Carisma brand.

---

## Usage

### Step 1: Specify Brand and Parameters

```
/gbp-posting

Brand: all (or carisma_spa / carisma_aesthetics / carisma_slimming)
Post type: auto (or update / offer / event)
Posts per brand: 2
Dry run: false
```

### Step 2: System Executes Phases 1-5 Automatically

The system loads context, plans content, generates posts, runs AI quality review (SEO + brand voice + human tone), and auto-publishes via Playwright. No human review needed — the AI review layer handles quality assurance.

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

3. Read config/offers.json
   → Filter by gbp_eligible: true
   → Filter by active: true (check start/end dates against today)
   → Note offer details: pricing, CTA, landing page URL

4. Read marketing/google-gmb/keyword-banks/{brand}.md
   → Load target keywords per brand
   → Note primary and secondary keyword tiers
   → Note seasonal keyword modifiers

5. Read marketing/google-gmb/content-calendar.json
   → Load posting schedule and rotation rules
   → Determine which post types are due
   → Check keyword rotation history (no same primary within 3 posts)
   → Check template rotation history (no same template within 4 posts)

6. Determine current season
   → January-March: New Year reset, Valentine's, spring renewal
   → April-June: Summer preparation, wedding season, Mother's Day
   → July-September: Summer confidence, holiday, beach body
   → October-December: Autumn restoration, Christmas gifting, festive packages
```

**If any context file is missing:**
- Log the missing file
- Continue with available context
- Note limitations in the output
- Suggest creating the missing file

---

### Phase 2: Content Planning

```
CONTENT PLANNING SEQUENCE

1. Check Post Log
   → Read recent post entries from Google Sheets (or local log)
   → Note: last 10 posts per brand
   → Extract: keywords used, templates used, post types used, dates

2. Select Post Type
   → IF content calendar specifies a type for today → use that
   → IF active offer is due for promotion → use Offer type
   → IF seasonal event is within 14 days → use Event type
   → ELSE → use Update type (best for keyword targeting)

3. Select Target Keywords
   → Pick 2-3 keywords from the keyword bank
   → PRIMARY keyword: must NOT have been used as primary in last 3 posts
   → SECONDARY keywords: should complement primary (same service family)
   → SEASONAL modifier: add if relevant (e.g., "summer", "Valentine's", "Christmas")
   → Location keyword: always include "Malta" + specific area if relevant

4. Choose Template
   → Select from marketing/google-gmb/templates/
   → Template must NOT have been used in last 4 posts for this brand
   → Match template to post type (Update, Offer, Event)
   → Match template to content angle (educational, promotional, trust-building, seasonal)

5. Check for Active Offers
   → IF gbp_eligible offer exists for this brand AND not posted in last 7 days
   → → Include offer details in at least one post
   → → Use Offer post type with pricing, terms, and expiry

6. Output: Content Plan
   → For each post: post type, primary keyword, secondary keywords, template, angle, offer (if any)
   → Present plan summary before generating content
```

---

### Phase 3: Content Generation

For each planned post, generate content using the selected template, brand voice, keywords, and offer details.

#### Generation Rules

```
CONTENT GENERATION CHECKLIST

For each post:

1. STRUCTURE
   → Opening hook (first 100 characters visible in preview -- make them count)
   → Body: 2-4 short paragraphs
   → Pricing (if applicable): always use "from EUR X" format
   → CTA: clear next step with urgency where appropriate
   → Signature: correct persona sign-off

2. BRAND VOICE APPLICATION
   → SPA posts:
     - Use sensory language (warm, soothing, gentle, restoration)
     - Reference thermal journey, Turkish heritage, Beyond the Spa
     - Persona: Sarah Caballeri. Signature: "Peacefully, Sarah"
     - Include hotel name for location-specific posts
     - Maltese touches welcome (Mela, Prosit, Grazzi, Il-jum)
     - UK English throughout

   → AESTHETICS posts:
     - Use clinical-warm language (qualified, personalised, natural-looking)
     - Reference consultation-first model, philosophy of restraint
     - Persona: Sarah. Tagline: "Glow with Confidence"
     - Signature: "Beautifully yours, Sarah"
     - Emphasise free consultation, no-pressure environment
     - Maltese touches welcome (Mela, Prosit)
     - UK English throughout

   → SLIMMING posts:
     - Use compassionate, evidence-led language (validated, supported, sustainable)
     - Reference doctor-led (30+ years), FDA-cleared tech by name
     - Named technologies: CoolSculpting (Allergan), EMSculpt NEO (BTL), VelaShape
     - Persona: Katya. Signature: "With you every step, Katya"
     - Transparent pricing: EUR 199 always visible
     - Normalise relapse, validate past failures
     - No toxic positivity, no shame language
     - UK English throughout

3. KEYWORD INTEGRATION
   → Primary keyword appears at least once (naturally, not forced)
   → Secondary keywords woven into body text where appropriate
   → "Malta" appears at least once
   → Location reference (St Julian's, near Sliema, etc.) included

4. COMPLIANCE
   → No medical claims or guaranteed results
   → Pricing uses "from" prefix (e.g., "from EUR 89")
   → No before/after references or imagery descriptions
   → No shame-based or fear-based language (especially Slimming)
   → "Subject to doctor approval" for clinical treatments (Slimming)
   → Free consultation positioned as no-obligation
```

#### Validation Checks (Automated)

```
VALIDATION CHECKLIST (run for every generated post)

□ Character count: under 1,500 (HARD LIMIT -- reject if over)
□ Optimal range: 400-700 characters (flag if outside, do not reject)
□ Contains at least 1 target keyword naturally
□ Contains "Malta" or specific Maltese location reference
□ Correct persona signature for the brand
□ No forbidden phrases for the brand
□ CTA button type matches the content (Book, Learn more, Call now)
□ CTA link URL is correct for the service referenced
□ UK English spelling verified (colour, centre, specialise, programme)
□ No medical claims or guaranteed results
□ Pricing uses "from" prefix where applicable
□ Maltese language touches are grammatically correct (if used)

SCORING:
  Pass: All checks green → ready for approval
  Warning: 1-2 minor issues → flag for human review
  Fail: Character limit exceeded OR wrong persona → must revise before presenting
```

---

### Phase 4: AI Quality Review (Automated)

Every generated post goes through a multi-layer AI review before publishing. No human review required — the AI catches and fixes issues automatically.

#### Review Layer 1: SEO Optimisation Check

```
SEO REVIEW CHECKLIST

For each post, verify and improve:

□ PRIMARY KEYWORD appears in the first 100 characters (preview zone)
  → IF missing: rewrite the opening hook to include it naturally
□ SECONDARY KEYWORDS appear at least once each in the body
  → IF missing: weave them into existing sentences (never force)
□ LOCATION SIGNAL present ("Malta", specific area, or landmark)
  → IF missing: add a location reference naturally
□ KEYWORD DENSITY between 1-3% (not stuffed, not absent)
  → IF over 3%: reduce repetitions to sound natural
  → IF under 1%: add one more natural mention
□ HASHTAGS include 3-5 relevant terms (#keyword #Malta #brand)
□ CTA LINK matches the service mentioned in the post
□ POST LENGTH in optimal range (400-700 chars preferred)
  → IF under 400: expand with additional value or detail
  → IF over 700 but under 1500: acceptable, but tighten if possible
```

#### Review Layer 2: Human Tone Check

```
HUMAN TONE REVIEW

Read the post aloud. Does it sound like a real person wrote it?

□ NO AI PATTERNS — remove these if found:
  - "Whether you're..." opening constructions
  - "In today's..." or "In the world of..."
  - "Unlock", "Elevate", "Transform your" (AI buzzwords)
  - Excessive adjective stacking ("luxurious, serene, tranquil")
  - Perfect parallel structure in every sentence (real people vary)
  - Lists of three everywhere ("relax, rejuvenate, restore")

□ CONVERSATIONAL FLOW — ensure the post:
  - Starts with a hook that stops the scroll (question, bold statement, or relatable moment)
  - Uses contractions where natural ("it's", "you'll", "we've")
  - Varies sentence length (mix short punchy + longer descriptive)
  - Includes at least one specific detail (named treatment, exact price, real location)
  - Ends with a clear, simple CTA (not a paragraph)

□ MALTESE AUTHENTICITY — if Maltese touches are used:
  - Spelling is correct (Mela, Prosit, Grazzi, Ejja)
  - Usage feels natural, not tokenistic
  - Maximum 1-2 Maltese words per post (less is more)

IF any issues found: rewrite the affected sections, then re-check.
```

#### Review Layer 3: Brand Voice Verification

```
BRAND VOICE FINAL CHECK

□ SPA POSTS must sound like Sarah Caballeri:
  - Warm, nurturing, sensory language
  - Heritage references (30+ years, Turkish tradition, World Luxury Spa Award)
  - "Beyond the Spa" philosophy present or implied
  - Sign-off: "Peacefully, Sarah"
  - REJECT if: sounds clinical, corporate, or generic wellness

□ AESTHETICS POSTS must sound like Sarah at Carisma Aesthetics:
  - Clinical-warm: knowledgeable but approachable
  - Consultation-first messaging (20-30 minute assessment)
  - Philosophy of restraint ("enhancement, not transformation")
  - Tagline: "Glow with Confidence"
  - Sign-off: "Beautifully yours, Sarah"
  - REJECT if: sounds pushy, uses fear tactics, or promises specific results

□ SLIMMING POSTS must sound like Katya:
  - Compassionate, validating, evidence-led
  - Always validate the struggle BEFORE offering solutions
  - Named FDA-cleared technology (CoolSculpting by Allergan, EMSculpt NEO by BTL)
  - Transparent pricing (EUR 199 visible, "every cost explained upfront")
  - Doctor-led authority, not influencer energy
  - Sign-off: "With you every step, Katya"
  - REJECT if: uses shame language, toxic positivity, or vague claims

□ COMPLIANCE (all brands):
  - No medical claims or guaranteed results
  - Pricing uses "from" prefix
  - No before/after references
  - No shame-based or fear-based language
  - Clinical treatments include "subject to doctor approval"

IF brand voice is off: rewrite the post entirely using the correct brand voice,
then run all 3 review layers again on the rewritten version.
```

#### Auto-Fix Protocol

```
WHEN A POST FAILS ANY REVIEW LAYER:

1. Identify which checks failed
2. Rewrite ONLY the failing sections (preserve what passed)
3. Re-run ALL 3 review layers on the revised post
4. Maximum 3 revision rounds per post
5. IF still failing after 3 rounds:
   → Log the issue
   → Generate a completely new post with a different template
   → Run all 3 review layers on the new post
6. IF the replacement also fails after 3 rounds:
   → Skip this post
   → Log: "Post skipped after review failures — investigate template/keyword combination"
   → Continue with remaining posts
```

#### Review Output Format

After review, log the result internally (not shown to user):

```
POST REVIEW RESULT
  Post ID: CS_GBP_20260302_001
  Brand: Carisma Spa
  SEO Score: PASS (keyword in preview, 2.1% density, location present)
  Tone Score: PASS (conversational, no AI patterns, varied sentence length)
  Voice Score: PASS (warm/sensory, heritage reference, correct sign-off)
  Compliance: PASS (no medical claims, "from" pricing, no shame language)
  Revisions: 1 (rewrote opening hook for keyword placement)
  Status: APPROVED FOR AUTO-PUBLISH
```

---

### Phase 5: Post via Playwright

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

3. Can we see the business locations table?
   → Navigate to business.google.com/locations
   → Verify the Carisma brands are listed
   → IF not visible: STOP. Tell human: "Cannot see business
     locations. Please verify account access."
```

#### Posting Sequence (Per Post)

```
POSTING SEQUENCE

For each post that passed AI quality review:

Step 1: Navigate
  → Go to business.google.com/locations
  → Take snapshot to confirm page loaded

Step 2: Find Brand
  → Locate the target brand in the business table
  → Click "Create post" button for that business

Step 3: Open Post Dialog
  → Wait for "Add post" dialog to appear
  → Take snapshot to confirm dialog is open

Step 4: Select Post Type
  → Verify "Update" is selected (default)
  → IF post type is Offer: click "Offer" tab
  → IF post type is Event: click "Event" tab

Step 5: Enter Post Content
  → Click into the Description field
  → Type the full post text
  → Verify text appears correctly

Step 6: Add CTA
  → Click "Add link fields" or "Button" to expand CTA section
  → Select CTA type from dropdown:
    - "Book" for booking CTAs
    - "Learn more" for informational CTAs
    - "Call now" for phone CTAs
    - "Order online" for product CTAs
  → Enter the CTA link URL
  → Verify CTA is correctly configured

Step 7: Publish
  → Click "Post" button
  → Wait for response

Step 8: Handle Copy Dialog
  → IF brand is Carisma Spa (multi-location):
    → "Copy post" dialog appears
    → Select all 4 remaining Spa hotel locations
    → Click "Post" to copy to selected locations
    → Wait for confirmation
  → IF brand is Carisma Aesthetics or Carisma Slimming:
    → Click "Skip" on the copy dialog (single location)

Step 9: Verify
  → Wait for "Post submitted for review" or success confirmation
  → Take snapshot as proof of publication
  → Log: brand, location(s), timestamp, status

Step 10: Wait
  → Pause 10 seconds before next post (spam prevention)
```

#### Error Handling

```
ERROR HANDLING

IF post fails to publish:
  → Take snapshot of error
  → Log the error message
  → Skip to next post
  → Report failure in summary

IF "Copy post" dialog does not appear (Spa):
  → Post was published to primary location
  → Navigate to each additional location manually
  → Create the same post for each
  → Log which locations were posted to

IF browser session expires:
  → STOP posting
  → Report: "Browser session expired after posting X of Y posts"
  → Tell human which posts were published and which remain
  → Ask human to re-authenticate

IF Google rejects a post:
  → Log the rejection reason
  → Report in summary
  → Suggest content revision for compliance
```

---

### Phase 6: Log and Report

#### Log to Google Sheets

```
POST LOG ENTRY (one row per brand-location combination)

| Column       | Value                                        |
|------------- |----------------------------------------------|
| Date         | 2026-03-02                                   |
| Brand        | Carisma Spa                                  |
| Location(s)  | InterContinental, Hilton, Westin, Radisson, AX|
| Post Type    | Update                                       |
| Post Text    | [full text]                                  |
| Keywords     | spa day Malta, hotel spa                     |
| CTA Button   | Book                                         |
| CTA Link     | https://www.carismaspa.com/spa-day           |
| Status       | Published                                    |
| Timestamp    | 2026-03-02T14:30:00+01:00                    |
| Notes        | Copied to all 5 locations successfully       |
```

#### Generate Summary Report

```
=========================================================
 GBP POSTING SUMMARY
=========================================================

DATE: 2026-03-02
TOTAL POSTS PUBLISHED: 6

CARISMA SPA:
  Posts: 2
  Locations: 5 each (10 total location-posts)
  Status: All published successfully

CARISMA AESTHETICS:
  Posts: 2
  Locations: 1 each (2 total location-posts)
  Status: All published successfully

CARISMA SLIMMING:
  Posts: 2
  Locations: 1 each (2 total location-posts)
  Status: All published successfully

FAILURES: None

NEXT RECOMMENDED POSTING DATE: 2026-03-05 (Thursday)
NEXT KEYWORDS TO TARGET: [based on rotation schedule]

=========================================================
```

---

### Phase 7: Email Notification

After successful posting, send a summary email via Gmail MCP (`mcp__google-workspace__gmail_send_email`).

**Send to:** `mertgulen98@gmail.com`

**Subject format:** `GBP Posts Published — {date} — {total_posts} posts across {brand_count} brands`

**Email body format (HTML):**

```
GBP POSTING REPORT — {DATE}

SUMMARY
  Total posts published: {count}
  Brands: {brand_list}
  Failures: {failure_count}

PER BRAND BREAKDOWN

  {BRAND_NAME}
    Posts: {count}
    Locations: {location_count} ({location_names})
    Status: {status}

    Post 1: [{post_type}] {first_50_chars_of_post}...
      Keywords: {keywords}
      CTA: {cta_button} → {cta_link}

    Post 2: [{post_type}] {first_50_chars_of_post}...
      Keywords: {keywords}
      CTA: {cta_button} → {cta_link}

  (repeat for each brand)

FAILURES (if any)
  {post_id}: {error_description}

NEXT POSTING
  Recommended date: {next_date}
  Keywords to target: {next_keywords}

---
Automated by Carisma AI — GBP Posting System
```

**When to send:**
- ALWAYS send after a successful posting session (even if some posts failed)
- Include both successes and failures in the same email
- If ALL posts failed (zero published), still send the email with failure details

**If Gmail MCP fails:**
- Log the email sending failure
- The posting itself was still successful — do not retry the posts
- Report: "Posts published successfully but email notification failed"

---

## Troubleshooting

**Issue: "Playwright browser not running"**
- Start the Playwright MCP server
- Navigate to business.google.com
- Sign in and confirm access to Carisma GBP accounts

**Issue: "Cannot find Create post button"**
- The GBP interface may have changed
- Take a snapshot and report the current UI state
- Try navigating directly to the brand's GBP profile
- Ask human for guidance on the new UI layout

**Issue: "Post exceeds 1,500 characters"**
- This is a hard fail. Do not attempt to post
- Trim the content and re-validate
- Focus on removing qualifiers and tightening language
- Never cut the CTA, pricing, or brand signature

**Issue: "Copy post dialog not appearing for Spa"**
- The dialog only appears if the business has multiple locations under the same group
- Fall back to manual posting: navigate to each location individually
- Report the workaround in the summary

**Issue: "Google rejected the post"**
- Common reasons: prohibited content, too many links, spam detection
- Read the rejection reason carefully
- Revise content to comply with Google's Merchant Policies
- Wait 30 minutes before reposting (spam cooldown)

**Issue: "Post log Google Sheet not accessible"**
- Log results locally to `.tmp/gbp-post-log.csv` as fallback
- Report the Sheet access issue to human
- Attempt Sheet logging again at end of session

---

## Best Practices

**DO:**
- Load ALL context files before generating any content
- Check recent post history to avoid keyword and template repetition
- Include transparent pricing -- it is Carisma's biggest competitive advantage
- Use Maltese language touches naturally (not forced)
- Run all 3 AI review layers before every auto-publish
- Take snapshots at each step for verification
- Log every post immediately after publishing

**DO NOT:**
- Skip the AI quality review (SEO + tone + brand voice)
- Use the same primary keyword within 3 consecutive posts
- Exceed 1,500 characters (hard GBP limit)
- Use shame language, fear tactics, or guaranteed results claims
- Mix brand voices (Spa warmth is not the same as Aesthetics clinical-warmth)
- Post more than 1 post per brand within 10 seconds (spam risk)
- Assume the browser is authenticated -- always verify first
- Skip the post log -- tracking is essential for rotation and performance analysis

---

## Performance Metrics

Track these to measure GBP posting effectiveness:
- **Posting cadence:** Target 2-4 posts per brand per week
- **Approval first-pass rate:** Target 90%+ (posts approved without revision)
- **Character count average:** Target 400-700 characters
- **Keyword coverage:** All target keywords used within a 4-week cycle
- **Multi-location copy rate:** 100% for Spa (all 5 locations every post)
- **Post log completeness:** 100% of published posts logged to Sheets

---

**Last Updated:** 2026-03-02
**Version:** 1.0 Production
