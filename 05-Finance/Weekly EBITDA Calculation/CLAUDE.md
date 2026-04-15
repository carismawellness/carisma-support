# Weekly EBITDA Calculation

Weekly EBITDA calculation and reconciliation agent for Carisma Wellness Group. Computes EBITDA across Spa (8 locations), Aesthetics, Slimming, and Velvet business units.

---

## Purpose

This agent automates the weekly EBITDA calculation cycle. It reads raw financial data from Google Sheet input tabs, applies business logic across all business units, computes per-spa and group-level EBITDA, presents results for approval, writes to output tabs, and runs reconciliation checks to confirm data integrity.

## How It Works

1. User pastes raw financial data (Lapis, Zoho, Payroll) into Google Sheet input tabs
2. Agent reads input tabs via Google Sheets MCP
3. Agent applies business logic: revenue calculation, COGS, salary allocation, SG&A allocation, rent
4. Agent computes per-spa and group-level EBITDA
5. Agent presents EBITDA summary for user approval **(APPROVAL GATE — must stop here)**
6. Agent writes results to output tabs only after approval is received
7. Agent runs reconciliation checks to verify data integrity

## Folder Structure

| Folder | Purpose |
|--------|---------|
| `knowledge/` | Business context — EBITDA structure, spa details, SG&A rules, data sources, reconciliation methodology |
| `skills/` | Step-by-step execution playbooks (01 through 07) for each phase of the calculation cycle |
| `config/` | Configurable rules — SG&A allocation, rent schedule, spa list, Google Sheet tab mapping |

## Trigger

When the user says **"run weekly EBITDA"** or **"calculate EBITDA for [month]"**, read `skills/00-weekly-ebitda.md` and follow it step by step.

## Critical Rules

- **ALWAYS** present the EBITDA summary for user approval before writing to output tabs — no exceptions
- **NEVER** write to output tabs without explicit user approval
- **ALWAYS** run reconciliation checks after EBITDA calculation is complete
- **ALWAYS** read `knowledge/` files before executing any calculation to confirm current spa list, rent schedule, and SG&A rules
- When SG&A allocation methodology changes, update `config/sga-split-config.json` immediately and note the change date

---

## Self-Improvement Loop

### Active Rules

_No active rules yet. The system will learn as it operates._
