# Phase 2: Calendar Integration (Layer)

## Purpose

Produce the Google Ads campaign layer for a marketing calendar. This is invoked during Phase 4 of the `quarterly-marketing-calendar` skill to ensure Google Ads campaigns appear in the final calendar alongside Meta evergreen and occasion-based campaigns.

## Procedure

1. **Read** `~/.claude/skills/google-ads-strategist/SKILL.md` for the full campaign roster
2. **Read** the occasion-based calendar output from Phase 3 (if available)
3. **Check demand-toggle status** for Spa LHR:
   - If occupancy data available: recommend ON/OFF based on booking levels
   - If no data: flag for user decision and default to current known status
4. **Format** campaigns for calendar output
5. **Flag** any seasonal copy updates needed (e.g., LHR ad copy should match seasonal angles)

## Output Format

Produce a table matching the marketing calendar format:

| Campaign Name | Brand | Type | Campaign Type | Status | Calendar Notes |
|--------------|-------|------|---------------|--------|----------------|
| Search: Spa Day | Spa | GOOGLE | Search | ALWAYS-ON | Year-round |
| PMax: Remarketing | Spa | GOOGLE | Performance Max | ALWAYS-ON | Year-round |
| Search: LHR | Spa | GOOGLE | Search | DEMAND-TOGGLE | Check occupancy |
| Maps: Local | Spa | GOOGLE | Maps/Local | ALWAYS-ON | Year-round |
| Search: Botox | Aesthetics | GOOGLE | Search | ALWAYS-ON | Year-round |
| Search: Fillers | Aesthetics | GOOGLE | Search | ALWAYS-ON | Year-round |
| Search: LHR | Aesthetics | GOOGLE | Search | ALWAYS-ON | Year-round |
| Remarketing: LHR | Aesthetics | GOOGLE | Remarketing | ALWAYS-ON | Year-round |
| Search: Micro-needling & Mesotherapy | Aesthetics | GOOGLE | Search | ALWAYS-ON | Top performer |
| Search: Medical Weight Loss | Slimming | GOOGLE | Search | ALWAYS-ON | Year-round |
| Search: Weight Loss | Slimming | GOOGLE | Search | ALWAYS-ON | Year-round |

## Seasonal Copy Notes

Google campaigns don't pause for seasons, but ad copy can rotate:
- **Summer (Apr-Sep):** "Summer ready" angles for Spa Day, LHR
- **Winter (Oct-Mar):** "Winter warmth", "self-care escape" angles for Spa Day
- **Pre-summer (Apr-Jun):** LHR demand peaks — if Spa LHR is OFF due to full booking, note this explicitly

## Integration with calendar-strategy

This output feeds into the marketing calendar spreadsheet:
- Spa Google campaigns: rows 45-50 (3 pairs) + rows 61-72 (6 AON pairs)
- Aesthetics Google campaigns: rows 157-170 (7 pairs)
- Slimming Google campaigns: rows 237-248 (6 pairs)

Refer to `marketing/calendar-strategy/skill/config.json` for exact row mappings.
