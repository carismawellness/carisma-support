# Knowledge Base Keyword Tagging Guide

## Purpose

Keywords enable automatic matching when customers ask questions. The `/crmrespond` skill searches keywords to find relevant KB entries. Well-tagged keywords ensure customers receive accurate, helpful answers even if they phrase their question differently than our Q&A entries.

## Why Keywords Matter

- **Query Matching:** When a customer asks "How much does a massage cost?", our system must match them to pricing AND treatment entries, not just booking entries
- **Intent Recognition:** Keywords capture the underlying intent (cost, duration, eligibility) beyond the literal question
- **Synonym Support:** A customer asking about "rescheduling" must match both reschedule and appointment-related entries
- **Brand-Specific Matching:** SPA clients use "massage" and "sanctuary," while AES clients use "clinical" and "radiance"

## Tagging Rules

### 1. Minimum 5 Keywords Per Entry (Strict)

Every Q&A **must** have at least 5 keywords. No exceptions.

**Rationale:** 5 keywords ensures multiple entry points for customer queries. Single-keyword entries miss most search variations.

```
❌ BAD: ["booking"] — Only 1 keyword, too narrow
❌ BAD: ["booking", "appointment"] — Only 2 keywords
✅ GOOD: ["appointment", "booking", "how-to", "reserve", "schedule"] — 5+ keywords
✅ BETTER: ["appointment", "booking", "first-time", "how-to", "online", "phone", "reserve", "schedule"] — 8 keywords
```

### 2. Mix of Specificity Levels

Every keyword set must include broad, medium, and narrow keywords to match various customer search patterns.

#### Specificity Tiers

| Tier | Definition | Example | Why |
|------|-----------|---------|-----|
| **Broad** | General wellness concepts | "booking", "service", "treatment", "appointment" | Customers use everyday language first |
| **Medium** | Category-specific terms | "massage-treatment", "skin-rejuvenation", "slimming-package" | Mix of general + specific |
| **Narrow** | Specific scenarios/solutions | "same-day-booking", "emergency-rescheduling", "group-discount" | Targeted intent matching |

#### Example: "How do I book an appointment?"

```
❌ WRONG (all similar level):
["booking", "appointment", "online", "phone", "schedule"]

✅ RIGHT (mixed levels):
[
  "appointment",              ← Broad
  "booking",                  ← Broad
  "first-time",              ← Narrow (first-time customer scenario)
  "how-to",                  ← Narrow (instruction intent)
  "online-booking",          ← Medium (specific method)
  "phone-booking",           ← Medium (specific method)
  "reserve",                 ← Medium (synonym)
  "schedule"                 ← Broad
]
```

### 3. Include Common Misspellings & Synonyms

Capture how customers actually search, including common misspellings, regional variants, and synonyms.

#### Synonym Examples

| Term | Include Also |
|------|--------------|
| appointment | appointement (common misspelling), booking, reservation, reserve, slot |
| massage | rub, treatment, therapy, bodywork, spa-treatment |
| price | cost, fee, rate, investment, charge |
| cancel | cancellation, refund, withdrawal, back-out |
| results | benefits, improvements, outcomes, transformation, visible-change |
| duration | time, how-long, length, session-length |
| facial | face-treatment, skincare, skin-treatment, rejuvenation |
| Thai | thai-massage, thai-therapy |

#### Misspelling Examples

| Correct | Common Misspellings to Include |
|---------|-----------------------------:|
| appointment | appointement, appointmnt, apontment |
| cancellation | cancelation, cancellation |
| reschedule | reshedule, rescedule |
| aesthetic | aesthetic, aestetik |

### 4. Brand-Specific Keywords

Include keywords that reflect brand voice and positioning to help the system understand customer intent at the brand level.

#### SPA Keywords (Turkish Wellness Heritage)
```
wellness, relaxation, turkish-spa, hammam, massage, therapeutic,
rejuvenation, holistic, sanctuary, peace, tranquility, restore,
warm-stone, aromatic, spa-treatment, traditional, wellness-journey,
escape, stillness, body-mind-soul
```

#### AES Keywords (Clinical Aesthetic Results)
```
skin, aesthetic, clinical, procedure, results, treatment, rejuvenation,
anti-aging, glow, radiance, visible-change, enhancement, transformation,
skincare, face-treatment, body-contouring, non-invasive, youthful
```

#### SLIM Keywords (Weight Loss Support & Community)
```
weight-loss, slimming, journey, transformation, support, community,
relapse-normalized, healthy, wellness-journey, nutrition, guidance,
progress, lifestyle, sustainable, holistic-approach, accountability,
sessions, program, sustainable-change
```

### 5. Action Keywords (Intent Markers)

Always include keywords that signal the customer's underlying intent, not just their topic.

#### Intent Categories

| Intent | Keywords | When |
|--------|----------|------|
| **How-To / Process** | how-to, how, steps, process, method, procedure, guide | "How do I book?", "What's the process?" |
| **First-Time** | first-time, new-customer, beginner, first-visit, what-to-expect | "I've never been..." |
| **Cost / Budget** | cost, pricing, price, investment, fee, rate, charge, budget | "How much?", "What's the price?" |
| **Duration / Timeline** | duration, time, how-long, length, how-many-weeks, session-length | "How long does it take?" |
| **Results / Outcomes** | results, benefits, outcome, transformation, visible-change, improvement | "What will I see?", "Does it work?" |
| **Eligibility / Safety** | contraindications, who-cannot, unsuitable, age-requirement, pregnancy, medical-condition | "Can I get...?", "Is it safe?" |
| **Cancellation / Changes** | cancellation, cancel, reschedule, modify, change, postpone, refund | "Can I cancel?" |
| **Comparison** | difference, versus, vs, compare, which-one, best-option, alternative | "What's the difference?" |

### 6. Format Rules

All keywords must follow consistent formatting for reliable matching.

```
✅ CORRECT FORMAT:
- Lowercase only
- Single words or 2-3 word phrases
- Multi-word phrases hyphenated (no spaces)
- No punctuation, numbers only if necessary
- No articles (a, the, an)
- Alphabetically sorted in JSON array

❌ INCORRECT FORMAT:
["Booking", "Appointment "]           ← Mixed case
["how to book", "online book"]        ← Spaces instead of hyphens
["€199", "booking;", "call!"]         ← Punctuation/symbols
["a booking", "the appointment"]      ← Articles
```

#### Examples

```json
✅ CORRECT:
["appointment", "booking", "cancel", "free", "how-to", "online", "phone", "reschedule"]

❌ INCORRECT:
["Appointment", "Book Online", "Cancel Appointment", "How To Book", "Phone:"]
```

### 7. Keyword Count Targets

- **Minimum:** 5 keywords (absolute floor)
- **Recommended:** 8-10 keywords (optimal coverage)
- **Maximum:** No hard limit, but diminishing returns above 15

```
5 keywords  = 60% of variations covered
8 keywords  = 85% of variations covered
10 keywords = 95% of variations covered
15+ keywords = Diminishing returns, maintain focus
```

## Step-by-Step Tagging Process

### For Each Q&A Entry:

1. **Extract Topic Keywords (3 keywords)**
   - Read the question title
   - Identify the main topic (e.g., "booking", "pricing", "duration")
   - Extract synonyms (e.g., "reserve", "schedule", "appointment")

2. **Extract Intent Keywords (2 keywords)**
   - What is the customer trying to accomplish?
   - Include how-to, cost, duration, results, eligibility, etc.
   - Example: "How do I book?" → Intent = how-to + first-time

3. **Add Brand-Specific Keywords (1-2 keywords)**
   - Include brand voice and positioning terms
   - Make sure the keyword set feels authentic to the brand

4. **Add Detailed/Narrow Keywords (2 keywords)**
   - Capture specific scenarios from the answer
   - Example: "Can reschedule within 24 hours" → "24-hour", "free-rescheduling"

5. **Add Common Variations (1-2 keywords)**
   - Misspellings, synonyms, regional terms
   - Example: "payment" → also "pay", "invoice"

6. **Review & Sort**
   - Alphabetize keywords
   - Remove duplicates
   - Verify 5+ keywords exist
   - Confirm mix of specificity levels

### Quality Checklist

For **each individual keyword**:
- [ ] Is it lowercase?
- [ ] Is it hyphenated if multi-word?
- [ ] Would a customer use this word when searching?
- [ ] Is it brand-appropriate?
- [ ] Does it avoid jargon or explains jargon clearly?
- [ ] Is it spelled correctly (including common misspellings)?

For **the entire keyword set** (5+ keywords):
- [ ] Minimum 5 keywords present?
- [ ] Mix of specificity levels? (Broad + Medium + Narrow)
- [ ] Includes common synonyms?
- [ ] Includes action/intent keywords (how-to, cost, etc.)?
- [ ] Includes brand-specific words where relevant?
- [ ] Keywords alphabetically ordered?
- [ ] No duplicate keywords?

## Real-World Examples

### Example 1: "How do I book an appointment?"

**Question Analysis:**
- Topic: Booking/appointment
- Intent: How-to, first-time customer
- Brand: ALL (universal across brands)

**Tagging Process:**
1. Topic keywords: "appointment", "booking", "reserve", "schedule"
2. Intent keywords: "how-to", "first-time"
3. Brand keywords: (N/A for ALL brands)
4. Detailed keywords: "online-booking", "phone-booking", "24/7"
5. Variations: "appointement" (misspelling), "slot"

**Final Keywords (8):**
```json
[
  "appointment",
  "booking",
  "first-time",
  "how-to",
  "online-booking",
  "phone-booking",
  "reserve",
  "schedule"
]
```

---

### Example 2: "What results can I expect from aesthetic treatments?"

**Question Analysis:**
- Topic: Aesthetic treatments, results
- Intent: Expectations, visible outcomes, timeline
- Brand: AES

**Tagging Process:**
1. Topic keywords: "aesthetic", "treatment", "results", "skin", "appearance"
2. Intent keywords: "results", "what-to-expect", "benefits"
3. Brand keywords: "clinical", "anti-aging", "radiance"
4. Detailed keywords: "timeline", "weeks", "visible-change"
5. Variations: "improvements", "outcome", "transformation"

**Final Keywords (10):**
```json
[
  "aesthetic",
  "anti-aging",
  "benefits",
  "clinical",
  "improvements",
  "radiance",
  "results",
  "skin",
  "timeline",
  "transformation",
  "what-to-expect"
]
```

---

### Example 3: "What are the current package prices for Slimming programs?"

**Question Analysis:**
- Topic: Pricing, slimming packages
- Intent: Cost, investment, comparison
- Brand: SLIM

**Tagging Process:**
1. Topic keywords: "pricing", "price", "cost", "package", "slimming"
2. Intent keywords: "cost", "investment", "comparison"
3. Brand keywords: "transformation", "wellness-journey", "support"
4. Detailed keywords: "starter", "essential", "premium"
5. Variations: "rate", "fee", "charge", "investement" (misspelling)

**Final Keywords (11):**
```json
[
  "cost",
  "essential",
  "fee",
  "investement",
  "investment",
  "package",
  "packaging",
  "premium",
  "price",
  "pricing",
  "rate",
  "slimming",
  "starter",
  "support",
  "transformation",
  "wellness-journey"
]
```

---

### Example 4: "What happens if I miss my appointment?"

**Question Analysis:**
- Topic: No-show policy, missed appointment
- Intent: Consequences, fees, emergency handling
- Brand: ALL

**Tagging Process:**
1. Topic keywords: "miss", "no-show", "absence", "appointment"
2. Intent keywords: "policy", "consequences", "fee"
3. Brand keywords: (N/A for ALL)
4. Detailed keywords: "emergency", "grace-period", "late"
5. Variations: "missed", "no-show-fee", "absent"

**Final Keywords (10):**
```json
[
  "absence",
  "appointment",
  "charge",
  "emergency",
  "fee",
  "grace-period",
  "late",
  "miss",
  "no-show",
  "no-show-fee",
  "policy"
]
```

## Common Pitfalls to Avoid

| Pitfall | Example | Fix |
|---------|---------|-----|
| All keywords same specificity | ["booking", "appointment", "online", "phone", "call"] | Add narrow: "first-time", "how-to", "24-hour" |
| Missing synonyms | ["cancel"] (only one form) | Add: "cancel", "cancellation", "cancellation-policy" |
| Too technical/jargon | ["cryolipolysis", "myofascial-release"] | Add plain language: "cool-sculpting", "muscle-release" |
| Brand-agnostic | ["treatment"] for AES only | Add brand words: "aesthetic", "clinical", "skin" |
| Ignoring misspellings | ["schedule"] (not "shedule") | Test with common misspellings |
| Over-specificity | ["fresha-app", "master-card", "tuesday-10am"] | Keep general: "online-booking", "card", "appointment-time" |
| Missing intent keywords | ["massage"] only | Add: "how-to", "duration", "benefits", "cost" |

## Monthly Keyword Review

Keywords should be reviewed and updated monthly using this process:

### 1. Collect Customer Queries
- Export chat logs from Fresha, email, and social inquiries
- Note queries that resulted in NO match or LOW match scores
- Flag misspellings and variations customers actually use

### 2. Identify Gaps
- Queries that didn't match any KB entry
- Queries that matched but with low confidence
- New terminology or customer language evolving

### 3. Update Keywords
- Add new keywords discovered from actual customer queries
- Add common misspellings from real support conversations
- Remove keywords that never appear in customer language

### 4. Test Coverage
- Re-test previous "no match" queries against updated KB
- Measure improvement in match rate and confidence scores

### 5. Document Changes
- Update this guide with new patterns discovered
- Add new examples to the "Examples" section
- Update brand-specific keywords if brand positioning evolves

### Update Triggers

Update keywords immediately (not waiting for monthly review) if:
- A new offer launches with different terminology
- Brand messaging or positioning changes
- A customer service conversation reveals common confusion
- Search analytics show a high-volume query that doesn't match well

## Tools & Automation

### Using `kb_keyword_tagger.py` Helper

For consistent tagging when adding new entries:

```bash
python tools/kb_keyword_tagger.py \
  --question "How do I reschedule?" \
  --answer "You can reschedule..." \
  --brand "SPA"
```

The tool will:
1. Extract key terms automatically
2. Suggest keywords based on patterns
3. Ensure 5+ keywords
4. Format and alphabetize
5. Validate against this guide

**Note:** Tool suggestions are starting points only. Always review and refine suggested keywords manually to ensure accuracy and brand alignment.

## FAQ

**Q: Should I include price amounts in keywords?**
A: Yes, for specific popular prices (€199, €50, etc.). Customer might search "€199 slimming" or "€50 gift card." Include price keywords but don't rely on them alone—also include "price", "cost", "pricing".

**Q: What about emoji or special characters?**
A: No. Keywords are plain text, lowercase, alphanumeric only (plus hyphens for multi-word phrases). Emoji and special characters break matching.

**Q: Should I use acronyms like "FAQ" or "Q&A"?**
A: Generally no, unless customers specifically search those acronyms. "FAQ" is for internal use. Use full terms: "frequently-asked-questions", "questions-answers".

**Q: How do I tag brand-specific entries consistently?**
A: Use the Brand Keywords section above as reference. For SPA, always include at least 1-2 words from the wellness/relaxation tier. For AES, include clinical/aesthetic words. For SLIM, include transformation/journey words.

**Q: Can I tag with phrases longer than 3 words?**
A: Avoid it. Keep to 1-2 words max. Longer phrases are too specific and reduce matching. Instead of "24-hour-cancellation-policy", use "24-hour", "cancellation", "policy" as separate keywords.

**Q: What if a question applies to multiple brands?**
A: Use broad, brand-neutral keywords ("appointment", "booking", "treatment") plus brand-specific keywords that apply universally ("wellness", "service", "customer"). Test with multi-brand queries.

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-22 | Initial guide. Established 5-keyword minimum, specificity mix, format rules, brand-specific keywords, action keywords. |

---

**Last Updated:** 2026-02-22
**Maintained By:** CRM Team
**Next Review:** 2026-03-22
