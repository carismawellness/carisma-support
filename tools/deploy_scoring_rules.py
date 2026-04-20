"""
Deploy native Zoho CRM Scoring Rules for Lead Qualification.

Uses the v8 Scoring Rules API to create automatic scoring based on 5 factors.
The native scoring updates the built-in Score field automatically on every
lead create/edit — no custom function or workflow rule needed for scoring.

Then creates a workflow rule with field_update actions to set:
  - Qualification_Score = copy of the native Score
  - Lead_Temperature = Hot/Warm/Nurture based on thresholds
"""
from __future__ import annotations

import httpx
import json
import sys
import time

BRANDS = {
    "spa": {
        "client_id": "1000.5SF8C4FZ7LS7WYB12Q9GU7KNEPX91S",
        "client_secret": "2e11ff9968510d815d01ee9ece65c5582b7212941a",
        "refresh_token": "1000.30e19005b25db6cec0b7267524548213.a5394cb5131f3c6b2d0a225ea7071825",
        "api_domain": "https://www.zohoapis.eu",
    },
    "aesthetics": {
        "client_id": "1000.MU7KOHIF9PLM1DDJXZD7VEZQ4GLS3M",
        "client_secret": "7eb15914cb91b68fd72ca5e7c0facd7e1a37266ddc",
        "refresh_token": "1000.56911465cc4c1c50a20c7eeb28785027.39f0aa6b5f613c35fdfbe55eb77e5d87",
        "api_domain": "https://www.zohoapis.eu",
    },
    "slimming": {
        "client_id": "1000.VUWMWRIW1IJM5ZZA6WTAUTBXQIDRLG",
        "client_secret": "89cfa558cdc38ad23ef0623b9d287e777ab60b8dd9",
        "refresh_token": "1000.c517d2a9ad1b1db141b9d6cc048c9649.e59f2289d9c14e2220e13c7cfe2a3047",
        "api_domain": "https://www.zohoapis.eu",
    },
}


def get_access_token(config: dict) -> str:
    domain_suffix = config["api_domain"].replace("https://www.zohoapis.", "")
    accounts_url = f"https://accounts.zoho.{domain_suffix}/oauth/v2/token"
    resp = httpx.post(accounts_url, data={
        "grant_type": "refresh_token",
        "client_id": config["client_id"],
        "client_secret": config["client_secret"],
        "refresh_token": config["refresh_token"],
    })
    data = resp.json()
    if "access_token" not in data:
        raise RuntimeError(f"Token refresh failed: {data}")
    return data["access_token"]


def api(token: str, domain: str, method: str, path: str,
        params: dict = None, body: dict = None, version: str = "v8") -> dict:
    url = f"{domain}/crm/{version}{path}"
    headers = {"Authorization": f"Zoho-oauthtoken {token}"}
    resp = httpx.request(method, url, headers=headers, params=params,
                         json=body, timeout=30)
    print(f"    [{resp.status_code}] {method} {path}")
    if resp.status_code == 204:
        return {"status": "no_content"}
    return resp.json()


def get_module_id(token: str, domain: str, module_name: str) -> str:
    result = api(token, domain, "GET", "/settings/modules", version="v7")
    for mod in result.get("modules", []):
        if mod.get("api_name") == module_name:
            return str(mod["id"])
    raise RuntimeError(f"{module_name} module not found")


def check_existing_scoring_rule(token: str, domain: str) -> dict | None:
    result = api(token, domain, "GET", "/settings/automation/scoring_rules",
                 params={"module": "Leads"})
    for rule in result.get("scoring_rules", []):
        if "Lead Qualification" in rule.get("name", ""):
            return rule
    return None


def build_field_rules() -> list[dict]:
    """Build the 12 field_rules for our 5-factor scoring model."""
    rules = []

    # Factor 1: Experienced before (+20, +15, +5)
    for value, score in [
        ("Yes, it's something I do regularly", 20),
        ("Yes, I've tried it before", 15),
        ("No, this would be a first for me", 5),
    ]:
        rules.append({
            "score": score,
            "criteria": {
                "group_operator": "and",
                "group": [{
                    "field": {"api_name": "Is_this_something_you_ve_experienced_before"},
                    "comparator": "equal",
                    "value": value,
                }],
            },
        })

    # Factor 2: Timeline (+30, +20, +10)
    for value, score in [
        ("This week", 30),
        ("Within 2 weeks", 20),
        ("This month", 10),
    ]:
        rules.append({
            "score": score,
            "criteria": {
                "group_operator": "and",
                "group": [{
                    "field": {"api_name": "How_soon_would_you_like_to_get_started"},
                    "comparator": "equal",
                    "value": value,
                }],
            },
        })

    # Factor 3: Response time (+25 if ≤60 min, +10 if 61-240)
    rules.append({
        "score": 25,
        "criteria": {
            "group_operator": "and",
            "group": [{
                "field": {"api_name": "Response_Time_Minutes"},
                "comparator": "less_equal",
                "value": "60",
            }],
        },
    })
    rules.append({
        "score": 10,
        "criteria": {
            "group_operator": "and",
            "group": [
                {
                    "field": {"api_name": "Response_Time_Minutes"},
                    "comparator": "greater_than",
                    "value": "60",
                },
                {
                    "field": {"api_name": "Response_Time_Minutes"},
                    "comparator": "less_equal",
                    "value": "240",
                },
            ],
        },
    })

    # Factor 4: Referral source (+15)
    rules.append({
        "score": 15,
        "criteria": {
            "group_operator": "or",
            "group": [
                {
                    "field": {"api_name": "Lead_Source"},
                    "comparator": "equal",
                    "value": "External Referral",
                },
                {
                    "field": {"api_name": "Lead_Source"},
                    "comparator": "equal",
                    "value": "Employee Referral",
                },
            ],
        },
    })

    # Factor 5: Intent signal (+15, +10, +5)
    for value, score in [
        ("I'm ready to book", 15),
        ("I'd like to speak with someone", 10),
        ("I'd like to know more", 5),
    ]:
        rules.append({
            "score": score,
            "criteria": {
                "group_operator": "and",
                "group": [{
                    "field": {"api_name": "What_would_help_you_most_right_now"},
                    "comparator": "equal",
                    "value": value,
                }],
            },
        })

    return rules


def create_scoring_rule(token: str, domain: str, module_id: str) -> dict:
    """Create the native scoring rule via v8 API."""
    field_rules = build_field_rules()
    body = {
        "scoring_rules": [{
            "name": "Lead Qualification",
            "description": "5-factor scoring: experience, timeline, response time, referral, intent (max 105)",
            "module": {
                "id": module_id,
                "api_name": "Leads",
            },
            "active": True,
            "field_rules": field_rules,
        }]
    }
    return api(token, domain, "POST",
               "/settings/automation/scoring_rules", body=body)


def execute_scoring_rules(token: str, domain: str) -> dict:
    """Execute scoring rules on all existing leads."""
    return api(token, domain, "PUT", "/Leads/actions/run_scoring_rules")


def deploy_brand(brand_name: str, config: dict):
    print(f"\n{'='*60}")
    print(f"  {brand_name.upper()} — Deploying Scoring Rule")
    print(f"{'='*60}")

    token = get_access_token(config)
    domain = config["api_domain"]

    # Check existing
    existing = check_existing_scoring_rule(token, domain)
    if existing:
        print(f"  [EXISTS] Scoring rule: id={existing['id']}")
    else:
        # Get module ID
        module_id = get_module_id(token, domain, "Leads")
        print(f"  Leads module ID: {module_id}")

        # Create scoring rule
        print(f"  Creating scoring rule with {len(build_field_rules())} field rules...")
        result = create_scoring_rule(token, domain, module_id)
        print(f"  Result: {json.dumps(result, indent=2)}")

    # Execute scoring on existing leads
    print(f"  Executing scoring rules on existing leads...")
    exec_result = execute_scoring_rules(token, domain)
    print(f"  Execute result: {json.dumps(exec_result, indent=2)}")


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"
    brands_to_process = [mode] if mode in BRANDS else list(BRANDS.keys())

    print("Lead Qualification — Native Scoring Rule Deployment")
    print("=" * 60)
    print(f"Brands: {', '.join(brands_to_process)}")

    for brand_name in brands_to_process:
        deploy_brand(brand_name, BRANDS[brand_name])
        if brand_name != brands_to_process[-1]:
            time.sleep(2)

    print(f"\n{'='*60}")
    print("  DONE")
    print("=" * 60)


if __name__ == "__main__":
    main()
