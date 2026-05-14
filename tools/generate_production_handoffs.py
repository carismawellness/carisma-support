"""Workflow 06 + 07: Generate production handoff packages and trackers."""
import json, sys
from pathlib import Path
from datetime import datetime, timedelta

sys.stdout.reconfigure(encoding="utf-8")

BASE       = Path(__file__).resolve().parent.parent
DATE       = "20260420"
DUE_DATE   = "2026-04-25"   # 5 days from today
BRIEFS     = BASE / ".tmp" / "briefs"
CREATIVES  = BASE / ".tmp" / "creatives"
CREATIVES.mkdir(parents=True, exist_ok=True)

BRANDS = ["carisma_spa", "carisma_aesthetics"]
BRAND_NAMES = {"carisma_spa": "Carisma Spa", "carisma_aesthetics": "Carisma Aesthetics"}


def load_index(brand_id: str) -> dict:
    path = BRIEFS / f"index_{brand_id}_{DATE}.json"
    return json.loads(path.read_text(encoding="utf-8"))


def shot_summary(brief_path: Path) -> str:
    """Extract the shot list section from a brief markdown file."""
    text = brief_path.read_text(encoding="utf-8")
    lines = text.split("\n")
    in_shot = False
    rows = []
    for line in lines:
        if "### Shot List" in line:
            in_shot = True
            continue
        if in_shot and line.startswith("###"):
            break
        if in_shot and line.startswith("|") and "---" not in line and "Section" not in line and "#" not in line:
            rows.append(line.strip())
    return "\n".join(rows[:6]) if rows else "See full brief."


def text_layers_summary(brief_path: Path) -> str:
    """Extract text layers from a static brief."""
    text = brief_path.read_text(encoding="utf-8")
    lines = text.split("\n")
    in_layers = False
    rows = []
    for line in lines:
        if "### Text Layers" in line:
            in_layers = True
            continue
        if in_layers and line.startswith("###"):
            break
        if in_layers and line.startswith("|") and "---" not in line and "Layer" not in line:
            rows.append(line.strip())
    return "\n".join(rows) if rows else "See full brief."


def visual_direction(brief_path: Path) -> str:
    text = brief_path.read_text(encoding="utf-8")
    for line in text.split("\n"):
        if line.startswith("**Visual Direction:**"):
            return line.replace("**Visual Direction:**", "").strip()
    return "See brief."


# ── Workflow 06: Video Handoff ───────────────────────────────────────────────

for brand_id in BRANDS:
    brand_name = BRAND_NAMES[brand_id]
    idx = load_index(brand_id)
    manual_briefs = [b for b in idx["briefs"] if b["production_type"] == "manual_video"]

    if not manual_briefs:
        print(f"[W06] {brand_name}: No manual video briefs found.")
        continue

    # Build handoff markdown
    lines = [
        f"# Manual Video Production Queue — {brand_name}",
        f"## Workflow 06 | Date: 2026-04-20 | Due: {DUE_DATE}",
        f"## Videos to Produce: {len(manual_briefs)}",
        "",
        "---",
        "",
        "### What you need",
        "- Talent: Female presenter, 28–45, relatable and natural on camera",
        "- Filming: Natural light preferred (ring light acceptable)",
        "- Editing: CapCut (all shot list details in individual brief files)",
        "- B-roll: Existing spa/clinic footage or shoot alongside talent",
        "",
        "### Delivery format",
        "- Primary: 1080 × 1920 MP4 (9:16 — Stories / Reels)",
        "- Also export: 1080 × 1080 MP4 (1:1 — Feed)",
        "- Frame rate: 30fps | H.264 | Max 100MB",
        "- Save to: `.tmp/creatives/{ad_name}_9x16.mp4` and `{ad_name}_1x1.mp4`",
        "",
        "---",
        "",
    ]

    tracker_videos = []

    for i, brief in enumerate(manual_briefs, 1):
        ad   = brief["ad_name"]
        bfile = BASE / brief["file"]
        shots = shot_summary(bfile)

        lines += [
            f"### Video {i}: {ad}",
            f"**Hook:** {brief['hook']}",
            f"**Offer:** {brief['offer']}",
            f"**Brief file:** [{brief['file']}]({brief['file']})",
            f"**Duration:** ~28s | **Format:** UGC Hook-Body-CTA",
            "",
            "**Shot Summary:**",
            shots,
            "",
            "**Output files expected:**",
            f"- `.tmp/creatives/{ad}_9x16.mp4`",
            f"- `.tmp/creatives/{ad}_1x1.mp4`",
            "",
            "---",
            "",
        ]

        tracker_videos.append({
            "ad_name": ad,
            "script_id": brief["script_id"],
            "offer": brief["offer"],
            "hook": brief["hook"],
            "production_type": "manual_video",
            "platform": "CapCut",
            "status": "pending_human",
            "brief_file": brief["file"],
            "assigned_date": "2026-04-20",
            "due_date": DUE_DATE,
            "output_expected": [
                f".tmp/creatives/{ad}_9x16.mp4",
                f".tmp/creatives/{ad}_1x1.mp4",
            ],
        })

    # Write handoff
    handoff_path = BRIEFS / f"manual_handoff_{brand_id}_{DATE}.md"
    handoff_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"[W06] Handoff → {handoff_path.name}")

    # Write tracker
    tracker = {
        "brand_id": brand_id,
        "brand_name": brand_name,
        "production_date": "2026-04-20",
        "total_videos": len(manual_briefs),
        "automated_complete": 0,
        "manual_complete": 0,
        "manual_pending": len(manual_briefs),
        "videos": tracker_videos,
    }
    t_path = CREATIVES / f"video_tracker_{brand_id}_{DATE}.json"
    t_path.write_text(json.dumps(tracker, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[W06] Tracker → {t_path.name}")


# ── Workflow 07: Static Handoff ──────────────────────────────────────────────

for brand_id in BRANDS:
    brand_name = BRAND_NAMES[brand_id]
    idx = load_index(brand_id)
    static_briefs = [b for b in idx["briefs"] if b["production_type"] == "automated_static"]

    if not static_briefs:
        print(f"[W07] {brand_name}: No static briefs found.")
        continue

    lines = [
        f"# Static Design Queue — {brand_name}",
        f"## Workflow 07 | Date: 2026-04-20 | Due: {DUE_DATE}",
        f"## Designs to Produce: {len(static_briefs)}",
        "",
        "> **Note:** Figma MCP token not yet configured.",
        "> All static briefs are classified as `needs_image_swap` — human design required.",
        "> Once Figma access token is added, text-only briefs can be automated.",
        "",
        "---",
        "",
        "### What you need",
        "- Figma access (all briefs use brand templates)",
        "- Hero images per brief (sources: brand photo library, Unsplash, Pexels)",
        "- Brand assets: logo PNG (transparent), brand colour hex codes",
        "",
        "### Delivery format",
        "- Feed: 1080 × 1080 PNG",
        "- Story: 1080 × 1920 PNG",
        "- Export at 2× then downscale for sharpness",
        "- Save to: `.tmp/creatives/{ad_name}_1x1.png` and `{ad_name}_9x16.png`",
        "",
        "---",
        "",
    ]

    tracker_statics = []

    for i, brief in enumerate(static_briefs, 1):
        ad    = brief["ad_name"]
        bfile = BASE / brief["file"]
        layers = text_layers_summary(bfile)
        vis    = visual_direction(bfile)

        lines += [
            f"### Design {i}: {ad}",
            f"**Hook:** {brief['hook']}",
            f"**Offer:** {brief['offer']}",
            f"**Brief file:** [{brief['file']}]({brief['file']})",
            f"**Change type:** Image swap + text update",
            "",
            "**Text Layers:**",
            layers,
            "",
            f"**Image Direction:** {vis}",
            "",
            "**Image sourcing:**",
            "- Check brand photo library first",
            "- Unsplash/Pexels acceptable (free commercial licence)",
            "- Warm tones, professional, no faces unless owned brand photography",
            "",
            "**Output files expected:**",
            f"- `.tmp/creatives/{ad}_1x1.png`",
            f"- `.tmp/creatives/{ad}_9x16.png`",
            "",
            "---",
            "",
        ]

        tracker_statics.append({
            "ad_name": ad,
            "script_id": brief["script_id"],
            "offer": brief["offer"],
            "hook": brief["hook"],
            "production_type": "manual_image_swap",
            "platform": "Figma",
            "automation_possible": False,
            "automation_blocker": "Figma access token not configured + image swap required",
            "status": "pending_human",
            "brief_file": brief["file"],
            "assigned_date": "2026-04-20",
            "due_date": DUE_DATE,
            "output_expected": [
                f".tmp/creatives/{ad}_1x1.png",
                f".tmp/creatives/{ad}_9x16.png",
            ],
        })

    # Write handoff
    handoff_path = BRIEFS / f"manual_static_handoff_{brand_id}_{DATE}.md"
    handoff_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"[W07] Handoff → {handoff_path.name}")

    # Write tracker
    tracker = {
        "brand_id": brand_id,
        "brand_name": brand_name,
        "production_date": "2026-04-20",
        "total_statics": len(static_briefs),
        "automated_complete": 0,
        "manual_complete": 0,
        "manual_pending": len(static_briefs),
        "automation_note": "Figma MCP unavailable — all statics require human design. Add FIGMA_ACCESS_TOKEN to .env to enable text-only automation.",
        "statics": tracker_statics,
    }
    t_path = CREATIVES / f"static_tracker_{brand_id}_{DATE}.json"
    t_path.write_text(json.dumps(tracker, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[W07] Tracker → {t_path.name}")

print("\nDone — Workflow 06 + 07 handoffs complete.")
