# Phase 0: Connect & Orient

## 0.1 Load Figma MCP Tools

Use `ToolSearch` to batch-load these tool groups:

**Essential (load first):**
- `mcp__figma-write__join_channel`
- `mcp__figma-write__get_document_info`
- `mcp__figma-write__get_node_info`
- `mcp__figma-write__get_nodes_info`
- `mcp__figma-write__export_node_as_image`

**Building (load when needed):**
- `mcp__figma-write__clone_node`
- `mcp__figma-write__insert_child`
- `mcp__figma-write__move_node`
- `mcp__figma-write__resize_node`
- `mcp__figma-write__rotate_node`
- `mcp__figma-write__reorder_node`
- `mcp__figma-write__set_node_properties`
- `mcp__figma-write__rename_node`

**Styling (load when needed):**
- `mcp__figma-write__create_rectangle`
- `mcp__figma-write__create_text`
- `mcp__figma-write__create_frame`
- `mcp__figma-write__create_ellipse`
- `mcp__figma-write__set_fill_color`
- `mcp__figma-write__set_gradient`
- `mcp__figma-write__set_image`
- `mcp__figma-write__set_image_fill`
- `mcp__figma-write__set_text_content`
- `mcp__figma-write__set_font_name`
- `mcp__figma-write__set_font_size`
- `mcp__figma-write__set_text_align`
- `mcp__figma-write__set_corner_radius`
- `mcp__figma-write__set_effects`
- `mcp__figma-write__load_font_async`

**Image handling (load when needed):**
- `mcp__figma-write__get_image_from_node`
- `mcp__figma-write__replace_image_fill`
- `mcp__figma-write__apply_image_transform`
- `mcp__figma-write__set_image_filters`

**Image generation — Nano Banana (load when needed):**
- `mcp__nano-banana__generate_image`
- `mcp__nano-banana__edit_image`
- `mcp__nano-banana__continue_editing`
- `mcp__nano-banana__get_last_image_info`
- `mcp__nano-banana__get_configuration_status`

## 0.2 Connect & Read

1. `mcp__figma-write__join_channel(channel: "<id>")` — ask user for channel ID if not provided
2. Read these files in parallel:
   - `config/emailer-guidelines.md` — **DEFINITIVE SPEC** (all colors, fonts, node IDs, rules)
   - Brand CLAUDE.md for tone context: `spa/CLAUDE.md` | `aesthetics/CLAUDE.md` | `slimming/CLAUDE.md`

## 0.25 Discover Grid Structure (MANDATORY — run before any building)

The Emailers Workflow grid has specific positions for each cell. Frame IDs in SKILL.md tell you WHICH frame to build in, but you must also confirm WHERE that frame sits in the grid. A frame with the right ID at the wrong position is invisible to the user.

### Step 1: Find the grid root and row structure

1. After joining the channel, get the current page's top-level children
2. Identify the grid root — a large frame containing the Emailers Workflow layout
3. `get_node_info` on the grid root → list ALL direct children with `name`, `id`, `type`, `x`, `y`, `width`, `height`
4. These children are the **grid rows** (Logos, Colours, Image Bank, Elements/Templates, Placeholders, Buttons, Fixed Footer, Topics, Copy+Wireframe, Final Production)
5. **If the grid is flat (no row-level frames):** group cells by y-position to identify Row 6 vs Row 7

### Step 2: Locate Row 6 and Row 7

From the children list, identify:
- **Row 6** — named "Copy + Wireframe" or similar. Record `id`, `y`, `height`.
- **Row 7** — named "Final production - Design" or similar. Must be BELOW Row 6 (higher y). Record `id`, `y`, `height`.

`get_node_info` on each row frame → list children to find the brand cells.

### Step 3: Find the brand's cell positions

For each row (6 and 7), find the cells for the current brand:
1. Each brand has 2 cells (emailer 1 + emailer 2) side by side
2. Record each cell's `id`, `x`, `y`, `width`, `height`, `name`
3. Match cells to the SKILL.md frame IDs — check if cell IDs match, or if the SKILL.md frames are nested one level inside cells

### Step 4: Validate SKILL.md frame positions

For each SKILL.md frame ID (e.g., `4495:2313`):
1. `get_node_info` → get actual `x`, `y`, `absolutePosition` (if available), parent ID
2. **Check parent:** Is it a child of the correct row frame? Or floating at page level?
3. **Check position:** Does its y fall within the Row 7 y range?
4. **If wrong:**
   - At page level → `insert_child` into the correct row/cell frame, then `move_node`
   - Wrong y → `move_node` to correct position
   - Use a VISIBLE emailer (e.g., SPA_Value_01 if it shows in the grid) as reference: same y, offset x

### Step 5: Save Grid Position Map

Record in state file:

```
## Grid Position Map
Grid Root: [id]
Row 6 Row Frame: [id] (y=[y])
Row 7 Row Frame: [id] (y=[y])

| Row | Emailer | Cell/Frame ID | Position (x, y) | Size | Parent | Status |
|-----|---------|---------------|------------------|------|--------|--------|
| 6   | [brand]_01 | [id] | (x, y) | WxH | [parent_id] | verified |
| 6   | [brand]_02 | [id] | (x, y) | WxH | [parent_id] | verified/FIXED |
| 7   | [brand]_01 | [id] | (x, y) | WxH | [parent_id] | verified |
| 7   | [brand]_02 | [id] | (x, y) | WxH | [parent_id] | verified/FIXED |
```

**Do NOT proceed to Phase 0.3 until ALL target frames are confirmed in the correct grid positions.**

---

## 0.3 Orient & Auto-Discover Topics

The user does NOT provide emailer names. You discover them from the Figma grid.

1. Identify brand: **SPA** | **AES** | **SLIM**
2. **Auto-discover topics from the Figma grid:**
   a. Run `mcp__figma-write__get_document_info` → locate the "Emailers Workflow" section
   b. Identify the **Topics row** — this is the row in the grid that contains topic/title frames for each brand column. It sits ABOVE the Copy + Wireframe row (Row 6).
   c. `get_node_info` on the Topics row frame → inspect `children` for the current brand's column
   d. Each topic is typically a **FRAME or TEXT node** with the emailer topic as its name or text content:
      - Frame names like `SPA_Value_01_TensionScience` → topic is "TensionScience" (split on last underscore)
      - Or text nodes containing the full topic title (e.g., "Why Tension Lives In Your Body")
   e. Cross-reference against Row 6 wireframe frame names (from SKILL.md NODE ID REFERENCE):
      - SPA: `4445:527` (SPA_Value_01_TensionScience), `4445:565` (SPA_Value_02_GiftGuide)
      - AES: `4445:600` (AES_Value_01_SkinSignals), `4445:640` (AES_Value_02_FirstTreatment)
      - SLIM: `4445:670` (SLIM_Value_01_DietsHoldFat), `4445:714` (SLIM_Value_02_MenopauseMyth)
   f. **Fallback:** If Topics row is not found or empty, extract topic names from the Row 6 frame names directly (the part after the last underscore in the naming pattern `BRAND_Type_NN_TopicName`)
   g. List all discovered topics back to the user for confirmation before proceeding:
      ```
      Discovered topics for [BRAND]:
      1. [Topic 1] (from [source])
      2. [Topic 2] (from [source])
      Proceed with these? Or adjust?
      ```
3. Determine emailer type for EACH discovered topic: **DESIGNED** (visual-first) or **TEXT-BASED** (content-first)
   - Designed: image-heavy, 6-15 text elements, no sign-off, Trajan/Novecento/Roboto fonts
   - Text-Based: content-heavy, 20-30+ text elements, persona sign-off, Playfair/Cormorant/Montserrat fonts
4. Draft copy appropriate to type (read `config/emailer-guidelines.md` first):
   - **TEXT-BASED** → full copy (greeting "Hi [First Name],", body sections, CTAs, persona sign-off)
   - **DESIGNED** → minimal copy (headline, subheads, labels, CTA text only — less is more)
5. Place drafted copy into the **EXISTING** Copy + Wireframe frames in Row 6:
   > **GOLDEN RULE #14: NEVER create a new frame for Row 6.** The grid already has pre-existing frames. Use these exact IDs:
   > - SPA: `4445:527` (emailer 1) | `4445:565` (emailer 2)
   > - AES: `4445:600` (emailer 1) | `4445:640` (emailer 2)
   > - SLIM: `4445:670` (emailer 1) | `4445:714` (emailer 2)
   - **TEXT ONLY** — no wireframes, no images, no new frames. Do NOT clone wireframe frames or hero images.
   - First, `get_node_info` on the Row 6 frame ID from the table above to find existing text nodes inside it
   - Use `mcp__figma-write__set_text_content` to update each existing text node with the drafted copy
   - If text nodes don't exist yet, `create_text` then `insert_child` into the **existing Row 6 frame** (never leave at page level, never create a new parent frame)
   - **Do ALL emailers** for the brand. Never skip one.
   - **Verify:** After placing copy, run `get_node_info` on the Row 6 frame ID and confirm your text nodes appear in its `children` array.
6. **Sequencing checkpoint — what runs next:**
   - Phase 1 (Extract Copy) → Phase 1.3 (Scaffold Production) → **Phase 1.5 (Image Bank Discovery)** → Phase 1.6 (Copy Validation) → Phase 2 (Text Hierarchy)
   - Image discovery runs BEFORE design work so the scaffold includes proper image placeholders
   - Do NOT skip ahead to Phase 2 without completing 1.5 first

## 0.4 Check for Resume State

If `resume` argument is true, or if `.tmp/emails/<brand>-emailers/FIGMA-FINISH-PROMPT.md` exists:
- Read it. It contains node IDs, what's done, and what's left.
- Skip to the first incomplete phase.
- Don't rebuild what's already built.
- New v4.0 fields (Image Inventory, Quality Score) are additive — if missing from old state files, just run those phases fresh.

## 0.5 Multi-Emailer Batch Strategy

Each brand typically has **2 emailers** (e.g., SPA_Value_01 + SPA_Value_02). Both MUST be built. This section defines the execution order.

### Phase Grouping: Batch Early, Sequential Late

**Batch together (do both emailers in one pass):**
- Phase 0.3: Draft & place copy for BOTH emailers before moving on
- Phase 1: Extract copy manifests for BOTH emailers
- Phase 1.3: Scaffold BOTH production frames
- Phase 1.5: Discover Image Bank ONCE (shared across both emailers)
- Phase 1.6: Validate copy for BOTH emailers

**Sequential (complete one emailer fully, then the other):**
- Phases 2-12: Design, style, and build emailer 1 completely → then emailer 2
- Why: each emailer's design decisions (spacing, image placement, decorative elements) are interdependent within that emailer. Interleaving creates confusion about which frame you're working on.

### Image Bank Coordination

When assigning Image Bank images across 2 emailers:
1. Run Phase 1.5 discovery ONCE for the brand
2. Assign hero image to emailer 1 FIRST (hero gets priority pick)
3. Assign hero image to emailer 2 from remaining unassigned images
4. Then assign section images for emailer 1, then emailer 2
5. **CRITICAL: Never assign the same Image Bank source to both emailers** — each emailer must have unique imagery (logos excepted)
6. If the Image Bank doesn't have enough unique images for both emailers, flag sections for Nano Banana generation

### State File Tracking

The state file at `.tmp/emails/<brand>-emailers/FIGMA-FINISH-PROMPT.md` tracks BOTH emailers. The "Production Frames" table should list both:

```
## Production Frames
| Emailer | Frame ID | Dimensions | Current Phase | Status |
|---------|----------|------------|---------------|--------|
| SPA_Value_01 | 4495:2255 | 600x4500 | Phase 5 | in_progress |
| SPA_Value_02 | 4495:2313 | 600x5200 | Phase 1.6 | waiting |
```

Update `Current Phase` as you progress through each emailer.

### Execution Flow (Summary)

```
1. Discover topics → confirm with user (both emailers)
2. Draft copy for emailer 1 + emailer 2 (batch)
3. Extract copy manifests for both (batch)
4. Scaffold both production frames (batch)
5. Image Bank discovery (once, shared)
6. Copy validation for both (batch)
7. Build emailer 1: Phases 2 → 3 → 3.5 → 4 → 5 → 5.5 → 6 → 7 → 8 → 9 → 9.5 → 10 → 11
8. Build emailer 2: Phases 2 → 3 → 3.5 → 4 → 5 → 5.5 → 6 → 7 → 8 → 9 → 9.5 → 10 → 11
9. Phase 12: Save final state for both
```
