# Phase 18: Klaviyo Upload — Design Doc

**Date:** 2026-03-31
**Status:** Approved
**Scope:** Email Designer agent — new phase file closing the Figma → Klaviyo pipeline

---

## Problem

The email-designer agent's 17-phase pipeline produces production-ready HTML with placeholder URLs
(`[HERO_IMAGE_URL]`, `[CTA_URL]`, etc.) and locally exported PNG assets. There is no automated step
to host those images and push the final template to Klaviyo. That last step is currently manual.

## Solution

Add `phases/phase-18-klaviyo-upload.md` as the terminal phase of the email-designer pipeline.
Phase 18 reads Phase 17's output, asks for the CTA URL once, uploads all assets to Klaviyo's
media library, substitutes all placeholder URLs in the HTML, and calls `klaviyo_create_email_template`.
The agent returns a direct Klaviyo editor link.

---

## Approach

**Option A chosen:** New phase file in the existing pipeline (not a separate skill, not merged into Phase 17).
Fits the established pattern, integrates with the state file, and allows clean resumption if upload fails.

---

## Phase Flow

### 18.1 Read State
Load `FIGMA-FINISH-PROMPT.md` to retrieve:
- HTML file path(s) for the production emailer(s)
- Asset inventory (hero, section images, footer, logos, waves) with local file paths
- Brand (SPA / AES / SLIM)
- Emailer name(s) for Klaviyo template naming

### 18.2 Ask for CTA URL
Single pause before any uploads:
> "What URL should the CTA button(s) link to for this campaign?"

One question covers all CTAs in the email. For multi-emailer batches, ask once and apply to both.

### 18.3 Upload Images to Klaviyo
For each asset in the inventory, call:
```
klaviyo_upload_image_from_file(file_path: "<local_asset_path>")
```
Collect the returned hosted URL per asset. Log successes and failures separately.
Do not abort on a single failed upload — continue and report at the end.

### 18.4 Substitute Placeholder URLs
Read the production HTML file. Replace:
- `[HERO_IMAGE_URL]` → Klaviyo-hosted hero URL
- `[SECTION_N_IMAGE_URL]` → Klaviyo-hosted section image URLs
- `[FOOTER_IMAGE_URL]` → Klaviyo-hosted footer URL
- `[LOGO_WHITE_URL]`, `[LOGO_COLOR_URL]` → Klaviyo-hosted logo URLs
- `[WAVE_IMAGE_URL]` → Klaviyo-hosted wave URLs (if WAVES_USED)
- `[CTA_URL]` (all instances) → CTA destination URL from 18.2
- `[UNSUBSCRIBE_URL]` → `{% unsubscribe 'Unsubscribe' %}` (Klaviyo template tag)
- `[PREFERENCES_URL]` → `{% unsubscribe 'Manage Preferences' %}` (Klaviyo template tag)
- `[BROWSER_URL]` → `{{ view_in_browser_url }}` (Klaviyo template variable)

Write the substituted HTML to: `.tmp/emails/<brand>-emailers/<emailer-name>-klaviyo.html`

### 18.5 Create Klaviyo Template
```
klaviyo_create_email_template(
  name: "<BRAND>_<EmailerName> — <YYYY-MM-DD>",
  html: "<substituted HTML>",
  has_editable_regions: false
)
```
Returns: template ID + edit URL.

---

## Error Handling

| Failure | Behaviour |
|---------|-----------|
| Single image upload fails | Skip, continue, report failed placeholder at end |
| HTML > 102KB | Warn but proceed (Klaviyo limit ≠ Gmail limit; Phase 17 already caught this) |
| Template name collision | Always creates new template; name includes date to distinguish duplicates |
| All images fail | Abort Phase 18, surface error, suggest checking Klaviyo API key |

---

## Pipeline Integration

### `pipeline.md` — Add final row:
```
| 18 | Klaviyo Upload | Ask CTA URL → upload images → substitute URLs → create template | phases/phase-18-klaviyo-upload.md |
```

### `SKILL.md` — Update MCP tool loading:
Remove "future" qualifier from `"+klaviyo"` line so it loads by default alongside figma-write and nano-banana.

### State File (`FIGMA-FINISH-PROMPT.md`) — Append after Phase 17 report:
```
## KLAVIYO
Template ID: <id>
Edit URL: https://www.klaviyo.com/email-editor/<id>/edit
Assets uploaded: N/N
Failed placeholders: [list any that still need manual replacement]
```

---

## Multi-Emailer Handling

For brands with 2 emailers (e.g., SPA_Value_01 + SPA_Value_02):
- Ask CTA URL once, apply to both
- Upload assets for emailer 1 → substitute → create template 1
- Upload assets for emailer 2 → substitute → create template 2
- Report both template IDs and edit URLs

---

## Files Changed

| File | Change |
|------|--------|
| `phases/phase-18-klaviyo-upload.md` | **New** — full phase instructions |
| `pipeline.md` | Add Phase 18 row to execution order table |
| `SKILL.md` | Remove "future" qualifier from klaviyo MCP line |

No changes to brand files, golden-rules.md, qc-scoring.md, or any other phase files.

---

## Success Criteria

- Agent uploads all assets without manual intervention
- Substituted HTML has zero `[PLACEHOLDER_URL]` strings remaining (except those that failed)
- Klaviyo template appears in the UI with correct name and brand styling
- Agent returns a clickable edit URL at the end of the phase
- State file updated with template ID and upload summary
