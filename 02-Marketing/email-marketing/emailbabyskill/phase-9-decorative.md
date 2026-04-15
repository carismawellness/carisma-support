# Phase 9: Decorative Elements

## 9.1 Strategise

What shapes, motifs, vectors serve the content? Every element should reinforce, not compete. **Subtle > obvious. If in doubt, leave it out.**

**v4.2 addition: Variety is mandatory.** A single element type at a uniform size looks like clip art was randomly scattered. A senior creative uses:
- **3-4 different element types** (variants or different shapes)
- **2x size range minimum** (e.g., smallest 20px, largest 55px)
- **Strategic placement** at section transitions, not random positions
- **Secondary accents** beyond the primary motif (thin gold rules, subtle dividers)

## 9.2 Source from Elements/Templates Row (Row 4)

Shortlist relevant components from the brand column, then clone:
1. `mcp__figma-write__clone_node` from Row 4 source
2. `mcp__figma-write__insert_child` into production frame
3. `mcp__figma-write__move_node` to target position
4. `mcp__figma-write__resize_node` to appropriate size
5. `mcp__figma-write__rename_node` with descriptive name

## 9.3 Brand-Specific Elements

**SPA — Flower Petals + Gold Accents:**
- 4 petal variants: `3601:460`, `3601:462`, `3601:464`, `3601:466`
- Use **ALL 4 variants** — not just 1 or 2
- 6-8 petals per emailer, strategically placed
- **Size range: 18-58px** (tiny companion petals + medium accent petals)
- `mcp__figma-write__set_node_properties` → opacity 0.20-0.40 (varied, not uniform)
- `mcp__figma-write__rotate_node` → varied angles -30° to +35° for natural scatter
- **Gold accent dividers:** Create thin rectangles (80-120px wide, 1-2px tall) in gold at 30-40% opacity. Place at section transitions as subtle separators. These complement petals without competing.

**AES — Sage Accents:**
- Treatment cards, star ratings, testimonial blocks, before/after cards
- Key nodes: `4493:1194`, `4493:1213`, `4493:1314`, `4493:1238`
- Sage-tinted decorative elements, thin line accents, badge backgrounds
- Mix element types: don't use only one kind of accent

**SLIM — Green Accents:**
- Navigation pills, before/after cards, CTA bars
- Key nodes: `4493:1658`, `4493:1837`
- Green-tinted decorative separators
- Mix element types for variety

## 9.4 Placement Strategy (Not Random)

Place decorative elements at **intentional locations**:

| Location | Purpose | Example |
|----------|---------|---------|
| Hero exit (near bottom-right of hero) | Guides eye into content | Medium petal, rotated |
| Hero companion (near first petal, smaller) | Creates depth with size contrast | Small petal, different variant |
| Section entry (left or right edge) | Marks section start | Medium element |
| Section heading flank (opposite side) | Balances heading | Small element |
| Mid-CTA area (both sides) | Frames the call to action | Pair: medium left + small right |
| Testimonial area | Adds warmth to social proof | Medium-large element |
| Pre-footer | Subtle closure | Small element |

**Balance rules:**
- Alternate left and right placement — never all on one side
- Vary sizes within the same area (pair a 45px with a 22px nearby = depth)
- Opacity should vary: 0.20 (barely there) to 0.40 (noticeable but subtle)
- Higher opacity for larger elements, lower for smaller ones

## 9.5 Variety Checklist (Self-Check Before Moving On)

Before completing this phase, verify:

- [ ] **Types used:** At least 3 different source variants/types
- [ ] **Size range:** Largest element is ≥ 2x the smallest (e.g., 55px and 22px)
- [ ] **Placement:** Elements at section transitions, not randomly scattered
- [ ] **Balance:** Mix of left and right placements
- [ ] **Opacity variation:** Not all at the same opacity
- [ ] **Secondary accents:** At least 1-2 non-primary elements (gold dividers for SPA, thin rules for AES/SLIM)
- [ ] **Overall look:** Export at 0.5x — does it look intentional or like clip art was sprinkled?

If the answer to the last question is "clip art" → redo with more intent.

## 9.6 Usage Principles

- Shapes, boxes, masks, vectors — use with **design intent**
- Every decorative element must have a reason for being there
- Decorative clutter degrades the design. Restraint is a feature.
- But uniformity (all same type, all same size) looks equally bad — it signals automation, not craft.
