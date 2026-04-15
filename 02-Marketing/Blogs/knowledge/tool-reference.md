# Tool Reference — Blog Production

**Location of all tools:** `tools/` directory in the Carisma AI project root

---

## `tools/add_docs_hyperlinks.py`

**Purpose:** Converts `anchor text [→ URL]` visible link placeholders in Google Docs to real clickable hyperlinks using the Google Docs API `batchUpdate`.

**When to run:** After Step 7 (Google Doc creation). Run once per batch of new docs.

**Location:** `/Users/mertgulen/Library/CloudStorage/GoogleDrive-mertgulen98@gmail.com/My Drive/Carisma Wellness Group/Carisma AI /Carisma AI/tools/add_docs_hyperlinks.py`

---

### Before Running

Update `DOCS_CONFIG` at the top of the script with the new doc(s):

```python
BASE_DIR = "/Users/mertgulen/Library/CloudStorage/GoogleDrive-mertgulen98@gmail.com/My Drive/Carisma Wellness Group/Carisma AI /Carisma AI/.tmp/blog-drafts/[brand]/[month-year]"

DOCS_CONFIG = [
    {
        "doc_id": "[Google Doc ID — from the URL: .../d/DOC_ID/edit]",
        "title": "Post N — [Brief description]",
        "final_md": f"{BASE_DIR}/FINAL-[nn]-[slug].md",
    },
    # Add one entry per doc
]
```

**Where to find the Doc ID:** In the Google Doc URL: `https://docs.google.com/document/d/`**`1BypMbdCTbTq8AKgWDsrWFWQmZCpKDaQZUkHi5A7rd8A`**`/edit`

---

### Running the Script

```bash
python3 tools/add_docs_hyperlinks.py
```

Run from the Carisma AI project root directory.

**Required Python packages:**
```bash
pip install google-api-python-client google-auth google-auth-httplib2
```

---

### What the Script Does

1. Reads each FINAL.md file to extract all `[anchor text](URL)` pairs
2. **Deduplicates** — if the same `(anchor, url)` pair appears 3× in the markdown, it's treated as one unique pair and all 3 occurrences in the Google Doc are found and linked
3. Fetches the Google Doc content via the Docs API
4. Builds a flat text map with character-level position tracking
5. Finds every `anchor text [→ URL]` occurrence in the doc (handles both `→` and `->` formats)
6. Sorts occurrences in **reverse order** (highest position first) so deletions don't shift earlier positions
7. Sends a `batchUpdate` request that:
   - Applies `updateTextStyle` with `link.url` to each anchor text
   - Deletes each ` [→ URL]` suffix

---

### Credentials

- **Token:** `~/.go-google-mcp/token.json` (has `refresh_token` — auto-refreshes)
- **Client secrets:** `~/.go-google-mcp/client_secrets.json`
- **Scope required:** `https://www.googleapis.com/auth/documents` (included in go-google-mcp auth)

**If `HttpError 401 Unauthorized`:**
```bash
go-google-mcp auth login --secrets ~/.go-google-mcp/client_secrets.json
```

---

### Expected Output

Successful run for a batch of 4 posts:

```
============================================================
Carisma Blog — Add Hyperlinks to Google Docs
============================================================

────────────────────────────────────────────────────────────
  Post 1 — Fat Freezing Malta
  3 unique links in FINAL.md (4 total incl. dupes)
  Doc text length: 8,432 chars
  ✓ Found 1× 'weight loss protocol'
  ✓ Found 1× 'muscle stimulation'
  ✓ Found 1× 'book your free consultation'

  Sending 6 batchUpdate requests (3 links)...
  ✅ SUCCESS — 3 hyperlinks applied
...
============================================================
Complete. Open each Google Doc to verify hyperlinks are blue and clickable.
```

---

### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "NOT FOUND" for all links | Script run a second time; suffixes already deleted | Expected. Links are already applied. |
| Text corruption in doc body | `DOCS_CONFIG` pointed to wrong FINAL.md (deduplication mismatch) | Verify `final_md` path is correct; trash corrupted doc and recreate |
| `HttpError 401` | Token expired | Re-auth: `go-google-mcp auth login` |
| `HttpError 403` | Missing Docs API scope | Check that go-google-mcp token has documents scope |
| Links not blue after run | Wrong `doc_id` in config | Verify doc ID from the actual Google Doc URL |
| Script finds 0× for a known link | Doc has different format than expected | Check if doc was created with `->` (ASCII) vs `→` (Unicode). Script handles both. |

---

### Recreating a Corrupted Google Doc

If a doc is corrupted after a bad hyperlink run:

1. Trash the corrupted doc:
   ```
   mcp__google-workspace__drive_trash_file with file_id = [corrupted doc ID]
   ```
2. Recreate the doc from FINAL.md using `blog-google-doc-publisher`
3. Update `DOCS_CONFIG` with the new doc ID
4. Run the hyperlink script again

---

## Google Workspace MCP

**Binary:** `/Users/mertgulen/go/bin/go-google-mcp`
**Source:** `github.com/matheusbuniotto/go-google-mcp`

**Available MCP tools used in blog pipeline:**
- `mcp__google-workspace__drive_find_files` — search Drive by folder name
- `mcp__google-workspace__docs_create_document` — create a new Google Doc
- `mcp__google-workspace__drive_trash_file` — trash a file (for corrupted docs)
- `mcp__google-workspace__docs_read_document` — read doc content (rarely needed in pipeline)

**Denied operations (as of April 2026):**
- `mcp__google-workspace__drive_create_folder` — cannot create folders programmatically
- `mcp__google-workspace__drive_update_file` — cannot move files between folders

**Re-auth command:**
```bash
go-google-mcp auth login --secrets ~/.go-google-mcp/client_secrets.json
```

**Token location:** `~/.go-google-mcp/token.json`

---

## `tools/check_unprocessed_meetings.py`

**Purpose:** Checks for unprocessed meeting transcripts in `miscellaneous/meetings/raw/`
**When to run:** At every session start (auto-triggered by CLAUDE.md instructions)
**Unrelated to blog pipeline** — documented here for completeness only
