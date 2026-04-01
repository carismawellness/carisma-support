# Email Designer — SLIM Brand Config

## Identity

| Property | Value |
|----------|-------|
| Brand | Carisma Slimming |
| Abbreviation | SLIM |
| Persona | Katya ("With you every step, Katya" — text-based only) |
| Social | @carismaslimming |
| Trust Claim | #1 Reviewed on Google |

---

## Grid Node IDs

### Row 1: Logos
| Element | Node ID | Notes |
|---------|---------|-------|
| Logo Frame | **Runtime discovery** | `get_node_info` on the Row 1 frame → iterate `children` → find FRAME nodes containing "slim" or "slimming" (case-insensitive). Expected: 2 children (colour + white variants). Cache IDs in state file after first discovery. |

### Row 2: Colours
| Element | Node ID |
|---------|---------|
| Gradient Swatch | `4491:68` |
| Solid Swatch 1 | `4491:509` |
| Solid Swatch 2 | `4491:507` |
| Solid Swatch 3 | `4491:508` |

### Row 4: Elements/Templates
| Element | Node IDs |
|---------|----------|
| CTA Bars | `4493:1658`, `4493:1837` |

### Row 5: Fixed Footer
| Element | Node ID | Height |
|---------|---------|--------|
| SLIM Footer | `4492:66` | ~1921px |

### Row 6: Copy + Wireframe (Source)
| Frame | Node ID | Dimensions |
|-------|---------|------------|
| SLIM_Value_01 | `4445:670` | 600x6200 |
| SLIM_Value_02 | `4445:714` | 600xvaries |

### Row 6: Wave Sources
| Wave | Node ID | Notes |
|------|---------|-------|
| SLIM Waves | **Runtime discovery** | `get_node_info(4445:670)` → scan children for FRAME nodes with "Wave" or "wave" in name. Typical: Wave_Hero_Bottom, Wave_Section, Wave_Footer. If fewer than 2 waves found, check `4445:714` children as well. |

### Row 7: Final Production (Target)
| Frame | Node ID | Dimensions |
|-------|---------|------------|
| Slimming_01 | `4495:2358` | 600x4500 |
| Slimming_02 | `4495:2360` | 600x5200 |

---

## Color Palette (Authoritative)

| Name | Hex | Usage |
|------|-----|-------|
| White (BG) | `#ffffff` | Primary body background |
| Off-White | `#f5f0e8` | Section backgrounds, cream sections |
| Forest Green (CTA) | `#4a6b59` | Primary CTA fill, footer BG |
| Sage Green | `#8eb093` | Accent elements, light badges |
| Green Accent | `#8ca899` | Step numbers, nav pills, accent text |
| Nav Pill BG | `#c4d6c7` | "Explore Carisma Slimming" pills |
| Pre-header Bar | `#576f80` | Steel blue urgency strip (SLIM only) |
| Charcoal (text) | `#3b3b3b` | Body text |
| Warm Taupe | `#9b8d83` | Muted accents |
| Hero Gradient Base | `#141f1a` | Hero overlay (0% → 30%@45% → 60%@100%) |
| Primary Gradient | `#2e4738` → `#4a6b59` (90%) → `#668573` (65%) | Hero overlays, premium dark sections |

---

## Typography

### Designed Emailer Fonts
| Role | Font | Weight | Size | Notes |
|------|------|--------|------|-------|
| Hero Header | Cormorant Garamond | Regular | 28-34px | UPPERCASE, letter-spacing +2-3px |
| Sub Headers | Novecento Wide | 400 | 14-18px | UPPERCASE, letter-spacing +2-3px |
| Labels | Novecento Wide | Book | 10-12px | UPPERCASE |
| Body | Roboto | 400 | 15px | Line-height 25.5px |
| CTA Text | Montserrat | Bold | 15px | UPPERCASE, letter-spacing 1.5px |

### Text-Based Emailer Fonts
| Role | Font | Weight | Size |
|------|------|--------|------|
| H1 | Cormorant Garamond | Regular | 30px |
| H2 | Cormorant Garamond | Regular | 22px |
| Body | Montserrat | Regular | 15px |
| CTA | Montserrat | Bold | 15px |

### Case Rules
- Headers: UPPERCASE with letter-spacing +2-3px
- Declarative headlines: Add period at end
- Body: Sentence case
- CTAs: UPPERCASE with letter-spacing 1.5px

### Line Heights
- Body text: 25.5px (at 15px font = ratio 1.7)
- Headlines: ~36px

---

## CTA Spec

| Property | Value |
|----------|-------|
| Dimensions | 480 × 52px |
| Fill | `#4a6b59` forest green |
| Corner Radius | 28px (pill shape) |
| Text Color | `#ffffff` white bold |
| Text Font | Montserrat Bold 15px |
| Text Style | UPPERCASE, letter-spacing 1.5px |
| Chevron | **NEVER on primary CTAs.** Nav pills may have chevron. |

---

## Decorative Elements

### Primary: Green Accent Elements
| Property | Value |
|----------|-------|
| Types | Green accent shapes, nav pills, treatment cards |
| Count Per Emailer | Varies by design |
| Placement | At section transitions, balanced |

### Nav Pills (Footer)
| Property | Value |
|----------|-------|
| Background | `#c4d6c7` |
| Corner Radius | 22px |
| Text | Montserrat Regular 12px |
| Usage | "Explore Carisma Slimming" section in footer |

---

## Brand-Specific Phases

### Phase 6.6: Pre-Header Bar (SLIM Only)

| Property | Value |
|----------|-------|
| Dimensions | 600 × 38px |
| Fill | `#576f80` steel blue |
| Text Font | Montserrat Regular 12px |
| Text Color | `#ffffff` white |
| Text Style | UPPERCASE, letter-spacing 1px |
| Position | y = 0 (top of production frame) |
| Effect | All other elements shift down 38px to make room |

**Implementation:**
1. Create rectangle: 600×38px, fill `#576f80`
2. `insert_child` into production frame at index 0
3. Position at y=0
4. Create text node with pre-header copy
5. Center text vertically within the 38px bar
6. Move all existing elements down by 38px
7. Resize production frame height by +38px

---

## Image Filters

| Property | Value |
|----------|-------|
| Temperature | 0 |
| Saturation | +0.10 |
| Contrast | +0.05 |
| Exposure | 0 |

---

## Expected Output Reference

A completed SLIM Designed Emailer should contain:

- **Pre-header bar** (if applicable): `#576f80` steel blue, 38px height, white Montserrat 12px
- **Hero:** Full-width image + gradient `#141f1a` + logo + headline (Cormorant Garamond) + forest green CTA
- **Content sections** on `#ffffff` / `#f5f0e8` alternating backgrounds
- **3+ CTAs** — forest green `#4a6b59`, 480×52px, 28px pill radius, NO chevron
- **Nav pills:** `#c4d6c7` background, 22px radius (in footer Explore section)
- **Fixed footer** from `4492:66` with trust circles + nav pills + media strip
- **ALL text** in `#3b3b3b` (body) or `#ffffff` (hero/footer)
- **Total elements:** ~45-65 nodes (longest emails)
