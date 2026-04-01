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
