# Email Designer — Golden Rules

These 14 rules are **non-negotiable**. They override any other instruction. Violating any rule produces a defective emailer.

---

> **1. NEVER generate copy for Designed emailers.** Row 6 wireframes contain finalized, approved copy. Extract it. Use it verbatim. If you catch yourself writing a headline or CTA from scratch for a Designed emailer, STOP.

> **2. 600px width is SACRED.** Never change it. Height is flexible.

> **3. Fixed Footer is UNTOUCHABLE.** Clone from Row 5 (see `brands/<brand>.md` § Grid Node IDs), drop at bottom. Never modify internals.

> **4. No persona sign-offs in Designed emailers.** "Peacefully, Sarah" / "With you every step, Katya" is for Text-Based only.

> **5. Section dividers: waves or clean transitions.** If the brand has working wave SVGs in the grid, use them. If waves look wrong or don't match the design, remove them entirely and use clean background-color transitions instead. **Never use straight lines.** When in doubt, skip dividers — a clean gap is better than a broken wave. **QC note:** If you intentionally skip waves, record `WAVES_SKIPPED` in the state file — QC Check 6 will score based on clean BG transitions instead of wave count.

> **6. Save state after every phase.** Write/update `.tmp/emails/<brand>-emailers/FIGMA-FINISH-PROMPT.md` so work survives context limits. See `resume-state-format.md` for the template.

> **7. load_font_async BEFORE set_font_name.** Always. Or text renders in default fonts.

> **8. Check image dimensions AND relevance BEFORE placing.** Always `get_image_from_node` → verify source resolution (hero must be ≥1200px wide for retina) → verify aspect ratio → choose correct scaleMode → `apply_image_transform` to center. **Export and visually verify** that the image actually matches its label/section context (e.g., a "Neck & Shoulders" section must show neck/shoulder area, not feet).

> **9. ALL created elements MUST be children of the production frame.** After creating any element (`create_frame`, `create_text`, `create_rectangle`, etc.), ALWAYS use `mcp__figma-write__insert_child` to parent it inside the Row 7 production frame. Elements created without `insert_child` float at page level and won't appear in the grid. Clone operations (`clone_node`) also produce page-level nodes — insert them immediately.

> **10. Row 6 is TEXT ONLY — and always do BOTH emailers.** Each brand has 2 separate frames in Row 6 (see `brands/<brand>.md` § Grid Node IDs). When placing copy, update BOTH frames using `set_text_content` on existing text nodes. NEVER clone frames, images, or wireframe structures into Row 6. NEVER modify only one emailer and skip the other.

> **11. Logos must be REAL vector logos, never text placeholders.** Clone the actual logo frame from Row 1 (see `brands/<brand>.md` § Grid Node IDs). A text node styled as "CARISMA SPA & WELLNESS" in Montserrat is NOT a logo — it's a placeholder. The logo is a vector/frame with the brand's rose/leaf mark. Verify node type is FRAME or GROUP, not TEXT.

> **12. Images must match their context.** Every image placed next to a label must depict what the label describes. Export each image after placing it and visually confirm the subject matches. A testimonial quote from "Maria T." (female) cannot have a photo of a man. Circle images labelled "Neck & Shoulders" must show the neck/shoulder area.

> **13. Decorative elements need variety and intent.** Never use a single element type at a uniform size. Use 3-4 variants with a size range of at least 2x (smallest to largest). Place strategically at section transitions, not randomly. Add secondary accent types (gold dividers, thin rules) beyond the primary decorative motif. If it looks like clip art was scattered randomly, redo it.

> **14. NEVER create new frames for Row 6 or Row 7 — and verify grid position.** The grid has pre-existing frames for every brand column in Row 6 and Row 7. Their IDs are in `brands/<brand>.md` § Grid Node IDs. You MUST: (a) build inside these existing frames, never `create_frame` a new parent; (b) run **Phase 0.25** to discover the grid structure and verify each frame is at the correct position with the correct parent. A frame with the right ID at the wrong position is INVISIBLE — the grid cell appears empty even though the frame has content. **Two checks required:** correct frame ID AND correct grid position (parent + x,y coordinates).
