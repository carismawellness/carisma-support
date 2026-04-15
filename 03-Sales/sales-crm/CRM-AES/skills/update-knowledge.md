# [KB] Update Knowledge Base — Medical Aesthetics Edition

> **Invoke When:** Agent says "add this to the knowledge base", "note this down", "flag this as incorrect", "I'm noticing a pattern with patients", "we've learned that", "actually [contradicting something]", or any similar phrase signalling they want Claude to capture clinical or market learning.

---

## Why Medical Aesthetics KB is Different

In medical aesthetics, the knowledge base is not just operational (pricing, hours). It's clinical and strategic:

- **Patient fears and hesitations** — recurring objections that need specific handling
- **Results patterns** — when do patients return? When do they plateau? Why?
- **Treatment combinations** — what sequences work best for specific goals
- **Competitor intelligence** — what are other clinics offering? How are they positioned?
- **Safety protocols** — any adverse reactions, allergies, medical interactions noted
- **Market trends** — new treatments, patient preferences, what's working now

This knowledge directly improves patient outcomes and referral rates.

---

## Research Foundation

Three frameworks shape how the knowledge base captures intelligence from agents while maintaining accuracy and clinical safety.

### Framework 1: The Contributor-Approver-Consumer Model
*Knowledge management research across ServiceNow, Knowmax:* Three distinct roles are needed: contributors (agents adding information), approvers (verifying before promotion), and consumers (relying on it). When roles collapse — contributors promoting their own entries — accuracy degrades. The solution: structural separation. A staging layer (`shared-inbox.md`) for contributions, a verified layer (`shared-knowledge.md`) for promoted, approved knowledge.

### Framework 2: Provisional Flagging
*From Help Scout knowledge base maintenance:* Unverified information treated identically to verified information causes degradation. The solution is explicit provisional flagging: new contributions tagged as unverified so consumers treat them as "possibly true" rather than "definitely true." Flagging is not rejection — it is honest signalling.

### Framework 3: Single Source of Truth Architecture
*From Atlassian / Knowmax:* Goal of any shared knowledge system is one canonical answer living in one place, maintained and owned. Two-tier structure implements this: `shared-knowledge.md` (and topic-specific files) = single source of truth. `shared-inbox.md` = contribution buffer, explicitly not canonical.

---

## Overview

Claude's answers are only as good as the knowledge it reads. If the KB is incomplete or outdated, every patient gets wrong or suboptimal advice.

In medical aesthetics, incomplete knowledge is especially dangerous. If we miss that a patient fears over-treatment, we might oversell. If we miss a pattern about results timing, we lose re-engagement opportunities. If we miss competitor moves, we lose market positioning.

Simultaneously, agents are on the front line learning things Claude doesn't know yet:
- Patient hesitation patterns ("Everyone worries about looking artificial")
- Results plateaus ("Patients typically return 6 months after first Botox")
- Treatment combinations that work ("Botox + dermal filler = best results for this age group")
- Competitive intelligence ("Competitor clinic now offers RF micro-needling")
- Safety protocols ("Patient with [condition] cannot receive [treatment]")

The two-tier system resolves this tension: agents contribute instantly through `shared-inbox.md` (fast capture without false certainty). When a manager confirms the entry, it is promoted to `shared-knowledge.md` (the layer Claude treats as fact and uses in patient conversations).

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

## Entry Format Templates — Medical Aesthetics Focus

```
# Clinical pattern (shared-inbox.md):
[AGENT UPDATE – Sarah – 2026-02-19] Patient fear pattern: "Will I look natural?" appears in 80% of first consultations. Recommendation: lead with naturalness assurance in every diagnostic.

# Treatment combination learning (shared-inbox.md):
[AGENT UPDATE – Sarah – 2026-02-19] Botox + dermal filler sequencing: patients see best results when Botox is done 2 weeks before filler (allows movement, filler integrates better).

# Results timing (shared-inbox.md):
[AGENT UPDATE – Sarah – 2026-02-19] Post-treatment plateau: Botox patients typically return 5-6 months after first treatment when results begin to settle. Opportunity for re-engagement at 4.5-month mark.

# Competitor intelligence (shared-inbox.md):
[AGENT UPDATE – Sarah – 2026-02-19] Competitor clinic now offering RF micro-needling at €350/session. Our equivalent Alma laser treatment positioned as more effective for collagen remodeling.

# Safety flag (shared-inbox.md):
[NEEDS REVIEW – Sarah – 2026-02-19] Patient mentioned allergy to [ingredient] — verify treatment suitability before recommending injectables.

# After verification (shared-knowledge.md):
[VERIFIED – Manager – 2026-02-19] Patient hesitation about naturalness is primary objection in 75% of new consultations. Response script: "We believe in enhancement that looks like you, just your best version."
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
> Log full context in `miscellaneous/learnings/LEARNINGS.md` under Skill Learnings.

<!--
Entry format:
- **[YYYY-MM-DD]**: Customer asked [X], skill responded [Y], should have [Z].
  Rule added: ALWAYS/NEVER [directive]
-->

_No edge cases logged yet._
