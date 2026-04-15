# Phase 1: Extract Copy & Scaffold Production

> **Copy source depends on emailer type:**
> - **Designed emailers:** Copy was placed in Row 6 during Phase 0.3 as minimal text (headlines, labels, CTAs). Extract verbatim. Never add paragraphs. No persona sign-off.
> - **Text-Based emailers:** Full copy was drafted and placed in Row 6 during Phase 0.3 (greeting, body sections, CTAs, persona sign-off). Extract all of it.
>
> If Row 6 is empty or has only placeholder text → STOP and ask the user.

## 1.1 Extract from Wireframe

`mcp__figma-write__get_node_info` on the Copy + Wireframe frame (Row 6). Source IDs:
- SPA: `4445:527` | `4445:565`
- AES: `4445:600` | `4445:640`
- SLIM: `4445:670` | `4445:714`

Extract ALL text nodes from the `children` array → build the **Copy Manifest**.

## 1.2 Build Copy Manifest

Map every extracted text node to its production role:

```
## COPY MANIFEST — [Emailer Name]
Source: Row 6 wireframe [ID]
Extracted: [date]

### PRE-HEADER (SLIM only — skip for SPA/AES)
- Bar text: "[exact text from steel blue strip, if present]"

### HERO
- Headline: "[exact text]"
- Subheadline: "[exact text]"

### INTRO
- Greeting: "Hi [First Name],"
- Body: "[exact text]"

### SECTION: [Name]
- Heading: "[exact text]"
- Body: "[exact text]"
- Labels: "[exact text]"

### CTA
- Button text: "[exact text]"

### TESTIMONIAL
- Stars: [count]
- Quote: "[exact text]"
- Attribution: "[exact text]"

### SIGN-OFF (Text-Based ONLY)
- "[exact text]"
```

## 1.3 Scaffold Production Frame

> **GOLDEN RULE #14: NEVER create a new frame for Row 7.** Use the frame IDs from SKILL.md, verified by Phase 0.25's Grid Position Map.
>
> **Pre-requisite:** Phase 0.25 MUST be complete. You need the Grid Position Map to know the correct frame ID, its parent, and its verified grid position. If Phase 0.25 was not run, go back and run it now.

1. **Look up the verified Row 7 frame** from your Grid Position Map (Phase 0.25 output):
   - SPA: `4495:2255` (emailer 1) | `4495:2313` (emailer 2)
   - AES: `4495:2354` (emailer 1) | `4495:2356` (emailer 2)
   - SLIM: `4495:2358` (emailer 1) | `4495:2360` (emailer 2)
2. `get_node_info` on that frame → confirm:
   - **Position** matches the Grid Position Map (same x, y as recorded in Phase 0.25)
   - **Parent** is the correct grid row frame (not page level)
   - If position or parent is wrong → fix NOW using `insert_child` + `move_node` per Phase 0.25 Step 4
3. **Set the production frame background:** `set_fill_color` on this existing frame (`#fdf7ec` SPA, `#ffffff` AES/SLIM). Do NOT create a new frame.
4. Create child elements and `insert_child` each into the Row 7 frame:
   - `create_rectangle` / `create_text` for each section element
   - **IMMEDIATELY** `insert_child(parentId: "<ROW_7_FRAME_ID>", childId: "<new_id>")` after every create/clone
   - All content must be a descendant of the Row 7 frame — nothing at page level
5. **Verification checkpoint (MANDATORY):**
   - `get_node_info` on the Row 7 frame → confirm `children` array has your elements
   - Confirm frame position hasn't shifted from the Grid Position Map values
   - If empty → wrong frame. Delete and redo.
6. Record the grid frame ID + its verified position in the state file. Never record a self-created frame ID.
7. **Next:** Phase 1.5 (Image Bank Discovery).

## 1.4 Copy Selection for Designed Emailers

Designed emailers use LESS copy than the wireframe contains. Cherry-pick:
- Hero headline + subheadline (verbatim)
- Section headings (verbatim)
- Key labels (verbatim)
- CTA button text (verbatim)
- Testimonial quote + attribution (verbatim)
- Brief body snippets where needed (NOT full paragraphs)

**If the wireframe has placeholder text or is empty: STOP and ask the user.**

## 1.5 Save State

Write Copy Manifest to `.tmp/emails/<brand>-emailers/FIGMA-FINISH-PROMPT.md`

**Next:** Proceed to Phase 1.5 (Image Bank Discovery), then Phase 1.6 (Copy Validation) before any design work.
