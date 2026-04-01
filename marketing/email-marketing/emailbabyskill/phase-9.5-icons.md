# Phase 9.5: Icon Style Matching & Generation

Between Phase 9 (decorative elements) and Phase 10 (z-order).
Uses Nano Banana MCP tools with `referenceImages` for style transfer.

## 9.5.1 Discover Existing Brand Icons

1. `mcp__figma-write__get_node_info` on Row 4 (Elements/Templates) for brand column
2. Identify icon-type elements in the children:
   - Small size (24-80px)
   - Vector-based or simple shapes
   - Single or dual color
   - Named with icon-like descriptors
3. Export 2-3 representative icons as PNG reference:
   ```
   mcp__figma-write__export_node_as_image(nodeId: "<icon_id>", format: "PNG", scale: 2)
   ```
   Save exported file paths — these are your style references for generation.

## 9.5.2 Analyze Icon Style

Build an **Icon Style Brief** from the exported reference icons:

| Property | Observed Value |
|----------|---------------|
| Style | outline / solid fill / duotone / gradient |
| Primary color | [brand accent color from spec] |
| Secondary color | [if duotone — often warm taupe `#9b8d83`] |
| Corners | rounded Npx / sharp |
| Stroke weight | thin (1px) / medium (2px) / bold (3px) |
| Visual weight | light / medium / heavy |
| Size range | Npx - Npx |
| Padding | Npx internal |

Save this brief — it guides ALL icon generation prompts.

## 9.5.3 Identify Icon Placement Needs

Scan Copy Manifest for sections that need visual anchors:

| Content Pattern | Icon Type | Examples |
|----------------|-----------|---------|
| Feature/benefit list | Icon per item | checkmark, star, shield |
| Process steps (numbered) | Sequential icons | numbered circles, arrows, flow |
| Treatment descriptions | Treatment icons | body silhouette, device, droplet |
| Contact/booking info | Info icons | phone, calendar, location pin |
| Trust/credential signals | Trust icons | certificate, medical cross, star rating |
| Social proof | Social icons | quote mark, star cluster |

**Restraint principle:** Only generate icons where the design NEEDS a visual anchor. Don't force icons into sections that work fine with text alone. If a section already has a decorative element from Phase 9, it probably doesn't need an icon too.

## 9.5.4 Generate Icons

For each needed icon, choose the best approach. **There are 3 options — A, B, and C. Option C (numbered text) is the fallback when AI generation fails.**

### Option A — Generate from Scratch (when no reference icons exist)

```
mcp__nano-banana__generate_image(prompt:
  "Minimal [style] icon of [concept].
   Color: [brand accent hex]. Background: transparent white.
   Style: clean vector, [rounded/sharp] corners, [stroke weight] lines.
   Size: [N]px square. Simple, single-concept, flat design.
   No text, no labels, no shadows.")
```

### Option B — Style Transfer from Brand Icons (PREFERRED when references exist)

```
mcp__nano-banana__edit_image(
  imagePath: "<exported_reference_icon_path>",
  prompt: "Generate a [concept] icon matching the exact visual style of this reference.
    Same line weight, same color treatment ([brand accent hex]), same corner style.
    Change only the subject to [concept]. Keep transparent background.
    Simple, minimal, single-concept.",
  referenceImages: ["<reference_icon_1>", "<reference_icon_2>"]
)
```

### Option C — Numbered Text Fallback (when Nano Banana is unavailable)

**Use this when:** Nano Banana returns errors (model not found, API key issues, 404s, etc.). Don't leave sections without visual anchors — numbered text is clean and professional.

1. **Load the font:** `mcp__figma-write__load_font_async(family: "Montserrat", style: "SemiBold")`
2. **Create numbered text nodes** for each list item:
   ```
   mcp__figma-write__create_text(
     x: <icon_x>,
     y: <item_y>,
     text: "1",
     fontSize: 20,
     fontWeight: 600,
     fontColor: {r: <brand_accent_r>, g: <brand_accent_g>, b: <brand_accent_b>, a: 1},
     textAlignHorizontal: "CENTER",
     width: 32,
     textAutoResize: "HEIGHT",
     name: "Num_1_<concept>"
   )
   ```
3. **Brand accent colors for numbers:**
   - SPA: `{r: 0.659, g: 0.549, b: 0.29}` (gold `#a88c4a`)
   - AES: `{r: 0.376, g: 0.471, b: 0.447}` (sage `#607872`)
   - SLIM: `{r: 0.290, g: 0.420, b: 0.349}` (forest green `#4a6b59`)
4. `insert_child` into production frame
5. `set_font_name` to Montserrat SemiBold
6. Position: same x/y as where icons would go (typically x=40, vertically aligned with labels)
7. **Shift adjacent labels right** to make room:
   - Move label and body text from x=40 to x=85 (45px right of number)
   - Reduce width by 45px to maintain right margin

**Result:** Clean numbered list that looks intentional, not like a failed icon attempt.

### Iterate if Needed (Options A & B only)

```
mcp__nano-banana__continue_editing(prompt:
  "Make the lines [thinner/thicker]. Change color to [hex]. Simplify the shape. Remove [element].")
```

## 9.5.5 Place Icons in Figma

For each generated icon:

1. **Get file path:**
   `mcp__nano-banana__get_last_image_info()` → file path

2. **Read as base64:**
   `Bash: base64 -i <file_path>`

3. **Create frame at target location:**
   ```
   mcp__figma-write__create_frame(
     parentId: "<section_frame>",
     x: <position>,
     y: <position>,
     width: <icon_size>,
     height: <icon_size>
   )
   ```

4. **Apply icon image:**
   ```
   mcp__figma-write__set_image_fill(
     nodeId: "<frame>",
     imageSource: "<base64>",
     sourceType: "base64",
     scaleMode: "FIT"
   )
   ```
   **scaleMode: FIT** — icons should NEVER crop. FIT ensures the full icon is visible.

5. **Rename for clarity:**
   `mcp__figma-write__rename_node(nodeId: "<frame>", name: "Icon_[concept]")`

6. **Verify alignment** with adjacent text elements using `get_node_info` on both icon and text.

## 9.5.6 Icon Placement Guidelines

| Position | Alignment | Spacing |
|----------|-----------|---------|
| Left of text heading | Vertically centered to heading baseline | 12-16px gap right |
| Above feature item | Horizontally centered above text | 8-12px gap below |
| Inline with list item | Vertically centered to first text line | 10-14px gap right |
| CTA flank (decorative) | Vertically centered to button | 8-12px gap each side |

**Size guidelines:**
- Inline with text: 24-32px
- Above feature: 36-48px
- Decorative accent: 20-28px
- **NEVER larger than 64px** — icons are accents, not features

## 9.5.7 Save Icon Inventory

Append to FIGMA-FINISH-PROMPT.md:

```
## ICON INVENTORY
Style Brief: [style] / [primary color] / [corners] / [stroke weight]
References: [exported icon paths]

| # | Concept | Prompt | Node ID | Position | Size | Status |
|---|---------|--------|---------|----------|------|--------|
| 1 | [concept] | [prompt used] | [id] | (x, y) | NxN | placed |
| 2 | [concept] | [prompt used] | [id] | (x, y) | NxN | placed |
```
