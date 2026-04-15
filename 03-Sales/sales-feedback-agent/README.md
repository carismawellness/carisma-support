# Sales Feedback Agent

AI-powered sales conversation scoring and coaching system for Carisma Wellness Group.

## Purpose

Monitors all SDR conversations across WhatsApp, phone, email, and in-person channels. Scores each conversation against a 6-dimension rubric and delivers automated per-conversation coaching feedback directly to reps.

## Architecture

Hub-and-spoke multi-agent system:

| Agent | Role |
|-------|------|
| **Brand Intelligence** | Evaluates brand voice compliance |
| **Script Compliance** | Checks adherence to prescribed scripts |
| **Sales Excellence** | 30-year CRO expert scoring persuasion, discovery, close technique |
| **Domain Knowledge** | Verifies factual accuracy of claims |
| **Scoring & Feedback** | Aggregates scores, writes coaching feedback |
| **QC Reviewer** | Validates fairness and quality of feedback |

## Folder Structure

| Folder | Contents |
|--------|----------|
| `knowledge/` | All ingested knowledge bases (brand intel, scripts, SOPs, hospitality program) |
| `skills/` | Agent skill files (one per sub-agent) |
| `rubric/` | Scoring framework, brand criteria, benchmarks |
| `templates/` | Feedback report templates |
| `workflows/` | Operational workflows (ingest, score, deliver) |

## Design Document

See `docs/plans/2026-04-14-sales-feedback-agent-design.md` for the full design.
