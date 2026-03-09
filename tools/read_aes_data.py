#!/usr/bin/env python3
"""Read Leticia's salary, Adrianne's Feb salary, and Aesthetics revenue from Salary Master."""

import json
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

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
            "access_token": creds.token, "expires_in": 3599,
            "refresh_token": creds.refresh_token,
            "scope": token_data.get("scope", ""),
            "token_type": "Bearer",
            "refresh_token_expires_in": token_data.get("refresh_token_expires_in", 0),
        }, f, indent=2)

service = build("sheets", "v4", credentials=creds)
sheets_api = service.spreadsheets()

# 1. Get all sheet names
meta = sheets_api.get(spreadsheetId=SPREADSHEET_ID).execute()
print("=== ALL TABS ===")
for s in meta["sheets"]:
    title = s["properties"]["title"]
    print(f"  {title}")

# 2. Look for Leticia / Adrianne in tabs that might have salary data
# Search common salary-related tab names
search_tabs = []
for s in meta["sheets"]:
    title = s["properties"]["title"]
    tl = title.lower()
    if any(k in tl for k in ["leticia", "adrianne", "adriane", "aes", "aesthetic", "(c)", "feb", "salary"]):
        search_tabs.append(title)

print(f"\n=== RELEVANT TABS: {search_tabs} ===")

# 3. Read those tabs
for tab in search_tabs[:10]:  # limit to avoid too much data
    try:
        result = sheets_api.values().get(
            spreadsheetId=SPREADSHEET_ID,
            range=f"'{tab}'!A1:Z30"
        ).execute()
        values = result.get("values", [])
        print(f"\n--- {tab} (first 30 rows) ---")
        for i, row in enumerate(values):
            # Only print rows that have data
            if any(str(c).strip() for c in row):
                print(f"  Row {i+1}: {row[:10]}")  # first 10 cols
    except Exception as e:
        print(f"  ERROR reading {tab}: {e}")

# 4. Also search for any tab with "Leticia" in cell content
# Try the main calculation tabs
calc_tabs = [t for t in [s["properties"]["title"] for s in meta["sheets"]]
             if "(C)" in t or "calc" in t.lower() or "AES" in t.upper()]
print(f"\n=== CALCULATION TABS: {calc_tabs} ===")

for tab in calc_tabs[:5]:
    try:
        result = sheets_api.values().get(
            spreadsheetId=SPREADSHEET_ID,
            range=f"'{tab}'!A1:Z50"
        ).execute()
        values = result.get("values", [])
        print(f"\n--- {tab} (first 50 rows) ---")
        for i, row in enumerate(values):
            row_str = " ".join(str(c) for c in row)
            if any(k in row_str.lower() for k in ["leticia", "adrianne", "adriane", "revenue", "total", "salary", "doctor"]):
                print(f"  Row {i+1}: {row[:12]}")
    except Exception as e:
        print(f"  ERROR: {e}")
