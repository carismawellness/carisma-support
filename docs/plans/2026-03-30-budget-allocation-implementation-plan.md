# Budget Allocation Skill — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a budget allocation system (config + reference) that the calendar-strategy skill uses to assign per-campaign budgets during Phase 3.

**Architecture:** Central config file (`config/budget-allocation.json`) holds all budget numbers. A reference file (`marketing/calendar-strategy/skill/references/budget-allocation.md`) contains the allocation logic. The calendar-strategy design doc is updated to integrate both.

**Tech Stack:** JSON config, Markdown reference, Google Sheets MCP for Q4 reads.

---

### Task 1: Create the budget config directory check

**Files:**
- Check: `config/` directory exists

**Step 1: Verify config directory**

Run: `ls config/`
Expected: Directory exists (it should — `brands.json`, `kpi_thresholds.json`, etc. are already there)

---

### Task 2: Create `config/budget-allocation.json`

**Files:**
- Create: `config/budget-allocation.json`

**Step 1: Write the config file**

```json
{
  "version": "1.0.0",
  "last_updated": "2026-03-30",
  "currency": "EUR",
  "weekly_budgets": {
    "spa": {
      "meta_eur": 350,
      "google_eur": 840,
      "total_eur": 1190,
      "channel_split_note": "Spa skews Google-heavy (30/70) due to strong search intent for hotel spa and spa day queries"
    },
    "aesthetics": {
      "meta_eur": 560,
      "google_eur": 140,
      "total_eur": 700,
      "channel_split_note": "Meta-primary (80/20). Google supplements with search and remarketing"
    },
    "slimming": {
      "meta_eur": 400,
      "google_eur": 100,
      "total_eur": 500,
      "channel_split_note": "Meta-primary (80/20). Newer brand, awareness-driven"
    }
  },
  "meta_campaign_split": {
    "evergreen_pct": 60,
    "seasonal_pct": 40,
    "note": "Evergreen = always-on campaigns (Spa Day, Massage, Botox, Fat Freeze). Seasonal = occasion-based campaigns from the quarterly-marketing-calendar skill."
  },
  "minimum_campaign_daily_eur": 5,
  "minimum_campaign_note": "No single Meta campaign should receive less than EUR 5/day. Below this, Meta's delivery algorithm underperforms. Reduce campaign count rather than spreading too thin.",
  "q4_override": {
    "months": [10, 11, 12],
    "method": "spreadsheet_read",
    "spreadsheet_id": "1q40Ke8wRsjnoVOngDupVdwxIWiTFXwYfh1ZwvUa9xtc",
    "sheet_name": "Calendar '25",
    "instructions": "For Oct/Nov/Dec planning, read actual Q4 2025 budget values from the Meta and Google Budget rows for each brand. Use those as the weekly budget baseline instead of the defaults above."
  }
}
```

**Step 2: Validate JSON is well-formed**

Run: `python3 -c "import json; json.load(open('config/budget-allocation.json')); print('Valid JSON')"`
Expected: `Valid JSON`

**Step 3: Commit**

```bash
git add config/budget-allocation.json
git commit -m "feat: add budget allocation config for marketing calendar"
```

---

### Task 3: Create calendar-strategy reference directory

**Files:**
- Create: `marketing/calendar-strategy/skill/references/` (directory)

**Step 1: Create the directory tree**

Run: `mkdir -p marketing/calendar-strategy/skill/references`

**Step 2: Verify**

Run: `ls marketing/calendar-strategy/skill/references/`
Expected: Empty directory (ready for reference files)

---

### Task 4: Create `references/budget-allocation.md`

**Files:**
- Create: `marketing/calendar-strategy/skill/references/budget-allocation.md`

**Step 1: Write the budget allocation reference**

```markdown
# Budget Allocation Reference

This reference is loaded during Phase 3 (Campaign Planning) of the calendar-strategy skill. It defines how to distribute ad spend budgets across channels, campaign types, and individual campaigns.

## Source of Truth

All budget numbers live in `config/budget-allocation.json`. Load that file first.

## Allocation Procedure

### Step 1: Determine Weekly Budgets

- If target month is **January–September**: use `weekly_budgets` from config directly
- If target month is **October–December**: execute the Q4 Override (see below)

### Step 2: Split Meta Budget by Campaign Type

For each brand's Meta weekly budget:
- **Evergreen pool** = `meta_eur × 0.60`
- **Seasonal pool** = `meta_eur × 0.40`

| Brand | Meta/wk | Evergreen/wk (60%) | Seasonal/wk (40%) |
|-------|---------|--------------------|--------------------|
| Spa | €350 | €210 | €140 |
| Aesthetics | €560 | €336 | €224 |
| Slimming | €400 | €240 | €160 |

### Step 3: Compute Per-Campaign Daily Budgets

1. Count the number of **evergreen campaigns** planned for the month (from meta-strategist output)
2. Count the number of **seasonal campaigns** planned (from quarterly-marketing-calendar output)
3. Compute:
   - Each evergreen campaign daily = `(evergreen_pool / 7) / num_evergreen_campaigns`
   - Each seasonal campaign daily = `(seasonal_pool / 7) / num_seasonal_campaigns`
4. Round to nearest €1

### Step 4: Validate Minimum Budget

Check every campaign against the **€5/day minimum** (`minimum_campaign_daily_eur` in config).

If any campaign falls below €5/day:
- Do NOT spread budget thinner
- Instead, **reduce the campaign count** — cut the lowest-priority campaigns until remaining campaigns each get ≥€5/day
- Priority order for cutting: LOW priority seasonal first, then MEDIUM, never cut HIGH (mandatory occasions)

### Step 5: Distribute Google Budget

Split each brand's Google weekly budget across active Google campaign types:
- **Search campaigns**: 50% of Google budget
- **Pmax campaigns**: 30% of Google budget
- **Remarketing**: 20% of Google budget

If a brand doesn't run all three types, redistribute proportionally across active types.

| Brand | Google/wk | Search (50%) | Pmax (30%) | Remarketing (20%) |
|-------|-----------|-------------|------------|-------------------|
| Spa | €840 | €420 | €252 | €168 |
| Aesthetics | €140 | €70 | €42 | €28 |
| Slimming | €100 | €50 | €30 | €20 |

### Step 6: Write Budgets to Campaign Plan

- Include daily budget in every Meta campaign name: `Campaign Name | CPL XX |` where XX = daily budget
- Write computed daily budget to the Budget row below each campaign Name row in the spreadsheet
- Include Google daily budget in Google campaign names: `Search: keyword | CPC XX | XXx`

## Q4 Override Procedure

For **October, November, December** planning:

1. Load the 2025 marketing calendar spreadsheet:
   - Spreadsheet: `1q40Ke8wRsjnoVOngDupVdwxIWiTFXwYfh1ZwvUa9xtc`
   - Sheet: `Calendar '25`
2. Use `sheets_read_values` to read the Budget rows for each brand:
   - Spa Meta Budget rows: rows 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41
   - Spa Google Budget rows: rows 46, 48, 50, 62, 64, 66, 68, 70, 72
   - Aesthetics Meta Budget rows: rows 100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 122, 124, 126, 128, 130, 132
   - Aesthetics Google Budget rows: rows 158, 160, 162, 164, 166, 168, 170
   - Slimming Meta Budget rows: rows 178, 180, 182, 184, 186, 188, 190, 192, 194, 196, 198, 200, 202, 204, 206, 208, 210, 212
   - Slimming Google Budget rows: rows 238, 240, 242, 244, 246, 248
3. Read columns for Oct (day 1–31), Nov (day 1–30), Dec (day 1–31)
4. Sum the daily budgets to compute weekly averages per brand per channel
5. Use those weekly averages as the budget baseline for Q4 2026 planning (replacing `weekly_budgets` defaults)

## Quick Reference Table

| Brand | Total/wk | Meta/wk | Google/wk | Meta/day | Google/day |
|-------|----------|---------|-----------|----------|------------|
| Spa | €1,190 | €350 | €840 | ~€50 | €120 |
| Aesthetics | €700 | €560 | €140 | ~€80 | ~€20 |
| Slimming | €500 | €400 | €100 | ~€57 | ~€14 |
| **Total** | **€2,390** | **€1,310** | **€1,080** | **€187** | **€154** |
```

**Step 2: Commit**

```bash
git add marketing/calendar-strategy/skill/references/budget-allocation.md
git commit -m "feat: add budget allocation reference for calendar-strategy skill"
```

---

### Task 5: Update calendar-strategy design doc — add budget to Files to Load

**Files:**
- Modify: `docs/plans/2026-03-30-calendar-strategy-skill-design.md:71-82`

**Step 1: Add budget config to the "Files to Load" list**

After line 82 (`marketing/slimming/meta-ads.md`), add:
```
- `config/budget-allocation.json` — Weekly budgets per brand, channel splits, Q4 override config
```

**Step 2: Commit**

```bash
git add docs/plans/2026-03-30-calendar-strategy-skill-design.md
git commit -m "docs: add budget-allocation.json to calendar-strategy files-to-load list"
```

---

### Task 6: Update calendar-strategy design doc — add Phase 3.5 Budget Assignment

**Files:**
- Modify: `docs/plans/2026-03-30-calendar-strategy-skill-design.md:116-122`

**Step 1: Add budget assignment sub-phase after Phase 3**

After line 122 (`- Present full campaign plan to user for approval`), add:

```markdown

### Phase 3.5: Budget Assignment
- Load `config/budget-allocation.json` for weekly budgets and split rules
- Load `references/budget-allocation.md` for allocation logic
- For Q4 months (Oct/Nov/Dec), read 2025 spreadsheet to get override budgets
- Compute evergreen pool (60% of Meta) and seasonal pool (40% of Meta)
- Distribute daily budgets across planned campaigns
- Validate: no campaign below €5/day minimum — reduce campaign count if needed
- Distribute Google budget: 50% Search, 30% Pmax, 20% Remarketing
- Present budget allocation table to user for approval before Phase 4
```

**Step 2: Commit**

```bash
git add docs/plans/2026-03-30-calendar-strategy-skill-design.md
git commit -m "docs: add Phase 3.5 budget assignment to calendar-strategy design"
```

---

### Task 7: Update calendar-strategy design doc — add budget-allocation.md to file layout

**Files:**
- Modify: `docs/plans/2026-03-30-calendar-strategy-skill-design.md:17-29`

**Step 1: Add budget-allocation.md to the references section**

In the file layout tree (around line 28, after `formatting-rules.md`), add:
```
            budget-allocation.md    # Budget allocation logic, Q4 override, per-campaign distribution
```

**Step 2: Commit**

```bash
git add docs/plans/2026-03-30-calendar-strategy-skill-design.md
git commit -m "docs: add budget-allocation.md to calendar-strategy file layout"
```

---

### Task 8: Verification — validate all files exist and are well-formed

**Step 1: Check config file exists and parses**

Run: `python3 -c "import json; d=json.load(open('config/budget-allocation.json')); print(f'Brands: {list(d[\"weekly_budgets\"].keys())}'); print(f'Total weekly: EUR {sum(b[\"total_eur\"] for b in d[\"weekly_budgets\"].values())}')"`

Expected:
```
Brands: ['spa', 'aesthetics', 'slimming']
Total weekly: EUR 2390
```

**Step 2: Check reference file exists**

Run: `ls -la marketing/calendar-strategy/skill/references/budget-allocation.md`
Expected: File exists with non-zero size

**Step 3: Verify design doc has all three additions**

Run: `grep -c "budget-allocation" docs/plans/2026-03-30-calendar-strategy-skill-design.md`
Expected: At least 3 matches (file layout, files-to-load, Phase 3.5)

**Step 4: Verify git log shows the commits**

Run: `git log --oneline -5`
Expected: 4-5 recent commits with budget allocation messages
