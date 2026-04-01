#!/usr/bin/env python3
"""Fix Q2 2026 calendar data issues identified during QC.

Fixes:
1. CPL actual -> XXX for all Q2 Meta campaign names (future months)
2. Remove bold formatting from Meta campaign rows
3. Pop-up on every Monday for all 3 brands
4. Clear any WhatsApp data from Slimming Google Ads rows (237-248)
"""

import json
import re
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

# ── Constants ─────────────────────────────────────────────────────────────────
START_COL = 92  # Apr 1 = col 92 (0-indexed)
END_COL = 182   # Jun 30 = col 182 (0-indexed)
TOTAL_DAYS = 91

# Monday column indices (0-indexed within Q2, where Apr 1 = index 0)
# Apr 1 2026 = Wednesday, Apr 6 = Monday = index 5
MONDAYS_Q2 = [5, 12, 19, 26, 33, 40, 47, 54, 61, 68, 75, 82, 89]

# Meta name rows per brand
SPA_META_NAME_ROWS = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40]
AES_META_NAME_ROWS = [99, 101, 103, 105, 107, 109, 111, 113, 115, 117, 119, 121, 123, 125, 127, 129, 131]
SLIM_META_NAME_ROWS = [177, 179, 181, 183, 185, 187, 189, 191, 193, 195, 197, 199, 201, 203, 205, 207, 209, 211]

ALL_META_NAME_ROWS = SPA_META_NAME_ROWS + AES_META_NAME_ROWS + SLIM_META_NAME_ROWS
ALL_META_BUDGET_ROWS = [r + 1 for r in ALL_META_NAME_ROWS]
ALL_META_ROWS = sorted(ALL_META_NAME_ROWS + ALL_META_BUDGET_ROWS)

# Pop-up rows
POPUP_ROWS = {"spa": 89, "aesthetics": 171, "slimming": 249}


def col_to_a1(col_index):
    if col_index < 26:
        return chr(65 + col_index)
    return chr(65 + col_index // 26 - 1) + chr(65 + col_index % 26)


# ── FIX 1: CPL actual → XXX ─────────────────────────────────────────────────
print("=" * 60)
print("FIX 1: Replace actual CPL numbers with XXX for Q2 campaigns")
print("=" * 60)

# Read all Meta name rows for Q2
name_ranges = []
for row in ALL_META_NAME_ROWS:
    start = col_to_a1(START_COL)
    end = col_to_a1(END_COL)
    name_ranges.append(f"'{SHEET_NAME}'!{start}{row}:{end}{row}")

name_result = sheets_api.values().batchGet(
    spreadsheetId=SPREADSHEET_ID,
    ranges=name_ranges,
).execute()

cpl_fixes = []
cpl_pattern = re.compile(r'\|\s*CPL\s+[\d.]+')
cpc_pattern = re.compile(r'\|\s*CPC\s+[\d.]+')

for vr in name_result.get("valueRanges", []):
    rng = vr.get("range", "")
    vals = vr.get("values", [[]])
    if not vals or not vals[0]:
        continue
    row_vals = vals[0]
    new_vals = []
    changed = False
    for val in row_vals:
        if isinstance(val, str) and cpl_pattern.search(val):
            new_val = cpl_pattern.sub("| CPL XXX", val)
            new_vals.append(new_val)
            if new_val != val:
                changed = True
        elif isinstance(val, str) and cpc_pattern.search(val):
            # Don't change CPC values (Google campaigns shouldn't be in Meta rows)
            new_vals.append(val)
        else:
            new_vals.append(val)
    if changed:
        cpl_fixes.append({
            "range": rng,
            "values": [new_vals],
        })

if cpl_fixes:
    result = sheets_api.values().batchUpdate(
        spreadsheetId=SPREADSHEET_ID,
        body={
            "valueInputOption": "RAW",
            "data": cpl_fixes,
        },
    ).execute()
    print(f"  Fixed {len(cpl_fixes)} rows — replaced actual CPL numbers with XXX")
    print(f"  Updated {result.get('totalUpdatedCells', 0)} cells")
else:
    print("  No CPL fixes needed (all already XXX or no data)")


# ── FIX 2: Remove Bold from Meta Campaign Rows ──────────────────────────────
print("\n" + "=" * 60)
print("FIX 2: Remove bold formatting from all Meta campaign rows")
print("=" * 60)

bold_requests = []

# Spa Meta rows
bold_requests.append({
    "repeatCell": {
        "range": {
            "sheetId": SHEET_ID,
            "startRowIndex": 5,   # row 6 (0-indexed = 5)
            "endRowIndex": 41,    # through row 41
            "startColumnIndex": START_COL,
            "endColumnIndex": END_COL + 1,
        },
        "cell": {
            "userEnteredFormat": {
                "textFormat": {"bold": False}
            }
        },
        "fields": "userEnteredFormat.textFormat.bold"
    }
})

# Aesthetics Meta rows
bold_requests.append({
    "repeatCell": {
        "range": {
            "sheetId": SHEET_ID,
            "startRowIndex": 98,   # row 99
            "endRowIndex": 132,    # through row 132
            "startColumnIndex": START_COL,
            "endColumnIndex": END_COL + 1,
        },
        "cell": {
            "userEnteredFormat": {
                "textFormat": {"bold": False}
            }
        },
        "fields": "userEnteredFormat.textFormat.bold"
    }
})

# Slimming Meta rows
bold_requests.append({
    "repeatCell": {
        "range": {
            "sheetId": SHEET_ID,
            "startRowIndex": 176,  # row 177
            "endRowIndex": 212,    # through row 212
            "startColumnIndex": START_COL,
            "endColumnIndex": END_COL + 1,
        },
        "cell": {
            "userEnteredFormat": {
                "textFormat": {"bold": False}
            }
        },
        "fields": "userEnteredFormat.textFormat.bold"
    }
})

sheets_api.batchUpdate(
    spreadsheetId=SPREADSHEET_ID,
    body={"requests": bold_requests},
).execute()
print(f"  Applied bold: false to {len(bold_requests)} Meta row ranges across Q2")


# ── FIX 3: Pop-up on Every Monday ───────────────────────────────────────────
print("\n" + "=" * 60)
print("FIX 3: Ensure pop-up entry on every Monday for all 3 brands")
print("=" * 60)

# Read current pop-up values to check what's missing
popup_read_ranges = []
for brand, row in POPUP_ROWS.items():
    start = col_to_a1(START_COL)
    end = col_to_a1(END_COL)
    popup_read_ranges.append(f"'{SHEET_NAME}'!{start}{row}:{end}{row}")

popup_result = sheets_api.values().batchGet(
    spreadsheetId=SPREADSHEET_ID,
    ranges=popup_read_ranges,
).execute()

popup_writes = []
for i, (brand, row) in enumerate(POPUP_ROWS.items()):
    vr = popup_result.get("valueRanges", [{}])[i] if i < len(popup_result.get("valueRanges", [])) else {}
    existing = vr.get("values", [[]])[0] if vr.get("values") else []

    # Pad to full length
    while len(existing) < TOTAL_DAYS:
        existing.append("")

    fixed = 0
    for monday_idx in MONDAYS_Q2:
        if monday_idx < TOTAL_DAYS:
            current_val = existing[monday_idx] if monday_idx < len(existing) else ""
            if not current_val or not str(current_val).strip():
                existing[monday_idx] = "Spin wheel pop up"
                fixed += 1

    if fixed > 0:
        start = col_to_a1(START_COL)
        end = col_to_a1(END_COL)
        popup_writes.append({
            "range": f"'{SHEET_NAME}'!{start}{row}:{end}{row}",
            "values": [existing],
        })
        print(f"  {brand.capitalize()}: Fixed {fixed} missing Monday pop-ups")
    else:
        print(f"  {brand.capitalize()}: All Mondays already have pop-ups")

if popup_writes:
    result = sheets_api.values().batchUpdate(
        spreadsheetId=SPREADSHEET_ID,
        body={
            "valueInputOption": "RAW",
            "data": popup_writes,
        },
    ).execute()
    print(f"  Updated {result.get('totalUpdatedCells', 0)} cells")


# ── FIX 4: Clear WhatsApp Data from Slimming Google Rows ────────────────────
print("\n" + "=" * 60)
print("FIX 4: Check/clear WhatsApp data from Slimming Google rows (237-248)")
print("=" * 60)

# Read rows 237-248 for Q2 to check for WhatsApp content
slim_google_ranges = []
for row in range(237, 249):
    start = col_to_a1(START_COL)
    end = col_to_a1(END_COL)
    slim_google_ranges.append(f"'{SHEET_NAME}'!{start}{row}:{end}{row}")

slim_google_result = sheets_api.values().batchGet(
    spreadsheetId=SPREADSHEET_ID,
    ranges=slim_google_ranges,
).execute()

wa_contamination = []
for i, vr in enumerate(slim_google_result.get("valueRanges", [])):
    vals = vr.get("values", [[]])[0] if vr.get("values") else []
    row = 237 + i
    has_wa = any("WA:" in str(v) or "whatsapp" in str(v).lower() for v in vals if v)
    if has_wa:
        wa_contamination.append(row)
        print(f"  FOUND WhatsApp data in row {row} — needs clearing")

if not wa_contamination:
    print("  No WhatsApp contamination found in Slimming Google rows")
else:
    # Clear the contaminated rows
    clear_data = []
    for row in wa_contamination:
        start = col_to_a1(START_COL)
        end = col_to_a1(END_COL)
        clear_data.append({
            "range": f"'{SHEET_NAME}'!{start}{row}:{end}{row}",
            "values": [[""] * TOTAL_DAYS],
        })
    result = sheets_api.values().batchUpdate(
        spreadsheetId=SPREADSHEET_ID,
        body={
            "valueInputOption": "RAW",
            "data": clear_data,
        },
    ).execute()
    print(f"  Cleared {len(wa_contamination)} rows")


# ── Summary ──────────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("FIX SUMMARY")
print("=" * 60)
print(f"  1. CPL -> XXX:       {len(cpl_fixes)} rows fixed")
print(f"  2. Bold removed:     {len(bold_requests)} formatting ranges applied")
print(f"  3. Pop-ups:          {len(popup_writes)} brands needed fixes")
print(f"  4. WA contamination: {len(wa_contamination)} rows cleared")
print("=" * 60)
print("\nRemaining manual fixes needed:")
print("  - SMM alignment (Mon/Wed/Fri instead of Mon-Fri)")
print("  - Font size inconsistencies at specific cells")
print("  - Complete Slimming SMM content")
print("  - Fix Aesthetics email quality/completeness")
print("  - Ensure May formatting matches April")
print("\nScript complete.")
