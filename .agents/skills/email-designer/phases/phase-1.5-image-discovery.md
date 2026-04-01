# Phase 1.5: Image Bank Discovery & Matching

**Prerequisite:** phase-1-extract-copy.md (Phase 1.3 scaffold complete)
**References:** golden-rules.md (rules 8, 12), brands/<brand>.md (Grid Node IDs)
**Next:** phase-1.6-copy-validation.md

---

**Runs immediately after Phase 1.3 (Scaffold Production), BEFORE Phase 2 (Text Hierarchy).** This phase discovers and assigns all images BEFORE design work begins, so the scaffold can include proper image placeholders with correct dimensions. Skipping this phase and doing image work at Step 9 will force expensive rework.

## 1.5.1 Enumerate Image Bank (Row 3)

1. `mcp__figma-write__get_node_info` on Row 3 Image Bank frame for current brand column
   - If Row 3 frame IDs are unknown, use `get_document_info` to find top-level frames, then inspect children to locate Image Bank row
   - Navigate to the brand's column (SPA | AES | SLIM)
2. Traverse `children` array -- catalog every image frame.
   - For each image: `get_image_from_node` to get **source dimensions** (the actual pixel resolution, not just the display size)
   - This is critical: a 346x228 display rectangle might have a 2048x1365 source image (high-res) or a 346x228 source (low-res)

| Name | Node ID | Display Size | Source Size | Keywords | Assigned To |
|------|---------|-------------|-------------|----------|-------------|
| [frame name] | [id] | [WxH display] | [WxH source] | [from name] | [pending] |

3. Extract keywords from frame names:
   - Split by underscore/hyphen/space
   - e.g., `spa_pool_lifestyle` -> keywords: pool, lifestyle
   - e.g., `coolsculpting_treatment_closeup` -> keywords: coolsculpting, treatment, closeup
   - e.g., `hero_mediterranean_sunset` -> keywords: hero, mediterranean, sunset
   - **Classify each name as DESCRIPTIVE or GENERIC:**
     - DESCRIPTIVE: contains recognizable nouns (pool, massage, face, treatment, hero, etc.)
     - GENERIC: matches patterns like `Day[N]-[N]`, `IMG_[N]`, `Rectangle [N]`, `Screenshot [date]`, `Frame [N]`, or is a single number
     - Log the classification in the inventory table

4. **Fallback for GENERIC names** (when keyword extraction yields no meaningful terms):
   a. **Visual identification (preferred):** Export each generic-named image at 0.5x scale using `export_node_as_image`. Visually inspect the content and assign descriptive keywords manually:
      - What body area/treatment is shown? (face, neck, back, legs, abdomen)
      - What setting? (spa, clinic, pool, treatment room, outdoor)
      - What activity? (massage, treatment, relaxation, consultation, before-after)
   b. Update the inventory table with your visual keywords in the Keywords column, prefixed with `[visual]` to indicate they were manually assigned:
      - e.g., `Day1-87` -> Keywords: `[visual] woman, facial, treatment, close-up`
   c. **Position-based heuristic:** If the Image Bank is organized spatially (top-to-bottom or left-to-right by theme), note the position grouping:
      - Images clustered together likely share a theme
      - The first/largest image in a group is often the hero candidate
   d. If an image is ambiguous even after visual inspection, mark Keywords as `[unclear]` -- it will be deprioritized in matching but kept as a last-resort option

## 1.5.2 Match Images to Copy Manifest

For each Copy Manifest section (from Phase 1):
1. Extract key nouns from section heading + body text
   - e.g., "WHY DIETS TRAINED YOUR BODY TO HOLD ONTO FAT" -> diets, body, fat, metabolism
   - e.g., "CoolSculpting Starter Pack" -> coolsculpting, starter, treatment
2. Score each Image Bank entry by keyword overlap (count matching keywords)
3. **Export top candidates** (2-3 per section) at 0.5x scale and visually confirm the subject matches the section content. Do NOT rely solely on keyword matching -- image names are often generic.
   - If all candidates have `[visual]` or `[unclear]` keywords, export ALL remaining unassigned images and visually pick the best match
   - Prioritize images already verified with `[visual]` keywords over unverified `[unclear]` ones
   - If zero images match a section even after visual review -> mark as UNMATCHED for Nano Banana (Phase 5.5)
4. Assign best match with resolution priority:
   - **Hero** -> highest-scoring image with landscape orientation AND source width >= 1200px (retina). If no image meets retina threshold, pick the largest available source.
   - **Note:** >=1200px width is the selection floor. Phase 5 also checks retina ratio using min(width, height) -- both checks must pass.
   - **Section images** -> best contextual match per section. Source should be >= 2x display size.
   - **Circular crops** -> source should be >= 240px in smallest dimension (2x for 120px circles)
   - If multiple sections match the same image, prioritize hero > first section > later sections
   - **Never assign the same image to two different sections** (except logo)
5. Mark unmatched sections -> flag for **Nano Banana generation (Phase 5.5)**

## 1.5.3 Source Priority Hierarchy

When multiple image sources are available, prefer in this order:
1. **Image Bank (Row 3)** -- purpose-built, brand-consistent, pre-approved
2. **Wireframe hero image** -- already in the wireframe, contextually accurate
3. **Footer frame children** -- collage photos from brand footer
4. **Nano Banana generation** -- AI-generated, brand-styled (Phase 5.5)
5. **Ask the user** -- last resort, when nothing matches

## 1.5.4 Save Image Inventory

Append to `.tmp/emails/<brand>-emailers/FIGMA-FINISH-PROMPT.md`:

```
## IMAGE INVENTORY
Source: Row 3 Image Bank -- [Brand] column
Enumerated: [date]

### Available Images
| # | Name | Node ID | Display | Source | Keywords | Verified |
|---|------|---------|---------|--------|----------|----------|
| 1 | [name] | [id] | [WxH] | [WxH] | [keywords] | [yes/no -- visually confirmed subject] |
| 2 | [name] | [id] | [WxH] | [WxH] | [keywords] | [yes/no] |

### Assignments
| Section | Matched Image | Node ID | Source Size | Retina? | Semantic Match | Status |
|---------|---------------|---------|-------------|---------|----------------|--------|
| Hero | [name] | [id] | [WxH] | [2x/1x/NO] | [confirmed/pending] | matched |
| Section 1 | -- | -- | -- | -- | -- | UNMATCHED -> Nano Banana |
| Circle: Neck | [name] | [id] | [WxH] | [2x/1x] | [confirmed: shows neck area] | matched |
```
