---
name: whatsapp-marketing
description: Use when planning WhatsApp broadcast messages for Carisma brands. Defines frequency rules (1-2x per month max), timing, content format, and integration with the occasion calendar. WhatsApp is a sales channel — always offer-based, never pure content.
---

# WhatsApp Marketing Planner

## Overview

Plan WhatsApp broadcast messages for all three Carisma brands. WhatsApp is an **expensive, high-impact, low-frequency** channel — every message must drive action.

**Core principle:** WhatsApp is a sales channel. Every message must contain an offer and a CTA. Never send pure content, newsletters, or brand awareness messages via WhatsApp. 1-2 blasts per month per brand, maximum.

## When to Use

- Building a monthly or quarterly marketing calendar (Phase 3 of calendar-strategy)
- Planning WhatsApp broadcasts for an upcoming period
- Deciding which offer to push via WhatsApp for a given month

## When NOT to Use

- Writing actual WhatsApp message copy (that's a separate creative task)
- Planning email sequences (use email-marketing-content-strategy)
- Planning paid ads (use meta-strategist or google-ads-strategist)

## Frequency Rules

| Rule | Detail |
|------|--------|
| **Maximum** | 2 blasts per month per brand |
| **Minimum** | 1 blast per month per brand (unless no offer exists) |
| **Why cap at 2** | WhatsApp is personal and expensive. Over-messaging drives unsubscribes and complaints. |

## Timing Rules

| Parameter | Value |
|-----------|-------|
| **Best day** | Tuesday or Wednesday |
| **Best time** | 10:00 AM - 12:00 PM (Malta time) |
| **Never send on** | Weekends, public holidays, after 6 PM |

## Content Rules

### Message Format

Every WhatsApp broadcast follows this structure:

```
[Greeting — 1 line]
[Offer — 2-3 lines, specific and clear]
[CTA — 1 line with link or "Reply YES"]
[Sign-off — persona signature]
```

**Total length:** Under 300 characters. Short, direct, action-oriented.

### Content Requirements

| Requirement | Detail |
|-------------|--------|
| **Always offer-based** | Every message must contain a specific offer with pricing or discount |
| **Single CTA** | One action only — book, reply, tap link |
| **Persona voice** | Spa: Sarah, Aesthetics: Sarah, Slimming: Katya |
| **No long-form** | Not a newsletter. Not educational. Not brand awareness. |
| **No images required** | Text-first. Images optional if they add value. |

## Monthly Planning Logic

### If the month has a major occasion with an offer:

1. **Blast 1:** 1 week before the occasion — announce the offer
2. **Blast 2:** Day-of or day-before the occasion — urgency reminder

### If the month has an occasion but offer is TBD:

1. **Blast 1:** Mid-month — push the best current evergreen offer
2. No Blast 2 (save it)

### If the month has no occasion:

1. **Blast 1:** Mid-month — push the best current evergreen offer
2. No Blast 2 (save it)

## Spreadsheet Row Mapping

| Brand | WhatsApp Row |
|-------|-------------|
| Spa | 52 |
| Aesthetics | 140 |
| Slimming | 220 |

## Cell Format

```
WA: [Offer Name]
```

**Examples:**
- `WA: Easter Spa Day 30% Off`
- `WA: Mother's Day Gift Card`
- `WA: BFCM Pay EUR 50 Get EUR 100`
- `WA: Starter Pack EUR 199`

Place the cell value on the **send date column** only. One cell per blast.

## Integration with Occasion Calendar

This skill references `marketing/marketing-calendar/occasions/occasion-calendar.json` to determine:
1. Which occasion is active in the target month
2. What offer exists per brand for that occasion
3. The occasion anchor date (to calculate send dates)

**Decision flow:**
```
Load occasion-calendar.json for target month
  -> Has offer? -> Blast 1: occasion_date - 7 days, Blast 2: occasion_date - 1 day
  -> No offer? -> Blast 1: mid-month with best evergreen offer
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Sending more than 2 blasts per month | Hard cap at 2. WhatsApp is expensive and personal. |
| Sending content/educational messages | WhatsApp = sales only. Use email for content. |
| Long messages (500+ chars) | Keep under 300 characters. Short and direct. |
| Sending on weekends | Tuesday or Wednesday only, 10 AM - 12 PM. |
| No specific offer in the message | Every blast must have a named offer with price/discount. |
| Placing WhatsApp data in wrong rows | Spa=52, Aesthetics=140, Slimming=220. Double-check config.json. |
| Inventing offers that don't exist | Only use offers from occasion-calendar.json or config/offers.json. |
