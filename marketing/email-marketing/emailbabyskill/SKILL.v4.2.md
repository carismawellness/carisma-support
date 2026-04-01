---
name: emailbaby
description: "Build production-ready emailers in Figma for Carisma Wellness brands. Auto-discovers topics from Figma grid. 16-phase pipeline with image bank discovery, semantic image matching, resolution verification, AI image generation (Nano Banana), icon generation with numbered fallback, decorative variety scoring, overlap detection, automated quality scoring (/170), and Figma-to-HTML export. Slash command: /emailbaby <brand> [resume]"
version: "4.2.0"
user-invocable: true
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Task, ToolSearch
argument-hint: "<brand> [resume]"
metadata:
  author: Carisma
  tags:
    - figma
    - emailer
    - design
    - production
    - nano-banana
    - html-export
  triggers:
    - "emailbaby"
    - "build emailer"
    - "figma emailer"
    - "email production"
    - "design emailer"
---

# Emailbaby v4.2 — Production Emailer Builder

You build production-ready emailers in Figma for **Carisma Wellness Group** (Malta). Three brands: Spa, Aesthetics, Slimming. Two emailer types: Designed (visual-first) and Text-Based (content-first).

Battle-tested across 5+ emailers. v4.2 adds semantic image matching, resolution verification, overlap detection, decorative variety enforcement, numbered icon fallback, optional waves, and expanded 16-check QC scoring (/170).

---

## THE GOLDEN RULES

> **1. NEVER generate copy for Designed emailers.** Row 6 wireframes contain finalized, approved copy. Extract it. Use it verbatim. If you catch yourself writing a headline or CTA from scratch for a Designed emailer, STOP.

> **2. 600px width is SACRED.** Never change it. Height is flexible.

> **3. Fixed Footer is UNTOUCHABLE.** Clone from Row 5, drop at bottom. Never modify internals.

> **4. No persona sign-offs in Designed emailers.** "Peacefully, Sarah" etc. is for Text-Based only.

> **5. Section dividers: waves or clean transitions.** If the brand has working wave SVGs in the grid, use them. If waves look wrong or don't match the design, remove them entirely and use clean background-color transitions instead. **Never use straight lines.** When in doubt, skip dividers — a clean gap is better than a broken wave. **QC note:** If you intentionally skip waves, record "WAVES_SKIPPED" in the state file — Check 6 will score based on clean BG transitions instead of wave count.

> **6. Save state after every phase.** Write/update `.tmp/emails/<brand>-emailers/FIGMA-FINISH-PROMPT.md` so work survives context limits.

> **7. load_font_async BEFORE set_font_name.** Always. Or text renders in default fonts.

> **8. Check image dimensions AND relevance BEFORE placing.** Always `get_image_from_node` → verify source resolution (hero must be ≥1200px wide for retina) → verify aspect ratio → choose correct scaleMode → `apply_image_transform` to center. **Export and visually verify** that the image actually matches its label/section context (e.g., a "Neck & Shoulders" section must show neck/shoulder area, not feet).

> **9. ALL created elements MUST be children of the production frame.** After creating any element (`create_frame`, `create_text`, `create_rectangle`, etc.), ALWAYS use `mcp__figma-write__insert_child` to parent it inside the Row 7 production frame. Elements created without `insert_child` float at page level and won't appear in the grid. Clone operations (`clone_node`) also produce page-level nodes — insert them immediately.

> **10. Row 6 is TEXT ONLY — and always do BOTH emailers.** Each brand has 2 separate frames in Row 6 (e.g., SPA_Value_01 + SPA_Value_02). When placing copy, update BOTH frames using `set_text_content` on existing text nodes. NEVER clone frames, images, or wireframe structures into Row 6. NEVER modify only one emailer and skip the other.

> **11. Logos must be REAL vector logos, never text placeholders.** Clone the actual logo frame from Row 1 (Logos row). A text node styled as "CARISMA SPA & WELLNESS" in Montserrat is NOT a logo — it's a placeholder. The logo is a vector/frame with the brand's rose/leaf mark. Verify node type is FRAME or GROUP, not TEXT.

> **12. Images must match their context.** Every image placed next to a label must depict what the label describes. Export each image after placing it and visually confirm the subject matches. A testimonial quote from "Maria T." (female) cannot have a photo of a man. Circle images labelled "Neck & Shoulders" must show the neck/shoulder area.

> **13. Decorative elements need variety and intent.** Never use a single element type at a uniform size. Use 3-4 variants with a size range of at least 2x (smallest to largest). Place strategically at section transitions, not randomly. Add secondary accent types (gold dividers, thin rules) beyond the primary decorative motif. If it looks like clip art was scattered randomly, redo it.

> **14. NEVER create new frames for Row 6 or Row 7 — and verify grid position.** The grid has pre-existing frames for every brand column in Row 6 and Row 7. Their IDs are in the NODE ID REFERENCE below. You MUST: (a) build inside these existing frames, never `create_frame` a new parent; (b) run **Phase 0.25** to discover the grid structure and verify each frame is at the correct position with the correct parent. A frame with the right ID at the wrong position is INVISIBLE — the grid cell appears empty even though the frame has content. **Two checks required:** correct frame ID AND correct grid position (parent + x,y coordinates).

---

## PHASE PIPELINE

**When you reach each phase, you MUST Read the phase file for detailed instructions before executing.**

| Step | Phase | Summary | File |
|------|-------|---------|------|
| 1 | Connect & Orient | Load MCP, join Figma, **auto-discover topics from Topics row** | `phases/phase-0-connect.md` |
| 1.5 | **Grid Discovery** | **Discover grid structure, verify Row 6/7 frame positions + parents. MANDATORY before building.** | `phases/phase-0-connect.md` (0.25) |
| 2 | Draft & Place Copy | Draft copy per type, place **TEXT ONLY** in Copy + Wireframe row (Row 6) | `phases/phase-0-connect.md` (0.3) |
| 3 | Extract Copy | Build Copy Manifest from Row 6 wireframe | `phases/phase-1-extract-copy.md` |
| 4 | Scaffold Production | Wireframe + placeholders + copy into Final Production - Design (Row 7). **Uses Grid Position Map from 0.25.** | `phases/phase-1-extract-copy.md` (1.3) |
| 5 | Text Hierarchy | Fonts, sizes, centre alignment, colors | `phases/phase-2-text-hierarchy.md` |
| 6 | CTA Buttons | Build brand-spec CTAs from Buttons row (Hero + middle + before footer) | `phases/phase-3-cta-buttons.md` |
| 7 | Logos | Clone **real vector logos** from Row 1. Verify node type is FRAME/GROUP, never TEXT. | `phases/phase-3.5-logos.md` |
| 8 | Spacing & Overlap | Close dead zones, tighten gaps, **detect element overlaps** (hero CTA vs subheadline etc.) | `phases/phase-4-spacing.md` |
| 9 | Images | Discover → **semantic match** → **resolution verify** → clone → place. Export & confirm each image matches its label. Fallback: Nano Banana | `phases/phase-5-images.md` + `phases/phase-1.5-image-discovery.md` + `phases/phase-5.5-nano-banana.md` |
| 10 | Colours | Apply brand gradients + 3 solids from Colours row. Strategise placement. **SLIM: add steel blue pre-header bar.** | `phases/phase-6-colours.md` |
| 11 | Footer | Clone/duplicate fixed footer from Row 5 | `phases/phase-7-footer.md` |
| 12 | Dividers | **Optional:** Clone wave dividers IF they work for this design. If waves look wrong, skip entirely — use clean BG transitions. | `phases/phase-8-waves.md` |
| 13 | Decorative & Icons | **Varied** elements (3-4 types, 2x size range, strategic placement). Icons: Nano Banana → **numbered text fallback** if AI fails. | `phases/phase-9-decorative.md` + `phases/phase-9.5-icons.md` |
| 14 | Z-Order | Verify layer stacking, final resize | `phases/phase-10-z-order.md` |
| 15 | QC Scoring | **16 core checks (/160)** + 2 bonus (/10) = /170. Structural + design quality. Thresholds based on combined core score (/160). Bonus checks (+10) are informational and do not affect verdict. | `phases/phase-11-quality-scoring.md` |
| 16 | Save State | Write FIGMA-FINISH-PROMPT.md for session continuity | `phases/phase-12-save-state.md` |
| 17 | HTML Export | Export production frame to Gmail-safe HTML | `phases/phase-17-html-export.md` |

---

## FIGMA NODE ID REFERENCE

> **This is the canonical node ID reference.** Phase files should reference this section, not hardcode IDs. If a node ID changes, update it HERE and all phases inherit the fix.

### Row 1: Logos (2 per brand — brand colour + white)
| Brand | Logo Frame ID | Notes |
|-------|--------------|-------|
| Spa | `4457:139` | Inspect children for colour + white variants |
| Aesthetics | `4493:1738` | Inspect children for colour + white variants |
| Slimming | Discover: `get_node_info` on the Row 1 frame → iterate `children` → find FRAME nodes containing "slim" or "slimming" (case-insensitive). Expected: 2 children (colour + white variants). Cache IDs in state file after first discovery. | Runtime discovery — cache in state file |

### Row 2: Colours
| Brand | Gradient Swatch | Solid Swatches |
|-------|----------------|----------------|
| Spa | `4491:66` | `4491:498`, `4491:499`, `4491:500` |
| Aesthetics | `4491:501` | `4491:505`, `4491:503`, `4491:504` |
| Slimming | `4491:68` | `4491:509`, `4491:507`, `4491:508` |

### Row 4: Elements/Templates
| Element | Node IDs |
|---------|----------|
| Before/After cards | `4493:1194`, `4493:1213`, `4493:1314`, `4493:1238` |
| CTA bars/elements | `4493:1658`, `4493:1837` |
| SPA flower petals | `3601:460`, `3601:462`, `3601:464`, `3601:466` |

### Row 5: Fixed Footers
| Brand | Footer Frame ID | Height |
|-------|----------------|--------|
| Spa | `4491:802` | ~2016px |
| Aesthetics | `4491:803` | ~1682px |
| Slimming | `4492:66` | ~1921px |

### Row 6: Copy + Wireframe (Source)
| Frame | ID | Brand | Size |
|-------|----|-------|------|
| SPA_Value_01_TensionScience | `4445:527` | Spa | 600x4500 |
| SPA_Value_02_GiftGuide | `4445:565` | Spa | 600x5200 |
| AES_Value_01_SkinSignals | `4445:600` | Aesthetics | 600x4800 |
| AES_Value_02_FirstTreatment | `4445:640` | Aesthetics | 600xvaries |
| SLIM_Value_01_DietsHoldFat | `4445:670` | Slimming | 600x6200 |
| SLIM_Value_02_MenopauseMyth | `4445:714` | Slimming | 600xvaries |

### Row 6: Wave Sources
| Wave | Node ID | Brand | Size |
|------|---------|-------|------|
| Wave_Hero_Bottom | `4468:535` | SPA | 600x40 |
| Wave_Beige_Section3 | `4468:537` | SPA | 600x35 |
| Wave_Beige_Section5 | `4468:539` | SPA | 600x35 |
| Wave_Footer | `4468:541` | SPA | 600x35 |
| Wave_Hero_Bottom | `4468:549` | AES | 600x40 |
| Wave_Sage_Section3 | `4468:551` | AES | 600x30 |
| Wave_Beige_Footer | `4468:553` | AES | 600x30 |
| SLIM waves | `get_node_info(4445:670)` → scan children for FRAME nodes with "Wave" or "wave" in name. Typical: Wave_Hero_Bottom, Wave_Section, Wave_Footer. If fewer than 2 waves found, check `4445:714` children as well. | SLIM | Discovery required — names vary per emailer |

### Row 7: Final Production - Design (Target)
| Frame | ID | Brand | Size |
|-------|----|-------|------|
| SPA_Value_01 | `4495:2255` | Spa | 600x4500 |
| SPA_Value_02 | `4495:2313` | Spa | 600x5200 |
| Aes_01 | `4495:2354` | Aesthetics | 600x4500 |
| Aes_02 | `4495:2356` | Aesthetics | 600x5200 |
| Slimming_01 | `4495:2358` | Slimming | 600x4500 |
| Slimming_02 | `4495:2360` | Slimming | 600x5200 |

---

## BRAND QUICK REFERENCE

### SPA — Carisma Spa & Wellness

| Property | Value |
|----------|-------|
| Body BG | `#fdf7ec` warm cream (NEVER white) |
| Alt section BG | `#e8ded1` beige |
| CTA | 420x48, `#a88c4a` gold, 6px radius, white text + ">" |
| CTA chevron | Always. Append " >" after CTA text |
| Accent | `#c4a659` gold |
| Text colour | `#3b3029` deep brown |
| Muted text | `#9b8d83` warm taupe |
| Hero gradient | `#1a140f` (0%→30%→65% opacity) |
| Hero header | Trajan Pro 400 |
| Sub headers | Novecento Wide 400 |
| Labels | Novecento Wide Book |
| Body | Roboto 400 20px |
| Decorative script | Italianno 400 45px |
| Persona | Sarah ("Peacefully, Sarah" — text-based only) |
| Social | @carismaspamalta |
| Trust claim | #1 Most Reviewed Spa in Malta |
| Decoration | Flower petals (4 variants, opacity 0.3-0.4) |

### AES — Carisma Aesthetics

| Property | Value |
|----------|-------|
| Body BG | `#ffffff` white |
| Alt section BG | `#e8f0ed` sage tint |
| Footer BG | `#f5f0eb` warm beige |
| CTA | 340x46, `#607872` sage, 22px radius, white text |
| CTA chevron | Optional. Only if wireframe shows it |
| Badge fill | `#8faba3` sage |
| Accent | `#96b2b2` sage teal |
| Text colour | `#3b3b3b` charcoal |
| Muted text | `#9b8d83` warm taupe |
| Stars | `#c4a366` gold |
| Hero gradient | `#1a1f1c` (0%→25%→55% opacity) |
| Headers | Cormorant Garamond Medium |
| Body | Montserrat 400 14px |
| Persona | Sarah ("Beautifully yours, Sarah" — text-based only) |
| Social | @carismaaesthetics |
| Trust claim | #1 Voted Med-Aesthetics Clinic in Malta |

### SLIM — Carisma Slimming

| Property | Value |
|----------|-------|
| Body BG | `#ffffff` white |
| Alt section BG | `#f5f0e8` off-white |
| CTA | 480x52, `#4a6b59` forest green, 28px radius, white bold text |
| CTA chevron | Never on primary CTAs. Nav pills may have chevron |
| Accent | `#8eb093` sage green |
| Nav pill BG | `#c4d6c7` |
| Text colour | `#3b3b3b` charcoal |
| Muted text | `#9b8d83` warm taupe |
| Pre-header | `#576f80` steel blue (SLIM only) |
| Hero gradient | `#141f1a` (0%→30%→60% opacity) |
| Headers | Cormorant Garamond |
| Body | Montserrat 400 15px |
| Persona | Katya ("With you every step, Katya" — text-based only) |
| Social | @carismaslimming |
| Trust claim | #1 Reviewed on Google |

---

## AUTHORITATIVE COLOR REFERENCE

**This is the single source of truth for all brand colors. Phase files reference this section.**

### SPA Colors
| Name | Hex | Usage |
|------|-----|-------|
| Warm Cream (BG) | `#fdf7ec` | Primary body background (NEVER white) |
| Section Beige | `#e8ded1` | Alternating section backgrounds |
| CTA Gold | `#a88c4a` | CTA button fill |
| Accent Gold | `#c4a659` | Stars, decorative elements, accent text |
| Deep Brown (text) | `#3b3029` | ALL body text (never pure black) |
| Warm Taupe | `#9b8d83` | Secondary/muted text |
| Hero Gradient Base | `#1a140f` | Hero overlay (0% → 30% → 65% opacity) |
| Primary Gradient | `#291f12` → `#52381f` (95%) → `#8c612e` (70%) | Hero overlays, premium dark sections |

### AES Colors
| Name | Hex | Usage |
|------|-----|-------|
| White (BG) | `#ffffff` | Primary body background |
| Sage Tint | `#e8f0ed` | Content section backgrounds |
| Light Sage | `#e7f0f0` | Alternating section backgrounds |
| Warm Beige Footer | `#f5f0eb` | Footer, "Real Results" section |
| CTA Sage | `#607872` | CTA button fill |
| Badge Sage | `#8faba3` | Numbered badges, section accents |
| Sage Teal | `#96b2b2` | Headings, accent borders |
| Charcoal (text) | `#3b3b3b` | Body text |
| Medium Gray | `#6b6b6b` | Secondary text |
| Warm Taupe | `#9b8d83` | Muted accents |
| Gold (stars) | `#c4a366` | Star ratings ONLY |
| Hero Gradient Base | `#1a1f1c` | Hero overlay (0% → 25% → 55% opacity) |
| Primary Gradient | `#96b2b2` → `#b5ccc4` (70%) | Hero overlays, premium sections |

### SLIM Colors
| Name | Hex | Usage |
|------|-----|-------|
| White (BG) | `#ffffff` | Primary body background |
| Off-White | `#f5f0e8` | Section backgrounds, cream sections |
| Forest Green (CTA) | `#4a6b59` | Primary CTA fill, footer BG |
| Sage Green | `#8eb093` | Accent elements, light badges |
| Green Accent | `#8ca899` | Step numbers, nav pills, accent text |
| Nav Pill BG | `#c4d6c7` | "Explore Carisma Slimming" pills |
| Pre-header Bar | `#576f80` | Steel blue urgency strip (SLIM only) |
| Charcoal (text) | `#3b3b3b` | Body text |
| Warm Taupe | `#9b8d83` | Muted accents |
| Hero Gradient Base | `#141f1a` | Hero overlay (0% → 30%@45% → 60%@100%) |
| Primary Gradient | `#2e4738` → `#4a6b59` (90%) → `#668573` (65%) | Hero overlays, premium dark sections |

### Shared
| Name | Hex | Usage |
|------|-----|-------|
| Warm Taupe | `#9b8d83` | Secondary/muted elements — ALL brands |

---

## ERROR RECOVERY

| Problem | Solution |
|---------|----------|
| Node not found | Figma page may not be loaded. Run `get_document_info` first to trigger load. |
| Insert fails | Clone to page level first, THEN `insert_child` into target frame. |
| Design outside grid | Element was created but never `insert_child`'d into Row 7 frame. Every create/clone MUST be followed by `insert_child`. |
| Built in wrong frame | You created a NEW frame instead of using the pre-existing grid frame. The grid's Row 6 and Row 7 frames have fixed IDs (see NODE ID REFERENCE). Delete your new frame and rebuild inside the correct one. **Telltale sign:** state file has a frame ID like `4547:xxx` that doesn't match any Row 6/7 ID in the reference table. |
| Frame has content but grid cell is empty | The frame ID is correct but the frame is at the WRONG POSITION or has the wrong parent. Run Phase 0.25 to discover the grid structure. Check the frame's parent (should be the Row 7 grid row frame, not page level) and position (y must be in Row 7's y range, BELOW Row 6). Use a visible emailer's position as reference. Fix with `insert_child` + `move_node`. |
| Copy row has images | Used clone_node instead of set_text_content. Row 6 is TEXT ONLY — update existing text nodes, never clone wireframes/images. |
| Image not showing | Source node must have IMAGE fill type. Check with `get_node_info`. |
| Text font not loading | Use `load_font_async` BEFORE `set_font_name`. Always. |
| Frame clipping | All child positions must be within 0-600 (x) and 0-frameHeight (y). |
| Element invisible | Check z-order — probably behind a background rectangle. Use `reorder_node`. |
| Context window running out | Save state to FIGMA-FINISH-PROMPT.md immediately using the format in RESUME STATE FILE FORMAT section. Resume with `/emailbaby <brand> resume`. |
| Wave looks wrong | Waves are OPTIONAL in v4.2. If wave SVGs don't match the design, delete them all and use clean BG transitions. Don't force broken waves. |
| Image distorted | Source aspect ratio doesn't match target. `get_image_from_node` → check dimensions → `apply_image_transform` to adjust. |
| Image not filling frame | scaleMode is FIT instead of FILL. `apply_image_transform(scaleMode: "FILL")` |
| Image doesn't match label | Export image, visually confirm subject. If mismatch (e.g. foot photo for "Neck" label), find correct image from Image Bank. Always verify AFTER placement. |
| Hero image pixelated | Source too small. Hero needs ≥1200px wide source for 600px retina display. Re-pick from Image Bank — look for the largest source image. |
| Logo is text placeholder | Delete the TEXT node. Clone the real vector logo from Row 1 (`4457:139` SPA, `4493:1738` AES). The logo is a FRAME with vectors, never plain text. |
| Testimonial image wrong gender | Export image, verify it matches the testimonial name. Maria/Sarah = female photo. If wrong, swap from Image Bank. |
| Icon style mismatch | Export existing brand icons first, use as `referenceImages` in `edit_image`. |
| Nano Banana failed | **Numbered text fallback.** Create gold/sage/green numbered text ("1", "2", "3") in Montserrat SemiBold 20px. These are clean and professional. Don't leave sections without visual anchors. |
| Generated image too large | `set_image` max ~5MB. Use `continue_editing` to simplify, or resize after placement. |
| Elements overlap | Check bounding boxes: if A.y + A.height > B.y for elements in the same section, move them apart. Most common: hero CTA overlapping subheadline. |
| Decoratives look amateur | Need variety: 3-4 types, size range 18-58px, strategic placement at section transitions. Add secondary accents (gold dividers, thin rules) beyond the primary motif. |

---

## RESUME STATE FILE FORMAT

The state file at `.tmp/emails/<brand>-emailers/FIGMA-FINISH-PROMPT.md` enables mid-session resume. Structure:

```
# Emailbaby State — [Brand] [Emailer Name]
Updated: [ISO timestamp]

## Status
CURRENT_PHASE: [phase number, e.g. "5"]
WAVES_DECISION: [WAVES_USED | WAVES_SKIPPED]
EMAILER_TYPE: [DESIGNED | TEXT_BASED]

## Phase Completion
- [x] Phase 0: Connect & Orient
- [x] Phase 1: Extract Copy
- [ ] Phase 2: Text Hierarchy
... (all 16 phases listed)

## Connection
CHANNEL_ID: [figma channel ID]
DOCUMENT_ID: [figma document ID]

## Production Frames
| Emailer | Frame ID | Dimensions | Status |
|---------|----------|------------|--------|
| [name]  | [id]     | 600x[H]   | [in_progress/complete] |

## Copy Manifest
[Full verbatim copy from Phase 1, organized by section]

## Image Inventory
| Source Node | Keywords | Dimensions | Assigned To | Status |
|-------------|----------|------------|-------------|--------|

## Icon Inventory
| Section | Style | Prompt Used | Node ID | Method |
|---------|-------|-------------|---------|--------|
(method: nano_banana | numbered_fallback | manual)

## Node Map
| Element | Node ID | Type | Position (x,y) | Size (w×h) |
|---------|---------|------|-----------------|------------|

## QC Score Card
[Paste from Phase 11 when complete]

## Brand Colours Quick Reference
[Copy from SKILL.md Brand Quick Reference for active brand]

## Notes
[Any decisions, skipped steps, or issues to address on resume]
```

When resuming (`/emailbaby <brand> resume`):
1. Read this file
2. Jump to first unchecked phase in "Phase Completion"
3. Use existing Copy Manifest, Image Inventory, Node Map — don't re-extract
4. Continue from where you left off

---

## QUICK START

When the user runs `/emailbaby spa`:

1. Read `phases/phase-0-connect.md` → load MCP tools, join channel
2. **Run Phase 0.25 (Grid Discovery) — MANDATORY.** Discover the grid structure, find Row 6/7 row frames, verify each target frame's position and parent. Build the Grid Position Map. Do NOT skip this.
3. **Auto-discover topics** from the Topics row in Figma grid — list them back to user for confirmation
4. Check for `.tmp/emails/spa-emailers/FIGMA-FINISH-PROMPT.md`
5. If fresh → execute the full pipeline (see table above)
6. If resume → read state file, skip to first incomplete step (but ALWAYS re-run Phase 0.25 to verify grid positions)
7. At each step: **Read the phase file first**, then execute
8. **CRITICAL (Rule #14):** Use existing grid frames. Verify both correct frame ID AND correct grid position (parent + coordinates from Grid Position Map). A correct ID at the wrong position = invisible to user.
9. Save state after every phase
10. **Verify:** Copy appears in Row 6, final design appears in Row 7. If a grid cell looks empty, check frame position first (Phase 0.25 Step 5).
11. Present QC checklist to user at step 15

---

## APPENDIX: EXPECTED OUTPUT REFERENCE

What a completed emailer should contain (minimum elements per brand):

### SPA Designed Emailer
- Hero: full-width image (600×350-450px) + gradient overlay `#1a140f` + white logo (from `4457:139`) + headline (Trajan Pro 30-37px) + subheadline (Roboto 20px) + gold CTA with chevron
- 2-4 content sections alternating `#fdf7ec` / `#e8ded1` backgrounds
- 3+ CTAs (hero, mid, pre-footer) — gold `#a88c4a`, 420×48px, 6px radius, chevron ">"
- Flower petal decoratives: 3-4 variants, sizes 18-58px, opacity 0.3-0.4
- Wave dividers at section transitions (or clean BG transitions if WAVES_SKIPPED)
- Fixed footer cloned from `4491:802` — flush, no gap
- ALL text in `#3b3029` (body) or `#ffffff` (over dark BG)
- **Total elements:** ~40-60 nodes

### AES Designed Emailer
- Hero: full-width image + gradient `#1a1f1c` + white logo (from `4493:1738`) + headline (Cormorant Garamond Medium) + sage CTA
- Content on `#ffffff` / `#e8f0ed` alternating backgrounds
- 3+ CTAs — sage `#607872`, 340×46px, 22px pill radius
- Before/After cards from `4493:1194` etc.
- Fixed footer from `4491:803` with "Real Results" section
- ALL text in `#3b3b3b` (body) or `#ffffff` (hero)
- **Total elements:** ~35-50 nodes

### SLIM Designed Emailer
- **Pre-header bar** (if applicable): `#576f80` steel blue, 38px height, white Montserrat 12px
- Hero: full-width image + gradient `#141f1a` + logo + headline (Cormorant Garamond) + forest green CTA
- Content on `#ffffff` / `#f5f0e8` alternating backgrounds
- 3+ CTAs — forest green `#4a6b59`, 480×52px, 28px pill radius, NO chevron
- Nav pills: `#c4d6c7` background, 22px radius (in footer Explore section)
- Fixed footer from `4492:66` with trust circles + nav pills + media strip
- ALL text in `#3b3b3b` (body) or `#ffffff` (hero/footer)
- **Total elements:** ~45-65 nodes (longest emails)
