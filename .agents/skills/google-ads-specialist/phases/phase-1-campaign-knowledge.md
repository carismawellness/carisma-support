# Phase 1: Campaign Knowledge (Roster)

## Purpose

Produce the proven Google Ads campaign roster for the requested brand(s). This is the source of truth for "what Google Ads campaigns should be running?"

## Procedure

1. **Read** `~/.claude/skills/google-ads-strategist/SKILL.md`
2. **Filter** to the requested brand(s)
3. **Check demand-toggle status** for any toggleable campaigns:
   - Spa LHR: Ask the user or check scheduling data for current occupancy
4. **Output** the roster in the format below

## Output Format

For each brand, produce:

| Campaign | Type | Status | Notes |
|----------|------|--------|-------|
| Campaign name | Search / PMax / Remarketing / Maps | ALWAYS-ON / DEMAND-TOGGLE (ON/OFF) | Key context |

## Roster Summary

### Carisma Spa (4 campaigns)
- Search: Spa Day (always-on)
- Performance Max: Remarketing (always-on)
- Search: Laser Hair Removal (demand-toggle — check occupancy)
- Maps: Local (always-on)

### Carisma Aesthetics (5 campaigns)
- Search: Botox (always-on)
- Search: Fillers (always-on)
- Search: Laser Hair Removal (always-on)
- Remarketing: LHR (always-on)
- Search: Micro-needling & Mesotherapy (always-on, **top performer**)

### Carisma Slimming (2 campaigns)
- Search: Medical Weight Loss (always-on)
- Search: Weight Loss (always-on)

## When to Use

- Calendar planning (before Phase 2)
- Auditing what should be running vs. what is running
- Answering "what Google campaigns do we have?"
- Onboarding new team members on the Google Ads setup
