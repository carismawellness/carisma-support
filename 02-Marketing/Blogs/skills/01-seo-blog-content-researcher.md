# SEO Blog Content Researcher

**Skill name:** `seo-blog-content-researcher`
**Pipeline position:** Step 1 — before Gate 1
**Output:** Complete topic briefs for brand writers

---

## Context

- **Market:** Malta. Small market, lower competition, faster ranking (4–8 weeks vs 6+ months).
- **Target audience:** Women 25–55 in Malta. Multi-language: English primary, Maltese, French, Italian, German.
- **Business model:** Local service bookings. Blog = top-of-funnel awareness + mid-funnel trust.
- **SEO priority stack:** GBP > Reviews > Citations > On-page > Blog
- **Brand voice files:** `config/brand-voice/spa.md`, `config/brand-voice/aesthetics.md`, `config/brand-voice/slimming.md`

---

## Phase 1: Gather Inputs

Extract or ask for:
- Which brand(s)? (spa / aesthetics / slimming / all)
- Time period? (monthly / quarterly)
- Existing published content? (avoid duplicates)
- Active offers? (check `config/offers.json`)
- Competitor domains? (check `config/competitors.json`)

---

## Phase 2: Keyword Research Framework

### Seed Keywords by Brand

**Spa:** `[treatment] Malta`, `[treatment] benefits`, `what is [treatment]`, `spa day Malta`
**Aesthetics:** `[treatment] Malta`, `how does [treatment] work`, `[treatment] vs [treatment]`, `[treatment] cost Malta`
**Slimming:** `[treatment] Malta`, `how to lose weight [struggle]`, `[body concern] treatment Malta`, `weight loss programme Malta`

### Search Intent Classification

| Intent Type | Example | Blog Potential |
|---|---|---|
| **Informational** | "how does HIFU work" | HIGH — best for blogs |
| **Comparison** | "botox vs filler Malta" | HIGH — converts well |
| **Local** | "spa near me Malta" | MEDIUM |
| **Commercial** | "best aesthetics clinic Malta" | MEDIUM |
| **Transactional** | "book botox Malta" | LOW — belongs on service page |

**Prioritise informational and comparison queries for blogs.**

### Keyword Scoring Criteria

- Malta relevance
- Ranking difficulty (Malta = small market = most keywords low-medium difficulty)
- Conversion intent (does ranking lead to bookings?)
- Brand alignment
- Content gap (is Carisma missing this?)

### Topic Clustering

Group keywords into clusters. Each cluster = one blog post.

```
Primary keyword: "what is HIFU facial treatment"
Supporting keywords: "HIFU vs botox", "HIFU results", "HIFU Malta", "how long does HIFU last"
Content type: Educational explainer
Intent: Informational
Word count: 1,400–1,800 words
Brand: Aesthetics
```

---

## Phase 3: Competitor Content Gap Analysis

If competitor domains available:
1. Topics competitors rank for that Carisma does not cover
2. Questions competitors answer that Carisma hasn't addressed
3. Formats that perform well (listicles, how-tos, comparisons)
4. Outdated competitor content Carisma could improve upon

---

## Phase 4: Prioritisation

```
PRIORITY SCORE = (Search intent strength × 2) + Conversion potential + Content gap + Malta relevance
```

Deliver ranked list. Top 8 = monthly plan (2 per brand, aesthetics gets 2–3 given highest intent density).

---

## Phase 5: Topic Brief Output Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOPIC BRIEF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brand: [Carisma Spa / Aesthetics / Slimming]
Writer skill: [blog-writer-spa / -aesthetics / -slimming]

PRIMARY KEYWORD: [exact keyword]
SUPPORTING KEYWORDS: [3-5 secondary keywords]
SEARCH INTENT: [Informational / Comparison / Local]

WORKING TITLE: [H1 draft — include primary keyword]
META TITLE: [60 chars max — primary keyword + brand modifier]
META DESCRIPTION: [155 chars max — include keyword + CTA]

RECOMMENDED STRUCTURE:
- H1: [title]
- Intro (150 words): Hook + problem acknowledgment + what reader will learn
- H2: [section 1 — definition/what it is]
- H2: [section 2 — how it works]
- H2: [section 3 — benefits / who it's for]
- H2: [section 4 — what to expect / process]
- H2: [section 5 — FAQs — AEO-ready question format]
- CTA section

WORD COUNT TARGET: [1,400–2,000 words]
LOCAL SIGNALS: Malta, [specific location if relevant], Maltese lifestyle references
INTERNAL LINKS TO ADD: [list 2-3 internal pages to link to]
SUPPORTING EVIDENCE: [statistics, studies, claims to verify]
RELATED OFFER: [from config/offers.json]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Malta-Specific Notes

- Population ~500k — search volumes low but competition very low
- Seasonal patterns: summer (slimming/beach), January (new year), March–May (wedding season)
- Language: English-first; consider Maltese-language posts for high-volume local terms
- Cultural context: Mediterranean lifestyle, Catholic social norms, strong family orientation

---

## Common Failures to Avoid

| Failure | Fix |
|---|---|
| Picking keywords with zero Malta relevance | Always validate local context |
| Targeting transactional keywords for blogs | Informational/comparison only |
| Suggesting duplicate topics already published | Check existing content first |
| Ignoring active offers | Blog CTAs must support current offers |
| Keywords without topic briefs | Always deliver complete brief |
| Forgetting YMYL rules for slimming | Flag all health claims — require evidence |
