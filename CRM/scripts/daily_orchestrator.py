"""Daily CRM orchestrator for Carisma Aesthetics.

Runs every morning to ensure the task queue is correct and prioritised.
Designed to be triggered via cron, n8n, or Zoho Functions on a schedule.

What it does:
  1. Finds all open deals with no open tasks → creates the correct next task
  2. Finds deals where Followup_Number >= 4 and still in New Lead → force closes to Consultation Lost
  3. Finds overdue reactivation candidates → delegates to reactivation_engine.py
  4. Prints a daily health summary

Usage:
  python CRM/scripts/daily_orchestrator.py
  python CRM/scripts/daily_orchestrator.py --dry-run
  python CRM/scripts/daily_orchestrator.py --skip-reactivation
"""

import argparse
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import httpx

# ── Credentials ───────────────────────────────────────────────────────────────
# Move these to .env — never commit secrets to git
CLIENT_ID     = os.getenv("ZOHO_CLIENT_ID",     "1000.MU7KOHIF9PLM1DDJXZD7VEZQ4GLS3M")
CLIENT_SECRET = os.getenv("ZOHO_CLIENT_SECRET", "7eb15914cb91b68fd72ca5e7c0facd7e1a37266ddc")
REFRESH_TOKEN = os.getenv("ZOHO_REFRESH_TOKEN", "1000.56911465cc4c1c50a20c7eeb28785027.39f0aa6b5f613c35fdfbe55eb77e5d87")
API_DOMAIN    = os.getenv("ZOHO_API_DOMAIN",    "https://www.zohoapis.eu")
ACCOUNTS_URL  = "https://accounts.zoho.eu/oauth/v2/token"

# ── Pipeline constants ─────────────────────────────────────────────────────────
ACTIVE_STAGES    = ["New Leads", "Contacted", "Consultation Scheduled", "No Show"]
TERMINAL_STAGES  = ["Booking Confirmed", "Consultation Lost", "Booking Lost"]
OPEN_TASK_STATUS = ["Not Started", "In Progress", "Deferred", "Waiting for input"]

MAX_FOLLOWUPS = 4  # Force to Consultation Lost after this many no-answers

# Priority_Score field (id: 524228000044023001) — Setter Queue view sorts DESC
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


# ── Zoho Client ───────────────────────────────────────────────────────────────
class ZohoClient:
    def __init__(self):
        self._access_token: Optional[str] = None
        self._token_expiry: float = 0
        self._http = httpx.Client(timeout=30)

    def _refresh(self):
        resp = self._http.post(ACCOUNTS_URL, data={
            "grant_type": "refresh_token",
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "refresh_token": REFRESH_TOKEN,
        })
        data = resp.json()
        if "access_token" not in data:
            raise RuntimeError(f"Token refresh failed: {data}")
        self._access_token = data["access_token"]
        self._token_expiry = time.time() + data.get("expires_in", 3600) - 300

    def _ensure_token(self):
        if not self._access_token or time.time() >= self._token_expiry:
            self._refresh()

    def _headers(self):
        return {"Authorization": f"Zoho-oauthtoken {self._access_token}"}

    def get(self, path, params=None):
        self._ensure_token()
        resp = self._http.get(f"{API_DOMAIN}/crm/v7{path}", headers=self._headers(), params=params)
        if resp.status_code == 401:
            self._refresh()
            resp = self._http.get(f"{API_DOMAIN}/crm/v7{path}", headers=self._headers(), params=params)
        return resp.json() if resp.status_code != 204 else {}

    def post(self, path, body):
        self._ensure_token()
        resp = self._http.post(f"{API_DOMAIN}/crm/v7{path}", headers=self._headers(), json=body)
        if resp.status_code == 401:
            self._refresh()
            resp = self._http.post(f"{API_DOMAIN}/crm/v7{path}", headers=self._headers(), json=body)
        return resp.json() if resp.status_code != 204 else {}

    def put(self, path, body):
        self._ensure_token()
        resp = self._http.put(f"{API_DOMAIN}/crm/v7{path}", headers=self._headers(), json=body)
        if resp.status_code == 401:
            self._refresh()
            resp = self._http.put(f"{API_DOMAIN}/crm/v7{path}", headers=self._headers(), json=body)
        return resp.json() if resp.status_code != 204 else {}

    def coql(self, query):
        self._ensure_token()
        resp = self._http.post(
            f"{API_DOMAIN}/crm/v7/coql",
            headers={**self._headers(), "Content-Type": "application/json"},
            json={"select_query": query}
        )
        if resp.status_code == 401:
            self._refresh()
            resp = self._http.post(
                f"{API_DOMAIN}/crm/v7/coql",
                headers={**self._headers(), "Content-Type": "application/json"},
                json={"select_query": query}
            )
        return resp.json() if resp.status_code != 204 else {"data": []}


# ── Priority Rules ─────────────────────────────────────────────────────────────
def get_task_config(stage: str, followup_number: int) -> Optional[dict]:
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    def days_out(n):
        from datetime import timedelta
        return (datetime.now(timezone.utc) + timedelta(days=n)).strftime("%Y-%m-%d")

    rules = {
        "New Leads": [
            {"followup": 0, "type": "First Contact",  "priority": "Highest", "due": today},
            {"followup": 1, "type": "Follow-up 1",    "priority": "High",    "due": days_out(1)},
            {"followup": 2, "type": "Follow-up 2",    "priority": "Normal",  "due": days_out(1)},
            {"followup": 3, "type": "Follow-up 3",    "priority": "Normal",  "due": days_out(4)},
            {"followup": 4, "type": "Final Attempt",  "priority": "Low",     "due": today},
        ],
        "Contacted": [
            {"followup": None, "type": "Post-Contact Follow-up", "priority": "High", "due": days_out(1)},
        ],
        "No Show": [
            {"followup": None, "type": "Reschedule Call", "priority": "Highest", "due": today},
        ],
    }

    if stage not in rules:
        return None

    stage_rules = rules[stage]
    if stage == "New Leads":
        fn = min(followup_number, 4)
        match = next((r for r in stage_rules if r["followup"] == fn), None)
        return match
    else:
        return stage_rules[0]


def has_open_task(client: ZohoClient, deal_id: str) -> bool:
    status_list = "','".join(OPEN_TASK_STATUS)
    query = f"""
        SELECT id, Subject, Status FROM Tasks
        WHERE What_Id = '{deal_id}'
        AND Status in ('{status_list}')
        LIMIT 1
    """
    result = client.coql(query)
    return bool(result.get("data"))


def create_task(client: ZohoClient, deal_id: str, deal_name: str,
                owner_id: str, task_type: str, priority: str, due_date: str,
                dry_run: bool = False) -> Optional[str]:
    subject_map = {
        "First Contact":          "📞 First Contact — {name}",
        "Follow-up 1":            "📞 Follow-up Day 2 — {name}",
        "Follow-up 2":            "📞 Follow-up Day 3 — {name}",
        "Follow-up 3":            "📞 Follow-up Day 7 — {name}",
        "Final Attempt":          "🔴 FINAL Attempt — {name}",
        "Post-Contact Follow-up": "📞 Post-Contact Follow-up — {name}",
        "Reschedule Call":        "🚨 Reschedule Call — {name}",
        "Reactivation":           "♻ Reactivation — {name}",
    }
    subject = subject_map.get(task_type, f"Task — {deal_name}").format(name=deal_name)

    if dry_run:
        print(f"  [DRY RUN] Would create: '{subject}' | {priority} | Due: {due_date}")
        return "dry-run"

    body = {"data": [{
        "Subject":        subject,
        "Due_Date":       due_date,
        "Priority":       priority,
        "Priority_Score": PRIORITY_SCORES.get(task_type, 50),
        "Status":         "Not Started",
        "Task_Type":      task_type,
        "What_Id":        {"id": deal_id},
        "Owner":          {"id": owner_id},
    }]}
    resp = client.post("/Tasks", body)
    items = resp.get("data", [])
    if items and items[0].get("code") == "SUCCESS":
        return items[0]["details"]["id"]
    print(f"  ⚠ Task creation failed: {resp}")
    return None


def force_close_stale_new_leads(client: ZohoClient, dry_run: bool) -> int:
    """Deals stuck in New Lead with 4+ no-answers get force-closed."""
    query = f"""
        SELECT id, Deal_Name, Stage, Followup_Number FROM Deals
        WHERE Stage = 'New Leads'
        AND Followup_Number >= {MAX_FOLLOWUPS}
        LIMIT 200
    """
    result = client.coql(query)
    deals = result.get("data", [])
    closed = 0

    for deal in deals:
        did  = deal["id"]
        name = deal.get("Deal_Name", "Unknown")
        print(f"  Force-closing stale lead: {name} (followup #{deal.get('Followup_Number')})")
        if not dry_run:
            client.put(f"/Deals/{did}", {"data": [{
                "id":               did,
                "Stage":            "Consultation Lost",
                "Reason_For_Loss__s": "Unresponsive",
            }]})
        closed += 1

    return closed


# ── Main Orchestration ────────────────────────────────────────────────────────
def run(dry_run: bool, skip_reactivation: bool):
    print("=" * 60)
    print(f"  Carisma Aesthetics — Daily CRM Orchestrator")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M')}  |  dry_run={dry_run}")
    print("=" * 60)

    client = ZohoClient()
    stats = {"tasks_created": 0, "tasks_skipped": 0, "force_closed": 0, "errors": 0}

    # ── 1. Force-close stale New Leads ────────────────────────────────────────
    print("\n[1/3] Checking for stale New Leads (4+ no-answers)...")
    stats["force_closed"] = force_close_stale_new_leads(client, dry_run)
    print(f"  → {stats['force_closed']} stale deals force-closed")

    # ── 2. Find active deals with no open tasks ───────────────────────────────
    print("\n[2/3] Finding active deals with no open tasks...")
    stage_filter = "','".join(ACTIVE_STAGES)
    query = f"""
        SELECT id, Deal_Name, Stage, Followup_Number, Owner
        FROM Deals
        WHERE Stage in ('{stage_filter}')
        AND (Followup_Number < {MAX_FOLLOWUPS} or Followup_Number is null)
        LIMIT 200
    """
    result = client.coql(query)
    deals = result.get("data", [])
    print(f"  Found {len(deals)} active deals")

    for deal in deals:
        did      = deal["id"]
        name     = deal.get("Deal_Name", "Unknown")
        stage    = deal.get("Stage", "")
        fn       = deal.get("Followup_Number") or 0
        owner_id = deal.get("Owner", {}).get("id", "")

        if has_open_task(client, did):
            stats["tasks_skipped"] += 1
            continue

        config = get_task_config(stage, fn)
        if not config:
            continue

        task_id = create_task(
            client, did, name, owner_id,
            config["type"], config["priority"], config["due"],
            dry_run=dry_run
        )
        if task_id:
            stats["tasks_created"] += 1
            print(f"  ✓ {name} [{stage}] → {config['type']} task ({config['priority']})")
        else:
            stats["errors"] += 1

    # ── 3. Reactivation ───────────────────────────────────────────────────────
    if not skip_reactivation:
        print("\n[3/3] Running reactivation engine...")
        script = Path(__file__).parent / "reactivation_engine.py"
        cmd = f"python3 '{script}'"
        if dry_run:
            cmd += " --dry-run"
        os.system(cmd)
    else:
        print("\n[3/3] Skipping reactivation (--skip-reactivation flag)")

    # ── Summary ───────────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("  DAILY SUMMARY")
    print("=" * 60)
    print(f"  Tasks created:      {stats['tasks_created']}")
    print(f"  Tasks skipped:      {stats['tasks_skipped']} (already had open tasks)")
    print(f"  Force-closed:       {stats['force_closed']} (stale New Leads)")
    print(f"  Errors:             {stats['errors']}")
    print("=" * 60)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Carisma Aesthetics daily CRM orchestrator")
    parser.add_argument("--dry-run", action="store_true", help="Preview without making changes")
    parser.add_argument("--skip-reactivation", action="store_true", help="Skip reactivation engine")
    args = parser.parse_args()
    run(dry_run=args.dry_run, skip_reactivation=args.skip_reactivation)
