# Phase 6: Colours

## 6.1 Reference Colours Row (Row 2)

Each brand has 1 gradient + 3 solids. Node IDs:

| Brand | Gradient | Solid 1 | Solid 2 | Solid 3 |
|-------|----------|---------|---------|---------|
| SPA | `4491:66` | `4491:498` | `4491:499` | `4491:500` |
| AES | `4491:501` | `4491:505` | `4491:503` | `4491:504` |
| SLIM | `4491:68` | `4491:509` | `4491:507` | `4491:508` |

Shared warm taupe across all brands: `#9b8d83`

## 6.2 Apply Body Background

`mcp__figma-write__set_fill_color` on the production frame:
- SPA: `#fdf7ec` warm cream (**NEVER** white)
- AES: `#ffffff` pure white
- SLIM: `#ffffff` pure white

## 6.3 Apply Section Backgrounds

`mcp__figma-write__set_fill_color` on alternating section rectangles:
- SPA: `#e8ded1` beige (alternating with cream)
- AES: `#e8f0ed` sage tint (alternating with white)
- SLIM: `#f5f0e8` off-white (alternating with white)

## 6.4 Apply Hero Gradient Overlay

The hero gradient is a top-to-bottom overlay that darkens the lower portion of the hero image for text readability. The top stays transparent (showing the image), the bottom gets progressively darker.

`mcp__figma-write__set_gradient` on the hero overlay rectangle. Each gradient has 3 stops defined by **position** (0.0 = top, 1.0 = bottom) and **opacity** (0 = transparent, 1 = opaque):

### SPA Hero Gradient
- Color: `#1a140f` (warm dark brown)
- Stop 1: position `0.0`, opacity `0.0` (fully transparent at top)
- Stop 2: position `0.45`, opacity `0.30` (30% dark at mid-point)
- Stop 3: position `1.0`, opacity `0.65` (65% dark at bottom)

### AES Hero Gradient
- Color: `#1a1f1c` (cool dark green-gray)
- Stop 1: position `0.0`, opacity `0.0` (fully transparent at top)
- Stop 2: position `0.40`, opacity `0.25` (25% dark at 40%)
- Stop 3: position `1.0`, opacity `0.55` (55% dark at bottom)

### SLIM Hero Gradient
- Color: `#141f1a` (deep forest dark)
- Stop 1: position `0.0`, opacity `0.0` (fully transparent at top)
- Stop 2: position `0.45`, opacity `0.30` (30% dark at 45%)
- Stop 3: position `1.0`, opacity `0.60` (60% dark at bottom)

### Implementation:
```
mcp__figma-write__set_gradient(
  nodeId: "<hero_overlay_rectangle>",
  gradientType: "LINEAR",
  gradientStops: [
    { position: 0.0, color: { r: R, g: G, b: B, a: 0.0 } },
    { position: MID, color: { r: R, g: G, b: B, a: MID_OPACITY } },
    { position: 1.0, color: { r: R, g: G, b: B, a: BOTTOM_OPACITY } }
  ],
  gradientHandlePositions: [
    { x: 0.5, y: 0.0 },
    { x: 0.5, y: 1.0 }
  ]
)
```

**Purpose:** The gradient ensures white text at the bottom of the hero (headline, subheadline, CTA) is readable against ANY hero image. If text is still hard to read after applying the gradient, increase the bottom stop opacity by 0.05-0.10 and re-verify.

## 6.5 Strategic Colour Placement

Use design principles. Every colour application should have a reason:
- **Gradients** → hero overlays, premium dark sections (not flat backgrounds)
- **Brand accent** → CTAs, star ratings, accent text, pricing highlights
  - SPA: gold `#c4a659` / CTA gold `#a88c4a`
  - AES: sage teal `#96b2b2` / CTA sage `#607872`
  - SLIM: sage green `#8eb093` / CTA forest `#4a6b59`
- **Warm taupe `#9b8d83`** → secondary text, muted accents (all brands)
- **NO** bright colors, no red, no orange, no blue across any brand

## 6.6 SLIM Pre-Header Bar (SLIM Only)

**Skip for SPA and AES.** This is a SLIM-exclusive element.

The pre-header bar is a narrow urgency strip across the full width at the very top of the emailer, ABOVE the hero section. It typically contains a short promotional hook or urgency message.

### Specs:
- Width: 600px (full width)
- Height: 38px
- Background: `#576f80` steel blue
- Text: White `#ffffff`, Montserrat Regular 12px, centered, UPPERCASE
- Letter-spacing: 1px
- Position: y=0 (absolute top of production frame — everything else shifts down by 38px)

### Implementation:
1. `mcp__figma-write__create_rectangle(width: 600, height: 38)` → `insert_child` into production frame
2. `mcp__figma-write__set_fill_color` → `#576f80`
3. `mcp__figma-write__move_node(x: 0, y: 0)` — top of frame
4. `mcp__figma-write__create_text` → pre-header text from Copy Manifest (section: PRE-HEADER)
5. `mcp__figma-write__set_font_name(family: "Montserrat", style: "Regular")` (load_font_async first)
6. `mcp__figma-write__set_font_size(12)`
7. `mcp__figma-write__set_fill_color` → white `#ffffff` on the text node
8. `mcp__figma-write__set_text_align("CENTER")`
9. Center text vertically within the 38px bar: `move_node(x: 0, y: 13)` (approximate — 38px bar, 12px text)
10. `insert_child` the text node into production frame
11. `rename_node` → `PreHeader_Bar_BG` and `PreHeader_Bar_Text`

### Content:
- The pre-header text comes from the Copy Manifest (Phase 1). If no PRE-HEADER section exists in the manifest, check the wireframe for a colored bar at the top.
- Typical text: "LIMITED TIME OFFER", "FREE CONSULTATION — BOOK NOW", "THIS MONTH ONLY: €199 STARTER PACKS"
- If no pre-header text is found anywhere, **ask the user** whether to include one. Do not invent urgency text.

### Impact on positioning:
- When a pre-header bar is present, ALL other elements shift down by 38px:
  - Hero image starts at y=38 instead of y=0
  - Logo, headline, CTA positions all adjust accordingly
  - Phase 4 (Spacing) must account for this offset
