# SEO Optimisation Strategy

**Last updated:** 2 March 2026
**Brands:** Carisma Spa, Carisma Aesthetics, Carisma Slimming
**Review cycle:** Quarterly

---

## The SEO Flywheel

The Carisma SEO strategy operates as a self-reinforcing flywheel. Each component feeds the next, compounding results over time.

```
   ┌──────────────────────────────────────────────────┐
   │                                                    │
   ▼                                                    │
GSC Data ──> Quick-Win Analysis ──> GBP Keywords ──> GBP Posts
                  │                                      │
                  │                                      ▼
                  │                              Better Local Rankings
                  │                                      │
                  └──> Wix Meta Optimisation              │
                              │                          │
                              ▼                          ▼
                        Higher CTR ──> More Clicks ──> More Impressions
                                                         │
                                                         │
                              More Data ◄────────────────┘
```

**How it works:**
1. **GSC data** reveals which queries people use to find (or almost find) Carisma brands
2. **Quick-Win Analysis** categorises these into actionable buckets with clear next steps
3. **GBP keyword targeting** ensures the most valuable queries appear in Google Business Profile posts, strengthening local ranking signals
4. **Better local rankings** lead to more impressions in Search and Maps
5. **More impressions** generate more data in GSC, making the next analysis richer
6. **Wix meta optimisation** fixes pages that rank well but fail to attract clicks, improving CTR
7. The cycle accelerates as the keyword banks grow and rankings improve

---

## Quick-Win Categories

### 1. Almost Page 1 (Position 8-20) -- HIGH PRIORITY

**What:** Queries where the brand already ranks on page 1-2 but has not yet broken into the top results.

| Criteria | Value |
|----------|-------|
| Position range | 8-20 |
| Minimum impressions | 50 |
| Action | Target aggressively in GBP posts |
| Keyword bank destination | Primary |

**Why it matters:** These queries need the smallest push to reach page 1. A few well-targeted GBP posts with these keywords can provide the local ranking signal needed to climb 3-5 positions.

**Example:** If "couples massage Malta" ranks at position 12 with 80 impressions, adding it to the GBP keyword rotation could push it onto page 1 within 2-4 weeks.

### 2. Low CTR (Position 1-10, CTR < 3%) -- HIGH PRIORITY

**What:** Queries where the brand already appears on page 1 but very few people click through.

| Criteria | Value |
|----------|-------|
| Position range | 1-10 |
| Maximum CTR | 3% |
| Action | Pass to Wix SEO Optimiser for meta rewrite |
| Keyword bank destination | Primary |

**Why it matters:** These pages are visible but not compelling. The meta title or description is failing to convert impressions into clicks. A meta rewrite can double CTR without any ranking improvement needed.

**Example:** If "spa day Malta" ranks at position 4 but has 1.5% CTR, the meta description likely does not differentiate Carisma from competitors. Rewriting it with pricing (from EUR 89), unique selling points (Turkish spa heritage), and a clear CTA can dramatically improve click-through.

### 3. Emerging Queries (New in last 7 days) -- MEDIUM PRIORITY

**What:** Queries that have appeared for the first time in the last 7 days, indicating new search demand.

| Criteria | Value |
|----------|-------|
| Lookback period | 7 days |
| Minimum impressions | 10 |
| Action | Capitalise early with a GBP post |
| Keyword bank destination | Secondary |

**Why it matters:** New queries represent emerging demand. Being the first local business to target them in GBP content creates a first-mover advantage. These often correspond to seasonal shifts, trending treatments, or competitor activity.

**Example:** If "hydrafacial Malta" suddenly starts appearing with 15 impressions in a 7-day window, creating a GBP post about Carisma's facial treatments targeting this keyword captures early interest before competitors react.

### 4. Local Intent Queries -- HIGH PRIORITY

**What:** Any query containing Malta-specific location terms, regardless of position.

| Criteria | Value |
|----------|-------|
| Keyword triggers | malta, gozo, valletta, sliema, st julian, st julians, floriana, near me, mellieha, qawra, paceville |
| Action | Perfect for GBP, high priority |
| Keyword bank destination | Local |

**Why it matters:** Local intent queries are the core of GBP optimisation. Users searching with location terms are actively seeking nearby services and are the most likely to convert. GBP posts targeting these keywords directly influence Google Maps rankings.

**Example:** "spa near me Malta" or "botox St Julian's" are high-intent local queries that convert well when matched with targeted GBP content.

---

## Keyword Priority Framework

When multiple quick-win categories overlap, use this priority order to determine action:

| Priority | Category | Action | Destination |
|----------|----------|--------|-------------|
| 1 | Local Intent + Almost Page 1 | Target immediately in next GBP post cycle | Primary + Local banks |
| 2 | Low CTR (Page 1) | Pass to Wix SEO Optimiser + add to GBP rotation | Primary bank |
| 3 | Almost Page 1 (non-local) | Add to GBP keyword rotation | Primary bank |
| 4 | Local Intent (already ranking well) | Maintain in GBP rotation | Local bank |
| 5 | Emerging + Local | Create GBP post within 48 hours | Secondary + Local banks |
| 6 | Emerging (non-local) | Add to secondary bank, monitor | Secondary bank |

**Cross-category keywords:** A query can match multiple categories (e.g., "massage near me Malta" is both Local Intent and Almost Page 1). When this happens, it receives the highest applicable priority and is added to all relevant keyword bank categories.

---

## Integration: GSC Hunter --> GBP Posting System

The GSC Quick-Win Hunter feeds directly into the GBP Posting System through auto-addition files.

### Flow

1. GSC Hunter analyses Search Console data and identifies quick-win keywords
2. New keywords (not already in existing banks) are written to `marketing/google-gmb/keywords_{brand}_auto_additions.json`
3. The `gbp_generate_posts.py` tool calls `merge_auto_additions()` during keyword bank loading
4. Auto-addition keywords are merged into the appropriate categories (primary, secondary, local)
5. The next GBP post generation cycle includes these keywords in rotation

### Auto-Addition File Format

```json
{
  "brand_id": "carisma_spa",
  "generated_at": "2026-03-02T09:00:00",
  "source": "gsc_quick_win_finder",
  "keywords": [
    {
      "keyword": "couples massage Malta",
      "category": "primary",
      "source_category": "almost_page_1",
      "position": 12.3,
      "impressions": 85,
      "ctr": 0.024,
      "priority": "high"
    }
  ]
}
```

### Deduplication

- Keywords are compared case-insensitively against all existing keyword bank entries
- If a keyword already exists in any category, it is not added again
- Maximum 10 new keywords per brand per run (configurable in `quick-win-criteria.json`)

---

## Integration: GSC Hunter --> Wix SEO Optimiser

Low CTR keywords trigger the Wix SEO pipeline.

### Flow

1. GSC Hunter identifies queries with position 1-10 but CTR below 3%
2. The associated landing pages are identified from GSC data
3. These page-keyword pairs are flagged in the quick-wins report
4. The Wix SEO Auto-Optimiser (monthly cycle) picks up flagged pages
5. Meta titles and descriptions are rewritten to improve click-through
6. Next GSC cycle measures CTR improvement

### What Gets Optimised

| Element | Optimisation Approach |
|---------|----------------------|
| Meta title | Include the target keyword + differentiator (pricing, heritage, qualification) |
| Meta description | Clear value proposition, specific pricing where applicable, strong CTA |
| H1 heading | Align with the primary target keyword |
| Schema markup | Ensure LocalBusiness schema is present with correct NAP data |

---

## KPIs

### Primary Metrics

| KPI | Target | Measurement |
|-----|--------|-------------|
| Keyword coverage | 80% of quick-win keywords in GBP rotation within 2 cycles | Count of quick-win keywords present in GBP keyword banks |
| Ranking improvements | 30% of "Almost Page 1" keywords move to page 1 within 8 weeks | GSC position tracking, compare position at discovery vs 8 weeks later |
| CTR improvements | 50% improvement on flagged low-CTR pages within 4 weeks of meta rewrite | GSC CTR data before/after optimisation |
| Organic traffic growth | 10% quarter-on-quarter increase per brand | GSC total clicks, segmented by brand |

### Secondary Metrics

| KPI | Target | Measurement |
|-----|--------|-------------|
| New keywords discovered per cycle | 5-15 per brand | Count from quick-wins report |
| Auto-additions accepted | 90%+ remain in rotation after human review | Keyword bank audit |
| Emerging keyword capture rate | First GBP post within 1 week of emergence | Time from first appearance to first GBP mention |
| GBP post keyword freshness | 20%+ of keywords in each post from recent GSC discoveries | Keyword source tracking in post log |

### Tracking

- All KPIs are logged to Google Sheets in the "SEO Quick Wins" tab
- Historical data enables trend analysis across cycles
- Quarterly reviews assess whether targets need adjusting based on brand maturity and competition

---

## Brand-Specific Considerations

### Carisma Spa (carismaspa.com)
- **Highest keyword volume** due to broad "spa Malta" queries
- **5 hotel locations** mean location-specific keywords are especially valuable (e.g., "spa Qawra", "spa Mellieha")
- Focus on differentiating hotel spa queries from standalone spa queries
- Turkish heritage keywords ("hammam Malta", "Turkish bath Malta") are unique differentiators

### Carisma Aesthetics (carismaaesthetics.com)
- **Treatment-specific queries** dominate (botox, fillers, lip filler, etc.)
- **Consultation-first messaging** should be reflected in meta descriptions
- Compliance: meta descriptions must not make medical claims or promise results
- "Free consultation" is a powerful CTR driver in meta descriptions

### Carisma Slimming (carismaslimming.com)
- **Named technology queries** (CoolSculpting Malta, EMSculpt Malta) are high-intent
- **Price transparency** (EUR 199) differentiates from competitors in meta descriptions
- Sensitive language: meta descriptions must avoid shame language
- Doctor-led authority should be emphasised in title tags

---

**Document Control:**
- Created: 2 March 2026
- Author: SEO Strategy Agent
- Review cycle: Quarterly refresh
- Source data: GSC analysis, GBP keyword banks, brand config
