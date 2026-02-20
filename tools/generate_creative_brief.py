"""
Generate Creative Brief Tool
=============================

Create production-ready briefs from script JSON for video or static creatives.

Purpose:
    Transform a script JSON (from generate_script.py) into a production brief
    that can be handed to a designer or fed into automated rendering tools.
    For video: shot list, timing, overlays, music notes, Creatomate template mapping.
    For static: Figma layer mapping, text per layer, image requirements.
    Classifies each brief as automated (Creatomate) or manual (CapCut).

Inputs:
    --script_file       Path to script JSON (from generate_script.py)
    --format            Output format: video or static
    --template_id       Creatomate or Figma template ID (optional)
    --variation_index   Which variation to brief (default: all)

Outputs:
    Markdown brief at .tmp/briefs/brief_{ad_name}_{date}.md

No MCP Integration:
    Pure document generation. Output is consumed by render_video.py or a human.
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
TMP_DIR = BASE_DIR / ".tmp" / "briefs"
CONFIG_DIR = BASE_DIR / "config"

# Automation classification heuristics
AUTOMATED_FORMATS = {"static_offer", "ugc_hook_body_cta"}
MANUAL_FORMATS = {"founder_led", "testimonial", "before_after"}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("generate_creative_brief")


# ---------------------------------------------------------------------------
# Brief generation — Video
# ---------------------------------------------------------------------------

def generate_video_brief(
    variation: dict[str, Any],
    template_id: Optional[str] = None,
) -> str:
    """
    Generate a Markdown production brief for a video creative.

    Includes shot list, timing, overlay specs, music direction,
    and Creatomate template mapping if applicable.
    """
    lines: list[str] = []
    v_name = variation.get("variation_name", "untitled")
    brand = variation.get("brand_name", "")
    offer = variation.get("offer_name", "")
    hook = variation.get("hook_text", "")
    angle = variation.get("angle", "")
    duration = variation.get("duration_seconds", 30)
    scenes = variation.get("scenes", [])
    ad_copy = variation.get("ad_copy", {})
    cta = variation.get("cta_text", "")
    creative_format = variation.get("format", "")

    # Classify production method
    production_method = classify_production_method(creative_format)

    lines.append(f"# Creative Brief: {v_name}")
    lines.append("")
    lines.append(f"**Brand:** {brand}")
    lines.append(f"**Offer:** {offer}")
    lines.append(f"**Format:** Video ({creative_format})")
    lines.append(f"**Duration:** {duration}s")
    lines.append(f"**Angle:** {angle}")
    lines.append(f"**Production Method:** {production_method}")
    if template_id:
        lines.append(f"**Template ID:** {template_id}")
    lines.append(f"**Generated:** {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}")
    lines.append("")

    # Hook
    lines.append("## Hook")
    lines.append(f"> {hook}")
    lines.append("")

    # Shot List / Scene Breakdown
    lines.append("## Shot List")
    lines.append("")
    lines.append("| # | Scene | Duration | Spoken Text | Text Overlay | Visual Direction |")
    lines.append("|---|-------|----------|-------------|--------------|------------------|")

    for scene in scenes:
        s_num = scene.get("scene_number", "")
        s_name = scene.get("scene_name", "")
        s_dur = scene.get("duration", "")
        s_spoken = scene.get("spoken_text", "").replace("|", "/").replace("\n", " ")
        s_overlay = scene.get("text_overlay", "").replace("|", "/").replace("\n", " ")
        s_visual = scene.get("visual_direction", "").replace("|", "/").replace("\n", " ")

        lines.append(
            f"| {s_num} | {s_name} | {s_dur} | {s_spoken[:60]} | {s_overlay[:40]} | {s_visual[:60]} |"
        )

    lines.append("")

    # Creatomate Template Mapping (if automated)
    if production_method == "Automated (Creatomate)" and template_id:
        lines.append("## Creatomate Template Mapping")
        lines.append("")
        lines.append(f"**Template ID:** `{template_id}`")
        lines.append("")
        lines.append("| Modification Key | Value |")
        lines.append("|-----------------|-------|")

        for scene in scenes:
            overlay = scene.get("text_overlay", "")
            if overlay:
                key = f"text_scene_{scene.get('scene_number', 0)}"
                lines.append(f"| `{key}` | {overlay} |")

        lines.append(f"| `cta_text` | {cta} |")
        lines.append(f"| `brand_name` | {brand} |")
        lines.append("")

    # Music & Audio Direction
    lines.append("## Audio Direction")
    lines.append("")
    lines.append(f"- **Mood:** Match the {variation.get('notes', 'brand tone')}")
    lines.append("- **Music:** Upbeat, warm instrumental (royalty-free)")
    lines.append("- **Voiceover:** Natural, conversational tone")
    lines.append(f"- **CTA emphasis:** Strong delivery on \"{cta}\"")
    lines.append("")

    # Ad Copy
    lines.append("## Ad Copy (Meta)")
    lines.append("")
    lines.append("### Primary Text")
    lines.append("```")
    lines.append(ad_copy.get("primary_text", "[To be written]"))
    lines.append("```")
    lines.append("")
    lines.append(f"### Headline\n`{ad_copy.get('headline', '[To be written]')}`")
    lines.append("")
    lines.append(f"### Description\n`{ad_copy.get('description', '[To be written]')}`")
    lines.append("")

    # Compliance Notes
    notes = variation.get("notes", "")
    if notes:
        lines.append("## Compliance Notes")
        lines.append(notes)
        lines.append("")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Brief generation — Static
# ---------------------------------------------------------------------------

def generate_static_brief(
    variation: dict[str, Any],
    template_id: Optional[str] = None,
) -> str:
    """
    Generate a Markdown production brief for a static (image) creative.

    Includes Figma layer mapping, text specifications, and image requirements.
    """
    lines: list[str] = []
    v_name = variation.get("variation_name", "untitled")
    brand = variation.get("brand_name", "")
    offer = variation.get("offer_name", "")
    hook = variation.get("hook_text", "")
    angle = variation.get("angle", "")
    scenes = variation.get("scenes", [])
    ad_copy = variation.get("ad_copy", {})
    cta = variation.get("cta_text", "")

    lines.append(f"# Creative Brief: {v_name}")
    lines.append("")
    lines.append(f"**Brand:** {brand}")
    lines.append(f"**Offer:** {offer}")
    lines.append(f"**Format:** Static Image")
    lines.append(f"**Angle:** {angle}")
    lines.append(f"**Production Method:** Automated (Figma/Creatomate)")
    if template_id:
        lines.append(f"**Template ID:** {template_id}")
    lines.append(f"**Generated:** {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}")
    lines.append("")

    # Size specifications
    lines.append("## Size Specifications")
    lines.append("")
    lines.append("| Placement | Size | Aspect Ratio |")
    lines.append("|-----------|------|--------------|")
    lines.append("| Feed | 1080x1080 | 1:1 |")
    lines.append("| Story/Reel | 1080x1920 | 9:16 |")
    lines.append("| Landscape | 1200x628 | 1.91:1 |")
    lines.append("")

    # Layer mapping
    lines.append("## Layer Mapping")
    lines.append("")
    lines.append("| Layer Name | Type | Content |")
    lines.append("|-----------|------|---------|")
    lines.append(f"| `background` | Image | Hero visual for {offer} |")
    lines.append(f"| `headline` | Text | {hook[:60]} |")

    for scene in scenes:
        overlay = scene.get("text_overlay", "")
        if overlay and "headline" not in scene.get("scene_name", "").lower():
            layer_name = scene.get("scene_name", "").lower().replace(" ", "_")
            lines.append(f"| `{layer_name}` | Text | {overlay[:60]} |")

    lines.append(f"| `cta_button` | Text/Shape | {cta} |")
    lines.append(f"| `brand_logo` | Image | {brand} logo |")
    lines.append("")

    # Image Requirements
    lines.append("## Image Requirements")
    lines.append("")
    lines.append("- **Hero image:** High-quality photo relevant to the offer")
    lines.append(f"- **Brand colours:** Use {brand} brand palette")
    lines.append("- **Text readability:** Ensure contrast ratio >= 4.5:1")
    lines.append("- **Text-to-image ratio:** Keep text under 20% of image area (Meta guideline)")
    lines.append("")

    # Ad Copy
    lines.append("## Ad Copy (Meta)")
    lines.append("")
    lines.append("### Primary Text")
    lines.append("```")
    lines.append(ad_copy.get("primary_text", "[To be written]"))
    lines.append("```")
    lines.append("")
    lines.append(f"### Headline\n`{ad_copy.get('headline', '[To be written]')}`")
    lines.append("")
    lines.append(f"### Description\n`{ad_copy.get('description', '[To be written]')}`")
    lines.append("")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Classification
# ---------------------------------------------------------------------------

def classify_production_method(creative_format: str) -> str:
    """
    Classify whether a creative format should be produced automatically
    (Creatomate) or manually (CapCut/editor).
    """
    if creative_format in AUTOMATED_FORMATS:
        return "Automated (Creatomate)"
    elif creative_format in MANUAL_FORMATS:
        return "Manual (CapCut/Editor)"
    return "Review needed"


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------

def generate_briefs(
    script_file: str,
    output_format: str = "video",
    template_id: Optional[str] = None,
    variation_index: Optional[int] = None,
) -> list[dict[str, Any]]:
    """
    Generate production briefs from a script JSON file.

    Returns a list of dicts with brief content and output paths.
    """
    script_path = Path(script_file)
    if not script_path.exists():
        raise FileNotFoundError(f"Script file not found: {script_file}")

    with open(script_path, "r", encoding="utf-8") as f:
        script_data = json.load(f)

    variations = script_data.get("variations", [])
    if not variations:
        raise ValueError("No variations found in script file.")

    # Filter to specific variation if requested
    if variation_index is not None:
        variations = [v for v in variations if v.get("variation_index") == variation_index]
        if not variations:
            raise ValueError(f"Variation index {variation_index} not found in script file.")

    TMP_DIR.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d")

    results: list[dict[str, Any]] = []

    for variation in variations:
        v_name = variation.get("variation_name", "untitled")
        safe_name = v_name.replace(" ", "_").replace("/", "_")[:60]

        if output_format == "video":
            brief_content = generate_video_brief(variation, template_id)
        else:
            brief_content = generate_static_brief(variation, template_id)

        filename = f"brief_{safe_name}_{date_str}.md"
        output_path = TMP_DIR / filename

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(brief_content)

        logger.info("Brief saved: %s", output_path)

        results.append({
            "variation_name": v_name,
            "format": output_format,
            "production_method": classify_production_method(variation.get("format", "")),
            "template_id": template_id,
            "output_path": str(output_path),
            "filename": filename,
        })

    return results


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate production briefs from script JSON.",
    )
    parser.add_argument(
        "--script_file",
        type=str,
        required=True,
        help="Path to script JSON file",
    )
    parser.add_argument(
        "--format",
        type=str,
        default="video",
        choices=["video", "static"],
        help="Output format: video or static (default: video)",
    )
    parser.add_argument(
        "--template_id",
        type=str,
        default=None,
        help="Creatomate or Figma template ID",
    )
    parser.add_argument(
        "--variation_index",
        type=int,
        default=None,
        help="Brief a specific variation (default: all)",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> None:
    args = parse_args(argv)

    try:
        results = generate_briefs(
            script_file=args.script_file,
            output_format=args.format,
            template_id=args.template_id,
            variation_index=args.variation_index,
        )

        print(json.dumps(results, indent=2))
        logger.info("Generated %d briefs.", len(results))

    except (FileNotFoundError, ValueError) as exc:
        logger.error("Error: %s", exc)
        sys.exit(1)
    except Exception as exc:
        logger.exception("Unexpected error: %s", exc)
        sys.exit(2)


if __name__ == "__main__":
    main()
