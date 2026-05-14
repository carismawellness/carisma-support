"""
Ad Library Scraper (Playwright)
================================
Scrapes the public Facebook Ad Library website for competitor ads in Malta.
Used as fallback when Meta Ad Library API access is unavailable.

Usage:
    python tools/scrape_ad_library.py --search "spa Malta" --brand carisma_spa
    python tools/scrape_ad_library.py --search "Botox Malta" --brand carisma_aesthetics
"""

import argparse
import json
import time
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE_DIR = Path(__file__).resolve().parent.parent
TMP_DIR = BASE_DIR / ".tmp" / "research"


def scrape_ad_library(search_term: str, brand: str, max_ads: int = 30):
    TMP_DIR.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            locale="en-US",
            timezone_id="Europe/Malta",
        )
        page = context.new_page()

        url = (
            f"https://www.facebook.com/ads/library/"
            f"?active_status=active&ad_type=all&country=MT"
            f"&q={search_term.replace(' ', '+')}&search_type=keyword_unordered&media_type=all"
        )

        print(f"Navigating to Ad Library: {search_term}")
        page.goto(url, wait_until="networkidle", timeout=30000)
        time.sleep(3)

        # Dismiss cookie/login dialogs if present
        for selector in ["[data-testid='cookie-policy-manage-dialog-accept-button']",
                         "button[title='Allow all cookies']",
                         "div[aria-label='Close']"]:
            try:
                page.click(selector, timeout=2000)
                time.sleep(1)
            except Exception:
                pass

        # Scroll to load more ads
        for _ in range(5):
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(2)

        # Take screenshot
        screenshot_path = TMP_DIR / f"adlib_{search_term.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.png"
        page.screenshot(path=str(screenshot_path), full_page=False)
        print(f"Screenshot saved: {screenshot_path}")

        # Extract all ad data via JS
        js = f"""
            () => {{
                const ads = [];
                const seen = new Set();
                const maxAds = {max_ads};

                const allDivs = document.querySelectorAll('div');
                allDivs.forEach(div => {{
                    if (ads.length >= maxAds) return;
                    const text = div.innerText ? div.innerText.trim() : '';
                    if (text.length > 40 && text.length < 1000 && !seen.has(text)) {{
                        if (text.includes('\\n') || text.length > 80) {{
                            seen.add(text);
                            ads.push({{raw_text: text}});
                        }}
                    }}
                }});

                const pageLinks = [];
                const linksSeen = new Set();
                document.querySelectorAll('a[href*="facebook.com/"]').forEach(l => {{
                    const text = (l.innerText || '').trim();
                    const href = l.href || '';
                    if (text && text.length > 2 && text.length < 80 && !linksSeen.has(text)
                        && !href.includes('/ads/library') && !href.includes('facebook.com/legal')) {{
                        linksSeen.add(text);
                        pageLinks.push({{page_name: text, url: href}});
                    }}
                }});

                return {{ads: ads, page_links: pageLinks.slice(0, 30)}};
            }}
        """

        try:
            result = page.evaluate(js)
            ads = result.get('ads', [])
            page_links = result.get('page_links', [])
            print(f"Extracted {len(ads)} ad texts, {len(page_links)} page links")
        except Exception as e:
            print(f"JS extraction error: {e}")
            ads = []
            page_links = []

        browser.close()

    return ads, page_links, str(screenshot_path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--search", required=True, help="Search term e.g. 'spa Malta'")
    parser.add_argument("--brand", required=True, help="Brand ID e.g. carisma_spa")
    parser.add_argument("--max_ads", type=int, default=30)
    args = parser.parse_args()

    ads, links, screenshot = scrape_ad_library(args.search, args.brand, args.max_ads)

    output = {
        "metadata": {
            "source": "playwright_ad_library_scrape",
            "search_term": args.search,
            "brand": args.brand,
            "retrieved_at": datetime.now(timezone.utc).isoformat(),
            "total_ad_elements": len(ads),
            "screenshot": screenshot,
        },
        "ads": ads,
        "page_links": links,
    }

    slug = args.search.replace(" ", "_").lower()
    date_str = datetime.now().strftime("%Y%m%d")
    out_path = TMP_DIR / f"ad_library_{slug}_{date_str}.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"\nOutput saved: {out_path}")
    print(f"Ad elements found: {len(ads)}")
    print(f"Page links found: {len(links)}")


if __name__ == "__main__":
    main()
