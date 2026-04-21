"""
Reactivation Engine — Carisma Aesthetics Zoho CRM
==================================================
Finds dormant leads (inactive for 120+ days, not in a closed stage) and creates
a "Reactivation" task for each one that has no existing open tasks.

Usage:
    python reactivation_engine.py              # live run — creates tasks
    python reactivation_engine.py --dry-run    # preview only, no tasks created

Credentials are read from environment variables with fallback to hardcoded values.
Move hardcoded values to .env before deploying to production.
"""

import os
import logging
import argparse
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Credentials  ← MOVE THESE TO .env IN PRODUCTION
# ---------------------------------------------------------------------------
CLIENT_ID = os.environ.get("ZOHO_CLIENT_ID", "1000.MU7KOHIF9PLM1DDJXZD7VEZQ4GLS3M")
CLIENT_SECRET = os.environ.get(
    "ZOHO_CLIENT_SECRET", "7eb15914cb91b68fd72ca5e7c0facd7e1a37266ddc"
)
REFRESH_TOKEN = os.environ.get(
    "ZOHO_REFRESH_TOKEN",
    "1000.56911465cc4c1c50a20c7eeb28785027.39f0aa6b5f613c35fdfbe55eb77e5d87",
)
API_DOMAIN = os.environ.get("ZOHO_API_DOMAIN", "https://www.zohoapis.eu")
ACCOUNTS_URL = "https://accounts.zoho.eu/oauth/v2/token"

# Stages that are considered "closed" — dormant check is skipped for these
CLOSED_STAGES = {"Booking Confirmed", "Consultation Lost", "Booking Lost"}

# How many days of inactivity qualify a lead for reactivation
DORMANT_THRESHOLD_DAYS = 120


# ---------------------------------------------------------------------------
# ZohoClient
# ---------------------------------------------------------------------------
class ZohoClient:
    """Thin httpx wrapper that auto-refreshes the OAuth2 access token."""

    def __init__(self):
        self._access_token: Optional[str] = None
        self._http = httpx.Client(timeout=30)

    def _refresh_token(self) -> None:
        log.debug("Refreshing Zoho access token…")
        resp = self._http.post(
            ACCOUNTS_URL,
            data={
                "grant_type": "refresh_token",
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "refresh_token": REFRESH_TOKEN,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        if "access_token" not in data:
            raise RuntimeError(f"Token refresh failed: {data}")
        self._access_token = data["access_token"]
        log.debug("Access token refreshed.")

    def _headers(self) -> dict:
        if not self._access_token:
            self._refresh_token()
        return {
            "Authorization": f"Zoho-oauthtoken {self._access_token}",
            "Content-Type": "application/json",
        }

    def get(self, path: str, **kwargs) -> dict:
        return self._request("GET", path, **kwargs)

    def post(self, path: str, **kwargs) -> dict:
        return self._request("POST", path, **kwargs)

    def _request(self, method: str, path: str, retry: bool = True, **kwargs) -> dict:
        url = f"{API_DOMAIN}/crm/v6{path}"
        resp = self._http.request(method, url, headers=self._headers(), **kwargs)

        # Token expired → refresh once and retry
        if resp.status_code == 401 and retry:
            self._refresh_token()
            return self._request(method, path, retry=False, **kwargs)

        resp.raise_for_status()
        return resp.json()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _cutoff_datetime_str(days: int) -> str:
    """Return an ISO 8601 datetime string *days* ago (UTC), formatted for COQL."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    # Zoho COQL expects: 'YYYY-MM-DDTHH:MM:SS+00:00'
    return cutoff.strftime("%Y-%m-%dT%H:%M:%S+00:00")


def _today_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _days_since(dt_str: Optional[str]) -> Optional[int]:
    """Return the number of days since a Zoho datetime string, or None if blank."""
    if not dt_str:
        return None
    for fmt in ("%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%S+00:00", "%Y-%m-%d"):
        try:
            dt = datetime.strptime(dt_str[:25], fmt[:len(dt_str[:25])])
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            delta = datetime.now(timezone.utc) - dt
            return max(0, delta.days)
        except ValueError:
            continue
    return None


# ---------------------------------------------------------------------------
# Core functions
# ---------------------------------------------------------------------------
def fetch_dormant_deals(client: ZohoClient) -> list[dict]:
    """
    Use COQL to retrieve all open deals inactive for >= DORMANT_THRESHOLD_DAYS days.
    Pages through results automatically (Zoho COQL max 200 per page).
    """
    cutoff = _cutoff_datetime_str(DORMANT_THRESHOLD_DAYS)
    closed_in_clause = ", ".join(f"'{s}'" for s in CLOSED_STAGES)

    all_deals: list[dict] = []
    offset = 0
    page_size = 200

    while True:
        query = (
            "SELECT id, Deal_Name, Stage, Created_Time, Last_Activity_Time, Modified_Time "
            "FROM Deals "
            f"WHERE Stage NOT IN ({closed_in_clause}) "
            f"AND Created_Time < '{cutoff}' "
            f"LIMIT {page_size} OFFSET {offset}"
        )
        log.debug("COQL query (offset=%d): %s", offset, query)

        try:
            resp = client.post("/coql", json={"select_query": query})
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code == 400:
                body = exc.response.json()
                # "No results" — not a real error
                if body.get("code") in ("NO_RECORD_FOUND", "INVALID_QUERY"):
                    log.info("COQL returned no results.")
                    break
            raise

        page_data = resp.get("data", [])
        if not page_data:
            break

        # Post-filter: keep only deals where last activity is also beyond cutoff.
        # We do this in Python because COQL does not support OR-based NULL fallback well.
        for deal in page_data:
            last_activity = deal.get("Last_Activity_Time") or deal.get("Modified_Time")
            days_inactive = _days_since(last_activity)
            if days_inactive is not None and days_inactive >= DORMANT_THRESHOLD_DAYS:
                all_deals.append(deal)
            elif days_inactive is None:
                # Fallback: if we can't parse the date, include it to be safe
                all_deals.append(deal)

        info = resp.get("info", {})
        if not info.get("more_records", False):
            break
        offset += page_size

    log.info("Found %d dormant deals after filtering.", len(all_deals))
    return all_deals


def has_open_task(client: ZohoClient, deal_id: str) -> bool:
    """Return True if any open (not Completed/Deferred) task exists for this deal."""
    query = (
        "SELECT id, Status FROM Tasks "
        f"WHERE What_Id = '{deal_id}' "
        "AND Status NOT IN ('Completed', 'Deferred') "
        "LIMIT 1"
    )
    try:
        resp = client.post("/coql", json={"select_query": query})
        return bool(resp.get("data"))
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 400:
            body = exc.response.json()
            if body.get("code") in ("NO_RECORD_FOUND", "INVALID_QUERY") or not body.get("data"):
                return False
        raise


def create_reactivation_task(client: ZohoClient, deal: dict) -> str:
    """Create a reactivation task for the given deal and return its ID."""
    deal_id   = deal["id"]
    deal_name = deal.get("Deal_Name", deal_id)

    days_created  = _days_since(deal.get("Created_Time"))
    last_activity = deal.get("Last_Activity_Time") or deal.get("Modified_Time")
    days_activity = _days_since(last_activity)

    days_created_str  = f"{days_created} days"  if days_created  is not None else "unknown number of"
    days_activity_str = f"{days_activity} days" if days_activity is not None else "unknown number of"

    description = (
        f"Lead entered CRM {days_created_str} ago. "
        f"Last activity {days_activity_str} ago. "
        "Re-engage with a friendly check-in message."
    )

    payload = {
        "data": [
            {
                "Subject":        f"\u267b Reactivation \u2014 {deal_name}",
                "Due_Date":       _today_str(),
                "Priority":       "Lowest",
                "Priority_Score": 10,
                "Status":         "Not Started",
                "Task_Type":      "Reactivation",
                "Description":    description,
                "$se_module":     "Deals",
                "What_Id":        deal_id,
            }
        ]
    }
    resp = client.post("/Tasks", json=payload)
    records = resp.get("data", [])
    if not records or records[0].get("code") != "SUCCESS":
        raise RuntimeError(f"Task creation failed for deal {deal_id}: {resp}")
    return records[0]["details"]["id"]


# ---------------------------------------------------------------------------
# Main orchestration
# ---------------------------------------------------------------------------
def run(dry_run: bool = False) -> None:
    client = ZohoClient()

    log.info("Searching for dormant leads (inactive > %d days)…", DORMANT_THRESHOLD_DAYS)
    dormant_deals = fetch_dormant_deals(client)

    if not dormant_deals:
        log.info("No dormant leads found. Nothing to do.")
        print("\n--- Summary ---")
        print("Dormant leads found : 0")
        print("Tasks created       : 0")
        print("Skipped (open task) : 0")
        return

    total_found   = len(dormant_deals)
    tasks_created = 0
    tasks_skipped = 0

    for deal in dormant_deals:
        deal_id   = deal["id"]
        deal_name = deal.get("Deal_Name", deal_id)

        log.info("Checking deal '%s' (%s)…", deal_name, deal_id)

        if has_open_task(client, deal_id):
            log.info("  → Skipped: open task already exists.")
            tasks_skipped += 1
            continue

        if dry_run:
            log.info("  → [DRY RUN] Would create reactivation task.")
            tasks_created += 1  # count as "would create" for dry-run summary
        else:
            try:
                task_id = create_reactivation_task(client, deal)
                log.info("  → Task created: %s", task_id)
                tasks_created += 1
            except Exception as exc:
                log.error("  → Failed to create task for deal %s: %s", deal_id, exc)

    print("\n--- Reactivation Engine Summary ---")
    print(f"Dormant leads found  : {total_found}")
    if dry_run:
        print(f"Tasks to be created  : {tasks_created}  [DRY RUN — no tasks were actually created]")
    else:
        print(f"Tasks created        : {tasks_created}")
    print(f"Skipped (open task)  : {tasks_skipped}")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Find dormant Carisma Aesthetics leads and create reactivation tasks."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview results without creating any tasks.",
    )
    args = parser.parse_args()

    run(dry_run=args.dry_run)
