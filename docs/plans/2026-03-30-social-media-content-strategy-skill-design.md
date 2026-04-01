# Social Media Content & Creative Strategy Skill — Design

**Date:** 2026-03-30
**Status:** Approved

## Objective

Build a comprehensive social media content and creative strategy skill for all three Carisma brands (Spa, Aesthetics, Slimming). The skill enables generation of content calendars, post copy, captions, reel scripts, story sequences, and creative briefs grounded in brand-specific content pillars.

## Architecture

### Phase 1 — Brand Knowledge Files (Parallel)

Three sub-agents run in parallel, each producing a comprehensive content pillar reference:

| File | Agent | Source |
|------|-------|--------|
| `marketing/marketing-calendar/social-media/aesthetics-pillars.md` | Aesthetics | User-provided AES pillars |
| `marketing/marketing-calendar/social-media/slimming-pillars.md` | Slimming | User-provided SLM pillars + existing brand reference |
| `marketing/marketing-calendar/social-media/spa-pillars.md` | Spa | Derived from AES + SLM, adapted to spa brand voice |

Each knowledge file contains:
- Content pillar definitions with format descriptions and example hooks
- Detailed sub-topics with ready-to-use hook templates per pillar
- Brand voice guardrails specific to social media
- Platform guidance (IG feed/stories/reels, Facebook, TikTok)
- Viral replication reference library with format templates

### Phase 2 — Skill File

Single skill at `.agents/skills/social-media-content-strategy/SKILL.md`:
- Triggers on social media content requests
- Loads correct brand pillar file
- Cross-references `config/branding_guidelines.md` + `config/brands.json`
- Structured workflows per output type (caption, reel, story, calendar, brief)
- Approval gates before publishing

## Out of Scope

- Posting automation (separate Playwright workflow)
- Paid ad creative (existing meta-ads workflows)
- Scheduling tools
