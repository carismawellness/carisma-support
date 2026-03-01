"""
Ad Library Search Tool
======================

Search the Meta Ad Library API for competitor and market intelligence.

Purpose:
    Query the Meta Ad Library (ads_archive endpoint) to discover competitor ads,
    creative strategies, and spending patterns. Malta is in the EU, so full
    transparency data (spend ranges, impression ranges) is available for ALL ads.

Inputs:
    --search_terms      Comma-separated search terms (e.g. "spa,wellness,massage")
    --page_ids          Comma-separated Meta Page IDs to filter by (optional)
    --country           Ad reached country code (default: MT for Malta)
    --ad_type           Type of ads to search: ALL, POLITICAL_AND_ISSUE_ADS (default: ALL)
    --limit             Max results per page (default: 50, max 1000)
    --max_pages         Max pages to paginate through (default: 5)

Outputs:
    JSON file at .tmp/research/ad_library_{search_term}_{date}.json containing
    matched ads with creative text, spend/impression ranges, and metadata.

MCP Integration:
    Uses Fetch MCP to call https://graph.facebook.com/v21.0/ads_archive
    The agent invokes this script, which prepares the request parameters.
    Actual HTTP calls are orchestrated through the Fetch MCP server.

Usage:
    python tools/ad_library_search.py --search_terms "spa,wellness" --country MT
    python tools/ad_library_search.py --page_ids "123456789,987654321"
"""

import argparse
import json
import logging
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
TMP_DIR = BASE_DIR / ".tmp" / "research"
CONFIG_DIR = BASE_DIR / "config"

AD_LIBRARY_ENDPOINT = "https://graph.facebook.com/v21.0/ads_archive"

DEFAULT_FIELDS = [
    "id",
    "ad_creation_time",
    "ad_creative_bodies",
    "ad_creative_link_captions",
    "ad_creative_link_descriptions",
    "ad_creative_link_titles",
    "ad_delivery_start_time",
    "ad_delivery_stop_time",
    "ad_snapshot_url",
    "bylines",
    "currency",
    "delivery_by_region",
    "demographic_distribution",
    "estimated_audience_size",
    "impressions",
    "languages",
    "page_id",
    "page_name",
    "publisher_platforms",
    "spend",
]

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ad_library_search")


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

def load_access_token() -> str:
    """Load the Meta API access token from the environment."""
    token = os.environ.get("META_ACCESS_TOKEN", "")
    if not token:
        logger.warning(
            "META_ACCESS_TOKEN not set. The Fetch MCP will need it at call time."
        )
    return token


def build_request_params(
    search_terms: Optional[str] = None,
    page_ids: Optional[list[str]] = None,
    country: str = "MT",
    ad_type: str = "ALL",
    limit: int = 50,
    fields: Optional[list[str]] = None,
    after_cursor: Optional[str] = None,
) -> dict[str, Any]:
    """
    Build the query parameters for a single Ad Library API request.

    Returns a dict ready to be serialised as query-string parameters.
    """
    params: dict[str, Any] = {
        "ad_reached_countries": f'["{country}"]',
        "ad_type": ad_type,
        "limit": min(limit, 1000),
        "fields": ",".join(fields or DEFAULT_FIELDS),
    }

    access_token = load_access_token()
    if access_token:
        params["access_token"] = access_token

    if search_terms:
        params["search_terms"] = search_terms

    if page_ids:
        params["search_page_ids"] = ",".join(page_ids)

    if after_cursor:
        params["after"] = after_cursor

    return params


def build_full_url(params: dict[str, Any]) -> str:
    """Build the full URL with query parameters for Fetch MCP."""
    from urllib.parse import urlencode
    return f"{AD_LIBRARY_ENDPOINT}?{urlencode(params)}"


def parse_api_response(raw_response: dict[str, Any]) -> tuple[list[dict], Optional[str]]:
    """
    Parse the Ad Library API JSON response.

    Returns:
        (list_of_ad_records, next_cursor_or_None)
    """
    ads = raw_response.get("data", [])
    paging = raw_response.get("paging", {})
    cursors = paging.get("cursors", {})
    next_cursor = cursors.get("after") if "next" in paging else None
    return ads, next_cursor


def calculate_backoff(attempt: int, base: float = 1.0, max_wait: float = 60.0) -> float:
    """Exponential backoff with jitter for rate-limit handling."""
    import random
    wait = min(base * (2 ** attempt) + random.uniform(0, 1), max_wait)
    return wait


def enrich_ad_record(ad: dict[str, Any]) -> dict[str, Any]:
    """
    Normalise and enrich a single ad record for easier downstream processing.

    - Flattens spend/impression ranges into min/max numeric fields.
    - Adds a retrieval timestamp.
    """
    enriched = dict(ad)

    # Flatten spend range
    spend = ad.get("spend", {})
    if isinstance(spend, dict):
        enriched["spend_lower"] = spend.get("lower_bound")
        enriched["spend_upper"] = spend.get("upper_bound")
    else:
        enriched["spend_lower"] = None
        enriched["spend_upper"] = None

    # Flatten impressions range
    impressions = ad.get("impressions", {})
    if isinstance(impressions, dict):
        enriched["impressions_lower"] = impressions.get("lower_bound")
        enriched["impressions_upper"] = impressions.get("upper_bound")
    else:
        enriched["impressions_lower"] = None
        enriched["impressions_upper"] = None

    enriched["_retrieved_at"] = datetime.utcnow().isoformat() + "Z"
    return enriched


def compile_output(
    all_ads: list[dict[str, Any]],
    search_terms: Optional[str],
    page_ids: Optional[list[str]],
    country: str,
) -> dict[str, Any]:
    """Compile the final output payload."""
    return {
        "metadata": {
            "source": "meta_ad_library",
            "endpoint": AD_LIBRARY_ENDPOINT,
            "search_terms": search_terms,
            "page_ids": page_ids,
            "country": country,
            "total_ads_found": len(all_ads),
            "retrieved_at": datetime.utcnow().isoformat() + "Z",
        },
        "ads": all_ads,
    }


def save_output(data: dict[str, Any], search_terms: Optional[str]) -> Path:
    """Write the output JSON to .tmp/research/."""
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d")
    slug = (search_terms or "page_search").replace(",", "_").replace(" ", "_")[:60]
    filename = f"ad_library_{slug}_{date_str}.json"
    output_path = TMP_DIR / filename

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    logger.info("Output saved to %s", output_path)
    return output_path


# ---------------------------------------------------------------------------
# Orchestration (called by agent or CLI)
# ---------------------------------------------------------------------------

def search_ad_library(
    search_terms: Optional[str] = None,
    page_ids: Optional[list[str]] = None,
    country: str = "MT",
    ad_type: str = "ALL",
    limit: int = 50,
    max_pages: int = 5,
) -> dict[str, Any]:
    """
    High-level function to search the Meta Ad Library.

    This builds the request parameters for each page. In production, the
    agent passes these to the Fetch MCP server which performs the actual
    HTTP call. The response JSON is then fed back through parse_api_response.

    For CLI testing, this function returns the compiled output dict and also
    prints the Fetch MCP request instructions.

    Returns:
        The compiled output dict (metadata + ads list).
    """
    if not search_terms and not page_ids:
        raise ValueError("At least one of search_terms or page_ids is required.")

    all_ads: list[dict[str, Any]] = []
    after_cursor: Optional[str] = None

    for page_num in range(1, max_pages + 1):
        logger.info("Building request for page %d / %d", page_num, max_pages)

        params = build_request_params(
            search_terms=search_terms,
            page_ids=page_ids,
            country=country,
            ad_type=ad_type,
            limit=limit,
            after_cursor=after_cursor,
        )

        url = build_full_url(params)

        # Emit the request for the agent / Fetch MCP to execute
        request_instruction = {
            "mcp_tool": "fetch",
            "method": "GET",
            "url": url,
            "description": f"Ad Library search page {page_num}",
            "rate_limit_handling": {
                "on_429": "exponential_backoff",
                "max_retries": 3,
            },
        }

        logger.info(
            "Fetch MCP request for page %d:\n%s",
            page_num,
            json.dumps(request_instruction, indent=2),
        )

        # In agent-orchestrated mode, the agent executes the fetch and feeds
        # the response back. For offline/testing, we stop here.
        print(json.dumps(request_instruction))

        # Placeholder: in real execution the agent would provide the response.
        # We break here; the agent loop handles pagination.
        logger.info(
            "Emitted request for page %d. Agent should execute via Fetch MCP "
            "and call parse_api_response() with the result.",
            page_num,
        )
        break  # Agent handles the loop externally

    output = compile_output(all_ads, search_terms, page_ids, country)
    return output


def process_fetch_response(
    raw_json: dict[str, Any],
) -> tuple[list[dict[str, Any]], Optional[str]]:
    """
    Process a raw Fetch MCP response from the Ad Library API.

    The agent calls this after receiving each page of results.

    Returns:
        (enriched_ads, next_cursor_or_None)
    """
    ads, next_cursor = parse_api_response(raw_json)
    enriched = [enrich_ad_record(ad) for ad in ads]
    logger.info("Processed %d ads from response. Next cursor: %s", len(enriched), bool(next_cursor))
    return enriched, next_cursor


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Search Meta Ad Library API for competitor intelligence.",
    )
    parser.add_argument(
        "--search_terms",
        type=str,
        default=None,
        help='Comma-separated search terms (e.g. "spa,wellness")',
    )
    parser.add_argument(
        "--page_ids",
        type=str,
        default=None,
        help="Comma-separated Meta Page IDs to filter by",
    )
    parser.add_argument(
        "--country",
        type=str,
        default="MT",
        help="Ad reached country code (default: MT)",
    )
    parser.add_argument(
        "--ad_type",
        type=str,
        default="ALL",
        choices=["ALL", "POLITICAL_AND_ISSUE_ADS"],
        help="Type of ads to search (default: ALL)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=50,
        help="Results per page (default: 50, max 1000)",
    )
    parser.add_argument(
        "--max_pages",
        type=int,
        default=5,
        help="Maximum pages to paginate through (default: 5)",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> None:
    args = parse_args(argv)

    page_ids = args.page_ids.split(",") if args.page_ids else None

    try:
        output = search_ad_library(
            search_terms=args.search_terms,
            page_ids=page_ids,
            country=args.country,
            ad_type=args.ad_type,
            limit=args.limit,
            max_pages=args.max_pages,
        )

        output_path = save_output(output, args.search_terms)
        logger.info("Search complete. Output: %s", output_path)

    except ValueError as exc:
        logger.error("Validation error: %s", exc)
        sys.exit(1)
    except Exception as exc:
        logger.exception("Unexpected error during ad library search: %s", exc)
        sys.exit(2)


if __name__ == "__main__":
    main()
