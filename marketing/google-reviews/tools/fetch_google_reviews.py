#!/usr/bin/env python3
"""
Google Review Fetcher — Generates a review fetch plan and Playwright MCP
instructions for retrieving recent Google reviews for Carisma brands.

Usage:
    python marketing/google-reviews/tools/fetch_google_reviews.py --brand_id all
    python marketing/google-reviews/tools/fetch_google_reviews.py --brand_id carisma_spa --days_back 7
    python marketing/google-reviews/tools/fetch_google_reviews.py --brand_id carisma_aesthetics --output_dir .tmp/reviews/fetched

Inputs:
    --brand_id     Brand ID or "all" (required)
    --days_back    How many days back to check for reviews (default: 30)
    --output_dir   Output directory (default: .tmp/reviews/fetched)

Outputs:
    JSON files at {output_dir}/review_fetch_plan_{brand}_{date}.json

No MCP Integration:
    This tool generates a fetch plan with Playwright MCP instructions. The
    agent uses this plan to navigate to Google Maps, take snapshots of the
    reviews page, and parse review data from the snapshots.
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
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
CONFIG_DIR = BASE_DIR / "config"
MARKETING_DIR = BASE_DIR / "marketing"
REVIEWS_DIR = MARKETING_DIR / "google-reviews"
GBP_DIR = MARKETING_DIR / "google-gmb"
DEFAULT_OUTPUT_DIR = BASE_DIR / ".tmp" / "reviews" / "fetched"
RESPONSE_LOG_DIR = BASE_DIR / ".tmp" / "reviews" / "logs"

# Brand code mapping (matches config/brands.json)
BRAND_CODES = {
    "carisma_spa": "CS",
    "carisma_aesthetics": "CA",
    "carisma_slimming": "SLIM",
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("fetch_google_reviews")


# ---------------------------------------------------------------------------
# Config loading
# ---------------------------------------------------------------------------

def load_brands_config() -> dict[str, Any]:
    """Load brands config indexed by brand_id."""
    config_path = CONFIG_DIR / "brands.json"
    if not config_path.exists():
        raise FileNotFoundError(f"Brands config not found: {config_path}")
    with open(config_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {b["brand_id"]: b for b in data.get("brands", [])}


def load_locations_config() -> dict[str, Any]:
    """Load GBP locations config for profile URLs."""
    config_path = GBP_DIR / "locations.json"
    if not config_path.exists():
        logger.warning("No locations.json found at %s.", config_path)
        return {}
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_response_rules() -> dict[str, Any]:
    """Load review response rules config."""
    config_path = REVIEWS_DIR / "review-response-rules.json"
    if not config_path.exists():
        logger.warning("No review-response-rules.json found at %s.", config_path)
        return {}
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_response_log(brand_id: str) -> list[dict[str, Any]]:
    """Load the response log for a brand to track which reviews have been responded to."""
    log_path = RESPONSE_LOG_DIR / f"response_log_{brand_id}.json"
    if not log_path.exists():
        return []
    try:
        with open(log_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        logger.warning("Could not read response log at %s. Starting fresh.", log_path)
        return []


def save_response_log(brand_id: str, log_entries: list[dict[str, Any]]) -> None:
    """Save response log entries. Keeps the last 200 entries."""
    RESPONSE_LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_path = RESPONSE_LOG_DIR / f"response_log_{brand_id}.json"

    existing = load_response_log(brand_id)
    combined = existing + log_entries
    # Keep only last 200 entries
    combined = combined[-200:]

    with open(log_path, "w", encoding="utf-8") as f:
        json.dump(combined, f, indent=2, ensure_ascii=False)

    logger.info("Saved %d log entries to %s", len(log_entries), log_path)


# ---------------------------------------------------------------------------
# Fetch plan generation
# ---------------------------------------------------------------------------

def generate_playwright_instructions(
    brand_id: str,
    brand_name: str,
    location: dict[str, Any],
) -> list[dict[str, str]]:
    """
    Generate Playwright MCP instructions for fetching reviews from Google Maps.

    The agent will execute these instructions step by step using the
    Playwright MCP server.
    """
    google_maps_url = location.get("google_maps_url", "")
    location_name = location.get("location_name", brand_name)
    short_name = location.get("short_name", brand_name)

    instructions = []

    # Step 1: Navigate to Google Maps for this location
    if google_maps_url and google_maps_url != "TO_BE_FILLED":
        instructions.append({
            "step": "navigate",
            "action": f"Navigate to {google_maps_url}",
            "mcp_tool": "mcp__playwright__browser_navigate",
            "params": {"url": google_maps_url},
            "note": f"Open Google Maps listing for {short_name}",
        })
    else:
        # Fallback: search Google Maps for the business
        search_query = f"{location_name} Malta"
        search_url = f"https://www.google.com/maps/search/{search_query.replace(' ', '+')}"
        instructions.append({
            "step": "navigate",
            "action": f"Search Google Maps for '{location_name}'",
            "mcp_tool": "mcp__playwright__browser_navigate",
            "params": {"url": search_url},
            "note": f"Search Google Maps for {short_name} (no direct URL available)",
        })

    # Step 2: Take snapshot of the listing
    instructions.append({
        "step": "snapshot_listing",
        "action": "Take snapshot of the business listing page",
        "mcp_tool": "mcp__playwright__browser_snapshot",
        "params": {},
        "note": "Capture the listing to verify correct business and see overall rating",
    })

    # Step 3: Click on the Reviews tab/section
    instructions.append({
        "step": "click_reviews",
        "action": "Click the 'Reviews' tab or section to show all reviews",
        "mcp_tool": "mcp__playwright__browser_click",
        "params": {"element": "Reviews tab or button"},
        "note": "Open the full reviews list. Look for a tab labelled 'Reviews' or a link showing the review count",
    })

    # Step 4: Sort by newest
    instructions.append({
        "step": "sort_newest",
        "action": "Sort reviews by 'Newest' to see most recent first",
        "mcp_tool": "mcp__playwright__browser_click",
        "params": {"element": "Sort by dropdown, then select 'Newest'"},
        "note": "Ensure we see the most recent reviews first",
    })

    # Step 5: Take snapshot of reviews
    instructions.append({
        "step": "snapshot_reviews",
        "action": "Take snapshot of the reviews page",
        "mcp_tool": "mcp__playwright__browser_snapshot",
        "params": {},
        "note": "Capture all visible reviews. The agent will parse reviewer name, rating, date, review text, and whether a response exists",
    })

    # Step 6: Scroll and snapshot for more reviews if needed
    instructions.append({
        "step": "scroll_and_snapshot",
        "action": "Scroll down to load more reviews, then take another snapshot",
        "mcp_tool": "mcp__playwright__browser_press_key",
        "params": {"key": "End"},
        "note": "Scroll to load additional reviews. Take another snapshot if more reviews loaded. Repeat until all reviews within the date range are captured",
    })

    return instructions


def generate_fetch_plan_for_brand(
    brand_id: str,
    brand_config: dict[str, Any],
    locations_config: dict[str, Any],
    response_rules: dict[str, Any],
    days_back: int,
    generation_date: datetime,
) -> dict[str, Any]:
    """Generate a complete review fetch plan for a single brand."""
    brand_name = brand_config.get("brand_name", "Carisma")
    brand_code = BRAND_CODES.get(brand_id, brand_id[:2].upper())

    # Get locations for this brand
    brand_locations_data = locations_config.get("brands", {}).get(brand_id, {})
    locations = brand_locations_data.get("locations", [])

    if not locations:
        logger.warning("No locations found for brand %s.", brand_id)
        locations = [{"location_name": brand_name, "short_name": brand_name, "area": "Malta"}]

    # Load existing response log
    response_log = load_response_log(brand_id)
    responded_review_ids = {
        entry.get("review_id") for entry in response_log if entry.get("status") == "responded"
    }

    # Calculate date threshold
    date_threshold = generation_date - timedelta(days=days_back)

    # Generate instructions for each location
    location_plans = []
    for location in locations:
        instructions = generate_playwright_instructions(brand_id, brand_name, location)
        location_plans.append({
            "location_name": location.get("location_name", brand_name),
            "short_name": location.get("short_name", brand_name),
            "area": location.get("area", "Malta"),
            "gbp_profile_url": location.get("gbp_profile_url", ""),
            "google_maps_url": location.get("google_maps_url", ""),
            "playwright_instructions": instructions,
        })

    # Get brand contact details from response rules
    brand_contacts = response_rules.get("brand_contacts", {}).get(brand_id, {})

    # Build the fetch plan
    fetch_plan = {
        "metadata": {
            "tool": "fetch_google_reviews",
            "brand_id": brand_id,
            "brand_name": brand_name,
            "brand_code": brand_code,
            "generated_at": generation_date.isoformat(),
            "days_back": days_back,
            "date_threshold": date_threshold.isoformat(),
            "status": "pending_execution",
        },
        "brand_contacts": brand_contacts,
        "response_rules_summary": {
            "5_star": response_rules.get("response_rules", {}).get("5_star", {}).get("approach", ""),
            "4_star": response_rules.get("response_rules", {}).get("4_star", {}).get("approach", ""),
            "3_star": response_rules.get("response_rules", {}).get("3_star", {}).get("approach", ""),
            "1_2_star": response_rules.get("response_rules", {}).get("1_2_star", {}).get("approach", ""),
        },
        "forbidden_phrases": response_rules.get("forbidden_phrases", []),
        "already_responded_count": len(responded_review_ids),
        "locations": location_plans,
        "agent_instructions": {
            "parse_reviews": (
                "After taking snapshots, parse each visible review and extract: "
                "reviewer_name, rating (1-5 stars), review_date, review_text, "
                "has_owner_response (true/false), owner_response_text (if exists). "
                "Filter out reviews older than the date_threshold and reviews that "
                "already have an owner response."
            ),
            "categorise_reviews": (
                "Group unresponded reviews by rating tier: "
                "5_star, 4_star, 3_star, 1_2_star. "
                "Flag any reviews matching abusive_review_policy indicators."
            ),
            "next_step": (
                "After fetching and categorising reviews, proceed to generate "
                "responses using the review-response skill (AGENT.md Phase 4)."
            ),
        },
    }

    return fetch_plan


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------

def save_output(
    fetch_plan: dict[str, Any],
    brand_id: str,
    output_dir: Path,
) -> Path:
    """Save the fetch plan to a JSON file."""
    output_dir.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d")
    filename = f"review_fetch_plan_{brand_id}_{date_str}.json"
    output_path = output_dir / filename

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(fetch_plan, f, indent=2, ensure_ascii=False)

    logger.info("Saved fetch plan to %s", output_path)
    return output_path


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate Google review fetch plans for Carisma brands.",
    )
    parser.add_argument(
        "--brand_id",
        type=str,
        required=True,
        help='Brand ID (e.g. "carisma_spa", "carisma_aesthetics", "carisma_slimming") or "all"',
    )
    parser.add_argument(
        "--days_back",
        type=int,
        default=30,
        help="How many days back to check for reviews (default: 30)",
    )
    parser.add_argument(
        "--output_dir",
        type=str,
        default=None,
        help=f"Output directory (default: {DEFAULT_OUTPUT_DIR})",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> None:
    args = parse_args(argv)

    # Resolve output directory
    output_dir = Path(args.output_dir) if args.output_dir else DEFAULT_OUTPUT_DIR

    generation_date = datetime.now()
    logger.info("Generating review fetch plans (days_back=%d)", args.days_back)

    # Load configs
    try:
        brands_config = load_brands_config()
    except FileNotFoundError as exc:
        logger.error("Config file missing: %s", exc)
        sys.exit(1)

    locations_config = load_locations_config()
    response_rules = load_response_rules()

    # Determine which brands to process
    if args.brand_id == "all":
        brand_ids = [bid for bid, b in brands_config.items() if b.get("active", True)]
    else:
        if args.brand_id not in brands_config:
            logger.error(
                "Brand '%s' not found. Available: %s",
                args.brand_id,
                list(brands_config.keys()),
            )
            sys.exit(1)
        brand_ids = [args.brand_id]

    logger.info("Processing brands: %s", brand_ids)

    all_plans: dict[str, dict[str, Any]] = {}
    total_locations = 0

    for brand_id in brand_ids:
        logger.info("--- Processing brand: %s ---", brand_id)
        brand_config = brands_config[brand_id]

        fetch_plan = generate_fetch_plan_for_brand(
            brand_id=brand_id,
            brand_config=brand_config,
            locations_config=locations_config,
            response_rules=response_rules,
            days_back=args.days_back,
            generation_date=generation_date,
        )

        output_path = save_output(fetch_plan, brand_id, output_dir)
        all_plans[brand_id] = fetch_plan
        location_count = len(fetch_plan.get("locations", []))
        total_locations += location_count
        logger.info(
            "Brand %s: fetch plan generated (%d locations) -> %s",
            brand_id, location_count, output_path,
        )

    # Print summary
    summary = {
        "total_brands_processed": len(all_plans),
        "total_locations": total_locations,
        "brands": list(all_plans.keys()),
        "days_back": args.days_back,
        "output_dir": str(output_dir),
        "locations_per_brand": {
            bid: len(plan.get("locations", []))
            for bid, plan in all_plans.items()
        },
    }

    print(json.dumps(summary, indent=2))

    if not all_plans:
        logger.warning("No fetch plans were generated. Check brand config.")
        sys.exit(1)

    logger.info(
        "Done. %d fetch plan(s) generated across %d location(s).",
        len(all_plans), total_locations,
    )


if __name__ == "__main__":
    main()
