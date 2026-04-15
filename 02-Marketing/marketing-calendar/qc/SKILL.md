---
name: qc-verification
description: Use after writing marketing calendar data to verify completeness, formatting, naming conventions, cross-section integrity, and budget validation. Run this as Phase 7 of the calendar-strategy master skill. Catches all known issues from previous calendar builds.
---

# QC Verification Skill

## Overview

Comprehensive quality control for the Marketing Master Google Sheet. Run after every Phase 4-6 execution (write, format, briefs) to catch errors before they reach production.

**Core principle:** Every check has a specific PASS/FAIL criterion with cell references for failures. No vague "looks good" assessments.

## When to Use

- After completing a calendar build (Phase 7 of calendar-strategy)
- After making corrections to an existing calendar
- When the user asks to verify or QC the calendar
- Before presenting the calendar as complete

## QC Checklist

### A. Data Completeness

| # | Check | Row(s) | Rule | PASS Criteria |
|---|-------|--------|------|---------------|
| A1 | Pop-up every Monday | Spa=89, Aes=171, Slim=249 | Every Monday column must have an entry | Count entries = count of Mondays in month |
| A2 | Blog weekly | Spa=92, Aes=172, Slim=250 | Exactly 1 entry per week per brand on Thursday | Count entries = count of Thursdays in month |
| A3 | Email weekly | Spa=51, Aes=139, Slim=219 | Entries for every week with cell notes containing creative briefs | ~3-4 entries per week, all with notes |
| A4 | SMM post on Mon/Wed/Fri | Spa=53, Aes=141, Slim=221 | Entries on Monday, Wednesday, Friday ONLY | No entries on Tue/Thu/Sat/Sun |
| A5 | SMM story on Mon/Wed/Fri | Spa=54, Aes=142, Slim=222 | Entries on Monday, Wednesday, Friday ONLY | No entries on Tue/Thu/Sat/Sun |
| A6 | WhatsApp 1-2 per month | Spa=52, Aes=140, Slim=220 | 1-2 entries per month per brand | Count entries = 1 or 2 |
| A7 | Tablet display | Spa=42 | Has entry (default "General" or occasion name) | At least 1 entry per month |
| A8 | Meta evergreen full span | Spa=6-13, Aes=99-108, Slim=177-190 | Evergreen campaigns span the full quarter/month | No gaps within the active window |
| A9 | Google always-on | Spa=61+, Aes=157+, Slim=237+ | Google campaigns present for the full month | Entries on every Monday |

### B. Naming & Format

| # | Check | Rule | PASS Criteria |
|---|-------|------|---------------|
| B1 | Future CPL = XXX | Meta campaigns for planned/future months use `\| CPL XXX` | No actual CPL numbers (e.g., 1.45) in future months |
| B2 | Past CPL = actual | Meta campaigns for past months use `\| CPL X.XX` | Actual CPL numbers present for completed months |
| B3 | Google naming | Google campaigns follow `Search: keyword \| CPC X.XX` or `Pmax \| desc \| CPC X.XX` | All Google entries match pattern |
| B4 | TB_ prefix | Text-based emails prefixed with `TB_` | No pricing or offers in TB_ email notes |
| B5 | No bold in Meta | Campaign text is NOT bold in any Meta row | `bold: false` across all Meta campaign cells |
| B6 | Email note exists | Every email cell has a cell note with creative brief | Note length > 20 characters |

### C. Formatting

| # | Check | Rule | PASS Criteria |
|---|-------|------|---------------|
| C1 | Font color | All data cells use RGB(0.608, 0.553, 0.514) | Tolerance: +/- 0.02 per channel |
| C2 | Font size consistent | No oversized or undersized cells within a brand section | All cells in a section share the same font size |
| C3 | No green highlights | Green = manual human mark only. Never added programmatically. | No cells with green background (G>0.8, R<0.5, B<0.5) |
| C4 | Background matches brand | Spa=beige, Aesthetics=teal, Slimming=light green | Background colors match config.json values |
| C5 | Month consistency | New month formatting matches previous month | Font family, size, color match reference month |

### D. Alignment

| # | Check | Rule | PASS Criteria |
|---|-------|------|---------------|
| D1 | SMM weekdays only | SMM posts/stories on Mon-Fri, never Sat/Sun | No entries on weekend columns |
| D2 | SMM starts Monday | First SMM entry of the week is on Monday column, not Sunday | Column alignment verified against day-of-week |
| D3 | Column-date alignment | Apr 1 = correct day-of-week column for the target year | Spot-check 3 known dates |
| D4 | Campaign window accuracy | Occasion campaigns match occasion-calendar.json dates | Start/end dates verified |

### E. Cross-Section Integrity

| # | Check | Rule | PASS Criteria |
|---|-------|------|---------------|
| E1 | No cross-contamination | No channel data in wrong row sections | WhatsApp not in Google rows, etc. |
| E2 | Google month-to-month | Always-on Google campaigns have same names each month | Names don't change between months |
| E3 | Evergreen no gaps | Evergreen Meta campaigns have no mid-quarter gaps | Budget rows have values on every active day |
| E4 | Occasion date match | Occasion campaigns match occasion-calendar.json | Window start/end verified |

### F. Budget Validation

| # | Check | Rule | PASS Criteria |
|---|-------|------|---------------|
| F1 | No budget gaps | Budget rows have values on every active day within campaign window | No empty cells in active range |
| F2 | Budget amounts match | Daily budget values match config/budget-allocation.json | Spot-check 5 campaigns |
| F3 | EUR 5 minimum | Every Meta campaign has >= EUR 5/day | No budget below EUR 5 |
| F4 | Slimming USD note | Slimming Meta budgets noted as USD account | Budget values use EUR symbol but account is USD |

## Automated QC Script

For comprehensive QC, run `tools/qc_calendar.py` (or a dedicated QC script). The script should:

1. Read spreadsheet data + formatting via Google Sheets API
2. Execute all checks A-F programmatically
3. Output PASS/FAIL for each check with specific cell references for failures
4. Produce a summary: total PASS / WARN / FAIL counts

### Script Execution Pattern

```python
# Auth using the standard pattern:
# Secrets: ~/.go-google-mcp/client_secrets.json
# Token: ~/.go-google-mcp/token.json
# Reference: tools/fix_april_font_colors.py

# 1. Read values for target month range
# 2. Read formatting (font color, bold, background) for sample cells
# 3. Read cell notes for email rows
# 4. Execute each check, collecting results
# 5. Print PASS/FAIL summary with cell references
```

## QC Severity Levels

| Level | When to Use | Action |
|-------|------------|--------|
| **PASS** | Check fully satisfied | No action needed |
| **WARN** | Minor issue, doesn't block | Flag to user, suggest fix |
| **FAIL** | Major issue, blocks completion | Must fix before calendar is considered complete |

### Severity Classification

- **FAIL:** Missing pop-ups, budget gaps, wrong font color, data in wrong section, bold campaign text
- **WARN:** Blog title missing "SEO:" prefix, email note shorter than expected, minor font size variation
- **PASS:** All criteria met

## Integration with Calendar Strategy

This skill is invoked as **Phase 7** of the `calendar-strategy` master skill. It runs after:
- Phase 4: Spreadsheet write
- Phase 5: Formatting
- Phase 6: Creative briefs

The QC report is presented to the user. If any FAIL items exist, they must be resolved before the calendar is marked complete.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Skipping QC after a "small" change | Always run full QC. Small changes can have cascading effects. |
| Accepting WARN items without review | Review every WARN — some may be actual errors. |
| Not checking cross-section integrity | Data in the wrong row section is a common copy-paste error. |
| Trusting formatting was applied correctly | Always verify with a sample read after formatting. |
| Not counting Mondays for pop-up check | Different months have different Monday counts. Count first. |
| Checking only one brand | Run QC for ALL three brands. Errors often appear in one but not others. |
