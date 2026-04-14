# Carisma Spa & Wellness -- Domain Knowledge Reference

**Last Updated:** 2026-04-14
**Source Files:** CRM-SPA knowledge base, kb-spa.json, beyond-the-spa-operations.md
**Purpose:** Sales Feedback Agent scoring reference for Spa brand conversations

---

## Brand Identity

- **Tagline:** Beyond the Spa
- **Persona:** Sarah (Wellness Guide)
- **Signature:** Peacefully, Sarah
- **Tone:** Caring, warm, present. Real human language.
- **Core philosophy:** "Beyond the Spa" means treating customers as relationships, not bookings. Specific remembering, genuine care, and continuity across visits.

---

## Treatments & Services

### Massage Treatments

| Treatment | Duration | Description |
|-----------|----------|-------------|
| Swedish Massage | 50-60 min | Full-body relaxation massage. Best for first-timers, general tension relief |
| Deep Tissue Massage | 50-60 min | Targeted pressure for muscle tension, athletes, chronic pain |
| Hot Stone Massage | 50-60 min | Heated basalt stones for deep relaxation, circulation, muscle tension |
| Balinese Massage | 50-60 min | Traditional Indonesian technique combining acupressure, skin rolling, firm strokes |
| Thai Massage | 50-60 min | Stretching and pressure-point work, performed clothed |
| Lomi Lomi Massage | 50-60 min | Hawaiian long flowing strokes, deeply relaxing |
| Shiatsu Massage | 50-60 min | Japanese finger-pressure technique along energy meridians |
| 30-min Express Massage | 30 min | Quick tension relief for busy schedules |
| 90-min Extended Massage | 90 min | Deep restoration, full-body immersive treatment |

### Spa Rituals & Experiences

| Experience | Duration | Description |
|------------|----------|-------------|
| Hammam (Turkish Bath) Ritual | ~90 min | Heritage spa experience: steam room, exfoliation, massage, rest/recovery |
| Couples Rituals | Varies | Side-by-side treatments in private couples room |

### Facial Treatments

| Treatment | Duration | Description |
|-----------|----------|-------------|
| Standard Facial | 30-40 min | Cleanse, exfoliate, mask, moisturize. Suitable for all skin types |
| Signature Facial | 50-60 min | Extended facial with premium products and techniques |

### Facility Access

| Option | Description |
|--------|-------------|
| Spa Day Pass | Pool access, sauna, steam room, jacuzzi, relaxation lounge |
| Extended Day Pass | Full-day facility access with extended hours |

**All treatment times include consultation, dressing, and transition time. Recommend arriving 10-15 minutes early.**

---

## Pricing

**NOTE:** The CRM-SPA pricing-and-menu.md template has not been populated with specific prices. The following pricing information comes from the knowledge base (kb-spa.json) and agent system prompts.

### Pricing Tier Framework (Used in All Conversations)

| Tier | Range | Description |
|------|-------|-------------|
| Tier 1 (Entry/Anchor) | ~EUR 65-75 | 30-min express treatment |
| Tier 2 (Recommended) | ~EUR 120 | 60-min full treatment (best value, highest satisfaction) |
| Tier 3 (Premium) | EUR 180+ | 90-min signature ritual (deep restoration) |

### Pricing Rules

1. **ASK BUDGET FIRST** before presenting any prices
2. **PRESENT 3 OPTIONS** (anchor, recommended, premium)
3. **REAFFIRM TIER 2** as best value after presenting all three
4. **NEVER APOLOGIZE FOR PRICING** -- present as fact
5. **FRAME AS VALUE, NOT COST** -- "investing in a complete experience"
6. **NEVER LEAD WITH PRICE** -- diagnose first, then present experience, then price

### Payment Methods

- Credit/debit cards (Visa, Mastercard, American Express)
- Bank transfers
- Cash
- Corporate/flexible arrangements for large purchases

---

## Booking Policy

### How to Book

- Online booking available 24/7 on website
- Call during business hours
- Visit in person at any location
- Recommend booking 2-3 days in advance for preferred time slot

### Operating Hours

- Monday to Sunday, 9am to 8pm

### Cancellation & Rescheduling

| Policy | Details |
|--------|---------|
| Free cancellation/reschedule | Up to 24 hours before appointment |
| Late cancellation (under 24 hours) | May incur fee equal to treatment price |
| No-show fee | 50% of treatment price |
| Grace period | 15 minutes -- staff will try to accommodate |
| Emergency situations | Contact immediately, reschedule at no charge |
| Contact methods | Phone or email |

---

## Vouchers & Gift Cards

### Standard Denominations

- EUR 50, EUR 100, EUR 150
- Custom amounts available on request

### Purchase Channels

- Online, by phone, or in person at any location

### Key Policies

| Policy | Details |
|--------|---------|
| Validity | 12 months from purchase date |
| Cross-brand use | Valid across all three brands (Spa, Aesthetics, Slimming) |
| Location | Redeemable at any Carisma location |
| Transferable | Yes, can be gifted |

---

## Common Customer Questions (FAQ from Knowledge Base)

| Question | Verified Answer |
|----------|-----------------|
| What are your opening hours? | Monday to Sunday, 9am to 8pm |
| How do I book an appointment? | Online 24/7, call during business hours, or visit in person. Book 2-3 days in advance. |
| What is your cancellation policy? | Free cancel/reschedule up to 24 hours before. Under 24 hours may incur fee equal to treatment price. |
| How long does a massage last? | Standard 50-60 min. Express 30 min. Extended 90 min. All include consultation and transition time. |
| Can I reschedule? | Yes, free up to 24 hours before. Under 24 hours, rescheduling fee may apply. |
| What happens if I miss my appointment? | No-show fee of 50% of treatment price. 15-minute grace period. Emergency? Contact us immediately. |
| Do you accept gift cards/vouchers? | Yes. EUR 50, EUR 100, EUR 150 denominations. Valid 12 months, all locations, all brands. |
| What payment methods do you accept? | Credit/debit cards (Visa, Mastercard, Amex), bank transfers, cash. |

---

## Factual Claims Reps Must Get Right

These facts, if stated incorrectly, represent a scoring penalty:

### Critical Facts (Incorrect = Major Penalty)

1. **Opening hours:** 9am-8pm, Monday-Sunday. NOT 9am-9pm (some agent prompts say 9pm but KB says 8pm -- verify current hours)
2. **Cancellation window:** 24 hours free. Under 24 hours = fee equal to treatment price
3. **No-show fee:** 50% of treatment price (not 100%)
4. **Grace period:** 15 minutes (not 10, not 20)
5. **Gift card validity:** 12 months from purchase (not 2 years, not unlimited)
6. **Gift card denominations:** EUR 50, EUR 100, EUR 150 (do not invent other amounts)
7. **Cross-brand voucher use:** Valid across Spa, Aesthetics, AND Slimming
8. **Advance booking recommendation:** 2-3 days (not "same day is fine")

### Treatment Claims (Incorrect = Moderate Penalty)

1. **Standard massage duration:** 50-60 minutes including consultation/transition
2. **Facial treatment duration:** 30-40 minutes
3. **Never guarantee specific results** from treatments
4. **Never diagnose medical conditions** -- suggest consulting a doctor

### Pricing Claims (Incorrect = Major Penalty)

1. **Never quote a specific price that is not in the pricing system**
2. **Never offer discounts** unless there is an active promotion
3. **Never promise price matching** against competitors
4. **Always ask budget before presenting prices**

---

## "Beyond the Spa" Philosophy (Reps Must Understand)

### What It Means

"Beyond the Spa = We treat you as a relationship, not a booking."

### The Five Operational Pillars

1. **Visit 1 -- Belonging Anchor:** Send personalized follow-up 2-3 days after first visit referencing specific details observed
2. **Visit 2 -- Continuity Moment:** Greet by name, reference first visit details, suggest elevated experience
3. **Visit 3+ -- Loyalty Lock-In:** Offer membership, reference visit patterns, invite into ongoing ritual
4. **Ongoing -- Specific Remembering:** Note preferences, life details, what creates peace; weave into future conversations
5. **Re-engagement -- Thoughtful Outreach:** When silent 60+ days, reach out with warmth and specificity

### What Reps Should Say

- "We remember you. First visit, we learn what you need. Second visit, you're not a stranger anymore."
- "Most spas deliver an experience. We deliver a relationship."

### What Reps Should NOT Say

- "Best spa in Malta!" (overselling)
- Compare to other spas negatively
- Use words like "exclusive" or "premium"
- Sound salesy or pressured

---

## Upsell Opportunities Matrix

| If Customer Books... | Natural Upsell | Why It Works |
|---------------------|----------------|--------------|
| 30-min Express Massage | 60-min Full Massage | "Many guests upgrade after experiencing the express. The full 60 min is where you really feel the transformation." |
| 60-min Massage | 90-min Extended + Scalp Ritual | "If you want to go deeper, the 90-minute includes a scalp ritual that's pure bliss." |
| Single Massage | Couples Package | "Would your partner enjoy this too? We have a beautiful couples room." |
| Any Treatment | Spa Day Pass add-on | "Would you like to arrive early and enjoy the facilities? Pool, sauna, jacuzzi." |
| Any Treatment | Aromatherapy Enhancement | "Would you like to add our aromatherapy enhancement? It elevates the whole experience." |
| First Visit | Membership | Plant seed at visit 3+. "Since you've been coming regularly, have you thought about membership?" |
| Any Treatment | Gift Voucher for Friend | "Our guests often pick up a gift voucher for someone special. Would you like to treat someone?" |
| Massage | Facial Add-on | "A quick facial pairs beautifully with a massage. Your skin will thank you." |
| Any Treatment | Lunch/Dinner Add-on | Suggest food/beverage enhancement if location offers it |
| Weekend Booking | Weekday Rebooking | "Weekdays tend to be quieter if you prefer more stillness." |

---

## Response Protocol (For Scoring Reference)

### The 8 Non-Negotiable Rules

1. **Answer first, immediately** -- factual questions get one-sentence answers
2. **Max 2-3 sentences per response** -- if 4+, it fails
3. **One question only** per message
4. **No bullet lists for questions** -- natural language only
5. **Handle it directly** -- never refer elsewhere ("call our team", "visit website")
6. **Skip diagnostic when customer is specific** -- go straight to timing
7. **1-2 emoji max** -- only if natural
8. **Warm but brief** -- caring does not mean long

### Forbidden Language

- "Certainly!", "I'd be happy to", "Of course!", "Absolutely!", "Great question!"
- "Amazing!", "Fantastic!", "You deserve a treat"
- Em-dashes (use periods instead)
- Storytelling or flowery language
- Clinical jargon

---

*Domain Knowledge Reference -- Sales Feedback Agent*
*Source: CRM-SPA knowledge base, kb-spa.json, beyond-the-spa-operations.md, agent-quick-reference-beyond-spa.md*
*Review schedule: Every 14 days or when pricing/policy changes*
