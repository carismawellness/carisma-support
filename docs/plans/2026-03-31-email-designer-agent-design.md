# Email Designer Agent — Design Document

**Date:** 2026-03-31
**Status:** Approved
**Approach:** Consolidated Skill (Approach A) — 1 agent, 3 brand skill files, shared phase engine

---

## Context

Carisma Wellness Group has a battle-tested email design system (`emailbabyskill`) that builds production-ready emailers in Figma across 3 brands. It evolved from v3 (monolithic) → v4.2 (enhanced + QC) → v5.1 (brand-routed). This design extracts that system into a dedicated **Email Designer** agent within the Paperclip AI org structure.

## Org Chart Update

The CMO gains a new sub-team. Org moves from 17 → 19 agents.

```
CMO (Claude Sonnet)
│   Strategy & cross-brand marketing direction
│
├── Email Marketing Strategist (Claude Sonnet) ← NEW
│   │   Plans email campaigns: topics, calendar, audiences, A/B strategy
│   │   Reads quarterly marketing calendar + brand email plans
│   │   Delegates design execution to Email Designer
│   │
│   └── Email Designer (Claude Code) ← NEW
│       Executes full 17-phase emailbaby pipeline
│       Figma design + automated QC (/170) + HTML export
│       MCP tools: figma-write, nano-banana, klaviyo
│       One agent, 3 brand configs (SPA, AES, SLIM)
│
├── [existing GM structure unchanged]
```

### Agent Count

| Layer | Before | After |
|-------|--------|-------|
| CEO | 1 | 1 |
| C-Suite | 5 | 5 |
| CMO Sub-Team | 0 | 2 (Strategist + Designer) |
| GMs | 3 | 3 |
| Sub-Agents | 9 | 9 |
| **Total** | **17** | **19** |

---

## File Structure

```
.agents/skills/email-designer/
├── SKILL.md                          ← Router + agent identity
├── config.json                       ← Paperclip agent metadata
├── golden-rules.md                   ← 14 non-negotiable rules
├── pipeline.md                       ← Phase pipeline overview + execution order
├── qc-scoring.md                     ← 16-check QC system (/170)
├── error-recovery.md                 ← Error → solution lookup table
├── resume-state-format.md            ← FIGMA-FINISH-PROMPT.md template
├── brands/
│   ├── spa.md                        ← SPA node IDs, grid, colors, fonts, CTA, decoratives
│   ├── aes.md                        ← AES node IDs, grid, colors, fonts, CTA
│   └── slim.md                       ← SLIM node IDs, grid, colors, fonts, pre-header
├── phases/
│   ├── phase-0-connect.md            ← MCP setup, channel join, grid discovery, topic auto-discover
│   ├── phase-1-extract-copy.md       ← Copy manifest + scaffold production frame
│   ├── phase-1.5-image-discovery.md  ← Image bank enumeration + semantic matching
│   ├── phase-1.6-copy-validation.md  ← QA gate before design work
│   ├── phase-2-text-hierarchy.md     ← Fonts, sizes, alignment, colors
│   ├── phase-3-cta-buttons.md        ← Brand-specific CTA clone + place
│   ├── phase-3.5-logos.md            ← Real vector logo verification + clone
│   ├── phase-4-spacing.md            ← Dead zone closure + overlap detection
│   ├── phase-5-images.md             ← Resolution check + semantic match + place
│   ├── phase-5.5-nano-banana.md      ← AI image generation fallback
│   ├── phase-6-colours.md            ← Brand palette + gradients + section BGs
│   ├── phase-7-footer.md             ← Clone fixed footer (untouchable)
│   ├── phase-8-waves.md              ← Optional section dividers
│   ├── phase-9-decorative.md         ← Variety-scored decorative elements
│   ├── phase-9.5-icons.md            ← Icon generation + numbered fallback
│   ├── phase-10-z-order.md           ← Layer stacking verification
│   ├── phase-11-quality-scoring.md   ← Automated /170 QC scorecard
│   ├── phase-12-save-state.md        ← Session continuity + child-tree audit
│   └── phase-17-html-export.md       ← Figma → Gmail-safe HTML
```

---

## Agent Identity

### Email Designer

| Property | Value |
|----------|-------|
| Title | Email Designer |
| Reports to | Email Marketing Strategist |
| Runtime | Claude Code |
| Trigger | `/emaildesign <brand> [resume]` or delegated by Strategist |
| MCP tools | figma-write, nano-banana, klaviyo |
| Brands | SPA, AES, SLIM (routed via `brands/<brand>.md`) |

### Email Marketing Strategist

| Property | Value |
|----------|-------|
| Title | Email Marketing Strategist |
| Reports to | CMO |
| Runtime | Claude Sonnet |
| Responsibility | Plans email campaigns: topics, calendar, audiences, A/B strategy |
| Reads | Quarterly email plans, marketing calendar, brand voice docs |
| Delegates to | Email Designer (for Figma build + HTML export) |

---

## Input/Output Contract

### Email Designer receives:

| Input | Source | Required |
|-------|--------|----------|
| Brand | Strategist or user | Yes |
| Figma channel ID | User | Yes |
| Email topic(s) | Strategist or auto-discover from grid | No (can auto-discover) |
| Emailer type | Strategist or auto-detect | No (can auto-detect) |
| Copy draft (Text-Based) | Strategist | Only for Text-Based emailers |

### Email Designer delivers:

| Output | Description |
|--------|-------------|
| Production frames | Completed Figma designs in Row 7 |
| QC scorecard | /170 automated score with verdict |
| HTML files | Production (placeholder URLs) + preview (base64 embedded) |
| Asset inventory | All images, icons, their sources and node IDs |
| State file | FIGMA-FINISH-PROMPT.md for session continuity |

---

## Routing Logic

1. Parse brand from argument → load `brands/<brand>.md`
2. Load `golden-rules.md` + `pipeline.md`
3. Check for resume state at `.tmp/emails/<brand>-emailers/FIGMA-FINISH-PROMPT.md`
4. Fresh → execute full pipeline phase by phase
5. Resume → jump to first incomplete phase
6. At each phase → read `phases/<phase>.md`, execute, save state
7. On completion → return QC scorecard + HTML export report to Strategist

---

## Autonomy Boundaries

| Action | Authority |
|--------|-----------|
| All 17 design phases | Autonomous |
| Image selection from bank | Autonomous |
| Decorative placement | Autonomous |
| QC scoring | Autonomous |
| Copy manifest approval (empty/ambiguous wireframe) | Escalate to Strategist |
| 2+ LOW-confidence image matches | Escalate to Strategist |
| QC score < 112 (SIGNIFICANT REWORK) | Escalate to Strategist |
| Campaign activation | Escalate to CEO |
| Budget decisions | Escalate to CEO |

---

## Brand Config Schema

Each `brands/<brand>.md` file follows this schema:

```
# Email Designer — [Brand] Config

## Identity
Brand, abbreviation, persona, social handle, trust claim

## Grid Node IDs
Row 1 (Logos), Row 2 (Colours), Row 4 (Elements),
Row 5 (Footer), Row 6 (Source), Row 7 (Target), Wave sources

## Color Palette (authoritative)
Body BG, section alt, CTA, accent, text, muted,
hero gradient, primary gradient — all hex values + usage notes

## Typography
Designed emailer fonts (shared) + Text-Based fonts (brand-specific)
Case rules, line heights, letter-spacing

## CTA Spec
Size, fill, radius, text style, chevron rule, font

## Decorative Elements
Element types + source node IDs, size/opacity/rotation ranges,
placement strategy, secondary accents

## Brand-Specific Phases
SPA: Italianno script (Phase 2.6), flower petals
SLIM: Pre-header bar (Phase 6.6)
AES: Before/After cards

## Image Filters
Temperature, saturation, contrast, exposure values

## Expected Output Reference
Minimum elements per completed emailer
```

---

## Integration Points

### Upstream (receives work from)
- Email Marketing Strategist sends task with brand, channel ID, topic(s), type
- Strategist reads quarterly email plans from `marketing/email-marketing/<brand>-Q2-2026-email-plan.md`
- Strategist decides WHAT to build. Designer decides HOW.

### Downstream (delivers to)
- Returns QC scorecard + HTML to Strategist
- Strategist reviews, routes HTML to Klaviyo for campaign assembly
- GM Marketing Agents get notified email assets are ready for their brand

### Shared Resources
- `config/emailer-guidelines.md` — definitive spec (read-only)
- `config/branding_guidelines.md` — brand voice context
- `.tmp/emails/<brand>-emailers/` — working directory
- Figma document (via MCP)

### MCP Tool Access
- `figma-write` — all Figma read/write operations (~60 tools)
- `nano-banana` — AI image generation/editing (5 tools)
- `klaviyo` — email template upload (future, post-HTML export)

---

## Session Management

- State file at `.tmp/emails/<brand>-emailers/FIGMA-FINISH-PROMPT.md` enables resume
- Every phase saves state before proceeding
- Context protection: save state immediately if running low, resume later
- Multi-emailer batching: early phases batch (both emailers), design phases sequential

---

## Scalability

Adding Brand 4:
1. Create `brands/brand4.md` with node IDs, colors, fonts, CTA specs
2. Add routing entry in SKILL.md brand table
3. No changes to phase files, golden rules, QC, or pipeline
4. Email Marketing Strategist adds new brand to their campaign planning scope

---

## Implementation Plan (files to create)

1. `.agents/skills/email-designer/SKILL.md` — router with agent identity
2. `.agents/skills/email-designer/config.json` — Paperclip metadata
3. `.agents/skills/email-designer/golden-rules.md` — 14 rules from v4.2
4. `.agents/skills/email-designer/pipeline.md` — phase overview
5. `.agents/skills/email-designer/qc-scoring.md` — /170 QC system
6. `.agents/skills/email-designer/error-recovery.md` — error table
7. `.agents/skills/email-designer/resume-state-format.md` — state template
8. `.agents/skills/email-designer/brands/spa.md` — SPA config
9. `.agents/skills/email-designer/brands/aes.md` — AES config
10. `.agents/skills/email-designer/brands/slim.md` — SLIM config
11. `.agents/skills/email-designer/phases/` — 17 phase files (refined from emailbabyskill)
12. Updated `docs/plans/2026-03-31-paperclip-org-design.md` — reflect 19-agent structure
