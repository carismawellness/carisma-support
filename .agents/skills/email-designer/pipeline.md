# Email Designer — Phase Pipeline

## Execution Order

**When you reach each phase, you MUST Read the phase file for detailed instructions before executing.**

| Step | Phase | Summary | File |
|------|-------|---------|------|
| 1 | Connect & Orient | Load MCP, join Figma, **auto-discover topics from Topics row** | `phases/phase-0-connect.md` |
| 1.5 | **Grid Discovery** | **Discover grid structure, verify Row 6/7 frame positions + parents. MANDATORY before building.** | `phases/phase-0-connect.md` (§ 0.25) |
| 2 | Draft & Place Copy | Draft copy per type, place **TEXT ONLY** in Copy + Wireframe row (Row 6) | `phases/phase-0-connect.md` (§ 0.3) |
| 3 | Extract Copy | Build Copy Manifest from Row 6 wireframe | `phases/phase-1-extract-copy.md` |
| 3.5 | Image Discovery | Enumerate Image Bank, keyword extraction, semantic matching prep | `phases/phase-1.5-image-discovery.md` |
| 3.6 | Copy Validation | QA gate: validate Copy Manifest against wireframe before design work | `phases/phase-1.6-copy-validation.md` |
| 4 | Scaffold Production | Wireframe + placeholders + copy into Final Production (Row 7). **Uses Grid Position Map from 0.25.** | `phases/phase-1-extract-copy.md` (§ 1.3) |
| 5 | Text Hierarchy | Fonts, sizes, centre alignment, colors | `phases/phase-2-text-hierarchy.md` |
| 6 | CTA Buttons | Build brand-spec CTAs from Buttons row (Hero + middle + before footer) | `phases/phase-3-cta-buttons.md` |
| 7 | Logos | Clone **real vector logos** from Row 1. Verify node type is FRAME/GROUP, never TEXT. | `phases/phase-3.5-logos.md` |
| 8 | Spacing & Overlap | Close dead zones, tighten gaps, **detect element overlaps** | `phases/phase-4-spacing.md` |
| 9 | Images | Discover → **semantic match** → **resolution verify** → clone → place. Fallback: Nano Banana | `phases/phase-5-images.md` |
| 9.5 | Nano Banana (fallback) | AI image generation when Image Bank lacks matches | `phases/phase-5.5-nano-banana.md` |
| 10 | Colours | Apply brand gradients + solids from Colours row. **SLIM: add pre-header bar.** | `phases/phase-6-colours.md` |
| 11 | Footer | Clone/duplicate fixed footer from Row 5 | `phases/phase-7-footer.md` |
| 12 | Dividers | **Optional:** Clone wave dividers IF they work. If not, use clean BG transitions. | `phases/phase-8-waves.md` |
| 13 | Decorative & Icons | **Varied** elements (3-4 types, 2x size range). Icons: Nano Banana → **numbered fallback** | `phases/phase-9-decorative.md` + `phases/phase-9.5-icons.md` |
| 14 | Z-Order | Verify layer stacking, final resize | `phases/phase-10-z-order.md` |
| 15 | QC Scoring | **16 core checks (/160)** + 2 bonus (/10) = /170. See `qc-scoring.md` | `phases/phase-11-quality-scoring.md` |
| 16 | Save State | Write FIGMA-FINISH-PROMPT.md for session continuity | `phases/phase-12-save-state.md` |
| 17 | HTML Export | Export production frame to Gmail-safe HTML | `phases/phase-17-html-export.md` |
| 18 | Klaviyo Upload | Ask CTA URL → upload assets → substitute URLs → create template | `phases/phase-18-klaviyo-upload.md` |

---

## Multi-Emailer Batch Strategy

Each brand has **2 emailers** (e.g., SPA_Value_01 + SPA_Value_02). Handle them efficiently:

### Batch Early Phases (both emailers together)
- **Phase 0:** Connect once, discover grid for both
- **Phase 0.25:** Map grid positions for both emailers
- **Phase 1:** Extract Copy Manifests for both
- **Phase 1.5:** Build shared Image Bank inventory (one bank, both emailers reference it)
- **Phase 1.6:** Validate copy for both

### Sequential Design Phases (one emailer at a time)
- **Phases 2-12:** Complete Emailer 1 fully, then Emailer 2
- Rationale: design decisions in one emailer inform the other, but context is cleaner working one at a time

### Shared Resources
- Image Bank: discovered once in Phase 1.5, referenced by both emailers
- Wave sources: same set of wave dividers for both emailers
- Footer: same footer template cloned for both

### Phase 18 Batch
- CTA URL: asked once, applied to both emailers
- Shared assets (logo, footer, waves): uploaded once, URL reused in both HTMLs
- Template creation: sequential — emailer 1 then emailer 2

---

## Phase Sequencing Rules

1. **Never skip phases.** Each phase builds on the previous one's output.
2. **Phase 0.25 is MANDATORY.** Grid discovery must happen before any building.
3. **Phase 1 → 1.5 → 1.6 → 2:** Copy extraction before image discovery before validation before design work.
4. **Phase 5 triggers 5.5:** If Image Bank lacks matches, Nano Banana generates them. Phase 5.5 is not executed independently.
5. **Phase 9 triggers 9.5:** Same pattern — icons come from Nano Banana or fallback to numbered text.
6. **Phase 11 before 12:** QC scoring must happen before save state (score is part of the state).
7. **Phase 12 before 17:** Save state before HTML export (state file references are needed for export).
8. **Phase 17 before 18:** HTML must be generated and validated before Klaviyo upload.
9. **Save state after EVERY phase** (Golden Rule #6), not just Phase 12.

---

## Context Protection

If running low on context during any phase:
1. **Save state immediately** to `.tmp/emails/<brand>-emailers/FIGMA-FINISH-PROMPT.md`
2. Record current phase, completed work, and remaining items
3. Resume later with `/emaildesign <brand> resume`

See `resume-state-format.md` for the complete state file template.
