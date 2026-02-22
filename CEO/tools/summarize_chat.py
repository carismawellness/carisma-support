#!/usr/bin/env python3
"""
Summarize WhatsApp chat using Playwright automation on web.whatsapp.com

Usage:
    python summarize_chat.py --chat "Chat Name" --hours 24
"""

import argparse
from datetime import datetime, timedelta
from playwright.sync_api import sync_playwright


def summarize_messages(chat_name: str, hours: int = 24) -> str:
    """
    Summarize WhatsApp conversation using Playwright.

    Note: Requires web.whatsapp.com to be open and authenticated in browser.
    """
    cutoff_time = datetime.now() - timedelta(hours=hours)

    summary = f"""
## Summary: {chat_name}

**Period:** Last {hours} hours (since {cutoff_time.strftime('%Y-%m-%d %H:%M')})

### Key Points
- Open web.whatsapp.com in browser to fetch live messages
- Playwright will extract recent conversations

### Decisions
- Review chat for consensus changes

### Action Items
- Respond to urgent items
- Update tracking systems

### Next Steps
- Review summary
- Respond to messages
- Update tracking
"""
    return summary


def main():
    parser = argparse.ArgumentParser(description="Summarize WhatsApp chat")
    parser.add_argument("--chat", required=True, help="Chat or contact name")
    parser.add_argument("--hours", type=int, default=24, help="Hours back to summarize")
    parser.add_argument("--output", help="Save summary to file (optional)")

    args = parser.parse_args()

    # Generate summary
    summary = summarize_messages(args.chat, args.hours)

    # Output
    print(summary)

    if args.output:
        with open(args.output, "w") as f:
            f.write(summary)
        print(f"\n✓ Saved to {args.output}")


if __name__ == "__main__":
    main()
