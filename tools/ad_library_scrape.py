"""
Ad Library Scrape Tool
======================

Screenshot competitor ad creatives from the Meta Ad Library web interface.

Purpose:
    Navigate the Ad Library web UI using Playwright MCP to capture screenshots
    of individual ad cards. This provides visual references of competitor
    creatives that the API alone cannot deliver (rendered images/videos).

Inputs:
    --page_ids          Comma-separated Meta Page IDs to scrape
    --urls              Comma-separated Ad Library URLs to scrape directly
    --screenshot_dir    Output directory for PNGs (default: .tmp/research/screenshots)
    --max_ads           Maximum number of ad cards to screenshot per page (default: 20)
    --scroll_pause      Seconds to pause between scrolls for lazy loading (default: 2)

Outputs:
    - PNG screenshots in the screenshot directory
    - Metadata JSON at .tmp/research/scrape_metadata_{date}.json

MCP Integration:
    Uses Playwright MCP for browser automation:
    - playwright_navigate to load Ad Library pages
    - playwright_screenshot to capture screenshots
    - playwright_click / playwright_evaluate for scrolling and interaction
"""

import argparse
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
BASE_DIR = Path(__file__).resolve().parent.parent
TMP_DIR = BASE_DIR / ".tmp" / "research"
DEFAULT_SCREENSHOT_DIR = TMP_DIR / "screenshots"

AD_LIBRARY_BASE_URL = "https://www.facebook.com/ads/library/"
AD_LIBRARY_SEARCH_URL = "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=MT&media_type=all"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ad_library_scrape")


# ---------------------------------------------------------------------------
# URL builders
# ---------------------------------------------------------------------------

def build_page_url(page_id: str, country: str = "MT") -> str:
    """Build an Ad Library URL for a specific page."""
    return (
        f"https://www.facebook.com/ads/library/"
        f"?active_status=active&ad_type=all&country={country}"
        f"&view_all_page_id={page_id}&media_type=all"
    )


def build_search_url(query: str, country: str = "MT") -> str:
    """Build an Ad Library search URL for a text query."""
    from urllib.parse import quote_plus
    return (
        f"https://www.facebook.com/ads/library/"
        f"?active_status=active&ad_type=all&country={country}"
        f"&q={quote_plus(query)}&media_type=all"
    )


# ---------------------------------------------------------------------------
# Playwright MCP instruction builders
# ---------------------------------------------------------------------------

def build_navigate_instruction(url: str) -> dict[str, Any]:
    """Build a Playwright MCP navigate instruction."""
    return {
        "mcp_tool": "playwright_navigate",
        "params": {
            "url": url,
        },
        "description": f"Navigate to Ad Library: {url[:80]}...",
    }


def build_scroll_instruction(pixels: int = 800) -> dict[str, Any]:
    """Build a Playwright MCP scroll instruction using evaluate."""
    return {
        "mcp_tool": "playwright_evaluate",
        "params": {
            "script": f"window.scrollBy(0, {pixels})",
        },
        "description": f"Scroll down {pixels}px to load more ads",
    }


def build_screenshot_instruction(
    output_path: str,
    selector: Optional[str] = None,
    full_page: bool = False,
) -> dict[str, Any]:
    """Build a Playwright MCP screenshot instruction."""
    instruction: dict[str, Any] = {
        "mcp_tool": "playwright_screenshot",
        "params": {
            "name": os.path.basename(output_path),
        },
        "output_path": output_path,
        "description": f"Screenshot: {os.path.basename(output_path)}",
    }
    if selector:
        instruction["params"]["selector"] = selector
    if full_page:
        instruction["params"]["fullPage"] = True
    return instruction


def build_wait_instruction(milliseconds: int = 2000) -> dict[str, Any]:
    """Build a wait instruction for lazy-loading content."""
    return {
        "mcp_tool": "playwright_evaluate",
        "params": {
            "script": f"new Promise(r => setTimeout(r, {milliseconds}))",
        },
        "description": f"Wait {milliseconds}ms for content to load",
    }


# ---------------------------------------------------------------------------
# Scrape plan generation
# ---------------------------------------------------------------------------

def generate_scrape_plan(
    page_ids: Optional[list[str]] = None,
    urls: Optional[list[str]] = None,
    screenshot_dir: Optional[str] = None,
    max_ads: int = 20,
    scroll_pause: int = 2,
    country: str = "MT",
) -> dict[str, Any]:
    """
    Generate the full scrape plan as a sequence of Playwright MCP instructions.

    The agent executes these instructions in order. Each instruction is a dict
    describing the MCP tool call and its parameters.

    Returns:
        A plan dict with metadata and ordered instruction list.
    """
    out_dir = Path(screenshot_dir) if screenshot_dir else DEFAULT_SCREENSHOT_DIR
    out_dir.mkdir(parents=True, exist_ok=True)

    date_str = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Collect target URLs
    targets: list[dict[str, str]] = []

    if page_ids:
        for pid in page_ids:
            targets.append({
                "type": "page_id",
                "identifier": pid.strip(),
                "url": build_page_url(pid.strip(), country),
            })

    if urls:
        for url in urls:
            targets.append({
                "type": "direct_url",
                "identifier": url.strip(),
                "url": url.strip(),
            })

    if not targets:
        raise ValueError("At least one of page_ids or urls is required.")

    instructions: list[dict[str, Any]] = []
    screenshot_metadata: list[dict[str, Any]] = []

    for target in targets:
        target_slug = target["identifier"].replace("/", "_")[:40]

        # Step 1: Navigate to the page
        instructions.append(build_navigate_instruction(target["url"]))

        # Step 2: Wait for initial load
        instructions.append(build_wait_instruction(3000))

        # Step 3: Take a full-page overview screenshot
        overview_filename = f"overview_{target_slug}_{date_str}.png"
        overview_path = str(out_dir / overview_filename)
        instructions.append(build_screenshot_instruction(overview_path, full_page=False))

        screenshot_metadata.append({
            "type": "overview",
            "target": target["identifier"],
            "filename": overview_filename,
            "path": overview_path,
        })

        # Step 4: Scroll and capture individual ads
        num_scrolls = max(1, max_ads // 4)  # ~4 ads visible per viewport
        for scroll_idx in range(num_scrolls):
            # Scroll down
            instructions.append(build_scroll_instruction(800))
            # Wait for lazy load
            instructions.append(build_wait_instruction(scroll_pause * 1000))

            # Screenshot current viewport
            scroll_filename = f"ads_{target_slug}_scroll{scroll_idx + 1}_{date_str}.png"
            scroll_path = str(out_dir / scroll_filename)
            instructions.append(build_screenshot_instruction(scroll_path))

            screenshot_metadata.append({
                "type": "scroll_capture",
                "target": target["identifier"],
                "scroll_index": scroll_idx + 1,
                "filename": scroll_filename,
                "path": scroll_path,
            })

    plan = {
        "metadata": {
            "tool": "ad_library_scrape",
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "targets": targets,
            "max_ads": max_ads,
            "scroll_pause_seconds": scroll_pause,
            "screenshot_dir": str(out_dir),
            "total_instructions": len(instructions),
        },
        "instructions": instructions,
        "expected_screenshots": screenshot_metadata,
    }

    return plan


def save_plan(plan: dict[str, Any]) -> Path:
    """Save the scrape plan and metadata JSON."""
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d")
    filename = f"scrape_metadata_{date_str}.json"
    output_path = TMP_DIR / filename

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(plan, f, indent=2, ensure_ascii=False)

    logger.info("Scrape plan saved to %s", output_path)
    return output_path


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Screenshot competitor ads from Meta Ad Library.",
    )
    parser.add_argument(
        "--page_ids",
        type=str,
        default=None,
        help="Comma-separated Meta Page IDs to scrape",
    )
    parser.add_argument(
        "--urls",
        type=str,
        default=None,
        help="Comma-separated Ad Library URLs to scrape directly",
    )
    parser.add_argument(
        "--screenshot_dir",
        type=str,
        default=None,
        help="Output directory for screenshots (default: .tmp/research/screenshots)",
    )
    parser.add_argument(
        "--max_ads",
        type=int,
        default=20,
        help="Max ad cards to screenshot per page (default: 20)",
    )
    parser.add_argument(
        "--scroll_pause",
        type=int,
        default=2,
        help="Seconds between scrolls for lazy loading (default: 2)",
    )
    parser.add_argument(
        "--country",
        type=str,
        default="MT",
        help="Country code for Ad Library (default: MT)",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> None:
    args = parse_args(argv)

    page_ids = [p.strip() for p in args.page_ids.split(",")] if args.page_ids else None
    urls = [u.strip() for u in args.urls.split(",")] if args.urls else None

    try:
        plan = generate_scrape_plan(
            page_ids=page_ids,
            urls=urls,
            screenshot_dir=args.screenshot_dir,
            max_ads=args.max_ads,
            scroll_pause=args.scroll_pause,
            country=args.country,
        )

        plan_path = save_plan(plan)

        # Print instructions for the agent
        print(json.dumps(plan, indent=2))
        logger.info(
            "Generated %d Playwright instructions. Plan saved to %s",
            len(plan["instructions"]),
            plan_path,
        )

    except ValueError as exc:
        logger.error("Validation error: %s", exc)
        sys.exit(1)
    except Exception as exc:
        logger.exception("Unexpected error: %s", exc)
        sys.exit(2)


if __name__ == "__main__":
    main()
