#!/usr/bin/env python3
"""
Publish organic posts to Facebook Pages and Instagram Business accounts.

Usage:
    python tools/publish_organic_post.py \
        --brand carisma_spa \
        --platform instagram \
        --type image \
        --caption "Your caption here" \
        --image-url "https://example.com/image.jpg"

    python tools/publish_organic_post.py \
        --brand carisma_slimming \
        --platform facebook \
        --type text \
        --caption "Your caption here"

Supports:
    - Facebook Page text posts
    - Facebook Page photo posts
    - Facebook Page video posts (Reels)
    - Instagram photo posts (via Content Publishing API)
    - Instagram carousel posts
    - Instagram Reels

Requires META_ACCESS_TOKEN env var (same token as meta-ads MCP).
"""
import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.parse
import urllib.error

GRAPH_API_VERSION = "v21.0"
GRAPH_API_BASE = f"https://graph.facebook.com/{GRAPH_API_VERSION}"

BRAND_CONFIG_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "config", "brands.json"
)


def load_brand_config(brand_id: str) -> dict:
    with open(BRAND_CONFIG_PATH) as f:
        data = json.load(f)
    for brand in data["brands"]:
        if brand["brand_id"] == brand_id:
            return brand
    raise ValueError(f"Brand '{brand_id}' not found in brands.json")


def graph_api_post(endpoint: str, params: dict) -> dict:
    """POST to Meta Graph API."""
    token = os.environ.get("META_ACCESS_TOKEN")
    if not token:
        print("ERROR: META_ACCESS_TOKEN environment variable not set", file=sys.stderr)
        sys.exit(1)

    params["access_token"] = token
    data = urllib.parse.urlencode(params).encode("utf-8")
    url = f"{GRAPH_API_BASE}/{endpoint}"

    req = urllib.request.Request(url, data=data, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"ERROR: Graph API returned {e.code}: {error_body}", file=sys.stderr)
        sys.exit(1)


def publish_facebook_text(page_id: str, caption: str) -> dict:
    """Publish a text post to a Facebook Page."""
    return graph_api_post(f"{page_id}/feed", {"message": caption})


def publish_facebook_photo(page_id: str, caption: str, image_url: str) -> dict:
    """Publish a photo post to a Facebook Page."""
    return graph_api_post(f"{page_id}/photos", {
        "message": caption,
        "url": image_url,
    })


def publish_facebook_video(page_id: str, caption: str, video_url: str) -> dict:
    """Publish a video/Reel to a Facebook Page."""
    return graph_api_post(f"{page_id}/videos", {
        "description": caption,
        "file_url": video_url,
    })


def publish_instagram_photo(ig_account_id: str, caption: str, image_url: str) -> dict:
    """Publish a photo to Instagram via Content Publishing API (2-step)."""
    # Step 1: Create media container
    container = graph_api_post(f"{ig_account_id}/media", {
        "image_url": image_url,
        "caption": caption,
    })
    container_id = container["id"]
    print(f"Created IG media container: {container_id}")

    # Step 2: Publish the container
    result = graph_api_post(f"{ig_account_id}/media_publish", {
        "creation_id": container_id,
    })
    return result


def publish_instagram_reel(ig_account_id: str, caption: str, video_url: str) -> dict:
    """Publish a Reel to Instagram via Content Publishing API (2-step)."""
    # Step 1: Create video container
    container = graph_api_post(f"{ig_account_id}/media", {
        "video_url": video_url,
        "caption": caption,
        "media_type": "REELS",
    })
    container_id = container["id"]
    print(f"Created IG Reel container: {container_id}")

    # Step 2: Wait for processing, then publish
    time.sleep(10)

    result = graph_api_post(f"{ig_account_id}/media_publish", {
        "creation_id": container_id,
    })
    return result


def publish_instagram_carousel(ig_account_id: str, caption: str, image_urls: list) -> dict:
    """Publish a carousel to Instagram (multi-step)."""
    # Step 1: Create individual item containers
    children_ids = []
    for url in image_urls:
        child = graph_api_post(f"{ig_account_id}/media", {
            "image_url": url,
            "is_carousel_item": "true",
        })
        children_ids.append(child["id"])
        print(f"Created carousel item: {child['id']}")

    # Step 2: Create carousel container
    container = graph_api_post(f"{ig_account_id}/media", {
        "caption": caption,
        "media_type": "CAROUSEL",
        "children": ",".join(children_ids),
    })
    container_id = container["id"]
    print(f"Created carousel container: {container_id}")

    # Step 3: Publish
    result = graph_api_post(f"{ig_account_id}/media_publish", {
        "creation_id": container_id,
    })
    return result


def main():
    parser = argparse.ArgumentParser(description="Publish organic social media posts")
    parser.add_argument("--brand", required=True, choices=["carisma_spa", "carisma_aesthetics", "carisma_slimming"])
    parser.add_argument("--platform", required=True, choices=["facebook", "instagram"])
    parser.add_argument("--type", required=True, choices=["text", "image", "video", "reel", "carousel"])
    parser.add_argument("--caption", required=True)
    parser.add_argument("--image-url", help="URL of image to post")
    parser.add_argument("--video-url", help="URL of video to post")
    parser.add_argument("--image-urls", nargs="+", help="URLs for carousel images")
    parser.add_argument("--dry-run", action="store_true", help="Print what would be posted without publishing")

    args = parser.parse_args()
    brand = load_brand_config(args.brand)
    page_id = brand["meta_page_id"]
    ig_account_id = brand.get("instagram_account_id", "TO_BE_FILLED")

    if args.dry_run:
        print(json.dumps({
            "brand": args.brand,
            "platform": args.platform,
            "type": args.type,
            "page_id": page_id,
            "ig_account_id": ig_account_id,
            "caption": args.caption[:100] + "..." if len(args.caption) > 100 else args.caption,
            "image_url": args.image_url,
            "video_url": args.video_url,
        }, indent=2))
        print("\nDRY RUN — nothing published.")
        return

    if ig_account_id == "TO_BE_FILLED" and args.platform == "instagram":
        print(f"ERROR: Instagram account ID not configured for {args.brand}. Update config/brands.json.", file=sys.stderr)
        sys.exit(1)

    # Route to the correct publishing function
    if args.platform == "facebook":
        if args.type == "text":
            result = publish_facebook_text(page_id, args.caption)
        elif args.type in ("image", "carousel"):
            if not args.image_url:
                print("ERROR: --image-url required for image posts", file=sys.stderr)
                sys.exit(1)
            result = publish_facebook_photo(page_id, args.caption, args.image_url)
        elif args.type in ("video", "reel"):
            if not args.video_url:
                print("ERROR: --video-url required for video posts", file=sys.stderr)
                sys.exit(1)
            result = publish_facebook_video(page_id, args.caption, args.video_url)
        else:
            print(f"ERROR: Unsupported type '{args.type}' for Facebook", file=sys.stderr)
            sys.exit(1)
    elif args.platform == "instagram":
        if args.type == "image":
            if not args.image_url:
                print("ERROR: --image-url required for IG image posts", file=sys.stderr)
                sys.exit(1)
            result = publish_instagram_photo(ig_account_id, args.caption, args.image_url)
        elif args.type == "reel":
            if not args.video_url:
                print("ERROR: --video-url required for IG Reels", file=sys.stderr)
                sys.exit(1)
            result = publish_instagram_reel(ig_account_id, args.caption, args.video_url)
        elif args.type == "carousel":
            if not args.image_urls or len(args.image_urls) < 2:
                print("ERROR: --image-urls requires 2+ URLs for carousel", file=sys.stderr)
                sys.exit(1)
            result = publish_instagram_carousel(ig_account_id, args.caption, args.image_urls)
        else:
            print(f"ERROR: Unsupported type '{args.type}' for Instagram", file=sys.stderr)
            sys.exit(1)

    print(json.dumps(result, indent=2))
    print(f"\nPost published successfully to {args.platform} for {args.brand}.")


if __name__ == "__main__":
    main()
