# Competitor Intelligence Analysis Templates

These templates structure the AI analysis layer. Every ad fetched and every weekly report follows these formats to ensure consistent, actionable intelligence.

---

## 1. New Ad Analysis Template

Used for every new competitor ad detected during a weekly scan.

```json
{
  "ad_id": "string — Meta Ad Library ID",
  "page_id": "string — Competitor Page ID",
  "page_name": "string — Competitor business name",
  "competitor_id": "string — Internal competitor ID (e.g. competitor_spa_01)",
  "category": "string — spa / aesthetics / slimming",
  "first_seen": "date — YYYY-MM-DD when first detected",
  "last_seen": "date — YYYY-MM-DD of most recent scan where ad was active",
  "days_active": "integer — calculated from first_seen to last_seen",
  "status": "string — active / inactive",
  "body_text": "string — Full ad copy text",
  "link_url": "string — Destination URL from the ad",
  "call_to_action": "string — CTA button type (e.g. BOOK_NOW, LEARN_MORE)",
  "media_type": "string — IMAGE / VIDEO / CAROUSEL / COLLECTION",
  "start_date": "date — Ad start date from Meta",
  "analysis": {
    "hook_type": "string — question / bold_claim / testimonial / fear_based / aspirational / educational / social_proof",
    "hook_text": "string — First sentence or line of the ad copy",
    "pain_point": "string — ageing / confidence / time_pressure / affordability / trust / body_image / stress / self_care_guilt",
    "offer_type": "string — discount / free_consultation / package_deal / limited_time / new_service / seasonal / none",
    "offer_details": "string — Extracted offer specifics (pricing, terms, expiry)",
    "creative_format": "string — static_image / video / carousel / collection / slideshow",
    "media_style": "string — lifestyle / product / ugc / text_overlay / before_after / animation / talking_head",
    "target_audience": "string — women_25_34 / women_35_44 / women_45_plus / couples / gift_buyers / men",
    "pricing_visible": "boolean",
    "pricing_details": "string — Extracted pricing (e.g. 'EUR 89', 'from EUR 180', 'Free consultation')",
    "cta_type": "string — book_now / learn_more / send_message / call / shop_now / get_offer",
    "compliance_flags": ["array — medical_claims / shame_language / before_after / guaranteed_results / clean"],
    "key_insight": "string — One-sentence summary of what makes this ad notable"
  }
}
```

---

## 2. Weekly Intelligence Brief Template

Generated every Sunday after the weekly scan. This is the primary deliverable.

```markdown
# Competitor Intelligence Brief — Week of {YYYY-MM-DD}

## Executive Summary

{2-3 sentence overview of the week's key findings. Lead with the most actionable insight.}

**Key numbers:**
- Total active competitor ads: {count}
- New ads this week: {count}
- Killed ads this week: {count}
- Long-running winners (30+ days): {count}

---

## New Ads Detected

### Spa Competitors

| Competitor | Ad ID | Hook Type | Offer | Format | Pricing | Key Insight |
|------------|-------|-----------|-------|--------|---------|-------------|
| {name} | {id} | {type} | {offer} | {format} | {price} | {insight} |

### Aesthetics Competitors

| Competitor | Ad ID | Hook Type | Offer | Format | Pricing | Key Insight |
|------------|-------|-----------|-------|--------|---------|-------------|
| {name} | {id} | {type} | {offer} | {format} | {price} | {insight} |

### Slimming Competitors

| Competitor | Ad ID | Hook Type | Offer | Format | Pricing | Key Insight |
|------------|-------|-----------|-------|--------|---------|-------------|
| {name} | {id} | {type} | {offer} | {format} | {price} | {insight} |

---

## Killed Ads

Ads that were active last week but are no longer running. Short-lived ads (<7 days) may indicate failed tests.

| Competitor | Ad ID | Days Active | Likely Reason |
|------------|-------|-------------|---------------|
| {name} | {id} | {days} | {reason} |

---

## Long-Running Winners (30+ Days)

These ads have survived Meta's optimisation and the advertiser's review. Study them closely.

| Competitor | Ad ID | Days Active | Hook Type | Offer | Format | Key Insight |
|------------|-------|-------------|-----------|-------|--------|-------------|
| {name} | {id} | {days} | {type} | {offer} | {format} | {insight} |

---

## Pricing Intelligence

### Current Competitor Price Points

| Vertical | Competitor | Service/Offer | Price | Framing | Carisma Comparison |
|----------|------------|---------------|-------|---------|-------------------|
| Spa | {name} | {service} | {price} | {framing} | {comparison} |
| Aesthetics | {name} | {service} | {price} | {framing} | {comparison} |
| Slimming | {name} | {service} | {price} | {framing} | {comparison} |

### Pricing Trends
{Summary of any pricing changes, new offers, or competitive pricing moves.}

---

## Creative Trends

### Format Distribution This Week

| Format | Count | % of Total | Trend vs Last Week |
|--------|-------|------------|-------------------|
| Static image | {n} | {%} | {up/down/flat} |
| Video | {n} | {%} | {up/down/flat} |
| Carousel | {n} | {%} | {up/down/flat} |
| Collection | {n} | {%} | {up/down/flat} |

### Hook Type Distribution

| Hook Type | Count | % of Total | Top Performer |
|-----------|-------|------------|---------------|
| Question | {n} | {%} | {competitor + ad_id} |
| Bold claim | {n} | {%} | {competitor + ad_id} |
| Testimonial | {n} | {%} | {competitor + ad_id} |
| Aspirational | {n} | {%} | {competitor + ad_id} |
| Educational | {n} | {%} | {competitor + ad_id} |

### Notable Creative Approaches
{2-3 paragraphs on creative patterns, emerging trends, or standout approaches.}

---

## Recommended Actions

### Immediate (This Week)
1. {Specific action based on new competitor ad or pricing change}
2. {Specific action based on creative trend or gap}

### Short-Term (Next 2-4 Weeks)
1. {Strategic response to competitor positioning}
2. {Creative test inspired by competitor intelligence}

### Monitor
1. {Competitor activity to watch closely}
2. {Emerging trend to track over time}

---

**Report generated:** {timestamp}
**Data source:** Meta Ad Library API via mcp__meta-ads__search_ads_archive
**Competitors scanned:** {count active} of {count total configured}
**Previous snapshot:** {date of previous snapshot or "First run — no previous snapshot"}
```

---

## 3. Competitor Profile Template

Per-competitor tracking document. Updated incrementally with each weekly scan.

```json
{
  "competitor_id": "string — Internal ID (e.g. competitor_spa_01)",
  "name": "string — Business name",
  "category": "string — spa / aesthetics / slimming",
  "page_id": "string — Meta Page ID",
  "website": "string — Primary website URL",
  "facebook_page_url": "string — Facebook page URL",
  "instagram_handle": "string — Instagram handle",
  "location": "string — Malta location",

  "current_ads": {
    "total_active": "integer",
    "last_updated": "date — YYYY-MM-DD",
    "ads": [
      {
        "ad_id": "string",
        "body_text": "string",
        "media_type": "string",
        "start_date": "date",
        "days_active": "integer",
        "analysis": "{see New Ad Analysis Template above}"
      }
    ]
  },

  "historical_patterns": {
    "avg_active_ads": "float — Average number of concurrent active ads",
    "avg_ad_lifespan_days": "float — Average days an ad runs",
    "new_ads_per_month": "float — Average new ads launched per month",
    "peak_posting_months": ["array — Months with highest ad activity"],
    "preferred_formats": {
      "static_image": "float — percentage",
      "video": "float — percentage",
      "carousel": "float — percentage",
      "collection": "float — percentage"
    },
    "preferred_hooks": ["array — Most common hook types"],
    "typical_offers": ["array — Most common offer types"]
  },

  "pricing_history": [
    {
      "date": "date — YYYY-MM-DD",
      "service": "string — Service or offer name",
      "price": "string — Displayed price",
      "framing": "string — How price is framed (from, exact, range, etc.)"
    }
  ],

  "strengths": ["array — Observed competitive strengths"],
  "weaknesses": ["array — Observed competitive weaknesses"],

  "notes": "string — Free-form observations and insights",
  "last_scan_date": "date — YYYY-MM-DD",
  "total_scans": "integer — Number of weekly scans that included this competitor"
}
```

---

## Usage Notes

- The **New Ad Analysis Template** is applied by the AI agent during Phase 3 (Compare & Analyse) of the competitor spy workflow.
- The **Weekly Intelligence Brief** is the primary output — it goes to Google Sheets and is emailed to the team.
- The **Competitor Profile** is a living document that grows richer with each weekly scan, enabling trend analysis over time.
- All templates use UK English throughout.
- Pricing is always captured in EUR with the exact framing used by the competitor.

---

**Last Updated:** 2026-03-02
**Version:** 1.0
