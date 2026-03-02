#!/usr/bin/env python3
"""
Competitor Ad Spy Tool — Fetches, snapshots, and diffs competitor Meta ad
activity for Carisma brands using the Meta Ad Library API.

Usage:
    python tools/scrape_competitor_ads.py --brand_category all
    python tools/scrape_competitor_ads.py --brand_category spa --dry_run
    python tools/scrape_competitor_ads.py --brand_category aesthetics --output_dir .tmp/research/competitor-intel

Inputs:
    --brand_category  Category to scan: "spa", "aesthetics", "slimming", or "all" (required)
    --output_dir      Output directory for snapshots and reports (default: .tmp/research/competitor-intel)
    --dry_run         If set, generate instructions but do not save snapshots

Outputs:
    - Snapshot JSON at {output_dir}/competitor-snapshot-{date}.json
    - Intelligence report at {output_dir}/competitor-report-{date}.json
    - Agent instructions for calling mcp__meta-ads__search_ads_archive

MCP Integration:
    This tool generates structured instructions for the agent to call
    mcp__meta-ads__search_ads_archive for each competitor Page ID. The agent
    executes the MCP calls, collects results, and passes them back to this
    tool's comparison and reporting functions.
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
DEFAULT_OUTPUT_DIR = BASE_DIR / ".tmp" / "research" / "competitor-intel"

# Category mapping to competitors.json keys
CATEGORY_KEYS = {
    "spa": "spa_competitors",
    "aesthetics": "aesthetics_competitors",
    "slimming": "slimming_competitors",
}

# Longevity thresholds (days)
LONGEVITY_SHORT = 7
LONGEVITY_LONG = 30

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("scrape_competitor_ads")


# ---------------------------------------------------------------------------
# Config loading
# ---------------------------------------------------------------------------

def load_competitors_config() -> dict[str, Any]:
    """
    Load competitors config from config/competitors.json.

    Returns the full config dict with keys like 'spa_competitors',
    'aesthetics_competitors', etc.
    """
    config_path = CONFIG_DIR / "competitors.json"
    if not config_path.exists():
        raise FileNotFoundError(f"Competitors config not found: {config_path}")
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_competitors_for_category(
    config: dict[str, Any],
    category: str,
) -> list[dict[str, Any]]:
    """
    Extract competitors for a given category, filtering out TO_BE_FILLED entries.

    Returns a list of competitor dicts that have valid (non-placeholder) data.
    Warns about skipped competitors.
    """
    key = CATEGORY_KEYS.get(category)
    if not key:
        logger.warning("Unknown category '%s'. Available: %s", category, list(CATEGORY_KEYS.keys()))
        return []

    competitors = config.get(key, [])
    valid: list[dict[str, Any]] = []
    skipped: list[str] = []

    for comp in competitors:
        name = comp.get("name", "")
        page_url = comp.get("facebook_page_url", "")
        page_id = comp.get("page_id", "")

        # Check if the competitor has real data (not placeholder)
        if name == "TO_BE_FILLED" or (not page_id and page_url == "TO_BE_FILLED"):
            skipped.append(comp.get("competitor_id", "unknown"))
            continue

        valid.append(comp)

    if skipped:
        logger.warning(
            "Category '%s': Skipped %d TO_BE_FILLED competitor(s): %s. "
            "Fill in config/competitors.json with real data to include them.",
            category,
            len(skipped),
            ", ".join(skipped),
        )

    return valid


# ---------------------------------------------------------------------------
# Snapshot management
# ---------------------------------------------------------------------------

def load_previous_snapshot(output_dir: Path) -> Optional[dict[str, Any]]:
    """
    Find and load the most recent snapshot file in the output directory.

    Snapshot files follow the naming pattern: competitor-snapshot-{YYYY-MM-DD}.json
    Returns the snapshot dict, or None if no previous snapshot exists.
    """
    if not output_dir.exists():
        logger.info("Output directory does not exist yet: %s. First run.", output_dir)
        return None

    snapshot_files = sorted(
        output_dir.glob("competitor-snapshot-*.json"),
        reverse=True,
    )

    if not snapshot_files:
        logger.info("No previous snapshots found in %s. First run.", output_dir)
        return None

    latest = snapshot_files[0]
    logger.info("Loading previous snapshot: %s", latest.name)

    try:
        with open(latest, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as exc:
        logger.warning("Could not read previous snapshot %s: %s", latest, exc)
        return None


def save_snapshot(
    current_ads: dict[str, Any],
    output_dir: Path,
) -> Path:
    """
    Save the current ad data as a dated snapshot.

    Args:
        current_ads: Dict with category -> competitor_id -> list of ad objects.
        output_dir: Directory to save the snapshot in.

    Returns:
        Path to the saved snapshot file.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y-%m-%d")
    filename = f"competitor-snapshot-{date_str}.json"
    output_path = output_dir / filename

    snapshot = {
        "metadata": {
            "tool": "scrape_competitor_ads",
            "snapshot_date": date_str,
            "generated_at": datetime.now().isoformat(),
            "total_ads": sum(
                len(ads)
                for category in current_ads.values()
                for ads in category.values()
            ),
        },
        "ads": current_ads,
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(snapshot, f, indent=2, ensure_ascii=False)

    logger.info("Snapshot saved to %s", output_path)
    return output_path


def save_report(
    report: dict[str, Any],
    output_dir: Path,
) -> Path:
    """
    Save the intelligence report as a dated JSON file.

    Args:
        report: Structured intelligence report dict.
        output_dir: Directory to save the report in.

    Returns:
        Path to the saved report file.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y-%m-%d")
    filename = f"competitor-report-{date_str}.json"
    output_path = output_dir / filename

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    logger.info("Intelligence report saved to %s", output_path)
    return output_path


# ---------------------------------------------------------------------------
# MCP instruction builders
# ---------------------------------------------------------------------------

def build_ad_library_instructions(
    competitors: list[dict[str, Any]],
    category: str,
) -> list[dict[str, Any]]:
    """
    Generate instructions for the agent to call mcp__meta-ads__search_ads_archive
    for each competitor Page ID.

    Each instruction contains the MCP tool name, parameters, and metadata.
    The agent executes these sequentially and collects the results.

    Args:
        competitors: List of competitor dicts with page_id or facebook_page_url.
        category: The brand category (spa, aesthetics, slimming).

    Returns:
        List of instruction dicts for the agent.
    """
    instructions: list[dict[str, Any]] = []

    for comp in competitors:
        comp_id = comp.get("competitor_id", "unknown")
        comp_name = comp.get("name", "Unknown")
        page_id = comp.get("page_id", "")

        # If no page_id, try to extract from facebook_page_url
        if not page_id:
            fb_url = comp.get("facebook_page_url", "")
            if fb_url and fb_url != "TO_BE_FILLED":
                # Try to extract numeric page ID from URL (best effort)
                logger.warning(
                    "Competitor '%s' (%s) has no page_id. "
                    "Cannot query Ad Library API without a numeric Page ID. "
                    "Please add the page_id to config/competitors.json.",
                    comp_name,
                    comp_id,
                )
                continue
            else:
                logger.warning(
                    "Competitor '%s' (%s) has no page_id or facebook_page_url. Skipping.",
                    comp_name,
                    comp_id,
                )
                continue

        instruction = {
            "mcp_tool": "mcp__meta-ads__search_ads_archive",
            "params": {
                "search_page_ids": [page_id],
                "ad_reached_countries": ["MT"],
                "ad_active_status": "ACTIVE",
                "fields": [
                    "id",
                    "page_id",
                    "page_name",
                    "ad_creative_bodies",
                    "ad_creative_link_captions",
                    "ad_creative_link_titles",
                    "ad_delivery_start_time",
                    "ad_delivery_stop_time",
                    "publisher_platforms",
                    "estimated_audience_size",
                    "spend",
                    "impressions",
                    "currency",
                ],
                "limit": 50,
            },
            "competitor_id": comp_id,
            "competitor_name": comp_name,
            "category": category,
            "description": (
                f"Fetch active ads for {comp_name} ({comp_id}) — "
                f"Page ID: {page_id}, Category: {category}"
            ),
        }

        instructions.append(instruction)

    return instructions


# ---------------------------------------------------------------------------
# Snapshot comparison
# ---------------------------------------------------------------------------

def compare_snapshots(
    current: dict[str, Any],
    previous: Optional[dict[str, Any]],
) -> dict[str, Any]:
    """
    Diff two snapshots to identify new ads, killed ads, unchanged ads,
    and long-running winners.

    Args:
        current: Current scan results — dict of category -> competitor_id -> [ads].
        previous: Previous snapshot's "ads" dict, or None for first run.

    Returns:
        Diff dict with keys: new_ads, killed_ads, unchanged, long_running,
        and summary statistics.
    """
    if previous is None:
        # First run — all ads are "new"
        all_new: list[dict[str, Any]] = []
        for category, competitors in current.items():
            for comp_id, ads in competitors.items():
                for ad in ads:
                    ad_entry = {**ad, "competitor_id": comp_id, "category": category}
                    all_new.append(ad_entry)

        return {
            "is_first_run": True,
            "new_ads": all_new,
            "killed_ads": [],
            "unchanged": [],
            "long_running": [],
            "summary": {
                "total_current": len(all_new),
                "total_previous": 0,
                "new_count": len(all_new),
                "killed_count": 0,
                "unchanged_count": 0,
                "long_running_count": 0,
            },
        }

    # Extract previous ad IDs into a lookup
    prev_ads: dict[str, dict[str, Any]] = {}
    prev_ad_data = previous.get("ads", previous)  # Handle both wrapped and unwrapped
    for category, competitors in prev_ad_data.items():
        if not isinstance(competitors, dict):
            continue
        for comp_id, ads in competitors.items():
            if not isinstance(ads, list):
                continue
            for ad in ads:
                ad_id = ad.get("ad_id") or ad.get("id", "")
                if ad_id:
                    prev_ads[ad_id] = {**ad, "competitor_id": comp_id, "category": category}

    # Extract current ad IDs
    curr_ads: dict[str, dict[str, Any]] = {}
    for category, competitors in current.items():
        for comp_id, ads in competitors.items():
            for ad in ads:
                ad_id = ad.get("ad_id") or ad.get("id", "")
                if ad_id:
                    curr_ads[ad_id] = {**ad, "competitor_id": comp_id, "category": category}

    # Compute diffs
    prev_ids = set(prev_ads.keys())
    curr_ids = set(curr_ads.keys())

    new_ids = curr_ids - prev_ids
    killed_ids = prev_ids - curr_ids
    unchanged_ids = curr_ids & prev_ids

    new_ads = [curr_ads[aid] for aid in new_ids]
    killed_ads = [prev_ads[aid] for aid in killed_ids]
    unchanged = [curr_ads[aid] for aid in unchanged_ids]

    # Identify long-running ads (30+ days active)
    today = datetime.now()
    long_running: list[dict[str, Any]] = []

    for ad in unchanged + new_ads:
        start_str = ad.get("start_date") or ad.get("ad_delivery_start_time", "")
        if not start_str:
            continue
        try:
            start_date = datetime.fromisoformat(start_str.replace("Z", "+00:00"))
            days_active = (today - start_date.replace(tzinfo=None)).days
            if days_active >= LONGEVITY_LONG:
                ad["days_active"] = days_active
                long_running.append(ad)
        except (ValueError, TypeError):
            continue

    return {
        "is_first_run": False,
        "new_ads": new_ads,
        "killed_ads": killed_ads,
        "unchanged": unchanged,
        "long_running": long_running,
        "summary": {
            "total_current": len(curr_ads),
            "total_previous": len(prev_ads),
            "new_count": len(new_ads),
            "killed_count": len(killed_ads),
            "unchanged_count": len(unchanged),
            "long_running_count": len(long_running),
        },
    }


# ---------------------------------------------------------------------------
# Intelligence report generation
# ---------------------------------------------------------------------------

def generate_intelligence_report(
    diff: dict[str, Any],
    competitors: dict[str, list[dict[str, Any]]],
    scan_date: Optional[str] = None,
) -> dict[str, Any]:
    """
    Structure the snapshot diff into an intelligence report following
    the analysis template categories.

    Args:
        diff: Output from compare_snapshots().
        competitors: Dict of category -> list of competitor configs.
        scan_date: Override scan date (default: today).

    Returns:
        Structured intelligence report dict.
    """
    if scan_date is None:
        scan_date = datetime.now().strftime("%Y-%m-%d")

    # Group new ads by category
    new_by_category: dict[str, list[dict[str, Any]]] = {}
    for ad in diff.get("new_ads", []):
        cat = ad.get("category", "unknown")
        new_by_category.setdefault(cat, []).append(ad)

    # Group killed ads by category
    killed_by_category: dict[str, list[dict[str, Any]]] = {}
    for ad in diff.get("killed_ads", []):
        cat = ad.get("category", "unknown")
        killed_by_category.setdefault(cat, []).append(ad)

    # Group long-running by category
    long_by_category: dict[str, list[dict[str, Any]]] = {}
    for ad in diff.get("long_running", []):
        cat = ad.get("category", "unknown")
        long_by_category.setdefault(cat, []).append(ad)

    # Extract pricing mentions from new ads
    pricing_intel: list[dict[str, Any]] = []
    for ad in diff.get("new_ads", []):
        body = ad.get("body_text", "") or ad.get("ad_creative_bodies", "")
        if isinstance(body, list):
            body = " ".join(body)
        # Simple pricing detection (EUR, euro symbol, numbers with currency context)
        if body and ("EUR" in body.upper() or "\u20ac" in body or "price" in body.lower() or "from" in body.lower()):
            pricing_intel.append({
                "competitor_id": ad.get("competitor_id", ""),
                "ad_id": ad.get("ad_id") or ad.get("id", ""),
                "category": ad.get("category", ""),
                "body_excerpt": body[:200],
                "needs_manual_extraction": True,
            })

    # Format distribution
    format_counts: dict[str, int] = {}
    for ad in diff.get("new_ads", []) + diff.get("unchanged", []):
        media_type = ad.get("media_type", "unknown")
        format_counts[media_type] = format_counts.get(media_type, 0) + 1

    # Build competitor summary
    competitor_summary: dict[str, dict[str, Any]] = {}
    for category, comps in competitors.items():
        for comp in comps:
            comp_id = comp.get("competitor_id", "")
            competitor_summary[comp_id] = {
                "name": comp.get("name", "Unknown"),
                "category": category,
                "active_ads": 0,
                "new_ads": 0,
                "killed_ads": 0,
            }

    # Count per competitor
    for ad in diff.get("new_ads", []):
        cid = ad.get("competitor_id", "")
        if cid in competitor_summary:
            competitor_summary[cid]["new_ads"] += 1

    for ad in diff.get("killed_ads", []):
        cid = ad.get("competitor_id", "")
        if cid in competitor_summary:
            competitor_summary[cid]["killed_ads"] += 1

    for ad in diff.get("unchanged", []) + diff.get("new_ads", []):
        cid = ad.get("competitor_id", "")
        if cid in competitor_summary:
            competitor_summary[cid]["active_ads"] += 1

    report = {
        "metadata": {
            "report_type": "weekly_competitor_intelligence",
            "scan_date": scan_date,
            "generated_at": datetime.now().isoformat(),
            "is_first_run": diff.get("is_first_run", False),
        },
        "executive_summary": {
            "total_active_ads": diff["summary"]["total_current"],
            "new_ads_count": diff["summary"]["new_count"],
            "killed_ads_count": diff["summary"]["killed_count"],
            "long_running_count": diff["summary"]["long_running_count"],
            "categories_scanned": list(new_by_category.keys()) or list(competitors.keys()),
            "needs_ai_analysis": True,
            "ai_analysis_prompt": (
                "Analyse each new ad using the framework in "
                "marketing/competitor-intelligence/analysis-templates.md. "
                "Classify by hook_type, pain_point, offer_type, creative_format, "
                "media_style, target_audience, pricing_visible, cta_type, and compliance_flags. "
                "Write a one-sentence key_insight for each ad."
            ),
        },
        "new_ads": {
            "total": diff["summary"]["new_count"],
            "by_category": {
                cat: [
                    {
                        "ad_id": ad.get("ad_id") or ad.get("id", ""),
                        "competitor_id": ad.get("competitor_id", ""),
                        "page_name": ad.get("page_name", ""),
                        "body_text": (
                            ad.get("body_text", "")
                            or (ad.get("ad_creative_bodies", [""])[0] if isinstance(ad.get("ad_creative_bodies"), list) else ad.get("ad_creative_bodies", ""))
                        ),
                        "media_type": ad.get("media_type", ""),
                        "start_date": ad.get("start_date") or ad.get("ad_delivery_start_time", ""),
                        "link_url": ad.get("link_url", ""),
                        "call_to_action": ad.get("call_to_action", ""),
                        "analysis": "PENDING_AI_CLASSIFICATION",
                    }
                    for ad in ads
                ]
                for cat, ads in new_by_category.items()
            },
        },
        "killed_ads": {
            "total": diff["summary"]["killed_count"],
            "by_category": {
                cat: [
                    {
                        "ad_id": ad.get("ad_id") or ad.get("id", ""),
                        "competitor_id": ad.get("competitor_id", ""),
                        "page_name": ad.get("page_name", ""),
                        "body_text": (
                            ad.get("body_text", "")
                            or (ad.get("ad_creative_bodies", [""])[0] if isinstance(ad.get("ad_creative_bodies"), list) else ad.get("ad_creative_bodies", ""))
                        ),
                        "start_date": ad.get("start_date") or ad.get("ad_delivery_start_time", ""),
                        "days_active": ad.get("days_active", "unknown"),
                    }
                    for ad in ads
                ]
                for cat, ads in killed_by_category.items()
            },
        },
        "long_running_winners": {
            "total": diff["summary"]["long_running_count"],
            "threshold_days": LONGEVITY_LONG,
            "by_category": {
                cat: [
                    {
                        "ad_id": ad.get("ad_id") or ad.get("id", ""),
                        "competitor_id": ad.get("competitor_id", ""),
                        "page_name": ad.get("page_name", ""),
                        "days_active": ad.get("days_active", 0),
                        "body_text": (
                            ad.get("body_text", "")
                            or (ad.get("ad_creative_bodies", [""])[0] if isinstance(ad.get("ad_creative_bodies"), list) else ad.get("ad_creative_bodies", ""))
                        ),
                        "start_date": ad.get("start_date") or ad.get("ad_delivery_start_time", ""),
                        "analysis": "PENDING_AI_CLASSIFICATION",
                    }
                    for ad in ads
                ]
                for cat, ads in long_by_category.items()
            },
        },
        "pricing_intelligence": {
            "mentions_detected": len(pricing_intel),
            "raw_mentions": pricing_intel,
            "needs_manual_extraction": True,
            "extraction_prompt": (
                "Extract all pricing from the ad copy excerpts above. "
                "Format: competitor, service/offer, price, framing (from/exact/range). "
                "Compare against Carisma's pricing in config/offers.json."
            ),
        },
        "creative_trends": {
            "format_distribution": format_counts,
            "needs_ai_analysis": True,
            "analysis_prompt": (
                "Summarise creative trends: which formats dominate, "
                "any shift from previous weeks, notable creative approaches."
            ),
        },
        "competitor_summary": competitor_summary,
        "recommended_actions": {
            "needs_ai_generation": True,
            "generation_prompt": (
                "Based on new ads, killed ads, long-running winners, and pricing intel, "
                "generate 2-3 immediate actions, 2-3 short-term actions, and 1-2 items to monitor. "
                "Frame each action in terms of what Carisma should do in response."
            ),
        },
    }

    return report


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Fetch and diff competitor Meta ad activity for Carisma brands.",
    )
    parser.add_argument(
        "--brand_category",
        type=str,
        required=True,
        choices=["spa", "aesthetics", "slimming", "all"],
        help='Brand category to scan: "spa", "aesthetics", "slimming", or "all"',
    )
    parser.add_argument(
        "--output_dir",
        type=str,
        default=None,
        help=f"Output directory for snapshots and reports (default: {DEFAULT_OUTPUT_DIR})",
    )
    parser.add_argument(
        "--dry_run",
        action="store_true",
        default=False,
        help="If set, generate instructions and report structure but do not save snapshots",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> None:
    args = parse_args(argv)

    # Resolve output directory
    output_dir = Path(args.output_dir) if args.output_dir else DEFAULT_OUTPUT_DIR

    # Load competitor config
    try:
        config = load_competitors_config()
    except FileNotFoundError as exc:
        logger.error("Config file missing: %s", exc)
        sys.exit(1)

    # Determine which categories to scan
    if args.brand_category == "all":
        categories = list(CATEGORY_KEYS.keys())
    else:
        categories = [args.brand_category]

    logger.info("Scanning categories: %s", categories)

    # Collect competitors per category
    all_competitors: dict[str, list[dict[str, Any]]] = {}
    all_instructions: list[dict[str, Any]] = []
    total_valid = 0

    for category in categories:
        competitors = get_competitors_for_category(config, category)
        all_competitors[category] = competitors
        total_valid += len(competitors)

        if competitors:
            instructions = build_ad_library_instructions(competitors, category)
            all_instructions.extend(instructions)
            logger.info(
                "Category '%s': %d valid competitor(s), %d MCP instruction(s) generated.",
                category,
                len(competitors),
                len(instructions),
            )
        else:
            logger.warning(
                "Category '%s': No valid competitors found. "
                "All entries are TO_BE_FILLED. Update config/competitors.json.",
                category,
            )

    if total_valid == 0:
        logger.warning(
            "No valid competitors found across any category. "
            "All entries in config/competitors.json are TO_BE_FILLED. "
            "Please fill in competitor data before running this tool."
        )

    # Load previous snapshot for comparison
    previous_snapshot = load_previous_snapshot(output_dir)

    # Output the plan for the agent
    plan = {
        "metadata": {
            "tool": "scrape_competitor_ads",
            "generated_at": datetime.now().isoformat(),
            "categories": categories,
            "total_competitors": total_valid,
            "total_instructions": len(all_instructions),
            "output_dir": str(output_dir),
            "dry_run": args.dry_run,
            "has_previous_snapshot": previous_snapshot is not None,
            "previous_snapshot_date": (
                previous_snapshot.get("metadata", {}).get("snapshot_date", "unknown")
                if previous_snapshot
                else None
            ),
        },
        "instructions": all_instructions,
        "competitors": {
            cat: [
                {
                    "competitor_id": c.get("competitor_id", ""),
                    "name": c.get("name", ""),
                    "page_id": c.get("page_id", ""),
                    "category": cat,
                }
                for c in comps
            ]
            for cat, comps in all_competitors.items()
        },
        "next_steps": {
            "1_fetch": (
                "Agent executes each instruction by calling "
                "mcp__meta-ads__search_ads_archive with the provided params."
            ),
            "2_collect": (
                "Agent collects results into a dict: "
                "category -> competitor_id -> [ad objects]. "
                "Each ad must have: ad_id, page_name, body_text, link_url, "
                "call_to_action, start_date, media_type, status."
            ),
            "3_snapshot": (
                "Agent passes collected data to save_snapshot() "
                f"(output_dir: {output_dir})" if not args.dry_run else
                "DRY RUN — snapshot will not be saved."
            ),
            "4_compare": (
                "Agent passes current data and previous snapshot to "
                "compare_snapshots() to get the diff."
            ),
            "5_report": (
                "Agent passes diff and competitor config to "
                "generate_intelligence_report() to build the structured report."
            ),
            "6_analyse": (
                "Agent runs AI analysis on each new ad using the framework "
                "in marketing/competitor-intelligence/analysis-templates.md."
            ),
            "7_save": (
                "Agent calls save_report() to persist the intelligence report."
                if not args.dry_run else
                "DRY RUN — report will not be saved."
            ),
        },
    }

    print(json.dumps(plan, indent=2))

    if all_instructions:
        logger.info(
            "Generated %d MCP instructions for %d competitor(s) across %d category(ies).",
            len(all_instructions),
            total_valid,
            len(categories),
        )
    else:
        logger.info(
            "No MCP instructions generated (all competitors are TO_BE_FILLED). "
            "The report will contain structural templates only."
        )

    # If dry run, generate an empty report structure for preview
    if args.dry_run:
        empty_current: dict[str, dict[str, list]] = {cat: {} for cat in categories}
        diff = compare_snapshots(empty_current, previous_snapshot)
        report = generate_intelligence_report(diff, all_competitors)
        print("\n--- DRY RUN REPORT PREVIEW ---")
        print(json.dumps(report, indent=2))
        logger.info("Dry run complete. No files saved.")
        return

    logger.info(
        "Plan generated. The agent should now execute the MCP instructions, "
        "collect results, and call the comparison/reporting functions."
    )


if __name__ == "__main__":
    main()
