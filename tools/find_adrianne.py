#!/usr/bin/env python3
"""Find Adrianne's salary data + get Leticia's full Feb 26 row + Aesthetics revenue history."""

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

# 1. Search for Adrianne in Feb 26 (C) — full sheet
print("=== SEARCHING FOR ADRIANNE IN FEB 26 (C) ===")
result = sheets_api.values().get(
    spreadsheetId=SPREADSHEET_ID,
    range="'Feb 26 (C)'!A1:Z100"
).execute()
values = result.get("values", [])
for i, row in enumerate(values):
    row_str = " ".join(str(c) for c in row).lower()
    if any(k in row_str for k in ["adriann", "adriane", "beautician", "adrienn"]):
        print(f"  Row {i+1}: {row}")

# 2. Full search in Feb 26 (I) for Adrianne
print("\n=== SEARCHING FOR ADRIANNE IN FEB 26 (I) ===")
result = sheets_api.values().get(
    spreadsheetId=SPREADSHEET_ID,
    range="'Feb 26 (I)'!A1:Z100"
).execute()
values = result.get("values", [])
for i, row in enumerate(values):
    row_str = " ".join(str(c) for c in row).lower()
    if any(k in row_str for k in ["adriann", "adriane", "beautician", "adrienn", "leticia"]):
        print(f"  Row {i+1}: {row}")

# 3. Search in Staff master
print("\n=== SEARCHING IN STAFF MASTER ===")
result = sheets_api.values().get(
    spreadsheetId=SPREADSHEET_ID,
    range="'Staff master'!A1:Z100"
).execute()
values = result.get("values", [])
for i, row in enumerate(values):
    row_str = " ".join(str(c) for c in row).lower()
    if any(k in row_str for k in ["adriann", "adriane", "beautician", "adrienn", "leticia", "aesthetic"]):
        print(f"  Row {i+1}: {row}")

# 4. Search in UPDATED SALARY
print("\n=== SEARCHING IN UPDATED SALARY ===")
result = sheets_api.values().get(
    spreadsheetId=SPREADSHEET_ID,
    range="'UPDATED SALARY START SEPTEMBER'!A1:Z100"
).execute()
values = result.get("values", [])
for i, row in enumerate(values):
    row_str = " ".join(str(c) for c in row).lower()
    if any(k in row_str for k in ["adriann", "adriane", "beautician", "adrienn", "leticia", "aesthetic"]):
        print(f"  Row {i+1}: {row}")

# 5. Search in Monthly Salary
print("\n=== SEARCHING IN MONTHLY SALARY ===")
try:
    result = sheets_api.values().get(
        spreadsheetId=SPREADSHEET_ID,
        range="'Monthly Salary'!A1:Z100"
    ).execute()
    values = result.get("values", [])
    for i, row in enumerate(values):
        row_str = " ".join(str(c) for c in row).lower()
        if any(k in row_str for k in ["adriann", "adriane", "beautician", "adrienn", "leticia", "aesthetic"]):
            print(f"  Row {i+1}: {row}")
except Exception as e:
    print(f"  Error: {e}")

# 6. Search in Salary details
print("\n=== SEARCHING IN SALARY DETAILS ===")
try:
    result = sheets_api.values().get(
        spreadsheetId=SPREADSHEET_ID,
        range="'Salary details'!A1:Z100"
    ).execute()
    values = result.get("values", [])
    for i, row in enumerate(values):
        row_str = " ".join(str(c) for c in row).lower()
        if any(k in row_str for k in ["adriann", "adriane", "beautician", "adrienn", "leticia", "aesthetic"]):
            print(f"  Row {i+1}: {row}")
except Exception as e:
    print(f"  Error: {e}")

# 7. Get Leticia's FULL row in Feb 26 (C) — all columns
print("\n=== LETICIA FULL ROW - FEB 26 (C) ===")
result = sheets_api.values().get(
    spreadsheetId=SPREADSHEET_ID,
    range="'Feb 26 (C)'!A25:AZ25"
).execute()
values = result.get("values", [])
if values:
    print(f"  Full row: {values[0]}")

# 8. Get all Aesthetics revenue entries
print("\n=== AESTHETICS REVENUE BY MONTH ===")
months = [
    ("Aug 25 (C)", "I2:L5"),
    ("Sep 25 (C)", "I2:L5"),
    ("Oct 25 (C)", "K2:L5"),
    ("Nov 25 (C)", "K2:L5"),
    ("Dec 25 (C)", "K2:L5"),
    ("Jan 26 (C)", "K2:L5"),
    ("Feb 26 (C)", "K2:L5"),
]
for tab, rng in months:
    try:
        result = sheets_api.values().get(
            spreadsheetId=SPREADSHEET_ID,
            range=f"'{tab}'!{rng}"
        ).execute()
        values = result.get("values", [])
        print(f"  {tab}:")
        for row in values:
            if any("esthetic" in str(c).lower() or "retail" in str(c).lower() or "days" in str(c).lower() for c in row):
                print(f"    {row}")
    except Exception as e:
        print(f"  {tab}: Error - {e}")

# 9. Search broadly for Adrianne across ALL (C) tabs
print("\n=== BROAD SEARCH FOR ADRIANNE ===")
for tab_name in ["Feb 26 (C)", "Jan 26 (C)", "Dec 25 (C)", "Nov 25 (C)", "Oct 25 (C)"]:
    result = sheets_api.values().get(
        spreadsheetId=SPREADSHEET_ID,
        range=f"'{tab_name}'!A1:AZ80"
    ).execute()
    values = result.get("values", [])
    for i, row in enumerate(values):
        row_str = " ".join(str(c) for c in row).lower()
        if "adri" in row_str and "adriana" not in row_str:
            print(f"  {tab_name} Row {i+1}: {row[:15]}")
