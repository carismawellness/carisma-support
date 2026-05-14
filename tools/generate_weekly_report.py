"""Workflow 11: Generate weekly report (first-run, no active campaigns yet)."""
import json, sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

BASE  = Path(__file__).resolve().parent.parent
DATE  = "20260420"
PUB   = BASE / ".tmp" / "publishing"
REP   = BASE / ".tmp" / "reporting"
REP.mkdir(parents=True, exist_ok=True)

# Load what we produced this session
def load_json(path):
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except Exception:
        return {}

spa_scripts  = load_json(BASE / ".tmp" / "scripts" / f"scripts_carisma_spa_{DATE}.json")
aes_scripts  = load_json(BASE / ".tmp" / "scripts" / f"scripts_carisma_aesthetics_{DATE}.json")
spa_briefs   = load_json(BASE / ".tmp" / "briefs" / f"index_carisma_spa_{DATE}.json")
aes_briefs   = load_json(BASE / ".tmp" / "briefs" / f"index_carisma_aesthetics_{DATE}.json")
spa_struct   = load_json(PUB / f"campaign_structure_carisma_spa_{DATE}.json")
aes_struct   = load_json(PUB / f"campaign_structure_carisma_aesthetics_{DATE}.json")

def count_by_type(briefs, ptype):
    return sum(1 for b in briefs.get("briefs", []) if b.get("production_type") == ptype)

# ── Build report data JSON ────────────────────────────────────────────────────

report_data = {
    "report_date":  "2026-04-20",
    "week_of":      "2026-04-14 to 2026-04-20",
    "report_type":  "FIRST_REPORT",
    "data_source":  "No active campaigns — first-week setup report",
    "brands": {
        "carisma_spa": {
            "metrics": {
                "spend_eur": 0, "leads": 0, "cpl_eur": None,
                "impressions": 0, "reach": 0, "ctr_pct": None,
                "active_ads": 0, "budget_utilisation_pct": 0,
            },
            "wow_trend": "first_report",
            "activity": {
                "scripts_generated": len(spa_scripts.get("scripts", [])),
                "briefs_generated": spa_briefs.get("total_briefs", 0),
                "manual_videos_pending": count_by_type(spa_briefs, "manual_video"),
                "static_ads_pending":    count_by_type(spa_briefs, "automated_static"),
                "campaigns_launched": 0,
                "campaign_name": spa_struct.get("campaign", {}).get("name", "CS_W16_2026_CBO"),
                "ad_sets_planned": len(spa_struct.get("ad_sets", [])),
                "ads_planned": sum(len(a["ads"]) for a in spa_struct.get("ad_sets", [])),
            },
        },
        "carisma_aesthetics": {
            "metrics": {
                "spend_eur": 0, "leads": 0, "cpl_eur": None,
                "impressions": 0, "reach": 0, "ctr_pct": None,
                "active_ads": 0, "budget_utilisation_pct": 0,
            },
            "wow_trend": "first_report",
            "activity": {
                "scripts_generated": len(aes_scripts.get("scripts", [])),
                "briefs_generated":  aes_briefs.get("total_briefs", 0),
                "manual_videos_pending": count_by_type(aes_briefs, "manual_video"),
                "static_ads_pending":    count_by_type(aes_briefs, "automated_static"),
                "campaigns_launched": 0,
                "campaign_name": aes_struct.get("campaign", {}).get("name", "CA_W16_2026_CBO"),
                "ad_sets_planned": len(aes_struct.get("ad_sets", [])),
                "ads_planned": sum(len(a["ads"]) for a in aes_struct.get("ad_sets", [])),
            },
        },
    },
}

data_path = REP / f"weekly_report_{DATE}.json"
data_path.write_text(json.dumps(report_data, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"Report data → {data_path.name}")

# ── Build markdown report ─────────────────────────────────────────────────────

spa_act  = report_data["brands"]["carisma_spa"]["activity"]
aes_act  = report_data["brands"]["carisma_aesthetics"]["activity"]

report_md = f"""# Weekly Performance Report — Carisma Group
## Week of 14 April – 20 April 2026
**Report type:** First report — Monday AM launch cycle | No active campaigns yet
**Generated:** 2026-04-20

---

## Executive Summary

This is the first weekly report for the Carisma Group paid media operation. No campaigns are active yet — this week's work covers the full Monday AM launch cycle: research, hook mining, script generation, creative briefs, production handoffs, and campaign structure planning.

| Item | Status |
|------|--------|
| Performance data available | No — awaiting first campaign launch |
| Campaigns created in Meta | Pending (`ads_management` token permission needed) |
| Scripts approved | 16 (8 Carisma Spa + 8 Carisma Aesthetics) |
| Creative briefs ready | 16 (8 manual video + 8 static) |
| Creatives produced | 0 — pending filming and design |

---

## Brand: Carisma Spa

### Key Metrics (Week 16)
| Metric | This Week | Target | Status |
|--------|----------|--------|--------|
| Spend | €0 | €350/wk | No campaigns active |
| Leads | 0 | — | No campaigns active |
| Avg CPL | — | €8.00 | — |
| Active Ads | 0 | — | Pending production |
| Monthly Budget | €1,500 | — | €0 spent (0%) |

### Activity This Week
| Action | Count | Detail |
|--------|-------|--------|
| Scripts generated | {spa_act['scripts_generated']} | Spa Day, Gift Voucher, Couples offers |
| Creative briefs | {spa_act['briefs_generated']} | {spa_act['manual_videos_pending']} manual video + {spa_act['static_ads_pending']} static |
| Campaign planned | 1 | `{spa_act['campaign_name']}` — {spa_act['ad_sets_planned']} ad sets, {spa_act['ads_planned']} ads |
| Videos pending filming | {spa_act['manual_videos_pending']} | CapCut briefs delivered |
| Statics pending design | {spa_act['static_ads_pending']} | Figma briefs delivered |

---

## Brand: Carisma Aesthetics

### Key Metrics (Week 16)
| Metric | This Week | Target | Status |
|--------|----------|--------|--------|
| Spend | €0 | €350/wk | No campaigns active |
| Leads | 0 | — | No campaigns active |
| Avg CPL | — | €12.00 | — |
| Active Ads | 0 | — | Pending production |
| Monthly Budget | €1,500 | — | €0 spent (0%) |

### Activity This Week
| Action | Count | Detail |
|--------|-------|--------|
| Scripts generated | {aes_act['scripts_generated']} | Botox, Fillers offers |
| Creative briefs | {aes_act['briefs_generated']} | {aes_act['manual_videos_pending']} manual video + {aes_act['static_ads_pending']} static |
| Campaign planned | 1 | `{aes_act['campaign_name']}` — {aes_act['ad_sets_planned']} ad sets, {aes_act['ads_planned']} ads |
| Videos pending filming | {aes_act['manual_videos_pending']} | CapCut briefs delivered |
| Statics pending design | {aes_act['static_ads_pending']} | Figma briefs delivered |

---

## Competitive Intelligence (Week 16)

From Workflow 01 — Ad Library scrape (2026-04-20):

**Carisma Spa competitors active in Malta:**
- Myoka — Hydrafacial Glow at €99, overlapping price point
- Grands Suites + Malta Marriott — hotel spa packages
- YUE Malta — wedding/bridal angle ("Countdown to I Do")
- Baby Bubbles Spa, Hidden Garden Spa, Cynergi, AquaForce

**Carisma Aesthetics competitors active in Malta:**
- Myoka — most aggressive: Botox, Fillers, Jawline at individual price points
- AestheLab — Academy/expertise credibility angle
- Dr.Sarah Aesthetics — personal brand positioning
- Angelic Esthetic, Brilliant Skin Essentials, Garlex Malta

**Key competitive insight:** Myoka is the primary threat across both brands — running high volume, price-led offers. Carisma's differentiation is consultation-first, natural-results positioning. Scripts this week are built around that contrast.

---

## Cross-Brand Insights

No performance data yet. The following strategic notes apply going into Week 17:

- **Hook selection rationale:** Question hooks ("Are you after results that look like you?") and pain-point opens ("Skin looking dull?") were prioritised — proven patterns from competitor ad library analysis
- **Format mix:** 50% UGC video / 50% static — aligned with best-practice mix; UGC expected to outperform once data is available
- **Offer prioritisation:** Spa Day (€89) and Botox (€180) anchored as primary offers — clearest value proposition and lowest price-point barrier

---

## Meta API Status

| Permission | Status | Impact |
|------------|--------|--------|
| `ads_read` | Missing | Cannot pull performance data |
| `ads_management` | Missing | Cannot create campaigns via API |
| `business_management` | ✓ Present | Business management only |

**Action needed:** In Meta Business Settings → System Users → assign `ads_management` + `ads_read` to both ad accounts (`act_654279452039150`, `act_382359687910745`).

---

## Next Week Plan (Week 17 — w/c 27 April 2026)

### Production (this week — due 25 April)
- [ ] Film and edit 8 UGC videos using CapCut briefs in `.tmp/briefs/manual/`
- [ ] Design 8 static ads using Figma briefs in `.tmp/briefs/automated/`
- [ ] Save all creatives to `.tmp/creatives/` using exact naming in briefs

### Publishing (once creatives ready)
- [ ] Fix Meta token permissions (`ads_management` + `ads_read`)
- [ ] OR build campaigns manually in Ads Manager using `.tmp/publishing/summary_*.md`
- [ ] Upload creatives → create ads → campaigns in PAUSED state
- [ ] Human reviews + activates when satisfied

### Monday AM (27 April)
- [ ] Re-run Workflow 01 (competitor research) — check if competitors launched new angles
- [ ] Run Workflow 09 (performance review) once Week 16 campaigns have 48h+ of data
- [ ] Re-run script generation if new hooks emerge from research

### Budget Recommendation
- Carisma Spa: Launch at €50/day — monitor CPL daily for first 5 days
- Carisma Aesthetics: Launch at €50/day — CPL target €12; pause underperformers at €30 spend with zero leads

### Open Questions
1. **Token permissions** — needs to be resolved before automated publishing can work
2. **Figma access** — needed for static automation; add `FIGMA_ACCESS_TOKEN` to `.env`
3. **UGC talent** — is talent available for filming this week?
4. **Landing pages** — are carismaspa.com/spa-day and carismaaesthetics.com/botox live with Meta pixel firing?

---

*Workflow 11 — Weekly Report | Carisma Group | 2026-04-20*
*Next report due: Friday 24 April 2026 (or Monday 27 April if no data yet)*
"""

md_path = REP / f"weekly_report_{DATE}.md"
md_path.write_text(report_md, encoding="utf-8")
print(f"Report markdown → {md_path.name}")
print("\nNote: Google Sheets write skipped — no GOOGLE_SHEETS credentials in .env yet.")
print("Report saved locally as backup.")
