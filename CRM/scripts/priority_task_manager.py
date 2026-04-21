"""
Priority Task Manager — Carisma Aesthetics Zoho CRM
====================================================
Creates the correct next task for a deal based on its current pipeline stage
and follow-up number, ensuring no duplicate open tasks are created.

Usage:
    python priority_task_manager.py <deal_id>

Example:
    python priority_task_manager.py 5073662000001234567

Credentials are read from environment variables with fallback to hardcoded values.
Move hardcoded values to .env before deploying to production.
"""

import os
import sys
import logging
from datetime import datetime, timedelta, timezone

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


# ---------------------------------------------------------------------------
# ZohoClient
# ---------------------------------------------------------------------------
class ZohoClient:
    """Thin httpx wrapper that auto-refreshes the OAuth2 access token."""

    def __init__(self):
        self._access_token: str | None = None
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
# Task priority logic
# ---------------------------------------------------------------------------
def _due_date(days_from_now: int) -> str:
    """Return a date string (YYYY-MM-DD) offset by *days_from_now* from today."""
    target = datetime.now(timezone.utc) + timedelta(days=days_from_now)
    return target.strftime("%Y-%m-%d")


# Priority_Score is a custom integer field on Tasks (id: 524228000044023001).
# The Setter Queue view sorts by this field DESCENDING — higher score = shown first.
PRIORITY_SCORES: dict[str, int] = {
    "First Contact":          100,
    "Reschedule Call":        100,
    "Scheduled Callback":      90,
    "Post-Contact Follow-up":  80,
    "Follow-up 1":             70,
    "Follow-up 2":             60,
    "Follow-up 3":             50,
    "Final Attempt":           40,
    "Reactivation":            10,
}

STAGE_RULES: dict[str, dict] = {
    # Stage "New Leads" is handled dynamically below (depends on Followup_Number)
    "Contacted": {
        "task_type": "Post-Contact Follow-up",
        "priority": "High",
        "due_offset": 1,
    },
    "No Show": {
        "task_type": "Reschedule Call",
        "priority": "Highest",
        "due_offset": 0,
    },
}

NEW_LEADS_FOLLOWUP_RULES: list[dict] = [
    {"followup_max": 0, "task_type": "First Contact",  "priority": "Highest", "due_offset": 0},
    {"followup_max": 1, "task_type": "Follow-up 1",    "priority": "High",    "due_offset": 1},
    {"followup_max": 2, "task_type": "Follow-up 2",    "priority": "Normal",  "due_offset": 1},
    {"followup_max": 3, "task_type": "Follow-up 3",    "priority": "Normal",  "due_offset": 4},
]
NEW_LEADS_FINAL = {"task_type": "Final Attempt", "priority": "Low", "due_offset": 0}


def determine_task_params(stage: str, followup_number: int) -> dict | None:
    """
    Return a dict with task_type, priority, and due_date for the given stage/followup,
    or None if the stage does not require a new task (e.g. closed stages).
    """
    if stage == "New Leads":
        rule = NEW_LEADS_FINAL
        for r in NEW_LEADS_FOLLOWUP_RULES:
            if followup_number <= r["followup_max"]:
                rule = r
                break
        return {
            "task_type": rule["task_type"],
            "priority":  rule["priority"],
            "due_date":  _due_date(rule["due_offset"]),
        }

    if stage in STAGE_RULES:
        r = STAGE_RULES[stage]
        return {
            "task_type": r["task_type"],
            "priority":  r["priority"],
            "due_date":  _due_date(r["due_offset"]),
        }

    # Closed / terminal stages — no task needed
    log.info("Stage '%s' does not require a new task.", stage)
    return None


# ---------------------------------------------------------------------------
# Core functions
# ---------------------------------------------------------------------------
def get_deal(client: ZohoClient, deal_id: str) -> dict:
    """Fetch a deal by ID and return its field data."""
    data = client.get(f"/Deals/{deal_id}")
    records = data.get("data", [])
    if not records:
        raise ValueError(f"Deal {deal_id} not found.")
    return records[0]


def has_open_task(client: ZohoClient, deal_id: str) -> bool:
    """Return True if any open (Status != Completed/Deferred) task exists for this deal."""
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
        # A 400 with "no results" message is not a real error
        if exc.response.status_code == 400:
            body = exc.response.json()
            if body.get("code") == "INVALID_QUERY" or not body.get("data"):
                return False
        raise


def create_task(client: ZohoClient, deal_id: str, deal_name: str, params: dict) -> str:
    """Create a task linked to the deal and return its ID."""
    task_type = params["task_type"]
    payload = {
        "data": [
            {
                "Subject":        f"{task_type} — {deal_name}",
                "Due_Date":       params["due_date"],
                "Priority":       params["priority"],
                "Priority_Score": PRIORITY_SCORES.get(task_type, 50),
                "Status":         "Not Started",
                "Task_Type":      task_type,
                "$se_module":     "Deals",
                "What_Id":        deal_id,
            }
        ]
    }
    resp = client.post("/Tasks", json=payload)
    records = resp.get("data", [])
    if not records or records[0].get("code") != "SUCCESS":
        raise RuntimeError(f"Task creation failed: {resp}")
    return records[0]["details"]["id"]


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
def run(deal_id: str) -> dict:
    """
    Main orchestration function.
    Returns {"success": bool, "task_id": str | None, "message": str}.
    """
    client = ZohoClient()

    log.info("Fetching deal %s…", deal_id)
    deal = get_deal(client, deal_id)
    deal_name      = deal.get("Deal_Name", deal_id)
    stage          = deal.get("Stage", "")
    followup_num   = int(deal.get("Followup_Number") or 0)

    log.info("Deal '%s' | Stage: %s | Followup_Number: %d", deal_name, stage, followup_num)

    params = determine_task_params(stage, followup_num)
    if params is None:
        msg = f"No task required for stage '{stage}'."
        log.info(msg)
        return {"success": True, "task_id": None, "message": msg}

    log.info("Checking for existing open tasks…")
    if has_open_task(client, deal_id):
        msg = "Open task already exists — skipping creation."
        log.info(msg)
        return {"success": True, "task_id": None, "message": msg}

    log.info("Creating task: type=%s, priority=%s, due=%s", params["task_type"], params["priority"], params["due_date"])
    task_id = create_task(client, deal_id, deal_name, params)
    msg = f"Task created: {task_id}"
    log.info(msg)
    return {"success": True, "task_id": task_id, "message": msg}


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(f"Usage: python {sys.argv[0]} <deal_id>")
        sys.exit(1)

    result = run(sys.argv[1])
    print(result)
    sys.exit(0 if result["success"] else 1)
