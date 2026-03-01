# [KB] Update Knowledge Base

> **Invoke When:** Agent says "add this to the knowledge base", "note this down", "flag this as incorrect", "update the [file] with", "I learned that", "just to let you know", "actually [contradicting something]", or any similar phrase signalling they want Claude to capture or correct information.

---

## Research Foundation

Three frameworks shape how the knowledge base captures intelligence from agents while maintaining accuracy.

### Framework 1: The Contributor-Approver-Consumer Model
*Knowledge management research across ServiceNow, Knowmax:* Three distinct roles are needed: contributors (agents adding information), approvers (verifying before promotion), and consumers (relying on it). When roles collapse — contributors promoting their own entries — accuracy degrades. The solution: structural separation. A staging layer (`shared-inbox.md`) for contributions, a verified layer (`shared-knowledge.md`) for promoted, approved knowledge.

### Framework 2: Provisional Flagging
*From Help Scout knowledge base maintenance:* Unverified information treated identically to verified information causes degradation. The solution is explicit provisional flagging: new contributions tagged as unverified so consumers treat them as "possibly true" rather than "definitely true." Flagging is not rejection — it is honest signalling.

### Framework 3: Single Source of Truth Architecture
*From Atlassian / Knowmax:* Goal of any shared knowledge system is one canonical answer living in one place, maintained and owned. Two-tier structure implements this: `shared-knowledge.md` (and topic-specific files) = single source of truth. `shared-inbox.md` = contribution buffer, explicitly not canonical.

---

## Overview

Claude's answers are only as good as the knowledge it reads. If the KB contains outdated prices or wrong opening hours, every customer who asks receives wrong information. Beyond accuracy: if the KB doesn't capture what agents learn about what converts—what objections surface repeatedly, what messaging resonates, what moments matter most—the entire system stays static.

Simultaneously, agents are on the front line learning things Claude doesn't know yet. That intelligence must enter the system quickly.

The two-tier system resolves this tension: agents contribute instantly through `shared-inbox.md` (fast capture without false certainty). When a manager confirms the entry, it is promoted to `shared-knowledge.md` (the layer Claude treats as fact).

**Continuous Improvement Principle:** The best sales system is a learning system. Every agent interaction is data. When an agent learns something that worked—a phrase that closed a hesitant customer, a question that uncovered a real objection, a timing that converted better—that learning belongs in the KB. The system captures it, Claude uses it, the next agent applies it, and conversion improves. This is how the 14 skills stay sharp.

---

## Trigger Phrases

All of these activate this skill:
- "Add this to the knowledge base: [info]"
- "Note this: [info]"
- "Can you remember this? [info]"
- "I learned that [info]"
- "The [X] has changed — [info]"
- "Update the [file] with: [info]"
- "Flag this as incorrect: [info]"
- "Just to let you know, [info]"
- "Actually, [contradicting something in the KB]: [info]"

---

## The Two-Tier System

### Tier 1: shared-inbox.md (Unverified — Fast)
**When to use:** Any time an agent shares new information or correction
**What it means:** Entries are provisional. Claude uses them but holds at arm's length.
**Format:** `[AGENT UPDATE – {name} – {YYYY-MM-DD}] {information}`

### Tier 2: shared-knowledge.md (Verified — Trusted)
**When to use:** Only after a manager confirms the information
**What it means:** Claude treats entries as fact.
**Format:** `[VERIFIED – {name} – {YYYY-MM-DD}] {information}`

---

## Step-by-Step Process

### Scenario 1: Agent says "add this to the KB"
1. Read the information
2. Identify where it belongs (general, location-specific, or topic-specific)
3. Format: `[AGENT UPDATE – {name} – {date}] {information}`
4. Append to `shared-inbox.md`
5. Confirm back to agent with exact text added

**Confirmation template:**
"Got it — I have added this to the inbox: [text added]. This is now provisional pending manager verification. I will flag it when used."

---

### Scenario 2: Agent says "flag this as incorrect"
1. Read what she believes is incorrect
2. Do NOT delete — flag for review
3. Append: `[NEEDS REVIEW – {name} – {date}] The following may be incorrect: {specifics}`
4. Confirm back to agent

**Confirmation template:**
"Flagged for review. [NEEDS REVIEW – {name} – {date}] [description]. Until reviewed, I'll flag answers as unverified."

---

### Scenario 3: Manager confirms and promotes
1. Locate [AGENT UPDATE] entry in `shared-inbox.md`
2. Add to `shared-knowledge.md`: `[VERIFIED – {name} – {date}] {info}`
3. Optionally mark inbox entry as promoted
4. Confirm to agent: entry is now verified, will be treated as fact

---

## Entry Format Templates

```
# New information (shared-inbox.md):
[AGENT UPDATE – Sarah – 2026-02-19] Sunday massage price at Hyatt is now €90.

# Possible error (shared-inbox.md):
[NEEDS REVIEW – Sarah – 2026-02-19] Black Friday voucher expiry may be wrong. Customer says hers expires Dec 2026, not 2025.

# After verification (shared-knowledge.md):
[VERIFIED – Manager – 2026-02-19] Sunday massage price at Hyatt confirmed €90 effective 1 Feb 2026.
```

---

## What Claude Does With Unverified Entries

**Rule:** When an answer comes from `shared-inbox.md`:
- Use the information (so agent has something)
- Append warning: "⚠️ Verify in Fresha before sending — this is from the inbox and not yet manager-confirmed"
- Never present as definitive fact
- Never route directly to customer without agent seeing the flag

---

## Quick Reference

| Trigger | Tier | Format | Claude's Response |
|---|---|---|---|
| "Add this to KB" | 1 | [AGENT UPDATE] | Flags as provisional when used |
| "Flag as incorrect" | 1 | [NEEDS REVIEW] | Treats topic as unverified |
| "Confirmed: [info]" | 2 | [VERIFIED] | Uses as fact, no flag |

---

*Skill maintained by: Sarah / Carisma Wellness Group*
*Last reviewed: 2026-02-19*
*Applies to: Internal knowledge management system*
*Key files: shared-inbox.md (Tier 1) / shared-knowledge.md (Tier 2)*
*CORE RULE: Fast capture in inbox, careful promotion to verified.*

---

## Edge Cases Discovered

> Updated when this skill encounters scenarios it didn't handle well.
> Log full context in `learnings/LEARNINGS.md` under Skill Learnings.

<!--
Entry format:
- **[YYYY-MM-DD]**: Customer asked [X], skill responded [Y], should have [Z].
  Rule added: ALWAYS/NEVER [directive]
-->

_No edge cases logged yet._
