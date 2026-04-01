# Calendar Strategy — Execution SOP (Master Orchestrator)

**Version:** 3.0.0
**Last Updated:** 2026-03-31

**What This Does:**
When triggered, this skill executes a 7-phase process that orchestrates 11 specialist skills to plan and build a monthly marketing calendar in the Marketing Master Google Sheet for 3 Carisma brands — covering Meta Ads, Google Ads, Email, Social Media (3x/week), WhatsApp, Blog, Pop-up, and Tablet Display.

---

## Phase 1: Context Load

```
CONTEXT LOADING SEQUENCE

1. Read marketing/marketing-calendar/skill/config.json
   -> Extract spreadsheet ID, sheet name, sheet ID
   -> Extract brand row ranges and channel row positions
   -> Extract design rules (font color, bold, background)
   -> Calculate target month's column range using month-to-column formula

2. Read previous month's data from the sheet
   -> Use Google Sheets MCP: sheets_read_values
   -> Read the last completed month's section for all 3 brands
   -> This becomes the reference for campaign count, naming patterns, budget levels

3. Load brand knowledge
   -> config/brands.json (ad accounts, targeting, brand codes)
   -> config/offers.json (active offers with pricing, CTAs)
   -> config/branding_guidelines.md (brand voice rules)
   -> config/budget-allocation.json (budget numbers per brand per channel)
   -> CRM/CRM-SPA/knowledge/brand-voice.md
   -> CRM/CRM-AES/knowledge/brand-voice.md
   -> CRM/CRM-SLIM/knowledge/brand-voice.md

4. Load channel references
   -> references/meta-specialist.md
   -> references/email-specialist.md
   -> references/google-specialist.md
   -> references/smm-specialist.md
   -> references/formatting-rules.md

5. Determine current context
   -> What is today's date?
   -> What is the target month?
   -> What was the last completed month? (reference for patterns)
   -> Is the target month in Q4? (triggers budget-allocation Q4 override)
```

**Column range calculation:**
```
Month start column (0-indexed) = 2 + sum of days in all previous months

Jan: col 2  (day 1) to col 32  (day 31)
Feb: col 33 (day 1) to col 60  (day 28)
Mar: col 61 (day 1) to col 91  (day 31)
Apr: col 92 (day 1) to col 121 (day 30)
May: col 122 (day 1) to col 152 (day 31)
Jun: col 153 (day 1) to col 182 (day 30)
Jul: col 183 (day 1) to col 213 (day 31)
Aug: col 214 (day 1) to col 244 (day 31)
Sep: col 245 (day 1) to col 274 (day 30)
Oct: col 275 (day 1) to col 305 (day 31)
Nov: col 306 (day 1) to col 335 (day 30)
Dec: col 336 (day 1) to col 366 (day 31)
```

---

## Phase 2: Strategy Design (4 Skills)

**This phase invokes 4 skills to decide WHAT campaigns to run.**

```
STRATEGY DESIGN SEQUENCE

━━━ SKILL 1: quarterly-marketing-calendar ━━━

Invoke the quarterly-marketing-calendar skill for the target month(s).
Location: ~/.claude/skills/quarterly-marketing-calendar/SKILL.md

This runs a 3-phase sub-orchestration:
  -> Phase 1: Research Agent finds all Malta occasions (public holidays, festas,
     events, awareness days, industry moments, seasonal context)
  -> Phase 2: Three Brand Filter Agents (parallel) select relevant occasions per brand
     - Spa filter: prioritises stress relief, relaxation, couples, gift-giving
     - Aesthetics filter: prioritises beauty events, glow-ups, wedding season, skin
     - Slimming filter: prioritises body confidence, summer prep, health awareness
  -> Phase 3: Campaign Designer produces campaign plans with angles, offers, formats

Output: occasion-based campaign plan per brand with:
  - Campaign name, occasion, date window, campaign type
  - Core message in brand voice, suggested offer, creative format
  - Priority: HIGH (mandatory occasion) / MEDIUM / LOW
  - Cross-brand coordination notes

━━━ SKILL 2: occasion-campaigns ━━━

Invoke the occasion-campaigns skill.
Location: marketing/marketing-calendar/occasions/SKILL.md
Data: marketing/marketing-calendar/occasions/occasion-calendar.json

  -> Load the company's official occasion calendar (12 months)
  -> Cross-reference with quarterly-marketing-calendar output
  -> For each occasion in the target period:
     - Check which brands have specific offers (from occasion-calendar.json)
     - Calculate campaign window (minimum 2 weeks before occasion date)
     - Handle moveable dates (Easter, Mother's Day, BFCM)
  -> Place occasion campaigns immediately after last evergreen row per brand

Rules:
  - Minimum 2-week campaign window before each occasion
  - Campaign naming: "[Theme] | CPL XXX" (ALWAYS XXX for future campaigns)
  - TBD offers -> use thematic/awareness angle, never invent discounts
  - Row placement: stack after last evergreen, in start-date order

━━━ SKILL 3: meta-strategist ━━━

Invoke the meta-strategist skill.
Location: ~/.claude/skills/meta-strategist/SKILL.md

  -> Layer in Meta evergreen campaigns (always-on base that NEVER pauses)
  -> Merge evergreen + occasion campaigns per brand
  -> Note seasonal angle rotation for evergreen creative
  -> Spa: 4 evergreen campaigns (EUR 45/day)
  -> Aesthetics: 5 evergreen campaigns (~EUR 38-46/day)
  -> Slimming: 4+ evergreen campaigns (USD 93/day — NOTE: USD not EUR)

Rules:
  - Evergreen campaigns NEVER pause for occasion campaigns
  - Occasion campaigns get ADDITIONAL budget on top
  - Seasonal angle rotation updates creative, not campaign structure

━━━ SKILL 4: google-ads-strategist ━━━

Invoke the google-ads-strategist skill.
Location: ~/.claude/skills/google-ads-strategist/SKILL.md

  -> Layer in Google Ads proven campaigns
  -> Check demand-toggle status (e.g., Spa LHR fully booked? -> OFF)
  -> Spa: 4 campaigns (Search, PMax, LHR toggle, Maps)
  -> Aesthetics: 5 campaigns (Botox, Fillers, LHR, LHR Remarketing, Micro-needling)
  -> Slimming: 2 campaigns (Medical Weight Loss, Weight Loss)

Rules:
  - Google runs ALONGSIDE Meta, never as replacement
  - Always-on campaigns do NOT pause for occasions
  - Do NOT invent campaigns — only use proven roster

━━━ SYNTHESIS ━━━

5. Design weekly arcs
   -> Map occasion campaigns to specific weeks within the month
   -> Build thematic progression (e.g., Easter -> Spring Refresh -> Summer Prep)
   -> Identify cross-brand coordination moments (Mother's Day, BFCM, etc.)

6. Present strategy summary to user
   -> Show occasion-based campaigns per brand (from quarterly-marketing-calendar + occasion-campaigns)
   -> Show evergreen campaigns (from meta-strategist)
   -> Show Google campaigns (from google-ads-strategist)
   -> Show weekly arc progression
   -> Show preliminary budget allocation per brand

   >>> APPROVAL GATE: Wait for user approval before proceeding <<<
```

---

## Phase 3: Channel Planning (5 Skills)

**This phase invokes 5 skills to decide HOW to execute each channel.**

```
CHANNEL PLANNING SEQUENCE

━━━ SKILL 5: email-marketing-content-strategy ━━━

Invoke the email-marketing-content-strategy skill.
Location: marketing/marketing-calendar/email-marketing/SKILL.md

Also load brand-specific email strategy files:
  -> marketing/marketing-calendar/email-marketing/spa-email-strategy.md
  -> marketing/marketing-calendar/email-marketing/aesthetics-email-strategy.md
  -> marketing/marketing-calendar/email-marketing/slimming-email-strategy.md

For each brand:
  1. Design the monthly email arc using the 7 universal content types:
     Type 1: Before & After / Transformation Stories
     Type 2: Insider Secrets / Therapist's Notes
     Type 3: Pain-Solution
     Type 4: Storytime POV
     Type 5: Objection Flip
     Type 6: Hooked Insight
     Type 7: Us vs Them

  2. Follow the weekly rotation:
     Week 1: Emotional (Storytime POV or Pain-Solution)
     Week 2: Educational (Insider Secrets or Hooked Insight)
     Week 3: Proof (Before & After / Transformation Story)
     Week 4: Positioning (Objection Flip or Us vs Them)

  3. Plan 12-13 emails per brand per month (~3 per week):
     -> Alternate design promos and TB_ (text-based) relationship emails
     -> Design emails: "Offer Name" or "Seasonal Theme" (promotional, with pricing)
     -> TB_ emails: "TB_Topic" (personal letter from persona, NO pricing)
     -> Align email themes with the weekly arcs from Phase 2

  4. Select emotional register for each email:
     -> Spa: Stillness, Warmth, Awe, Belonging, Permission, Curiosity
     -> Aesthetics: Confidence, Authority, Empathy, Excitement, Permission, Curiosity, Trust
     -> Slimming: Validation, Curiosity, Safety, Hope, Confidence, Permission

  5. Generate creative brief for each email (used in Phase 6):
     -> Subject Line (40-60 chars, curiosity-driven, never promotional)
     -> Preview Text (90-140 chars, extends subject, never repeats)
     -> Hook / Hero Header (10-12 words max)
     -> Body Angle and Content Type
     -> CTA (single button, invitation language — NEVER "Book now" or "Don't miss out")
     -> Tone and Emotional Register
     -> Visual Direction
     -> Offer Details (design emails only — NEVER in TB_ emails)

  Place all emails in the Email row, one per cell per send day.

━━━ SKILL 6: social-media-content-strategy ━━━

Invoke the social-media-content-strategy skill.
Location: marketing/marketing-calendar/social-media/SKILL.md

Also load brand-specific pillar files:
  -> marketing/marketing-calendar/social-media/spa-pillars.md
  -> marketing/marketing-calendar/social-media/aesthetics-pillars.md
  -> marketing/marketing-calendar/social-media/slimming-pillars.md

For each brand:
  1. Load the brand's pillar file (content pillars, hook templates, format guides)

  2. Plan SMM Post rotation — 3x per week (Mon, Wed, Fri ONLY):
     Spa: Pain-Solution 30%, Hooked Insight 25%, Objection Flip 20%, Viral 25%
     Aesthetics: Pain-Solution 30%, Hooked Insight 30%, Objection Flip 20%, Viral 20%
     Slimming: Pain-Solution 25%, Hooked Insight 20%, Objection Flip 20%, Viral 15%, BTC 20%

     ~13 posts per brand per month. NEVER post on Tue, Thu, Sat, or Sun.

  3. Plan SMM Story rotation — 3x per week (Mon, Wed, Fri — same days as posts):
     -> Use story-specific hooks and interactive elements (polls, quizzes, sliders)
     -> Each story gets a pillar, sub-topic, and hook preview

  4. Cross-reference with occasion arcs from Phase 2:
     -> Align social content themes with the month's key campaigns
     -> Coordinate messaging across social and paid (but keep organic voice distinct)

  5. For each Mon/Wed/Fri slot, output: pillar, sub-topic, format, hook preview
     -> Keep cell entries concise (under 50 characters — calendar labels, not full copy)

  Place posts in SMM Post row, stories in SMM Story row per brand.

━━━ SKILL 7: whatsapp-marketing ━━━

Invoke the whatsapp-marketing skill.
Location: marketing/marketing-calendar/whatsapp/SKILL.md

Also load: marketing/marketing-calendar/occasions/occasion-calendar.json

For each brand:
  1. Check which occasion is active in the target month (from occasion-calendar.json)
  2. If month has occasion with an offer:
     -> Blast 1: occasion_date - 7 days (announce offer)
     -> Blast 2: occasion_date - 1 day (urgency reminder)
  3. If no occasion or offer is TBD:
     -> Blast 1: mid-month with best current evergreen offer
  4. Maximum 2 blasts per month per brand (never exceed)
  5. Send on Tuesday or Wednesday, 10 AM - 12 PM Malta time

  Cell format: "WA: [Offer Name]" on the send date column
  Rows: Spa=52, Aesthetics=140, Slimming=220

━━━ SKILL 8: blog-content ━━━

Invoke the blog-content skill.
Location: marketing/marketing-calendar/blog/SKILL.md

For each brand:
  1. Plan 1 blog post per week (published on Thursday)
  2. Rotate topic categories:
     Week 1: Treatment Education
     Week 2: Seasonal/Occasion Guide (aligned with active occasion)
     Week 3: FAQ / Myth-Busting
     Week 4: Client Stories / Results
  3. Select 1-2 target SEO keywords per post
  4. Ensure blog topics support the month's primary campaigns

  Cell format: "SEO: [Blog Title]" on the Thursday column
  Rows: Spa=92, Aesthetics=172, Slimming=250

━━━ SKILL 9: budget-allocation ━━━

Invoke the budget-allocation skill.
Location: ~/.claude/skills/budget-allocation/SKILL.md

Also load: config/budget-allocation.json

  1. Load weekly budget tables per brand:
     Spa: EUR 350/wk Meta, EUR 840/wk Google (30/70 split)
     Aesthetics: EUR 560/wk Meta, EUR 140/wk Google (80/20 split)
     Slimming: EUR 400/wk Meta, EUR 100/wk Google (80/20 split)

  2. Check for Q4 override (Oct-Dec):
     -> If target month is Oct/Nov/Dec, read 2025 actuals from spreadsheet
     -> Replace defaults with Q4 actuals

  3. Split Meta budget:
     -> Evergreen (60%): always-on campaigns from meta-strategist
     -> Seasonal (40%): occasion campaigns from occasion-campaigns skill

  4. Compute per-campaign daily budgets:
     -> evergreen_daily = (evergreen_pool / 7) / num_evergreen_campaigns
     -> seasonal_daily = (seasonal_pool / 7) / num_seasonal_campaigns
     -> Round to nearest EUR 1

  5. Validate EUR 5/day minimum per campaign:
     -> If any campaign falls below EUR 5/day, cut lowest-priority seasonal campaigns
     -> Priority order for cutting: LOW > MEDIUM > never cut HIGH

  6. Distribute Google budget:
     -> Search: 50%, Pmax: 30%, Remarketing: 20%

  7. Write budget values into campaign names:
     -> Meta: "Campaign Name | CPL XX |" where XX = daily budget
     -> Google: "Search: keyword | CPC XX | XXx"

━━━ SYNTHESIS ━━━

10. Compile the full campaign plan across ALL channels
    -> Per-brand breakdown: Meta names + budgets, Google campaigns, Email sequence,
       SMM rotation (Mon/Wed/Fri), WhatsApp blasts, Blog posts, Pop-up, Tablet
    -> Budget summary: total per brand, per channel, per campaign

11. Present full campaign plan to user
    -> All 9 channels mapped: Meta, Google, Email, SMM Post, SMM Story, WhatsApp,
       Blog, Pop-up, Tablet Display

   >>> APPROVAL GATE: Wait for user approval before writing to sheet <<<
```

---

## Phase 4: Spreadsheet Write

**Launch 3 parallel brand agents** (one per brand). Each writes its section using Google Sheets MCP.

```
SPREADSHEET WRITE SEQUENCE (per brand agent)

Tool: Task with subagent_type: "general-purpose"

Each brand agent receives:
  - The approved campaign plan for its brand
  - The config.json row map for its brand
  - The target month's column range

Write order per brand:
  1. Meta campaign names -> Name rows (config.json: brands.[brand].meta.name_rows)
  2. Meta budgets -> Budget rows (config.json: brands.[brand].meta.budget_rows)
  3. Email entries -> Email row (config.json: brands.[brand].email.row)
  4. WhatsApp entries -> WhatsApp row (Spa=52, Aes=140, Slim=220)
  5. SMM posts -> Post row (Mon, Wed, Fri ONLY — 3x/week)
  6. SMM stories -> Story row (Mon, Wed, Fri ONLY — same days as posts)
  7. Blog entries -> Blog row (Spa=92, Aes=172, Slim=250) — Thursdays only
  8. Pop-up entries -> Pop-up row (Spa=89, Aes=171, Slim=249) — every Monday
  9. Tablet display -> Tablet row (Spa=42) — when content changes
  10. Google campaign names -> Google Campaign rows
  11. Google budgets -> Google Budget rows

Write method:
  -> Use sheets_update_values with valueInputOption: "RAW"
  -> Write values day-by-day: each campaign maps to specific date columns
  -> Follow previous month's patterns for which days get values
  -> Campaign names: write on Mondays within active window + start date
  -> Budgets: write daily budget on EVERY active day (no gaps)
  -> Emails: write email name on the send day
  -> SMM: write on Mon/Wed/Fri ONLY (never Tue/Thu/Sat/Sun)
  -> Blog: write "SEO: [Title]" on Thursdays
  -> Pop-up: write "Spin wheel pop up" or occasion-specific on EVERY Monday
  -> WhatsApp: write "WA: [Offer]" on send dates (1-2 per month)
  -> Tablet: write occasion name or "General" when content changes

CRITICAL: All 3 brand agents MUST launch in parallel (single message, 3 Task calls).
```

---

## Phase 5: Formatting & Design

```
FORMATTING SEQUENCE

1. Copy formatting from previous month
   -> Use sheets_batch_update with copyPaste request
   -> Source: previous month's column range
   -> Destination: target month's column range
   -> pasteType: PASTE_FORMAT (format only, no data)

2. Fix font color across all data cells
   -> Target: RGB(0.608, 0.553, 0.514) — warm brownish-gray
   -> Apply using sheets_batch_update with repeatCell request
   -> Fields: "userEnteredFormat.textFormat.foregroundColorStyle"
   -> Apply per brand section (Spa rows, Aesthetics rows, Slimming rows)

3. Remove any green highlights
   -> Green highlighting is manual-only (humans mark campaigns as live)
   -> Scan for green background cells in the new month
   -> Remove with sheets_batch_update (reset background to brand default)

4. Verify bold is false for all campaign text
   -> Campaign names should never be bold
   -> Apply bold: false across all campaign rows

5. Verify font family and size match previous month
   -> Read reference from previous month's first data column
   -> Apply same font family/size to new month if different

Auth pattern for direct API calls:
  -> Secrets: ~/.go-google-mcp/client_secrets.json
  -> Token: ~/.go-google-mcp/token.json
  -> See tools/fix_april_font_colors.py for working auth example
```

---

## Phase 6: Creative Briefs (uses email-marketing-content-strategy)

**Launch 3 parallel brand agents** (one per brand). Each adds cell notes to email cells using the creative briefs generated in Phase 3 by the email-marketing-content-strategy skill.

```
CREATIVE BRIEF SEQUENCE (per brand agent)

Tool: Task with subagent_type: "general-purpose"

Each brand agent receives:
  - The brand's email plan with pre-generated creative briefs from Phase 3
  - The brand-specific email strategy file:
    -> Spa: marketing/marketing-calendar/email-marketing/spa-email-strategy.md
    -> Aesthetics: marketing/marketing-calendar/email-marketing/aesthetics-email-strategy.md
    -> Slimming: marketing/marketing-calendar/email-marketing/slimming-email-strategy.md
  - The config.json for the email row position

For each email cell:

  IF email is a design/promo email:
    Add cell note with:
      Content Type: [which of the 7 types — e.g., Pain-Solution, Before & After]
      Emotional Register: [e.g., Warmth, Confidence, Validation]
      Subject Line: [40-60 chars, curiosity-driven, from formula library]
      Preview Text: [90-140 chars, extends subject]
      Hero Header: [10-12 words, anchors the email emotionally]
      Hook: [opening copy — 2-4 sentences, starts with "you"]
      Body Angle: [promotional angle — offer, seasonal, treatment spotlight]
      Educational Layer: [1-3 sentences of evidence or insight]
      CTA: [single button — invitation language, NEVER "Book now"]
      Tone: [brand-specific — warm/clinical-warm/compassionate]
      Visual Direction: [hero image, product grid, lifestyle shot, pricing table]
      Offer Details: [specific package, price "from EUR X", terms, expiry]
      Notes: [special instructions]

  IF email is a TB_ (text-based) email:
    Add cell note with:
      Content Type: [e.g., Insider Secrets, Storytime POV, Hooked Insight]
      Emotional Register: [e.g., Stillness, Permission, Safety]
      Subject Line: [personal, non-promotional — like a friend texting]
      Preview Text: [conversational, intriguing]
      Hero Header: [personal statement from persona]
      Hook: [personal opening — story, question, reflection]
      Body Angle: [relationship building — tips, stories, validation, education]
      Sign-off: [brand persona signature]
      Tone: [personal letter, conversational, warm]
      Notes: [NO pricing, NO offers, NO product imagery, NO CTA buttons]

Write method:
  -> Use sheets_batch_update with updateCells request
  -> fields: "note"
  -> Target the email row at each send-day column

CRITICAL: All 3 brand agents MUST launch in parallel (single message, 3 Task calls).
```

---

## Phase 7: QC Verification (uses qc-verification skill)

```
QC VERIFICATION SEQUENCE

Invoke the qc-verification skill.
Location: marketing/marketing-calendar/qc/SKILL.md

Launch a QC agent to run the comprehensive checklist.

Tool: Task with subagent_type: "general-purpose"

QC agent receives:
  - The config.json
  - The target month's column range
  - The qc-verification skill checklist (A-F checks)

━━━ A. DATA COMPLETENESS ━━━

  A1. Pop-up every Monday (Spa=89, Aes=171, Slim=249)
  A2. Blog weekly on Thursdays (Spa=92, Aes=172, Slim=250)
  A3. Email weekly with cell notes (Spa=51, Aes=139, Slim=219)
  A4. SMM post on Mon/Wed/Fri ONLY (Spa=53, Aes=141, Slim=221)
  A5. SMM story on Mon/Wed/Fri ONLY (Spa=54, Aes=142, Slim=222)
  A6. WhatsApp 1-2 per month (Spa=52, Aes=140, Slim=220)
  A7. Tablet display has entry (Spa=42)
  A8. Meta evergreen spans full quarter/month
  A9. Google always-on present every Monday

━━━ B. NAMING & FORMAT ━━━

  B1. Future CPL = "XXX" (never actual numbers for planned months)
  B2. Past CPL = actual numbers (X.XX)
  B3. Google naming follows "Search: ... | CPC ..." pattern
  B4. TB_ emails have no pricing in notes
  B5. No bold text in Meta campaign rows
  B6. Every email cell has a cell note (brief) > 20 characters

━━━ C. FORMATTING ━━━

  C1. Font color RGB(0.608, 0.553, 0.514) on all data cells
  C2. Font size consistent within each brand section
  C3. No green highlights (green = manual only)
  C4. Background colors match brand identity (config.json)
  C5. New month formatting matches previous month

━━━ D. ALIGNMENT ━━━

  D1. SMM on weekdays only (Mon-Fri), never Sat/Sun
  D2. SMM starts on Monday column, not Sunday
  D3. Column-to-date alignment correct for target year
  D4. Campaign windows match occasion-calendar.json dates

━━━ E. CROSS-SECTION INTEGRITY ━━━

  E1. No channel data in wrong row sections
  E2. Google campaigns consistent month-to-month (same names)
  E3. Evergreen Meta has no mid-quarter gaps
  E4. Occasion campaigns match occasion-calendar.json

━━━ F. BUDGET VALIDATION ━━━

  F1. No budget gaps within active campaign windows
  F2. Budget amounts match config/budget-allocation.json
  F3. EUR 5/day minimum for Meta campaigns
  F4. Slimming Meta noted as USD account

Report:
  -> PASS: check fully satisfied
  -> WARN: minor issue (flag but don't block)
  -> FAIL: major issue (must fix before completion)

If any FAIL items: fix them, then re-run QC to confirm all pass.
```

---

## Error Handling

```
IF Google Sheets MCP fails:
  -> Log the error
  -> Retry once after 10 seconds
  -> If still failing, check auth: run "go-google-mcp auth login --secrets ~/.go-google-mcp/client_secrets.json"
  -> Report to user with specific error

IF quarterly-marketing-calendar skill fails:
  -> Fall back to mandatory occasion calendar (hardcoded in the skill)
  -> Note in output that occasion research was incomplete
  -> Suggest re-running once the skill is available

IF email-marketing-content-strategy skill not found:
  -> Fall back to references/email-specialist.md (lighter version)
  -> Creative briefs will be simplified (no content type or emotional register)
  -> Flag to user that full email skill was not available

IF social-media-content-strategy skill or pillar files not found:
  -> Fall back to references/smm-specialist.md (basic daily themes)
  -> SMM content will use generic rotation instead of pillar-based
  -> Flag to user

IF budget-allocation skill or config/budget-allocation.json not found:
  -> Fall back to references/budget-allocation.md
  -> Use hardcoded weekly totals from meta-strategist skill
  -> Flag to user that budget computation was approximate

IF a brand agent fails during parallel write:
  -> Other brand agents continue independently
  -> Report which brand failed and which succeeded
  -> Offer to retry the failed brand

IF formatting API call fails:
  -> Values are already written — formatting is cosmetic
  -> Log the failure
  -> Suggest running tools/fix_april_font_colors.py pattern as fallback
```

---

## Troubleshooting

**Issue: "Cannot read previous month data"**
- Check that the month-to-column mapping in config.json is correct
- Verify the spreadsheet ID and sheet name haven't changed
- Try reading a specific known cell (e.g., A1) to confirm sheet access

**Issue: "Font color doesn't match after formatting"**
- Google Sheets sometimes stores color slightly differently than set
- Use `foregroundColorStyle.rgbColor` (not `foregroundColor`) for consistency
- Verify with a sample read after applying formatting

**Issue: "Campaign count doesn't match previous month"**
- Some months naturally have more/fewer campaigns due to occasions
- The QC check flags deviations for review, not automatic rejection
- User decides if deviation is acceptable

**Issue: "Budget doesn't add up"**
- Check that config/budget-allocation.json is loaded
- Verify the 60/40 evergreen/seasonal split was applied to Meta
- Verify the 50/30/20 search/pmax/remarketing split was applied to Google
- Check if Q4 override was triggered (Oct-Dec reads from 2025 spreadsheet)

**Issue: "Email briefs are too simple"**
- Ensure the full email-marketing-content-strategy skill was loaded (not just references/email-specialist.md)
- Each brief should include Content Type, Emotional Register, Subject Line, Preview Text, Hook, Body Angle, CTA, Tone, Visual Direction

**Issue: "SMM rotation feels generic"**
- Ensure the social-media-content-strategy skill was loaded with brand pillar files
- Each post/story should reference a specific pillar and sub-topic from the pillar file
- Entries should include a hook preview, not just a theme label

---

**Version:** 3.0.0
**Last Updated:** 2026-03-31
