# Carisma Hooks System

Two automated post-tool hooks that warn agents about quality issues in real-time.

---

## Overview

| Hook | Trigger | Purpose | Action |
|------|---------|---------|--------|
| **message-quality-check.bat** | After Claude generates a message | Detects AI-tells + off-brand phrases | ⚠️ Warns agent |
| **sentiment-check.bat** | After customer message is received | Detects anger/upset indicators | ⚠️ Warns + suggests [complaint-handler] |

**Important:** Both hooks **WARN only** — they don't block or prevent agents from sending. Agents can override and send anyway, but they're alerted to issues first.

---

## Hook 1: Message Quality Check

**File:** `message-quality-check.bat`

**What it does:**
- Scans Claude's generated customer response
- Checks for AI-tell phrases (sound robotic)
- Checks for off-brand phrases (violate Carisma voice)
- Shows warnings with suggestions for better alternatives

**Triggers on:**
- Customer-facing message generation
- Draft responses
- Email templates

**AI-Tell Phrases Detected:**
- "Certainly!", "Of course!", "I'd be happy to"
- "Absolutely!", "Please don't hesitate"
- "As an AI", "I hope this helps"
- "Great question!", "Thank you for reaching out"

**Off-Brand Phrases Detected:**
- "Pamper yourself", "Treat yourself"
- "Book now!", "Limited time!", "Don't miss out!"
- "Amazing", "Fantastic", "Awesome"
- "Perfect for your holiday", "Fun spa day"
- Clinical terms: "myofascial", "lymphatic drainage"

**Example Warning:**

```
⚠️  AI-TELL DETECTED: "Certainly!"

This phrase sounds robotic. Replace with something more natural:
  ❌ "Certainly!" or "Of course!" or "I'd be happy to"
  ✅ "Got it" or "Let me help" or "Perfect, here's what..."

---

⚠️  OFF-BRAND PHRASE DETECTED: "Book now!"

This doesn't match Carisma's voice. Replace with something more aligned:
  ❌ "Book now!" / "Pamper yourself"
  ✅ "A gift of time. Whenever you're ready."
```

---

## Hook 2: Sentiment Check

**File:** `sentiment-check.bat`

**What it does:**
- Scans customer's incoming message
- Detects anger/frustration/upset signals
- Warns agent and suggests complaint-handler skill activation

**Triggers on:**
- Intake messages
- Customer inquiries
- Support requests

**Anger Signals Detected (RED FLAG):**
- "disgusted", "ridiculous", "unacceptable"
- "never again", "refund demand"
- "terrible", "awful", "complaint"
- "disappointed", "shocked", "furious", "outraged"
- "absolutely unacceptable", "I want a refund"

**Mild Frustration Signals (YELLOW FLAG):**
- "disappointed", "concerned", "frustrated"
- "worried", "hesitant", "uncertain"
- "problem", "issue", "trouble", "difficulty"

**Example Warning (RED FLAG):**

```
🔴 NEGATIVE SENTIMENT DETECTED: "disgusted"

This customer is upset or angry.

RECOMMENDED ACTION:
  1. Invoke [complaint-handler] skill
  2. Follow: Absorb → Validate → Own → Resolve → Restore
  3. Sign off with "With care, Sarah" (not "Peacefully, Sarah")

Remember: Service Recovery Paradox — handled well, upset customers become MORE loyal.
```

**Example Warning (YELLOW FLAG):**

```
⚠️  MILD FRUSTRATION DETECTED: "disappointed"

Customer may be concerned or hesitant. Consider:
  - Extra empathy in your response
  - Clear explanations (no jargon)
  - [objection-buster] skill if price/timing related
  - [complaint-handler] skill if service issue
```

---

## How Hooks Work (Technical)

### Post-Tool Hook Execution

1. **Agent types message or customer input into Claude Code**
2. **Claude processes and generates response/output**
3. **Hook automatically runs on the output** (post-tool)
4. **Hook checks for issues and displays warnings** (if any)
5. **Agent sees warnings but CAN OVERRIDE** (not blocked)
6. **Agent sends message** (hooking doesn't prevent sending)

### Configuration

Both hooks are registered in `.claude/settings.json`:

```json
{
  "hooks": {
    "postToolUse": [
      {
        "name": "message-quality-check",
        "command": "cmd /c hooks\\message-quality-check.bat",
        "mode": "warn",
        "enabled": true
      },
      {
        "name": "sentiment-check",
        "command": "cmd /c hooks\\sentiment-check.bat",
        "mode": "warn",
        "enabled": true
      }
    ]
  }
}
```

---

## Setup Instructions (Windows)

### Prerequisites
- Windows 10 or later
- Claude Code installed
- carisma-support repo cloned locally
- Batch scripting enabled (default on Windows)

### Installation

1. **Place hook files in correct directory:**
   ```
   carisma-support/
   └── hooks/
       ├── message-quality-check.bat
       ├── sentiment-check.bat
       └── README.md (this file)
   ```

2. **Register hooks in `.claude/settings.json`:**
   ```json
   {
     "hooks": {
       "postToolUse": [
         {
           "name": "message-quality-check",
           "command": "cmd /c hooks\\message-quality-check.bat",
           "mode": "warn",
           "enabled": true
         },
         {
           "name": "sentiment-check",
           "command": "cmd /c hooks\\sentiment-check.bat",
           "mode": "warn",
           "enabled": true
         }
       ]
     }
   }
   ```

3. **Reload Claude Code settings:**
   - Close Claude Code terminal
   - Re-open Claude Code
   - Type: `/help` to confirm hooks are loaded

4. **Test hooks:**
   - Generate a message with "Certainly!" in it
   - Verify message-quality-check warns you
   - Paste a customer message with "disgusted" in it
   - Verify sentiment-check warns you

### Troubleshooting

**Hooks not running?**
- Check `.claude/settings.json` is valid JSON (use JSON validator)
- Verify hook file paths are correct (relative to repo root)
- Restart Claude Code after editing settings
- Check Windows batch execution is enabled (usually default)

**Hooks running but not detecting phrases?**
- Verify the .bat file contains the phrase in its detection logic
- Add new phrases to the `set "ai_tells=..."` or `set "anger_signals=..."` lines
- Test with exact phrase match first (case-insensitive by default)

**Hooks interfering with workflow?**
- Mode is `warn_only` — warnings don't prevent sending
- To disable temporarily: set `"enabled": false` in settings.json
- To disable a specific hook: remove its entry from `postToolUse` array

---

## Adding New Phrases

Both hooks allow easy addition of new detection phrases.

### Add AI-Tell Phrase

Edit `message-quality-check.bat`, find this line:
```batch
set "ai_tells=Certainly!|I'd be happy to|Of course!|..."
```

Add new phrase with `|` separator:
```batch
set "ai_tells=Certainly!|I'd be happy to|Of course!|Let me help you with"
```

### Add Off-Brand Phrase

Edit `message-quality-check.bat`, find this line:
```batch
set "off_brand=Pamper yourself|Treat yourself|..."
```

Add new phrase:
```batch
set "off_brand=Pamper yourself|Treat yourself|Special offer|Limited slots"
```

### Add Anger Signal

Edit `sentiment-check.bat`, find this line:
```batch
set "anger_signals=disgusted|ridiculous|..."
```

Add new phrase:
```batch
set "anger_signals=disgusted|ridiculous|lawsuit|legal action|attorney"
```

---

## Performance Notes

- Both hooks run in milliseconds (deterministic string matching)
- No API calls or external dependencies
- Safe to run on every message (zero performance impact)
- Warnings are cached per message (no duplicate warnings)

---

## Hook Behavior Summary

| Scenario | Hook | Output | Agent Can | Notes |
|----------|------|--------|-----------|-------|
| Message has "Certainly!" | message-quality-check | ⚠️ Warning | Override & send | Suggests "Got it" instead |
| Message has "Book now!" | message-quality-check | ⚠️ Warning | Override & send | Suggests poetic language |
| Customer says "disgusted" | sentiment-check | 🔴 RED FLAG | Override & send | Suggests [complaint-handler] skill |
| Customer says "concerned" | sentiment-check | ⚠️ YELLOW FLAG | Override & send | Suggests extra empathy |
| All checks pass | Both | ✅ Green light | Send normally | No warnings, proceed |

---

## Best Practices

✅ **DO:**
- Read hook warnings before sending
- Use suggested alternatives when provided
- Respond to RED FLAGS (anger) immediately with complaint-handler
- Update hook phrase lists when you find new patterns

❌ **DON'T:**
- Ignore RED FLAG warnings (respond to upset customers carefully)
- Override EVERY warning (defeats the purpose of quality control)
- Edit .bat files without testing changes first
- Disable hooks permanently (they protect brand consistency)

---

*Hooks System — Version 1.0*
*Windows Batch Implementation*
*Last Updated: 2026-02-20*
*Maintained by: Carisma Support*
