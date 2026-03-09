#!/usr/bin/env python3
"""Push 'HC Payroll Overview' tab with revenue + HC% into the Salary Master Google Sheet."""

import json
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# --- Auth ---
SECRETS_PATH = "/Users/mertgulen/.go-google-mcp/client_secrets.json"
TOKEN_PATH = "/Users/mertgulen/.go-google-mcp/token.json"
SPREADSHEET_ID = "1AAnfm-SAYso6RpJhbdhJbTbcGDH1Ftlk0FHBPHfN98w"

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

# --- Check existing tabs ---
meta = sheets_api.get(spreadsheetId=SPREADSHEET_ID).execute()
existing = {s["properties"]["title"] for s in meta["sheets"]}
TAB_NAME = "HC Payroll Overview"

if TAB_NAME not in existing:
    sheets_api.batchUpdate(
        spreadsheetId=SPREADSHEET_ID,
        body={"requests": [{"addSheet": {"properties": {"title": TAB_NAME}}}]}
    ).execute()
    print(f"Created tab: {TAB_NAME}")
else:
    print(f"Tab '{TAB_NAME}' exists — will overwrite")
    sheets_api.values().clear(
        spreadsheetId=SPREADSHEET_ID,
        range=f"'{TAB_NAME}'!A1:Z500"
    ).execute()

# ============================================================
# Revenue data (recent 6M avg × 12)
# ============================================================
REV = {
    "Inter":     {"mo": 50517, "yr": 606204},
    "Hugos":     {"mo": 46292, "yr": 555504},
    "Hyatt":     {"mo": 22330, "yr": 267960},
    "Ramla":     {"mo": 34221, "yr": 410652},
    "Riviera":   {"mo": 20119, "yr": 241428},
    "Odycy":     {"mo": 18854, "yr": 226248},
    "Excelsior": {"mo": 21916, "yr": 262992},
    "Novotel":   {"mo":  8892, "yr": 106704},
}
TOTAL_SPA_REV_YR = sum(h["yr"] for h in REV.values())  # 2,677,692

# RM cost allocation per hotel (monthly, from staffing analysis)
RM_ALLOC = {
    "Inter": 1432, "Hugos": 1330, "Hyatt": 648,
    "Ramla": 1603, "Riviera": 921, "Odycy": 886,
    "Excelsior": 2421, "Novotel": 989,
}
# Float pool cost allocated proportionally by revenue share
FLOAT_MONTHLY = 3630

# ============================================================
# Build rows — 8 columns: A-H
# ============================================================
B = ""
rows = []

def blank():
    rows.append([])

def section(label):
    rows.append([label, B, B, B, B, B, B, B])

# Hotel subtotal with revenue & HC%
def hotel_subtotal(name, monthly_payroll, annual_payroll, count, hotel_key):
    rev_yr = REV[hotel_key]["yr"]
    rm_yr = RM_ALLOC[hotel_key] * 12
    # HC% = (on-site payroll + RM allocation) / revenue
    total_cost_yr = annual_payroll + rm_yr
    hc_pct = total_cost_yr / rev_yr if rev_yr > 0 else 0
    rows.append([B, B, f"{name} Subtotal", count, monthly_payroll, annual_payroll, rev_yr, hc_pct])

def region_total(label, monthly, annual, count, hotel_keys):
    rev_yr = sum(REV[k]["yr"] for k in hotel_keys)
    hc_pct = annual / rev_yr if rev_yr > 0 else 0
    rows.append([B, B, label, count, monthly, annual, rev_yr, hc_pct])

# =============================================
# TITLE
# =============================================
rows.append(["CARISMA WELLNESS GROUP", B, B, B, B, B, B, B])
rows.append(["Company Payroll Overview — Proposed Structure (40% HC Target)", B, B, B, B, B, B, B])
rows.append(["Date: 8 March 2026", B, B, B, B, B, B, B])
blank()

# Column headers (row index 4)
rows.append(["Department / Location", "Name", "Role", "HC", "Monthly (EUR)", "Annual Payroll (EUR)", "Annual Revenue (EUR)", "HC %"])
blank()

# =============================================
# HEADQUARTERS
# =============================================
section("HEADQUARTERS")
rows.append([B, "—", "CEO", 1, 5000, 60000, B, B])
rows.append([B, "—", "Growth Team", 1, 6000, 72000, B, B])
rows.append([B, "—", "Accounting", 1, 1600, 19200, B, B])
rows.append([B, "—", "Operations", 1, 5000, 60000, B, B])
rows.append([B, "—", "HR", 1, 3000, 36000, B, B])
rows.append([B, B, "HQ Subtotal", 5, 20600, 247200, "N/A (cost centre)", B])
blank()

# =============================================
# REGION 1 — RM: Neli
# =============================================
section("REGION 1 — Regional Manager: Neli")
rows.append([B, "Neli", "Regional Manager", 1, 3410, 40920, B, B])
blank()

# InterContinental (10 staff)
rows.append(["  InterContinental", B, B, B, B, B, REV["Inter"]["yr"], B])
rows.append([B, "Natasha", "Receptionist", 1, 1683, 20196, B, B])
rows.append([B, "Nathalia R.", "TIC / Advisor", 1, 2035, 24420, B, B])
rows.append([B, "Mini", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Pakinee", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Christopher", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Valeri", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Julie", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Adriana", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Matilde", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Milena", "PT Therapist", 1, 935, 11220, B, B])
rows.append([B, B, "  + RM1 allocation", B, 1432, 17184, B, B])
hotel_subtotal("InterContinental", 18790, 225480, 10, "Inter")
blank()

# Hugo's (9 staff)
rows.append(["  Hugo's", B, B, B, B, B, REV["Hugos"]["yr"], B])
rows.append([B, "Alana", "Receptionist", 1, 1683, 20196, B, B])
rows.append([B, "Ajlin", "TIC / Advisor", 1, 2035, 24420, B, B])
rows.append([B, "Lourdes", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Lovely", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Pacha", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Tessa", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Tamara", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Tina", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Linara", "PT Therapist", 1, 935, 11220, B, B])
rows.append([B, B, "  + RM1 allocation", B, 1330, 15960, B, B])
hotel_subtotal("Hugo's", 16873, 202476, 9, "Hugos")
blank()

# Hyatt (4 staff)
rows.append(["  Hyatt", B, B, B, B, B, REV["Hyatt"]["yr"], B])
rows.append([B, "Flora", "TIC", 1, 2035, 24420, B, B])
rows.append([B, "Ety", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Claudia", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Natasha H.", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, B, "  + RM1 allocation", B, 648, 7776, B, B])
hotel_subtotal("Hyatt", 8128, 97536, 4, "Hyatt")
blank()

# Region 1 total (24 on-site + 1 RM = 24 shown under hotels, RM shown separately)
r1_monthly = 3410 + 18790 + 16873 + 8128  # RM + 3 hotels incl RM alloc
r1_annual = r1_monthly * 12
region_total("REGION 1 TOTAL (incl. RM)", r1_monthly, r1_annual, 24, ["Inter", "Hugos", "Hyatt"])
blank()

# =============================================
# REGION 2 — RM: Kristina
# =============================================
section("REGION 2 — Regional Manager: Kristina")
rows.append([B, "Kristina", "Regional Manager", 1, 3410, 40920, B, B])
blank()

# Ramla (7 staff)
rows.append(["  Ramla", B, B, B, B, B, REV["Ramla"]["yr"], B])
rows.append([B, "Natalia B.", "Receptionist", 1, 1683, 20196, B, B])
rows.append([B, "Marvick", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Karla", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Vitor", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Irene", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Laura Camila", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Intern (Bali)", "Intern", 1, 715, 8580, B, B])
rows.append([B, B, "  + RM2 allocation", B, 1603, 19236, B, B])
hotel_subtotal("Ramla", 13076, 156912, 7, "Ramla")
blank()

# Riviera (4 staff)
rows.append(["  Riviera", B, B, B, B, B, REV["Riviera"]["yr"], B])
rows.append([B, "Silvia", "TIC", 1, 2035, 24420, B, B])
rows.append([B, "Blago", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Rita", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "TBD", "PT Therapist", 1, 935, 11220, B, B])
rows.append([B, B, "  + RM2 allocation", B, 921, 11052, B, B])
hotel_subtotal("Riviera", 7521, 90252, 4, "Riviera")
blank()

# Odycy (4 staff)
rows.append(["  Odycy", B, B, B, B, B, REV["Odycy"]["yr"], B])
rows.append([B, "Jovanna", "TIC", 1, 2035, 24420, B, B])
rows.append([B, "Elizabetta", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Jenny", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "TBD", "PT Therapist", 1, 935, 11220, B, B])
rows.append([B, B, "  + RM2 allocation", B, 886, 10632, B, B])
hotel_subtotal("Odycy", 7486, 89832, 4, "Odycy")
blank()

r2_monthly = 3410 + 13076 + 7521 + 7486
r2_annual = r2_monthly * 12
region_total("REGION 2 TOTAL (incl. RM)", r2_monthly, r2_annual, 16, ["Ramla", "Riviera", "Odycy"])
blank()

# =============================================
# REGION 3 — RM: Melanie
# =============================================
section("REGION 3 — Regional Manager: Melanie")
rows.append([B, "Melanie", "Regional Manager + Training", 1, 3410, 40920, B, B])
blank()

# Excelsior (4 staff)
rows.append(["  Excelsior", B, B, B, B, B, REV["Excelsior"]["yr"], B])
rows.append([B, "Sofia", "TIC", 1, 2035, 24420, B, B])
rows.append([B, "Carlos", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Lorena", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Sebastian", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, B, "  + RM3 allocation", B, 2421, 29052, B, B])
hotel_subtotal("Excelsior", 9901, 118812, 4, "Excelsior")
blank()

# Novotel (2 staff)
rows.append(["  Novotel", B, B, B, B, B, REV["Novotel"]["yr"], B])
rows.append([B, "Angel", "TIC", 1, 2035, 24420, B, B])
rows.append([B, "Vanessa", "FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, B, "  + RM3 allocation", B, 989, 11868, B, B])
hotel_subtotal("Novotel", 4839, 58068, 2, "Novotel")
blank()

r3_monthly = 3410 + 9901 + 4839
r3_annual = r3_monthly * 12
region_total("REGION 3 TOTAL (incl. RM)", r3_monthly, r3_annual, 7, ["Excelsior", "Novotel"])
blank()

# =============================================
# FLOAT POOL
# =============================================
section("FLOAT POOL")
rows.append([B, "Romelia", "Float FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, "Dzanela", "Float FT Therapist", 1, 1815, 21780, B, B])
rows.append([B, B, "Float Pool Subtotal", 2, 3630, 43560, B, B])
blank()

# =============================================
# GRAND TOTALS
# =============================================
blank()
spa_monthly = 90244
spa_annual = spa_monthly * 12
hq_monthly = 20600
hq_annual = 247200
grand_monthly = spa_monthly + hq_monthly
grand_annual = spa_annual + hq_annual

rows.append(["COMPANY TOTALS", B, B, B, B, B, B, B])
rows.append([B, B, "Headquarters", 5, hq_monthly, hq_annual, "N/A", B])
rows.append([B, B, "Spa Operations (49 on-site + 3 RMs)", 52, spa_monthly, spa_annual, TOTAL_SPA_REV_YR, spa_annual / TOTAL_SPA_REV_YR])
rows.append([B, B, B, B, B, B, B, B])
rows.append([B, B, "GRAND TOTAL", 57, grand_monthly, grand_annual, TOTAL_SPA_REV_YR, B])
blank()
blank()

# =============================================
# HC% DASHBOARD — visual summary
# =============================================
DASH_START = len(rows)
rows.append(["HC % DASHBOARD — Revenue vs Payroll by Location", B, B, B, B, B, B, B])
rows.append([B, B, B, B, B, B, B, B])

# Dashboard headers
rows.append(["Location", "Type", "HC", "Annual Payroll (incl. RM)", "Annual Revenue", "HC %", "Target: 40%", "Status"])

hotels = [
    ("InterContinental", "HUB", 10, 225480, 606204),
    ("Hugo's",           "HUB",  9, 202476, 555504),
    ("Ramla",            "HUB",  7, 156912, 410652),
    ("Hyatt",            "SPOKE", 4,  97536, 267960),
    ("Riviera",          "SPOKE", 4,  90252, 241428),
    ("Odycy",            "SPOKE", 4,  89832, 226248),
    ("Excelsior",        "SPOKE", 4, 118812, 262992),
    ("Novotel",          "MICRO", 2,  58068, 106704),
]

for name, typ, hc, payroll, revenue in hotels:
    pct = payroll / revenue
    if pct <= 0.40:
        status = "ON TARGET"
    elif pct <= 0.45:
        status = "WATCH"
    else:
        status = "OVER"
    rows.append([name, typ, hc, payroll, revenue, pct, 0.40, status])

# Float + RM overhead row
rows.append(["Float Pool + RM overhead", "SHARED", 5, 43560 + (10230 * 12), B, B, B, "Allocated above"])

# Totals
rows.append([B, B, B, B, B, B, B, B])
rows.append(["TOTAL SPA OPS", B, 52, spa_annual, TOTAL_SPA_REV_YR, spa_annual / TOTAL_SPA_REV_YR, 0.40, "ON TARGET" if spa_annual / TOTAL_SPA_REV_YR <= 0.40 else "WATCH"])
rows.append(["+ HEADQUARTERS", B, 5, hq_annual, B, B, B, B])
rows.append(["GRAND TOTAL", B, 57, grand_annual, TOTAL_SPA_REV_YR, grand_annual / TOTAL_SPA_REV_YR, B, B])

DASH_END = len(rows)

blank()
rows.append(["Notes:"])
rows.append(["- All spa figures are loaded costs (Base + Avg Commission + Employer NI at 10%)"])
rows.append(["- HQ figures are departmental payroll budgets (no associated revenue)"])
rows.append(["- Revenue = Recent 6-month average annualised (Services ex-VAT)"])
rows.append(["- HC% includes proportional RM cost allocation per hotel"])
rows.append(["- Status: ON TARGET (<=40%), WATCH (40-45%), OVER (>45%)"])
rows.append(["- Based on 40% HC target (recommended Year 1). See 'HC Executive Summary' tab for full analysis."])

# ============================================================
# Push data
# ============================================================
str_rows = []
for row in rows:
    processed = []
    for v in row:
        if isinstance(v, float):
            processed.append(v)  # keep floats as-is for percentage formatting
        elif v == "":
            processed.append("")
        else:
            processed.append(v)
    str_rows.append(processed)

max_cols = max(len(r) for r in str_rows) if str_rows else 1
end_col = chr(ord('A') + max_cols - 1)
range_str = f"'{TAB_NAME}'!A1:{end_col}{len(str_rows)}"

sheets_api.values().update(
    spreadsheetId=SPREADSHEET_ID,
    range=range_str,
    valueInputOption="RAW",
    body={"values": str_rows}
).execute()
print(f"Populated: {TAB_NAME} ({len(str_rows)} rows)")

# ============================================================
# Format the sheet
# ============================================================
meta2 = sheets_api.get(spreadsheetId=SPREADSHEET_ID).execute()
sheet_id = None
for s in meta2["sheets"]:
    if s["properties"]["title"] == TAB_NAME:
        sheet_id = s["properties"]["sheetId"]
        break

if sheet_id is None:
    print("ERROR: Could not find sheet ID")
    exit(1)

fmt = []
NC = 8  # number of columns

# Column widths
col_widths = [220, 140, 210, 50, 130, 150, 150, 90]
for i, w in enumerate(col_widths):
    fmt.append({
        "updateDimensionProperties": {
            "range": {"sheetId": sheet_id, "dimension": "COLUMNS", "startIndex": i, "endIndex": i + 1},
            "properties": {"pixelSize": w},
            "fields": "pixelSize"
        }
    })

# Bold title rows (0-2)
fmt.append({
    "repeatCell": {
        "range": {"sheetId": sheet_id, "startRowIndex": 0, "endRowIndex": 3, "startColumnIndex": 0, "endColumnIndex": NC},
        "cell": {"userEnteredFormat": {"textFormat": {"bold": True, "fontSize": 12}}},
        "fields": "userEnteredFormat.textFormat"
    }
})

# Header row styling (row 4)
fmt.append({
    "repeatCell": {
        "range": {"sheetId": sheet_id, "startRowIndex": 4, "endRowIndex": 5, "startColumnIndex": 0, "endColumnIndex": NC},
        "cell": {
            "userEnteredFormat": {
                "textFormat": {"bold": True, "foregroundColor": {"red": 1, "green": 1, "blue": 1}},
                "backgroundColor": {"red": 0.16, "green": 0.31, "blue": 0.48},
                "horizontalAlignment": "CENTER"
            }
        },
        "fields": "userEnteredFormat(textFormat,backgroundColor,horizontalAlignment)"
    }
})

# Number format for EUR columns (E, F, G = indices 4, 5, 6)
for col_idx in [4, 5, 6]:
    fmt.append({
        "repeatCell": {
            "range": {"sheetId": sheet_id, "startRowIndex": 5, "endRowIndex": DASH_START, "startColumnIndex": col_idx, "endColumnIndex": col_idx + 1},
            "cell": {
                "userEnteredFormat": {
                    "numberFormat": {"type": "NUMBER", "pattern": "#,##0"},
                    "horizontalAlignment": "RIGHT"
                }
            },
            "fields": "userEnteredFormat(numberFormat,horizontalAlignment)"
        }
    })

# HC% column (H = index 7) as percentage
fmt.append({
    "repeatCell": {
        "range": {"sheetId": sheet_id, "startRowIndex": 5, "endRowIndex": len(str_rows), "startColumnIndex": 7, "endColumnIndex": 8},
        "cell": {
            "userEnteredFormat": {
                "numberFormat": {"type": "PERCENT", "pattern": "0.0%"},
                "horizontalAlignment": "CENTER"
            }
        },
        "fields": "userEnteredFormat(numberFormat,horizontalAlignment)"
    }
})

# Format rows in the main payroll section
for i, row in enumerate(rows):
    if i >= DASH_START:
        break
    if not row:
        continue
    first = str(row[0]) if row else ""
    third = str(row[2]) if len(row) > 2 else ""

    # Section headers (blue background)
    if first in ["HEADQUARTERS", "FLOAT POOL", "COMPANY TOTALS"] or first.startswith("REGION"):
        fmt.append({
            "repeatCell": {
                "range": {"sheetId": sheet_id, "startRowIndex": i, "endRowIndex": i + 1, "startColumnIndex": 0, "endColumnIndex": NC},
                "cell": {
                    "userEnteredFormat": {
                        "textFormat": {"bold": True, "fontSize": 11},
                        "backgroundColor": {"red": 0.82, "green": 0.88, "blue": 0.95}
                    }
                },
                "fields": "userEnteredFormat(textFormat,backgroundColor)"
            }
        })
    # Hotel sub-headers (light grey + revenue shown)
    elif first.startswith("  "):
        fmt.append({
            "repeatCell": {
                "range": {"sheetId": sheet_id, "startRowIndex": i, "endRowIndex": i + 1, "startColumnIndex": 0, "endColumnIndex": NC},
                "cell": {
                    "userEnteredFormat": {
                        "textFormat": {"bold": True, "italic": True},
                        "backgroundColor": {"red": 0.94, "green": 0.94, "blue": 0.94}
                    }
                },
                "fields": "userEnteredFormat(textFormat,backgroundColor)"
            }
        })
    # RM allocation rows (italic, grey text)
    elif "RM" in third and "allocation" in third:
        fmt.append({
            "repeatCell": {
                "range": {"sheetId": sheet_id, "startRowIndex": i, "endRowIndex": i + 1, "startColumnIndex": 0, "endColumnIndex": NC},
                "cell": {
                    "userEnteredFormat": {
                        "textFormat": {"italic": True, "foregroundColor": {"red": 0.5, "green": 0.5, "blue": 0.5}}
                    }
                },
                "fields": "userEnteredFormat.textFormat"
            }
        })
    # Subtotal rows (bold + top border)
    if "Subtotal" in third or "TOTAL" in third:
        fmt.append({
            "repeatCell": {
                "range": {"sheetId": sheet_id, "startRowIndex": i, "endRowIndex": i + 1, "startColumnIndex": 0, "endColumnIndex": NC},
                "cell": {
                    "userEnteredFormat": {
                        "textFormat": {"bold": True},
                        "borders": {"top": {"style": "SOLID", "width": 1}}
                    }
                },
                "fields": "userEnteredFormat(textFormat,borders)"
            }
        })
    # Grand total (dark background)
    if third == "GRAND TOTAL":
        fmt.append({
            "repeatCell": {
                "range": {"sheetId": sheet_id, "startRowIndex": i, "endRowIndex": i + 1, "startColumnIndex": 0, "endColumnIndex": NC},
                "cell": {
                    "userEnteredFormat": {
                        "textFormat": {"bold": True, "fontSize": 12, "foregroundColor": {"red": 1, "green": 1, "blue": 1}},
                        "backgroundColor": {"red": 0.16, "green": 0.31, "blue": 0.48},
                        "borders": {"top": {"style": "SOLID", "width": 2}, "bottom": {"style": "SOLID", "width": 2}}
                    }
                },
                "fields": "userEnteredFormat(textFormat,backgroundColor,borders)"
            }
        })

# ============================================================
# Dashboard section formatting
# ============================================================

# Dashboard title
fmt.append({
    "repeatCell": {
        "range": {"sheetId": sheet_id, "startRowIndex": DASH_START, "endRowIndex": DASH_START + 1, "startColumnIndex": 0, "endColumnIndex": NC},
        "cell": {
            "userEnteredFormat": {
                "textFormat": {"bold": True, "fontSize": 13},
                "backgroundColor": {"red": 0.94, "green": 0.94, "blue": 0.94}
            }
        },
        "fields": "userEnteredFormat(textFormat,backgroundColor)"
    }
})

# Dashboard header row
dash_header_row = DASH_START + 2
fmt.append({
    "repeatCell": {
        "range": {"sheetId": sheet_id, "startRowIndex": dash_header_row, "endRowIndex": dash_header_row + 1, "startColumnIndex": 0, "endColumnIndex": NC},
        "cell": {
            "userEnteredFormat": {
                "textFormat": {"bold": True, "foregroundColor": {"red": 1, "green": 1, "blue": 1}},
                "backgroundColor": {"red": 0.16, "green": 0.31, "blue": 0.48},
                "horizontalAlignment": "CENTER"
            }
        },
        "fields": "userEnteredFormat(textFormat,backgroundColor,horizontalAlignment)"
    }
})

# Dashboard EUR columns format
for col_idx in [3, 4]:  # D=Annual Payroll, E=Annual Revenue in dashboard
    fmt.append({
        "repeatCell": {
            "range": {"sheetId": sheet_id, "startRowIndex": dash_header_row + 1, "endRowIndex": DASH_END, "startColumnIndex": col_idx, "endColumnIndex": col_idx + 1},
            "cell": {
                "userEnteredFormat": {
                    "numberFormat": {"type": "NUMBER", "pattern": "#,##0"},
                    "horizontalAlignment": "RIGHT"
                }
            },
            "fields": "userEnteredFormat(numberFormat,horizontalAlignment)"
        }
    })

# Dashboard HC% column (F = index 5) as percentage
fmt.append({
    "repeatCell": {
        "range": {"sheetId": sheet_id, "startRowIndex": dash_header_row + 1, "endRowIndex": DASH_END, "startColumnIndex": 5, "endColumnIndex": 6},
        "cell": {
            "userEnteredFormat": {
                "numberFormat": {"type": "PERCENT", "pattern": "0.0%"},
                "horizontalAlignment": "CENTER"
            }
        },
        "fields": "userEnteredFormat(numberFormat,horizontalAlignment)"
    }
})

# Dashboard Target column (G = index 6) as percentage
fmt.append({
    "repeatCell": {
        "range": {"sheetId": sheet_id, "startRowIndex": dash_header_row + 1, "endRowIndex": DASH_END, "startColumnIndex": 6, "endColumnIndex": 7},
        "cell": {
            "userEnteredFormat": {
                "numberFormat": {"type": "PERCENT", "pattern": "0%"},
                "horizontalAlignment": "CENTER"
            }
        },
        "fields": "userEnteredFormat(numberFormat,horizontalAlignment)"
    }
})

# Conditional formatting for Status column — ON TARGET = green, WATCH = yellow, OVER = red
# ON TARGET
fmt.append({
    "addConditionalFormatRule": {
        "rule": {
            "ranges": [{"sheetId": sheet_id, "startRowIndex": dash_header_row + 1, "endRowIndex": DASH_END, "startColumnIndex": 7, "endColumnIndex": 8}],
            "booleanRule": {
                "condition": {"type": "TEXT_EQ", "values": [{"userEnteredValue": "ON TARGET"}]},
                "format": {
                    "backgroundColor": {"red": 0.72, "green": 0.88, "blue": 0.72},
                    "textFormat": {"bold": True, "foregroundColor": {"red": 0.13, "green": 0.4, "blue": 0.13}}
                }
            }
        },
        "index": 0
    }
})
# WATCH
fmt.append({
    "addConditionalFormatRule": {
        "rule": {
            "ranges": [{"sheetId": sheet_id, "startRowIndex": dash_header_row + 1, "endRowIndex": DASH_END, "startColumnIndex": 7, "endColumnIndex": 8}],
            "booleanRule": {
                "condition": {"type": "TEXT_EQ", "values": [{"userEnteredValue": "WATCH"}]},
                "format": {
                    "backgroundColor": {"red": 1.0, "green": 0.95, "blue": 0.7},
                    "textFormat": {"bold": True, "foregroundColor": {"red": 0.6, "green": 0.5, "blue": 0.0}}
                }
            }
        },
        "index": 1
    }
})
# OVER
fmt.append({
    "addConditionalFormatRule": {
        "rule": {
            "ranges": [{"sheetId": sheet_id, "startRowIndex": dash_header_row + 1, "endRowIndex": DASH_END, "startColumnIndex": 7, "endColumnIndex": 8}],
            "booleanRule": {
                "condition": {"type": "TEXT_EQ", "values": [{"userEnteredValue": "OVER"}]},
                "format": {
                    "backgroundColor": {"red": 0.96, "green": 0.73, "blue": 0.73},
                    "textFormat": {"bold": True, "foregroundColor": {"red": 0.6, "green": 0.1, "blue": 0.1}}
                }
            }
        },
        "index": 2
    }
})

# Dashboard TOTAL SPA OPS + GRAND TOTAL bold
for i in range(DASH_START, DASH_END):
    if i < len(rows) and rows[i]:
        first = str(rows[i][0])
        if first in ["TOTAL SPA OPS", "GRAND TOTAL"]:
            fmt.append({
                "repeatCell": {
                    "range": {"sheetId": sheet_id, "startRowIndex": i, "endRowIndex": i + 1, "startColumnIndex": 0, "endColumnIndex": NC},
                    "cell": {
                        "userEnteredFormat": {
                            "textFormat": {"bold": True},
                            "borders": {"top": {"style": "SOLID", "width": 1}}
                        }
                    },
                    "fields": "userEnteredFormat(textFormat,borders)"
                }
            })
            if first == "GRAND TOTAL":
                fmt.append({
                    "repeatCell": {
                        "range": {"sheetId": sheet_id, "startRowIndex": i, "endRowIndex": i + 1, "startColumnIndex": 0, "endColumnIndex": NC},
                        "cell": {
                            "userEnteredFormat": {
                                "textFormat": {"bold": True, "fontSize": 11, "foregroundColor": {"red": 1, "green": 1, "blue": 1}},
                                "backgroundColor": {"red": 0.16, "green": 0.31, "blue": 0.48},
                                "borders": {"top": {"style": "SOLID", "width": 2}, "bottom": {"style": "SOLID", "width": 2}}
                            }
                        },
                        "fields": "userEnteredFormat(textFormat,backgroundColor,borders)"
                    }
                })

# Freeze header
fmt.append({
    "updateSheetProperties": {
        "properties": {"sheetId": sheet_id, "gridProperties": {"frozenRowCount": 5}},
        "fields": "gridProperties.frozenRowCount"
    }
})

# ============================================================
# Add a BAR CHART: Revenue vs Payroll per hotel
# ============================================================
# Chart data is in the dashboard section
chart_data_start = dash_header_row  # header row of dashboard
chart_data_end = dash_header_row + 1 + len(hotels)  # 8 hotels + header

fmt.append({
    "addChart": {
        "chart": {
            "spec": {
                "title": "Annual Revenue vs HC Payroll by Hotel",
                "basicChart": {
                    "chartType": "COLUMN",
                    "legendPosition": "BOTTOM_LEGEND",
                    "axis": [
                        {"position": "BOTTOM_AXIS", "title": "Hotel"},
                        {"position": "LEFT_AXIS", "title": "EUR (Annual)"},
                    ],
                    "domains": [{
                        "domain": {
                            "sourceRange": {
                                "sources": [{
                                    "sheetId": sheet_id,
                                    "startRowIndex": chart_data_start,
                                    "endRowIndex": chart_data_end,
                                    "startColumnIndex": 0,  # A = Location
                                    "endColumnIndex": 1
                                }]
                            }
                        }
                    }],
                    "series": [
                        {
                            "series": {
                                "sourceRange": {
                                    "sources": [{
                                        "sheetId": sheet_id,
                                        "startRowIndex": chart_data_start,
                                        "endRowIndex": chart_data_end,
                                        "startColumnIndex": 4,  # E = Annual Revenue
                                        "endColumnIndex": 5
                                    }]
                                }
                            },
                            "targetAxis": "LEFT_AXIS",
                            "color": {"red": 0.3, "green": 0.6, "blue": 0.9},
                        },
                        {
                            "series": {
                                "sourceRange": {
                                    "sources": [{
                                        "sheetId": sheet_id,
                                        "startRowIndex": chart_data_start,
                                        "endRowIndex": chart_data_end,
                                        "startColumnIndex": 3,  # D = Annual Payroll
                                        "endColumnIndex": 4
                                    }]
                                }
                            },
                            "targetAxis": "LEFT_AXIS",
                            "color": {"red": 0.9, "green": 0.4, "blue": 0.3},
                        },
                    ],
                    "headerCount": 1,
                }
            },
            "position": {
                "overlayPosition": {
                    "anchorCell": {"sheetId": sheet_id, "rowIndex": DASH_END + 2, "columnIndex": 0},
                    "widthPixels": 900,
                    "heightPixels": 400
                }
            }
        }
    }
})

# HC% bar chart
fmt.append({
    "addChart": {
        "chart": {
            "spec": {
                "title": "HC % by Hotel (Target: 40%)",
                "basicChart": {
                    "chartType": "COLUMN",
                    "legendPosition": "NO_LEGEND",
                    "axis": [
                        {"position": "BOTTOM_AXIS", "title": "Hotel"},
                        {"position": "LEFT_AXIS", "title": "HC %"},
                    ],
                    "domains": [{
                        "domain": {
                            "sourceRange": {
                                "sources": [{
                                    "sheetId": sheet_id,
                                    "startRowIndex": chart_data_start,
                                    "endRowIndex": chart_data_end,
                                    "startColumnIndex": 0,
                                    "endColumnIndex": 1
                                }]
                            }
                        }
                    }],
                    "series": [
                        {
                            "series": {
                                "sourceRange": {
                                    "sources": [{
                                        "sheetId": sheet_id,
                                        "startRowIndex": chart_data_start,
                                        "endRowIndex": chart_data_end,
                                        "startColumnIndex": 5,  # F = HC%
                                        "endColumnIndex": 6
                                    }]
                                }
                            },
                            "targetAxis": "LEFT_AXIS",
                            "color": {"red": 0.2, "green": 0.5, "blue": 0.3},
                        },
                        {
                            "series": {
                                "sourceRange": {
                                    "sources": [{
                                        "sheetId": sheet_id,
                                        "startRowIndex": chart_data_start,
                                        "endRowIndex": chart_data_end,
                                        "startColumnIndex": 6,  # G = Target 40%
                                        "endColumnIndex": 7
                                    }]
                                }
                            },
                            "targetAxis": "LEFT_AXIS",
                            "type": "LINE",
                            "color": {"red": 0.9, "green": 0.2, "blue": 0.2},
                        },
                    ],
                    "headerCount": 1,
                }
            },
            "position": {
                "overlayPosition": {
                    "anchorCell": {"sheetId": sheet_id, "rowIndex": DASH_END + 25, "columnIndex": 0},
                    "widthPixels": 900,
                    "heightPixels": 400
                }
            }
        }
    }
})

# Apply all formatting
sheets_api.batchUpdate(
    spreadsheetId=SPREADSHEET_ID,
    body={"requests": fmt}
).execute()
print("Formatting + charts applied.")

print(f"\nDone! '{TAB_NAME}' updated with revenue, HC%, dashboard & charts.")
print(f"https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}")
