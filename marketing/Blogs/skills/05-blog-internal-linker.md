# Blog Internal Linker

**Skill name:** `blog-internal-linker`
**Pipeline position:** Step 5
**Input:** FINAL-[nn]-[slug].md (humanized)
**Output:** FINAL.md with internal links applied → `blog-final-format-qc`

---

## Overview

Scans the humanized blog post and ensures the right keywords are hyperlinked to the right Carisma service pages. Follows SEO best practice: first occurrence only, never in headings, 3–6 total internal links per post.

---

## Carisma Keyword → URL Map

### Carisma Aesthetics

**All URLs verified against live site — April 2026.**

| Keyword(s) to link | Target URL |
|---|---|
| Botox Malta / botox treatment / anti-wrinkle injections / wrinkle relaxing / botulinum toxin | `https://www.carismaaesthetics.com/wrinkle-relaxing-malta` |
| lip fillers / lip filler Malta / lip augmentation Malta | `https://www.carismaaesthetics.com/lip-fillers-malta` |
| dermal fillers / cheek filler / jawline filler / dermal fillers Malta | `https://www.carismaaesthetics.com/dermal-fillers-malta` |
| collagen stimulator / collagen boost Malta / Profhilo Malta / skin booster Malta | `https://www.carismaaesthetics.com/collagen-stimulator-malta` |
| microneedling Malta / microneedling treatment | `https://www.carismaaesthetics.com/microneedling-malta` |
| mesotherapy Malta / mesotherapy treatment | `https://www.carismaaesthetics.com/mesotherapy-malta` |
| PRP Malta / PRP treatment / platelet rich plasma Malta / PRP facial | `https://www.carismaaesthetics.com/prp-malta` |
| thread lift Malta / thread lift treatment / non-surgical facelift Malta | `https://www.carismaaesthetics.com/thread-lift-malta` |
| chemical peel Malta / chemical peels Malta / skin peel Malta | `https://www.carismaaesthetics.com/chemical-peels-malta` |
| fat dissolving Malta / fat dissolving injections Malta / double chin treatment Malta | `https://www.carismaaesthetics.com/fat-dissolving-malta` |
| HydraFacial Malta / Hydrafacial treatment | `https://www.carismaaesthetics.com/hydrafacial` |
| laser hair removal Malta / permanent hair removal Malta | `https://www.carismaaesthetics.com/laser-hair-removal-malta` |
| aesthetics membership Malta / Carisma Aesthetics membership | `https://www.carismaaesthetics.com/membership` |
| aesthetic gift voucher Malta / aesthetics gift card Malta | `https://www.carismaaesthetics.com/e-giftcards-vouchers` |
| book a free consultation / free aesthetics consultation / book your consultation | `https://www.carismaaesthetics.com/` |

**Notes:**
- Botox page URL is `/wrinkle-relaxing-malta` — NOT `/botox-malta`
- Lip fillers and dermal fillers are separate pages — NOT a combined `/fillers` page
- Profhilo is covered under `/collagen-stimulator-malta`
- Aesthetics does NOT have a confirmed skin tightening page — do not link "skin tightening" in Aesthetics posts
- Aesthetics fat dissolving (`/fat-dissolving-malta`) is separate from Slimming fat dissolving (`carismaslimming.com/fatdissolving`)

### Carisma Spa

**All URLs verified — April 2026.**

| Keyword(s) to link | Target URL |
|---|---|
| spa / Carisma Spa / our spa in Malta | `https://www.carismaspa.com/` |
| spa day Malta / spa day package / spa day experience | `https://www.carismaspa.com/spa-day` |
| couples spa Malta / couples spa package / couples massage Malta / spa for two Malta | `https://www.carismaspa.com/couples-package` |
| spa party Malta / group spa Malta / hen party spa Malta | `https://www.carismaspa.com/spa-party` |
| massages Malta / massage therapy Malta / Swedish massage Malta / hot stone massage Malta / massage treatment | `https://www.carismaspa.com/massages` |
| hammam Malta / hammam ritual / Turkish bath Malta / hammam experience | `https://www.carismaspa.com/hammam` |
| facial Malta / facial treatment Malta / skin facial Malta | `https://www.carismaspa.com/facials` |
| HydraFacial spa / HydraFacial Malta (spa) | `https://www.carismaspa.com/hydrafacial` |
| laser hair removal Malta (spa) | `https://www.carismaspa.com/laser-hair-removal-malta` |
| spa gift voucher / spa gifts Malta / spa voucher Malta / gift voucher Malta | `https://www.carismaspa.com/gifts` |

**Anchor text rules (user-specified):**
- "spa day" → `/spa-day`
- "massages" → `/massages`
- "spa" → `/` (home page)
- "gifts" / "gift vouchers" → `/gifts`

**Notes:**
- Couples page URL is `/couples-package` — NOT `/couples`
- Gifts page URL is `/gifts` — NOT `/gift-vouchers`
- Spa blog cross-links (e.g. `/blog/what-is-a-hammam`) have NOT been verified — do not use until confirmed

### Carisma Slimming

| Keyword(s) to link | Target URL |
|---|---|
| weight loss programme Malta / slimming programme Malta / slimming packages Malta | `https://www.carismaslimming.com/packages` |
| medical weight loss Malta / medically supervised weight loss Malta / weight loss clinic Malta / GLP-1 weight loss Malta | `https://www.carismaslimming.com/medical-weight-loss` |
| fat reduction Malta / fat freezing Malta / CoolSculpting Malta / cryolipolysis Malta / body contouring Malta | `https://www.carismaslimming.com/fat-reduction` |
| fat dissolving injections Malta / fat dissolving Malta / Aqualyx Malta / lipolysis injections Malta | `https://www.carismaslimming.com/fatdissolving` |
| EMSculpt Malta / EMSculpt NEO / EMS body sculpting Malta / muscle stimulation Malta | `https://www.carismaslimming.com/muscle-stimulation` |
| skin tightening Malta / body skin tightening Malta / skin firming Malta | `https://www.carismaslimming.com/skin-tightening` |
| anti-cellulite treatment Malta / cellulite reduction Malta / VelaShape Malta | `https://www.carismaslimming.com/anti-cellulite` |
| lymphatic drainage Malta / lymphatic drainage massage Malta / manual lymphatic drainage Malta | `https://www.carismaslimming.com/lymphatic-drainage` |
| book a free slimming consultation / free slimming consultation / book your consultation | `https://www.carismaslimming.com/consultation` |

---

## Cross-Brand Conflicts

Some keywords appear on multiple brand sites. Always link to the page that matches the brand of the post being written:

| Keyword | In a Spa post | In an Aesthetics post | In a Slimming post |
|---|---|---|---|
| HydraFacial | carismaspa.com/hydrafacial | carismaaesthetics.com/hydrafacial | — |
| laser hair removal | carismaspa.com/laser-hair-removal-malta | carismaaesthetics.com/laser-hair-removal-malta | — |
| fat dissolving | — | carismaaesthetics.com/fat-dissolving-malta | carismaslimming.com/fatdissolving |
| skin tightening | — | (no confirmed page — do not link) | carismaslimming.com/skin-tightening |

---

## SEO Linking Rules

1. **First occurrence only** — Link a keyword once per post. Do not link the same destination URL more than once.
2. **Never link in headings** — H1, H2, H3 must never contain linked text.
3. **3–6 internal links per post** — Fewer is too sparse; more risks over-optimisation.
4. **Prioritise by relevance** — Link complementary pages before the post's own primary topic.
5. **Anchor text must be natural** — Never use "click here" or "learn more". The keyword itself is the anchor.
6. **Do not link the primary keyword of this post** — If the post is about fat freezing, do not link "fat freezing Malta" — the post IS that content.
7. **Verify links already present** — Audit existing links in the draft first before adding new ones. Do not duplicate.

---

## Execution Steps

1. Read the FINAL.md file
2. Identify the post's primary keyword and brand (to exclude self-linking)
3. Audit any existing internal links in the draft — list them
4. Scan the body text for all keyword map matches (excluding headings)
5. Select the first occurrence of each keyword
6. Apply links — target total 3–6 internal links per post
7. Update the FINAL.md file with links applied (overwrite in place)
8. Return an audit summary

---

## Output Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTERNAL LINK AUDIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Post: [title]
Brand: [brand]

LINKS ALREADY PRESENT (from writer):
- [anchor text] → [URL]

LINKS ADDED:
- [anchor text] → [URL] (para X, first occurrence)

LINKS SKIPPED (why):
- [keyword] → already linked / in heading / self-reference

TOTAL INTERNAL LINKS: [n]
SEO STATUS: [PASS if 3–6 / WARNING if <3 or >6]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| Linking primary keyword of the post | Skip it — the post IS that page |
| Adding links in H2/H3 headings | Headings are never linked |
| Linking same URL twice | One URL per post maximum |
| Over-linking (7+) | Trim to 6 maximum — pick highest-value pages |
| Changing anchor text from natural keyword | Anchor = exact keyword match |
