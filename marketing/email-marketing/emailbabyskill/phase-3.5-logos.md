# Phase 3.5: Logo Cloning

> **Reminder (Golden Rule #14):** `<production_frame>` below means the EXISTING Row 7 grid frame — SPA: `4495:2255`/`4495:2313`, AES: `4495:2354`/`4495:2356`, SLIM: `4495:2358`/`4495:2360`. Never a self-created frame.

Clone brand logos from the Logos row (Row 1) into the production frame. Every brand has **2 logos**: one in brand colour and one in white.

## CRITICAL: Real Logos Only — Never Text Placeholders

A text node that says "CARISMA SPA & WELLNESS" in Montserrat is **NOT a logo**. The real logo is a FRAME or GROUP containing vector paths (the brand's rose/leaf mark + wordmark).

**How to verify you have the real logo:**
1. `get_node_info` on the logo node → check `type`
2. If `type` is `TEXT` → **WRONG.** This is a placeholder. Find the real logo.
3. If `type` is `FRAME` or `GROUP` or `COMPONENT` → **CORRECT.** This is the vector logo.
4. Note: the Figma API may show `children: []` for vector logo frames — this is normal. The vectors render correctly even if children aren't expanded in the API response.

## 3.5.1 Discover Logo Node IDs

**SPA and AES — known IDs (from SKILL.md FIGMA NODE ID REFERENCE):**
- SPA: `4457:139` → `get_node_info` → inspect children for brand colour + white variants
- AES: `4493:1738` → `get_node_info` → inspect children for brand colour + white variants

**SLIM — runtime discovery:**
1. `get_node_info` on the Row 1 (Logos) frame for the Slimming column
2. Iterate `children` array → find FRAME nodes whose name contains "slim" or "slimming" (case-insensitive)
3. Expected: 2 children — one brand colour variant, one white variant
4. **Verify each is a real logo (not text):** check `type` field — must be FRAME, GROUP, or COMPONENT (never TEXT)
5. `export_node_as_image` at 2x → visually confirm you see the leaf/brand mark
6. Cache discovered IDs in the state file under `## Connection` for future phases

**Type verification (ALL brands — do this BEFORE cloning):**
1. For each discovered logo node: `get_node_info` → check `type`
2. If `type` is `TEXT` → **STOP.** This is a text placeholder, not the real logo. Traverse siblings or parent children to find the actual FRAME/GROUP logo node.
3. If `type` is `FRAME`, `GROUP`, or `COMPONENT` → proceed to 3.5.2
4. Note: Figma API may show `children: []` for vector logo frames — this is normal. The vectors render correctly even if children aren't expanded.

## 3.5.2 Clone & Place Logos

**Pre-condition:** Section 3.5.1 MUST have confirmed each logo node is type FRAME/GROUP/COMPONENT (not TEXT). If you skipped type verification, go back and do it now. Never clone a TEXT node as a logo.

For EACH logo variant needed:

1. `mcp__figma-write__clone_node(nodeId: "<logo_id>")`
2. `mcp__figma-write__insert_child(parentId: "<production_frame>", childId: "<cloned_logo>")`
3. `mcp__figma-write__resize_node` — proportionally scale to 120-180px width
4. `mcp__figma-write__move_node` — centre horizontally: `x = (600 - logo_width) / 2`
5. `mcp__figma-write__rename_node` → `Hero_Logo_<BRAND>` or `PreFooter_Logo_<BRAND>`

### Placement Rules

| Logo Variant | Typical Placement | Notes |
|-------------|-------------------|-------|
| White logo | Hero section (over dark gradient) | Place above hero gradient overlay in z-order. Best for dark hero backgrounds. |
| Brand colour logo | Hero (if hero is not too dark) or pre-footer | Gold/sage/green on light background. Use when hero gradient allows visibility. |

- Logo width: typically 120-180px, centred horizontally
- Maintain original aspect ratio — NEVER distort
- Logo must be ABOVE the hero gradient in z-order (`mcp__figma-write__reorder_node` to front)

### Choosing the Right Variant

- **Dark hero gradient (opacity > 50%):** Use white logo
- **Light/medium hero gradient (opacity < 50%):** Brand colour logo may work — export and verify contrast
- **When unsure:** White logo is always safe over a gradient

## 3.5.3 Verify

`mcp__figma-write__export_node_as_image` at 0.5x → confirm:
- Logo is the **real vector mark** (type verified in 3.5.1 — this is a visual double-check)
- Logo is visible and not clipped
- Logo is readable over its background (contrast check)
- Logo is centred horizontally (within 10px of true centre)
- No distortion (aspect ratio preserved)
- If the logo appears invisible or barely visible, try the other variant (white ↔ brand colour)
