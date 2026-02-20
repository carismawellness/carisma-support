"""
Pull Ad Insights Tool
=====================

Pull Meta ad performance data via the Meta Ads MCP server.

Purpose:
    Retrieve advertising performance metrics (impressions, clicks, spend, CPL,
    etc.) for a given brand's ad account. Data is pulled at campaign, ad set, or
    ad level with optional breakdowns.

Inputs:
    --brand             Brand ID (maps to ad account via config/brands.json)
    --date_range        Date range as "YYYY-MM-DD,YYYY-MM-DD" or preset: today, yesterday, last_7d, last_30d, this_month
    --level             Reporting level: campaign, adset, ad (default: ad)
    --breakdowns        Optional breakdowns: age, gender, placement, device (comma-separated)
    --fields            Override default fields (comma-separated)

Outputs:
    JSON file at .tmp/performance/insights_{brand}_{level}_{date}.json

MCP Integration:
    Uses Meta Ads MCP (mcp_meta_ads_get_insights) for the actual API call.
    This script loads config, formats the request, and processes the response.
"""

import argparse
import json
import logging
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Optional

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
TMP_DIR = BASE_DIR / ".tmp" / "performance"
CONFIG_DIR = BASE_DIR / "config"

DEFAULT_FIELDS = [
    "campaign_name",
    "campaign_id",
    "adset_name",
    "adset_id",
    "ad_name",
    "ad_id",
    "impressions",
    "clicks",
    "spend",
    "cpc",
    "ctr",
    "cpm",
    "reach",
    "frequency",
    "actions",
    "cost_per_action_type",
    "conversions",
    "cost_per_conversion",
]

DATE_PRESETS = {
    "today": "today",
    "yesterday": "yesterday",
    "last_7d": "last_7d",
    "last_14d": "last_14d",
    "last_30d": "last_30d",
    "this_month": "this_month",
    "last_month": "last_month",
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("pull_ad_insights")


# ---------------------------------------------------------------------------
# Config loading
# ---------------------------------------------------------------------------

def load_brands_config() -> dict[str, Any]:
    """Load and index brands config by brand_id."""
    config_path = CONFIG_DIR / "brands.json"
    with open(config_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    brands = {}
    for brand in data.get("brands", []):
        brands[brand["brand_id"]] = brand
    return brands


def get_ad_account_id(brand_id: str) -> str:
    """Get the Meta ad account ID for a brand."""
    brands = load_brands_config()
    if brand_id not in brands:
        available = ", ".join(brands.keys())
        raise ValueError(f"Brand '{brand_id}' not found. Available: {available}")

    account_id = brands[brand_id].get("meta_ad_account_id", "")
    if not account_id or account_id == "TO_BE_FILLED":
        raise ValueError(
            f"Brand '{brand_id}' does not have a configured meta_ad_account_id. "
            "Update config/brands.json first."
        )
    return account_id


# ---------------------------------------------------------------------------
# Date range parsing
# ---------------------------------------------------------------------------

def parse_date_range(date_range_str: str) -> dict[str, Any]:
    """
    Parse date range input into API-compatible format.

    Accepts:
        - Preset strings: today, yesterday, last_7d, last_30d, this_month, last_month
        - Custom range: "YYYY-MM-DD,YYYY-MM-DD"

    Returns:
        Dict with either 'date_preset' or 'time_range' key.
    """
    cleaned = date_range_str.strip().lower()

    if cleaned in DATE_PRESETS:
        return {"date_preset": DATE_PRESETS[cleaned]}

    if "," in date_range_str:
        parts = date_range_str.split(",")
        if len(parts) != 2:
            raise ValueError(f"Invalid date range format: {date_range_str}")

        since = parts[0].strip()
        until = parts[1].strip()

        # Validate date format
        try:
            datetime.strptime(since, "%Y-%m-%d")
            datetime.strptime(until, "%Y-%m-%d")
        except ValueError:
            raise ValueError(
                f"Invalid date format. Expected YYYY-MM-DD,YYYY-MM-DD. Got: {date_range_str}"
            )

        return {
            "time_range": {
                "since": since,
                "until": until,
            }
        }

    raise ValueError(
        f"Unrecognised date range: '{date_range_str}'. "
        f"Use a preset ({', '.join(DATE_PRESETS.keys())}) or YYYY-MM-DD,YYYY-MM-DD."
    )


# ---------------------------------------------------------------------------
# MCP request building
# ---------------------------------------------------------------------------

def build_insights_request(
    brand_id: str,
    date_range_str: str,
    level: str = "ad",
    breakdowns: Optional[list[str]] = None,
    fields: Optional[list[str]] = None,
) -> dict[str, Any]:
    """
    Build the MCP tool call parameters for mcp_meta_ads_get_insights.

    Returns:
        Dict describing the MCP tool call for the agent to execute.
    """
    ad_account_id = get_ad_account_id(brand_id)
    date_params = parse_date_range(date_range_str)
    resolved_fields = fields or DEFAULT_FIELDS

    # Validate level
    valid_levels = ["campaign", "adset", "ad"]
    if level not in valid_levels:
        raise ValueError(f"Invalid level '{level}'. Must be one of: {valid_levels}")

    # Build the MCP call
    mcp_params: dict[str, Any] = {
        "ad_account_id": ad_account_id,
        "level": level,
        "fields": resolved_fields,
    }

    # Add date range
    mcp_params.update(date_params)

    # Add breakdowns if specified
    if breakdowns:
        valid_breakdowns = ["age", "gender", "placement", "device_platform", "country"]
        for b in breakdowns:
            if b not in valid_breakdowns:
                logger.warning("Breakdown '%s' may not be valid. Valid: %s", b, valid_breakdowns)
        mcp_params["breakdowns"] = breakdowns

    request = {
        "mcp_tool": "mcp_meta_ads_get_insights",
        "params": mcp_params,
        "description": f"Pull {level}-level insights for {brand_id}",
    }

    return request


# ---------------------------------------------------------------------------
# Response processing
# ---------------------------------------------------------------------------

def extract_lead_actions(actions: Optional[list[dict[str, Any]]]) -> dict[str, Any]:
    """
    Extract lead-related actions from the actions array.

    Returns dict with lead_count and other relevant action counts.
    """
    result: dict[str, Any] = {
        "lead_count": 0,
        "link_clicks": 0,
        "landing_page_views": 0,
        "all_actions": {},
    }

    if not actions:
        return result

    for action in actions:
        action_type = action.get("action_type", "")
        value = int(action.get("value", 0))
        result["all_actions"][action_type] = value

        if action_type in ("lead", "leadgen_grouped", "onsite_conversion.lead_grouped"):
            result["lead_count"] += value
        elif action_type == "link_click":
            result["link_clicks"] = value
        elif action_type == "landing_page_view":
            result["landing_page_views"] = value

    return result


def extract_cost_per_lead(
    cost_per_action_type: Optional[list[dict[str, Any]]],
) -> Optional[float]:
    """Extract cost per lead from cost_per_action_type array."""
    if not cost_per_action_type:
        return None

    for cpa in cost_per_action_type:
        action_type = cpa.get("action_type", "")
        if action_type in ("lead", "leadgen_grouped", "onsite_conversion.lead_grouped"):
            try:
                return float(cpa.get("value", 0))
            except (ValueError, TypeError):
                return None
    return None


def process_insights_response(
    raw_data: list[dict[str, Any]],
    brand_id: str,
    level: str,
) -> list[dict[str, Any]]:
    """
    Process raw insights data into enriched records.

    Adds computed fields like CPL, lead counts, and classifications.
    """
    processed = []

    for row in raw_data:
        record = dict(row)

        # Parse numeric fields
        for field in ["impressions", "clicks", "reach"]:
            if field in record:
                try:
                    record[field] = int(record[field])
                except (ValueError, TypeError):
                    pass

        for field in ["spend", "cpc", "ctr", "cpm", "frequency"]:
            if field in record:
                try:
                    record[field] = float(record[field])
                except (ValueError, TypeError):
                    pass

        # Extract lead actions
        actions_data = extract_lead_actions(record.get("actions"))
        record["lead_count"] = actions_data["lead_count"]
        record["link_clicks"] = actions_data["link_clicks"]
        record["landing_page_views"] = actions_data["landing_page_views"]

        # Extract or compute CPL
        cpl = extract_cost_per_lead(record.get("cost_per_action_type"))
        if cpl is not None:
            record["cpl"] = cpl
        elif actions_data["lead_count"] > 0 and record.get("spend"):
            record["cpl"] = round(float(record["spend"]) / actions_data["lead_count"], 2)
        else:
            record["cpl"] = None

        record["_processed_at"] = datetime.utcnow().isoformat() + "Z"
        processed.append(record)

    return processed


def compile_output(
    processed_data: list[dict[str, Any]],
    brand_id: str,
    level: str,
    date_range_str: str,
) -> dict[str, Any]:
    """Compile the final output payload."""
    total_spend = sum(float(r.get("spend", 0)) for r in processed_data)
    total_leads = sum(int(r.get("lead_count", 0)) for r in processed_data)

    return {
        "metadata": {
            "tool": "pull_ad_insights",
            "brand": brand_id,
            "level": level,
            "date_range": date_range_str,
            "total_records": len(processed_data),
            "total_spend": round(total_spend, 2),
            "total_leads": total_leads,
            "overall_cpl": round(total_spend / total_leads, 2) if total_leads > 0 else None,
            "retrieved_at": datetime.utcnow().isoformat() + "Z",
        },
        "data": processed_data,
    }


def save_output(data: dict[str, Any], brand_id: str, level: str) -> Path:
    """Write output JSON to .tmp/performance/."""
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d")
    filename = f"insights_{brand_id}_{level}_{date_str}.json"
    output_path = TMP_DIR / filename

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    logger.info("Output saved to %s", output_path)
    return output_path


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------

def pull_insights(
    brand: str,
    date_range: str,
    level: str = "ad",
    breakdowns: Optional[list[str]] = None,
    fields: Optional[list[str]] = None,
) -> dict[str, Any]:
    """
    High-level function to pull ad insights.

    Builds the MCP request and emits it for the agent to execute.
    The agent feeds the response back through process_insights_response.

    Returns:
        The MCP request dict for the agent to execute.
    """
    request = build_insights_request(
        brand_id=brand,
        date_range_str=date_range,
        level=level,
        breakdowns=breakdowns,
        fields=fields,
    )

    logger.info("Built insights request for %s at %s level", brand, level)
    return request


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Pull Meta ad performance data via Meta Ads MCP.",
    )
    parser.add_argument(
        "--brand",
        type=str,
        required=True,
        help="Brand ID (e.g. carisma_spa, carisma_aesthetics)",
    )
    parser.add_argument(
        "--date_range",
        type=str,
        required=True,
        help="Date range: preset (today, last_7d, last_30d, this_month) or YYYY-MM-DD,YYYY-MM-DD",
    )
    parser.add_argument(
        "--level",
        type=str,
        default="ad",
        choices=["campaign", "adset", "ad"],
        help="Reporting level (default: ad)",
    )
    parser.add_argument(
        "--breakdowns",
        type=str,
        default=None,
        help="Comma-separated breakdowns: age, gender, placement, device_platform",
    )
    parser.add_argument(
        "--fields",
        type=str,
        default=None,
        help="Override default fields (comma-separated)",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> None:
    args = parse_args(argv)

    breakdowns = [b.strip() for b in args.breakdowns.split(",")] if args.breakdowns else None
    fields = [f.strip() for f in args.fields.split(",")] if args.fields else None

    try:
        request = pull_insights(
            brand=args.brand,
            date_range=args.date_range,
            level=args.level,
            breakdowns=breakdowns,
            fields=fields,
        )

        # Print the MCP request for the agent
        print(json.dumps(request, indent=2))
        logger.info("MCP request emitted. Agent should execute and feed response back.")

    except ValueError as exc:
        logger.error("Validation error: %s", exc)
        sys.exit(1)
    except Exception as exc:
        logger.exception("Unexpected error: %s", exc)
        sys.exit(2)


if __name__ == "__main__":
    main()
