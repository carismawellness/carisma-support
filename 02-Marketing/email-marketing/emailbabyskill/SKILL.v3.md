---
name: emailbaby
description: "Build production-ready emailers in Figma for Carisma Wellness brands. 13-phase pipeline from topic to final design: orient → extract → hierarchy → CTAs → spacing → images → colours → footer → waves → elements → z-order → QC → save. Slash command: /emailbaby <brand> <emailer-name> [resume]"
version: "3.0.0"
user-invocable: true
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Task, ToolSearch
argument-hint: "<brand> <emailer-name> [resume]"
metadata:
  author: Carisma
  tags:
    - figma
    - emailer
    - design
    - production
  triggers:
    - "emailbaby"
    - "build emailer"
    - "figma emailer"
    - "email production"
    - "design emailer"
---

# Emailbaby v3.0 — Production Emailer Builder

You build production-ready emailers in Figma for **Carisma Wellness Group** (Malta). Three brands: Spa, Aesthetics, Slimming. Two emailer types: Designed (visual-first) and Text-Based (content-first).

Battle-tested across 4+ emailers. Every instruction below comes from what actually worked.

---

## THE GOLDEN RULES

> **1. NEVER generate copy for Designed emailers.** Row 6 wireframes contain finalized, approved copy. Extract it. Use it verbatim. If you catch yourself writing a headline or CTA from scratch for a Designed emailer, STOP.

> **2. 600px width is SACRED.** Never change it. Height is flexible.

> **3. Fixed Footer is UNTOUCHABLE.** Clone from Row 5, drop at bottom. Never modify internals.

> **4. No persona sign-offs in Designed emailers.** "Peacefully, Sarah" etc. is for Text-Based only.

> **5. Waves ONLY, never straight lines.** Every section transition gets an organic wave divider.

> **6. Save state after every phase.** Write/update `.tmp/emails/<brand>-emailers/FIGMA-FINISH-PROMPT.md` so work survives context limits.

> **7. load_font_async BEFORE set_font_name.** Always. Or text renders in default fonts.

---

## FIGMA NODE ID REFERENCE

### Row 1: Logos
| Brand | Logo Frame ID |
|-------|--------------|
| Spa | `4457:139` |
| Aesthetics | `4493:1738` |

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
| SLIM waves | Inspect `4445:670` children for FRAME elements with "Wave" in name | SLIM | varies |

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

## PHASE 0: CONNECT & ORIENT

### 0.1 Load Figma MCP Tools

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

### 0.2 Connect & Read

1. `mcp__figma-write__join_channel(channel: "<id>")` — ask user for channel ID if not provided
2. Read these files in parallel:
   - `config/emailer-guidelines.md` — **DEFINITIVE SPEC** (all colors, fonts, node IDs, rules)
   - Brand CLAUDE.md for tone context: `spa/CLAUDE.md` | `aesthetics/CLAUDE.md` | `slimming/CLAUDE.md`

### 0.3 Orient

1. Identify brand: **SPA** | **AES** | **SLIM**
2. Determine emailer type: **DESIGNED** (visual-first) or **TEXT-BASED** (content-first)
   - Designed: image-heavy, 6-15 text elements, no sign-off, Trajan/Novecento/Roboto fonts
   - Text-Based: content-heavy, 20-30+ text elements, persona sign-off, Playfair/Cormorant/Montserrat fonts
3. Locate the emailer **Topic** from the Topics row in Figma
4. Draft copy appropriate to type:
   - **TEXT-BASED** → full copy (greeting "Hi [First Name],", body sections, CTAs, persona sign-off)
   - **DESIGNED** → minimal copy (headline, subheads, labels, CTA text only — less is more)
5. Place drafted copy into Copy + Wireframe row (Row 6) using `mcp__figma-write__set_text_content`

### 0.4 Check for Resume State

If `resume` argument is true, or if `.tmp/emails/<brand>-emailers/FIGMA-FINISH-PROMPT.md` exists:
- Read it. It contains node IDs, what's done, and what's left.
- Skip to the first incomplete phase.
- Don't rebuild what's already built.

---

## PHASE 1: EXTRACT COPY & SCAFFOLD PRODUCTION

### 1.1 Extract from Wireframe

`mcp__figma-write__get_node_info` on the Copy + Wireframe frame (Row 6). Source IDs:
- SPA: `4445:527` | `4445:565`
- AES: `4445:600` | `4445:640`
- SLIM: `4445:670` | `4445:714`

Extract ALL text nodes from the `children` array → build the **Copy Manifest**.

### 1.2 Build Copy Manifest

Map every extracted text node to its production role:

```
## COPY MANIFEST — [Emailer Name]
Source: Row 6 wireframe [ID]
Extracted: [date]

### HERO
- Headline: "[exact text]"
- Subheadline: "[exact text]"

### INTRO
- Greeting: "Hi [First Name],"
- Body: "[exact text]"

### SECTION: [Name]
- Heading: "[exact text]"
- Body: "[exact text]"
- Labels: "[exact text]"

### CTA
- Button text: "[exact text]"

### TESTIMONIAL
- Stars: [count]
- Quote: "[exact text]"
- Attribution: "[exact text]"

### SIGN-OFF (Text-Based ONLY)
- "[exact text]"
```

### 1.3 Scaffold Production Frame

1. Open target Final Production - Design frame (Row 7):
   - SPA: `4495:2255` | `4495:2313`
   - AES: `4495:2354` | `4495:2356`
   - SLIM: `4495:2358` | `4495:2360`
2. `mcp__figma-write__get_node_info` on production frame — catalog any existing children
3. Create wireframe placeholders: `mcp__figma-write__create_frame` / `create_rectangle` for each section
4. Place extracted copy into production: `mcp__figma-write__create_text` + `set_text_content`

### 1.4 Copy Selection for Designed Emailers

Designed emailers use LESS copy than the wireframe contains. Cherry-pick:
- Hero headline + subheadline (verbatim)
- Section headings (verbatim)
- Key labels (verbatim)
- CTA button text (verbatim)
- Testimonial quote + attribution (verbatim)
- Brief body snippets where needed (NOT full paragraphs)

**If the wireframe has placeholder text or is empty: STOP and ask the user.**

### 1.5 Save State

Write Copy Manifest to `.tmp/emails/<brand>-emailers/FIGMA-FINISH-PROMPT.md`

---

## PHASE 2: TEXT HIERARCHY + CENTRE ALIGNMENT

### 2.1 Load Fonts

`mcp__figma-write__load_font_async` — **MUST** run before any `set_font_name` call. Load all fonts the brand needs upfront.

### 2.2 Apply Font Hierarchy

Per `config/emailer-guidelines.md` §Typography:

**Designed Emailers (all brands use these):**

| Role | Font | Weight | Size | Case |
|------|------|--------|------|------|
| Hero header | Trajan Pro | Bold (700) | 30-50px | Title Case or UPPERCASE |
| Sub headers | Novecento Wide | 400 | 25-30px | UPPERCASE, letter-spacing +2-3px |
| Body copy | Roboto | 400 | 20-25px | Sentence case |
| Labels/badges | Novecento Wide Book | 350-400 | 13px | UPPERCASE |
| CTA text | Novecento Wide | 650 | 20px | UPPERCASE |

**Text-Based Emailers (brand-specific):**

| Role | SPA | AES | SLIM |
|------|-----|-----|------|
| H1 headline | Playfair Display Bold 36px | Cormorant Garamond Medium 32px | Cormorant Garamond Regular 30px |
| H2 section | Playfair Display Regular 24px | Cormorant Garamond Regular 24px | Cormorant Garamond Regular 22px |
| Body | Montserrat Regular 15px | Montserrat Regular 14px | Montserrat Regular 15px |
| CTA button | Montserrat SemiBold 13px | Montserrat SemiBold 13px | Montserrat Bold 15px |

### 2.3 Apply Styles

For each text element:
1. `mcp__figma-write__set_font_name` — correct font family + weight
2. `mcp__figma-write__set_font_size` — correct size per role
3. `mcp__figma-write__set_text_align` → **CENTER** on all text elements
4. Content column: 520-552px (24-40px padding L/R within 600px frame)

### 2.4 Text Colors

`mcp__figma-write__set_fill_color` on each text node:
- SPA: `#3b3029` deep brown (never pure black)
- AES: `#3b3b3b` charcoal
- SLIM: `#3b3b3b` charcoal
- Hero text: always `#ffffff` white

### 2.5 Case & Spacing Rules

Per `config/emailer-guidelines.md` §Headline Case Rules:
- SPA: UPPERCASE or Title Case
- AES: Title Case or UPPERCASE with letter-spacing +2-4px
- SLIM: UPPERCASE with letter-spacing +2-3px. Period at end of declarative headlines.

Line heights:
- Body text: 25.5px (SPA/SLIM), 23.8px (AES)
- Headlines: 42px (SPA), 38px (AES), 36px (SLIM)
- Letter-spacing on headings: 2-4px
- Letter-spacing on CTAs: 1.5px

---

## PHASE 3: CTA BUTTONS

### 3.1 Build or Clone CTAs

Clone from Buttons row in Figma OR create per brand spec:

| Property | SPA | AES | SLIM |
|----------|-----|-----|------|
| Size | 420x48 | 340x46 | 480x52 |
| Fill | `#a88c4a` gold | `#607872` sage | `#4a6b59` forest green |
| Corner radius | 6px | 22px | 28px |
| Text color | White | White | White |
| Text case | UPPERCASE | UPPERCASE | UPPERCASE BOLD |
| Text weight | SemiBold 13px | SemiBold 13px | Bold 15px |
| Chevron (>) | Yes | Optional | No |
| Letter-spacing | 1.5px | 1.5px | 1.5px |

### 3.2 Create Each CTA

1. `mcp__figma-write__create_rectangle` — button background
2. `mcp__figma-write__set_corner_radius` — per brand spec
3. `mcp__figma-write__set_fill_color` — brand CTA color
4. `mcp__figma-write__create_text` — button label
5. `mcp__figma-write__set_font_name` — Novecento Wide (Designed) | Montserrat (Text-Based)
6. Button text from Copy Manifest — **verbatim, never improvised**

### 3.3 Place 3 CTAs Minimum

1. **Hero area** — below hero headline
2. **Mid-content** — between major sections
3. **Pre-footer** — above fixed footer

`mcp__figma-write__move_node` to position each CTA.

---

## PHASE 4: SPACING REFINEMENT

### 4.1 Visual Audit

`mcp__figma-write__export_node_as_image` at 0.5x scale → inspect the current state.

### 4.2 Fix Spacing

- **Dead zones:** any gap >80px between content blocks = close it
- **Cramped areas:** maintain 20-30px breathing room minimum
- **Negative space:** remove unnecessary gaps that don't serve the design
- If a section BG was budgeted larger than content needs:
  1. `mcp__figma-write__resize_node` on BG rectangle to tighten
  2. Recalculate ALL Y positions below: `mcp__figma-write__move_node` on each element
- No orphaned whitespace between last content section and footer zone

### 4.3 Note

Frame height final resize happens in Phase 10 after all elements are placed. This phase focuses on closing dead zones and tightening gaps in existing content.

---

## PHASE 5: IMAGES

### 5.1 Strategise

Match image needs to copy context. Read each section heading/body to determine what imagery supports the message. Shortlist before cloning.

### 5.2 Source from Image Bank (Row 3)

Browse the brand column. Select contextually appropriate imagery:
- **SPA:** warm spa lifestyle (pools, hammam, treatments, Mediterranean views)
- **AES:** clinical elegance (close-up skin, treatment scenes, patient portraits)
- **SLIM:** transformation imagery (before/after, treatment tech, lifestyle)

**Source priority:**
1. Clone IMAGE fill from wireframe hero (quickest, already contextual)
2. Browse Image Bank (Row 3) for brand column
3. Clone from footer frame children (collage photos)
4. Ask the user

### 5.3 Clone & Place

1. `mcp__figma-write__clone_node` from Image Bank source
2. `mcp__figma-write__insert_child` into production frame
3. `mcp__figma-write__move_node` + `resize_node` to fit placement

**Image placements:**
- **Hero:** full-width 600px, height 300-450px, scale mode FILL
  - Apply via `mcp__figma-write__set_image_fill` or `replace_image_fill`
  - Hero gradient overlay stays ON TOP — do NOT touch it
- **Section images:** sized contextually to content blocks
- **Circular crops:** `mcp__figma-write__set_corner_radius` = width/2

### 5.4 Before/After Placeholders (AES/SLIM)

- Create rectangles: 130x160px, corner-radius 8px
- Fill: `#d9d1c7` placeholder gray
- Thin stroke: `#bfd4cc` at 40% opacity
- Labels: "BEFORE" and "AFTER" in Montserrat Medium 9px
- **Leave as placeholders** — real B/A photos are added manually

---

## PHASE 6: COLOURS

### 6.1 Reference Colours Row (Row 2)

Each brand has 1 gradient + 3 solids. Node IDs:

| Brand | Gradient | Solid 1 | Solid 2 | Solid 3 |
|-------|----------|---------|---------|---------|
| SPA | `4491:66` | `4491:498` | `4491:499` | `4491:500` |
| AES | `4491:501` | `4491:505` | `4491:503` | `4491:504` |
| SLIM | `4491:68` | `4491:509` | `4491:507` | `4491:508` |

Shared warm taupe across all brands: `#9b8d83`

### 6.2 Apply Body Background

`mcp__figma-write__set_fill_color` on the production frame:
- SPA: `#fdf7ec` warm cream (**NEVER** white)
- AES: `#ffffff` pure white
- SLIM: `#ffffff` pure white

### 6.3 Apply Section Backgrounds

`mcp__figma-write__set_fill_color` on alternating section rectangles:
- SPA: `#e8ded1` beige (alternating with cream)
- AES: `#e8f0ed` sage tint (alternating with white)
- SLIM: `#f5f0e8` off-white (alternating with white)

### 6.4 Apply Hero Gradient Overlay

`mcp__figma-write__set_gradient` on the hero overlay rectangle:
- SPA: `#1a140f` at 0% opacity → 30% opacity → 65% opacity (top→bottom)
- AES: `#1a1f1c` at 0% opacity → 25% opacity → 55% opacity (top→bottom)
- SLIM: `#141f1a` at 0% opacity → 30% at 45% → 60% at 100% (top→bottom)

### 6.5 Strategic Colour Placement

Use design principles. Every colour application should have a reason:
- **Gradients** → hero overlays, premium dark sections (not flat backgrounds)
- **Brand accent** → CTAs, star ratings, accent text, pricing highlights
  - SPA: gold `#c4a659` / CTA gold `#a88c4a`
  - AES: sage teal `#96b2b2` / CTA sage `#607872`
  - SLIM: sage green `#8eb093` / CTA forest `#4a6b59`
- **Warm taupe `#9b8d83`** → secondary text, muted accents (all brands)
- **NO** bright colors, no red, no orange, no blue across any brand

---

## PHASE 7: FIXED FOOTER

### 7.1 Clone Footer

Clone from Row 5 — **NEVER modify internals:**

| Brand | Footer ID | Height |
|-------|-----------|--------|
| Spa | `4491:802` | ~2016px |
| Aesthetics | `4491:803` | ~1682px |
| Slimming | `4492:66` | ~1921px |

### 7.2 Place Footer

1. `mcp__figma-write__clone_node(nodeId: "<footer_id>")`
2. `mcp__figma-write__insert_child(parentId: "<production_frame_id>", childId: "<cloned_id>")`
3. `mcp__figma-write__move_node(nodeId: "<cloned_id>", x: 0, y: <bottom_of_content>)`
4. `mcp__figma-write__rename_node` → `Fixed_Footer_<BRAND>`

Footer is **UNTOUCHABLE**. Drop in as-is. No edits.

---

## PHASE 8: WAVE DIVIDERS

### 8.1 Source Waves

Waves are organic curved SVG shapes from Row 6 wireframes. **NEVER use straight lines.**

**SPA waves (from wireframe `4445:527`):**
| Wave | Node ID | Size |
|------|---------|------|
| Wave_Hero_Bottom | `4468:535` | 600x40 |
| Wave_Beige_Section3 | `4468:537` | 600x35 |
| Wave_Beige_Section5 | `4468:539` | 600x35 |
| Wave_Footer | `4468:541` | 600x35 |

**AES waves (from wireframe `4445:600`):**
| Wave | Node ID | Size |
|------|---------|------|
| Wave_Hero_Bottom | `4468:549` | 600x40 |
| Wave_Sage_Section3 | `4468:551` | 600x30 |
| Wave_Beige_Footer | `4468:553` | 600x30 |

**SLIM waves:** Inspect wireframe `4445:670` children for FRAME elements with "Wave" in name.

### 8.2 Clone & Place

For each section transition:
1. `mcp__figma-write__clone_node(nodeId: "<wave_source_id>")`
2. `mcp__figma-write__insert_child(parentId: "<production_frame_id>", childId: "<cloned_id>")`
3. `mcp__figma-write__move_node(nodeId: "<cloned_id>", x: 0, y: <transition_y>)`
4. `mcp__figma-write__rename_node` → `Wave_<description>`

### 8.3 Placement Positions

- Below hero: hero height - 15px (overlaps slightly for seamless transition)
- Before each alternating-color section
- Before footer

### 8.4 Wave Fill Colours

Wave fill must match the section it transitions **INTO:**
- Transitioning to cream/white → wave fill = cream/white
- Transitioning to beige/sage → wave fill = beige/sage

Inspect nested SVG children of the wave frame — adjust fill on the **child vector**, not the parent frame.

---

## PHASE 9: DECORATIVE ELEMENTS

### 9.1 Strategise

What shapes, motifs, vectors serve the content? Every element should reinforce, not compete. **Subtle > obvious. If in doubt, leave it out.**

### 9.2 Source from Elements/Templates Row (Row 4)

Shortlist relevant components from the brand column, then clone:
1. `mcp__figma-write__clone_node` from Row 4 source
2. `mcp__figma-write__insert_child` into production frame
3. `mcp__figma-write__move_node` to target position
4. `mcp__figma-write__resize_node` to appropriate size

### 9.3 Brand-Specific Elements

**SPA — Flower Petals:**
- 4 petal variants: `3601:460`, `3601:462`, `3601:464`, `3601:466`
- 8 petals per emailer, scattered as subtle accents
- Size: 28-50px (SMALL — these are accents, not features)
- `mcp__figma-write__set_node_properties` → opacity 0.30-0.40
- `mcp__figma-write__rotate_node` → varied angles -30 to +35 for natural scatter
- Alternate between all 4 variants
- Placement: hero corners, section entries, CTA flanks, pre-footer

**AES — Sage Accents:**
- Treatment cards, star ratings, testimonial blocks, before/after cards
- Key nodes: `4493:1194`, `4493:1213`, `4493:1314`, `4493:1238`
- Sage-tinted decorative elements, thin line accents, badge backgrounds

**SLIM — Green Accents:**
- Navigation pills, before/after cards, CTA bars
- Key nodes: `4493:1658`, `4493:1837`
- Green-tinted decorative separators

### 9.4 Usage Principles

- Shapes, boxes, masks, vectors — use with **design intent**
- Every decorative element must have a reason for being there
- Decorative clutter degrades the design. Restraint is a feature.

---

## PHASE 10: Z-ORDER VERIFICATION

### 10.1 Check Layer Order

`mcp__figma-write__get_node_info` on the production frame. Inspect the `children` array.

Correct stacking order (first = bottom, last = top):

```
1. Hero_BG (bottom — renders first)
2. Section background rectangles
3. Hero_Gradient_Overlay
4. Wave dividers
5. Text elements (headings, body, labels)
6. CTA buttons + CTA text
7. Decorative elements (petals, badges, shapes)
8. Fixed_Footer (top/last — renders last)
```

### 10.2 Fix Misorders

`mcp__figma-write__reorder_node` for any element in the wrong position.

Common traps:
- Background rectangle AFTER text → text is invisible
- Gradient overlay AFTER hero text → text is hidden behind gradient
- Wave divider behind a background → wave invisible

### 10.3 Visual Confirmation

`mcp__figma-write__export_node_as_image` at 0.25x scale. If any element appears missing, check z-order FIRST before assuming it was deleted.

### 10.4 Final Frame Resize

1. Find the bottommost element (usually footer bottom)
2. `mcp__figma-write__resize_node` → height = that element's Y + height
3. Width = 600px (**SACRED**)

---

## PHASE 11: QC CHECKLIST

Run through every item before marking the emailer complete.

### Copy Integrity (CHECK FIRST)
- [ ] All text matches Copy Manifest from Phase 1 — **verbatim**
- [ ] Hero headline exact match
- [ ] Hero subheadline exact match
- [ ] CTA button text exact match
- [ ] No improvised or generated copy (Designed emailers)
- [ ] Correct brand font on EVERY text element (no Inter, no system defaults)
- [ ] No persona sign-off (Designed) / Has persona sign-off (Text-Based)

### Design
- [ ] Frame width = exactly 600px
- [ ] Brand background correct (SPA: cream `#fdf7ec`, NOT white)
- [ ] Hero gradient overlay present + text readable over hero image
- [ ] Alternating section colours correct per brand
- [ ] Text colours brand-correct (never pure black)

### Structure
- [ ] Wave dividers at ALL section transitions (no straight lines)
- [ ] CTAs: correct shape, fill, corner-radius, text style per brand spec
- [ ] 3+ CTAs placed (hero, mid-content, pre-footer)
- [ ] Fixed footer present, unmodified, flush at bottom
- [ ] Z-order verified — all layers in correct stacking

### Images
- [ ] Hero image fills full hero area
- [ ] Section images match content context
- [ ] Circular images: corner-radius = width/2
- [ ] No accidental placeholder boxes (except B/A awaiting real photos)

### Spacing
- [ ] No dead zones >80px between content blocks
- [ ] 20-30px breathing room maintained between elements
- [ ] Footer flush — no gap after last content section
- [ ] Frame height matches actual content extent

### Visual Polish
- [ ] Export at 0.5x — everything renders correctly
- [ ] Decorative elements subtle, not distracting
- [ ] Visual hierarchy guides the eye top → bottom
- [ ] Looks like THIS brand, not the other two

---

## PHASE 12: SAVE STATE

### 12.1 Write State File

Write/update `.tmp/emails/<brand>-emailers/FIGMA-FINISH-PROMPT.md` with:

1. **Connection** — channel ID
2. **Production frame** — ID, final dimensions
3. **Complete node map** — every element: name, node ID, type, position, size, notes
4. **Copy Manifest** — from Phase 1 (full verbatim copy)
5. **Image assignments** — element → source → node ID → status
6. **QC checklist** — all items checked with results
7. **Brand colours reference** — quick lookup table
8. **What's done** — completed phases and items
9. **What's remaining** — any outstanding work (B/A photos, decorative elements, etc.)
10. **Rules reminder** — 600px sacred, footer untouchable, waves only, no generated copy

This file enables: `/emailbaby <brand> <name> resume`

---

## BRAND QUICK REFERENCE

### SPA — Carisma Spa & Wellness

| Property | Value |
|----------|-------|
| Body BG | `#fdf7ec` warm cream (NEVER white) |
| Alt section BG | `#e8ded1` beige |
| CTA | 420x48, `#a88c4a` gold, 6px radius, white text + ">" |
| Accent | `#c4a659` gold |
| Text colour | `#3b3029` deep brown |
| Muted text | `#9b8d83` warm taupe |
| Hero gradient | `#1a140f` (0%→30%→65% opacity) |
| Headers | Trajan Pro 400 |
| Labels | Novecento Wide |
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

## ERROR RECOVERY

| Problem | Solution |
|---------|----------|
| Node not found | Figma page may not be loaded. Run `get_document_info` first to trigger load. |
| Insert fails | Clone to page level first, THEN `insert_child` into target frame. |
| Image not showing | Source node must have IMAGE fill type. Check with `get_node_info`. |
| Text font not loading | Use `load_font_async` BEFORE `set_font_name`. Always. |
| Frame clipping | All child positions must be within 0-600 (x) and 0-frameHeight (y). |
| Element invisible | Check z-order — probably behind a background rectangle. Use `reorder_node`. |
| Context window running out | Save state to FIGMA-FINISH-PROMPT.md immediately. Resume with `/emailbaby <brand> <name> resume`. |
| Wave looks wrong | Inspect wave frame children — the SVG vector is nested inside. Adjust fill on the child, not the frame. |

---

## QUICK START

When the user runs `/emailbaby spa TensionScience`:

1. Load figma-write MCP tools (batch via ToolSearch)
2. Join channel (ask user for channel ID if not provided)
3. Read `config/emailer-guidelines.md` + `spa/CLAUDE.md`
4. Check for `.tmp/emails/spa-emailers/FIGMA-FINISH-PROMPT.md`
5. If fresh → Phase 0 (orient, identify topic, draft copy) → Phase 1 (extract + scaffold)
6. If resume → read state file, skip to first incomplete phase
7. Work through all 13 phases sequentially, saving state after each
8. Present QC checklist to user before marking complete
