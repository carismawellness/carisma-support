# Phase 2: Text Hierarchy + Centre Alignment

**Prerequisite:** Phase 1.3 — Scaffold Production (copy placed in Row 7)
**References:** golden-rules.md (rules 7, 9, 10), brands/<brand>.md § Typography, § Color Palette, § Brand-Specific Phases
**Next:** Phase 3 — CTA Buttons

---

## 2.1 Load Fonts

`mcp__figma-write__load_font_async` — **MUST** run before any `set_font_name` call. Load all fonts the brand needs upfront.

Consult `brands/<brand>.md` § Typography for the full font list (Designed + Text-Based). Load every font family + weight combination listed.

## 2.2 Apply Font Hierarchy

Per `brands/<brand>.md` § Typography, apply the correct font specs for the emailer type:

**Designed Emailers:** Use the Designed Emailer Fonts table from `brands/<brand>.md` § Typography.

**Text-Based Emailers:** Use the Text-Based Emailer Fonts table from `brands/<brand>.md` § Typography.

Each brand has its own hero header font, body font, and CTA font. Do NOT hardcode font specs — always read from the brand file.

## 2.3 Apply Styles

For each text element:
1. `mcp__figma-write__set_font_name` — correct font family + weight
2. `mcp__figma-write__set_font_size` — correct size per role
3. `mcp__figma-write__set_text_align` → **CENTER** on all text elements
4. Content column: 520-552px (24-40px padding L/R within 600px frame)

## 2.4 Text Colors

`mcp__figma-write__set_fill_color` on each text node. Refer to `brands/<brand>.md` § Color Palette for the brand's body text color:

- Body text: use the brand's primary text color (`see brands/<brand>.md § Color Palette` — look for the "text" entry)
- Hero text: always `#ffffff` white

**Never use pure `#000000` black for any brand.** Each brand defines its own dark text color.

## 2.5 Case & Spacing Rules

Per `brands/<brand>.md` § Typography → Case Rules:

Each brand has distinct case and letter-spacing rules for headers, body, and CTAs. Read them from the brand file.

Per `brands/<brand>.md` § Typography → Line Heights:

Each brand defines its own line heights for body text and headlines. Apply these exactly as specified.

General letter-spacing rules:
- Letter-spacing on headings: 2-4px (exact value per brand's Case Rules)
- Letter-spacing on CTAs: 1.5px

## 2.6 SPA Decorative Script (Italianno)

**SPA Designed Emailers only.** Skip for AES, SLIM, and all Text-Based emailers.

For full specs, see `brands/spa.md` § Brand-Specific Phases → Phase 2.6: Italianno Decorative Script.

Italianno is a decorative script font used sparingly for visual elegance. It is NOT a heading or body font.

### Where to use Italianno:
1. **"Explore" accent text** in the footer area (above the fixed footer) — this is the most common placement
2. **Decorative section intros** — a single word or short phrase (2-3 words max) that introduces a section with flair
   - Example: "Discover", "Indulge", "Experience", "Your Journey"
   - Always followed by the actual section heading in the brand's hero header font
3. **Pull-quote accents** — a short word or phrase styled decoratively near testimonials

### Italianno specs:

Refer to `brands/spa.md` § Brand-Specific Phases for exact font, size, color, and styling values.

### Rules:
- **Maximum 2-3 Italianno elements per emailer.** More than that cheapens the effect.
- Never use Italianno for body text, section headings, or CTA labels
- Always pair with the brand's hero header font directly below for readability
- The text must come from the Copy Manifest — never generate decorative text

### Implementation:
1. `load_font_async({ family: "Italianno", style: "Regular" })`
2. `create_text` → `insert_child` into production frame
3. `set_font_name({ family: "Italianno", style: "Regular" })`
4. `set_font_size` → see `brands/spa.md` § Brand-Specific Phases for size
5. `set_text_align("CENTER")`
6. `set_fill_color` → see `brands/spa.md` § Brand-Specific Phases for color options
