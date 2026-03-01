"""
Create Ad Draft Tool
====================

Create a PAUSED ad in Meta Ads via the Meta Ads MCP server.

Purpose:
    Create a new ad within an existing ad set. Always created as PAUSED.
    Links a creative (image_hash or video_id) to an ad set.

Inputs:
    --adset_id          Parent ad set ID
    --brand             Brand ID (for ad account lookup)
    --creative_spec     JSON string or file with creative spec (image_hash, video_id, etc.)
    --ad_name           Name for the ad
    --tracking_specs    Optional tracking specs JSON

Outputs:
    JSON with ad_id, name, status, and full MCP request

MCP Integration:
    Uses Meta Ads MCP (mcp_meta_ads_create_ad).

SAFETY:
    - ALWAYS creates ads as PAUSED
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

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("create_ad_draft")


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
# Creative spec parsing
# ---------------------------------------------------------------------------

def parse_creative_spec(creative_input: str) -> dict[str, Any]:
    """
    Parse creative spec from a JSON string or file path.

    The creative spec should contain the fields needed for the ad creative:
    - For image ads: image_hash, page_id, link, message, etc.
    - For video ads: video_id, page_id, message, etc.
    - Or a pre-built creative_id to reference an existing creative
    """
    # Try as file path
    spec_path = Path(creative_input)
    if spec_path.exists() and spec_path.is_file():
        with open(spec_path, "r", encoding="utf-8") as f:
            return json.load(f)

    # Try as JSON string
    try:
        return json.loads(creative_input)
    except json.JSONDecodeError:
        raise ValueError(
            f"Could not parse creative_spec as JSON or file path: {creative_input[:100]}"
        )


def build_creative_from_spec(
    spec: dict[str, Any],
    brand: dict[str, Any],
) -> dict[str, Any]:
    """
    Build the ad creative object from a creative spec.

    Handles both pre-built creative_id references and inline creative specs.
    """
    # If a creative_id is provided, use it directly
    if "creative_id" in spec:
        return {"creative_id": spec["creative_id"]}

    page_id = spec.get("page_id") or brand.get("meta_page_id", "")
    instagram_id = spec.get("instagram_account_id") or brand.get("instagram_account_id", "")

    creative: dict[str, Any] = {}

    # Image ad
    if "image_hash" in spec:
        creative = {
            "object_story_spec": {
                "page_id": page_id,
                "link_data": {
                    "image_hash": spec["image_hash"],
                    "link": spec.get("link", brand.get("website_url", "")),
                    "message": spec.get("primary_text", ""),
                    "name": spec.get("headline", ""),
                    "description": spec.get("description", ""),
                    "call_to_action": {
                        "type": spec.get("cta_type", "LEARN_MORE"),
                    },
                },
            },
        }

    # Video ad
    elif "video_id" in spec:
        creative = {
            "object_story_spec": {
                "page_id": page_id,
                "video_data": {
                    "video_id": spec["video_id"],
                    "message": spec.get("primary_text", ""),
                    "title": spec.get("headline", ""),
                    "call_to_action": {
                        "type": spec.get("cta_type", "LEARN_MORE"),
                        "value": {
                            "link": spec.get("link", brand.get("website_url", "")),
                        },
                    },
                },
            },
        }
        # Add thumbnail if provided
        if "image_hash" in spec:
            creative["object_story_spec"]["video_data"]["image_hash"] = spec["image_hash"]

    else:
        raise ValueError(
            "Creative spec must contain 'creative_id', 'image_hash', or 'video_id'."
        )

    # Add Instagram account if available
    if instagram_id and instagram_id != "TO_BE_FILLED":
        creative.setdefault("object_story_spec", {})["instagram_actor_id"] = instagram_id

    return creative


# ---------------------------------------------------------------------------
# MCP request building
# ---------------------------------------------------------------------------

def build_ad_request(
    adset_id: str,
    brand_id: str,
    creative_spec: str,
    ad_name: str,
    tracking_specs: Optional[str] = None,
) -> dict[str, Any]:
    """
    Build the MCP tool call for creating a PAUSED ad.
    """
    brand = get_brand_config(brand_id)
    ad_account_id = brand.get("meta_ad_account_id", "")

    if not ad_account_id or ad_account_id == "TO_BE_FILLED":
        raise ValueError(
            f"Brand '{brand_id}' has no configured meta_ad_account_id."
        )

    # Parse creative spec
    spec = parse_creative_spec(creative_spec)
    creative = build_creative_from_spec(spec, brand)

    # Build MCP params
    mcp_params: dict[str, Any] = {
        "ad_account_id": ad_account_id,
        "adset_id": adset_id,
        "name": ad_name,
        "status": "PAUSED",
        "creative": creative,
    }

    # Add tracking specs if provided
    if tracking_specs:
        try:
            ts_path = Path(tracking_specs)
            if ts_path.exists():
                with open(ts_path, "r", encoding="utf-8") as f:
                    mcp_params["tracking_specs"] = json.load(f)
            else:
                mcp_params["tracking_specs"] = json.loads(tracking_specs)
        except (json.JSONDecodeError, OSError):
            logger.warning("Could not parse tracking_specs. Skipping.")

    request = {
        "mcp_tool": "mcp_meta_ads_create_ad",
        "params": mcp_params,
        "description": f"Create PAUSED ad '{ad_name}' in ad set {adset_id}",
        "safety": {
            "status": "PAUSED",
            "requires_manual_activation": True,
        },
    }

    return request


# ---------------------------------------------------------------------------
# Response processing
# ---------------------------------------------------------------------------

def process_ad_response(raw_response: dict[str, Any]) -> dict[str, Any]:
    """Process the ad creation response."""
    ad_id = raw_response.get("id") or raw_response.get("ad_id", "")
    return {
        "ad_id": ad_id,
        "status": "PAUSED",
        "created": bool(ad_id),
    }


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------

def create_ad_draft(
    adset_id: str,
    brand: str,
    creative_spec: str,
    ad_name: str,
    tracking_specs: Optional[str] = None,
) -> dict[str, Any]:
    """
    Build the ad creation request.

    Returns the full result with metadata and MCP request.
    """
    request = build_ad_request(
        adset_id=adset_id,
        brand_id=brand,
        creative_spec=creative_spec,
        ad_name=ad_name,
        tracking_specs=tracking_specs,
    )

    result = {
        "metadata": {
            "tool": "create_ad_draft",
            "brand": brand,
            "adset_id": adset_id,
            "ad_name": ad_name,
            "status": "PAUSED",
            "generated_at": datetime.utcnow().isoformat() + "Z",
        },
        "request": request,
    }

    return result


def save_output(data: dict[str, Any], brand: str, ad_name: str) -> Path:
    """Save the ad draft."""
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d")
    safe_name = ad_name.replace(" ", "_").replace("/", "_")[:40]
    filename = f"ad_draft_{brand}_{safe_name}_{date_str}.json"
    output_path = TMP_DIR / filename

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    logger.info("Ad draft saved to %s", output_path)
    return output_path


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create a PAUSED Meta ad draft.",
    )
    parser.add_argument("--adset_id", type=str, required=True, help="Parent ad set ID")
    parser.add_argument("--brand", type=str, required=True, help="Brand ID")
    parser.add_argument(
        "--creative_spec",
        type=str,
        required=True,
        help="JSON creative spec (string or file path)",
    )
    parser.add_argument("--ad_name", type=str, required=True, help="Name for the ad")
    parser.add_argument(
        "--tracking_specs",
        type=str,
        default=None,
        help="Optional tracking specs JSON (string or file path)",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> None:
    args = parse_args(argv)

    try:
        result = create_ad_draft(
            adset_id=args.adset_id,
            brand=args.brand,
            creative_spec=args.creative_spec,
            ad_name=args.ad_name,
            tracking_specs=args.tracking_specs,
        )

        output_path = save_output(result, args.brand, args.ad_name)
        print(json.dumps(result, indent=2))
        logger.info("Ad draft created. Output: %s", output_path)

    except ValueError as exc:
        logger.error("Validation error: %s", exc)
        sys.exit(1)
    except Exception as exc:
        logger.exception("Unexpected error: %s", exc)
        sys.exit(2)


if __name__ == "__main__":
    main()
