#!/usr/bin/env python3
"""
GSC Quick-Win Finder — Analyses Google Search Console data to identify
ranking opportunities and automatically feed new keywords into the GBP
posting system.

Usage:
    python tools/gsc_quick_win_finder.py --brand_id all --days 28
    python tools/gsc_quick_win_finder.py --brand_id carisma_spa --days 14
    python tools/gsc_quick_win_finder.py --brand_id all  # (via launchd — exits early if not 1st/15th)

Inputs:
    --brand_id    Brand ID or "all" (required)
    --days        Lookback period in days (default: 28)
    --output_dir  Output directory (default: .tmp/seo/quick-wins)

Outputs:
    JSON files at {output_dir}/quick_wins_{brand}_{date}.json
    Auto-addition files at config/gbp/keywords_{brand}_auto_additions.json

MCP Integration:
    This tool generates MCP instruction dicts for the agent to execute
    via mcp__google-search-console__search_analytics. The agent passes
    the raw GSC response back to this tool for analysis.
"""

import argparse
import json
import logging
import os
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
GBP_CONFIG_DIR = CONFIG_DIR / "gbp"
SEO_DIR = BASE_DIR / "marketing" / "seo-optimisation"
KEYWORD_BANKS_DIR = BASE_DIR / "marketing" / "google-gmb" / "keyword-banks"
DEFAULT_OUTPUT_DIR = BASE_DIR / ".tmp" / "seo" / "quick-wins"

# Brand website mapping (used for GSC site URLs)
BRAND_SITES = {
    "carisma_spa": "sc-domain:carismaspa.com",
    "carisma_aesthetics": "sc-domain:carismaaesthetics.com",
    "carisma_slimming": "sc-domain:carismaslimming.com",
}

# Brand code mapping (matches config/brands.json)
BRAND_CODES = {
    "carisma_spa": "CS",
    "carisma_aesthetics": "CA",
    "carisma_slimming": "SLIM",
}

# Keyword bank file mapping (brand_id -> markdown filename stem)
KEYWORD_BANK_FILES = {
    "carisma_spa": "spa-keywords",
    "carisma_aesthetics": "aesthetics-keywords",
    "carisma_slimming": "slimming-keywords",
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("gsc_quick_win_finder")


# ---------------------------------------------------------------------------
# Bi-monthly schedule guard (for launchd — runs daily but only acts on 1st/15th)
# ---------------------------------------------------------------------------

def should_run_today() -> bool:
    """Check if today is the 1st or 15th of the month."""
    return datetime.now().day in (1, 15)


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


def load_quick_win_criteria() -> dict[str, Any]:
    """Load the quick-win analysis criteria from config."""
    criteria_path = SEO_DIR / "quick-win-criteria.json"
    if not criteria_path.exists():
        raise FileNotFoundError(f"Quick-win criteria not found: {criteria_path}")
    with open(criteria_path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_existing_keywords(brand_id: str) -> set[str]:
    """
    Load all existing keywords from the brand's keyword bank markdown file.

    Parses the markdown tables and bullet lists to extract every keyword
    into a flat set (lowercased) for cross-referencing against GSC data.

    Also checks for JSON keyword bank files in config/gbp/.
    """
    keywords: set[str] = set()

    # Try Markdown keyword bank first
    bank_stem = KEYWORD_BANK_FILES.get(brand_id)
    if bank_stem:
        md_path = KEYWORD_BANKS_DIR / f"{bank_stem}.md"
        if md_path.exists():
            keywords.update(_parse_keywords_from_markdown(md_path))

    # Also check JSON keyword bank in config/gbp/
    json_path = GBP_CONFIG_DIR / f"keywords_{brand_id}.json"
    if json_path.exists():
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            for category_keywords in data.values():
                if isinstance(category_keywords, list):
                    for kw in category_keywords:
                        if isinstance(kw, str):
                            keywords.add(kw.lower().strip())
        except (json.JSONDecodeError, IOError) as exc:
            logger.warning("Could not read JSON keyword bank %s: %s", json_path, exc)

    # Also check existing auto-additions file
    auto_path = GBP_CONFIG_DIR / f"keywords_{brand_id}_auto_additions.json"
    if auto_path.exists():
        try:
            with open(auto_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            for entry in data.get("keywords", []):
                kw = entry.get("keyword", "")
                if kw:
                    keywords.add(kw.lower().strip())
        except (json.JSONDecodeError, IOError) as exc:
            logger.warning("Could not read auto-additions %s: %s", auto_path, exc)

    logger.info("Loaded %d existing keywords for %s", len(keywords), brand_id)
    return keywords


def _parse_keywords_from_markdown(path: Path) -> set[str]:
    """
    Parse a keyword bank markdown file and extract all keywords into a flat set.

    Handles two formats:
    - Table rows: | keyword | ... |
    - Bullet items: - keyword
    """
    keywords: set[str] = set()

    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            # Skip headers, metadata, and separator lines
            if line.startswith("#") or line.startswith("**") or line.startswith("---"):
                continue

            # Parse table rows: | keyword | description | notes |
            if line.startswith("|") and not line.startswith("|---") and not line.startswith("| Keyword"):
                cells = [c.strip() for c in line.split("|")]
                # First non-empty cell is typically the keyword
                for cell in cells:
                    if cell and cell != "Keyword" and cell != "When to Use" and cell != "Search Intent" and cell != "Notes" and cell != "Best Post Type":
                        # Only take the first column (the keyword)
                        keywords.add(cell.lower())
                        break

            # Parse bullet items: - keyword
            elif line.startswith("- ") or line.startswith("* "):
                keyword = line[2:].strip()
                if keyword:
                    keywords.add(keyword.lower())

    return keywords


# ---------------------------------------------------------------------------
# GSC MCP instruction builder
# ---------------------------------------------------------------------------

def build_gsc_instructions(site_url: str, days: int) -> dict[str, Any]:
    """
    Generate MCP instruction dict for mcp__google-search-console__search_analytics.

    The agent executes this instruction and passes the response back for analysis.

    Args:
        site_url: GSC site URL (e.g., "sc-domain:carismaspa.com")
        days: Number of days to look back

    Returns:
        Dict with MCP tool name and parameters for the agent to execute.
    """
    return {
        "tool": "mcp__google-search-console__search_analytics",
        "parameters": {
            "site_url": site_url,
            "dimensions": ["query"],
            "date_range": f"last_{days}d",
            "row_limit": 500,
            "data_state": "final",
        },
        "description": f"Pull search analytics for {site_url} over the last {days} days",
    }


def build_gsc_instructions_emerging(site_url: str) -> dict[str, Any]:
    """
    Generate MCP instruction for 7-day data (used for emerging query detection).

    Queries that appear in 7-day data but not in 28-day data are "emerging".
    """
    return {
        "tool": "mcp__google-search-console__search_analytics",
        "parameters": {
            "site_url": site_url,
            "dimensions": ["query"],
            "date_range": "last_7d",
            "row_limit": 500,
            "data_state": "final",
        },
        "description": f"Pull 7-day search analytics for {site_url} (emerging query detection)",
    }


# ---------------------------------------------------------------------------
# Analysis functions
# ---------------------------------------------------------------------------

def categorise_query(
    query: str,
    position: float,
    impressions: int,
    ctr: float,
    criteria: dict[str, Any],
    is_emerging: bool = False,
) -> Optional[str]:
    """
    Determine which quick-win category a query falls into.

    Checks categories in priority order:
    1. local_intent — matches location keywords
    2. almost_page_1 — position 8-20 with sufficient impressions
    3. low_ctr — position 1-10 with CTR below threshold
    4. emerging — new in 7-day data with minimum impressions

    Returns the category name (str) or None if the query does not qualify.
    """
    categories = criteria.get("categories", {})
    thresholds = criteria.get("thresholds", {})
    min_impressions = thresholds.get("min_impressions_to_consider", 20)

    query_lower = query.lower()

    # Check local intent first (any position, any impressions)
    local_config = categories.get("local_intent", {})
    local_keywords = local_config.get("keywords", [])
    for lk in local_keywords:
        if lk.lower() in query_lower:
            return "local_intent"

    # Skip queries below minimum impression threshold for other categories
    if impressions < min_impressions:
        if is_emerging:
            emerging_config = categories.get("emerging", {})
            emerging_min = emerging_config.get("min_impressions", 10)
            if impressions >= emerging_min:
                return "emerging"
        return None

    # Check almost_page_1
    ap1 = categories.get("almost_page_1", {})
    if (ap1.get("position_min", 8) <= position <= ap1.get("position_max", 20)
            and impressions >= ap1.get("min_impressions", 50)):
        return "almost_page_1"

    # Check low_ctr
    lc = categories.get("low_ctr", {})
    if (lc.get("position_min", 1) <= position <= lc.get("position_max", 10)
            and ctr < lc.get("max_ctr", 0.03)):
        return "low_ctr"

    # Check emerging
    if is_emerging:
        emerging_config = categories.get("emerging", {})
        emerging_min = emerging_config.get("min_impressions", 10)
        if impressions >= emerging_min:
            return "emerging"

    return None


def cross_reference_keywords(
    quick_wins: list[dict[str, Any]],
    existing_keywords: set[str],
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """
    Split quick-win keywords into those already in banks vs new discoveries.

    Args:
        quick_wins: List of quick-win dicts with "query" keys
        existing_keywords: Set of lowercase keywords already in keyword banks

    Returns:
        Tuple of (new_keywords, existing_matches)
    """
    new_keywords: list[dict[str, Any]] = []
    existing_matches: list[dict[str, Any]] = []

    for qw in quick_wins:
        query = qw.get("query", "").lower().strip()
        if query in existing_keywords:
            existing_matches.append(qw)
        else:
            new_keywords.append(qw)

    logger.info(
        "Cross-reference: %d new keywords, %d already in banks",
        len(new_keywords),
        len(existing_matches),
    )
    return new_keywords, existing_matches


def generate_auto_additions(
    new_keywords: list[dict[str, Any]],
    brand_id: str,
    criteria: dict[str, Any],
) -> dict[str, Any]:
    """
    Create the auto-additions JSON structure for new keywords.

    Respects the auto_addition_max_per_brand threshold from criteria config.
    Maps each keyword to the correct keyword bank category using
    keyword_bank_mapping from criteria.

    Args:
        new_keywords: List of new quick-win keyword dicts
        brand_id: Brand identifier
        criteria: Quick-win criteria config

    Returns:
        Dict in auto-additions format ready to be saved.
    """
    thresholds = criteria.get("thresholds", {})
    max_per_brand = thresholds.get("auto_addition_max_per_brand", 10)
    bank_mapping = criteria.get("keyword_bank_mapping", {})

    # Sort by priority (high > medium > low) then by impressions (descending)
    priority_order = {"high": 0, "medium": 1, "low": 2}
    sorted_keywords = sorted(
        new_keywords,
        key=lambda kw: (
            priority_order.get(kw.get("priority", "low"), 3),
            -kw.get("impressions", 0),
        ),
    )

    # Cap at max per brand
    selected = sorted_keywords[:max_per_brand]

    additions = {
        "brand_id": brand_id,
        "generated_at": datetime.now().isoformat(),
        "source": "gsc_quick_win_finder",
        "run_date": datetime.now().strftime("%Y-%m-%d"),
        "total_quick_wins_found": len(new_keywords),
        "total_added": len(selected),
        "keywords": [],
    }

    for kw in selected:
        category = kw.get("category", "")
        bank_category = bank_mapping.get(category, "secondary")
        categories_config = criteria.get("categories", {})
        category_config = categories_config.get(category, {})

        additions["keywords"].append({
            "keyword": kw.get("query", ""),
            "category": bank_category,
            "source_category": category,
            "position": round(kw.get("position", 0), 1),
            "impressions": kw.get("impressions", 0),
            "clicks": kw.get("clicks", 0),
            "ctr": round(kw.get("ctr", 0), 4),
            "priority": category_config.get("priority", "medium"),
            "action": category_config.get("action", ""),
            "added_at": datetime.now().isoformat(),
        })

    return additions


# ---------------------------------------------------------------------------
# Analyse GSC data (called by agent after MCP data retrieval)
# ---------------------------------------------------------------------------

def analyse_gsc_data(
    gsc_data_28d: list[dict[str, Any]],
    gsc_data_7d: list[dict[str, Any]],
    criteria: dict[str, Any],
) -> list[dict[str, Any]]:
    """
    Analyse raw GSC data and categorise queries into quick-win buckets.

    Args:
        gsc_data_28d: Rows from 28-day GSC pull (each with query, clicks, impressions, ctr, position)
        gsc_data_7d: Rows from 7-day GSC pull (for emerging detection)
        criteria: Quick-win criteria config

    Returns:
        List of quick-win dicts, each with query, category, metrics, and priority.
    """
    thresholds = criteria.get("thresholds", {})
    max_keywords = thresholds.get("max_keywords_per_run", 30)

    # Build set of 28-day queries for emerging detection
    queries_28d = {row.get("query", "").lower() for row in gsc_data_28d}

    # Identify emerging queries (in 7-day but not in 28-day, or very low in 28-day)
    emerging_queries: set[str] = set()
    for row in gsc_data_7d:
        query = row.get("query", "").lower()
        if query not in queries_28d:
            emerging_queries.add(query)

    quick_wins: list[dict[str, Any]] = []

    # Process 28-day data
    for row in gsc_data_28d:
        query = row.get("query", "")
        position = row.get("position", 0)
        impressions = row.get("impressions", 0)
        clicks = row.get("clicks", 0)
        ctr = row.get("ctr", 0)

        is_emerging = query.lower() in emerging_queries

        category = categorise_query(
            query=query,
            position=position,
            impressions=impressions,
            ctr=ctr,
            criteria=criteria,
            is_emerging=is_emerging,
        )

        if category:
            categories_config = criteria.get("categories", {})
            category_config = categories_config.get(category, {})

            quick_wins.append({
                "query": query,
                "category": category,
                "position": round(position, 1),
                "impressions": impressions,
                "clicks": clicks,
                "ctr": round(ctr, 4),
                "priority": category_config.get("priority", "medium"),
                "action": category_config.get("action", ""),
                "is_emerging": is_emerging,
            })

    # Also process 7-day only queries (truly new)
    for row in gsc_data_7d:
        query = row.get("query", "")
        if query.lower() in emerging_queries and query.lower() not in {
            qw["query"].lower() for qw in quick_wins
        }:
            position = row.get("position", 0)
            impressions = row.get("impressions", 0)
            clicks = row.get("clicks", 0)
            ctr = row.get("ctr", 0)

            category = categorise_query(
                query=query,
                position=position,
                impressions=impressions,
                ctr=ctr,
                criteria=criteria,
                is_emerging=True,
            )

            if category:
                categories_config = criteria.get("categories", {})
                category_config = categories_config.get(category, {})

                quick_wins.append({
                    "query": query,
                    "category": category,
                    "position": round(position, 1),
                    "impressions": impressions,
                    "clicks": clicks,
                    "ctr": round(ctr, 4),
                    "priority": category_config.get("priority", "medium"),
                    "action": category_config.get("action", ""),
                    "is_emerging": True,
                })

    # Sort by priority then impressions
    priority_order = {"high": 0, "medium": 1, "low": 2}
    quick_wins.sort(
        key=lambda qw: (
            priority_order.get(qw.get("priority", "low"), 3),
            -qw.get("impressions", 0),
        ),
    )

    # Cap total
    quick_wins = quick_wins[:max_keywords]

    logger.info("Found %d quick-win keywords", len(quick_wins))
    return quick_wins


# ---------------------------------------------------------------------------
# Output functions
# ---------------------------------------------------------------------------

def save_quick_wins(
    results: dict[str, Any],
    output_dir: Path,
    brand_id: str,
) -> Path:
    """Save the full quick-wins analysis to a JSON file."""
    output_dir.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d")
    filename = f"quick_wins_{brand_id}_{date_str}.json"
    output_path = output_dir / filename

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    logger.info("Saved quick-wins analysis to %s", output_path)
    return output_path


def save_auto_additions(
    additions: dict[str, Any],
    brand_id: str,
) -> Path:
    """
    Save auto-addition keywords to config/gbp/keywords_{brand}_auto_additions.json.

    If the file already exists, merges new keywords with existing ones
    (deduplicating by keyword, case-insensitive).
    """
    GBP_CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    output_path = GBP_CONFIG_DIR / f"keywords_{brand_id}_auto_additions.json"

    # Merge with existing if present
    if output_path.exists():
        try:
            with open(output_path, "r", encoding="utf-8") as f:
                existing = json.load(f)
            existing_kws = {
                kw["keyword"].lower()
                for kw in existing.get("keywords", [])
            }
            # Add only truly new keywords
            for kw in additions.get("keywords", []):
                if kw["keyword"].lower() not in existing_kws:
                    existing["keywords"].append(kw)
                    existing_kws.add(kw["keyword"].lower())

            # Update metadata
            existing["generated_at"] = additions["generated_at"]
            existing["run_date"] = additions["run_date"]
            existing["total_added"] = len(existing["keywords"])
            additions = existing
        except (json.JSONDecodeError, IOError) as exc:
            logger.warning("Could not merge with existing auto-additions: %s", exc)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(additions, f, indent=2, ensure_ascii=False)

    logger.info(
        "Saved %d auto-addition keywords for %s to %s",
        len(additions.get("keywords", [])),
        brand_id,
        output_path,
    )
    return output_path


# ---------------------------------------------------------------------------
# Main orchestration (for agent-driven execution)
# ---------------------------------------------------------------------------

def run_analysis_for_brand(
    brand_id: str,
    gsc_data_28d: list[dict[str, Any]],
    gsc_data_7d: list[dict[str, Any]],
    criteria: dict[str, Any],
    output_dir: Path,
) -> dict[str, Any]:
    """
    Run the full quick-win analysis pipeline for a single brand.

    Called by the agent after retrieving GSC data via MCP.

    Args:
        brand_id: Brand identifier
        gsc_data_28d: 28-day GSC data rows
        gsc_data_7d: 7-day GSC data rows
        criteria: Quick-win criteria config
        output_dir: Where to save the full analysis

    Returns:
        Summary dict with results and file paths.
    """
    logger.info("--- Analysing brand: %s ---", brand_id)

    # Load existing keywords for cross-referencing
    existing_keywords = load_existing_keywords(brand_id)

    # Analyse GSC data
    quick_wins = analyse_gsc_data(gsc_data_28d, gsc_data_7d, criteria)

    if not quick_wins:
        logger.info("No quick-win keywords found for %s", brand_id)
        return {
            "brand_id": brand_id,
            "quick_wins_found": 0,
            "new_keywords": 0,
            "existing_matches": 0,
            "keywords_added": 0,
            "files": {},
        }

    # Cross-reference with existing keyword banks
    new_keywords, existing_matches = cross_reference_keywords(quick_wins, existing_keywords)

    # Generate auto-additions for new keywords
    additions = generate_auto_additions(new_keywords, brand_id, criteria)

    # Save full analysis
    analysis_results = {
        "metadata": {
            "tool": "gsc_quick_win_finder",
            "brand_id": brand_id,
            "analysed_at": datetime.now().isoformat(),
            "data_window_28d": True,
            "data_window_7d": True,
        },
        "summary": {
            "total_quick_wins": len(quick_wins),
            "new_keywords": len(new_keywords),
            "existing_matches": len(existing_matches),
            "keywords_added": len(additions.get("keywords", [])),
            "by_category": {},
        },
        "quick_wins": quick_wins,
        "new_keywords": new_keywords,
        "existing_matches": existing_matches,
        "auto_additions": additions,
    }

    # Count by category
    for qw in quick_wins:
        cat = qw.get("category", "unknown")
        if cat not in analysis_results["summary"]["by_category"]:
            analysis_results["summary"]["by_category"][cat] = 0
        analysis_results["summary"]["by_category"][cat] += 1

    # Save outputs
    qw_path = save_quick_wins(analysis_results, output_dir, brand_id)

    additions_path = None
    if additions.get("keywords"):
        additions_path = save_auto_additions(additions, brand_id)

    return {
        "brand_id": brand_id,
        "quick_wins_found": len(quick_wins),
        "new_keywords": len(new_keywords),
        "existing_matches": len(existing_matches),
        "keywords_added": len(additions.get("keywords", [])),
        "top_quick_wins": quick_wins[:10],
        "files": {
            "quick_wins": str(qw_path),
            "auto_additions": str(additions_path) if additions_path else None,
        },
    }


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Analyse Google Search Console data to find quick-win ranking opportunities.",
    )
    parser.add_argument(
        "--brand_id",
        type=str,
        required=True,
        help='Brand ID (e.g. "carisma_spa", "carisma_aesthetics", "carisma_slimming") or "all"',
    )
    parser.add_argument(
        "--days",
        type=int,
        default=28,
        help="Lookback period in days (default: 28)",
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

    # Bi-monthly guard: exit early if not 1st or 15th (for launchd scheduling)
    if not should_run_today():
        logger.info(
            "Today is the %d%s — GSC Hunter only runs on the 1st and 15th. Exiting.",
            datetime.now().day,
            _ordinal_suffix(datetime.now().day),
        )
        sys.exit(0)

    # Resolve output directory
    output_dir = Path(args.output_dir) if args.output_dir else DEFAULT_OUTPUT_DIR

    # Load configs
    try:
        brands_config = load_brands_config()
        criteria = load_quick_win_criteria()
    except FileNotFoundError as exc:
        logger.error("Config file missing: %s", exc)
        sys.exit(1)

    # Determine which brands to process
    if args.brand_id == "all":
        brand_ids = [bid for bid in BRAND_SITES if bid in brands_config]
    else:
        if args.brand_id not in brands_config:
            logger.error(
                "Brand '%s' not found. Available: %s",
                args.brand_id,
                list(brands_config.keys()),
            )
            sys.exit(1)
        brand_ids = [args.brand_id]

    logger.info("GSC Quick-Win Hunter starting for brands: %s (last %d days)", brand_ids, args.days)

    # Generate MCP instructions for the agent
    instructions: list[dict[str, Any]] = []
    for brand_id in brand_ids:
        site_url = BRAND_SITES.get(brand_id)
        if not site_url:
            logger.warning("No GSC site URL configured for %s. Skipping.", brand_id)
            continue

        instructions.append({
            "brand_id": brand_id,
            "site_url": site_url,
            "instructions_28d": build_gsc_instructions(site_url, args.days),
            "instructions_7d": build_gsc_instructions_emerging(site_url),
        })

    # Output instructions for the agent to execute
    output = {
        "status": "awaiting_gsc_data",
        "message": (
            "GSC Quick-Win Hunter is ready. The agent must execute the MCP instructions "
            "below to pull Search Console data, then pass the results back to "
            "run_analysis_for_brand() for each brand."
        ),
        "brands": brand_ids,
        "days": args.days,
        "output_dir": str(output_dir),
        "mcp_instructions": instructions,
        "criteria": criteria,
    }

    print(json.dumps(output, indent=2))
    logger.info("MCP instructions generated for %d brand(s). Awaiting agent execution.", len(instructions))


def _ordinal_suffix(day: int) -> str:
    """Return the ordinal suffix for a day number (st, nd, rd, th)."""
    if 11 <= day <= 13:
        return "th"
    last_digit = day % 10
    if last_digit == 1:
        return "st"
    if last_digit == 2:
        return "nd"
    if last_digit == 3:
        return "rd"
    return "th"


if __name__ == "__main__":
    main()
