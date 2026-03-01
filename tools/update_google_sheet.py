"""
Update Google Sheet Tool
========================

Write data to Google Sheets via the Google Sheets MCP server.

Purpose:
    Append rows or update specific ranges in a Google Sheet. Used for
    logging campaign data, performance reports, and creative tracking.

Inputs:
    --spreadsheet_id    Google Sheets spreadsheet ID
    --sheet_name        Sheet/tab name within the spreadsheet
    --data              JSON string or file path with 2D array of values
    --mode              Write mode: append (add rows) or update (overwrite range)
    --range             Cell range for update mode (e.g. "A1:F10")
    --value_input       How to interpret values: RAW or USER_ENTERED (default: USER_ENTERED)

Outputs:
    JSON confirmation with rows written and updated range

MCP Integration:
    Uses Google Sheets MCP for the actual API calls.
"""

import argparse
import json
import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("update_google_sheet")


# ---------------------------------------------------------------------------
# Data parsing
# ---------------------------------------------------------------------------

def parse_data(data_input: str) -> list[list[Any]]:
    """
    Parse data from a JSON string or file path.

    Expects a 2D array (list of lists), where each inner list is a row.
    """
    # Try as file path
    data_path = Path(data_input)
    if data_path.exists() and data_path.is_file():
        with open(data_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        # Try as JSON string
        try:
            data = json.loads(data_input)
        except json.JSONDecodeError:
            raise ValueError(
                f"Could not parse data as JSON string or file path: {data_input[:100]}"
            )

    # Validate structure
    if not isinstance(data, list):
        raise ValueError("Data must be a 2D array (list of lists).")

    for i, row in enumerate(data):
        if not isinstance(row, list):
            raise ValueError(f"Row {i} is not a list. Data must be a 2D array.")

    return data


# ---------------------------------------------------------------------------
# MCP request building
# ---------------------------------------------------------------------------

def build_append_request(
    spreadsheet_id: str,
    sheet_name: str,
    data: list[list[Any]],
    value_input: str = "USER_ENTERED",
) -> dict[str, Any]:
    """Build the Google Sheets MCP request for appending rows."""
    return {
        "mcp_tool": "google_sheets_append",
        "params": {
            "spreadsheet_id": spreadsheet_id,
            "range": f"{sheet_name}!A1",
            "values": data,
            "value_input_option": value_input,
            "insert_data_option": "INSERT_ROWS",
        },
        "description": f"Append {len(data)} rows to {sheet_name}",
    }


def build_update_request(
    spreadsheet_id: str,
    sheet_name: str,
    data: list[list[Any]],
    cell_range: str,
    value_input: str = "USER_ENTERED",
) -> dict[str, Any]:
    """Build the Google Sheets MCP request for updating a range."""
    # Prepend sheet name if not already included
    full_range = cell_range
    if "!" not in cell_range:
        full_range = f"{sheet_name}!{cell_range}"

    return {
        "mcp_tool": "google_sheets_update",
        "params": {
            "spreadsheet_id": spreadsheet_id,
            "range": full_range,
            "values": data,
            "value_input_option": value_input,
        },
        "description": f"Update {full_range} with {len(data)} rows",
    }


# ---------------------------------------------------------------------------
# Response processing
# ---------------------------------------------------------------------------

def process_append_response(raw_response: dict[str, Any]) -> dict[str, Any]:
    """Process Google Sheets append response."""
    updates = raw_response.get("updates", {})
    return {
        "mode": "append",
        "spreadsheet_id": updates.get("spreadsheetId", ""),
        "updated_range": updates.get("updatedRange", ""),
        "updated_rows": updates.get("updatedRows", 0),
        "updated_cells": updates.get("updatedCells", 0),
        "status": "success",
    }


def process_update_response(raw_response: dict[str, Any]) -> dict[str, Any]:
    """Process Google Sheets update response."""
    return {
        "mode": "update",
        "spreadsheet_id": raw_response.get("spreadsheetId", ""),
        "updated_range": raw_response.get("updatedRange", ""),
        "updated_rows": raw_response.get("updatedRows", 0),
        "updated_cells": raw_response.get("updatedCells", 0),
        "status": "success",
    }


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------

def update_google_sheet(
    spreadsheet_id: str,
    sheet_name: str,
    data: list[list[Any]],
    mode: str = "append",
    cell_range: Optional[str] = None,
    value_input: str = "USER_ENTERED",
) -> dict[str, Any]:
    """
    Build the Google Sheets write request.

    Returns the MCP request dict for the agent to execute.
    """
    if not data:
        raise ValueError("Data cannot be empty.")

    if mode == "update" and not cell_range:
        raise ValueError("Range is required for update mode.")

    if mode == "append":
        request = build_append_request(spreadsheet_id, sheet_name, data, value_input)
    elif mode == "update":
        request = build_update_request(
            spreadsheet_id, sheet_name, data, cell_range or "", value_input
        )
    else:
        raise ValueError(f"Invalid mode '{mode}'. Use 'append' or 'update'.")

    result = {
        "metadata": {
            "tool": "update_google_sheet",
            "spreadsheet_id": spreadsheet_id,
            "sheet_name": sheet_name,
            "mode": mode,
            "rows": len(data),
            "columns": max(len(row) for row in data) if data else 0,
            "range": cell_range,
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
        description="Write data to Google Sheets.",
    )
    parser.add_argument("--spreadsheet_id", type=str, required=True, help="Spreadsheet ID")
    parser.add_argument("--sheet_name", type=str, required=True, help="Sheet/tab name")
    parser.add_argument(
        "--data",
        type=str,
        required=True,
        help="JSON 2D array (string or file path)",
    )
    parser.add_argument(
        "--mode",
        type=str,
        default="append",
        choices=["append", "update"],
        help="Write mode: append or update (default: append)",
    )
    parser.add_argument(
        "--range",
        type=str,
        default=None,
        help="Cell range for update mode (e.g. A1:F10)",
    )
    parser.add_argument(
        "--value_input",
        type=str,
        default="USER_ENTERED",
        choices=["RAW", "USER_ENTERED"],
        help="Value input option (default: USER_ENTERED)",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> None:
    args = parse_args(argv)

    try:
        data = parse_data(args.data)

        result = update_google_sheet(
            spreadsheet_id=args.spreadsheet_id,
            sheet_name=args.sheet_name,
            data=data,
            mode=args.mode,
            cell_range=args.range,
            value_input=args.value_input,
        )

        print(json.dumps(result, indent=2))
        logger.info(
            "Google Sheets %s request built: %d rows to %s",
            args.mode,
            len(data),
            args.sheet_name,
        )

    except ValueError as exc:
        logger.error("Validation error: %s", exc)
        sys.exit(1)
    except Exception as exc:
        logger.exception("Unexpected error: %s", exc)
        sys.exit(2)


if __name__ == "__main__":
    main()
