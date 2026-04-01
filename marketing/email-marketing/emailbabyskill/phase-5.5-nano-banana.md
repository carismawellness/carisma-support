# Phase 5.5: Nano Banana Image Generation (Fallback)

Triggered when Phase 1.5 flagged sections with no Image Bank match.
Uses **MCP tools** (`mcp__nano-banana__*`), NOT CLI commands.

> **IMPORTANT:** Nano Banana fallback for IMAGES is "ask the user" (not numbered text). Numbered text (Phase 9.5 Option C) is the fallback for ICONS only. These are different failure paths.

## Prerequisites

Before generating, check Nano Banana is configured:
`mcp__nano-banana__get_configuration_status()` → verify API key is set.
If not configured, WARN the user and skip to "Ask the user" fallback.

## 5.5.1 Hero Image Generation

When Image Bank has no suitable hero image:

### Step 1 — Build Prompt

Construct from Copy Manifest hero section:

```
Professional [brand] wellness photography.
Subject: [topic extracted from hero headline].
Model: woman 30-45, natural appearance, Mediterranean setting.
Lighting: soft natural, golden hour feel.
Composition: horizontal landscape, 3:2 aspect ratio, centered subject.
Style: editorial quality, lifestyle photography, no text overlays, no watermarks.
[Brand modifier]
```

**Brand modifiers:**
- **SPA:** "Warm golden tones, luxury spa atmosphere, cream and gold palette, serene and peaceful mood, poolside or hammam or treatment room setting, Mediterranean architecture"
- **AES:** "Clean clinical elegance, sage green accents, modern minimalist aesthetic, bright airy space, treatment room or consultation setting, professional medical atmosphere"
- **SLIM:** "Vibrant healthy lifestyle, forest green tones, empowering and confident mood, active wellness setting, natural light, Mediterranean backdrop"

### Step 2 — Generate

```
mcp__nano-banana__generate_image(prompt: "<built prompt>")
```

### Step 3 — Get File Path

```
mcp__nano-banana__get_last_image_info()
```
Returns: file path, dimensions, format

### Step 4 — Read as Base64

```bash
base64 -i <file_path>
```
Capture the output. Verify it's under ~5MB (the `set_image` limit).

### Step 5 — Place in Figma

```
mcp__figma-write__set_image_fill(
  nodeId: "<hero_frame>",
  imageSource: "<base64_data>",
  sourceType: "base64",
  scaleMode: "FILL"
)
```

### Step 6 — Center Subject

```
mcp__figma-write__apply_image_transform(
  nodeId: "<hero_frame>",
  scaleMode: "FILL",
  scale: 1.0,
  translateY: <center_offset>
)
```

### Step 7 — Verify

`mcp__figma-write__export_node_as_image(nodeId: "<hero_frame>", scale: 0.5)` → check:
- Subject visible and centered
- No artifacts or distortion
- Style matches brand aesthetic

### Step 8 — Iterate If Needed

If the result isn't right:
```
mcp__nano-banana__continue_editing(prompt: "Adjust: [specific fix — e.g., 'more warm tones', 'zoom out slightly', 'face more centered']")
```
→ Get new file path → base64 → re-apply to Figma → re-verify

### Step 9 — Apply Brand Filters

Run Phase 5.3 brand image filters on the generated image.

## 5.5.2 Section Image Generation

Same workflow as hero but:
- Prompt sized for section context: "Close-up of [treatment/concept from section heading]"
- Dimensions match section frame size (not always 600px wide)
- May be portrait for sidebar placements or square for circular crops
- Same brand modifiers apply

## 5.5.3 Update Image Inventory

Mark generated images in FIGMA-FINISH-PROMPT.md:

```
| Section | Source | Prompt Used | Node ID | Status |
|---------|--------|-------------|---------|--------|
| Hero | nano-banana | "Professional SPA wellness..." | [id] | generated |
| Section 3 | nano-banana | "Close-up CoolSculpting..." | [id] | generated |
```

## 5.5.4 Failure Recovery Tree

When Nano Banana fails, follow this decision tree IN ORDER:

### Failure 1: Configuration Error
**Symptoms:** `get_configuration_status` returns no API key, or any call returns 401/403.
**Action:** WARN user → skip ALL Nano Banana generation → use numbered text fallback (Phase 9.5 Option C) for icons. For hero/section images, escalate to "Ask the user" with specifics:
```
Image needed for [section]. Nano Banana is not configured.
Options: (1) provide an image file, (2) point me to a URL, (3) skip this image
```

### Failure 2: Model Not Found / 404
**Symptoms:** `generate_image` returns 404, "model not found", or similar routing error.
**Action:** Try ONCE with `continue_editing` (sometimes the model loads on retry). If second attempt also 404s → treat as Configuration Error (Failure 1 path).

### Failure 3: Generation Timeout / Server Error (500/502/503)
**Symptoms:** Call hangs >60 seconds or returns 5xx error.
**Action:** Wait 10 seconds → retry ONCE. If second attempt also fails → log the error → skip this image → mark section as UNMATCHED in Image Inventory → continue with next section. Come back at end of Phase 5 to ask user about all skipped images at once (batch the requests, don't ask one-by-one).

### Failure 4: Image Too Large for Figma (>5MB base64)
**Symptoms:** `set_image_fill` fails with size error, or base64 output exceeds ~6.7MB (which encodes to >5MB).
**Action:**
1. `continue_editing(prompt: "Simplify the image. Reduce detail and complexity. Fewer elements, cleaner composition.")` → re-check size
2. If still too large → resize the source image using Bash: `sips --resampleWidth 1200 <file_path>` → re-encode to base64
3. If still too large after resize → fall back to a simpler generation prompt (remove "editorial quality" and "Mediterranean setting" — these add complexity)

### Failure 5: Unusable Results After 3 Iterations
**Symptoms:** You've called `generate_image` + 2x `continue_editing` and the result still doesn't match (wrong subject, artifacts, style mismatch).
**Action:** STOP iterating. 3 attempts is the maximum. Mark section as MANUAL_IMAGE_NEEDED in Image Inventory → batch with other skipped images for user at end of Phase 5.

### End-of-Phase Batch Request
After all image placements are complete (Phase 5 + 5.5), if ANY sections are marked UNMATCHED or MANUAL_IMAGE_NEEDED:
```
The following sections need images that I couldn't source automatically:
1. [Section name] — [reason: no match / Nano Banana failed / too large]
2. [Section name] — [reason]
Would you like to: (a) provide images, (b) skip these sections, (c) use placeholder rectangles?
```
