# Blog Production RUNBOOK — Carisma Wellness Group

**Version:** 1.0 — April 2026
**Maintained by:** Marketing / Carisma AI
**Pipeline:** Research → Write → QC → Humanize → Internal Link → Format QC → Google Doc → Publish

---

## What This Document Is

This is the single source of truth for producing SEO blog content across all three Carisma brands. Follow it start to finish and you will produce a Gate-3-ready, publication-quality blog post every time — without missing a step.

Every step, gate, tool, and rule is documented here. No other document is required to run the pipeline.

---

## Gold Standard — What Best Looks Like

**Reference post:** [EMS Training Malta vs Gym: What the Science Says](https://docs.google.com/document/d/1bV9TEDeLJ4UXEBlxUKwzRaDFxQcVJn6gMp9i8d-dt0k/edit)
**Brand:** Carisma Slimming

This is the benchmark for every Slimming post. Before Gate 3 approval, ask: "Is this as good as the EMS post?"

What makes it the gold standard:
- Opens with named persona Mariella in a specific, believable scene — not generic "you"
- The pivot: "She doesn't hate her body. She hates the gym. They are not the same thing." Three sentences, one standalone line.
- Cites specific numbers (90% vs 30–40% muscle activation) AND honestly admits what EMS cannot do (cardiovascular health) — that honesty builds more trust than hiding limitations
- Non-scale wins are physical actions, not feelings: "Climbing stairs without thinking about it. Carrying shopping without strain."
- Closing paints an 8-week scene with obstacles removed — specific, time-stamped, visionary
- Final H2 is a permission statement: "You Do Not Have to Love the Gym to Change Your Body"
- Zero em dashes, zero AI sentence starters — reads exactly like Katya

**Full breakdown:** `knowledge/gold-standard-reference.md`

---

## Quick Reference — Brand Personas

| Brand | Persona | Tone | Signature |
|---|---|---|---|
| Carisma Spa & Wellness | Sarah Caballeri | Peaceful, soothing, elegant, sensory | "Peacefully, Sarah" |
| Carisma Aesthetics | Sarah | Warm, confident, medically credible, empowering | "Beautifully yours, Sarah" |
| Carisma Slimming | Katya | Compassionate truth, shame-free, evidence-led, future-focused | "With you every step, Katya" |

**Full brand voice files:** `config/brand-voice/spa.md`, `config/brand-voice/aesthetics.md`, `config/brand-voice/slimming.md`

---

## The Pipeline — 8 Steps

```
┌─────────────────────────────────────────────────────────────────┐
│                  BLOG PRODUCTION PIPELINE                       │
│                                                                 │
│  [1] RESEARCH        seo-blog-content-researcher                │
│         ↓                                                       │
│      ◆ GATE 1: Human approves topic briefs                     │
│         ↓                                                       │
│  [2] WRITE           blog-writer-spa / -aesthetics / -slimming  │
│       (run parallel if multiple brands)                         │
│         ↓                                                       │
│  [3] SEO QC          seo-blog-qc-expert                        │
│         ↓ (fail = return to writer; pass = continue)            │
│      ◆ GATE 2: All 10 SEO dimensions pass                      │
│         ↓                                                       │
│  [4] HUMANIZE        blog-tone-humanizer                        │
│         ↓                                                       │
│  [5] INTERNAL LINK   blog-internal-linker                       │
│         ↓                                                       │
│  [6] FORMAT QC       blog-final-format-qc                       │
│         ↓                                                       │
│  [7] GOOGLE DOC      blog-google-doc-publisher                  │
│         ↓                                                       │
│      ◆ GATE 3: Human final read + CMS upload                   │
│         ↓                                                       │
│  [8] PUBLISH         Human uploads to CMS                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Folder Structure for Each Production Run

When starting a new batch, create the following directory under `.tmp/blog-drafts/`:

```
.tmp/blog-drafts/
  [brand]/
    [month-year]/
      DRAFT-[nn]-[slug].md          ← Initial writer output
      QC-REPORT-[nn]-[slug].md      ← SEO QC audit report(s)
      FINAL-[nn]-[slug].md          ← After humanization, internal links, format QC
```

**Naming examples:**
- `slimming/april-2026/DRAFT-01-fat-freezing-malta.md`
- `slimming/april-2026/FINAL-01-fat-freezing-malta.md`
- `aesthetics/april-2026/DRAFT-01-profhilo-malta.md`

**Rule:** FINAL.md files are the source of truth for the Google Doc publisher and the hyperlink script. Never modify a FINAL.md after the Google Doc is created unless you recreate the Doc.

---

## Step-by-Step Execution

---

### STEP 1 — Research (`seo-blog-content-researcher`)

**Invoke:** Skill `seo-blog-content-researcher`

**Inputs required:**
- Which brand(s)? (spa / aesthetics / slimming / all)
- Time period? (monthly / quarterly)
- Existing published content? (avoid duplicate topics)
- Active offers? (check `config/offers.json`)

**What the researcher delivers:**
- Ranked list of up to 8 topic briefs
- Each brief contains: primary keyword, supporting keywords, H2 structure, word count target, internal link suggestions, Malta signals, evidence sources, CTA/offer

**Skill file:** `marketing/Blogs/skills/01-seo-blog-content-researcher.md`

---

### ◆ GATE 1 — Topic Approval (Human)

Present the ranked topic list to the human (Mert or CMO). Wait for explicit approval before proceeding.

**What to present:**
1. Ranked topic list with primary keywords
2. Why each was selected (search intent, Malta relevance, content gap)
3. Recommended brand assignment
4. Proposed publication schedule

**Required before proceeding:** Explicit "yes" or approval per topic. Do NOT pass to writers without Gate 1 approval.

---

### STEP 2 — Write

**Invoke:** Appropriate brand writer skill for each approved brief

| Brand | Skill |
|---|---|
| Carisma Spa & Wellness | `blog-writer-spa` |
| Carisma Aesthetics | `blog-writer-aesthetics` |
| Carisma Slimming | `blog-writer-slimming` |

**Run writers in parallel** for multiple brands/posts. Each writer receives the full topic brief from Step 1.

**Writer outputs (save as DRAFT-[nn]-[slug].md):**
- Meta title, meta description, URL slug
- Full article body (H1 through CTA + signature)
- Internal links placed list
- Medical disclaimers check
- Word count, YMYL source count
- Status: `Ready for seo-blog-qc-expert review`

**Minimum word counts (non-negotiable):**
- Spa: 1,400 words
- Aesthetics: 1,600 words
- Slimming: 1,700 words

**Skill files:**
- `marketing/Blogs/skills/02a-blog-writer-spa.md`
- `marketing/Blogs/skills/02b-blog-writer-aesthetics.md`
- `marketing/Blogs/skills/02c-blog-writer-slimming.md`

---

### STEP 3 — SEO QC (`seo-blog-qc-expert`)

**Invoke:** Skill `seo-blog-qc-expert`

**Input:** DRAFT-[nn]-[slug].md file

**What the QC expert audits — 10 dimensions:**
1. Title & Meta Title (50–60 chars, keyword in first 60%)
2. Meta Description (145–160 chars, keyword, CTA)
3. H1 Tag (one only, primary keyword present, under 70 chars)
4. Heading Structure (H1→H2→H3, 4+ H2s, FAQ H2 present)
5. Keyword Usage & Density (0.8–1.5%, keyword in H1/intro/2+ H2s/closing)
6. Content Depth & E-E-A-T (word count, clinical references, Malta context)
7. Internal Linking (2+ links, 1 to booking page, descriptive anchors)
8. Local SEO Signals (Malta in H1/intro/H2/body, natural not bolted-on)
9. AEO Readiness (4+ FAQs in H3 format, 40–100 words each)
10. CTA & Conversion (specific CTA, present at end + once mid-article)

**Outcomes:**
- **PASS / CONDITIONAL PASS** → Proceed to Step 4 (humanizer)
- **FAIL** → Return to brand writer with the audit report for revision

**Revision cycle tracking:**
- Cycle 1 (expected): Common for minor fixes
- Cycle 2 (acceptable): Second attempt
- Cycle 3+: Escalate to human — something is wrong with the brief

**Skill file:** `marketing/Blogs/skills/03-seo-blog-qc-expert.md`

---

### ◆ GATE 2 — SEO QC Pass (Automated)

All 10 dimensions must score PASS or CONDITIONAL PASS. No human action required — this gate is managed by `seo-blog-qc-expert`. A post only proceeds when the QC expert marks it `→ Send to blog-tone-humanizer`.

---

### STEP 4 — Humanize (`blog-tone-humanizer`)

**Invoke:** Skill `blog-tone-humanizer`

**Input:** SEO-approved DRAFT-[nn]-[slug].md

**What the humanizer does:**
1. Strips all AI writing signatures (filler openers, padding phrases, robotic structures)
2. Aligns tone precisely to the brand voice (Spa/Aesthetics/Slimming)
3. Applies Malta localisation check
4. Readability sweep (Grade 8–10 Flesch-Kincaid, contractions, paragraph cap)
5. Final humanisation pass (memorable sentence check, CTA as invitation not demand)

**Critical rules:**
- Does NOT change keyword placement, heading structure, meta data, or internal links
- If it finds SEO issues, routes back to `seo-blog-qc-expert` — does not fix SEO itself
- **Em dashes (—): ZERO tolerance** — replaced in Step 6 if any survive

**Output:** Save humanized version as FINAL-[nn]-[slug].md (replaces DRAFT file, or create new FINAL file)

**Skill file:** `marketing/Blogs/skills/04-blog-tone-humanizer.md`

---

### STEP 5 — Internal Linking (`blog-internal-linker`)

**Invoke:** Skill `blog-internal-linker`

**Input:** FINAL-[nn]-[slug].md (humanized)

**Rules:**
- First occurrence only — never link the same destination URL twice
- Never link in headings (H1/H2/H3)
- 3–6 internal links total per post
- Do not link the post's own primary keyword (the post IS that page)
- Anchor text = natural keyword match, never "click here" or "learn more"

**Process:**
1. Audit any existing links the writer placed
2. Scan body text for keyword map matches (see `knowledge/internal-link-map.md`)
3. Select first occurrence of each qualifying keyword
4. Apply links to reach 3–6 total
5. Overwrite FINAL-[nn]-[slug].md with links applied

**Full keyword→URL map:** `marketing/Blogs/knowledge/internal-link-map.md`

**Skill file:** `marketing/Blogs/skills/05-blog-internal-linker.md`

---

### STEP 6 — Format QC (`blog-final-format-qc`)

**Invoke:** Skill `blog-final-format-qc`

**Input:** FINAL-[nn]-[slug].md (with internal links)

**What it sweeps — 7 checks:**
1. **Em dashes (ZERO tolerance)** — replaced with period, comma, colon, or rewritten
2. **Raw markdown in body prose** — `##`/`###` inside paragraphs removed
3. **Bold overuse** — max 4 bold phrases per H2 section; consecutive bold removed
4. **AI sentence starters** — "Here's what you need to know:", "Simply put,", etc. removed
5. **Ellipsis overuse** — zero `...` or `…` in slimming/medical posts
6. **Parenthetical overuse** — max 2 parentheticals per H2 section
7. **Robotic parallel openers** — 3+ consecutive same-start sentences varied

**Does NOT touch:** Keyword placement, internal links, heading structure, meta data, sentence meaning.

**Overwrites FINAL-[nn]-[slug].md in place.**

**Skill file:** `marketing/Blogs/skills/06-blog-final-format-qc.md`

---

### STEP 7 — Google Doc Creation (`blog-google-doc-publisher`)

**Invoke:** Skill `blog-google-doc-publisher`

**Input:** Clean, fully-formatted FINAL-[nn]-[slug].md

**Step 7a — Create Google Doc:**

1. Search Drive for folder `Carisma Blog Drafts` using `mcp__google-workspace__drive_find_files`
2. If not found: note limitation (see below) and proceed
3. Call `mcp__google-workspace__docs_create_document` with document title = meta title
4. Document structure inside the Doc:

```
[BLOG DRAFT — AWAITING CMS UPLOAD]

BRAND: [brand name]
META TITLE: [meta title]
META DESCRIPTION: [meta description]
URL SLUG: [slug]
PRIMARY KEYWORD: [keyword]
AUTHOR: Sarah / Katya
STATUS: Awaiting Gate 3 approval

─────────────────────────────────────

[Full blog post body]
```

**Formatting rules:**
- Strip `##`, `###`, `#` prefix markers (heading text stays, marker removed)
- Bold `**text**` stays as-is
- Markdown links `[anchor text](URL)` → convert to `anchor text [→ URL]` format (the hyperlink script fixes these)

**Known MCP limitations (as of April 2026):**
- `drive_create_folder` — denied. If folder not found, create doc at Drive root and note this in output.
- `drive_update_file` — denied. Cannot move docs between folders automatically. Human must drag doc to `Carisma Blog Drafts` folder manually.

**Step 7b — Add Real Hyperlinks:**

After the doc is created, run the hyperlink Python script:

```bash
python3 tools/add_docs_hyperlinks.py
```

**Before running:** Update `DOCS_CONFIG` in the script with the new doc ID(s) and their FINAL.md paths:

```python
DOCS_CONFIG = [
    {
        "doc_id": "[new doc ID from the URL]",
        "title": "Post N — [Description]",
        "final_md": f"{BASE_DIR}/FINAL-[nn]-[slug].md",
    },
]
```

The script will:
1. Extract all `[anchor text](URL)` pairs from the FINAL.md (deduplicated)
2. Find all `anchor text [→ URL]` occurrences in the Google Doc
3. Apply `updateTextStyle` with `link.url` to the anchor text
4. Delete the ` [→ URL]` suffix
5. Process in reverse doc order so deletions don't shift earlier positions

**Common hyperlink script errors and fixes:**

| Error | Fix |
|---|---|
| "NOT FOUND" for all links after first run | Expected — links already applied (idempotent) |
| Text corruption in the doc | Deduplicate anchor entries — FINAL.md has same link 3× |
| ASCII `->` not matched | Regex already handles both `→` and `->` |
| `HttpError 401` | Run `go-google-mcp auth login --secrets ~/.go-google-mcp/client_secrets.json` to re-auth |

**Tool location:** `tools/add_docs_hyperlinks.py`
**Credentials:** `~/.go-google-mcp/token.json` + `~/.go-google-mcp/client_secrets.json`

**Record the Google Doc URL** — this is the Gate 3 handoff artefact.

**Skill file:** `marketing/Blogs/skills/07-blog-google-doc-publisher.md`

---

### ◆ GATE 3 — Final Human Review (Human)

Present the Gate 3 package to the human:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GATE 3 PACKAGE — READY FOR HUMAN REVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Post N: [Title]
  Brand:    [Brand]
  Keyword:  [Primary keyword]
  Words:    [word count]
  Google Doc: [URL]
  Slug:     /blog/[slug]
  Status:   Awaiting Gate 3 approval
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

The human reads the Google Doc. If approved, proceeds to CMS upload using the Publication Checklist.

---

### STEP 8 — CMS Publish (Human)

**Full checklist:** `marketing/Blogs/knowledge/publication-checklist.md`

**Quick summary — CMS upload steps:**
- [ ] Meta title (verify character count in CMS preview — 50–60 chars)
- [ ] Meta description (verify 145–160 chars)
- [ ] URL slug: `/blog/[slug]`
- [ ] H1 set (not auto-generated from page title)
- [ ] H2/H3 heading tags applied (not bold text)
- [ ] All internal links present and tested (no 404s)
- [ ] Featured image: 800×400px min, alt text with primary keyword
- [ ] Author: Sarah or Katya (appropriate persona)
- [ ] Category tag set
- [ ] FAQ schema added for FAQ section
- [ ] Article schema applied
- [ ] URL submitted to Google Search Console after publish
- [ ] Internal link from at least 1 existing published post added
- [ ] Post added to content calendar tracker
- [ ] URL logged in rank tracker

---

## Monthly Production Schedule

Default cadence across all three brands:

| Week | Brand | Posts |
|---|---|---|
| Week 1 | Aesthetics | 1 post |
| Week 2 | Slimming + Spa | 1 post each |
| Week 3 | Aesthetics | 1 post |
| Week 4 | Spa | 1 post |

**Total: 5 posts/month** (2× Aesthetics, 2× Spa, 1× Slimming)

Adjust based on:
- Active campaign priorities
- Seasonal demand (summer = slimming/beach, January = new year, March–May = weddings)
- Active offers from `config/offers.json`
- Competitive content gaps

---

## Parallel Execution (Multiple Posts in One Run)

When producing multiple posts in the same batch:

1. Research all brands in one researcher session
2. Brief all writers simultaneously (parallel invocation at Step 2)
3. QC each draft as it completes — don't wait for all drafts
4. Humanize as QC approvals come in
5. Internal Link → Format QC → Google Doc for each post as it reaches Step 5

A 4-post batch can complete in 5 pipeline layers instead of 4 × 8 = 32 sequential steps.

---

## Revision Cycle Log Template

Track revision cycles per post. Escalate to human at Cycle 3+:

```
Post: [title]
Cycle 1: [date] — FAIL — Dimensions: [n, n] — Returned to writer
Cycle 2: [date] — PASS — Sent to humanizer
```

---

## Pipeline Status Tracker Template

Use this when running a multi-post batch:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PIPELINE STATUS — [Month Year]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Post                      | Brand      | Stage       | Status
─────────────────────────────────────────────────────
[Title]                   | Slimming   | SEO QC      | ✅ PASS → humanizer
[Title]                   | Aesthetics | Writing     | ⏳ In progress
[Title]                   | Spa        | Humanizer   | ✅ PASS → internal links
[Title]                   | Slimming   | SEO QC      | ❌ FAIL → writer (cycle 1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Troubleshooting Guide

| Problem | Resolution |
|---|---|
| Writer submits without full brief | Return to `seo-blog-content-researcher` for a brief first |
| QC fails same dimension twice | Escalate to human — brief may be structurally flawed |
| Humanizer flags SEO issue | Route back to `seo-blog-qc-expert` — do not bypass |
| Post goes live without Gate 3 | Critical process failure — log in `miscellaneous/learnings/LEARNINGS.md` |
| Brief has no internal link suggestions | Researcher must provide them — brand writer cannot add links without context |
| Hyperlink script: `HttpError 401` | Re-auth: `go-google-mcp auth login --secrets ~/.go-google-mcp/client_secrets.json` |
| Hyperlink script: text corruption | Deduplication missing — check that `seen` set is active in `process_doc()` |
| Google Doc has wrong link format | Script was run on a doc already linked — "NOT FOUND" is normal/expected |
| `drive_create_folder` denied | Known MCP limitation — create doc at Drive root, move manually |
| `drive_update_file` denied | Known MCP limitation — move doc to `Carisma Blog Drafts` manually |

---

## Reference Files in This Folder

| File | Purpose |
|---|---|
| `RUNBOOK.md` | This document — master pipeline guide |
| `skills/00-blog-production-pipeline.md` | Pipeline orchestrator skill |
| `skills/01-seo-blog-content-researcher.md` | Research skill |
| `skills/02a-blog-writer-spa.md` | Spa writer skill |
| `skills/02b-blog-writer-aesthetics.md` | Aesthetics writer skill |
| `skills/02c-blog-writer-slimming.md` | Slimming writer skill |
| `skills/03-seo-blog-qc-expert.md` | SEO QC audit skill |
| `skills/04-blog-tone-humanizer.md` | Humanization skill |
| `skills/05-blog-internal-linker.md` | Internal linking skill |
| `skills/06-blog-final-format-qc.md` | Format QC skill |
| `skills/07-blog-google-doc-publisher.md` | Google Doc creation skill |
| `knowledge/brand-voice-summary.md` | Quick brand voice reference for all 3 brands |
| `knowledge/internal-link-map.md` | Keyword → URL map for all 3 brands |
| `knowledge/seo-standards.md` | 10-dimension SEO audit criteria (reference) |
| `knowledge/gate-protocols.md` | Gate 1, 2, 3 protocols in detail |
| `knowledge/publication-checklist.md` | CMS upload checklist |
| `knowledge/tool-reference.md` | add_docs_hyperlinks.py and other tool docs |

---

## Completed Runs — Archive Log

When a batch completes, add an entry here for reference:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RUN: April 2026 — Carisma Slimming (4 posts)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Post 1: Fat Freezing Malta
  FINAL: .tmp/blog-drafts/slimming/april-2026/FINAL-01-fat-freezing-malta.md
  Google Doc: https://docs.google.com/document/d/1BypMbdCTbTq8AKgWDsrWFWQmZCpKDaQZUkHi5A7rd8A/edit
  Slug: /blog/fat-freezing-malta
  Status: ✅ Gate 3 ready

Post 2: Wedding Weight Loss Malta
  FINAL: .tmp/blog-drafts/slimming/april-2026/FINAL-02-wedding-weight-loss-malta.md
  Google Doc: https://docs.google.com/document/d/1sxmSTHQAuEeeR3zG9XGFLva48GJtNWi0IjTenjBFxTw/edit
  Slug: /blog/wedding-weight-loss-malta
  Status: ✅ Gate 3 ready

Post 3: Menopause Belly Fat Malta
  FINAL: .tmp/blog-drafts/slimming/april-2026/FINAL-03-menopause-belly-fat-malta.md
  Google Doc: https://docs.google.com/document/d/1bK5vzYph9hQMHmj9nCgzYV0twP-5r-yGuMdOwUnxsU0/edit
  Slug: /blog/menopause-belly-fat-malta
  Status: ✅ Gate 3 ready

Post 4: EMS vs Gym Malta
  FINAL: .tmp/blog-drafts/slimming/april-2026/FINAL-04-ems-vs-gym-malta.md
  Google Doc: https://docs.google.com/document/d/1bV9TEDeLJ4UXEBlxUKwzRaDFxQcVJn6gMp9i8d-dt0k/edit
  Slug: /blog/ems-vs-gym-malta
  Status: ✅ Gate 3 ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RUN: April 2026 — All 3 Brands (12 posts, 4 per brand)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CARISMA SPA & WELLNESS

Post 1: What Is a Hammam? The Ancient Bathing Ritual Explained
  FINAL: .tmp/blog-drafts/spa/april-2026/FINAL-01-what-is-a-hammam.md
  Google Doc: https://docs.google.com/document/d/1PYWdt7KU-O4dPde5v0U3gucXMgrnDG5V_bdolBwjqLI/edit
  Slug: /blog/what-is-a-hammam
  Words: 1,625 | QC cycles: 1 | Links: 3
  Status: ✅ Gate 3 ready

Post 2: Couples Spa Day Malta: The Perfect Experience for Two
  FINAL: .tmp/blog-drafts/spa/april-2026/FINAL-02-couples-spa-day-malta.md
  Google Doc: https://docs.google.com/document/d/1xT0kPLOTyZ2vKHH0cw4xzD-p2Ouy_anTAF42JLO8n7M/edit
  Slug: /blog/couples-spa-day-malta
  Words: ~1,520 | QC cycles: 1 | Links: 3
  Status: ✅ Gate 3 ready

Post 3: Benefits of a Spa Day: What Science Says About Rest and Recovery
  FINAL: .tmp/blog-drafts/spa/april-2026/FINAL-03-benefits-of-a-spa-day.md
  Google Doc: https://docs.google.com/document/d/1EMs-k-6PxiWB5tc5JLEDdKEa9P5Nnqu8j7DtABQY4CU/edit
  Slug: /blog/benefits-of-a-spa-day
  Words: ~1,540 | QC cycles: 1 | Links: 3
  Status: ✅ Gate 3 ready

Post 4: Spa Gift Vouchers Malta: The Thoughtful Gift That Lasts
  FINAL: .tmp/blog-drafts/spa/april-2026/FINAL-04-spa-gift-voucher-malta.md
  Google Doc: https://docs.google.com/document/d/1Rg1EcxPjCdFNxAr3kmhD6tJ1ECJXFWkwIWEkAKM64Qo/edit
  Slug: /blog/spa-gift-voucher-malta
  Words: 1,623 | QC cycles: 1 | Links: 3
  Status: ✅ Gate 3 ready

CARISMA AESTHETICS

Post 5: How Does Botox Work? An Honest, Science-Led Guide
  FINAL: .tmp/blog-drafts/aesthetics/april-2026/FINAL-01-how-does-botox-work-malta.md
  Google Doc: https://docs.google.com/document/d/1TsM40f08Ksfq2atZ1pxkNt2Jwds8tvlBh1LTn3dH2_c/edit
  Slug: /blog/how-does-botox-work-malta
  Words: 1,870 | QC cycles: 1 | Links: 3
  Status: ✅ Gate 3 ready

Post 6: Profhilo vs Botox Malta: Which Treatment Is Right for You?
  FINAL: .tmp/blog-drafts/aesthetics/april-2026/FINAL-02-profhilo-vs-botox-malta.md
  Google Doc: https://docs.google.com/document/d/1J5x3TdtaGxeKrxd1EYgQCOl6pdonTrs2BoW-GXcQjHE/edit
  Slug: /blog/profhilo-vs-botox-malta
  Words: 1,993 | QC cycles: 1 | Links: 3
  Status: ✅ Gate 3 ready

Post 7: Fat Dissolving Injections Malta: What to Expect and Who They're For
  FINAL: .tmp/blog-drafts/aesthetics/april-2026/FINAL-03-fat-dissolving-injections-malta.md
  Google Doc: https://docs.google.com/document/d/1GsbUu2uY7SUnP1K0OBN8k6Pt24nR9rO2Ogrku5AcC2E/edit
  Slug: /blog/fat-dissolving-injections-malta
  Words: ~1,790 | QC cycles: 1 | Links: 3
  Status: ✅ Gate 3 ready

Post 8: Microneedling vs Chemical Peel Malta: Which One Is Right for You?
  FINAL: .tmp/blog-drafts/aesthetics/april-2026/FINAL-04-microneedling-vs-chemical-peel-malta.md
  Google Doc: https://docs.google.com/document/d/19QAhZz55WAQB64JS_JE1e4FpMnV5LfpSh1YnD7eSLX8/edit
  Slug: /blog/microneedling-vs-chemical-peel-malta
  Words: 2,046 | QC cycles: 1 | Links: 3
  Status: ✅ Gate 3 ready

CARISMA SLIMMING

Post 9: What Is Medical Weight Loss — and Is It Right for You?
  FINAL: .tmp/blog-drafts/slimming/april-2026/FINAL-05-medical-weight-loss-malta.md
  Google Doc: https://docs.google.com/document/d/1pcIhHgfClAsSzwO7KbJqSgORLJZfsFtmYdbG2HNSqrM/edit
  Slug: /blog/medical-weight-loss-malta
  Words: 2,168 | QC cycles: 1 | Links: 4
  Status: ✅ Gate 3 ready

Post 10: Cellulite Treatments in Malta — What Actually Works and What Doesn't
  FINAL: .tmp/blog-drafts/slimming/april-2026/FINAL-06-anti-cellulite-treatment-malta.md
  Google Doc: https://docs.google.com/document/d/18PQuK5BcPd2w5QuFyuvpOnAfuURf3zai0zb3SdSLPaY/edit
  Slug: /blog/anti-cellulite-treatment-malta
  Words: 2,247 | QC cycles: 1 | Links: 3
  Status: ✅ Gate 3 ready

Post 11: Lymphatic Drainage in Malta — What It Does, Who It's For, and What to Expect
  FINAL: .tmp/blog-drafts/slimming/april-2026/FINAL-07-lymphatic-drainage-malta.md
  Google Doc: https://docs.google.com/document/d/1dye-LPdypf3yhw-VMcYJz_BOeMHGelivCVIucBllRsg/edit
  Slug: /blog/lymphatic-drainage-massage-malta
  Words: 1,957 | QC cycles: 1 | Links: 4
  Status: ✅ Gate 3 ready

Post 12: Loose Skin After Weight Loss — What Causes It and What Can Actually Help
  FINAL: .tmp/blog-drafts/slimming/april-2026/FINAL-08-skin-tightening-treatment-malta.md
  Google Doc: https://docs.google.com/document/d/1LHnTbl4QMzYSmBSuhsaPVoOPeskGNXo1X5sfauC-o3w/edit
  Slug: /blog/skin-tightening-treatment-malta
  Words: 2,202 | QC cycles: 1 | Links: 3
  Status: ✅ Gate 3 ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RUN: May 2026 — All 3 Brands (12 posts, 4 per brand)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CARISMA SPA & WELLNESS

Post 1: What Is a Hammam? The Ancient Bathing Ritual Malta Women Discover
  FINAL: .tmp/blog-drafts/spa/may-2026/FINAL-01-hammam-malta.md
  Google Doc: https://docs.google.com/document/d/1d46AEYRN7eaRM0jhQ5tQOY87bFmbFBWHZ05ZB08R1ww/edit
  Slug: /blog/hammam-malta
  Words: 1,762 | QC cycles: 1 | Links: 3
  Status: ✅ Gate 3 ready

Post 2: Can a Spa Day Actually Help with Stress? What the Research Says
  FINAL: .tmp/blog-drafts/spa/may-2026/FINAL-02-spa-stress-anxiety-malta.md
  Google Doc: https://docs.google.com/document/d/1bAvDLBjv8gNpKDAjMK0cO0Ojq3KOZ_eMWfBZ2y80fLk/edit
  Slug: /blog/spa-stress-anxiety-malta
  Words: 1,697 | QC cycles: 1 | Links: 3
  Status: ✅ Gate 3 ready

Post 3: Why a Spa Hen Party in Malta Is the Best Bridal Send-Off You Can Plan
  FINAL: .tmp/blog-drafts/spa/may-2026/FINAL-03-hen-party-spa-malta.md
  Google Doc: https://docs.google.com/document/d/1PDuzTLhtRGkYdQoXQxZ6A5s_7oXAN6ZefwZHIa8usJo/edit
  Slug: /blog/hen-party-spa-malta
  Words: 1,802 | QC cycles: 1 | Links: 5
  Status: ✅ Gate 3 ready

Post 4: Couples Spa Malta: What to Expect on a Romantic Day Out
  FINAL: .tmp/blog-drafts/spa/may-2026/FINAL-04-couples-spa-malta.md
  Google Doc: https://docs.google.com/document/d/1HyBn5wQDNJg_9MtZV4AwwNcHW56AMZsUuUO25O69TuU/edit
  Slug: /blog/couples-spa-malta
  Words: 1,477 | QC cycles: 1 | Links: 4
  Status: ✅ Gate 3 ready

CARISMA AESTHETICS

Post 5: What Is Profhilo? Malta's Favourite Skin Booster Explained Honestly
  FINAL: .tmp/blog-drafts/aesthetics/may-2026/FINAL-01-profhilo-malta.md
  Google Doc: https://docs.google.com/document/d/1AxNi_dnEBPhMF_82mJLNUfQLBDE6ZPFHn3dZdJ5kvwc/edit
  Slug: /blog/profhilo-malta
  Words: 1,960 | QC cycles: 1 | Links: 5
  Status: ✅ Gate 3 ready

Post 6: Lip Fillers in Malta: What to Know Before Your First Appointment
  FINAL: .tmp/blog-drafts/aesthetics/may-2026/FINAL-02-lip-fillers-malta.md
  Google Doc: https://docs.google.com/document/d/1ThFbo7Gb7kZBZlzzV1AveF4NLZ9CGYl4mfQAf1wo1N8/edit
  Slug: /blog/lip-fillers-malta
  Words: 1,720 | QC cycles: 1 | Links: 3
  Status: ✅ Gate 3 ready

Post 7: Botox vs Fillers: Which Treatment Is Right for You? An Honest Guide
  FINAL: .tmp/blog-drafts/aesthetics/may-2026/FINAL-03-botox-vs-fillers-malta.md
  Google Doc: https://docs.google.com/document/d/1ENFq-piIBJwssYF7z9zJDi2fWLMX6DjXfP4pyY9eSF0/edit
  Slug: /blog/botox-vs-fillers-malta
  Words: 1,961 | QC cycles: 2 | Links: 5
  Status: ✅ Gate 3 ready

Post 8: Is Laser Hair Removal Worth It? An Honest Guide for Women in Malta
  FINAL: .tmp/blog-drafts/aesthetics/may-2026/FINAL-04-laser-hair-removal-malta.md
  Google Doc: https://docs.google.com/document/d/16z8zun0UK-IrpD8HB5PLcDkMAeYI2YihSaza8LuMHGQ/edit
  Slug: /blog/laser-hair-removal-malta
  Words: 2,012 | QC cycles: 1 | Links: 3
  Status: ✅ Gate 3 ready

CARISMA SLIMMING

Post 9: Can You Actually Get Rid of Cellulite? What Science Says
  FINAL: .tmp/blog-drafts/slimming/may-2026/FINAL-01-cellulite-treatment-malta.md
  Google Doc: https://docs.google.com/document/d/1495Isy2nlfafboYctAaDZwdS2dJMyYbD-q6ilpnpvlU/edit
  Slug: /blog/cellulite-treatment-malta
  Words: 2,143 | QC cycles: 1 | Links: 4
  Status: ✅ Gate 3 ready

Post 10: Loose Skin After Weight Loss: What Helps, What Doesn't
  FINAL: .tmp/blog-drafts/slimming/may-2026/FINAL-02-skin-tightening-weight-loss-malta.md
  Google Doc: https://docs.google.com/document/d/1FrZ8GWaYeIOHsRa5eeFieDH4O8y-OkVd98vLz2-vPUw/edit
  Slug: /blog/skin-tightening-after-weight-loss-malta
  Words: 2,041 | QC cycles: 1 | Links: 5
  Status: ✅ Gate 3 ready

Post 11: Lymphatic Drainage Massage in Malta: What It Is and Why It Works
  FINAL: .tmp/blog-drafts/slimming/may-2026/FINAL-03-lymphatic-drainage-malta.md
  Google Doc: https://docs.google.com/document/d/1zpPHIqp3dCDPuUzcG1aQTcCedylcpJZvm_82ob63JFU/edit
  Slug: /blog/lymphatic-drainage-malta
  Words: 1,870 | QC cycles: 2 | Links: 5
  Status: ✅ Gate 3 ready

Post 12: Medical Weight Loss in Malta: Is It Right for You? An Honest Guide
  FINAL: .tmp/blog-drafts/slimming/may-2026/FINAL-04-medical-weight-loss-malta.md
  Google Doc: https://docs.google.com/document/d/1ji4VZyEecO4Ifj5W0PUPlk3uYl0_ukVG4Y7Yofu_Fog/edit
  Slug: /blog/medical-weight-loss-malta
  Words: 2,231 | QC cycles: 1 | Links: 3
  Status: ✅ Gate 3 ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RUN: June 2026 — All 3 Brands (12 posts, 4 per brand)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CARISMA SPA & WELLNESS

Post 1: Which Type of Massage Is Right for You? A Guide for Women in Malta
  FINAL: .tmp/blog-drafts/spa/june-2026/FINAL-01-types-of-massage-malta.md
  Google Doc: https://docs.google.com/document/d/1NkaAHoZHqf86hb991bDS23AkVoSx-R_1M7PmKrcj5vQ/edit
  Slug: /blog/types-of-massage-malta
  Words: ~1,670 | QC cycles: 2 | Links: 3
  Status: ✅ Gate 3 ready

Post 2: What Type of Facial Do You Actually Need? A Malta Spa Guide
  FINAL: .tmp/blog-drafts/spa/june-2026/FINAL-02-facial-treatment-malta.md
  Google Doc: https://docs.google.com/document/d/16hScJ9cDAQ61fD8nu43r-ttnwPolgdg-A8gCgmcuhwA/edit
  Slug: /blog/facial-treatment-malta
  Words: ~1,713 | QC cycles: 1 | Links: 3
  Status: ✅ Gate 3 ready

Post 3: What Is HydraFacial? Malta's Most-Booked Facial Treatment Explained
  FINAL: .tmp/blog-drafts/spa/june-2026/FINAL-03-hydrafacial-spa-malta.md
  Google Doc: https://docs.google.com/document/d/1cY9zlaOUH0loKJmezPTI7KZKNlKXrx_aV5Y688tnfDA/edit
  Slug: /blog/hydrafacial-spa-malta
  Words: ~1,571 | QC cycles: 2 | Links: 6
  Status: ✅ Gate 3 ready

Post 4: Why Spa Gift Vouchers Are the Best Present You Can Give in Malta
  FINAL: .tmp/blog-drafts/spa/june-2026/FINAL-04-spa-gift-vouchers-malta.md
  Google Doc: https://docs.google.com/document/d/1t0QjuXOmnh0qCmr3h8oY2g4WfgnC6ce1CdvGTuIHIaY/edit
  Slug: /blog/spa-gift-vouchers-malta
  Words: 1,614 | QC cycles: 2 | Links: 5
  Status: ✅ Gate 3 ready

CARISMA AESTHETICS

Post 5: Thread Lift Malta: The Non-Surgical Facelift Explained Honestly
  FINAL: .tmp/blog-drafts/aesthetics/june-2026/FINAL-01-thread-lift-malta.md
  Google Doc: https://docs.google.com/document/d/1gyZ9uMwdWpQSL1JwVSj5ky9cRrWgn8OLzbXyek51zUM/edit
  Slug: /blog/thread-lift-malta
  Words: ~1,870 | QC cycles: 1 | Links: 3
  Status: ✅ Gate 3 ready

Post 6: What Is Microneedling? An Honest Guide for Women in Malta
  FINAL: .tmp/blog-drafts/aesthetics/june-2026/FINAL-02-microneedling-malta.md
  Google Doc: https://docs.google.com/document/d/1Z6NuHO95D-pPGBgwUauhH-IhEKOr6VcNFrLg0hiKwq4/edit
  Slug: /blog/microneedling-malta
  Words: 1,987 | QC cycles: 1 | Links: 3
  Status: ✅ Gate 3 ready

Post 7: PRP Treatment Malta: What Platelet-Rich Plasma Does for Your Skin
  FINAL: .tmp/blog-drafts/aesthetics/june-2026/FINAL-03-prp-facial-malta.md
  Google Doc: https://docs.google.com/document/d/1Y_JIxU8DcMPdN1gfb6VOGbzCX85J34VdCk-izKQDK6A/edit
  Slug: /blog/prp-facial-malta
  Words: 1,785 | QC cycles: 1 | Links: 5
  Status: ✅ Gate 3 ready

Post 8: What Is Mesotherapy? Malta's Micro-Injection Skin Treatment Explained
  FINAL: .tmp/blog-drafts/aesthetics/june-2026/FINAL-04-mesotherapy-malta.md
  Google Doc: https://docs.google.com/document/d/1TCSvfOPKZQcncRJmeibqE9ZKvuU1uU1MYRVwRcQWNnc/edit
  Slug: /blog/mesotherapy-malta
  Words: ~1,860 | QC cycles: 1 | Links: 5
  Status: ✅ Gate 3 ready

CARISMA SLIMMING

Post 9: Fat Dissolving Injections in Malta: What They Are and Whether They Work
  FINAL: .tmp/blog-drafts/slimming/june-2026/FINAL-01-fat-dissolving-injections-malta.md
  Google Doc: https://docs.google.com/document/d/1Mrw4kJRMxWj7yTcYn5Zcg3njHZ7YNhTVWWWJBJ-vYyE/edit
  Slug: /blog/fat-dissolving-injections-malta
  Words: 2,065 | QC cycles: 1 | Links: 5
  YMYL: ✅ compliant
  Status: ✅ Gate 3 ready

Post 10: Postpartum Weight Loss in Malta: What Your Body Actually Needs
  FINAL: .tmp/blog-drafts/slimming/june-2026/FINAL-02-postpartum-weight-loss-malta.md
  Google Doc: https://docs.google.com/document/d/1yvtBrgaCAHnmFeqppCNpPvSOCjMXGSQTEnrY_-yruIE/edit
  Slug: /blog/postpartum-weight-loss-malta
  Words: ~2,034 | QC cycles: 2 | Links: 4
  YMYL: ✅ compliant
  Status: ✅ Gate 3 ready

Post 11: Why Diets Don't Work: The Science Behind Weight Loss Resistance
  FINAL: .tmp/blog-drafts/slimming/june-2026/FINAL-03-why-diets-dont-work.md
  Google Doc: https://docs.google.com/document/d/1arZO9i18NLvFeeYnCAI0F3yTww81ZS1WUbfvMXj_uuQ/edit
  Slug: /blog/why-diets-dont-work
  Words: 2,414 | QC cycles: 1 | Links: 4
  YMYL: ✅ compliant
  Status: ✅ Gate 3 ready

Post 12: What Is EMSculpt? The Body Sculpting Treatment Malta Women Are Booking
  FINAL: .tmp/blog-drafts/slimming/june-2026/FINAL-04-emsculpt-malta.md
  Google Doc: https://docs.google.com/document/d/1GxGteWVbeVwwLaVqxlxSet7UpeQnYYKTc2S2eZFPdTM/edit
  Slug: /blog/emsculpt-malta
  Words: 2,147 | QC cycles: 1 | Links: 3
  YMYL: ✅ compliant
  Status: ✅ Gate 3 ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RUN: July 2026 — All 3 Brands (12 posts, 4 per brand)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CARISMA SPA & WELLNESS

Post 1: Swedish Massage Malta: What It Is and Why It Works
  FINAL: .tmp/blog-drafts/spa/july-2026/FINAL-01-swedish-massage-malta.md
  Google Doc: https://docs.google.com/document/d/1YlDRa3h9yYxCf4Xmj_GJPPAOY1srV1O5i2RcYfz1wqI/edit
  Slug: /blog/swedish-massage-malta
  Publish: July 3, 2026
  Words: 1,841 | QC cycles: 1 | Links: 3
  Status: ✅ Gate 3 ready

Post 2: Hot Stone Massage Malta: Benefits, Preparation, and What to Expect
  FINAL: .tmp/blog-drafts/spa/july-2026/FINAL-02-hot-stone-massage-malta.md
  Google Doc: https://docs.google.com/document/d/1IPDe1n8WJBcfU1S9mTGEcPr84G23SNjRTMNdR0cwm5g/edit
  Slug: /blog/hot-stone-massage-malta
  Publish: July 14, 2026
  Words: 1,819 | QC cycles: 1 | Links: 3
  Status: ✅ Gate 3 ready

Post 3: How to Plan the Perfect Spa Party in Malta
  FINAL: .tmp/blog-drafts/spa/july-2026/FINAL-03-spa-party-malta.md
  Google Doc: https://docs.google.com/document/d/1Jy8sxLdfxAW_jeIQH8Gd2jZzrcD9iDIZzfGeiixG80I/edit
  Slug: /blog/spa-party-malta
  Publish: July 23, 2026
  Words: 1,725 | QC cycles: 1 | Links: 4
  Status: ✅ Gate 3 ready

Post 4: How Often Should You Get a Massage? A Guide for Women in Malta
  FINAL: .tmp/blog-drafts/spa/july-2026/FINAL-04-how-often-should-you-get-a-massage.md
  Google Doc: https://docs.google.com/document/d/15kkZ5WCWcD-VRQS_xFDlvCQB58VR0nLl5F-wm_1bPJU/edit
  Slug: /blog/how-often-should-you-get-a-massage
  Publish: July 29, 2026
  Words: 2,197 | QC cycles: 1 | Links: 3
  Status: ✅ Gate 3 ready

CARISMA AESTHETICS

Post 5: Microneedling Malta: What It Is, How It Works, and What to Expect
  FINAL: .tmp/blog-drafts/aesthetics/july-2026/FINAL-01-microneedling-malta.md
  Google Doc: https://docs.google.com/document/d/11Lz4YG8ssPALptUeS0xQJ0Kt3Zcd2vkpMuWC7b1DvGw/edit
  Slug: /blog/microneedling-malta
  Publish: July 1, 2026
  Words: 1,781 | QC cycles: 1 | Links: 4
  Status: ✅ Gate 3 ready

Post 6: Mesotherapy Malta: The Skin Treatment More Women Should Know About
  FINAL: .tmp/blog-drafts/aesthetics/july-2026/FINAL-02-mesotherapy-malta.md
  Google Doc: https://docs.google.com/document/d/17UMZBWWmxwRG6zEWyXnRAIiHQA03mCa2qER5IZ2WHoQ/edit
  Slug: /blog/mesotherapy-malta
  Publish: July 10, 2026
  Words: 1,762 | QC cycles: 1 | Links: 4
  Status: ✅ Gate 3 ready

Post 7: PRP Facial Malta: Is Platelet-Rich Plasma Worth It?
  FINAL: .tmp/blog-drafts/aesthetics/july-2026/FINAL-03-prp-facial-malta.md
  Google Doc: https://docs.google.com/document/d/1UoV6yhYizL3cCsStNhPsBt8V5Ol6VTb4VKqASRcO6i8/edit
  Slug: /blog/prp-facial-malta
  Publish: July 21, 2026
  Words: 1,870 | QC cycles: 1 | Links: 4
  Status: ✅ Gate 3 ready

Post 8: Chemical Peels Malta: The Complete Guide to Brighter, Clearer Skin
  FINAL: .tmp/blog-drafts/aesthetics/july-2026/FINAL-04-chemical-peels-malta.md
  Google Doc: https://docs.google.com/document/d/1kS-gyVE-k9j4ocsxEYlnE2HDDJtI70CdV2Zmle6yAVY/edit
  Slug: /blog/chemical-peels-malta
  Publish: July 27, 2026
  Words: 1,870 | QC cycles: 1 | Links: 4
  Note: ⚠️ ~6 em dashes remain in Doc body — fix before CMS upload (clean in local FINAL.md)
  Status: ✅ Gate 3 ready (minor Doc edit needed)

CARISMA SLIMMING

Post 9: GLP-1 Weight Loss Malta: What You Need to Know Before Starting
  FINAL: .tmp/blog-drafts/slimming/july-2026/FINAL-01-glp1-weight-loss-malta.md
  Google Doc: https://docs.google.com/document/d/1XfyzcMvrTZH4IpbVS1iJA5GgGdgjHnkfrfdw7ZISxW8/edit
  Slug: /blog/glp1-weight-loss-malta
  Publish: July 7, 2026
  Words: 1,960 | QC cycles: 1 | Links: 3
  YMYL: ✅ compliant
  Status: ✅ Gate 3 ready

Post 10: EMSculpt NEO Malta: Can You Really Build Muscle and Burn Fat at the Same Time?
  FINAL: .tmp/blog-drafts/slimming/july-2026/FINAL-02-emssculpt-neo-malta.md
  Google Doc: https://docs.google.com/document/d/1GGTxnIwTMQUcgxasupv77GvtZRbmlrUEz210XxYoB5c/edit
  Slug: /blog/emssculpt-neo-malta
  Publish: July 25, 2026
  Words: 2,158 | QC cycles: 1 | Links: 4
  YMYL: ✅ compliant
  Status: ✅ Gate 3 ready

Post 11: Why Every Diet Has Failed You (And What to Do Instead)
  FINAL: .tmp/blog-drafts/slimming/july-2026/FINAL-03-why-every-diet-failed-you.md
  Google Doc: https://docs.google.com/document/d/1pIa21ZHC5YJELI0iOhDSogx-0oa0dPbSjVhCkUZp3zA/edit
  Slug: /blog/why-every-diet-has-failed-you
  Publish: July 17, 2026
  Words: 2,781 | QC cycles: 1 | Links: 3
  YMYL: ✅ compliant
  Status: ✅ Gate 3 ready

Post 12: Postpartum Weight Loss Malta: An Honest Guide for New Mothers
  FINAL: .tmp/blog-drafts/slimming/july-2026/FINAL-04-postpartum-weight-loss-malta.md
  Google Doc: https://docs.google.com/document/d/1_QhTvt5lssUPbiE4b0cln39KxmyrhXQwWL3KbF1aQfc/edit
  Slug: /blog/postpartum-weight-loss-malta
  Publish: July 31, 2026
  Words: 2,201 | QC cycles: 1 | Links: 4
  YMYL: ✅ compliant
  Status: ✅ Gate 3 ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RUN: September 2026 — All 3 Brands (12 posts, 4 per brand)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Seasonal context: End of summer / autumn transition — restoration, self-care restart, post-UV skin recovery, September reset mindset.
Research files: .tmp/blog-drafts/[brand]/september-2026/RESEARCH.md

CARISMA SPA & WELLNESS

Post 1: What Is an Aromatherapy Massage and Why Book One This September?
  FINAL: .tmp/blog-drafts/spa/september-2026/post-01-aromatherapy-massage-FINAL.md
  Google Doc: https://docs.google.com/document/d/1nqA5SdK-EWCNPbwrhVAdqoJeQXaS9lDGPIyCealgsX8/edit
  Slug: /blog/aromatherapy-massage-malta
  Words: 1,630 | QC cycles: 1 | Links: 4 | Em dashes: 0
  Status: ✅ Gate 3 ready

Post 2: Reflexology Malta: What It Is, What It Does, and What to Expect
  FINAL: .tmp/blog-drafts/spa/september-2026/post-02-reflexology-FINAL.md
  Google Doc: https://docs.google.com/document/d/1ZAFqWEhiCuwPDpkVIoHEfkNPaTBmVTmUpiYQQBNExrE/edit
  Slug: /blog/reflexology-malta
  Words: 1,850 | QC cycles: 1 | Links: 4 | Em dashes: 0
  Status: ✅ Gate 3 ready

Post 3: Body Wrap Treatment Malta: What It Is, What It Does, and What to Expect
  FINAL: .tmp/blog-drafts/spa/september-2026/post-03-body-wrap-FINAL.md
  Google Doc: https://docs.google.com/document/d/1UvSN9YNHKk1f7R0ibzQdNEAm_VqTIaTEnZaTjWIEOOI/edit
  Slug: /blog/body-wrap-treatment-malta
  Words: 1,849 | QC cycles: 1 | Links: 5 | Em dashes: 0
  Note: Brand integrity confirmed — no weight loss/slimming claims; explicitly distinguished from Slimming brand treatments
  Status: ✅ Gate 3 ready

Post 4: The Benefits of a Scalp Massage (And Why You Should Book One)
  FINAL: .tmp/blog-drafts/spa/september-2026/post-04-scalp-massage-FINAL.md
  Google Doc: https://docs.google.com/document/d/1py_fyuddW8Bn4EGY9_VVEUnYzaT2ee2udW5s9tXr8c0/edit
  Slug: /blog/scalp-massage-benefits-malta
  Words: 2,147 | QC cycles: 1 | Links: 4 | Em dashes: 0
  Status: ✅ Gate 3 ready

CARISMA AESTHETICS

Post 5: Polynucleotides Malta: The Skin Treatment That Repairs, Hydrates and Rebuilds
  FINAL: .tmp/blog-drafts/aesthetics/september-2026/post-01-polynucleotides-FINAL.md
  Google Doc: https://docs.google.com/document/d/1_-4pve9rx07sd6FCrXXekeg2SfTUZTQfSZIIHIkLQxs/edit
  Slug: /blog/polynucleotides-malta
  Words: 2,376 | QC cycles: 1 | Links: 5 | Em dashes: 0
  Status: ✅ Gate 3 ready

Post 6: Non-Surgical Rhinoplasty Malta: What a Liquid Nose Job Can (and Cannot) Do
  FINAL: .tmp/blog-drafts/aesthetics/september-2026/post-02-nose-fillers-FINAL.md
  Google Doc: https://docs.google.com/document/d/1DjhaEKHoflIhrFDLwkCTyJcyX5wSdjAGvCAyvOVzyaE/edit
  Slug: /blog/non-surgical-rhinoplasty-malta
  Words: ~1,970 | QC cycles: 1 | Links: 4 | Em dashes: 0
  Status: ✅ Gate 3 ready

Post 7: Acne Scar Treatment Malta: Which Treatment Matches Your Scar Type?
  FINAL: .tmp/blog-drafts/aesthetics/september-2026/post-03-acne-scars-FINAL.md
  Google Doc: https://docs.google.com/document/d/1A3W4quJAqeFeLg45k19IVD3PJJkRdWrRRtGXX5nnA34/edit
  Slug: /blog/acne-scar-treatment-malta
  Words: ~2,100 | QC cycles: 1 | Links: 5 | Em dashes: 0
  Status: ✅ Gate 3 ready

Post 8: Masseter Botox Malta: Jaw Slimming, Bruxism Relief, and What to Expect
  FINAL: .tmp/blog-drafts/aesthetics/september-2026/post-04-masseter-botox-FINAL.md
  Google Doc: https://docs.google.com/document/d/12Zep5LhzN-b-0kbvq3NfMEj_V2VkKpqSLPRjuYgIqgM/edit
  Slug: /blog/masseter-botox-malta
  Words: 2,385 | QC cycles: 1 | Links: 4 | Em dashes: 0
  Status: ✅ Gate 3 ready

CARISMA SLIMMING

Post 9: Why Poor Sleep Makes Weight Loss Harder in Malta
  FINAL: .tmp/blog-drafts/slimming/september-2026/post-01-sleep-weight-loss-FINAL.md
  Google Doc: https://docs.google.com/document/d/1WY6-yWtfwoMI3KRnZYpjcQBVNUvD-Wj_WgWFGhTNwMI/edit
  Slug: /blog/sleep-and-weight-loss-malta
  Words: 2,209 | QC cycles: 2 (H1 length + keyword in first 100 words + meta desc fixes) | Links: 3 | Em dashes: 0
  YMYL: ✅ compliant (Spiegel et al. 2004, Hairston et al. 2010, NHS; results may vary ×2; named persona Daniela)
  Status: ✅ Gate 3 ready

Post 10: Ultrasound Cavitation Malta: How It Works, Who It's For, and What to Expect
  FINAL: .tmp/blog-drafts/slimming/september-2026/post-02-cavitation-FINAL.md
  Google Doc: https://docs.google.com/document/d/1OxMZvu_v7WmXkVLAA7i0ximzcEyEN8KQ0gOp3N5itPs/edit
  Slug: /blog/ultrasound-cavitation-malta
  Words: ~1,890 | QC cycles: 1 | Links: 5 | Em dashes: 0
  YMYL: ✅ compliant (Palumbo et al. 2010, Brown 2009; results may vary ×2; named persona Joanna)
  Note: "Not a weight loss treatment" stated explicitly in body + FAQ
  Status: ✅ Gate 3 ready

Post 11: Why Stress Causes Belly Fat — And What to Do About It in Malta
  FINAL: .tmp/blog-drafts/slimming/september-2026/post-03-stress-belly-fat-FINAL.md
  Google Doc: https://docs.google.com/document/d/1_MCjszL-kgcPwAK1fxAB4bND655BGF_p4wmXGbL90Gc/edit
  Slug: /blog/stress-belly-fat-malta
  Words: 2,612 | QC cycles: 1 | Links: 4 | Em dashes: 0
  YMYL: ✅ compliant (Bjorntorp 2001, Epel et al. 2000, Chao et al. 2017; results may vary ×2; named persona Miriam)
  Status: ✅ Gate 3 ready

Post 12: Why Losing Weight Over 40 Is Harder — And What Actually Works in Malta
  FINAL: .tmp/blog-drafts/slimming/september-2026/post-04-weight-loss-over-40-FINAL.md
  Google Doc: https://docs.google.com/document/d/1dV5J3m5xW_u9aAXPt3cDtC05apT3eNIgChQwPYh5Dmw/edit
  Slug: /blog/weight-loss-over-40-malta
  Words: 2,692 | QC cycles: 1 | Links: 4 | Em dashes: 0
  YMYL: ✅ compliant (Lovejoy et al. 2008, Villareal et al. 2005, NHS; results may vary ×3; named persona Maria, 44)
  Status: ✅ Gate 3 ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RUN: August 2026 — All 3 Brands (12 posts, 4 per brand)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Seasonal context: Late summer Malta — body confidence, UV skin damage, back-to-routine transition.
Research files: .tmp/blog-drafts/[brand]/august-2026/RESEARCH.md
Note: Aesthetics researcher pivoted from planned Thread Lift + Fat Dissolving to Cheek Fillers + RF Microneedling based on internal duplicate-check analysis. All 4 Aesthetics topics are fresh and valid.

CARISMA SPA & WELLNESS

Post 1: Types of Spa Facials: Which One Is Right for You?
  FINAL: .tmp/blog-drafts/spa/august-2026/post-01-spa-facials-FINAL.md
  Google Doc: https://docs.google.com/document/d/1Xv9u2KZIV598fEIg2wEj51qNzRMWUMYub7nnlBYzQP0/edit
  Slug: /blog/types-of-spa-facials-malta
  Words: 1,640 | QC cycles: 1 | Links: 3 | Em dashes: 0
  Status: ✅ Gate 3 ready

Post 2: Prenatal Massage in Malta: Benefits, Safety, and What to Expect
  FINAL: .tmp/blog-drafts/spa/august-2026/post-02-prenatal-massage-FINAL.md
  Google Doc: https://docs.google.com/document/d/1hfTydd6hpKVXGB6M5O0WGGMuipVOpMH-EB4zPhdO7sU/edit
  Slug: /blog/prenatal-massage-malta
  Words: 1,701 | QC cycles: 1 | Links: 3 | Em dashes: 0
  Note: YMYL — 3x GP/midwife consult disclaimers present
  Status: ✅ Gate 3 ready

Post 3: What Happens to Your Body During a Massage?
  FINAL: .tmp/blog-drafts/spa/august-2026/post-03-massage-body-science-FINAL.md
  Google Doc: https://docs.google.com/document/d/1vl7fkI2B_j7T6aXMzS93T8rpZpVUtkbkTqmIMgmZ_lg/edit
  Slug: /blog/what-happens-during-a-massage
  Words: 1,998 | QC cycles: 1 (density revised) | Links: 3 | Em dashes: 0
  Status: ✅ Gate 3 ready

Post 4: Spa Day First-Timer Guide: How to Prepare and What to Expect
  FINAL: .tmp/blog-drafts/spa/august-2026/post-04-spa-first-timer-FINAL.md
  Google Doc: https://docs.google.com/document/d/1UBATHPS8ltlLCR5aZuNwHcG3gLRvdQRVZ3DMBnGzOSM/edit
  Slug: /blog/spa-day-first-timer-guide-malta
  Words: 2,112 | QC cycles: 1 | Links: 4 | Em dashes: 0
  Status: ✅ Gate 3 ready

CARISMA AESTHETICS

Post 5: Cheek Fillers Malta: What They Do, Who They're For, and What to Expect
  FINAL: .tmp/blog-drafts/aesthetics/august-2026/post-01-thread-lift-FINAL.md
  Google Doc: https://docs.google.com/document/d/1IxRX1mugXx-UlrMcOGOsbuwqIbpzoda_HIQMGR3zN2o/edit
  Slug: /blog/cheek-fillers-malta
  Words: 2,185 | QC cycles: 1 | Links: 5 | Em dashes: 0
  Note: Topic shifted from planned Thread Lift — researcher found Thread Lift already in archive (June 2026)
  Status: ✅ Gate 3 ready

Post 6: RF Microneedling Malta: What It Is, How It Works, and What to Expect
  FINAL: .tmp/blog-drafts/aesthetics/august-2026/post-02-fat-dissolving-FINAL.md
  Google Doc: https://docs.google.com/document/d/1mzgaVX6SmvAJVcu6uoIb6s0FEoZoGW1xOYmQ5DbzJzs/edit
  Slug: /blog/rf-microneedling-malta
  Words: 1,953 | QC cycles: 1 (H1 + meta revised) | Links: 5 | Em dashes: 0
  Note: Topic shifted from planned Fat Dissolving — researcher noted Aesthetics fat dissolving already in April 2026 archive
  Status: ✅ Gate 3 ready

Post 7: Collagen Loss and Skin Ageing: What's Happening Beneath the Surface
  FINAL: .tmp/blog-drafts/aesthetics/august-2026/post-03-collagen-ageing-FINAL.md
  Google Doc: https://docs.google.com/document/d/17TjAo0A4_h89HEzhzeruYsZ92QyW52OBsa-YJ5H874s/edit
  Slug: /blog/collagen-loss-skin-ageing-malta
  Words: 1,895 | QC cycles: 1 | Links: 6 | Em dashes: 0
  Status: ✅ Gate 3 ready

Post 8: Cheek Fillers vs Jawline Fillers: Which Treatment Is Right for You?
  FINAL: .tmp/blog-drafts/aesthetics/august-2026/post-04-cheek-jawline-fillers-FINAL.md
  Google Doc: https://docs.google.com/document/d/1-Mhaao_RsosD57NiHUtbnV94r2puxPJUPSJRzCB1Fu8/edit
  Slug: /blog/cheek-fillers-vs-jawline-fillers-malta
  Words: 1,920 | QC cycles: 1 | Links: 5 | Em dashes: 0
  Status: ✅ Gate 3 ready

CARISMA SLIMMING

Post 9: VelaShape Malta: How Anti-Cellulite Treatment Works
  FINAL: .tmp/blog-drafts/slimming/august-2026/post-01-velashape-cellulite-FINAL.md
  Google Doc: https://docs.google.com/document/d/1WcAiZZ0mjYzVYkCgn0MJoVjzjUyNWLE9sfMfCxUC3Bc/edit
  Slug: /blog/velashape-anti-cellulite-malta
  Words: 1,703 | QC cycles: 1 | Links: 5 | Em dashes: 0
  YMYL: ✅ compliant (Avram 2004, Romero 2008 + 1 additional citation)
  Status: ✅ Gate 3 ready

Post 10: Insulin Resistance and Weight Gain: Why Your Body Is Working Against You
  FINAL: .tmp/blog-drafts/slimming/august-2026/post-02-insulin-resistance-FINAL.md
  Google Doc: https://docs.google.com/document/d/1pp8T_eIt0slKHUcmVzTBbO8qYccpriZtsCqs_Rj4Z10/edit
  Slug: /blog/insulin-resistance-weight-gain-malta
  Words: 2,233 | QC cycles: 1 | Links: 3 | Em dashes: 0
  YMYL: ✅ compliant (Petersen/Shulman 2018, Esposito 2004, Colberg 2010 + WHO/NHS)
  Status: ✅ Gate 3 ready

Post 11: Non-Surgical Body Contouring in Malta: What Your Options Actually Are
  FINAL: .tmp/blog-drafts/slimming/august-2026/post-03-body-contouring-FINAL.md
  Google Doc: https://docs.google.com/document/d/1fbWmm0_8ck_ViGOn_uWb3TMOdtQo7PQo7HwbEwp_zG0/edit
  Slug: /blog/non-surgical-body-contouring-malta
  Words: 1,933 | QC cycles: 1 | Links: 6 | Em dashes: 0
  YMYL: ✅ compliant (Manstein 2008, deoxycholate FDA/EMA, Kinney HIFEM)
  Note: "Body contouring is NOT weight loss" stated explicitly in body + FAQ 4
  Status: ✅ Gate 3 ready

Post 12: Emotional Eating and Weight Loss: Why Willpower Is Not the Problem
  FINAL: .tmp/blog-drafts/slimming/august-2026/post-04-emotional-eating-FINAL.md
  Google Doc: https://docs.google.com/document/d/1yNF6sjMiWd_n-MaBZeWdbosm8p0kjDuhAvWjGNsJ6T8/edit
  Slug: /blog/emotional-eating-weight-loss-malta
  Words: 1,851 | QC cycles: 1 | Links: 3 | Em dashes: 0
  YMYL: ✅ compliant (Macht 2008, Epel 2001, Bjorntorp 2001, Kristeller 2014)
  Note: BED distinguished from emotional eating with specialist signpost present
  Status: ✅ Gate 3 ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RUN: May 2026 — Massage & Treatments Batch — All 3 Brands (12 posts, 4 per brand)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CARISMA SPA & WELLNESS

Post 1: Hot Stone Massage in Malta: What It Is, What It Does, and Why You Need It This Spring
  FINAL: .tmp/blog-drafts/spa/may-2026/FINAL-01-hot-stone-massage-malta.md
  Google Doc: https://docs.google.com/document/d/1vhJEFevWXY4c3tA_mgxXSfp3TfCwsNGzk2EbB9x23kw/edit
  Slug: /blog/hot-stone-massage-malta
  Words: 1,787 | QC cycles: 2 | Links: 3
  Status: ✅ Gate 3 ready

Post 2: Pregnancy Massage in Malta: What It Is, Why It Helps, and What to Expect
  FINAL: .tmp/blog-drafts/spa/may-2026/FINAL-02-pregnancy-massage-malta.md
  Google Doc: https://docs.google.com/document/d/1muo4xojZmjS6UOl6oUAsrRgKYJoobzl6ifVk63P4G0U/edit
  Slug: /blog/pregnancy-massage-malta
  Words: 1,660 | QC cycles: 1 | Links: 3
  Status: ✅ Gate 3 ready

Post 3: Deep Tissue vs Swedish Massage Malta: Which One Is Right for You?
  FINAL: .tmp/blog-drafts/spa/may-2026/FINAL-03-deep-tissue-vs-swedish-massage-malta.md
  Google Doc: https://docs.google.com/document/d/10BRR_MsldaZpU7ZnCv5JzQsj4B2S_YffWHd58Rw8vYo/edit
  Slug: /blog/deep-tissue-vs-swedish-massage-malta
  Words: 1,541 | QC cycles: 2 | Links: 3
  Status: ✅ Gate 3 ready

Post 4: Massage for Back and Neck Pain in Malta: What Works and What to Expect
  FINAL: .tmp/blog-drafts/spa/may-2026/FINAL-04-massage-for-back-neck-pain-malta.md
  Google Doc: https://docs.google.com/document/d/1bmV7YmiXgW_cOv1NJ38cR6kPaBtTjXXXTZTvuDeRAS0/edit
  Slug: /blog/massage-for-back-neck-pain-malta
  Words: 1,810 | QC cycles: 1 | Links: 3
  Status: ✅ Gate 3 ready

CARISMA AESTHETICS

Post 5: HIFU Facial Treatment in Malta: What It Is, How It Works, and Who It's For
  FINAL: .tmp/blog-drafts/aesthetics/may-2026/FINAL-01-hifu-facial-treatment-malta.md
  Google Doc: https://docs.google.com/document/d/1hCfYBNxDLhLX2jsJYhai4TzlrpURGepPe-6Y7ORROK4/edit
  Slug: /blog/hifu-facial-treatment-malta
  Words: 1,957 | QC cycles: 1 | Links: 3
  YMYL: ✅ compliant
  Status: ✅ Gate 3 ready

Post 6: Tear Trough Filler in Malta: What It Is, What It Does, and What to Expect
  FINAL: .tmp/blog-drafts/aesthetics/may-2026/FINAL-02-tear-trough-filler-malta.md
  Google Doc: https://docs.google.com/document/d/1w9ciM_sH6lakEwxC5Nbf-Rc1W2f5J-cuL_L7sq17_lA/edit
  Slug: /blog/tear-trough-filler-malta
  Words: ~1,900 | QC cycles: 1 | Links: 3
  YMYL: ✅ compliant
  Status: ✅ Gate 3 ready

Post 7: Pigmentation Treatment in Malta: How to Finally Deal with Dark Spots
  FINAL: .tmp/blog-drafts/aesthetics/may-2026/FINAL-03-pigmentation-treatment-malta.md
  Google Doc: https://docs.google.com/document/d/18pdJI6yUxNqi_whfer5kTwPWI1zaTWbnwXIqEcuSgK8/edit
  Slug: /blog/pigmentation-treatment-malta
  Words: 1,862 | QC cycles: 1 | Links: 3
  YMYL: ✅ compliant
  Status: ✅ Gate 3 ready

Post 8: PRP Facial in Malta: What the Vampire Facial Actually Does to Your Skin
  FINAL: .tmp/blog-drafts/aesthetics/may-2026/FINAL-04-prp-facial-malta.md
  Google Doc: https://docs.google.com/document/d/1ciW5Fm0wK2duddcwMvVbP8415ZFjLiprzb4hHSL_cOY/edit
  Slug: /blog/prp-facial-malta
  Words: 1,863 | QC cycles: 1 | Links: 4
  YMYL: ✅ compliant
  Status: ✅ Gate 3 ready

CARISMA SLIMMING

Post 9: Body Contouring in Malta: What It Is, What It Treats, and Whether It Works
  FINAL: .tmp/blog-drafts/slimming/may-2026/FINAL-01-body-contouring-malta.md
  Google Doc: https://docs.google.com/document/d/17iYoH2SM23Ky0XuNULZKqqLQC20tUFL0C0jHAYYAwJc/edit
  Slug: /blog/body-contouring-malta
  Words: 1,847 | QC cycles: 1 | Links: 4
  YMYL: ✅ compliant
  Status: ✅ Gate 3 ready

Post 10: Weight Loss Plateau in Malta: Why It Happens and What to Do Next
  FINAL: .tmp/blog-drafts/slimming/may-2026/FINAL-02-weight-loss-plateau-malta.md
  Google Doc: https://docs.google.com/document/d/1NmMS5K5x_R7klTUO7jDVRZxYb-TkoxD8Hk3WAbQGK4Q/edit
  Slug: /blog/weight-loss-plateau-malta
  Words: 1,842 | QC cycles: 1 | Links: 4
  YMYL: ✅ compliant
  Status: ✅ Gate 3 ready

Post 11: Post-Pregnancy Body in Malta: What's Normal, What Helps, and What to Expect
  FINAL: .tmp/blog-drafts/slimming/may-2026/FINAL-03-post-pregnancy-body-malta.md
  Google Doc: https://docs.google.com/document/d/15Hm0hBXQCXHIo0XFx92DTZzi-_y1U2GBqZeaXlRoBu8/edit
  Slug: /blog/post-pregnancy-body-malta
  Words: 1,847 | QC cycles: 1 | Links: 4
  YMYL: ✅ compliant
  Status: ✅ Gate 3 ready

Post 12: Visceral Fat Malta: What It Is, Why It Matters, and How to Reduce It
  FINAL: .tmp/blog-drafts/slimming/may-2026/FINAL-04-visceral-fat-malta.md
  Google Doc: https://docs.google.com/document/d/1T5V72kJibmCBkg4SZ7qaTXbuxAa07u0GoZgeFC394KE/edit
  Slug: /blog/visceral-fat-malta
  Words: ~1,850 | QC cycles: 1 | Links: 5
  YMYL: ✅ compliant
  Status: ✅ Gate 3 ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RUN: July 2026 — Batch 2 — All 3 Brands (12 posts, 4 per brand)
Topics: Fresh, non-duplicate — aromatherapy, first spa visit, burnout, body wrap / cheek fillers, anti-ageing, acne scars, jawline / hormones+weight, PCOS, cortisol belly fat, cavitation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CARISMA SPA & WELLNESS

Post 1: Aromatherapy Massage in Malta: What It Is, What the Oils Do, and Why You'll Leave Feeling Different
  FINAL: .tmp/blog-drafts/spa/july-2026-b2/FINAL-01-aromatherapy-massage-malta.md
  Google Doc: https://docs.google.com/document/d/1uh9aYhVYKn2rKOJDDIkjC5Nn1ijf8osqQ5WQo78JASg/edit
  Slug: /blog/aromatherapy-massage-malta
  Words: 1,598 | QC cycles: 2 | Links: 5
  Status: ✅ Gate 3 ready

Post 2: Your First Spa Visit in Malta: What to Expect, What to Bring, and How to Make the Most of It
  FINAL: .tmp/blog-drafts/spa/july-2026-b2/FINAL-02-first-spa-visit-malta.md
  Google Doc: https://docs.google.com/document/d/1pIKjgf6BnO0-TFTPfIGpfz-Eor6Vq5tMm9-_hO55r_c/edit
  Slug: /blog/first-spa-visit-malta
  Words: 1,851 | QC cycles: 1 | Links: 5
  Status: ✅ Gate 3 ready

Post 3: When You're Running on Empty: Why a Spa Day in Malta Does More Than You Think
  FINAL: .tmp/blog-drafts/spa/july-2026-b2/FINAL-03-spa-for-burnout-malta.md
  Google Doc: https://docs.google.com/document/d/1V-nfsC7sKs-Sw8v24SkFv-QwaoU1SrsRvA74vhiuOL0/edit
  Slug: /blog/spa-for-burnout-malta
  Words: 1,748 | QC cycles: 1 | Links: 4
  Status: ✅ Gate 3 ready

Post 4: Body Wrap in Malta: What It Is, What It Actually Does, and Whether It's Worth It
  FINAL: .tmp/blog-drafts/spa/july-2026-b2/FINAL-04-body-wrap-malta.md
  Google Doc: https://docs.google.com/document/d/193r3FLn7yf0nXjmEZarlAWW6zvazZQ0i1aTYrn9FMOA/edit
  Slug: /blog/body-wrap-malta
  Words: ~1,531 | QC cycles: 1 | Links: 5
  Status: ✅ Gate 3 ready

CARISMA AESTHETICS

Post 5: Cheek Fillers in Malta: What They Do, How Natural They Look, and What to Expect
  FINAL: .tmp/blog-drafts/aesthetics/july-2026-b2/FINAL-01-cheek-fillers-malta.md
  Google Doc: https://docs.google.com/document/d/1tn19tGvAmiaY8-x-x-ALSZu3JO4aHm6v7kAGnFcRRSQ/edit
  Slug: /blog/cheek-fillers-malta
  Words: ~1,850 | QC cycles: 1 | Links: 5
  Status: ✅ Gate 3 ready

Post 6: Anti-Ageing Treatments in Malta: What Actually Works After 40 (An Honest Guide)
  FINAL: .tmp/blog-drafts/aesthetics/july-2026-b2/FINAL-02-anti-ageing-treatments-malta.md
  Google Doc: https://docs.google.com/document/d/1UbZM9lTs5FlRRFFWZi8ZIWuSUGQS_VMC67xKagNd4XQ/edit
  Slug: /blog/anti-ageing-treatments-malta
  Words: 2,247 | QC cycles: 1 | Links: 7
  Status: ✅ Gate 3 ready

Post 7: Acne Scar Treatment in Malta: Your Options Explained Honestly
  FINAL: .tmp/blog-drafts/aesthetics/july-2026-b2/FINAL-03-acne-scar-treatment-malta.md
  Google Doc: https://docs.google.com/document/d/1LRcm5KhoAjiB2ZDaT67Ax4Fo_ZUB1hBGjTqleOmltrg/edit
  Slug: /blog/acne-scar-treatment-malta
  Words: ~1,960 | QC cycles: 1 | Links: 4
  Status: ✅ Gate 3 ready

Post 8: Jawline Filler in Malta: The Non-Surgical Way to Define Your Face
  FINAL: .tmp/blog-drafts/aesthetics/july-2026-b2/FINAL-04-jawline-filler-malta.md
  Google Doc: https://docs.google.com/document/d/1iXiHs-LfYEwja66-8p5DJcK1LvvkQNhLd1-k3mrNpzw/edit
  Slug: /blog/jawline-filler-malta
  Words: 1,787 | QC cycles: 1 | Links: 3
  Status: ✅ Gate 3 ready

CARISMA SLIMMING

Post 9: Hormone Imbalance and Weight Gain in Malta: The Connection Your GP Might Have Missed
  FINAL: .tmp/blog-drafts/slimming/july-2026-b2/FINAL-01-hormone-imbalance-weight-gain-malta.md
  Google Doc: https://docs.google.com/document/d/1CCHtE5Xpu1YC9Hk7zcsjpIt44eFJgFR7UL5e9coq02U/edit
  Slug: /blog/hormone-imbalance-weight-gain-malta
  Words: ~1,980 | QC cycles: 1 | Links: 3
  YMYL: ✅ compliant
  Status: ✅ Gate 3 ready

Post 10: PCOS and Weight Loss in Malta: Why It's Harder and What Actually Helps
  FINAL: .tmp/blog-drafts/slimming/july-2026-b2/FINAL-02-pcos-weight-loss-malta.md
  Google Doc: https://docs.google.com/document/d/1R0GIP3kq-49Ys4DCh3La68IBcVWPOq08wvi81nFDWEo/edit
  Slug: /blog/pcos-weight-loss-malta
  Words: ~2,178 | QC cycles: 1 | Links: 3
  YMYL: ✅ compliant
  Status: ✅ Gate 3 ready

Post 11: Cortisol and Belly Fat: How Stress Is Making Weight Loss Harder Than It Needs to Be
  FINAL: .tmp/blog-drafts/slimming/july-2026-b2/FINAL-03-cortisol-belly-fat-malta.md
  Google Doc: https://docs.google.com/document/d/1HPeDI9MtmC9IcyUZvZN7IHcwq8AOL3VAGJWitJK-AZw/edit
  Slug: /blog/cortisol-belly-fat-malta
  Words: ~1,960 | QC cycles: 1 | Links: 4
  YMYL: ✅ compliant
  Status: ✅ Gate 3 ready

Post 12: Ultrasound Cavitation in Malta: What It Is, How It Works, and Whether It's Right for You
  FINAL: .tmp/blog-drafts/slimming/july-2026-b2/FINAL-04-ultrasound-cavitation-malta.md
  Google Doc: https://docs.google.com/document/d/1x3iivLZM0sT9KlNl3Gu5X11OXYFu-m2MWL_fA3tiP5E/edit
  Slug: /blog/ultrasound-cavitation-malta
  Words: ~1,980 | QC cycles: 1 | Links: 5
  YMYL: ✅ compliant
  Status: ✅ Gate 3 ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RUN: August 2026 — Batch 2 — Body Treatments & Lifestyle (12 posts, 4 per brand)
Topics: reflexology, aromatherapy massage, body wrap, new mums spa / cheek fillers, RF microneedling, rosacea, non-surgical rhinoplasty / anti-cellulite VelaShape, insulin resistance, body contouring, emotional eating
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CARISMA SPA & WELLNESS

Post 1: Reflexology Malta: What It Is, What It Treats, and What to Expect
  FINAL: .tmp/blog-drafts/spa/aug-2026/FINAL-01-reflexology-malta.md
  Google Doc: https://docs.google.com/document/d/1TVJURwAwZcbSG99nnvuGhdfi_yrxFoHl_cOs1P5W1wM/edit
  Slug: /blog/reflexology-malta
  Links: 3 | Em dashes: 0
  Status: ✅ Gate 3 ready

Post 2: Aromatherapy Massage in Malta: Scents, Oils, and Why It Works
  FINAL: .tmp/blog-drafts/spa/aug-2026/FINAL-02-aromatherapy-massage-malta.md
  Google Doc: https://docs.google.com/document/d/194g6hKNNuXLqaBhGRqB114ZI5X9aVRukxPumBElCbvw/edit
  Slug: /blog/aromatherapy-massage-malta
  Links: 4 | Em dashes: 0
  Status: ✅ Gate 3 ready

Post 3: Body Wrap Treatment Malta: What It Does and Whether It's Worth It
  FINAL: .tmp/blog-drafts/spa/aug-2026/FINAL-03-body-wrap-treatment-malta.md
  Google Doc: https://docs.google.com/document/d/1AQ7flv1mOGlm36-WIhzUe8F-3G-nxL74W2u_q_Kx-v8/edit
  Slug: /blog/body-wrap-treatment-malta
  Links: 3 | Em dashes: 0
  Status: ✅ Gate 3 ready

Post 4: Spa for New Mums Malta: Self-Care That Fits Around Your Baby
  FINAL: .tmp/blog-drafts/spa/aug-2026/FINAL-04-spa-for-new-mums-malta.md
  Google Doc: https://docs.google.com/document/d/18syEKwwrIb1DrYIUmtzNBdBy0fExSyQvYeo-ATU5dhM/edit
  Slug: /blog/spa-for-new-mums-malta
  Links: 5 | Em dashes: 0
  Status: ✅ Gate 3 ready

CARISMA AESTHETICS

Post 5: Cheek Fillers Malta: What They Do, Who They're For, and What to Expect
  FINAL: .tmp/blog-drafts/aesthetics/august-2026/FINAL-01-cheek-fillers-malta.md
  Google Doc: https://docs.google.com/document/d/1fpXDJvnpCF43ylQ7Wdx9VEVk0GITcSuOdKtn1OsgP2c/edit
  Slug: /blog/cheek-fillers-malta
  Links: 4 | Em dashes: 0
  Status: ✅ Gate 3 ready

Post 6: RF Microneedling Malta: What It Is, How It Works, and What to Expect
  FINAL: .tmp/blog-drafts/aesthetics/august-2026/FINAL-02-rf-microneedling-malta.md
  Google Doc: https://docs.google.com/document/d/1OVhyMWphR9ColyTyfY3rU9wXQ_aIADl2wRCCTnK9vVI/edit
  Slug: /blog/rf-microneedling-malta
  Links: 4 | Em dashes: 0
  Status: ✅ Gate 3 ready

Post 7: Rosacea Treatment Malta: What Causes It and How to Manage It Effectively
  FINAL: .tmp/blog-drafts/aesthetics/august-2026/FINAL-03-rosacea-treatment-malta.md
  Google Doc: https://docs.google.com/document/d/1Boa-SJFK-1RirhnZNkB3-90OnJAITa7kUdOpHT5fyOk/edit
  Slug: /blog/rosacea-treatment-malta
  Links: 3 | Em dashes: 0
  Status: ✅ Gate 3 ready

Post 8: Non-Surgical Rhinoplasty Malta: Can Filler Really Reshape Your Nose?
  FINAL: .tmp/blog-drafts/aesthetics/august-2026/FINAL-04-non-surgical-rhinoplasty-malta.md
  Google Doc: https://docs.google.com/document/d/1qNbjVuK_Wa4pKXVvUfYlnzy72UZMPllZipHFDMzroU0/edit
  Slug: /blog/non-surgical-rhinoplasty-malta
  Links: 3 | Em dashes: 0
  Status: ✅ Gate 3 ready

CARISMA SLIMMING

Post 9: Anti-Cellulite Treatment Malta: What VelaShape Does and What to Expect
  FINAL: .tmp/blog-drafts/slimming/august-2026/FINAL-01-anti-cellulite-treatment-malta.md
  Google Doc: https://docs.google.com/document/d/1R2Ky-Yr8w7PoHHVv7JcFBNk_glgUjrrrhwHIUvuguAM/edit
  Slug: /blog/anti-cellulite-treatment-malta
  Links: 4 | Em dashes: 0
  YMYL: ✅ compliant
  Status: ✅ Gate 3 ready

Post 10: Insulin Resistance and Weight Loss Malta: Why It's Harder and What Helps
  FINAL: .tmp/blog-drafts/slimming/august-2026/FINAL-02-insulin-resistance-weight-loss-malta.md
  Google Doc: https://docs.google.com/document/d/1ExqLydjRMSC6jcGaq8SjpopYKSQx5__1mLBBzeA2z_Y/edit
  Slug: /blog/insulin-resistance-weight-loss-malta
  Links: 3 | Em dashes: 0
  YMYL: ✅ compliant
  Status: ✅ Gate 3 ready

Post 11: Body Contouring Malta: Your Non-Surgical Options Explained
  FINAL: .tmp/blog-drafts/slimming/august-2026/FINAL-03-body-contouring-malta.md
  Google Doc: https://docs.google.com/document/d/1LhQhiBJyci-fSFAUKu2phikhfflAVzDU8YiAnnB4FAY/edit
  Slug: /blog/body-contouring-malta
  Links: 6 | Em dashes: 0
  YMYL: ✅ compliant
  Status: ✅ Gate 3 ready

Post 12: Emotional Eating and Weight Loss Malta: Why It's Not About Willpower
  FINAL: .tmp/blog-drafts/slimming/august-2026/FINAL-04-emotional-eating-weight-loss-malta.md
  Google Doc: https://docs.google.com/document/d/157wsMmRRebzOHl_-WDp92kivic82dx35nL2kaiTUbYQ/edit
  Slug: /blog/emotional-eating-weight-loss-malta
  Links: 3 | Em dashes: 0
  YMYL: ✅ compliant
  Status: ✅ Gate 3 ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
