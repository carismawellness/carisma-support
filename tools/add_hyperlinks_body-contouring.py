#!/usr/bin/env python3
"""
add_hyperlinks_body-contouring.py

Converts 'anchor text [-> URL]' visible link placeholders in the Google Doc
for post-03-body-contouring to real clickable hyperlinks using the Google Docs API batchUpdate.

Usage:
    python3 tools/add_hyperlinks_body-contouring.py

Reads the FINAL.md file to extract (anchor_text, url) pairs, then finds
each occurrence in the corresponding Google Doc and applies links via
batchUpdate. Processes in reverse doc order so deletions don't shift
earlier positions.
"""

import re
import json
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

TOKEN_PATH = "/Users/mertgulen/.go-google-mcp/token.json"
CLIENT_SECRETS_PATH = "/Users/mertgulen/.go-google-mcp/client_secrets.json"

BASE_DIR = "/Users/mertgulen/Library/CloudStorage/GoogleDrive-mertgulen98@gmail.com/My Drive/Carisma Wellness Group/Carisma AI /Carisma AI/.tmp/blog-drafts/slimming/august-2026"

DOCS_CONFIG = [
    {
        "doc_id": "1fbWmm0_8ck_ViGOn_uWb3TMOdtQo7PQo7HwbEwp_zG0",
        "title": "Post 03 — Non-Surgical Body Contouring Malta",
        "final_md": f"{BASE_DIR}/post-03-body-contouring-FINAL.md",
    },
]


def get_credentials():
    with open(TOKEN_PATH) as f:
        token_data = json.load(f)

    with open(CLIENT_SECRETS_PATH) as f:
        secrets_raw = json.load(f)

    secrets = secrets_raw.get("installed", secrets_raw.get("web", {}))

    creds = Credentials(
        token=token_data.get("access_token"),
        refresh_token=token_data.get("refresh_token"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=secrets["client_id"],
        client_secret=secrets["client_secret"],
    )

    if creds.expired and creds.refresh_token:
        print("  Refreshing OAuth credentials...")
        creds.refresh(Request())

    return creds


def extract_links_from_markdown(md_path):
    """Extract all [anchor text](url) pairs from a markdown file."""
    with open(md_path, encoding="utf-8") as f:
        content = f.read()

    # Match [anchor text](url) — skip images (preceded by !)
    pattern = re.compile(r"(?<!!)\[([^\]]+)\]\((https?://[^)]+)\)")
    links = []
    for m in pattern.finditer(content):
        anchor = m.group(1).strip()
        url = m.group(2).strip()
        links.append((anchor, url))

    return links


def build_flat_text_map(doc):
    """
    Walk the Docs API content tree and build:
    - flat_text: concatenated string of all body text
    - index_map: list where index_map[i] = the Google Docs char index for flat_text[i]
    """
    flat_text = ""
    index_map = []

    def process_elements(elements):
        nonlocal flat_text
        for element in elements:
            if "paragraph" in element:
                for pe in element["paragraph"].get("elements", []):
                    if "textRun" in pe:
                        text = pe["textRun"]["content"]
                        start = pe["startIndex"]
                        for i, ch in enumerate(text):
                            flat_text += ch
                            index_map.append(start + i)
            elif "table" in element:
                for row in element["table"].get("tableRows", []):
                    for cell in row.get("tableCells", []):
                        process_elements(cell.get("content", []))

    process_elements(doc.get("body", {}).get("content", []))
    return flat_text, index_map


def find_link_occurrences(flat_text, index_map, anchor, url):
    """
    Find all occurrences of 'anchor [-> url]' in flat_text.
    Returns list of dicts with doc-level start/end indices.
    """
    escaped_anchor = re.escape(anchor)
    escaped_url = re.escape(url)
    # Handle both Unicode → (U+2192) and ASCII -> (older doc format)
    search_re = re.compile(escaped_anchor + r"\s*\[(?:\u2192|->)\s*" + escaped_url + r"\]")

    results = []
    for m in search_re.finditer(flat_text):
        full_start = m.start()

        anchor_re = re.match(escaped_anchor, flat_text[full_start:])
        if not anchor_re:
            continue

        anchor_flat_end = full_start + anchor_re.end()
        suffix_flat_start = anchor_flat_end
        suffix_flat_end = m.end()

        if suffix_flat_end > len(index_map) or anchor_flat_end > len(index_map):
            print(f"    WARNING: index out of bounds for '{anchor}' — skipping")
            continue

        results.append({
            "anchor": anchor,
            "url": url,
            "anchor_doc_start": index_map[full_start],
            "anchor_doc_end":   index_map[anchor_flat_end - 1] + 1,
            "suffix_doc_start": index_map[suffix_flat_start],
            "suffix_doc_end":   index_map[suffix_flat_end - 1] + 1,
        })

    return results


def process_doc(service, doc_id, title, final_md_path):
    print(f"\n{'─' * 60}")
    print(f"  {title}")

    md_links_raw = extract_links_from_markdown(final_md_path)
    seen = set()
    md_links = []
    for anchor, url in md_links_raw:
        key = (anchor, url)
        if key not in seen:
            seen.add(key)
            md_links.append((anchor, url))
    if not md_links:
        print("  No markdown links found in FINAL.md. Skipping.")
        return
    print(f"  {len(md_links)} unique links in FINAL.md ({len(md_links_raw)} total incl. dupes)")

    try:
        doc = service.documents().get(documentId=doc_id).execute()
    except HttpError as e:
        print(f"  ERROR reading doc: {e}")
        return

    flat_text, index_map = build_flat_text_map(doc)
    print(f"  Doc text length: {len(flat_text)} chars")

    all_occurrences = []
    for anchor, url in md_links:
        hits = find_link_occurrences(flat_text, index_map, anchor, url)
        if hits:
            print(f"  Found {len(hits)}x '{anchor}'")
            all_occurrences.extend(hits)
        else:
            print(f"  NOT FOUND: '{anchor}' [-> {url}]")

    if not all_occurrences:
        print("  Nothing to link — the doc may already have hyperlinks or format differs.")
        return

    all_occurrences.sort(key=lambda x: x["anchor_doc_start"], reverse=True)

    requests = []
    for occ in all_occurrences:
        requests.append({
            "updateTextStyle": {
                "range": {
                    "startIndex": occ["anchor_doc_start"],
                    "endIndex":   occ["anchor_doc_end"],
                    "segmentId":  "",
                },
                "textStyle": {
                    "link": {"url": occ["url"]}
                },
                "fields": "link",
            }
        })
        requests.append({
            "deleteContentRange": {
                "range": {
                    "startIndex": occ["suffix_doc_start"],
                    "endIndex":   occ["suffix_doc_end"],
                    "segmentId":  "",
                }
            }
        })

    print(f"\n  Sending {len(requests)} batchUpdate requests ({len(all_occurrences)} links)...")

    try:
        service.documents().batchUpdate(
            documentId=doc_id,
            body={"requests": requests},
        ).execute()
        print(f"  SUCCESS — {len(all_occurrences)} hyperlinks applied")
    except HttpError as e:
        print(f"  ERROR: {e}")
        if hasattr(e, "error_details"):
            print(f"  Details: {e.error_details}")


def main():
    print("=" * 60)
    print("Carisma Blog — Add Hyperlinks: Body Contouring Post")
    print("=" * 60)

    creds = get_credentials()
    service = build("docs", "v1", credentials=creds)

    for config in DOCS_CONFIG:
        process_doc(service, config["doc_id"], config["title"], config["final_md"])

    print(f"\n{'=' * 60}")
    print("Complete. Open the Google Doc to verify hyperlinks are blue and clickable.")


if __name__ == "__main__":
    main()
