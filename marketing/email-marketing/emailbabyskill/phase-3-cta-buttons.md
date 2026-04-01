# Phase 3: CTA Buttons

## 3.1 Discover CTA Source Buttons

The Figma grid has a **Buttons row** (part of Row 4: Elements/Templates) with pre-designed CTA buttons per brand. The button design (fill, radius, size, padding) is fixed — only the text changes per emailer.

**Always clone from the Buttons row. Only create from scratch as a last resort.**

1. `get_node_info` on the Row 4 Elements/Templates frame for the current brand column
2. Inspect `children` → locate button/CTA elements. Look for:
   - Frame or component names containing "CTA", "Button", or "btn" (case-insensitive)
   - Known element IDs from SKILL.md: `4493:1658`, `4493:1837` (CTA bars/elements)
   - Rectangles with the brand's CTA fill color (`#a88c4a` SPA / `#607872` AES / `#4a6b59` SLIM)
3. `export_node_as_image` at 1x → visually confirm you found the correct CTA style
4. Note the source node ID — you'll clone this for every CTA placement

### Brand CTA Specs (for reference — these are already baked into the Buttons row designs)

| Property | SPA | AES | SLIM |
|----------|-----|-----|------|
| Size | 420×48 | 340×46 | 480×52 |
| Fill | `#a88c4a` gold | `#607872` sage | `#4a6b59` forest green |
| Corner radius | 6px | 22px | 28px |
| Text color | White | White | White |
| Text case | UPPERCASE | UPPERCASE | UPPERCASE BOLD |
| Text weight | SemiBold 13px | SemiBold 13px | Bold 15px |
| Chevron (>) | Always | Optional (only if wireframe shows it) | Never on primary CTAs |
| Letter-spacing | 1.5px | 1.5px | 1.5px |

**Font depends on emailer type:** Designed = Novecento Wide (per table above). Text-Based = Montserrat (SPA/AES: SemiBold 13px, SLIM: Bold 15px).

## 3.2 Clone & Place Each CTA

For each CTA needed (minimum 3 per emailer):

**Clone approach (preferred):**
1. `mcp__figma-write__clone_node(nodeId: "<source_cta_id>")` — clones the pre-designed button
2. `mcp__figma-write__insert_child(parentId: "<production_frame>", childId: "<cloned_cta>")` — parent into Row 7
3. `mcp__figma-write__move_node` — position at correct Y coordinate
4. Find the text node inside the cloned button: `get_node_info` on cloned CTA → inspect `children` → find the TEXT node
5. `mcp__figma-write__set_text_content` — update with CTA text from Copy Manifest (**verbatim, never improvised**)
6. Do NOT change the fill color, corner radius, font, or size — the design is already correct from the source

**Fallback — create from scratch (only if Buttons row source is unavailable):**
1. `mcp__figma-write__create_rectangle` — button background
2. `mcp__figma-write__set_corner_radius` — per brand spec (see table above)
3. `mcp__figma-write__set_fill_color` — brand CTA color
4. `mcp__figma-write__create_text` — button label
5. `mcp__figma-write__set_font_name` — Novecento Wide (Designed) | Montserrat (Text-Based)
6. `mcp__figma-write__insert_child` — parent BOTH rectangle and text into production frame
7. Button text from Copy Manifest — **verbatim, never improvised**

## 3.3 Place 3 CTAs Minimum

1. **Hero area** — below hero headline
2. **Mid-content** — between major sections
3. **Pre-footer** — above fixed footer

`mcp__figma-write__move_node` to position each CTA.
