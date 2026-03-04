#!/usr/bin/env python3
"""
GBP Post Generator — Generates Google Business Profile post content
for Carisma brands using keyword banks, templates, and brand voice rules.

Usage:
    python marketing/google-gmb/tools/gbp_generate_posts.py --brand_id all --num_posts 2
    python marketing/google-gmb/tools/gbp_generate_posts.py --brand_id carisma_spa --post_type offer --num_posts 1

Inputs:
    --brand_id    Brand ID or "all" (required)
    --post_type   "update", "offer", "event", or "auto" (default: auto)
    --num_posts   Posts per brand (default: 2)
    --season      Season override (auto-detects from date)
    --output_dir  Output directory (default: .tmp/gbp/drafts)

Outputs:
    JSON files at {output_dir}/posts_{brand}_{date}.json

No MCP Integration:
    Pure template-based generation. The agent may refine the output, but this
    tool produces deterministic, structured post drafts from templates and
    keyword banks.
"""

import argparse
import hashlib
import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
CONFIG_DIR = BASE_DIR / "config"
GBP_DIR = BASE_DIR / "marketing" / "google-gmb"
DEFAULT_OUTPUT_DIR = BASE_DIR / ".tmp" / "gbp" / "drafts"
POST_LOG_DIR = BASE_DIR / ".tmp" / "gbp" / "logs"

MAX_POST_LENGTH = 1500
MIN_POST_LENGTH = 100

# Brand code mapping (matches config/brands.json)
BRAND_CODES = {
    "carisma_spa": "CS",
    "carisma_aesthetics": "CA",
    "carisma_slimming": "SLIM",
}

# Post types and their rotation weights
POST_TYPES = ["update", "offer", "event"]
POST_TYPE_WEIGHTS = {"update": 0.5, "offer": 0.35, "event": 0.15}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("gbp_generate_posts")


# ---------------------------------------------------------------------------
# Season detection
# ---------------------------------------------------------------------------

SEASON_MAP = {
    1: "winter",
    2: "winter",
    3: "spring",
    4: "spring",
    5: "spring",
    6: "summer",
    7: "summer",
    8: "summer",
    9: "autumn",
    10: "autumn",
    11: "autumn",
    12: "winter",
}

# Special seasonal events (month, day_range_start, day_range_end, name)
SEASONAL_EVENTS = [
    (2, 7, 14, "valentines"),
    (3, 14, 21, "mothers_day"),
    (12, 1, 25, "christmas"),
    (12, 26, 31, "new_year"),
    (1, 1, 7, "new_year"),
]


def detect_season(date: Optional[datetime] = None) -> str:
    """Detect the current season, accounting for special events."""
    if date is None:
        date = datetime.now()

    # Check for special seasonal events first
    for month, day_start, day_end, event_name in SEASONAL_EVENTS:
        if date.month == month and day_start <= date.day <= day_end:
            return event_name

    return SEASON_MAP.get(date.month, "spring")


# ---------------------------------------------------------------------------
# Config loading
# ---------------------------------------------------------------------------

def load_brands_config() -> dict[str, Any]:
    """Load brands config indexed by brand_id."""
    config_path = CONFIG_DIR / "brands.json"
    if not config_path.exists():
        raise FileNotFoundError(f"Brands config not found: {config_path}")
    with open(config_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {b["brand_id"]: b for b in data.get("brands", [])}


def load_offers_config() -> dict[str, Any]:
    """Load offers config indexed by offer_id."""
    config_path = CONFIG_DIR / "offers.json"
    if not config_path.exists():
        logger.warning("Offers config not found: %s", config_path)
        return {}
    with open(config_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {o["offer_id"]: o for o in data.get("offers", [])}


def load_locations_config() -> dict[str, Any]:
    """Load locations config if available."""
    config_path = GBP_DIR / "locations.json"
    if not config_path.exists():
        logger.info("No locations.json found at %s. Using defaults from brands.json.", config_path)
        return {}
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_content_calendar() -> dict[str, Any]:
    """Load content calendar if available."""
    config_path = GBP_DIR / "content-calendar.json"
    if not config_path.exists():
        logger.info("No content-calendar.json found at %s. Using auto scheduling.", config_path)
        return {}
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_keyword_bank(brand_id: str) -> dict[str, list[str]]:
    """
    Load keyword bank for a brand. Supports both JSON and Markdown formats.

    JSON format: { "primary": [...], "secondary": [...], "long_tail": [...] }
    Markdown format: ## Primary\\n- keyword1\\n- keyword2\\n## Secondary\\n...

    Returns dict with keyword categories as keys and lists of keywords as values.
    """
    keywords: dict[str, list[str]] = {
        "primary": [],
        "secondary": [],
        "long_tail": [],
        "local": [],
        "seasonal": [],
    }

    # Try JSON first
    json_path = GBP_DIR / f"keywords_{brand_id}.json"
    if json_path.exists():
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        for category in keywords:
            keywords[category] = data.get(category, [])
        logger.info("Loaded keyword bank (JSON) for %s: %d total keywords",
                     brand_id, sum(len(v) for v in keywords.values()))
        return merge_auto_additions(keywords, brand_id)

    # Try Markdown
    md_path = GBP_DIR / f"keywords_{brand_id}.md"
    if md_path.exists():
        keywords = _parse_keyword_markdown(md_path)
        logger.info("Loaded keyword bank (Markdown) for %s: %d total keywords",
                     brand_id, sum(len(v) for v in keywords.values()))
        return merge_auto_additions(keywords, brand_id)

    # Fallback: generate basic keywords from brand config
    logger.warning("No keyword bank found for %s. Generating fallback from brand config.", brand_id)
    return merge_auto_additions(_generate_fallback_keywords(brand_id), brand_id)


def _parse_keyword_markdown(path: Path) -> dict[str, list[str]]:
    """Parse a keyword bank markdown file into structured lists."""
    keywords: dict[str, list[str]] = {
        "primary": [],
        "secondary": [],
        "long_tail": [],
        "local": [],
        "seasonal": [],
    }

    current_category: Optional[str] = None
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            # Detect category headers (## Primary, ## Secondary, etc.)
            if line.startswith("##"):
                header = line.lstrip("#").strip().lower().replace(" ", "_")
                # Map common header variants
                header_map = {
                    "primary": "primary",
                    "primary_keywords": "primary",
                    "secondary": "secondary",
                    "secondary_keywords": "secondary",
                    "long_tail": "long_tail",
                    "long-tail": "long_tail",
                    "long_tail_keywords": "long_tail",
                    "local": "local",
                    "local_keywords": "local",
                    "seasonal": "seasonal",
                    "seasonal_keywords": "seasonal",
                }
                current_category = header_map.get(header)
                if current_category is None:
                    logger.warning("Unknown keyword category '%s' in %s", header, path)
                continue

            # Parse list items
            if current_category and (line.startswith("- ") or line.startswith("* ")):
                keyword = line[2:].strip()
                if keyword:
                    keywords[current_category].append(keyword)

    return keywords


def _generate_fallback_keywords(brand_id: str) -> dict[str, list[str]]:
    """Generate basic keywords from brand config when no keyword bank exists."""
    brands = load_brands_config()
    brand = brands.get(brand_id, {})
    brand_name = brand.get("brand_name", "Carisma")
    interests = brand.get("target_audience", {}).get("interests", [])

    keywords: dict[str, list[str]] = {
        "primary": [i.lower() for i in interests[:4]],
        "secondary": [i.lower() for i in interests[4:]],
        "long_tail": [f"{brand_name.lower()} {i.lower()} malta" for i in interests[:3]],
        "local": ["malta", "gozo", "valletta", "sliema", "st julians"],
        "seasonal": [],
    }
    return keywords


def merge_auto_additions(
    keywords: dict[str, list[str]],
    brand_id: str,
) -> dict[str, list[str]]:
    """
    Merge auto-addition keywords from GSC Quick-Win Hunter into the keyword bank.

    Checks for config/gbp/keywords_{brand_id}_auto_additions.json. If the file
    exists, reads it and merges keywords into the appropriate categories
    (primary, secondary, local, etc.). Deduplicates case-insensitively.

    Args:
        keywords: Existing keyword bank dict with category keys and list values.
        brand_id: Brand identifier used to locate the auto-additions file.

    Returns:
        The keyword bank dict with auto-additions merged in.
    """
    auto_path = GBP_DIR / f"keywords_{brand_id}_auto_additions.json"
    if not auto_path.exists():
        return keywords

    try:
        with open(auto_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, IOError) as exc:
        logger.warning("Could not read auto-additions for %s: %s", brand_id, exc)
        return keywords

    additions = data.get("keywords", [])
    if not additions:
        return keywords

    merged_count = 0
    for entry in additions:
        kw = entry.get("keyword", "").strip()
        category = entry.get("category", "secondary")

        if not kw:
            continue

        # Ensure the target category exists
        if category not in keywords:
            keywords[category] = []

        # Deduplicate (case-insensitive)
        existing_lower = {k.lower() for k in keywords[category]}
        if kw.lower() not in existing_lower:
            keywords[category].append(kw)
            merged_count += 1

    if merged_count > 0:
        logger.info(
            "Merged %d auto-addition keywords into %s keyword bank from %s",
            merged_count,
            brand_id,
            auto_path,
        )

    return keywords


def load_post_log(brand_id: str) -> list[dict[str, Any]]:
    """Load the recent post log for a brand to avoid keyword/template repetition."""
    log_path = POST_LOG_DIR / f"post_log_{brand_id}.json"
    if not log_path.exists():
        return []
    try:
        with open(log_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        logger.warning("Could not read post log at %s. Starting fresh.", log_path)
        return []


def save_post_log(brand_id: str, log_entries: list[dict[str, Any]]) -> None:
    """Save post log entries. Keeps the last 50 entries."""
    POST_LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_path = POST_LOG_DIR / f"post_log_{brand_id}.json"

    existing = load_post_log(brand_id)
    combined = existing + log_entries
    # Keep only last 50 entries
    combined = combined[-50:]

    with open(log_path, "w", encoding="utf-8") as f:
        json.dump(combined, f, indent=2, ensure_ascii=False)


# ---------------------------------------------------------------------------
# Template system
# ---------------------------------------------------------------------------

# Default GBP post templates per post type
DEFAULT_TEMPLATES: dict[str, list[dict[str, Any]]] = {
    "update": [
        {
            "id": "update_service_highlight",
            "name": "Service Highlight",
            "template": (
                "{hook}\n\n"
                "At {brand_name}, we offer {service_description}. "
                "{benefit_statement}\n\n"
                "{seasonal_line}\n\n"
                "{cta_text}\n\n"
                "#{keyword_1} #{keyword_2} #{keyword_3} #Malta"
            ),
            "required_vars": ["hook", "brand_name", "service_description",
                              "benefit_statement", "cta_text"],
        },
        {
            "id": "update_expertise",
            "name": "Expertise & Trust",
            "template": (
                "{hook}\n\n"
                "Our team at {brand_name} is dedicated to providing {expertise_area}. "
                "With years of experience in {industry_phrase}, we ensure {promise}.\n\n"
                "{seasonal_line}\n\n"
                "{cta_text}\n\n"
                "#{keyword_1} #{keyword_2} #{keyword_3} #Malta"
            ),
            "required_vars": ["hook", "brand_name", "expertise_area",
                              "industry_phrase", "promise", "cta_text"],
        },
        {
            "id": "update_why_choose",
            "name": "Why Choose Us",
            "template": (
                "{hook}\n\n"
                "Why do women across Malta choose {brand_name}?\n\n"
                "- {reason_1}\n"
                "- {reason_2}\n"
                "- {reason_3}\n\n"
                "{seasonal_line}\n\n"
                "{cta_text}\n\n"
                "#{keyword_1} #{keyword_2} #{keyword_3} #Malta"
            ),
            "required_vars": ["hook", "brand_name", "reason_1", "reason_2",
                              "reason_3", "cta_text"],
        },
        {
            "id": "update_local_connection",
            "name": "Local Connection",
            "template": (
                "{hook}\n\n"
                "Proudly serving {local_area}, {brand_name} brings you {value_prop}. "
                "{local_detail}\n\n"
                "{seasonal_line}\n\n"
                "{cta_text}\n\n"
                "#{keyword_1} #{keyword_2} #{local_keyword} #Malta"
            ),
            "required_vars": ["hook", "local_area", "brand_name", "value_prop",
                              "local_detail", "cta_text"],
        },
    ],
    "offer": [
        {
            "id": "offer_standard",
            "name": "Standard Offer",
            "template": (
                "{hook}\n\n"
                "{offer_name} — {offer_price}\n\n"
                "{offer_description}\n\n"
                "{urgency_hook}\n\n"
                "{cta_text}\n\n"
                "#{keyword_1} #{keyword_2} #{keyword_3} #Malta"
            ),
            "required_vars": ["hook", "offer_name", "offer_price",
                              "offer_description", "urgency_hook", "cta_text"],
        },
        {
            "id": "offer_value_stack",
            "name": "Value Stack",
            "template": (
                "{hook}\n\n"
                "Here's what's included in our {offer_name}:\n\n"
                "{offer_includes}\n\n"
                "All for just {offer_price}.\n\n"
                "{urgency_hook}\n\n"
                "{cta_text}\n\n"
                "#{keyword_1} #{keyword_2} #{keyword_3} #Malta"
            ),
            "required_vars": ["hook", "offer_name", "offer_includes",
                              "offer_price", "urgency_hook", "cta_text"],
        },
    ],
    "event": [
        {
            "id": "event_seasonal",
            "name": "Seasonal Event",
            "template": (
                "{hook}\n\n"
                "This {season_name}, {brand_name} invites you to experience "
                "{event_description}.\n\n"
                "{event_details}\n\n"
                "{cta_text}\n\n"
                "#{keyword_1} #{keyword_2} #{season_keyword} #Malta"
            ),
            "required_vars": ["hook", "season_name", "brand_name",
                              "event_description", "event_details", "cta_text"],
        },
        {
            "id": "event_special",
            "name": "Special Occasion",
            "template": (
                "{hook}\n\n"
                "{event_description}\n\n"
                "At {brand_name}, we've prepared something special: "
                "{special_detail}\n\n"
                "{cta_text}\n\n"
                "#{keyword_1} #{keyword_2} #{keyword_3} #Malta"
            ),
            "required_vars": ["hook", "event_description", "brand_name",
                              "special_detail", "cta_text"],
        },
    ],
}

# Default hooks per brand type (used when no custom hook bank exists)
DEFAULT_HOOKS: dict[str, list[str]] = {
    "carisma_spa": [
        "Your moment of peace is waiting",
        "Step into serenity at Malta's premier spa",
        "Escape the everyday. Indulge in wellness",
        "Treat yourself to the relaxation you deserve",
        "Where wellness meets luxury in Malta",
        "Your body deserves this",
        "The perfect escape is closer than you think",
        "Unwind, recharge, and feel renewed",
    ],
    "carisma_aesthetics": [
        "Confidence starts with how you feel",
        "Natural-looking results. Expert care",
        "Glow with confidence this season",
        "Subtle enhancements. Stunning results",
        "Your aesthetic journey starts here",
        "Expert aesthetics in the heart of Malta",
        "Feel your most confident self",
        "Trusted by women across Malta",
    ],
    "carisma_slimming": [
        "Your wellness journey, your way",
        "Real results. Real support. Real you",
        "Take the first step towards feeling your best",
        "Body confidence starts with the right support",
        "Evidence-based solutions for lasting results",
        "You deserve to feel comfortable in your own skin",
        "Small steps lead to big transformations",
        "Compassionate care for your wellness goals",
    ],
}

# Brand-specific content variables
BRAND_CONTENT: dict[str, dict[str, Any]] = {
    "carisma_spa": {
        "service_description": "luxury spa experiences including massages, facials, and thermal treatments",
        "expertise_area": "holistic wellness and relaxation",
        "industry_phrase": "luxury wellness in Malta",
        "promise": "every visit leaves you feeling refreshed and renewed",
        "value_prop": "a sanctuary of relaxation and rejuvenation",
        "reason_1": "Premium treatments using the finest products",
        "reason_2": "Expert therapists with years of experience",
        "reason_3": "A tranquil setting designed for your complete comfort",
        "local_detail": "Conveniently located and ready to welcome you for your next escape.",
        "cta_texts": [
            "Book your experience today at carismaspa.com",
            "Visit carismaspa.com to reserve your spot",
            "Call us or book online at carismaspa.com",
            "Treat yourself — book now at carismaspa.com",
        ],
    },
    "carisma_aesthetics": {
        "service_description": "expert aesthetic treatments including Botox, dermal fillers, and advanced skincare",
        "expertise_area": "medical aesthetics with a focus on natural-looking results",
        "industry_phrase": "aesthetic medicine in Malta",
        "promise": "results that enhance your natural beauty",
        "value_prop": "expert aesthetic care you can trust",
        "reason_1": "Qualified practitioners with clinical expertise",
        "reason_2": "Natural-looking results tailored to you",
        "reason_3": "A consultation-first approach — because your goals matter",
        "local_detail": "Trusted by women across Malta for safe, effective treatments.",
        "cta_texts": [
            "Book your free consultation at carismaaesthetics.com",
            "Schedule your assessment at carismaaesthetics.com",
            "Take the first step — book a consultation at carismaaesthetics.com",
            "Discover what's possible at carismaaesthetics.com",
        ],
    },
    "carisma_slimming": {
        "service_description": "non-invasive body contouring and medical weight management solutions",
        "expertise_area": "compassionate, evidence-based weight management",
        "industry_phrase": "body wellness and contouring in Malta",
        "promise": "a supportive journey towards feeling your best",
        "value_prop": "personalised wellness solutions that work with your body",
        "reason_1": "Personalised plans designed around your goals",
        "reason_2": "Non-invasive treatments with proven results",
        "reason_3": "Compassionate support every step of the way",
        "local_detail": "Helping women across Malta feel confident and comfortable.",
        "cta_texts": [
            "Book your consultation at carismaslimming.com",
            "Start your journey at carismaslimming.com",
            "Take the first step — visit carismaslimming.com",
            "Learn more at carismaslimming.com",
        ],
    },
}

# Seasonal content lines
SEASONAL_LINES: dict[str, dict[str, str]] = {
    "carisma_spa": {
        "winter": "Warm up this winter with a spa experience that soothes body and soul.",
        "spring": "Refresh and renew this spring with our rejuvenating treatments.",
        "summer": "Beat the summer heat with a cool, refreshing spa retreat.",
        "autumn": "As the season changes, treat yourself to some well-deserved pampering.",
        "valentines": "This Valentine's, give yourself the gift of relaxation.",
        "mothers_day": "Celebrate the special women in your life with a spa experience.",
        "christmas": "The perfect Christmas gift — a spa day she'll truly love.",
        "new_year": "Start the new year feeling refreshed and renewed.",
    },
    "carisma_aesthetics": {
        "winter": "New year, new confidence — subtle enhancements for a fresh start.",
        "spring": "Spring into confidence with a refreshed, natural look.",
        "summer": "Get summer-ready with expert aesthetic treatments.",
        "autumn": "Autumn is the perfect time for a subtle refresh.",
        "valentines": "Feel your most confident self this Valentine's season.",
        "mothers_day": "Give Mum the gift of confidence and self-care.",
        "christmas": "Gift yourself the confidence boost you've been thinking about.",
        "new_year": "A new year calls for a renewed sense of confidence.",
    },
    "carisma_slimming": {
        "winter": "This winter, invest in yourself and your wellness goals.",
        "spring": "Spring is the perfect time to start your wellness journey.",
        "summer": "Feel confident this summer with our body wellness solutions.",
        "autumn": "As the season shifts, refocus on your well-being.",
        "valentines": "The best act of self-love? Taking care of yourself.",
        "mothers_day": "Every mum deserves to feel confident and comfortable.",
        "christmas": "Give yourself the gift of wellness this festive season.",
        "new_year": "New year, new chapter — start your wellness journey today.",
    },
}


def load_templates(brand_id: str) -> dict[str, list[dict[str, Any]]]:
    """Load custom templates if available, otherwise use defaults."""
    templates_path = GBP_DIR / f"templates_{brand_id}.json"
    if templates_path.exists():
        with open(templates_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return DEFAULT_TEMPLATES


# ---------------------------------------------------------------------------
# Keyword selection with rotation
# ---------------------------------------------------------------------------

def select_keywords(
    keyword_bank: dict[str, list[str]],
    num_keywords: int,
    recent_log: list[dict[str, Any]],
    season: str,
) -> list[str]:
    """
    Select keywords using rotation rules to avoid repetition.

    Priority: primary > seasonal (if matching) > local > secondary > long_tail
    Avoids keywords used in the last 5 posts.
    """
    # Collect recently used keywords
    recent_keywords: set[str] = set()
    for entry in recent_log[-5:]:
        recent_keywords.update(entry.get("target_keywords", []))

    selected: list[str] = []

    # Build priority order
    priority_pools = [
        keyword_bank.get("primary", []),
        keyword_bank.get("seasonal", []) if season else [],
        keyword_bank.get("local", []),
        keyword_bank.get("secondary", []),
        keyword_bank.get("long_tail", []),
    ]

    for pool in priority_pools:
        for kw in pool:
            if len(selected) >= num_keywords:
                break
            if kw.lower() not in {k.lower() for k in recent_keywords}:
                selected.append(kw)
        if len(selected) >= num_keywords:
            break

    # If still not enough (all recently used), cycle from primary anyway
    if len(selected) < num_keywords:
        all_keywords = []
        for pool in priority_pools:
            all_keywords.extend(pool)
        for kw in all_keywords:
            if kw not in selected:
                selected.append(kw)
            if len(selected) >= num_keywords:
                break

    return selected[:num_keywords]


def select_template(
    templates: list[dict[str, Any]],
    recent_log: list[dict[str, Any]],
) -> dict[str, Any]:
    """Select a template that hasn't been used recently."""
    recent_template_ids: set[str] = set()
    for entry in recent_log[-5:]:
        tid = entry.get("template_id")
        if tid:
            recent_template_ids.add(tid)

    # Prefer templates not recently used
    for tpl in templates:
        if tpl["id"] not in recent_template_ids:
            return tpl

    # All recently used — just pick the first one
    return templates[0]


def select_hook(
    hooks: list[str],
    recent_log: list[dict[str, Any]],
) -> str:
    """Select a hook that hasn't been used recently."""
    recent_hooks: set[str] = set()
    for entry in recent_log[-5:]:
        h = entry.get("hook")
        if h:
            recent_hooks.add(h)

    for hook in hooks:
        if hook not in recent_hooks:
            return hook

    # All recently used — pick the first one
    return hooks[0]


def auto_select_post_type(
    recent_log: list[dict[str, Any]],
    has_active_offers: bool,
) -> str:
    """
    Auto-select the next post type based on rotation rules.

    Rotation pattern: update, offer, update, update, event, update, offer, ...
    Falls back to update if no offers/events are available.
    """
    if not recent_log:
        return "update"

    recent_types = [e.get("post_type", "update") for e in recent_log[-4:]]

    # Count recent distribution
    update_count = recent_types.count("update")
    offer_count = recent_types.count("offer")
    event_count = recent_types.count("event")

    # If we haven't done an offer recently and have active offers
    if offer_count == 0 and has_active_offers:
        return "offer"

    # If we haven't done an event in a while (every ~5 posts)
    if event_count == 0 and len(recent_log) >= 4:
        return "event"

    # Default to update
    return "update"


# ---------------------------------------------------------------------------
# Post generation
# ---------------------------------------------------------------------------

def generate_post_id(brand_id: str, date: datetime, sequence: int) -> str:
    """Generate unique post ID: {BRAND_CODE}_GBP_{DATE}_{SEQ}."""
    brand_code = BRAND_CODES.get(brand_id, brand_id[:2].upper())
    date_str = date.strftime("%Y%m%d")
    return f"{brand_code}_GBP_{date_str}_{sequence:03d}"


def build_post_content(
    template: dict[str, Any],
    variables: dict[str, str],
) -> str:
    """
    Fill template with variables and return the post text.

    Unresolved variables are replaced with empty strings.
    """
    text = template["template"]
    for key, value in variables.items():
        text = text.replace(f"{{{key}}}", str(value))

    # Remove any unresolved placeholders
    import re
    text = re.sub(r"\{[^}]+\}", "", text)

    # Clean up extra whitespace and blank lines
    lines = text.split("\n")
    cleaned_lines = []
    prev_blank = False
    for line in lines:
        stripped = line.strip()
        if not stripped:
            if not prev_blank:
                cleaned_lines.append("")
            prev_blank = True
        else:
            cleaned_lines.append(stripped)
            prev_blank = False

    return "\n".join(cleaned_lines).strip()


def get_cta_button_type(post_type: str) -> str:
    """Return the GBP CTA button type for the post type."""
    cta_map = {
        "update": "LEARN_MORE",
        "offer": "ORDER",
        "event": "SIGN_UP",
    }
    return cta_map.get(post_type, "LEARN_MORE")


def get_cta_link(brand: dict[str, Any], offer: Optional[dict[str, Any]] = None) -> str:
    """Get the appropriate CTA link."""
    if offer and offer.get("landing_page"):
        return offer["landing_page"]
    return brand.get("website_url", "")


def get_brand_offers(brand_id: str, offers_config: dict[str, Any]) -> list[dict[str, Any]]:
    """Get active offers for a specific brand."""
    return [
        o for o in offers_config.values()
        if o.get("brand") == brand_id and o.get("active", True)
    ]


def generate_single_post(
    brand_id: str,
    brand: dict[str, Any],
    post_type: str,
    sequence: int,
    season: str,
    keyword_bank: dict[str, list[str]],
    offers_config: dict[str, Any],
    recent_log: list[dict[str, Any]],
    generation_date: datetime,
) -> dict[str, Any]:
    """Generate a single GBP post for a brand."""
    brand_name = brand.get("brand_name", "Carisma")
    brand_voice = brand.get("brand_voice", {})
    templates = load_templates(brand_id)

    # Get templates for this post type
    type_templates = templates.get(post_type, templates.get("update", []))
    if not type_templates:
        type_templates = DEFAULT_TEMPLATES.get("update", [])

    # Select template, hook, and keywords
    template = select_template(type_templates, recent_log)
    hooks = DEFAULT_HOOKS.get(brand_id, DEFAULT_HOOKS.get("carisma_spa", []))
    hook = select_hook(hooks, recent_log)
    keywords = select_keywords(keyword_bank, 3, recent_log, season)

    # Get brand-specific content
    brand_content = BRAND_CONTENT.get(brand_id, BRAND_CONTENT.get("carisma_spa", {}))
    seasonal_line = SEASONAL_LINES.get(brand_id, {}).get(season, "")

    # Select CTA text (rotate through available options)
    cta_texts = brand_content.get("cta_texts", ["Visit our website to learn more."])
    cta_index = sequence % len(cta_texts)
    cta_text = cta_texts[cta_index]

    # Get location info
    locations = load_locations_config()
    brand_locations = locations.get(brand_id, [])
    local_area = "Malta"
    if brand_locations:
        local_area = brand_locations[0].get("area", "Malta")

    # Build variables dict
    variables: dict[str, str] = {
        "hook": hook,
        "brand_name": brand_name,
        "service_description": brand_content.get("service_description", ""),
        "benefit_statement": brand_content.get("promise", ""),
        "expertise_area": brand_content.get("expertise_area", ""),
        "industry_phrase": brand_content.get("industry_phrase", ""),
        "promise": brand_content.get("promise", ""),
        "value_prop": brand_content.get("value_prop", ""),
        "reason_1": brand_content.get("reason_1", ""),
        "reason_2": brand_content.get("reason_2", ""),
        "reason_3": brand_content.get("reason_3", ""),
        "local_area": local_area,
        "local_detail": brand_content.get("local_detail", ""),
        "cta_text": cta_text,
        "seasonal_line": seasonal_line,
        "season_name": season.replace("_", " ").title(),
        "season_keyword": season.replace("_", ""),
        "keyword_1": keywords[0] if len(keywords) > 0 else "",
        "keyword_2": keywords[1] if len(keywords) > 1 else "",
        "keyword_3": keywords[2] if len(keywords) > 2 else "",
        "local_keyword": "Malta",
    }

    # Add offer-specific variables for offer posts
    offer_data: Optional[dict[str, Any]] = None
    if post_type == "offer":
        brand_offers = get_brand_offers(brand_id, offers_config)
        if brand_offers:
            # Rotate through offers
            offer_data = brand_offers[sequence % len(brand_offers)]
            variables["offer_name"] = offer_data.get("offer_name", "")
            variables["offer_price"] = offer_data.get("price", {}).get("display", "")
            variables["offer_description"] = offer_data.get("includes", "")[:200]
            variables["offer_includes"] = offer_data.get("includes", "")
            urgency_hooks = offer_data.get("urgency_hooks", [])
            variables["urgency_hook"] = urgency_hooks[sequence % len(urgency_hooks)] if urgency_hooks else ""

            # Use seasonal angle if available
            seasonal_angles = offer_data.get("seasonal_angles", {})
            if season in seasonal_angles:
                variables["hook"] = seasonal_angles[season].get("hook", hook)

    # Add event-specific variables
    if post_type == "event":
        variables["event_description"] = f"a special {season.replace('_', ' ')} wellness experience"
        variables["event_details"] = f"Contact us for details and availability."
        variables["special_detail"] = f"exclusive {season.replace('_', ' ')} treatments and packages"

    # Build the post content
    post_text = build_post_content(template, variables)

    # Validate character count
    char_count = len(post_text)
    if char_count > MAX_POST_LENGTH:
        logger.warning("Post %s exceeds max length (%d > %d). Truncating.",
                        generate_post_id(brand_id, generation_date, sequence),
                        char_count, MAX_POST_LENGTH)
        # Truncate at last complete sentence before limit
        truncated = post_text[:MAX_POST_LENGTH]
        last_period = truncated.rfind(".")
        last_newline = truncated.rfind("\n")
        cut_point = max(last_period, last_newline)
        if cut_point > MIN_POST_LENGTH:
            post_text = post_text[:cut_point + 1]
        else:
            post_text = truncated

    char_count = len(post_text)

    # Validate keyword presence
    keywords_present = [kw for kw in keywords if kw.lower() in post_text.lower()]

    # Build the post object
    post_id = generate_post_id(brand_id, generation_date, sequence)
    cta_link = get_cta_link(brand, offer_data)

    post = {
        "post_id": post_id,
        "brand": brand_id,
        "brand_name": brand_name,
        "post_type": post_type,
        "template_id": template["id"],
        "template_name": template["name"],
        "text": post_text,
        "cta_button": get_cta_button_type(post_type),
        "cta_link": cta_link,
        "hook": variables["hook"],
        "target_keywords": keywords,
        "keywords_present_in_text": keywords_present,
        "character_count": char_count,
        "season": season,
        "seasonal_line": seasonal_line,
        "offer_id": offer_data["offer_id"] if offer_data else None,
        "locations": brand_locations if brand_locations else [{"area": "Malta"}],
        "generated_at": generation_date.isoformat(),
        "status": "draft",
        "validation": {
            "char_count_ok": MIN_POST_LENGTH <= char_count <= MAX_POST_LENGTH,
            "has_cta": bool(cta_link),
            "has_keywords": len(keywords_present) > 0,
            "keyword_coverage": f"{len(keywords_present)}/{len(keywords)}",
        },
    }

    return post


def generate_posts_for_brand(
    brand_id: str,
    num_posts: int,
    post_type: str,
    season: str,
    offers_config: dict[str, Any],
    brands_config: dict[str, Any],
) -> list[dict[str, Any]]:
    """Generate multiple posts for a single brand."""
    brand = brands_config.get(brand_id)
    if not brand:
        logger.error("Brand '%s' not found in config.", brand_id)
        return []

    if not brand.get("active", True):
        logger.info("Brand '%s' is inactive. Skipping.", brand_id)
        return []

    keyword_bank = load_keyword_bank(brand_id)
    recent_log = load_post_log(brand_id)
    generation_date = datetime.now()

    has_active_offers = len(get_brand_offers(brand_id, offers_config)) > 0

    posts: list[dict[str, Any]] = []
    log_entries: list[dict[str, Any]] = []

    for i in range(num_posts):
        # Determine post type for this iteration
        if post_type == "auto":
            # Use combined log (existing + just-generated) for rotation
            combined_log = recent_log + log_entries
            current_type = auto_select_post_type(combined_log, has_active_offers)
        else:
            current_type = post_type

        sequence = i + 1
        post = generate_single_post(
            brand_id=brand_id,
            brand=brand,
            post_type=current_type,
            sequence=sequence,
            season=season,
            keyword_bank=keyword_bank,
            offers_config=offers_config,
            recent_log=recent_log + log_entries,
            generation_date=generation_date,
        )
        posts.append(post)

        # Add to log entries for rotation tracking within this batch
        log_entries.append({
            "post_id": post["post_id"],
            "post_type": post["post_type"],
            "template_id": post["template_id"],
            "hook": post["hook"],
            "target_keywords": post["target_keywords"],
            "generated_at": post["generated_at"],
        })

    # Save updated post log
    save_post_log(brand_id, log_entries)

    return posts


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------

def save_output(
    posts: list[dict[str, Any]],
    brand_id: str,
    output_dir: Path,
) -> Path:
    """Save generated posts to a JSON file."""
    output_dir.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d")
    filename = f"posts_{brand_id}_{date_str}.json"
    output_path = output_dir / filename

    output = {
        "metadata": {
            "tool": "gbp_generate_posts",
            "brand": brand_id,
            "num_posts": len(posts),
            "generated_at": datetime.now().isoformat(),
            "status": "draft_pending_review",
        },
        "posts": posts,
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    logger.info("Saved %d posts to %s", len(posts), output_path)
    return output_path


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate Google Business Profile post content for Carisma brands.",
    )
    parser.add_argument(
        "--brand_id",
        type=str,
        required=True,
        help='Brand ID (e.g. "carisma_spa", "carisma_aesthetics", "carisma_slimming") or "all"',
    )
    parser.add_argument(
        "--post_type",
        type=str,
        default="auto",
        choices=["update", "offer", "event", "auto"],
        help='Post type: "update", "offer", "event", or "auto" (default: auto)',
    )
    parser.add_argument(
        "--num_posts",
        type=int,
        default=2,
        help="Number of posts per brand (default: 2)",
    )
    parser.add_argument(
        "--season",
        type=str,
        default=None,
        help="Season override (auto-detects from date if not specified)",
    )
    parser.add_argument(
        "--output_dir",
        type=str,
        default=None,
        help=f"Output directory (default: {DEFAULT_OUTPUT_DIR})",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> None:
    args = parse_args(argv)

    # Resolve output directory
    output_dir = Path(args.output_dir) if args.output_dir else DEFAULT_OUTPUT_DIR

    # Detect season
    season = args.season if args.season else detect_season()
    logger.info("Season: %s", season)

    # Load configs
    try:
        brands_config = load_brands_config()
        offers_config = load_offers_config()
    except FileNotFoundError as exc:
        logger.error("Config file missing: %s", exc)
        sys.exit(1)

    # Determine which brands to process
    if args.brand_id == "all":
        brand_ids = [bid for bid, b in brands_config.items() if b.get("active", True)]
    else:
        if args.brand_id not in brands_config:
            logger.error(
                "Brand '%s' not found. Available: %s",
                args.brand_id,
                list(brands_config.keys()),
            )
            sys.exit(1)
        brand_ids = [args.brand_id]

    logger.info("Generating %d post(s) for brands: %s", args.num_posts, brand_ids)

    all_posts: dict[str, list[dict[str, Any]]] = {}
    total_generated = 0

    for brand_id in brand_ids:
        logger.info("--- Processing brand: %s ---", brand_id)
        posts = generate_posts_for_brand(
            brand_id=brand_id,
            num_posts=args.num_posts,
            post_type=args.post_type,
            season=season,
            offers_config=offers_config,
            brands_config=brands_config,
        )

        if posts:
            output_path = save_output(posts, brand_id, output_dir)
            all_posts[brand_id] = posts
            total_generated += len(posts)
            logger.info("Brand %s: %d posts generated -> %s", brand_id, len(posts), output_path)
        else:
            logger.warning("Brand %s: No posts generated.", brand_id)

    # Print summary
    summary = {
        "total_posts_generated": total_generated,
        "brands_processed": list(all_posts.keys()),
        "season": season,
        "output_dir": str(output_dir),
        "post_type": args.post_type,
        "posts_per_brand": {bid: len(posts) for bid, posts in all_posts.items()},
    }

    print(json.dumps(summary, indent=2))

    if total_generated == 0:
        logger.warning("No posts were generated. Check brand config and availability.")
        sys.exit(1)

    logger.info("Done. %d total posts generated across %d brand(s).",
                 total_generated, len(all_posts))


if __name__ == "__main__":
    main()
