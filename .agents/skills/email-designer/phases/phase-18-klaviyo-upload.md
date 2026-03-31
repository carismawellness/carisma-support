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
