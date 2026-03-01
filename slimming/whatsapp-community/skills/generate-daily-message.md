# [SKILL] Generate Daily Message — WhatsApp Community

> **Invoke When:** User requests a daily WhatsApp community message, or says "generate today's message", "what's today's WhatsApp message", or similar.

---

## Procedure

### Step 1: Identify the Day
- Check what day of the week it is (or ask the user)
- Map to the theme schedule:
  - Monday → Motivation Monday
  - Tuesday → Tip Tuesday
  - Wednesday → What's Cooking Wednesday
  - Thursday → Science Thursday
  - Friday → Feel-Good Friday
  - Saturday → Saturday Strategy
  - Sunday → Sunday Reset

### Step 2: Load the Template
- Read the corresponding template from templates/
- Note the structure, length limits, and format rules

### Step 3: Source Content
- Read the relevant knowledge file for content ideas:
  - Monday/Friday/Sunday → knowledge/motivation-bank.md
  - Tuesday/Saturday → knowledge/tips-and-tools.md
  - Wednesday → knowledge/recipe-bank.md
  - Thursday → knowledge/science-facts.md
- Select content that HASN'T been used recently (check with user if needed)
- Draw from knowledge/message-examples.md for quality benchmark

### Step 4: Generate the Message
- Follow the template structure exactly
- Apply ALL brand voice rules:
  - Second-person ("you")
  - Short sentences, breathing room
  - Lead with emotion, support with logic
  - Validate before advising
  - End with agency and forward motion
- Keep within length limits for the day type
- Format for WhatsApp (no markdown, proper line breaks)

### Step 5: Run Self-Check
- Execute skills/self-check.md against the generated message
- All 5 checks must pass
- If any fail, revise and re-check

### Step 6: Output
- Present the final message in a copy-paste ready block
- Message should be immediately sendable to WhatsApp — no editing needed
- Include the theme name and day for reference

---

## Output Format

The final output should look exactly like this (ready to copy):

💪 [Theme Name]

[Message body with proper line breaks and breathing room]

With you every step,
Katya

---

## Edge Cases
- If user asks for a specific topic within a day's theme, honor the request
- If user wants multiple options, generate 2-3 variants
- If user wants to override the day's theme, generate for the requested theme instead
- If a recipe message, use skills/recipe-formatter.md for formatting

---

**Skill maintained by:** Carisma Slimming Team
**Last updated:** 2026-02-23
**Status:** ACTIVE

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
