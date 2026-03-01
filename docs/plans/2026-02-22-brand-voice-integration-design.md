# Brand Voice Integration Design
**Date:** February 22, 2026
**Project:** Carisma Spa & Wellness CRM — Brand Voice Knowledge Base
**Scope:** Design and implementation of brand-voice.md + automated hook validation

---

## Overview

Create a **reference-friendly brand-voice.md** that serves dual purposes:
1. **Human reference** — Agents quickly scan DO's/DON'Ts and tone principles
2. **Machine enforcement** — message-quality-check hook validates every outgoing message against brand voice rules

This ensures every customer interaction adheres to Carisma Spa brand voice without requiring manual effort.

---

## Problem Statement

- Agents need quick access to brand voice guidelines while responding to customers
- Manual adherence leads to inconsistency and brand violations
- No automated feedback loop to help agents learn and improve
- Scaling to 3 brands (Spa, Aesthetics, Slimming) requires a system, not manual effort

---

## Solution Architecture

### Layer 1: Source Document (brand-voice.md)
**Structure:** Reference-friendly with machine-parseable sections

```
Quick Reference (top)
├─ Tagline, key phrases, emoji
├─ DO's (required patterns/behaviors)
├─ DON'Ts (forbidden phrases/patterns)
├─ Tone Qualities (reference bullets)
├─ Writing Rules (reference bullets)
└─ Example Transformations (bad → on-brand)

Deep Context (bottom)
├─ Brand Story
├─ Pillars & Purpose
└─ Full Tone Description
```

**Key Feature:** DO's and DON'Ts are structured as:
- Human-readable descriptions
- Specific example phrases (for pattern matching)
- Suggested on-brand alternatives

### Layer 2: Enforcement (message-quality-check hook)
**When triggered:** Before any customer message is sent

**Process:**
1. Agent writes message
2. Hook intercepts (triggers pre-send)
3. Hook reads brand-voice.md
4. Hook validates message against:
   - Forbidden phrases from DON'Ts
   - Presence of tone markers from DO's
   - Sensory word usage
   - Second-person perspective
5. If violations: Show agent feedback + suggestions
6. If clear: Message sends normally

**Feedback to agent:**
```
⚠️  Brand Voice Check
Found: "Pamper yourself today"
Issue: Cliché wellness phrase (DON'T)
Try instead: "Take a moment for yourself"
```

---

## File Outputs

### 1. CRM/CRM-SPA/knowledge/brand-voice.md
**Type:** Markdown reference document
**Audience:** CRM agents, sales staff, support team
**Size:** ~3-4 KB (mostly examples)

**Sections:**
- Quick Reference Header
- DO ✅ | DON'T ❌ (side-by-side)
- Tone Qualities
- Writing Rules
- Example Transformations
- Deep Context (brand story, pillars)

### 2. CRM/CRM-SPA/hooks/brand-voice-validation-rules.json (NEW)
**Type:** Machine-readable ruleset
**Audience:** message-quality-check hook
**Purpose:** Parsed rules for pattern matching

**Structure:**
```json
{
  "brand": "SPA",
  "forbidden_phrases": [
    { "pattern": "pamper", "reason": "Cliché", "suggestion": "take a moment" },
    { "pattern": "treat yourself", "reason": "Cliché", "suggestion": "take time" }
  ],
  "required_tone_markers": [
    "second_person_language",
    "sensory_words",
    "transformation_focus"
  ],
  "sensory_words": ["warmth", "stillness", "breath", "gentle", "ease"],
  "forbidden_patterns": [
    "hurry|rush|urgent",
    "limited.?time|book now",
    "myofascial|lymphatic|clinical terms"
  ]
}
```

### 3. Enhanced message-quality-check.bat
**Type:** Windows batch script (or cross-platform equivalent)
**Updates:** Add brand voice validation logic
**Integration:** Already exists; needs enhancement to read rules + validate

---

## Implementation Flow

```
Agent writes message in CRM
        ↓
Pre-send hook triggers
        ↓
Hook reads brand-voice-validation-rules.json
        ↓
Check against:
  • Forbidden phrases?
  • Required tone markers present?
  • Sensory words present?
  • Second-person language?
        ↓
    ❌ FAIL            ✅ PASS
     ↓                  ↓
Show feedback      Message sends
Try suggestions    (no interruption)
Allow override
```

---

## Success Criteria

✅ **Reference Quality**
- Agents can scan brand-voice.md and understand DO's/DON'Ts in <30 seconds
- Example transformations clarify what "on-brand" means

✅ **Hook Integration**
- message-quality-check hook validates every outgoing message
- <200ms validation latency (no noticeable delay)
- Catches ≥95% of obvious brand violations (forbidden phrases)

✅ **Scalability**
- Can easily replicate for CRM-AES and CRM-SLIM brands
- Same hook logic; just swap out brand-voice-validation-rules.json

✅ **Agent Experience**
- Agents see helpful feedback (not just "blocked")
- Suggestions guide them toward on-brand alternatives
- Override option for edge cases

---

## Phased Rollout

**Phase 1:** Create brand-voice.md + validation rules (this session)
**Phase 2:** Enhance message-quality-check hook (next session)
**Phase 3:** Test with live agents, refine feedback UX
**Phase 4:** Replicate for CRM-AES and CRM-SLIM

---

## Open Questions for Implementation

1. Should override always be allowed, or only for certain roles (managers)?
2. Should hook log violations for metrics/coaching?
3. Should we track which rules are violated most frequently?
4. Are there multi-language considerations for validation (Maltese, French, Italian, etc.)?

---

## Next Steps

1. Write brand-voice.md (reference-friendly structure)
2. Create brand-voice-validation-rules.json (machine-readable ruleset)
3. Document hook enhancement requirements
4. Transition to writing-plans skill for implementation roadmap
