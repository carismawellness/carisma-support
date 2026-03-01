"""
Create Ad Set Draft Tool
========================

Create a PAUSED ad set in Meta Ads via the Meta Ads MCP server.

Purpose:
    Create a new ad set within an existing campaign. Always created as PAUSED.
    Configures targeting, optimisation goal, and lead form.

Inputs:
    --campaign_id       Parent campaign ID
    --brand             Brand ID (for targeting defaults and naming)
    --audience_name     Human-readable audience name (e.g. "broad_women_25_55")
    --targeting         JSON string or file with targeting spec
    --optimization_goal Optimization goal (default: LEAD_GENERATION)
    --lead_form_id      Meta lead form ID
    --adset_name        Override auto-generated name (optional)
    --billing_event     Billing event (default: IMPRESSIONS)

Outputs:
    JSON with adset_id, name, status, and full MCP request

MCP Integration:
    Uses Meta Ads MCP (mcp_meta_ads_create_adset).

SAFETY:
    - ALWAYS creates ad sets as PAUSED
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

VALID_OPTIMIZATION_GOALS = [
    "LEAD_GENERATION",
    "LINK_CLICKS",
    "IMPRESSIONS",
    "REACH",
    "LANDING_PAGE_VIEWS",
    "OFFSITE_CONVERSIONS",
]

VALID_BILLING_EVENTS = ["IMPRESSIONS", "LINK_CLICKS"]

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("create_adset_draft")


# ---------------------------------------------------------------------------
# Config loading
# ---------------------------------------------------------------------------

def load_brands_config() -> dict[str, Any]:
    """Load brands config indexed by brand_id."""
    config_path = CONFIG_DIR / "brands.json"
    with open(config_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {b["brand_id"]: b for b in data.get("brands", [])}


def get_brand_config(brand_id: str) -> dict[str, Any]:
    """Get full brand config."""
    brands = load_brands_config()
    if brand_id not in brands:
        available = ", ".join(brands.keys())
        raise ValueError(f"Brand '{brand_id}' not found. Available: {available}")
    return brands[brand_id]


# ---------------------------------------------------------------------------
# Targeting
# ---------------------------------------------------------------------------

def parse_targeting(targeting_input: Optional[str], brand: dict[str, Any]) -> dict[str, Any]:
    """
    Parse targeting spec from JSON string, file, or build from brand defaults.

    If no targeting is provided, constructs a default spec from brand config.
    """
    if targeting_input:
        # Try as file path
        target_path = Path(targeting_input)
        if target_path.exists() and target_path.is_file():
            with open(target_path, "r", encoding="utf-8") as f:
                return json.load(f)

        # Try as JSON string
        try:
            return json.loads(targeting_input)
        except json.JSONDecodeError:
            raise ValueError(
                f"Could not parse targeting as JSON or file path: {targeting_input[:100]}"
            )

    # Build default from brand config
    audience = brand.get("target_audience", {})
    geo = audience.get("geo_targeting", {})

    targeting: dict[str, Any] = {
        "age_min": audience.get("age_min", 25),
        "age_max": audience.get("age_max", 65),
        "geo_locations": {
            "countries": [geo.get("country_code", "MT")],
        },
        "publisher_platforms": ["facebook", "instagram"],
        "facebook_positions": ["feed", "video_feeds", "story", "reels"],
        "instagram_positions": ["stream", "story", "reels", "explore"],
    }

    # Add gender targeting if specified
    genders = audience.get("genders", [])
    if genders:
        targeting["genders"] = genders

    # Add interest targeting
    interests = audience.get("interests", [])
    if interests:
        # Note: In the real API, interests need IDs. This is a structured placeholder
        # that the agent resolves via the targeting search API.
        targeting["flexible_spec"] = [
            {
                "interests": [
                    {"name": interest} for interest in interests
                ]
            }
        ]

    return targeting


# ---------------------------------------------------------------------------
# Naming
# ---------------------------------------------------------------------------

def generate_adset_name(
    brand: dict[str, Any],
    audience_name: str,
    optimization_goal: str,
) -> str:
    """
    Generate an ad set name following naming conventions.

    Format: {brand_code}_{audience}_{optgoal_short}
    """
    brand_code = brand.get("brand_code", "XX")
    goal_short = optimization_goal.lower().replace("_", "")[:8]
    return f"{brand_code}_{audience_name}_{goal_short}"


# ---------------------------------------------------------------------------
# MCP request building
# ---------------------------------------------------------------------------

def build_adset_request(
    campaign_id: str,
    brand_id: str,
    audience_name: str,
    targeting: Optional[str] = None,
    optimization_goal: str = "LEAD_GENERATION",
    lead_form_id: Optional[str] = None,
    adset_name: Optional[str] = None,
    billing_event: str = "IMPRESSIONS",
) -> dict[str, Any]:
    """
    Build the MCP tool call for creating a PAUSED ad set.
    """
    brand = get_brand_config(brand_id)
    ad_account_id = brand.get("meta_ad_account_id", "")

    if not ad_account_id or ad_account_id == "TO_BE_FILLED":
        raise ValueError(
            f"Brand '{brand_id}' has no configured meta_ad_account_id."
        )

    if optimization_goal not in VALID_OPTIMIZATION_GOALS:
        raise ValueError(
            f"Invalid optimization_goal '{optimization_goal}'. "
            f"Valid: {VALID_OPTIMIZATION_GOALS}"
        )

    if billing_event not in VALID_BILLING_EVENTS:
        raise ValueError(
            f"Invalid billing_event '{billing_event}'. Valid: {VALID_BILLING_EVENTS}"
        )

    # Parse targeting
    targeting_spec = parse_targeting(targeting, brand)

    # Generate name
    name = adset_name or generate_adset_name(brand, audience_name, optimization_goal)

    # Build MCP params
    mcp_params: dict[str, Any] = {
        "ad_account_id": ad_account_id,
        "campaign_id": campaign_id,
        "name": name,
        "status": "PAUSED",
        "targeting": targeting_spec,
        "optimization_goal": optimization_goal,
        "billing_event": billing_event,
    }

    # Add lead form if using lead generation
    if optimization_goal == "LEAD_GENERATION" and lead_form_id:
        mcp_params["promoted_object"] = {
            "lead_gen_form_id": lead_form_id,
            "page_id": brand.get("meta_page_id", ""),
        }
    elif optimization_goal == "LEAD_GENERATION":
        logger.warning(
            "LEAD_GENERATION optimization goal selected but no lead_form_id provided. "
            "The ad set will need a lead form to function."
        )

    request = {
        "mcp_tool": "mcp_meta_ads_create_adset",
        "params": mcp_params,
        "description": f"Create PAUSED ad set '{name}' in campaign {campaign_id}",
        "safety": {
            "status": "PAUSED",
            "requires_manual_activation": True,
        },
    }

    return request


# ---------------------------------------------------------------------------
# Response processing
# ---------------------------------------------------------------------------

def process_adset_response(raw_response: dict[str, Any]) -> dict[str, Any]:
    """Process the ad set creation response."""
    adset_id = raw_response.get("id") or raw_response.get("adset_id", "")
    return {
        "adset_id": adset_id,
        "status": "PAUSED",
        "created": bool(adset_id),
    }


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------

def create_adset_draft(
    campaign_id: str,
    brand: str,
    audience_name: str,
    targeting: Optional[str] = None,
    optimization_goal: str = "LEAD_GENERATION",
    lead_form_id: Optional[str] = None,
    adset_name: Optional[str] = None,
    billing_event: str = "IMPRESSIONS",
) -> dict[str, Any]:
    """
    Build the ad set creation request.

    Returns the full result with metadata and MCP request.
    """
    request = build_adset_request(
        campaign_id=campaign_id,
        brand_id=brand,
        audience_name=audience_name,
        targeting=targeting,
        optimization_goal=optimization_goal,
        lead_form_id=lead_form_id,
        adset_name=adset_name,
        billing_event=billing_event,
    )

    result = {
        "metadata": {
            "tool": "create_adset_draft",
            "brand": brand,
            "campaign_id": campaign_id,
            "audience_name": audience_name,
            "adset_name": request["params"]["name"],
            "optimization_goal": optimization_goal,
            "billing_event": billing_event,
            "lead_form_id": lead_form_id,
            "status": "PAUSED",
            "generated_at": datetime.utcnow().isoformat() + "Z",
        },
        "request": request,
    }

    return result


def save_output(data: dict[str, Any], brand: str) -> Path:
    """Save the ad set draft."""
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d")
    adset_name = data["metadata"].get("adset_name", "draft")
    safe_name = adset_name.replace(" ", "_")[:40]
    filename = f"adset_draft_{brand}_{safe_name}_{date_str}.json"
    output_path = TMP_DIR / filename

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    logger.info("Ad set draft saved to %s", output_path)
    return output_path


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create a PAUSED Meta ad set draft.",
    )
    parser.add_argument("--campaign_id", type=str, required=True, help="Parent campaign ID")
    parser.add_argument("--brand", type=str, required=True, help="Brand ID")
    parser.add_argument(
        "--audience_name",
        type=str,
        required=True,
        help="Audience name (e.g. broad_women_25_55)",
    )
    parser.add_argument(
        "--targeting",
        type=str,
        default=None,
        help="JSON targeting spec (string or file path). Uses brand defaults if omitted.",
    )
    parser.add_argument(
        "--optimization_goal",
        type=str,
        default="LEAD_GENERATION",
        choices=VALID_OPTIMIZATION_GOALS,
        help="Optimization goal (default: LEAD_GENERATION)",
    )
    parser.add_argument(
        "--lead_form_id",
        type=str,
        default=None,
        help="Meta lead form ID",
    )
    parser.add_argument(
        "--adset_name",
        type=str,
        default=None,
        help="Override auto-generated ad set name",
    )
    parser.add_argument(
        "--billing_event",
        type=str,
        default="IMPRESSIONS",
        choices=VALID_BILLING_EVENTS,
        help="Billing event (default: IMPRESSIONS)",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> None:
    args = parse_args(argv)

    try:
        result = create_adset_draft(
            campaign_id=args.campaign_id,
            brand=args.brand,
            audience_name=args.audience_name,
            targeting=args.targeting,
            optimization_goal=args.optimization_goal,
            lead_form_id=args.lead_form_id,
            adset_name=args.adset_name,
            billing_event=args.billing_event,
        )

        output_path = save_output(result, args.brand)
        print(json.dumps(result, indent=2))
        logger.info("Ad set draft created. Output: %s", output_path)

    except ValueError as exc:
        logger.error("Validation error: %s", exc)
        sys.exit(1)
    except Exception as exc:
        logger.exception("Unexpected error: %s", exc)
        sys.exit(2)


if __name__ == "__main__":
    main()
