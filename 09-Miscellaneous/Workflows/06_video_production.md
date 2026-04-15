# 06 - Video Production

## Objective

Produce video creatives from approved briefs. Automated videos (text overlays, before/after slideshows, winner repackaging) are rendered via Creatomate. Manual videos (UGC, founder-led, testimonials) are handed off to the human for filming and editing in CapCut. All output creatives are staged for human review before publishing.

## Required Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `.tmp/briefs/automated/brief_{ad_name}_{date}.md` | Workflow 05 output | Automated video briefs |
| `.tmp/briefs/manual/brief_{ad_name}_{date}.md` | Workflow 05 output | Manual video briefs |
| `.tmp/briefs/index_{brand}_{date}.json` | Workflow 05 output | Brief index with approval status |
| `config/brands.json` | Manual config | Brand assets (logo URLs, colours) |
| `.env` | Environment | `CREATOMATE_API_KEY` |

## Tools Used

| Tool | Purpose |
|------|---------|
| `tools/render_video.py` | Submit render jobs to Creatomate API and download results |

## Step-by-Step Procedure

### Step 1: Separate Automated vs Manual

1. Read `.tmp/briefs/index_{brand}_{date}.json`
2. Filter to approved video briefs only (skip static briefs -- those go to workflow 07)
3. Split into two queues:
   - **Automated queue:** briefs with `production_type: "automated_video"`
   - **Manual queue:** briefs with `production_type: "manual_video"`

### Step 2: Process Automated Video Renders

For each brief in the automated queue:

#### 2a: Prepare Render Parameters

Parse the brief to extract Creatomate template parameters:

```json
{
  "template_id": "abc123",
  "modifications": {
    "headline_text": "The best spa experience in Malta",
    "body_text": "Full day package: massage, facial, pool access",
    "price_text": "EUR 89",
    "cta_text": "Book Your Spa Day",
    "logo_url": "https://...",
    "background_video": "https://...",
    "brand_colour_primary": "#XXXXXX",
    "brand_colour_secondary": "#XXXXXX"
  },
  "output_format": "mp4",
  "width": 1080,
  "height": 1920
}
```

#### 2b: Check Creatomate Credits

Before submitting renders:
1. Query Creatomate API for remaining render credits
2. Calculate total renders needed (count of automated briefs x aspect ratios)
3. If insufficient credits, alert the human and prioritise renders by script score
4. Log credit usage for tracking

#### 2c: Submit Render Jobs

Run `tools/render_video.py`:

```
--brief ".tmp/briefs/automated/brief_{ad_name}_{date}.md"
--template_id "<template_id>"
--modifications "<json_string>"
--output_dir ".tmp/creatives/"
--output_filename "{ad_name}_{aspect_ratio}.mp4"
```

For each automated brief, render multiple aspect ratios:
- **9:16** (primary -- Stories, Reels): `{ad_name}_9x16.mp4`
- **1:1** (Feed): `{ad_name}_1x1.mp4`
- **16:9** (optional -- in-stream): `{ad_name}_16x9.mp4` (only if template supports it)

#### 2d: Monitor Render Status

1. Creatomate renders are async -- poll for completion
2. Check render status every 10 seconds
3. Timeout after 5 minutes per render (report failure if exceeded)
4. Download completed renders to `.tmp/creatives/`

#### 2e: Validate Rendered Output

For each downloaded video:
- Verify file size is > 0 bytes and < 100MB
- Verify duration matches expected duration (+/- 2 seconds)
- Verify resolution matches requested dimensions
- Log any validation failures

### Step 3: Process Manual Video Queue

For briefs in the manual queue, the system cannot produce these automatically. Instead:

#### 3a: Generate Handoff Package

Compile all manual briefs into a single handoff document:

```markdown
# Manual Video Production Queue
## Date: {date}
## Brand: {brand_name}

### Videos to Produce: {count}

---

### Video 1: {ad_name}
**Brief file:** .tmp/briefs/manual/brief_{ad_name}_{date}.md
**Format:** UGC Hook-Body-CTA
**Duration:** 28 seconds
**Talent needed:** Female, 28-45, relatable

**Shot Summary:**
1. Hook (4s): Direct to camera, "When was the last time..."
2. Problem (6s): Walking, daily routine
3. Solution (9s): Spa footage
4. Proof (5s): Refreshed, smiling
5. CTA (4s): Logo + link

**Key Requirements:**
- Natural lighting preferred
- Spa b-roll needed (existing footage or new)
- Text overlays added in CapCut post-production

**Delivery:**
- Export as MP4, 1080x1920 (9:16)
- Also export 1080x1080 (1:1)
- Save to: .tmp/creatives/{ad_name}_9x16.mp4

---

### Video 2: {ad_name}
...
```

#### 3b: Alert Human

Present the manual production queue to the human with:
- Total number of videos to produce
- Estimated total filming time
- Any assets needed (footage, locations, talent)
- Deadline: these need to be ready for Gate 3 review (Tuesday)

#### 3c: Track Manual Production Status

Create a tracking file:

```json
{
  "manual_queue": [
    {
      "ad_name": "CS_SpaDay_UGC_Question_v1",
      "brief_file": ".tmp/briefs/manual/brief_CS_SpaDay_UGC_Question_v1_20260215.md",
      "status": "pending_human",
      "assigned_date": "2026-02-15",
      "due_date": "2026-02-17",
      "output_expected": ".tmp/creatives/CS_SpaDay_UGC_Question_v1_9x16.mp4"
    }
  ]
}
```

### Step 4: Winner Repackaging (Special Case)

When a previous winner is being repackaged with a new hook:

1. Locate the original winner creative in `.tmp/creatives/` or download from Meta
2. Extract the body and CTA sections
3. Record or generate a new hook section
4. Use Creatomate to splice: new hook + existing body/CTA
5. This is classified as automated even though it uses existing footage

Parameters:
```json
{
  "template_id": "repackage_template",
  "modifications": {
    "new_hook_text": "Different opening hook text",
    "original_video_url": "https://... (existing winner video)",
    "hook_duration": 4,
    "transition_type": "cut"
  }
}
```

### Step 5: Organise Output

Final directory structure:

```
.tmp/creatives/
  CS_SpaDay_UGC_Question_v1_9x16.mp4        (manual - from human)
  CS_SpaDay_UGC_Question_v1_1x1.mp4          (manual - from human)
  CS_SpaDay_TextOverlay_v1_9x16.mp4          (automated - from Creatomate)
  CS_SpaDay_TextOverlay_v1_1x1.mp4           (automated - from Creatomate)
  CS_GiftVoucher_BeforeAfter_v1_9x16.mp4     (automated - from Creatomate)
  ...
```

Update the production tracker:

```json
{
  "brand_id": "carisma_spa",
  "production_date": "2026-02-15",
  "total_videos": 10,
  "automated_complete": 4,
  "automated_failed": 0,
  "manual_complete": 0,
  "manual_pending": 6,
  "videos": [
    {
      "ad_name": "CS_SpaDay_TextOverlay_v1",
      "production_type": "automated",
      "status": "complete",
      "files": [
        ".tmp/creatives/CS_SpaDay_TextOverlay_v1_9x16.mp4",
        ".tmp/creatives/CS_SpaDay_TextOverlay_v1_1x1.mp4"
      ],
      "render_time_seconds": 45,
      "file_size_mb": 12.3,
      "duration_seconds": 30
    },
    {
      "ad_name": "CS_SpaDay_UGC_Question_v1",
      "production_type": "manual",
      "status": "pending_human",
      "files": [],
      "notes": "Waiting for human to film and edit in CapCut"
    }
  ]
}
```

## Expected Outputs

| Output | Path | Description |
|--------|------|-------------|
| Video creatives | `.tmp/creatives/{ad_name}_{aspect_ratio}.mp4` | Rendered video files |
| Production tracker | `.tmp/creatives/video_tracker_{brand}_{date}.json` | Status of all video production |
| Manual handoff | `.tmp/briefs/manual_handoff_{brand}_{date}.md` | Compiled manual production queue |

## Edge Cases and Error Handling

### Creatomate Render Failure
- **Template not found:** Verify template ID exists in Creatomate dashboard. Report to human if missing.
- **Invalid parameter:** Check parameter names match template fields exactly. Log the mismatch.
- **Render timeout:** Retry once. If second attempt also times out, mark as failed and flag for human.
- **Quality issues:** If rendered video has artefacts or incorrect text, log the issue and re-render with adjusted parameters.

### Creatomate Credit Exhaustion
- Before starting batch renders, calculate total credits needed
- If credits are low, prioritise renders by: winners repackage > new high-score scripts > lower-score scripts
- Alert human if renders will be skipped due to credit limits

### Manual Production Delays
- If human hasn't delivered manual videos by the Tuesday deadline:
  - Flag the delay in the production tracker
  - Determine if the campaign can launch with automated creatives only
  - Adjust the publishing plan (workflow 08) accordingly

### File Corruption
- After each download, verify file integrity:
  - File size > 100KB (a render smaller than this is likely corrupt)
  - Attempt to read video metadata (duration, resolution) using ffprobe or similar
  - If corrupt, re-trigger the render

### Aspect Ratio Issues
- Some templates may not support all aspect ratios
- If 1:1 render fails but 9:16 succeeds, proceed with 9:16 only
- Log which aspect ratios are missing for each creative

## APPROVAL GATE

**This workflow has a mandatory approval gate.**

After all videos are produced (both automated and manual):

1. Present the production tracker to the human
2. For each video, provide:
   - File path for review
   - Thumbnail frame
   - Duration and dimensions
   - Whether it's automated or manually produced
3. Human reviews each video and marks as:
   - **Approved** -- proceed to publishing
   - **Re-render** -- adjust parameters and re-render (automated only)
   - **Re-edit** -- send back for CapCut revisions (manual only)
   - **Rejected** -- video is dropped
4. Only approved videos proceed to workflow 08 (Campaign Publishing)

**Do NOT proceed to publishing until all videos in the batch have been reviewed.**

## Notes

- Automated renders are the efficiency win of this system. Every template that works reliably saves hours of manual work.
- Invest time in building and testing Creatomate templates -- the more robust they are, the fewer re-renders needed.
- Manual videos typically have higher engagement but are more expensive to produce. The mix should be roughly 40% automated, 60% manual for best results.
- Keep a library of approved stock footage and b-roll for automated renders. Source from brand photo/video shoots.
- CapCut project files should be saved alongside exports for easy future edits and iterations.

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
