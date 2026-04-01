**Prerequisite:** Phase 9.5 — Icon Style Matching & Generation (phase-9.5-icons.md)
**References:** golden-rules.md (rules 5, 6, 9), brands/<brand>.md § Decorative Elements, § Color Palette
**Next:** Phase 11 — QC Scoring (phase-11-quality-scoring.md)

---

# Phase 10: Z-Order Verification

## 10.1 Check Layer Order

`mcp__figma-write__get_node_info` on the production frame. Inspect the `children` array.

Correct stacking order (first = bottom, last = top):

```
1. Hero_BG (bottom — renders first)
2. Section background rectangles
3. Hero_Gradient_Overlay
4. Wave dividers (if present — waves are optional in v4.2)
5. Images (section images, circular crops, testimonial images)
6. Text elements (headings, body, labels)
7. CTA buttons + CTA text
8. Decorative elements (petals, badges, shapes, accent dividers)
9. Icons or numbered text (from Phase 9.5)
10. Logo (hero logo should be frontmost in hero area)
11. Fixed_Footer (top/last — renders last)
```

**SLIM note:** The pre-header bar should be at layer position 0 (bottom of stack, below body BG). Specifically: `PreHeader_Bar_BG` at the very bottom index, with `PreHeader_Bar_Text` at layer 6 (text layer) like other text elements. This ensures the pre-header bar background renders behind everything but its text is still visible.

## 10.2 Detect & Fix Misorders

### Step 1: Classify Every Child

`get_node_info` on production frame → get the `children` array (ordered bottom-to-top: index 0 = bottommost, last = topmost).

Classify each child into one of the 11 canonical layers based on its name and type:

| Layer | Priority (1=bottom) | Name Patterns | Node Types |
|-------|---------------------|---------------|------------|
| 1. Hero BG | 1 | `Hero_BG*`, `Hero_Image*` | RECTANGLE, FRAME (with image fill) |
| 2. Section BGs | 2 | `Section_BG*`, `*_Background*`, unnamed RECTANGLEs at 600px wide | RECTANGLE |
| 3. Hero Gradient | 3 | `Hero_Gradient*`, `*Gradient_Overlay*` | RECTANGLE (gradient fill) |
| 4. Wave Dividers | 4 | `Wave_*`, `*_Wave*`, `*Divider*` | FRAME, GROUP, VECTOR |
| 5. Images | 5 | `*_Image*`, `*_Photo*`, `Circle_*`, nodes with image fills | RECTANGLE, ELLIPSE, FRAME |
| 6. Text | 6 | `*_Heading*`, `*_Body*`, `*_Label*`, `*_Text*`, `Testimonial_Quote*` | TEXT |
| 7. CTA Buttons | 7 | `CTA_*`, `*_Button*` (both the rectangle AND its text label) | RECTANGLE + TEXT pairs |
| 8. Decoratives | 8 | `Petal_*`, `*_Accent*`, `*_Gold*`, `*_Divider_Rule*` (non-wave) | Various |
| 9. Icons | 9 | `Icon_*`, `Num_*` | FRAME, TEXT (numbered fallback) |
| 10. Logo | 10 | `*Logo*`, `*logo*` | FRAME, GROUP |
| 11. Footer | 11 (top) | `Fixed_Footer_*` | FRAME, GROUP |

**If a node doesn't match any pattern:** classify by type — TEXT nodes default to layer 6, full-width RECTANGLEs to layer 2 (section BG), FRAME with image fill to layer 5, small RECTANGLEs near CTAs to layer 7.

**Pre-header bar (SLIM only):** `PreHeader_Bar_BG` → layer 2 (BG), `PreHeader_Bar_Text` → layer 6 (text). Both must be at y=0 (topmost visually, but z-order layered like other BG/text). The pre-header bar BG should be at layer position 0 (bottom of stack, below body BG) to ensure correct rendering order.

### Step 2: Detect Violations

Walk the children array and check that no element of layer N appears ABOVE (higher index) an element of layer N+K where K is negative — i.e., lower-priority elements should never be above higher-priority elements:

```
for i in range(len(children)):
    for j in range(i+1, len(children)):
        if layer(children[j]) < layer(children[i]):
            # children[j] is ABOVE children[i] in z-order
            # but has a LOWER layer priority → VIOLATION
            violations.append((children[j], children[i]))
```

**Exception — elements within the SAME layer:** ordering within a layer follows Y position (topmost in layout = lowest in z-order within that layer). Don't flag same-layer ordering as a violation.

### Step 3: Fix Violations (Bottom-Up)

Fix from LOWEST layer to HIGHEST to minimize cascading index shifts:

1. Find all Layer 1 elements → `reorder_node` to indices 0, 1, ... (bottom of stack)
2. Find all Layer 2 elements → `reorder_node` just above Layer 1 elements
3. Continue through Layer 11 (Footer = last/topmost)

For each reorder:
```
mcp__figma-write__reorder_node(
  nodeId: "<element>",
  parentId: "<production_frame>",
  index: <target_index>
)
```

**CRITICAL: After EACH `reorder_node` call, re-read the children array.** The reorder shifts indices of all subsequent elements. Never assume previous indices are still valid.

### Step 4: Verify

After all reorders, re-read children array and re-classify. Verify:
- ALL Layer 1 elements at lowest indices
- ALL Layer 11 elements at highest indices
- No element of layer N appears above any element of layer N+1

If violations remain after one pass → run Steps 2-3 again (**maximum 2 passes**). If still wrong after 2 passes, log remaining violations and flag for manual review.

### Critical Misorder Traps (Check Explicitly):

These specific misorders cause VISIBLE problems and must be caught even if the general algorithm passes:

| Misorder | Symptom | How to Detect |
|----------|---------|---------------|
| Section BG above its text | Text invisible | TEXT node at lower index than RECTANGLE in same Y range |
| Gradient above hero text | Hero headline/CTA hidden | `Hero_Gradient*` at higher index than hero TEXT/CTA nodes |
| Wave behind section BG | Wave invisible | `Wave_*` at lower index than adjacent `Section_BG*` |
| Icons behind section BG | Icons invisible | `Icon_*`/`Num_*` at lower index than nearest `Section_BG*` |
| Logo behind gradient | Logo invisible | `*Logo*` at lower index than `Hero_Gradient*` |
| Footer not last | Footer partially covered | `Fixed_Footer_*` is not the highest-index element |
| CTA text behind CTA rect | CTA text invisible | CTA TEXT node at lower index than its CTA RECTANGLE |

## 10.3 Visual Confirmation

`mcp__figma-write__export_node_as_image` at 0.25x scale. If any element appears missing, check z-order FIRST before assuming it was deleted.

## 10.4 Final Frame Resize

1. Find the bottommost element (usually footer bottom)
2. `mcp__figma-write__resize_node` → height = that element's Y + height
3. Width = 600px (**SACRED**)
