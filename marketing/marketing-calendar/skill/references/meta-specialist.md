# Meta Ads Specialist Reference

Channel specialist guidance for Meta campaign planning within the marketing calendar.

**Persona:** 30-year performance marketer & creative strategist

---

## Campaign Naming Convention

All Meta campaigns in the calendar follow this pattern:

```
Campaign Name | CPL XX     (for lead-gen campaigns)
Campaign Name | ROAS XX |  (for revenue campaigns)
```

Examples:
- `Spa Day Summer | CPL 8`
- `Easter Couples Package | CPL 12`
- `CBO_Leads | Gifting | ROAS 4.2 |`

**In the spreadsheet:** Campaign names go in Name rows, daily budgets go in Budget rows (see config.json for exact row positions per brand).

---

## Evergreen Campaigns (Always-On)

These campaigns run year-round. They occupy permanent slots in the calendar.

**Full details:** Invoke the `meta-strategist` skill or reference `~/.claude/skills/meta-strategist/SKILL.md`.

### Spa (EUR 45/day total)
| Campaign | Budget | Row Slot |
|----------|--------|----------|
| CBO_Leads \| Spa Day | EUR 15/day | First Meta Name/Budget pair |
| CBO_Leads \| Couples Package | EUR 10/day | Second pair |
| CBO_Leads \| Massage | EUR 10/day | Third pair |
| CBO_Leads \| Gifting | EUR 10/day | Fourth pair |

### Aesthetics (~EUR 38-46/day)
| Campaign | Budget | Notes |
|----------|--------|-------|
| Lead \| Ultimate Facelift | EUR 8/day | Signature treatment |
| Lead \| Snatch Jawline | EUR 10/day | Cost cap EUR 5 |
| Lead \| 4-in-1 Hydrafacial Glow | EUR 10/day | Broad appeal |
| Lead \| Lip Filler | EUR ~8/day | Younger demographic |
| Lead \| LHR [Season] | EUR 10/day | DEMAND-FLEXIBLE: scale up pre-summer |

### Slimming (USD 93/day total — NOTE: USD not EUR)
| Campaign | Budget | Notes |
|----------|--------|-------|
| CBO_FatFreeze | USD 15/day | 68% discount positioning |
| CBO_MuscleStim | USD 15/day | "Build muscle without gym" |
| CBO_SkinTight | USD 5/day | Post-pregnancy and 40+ |
| CBO_MWL_Menopause | USD 13/day | Women 45+ |
| CBO_MWL_Pain-Solution | USD 20/day | Weight-related pain |
| CBO_MWL_AfterBaby | USD 10/day | Post-pregnancy |
| CBO_MWL_RiskReversal | USD 15/day | Tried everything |

---

## Occasion Campaign Layering

Occasion campaigns get ADDITIONAL budget on top of evergreen — they never replace evergreen spend.

| Period | Evergreen | Occasion Uplift |
|--------|-----------|----------------|
| Normal month | 100% baseline | +0% |
| 1 occasion | 100% baseline | +15-25% |
| Major occasion (BFCM, Christmas) | 100% baseline | +30-50% |

**Seasonal angle rotation:** Update evergreen ad creative to match the season WITHOUT changing campaign structure. Example: Gift Cards runs year-round, but Valentine's week gets Valentine's-themed creative.

---

## Creative Formats

| Format | Use For |
|--------|---------|
| UGC (User Generated Content) | Testimonials, real customer experiences |
| Founder-led / EGC | Brand persona (Sarah/Katya) speaking to camera |
| Testimonial | Customer quote overlaid on lifestyle image |
| Before/After | Aesthetics treatments (with compliance) |
| Static Offer | Clean product/pricing graphic |

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Pausing evergreen for occasion campaigns | NEVER pause. Add budget on top. |
| Using EUR for Slimming budgets | Slimming account uses USD. |
| Generic campaign names without CPL/ROAS target | Always include performance target in name. |
| Bolding campaign names in the spreadsheet | Campaign text is never bold. |
