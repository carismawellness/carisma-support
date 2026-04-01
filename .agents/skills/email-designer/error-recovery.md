# Email Designer — Error Recovery

Error → solution lookup table. When you encounter a problem during any phase, find the matching error pattern below.

---

| Problem | Solution |
|---------|----------|
| **Node not found** | Figma page may not be loaded. Run `get_document_info` first to trigger load. |
| **Insert fails** | Clone to page level first, THEN `insert_child` into target frame. |
| **Design outside grid** | Element was created but never `insert_child`'d into Row 7 frame. Every create/clone MUST be followed by `insert_child`. See Golden Rule #9. |
| **Built in wrong frame** | You created a NEW frame instead of using the pre-existing grid frame. The grid's Row 6 and Row 7 frames have fixed IDs (see `brands/<brand>.md` § Grid Node IDs). Delete your new frame and rebuild inside the correct one. **Telltale sign:** state file has a frame ID that doesn't match any Row 6/7 ID in the brand config. |
| **Frame has content but grid cell is empty** | The frame ID is correct but the frame is at the WRONG POSITION or has the wrong parent. Run Phase 0.25 to discover the grid structure. Check the frame's parent (should be the Row 7 grid row frame, not page level) and position (y must be in Row 7's y range, BELOW Row 6). Use a visible emailer's position as reference. Fix with `insert_child` + `move_node`. |
| **Copy row has images** | Used `clone_node` instead of `set_text_content`. Row 6 is TEXT ONLY — update existing text nodes, never clone wireframes/images. See Golden Rule #10. |
| **Image not showing** | Source node must have IMAGE fill type. Check with `get_node_info`. |
| **Text font not loading** | Use `load_font_async` BEFORE `set_font_name`. Always. See Golden Rule #7. |
| **Frame clipping** | All child positions must be within 0-600 (x) and 0-frameHeight (y). |
| **Element invisible** | Check z-order — probably behind a background rectangle. Use `reorder_node`. |
| **Context window running out** | Save state to FIGMA-FINISH-PROMPT.md immediately using the format in `resume-state-format.md`. Resume with `/emaildesign <brand> resume`. |
| **Wave looks wrong** | Waves are OPTIONAL. If wave SVGs don't match the design, delete them all and use clean BG transitions. Don't force broken waves. Record `WAVES_SKIPPED` in state. See Golden Rule #5. |
| **Image distorted** | Source aspect ratio doesn't match target. `get_image_from_node` → check dimensions → `apply_image_transform` to adjust. |
| **Image not filling frame** | scaleMode is FIT instead of FILL. `apply_image_transform(scaleMode: "FILL")` |
| **Image doesn't match label** | Export image, visually confirm subject. If mismatch (e.g. foot photo for "Neck" label), find correct image from Image Bank. Always verify AFTER placement. See Golden Rule #12. |
| **Hero image pixelated** | Source too small. Hero needs ≥1200px wide source for 600px retina display. Re-pick from Image Bank — look for the largest source image. |
| **Logo is text placeholder** | Delete the TEXT node. Clone the real vector logo from Row 1 (see `brands/<brand>.md` § Grid Node IDs). The logo is a FRAME with vectors, never plain text. See Golden Rule #11. |
| **Testimonial image wrong gender** | Export image, verify it matches the testimonial name. Maria/Sarah = female photo. If wrong, swap from Image Bank. |
| **Icon style mismatch** | Export existing brand icons first, use as `referenceImages` in `edit_image`. |
| **Nano Banana failed** | **Numbered text fallback.** Create numbered text ("1", "2", "3") in the brand's accent color, Montserrat SemiBold 20px. These are clean and professional. Don't leave sections without visual anchors. See `phases/phase-9.5-icons.md` for details. |
| **Generated image too large** | `set_image` max ~5MB. Use `continue_editing` to simplify, or resize after placement. |
| **Elements overlap** | Check bounding boxes: if A.y + A.height > B.y for elements in the same section, move them apart. Most common: hero CTA overlapping subheadline. See `phases/phase-4-spacing.md`. |
| **Decoratives look amateur** | Need variety: 3-4 types, 2x size range, strategic placement at section transitions. Add secondary accents beyond the primary motif. See Golden Rule #13. |

---

## General Recovery Strategy

1. **Identify** — Read the full error message
2. **Match** — Find the error pattern in the table above
3. **Fix** — Apply the solution
4. **Verify** — Export and visually confirm the fix worked
5. **Document** — If this is a new error pattern, add it to this file
6. **Save state** — Update FIGMA-FINISH-PROMPT.md after fixing
