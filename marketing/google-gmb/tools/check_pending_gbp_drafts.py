#!/usr/bin/env python3
"""
Check for pending GBP post drafts that need review and publishing.
Run at session start to detect auto-generated drafts.

Usage:
    python marketing/google-gmb/tools/check_pending_gbp_drafts.py

Output:
    Prints summary of pending drafts, one section per brand.
    Exit code 0 if no drafts pending, exit code 1 if drafts found.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DRAFTS_DIR = BASE_DIR / ".tmp" / "gbp" / "drafts"


def get_pending_drafts() -> list[dict]:
    """
    Scan the drafts directory for pending GBP post JSON files.

    Returns a list of dicts with file info and post metadata.
    """
    if not DRAFTS_DIR.exists():
        return []

    drafts = []
    for f in sorted(DRAFTS_DIR.iterdir()):
        if not f.name.endswith(".json") or f.name.startswith("."):
            continue

        try:
            with open(f, "r", encoding="utf-8") as fh:
                data = json.load(fh)
        except (json.JSONDecodeError, IOError):
            # Corrupted file — report it but don't crash
            drafts.append({
                "file": f.name,
                "path": str(f),
                "error": "Could not parse JSON",
                "brand": "unknown",
                "num_posts": 0,
                "generated_at": None,
            })
            continue

        metadata = data.get("metadata", {})
        posts = data.get("posts", [])

        # Extract post types summary
        post_types = {}
        for post in posts:
            pt = post.get("post_type", "unknown")
            post_types[pt] = post_types.get(pt, 0) + 1

        drafts.append({
            "file": f.name,
            "path": str(f),
            "brand": metadata.get("brand", "unknown"),
            "num_posts": len(posts),
            "post_types": post_types,
            "generated_at": metadata.get("generated_at"),
            "status": metadata.get("status", "draft_pending_review"),
        })

    return drafts


def format_summary(drafts: list[dict]) -> str:
    """Format a human-readable summary of pending drafts."""
    lines = []

    total_posts = sum(d["num_posts"] for d in drafts)
    brands = sorted(set(d["brand"] for d in drafts))
    dates = sorted(set(d["generated_at"][:10] for d in drafts if d.get("generated_at")))

    lines.append(f"Found {len(drafts)} draft file(s) with {total_posts} total post(s):")
    lines.append(f"  Brands: {', '.join(brands)}")
    if dates:
        lines.append(f"  Generated on: {', '.join(dates)}")
    lines.append("")

    for draft in drafts:
        if draft.get("error"):
            lines.append(f"  [ERROR] {draft['file']}: {draft['error']}")
            continue

        type_summary = ", ".join(
            f"{count} {ptype}" for ptype, count in draft.get("post_types", {}).items()
        )
        lines.append(f"  - {draft['file']}")
        lines.append(f"    Brand: {draft['brand']} | Posts: {draft['num_posts']} ({type_summary})")
        if draft.get("generated_at"):
            lines.append(f"    Generated: {draft['generated_at']}")
        lines.append(f"    Status: {draft.get('status', 'draft')}")

    lines.append("")
    lines.append("Run workflow 12 (GBP Posting) to review and publish these drafts.")

    return "\n".join(lines)


if __name__ == "__main__":
    drafts = get_pending_drafts()

    if drafts:
        print(format_summary(drafts))
        sys.exit(1)
    else:
        print("No pending GBP drafts found.")
        sys.exit(0)
