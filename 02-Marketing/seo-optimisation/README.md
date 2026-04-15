# SEO Optimisation Systems

## Overview

Two automated SEO systems that work together to improve organic search performance for all 3 Carisma brands.

| System | Cadence | Purpose |
|--------|---------|---------|
| GSC Quick-Win Hunter | Bi-weekly (1st & 15th) | Analyses Google Search Console data to find ranking opportunities and automatically feeds new keywords into GBP posting |
| Wix SEO Auto-Optimiser | Monthly (1st) | Optimises meta titles, descriptions, and on-page elements for pages with low CTR despite good rankings |

### Brand Websites

| Brand | Website | GSC Property |
|-------|---------|--------------|
| Carisma Spa | carismaspa.com | sc-domain:carismaspa.com |
| Carisma Aesthetics | carismaaesthetics.com | sc-domain:carismaaesthetics.com |
| Carisma Slimming | carismaslimming.com | sc-domain:carismaslimming.com |

## How They Work Together

The two systems form a continuous SEO improvement loop:

1. **GSC Quick-Win Hunter** pulls Search Console data and categorises queries into quick-win buckets (Almost Page 1, Low CTR, Emerging, Local Intent)
2. New keyword opportunities are automatically written to `marketing/google-gmb/keywords_{brand}_auto_additions.json`
3. The **GBP Posting System** picks up these auto-additions and weaves them into upcoming posts, boosting local ranking signals
4. Low CTR pages are flagged for the **Wix SEO Auto-Optimiser**, which rewrites meta titles and descriptions to improve click-through rates
5. Next cycle, GSC data reflects the improvements, and the loop continues

```
GSC Data ──> Quick-Win Hunter ──> GBP Keyword Banks ──> GBP Posts ──> Better Rankings
                │                                                          │
                └──> Wix SEO Optimiser ──> Better Meta Tags ──> Higher CTR ─┘
```

## How to Use

### Manual Trigger
Say "run GSC analysis" or invoke the `/gsc-hunter` skill. The agent will:
1. Pull Search Console data for all 3 brands (28-day + 7-day windows)
2. Categorise queries into quick-win buckets
3. Cross-reference against existing keyword banks
4. Add new keywords to GBP auto-additions files
5. Log results to Google Sheets and email a report

### Automated Runs
A launchd job runs daily at 9am, but the script checks whether today is the 1st or 15th and exits early otherwise (launchd does not support bi-monthly scheduling natively).

## File Structure

```
marketing/seo-optimisation/
├── README.md                      # This file
├── strategy.md                    # SEO flywheel strategy, keyword priority framework, KPIs
└── quick-win-criteria.json        # Analysis criteria config (position ranges, CTR thresholds, local keywords)
```

## Related Files

| File | Location | Purpose |
|------|----------|---------|
| Skill definition | `marketing/seo-optimisation/skills/gsc-hunter/SKILL.md` | Skill metadata and triggers |
| Execution guide | `marketing/seo-optimisation/skills/gsc-hunter/AGENT.md` | 5-phase analysis workflow |
| Skill config | `marketing/seo-optimisation/skills/gsc-hunter/config.json` | Inputs, outputs, MCP servers |
| Quick-win finder | `marketing/seo-optimisation/tools/gsc_quick_win_finder.py` | Python analysis tool |
| Workflow SOP | `marketing/seo-optimisation/workflows/gsc_quick_wins.md` | Full workflow documentation |
| Brand config | `config/brands.json` | Brand websites, voice, targeting |
| Keyword banks | `marketing/google-gmb/keyword-banks/*.md` | Existing keyword banks per brand |
| GBP auto-additions | `marketing/google-gmb/keywords_{brand}_auto_additions.json` | Auto-generated keyword additions |
| GBP post generator | `marketing/google-gmb/tools/gbp_generate_posts.py` | Consumes auto-additions via `merge_auto_additions()` |
| Launchd plist | `marketing/seo-optimisation/scheduling/com.carisma.gsc-hunter.plist` | macOS scheduling config |

## Key Rules

- **No manual keyword addition required:** GSC Hunter automatically discovers and routes keywords to GBP posting
- **Cross-referencing:** Every discovered keyword is checked against existing banks to avoid duplicates
- **Priority system:** Almost Page 1 and Local Intent keywords are high priority; Emerging keywords are medium
- **Auto-addition cap:** Maximum 10 new keywords per brand per run to prevent keyword bank bloat
- **Approval gate:** Keyword auto-additions are logged and emailed for human visibility, but do not require approval before use
- **UK English:** All analysis reports and keyword categorisation use British English
