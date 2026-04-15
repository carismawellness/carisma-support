---
name: tablet-popup
description: Use when planning tablet display content (in-clinic screens) and website pop-up content for Carisma brands. Tablet displays change based on active occasions (default "General"). Pop-ups run every Monday (default "Spin wheel pop up", occasion-specific during campaigns).
---

# Tablet Display & Website Pop-Up Planner

## Overview

Plan two low-effort, high-visibility touchpoints: **in-clinic tablet displays** and **website pop-ups**. Both follow the occasion calendar but have sensible defaults when no occasion is active.

## Tablet Display

### Purpose
The tablet in-clinic displays show promotional content to walk-in clients and waiting area visitors. Content changes based on the active occasion/campaign.

### Row Mapping

| Brand | Tablet Display Row |
|-------|-------------------|
| Spa | 42 |
| Aesthetics | TBD (check spreadsheet — likely in the 133-138 range) |
| Slimming | TBD (check spreadsheet — likely in the 213-218 range) |

**Note:** Only Spa has a confirmed tablet display row (42). Check the actual spreadsheet for Aesthetics and Slimming rows before writing. If no dedicated row exists, skip tablet for those brands.

### Content Rules

| State | Display Content | Cell Format |
|-------|----------------|-------------|
| **No active occasion** | "General" | `General` on the first Monday of the month |
| **Active occasion** | Occasion theme/offer name | `[Occasion Name]` on the first day of the campaign window |

### Planning Logic

```
For each week in the target month:
  1. Check occasion-calendar.json — is an occasion campaign active this week?
     -> YES: Display = occasion theme name (e.g., "Easter Special", "Mother's Day Gifting")
     -> NO: Display = "General"
  2. Only write a cell when the content CHANGES (not every day)
     -> Place the value on the first day the new content takes effect
     -> Leave subsequent days empty until the next change
```

**Example for April 2026:**
- Apr 1: "Easter Special" (Easter campaign active)
- Apr 7: "General" (Easter campaign ended Apr 6)
- Apr 26: "Mother's Day Gifting" (Mother's Day campaign starts)

## Website Pop-Up

### Purpose
Website pop-ups capture visitor attention and drive conversions. Default is a gamified "Spin wheel" pop-up. During occasions, it switches to occasion-specific offers.

### Row Mapping

| Brand | Pop-Up Row |
|-------|-----------|
| Spa | 89 |
| Aesthetics | 171 |
| Slimming | 249 |

### Content Rules

| State | Pop-Up Content | Cell Format |
|-------|---------------|-------------|
| **No active occasion** | Spin wheel gamification | `Spin wheel pop up` |
| **Active occasion** | Occasion-specific offer | `[Occasion Name] Pop-Up` |

### Planning Logic — CRITICAL: Every Monday MUST have an entry

```
For each Monday in the target month:
  1. Check occasion-calendar.json — is an occasion campaign active this week?
     -> YES: Pop-up = "[Occasion Name] Pop-Up" (e.g., "Mother's Day 20% Off Pop-Up")
     -> NO: Pop-up = "Spin wheel pop up"
  2. Write the value on EVERY Monday column — no gaps allowed
```

**Validation rule:** Count the Mondays in the target month. The pop-up row must have exactly that many entries, one per Monday.

**Example for April 2026 (Mondays: Apr 6, 13, 20, 27):**
- Apr 6: "Easter Pop-Up" (Easter campaign active until Apr 6)
- Apr 13: "Spin wheel pop up"
- Apr 20: "Spin wheel pop up"
- Apr 27: "Mother's Day Pop-Up" (Mother's Day campaign starts Apr 26)

## Integration with Occasion Calendar

Both tablet and pop-up reference `marketing/marketing-calendar/occasions/occasion-calendar.json` to determine:
1. Which occasions are active in the target month
2. The campaign window dates (start/end)
3. The occasion name for display content

## Integration with Calendar Strategy

This skill is invoked during **Phase 4** of the `calendar-strategy` master skill, alongside the main spreadsheet write. After Meta, Google, Email, SMM, WhatsApp, and Blog rows are written, add tablet display and pop-up entries.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Missing pop-up entry on a Monday | EVERY Monday must have a pop-up. Count Mondays, count entries. |
| Leaving tablet on "General" during an active occasion | Check occasion-calendar.json for active campaigns. |
| Writing pop-up entries on non-Monday days | Pop-ups refresh weekly on Mondays only. |
| Forgetting to reset pop-up after an occasion ends | Next Monday after the occasion ends = "Spin wheel pop up". |
| Writing to wrong rows | Spa pop-up=89, Aesthetics=171, Slimming=249. Tablet=42 (Spa confirmed). |
| Writing tablet content every day | Only write when content changes. |
