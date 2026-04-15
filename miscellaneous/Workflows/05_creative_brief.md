# 05 - Creative Brief Generation

## Objective

Transform approved scripts into actionable production briefs. Each brief is classified as either automated (Creatomate for video, Figma for static) or manual (CapCut for video, human design for static). Briefs include all details needed for production: shot lists, timing, overlays, music direction, text specifications, and image requirements.

## Required Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `.tmp/scripts/script_{brand}_{offer}_{format}_{date}.json` | Workflow 04 output | Approved scripts (only those that passed Gate 2) |
| `.tmp/scripts/index_{brand}_{date}.json` | Workflow 04 output | Script index with approval status |
| `config/brands.json` | Manual config | Brand colours, fonts, logo references |
| `config/script_frameworks.json` | Manual config | Framework details including production type |

## Tools Used

| Tool | Purpose |
|------|---------|
| `tools/generate_creative_brief.py` | Generate structured production briefs from scripts |

## Step-by-Step Procedure

### Step 1: Filter to Approved Scripts Only

1. Read `.tmp/scripts/index_{brand}_{date}.json`
2. Select only scripts with status `approved`
3. Load the full script JSON for each approved script
4. Skip any scripts with status `revise` or `rejected`

### Step 2: Classify Production Method

For each approved script, determine the production method:

| Format | Production Method | Tool/Platform | Criteria |
|--------|------------------|---------------|----------|
| `ugc_hook_body_cta` | **Manual** | CapCut | Requires talent on camera |
| `founder_led` | **Manual** | CapCut | Requires founder filming |
| `testimonial` | **Manual** | CapCut | Requires customer footage |
| `before_after` | **Automated** | Creatomate | Slideshow of images with text |
| `static_offer` | **Automated** | Figma + template | Text overlays on template |
| `text_overlay_video` | **Automated** | Creatomate | Text animations over stock/own footage |
| `winner_repackage` | **Automated** | Creatomate | Re-edit of existing winner with new hook |

Classification output:
- `automated/` -- can be produced by the system without human involvement
- `manual/` -- requires human filming, editing, or design work

### Step 3: Generate Video Briefs (Manual - CapCut)

For scripts classified as manual video production:

Run `tools/generate_creative_brief.py`:

```
--script ".tmp/scripts/script_{brand}_{offer}_{format}_{date}.json"
--production_type "manual_video"
--brand_id "<brand_id>"
--brands_config "config/brands.json"
--output ".tmp/briefs/brief_{ad_name}_{date}.md"
```

Brief contents:

```markdown
# Creative Brief: {ad_name}
## Production Type: Manual Video (CapCut)

### Overview
- Brand: {brand_name}
- Format: {format_name}
- Offer: {offer_name}
- Total Duration: {duration}s
- Aspect Ratio: 9:16 (vertical, Stories/Reels)
- Also export: 1:1 (Feed), 16:9 (optional, in-stream)

### Shot List

| # | Section | Duration | Script | Visual Direction | Shot Type |
|---|---------|----------|--------|-----------------|-----------|
| 1 | Hook | 4s | "When was the last..." | Direct to camera, natural light | Medium close-up |
| 2 | Problem | 6s | "Between work, the kids..." | Walking, daily routine | Wide to medium |
| 3 | Solution | 9s | "That's why I booked..." | Spa interior, treatments | B-roll montage |
| 4 | Proof | 5s | "I went last month..." | Talent refreshed, smiling | Close-up |
| 5 | CTA | 4s | "Book your spa day..." | Logo, link overlay | Static end card |

### Talent Direction
- Tone: Conversational, like talking to a friend
- Energy: Warm, genuine, not performative
- Wardrobe: Casual, relatable (not glam)
- Setting: Home or outdoor, then transition to spa

### Text Overlays
| Timestamp | Text | Position | Style |
|-----------|------|----------|-------|
| 0:00-0:04 | "When was the last time you did something just for you?" | Bottom third | White text, drop shadow |
| 0:19-0:28 | "Spa Day Package | EUR 89" | Centre | Brand font, highlight colour |
| 0:24-0:28 | "Book Now - Link Below" | Bottom | CTA button style |

### Music & Audio
- Style: Lo-fi, calm, uplifting
- Volume: Under talent voice, 20-30% mix
- Suggested: Royalty-free lo-fi beats (Epidemic Sound or similar)
- SFX: Soft transition swoosh between sections

### Brand Elements
- Logo: End card, bottom right, 3 seconds
- Colours: Use brand palette for text overlays
- Font: Brand font for all on-screen text
- Watermark: None (Meta ads don't need watermarks)

### Delivery Specs
- Resolution: 1080x1920 (9:16 primary)
- Frame rate: 30fps
- Format: MP4, H.264
- Max file size: 100MB
- Thumbnail: Extract frame at 0:01 (hook moment)
```

### Step 4: Generate Video Briefs (Automated - Creatomate)

For scripts classified as automated video production:

Brief contents focus on Creatomate template parameters:

```markdown
# Creative Brief: {ad_name}
## Production Type: Automated Video (Creatomate)

### Template Selection
- Template ID: {creatomate_template_id}
- Template Name: {template_name}
- Duration: {duration}s

### Dynamic Fields
| Field Name | Value | Notes |
|-----------|-------|-------|
| headline_text | "The best spa experience in Malta" | Max 40 characters |
| body_text | "Full day package: massage, facial, pool" | Max 80 characters |
| price_text | "EUR 89" | From offers.json |
| cta_text | "Book Your Spa Day" | From offers.json |
| logo_url | "{brand_logo_url}" | PNG with transparency |
| background_video | "{stock_footage_url}" | Spa/wellness footage |
| brand_colour_primary | "#XXXXXX" | From brands.json |
| brand_colour_secondary | "#XXXXXX" | From brands.json |

### Render Settings
- Resolution: 1080x1920 (9:16)
- Also render: 1080x1080 (1:1)
- Format: MP4
- Quality: High
```

### Step 5: Generate Static Briefs (Figma Template)

For static offer format scripts:

```markdown
# Creative Brief: {ad_name}
## Production Type: Automated Static (Figma)

### Template
- Figma file: {figma_file_url}
- Frame name: {template_frame_name}
- Size: 1080x1080 (Feed), 1080x1920 (Story)

### Text Layers
| Layer Name | Current Text | New Text | Font | Size |
|-----------|-------------|----------|------|------|
| headline | [placeholder] | "When was the last time you did something just for you?" | Brand Font Bold | 32px |
| subheadline | [placeholder] | "Spa Day Package - EUR 89" | Brand Font Regular | 24px |
| body | [placeholder] | "Massage, facial, and pool access included" | Brand Font Light | 18px |
| cta | [placeholder] | "Book Now" | Brand Font Bold | 20px |

### Image Layers
| Layer Name | Current | New Image Required | Source |
|-----------|---------|-------------------|--------|
| hero_image | placeholder.jpg | Spa treatment room photo | Brand photo library |
| bg_pattern | pattern.png | No change | Keep template default |

### Automation Classification
- **Text-only changes:** Can be automated via Figma MCP
- **Image swaps needed:** Requires human to source and place images
- **This brief:** {text_only | needs_image_swap}

### Colour Overrides
| Element | Template Colour | Override Colour | Notes |
|---------|----------------|----------------|-------|
| CTA button | #default | Brand primary | Match brand palette |
| Background | #default | No change | Keep template default |
```

### Step 6: Organise Output

Create briefs in an organised directory structure:

```
.tmp/briefs/
  automated/
    brief_CS_SpaDay_TextOverlay_v1_20260215.md
    brief_CS_GiftVoucher_Static_v1_20260215.md
  manual/
    brief_CS_SpaDay_UGC_Question_v1_20260215.md
    brief_CA_Botox_FounderLed_v1_20260215.md
```

Generate a brief index:

```json
{
  "brand_id": "carisma_spa",
  "generated_date": "2026-02-15",
  "total_briefs": 10,
  "automated": 4,
  "manual": 6,
  "briefs": [
    {
      "brief_id": "brief_CS_SpaDay_UGC_Question_v1_20260215",
      "script_id": "CS_SpaDay_UGC_Question_20260215_v1",
      "production_type": "manual_video",
      "platform": "CapCut",
      "file": ".tmp/briefs/manual/brief_CS_SpaDay_UGC_Question_v1_20260215.md",
      "status": "pending_review"
    }
  ]
}
```

## Expected Outputs

| Output | Path | Description |
|--------|------|-------------|
| Automated briefs | `.tmp/briefs/automated/brief_{ad_name}_{date}.md` | Briefs for system-produced creatives |
| Manual briefs | `.tmp/briefs/manual/brief_{ad_name}_{date}.md` | Briefs for human-produced creatives |
| Brief index | `.tmp/briefs/index_{brand}_{date}.json` | Summary of all briefs with status |

## Edge Cases and Error Handling

### Missing Creatomate Template
- If an automated video brief references a Creatomate template that doesn't exist:
  - Check available templates via Creatomate API
  - If no suitable template, reclassify as manual
  - Log the reclassification

### Missing Figma Template
- If a static brief references a Figma file that's inaccessible:
  - Report the missing template to the human
  - Provide the text content so it can be designed manually
  - Reclassify as manual production

### Script Too Complex for Automation
- If an automated brief would require custom animations or effects not supported by the template:
  - Reclassify as manual
  - Add a note explaining why automation isn't feasible

### Aspect Ratio Conflicts
- Primary format is always 9:16 (Stories/Reels placement)
- If a script's visual direction requires wide shots that don't work in portrait:
  - Note the conflict in the brief
  - Suggest reframing or alternative shot composition

### No Brand Assets Available
- If brand logo, colours, or font references are missing from `brands.json`:
  - Flag this in the brief as "MISSING: [asset]"
  - Do not use placeholder/generic assets without approval

## APPROVAL GATE

**This workflow has a mandatory approval gate.**

After all briefs are generated:

1. Present the brief index to the human
2. For each brief, show: ad name, format, production type (automated/manual), key details
3. Human reviews and marks each brief as:
   - **Approved** -- proceed to production
   - **Revise** -- adjust shot list, timing, or text
   - **Rejected** -- brief and associated script are dropped
4. For manual briefs: human confirms they can produce the content (talent available, locations accessible)
5. Only approved briefs proceed to workflows 06/07 (Production)

**Do NOT proceed to production workflows until the human has reviewed and approved briefs.**

## Notes

- The brief is the contract between strategy and production. Ambiguity here causes delays downstream.
- For manual briefs, be as specific as possible about talent direction and shot composition to minimise reshoots.
- Automated briefs should be fully parameterised -- no subjective decisions should remain.
- Keep brief files in markdown for human readability, but ensure all machine-needed data is also in the JSON index.
- Consider creating a shared reference of available Creatomate templates and Figma frames so briefs can reference them accurately.

---

## Known Issues & Learnings

> Updated when this workflow encounters failures, edge cases, or better methods.
> Always check this section before executing the workflow.
> Log full context in `miscellaneous/learnings/LEARNINGS.md` under Workflow Learnings.

<!--
Entry format:
### [YYYY-MM-DD] — [Issue Title]
**What happened:** Brief description
**Root cause:** Why it happened
**Fix:** What was changed
**Rule:** ALWAYS/NEVER directive (also added to root CLAUDE.md if universal)
-->

_No issues logged yet._
