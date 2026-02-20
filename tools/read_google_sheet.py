"""
Read Google Sheet Tool
======================

Read data from Google Sheets via the Google Sheets MCP server.

Purpose:
    Retrieve cell values from a specified sheet and range. Returns data
    as a 2D array for downstream processing by other tools or the agent.

Inputs:
    --spreadsheet_id    Google Sheets spreadsheet ID
    --sheet_name        Sheet/tab name within the spreadsheet
    --range             Cell range to read (e.g. "A1:F100"). Reads all if omitted.

Outputs:
    JSON with 2D array of cell values

MCP Integration:
    Uses Google Sheets MCP for the actual API call.
"""

import argparse
import json
import logging
import sys
from datetime import datetime
from typing import Any, Optional

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("read_google_sheet")


# ---------------------------------------------------------------------------
# MCP request building
# ---------------------------------------------------------------------------

def build_read_request(
    spreadsheet_id: str,
    sheet_name: str,
    cell_range: Optional[str] = None,
) -> dict[str, Any]:
    """
    Build the Google Sheets MCP request for reading data.
    """
    if cell_range:
        # Prepend sheet name if not already included
        full_range = cell_range if "!" in cell_range else f"{sheet_name}!{cell_range}"
    else:
        full_range = sheet_name  # Read entire sheet

    return {
        "mcp_tool": "google_sheets_read",
        "params": {
            "spreadsheet_id": spreadsheet_id,
            "range": full_range,
        },
        "description": f"Read data from {full_range}",
    }


# ---------------------------------------------------------------------------
# Response processing
# ---------------------------------------------------------------------------

def process_read_response(raw_response: dict[str, Any]) -> dict[str, Any]:
    """
    Process Google Sheets read response.

    Returns structured data with the 2D values array and metadata.
    """
    values = raw_response.get("values", [])
    range_str = raw_response.get("range", "")

    # Determine dimensions
    num_rows = len(values)
    num_cols = max(len(row) for row in values) if values else 0

    # Pad rows to consistent width
    padded_values: list[list[Any]] = []
    for row in values:
        padded = list(row) + [""] * (num_cols - len(row))
        padded_values.append(padded)

    return {
        "range": range_str,
        "rows": num_rows,
        "columns": num_cols,
        "values": padded_values,
        "headers": padded_values[0] if padded_values else [],
        "data_rows": padded_values[1:] if len(padded_values) > 1 else [],
    }


def values_to_dicts(values: list[list[Any]]) -> list[dict[str, Any]]:
    """
    Convert a 2D values array into a list of dicts using the first row as headers.

    Useful for downstream processing.
    """
    if len(values) < 2:
        return []

    headers = [str(h).strip() for h in values[0]]
    rows: list[dict[str, Any]] = []

    for row in values[1:]:
        row_dict: dict[str, Any] = {}
        for i, header in enumerate(headers):
            row_dict[header] = row[i] if i < len(row) else ""
        rows.append(row_dict)

    return rows


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------

def read_google_sheet(
    spreadsheet_id: str,
    sheet_name: str,
    cell_range: Optional[str] = None,
) -> dict[str, Any]:
    """
    Build the Google Sheets read request.

    Returns the MCP request dict for the agent to execute.
    """
    request = build_read_request(spreadsheet_id, sheet_name, cell_range)

    result = {
        "metadata": {
            "tool": "read_google_sheet",
            "spreadsheet_id": spreadsheet_id,
            "sheet_name": sheet_name,
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
        description="Read data from Google Sheets.",
    )
    parser.add_argument("--spreadsheet_id", type=str, required=True, help="Spreadsheet ID")
    parser.add_argument("--sheet_name", type=str, required=True, help="Sheet/tab name")
    parser.add_argument(
        "--range",
        type=str,
        default=None,
        help="Cell range (e.g. A1:F100). Reads entire sheet if omitted.",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> None:
    args = parse_args(argv)

    try:
        result = read_google_sheet(
            spreadsheet_id=args.spreadsheet_id,
            sheet_name=args.sheet_name,
            cell_range=args.range,
        )

        print(json.dumps(result, indent=2))
        logger.info("Read request built for %s in %s", args.sheet_name, args.spreadsheet_id)

    except ValueError as exc:
        logger.error("Validation error: %s", exc)
        sys.exit(1)
    except Exception as exc:
        logger.exception("Unexpected error: %s", exc)
        sys.exit(2)


if __name__ == "__main__":
    main()
