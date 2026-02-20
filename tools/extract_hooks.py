"""
Extract Hooks Tool
==================

Extract and categorise hooks from ad text, research files, and winning ads.

Purpose:
    Parse ad creative text to identify hooks (opening lines that grab attention),
    categorise them by type, and rank them by frequency and estimated effectiveness.
    Feeds into the script generation pipeline.

Inputs:
    --research_files    Comma-separated paths to research JSON files (ad library data)
    --winning_ads_file  Path to winning ads JSON (from analyze_performance.py)
    --brand             Brand ID (for context)
    --min_frequency     Minimum occurrences to include a hook pattern (default: 1)

Outputs:
    JSON file at .tmp/research/hooks_{brand}_{date}.json

No MCP Integration:
    Pure Python text processing and analysis.
"""

import argparse
import json
import logging
import re
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
TMP_DIR = BASE_DIR / ".tmp" / "research"

# Hook category definitions with detection patterns
HOOK_CATEGORIES: dict[str, dict[str, Any]] = {
    "question": {
        "description": "Opens with a question to engage the reader",
        "patterns": [
            r"^(?:do you|are you|have you|did you|can you|would you|what if|how (?:do|can|would))",
            r"^(?:ever wonder|tired of|struggling with|looking for|ready (?:to|for))",
            r"\?$",  # Ends with question mark
        ],
        "weight": 1.2,  # Slight boost — questions perform well on social
    },
    "bold_claim": {
        "description": "Makes a strong, attention-grabbing statement",
        "patterns": [
            r"(?:the (?:best|only|most|#1|number one))",
            r"(?:guaranteed|proven|scientifically|clinically)",
            r"(?:you (?:won't believe|need to see|have to try))",
            r"(?:this is (?:the|why))",
            r"(?:finally|at last|introducing)",
        ],
        "weight": 1.0,
    },
    "curiosity": {
        "description": "Creates an information gap that compels reading",
        "patterns": [
            r"(?:the (?:secret|truth|reason|trick|hack) (?:to|behind|about|why))",
            r"(?:what (?:nobody|no one|they don't) (?:tells|tell|told))",
            r"(?:here's (?:what|why|how))",
            r"(?:you (?:probably|might) (?:didn't know|not know))",
            r"(?:this (?:one|simple) (?:thing|trick|hack))",
        ],
        "weight": 1.1,
    },
    "social_proof": {
        "description": "Leverages social validation and popularity",
        "patterns": [
            r"(?:join (?:over |more than )?\d+)",
            r"(?:\d+[\+,]?\s*(?:women|people|customers|clients))",
            r"(?:most popular|best-?selling|top-?rated|award-?winning)",
            r"(?:everyone(?:'s| is)|malta's (?:favourite|favorite|best|top))",
            r"(?:trusted by|loved by|recommended by)",
        ],
        "weight": 1.3,  # Social proof hooks tend to convert well
    },
    "urgency": {
        "description": "Creates time pressure or scarcity",
        "patterns": [
            r"(?:limited (?:time|spots|availability|offer))",
            r"(?:only \d+\s*(?:left|remaining|spots|available))",
            r"(?:last chance|don't miss|hurry|ends (?:today|soon|tomorrow))",
            r"(?:this (?:week|weekend|month) only)",
            r"(?:before (?:it's|they're) gone)",
            r"(?:book (?:now|today)|act (?:now|fast))",
        ],
        "weight": 1.15,
    },
    "emotional": {
        "description": "Triggers an emotional response",
        "patterns": [
            r"(?:you deserve|treat yourself|because you're worth)",
            r"(?:imagine|picture this|close your eyes)",
            r"(?:feel (?:confident|beautiful|amazing|incredible|refreshed))",
            r"(?:transform|life-?changing|game-?changer)",
            r"(?:love yourself|self-?care|me time|your moment)",
            r"(?:escape|unwind|relax|recharge|rejuvenate)",
        ],
        "weight": 1.1,
    },
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("extract_hooks")


# ---------------------------------------------------------------------------
# Text extraction
# ---------------------------------------------------------------------------

def extract_text_from_ad_library(data: dict[str, Any]) -> list[dict[str, str]]:
    """
    Extract ad text content from ad library research data.

    Returns list of dicts with 'text' and 'source' fields.
    """
    texts: list[dict[str, str]] = []

    for ad in data.get("ads", []):
        page_name = ad.get("page_name", "unknown")

        # Ad creative bodies (main ad text)
        bodies = ad.get("ad_creative_bodies", [])
        if isinstance(bodies, list):
            for body in bodies:
                if body and isinstance(body, str):
                    texts.append({"text": body, "source": f"ad_library:{page_name}"})

        # Link titles
        titles = ad.get("ad_creative_link_titles", [])
        if isinstance(titles, list):
            for title in titles:
                if title and isinstance(title, str):
                    texts.append({"text": title, "source": f"ad_library_title:{page_name}"})

        # Link descriptions
        descriptions = ad.get("ad_creative_link_descriptions", [])
        if isinstance(descriptions, list):
            for desc in descriptions:
                if desc and isinstance(desc, str):
                    texts.append({"text": desc, "source": f"ad_library_desc:{page_name}"})

    return texts


def extract_text_from_insights(data: dict[str, Any]) -> list[dict[str, str]]:
    """Extract ad names (which encode creative info) from insights data."""
    texts: list[dict[str, str]] = []

    for record in data.get("ads", data.get("data", [])):
        ad_name = record.get("ad_name", "")
        if ad_name:
            texts.append({"text": ad_name, "source": "insights"})

    return texts


# ---------------------------------------------------------------------------
# Hook extraction and categorisation
# ---------------------------------------------------------------------------

def extract_hook_from_text(text: str) -> str:
    """
    Extract the hook (first sentence or first line) from ad text.

    Hooks are typically the first 1-2 sentences that appear before the scroll.
    """
    # Clean text
    cleaned = text.strip()
    if not cleaned:
        return ""

    # Split into lines and take the first non-empty line
    lines = [line.strip() for line in cleaned.split("\n") if line.strip()]
    if not lines:
        return ""

    first_line = lines[0]

    # If the first line is very long, try to get just the first sentence
    if len(first_line) > 150:
        # Split on sentence boundaries
        sentences = re.split(r"(?<=[.!?])\s+", first_line)
        if sentences:
            return sentences[0]

    return first_line


def categorise_hook(hook_text: str) -> list[dict[str, Any]]:
    """
    Categorise a hook into one or more hook types.

    A hook can match multiple categories. Returns a list of matches with
    confidence scores.
    """
    categories: list[dict[str, Any]] = []
    hook_lower = hook_text.lower().strip()

    for category_name, category_info in HOOK_CATEGORIES.items():
        patterns = category_info["patterns"]
        matched = False

        for pattern in patterns:
            if re.search(pattern, hook_lower, re.IGNORECASE):
                matched = True
                break

        if matched:
            categories.append({
                "category": category_name,
                "description": category_info["description"],
                "weight": category_info["weight"],
            })

    # If no category matched, label as "general"
    if not categories:
        categories.append({
            "category": "general",
            "description": "General hook without a specific pattern",
            "weight": 1.0,
        })

    return categories


# ---------------------------------------------------------------------------
# Analysis pipeline
# ---------------------------------------------------------------------------

def analyze_hooks(
    texts: list[dict[str, str]],
    min_frequency: int = 1,
) -> dict[str, Any]:
    """
    Extract, categorise, and rank hooks from a collection of ad texts.

    Returns structured hook analysis.
    """
    all_hooks: list[dict[str, Any]] = []
    category_counter: Counter = Counter()
    hook_counter: Counter = Counter()

    for text_entry in texts:
        text = text_entry["text"]
        source = text_entry["source"]

        hook = extract_hook_from_text(text)
        if not hook or len(hook) < 5:
            continue

        categories = categorise_hook(hook)
        primary_category = categories[0]["category"] if categories else "general"

        hook_entry = {
            "hook_text": hook,
            "primary_category": primary_category,
            "all_categories": [c["category"] for c in categories],
            "source": source,
            "length": len(hook),
        }

        all_hooks.append(hook_entry)
        hook_counter[hook.lower()] += 1

        for cat in categories:
            category_counter[cat["category"]] += 1

    # Deduplicate and rank
    seen_hooks: dict[str, dict[str, Any]] = {}
    for hook_entry in all_hooks:
        key = hook_entry["hook_text"].lower()
        if key not in seen_hooks:
            seen_hooks[key] = {
                **hook_entry,
                "frequency": hook_counter[key],
                "sources": [hook_entry["source"]],
            }
        else:
            seen_hooks[key]["frequency"] = hook_counter[key]
            if hook_entry["source"] not in seen_hooks[key]["sources"]:
                seen_hooks[key]["sources"].append(hook_entry["source"])

    # Filter by minimum frequency
    unique_hooks = [
        h for h in seen_hooks.values()
        if h["frequency"] >= min_frequency
    ]

    # Rank by weighted score (frequency * category weight)
    for hook in unique_hooks:
        category_weight = max(
            HOOK_CATEGORIES.get(c, {}).get("weight", 1.0)
            for c in hook["all_categories"]
        ) if hook["all_categories"] else 1.0
        hook["score"] = round(hook["frequency"] * category_weight, 2)

    unique_hooks.sort(key=lambda h: h["score"], reverse=True)

    return {
        "total_texts_analyzed": len(texts),
        "total_hooks_extracted": len(all_hooks),
        "unique_hooks": len(unique_hooks),
        "category_distribution": dict(category_counter.most_common()),
        "hooks": unique_hooks,
    }


def extract_hooks(
    research_files: Optional[list[str]] = None,
    winning_ads_file: Optional[str] = None,
    brand_id: Optional[str] = None,
    min_frequency: int = 1,
) -> dict[str, Any]:
    """
    Full hook extraction pipeline.

    Loads data from research and winning ads files, extracts hooks,
    and produces the analysis.
    """
    all_texts: list[dict[str, str]] = []

    # Load research files
    if research_files:
        for filepath in research_files:
            path = Path(filepath)
            if not path.exists():
                logger.warning("Research file not found: %s", filepath)
                continue

            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)

            texts = extract_text_from_ad_library(data)
            all_texts.extend(texts)
            logger.info("Extracted %d texts from %s", len(texts), filepath)

    # Load winning ads file
    if winning_ads_file:
        path = Path(winning_ads_file)
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            texts = extract_text_from_insights(data)
            all_texts.extend(texts)
            logger.info("Extracted %d texts from winning ads", len(texts))
        else:
            logger.warning("Winning ads file not found: %s", winning_ads_file)

    if not all_texts:
        logger.warning("No texts found to analyze.")

    analysis = analyze_hooks(all_texts, min_frequency)

    output = {
        "metadata": {
            "tool": "extract_hooks",
            "brand": brand_id,
            "research_files": research_files or [],
            "winning_ads_file": winning_ads_file,
            "min_frequency": min_frequency,
            "analyzed_at": datetime.utcnow().isoformat() + "Z",
        },
        "analysis": analysis,
    }

    return output


def save_output(data: dict[str, Any], brand_id: Optional[str]) -> Path:
    """Write hooks output to .tmp/research/."""
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d")
    brand_slug = brand_id or "all"
    filename = f"hooks_{brand_slug}_{date_str}.json"
    output_path = TMP_DIR / filename

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    logger.info("Hooks analysis saved to %s", output_path)
    return output_path


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract and categorise hooks from ad text.",
    )
    parser.add_argument(
        "--research_files",
        type=str,
        default=None,
        help="Comma-separated paths to research JSON files",
    )
    parser.add_argument(
        "--winning_ads_file",
        type=str,
        default=None,
        help="Path to winning ads / analysis JSON",
    )
    parser.add_argument("--brand", type=str, default=None, help="Brand ID (for context)")
    parser.add_argument(
        "--min_frequency",
        type=int,
        default=1,
        help="Minimum frequency to include (default: 1)",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> None:
    args = parse_args(argv)

    research_files = (
        [f.strip() for f in args.research_files.split(",") if f.strip()]
        if args.research_files
        else None
    )

    try:
        output = extract_hooks(
            research_files=research_files,
            winning_ads_file=args.winning_ads_file,
            brand_id=args.brand,
            min_frequency=args.min_frequency,
        )

        output_path = save_output(output, args.brand)
        print(json.dumps(output, indent=2))
        logger.info(
            "Extracted %d unique hooks. Output: %s",
            output["analysis"]["unique_hooks"],
            output_path,
        )

    except Exception as exc:
        logger.exception("Unexpected error: %s", exc)
        sys.exit(2)


if __name__ == "__main__":
    main()
