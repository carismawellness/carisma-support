#!/usr/bin/env python3
"""
Wix Meta Optimiser — Identifies underperforming pages via Google Search Console
and generates improved meta titles and descriptions for Wix websites.

Usage:
    python tools/wix_meta_optimiser.py --brand_id all --days 30 --max_pages 10
    python tools/wix_meta_optimiser.py --brand_id carisma_spa --days 60 --max_pages 5 --dry_run

Inputs:
    --brand_id    Brand ID or "all" (required)
    --days        Number of days of GSC data to analyse (default: 30)
    --max_pages   Maximum pages to optimise per run (default: 10)
    --output_dir  Output directory (default: .tmp/seo/wix-meta)
    --dry_run     Generate plan only, do not push updates via Wix MCP

Outputs:
    JSON files at {output_dir}/optimisation_plan_{brand}_{date}.json
    Changelog at {output_dir}/changelog_{brand}.json

MCP Integration:
    This tool generates structured instructions for:
    - mcp__google-search-console__search_analytics  (pull page performance)
    - mcp__wix__CallWixSiteAPI                       (read/update meta tags)
    - mcp__google-workspace__gmail_send_email         (email report)

    The agent executes these MCP calls using the instructions returned by
    each build_*_instructions() function.
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
CONFIG_DIR = BASE_DIR / "config"
SEO_RULES_DIR = BASE_DIR / "marketing" / "seo-optimisation"
DEFAULT_OUTPUT_DIR = BASE_DIR / ".tmp" / "seo" / "wix-meta"

MAX_TITLE_CHARS = 60
MAX_DESC_CHARS = 155
MAX_CHANGELOG_ENTRIES = 200

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
logger = logging.getLogger("wix_meta_optimiser")


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


def load_wix_seo_rules() -> dict[str, Any]:
    """Load the Wix SEO optimisation rules and safety config."""
    rules_path = SEO_RULES_DIR / "wix-seo-rules.json"
    if not rules_path.exists():
        raise FileNotFoundError(f"Wix SEO rules not found: {rules_path}")
    with open(rules_path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_meta_changelog(brand_id: str, output_dir: Path = DEFAULT_OUTPUT_DIR) -> list[dict[str, Any]]:
    """
    Load the meta changelog for a brand.

    The changelog tracks all meta title/description changes for revert
    purposes and to enforce the 'skip if recently changed' safety rule.

    Returns a list of changelog entries sorted by date (oldest first).
    """
    changelog_path = output_dir / f"changelog_{brand_id}.json"
    if not changelog_path.exists():
        return []
    try:
        with open(changelog_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        logger.warning("Could not read changelog at %s. Starting fresh.", changelog_path)
        return []


def save_meta_changelog(
    brand_id: str,
    new_changes: list[dict[str, Any]],
    output_dir: Path = DEFAULT_OUTPUT_DIR,
) -> None:
    """
    Append new changes to the meta changelog for a brand.

    Keeps only the last MAX_CHANGELOG_ENTRIES entries to prevent unbounded
    growth. Each entry contains: page_url, old_title, new_title,
    old_description, new_description, changed_at, changed_by.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    changelog_path = output_dir / f"changelog_{brand_id}.json"

    existing = load_meta_changelog(brand_id, output_dir)
    combined = existing + new_changes
    # Keep only last MAX_CHANGELOG_ENTRIES entries
    combined = combined[-MAX_CHANGELOG_ENTRIES:]

    with open(changelog_path, "w", encoding="utf-8") as f:
        json.dump(combined, f, indent=2, ensure_ascii=False)

    logger.info(
        "Saved %d new changelog entries for %s (total: %d)",
        len(new_changes), brand_id, len(combined),
    )


# ---------------------------------------------------------------------------
# MCP instruction builders
# ---------------------------------------------------------------------------

def build_gsc_page_instructions(site_url: str, days: int) -> dict[str, Any]:
    """
    Build MCP instructions for pulling page-level performance data from
    Google Search Console.

    The agent should execute:
        mcp__google-search-console__search_analytics

    with the parameters returned by this function.

    Returns:
        dict with 'tool', 'parameters', and 'description' keys.
    """
    start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    end_date = datetime.now().strftime("%Y-%m-%d")

    return {
        "tool": "mcp__google-search-console__search_analytics",
        "parameters": {
            "siteUrl": site_url,
            "startDate": start_date,
            "endDate": end_date,
            "dimensions": ["page"],
            "rowLimit": 100,
        },
        "description": (
            f"Pull page-level performance data from GSC for {site_url} "
            f"over the last {days} days ({start_date} to {end_date}). "
            "Returns: page URL, clicks, impressions, CTR, position."
        ),
    }


def build_wix_read_instructions(page_urls: list[str]) -> list[dict[str, Any]]:
    """
    Build MCP instructions to read current meta titles and descriptions
    from Wix for the specified page URLs.

    The agent should execute mcp__wix__CallWixSiteAPI for each page.

    Returns:
        List of instruction dicts, one per page URL.
    """
    instructions = []
    for url in page_urls:
        # Extract the page path from the full URL
        # e.g. https://www.carismaspa.com/spa-day -> /spa-day
        from urllib.parse import urlparse
        parsed = urlparse(url)
        page_path = parsed.path if parsed.path else "/"

        instructions.append({
            "tool": "mcp__wix__CallWixSiteAPI",
            "parameters": {
                "method": "GET",
                "endpoint": f"/site-properties/v4/properties",
                "body": {},
            },
            "page_url": url,
            "page_path": page_path,
            "description": (
                f"Read current meta title and description for page: {url}. "
                "Look for SEO title and description in the page properties. "
                "If this endpoint does not return per-page meta, try the "
                "Wix SEO API or page data endpoints instead."
            ),
        })

    return instructions


def build_wix_update_instructions(
    page_url: str,
    new_title: str,
    new_description: str,
) -> dict[str, Any]:
    """
    Build MCP instructions to update meta title and description on a Wix page.

    The agent should execute mcp__wix__CallWixSiteAPI with these parameters.

    Returns:
        dict with 'tool', 'parameters', and 'description' keys.
    """
    from urllib.parse import urlparse
    parsed = urlparse(page_url)
    page_path = parsed.path if parsed.path else "/"

    return {
        "tool": "mcp__wix__CallWixSiteAPI",
        "parameters": {
            "method": "PATCH",
            "endpoint": f"/site-properties/v4/properties",
            "body": {
                "seoData": {
                    "title": new_title,
                    "description": new_description,
                },
            },
        },
        "page_url": page_url,
        "page_path": page_path,
        "description": (
            f"Update meta title and description for page: {page_url}. "
            f"New title ({len(new_title)} chars): {new_title!r}. "
            f"New description ({len(new_description)} chars): {new_description!r}."
        ),
    }


# ---------------------------------------------------------------------------
# Candidate filtering
# ---------------------------------------------------------------------------

def filter_candidates(
    pages: list[dict[str, Any]],
    rules: dict[str, Any],
    changelog: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """
    Filter GSC page data to identify pages that are candidates for meta
    optimisation.

    Filtering criteria (from safety_rules):
    1. Impressions >= min_impressions_threshold (enough data to judge)
    2. CTR < site average (underperforming)
    3. CTR < skip_above_ctr_percent (already performing well = skip)
    4. Not recently changed (within skip_if_recently_changed_days)
    5. CTR not already improving (skip_if_ctr_improving)
    6. Max pages capped at max_pages_per_run

    Args:
        pages: List of page data dicts from GSC, each containing:
               page_url, clicks, impressions, ctr, position
        rules: The full wix-seo-rules.json dict
        changelog: Existing changelog entries for this brand

    Returns:
        Filtered list of candidate pages, sorted by impressions descending
        (highest visibility first — most impact from optimisation).
    """
    safety = rules.get("safety_rules", {})
    min_impressions = safety.get("min_impressions_threshold", 100)
    skip_above_ctr = safety.get("skip_above_ctr_percent", 5.0) / 100.0
    recently_changed_days = safety.get("skip_if_recently_changed_days", 30)
    skip_if_improving = safety.get("skip_if_ctr_improving", True)
    max_pages = safety.get("max_pages_per_run", 10)

    # Build a set of recently changed page URLs
    recently_changed_urls: set[str] = set()
    cutoff_date = datetime.now() - timedelta(days=recently_changed_days)
    for entry in changelog:
        changed_at_str = entry.get("changed_at", "")
        try:
            changed_at = datetime.fromisoformat(changed_at_str)
            if changed_at >= cutoff_date:
                recently_changed_urls.add(entry.get("page_url", ""))
        except (ValueError, TypeError):
            continue

    # Calculate site-wide average CTR for comparison
    total_clicks = sum(p.get("clicks", 0) for p in pages)
    total_impressions = sum(p.get("impressions", 0) for p in pages)
    site_avg_ctr = (total_clicks / total_impressions) if total_impressions > 0 else 0.0

    logger.info(
        "Site average CTR: %.2f%% (%d clicks / %d impressions)",
        site_avg_ctr * 100, total_clicks, total_impressions,
    )

    candidates = []
    skipped_reasons: dict[str, int] = {
        "low_impressions": 0,
        "above_ctr_threshold": 0,
        "above_site_average": 0,
        "recently_changed": 0,
        "ctr_improving": 0,
    }

    for page in pages:
        page_url = page.get("page_url", page.get("keys", [""])[0] if "keys" in page else "")
        impressions = page.get("impressions", 0)
        ctr = page.get("ctr", 0)
        clicks = page.get("clicks", 0)

        # Filter 1: Minimum impressions
        if impressions < min_impressions:
            skipped_reasons["low_impressions"] += 1
            continue

        # Filter 2: Already above CTR skip threshold
        if ctr >= skip_above_ctr:
            skipped_reasons["above_ctr_threshold"] += 1
            continue

        # Filter 3: Already above site average
        if ctr >= site_avg_ctr:
            skipped_reasons["above_site_average"] += 1
            continue

        # Filter 4: Recently changed
        if page_url in recently_changed_urls:
            skipped_reasons["recently_changed"] += 1
            continue

        # Filter 5: CTR improving (simplified check — agent may refine)
        # The agent has access to historical data and can do a proper
        # trend analysis. This flag is a hint for the agent.
        if skip_if_improving and page.get("ctr_improving", False):
            skipped_reasons["ctr_improving"] += 1
            continue

        candidates.append({
            "page_url": page_url,
            "clicks": clicks,
            "impressions": impressions,
            "ctr": ctr,
            "ctr_percent": round(ctr * 100, 2) if ctr < 1 else round(ctr, 2),
            "position": page.get("position", 0),
            "site_avg_ctr_percent": round(site_avg_ctr * 100, 2),
            "ctr_gap_percent": round((site_avg_ctr - ctr) * 100, 2) if ctr < 1 else round(site_avg_ctr * 100 - ctr, 2),
        })

    # Sort by impressions descending (optimise highest-visibility pages first)
    candidates.sort(key=lambda x: x["impressions"], reverse=True)

    # Cap at max pages per run
    candidates = candidates[:max_pages]

    logger.info(
        "Candidate filtering: %d pages → %d candidates (skipped: %s)",
        len(pages), len(candidates), skipped_reasons,
    )

    return candidates


# ---------------------------------------------------------------------------
# Optimisation plan
# ---------------------------------------------------------------------------

def build_optimisation_plan(
    candidates: list[dict[str, Any]],
    current_meta: dict[str, dict[str, str]],
    rules: dict[str, Any],
    brand_id: str,
) -> list[dict[str, Any]]:
    """
    Create before/after optimisation recommendations for each candidate page.

    This function builds the plan structure. The actual improved title and
    description text is generated by the AI agent using brand voice rules
    and SEO best practices from the rules config.

    The plan includes:
    - Page URL and current performance metrics
    - Current meta title and description
    - Placeholder for AI-generated improved title and description
    - Quality review checklist status
    - Brand voice rules to apply

    Args:
        candidates: Filtered candidate pages from filter_candidates()
        current_meta: Dict mapping page_url -> {"title": ..., "description": ...}
        rules: Full wix-seo-rules.json dict
        brand_id: Brand identifier for voice rules

    Returns:
        List of optimisation plan entries.
    """
    brand_voice = rules.get("brand_meta_voice", {}).get(brand_id, {})
    optimisation_rules = rules.get("optimisation_rules", {})
    quality_checks = rules.get("quality_review", {})

    plan = []
    for candidate in candidates:
        page_url = candidate["page_url"]
        meta = current_meta.get(page_url, {"title": "", "description": ""})

        entry = {
            "page_url": page_url,
            "performance": {
                "clicks": candidate["clicks"],
                "impressions": candidate["impressions"],
                "ctr_percent": candidate["ctr_percent"],
                "position": candidate["position"],
                "site_avg_ctr_percent": candidate["site_avg_ctr_percent"],
                "ctr_gap_percent": candidate["ctr_gap_percent"],
            },
            "current": {
                "title": meta.get("title", ""),
                "title_chars": len(meta.get("title", "")),
                "description": meta.get("description", ""),
                "description_chars": len(meta.get("description", "")),
            },
            "improved": {
                "title": "",
                "title_chars": 0,
                "description": "",
                "description_chars": 0,
                "generated_by": "ai_agent",
                "generation_status": "pending",
            },
            "brand_voice": brand_voice,
            "optimisation_rules": optimisation_rules,
            "quality_review": {
                "layer_1_seo": {"status": "pending", "checks": quality_checks.get("layer_1_seo", {}).get("checks", [])},
                "layer_2_brand_voice": {"status": "pending", "checks": quality_checks.get("layer_2_brand_voice", {}).get("checks", [])},
            },
            "status": "pending_ai_generation",
        }

        plan.append(entry)

    return plan


def save_optimisation_plan(
    plan: list[dict[str, Any]],
    brand_id: str,
    output_dir: Path = DEFAULT_OUTPUT_DIR,
) -> Path:
    """Save the optimisation plan to a dated JSON file."""
    output_dir.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d")
    filename = f"optimisation_plan_{brand_id}_{date_str}.json"
    output_path = output_dir / filename

    output = {
        "metadata": {
            "tool": "wix_meta_optimiser",
            "brand": brand_id,
            "num_pages": len(plan),
            "generated_at": datetime.now().isoformat(),
            "status": "pending_ai_generation",
        },
        "plan": plan,
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    logger.info("Saved optimisation plan (%d pages) to %s", len(plan), output_path)
    return output_path


# ---------------------------------------------------------------------------
# Monthly gate check (for launchd daily scheduling)
# ---------------------------------------------------------------------------

def is_first_of_month() -> bool:
    """
    Check if today is the 1st of the month.

    The launchd plist schedules this script daily at 10am because launchd
    does not support monthly natively. This function provides the monthly
    gate — the script exits early if it is not the 1st.
    """
    return datetime.now().day == 1


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Wix Meta Optimiser — Identify underperforming pages via GSC "
            "and generate improved meta titles and descriptions for Wix."
        ),
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
        default=30,
        help="Number of days of GSC data to analyse (default: 30)",
    )
    parser.add_argument(
        "--max_pages",
        type=int,
        default=10,
        help="Maximum pages to optimise per run (default: 10)",
    )
    parser.add_argument(
        "--output_dir",
        type=str,
        default=None,
        help=f"Output directory (default: {DEFAULT_OUTPUT_DIR})",
    )
    parser.add_argument(
        "--dry_run",
        action="store_true",
        default=False,
        help="Generate optimisation plan only, do not push updates via Wix MCP",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> None:
    args = parse_args(argv)

    # Monthly gate: exit early if not the 1st of the month (cron runs daily)
    if is_first_of_month() is False and os.environ.get("WIX_SEO_FORCE_RUN") != "1":
        logger.info(
            "Today is not the 1st of the month (day=%d). Exiting. "
            "Set WIX_SEO_FORCE_RUN=1 to override.",
            datetime.now().day,
        )
        sys.exit(0)

    # Resolve output directory
    output_dir = Path(args.output_dir) if args.output_dir else DEFAULT_OUTPUT_DIR

    # Load configs
    try:
        brands_config = load_brands_config()
        wix_rules = load_wix_seo_rules()
    except FileNotFoundError as exc:
        logger.error("Config file missing: %s", exc)
        sys.exit(1)

    # Override max_pages from CLI if specified
    if args.max_pages != 10:
        wix_rules.setdefault("safety_rules", {})["max_pages_per_run"] = args.max_pages

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

    logger.info(
        "Wix Meta Optimiser starting: brands=%s, days=%d, max_pages=%d, dry_run=%s",
        brand_ids, args.days, args.max_pages, args.dry_run,
    )

    all_instructions: dict[str, Any] = {}
    total_candidates = 0

    for brand_id in brand_ids:
        logger.info("--- Processing brand: %s ---", brand_id)
        brand = brands_config[brand_id]
        site_url = brand.get("website_url", "")

        if not site_url:
            logger.warning("Brand '%s' has no website_url. Skipping.", brand_id)
            continue

        # Step 1: Build GSC pull instructions
        gsc_instructions = build_gsc_page_instructions(site_url, args.days)
        logger.info("GSC instructions built for %s", site_url)

        # Step 2: Load existing changelog
        changelog = load_meta_changelog(brand_id, output_dir)
        logger.info("Loaded %d changelog entries for %s", len(changelog), brand_id)

        # Build the instruction set for the agent
        brand_instructions = {
            "brand_id": brand_id,
            "brand_name": brand.get("brand_name", ""),
            "site_url": site_url,
            "days": args.days,
            "max_pages": args.max_pages,
            "dry_run": args.dry_run,
            "gsc_instructions": gsc_instructions,
            "changelog_entries": len(changelog),
            "brand_voice": wix_rules.get("brand_meta_voice", {}).get(brand_id, {}),
            "optimisation_rules": wix_rules.get("optimisation_rules", {}),
            "safety_rules": wix_rules.get("safety_rules", {}),
            "quality_review": wix_rules.get("quality_review", {}),
            "agent_steps": [
                f"1. Execute GSC search_analytics for {site_url} with dimensions=['page']",
                "2. Pass the page results to filter_candidates() with safety rules",
                "3. For each candidate, use mcp__wix__CallWixSiteAPI to read current meta",
                "4. Generate improved title (max 60 chars, keyword front-loaded) and description (max 155 chars, with CTA)",
                "5. Run 2-layer quality review (SEO + brand voice)",
                "6. Auto-fix up to 3 rounds if any check fails",
                f"7. {'[DRY RUN] Save plan only' if args.dry_run else 'Push updates via Wix MCP and save to changelog'}",
                "8. Log results to Google Sheets 'Wix SEO Changes' tab",
                "9. Send email report with before/after comparison",
            ],
        }

        all_instructions[brand_id] = brand_instructions

    # Save instructions for the agent
    output_dir.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d")
    instructions_path = output_dir / f"agent_instructions_{date_str}.json"

    output = {
        "metadata": {
            "tool": "wix_meta_optimiser",
            "generated_at": datetime.now().isoformat(),
            "brands_processed": list(all_instructions.keys()),
            "days": args.days,
            "max_pages": args.max_pages,
            "dry_run": args.dry_run,
        },
        "brands": all_instructions,
    }

    with open(instructions_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    logger.info("Agent instructions saved to %s", instructions_path)

    # Print summary
    summary = {
        "brands_processed": list(all_instructions.keys()),
        "days_analysed": args.days,
        "max_pages_per_brand": args.max_pages,
        "dry_run": args.dry_run,
        "instructions_file": str(instructions_path),
        "output_dir": str(output_dir),
    }

    print(json.dumps(summary, indent=2))

    logger.info(
        "Done. Instructions generated for %d brand(s). "
        "The agent should now execute the MCP calls.",
        len(all_instructions),
    )


if __name__ == "__main__":
    main()
