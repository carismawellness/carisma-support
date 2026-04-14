#!/usr/bin/env python3
"""
add_hyperlinks_spa-first-timer.py

Applies real hyperlinks to the Carisma Spa First-Timer Guide Google Doc.
Post: [August 2026] Spa Day First-Timer Guide Malta — Carisma Spa
Doc ID: 1UBATHPS8ltlLCR5aZuNwHcG3gLRvdQRVZ3DMBnGzOSM

Converts 'anchor text [→ URL]' visible link placeholders in Google Docs
to real clickable hyperlinks using the Google Docs API batchUpdate.
"""

import re
import json
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

TOKEN_PATH = "/Users/mertgulen/.go-google-mcp/token.json"
CLIENT_SECRETS_PATH = "/Users/mertgulen/.go-google-mcp/client_secrets.json"

AUG_SPA_DIR = "/Users/mertgulen/Library/CloudStorage/GoogleDrive-mertgulen98@gmail.com/My Drive/Carisma Wellness Group/Carisma AI /Carisma AI/.tmp/blog-drafts/spa/august-2026"

DOCS_CONFIG = [
    {
        "doc_id": "1UBATHPS8ltlLCR5aZuNwHcG3gLRvdQRVZ3DMBnGzOSM",
        "title": "SPA-04 — Spa Day First-Timer Guide Malta",
        "final_md": f"{AUG_SPA_DIR}/post-04-spa-first-timer-FINAL.md",
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
    Find all occurrences of 'anchor [→ url]' in flat_text.
    Returns list of dicts with doc-level start/end indices.
    """
    escaped_anchor = re.escape(anchor)
    escaped_url = re.escape(url)
    # Handle both Unicode → (U+2192) and ASCII -> (older doc format)
    search_re = re.compile(escaped_anchor + r"\s*\[(?:→|->)\s*" + escaped_url + r"\]")

    results = []
    for m in search_re.finditer(flat_text):
        full_start = m.start()

        # Locate where anchor text ends within the match
        anchor_re = re.match(escaped_anchor, flat_text[full_start:])
        if not anchor_re:
            continue

        anchor_flat_end = full_start + anchor_re.end()   # exclusive
        suffix_flat_start = anchor_flat_end               # includes space + [→ url]
        suffix_flat_end = m.end()                         # exclusive

        # Guard against out-of-bounds
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

    # --- 1. Extract links from the FINAL.md source of truth ---
    md_links_raw = extract_links_from_markdown(final_md_path)
    # Deduplicate
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

    # --- 2. Fetch the Google Doc ---
    try:
        doc = service.documents().get(documentId=doc_id).execute()
    except HttpError as e:
        print(f"  ERROR reading doc: {e}")
        return

    flat_text, index_map = build_flat_text_map(doc)
    print(f"  Doc text length: {len(flat_text)} chars")

    # --- 3. Find each link's position in the doc ---
    all_occurrences = []
    for anchor, url in md_links:
        hits = find_link_occurrences(flat_text, index_map, anchor, url)
        if hits:
            print(f"  ✓ Found {len(hits)}× '{anchor}'")
            all_occurrences.extend(hits)
        else:
            print(f"  ✗ NOT FOUND: '{anchor}' [→ {url}]")

    if not all_occurrences:
        print("  Nothing to link — the doc may already have hyperlinks or format differs.")
        return

    # --- 4. Sort in REVERSE order so deletions don't shift earlier positions ---
    all_occurrences.sort(key=lambda x: x["anchor_doc_start"], reverse=True)

    # --- 5. Build batchUpdate requests ---
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
    print("Carisma Spa — Apply Hyperlinks: First-Timer Guide")
    print("Doc: [August 2026] Spa Day First-Timer Guide Malta")
    print("=" * 60)

    creds = get_credentials()
    service = build("docs", "v1", credentials=creds)

    for config in DOCS_CONFIG:
        process_doc(service, config["doc_id"], config["title"], config["final_md"])

    print(f"\n{'=' * 60}")
    print("Complete. Open the Google Doc to verify hyperlinks are blue and clickable.")
    print("Doc URL: https://docs.google.com/document/d/1UBATHPS8ltlLCR5aZuNwHcG3gLRvdQRVZ3DMBnGzOSM/edit")


if __name__ == "__main__":
    main()
