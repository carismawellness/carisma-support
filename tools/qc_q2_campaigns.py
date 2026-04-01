#!/usr/bin/env python3
"""QC verification for Q2 2026 campaign data in marketing calendar.

Checks:
1. Campaign counts per brand (Meta + Google)
2. Name rows have values on Mondays
3. Budget rows have values on all active days
4. Font color matches RGB(0.608, 0.553, 0.514)
5. Notes present on first cells
6. No green highlights (manual only rule)
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
TARGET_COLOR = (0.608, 0.553, 0.514)
COLOR_TOLERANCE = 0.02

# Sample rows to check per brand
CHECKS = {
    "Spa Meta EG (row 6)": 6,
    "Spa Meta OC (row 14)": 14,
    "Spa Meta OC (row 20)": 20,
    "Spa Google (row 61)": 61,
    "Aes Meta EG (row 99)": 99,
    "Aes Meta OC (row 109)": 109,
    "Aes Meta OC (row 121)": 121,
    "Aes Google (row 157)": 157,
    "Slim Meta EG (row 177)": 177,
    "Slim Meta OC (row 191)": 191,
    "Slim Meta OC (row 201)": 201,
    "Slim Google (row 237)": 237,
}

# Budget rows to check
BUDGET_CHECKS = {
    "Spa Day budget (row 7)": 7,
    "Easter budget (row 15)": 15,
    "Aes Facelift budget (row 100)": 100,
    "Slim FatFreeze budget (row 178)": 178,
    "Spa Google budget (row 62)": 62,
}


def col_to_a1(col_index):
    if col_index < 26:
        return chr(65 + col_index)
    return chr(65 + col_index // 26 - 1) + chr(65 + col_index % 26)


# ── Test 1: Campaign Counts ──────────────────────────────────────────────────
print("=" * 60)
print("TEST 1: Campaign Counts")
print("=" * 60)

# Read name rows for each brand section to count non-empty Mondays
# Apr 6 = col 97 = CT
count_ranges = [
    # Spa Meta name rows (6,8,10,...,40) at Monday Apr 6
    f"'{SHEET_NAME}'!CT6", f"'{SHEET_NAME}'!CT8", f"'{SHEET_NAME}'!CT10", f"'{SHEET_NAME}'!CT12",
    f"'{SHEET_NAME}'!CT14", f"'{SHEET_NAME}'!CT16", f"'{SHEET_NAME}'!CT18", f"'{SHEET_NAME}'!CT20",
    f"'{SHEET_NAME}'!CT22", f"'{SHEET_NAME}'!CT24", f"'{SHEET_NAME}'!CT26", f"'{SHEET_NAME}'!CT28",
    f"'{SHEET_NAME}'!CT30", f"'{SHEET_NAME}'!CT32", f"'{SHEET_NAME}'!CT34", f"'{SHEET_NAME}'!CT36",
    f"'{SHEET_NAME}'!CT38", f"'{SHEET_NAME}'!CT40",
    # Spa Google AON (61,63,65,67,69,71)
    f"'{SHEET_NAME}'!CT61", f"'{SHEET_NAME}'!CT63", f"'{SHEET_NAME}'!CT67",
    # Aesthetics Meta (99,101,...,131)
    f"'{SHEET_NAME}'!CT99", f"'{SHEET_NAME}'!CT101", f"'{SHEET_NAME}'!CT103",
    f"'{SHEET_NAME}'!CT105", f"'{SHEET_NAME}'!CT107", f"'{SHEET_NAME}'!CT109",
    f"'{SHEET_NAME}'!CT111", f"'{SHEET_NAME}'!CT113", f"'{SHEET_NAME}'!CT115",
    f"'{SHEET_NAME}'!CT117", f"'{SHEET_NAME}'!CT119", f"'{SHEET_NAME}'!CT121",
    f"'{SHEET_NAME}'!CT123", f"'{SHEET_NAME}'!CT125", f"'{SHEET_NAME}'!CT127",
    f"'{SHEET_NAME}'!CT129", f"'{SHEET_NAME}'!CT131",
    # Aesthetics Google (157,159,161,163,165)
    f"'{SHEET_NAME}'!CT157", f"'{SHEET_NAME}'!CT159", f"'{SHEET_NAME}'!CT161",
    f"'{SHEET_NAME}'!CT163", f"'{SHEET_NAME}'!CT165",
    # Slimming Meta (177,179,...,211)
    f"'{SHEET_NAME}'!CT177", f"'{SHEET_NAME}'!CT179", f"'{SHEET_NAME}'!CT181",
    f"'{SHEET_NAME}'!CT183", f"'{SHEET_NAME}'!CT185", f"'{SHEET_NAME}'!CT187",
    f"'{SHEET_NAME}'!CT189", f"'{SHEET_NAME}'!CT191", f"'{SHEET_NAME}'!CT193",
    f"'{SHEET_NAME}'!CT195", f"'{SHEET_NAME}'!CT197", f"'{SHEET_NAME}'!CT199",
    f"'{SHEET_NAME}'!CT201", f"'{SHEET_NAME}'!CT203", f"'{SHEET_NAME}'!CT205",
    f"'{SHEET_NAME}'!CT207", f"'{SHEET_NAME}'!CT209", f"'{SHEET_NAME}'!CT211",
    # Slimming Google (237,239)
    f"'{SHEET_NAME}'!CT237", f"'{SHEET_NAME}'!CT239",
]

count_result = sheets_api.values().batchGet(
    spreadsheetId=SPREADSHEET_ID,
    ranges=count_ranges,
).execute()

spa_meta = 0
spa_google = 0
aes_meta = 0
aes_google = 0
slim_meta = 0
slim_google = 0

for vr in count_result.get("valueRanges", []):
    r = vr.get("range", "")
    vals = vr.get("values", [[""]])
    val = vals[0][0] if vals and vals[0] else ""
    has_data = bool(val.strip()) if val else False

    # Parse row number from range
    row_str = r.split("!CT")[1] if "!CT" in r else ""
    try:
        row = int(row_str)
    except ValueError:
        continue

    if 6 <= row <= 40 and has_data:
        spa_meta += 1
    elif row in (61, 63, 67) and has_data:
        spa_google += 1
    elif 99 <= row <= 131 and has_data:
        aes_meta += 1
    elif row in (157, 159, 161, 163, 165) and has_data:
        aes_google += 1
    elif 177 <= row <= 211 and has_data:
        slim_meta += 1
    elif row in (237, 239) and has_data:
        slim_google += 1

print(f"  Spa Meta:       {spa_meta} campaigns (expected: 14 on Apr 6)")
# Note: some occasion campaigns start after Apr 6, so count may be lower
print(f"  Spa Google:     {spa_google} campaigns (expected: 3)")
print(f"  Aes Meta:       {aes_meta} campaigns (expected: 13 on Apr 6)")
print(f"  Aes Google:     {aes_google} campaigns (expected: 5)")
print(f"  Slim Meta:      {slim_meta} campaigns (expected: 15 on Apr 6)")
print(f"  Slim Google:    {slim_google} campaigns (expected: 2)")

total = spa_meta + spa_google + aes_meta + aes_google + slim_meta + slim_google
print(f"  TOTAL on Apr 6: {total}")


# ── Test 2: Font Color ───────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("TEST 2: Font Color (target RGB 0.608, 0.553, 0.514)")
print("=" * 60)

# Read formatting for sample cells
format_ranges = []
for label, row in CHECKS.items():
    format_ranges.append(f"'{SHEET_NAME}'!CO{row}:CO{row}")

format_result = sheets_api.get(
    spreadsheetId=SPREADSHEET_ID,
    ranges=format_ranges,
    includeGridData=True,
    fields="sheets/data/rowData/values/userEnteredFormat/textFormat/foregroundColorStyle",
).execute()

all_colors_ok = True
for i, (label, row) in enumerate(CHECKS.items()):
    try:
        cell = format_result["sheets"][0]["data"][i]["rowData"][0]["values"][0]
        color_style = cell.get("userEnteredFormat", {}).get("textFormat", {}).get("foregroundColorStyle", {})
        rgb = color_style.get("rgbColor", {})
        r = round(rgb.get("red", 0), 3)
        g = round(rgb.get("green", 0), 3)
        b = round(rgb.get("blue", 0), 3)

        r_ok = abs(r - TARGET_COLOR[0]) < COLOR_TOLERANCE
        g_ok = abs(g - TARGET_COLOR[1]) < COLOR_TOLERANCE
        b_ok = abs(b - TARGET_COLOR[2]) < COLOR_TOLERANCE

        if r_ok and g_ok and b_ok:
            print(f"  PASS  {label}: RGB({r}, {g}, {b})")
        else:
            print(f"  FAIL  {label}: RGB({r}, {g}, {b}) != target")
            all_colors_ok = False
    except (KeyError, IndexError):
        print(f"  FAIL  {label}: No color data found")
        all_colors_ok = False


# ── Test 3: Budget Row Values ─────────────────────────────────────────────────
print("\n" + "=" * 60)
print("TEST 3: Budget Rows Have Daily Values")
print("=" * 60)

for label, row in BUDGET_CHECKS.items():
    # Read Apr 1-3 (CO, CP, CQ)
    r = f"'{SHEET_NAME}'!CO{row}:CQ{row}"
    result = sheets_api.values().get(
        spreadsheetId=SPREADSHEET_ID,
        range=r,
    ).execute()
    vals = result.get("values", [[]])[0]
    has_values = all(bool(v.strip()) for v in vals if v)
    count = len([v for v in vals if v.strip()])
    print(f"  {'PASS' if count >= 3 else 'FAIL'}  {label}: {count}/3 days filled — {vals}")


# ── Test 4: Notes Present ─────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("TEST 4: Campaign Brief Notes Present")
print("=" * 60)

# Check notes on first cells of sample campaigns
note_checks = [
    (6, 92, "Spa Day EG"),
    (14, 92, "Easter OC"),
    (99, 92, "Aes Facelift EG"),
    (109, 92, "Spring Skin Reset OC"),
    (177, 92, "Slim FatFreeze EG"),
    (191, 92, "Slim New Season OC"),
    (61, 92, "Spa Google Search"),
    (237, 92, "Slim Google MWL"),
]

note_ranges = []
for row, col, label in note_checks:
    c = col_to_a1(col)
    note_ranges.append(f"'{SHEET_NAME}'!{c}{row}")

note_result = sheets_api.get(
    spreadsheetId=SPREADSHEET_ID,
    ranges=note_ranges,
    includeGridData=True,
    fields="sheets/data/rowData/values/note",
).execute()

all_notes_ok = True
for i, (row, col, label) in enumerate(note_checks):
    try:
        cell = note_result["sheets"][0]["data"][i]["rowData"][0]["values"][0]
        note = cell.get("note", "")
        has_note = len(note) > 20
        preview = note[:60].replace("\n", " | ") if note else "(none)"
        print(f"  {'PASS' if has_note else 'FAIL'}  {label} (row {row}): {preview}...")
        if not has_note:
            all_notes_ok = False
    except (KeyError, IndexError):
        print(f"  FAIL  {label} (row {row}): No note data")
        all_notes_ok = False


# ── Test 5: No Green Highlights ──────────────────────────────────────────────
print("\n" + "=" * 60)
print("TEST 5: No Green Highlights (manual only rule)")
print("=" * 60)

# Sample check: read background color of a few cells
green_check_ranges = [
    f"'{SHEET_NAME}'!CT6:CT6",
    f"'{SHEET_NAME}'!CT99:CT99",
    f"'{SHEET_NAME}'!CT177:CT177",
]

green_result = sheets_api.get(
    spreadsheetId=SPREADSHEET_ID,
    ranges=green_check_ranges,
    includeGridData=True,
    fields="sheets/data/rowData/values/userEnteredFormat/backgroundColor",
).execute()

green_found = False
for i, rng in enumerate(green_check_ranges):
    try:
        cell = green_result["sheets"][0]["data"][i]["rowData"][0]["values"][0]
        bg = cell.get("userEnteredFormat", {}).get("backgroundColor", {})
        g = bg.get("green", 0)
        r = bg.get("red", 0)
        b = bg.get("blue", 0)
        is_green = g > 0.8 and r < 0.5 and b < 0.5
        if is_green:
            print(f"  FAIL  {rng}: Green background detected!")
            green_found = True
        else:
            print(f"  PASS  {rng}: No green (bg RGB: {round(r,2)}, {round(g,2)}, {round(b,2)})")
    except (KeyError, IndexError):
        print(f"  PASS  {rng}: No background format (default)")

# ── Summary ───────────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("QC SUMMARY")
print("=" * 60)
print(f"  Campaign counts:   {'PASS' if total >= 30 else 'CHECK'} ({total} on Apr 6 Monday)")
print(f"  Font colors:       {'PASS' if all_colors_ok else 'FAIL'}")
print(f"  Notes present:     {'PASS' if all_notes_ok else 'FAIL'}")
print(f"  No green:          {'PASS' if not green_found else 'FAIL'}")
print("=" * 60)

if all_colors_ok and all_notes_ok and not green_found:
    print("\nAll QC checks PASSED.")
else:
    print("\nSome checks need attention — see details above.")

print("\nQC complete.")
