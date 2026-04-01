# Phase 2: Text Hierarchy + Centre Alignment

## 2.1 Load Fonts

`mcp__figma-write__load_font_async` — **MUST** run before any `set_font_name` call. Load all fonts the brand needs upfront.

## 2.2 Apply Font Hierarchy

Per `config/emailer-guidelines.md` §Typography:

**Designed Emailers (all brands use these):**

| Role | Font | Weight | Size | Case |
|------|------|--------|------|------|
| Hero header | Trajan Pro | 400 | 30-37px | Title Case or UPPERCASE |
| Sub headers | Novecento Wide | 400 | 25-30px | UPPERCASE, letter-spacing +2-3px |
| Body copy | Roboto | 400 | 20-25px | Sentence case |
| Labels/badges | Novecento Wide Book | 350-400 | 13px | UPPERCASE |
| CTA text | Novecento Wide | 650 | 20px | UPPERCASE |

**Text-Based Emailers (brand-specific):**

| Role | SPA | AES | SLIM |
|------|-----|-----|------|
| H1 headline | Playfair Display Bold 36px | Cormorant Garamond Medium 32px | Cormorant Garamond Regular 30px |
| H2 section | Playfair Display Regular 24px | Cormorant Garamond Regular 24px | Cormorant Garamond Regular 22px |
| Body | Montserrat Regular 15px | Montserrat Regular 14px | Montserrat Regular 15px |
| CTA button | Montserrat SemiBold 13px | Montserrat SemiBold 13px | Montserrat Bold 15px |

## 2.3 Apply Styles

For each text element:
1. `mcp__figma-write__set_font_name` — correct font family + weight
2. `mcp__figma-write__set_font_size` — correct size per role
3. `mcp__figma-write__set_text_align` → **CENTER** on all text elements
4. Content column: 520-552px (24-40px padding L/R within 600px frame)

## 2.4 Text Colors

`mcp__figma-write__set_fill_color` on each text node:
- SPA: `#3b3029` deep brown (never pure black)
- AES: `#3b3b3b` charcoal
- SLIM: `#3b3b3b` charcoal
- Hero text: always `#ffffff` white

## 2.5 Case & Spacing Rules

Per `config/emailer-guidelines.md` §Headline Case Rules:
- SPA: UPPERCASE or Title Case
- AES: Title Case or UPPERCASE with letter-spacing +2-4px
- SLIM: UPPERCASE with letter-spacing +2-3px. Period at end of declarative headlines.

Line heights:
- Body text: 25.5px (SPA/SLIM), 23.8px (AES)
- Headlines: 42px (SPA), 38px (AES), 36px (SLIM)
- Letter-spacing on headings: 2-4px
- Letter-spacing on CTAs: 1.5px

## 2.6 SPA Decorative Script (Italianno)

**SPA Designed Emailers only.** Skip for AES, SLIM, and all Text-Based emailers.

Italianno is a decorative script font used sparingly for visual elegance. It is NOT a heading or body font.

### Where to use Italianno:
1. **"Explore" accent text** in the footer area (above the fixed footer) — this is the most common placement
2. **Decorative section intros** — a single word or short phrase (2-3 words max) that introduces a section with flair
   - Example: "Discover", "Indulge", "Experience", "Your Journey"
   - Always followed by the actual section heading in Trajan Pro
3. **Pull-quote accents** — a short word or phrase styled decoratively near testimonials

### Italianno specs:
- Font: Italianno, weight 400
- Size: 45px
- Case: Title Case (never UPPERCASE — Italianno doesn't work in all-caps)
- Color: `#c4a659` accent gold (on light backgrounds) or `#ffffff` white (on dark/gradient backgrounds)
- Alignment: CENTER
- Letter-spacing: 0 (default — Italianno is a flowing script, spacing breaks the cursive connections)

### Rules:
- **Maximum 2-3 Italianno elements per emailer.** More than that cheapens the effect.
- Never use Italianno for body text, section headings, or CTA labels
- Always pair with a Trajan Pro heading directly below for readability
- The text must come from the Copy Manifest — never generate decorative text

### Implementation:
1. `load_font_async({ family: "Italianno", style: "Regular" })`
2. `create_text` → `insert_child` into production frame
3. `set_font_name({ family: "Italianno", style: "Regular" })`
4. `set_font_size(45)`
5. `set_text_align("CENTER")`
6. `set_fill_color` → `#c4a659` or `#ffffff`
