"""
Analyze Performance Tool
========================

Compute KPIs, classify ads, and generate optimisation recommendations.

Purpose:
    Pure Python data processing tool that takes raw insights JSON and produces
    a structured analysis with ad classification (winner/loser/marginal),
    computed KPIs (CPL, ROAS proxy, etc.), and actionable recommendations
    (scale, kill, iterate, wait).

Inputs:
    --insights_file     Path to insights JSON (from pull_ad_insights.py)
    --brand             Brand ID (for KPI thresholds from config/brands.json)
    --min_spend         Minimum spend to classify an ad (default: 10 EUR)
    --min_impressions   Minimum impressions before classifying (default: 500)

Outputs:
    JSON file at .tmp/performance/analysis_{brand}_{date}.json

No MCP Integration:
    This is a pure data processing tool. No external API calls.
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
TMP_DIR = BASE_DIR / ".tmp" / "performance"
CONFIG_DIR = BASE_DIR / "config"

# Default thresholds (overridden by brand config)
DEFAULT_CPL_TARGET = 10.0   # EUR
DEFAULT_CPL_KILL = 20.0     # 2x target = kill
DEFAULT_CTR_LOW = 0.8       # % below which creative fatigue suspected
DEFAULT_MIN_SPEND = 10.0    # EUR minimum to classify
DEFAULT_MIN_IMPRESSIONS = 500

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("analyze_performance")


# ---------------------------------------------------------------------------
# Config loading
# ---------------------------------------------------------------------------

def load_brand_thresholds(brand_id: str) -> dict[str, float]:
    """Load KPI thresholds for a brand from config."""
    config_path = CONFIG_DIR / "brands.json"
    with open(config_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    for brand in data.get("brands", []):
        if brand["brand_id"] == brand_id:
            cpl_target = brand.get("cpl_target_eur", DEFAULT_CPL_TARGET)
            return {
                "cpl_target": cpl_target,
                "cpl_winner": cpl_target * 0.8,      # 20% below target = winner
                "cpl_marginal_upper": cpl_target * 1.3,  # 30% above target = marginal
                "cpl_kill": cpl_target * 2.0,         # 2x target = kill
                "ctr_low": DEFAULT_CTR_LOW,
            }

    logger.warning("Brand '%s' not found in config. Using defaults.", brand_id)
    return {
        "cpl_target": DEFAULT_CPL_TARGET,
        "cpl_winner": DEFAULT_CPL_TARGET * 0.8,
        "cpl_marginal_upper": DEFAULT_CPL_TARGET * 1.3,
        "cpl_kill": DEFAULT_CPL_TARGET * 2.0,
        "ctr_low": DEFAULT_CTR_LOW,
    }


# ---------------------------------------------------------------------------
# KPI computation
# ---------------------------------------------------------------------------

def compute_kpis(record: dict[str, Any]) -> dict[str, Any]:
    """
    Compute derived KPIs for a single ad/adset/campaign record.

    Returns a dict of computed metrics.
    """
    spend = float(record.get("spend", 0))
    impressions = int(record.get("impressions", 0))
    clicks = int(record.get("clicks", 0))
    lead_count = int(record.get("lead_count", 0))

    kpis: dict[str, Any] = {
        "spend": round(spend, 2),
        "impressions": impressions,
        "clicks": clicks,
        "lead_count": lead_count,
    }

    # CPL
    if lead_count > 0:
        kpis["cpl"] = round(spend / lead_count, 2)
    else:
        kpis["cpl"] = None

    # CTR (already may exist, but recompute for consistency)
    if impressions > 0:
        kpis["ctr"] = round((clicks / impressions) * 100, 2)
    else:
        kpis["ctr"] = 0.0

    # CPC
    if clicks > 0:
        kpis["cpc"] = round(spend / clicks, 2)
    else:
        kpis["cpc"] = None

    # CPM
    if impressions > 0:
        kpis["cpm"] = round((spend / impressions) * 1000, 2)
    else:
        kpis["cpm"] = None

    # Click-to-lead rate
    if clicks > 0 and lead_count > 0:
        kpis["click_to_lead_rate"] = round((lead_count / clicks) * 100, 2)
    else:
        kpis["click_to_lead_rate"] = None

    return kpis


# ---------------------------------------------------------------------------
# Classification
# ---------------------------------------------------------------------------

def classify_ad(
    kpis: dict[str, Any],
    thresholds: dict[str, float],
    min_spend: float = DEFAULT_MIN_SPEND,
    min_impressions: int = DEFAULT_MIN_IMPRESSIONS,
) -> dict[str, str]:
    """
    Classify an ad and generate a recommendation.

    Classifications:
        - winner: CPL at or below 80% of target
        - marginal: CPL between target and 130% of target
        - loser: CPL above 200% of target (kill threshold)
        - needs_more_data: not enough spend/impressions to classify

    Recommendations:
        - scale: increase budget, duplicate to new audiences
        - iterate: test new hooks/angles on this ad
        - kill: pause immediately
        - wait: let it run, check back after more spend
    """
    spend = kpis.get("spend", 0)
    impressions = kpis.get("impressions", 0)
    cpl = kpis.get("cpl")
    ctr = kpis.get("ctr", 0)

    # Not enough data
    if spend < min_spend or impressions < min_impressions:
        return {
            "classification": "needs_more_data",
            "recommendation": "wait",
            "reason": f"Insufficient data (spend: {spend:.2f} EUR, impressions: {impressions}). "
                      f"Need at least {min_spend:.2f} EUR spend and {min_impressions} impressions.",
        }

    # No leads at all with meaningful spend
    if cpl is None and spend >= min_spend * 3:
        return {
            "classification": "loser",
            "recommendation": "kill",
            "reason": f"Spent {spend:.2f} EUR with zero leads. Pause immediately.",
        }

    if cpl is None:
        return {
            "classification": "needs_more_data",
            "recommendation": "wait",
            "reason": f"No leads yet but spend ({spend:.2f} EUR) still below 3x minimum. "
                      "Allow more time.",
        }

    # Winner
    if cpl <= thresholds["cpl_winner"]:
        reason = (
            f"CPL ({cpl:.2f} EUR) is well below target ({thresholds['cpl_target']:.2f} EUR). "
            "This is a top performer."
        )
        return {
            "classification": "winner",
            "recommendation": "scale",
            "reason": reason,
        }

    # Good — at or near target
    if cpl <= thresholds["cpl_target"]:
        return {
            "classification": "winner",
            "recommendation": "scale",
            "reason": f"CPL ({cpl:.2f} EUR) is at or below target ({thresholds['cpl_target']:.2f} EUR).",
        }

    # Marginal
    if cpl <= thresholds["cpl_marginal_upper"]:
        reason = (
            f"CPL ({cpl:.2f} EUR) is slightly above target ({thresholds['cpl_target']:.2f} EUR). "
            "Worth iterating with new hooks or angles."
        )
        return {
            "classification": "marginal",
            "recommendation": "iterate",
            "reason": reason,
        }

    # Between marginal and kill
    if cpl <= thresholds["cpl_kill"]:
        # Check if CTR is okay — might be a landing page issue
        if ctr >= thresholds["ctr_low"]:
            return {
                "classification": "marginal",
                "recommendation": "iterate",
                "reason": f"CPL ({cpl:.2f} EUR) is high but CTR ({ctr:.2f}%) is decent. "
                          "May be a landing page or form issue rather than creative.",
            }
        return {
            "classification": "loser",
            "recommendation": "kill",
            "reason": f"CPL ({cpl:.2f} EUR) exceeds target by >30% and CTR ({ctr:.2f}%) is low. "
                      "Pause and reallocate budget.",
        }

    # Above kill threshold
    return {
        "classification": "loser",
        "recommendation": "kill",
        "reason": f"CPL ({cpl:.2f} EUR) is more than 2x the target ({thresholds['cpl_target']:.2f} EUR). "
                  "Pause immediately.",
    }


# ---------------------------------------------------------------------------
# Analysis pipeline
# ---------------------------------------------------------------------------

def analyze_insights(
    insights_data: dict[str, Any],
    brand_id: str,
    min_spend: float = DEFAULT_MIN_SPEND,
    min_impressions: int = DEFAULT_MIN_IMPRESSIONS,
) -> dict[str, Any]:
    """
    Run the full analysis pipeline on insights data.

    Returns the complete analysis payload.
    """
    thresholds = load_brand_thresholds(brand_id)
    records = insights_data.get("data", [])

    if not records:
        logger.warning("No records found in insights data.")
        return {
            "metadata": {
                "tool": "analyze_performance",
                "brand": brand_id,
                "thresholds": thresholds,
                "total_records": 0,
                "analyzed_at": datetime.utcnow().isoformat() + "Z",
            },
            "summary": {},
            "ads": [],
        }

    analyzed_ads: list[dict[str, Any]] = []
    classification_counts = {"winner": 0, "marginal": 0, "loser": 0, "needs_more_data": 0}
    recommendation_counts = {"scale": 0, "iterate": 0, "kill": 0, "wait": 0}

    for record in records:
        kpis = compute_kpis(record)
        classification = classify_ad(kpis, thresholds, min_spend, min_impressions)

        ad_entry = {
            "ad_name": record.get("ad_name", record.get("adset_name", record.get("campaign_name", "unknown"))),
            "ad_id": record.get("ad_id", record.get("adset_id", record.get("campaign_id", ""))),
            "campaign_name": record.get("campaign_name", ""),
            "adset_name": record.get("adset_name", ""),
            "kpis": kpis,
            "classification": classification["classification"],
            "recommendation": classification["recommendation"],
            "reason": classification["reason"],
        }

        analyzed_ads.append(ad_entry)
        classification_counts[classification["classification"]] += 1
        recommendation_counts[classification["recommendation"]] += 1

    # Sort: winners first, then marginal, then losers
    sort_order = {"winner": 0, "marginal": 1, "needs_more_data": 2, "loser": 3}
    analyzed_ads.sort(key=lambda a: (sort_order.get(a["classification"], 99), a["kpis"].get("cpl") or 9999))

    # Summary stats
    total_spend = sum(a["kpis"]["spend"] for a in analyzed_ads)
    total_leads = sum(a["kpis"]["lead_count"] for a in analyzed_ads)

    summary = {
        "total_ads_analyzed": len(analyzed_ads),
        "total_spend": round(total_spend, 2),
        "total_leads": total_leads,
        "overall_cpl": round(total_spend / total_leads, 2) if total_leads > 0 else None,
        "cpl_target": thresholds["cpl_target"],
        "on_target": total_leads > 0 and (total_spend / total_leads) <= thresholds["cpl_target"],
        "classification_breakdown": classification_counts,
        "recommendation_breakdown": recommendation_counts,
        "top_performers": [
            {"name": a["ad_name"], "cpl": a["kpis"]["cpl"], "leads": a["kpis"]["lead_count"]}
            for a in analyzed_ads
            if a["classification"] == "winner"
        ][:5],
        "worst_performers": [
            {"name": a["ad_name"], "cpl": a["kpis"]["cpl"], "spend": a["kpis"]["spend"]}
            for a in analyzed_ads
            if a["classification"] == "loser"
        ][:5],
    }

    output = {
        "metadata": {
            "tool": "analyze_performance",
            "brand": brand_id,
            "thresholds": thresholds,
            "min_spend_threshold": min_spend,
            "min_impressions_threshold": min_impressions,
            "total_records": len(records),
            "analyzed_at": datetime.utcnow().isoformat() + "Z",
        },
        "summary": summary,
        "ads": analyzed_ads,
    }

    return output


def save_output(data: dict[str, Any], brand_id: str) -> Path:
    """Write analysis output to .tmp/performance/."""
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d")
    filename = f"analysis_{brand_id}_{date_str}.json"
    output_path = TMP_DIR / filename

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    logger.info("Analysis saved to %s", output_path)
    return output_path


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Analyze ad performance and classify ads.",
    )
    parser.add_argument(
        "--insights_file",
        type=str,
        required=True,
        help="Path to insights JSON file (from pull_ad_insights.py)",
    )
    parser.add_argument(
        "--brand",
        type=str,
        required=True,
        help="Brand ID for KPI thresholds",
    )
    parser.add_argument(
        "--min_spend",
        type=float,
        default=DEFAULT_MIN_SPEND,
        help=f"Minimum spend (EUR) to classify (default: {DEFAULT_MIN_SPEND})",
    )
    parser.add_argument(
        "--min_impressions",
        type=int,
        default=DEFAULT_MIN_IMPRESSIONS,
        help=f"Minimum impressions to classify (default: {DEFAULT_MIN_IMPRESSIONS})",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> None:
    args = parse_args(argv)

    try:
        # Load insights data
        insights_path = Path(args.insights_file)
        if not insights_path.exists():
            logger.error("Insights file not found: %s", insights_path)
            sys.exit(1)

        with open(insights_path, "r", encoding="utf-8") as f:
            insights_data = json.load(f)

        # Run analysis
        analysis = analyze_insights(
            insights_data=insights_data,
            brand_id=args.brand,
            min_spend=args.min_spend,
            min_impressions=args.min_impressions,
        )

        # Save and output
        output_path = save_output(analysis, args.brand)
        print(json.dumps(analysis, indent=2))
        logger.info("Analysis complete. Output: %s", output_path)

    except ValueError as exc:
        logger.error("Validation error: %s", exc)
        sys.exit(1)
    except Exception as exc:
        logger.exception("Unexpected error: %s", exc)
        sys.exit(2)


if __name__ == "__main__":
    main()
