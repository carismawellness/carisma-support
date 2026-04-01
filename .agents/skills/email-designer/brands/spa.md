# Email Designer — SPA Brand Config

## Identity

| Property | Value |
|----------|-------|
| Brand | Carisma Spa & Wellness |
| Abbreviation | SPA |
| Persona | Sarah ("Peacefully, Sarah" — text-based only) |
| Social | @carismaspamalta |
| Trust Claim | #1 Most Reviewed Spa in Malta |

---

## Grid Node IDs

### Row 1: Logos
| Element | Node ID | Notes |
|---------|---------|-------|
| Logo Frame | `4457:139` | Inspect children for colour + white variants |

### Row 2: Colours
| Element | Node ID |
|---------|---------|
| Gradient Swatch | `4491:66` |
| Solid Swatch 1 | `4491:498` |
| Solid Swatch 2 | `4491:499` |
| Solid Swatch 3 | `4491:500` |

### Row 4: Elements/Templates
| Element | Node IDs |
|---------|----------|
| Flower Petal Variant 1 | `3601:460` |
| Flower Petal Variant 2 | `3601:462` |
| Flower Petal Variant 3 | `3601:464` |
| Flower Petal Variant 4 | `3601:466` |
| CTA Bars | `4493:1658`, `4493:1837` |

### Row 5: Fixed Footer
| Element | Node ID | Height |
|---------|---------|--------|
| SPA Footer | `4491:802` | ~2016px |

### Row 6: Copy + Wireframe (Source)
| Frame | Node ID | Dimensions |
|-------|---------|------------|
| SPA_Value_01 | `4445:527` | 600x4500 |
| SPA_Value_02 | `4445:565` | 600x5200 |

### Row 6: Wave Sources
| Wave | Node ID | Dimensions |
|------|---------|------------|
| Wave_Hero_Bottom | `4468:535` | 600x40 |
| Wave_Beige_Section3 | `4468:537` | 600x35 |
| Wave_Beige_Section5 | `4468:539` | 600x35 |
| Wave_Footer | `4468:541` | 600x35 |

### Row 7: Final Production (Target)
| Frame | Node ID | Dimensions |
|-------|---------|------------|
| SPA_Value_01 | `4495:2255` | 600x4500 |
| SPA_Value_02 | `4495:2313` | 600x5200 |

---

## Color Palette (Authoritative)

| Name | Hex | Usage |
|------|-----|-------|
| Warm Cream (BG) | `#fdf7ec` | Primary body background (NEVER white) |
| Section Beige | `#e8ded1` | Alternating section backgrounds |
| CTA Gold | `#a88c4a` | CTA button fill |
| Accent Gold | `#c4a659` | Stars, decorative elements, accent text |
| Deep Brown (text) | `#3b3029` | ALL body text (never pure black) |
| Warm Taupe | `#9b8d83` | Secondary/muted text |
| Hero Gradient Base | `#1a140f` | Hero overlay (0% → 30% → 65% opacity) |
| Primary Gradient | `#291f12` → `#52381f` (95%) → `#8c612e` (70%) | Hero overlays, premium dark sections |

---

## Typography

### Designed Emailer Fonts
| Role | Font | Weight | Size | Notes |
|------|------|--------|------|-------|
| Hero Header | Trajan Pro | 400 | 30-37px | UPPERCASE or Title Case |
| Sub Headers | Novecento Wide | 400 | 14-18px | UPPERCASE, letter-spacing +2-4px |
| Labels | Novecento Wide | Book | 10-12px | UPPERCASE |
| Body | Roboto | 400 | 20px | Line-height 25.5px |
| CTA Text | Novecento Wide | 650 | 20px | UPPERCASE, letter-spacing 1.5px |

### Text-Based Emailer Fonts
| Role | Font | Weight | Size |
|------|------|--------|------|
| H1 | Playfair Display | Bold | 28-32px |
| H2 | Playfair Display | Regular | 22-24px |
| Body | Montserrat | Regular | 14-16px |
| CTA | Montserrat | SemiBold | 13px |

### Case Rules
- Headers: UPPERCASE or Title Case
- Body: Sentence case
- CTAs: UPPERCASE with letter-spacing 1.5px
- Labels: UPPERCASE with letter-spacing +2-4px

### Line Heights
- Body text: 25.5px (at 20px font = ratio 1.275)
- Headlines: ~42px

---

## CTA Spec

| Property | Value |
|----------|-------|
| Dimensions | 420 × 48px |
| Fill | `#a88c4a` gold |
| Corner Radius | 6px |
| Text Color | `#ffffff` white |
| Text Font | Novecento Wide 650 20px |
| Text Style | UPPERCASE, letter-spacing 1.5px |
| Chevron | **Always.** Append " >" after CTA text |

---

## Decorative Elements

### Primary: Flower Petals
| Property | Value |
|----------|-------|
| Source Variants | 4 (`3601:460`, `3601:462`, `3601:464`, `3601:466`) |
| Count Per Emailer | 6-8 |
| Size Range | 18-58px (must use 2x range for variety) |
| Opacity Range | 0.20-0.40 |
| Rotation Range | -30° to +35° |
| Placement | At section transitions, balanced left/right |

### Secondary: Gold Accent Dividers
| Property | Value |
|----------|-------|
| Width | 80-120px |
| Height | 1-2px |
| Color | `#c4a659` accent gold |
| Opacity | 30-40% |
| Placement | Between sections, centered horizontally |

---

## Brand-Specific Phases

### Phase 2.6: Italianno Decorative Script (SPA Only)
| Property | Value |
|----------|-------|
| Font | Italianno |
| Weight | 400 |
| Size | 45px |
| Case | Title Case |
| Color | `#c4a659` gold or `#ffffff` white (over dark BG) |
| Max Per Emailer | 2-3 instances |
| Pairing | Always paired with a Trajan Pro heading below |
| Usage | Decorative accent text, not structural headings |

---

## Image Filters

| Property | Value |
|----------|-------|
| Temperature | +0.10 |
| Saturation | -0.10 |
| Contrast | 0 |
| Exposure | 0 |

---

## Expected Output Reference

A completed SPA Designed Emailer should contain:

- **Hero:** Full-width image (600×350-450px) + gradient overlay `#1a140f` + white logo (from `4457:139`) + headline (Trajan Pro 30-37px) + subheadline (Roboto 20px) + gold CTA with chevron
- **2-4 content sections** alternating `#fdf7ec` / `#e8ded1` backgrounds
- **3+ CTAs** (hero, mid, pre-footer) — gold `#a88c4a`, 420×48px, 6px radius, chevron ">"
- **Flower petal decoratives:** 3-4 variants, sizes 18-58px, opacity 0.20-0.40
- **Wave dividers** at section transitions (or clean BG transitions if WAVES_SKIPPED)
- **Fixed footer** cloned from `4491:802` — flush, no gap
- **ALL text** in `#3b3029` (body) or `#ffffff` (over dark BG)
- **Total elements:** ~40-60 nodes
