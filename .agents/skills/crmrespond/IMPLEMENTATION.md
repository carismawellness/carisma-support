# /crmrespond Skill Implementation

## Installation

1. Copy `.agents/skills/crmrespond/` to your local Claude Code project
2. Ensure folder structure matches:
   ```
   .agents/
     skills/
       crmrespond/
         AGENT.md
         config.json
         IMPLEMENTATION.md
   ```

3. Test the skill:
   ```
   /crmrespond

   [Paste test customer message]
   ```

## Slash Command Registration

In Claude Code settings, register the slash command:

**File:** `.claude/config.yaml` (or Claude Code settings UI)

```yaml
skills:
  - name: crmrespond
    description: "Generate brand-validated customer response"
    command: /crmrespond
    path: .agents/skills/crmrespond/AGENT.md
    auto_load: true
```

## Testing the Skill

### Test Case 1: Aesthetics First-Time Inquiry

**Input:**
```
/crmrespond

Hi! I'm thinking about getting Botox for the first time. I'm worried about
looking artificial though. What's your approach?
```

**Expected Output:**
```
✓ BRAND: Carisma Aesthetics
✓ SKILL USED: consult-and-pitch.md
✓ VALIDATION SCORE: 95/100

[Response about diagnostic consultation, naturalness assurance, etc.]

Beautifully yours, Sarah
```

### Test Case 2: Spa Price Hesitation

**Input:**
```
/crmrespond

I love the idea of a massage but it seems expensive.
Can you explain the pricing?
```

**Expected Output:**
```
✓ BRAND: Carisma Spa
✓ SKILL USED: objection-buster.md
✓ VALIDATION SCORE: 92/100

[Response reframing as investment in sanctuary/self-care, etc.]

Peacefully, Sarah
```

### Test Case 3: Slimming Past Failures

**Input:**
```
/crmrespond

I've tried 5 different diets and always gain the weight back.
Why would your program be different?
```

**Expected Output:**
```
✓ BRAND: Carisma Slimming
✓ SKILL USED: competitor-defense.md
✓ VALIDATION SCORE: 97/100

[Response about relapse normalization, evidence-led approach, etc.]

With you every step, Katya
```

## Keyboard Shortcuts

Set up quick triggers in Claude Code:

**Option 1: VS Code Command Palette**
```
Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux)
→ type "crmrespond"
→ press Enter
```

**Option 2: Custom Keybinding**
```
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)
→ Instantly opens /crmrespond prompt
```

## Maintenance

### Weekly Checkup
- Monitor validation scores (should average ≥90)
- Check violation patterns (same violations recurring?)
- Verify all 14 skill files are accessible

### Monthly Review
- Audit random responses for quality
- Check if brand-voice-validation-rules.json needs updates
- Gather agent feedback on friction points

### When Brand Changes
- Update `knowledge/brand-voice.md`
- Update `hooks/brand-voice-validation-rules.json`
- Notify agents of changes
- Test 5+ responses with new rules

## Troubleshooting Guide

| Issue | Cause | Fix |
|-------|-------|-----|
| "Brand not detected" | Wrong folder or path | Verify in CRM-AES/SPA/SLIM folder |
| "Skill not found" | Missing skill file | Check skills/ folder has 14 files |
| "Validation always fails" | Rules too strict | Review validation-rules.json |
| "Response tone off" | CLAUDE.md not loaded | Ensure folder has CLAUDE.md |
| "Slow response time" | Large skill files | Optimize JSON parsing |

## Performance Targets

- Response generation: < 10 seconds
- Validation: < 5 seconds
- Total: < 15 seconds per message
- First-pass pass rate: ≥ 85%
- Average validation score: ≥ 90

## Security & Data

- All responses generated locally (no external API calls)
- Customer messages never stored (processed in-memory only)
- Brand rules remain in local folders (no cloud sync)
- Git commits only when manually initiated
