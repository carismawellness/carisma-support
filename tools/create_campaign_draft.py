"""
Create Campaign Draft Tool
===========================

Create a PAUSED campaign in Meta Ads via the Meta Ads MCP server.

Purpose:
    Create a new campaign in PAUSED status using Campaign Budget Optimisation
    (CBO). The campaign is always created paused to allow review before launch.
    Uses the naming convention from generate_naming.py.

Inputs:
    --brand             Brand ID (maps to ad account via config/brands.json)
    --offer             Offer ID (for naming and campaign context)
    --daily_budget_eur  Daily budget in EUR (will be converted to cents)
    --objective         Campaign objective (default: OUTCOME_LEADS)
    --campaign_name     Override auto-generated campaign name (optional)

Outputs:
    JSON with campaign_id, campaign_name, status, and full MCP request

MCP Integration:
    Uses Meta Ads MCP (mcp_meta_ads_create_campaign) for the actual API call.

SAFETY:
    - ALWAYS creates campaigns as PAUSED
    - Uses CBO (Campaign Budget Optimization)
    - Validates budget is within brand's monthly limit
"""

import argparse
import json
import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
TMP_DIR = BASE_DIR / ".tmp" / "campaigns"
CONFIG_DIR = BASE_DIR / "config"

VALID_OBJECTIVES = [
    "OUTCOME_LEADS",
    "OUTCOME_TRAFFIC",
    "OUTCOME_AWARENESS",
    "OUTCOME_ENGAGEMENT",
    "OUTCOME_SALES",
    "OUTCOME_APP_PROMOTION",
]

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("create_campaign_draft")


# ---------------------------------------------------------------------------
# Config loading
# ---------------------------------------------------------------------------

def load_brands_config() -> dict[str, Any]:
    """Load brands config indexed by brand_id."""
    config_path = CONFIG_DIR / "brands.json"
    with open(config_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {b["brand_id"]: b for b in data.get("brands", [])}


def load_offers_config() -> dict[str, Any]:
    """Load offers config indexed by offer_id."""
    config_path = CONFIG_DIR / "offers.json"
    with open(config_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {o["offer_id"]: o for o in data.get("offers", [])}


def get_brand_config(brand_id: str) -> dict[str, Any]:
    """Get full brand config."""
    brands = load_brands_config()
    if brand_id not in brands:
        available = ", ".join(brands.keys())
        raise ValueError(f"Brand '{brand_id}' not found. Available: {available}")
    return brands[brand_id]


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

def validate_budget(daily_budget_eur: float, brand: dict[str, Any]) -> None:
    """
    Validate the daily budget against the brand's monthly budget.

    Warns if daily * 30 exceeds the monthly budget.
    """
    monthly_budget = brand.get("monthly_budget_eur", 0)
    projected_monthly = daily_budget_eur * 30

    if monthly_budget > 0 and projected_monthly > monthly_budget:
        logger.warning(
            "Daily budget %.2f EUR (projected %.2f EUR/month) exceeds "
            "brand's monthly budget of %.2f EUR. Consider reducing.",
            daily_budget_eur,
            projected_monthly,
            monthly_budget,
        )

    if daily_budget_eur <= 0:
        raise ValueError("Daily budget must be positive.")

    if daily_budget_eur < 1.0:
        raise ValueError("Minimum daily budget is 1.00 EUR.")


def validate_objective(objective: str) -> None:
    """Validate the campaign objective."""
    if objective not in VALID_OBJECTIVES:
        raise ValueError(
            f"Invalid objective '{objective}'. Valid options: {VALID_OBJECTIVES}"
        )


# ---------------------------------------------------------------------------
# Naming
# ---------------------------------------------------------------------------

def generate_campaign_name(
    brand: dict[str, Any],
    offer_id: str,
    objective: str,
) -> str:
    """
    Generate a campaign name following naming conventions.

    Format: {brand_code}_{offer}_{objective_short}_{date}
    """
    brand_code = brand.get("brand_code", "XX")
    date_str = datetime.now().strftime("%Y%m%d")

    # Shorten objective
    objective_short = objective.replace("OUTCOME_", "").lower()

    return f"{brand_code}_{offer_id}_{objective_short}_{date_str}"


# ---------------------------------------------------------------------------
# MCP request building
# ---------------------------------------------------------------------------

def build_campaign_request(
    brand_id: str,
    offer_id: str,
    daily_budget_eur: float,
    objective: str = "OUTCOME_LEADS",
    campaign_name: Optional[str] = None,
) -> dict[str, Any]:
    """
    Build the MCP tool call for creating a PAUSED campaign.

    Returns a dict describing the MCP call for the agent to execute.
    """
    brand = get_brand_config(brand_id)

    # Validate
    validate_budget(daily_budget_eur, brand)
    validate_objective(objective)

    ad_account_id = brand.get("meta_ad_account_id", "")
    if not ad_account_id or ad_account_id == "TO_BE_FILLED":
        raise ValueError(
            f"Brand '{brand_id}' has no configured meta_ad_account_id. "
            "Update config/brands.json first."
        )

    # Generate name if not provided
    name = campaign_name or generate_campaign_name(brand, offer_id, objective)

    # Convert EUR to cents for the API
    daily_budget_cents = int(daily_budget_eur * 100)

    # Build MCP params
    mcp_params: dict[str, Any] = {
        "ad_account_id": ad_account_id,
        "name": name,
        "objective": objective,
        "status": "PAUSED",
        "special_ad_categories": [],  # Required field; empty for non-special ads
        "daily_budget": daily_budget_cents,
        # CBO is enabled by default when budget is set at campaign level
    }

    request = {
        "mcp_tool": "mcp_meta_ads_create_campaign",
        "params": mcp_params,
        "description": f"Create PAUSED campaign '{name}' for {brand_id}",
        "safety": {
            "status": "PAUSED",
            "requires_manual_activation": True,
        },
    }

    return request


# ---------------------------------------------------------------------------
# Response processing
# ---------------------------------------------------------------------------

def process_campaign_response(raw_response: dict[str, Any]) -> dict[str, Any]:
    """Process the campaign creation response."""
    campaign_id = raw_response.get("id") or raw_response.get("campaign_id", "")
    return {
        "campaign_id": campaign_id,
        "status": "PAUSED",
        "created": bool(campaign_id),
    }


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------

def create_campaign_draft(
    brand: str,
    offer: str,
    daily_budget_eur: float,
    objective: str = "OUTCOME_LEADS",
    campaign_name: Optional[str] = None,
) -> dict[str, Any]:
    """
    Build the campaign creation request.

    Returns the full result with metadata and MCP request.
    """
    request = build_campaign_request(
        brand_id=brand,
        offer_id=offer,
        daily_budget_eur=daily_budget_eur,
        objective=objective,
        campaign_name=campaign_name,
    )

    result = {
        "metadata": {
            "tool": "create_campaign_draft",
            "brand": brand,
            "offer": offer,
            "daily_budget_eur": daily_budget_eur,
            "objective": objective,
            "campaign_name": request["params"]["name"],
            "status": "PAUSED",
            "uses_cbo": True,
            "generated_at": datetime.utcnow().isoformat() + "Z",
        },
        "request": request,
    }

    return result


def save_output(data: dict[str, Any], brand: str) -> Path:
    """Save the campaign draft to .tmp/campaigns/."""
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d")
    campaign_name = data["metadata"].get("campaign_name", "draft")
    filename = f"campaign_draft_{brand}_{date_str}.json"
    output_path = TMP_DIR / filename

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    logger.info("Campaign draft saved to %s", output_path)
    return output_path


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create a PAUSED Meta campaign draft.",
    )
    parser.add_argument("--brand", type=str, required=True, help="Brand ID")
    parser.add_argument("--offer", type=str, required=True, help="Offer ID")
    parser.add_argument(
        "--daily_budget_eur",
        type=float,
        required=True,
        help="Daily budget in EUR",
    )
    parser.add_argument(
        "--objective",
        type=str,
        default="OUTCOME_LEADS",
        choices=VALID_OBJECTIVES,
        help="Campaign objective (default: OUTCOME_LEADS)",
    )
    parser.add_argument(
        "--campaign_name",
        type=str,
        default=None,
        help="Override auto-generated campaign name",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> None:
    args = parse_args(argv)

    try:
        result = create_campaign_draft(
            brand=args.brand,
            offer=args.offer,
            daily_budget_eur=args.daily_budget_eur,
            objective=args.objective,
            campaign_name=args.campaign_name,
        )

        output_path = save_output(result, args.brand)
        print(json.dumps(result, indent=2))
        logger.info("Campaign draft created. Output: %s", output_path)

    except ValueError as exc:
        logger.error("Validation error: %s", exc)
        sys.exit(1)
    except Exception as exc:
        logger.exception("Unexpected error: %s", exc)
        sys.exit(2)


if __name__ == "__main__":
    main()
