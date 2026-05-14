"""Generate Gate 1 research report from scraped Ad Library data."""
import json, sys
from pathlib import Path
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8')

base = Path(__file__).resolve().parent.parent / ".tmp" / "research"
files = list(base.glob("ad_library_*.json"))

brands = {
    "carisma_spa": {"advertisers": set(), "hooks": []},
    "carisma_aesthetics": {"advertisers": set(), "hooks": []},
}

noise = {
    "Meta Ad Library", "System status", "Learn More", "FB.COM", "FB.ME",
    "INSTAGRAM.COM", "MYOKA.COM", "GRANDSSUITES.COM", "AESTHELABCLINIC.COM",
    "Carisma Aesthetics", "Carisma Spa & Wellness", "Book Now", "Book now",
    "Send message", "Visit Instagram profile",
}

for f in files:
    data = json.loads(f.read_text(encoding="utf-8"))
    brand = data["metadata"]["brand"]
    b = brands[brand]
    for link in data.get("page_links", []):
        name = link["page_name"].strip()
        if (name and name not in noise and len(name) < 60
                and not name.startswith("http") and not name.startswith("~")):
            b["advertisers"].add(name)
    for ad in data.get("ads", []):
        lines = [l.strip() for l in ad.get("raw_text", "").split("\n") if l.strip()]
        for line in lines[:3]:
            clean = line.encode("ascii", "ignore").decode().strip()
            if (15 < len(clean) < 100 and clean not in noise
                    and not clean.startswith("~") and not clean.endswith(".COM")):
                b["hooks"].append(clean)

for brand in brands:
    brands[brand]["hooks"] = list(dict.fromkeys(brands[brand]["hooks"]))[:20]
    brands[brand]["advertisers"] = sorted(
        [a for a in brands[brand]["advertisers"] if len(a) > 3]
    )[:15]

date_str = "2026-04-20"

spa_adv = "\n".join("- " + a for a in brands["carisma_spa"]["advertisers"])
spa_hooks = "\n".join("- " + h for h in brands["carisma_spa"]["hooks"])
aes_adv = "\n".join("- " + a for a in brands["carisma_aesthetics"]["advertisers"])
aes_hooks = "\n".join("- " + h for h in brands["carisma_aesthetics"]["hooks"])

lines = [
    "# Competitor Research Report -- " + date_str,
    "## Workflow 01 Output | Gate 1 Ready for Review",
    "",
    "---",
    "",
    "## CARISMA SPA -- Competitive Landscape",
    "",
    "### Active Competitors in Malta (Ad Library)",
    spa_adv,
    "",
    "### Competitor Hooks & Ad Copy Observed",
    spa_hooks,
    "",
    "### Key Observations",
    "- Myoka running Hydrafacial Glow at EUR 99 -- price point crossing spa/aesthetics",
    "- Grands Suites & Malta Marriott active with hotel spa packages",
    "- Wedding/bridal angle in use (Countdown to I Do, Your Wedding Glow)",
    "- Price anchoring common: packages from EUR 50-99 per person",
    "- Sensory/experiential hooks: 'You know this view', 'Make Time for You'",
    "",
    "---",
    "",
    "## CARISMA AESTHETICS -- Competitive Landscape",
    "",
    "### Active Competitors in Malta (Ad Library)",
    aes_adv,
    "",
    "### Competitor Hooks & Ad Copy Observed",
    aes_hooks,
    "",
    "### Key Observations",
    "- Myoka most aggressive: individual treatment ads at price points",
    "  (Lip Fillers, Jawline Botox, Cheek Fillers, Forehead Botox, Jawline Slimming)",
    "- Price-led offers: 'Ultimate Facelift Package EUR 239', 'Snatch Jawline Package EUR 149'",
    "- Desire hooks working: 'Craving a snatched look?'",
    "- Transformation hooks: 'Full Face Volumetry. Sculpt. Lift. Define.'",
    "- AestheLab using Academy/expertise angle for credibility",
    "- Dr.Sarah Aesthetics using personal brand positioning",
    "",
    "---",
    "",
    "## GATE 1 CHECKLIST",
    "- [x] Competitor ads scraped via Ad Library (5 search terms)",
    "- [x] Active advertisers identified per brand",
    "- [x] Hooks and copy patterns extracted",
    "- [ ] Own ad performance data (requires ads_read token -- skipped)",
    "- [ ] Spend/impression ranges (requires API access -- skipped)",
    "",
    "*Source: Facebook Ad Library public scrape via Playwright -- " + date_str + "*",
    "*Next: Approve to proceed to Workflow 03 (Hook Mining) then Script Generation*",
]

report = "\n".join(lines)
out = base / "report_competitor_all_brands_20260420.md"
out.write_text(report, encoding="utf-8")
print("Report saved:", out)
print()
print(report)
