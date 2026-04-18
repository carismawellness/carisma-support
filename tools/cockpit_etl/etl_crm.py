#!/usr/bin/env python3
"""
CRM Master ETL — Zoho CRM → Supabase
======================================

Pulls lead, deal, and activity data from three Zoho CRM instances
(Spa, Aesthetics, Slimming) and upserts daily aggregates into
the Cockpit Supabase database.

Tables populated:
    - crm_daily           (daily brand-level KPIs)
    - crm_lead_reconciliation (CRM vs Meta lead counts)
    - crm_booking_mix     (treatment booking breakdown)

Usage:
    python -m Tools.cockpit_etl.etl_crm                 # today
    python -m Tools.cockpit_etl.etl_crm --days 7        # last 7 days
    python -m Tools.cockpit_etl.etl_crm --date 2026-04-15
    python -m Tools.cockpit_etl.etl_crm --dry-run       # preview without writing
"""

import argparse
import logging
import os
import statistics
import time
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Optional

import requests
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
log = logging.getLogger("etl_crm")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

ZOHO_API_BASE = "https://www.zohoapis.eu/crm/v7"
ZOHO_TOKEN_URL = "https://accounts.zoho.eu/oauth/v2/token"

BRANDS = [
    {
        "brand_id": "carisma_spa",
        "supabase_brand_id": 1,
        "env_prefix": "ZOHO_SPA",
        "won_stages": ["Closed Won"],
        # Spa Deal_Name is client name, not treatment
        "booking_mix_stages": [],
    },
    {
        "brand_id": "carisma_aesthetics",
        "supabase_brand_id": 2,
        "env_prefix": "ZOHO_AES",
        "won_stages": ["Consultation - won", "Booking closed won"],
        # Only "Booking closed won" has treatment names in Deal_Name
        "booking_mix_stages": ["Booking closed won"],
    },
    {
        "brand_id": "carisma_slimming",
        "supabase_brand_id": 3,
        "env_prefix": "ZOHO_SLIM",
        "won_stages": ["Consultation - won", "Booking closed won"],
        "booking_mix_stages": ["Booking closed won"],
    },
]

COQL_PAGE_SIZE = 200
META_LEAD_SOURCES = {"Facebook Ads", "Facebook", "Meta", "Meta Ads", "Instagram"}

# ---------------------------------------------------------------------------
# Zoho CRM Client (reused from push_capi_conversions.py)
# ---------------------------------------------------------------------------


class ZohoCRMClient:
    """Lightweight Zoho CRM API client using OAuth refresh tokens."""

    def __init__(self, client_id: str, client_secret: str, refresh_token: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.refresh_token = refresh_token
        self._access_token: Optional[str] = None

    def _get_access_token(self) -> str:
        if self._access_token:
            return self._access_token
        resp = requests.post(
            ZOHO_TOKEN_URL,
            params={
                "grant_type": "refresh_token",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "refresh_token": self.refresh_token,
            },
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        if "access_token" not in data:
            raise RuntimeError(f"Zoho token refresh failed: {data}")
        self._access_token = data["access_token"]
        return self._access_token

    def _headers(self) -> dict[str, str]:
        return {"Authorization": f"Zoho-oauthtoken {self._get_access_token()}"}

    def coql_query_all(self, query_template: str) -> list[dict[str, Any]]:
        """Execute a COQL query with auto-pagination. Returns all rows."""
        all_rows: list[dict] = []
        offset = 0

        while True:
            query = f"{query_template} LIMIT {offset}, {COQL_PAGE_SIZE}"
            resp = requests.post(
                f"{ZOHO_API_BASE}/coql",
                headers=self._headers(),
                json={"select_query": query},
                timeout=30,
            )
            if resp.status_code == 204:
                break
            if resp.status_code == 401:
                # Token expired — refresh once and retry
                self._access_token = None
                resp = requests.post(
                    f"{ZOHO_API_BASE}/coql",
                    headers=self._headers(),
                    json={"select_query": query},
                    timeout=30,
                )
                if resp.status_code == 204:
                    break
            if resp.status_code >= 400:
                log.error("COQL error %d: %s", resp.status_code, resp.text)
            resp.raise_for_status()
            body = resp.json()
            rows = body.get("data", [])
            all_rows.extend(rows)
            if not body.get("info", {}).get("more_records", False):
                break
            offset += COQL_PAGE_SIZE
            time.sleep(0.3)  # respect rate limits

        return all_rows


def get_zoho_client(env_prefix: str) -> ZohoCRMClient:
    """Create a Zoho CRM client from env vars."""
    client_id = os.getenv(f"{env_prefix}_CLIENT_ID")
    client_secret = os.getenv(f"{env_prefix}_CLIENT_SECRET")
    refresh_token = os.getenv(f"{env_prefix}_REFRESH_TOKEN")
    if not all([client_id, client_secret, refresh_token]):
        raise ValueError(f"Missing Zoho credentials for prefix {env_prefix}")
    return ZohoCRMClient(client_id, client_secret, refresh_token)


# ---------------------------------------------------------------------------
# Date helpers
# ---------------------------------------------------------------------------

CET = timezone(timedelta(hours=2))  # Malta timezone (CET/CEST)


def parse_zoho_datetime(dt_str: str) -> datetime:
    """Parse Zoho datetime string to a timezone-aware datetime."""
    return datetime.fromisoformat(dt_str)


def date_range(start: str, end: str) -> list[str]:
    """Generate list of date strings from start to end inclusive."""
    d = datetime.strptime(start, "%Y-%m-%d")
    e = datetime.strptime(end, "%Y-%m-%d")
    dates = []
    while d <= e:
        dates.append(d.strftime("%Y-%m-%d"))
        d += timedelta(days=1)
    return dates


# ---------------------------------------------------------------------------
# Data extraction from Zoho
# ---------------------------------------------------------------------------


def fetch_leads(zoho: ZohoCRMClient, date_from: str, date_to: str) -> list[dict]:
    """Fetch all leads created in the date range."""
    query = (
        f"SELECT Last_Name, Lead_Source, Created_Time, Last_Activity_Time, Owner "
        f"FROM Leads "
        f"WHERE Created_Time between '{date_from}T00:00:00+02:00' "
        f"and '{date_to}T23:59:59+02:00'"
    )
    return zoho.coql_query_all(query)


def fetch_deals_by_stage(
    zoho: ZohoCRMClient, date_from: str, date_to: str, stages: list[str]
) -> list[dict]:
    """Fetch deals at specific stages, modified in the date range.

    Queries per-stage to avoid fetching the entire deal table.
    """
    all_deals: list[dict] = []
    for stage in stages:
        query = (
            f"SELECT Deal_Name, Amount, Stage, Closing_Date, "
            f"Created_Time, Modified_Time "
            f"FROM Deals "
            f"WHERE Stage = '{stage}' "
            f"AND Modified_Time between '{date_from}T00:00:00+02:00' "
            f"and '{date_to}T23:59:59+02:00'"
        )
        rows = zoho.coql_query_all(query)
        all_deals.extend(rows)
        log.info("    Stage '%s': %d deals", stage, len(rows))
    return all_deals


# ---------------------------------------------------------------------------
# Aggregation
# ---------------------------------------------------------------------------


def aggregate_daily(
    leads: list[dict],
    won_deals: list[dict],
    brand_id: int,
    dates: list[str],
) -> list[dict]:
    """Aggregate lead + deal data into crm_daily rows."""
    # Group leads by creation date
    leads_by_date: dict[str, list[dict]] = defaultdict(list)
    for lead in leads:
        dt = parse_zoho_datetime(lead["Created_Time"])
        d = dt.strftime("%Y-%m-%d")
        leads_by_date[d].append(lead)

    # Group won deals by closing date (fall back to Modified_Time date)
    deals_by_date: dict[str, list[dict]] = defaultdict(list)
    for deal in won_deals:
        d = deal.get("Closing_Date")
        if not d and deal.get("Modified_Time"):
            d = parse_zoho_datetime(deal["Modified_Time"]).strftime("%Y-%m-%d")
        if d:
            deals_by_date[d].append(deal)

    rows = []
    for d in dates:
        day_leads = leads_by_date.get(d, [])
        day_deals = deals_by_date.get(d, [])

        total_leads = len(day_leads)

        # Speed to lead: time between Created_Time and Last_Activity_Time
        stl_minutes = []
        for lead in day_leads:
            created = lead.get("Created_Time")
            activity = lead.get("Last_Activity_Time")
            if created and activity:
                ct = parse_zoho_datetime(created)
                at = parse_zoho_datetime(activity)
                diff = (at - ct).total_seconds() / 60
                if 0 < diff < 1440:  # ignore > 24h (likely not first touch)
                    stl_minutes.append(diff)

        stl_median = round(statistics.median(stl_minutes), 2) if stl_minutes else None
        stl_mean = round(statistics.mean(stl_minutes), 2) if stl_minutes else None

        # Unworked leads: created but no activity
        unworked = sum(
            1 for l in day_leads if l.get("Last_Activity_Time") is None
        )

        # Sales from won deals
        total_sales = sum(float(d.get("Amount") or 0) for d in day_deals)
        bookings = len(day_deals)

        # Meta leads (Lead_Source in META_LEAD_SOURCES)
        leads_meta = sum(
            1 for l in day_leads if (l.get("Lead_Source") or "") in META_LEAD_SOURCES
        )

        rows.append(
            {
                "date": d,
                "brand_id": brand_id,
                "total_leads": total_leads,
                "leads_meta": leads_meta,
                "leads_crm": total_leads,
                "speed_to_lead_median_min": stl_median,
                "speed_to_lead_mean_min": stl_mean,
                "total_sales": round(total_sales, 2) if total_sales else None,
                "appointments_booked": bookings,
                "unworked_leads": unworked,
            }
        )

    return rows


def aggregate_lead_reconciliation(
    leads: list[dict], brand_id: int, dates: list[str]
) -> list[dict]:
    """Build lead reconciliation rows (CRM total vs Meta-sourced)."""
    leads_by_date: dict[str, list[dict]] = defaultdict(list)
    for lead in leads:
        dt = parse_zoho_datetime(lead["Created_Time"])
        leads_by_date[dt.strftime("%Y-%m-%d")].append(lead)

    rows = []
    for d in dates:
        day_leads = leads_by_date.get(d, [])
        total = len(day_leads)
        meta = sum(
            1 for l in day_leads if (l.get("Lead_Source") or "") in META_LEAD_SOURCES
        )
        rows.append(
            {
                "date": d,
                "brand_id": brand_id,
                "leads_crm": total,
                "leads_meta": meta,
            }
        )
    return rows


def aggregate_booking_mix(
    all_deals: list[dict],
    brand_id: int,
    dates: list[str],
    booking_mix_stages: list[str],
) -> list[dict]:
    """Build booking mix rows from deal names (treatment proxy).

    Only uses deals at specific stages where Deal_Name = treatment name.
    """
    if not booking_mix_stages:
        return []

    stages_set = set(booking_mix_stages)
    mix: dict[tuple[str, str], int] = defaultdict(int)
    for deal in all_deals:
        if deal.get("Stage") not in stages_set:
            continue
        d = deal.get("Closing_Date")
        if not d and deal.get("Modified_Time"):
            d = parse_zoho_datetime(deal["Modified_Time"]).strftime("%Y-%m-%d")
        name = deal.get("Deal_Name", "Unknown")
        if d:
            mix[(d, name)] += 1

    return [
        {
            "date": d,
            "brand_id": brand_id,
            "treatment_name": treatment,
            "count": count,
        }
        for (d, treatment), count in mix.items()
        if d in dates
    ]


# ---------------------------------------------------------------------------
# Supabase upsert
# ---------------------------------------------------------------------------


def get_supabase_client():
    """Lazy import to avoid dependency issues."""
    from Tools.cockpit_etl.db import get_supabase_client as _get

    return _get()


# Unique constraint columns per table (for upsert ON CONFLICT)
TABLE_CONFLICT_COLS = {
    "crm_daily": "date,brand_id",
    "crm_by_rep": "date,staff_id",
    "crm_booking_mix": "date,brand_id,treatment_name",
    "crm_lead_reconciliation": "date,brand_id",
}


def upsert_to_supabase(
    table: str, rows: list[dict], dry_run: bool = False
) -> int:
    """Upsert rows into Supabase. Returns count of rows upserted."""
    if not rows:
        log.info("  No rows to upsert into %s", table)
        return 0

    if dry_run:
        log.info("  [DRY RUN] Would upsert %d rows into %s", len(rows), table)
        for r in rows[:3]:
            log.info("    Sample: %s", r)
        return 0

    client = get_supabase_client()
    conflict_cols = TABLE_CONFLICT_COLS.get(table, "")

    # Batch in chunks of 500 to avoid payload limits
    batch_size = 500
    total = 0
    for i in range(0, len(rows), batch_size):
        batch = rows[i : i + batch_size]
        client.table(table).upsert(batch, on_conflict=conflict_cols).execute()
        total += len(batch)

    log.info("  Upserted %d rows into %s", total, table)
    return total


def log_etl_run(
    source: str,
    started: float,
    rows: int,
    status: str,
    error: Optional[str] = None,
    dry_run: bool = False,
):
    """Write an entry to etl_sync_log."""
    if dry_run:
        return
    duration = round(time.time() - started, 2)
    row = {
        "source_name": source,
        "started_at": datetime.fromtimestamp(started, tz=timezone.utc).isoformat(),
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "status": status,
        "rows_upserted": rows,
        "error_message": error,
        "duration_sec": duration,
    }
    try:
        client = get_supabase_client()
        client.table("etl_sync_log").insert(row).execute()
    except Exception as e:
        log.warning("Failed to write etl_sync_log: %s", e)


# ---------------------------------------------------------------------------
# Main ETL orchestration
# ---------------------------------------------------------------------------


def run_brand_etl(
    brand: dict, date_from: str, date_to: str, dry_run: bool = False
) -> dict[str, int]:
    """Run ETL for a single brand. Returns dict of table -> rows upserted."""
    brand_id = brand["brand_id"]
    sb_brand_id = brand["supabase_brand_id"]
    prefix = brand["env_prefix"]
    won_stages = brand["won_stages"]

    log.info("--- %s (brand_id=%d) ---", brand_id, sb_brand_id)

    try:
        zoho = get_zoho_client(prefix)
    except ValueError as e:
        log.error("Skipping %s: %s", brand_id, e)
        return {}

    dates = date_range(date_from, date_to)

    # Fetch data from Zoho
    log.info("  Fetching leads %s to %s ...", date_from, date_to)
    leads = fetch_leads(zoho, date_from, date_to)
    log.info("  Fetched %d leads", len(leads))

    log.info("  Fetching won deals (%s) ...", ", ".join(won_stages))
    won_deals = fetch_deals_by_stage(zoho, date_from, date_to, won_stages)
    log.info("  Fetched %d won deals total", len(won_deals))

    # Fetch booking-mix deals separately (may use different stages)
    mix_stages = brand.get("booking_mix_stages", [])
    mix_deals = won_deals  # default: same as won deals
    if mix_stages and set(mix_stages) != set(won_stages):
        mix_deals = [d for d in won_deals if d.get("Stage") in set(mix_stages)]

    # Aggregate
    daily_rows = aggregate_daily(leads, won_deals, sb_brand_id, dates)
    recon_rows = aggregate_lead_reconciliation(leads, sb_brand_id, dates)
    mix_rows = aggregate_booking_mix(
        mix_deals, sb_brand_id, dates, mix_stages
    )

    # Upsert
    results = {}
    results["crm_daily"] = upsert_to_supabase("crm_daily", daily_rows, dry_run)
    results["crm_lead_reconciliation"] = upsert_to_supabase(
        "crm_lead_reconciliation", recon_rows, dry_run
    )
    results["crm_booking_mix"] = upsert_to_supabase(
        "crm_booking_mix", mix_rows, dry_run
    )

    return results


def run_all(date_from: str, date_to: str, dry_run: bool = False) -> None:
    """Run ETL for all brands."""
    started = time.time()
    total_rows = 0

    log.info("=== CRM ETL Started (%s to %s) ===", date_from, date_to)

    for brand in BRANDS:
        try:
            results = run_brand_etl(brand, date_from, date_to, dry_run)
            total_rows += sum(results.values())
        except Exception as e:
            log.error("Brand %s failed: %s", brand["brand_id"], e, exc_info=True)

    status = "success"
    log.info("=== CRM ETL Complete: %d total rows ===", total_rows)

    log_etl_run("crm_zoho", started, total_rows, status, dry_run=dry_run)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description="CRM Master ETL: Zoho → Supabase")
    parser.add_argument(
        "--days",
        type=int,
        default=1,
        help="Number of days to backfill (default: 1 = today only)",
    )
    parser.add_argument(
        "--date",
        type=str,
        help="Specific date to process (YYYY-MM-DD). Overrides --days.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview data without writing to Supabase",
    )
    return parser.parse_args(argv)


def main(argv=None):
    args = parse_args(argv)

    if args.date:
        date_from = args.date
        date_to = args.date
    else:
        today = datetime.now(CET).strftime("%Y-%m-%d")
        if args.days <= 1:
            date_from = today
            date_to = today
        else:
            date_from = (
                datetime.now(CET) - timedelta(days=args.days - 1)
            ).strftime("%Y-%m-%d")
            date_to = today

    run_all(date_from, date_to, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
