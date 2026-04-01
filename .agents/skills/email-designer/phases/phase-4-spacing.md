# Phase 4: Spacing & Overlap Detection

**Prerequisite:** Phase 3.5 — Logo Cloning
**References:** golden-rules.md (rules 9, 14), brands/<brand>.md § Grid Node IDs
**Next:** Phase 5 — Images

---

## 4.1 Visual Audit

`mcp__figma-write__export_node_as_image` at 0.5x scale → inspect the current state.

## 4.2 Fix Spacing

- **Dead zones:** any gap >80px between content blocks = close it
- **Cramped areas:** maintain 20-30px breathing room minimum
- **Negative space:** remove unnecessary gaps that don't serve the design
- If a section BG was budgeted larger than content needs:
  1. `mcp__figma-write__resize_node` on BG rectangle to tighten
  2. Recalculate ALL Y positions below: `mcp__figma-write__move_node` on each element
- No orphaned whitespace between last content section and footer zone

## 4.3 Overlap Detection (v4.2 — MANDATORY)

**Why:** Elements can visually collide when positioned too close, especially in the hero section. The most common offender: hero headline -> subheadline -> CTA button stacking with overlapping bounding boxes.

### How to Check

1. Get all TEXT and RECTANGLE children of the production frame with positions + sizes
2. For elements in the same vertical zone (within 200px Y range), check bounding boxes:
   ```
   overlap = (A.y + A.height > B.y) AND (B.y + B.height > A.y) AND
             (A.x + A.width > B.x) AND (B.x + B.width > A.x)
   ```
3. **Critical overlaps (must fix):**
   - Text overlapping other text
   - Text overlapping CTA button
   - CTA button overlapping another CTA
4. **Acceptable overlaps (ignore):**
   - Gradient overlay on hero image (by design)
   - Decorative elements slightly overlapping edges (by design)

### Hero Section Stack Order (Most Common Issue)

Verify this vertical sequence with minimum gaps:
```
Logo (y=15-20)
  | ~150px gap (hero image fills this)
Headline (y=~200-220)
  | min 10px gap
Subheadline (y=headline_y + headline_height + 10)
  | min 10px gap
CTA Button (y=subheadline_y + subheadline_height + 10)
```

If CTA overlaps subheadline:
1. Move headline UP (reduce y by 20-30px)
2. Recalculate subheadline position
3. Recalculate CTA position
4. Verify the whole stack fits within the hero image area

### Pre-Footer Stack (Second Most Common)

Verify: last content element -> trust text -> CTA -> footer transition
- Each needs 10-20px gap
- No dead zone > 30px between trust claim and CTA
- Footer wave/edge should be <= 20px from the last CTA

## 4.4 Note

Frame height final resize happens in Phase 10 after all elements are placed. This phase focuses on closing dead zones, tightening gaps, and preventing overlaps in existing content.
