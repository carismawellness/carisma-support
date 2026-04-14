# Blog Google Doc Publisher

**Skill name:** `blog-google-doc-publisher`
**Pipeline position:** Step 7
**Input:** Clean FINAL.md from `blog-final-format-qc`
**Output:** Google Doc URL → Gate 3

---

## What This Skill Does

1. Reads the FINAL.md file
2. Creates a Google Doc with proper title, meta block, and formatted body
3. Saves it to the `Carisma Blog Drafts` folder in Drive (or root if folder access denied)
4. Returns the shareable Google Doc URL
5. Triggers the hyperlink script to convert `anchor text [→ URL]` to real clickable links

---

## Drive Folder

**Target folder name:** `Carisma Blog Drafts`

Before creating the doc, search Drive for this folder using `mcp__google-workspace__drive_find_files`. If it does not exist and `drive_create_folder` is available — create it. If denied, see Known Limitations below.

---

## Document Structure

Format the Google Doc in this order:

```
[BLOG DRAFT — AWAITING CMS UPLOAD]

BRAND: [brand name]
META TITLE: [meta title]
META DESCRIPTION: [meta description]
URL SLUG: [slug]
PRIMARY KEYWORD: [keyword]
AUTHOR: Sarah / Katya
STATUS: Awaiting Gate 3 approval

─────────────────────────────────────

[Full blog post body — markdown converted to plain text with heading structure preserved]
```

**Formatting rules inside the Doc:**
- Strip all `## ` and `### ` and `# ` heading prefixes — heading text stays, marker is removed
- Bold (`**text**`) → preserve as-is
- Markdown links `[anchor text](URL)` → convert to `anchor text [→ URL]` (the hyperlink script converts these to real links)
- Do NOT include the meta block inside the blog body — keep it in the header section only

---

## Execution Steps

1. Read the FINAL.md file — extract: meta title, meta description, slug, keyword, full body
2. Search Drive for folder `Carisma Blog Drafts` → get folder ID (or note limitation)
3. Call `mcp__google-workspace__docs_create_document` with document title = meta title
4. Call `mcp__google-workspace__drive_update_file` to move doc into folder (if permissions allow)
5. Run `python3 tools/add_docs_hyperlinks.py` to add real hyperlinks
6. Return the Google Doc URL

---

## Known MCP Permission Limitations (as of April 2026)

- `drive_create_folder` — denied. Cannot create new folders programmatically.
- `drive_update_file` — denied. Cannot move files between folders.

**Workaround:** Create the doc normally. It will land in Drive root. Note this in the output so the human knows to manually move it to `Carisma Blog Drafts`. Do NOT fail or retry — just document it and proceed.

---

## Adding Real Hyperlinks After Doc Creation

After creating the doc, run:

```bash
python3 tools/add_docs_hyperlinks.py
```

**Before running:** Update `DOCS_CONFIG` in the script with the new doc ID(s) and FINAL.md paths:

```python
DOCS_CONFIG = [
    {
        "doc_id": "[doc ID from the Google Doc URL]",
        "title": "Post N — [Description]",
        "final_md": f"{BASE_DIR}/FINAL-[nn]-[slug].md",
    },
]
```

**What it does:**
- Extracts all `[anchor text](URL)` pairs from FINAL.md (deduplicated)
- Finds each `anchor text [→ URL]` occurrence in the Google Doc
- Applies `updateTextStyle` with `link.url` to the anchor text (makes it blue + underlined)
- Deletes the ` [→ URL]` suffix
- Processes in reverse doc order so deletions don't shift earlier positions

**Important:** The script deduplicates `(anchor, url)` pairs before searching. Duplicate pairs in FINAL.md (e.g., same "weight loss protocol" link appears 3×) will be found as 3 occurrences and each linked once — not applied 3× (which would corrupt the text).

---

## Output Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GOOGLE DOC CREATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title: [meta title]
Brand: [brand]
Folder: Carisma Blog Drafts (or: Drive root — move manually)
URL: [Google Doc URL]
Status: Ready for Gate 3 human review
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| Creating Doc without finding/creating folder first | Always resolve folder ID before creating doc |
| Dumping raw markdown into the Doc | Convert headings to plain text; strip `##` markers |
| Including meta block inside the blog body | Meta block goes in header section only |
| Not returning the URL | Always surface the Doc URL — that's the Gate 3 handoff |
| Failing when `drive_update_file` is denied | Expected limitation — create at root, note in output |
| Running hyperlink script without updating `DOCS_CONFIG` | Always update the config with new doc ID before running |
| "NOT FOUND" for all links after first script run | Expected — links already applied; this is idempotent |

---

## Hyperlink Script Error Reference

| Error | Fix |
|---|---|
| `HttpError 401 Unauthorized` | Re-auth: `go-google-mcp auth login --secrets ~/.go-google-mcp/client_secrets.json` |
| Text corruption in doc body | Missing deduplication — ensure `seen` set is active in `process_doc()` |
| Script matches ASCII `->` but not Unicode `→` | Regex handles both: `r"\s*\[(?:→|->)\s*"` |
| All links show "NOT FOUND" after second run | Normal — suffixes already deleted from first run |
