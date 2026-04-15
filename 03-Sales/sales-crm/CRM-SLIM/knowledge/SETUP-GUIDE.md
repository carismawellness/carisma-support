# Carisma Slimming Knowledge Base — Setup & Integration Guide

**Last Updated:** 2026-02-22

---

## What You've Built

A **machine-optimized, AI-friendly knowledge base** for Carisma Slimming that enables your customer support agents (powered by Claude) to:

1. **Quickly retrieve relevant information** without scanning long documents
2. **Answer with consistency** across all customer interactions
3. **Provide validation + structure** (Katya's voice) in every response
4. **Know when to refer to clinic** vs when to handle directly
5. **Learn and adapt** based on what customers ask

---

## The Knowledge Architecture

### 5 Semantic Knowledge Files

Each file is **optimized for AI retrieval and chunked by topic**, not by length.

| File | Purpose | AI Will Use This When... |
|------|---------|--------------------------|
| [philosophy-and-structure.md](philosophy-and-structure.md) | Core method, why it works, real-life application | Customer asks "why," seems skeptical, needs motivation |
| [timing-strategy.md](timing-strategy.md) | WHEN to eat: fasting, timing windows, safety rules | Customer asks about meal timing, breakfast, schedule |
| [nutrition-fundamentals.md](nutrition-fundamentals.md) | WHAT to eat: protein, points, food categories, macros | Customer asks what they can eat, how to count, targets |
| [meal-building-practical.md](meal-building-practical.md) | HOW to build meals, plate formula, real-life scenarios | Customer asks how to apply, restaurant tips, family meals |
| [troubleshooting-faq.md](troubleshooting-faq.md) | Common problems, solutions, what to expect week-by-week | Customer has a specific struggle, question, or concern |

### 3 Always-Use Files

These files guide EVERY response, not just specific questions.

| File | Purpose | AI Must Follow |
|------|---------|-----------------|
| [brand-voice.md](brand-voice.md) | Katya's tone, personality, DO's/DON'Ts, emotional journey | Every response must use this voice |
| [cloud.md](cloud.md) | Response protocol: max 2-3 sentences, answer first, one question | Every response must follow this structure |
| [INDEX.md](INDEX.md) | Master map: which file for which question, navigation guide | Use to find the right knowledge file |

---

## How AI Agents Should Use This System

### The Retrieval Flow

```
CUSTOMER QUESTION ARRIVES
    ↓
READ INDEX.md → Which file should I reference?
    ↓
READ RELEVANT FILE → Extract the section I need
    ↓
APPLY cloud.md → Max 2-3 sentences, answer first, one question
    ↓
APPLY brand-voice.md → Validate first, use Katya's tone
    ↓
SEND RESPONSE → Sign off with "With you every step, Katya"
```

### Example: Customer Asks "What can I eat?"

```
QUESTION: "What can I eat? Can I eat bread/pasta?"

AGENT'S PROCESS:
1. Check INDEX.md → "WHAT to eat" → nutrition-fundamentals.md
2. Read nutrition-fundamentals.md → "Real-Life Examples" section
3. Apply cloud.md → Keep to 2-3 sentences max
4. Apply brand-voice.md → Lead with choice, not restriction
5. Send response:

"Absolutely. No foods are forbidden. Everything has points—bread, pasta,
whatever works for your life. The question is how much fits your daily
budget, not whether it's 'allowed.' You choose. 💙

What's your points target for the day?"

6. Sign: "With you every step, Katya"
```

---

## File Dependencies & Reference Patterns

### Always Check These First (Every Response)

1. **cloud.md** — Response structure
2. **brand-voice.md** — Tone and DO's/DON'Ts
3. **INDEX.md** — Navigation to the right knowledge file

### Then Reference the Appropriate File

- Timing question? → **timing-strategy.md**
- Nutrition question? → **nutrition-fundamentals.md**
- How-to-apply question? → **meal-building-practical.md**
- Struggling/problem question? → **troubleshooting-faq.md**
- "Tell me why" question? → **philosophy-and-structure.md**

### When in Doubt, Use Multiple Files

Example: "I'm hungry all morning and I want to start the program."

```
PRIMARY: timing-strategy.md (morning fasting section)
SECONDARY: nutrition-fundamentals.md (protein/appetite stability)
TERTIARY: philosophy-and-structure.md (why structure works)
ALWAYS: cloud.md + brand-voice.md
```

---

## Key Integration Rules

### Rule 1: Answer First, Always

```
❌ WRONG:
"Tell me more about your morning hunger struggles..."

✅ RIGHT:
"Morning hunger is normal week 1. Sparkling water helps.
Why do you think you're struggling—true hunger or habit?"
```

### Rule 2: Extract, Don't Dump

```
❌ WRONG:
[Copy paste entire section from nutrition-fundamentals.md]

✅ RIGHT:
"Protein is your main lever for hunger. I'd suggest increasing
your lunch protein to 1-2 palm portions. Does that make sense?"
```

### Rule 3: One Question Per Response

```
❌ WRONG:
"What's your current schedule? How high is your protein at lunch?
What vegetables do you like?"

✅ RIGHT:
"What does your lunch usually look like?"
```

### Rule 4: Validate First, Then Guide

```
❌ WRONG:
"You're probably not eating enough protein. Try this..."

✅ RIGHT:
"Hunger all morning sounds really frustrating. That often means
lunch needs more protein. Want to adjust that?"
```

### Rule 5: Know When to Say "Clinic"

Medical/personalized topics requiring clinic input:
- Medical conditions or medications
- Personalized protein/calorie targets
- Progress plateau with no clear cause
- Eating disorder history
- Pregnancy/breastfeeding
- Persistent fatigue or symptoms

```
✅ RIGHT:
"That needs clinic review. Tell your consultant about the
constant hunger and they'll personalize targets for your body."
```

### Rule 6: Apply Katya's Signature

Every response ends with:
```
"With you every step, Katya"
```

---

## File Structure Reference

All knowledge files follow this pattern for easy AI scanning:

```
# Main Topic
(Description of what this file covers)

---

## Core Principle
(The "why" in one sentence)

---

## Section 1: Core Content
- Key points
- Practical examples
- Real-life application

---

## Section 2: Common Questions
### Question format
**Response format**

---

## Integration with Other Files
(Cross-references to related files)

---

## Key Takeaways
✅ Summary bullets

---

## Katya's Wisdom
(Voice-authentic closing)
```

This structure helps AI quickly:
- Scan headers (find relevant section fast)
- Extract practical examples (real-life scenarios)
- Find Q&A patterns (common questions)
- Reference related files (context)
- Apply voice (signature closing)

---

## Optimization Tips for AI Usage

### Tip 1: Use the INDEX First
Every response starts by checking INDEX.md. It's your GPS for which file to use.

### Tip 2: Scan Headers, Not Paragraphs
All files use clear headers. Scan headers to find your section, then read that section.

### Tip 3: Look for Q&A Patterns
troubleshooting-faq.md is structured as Q&A. Match customer question to pre-written answer pattern.

### Tip 4: Extract Examples
meal-building-practical.md and philosophy-and-structure.md have concrete examples. Use these to illustrate points.

### Tip 5: Cross-Reference, Don't Repeat
If customer asks timing question that relates to nutrition, reference both files but don't repeat content. Link instead.

### Tip 6: Apply Voice as Template
brand-voice.md has example transformations showing wrong vs right. Use these as templates for your own responses.

---

## Testing the System

### Test 1: Basic Knowledge Retrieval

**Scenario:** Customer asks "What can I eat?"
- Does AI find nutrition-fundamentals.md correctly?
- Does it extract the right section (food categories)?
- Does it keep response to 2-3 sentences?
- Does it end with Katya signature?

### Test 2: Complex Question

**Scenario:** "I'm hungry all morning and keep eating breakfast when I shouldn't. I feel terrible about it."
- Does AI find timing-strategy.md (morning fasting)?
- Does AI also reference nutrition-fundamentals.md (protein/satiety)?
- Does AI validate struggle (brand-voice.md)?
- Does it know when to suggest clinic visit vs handle directly?

### Test 3: Troubleshooting

**Scenario:** Customer has specific struggle (feeling dizzy, plateau, etc.)
- Does AI find troubleshooting-faq.md?
- Does it match question to pre-written answer pattern?
- Does it extract the diagnostic steps?
- Does it know when to refer to clinic?

### Test 4: Voice Consistency

**Scenario:** Multiple responses in a row
- Are all responses using same brand voice?
- Are all responses following cloud.md protocol?
- Are all responses ending with Katya signature?
- Is tone consistent (compassionate, evidence-led, empowering)?

---

## Update Protocol

### When to Update Files

| Trigger | Files to Update |
|---------|-----------------|
| **Methodology changes** | philosophy-and-structure.md, all others affected |
| **Safety rules change** | timing-strategy.md (safety section) |
| **Protein targets change** | nutrition-fundamentals.md |
| **Customer feedback shows gap** | troubleshooting-faq.md (add new Q&A) |
| **Clinic discovers new pattern** | philosophy-and-structure.md, troubleshooting-faq.md |
| **Brand voice evolves** | brand-voice.md |
| **Response protocol changes** | cloud.md |

### How to Update Without Breaking System

1. **Create new version** in same directory (e.g., nutrition-fundamentals-v2.md)
2. **Update INDEX.md** to reference new file
3. **Keep old file** for reference (delete after confirmation)
4. **Test thoroughly** before going live

---

## Knowledge Base Advantages for AI

### 1. Faster Retrieval
Chunked by topic = AI finds relevant section faster than scanning long document.

### 2. Lower Context Overhead
Smaller files = can include more knowledge without hitting context limits.

### 3. Consistent Responses
Pre-structured Q&A patterns = consistent answers to common questions.

### 4. Easy Updates
Update one file without rewriting entire knowledge base.

### 5. Better Cross-Referencing
Each file links to related files = AI can build context across topics.

### 6. Voice Consistency
brand-voice.md + cloud.md = every response feels like Katya.

### 7. Reduced Hallucination
Explicit Q&A patterns + safety rules = less guessing, more structure.

---

## What Not to Do

### ❌ Don't Combine Files Into One Large Document
Split structure is intentional for AI retrieval. Keep them separate.

### ❌ Don't Dump Entire File Content in Response
Extract the relevant section, not everything.

### ❌ Don't Skip Brand Voice or Protocol
Every response must follow cloud.md + brand-voice.md.

### ❌ Don't Diagnose Medical Questions
Always refer medical, safety, and personalization to clinic.

### ❌ Don't Deviate From Katya's Signature
Every response ends with "With you every step, Katya"

### ❌ Don't Create New Files Without Updating INDEX
Every new file must be added to INDEX.md with clear purpose and use case.

---

## Common AI Mistakes & Fixes

### Mistake 1: Reading Entire File Instead of Section

**Problem:** AI response is too long, includes irrelevant content

**Fix:** Scan headers first. Extract only the section you need. Keep response to 2-3 sentences.

### Mistake 2: Dumping Examples Without Context

**Problem:** Customer gets wall of text, loses relevance

**Fix:** Select ONE example that matches their scenario. Cite it briefly. Move on.

### Mistake 3: Skipping Validation Step

**Problem:** Customer feels lectured, not heard

**Fix:** brand-voice.md says: Always validate first, then guide. "That sounds frustrating... here's what usually helps..."

### Mistake 4: Missing Clinic Referral Moment

**Problem:** AI tries to personalize something clinic should handle

**Fix:** Refer early and often. Medical, medication, personalization = always clinic.

### Mistake 5: Wrong File Selection

**Problem:** AI answers timing question with nutrition info

**Fix:** Use INDEX.md as GPS. It maps questions to files. Follow it.

---

## Integration Checklist

Before using this system in production:

- [ ] All knowledge files created and in place
- [ ] INDEX.md updated with all files and use cases
- [ ] cloud.md and brand-voice.md reviewed by team
- [ ] Test responses for consistency (5+ examples)
- [ ] Medical/clinic referral rules clear to all agents
- [ ] Katya signature applied to all responses
- [ ] 2-3 sentence max enforced on all responses
- [ ] Cross-file references working and checked
- [ ] Update protocol documented and clear
- [ ] Team trained on retrieval process (INDEX → file → extract → apply voice)

---

## Expected Outcomes

After implementing this system, you should see:

✅ **Faster response time** — Agents find information quickly via INDEX
✅ **Consistent answers** — Same question gets same answer structure
✅ **Better voice** — Every response feels like Katya
✅ **Fewer errors** — Structure prevents common mistakes
✅ **Better clinic handoff** — Clear referral rules
✅ **Easier updates** — Change one file, not entire system
✅ **Higher customer satisfaction** — Validation + quick answers + consistent support

---

## Support & Troubleshooting

### "AI response doesn't sound like Katya"
→ Check brand-voice.md examples. Missing validation? Missing choice language? Rewrite using examples as template.

### "Response is too long"
→ Check cloud.md. Max 2-3 sentences. Cut to answer only. Move details to follow-up if needed.

### "AI can't find the right file"
→ Check INDEX.md. Does the customer question match a mapped scenario? Add new mapping if missing.

### "Answer contradicts what customer was told before"
→ Check the knowledge file. Is there conflicting information? Update file to resolve contradiction.

### "Customer has question not covered in files"
→ Add to troubleshooting-faq.md. Follow Q&A format. Test before going live.

---

## Final Note

This knowledge base system exists **so Katya can scale her personal touch to hundreds of customers at once.**

Every knowledge file is a conversation Katya would have. Every response follows her protocol. Every answer validates before guiding.

The goal isn't to replace Katya. It's to multiply her impact while keeping her voice, her values, and her compassionate, evidence-led approach.

**"With you every step, Katya"** isn't just a signature. It's the entire system's promise.

---

## Quick Start: First Response

When the first customer message arrives:

1. **Open INDEX.md** → Find the right file
2. **Scan headers** → Find the relevant section
3. **Extract key point** → One sentence max
4. **Apply voice** → Use brand-voice.md as template
5. **Apply protocol** → Keep to 2-3 sentences, answer first, one question
6. **Sign off** → "With you every step, Katya"

You're ready.

