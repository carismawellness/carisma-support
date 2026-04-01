# Email Designer — QC Scoring System

16 core checks (/160) + 2 bonus (/10) = /170. Replaces pass/fail checklist with automated scoring.

**References:** `brands/<brand>.md` § Color Palette for brand-specific hex values and dimensions.

---

## Automated Checks

Run each check using Figma MCP tools. Score and log results.

### Check 1: FILE SIZE (102KB Gmail Limit) — /10

1. `mcp__figma-write__export_node_as_image(nodeId: "<production_frame>", format: "JPG", scale: 1)`
2. Check exported file size: `Bash: wc -c <exported_file>`
3. Score:
   - < 80KB = **10 pts** (safe margin)
   - 80-102KB = **5 pts** (approaching limit)
   - > 102KB = **0 pts** + **WARN: "Gmail will clip this email. Footer and unsubscribe link will be hidden."**
4. If > 102KB, suggest fixes:
   - Reduce image quality (re-export hero at lower resolution)
   - Remove non-essential decorative elements
   - Remove wave dividers if present (waves are optional)
   - Split emailer into two shorter emails

### Check 2: IMAGE INTEGRITY — /10

1. For each image node in production frame:
   `mcp__figma-write__get_image_from_node(nodeId: "<image_node>")` → verify has image fill
2. Check:
   - Image fill exists (not null/empty)
   - Dimensions > 0 (width and height both positive)
   - Image actually renders (no broken references)
3. Score: All images pass = **10 pts**, any fail = **0 pts** + list failing node IDs

### Check 3: DIMENSION — /10

1. `mcp__figma-write__get_node_info(nodeId: "<production_frame>")` → read width
2. Score: width == 600px = **10 pts**, else = **0 pts** (SACRED rule violated — showstopper)

### Check 4: TEXT READABILITY — /10

1. Verify Hero_Gradient_Overlay exists between hero image and hero text in z-order:
   - `get_node_info` on production frame → check children order
   - Hero text nodes must be ABOVE gradient overlay
2. Check text color contrast:
   - Hero text must be `#ffffff` (white) over gradient
   - Body text must be brand text color (see `brands/<brand>.md` § Color Palette) — never pure `#000000` black
3. Score: all readable = **10 pts**, missing gradient = **5 pts**, wrong text colors = **5 pts**

### Check 5: CTA COUNT — /10

1. Count CTA button elements in production frame
   - Identify by: rectangles with brand CTA fill color (see `brands/<brand>.md` § CTA Spec)
2. Verify placement positions:
   - Hero area CTA present?
   - Mid-content CTA present?
   - Pre-footer CTA present?
3. Score: 3+ CTAs = **10 pts**, 2 CTAs = **5 pts**, 0-1 CTAs = **0 pts**

### Check 6: SECTION DIVIDERS — /10

1. Check state file for WAVES_DECISION:
   - If `WAVES_SKIPPED` → score based on clean BG transitions (alternate path below)
   - If `WAVES_USED` or no decision recorded → score based on wave count (default path)

**Default path (waves expected):**
1. Count wave elements (named `Wave_*`) in production frame children
2. Count section transitions (alternating background color changes)
3. Score: waves >= transitions = **10 pts**, missing 1 = **7 pts**, missing 2+ = **3 pts**, none = **0 pts**

**Alternate path (waves intentionally skipped):**
1. Check section BG rectangles for clean transitions:
   - Adjacent section BGs overlap by 1-2px (no subpixel white gaps)?
   - No dead zone > 5px between adjacent BG rectangles?
   - Alternating colors match brand spec?
2. Score: clean transitions + no gaps = **10 pts**, 1-2 small gaps = **7 pts**, visible white bands = **3 pts**

### Check 7: FOOTER — /10

1. Check Fixed Footer exists as child of production frame (named `Fixed_Footer_*`)
2. Verify it's the last/bottommost element
3. Verify dimensions match source (within 5% tolerance) — see `brands/<brand>.md` § Grid Node IDs for expected footer height
4. Check footer flush: gap between last content element and footer wave top must be < 20px
5. Score: present + correct size + flush = **10 pts**, present + gap = **7 pts**, present + wrong size = **5 pts**, missing = **0 pts**

### Check 8: SPACING & OVERLAP — /10

1. `get_node_info` on production frame → get all children with positions
2. Sort by Y position
3. Calculate gaps between consecutive visible elements:
   - Gap > 80px = dead zone (deduction)
   - Gap < 10px = cramped (deduction)
   - Gap 15-40px = ideal (no deduction)
4. **Overlap detection:** For elements in the same section (within 200px Y range), check if any bounding boxes overlap:
   - Element A bottom (y + height) > Element B top (y) AND they share X range = **OVERLAP**
   - Specifically check: hero headline vs subheadline vs CTA — most common offenders
   - Any overlap = **-5 pts** per instance
5. Check footer flush: gap between last content element and footer top < 20px
6. Score: no issues = **10 pts**, 1-2 dead zones = **5 pts**, 3+ dead zones or any overlaps = **0 pts**

### Check 9: BRAND CONSISTENCY — /10

1. Verify production frame background color matches brand body BG (see `brands/<brand>.md` § Color Palette)
2. Verify CTA fill colors match brand spec
3. Verify alternating section BG colors match brand spec
4. Score: all match = **10 pts**, 1 mismatch = **5 pts**, 2+ mismatches = **0 pts**

### Check 10: DECORATIVE & ICONS — /10

1. Check decorative elements exist (see `brands/<brand>.md` § Decorative Elements for expected types/counts)
2. Check generated icons from Phase 9.5 are placed
3. Verify subtlety: opacity <= 0.5, size <= 64px for accents
4. Score: present + subtle = **10 pts**, present but oversized/loud = **5 pts**, completely missing = **3 pts**

---

### Check 11: LOGO VERIFICATION — /10

1. Search production frame children for nodes named `*Logo*` or `*logo*`
2. For each logo node found:
   a. Check node type — must be FRAME, GROUP, or COMPONENT (vector logo), NOT a plain TEXT node
   b. If type is TEXT → **FAIL** — text placeholder, not real logo
   c. Verify it was cloned from Row 1 source (see `brands/<brand>.md` § Grid Node IDs)
   d. Check dimensions are proportional (aspect ratio within 5% of source)
   e. Verify centred horizontally: `abs(x - (600 - width) / 2) < 10px`
3. Check placement context:
   - White logo variant over dark background (hero) → readable?
   - Brand colour logo over light background → readable?
4. Score:
   - Real logo from Row 1 + centred + correct variant = **10 pts**
   - Real logo but off-centre or wrong variant = **5 pts**
   - Text placeholder instead of logo = **0 pts**
   - No logo at all = **0 pts**

### Check 12: ELEMENT OVERLAP DETECTION — /10

1. Get all TEXT and RECTANGLE children of the production frame with their positions and sizes
2. Group elements by section (elements within 400px Y range of each other)
3. For each group, check all pairs for bounding box overlap:
   ```
   overlap = (A.y + A.height > B.y) AND (B.y + B.height > A.y) AND
             (A.x + A.width > B.x) AND (B.x + B.width > A.x)
   ```
4. **Critical overlaps** (auto-fail):
   - Text overlapping other text
   - Text overlapping CTA button
   - CTA button overlapping another CTA
5. **Acceptable overlaps** (ignore):
   - Gradient overlay on hero image (by design)
   - Wave dividers overlapping section backgrounds (by design)
   - Decorative elements slightly overlapping edges (by design)
6. For hero section specifically, verify vertical order with minimum gaps:
   - Logo → min 20px → Headline → min 10px → Subheadline → min 10px → CTA
7. Score:
   - No critical overlaps + hero ordered correctly = **10 pts**
   - 1 near-overlap (gap < 5px) = **5 pts**
   - Any actual overlap = **0 pts** + list overlapping node pairs

### Check 13: IMAGE SOURCE & RESOLUTION — /10

1. For each image node in production frame (Hero_BG, section images, circle icons):
   a. `get_image_from_node` → get source dimensions (width, height)
   b. Get display dimensions from `get_node_info`
   c. Calculate effective resolution: `source_dimension / display_dimension`
      - Ratio >= 2.0 = retina quality (**ideal**)
      - Ratio >= 1.0 = acceptable
      - Ratio < 1.0 = **UPSCALED / PIXELATED** — source too small
   d. **Hero image specifically:**
      - Source width must be >= 1200px (2x retina for 600px display)
      - Source height must be >= 600px (2x retina for 300-400px display)
      - If source < 600px in either dimension → **FAIL: will look pixelated**
2. Verify images were sourced from Image Bank:
   - Cross-reference placed image node IDs against known Image Bank rectangle IDs
   - If an image was NOT cloned from Image Bank and NOT from a known source → flag as "unknown source"
3. Score:
   - All images retina (2x+) + all from Image Bank = **10 pts**
   - All images 1x+ but some not retina = **7 pts**
   - Any image < 1x (pixelated) = **3 pts**
   - Hero image pixelated = **0 pts**

### Check 14: SEMANTIC IMAGE RELEVANCE — /10

1. For each image with an adjacent label (within 150px Y range):
   a. Export the image: `export_node_as_image(nodeId, format: "PNG", scale: 0.5)`
   b. Read the nearest text label content (above or below the image)
   c. **Visual-semantic check** — verify the image subject matches the label:
      - Export the image and visually inspect what it depicts
      - Compare against the label text
      - Flag mismatches (e.g., "Neck & Shoulders" label but image shows feet)
2. Check for duplicate images:
   - Same source image used in multiple places = **flag** (lazy, reduces perceived effort)
   - Exception: logo can appear twice (hero + pre-footer)
3. Score:
   - All images match their labels + no duplicates = **10 pts**
   - All match but has duplicate = **7 pts**
   - 1 semantic mismatch = **3 pts**
   - 2+ semantic mismatches = **0 pts**

### Check 15: DECORATIVE VARIETY & CRAFT — /10

1. **Element variety check:**
   - Count distinct decorative element types (different source node IDs)
   - See `brands/<brand>.md` § Decorative Elements for expected variants
   - Only 1 type used = **deduction**

2. **Size variety check:**
   - Collect all decorative element sizes (width × height)
   - Calculate size range: `max_size / min_size`
   - Ratio >= 2.0 = good variety
   - Ratio < 1.5 = too uniform

3. **Placement intentionality check:**
   - Elements should appear at section transitions, not randomly scattered
   - Check: are decoratives near section boundaries (within 50px of a wave or BG change)?
   - Check: are they mirrored/balanced (some left, some right)?
   - All on one side = **deduction**

4. **Beyond primary motif check:**
   - Are there additional design elements beyond the primary decorative?
   - Secondary accents (dividers, thin rules, accent shapes)
   - Primary-only = acceptable but not impressive

5. Score:
   - 3+ types + varied sizes + strategic placement = **10 pts**
   - 2 types + some variety = **7 pts**
   - 1 type + uniform sizes + random placement = **3 pts**
   - No decoratives at all = **0 pts**

### Check 16: SECTION COMPLETENESS — /10

1. **Cross-reference Copy Manifest against placed elements:**
   - For each section defined in the Copy Manifest, verify ALL expected elements exist:
     - Heading text → present?
     - Body text → present?
     - Image (if section calls for one) → present?
     - Icons (if section has a feature list) → present?
     - CTA (if section should have one) → present?

2. **Section-specific checks:**
   - **Hero:** Logo + image + gradient + headline + subheadline + CTA = 6 elements minimum
   - **Feature list sections:** Each feature needs icon/image + label + description
   - **Testimonial section:** Stars + quote + name + image
   - **Pre-footer:** Trust claim + CTA + adequate spacing to footer

3. **Image coverage check:**
   - Count total sections in emailer
   - Count sections that have at least one image
   - Image coverage ratio: `sections_with_images / total_sections`
   - Ratio >= 0.5 = good visual balance
   - Ratio < 0.3 = too text-heavy

4. Score:
   - All sections complete + image coverage >= 0.5 = **10 pts**
   - 1 section missing an expected element = **7 pts**
   - 2+ sections incomplete = **3 pts**
   - Major section entirely missing = **0 pts**

---

### Bonus Check 17: MOBILE PREVIEW — /5 bonus

1. **Export:** `mcp__figma-write__export_node_as_image(nodeId: "<production_frame>", format: "PNG", scale: 0.5)`

2. **Text Size Thresholds** — verify via `get_node_info` on each text node (`fontSize`):

   | Text Role | Minimum Design Size | At 0.5x Renders As | Verdict |
   |-----------|--------------------|--------------------|---------|
   | Body text | >= 14px | >= 7px | **FAIL** below 14px |
   | Section headings | >= 20px | >= 10px | **FAIL** below 20px |
   | Hero headline | >= 26px | >= 13px | **FAIL** below 26px |
   | CTA button text | >= 12px | >= 6px | **WARN** below 12px |
   | Labels / captions | >= 10px | >= 5px | **WARN** below 10px |

3. **CTA Tap Target Thresholds** — verify via `get_node_info` on CTA rectangle nodes:

   | Property | Minimum (design px) | Rationale |
   |----------|--------------------| ----------|
   | Height | >= 44px | Apple HIG / Material Design minimum tap target |
   | Width | >= 200px | Must be easily tappable |
   | Gap above CTA | >= 20px | Prevents accidental taps |
   | Gap below CTA | >= 20px | Same |

4. **Image Thresholds** — verify via `get_node_info` dimensions:

   | Image Type | Minimum (design px) | Rationale |
   |------------|------------------------------|-----------|
   | Hero image height | >= 250px | Below this, hero feels cramped |
   | Section images | >= 100px smallest dimension | Below this, detail is lost |
   | Circular crops | >= 50px diameter | Below this, faces become unrecognizable |

5. **Layout Thresholds:**
   - All elements: `x >= 0` and `x + width <= 600` (no horizontal overflow)
   - Text content padding: `x >= 20` and `x + width <= 580` (minimum 20px margins)
   - Vertical gap between sections: >= 15px
   - No element width > 600px

6. **Scoring:**
   - All thresholds pass = **+5 pts** bonus
   - 1-2 WARNs only (no FAILs) = **+3 pts**
   - Any FAIL = **+0 pts** + list each failing element

### Bonus Check 18: LINE HEIGHT — /5 bonus

1. For body text elements, verify line-height ratio (see `brands/<brand>.md` § Typography for exact values)
   - Best practice range: 1.3 - 1.8
2. Flag ratios below 1.3 (cramped) or above 1.8 (too spread)
3. Score: all in range = **+5 pts** bonus, any out of range = **+0 pts**

---

## Score Card Template

```
====================================================
  EMAIL DESIGNER QC SCORE CARD v1.0
  [Emailer Name] — [Brand] — [Date]
====================================================
  STRUCTURAL (Checks 1-10)
  1.  File Size (102KB)     [X/10]  [size: NKB]
  2.  Image Integrity       [X/10]  [N images checked]
  3.  Dimensions (600px)    [X/10]  [actual: Npx]
  4.  Text Readability      [X/10]  [gradient: Y/N]
  5.  CTA Count             [X/10]  [N CTAs found]
  6.  Wave Dividers         [X/10]  [N/N transitions]
  7.  Footer                [X/10]  [present: Y/N, flush: Y/N]
  8.  Spacing & Overlap     [X/10]  [N dead zones, N overlaps]
  9.  Brand Consistency     [X/10]  [BG: Y/N, CTA: Y/N]
  10. Decorative/Icons      [X/10]  [N elements]
  ---------------------------------------------------
  STRUCTURAL SCORE:         [X/100]

  DESIGN QUALITY (Checks 11-16)
  11. Logo Verification     [X/10]  [type: real/text/missing]
  12. Overlap Detection     [X/10]  [N critical overlaps]
  13. Image Resolution      [X/10]  [hero: NxN, ratio: N.Nx]
  14. Semantic Relevance    [X/10]  [N/N images match labels]
  15. Decorative Variety    [X/10]  [N types, size range: N-Npx]
  16. Section Completeness  [X/10]  [N/N sections complete]
  ---------------------------------------------------
  DESIGN QUALITY SCORE:     [X/60]

  COMBINED CORE SCORE:      [X/160]

  BONUS
  17. Mobile Preview        [+X/5]  [readable: Y/N]
  18. Line Height           [+X/5]  [ratios listed]
  ---------------------------------------------------
  TOTAL SCORE:              [X/170]

  VERDICT: [PRODUCTION READY / MINOR FIXES / REWORK]
====================================================
```

## Thresholds

**Core score thresholds (/160):**
- **144+ (90%):** PRODUCTION READY — present to user for final human approval
- **112-143 (70-89%):** MINOR FIXES — list specific failing checks, fix them, re-run scoring
- **<112 (<70%):** SIGNIFICANT REWORK — identify root causes, return to relevant phase, fix, re-score. Escalate to Email Marketing Strategist.

**Design Quality sub-score thresholds (/60):**
- **48+ (80%):** Design quality acceptable
- **<48:** Design needs creative attention — even if structural checks pass, flag for review

---

## Manual QC Checklist (Second Layer)

After automated scoring, ALSO run this manual checklist:

**Copy Integrity:**
- [ ] All text matches Copy Manifest from Phase 1 — verbatim
- [ ] No improvised or generated copy (Designed emailers)
- [ ] Correct brand font on EVERY text element (no Inter, no system defaults)
- [ ] No persona sign-off (Designed) / Has persona sign-off (Text-Based)

**Visual Polish:**
- [ ] Visual hierarchy guides the eye top → bottom
- [ ] Decorative elements subtle, not distracting
- [ ] Looks like THIS brand, not the other two
- [ ] Overall aesthetic quality — would you be proud to send this?

---

## Issue-to-Check Mapping

| Issue | Caught By | Why It Was Missed Before |
|-------|-----------|------------------------|
| Text placeholder instead of real logo | Check 11 (Logo) | Old system only checked if "a logo exists" |
| Hero CTA overlapping subheadline | Check 12 (Overlap) | Old spacing check only measured gaps, not overlaps |
| Pixelated/low-res hero image | Check 13 (Resolution) | Old image check only verified fill exists, not resolution |
| Hero image not from Image Bank | Check 13 (Resolution) | No source verification existed |
| Circle images don't match labels | Check 14 (Semantic) | No content-matching check existed |
| Same image used twice | Check 14 (Semantic) | No duplicate detection existed |
| All petals same size/type | Check 15 (Variety) | Old check only counted quantity, not variety |
| No image in testimonial section | Check 16 (Completeness) | No section completeness check existed |
| White gap above footer | Check 7 + Check 8 | Footer flush check enhanced |

---

## Save Score

Append the complete score card to `.tmp/emails/<brand>-emailers/FIGMA-FINISH-PROMPT.md` under `## QC Score Card`.
