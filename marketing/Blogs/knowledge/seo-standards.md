# SEO Standards — Carisma Blog

**Used by:** `seo-blog-qc-expert` (Step 3)
**All 10 dimensions must pass before a post proceeds to humanization.**

---

## Dimension 1 — Title & Meta Title

| Requirement | Standard |
|---|---|
| Length | 50–60 characters |
| Keyword position | In the first 60% of the title |
| Brand modifier | Include "Malta", "Carisma", or treatment-specific differentiator |
| Clickability | Would a real person click this in a Google result? |

---

## Dimension 2 — Meta Description

| Requirement | Standard |
|---|---|
| Length | 145–160 characters |
| Keyword | Present, not forced |
| CTA | Clear value proposition or call to action |
| Readability | Natural language, not stuffed |

---

## Dimension 3 — H1 Tag

| Requirement | Standard |
|---|---|
| Count | Exactly one H1 |
| Keyword | Contains or closely matches the primary keyword |
| Difference from meta title | H1 can be longer/more descriptive |
| Length | Under 70 characters |

---

## Dimension 4 — Heading Structure

| Requirement | Standard |
|---|---|
| Hierarchy | H1 → H2 → H3, no skipping |
| H2 count | Minimum 4 in a 1,400+ word post |
| Keyword in headings | At least 1 H2 contains primary keyword or close variant |
| FAQ section | Present as final H2, minimum 4 questions |
| Heading story | Reading headings only should tell the full article story |

---

## Dimension 5 — Keyword Usage & Density

| Requirement | Standard |
|---|---|
| Primary keyword locations | H1, intro (first 100 words), 2+ H2/H3s, conclusion |
| Density target | 0.8–1.5% |
| Over-optimisation risk | Anything above 2% = FAIL |
| Supporting keywords | Distributed naturally throughout |
| LSI terms | Present (semantically related vocabulary) |

**Calculate density:** (keyword occurrences ÷ total word count) × 100

---

## Dimension 6 — Content Depth & E-E-A-T

| Brand | Minimum Word Count |
|---|---|
| Spa | 1,400 words |
| Aesthetics | 1,600 words |
| Slimming | 1,700 words |

**E-E-A-T signals required:**
- **Experience:** "at our clinic", "clients often ask us", real clinical context
- **Expertise:** Technical knowledge demonstrated beyond surface descriptions
- **Authoritativeness:** References to reputable sources; positions Carisma as authority
- **Trust:** No over-promising, accurate outcome representation, medical disclaimers

**Additional for YMYL (Slimming/Aesthetics):**
- At least 1 verifiable statistic or clinical reference
- Medical disclaimers present
- No unsubstantiated health claims

---

## Dimension 7 — Internal Linking

| Requirement | Standard |
|---|---|
| Minimum links | 2 (ideally 3) |
| Booking page link | At least 1 link to a service/consultation/booking page |
| Related blog link | At least 1 link to a related post (if available) |
| Anchor text | Descriptive — not "click here" or "read more" |
| Destination validity | No 404s, no irrelevant destinations |

---

## Dimension 8 — Local SEO Signals

| Requirement | Standard |
|---|---|
| "Malta" in H1 or intro | Required |
| "Malta" in at least 1 H2 | Required |
| "Malta" in body | Required (woven naturally) |
| Local context | Feels written FOR Malta, not adapted with "Malta" added |
| Service area language | "women in Malta", "our Malta clinic", "across Malta" |

---

## Dimension 9 — AEO (Answer Engine Optimisation)

| Requirement | Standard |
|---|---|
| FAQ section | Present (minimum 4 questions for Spa, 5 for Aesthetics/Slimming) |
| Question format | H3, phrased as a real user would type it |
| Answer length | 40–100 words per answer |
| PAA targeting | At least 1 question targets a "People Also Ask" pattern |
| Topic definition | Appears in first 100 words of the article |

---

## Dimension 10 — CTA & Conversion

| Requirement | Standard |
|---|---|
| CTA specificity | Specific to the treatment/topic — not generic |
| CTA placements | End of post AND once mid-article |
| CTA language | Never "learn more", "visit our website" without context |
| Active offer | Reference from `config/offers.json` if applicable |

---

## YMYL Failure Triggers (Automatic FAIL)

These patterns cause an immediate audit failure regardless of other scores:

| Pattern | Why it Fails |
|---|---|
| Specific weight/inch loss with timeline, no supervision qualifier | Health claim without medical context |
| Scare tactics ("you could develop diabetes if you don't act") | Health anxiety induction |
| Shame language of any kind | Core brand violation |
| BMI as sole metric without context | Outdated/harmful framing |
| Unverified statistics | Trust violation |
| "Before and after" implying identical results for all | Misleading claims |

---

## Common Failures Reference

| Failure | Dimension | Fix |
|---|---|---|
| Primary keyword only in title/H1 | 5 | Add to intro, 2 H2s, conclusion |
| FAQ section missing | 9 | Add H2: FAQs About [Topic] in Malta |
| No internal link to booking page | 7 | Add link to consultation page |
| "Malta" only in meta title | 8 | Add Malta to H2 and body naturally |
| Under minimum word count | 6 | Expand weakest section (typically results or FAQs) |
| CTA says "contact us" | 10 | Replace with treatment-specific CTA |
| Over 2% keyword density | 5 | Remove from H2 section or body paragraph |
| No definition in first 100 words | 9 | Add concise definition to intro |
