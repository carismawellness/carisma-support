# /crmrespond Skill — Generate Brand-Validated Customer Response

**Slash Command:** `/crmrespond`

**What This Does:**
When an agent pastes a customer message and runs this skill, it:
1. Detects current brand (Aesthetics, Spa, or Slimming)
2. Loads brand context (voice, validation rules, 14 skills)
3. Routes to appropriate skill for customer state
4. Generates response using skill script
5. Validates response against brand rules
6. Returns validated response or asks for revision

**When to Use:**
Agent has a customer message and needs a brand-perfect response to send.

---

## Usage

### **Step 1: Prepare Customer Message**
Copy the customer message exactly as they sent it (preserve tone, emoji, etc.)

### **Step 2: Run Skill**
```
/crmrespond

[PASTE CUSTOMER MESSAGE HERE]
```

### **Step 3: System Analyzes and Responds**

The system will:
- Detect your current brand folder
- Load brand context
- Analyze the message
- Generate response
- Validate response
- Output: [READY TO SEND] or [NEEDS REVISION]

### **Step 4: Copy Response**
If validation passes (score ≥ 85/100), copy the response and send to customer.

---

## System Process (Behind the Scenes)

### **Phase 1: Brand Detection**

```
System checks: What folder is agent currently in?

IF    folder contains "CRM-AES"  → Brand = Aesthetics
ELIF  folder contains "CRM-SPA"  → Brand = Spa
ELIF  folder contains "CRM-SLIM" → Brand = Slimming
ELSE  → Error: "Could not detect brand folder"
```

### **Phase 2: Load Brand Context**

```
Load from [Brand Folder]:
  ✓ CLAUDE.md (instructions + validation checklist)
  ✓ knowledge/brand-voice.md (tone, persona, examples)
  ✓ hooks/brand-voice-validation-rules.json (forbidden phrases, required markers)
  ✓ skills/ directory (14 skill files for routing)
```

### **Phase 2B: Query Knowledge Base (NEW)**

When customer message arrives:

1. Load appropriate KB file:
   - If brand is SPA → load `CRM/CRM-SPA/knowledge/kb-spa.json`
   - If brand is AES → load `CRM/CRM-AES/knowledge/kb-aes.json`
   - If brand is SLIM → load `CRM/CRM-SLIM/knowledge/kb-slim.json`

2. Run KB query:
   ```python
   from .kb_query import KBQueryEngine
   engine = KBQueryEngine(kb_path)
   kb_matches = engine.query(customer_message, top_k=3)
   ```

3. Use matches to inform response:
   - If relevance_score ≥ 85% → Cite KB directly
   - If relevance_score 70-84% → Use as reference without citation
   - If relevance_score < 70% → Ignore and respond from agent knowledge

4. Add matched entries to your analysis:
   - Check which Tier the matches are (higher Tier = more critical)
   - Note customer intent from matched questions
   - Adjust response to align with brand voice in KB answers

### **Phase 3: Analyze Customer Message**

Ask these questions to route correctly:

```
CUSTOMER STATE ANALYSIS

1. Customer Type?
   □ First-time inquiry (new customer)
   □ Existing customer (returning/booked before)
   □ Objector (expressing hesitation/concern)
   □ Complainer (expressing dissatisfaction)
   □ Lapsed (hasn't engaged in weeks/months)

2. Emotional State?
   □ Curious/exploratory (gathering info)
   □ Hesitant/skeptical (worried about something)
   □ Frustrated/disappointed (something went wrong)
   □ Excited/ready (moving toward commitment)
   □ Uncertain/ambivalent (conflicted)

3. Question/Need Type?
   □ "Tell me about [service]" (education request)
   □ "I'm worried about [X]" (objection)
   □ "This didn't work for me" (complaint)
   □ "I'm ready to book" (close signal)
   □ "It's been a while" (re-engagement)
   □ "I want to refer my friend" (advocacy)

4. Decision: Which Skill?
   Based on customer type + emotional state + question type,
   select the most appropriate skill from the 14 available.
```

### **Phase 4: Route to Appropriate Skill**

**AESTHETICS ROUTING:**
| Customer State | Skill to Use |
|---|---|
| First-time inquiry | consult-and-pitch.md |
| Naturalness fear | first-time-converter.md or objection-buster.md |
| Price hesitation | objection-buster.md |
| Competitor comparison | competitor-defense.md |
| Ready to book | close-the-booking.md |
| Ready for second treatment | upsell-booking.md or cross-sell.md |
| Results plateau (4-6 months) | re-engagement.md |
| Complaint/issue | complaint-handler.md |
| Wants to refer | referral-nudger.md |

**SPA ROUTING:**
| Customer State | Skill to Use |
|---|---|
| First-time inquiry | first-time-converter.md |
| Unsure/skeptical | consult-and-pitch.md |
| Price hesitation | objection-buster.md |
| Competitor comparison | competitor-defense.md |
| Ready to book | close-the-booking.md |
| Post-booking upsell | upsell-booking.md or bundle-builder.md |
| Lapsed (silent for weeks) | re-engagement.md |
| Complaint/negative experience | complaint-handler.md |
| Wants to refer | referral-nudger.md |

**SLIMMING ROUTING:**
| Customer State | Skill to Use |
|---|---|
| First-time, past failures | first-time-converter.md |
| Comparing to other programs | competitor-defense.md |
| Price hesitation | objection-buster.md |
| Diagnostic: why did past fail | consult-and-pitch.md |
| Ready to commit | close-the-booking.md |
| Just booked | close-detector.md + week1-4-engagement.md |
| Week 1-4 engagement | week1-4-engagement.md |
| Slipped/gaining back | complaint-handler.md |
| Silent for 2+ weeks | re-engagement.md |
| Wants to refer | referral-nudger.md |

### **Phase 5: Generate Response**

```
Load selected skill file
→ Read skill scripts (typically 4-8 variants)
→ Select script that matches customer context
→ Fill in customer-specific details
→ Generate natural, conversational response
→ Keep response concise (2-4 paragraphs)
→ Add appropriate brand signature
```

### **Phase 6: Validate Response**

Run automatic validation against:

**1. Forbidden Phrases Check**
```
Load: validation-rules.json → forbidden_phrases array
For each forbidden phrase:
  - Search response for that phrase
  - If found: Flag as violation
  - If not found: Pass
```

**2. Required Elements Check**
```
Load: CLAUDE.md → Validation Checklist
Verify response includes:
  ✓ Appropriate tone markers
  ✓ Second-person language
  ✓ Correct signature
  ✓ Clear next step
  ✓ Brand-specific elements (sensory language for Spa, clinical grounding for Aesthetics, etc.)
```

**3. Tone Consistency Check**
```
Verify tone matches brand personality:
  - Aesthetics: Graceful, Confident, Natural, Personalized, Expert
  - Spa: Peaceful, Warm, Soothing, Purposeful, Elegant
  - Slimming: Compassionate, Evidence-Led, Shame-Free, Future-Focused, Relapse-Normalized
```

**4. Calculate Validation Score**
```
Base Score: 100 points

Deductions:
  - Each forbidden phrase: -15 points
  - Missing required element: -10 points
  - Tone inconsistency: -10 points
  - Wrong signature: -20 points
  - Weak personalization: -5 points

FINAL SCORE = Base - Deductions

If score ≥ 85: ✓ READY TO SEND
If score 70-84: ~ ACCEPTABLE (consider revision)
If score < 70: ✗ NEEDS REVISION (show violations)
```

### **Phase 7: Output Response**

**Option A: Validation Pass (Score ≥ 85)**
```
═══════════════════════════════════════════════════════════
✓ BRAND-VALIDATED RESPONSE READY
═══════════════════════════════════════════════════════════

BRAND: Carisma Aesthetics
SKILL USED: consult-and-pitch.md
VALIDATION SCORE: 98/100 ✓

CUSTOMER MESSAGE:
"I'm interested in Botox but worried about looking frozen..."

GENERATED RESPONSE:
───────────────────────────────────────────────────────────
[Response text here]

Beautifully yours,
Sarah
───────────────────────────────────────────────────────────

STATUS: ✓ READY TO SEND
NEXT ACTION: Copy response and paste to customer

═══════════════════════════════════════════════════════════
```

**Option B: Validation Fail (Score < 85)**
```
═══════════════════════════════════════════════════════════
✗ RESPONSE NEEDS REVISION
═══════════════════════════════════════════════════════════

BRAND: Carisma Aesthetics
SKILL USED: objection-buster.md
VALIDATION SCORE: 72/100 ✗

VIOLATIONS FOUND:

❌ Forbidden Phrase Detected:
   Found: "fix your wrinkles"
   Issue: Forbidden phrase (fix, flaws)
   Suggestion: Use "soften lines" instead

❌ Missing Required Element:
   Issue: No naturalness assurance mentioned
   Suggestion: Add "You'll look like yourself, just more rested"

❌ Tone Issue:
   Found: "Book now before spots fill up!"
   Issue: Urgency language (forbidden for Aesthetics)
   Suggestion: "Let's find a time that works for you"

═══════════════════════════════════════════════════════════

HOW TO FIX:
1. Replace "fix" with "soften"
2. Add naturalness reassurance statement
3. Remove urgency language

NEXT ACTION: Request revision or manually edit response
```

---

## Response Patterns (Quick Reference)

### **Pattern 1: Diagnostic/Education**
Used when: Customer asking for information or has objection

```
[Acknowledge their question/concern]
→ [Explain context or science (if applicable)]
→ [Offer what we actually do]
→ [Invite next conversation]
```

### **Pattern 2: Permission/Relief**
Used when: Customer worried or hesitant

```
[Validate their concern as wise]
→ [Explain why their worry makes sense]
→ [Show how we address it]
→ [Invite commitment]
```

### **Pattern 3: Complaint/Recovery**
Used when: Customer expressing disappointment or issue

```
[Apologize specifically]
→ [Acknowledge what they're feeling]
→ [Explain what happened + take responsibility]
→ [Show how we fix it]
→ [Rebuild trust]
```

### **Pattern 4: Lapsed/Re-engagement**
Used when: Customer silent for weeks/months

```
[Genuine "we've missed you" language]
→ [Remember something from before]
→ [Name what's new or what we've thought about]
→ [Soft re-invitation]
```

---

## Troubleshooting

**Issue: "Could not detect brand folder"**
- Verify you're in one of: CRM-AES/, CRM-SPA/, CRM-SLIM/
- If path is custom, manually specify: `/crmrespond brand=AES`

**Issue: "Skill file not found"**
- Ensure all 14 skill files exist in `skills/` folder
- Check skill file names match exactly

**Issue: "Validation rules not found"**
- Verify file exists: `hooks/brand-voice-validation-rules.json`
- Check JSON is valid (not corrupted)

**Issue: "Response has many violations"**
- This is normal for complex responses
- Use the violation list to revise
- Rerun /crmrespond after fixes

**Issue: "I want to send anyway despite violations"**
- CAUTION: This defeats the purpose
- Better to spend 2 minutes revising than send off-brand message
- If unsure, ask team lead

---

## Best Practices

✓ **DO:**
- Paste full customer message (preserve original tone)
- Wait for validation score before sending
- Address every violation
- Test response tone against CLAUDE.md checklist
- Copy exact response from [READY TO SEND] section

✗ **DON'T:**
- Send before validation passes (score ≥ 85)
- Ignore violation warnings
- Edit response after copying (risks introducing new issues)
- Mix brand rules (don't use Spa tone for Aesthetics)
- Assume validation will pass (always check score)

---

## Performance Metrics

Track these to ensure system is working:
- Average validation score: Target ≥ 90
- First-pass pass rate: Target ≥ 85% (of responses pass on first attempt)
- Violations per response: Target ≤ 2 on average
- Time per response: Target ≤ 5 minutes (paste, /crmrespond, send)

---

**Last Updated:** 2026-02-22
**Version:** 1.0 Production
