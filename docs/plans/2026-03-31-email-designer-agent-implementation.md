# Email Designer Agent — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a dedicated Email Designer agent under `.agents/skills/email-designer/` with the full emailbaby pipeline, 3 brand configs, and 17 phase files — ready for Paperclip deployment.

**Architecture:** Consolidated Skill (Approach A). One router SKILL.md delegates to brand-specific configs in `brands/`. Shared phase engine in `phases/`. Cross-cutting concerns (golden rules, QC, error recovery, state format) extracted into standalone files. All content sourced from the battle-tested `marketing/email-marketing/emailbabyskill/` folder.

**Source material:** `marketing/email-marketing/emailbabyskill/` — contains SKILL.md (v5.1), SKILL.v4.2.md, SKILL.v3.md, config.json, and 17 phase files.

---

## Task 1: Create Directory Structure

**Files:**
- Create: `.agents/skills/email-designer/`
- Create: `.agents/skills/email-designer/brands/`
- Create: `.agents/skills/email-designer/phases/`

**Step 1: Create directories**

```bash
mkdir -p ".agents/skills/email-designer/brands"
mkdir -p ".agents/skills/email-designer/phases"
```

**Step 2: Verify**

```bash
ls -la .agents/skills/email-designer/
```

Expected: `brands/` and `phases/` directories exist.

---

## Task 2: Write Router SKILL.md

**Files:**
- Create: `.agents/skills/email-designer/SKILL.md`

**Source:** Adapted from `marketing/email-marketing/emailbabyskill/SKILL.md` (v5.1 router) + agent identity from design doc.

**Step 1: Write the router**

The SKILL.md defines the agent's identity, routing logic, and entry point. It is lean — no node IDs, no phase details, no brand-specific content. Those live in their respective files.

Content must include:
- Frontmatter: name `email-designer`, version `1.0.0`, user-invocable true, allowed-tools (Bash, Read, Write, Edit, Glob, Grep, Task, ToolSearch), argument-hint `<brand> [resume]`, triggers (`emaildesign`, `build email`, `design email`, `email production`)
- Agent identity section: Title (Email Designer), Reports to (Email Marketing Strategist), Runtime (Claude Code), MCP tools (figma-write, nano-banana, klaviyo)
- Input/output contract from design doc § Input/Output Contract
- Brand routing table: `spa` → `brands/spa.md`, `aes`/`aesthetics` → `brands/aes.md`, `slim`/`slimming` → `brands/slim.md`
- Execution flow: (1) parse brand, (2) load brand config, (3) load golden-rules.md + pipeline.md, (4) check resume state, (5) execute pipeline or resume, (6) save state after each phase, (7) return QC + HTML to strategist
- Phase file resolution: read `phases/<phase>.md` for each step, reference `brands/<brand>.md` for all brand-specific values
- Autonomy boundaries from design doc
- Quick start section for `/emaildesign spa`
- Resume logic: read `.tmp/emails/<brand>-emailers/FIGMA-FINISH-PROMPT.md`, jump to first incomplete phase
- If no brand argument: ask user which brand (SPA, AES, SLIM) with descriptions

**Step 2: Verify**

Read the file back. Confirm it contains no hardcoded node IDs, no hex colors, no phase instructions — only routing logic and agent identity.

**Step 3: Commit**

```bash
git add .agents/skills/email-designer/SKILL.md
git commit -m "feat(email-designer): add router SKILL.md with agent identity"
```

---

## Task 3: Write config.json

**Files:**
- Create: `.agents/skills/email-designer/config.json`

**Source:** Adapted from `marketing/email-marketing/emailbabyskill/config.json`

**Step 1: Write Paperclip agent metadata**

```json
{
  "name": "email-designer",
  "type": "skill",
  "description": "Dedicated Email Designer agent for the CMO's email marketing team. Builds production-ready emailers in Figma for Carisma Wellness brands using a 17-phase pipeline with automated QC scoring (/170), semantic image matching, AI image generation, and Figma-to-HTML export. Reports to the Email Marketing Strategist.",
  "version": "1.0.0",
  "author": "Carisma",
  "user-invocable": true,
  "allowed-tools": "Bash, Read, Write, Edit, Glob, Grep, Task, ToolSearch",
  "argument-hint": "<brand> [resume]",
  "metadata": {
    "agent-role": "Email Designer",
    "reports-to": "Email Marketing Strategist",
    "runtime": "Claude Code",
    "org-layer": "CMO Sub-Team",
    "tags": ["figma", "emailer", "design", "production", "nano-banana", "html-export", "paperclip"],
    "triggers": [
      "emaildesign",
      "build email",
      "design email",
      "email production",
      "figma emailer"
    ]
  },
  "inputs": {
    "brand": {
      "type": "string",
      "enum": ["spa", "aesthetics", "slimming"],
      "description": "Which Carisma brand to build for",
      "required": true
    },
    "resume": {
      "type": "boolean",
      "description": "If true, read existing FIGMA-FINISH-PROMPT.md and continue from last completed phase",
      "required": false,
      "default": false
    }
  },
  "outputs": {
    "production_frame": {
      "type": "object",
      "description": "Completed Figma production frame with node map, copy manifest, QC results, and HTML export"
    },
    "state_file": {
      "type": "string",
      "description": "Path to FIGMA-FINISH-PROMPT.md for session continuity"
    }
  },
  "execution": {
    "timeout": 600,
    "environment": "node",
    "requires_context": ["figma-write MCP", "nano-banana MCP"]
  },
  "integrations": {
    "reads": [
      "config/emailer-guidelines.md",
      "config/branding_guidelines.md",
      ".tmp/emails/*/FIGMA-FINISH-PROMPT.md",
      ".tmp/emails/*/qc/*"
    ],
    "mcp_servers": ["figma-write", "nano-banana", "klaviyo"]
  }
}
```

**Step 2: Commit**

```bash
git add .agents/skills/email-designer/config.json
git commit -m "feat(email-designer): add Paperclip agent metadata"
```

---

## Task 4: Write golden-rules.md

**Files:**
- Create: `.agents/skills/email-designer/golden-rules.md`

**Source:** Extract from `marketing/email-marketing/emailbabyskill/SKILL.v4.2.md` § THE GOLDEN RULES (rules 1-14).

**Step 1: Write the file**

Extract all 14 golden rules verbatim from SKILL.v4.2.md. Format as numbered blockquotes. Remove any brand-specific node IDs — replace with references like "see `brands/<brand>.md` § Grid Node IDs". Keep the rules as behavioral directives, not implementation details.

Rules to extract:
1. NEVER generate copy for Designed emailers
2. 600px width is SACRED
3. Fixed Footer is UNTOUCHABLE
4. No persona sign-offs in Designed emailers
5. Section dividers: waves or clean transitions (v4.2 update — waves optional)
6. Save state after every phase
7. load_font_async BEFORE set_font_name
8. Check image dimensions AND relevance BEFORE placing
9. ALL created elements MUST be children of the production frame (insert_child)
10. Row 6 is TEXT ONLY — and always do BOTH emailers
11. Logos must be REAL vector logos, never text placeholders
12. Images must match their context (semantic relevance)
13. Decorative elements need variety and intent (3-4 variants, 2x size range)
14. NEVER create new frames for Row 6 or Row 7 — use existing grid frames, verify position

**Step 2: Commit**

```bash
git add .agents/skills/email-designer/golden-rules.md
git commit -m "feat(email-designer): add 14 golden rules"
```

---

## Task 5: Write pipeline.md

**Files:**
- Create: `.agents/skills/email-designer/pipeline.md`

**Source:** Extract from `marketing/email-marketing/emailbabyskill/SKILL.v4.2.md` § PHASE PIPELINE table + multi-emailer batch strategy from `phase-0-connect.md` § 0.5.

**Step 1: Write the file**

Content must include:
- Phase pipeline table (17 phases with step number, phase name, summary, file path relative to `phases/`)
- Multi-emailer batch strategy: batch early phases (0-1.6 for both emailers), sequential design phases (2-12 per emailer), shared image bank discovery
- Execution flow diagram showing the full pipeline
- Phase sequencing checkpoint notes (Phase 1 → 1.3 → 1.5 → 1.6 → 2, not skipping ahead)

**Step 2: Commit**

```bash
git add .agents/skills/email-designer/pipeline.md
git commit -m "feat(email-designer): add pipeline overview with batch strategy"
```

---

## Task 6: Write qc-scoring.md

**Files:**
- Create: `.agents/skills/email-designer/qc-scoring.md`

**Source:** Extract from `marketing/email-marketing/emailbabyskill/phase-11-quality-scoring.md` — the full QC system.

**Step 1: Write the file**

Copy the complete Phase 11 content. This is a standalone reference — it includes:
- 16 core checks (/160): file size, image integrity, dimensions, text readability, CTA count, section dividers, footer, spacing & overlap, brand consistency, decorative & icons, logo verification, element overlap detection, image source & resolution, semantic image relevance, decorative variety & craft, section completeness
- 2 bonus checks (/10): mobile preview, line height
- Score card template (formatted ASCII box)
- Thresholds: 144+ production ready, 112-143 minor fixes, <112 significant rework
- Design quality sub-score thresholds
- Manual QC checklist (copy integrity + visual polish)
- Issue-to-check mapping table

Replace any hardcoded brand node IDs with "see `brands/<brand>.md`" references.

**Step 2: Commit**

```bash
git add .agents/skills/email-designer/qc-scoring.md
git commit -m "feat(email-designer): add /170 QC scoring system"
```

---

## Task 7: Write error-recovery.md

**Files:**
- Create: `.agents/skills/email-designer/error-recovery.md`

**Source:** Extract from `marketing/email-marketing/emailbabyskill/SKILL.v4.2.md` § ERROR RECOVERY table.

**Step 1: Write the file**

Copy the full error → solution lookup table. All 20+ error patterns with their solutions. Replace hardcoded node IDs with `brands/<brand>.md` references.

Error patterns to include:
- Node not found, insert fails, design outside grid, built in wrong frame
- Frame has content but grid cell is empty, copy row has images
- Image not showing, text font not loading, frame clipping, element invisible
- Context window running out, wave looks wrong, image distorted
- Image not filling frame, image doesn't match label, hero image pixelated
- Logo is text placeholder, testimonial image wrong gender
- Icon style mismatch, Nano Banana failed, generated image too large
- Elements overlap, decoratives look amateur

**Step 2: Commit**

```bash
git add .agents/skills/email-designer/error-recovery.md
git commit -m "feat(email-designer): add error recovery lookup table"
```

---

## Task 8: Write resume-state-format.md

**Files:**
- Create: `.agents/skills/email-designer/resume-state-format.md`

**Source:** Extract from `marketing/email-marketing/emailbabyskill/SKILL.v4.2.md` § RESUME STATE FILE FORMAT.

**Step 1: Write the file**

Copy the complete state file template including:
- Status section (CURRENT_PHASE, WAVES_DECISION, EMAILER_TYPE)
- Phase Completion checklist (all 17 phases)
- Connection (channel ID, document ID)
- Production Frames table (both emailers)
- Grid Position Map (from Phase 0.25)
- Copy Manifest (full verbatim copy by section)
- Image Inventory (source, keywords, dimensions, assignments)
- Icon Inventory (concept, style, prompt, method)
- Node Map (element, node ID, type, position, size)
- QC Score Card (from Phase 11)
- Child-Tree Audit summary
- Brand Colours Quick Reference
- Notes section

Also include resume instructions:
1. Read state file
2. Jump to first unchecked phase
3. Use existing manifests/inventories — don't re-extract
4. Continue from where left off
5. For legacy v3 state files without Image Inventory or QC: run those phases fresh

**Step 2: Commit**

```bash
git add .agents/skills/email-designer/resume-state-format.md
git commit -m "feat(email-designer): add resume state file template"
```

---

## Task 9: Write brands/spa.md

**Files:**
- Create: `.agents/skills/email-designer/brands/spa.md`

**Source:** Extract SPA-specific content from `marketing/email-marketing/emailbabyskill/SKILL.v4.2.md` — all SPA node IDs, colors, fonts, CTA spec, decorative spec, expected output.

**Step 1: Write the file**

Follow the brand config schema from the design doc. Extract all SPA values:

**Identity:** Carisma Spa & Wellness, abbreviation SPA, persona Sarah ("Peacefully, Sarah" — text-based only), @carismaspamalta, "#1 Most Reviewed Spa in Malta"

**Grid Node IDs:**
- Row 1 Logos: `4457:139` (inspect children for colour + white variants)
- Row 2 Colours: gradient `4491:66`, solids `4491:498`, `4491:499`, `4491:500`
- Row 4 Elements: flower petals `3601:460`, `3601:462`, `3601:464`, `3601:466`; CTA bars `4493:1658`, `4493:1837`
- Row 5 Footer: `4491:802` (~2016px height)
- Row 6 Source: `4445:527` (SPA_Value_01), `4445:565` (SPA_Value_02)
- Row 6 Waves: `4468:535`, `4468:537`, `4468:539`, `4468:541`
- Row 7 Target: `4495:2255` (SPA_Value_01), `4495:2313` (SPA_Value_02)

**Color Palette:** All 8 SPA colors from AUTHORITATIVE COLOR REFERENCE (warm cream `#fdf7ec`, section beige `#e8ded1`, CTA gold `#a88c4a`, accent gold `#c4a659`, deep brown text `#3b3029`, warm taupe `#9b8d83`, hero gradient base `#1a140f`, primary gradient stops)

**Typography:** Designed emailer fonts (Trajan Pro hero, Novecento Wide sub headers, Roboto body, Italianno decorative script) + Text-Based fonts (Playfair Display H1/H2, Montserrat body/CTA). Case rules: UPPERCASE or Title Case. Line heights: body 25.5px, headlines 42px.

**CTA Spec:** 420x48, `#a88c4a` gold, 6px radius, white text, chevron always, Novecento Wide 650 20px

**Decorative Elements:** 4 flower petal variants with IDs, 6-8 per emailer, size 18-58px, opacity 0.20-0.40, rotation -30° to +35°, gold accent dividers (80-120px wide, 1-2px tall, 30-40% opacity)

**Brand-Specific Phases:** Italianno decorative script spec (Phase 2.6) — max 2-3 per emailer, 45px, Title Case, `#c4a659` gold or `#ffffff` white, paired with Trajan Pro heading below

**Image Filters:** temperature +0.10, saturation -0.10, contrast 0, exposure 0

**Expected Output Reference:** Copy the SPA Designed Emailer expected output from SKILL.v4.2.md (hero spec, 2-4 content sections, 3+ CTAs, flower petals, wave dividers or clean BG transitions, fixed footer, ~40-60 nodes)

**Step 2: Commit**

```bash
git add .agents/skills/email-designer/brands/spa.md
git commit -m "feat(email-designer): add SPA brand config"
```

---

## Task 10: Write brands/aes.md

**Files:**
- Create: `.agents/skills/email-designer/brands/aes.md`

**Source:** Extract AES-specific content from SKILL.v4.2.md.

**Step 1: Write the file**

Same schema as SPA. Extract all AES values:

**Identity:** Carisma Aesthetics, abbreviation AES, persona Sarah ("Beautifully yours, Sarah" — text-based only), @carismaaesthetics, "#1 Voted Med-Aesthetics Clinic in Malta"

**Grid Node IDs:**
- Row 1 Logos: `4493:1738`
- Row 2 Colours: gradient `4491:501`, solids `4491:505`, `4491:503`, `4491:504`
- Row 4 Elements: Before/After cards `4493:1194`, `4493:1213`, `4493:1314`, `4493:1238`
- Row 5 Footer: `4491:803` (~1682px)
- Row 6 Source: `4445:600` (AES_Value_01), `4445:640` (AES_Value_02)
- Row 6 Waves: `4468:549`, `4468:551`, `4468:553`
- Row 7 Target: `4495:2354` (Aes_01), `4495:2356` (Aes_02)

**Color Palette:** All AES colors (white `#ffffff`, sage tint `#e8f0ed`, light sage `#e7f0f0`, warm beige footer `#f5f0eb`, CTA sage `#607872`, badge sage `#8faba3`, sage teal `#96b2b2`, charcoal `#3b3b3b`, medium gray `#6b6b6b`, warm taupe `#9b8d83`, gold stars `#c4a366`, hero gradient base `#1a1f1c`, primary gradient stops)

**Typography:** Designed emailer fonts (shared) + Text-Based (Cormorant Garamond Medium H1 32px, Cormorant Garamond Regular H2 24px, Montserrat Regular 14px, Montserrat SemiBold CTA 13px). Case: Title Case or UPPERCASE with letter-spacing +2-4px. Line heights: body 23.8px, headlines 38px.

**CTA Spec:** 340x46, `#607872` sage, 22px radius, white text, chevron optional (only if wireframe shows it)

**Decorative Elements:** Sage accent elements, treatment cards, star ratings, testimonial blocks, Before/After cards with IDs. Mix element types.

**Brand-Specific Phases:** Before/After placeholders (130x160px, 8px radius, `#d9d1c7` fill, Montserrat Medium 9px labels)

**Image Filters:** temperature 0, saturation 0, contrast +0.05, exposure +0.05

**Expected Output Reference:** AES Designed Emailer expected output (~35-50 nodes)

**Step 2: Commit**

```bash
git add .agents/skills/email-designer/brands/aes.md
git commit -m "feat(email-designer): add AES brand config"
```

---

## Task 11: Write brands/slim.md

**Files:**
- Create: `.agents/skills/email-designer/brands/slim.md`

**Source:** Extract SLIM-specific content from SKILL.v4.2.md.

**Step 1: Write the file**

Same schema. Extract all SLIM values:

**Identity:** Carisma Slimming, abbreviation SLIM, persona Katya ("With you every step, Katya" — text-based only), @carismaslimming, "#1 Reviewed on Google"

**Grid Node IDs:**
- Row 1 Logos: runtime discovery — `get_node_info` on Row 1 Slimming column, find FRAME nodes containing "slim" (case-insensitive), cache IDs in state file
- Row 2 Colours: gradient `4491:68`, solids `4491:509`, `4491:507`, `4491:508`
- Row 4 Elements: CTA bars `4493:1658`, `4493:1837`
- Row 5 Footer: `4492:66` (~1921px)
- Row 6 Source: `4445:670` (SLIM_Value_01), `4445:714` (SLIM_Value_02)
- Row 6 Waves: runtime discovery — inspect `4445:670` + `4445:714` children for FRAME nodes with "Wave" in name
- Row 7 Target: `4495:2358` (Slimming_01), `4495:2360` (Slimming_02)

**Color Palette:** All SLIM colors (white `#ffffff`, off-white `#f5f0e8`, forest green CTA `#4a6b59`, sage green `#8eb093`, green accent `#8ca899`, nav pill BG `#c4d6c7`, pre-header bar `#576f80`, charcoal `#3b3b3b`, warm taupe `#9b8d83`, hero gradient base `#141f1a`, primary gradient stops)

**Typography:** Designed emailer fonts (shared) + Text-Based (Cormorant Garamond Regular H1 30px/H2 22px, Montserrat Regular 15px, Montserrat Bold CTA 15px). Case: UPPERCASE with letter-spacing +2-3px, period at end of declarative headlines. Line heights: body 25.5px, headlines 36px.

**CTA Spec:** 480x52, `#4a6b59` forest green, 28px radius, white bold text, chevron NEVER on primary CTAs (nav pills may have chevron)

**Decorative Elements:** Green accent elements, nav pills, Before/After cards. Mix types.

**Brand-Specific Phases:** Pre-header bar spec (Phase 6.6) — 600x38px, `#576f80` steel blue, white Montserrat Regular 12px, UPPERCASE, letter-spacing 1px, y=0 (all other elements shift down 38px). Nav pills in footer: `#c4d6c7` BG, 22px radius.

**Image Filters:** temperature 0, saturation +0.10, contrast +0.05, exposure 0

**Expected Output Reference:** SLIM Designed Emailer expected output (~45-65 nodes)

**Step 2: Commit**

```bash
git add .agents/skills/email-designer/brands/slim.md
git commit -m "feat(email-designer): add SLIM brand config"
```

---

## Task 12: Write Phase Files (Batch — All 17)

**Files:**
- Create: `.agents/skills/email-designer/phases/phase-0-connect.md`
- Create: `.agents/skills/email-designer/phases/phase-1-extract-copy.md`
- Create: `.agents/skills/email-designer/phases/phase-1.5-image-discovery.md`
- Create: `.agents/skills/email-designer/phases/phase-1.6-copy-validation.md`
- Create: `.agents/skills/email-designer/phases/phase-2-text-hierarchy.md`
- Create: `.agents/skills/email-designer/phases/phase-3-cta-buttons.md`
- Create: `.agents/skills/email-designer/phases/phase-3.5-logos.md`
- Create: `.agents/skills/email-designer/phases/phase-4-spacing.md`
- Create: `.agents/skills/email-designer/phases/phase-5-images.md`
- Create: `.agents/skills/email-designer/phases/phase-5.5-nano-banana.md`
- Create: `.agents/skills/email-designer/phases/phase-6-colours.md`
- Create: `.agents/skills/email-designer/phases/phase-7-footer.md`
- Create: `.agents/skills/email-designer/phases/phase-8-waves.md`
- Create: `.agents/skills/email-designer/phases/phase-9-decorative.md`
- Create: `.agents/skills/email-designer/phases/phase-9.5-icons.md`
- Create: `.agents/skills/email-designer/phases/phase-10-z-order.md`
- Create: `.agents/skills/email-designer/phases/phase-11-quality-scoring.md`
- Create: `.agents/skills/email-designer/phases/phase-12-save-state.md`
- Create: `.agents/skills/email-designer/phases/phase-17-html-export.md`

**Source:** `marketing/email-marketing/emailbabyskill/` — all phase files.

**Step 1: Copy and refine each phase file**

For each of the 17 phase files in `marketing/email-marketing/emailbabyskill/`:

1. Read the source file
2. **De-brand:** Replace all hardcoded node IDs, hex colors, and brand-specific values with references:
   - `see brands/<brand>.md § Grid Node IDs` instead of `4495:2255`
   - `see brands/<brand>.md § Color Palette` instead of `#fdf7ec`
   - `see brands/<brand>.md § CTA Spec` instead of `420x48, #a88c4a`
   - `see brands/<brand>.md § Typography` instead of hardcoded font specs
3. **Cross-reference:** Add header to each phase file pointing to prerequisite phases and related files:
   ```
   **Prerequisite:** Phase [N-1] complete
   **References:** golden-rules.md (rules X, Y), brands/<brand>.md § [section]
   **Next:** Phase [N+1]
   ```
4. **Keep all MCP tool call examples** — these are critical implementation details
5. **Keep all verification steps** — export + visual confirm instructions stay verbatim
6. **Keep all error handling** — reference error-recovery.md for the lookup table
7. Write the refined content to `.agents/skills/email-designer/phases/`

**Specific refinements per phase:**

| Phase File | Key Refinement |
|------------|---------------|
| phase-0-connect.md | Keep MCP tool lists verbatim. De-brand the grid discovery (reference brand config for frame IDs). Keep multi-emailer batch strategy. |
| phase-1-extract-copy.md | De-brand source frame IDs → `brands/<brand>.md § Row 6`. Keep Copy Manifest template verbatim. Keep scaffold instructions. |
| phase-1.5-image-discovery.md | Keep all semantic matching logic, visual identification fallback, keyword extraction. De-brand Image Bank navigation. |
| phase-1.6-copy-validation.md | Keep as-is — it's already brand-agnostic. Just add cross-references. |
| phase-2-text-hierarchy.md | Move font tables to brand configs. Phase file references `brands/<brand>.md § Typography`. Keep Italianno section but mark as "SPA only — skip for AES, SLIM". |
| phase-3-cta-buttons.md | Move CTA spec table to brand configs. Phase references `brands/<brand>.md § CTA Spec`. Keep clone-first approach. |
| phase-3.5-logos.md | Move logo node IDs to brand configs. Keep the critical "real logos only, never text" verification logic. SLIM runtime discovery stays. |
| phase-4-spacing.md | Keep as-is — overlap detection is brand-agnostic. Just add cross-references. |
| phase-5-images.md | Keep all resolution check logic, retina ratio calculations, semantic relevance check protocol. De-brand filter values → `brands/<brand>.md § Image Filters`. |
| phase-5.5-nano-banana.md | Keep all Nano Banana MCP workflows. De-brand prompt modifiers → `brands/<brand>.md § Identity` for tone. Keep full failure recovery tree. |
| phase-6-colours.md | Move all hex values to brand configs. Phase says "apply body BG from `brands/<brand>.md § Color Palette`". Keep gradient implementation examples with placeholder values. SLIM pre-header section references `brands/slim.md § Brand-Specific Phases`. |
| phase-7-footer.md | Move footer IDs to brand configs. Keep the "UNTOUCHABLE" rule. Keep expected elements lists per brand (they serve as QC verification). |
| phase-8-waves.md | Move wave node IDs to brand configs. Keep optional decision gate (v4.2). Keep skip/clean-transition logic. |
| phase-9-decorative.md | Move element node IDs and specs to brand configs. Keep variety checklist and placement strategy table — these are brand-agnostic design principles. |
| phase-9.5-icons.md | Keep as-is — Nano Banana workflow + numbered fallback is brand-agnostic. De-brand accent colors → `brands/<brand>.md § Color Palette`. |
| phase-10-z-order.md | Keep full 11-layer classification table and detection algorithm. Brand-agnostic except SLIM pre-header note. |
| phase-11-quality-scoring.md | Already extracted to qc-scoring.md. This phase file becomes a thin wrapper: "Run the QC system defined in `qc-scoring.md`. Score card template and thresholds are there." |
| phase-12-save-state.md | Reference resume-state-format.md for the template. Keep grid frame validation + child-tree audit logic. |
| phase-17-html-export.md | Move brand style lookup tables to brand configs. Keep HTML template, section-by-section generation, CTA VML fallback, validation checklist. |

**Step 2: Verify all 17 files exist**

```bash
ls -la .agents/skills/email-designer/phases/ | wc -l
```

Expected: 19 (17 files + `.` + `..`) — confirming all 17 phase files exist.

**Step 3: Spot-check de-branding**

Grep for hardcoded node IDs that should have been replaced:

```bash
grep -r "4495:2255\|4491:802\|4445:527" .agents/skills/email-designer/phases/
```

Expected: 0 matches. All node IDs should reference `brands/<brand>.md`.

**Step 4: Commit**

```bash
git add .agents/skills/email-designer/phases/
git commit -m "feat(email-designer): add 17 phase files (de-branded, cross-referenced)"
```

---

## Task 13: Update Paperclip Org Design

**Files:**
- Modify: `docs/plans/2026-03-31-paperclip-org-design.md`

**Step 1: Update org chart**

Add the CMO sub-team to the ASCII org chart:

```
├── CMO (AI — Claude Sonnet)
│   Strategy & cross-brand marketing direction
│   Reviews all 3 GM marketing reports
│   Sets quarterly themes, brand standards, KPI targets
│   │
│   ├── Email Marketing Strategist (AI — Claude Sonnet)
│   │   Plans email campaigns: topics, calendar, audiences, A/B strategy
│   │   Reads quarterly email plans per brand
│   │   Delegates design execution to Email Designer
│   │
│   └── Email Designer (AI — Claude Code)
│       17-phase Figma emailer pipeline with /170 QC
│       MCP: figma-write, nano-banana, klaviyo
│       3 brand configs (SPA, AES, SLIM)
```

**Step 2: Update agent count**

Change "Total agents: 17" to "Total agents: 19" in Architecture Overview.

**Step 3: Update Layer 2 table**

Add note to CMO row: "Has 2 direct sub-agents: Email Marketing Strategist + Email Designer"

**Step 4: Add new section for CMO Sub-Team**

Between Layer 2 (C-Suite) and Layer 3 (GMs), add a new section describing the CMO sub-team with both agents' responsibilities, runtime, and MCP access.

**Step 5: Update Technical Specs > Agent Runtimes table**

Add rows for Email Marketing Strategist (Claude Sonnet) and Email Designer (Claude Code).

**Step 6: Update Context Injection table**

Add rows:
- Email Marketing Strategist: quarterly email plans, marketing calendar, brand voice docs
- Email Designer: `.agents/skills/email-designer/*`, Figma MCP, nano-banana MCP

**Step 7: Update Scalability section**

Adding Brand 4 now also requires: 1 new `brands/brand4.md` in the email-designer skill.

**Step 8: Commit**

```bash
git add docs/plans/2026-03-31-paperclip-org-design.md
git commit -m "feat(paperclip): update org design to 19 agents with CMO email sub-team"
```

---

## Task 14: Final Verification

**Step 1: Count all files**

```bash
find .agents/skills/email-designer/ -type f | wc -l
```

Expected: 28 files total (SKILL.md + config.json + golden-rules.md + pipeline.md + qc-scoring.md + error-recovery.md + resume-state-format.md + 3 brand configs + 17 phase files = 27... but verify actual count)

**Step 2: Verify directory structure matches design**

```bash
find .agents/skills/email-designer/ -type f | sort
```

Expected output should match the file structure from the design doc.

**Step 3: Verify no orphaned brand references**

```bash
grep -r "#fdf7ec\|#607872\|#4a6b59\|#a88c4a" .agents/skills/email-designer/phases/
```

Expected: 0 matches in phase files. These hex values should only appear in `brands/*.md`.

**Step 4: Verify cross-references resolve**

```bash
grep -r "brands/<brand>.md" .agents/skills/email-designer/phases/ | head -5
```

Expected: Multiple matches — confirming phase files reference brand configs.

**Step 5: Final commit**

```bash
git add -A .agents/skills/email-designer/
git status
```

Verify only email-designer files are staged. Then:

```bash
git commit -m "feat(email-designer): complete Email Designer agent with 17 phases, 3 brand configs, QC system"
```
