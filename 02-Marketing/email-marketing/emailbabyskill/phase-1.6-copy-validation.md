# Phase 1.6: Copy Validation Gate

**Runs after Phase 1.5 (Image Discovery), before Phase 2 (Text Hierarchy).** This is a QA gate — do NOT skip it.

## 1.6.1 Validate Copy Manifest Against Wireframe

1. Re-read the Row 6 wireframe frame using `get_node_info` (same source IDs as Phase 1.1)
2. Count total text nodes in wireframe → compare against Copy Manifest entry count
   - If Manifest has fewer entries than wireframe text nodes → **missing copy detected**
   - List the missing nodes by ID and content
3. For each Copy Manifest entry, verify the text is **verbatim** — character-for-character match against the source node
   - Trim whitespace from both sides before comparing
   - Flag any entries where the extracted text differs from the source

## 1.6.2 Validate Copy Placement in Row 6

If Phase 0.3 placed drafted copy into Row 6:
1. `get_node_info` on BOTH Row 6 frames for the brand (e.g., SPA_Value_01 + SPA_Value_02)
2. Verify every section has copy placed — no empty text nodes with placeholder text remaining
3. Verify no images, frames, or wireframe structures were accidentally cloned into Row 6 (Golden Rule 10 violation)
4. If either wireframe frame is incomplete → fix it now before proceeding

## 1.6.3 Validate Production Frame Scaffold

1. `get_node_info` on the Row 7 production frame
2. Verify all Copy Manifest sections have corresponding text nodes placed in the scaffold
3. Verify every element is a child of the production frame (not floating at page level)
4. Verify no duplicate text — same copy should not appear twice in the scaffold

## 1.6.4 Report

Output a brief validation summary:

```
COPY VALIDATION — [Emailer Name]
Wireframe text nodes: [N]
Manifest entries: [N]
Mismatches: [N] (list if any)
Row 6 status: [COMPLETE | ISSUES FOUND]
Scaffold status: [COMPLETE | ISSUES FOUND]
VERDICT: [PASS | FIX REQUIRED]
```

If VERDICT is FIX REQUIRED → fix the issues before proceeding to Phase 2. Do NOT continue with broken copy.

## 1.6.5 Save State

Update `.tmp/emails/<brand>-emailers/FIGMA-FINISH-PROMPT.md` — mark Phase 1.6 complete with validation results.
