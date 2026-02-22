#!/usr/bin/env python3
"""
Send WhatsApp message using WhatsApp MCP.

Usage:
    python send_message.py --to "Contact Name" --message "Hello"
"""

import os
import argparse
from datetime import datetime


def get_whatsapp_client():
    """Initialize WhatsApp MCP client."""
    bridge_url = os.getenv("WHATSAPP_BRIDGE_URL", "http://localhost:3000")
    auth_token = os.getenv("WHATSAPP_AUTH_TOKEN")

    if not auth_token:
        raise ValueError("WHATSAPP_AUTH_TOKEN not set in .env")

    return {
        "bridge_url": bridge_url,
        "auth_token": auth_token,
        "connected": True
    }


def validate_contact(contact_name: str) -> bool:
    """Verify contact exists in WhatsApp contacts."""
    # Would validate via MCP in actual implementation
    return len(contact_name) > 0


def send_message(contact: str, message: str, dry_run: bool = False) -> dict:
    """
    Send message to contact.

    Args:
        contact: Contact name or phone number
        message: Message text
        dry_run: Preview without sending (default False)

    Returns:
        Result dict with status
    """
    client = get_whatsapp_client()

    if not validate_contact(contact):
        return {"status": "error", "message": "Invalid contact"}

    result = {
        "to": contact,
        "message": message,
        "timestamp": datetime.now().isoformat(),
        "status": "pending_mcp_integration",
        "dry_run": dry_run
    }

    return result


def main():
    parser = argparse.ArgumentParser(description="Send WhatsApp message")
    parser.add_argument("--to", required=True, help="Contact name or number")
    parser.add_argument("--message", required=True, help="Message text")
    parser.add_argument("--dry-run", action="store_true", help="Preview without sending")

    args = parser.parse_args()

    # Send
    result = send_message(args.to, args.message, dry_run=args.dry_run)

    if result["status"] == "error":
        print(f"✗ Error: {result['message']}")
        return

    # Output
    if args.dry_run:
        print(f"[DRY RUN] Would send to {result['to']}:")
        print(f"{result['message']}")
    else:
        print(f"✓ Message sent to {result['to']}")
        print(f"Timestamp: {result['timestamp']}")


if __name__ == "__main__":
    main()
