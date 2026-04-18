"""Deploy task automation workflow rules to all 3 Zoho CRM instances.

Uses Zoho CRM API v7 for field lookups and task creation.
Workflow rules require manual UI setup — this script outputs the exact
configuration to apply in each CRM's Settings > Automation > Workflow Rules.

What this script DOES:
  - Validates that all required custom fields exist on Tasks and Deals modules
  - Gets field IDs needed for workflow rule configuration
  - Outputs exact workflow rule specs for manual creation in Zoho CRM UI

What requires MANUAL setup in Zoho CRM UI:
  - Workflow Rules (Settings > Automation > Workflow Rules)
  - Blueprint transitions (Settings > Process Management > Blueprint)

Usage:
  python Tools/deploy_crm_workflow_rules.py
"""

import json
import os
import sys
import time
from typing import Optional

import httpx


# ── CRM Credentials ──────────────────────────────────────────────────────────

BRANDS = {
    "spa": {
        "client_id": "1000.5SF8C4FZ7LS7WYB12Q9GU7KNEPX91S",
        "client_secret": "2e11ff9968510d815d01ee9ece65c5582b7212941a",
        "refresh_token": "1000.30e19005b25db6cec0b7267524548213.a5394cb5131f3c6b2d0a225ea7071825",
    },
    "aesthetics": {
        "client_id": "1000.MU7KOHIF9PLM1DDJXZD7VEZQ4GLS3M",
        "client_secret": "7eb15914cb91b68fd72ca5e7c0facd7e1a37266ddc",
        "refresh_token": "1000.56911465cc4c1c50a20c7eeb28785027.39f0aa6b5f613c35fdfbe55eb77e5d87",
    },
    "slimming": {
        "client_id": "1000.VUWMWRIW1IJM5ZZA6WTAUTBXQIDRLG",
        "client_secret": "89cfa558cdc38ad23ef0623b9d287e777ab60b8dd9",
        "refresh_token": "1000.c517d2a9ad1b1db141b9d6cc048c9649.e59f2289d9c14e2220e13c7cfe2a3047",
    },
}

API_DOMAIN = "https://www.zohoapis.eu"
ACCOUNTS_URL = "https://accounts.zoho.eu/oauth/v2/token"


# ── API Client ────────────────────────────────────────────────────────────────

class ZohoClient:
    def __init__(self, brand_config: dict):
        self._config = brand_config
        self._access_token: Optional[str] = None
        self._token_expiry: float = 0
        self._http = httpx.Client(timeout=30)

    def _refresh_token(self):
        resp = self._http.post(ACCOUNTS_URL, data={
            "grant_type": "refresh_token",
            "client_id": self._config["client_id"],
            "client_secret": self._config["client_secret"],
            "refresh_token": self._config["refresh_token"],
        })
        data = resp.json()
        if "access_token" not in data:
            raise RuntimeError(f"Token refresh failed: {data}")
        self._access_token = data["access_token"]
        self._token_expiry = time.time() + data.get("expires_in", 3600) - 300

    def _ensure_token(self):
        if not self._access_token or time.time() >= self._token_expiry:
            self._refresh_token()

    def request(self, method: str, path: str, *, params=None, json_body=None, api_version="v7"):
        self._ensure_token()
        url = f"{API_DOMAIN}/crm/{api_version}{path}"
        headers = {"Authorization": f"Zoho-oauthtoken {self._access_token}"}
        resp = self._http.request(method, url, headers=headers, params=params, json=json_body)
        if resp.status_code == 401:
            self._refresh_token()
            headers = {"Authorization": f"Zoho-oauthtoken {self._access_token}"}
            resp = self._http.request(method, url, headers=headers, params=params, json=json_body)
        if resp.status_code == 204:
            return {"status": "success", "code": 204}
        try:
            return resp.json()
        except Exception:
            return {"status_code": resp.status_code, "body": resp.text[:1000]}


# ── Field Validation ──────────────────────────────────────────────────────────

REQUIRED_TASK_FIELDS = ["Task_Outcome", "Task_Type", "Callback_Date_Time"]
REQUIRED_DEAL_FIELDS = ["Last_Contact_Attempt", "Callback_Requested"]


def get_field_map(client: ZohoClient, module: str) -> dict:
    """Get {api_name: field_id} mapping for a module."""
    resp = client.request("GET", f"/settings/fields", params={"module": module})
    fields = resp.get("fields", [])
    return {f["api_name"]: f["id"] for f in fields}


def validate_fields(client: ZohoClient, brand: str) -> dict:
    """Validate all required fields exist and return their IDs."""
    print(f"\n{'='*60}")
    print(f"  Validating fields for: {brand.upper()}")
    print(f"{'='*60}")

    task_fields = get_field_map(client, "Tasks")
    deal_fields = get_field_map(client, "Deals")

    results = {"tasks": {}, "deals": {}, "missing": []}

    for field in REQUIRED_TASK_FIELDS:
        if field in task_fields:
            results["tasks"][field] = task_fields[field]
            print(f"  ✓ Tasks.{field} = {task_fields[field]}")
        else:
            results["missing"].append(f"Tasks.{field}")
            print(f"  ✗ Tasks.{field} — MISSING")

    for field in REQUIRED_DEAL_FIELDS:
        if field in deal_fields:
            results["deals"][field] = deal_fields[field]
            print(f"  ✓ Deals.{field} = {deal_fields[field]}")
        else:
            results["missing"].append(f"Deals.{field}")
            print(f"  ✗ Deals.{field} — MISSING")

    # Also grab standard fields we need
    for std_field in ["Stage", "Followup_Number", "Owner"]:
        if std_field in deal_fields:
            results["deals"][std_field] = deal_fields[std_field]
            print(f"  ✓ Deals.{std_field} = {deal_fields[std_field]}")

    for std_field in ["Subject", "Due_Date", "Status", "Priority", "Owner", "What_Id"]:
        if std_field in task_fields:
            results["tasks"][std_field] = task_fields[std_field]

    return results


# ── Workflow Rule Specs ───────────────────────────────────────────────────────

def generate_workflow_specs(brand: str, field_ids: dict) -> list[dict]:
    """Generate the workflow rule specifications for manual setup."""
    return [
        {
            "name": f"[{brand.upper()}] Auto-Task: First Contact on New Lead",
            "trigger": "When a Deal is created or edited",
            "condition": 'Stage is "New Leads"',
            "action": "Create Task",
            "task_details": {
                "Subject": "First Contact Attempt",
                "Due Date": "Rule trigger date",
                "Priority": "Urgent",
                "Status": "Not Started",
                "Task_Type": "First Contact",
                "Related To": "${Deals.Deal_Name}",
                "Owner": "${Deals.Owner}",
            },
        },
        {
            "name": f"[{brand.upper()}] Auto-Task: Follow-up on No Answer",
            "trigger": "When a Task is created or edited",
            "condition": 'Task_Outcome is "No Answer" AND Task_Type is "First Contact"',
            "action": "Create Task",
            "task_details": {
                "Subject": "Follow-up Call #1",
                "Due Date": "Rule trigger date + 1 day",
                "Priority": "High",
                "Status": "Not Started",
                "Task_Type": "Follow-up 1",
                "Related To": "${Tasks.What_Id}",
                "Owner": "${Tasks.Owner}",
            },
        },
        {
            "name": f"[{brand.upper()}] Auto-Task: Follow-up 2 on No Answer",
            "trigger": "When a Task is created or edited",
            "condition": 'Task_Outcome is "No Answer" AND Task_Type is "Follow-up 1"',
            "action": "Create Task",
            "task_details": {
                "Subject": "Follow-up Call #2 + WhatsApp",
                "Due Date": "Rule trigger date + 2 days",
                "Priority": "Normal",
                "Status": "Not Started",
                "Task_Type": "Follow-up 2",
                "Related To": "${Tasks.What_Id}",
                "Owner": "${Tasks.Owner}",
            },
        },
        {
            "name": f"[{brand.upper()}] Auto-Task: Follow-up 3 on No Answer",
            "trigger": "When a Task is created or edited",
            "condition": 'Task_Outcome is "No Answer" AND Task_Type is "Follow-up 2"',
            "action": "Create Task",
            "task_details": {
                "Subject": "Follow-up Call #3 + SMS",
                "Due Date": "Rule trigger date + 2 days",
                "Priority": "Normal",
                "Status": "Not Started",
                "Task_Type": "Follow-up 3",
                "Related To": "${Tasks.What_Id}",
                "Owner": "${Tasks.Owner}",
            },
        },
        {
            "name": f"[{brand.upper()}] Auto-Task: Final Attempt",
            "trigger": "When a Task is created or edited",
            "condition": 'Task_Outcome is "No Answer" AND Task_Type is "Follow-up 3"',
            "action": "Create Task",
            "task_details": {
                "Subject": "FINAL Attempt — Call + Last Chance WhatsApp",
                "Due Date": "Rule trigger date + 3 days",
                "Priority": "Low",
                "Status": "Not Started",
                "Task_Type": "Final Attempt",
                "Related To": "${Tasks.What_Id}",
                "Owner": "${Tasks.Owner}",
            },
        },
        {
            "name": f"[{brand.upper()}] Auto-Task: Callback Scheduled",
            "trigger": "When a Task is created or edited",
            "condition": 'Task_Outcome is "Connected - Call Back"',
            "action": "Create Task",
            "task_details": {
                "Subject": "Scheduled Callback",
                "Due Date": "${Tasks.Callback_Date_Time}",
                "Priority": "High",
                "Status": "Not Started",
                "Task_Type": "Scheduled Callback",
                "Related To": "${Tasks.What_Id}",
                "Owner": "${Tasks.Owner}",
            },
        },
        {
            "name": f"[{brand.upper()}] Auto-Task: Post-Interest Follow-up",
            "trigger": "When a Task is created or edited",
            "condition": 'Task_Outcome is "Connected - Interested"',
            "action": "Create Task",
            "task_details": {
                "Subject": "Follow up on Interest — Book Appointment",
                "Due Date": "Rule trigger date + 1 day",
                "Priority": "High",
                "Status": "Not Started",
                "Task_Type": "Post-Interest Follow-up",
                "Related To": "${Tasks.What_Id}",
                "Owner": "${Tasks.Owner}",
            },
        },
    ]


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  Zoho CRM Task Automation — Deployment Validator")
    print("=" * 60)

    all_field_ids = {}
    all_valid = True

    for brand, config in BRANDS.items():
        client = ZohoClient(config)
        field_ids = validate_fields(client, brand)
        all_field_ids[brand] = field_ids
        if field_ids["missing"]:
            print(f"\n  ⚠ {brand.upper()} has missing fields: {field_ids['missing']}")
            all_valid = False

    if not all_valid:
        print("\n❌ Some fields are missing. Fix before proceeding.")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("  ✅ All fields validated across all 3 CRMs")
    print("=" * 60)

    # Generate workflow rule specs
    print("\n" + "=" * 60)
    print("  WORKFLOW RULES TO CREATE IN ZOHO CRM UI")
    print("  (Settings > Automation > Workflow Rules)")
    print("=" * 60)

    for brand in BRANDS:
        specs = generate_workflow_specs(brand, all_field_ids[brand])
        print(f"\n{'─'*50}")
        print(f"  {brand.upper()} — {len(specs)} rules")
        print(f"{'─'*50}")
        for i, spec in enumerate(specs, 1):
            print(f"\n  Rule {i}: {spec['name']}")
            print(f"  Trigger: {spec['trigger']}")
            print(f"  Condition: {spec['condition']}")
            print(f"  Action: {spec['action']}")
            print(f"  Task Details:")
            for k, v in spec["task_details"].items():
                print(f"    {k}: {v}")

    # Save specs to JSON for reference
    output = {}
    for brand in BRANDS:
        output[brand] = generate_workflow_specs(brand, all_field_ids[brand])

    output_path = os.path.join(os.path.dirname(__file__), "..", "Config", "crm_workflow_rules.json")
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"\n  Saved workflow specs to: {output_path}")

    # Field ID reference
    ref_path = os.path.join(os.path.dirname(__file__), "..", "Config", "crm_field_ids.json")
    with open(ref_path, "w") as f:
        json.dump(all_field_ids, f, indent=2)
    print(f"  Saved field ID reference to: {ref_path}")


if __name__ == "__main__":
    main()
