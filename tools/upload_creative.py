"""
Upload Creative Tool
====================

Upload image or video files to Meta Ads via the Meta Ads MCP server.

Purpose:
    Upload creative assets (images or videos) to a brand's Meta ad account
    so they can be referenced in ad creatives. Returns the image_hash or
    video_id needed for creating ads.

Inputs:
    --brand         Brand ID (maps to ad account via config/brands.json)
    --file_path     Path to the image or video file to upload
    --media_type    Type of media: image or video (auto-detected from extension if omitted)

Outputs:
    JSON with image_hash (for images) or video_id (for videos)

MCP Integration:
    Uses Meta Ads MCP:
    - mcp_meta_ads_upload_ad_image for images
    - For videos, builds the upload request for the agent to execute
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
CONFIG_DIR = BASE_DIR / "config"

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"}
VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("upload_creative")


# ---------------------------------------------------------------------------
# Config loading
# ---------------------------------------------------------------------------

def load_brands_config() -> dict[str, Any]:
    """Load brands config indexed by brand_id."""
    config_path = CONFIG_DIR / "brands.json"
    with open(config_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {b["brand_id"]: b for b in data.get("brands", [])}


def get_ad_account_id(brand_id: str) -> str:
    """Get the Meta ad account ID for a brand."""
    brands = load_brands_config()
    if brand_id not in brands:
        available = ", ".join(brands.keys())
        raise ValueError(f"Brand '{brand_id}' not found. Available: {available}")

    account_id = brands[brand_id].get("meta_ad_account_id", "")
    if not account_id or account_id == "TO_BE_FILLED":
        raise ValueError(
            f"Brand '{brand_id}' has no configured meta_ad_account_id. "
            "Update config/brands.json first."
        )
    return account_id


# ---------------------------------------------------------------------------
# Media type detection
# ---------------------------------------------------------------------------

def detect_media_type(file_path: str) -> str:
    """Detect whether a file is an image or video based on extension."""
    ext = Path(file_path).suffix.lower()
    if ext in IMAGE_EXTENSIONS:
        return "image"
    elif ext in VIDEO_EXTENSIONS:
        return "video"
    else:
        raise ValueError(
            f"Unsupported file extension '{ext}'. "
            f"Images: {IMAGE_EXTENSIONS}, Videos: {VIDEO_EXTENSIONS}"
        )


# ---------------------------------------------------------------------------
# MCP request building
# ---------------------------------------------------------------------------

def build_image_upload_request(
    ad_account_id: str,
    file_path: str,
) -> dict[str, Any]:
    """
    Build the MCP tool call for uploading an image.

    Uses mcp_meta_ads_upload_ad_image.
    """
    abs_path = str(Path(file_path).resolve())

    return {
        "mcp_tool": "mcp_meta_ads_upload_ad_image",
        "params": {
            "ad_account_id": ad_account_id,
            "image_path": abs_path,
        },
        "description": f"Upload image {Path(file_path).name} to ad account {ad_account_id}",
    }


def build_video_upload_request(
    ad_account_id: str,
    file_path: str,
) -> dict[str, Any]:
    """
    Build the MCP request for uploading a video.

    Video uploads use the ad account's advideos endpoint.
    The agent handles the multipart upload via Fetch MCP.
    """
    abs_path = str(Path(file_path).resolve())
    file_size = os.path.getsize(abs_path)

    return {
        "mcp_tool": "fetch",
        "method": "POST",
        "url": f"https://graph.facebook.com/v21.0/{ad_account_id}/advideos",
        "multipart": True,
        "params": {
            "source": abs_path,
            "title": Path(file_path).stem,
        },
        "description": (
            f"Upload video {Path(file_path).name} ({file_size / 1024 / 1024:.1f} MB) "
            f"to ad account {ad_account_id}"
        ),
        "notes": "Requires META_ACCESS_TOKEN. Large videos may need chunked upload.",
    }


# ---------------------------------------------------------------------------
# Response processing
# ---------------------------------------------------------------------------

def process_image_response(raw_response: dict[str, Any]) -> dict[str, Any]:
    """Process the image upload response to extract image_hash."""
    images = raw_response.get("images", {})
    if images:
        # The response has image data keyed by filename
        for filename, img_data in images.items():
            return {
                "media_type": "image",
                "image_hash": img_data.get("hash", ""),
                "image_url": img_data.get("url", ""),
                "filename": filename,
                "status": "uploaded",
            }

    # Alternative response format
    image_hash = raw_response.get("hash") or raw_response.get("image_hash")
    if image_hash:
        return {
            "media_type": "image",
            "image_hash": image_hash,
            "status": "uploaded",
        }

    logger.warning("Could not extract image_hash from response: %s", raw_response)
    return {
        "media_type": "image",
        "image_hash": None,
        "status": "unknown",
        "raw_response": raw_response,
    }


def process_video_response(raw_response: dict[str, Any]) -> dict[str, Any]:
    """Process the video upload response to extract video_id."""
    video_id = raw_response.get("id") or raw_response.get("video_id")
    return {
        "media_type": "video",
        "video_id": video_id,
        "status": "uploaded" if video_id else "unknown",
        "raw_response": raw_response if not video_id else None,
    }


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------

def upload_creative(
    brand: str,
    file_path: str,
    media_type: Optional[str] = None,
) -> dict[str, Any]:
    """
    Build the upload request for a creative asset.

    Returns the MCP request dict for the agent to execute.
    """
    # Validate file exists
    file_p = Path(file_path)
    if not file_p.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    # Detect or validate media type
    detected_type = detect_media_type(file_path)
    resolved_type = media_type or detected_type

    if media_type and media_type != detected_type:
        logger.warning(
            "Specified media_type '%s' differs from detected '%s'. Using specified.",
            media_type,
            detected_type,
        )

    # Get ad account
    ad_account_id = get_ad_account_id(brand)

    # Build the appropriate request
    if resolved_type == "image":
        request = build_image_upload_request(ad_account_id, file_path)
    elif resolved_type == "video":
        request = build_video_upload_request(ad_account_id, file_path)
    else:
        raise ValueError(f"Unsupported media type: {resolved_type}")

    result = {
        "metadata": {
            "tool": "upload_creative",
            "brand": brand,
            "ad_account_id": ad_account_id,
            "file_path": str(file_p.resolve()),
            "file_name": file_p.name,
            "media_type": resolved_type,
            "file_size_bytes": os.path.getsize(file_path),
            "generated_at": datetime.utcnow().isoformat() + "Z",
        },
        "request": request,
    }

    return result


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Upload creative assets to Meta Ads.",
    )
    parser.add_argument("--brand", type=str, required=True, help="Brand ID")
    parser.add_argument("--file_path", type=str, required=True, help="Path to image or video file")
    parser.add_argument(
        "--media_type",
        type=str,
        default=None,
        choices=["image", "video"],
        help="Media type (auto-detected if omitted)",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> None:
    args = parse_args(argv)

    try:
        result = upload_creative(
            brand=args.brand,
            file_path=args.file_path,
            media_type=args.media_type,
        )

        print(json.dumps(result, indent=2))
        logger.info("Upload request built for %s (%s)", args.file_path, result["metadata"]["media_type"])

    except (FileNotFoundError, ValueError) as exc:
        logger.error("Error: %s", exc)
        sys.exit(1)
    except Exception as exc:
        logger.exception("Unexpected error: %s", exc)
        sys.exit(2)


if __name__ == "__main__":
    main()
