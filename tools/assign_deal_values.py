"""
Assign deal values to Zoho CRM leads based on their Meta Ads campaign.

Reads the campaign→package→deal_value mapping from Config/campaign_deal_value_mapping.json
and updates Leads/Deals in Zoho CRM where Ad_Campaign is set but Amount is missing.

Usage:
    python Tools/assign_deal_values.py --brand slimming     # Process one brand
    python Tools/assign_deal_values.py --brand all           # Process all brands
    python Tools/assign_deal_values.py --brand slimming --dry-run  # Preview without changes
    python Tools/assign_deal_values.py --brand slimming --backfill-deals  # Also update existing deals

Environment variables (per brand):
    ZOHO_CLIENT_ID_SLIMMING, ZOHO_CLIENT_SECRET_SLIMMING, ZOHO_REFRESH_TOKEN_SLIMMING
    ZOHO_CLIENT_ID_AESTHETICS, ZOHO_CLIENT_SECRET_AESTHETICS, ZOHO_REFRESH_TOKEN_AESTHETICS
    ZOHO_CLIENT_ID_SPA, ZOHO_CLIENT_SECRET_SPA, ZOHO_REFRESH_TOKEN_SPA
    ZOHO_API_DOMAIN (default: https://www.zohoapis.eu)

Alternatively, set creds via .env file in project root.
"""

import argparse
import json
import sys
import time
from pathlib import Path

import httpx

# Project root
ROOT = Path(__file__).resolve().parent.parent
CONFIG_PATH = ROOT / "Config" / "campaign_deal_value_mapping.json"

# Zoho CRM credentials per brand (from .mcp.json)
BRAND_CREDS = {
    "slimming": {
        "client_id": "1000.VUWMWRIW1IJM5ZZA6WTAUTBXQIDRLG",
        "client_secret": None,  # loaded from .mcp.json at runtime
        "refresh_token": None,
    },
    "aesthetics": {
        "client_id": "1000.MU7KOHIF9PLM1DDJXZD7VEZQ4GLS3M",
        "client_secret": None,
        "refresh_token": None,
    },
    "spa": {
        "client_id": "1000.5SF8C4FZ7LS7WYB12Q9GU7KNEPX91S",
        "client_secret": None,
        "refresh_token": None,
    },
}


def load_mcp_creds():
    """Load Zoho credentials from .mcp.json."""
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


class ZohoClient:
    """Lightweight Zoho CRM client for deal value assignment."""

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
        """Execute a COQL query and return all records."""
        self._ensure_token()
        resp = self._http.post(
            f"{self._base_url}/coql",
            headers=self._headers(),
            json={"select_query": query},
        )
        data = resp.json()
        return data.get("data", [])

    def update_records(self, module: str, records: list[dict]) -> dict:
        """Bulk update records in a module. Max 100 per call."""
        self._ensure_token()
        resp = self._http.put(
            f"{self._base_url}/{module}",
            headers=self._headers(),
            json={"data": records},
        )
        return resp.json()


def load_mapping() -> dict:
    """Load campaign→deal_value mapping config."""
    with open(CONFIG_PATH) as f:
        return json.load(f)


def build_campaign_lookup(brand_config: dict) -> dict:
    """Build a lookup dict: campaign_name → deal_value."""
    lookup = {}
    for campaign_name, info in brand_config.get("campaigns", {}).items():
        if info.get("campaign_id") != "TBC":
            lookup[campaign_name] = {
                "deal_value": info["deal_value"],
                "package_name": info["package_name"],
            }
    return lookup


def process_leads(client: ZohoClient, lookup: dict, dry_run: bool = False) -> dict:
    """Find leads with Ad_Campaign set and assign Expected_Deal_Value."""
    stats = {"found": 0, "updated": 0, "skipped": 0, "errors": 0}

    # Query leads that have an Ad_Campaign set
    leads = client.coql_query(
        "select id, Full_Name, Ad_Campaign, Ad_Campaign_ID, Lead_Form "
        "from Leads where Ad_Campaign is not null "
        "order by Created_Time desc limit 0, 200"
    )

    stats["found"] = len(leads)
    to_update = []

    for lead in leads:
        campaign = lead.get("Ad_Campaign", "")
        if campaign in lookup:
            deal_value = lookup[campaign]["deal_value"]
            package = lookup[campaign]["package_name"]
            to_update.append({
                "id": lead["id"],
                "Expected_Deal_Value": deal_value,
                "Package": package if len(package) <= 100 else package[:100],
            })
            print(f"  MATCH: {lead.get('Full_Name', 'N/A'):30} | Campaign: {campaign:25} | Value: EUR {deal_value}")
        else:
            stats["skipped"] += 1
            print(f"  SKIP:  {lead.get('Full_Name', 'N/A'):30} | Campaign: {campaign:25} | No mapping found")

    if to_update and not dry_run:
        # Update in batches of 100
        for i in range(0, len(to_update), 100):
            batch = to_update[i:i + 100]
            try:
                result = client.update_records("Leads", batch)
                updated = sum(1 for r in result.get("data", []) if r.get("status") == "success")
                errors = sum(1 for r in result.get("data", []) if r.get("status") != "success")
                stats["updated"] += updated
                stats["errors"] += errors
                if errors:
                    for r in result.get("data", []):
                        if r.get("status") != "success":
                            print(f"  ERROR: {r}")
            except Exception as e:
                print(f"  ERROR updating batch: {e}")
                stats["errors"] += len(batch)
    elif to_update:
        stats["updated"] = len(to_update)
        print(f"\n  DRY RUN: Would update {len(to_update)} leads")

    return stats


def process_deals(client: ZohoClient, lookup: dict, dry_run: bool = False) -> dict:
    """Find deals with no Amount and backfill from lead campaign mapping.

    Strategy: Deals and Leads are separate entities linked by name (not Zoho's
    standard lead conversion). So we:
    1. Get all leads with Ad_Campaign set → build name→campaign lookup
    2. Get all deals with null Amount
    3. Match deals to leads by name
    4. Update deal Amount based on campaign mapping
    """
    stats = {"found": 0, "updated": 0, "skipped": 0, "errors": 0}

    # Step 1: Build lead name → campaign lookup
    print("  Building lead name → campaign lookup...")
    lead_name_to_campaign = {}
    offset = 0
    while True:
        leads = client.coql_query(
            f"select Full_Name, Ad_Campaign from Leads "
            f"where Ad_Campaign is not null "
            f"order by Created_Time desc limit {offset}, 200"
        )
        for lead in leads:
            name = lead.get("Full_Name", "").strip().lower()
            campaign = lead.get("Ad_Campaign", "")
            if name and campaign:
                lead_name_to_campaign[name] = campaign
        if len(leads) < 200:
            break
        offset += 200

    print(f"  Found {len(lead_name_to_campaign)} leads with campaigns")

    # Step 2: Get deals with null Amount
    deals = client.coql_query(
        "select id, Deal_Name, Amount, Stage "
        "from Deals where Amount is null "
        "order by Created_Time desc limit 0, 200"
    )
    stats["found"] = len(deals)

    if not deals:
        print("  No deals with empty Amount found.")
        return stats

    # Step 3: Match deals to leads by name
    to_update = []
    for deal in deals:
        deal_name = deal.get("Deal_Name", "").strip().lower()
        campaign = lead_name_to_campaign.get(deal_name)

        if campaign and campaign in lookup:
            deal_value = lookup[campaign]["deal_value"]
            to_update.append({
                "id": deal["id"],
                "Amount": deal_value,
            })
            print(f"  MATCH: Deal '{deal.get('Deal_Name', '')}' ({deal.get('Stage', '')}) → EUR {deal_value}")
        else:
            stats["skipped"] += 1
            reason = "no lead match" if not campaign else f"campaign '{campaign}' not in mapping"
            print(f"  SKIP:  Deal '{deal.get('Deal_Name', '')}' — {reason}")

    # Step 4: Update
    if to_update and not dry_run:
        for i in range(0, len(to_update), 100):
            batch = to_update[i:i + 100]
            try:
                result = client.update_records("Deals", batch)
                updated = sum(1 for r in result.get("data", []) if r.get("status") == "success")
                errors = sum(1 for r in result.get("data", []) if r.get("status") != "success")
                stats["updated"] += updated
                stats["errors"] += errors
                if errors:
                    for r in result.get("data", []):
                        if r.get("status") != "success":
                            print(f"  ERROR: {r}")
            except Exception as e:
                print(f"  ERROR updating deals batch: {e}")
                stats["errors"] += len(batch)
    elif to_update:
        stats["updated"] = len(to_update)
        print(f"\n  DRY RUN: Would update {len(to_update)} deals")

    return stats


def main():
    parser = argparse.ArgumentParser(description="Assign deal values based on Meta Ads campaign mapping")
    parser.add_argument("--brand", required=True, choices=["slimming", "aesthetics", "spa", "all"])
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without updating CRM")
    parser.add_argument("--backfill-deals", action="store_true", help="Also update Deal Amount for existing deals")
    args = parser.parse_args()

    # Load credentials and mapping
    load_mcp_creds()
    mapping = load_mapping()

    brands = ["slimming", "aesthetics", "spa"] if args.brand == "all" else [args.brand]

    for brand in brands:
        brand_config = mapping.get(brand, {})
        if not brand_config.get("campaigns"):
            print(f"\n[{brand.upper()}] No campaign mapping configured. Skipping.")
            continue

        lookup = build_campaign_lookup(brand_config)
        if not lookup:
            print(f"\n[{brand.upper()}] No confirmed campaigns (all TBC). Skipping.")
            continue

        print(f"\n{'=' * 60}")
        print(f"  {brand.upper()} — Processing {len(lookup)} campaigns")
        print(f"{'=' * 60}")

        try:
            client = ZohoClient(brand)

            # Always process deals (Amount field exists natively)
            print(f"\n--- Deals ---")
            deal_stats = process_deals(client, lookup, dry_run=args.dry_run)
            print(f"\n  Deals: {deal_stats['found']} found, {deal_stats['updated']} updated, "
                  f"{deal_stats['skipped']} skipped, {deal_stats['errors']} errors")

            # Optionally process leads (requires Expected_Deal_Value custom field)
            if args.backfill_deals:
                print(f"\n--- Leads ---")
                lead_stats = process_leads(client, lookup, dry_run=args.dry_run)
                print(f"\n  Leads: {lead_stats['found']} found, {lead_stats['updated']} updated, "
                      f"{lead_stats['skipped']} skipped, {lead_stats['errors']} errors")

        except Exception as e:
            print(f"\n  ERROR connecting to {brand} CRM: {e}")

    print(f"\n{'=' * 60}")
    print("  Done.")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
