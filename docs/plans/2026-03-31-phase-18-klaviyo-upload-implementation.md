# Phase 18: Klaviyo Upload — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `phase-18-klaviyo-upload.md` to the email-designer pipeline, closing the Figma → HTML → Klaviyo gap so the agent can push production email templates to Klaviyo with one CTA URL question and no further human steps.

**Architecture:** New phase file follows the identical pattern of existing 17 phase files — reads state, executes steps, saves state. Three supporting files are updated: `pipeline.md` (new row), `SKILL.md` (remove "future" qualifier), and `resume-state-format.md` (add Phase 18 to checklist + KLAVIYO state block).

**Tech Stack:** Klaviyo MCP (`klaviyo_upload_image_from_file`, `klaviyo_create_email_template`), existing state file format (`FIGMA-FINISH-PROMPT.md`), table-based HTML email output from Phase 17.

---

## Task 1: Create `phases/phase-18-klaviyo-upload.md`

**Files:**
- Create: `.agents/skills/email-designer/phases/phase-18-klaviyo-upload.md`

**Step 1: Create the phase file with this exact content**

```markdown
# Phase 18: Klaviyo Upload

**Prerequisite:** Phase 17 (HTML Export)
**References:** `brands/<brand>.md` § Color Palette (for template naming context)
**Next:** Pipeline complete — return template edit URL to user

**Input:** Production HTML + local assets from Phase 17 + `FIGMA-FINISH-PROMPT.md` state file.
**Output:** Live Klaviyo email template(s) + edit URL(s) appended to state file.

---

## 18.1 Read State File

Read `.tmp/emails/<brand>-emailers/FIGMA-FINISH-PROMPT.md` and load:

1. **HTML file path(s)** — from the Phase 17 report section (e.g., `.tmp/emails/spa-emailers/SPA_Value_01.html`)
2. **Asset inventory** — all local PNG file paths (hero, section images, footer, logos, waves)
3. **Brand** — SPA, AES, or SLIM
4. **Emailer name(s)** — used for Klaviyo template naming
5. **WAVES_DECISION** — WAVES_USED or WAVES_SKIPPED (determines how many wave assets to upload)

If Phase 17 report is missing from the state file, stop and tell the user to run Phase 17 first.

## 18.2 Ask for CTA URL

Before uploading anything, pause and ask the user one question:

> "What URL should the CTA button(s) link to for this campaign?"

Wait for the answer. This URL will replace every `[CTA_URL]` placeholder in the HTML.
For multi-emailer batches (2 emailers), ask once and apply to both.

## 18.3 Upload Assets to Klaviyo

Load the Klaviyo MCP tool if not already loaded:
```
ToolSearch: "+klaviyo"
```

For each asset in the asset inventory, upload to Klaviyo's media library:
```
klaviyo_upload_image_from_file(
  model: "claude",
  file_path: "<local_asset_path>"
)
```

Build a mapping table as you go:

| Placeholder | Local file | Klaviyo hosted URL |
|-------------|------------|--------------------|
| [HERO_IMAGE_URL] | assets/emailer-1/hero.png | <returned URL> |
| [SECTION_1_IMAGE_URL] | assets/emailer-1/section-1.png | <returned URL> |
| [FOOTER_IMAGE_URL] | assets/emailer-1/footer.png | <returned URL> |
| [LOGO_WHITE_URL] | assets/emailer-1/logo-white.png | <returned URL> |
| [WAVE_IMAGE_URL] | assets/emailer-1/wave-top.png | <returned URL> |
| ... | ... | ... |

**On upload failure:** Log the failure, mark the placeholder as FAILED in the table, and continue with the remaining assets. Do not abort the entire phase for one failed image.

**If ALL uploads fail:** Stop immediately. Report the error to the user. This likely means the Klaviyo API key is invalid or has insufficient permissions. Do not attempt template creation.

## 18.4 Substitute Placeholder URLs

Read the production HTML file (not the preview/base64 version — the `-klaviyo.html` output goes to a new file).

Perform the following substitutions in order:

| Placeholder | Replace with |
|-------------|-------------|
| `[HERO_IMAGE_URL]` | Klaviyo-hosted hero URL |
| `[SECTION_N_IMAGE_URL]` (all numbered variants) | Klaviyo-hosted section image URLs |
| `[FOOTER_IMAGE_URL]` | Klaviyo-hosted footer URL |
| `[LOGO_WHITE_URL]` | Klaviyo-hosted white logo URL |
| `[LOGO_COLOR_URL]` | Klaviyo-hosted color logo URL |
| `[WAVE_IMAGE_URL]` (if WAVES_USED) | Klaviyo-hosted wave URL |
| `[CTA_URL]` (every instance) | CTA destination URL from 18.2 |
| `[UNSUBSCRIBE_URL]` | `{% unsubscribe 'Unsubscribe' %}` |
| `[PREFERENCES_URL]` | `{% unsubscribe 'Manage Preferences' %}` |
| `[BROWSER_URL]` | `{{ view_in_browser_url }}` |

For any placeholder whose image upload FAILED in 18.3: leave the placeholder string as-is and add it to the failed list reported at the end.

Write the substituted HTML to:
```
.tmp/emails/<brand>-emailers/<emailer-name>-klaviyo.html
```

## 18.5 Create Klaviyo Template

Read the substituted HTML file and call:
```
klaviyo_create_email_template(
  model: "claude",
  name: "<BRAND>_<EmailerName> — <YYYY-MM-DD>",
  html: "<full HTML content>",
  has_editable_regions: false
)
```

Name format examples:
- `SPA_Value_01 — 2026-03-31`
- `AES_GlowLift_01 — 2026-03-31`
- `SLIM_Momentum_02 — 2026-03-31`

The tool returns a template ID. The Klaviyo editor URL is:
```
https://www.klaviyo.com/email-editor/<TEMPLATE_ID>/edit
```

## 18.6 Update State File

Append the following section to `FIGMA-FINISH-PROMPT.md`:

```
## KLAVIYO — <Emailer Name>
Template ID: <id>
Edit URL: https://www.klaviyo.com/email-editor/<id>/edit
Assets uploaded: N/M (N succeeded, M attempted)
Klaviyo HTML file: .tmp/emails/<brand>-emailers/<emailer-name>-klaviyo.html
Failed placeholders:
  - [PLACEHOLDER_NAME] — <local file path> (upload failed)
  [or "None — all placeholders resolved" if clean]
```

Mark Phase 18 as complete in the Phase Completion checklist.

## 18.7 Output Report

Print the final summary to the user:

```
====================================================
  KLAVIYO UPLOAD REPORT — <Emailer Name>
====================================================
  Template: <BRAND>_<EmailerName> — <YYYY-MM-DD>
  Template ID: <id>
  Edit URL: https://www.klaviyo.com/email-editor/<id>/edit

  Assets uploaded: N/M
  Placeholders resolved: N/M
  Failed placeholders: [list or "None"]

  Klaviyo HTML: .tmp/emails/<brand>-emailers/<emailer-name>-klaviyo.html

  Next step: Open the edit URL, review the template,
  then assign to a campaign or flow in Klaviyo.
====================================================
```

## 18.8 Multi-Emailer Batch

When the brand has 2 emailers:
1. Ask CTA URL once (18.2) — apply to both
2. Build shared asset upload table (some assets like logos/footer may be shared)
3. For each emailer: substitute HTML → create template → append state → print report
4. Final report shows both template IDs and edit URLs
```

**Step 2: Verify file was created**

Check that the file exists and has content by reading the first 10 lines. Confirm it starts with `# Phase 18: Klaviyo Upload`.

**Step 3: Commit**

```bash
git add .agents/skills/email-designer/phases/phase-18-klaviyo-upload.md
git commit -m "feat: add phase-18-klaviyo-upload.md to email-designer pipeline"
```

---

## Task 2: Update `pipeline.md`

**Files:**
- Modify: `.agents/skills/email-designer/pipeline.md`

**Step 1: Add Phase 18 row to the execution order table**

Find this existing row in the table:
```
| 17 | HTML Export | Export production frame to Gmail-safe HTML | `phases/phase-17-html-export.md` |
```

Add immediately after it:
```
| 18 | Klaviyo Upload | Ask CTA URL → upload assets → substitute URLs → create template | `phases/phase-18-klaviyo-upload.md` |
```

**Step 2: Add Phase 18 to Multi-Emailer Batch Strategy section**

Find this text under "Sequential Design Phases":
```
- Rationale: design decisions in one emailer inform the other, but context is cleaner working one at a time
```

After the "Sequential Design Phases" block, find the "Shared Resources" block and add Phase 18 handling:

Find:
```
### Shared Resources
- Image Bank: discovered once in Phase 1.5, referenced by both emailers
- Wave sources: same set of wave dividers for both emailers
- Footer: same footer template cloned for both
```

Replace with:
```
### Shared Resources
- Image Bank: discovered once in Phase 1.5, referenced by both emailers
- Wave sources: same set of wave dividers for both emailers
- Footer: same footer template cloned for both

### Phase 18 Batch
- CTA URL: asked once, applied to both emailers
- Shared assets (logo, footer, waves): uploaded once, URL reused in both HTMLs
- Template creation: sequential — emailer 1 then emailer 2
```

**Step 3: Add Phase 18 to Phase Sequencing Rules**

Find:
```
7. **Phase 12 before 17:** Save state before HTML export (state file references are needed for export).
8. **Save state after EVERY phase** (Golden Rule #6), not just Phase 12.
```

Add after rule 7, before rule 8:
```
8. **Phase 17 before 18:** HTML must be generated and validated before Klaviyo upload.
```

Renumber old rule 8 to rule 9.

**Step 4: Verify the changes look correct**

Read the updated `pipeline.md` and confirm:
- Phase 18 appears as the last row in the execution order table
- Batch strategy section mentions Phase 18
- Sequencing rules include the Phase 17 → 18 dependency

**Step 5: Commit**

```bash
git add .agents/skills/email-designer/pipeline.md
git commit -m "feat: add Phase 18 to pipeline.md execution order and batch strategy"
```

---

## Task 3: Update `SKILL.md`

**Files:**
- Modify: `.agents/skills/email-designer/SKILL.md`

**Step 1: Remove "future" qualifier from Klaviyo MCP line**

Find:
```
ToolSearch: "+klaviyo"   → loads klaviyo tools (future: email template upload)
```

Replace with:
```
ToolSearch: "+klaviyo"   → loads klaviyo tools (image upload + template creation)
```

**Step 2: Verify the edit is clean**

Read lines 94-102 of SKILL.md and confirm the three MCP tool loading lines now read:
```
ToolSearch: "+figma"     → loads all figma-write tools
ToolSearch: "nano banana" → loads nano-banana tools (AI image generation)
ToolSearch: "+klaviyo"   → loads klaviyo tools (image upload + template creation)
```

**Step 3: Commit**

```bash
git add .agents/skills/email-designer/SKILL.md
git commit -m "feat: activate klaviyo MCP tool loading in email-designer SKILL.md"
```

---

## Task 4: Update `resume-state-format.md`

**Files:**
- Modify: `.agents/skills/email-designer/resume-state-format.md`

**Step 1: Add Phase 18 to the Phase Completion checklist**

Find this line in the template block:
```
- [ ] Phase 17: HTML Export
```

Add immediately after:
```
- [ ] Phase 18: Klaviyo Upload
```

**Step 2: Add KLAVIYO section to the state file template**

Find this block near the end of the template:
```
## Notes
[Any decisions, skipped steps, or issues to address on resume]
```

Add before `## Notes`:
```
## KLAVIYO
[Populated by Phase 18 — one block per emailer]

### <Emailer Name>
Template ID: [id or "not yet uploaded"]
Edit URL: https://www.klaviyo.com/email-editor/[id]/edit
Assets uploaded: [N/M]
Klaviyo HTML file: .tmp/emails/<brand>-emailers/<emailer-name>-klaviyo.html
Failed placeholders: [list or "None"]
```

**Step 3: Verify both edits are present**

Read `resume-state-format.md` and confirm:
- `- [ ] Phase 18: Klaviyo Upload` appears in the Phase Completion checklist
- `## KLAVIYO` section appears before `## Notes`

**Step 4: Commit**

```bash
git add .agents/skills/email-designer/resume-state-format.md
git commit -m "feat: add Phase 18 to resume-state-format.md checklist and KLAVIYO state block"
```

---

## Verification

After all 4 tasks complete, do a final check:

**Step 1: Confirm all 4 files are in the expected state**

```bash
# Check phase file exists
ls -la ".agents/skills/email-designer/phases/phase-18-klaviyo-upload.md"

# Check pipeline.md has Phase 18
grep "Phase 18" ".agents/skills/email-designer/pipeline.md"

# Check SKILL.md no longer says "future"
grep "klaviyo" ".agents/skills/email-designer/SKILL.md"

# Check resume state has Phase 18
grep "Phase 18" ".agents/skills/email-designer/resume-state-format.md"
```

Expected output:
- Phase file exists with size > 0
- pipeline.md: 2-3 matches (table row + batch strategy + sequencing rule)
- SKILL.md: one match, no "future" in the line
- resume-state-format.md: one match in the checklist

**Step 2: Confirm commit history**

```bash
git log --oneline -5
```

Expected: 4 new commits above the design doc commit.
