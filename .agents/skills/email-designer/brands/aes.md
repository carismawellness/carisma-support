# Email Designer — AES Brand Config

## Identity

| Property | Value |
|----------|-------|
| Brand | Carisma Aesthetics |
| Abbreviation | AES |
| Persona | Sarah ("Beautifully yours, Sarah" — text-based only) |
| Social | @carismaaesthetics |
| Trust Claim | #1 Voted Med-Aesthetics Clinic in Malta |

---

## Grid Node IDs

### Row 1: Logos
| Element | Node ID | Notes |
|---------|---------|-------|
| Logo Frame | `4493:1738` | Inspect children for colour + white variants |

### Row 2: Colours
| Element | Node ID |
|---------|---------|
| Gradient Swatch | `4491:501` |
| Solid Swatch 1 | `4491:505` |
| Solid Swatch 2 | `4491:503` |
| Solid Swatch 3 | `4491:504` |

### Row 4: Elements/Templates
| Element | Node IDs |
|---------|----------|
| Before/After Card 1 | `4493:1194` |
| Before/After Card 2 | `4493:1213` |
| Before/After Card 3 | `4493:1314` |
| Before/After Card 4 | `4493:1238` |
| CTA Bars | `4493:1658`, `4493:1837` |

### Row 5: Fixed Footer
| Element | Node ID | Height |
|---------|---------|--------|
| AES Footer | `4491:803` | ~1682px |

### Row 6: Copy + Wireframe (Source)
| Frame | Node ID | Dimensions |
|-------|---------|------------|
| AES_Value_01 | `4445:600` | 600x4800 |
| AES_Value_02 | `4445:640` | 600xvaries |

### Row 6: Wave Sources
| Wave | Node ID | Dimensions |
|------|---------|------------|
| Wave_Hero_Bottom | `4468:549` | 600x40 |
| Wave_Sage_Section3 | `4468:551` | 600x30 |
| Wave_Beige_Footer | `4468:553` | 600x30 |

### Row 7: Final Production (Target)
| Frame | Node ID | Dimensions |
|-------|---------|------------|
| Aes_01 | `4495:2354` | 600x4500 |
| Aes_02 | `4495:2356` | 600x5200 |

---

## Color Palette (Authoritative)

| Name | Hex | Usage |
|------|-----|-------|
| White (BG) | `#ffffff` | Primary body background |
| Sage Tint | `#e8f0ed` | Content section backgrounds |
| Light Sage | `#e7f0f0` | Alternating section backgrounds |
| Warm Beige Footer | `#f5f0eb` | Footer, "Real Results" section |
| CTA Sage | `#607872` | CTA button fill |
| Badge Sage | `#8faba3` | Numbered badges, section accents |
| Sage Teal | `#96b2b2` | Headings, accent borders |
| Charcoal (text) | `#3b3b3b` | Body text |
| Medium Gray | `#6b6b6b` | Secondary text |
| Warm Taupe | `#9b8d83` | Muted accents |
| Gold (stars) | `#c4a366` | Star ratings ONLY |
| Hero Gradient Base | `#1a1f1c` | Hero overlay (0% → 25% → 55% opacity) |
| Primary Gradient | `#96b2b2` → `#b5ccc4` (70%) | Hero overlays, premium sections |

---

## Typography

### Designed Emailer Fonts
| Role | Font | Weight | Size | Notes |
|------|------|--------|------|-------|
| Hero Header | Cormorant Garamond | Medium | 28-34px | Title Case or UPPERCASE |
| Sub Headers | Novecento Wide | 400 | 14-18px | UPPERCASE, letter-spacing +2-4px |
| Labels | Novecento Wide | Book | 10-12px | UPPERCASE |
| Body | Roboto | 400 | 14px | Line-height 23.8px |
| CTA Text | Montserrat | SemiBold | 13px | UPPERCASE, letter-spacing 1.5px |

### Text-Based Emailer Fonts
| Role | Font | Weight | Size |
|------|------|--------|------|
| H1 | Cormorant Garamond | Medium | 32px |
| H2 | Cormorant Garamond | Regular | 24px |
| Body | Montserrat | Regular | 14px |
| CTA | Montserrat | SemiBold | 13px |

### Case Rules
- Headers: Title Case or UPPERCASE with letter-spacing +2-4px
- Body: Sentence case
- CTAs: UPPERCASE with letter-spacing 1.5px

### Line Heights
- Body text: 23.8px (at 14px font = ratio 1.7)
- Headlines: ~38px

---

## CTA Spec

| Property | Value |
|----------|-------|
| Dimensions | 340 × 46px |
| Fill | `#607872` sage |
| Corner Radius | 22px (pill shape) |
| Text Color | `#ffffff` white |
| Text Font | Montserrat SemiBold 13px |
| Text Style | UPPERCASE, letter-spacing 1.5px |
| Chevron | **Optional.** Only if wireframe shows it |

---

## Decorative Elements

### Primary: Sage Accent Elements
| Property | Value |
|----------|-------|
| Types | Treatment cards, star ratings, testimonial blocks |
| Count Per Emailer | Varies by design |
| Placement | At section transitions, balanced |

### Before/After Cards
| Property | Value |
|----------|-------|
| Source IDs | `4493:1194`, `4493:1213`, `4493:1314`, `4493:1238` |
| Dimensions | 130 × 160px per card |
| Corner Radius | 8px |
| Placeholder Fill | `#d9d1c7` |
| Label Font | Montserrat Medium 9px |
| Label Text | "BEFORE" / "AFTER" |

### Star Ratings
| Property | Value |
|----------|-------|
| Color | `#c4a366` gold |
| Usage | Star ratings ONLY — never for other decorative use |

---

## Brand-Specific Phases

### Before/After Placeholders
When the wireframe includes Before/After sections but no real photos are available:
- Clone Before/After card templates from Row 4
- Place as paired cards (130×160px each, side by side)
- Add "BEFORE" / "AFTER" labels in Montserrat Medium 9px
- Use `#d9d1c7` warm beige placeholder fill
- Note: Real photos should replace these before final production

---

## Image Filters

| Property | Value |
|----------|-------|
| Temperature | 0 |
| Saturation | 0 |
| Contrast | +0.05 |
| Exposure | +0.05 |

---

## Expected Output Reference

A completed AES Designed Emailer should contain:

- **Hero:** Full-width image + gradient `#1a1f1c` + white logo (from `4493:1738`) + headline (Cormorant Garamond Medium) + sage CTA
- **Content sections** on `#ffffff` / `#e8f0ed` alternating backgrounds
- **3+ CTAs** — sage `#607872`, 340×46px, 22px pill radius
- **Before/After cards** from `4493:1194` etc.
- **Fixed footer** from `4491:803` with "Real Results" section
- **ALL text** in `#3b3b3b` (body) or `#ffffff` (hero)
- **Total elements:** ~35-50 nodes
