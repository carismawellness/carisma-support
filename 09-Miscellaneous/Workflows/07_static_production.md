# 07 - Static Production

## Objective

Produce static image creatives from approved briefs. Text-only changes to Figma templates can be automated via the Figma MCP server. Image swaps and complex visual changes require human design work. All output creatives are staged for review before publishing.

## Required Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `.tmp/briefs/automated/brief_{ad_name}_{date}.md` | Workflow 05 output | Static briefs classified as automated |
| `.tmp/briefs/manual/brief_{ad_name}_{date}.md` | Workflow 05 output | Static briefs requiring human design |
| `.tmp/briefs/index_{brand}_{date}.json` | Workflow 05 output | Brief index with approval status |
| `config/brands.json` | Manual config | Brand colours, fonts, logo references |
| `.env` | Environment | Figma access token (if using Figma API/MCP) |

## Tools Used

| Tool | Purpose |
|------|---------|
| Figma MCP Server | Read Figma templates, inspect layers, export frames |
| (No dedicated Python tool) | Static production relies on Figma MCP + human design |

## Step-by-Step Procedure

### Step 1: Separate Automated vs Manual Static Briefs

1. Read `.tmp/briefs/index_{brand}_{date}.json`
2. Filter to approved static briefs only (skip video briefs -- those go to workflow 06)
3. For each brief, check the automation classification:
   - **Text-only changes:** Can be automated via Figma MCP
   - **Needs image swap:** Requires human intervention
   - **Needs new design:** Requires human design from scratch

### Step 2: Process Automated Static Creatives (Text-Only)

For static briefs where only text layers need to change:

#### 2a: Read Figma Template

Use Figma MCP to inspect the template:

1. Open the Figma file referenced in the brief
2. Navigate to the specified frame/component
3. List all text layers and their current values
4. List all image layers and their current fills
5. Confirm the template structure matches what the brief expects

#### 2b: Update Text Layers

For each text layer specified in the brief:

| Layer Name | Action | New Value |
|-----------|--------|-----------|
| `headline` | Replace text | Hook text from script |
| `subheadline` | Replace text | Offer details |
| `body` | Replace text | Supporting copy |
| `cta` | Replace text | CTA text from offer |
| `price` | Replace text | Price from offers.json |
| `disclaimer` | Replace text | Offer restrictions (if applicable) |

Use Figma MCP to:
1. Select each text layer by name
2. Update the text content
3. Verify the text fits within the bounding box (no overflow)
4. If text overflows, reduce font size or truncate (flag for human review)

#### 2c: Apply Colour Overrides (if specified)

If the brief specifies colour overrides:
1. Select the target element (CTA button, background, etc.)
2. Update the fill colour to the specified brand colour
3. Verify contrast ratios remain accessible (WCAG AA minimum)

#### 2d: Export Frames

Export the modified frames as PNG:

1. **Feed format (1:1):** 1080x1080px
2. **Story format (9:16):** 1080x1920px
3. Export at 2x resolution for quality, then resize to target
4. Format: PNG-24 (full quality, transparency if needed)

Save to: `.tmp/creatives/{ad_name}_{aspect_ratio}.png`

### Step 3: Process Manual Static Creatives (Image Swap / New Design)

For static briefs requiring human design work:

#### 3a: Generate Handoff Package

```markdown
# Static Design Queue
## Date: {date}
## Brand: {brand_name}

### Designs to Produce: {count}

---

### Design 1: {ad_name}
**Brief file:** .tmp/briefs/manual/brief_{ad_name}_{date}.md
**Template:** {figma_file_url} > {frame_name}
**Change type:** Image swap + text update

**Text Changes:**
| Layer | New Text |
|-------|---------|
| headline | "When was the last time you did something just for you?" |
| subheadline | "Spa Day Package - EUR 89" |
| cta | "Book Now" |

**Image Changes:**
| Layer | Current | Needed |
|-------|---------|--------|
| hero_image | placeholder.jpg | Spa treatment room photo (warm tones, no people's faces) |
| accent_image | none | Optional: product/service detail shot |

**Image Sourcing Notes:**
- Check brand photo library first
- If no suitable images, use Unsplash/Pexels with appropriate licensing
- Image must match brand mood: warm, luxurious, inviting

**Export Required:**
- 1080x1080 PNG (Feed)
- 1080x1920 PNG (Story)
- Save to: .tmp/creatives/{ad_name}_{aspect_ratio}.png

---
```

#### 3b: Track Manual Design Status

```json
{
  "manual_static_queue": [
    {
      "ad_name": "CS_SpaDay_Static_Emotional_v1",
      "brief_file": ".tmp/briefs/manual/brief_CS_SpaDay_Static_Emotional_v1_20260215.md",
      "change_type": "image_swap",
      "status": "pending_human",
      "assigned_date": "2026-02-15",
      "due_date": "2026-02-17",
      "output_expected": [
        ".tmp/creatives/CS_SpaDay_Static_Emotional_v1_1x1.png",
        ".tmp/creatives/CS_SpaDay_Static_Emotional_v1_9x16.png"
      ]
    }
  ]
}
```

### Step 4: Quality Validation

For all static creatives (automated and manual), validate:

| Check | Criteria | Action if Failed |
|-------|----------|-----------------|
| File exists | Output PNG exists at expected path | Report missing file |
| File size | > 50KB (smaller likely means empty/corrupt) | Re-export or flag |
| Dimensions | Matches target (1080x1080 or 1080x1920) | Re-export at correct size |
| Text readability | No text overflow, minimum font size 14px | Flag for review |
| Brand consistency | Logo present, brand colours used | Flag for review |
| Meta compliance | No more than 20% text coverage (legacy guideline, less strict now but still good practice) | Flag for review |

### Step 5: Organise Output

```
.tmp/creatives/
  CS_SpaDay_Static_Question_v1_1x1.png       (automated - text only)
  CS_SpaDay_Static_Question_v1_9x16.png      (automated - text only)
  CS_SpaDay_Static_Emotional_v1_1x1.png      (manual - image swap)
  CS_SpaDay_Static_Emotional_v1_9x16.png     (manual - image swap)
  CA_Botox_Static_SocialProof_v1_1x1.png     (manual - new design)
  ...
```

Update the production tracker:

```json
{
  "brand_id": "carisma_spa",
  "production_date": "2026-02-15",
  "total_statics": 6,
  "automated_complete": 2,
  "automated_failed": 0,
  "manual_complete": 0,
  "manual_pending": 4,
  "statics": [
    {
      "ad_name": "CS_SpaDay_Static_Question_v1",
      "production_type": "automated_text_only",
      "status": "complete",
      "files": [
        ".tmp/creatives/CS_SpaDay_Static_Question_v1_1x1.png",
        ".tmp/creatives/CS_SpaDay_Static_Question_v1_9x16.png"
      ],
      "file_sizes_kb": [285, 410],
      "dimensions": ["1080x1080", "1080x1920"]
    },
    {
      "ad_name": "CS_SpaDay_Static_Emotional_v1",
      "production_type": "manual_image_swap",
      "status": "pending_human",
      "files": [],
      "notes": "Needs spa treatment room photo"
    }
  ]
}
```

## Expected Outputs

| Output | Path | Description |
|--------|------|-------------|
| Static creatives | `.tmp/creatives/{ad_name}_{aspect_ratio}.png` | Exported image files |
| Production tracker | `.tmp/creatives/static_tracker_{brand}_{date}.json` | Status of all static production |
| Manual handoff | `.tmp/briefs/manual_static_handoff_{brand}_{date}.md` | Compiled manual design queue |

## Edge Cases and Error Handling

### Figma MCP Not Available
- If the Figma MCP server is not running or not configured:
  - Report the issue to the human
  - Reclassify all static briefs as manual
  - Generate the full handoff package with text and image specifications
  - Human can make all changes directly in Figma

### Text Overflow in Template
- If updated text is longer than the template's text box:
  - First attempt: reduce font size by 2px increments (minimum 14px)
  - Second attempt: truncate text with ellipsis and flag for human review
  - Do NOT silently truncate -- the copy may lose meaning

### Missing Figma Template
- If the referenced Figma file or frame is not accessible:
  - Check if the template was moved or renamed
  - Report to human with the expected template name
  - If another suitable template exists, suggest it as an alternative

### Colour/Contrast Issues
- If a colour override results in poor contrast (e.g., white text on light background):
  - Add a text shadow or background overlay
  - If that's not possible, flag for human review
  - Include a note about the specific contrast issue

### Image Licensing
- For manual briefs requiring new images:
  - Brand photo library is preferred (owned assets)
  - Unsplash/Pexels images are acceptable for ads (check licence)
  - Never use Getty/Shutterstock without paid licence
  - Include image source/credit in the production tracker

### Batch Size Limits
- Figma API/MCP may have rate limits
- If processing more than 10 templates in sequence, add a 2-second delay between operations
- If rate limited, queue remaining templates and retry after the cooldown

## APPROVAL GATE

This workflow's output is reviewed as part of **Gate 3** (Creative Review) in `workflows/00_master_orchestration.md`, alongside video creatives from workflow 06.

The human should review:
- Text is accurate and readable at mobile size (preview at actual 1080px)
- Images are appropriate and on-brand
- Colours match brand palette
- No design artefacts or rendering issues
- CTA is clear and prominent
- Overall creative is scroll-stopping and professional

## Notes

- Static creatives are often underestimated but can outperform video for certain offers (especially price-focused offers and gift vouchers).
- The Figma MCP approach works best when templates are well-structured with clearly named layers. Investing in template organisation pays dividends.
- Consider creating a library of pre-approved images per brand so image swaps can be semi-automated in the future.
- For the aesthetics brand, be especially careful with before/after imagery. Meta's policies on personal attributes apply to images as well as text.
- Export at 2x and downscale for the sharpest results, especially for text-heavy creatives that need to be readable on small mobile screens.

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
