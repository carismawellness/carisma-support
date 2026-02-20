"""
Generate Naming Tool
====================

Generate standardised names for Meta Ads entities following naming conventions.

Purpose:
    Ensure consistent naming across campaigns, ad sets, and ads. Loads naming
    conventions from config and applies them with the provided parameters.
    This makes reporting, filtering, and analysis much easier.

Inputs:
    --entity_type       Type: campaign, ad_set, ad
    --brand             Brand ID (for brand code lookup)
    --params            JSON string with naming parameters (offer, audience, format, hook, etc.)

Outputs:
    JSON with the generated name string and its parsed components

No MCP Integration:
    Pure Python string formatting.

Naming Convention Defaults:
    Campaign:  {brand_code}_{offer}_{objective}_{date}
    Ad Set:    {brand_code}_{offer}_{audience}_{optimization}
    Ad:        {brand_code}_{offer}_{format}_{hook_type}_{variation}_{date}
"""

import argparse
import json
import logging
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
CONFIG_DIR = BASE_DIR / "config"

# Default naming patterns (overridden by config/naming_conventions.json)
DEFAULT_CONVENTIONS: dict[str, dict[str, Any]] = {
    "campaign": {
        "pattern": "{brand_code}_{offer}_{objective}_{date}",
        "separator": "_",
        "max_length": 100,
        "required_fields": ["brand_code", "offer", "objective"],
        "optional_fields": ["date", "version"],
    },
    "ad_set": {
        "pattern": "{brand_code}_{offer}_{audience}_{optimization}",
        "separator": "_",
        "max_length": 100,
        "required_fields": ["brand_code", "offer", "audience"],
        "optional_fields": ["optimization", "geo", "placement"],
    },
    "ad": {
        "pattern": "{brand_code}_{offer}_{format}_{hook_type}_{variation}_{date}",
        "separator": "_",
        "max_length": 100,
        "required_fields": ["brand_code", "offer", "format"],
        "optional_fields": ["hook_type", "variation", "date", "version"],
    },
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("generate_naming")


# ---------------------------------------------------------------------------
# Config loading
# ---------------------------------------------------------------------------

def load_naming_conventions() -> dict[str, dict[str, Any]]:
    """Load naming conventions from config, falling back to defaults."""
    config_path = CONFIG_DIR / "naming_conventions.json"
    if config_path.exists():
        with open(config_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data.get("conventions", DEFAULT_CONVENTIONS)
    logger.info("No naming_conventions.json found. Using built-in defaults.")
    return DEFAULT_CONVENTIONS


def load_brand_code(brand_id: str) -> str:
    """Load the brand code for a given brand ID."""
    config_path = CONFIG_DIR / "brands.json"
    with open(config_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    for brand in data.get("brands", []):
        if brand["brand_id"] == brand_id:
            return brand.get("brand_code", brand_id[:2].upper())

    logger.warning("Brand '%s' not found. Using first 2 chars as code.", brand_id)
    return brand_id[:2].upper()


# ---------------------------------------------------------------------------
# Name generation
# ---------------------------------------------------------------------------

def sanitise_component(value: str) -> str:
    """
    Sanitise a naming component.

    - Lowercase
    - Replace spaces and special chars with underscores
    - Remove consecutive underscores
    - Strip leading/trailing underscores
    """
    cleaned = value.lower().strip()
    cleaned = re.sub(r"[^a-z0-9_]", "_", cleaned)
    cleaned = re.sub(r"_+", "_", cleaned)
    cleaned = cleaned.strip("_")
    return cleaned


def generate_name(
    entity_type: str,
    brand_id: str,
    params: dict[str, str],
) -> dict[str, Any]:
    """
    Generate a standardised name for a Meta Ads entity.

    Args:
        entity_type: "campaign", "ad_set", or "ad"
        brand_id: Brand identifier (used to look up brand code)
        params: Dictionary of naming parameters

    Returns:
        Dict with generated name, pattern used, and parsed components.
    """
    conventions = load_naming_conventions()

    if entity_type not in conventions:
        raise ValueError(
            f"Unknown entity type '{entity_type}'. "
            f"Available: {list(conventions.keys())}"
        )

    convention = conventions[entity_type]
    pattern = convention["pattern"]
    max_length = convention.get("max_length", 100)
    required = convention.get("required_fields", [])

    # Build the full parameters dict
    brand_code = load_brand_code(brand_id)
    full_params: dict[str, str] = {
        "brand_code": brand_code,
        "date": datetime.now().strftime("%Y%m%d"),
    }
    full_params.update(params)

    # Sanitise all values
    sanitised: dict[str, str] = {
        key: sanitise_component(str(value))
        for key, value in full_params.items()
    }

    # Check required fields
    missing = [f for f in required if f not in sanitised or not sanitised[f]]
    if missing:
        raise ValueError(
            f"Missing required naming parameters for {entity_type}: {missing}. "
            f"Provided: {list(sanitised.keys())}"
        )

    # Generate the name by substituting placeholders
    name = pattern
    for key, value in sanitised.items():
        name = name.replace(f"{{{key}}}", value)

    # Remove any unresolved placeholders (optional fields not provided)
    name = re.sub(r"\{[^}]+\}", "", name)

    # Clean up separator artifacts
    sep = convention.get("separator", "_")
    name = re.sub(f"{re.escape(sep)}+", sep, name)
    name = name.strip(sep)

    # Enforce max length
    if len(name) > max_length:
        name = name[:max_length].rstrip(sep)
        logger.warning("Name truncated to %d chars: %s", max_length, name)

    result = {
        "name": name,
        "entity_type": entity_type,
        "brand_id": brand_id,
        "brand_code": brand_code,
        "pattern": pattern,
        "components": sanitised,
        "generated_at": datetime.utcnow().isoformat() + "Z",
    }

    return result


def parse_existing_name(
    name: str,
    entity_type: str,
) -> dict[str, Optional[str]]:
    """
    Attempt to parse an existing name back into its components.

    Useful for extracting metadata from existing campaign/ad names.
    """
    conventions = load_naming_conventions()
    convention = conventions.get(entity_type, {})
    pattern = convention.get("pattern", "")
    sep = convention.get("separator", "_")

    # Extract field names from pattern
    field_names = re.findall(r"\{(\w+)\}", pattern)
    parts = name.split(sep)

    parsed: dict[str, Optional[str]] = {}
    for i, field in enumerate(field_names):
        if i < len(parts):
            parsed[field] = parts[i]
        else:
            parsed[field] = None

    # If there are extra parts, join them into the last field
    if len(parts) > len(field_names) and field_names:
        last_field = field_names[-1]
        parsed[last_field] = sep.join(parts[len(field_names) - 1:])

    return parsed


# ---------------------------------------------------------------------------
# Batch generation
# ---------------------------------------------------------------------------

def generate_campaign_set_names(
    brand_id: str,
    offer: str,
    objective: str,
    audiences: list[str],
    formats: list[str],
    hook_types: list[str],
    num_variations: int = 1,
) -> dict[str, Any]:
    """
    Generate a complete set of names for a campaign structure.

    Returns campaign name, ad set names, and ad names.
    """
    campaign = generate_name("campaign", brand_id, {
        "offer": offer,
        "objective": objective,
    })

    ad_sets: list[dict[str, Any]] = []
    ads: list[dict[str, Any]] = []

    for audience in audiences:
        adset = generate_name("ad_set", brand_id, {
            "offer": offer,
            "audience": audience,
            "optimization": "leadgen",
        })
        ad_sets.append(adset)

        for fmt in formats:
            for hook_type in hook_types:
                for var in range(1, num_variations + 1):
                    ad = generate_name("ad", brand_id, {
                        "offer": offer,
                        "format": fmt,
                        "hook_type": hook_type,
                        "variation": f"v{var}",
                    })
                    ads.append(ad)

    return {
        "campaign": campaign,
        "ad_sets": ad_sets,
        "ads": ads,
        "total_entities": 1 + len(ad_sets) + len(ads),
    }


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate standardised names for Meta Ads entities.",
    )
    parser.add_argument(
        "--entity_type",
        type=str,
        required=True,
        choices=["campaign", "ad_set", "ad"],
        help="Entity type: campaign, ad_set, or ad",
    )
    parser.add_argument("--brand", type=str, required=True, help="Brand ID")
    parser.add_argument(
        "--params",
        type=str,
        required=True,
        help='JSON string with naming parameters (e.g. \'{"offer": "spa_day", "objective": "leads"}\')',
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> None:
    args = parse_args(argv)

    try:
        params = json.loads(args.params)
    except json.JSONDecodeError:
        logger.error("Could not parse --params as JSON: %s", args.params)
        sys.exit(1)

    try:
        result = generate_name(
            entity_type=args.entity_type,
            brand_id=args.brand,
            params=params,
        )

        print(json.dumps(result, indent=2))
        logger.info("Generated name: %s", result["name"])

    except ValueError as exc:
        logger.error("Validation error: %s", exc)
        sys.exit(1)
    except Exception as exc:
        logger.exception("Unexpected error: %s", exc)
        sys.exit(2)


if __name__ == "__main__":
    main()
