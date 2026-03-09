# On-Page SEO Revamp Design -- Carisma Aesthetics

**Date:** 2026-03-04
**Scope:** 6 pages -- Homepage + 5 treatment pages
**Data Sources:** Google Search Console (Dec 2025 -- Mar 2026, 3 months, Malta)
**Same 2026 SEO framework as Spa revamp** (see: 2026-03-04-onpage-seo-revamp-design.md)

---

## Site Overview

| Metric | Value |
|--------|-------|
| Total unique queries (3 months) | 3,609 |
| Non-branded queries | 3,512 |
| Total clicks (3 months) | 2,861 |
| Non-branded clicks | 1,622 |
| Pages with schema | 1/6 (homepage only, basic WebSite) |
| Pages with FAQ sections | 5/6 (but 0 have FAQPage schema) |
| Pages with correct H1 | 0/6 |

---

## Critical Site-Wide Issues (Fix Before Anything Else)

### P0 -- Broken Fundamentals

1. **Every service page has 2 H1 tags** -- "Frequently asked questions" is coded as H1 on all 5 treatment pages. Must be changed to H2.
2. **Homepage H1 is "personalised quiz"** -- The most important heading on the most important page describes a widget, not the business.
3. **Zero structured data on treatment pages** -- All 5 service pages have FAQ sections but no FAQPage schema. No Service/MedicalProcedure schema. No LocalBusiness schema. This is the single biggest technical SEO failure.
4. **Title tag typo on Botox page** -- "Wrinke" instead of "Wrinkle" on the highest-traffic treatment page.
5. **Wrong FAQ content on HydraFacial page** -- FAQ section shows Lymphatic Drainage questions instead of HydraFacial questions.
6. **Footer H2 abuse on ALL pages** -- PHONE, EMAIL, INSTAGRAM, FACEBOOK, and doctor names are all coded as H2 tags. Creates 7+ meaningless H2s per page.
7. **Copy-paste errors** -- "Why Carisma" section on HydraFacial, Lip Fillers, PRP, and homepage all contain irrelevant Botox/sweating copy. PRP video section says "Watch our clients' lip filler journeys."
8. **Meta description typo** -- "microoneedling" (double "o") on microneedling page.
9. **Wrong footer branding** -- Footer shows "INFO@CARISMASLIMMING.COM" and "@CARISMASLIMMING" Instagram on the Aesthetics website.

---

## Homepage Money Keyword Analysis

GSC data shows the homepage receives impressions across all treatment clusters. Here's what people search when they find the homepage:

| Cluster | 3-Month Impressions | Clicks | Avg Position |
|---------|-------------------:|-------:|:------------:|
| Botox / Anti-wrinkle | 1,755 | 132 | 3.6 |
| Aesthetics / Clinic | 1,528 | 14 | 10.4 |
| Lip Fillers / Dermal | 1,307 | 62 | 3.0 |
| Facial / Skin | 1,268 | 38 | 7.6 |
| Microneedling | 618 | 32 | 3.8 |
| Laser | 345 | 7 | 9.2 |
| Hair (PRP/minoxidil) | 391 | 18 | 6.8 |

**Recommended homepage target: "aesthetic clinic malta" / "aesthetics malta" / "beauty clinic malta"**

Why: Broad "clinic" queries are homepage-level keywords. People searching "aesthetic clinic malta" want to discover the business. The homepage is already position 2.1 for "aesthetic clinic malta" with 376 impressions but only 3 clicks (0.8% CTR). A title/meta/H1 fix could dramatically increase clicks. Treatment-specific keywords should be handled by dedicated pages.

---

## Page-by-Page Briefs

---

### PAGE 1: Homepage (carismaaesthetics.com/)

#### Target Keyword Cluster (from GSC)
| Keyword | 3mo Impressions | Clicks | Position |
|---------|---------------:|-------:|:--------:|
| aesthetic clinic malta | 376 | 3 | 2.1 |
| aesthetics malta | 184 | 2 | 2.6 |
| beauty clinic malta | 192 | 3 | 7.2 |
| aesthetic | 255 | 0 | 8.2 |
| aesthetics | 202 | 0 | 4.8 |
| facial treatment malta | 138 | 1 | 9.9 |
| best facial malta | 187 | 3 | 11.9 |
| best botox and fillers in malta | 233 | 5 | 6.2 |

#### Current Problems
- H1 is "personalised quiz" -- completely wrong
- Only 696 words -- very thin for a homepage
- No LocalBusiness/MedicalBusiness schema
- Duplicate WebSite schema blocks
- Every treatment name is an H2 in a service grid (should be H3)
- No FAQ section
- Wrong boilerplate copy (Botox/sweating content)

#### Exact Title Tag
```
Aesthetic Clinic Malta | Botox, Fillers & Skin Treatments | Carisma
```
- 65 characters (slightly over -- can trim "Skin" to fit 60)
- "Aesthetic Clinic Malta" in first 23 chars
- Key treatments mentioned
- Brand at end

#### Exact Meta Description
```
Malta's #1 medical aesthetic clinic. Botox from EUR59, lip fillers from EUR219, microneedling, HydraFacial & more. Medically qualified doctors. Book a free consultation.
```
- 168 characters (trim to 155: remove "& more.")
- Trimmed version: `Malta's #1 medical aesthetic clinic. Botox from EUR59, lip fillers from EUR219, microneedling & HydraFacial. Medically qualified doctors. Free consultation.`
- 155 characters
- Keywords: aesthetic clinic, Malta, Botox, lip fillers, microneedling, HydraFacial
- E-E-A-T: "Medically qualified doctors"
- CTA: "Free consultation"
- Price anchors

#### H1 (Single)
```
Medical Aesthetic Clinic in Malta
```

#### Full Heading Hierarchy
```
H1: Medical Aesthetic Clinic in Malta

  H2: What Aesthetic Treatments Do We Offer?
    H3: Botox & Wrinkle Relaxing -- From EUR59
    H3: Lip Fillers & Dermal Fillers -- From EUR219
    H3: Microneedling & Mesotherapy
    H3: HydraFacial & Chemical Peels
    H3: PRP (Platelet Rich Plasma)
    H3: Sculptra & Collagen Stimulators
    H3: Thread Lifts
    H3: Fat Dissolving & Body Contouring
    H3: Laser Hair Removal
    (Each H3: 1-2 sentence description + price + "Learn More" link to treatment page)

  H2: Why Is Carisma Malta's Most Trusted Aesthetic Clinic?
    H3: Medically Qualified Practitioners
    H3: Consultation-First Approach
    H3: 30+ Years of Wellness Expertise
    H3: Natural Results Philosophy

  H2: Meet Our Medical Team
    H3: Dr. Giovanni Scornavacca
    H3: Dr. Francesca Chircop
    H3: Dr. Zaid Teebi
    (Each: photo, qualifications, specialties -- critical E-E-A-T)

  H2: How Much Do Aesthetic Treatments Cost in Malta?
    (Pricing summary table linking to full /pricelist)

  H2: What Our Patients Say
    (Google review integration + AggregateRating schema)

  H2: Frequently Asked Questions About Aesthetics in Malta
    H3: What is the best aesthetic clinic in Malta?
    H3: How much does Botox cost in Malta?
    H3: Are aesthetic treatments safe?
    H3: Do I need a consultation before treatment?
    H3: What age should you start Botox?
    H3: Which filler brand is best?
```

#### Content Brief
**Target word count:** 1,800-2,200 words (currently 696 -- needs 3x more)

**Opening paragraph:**
> "Carisma Aesthetics is Malta's leading medical aesthetic clinic, offering Botox, lip fillers, microneedling, HydraFacial and over 15 other treatments -- all performed by medically qualified doctors and practitioners. With a consultation-first approach and over 30 years of wellness heritage, we help you achieve natural-looking results at our clinic in Malta. Treatments start from just EUR59, and every new patient receives a free consultation."

#### Schema Markup (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "@id": "https://www.carismaaesthetics.com/#organization",
  "name": "Carisma Aesthetics",
  "alternateName": "Carisma Aesthetic Clinic Malta",
  "url": "https://www.carismaaesthetics.com/",
  "logo": "https://www.carismaaesthetics.com/logo.png",
  "image": "https://www.carismaaesthetics.com/hero-image.jpg",
  "description": "Malta's #1 medical aesthetic clinic offering Botox, lip fillers, microneedling, HydraFacial and skin treatments by medically qualified practitioners.",
  "telephone": "+356 27802062",
  "email": "info@carismaaesthetics.com",
  "priceRange": "EUR59-EUR500",
  "currenciesAccepted": "EUR",
  "paymentAccepted": "Cash, Credit Card, Debit Card",
  "openingHours": "Mo-Sa 09:00-19:00",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Malta",
    "addressCountry": "MT"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "[actual count]",
    "bestRating": "5"
  },
  "medicalSpecialty": "Dermatology",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Aesthetic Treatments",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "MedicalProcedure",
          "name": "Botox Malta",
          "procedureType": "https://schema.org/CosmeticProcedure"
        },
        "price": "59",
        "priceCurrency": "EUR"
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "MedicalProcedure",
          "name": "Lip Fillers Malta",
          "procedureType": "https://schema.org/CosmeticProcedure"
        },
        "price": "219",
        "priceCurrency": "EUR"
      }
    ]
  },
  "employee": [
    {
      "@type": "Physician",
      "name": "Dr. Giovanni Scornavacca",
      "medicalSpecialty": "Aesthetic Medicine"
    },
    {
      "@type": "Physician",
      "name": "Dr. Francesca Chircop",
      "medicalSpecialty": "Aesthetic Medicine"
    }
  ],
  "sameAs": [
    "https://www.facebook.com/carismaaesthetics",
    "https://www.instagram.com/carismaaesthetics"
  ]
}
```

Plus FAQPage schema for the FAQ section.

---

### PAGE 2: /microneedling-malta

#### Target Keyword Cluster (from GSC)
| Keyword | 3mo Impressions | Clicks | Position | Target |
|---------|---------------:|-------:|:--------:|:------:|
| microneedling malta | 1,049 | 100 | 3.4 | 1 |
| microneedling | 818 | 5 | 7.3 | 3-5 |
| dermapen malta | 85 | 3 | 10.4 | 5-8 |
| micro needling malta | 135 | 10 | 3.7 | 1-2 |
| microneedling malta price | 60 | 1 | 3.6 | 1-2 |

**Already performing well (position 3.4 for main keyword). Focus: fix technical issues, add schema, push to #1.**

#### Current Problems
- 2 H1 tags
- Meta description typo: "microoneedling"
- Zero schema despite having FAQ section
- Title missing brand name and "Malta"
- Footer H2 abuse

#### Exact Title Tag
```
Microneedling Malta | Prices & Results | Carisma Aesthetics
```
- 58 characters
- "Microneedling Malta" in first 20 chars
- "Prices" captures "microneedling malta price" keyword

#### Exact Meta Description
```
Advanced microneedling in Malta from EUR[price]. Reduce acne scars, fine lines & pigmentation. Medically qualified team. See real results. Book a free consultation.
```
- ~155 characters
- Fix the "microoneedling" typo
- Keywords: microneedling, Malta, acne scars, fine lines
- CTA: "Book a free consultation"

#### H1 (Single)
```
Microneedling in Malta -- Real Results for Your Skin
```

#### Full Heading Hierarchy
```
H1: Microneedling in Malta -- Real Results for Your Skin

  H2: What Is Microneedling and How Does It Work?
    H3: The Science Behind Microneedling
    H3: Microneedling with Mesotherapy (Combination Treatment)

  H2: What Skin Concerns Does Microneedling Treat?
    H3: Acne Scars & Scarring
    H3: Fine Lines & Wrinkles
    H3: Hyperpigmentation & Uneven Skin Tone
    H3: Large Pores & Skin Texture
    H3: Stretch Marks

  H2: How Much Does Microneedling Cost in Malta?
    (Pricing table: treatment area | single session | package)

  H2: What Should You Expect During Microneedling Treatment?
    H3: Before Your Treatment (Preparation)
    H3: During the Session (30-45 Minutes)
    H3: After Treatment (Recovery & Aftercare)
    H3: How Many Sessions Do You Need?

  H2: Microneedling Results -- Before & After
    (Real patient results section -- critical for E-E-A-T)

  H2: Who Performs Microneedling at Carisma Aesthetics?
    (Practitioner qualifications -- E-E-A-T)

  H2: Frequently Asked Questions About Microneedling
    H3: Is microneedling painful?
    H3: How long does microneedling recovery take?
    H3: How soon will I see results from microneedling?
    H3: Can microneedling remove acne scars?
    H3: What is the difference between microneedling and dermapen?
    H3: Is microneedling safe for all skin types?
    H3: How often should I get microneedling?
    H3: Can I wear makeup after microneedling?
```

#### Schema
- MedicalProcedure (procedureType: CosmeticProcedure) with Offer pricing
- FAQPage schema for the 8 FAQs
- Reference to parent MedicalBusiness via @id

---

### PAGE 3: /botox-malta (currently redirects to /wrinkle-relaxing-malta)

#### Target Keyword Cluster (from GSC)
| Keyword | 3mo Impressions | Clicks | Position | Target |
|---------|---------------:|-------:|:--------:|:------:|
| botox malta | 2,609 | 134 | 6.6 | 1-3 |
| botox | 450 | 2 | 8.3 | 5-8 |
| botox malta price | 125 | 6 | 5.6 | 1-3 |
| best botox and fillers in malta | 233 | 5 | 6.2 | 1-3 |
| botox in malta | 182 | 9 | 7.4 | 3-5 |
| masseter botox malta | 122 | 11 | 4.3 | 1-3 |
| best botox in malta | 19 | 1 | 4.9 | 1-3 |

**Highest impression keyword (2,609!) but only position 6.6. The redirect + title typo + H1 mismatch are severely hurting this page.**

#### Current Problems (Severe)
- **301 redirect** from /botox-malta to /wrinkle-relaxing-malta -- losing URL equity
- **Title typo**: "Wrinke" instead of "Wrinkle"
- **H1/URL/Title mismatch**: URL = "wrinkle-relaxing", Title = "Wrinke Relaxing", H1 = "botox malta"
- **30 H2 tags** with duplicates (4x "personalised consultation", 4x "Dermal fillers")
- Zero schema
- Wrong footer copy (mentions Carisma Slimming)

#### Strategic Decision: URL
**Recommendation:** Reverse the redirect. Make `/botox-malta` the canonical URL and redirect `/wrinkle-relaxing-malta` TO `/botox-malta`.

Reasoning: "botox malta" has 2,609 impressions. "wrinkle relaxing malta" has near-zero search volume. The URL should match the keyword people actually search.

#### Exact Title Tag
```
Botox Malta | From EUR59 | Dr. Giovanni Scornavacca | Carisma
```
- 60 characters
- "Botox Malta" in first 11 chars
- Price anchor
- Doctor name (E-E-A-T -- matches "dr angele farrugia" type searches)

#### Exact Meta Description
```
Botox treatments in Malta from EUR59. Forehead lines, crow's feet, frown lines & masseter slimming. Medically qualified doctors. Natural results. Free consultation.
```
- 163 characters (trim "Natural results." to hit 155)
- Keywords: Botox, Malta, forehead, crow's feet, masseter
- Price, CTA, E-E-A-T signal

#### H1 (Single)
```
Botox in Malta -- Natural Results from EUR59
```

#### Full Heading Hierarchy
```
H1: Botox in Malta -- Natural Results from EUR59

  H2: What Is Botox and How Does It Work?
    H3: How Neurotoxin Relaxes Facial Muscles
    H3: FDA-Approved Products We Use

  H2: Which Areas Can Botox Treat?
    H3: Forehead Lines
    H3: Frown Lines (Glabellar Lines)
    H3: Crow's Feet
    H3: Masseter / Jawline Slimming
    H3: Bunny Lines
    H3: Lip Flip
    H3: Hyperhidrosis (Excessive Sweating)
    (Each: brief description, before/after positioning)

  H2: How Much Does Botox Cost in Malta?
    (Pricing table: area | price per area | 2 areas | 3 areas)
    H3: Botox Pricing
    H3: Package Deals (Multiple Areas)

  H2: What Should You Expect During Botox Treatment?
    H3: Your Free Consultation
    H3: The Injection Process (10-15 Minutes)
    H3: Aftercare and Recovery
    H3: When Will I See Results?

  H2: Botox Results -- Real Patients
    (Before & after gallery with patient consent)

  H2: Who Performs Botox at Carisma Aesthetics?
    H3: Dr. Giovanni Scornavacca -- [Qualifications]
    H3: Dr. Francesca Chircop -- [Qualifications]

  H2: Frequently Asked Questions About Botox in Malta
    H3: How long does Botox last?
    H3: Is Botox painful?
    H3: What age should you start Botox?
    H3: Can you combine Botox with fillers?
    H3: What are the side effects of Botox?
    H3: How often should I get Botox?
    H3: What is the difference between Botox and fillers?
    H3: Can Botox slim my jawline?
```

#### Schema
- MedicalProcedure (Botox/Neurotoxin) with Offer pricing
- FAQPage schema for 8 FAQs
- Physician schema for practitioner

---

### PAGE 4: /hydrafacial

#### Target Keyword Cluster (from GSC)
| Keyword | 3mo Impressions | Clicks | Position | Target |
|---------|---------------:|-------:|:--------:|:------:|
| hydrafacial malta | 932 | 50 | 7.0 | 1-3 |
| hydrafacial | 166 | 2 | 7.8 | 3-5 |
| hydra facial | 53 | 2 | 9.7 | 5-8 |
| best hydra facial treatment malta | 15 | 0 | 2.3 | 1 |

#### Current Problems
- **WRONG FAQ CONTENT** -- showing Lymphatic Drainage questions
- 2 H1 tags
- Zero schema
- URL missing "-malta" (inconsistent with other pages)
- Wrong boilerplate copy
- Title missing brand name

#### URL Consideration
Ideally this would be `/hydrafacial-malta` for consistency and keyword targeting. If a redirect is too disruptive, keep `/hydrafacial` but ensure all on-page signals include "Malta."

#### Exact Title Tag
```
HydraFacial Malta | Deep Cleansing Facial | Carisma Aesthetics
```
- 61 characters
- "HydraFacial Malta" in first 18 chars
- "Deep Cleansing Facial" captures adjacent queries

#### Exact Meta Description
```
HydraFacial treatment in Malta for deep cleansing, hydration and anti-ageing. 6-step process for instant glow. See results from session one. Book your HydraFacial today.
```
- 155 characters (on target, may need slight trim)

#### H1 (Single)
```
HydraFacial in Malta -- Instant Glow, Lasting Results
```

#### Full Heading Hierarchy
```
H1: HydraFacial in Malta -- Instant Glow, Lasting Results

  H2: What Is a HydraFacial and Why Is It So Popular?
    H3: The 6-Step HydraFacial Process
    H3: How HydraFacial Differs from Traditional Facials

  H2: What Skin Concerns Does HydraFacial Treat?
    H3: Dehydrated & Dull Skin
    H3: Fine Lines & Ageing
    H3: Acne & Congested Pores
    H3: Hyperpigmentation & Sun Damage

  H2: How Much Does a HydraFacial Cost in Malta?
    (Pricing: standard vs boosted vs premium)

  H2: What Happens During Your HydraFacial Session?
    H3: Before Your Treatment
    H3: The 6 Steps (Cleanse, Peel, Extract, Hydrate, Fuse, Protect)
    H3: How Long Does It Take?
    H3: Is There Any Downtime?

  H2: HydraFacial Results
    (Before & after photos)

  H2: Frequently Asked Questions About HydraFacial
    H3: How often should I get a HydraFacial?
    H3: Is HydraFacial suitable for sensitive skin?
    H3: Can I wear makeup after a HydraFacial?
    H3: What is the difference between HydraFacial and microneedling?
    H3: How long do HydraFacial results last?
    H3: Is HydraFacial better than a chemical peel?
```

**CRITICAL: Fix the FAQ tab system so it shows HydraFacial FAQs, not Lymphatic Drainage.**

---

### PAGE 5: /lip-fillers-malta

#### Target Keyword Cluster (from GSC)
| Keyword | 3mo Impressions | Clicks | Position | Target |
|---------|---------------:|-------:|:--------:|:------:|
| lip filler malta | 800 | 63 | 3.2 | 1 |
| lip fillers | 274 | 2 | 18.8 | 5-10 |
| lip fillers malta | 298 | 18 | 2.8 | 1 |
| lip filler | 192 | 5 | 4.0 | 1-3 |
| 1ml lip filler | 24 | 0 | 3.9 | 1-3 |
| fillers malta | 136 | 5 | 3.4 | 1-3 |
| dermal fillers malta | 185 | 0 | 7.7 | 3-5 |

#### Current Problems
- 2 H1 tags
- Zero schema
- Wrong boilerplate copy
- Good title tag (best of all pages) -- keep the structure

#### Exact Title Tag (Minor Tweak)
```
Lip Fillers Malta | Natural Results from EUR219 | Carisma Aesthetics
```
- 67 characters (slightly long -- trim "Aesthetics" to "Carisma" for 58 chars)
- Current title is already good -- minimal change

#### Exact Meta Description
```
Lip filler treatments in Malta from EUR219. Juvederm, Croma & Teoxane by qualified doctors. Subtle, natural enhancement. See real results. Free consultation.
```
- 157 characters (trim "See real results." for 155)

#### H1 (Single)
```
Lip Fillers in Malta -- Subtle, Natural Enhancement
```

#### Full Heading Hierarchy
```
H1: Lip Fillers in Malta -- Subtle, Natural Enhancement

  H2: What Are Lip Fillers and How Do They Work?
    H3: Hyaluronic Acid Fillers Explained
    H3: Filler Brands We Use (Juvederm, Croma, Teoxane)

  H2: What Lip Filler Results Can You Expect?
    H3: 0.5ml -- Subtle Enhancement
    H3: 1ml -- Full Volume
    H3: Lip Flip vs Lip Fillers

  H2: How Much Do Lip Fillers Cost in Malta?
    (Pricing table: volume | brand | price)

  H2: What Happens During Your Lip Filler Appointment?
    H3: Free Consultation & Lip Assessment
    H3: The Injection Process
    H3: Aftercare & Swelling Timeline
    H3: How Long Do Lip Fillers Last?

  H2: Lip Filler Before & After Results

  H2: Who Performs Lip Fillers at Carisma?
    (Doctor bios -- E-E-A-T)

  H2: Frequently Asked Questions About Lip Fillers
    H3: Do lip fillers hurt?
    H3: How long do lip fillers last?
    H3: Can lip fillers look natural?
    H3: What happens when lip fillers wear off?
    H3: How much is 1ml of lip filler in Malta?
    H3: Can I dissolve lip fillers if I don't like them?
    H3: What's the difference between lip fillers and a lip flip?
    H3: How old do you have to be to get lip fillers in Malta?
```

---

### PAGE 6: /prp-malta

#### Target Keyword Cluster (from GSC)
| Keyword | 3mo Impressions | Clicks | Position | Target |
|---------|---------------:|-------:|:--------:|:------:|
| prp treatment malta | 335 | 37 | 4.1 | 1-2 |
| prp malta | 176 | 27 | 4.0 | 1-2 |
| prp | 146 | 1 | 3.0 | 1-2 |
| prp hair treatment malta | 35 | 3 | 5.3 | 1-3 |
| prp treatment for face | 19 | 2 | 2.9 | 1 |

**Already performing well (position 3-4 range). Focus: add schema, fix H1, push to #1.**

#### Current Problems
- 2 H1 tags
- Zero schema
- Video section says "Watch our clients' lip filler journeys" (copy-paste error)
- Title missing brand name
- Wrong boilerplate copy

#### Exact Title Tag
```
PRP Treatment Malta | Skin & Hair Rejuvenation | Carisma Aesthetics
```
- 66 characters (trim "Aesthetics" for 55 chars)
- "PRP Treatment Malta" in first 20 chars
- Captures both skin and hair use cases

#### Exact Meta Description
```
PRP (Platelet Rich Plasma) treatment in Malta for skin rejuvenation and hair restoration. Uses your body's own healing power. Results in 3-4 weeks. Book a free consultation.
```
- 155 characters (on target, may need slight trim)

#### H1 (Single)
```
PRP Treatment in Malta -- Your Body's Natural Healing Power
```

#### Full Heading Hierarchy
```
H1: PRP Treatment in Malta -- Your Body's Natural Healing Power

  H2: What Is PRP and How Does It Work?
    H3: The Science Behind Platelet Rich Plasma
    H3: PRP for Skin Rejuvenation (Vampire Facial)
    H3: PRP for Hair Restoration

  H2: What Can PRP Treat?
    H3: Fine Lines & Skin Ageing
    H3: Hair Thinning & Hair Loss
    H3: Acne Scars
    H3: Dark Circles & Under-Eye Hollows

  H2: How Much Does PRP Cost in Malta?
    (Pricing table: treatment type | single | package of 3)

  H2: What Should You Expect During PRP Treatment?
    H3: Blood Draw & Preparation
    H3: The Treatment Process
    H3: Recovery & Aftercare
    H3: How Many Sessions Do You Need?
    H3: When Will You See Results?

  H2: PRP Results -- Before & After

  H2: Frequently Asked Questions About PRP
    H3: Is PRP painful?
    H3: How long do PRP results last?
    H3: Does PRP really work for hair loss?
    H3: Can PRP be combined with microneedling?
    H3: How many PRP sessions do I need?
    H3: Is PRP safe?
    H3: What is the difference between PRP and mesotherapy?
```

**CRITICAL: Fix the video section copy -- change "lip filler journeys" to "PRP treatment journeys."**

---

## Cross-Page Internal Linking Matrix

| From \ To | Homepage | /botox-malta | /microneedling | /hydrafacial | /lip-fillers | /prp-malta |
|-----------|:--------:|:-----------:|:--------------:|:------------:|:------------:|:----------:|
| **Homepage** | -- | "Botox treatments" | "microneedling" | "HydraFacial" | "lip fillers" | "PRP treatment" |
| **/botox-malta** | "Carisma Aesthetics" | -- | "combine with microneedling" | "try HydraFacial" | "explore lip fillers" | "add PRP for skin" |
| **/microneedling** | "aesthetic clinic" | "try Botox" | -- | "combine with HydraFacial" | "explore fillers" | "enhance with PRP" |
| **/hydrafacial** | "our clinic" | "try Botox" | "combine with microneedling" | -- | "explore fillers" | "boost with PRP" |
| **/lip-fillers** | "Carisma Aesthetics" | "combine with Botox" | "try microneedling" | "maintain with HydraFacial" | -- | "skin rejuvenation with PRP" |
| **/prp-malta** | "our clinic" | "try Botox" | "combine with microneedling" | "maintain with HydraFacial" | "explore fillers" | -- |

Each cell = anchor text to use. This creates full hub-and-spoke connectivity.

---

## Priority Fixes (Ranked by Impact)

### P0 -- Fix Immediately
1. **Fix Botox title typo** ("Wrinke" -> "Wrinkle") -- highest-traffic page
2. **Fix HydraFacial FAQ content** -- showing wrong treatment's FAQs
3. **Fix PRP video section copy** -- says "lip filler journeys"
4. **Fix microneedling meta description typo** -- "microoneedling"
5. **Reduce all pages to single H1** -- change "Frequently asked questions" from H1 to H2
6. **Fix homepage H1** -- change "personalised quiz" to "Medical Aesthetic Clinic in Malta"
7. **Fix footer branding** -- change slimming email/Instagram to aesthetics

### P1 -- High Impact (Within 2 Weeks)
8. **Inject schema markup** on all 6 pages -- MedicalBusiness, MedicalProcedure, FAQPage, AggregateRating
9. **Reverse Botox redirect** -- make /botox-malta canonical, redirect /wrinkle-relaxing-malta to it
10. **Rewrite all title tags and meta descriptions** per specs above
11. **Remove footer H2 abuse** -- change PHONE, EMAIL, doctor names from H2 to styled text
12. **Remove wrong boilerplate copy** from HydraFacial, Lip Fillers, PRP pages

### P2 -- Medium Impact (Within 4 Weeks)
13. **Expand homepage content** from 696 to 1,800+ words
14. **Add pricing tables** in structured HTML format on all treatment pages
15. **Add doctor bio sections** with qualifications on each treatment page (E-E-A-T)
16. **Add FAQ section to homepage**
17. **Optimize all image alt text** across 6 pages
18. **Fix duplicate H2s on Botox page** (reduce from 30 to ~10)

### P3 -- Ongoing
19. **Build internal links** from blog posts to treatment pages
20. **Create blog content** targeting informational queries (milia removal, skin care tips, etc. -- these are already driving traffic)
21. **Monitor GSC rankings** weekly for target keyword clusters

---

## Success Metrics

| Metric | Baseline | 4-Week Target | 12-Week Target |
|--------|:--------:|:-------------:|:--------------:|
| "botox malta" position | 6.6 | 3 | 1-2 |
| "microneedling malta" position | 3.4 | 1-2 | 1 |
| "hydrafacial malta" position | 7.0 | 3-4 | 1-2 |
| "lip filler malta" position | 3.2 | 1-2 | 1 |
| "prp treatment malta" position | 4.1 | 1-2 | 1 |
| "aesthetic clinic malta" position | 4.1 | 1-2 | 1 |
| Non-branded clicks/3mo | 1,622 | +30% | +60% |
| Pages with schema | 1/6 | 6/6 | 6/6 |
| Pages with correct H1 | 0/6 | 6/6 | 6/6 |
| FAQ rich results showing | 0 | 3+ pages | 6 pages |
