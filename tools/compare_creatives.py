"""
Compare Creatives Tool
======================

Compare creative performance across different dimensions.

Purpose:
    Analyse ad insights data grouped by creative attributes (format, hook type,
    offer, audience) to identify patterns and rank what works. Helps the agent
    make data-driven decisions about creative direction.

Inputs:
    --insights_file     Path to insights JSON (from pull_ad_insights.py)
    --analysis_file     Path to analysis JSON (from analyze_performance.py, optional)
    --grouping          Dimension to group by: format, hook_type, offer, audience, campaign
    --brand             Brand ID (for context)

Outputs:
    JSON comparison report with rankings at .tmp/performance/comparison_{grouping}_{date}.json

No MCP Integration:
    Pure Python data analysis.
"""

import argparse
import json
import logging
import re
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
TMP_DIR = BASE_DIR / ".tmp" / "performance"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("compare_creatives")


# ---------------------------------------------------------------------------
# Grouping key extraction
# ---------------------------------------------------------------------------

def extract_group_key(record: dict[str, Any], grouping: str) -> str:
    """
    Extract the grouping key from an ad record.

    For naming-convention-based groupings (format, hook_type), parses
    the ad name. For direct fields (campaign, audience), uses the field value.
    """
    if grouping == "campaign":
        return record.get("campaign_name", "unknown")

    if grouping == "audience" or grouping == "adset":
        return record.get("adset_name", "unknown")

    if grouping == "offer":
        # Try to extract offer from campaign or ad name
        name = record.get("campaign_name", "") or record.get("ad_name", "")
        return _extract_name_component(name, component_index=1)

    if grouping == "format":
        # Extract format from ad name (typically 3rd component)
        name = record.get("ad_name", "")
        return _extract_name_component(name, component_index=2)

    if grouping == "hook_type":
        # Extract hook type from ad name (typically 4th component)
        name = record.get("ad_name", "")
        return _extract_name_component(name, component_index=3)

    return record.get(grouping, "unknown")


def _extract_name_component(name: str, component_index: int) -> str:
    """Extract a component from an underscore-separated name."""
    if not name:
        return "unknown"
    parts = name.split("_")
    if component_index < len(parts):
        return parts[component_index]
    return "unknown"


# ---------------------------------------------------------------------------
# Aggregation
# ---------------------------------------------------------------------------

def aggregate_group(records: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Aggregate performance metrics for a group of records.

    Computes totals, averages, and derived metrics.
    """
    total_spend = 0.0
    total_impressions = 0
    total_clicks = 0
    total_leads = 0
    total_reach = 0
    cpls: list[float] = []

    for r in records:
        spend = float(r.get("spend", 0))
        impressions = int(r.get("impressions", 0))
        clicks = int(r.get("clicks", 0))
        leads = int(r.get("lead_count", 0))
        reach = int(r.get("reach", 0))

        total_spend += spend
        total_impressions += impressions
        total_clicks += clicks
        total_leads += leads
        total_reach += reach

        cpl = r.get("cpl")
        if cpl is not None:
            cpls.append(float(cpl))

    # Computed metrics
    overall_cpl = round(total_spend / total_leads, 2) if total_leads > 0 else None
    overall_ctr = round((total_clicks / total_impressions) * 100, 2) if total_impressions > 0 else 0.0
    overall_cpc = round(total_spend / total_clicks, 2) if total_clicks > 0 else None
    overall_cpm = round((total_spend / total_impressions) * 1000, 2) if total_impressions > 0 else None
    avg_cpl = round(sum(cpls) / len(cpls), 2) if cpls else None
    min_cpl = round(min(cpls), 2) if cpls else None
    max_cpl = round(max(cpls), 2) if cpls else None
    click_to_lead = round((total_leads / total_clicks) * 100, 2) if total_clicks > 0 else None

    return {
        "num_ads": len(records),
        "total_spend": round(total_spend, 2),
        "total_impressions": total_impressions,
        "total_clicks": total_clicks,
        "total_leads": total_leads,
        "total_reach": total_reach,
        "overall_cpl": overall_cpl,
        "avg_cpl": avg_cpl,
        "min_cpl": min_cpl,
        "max_cpl": max_cpl,
        "overall_ctr": overall_ctr,
        "overall_cpc": overall_cpc,
        "overall_cpm": overall_cpm,
        "click_to_lead_rate": click_to_lead,
    }


# ---------------------------------------------------------------------------
# Comparison and ranking
# ---------------------------------------------------------------------------

def rank_groups(groups: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Rank groups by performance (lower CPL = better rank).

    Groups without CPL data are ranked last.
    """
    ranked: list[dict[str, Any]] = []

    for group_name, metrics in groups.items():
        entry = {
            "group": group_name,
            **metrics,
        }
        ranked.append(entry)

    # Sort by overall_cpl (None values go to end)
    ranked.sort(
        key=lambda g: (g["overall_cpl"] is None, g["overall_cpl"] or 9999)
    )

    # Add rank
    for i, entry in enumerate(ranked):
        entry["rank"] = i + 1

    return ranked


def generate_insights(ranked_groups: list[dict[str, Any]], grouping: str) -> list[str]:
    """
    Generate human-readable insights from the comparison.
    """
    insights: list[str] = []

    if not ranked_groups:
        return ["No data available for comparison."]

    # Best performer
    best = ranked_groups[0]
    if best.get("overall_cpl") is not None:
        insights.append(
            f"Best performing {grouping}: '{best['group']}' with a CPL of "
            f"{best['overall_cpl']:.2f} EUR across {best['num_ads']} ads."
        )

    # Worst performer
    ranked_with_cpl = [g for g in ranked_groups if g.get("overall_cpl") is not None]
    if len(ranked_with_cpl) >= 2:
        worst = ranked_with_cpl[-1]
        insights.append(
            f"Worst performing {grouping}: '{worst['group']}' with a CPL of "
            f"{worst['overall_cpl']:.2f} EUR."
        )

        # Spread
        spread = worst["overall_cpl"] - best["overall_cpl"]
        insights.append(
            f"CPL spread across {grouping}s: {spread:.2f} EUR "
            f"(from {best['overall_cpl']:.2f} to {worst['overall_cpl']:.2f})."
        )

    # Volume leader
    by_spend = sorted(ranked_groups, key=lambda g: g["total_spend"], reverse=True)
    if by_spend:
        volume_leader = by_spend[0]
        insights.append(
            f"Highest spend {grouping}: '{volume_leader['group']}' "
            f"({volume_leader['total_spend']:.2f} EUR, "
            f"{volume_leader['total_leads']} leads)."
        )

    # CTR insights
    by_ctr = sorted(ranked_groups, key=lambda g: g["overall_ctr"], reverse=True)
    if by_ctr and by_ctr[0]["overall_ctr"] > 0:
        ctr_leader = by_ctr[0]
        insights.append(
            f"Highest CTR {grouping}: '{ctr_leader['group']}' "
            f"({ctr_leader['overall_ctr']:.2f}%)."
        )

    return insights


# ---------------------------------------------------------------------------
# Main comparison
# ---------------------------------------------------------------------------

def compare_creatives(
    insights_file: str,
    grouping: str,
    analysis_file: Optional[str] = None,
    brand_id: Optional[str] = None,
) -> dict[str, Any]:
    """
    Run the full creative comparison pipeline.

    Returns structured comparison data with rankings and insights.
    """
    # Load insights data
    insights_path = Path(insights_file)
    if not insights_path.exists():
        raise FileNotFoundError(f"Insights file not found: {insights_file}")

    with open(insights_path, "r", encoding="utf-8") as f:
        insights_data = json.load(f)

    records = insights_data.get("data", [])

    # If analysis file provided, merge classification data
    if analysis_file:
        analysis_path = Path(analysis_file)
        if analysis_path.exists():
            with open(analysis_path, "r", encoding="utf-8") as f:
                analysis_data = json.load(f)
            # Index analysis by ad_id for merging
            analysis_by_id = {
                a["ad_id"]: a for a in analysis_data.get("ads", [])
            }
            for record in records:
                ad_id = record.get("ad_id", "")
                if ad_id in analysis_by_id:
                    record["classification"] = analysis_by_id[ad_id].get("classification")
                    record["recommendation"] = analysis_by_id[ad_id].get("recommendation")

    # Group records
    groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in records:
        key = extract_group_key(record, grouping)
        groups[key].append(record)

    # Aggregate each group
    aggregated: dict[str, dict[str, Any]] = {}
    for group_name, group_records in groups.items():
        aggregated[group_name] = aggregate_group(group_records)

    # Rank groups
    ranked = rank_groups(aggregated)

    # Generate insights
    insights_text = generate_insights(ranked, grouping)

    output = {
        "metadata": {
            "tool": "compare_creatives",
            "brand": brand_id,
            "grouping": grouping,
            "insights_file": insights_file,
            "analysis_file": analysis_file,
            "total_records": len(records),
            "total_groups": len(ranked),
            "analyzed_at": datetime.utcnow().isoformat() + "Z",
        },
        "rankings": ranked,
        "insights": insights_text,
    }

    return output


def save_output(data: dict[str, Any], grouping: str) -> Path:
    """Write comparison output."""
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d")
    filename = f"comparison_{grouping}_{date_str}.json"
    output_path = TMP_DIR / filename

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    logger.info("Comparison saved to %s", output_path)
    return output_path


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Compare creative performance across dimensions.",
    )
    parser.add_argument(
        "--insights_file",
        type=str,
        required=True,
        help="Path to insights JSON file",
    )
    parser.add_argument(
        "--analysis_file",
        type=str,
        default=None,
        help="Path to analysis JSON file (optional, for classifications)",
    )
    parser.add_argument(
        "--grouping",
        type=str,
        required=True,
        choices=["format", "hook_type", "offer", "audience", "campaign"],
        help="Dimension to group by",
    )
    parser.add_argument("--brand", type=str, default=None, help="Brand ID")
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> None:
    args = parse_args(argv)

    try:
        result = compare_creatives(
            insights_file=args.insights_file,
            grouping=args.grouping,
            analysis_file=args.analysis_file,
            brand_id=args.brand,
        )

        output_path = save_output(result, args.grouping)
        print(json.dumps(result, indent=2))
        logger.info(
            "Compared %d groups by %s. Output: %s",
            len(result["rankings"]),
            args.grouping,
            output_path,
        )

    except (FileNotFoundError, ValueError) as exc:
        logger.error("Error: %s", exc)
        sys.exit(1)
    except Exception as exc:
        logger.exception("Unexpected error: %s", exc)
        sys.exit(2)


if __name__ == "__main__":
    main()
