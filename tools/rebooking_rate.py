"""
Rebooking Rate Calculator for Zoho CRM.

Calculates what % of clients rebook within the brand-specific window.
Outputs a monthly breakdown suitable for dashboards or Google Sheets.

Usage:
    python3 Tools/rebooking_rate.py --brand spa
    python3 Tools/rebooking_rate.py --brand all
    python3 Tools/rebooking_rate.py --brand all --months 6

How it works:
    For each month, it looks at all contacts whose rebooking window expired
    that month and checks whether they had a subsequent deal before expiry.

    Rebooking Rate = (clients who rebooked in time) / (clients whose window expired) * 100

Targets:
    Spa:        45%+  (industry benchmark: 30-40%)
    Aesthetics: 65%+  (industry benchmark: 50-60%)
    Slimming:   55%+  (industry benchmark: 40-50% renewal)
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

import httpx

ROOT = Path(__file__).resolve().parent.parent

REBOOKING_WINDOWS = {
    "spa": 90,
    "aesthetics": 120,
    "slimming": 60,
}

CLOSED_WON_STAGES = {
    "spa": ["Closed Won"],
    "aesthetics": ["Booking closed won", "Members Closed Won", "Consultation - won"],
    "slimming": ["Booking closed won", "Members Closed Won", "Consultation - won"],
}

TARGETS = {
    "spa": 45.0,
    "aesthetics": 65.0,
    "slimming": 55.0,
}

BRAND_CREDS = {}


def load_mcp_creds():
    mcp_path = ROOT / ".mcp.json"
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
        self._ensure_token()
        all_records = []
        offset = 0
        limit = 200

        while True:
            paginated_query = f"{query} LIMIT {offset}, {limit}"
            resp = self._http.post(
                f"{self._base_url}/coql",
                headers=self._headers(),
                json={"select_query": paginated_query},
            )
            if resp.status_code == 401:
                self._refresh_access_token()
                resp = self._http.post(
                    f"{self._base_url}/coql",
                    headers=self._headers(),
                    json={"select_query": paginated_query},
                )
            data = resp.json()
            records = data.get("data", [])
            all_records.extend(records)

            if not data.get("info", {}).get("more_records", False):
                break
            offset += limit

        return all_records


def calculate_rebooking_rate(brand: str, months: int = 6) -> list[dict]:
    """Calculate monthly rebooking rates for a brand.

    Returns list of dicts with keys: month, total_expiring, rebooked, rate, target
    """
    client = ZohoClient(brand)
    window_days = REBOOKING_WINDOWS[brand]
    won_stages = CLOSED_WON_STAGES[brand]
    target = TARGETS[brand]
    today = datetime.now().date()

    print(f"\n{'='*60}")
    print(f"  {brand.upper()} — Rebooking Rate Analysis")
    print(f"  Window: {window_days} days | Target: {target}%")
    print(f"{'='*60}")

    # Get all closed won deals with contacts
    stage_list = ", ".join([f"'{s}'" for s in won_stages])
    query = (
        f"select id, Contact_Name, Closing_Date, Created_Time, Stage "
        f"from Deals where Stage in ({stage_list}) and Contact_Name is not null"
    )

    print(f"  Querying deals...")
    deals = client.coql_query(query)
    print(f"  Found {len(deals)} closed won deals")

    # Group deals by contact, sorted by closing date
    contact_deals: dict[str, list[datetime]] = defaultdict(list)
    for deal in deals:
        contact = deal.get("Contact_Name")
        closing_date = deal.get("Closing_Date")
        if not closing_date:
            ct = deal.get("Created_Time", "")
            closing_date = ct[:10] if ct else None
        if contact and isinstance(contact, dict) and contact.get("id") and closing_date:
            try:
                dt = datetime.strptime(closing_date, "%Y-%m-%d").date()
                contact_deals[contact["id"]].append(dt)
            except (ValueError, TypeError):
                pass

    # Sort each contact's deals chronologically
    for contact_id in contact_deals:
        contact_deals[contact_id].sort()

    # For each contact, determine if they rebooked after each treatment
    # A "rebooking opportunity" = a treatment where the window hasn't expired yet
    # or where we can check if a subsequent treatment happened within the window

    # Build monthly rebooking stats
    # For month M, count: contacts whose window expired in month M
    # and of those, how many had a next deal before expiry

    monthly_stats: dict[str, dict] = {}

    # Calculate for the past N months
    for m in range(months, 0, -1):
        # First day of the month we're analyzing
        month_start = (today.replace(day=1) - timedelta(days=30 * m)).replace(day=1)
        # Last day of that month
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1, day=1) - timedelta(days=1)

        month_key = month_start.strftime("%Y-%m")
        total_expiring = 0
        rebooked = 0

        for contact_id, dates in contact_deals.items():
            for i, treatment_date in enumerate(dates):
                window_expiry = treatment_date + timedelta(days=window_days)

                # Did this window expire in our target month?
                if month_start <= window_expiry <= month_end:
                    total_expiring += 1

                    # Check if there's a subsequent treatment before window expiry
                    if i + 1 < len(dates) and dates[i + 1] <= window_expiry:
                        rebooked += 1

        rate = (rebooked / total_expiring * 100) if total_expiring > 0 else 0.0
        monthly_stats[month_key] = {
            "month": month_key,
            "total_expiring": total_expiring,
            "rebooked": rebooked,
            "rate": round(rate, 1),
            "target": target,
            "vs_target": round(rate - target, 1),
        }

    # Print results
    print(f"\n  {'Month':<10} {'Expiring':>10} {'Rebooked':>10} {'Rate':>8} {'Target':>8} {'vs Target':>10}")
    print(f"  {'-'*58}")

    results = []
    for month_key in sorted(monthly_stats.keys()):
        s = monthly_stats[month_key]
        indicator = "+" if s["vs_target"] >= 0 else ""
        print(
            f"  {s['month']:<10} {s['total_expiring']:>10} {s['rebooked']:>10} "
            f"{s['rate']:>7.1f}% {s['target']:>7.1f}% {indicator}{s['vs_target']:>8.1f}%"
        )
        results.append(s)

    # Current month summary
    if results:
        latest = results[-1]
        print(f"\n  Latest month ({latest['month']}): {latest['rate']:.1f}% rebooking rate")
        if latest["vs_target"] >= 0:
            print(f"  ABOVE target by {latest['vs_target']:.1f}pp")
        else:
            print(f"  BELOW target by {abs(latest['vs_target']):.1f}pp")

    return results


def main():
    parser = argparse.ArgumentParser(
        description="Calculate rebooking rates across Zoho CRM brands"
    )
    parser.add_argument(
        "--brand",
        required=True,
        choices=["spa", "aesthetics", "slimming", "all"],
        help="Brand to analyze (or 'all')",
    )
    parser.add_argument(
        "--months",
        type=int,
        default=6,
        help="Number of months to analyze (default: 6)",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output results as JSON",
    )
    args = parser.parse_args()

    load_mcp_creds()

    brands = (
        ["spa", "aesthetics", "slimming"] if args.brand == "all" else [args.brand]
    )

    all_results = {}
    for brand in brands:
        try:
            results = calculate_rebooking_rate(brand, months=args.months)
            all_results[brand] = results
        except Exception as e:
            print(f"\n  ERROR processing {brand}: {e}")
            all_results[brand] = {"error": str(e)}

    if args.json:
        print(json.dumps(all_results, indent=2))

    # Print cross-brand comparison
    if len(brands) > 1:
        print(f"\n{'='*60}")
        print(f"  CROSS-BRAND COMPARISON (Latest Month)")
        print(f"{'='*60}")
        for brand in brands:
            data = all_results.get(brand, [])
            if isinstance(data, list) and data:
                latest = data[-1]
                bar = "#" * int(latest["rate"] / 2)
                print(f"  {brand.upper():<12} {latest['rate']:>5.1f}%  {bar}  (target: {latest['target']}%)")
            elif isinstance(data, dict) and "error" in data:
                print(f"  {brand.upper():<12} ERROR: {data['error']}")


if __name__ == "__main__":
    main()
