#!/usr/bin/env python3
"""
Send WhatsApp message using Playwright automation on web.whatsapp.com

Usage:
    python send_message.py --to "Contact Name" --message "Hello"
    python send_message.py --to "Contact Name" --message "Hello" --dry-run
"""

import argparse
import time
from datetime import datetime
from playwright.sync_api import sync_playwright


def send_message_via_whatsapp(contact: str, message: str, dry_run: bool = False) -> dict:
    """
    Send message to WhatsApp contact using Playwright browser automation.

    Opens web.whatsapp.com, searches for contact, and sends message.

    Args:
        contact: Contact name or phone number
        message: Message text
        dry_run: Preview without sending (default False)

    Returns:
        Result dict with status
    """
    result = {
        "to": contact,
        "message": message,
        "timestamp": datetime.now().isoformat(),
        "dry_run": dry_run,
        "status": "pending"
    }

    if dry_run:
        result["status"] = "preview_mode"
        return result

    try:
        with sync_playwright() as p:
            # Launch browser
            browser = p.chromium.launch(headless=False)  # Show browser window
            page = browser.new_page()

            # Navigate to WhatsApp Web
            print(f"Opening web.whatsapp.com...")
            page.goto("https://web.whatsapp.com", timeout=60000)

            # Wait for user to scan QR code if needed
            print("Waiting for WhatsApp to load (if you need to scan QR code, do it now)...")
            page.wait_for_selector("//div[@data-testid='conversation-panel-messages']", timeout=30000)

            # Search for contact
            print(f"Searching for {contact}...")
            search_box = page.locator("//input[@placeholder='Search or start a new chat']")
            search_box.click()
            search_box.type(contact, delay=50)

            # Wait for search results and click the contact
            time.sleep(1)
            contact_element = page.locator(f"//span[contains(text(), '{contact}')]").first
            contact_element.click()

            # Wait for chat to open
            time.sleep(1)

            # Find and click the message input field
            message_input = page.locator("//div[@data-testid='compose-box-input']")
            message_input.click()

            # Type the message
            print(f"Typing message...")
            message_input.type(message, delay=20)

            # Send message
            print(f"Sending message...")
            send_button = page.locator("//button[@data-testid='sendBtn']")
            send_button.click()

            # Wait for message to be sent
            time.sleep(2)

            result["status"] = "sent"
            print(f"✓ Message sent to {contact}")

            # Close browser
            browser.close()

    except Exception as e:
        result["status"] = f"error: {str(e)}"
        print(f"✗ Error sending message: {e}")
        return result

    return result


def main():
    parser = argparse.ArgumentParser(description="Send WhatsApp message via Playwright")
    parser.add_argument("--to", required=True, help="Contact name or number")
    parser.add_argument("--message", required=True, help="Message text")
    parser.add_argument("--dry-run", action="store_true", help="Preview without sending")

    args = parser.parse_args()

    if args.dry_run:
        # Preview mode
        print(f"[DRY RUN] Would send to {args.to}:")
        print(f"{args.message}")
        print(f"\nTo actually send, remove --dry-run and ensure:")
        print("1. Your computer has a display (headless mode won't work)")
        print("2. Playwright will open browser automatically")
        return

    # Send the message
    print(f"\nSending message to {args.to}...")
    result = send_message_via_whatsapp(args.to, args.message, dry_run=False)

    # Print result
    if result["status"] == "sent":
        print(f"✓ Success!")
        print(f"Recipient: {result['to']}")
        print(f"Message: {result['message']}")
        print(f"Sent: {result['timestamp']}")
    else:
        print(f"Status: {result['status']}")


if __name__ == "__main__":
    main()
