#!/usr/bin/env python3
"""
Push CAPI Conversions Tool
==========================

Push Zoho CRM deal conversions to Meta Conversions API (CAPI).

Purpose:
    Queries each brand's Zoho CRM for deals that reached target stages
    (Consultation-won, Booking closed won, Closed Won) and sends conversion
    events to Meta CAPI for closed-loop attribution in Ads Manager.

    Two events are tracked:
    - ConsultationBooked: when a deal reaches consultation-won stage
    - AppointmentMade: when a deal reaches booking-closed-won stage

Inputs:
    --brand         Specific brand_id to process (e.g. carisma_aesthetics)
    --all-brands    Process all active brands
    --dry-run       Preview payloads without sending to Meta

Outputs:
    - CAPI events sent to Meta Events Manager
    - Zoho CRM deals marked with CAPI_Sent=true
    - Log output to stdout

Prerequisites:
    - META_ACCESS_TOKEN in .env (renewed every 60 days)
    - Pixel IDs configured in Config/brands.json
    - Zoho OAuth credentials in .env (per brand)
    - Custom fields in Zoho CRM: CAPI_Sent, CAPI_Sent_At, CAPI_Event
"""

import argparse
import hashlib
import json
import logging
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

import requests
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
CONFIG_DIR = BASE_DIR / "Config"
LOG_DIR = BASE_DIR / ".tmp" / "capi"

CAPI_VERSION = "v21.0"
CAPI_BASE_URL = f"https://graph.facebook.com/{CAPI_VERSION}"

ZOHO_API_BASE = "https://www.zohoapis.eu/crm/v7"
ZOHO_TOKEN_URL = "https://accounts.zoho.eu/oauth/v2/token"

# Maps brand_id to env var prefixes for Zoho OAuth credentials
ZOHO_ENV_PREFIXES = {
    "carisma_spa": "ZOHO_SPA",
    "carisma_aesthetics": "ZOHO_AES",
    "carisma_slimming": "ZOHO_SLIM",
}

CAPI_BATCH_SIZE = 100  # Meta CAPI max events per request
CAPI_MAX_AGE_DAYS = 7  # Meta rejects events older than 7 days

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
log = logging.getLogger("capi_sync")


# ---------------------------------------------------------------------------
# Zoho CRM Client
# ---------------------------------------------------------------------------

class ZohoCRMClient:
    """Lightweight Zoho CRM API client using OAuth refresh tokens."""

    def __init__(self, client_id: str, client_secret: str, refresh_token: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.refresh_token = refresh_token
        self._access_token: Optional[str] = None

    def _get_access_token(self) -> str:
        """Get or refresh the OAuth access token."""
        if self._access_token:
            return self._access_token

        resp = requests.post(
            ZOHO_TOKEN_URL,
            params={
                "grant_type": "refresh_token",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "refresh_token": self.refresh_token,
            },
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()

        if "access_token" not in data:
            raise RuntimeError(f"Zoho token refresh failed: {data}")

        self._access_token = data["access_token"]
        return self._access_token

    def _headers(self) -> dict[str, str]:
        return {"Authorization": f"Zoho-oauthtoken {self._get_access_token()}"}

    def coql_query(self, query: str) -> list[dict[str, Any]]:
        """Execute a COQL query and return the data rows."""
        resp = requests.post(
            f"{ZOHO_API_BASE}/coql",
            headers=self._headers(),
            json={"select_query": query},
            timeout=30,
        )
        if resp.status_code == 204:
            return []
        resp.raise_for_status()
        return resp.json().get("data", [])

    def search_records(
        self, module: str, criteria: str, fields: Optional[list[str]] = None
    ) -> list[dict[str, Any]]:
        """Search records using criteria string (fallback if COQL fails)."""
        params: dict[str, str] = {"criteria": criteria}
        if fields:
            params["fields"] = ",".join(fields)

        resp = requests.get(
            f"{ZOHO_API_BASE}/{module}/search",
            headers=self._headers(),
            params=params,
            timeout=30,
        )
        if resp.status_code == 204:
            return []
        resp.raise_for_status()
        return resp.json().get("data", [])

    def update_records(self, module: str, records: list[dict[str, Any]]) -> dict:
        """Update records in a module."""
        resp = requests.put(
            f"{ZOHO_API_BASE}/{module}",
            headers=self._headers(),
            json={"data": records},
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()


# ---------------------------------------------------------------------------
# Config loading
# ---------------------------------------------------------------------------

def load_brands_config() -> dict[str, dict[str, Any]]:
    """Load and index brands config by brand_id."""
    config_path = CONFIG_DIR / "brands.json"
    with open(config_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {b["brand_id"]: b for b in data.get("brands", [])}


def load_deal_value_mapping() -> dict[str, Any]:
    """Load the campaign deal value mapping config (ENR parameters + COGS)."""
    config_path = CONFIG_DIR / "campaign_deal_value_mapping.json"
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# ENR (Expected Net Revenue) calculation
# ---------------------------------------------------------------------------

# Brand key used in deal value mapping (shorter than brand_id)
BRAND_KEY_MAP = {
    "carisma_spa": "spa",
    "carisma_aesthetics": "aesthetics",
    "carisma_slimming": "slimming",
}


def _get_enr_params(brand_id: str, dvm: dict[str, Any]) -> tuple[float, float]:
    """Return (vat_rate, show_rate) for a brand from deal value mapping config."""
    brand_key = BRAND_KEY_MAP.get(brand_id, "")
    params = dvm.get("_metadata", {}).get("enr_parameters", {}).get(brand_key, {})
    vat_rate = params.get("vat_rate", 0.18)
    show_rate = params.get("show_rate", 0.80)
    return vat_rate, show_rate


def _lookup_cogs(brand_id: str, deal: dict[str, Any], dvm: dict[str, Any]) -> float:
    """Look up COGS for a deal by matching it to a campaign in the mapping.

    Matches on the deal's Ad_Campaign and Lead_Form fields (populated by
    Zoho's Facebook integration) against campaign names and lead forms
    in the deal value mapping config.
    Returns 0 if no match found (safe default for spa and slimming).
    """
    brand_key = BRAND_KEY_MAP.get(brand_id, "")
    brand_cfg = dvm.get(brand_key, {})
    campaigns = brand_cfg.get("campaigns", {})

    if not campaigns:
        return 0.0

    # Zoho deals have Ad_Campaign and Lead_Form fields from Facebook integration
    ad_campaign = (deal.get("Ad_Campaign") or "").lower()
    deal_lead_form = (deal.get("Lead_Form") or "").lower()
    lead_source = (deal.get("Lead_Source") or "").lower()

    for camp_name, camp_data in campaigns.items():
        if camp_data.get("is_recruitment"):
            continue

        camp_lower = camp_name.lower()
        lead_form = (camp_data.get("lead_form") or "").lower()

        # Best match: Ad_Campaign field matches campaign name
        if ad_campaign and camp_lower and camp_lower in ad_campaign:
            return float(camp_data.get("cogs", 0))

        # Second: Lead_Form field matches configured lead form
        if deal_lead_form and lead_form and lead_form in deal_lead_form:
            return float(camp_data.get("cogs", 0))

        # Fallback: Lead_Source contains lead form name
        if lead_source and lead_form and lead_form in lead_source:
            return float(camp_data.get("cogs", 0))

    return 0.0


def calculate_enr(amount: float, vat_rate: float, show_rate: float, cogs: float) -> float:
    """Calculate Expected Net Revenue.

    ENR = (deal_value / (1 + VAT) - COGS) × show_rate
    """
    if amount <= 0:
        return 0.0
    net_of_vat = amount / (1 + vat_rate)
    return max(0.0, (net_of_vat - cogs) * show_rate)


def get_zoho_client(brand_id: str) -> ZohoCRMClient:
    """Create a Zoho CRM client for a brand using env vars."""
    prefix = ZOHO_ENV_PREFIXES.get(brand_id)
    if not prefix:
        raise ValueError(f"No Zoho env prefix configured for brand '{brand_id}'")

    client_id = os.getenv(f"{prefix}_CLIENT_ID")
    client_secret = os.getenv(f"{prefix}_CLIENT_SECRET")
    refresh_token = os.getenv(f"{prefix}_REFRESH_TOKEN")

    if not all([client_id, client_secret, refresh_token]):
        raise ValueError(
            f"Missing Zoho credentials for {brand_id}. "
            f"Set {prefix}_CLIENT_ID, {prefix}_CLIENT_SECRET, {prefix}_REFRESH_TOKEN in .env"
        )

    return ZohoCRMClient(client_id, client_secret, refresh_token)


# ---------------------------------------------------------------------------
# PII hashing (Meta CAPI spec)
# ---------------------------------------------------------------------------

def hash_pii(value: str) -> str:
    """SHA-256 hash a PII value per Meta CAPI spec (lowercase, stripped)."""
    if not value:
        return ""
    return hashlib.sha256(value.strip().lower().encode("utf-8")).hexdigest()


def build_event_id(brand_id: str, deal_id: str, event_name: str) -> str:
    """Deterministic event ID for deduplication across retries."""
    raw = f"{brand_id}:{deal_id}:{event_name}"
    return hashlib.sha256(raw.encode()).hexdigest()[:32]


# ---------------------------------------------------------------------------
# CAPI event building
# ---------------------------------------------------------------------------

def build_capi_event(
    deal: dict[str, Any],
    brand: dict[str, Any],
    event_name: str,
    vat_rate: float = 0.18,
    show_rate: float = 0.80,
    cogs: float = 0.0,
) -> dict[str, Any]:
    """Build a single Meta CAPI event payload from a Zoho deal record.

    The event value is sent as ENR (Expected Net Revenue) rather than the
    raw deal amount, so Meta's "Conversion Value" column shows the actual
    expected revenue after VAT, show rate, and COGS adjustments.
    """

    # Extract PII — Zoho field names may vary; try common patterns
    email = (
        deal.get("Email")
        or _nested_get(deal, "Contact_Name", "email")
        or ""
    )
    phone = deal.get("Phone") or deal.get("Mobile") or ""
    first_name = deal.get("First_Name") or ""
    last_name = deal.get("Last_Name") or ""
    meta_lead_id = deal.get("Meta_Lead_ID") or ""
    deal_id = str(deal.get("id", ""))
    close_date = deal.get("Closing_Date") or deal.get("Modified_Time") or ""
    amount = deal.get("Amount") or 0

    # Calculate ENR from raw deal amount
    enr = calculate_enr(float(amount) if amount else 0.0, vat_rate, show_rate, cogs)

    # Parse close date to unix timestamp
    event_time = _parse_timestamp(close_date)

    # Build user_data with hashed PII
    user_data: dict[str, Any] = {
        "country": [hash_pii("mt")],
    }
    if email:
        user_data["em"] = [hash_pii(email)]
    if phone:
        user_data["ph"] = [hash_pii(phone)]
    if first_name:
        user_data["fn"] = [hash_pii(first_name)]
    if last_name:
        user_data["ln"] = [hash_pii(last_name)]

    # Lead ID provides highest match rate for Facebook Lead Ads
    if meta_lead_id:
        user_data["lead_id"] = str(meta_lead_id)

    event = {
        "event_name": event_name,
        "event_time": event_time,
        "event_id": build_event_id(brand["brand_id"], deal_id, event_name),
        "action_source": "system_generated",
        "user_data": user_data,
        "custom_data": {
            "currency": brand.get("currency", "EUR"),
            "value": round(enr, 2),
        },
    }

    return event


def _nested_get(d: dict, *keys: str) -> Any:
    """Safely traverse nested dicts."""
    for k in keys:
        if not isinstance(d, dict):
            return None
        d = d.get(k)
        if d is None:
            return None
    return d


def _parse_timestamp(date_str: Any) -> int:
    """Parse a Zoho date/datetime string to unix timestamp."""
    if not date_str:
        return int(time.time())
    try:
        s = str(date_str)
        if "T" in s:
            dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
        else:
            dt = datetime.strptime(s, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        return int(dt.timestamp())
    except (ValueError, TypeError):
        return int(time.time())


# ---------------------------------------------------------------------------
# Meta CAPI sending
# ---------------------------------------------------------------------------

def send_events(
    pixel_id: str,
    access_token: str,
    events: list[dict[str, Any]],
    dry_run: bool = False,
) -> dict[str, Any]:
    """Send a batch of events to Meta Conversions API."""
    url = f"{CAPI_BASE_URL}/{pixel_id}/events"
    payload: dict[str, Any] = {
        "data": events,
        "access_token": access_token,
    }

    if dry_run:
        log.info("[DRY RUN] Would send %d events to pixel %s", len(events), pixel_id)
        for i, evt in enumerate(events[:3]):
            log.info(
                "[DRY RUN] Event %d: %s for deal event_id=%s",
                i + 1, evt["event_name"], evt["event_id"],
            )
        if len(events) > 3:
            log.info("[DRY RUN] ... and %d more events", len(events) - 3)
        return {"events_received": len(events), "dry_run": True}

    resp = requests.post(url, json=payload, timeout=30)
    if not resp.ok:
        log.error("CAPI error %d: %s", resp.status_code, resp.text)
    resp.raise_for_status()
    result = resp.json()
    log.info("CAPI response for pixel %s: %s", pixel_id, result)
    return result


# ---------------------------------------------------------------------------
# Zoho CRM querying
# ---------------------------------------------------------------------------

DEAL_FIELDS_WITH_CAPI = [
    "id", "Deal_Name", "Email", "Phone", "Mobile",
    "First_Name", "Last_Name", "Meta_Lead_ID",
    "Lead_Source", "Ad_Campaign", "Lead_Form",
    "Closing_Date", "Amount", "Stage", "Modified_Time",
    "CAPI_Sent", "CAPI_Event",
]

DEAL_FIELDS_BASIC = [
    "id", "Deal_Name", "Email", "Phone", "Mobile",
    "First_Name", "Last_Name",
    "Lead_Source", "Ad_Campaign", "Lead_Form",
    "Closing_Date", "Amount", "Stage", "Modified_Time",
]

# Local sent-log for deduplication when Zoho custom fields aren't set up yet
SENT_LOG_PATH = LOG_DIR / "capi_sent_deals.json"


def _load_sent_log() -> set[str]:
    """Load the set of deal IDs already sent to CAPI (local fallback)."""
    if SENT_LOG_PATH.exists():
        with open(SENT_LOG_PATH) as f:
            return set(json.load(f))
    return set()


def _save_sent_log(sent_ids: set[str]) -> None:
    """Persist the sent deal IDs to local file."""
    SENT_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(SENT_LOG_PATH, "w") as f:
        json.dump(sorted(sent_ids), f)


def _cutoff_date() -> str:
    """Return the date string for CAPI_MAX_AGE_DAYS ago (YYYY-MM-DD)."""
    from datetime import timedelta
    return (datetime.now(timezone.utc) - timedelta(days=CAPI_MAX_AGE_DAYS)).strftime("%Y-%m-%d")


def query_unsent_deals(
    zoho: ZohoCRMClient, trigger_stage: str, brand_id: str, event_name: str,
) -> list[dict[str, Any]]:
    """Query Zoho CRM for deals at a target stage that haven't been sent to CAPI.

    Only returns deals modified within the last 7 days (Meta rejects older events).
    Tries COQL with CAPI_Sent field first. If that field doesn't exist yet,
    falls back to querying all deals at the stage and filtering locally
    using a sent-log file for deduplication.
    """
    cutoff = _cutoff_date()

    # Try with CAPI_Sent field (ideal path — requires custom fields in Zoho)
    fields_str = ", ".join(DEAL_FIELDS_WITH_CAPI)
    query = (
        f"SELECT {fields_str} FROM Deals "
        f"WHERE Stage = '{trigger_stage}' "
        f"AND CAPI_Sent = false "
        f"AND Modified_Time >= '{cutoff}' "
        f"LIMIT 200"
    )
    try:
        deals = zoho.coql_query(query)
        log.info("COQL returned %d deals at stage '%s' (since %s)", len(deals), trigger_stage, cutoff)
        return deals
    except requests.HTTPError:
        log.info("CAPI_Sent field not available, using local sent-log for dedup")

    # Fallback: query without CAPI_Sent, filter by date, dedup locally
    fields_str = ", ".join(DEAL_FIELDS_BASIC)
    query = (
        f"SELECT {fields_str} FROM Deals "
        f"WHERE Stage = '{trigger_stage}' "
        f"AND Modified_Time >= '{cutoff}' "
        f"LIMIT 200"
    )
    try:
        deals = zoho.coql_query(query)
    except requests.HTTPError as e:
        log.warning("COQL failed (%s), trying search", e)
        criteria = (
            f"((Stage:equals:{trigger_stage})"
            f"and(Modified_Time:greater_equal:{cutoff}T00:00:00+00:00))"
        )
        deals = zoho.search_records("Deals", criteria, DEAL_FIELDS_BASIC)

    # Filter out already-sent deals using local log
    sent_ids = _load_sent_log()
    unsent = []
    for d in deals:
        key = f"{brand_id}:{d.get('id')}:{event_name}"
        if key not in sent_ids:
            unsent.append(d)

    log.info(
        "Found %d deals at stage '%s' (since %s), %d already sent, %d new",
        len(deals), trigger_stage, cutoff, len(deals) - len(unsent), len(unsent),
    )
    return unsent


def mark_deals_sent(
    zoho: ZohoCRMClient,
    deal_ids: list[str],
    event_name: str,
    brand_id: str,
) -> None:
    """Mark deals as sent in Zoho CRM and local sent-log.

    Tries to update Zoho custom fields first. If those fields don't exist,
    falls back to local sent-log only (still prevents duplicates).
    """
    # Always update local sent-log (works regardless of Zoho custom fields)
    sent_ids = _load_sent_log()
    for did in deal_ids:
        sent_ids.add(f"{brand_id}:{did}:{event_name}")
    _save_sent_log(sent_ids)
    log.info("Updated local sent-log with %d deal IDs", len(deal_ids))

    # Try to update Zoho custom fields (may fail if fields don't exist yet)
    now_iso = datetime.now(timezone.utc).isoformat()
    records = [
        {
            "id": did,
            "CAPI_Sent": True,
            "CAPI_Sent_At": now_iso,
            "CAPI_Event": event_name,
        }
        for did in deal_ids
    ]

    try:
        for i in range(0, len(records), 100):
            batch = records[i : i + 100]
            result = zoho.update_records("Deals", batch)
            log.info("Marked %d deals as CAPI_Sent=true in Zoho: %s", len(batch), result)
    except requests.HTTPError as e:
        log.warning(
            "Could not update CAPI_Sent in Zoho (custom fields may not exist yet): %s. "
            "Local sent-log is still tracking these deals.",
            e,
        )


# ---------------------------------------------------------------------------
# Brand processing
# ---------------------------------------------------------------------------

def run_brand(
    brand_id: str, config: dict, dry_run: bool = False, dvm: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """Process one brand: query Zoho -> build CAPI events -> send -> mark sent."""
    brand = config.get(brand_id)
    if not brand:
        log.error("Brand %s not found in config", brand_id)
        return {"brand": brand_id, "error": "not_found"}

    pixel_id = brand.get("pixel_id")
    if not pixel_id or pixel_id == "TO_BE_FILLED":
        log.warning("Skipping %s: pixel_id not configured", brand_id)
        return {"brand": brand_id, "error": "no_pixel_id"}

    access_token = os.getenv("META_ACCESS_TOKEN")
    if not access_token:
        log.error("META_ACCESS_TOKEN not set in .env")
        return {"brand": brand_id, "error": "no_meta_token"}

    capi_events_config = brand.get("capi_events", {})
    if not capi_events_config:
        log.warning("Skipping %s: no capi_events configured", brand_id)
        return {"brand": brand_id, "error": "no_capi_config"}

    # Initialize Zoho client
    try:
        zoho = get_zoho_client(brand_id)
    except ValueError as e:
        log.error("Zoho client init failed for %s: %s", brand_id, e)
        return {"brand": brand_id, "error": str(e)}

    # Load ENR parameters
    if dvm is None:
        dvm = load_deal_value_mapping()
    vat_rate, show_rate = _get_enr_params(brand_id, dvm)
    log.info(
        "ENR params for %s: VAT=%.0f%%, Show Rate=%.0f%%",
        brand_id, vat_rate * 100, show_rate * 100,
    )

    log.info("--- Processing %s ---", brand.get("brand_name", brand_id))
    results: dict[str, Any] = {"brand": brand_id, "events": {}}

    for event_key, event_cfg in capi_events_config.items():
        event_name = event_cfg["event_name"]
        trigger_stage = event_cfg["trigger_stage"]

        log.info(
            "Querying deals at stage '%s' for event '%s'",
            trigger_stage, event_name,
        )

        # Query Zoho for unsent deals
        try:
            deals = query_unsent_deals(zoho, trigger_stage, brand_id, event_name)
        except Exception as e:
            log.error("Zoho query failed for %s/%s: %s", brand_id, event_name, e)
            results["events"][event_key] = {"error": str(e)}
            continue

        if not deals:
            log.info("No unsent deals at stage '%s'", trigger_stage)
            results["events"][event_key] = {"sent": 0}
            continue

        # Build CAPI events with ENR values, filtering out timestamps older than 7 days
        cutoff_ts = int(time.time()) - (CAPI_MAX_AGE_DAYS * 86400)
        all_events = []
        for d in deals:
            cogs = _lookup_cogs(brand_id, d, dvm)
            evt = build_capi_event(d, brand, event_name, vat_rate, show_rate, cogs)
            all_events.append(evt)
        events = [e for e in all_events if e["event_time"] >= cutoff_ts]
        if len(events) < len(all_events):
            log.info(
                "Filtered out %d events older than %d days",
                len(all_events) - len(events), CAPI_MAX_AGE_DAYS,
            )
        log.info("Built %d CAPI events for '%s'", len(events), event_name)

        # Send in batches
        total_received = 0
        for i in range(0, len(events), CAPI_BATCH_SIZE):
            batch = events[i : i + CAPI_BATCH_SIZE]
            try:
                result = send_events(pixel_id, access_token, batch, dry_run=dry_run)
                total_received += result.get("events_received", 0)
            except requests.HTTPError as e:
                log.error("CAPI send failed for batch %d: %s", i, e)
                results["events"][event_key] = {"error": str(e), "partial_sent": total_received}
                break

        # Mark deals as sent in Zoho (only if not dry-run and events were received)
        if not dry_run and total_received > 0:
            deal_ids = [str(d["id"]) for d in deals[:total_received]]
            try:
                mark_deals_sent(zoho, deal_ids, event_name, brand_id)
            except Exception as e:
                log.error(
                    "Failed to mark deals as sent in Zoho (events WERE sent to Meta): %s", e
                )
                results["events"][event_key] = {
                    "sent": total_received,
                    "zoho_update_error": str(e),
                }
                continue

        results["events"][event_key] = {"sent": total_received}
        log.info(
            "Completed '%s': %d events %s",
            event_name, total_received,
            "previewed (dry-run)" if dry_run else "sent",
        )

    return results


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------

def run_all(dry_run: bool = False) -> list[dict[str, Any]]:
    """Process all configured brands."""
    config = load_brands_config()
    dvm = load_deal_value_mapping()
    results = []
    for brand_id in ZOHO_ENV_PREFIXES:
        result = run_brand(brand_id, config, dry_run=dry_run, dvm=dvm)
        results.append(result)
    return results


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Push Zoho CRM deal conversions to Meta Conversions API.",
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "--brand",
        type=str,
        help="Specific brand_id to process (e.g. carisma_aesthetics)",
    )
    group.add_argument(
        "--all-brands",
        action="store_true",
        help="Process all active brands",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview CAPI payloads without sending to Meta",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> None:
    load_dotenv(BASE_DIR / ".env")

    args = parse_args(argv)

    log.info("=== CAPI Conversion Sync Started ===")
    log.info("Mode: %s", "DRY RUN" if args.dry_run else "LIVE")

    if args.all_brands:
        results = run_all(dry_run=args.dry_run)
    else:
        config = load_brands_config()
        dvm = load_deal_value_mapping()
        results = [run_brand(args.brand, config, dry_run=args.dry_run, dvm=dvm)]

    # Summary
    log.info("=== Summary ===")
    for r in results:
        brand = r.get("brand", "unknown")
        if "error" in r:
            log.warning("  %s: SKIPPED (%s)", brand, r["error"])
        else:
            for evt_key, evt_data in r.get("events", {}).items():
                sent = evt_data.get("sent", 0)
                err = evt_data.get("error", "")
                if err:
                    log.warning("  %s/%s: ERROR (%s)", brand, evt_key, err)
                else:
                    log.info("  %s/%s: %d events", brand, evt_key, sent)

    log.info("=== CAPI Conversion Sync Finished ===")


if __name__ == "__main__":
    main()
