"""
Speed to Lead — Escalation Check
Runs every 5 minutes via launchd. Checks all 3 Zoho CRM instances for
uncontacted leads and escalates via WhatsApp.

Tiers:
  Tier 1 (15 min)  — handled by Zoho native email workflow (not this script)
  Tier 2 (30 min)  — WhatsApp alert to Mert
  Tier 3 (60 min)  — WhatsApp urgent to Mert
  Tier 4 (120 min) — WhatsApp critical to Mert + Supabase log

Business hours: 08:00–20:00 Malta time only.
Overnight leads: timer starts at 08:00 next business day.
"""
import json
import os
import sys
import logging
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from pathlib import Path

import httpx

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

MALTA_TZ = ZoneInfo("Europe/Malta")
BIZ_START_HOUR = 8
BIZ_END_HOUR = 20

# Only escalate leads created ON or AFTER this date.
# Prevents flooding with historical leads when the system first goes live.
GO_LIVE_DATE = "2026-04-18"

ESCALATION_CONTACT = "35699503020"  # Mert — all brands
WA_BRIDGE_URL = "http://localhost:8080/api/send"

TIERS = [
    # (threshold_minutes, tier_number, tier_label)
    (120, 4, "Tier 4"),
    (60, 3, "Tier 3"),
    (30, 2, "Tier 2"),
    # Tier 1 handled by Zoho email — not in this script
]

TIER_RANK = {"None": 0, "Tier 1": 1, "Tier 2": 2, "Tier 3": 3, "Tier 4": 4}

# Contacted statuses per brand — if lead is in one of these, they've been reached
CONTACTED_STATUSES = {
    "spa": {"Contacted", "Must Contact", "Pre-Qualified", "Lead Created Via Email",
            "Lead Created Via Social", "Moved to Deal", "Closed Lost"},
    "aesthetics": {"Contacted us", "Attempted to Contact", "Pre-Qualified",
                   "No consult - Follow-up", "Existing customer info"},
    "slimming": {"Contacted", "Contacted us", "Attempted to Contact", "Pre-Qualified",
                 "No consult - Follow-up", "Existing customer info"},
}

REPO_ROOT = Path(__file__).resolve().parent.parent
MCP_JSON = REPO_ROOT / ".mcp.json"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [escalation] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Zoho CRM Client (lightweight, standalone)
# ---------------------------------------------------------------------------

class ZohoClient:
    def __init__(self, env: dict):
        self.client_id = env["ZOHO_CLIENT_ID"]
        self.client_secret = env["ZOHO_CLIENT_SECRET"]
        self.refresh_token = env["ZOHO_REFRESH_TOKEN"]
        self.api_domain = env["ZOHO_API_DOMAIN"]
        self._token = None

    def _get_token(self) -> str:
        if self._token:
            return self._token
        resp = httpx.post(
            f"{self.api_domain.replace('www.zohoapis', 'accounts.zoho')}/oauth/v2/token",
            data={
                "grant_type": "refresh_token",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "refresh_token": self.refresh_token,
            },
        )
        data = resp.json()
        if "access_token" not in data:
            raise RuntimeError(f"Token error: {data}")
        self._token = data["access_token"]
        return self._token

    def coql(self, query: str) -> list[dict]:
        token = self._get_token()
        resp = httpx.post(
            f"{self.api_domain}/crm/v7/coql",
            headers={"Authorization": f"Zoho-oauthtoken {token}"},
            json={"select_query": query},
        )
        if resp.status_code == 204:
            return []  # No matching records
        body = resp.json()
        return body.get("data", [])

    def update_lead(self, lead_id: str, fields: dict):
        token = self._get_token()
        resp = httpx.put(
            f"{self.api_domain}/crm/v7/Leads",
            headers={"Authorization": f"Zoho-oauthtoken {token}"},
            json={"data": [{"id": lead_id, **fields}]},
        )
        return resp.json()


# ---------------------------------------------------------------------------
# Business hours logic
# ---------------------------------------------------------------------------

def is_business_hours(dt: datetime) -> bool:
    """Check if a datetime falls within 08:00-20:00 Malta time."""
    malta_dt = dt.astimezone(MALTA_TZ)
    return BIZ_START_HOUR <= malta_dt.hour < BIZ_END_HOUR


def effective_minutes_elapsed(created_time: datetime, now: datetime) -> float:
    """Calculate minutes elapsed only during business hours (08:00-20:00 Malta).

    Walks through each business-hours window between created_time and now,
    summing only the minutes that fall within 08:00-20:00.
    """
    created_malta = created_time.astimezone(MALTA_TZ)
    now_malta = now.astimezone(MALTA_TZ)

    if now_malta <= created_malta:
        return 0.0

    total_minutes = 0.0
    cursor = created_malta

    # Walk day by day
    while cursor < now_malta:
        day_start = cursor.replace(hour=BIZ_START_HOUR, minute=0, second=0, microsecond=0)
        day_end = cursor.replace(hour=BIZ_END_HOUR, minute=0, second=0, microsecond=0)

        # Clamp to business hours window for this day
        window_start = max(cursor, day_start)
        window_end = min(now_malta, day_end)

        if window_start < window_end:
            total_minutes += (window_end - window_start).total_seconds() / 60.0

        # Move to next day's start of business
        next_day = (cursor + timedelta(days=1)).replace(
            hour=BIZ_START_HOUR, minute=0, second=0, microsecond=0
        )
        cursor = next_day

    return round(total_minutes, 1)


# ---------------------------------------------------------------------------
# WhatsApp messaging
# ---------------------------------------------------------------------------

def send_whatsapp(phone: str, message: str) -> bool:
    """Send a WhatsApp message via the local bridge."""
    try:
        resp = httpx.post(
            WA_BRIDGE_URL,
            json={"recipient": phone, "message": message},
            timeout=15,
        )
        result = resp.json()
        if result.get("success"):
            log.info(f"WhatsApp sent to {phone}")
            return True
        log.warning(f"WhatsApp send failed: {result}")
        return False
    except Exception as e:
        log.error(f"WhatsApp bridge error: {e}")
        return False


def format_message(tier: int, brand: str, lead: dict, minutes: float) -> str:
    name = lead.get("Last_Name", "Unknown")
    phone = lead.get("Phone", "N/A")
    campaign = lead.get("Ad_Campaign", "N/A")
    rep = lead.get("Owner", {}).get("name", "Unassigned") if isinstance(lead.get("Owner"), dict) else "Unassigned"

    if tier == 2:
        return (
            f"⏰ SPEED TO LEAD — {brand.upper()}\n"
            f"Lead: {name} ({phone})\n"
            f"Campaign: {campaign}\n"
            f"Waiting: {int(minutes)} min\n"
            f"Rep: {rep}"
        )
    elif tier == 3:
        return (
            f"🔴 URGENT — {brand.upper()}\n"
            f"{name} waiting {int(minutes)} min — NO CONTACT\n"
            f"Phone: {phone}\n"
            f"Campaign: {campaign}\n"
            f"This lead is going cold."
        )
    else:  # tier 4
        return (
            f"🚨 CRITICAL — {brand.upper()}\n"
            f"{name} — {int(minutes)} MIN, NO CONTACT\n"
            f"Phone: {phone}\n"
            f"Campaign: {campaign}\n"
            f"Flagged on CEO Cockpit."
        )


# ---------------------------------------------------------------------------
# Supabase logging
# ---------------------------------------------------------------------------

def log_escalation(brand_id: int, lead: dict, tier: int, minutes: float, channel: str):
    """Log escalation event to Supabase. Best-effort — don't crash on failure."""
    try:
        supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if not supabase_url or not supabase_key:
            log.warning("Supabase credentials not found, skipping log")
            return

        resp = httpx.post(
            f"{supabase_url}/rest/v1/escalation_log",
            headers={
                "apikey": supabase_key,
                "Authorization": f"Bearer {supabase_key}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal",
            },
            json={
                "brand_id": brand_id,
                "lead_id": lead.get("id", ""),
                "lead_name": lead.get("Last_Name", ""),
                "lead_phone": lead.get("Phone", ""),
                "campaign": lead.get("Ad_Campaign", ""),
                "assigned_rep": lead.get("Owner", {}).get("name", "") if isinstance(lead.get("Owner"), dict) else "",
                "tier": tier,
                "minutes_elapsed": minutes,
                "channel": channel,
            },
        )
        if resp.status_code in (200, 201):
            log.info(f"Escalation logged to Supabase: tier {tier}")
        else:
            log.warning(f"Supabase log failed: {resp.status_code} {resp.text}")
    except Exception as e:
        log.warning(f"Supabase log error: {e}")


# ---------------------------------------------------------------------------
# Main logic
# ---------------------------------------------------------------------------

BRAND_IDS = {"spa": 1, "aesthetics": 2, "slimming": 3}

def check_brand(brand: str, client: ZohoClient, now: datetime) -> int:
    """Check one brand for leads needing escalation. Returns count of escalations."""
    # Only query leads created after go-live date
    cutoff = f"{GO_LIVE_DATE}T00:00:00+00:00"

    query = (
        "SELECT id, Last_Name, Phone, Ad_Campaign, Owner, "
        "Created_Time, Lead_Status, Response_Status, Escalation_Level "
        f"FROM Leads WHERE Created_Time >= '{cutoff}' "
        "ORDER BY Created_Time DESC LIMIT 0, 200"
    )

    try:
        leads = client.coql(query)
    except Exception as e:
        log.error(f"[{brand}] COQL query failed: {e}")
        return 0

    escalated = 0
    contacted = CONTACTED_STATUSES.get(brand, set())

    for lead in leads:
        lead_status = lead.get("Lead_Status") or ""
        response_status = lead.get("Response_Status") or ""

        # Skip if already contacted
        if lead_status in contacted or response_status == "Called":
            continue

        # Parse created time
        created_str = lead.get("Created_Time", "")
        if not created_str:
            continue
        try:
            created_dt = datetime.fromisoformat(created_str.replace("Z", "+00:00"))
        except (ValueError, TypeError):
            continue

        # Calculate business-hours elapsed time
        minutes = effective_minutes_elapsed(created_dt, now)
        if minutes <= 0:
            continue

        # Determine target tier
        target_tier = 0
        for threshold, tier_num, tier_label in TIERS:
            if minutes >= threshold:
                target_tier = tier_num
                break

        if target_tier < 2:
            # Below Tier 2 threshold or only Tier 1 (handled by Zoho email)
            continue

        # Check current escalation level
        current_level = lead.get("Escalation_Level") or "None"
        current_rank = TIER_RANK.get(current_level, 0)

        if target_tier <= current_rank:
            # Already escalated to this tier or higher
            continue

        # Escalate!
        tier_label = f"Tier {target_tier}"
        lead_name = lead.get("Last_Name", "?")
        lead_id = lead.get("id")

        log.info(f"[{brand}] Escalating {lead_name} (ID: {lead_id}) to {tier_label} — {minutes} min")

        # Send WhatsApp
        msg = format_message(target_tier, brand, lead, minutes)
        wa_sent = send_whatsapp(ESCALATION_CONTACT, msg)

        # Update Zoho CRM
        try:
            now_str = now.strftime("%Y-%m-%dT%H:%M:%S+00:00")
            client.update_lead(lead_id, {
                "Escalation_Level": tier_label,
                "Escalation_Time": now_str,
            })
        except Exception as e:
            log.error(f"[{brand}] Failed to update lead {lead_id}: {e}")

        # Log to Supabase
        channel = "whatsapp" if wa_sent else "whatsapp_failed"
        log_escalation(BRAND_IDS[brand], lead, target_tier, minutes, channel)

        escalated += 1

    return escalated


def main():
    now = datetime.now(tz=MALTA_TZ)

    # Gate: only run during business hours
    if not is_business_hours(now):
        log.info(f"Outside business hours ({now.strftime('%H:%M')} Malta). Exiting.")
        return

    log.info(f"Escalation check starting at {now.strftime('%Y-%m-%d %H:%M')} Malta")

    # Load CRM credentials
    if not MCP_JSON.exists():
        log.error(f".mcp.json not found at {MCP_JSON}")
        sys.exit(1)

    with open(MCP_JSON) as f:
        mcp = json.load(f)

    # Load Supabase env — check multiple locations
    for env_name in [".env", "Tech/CEO-Cockpit/.env.local"]:
        env_path = REPO_ROOT / env_name
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                if "=" in line and not line.startswith("#"):
                    key, _, val = line.partition("=")
                    os.environ.setdefault(key.strip(), val.strip().strip('"'))

    brands = {
        "spa": "zoho-crm-spa",
        "aesthetics": "zoho-crm-aesthetics",
        "slimming": "zoho-crm-slimming",
    }

    total_escalated = 0
    for brand, mcp_key in brands.items():
        srv = mcp["mcpServers"].get(mcp_key)
        if not srv:
            log.warning(f"MCP server {mcp_key} not found in .mcp.json")
            continue

        try:
            client = ZohoClient(srv["env"])
            count = check_brand(brand, client, now)
            total_escalated += count
            log.info(f"[{brand}] {count} escalations")
        except Exception as e:
            log.error(f"[{brand}] Failed: {e}")

    log.info(f"Done. Total escalations: {total_escalated}")


if __name__ == "__main__":
    main()
