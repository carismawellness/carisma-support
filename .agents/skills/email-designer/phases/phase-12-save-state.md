# Phase 12: Save State

**Prerequisite:** Phase 11 (Quality Scoring)
**References:** `../resume-state-format.md`, `brands/<brand>.md` § Grid Node IDs
**Next:** Phase 17 (HTML Export)

---

## 12.1 Write State File

Write/update `.tmp/emails/<brand>-emailers/FIGMA-FINISH-PROMPT.md` using the template defined in `../resume-state-format.md`.

Include ALL of the following sections:

1. **Connection** -- channel ID
2. **Production frame** -- ID, final dimensions
3. **Complete node map** -- every element: name, node ID, type, position, size, notes
4. **Copy Manifest** -- from Phase 1 (full verbatim copy)
5. **Image Inventory** -- from Phase 1.5 (all Image Bank entries with assignments)
6. **Image assignments** -- element -> source (bank/generated/manual) -> node ID -> status
7. **Icon Inventory** -- from Phase 9.5 (generated icons with style brief, prompts used, placement)
8. **QC checklist** -- all items checked with results
9. **Quality Score Card** -- from Phase 11 (automated scores, /170 total: 160 core + 10 bonus, verdict)
10. **Brand colours reference** -- quick lookup table (copy from `brands/<brand>.md` § Color Palette)
11. **What's done** -- completed phases and items
12. **What's remaining** -- any outstanding work (B/A photos, decorative elements, HTML export, etc.)
13. **Rules reminder** -- 600px sacred, footer untouchable, waves only, no generated copy

This file enables: `/emaildesign <brand> resume`

## 12.2 Backward Compatibility

If resuming from a legacy state file (no Image Inventory, no Quality Score):
- Parse existing sections normally
- Run Phase 1.5, 9.5, 11 fresh (their sections will be missing from old state)
- Append new sections to the file

---

## 12.3 Grid Frame ID + Position Validation (MANDATORY -- run FIRST before anything else)

Before writing the state file, verify TWO things: (1) the production frame ID is correct, and (2) the frame is at the correct grid position. A correct ID at the wrong position is invisible to the user.

### Validation Steps:

**Check 1 -- Frame ID:**
1. Compare your production frame ID against the canonical Row 7 grid IDs from `brands/<brand>.md` § Grid Node IDs → Row 7: Final Production.
2. **If the ID does NOT match -> STOP.** Wrong frame. Move all children into the correct one.

**Check 2 -- Frame Position (catches the "invisible full frame" bug):**
3. `get_node_info` on the production frame -> record `x`, `y`, `parent`
4. **Check parent:** Is the frame a child of the Row 7 grid row frame (from Grid Position Map in Phase 0.25)? If it's at page level or in the wrong row -> `insert_child` into the correct row frame.
5. **Check position:** Compare against the Grid Position Map from Phase 0.25. The frame's y must be in the Row 7 y range (BELOW Row 6). If the frame is above Row 6 or far from the expected position -> `move_node` to the correct coordinates.
6. **Cross-reference with a visible emailer:** If the other emailer for this brand IS visible in the grid, its Row 7 frame position is the reference. Your frame should be at the same y, offset x.

**Check 3 -- Row 6 (same checks):**
7. Same ID + position validation for the Copy + Wireframe frame. Look up Row 6 frame IDs from `brands/<brand>.md` § Grid Node IDs → Row 6: Copy + Wireframe.
8. Record the canonical grid frame ID + its verified position in the state file.

---

## 12.4 Child-Tree Audit (MANDATORY before saving)

After validating the frame ID, verify that EVERY element in the node map is actually a descendant of the production frame. This catches the #2 silent failure mode: elements created but never `insert_child`'d.

### Audit Process:

1. **Get production frame children:**
   ```
   mcp__figma-write__get_node_info(nodeId: "<production_frame>")
   ```
   -> Extract the full `children` array. This returns direct children only.

2. **Build descendant set:**
   For each direct child that is a FRAME or GROUP, recursively get ITS children:
   ```
   mcp__figma-write__get_node_info(nodeId: "<child_frame>")
   ```
   Build a flat set of ALL descendant node IDs (direct children + nested children + deeply nested). Include the production frame's own ID.

3. **Cross-reference node map:**
   For every element tracked in the node map (from Phases 1-11), check if its node ID exists in the descendant set:

   ```
   | Element | Node ID | In Frame? | Action |
   |---------|---------|-----------|--------|
   | Hero_BG | 1234:56 | YES | OK |
   | CTA_Hero | 1234:78 | YES | OK |
   | Petal_3 | 1234:99 | **NO** | ORPHAN -- needs insert_child |
   ```

4. **Fix orphans:**
   For each element NOT in the descendant set:
   a. Verify the node still exists: `get_node_info(nodeId)` -- if 404/not found, it was deleted. Log and skip.
   b. `mcp__figma-write__insert_child(parentId: "<production_frame>", childId: "<orphan_id>")`
   c. `mcp__figma-write__move_node` to its intended position (from node map target x, y)
   d. Re-run Phase 10.2 z-order classification for the reinserted element -- it needs to be at the correct layer
   e. Log: `"ORPHAN FIXED: [element name] was at page level, inserted into production frame"`

5. **Verify count:**
   - Expected: node map tracks N elements
   - Actual: descendant set contains M elements (M >= N due to nested children not individually tracked)
   - If any tracked elements are still missing after fixing orphans -> they were likely deleted during a prior phase. Log warnings with specifics.

### When This Catches Problems:
- Agent created a text node with `create_text` but forgot `insert_child` -> text floating at page level
- Agent cloned a decorative element but forgot `insert_child` -> petal/icon invisible in grid
- Agent created a CTA button rectangle but forgot `insert_child` -> CTA missing from design
- Agent cloned the footer but forgot `insert_child` -> footer at page level, not in emailer

### State File Addition:
Add an audit summary section to the state file:
```
## Child-Tree Audit
Audit date: [ISO timestamp]
Production frame: [ID]
Total tracked elements: [N]
Descendants found: [M]
Orphans fixed: [count] -- [list element names if any]
Missing elements: [count] -- [list element names if any]
Status: PASS | FIXED | WARNING
```
