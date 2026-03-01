# Brand Voice Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create brand-voice.md and brand-voice-validation-rules.json for Carisma Spa, then replicate for Aesthetics and Slimming brands.

**Architecture:** Build a two-file system where brand-voice.md serves as a human-readable reference guide, and brand-voice-validation-rules.json provides machine-parseable rules for the message-quality-check hook. Both files live in each brand's folder structure, enabling hook validation of outgoing messages in real-time.

**Tech Stack:** Markdown (human reference), JSON (rule definitions), Batch scripting (hook integration)

---

## Task 1: Create brand-voice.md for CRM-SPA

**Files:**
- Create: `CRM/CRM-SPA/knowledge/brand-voice.md`
- Reference: Design doc at `docs/plans/2026-02-22-brand-voice-integration-design.md`

**Step 1: Write the brand-voice.md file**

Create the file with the complete structure: quick reference + DO's/DON'Ts + tone qualities + examples + deep context.

**File: `CRM/CRM-SPA/knowledge/brand-voice.md`**

```markdown
# Carisma Spa & Wellness — Brand Voice Guide

🌹 *A calm embrace in a noisy world*

---

## Quick Reference

- **Tagline:** Beyond the Spa
- **Essence:** Peaceful, charming, warm, elegant
- **Key Phrases:** "In a world that rushes, take a pause" / "The world can wait" / "Where time stands still"
- **Emoji:** 🌹
- **Signature:** Peacefully, Sarah

---

## DO ✅ — What to Embrace

### Speak Slowly and Mindfully
- Use calm, deliberate language
- Every word serves the message
- Examples: "Take a pause. The world can wait." / "A breath. A moment. A new beginning."

### Use Second-Person Language
- Speak directly to "you" to create intimacy
- Invite the guest into a personal journey
- Examples: "You deserve a moment of stillness." / "You're not just welcome. You belong."

### Choose Soothing, Sensory-Rich Words
- Use words that evoke calm and wellness
- Focus on touch, warmth, breath, stillness
- Examples: "Warm stone. Soft light. Gentle touch." / "Ease the tension. Let go. Feel whole again."

### Evoke Emotion and Transformation
- Highlight the emotional journey, not just the service
- Focus on how guests feel after, not what they're getting
- Examples: "More than a treatment — it's a return to yourself." / "Pressure melts. Stillness flows. You return."

### Use Minimalist, Poetic Phrasing
- Short, elegant sentences
- Metaphorical but always clear and grounded
- Examples: "A sanctuary, even if only for an hour." / "The future of wellness begins with a pause."

### Highlight Care, Not Products
- Emphasize the care and intention behind services
- Avoid clinical product descriptions
- Examples: "Crafted with intention. Chosen for your wellbeing."

### Let Luxury Feel Effortless and Natural
- Premium quality without boastfulness
- Refinement through grace, not flashiness
- Examples: "Elegance in every detail. Stillness in every breath."

### Express Brand Values Subtly
- Show values (authenticity, holistic approach) through language, not by stating them
- Examples: "Rooted in tradition. Guided by innovation." / "From Turkish heritage to Malta's sanctuary."

---

## DON'T ❌ — What to Avoid

### Don't Use Hype or Aggressive Sales Talk
- ❌ "Hurry! Limited-time offer!"
- ❌ "Book now before spots are gone!"
- ✅ "A gift of time. Whenever you're ready."

### Don't Use Clinical or Overly Technical Language
- ❌ "Deep tissue massage improves myofascial release and increases circulation."
- ❌ "This treatment offers targeted lymphatic drainage therapy."
- ✅ "Ease the tension. Let go. Feel whole again."

### Don't Over-Explain or Use Long-Winded Copy
- ❌ "Our massage is designed with specific pressure techniques to relax muscles and increase circulation."
- ✅ "Pressure melts. Stillness flows. You return."

### Don't Sound Generic or Impersonal
- ❌ "We welcome all customers to our facilities."
- ✅ "You're not just welcome. You belong."

### Don't Speak Like a Tourist Destination
- ❌ "Try our spa packages — perfect for your holiday!"
- ❌ "Visit Carisma for a memorable vacation experience."
- ✅ "A sanctuary, even if only for an hour."

### Don't Use Clichés or Overused Wellness Phrases
- ❌ "Pamper yourself today."
- ❌ "Treat yourself — you deserve it!"
- ❌ "Amazing!" / "Fantastic!" / "Awesome!"
- ✅ "Take a moment for yourself. You deserve it." / "The future of wellness begins with a pause."

---

## Tone Qualities (How You Sound)

**Peaceful & Soothing**
- Calm like a gentle breeze through a hammam
- Every word selected to bring serenity
- No urgency, no pressure

**Charming & Warm**
- Not distant luxury — approachable and human
- Like a trusted therapist who knows you
- Caring, compassionate, understanding

**Elegant & Desirable**
- Refined without being flashy or boastful
- Premium quality communicated through confidence and grace
- Effortless luxury

**Purposeful & Honest**
- Every phrase has depth and meaning
- No fluff or filler — soul-led language
- Deep respect for the guest's wellness journey

**Relaxed & Balanced**
- Slow pace, clear message
- Never rushed or overwhelming
- Always centered and grounded

---

## Writing Rules

**Simple Yet Poetic**
- Use short, elegant sentences
- Metaphorical when it serves clarity, never abstract for beauty's sake
- Always clear, always grounded

**Minimal, Spacious Language**
- Leave room to breathe
- Avoid clutter and busyness
- Use white space — visually and emotionally

**Second-Person Perspective**
- Speak directly to "you"
- Invite guests into a personal, transformative journey
- Create intimacy and connection

**Subtle Persuasion**
- No hard sells
- Gently highlight transformation, value, and emotional resonance
- Let guests feel welcome and invited, never pressured

---

## Example Transformations

### Standard → Carisma Voice

| Standard | Carisma Style |
|----------|---------------|
| "Book your massage today!" | "Take a moment for yourself. You deserve it." |
| "We offer the best spa services in Malta." | "Where time stands still, and you return to yourself." |
| "Feel refreshed and recharged." | "A breath. A stillness. A soft return to balance." |
| "Try our facial — it reduces wrinkles!" | "Ease the tension. Let your skin breathe. Feel alive again." |
| "Limited-time offer on packages!" | "A gift of time. Whenever you're ready." |
| "Pamper yourself today." | "You're not just welcome. You belong." |
| "Our treatments use natural ingredients." | "Crafted with intention. Chosen for your wellbeing." |
| "Perfect for a spa day!" | "A sanctuary, even if only for an hour." |

---

## Deep Context — Our Story & Purpose

### Our Story
Since 1990, Carisma Spa & Wellness has provided beauty and wellness treatments to guests from all around the world. Initially starting in Turkey and entering Malta in 2010, the Carisma brand has operated in over 50 five-star hotels. Carisma prides itself on offering a holistic range of services, continuously investing in training its ever-growing team, and pioneering cutting-edge innovations in the health and wellness industry.

These values have earned Carisma recognition by the prestigious World Luxury Spa Awards for three consecutive years and maintained a 99% customer satisfaction rate for over 30 years.

### Our Big Ideal
Carisma believes the world would be a better place if people nurture their body, mind, and soul to be the best version of themselves.

### Our Purpose
Help you become the best version of yourself. We believe we can all reach our full potential by nurturing the connection between body, mind, and soul. Through a tranquil escape from the stresses of everyday life, we take you on a journey of spiritual and physical awakening, leaving you feeling and looking great.

### Brand Pillars

**Authentic**
We strive to be at the forefront of global health and wellness trends and incorporate visionary innovations to the core Turkish Spa experience and values.

**Holistic**
We strive to achieve the wellness of our guests through their body, mind, and soul. The mind is the key; the heart is the door; the soul is the corridor.

**Simplicity**
We believe in the profound value of simplicity in all aspects of Carisma — from communication and guest interactions to design and philosophy towards services provided.

**Quality**
We strive to exceed expectations of our guests at all times. That means we treat our guests as royalty, use products with natural ingredients, and keep customer satisfaction as our one true north.

### Brand Personality
Peaceful · Charming · Warm · Soothing · Purposeful · Relaxed · Balanced · Desirable · Elegant · Honest

---

## How to Use This Guide

1. **Before responding to a customer:** Scan the Quick Reference section for key tone principles
2. **When writing a message:** Check DO's and DON'Ts to stay on-brand
3. **When unsure of phrasing:** Look at Example Transformations for inspiration
4. **For deep understanding:** Review Tone Qualities and Our Story sections
5. **Remember:** The hook will validate your messages against these principles automatically

**Questions?** Refer to the message-quality-check hook feedback for real-time guidance.
```

**Step 2: Verify the file is valid Markdown**

Run: `file "CRM/CRM-SPA/knowledge/brand-voice.md"`

Expected output: Shows it's a text file (Markdown is plain text)

**Step 3: Commit the brand-voice.md file**

```bash
git add CRM/CRM-SPA/knowledge/brand-voice.md
git commit -m "docs(spa): add brand voice guide for CRM agents"
```

---

## Task 2: Create brand-voice-validation-rules.json for CRM-SPA

**Files:**
- Create: `CRM/CRM-SPA/hooks/brand-voice-validation-rules.json`

**Step 1: Write the validation rules JSON**

Create a machine-parseable ruleset that the hook will use to validate messages.

**File: `CRM/CRM-SPA/hooks/brand-voice-validation-rules.json`**

```json
{
  "brand": "SPA",
  "version": "1.0",
  "description": "Brand voice validation rules for Carisma Spa & Wellness",

  "forbidden_phrases": [
    {
      "pattern": "pamper yourself",
      "reason": "Cliché wellness phrase",
      "suggestion": "Take a moment for yourself"
    },
    {
      "pattern": "treat yourself",
      "reason": "Cliché wellness phrase",
      "suggestion": "Take time for yourself"
    },
    {
      "pattern": "amazing|fantastic|awesome",
      "reason": "Overused marketing clichés",
      "suggestion": "Use sensory or emotional language instead"
    },
    {
      "pattern": "hurry|rush|urgent|limited.?time|book now|don't miss",
      "reason": "Aggressive sales talk (conflicts with peaceful tone)",
      "suggestion": "Invite gently: 'Whenever you're ready'"
    },
    {
      "pattern": "we welcome all customers|our facilities",
      "reason": "Generic, impersonal language",
      "suggestion": "Make it personal: 'You're not just welcome. You belong.'"
    },
    {
      "pattern": "perfect for.*holiday|spa.*vacation|spa.*escape",
      "reason": "Touristy language (not luxury wellness)",
      "suggestion": "Focus on transformation: 'A sanctuary, even if only for an hour'"
    },
    {
      "pattern": "myofascial|lymphatic|circulation|pressure technique",
      "reason": "Clinical/technical language (avoid medical jargon)",
      "suggestion": "Use sensory language: 'Ease the tension. Feel whole again.'"
    }
  ],

  "required_tone_markers": {
    "sensory_words": [
      "warm", "warmth", "soft", "gentle", "stillness", "breath",
      "ease", "float", "melt", "flow", "pause", "silence",
      "touch", "light", "stone", "soothe", "calm", "peace",
      "serenity", "tranquil", "sanctuary", "anchor"
    ],
    "second_person": [
      "you", "your", "yourself"
    ],
    "transformation_words": [
      "return", "journey", "awakening", "restore", "reconnect",
      "realign", "rebalance", "transform", "elevate", "become",
      "heal", "refresh", "revive", "renew"
    ],
    "purpose_words": [
      "wellbeing", "wellness", "purpose", "intention", "care",
      "nurture", "holistic", "soul", "mind", "body", "spirit"
    ]
  },

  "validation_rules": [
    {
      "name": "check_forbidden_phrases",
      "description": "Reject messages containing forbidden phrases",
      "severity": "high",
      "enabled": true
    },
    {
      "name": "check_second_person",
      "description": "Warn if message doesn't use second-person perspective",
      "severity": "medium",
      "enabled": true,
      "threshold": "Should contain at least one 'you' or 'your'"
    },
    {
      "name": "check_sensory_language",
      "description": "Warn if message lacks sensory words (optional for short responses)",
      "severity": "low",
      "enabled": true,
      "threshold": "Recommended for messages longer than 2 sentences"
    },
    {
      "name": "check_clinical_language",
      "description": "Warn about clinical or technical jargon",
      "severity": "high",
      "enabled": true
    }
  ],

  "feedback_templates": {
    "forbidden_phrase_found": "⚠️ Brand Voice Check\nFound: \"{phrase}\"\nIssue: {reason}\nSuggestion: {suggestion}\n\nAllow override? (Y/N)",
    "missing_second_person": "💡 Tone Tip\nTry using 'you' or 'your' to create intimacy.\nExample: \"You deserve a moment of stillness.\"",
    "lacks_sensory_language": "💡 Tone Tip\nConsider adding sensory words: warmth, stillness, breath, gentle, ease\nExample: \"Ease the tension. Let go. Feel whole again.\"",
    "clinical_language_warning": "⚠️ Tone Check\nThis sounds clinical. Try sensory language instead:\n\"{suggestion}\""
  }
}
```

**Step 2: Validate the JSON syntax**

Run: `python3 -m json.tool "CRM/CRM-SPA/hooks/brand-voice-validation-rules.json" > /dev/null && echo "JSON valid"`

Expected output: "JSON valid"

**Step 3: Commit the validation rules**

```bash
git add CRM/CRM-SPA/hooks/brand-voice-validation-rules.json
git commit -m "config(spa): add brand voice validation rules for message quality check"
```

---

## Task 3: Replicate brand-voice.md for CRM-AES

**Files:**
- Create: `CRM/CRM-AES/knowledge/brand-voice.md`
- (Note: Will be customized with Aesthetics-specific brand voice later)

**Step 1: Copy brand-voice.md as template**

For now, copy the Spa version as a template with placeholder for Aesthetics customization.

Run: `cp "CRM/CRM-SPA/knowledge/brand-voice.md" "CRM/CRM-AES/knowledge/brand-voice.md"`

**Step 2: Update header to reference Aesthetics**

Edit the file and replace:
- Line 1: `# Carisma Spa & Wellness — Brand Voice Guide` → `# Carisma Aesthetics — Brand Voice Guide`
- Add note: `[TO BE CUSTOMIZED WITH AESTHETICS-SPECIFIC TONE AND EXAMPLES]`

**Step 3: Commit**

```bash
git add CRM/CRM-AES/knowledge/brand-voice.md
git commit -m "docs(aes): add brand voice guide template for Aesthetics (to be customized)"
```

---

## Task 4: Replicate brand-voice-validation-rules.json for CRM-AES

**Files:**
- Create: `CRM/CRM-AES/hooks/brand-voice-validation-rules.json`

**Step 1: Copy validation rules as template**

Run: `cp "CRM/CRM-SPA/hooks/brand-voice-validation-rules.json" "CRM/CRM-AES/hooks/brand-voice-validation-rules.json"`

**Step 2: Update brand field**

Edit the JSON and change:
- Line 2: `"brand": "SPA"` → `"brand": "AES"`
- Line 3: `"description"` → Update to reference Aesthetics

**Step 3: Validate JSON**

Run: `python3 -m json.tool "CRM/CRM-AES/hooks/brand-voice-validation-rules.json" > /dev/null && echo "JSON valid"`

Expected output: "JSON valid"

**Step 4: Commit**

```bash
git add CRM/CRM-AES/hooks/brand-voice-validation-rules.json
git commit -m "config(aes): add brand voice validation rules template for Aesthetics"
```

---

## Task 5: Replicate brand-voice.md for CRM-SLIM

**Files:**
- Create: `CRM/CRM-SLIM/knowledge/brand-voice.md`

**Step 1: Copy brand-voice.md as template**

Run: `cp "CRM/CRM-SPA/knowledge/brand-voice.md" "CRM/CRM-SLIM/knowledge/brand-voice.md"`

**Step 2: Update header to reference Slimming**

Edit the file and replace:
- Line 1: `# Carisma Spa & Wellness — Brand Voice Guide` → `# Carisma Slimming — Brand Voice Guide`
- Add note: `[TO BE CUSTOMIZED WITH SLIMMING-SPECIFIC TONE AND EXAMPLES]`

**Step 3: Commit**

```bash
git add CRM/CRM-SLIM/knowledge/brand-voice.md
git commit -m "docs(slim): add brand voice guide template for Slimming (to be customized)"
```

---

## Task 6: Replicate brand-voice-validation-rules.json for CRM-SLIM

**Files:**
- Create: `CRM/CRM-SLIM/hooks/brand-voice-validation-rules.json`

**Step 1: Copy validation rules as template**

Run: `cp "CRM/CRM-SPA/hooks/brand-voice-validation-rules.json" "CRM/CRM-SLIM/hooks/brand-voice-validation-rules.json"`

**Step 2: Update brand field**

Edit the JSON and change:
- Line 2: `"brand": "SPA"` → `"brand": "SLIM"`
- Line 3: `"description"` → Update to reference Slimming

**Step 3: Validate JSON**

Run: `python3 -m json.tool "CRM/CRM-SLIM/hooks/brand-voice-validation-rules.json" > /dev/null && echo "JSON valid"`

Expected output: "JSON valid"

**Step 4: Commit**

```bash
git add CRM/CRM-SLIM/hooks/brand-voice-validation-rules.json
git commit -m "config(slim): add brand voice validation rules template for Slimming"
```

---

## Task 7: Verify all files created and push to GitHub

**Files to verify:**
- `CRM/CRM-SPA/knowledge/brand-voice.md`
- `CRM/CRM-SPA/hooks/brand-voice-validation-rules.json`
- `CRM/CRM-AES/knowledge/brand-voice.md`
- `CRM/CRM-AES/hooks/brand-voice-validation-rules.json`
- `CRM/CRM-SLIM/knowledge/brand-voice.md`
- `CRM/CRM-SLIM/hooks/brand-voice-validation-rules.json`

**Step 1: Verify all files exist**

Run:
```bash
find CRM -name "brand-voice*" -type f
```

Expected output: Should list all 6 files above

**Step 2: Check git status**

Run: `git status`

Expected output: All files should be committed (nothing should show as "Changes not staged")

**Step 3: View the commit history**

Run: `git log --oneline -7`

Expected output: Shows the 7 commits from Tasks 1-6

**Step 4: Push to GitHub**

Run: `git push origin main`

Expected output: Shows commits pushed successfully

---

## Success Criteria

✅ All 6 files created (brand-voice.md × 3, brand-voice-validation-rules.json × 3)
✅ All JSON files are valid and parseable
✅ All commits are atomic and descriptive
✅ All changes pushed to GitHub
✅ Spa brand-voice.md is comprehensive and reference-friendly
✅ Templates created for Aesthetics and Slimming (customization pending)

---

## Next Steps (Post-Implementation)

1. **Customize Aesthetics brand voice** — Update CRM-AES brand-voice.md with aesthetics-specific tone and examples
2. **Customize Slimming brand voice** — Update CRM-SLIM brand-voice.md with slimming-specific tone and examples
3. **Enhance message-quality-check hook** — Update hook logic to read and validate against brand-voice-validation-rules.json
4. **Test with live agents** — Validate hook provides helpful feedback without being intrusive
5. **Iterate on feedback UX** — Refine how violations are communicated to agents

---

## Files Checklist

- [ ] CRM/CRM-SPA/knowledge/brand-voice.md
- [ ] CRM/CRM-SPA/hooks/brand-voice-validation-rules.json
- [ ] CRM/CRM-AES/knowledge/brand-voice.md
- [ ] CRM/CRM-AES/hooks/brand-voice-validation-rules.json
- [ ] CRM/CRM-SLIM/knowledge/brand-voice.md
- [ ] CRM/CRM-SLIM/hooks/brand-voice-validation-rules.json
```

**Step 2: Save plan and commit it**

Run:
```bash
git add docs/plans/2026-02-22-brand-voice-implementation.md
git commit -m "plan: comprehensive brand voice implementation roadmap"
```

Expected output: Commit successful

---

## Execution Options

Plan complete and saved to `docs/plans/2026-02-22-brand-voice-implementation.md`.

**Two execution approaches:**

**1. Subagent-Driven (this session)**
- I dispatch a fresh subagent per task
- Review work between tasks
- Fast iteration with feedback loops
- Best if: You want guidance and review after each step

**2. Parallel Session (separate window)**
- Open new session with `superpowers:executing-plans` skill
- Batch execution with checkpoints
- Best if: You want heads-down implementation in isolated worktree

**Which approach would you prefer?**
