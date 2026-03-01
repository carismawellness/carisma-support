# 10 - Iteration

## Objective

Generate creative variations of winning ads to extend their lifespan and find even better performers. For each winner, produce 3 systematic variations that change one variable at a time: same hook with different body, different hook with same format, and same hook with different format. These feed back into workflows 06-08 for production and publishing.

## Required Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `.tmp/performance/review_classified_{brand}_{date}.json` | Workflow 09 output | Classified ads with winners identified |
| `.tmp/scripts/script_{brand}_{offer}_{format}_{date}.json` | Workflow 04 output | Original scripts for winners |
| `.tmp/research/hooks_{brand}_{date}.json` | Workflow 03 output | Current hook bank (for alternate hooks) |
| `config/brands.json` | Manual config | Brand voice, formats, offers |
| `config/script_frameworks.json` | Manual config | Script framework structures |
| `config/offers.json` | Manual config | Active offers |

## Tools Used

| Tool | Purpose |
|------|---------|
| `tools/generate_script.py` | Generate variation scripts |
| `tools/generate_creative_brief.py` | Generate production briefs for variations |

## Step-by-Step Procedure

### Step 1: Identify Winners for Iteration

1. Read `.tmp/performance/review_classified_{brand}_{date}.json`
2. Filter to ads classified as `winner`
3. Also consider `marginal_improving` ads as candidates if few winners exist
4. Prioritise by: highest lead volume first, then lowest CPL

**Iteration priority rules:**
- **Must iterate:** Winners with frequency > 2.5 (approaching fatigue)
- **Should iterate:** Winners running for 10+ days (proactive iteration)
- **Can iterate:** Any winner with sufficient data (5+ leads)
- **Skip:** Winners launched in the last 3 days (too early to iterate)

### Step 2: Retrieve Original Script

For each winner:

1. Parse the ad name to identify the original script file
2. Load the original script from `.tmp/scripts/`
3. Extract: hook, body sections, format, offer, CTA
4. If the original script file is not found (e.g., ad was created before this system):
   - Pull the ad creative text from Meta API
   - Reconstruct the script structure from the ad copy
   - Note this as a "reconstructed" source

### Step 3: Generate 3 Variations Per Winner

For each winner, create exactly 3 variations:

#### Variation 1: Same Hook, Different Body

**What stays the same:** Opening hook text, format, offer
**What changes:** The body/middle section of the script (problem framing, solution angle, proof point)

Logic:
- Keep the hook that's proven to stop the scroll
- Change the argument/story in the body
- Use a different problem angle or social proof element
- Keep the same CTA and offer

Example:
```
ORIGINAL: "Tired of feeling drained? → Work stress story → Spa solution → Friend testimonial → Book now"
VARIATION 1: "Tired of feeling drained? → Mum burnout story → Spa solution → Personal experience → Book now"
```

Run `tools/generate_script.py`:
```
--mode "variation"
--variation_type "same_hook_diff_body"
--original_script ".tmp/scripts/script_{original}.json"
--brand_id "<brand_id>"
--brands_config "config/brands.json"
--frameworks_config "config/script_frameworks.json"
--offers_config "config/offers.json"
--output ".tmp/scripts/script_{brand}_{offer}_{format}_{date}_iter1.json"
```

#### Variation 2: Different Hook, Same Format

**What stays the same:** Script format/structure, body approach, offer
**What changes:** The opening hook (from a different category in the hook bank)

Logic:
- The current format is working (video structure, pacing, etc.)
- Test whether a different hook could perform even better
- Select a hook from a DIFFERENT category than the original
- Keep the body and CTA largely the same

Example:
```
ORIGINAL: [Question hook] "Tired of feeling drained?"
VARIATION 2: [Social proof hook] "I used to think spa days were a luxury, not a necessity"
(Same UGC format, same body structure, same offer)
```

Run `tools/generate_script.py`:
```
--mode "variation"
--variation_type "diff_hook_same_format"
--original_script ".tmp/scripts/script_{original}.json"
--hook_bank ".tmp/research/hooks_{brand}_{date}.json"
--select_hook_category "different_from_original"
--brand_id "<brand_id>"
--output ".tmp/scripts/script_{brand}_{offer}_{format}_{date}_iter2.json"
```

#### Variation 3: Same Hook, Different Format

**What stays the same:** Opening hook, core message, offer
**What changes:** The creative format (e.g., UGC to static, video to carousel)

Logic:
- The hook is proven to resonate
- Test whether the same hook works better in a different format
- This helps reach audience segments that prefer different content types

Example:
```
ORIGINAL: UGC video with question hook "Tired of feeling drained?"
VARIATION 3: Static image with same question hook as headline
(Same hook text, same offer, but static offer card format)
```

Run `tools/generate_script.py`:
```
--mode "variation"
--variation_type "same_hook_diff_format"
--original_script ".tmp/scripts/script_{original}.json"
--new_format_id "<different_format>"
--brand_id "<brand_id>"
--frameworks_config "config/script_frameworks.json"
--output ".tmp/scripts/script_{brand}_{offer}_{format}_{date}_iter3.json"
```

**Format mapping for variations:**

| Original Format | Variation Format Options |
|----------------|------------------------|
| `ugc_hook_body_cta` | `static_offer`, `text_overlay_video`, `founder_led` |
| `founder_led` | `ugc_hook_body_cta`, `static_offer`, `testimonial` |
| `testimonial` | `ugc_hook_body_cta`, `static_offer` |
| `static_offer` | `ugc_hook_body_cta`, `text_overlay_video` |
| `before_after` | `static_offer`, `ugc_hook_body_cta` |

### Step 4: Name Iteration Scripts

Naming convention for iterations:

```
{BrandCode}_{Offer}_{Format}_{HookType}_v{OriginalVersion}_iter{IterationType}
```

| Iteration Type | Suffix | Example |
|---------------|--------|---------|
| Same hook, diff body | `_iterA` | `CS_SpaDay_UGC_Question_v1_iterA` |
| Diff hook, same format | `_iterB` | `CS_SpaDay_UGC_SocialProof_v1_iterB` |
| Same hook, diff format | `_iterC` | `CS_SpaDay_Static_Question_v1_iterC` |

### Step 5: Generate Creative Briefs for Variations

Run `tools/generate_creative_brief.py` for each variation:

```
--script ".tmp/scripts/script_{brand}_{offer}_{format}_{date}_iter{N}.json"
--brand_id "<brand_id>"
--brands_config "config/brands.json"
--output ".tmp/briefs/brief_{ad_name}_{date}.md"
```

Classify each brief as automated or manual (same logic as workflow 05).

### Step 6: Route to Production

Iteration briefs follow the same production path as new briefs:

```
Iteration scripts → Briefs → Production (06/07) → Publishing (08)
```

The flow:
1. Automated briefs go directly to workflow 06 (video) or 07 (static)
2. Manual briefs are added to the manual production queue
3. All follow the same approval gates

### Step 7: Track Iteration Lineage

Maintain a lineage tracker that connects iterations to their parent ads:

```json
{
  "iterations": [
    {
      "parent_ad_id": "123456",
      "parent_ad_name": "CS_SpaDay_UGC_Question_v1",
      "parent_classification": "winner",
      "parent_cpl": 6.07,
      "parent_leads": 14,
      "variations": [
        {
          "variation_type": "same_hook_diff_body",
          "script_file": ".tmp/scripts/script_carisma_spa_spa_day_ugc_20260215_iter1.json",
          "brief_file": ".tmp/briefs/brief_CS_SpaDay_UGC_Question_v1_iterA_20260215.md",
          "ad_name": "CS_SpaDay_UGC_Question_v1_iterA",
          "status": "script_generated",
          "production_type": "manual_video"
        },
        {
          "variation_type": "diff_hook_same_format",
          "script_file": ".tmp/scripts/script_carisma_spa_spa_day_ugc_20260215_iter2.json",
          "new_hook": "I used to think spa days were a luxury, not a necessity",
          "new_hook_category": "social_proof",
          "ad_name": "CS_SpaDay_UGC_SocialProof_v1_iterB",
          "status": "script_generated",
          "production_type": "manual_video"
        },
        {
          "variation_type": "same_hook_diff_format",
          "script_file": ".tmp/scripts/script_carisma_spa_spa_day_static_20260215_iter3.json",
          "new_format": "static_offer",
          "ad_name": "CS_SpaDay_Static_Question_v1_iterC",
          "status": "script_generated",
          "production_type": "automated_static"
        }
      ]
    }
  ]
}
```

Save to: `.tmp/iteration/lineage_{brand}_{date}.json`

## Expected Outputs

| Output | Path | Description |
|--------|------|-------------|
| Iteration scripts | `.tmp/scripts/script_{brand}_{offer}_{format}_{date}_iter{N}.json` | Variation scripts |
| Iteration briefs | `.tmp/briefs/brief_{ad_name}_{date}.md` | Production briefs for variations |
| Lineage tracker | `.tmp/iteration/lineage_{brand}_{date}.json` | Parent-child relationship tracking |
| Iteration summary | `.tmp/iteration/summary_{brand}_{date}.md` | Human-readable summary |

### Iteration Summary

```markdown
# Iteration Summary: {brand_name}
## Date: {date}

### Winners Being Iterated: {count}

#### 1. CS_SpaDay_UGC_Question_v1 (CPL EUR 6.07, 14 leads)
| Variation | Type | New Element | Production |
|-----------|------|------------|-----------|
| iterA | Same hook, diff body | New problem angle (mum burnout) | Manual (CapCut) |
| iterB | Diff hook, same format | Social proof hook | Manual (CapCut) |
| iterC | Same hook, diff format | Static offer card | Automated (Figma) |

#### 2. CS_SpaDay_Testimonial_v1 (CPL EUR 5.50, 10 leads)
| Variation | Type | New Element | Production |
|-----------|------|------------|-----------|
| iterA | Same hook, diff body | Different testimonial angle | Manual (CapCut) |
| iterB | Diff hook, same format | Curiosity hook | Manual (CapCut) |
| iterC | Same hook, diff format | Text overlay video | Automated (Creatomate) |

### Total New Creatives: {count}
- Automated: {count} (can produce immediately)
- Manual: {count} (needs human production)

### Next Steps
1. Review iteration scripts (approval gate from workflow 04)
2. Produce creatives (workflows 06/07)
3. Publish alongside next week's new ads (workflow 08)
```

## Edge Cases and Error Handling

### No Winners to Iterate
- If the performance review found zero winners:
  - Report this to the human
  - Suggest reviewing marginal_improving ads as potential iteration candidates
  - Consider iterating on competitors' proven patterns instead (from workflow 01)
  - If no marginal ads either, focus on entirely new scripts via workflow 04

### Original Script Not Found
- If the original script file doesn't exist (ad predates this system):
  - Pull the ad creative from Meta API
  - Reconstruct the hook and body from the ad text
  - Mark the source as "reconstructed" in the lineage tracker
  - Human should verify the reconstruction is accurate

### Hook Bank Depleted
- If the hook bank doesn't have a suitable hook from a different category for Variation 2:
  - Use a hook from the same category but with a different approach
  - Or generate a new hook based on the winning pattern
  - Flag that the hook bank may need refreshing (run workflow 03 again)

### Format Not Applicable
- If the winner's format has no good alternative for Variation 3:
  - Skip Variation 3 for this winner
  - Generate 2 variations of Variation 1 instead (different body angles)
  - Log the skip reason

### Iteration Fatigue
- Track how many times an ad has been iterated
- After 3 rounds of iteration (9 variations total), the original concept may be exhausted
- Flag ads that have been iterated 3+ times for retirement
- At that point, invest in entirely new concepts rather than more iterations

### Production Capacity
- If iterations would create more manual production work than the human can handle:
  - Prioritise automated variations (Variation 3 that becomes static/Creatomate)
  - Limit manual iterations to top 2 winners only
  - Defer remaining iterations to the following week

## Approval Gate

Iteration scripts follow the same approval gates as new scripts:
- Scripts reviewed at **Gate 2** (from workflow 04)
- Briefs reviewed at **Gate 2** (from workflow 05)
- Creatives reviewed at **Gate 3** (from workflows 06/07)
- Published campaigns reviewed at **Gate 4** (from workflow 08)

## Notes

- The iteration loop is what separates good media buying from great media buying. Systematic variation testing compounds performance gains over time.
- Change only ONE variable per variation. Changing multiple variables makes it impossible to isolate what's working.
- Iterations should be published in the SAME campaign as new ads (or in a dedicated "Iterations" ad set) so CBO can compare them fairly.
- Track the performance of iterations vs their parent ads in the lineage tracker. Over time, this data reveals which variation types produce the most improvement.
- The ideal ratio is roughly 60% new concepts, 40% iterations of winners. Adjust based on how many winners you have to iterate on.

---

## Known Issues & Learnings

> Updated when this workflow encounters failures, edge cases, or better methods.
> Always check this section before executing the workflow.
> Log full context in `learnings/LEARNINGS.md` under Workflow Learnings.

<!--
Entry format:
### [YYYY-MM-DD] — [Issue Title]
**What happened:** Brief description
**Root cause:** Why it happened
**Fix:** What was changed
**Rule:** ALWAYS/NEVER directive (also added to root CLAUDE.md if universal)
-->

_No issues logged yet._
