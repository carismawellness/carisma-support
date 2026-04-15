# Google Reviews

Google review monitoring and response automation for Carisma Wellness Group. Fetches new reviews, generates brand-appropriate responses, and maintains response quality standards.

---

## Purpose

Automated review response pipeline — fetches new Google reviews, classifies sentiment, generates on-brand responses following review response rules, and queues them for human approval before posting.

## Folder Structure

| Folder | Purpose |
|--------|---------|
| `knowledge/` | Review response best practices, sentiment patterns, escalation criteria |
| `skill/` | Agent skill definition for review response automation |
| `hooks/` | Triggers and templates for review response workflows |
| `scheduling/` | launchd plist for automated review checking |
| `tools/` | Python scripts for fetching and processing reviews |

## Key Files

- `workflow.md` — Full SOP for review response workflow
- `response-templates.md` — Templates for different review types and sentiments
- `review-response-rules.json` — Rules governing response tone, length, and content

---

## Self-Improvement Loop

### Active Rules

_No active rules yet. The system will learn as it operates._
