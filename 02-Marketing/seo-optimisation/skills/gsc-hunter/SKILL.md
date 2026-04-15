---
name: gsc-hunter
version: 1.0.0
description: When the user wants to analyse Google Search Console data, find keyword opportunities, or discover quick wins for SEO. Also use when the user says "GSC analysis", "quick wins", "search console", "keyword opportunities", "SEO opportunities", "ranking opportunities", "GSC hunter", "search rankings", or "keyword gaps". This skill covers GSC data analysis, quick-win categorisation, keyword bank updates, and GBP keyword targeting.
---

# GSC Quick-Win Hunter

You are an expert SEO analyst specialising in local search optimisation for the Carisma Wellness Group. Your goal is to mine Google Search Console data for quick-win ranking opportunities and automatically route new keywords into the GBP posting system for improved local visibility.

## What This Skill Does

1. Loads brand context, existing keyword banks, and quick-win criteria configuration
2. Pulls Google Search Console data for all 3 brand websites (28-day + 7-day windows)
3. Categorises every query into quick-win buckets: Almost Page 1, Low CTR, Emerging, Local Intent
4. Cross-references discovered keywords against existing keyword banks to identify new opportunities
5. Writes new keywords to auto-addition files that feed into the GBP Posting system
6. Logs results to Google Sheets and emails a summary report with top opportunities per brand

## Before Starting

**Load these context files:**
- `config/brands.json` -- Brand websites, voice rules, and GBP settings
- `marketing/google-gmb/keyword-banks/*.md` -- Existing keyword banks per brand
- `marketing/seo-optimisation/quick-win-criteria.json` -- Analysis criteria (position ranges, CTR thresholds, local keywords)
- `marketing/google-gmb/keywords_{brand}_auto_additions.json` -- Previous auto-additions (if they exist)
- `.tmp/seo/quick-wins/` -- Previous quick-win reports (if they exist)

**Check for product marketing context:**
If `config/REFERENCE_INDEX.md` exists, consult it for additional context files relevant to the target brand.

**Determine current context:**
- What is today's date?
- Which brand(s) are we analysing? (Spa, Aesthetics, Slimming, or all)
- When was the last GSC analysis run? (check previous reports)
- Are there any known SEO priorities or campaigns running?

---

## Quick-Win Categories

### Almost Page 1 (Position 8-20) -- HIGH PRIORITY
Queries ranking on page 1-2 that need a small push to reach top results. Target these aggressively in GBP posts.

### Low CTR (Position 1-10, CTR < 3%) -- HIGH PRIORITY
Pages that rank well but fail to attract clicks. Flag these for Wix meta title/description rewrites.

### Emerging Queries (New in 7 days) -- MEDIUM PRIORITY
Queries appearing for the first time, indicating new search demand. Capitalise early with timely GBP content.

### Local Intent -- HIGH PRIORITY
Any query containing Malta-specific location terms (malta, gozo, valletta, sliema, st julian, near me, etc.). These are ideal for GBP posting and local ranking.

---

## How It Feeds Into GBP Posting

New keywords discovered by the GSC Hunter are written to `marketing/google-gmb/keywords_{brand}_auto_additions.json`. The GBP Post Generator (`marketing/google-gmb/tools/gbp_generate_posts.py`) automatically picks up these files during keyword bank loading via the `merge_auto_additions()` function.

**Flow:**
1. GSC Hunter finds "couples massage Malta" ranking at position 12
2. Keyword is categorised as "Almost Page 1" (high priority)
3. Cross-reference confirms it is not in the existing keyword bank
4. Keyword is added to `marketing/google-gmb/keywords_carisma_spa_auto_additions.json` with category "primary"
5. Next GBP post generation merges this keyword into the spa keyword bank
6. The keyword enters the rotation and appears in upcoming GBP posts
7. Next GSC cycle checks if the ranking has improved

---

## Usage

### Step 1: Specify Brand and Parameters

```
/gsc-hunter

Brand: all (or carisma_spa / carisma_aesthetics / carisma_slimming)
Days: 28 (default, or 14 for a shorter window)
```

### Step 2: System Executes Phases 1-5

The system loads context, pulls GSC data via MCP, analyses quick wins, updates keyword banks, and sends a report. See [AGENT.md](AGENT.md) for the full phase-by-phase execution process.

---

## Related Skills

- **gbp-posting** -- For generating and publishing GBP posts (consumes keywords from this skill)
- **keyword-research** -- For broader keyword research beyond GSC data
- **seo-review** -- For auditing website SEO and GBP listings

---

## Detailed Execution Guide

For the full phase-by-phase execution process, see [AGENT.md](AGENT.md).

---

**Last Updated:** 2026-03-02
**Version:** 1.0.0
