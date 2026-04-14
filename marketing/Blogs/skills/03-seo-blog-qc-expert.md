# SEO Blog QC Expert

**Skill name:** `seo-blog-qc-expert`
**Pipeline position:** Step 3 (Gate 2)
**Input:** DRAFT-[nn]-[slug].md from brand writer
**Output:** SEO audit report → humanizer (PASS) or back to writer (FAIL)

---

## Audit Scope — 10 Dimensions

Every blog post must pass all 10 before proceeding to `blog-tone-humanizer`.

---

### 1. Title & Meta Title

- Meta title: 50–60 characters
- Primary keyword appears in first 60% of the meta title
- Contains a compelling hook or benefit beyond just the keyword
- Brand modifier included (e.g., "Malta", "Carisma", or treatment-specific differentiator)

**Common failures:** Keyword buried at end, title too long, no local signal, reads robotic.

---

### 2. Meta Description

- 145–160 characters
- Primary keyword present (not forced)
- Contains a clear CTA or value proposition
- Reads naturally — not stuffed

---

### 3. H1 Tag (Article Title)

- Exactly one H1
- Must contain or closely match the primary keyword
- Different from meta title (can be longer, more descriptive)
- Under 70 characters

**Common failures:** H1 identical to meta title, no H1 present, primary keyword absent.

---

### 4. Heading Structure (H2, H3)

- Logical H1 → H2 → H3 hierarchy (no skipping)
- At least 4 H2 sections in a 1,400+ word post
- At least 1 H2 contains the primary keyword or close variant
- Supporting keywords distributed across H2/H3 (not forced)
- FAQ section present as final H2 (minimum 4 questions)

---

### 5. Keyword Usage & Density

- Primary keyword in: H1, first 100 words, at least 2 H2/H3s, conclusion
- Primary keyword density: 0.8–1.5% (over 2% = over-optimisation risk)
- Supporting keywords distributed naturally
- LSI terms present
- No keyword cannibalisation

**Calculate:** (keyword occurrences ÷ total word count) × 100 = density %

**Common failures:** Keyword only in title/H1, density above 2%, no LSI terms.

---

### 6. Content Depth & E-E-A-T Signals

- Minimum 1,400 words (1,600+ aesthetics, 1,700+ slimming)
- At least 1 verifiable statistic or clinical reference
- Expert perspective demonstrated
- Personal/local context present (Malta references, Carisma-specific expertise)
- Medical disclaimers present for slimming/aesthetics
- No unsubstantiated health claims

**E-E-A-T checklist:**
- [ ] Experience: "at our clinic", "clients often ask us"
- [ ] Expertise: clinical/treatment knowledge beyond surface level
- [ ] Authoritativeness: references reputable sources
- [ ] Trust: no over-promising, accurate outcomes

---

### 7. Internal Linking

- Minimum 2 internal links (ideally 3)
- At least 1 link to a service/booking page
- At least 1 link to a related blog post (if available)
- Anchor text is descriptive (not "click here" or "read more")
- No links to 404 pages or irrelevant content

---

### 8. Local SEO Signals

- "Malta" or specific location in: H1 (or intro), at least 1 H2, body content
- Local context woven naturally (not just appended)
- Service area language: "women in Malta", "our Malta clinic"
- Does NOT read like templated content with "Malta" inserted clumsily

**Common failures:** "Malta" only in meta title, no local context in body.

---

### 9. AEO (Answer Engine Optimisation) Readiness

- FAQ section: minimum 4 questions in H3 format
- Each FAQ answer: 40–100 words
- Questions phrased exactly as a user would type in Google
- At least 1 FAQ targets a "People Also Ask" style question
- Definition of topic in first 100 words

---

### 10. CTA & Conversion Structure

- Clear CTA present (specific to the treatment/topic)
- CTA appears: end of post AND once mid-article
- No broken or generic CTA language ("learn more", "visit our website")
- Related offer from `config/offers.json` referenced if applicable

---

## Audit Output Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEO AUDIT REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Post: [title]
Brand: [brand]
Primary keyword: [keyword]
Word count: [count]

OVERALL STATUS: ✅ PASS / ❌ FAIL / ⚠️ CONDITIONAL PASS

━━ DIMENSION SCORES ━━
1. Title & Meta Title:        ✅ PASS / ❌ FAIL
2. Meta Description:          ✅ PASS / ❌ FAIL
3. H1 Tag:                    ✅ PASS / ❌ FAIL
4. Heading Structure:         ✅ PASS / ❌ FAIL
5. Keyword Usage:             ✅ PASS / ❌ FAIL — Density: X.X%
6. Content Depth & E-E-A-T:  ✅ PASS / ❌ FAIL
7. Internal Linking:          ✅ PASS / ❌ FAIL
8. Local SEO Signals:         ✅ PASS / ❌ FAIL
9. AEO Readiness:             ✅ PASS / ❌ FAIL
10. CTA & Conversion:         ✅ PASS / ❌ FAIL

━━ REQUIRED FIXES (blockers) ━━
[List each FAIL with specific, actionable fix]

━━ RECOMMENDED IMPROVEMENTS (non-blocking) ━━
[Optional improvements]

━━ ROUTING ━━
→ If PASS or CONDITIONAL PASS: Send to blog-tone-humanizer
→ If FAIL: Return to brand writer with this report for revision
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## YMYL Special Rules (Slimming & Medical Aesthetics)

- No unqualified health claims — "lose 10kg in a month" without supervision attribution = FAIL
- No scare tactics — health anxiety content = FAIL
- Medical disclaimers — "results may vary" and "consult a professional" required
- No fake statistics — must be from NHS, WHO, or peer-reviewed source
- Slimming threshold: minimum 1,600 words, minimum 2 evidence references

---

## Common SEO Failures

| Failure Pattern | Verdict |
|---|---|
| Primary keyword only in title/H1, missing from body | ❌ FAIL — Dimension 5 |
| FAQ section missing | ❌ FAIL — Dimension 9 |
| No internal link to booking page | ❌ FAIL — Dimension 7 |
| "Malta" appears only in meta title | ❌ FAIL — Dimension 8 |
| Post under 1,200 words | ❌ FAIL — Dimension 6 |
| CTA says "contact us" with no specificity | ❌ FAIL — Dimension 10 |
| Over 2% keyword density | ❌ FAIL — Dimension 5 |
| No first-paragraph definition | ⚠️ Conditional — Dimension 9 |
