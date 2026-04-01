#!/usr/bin/env python3
"""Write Meta + Google campaign data to Q2 2026 marketing calendar.

Populates name rows (campaign name on Mondays) and budget rows (daily budget
on every active day) for all three brands: Spa, Aesthetics, Slimming.
Uses Google Sheets API batchUpdate for efficiency — single API call.
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

# ── Q2 Constants ──────────────────────────────────────────────────────────────
APR_DAYS = 30
MAY_DAYS = 31
JUN_DAYS = 30
TOTAL_DAYS = APR_DAYS + MAY_DAYS + JUN_DAYS  # 91
START_COL = 92  # Apr 1 = column index 92 (0-indexed) = "CO" in A1

# Monday indices within Q2 (0-based, where 0 = Apr 1)
# Apr 1 2026 = Wednesday, so Apr 6 = Monday = index 5
MONDAYS = [5, 12, 19, 26, 33, 40, 47, 54, 61, 68, 75, 82, 89]


def date_to_index(month, day):
    """Convert month/day to 0-based index within Q2 (Apr 1 = 0)."""
    if month == 4:
        return day - 1
    elif month == 5:
        return 30 + day - 1
    elif month == 6:
        return 61 + day - 1
    raise ValueError(f"Invalid month {month} for Q2")


def col_to_a1(col_index):
    """Convert 0-indexed column number to A1 notation letter(s)."""
    if col_index < 26:
        return chr(65 + col_index)
    return chr(65 + col_index // 26 - 1) + chr(65 + col_index % 26)


def row_range_a1(row):
    """Get A1 range string for a full Q2 row."""
    start = col_to_a1(START_COL)
    end = col_to_a1(START_COL + TOTAL_DAYS - 1)
    return f"'{SHEET_NAME}'!{start}{row}:{end}{row}"


# ── Campaign Definitions ──────────────────────────────────────────────────────
# Each tuple: (name_row, budget_row, campaign_name, daily_budget,
#              start_month, start_day, end_month, end_day)

SPA_META = [
    # Evergreen (4 campaigns — always-on, full Q2)
    (6, 7, "Spa Day | CPL 1.50", "€8", 4, 1, 6, 30),
    (8, 9, "Couples Package | CPL 0.98", "€8", 4, 1, 6, 30),
    (10, 11, "Massage | CPL 2.12", "€7", 4, 1, 6, 30),
    (12, 13, "Gifting | CPL 1.56", "€7", 4, 1, 6, 30),
    # Occasion campaigns
    (14, 15, "Golden Bloom Easter | CPL XX", "€7", 4, 1, 4, 6),
    (16, 17, "The Art of Letting Go | CPL XX", "€5", 4, 1, 4, 30),
    (18, 19, "The Carisma Bridal Ritual | CPL XX", "€5", 4, 1, 6, 30),
    (20, 21, "The Greatest Gift | CPL XX", "€7", 4, 26, 5, 10),
    (22, 23, "Six Weeks to Summer | CPL XX", "€7", 4, 26, 5, 31),
    (24, 25, "The Six-Week Wellness Journey | CPL XX", "€6", 5, 1, 5, 31),
    (26, 27, "Malta's Finest Escape | CPL XX", "€5", 6, 1, 6, 30),
    (28, 29, "Strength, Recovered | CPL XX", "€5", 6, 1, 6, 30),
    (30, 31, "The Gift of Deep Relief | CPL XX", "€7", 6, 1, 6, 14),
    (32, 33, "Couples Summer Glow | CPL XX", "€7", 6, 1, 6, 30),
]

SPA_GOOGLE = [
    # Always-on Google campaigns (placed in AON rows 61-72, matching Q1)
    (61, 62, "Search: Spa Day | CPC 0.67", "€60", 4, 1, 6, 30),
    (63, 64, "PFM - Remarketing | CPC 0.27", "€24", 4, 1, 6, 30),
    (67, 68, "Pmax | Store Visit | CPC 0.19", "€36", 4, 1, 6, 30),
]

AESTHETICS_META = [
    # Evergreen (5 campaigns)
    (99, 100, "Ultimate Facelift | CPL 1.45", "€10", 4, 1, 6, 30),
    (101, 102, "Snatch Jawline | CPL 2.02", "€10", 4, 1, 6, 30),
    (103, 104, "4-in-1 Hydrafacial Glow | CPL 2.26", "€10", 4, 1, 6, 30),
    (105, 106, "Lip Filler | CPL XX", "€8", 4, 1, 6, 30),
    (107, 108, "LHR Summer | CPL 2.13", "€10", 4, 1, 6, 30),
    # Occasion campaigns
    (109, 110, "Spring Skin Reset | CPL XX", "€8", 4, 1, 4, 6),
    (111, 112, "Bridal Beauty Blueprint | CPL XX", "€8", 4, 1, 4, 30),
    (113, 114, "Peel. Protect. Glow. | CPL XX", "€8", 4, 1, 4, 30),
    (115, 116, "Mum's Glow Moment | CPL XX", "€10", 4, 26, 5, 10),
    (117, 118, "Last Chance Glow | CPL XX", "€10", 4, 26, 5, 31),
    (119, 120, "Bridal Party Packages | CPL XX", "€8", 5, 10, 5, 31),
    (121, 122, "Summer Upkeep | CPL XX", "€10", 6, 1, 6, 30),
    (123, 124, "Dad's Glow-Up | CPL XX", "€10", 6, 1, 6, 14),
]

AESTHETICS_GOOGLE = [
    # Always-on Google campaigns (rows 157-170)
    (157, 158, "Wrinkle Relaxer - Search | CPC 0.33", "€4", 4, 1, 6, 30),
    (159, 160, "Lip Fillers - Search | CPC XX", "€4", 4, 1, 6, 30),
    (161, 162, "Microneedling + Mesotherapy - Search | CPC 0.52", "€4", 4, 1, 6, 30),
    (163, 164, "Laser Hair Removal - Search | CPC 0.38", "€4", 4, 1, 6, 30),
    (165, 166, "Pmax | Sales | LHR | CPC XX", "€4", 4, 1, 6, 30),
]

SLIMMING_META = [
    # Evergreen (7 campaigns — budgets in EUR, matching Q1 spreadsheet format)
    (177, 178, "CBO_FatFreeze | CPL 2.44", "€10", 4, 1, 6, 30),
    (179, 180, "CBO_MuscleStim | CPL 2.57", "€13", 4, 1, 6, 30),
    (181, 182, "CBO_SkinTight | CPL 2.50", "€5", 4, 1, 6, 30),
    (183, 184, "CBO_MWL_Menopause | CPL 1.45", "€12", 4, 1, 6, 30),
    (185, 186, "CBO_MWL_Pain-Solution | CPL 1.80", "€13", 4, 1, 6, 30),
    (187, 188, "CBO_MWL_AfterBaby | CPL 2.08", "€8", 4, 1, 6, 30),
    (189, 190, "CBO_MWL_RiskReversal | CPL 2.03", "€13", 4, 1, 6, 30),
    # Occasion campaigns
    (191, 192, "New Season, New You | CPL XX", "€7", 4, 1, 4, 6),
    (193, 194, "The Summer Sculpt Plan | CPL XX", "€7", 4, 1, 4, 30),
    (195, 196, "Bridal Body Sculpt | CPL XX", "€6", 4, 24, 5, 3),
    (197, 198, "Me Time for Mum | CPL XX", "€7", 4, 26, 5, 10),
    (199, 200, "Summer Confidence Sprint | CPL XX", "€6", 5, 25, 6, 8),
    (201, 202, "The Men's Sculpt Plan | CPL XX", "€5", 6, 1, 6, 30),
    (203, 204, "Built for Him | CPL XX", "€7", 6, 1, 6, 14),
    (205, 206, "Express Summer Sessions | CPL XX", "€6", 6, 22, 6, 30),
]

SLIMMING_GOOGLE = [
    # Always-on Google campaigns (rows 237-240)
    (237, 238, "Medical GLP-1 - Search", "€7", 4, 1, 6, 30),
    (239, 240, "Search | Leads | Weight Loss", "€7", 4, 1, 6, 30),
]

ALL_CAMPAIGNS = {
    "Spa Meta": SPA_META,
    "Spa Google": SPA_GOOGLE,
    "Aesthetics Meta": AESTHETICS_META,
    "Aesthetics Google": AESTHETICS_GOOGLE,
    "Slimming Meta": SLIMMING_META,
    "Slimming Google": SLIMMING_GOOGLE,
}


# ── Build Value Arrays ────────────────────────────────────────────────────────
print("Building value arrays for all campaigns...")

batch_data = []
total_campaigns = 0

for section_name, campaigns in ALL_CAMPAIGNS.items():
    print(f"\n  {section_name}: {len(campaigns)} campaigns")
    for name_row, budget_row, campaign_name, daily_budget, sm, sd, em, ed in campaigns:
        start_idx = date_to_index(sm, sd)
        end_idx = date_to_index(em, ed)

        # Name row: campaign name on Mondays within the active window
        name_values = [""] * TOTAL_DAYS
        for monday_idx in MONDAYS:
            if start_idx <= monday_idx <= end_idx:
                name_values[monday_idx] = campaign_name

        # If campaign starts on a non-Monday, also put name on the first day
        # (so the first week has a label even if it doesn't start on Monday)
        if start_idx not in MONDAYS:
            name_values[start_idx] = campaign_name

        # Budget row: daily budget on every day within the active window
        budget_values = [""] * TOTAL_DAYS
        for i in range(start_idx, min(end_idx + 1, TOTAL_DAYS)):
            budget_values[i] = daily_budget

        batch_data.append({
            "range": row_range_a1(name_row),
            "values": [name_values],
        })
        batch_data.append({
            "range": row_range_a1(budget_row),
            "values": [budget_values],
        })
        total_campaigns += 1

print(f"\nTotal: {total_campaigns} campaigns → {len(batch_data)} row writes")

# ── Write to Spreadsheet ─────────────────────────────────────────────────────
print(f"\nWriting {len(batch_data)} rows to spreadsheet...")

body = {
    "valueInputOption": "RAW",
    "data": batch_data,
}

result = service.spreadsheets().values().batchUpdate(
    spreadsheetId=SPREADSHEET_ID,
    body=body,
).execute()

updated_cells = result.get("totalUpdatedCells", 0)
updated_rows = result.get("totalUpdatedRows", 0)
print(f"  Updated {updated_cells} cells across {updated_rows} rows.")

# ── Summary ───────────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("CAMPAIGN WRITE SUMMARY")
print("=" * 60)
for section_name, campaigns in ALL_CAMPAIGNS.items():
    eg_count = sum(1 for c in campaigns if "CPL XX" not in c[2] and "CPC XX" not in c[2])
    oc_count = len(campaigns) - eg_count
    print(f"  {section_name}: {len(campaigns)} campaigns ({eg_count} evergreen, {oc_count} new)")
print(f"\n  TOTAL: {total_campaigns} campaigns written to Q2 columns (CO:GA)")
print(f"  Rows written: {len(batch_data)}")
print("=" * 60)

# ── Verification Sample ──────────────────────────────────────────────────────
print("\nVerifying sample cells...")

# Read first Monday of April (Apr 6 = col CT) for key rows
verify_ranges = [
    f"'{SHEET_NAME}'!CT6",     # Spa Day name
    f"'{SHEET_NAME}'!CO7",     # Spa Day budget (Apr 1)
    f"'{SHEET_NAME}'!CT99",    # Ultimate Facelift name
    f"'{SHEET_NAME}'!CO100",   # Ultimate Facelift budget
    f"'{SHEET_NAME}'!CT177",   # CBO_FatFreeze name
    f"'{SHEET_NAME}'!CO178",   # CBO_FatFreeze budget
    f"'{SHEET_NAME}'!CT61",    # Spa Google Search name
    f"'{SHEET_NAME}'!CO62",    # Spa Google budget
    f"'{SHEET_NAME}'!CT157",   # Aesthetics Google name
    f"'{SHEET_NAME}'!CT237",   # Slimming Google name
]

verify_result = service.spreadsheets().values().batchGet(
    spreadsheetId=SPREADSHEET_ID,
    ranges=verify_ranges,
).execute()

print("  Verification samples (post-write):")
for vr in verify_result.get("valueRanges", []):
    range_str = vr.get("range", "?")
    vals = vr.get("values", [[""]])
    val = vals[0][0] if vals and vals[0] else "(empty)"
    print(f"    {range_str}: {val}")

print("\nScript complete.")
