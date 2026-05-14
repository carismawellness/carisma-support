"""Workflow 08 Steps 1-3: Plan campaign structure, generate naming, run validation."""
import json, sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

BASE     = Path(__file__).resolve().parent.parent
DATE     = "20260420"
WEEK     = "W16"
YEAR     = "2026"
PUB      = BASE / ".tmp" / "publishing"
PUB.mkdir(parents=True, exist_ok=True)

CREATIVES_DIR = BASE / ".tmp" / "creatives"

# ── Brand configs (from brands.json / offers.json) ───────────────────────────

BRANDS = {
    "carisma_spa": {
        "code": "CS",
        "name": "Carisma Spa",
        "ad_account_id": "act_654279452039150",
        "page_id": "375775105843811",
        "pixel_id": "666033220769723",
        "daily_budget_eur": 50,
        "targeting": {
            "age_min": 25, "age_max": 65,
            "genders": [2],
            "geo_locations": {"countries": ["MT"]},
            "publisher_platforms": ["facebook", "instagram"],
            "facebook_positions": ["feed", "story", "reels"],
            "instagram_positions": ["stream", "story", "reels"],
            "flexible_spec": [{"interests": [
                {"name": "Spa"}, {"name": "Wellness"}, {"name": "Massage"},
                {"name": "Self-care"}, {"name": "Luxury lifestyle"},
            ]}],
        },
    },
    "carisma_aesthetics": {
        "code": "CA",
        "name": "Carisma Aesthetics",
        "ad_account_id": "act_382359687910745",
        "page_id": "117681807972195",
        "pixel_id": "878798843817476",
        "daily_budget_eur": 50,
        "targeting": {
            "age_min": 25, "age_max": 55,
            "genders": [2],
            "geo_locations": {"countries": ["MT"]},
            "publisher_platforms": ["facebook", "instagram"],
            "facebook_positions": ["feed", "story", "reels"],
            "instagram_positions": ["stream", "story", "reels"],
            "flexible_spec": [{"interests": [
                {"name": "Aesthetics"}, {"name": "Botox"},
                {"name": "Dermal fillers"}, {"name": "Anti-aging"},
                {"name": "Cosmetic treatments"},
            ]}],
        },
    },
}

# ── Campaign structures ───────────────────────────────────────────────────────

CAMPAIGN_STRUCTURES = {
    "carisma_spa": {
        "campaign_name": f"CS_{WEEK}_{YEAR}_CBO",
        "objective": "OUTCOME_LEADS",
        "ad_sets": [
            {
                "adset_name": "CS_SpaDay_UGC_InterestSpaWellness",
                "offer_id": "spa_day_package",
                "landing_page": "https://www.carismaspa.com/spa-day",
                "ads": [
                    {"ad_name": "CS_SpaDay_UGC_QuestionHook_v1",  "format": "ugc_video",
                     "files": ["CS_SpaDay_UGC_QuestionHook_v1_9x16.mp4", "CS_SpaDay_UGC_QuestionHook_v1_1x1.mp4"]},
                    {"ad_name": "CS_SpaDay_UGC_QuestionHook_v2",  "format": "ugc_video",
                     "files": ["CS_SpaDay_UGC_QuestionHook_v2_9x16.mp4", "CS_SpaDay_UGC_QuestionHook_v2_1x1.mp4"]},
                    {"ad_name": "CS_SpaDay_UGC_CuriosityHook_v1", "format": "ugc_video",
                     "files": ["CS_SpaDay_UGC_CuriosityHook_v1_9x16.mp4", "CS_SpaDay_UGC_CuriosityHook_v1_1x1.mp4"]},
                ],
            },
            {
                "adset_name": "CS_SpaDay_Static_InterestSpaWellness",
                "offer_id": "spa_day_package",
                "landing_page": "https://www.carismaspa.com/spa-day",
                "ads": [
                    {"ad_name": "CS_SpaDay_Static_QuestionHook_v1",  "format": "static_image",
                     "files": ["CS_SpaDay_Static_QuestionHook_v1_1x1.png", "CS_SpaDay_Static_QuestionHook_v1_9x16.png"]},
                    {"ad_name": "CS_SpaDay_Static_CuriosityHook_v1", "format": "static_image",
                     "files": ["CS_SpaDay_Static_CuriosityHook_v1_1x1.png", "CS_SpaDay_Static_CuriosityHook_v1_9x16.png"]},
                ],
            },
            {
                "adset_name": "CS_GiftCouples_InterestSpaWellness",
                "offer_id": "gift_voucher",
                "landing_page": "https://www.carismaspa.com/gift-vouchers",
                "ads": [
                    {"ad_name": "CS_GiftVoucher_UGC_QuestionHook_v1",  "format": "ugc_video",
                     "files": ["CS_GiftVoucher_UGC_QuestionHook_v1_9x16.mp4", "CS_GiftVoucher_UGC_QuestionHook_v1_1x1.mp4"]},
                    {"ad_name": "CS_GiftVoucher_Static_QuestionHook_v1","format": "static_image",
                     "files": ["CS_GiftVoucher_Static_QuestionHook_v1_1x1.png", "CS_GiftVoucher_Static_QuestionHook_v1_9x16.png"]},
                    {"ad_name": "CS_Couples_Static_EmotionalHook_v1",   "format": "static_image",
                     "files": ["CS_Couples_Static_EmotionalHook_v1_1x1.png", "CS_Couples_Static_EmotionalHook_v1_9x16.png"]},
                ],
            },
        ],
    },
    "carisma_aesthetics": {
        "campaign_name": f"CA_{WEEK}_{YEAR}_CBO",
        "objective": "OUTCOME_LEADS",
        "ad_sets": [
            {
                "adset_name": "CA_Botox_InterestAestheticsMT",
                "offer_id": "botox",
                "landing_page": "https://www.carismaaesthetics.com/botox",
                "ads": [
                    {"ad_name": "CA_Botox_UGC_QuestionHook_v1",   "format": "ugc_video",
                     "files": ["CA_Botox_UGC_QuestionHook_v1_9x16.mp4", "CA_Botox_UGC_QuestionHook_v1_1x1.mp4"]},
                    {"ad_name": "CA_Botox_UGC_QuestionHook_v2",   "format": "ugc_video",
                     "files": ["CA_Botox_UGC_QuestionHook_v2_9x16.mp4", "CA_Botox_UGC_QuestionHook_v2_1x1.mp4"]},
                    {"ad_name": "CA_Botox_Static_QuestionHook_v1","format": "static_image",
                     "files": ["CA_Botox_Static_QuestionHook_v1_1x1.png", "CA_Botox_Static_QuestionHook_v1_9x16.png"]},
                    {"ad_name": "CA_Botox_Static_SpringHook_v1",  "format": "static_image",
                     "files": ["CA_Botox_Static_SpringHook_v1_1x1.png", "CA_Botox_Static_SpringHook_v1_9x16.png"]},
                ],
            },
            {
                "adset_name": "CA_Fillers_InterestAestheticsMT",
                "offer_id": "fillers",
                "landing_page": "https://www.carismaaesthetics.com/fillers",
                "ads": [
                    {"ad_name": "CA_Fillers_UGC_TransformHook_v1",    "format": "ugc_video",
                     "files": ["CA_Fillers_UGC_TransformHook_v1_9x16.mp4", "CA_Fillers_UGC_TransformHook_v1_1x1.mp4"]},
                    {"ad_name": "CA_Fillers_UGC_TransformHook_v2",    "format": "ugc_video",
                     "files": ["CA_Fillers_UGC_TransformHook_v2_9x16.mp4", "CA_Fillers_UGC_TransformHook_v2_1x1.mp4"]},
                    {"ad_name": "CA_Fillers_Static_TransformHook_v1", "format": "static_image",
                     "files": ["CA_Fillers_Static_TransformHook_v1_1x1.png", "CA_Fillers_Static_TransformHook_v1_9x16.png"]},
                    {"ad_name": "CA_Fillers_Static_ObjectionHook_v1", "format": "static_image",
                     "files": ["CA_Fillers_Static_ObjectionHook_v1_1x1.png", "CA_Fillers_Static_ObjectionHook_v1_9x16.png"]},
                ],
            },
        ],
    },
}

# ── Run for each brand ────────────────────────────────────────────────────────

for brand_id, struct in CAMPAIGN_STRUCTURES.items():
    brand = BRANDS[brand_id]
    print(f"\n── {brand['name']} ──")

    # 1. Naming JSON
    naming = {
        "brand_id": brand_id,
        "brand_name": brand["name"],
        "week": WEEK,
        "year": YEAR,
        "generated_date": "2026-04-20",
        "campaign_name": struct["campaign_name"],
        "ad_sets": [
            {
                "adset_name": ads["adset_name"],
                "offer_id": ads["offer_id"],
                "landing_page": ads["landing_page"],
                "ads": [a["ad_name"] for a in ads["ads"]],
            }
            for ads in struct["ad_sets"]
        ],
    }
    n_path = PUB / f"naming_{brand_id}_{DATE}.json"
    n_path.write_text(json.dumps(naming, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"  Naming → {n_path.name}")

    # 2. Full structure JSON (ready for API)
    daily_budget_cents = int(brand["daily_budget_eur"] * 100)
    full_struct = {
        "brand_id": brand_id,
        "brand_name": brand["name"],
        "ad_account_id": brand["ad_account_id"],
        "page_id": brand["page_id"],
        "pixel_id": brand["pixel_id"],
        "generated_date": "2026-04-20",
        "campaign": {
            "name": struct["campaign_name"],
            "objective": struct["objective"],
            "status": "PAUSED",
            "budget_optimization": "CAMPAIGN_BUDGET",
            "daily_budget_cents": daily_budget_cents,
            "bid_strategy": "LOWEST_COST_WITHOUT_CAP",
            "special_ad_categories": [],
        },
        "ad_sets": [
            {
                "name": adset["adset_name"],
                "status": "PAUSED",
                "optimization_goal": "LEAD_GENERATION",
                "billing_event": "IMPRESSIONS",
                "destination_type": "WEBSITE",
                "targeting": brand["targeting"],
                "promoted_object": {
                    "page_id": brand["page_id"],
                    "pixel_id": brand["pixel_id"],
                    "custom_event_type": "LEAD",
                },
                "ads": [
                    {
                        "name": ad["ad_name"],
                        "status": "PAUSED",
                        "format": ad["format"],
                        "landing_page": adset["landing_page"],
                        "creative_files": ad["files"],
                        "creative_uploaded": False,
                        "creative_id": None,
                    }
                    for ad in adset["ads"]
                ],
            }
            for adset in struct["ad_sets"]
        ],
    }
    s_path = PUB / f"campaign_structure_{brand_id}_{DATE}.json"
    s_path.write_text(json.dumps(full_struct, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"  Structure → {s_path.name}")

    # 3. Validation
    errors, warnings, info = [], [], []

    # Check creatives exist
    all_files = [f for adset in struct["ad_sets"] for ad in adset["ads"] for f in ad["files"]]
    missing = [f for f in all_files if not (CREATIVES_DIR / f).exists()]
    present = [f for f in all_files if (CREATIVES_DIR / f).exists()]

    if missing:
        errors.append(f"MISSING CREATIVES ({len(missing)}/{len(all_files)}): Files not yet in .tmp/creatives/")
        for f in missing:
            errors.append(f"  ✗ {f}")

    # Check ad account IDs
    if brand["ad_account_id"] == "TO_BE_FILLED":
        errors.append("CRITICAL: meta_ad_account_id is TO_BE_FILLED in brands.json")
    else:
        info.append(f"Ad account: {brand['ad_account_id']} ✓")

    if brand["page_id"] == "TO_BE_FILLED":
        errors.append("CRITICAL: meta_page_id is TO_BE_FILLED in brands.json")
    else:
        info.append(f"Page ID: {brand['page_id']} ✓")

    # Check ad counts
    for adset in struct["ad_sets"]:
        n = len(adset["ads"])
        if n < 2:
            warnings.append(f"Ad set '{adset['adset_name']}' has only {n} ad — minimum 2 recommended")
        elif n > 4:
            warnings.append(f"Ad set '{adset['adset_name']}' has {n} ads — maximum 4 recommended")
        else:
            info.append(f"Ad set '{adset['adset_name']}': {n} ads ✓")

    # Budget
    if brand["daily_budget_eur"] < 1:
        errors.append(f"Daily budget €{brand['daily_budget_eur']} is below Meta minimum (€1)")
    else:
        info.append(f"Daily budget: €{brand['daily_budget_eur']} ✓")

    # Interest IDs
    warnings.append("Interest IDs not resolved — using names only. Run targeting search API before publishing.")

    # Determine gate
    critical_blocked = any("CRITICAL" in e or "MISSING" in e for e in errors)
    can_create_campaign_adsets = brand["ad_account_id"] != "TO_BE_FILLED" and brand["page_id"] != "TO_BE_FILLED"

    validation = {
        "brand_id": brand_id,
        "validated_date": "2026-04-20",
        "gate": "BLOCKED_PENDING_CREATIVES" if missing else "PASS",
        "can_create_campaign_and_adsets": can_create_campaign_adsets,
        "can_create_ads": len(missing) == 0,
        "total_creatives_expected": len(all_files),
        "creatives_present": len(present),
        "creatives_missing": len(missing),
        "errors": errors,
        "warnings": warnings,
        "info": info,
    }
    v_path = PUB / f"validation_{brand_id}_{DATE}.json"
    v_path.write_text(json.dumps(validation, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"  Validation → {v_path.name}")

    # Print summary
    total_ads = sum(len(a["ads"]) for a in struct["ad_sets"])
    print(f"  Campaign: {struct['campaign_name']}")
    print(f"  Ad sets: {len(struct['ad_sets'])} | Ads: {total_ads}")
    print(f"  Creatives: {len(present)}/{len(all_files)} present")
    print(f"  Gate: {'PASS' if not missing else 'BLOCKED — awaiting creatives'}")
    print(f"  Campaign/AdSet API ready: {'YES' if can_create_campaign_adsets else 'NO'}")

print("\nDone — campaign structures planned.")
