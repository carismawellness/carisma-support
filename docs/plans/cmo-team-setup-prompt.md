# CMO Marketing Team — Paperclip Setup Prompt

Copy and paste the text below into Claude Code. It will set up the entire CMO marketing team in your Paperclip instance.

---

## PROMPT TO PASTE INTO CLAUDE CODE

---

You are setting up the CMO marketing team for Carisma Wellness Group inside Paperclip AI. This is a 19-agent AI org (1 CMO + 18 specialists) that runs all marketing across three brands: Carisma Spa & Wellness, Carisma Aesthetics, and Carisma Slimming.

## Before You Start

You will need:
1. **Paperclip running locally** at `http://127.0.0.1:3100`
2. **Your Company ID** — find it in Paperclip → Settings → Company, or in the URL when you're logged in
3. **Python 3** installed (`python3 --version`)
4. The **zip folder** extracted somewhere on your machine (you'll be asked for the path)

## The CMO Team Structure

```
CMO  (AI — Claude Sonnet)
│   Cross-brand marketing strategy. Sets quarterly themes, brand standards, KPI targets.
│   Reviews all 3 GM marketing reports. Escalates to CEO only for budget reallocation >20%.
│
├── Marketing Calendar Strategist  (Claude Code)
│   Master orchestrator: 7-phase pipeline, quarterly marketing calendars for all 3 brands.
│   Covers: Meta, Google, Email, SMM (3x/week), WhatsApp, Blog, Pop-up, Tablet.
│   MCP: google-workspace (sheets read/write/batch_update)
│   │
│   └── Budgeting Specialist  (Claude Code)
│       Budget allocation, spend tracking, ROAS/CPL analysis, revenue attribution.
│       Weekly financial report for the Marketing Calendar Strategist.
│
├── Email Marketing Strategist  (Claude Sonnet)
│   Plans email campaigns: topics, calendar, audiences, A/B strategy per brand.
│   Creates briefs for Email Designer. Reviews QC scorecards (/170). Audits Klaviyo.
│   MCP: klaviyo, google-sheets, google-workspace
│   │
│   ├── Email Designer  (Claude Code)
│   │   17-phase Figma emailer pipeline. Production-ready emailers with /170 QC scoring.
│   │   Covers 3 brands via brand-specific configs. Figma-to-HTML export.
│   │   MCP: figma-write, nano-banana, klaviyo
│   │
│   └── Email Creative Strategist  (Claude Haiku)
│       Subject line variants, layout strategy, visual concept briefs, A/B test matrices.
│
├── Meta Strategist  (Claude Code)
│   Evergreen Meta Ads campaign roster across all 3 brands. Layers always-on campaigns
│   into marketing calendars. Performance analysis with winner/watchlist/loser classification.
│   MCP: meta-ads (read + PAUSED creation), google-workspace
│   │
│   ├── Meta Ads Copywriter  (Claude Haiku)
│   │   Primary text, headlines, descriptions, CTAs for Facebook + Instagram.
│   │   Hook patterns: question, stat, pain-point, before/after, curiosity.
│   │
│   ├── Meta Ads Report Analyst  (Claude Haiku)
│   │   Weekly CPL/ROAS reports, creative fatigue detection, winner/watchlist/loser.
│   │
│   └── Meta Ads Creative Strategist  (Claude Haiku)
│       Creative concepts for static/video/carousel/Reels, hook strategies, A/B frameworks.
│
├── Google Ads Specialist  (Claude Code)
│   Proven Google Ads roster: 11 campaigns across 3 brands (Spa 4, Aesthetics 5, Slimming 2).
│   Layers Google campaigns into marketing calendars. Demand-toggle decisions.
│   Advisory only — publishes analysis, does not modify campaigns.
│   │
│   ├── Google Ads Copywriter  (Claude Haiku)
│   │   RSA headlines (30 chars), descriptions (90 chars), sitelinks, callouts.
│   │
│   ├── Google Ads Report Analyst  (Claude Haiku)
│   │   Weekly performance: CPC, CTR, CPA, ROAS. Search term + negative keyword analysis.
│   │
│   └── Google Ads Creative Strategist  (Claude Haiku)
│       Campaign structure, keyword grouping, A/B hypotheses, landing page alignment.
│
├── SMM Expert Specialist  (Claude Code)
│   Owns ALL organic social across 3 brands — content creation through publishing.
│   Plans monthly/weekly content calendars. Publishes via Meta Page API + Playwright.
│   Reports organic social KPIs to CMO weekly.
│   MCP: meta-ads (Page API), playwright, google-sheets
│   │
│   ├── SMM Content Writer  (Claude Haiku)
│   │   Captions, reel scripts, TikTok scripts, story sequences, carousel copy.
│   │   Brand voice per persona (Sarah for Spa/Aesthetics, Katya for Slimming).
│   │
│   ├── SMM Report Analyst  (Claude Haiku)
│   │   Organic metrics: reach, engagement, saves, shares, profile visits per brand.
│   │
│   └── SMM Creative Strategist  (Claude Haiku)
│       Content themes, visual aesthetics, trend integration, UGC strategy.
│
└── Occupancy Checker  (Claude Code)
    Supply-demand optimizer. Scrapes Fresha capacity × Meta Ads performance.
    Generates budget reallocation proposals (advisory only — does not modify campaigns).
    MCP: meta-ads (read insights), google-workspace (sheets), playwright (Fresha)
```

**Total: 19 agents** (1 CMO + 6 direct reports + 12 sub-agents)

## Setup Instructions

### Step 1 — Extract the zip

Extract the zip you received into a folder on your machine. It contains a folder called `.agents/skills/` with one subfolder per agent. Note the full path to the `.agents/skills/` folder.

### Step 2 — Identify which folders to use

The CMO team uses exactly these 18 folders from the zip (ignore everything else):

```
marketing-calendar-strategist/
budgeting-specialist/
email-marketing-strategist/
email-designer/
email-creative-strategist/
meta-strategist/
meta-ads-copywriter/
meta-ads-report-analyst/
meta-ads-creative-strategist/
google-ads-specialist/
google-ads-copywriter/
google-ads-report-analyst/
google-ads-creative-strategist/
smm-expert-specialist/
smm-content-writer/
smm-report-analyst/
smm-creative-strategist/
occupancy-checker/
```

### Step 3 — Create and run the registration script

Save the following as `register_cmo_team.py` in the folder where you extracted the zip, then fill in the two values at the top before running it.

```python
"""
Register the CMO marketing team (19 agents) on Paperclip.
Runs in dependency order: CMO → Wave 1 (direct reports) → Wave 2 (sub-agents).
Saves paperclip-registration.json for each agent after successful registration.

BEFORE RUNNING:
  1. Set COMPANY_ID to your Paperclip company ID (Settings → Company in Paperclip UI)
  2. Make sure Paperclip is running at http://127.0.0.1:3100
  3. Run: python3 register_cmo_team.py
"""

import json
import requests
from pathlib import Path
from datetime import date

# ----------------------------------------------------------------
# FILL THESE IN BEFORE RUNNING
# ----------------------------------------------------------------
COMPANY_ID = "PASTE_YOUR_COMPANY_ID_HERE"
# ----------------------------------------------------------------

BASE_URL    = "http://127.0.0.1:3100"
SKILLS_DIR  = Path(__file__).parent / ".agents" / "skills"
TODAY       = date.today().isoformat()

ADAPTER_SONNET = {
    "adapterType": "claude_local",
    "adapterConfig": {
        "model": "claude-sonnet-4-6",
        "maxTurnsPerRun": 200,
        "instructionsEntryFile": "AGENTS.md",
        "instructionsBundleMode": "managed",
        "dangerouslySkipPermissions": True,
    },
}

ADAPTER_HAIKU = {
    "adapterType": "claude_local",
    "adapterConfig": {
        "model": "claude-haiku-4-5-20251001",
        "maxTurnsPerRun": 100,
        "instructionsEntryFile": "AGENTS.md",
        "instructionsBundleMode": "managed",
        "dangerouslySkipPermissions": True,
    },
}

# ----------------------------------------------------------------
# Agent definitions
# (slug, title, icon, capabilities, parent_key, adapter)
# parent_key = "ROOT" for CMO, slug string for all others
# ----------------------------------------------------------------

WAVE_0 = [  # CMO — reports to root company
    (
        "cmo",
        "CMO",
        "megaphone",
        "Cross-brand marketing strategy and oversight for Carisma Wellness Group. Sets quarterly campaign themes, brand standards, and KPI targets across Carisma Spa, Aesthetics, and Slimming. Reviews all 3 GM marketing reports weekly. Manages a 19-agent marketing org: Marketing Calendar Strategist (+ Budgeting Specialist), Email Marketing Strategist (+ Email Designer + Email Creative Strategist), Meta Strategist (+ 3 sub-agents), Google Ads Specialist (+ 3 sub-agents), SMM Expert Specialist (+ 3 sub-agents), Occupancy Checker. Escalates to CEO only for budget reallocation >20% or strategy pivots.",
        "ROOT",
        ADAPTER_SONNET,
    ),
]

WAVE_1 = [  # Direct CMO reports
    (
        "marketing-calendar-strategist",
        "Marketing Calendar Strategist",
        "calendar",
        "Master orchestrator for quarterly marketing calendar builds across all 3 Carisma brands (Spa, Aesthetics, Slimming). Orchestrates 11 specialist skills through a 7-phase pipeline: context load, strategy design, channel planning, spreadsheet write, formatting, creative briefs, QC verification. Plans and writes all channels into the Marketing Master Google Sheet: Meta Ads, Google Ads, Email, SMM (3x/week), WhatsApp, Blog, Pop-up, Tablet Display. Presents strategy for CEO approval before writing to spreadsheet. MCP: google-workspace (sheets read/write/batch_update).",
        "cmo",
        ADAPTER_SONNET,
    ),
    (
        "email-marketing-strategist",
        "Email Marketing Strategist",
        "mail",
        "Plans email campaigns for all 3 Carisma brands: topics, calendar, audiences, and A/B strategy. Creates 9-section design briefs for the Email Designer. Reviews QC scorecards (/170) and HTML output — approve, revise, or escalate. Audits email performance via Klaviyo against benchmarks (30-40% open rate, 4-6% CTR, 15%+ CTOR). Routes completed HTML to Klaviyo for campaign assembly. 4 actions: plan, brief, review, audit. MCP: klaviyo, google-sheets, google-workspace.",
        "cmo",
        ADAPTER_SONNET,
    ),
    (
        "meta-strategist",
        "Meta Strategist",
        "zap",
        "Owns the evergreen (always-on) Meta Ads campaign roster across all 3 Carisma brands. Layers evergreen campaigns into occasion-based marketing calendars. Advises on campaign structure, naming conventions, budget allocation, and seasonal creative rotation. Performance analysis with winner/watchlist/loser classification. 4 actions: plan, layer, review, audit. Advisory only — creates PAUSED campaigns, does not activate. MCP: meta-ads (read insights + create PAUSED), google-workspace.",
        "cmo",
        ADAPTER_SONNET,
    ),
    (
        "google-ads-specialist",
        "Google Ads Specialist",
        "search",
        "Cross-brand Google Ads authority. Owns the proven Google Ads campaign roster across all 3 Carisma brands (Spa: 4 campaigns, Aesthetics: 5 campaigns, Slimming: 2 campaigns). Layers Google campaigns into marketing calendars alongside Meta evergreen. Pulls weekly Google Ads performance data (clicks, CPC, conversions, spend) and classifies campaigns as winner/watchlist/loser. Publishes optimization recommendations (search terms, negative keywords, bid adjustments, quality scores). Manages demand-toggle decisions (e.g., Spa LHR on/off based on occupancy). Advisory only — publishes analysis, does not modify campaigns.",
        "cmo",
        ADAPTER_SONNET,
    ),
    (
        "smm-expert-specialist",
        "SMM Expert Specialist",
        "sparkles",
        "Owns all organic social media across Carisma Spa, Carisma Aesthetics, and Carisma Slimming. Plans monthly and weekly content calendars using brand-specific content pillar ratios. Creates all organic content: captions, reel scripts, TikTok scripts, story sequences, and creative briefs. Publishes posts via Meta Page API (Facebook/Instagram) and Playwright (TikTok/Stories). Pulls weekly organic performance metrics (reach, engagement, saves, shares, profile visits) per brand. Reports organic social KPIs to CMO weekly. Coordinates seasonal themes across brands.",
        "cmo",
        ADAPTER_SONNET,
    ),
    (
        "occupancy-checker",
        "Occupancy Checker",
        "target",
        "Supply-demand optimizer for the CMO. Scrapes Fresha booking pages for practitioner availability across Slimming (9 services) and Aesthetics (4 services). Cross-references capacity data with Meta Ads campaign performance. Generates budget reallocation proposals: identifies WASTE (spending on full services) and OPPORTUNITY (open capacity with no ads). Publishes optimizer reports (markdown + Google Sheet) and prints executive summary. Advisory only — does not modify campaigns or budgets. MCP: meta-ads (read insights), google-workspace (sheets), playwright (Fresha).",
        "cmo",
        ADAPTER_SONNET,
    ),
]

WAVE_2 = [  # Sub-agents — parent resolved from WAVE_1 results
    # Marketing Calendar Strategist sub-team
    (
        "budgeting-specialist",
        "Budgeting Specialist",
        "bar-chart",
        "Budget allocation across Spa, Aesthetics, and Slimming brands and Meta/Google channels. Weekly spend tracking (actual vs. planned) with variance analysis. ROAS/CPL analysis with winner/loser/watchlist classification. Revenue attribution matching ad spend to business revenue. Weekly consolidated financial report for the Marketing Calendar Strategist. Advisory role — publishes analysis, does not modify campaigns.",
        "marketing-calendar-strategist",
        ADAPTER_SONNET,
    ),
    # Email sub-team
    (
        "email-designer",
        "Email Designer",
        "pen-tool",
        "Executes the full 17-phase Figma emailer pipeline for all 3 Carisma brands (Spa, Aesthetics, Slimming). Builds production-ready emailers with automated QC scoring (/170). Handles semantic image matching and AI image generation via Nano Banana. Exports Figma designs to Gmail-safe HTML. Reports to the Email Marketing Strategist. MCP: figma-write (~60 tools), nano-banana (AI image gen), klaviyo.",
        "email-marketing-strategist",
        ADAPTER_SONNET,
    ),
    (
        "email-creative-strategist",
        "Email Creative Strategist",
        "feather",
        "Plans email creative direction for all 3 Carisma brands. Develops subject line variants and A/B testing matrices. Designs layout strategy and visual concept briefs. Analyses creative performance to identify high-performing formats. Reports to the Email Marketing Strategist.",
        "email-marketing-strategist",
        ADAPTER_HAIKU,
    ),
    # Meta sub-team
    (
        "meta-ads-copywriter",
        "Meta Ads Copywriter",
        "edit-3",
        "Writes all Meta Ads copy for Facebook and Instagram across all 3 Carisma brands. Produces primary text, headlines, descriptions, and CTAs. Applies hook patterns per funnel stage: question, stat, pain-point, before/after, curiosity. Brand voice per persona (Sarah for Spa/Aesthetics, Katya for Slimming). Reports to the Meta Strategist.",
        "meta-strategist",
        ADAPTER_HAIKU,
    ),
    (
        "meta-ads-report-analyst",
        "Meta Ads Report Analyst",
        "activity",
        "Produces weekly Meta Ads performance reports across all 3 Carisma brands. Tracks CPL, ROAS, CTR, frequency, and audience insights. Identifies creative fatigue and audience saturation. Classifies all active ads as winner, watchlist, or loser. Reports to the Meta Strategist.",
        "meta-strategist",
        ADAPTER_HAIKU,
    ),
    (
        "meta-ads-creative-strategist",
        "Meta Ads Creative Strategist",
        "layers",
        "Develops creative strategy for Meta Ads across all 3 Carisma brands. Plans creative concepts for static, video, carousel, and Reels/Stories formats. Writes hook strategies and visual direction briefs. Designs A/B testing frameworks to isolate variables. Reports to the Meta Strategist.",
        "meta-strategist",
        ADAPTER_HAIKU,
    ),
    # Google Ads sub-team
    (
        "google-ads-copywriter",
        "Google Ads Copywriter",
        "type",
        "Writes all Google Ads copy for all 3 Carisma brands. Produces RSA headlines (30 chars max), descriptions (90 chars max), sitelinks, callouts, and structured snippets. Writes direct-response copy for Search, Performance Max, and Maps campaigns. Reports to the Google Ads Specialist.",
        "google-ads-specialist",
        ADAPTER_HAIKU,
    ),
    (
        "google-ads-report-analyst",
        "Google Ads Report Analyst",
        "trending-up",
        "Produces weekly Google Ads performance reports for all 3 Carisma brands. Tracks CPC, CTR, CPA, ROAS, impression share, and Quality Score. Analyses search term reports and recommends negative keywords. Classifies campaigns as winner, watchlist, or loser. Reports to the Google Ads Specialist.",
        "google-ads-specialist",
        ADAPTER_HAIKU,
    ),
    (
        "google-ads-creative-strategist",
        "Google Ads Creative Strategist",
        "grid",
        "Designs campaign structure and keyword grouping strategy for Google Ads across all 3 Carisma brands. Develops A/B test hypotheses for ad copy and landing pages. Recommends seasonal creative rotation. Aligns landing page messaging with ad copy. Reports to the Google Ads Specialist.",
        "google-ads-specialist",
        ADAPTER_HAIKU,
    ),
    # SMM sub-team
    (
        "smm-content-writer",
        "SMM Content Writer",
        "message-square",
        "Creates all organic social media content for all 3 Carisma brands (Spa, Aesthetics, Slimming). Writes captions, reel scripts, TikTok scripts, story sequences, and carousel copy. Adheres to content pillar ratios and brand voice per persona (Sarah for Spa/Aesthetics, Katya for Slimming). Reports to the SMM Expert Specialist.",
        "smm-expert-specialist",
        ADAPTER_HAIKU,
    ),
    (
        "smm-report-analyst",
        "SMM Report Analyst",
        "bar-chart-2",
        "Tracks and analyses organic social media performance for all 3 Carisma brands. Reports weekly on reach, engagement rate, saves, shares, and profile visits per brand. Identifies best-performing content pillars and optimal posting times. Flags underperforming content. Reports to the SMM Expert Specialist.",
        "smm-expert-specialist",
        ADAPTER_HAIKU,
    ),
    (
        "smm-creative-strategist",
        "SMM Creative Strategist",
        "eye",
        "Develops organic social media creative strategy for all 3 Carisma brands. Plans content themes, visual aesthetics, and trend integration. Designs UGC strategies and influencer content briefs. Runs A/B tests on format, posting time, and caption length. Reports to the SMM Expert Specialist.",
        "smm-expert-specialist",
        ADAPTER_HAIKU,
    ),
]


def register_agent(title, icon, capabilities, reports_to_id, adapter):
    payload = {
        "name": title.lower().replace(" ", "-"),
        "role": "general",
        "title": title,
        "icon": icon,
        "reportsTo": reports_to_id,
        "capabilities": capabilities,
        **adapter,
    }
    url = f"{BASE_URL}/api/companies/{COMPANY_ID}/agents"
    resp = requests.post(url, json=payload, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    agent_id = data.get("id") or data.get("agent", {}).get("id")
    return agent_id


def save_registration(slug, title, icon, capabilities, reports_to_id, reports_to_label, agent_id, adapter):
    agent_dir = SKILLS_DIR / slug
    agent_dir.mkdir(parents=True, exist_ok=True)
    reg = {
        "_instructions": f"Registered via POST /api/companies/{COMPANY_ID}/agents on {TODAY}. Agent ID: {agent_id}. Reports to {reports_to_label} ({reports_to_id}).",
        "name": title,
        "role": "general",
        "title": title,
        "icon": icon,
        "reportsTo": reports_to_id,
        "capabilities": capabilities,
        **adapter,
    }
    reg_path = agent_dir / "paperclip-registration.json"
    with open(reg_path, "w") as f:
        json.dump(reg, f, indent=2)

    config_path = agent_dir / "config.json"
    if config_path.exists():
        with open(config_path) as f:
            config = json.load(f)
        config["agent-id"] = agent_id
        with open(config_path, "w") as f:
            json.dump(config, f, indent=2)


def main():
    if COMPANY_ID == "PASTE_YOUR_COMPANY_ID_HERE":
        print("\n❌  ERROR: Set your COMPANY_ID at the top of this script before running.\n")
        return

    registered = {}  # slug -> agent_id

    print(f"\n{'='*65}")
    print("CMO MARKETING TEAM — PAPERCLIP AGENT REGISTRATION")
    print(f"Company: {COMPANY_ID}")
    print(f"{'='*65}\n")

    # ---- WAVE 0: CMO ----
    print("WAVE 0 — CMO\n")
    for slug, title, icon, capabilities, parent_key, adapter in WAVE_0:
        try:
            # CMO reports to the company root — Paperclip uses null or omits reportsTo
            payload = {
                "name": slug,
                "role": "general",
                "title": title,
                "icon": icon,
                "capabilities": capabilities,
                **adapter,
            }
            url = f"{BASE_URL}/api/companies/{COMPANY_ID}/agents"
            resp = requests.post(url, json=payload, timeout=15)
            resp.raise_for_status()
            data = resp.json()
            agent_id = data.get("id") or data.get("agent", {}).get("id")
            registered[slug] = agent_id
            save_registration(slug, title, icon, capabilities, "", "Company Root", agent_id, adapter)
            print(f"  ✓  {title:<45} {agent_id}")
        except Exception as e:
            print(f"  ✗  {title:<45} ERROR: {e}")

    cmo_id = registered.get("cmo")
    if not cmo_id:
        print("\n❌  CMO registration failed. Cannot continue — fix the error above and retry.\n")
        return

    # ---- WAVE 1: Direct CMO reports ----
    print(f"\nWAVE 1 — Direct CMO reports (CMO ID: {cmo_id})\n")
    for slug, title, icon, capabilities, parent_key, adapter in WAVE_1:
        try:
            agent_id = register_agent(title, icon, capabilities, cmo_id, adapter)
            registered[slug] = agent_id
            save_registration(slug, title, icon, capabilities, cmo_id, "CMO", agent_id, adapter)
            print(f"  ✓  {title:<45} {agent_id}")
        except Exception as e:
            print(f"  ✗  {title:<45} ERROR: {e}")

    # ---- WAVE 2: Sub-agents ----
    print(f"\nWAVE 2 — Sub-agents\n")
    for slug, title, icon, capabilities, parent_slug, adapter in WAVE_2:
        parent_id = registered.get(parent_slug)
        if not parent_id:
            print(f"  ✗  {title:<45} SKIP — parent '{parent_slug}' not registered")
            continue
        try:
            agent_id = register_agent(title, icon, capabilities, parent_id, adapter)
            registered[slug] = agent_id
            save_registration(slug, title, icon, capabilities, parent_id, parent_slug, agent_id, adapter)
            print(f"  ✓  {title:<45} {agent_id}")
        except Exception as e:
            print(f"  ✗  {title:<45} ERROR: {e}")

    # ---- Summary ----
    print(f"\n{'='*65}")
    print(f"DONE — {len(registered)} / 19 agents registered")
    print(f"{'='*65}\n")
    print("Agent ID map (save this for reference):")
    for slug, aid in registered.items():
        print(f"  {slug}: {aid}")
    print()


if __name__ == "__main__":
    main()
```

### Step 4 — Point the agents at the skill files

After registration, each agent in Paperclip needs to know where its SKILL.md lives. In Paperclip:

1. Open each agent → Instructions → set the **Skills Directory** to the path of its folder in the zip (e.g. `/path/to/extracted/.agents/skills/email-designer`)
2. Agents that have an `AGENTS.md` file in their folder will pick it up automatically via `instructionsEntryFile: "AGENTS.md"` in the adapter config

Alternatively, if your Paperclip instance is pointed at the extracted zip folder as the project root, the relative paths in `instructionsBundleMode: "managed"` will resolve automatically.

### Governance Rules (important — tell your team)

| Action | Autonomous | Requires approval |
|--------|-----------|-------------------|
| Content creation, copy, analysis | ✓ | |
| Marketing calendar builds | ✓ (after CEO approves plan) | |
| Creating PAUSED campaigns in Meta | ✓ | |
| Activating any paid campaign | | CEO |
| Budget reallocation between brands | | CEO |
| Organic social publishing (within approved calendar) | ✓ | |
| Off-calendar posts or strategy pivots | | CMO |
| Adding/removing evergreen campaigns | | CMO |

**Nothing goes live without human approval. The agents build, analyse, and prepare — humans decide and activate.**

---

*Generated from Carisma Wellness Group agent configuration — 2026-04-01*
