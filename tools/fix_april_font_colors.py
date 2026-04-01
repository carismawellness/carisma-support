#!/usr/bin/env python3
"""Fix font color inconsistencies in April 2026 marketing calendar.

Reads March formatting as reference, identifies cells in April with wrong
font color (typically black instead of the correct gray/brown), and applies
corrections via batchUpdate.
"""

import json
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# ── Auth ──────────────────────────────────────────────────────────────────────
SECRETS_PATH = "/Users/mertgulen/.go-google-mcp/client_secrets.json"
TOKEN_PATH = "/Users/mertgulen/.go-google-mcp/token.json"
SPREADSHEET_ID = "1q40Ke8wRsjnoVOngDupVdwxIWiTFXwYfh1ZwvUa9xtc"
SHEET_NAME = "Calendar '26"
SHEET_ID = 703110006

with open(SECRETS_PATH) as f:
    secrets = json.load(f)["installed"]
with open(TOKEN_PATH) as f:
    token_data = json.load(f)

creds = Credentials(
    token=token_data["access_token"],
    refresh_token=token_data["refresh_token"],
    token_uri="https://oauth2.googleapis.com/token",
    client_id=secrets["client_id"],
    client_secret=secrets["client_secret"],
    scopes=["https://www.googleapis.com/auth/spreadsheets"],
)
if not creds.valid:
    creds.refresh(Request())
    with open(TOKEN_PATH, "w") as f:
        json.dump({
            "access_token": creds.token,
            "expires_in": 3599,
            "refresh_token": creds.refresh_token,
            "scope": token_data.get("scope", ""),
            "token_type": "Bearer",
            "refresh_token_expires_in": token_data.get("refresh_token_expires_in", 0),
        }, f, indent=2)
    print("Token refreshed.")

service = build("sheets", "v4", credentials=creds)
sheets_api = service.spreadsheets()

# ── Config ────────────────────────────────────────────────────────────────────
# March reference column BJ = col index 61 (0-indexed)
MARCH_REF_COL = 61
# April columns CO=92 through DR=121 (0-indexed)
APRIL_START_COL = 92
APRIL_END_COL = 122  # exclusive
# Rows 5-250 (1-indexed) = 4-249 (0-indexed)
START_ROW = 4   # 0-indexed
END_ROW = 250   # exclusive, 0-indexed


def color_to_tuple(color_obj):
    """Convert a Google Sheets color object to a tuple for comparison."""
    if not color_obj:
        return (0.0, 0.0, 0.0)  # default = black
    return (
        round(color_obj.get("red", 0.0), 3),
        round(color_obj.get("green", 0.0), 3),
        round(color_obj.get("blue", 0.0), 3),
    )


def is_black_or_default(color_tuple):
    """Check if a color is black or near-black (default font color)."""
    r, g, b = color_tuple
    return r < 0.05 and g < 0.05 and b < 0.05


def color_tuple_to_obj(color_tuple):
    """Convert a tuple back to a Google Sheets color object."""
    return {"red": color_tuple[0], "green": color_tuple[1], "blue": color_tuple[2]}


# ── Step 1: Read March reference formatting ───────────────────────────────────
print("Reading March reference column (BJ) formatting...")
march_range = f"{SHEET_NAME}!BJ5:BJ250"
march_data = sheets_api.get(
    spreadsheetId=SPREADSHEET_ID,
    ranges=[march_range],
    includeGridData=True,
    fields="sheets/data/rowData/values/userEnteredFormat/textFormat/foregroundColorStyle,sheets/data/rowData/values/userEnteredFormat/textFormat/foregroundColor",
).execute()

# Build a map of row -> foreground color from March
march_colors = {}  # row_index (0-indexed) -> color tuple
march_grid = march_data["sheets"][0]["data"][0]
start_row_offset = 4  # row 5 is 0-indexed row 4

for i, row_data in enumerate(march_grid.get("rowData", [])):
    row_idx = start_row_offset + i
    values = row_data.get("values", [])
    if not values:
        continue
    cell = values[0]
    fmt = cell.get("userEnteredFormat", {})
    text_fmt = fmt.get("textFormat", {})

    # Try foregroundColorStyle first (theme-aware), fall back to foregroundColor
    color_style = text_fmt.get("foregroundColorStyle", {})
    color_obj = color_style.get("rgbColor") if color_style else None
    if not color_obj:
        color_obj = text_fmt.get("foregroundColor")

    if color_obj:
        march_colors[row_idx] = color_to_tuple(color_obj)

print(f"  Found font colors for {len(march_colors)} rows in March reference.")

# Show unique colors found
unique_colors = set(march_colors.values())
print(f"  Unique font colors in March: {len(unique_colors)}")
for c in sorted(unique_colors):
    count = sum(1 for v in march_colors.values() if v == c)
    print(f"    RGB{c} — {count} rows")

# ── Step 2: Read April formatting ─────────────────────────────────────────────
print("\nReading April columns (CO:DR) formatting...")
april_range = f"{SHEET_NAME}!CO5:DR250"
april_data = sheets_api.get(
    spreadsheetId=SPREADSHEET_ID,
    ranges=[april_range],
    includeGridData=True,
    fields="sheets/data/rowData/values/userEnteredFormat/textFormat/foregroundColorStyle,sheets/data/rowData/values/userEnteredFormat/textFormat/foregroundColor,sheets/data/rowData/values/formattedValue",
).execute()

april_grid = april_data["sheets"][0]["data"][0]

# ── Step 3: Compare and build fix requests ────────────────────────────────────
print("\nComparing April cells against March reference...")
fix_requests = []
cells_to_fix = 0
rows_to_fix = set()

for i, row_data in enumerate(april_grid.get("rowData", [])):
    row_idx = start_row_offset + i

    # Skip rows where we have no March reference
    if row_idx not in march_colors:
        continue

    march_color = march_colors[row_idx]

    # If March itself is black, no fix needed
    if is_black_or_default(march_color):
        continue

    values = row_data.get("values", [])
    if not values:
        continue

    # Check each cell in this row across all 30 April columns
    row_needs_fix = False
    for j, cell in enumerate(values):
        fmt = cell.get("userEnteredFormat", {})
        text_fmt = fmt.get("textFormat", {})

        color_style = text_fmt.get("foregroundColorStyle", {})
        color_obj = color_style.get("rgbColor") if color_style else None
        if not color_obj:
            color_obj = text_fmt.get("foregroundColor")

        cell_color = color_to_tuple(color_obj) if color_obj else (0.0, 0.0, 0.0)

        # Check if cell has content and wrong color
        has_content = bool(cell.get("formattedValue"))
        if has_content and cell_color != march_color and is_black_or_default(cell_color):
            row_needs_fix = True
            cells_to_fix += 1

    if row_needs_fix:
        rows_to_fix.add(row_idx)
        # Apply the correct color to the entire row across April columns
        fix_requests.append({
            "repeatCell": {
                "range": {
                    "sheetId": SHEET_ID,
                    "startRowIndex": row_idx,
                    "endRowIndex": row_idx + 1,
                    "startColumnIndex": APRIL_START_COL,
                    "endColumnIndex": APRIL_END_COL,
                },
                "cell": {
                    "userEnteredFormat": {
                        "textFormat": {
                            "foregroundColorStyle": {
                                "rgbColor": color_tuple_to_obj(march_color)
                            }
                        }
                    }
                },
                "fields": "userEnteredFormat.textFormat.foregroundColorStyle",
            }
        })

print(f"  Found {cells_to_fix} cells with wrong font color across {len(rows_to_fix)} rows.")
print(f"  Generated {len(fix_requests)} fix requests (one per row).")

if rows_to_fix:
    print(f"  Affected rows (1-indexed): {sorted(r + 1 for r in rows_to_fix)}")

# ── Step 4: Apply fixes ──────────────────────────────────────────────────────
if fix_requests:
    print(f"\nApplying {len(fix_requests)} font color fixes...")
    # Batch in chunks of 100 to stay within API limits
    BATCH_SIZE = 100
    for chunk_start in range(0, len(fix_requests), BATCH_SIZE):
        chunk = fix_requests[chunk_start:chunk_start + BATCH_SIZE]
        result = sheets_api.batchUpdate(
            spreadsheetId=SPREADSHEET_ID,
            body={"requests": chunk},
        ).execute()
        print(f"  Applied batch {chunk_start // BATCH_SIZE + 1}: {len(chunk)} requests OK")

    print(f"\nDone! Fixed font colors for {len(rows_to_fix)} rows across April columns.")
else:
    print("\nNo font color fixes needed — all April cells match March reference.")

# ── Step 5: Verify ────────────────────────────────────────────────────────────
print("\nVerifying sample cells...")
verify_range = f"{SHEET_NAME}!CO5:CO20"
verify_data = sheets_api.get(
    spreadsheetId=SPREADSHEET_ID,
    ranges=[verify_range],
    includeGridData=True,
    fields="sheets/data/rowData/values/userEnteredFormat/textFormat/foregroundColorStyle,sheets/data/rowData/values/userEnteredFormat/textFormat/foregroundColor,sheets/data/rowData/values/formattedValue",
).execute()

verify_grid = verify_data["sheets"][0]["data"][0]
print("  Post-fix sample (Spa rows 5-20, col CO):")
for i, row_data in enumerate(verify_grid.get("rowData", [])):
    row_idx = start_row_offset + i
    values = row_data.get("values", [])
    if not values:
        continue
    cell = values[0]
    content = cell.get("formattedValue", "")
    if not content:
        continue
    fmt = cell.get("userEnteredFormat", {})
    text_fmt = fmt.get("textFormat", {})
    color_style = text_fmt.get("foregroundColorStyle", {})
    color_obj = color_style.get("rgbColor") if color_style else text_fmt.get("foregroundColor")
    color = color_to_tuple(color_obj) if color_obj else "(default)"
    march_ref = march_colors.get(row_idx, "N/A")
    match = "OK" if color == march_ref else "MISMATCH"
    print(f"    Row {row_idx + 1}: {match} | color={color} | ref={march_ref} | '{content[:40]}'")

print("\nScript complete.")
