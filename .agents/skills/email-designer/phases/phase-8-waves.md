**Prerequisite:** Phase 7 — Footer (phase-7-footer.md)
**References:** golden-rules.md (rules 5, 6, 9), brands/<brand>.md § Grid Node IDs, § Color Palette
**Next:** Phase 9 — Decorative Elements (phase-9-decorative.md)

---

# Phase 8: Section Dividers (Waves — OPTIONAL)

v4.2: Waves are **optional**. If the wave SVGs from the grid don't match the design or look broken, skip this phase entirely. Clean background-color transitions are always acceptable.

## 8.0 Decision Gate

Before cloning any waves:
1. `mcp__figma-write__export_node_as_image` on a wave source node at 1x scale
2. Visually inspect — does this wave look clean and professional?
3. **If YES** → proceed to 8.1
4. **If NO** (broken SVG, wrong colors, doesn't fit the design) → **SKIP THIS PHASE ENTIRELY**
5. **If UNSURE** → skip. A clean BG transition is always safer than a broken wave.

When skipping waves, ensure section backgrounds transition cleanly:
- Alternating background colors create natural visual separation (see `brands/<brand>.md` § Color Palette for the brand's alternating BG colors)
- No gap > 5px between adjacent section BG rectangles
- Ensure BG rectangles overlap by 1-2px to prevent subpixel white lines

## 8.1 Source Waves

Waves are organic curved SVG shapes from Row 6 wireframes. **NEVER use straight lines.**

Wave source node IDs and dimensions are brand-specific — see `brands/<brand>.md` § Grid Node IDs → "Row 6: Wave Sources" for the complete table of wave names, node IDs, and sizes.

**Note (SLIM):** SLIM waves use runtime discovery. `get_node_info` on the SLIM wireframe frame and scan children for FRAME elements with "Wave" in the name. See `brands/slim.md` § Grid Node IDs for details.

## 8.2 Clone & Place

For each section transition:
1. `mcp__figma-write__clone_node(nodeId: "<wave_source_id>")`
2. `mcp__figma-write__insert_child(parentId: "<production_frame_id>", childId: "<cloned_id>")`
3. `mcp__figma-write__move_node(nodeId: "<cloned_id>", x: 0, y: <transition_y>)`
4. `mcp__figma-write__rename_node` → `Wave_<description>`

## 8.3 Placement Positions

- Below hero: hero height - 15px (overlaps slightly for seamless transition)
- Before each alternating-color section
- Before footer

## 8.4 Wave Fill Colours

Wave fill must match the section it transitions **INTO:**
- Transitioning to the primary BG color → wave fill = primary BG color
- Transitioning to the alternating BG color → wave fill = alternating BG color

Refer to `brands/<brand>.md` § Color Palette for the exact hex values of the brand's background colors.

Inspect nested SVG children of the wave frame — adjust fill on the **child vector**, not the parent frame.

## 8.5 Post-Placement Verification

After placing all waves, export full emailer at 0.5x and verify:
- Each wave blends seamlessly at both edges (no gaps, no hard lines)
- Wave colors match the receiving section background
- No visual artifacts or misaligned fills

**If any wave looks wrong after placement → delete ALL waves and revert to clean BG transitions.** Inconsistency (some waves working, some broken) looks worse than no waves at all.

## 8.6 Removing Waves

If waves need to be removed (skipped during build OR removed after user feedback):
1. Find all wave nodes: search production frame children for names containing `Wave_*`
2. `mcp__figma-write__delete_node` on each wave
3. Verify no gaps remain — section BGs should butt up against each other
4. Update state file to reflect "no waves" decision
