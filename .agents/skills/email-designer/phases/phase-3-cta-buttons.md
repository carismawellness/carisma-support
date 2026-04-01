# Phase 3: CTA Buttons

**Prerequisite:** Phase 2 — Text Hierarchy
**References:** golden-rules.md (rules 1, 9), brands/<brand>.md § CTA Spec, § Grid Node IDs, § Typography
**Next:** Phase 3.5 — Logo Cloning

---

## 3.1 Discover CTA Source Buttons

The Figma grid has a **Buttons row** (part of Row 4: Elements/Templates) with pre-designed CTA buttons per brand. The button design (fill, radius, size, padding) is fixed — only the text changes per emailer.

**Always clone from the Buttons row. Only create from scratch as a last resort.**

1. `get_node_info` on the Row 4 Elements/Templates frame for the current brand column (`see brands/<brand>.md § Grid Node IDs` → Row 4)
2. Inspect `children` → locate button/CTA elements. Look for:
   - Frame or component names containing "CTA", "Button", or "btn" (case-insensitive)
   - Known CTA Bar node IDs from `brands/<brand>.md § Grid Node IDs` → Row 4
   - Rectangles with the brand's CTA fill color (`see brands/<brand>.md § CTA Spec` for the fill hex)
3. `export_node_as_image` at 1x → visually confirm you found the correct CTA style
4. Note the source node ID — you'll clone this for every CTA placement

### Brand CTA Specs

All CTA properties (dimensions, fill color, corner radius, text color, text weight, chevron rules, letter-spacing) are defined in `brands/<brand>.md § CTA Spec`. These specs are already baked into the Buttons row designs — referencing them here is for fallback creation and verification only.

**Font depends on emailer type:** Designed emailers use the CTA font from `brands/<brand>.md § Typography → Designed Emailer Fonts`. Text-Based emailers use the CTA font from `brands/<brand>.md § Typography → Text-Based Emailer Fonts`.

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
2. `mcp__figma-write__set_corner_radius` — per `brands/<brand>.md § CTA Spec`
3. `mcp__figma-write__set_fill_color` — per `brands/<brand>.md § CTA Spec`
4. `mcp__figma-write__create_text` — button label
5. `mcp__figma-write__set_font_name` — per `brands/<brand>.md § Typography` (Designed or Text-Based CTA font)
6. `mcp__figma-write__insert_child` — parent BOTH rectangle and text into production frame
7. Button text from Copy Manifest — **verbatim, never improvised**

## 3.3 Place 3 CTAs Minimum

1. **Hero area** — below hero headline
2. **Mid-content** — between major sections
3. **Pre-footer** — above fixed footer

`mcp__figma-write__move_node` to position each CTA.
