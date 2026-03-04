"""
Check for raw meeting transcripts that haven't been processed yet.

Compares files in miscellaneous/meetings/raw/ against processed notes in miscellaneous/meetings/.
A raw transcript is "unprocessed" if no corresponding processed note exists.

Usage:
    python tools/check_unprocessed_meetings.py

Output:
    Prints list of unprocessed transcript filenames, one per line.
    Exit code 0 if unprocessed files found, exit code 1 if none.
"""

import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(BASE_DIR, "miscellaneous", "meetings", "raw")
PROCESSED_DIR = os.path.join(BASE_DIR, "miscellaneous", "meetings")


def get_unprocessed():
    if not os.path.exists(RAW_DIR):
        return []

    raw_files = [
        f for f in os.listdir(RAW_DIR)
        if f.endswith(".md") and not f.startswith(".")
    ]

    processed_files = [
        f for f in os.listdir(PROCESSED_DIR)
        if f.endswith(".md") and not f.startswith(".") and os.path.isfile(os.path.join(PROCESSED_DIR, f))
    ]

    unprocessed = [f for f in raw_files if f not in processed_files]
    return sorted(unprocessed)


if __name__ == "__main__":
    unprocessed = get_unprocessed()

    if unprocessed:
        print(f"Found {len(unprocessed)} unprocessed meeting transcript(s):\n")
        for f in unprocessed:
            path = os.path.join(RAW_DIR, f)
            size_kb = os.path.getsize(path) / 1024
            print(f"  - {f} ({size_kb:.1f} KB)")
        sys.exit(0)
    else:
        print("No unprocessed meeting transcripts found.")
        sys.exit(1)
