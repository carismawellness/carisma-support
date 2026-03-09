#!/usr/bin/env python3
"""Push 'Aesthetics P&L' tab into the Salary Master Google Sheet.

Shows:
- Monthly aesthetics revenue (Oct 25 – Feb 26) as the "new normal"
- 30% doctor cost (percentage share of revenue)
- 50/50 revenue attribution (Leticia vs Doctors)
- Leticia's base salary (EUR 1,800)
- Adriene Paula (beautician) salary
- Total costs, net margin, HC%
"""

import json
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# ── Auth ──────────────────────────────────────────────────────────────────────
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

TAB_NAME = "Aesthetics P&L"

# ── Data ──────────────────────────────────────────────────────────────────────
# Revenue from (C) tabs column K
MONTHS = ["Oct 25", "Nov 25", "Dec 25", "Jan 26", "Feb 26"]
REVENUE = [33329, 79276, 81097, 70105, 57717]

# Salaries
LETICIA_SALARY = 1800   # EUR/mo gross
ADRIENE_SALARY = 1200   # EUR/mo — PLACEHOLDER: not found in Salary Master, update as needed
DOCTOR_PCT = 0.30       # 30% of revenue to doctors
ATTRIB_SPLIT = 0.50     # 50/50 revenue attribution

# Computed
avg_rev = round(sum(REVENUE) / len(REVENUE))
annual_rev = avg_rev * 12

# Per-month calculations
doctor_cost = [round(r * DOCTOR_PCT) for r in REVENUE]
leticia_attrib = [round(r * ATTRIB_SPLIT) for r in REVENUE]
doctor_attrib = [round(r * ATTRIB_SPLIT) for r in REVENUE]
total_staff = [dc + LETICIA_SALARY + ADRIENE_SALARY for dc in doctor_cost]
net_margin = [REVENUE[i] - total_staff[i] for i in range(len(REVENUE))]
hc_pct = [round(total_staff[i] / REVENUE[i] * 100, 1) for i in range(len(REVENUE))]

# Averages for "New Normal"
avg_doc_cost = round(sum(doctor_cost) / len(doctor_cost))
avg_let_attrib = round(sum(leticia_attrib) / len(leticia_attrib))
avg_doc_attrib = round(sum(doctor_attrib) / len(doctor_attrib))
avg_total_staff = round(sum(total_staff) / len(total_staff))
avg_net_margin = round(sum(net_margin) / len(net_margin))
avg_hc_pct = round(sum(hc_pct) / len(hc_pct), 1)

# Annual projections
ann_doc_cost = avg_doc_cost * 12
ann_let_salary = LETICIA_SALARY * 12
ann_adr_salary = ADRIENE_SALARY * 12
ann_total_staff = avg_total_staff * 12
ann_net_margin = avg_net_margin * 12
ann_hc_pct = avg_hc_pct  # same %

# ── Build rows ────────────────────────────────────────────────────────────────
rows = []

# Row 1: Title
rows.append(["CARISMA AESTHETICS — P&L OVERVIEW"])
# Row 2: Subtitle
rows.append(["Revenue extrapolated from Oct 2025 – Feb 2026 as the 'New Normal'"])
# Row 3: blank
rows.append([""])

# Row 4: Headers
rows.append(["", *MONTHS, "Avg (New Normal)", "Annual Projection"])

# Row 5: blank separator
rows.append([""])

# Row 6: Section header — REVENUE
rows.append(["REVENUE"])
# Row 7: Aesthetics Revenue
rows.append(["Aesthetics Revenue", *REVENUE, avg_rev, annual_rev])

# Row 8: blank
rows.append([""])

# Row 9: Section header — REVENUE ATTRIBUTION
rows.append(["REVENUE ATTRIBUTION (50/50 Split)"])
# Row 10: Leticia attribution
rows.append(["Leticia Attribution (50%)", *leticia_attrib, avg_let_attrib, avg_let_attrib * 12])
# Row 11: Doctor attribution
rows.append(["Doctor Attribution (50%)", *doctor_attrib, avg_doc_attrib, avg_doc_attrib * 12])

# Row 12: blank
rows.append([""])

# Row 13: Section header — COSTS
rows.append(["COSTS"])
# Row 14: Doctor cost
rows.append(["Doctor Cost (30% of Revenue)", *doctor_cost, avg_doc_cost, ann_doc_cost])
# Row 15: Leticia salary
rows.append(["Leticia Bonassi — Base Salary", *([LETICIA_SALARY] * len(MONTHS)), LETICIA_SALARY, ann_let_salary])
# Row 16: Adriene salary
rows.append(["Adriene Paula — Beautician Salary *", *([ADRIENE_SALARY] * len(MONTHS)), ADRIENE_SALARY, ann_adr_salary])
# Row 17: Total staff cost
rows.append(["Total Staff Cost", *total_staff, avg_total_staff, ann_total_staff])

# Row 18: blank
rows.append([""])

# Row 19: Section header — MARGINS
rows.append(["MARGINS"])
# Row 20: Net margin
rows.append(["Net Margin (Revenue – Costs)", *net_margin, avg_net_margin, ann_net_margin])
# Row 21: HC%
hc_pct_display = [f"{p}%" for p in hc_pct]
rows.append(["HC% (Staff Cost / Revenue)", *hc_pct_display, f"{avg_hc_pct}%", f"{ann_hc_pct}%"])

# Row 22: blank
rows.append([""])

# Row 23–30: SUMMARY DASHBOARD
rows.append(["SUMMARY DASHBOARD"])
rows.append(["", "Monthly (Avg)", "Annual"])
rows.append(["Aesthetics Revenue", avg_rev, annual_rev])
rows.append(["Doctor Cost (30%)", avg_doc_cost, ann_doc_cost])
rows.append(["Leticia Salary", LETICIA_SALARY, ann_let_salary])
rows.append(["Adriene Salary *", ADRIENE_SALARY, ann_adr_salary])
rows.append(["Total Staff Cost", avg_total_staff, ann_total_staff])
rows.append(["Net Margin", avg_net_margin, ann_net_margin])
rows.append(["HC%", f"{avg_hc_pct}%", f"{ann_hc_pct}%"])

# Row 33: blank
rows.append([""])
# Row 34: Note
rows.append(["* Adriene salary is a placeholder (EUR 1,200/mo). Update with actual February salary if different."])

# ── Delete existing tab if it exists ──────────────────────────────────────────
meta = sheets_api.get(spreadsheetId=SPREADSHEET_ID).execute()
for s in meta["sheets"]:
    if s["properties"]["title"] == TAB_NAME:
        sheets_api.batchUpdate(
            spreadsheetId=SPREADSHEET_ID,
            body={"requests": [{"deleteSheet": {"sheetId": s["properties"]["sheetId"]}}]}
        ).execute()
        print(f"Deleted existing '{TAB_NAME}' tab.")
        break

# ── Create new tab ────────────────────────────────────────────────────────────
add_resp = sheets_api.batchUpdate(
    spreadsheetId=SPREADSHEET_ID,
    body={"requests": [{"addSheet": {"properties": {"title": TAB_NAME}}}]}
).execute()
sheet_id = add_resp["replies"][0]["addSheet"]["properties"]["sheetId"]
print(f"Created '{TAB_NAME}' tab (sheetId={sheet_id}).")

# ── Write data ────────────────────────────────────────────────────────────────
sheets_api.values().update(
    spreadsheetId=SPREADSHEET_ID,
    range=f"'{TAB_NAME}'!A1",
    valueInputOption="USER_ENTERED",
    body={"values": rows}
).execute()
print("Data written.")

# ── Formatting ────────────────────────────────────────────────────────────────
NUM_COLS = 8  # A through H
NUM_ROWS = len(rows)

fmt_requests = []

# Column widths
col_widths = [310, 100, 100, 100, 100, 100, 140, 140]
for i, w in enumerate(col_widths):
    fmt_requests.append({
        "updateDimensionProperties": {
            "range": {"sheetId": sheet_id, "dimension": "COLUMNS", "startIndex": i, "endIndex": i + 1},
            "properties": {"pixelSize": w},
            "fields": "pixelSize"
        }
    })

# Title formatting (Row 1)
fmt_requests.append({
    "repeatCell": {
        "range": {"sheetId": sheet_id, "startRowIndex": 0, "endRowIndex": 1, "startColumnIndex": 0, "endColumnIndex": NUM_COLS},
        "cell": {"userEnteredFormat": {
            "textFormat": {"bold": True, "fontSize": 14},
            "backgroundColor": {"red": 0.16, "green": 0.16, "blue": 0.16},
            "textFormat": {"bold": True, "fontSize": 14, "foregroundColor": {"red": 1, "green": 1, "blue": 1}}
        }},
        "fields": "userEnteredFormat(textFormat,backgroundColor)"
    }
})

# Subtitle (Row 2) — italic grey
fmt_requests.append({
    "repeatCell": {
        "range": {"sheetId": sheet_id, "startRowIndex": 1, "endRowIndex": 2, "startColumnIndex": 0, "endColumnIndex": NUM_COLS},
        "cell": {"userEnteredFormat": {
            "textFormat": {"italic": True, "fontSize": 10, "foregroundColor": {"red": 0.5, "green": 0.5, "blue": 0.5}}
        }},
        "fields": "userEnteredFormat(textFormat)"
    }
})

# Header row (Row 4, index 3) — bold, dark background
fmt_requests.append({
    "repeatCell": {
        "range": {"sheetId": sheet_id, "startRowIndex": 3, "endRowIndex": 4, "startColumnIndex": 0, "endColumnIndex": NUM_COLS},
        "cell": {"userEnteredFormat": {
            "textFormat": {"bold": True, "fontSize": 10, "foregroundColor": {"red": 1, "green": 1, "blue": 1}},
            "backgroundColor": {"red": 0.2, "green": 0.2, "blue": 0.2},
            "horizontalAlignment": "CENTER"
        }},
        "fields": "userEnteredFormat(textFormat,backgroundColor,horizontalAlignment)"
    }
})

# Section headers — bold with light purple background
section_header_rows = [5, 8, 12, 18, 22]  # 0-indexed: REVENUE, REVENUE ATTRIBUTION, COSTS, MARGINS, SUMMARY DASHBOARD
for r in section_header_rows:
    fmt_requests.append({
        "repeatCell": {
            "range": {"sheetId": sheet_id, "startRowIndex": r, "endRowIndex": r + 1, "startColumnIndex": 0, "endColumnIndex": NUM_COLS},
            "cell": {"userEnteredFormat": {
                "textFormat": {"bold": True, "fontSize": 11},
                "backgroundColor": {"red": 0.9, "green": 0.85, "blue": 0.95}
            }},
            "fields": "userEnteredFormat(textFormat,backgroundColor)"
        }
    })

# Summary dashboard header row (Row 24, index 23)
fmt_requests.append({
    "repeatCell": {
        "range": {"sheetId": sheet_id, "startRowIndex": 23, "endRowIndex": 24, "startColumnIndex": 0, "endColumnIndex": 3},
        "cell": {"userEnteredFormat": {
            "textFormat": {"bold": True, "fontSize": 10},
            "backgroundColor": {"red": 0.85, "green": 0.85, "blue": 0.85},
            "horizontalAlignment": "CENTER"
        }},
        "fields": "userEnteredFormat(textFormat,backgroundColor,horizontalAlignment)"
    }
})

# EUR formatting for revenue/cost cells (rows 7, 10-11, 14-17, 20, 25-30)
eur_rows = [6, 9, 10, 13, 14, 15, 16, 19, 24, 25, 26, 27, 28, 29]
for r in eur_rows:
    fmt_requests.append({
        "repeatCell": {
            "range": {"sheetId": sheet_id, "startRowIndex": r, "endRowIndex": r + 1, "startColumnIndex": 1, "endColumnIndex": NUM_COLS},
            "cell": {"userEnteredFormat": {
                "numberFormat": {"type": "CURRENCY", "pattern": "€#,##0"}
            }},
            "fields": "userEnteredFormat(numberFormat)"
        }
    })

# Total Staff Cost row — bold border top
fmt_requests.append({
    "repeatCell": {
        "range": {"sheetId": sheet_id, "startRowIndex": 16, "endRowIndex": 17, "startColumnIndex": 0, "endColumnIndex": NUM_COLS},
        "cell": {"userEnteredFormat": {
            "textFormat": {"bold": True},
            "borders": {"top": {"style": "SOLID", "width": 2, "color": {"red": 0, "green": 0, "blue": 0}}}
        }},
        "fields": "userEnteredFormat(textFormat,borders)"
    }
})

# Net Margin row — bold
fmt_requests.append({
    "repeatCell": {
        "range": {"sheetId": sheet_id, "startRowIndex": 19, "endRowIndex": 20, "startColumnIndex": 0, "endColumnIndex": NUM_COLS},
        "cell": {"userEnteredFormat": {
            "textFormat": {"bold": True},
            "borders": {"top": {"style": "SOLID", "width": 2, "color": {"red": 0, "green": 0, "blue": 0}}}
        }},
        "fields": "userEnteredFormat(textFormat,borders)"
    }
})

# HC% row — bold with conditional color
# Green if < 35%, Yellow if 35-45%, Red if > 45%
# Row 21 (index 20) has HC% values
fmt_requests.append({
    "addConditionalFormatRule": {
        "rule": {
            "ranges": [{"sheetId": sheet_id, "startRowIndex": 20, "endRowIndex": 21, "startColumnIndex": 1, "endColumnIndex": NUM_COLS}],
            "booleanRule": {
                "condition": {"type": "TEXT_CONTAINS", "values": [{"userEnteredValue": "%"}]},
                "format": {"textFormat": {"bold": True}}
            }
        },
        "index": 0
    }
})

# Note row — italic grey
fmt_requests.append({
    "repeatCell": {
        "range": {"sheetId": sheet_id, "startRowIndex": NUM_ROWS - 1, "endRowIndex": NUM_ROWS, "startColumnIndex": 0, "endColumnIndex": NUM_COLS},
        "cell": {"userEnteredFormat": {
            "textFormat": {"italic": True, "fontSize": 9, "foregroundColor": {"red": 0.6, "green": 0.3, "blue": 0.3}}
        }},
        "fields": "userEnteredFormat(textFormat)"
    }
})

# Freeze first column and header rows
fmt_requests.append({
    "updateSheetProperties": {
        "properties": {
            "sheetId": sheet_id,
            "gridProperties": {"frozenRowCount": 4, "frozenColumnCount": 1}
        },
        "fields": "gridProperties.frozenRowCount,gridProperties.frozenColumnCount"
    }
})

# ── Charts ────────────────────────────────────────────────────────────────────
# Chart 1: Monthly Revenue vs Total Staff Cost (bar chart)
fmt_requests.append({
    "addChart": {
        "chart": {
            "position": {
                "overlayPosition": {
                    "anchorCell": {"sheetId": sheet_id, "rowIndex": 1, "columnIndex": 9},
                    "widthPixels": 600,
                    "heightPixels": 350
                }
            },
            "spec": {
                "title": "Monthly Revenue vs Total Staff Cost",
                "basicChart": {
                    "chartType": "COLUMN",
                    "legendPosition": "BOTTOM_LEGEND",
                    "axis": [
                        {"position": "BOTTOM_AXIS", "title": "Month"},
                        {"position": "LEFT_AXIS", "title": "EUR"}
                    ],
                    "domains": [{
                        "domain": {
                            "sourceRange": {
                                "sources": [{"sheetId": sheet_id, "startRowIndex": 3, "endRowIndex": 4, "startColumnIndex": 1, "endColumnIndex": 6}]
                            }
                        }
                    }],
                    "series": [
                        {
                            "series": {
                                "sourceRange": {
                                    "sources": [{"sheetId": sheet_id, "startRowIndex": 6, "endRowIndex": 7, "startColumnIndex": 1, "endColumnIndex": 6}]
                                }
                            },
                            "targetAxis": "LEFT_AXIS",
                            "color": {"red": 0.2, "green": 0.6, "blue": 0.3}
                        },
                        {
                            "series": {
                                "sourceRange": {
                                    "sources": [{"sheetId": sheet_id, "startRowIndex": 16, "endRowIndex": 17, "startColumnIndex": 1, "endColumnIndex": 6}]
                                }
                            },
                            "targetAxis": "LEFT_AXIS",
                            "color": {"red": 0.8, "green": 0.3, "blue": 0.3}
                        }
                    ],
                    "headerCount": 0
                }
            }
        }
    }
})

# Chart 2: Cost Breakdown — Stacked bar (Doctor + Leticia + Adriene)
fmt_requests.append({
    "addChart": {
        "chart": {
            "position": {
                "overlayPosition": {
                    "anchorCell": {"sheetId": sheet_id, "rowIndex": 20, "columnIndex": 9},
                    "widthPixels": 600,
                    "heightPixels": 350
                }
            },
            "spec": {
                "title": "Cost Breakdown by Month",
                "basicChart": {
                    "chartType": "COLUMN",
                    "legendPosition": "BOTTOM_LEGEND",
                    "stackedType": "STACKED",
                    "axis": [
                        {"position": "BOTTOM_AXIS", "title": "Month"},
                        {"position": "LEFT_AXIS", "title": "EUR"}
                    ],
                    "domains": [{
                        "domain": {
                            "sourceRange": {
                                "sources": [{"sheetId": sheet_id, "startRowIndex": 3, "endRowIndex": 4, "startColumnIndex": 1, "endColumnIndex": 6}]
                            }
                        }
                    }],
                    "series": [
                        {
                            "series": {
                                "sourceRange": {
                                    "sources": [{"sheetId": sheet_id, "startRowIndex": 13, "endRowIndex": 14, "startColumnIndex": 1, "endColumnIndex": 6}]
                                }
                            },
                            "targetAxis": "LEFT_AXIS",
                            "color": {"red": 0.9, "green": 0.5, "blue": 0.2}
                        },
                        {
                            "series": {
                                "sourceRange": {
                                    "sources": [{"sheetId": sheet_id, "startRowIndex": 14, "endRowIndex": 15, "startColumnIndex": 1, "endColumnIndex": 6}]
                                }
                            },
                            "targetAxis": "LEFT_AXIS",
                            "color": {"red": 0.3, "green": 0.5, "blue": 0.8}
                        },
                        {
                            "series": {
                                "sourceRange": {
                                    "sources": [{"sheetId": sheet_id, "startRowIndex": 15, "endRowIndex": 16, "startColumnIndex": 1, "endColumnIndex": 6}]
                                }
                            },
                            "targetAxis": "LEFT_AXIS",
                            "color": {"red": 0.6, "green": 0.3, "blue": 0.7}
                        }
                    ],
                    "headerCount": 0
                }
            }
        }
    }
})

# ── Apply all formatting ──────────────────────────────────────────────────────
sheets_api.batchUpdate(
    spreadsheetId=SPREADSHEET_ID,
    body={"requests": fmt_requests}
).execute()
print("Formatting + charts applied.")

print(f"\nDone! '{TAB_NAME}' tab created in Salary Master Sheet.")
print(f"NOTE: Adriene Paula's salary is set to EUR {ADRIENE_SALARY}/mo (placeholder).")
print("      Update cell B16/C16/D16/E16/F16 with her actual February salary if different.")
