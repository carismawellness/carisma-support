# Post Log

Past GBP posts are tracked in Google Sheets for rotation analysis, keyword tracking, and performance review.

## How It Works

1. After each posting session, the agent logs posts to the Google Sheets "GBP Post Log" tab
2. The generation tool (`marketing/google-gmb/tools/gbp_generate_posts.py`) reads recent post history to avoid keyword/template repetition
3. Performance data (views, clicks, actions) is added manually during monthly reviews

## Log Schema

| Column | Description |
|--------|-------------|
| Date | Post publish date |
| Brand | Brand name |
| Location(s) | Which GBP locations received the post |
| Post Type | Update / Offer / Event |
| Template | Which template was used |
| Primary Keyword | Main SEO keyword targeted |
| Secondary Keywords | Additional keywords in the post |
| CTA Button | Book / Learn more / Call now / etc. |
| CTA Link | URL the button points to |
| Character Count | Total characters in the post |
| Offer | Which offer was featured (if any) |
| Status | Published / Draft / Failed |
| Post Text | Full text of the post |
| Notes | Any issues, observations, or flags |

## Performance Columns (added monthly)

| Column | Description |
|--------|-------------|
| Views | Total post views (from GBP Insights) |
| Clicks | CTA button clicks |
| Actions | Calls, direction requests, website visits |
| Local Pack Rank | Brand ranking for primary keyword (manual check) |
