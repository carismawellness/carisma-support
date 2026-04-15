---
name: emailbaby
description: "Build production-ready emailers in Figma for Carisma Wellness brands. Routes to brand-specific skills (emailbaby-spa, emailbaby-aes, emailbaby-slim) with isolated grids, v5.1 node IDs, and the v5.1 execution pipeline. Slash command: /emailbaby <brand> [resume]"
version: "5.1.0"
user-invocable: true
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Task, ToolSearch
argument-hint: "<brand> [resume]"
metadata:
  author: Carisma
  tags:
    - figma
    - emailer
    - design
    - production
    - nano-banana
    - html-export
  triggers:
    - "emailbaby"
    - "build emailer"
    - "figma emailer"
    - "email production"
    - "design emailer"
---

# EmailBaby v5.1 — Router

This is a **router skill**. It delegates to the correct brand-specific skill based on the brand argument.

## How It Works

When the user runs `/emailbaby <brand> [resume]`:

1. Parse the brand from the argument (first word)
2. Read the corresponding brand skill file
3. Follow that skill's instructions completely

## Brand Routing Table

| Argument | Skill File | Grid Root |
|----------|-----------|-----------|
| `spa` | `.agents/skills/emailbaby-spa/SKILL.md` | `4581:95` (Spa_Emailers_Workflow) |
| `aes` or `aesthetics` | `.agents/skills/emailbaby-aes/SKILL.md` | `4590:66` (Aes_Emailers_Workflow) |
| `slim` or `slimming` | `.agents/skills/emailbaby-slim/SKILL.md` | `4590:3658` (Slim_Emailers_Workflow) |

## Execution

1. **Read the brand SKILL.md** — it contains all node IDs, grid structure, colour palette, CTA specs, decorative element library, and phase pipeline specific to that brand
2. **Read shared resources** as referenced by the brand skill:
   - `.agents/skills/emailbaby-core/GOLDEN-RULES.md` — 19 non-negotiable rules
   - `.agents/skills/emailbaby-core/PIPELINE.md` — execution pipeline overview
   - `.agents/skills/emailbaby-core/QC-GATES.md` — shared 4-gate QC source of truth
   - `.agents/skills/emailbaby-core/QC-TEMPLATE.md` — quality scoring template
   - `.agents/skills/emailbaby-core/phases/` — shared phase instructions
   - Brand-specific phase overrides in `.agents/skills/emailbaby-<brand>/phases/`
3. **Follow the brand skill's QUICK START section** step by step

## Phase File Resolution

Each phase reads from the brand-specific `phases/` directory first, then falls back to `emailbaby-core/phases/`. Brand-specific phase files override core when both exist.

## If No Brand Argument

Ask the user which brand:
- **SPA** — Carisma Spa & Wellness (9 hotel locations)
- **AES** — Carisma Aesthetics (med-aesthetics clinic, St Julian's)
- **SLIM** — Carisma Slimming (weight-loss clinic, St Julian's)

## Resume

If the user passes `resume` as the second argument, the brand skill will check for an existing state file at `.tmp/emails/<brand>-emailers/FIGMA-FINISH-PROMPT.md` and continue from the last completed phase.

If that state file is a legacy completion without `## QC Gates`, enter `retrofit QC mode` instead of treating it as fully done:
- re-open the saved production frames
- run Gate B, Gate C, and **Gate D**
- write per-emailer artifacts under `.tmp/emails/<brand>-emailers/qc/`
- only restore completion after the new gate flow passes

## Important

- **Do NOT use any node IDs from this file** — all node IDs live in the brand-specific SKILL.md files
- **Do NOT use the old v4.x grid structure** — v5.1 uses 1 grid per brand (11 rows), not a shared grid with brand columns
- **Grid isolation is absolute** (Golden Rule #19) — each brand operates only within its own grid root
