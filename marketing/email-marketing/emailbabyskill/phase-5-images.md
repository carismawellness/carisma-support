# Phase 5: Images

**First:** Read `phases/phase-1.5-image-discovery.md` and execute image discovery (enumerate Image Bank, match to sections, build Image Inventory). Then proceed with placement below.

Every image placement MUST include THREE checks:
1. **Resolution check** — source must be large enough (hero ≥1200px wide for retina)
2. **Dimension check** — aspect ratio vs target, correct scaleMode
3. **Semantic relevance check** — export after placing, visually confirm image matches its label/section context

## 5.1 Hero Image

### If Image Bank match exists:
1. `mcp__figma-write__clone_node(nodeId: "<matched_image_id>")`
2. `mcp__figma-write__insert_child(parentId: "<production_frame>", childId: "<cloned>")`
3. `mcp__figma-write__move_node` to hero position (x: 0, y: hero_start)
4. `mcp__figma-write__resize_node` to 600 x 300-450px

### Resolution Check (MANDATORY — this prevents pixelation):
5. `mcp__figma-write__get_image_from_node(nodeId: "<placed_image>")` → read source dimensions
6. **Calculate retina ratio for BOTH dimensions:**
   - `width_ratio = source_width / display_width`
   - `height_ratio = source_height / display_height`
   - `retina_ratio = min(width_ratio, height_ratio)` — always use the SMALLER of the two
7. **Apply resolution tiers:**

   | Tier | Retina Ratio | Action |
   |------|-------------|--------|
   | **Ideal** | ≥ 2.0x | Use as-is. Crisp on retina displays. |
   | **Acceptable** | ≥ 1.5x | Use. Slight softness on retina, fine on standard. Log as "non-retina" in Image Inventory. |
   | **Minimum** | ≥ 1.0x | Use ONLY if no better source exists. Will look soft on retina. Log warning in Image Inventory. |
   | **Reject** | < 1.0x | **REJECT.** Image will be visibly pixelated. Find a larger source from Image Bank or flag for Nano Banana. |

   - **Reconciliation:** The ≥1200px width rule (Phase 1.5) is the hard minimum for hero selection. The retina ratio is the quality target. Both must pass:
     1. Source width must be ≥ 1200px (non-negotiable floor)
     2. Retina ratio should be ≥ 2.0x in BOTH dimensions (quality target)
     3. If width passes but height ratio < 2.0x, the image is acceptable but log as "height-limited retina" in Image Inventory
   - **Hero images:** target ≥ 2.0x (source ≥ 1200×600 for 600×300 display). Accept ≥ 1.5x if no better option. Never accept < 1.0x.
   - **Section images:** target ≥ 2.0x. Accept ≥ 1.0x for non-hero placements.
   - **Circular crops:** target ≥ 2.0x of the circle diameter (e.g., 120px circle needs ≥ 240px source in smallest dimension).
8. Calculate source aspect ratio vs target aspect ratio (600 : hero_height)
9. Apply correct scale mode:
   - Source wider than target → `scaleMode: FILL` (safe, crops top/bottom evenly)
   - Source taller than target → `scaleMode: FILL` + `apply_image_transform(translateY: <negative_offset>)` to center subject vertically
   - Source matches target → `scaleMode: FILL` (default, no transform needed)
   - **NEVER use FIT for hero** — FIT leaves visible gaps at edges
10. `mcp__figma-write__apply_image_transform(nodeId: "<image>", scaleMode: "FILL", scale: 1.0, translateY: <center_offset>)`
   - To center: `translateY = -(source_height * scale - target_height) / 2`
   - To show upper portion (faces): use smaller negative translateY

### If NO Image Bank match:
→ Skip to **Phase 5.5 (Nano Banana Generation)**

### Verify (MANDATORY — all three checks):
11. `mcp__figma-write__export_node_as_image(nodeId: "<hero_frame>", scale: 0.5)` → visually confirm:
   - **No pixelation** — image looks sharp at 0.5x scale (simulates retina display)
   - **No distortion** — faces not stretched, objects not squished
   - **Subject centered** in visible area
   - **Full coverage** — no gaps, no white edges
   - **Semantic match** — the image depicts what the section is about (e.g., hero for a "tension" emailer should show massage/relaxation, not food)
   - If issues detected: adjust `apply_image_transform` scale/translateY and re-verify
   - If pixelated: go back to Image Bank, pick a larger source image

## 5.2 Section Images

For each section with an image assignment from Phase 1.5:

### Place & Check:
1. `clone_node` → `insert_child` → `move_node` → `resize_node`
2. `mcp__figma-write__get_image_from_node` → check source dimensions
   - Calculate retina ratio: `min(source_width / display_width, source_height / display_height)`
   - Apply the same resolution tiers as section 5.1 step 7 (Ideal ≥ 2.0x, Acceptable ≥ 1.5x, Minimum ≥ 1.0x, Reject < 1.0x)
   - For section images: accept ≥ 1.0x (non-hero images are less critical than hero)
3. Choose scaleMode based on source orientation:

| Source Shape | Target Shape | Scale Mode | Transform |
|-------------|-------------|------------|-----------|
| Landscape (W > H) | Full-width rectangle | FILL | None needed |
| Portrait (H > W) | Full-width rectangle | FILL | `translateY` to center face/subject |
| Square (W = H) | Full-width rectangle | FILL | None needed |
| Any | Circular crop | FILL | `scale: 1.2`, `translateY` to center face |

### Circular Crops:

a. `mcp__figma-write__create_ellipse` OR `create_rectangle` at target size
b. `mcp__figma-write__set_corner_radius` = width / 2 (makes it a circle)
c. `mcp__figma-write__set_image_fill(nodeId: "<circle>", imageSource: "<source>", sourceType: "base64", scaleMode: "FILL")`

d. **Orientation-aware transform** — the source aspect ratio determines the correct scale and offset:

   | Source Orientation | Aspect Ratio | Scale | translateY | Why |
   |-------------------|-------------|-------|------------|-----|
   | **Landscape** (W > H) | e.g., 1200×800 | 1.2 | 0 to -0.1 | Width fills circle. Subject usually centered. Minor Y adjust for framing. |
   | **Square** (W ≈ H) | e.g., 800×800 | 1.2 | 0 | Perfect fit. Slight zoom for tighter crop. |
   | **Portrait** (H > W) | e.g., 800×1200 | 1.0 | -0.15 to -0.25 | Width fills circle but height is cropped heavily. Pull UP (negative translateY) to show face, not torso. |
   | **Tall portrait** (H > 1.5×W) | e.g., 600×1200 | 0.9-1.0 | -0.2 to -0.35 | Very tall crop. May need to zoom OUT slightly (scale < 1.0) to show more of the subject, then offset to face. |

e. Apply transform:
   ```
   mcp__figma-write__apply_image_transform(
     nodeId: "<circle>",
     scaleMode: "FILL",
     scale: <from table>,
     translateY: <from table>
   )
   ```

f. **ALWAYS verify circular crops:** `export_node_as_image` at 1x scale → confirm:
   - Face/subject is CENTERED in the circle (not cut off at forehead or chin)
   - No awkward cropping (half a face, only hair, only body without head)
   - If face is cut off: adjust `translateY` by ±0.05 increments and re-verify
   - If subject is too small in circle: increase `scale` by 0.1 and re-verify
   - **Maximum 3 adjustment iterations** — if it still doesn't look right after 3 tries, the source image may not be suitable for circular crop. Try a different Image Bank source.

### Semantic Relevance Check for Section Images (MANDATORY):

After placing each section image or circular crop, verify it matches its context using the structured process below.

#### Step 1: Export & Identify
1. `export_node_as_image(nodeId, format: "PNG", scale: 0.5)`
2. Read the nearest label/heading text — what section is this image supposed to represent?
3. Describe what the image ACTUALLY shows in 5-10 words (e.g., "woman receiving facial massage, eyes closed")

#### Step 2: Rate Match Confidence

| Confidence | Criteria | Action |
|-----------|---------|--------|
| **HIGH** | Image subject directly depicts the label topic (e.g., "Neck & Shoulders" label + image of neck/shoulder massage) | Proceed. No further action. |
| **MEDIUM** | Image is thematically related but not exact (e.g., "Nervous System" label + image of woman meditating — related to calm/relaxation but not literally the nervous system) | Proceed, but log as "thematic match" in Image Inventory. |
| **LOW** | Image is from the right domain but wrong subject (e.g., "Neck & Shoulders" label + image of foot massage — both are massage, but wrong body part) | **SWAP.** Find a better match from Image Bank. If no better option exists, escalate to user. |
| **MISMATCH** | Image is clearly wrong (e.g., food photo next to treatment label, male photo for female testimonial, outdoor landscape for clinical section) | **REJECT immediately.** Find correct image or flag for Nano Banana. |

#### Step 3: Specific Match Rules
- **Body area labels** ("Neck & Shoulders", "Lower Back", "Full Body") → image must show that specific body area being treated
- **Treatment labels** ("CoolSculpting", "EMSculpt", "VelaShape") → image should show the device, treatment in progress, or treatment area
- **Mood/concept labels** ("Nervous System", "Stress Relief", "Inner Calm") → thematic match is acceptable (MEDIUM confidence OK)
- **Testimonial photos** → must match attributed name's gender. Female names (Maria, Sarah, Anna) → female photo. Male names → male photo.
- **No duplicate images** across sections (exception: logo)

#### Step 4: Human Checkpoint (when needed)
If you have 2+ LOW-confidence matches in a single emailer, or ANY match you're uncertain about, pause and ask:
```
Image matching checkpoint — [Emailer Name]:
These image-section pairings need your review:
1. [Section label] → [image description] (confidence: LOW — [reason])
2. [Section label] → [image description] (confidence: LOW — [reason])
Approve, swap, or provide alternatives?
```
Do NOT silently proceed with multiple uncertain matches.

**Common traps:**
- Image Bank photos with generic names like "Day1-87" don't tell you what they depict — always export and visually check
- A photo of a foot massage is NOT suitable for "Neck & Shoulders" even if both are massage photos
- A photo of a man is NOT suitable for a testimonial attributed to "Maria T."
- Spa lifestyle shots (pools, candles) are NOT suitable for specific treatment sections — they're only good for hero or ambient sections

### Before/After Placeholders (AES/SLIM):
- Create rectangles: 130x160px, corner-radius 8px
- Fill: `#d9d1c7` placeholder gray
- Thin stroke: `#bfd4cc` at 40% opacity
- Labels: "BEFORE" and "AFTER" in Montserrat Medium 9px
- **Leave as placeholders** — real B/A photos are added manually

## 5.3 Brand Image Filters

Apply AFTER all images are placed. Subtle color grading per brand using `mcp__figma-write__set_image_filters`:

| Brand | Temperature | Saturation | Contrast | Exposure | Visual Effect |
|-------|-------------|------------|----------|----------|---------------|
| SPA | +0.10 | -0.10 | 0 | 0 | Warm, soft, luxurious |
| AES | 0 | 0 | +0.05 | +0.05 | Clean, clinical, bright |
| SLIM | 0 | +0.10 | +0.05 | 0 | Vibrant, healthy, energetic |

For each image node:
```
mcp__figma-write__set_image_filters(
  nodeId: "<image_node>",
  temperature: X,
  saturation: Y,
  contrast: Z,
  exposure: W
)
```

**Do NOT over-filter.** These are subtle brand-tone adjustments, not Instagram presets. Values above should be treated as starting points — adjust by ±0.05 if the result looks unnatural.

### Filter Verification (MANDATORY after applying filters):

1. **Export each filtered image** at 0.5x: `export_node_as_image(nodeId: "<image>", scale: 0.5)`
2. **Check for these problems:**
   - **Orange/yellow cast** (SPA) → reduce temperature to +0.05 or 0
   - **Over-saturated / neon tones** (SLIM) → reduce saturation to +0.05 or 0
   - **Washed out / too bright** (AES) → reduce exposure to 0
   - **Skin tones unnatural** (all brands) → the most important check. Human skin should look healthy, not tinted. If skin looks orange, green, or grey → reset ALL filters to 0 for that image
   - **Already-warm source + warm filter = too warm** → if the source image was already golden/warm, skip the temperature adjustment entirely
3. **If any image looks over-filtered:** reset that image's filters to 0 (neutral) and try a reduced set:
   ```
   set_image_filters(nodeId, temperature: 0, saturation: 0, contrast: +0.05, exposure: 0)
   ```
   A subtle contrast-only boost is always safe. Temperature and saturation are where problems occur.
4. **Log filter decisions** in the state file for reproducibility:
   ```
   | Image | Applied Filters | Adjusted? | Notes |
   |-------|----------------|-----------|-------|
   | Hero | temp +0.10, sat -0.10 | No | Looked natural |
   | Section 2 | temp 0, sat 0, contrast +0.05 | Yes — original too warm | Reset temp, kept contrast |
   ```

## 5.4 Hero Gradient Overlay Check

After placing hero image, VERIFY the gradient overlay is still on top:
1. `mcp__figma-write__get_node_info` on production frame → check `children` order
2. `Hero_Gradient_Overlay` MUST be above `Hero_BG_Image` in z-order
3. If not: `mcp__figma-write__reorder_node` to fix
4. Hero text must be readable over the gradient — `export_node_as_image` and verify
