"""
Fresha Availability Scraper
Checks practitioner availability across Carisma venues to inform ad spend decisions.

Usage:
    python tools/check_fresha_availability.py [--venue slimming|aesthetics|all] [--days 14]

Output:
    .tmp/performance/fresha_capacity_report.json

How it works:
    1. Navigates to each venue's Fresha booking page
    2. For each service, enters the booking flow
    3. Selects "Any professional" for maximum availability view
    4. Checks each date in the next N days for available time slots
    5. Outputs a capacity report with ad spend recommendations
"""

import asyncio
import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

try:
    from playwright.async_api import async_playwright
except ImportError:
    print("ERROR: playwright not installed. Run: pip install playwright && playwright install chromium")
    sys.exit(1)


SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
CONFIG_PATH = PROJECT_ROOT / "config" / "fresha_venues.json"
OUTPUT_DIR = PROJECT_ROOT / ".tmp" / "performance"
OUTPUT_PATH = OUTPUT_DIR / "fresha_capacity_report.json"

# Thresholds: avg slots per day over the check window
CAPACITY_FULL = 0        # No slots at all
CAPACITY_LIMITED = 3     # Fewer than 3 avg slots/day
CAPACITY_OPEN = 6        # 6+ avg slots/day = plenty of room


def load_config():
    with open(CONFIG_PATH) as f:
        return json.load(f)


async def scrape_venue_services(page, venue_url):
    """Navigate to venue page and extract all bookable services."""
    await page.goto(venue_url, wait_until="domcontentloaded", timeout=60000)
    await page.wait_for_timeout(5000)

    services = []
    # Find all service items in the service list
    service_elements = await page.query_selector_all('[data-qa="service-list-item"], [role="button"][class*="service"]')

    # Fallback: look for headings within the service section
    if not service_elements:
        service_elements = await page.query_selector_all('h3')

    for el in service_elements:
        text = await el.inner_text()
        name = text.strip().split('\n')[0]  # First line is the service name
        if name and len(name) > 2:
            services.append(name)

    return services


async def check_service_availability(page, venue_url, service_name, days_to_check=14):
    """
    Check availability for a specific service over the next N days.
    Returns dict with date -> slot_count mapping.
    """
    result = {
        "service": service_name,
        "dates": {},
        "total_slots": 0,
        "fully_booked_days": 0,
        "days_checked": 0,
        "next_available": None,
        "error": None
    }

    try:
        # Start fresh from the venue page
        await page.goto(venue_url, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(5000)  # Wait for SPA hydration

        # Dismiss cookie banner if present
        try:
            accept_btn = page.get_by_role("button", name="Accept all")
            if await accept_btn.count() > 0:
                await accept_btn.first.click()
                await page.wait_for_timeout(1000)
        except Exception:
            pass

        # Step 1: Find the service's "Book" button
        # Fresha structure: each service has a heading + "Book" button in the same container
        # Clicking the service name just expands details; we need the "Book" button
        service_booked = False

        try:
            # Find the heading for this service, then find the Book button near it
            # Use JavaScript to find the heading and traverse to the Book button
            service_booked = await page.evaluate("""(serviceName) => {
                const headings = document.querySelectorAll('h3');
                for (const h of headings) {
                    if (h.textContent.trim().toLowerCase().includes(serviceName.toLowerCase())) {
                        // Walk up to the service container (look for parent with cursor pointer)
                        let container = h.closest('[style*="cursor"], [class*="cursor"]') || h.parentElement?.parentElement?.parentElement;
                        if (container) {
                            const bookBtn = container.querySelector('button');
                            // Find specifically the "Book" button
                            const allBtns = container.querySelectorAll('button');
                            for (const btn of allBtns) {
                                if (btn.textContent.trim() === 'Book') {
                                    btn.click();
                                    return true;
                                }
                            }
                            // If no explicit "Book" button, click the first button
                            if (allBtns.length > 0) {
                                allBtns[0].click();
                                return true;
                            }
                        }
                    }
                }
                return false;
            }""", service_name)
        except Exception:
            pass

        # Fallback: try using Playwright's built-in locator for Book buttons
        if not service_booked:
            try:
                # Find the service heading and look for a sibling Book button
                heading = page.get_by_role("heading", name=service_name)
                if await heading.count() > 0:
                    # Get the parent container and find its Book button
                    container = heading.locator("xpath=ancestor::*[.//button[contains(text(),'Book')]]").first
                    book_btn = container.get_by_role("button", name="Book")
                    if await book_btn.count() > 0:
                        await book_btn.first.click()
                        service_booked = True
            except Exception:
                pass

        if not service_booked:
            result["error"] = f"Could not find service: {service_name}"
            return result

        await page.wait_for_timeout(2000)

        # Step 2-4: Navigate through the booking flow using a state machine
        # Fresha flows vary by service: some have add-ons, options, or extra screens
        # We repeatedly detect what screen we're on and take the right action
        reached_time_screen = False
        debug_path = OUTPUT_DIR / "debug"
        debug_path.mkdir(parents=True, exist_ok=True)

        for nav_step in range(8):  # Max 8 navigation steps
            await page.wait_for_timeout(1500)

            # Check: Are we on the "Select time" screen?
            time_heading = page.get_by_role("heading", name="Select time")
            if await time_heading.count() > 0:
                reached_time_screen = True
                break

            # Check: Is there a "Continue" button? (service summary, add-ons, etc.)
            try:
                continue_btn = page.get_by_role("button", name="Continue")
                if await continue_btn.count() > 0:
                    await continue_btn.first.click()
                    await page.wait_for_timeout(2000)
                    continue
            except Exception:
                pass

            # Check: Is there an "Any professional" selection?
            try:
                any_pro = page.locator('text="Any professional"')
                if await any_pro.count() > 0:
                    # Click the Select button in the Any professional row
                    # Try JavaScript to find the row and its Select button
                    clicked = await page.evaluate("""() => {
                        const items = document.querySelectorAll('*');
                        for (const item of items) {
                            if (item.textContent.includes('Any professional') &&
                                item.querySelector && item.querySelector('button')) {
                                // Find the nearest Select button
                                const btns = item.querySelectorAll('button');
                                for (const btn of btns) {
                                    if (btn.textContent.trim() === 'Select') {
                                        btn.click();
                                        return true;
                                    }
                                }
                                // Click first button as fallback
                                if (btns.length > 0) {
                                    btns[0].click();
                                    return true;
                                }
                            }
                        }
                        return false;
                    }""")
                    if clicked:
                        await page.wait_for_timeout(2500)
                        continue
                    # Fallback: try Playwright locator
                    select_btn = page.get_by_role("button", name="Select").first
                    if await select_btn.count() > 0:
                        await select_btn.click()
                        await page.wait_for_timeout(2500)
                        continue
            except Exception:
                pass

            # Check: Is there a "Skip" button? (optional add-ons)
            try:
                skip_btn = page.get_by_role("button", name="Skip")
                if await skip_btn.count() > 0:
                    await skip_btn.first.click()
                    await page.wait_for_timeout(1500)
                    continue
            except Exception:
                pass

            # Check: Is there a "Next" button?
            try:
                next_btn = page.get_by_role("button", name="Next")
                if await next_btn.count() > 0:
                    await next_btn.first.click()
                    await page.wait_for_timeout(1500)
                    continue
            except Exception:
                pass

            # Check: Are there selectable options (radio buttons, checkboxes)?
            # Some services need you to pick a variant/option before continuing
            try:
                radio_items = await page.query_selector_all('[role="radio"], [role="checkbox"], [type="radio"]')
                if len(radio_items) > 0:
                    # Click the first option to proceed
                    await radio_items[0].click()
                    await page.wait_for_timeout(1000)
                    continue
            except Exception:
                pass

            # Nothing actionable found — save debug screenshot and break
            safe_name = service_name.replace(" ", "_").replace("/", "_")[:30]
            await page.screenshot(path=str(debug_path / f"{safe_name}_step{nav_step}.png"))
            break

        if not reached_time_screen:
            # Save a final debug screenshot
            safe_name = service_name.replace(" ", "_").replace("/", "_")[:30]
            await page.screenshot(path=str(debug_path / f"{safe_name}_final.png"))
            result["error"] = "Could not reach time selection screen"
            return result

        # Step 5: Check each date for availability
        today = datetime.now()

        for day_offset in range(days_to_check):
            check_date = today + timedelta(days=day_offset)
            day_num = str(check_date.day)
            day_abbr = check_date.strftime("%a")  # Mon, Tue, etc.

            # Find and click the date button
            # Date buttons have format like "30 Mon", "31 Tue", "1 Wed" etc.
            date_label = f"{day_num} {day_abbr}"

            try:
                date_btn = page.get_by_role("button", name=date_label)
                if await date_btn.count() > 0:
                    await date_btn.first.click()
                    await page.wait_for_timeout(1500)

                    date_str = check_date.strftime("%Y-%m-%d")
                    result["days_checked"] += 1

                    # Check for "Fully booked" message
                    fully_booked = page.locator('text="Fully booked on this date"')
                    if await fully_booked.count() > 0:
                        result["dates"][date_str] = {"slots": 0, "status": "fully_booked"}
                        result["fully_booked_days"] += 1

                        # Check for "Available from" message to get next available date
                        available_from = page.locator('text=/Available from/')
                        if await available_from.count() > 0 and result["next_available"] is None:
                            text = await available_from.first.inner_text()
                            result["next_available"] = text.replace("Available from ", "")
                        continue

                    # Count available time slots (radio buttons or time text like "4:30 pm")
                    # Time slots appear as elements within a radiogroup
                    slots = await page.query_selector_all('[role="radiogroup"] [role="radio"], [role="radiogroup"] p')
                    time_slots = []
                    for slot in slots:
                        text = await slot.inner_text()
                        text = text.strip()
                        if "am" in text.lower() or "pm" in text.lower():
                            time_slots.append(text)

                    # Deduplicate
                    time_slots = list(set(time_slots))
                    slot_count = len(time_slots)

                    if slot_count == 0:
                        # Maybe the page hasn't loaded, or it's a closed day
                        # Check for any slot-like elements more broadly
                        any_slots = page.locator('[role="radiogroup"]')
                        if await any_slots.count() > 0:
                            # There's a radiogroup but no readable slots - try counting children
                            children = await any_slots.first.query_selector_all('button, [role="radio"]')
                            slot_count = len(children) // 2  # Each slot has button + radio

                    result["dates"][date_str] = {
                        "slots": slot_count,
                        "times": time_slots[:5],  # Store first 5 for reference
                        "status": "available" if slot_count > 0 else "closed_or_booked"
                    }
                    result["total_slots"] += slot_count

                    if slot_count > 0 and result["next_available"] is None:
                        result["next_available"] = date_str

            except Exception as e:
                date_str = check_date.strftime("%Y-%m-%d")
                result["dates"][date_str] = {"slots": 0, "status": "error", "error": str(e)[:100]}

    except Exception as e:
        result["error"] = str(e)[:200]

    return result


def generate_ad_recommendation(service_result, days_checked):
    """Generate ad spend recommendation based on capacity data."""
    if service_result.get("error"):
        return {"action": "REVIEW", "reason": f"Scraper error: {service_result['error']}"}

    total_slots = service_result["total_slots"]
    booked_days = service_result["fully_booked_days"]
    checked = service_result["days_checked"]

    if checked == 0:
        return {"action": "REVIEW", "reason": "No days could be checked"}

    avg_slots_per_day = total_slots / checked
    booked_pct = (booked_days / checked) * 100

    if avg_slots_per_day == 0 or booked_pct >= 90:
        return {
            "action": "PAUSE",
            "reason": f"Full capacity — {booked_pct:.0f}% of days fully booked, {avg_slots_per_day:.1f} avg slots/day",
            "severity": "critical"
        }
    elif avg_slots_per_day < CAPACITY_LIMITED or booked_pct >= 60:
        return {
            "action": "REDUCE",
            "reason": f"Limited capacity — {booked_pct:.0f}% booked, {avg_slots_per_day:.1f} avg slots/day",
            "severity": "warning"
        }
    elif avg_slots_per_day < CAPACITY_OPEN:
        return {
            "action": "MAINTAIN",
            "reason": f"Moderate capacity — {avg_slots_per_day:.1f} avg slots/day, {booked_pct:.0f}% days booked",
            "severity": "ok"
        }
    else:
        return {
            "action": "SCALE",
            "reason": f"Open capacity — {avg_slots_per_day:.1f} avg slots/day, only {booked_pct:.0f}% days booked",
            "severity": "good"
        }


async def scrape_venue(venue_key, venue_config, days_to_check=14):
    """Scrape all services for a single venue."""
    venue_name = venue_config["name"]
    venue_url = venue_config["url"]
    services = venue_config.get("services_to_check", [])

    print(f"\n{'='*60}")
    print(f"Scraping: {venue_name}")
    print(f"URL: {venue_url}")
    print(f"Services to check: {len(services)}")
    print(f"{'='*60}")

    venue_report = {
        "venue": venue_name,
        "url": venue_url,
        "scraped_at": datetime.now().isoformat(),
        "days_checked": days_to_check,
        "services": {},
        "summary": {}
    }

    if not services:
        print(f"  No services configured for {venue_name}. Skipping.")
        venue_report["summary"]["note"] = "No services configured — update config/fresha_venues.json"
        return venue_report

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()

        for service_name in services:
            print(f"\n  Checking: {service_name}...")
            result = await check_service_availability(page, venue_url, service_name, days_to_check)
            recommendation = generate_ad_recommendation(result, days_to_check)
            result["ad_recommendation"] = recommendation

            venue_report["services"][service_name] = result

            action = recommendation["action"]
            reason = recommendation["reason"]
            icon = {"PAUSE": "🔴", "REDUCE": "🟡", "MAINTAIN": "🔵", "SCALE": "🟢", "REVIEW": "⚪"}.get(action, "⚪")
            print(f"    {icon} {action}: {reason}")

            # Small delay between services to avoid rate limiting
            await page.wait_for_timeout(1000)

        await browser.close()

    # Generate venue summary
    actions = {}
    for svc, data in venue_report["services"].items():
        action = data.get("ad_recommendation", {}).get("action", "REVIEW")
        if action not in actions:
            actions[action] = []
        actions[action].append(svc)

    venue_report["summary"] = {
        "total_services": len(services),
        "by_action": actions,
        "critical_note": f"{len(actions.get('PAUSE', []))} services at full capacity" if actions.get("PAUSE") else None
    }

    return venue_report


async def main():
    # Parse args
    venue_filter = "all"
    days = 14

    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == "--venue" and i + 1 < len(args):
            venue_filter = args[i + 1]
            i += 2
        elif args[i] == "--days" and i + 1 < len(args):
            days = int(args[i + 1])
            i += 2
        else:
            i += 1

    config = load_config()
    venues = config["venues"]

    # Filter venues
    if venue_filter != "all":
        if venue_filter in venues:
            venues = {venue_filter: venues[venue_filter]}
        else:
            print(f"ERROR: Unknown venue '{venue_filter}'. Available: {', '.join(venues.keys())}")
            sys.exit(1)

    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Scrape each venue
    full_report = {
        "generated_at": datetime.now().isoformat(),
        "days_checked": days,
        "venues": {}
    }

    for venue_key, venue_config in venues.items():
        report = await scrape_venue(venue_key, venue_config, days)
        full_report["venues"][venue_key] = report

    # Generate cross-venue summary
    all_paused = []
    all_scaled = []
    for venue_key, venue_data in full_report["venues"].items():
        venue_name = venue_data["venue"]
        for svc, svc_data in venue_data.get("services", {}).items():
            action = svc_data.get("ad_recommendation", {}).get("action", "")
            if action == "PAUSE":
                all_paused.append(f"{venue_name}: {svc}")
            elif action == "SCALE":
                all_scaled.append(f"{venue_name}: {svc}")

    full_report["cross_venue_summary"] = {
        "services_to_pause_ads": all_paused,
        "services_to_scale_ads": all_scaled,
        "action_required": len(all_paused) > 0
    }

    # Save report
    with open(OUTPUT_PATH, "w") as f:
        json.dump(full_report, f, indent=2)

    print(f"\n{'='*60}")
    print(f"REPORT SAVED: {OUTPUT_PATH}")
    print(f"{'='*60}")

    # Print summary
    if all_paused:
        print(f"\n🔴 PAUSE ADS for {len(all_paused)} services (full capacity):")
        for s in all_paused:
            print(f"   - {s}")

    if all_scaled:
        print(f"\n🟢 SCALE ADS for {len(all_scaled)} services (open capacity):")
        for s in all_scaled:
            print(f"   - {s}")

    print()
    return full_report


if __name__ == "__main__":
    asyncio.run(main())
