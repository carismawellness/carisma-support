# Self-Improvement Loop — System Design

**Date:** 2026-03-01
**Status:** Approved
**Based on:** Boris Cherny's (Claude Code creator) compounding engineering pattern

---

## Concept

Every mistake becomes a rule. Every rule reduces future mistakes. The system gets permanently smarter with each correction.

**Core mechanics:**
1. **Every mistake becomes a rule** — ALWAYS/NEVER directives documented where they're consumed
2. **Verification before done** — agents verify their own work before claiming completion
3. **Institutional memory** — a centralized learnings log provides cross-brand learning and historical context

**Sources:**
- [How Boris Uses Claude Code](https://howborisusesclaudecode.com/)
- [Boris Cherny's Workflow](https://karozieminski.substack.com/p/boris-cherny-claude-code-workflow)
- [Self-Improving AI (DEV Community)](https://dev.to/aviad_rozenhek_cba37e0660/self-improving-ai-one-prompt-that-makes-claude-learn-from-every-mistake-16ek)

---

## Architecture

**Learning flow:** Centralized + brand-specific
- One master learnings log at root level
- Each brand CLAUDE.md maintains its own brand-specific active rules
- Cross-pollination happens through the master log

**Funnel:**
1. Agent encounters issue, fixes it
2. Logs full context in `miscellaneous/learnings/LEARNINGS.md`
3. Distills into ALWAYS/NEVER rule in the relevant CLAUDE.md
4. Updates workflow or skill footer if execution-specific
5. Self-check Question 10 catches new patterns during normal operation

---

## Component 1: Master Learnings Log

**File:** `miscellaneous/learnings/LEARNINGS.md`

Centralized record of everything the system has learned. Contains:
- **Meta-rules** — how to write good rules (absolute directives, rationale-first, concrete examples, one rule per mistake)
- **Universal rules** — apply to ALL agents across every brand
- **Brand-specific sections** — SPA, Aesthetics, Slimming
- **Workflow learnings** — execution issues, API quirks, tool failures
- **Changelog table** — date, entry, category, where distilled to

---

## Component 2: CLAUDE.md Upgrades

### Root CLAUDE.md
Replace existing basic self-improvement loop with full Boris pattern:
- The 5-step cycle: Identify → Fix → Verify → Document → Log
- Rule format specification (ALWAYS/NEVER + rationale + example)
- Verification before completion requirements
- Active Rules section (grows over time)

### CRM Brand CLAUDE.md (CRM-SPA, CRM-AES, CRM-SLIM)
Lightweight version:
- 3-step cycle: Fix → Add rule → Log
- Active Rules section for brand-specific rules

### Other CLAUDE.md (spa/, aesthetics/, slimming/, whatsapp-community/, CEO/)
Same lightweight pattern as CRM brands.

---

## Component 3: Workflow Footers

Each of 13 workflow files gets a "Known Issues & Learnings" footer section.
- Timestamped entries with: what happened, root cause, fix, rule added
- Checked before workflow execution

---

## Component 4: Skill Footers

Each of ~48 skill files gets an "Edge Cases Discovered" footer section.
- Timestamped entries documenting customer scenarios that weren't anticipated
- Feeds back into skill refinement

---

## Component 5: Self-Check Upgrade

Existing self-check.md (3 files, one per brand) gets Question 10:
- "Did this interaction reveal something new?"
- Checklist: log learning, add rule to CLAUDE.md, update skill edge cases

---

## Files Affected

| Category | Count | Change |
|----------|-------|--------|
| New file | 1 | `miscellaneous/learnings/LEARNINGS.md` |
| Root CLAUDE.md | 1 | Replace self-improvement section |
| CRM Brand CLAUDE.md | 3 | Add self-improvement loop + active rules |
| Brand Reference CLAUDE.md | 5 | Add self-improvement loop |
| Workflows | 13 | Add footer section |
| Skills | ~48 | Add footer section |
| Self-check skills | 3 | Add Question 10 |
| **Total** | **~74** | |
