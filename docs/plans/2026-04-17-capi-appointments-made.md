# "Appointments Made" Meta Ads Custom Reporting — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Push Zoho CRM deal stage changes back to Meta via the Conversions API so that "Appointments Made" (and "Consultations Booked") appear as native columns in Meta Ads Manager — enabling true closed-loop attribution across all 3 brands.

**Architecture:** A scheduled Python script runs every 4 hours, queries each brand's Zoho CRM for newly closed deals, sends conversion events to Meta's Conversions API (CAPI) matched via Meta Lead ID + hashed PII, and marks deals as sent to prevent duplicates. Two custom events are tracked: `ConsultationBooked` and `AppointmentMade`.

**Tech Stack:** Python (requests, hashlib, dotenv), Meta Conversions API v21.0, Zoho CRM MCP (COQL queries), macOS launchd for scheduling.

---

## Context

Currently, Meta Ads reporting shows leads generated but has zero visibility into what happens after a lead enters Zoho CRM. There's no way to know which ads, ad sets, or campaigns actually produce booked appointments vs. dead leads. This makes budget optimization guesswork.

By pushing conversion events back to Meta when deals hit "Consultation - won" and "Booking closed won", we close the attribution loop. Meta's algorithm also benefits — it can optimize delivery toward users who are more likely to actually book, not just submit a lead form.

**Key finding from research:** All Facebook leads arrive via Lead Ads (instant forms), meaning users never visit the website. This means:
- **fbclid is NOT the primary matching mechanism** (users don't click through to a URL)
- **Meta Lead ID is the key** — Zoho's built-in Facebook Advert Manager integration syncs leads with a Meta lead ID that provides near-100% match rate
- No landing page JavaScript changes needed

---

## Phase 0: Manual Prerequisites (Human in Browser)

These steps CANNOT be automated and must be completed before any code runs.

### Task 0A: Renew Meta Access Token & Fill App Credentials

**Why:** Current token expired 2026-03-25. CAPI requires APP_ID + APP_SECRET.

**Steps:**
1. Go to [Meta Business Settings > System Users](https://business.facebook.com/settings/system-users)
2. Select or create a System User with `ads_management`, `ads_read`, `business_management` scopes
3. Generate a new token — copy it
4. Go to [Meta App Dashboard](https://developers.facebook.com) — copy the App ID and App Secret
5. Update `.env`:
   ```
   META_APP_ID=<app_id>
   META_APP_SECRET=<app_secret>
   META_ACCESS_TOKEN=<new_token>
   ```

### Task 0B: Get Pixel IDs for All 3 Brands

**Why:** `pixel_id` is `TO_BE_FILLED` in `Config/brands.json` for all brands. CAPI events are sent to a pixel.

**Steps:**
1. Go to [Meta Events Manager](https://business.facebook.com/events_manager2) for each ad account:
   - Spa: `act_654279452039150`
   - Aesthetics: `act_382359687910745`
   - Slimming: `act_1496776195316716`
2. Find or create a Meta Pixel for each account
3. Record the Pixel IDs

### Task 0C: Add Custom Fields to Zoho CRM (All 3 Instances)

**Why:** We need fields to store Meta attribution data and track which deals have been synced.

**Fields to add in Deals module for each CRM (Spa, Aesthetics, Slimming):**

| Field Label | API Name | Type | Purpose |
|-------------|----------|------|---------|
| Meta Lead ID | `Meta_Lead_ID` | Single Line (100) | Stores the Facebook lead form submission ID for CAPI matching |
| CAPI Sent | `CAPI_Sent` | Checkbox | Deduplication flag — `true` means conversion already pushed to Meta |
| CAPI Sent At | `CAPI_Sent_At` | DateTime | Timestamp of when the conversion was sent |
| CAPI Event | `CAPI_Event` | Single Line (50) | Which event was sent (ConsultationBooked or AppointmentMade) |

**Note:** Before adding `Meta_Lead_ID`, check whether Zoho's existing Facebook Advert Manager integration (`facebookadvertmanager__*` module) already maps the lead ID to a field. If it does, use that field instead.

### Task 0D: Investigate Zoho Facebook Integration

**Why:** The `facebookadvertmanager` module is already installed in all 3 CRMs. We need to know what data it captures.

**Steps (for each CRM instance):**
1. Go to Zoho CRM > Setup > Marketplace > Installed
2. Open the Facebook Advert Manager integration settings
3. Document: Which module do Facebook leads land in (Leads or Deals/Bookings)?
4. Document: What fields are mapped? Is Meta's `leadgen_id` stored anywhere?
5. Document: Is `ad_id`, `campaign_id`, or `adset_id` captured?

**This information directly affects Task 2** — if `leadgen_id` is already captured, we use it as-is. If not, we need to configure the mapping.

### Task 0E: Configure Aggregated Event Measurement

**Why:** Custom events must be registered in Meta's event priority system for proper attribution.

**Steps (for each pixel):**
1. Go to Events Manager > Pixel > Settings > Aggregated Event Measurement
2. Configure Web Events: add `ConsultationBooked` and `AppointmentMade` as custom events
3. Set priority: `AppointmentMade` > `ConsultationBooked` > `Lead` (higher = more important)

---

## Phase 1: Configuration Updates

### Task 1: Update `Config/brands.json` with Pixel IDs and CAPI Config

**Files:**
- Modify: `Config/brands.json`

**Step 1:** Add these fields to each brand object in `Config/brands.json`:

For **Spa**:
```json
"pixel_id": "<PIXEL_ID_FROM_0B>",
"capi_events": {
  "consultation_booked": {
    "event_name": "ConsultationBooked",
    "trigger_stage": "Closed Won"
  },
  "appointment_made": {
    "event_name": "AppointmentMade",
    "trigger_stage": "Closed Won"
  }
}
```

For **Aesthetics** and **Slimming**:
```json
"pixel_id": "<PIXEL_ID_FROM_0B>",
"capi_events": {
  "consultation_booked": {
    "event_name": "ConsultationBooked",
    "trigger_stage": "Consultation - won"
  },
  "appointment_made": {
    "event_name": "AppointmentMade",
    "trigger_stage": "Booking closed won"
  }
}
```

**Note on Spa:** Spa's pipeline is simpler — it has `Closed Won` but no separate "Consultation - won" stage. Both events map to `Closed Won` for Spa. We can revisit if Spa adds a consultation stage later.

**Step 2:** Verify the file is valid JSON.

**Step 3:** Commit.
```bash
git add Config/brands.json
git commit -m "feat: add pixel IDs and CAPI event config to brands.json"
```

---

## Phase 2: Core CAPI Script

### Task 2: Create `Tools/push_capi_conversions.py`

**Files:**
- Create: `Tools/push_capi_conversions.py`
- Reference: `Tools/pull_ad_insights.py` (for script structure pattern)

**Script responsibilities:**
1. Load brand config from `Config/brands.json`
2. For each brand, query Zoho CRM via COQL for deals at target stages where `CAPI_Sent` = false
3. For each qualifying deal, build a CAPI event payload with hashed PII + Meta Lead ID
4. Send events to Meta CAPI endpoint: `POST https://graph.facebook.com/v21.0/{pixel_id}/events`
5. On success, update each deal in Zoho: `CAPI_Sent` = true, `CAPI_Sent_At` = now, `CAPI_Event` = event name
6. Log all results

**Step 1:** Create the script with this structure:

```python
#!/usr/bin/env python3
"""Push Zoho CRM deal conversions to Meta Conversions API.

Queries each brand's Zoho CRM for deals that reached target stages
(Consultation-won, Booking closed won) and sends conversion events
to Meta CAPI for closed-loop attribution in Ads Manager.

Usage:
    python push_capi_conversions.py --all-brands
    python push_capi_conversions.py --brand carisma_aesthetics
    python push_capi_conversions.py --brand carisma_spa --dry-run
"""

import argparse
import hashlib
import json
import logging
import os
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
from dotenv import load_dotenv

# --- Config ---

BRANDS_JSON = Path(__file__).parent.parent / "Config" / "brands.json"
CAPI_VERSION = "v21.0"
CAPI_BASE_URL = f"https://graph.facebook.com/{CAPI_VERSION}"

# Zoho CRM MCP server names per brand
ZOHO_MCP_SERVERS = {
    "carisma_spa": "zoho-crm-spa",
    "carisma_aesthetics": "zoho-crm-aesthetics",
    "carisma_slimming": "zoho-crm-slimming",
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger("capi_sync")


def load_config():
    """Load brand config from brands.json."""
    with open(BRANDS_JSON) as f:
        data = json.load(f)
    return {b["brand_id"]: b for b in data["brands"]}


def hash_pii(value: str) -> str:
    """SHA-256 hash a PII value per Meta CAPI spec (lowercase, stripped)."""
    if not value:
        return ""
    return hashlib.sha256(value.strip().lower().encode("utf-8")).hexdigest()


def build_event_id(brand_id: str, deal_id: str, event_name: str) -> str:
    """Deterministic event ID for deduplication."""
    raw = f"{brand_id}:{deal_id}:{event_name}"
    return hashlib.sha256(raw.encode()).hexdigest()[:32]


def build_capi_event(deal: dict, brand: dict, event_name: str) -> dict:
    """Build a single CAPI event payload from a Zoho deal record."""
    # Extract PII from deal — field names may vary per CRM setup
    email = deal.get("Email") or deal.get("Contact_Name", {}).get("email", "")
    phone = deal.get("Phone") or ""
    first_name = deal.get("First_Name") or ""
    last_name = deal.get("Last_Name") or ""
    meta_lead_id = deal.get("Meta_Lead_ID") or ""
    deal_id = deal.get("id", "")
    close_date = deal.get("Closing_Date") or deal.get("Modified_Time") or ""
    amount = deal.get("Amount") or 0

    # Parse close date to unix timestamp
    try:
        if "T" in str(close_date):
            dt = datetime.fromisoformat(close_date.replace("Z", "+00:00"))
        else:
            dt = datetime.strptime(str(close_date), "%Y-%m-%d").replace(
                tzinfo=timezone.utc
            )
        event_time = int(dt.timestamp())
    except (ValueError, TypeError):
        event_time = int(time.time())

    user_data = {
        "em": [hash_pii(email)] if email else [],
        "ph": [hash_pii(phone)] if phone else [],
        "fn": [hash_pii(first_name)] if first_name else [],
        "ln": [hash_pii(last_name)] if last_name else [],
        "country": [hash_pii("mt")],
    }

    # Lead ID provides highest match rate for Lead Ads
    if meta_lead_id:
        user_data["lead_id"] = str(meta_lead_id)

    event = {
        "event_name": event_name,
        "event_time": event_time,
        "event_id": build_event_id(brand["brand_id"], str(deal_id), event_name),
        "action_source": "system_generated",
        "user_data": user_data,
        "custom_data": {
            "currency": brand.get("currency", "EUR"),
            "value": float(amount) if amount else 0.0,
        },
    }

    return event


def send_events(pixel_id: str, access_token: str, events: list[dict], dry_run: bool = False) -> dict:
    """Send a batch of events to Meta CAPI."""
    url = f"{CAPI_BASE_URL}/{pixel_id}/events"
    payload = {
        "data": events,
        "access_token": access_token,
    }

    if dry_run:
        # Use Meta's test endpoint
        payload["test_event_code"] = "TEST_CAPI"  # Replace with actual test code from Events Manager
        log.info(f"[DRY RUN] Would send {len(events)} events to pixel {pixel_id}")
        log.info(f"[DRY RUN] Payload preview: {json.dumps(events[0], indent=2)}")
        return {"events_received": len(events), "dry_run": True}

    resp = requests.post(url, json=payload, timeout=30)
    resp.raise_for_status()
    result = resp.json()
    log.info(f"CAPI response for pixel {pixel_id}: {result}")
    return result


def run_brand(brand_id: str, config: dict, dry_run: bool = False):
    """Process one brand: query Zoho, send CAPI events, mark as sent."""
    brand = config.get(brand_id)
    if not brand:
        log.error(f"Brand {brand_id} not found in config")
        return

    pixel_id = brand.get("pixel_id")
    if not pixel_id or pixel_id == "TO_BE_FILLED":
        log.warning(f"Skipping {brand_id}: pixel_id not configured")
        return

    access_token = os.getenv("META_ACCESS_TOKEN")
    if not access_token:
        log.error("META_ACCESS_TOKEN not set in .env")
        return

    capi_events_config = brand.get("capi_events", {})
    if not capi_events_config:
        log.warning(f"Skipping {brand_id}: no capi_events configured")
        return

    log.info(f"--- Processing {brand['brand_name']} ---")

    # For each configured event type, query Zoho and send CAPI events
    for event_key, event_cfg in capi_events_config.items():
        event_name = event_cfg["event_name"]
        trigger_stage = event_cfg["trigger_stage"]

        log.info(f"Querying deals at stage '{trigger_stage}' for event '{event_name}'")

        # TODO: Replace with actual Zoho COQL query via subprocess or MCP
        # This is the query that would run:
        # SELECT id, Deal_Name, Contact_Name, Email, Phone,
        #        First_Name, Last_Name, Meta_Lead_ID,
        #        Closing_Date, Amount, Stage, Modified_Time
        # FROM Deals
        # WHERE Stage = '{trigger_stage}'
        #   AND CAPI_Sent = false
        #   AND Closing_Date >= '2026-01-01'
        # LIMIT 200

        # For now, this section needs the Zoho query mechanism
        # See Task 3 for the query implementation
        deals = []  # Placeholder — filled in Task 3

        if not deals:
            log.info(f"No unsent deals at stage '{trigger_stage}'")
            continue

        # Build CAPI events
        events = [build_capi_event(d, brand, event_name) for d in deals]
        log.info(f"Built {len(events)} CAPI events")

        # Send to Meta
        result = send_events(pixel_id, access_token, events, dry_run=dry_run)

        if not dry_run and result.get("events_received"):
            # Mark deals as sent in Zoho
            # TODO: Implement Zoho update — see Task 3
            deal_ids = [d["id"] for d in deals]
            log.info(f"Would mark {len(deal_ids)} deals as CAPI_Sent=true")


def main():
    load_dotenv(Path(__file__).parent.parent / ".env")
    parser = argparse.ArgumentParser(description="Push Zoho CRM conversions to Meta CAPI")
    parser.add_argument("--brand", help="Specific brand_id to process")
    parser.add_argument("--all-brands", action="store_true", help="Process all active brands")
    parser.add_argument("--dry-run", action="store_true", help="Preview payloads without sending")
    args = parser.parse_args()

    config = load_config()

    if args.all_brands:
        for brand_id in ZOHO_MCP_SERVERS:
            run_brand(brand_id, config, dry_run=args.dry_run)
    elif args.brand:
        run_brand(args.brand, config, dry_run=args.dry_run)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
```

**Step 2:** Commit.
```bash
git add Tools/push_capi_conversions.py
git commit -m "feat: add CAPI conversion sync script (skeleton)"
```

---

### Task 3: Implement Zoho CRM Query + Update Logic

**Files:**
- Modify: `Tools/push_capi_conversions.py`

The script needs to actually query Zoho CRM and update deals. Since the Zoho CRM instances are accessed via MCP servers (not direct API calls from Python), we have two options:

**Option A (Recommended): Direct Zoho API calls from Python**
Use the same OAuth credentials from `.mcp.json` to make direct REST calls to `https://www.zohoapis.eu/crm/v7/`. This is more reliable for a scheduled script than depending on MCP.

**Step 1:** Add a `ZohoCRMClient` class to the script:

```python
class ZohoCRMClient:
    """Lightweight Zoho CRM API client using OAuth refresh tokens."""

    BASE_URL = "https://www.zohoapis.eu/crm/v7"
    TOKEN_URL = "https://accounts.zoho.eu/oauth/v2/token"

    def __init__(self, client_id: str, client_secret: str, refresh_token: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.refresh_token = refresh_token
        self._access_token = None

    def _get_access_token(self) -> str:
        if self._access_token:
            return self._access_token
        resp = requests.post(self.TOKEN_URL, params={
            "grant_type": "refresh_token",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "refresh_token": self.refresh_token,
        })
        resp.raise_for_status()
        self._access_token = resp.json()["access_token"]
        return self._access_token

    def coql_query(self, query: str) -> list[dict]:
        token = self._get_access_token()
        resp = requests.post(
            f"{self.BASE_URL}/coql",
            headers={"Authorization": f"Zoho-oauthtoken {token}"},
            json={"select_query": query},
            timeout=30,
        )
        if resp.status_code == 204:
            return []
        resp.raise_for_status()
        return resp.json().get("data", [])

    def update_records(self, module: str, records: list[dict]) -> dict:
        token = self._get_access_token()
        resp = requests.put(
            f"{self.BASE_URL}/{module}",
            headers={"Authorization": f"Zoho-oauthtoken {token}"},
            json={"data": records},
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()
```

**Step 2:** Add Zoho OAuth credentials to `.env` (extracted from `.mcp.json` — same credentials, just in env var format):
```
ZOHO_SPA_CLIENT_ID=1000.5SF8C4FZ7LS7WYB12Q9GU7KNEPX91S
ZOHO_SPA_CLIENT_SECRET=<from .mcp.json>
ZOHO_SPA_REFRESH_TOKEN=<from .mcp.json>
ZOHO_AES_CLIENT_ID=1000.MU7KOHIF9PLM1DDJXZD7VEZQ4GLS3M
ZOHO_AES_CLIENT_SECRET=<from .mcp.json>
ZOHO_AES_REFRESH_TOKEN=<from .mcp.json>
ZOHO_SLIM_CLIENT_ID=1000.VUWMWRIW1IJM5ZZA6WTAUTBXQIDRLG
ZOHO_SLIM_CLIENT_SECRET=<from .mcp.json>
ZOHO_SLIM_REFRESH_TOKEN=<from .mcp.json>
```

**Step 3:** Wire up the `run_brand()` function to use `ZohoCRMClient`:
- Initialize client from env vars
- COQL query: `SELECT id, Deal_Name, Email, Phone, First_Name, Last_Name, Meta_Lead_ID, Closing_Date, Amount, Stage, Modified_Time FROM Deals WHERE Stage = '{trigger_stage}' AND CAPI_Sent = false LIMIT 200`
- After successful CAPI send, update each deal: `{"id": deal_id, "CAPI_Sent": true, "CAPI_Sent_At": datetime.now().isoformat(), "CAPI_Event": event_name}`

**Step 4:** Commit.
```bash
git add Tools/push_capi_conversions.py .env
git commit -m "feat: add Zoho CRM query + update logic to CAPI sync"
```

---

### Task 4: Create Workflow Documentation

**Files:**
- Create: `09-Miscellaneous/Workflows/push_capi_conversions.md`

**Step 1:** Write the workflow SOP following the standard format:
- **Objective:** Sync Zoho CRM deal conversions to Meta CAPI
- **Trigger:** Scheduled (every 4h) or manual
- **Inputs:** Brand config, Zoho OAuth creds, Meta access token
- **Process:** Query → Build events → Send CAPI → Mark sent
- **Outputs:** CAPI events in Meta Events Manager, deals marked in Zoho
- **Error handling:** Token refresh, rate limits, partial failures
- **Manual steps:** Token renewal every 60 days

**Step 2:** Commit.

---

## Phase 3: Scheduling

### Task 5: Create launchd Plist for Automated Sync

**Files:**
- Create: `~/Library/LaunchAgents/com.carisma.capi-sync.plist`

**Step 1:** Create the plist:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.carisma.capi-sync</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>/Users/mertgulen/Library/CloudStorage/GoogleDrive-mertgulen98@gmail.com/My Drive/Carisma Wellness Group/Carisma AI /Carisma AI/Tools/push_capi_conversions.py</string>
        <string>--all-brands</string>
    </array>
    <key>StartInterval</key>
    <integer>14400</integer>
    <key>StandardOutPath</key>
    <string>/tmp/capi-sync.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/capi-sync-error.log</string>
    <key>RunAtLoad</key>
    <false/>
</dict>
</plist>
```

**Step 2:** Load it:
```bash
launchctl load ~/Library/LaunchAgents/com.carisma.capi-sync.plist
```

**Step 3:** Commit the plist reference in the workflow doc.

---

## Phase 4: Meta Ads Manager Custom Columns

### Task 6: Configure Custom Columns in Ads Manager (Manual)

**After events are flowing (48-72h after first real events):**

1. Go to Meta Ads Manager for each ad account
2. Click **Columns > Customize Columns**
3. Search for `AppointmentMade` — add it as a column
4. Search for `ConsultationBooked` — add it as a column
5. Rename columns to "Appointments Made" and "Consultations Booked" for clarity
6. **Save as a custom column preset** (e.g., "Carisma Full Funnel")
7. Optionally add calculated columns: Cost per Appointment = Spend / Appointments Made

---

## Verification

### Test 1: Dry Run (No Side Effects)
```bash
cd Tools
python3 push_capi_conversions.py --brand carisma_aesthetics --dry-run
```
**Expected:** Script connects to Zoho, queries deals, prints CAPI payloads to console without sending.

### Test 2: Single Live Event
1. In Zoho CRM (Aesthetics), create a test deal with stage "Booking closed won", known email/phone, `CAPI_Sent` = false
2. Run: `python3 push_capi_conversions.py --brand carisma_aesthetics`
3. Check Meta Events Manager > Overview > `AppointmentMade` event should appear
4. Check Event Match Quality score — target > 6.0
5. Verify deal in Zoho now has `CAPI_Sent` = true

### Test 3: Deduplication
1. Run the script again for the same brand
2. The test deal from Test 2 should be skipped (already marked `CAPI_Sent` = true)
3. No duplicate events in Meta Events Manager

### Test 4: All Brands
```bash
python3 push_capi_conversions.py --all-brands
```
**Expected:** All 3 brands processed, events sent for each, log shows per-brand results.

### Test 5: Attribution in Ads Manager (72h after first events)
1. Open Ads Manager with the custom column preset
2. Verify "Appointments Made" column shows numbers
3. Cross-reference: sum of events sent (from logs) vs. Events Manager count vs. Ads Manager column total
4. Check that attribution drills down correctly: campaign > ad set > ad

---

## Critical Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `Config/brands.json` | Modify | Add pixel_id + capi_events config per brand |
| `.env` | Modify | Add META_APP_ID, META_APP_SECRET, Zoho OAuth creds |
| `Tools/push_capi_conversions.py` | Create | Core CAPI sync script |
| `09-Miscellaneous/Workflows/push_capi_conversions.md` | Create | Workflow SOP |
| `~/Library/LaunchAgents/com.carisma.capi-sync.plist` | Create | Scheduled automation |

## Dependencies & Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Meta token expires every 60 days | Script stops working silently | Add token expiry check to script; log warning when <7 days remain |
| Meta Lead ID not captured by Zoho Facebook integration | Low match rate (PII-only matching ~50-70%) | Task 0D investigates this first; if missing, configure the field mapping |
| Zoho COQL doesn't support custom field `CAPI_Sent` | Query fails | Fall back to `zoho_search` with criteria filter |
| Duplicate events if script crashes between CAPI send and Zoho update | Over-counting in Ads Manager | Deterministic `event_id` based on deal ID ensures Meta deduplicates |
| Slimming uses USD while Spa/Aesthetics use EUR | Wrong currency in CAPI | Already handled — brand config specifies currency |
