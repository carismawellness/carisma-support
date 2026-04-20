"""
Deploy Lead Temperature workflow rules via Zoho CRM v8 API.

Creates workflow rules that set Lead_Temperature (Hot/Warm/Nurture)
based on the native Score field updated by the scoring rules.

Approach:
  1. Create 3 field_update actions (set temp to Hot, Warm, Nurture)
  2. Create 3 workflow rules triggered by score_update:
     - Score >= 60 → Hot
     - Score >= 30 AND < 60 → Warm
     - Score < 30 → Nurture
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
        "temp_field_id": "189957000054200258",
    },
    "aesthetics": {
        "client_id": "1000.MU7KOHIF9PLM1DDJXZD7VEZQ4GLS3M",
        "client_secret": "7eb15914cb91b68fd72ca5e7c0facd7e1a37266ddc",
        "refresh_token": "1000.56911465cc4c1c50a20c7eeb28785027.39f0aa6b5f613c35fdfbe55eb77e5d87",
        "api_domain": "https://www.zohoapis.eu",
        "temp_field_id": "524228000043856006",
    },
    "slimming": {
        "client_id": "1000.VUWMWRIW1IJM5ZZA6WTAUTBXQIDRLG",
        "client_secret": "89cfa558cdc38ad23ef0623b9d287e777ab60b8dd9",
        "refresh_token": "1000.c517d2a9ad1b1db141b9d6cc048c9649.e59f2289d9c14e2220e13c7cfe2a3047",
        "api_domain": "https://www.zohoapis.eu",
        "temp_field_id": "956933000003969099",
    },
}

TEMPERATURE_RULES = [
    {
        "name": "Set Temp Hot",
        "value": "Hot",
        "criteria": {
            "group_operator": "and",
            "group": [{
                "field": {"api_name": "Positive_Score"},
                "comparator": "greater_equal",
                "value": "60",
            }],
        },
    },
    {
        "name": "Set Temp Warm",
        "value": "Warm",
        "criteria": {
            "group_operator": "and",
            "group": [
                {
                    "field": {"api_name": "Positive_Score"},
                    "comparator": "greater_equal",
                    "value": "30",
                },
                {
                    "field": {"api_name": "Positive_Score"},
                    "comparator": "less_than",
                    "value": "60",
                },
            ],
        },
    },
    {
        "name": "Set Temp Nurture",
        "value": "Nurture",
        "criteria": {
            "group_operator": "and",
            "group": [{
                "field": {"api_name": "Positive_Score"},
                "comparator": "less_than",
                "value": "30",
            }],
        },
    },
]


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
        params: dict = None, body: dict = None) -> dict:
    url = f"{domain}/crm/v8{path}"
    headers = {"Authorization": f"Zoho-oauthtoken {token}"}
    resp = httpx.request(method, url, headers=headers, params=params,
                         json=body, timeout=30)
    print(f"    [{resp.status_code}] {method} {path}")
    if resp.status_code == 204:
        return {"status": "no_content"}
    return resp.json()


def get_module_id(token: str, domain: str) -> str:
    result = api(token, domain, "GET", "/settings/modules")
    for mod in result.get("modules", []):
        if mod.get("api_name") == "Leads":
            return str(mod["id"])
    raise RuntimeError("Leads module not found")


def create_field_update(token: str, domain: str, module_id: str,
                        temp_field_id: str, name: str, value: str) -> str | None:
    """Create a field_update action and return its ID."""
    body = {
        "field_updates": [{
            "module": {
                "api_name": "Leads",
                "id": module_id,
            },
            "type": "static",
            "feature_type": "workflow",
            "field": {
                "api_name": "Lead_Temperature",
                "id": temp_field_id,
            },
            "name": name,
            "value": value,
        }]
    }
    result = api(token, domain, "POST",
                 "/settings/automation/field_updates", body=body)
    updates = result.get("field_updates", [])
    if updates and updates[0].get("status") == "success":
        return updates[0]["details"]["id"]
    print(f"    FAILED: {json.dumps(result, indent=2)}")
    return None


def create_workflow_rule(token: str, domain: str, module_id: str,
                         rule_name: str, criteria: dict,
                         field_update_id: str) -> dict:
    """Create a workflow rule triggered by score_update."""
    body = {
        "workflow_rules": [{
            "name": rule_name,
            "description": f"Sets Lead Temperature based on Score thresholds",
            "module": {
                "api_name": "Leads",
                "id": module_id,
            },
            "execute_when": {
                "type": "create_or_edit",
                "details": {
                    "trigger_module": {
                        "api_name": "Leads",
                        "id": module_id,
                    },
                    "repeat": True,
                },
            },
            "conditions": [{
                "sequence_number": 1,
                "criteria_details": {
                    "criteria": criteria,
                },
                "instant_actions": {
                    "actions": [{
                        "type": "field_updates",
                        "id": field_update_id,
                    }],
                },
            }],
        }]
    }
    return api(token, domain, "POST",
               "/settings/automation/workflow_rules", body=body)


def deploy_brand(brand_name: str, config: dict):
    print(f"\n{'='*60}")
    print(f"  {brand_name.upper()} — Deploying Temperature Rules")
    print(f"{'='*60}")

    token = get_access_token(config)
    domain = config["api_domain"]
    module_id = get_module_id(token, domain)
    temp_field_id = config["temp_field_id"]
    print(f"  Module ID: {module_id}")

    for rule in TEMPERATURE_RULES:
        print(f"\n  --- {rule['name']} ({rule['value']}) ---")

        # Create field update action
        fu_id = create_field_update(
            token, domain, module_id, temp_field_id,
            rule["name"], rule["value"]
        )
        if not fu_id:
            print(f"  SKIP workflow rule — field update failed")
            continue
        print(f"  Field update ID: {fu_id}")

        # Create workflow rule
        result = create_workflow_rule(
            token, domain, module_id,
            f"Lead Temp: {rule['value']}",
            rule["criteria"], fu_id
        )
        wf_rules = result.get("workflow_rules", [])
        if wf_rules and wf_rules[0].get("status") == "success":
            print(f"  Workflow rule created: {wf_rules[0]['details']['id']}")
        else:
            print(f"  Result: {json.dumps(result, indent=2)}")

        time.sleep(1)


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"
    brands_to_process = [mode] if mode in BRANDS else list(BRANDS.keys())

    print("Lead Temperature — Workflow Rule Deployment")
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
