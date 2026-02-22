# [AGENT] Onboard — Slimming Edition

> **Invoke When:** New agent starts ("how does this work?"), agent types "/onboard", or agent asks for a walkthrough of the Slimming-specific system.

---

## Welcome

You're not just learning a tool. You're learning to be Katya — the voice Carisma Slimming members trust. This walkthrough teaches you the system, the slimming-specific positioning, and the brand voice in 5 minutes.

---

## Step 1: What This System Does (and Doesn't)

**It IS:** Your co-pilot for drafting responses, recommending treatments, handling objections, updating knowledge
**It's NOT:** A chatbot that replies automatically — you always review and send

**Golden rule:** Sarah is YOU at your best. Claude helps you get there faster.

---

## Step 2: How to Start Every Session

**Always use this intake format:**
```
CHANNEL: [WhatsApp / Instagram / Facebook / Email / LiveChat]
CUSTOMER: [name if known]
CONTEXT: [returning? voucher? first time? special occasion?]
---
[paste the full conversation here]
```

**Why:** Claude uses this to draft in the right tone, at the right level of detail, for the right channel.

---

## Step 3: The Cardinal Rule — Never Lead With Price

**WRONG:** Customer asks "how much is a massage?" → You paste it → Claude lists prices

**RIGHT:** Customer asks "how much is a massage?" → Claude asks 2–3 discovery questions first → Claude recommends based on answers → price comes AFTER the experience is painted

This is THE most important rule. When you invoke [consult-and-pitch], this is how it works.

---

## Step 4: How to Use the 14 Skills

**Skills trigger automatically on most inquiries.** But you can also invoke them manually by typing the skill name in square brackets.

**The 14 skills:**

| Skill | When to Use | What It Does |
|---|---|---|
| [consult-and-pitch] | Any treatment/price inquiry | Diagnose → recommend → pitch |
| [close-the-booking] | Customer hesitating | Warm walk to confirmation |
| [upsell-booking] | Booking confirmed | Suggest upgrade + add-ons |
| [close-detector] | Goodbye language detected | Surface upsell + cross-sell before close |
| [cross-sell] | Natural close point | Pitch Aesthetics or Slimming clinic |
| [objection-buster] | Price / timing objection | Handle objection without discounting |
| [competitor-defense] | Competitor mentioned | Validate → differentiate → re-anchor |
| [complaint-handler] | Upset customer / complaint | De-escalate in brand voice |
| [bundle-builder] | Multi-need customer | Build optimal package + draft pitch |
| [first-time-converter] | Never visited before | Special first-timer approach |
| [re-engagement] | Lapsed customer | Bring them back |
| [referral-nudger] | Conversation closing well | "Bring a friend" suggestion |
| [update-knowledge] | Agent learns something new | Add it to the knowledge base |
| [onboard] | New agent / refresher | This walkthrough |

---

## Step 5: How to Update the Knowledge Base

Simple:

**"Add this to the knowledge base: [info]"** → Claude adds to shared-inbox.md (unverified, provisional)

**"Flag this as incorrect: [info]"** → Claude flags for review in shared-inbox.md

Everything in shared-inbox.md is PROVISIONAL. Managers verify and promote to shared-knowledge.md.

**Why it matters:** Claude's answers are only as good as the knowledge base. If you learn something new, add it.

---

## Step 6: The Sign-Off Rule

**Always end with "Peacefully, Sarah"**

Exceptions:
- **Complaints:** "With care, Sarah"
- **Gifts:** "With warmth, Sarah"

Sarah is the persona customers trust. Consistency over hundreds of conversations builds that relationship.

---

## Step 7: Brand Voice Test

**Q1:** How would Carisma say "We offer the best spa services in Malta"?
**Answer:** "Where time stands still, and you return to yourself."

**Q2:** How would Carisma say "Book your massage today!"?
**Answer:** "Take a moment for yourself. You deserve it." OR "A gift of time. Whenever you're ready."

**Q3:** How would Carisma say "We welcome all customers"?
**Answer:** "You're not just welcome. You belong."

**Does your response pass?** If it sounds like it could come from any spa, rewrite it.

---

## Quick Reference Card (Print This)

```
┌─────────────────────────────────────────────────────────────────┐
│ SARAH'S SYSTEM — QUICK START                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ EVERY SESSION:                                                   │
│ CHANNEL: [WhatsApp/Instagram/Facebook/Email/LiveChat]          │
│ CUSTOMER: [name if known]                                       │
│ CONTEXT: [returning? voucher? first time?]                      │
│ --- [paste conversation]                                         │
│                                                                  │
│ THE CARDINAL RULE:                                               │
│ Never open with price. Diagnose first.                          │
│                                                                  │
│ WHEN TO USE SKILLS:                                              │
│ Booking question? → [consult-and-pitch]                         │
│ Customer hesitating? → [close-the-booking]                      │
│ Booking confirmed? → [upsell-booking]                           │
│ Saying goodbye? → [close-detector]                              │
│ Upset customer? → [complaint-handler]                           │
│ New customer? → [first-time-converter]                          │
│ Competitor mentioned? → [competitor-defense]                    │
│ Price objection? → [objection-buster]                           │
│                                                                  │
│ BRAND VOICE RULES:                                               │
│ • Short, poetic sentences                                        │
│ • Second-person "you"                                           │
│ • Sensory words (warmth, stillness, breath, melt)              │
│ • No hype: "Book now!", "Pamper yourself", "Amazing"           │
│ • No AI tells: "Certainly!", "Absolutely!", "Of course!"       │
│                                                                  │
│ SIGN-OFF:                                                        │
│ Standard: "Peacefully, Sarah"                                   │
│ Complaints: "With care, Sarah"                                  │
│ Gifts: "With warmth, Sarah"                                     │
│                                                                  │
│ WHEN TO UPDATE KB:                                               │
│ "Add this to the knowledge base: [info]" ✓                      │
│ "Flag this as incorrect: [info]" ✓                              │
│                                                                  │
│ KNOW WHEN TO ESCALATE:                                           │
│ • Refund request > €150 → ask manager                           │
│ • Legal threat → escalate                                       │
│ • Abusive language → escalate                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Practice Scenarios

**Scenario 1: How to Start**
Customer message: "Hi! How much is a massage?"

Your action:
```
CHANNEL: WhatsApp
CUSTOMER: Unknown
CONTEXT: Pricing inquiry, likely first-timer
---
Hi! How much is a massage?
```

Claude will invoke [consult-and-pitch] automatically and ask diagnostic questions before quoting any price.

**Scenario 2: When to Use a Skill Manually**
Customer: "That sounds amazing, but I need to think about it."

Your action:
Invoke [close-the-booking] — this is hesitation before commitment. Claude will help you walk them gently toward confirmation.

**Scenario 3: When to Update KB**
Agent learns: "The Sunday price at Hyatt changed to €90."

Your action:
Type: "Add this to the knowledge base: Sunday massage price at Hyatt is now €90."

Claude appends to shared-inbox.md with your name and today's date. When a manager confirms it, it gets promoted to verified knowledge.

---

## Common New Agent Mistakes (and How to Avoid Them)

| Mistake | Why It's a Problem | The Fix |
|---|---|---|
| Pasting customer question without intake format | Claude doesn't know the channel/context | Always use: CHANNEL / CUSTOMER / CONTEXT |
| Sending the first price before discovery | Loses the chance to build value first | Let [consult-and-pitch] ask the diagnostic questions |
| Not updating KB when you learn something | Knowledge stays scattered, Claude misses it | Say "Add this to the knowledge base: [info]" |
| Sending Claude's draft without personalizing | Feels robotic | Always add one personal touch before sending |
| Forgetting the sign-off | Breaks the Sarah persona | Check: does it end with "Peacefully, Sarah"? |

---

## Where to Find Answers

**For pricing / menu information:** knowledge/pricing-and-menu.md
**For booking process:** knowledge/booking-policy.md
**For voucher details:** knowledge/vouchers-and-gift-cards.md
**For location info:** locations/[hotel-name].md
**For brand voice:** config/brand_voice.md + config/sarah-phrases.md
**For Sarah's exact phrases:** config/sarah-phrases.md
**For social proof / testimonials:** config/social-proof.md

**If the answer isn't in the KB:**
Type: "⚠️ KNOWLEDGE GAP: [what you needed]"

Claude will flag it for you, and it should be added to the knowledge base.

---

## You're Ready

You have everything you need. Trust the system. Trust Sarah's voice. Trust that when you follow the intake format and use the skills, you're never starting from scratch.

And remember: Sarah is YOU at your best.

Go welcome someone.

Peacefully,
Sarah

---

*Skill maintained by: Sarah / Carisma Wellness Group*
*Last reviewed: 2026-02-19*
*For new agents: Read this first, keep the Quick Reference Card handy, reference skills by name as you work*
*All questions? Ask Claude by typing "/onboard" again.*
