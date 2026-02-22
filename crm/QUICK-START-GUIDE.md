# Carisma CRM Quick Start (1-Page Reference)

**Print this page and keep at your desk.**

---

## One-Time Setup (15 minutes)

```bash
# 1. Clone repository (do this once)
git clone [REPOSITORY_URL]
cd carisma-crm

# 2. Navigate to your brand folder
cd CRM/CRM-AES    # For Aesthetics
cd CRM/CRM-SPA    # For Spa
cd CRM/CRM-SLIM   # For Slimming

# 3. Verify you're in the right place
pwd              # Should end with: CRM/CRM-AES or SPA or SLIM
ls CLAUDE.md     # Should show: CLAUDE.md

# 4. Open Claude Code
claude
```

**Once open, Claude Code stays open all shift. Just run `/crmrespond` for each customer.**

---

## Daily Workflow (Repeat for Each Customer)

```
STEP 1: Copy Customer Message
  ↓ Get exact message from WhatsApp/email/chat
  ↓ Copy everything (including emoji, typos, tone)

STEP 2: Generate Response
  ↓ Type: /crmrespond
  ↓ Paste the customer message
  ↓ Wait 15-30 seconds for response + validation

STEP 3: Check Validation Score
  ✓ ≥85/100  → SEND IT (brand-safe)
  ~ 70-84    → OK to send or rerun for better
  ✗ <70      → MUST REVISE (violations found)

STEP 4: Copy & Send
  ↓ Highlight response text (not headers)
  ↓ Copy (Cmd+C or Ctrl+C)
  ↓ Paste to customer chat (Cmd+V or Ctrl+V)
  ↓ Send

NEXT CUSTOMER: Repeat steps 1-4
```

---

## Validation Scores

| Score | Status | Action |
|-------|--------|--------|
| 90-100 | Excellent | Send immediately |
| 85-89 | Good | Send (brand-safe) |
| 78-84 | Acceptable | Send or rerun |
| 70-77 | Borderline | Revise/rerun |
| <70 | Violation | Must fix before sending |

**Golden Rule: Only send at 85+**

---

## Brand Signatures (Use Correct One!)

```
Aesthetics:
Beautifully yours,
Sarah

Spa:
Peacefully,
Sarah

Slimming:
With you every step,
Katya
```

---

## Keyboard Shortcuts

| Action | Mac | Windows |
|--------|-----|---------|
| Copy | Cmd+C | Ctrl+C |
| Paste | Cmd+V | Ctrl+V |
| Switch apps | Cmd+Tab | Alt+Tab |
| Select all | Cmd+A | Ctrl+A |

---

## Real Workflow Examples

### Example 1: First Try Pass (2 min)
```
Customer: "Can I get Botox?"
/crmrespond → Paste → Score 96/100 ✓ → Send
```

### Example 2: Rerun Needed (3 min)
```
Customer: "Worried about looking frozen"
/crmrespond → Paste → Score 72/100 ~ → Rerun
/crmrespond → Paste → Score 89/100 ✓ → Send
```

### Example 3: Violation (4 min)
```
Customer: "How much do you charge?"
/crmrespond → Paste → Score 65/100 ✗ → Rerun
/crmrespond → Paste → Score 87/100 ✓ → Send
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Claude Code won't open | `brew install anthropic/tap/claude` (Mac) or check installation |
| Brand not detected | `pwd` to verify folder, then `git pull origin main` |
| /crmrespond not found | Close Claude Code (Ctrl+C), wait 5 sec, reopen with `claude` |
| Score < 70 repeatedly | Rerun `/crmrespond` 2-3 times, then ask team lead |
| Can't copy text | Try triple-clicking paragraph, then Cmd+C / Ctrl+C |

---

## Tips for Speed

1. **Keep Claude Code open all day** — Don't close between customers
2. **Arrange windows side-by-side** — Claude on left, chat on right
3. **Copy exact message** — Include emoji, tone, typos
4. **Rerun if low score** — Usually works second time
5. **Track your time** — Goal: 30-60 seconds per response by week 4

---

## Performance Goals

| Metric | Week 1 | Week 4 |
|--------|--------|--------|
| Messages/day | 8-10 | 20-25 |
| Avg score | 75+ | 90+ |
| Per message time | 2-3 min | 30-60 sec |
| First-pass success | 60% | 90%+ |

---

## When to Ask for Help

Contact your team lead if:
- Claude Code crashes
- Brand not detected
- Validation fails repeatedly (< 70 after 3 tries)
- Unsure if response is safe to send
- Customer situation doesn't fit skills

---

## Your 14 Skills (Reference)

The system automatically picks the best skill. Know these exist:

1. consult-and-pitch — First inquiry
2. first-time-converter — Ready to decide
3. objection-buster — Handle "but what about..."
4. close-the-booking — Customer ready to book
5. competitor-defense — Why us vs. them
6. complaint-handler — Something went wrong
7. upsell-booking — Upgrade booking
8. re-engagement — Old customer returning
9. testimonial-request — Ask for review
10. referral-incentive — Refer a friend
11. bundle-builder — Package deals
12. close-detector — Customer showing readiness
13. pricing-breakdown — Explain cost
14. scheduling-facilitation — Pick date/time

---

## First Day Checklist

- [ ] Claude Code installed
- [ ] Repository cloned
- [ ] Correct brand folder identified
- [ ] CLAUDE.md loads when opening folder
- [ ] Ran 3 test /crmrespond commands
- [ ] Understand validation score meanings
- [ ] Know your brand signature
- [ ] Windows arranged side-by-side
- [ ] Ready to start with real customers

---

## Quick Reference: The Complete Workflow

```
START SHIFT                    EACH CUSTOMER
↓                              ↓
cd CRM/CRM-AES                /crmrespond
claude                        [Paste message]
                              [See score]
(Keep open all day)           ├→ ✓ 85+: Copy → Paste → Send
                              ├→ ~ 70-84: Send or Rerun
                              └→ ✗ <70: Rerun or Edit
```

---

## Support

- **Brand rules:** See `knowledge/brand-voice.md` in your folder
- **Validation rules:** See `hooks/brand-voice-validation-rules.json`
- **All skills:** Folder `skills/` contains all 14 skill files
- **Agent instructions:** See `CLAUDE.md`
- **Questions:** Ask your team lead

---

**Version:** 1.0
**Last Updated:** February 22, 2026
**Print this page. Keep it at your desk. Refer to AGENT-WORKFLOW-SETUP.md for detailed instructions.**
