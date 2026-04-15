# Phase 7: Fixed Footer

## 7.1 Clone Footer

Clone from Row 5 — **NEVER modify internals:**

| Brand | Footer ID | Height |
|-------|-----------|--------|
| Spa | `4491:802` | ~2016px |
| Aesthetics | `4491:803` | ~1682px |
| Slimming | `4492:66` | ~1921px |

## 7.2 Place Footer

1. `mcp__figma-write__clone_node(nodeId: "<footer_id>")`
2. `mcp__figma-write__insert_child(parentId: "<production_frame_id>", childId: "<cloned_id>")`
3. `mcp__figma-write__move_node(nodeId: "<cloned_id>", x: 0, y: <bottom_of_content>)`
4. `mcp__figma-write__rename_node` → `Fixed_Footer_<BRAND>`

Footer is **UNTOUCHABLE**. Drop in as-is. No edits.

## 7.3 Footer Contents Reference (for QC verification)

The footer is cloned as-is and NEVER modified. But after cloning, verify the footer contains its expected elements by running `get_node_info` on the cloned footer and checking `children`. This catches rare clone failures where nested elements are dropped.

### SPA Footer Expected Elements:
1. "#1 MOST REVIEWED SPA IN MALTA" text (Trajan Pro)
2. ★★★★★ gradient-filled star shapes (5 stars)
3. "OVER 3,000+ FIVE-STAR REVIEWS" text (Novecento Wide Book)
4. "THE CARISMA DIFFERENCE" heading (Trajan Pro)
5. Treatment category text (Facials, Massages, Turkish Hammam, Packages...)
6. Venue thumbnail grid (image frames)
7. "FOLLOW US AT @CARISMASPAMALTA" text
8. Carisma Spa & Wellness logo (vector frame)
9. Unsubscribe / Manage Preferences / View in Browser links
10. "Explore" in Italianno (Designed emailers only)

### AES Footer Expected Elements:
1. "REAL RESULTS" heading + ★★★★★ gold stars
2. Before/After photo thumbnails (2-4 images, 130×160px, 8px radius)
3. "THE CARISMA DIFFERENCE" + 3 circular photos (70×70px)
4. "#1 Voted Med-Aesthetics Clinic in Malta" text
5. "FOLLOW US ON @CARISMAAESTHETICS" text
6. "CARISMA AESTHETICS" + "Glow with Confidence" text
7. Unsubscribe / Manage Preferences / View in Browser links

### SLIM Footer Expected Elements:
1. "THE CARISMA DIFFERENCE" heading with credentials text (35+ Years | Medically Qualified | World Famous Devices | #1 Reviewed)
2. 4 trust circles (56×56px, `#e8f0ed` fill) — verify count = 4
3. **"EXPLORE CARISMA SLIMMING" navigation section** with stacked pill buttons:
   - Weight Loss | Body Sculpting | Skin Tightening | GLP-1
   - Pill specs: `#c4d6c7` background, 22px corner radius
   - These are the "nav pills" referenced in SKILL.md Brand Quick Reference
4. "AS SEEN ON" media strip (Times of Malta, TVM, Lovin Malta, Malta Today logos)
5. Dark green footer block (`#4a6b59`):
   - Social handle: @carismaslimming
   - 3 lifestyle photos
   - Carisma Slimming logo (vector)
6. Unsubscribe / Manage Preferences / View in Browser links

### Quick Verification After Clone:
1. `get_node_info` on cloned footer → count top-level `children`
   - SPA: expect ≥8 children
   - AES: expect ≥6 children
   - SLIM: expect ≥5 children (some sections are grouped)
2. If children count is suspiciously low (e.g., 0-2), the clone may have failed → re-clone from source
3. `export_node_as_image` at 0.25x → quick visual sanity check that the footer rendered correctly
