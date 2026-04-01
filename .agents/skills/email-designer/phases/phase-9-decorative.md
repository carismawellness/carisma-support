**Prerequisite:** Phase 8 — Section Dividers / Waves (phase-8-waves.md)
**References:** golden-rules.md (rules 6, 9, 13), brands/<brand>.md § Decorative Elements, § Color Palette, § Grid Node IDs
**Next:** Phase 9.5 — Icon Style Matching & Generation (phase-9.5-icons.md)

---

# Phase 9: Decorative Elements

## 9.1 Strategise

What shapes, motifs, vectors serve the content? Every element should reinforce, not compete. **Subtle > obvious. If in doubt, leave it out.**

**v4.2 addition: Variety is mandatory.** A single element type at a uniform size looks like clip art was randomly scattered. A senior creative uses:
- **3-4 different element types** (variants or different shapes)
- **2x size range minimum** (e.g., smallest 20px, largest 55px)
- **Strategic placement** at section transitions, not random positions
- **Secondary accents** beyond the primary motif (thin accent-coloured rules, subtle dividers)

## 9.2 Source from Elements/Templates Row (Row 4)

Shortlist relevant components from the brand column, then clone:
1. `mcp__figma-write__clone_node` from Row 4 source
2. `mcp__figma-write__insert_child` into production frame
3. `mcp__figma-write__move_node` to target position
4. `mcp__figma-write__resize_node` to appropriate size
5. `mcp__figma-write__rename_node` with descriptive name

## 9.3 Brand-Specific Elements

All decorative element node IDs, variant counts, size ranges, opacity ranges, rotation ranges, and secondary accent specs are defined in `brands/<brand>.md` § Decorative Elements.

Read the brand file and follow its specifications exactly. Key details you will find there:

- **Primary element type** (e.g., flower petals for SPA, sage accents for AES, green accents for SLIM)
- **Source variant node IDs** (how many variants, which IDs to clone from)
- **Count per emailer** (how many to place)
- **Size range** (minimum to maximum px)
- **Opacity range** (for `set_node_properties`)
- **Rotation range** (for `rotate_node`)
- **Secondary accent elements** (gold dividers, thin rules, etc.) and their specs

**General guidance by brand:**

- **SPA:** Multiple petal variants — use ALL of them. Apply varied opacity (0.20-0.40) and rotation (-30 to +35 degrees) for natural scatter. Add gold accent dividers as secondary elements.
- **AES:** Treatment cards, star ratings, testimonial blocks, before/after cards. Mix element types — don't use only one kind of accent. Sage-tinted decorative elements.
- **SLIM:** Navigation pills, before/after cards, CTA bars. Green-tinted decorative separators. Mix element types for variety.

## 9.4 Placement Strategy (Not Random)

Place decorative elements at **intentional locations**:

| Location | Purpose | Example |
|----------|---------|---------|
| Hero exit (near bottom-right of hero) | Guides eye into content | Medium element, rotated |
| Hero companion (near first element, smaller) | Creates depth with size contrast | Small element, different variant |
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
- [ ] **Size range:** Largest element is >= 2x the smallest (e.g., 55px and 22px)
- [ ] **Placement:** Elements at section transitions, not randomly scattered
- [ ] **Balance:** Mix of left and right placements
- [ ] **Opacity variation:** Not all at the same opacity
- [ ] **Secondary accents:** At least 1-2 non-primary elements (see `brands/<brand>.md` § Decorative Elements for the brand's secondary accent type)
- [ ] **Overall look:** Export at 0.5x — does it look intentional or like clip art was sprinkled?

If the answer to the last question is "clip art" → redo with more intent.

## 9.6 Usage Principles

- Shapes, boxes, masks, vectors — use with **design intent**
- Every decorative element must have a reason for being there
- Decorative clutter degrades the design. Restraint is a feature.
- But uniformity (all same type, all same size) looks equally bad — it signals automation, not craft.
