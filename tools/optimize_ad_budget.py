"""
Ad Budget Optimizer
Cross-references Fresha capacity data with Meta Ads performance to generate
budget reallocation proposals.

Usage:
    python tools/optimize_ad_budget.py \
        --capacity .tmp/performance/fresha_capacity_report.json \
        --ads .tmp/performance/meta_ads_by_service.json \
        --output .tmp/performance/occupancy-optimizer-report.md

If --ads is omitted, generates a capacity-only report.
"""

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

AWARENESS_MINIMUM_EUR = 5.0
MAX_INCREASE_PCT = 0.30
CEO_APPROVAL_THRESHOLD_EUR = 50.0
NEW_CAMPAIGN_BUDGET_EUR = 15.0


def classify_capacity(avg_slots, booked_pct):
    """Classify service capacity level."""
    if avg_slots == 0 or booked_pct >= 90:
        return "PAUSE"
    elif avg_slots < 3 or booked_pct >= 60:
        return "REDUCE"
    elif avg_slots >= 6:
        return "SCALE"
    else:
        return "MAINTAIN"


def compute_efficiency(capacity_verdict, has_campaigns, daily_spend):
    """Compute efficiency score 0-100."""
    if capacity_verdict == "PAUSE" and has_campaigns:
        return 0
    elif capacity_verdict == "REDUCE" and daily_spend > 20:
        return 20
    elif capacity_verdict == "REDUCE" and daily_spend <= 10:
        return 60
    elif capacity_verdict == "MAINTAIN":
        return 75
    elif capacity_verdict == "SCALE" and has_campaigns and daily_spend > 10:
        return 90
    elif capacity_verdict == "SCALE" and has_campaigns:
        return 40
    elif capacity_verdict == "SCALE" and not has_campaigns:
        return 10
    return 50


def generate_proposal(capacity_data, ads_data=None):
    """Generate budget reallocation proposal."""
    services = []

    for venue_key, venue in capacity_data.get("venues", {}).items():
        for svc_name, svc in venue.get("services", {}).items():
            if svc.get("error"):
                continue

            days_checked = svc.get("days_checked", 1) or 1
            avg_slots = svc.get("total_slots", 0) / days_checked
            booked_pct = (svc.get("fully_booked_days", 0) / days_checked) * 100

            capacity_verdict = classify_capacity(avg_slots, booked_pct)

            # Get ads data for this service
            ads_info = {}
            if ads_data and "by_service" in ads_data:
                ads_info = ads_data["by_service"].get(svc_name, {})

            daily_spend = ads_info.get("daily_spend", 0)
            has_campaigns = bool(ads_info.get("campaigns", []))
            cpl = ads_info.get("avg_cpl", None)
            leads_7d = ads_info.get("total_leads_7d", 0)

            efficiency = compute_efficiency(capacity_verdict, has_campaigns, daily_spend)

            # Determine mismatch type
            if capacity_verdict in ("PAUSE", "REDUCE") and daily_spend > 10:
                mismatch = "WASTE"
            elif capacity_verdict == "SCALE" and (daily_spend < 5 or not has_campaigns):
                mismatch = "OPPORTUNITY"
            else:
                mismatch = "ALIGNED"

            services.append({
                "service": svc_name,
                "venue": venue_key,
                "venue_name": venue.get("venue", venue_key),
                "capacity_verdict": capacity_verdict,
                "avg_slots_per_day": round(avg_slots, 1),
                "booked_pct": round(booked_pct, 0),
                "has_campaigns": has_campaigns,
                "campaign_count": len(ads_info.get("campaigns", [])),
                "daily_spend": round(daily_spend, 2),
                "cpl": round(cpl, 2) if cpl else None,
                "leads_7d": leads_7d,
                "efficiency": efficiency,
                "mismatch": mismatch,
                "next_available": svc.get("next_available")
            })

    # Calculate reallocation
    savings = 0
    for svc in services:
        if svc["capacity_verdict"] == "PAUSE":
            svc["proposed_spend"] = 0
            svc["change"] = -svc["daily_spend"]
            savings += svc["daily_spend"]
        elif svc["capacity_verdict"] == "REDUCE" and svc["daily_spend"] > AWARENESS_MINIMUM_EUR:
            svc["proposed_spend"] = AWARENESS_MINIMUM_EUR
            svc["change"] = -(svc["daily_spend"] - AWARENESS_MINIMUM_EUR)
            savings += svc["daily_spend"] - AWARENESS_MINIMUM_EUR
        else:
            svc["proposed_spend"] = svc["daily_spend"]
            svc["change"] = 0

    # Distribute savings to SCALE opportunities
    scale_services = [s for s in services if s["capacity_verdict"] == "SCALE"]
    scale_services.sort(key=lambda s: (-s["avg_slots_per_day"], s.get("cpl") or 999))

    remaining_savings = savings
    for svc in scale_services:
        if remaining_savings <= 0:
            break
        if svc["has_campaigns"]:
            max_increase = svc["daily_spend"] * MAX_INCREASE_PCT
            increase = min(max_increase, remaining_savings) if max_increase > 0 else min(NEW_CAMPAIGN_BUDGET_EUR, remaining_savings)
        else:
            increase = min(NEW_CAMPAIGN_BUDGET_EUR, remaining_savings)
        svc["proposed_spend"] = round(svc["daily_spend"] + increase, 2)
        svc["change"] = round(increase, 2)
        remaining_savings -= increase

    # Flag CEO approvals
    for svc in services:
        svc["ceo_approval"] = abs(svc.get("change", 0)) > CEO_APPROVAL_THRESHOLD_EUR

    return {
        "generated_at": datetime.now().isoformat(),
        "total_savings_per_day": round(savings, 2),
        "total_redistributed": round(savings - remaining_savings, 2),
        "surplus": round(remaining_savings, 2),
        "services": services,
        "waste_count": sum(1 for s in services if s["mismatch"] == "WASTE"),
        "opportunity_count": sum(1 for s in services if s["mismatch"] == "OPPORTUNITY"),
    }


def render_markdown(proposal, capacity_only=False):
    """Render the proposal as markdown."""
    lines = [
        "# Occupancy Optimizer Report",
        f"## Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        ""
    ]

    if capacity_only:
        lines.append("> **Note:** Meta Ads data unavailable. This is a capacity-only report.")
        lines.append("")

    # Executive summary
    lines.append("### Executive Summary")
    lines.append(f"- **{proposal['waste_count']}** services over-advertised (wasting budget on full capacity)")
    lines.append(f"- **{proposal['opportunity_count']}** services under-advertised (open capacity, low/no spend)")
    if not capacity_only:
        lines.append(f"- **Proposed daily shift:** EUR {proposal['total_redistributed']:.2f}/day from constrained to open services")
        if proposal["surplus"] > 0:
            lines.append(f"- **Surplus:** EUR {proposal['surplus']:.2f}/day unallocated (can bank or distribute)")
    lines.append("")

    # Service table
    lines.append("### Service-by-Service Analysis")
    lines.append("")
    if capacity_only:
        lines.append("| Service | Venue | Capacity | Booked % | Slots/Day | Next Available |")
        lines.append("|---------|-------|----------|----------|-----------|----------------|")
        for svc in sorted(proposal["services"], key=lambda s: s["efficiency"]):
            lines.append(
                f"| {svc['service']} | {svc['venue']} | {svc['capacity_verdict']} "
                f"| {svc['booked_pct']:.0f}% | {svc['avg_slots_per_day']} "
                f"| {svc.get('next_available') or 'N/A'} |"
            )
    else:
        lines.append("| Service | Venue | Capacity | Booked % | Slots/Day | Campaigns | Spend/Day | CPL | Score | Mismatch |")
        lines.append("|---------|-------|----------|----------|-----------|-----------|-----------|-----|-------|----------|")
        for svc in sorted(proposal["services"], key=lambda s: s["efficiency"]):
            cpl_str = f"EUR {svc['cpl']:.2f}" if svc["cpl"] else "N/A"
            lines.append(
                f"| {svc['service']} | {svc['venue']} | {svc['capacity_verdict']} "
                f"| {svc['booked_pct']:.0f}% | {svc['avg_slots_per_day']} "
                f"| {svc['campaign_count']} | EUR {svc['daily_spend']:.2f} "
                f"| {cpl_str} | {svc['efficiency']} | {svc['mismatch']} |"
            )
    lines.append("")

    # Reallocation table (only if ads data available)
    if not capacity_only:
        changes = [s for s in proposal["services"] if s.get("change", 0) != 0]
        if changes:
            lines.append("### Budget Reallocation Proposal")
            lines.append("")
            lines.append("| Priority | Service | Current | Proposed | Change | Reason |")
            lines.append("|----------|---------|---------|----------|--------|--------|")
            priority = 1
            for svc in sorted(changes, key=lambda s: s.get("change", 0)):
                reason = f"{svc['capacity_verdict']}: {svc['booked_pct']:.0f}% booked, {svc['avg_slots_per_day']} slots/day"
                flag = " **CEO APPROVAL**" if svc.get("ceo_approval") else ""
                lines.append(
                    f"| {priority} | {svc['service']} "
                    f"| EUR {svc['daily_spend']:.2f} "
                    f"| EUR {svc['proposed_spend']:.2f} "
                    f"| EUR {svc['change']:+.2f} "
                    f"| {reason}{flag} |"
                )
                priority += 1
            lines.append("")

    # CEO approvals
    ceo_items = [s for s in proposal["services"] if s.get("ceo_approval")]
    if ceo_items:
        lines.append("### CEO Approval Required")
        lines.append("")
        for svc in ceo_items:
            lines.append(f"- **{svc['service']}**: EUR {abs(svc['change']):.2f}/day change exceeds EUR 50 threshold")
        lines.append("")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Ad Budget Optimizer")
    parser.add_argument("--capacity", required=True, help="Path to fresha_capacity_report.json")
    parser.add_argument("--ads", help="Path to meta_ads_by_service.json (optional)")
    parser.add_argument("--output", default=".tmp/performance/occupancy-optimizer-report.md")
    args = parser.parse_args()

    # Load capacity data
    capacity_path = Path(args.capacity)
    if not capacity_path.exists():
        print(f"ERROR: Capacity report not found: {args.capacity}")
        sys.exit(1)

    with open(capacity_path) as f:
        capacity_data = json.load(f)

    # Load ads data (optional)
    ads_data = None
    capacity_only = True
    if args.ads:
        ads_path = Path(args.ads)
        if ads_path.exists():
            with open(ads_path) as f:
                ads_data = json.load(f)
            capacity_only = False
        else:
            print(f"WARNING: Ads data not found: {args.ads}. Running capacity-only mode.")

    # Generate proposal
    proposal = generate_proposal(capacity_data, ads_data)

    # Render and save markdown
    markdown = render_markdown(proposal, capacity_only)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        f.write(markdown)

    # Also save raw proposal JSON
    json_path = output_path.with_suffix(".json")
    with open(json_path, "w") as f:
        json.dump(proposal, f, indent=2)

    # Print executive summary
    print(f"\n{'='*60}")
    print("OCCUPANCY OPTIMIZER — Executive Summary")
    print(f"{'='*60}")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"WASTE: {proposal['waste_count']} services over-advertised")
    print(f"OPPORTUNITIES: {proposal['opportunity_count']} services under-advertised")
    if not capacity_only:
        print(f"PROPOSED SHIFT: EUR {proposal['total_redistributed']:.2f}/day")
    else:
        print("MODE: Capacity-only (no Meta Ads data)")
    print(f"\nFull report: {args.output}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
