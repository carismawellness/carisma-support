"""
Generate Script Tool
====================

Generate ad scripts with structured variations for performance marketing.

Purpose:
    Template-based ad script generation that combines brand voice, offer details,
    creative frameworks, hooks, and angles to produce multiple script variations.
    Each variation includes hook text, scene-by-scene breakdown, spoken text,
    text overlays, CTA, timing, and full ad copy (primary text, headline, description).

Inputs:
    --brand         Brand ID (loads voice/tone from config/brands.json)
    --offer         Offer ID (loads details from config/offers.json)
    --format        Creative format: ugc_hook_body_cta, founder_led, testimonial, static_offer
    --hooks         Comma-separated hook texts to use
    --angles        Comma-separated angles/themes (e.g. "urgency,social_proof,emotional")
    --num_variations Number of script variations to generate (default: 3)

Outputs:
    JSON file at .tmp/scripts/script_{brand}_{offer}_{format}_{date}.json

No MCP Integration:
    Pure template-based generation. The agent may use the output to feed into
    an LLM for refinement, but this tool produces the structured skeleton.
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
TMP_DIR = BASE_DIR / ".tmp" / "scripts"
CONFIG_DIR = BASE_DIR / "config"

# Default script frameworks when config/script_frameworks.json doesn't exist
DEFAULT_FRAMEWORKS: dict[str, dict[str, Any]] = {
    "ugc_hook_body_cta": {
        "name": "UGC Hook-Body-CTA",
        "description": "User-generated content style: hook grabs attention, body delivers value, CTA drives action",
        "duration_seconds": 30,
        "scenes": [
            {"scene": 1, "name": "Hook", "duration": "0-5s", "purpose": "Stop the scroll with a bold opening"},
            {"scene": 2, "name": "Problem", "duration": "5-10s", "purpose": "Identify the pain point or desire"},
            {"scene": 3, "name": "Solution", "duration": "10-20s", "purpose": "Present the offer as the answer"},
            {"scene": 4, "name": "Social Proof", "duration": "20-25s", "purpose": "Build trust with proof"},
            {"scene": 5, "name": "CTA", "duration": "25-30s", "purpose": "Clear call to action with urgency"},
        ],
    },
    "founder_led": {
        "name": "Founder-Led",
        "description": "Direct-to-camera founder/expert speaking authentically about the offer",
        "duration_seconds": 45,
        "scenes": [
            {"scene": 1, "name": "Hook", "duration": "0-5s", "purpose": "Personal, attention-grabbing opener"},
            {"scene": 2, "name": "Credibility", "duration": "5-12s", "purpose": "Establish authority and trust"},
            {"scene": 3, "name": "Story/Problem", "duration": "12-25s", "purpose": "Relatable story about the problem"},
            {"scene": 4, "name": "Offer", "duration": "25-35s", "purpose": "Present the solution and what's included"},
            {"scene": 5, "name": "CTA + Urgency", "duration": "35-45s", "purpose": "Direct call to action with time pressure"},
        ],
    },
    "testimonial": {
        "name": "Testimonial",
        "description": "Customer story format: before state, experience, after state",
        "duration_seconds": 30,
        "scenes": [
            {"scene": 1, "name": "Hook (Before)", "duration": "0-5s", "purpose": "Customer's pain point or skepticism"},
            {"scene": 2, "name": "Discovery", "duration": "5-12s", "purpose": "How they found the brand"},
            {"scene": 3, "name": "Experience", "duration": "12-22s", "purpose": "What the experience was like"},
            {"scene": 4, "name": "Result", "duration": "22-27s", "purpose": "The transformation or outcome"},
            {"scene": 5, "name": "CTA", "duration": "27-30s", "purpose": "Encourage viewer to try it"},
        ],
    },
    "static_offer": {
        "name": "Static Offer",
        "description": "Single-image ad with strong visual and clear offer messaging",
        "duration_seconds": 0,
        "scenes": [
            {"scene": 1, "name": "Visual", "duration": "N/A", "purpose": "Hero image or graphic"},
            {"scene": 2, "name": "Headline Overlay", "duration": "N/A", "purpose": "Bold headline text on image"},
            {"scene": 3, "name": "Offer Details", "duration": "N/A", "purpose": "Price, inclusions, value prop"},
            {"scene": 4, "name": "CTA Button", "duration": "N/A", "purpose": "Action button text"},
        ],
    },
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("generate_script")


# ---------------------------------------------------------------------------
# Config loading
# ---------------------------------------------------------------------------

def load_brands_config() -> dict[str, Any]:
    """Load brands config indexed by brand_id."""
    config_path = CONFIG_DIR / "brands.json"
    with open(config_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {b["brand_id"]: b for b in data.get("brands", [])}


def load_offers_config() -> dict[str, Any]:
    """Load offers config indexed by offer_id."""
    config_path = CONFIG_DIR / "offers.json"
    with open(config_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {o["offer_id"]: o for o in data.get("offers", [])}


def load_script_frameworks() -> dict[str, Any]:
    """Load script frameworks config, falling back to defaults."""
    config_path = CONFIG_DIR / "script_frameworks.json"
    if config_path.exists():
        with open(config_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data.get("frameworks", DEFAULT_FRAMEWORKS)
    logger.info("No script_frameworks.json found. Using built-in defaults.")
    return DEFAULT_FRAMEWORKS


# ---------------------------------------------------------------------------
# Script generation
# ---------------------------------------------------------------------------

def generate_scene_breakdown(
    framework: dict[str, Any],
    hook_text: str,
    offer: dict[str, Any],
    brand_voice: dict[str, Any],
    angle: str,
) -> list[dict[str, Any]]:
    """
    Generate a scene-by-scene breakdown for a single script variation.

    Each scene includes: spoken_text placeholder, text_overlay, visual_direction.
    """
    scenes = framework.get("scenes", [])
    offer_name = offer.get("offer_name", "")
    offer_price = offer.get("price", {}).get("display", "")
    offer_includes = offer.get("includes", "")
    offer_cta = offer.get("cta", "Learn More")
    tone = brand_voice.get("tone", "professional")

    scene_breakdowns: list[dict[str, Any]] = []

    for scene in scenes:
        scene_name = scene.get("name", "")
        purpose = scene.get("purpose", "")
        duration = scene.get("duration", "")

        breakdown: dict[str, Any] = {
            "scene_number": scene.get("scene", 0),
            "scene_name": scene_name,
            "duration": duration,
            "purpose": purpose,
            "spoken_text": "",
            "text_overlay": "",
            "visual_direction": "",
        }

        # Fill in scene-specific content based on scene name
        scene_lower = scene_name.lower()

        if "hook" in scene_lower:
            breakdown["spoken_text"] = hook_text
            breakdown["text_overlay"] = hook_text
            breakdown["visual_direction"] = (
                f"Close-up, attention-grabbing opening. Tone: {tone}. "
                f"Angle: {angle}."
            )

        elif "problem" in scene_lower or "before" in scene_lower:
            breakdown["spoken_text"] = f"[Describe the problem that {offer_name} solves]"
            breakdown["text_overlay"] = ""
            breakdown["visual_direction"] = (
                "Show relatable frustration or desire. Authentic, unpolished feel."
            )

        elif "solution" in scene_lower or "offer" in scene_lower or "experience" in scene_lower:
            breakdown["spoken_text"] = (
                f"[Present {offer_name} as the solution. "
                f"Mention: {offer_includes[:100]}...]"
            )
            breakdown["text_overlay"] = f"{offer_name} — {offer_price}" if offer_price else offer_name
            breakdown["visual_direction"] = (
                f"Showcase the offer visually. Warm, inviting imagery. "
                f"Include price overlay: {offer_price}."
            )

        elif "social proof" in scene_lower or "credibility" in scene_lower or "result" in scene_lower:
            breakdown["spoken_text"] = "[Social proof: reviews, numbers, or testimonial quote]"
            breakdown["text_overlay"] = ""
            breakdown["visual_direction"] = (
                "Trust-building visuals: happy customers, review screenshots, "
                "or results imagery."
            )

        elif "cta" in scene_lower:
            breakdown["spoken_text"] = f"[Direct CTA: {offer_cta}]"
            breakdown["text_overlay"] = offer_cta
            breakdown["visual_direction"] = (
                f"End card with clear CTA. Brand colours and logo. "
                f"Urgency element if applicable."
            )

        elif "discovery" in scene_lower:
            breakdown["spoken_text"] = f"[How the customer found {offer_name}]"
            breakdown["text_overlay"] = ""
            breakdown["visual_direction"] = "Casual, story-telling visual style."

        elif "visual" in scene_lower or "headline" in scene_lower:
            # Static format scenes
            breakdown["spoken_text"] = "N/A (static)"
            breakdown["text_overlay"] = hook_text if "headline" in scene_lower else ""
            breakdown["visual_direction"] = (
                f"Hero visual for {offer_name}. Professional, on-brand imagery."
            )

        elif "details" in scene_lower:
            breakdown["spoken_text"] = "N/A (static)"
            breakdown["text_overlay"] = f"{offer_price} — {offer_includes[:80]}"
            breakdown["visual_direction"] = "Clear offer details overlay."

        elif "button" in scene_lower:
            breakdown["spoken_text"] = "N/A (static)"
            breakdown["text_overlay"] = offer_cta
            breakdown["visual_direction"] = "Prominent CTA button styling."

        else:
            breakdown["spoken_text"] = f"[Content for: {scene_name}]"
            breakdown["visual_direction"] = f"Visual direction for: {scene_name}"

        scene_breakdowns.append(breakdown)

    return scene_breakdowns


def generate_ad_copy(
    hook_text: str,
    offer: dict[str, Any],
    brand_voice: dict[str, Any],
    angle: str,
) -> dict[str, str]:
    """
    Generate the ad copy components (primary text, headline, description).

    Returns a structured dict for the Meta ad creative.
    """
    offer_name = offer.get("offer_name", "")
    offer_price = offer.get("price", {}).get("display", "")
    offer_cta = offer.get("cta", "Learn More")
    offer_includes = offer.get("includes", "")

    # Build primary text (body copy)
    primary_text = (
        f"{hook_text}\n\n"
        f"[Body copy about {offer_name}. Include: {offer_includes[:120]}...]\n\n"
        f"[Angle: {angle}. Tone: {brand_voice.get('tone', 'professional')}]\n\n"
    )
    if offer_price:
        primary_text += f"{offer_price}\n\n"
    primary_text += f"{offer_cta} >>>"

    # Headline (short, punchy)
    headline = f"{offer_name} — {offer_price}" if offer_price else offer_name

    # Description (link description under headline)
    description = offer_includes[:100] if offer_includes else f"Discover {offer_name}"

    return {
        "primary_text": primary_text,
        "headline": headline,
        "description": description,
    }


def generate_single_variation(
    variation_index: int,
    hook_text: str,
    angle: str,
    framework: dict[str, Any],
    offer: dict[str, Any],
    brand: dict[str, Any],
    creative_format: str,
) -> dict[str, Any]:
    """Generate a single script variation."""
    brand_voice = brand.get("brand_voice", {})
    brand_name = brand.get("brand_name", "")

    scenes = generate_scene_breakdown(framework, hook_text, offer, brand_voice, angle)
    ad_copy = generate_ad_copy(hook_text, offer, brand_voice, angle)

    duration = framework.get("duration_seconds", 30)

    variation = {
        "variation_index": variation_index,
        "variation_name": f"V{variation_index}_{creative_format}_{angle}",
        "hook_text": hook_text,
        "angle": angle,
        "format": creative_format,
        "framework_name": framework.get("name", creative_format),
        "duration_seconds": duration,
        "scenes": scenes,
        "ad_copy": ad_copy,
        "cta_text": offer.get("cta", "Learn More"),
        "brand_name": brand_name,
        "offer_name": offer.get("offer_name", ""),
        "notes": (
            f"Brand voice: {brand_voice.get('tone', 'N/A')}. "
            f"Angle: {angle}. "
            f"Compliance: {offer.get('meta_compliance_notes', 'N/A')}"
        ),
    }

    return variation


def generate_scripts(
    brand_id: str,
    offer_id: str,
    creative_format: str,
    hooks: list[str],
    angles: list[str],
    num_variations: int = 3,
) -> dict[str, Any]:
    """
    Generate multiple script variations.

    Combines hooks and angles to create up to num_variations scripts.

    Returns the complete output payload.
    """
    # Load configs
    brands = load_brands_config()
    offers = load_offers_config()
    frameworks = load_script_frameworks()

    if brand_id not in brands:
        raise ValueError(f"Brand '{brand_id}' not found. Available: {list(brands.keys())}")
    if offer_id not in offers:
        raise ValueError(f"Offer '{offer_id}' not found. Available: {list(offers.keys())}")

    brand = brands[brand_id]
    offer = offers[offer_id]

    # Get framework (fall back to ugc_hook_body_cta)
    framework = frameworks.get(creative_format, frameworks.get("ugc_hook_body_cta", {}))
    if not framework:
        raise ValueError(
            f"Framework '{creative_format}' not found. "
            f"Available: {list(frameworks.keys())}"
        )

    # Generate variations by cycling through hooks and angles
    variations: list[dict[str, Any]] = []
    variation_idx = 1

    for hook in hooks:
        for angle in angles:
            if variation_idx > num_variations:
                break
            variation = generate_single_variation(
                variation_index=variation_idx,
                hook_text=hook.strip(),
                angle=angle.strip(),
                framework=framework,
                offer=offer,
                brand=brand,
                creative_format=creative_format,
            )
            variations.append(variation)
            variation_idx += 1
        if variation_idx > num_variations:
            break

    # If we haven't reached num_variations, cycle again
    hook_idx = 0
    angle_idx = 0
    while len(variations) < num_variations and hooks and angles:
        hook = hooks[hook_idx % len(hooks)].strip()
        angle = angles[angle_idx % len(angles)].strip()
        variation = generate_single_variation(
            variation_index=len(variations) + 1,
            hook_text=hook,
            angle=angle,
            framework=framework,
            offer=offer,
            brand=brand,
            creative_format=creative_format,
        )
        variations.append(variation)
        hook_idx += 1
        angle_idx += 1

    output = {
        "metadata": {
            "tool": "generate_script",
            "brand": brand_id,
            "offer": offer_id,
            "format": creative_format,
            "framework": framework.get("name", creative_format),
            "num_variations": len(variations),
            "hooks_provided": hooks,
            "angles_provided": angles,
            "generated_at": datetime.utcnow().isoformat() + "Z",
        },
        "variations": variations,
    }

    return output


def save_output(data: dict[str, Any], brand_id: str, offer_id: str, creative_format: str) -> Path:
    """Write output JSON to .tmp/scripts/."""
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d")
    filename = f"script_{brand_id}_{offer_id}_{creative_format}_{date_str}.json"
    output_path = TMP_DIR / filename

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    logger.info("Scripts saved to %s", output_path)
    return output_path


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate ad script variations.",
    )
    parser.add_argument("--brand", type=str, required=True, help="Brand ID")
    parser.add_argument("--offer", type=str, required=True, help="Offer ID")
    parser.add_argument(
        "--format",
        type=str,
        required=True,
        help="Creative format: ugc_hook_body_cta, founder_led, testimonial, static_offer",
    )
    parser.add_argument(
        "--hooks",
        type=str,
        required=True,
        help="Comma-separated hook texts",
    )
    parser.add_argument(
        "--angles",
        type=str,
        required=True,
        help="Comma-separated angles (urgency, social_proof, emotional, curiosity, etc.)",
    )
    parser.add_argument(
        "--num_variations",
        type=int,
        default=3,
        help="Number of variations to generate (default: 3)",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> None:
    args = parse_args(argv)

    hooks = [h.strip() for h in args.hooks.split(",") if h.strip()]
    angles = [a.strip() for a in args.angles.split(",") if a.strip()]

    if not hooks:
        logger.error("At least one hook is required.")
        sys.exit(1)
    if not angles:
        logger.error("At least one angle is required.")
        sys.exit(1)

    try:
        output = generate_scripts(
            brand_id=args.brand,
            offer_id=args.offer,
            creative_format=args.format,
            hooks=hooks,
            angles=angles,
            num_variations=args.num_variations,
        )

        output_path = save_output(output, args.brand, args.offer, args.format)
        print(json.dumps(output, indent=2))
        logger.info("Generated %d variations. Output: %s", len(output["variations"]), output_path)

    except ValueError as exc:
        logger.error("Validation error: %s", exc)
        sys.exit(1)
    except Exception as exc:
        logger.exception("Unexpected error: %s", exc)
        sys.exit(2)


if __name__ == "__main__":
    main()
