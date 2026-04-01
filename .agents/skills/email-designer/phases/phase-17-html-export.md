# Phase 17: Figma -> HTML Email Export

**Prerequisite:** Phase 12 (Save State)
**References:** `brands/<brand>.md` § Color Palette, § Typography, § CTA Spec
**Next:** Pipeline complete

**Supersedes:** `phase-13-figma-roundtrip.md` (preserved for reference).
**Input:** Completed production frame in Figma + FIGMA-FINISH-PROMPT.md state file.
**Output:** Production HTML file + preview HTML file.

---

## 17.1 Read State File

Before exporting, read `.tmp/emails/<brand>-emailers/FIGMA-FINISH-PROMPT.md` to load:

1. **Production frame ID** -- the source frame to export
2. **Copy Manifest** -- verbatim text for every section (never re-extract from Figma)
3. **Node Map** -- every element with its node ID, position, and size
4. **Image Inventory** -- which images are placed where, with source info
5. **Brand** -- SPA, AES, or SLIM (determines all styling)
6. **Emailer type** -- DESIGNED or TEXT_BASED (determines font stacks and structure)
7. **WAVES_DECISION** -- WAVES_USED or WAVES_SKIPPED (determines section transitions)

## 17.2 Export Assets from Figma

### Hero Image
```
mcp__figma-write__export_node_as_image(nodeId: "<Hero_BG>", format: "PNG", scale: 2)
```
Save to `.tmp/emails/<brand>-emailers/assets/hero.png`

### Section Images
For each image in the node map:
```
mcp__figma-write__export_node_as_image(nodeId: "<image_node>", format: "PNG", scale: 2)
```
Save to `.tmp/emails/<brand>-emailers/assets/section-[N].png`

Name images descriptively: `hero.png`, `section-tension-shoulders.png`, `testimonial-maria.png`

### Wave Dividers (if WAVES_USED)
For each wave node:
```
mcp__figma-write__export_node_as_image(nodeId: "<wave_node>", format: "PNG", scale: 2)
```
Save as `wave-[position].png`. PNG is more email-client compatible than inline SVG.

### Logo
```
mcp__figma-write__export_node_as_image(nodeId: "<logo_node>", format: "PNG", scale: 2)
```
Export BOTH color and white variants if used. Save as `logo-white.png`, `logo-color.png`.

### Circular Crops
Export pre-cropped as PNG (email clients don't support `border-radius: 50%` reliably):
```
mcp__figma-write__export_node_as_image(nodeId: "<circle_node>", format: "PNG", scale: 2)
```

### Decorative Elements -- Keep or Omit Decision

| Element Type | Decision | Rationale |
|-------------|----------|-----------|
| Wave dividers | **KEEP** -- export as full-width PNG | Essential section transitions |
| CTA buttons | **REBUILD in HTML** -- don't export as image | Must be clickable `<a>` links |
| Primary decoratives (floating elements) | **OMIT** | Email clients can't position small floating elements precisely. They depend on absolute positioning which breaks in email. |
| Full-width divider rules | **KEEP** -- export as PNG | Simple horizontal elements that work in email |
| Trust circles (if part of footer) | **KEEP** -- they're part of the footer export | Exported as part of footer section |
| Icons (Phase 9.5) | **KEEP** -- export each as small PNG | Icons are inline with content, not floating |
| Numbered fallbacks | **REBUILD in HTML** | Styled `<span>` elements, not images |

### Footer
Export the footer as a SINGLE full-width image. The footer is too complex (nested images, stars, pills, logos) to reliably reconstruct in HTML tables:
```
mcp__figma-write__export_node_as_image(nodeId: "<Fixed_Footer>", format: "PNG", scale: 2)
```
Save as `footer.png`. The clickable links (Unsubscribe, Manage Preferences, View in Browser) will be overlaid as an HTML image map or placed as text links below the footer image.

**Exception:** If the email platform (Klaviyo, Mailchimp) requires editable footer text for compliance, export the footer in sections and rebuild the text-link portion in HTML.

## 17.3 Brand Style Lookup

All style values for the HTML template come from `brands/<brand>.md`. Load these properties before generating HTML:

| Property | Source |
|----------|--------|
| `body_bg` | `brands/<brand>.md` § Color Palette -- primary body background |
| `section_alt_bg` | `brands/<brand>.md` § Color Palette -- alternating section background |
| `text_color` | `brands/<brand>.md` § Color Palette -- body text color |
| `muted_text` | `brands/<brand>.md` § Color Palette -- secondary/muted text color |
| `cta_bg` | `brands/<brand>.md` § CTA Spec -- fill color |
| `cta_radius` | `brands/<brand>.md` § CTA Spec -- corner radius |
| `cta_width` | `brands/<brand>.md` § CTA Spec -- width in px |
| `cta_height` | `brands/<brand>.md` § CTA Spec -- height in px |
| `cta_text` | `brands/<brand>.md` § CTA Spec -- text style (UPPERCASE, chevron rules) |
| `cta_font` | `brands/<brand>.md` § Typography -- CTA text font stack with system fallbacks |
| `header_font` | `brands/<brand>.md` § Typography -- header font stack with system fallbacks |
| `body_font` | `brands/<brand>.md` § Typography -- body font stack with size and line-height |
| `vml_arcsize` | Calculate: `cta_radius / cta_height * 100`%. See `brands/<brand>.md` § CTA Spec for radius and height. |
| `preheader_bar` | `brands/<brand>.md` § Color Palette or § Identity -- only SLIM has a pre-header bar |

**Font stack rule:** Every `font-family` declaration in HTML must end with a system fallback (`Arial,sans-serif` or `Georgia,serif`). The brand config Typography section defines the primary fonts; append system fallbacks when generating HTML.

## 17.4 Build HTML

Generate table-based HTML email. **NOT div/flexbox** -- email clients require `<table>` layout.

### HTML Template

Write the full HTML to `.tmp/emails/<brand>-emailers/<emailer-name>.html`:

```html
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>[Emailer Name]</title>
  <!--[if !mso]><!-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Cormorant+Garamond:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .fluid-image { width: 100% !important; height: auto !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
    }
  </style>
  <!--<![endif]-->
</head>
<body style="margin:0; padding:0; background-color:[body_bg]; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">

  <!-- HIDDEN PREHEADER TEXT -->
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all;">
    [Preheader text -- 40-90 chars from Copy Manifest hero subheadline or first body sentence]
    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" class="email-container" width="600" align="center"
         cellpadding="0" cellspacing="0" border="0"
         style="margin:0 auto; background-color:[body_bg];">

    <!-- Sections inserted here per 17.5 -->

  </table>
</body>
</html>
```

### Key HTML Email Constraints
- **ALL styles inline** on elements -- `<style>` block is ONLY for responsive `@media` overrides (many email clients strip `<head>` styles)
- **Table layout only** -- `<table>`, `<tr>`, `<td>`. Never `<div>` for structure (only for preheader hide)
- **Forbidden CSS:** `display: flex/grid`, `position: absolute/relative`, `gap`, `justify-content`, `align-items`
- **Cellpadding** for inner spacing, `width` attributes on `<td>` for column sizing
- **`role="presentation"`** on ALL layout tables (accessibility)
- **No JavaScript** (email clients strip it entirely)

## 17.5 Section-by-Section HTML Generation

Walk the Copy Manifest top-to-bottom. For each section, generate the corresponding HTML table row. Use the brand style lookup (17.3) for all values.

### Pre-Header Bar (SLIM only -- skip for SPA/AES)

Check `brands/<brand>.md` -- only SLIM defines a pre-header bar. If present:

```html
<tr>
  <td align="center"
      style="background-color:[preheader_bar_bg]; padding:10px 20px; font-family:[preheader_bar_font]; font-size:[preheader_bar_size]; color:#ffffff; text-transform:uppercase; letter-spacing:1px;">
    [PRE-HEADER bar text from Copy Manifest]
  </td>
</tr>
```

### Hero Section
```html
<!-- Hero with background image -->
<tr>
  <td background="[HERO_IMAGE_URL]" bgcolor="[hero_gradient_base_color]"
      width="600" height="[hero_height]"
      style="background-image:url('[HERO_IMAGE_URL]'); background-size:cover; background-position:center;"
      valign="bottom">
    <!--[if gte mso 9]>
    <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;height:[hero_height]px;">
    <v:fill type="frame" src="[HERO_IMAGE_URL]" />
    <v:textbox inset="0,0,0,0">
    <![endif]-->
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0">
      <!-- Gradient overlay via transparent-to-dark row -->
      <tr><td height="[top_portion]" style="font-size:0; line-height:0;">&nbsp;</td></tr>
      <tr>
        <td align="center" style="padding:20px 40px; background:linear-gradient(to bottom, rgba([rgb],0), rgba([rgb],0.65));">
          <!-- Logo -->
          <img src="[LOGO_WHITE_URL]" alt="[Brand Name]" width="[logo_width]" style="display:block; margin:0 auto 15px;" />
          <!-- Headline -->
          <h1 style="margin:0 0 8px; [header_font] font-size:[hero_headline_size]px; color:#ffffff; text-align:center; text-transform:uppercase; letter-spacing:2px;">
            [Hero headline from Copy Manifest]
          </h1>
          <!-- Subheadline -->
          <p style="margin:0 0 20px; [body_font] color:#ffffff; text-align:center; opacity:0.9;">
            [Hero subheadline from Copy Manifest]
          </p>
          <!-- Hero CTA -->
          [INSERT CTA BLOCK from 17.6]
        </td>
      </tr>
    </table>
    <!--[if gte mso 9]></v:textbox></v:rect><![endif]-->
  </td>
</tr>
```

**Note:** The `background:linear-gradient(...)` won't work in Outlook. The VML `<v:rect>` handles Outlook. For Gmail/Apple Mail/other clients, the CSS gradient provides the overlay. This is acceptable -- the gradient is a readability enhancement, not critical content.

### Wave Divider Row (if WAVES_USED)
```html
<tr>
  <td style="font-size:0; line-height:0;">
    <img src="[WAVE_IMAGE_URL]" alt="" width="600" height="auto"
         class="fluid-image"
         style="display:block; border:0; outline:none; width:600px; height:auto;" />
  </td>
</tr>
```
`alt=""` -- waves are decorative, not content.

### Content Section
```html
<tr>
  <td style="background-color:[section_bg]; padding:40px 40px;" class="mobile-padding">
    <h2 style="margin:0 0 15px; [header_font] font-size:[section_heading_size]px; color:[text_color]; text-align:center; text-transform:uppercase; letter-spacing:2px;">
      [Section heading from Copy Manifest]
    </h2>
    <p style="margin:0 0 10px; [body_font] color:[text_color];">
      [Section body from Copy Manifest]
    </p>
    <!-- Section image (if present) -->
    <img src="[SECTION_IMAGE_URL]" alt="[meaningful description]" width="520"
         class="fluid-image"
         style="display:block; border:0; margin:20px auto; width:520px; height:auto; border-radius:4px;" />
  </td>
</tr>
```

Alternate `section_bg` between `[body_bg]` and `[section_alt_bg]` for each content section.

### Testimonial Section
```html
<tr>
  <td style="background-color:[section_alt_bg]; padding:40px 40px; text-align:center;" class="mobile-padding">
    <!-- Stars -->
    <p style="margin:0 0 10px; font-size:18px; color:#c4a366;">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
    <!-- Quote -->
    <p style="margin:0 0 10px; font-family:'Playfair Display',Georgia,serif; font-style:italic; font-size:16px; color:[text_color]; line-height:1.5;">
      "[Testimonial quote from Copy Manifest]"
    </p>
    <!-- Attribution -->
    <p style="margin:0; [body_font] font-size:12px; color:[muted_text]; text-transform:uppercase; letter-spacing:1px;">
      -- [Attribution from Copy Manifest]
    </p>
  </td>
</tr>
```

### Footer
```html
<!-- Footer as exported image -->
<tr>
  <td style="font-size:0; line-height:0;">
    <img src="[FOOTER_IMAGE_URL]" alt="[Brand] -- Follow us @[social_handle]" width="600"
         class="fluid-image"
         style="display:block; border:0; outline:none; width:600px; height:auto;" />
  </td>
</tr>
<!-- Compliance links (must be real text, not part of footer image) -->
<tr>
  <td align="center" style="padding:15px 20px; background-color:[footer_bg_color]; font-family:'Montserrat',Arial,sans-serif; font-size:11px; color:[muted_text]; line-height:1.6;">
    <a href="[UNSUBSCRIBE_URL]" style="color:[muted_text]; text-decoration:underline;">Unsubscribe</a> &nbsp;|&nbsp;
    <a href="[PREFERENCES_URL]" style="color:[muted_text]; text-decoration:underline;">Manage Preferences</a> &nbsp;|&nbsp;
    <a href="[BROWSER_URL]" style="color:[muted_text]; text-decoration:underline;">View in Browser</a>
  </td>
</tr>
```

## 17.6 CTA Button HTML (with Outlook VML Fallback)

Every CTA button needs both a modern HTML version and a VML fallback for Outlook.

All CTA values (`[cta_bg]`, `[cta_radius]`, `[cta_width]`, `[cta_height]`, `[cta_font]`) come from `brands/<brand>.md` § CTA Spec. The `[vml_arcsize]` is calculated as: `cta_radius / cta_height * 100`%.

```html
<!-- CTA Button -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
  <tr>
    <td align="center"
        style="background-color:[cta_bg]; border-radius:[cta_radius]; padding:14px 40px;">
      <a href="[CTA_URL]"
         style="color:#ffffff; [cta_font] text-decoration:none; display:inline-block;">
        [CTA TEXT from Copy Manifest][CHEVRON -- see brands/<brand>.md § CTA Spec for chevron rules]
      </a>
    </td>
  </tr>
</table>
<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml"
  style="width:[cta_width]px; height:[cta_height]px;"
  arcsize="[vml_arcsize]"
  fillcolor="[cta_bg]"
  stroke="f">
  <v:textbox inset="0,0,0,0" style="mso-fit-shape-to-text:true;">
    <center style="color:#ffffff; font-family:Arial,sans-serif; font-size:13px; font-weight:bold; text-transform:uppercase; letter-spacing:1.5px;">
      [CTA TEXT][CHEVRON if applicable]
    </center>
  </v:textbox>
</v:roundrect>
<![endif]-->
```

**VML arcsize calculation:** `arcsize = cta_radius / cta_height * 100`%. See `brands/<brand>.md` § CTA Spec for the brand's radius and height values.

## 17.7 Save & Validate

### Save Two Versions

1. **Production version:** `.tmp/emails/<brand>-emailers/<emailer-name>.html`
   - Images referenced as `[PLACEHOLDER_URL]` -- replaced when uploading to Klaviyo/Mailchimp
   - All CTA links as `[CTA_URL]` -- replaced with actual landing page URLs

2. **Preview version:** `.tmp/emails/<brand>-emailers/<emailer-name>-preview.html`
   - Images embedded as base64 data URIs for local browser testing:
     ```
     src="data:image/png;base64,[base64_data]"
     ```
   - Open in browser to verify rendering without an email platform

### HTML Validation Checklist

Run every check. All must pass:

- [ ] **File size < 102KB** -- `wc -c <production_file>` (Gmail clips emails > 102KB, hiding the footer and unsubscribe link)
- [ ] **No forbidden CSS** -- grep for `display:\s*flex`, `position:\s*absolute`, `display:\s*grid` -> must return 0 matches
- [ ] **No `<div>` layout** -- `<div>` only allowed for preheader hide block. No `<div>` for structural layout.
- [ ] **All `<img>` have `alt`** -- grep for `<img` without `alt=` -> must return 0 matches
- [ ] **All styles inline** -- no external stylesheet `<link>` tags. `<style>` block only for `@media` responsive overrides.
- [ ] **Preheader present** -- hidden preheader `<div>` with 40-90 chars of compelling preview text
- [ ] **VML fallbacks present** -- `<!--[if mso]>` blocks for every CTA button
- [ ] **Font stacks have system fallbacks** -- every `font-family` declaration ends with `Arial,sans-serif` or `Georgia,serif`
- [ ] **`role="presentation"`** on all `<table>` elements used for layout
- [ ] **No JavaScript** -- grep for `<script` -> must return 0 matches
- [ ] **All `<img>` have `width` HTML attribute** -- not just CSS width (Outlook needs the attribute)
- [ ] **`display:block`** on all `<img>` -- prevents gaps in Outlook
- [ ] **Pre-header bar** present (SLIM only, per `brands/<brand>.md`) or absent (other brands)

### Output Report

```
====================================================
  HTML EXPORT REPORT -- [Emailer Name]
====================================================
  Production file: .tmp/emails/[brand]-emailers/[name].html
  Preview file:    .tmp/emails/[brand]-emailers/[name]-preview.html
  File size:       [N]KB / 102KB limit
  Assets exported: [N] images to .tmp/emails/[brand]-emailers/assets/

  Validation: [PASS / FAIL]
  [List any failures]

  Placeholder URLs remaining: [N]
  - [HERO_IMAGE_URL]
  - [SECTION_1_IMAGE_URL]
  - [CTA_URL] (x[N])
  - [UNSUBSCRIBE_URL]
  - [PREFERENCES_URL]
  - [BROWSER_URL]

  Next step: Upload assets to CDN/email platform,
  replace [PLACEHOLDER_URL]s with real URLs,
  send test email.
====================================================
```

Append this report to FIGMA-FINISH-PROMPT.md state file.

## 17.8 Multi-Emailer HTML Export

When building both emailers for a brand (per pipeline batch strategy):

1. Complete all design phases for BOTH emailers first
2. Export assets for emailer 1 -> build HTML 1 -> validate 1
3. Export assets for emailer 2 -> build HTML 2 -> validate 2
4. Save both reports to state file

Keep assets in separate subdirectories:
```
.tmp/emails/<brand>-emailers/
  assets/
    emailer-1/     <- hero.png, section-*.png, footer.png, etc.
    emailer-2/     <- hero.png, section-*.png, footer.png, etc.
  <emailer-1-name>.html
  <emailer-1-name>-preview.html
  <emailer-2-name>.html
  <emailer-2-name>-preview.html
```
