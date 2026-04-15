# Blog Final Format QC

**Skill name:** `blog-final-format-qc`
**Pipeline position:** Step 6
**Input:** FINAL.md with internal links applied
**Output:** Clean FINAL.md → `blog-google-doc-publisher`

---

## What This Agent Does

Last automated agent before human review. Strips every formatting pattern that signals AI-generated content. Not tone, not keywords, not structure — just the visual and typographic fingerprints that flag a piece as machine-written.

This is a mechanical sweep. Does not rewrite for voice (that was the humanizer's job). Fixes formatting tells.

---

## What You Fix — 7 Checks

---

### 1. Em Dashes — ZERO TOLERANCE

Em dashes (—) are the single strongest AI writing signal in 2025–2026. Remove every one.

**How to fix:**
- `"You didn't fail — the plan failed you."` → `"You didn't fail. The plan failed you."`
- `"Katya — our clinical lead — will guide you."` → `"Katya, our clinical lead, will guide you."`
- `"Three things matter — consistency, support, and science."` → `"Three things matter: consistency, support, and science."`
- If the em dash connects two independent clauses: split into two sentences.
- If it's a parenthetical aside: use commas or rewrite.
- Never replace an em dash with a regular hyphen (-) unless it's a compound modifier.

**Check for:** `—` (Unicode U+2014) and `--` used as em dashes.

---

### 2. Raw Markdown in Body Prose

Heading markers (`##`, `###`, `#`) at the START of a line as heading delimiters are acceptable. If they appear INSIDE a paragraph or mid-sentence — remove.

**Bold (`**text**`):** Allowed sparingly. Flag if:
- More than 4 bold phrases in any single H2 section
- Two or more consecutive sentences with bold text
- Bold used on generic phrases rather than genuinely important terms

**Fix:** Remove `**` markers from over-bolded or generic phrases.

**Italics (`*text*`):** Allowed for treatment names, foreign terms, book titles. Remove if used for emphasis in general prose.

---

### 3. AI Sentence Starter Patterns

| AI Pattern | Fix |
|---|---|
| `Here's what you need to know:` | Rewrite — just say the thing |
| `Here's the thing:` | Delete opener, start with the substance |
| `The key takeaway here is` | Cut it |
| `It's worth noting that` | Cut it |
| `What this means for you is` | Rewrite directly |
| `Let's break this down.` | Cut it, go straight to the breakdown |
| `At the end of the day,` | Cut it |
| `The bottom line is` | Cut it |
| `Simply put,` | Cut it |
| `To put it another way,` | Cut it |

---

### 4. Excessive Colons as Sentence Enders

AI uses colons to introduce lists at above-human rates. Check:
- Any paragraph ending with a colon followed by a bullet list in a section that should be flowing prose
- More than 2 colon-introduced lists in the same H2 section

**Fix:** Convert bullets to a flowing sentence, or keep one list and prose-ify the rest.

---

### 5. Ellipsis Overuse

`...` (three dots) or `…` (Unicode ellipsis) used for trailing effect. Allowed: 0 times in a slimming/medical post. Remove or rewrite the sentence.

---

### 6. Parenthetical Overuse

Parenthetical asides `(like this)` more than once per H2 section signals AI rhythm. Flag if:
- 3+ parenthetical asides in a single H2 section
- Any parenthetical that restates what was just said

**Fix:** Rewrite parentheticals as full sentences or delete if redundant.

---

### 7. Robotic Parallel Openers

If 3 or more consecutive sentences in a paragraph start with the same word, vary them.

Example:
> "You deserve support. You deserve a plan. You deserve results." → Keep one, rewrite the others.

---

## What You Do NOT Touch

- Keyword placement (SEO is locked)
- Internal links (already audited)
- Heading structure (H1/H2/H3 hierarchy is locked)
- Meta title, meta description, slug (locked)
- Sentence meaning or content
- Brand voice — if unsure whether a sentence is good or just unusual, leave it

---

## Execution Steps

1. Read the FINAL.md file
2. Run through each of the 7 checks above
3. Fix all confirmed issues in place
4. Overwrite the file
5. Return format QC report

---

## Output Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMAT QC REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Post: [title]
Brand: [brand]

EM DASHES REMOVED: [n] (list each instance and resolution)
MARKDOWN ARTIFACTS FIXED: [n or "none"]
BOLD OVERUSE FIXED: [n or "none"]
AI SENTENCE STARTERS REMOVED: [n or "none"]
ELLIPSIS REMOVED: [n or "none"]
PARENTHETICAL ISSUES: [n or "none"]
PARALLEL OPENERS FIXED: [n or "none"]

TOTAL CHANGES: [n]
STATUS: ✅ CLEAN — ready for Google Doc / ⚠️ CHANGES MADE — review before publishing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Pipeline Position

```
[4] Humanize → [5] Internal Link → [6] Format QC ← you are here → [7] Google Doc → Gate 3
```
