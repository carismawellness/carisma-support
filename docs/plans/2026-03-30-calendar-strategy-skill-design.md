# Calendar Strategy Skill — Design Document

**Date:** 2026-03-30
**Status:** Approved
**Location:** `marketing/calendar-strategy/skill/`

## Problem

Building out a monthly marketing calendar for 3 Carisma brands requires deep knowledge of the spreadsheet structure (row maps, column layout, channel positions), brand voice, campaign naming conventions, seasonal strategy, and formatting rules. Today this knowledge lives only in session context — it's lost between conversations. We need a persistent skill that encodes all of this so any future session can plan and execute a full month in the marketing calendar.

## Solution

A Carisma-pattern skill (`SKILL.md` + `AGENT.md` + `config.json` + `references/`) that handles both strategic planning and spreadsheet execution end-to-end.

## File Layout

```
marketing/calendar-strategy/
    skill/
        SKILL.md                    # Trigger logic, strategic framework, personas
        AGENT.md                    # 7-phase execution SOP
        config.json                 # Spreadsheet structure, row maps, design rules
        references/
            meta-specialist.md      # Meta campaign naming, budget, creative strategy
            email-specialist.md     # Email arc design, TB_ vs design, brief format
            google-specialist.md    # References ~/.claude/skills/google-ads-strategist/SKILL.md
            smm-specialist.md       # Post/story rotation, daily themes
            formatting-rules.md     # Font color, sizes, green highlight rules
            budget-allocation.md    # Budget allocation logic, Q4 override, per-campaign distribution
```

## Trigger Conditions

The skill fires when the user says anything related to:
- Building out a month's marketing calendar (e.g., "build May calendar", "plan Q3")
- Adding campaigns to the marketing calendar
- Fixing calendar formatting or design
- Adding creative briefs to email cells
- Designing marketing strategy for an upcoming period
- Any reference to "marketing calendar", "calendar strategy", "campaign planning"

## SKILL.md — Strategic Framework

### Specialist Personas

| Channel | Persona | Focus |
|---------|---------|-------|
| Meta | 30-year performance marketer & creative strategist | Campaign naming (Name \| CPL/ROAS XX \|), budget pacing, creative angles |
| Email | 30-year email marketer & CRO specialist | TB_ vs design alternation, subject lines, send cadence (3/week/brand) |
| Google | PPC expert | Search/Pmax/Remarketing structure, CPC targets, keyword strategy |
| SMM | Organic content expert | Post/story daily themes (Mon-Fri), content pillars, engagement hooks |

### Monthly Planning Framework

1. Identify key dates/occasions for the target month
2. Design 4-5 weekly campaign arcs building toward occasions
3. Allocate budget across channels per brand (Meta primary, Google secondary)
4. Plan email rhythm: alternating design promos + text-based (TB_) relationship emails
5. Map SMM daily rotation: Mon-Fri stories with brand-specific themed content
6. Cross-reference with evergreen campaigns (always-on, refreshed quarterly)

### Brand Voice Quick Reference

| | Spa | Aesthetics | Slimming |
|---|---|---|---|
| Persona | Sarah | Sarah | Katya |
| Signature | "Peacefully, Sarah" | "Beautifully yours, Sarah" | "With you every step, Katya" |
| Tone | Peaceful, warm, elegant | Graceful, confident, natural | Compassionate, evidence-led |
| Tagline | "Beyond the Spa" | "Glow with Confidence" | "With you every step" |
| Background color | Beige/cream | Teal | Light green-white |

### Files to Load Before Starting

- `config/brands.json` — Ad account IDs, targeting, brand codes
- `config/offers.json` — Active offers with pricing, angles, CTAs
- `config/branding_guidelines.md` — Brand voice do/don't language
- `config/creative_strategy_master.md` — Creative strategy & angles
- `CRM/CRM-SPA/knowledge/brand-voice.md` — Spa brand voice
- `CRM/CRM-AES/knowledge/brand-voice.md` — Aesthetics brand voice
- `CRM/CRM-SLIM/knowledge/brand-voice.md` — Slimming brand voice
- `marketing/spa/meta-ads.md` — Spa active campaigns & budgets
- `marketing/aesthetics/meta-ads.md` — Aesthetics active campaigns & budgets
- `marketing/slimming/meta-ads.md` — Slimming active campaigns & budgets
- `config/budget-allocation.json` — Weekly budgets per brand, channel splits, Q4 override config

## Dependency: quarterly-marketing-calendar Skill

**Location:** `~/.claude/skills/quarterly-marketing-calendar/SKILL.md`

This skill is invoked during Phase 2 to determine WHAT campaigns to run. It handles:
- Malta-specific occasion research (public holidays, festas, events, awareness days)
- Mandatory occasion calendar (non-negotiable monthly themes)
- Brand-specific filtering (3 parallel agents — one per brand)
- Campaign design with angles, offers, and creative formats

The calendar-strategy skill's Phase 2 runs the quarterly-marketing-calendar flow, then Phase 3 maps its output into specific spreadsheet rows/cells.

**Integration point:** Phase 2 output (occasion-based campaign plan per brand) feeds directly into Phase 3 (mapping campaigns to spreadsheet rows with naming conventions and budgets).

## AGENT.md — 7-Phase Execution SOP

### Phase 1: Context Load
- Read previous month's data from the sheet (last completed month)
- Load `config.json` for row maps, column positions, design rules
- Load brand knowledge files (brand voice, offers, active campaigns)
- Identify the target month's column range using the month-to-column formula

### Phase 2: Strategy Design (invokes quarterly-marketing-calendar)
- **Invoke the `quarterly-marketing-calendar` skill** for the target month(s)
- This runs the 3-phase occasion research flow:
  1. Research Agent finds all Malta occasions for the target period
  2. Three Brand Filter Agents (parallel) select relevant occasions per brand
  3. Campaign Designer turns filtered occasions into campaign plans with angles, offers, formats
- Take the campaign plan output and map it into weekly arcs
- Design thematic progression across the month (e.g., Easter > Spring Refresh > Summer Prep > Mother's Day)
- Present strategy to user for approval before proceeding

### Phase 3: Campaign Planning
- Name every Meta campaign following `Name | CPL/ROAS XX |` convention
- Plan every email: name, type (TB_ or design), weekly theme alignment
- Map Google campaigns (Search, Pmax, Remarketing) with CPC/budget targets
- Design SMM post + story rotation with daily themes
- Plan WhatsApp blasts where applicable (Slimming)
- Present full campaign plan to user for approval

### Phase 3.5: Budget Assignment
- Load `config/budget-allocation.json` for weekly budgets and split rules
- Load `references/budget-allocation.md` for allocation logic
- For Q4 months (Oct/Nov/Dec), read 2025 spreadsheet to get override budgets
- Compute evergreen pool (60% of Meta) and seasonal pool (40% of Meta)
- Distribute daily budgets across planned campaigns
- Validate: no campaign below EUR 5/day minimum — reduce campaign count if needed
- Distribute Google budget: 50% Search, 30% Pmax, 20% Remarketing
- Present budget allocation table to user for approval before Phase 4

### Phase 4: Spreadsheet Write
- Launch 3 parallel brand agents (one per brand)
- Each agent writes its section using Google Sheets MCP (`sheets_update_values`)
- Campaign names go in Name rows, budgets in Budget rows
- Emails go in Email row, SMM in Post/Story rows
- Follow previous month's patterns for cell placement (which days get values)

### Phase 5: Formatting & Design
- Copy formatting from previous month using `sheets_batch_update` with `copyPaste PASTE_FORMAT`
- Remove any green highlights (forecast, not live — only humans mark green)
- Fix font color to `RGB(0.608, 0.553, 0.514)` across all cells
- Fix font family/size to match previous month reference
- Unbold all campaign text
- Use `tools/fix_april_font_colors.py` pattern for direct API formatting calls

### Phase 6: Creative Briefs
- Launch 3 parallel brand agents (one per brand)
- Each agent reads brand knowledge and tone of voice
- Adds cell notes to every email cell with full creative brief:
  - Subject Line, Preview Text, Hook, Body Angle, CTA, Tone, Visual direction, Notes
- TB_ emails: personal letter from brand persona, no pricing, pure value
- Design emails: promotional with pricing grid, seasonal imagery, clear CTA

### Phase 7: QC Verification
- Launch QC agent to compare new month against previous months
- Check: campaign count per channel, budget levels, naming conventions, email count
- Check: no missing days, no empty rows that should have data
- Flag major issues (>20% deviation) and minor issues
- Report pass/fail with specific issues listed

## config.json — Spreadsheet Structure

### Core IDs
- Spreadsheet: `1q40Ke8wRsjnoVOngDupVdwxIWiTFXwYfh1ZwvUa9xtc`
- Sheet: `Calendar '26` (sheetId: `703110006`)

### Column Layout (0-indexed)
- Each month spans ~30 columns (one per day)
- Jan: cols 2-32, Feb: 33-60, Mar: 61-91, Apr: 92-121
- Formula: `month_start_col = 2 + sum(days_in_previous_months)`

### Brand Row Ranges (1-indexed, as displayed in sheet)

**Spa (rows 5-95):**
- Meta campaigns: rows 6-41 (18 Name/Budget pairs)
- Tablet Display: row 42
- SMS/WA Campaign: rows 43-44
- Google Campaign: rows 45-50 (3 pairs)
- Email Marketing: row 51
- WhatsApp Blast: row 52
- SMM Post: row 53, SMM Story: row 54
- Influencer/UGC: rows 55-60
- Google AON: rows 61-72 (6 pairs)
- Giveaway + seasonal: rows 75-84
- Bing: row 87, Pop Up: row 89, Blog: row 92
- Linkbuilding: rows 94-95

**Aesthetics (rows 98-175):**
- Meta campaigns: rows 99-132 (17 Name/Budget pairs)
- Email Marketing: row 139, WhatsApp: row 140
- SMM Post: row 141, SMM Story: row 142
- Influencer/Giveaway: rows 143-150
- Partner/Hotel/SMS: rows 151-156
- Google campaigns: rows 157-170 (7 pairs)
- Pop Up: row 171, Blog: row 172, Linkbuilding: rows 173-174

**Slimming (rows 176-250):**
- Meta campaigns: rows 177-212 (18 Name/Budget pairs)
- Email Marketing: row 219, WhatsApp: row 220
- SMM Post: row 221, SMM Story: row 222
- Influencer/Giveaway: rows 223-230
- Partner/Hotel/SMS: rows 231-236
- Google campaigns: rows 237-248 (6 pairs)
- Pop Up: row 249, Blog: row 250

### Design Rules
- Font color: `RGB(0.608, 0.553, 0.514)` — warm brownish-gray (all data cells)
- Campaign text bold: `false` (never bold campaign names)
- Green highlight: manual only (humans mark live campaigns; forecasts stay neutral)
- Spa background: `RGB(0.973, 0.953, 0.922)` — beige/cream
- Aesthetics background: `RGB(0.918, 0.945, 0.941)` — teal
- Slimming background: `RGB(0.973, 1.000, 0.965)` — light green-white

### Naming Conventions
- Meta campaigns: `Campaign Name | CPL XX` or `Campaign Name | ROAS XX |`
- Google campaigns: `Search: keyword | CPC XX | XXx` or `Pmax | description | CPC xxx`
- Email (text-based): prefix with `TB_` (e.g., `TB_Easter Last Chance`)
- Email (design/promo): no prefix (e.g., `Easter Final Offer`, `Spring Packages`)
- SMM stories: themed daily rotation (Mon-Fri only)

### Tools
- Values read/write: Google Sheets MCP (`sheets_read_values`, `sheets_update_values`, `sheets_batch_update`)
- Formatting (font, color, background): Direct Google Sheets API via `googleapiclient` (auth at `~/.go-google-mcp/`)
- Creative brief notes: `sheets_batch_update` with `updateCells` + `fields: "note"`
- Format cloning: `sheets_batch_update` with `copyPaste` + `pasteType: PASTE_FORMAT`

## Verification

After implementation:
1. Invoke the skill with "build out May 2026 calendar" and verify it loads config correctly
2. Confirm it reads April data as the previous month reference
3. Verify the strategy phase produces sensible campaign arcs with seasonal awareness
4. Check that the spreadsheet write phase places data in the correct cells
5. Confirm formatting matches the design rules in config.json
6. Verify creative briefs reference correct brand voice per brand
