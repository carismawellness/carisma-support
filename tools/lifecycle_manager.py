"""
Customer Lifecycle Manager for Zoho CRM.

Manages lifecycle stages, treatment counts, rebooking windows, and lapsed detection
across all three Carisma brands (Spa, Aesthetics, Slimming).

What it does on each run:
  1. Queries all Closed Won deals per brand
  2. Groups by Contact and counts treatments
  3. Updates each Contact's:
     - Last_Treatment_Date (most recent deal close date)
     - Treatment_Count (total closed won deals)
     - Rebooking_Window_Expires (last treatment + brand-specific window)
     - Lifecycle_Stage (auto-promoted based on count, or Lapsed if window expired)
  4. Pushes Klaviyo events for stage transitions and pre-lapse warnings:
     - "Lifecycle Stage Changed" — triggers win-back, loyalty recognition flows
     - "Rebooking Window Warning" — triggers pre-lapse reminder (7 days before expiry)

Usage:
    python Tools/lifecycle_manager.py --brand spa          # Process one brand
    python Tools/lifecycle_manager.py --brand all          # Process all brands
    python Tools/lifecycle_manager.py --brand spa --dry-run # Preview without changes
    python Tools/lifecycle_manager.py --brand all --no-klaviyo  # Skip Klaviyo events

Lifecycle stage rules:
    Prospect        -> 0 closed won deals
    First-Time Client -> 1 deal
    Repeat Client   -> 2-4 deals
    Loyal Client    -> 5+ deals
    VIP             -> manually set (not auto-promoted)
    Lapsed          -> rebooking window expired, no new deal
    Win-Back        -> was Lapsed, now has a new deal (auto-detected)
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

import httpx

ROOT = Path(__file__).resolve().parent.parent

# Brand-specific rebooking windows (days)
REBOOKING_WINDOWS = {
    "spa": 90,
    "aesthetics": 120,
    "slimming": 60,
}

# Closed Won stage names per brand
CLOSED_WON_STAGES = {
    "spa": ["Closed Won"],
    "aesthetics": ["Booking closed won", "Members Closed Won", "Consultation - won"],
    "slimming": ["Booking closed won", "Members Closed Won", "Consultation - won"],
}

# Pre-lapse warning: fire event this many days before rebooking window expires
PRE_LAPSE_WARNING_DAYS = 7

BRAND_CREDS = {}
KLAVIYO_API_KEY = ""


def load_mcp_creds():
    """Load Zoho + Klaviyo credentials from .mcp.json."""
    global KLAVIYO_API_KEY
    mcp_path = ROOT / ".mcp.json"
    if not mcp_path.exists():
        print(f"ERROR: .mcp.json not found at {mcp_path}")
        sys.exit(1)

    with open(mcp_path) as f:
        mcp = json.load(f)

    brand_to_server = {
        "spa": "zoho-crm-spa",
        "aesthetics": "zoho-crm-aesthetics",
        "slimming": "zoho-crm-slimming",
    }

    for brand, server_name in brand_to_server.items():
        server = mcp.get("mcpServers", {}).get(server_name, {})
        env = server.get("env", {})
        BRAND_CREDS[brand] = {
            "client_id": env.get("ZOHO_CLIENT_ID", ""),
            "client_secret": env.get("ZOHO_CLIENT_SECRET", ""),
            "refresh_token": env.get("ZOHO_REFRESH_TOKEN", ""),
            "api_domain": env.get("ZOHO_API_DOMAIN", "https://www.zohoapis.eu"),
        }

    # Load Klaviyo API key
    klaviyo_server = mcp.get("mcpServers", {}).get("klaviyo", {})
    klaviyo_env = klaviyo_server.get("env", {})
    KLAVIYO_API_KEY = klaviyo_env.get("PRIVATE_API_KEY", "")


class ZohoClient:
    """Lightweight Zoho CRM client for lifecycle management."""

    def __init__(self, brand: str):
        creds = BRAND_CREDS[brand]
        self.brand = brand
        self._client_id = creds["client_id"]
        self._client_secret = creds["client_secret"]
        self._refresh_token = creds["refresh_token"]
        self._api_domain = creds.get("api_domain", "https://www.zohoapis.eu")

        domain_suffix = self._api_domain.replace("https://www.zohoapis.", "")
        self._accounts_url = f"https://accounts.zoho.{domain_suffix}/oauth/v2/token"
        self._base_url = f"{self._api_domain}/crm/v7"

        self._access_token = None
        self._token_expiry = 0
        self._http = httpx.Client(timeout=30)

    def _refresh_access_token(self):
        resp = self._http.post(
            self._accounts_url,
            data={
                "grant_type": "refresh_token",
                "client_id": self._client_id,
                "client_secret": self._client_secret,
                "refresh_token": self._refresh_token,
            },
        )
        data = resp.json()
        if "access_token" not in data:
            raise RuntimeError(f"[{self.brand}] Token refresh failed: {data}")
        self._access_token = data["access_token"]
        self._token_expiry = time.time() + data.get("expires_in", 3600) - 300

    def _ensure_token(self):
        if not self._access_token or time.time() >= self._token_expiry:
            self._refresh_access_token()

    def _headers(self):
        return {"Authorization": f"Zoho-oauthtoken {self._access_token}"}

    def coql_query(self, query: str) -> list[dict]:
        """Execute a COQL query and return all records (handles pagination)."""
        self._ensure_token()
        all_records = []
        offset = 0
        limit = 200

        while True:
            paginated_query = f"{query} LIMIT {offset}, {limit}"
            resp = self._http.post(
                f"{self._base_url}/coql",
                headers=self._headers(),
                json={"select_query": paginated_query},
            )
            if resp.status_code == 401:
                self._refresh_access_token()
                resp = self._http.post(
                    f"{self._base_url}/coql",
                    headers=self._headers(),
                    json={"select_query": paginated_query},
                )
            data = resp.json()
            records = data.get("data", [])
            all_records.extend(records)

            if not data.get("info", {}).get("more_records", False):
                break
            offset += limit

        return all_records

    def update_records(self, module: str, records: list[dict]) -> list[dict]:
        """Bulk update records in a module. Handles batches of 100."""
        self._ensure_token()
        all_results = []

        for i in range(0, len(records), 100):
            batch = records[i : i + 100]
            resp = self._http.put(
                f"{self._base_url}/{module}",
                headers=self._headers(),
                json={"data": batch},
            )
            if resp.status_code == 401:
                self._refresh_access_token()
                resp = self._http.put(
                    f"{self._base_url}/{module}",
                    headers=self._headers(),
                    json={"data": batch},
                )
            result = resp.json()
            all_results.extend(result.get("data", []))
            if i + 100 < len(records):
                time.sleep(0.5)  # rate limit courtesy

        return all_results

    def get_record(self, module: str, record_id: str) -> dict | None:
        """Get a single record by ID."""
        self._ensure_token()
        resp = self._http.get(
            f"{self._base_url}/{module}/{record_id}",
            headers=self._headers(),
        )
        if resp.status_code == 401:
            self._refresh_access_token()
            resp = self._http.get(
                f"{self._base_url}/{module}/{record_id}",
                headers=self._headers(),
            )
        data = resp.json()
        records = data.get("data", [])
        return records[0] if records else None


class KlaviyoClient:
    """Push lifecycle events to Klaviyo for email automation triggers."""

    BASE_URL = "https://a.klaviyo.com/api"

    def __init__(self, api_key: str):
        self._api_key = api_key
        self._http = httpx.Client(timeout=30)

    def _headers(self):
        return {
            "Authorization": f"Klaviyo-API-Key {self._api_key}",
            "Content-Type": "application/json",
            "revision": "2024-10-15",
        }

    def push_event(
        self,
        email: str,
        metric_name: str,
        properties: dict,
        first_name: str | None = None,
        last_name: str | None = None,
    ) -> bool:
        """Push a single event to Klaviyo. Returns True on success."""
        profile_attrs = {"email": email}
        if first_name:
            profile_attrs["first_name"] = first_name
        if last_name:
            profile_attrs["last_name"] = last_name

        payload = {
            "data": {
                "type": "event",
                "attributes": {
                    "metric": {
                        "data": {
                            "type": "metric",
                            "attributes": {"name": metric_name},
                        }
                    },
                    "profile": {
                        "data": {
                            "type": "profile",
                            "attributes": profile_attrs,
                        }
                    },
                    "properties": properties,
                },
            }
        }

        try:
            resp = self._http.post(
                f"{self.BASE_URL}/events",
                headers=self._headers(),
                json=payload,
            )
            if resp.status_code in (200, 201, 202):
                return True
            print(f"    Klaviyo event failed ({resp.status_code}): {resp.text[:200]}")
            return False
        except Exception as e:
            print(f"    Klaviyo event error: {e}")
            return False

    def push_lifecycle_change(
        self,
        email: str,
        brand: str,
        old_stage: str | None,
        new_stage: str,
        treatment_count: int,
        last_treatment_date: str,
        first_name: str | None = None,
        last_name: str | None = None,
    ) -> bool:
        """Push a Lifecycle Stage Changed event."""
        return self.push_event(
            email=email,
            metric_name="Lifecycle Stage Changed",
            properties={
                "brand": brand,
                "old_stage": old_stage or "None",
                "new_stage": new_stage,
                "treatment_count": treatment_count,
                "last_treatment_date": last_treatment_date,
            },
            first_name=first_name,
            last_name=last_name,
        )

    def push_rebooking_warning(
        self,
        email: str,
        brand: str,
        days_remaining: int,
        treatment_count: int,
        last_treatment_date: str,
        rebooking_expires: str,
        first_name: str | None = None,
        last_name: str | None = None,
    ) -> bool:
        """Push a Rebooking Window Warning event (pre-lapse reminder)."""
        return self.push_event(
            email=email,
            metric_name="Rebooking Window Warning",
            properties={
                "brand": brand,
                "days_remaining": days_remaining,
                "treatment_count": treatment_count,
                "last_treatment_date": last_treatment_date,
                "rebooking_expires": rebooking_expires,
            },
            first_name=first_name,
            last_name=last_name,
        )


def determine_lifecycle_stage(
    treatment_count: int,
    current_stage: str | None,
    rebooking_expired: bool,
) -> str:
    """Determine the correct lifecycle stage based on treatment count and rebooking status."""
    # VIP is manually assigned — never auto-demote
    if current_stage == "VIP":
        return "VIP"

    # If rebooking window expired and they had at least 1 treatment
    if rebooking_expired and treatment_count >= 1:
        return "Lapsed"

    # Win-Back: was Lapsed but now has a new deal within window
    if current_stage == "Lapsed" and not rebooking_expired and treatment_count >= 1:
        return "Win-Back"

    # Standard progression
    if treatment_count == 0:
        return "Prospect"
    elif treatment_count == 1:
        return "First-Time Client"
    elif treatment_count <= 4:
        return "Repeat Client"
    else:  # 5+
        return "Loyal Client"


def process_brand(brand: str, dry_run: bool = False, klaviyo: KlaviyoClient | None = None) -> dict:
    """Process lifecycle updates for a single brand.

    Returns summary stats.
    """
    print(f"\n{'='*60}")
    print(f"  Processing {brand.upper()}")
    print(f"{'='*60}")

    client = ZohoClient(brand)
    window_days = REBOOKING_WINDOWS[brand]
    won_stages = CLOSED_WON_STAGES[brand]
    today = datetime.now().date()

    # Build COQL query for all closed won deals with a contact
    stage_list = ", ".join([f"'{s}'" for s in won_stages])
    query = (
        f"select id, Contact_Name, Closing_Date, Created_Time, Stage "
        f"from Deals where Stage in ({stage_list}) and Contact_Name is not null"
    )

    print(f"  Querying deals with stages: {won_stages}")
    deals = client.coql_query(query)
    print(f"  Found {len(deals)} closed won deals with contacts")

    if not deals:
        print("  No deals to process.")
        return {"brand": brand, "deals": 0, "contacts_updated": 0, "skipped": 0}

    # Group deals by contact
    contact_deals: dict[str, list[dict]] = defaultdict(list)
    for deal in deals:
        contact = deal.get("Contact_Name")
        if contact and isinstance(contact, dict) and contact.get("id"):
            contact_id = contact["id"]
            contact_deals[contact_id].append(deal)

    print(f"  Grouped into {len(contact_deals)} unique contacts")

    # Get current lifecycle data for all contacts (include email/name for Klaviyo)
    contact_ids = list(contact_deals.keys())
    # Query contacts in batches (COQL IN clause has limits)
    contacts_data = {}
    for i in range(0, len(contact_ids), 50):
        batch_ids = contact_ids[i : i + 50]
        id_list = ", ".join(batch_ids)
        contact_query = (
            f"select id, Email, First_Name, Last_Name, "
            f"Lifecycle_Stage, Last_Treatment_Date, Treatment_Count, "
            f"Rebooking_Window_Expires "
            f"from Contacts where id in ({id_list})"
        )
        batch_contacts = client.coql_query(contact_query)
        for c in batch_contacts:
            contacts_data[c["id"]] = c

    # Calculate updates
    updates = []
    klaviyo_events = []  # (type, contact_data) tuples for Klaviyo
    stats = {"promoted": 0, "lapsed": 0, "winback": 0, "unchanged": 0,
             "klaviyo_stage_events": 0, "klaviyo_warning_events": 0}

    for contact_id, deals_list in contact_deals.items():
        # Find most recent closing date (fall back to Created_Time if Closing_Date is null)
        closing_dates = []
        for d in deals_list:
            cd = d.get("Closing_Date")
            if not cd:
                # Fall back to Created_Time (format: 2023-09-28T10:30:00+05:30)
                ct = d.get("Created_Time", "")
                cd = ct[:10] if ct else None
            if cd:
                try:
                    closing_dates.append(datetime.strptime(cd, "%Y-%m-%d").date())
                except (ValueError, TypeError):
                    pass

        if not closing_dates:
            continue

        treatment_count = len(deals_list)
        last_treatment = max(closing_dates)
        rebooking_expires = last_treatment + timedelta(days=window_days)
        rebooking_expired = today > rebooking_expires

        # Get current stage and contact info
        current = contacts_data.get(contact_id, {})
        current_stage = current.get("Lifecycle_Stage")
        current_count = current.get("Treatment_Count") or 0
        current_last = current.get("Last_Treatment_Date")
        contact_email = current.get("Email")
        contact_first = current.get("First_Name")
        contact_last = current.get("Last_Name")

        # Determine new stage
        new_stage = determine_lifecycle_stage(
            treatment_count, current_stage, rebooking_expired
        )

        # Check if anything changed
        new_last_str = last_treatment.isoformat()
        new_expires_str = rebooking_expires.isoformat()

        stage_changed = current_stage != new_stage

        if (
            not stage_changed
            and current_count == treatment_count
            and current_last == new_last_str
        ):
            # Nothing changed in CRM fields — but still check pre-lapse warning
            if (
                contact_email
                and not rebooking_expired
                and 0 < (rebooking_expires - today).days <= PRE_LAPSE_WARNING_DAYS
            ):
                klaviyo_events.append(("warning", {
                    "email": contact_email,
                    "first_name": contact_first,
                    "last_name": contact_last,
                    "days_remaining": (rebooking_expires - today).days,
                    "treatment_count": treatment_count,
                    "last_treatment_date": new_last_str,
                    "rebooking_expires": new_expires_str,
                }))
            stats["unchanged"] += 1
            continue

        # Track what changed
        if new_stage == "Lapsed" and current_stage != "Lapsed":
            stats["lapsed"] += 1
        elif new_stage == "Win-Back":
            stats["winback"] += 1
        elif stage_changed:
            stats["promoted"] += 1
        else:
            stats["unchanged"] += 1

        update = {
            "id": contact_id,
            "Last_Treatment_Date": new_last_str,
            "Treatment_Count": treatment_count,
            "Rebooking_Window_Expires": new_expires_str,
            "Lifecycle_Stage": new_stage,
        }
        updates.append(update)

        # Queue Klaviyo event for stage transitions (only if contact has email)
        if stage_changed and contact_email:
            klaviyo_events.append(("stage_change", {
                "email": contact_email,
                "first_name": contact_first,
                "last_name": contact_last,
                "old_stage": current_stage,
                "new_stage": new_stage,
                "treatment_count": treatment_count,
                "last_treatment_date": new_last_str,
            }))

        # Also check pre-lapse warning for contacts approaching expiry
        if (
            contact_email
            and not rebooking_expired
            and 0 < (rebooking_expires - today).days <= PRE_LAPSE_WARNING_DAYS
        ):
            klaviyo_events.append(("warning", {
                "email": contact_email,
                "first_name": contact_first,
                "last_name": contact_last,
                "days_remaining": (rebooking_expires - today).days,
                "treatment_count": treatment_count,
                "last_treatment_date": new_last_str,
                "rebooking_expires": new_expires_str,
            }))

        # Log notable transitions (not bulk lapsed)
        if new_stage in ("Win-Back", "Loyal Client", "VIP") or (
            new_stage != "Lapsed" and len(updates) <= 20
        ):
            print(
                f"  {contact_id}: {current_stage or 'None'} -> {new_stage} "
                f"(treatments: {current_count} -> {treatment_count}, "
                f"last: {current_last} -> {new_last_str})"
            )

    print(f"\n  Summary:")
    print(f"    Stage promotions:  {stats['promoted']}")
    print(f"    Marked lapsed:     {stats['lapsed']}")
    print(f"    Win-backs:         {stats['winback']}")
    print(f"    Unchanged:         {stats['unchanged']}")
    print(f"    Total to update:   {len(updates)}")
    print(f"    Klaviyo events:    {len(klaviyo_events)}")

    if dry_run:
        print(f"\n  DRY RUN - no changes written")
        # In dry run, show what Klaviyo events would fire
        stage_events = [e for e in klaviyo_events if e[0] == "stage_change"]
        warning_events = [e for e in klaviyo_events if e[0] == "warning"]
        if stage_events:
            print(f"  Would fire {len(stage_events)} Klaviyo stage-change events:")
            for _, data in stage_events[:10]:
                print(f"    {data['email']}: {data['old_stage']} -> {data['new_stage']}")
            if len(stage_events) > 10:
                print(f"    ... and {len(stage_events) - 10} more")
        if warning_events:
            print(f"  Would fire {len(warning_events)} Klaviyo pre-lapse warnings:")
            for _, data in warning_events[:10]:
                print(f"    {data['email']}: {data['days_remaining']} days until expiry")
            if len(warning_events) > 10:
                print(f"    ... and {len(warning_events) - 10} more")
    else:
        # Write CRM updates
        if updates:
            print(f"\n  Writing {len(updates)} updates to Zoho CRM...")
            results = client.update_records("Contacts", updates)
            success = sum(1 for r in results if r.get("code") == "SUCCESS")
            failed = len(results) - success
            print(f"    Success: {success}, Failed: {failed}")
            if failed:
                for r in results:
                    if r.get("code") != "SUCCESS":
                        print(f"    ERROR: {r}")

        # Push Klaviyo events
        if klaviyo and klaviyo_events:
            print(f"\n  Pushing {len(klaviyo_events)} events to Klaviyo...")
            for event_type, data in klaviyo_events:
                if event_type == "stage_change":
                    ok = klaviyo.push_lifecycle_change(
                        email=data["email"],
                        brand=brand,
                        old_stage=data["old_stage"],
                        new_stage=data["new_stage"],
                        treatment_count=data["treatment_count"],
                        last_treatment_date=data["last_treatment_date"],
                        first_name=data.get("first_name"),
                        last_name=data.get("last_name"),
                    )
                    if ok:
                        stats["klaviyo_stage_events"] += 1
                elif event_type == "warning":
                    ok = klaviyo.push_rebooking_warning(
                        email=data["email"],
                        brand=brand,
                        days_remaining=data["days_remaining"],
                        treatment_count=data["treatment_count"],
                        last_treatment_date=data["last_treatment_date"],
                        rebooking_expires=data["rebooking_expires"],
                        first_name=data.get("first_name"),
                        last_name=data.get("last_name"),
                    )
                    if ok:
                        stats["klaviyo_warning_events"] += 1
                time.sleep(0.1)  # Klaviyo rate limit courtesy

            print(f"    Stage-change events sent: {stats['klaviyo_stage_events']}")
            print(f"    Pre-lapse warnings sent:  {stats['klaviyo_warning_events']}")
        elif not klaviyo and klaviyo_events:
            print(f"\n  Skipping {len(klaviyo_events)} Klaviyo events (--no-klaviyo)")

    return {
        "brand": brand,
        "deals": len(deals),
        "contacts_updated": len(updates),
        "skipped": stats["unchanged"],
        **stats,
    }


def main():
    parser = argparse.ArgumentParser(
        description="Manage customer lifecycle stages across Zoho CRM brands"
    )
    parser.add_argument(
        "--brand",
        required=True,
        choices=["spa", "aesthetics", "slimming", "all"],
        help="Brand to process (or 'all')",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without writing to CRM or Klaviyo",
    )
    parser.add_argument(
        "--no-klaviyo",
        action="store_true",
        help="Skip pushing events to Klaviyo",
    )
    args = parser.parse_args()

    load_mcp_creds()

    # Initialize Klaviyo client (unless disabled)
    klaviyo = None
    if not args.no_klaviyo and not args.dry_run:
        if KLAVIYO_API_KEY:
            klaviyo = KlaviyoClient(KLAVIYO_API_KEY)
            print("  Klaviyo integration: ENABLED")
        else:
            print("  Klaviyo integration: DISABLED (no API key found)")

    brands = (
        ["spa", "aesthetics", "slimming"] if args.brand == "all" else [args.brand]
    )

    results = []
    for brand in brands:
        try:
            result = process_brand(brand, dry_run=args.dry_run, klaviyo=klaviyo)
            results.append(result)
        except Exception as e:
            print(f"\n  ERROR processing {brand}: {e}")
            results.append({"brand": brand, "error": str(e)})

    # Final summary
    print(f"\n{'='*60}")
    print(f"  FINAL SUMMARY")
    print(f"{'='*60}")
    total_klaviyo = 0
    for r in results:
        if "error" in r:
            print(f"  {r['brand'].upper()}: ERROR - {r['error']}")
        else:
            klaviyo_count = r.get("klaviyo_stage_events", 0) + r.get("klaviyo_warning_events", 0)
            total_klaviyo += klaviyo_count
            print(
                f"  {r['brand'].upper()}: {r['contacts_updated']} contacts updated "
                f"({r.get('promoted',0)} promoted, {r.get('lapsed',0)} lapsed, "
                f"{r.get('winback',0)} win-backs, {klaviyo_count} Klaviyo events)"
            )
    if total_klaviyo:
        print(f"\n  Total Klaviyo events pushed: {total_klaviyo}")


if __name__ == "__main__":
    main()
