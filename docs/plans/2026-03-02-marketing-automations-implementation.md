# Marketing Automations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build 4 autonomous marketing automations (Google Review Response, Competitor Ad Spy, GSC Quick-Win Hunter, Wix SEO Auto-Optimiser) following the WAT pattern established by the GBP Posting system.

**Architecture:** Each automation gets: a Python tool in `tools/`, a skill in `.agents/skills/`, a workflow SOP in `workflows/`, config files in `config/gbp/`, and a launchd plist for scheduling. All share the Gmail notification + Google Sheets logging pattern from GBP posting.

**Tech Stack:** Python 3, Playwright MCP (browser automation), Google Workspace MCP (Gmail + Sheets), Google Search Console MCP, Wix MCP, Meta Ads MCP, macOS launchd.

**Design Doc:** `docs/plans/2026-03-02-marketing-automations-design.md`

**Reference Implementation:** The GBP Posting system is the template for all 4 automations:
- Skill pattern: `.agents/skills/gbp-posting/` (SKILL.md, AGENT.md, config.json)
- Tool pattern: `tools/gbp_generate_posts.py` (argparse CLI, JSON output, logging)
- Workflow pattern: `workflows/12_gbp_posting.md` (8-step SOP)
- Config pattern: `config/gbp/` (JSON configs)
- Plist pattern: `config/gbp/com.carisma.gbp-content-gen.plist`

---

## Phase A: Google Review Response Automation

### Task 1: Create review response config

**Files:**
- Create: `config/gbp/review-response-rules.json`

**Step 1: Write the config file**

```json
{
  "response_rules": {
    "5_star": {
      "approach": "Thank by name, reference what they mentioned, invite them back",
      "tone": "warm, grateful, personal",
      "max_length": 300,
      "include_sign_off": true,
      "template_hints": [
        "Thank the reviewer by name if visible",
        "Reference a specific detail from their review",
        "Mention looking forward to welcoming them back",
        "Keep it genuine — no generic copy-paste feeling"
      ]
    },
    "4_star": {
      "approach": "Thank them, acknowledge minor concern if any, offer to improve",
      "tone": "appreciative, attentive",
      "max_length": 350,
      "include_sign_off": true,
      "template_hints": [
        "Thank for sharing their experience",
        "If concern mentioned, acknowledge it specifically",
        "Express commitment to improvement",
        "Invite them to return"
      ]
    },
    "3_star": {
      "approach": "Thank them, apologise for specifics, offer to make it right",
      "tone": "empathetic, solution-oriented",
      "max_length": 400,
      "include_sign_off": true,
      "include_contact": true,
      "template_hints": [
        "Thank for honest feedback",
        "Apologise for the specific issue mentioned",
        "Offer to discuss further",
        "Provide contact email or phone"
      ]
    },
    "1_2_star": {
      "approach": "Empathetic acknowledgment, sincere apology, invite offline resolution",
      "tone": "deeply empathetic, professional, non-defensive",
      "max_length": 400,
      "include_sign_off": true,
      "include_contact": true,
      "flag_for_human": true,
      "template_hints": [
        "Acknowledge their disappointment sincerely",
        "Never argue or be defensive",
        "Apologise without making excuses",
        "Provide direct contact for private resolution",
        "Never offer compensation publicly"
      ]
    }
  },
  "brand_contacts": {
    "carisma_spa": {
      "email": "info@carismaspa.com",
      "phone": "+356 2138 3838"
    },
    "carisma_aesthetics": {
      "email": "info@carismaaesthetics.com",
      "phone": "+356 2138 3838"
    },
    "carisma_slimming": {
      "email": "info@carismaslimming.com",
      "phone": "+356 2780 2062"
    }
  },
  "forbidden_phrases": [
    "We're sorry you feel that way",
    "As per our policy",
    "Unfortunately, we cannot",
    "You should have",
    "That's not what happened",
    "We disagree",
    "We offer compensation",
    "We'll give you a discount"
  ],
  "abusive_review_policy": {
    "action": "flag_and_skip",
    "indicators": [
      "profanity",
      "personal threats",
      "discriminatory language",
      "spam/advertising",
      "clearly fake review (no visit details, generic attack)"
    ],
    "skip_message": "Review flagged as potentially abusive — skipped. Logged for human review."
  },
  "quality_review": {
    "layer_1_tone": {
      "checks": [
        "Response sounds empathetic and genuine, not template-driven",
        "No defensive or argumentative language",
        "Varied sentence structure (not identical to other responses)",
        "Appropriate length for the review rating",
        "Contractions used naturally"
      ]
    },
    "layer_2_brand_voice": {
      "checks": [
        "Correct persona sign-off for the brand",
        "Tone matches brand voice (warm/clinical-warm/compassionate)",
        "No forbidden phrases used",
        "Contact information correct for the brand",
        "UK English spelling"
      ]
    }
  },
  "_metadata": {
    "version": "1.0.0",
    "last_updated": "2026-03-02",
    "notes": "Review response rules for all 3 Carisma brands. Brand contacts should be updated if they change."
  }
}
```

**Step 2: Verify the file is valid JSON**

Run: `python3 -c "import json; json.load(open('config/gbp/review-response-rules.json'))" && echo "Valid JSON"`
Expected: `Valid JSON`

**Step 3: Commit**

```bash
git add config/gbp/review-response-rules.json
git commit -m "config: Add review response rules for Google Review automation"
```

---

### Task 2: Create review fetching tool

**Files:**
- Create: `tools/fetch_google_reviews.py`

**Step 1: Write the tool**

This tool uses Playwright MCP to navigate to each brand's GBP profile, scrape reviews, and identify unresponded ones. It outputs structured JSON with review data.

Follow the exact pattern of `tools/gbp_generate_posts.py`:
- Same `BASE_DIR` / `CONFIG_DIR` / `GBP_CONFIG_DIR` path constants
- Same `argparse` CLI pattern
- Same JSON output structure with `metadata` + `reviews` keys
- Same `logging` setup

```python
#!/usr/bin/env python3
"""
Fetch Google Reviews — Scrape reviews from GBP profiles via Playwright
and identify reviews that need responses.

Usage:
    python tools/fetch_google_reviews.py --brand_id all
    python tools/fetch_google_reviews.py --brand_id carisma_spa --output_dir .tmp/reviews/fetched

Inputs:
    --brand_id    Brand ID or "all" (required)
    --output_dir  Output directory (default: .tmp/reviews/fetched)
    --days_back   Only fetch reviews from the last N days (default: 30)

Outputs:
    JSON files at {output_dir}/reviews_{brand}_{date}.json

MCP Integration:
    This tool generates Playwright MCP instructions for the agent to execute.
    It does NOT execute browser actions directly — the agent runs the instructions.
"""

import argparse
import json
import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

BASE_DIR = Path(__file__).resolve().parent.parent
CONFIG_DIR = BASE_DIR / "config"
GBP_CONFIG_DIR = CONFIG_DIR / "gbp"
DEFAULT_OUTPUT_DIR = BASE_DIR / ".tmp" / "reviews" / "fetched"
RESPONSE_LOG_DIR = BASE_DIR / ".tmp" / "reviews" / "logs"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("fetch_google_reviews")


def load_locations_config() -> dict[str, Any]:
    """Load GBP locations config."""
    config_path = BASE_DIR / "marketing" / "google-gmb" / "locations.json"
    if not config_path.exists():
        raise FileNotFoundError(f"Locations config not found: {config_path}")
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_brands_config() -> dict[str, Any]:
    """Load brands config indexed by brand_id."""
    config_path = CONFIG_DIR / "brands.json"
    if not config_path.exists():
        raise FileNotFoundError(f"Brands config not found: {config_path}")
    with open(config_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {b["brand_id"]: b for b in data.get("brands", [])}


def load_response_rules() -> dict[str, Any]:
    """Load review response rules config."""
    config_path = GBP_CONFIG_DIR / "review-response-rules.json"
    if not config_path.exists():
        raise FileNotFoundError(f"Response rules not found: {config_path}")
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_response_log(brand_id: str) -> list[dict[str, Any]]:
    """Load the recent response log for a brand."""
    log_path = RESPONSE_LOG_DIR / f"response_log_{brand_id}.json"
    if not log_path.exists():
        return []
    try:
        with open(log_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        logger.warning("Could not read response log at %s. Starting fresh.", log_path)
        return []


def save_response_log(brand_id: str, entries: list[dict[str, Any]]) -> None:
    """Save response log entries. Keeps the last 200 entries."""
    RESPONSE_LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_path = RESPONSE_LOG_DIR / f"response_log_{brand_id}.json"
    existing = load_response_log(brand_id)
    combined = existing + entries
    combined = combined[-200:]
    with open(log_path, "w", encoding="utf-8") as f:
        json.dump(combined, f, indent=2, ensure_ascii=False)


def generate_review_fetch_plan(
    brand_id: str,
    locations: list[dict[str, Any]],
    brand_name: str,
) -> dict[str, Any]:
    """
    Generate Playwright MCP instructions to fetch reviews for a brand.

    The agent will execute these instructions sequentially:
    1. Navigate to Google Maps for the business
    2. Click on the Reviews tab
    3. Take a snapshot of the reviews
    4. The agent reads the reviews from the snapshot and structures them

    Returns a plan dict with instructions for the agent.
    """
    instructions = []

    for loc in locations:
        location_name = loc.get("location_name", brand_name)
        maps_url = loc.get("google_maps_url", "")

        # If no Maps URL, use a search-based approach
        if not maps_url or maps_url == "TO_BE_FILLED":
            search_query = location_name.replace(" ", "+")
            maps_url = f"https://www.google.com/maps/search/{search_query}"

        instructions.append({
            "step": "navigate_to_reviews",
            "location": location_name,
            "url": maps_url,
            "mcp_tool": "mcp__playwright__browser_navigate",
            "description": f"Navigate to Google Maps for {location_name}",
        })
        instructions.append({
            "step": "wait_for_load",
            "mcp_tool": "mcp__playwright__browser_wait_for",
            "wait_ms": 3000,
            "description": "Wait for Maps page to load",
        })
        instructions.append({
            "step": "take_snapshot",
            "mcp_tool": "mcp__playwright__browser_snapshot",
            "description": f"Snapshot reviews page for {location_name}",
        })

    return {
        "brand_id": brand_id,
        "brand_name": brand_name,
        "locations": [loc.get("location_name") for loc in locations],
        "instructions": instructions,
    }


def build_output(
    brand_id: str,
    brand_name: str,
    fetch_plan: dict[str, Any],
    output_dir: Path,
) -> Path:
    """Save the fetch plan as a JSON file for the agent to execute."""
    output_dir.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d")
    filename = f"review_fetch_plan_{brand_id}_{date_str}.json"
    output_path = output_dir / filename

    output = {
        "metadata": {
            "tool": "fetch_google_reviews",
            "brand": brand_id,
            "brand_name": brand_name,
            "generated_at": datetime.now().isoformat(),
            "status": "pending_execution",
        },
        "fetch_plan": fetch_plan,
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    logger.info("Saved fetch plan to %s", output_path)
    return output_path


def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate a review fetch plan for Carisma GBP profiles.",
    )
    parser.add_argument(
        "--brand_id", type=str, required=True,
        help='Brand ID or "all"',
    )
    parser.add_argument(
        "--output_dir", type=str, default=None,
        help=f"Output directory (default: {DEFAULT_OUTPUT_DIR})",
    )
    parser.add_argument(
        "--days_back", type=int, default=30,
        help="Fetch reviews from the last N days (default: 30)",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> None:
    args = parse_args(argv)
    output_dir = Path(args.output_dir) if args.output_dir else DEFAULT_OUTPUT_DIR

    try:
        locations_config = load_locations_config()
        brands_config = load_brands_config()
    except FileNotFoundError as exc:
        logger.error("Config file missing: %s", exc)
        sys.exit(1)

    brands_data = locations_config.get("brands", {})

    if args.brand_id == "all":
        brand_ids = list(brands_data.keys())
    else:
        if args.brand_id not in brands_data:
            logger.error("Brand '%s' not found in locations config.", args.brand_id)
            sys.exit(1)
        brand_ids = [args.brand_id]

    results = {}
    for brand_id in brand_ids:
        brand_info = brands_data[brand_id]
        brand_name = brand_info.get("brand_name", brand_id)
        locations = brand_info.get("locations", [])

        plan = generate_review_fetch_plan(brand_id, locations, brand_name)
        output_path = build_output(brand_id, brand_name, plan, output_dir)
        results[brand_id] = {
            "locations": len(locations),
            "output": str(output_path),
        }

    print(json.dumps({
        "brands_processed": list(results.keys()),
        "results": results,
        "output_dir": str(output_dir),
    }, indent=2))


if __name__ == "__main__":
    main()
```

**Step 2: Verify the tool runs**

Run: `python3 tools/fetch_google_reviews.py --brand_id all --output_dir .tmp/reviews/fetched`
Expected: JSON output listing all 3 brands and their fetch plan files.

**Step 3: Clean up test output and commit**

```bash
rm -rf .tmp/reviews/
git add tools/fetch_google_reviews.py
git commit -m "feat: Add Google review fetch tool for review response automation"
```

---

### Task 3: Create review response skill files

**Files:**
- Create: `.agents/skills/review-response/SKILL.md`
- Create: `.agents/skills/review-response/AGENT.md`
- Create: `.agents/skills/review-response/config.json`

**Step 1: Write SKILL.md**

Follow the exact format of `.agents/skills/gbp-posting/SKILL.md`. Key sections:
- Frontmatter with name, version, description, trigger phrases
- "What This Skill Does" numbered list
- "Before Starting" context files list
- Content generation rules per brand
- Quick Reference table (persona, signature, tone per brand)
- Related skills

Trigger phrases: "review response", "Google review", "respond to reviews", "GBP reviews", "review management"

The skill loads: `config/gbp/review-response-rules.json`, `marketing/google-gmb/locations.json`, `config/brands.json`

Flow: Fetch reviews via Playwright → Filter unresponded → Generate responses using brand voice → 2-layer AI quality review (tone + brand voice) → Post responses via Playwright → Log to Sheets → Email summary

**Step 2: Write AGENT.md**

Follow the exact format of `.agents/skills/gbp-posting/AGENT.md`. 6 phases:

1. **Load Context** — Read locations.json, brands.json, review-response-rules.json, response log
2. **Fetch Reviews** — Execute Playwright instructions from fetch tool to scrape reviews from GBP/Google Maps. Parse the snapshot to extract: reviewer name, rating, review text, date, response status
3. **Generate Responses** — For each unresponded review: determine rating tier → apply response rules → generate response using brand voice → validate against forbidden phrases
4. **AI Quality Review** — 2-layer review:
   - Layer 1 (Tone): Empathetic, genuine, not template-feeling, varied structure, appropriate length
   - Layer 2 (Brand Voice): Correct persona, sign-off, contact details, UK English, no forbidden phrases
   - Auto-fix: up to 3 revision rounds, then skip
5. **Post Responses via Playwright** — Navigate to each review in GBP dashboard → Click "Reply" → Enter response text → Submit. Wait 5 seconds between responses.
6. **Log and Report** — Log to Google Sheets, email summary to mertgulen98@gmail.com

**Step 3: Write config.json**

Follow the exact format of `.agents/skills/gbp-posting/config.json`:

```json
{
  "name": "review-response",
  "type": "skill",
  "version": "1.0",
  "description": "Auto-respond to Google reviews across all Carisma brands",
  "inputs": {
    "brand_id": {
      "type": "string",
      "enum": ["carisma_spa", "carisma_aesthetics", "carisma_slimming", "all"],
      "description": "Brand to respond to reviews for, or 'all'",
      "required": true,
      "default": "all"
    },
    "days_back": {
      "type": "integer",
      "description": "Look back N days for unresponded reviews",
      "required": false,
      "default": 30
    },
    "dry_run": {
      "type": "boolean",
      "description": "If true, generate responses but do not post via Playwright",
      "required": false,
      "default": false
    }
  },
  "outputs": {
    "reviews_found": {
      "type": "array",
      "description": "Reviews found with rating, text, and response status"
    },
    "responses_generated": {
      "type": "array",
      "description": "Generated response objects with brand, review, response text"
    },
    "posting_results": {
      "type": "array",
      "description": "Success/fail status per response after Playwright posting"
    },
    "summary": {
      "type": "object",
      "description": "Summary with total reviews, responses posted, failures"
    }
  },
  "context_files": [
    "marketing/google-gmb/locations.json",
    "config/gbp/review-response-rules.json",
    "config/brands.json"
  ],
  "mcp_servers": ["playwright", "google-workspace"],
  "email_notification": {
    "enabled": true,
    "recipient": "mertgulen98@gmail.com",
    "tool": "mcp__google-workspace__gmail_send_email",
    "send_on_success": true,
    "send_on_partial_failure": true,
    "send_on_total_failure": true
  },
  "ai_quality_review": {
    "enabled": true,
    "layers": ["tone", "brand_voice"],
    "max_revision_rounds": 3,
    "auto_publish_on_pass": true,
    "skip_on_persistent_failure": true
  },
  "brands": {
    "carisma_spa": {
      "persona": "Sarah Caballeri",
      "signature": "Warm regards, Sarah",
      "tone": "warm, grateful, personal"
    },
    "carisma_aesthetics": {
      "persona": "Sarah",
      "signature": "Warm regards, Sarah",
      "tone": "professional, caring, confident"
    },
    "carisma_slimming": {
      "persona": "Katya",
      "signature": "Warmly, Katya",
      "tone": "compassionate, understanding, supportive"
    }
  }
}
```

**Step 4: Commit**

```bash
git add .agents/skills/review-response/
git commit -m "feat: Add review response skill (SKILL.md, AGENT.md, config.json)"
```

---

### Task 4: Create review response workflow

**Files:**
- Create: `workflows/13_review_response.md`

**Step 1: Write the workflow**

Follow the exact format of `workflows/12_gbp_posting.md`. Sections:
- Objective
- Required Inputs table
- Tools Used table
- Step-by-Step Procedure (8 steps matching the GBP pattern):
  1. Load Context
  2. Fetch Reviews via Playwright (navigate to GBP → scrape reviews → parse into structured data)
  3. Filter Reviews (identify unresponded, categorise by rating tier)
  4. Generate Responses (apply response rules per rating tier, brand voice)
  5. AI Quality Review (2-layer: tone + brand voice, auto-fix protocol)
  6. Check Browser Authentication (same as GBP Step 5)
  7. Post Responses via Playwright (navigate to review → click Reply → enter text → submit)
  8. Log to Sheets + Email Notification
- Expected Outputs table
- Edge Cases (auth expired, review already responded, abusive review, GBP UI changes)
- AI Quality Gate section
- Known Issues & Learnings section (empty, with template)

**Step 2: Commit**

```bash
git add workflows/13_review_response.md
git commit -m "feat: Add review response workflow SOP (Workflow 13)"
```

---

### Task 5: Create review response launchd plist

**Files:**
- Create: `config/gbp/com.carisma.review-response.plist`

**Step 1: Write the plist**

Follow the exact format of `config/gbp/com.carisma.gbp-content-gen.plist`. Change:
- Label: `com.carisma.review-response`
- ProgramArguments: `python3 tools/fetch_google_reviews.py --brand_id all`
- Schedule: Daily at 8am (Hour: 8, Minute: 0 — no specific Weekday)
- StandardOutPath/StandardErrorPath: `.tmp/reviews/logs/launchd-stdout.log` / `launchd-stderr.log`

**Step 2: Commit**

```bash
git add config/gbp/com.carisma.review-response.plist
git commit -m "feat: Add launchd plist for daily review response check"
```

---

## Phase A (parallel): Competitor Ad Spy

### Task 6: Create competitor scraping tool

**Files:**
- Create: `tools/scrape_competitor_ads.py`

**Step 1: Write the tool**

Follow the exact pattern of `tools/ad_library_scrape.py` (which already exists for screenshots). This new tool:
- Reads `config/competitors.json` for competitor Page IDs
- Uses the Meta Ad Library API via `mcp__meta-ads__search_ads_archive` MCP tool (not Playwright)
- Compares current ads against the previous snapshot in `.tmp/research/competitor-snapshot-{prev_date}.json`
- Detects: new ads (not in previous snapshot), killed ads (in previous but not current), longevity (ads present in both)
- Outputs structured JSON to `.tmp/research/competitor-report-{date}.json`

CLI pattern: `--output_dir .tmp/research --brand_category all|spa|aesthetics|slimming`

Key functions:
- `load_competitors_config()` — loads `config/competitors.json`
- `load_previous_snapshot()` — loads most recent snapshot from `.tmp/research/`
- `build_ad_library_instructions(page_ids)` — generates MCP tool call instructions for `mcp__meta-ads__search_ads_archive`
- `compare_snapshots(current, previous)` — diffs two snapshots to find new/killed/changed ads
- `generate_intelligence_report(diff)` — structures the diff into intelligence categories
- `save_snapshot(current_ads, output_dir)` — saves current state for next comparison
- `save_report(report, output_dir)` — saves the intelligence report

**Step 2: Verify the tool runs with placeholder data**

Run: `python3 tools/scrape_competitor_ads.py --brand_category all --output_dir .tmp/research`
Expected: Warning that competitors.json has TO_BE_FILLED entries, but generates empty report structure.

**Step 3: Commit**

```bash
git add tools/scrape_competitor_ads.py
git commit -m "feat: Add competitor ad scraping tool for weekly ad spy automation"
```

---

### Task 7: Create competitor spy skill files

**Files:**
- Create: `.agents/skills/competitor-spy/SKILL.md`
- Create: `.agents/skills/competitor-spy/AGENT.md`
- Create: `.agents/skills/competitor-spy/config.json`

**Step 1: Write SKILL.md**

Trigger phrases: "competitor ads", "ad spy", "competitor analysis", "what are competitors running", "ad library scan"

Flow: Load competitors.json → Pull ads via Meta Ad Library MCP → Compare against previous snapshot → AI analysis (hooks, offers, formats, pricing) → Generate intelligence brief → Log to Sheets → Email report

**Step 2: Write AGENT.md**

5 phases:
1. **Load Context** — Read competitors.json, brands.json, previous snapshot
2. **Fetch Competitor Ads** — Use `mcp__meta-ads__search_ads_archive` for each competitor Page ID. For each ad: capture ad_id, page_name, body_text, link_url, call_to_action, start_date, media_type, status
3. **Compare & Analyse** — Run `tools/scrape_competitor_ads.py` to diff snapshots. AI analysis layer: categorise each new ad by angle (hook type, pain point addressed, offer type, creative format). Flag long-running ads (30+ days = likely winners). Detect pricing intel (any prices mentioned).
4. **Generate Report** — Structured markdown report with sections: New Ads This Week, Ads Killed (possible losers), Long-Running Winners, Pricing Intelligence, Creative Format Trends, Recommended Actions
5. **Log and Notify** — Save snapshot for next week. Log to Sheets "Competitor Intel" tab. Email intelligence report.

**Step 3: Write config.json**

```json
{
  "name": "competitor-spy",
  "type": "skill",
  "version": "1.0",
  "description": "Weekly competitive intelligence from Meta Ad Library",
  "inputs": {
    "brand_category": {
      "type": "string",
      "enum": ["spa", "aesthetics", "slimming", "all"],
      "description": "Which competitor category to scan",
      "required": true,
      "default": "all"
    },
    "dry_run": {
      "type": "boolean",
      "description": "If true, generate report but do not save snapshot",
      "required": false,
      "default": false
    }
  },
  "outputs": {
    "ads_found": { "type": "array", "description": "All active competitor ads" },
    "intelligence_report": { "type": "object", "description": "Structured competitive intel" },
    "summary": { "type": "object", "description": "Summary stats" }
  },
  "context_files": [
    "config/competitors.json",
    "config/brands.json"
  ],
  "mcp_servers": ["meta-ads", "google-workspace"],
  "email_notification": {
    "enabled": true,
    "recipient": "mertgulen98@gmail.com",
    "tool": "mcp__google-workspace__gmail_send_email",
    "send_on_success": true,
    "send_on_partial_failure": true,
    "send_on_total_failure": true
  }
}
```

**Step 4: Commit**

```bash
git add .agents/skills/competitor-spy/
git commit -m "feat: Add competitor spy skill (SKILL.md, AGENT.md, config.json)"
```

---

### Task 8: Create competitor spy workflow + plist

**Files:**
- Create: `workflows/14_competitor_ad_spy.md`
- Create: `config/gbp/com.carisma.competitor-spy.plist`

**Step 1: Write workflow 14**

Follow `workflows/12_gbp_posting.md` format. Steps:
1. Load Context (competitors.json, previous snapshot)
2. Fetch Ads (Meta Ad Library MCP for each competitor)
3. Save Current Snapshot
4. Compare Snapshots (new/killed/longevity analysis)
5. AI Intelligence Analysis (categorise by angle, format, pricing)
6. Generate Report (markdown + structured JSON)
7. Log to Sheets ("Competitor Intel" tab)
8. Email Intelligence Report

Edge cases: Competitor Page ID invalid, API rate limit, no previous snapshot (first run = all ads are "new"), competitor has no active ads.

**Step 2: Write launchd plist**

- Label: `com.carisma.competitor-spy`
- Schedule: Sunday at 7pm (Weekday: 0, Hour: 19, Minute: 0)
- ProgramArguments: `python3 tools/scrape_competitor_ads.py --brand_category all`

**Step 3: Commit**

```bash
git add workflows/14_competitor_ad_spy.md config/gbp/com.carisma.competitor-spy.plist
git commit -m "feat: Add competitor ad spy workflow (14) and launchd plist"
```

---

## Phase B: GSC Quick-Win Hunter

### Task 9: Create GSC quick-win finder tool

**Files:**
- Create: `tools/gsc_quick_win_finder.py`

**Step 1: Write the tool**

CLI pattern matching `tools/gbp_generate_posts.py`:
- `--brand_id all|carisma_spa|carisma_aesthetics|carisma_slimming`
- `--days 28` (lookback period)
- `--output_dir .tmp/seo/quick-wins`

The tool:
1. Loads `config/brands.json` to get website URLs per brand
2. Loads existing keyword banks from `marketing/google-gmb/keyword-banks/`
3. Generates MCP instructions for `mcp__google-search-console__search_analytics` per brand site
4. Defines the analysis criteria as structured JSON:
   - Almost Page 1: position 8-20, impressions > 50
   - Low CTR: position 1-10, CTR < 3%
   - Emerging: queries that appeared in last 7 days (compare 7-day vs 28-day data)
   - Local Intent: queries containing "malta", "gozo", "sliema", "st julian", "floriana", "near me"
5. Cross-references found keywords against existing keyword banks
6. Outputs: quick-win report JSON + auto-additions JSON for each brand

Key output files:
- `.tmp/seo/quick-wins/quick_wins_{brand}_{date}.json` — full analysis
- `config/gbp/keywords_{brand}_auto_additions.json` — new keywords to add to GBP rotation

**Step 2: Verify the tool runs**

Run: `python3 tools/gsc_quick_win_finder.py --brand_id all --output_dir .tmp/seo/quick-wins`
Expected: JSON output with analysis structure (actual GSC data comes from MCP at runtime).

**Step 3: Commit**

```bash
git add tools/gsc_quick_win_finder.py
git commit -m "feat: Add GSC quick-win finder tool for SEO automation"
```

---

### Task 10: Create GSC hunter skill files

**Files:**
- Create: `.agents/skills/gsc-hunter/SKILL.md`
- Create: `.agents/skills/gsc-hunter/AGENT.md`
- Create: `.agents/skills/gsc-hunter/config.json`

**Step 1: Write SKILL.md**

Trigger phrases: "GSC analysis", "quick wins", "search console", "keyword opportunities", "SEO opportunities", "ranking opportunities"

Flow: Pull GSC data → Analyse for quick wins → Cross-reference keyword banks → Auto-add new keywords → Update GBP keyword priorities → Log → Email

**Step 2: Write AGENT.md**

5 phases:
1. **Load Context** — Read brands.json (website URLs), keyword banks, previous quick-win reports
2. **Pull GSC Data** — Use `mcp__google-search-console__search_analytics` for each brand site. Pull: query, clicks, impressions, CTR, position for last 28 days. Also pull 7-day data for emerging query detection.
3. **Analyse Quick Wins** — Run `tools/gsc_quick_win_finder.py`. Categorise each query into: Almost Page 1, Low CTR, Emerging, Local Intent. Cross-reference with existing keyword banks to find gaps.
4. **Update Keyword Banks** — For keywords not in existing banks: write to `config/gbp/keywords_{brand}_auto_additions.json`. For underused keywords in banks: flag for priority boost.
5. **Log and Notify** — Log to Sheets "SEO Quick Wins" tab. Email report with: top 10 quick wins per brand, new keywords added, recommended GBP post topics.

**Step 3: Write config.json**

```json
{
  "name": "gsc-hunter",
  "type": "skill",
  "version": "1.0",
  "description": "Find SEO quick wins from Google Search Console and feed into GBP targeting",
  "inputs": {
    "brand_id": {
      "type": "string",
      "enum": ["carisma_spa", "carisma_aesthetics", "carisma_slimming", "all"],
      "required": true,
      "default": "all"
    },
    "days": {
      "type": "integer",
      "description": "Lookback period in days",
      "required": false,
      "default": 28
    }
  },
  "outputs": {
    "quick_wins": { "type": "array", "description": "Ranked quick-win opportunities" },
    "keywords_added": { "type": "array", "description": "New keywords added to GBP banks" },
    "summary": { "type": "object", "description": "Per-brand opportunity summary" }
  },
  "context_files": [
    "config/brands.json",
    "marketing/google-gmb/keyword-banks/*.md"
  ],
  "mcp_servers": ["google-search-console", "google-workspace"],
  "email_notification": {
    "enabled": true,
    "recipient": "mertgulen98@gmail.com",
    "tool": "mcp__google-workspace__gmail_send_email",
    "send_on_success": true,
    "send_on_partial_failure": true,
    "send_on_total_failure": true
  }
}
```

**Step 4: Commit**

```bash
git add .agents/skills/gsc-hunter/
git commit -m "feat: Add GSC quick-win hunter skill (SKILL.md, AGENT.md, config.json)"
```

---

### Task 11: Create GSC hunter workflow + plist

**Files:**
- Create: `workflows/15_gsc_quick_wins.md`
- Create: `config/gbp/com.carisma.gsc-hunter.plist`

**Step 1: Write workflow 15**

Steps:
1. Load Context (brands.json, keyword banks, previous reports)
2. Pull GSC Data (search_analytics for 28d + 7d per brand site)
3. Analyse Quick Wins (categorise by type)
4. Cross-Reference Keyword Banks (find gaps)
5. Update Keyword Auto-Additions (write to config/gbp/)
6. Generate Report
7. Log to Sheets ("SEO Quick Wins" tab)
8. Email Report

Edge cases: GSC site not verified, no data for brand site, all keywords already in banks, API quota limits.

Integration notes: Quick-win keywords feed into `tools/gbp_generate_posts.py` which should be updated (Task 13) to also read `config/gbp/keywords_{brand}_auto_additions.json`.

**Step 2: Write launchd plist**

- Label: `com.carisma.gsc-hunter`
- Schedule: 1st and 15th of month at 9am (Day: 1 + Day: 15, Hour: 9, Minute: 0)
- Note: launchd doesn't natively support "1st and 15th" — use two plists or a single plist that runs daily and the script checks if today is 1st or 15th

Simpler approach: Run daily at 9am, script checks `datetime.now().day in (1, 15)` and exits early otherwise. This avoids needing two plists.

**Step 3: Commit**

```bash
git add workflows/15_gsc_quick_wins.md config/gbp/com.carisma.gsc-hunter.plist
git commit -m "feat: Add GSC quick-win hunter workflow (15) and launchd plist"
```

---

### Task 12: Update GBP generator to read auto-additions

**Files:**
- Modify: `tools/gbp_generate_posts.py` (around line 153-191, the `load_keyword_bank` function)

**Step 1: Update `load_keyword_bank` to merge auto-additions**

After loading the primary keyword bank (JSON or Markdown), also check for `config/gbp/keywords_{brand_id}_auto_additions.json`. If it exists, merge those keywords into the appropriate categories with a priority boost.

Add after line 191 (after the fallback return):

```python
def merge_auto_additions(
    keywords: dict[str, list[str]],
    brand_id: str,
) -> dict[str, list[str]]:
    """Merge auto-discovered keywords from GSC hunter into the keyword bank."""
    additions_path = GBP_CONFIG_DIR / f"keywords_{brand_id}_auto_additions.json"
    if not additions_path.exists():
        return keywords

    try:
        with open(additions_path, "r", encoding="utf-8") as f:
            additions = json.load(f)
    except (json.JSONDecodeError, IOError):
        logger.warning("Could not read auto-additions at %s", additions_path)
        return keywords

    # Merge additions into existing categories
    for category in ["primary", "secondary", "long_tail", "local", "seasonal"]:
        new_keywords = additions.get(category, [])
        existing = set(k.lower() for k in keywords.get(category, []))
        for kw in new_keywords:
            if kw.lower() not in existing:
                keywords.setdefault(category, []).append(kw)

    added_count = sum(len(v) for v in additions.values() if isinstance(v, list))
    logger.info("Merged %d auto-addition keywords for %s", added_count, brand_id)
    return keywords
```

Then update the `load_keyword_bank` function to call `merge_auto_additions` before returning.

**Step 2: Verify the tool still works**

Run: `python3 tools/gbp_generate_posts.py --brand_id carisma_slimming --num_posts 1 --post_type update --output_dir .tmp/gbp/test`
Expected: Still generates valid output. No auto-additions file exists yet, so it logs "no auto-additions" and continues.

**Step 3: Clean up and commit**

```bash
rm -rf .tmp/gbp/test/
git add tools/gbp_generate_posts.py
git commit -m "feat: GBP generator reads auto-discovered keywords from GSC hunter"
```

---

## Phase C: Wix SEO Auto-Optimiser

### Task 13: Create Wix meta optimiser tool

**Files:**
- Create: `tools/wix_meta_optimiser.py`

**Step 1: Write the tool**

CLI: `--brand_id all|carisma_spa|carisma_aesthetics|carisma_slimming --days 30 --max_pages 10 --output_dir .tmp/seo/wix-meta`

The tool:
1. Loads `config/brands.json` to get website URLs per brand
2. Generates MCP instructions for `mcp__google-search-console__search_analytics` with `dimensions: ["page"]` to get page-level performance
3. Defines analysis criteria:
   - Underperforming: impressions > 100, CTR < site average CTR
   - Declining: CTR dropped vs previous period (needs comparison data)
   - Already good: CTR > 5% → skip
   - Recently changed: skip if changed in last 30 days (from changelog)
4. For each candidate page, generates Wix MCP instructions:
   - `mcp__wix__CallWixSiteAPI` to read current meta title + description
5. AI generates improved meta:
   - Title: under 60 chars, primary keyword front-loaded, compelling
   - Description: under 155 chars, includes CTA, addresses search intent
6. Outputs:
   - `.tmp/seo/wix-meta/optimisation_plan_{brand}_{date}.json` — before/after per page
   - Wix MCP instructions to push updates

Key functions:
- `load_meta_changelog(brand_id)` — loads `.tmp/seo/wix-meta/changelog_{brand}.json`
- `save_meta_changelog(brand_id, changes)` — appends to changelog for revert capability
- `generate_gsc_page_instructions(site_url, days)` — MCP instructions for page-level GSC data
- `generate_wix_read_instructions(page_urls)` — MCP instructions to read current meta
- `generate_wix_update_instructions(page_url, new_title, new_description)` — MCP instructions to push updates
- `build_optimisation_plan(gsc_data, current_meta, changelog)` — the core analysis

**Step 2: Verify**

Run: `python3 tools/wix_meta_optimiser.py --brand_id all --output_dir .tmp/seo/wix-meta`
Expected: JSON output with optimisation plan structure (actual data from MCP at runtime).

**Step 3: Commit**

```bash
rm -rf .tmp/seo/
git add tools/wix_meta_optimiser.py
git commit -m "feat: Add Wix meta optimiser tool for SEO automation"
```

---

### Task 14: Create Wix SEO skill files

**Files:**
- Create: `.agents/skills/wix-seo/SKILL.md`
- Create: `.agents/skills/wix-seo/AGENT.md`
- Create: `.agents/skills/wix-seo/config.json`

**Step 1: Write SKILL.md**

Trigger phrases: "Wix SEO", "meta optimisation", "improve CTR", "page titles", "meta descriptions", "SEO optimise pages"

Flow: Pull GSC page data → Identify underperformers → Read current Wix meta → AI generate improvements → 2-layer quality review → Push via Wix MCP → Log changelog → Email before/after report

**Step 2: Write AGENT.md**

6 phases:
1. **Load Context** — Read brands.json (site URLs), meta changelog, previous optimisation reports
2. **Pull Page Performance** — Use `mcp__google-search-console__search_analytics` with page dimension. Get: page URL, clicks, impressions, CTR, position for each brand site.
3. **Identify Candidates** — Filter pages: impressions > 100, CTR below site average, not changed in last 30 days, not above 5% CTR. Max 10 pages per run.
4. **Read Current Meta & Generate Improvements** — Use `mcp__wix__CallWixSiteAPI` to read current title/description. AI generates improved versions following rules: title under 60 chars (keyword front-loaded), description under 155 chars (with CTA), brand voice appropriate.
5. **AI Quality Review** — 2-layer:
   - Layer 1 (SEO Best Practices): Keyword in title, char limits, no stuffing, compelling language, CTA in description
   - Layer 2 (Brand Voice): Correct tone per brand, no clinical claims without disclaimers, UK English
   - Auto-fix: up to 3 rounds
6. **Push Updates & Log** — Use `mcp__wix__CallWixSiteAPI` to update meta. Save before/after to changelog. Log to Sheets "Wix SEO Changes" tab. Email report.

**Step 3: Write config.json**

```json
{
  "name": "wix-seo",
  "type": "skill",
  "version": "1.0",
  "description": "Auto-optimise Wix page meta titles and descriptions based on GSC data",
  "inputs": {
    "brand_id": {
      "type": "string",
      "enum": ["carisma_spa", "carisma_aesthetics", "carisma_slimming", "all"],
      "required": true,
      "default": "all"
    },
    "days": {
      "type": "integer",
      "description": "GSC lookback period in days",
      "required": false,
      "default": 30
    },
    "max_pages": {
      "type": "integer",
      "description": "Maximum pages to optimise per run",
      "required": false,
      "default": 10
    },
    "dry_run": {
      "type": "boolean",
      "description": "If true, generate recommendations but do not push to Wix",
      "required": false,
      "default": false
    }
  },
  "outputs": {
    "candidates": { "type": "array", "description": "Pages identified for optimisation" },
    "optimisations": { "type": "array", "description": "Before/after meta changes" },
    "summary": { "type": "object", "description": "Per-brand optimisation summary" }
  },
  "context_files": [
    "config/brands.json"
  ],
  "mcp_servers": ["google-search-console", "wix", "google-workspace"],
  "email_notification": {
    "enabled": true,
    "recipient": "mertgulen98@gmail.com",
    "tool": "mcp__google-workspace__gmail_send_email",
    "send_on_success": true,
    "send_on_partial_failure": true,
    "send_on_total_failure": true
  },
  "safety_rules": {
    "skip_above_ctr": 5.0,
    "skip_if_recently_changed_days": 30,
    "max_pages_per_run": 10,
    "keep_changelog": true
  }
}
```

**Step 4: Commit**

```bash
git add .agents/skills/wix-seo/
git commit -m "feat: Add Wix SEO auto-optimiser skill (SKILL.md, AGENT.md, config.json)"
```

---

### Task 15: Create Wix SEO workflow + plist

**Files:**
- Create: `workflows/16_wix_seo_optimiser.md`
- Create: `config/gbp/com.carisma.wix-seo.plist`

**Step 1: Write workflow 16**

Steps:
1. Load Context (brands.json, meta changelog)
2. Pull GSC Page Data (page-level search analytics per brand)
3. Identify Candidates (filter by CTR, impressions, change history)
4. Read Current Meta (Wix MCP)
5. Generate Improved Meta (AI with brand voice)
6. AI Quality Review (2-layer: SEO + brand voice)
7. Push Updates (Wix MCP) + Save Changelog
8. Log to Sheets + Email Report (with before/after comparison)

Edge cases: Wix API auth expired, page not found in Wix, GSC data insufficient (new site), all pages above threshold (nothing to optimise), meta update fails.

**Step 2: Write launchd plist**

- Label: `com.carisma.wix-seo`
- Schedule: Daily at 10am, but script checks `datetime.now().day == 1` and exits early otherwise (same pattern as GSC hunter)
- ProgramArguments: `python3 tools/wix_meta_optimiser.py --brand_id all`

**Step 3: Commit**

```bash
git add workflows/16_wix_seo_optimiser.md config/gbp/com.carisma.wix-seo.plist
git commit -m "feat: Add Wix SEO optimiser workflow (16) and launchd plist"
```

---

## Phase D: Integration & Verification

### Task 16: Install all launchd plists

**Step 1: Copy plists to LaunchAgents**

```bash
cp config/gbp/com.carisma.review-response.plist ~/Library/LaunchAgents/
cp config/gbp/com.carisma.competitor-spy.plist ~/Library/LaunchAgents/
cp config/gbp/com.carisma.gsc-hunter.plist ~/Library/LaunchAgents/
cp config/gbp/com.carisma.wix-seo.plist ~/Library/LaunchAgents/
```

**Step 2: Load all plists**

```bash
launchctl load ~/Library/LaunchAgents/com.carisma.review-response.plist
launchctl load ~/Library/LaunchAgents/com.carisma.competitor-spy.plist
launchctl load ~/Library/LaunchAgents/com.carisma.gsc-hunter.plist
launchctl load ~/Library/LaunchAgents/com.carisma.wix-seo.plist
```

**Step 3: Verify all are loaded**

Run: `launchctl list | grep carisma`
Expected: 5 entries (gbp-content-gen + 4 new ones)

---

### Task 17: Dry-run verification of all tools

**Step 1: Test review fetch tool**

Run: `python3 tools/fetch_google_reviews.py --brand_id all`
Expected: JSON output with fetch plans for all 3 brands.

**Step 2: Test competitor scraper**

Run: `python3 tools/scrape_competitor_ads.py --brand_category all`
Expected: Warning about TO_BE_FILLED competitors, but valid JSON structure.

**Step 3: Test GSC quick-win finder**

Run: `python3 tools/gsc_quick_win_finder.py --brand_id all`
Expected: JSON output with analysis structure ready for MCP data.

**Step 4: Test Wix meta optimiser**

Run: `python3 tools/wix_meta_optimiser.py --brand_id all`
Expected: JSON output with optimisation plan structure ready for MCP data.

**Step 5: Test GBP generator still works with auto-additions hook**

Run: `python3 tools/gbp_generate_posts.py --brand_id carisma_slimming --num_posts 1 --post_type update --output_dir .tmp/gbp/test`
Expected: Valid post output, log shows "no auto-additions file" (expected).

**Step 6: Clean up test files**

```bash
rm -rf .tmp/reviews/ .tmp/research/ .tmp/seo/ .tmp/gbp/test/
```

---

### Task 18: Final commit and summary

**Step 1: Verify all files are tracked**

Run: `git status`
Expected: All new files staged or committed. No untracked automation files.

**Step 2: Create a summary commit if any unstaged changes remain**

```bash
git add -A
git commit -m "feat: Complete 4 marketing automation systems

- Google Review Response (daily, Workflow 13)
- Competitor Ad Spy (weekly, Workflow 14)
- GSC Quick-Win Hunter (bi-weekly, Workflow 15)
- Wix SEO Auto-Optimiser (monthly, Workflow 16)

Each automation: Python tool + skill + workflow SOP + launchd scheduling
+ Gmail notifications + Google Sheets logging"
```

---

## File Inventory

| # | File | Created/Modified | Task |
|---|------|-----------------|------|
| 1 | `config/gbp/review-response-rules.json` | Create | 1 |
| 2 | `tools/fetch_google_reviews.py` | Create | 2 |
| 3 | `.agents/skills/review-response/SKILL.md` | Create | 3 |
| 4 | `.agents/skills/review-response/AGENT.md` | Create | 3 |
| 5 | `.agents/skills/review-response/config.json` | Create | 3 |
| 6 | `workflows/13_review_response.md` | Create | 4 |
| 7 | `config/gbp/com.carisma.review-response.plist` | Create | 5 |
| 8 | `tools/scrape_competitor_ads.py` | Create | 6 |
| 9 | `.agents/skills/competitor-spy/SKILL.md` | Create | 7 |
| 10 | `.agents/skills/competitor-spy/AGENT.md` | Create | 7 |
| 11 | `.agents/skills/competitor-spy/config.json` | Create | 7 |
| 12 | `workflows/14_competitor_ad_spy.md` | Create | 8 |
| 13 | `config/gbp/com.carisma.competitor-spy.plist` | Create | 8 |
| 14 | `tools/gsc_quick_win_finder.py` | Create | 9 |
| 15 | `.agents/skills/gsc-hunter/SKILL.md` | Create | 10 |
| 16 | `.agents/skills/gsc-hunter/AGENT.md` | Create | 10 |
| 17 | `.agents/skills/gsc-hunter/config.json` | Create | 10 |
| 18 | `workflows/15_gsc_quick_wins.md` | Create | 11 |
| 19 | `config/gbp/com.carisma.gsc-hunter.plist` | Create | 11 |
| 20 | `tools/gbp_generate_posts.py` | Modify | 12 |
| 21 | `tools/wix_meta_optimiser.py` | Create | 13 |
| 22 | `.agents/skills/wix-seo/SKILL.md` | Create | 14 |
| 23 | `.agents/skills/wix-seo/AGENT.md` | Create | 14 |
| 24 | `.agents/skills/wix-seo/config.json` | Create | 14 |
| 25 | `workflows/16_wix_seo_optimiser.md` | Create | 15 |
| 26 | `config/gbp/com.carisma.wix-seo.plist` | Create | 15 |

## Parallelisation Notes

Tasks that can run in parallel (no dependencies between them):
- **Tasks 1-5** (Review Response) and **Tasks 6-8** (Competitor Spy) — Phase A
- **Tasks 3, 7, 10, 14** (all skill file creation) can run in parallel if Phase A/B are done for their tools
- **Task 16** (install plists) depends on all plist files being created (Tasks 5, 8, 11, 15)
- **Task 17** (verification) depends on all tools being created

Recommended parallel execution:
1. Wave 1: Tasks 1+6 (configs + tools for Review Response and Competitor Spy)
2. Wave 2: Tasks 2+7 (remaining Phase A files)
3. Wave 3: Tasks 3+8 (skill files + workflows for Phase A)
4. Wave 4: Tasks 4+5 (workflow + plist for Review Response)
5. Wave 5: Tasks 9+10 (Phase B: GSC tool + skill)
6. Wave 6: Tasks 11+12 (Phase B: workflow + GBP integration)
7. Wave 7: Tasks 13+14 (Phase C: Wix tool + skill)
8. Wave 8: Task 15 (Phase C: workflow + plist)
9. Wave 9: Tasks 16+17+18 (Integration + verification)
