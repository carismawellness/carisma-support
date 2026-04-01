---
name: occasion-campaigns
description: Use when planning occasion-based Meta campaigns for Carisma brands. Contains the company's occasion calendar with dates, offers per brand, and campaign window rules. Invoked during Phase 2 of the calendar-strategy master skill to generate occasion campaigns that layer on top of evergreen Meta campaigns.
---

# Occasion Campaign Planner

## Overview

This skill owns the company's **official occasion calendar** — the annual cycle of holidays, awareness days, and seasonal themes that drive occasion-based Meta campaigns for all three Carisma brands.

**Core principle:** Every occasion campaign starts **minimum 2 weeks before** the occasion date. Occasion campaigns go in Meta name/budget rows **immediately after** the last evergreen campaign — never in a random row.

## When to Use

- Building a quarterly or monthly marketing calendar (Phase 2 of calendar-strategy)
- Planning which occasion campaigns to run for an upcoming period
- Checking which occasions have brand-specific offers
- Determining campaign windows and date ranges for seasonal campaigns

## When NOT to Use

- Evergreen (always-on) campaigns — use `meta-strategist` instead
- Google Ads campaigns — use `google-ads-strategist` instead
- Email/SMM/WhatsApp content planning — those skills reference this calendar but execute independently

## The Occasion Calendar

Load the structured data from `marketing/marketing-calendar/occasions/occasion-calendar.json` — it contains all 12 months with dates, offers per brand, and campaign window rules.

### Annual Overview

| Month | Occasion | SPA Offer | Aesthetics Offer | Slimming Offer |
|-------|----------|-----------|------------------|----------------|
| Jan | New Year New Me | Book 3 get 1 free | TBD | Book 3 get 1 free |
| Feb | Valentine's Day | 50% off your friend | TBD | 50% off your friend |
| Mar | Women's Day | TBD | TBD | TBD |
| Apr | Easter / Summer Ready | TBD | TBD | TBD |
| May | Mother's Day / Summer Ready | TBD | TBD | TBD |
| Jun | Father's Day / Summer Ready | TBD | TBD | TBD |
| Jul | Summer Sale (PRIME DAY?) | TBD | TBD | TBD |
| Aug | TBD | TBD | TBD | TBD |
| Sep | Back to School | TBD | TBD | TBD |
| Oct | Anniversary | 30% Discount | TBD | EUR 30 Discount |
| Nov | BFCM | Pay EUR 50 Get EUR 100 | TBD | Free facial + voucher |
| Dec | XMAS | Pay EUR 50 Get EUR 100 | TBD | Free facial |

**Note:** Aesthetics offers are TBD for most months. Mar-Sep offers TBD across all brands. When an offer is TBD, the occasion campaign still runs but uses a thematic/awareness angle instead of a specific discount.

## Campaign Generation Rules

### 1. Campaign Window

Every occasion campaign runs for a **minimum of 2 weeks** before the occasion date:

```
campaign_start = occasion_date - 14 days (minimum)
campaign_end   = occasion_date (or occasion_date + 1 for multi-day events)
```

For multi-week campaigns (e.g., Summer Ready, BFCM), the window can be extended:
- **Standard occasions:** 2 weeks (e.g., Easter, Mother's Day, Father's Day)
- **Extended campaigns:** 3-4 weeks (e.g., BFCM, Christmas, Summer Sale)
- **Season themes:** Full month or multi-month (e.g., Summer Ready Apr-Jun)

### 2. Row Placement

Occasion campaigns go in Meta name/budget rows **immediately after** the last evergreen campaign:

```
Spa:         Evergreen rows 6-13 (4 EG campaigns) -> Occasion campaigns start at row 14
Aesthetics:  Evergreen rows 99-108 (5 EG campaigns) -> Occasion campaigns start at row 109
Slimming:    Evergreen rows 177-190 (7 EG campaigns) -> Occasion campaigns start at row 191
```

Stack occasion campaigns in order of start date. Never leave gaps between evergreen and occasion rows.

### 3. Campaign Naming

```
[Occasion Theme] | CPL XXX
```

- **ALWAYS use `CPL XXX`** for planned/future campaigns (never actual CPL numbers)
- Actual CPL numbers (e.g., `CPL 1.45`) are only used for **past months** where data is known
- The theme name should be evocative and brand-appropriate, not just the occasion name

**Examples:**
- Spa: "Golden Bloom Easter | CPL XXX", "The Greatest Gift | CPL XXX"
- Aesthetics: "Spring Skin Reset | CPL XXX", "Mum's Glow Moment | CPL XXX"
- Slimming: "New Season, New You | CPL XXX", "Me Time for Mum | CPL XXX"

### 4. Brand Filtering

Not every occasion applies to every brand. Filter based on:

| Brand | Prioritises | Avoids |
|-------|------------|--------|
| **Spa** | Stress relief, relaxation, couples, gift-giving, self-care, escape | Clinical framing, weight loss themes |
| **Aesthetics** | Beauty events, glow-ups, wedding season, skin renewal, confidence | Body shaming, weight loss, spa relaxation |
| **Slimming** | Body confidence, summer prep, health awareness, new beginnings | Shame language, extreme promises, cosmetic focus |

### 5. Moveable Dates

Some occasions move each year. When generating campaigns, look up the actual date for the target year:

| Occasion | Rule |
|----------|------|
| Easter | Easter Sunday varies (use lookup for target year) |
| Mother's Day | Second Sunday of May (US/Malta convention) |
| Father's Day | Third Sunday of June (user convention — note: Malta also celebrates Mar 19 for St. Joseph's Day) |
| BFCM | Fourth Friday of November (Black Friday) + following Monday (Cyber Monday) |

### 6. Cross-Channel Synergy

Occasion campaigns should align with other channels:
- **Email:** Occasion-themed emails in the same weeks
- **WhatsApp:** 1-2 blasts per month tied to the primary occasion (see whatsapp skill)
- **SMM:** Organic posts supporting the occasion theme
- **Pop-up:** Website pop-up changes to match the occasion (see tablet-popup skill)
- **Tablet:** In-clinic tablet display updates for the occasion (see tablet-popup skill)
- **Blog:** SEO blog post supporting the occasion theme (see blog skill)

## Integration with Calendar Strategy

This skill is invoked during **Phase 2** of the `calendar-strategy` master skill:

1. Master skill loads the target quarter/month
2. This skill is invoked to identify which occasions fall in that period
3. For each occasion: generate campaign names, date windows, budget rows
4. Output merges with evergreen campaigns (from `meta-strategist`) and Google campaigns (from `google-ads-strategist`)
5. Combined campaign plan goes to user for approval

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Starting campaigns less than 2 weeks before the occasion | Minimum 2-week lead time. Check campaign_start date. |
| Using actual CPL numbers for future campaigns | ALWAYS use `CPL XXX` for planned campaigns. |
| Placing occasion campaigns in random rows | Stack immediately after the last evergreen row, in start-date order. |
| Running the same occasion for all brands | Filter by brand relevance. Not every occasion fits every brand. |
| Using the occasion name as-is for campaign name | Create evocative, brand-appropriate theme names, not just "Easter Campaign". |
| Forgetting to check for moveable dates | Easter, Mother's Day, BFCM move each year. Look up the actual date. |
| Running occasion campaigns without cross-channel alignment | Check email, SMM, WhatsApp, pop-up, tablet for consistency. |
| Using offers that don't exist yet (TBD) | If offer is TBD, use thematic/awareness angle. Never invent offers. |
