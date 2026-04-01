# Phase 6: Colours

**Prerequisite:** Phase 5/5.5 (Images / Nano Banana)
**References:** golden-rules.md (rules 2, 6), brands/<brand>.md § Color Palette, § Grid Node IDs, § Brand-Specific Phases
**Next:** Phase 7 (Footer)

---

## 6.1 Reference Colours Row (Row 2)

Each brand has 1 gradient + 3 solids. Node IDs are brand-specific — see `brands/<brand>.md` § Grid Node IDs → Row 2: Colours for the exact swatch node IDs.

Shared warm taupe across all brands: `#9b8d83`

## 6.2 Apply Body Background

`mcp__figma-write__set_fill_color` on the production frame:

The body background color is brand-specific — see `brands/<brand>.md` § Color Palette for the primary body background hex value (look for the "BG" entry).

```
mcp__figma-write__set_fill_color(
  nodeId: "<production_frame>",
  r: R, g: G, b: B, a: 1.0
)
```

Where R, G, B are derived from [brand_body_bg] in `brands/<brand>.md` § Color Palette.

## 6.3 Apply Section Backgrounds

`mcp__figma-write__set_fill_color` on alternating section rectangles:

The alternating section background color is brand-specific — see `brands/<brand>.md` § Color Palette for the section background hex value (alternates with the body background).

```
mcp__figma-write__set_fill_color(
  nodeId: "<section_rectangle>",
  r: R, g: G, b: B, a: 1.0
)
```

Where R, G, B are derived from [brand_section_bg] in `brands/<brand>.md` § Color Palette.

## 6.4 Apply Hero Gradient Overlay

The hero gradient is a top-to-bottom overlay that darkens the lower portion of the hero image for text readability. The top stays transparent (showing the image), the bottom gets progressively darker.

`mcp__figma-write__set_gradient` on the hero overlay rectangle. Each gradient has 3 stops defined by **position** (0.0 = top, 1.0 = bottom) and **opacity** (0 = transparent, 1 = opaque).

The gradient base color and stop configuration are brand-specific — see `brands/<brand>.md` § Color Palette for the "Hero Gradient Base" entry. That entry contains the hex color AND the opacity stops (e.g., "0% -> 30% -> 65% opacity").

### Implementation:
```
mcp__figma-write__set_gradient(
  nodeId: "<hero_overlay_rectangle>",
  gradientType: "LINEAR",
  gradientStops: [
    { position: 0.0, color: { r: R, g: G, b: B, a: 0.0 } },
    { position: [brand_mid_position], color: { r: R, g: G, b: B, a: [brand_mid_opacity] } },
    { position: 1.0, color: { r: R, g: G, b: B, a: [brand_bottom_opacity] } }
  ],
  gradientHandlePositions: [
    { x: 0.5, y: 0.0 },
    { x: 0.5, y: 1.0 }
  ]
)
```

Where:
- R, G, B are derived from [brand_hero_gradient_base] in `brands/<brand>.md` § Color Palette
- [brand_mid_position], [brand_mid_opacity], [brand_bottom_opacity] are from the same entry's opacity stop notation

**Purpose:** The gradient ensures white text at the bottom of the hero (headline, subheadline, CTA) is readable against ANY hero image. If text is still hard to read after applying the gradient, increase the bottom stop opacity by 0.05-0.10 and re-verify.

## 6.5 Strategic Colour Placement

Use design principles. Every colour application should have a reason:

- **Gradients** -> hero overlays, premium dark sections (not flat backgrounds)
- **Brand accent** -> CTAs, star ratings, accent text, pricing highlights. See `brands/<brand>.md` § Color Palette for accent and CTA colors.
- **Warm taupe `#9b8d83`** -> secondary text, muted accents (all brands)
- **NO** bright colors, no red, no orange, no blue across any brand

## 6.6 SLIM Pre-Header Bar (SLIM Only)

**Skip for SPA and AES.** This is a SLIM-exclusive element.

For full implementation details, see `brands/slim.md` § Brand-Specific Phases → Phase 6.6: Pre-Header Bar.

The pre-header bar is a narrow urgency strip across the full width at the very top of the emailer, ABOVE the hero section. It typically contains a short promotional hook or urgency message.

### Specs:

All specs (dimensions, fill color, text font, text color, text style, position) are defined in `brands/slim.md` § Brand-Specific Phases → Phase 6.6: Pre-Header Bar.

### Implementation:
1. `mcp__figma-write__create_rectangle` -> `insert_child` into production frame
2. `mcp__figma-write__set_fill_color` -> see `brands/slim.md` § Color Palette for pre-header bar color
3. `mcp__figma-write__move_node(x: 0, y: 0)` — top of frame
4. `mcp__figma-write__create_text` -> pre-header text from Copy Manifest (section: PRE-HEADER)
5. `mcp__figma-write__set_font_name` — see `brands/slim.md` § Brand-Specific Phases for font spec (`load_font_async` first)
6. `mcp__figma-write__set_font_size` — see `brands/slim.md` § Brand-Specific Phases for size
7. `mcp__figma-write__set_fill_color` -> white on the text node
8. `mcp__figma-write__set_text_align("CENTER")`
9. Center text vertically within the bar
10. `insert_child` the text node into production frame
11. `rename_node` -> `PreHeader_Bar_BG` and `PreHeader_Bar_Text`

### Content:
- The pre-header text comes from the Copy Manifest (Phase 1). If no PRE-HEADER section exists in the manifest, check the wireframe for a colored bar at the top.
- Typical text: "LIMITED TIME OFFER", "FREE CONSULTATION -- BOOK NOW", "THIS MONTH ONLY: [offer text]"
- If no pre-header text is found anywhere, **ask the user** whether to include one. Do not invent urgency text.

### Impact on positioning:
- When a pre-header bar is present, ALL other elements shift down by the bar height:
  - Hero image starts at y=[bar_height] instead of y=0
  - Logo, headline, CTA positions all adjust accordingly
  - Phase 4 (Spacing) must account for this offset
