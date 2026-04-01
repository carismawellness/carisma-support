# SMM Expert Specialist — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the tools, workflows, content calendar template, and agent configuration needed to make the SMM Expert Specialist operational — able to create content, publish to social platforms, and report on organic performance across all 3 Carisma brands.

**Architecture:** WAT framework — workflow defines the SOP, Python tools handle deterministic execution (Meta Graph API for posting, insights pulling), skill routes brand-specific content creation. The existing `meta-ads` MCP handles paid ads; organic posting uses the Meta Graph API (Page tokens, same access token, different endpoints) via a dedicated Python tool.

**Tech Stack:** Python 3, Meta Graph API v21.0, Google Sheets MCP, Playwright MCP (TikTok), `social-media-content-strategy` skill, 3 brand pillar files

**Existing assets (already built):**
- `.agents/skills/social-media-content-strategy/SKILL.md` — content routing skill
- `marketing/marketing-calendar/social-media/spa-pillars.md` — 2,027 lines
- `marketing/marketing-calendar/social-media/aesthetics-pillars.md` — 2,937 lines
- `marketing/marketing-calendar/social-media/slimming-pillars.md` — 3,361 lines
- `config/brands.json` — brand voice, page IDs, targeting
- `config/branding_guidelines.md` — master voice guidelines

---

## Task 1: Create the Organic Social Posting Tool

Build a Python script that publishes posts to Facebook Pages and Instagram Business accounts via the Meta Graph API.

**Files:**
- Create: `tools/publish_organic_post.py`

**Step 1: Create the posting tool**

```python
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
import urllib.request
import urllib.parse
import urllib.error

GRAPH_API_VERSION = "v21.0"
GRAPH_API_BASE = f"https://graph.facebook.com/{GRAPH_API_VERSION}"

# Brand → Page ID and Instagram Account ID mapping
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


def graph_api_get(endpoint: str, params: dict) -> dict:
    """GET from Meta Graph API."""
    token = os.environ.get("META_ACCESS_TOKEN")
    if not token:
        print("ERROR: META_ACCESS_TOKEN environment variable not set", file=sys.stderr)
        sys.exit(1)

    params["access_token"] = token
    query = urllib.parse.urlencode(params)
    url = f"{GRAPH_API_BASE}/{endpoint}?{query}"

    req = urllib.request.Request(url, method="GET")
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
    # Note: In production, poll the container status before publishing
    import time
    time.sleep(10)  # Basic wait — improve with status polling

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
```

**Step 2: Test with dry run**

Run: `python3 tools/publish_organic_post.py --brand carisma_spa --platform facebook --type text --caption "Test post" --dry-run`
Expected: JSON output showing what would be posted, ending with "DRY RUN — nothing published."

**Step 3: Commit**

```bash
git add tools/publish_organic_post.py
git commit -m "feat: add organic social media posting tool for Meta Graph API"
```

---

## Task 2: Create the Organic Insights Pull Tool

Build a Python script to pull organic page and post performance metrics.

**Files:**
- Create: `tools/pull_organic_insights.py`

**Step 1: Create the insights tool**

```python
#!/usr/bin/env python3
"""
Pull organic social media performance metrics from Meta Graph API.

Usage:
    python tools/pull_organic_insights.py \
        --brand carisma_spa \
        --period last_7_days \
        --output json

    python tools/pull_organic_insights.py \
        --brand carisma_aesthetics \
        --period last_30_days \
        --output summary

Metrics pulled:
    Page-level: page_impressions, page_engaged_users, page_fan_adds,
                page_views_total, page_post_engagements
    Post-level: post_impressions, post_engaged_users, post_clicks,
                post_reactions, comments, shares, saves
"""
import argparse
import json
import os
import sys
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime, timedelta

GRAPH_API_VERSION = "v21.0"
GRAPH_API_BASE = f"https://graph.facebook.com/{GRAPH_API_VERSION}"

BRAND_CONFIG_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "config", "brands.json"
)

PAGE_METRICS = [
    "page_impressions",
    "page_engaged_users",
    "page_fan_adds",
    "page_views_total",
    "page_post_engagements",
]

POST_FIELDS = "id,message,created_time,shares,likes.summary(true),comments.summary(true)"


def load_brand_config(brand_id: str) -> dict:
    with open(BRAND_CONFIG_PATH) as f:
        data = json.load(f)
    for brand in data["brands"]:
        if brand["brand_id"] == brand_id:
            return brand
    raise ValueError(f"Brand '{brand_id}' not found")


def graph_api_get(endpoint: str, params: dict) -> dict:
    token = os.environ.get("META_ACCESS_TOKEN")
    if not token:
        print("ERROR: META_ACCESS_TOKEN not set", file=sys.stderr)
        sys.exit(1)
    params["access_token"] = token
    query = urllib.parse.urlencode(params)
    url = f"{GRAPH_API_BASE}/{endpoint}?{query}"
    req = urllib.request.Request(url, method="GET")
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"ERROR: {e.code}: {error_body}", file=sys.stderr)
        sys.exit(1)


def get_period_dates(period: str) -> tuple:
    now = datetime.now()
    if period == "last_7_days":
        since = now - timedelta(days=7)
    elif period == "last_14_days":
        since = now - timedelta(days=14)
    elif period == "last_30_days":
        since = now - timedelta(days=30)
    else:
        since = now - timedelta(days=7)
    return (int(since.timestamp()), int(now.timestamp()))


def pull_page_insights(page_id: str, since: int, until: int) -> dict:
    return graph_api_get(f"{page_id}/insights", {
        "metric": ",".join(PAGE_METRICS),
        "period": "day",
        "since": since,
        "until": until,
    })


def pull_recent_posts(page_id: str, limit: int = 25) -> list:
    result = graph_api_get(f"{page_id}/posts", {
        "fields": POST_FIELDS,
        "limit": limit,
    })
    return result.get("data", [])


def summarise(page_insights: dict, posts: list, brand_name: str, period: str) -> str:
    lines = [
        f"# {brand_name} — Organic Social Performance ({period})",
        f"Report generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "",
    ]

    # Page-level metrics
    lines.append("## Page Metrics")
    if "data" in page_insights:
        for metric in page_insights["data"]:
            name = metric["name"].replace("page_", "").replace("_", " ").title()
            values = metric.get("values", [])
            total = sum(v.get("value", 0) for v in values if isinstance(v.get("value"), (int, float)))
            lines.append(f"- **{name}:** {total:,}")
    lines.append("")

    # Post-level summary
    lines.append(f"## Recent Posts ({len(posts)} posts)")
    total_likes = 0
    total_comments = 0
    total_shares = 0

    for post in posts:
        likes = post.get("likes", {}).get("summary", {}).get("total_count", 0)
        comments = post.get("comments", {}).get("summary", {}).get("total_count", 0)
        shares = post.get("shares", {}).get("count", 0)
        total_likes += likes
        total_comments += comments
        total_shares += shares

        msg = post.get("message", "(no text)")[:80]
        date = post.get("created_time", "")[:10]
        lines.append(f"- [{date}] {likes} likes, {comments} comments, {shares} shares — \"{msg}\"")

    lines.append("")
    lines.append("## Totals")
    lines.append(f"- **Total Likes:** {total_likes:,}")
    lines.append(f"- **Total Comments:** {total_comments:,}")
    lines.append(f"- **Total Shares:** {total_shares:,}")

    if posts:
        engagement_rate = (total_likes + total_comments + total_shares) / len(posts)
        lines.append(f"- **Avg Engagement/Post:** {engagement_rate:.1f}")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Pull organic social media insights")
    parser.add_argument("--brand", required=True, choices=["carisma_spa", "carisma_aesthetics", "carisma_slimming"])
    parser.add_argument("--period", default="last_7_days", choices=["last_7_days", "last_14_days", "last_30_days"])
    parser.add_argument("--output", default="summary", choices=["json", "summary"])
    parser.add_argument("--post-limit", type=int, default=25, help="Number of recent posts to pull")

    args = parser.parse_args()
    brand = load_brand_config(args.brand)
    page_id = brand["meta_page_id"]
    brand_name = brand["brand_name"]

    since, until = get_period_dates(args.period)

    page_insights = pull_page_insights(page_id, since, until)
    posts = pull_recent_posts(page_id, args.post_limit)

    if args.output == "json":
        print(json.dumps({
            "brand": args.brand,
            "period": args.period,
            "page_insights": page_insights,
            "posts": posts,
        }, indent=2))
    else:
        print(summarise(page_insights, posts, brand_name, args.period))


if __name__ == "__main__":
    main()
```

**Step 2: Test with a real pull (read-only, safe)**

Run: `python3 tools/pull_organic_insights.py --brand carisma_spa --period last_7_days --output summary`
Expected: Summary of Spa page metrics and recent posts. If token lacks page read permissions, the error will indicate which permission is needed.

**Step 3: Commit**

```bash
git add tools/pull_organic_insights.py
git commit -m "feat: add organic social insights pull tool for Meta Graph API"
```

---

## Task 3: Create the Organic Social Workflow

Create the SOP that the SMM Expert agent follows for its weekly cadence.

**Files:**
- Create: `workflows/13_organic_social_posting.md`

**Step 1: Write the workflow**

```markdown
# Workflow 13: Organic Social Media Publishing

## Objective
Manage the weekly organic social media cycle for all 3 Carisma brands — from content planning through publishing and performance reporting.

## Trigger
- **Monday:** Automated weekly cycle start
- **On-demand:** CMO requests ad-hoc content or calendar changes

## Required Inputs
- Brand pillar files: `marketing/marketing-calendar/social-media/<brand>-pillars.md`
- Approved monthly content calendar (Google Sheets)
- Previous week's performance data (from `tools/pull_organic_insights.py`)
- Any CMO direction or seasonal priorities

## Skill
Load `social-media-content-strategy` skill before creating any content. The skill routes to the correct pillar file and provides workflows for each content type.

## Weekly Cadence

### Monday Morning: Performance Pull + Report

1. Run `tools/pull_organic_insights.py` for each brand:
   ```
   python3 tools/pull_organic_insights.py --brand carisma_spa --period last_7_days --output summary
   python3 tools/pull_organic_insights.py --brand carisma_aesthetics --period last_7_days --output summary
   python3 tools/pull_organic_insights.py --brand carisma_slimming --period last_7_days --output summary
   ```
2. Compare metrics against previous week
3. Identify top 3 and bottom 3 posts per brand
4. Note which pillars and sub-topics performed best
5. Send consolidated report to CMO

### Monday Afternoon: Content Generation

1. Review the approved monthly content calendar
2. For each brand, check which pillar slots need content this week
3. Load the brand's pillar file via the `social-media-content-strategy` skill
4. Generate content for each slot:
   - Captions (Workflow A in skill)
   - Reel/TikTok scripts (Workflow B in skill)
   - Story sequences (Workflow C in skill)
5. Run Voice Check Protocol for each piece of content
6. Save content drafts to Google Sheets calendar

### Tuesday-Saturday: Publishing

For each scheduled post:
1. Check the content calendar for today's posts
2. Confirm the content is approved (or within autonomous zone)
3. Publish via the appropriate method:
   - **Facebook/Instagram:** `python3 tools/publish_organic_post.py --brand <brand> --platform <platform> --type <type> --caption "<caption>" --image-url "<url>"`
   - **TikTok:** Use Playwright MCP for browser-based posting (no direct API)
   - **Instagram Stories:** Use Playwright MCP (Stories not supported via Content Publishing API)
4. Log the published post in the Google Sheets calendar (mark as "Published")

### Friday: Next Week Prep

1. Review performance data from Mon-Fri
2. Adjust next week's calendar based on what's performing
3. Flag any pillar imbalances (too much of one pillar, not enough of another)
4. Pre-generate next week's content if possible

## Posting Schedule (from pillar files)

| Platform | Best Times (Malta) | Notes |
|----------|-------------------|-------|
| Instagram Feed | 10:00-12:00, 19:00-21:00 | SEO-rich captions, alt text |
| Instagram Reels | 11:00-13:00, 18:00-20:00 | Trending audio, text overlays |
| Instagram Stories | Throughout day | Interactive elements |
| Facebook | 09:00-11:00 | Longer captions OK |
| TikTok | 12:00-14:00, 19:00-22:00 | Raw/authentic preferred |

## Approval Gates

| Action | Approval |
|--------|----------|
| Publish within approved calendar | Autonomous |
| Off-calendar post | CMO approval |
| Respond to trending moment | CMO approval (or autonomous if brand-safe) |
| Mention pricing or offers | CEO approval |
| Paid boosting of organic post | CEO approval |

## Error Handling

- **Meta API rate limit:** Wait 60 minutes, retry. Log the delay.
- **Instagram container still processing:** Poll status every 30 seconds, max 5 minutes.
- **Image URL expired:** Re-upload to a permanent host, retry.
- **TikTok login expired:** Alert human to re-authenticate via Playwright.
- **Post rejected by Meta:** Read the error, check for policy violations. Do NOT retry — escalate to CMO.

## Expected Outputs

- Published posts on Facebook, Instagram, and TikTok for all 3 brands
- Updated Google Sheets content calendar (posts marked as Published)
- Weekly performance summary report for CMO
- Next week's content pre-generated and queued

## Tools Used

| Tool | Purpose |
|------|---------|
| `tools/publish_organic_post.py` | Publish to Facebook Pages and Instagram |
| `tools/pull_organic_insights.py` | Pull organic performance metrics |
| Playwright MCP | TikTok posting, Instagram Stories |
| Google Sheets MCP | Content calendar tracking |
| `social-media-content-strategy` skill | Content creation and voice compliance |
```

**Step 2: Commit**

```bash
git add workflows/13_organic_social_posting.md
git commit -m "feat: add organic social media publishing workflow (workflow 13)"
```

---

## Task 4: Create the Content Calendar Google Sheets Template

Set up a Google Sheets content calendar that the SMM Expert uses to track and schedule posts.

**Files:**
- No local files — this is a Google Sheets operation via MCP

**Step 1: Create the spreadsheet**

Use the Google Sheets MCP (`mcp__google-workspace__sheets_create_spreadsheet`) to create a new spreadsheet titled "Carisma Social Media Content Calendar 2026".

**Step 2: Create brand tabs**

Create 4 sheets:
1. **Dashboard** — Weekly summary, KPIs across all brands
2. **Spa** — Spa content calendar
3. **Aesthetics** — Aesthetics content calendar
4. **Slimming** — Slimming content calendar

**Step 3: Set up column headers for each brand tab**

| Column | Header | Purpose |
|--------|--------|---------|
| A | Week | Week number (e.g., W14) |
| B | Date | Posting date (YYYY-MM-DD) |
| C | Day | Day of week |
| D | Platform | IG Feed / IG Reels / IG Stories / FB / TikTok |
| E | Pillar | Pain-Solution / Hooked Insight / Objection Flip / Viral / Behind-Clinic |
| F | Sub-Topic | From pillar file |
| G | Format | Image / Reel / Carousel / Story Sequence / Text |
| H | Hook Preview | First line of the post |
| I | Full Caption | Complete caption text |
| J | Media URL | Link to image/video asset |
| K | Status | Draft / Approved / Published / Skipped |
| L | Published Time | Actual publish timestamp |
| M | Post ID | Meta post ID after publishing |
| N | Reach | Organic reach (filled after 48h) |
| O | Engagement | Likes + comments + shares |
| P | Saves | Saved count (IG only) |
| Q | Notes | Any notes or learnings |

**Step 4: Set up Dashboard tab**

Dashboard tab contains:
- Row 1-2: Header with "Carisma Social Media Content Calendar"
- Row 4: Brand selector (Spa / Aesthetics / Slimming / All)
- Row 6-10: This week's KPIs (posts published, total reach, total engagement, avg engagement rate, top post)
- Row 12+: Pillar distribution chart data (% of posts per pillar vs target ratio)

**Step 5: Commit the spreadsheet ID to config**

After creation, save the spreadsheet ID to a config file so tools can reference it:

Create: `config/social_media_calendar.json`
```json
{
  "spreadsheet_id": "<ID_FROM_CREATION>",
  "sheets": {
    "dashboard": 0,
    "spa": 1,
    "aesthetics": 2,
    "slimming": 3
  },
  "created": "2026-03-31",
  "owner": "SMM Expert Specialist"
}
```

```bash
git add config/social_media_calendar.json
git commit -m "feat: add social media content calendar config"
```

---

## Task 5: Update brands.json with Instagram Account IDs

The Instagram Content Publishing API requires Instagram Business Account IDs, which are currently `TO_BE_FILLED` in `config/brands.json`.

**Files:**
- Modify: `config/brands.json`

**Step 1: Retrieve Instagram Business Account IDs**

For each brand, query the Meta Graph API to get the Instagram Business Account linked to the Facebook Page:

```bash
# Replace <PAGE_ID> with each brand's meta_page_id from brands.json
curl "https://graph.facebook.com/v21.0/<PAGE_ID>?fields=instagram_business_account&access_token=$META_ACCESS_TOKEN"
```

Run for:
- Spa: page ID `375775105843811`
- Aesthetics: page ID `117681807972195`
- Slimming: page ID `923445584188552`

**Step 2: Update brands.json**

Replace each `"instagram_account_id": "TO_BE_FILLED"` with the actual Instagram Business Account ID returned by the API.

**Step 3: Commit**

```bash
git add config/brands.json
git commit -m "feat: add Instagram Business Account IDs to brands.json"
```

---

## Task 6: Verify End-to-End with Dry Run

Test the full pipeline without actually publishing.

**Step 1: Generate a sample week of content using the skill**

Load the `social-media-content-strategy` skill, request a weekly content calendar for Carisma Slimming, and verify:
- Content routes to `slimming-pillars.md`
- Pillar ratios are followed (25/20/20/15/20)
- Voice check passes for every piece

**Step 2: Dry-run publish each post**

```bash
python3 tools/publish_organic_post.py \
    --brand carisma_slimming \
    --platform instagram \
    --type image \
    --caption "Generated caption from skill" \
    --image-url "https://example.com/test.jpg" \
    --dry-run
```

Verify: JSON output shows correct page ID, platform, and caption.

**Step 3: Pull insights to confirm read access**

```bash
python3 tools/pull_organic_insights.py --brand carisma_slimming --period last_7_days --output summary
```

Verify: Returns page metrics or a clear permission error indicating what's needed.

**Step 4: Commit verification notes**

No code changes — this is a validation step.

---

## Dependency Graph

```
Task 1 (posting tool) ──────────────────────┐
Task 2 (insights tool) ─────────────────────┤
Task 3 (workflow) ──────────────────────────┤
Task 4 (Google Sheets calendar) ────────────┤── Task 6 (end-to-end verify)
Task 5 (Instagram IDs) ────────────────────┘
```

Tasks 1-5 are independent and can run in parallel. Task 6 depends on all of them.
