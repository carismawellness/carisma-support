"""
Setup Lead Qualification Scoring across all 3 Zoho CRM instances.

Creates:
  1. Lead_Score (integer) field
  2. Lead_Temperature (picklist: Hot / Warm / Nurture) field
  3. Response_Time_Minutes field (Spa & Slimming only — Aesthetics already has it)

Scoring model (max 105 pts):
  - Experienced before (Is_this_something_you_ve_experienced_before): up to +20
  - Timeline (How_soon_would_you_like_to_get_started): up to +30
  - Response time (Response_Time_Minutes): up to +25
  - Referral (Lead_Source): +15
  - Intent (What_would_help_you_most_right_now): up to +15

Thresholds:
  60+ = Hot, 30-59 = Warm, <30 = Nurture
"""

import httpx
import json
import sys

# ── Credentials ──────────────────────────────────────────────
BRANDS = {
    "spa": {
        "client_id": "1000.5SF8C4FZ7LS7WYB12Q9GU7KNEPX91S",
        "client_secret": "2e11ff9968510d815d01ee9ece65c5582b7212941a",
        "refresh_token": "1000.30e19005b25db6cec0b7267524548213.a5394cb5131f3c6b2d0a225ea7071825",
        "api_domain": "https://www.zohoapis.eu",
        "needs_response_time": True,
    },
    "aesthetics": {
        "client_id": "1000.MU7KOHIF9PLM1DDJXZD7VEZQ4GLS3M",
        "client_secret": "7eb15914cb91b68fd72ca5e7c0facd7e1a37266ddc",
        "refresh_token": "1000.56911465cc4c1c50a20c7eeb28785027.39f0aa6b5f613c35fdfbe55eb77e5d87",
        "api_domain": "https://www.zohoapis.eu",
        "needs_response_time": False,  # Already has it
    },
    "slimming": {
        "client_id": "1000.VUWMWRIW1IJM5ZZA6WTAUTBXQIDRLG",
        "client_secret": "89cfa558cdc38ad23ef0623b9d287e777ab60b8dd9",
        "refresh_token": "1000.c517d2a9ad1b1db141b9d6cc048c9649.e59f2289d9c14e2220e13c7cfe2a3047",
        "api_domain": "https://www.zohoapis.eu",
        "needs_response_time": True,
    },
}

REFERRAL_SOURCES = {"External Referral", "Employee Referral"}


def get_access_token(brand_config: dict) -> str:
    """Get a fresh access token via refresh token grant."""
    domain_suffix = brand_config["api_domain"].replace("https://www.zohoapis.", "")
    accounts_url = f"https://accounts.zoho.{domain_suffix}/oauth/v2/token"
    resp = httpx.post(accounts_url, data={
        "grant_type": "refresh_token",
        "client_id": brand_config["client_id"],
        "client_secret": brand_config["client_secret"],
        "refresh_token": brand_config["refresh_token"],
    })
    data = resp.json()
    if "access_token" not in data:
        raise RuntimeError(f"Token refresh failed: {data}")
    return data["access_token"]


def api_request(token: str, domain: str, method: str, path: str,
                params: dict = None, body: dict = None) -> dict:
    """Make an authenticated Zoho CRM API request."""
    url = f"{domain}/crm/v7{path}"
    headers = {"Authorization": f"Zoho-oauthtoken {token}"}
    resp = httpx.request(method, url, headers=headers, params=params, json=body, timeout=30)
    if resp.status_code == 204:
        return {"status": "no_content"}
    return resp.json()


def check_field_exists(token: str, domain: str, field_api_name: str) -> bool:
    """Check if a field already exists in Leads module."""
    result = api_request(token, domain, "GET", "/settings/fields", params={"module": "Leads"})
    fields = result.get("fields", [])
    return any(f["api_name"] == field_api_name for f in fields)


def create_field(token: str, domain: str, field_def: dict) -> dict:
    """Create a custom field in Leads module."""
    return api_request(token, domain, "POST", "/settings/fields",
                       params={"module": "Leads"}, body={"fields": [field_def]})


def setup_fields(brand_name: str, token: str, domain: str, needs_response_time: bool):
    """Create the scoring fields for a brand."""
    print(f"\n{'='*60}")
    print(f"  Setting up fields for: {brand_name.upper()}")
    print(f"{'='*60}")

    # 1. Qualification Score (integer) — "Lead Score" is a Zoho reserved keyword
    if check_field_exists(token, domain, "Qualification_Score"):
        print(f"  [SKIP] Qualification_Score already exists")
    else:
        result = create_field(token, domain, {
            "field_label": "Qualification Score",
            "data_type": "integer",
            "length": 9,
        })
        print(f"  [CREATE] Qualification_Score: {json.dumps(result, indent=2)}")

    # 2. Lead Temperature (picklist)
    if check_field_exists(token, domain, "Lead_Temperature"):
        print(f"  [SKIP] Lead_Temperature already exists")
    else:
        result = create_field(token, domain, {
            "field_label": "Lead Temperature",
            "data_type": "picklist",
            "pick_list_values": [
                {"display_value": "Hot", "actual_value": "Hot"},
                {"display_value": "Warm", "actual_value": "Warm"},
                {"display_value": "Nurture", "actual_value": "Nurture"},
            ],
        })
        print(f"  [CREATE] Lead_Temperature: {json.dumps(result, indent=2)}")

    # 3. Response_Time_Minutes (double) — only if needed
    if needs_response_time:
        if check_field_exists(token, domain, "Response_Time_Minutes"):
            print(f"  [SKIP] Response_Time_Minutes already exists")
        else:
            result = create_field(token, domain, {
                "field_label": "Response Time (Minutes)",
                "data_type": "double",
                "length": 9,
                "decimal_place": 1,
            })
            print(f"  [CREATE] Response_Time_Minutes: {json.dumps(result, indent=2)}")
    else:
        print(f"  [SKIP] Response_Time_Minutes already exists (Aesthetics)")


def calculate_score_for_lead(lead: dict) -> tuple[int, str]:
    """Calculate the lead qualification score for a single lead record."""
    score = 0

    # Factor 1: Experienced before (+20 max)
    exp = lead.get("Is_this_something_you_ve_experienced_before", "")
    if exp == "Yes, it's something I do regularly":
        score += 20
    elif exp == "Yes, I've tried it before":
        score += 15
    elif exp == "No, this would be a first for me":
        score += 5

    # Factor 2: Timeline (+30 max)
    timeline = lead.get("How_soon_would_you_like_to_get_started", "")
    if timeline == "This week":
        score += 30
    elif timeline == "Within 2 weeks":
        score += 20
    elif timeline == "This month":
        score += 10

    # Factor 3: Response time (+25 max)
    response_mins = lead.get("Response_Time_Minutes")
    if response_mins is not None:
        try:
            mins = float(response_mins)
            if mins <= 60:
                score += 25
            elif mins <= 240:
                score += 10
        except (ValueError, TypeError):
            pass

    # Factor 4: Referral (+15)
    source = lead.get("Lead_Source", "")
    if source in REFERRAL_SOURCES:
        score += 15

    # Factor 5: Intent (+15 max)
    intent = lead.get("What_would_help_you_most_right_now", "")
    if intent == "I'm ready to book":
        score += 15
    elif intent == "I'd like to speak with someone":
        score += 10
    elif intent == "I'd like to know more":
        score += 5

    # Temperature
    if score >= 60:
        temp = "Hot"
    elif score >= 30:
        temp = "Warm"
    else:
        temp = "Nurture"

    return score, temp


def _fetch_and_score_batch(token: str, domain: str, leads: list) -> tuple[int, int]:
    """Score a batch of leads and update them. Returns (success_count, fail_count)."""
    updates = []
    for lead in leads:
        score, temp = calculate_score_for_lead(lead)
        updates.append({
            "id": lead["id"],
            "Qualification_Score": score,
            "Lead_Temperature": temp,
        })

    success_total = 0
    fail_total = 0
    for i in range(0, len(updates), 100):
        batch = updates[i:i+100]
        update_result = api_request(token, domain, "PUT", "/Leads",
                                    body={"data": batch})
        if "data" not in update_result:
            fail_total += len(batch)
            continue
        success_total += sum(1 for r in update_result["data"]
                             if r.get("status") == "success")
        fail_total += sum(1 for r in update_result["data"]
                          if r.get("status") != "success")
    return success_total, fail_total


def score_all_leads(brand_name: str, token: str, domain: str):
    """Score all existing leads using COQL to find unscored ones."""
    print(f"\n  Scoring existing leads for {brand_name.upper()}...")

    total_updated = 0
    offset = 0
    batch_size = 200
    fields = ("id,Is_this_something_you_ve_experienced_before,"
              "How_soon_would_you_like_to_get_started,"
              "Response_Time_Minutes,Lead_Source,"
              "What_would_help_you_most_right_now")

    while True:
        # Use COQL to find unscored leads
        query = (f"select {fields} from Leads "
                 f"where Qualification_Score is null "
                 f"limit {offset}, {batch_size}")
        result = api_request(token, domain, "POST", "/coql",
                             body={"select_query": query})
        leads = result.get("data", [])
        if not leads:
            break

        ok, fail = _fetch_and_score_batch(token, domain, leads)
        total_updated += ok
        print(f"    Batch: {ok} scored, {fail} failed (offset {offset})")

        more = result.get("info", {}).get("more_records", False)
        if not more:
            break
        offset += batch_size

    if total_updated == 0:
        print(f"  All leads already scored for {brand_name.upper()}")
    else:
        print(f"  Total: {total_updated} leads scored for {brand_name.upper()}")
    return total_updated


def create_workflow_rule(token: str, domain: str, brand_name: str):
    """Create a workflow rule to auto-score leads on create/edit.

    Note: Zoho CRM API may not support workflow rule creation on all plans.
    If this fails, the scoring can be run via the script periodically.
    """
    print(f"\n  Setting up workflow rule for {brand_name.upper()}...")

    # Check existing workflow rules
    result = api_request(token, domain, "GET", "/settings/workflow_rules",
                         params={"module": "Leads"})
    rules = result.get("workflow_rules", [])
    for rule in rules:
        if rule.get("name") == "Auto Lead Qualification Score":
            print(f"  [SKIP] Workflow rule already exists (id: {rule['id']})")
            return

    # Try to create the workflow rule via API
    rule_body = {
        "workflow_rules": [{
            "name": "Auto Lead Qualification Score",
            "description": "Calculates Qualification Score and Lead Temperature on lead create/edit",
            "trigger": {
                "type": "record_action",
                "record_action": {
                    "type": "create_or_edit"
                }
            },
        }]
    }
    result = api_request(token, domain, "POST", "/settings/workflow_rules",
                         params={"module": "Leads"}, body=rule_body)
    print(f"  Workflow rule creation: {json.dumps(result, indent=2)}")


def main():
    """Main entry point."""
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"
    brands_to_process = [mode] if mode in BRANDS else list(BRANDS.keys())

    print("Lead Qualification Scoring Setup")
    print("================================")
    print(f"Brands: {', '.join(brands_to_process)}")
    print(f"Max score: 105 | Hot: 60+ | Warm: 30-59 | Nurture: <30")

    for brand_name in brands_to_process:
        config = BRANDS[brand_name]
        token = get_access_token(config)
        domain = config["api_domain"]

        # Step 1: Create fields
        setup_fields(brand_name, token, domain, config["needs_response_time"])

        # Step 2: Score all existing leads
        score_all_leads(brand_name, token, domain)

        # Step 3: Create workflow rule for auto-scoring
        create_workflow_rule(token, domain, brand_name)

    print("\n" + "="*60)
    print("  DONE — All brands scored!")
    print("="*60)


if __name__ == "__main__":
    main()
