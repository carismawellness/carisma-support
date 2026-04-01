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
