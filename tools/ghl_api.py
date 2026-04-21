"""
GoHighLevel API v2 client.
Uses Private Integration Token (PIT) from .env.
All endpoints require GHL_LOCATION_ID to be set.
"""

import os
import sys
import json
import argparse
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GHL_API_KEY")
LOCATION_ID = os.getenv("GHL_LOCATION_ID")
BASE_URL = os.getenv("GHL_BASE_URL", "https://services.leadconnectorhq.com")

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Version": "2021-07-28",
    "Content-Type": "application/json",
}


def _get(path, params=None):
    params = params or {}
    if LOCATION_ID:
        params.setdefault("locationId", LOCATION_ID)
    r = requests.get(f"{BASE_URL}{path}", headers=HEADERS, params=params)
    r.raise_for_status()
    return r.json()


def _post(path, data):
    if LOCATION_ID and "locationId" not in data:
        data["locationId"] = LOCATION_ID
    r = requests.post(f"{BASE_URL}{path}", headers=HEADERS, json=data)
    r.raise_for_status()
    return r.json()


def _put(path, data):
    r = requests.put(f"{BASE_URL}{path}", headers=HEADERS, json=data)
    r.raise_for_status()
    return r.json()


def _delete(path):
    r = requests.delete(f"{BASE_URL}{path}", headers=HEADERS)
    r.raise_for_status()
    return r.json()


# ── CONTACTS ──────────────────────────────────────────────────────────────────

def search_contacts(query, limit=20):
    return _get("/contacts/search", {"query": query, "limit": limit})


def get_contact(contact_id):
    return _get(f"/contacts/{contact_id}")


def create_contact(data: dict):
    """data: {firstName, lastName, email, phone, tags[], customFields[]}"""
    return _post("/contacts/", data)


def update_contact(contact_id, data: dict):
    return _put(f"/contacts/{contact_id}", data)


def upsert_contact(data: dict):
    """Create or update by email/phone match."""
    return _post("/contacts/upsert", data)


def add_contact_tags(contact_id, tags: list):
    return _post(f"/contacts/{contact_id}/tags", {"tags": tags})


def add_contact_to_workflow(contact_id, workflow_id):
    return _post(f"/contacts/{contact_id}/workflow/{workflow_id}", {})


# ── OPPORTUNITIES (PIPELINE) ───────────────────────────────────────────────────

def get_pipelines():
    return _get("/opportunities/pipelines")


def search_opportunities(params: dict = None):
    return _get("/opportunities/search", params)


def create_opportunity(data: dict):
    """data: {pipelineId, pipelineStageId, contactId, name, status, monetaryValue}"""
    return _post("/opportunities/", data)


def update_opportunity(opportunity_id, data: dict):
    return _put(f"/opportunities/{opportunity_id}", data)


# ── CONVERSATIONS ─────────────────────────────────────────────────────────────

def get_conversations(params: dict = None):
    return _get("/conversations/search", params)


def send_message(conversation_id, message_type, body):
    """message_type: SMS | Email | WhatsApp"""
    return _post(f"/conversations/{conversation_id}/messages", {
        "type": message_type,
        "message": body,
    })


# ── CALENDARS & APPOINTMENTS ──────────────────────────────────────────────────

def get_calendars():
    return _get("/calendars/")


def get_appointments(params: dict = None):
    return _get("/calendars/events/appointments", params)


def create_appointment(data: dict):
    return _post("/calendars/events/appointments", data)


# ── FORMS & SURVEYS ───────────────────────────────────────────────────────────

def get_forms():
    return _get("/forms/")


def get_form_submissions(form_id, params: dict = None):
    return _get(f"/forms/{form_id}/submissions", params)


# ── CUSTOM VALUES & FIELDS ────────────────────────────────────────────────────

def get_custom_fields(model="contact"):
    return _get("/custom-fields/", {"model": model})


# ── WORKFLOWS ─────────────────────────────────────────────────────────────────

def get_workflows():
    return _get("/workflows/")


# ── TEST ──────────────────────────────────────────────────────────────────────

def test_connection():
    if not API_KEY:
        print("❌ GHL_API_KEY not set in .env")
        return False
    if not LOCATION_ID:
        print("⚠️  GHL_LOCATION_ID not set — most endpoints will fail")
        print("   Find it in GHL → Settings → Business Info → Location ID")
        return False
    try:
        result = _get("/contacts/", {"limit": 1})
        count = result.get("meta", {}).get("total", "?")
        print(f"✅ GHL connection OK — location {LOCATION_ID} — {count} total contacts")
        return True
    except requests.HTTPError as e:
        print(f"❌ HTTP {e.response.status_code}: {e.response.text}")
        return False


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="GoHighLevel API tool")
    parser.add_argument("action", nargs="?", default="test",
                        choices=["test", "contacts", "pipelines", "calendars", "workflows", "custom-fields"])
    parser.add_argument("--query", help="Search query for contacts")
    parser.add_argument("--limit", type=int, default=10)
    args = parser.parse_args()

    if args.action == "test":
        test_connection()
    elif args.action == "contacts":
        if args.query:
            print(json.dumps(search_contacts(args.query, args.limit), indent=2))
        else:
            print(json.dumps(_get("/contacts/", {"limit": args.limit}), indent=2))
    elif args.action == "pipelines":
        print(json.dumps(get_pipelines(), indent=2))
    elif args.action == "calendars":
        print(json.dumps(get_calendars(), indent=2))
    elif args.action == "workflows":
        print(json.dumps(get_workflows(), indent=2))
    elif args.action == "custom-fields":
        print(json.dumps(get_custom_fields(), indent=2))
