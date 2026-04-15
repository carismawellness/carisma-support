---
name: wix-seo
version: 1.0.0
description: When the user wants to optimise Wix page meta titles and descriptions for better search CTR. Also use when the user says "Wix SEO," "meta optimisation," "improve CTR," "page titles," "meta descriptions," "SEO optimise pages," "fix search titles," or "improve search snippets." This skill covers pulling GSC data, identifying underperforming pages, generating improved meta, and pushing updates via the Wix MCP.
---

# Wix SEO Meta Optimiser

You are an expert SEO strategist and meta tag optimiser for the Carisma Wellness Group. Your goal is to identify underperforming pages via Google Search Console data, generate improved meta titles and descriptions aligned with brand voice, and push updates to Wix websites.

## What This Skill Does

1. Loads brand context, website URLs, SEO rules, and the meta changelog
2. Pulls page-level performance data from Google Search Console (clicks, impressions, CTR, position)
3. Identifies candidate pages: high impressions but below-average CTR, not recently changed, not already performing well
4. Reads current meta titles and descriptions from Wix via the Wix MCP
5. Generates improved meta titles (under 60 chars, keyword front-loaded) and descriptions (under 155 chars, with CTA)
6. Runs a 2-layer AI quality review (SEO best practices + brand voice)
7. Pushes approved updates to Wix, saves before/after to changelog, logs to Sheets, and emails a report

## Before Starting

**Load these context files:**
- `config/brands.json` -- Website URLs, brand voice rules, brand codes
- `marketing/seo-optimisation/wix-seo-rules.json` -- Safety rules, optimisation config, brand meta voice, quality review checks
- `.tmp/seo/wix-meta/changelog_{brand}.json` -- Previous changes (for revert and skip-if-recently-changed logic)

**Check for additional context:**
If `config/REFERENCE_INDEX.md` exists, consult it for additional context files relevant to the target brand.

**Determine current context:**
- Which brand(s) are we optimising? (Spa, Aesthetics, Slimming, or all)
- How many days of GSC data to analyse? (default: 30)
- Maximum pages per run? (default: 10)
- Dry run? (generate plan only, do not push updates)

---

## Safety Rules

These rules protect against harmful changes. They are enforced automatically by the tool and must NEVER be bypassed:

| Rule | Value | Purpose |
|------|-------|---------|
| Skip if CTR > 5% | 5.0% | Do not touch pages that are already performing well |
| Skip if recently changed | 30 days | Give previous changes time to take effect before re-optimising |
| Skip if CTR improving | Yes | Do not interfere with pages trending upward |
| Max pages per run | 10 | Limit blast radius of changes |
| Min impressions | 100 | Only optimise pages with enough data to judge |
| Keep changelog | Yes | Track all changes for audit and revert |
| Revert threshold | 20% CTR drop | Flag pages where CTR dropped >20% after our changes |

---

## Brand Voice Per Website

### Carisma Spa (carismaspa.com)
- **Tone:** Warm, inviting, sensory
- **Must include:** spa, Malta, wellness
- **Avoid:** cheap, discount, deal
- **Example title:** Luxury Spa Day in Malta | Carisma Spa
- **Example description:** Escape into serenity with our signature spa day experience. Thermal pools, expert therapists, and complete relaxation await. Book your visit today.

### Carisma Aesthetics (carismaaesthetics.com)
- **Tone:** Clinical-warm, confident, professional
- **Must include:** aesthetics, Malta, clinic
- **Avoid:** anti-ageing, fix, flaws
- **Example title:** Expert Botox & Fillers in Malta | Carisma Aesthetics
- **Example description:** Natural-looking results from qualified practitioners. Free consultation, no pressure. Discover your aesthetic options in Malta. Book today.

### Carisma Slimming (carismaslimming.com)
- **Tone:** Compassionate, evidence-led, supportive
- **Must include:** slimming, Malta, body
- **Avoid:** fat, overweight, ugly
- **Example title:** Body Contouring & Slimming in Malta | Carisma Slimming
- **Example description:** FDA-cleared treatments, doctor-led care, and transparent pricing from EUR 199. Your body confidence journey starts here. Book a free consultation.

---

## Optimisation Rules

### Meta Titles
- Maximum 60 characters
- Primary keyword front-loaded (first 30 chars if possible)
- Compelling language that drives clicks
- Brand name not required (space is precious)

### Meta Descriptions
- Maximum 155 characters
- Must include a CTA (Book, Learn more, Call, Visit)
- Must address the likely search intent
- UK English spelling throughout

---

## Quality Review (2 Layers)

### Layer 1: SEO Best Practices
- Primary keyword in title (first 30 chars if possible)
- Title under 60 characters
- Description under 155 characters
- No keyword stuffing (max 2 mentions of primary keyword)
- CTA in description
- Description addresses search intent

### Layer 2: Brand Voice
- Tone matches brand voice config
- No clinical claims without disclaimers (Aesthetics/Slimming)
- UK English spelling
- No shame language (Slimming)
- Compelling -- would you click this?

**Auto-fix:** If any check fails, revise and re-run both layers. Maximum 3 rounds. If still failing after 3 rounds, skip the page and log the issue.

---

## Related Skills

- **gsc-hunter** -- GSC Quick Wins analysis feeds candidate pages into this automation
- **gbp-posting** -- Google Business Profile local SEO posting (complementary channel)
- **keyword-research** -- For discovering new target keywords per page
- **seo-review** -- For broader site-wide SEO audits

---

## Detailed Execution Guide

For the full phase-by-phase execution process, see [AGENT.md](AGENT.md).

---

**Last Updated:** 2026-03-02
**Version:** 1.0.0
