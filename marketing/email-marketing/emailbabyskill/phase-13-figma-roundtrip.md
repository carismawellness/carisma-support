# Phase 13: Figma → HTML Email Export

> **Superseded by Phase 17.** Preserved for reference only.

After Phase 12 (save state). Converts the completed Figma design into production HTML email.

## 13.1 Export Assets

### Full Frame Reference
`mcp__figma-write__export_node_as_image(nodeId: "<production_frame>", format: "PNG", scale: 2)` → high-res reference image

### Individual Sections
Export each image section separately for the HTML build:
- Hero image (as PNG, scale: 2)
- Section images (as PNG, scale: 2)
- Generated icons (as PNG, scale: 2)
- Each export at 2x scale for retina email clients

### Wave Dividers
For each wave:
- `mcp__figma-write__get_svg(nodeId: "<wave_node>")` → get SVG markup
- If SVG is complex, fall back to: `export_node_as_image(format: "PNG", scale: 2)`
- PNG waves are simpler and more email-client compatible

### Before/After Images
If real B/A photos have been added, export those too.

## 13.2 Build HTML Structure

Generate table-based HTML email. **NOT div/flexbox** — email clients don't support modern CSS.

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
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
    /* Responsive overrides */
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .fluid-image { width: 100% !important; height: auto !important; }
    }
  </style>
  <!--<![endif]-->
</head>
<body style="margin:0; padding:0; background-color:[brand_body_bg]; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">
  <!-- PREHEADER (hidden inbox preview text) -->
  <div style="display:none; max-height:0; overflow:hidden;">
    [Preheader text from Copy Manifest — 40-90 chars]
  </div>

  <table role="presentation" class="email-container" width="600" align="center"
         cellpadding="0" cellspacing="0" border="0"
         style="margin:0 auto; background-color:[brand_body_bg];">

    <!-- PREHEADER BAR (SLIM only) -->
    <!-- HERO SECTION with background image -->
    <!-- WAVE DIVIDER (exported PNG, full-width) -->
    <!-- CONTENT SECTIONS (alternating bg colors) -->
    <!-- CTA BUTTONS (with VML fallback) -->
    <!-- TESTIMONIAL SECTION -->
    <!-- TRUST ELEMENTS -->
    <!-- WAVE DIVIDER before footer -->
    <!-- FOOTER (from Copy Manifest / fixed footer content) -->

  </table>
</body>
</html>
```

## 13.3 Key HTML Email Rules

### Layout
- **600px table width** (matches Figma)
- **ALL styles inline** on elements (no external CSS, `<style>` only for responsive overrides)
- **Table-based layout only** — `<table>`, `<tr>`, `<td>`, never `<div>` for structure
- **No CSS:** `display: flex`, `position: absolute`, `grid`, `gap`, `justify-content`
- **Cellpadding/cellspacing** for spacing, not CSS margin/padding on tables

### Images
- All images as `<img>` tags with:
  - `src="[PLACEHOLDER_URL]"` — real URLs added when uploading to email platform
  - `alt="[meaningful description from Copy Manifest]"` — EVERY image needs alt text
  - `style="display:block; border:0; outline:none;"` — prevents gaps in Outlook
  - `width="600"` attribute (HTML attribute, not just CSS)
- Wave dividers: full-width PNG, `width="600"` `height="auto"`

### CTA Buttons (Outlook-Safe)
```html
<!-- Modern clients -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
  <tr>
    <td align="center" style="background-color:[cta_color]; border-radius:[radius]px; padding:14px 40px;">
      <a href="[CTA_URL]" style="color:#ffffff; font-family:'Montserrat',Arial,sans-serif; font-size:13px; font-weight:600; text-decoration:none; letter-spacing:1.5px; text-transform:uppercase;">
        [CTA TEXT]
      </a>
    </td>
  </tr>
</table>

<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml"
  style="width:[width]px; height:[height]px;"
  arcsize="[arcsize]%"
  fillcolor="[cta_color]"
  stroke="f">
  <v:textbox inset="0,0,0,0" style="mso-fit-shape-to-text:true;">
    <center style="color:#ffffff; font-family:Arial,sans-serif; font-size:13px; font-weight:bold; text-transform:uppercase; letter-spacing:1.5px;">
      [CTA TEXT]
    </center>
  </v:textbox>
</v:roundrect>
<![endif]-->
```

VML arcsize values:
- SPA (6px radius on 48px height): arcsize = ~13%
- AES (22px radius on 46px height): arcsize = ~48%
- SLIM (28px radius on 52px height): arcsize = ~54%

### Font Stacks
- **Designed headers:** `'Trajan Pro', 'Times New Roman', Georgia, serif`
- **Designed labels:** `'Novecento Wide', 'Trebuchet MS', Arial, sans-serif`
- **Body text:** `'Montserrat', Arial, Helvetica, sans-serif`
- **Text-based headers:** `'Playfair Display', Georgia, 'Times New Roman', serif` (SPA) / `'Cormorant Garamond', Georgia, serif` (AES/SLIM)

### Preheader
Hidden text shown in inbox preview:
```html
<div style="display:none; max-height:0; overflow:hidden; mso-hide:all;">
  [40-90 chars of compelling preview text from Copy Manifest]
  &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp; <!-- padding to prevent email client from pulling body text -->
</div>
```

## 13.4 Figma → HTML Translation Map

| Figma Feature | HTML Email Translation |
|---------------|----------------------|
| Wave dividers | Exported as PNG `<img>`, full-width |
| Hero gradient overlay | Background image on `<td>` OR sliced PNG overlay |
| Rounded CTA buttons | `border-radius` on `<td>` + VML `<v:roundrect>` for Outlook |
| Custom fonts | Google Fonts `@import` in `<style>` + system fallback stack |
| Alternating section BGs | `background-color` on section `<td>` elements |
| Decorative elements | Small PNG `<img>` or omit for email compat |
| Flower petals (SPA) | Small positioned PNGs (may omit — email positioning is limited) |
| Circular images | `border-radius: 50%` on `<img>` (doesn't work in Outlook — use pre-cropped PNG) |
| Before/After cards | Nested 2-column `<table>` with `<img>` cells |

## 13.5 Save & Validate

### Save HTML
1. Production version: `.tmp/emails/<brand>-emailers/<emailer-name>.html`
   - Images referenced as `[PLACEHOLDER_URL]` — replaced when uploading to Klaviyo/Mailchimp
2. Preview version: `.tmp/emails/<brand>-emailers/<emailer-name>-preview.html`
   - Images embedded as base64 data URIs for local testing
   - Open in browser to verify rendering

### Validate
Run these checks on the production HTML:
- [ ] File size < 102KB (Gmail clip limit) — `wc -c <file>`
- [ ] No `display: flex` or `position: absolute` in styles
- [ ] No `<div>` used for layout (only for preheader hide)
- [ ] All `<img>` tags have `alt` attributes with meaningful text
- [ ] All styles inline (no external stylesheet references)
- [ ] Preheader text present and 40-90 chars
- [ ] VML fallbacks present for rounded CTA buttons
- [ ] Font stacks include system fallbacks
- [ ] `role="presentation"` on all layout tables
- [ ] No JavaScript (email clients strip it)

### Report
Output validation results to user and append to FIGMA-FINISH-PROMPT.md.
