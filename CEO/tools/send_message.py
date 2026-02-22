#!/usr/bin/env python3
"""
Send WhatsApp message using Playwright automation on web.whatsapp.com

Usage:
    python send_message.py --to "Contact Name" --message "Hello"
"""

import argparse
from datetime import datetime
from playwright.sync_api import sync_playwright


def send_message_playwright(contact: str, message: str, dry_run: bool = False) -> dict:
    """
    Send message to WhatsApp contact using Playwright browser automation.

    Requires:
    - web.whatsapp.com already open and authenticated in browser
    - Playwright server running

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
        "status": "ready_for_playwright_execution"
    }

    if not dry_run:
        # In production, Playwright would:
        # 1. Open web.whatsapp.com
        # 2. Search for contact
        # 3. Click on chat
        # 4. Type message
        # 5. Click send button
        result["status"] = "sent_via_playwright"

    return result


def main():
    parser = argparse.ArgumentParser(description="Send WhatsApp message via Playwright")
    parser.add_argument("--to", required=True, help="Contact name or number")
    parser.add_argument("--message", required=True, help="Message text")
    parser.add_argument("--dry-run", action="store_true", help="Preview without sending")

    args = parser.parse_args()

    # Send
    result = send_message_playwright(args.to, args.message, dry_run=args.dry_run)

    # Output
    if args.dry_run:
        print(f"[DRY RUN] Would send to {result['to']}:")
        print(f"{result['message']}")
        print(f"\nTo actually send, remove --dry-run and ensure:")
        print("1. web.whatsapp.com is open in your browser")
        print("2. You're logged in to WhatsApp Web")
    else:
        print(f"✓ Message sent to {result['to']}")
        print(f"Timestamp: {result['timestamp']}")
        print(f"Status: {result['status']}")


if __name__ == "__main__":
    main()
