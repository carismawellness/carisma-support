"""
Render Video Tool
=================

Trigger video rendering via the Creatomate API.

Purpose:
    Submit a render job to Creatomate with a template ID and dynamic
    modifications (text overlays, images, colours). Poll for completion
    and record the output URL for download.

Inputs:
    --template_id       Creatomate template ID
    --modifications     JSON string or path to JSON file with modification key-value pairs
    --output_dir        Directory for downloaded renders (default: .tmp/creatives)
    --wait              Whether to emit poll instructions (default: true)

Outputs:
    - Rendered video file in output_dir (agent downloads via Fetch MCP)
    - Render metadata JSON at .tmp/creatives/render_{template_id}_{date}.json

MCP Integration:
    Uses Fetch MCP to call POST https://api.creatomate.com/v1/renders
    and GET for polling status. The agent executes the actual HTTP calls.
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
TMP_DIR = BASE_DIR / ".tmp" / "creatives"
CREATOMATE_API_URL = "https://api.creatomate.com/v1/renders"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("render_video")


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

def load_api_key() -> str:
    """Load Creatomate API key from environment."""
    key = os.environ.get("CREATOMATE_API_KEY", "")
    if not key:
        logger.warning(
            "CREATOMATE_API_KEY not set. The Fetch MCP will need it as a Bearer token."
        )
    return key


# ---------------------------------------------------------------------------
# Request building
# ---------------------------------------------------------------------------

def parse_modifications(modifications_input: str) -> dict[str, Any]:
    """
    Parse modifications from a JSON string or file path.

    Accepts either:
    - A JSON string: '{"text_1": "Hello", "image_1": "https://..."}'
    - A file path pointing to a JSON file
    """
    # Try as file path first
    mod_path = Path(modifications_input)
    if mod_path.exists() and mod_path.is_file():
        with open(mod_path, "r", encoding="utf-8") as f:
            return json.load(f)

    # Try as JSON string
    try:
        return json.loads(modifications_input)
    except json.JSONDecodeError:
        raise ValueError(
            f"Could not parse modifications as JSON string or file path: "
            f"{modifications_input[:100]}"
        )


def build_render_request(
    template_id: str,
    modifications: dict[str, Any],
) -> dict[str, Any]:
    """
    Build the Fetch MCP instruction for submitting a Creatomate render.

    Returns a dict the agent can use to make the POST request.
    """
    api_key = load_api_key()

    # Creatomate API payload
    payload = {
        "template_id": template_id,
        "modifications": modifications,
    }

    request = {
        "mcp_tool": "fetch",
        "method": "POST",
        "url": CREATOMATE_API_URL,
        "headers": {
            "Authorization": f"Bearer {api_key}" if api_key else "Bearer <CREATOMATE_API_KEY>",
            "Content-Type": "application/json",
        },
        "body": json.dumps(payload),
        "description": f"Submit Creatomate render for template {template_id}",
    }

    return request


def build_poll_request(render_id: str) -> dict[str, Any]:
    """
    Build a Fetch MCP instruction to poll render status.

    The agent should call this repeatedly until status is 'succeeded' or 'failed'.
    """
    api_key = load_api_key()
    url = f"{CREATOMATE_API_URL}/{render_id}"

    return {
        "mcp_tool": "fetch",
        "method": "GET",
        "url": url,
        "headers": {
            "Authorization": f"Bearer {api_key}" if api_key else "Bearer <CREATOMATE_API_KEY>",
        },
        "description": f"Poll Creatomate render status for {render_id}",
        "polling": {
            "check_field": "status",
            "success_value": "succeeded",
            "failure_value": "failed",
            "interval_seconds": 5,
            "max_attempts": 60,
        },
    }


def build_download_request(download_url: str, output_path: str) -> dict[str, Any]:
    """Build a Fetch MCP instruction to download the rendered video."""
    return {
        "mcp_tool": "fetch",
        "method": "GET",
        "url": download_url,
        "save_to": output_path,
        "description": f"Download rendered video to {output_path}",
    }


# ---------------------------------------------------------------------------
# Response processing
# ---------------------------------------------------------------------------

def process_render_response(raw_response: Any) -> dict[str, Any]:
    """
    Process the Creatomate render submission response.

    Returns render metadata including render_id for polling.
    """
    # Creatomate returns a list of renders
    renders = raw_response if isinstance(raw_response, list) else [raw_response]

    if not renders:
        raise ValueError("Empty response from Creatomate API.")

    render = renders[0]
    return {
        "render_id": render.get("id", ""),
        "status": render.get("status", "unknown"),
        "template_id": render.get("template_id", ""),
        "url": render.get("url"),
        "snapshot_url": render.get("snapshot_url"),
        "created_at": render.get("created_at", ""),
    }


def process_poll_response(raw_response: dict[str, Any]) -> dict[str, Any]:
    """Process a poll response to check render status."""
    return {
        "render_id": raw_response.get("id", ""),
        "status": raw_response.get("status", "unknown"),
        "url": raw_response.get("url"),
        "snapshot_url": raw_response.get("snapshot_url"),
        "file_size": raw_response.get("file_size"),
        "width": raw_response.get("width"),
        "height": raw_response.get("height"),
        "duration": raw_response.get("duration"),
        "completed": raw_response.get("status") in ("succeeded", "failed"),
        "succeeded": raw_response.get("status") == "succeeded",
    }


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------

def render_video(
    template_id: str,
    modifications: dict[str, Any],
    output_dir: Optional[str] = None,
) -> dict[str, Any]:
    """
    Orchestrate a video render via Creatomate.

    Emits the Fetch MCP instructions for the agent to execute:
    1. POST to submit render
    2. GET to poll status
    3. GET to download file

    Returns the complete instruction set.
    """
    out_dir = Path(output_dir) if output_dir else TMP_DIR
    out_dir.mkdir(parents=True, exist_ok=True)

    date_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_filename = f"render_{template_id}_{date_str}.mp4"
    output_path = str(out_dir / output_filename)

    # Build instruction pipeline
    submit_request = build_render_request(template_id, modifications)

    result = {
        "metadata": {
            "tool": "render_video",
            "template_id": template_id,
            "modifications": modifications,
            "output_dir": str(out_dir),
            "expected_output": output_path,
            "generated_at": datetime.utcnow().isoformat() + "Z",
        },
        "instructions": {
            "step_1_submit": submit_request,
            "step_2_poll": {
                "description": "After receiving render_id from step 1, call build_poll_request(render_id)",
                "function": "build_poll_request",
            },
            "step_3_download": {
                "description": "After render succeeds, call build_download_request(url, output_path)",
                "function": "build_download_request",
                "output_path": output_path,
            },
        },
    }

    return result


def save_metadata(data: dict[str, Any], template_id: str) -> Path:
    """Save render metadata to JSON."""
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d")
    filename = f"render_{template_id}_{date_str}.json"
    output_path = TMP_DIR / filename

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    logger.info("Render metadata saved to %s", output_path)
    return output_path


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Trigger Creatomate video render.",
    )
    parser.add_argument(
        "--template_id",
        type=str,
        required=True,
        help="Creatomate template ID",
    )
    parser.add_argument(
        "--modifications",
        type=str,
        required=True,
        help="JSON string or path to JSON file with modifications",
    )
    parser.add_argument(
        "--output_dir",
        type=str,
        default=None,
        help="Output directory for renders (default: .tmp/creatives)",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> None:
    args = parse_args(argv)

    try:
        modifications = parse_modifications(args.modifications)

        result = render_video(
            template_id=args.template_id,
            modifications=modifications,
            output_dir=args.output_dir,
        )

        meta_path = save_metadata(result, args.template_id)
        print(json.dumps(result, indent=2))
        logger.info("Render instructions emitted. Metadata: %s", meta_path)

    except ValueError as exc:
        logger.error("Validation error: %s", exc)
        sys.exit(1)
    except Exception as exc:
        logger.exception("Unexpected error: %s", exc)
        sys.exit(2)


if __name__ == "__main__":
    main()
