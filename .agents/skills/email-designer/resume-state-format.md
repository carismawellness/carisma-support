# Email Designer — Resume State File Format

The state file at `.tmp/emails/<brand>-emailers/FIGMA-FINISH-PROMPT.md` enables mid-session resume. Write/update this file after every phase (Golden Rule #6).

---

## Template

```markdown
# Email Designer State — [Brand] [Emailer Name]
Updated: [ISO timestamp]

## Status
CURRENT_PHASE: [phase number, e.g. "5"]
WAVES_DECISION: [WAVES_USED | WAVES_SKIPPED]
EMAILER_TYPE: [DESIGNED | TEXT_BASED]

## Phase Completion
- [x] Phase 0: Connect & Orient
- [x] Phase 0.25: Grid Discovery
- [x] Phase 1: Extract Copy
- [x] Phase 1.5: Image Discovery
- [x] Phase 1.6: Copy Validation
- [ ] Phase 2: Text Hierarchy
- [ ] Phase 3: CTA Buttons
- [ ] Phase 3.5: Logos
- [ ] Phase 4: Spacing & Overlap
- [ ] Phase 5: Images
- [ ] Phase 5.5: Nano Banana (if needed)
- [ ] Phase 6: Colours
- [ ] Phase 7: Footer
- [ ] Phase 8: Waves/Dividers
- [ ] Phase 9: Decorative Elements
- [ ] Phase 9.5: Icons
- [ ] Phase 10: Z-Order
- [ ] Phase 11: QC Scoring
- [ ] Phase 12: Save State (final)
- [ ] Phase 17: HTML Export
- [ ] Phase 18: Klaviyo Upload

## Connection
CHANNEL_ID: [figma channel ID]
DOCUMENT_ID: [figma document ID]

## Production Frames
| Emailer | Frame ID | Dimensions | Status |
|---------|----------|------------|--------|
| [name]  | [id]     | 600x[H]   | [in_progress/complete] |

## Grid Position Map
[From Phase 0.25 — row frames, their IDs, x/y positions, parent IDs]

## Copy Manifest
[Full verbatim copy from Phase 1, organized by section]

### Emailer 1: [Name]
**Hero Section:**
- Headline: [exact text]
- Subheadline: [exact text]
- CTA: [exact text]

**Section 2: [Title]**
- Heading: [exact text]
- Body: [exact text]
- CTA: [exact text]

[... all sections ...]

### Emailer 2: [Name]
[Same structure]

## Image Inventory
| Source Node | Keywords | Dimensions | Assigned To | Status |
|-------------|----------|------------|-------------|--------|
| [node ID]   | [keywords] | [WxH]   | [section]   | [placed/pending/rejected] |

## Icon Inventory
| Section | Style | Prompt Used | Node ID | Method |
|---------|-------|-------------|---------|--------|
| [section] | [description] | [prompt] | [id] | [nano_banana/numbered_fallback/manual] |

## Node Map
| Element | Node ID | Type | Position (x,y) | Size (w×h) | Notes |
|---------|---------|------|-----------------|------------|-------|
| Hero_BG | [id] | RECTANGLE | 0,0 | 600x400 | gradient overlay |
| Hero_Text | [id] | TEXT | 40,120 | 520x80 | Trajan Pro 37px |
[... all tracked elements ...]

## Child-Tree Audit
Audit date: [ISO timestamp]
Production frame: [ID]
Total tracked elements: [N]
Descendants found: [M]
Orphans fixed: [count] — [list element names if any]
Missing elements: [count] — [list element names if any]
Status: [PASS | FIXED | WARNING]

## QC Score Card
[Paste from Phase 11 when complete — see qc-scoring.md for template]

## Brand Colours Quick Reference
[Copy from brands/<brand>.md § Color Palette for active brand]

## KLAVIYO
[Populated by Phase 18 — one block per emailer]

### <Emailer Name>
Template ID: [id or "not yet uploaded"]
Edit URL: https://www.klaviyo.com/email-editor/[id]/edit
Assets uploaded: [N/M]
Klaviyo HTML file: .tmp/emails/<brand>-emailers/<emailer-name>-klaviyo.html
Failed placeholders: [list or "None"]

## Notes
[Any decisions, skipped steps, or issues to address on resume]
```

---

## Resume Instructions

When `/emaildesign <brand> resume`:

1. **Read** `.tmp/emails/<brand>-emailers/FIGMA-FINISH-PROMPT.md`
2. **Parse** the Phase Completion checklist → find first unchecked `[ ]` phase
3. **Use existing data** — Copy Manifest, Image Inventory, Node Map are already extracted. Don't re-extract.
4. **Always re-run Phase 0.25** — grid positions may have changed between sessions
5. **Continue** from the first incomplete phase
6. **Verify connection** — join the Figma channel, load MCP tools before proceeding

## Backward Compatibility

If resuming from a legacy v3 state file (no Image Inventory, no QC Score Card):
- Parse existing sections normally
- Run Phase 1.5 (Image Discovery) fresh — the section will be missing from old state
- Run Phase 9.5 (Icons) fresh — the section will be missing
- Run Phase 11 (QC Scoring) fresh — the section will be missing
- Append new sections to the file after each phase completes
