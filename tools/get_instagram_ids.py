#!/usr/bin/env python3
"""
Retrieve Instagram Business Account IDs linked to Facebook Pages
and update config/brands.json.

Usage:
    META_ACCESS_TOKEN=<token> python3 tools/get_instagram_ids.py

Requires a valid Meta Page Access Token with pages_show_list
and instagram_basic permissions.
"""
import json
import os
import sys
import urllib.request
import urllib.error

GRAPH_API_VERSION = "v21.0"
GRAPH_API_BASE = f"https://graph.facebook.com/{GRAPH_API_VERSION}"

BRAND_CONFIG_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "config", "brands.json"
)


def graph_get(endpoint: str, token: str) -> dict:
    url = f"{GRAPH_API_BASE}/{endpoint}?fields=instagram_business_account&access_token={token}"
    req = urllib.request.Request(url, method="GET")
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"ERROR: {e.code}: {error_body}", file=sys.stderr)
        return {}


def main():
    token = os.environ.get("META_ACCESS_TOKEN")
    if not token:
        print("ERROR: META_ACCESS_TOKEN not set", file=sys.stderr)
        sys.exit(1)

    with open(BRAND_CONFIG_PATH) as f:
        data = json.load(f)

    updated = 0
    for brand in data["brands"]:
        page_id = brand["meta_page_id"]
        brand_name = brand["brand_name"]
        print(f"Querying {brand_name} (page {page_id})...")

        result = graph_get(page_id, token)
        ig_account = result.get("instagram_business_account", {})
        ig_id = ig_account.get("id")

        if ig_id:
            brand["instagram_account_id"] = ig_id
            print(f"  -> Instagram Business Account: {ig_id}")
            updated += 1
        else:
            print(f"  -> No Instagram Business Account linked")

    if updated > 0:
        data["_metadata"]["last_updated"] = "2026-03-31"
        data["_metadata"]["updated_by"] = "get_instagram_ids"
        with open(BRAND_CONFIG_PATH, "w") as f:
            json.dump(data, f, indent=2)
        print(f"\nUpdated {updated} brand(s) in brands.json")
    else:
        print("\nNo updates made — no Instagram accounts found")


if __name__ == "__main__":
    main()
