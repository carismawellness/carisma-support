"""Workflow 08 Step 9: Generate pre-publish summary for manual Ads Manager setup."""
import json, sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

BASE  = Path(__file__).resolve().parent.parent
DATE  = "20260420"
PUB   = BASE / ".tmp" / "publishing"
PUB.mkdir(parents=True, exist_ok=True)

for brand_id in ["carisma_spa", "carisma_aesthetics"]:
    struct = json.loads((PUB / f"campaign_structure_{brand_id}_{DATE}.json").read_text(encoding="utf-8"))
    naming = json.loads((PUB / f"naming_{brand_id}_{DATE}.json").read_text(encoding="utf-8"))

    brand_name = struct["brand_name"]
    camp       = struct["campaign"]
    ad_account = struct["ad_account_id"]
    page_id    = struct["page_id"]
    pixel_id   = struct["pixel_id"]
    daily_eur  = camp["daily_budget_cents"] // 100

    adset_rows = []
    ad_rows    = []
    for adset in struct["ad_sets"]:
        adset_rows.append(
            f"| {adset['name']} | {adset['ads'][0]['landing_page']} | {len(adset['ads'])} | Spa/Wellness interests, MT, F 25-65 |"
            if "spa" in brand_id else
            f"| {adset['name']} | {adset['ads'][0]['landing_page']} | {len(adset['ads'])} | Aesthetics interests, MT, F 25-55 |"
        )
        for ad in adset["ads"]:
            files_str = ", ".join(f"`{f}`" for f in ad["creative_files"])
            ad_rows.append(f"| {ad['name']} | {ad['format'].replace('_',' ').title()} | {files_str} | PAUSED |")

    adset_table = "\n".join(adset_rows)
    ad_table    = "\n".join(ad_rows)

    total_ads = sum(len(a["ads"]) for a in struct["ad_sets"])

    lines = [
        f"# Publishing Summary — {brand_name}",
        f"## Workflow 08 | Date: 2026-04-20 | Status: READY TO BUILD",
        "",
        "> **Token note:** Current Meta token is missing `ads_management` scope.",
        "> Build this campaign manually in Meta Ads Manager, or obtain a token with `ads_management` to automate.",
        "",
        "---",
        "",
        "## Campaign",
        "",
        "| Field | Value |",
        "|-------|-------|",
        f"| Campaign Name | `{camp['name']}` |",
        f"| Ad Account | `{ad_account}` |",
        f"| Objective | OUTCOME_LEADS (Lead Generation) |",
        f"| Budget Type | CBO — Campaign Budget Optimisation |",
        f"| Daily Budget | €{daily_eur} |",
        f"| Status | **PAUSED** |",
        f"| Bid Strategy | Lowest cost |",
        f"| Special Ad Categories | None |",
        "",
        "---",
        "",
        "## Ad Sets",
        "",
        f"| Ad Set Name | Landing Page | Ads | Targeting |",
        f"|-------------|-------------|-----|-----------|",
        adset_table,
        "",
        "**Targeting spec (all ad sets):**",
    ]

    if "spa" in brand_id:
        lines += [
            "- Age: 25–65 | Gender: Female | Country: Malta (MT)",
            "- Interests: Spa, Wellness, Massage, Self-care, Luxury lifestyle",
            "- Placements: Facebook Feed, Stories, Reels + Instagram Stream, Stories, Reels",
        ]
    else:
        lines += [
            "- Age: 25–55 | Gender: Female | Country: Malta (MT)",
            "- Interests: Aesthetics, Botox, Dermal fillers, Anti-aging, Cosmetic treatments",
            "- Placements: Facebook Feed, Stories, Reels + Instagram Stream, Stories, Reels",
        ]

    lines += [
        "- Optimization goal: LEAD_GENERATION",
        "- Billing event: IMPRESSIONS",
        "- Destination: WEBSITE",
        f"- Pixel: `{pixel_id}` | Event: Lead",
        f"- Page: `{page_id}`",
        "",
        "---",
        "",
        "## Ads",
        "",
        "| Ad Name | Format | Creative Files | Status |",
        "|---------|--------|---------------|--------|",
        ad_table,
        "",
        "> Creative files must be uploaded to `.tmp/creatives/` before ads can be created.",
        "> All creatives are currently **pending production** (Workflows 06/07).",
        "",
        "---",
        "",
        "## Build Checklist",
        "",
        "### To build in Ads Manager now (no creatives needed):",
        "- [ ] Log in to Meta Ads Manager",
        f"- [ ] Select ad account: `{ad_account}`",
        f"- [ ] Create campaign: `{camp['name']}` — Objective: Lead Generation — Budget: €{daily_eur}/day — Status: PAUSED",
    ]

    for adset in struct["ad_sets"]:
        lines.append(f"- [ ] Create ad set: `{adset['name']}` — Status: PAUSED")

    lines += [
        "",
        "### Once creatives are delivered (Workflows 06/07 complete):",
    ]

    for adset in struct["ad_sets"]:
        for ad in adset["ads"]:
            lines.append(f"- [ ] Upload + create ad: `{ad['name']}` → ad set `{adset['name']}`")

    lines += [
        "",
        "### Before activating:",
        "- [ ] Review all ad previews in Ads Manager",
        "- [ ] Verify landing pages load correctly",
        "- [ ] Confirm pixel is firing on landing pages",
        "- [ ] Check campaign budget and targeting once more",
        "- [ ] Manually activate when satisfied — **system never activates campaigns**",
        "",
        "---",
        "",
        f"*Generated by Workflow 08 — Campaign Publishing | {brand_name} | 2026-04-20*",
    ]

    out = PUB / f"summary_{brand_id}_{DATE}.md"
    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"Summary → {out.name} ({total_ads} ads across {len(struct['ad_sets'])} ad sets)")

print("\nDone.")
