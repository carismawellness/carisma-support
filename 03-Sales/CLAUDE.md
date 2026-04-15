# Sales Department

Parent folder for all sales-related agent systems across the three Carisma brands. Contains both customer-facing CRM agents and the internal Sales Feedback Agent for coaching and performance optimization.

---

## Purpose

This is the Sales hub for Carisma Wellness Group. It coordinates:
1. **Customer Support CRM Agents** — handle customer conversations across all brands
2. **Sales Feedback Agent** — monitors SDR conversations, scores them, and delivers coaching feedback

## Folder Structure

| Folder | Purpose |
|--------|---------|
| `sales-crm/` | Customer support CRM agents (all 3 brands + shared resources) |
| `sales-feedback-agent/` | AI-powered conversation scoring and coaching system |

## Sales CRM (`sales-crm/`)

| Folder | Brand | Persona | Signature |
|--------|-------|---------|-----------|
| `sales-crm/CRM-SPA/` | Carisma Spa & Wellness | Sarah | "Peacefully, Sarah" |
| `sales-crm/CRM-AES/` | Carisma Aesthetics | Sarah | "Beautifully yours, Sarah" |
| `sales-crm/CRM-SLIM/` | Carisma Slimming | Katya | "With you every step, Katya" |

Each sub-brand folder contains: `CLAUDE.md`, `knowledge/`, `skills/`, `hooks/`, `templates/`

Shared resources: `sales-crm/knowledge-base/`, `sales-crm/skills/`, `sales-crm/hooks/`

## Sales Feedback Agent (`sales-feedback-agent/`)

Hub-and-spoke multi-agent system that scores every SDR conversation and delivers per-conversation coaching. See `sales-feedback-agent/README.md` for details.

## Key Docs

- `QUICK-START-GUIDE.md` — How to get started with the CRM agents
- `AGENT-ONBOARDING-CHECKLIST.md` — Onboarding checklist for new agents
- `AGENT-WORKFLOW-SETUP.md` — Workflow setup instructions
- `DOCUMENTATION-INDEX.md` — Full index of all CRM documentation

---

## Self-Improvement Loop

### Active Rules

_No active rules yet. The system will learn as it operates._
