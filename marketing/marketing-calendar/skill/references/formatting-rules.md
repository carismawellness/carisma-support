# Formatting Rules Reference

Exact formatting rules for the Marketing Master Google Sheet calendar. These rules ensure visual consistency across all months.

---

## Font Color

**Target:** `RGB(0.608, 0.553, 0.514)` — warm brownish-gray

This is the ONLY font color used for data cells. All campaign names, budgets, emails, SMM entries, and Google campaign text use this color.

**API application:**
```json
{
  "repeatCell": {
    "range": {
      "sheetId": 703110006,
      "startRowIndex": "<0-indexed row>",
      "endRowIndex": "<0-indexed row + 1>",
      "startColumnIndex": "<month start col>",
      "endColumnIndex": "<month end col + 1>"
    },
    "cell": {
      "userEnteredFormat": {
        "textFormat": {
          "foregroundColorStyle": {
            "rgbColor": { "red": 0.608, "green": 0.553, "blue": 0.514 }
          }
        }
      }
    },
    "fields": "userEnteredFormat.textFormat.foregroundColorStyle"
  }
}
```

**Important:** Use `foregroundColorStyle.rgbColor` (not `foregroundColor`) for consistency. Google Sheets handles these differently.

---

## Bold

**Campaign text bold:** `false` — NEVER bold campaign names, email names, or any data cell text.

**API application:** Include `"bold": false` in the textFormat when applying formatting.

---

## Background Colors (per brand section)

| Brand | RGB | Visual |
|-------|-----|--------|
| Spa | `(0.973, 0.953, 0.922)` | Beige/cream |
| Aesthetics | `(0.918, 0.945, 0.941)` | Teal |
| Slimming | `(0.973, 1.000, 0.965)` | Light green-white |

Background colors are already set in the sheet template. New month formatting should be cloned from the previous month using `copyPaste` with `PASTE_FORMAT`.

---

## Green Highlighting

**Rule:** Green highlighting is MANUAL ONLY.

- Green = human marks a campaign/email as "live" or "confirmed"
- The calendar strategy skill NEVER adds green highlights programmatically
- When writing a new month, ensure no green backgrounds are inherited from format cloning
- If green appears after copyPaste, remove it by resetting to the brand's default background color

---

## Format Cloning Process

To format a new month, clone from the previous month:

```json
{
  "copyPaste": {
    "source": {
      "sheetId": 703110006,
      "startRowIndex": 4,
      "endRowIndex": 250,
      "startColumnIndex": "<previous month start col>",
      "endColumnIndex": "<previous month start col + 1>"
    },
    "destination": {
      "sheetId": 703110006,
      "startRowIndex": 4,
      "endRowIndex": 250,
      "startColumnIndex": "<new month start col>",
      "endColumnIndex": "<new month end col + 1>"
    },
    "pasteType": "PASTE_FORMAT"
  }
}
```

**Note:** Clone a single column's format and repeat across all days in the new month. This ensures consistent formatting without carrying over data.

---

## Font Color Fix Script Pattern

If font colors are wrong (e.g., cells show black text instead of the warm gray), use the pattern from `tools/fix_april_font_colors.py`:

1. **Auth:** Read credentials from `~/.go-google-mcp/client_secrets.json` and token from `~/.go-google-mcp/token.json`
2. **Read reference:** Get formatting from a known-good column in the previous month
3. **Compare:** Find cells with wrong color (black or default) that should be warm gray
4. **Fix:** Apply `repeatCell` with the correct `foregroundColorStyle` per row
5. **Batch:** Send fixes in chunks of 100 requests (API limit)
6. **Verify:** Read back a sample of fixed cells to confirm

**Color comparison helper:**
```python
def is_black_or_default(color_tuple):
    r, g, b = color_tuple
    return r < 0.05 and g < 0.05 and b < 0.05
```

---

## QC Formatting Checks

After formatting a new month, verify:

1. Sample 10 random data cells per brand — all should be RGB(0.608, 0.553, 0.514)
2. No cells with black (0, 0, 0) font color in data rows
3. No green background highlights in the new month
4. No bold text on campaign names
5. Background colors match brand defaults per section
6. Font family and size match the previous month

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using `foregroundColor` instead of `foregroundColorStyle` | Always use `foregroundColorStyle.rgbColor` for consistency. |
| Setting font color as black | All data cells are RGB(0.608, 0.553, 0.514). |
| Bolding campaign names | `bold: false` always. |
| Adding green highlights | Green is manual only. Never programmatic. |
| Not verifying after format application | Always read back a sample to confirm. |
| Applying format to header rows | Only apply to data rows (row 5+), not headers. |
