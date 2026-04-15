# Carisma CRM Agent Workflow Setup

**For:** Customer support representatives (Aesthetics, Spa, Slimming)
**Goal:** Set up your local Claude Code project so you can copy-paste customer messages and get brand-perfect responses automatically
**Time Required:** 15 minutes (first time), 2 minutes (subsequent sessions)
**Last Updated:** February 22, 2026

---

## Prerequisites

Before you start, make sure you have:

- [ ] Claude Code installed (https://claude.com/claude-code)
- [ ] Git access to the Carisma CRM repository
- [ ] Access to your assigned brand folder (CRM-AES, CRM-SPA, or CRM-SLIM)
- [ ] A terminal or command prompt application
- [ ] Basic familiarity with copying/pasting text

---

## Phase 1: Clone/Access the Repository (One-Time Setup)

### Option A: First Time - Clone the Repository

**Step 1: Open your terminal**

On Mac:
```bash
# Press Command + Space to open Spotlight
# Type "terminal" and press Enter
```

On Windows:
```bash
# Press Windows key + R
# Type "cmd" or "powershell" and press Enter
```

**Step 2: Navigate to your projects folder**

```bash
cd ~/Projects
# or wherever you keep projects
# Example: cd ~/Documents
```

**Step 3: Clone the Carisma CRM repository**

Ask your team lead for the repository URL, then:

```bash
git clone [REPOSITORY_URL]
cd carisma-crm
```

**What you should see:**
```
Cloning into 'carisma-crm'...
...
```

### Option B: Already Have Repo - Update It

If you already have the repo locally:

```bash
cd ~/path/to/carisma-crm
git pull origin main
```

**Verify the pull worked:**
```bash
ls -la CRM/
```

You should see three folders:
```
CRM-AES/  (Aesthetics)
CRM-SPA/  (Spa)
CRM-SLIM/ (Slimming)
```

---

## Phase 2: Open Claude Code in Your Brand Folder

### Step 1: Navigate to Your Brand Folder

Depending on which brand you support:

**For Aesthetics:**
```bash
cd CRM/CRM-AES
```

**For Spa:**
```bash
cd CRM/CRM-SPA
```

**For Slimming:**
```bash
cd CRM/CRM-SLIM
```

**Verify you're in the right place:**
```bash
pwd
# Should show something ending in: CRM/CRM-AES, CRM/CRM-SPA, or CRM/CRM-SLIM

ls CLAUDE.md
# Should show: CLAUDE.md
```

### Step 2: Open Claude Code

```bash
claude
```

**What happens next:**
- Claude Code opens in your default text editor (usually VS Code)
- The system reads your folder (CRM-AES/CRM-SPA/CRM-SLIM)
- It auto-loads `CLAUDE.md` with your brand instructions
- Your brand context is now available

**You should see in the Claude Code interface:**
```
✓ Brand detected: Carisma Aesthetics
✓ CLAUDE.md loaded
✓ Brand voice context ready
✓ 14 skills available
✓ Ready to process customer messages
```

If you don't see this, contact your team lead.

---

## Phase 3: Copy Customer Message

### Step 1: Get the Customer Message

From wherever your customers message you (WhatsApp, email, chat platform, support ticket):

1. Find the customer's message
2. Select the entire message (triple-click or click-drag)
3. Copy it exactly as written

**Copy their exact words:**
- Include all punctuation
- Keep emoji if they used them
- Preserve their tone (casual, frustrated, excited, etc.)
- Include typos if present
- Don't edit or "clean up" the message

**Example - Copy this exactly:**
```
Hi! I'm interested in Botox but I'm SO worried about looking
frozen. 😬 Is it expensive? Also, how long does it actually work?
```

**NOT this edited version:**
```
The customer is interested in Botox and has concerns about
appearing artificial. They also want to know about price and duration.
```

Why? Because Claude uses their exact tone and emotion to generate a response that matches their energy.

---

## Phase 4: Generate Brand-Perfect Response

### Step 1: Run the /crmrespond Skill

In Claude Code's input field, type:

```
/crmrespond
```

Then press Enter.

### Step 2: Paste Customer Message

After you run `/crmrespond`, you'll see a prompt. Paste the exact customer message:

```
/crmrespond
[Press Enter, then paste the customer message here]
```

Example:
```
/crmrespond

Hi! I'm interested in Botox but I'm SO worried about looking
frozen. 😬 Is it expensive? Also, how long does it actually work?
```

### Step 3: Let the System Process

The system will:
1. Detect your brand (Aesthetics, Spa, or Slimming)
2. Load your brand voice + validation rules
3. Analyze the customer's message
4. Select the best skill for this situation
5. Generate a response
6. Validate the response against brand rules
7. Output the result with a validation score

This typically takes 15-30 seconds.

---

## Phase 5: Review Validation Score

After processing, you'll see one of three outcomes:

### Outcome A: Response is Ready (Score ≥ 85/100)

```
═══════════════════════════════════════════════════════════
✓ BRAND-VALIDATED RESPONSE READY
═══════════════════════════════════════════════════════════

BRAND: Carisma Aesthetics
SKILL USED: consult-and-pitch.md
VALIDATION SCORE: 98/100 ✓

GENERATED RESPONSE:
───────────────────────────────────────────────────────────
I completely understand that concern—and it's smart that you're
thinking about this carefully.

The "frozen look" happens when Botox is over-treated. We take a
different approach. We use just enough to soften lines while you
retain full expression. People notice you look refreshed—they
don't think "she got Botox."

Regarding investment: we're positioned as clinical expertise, not
discount pricing. That means quality practitioner time, medical
safety, and conservative technique. Think of it as clinical
investment.

Let's have a quick consultation where I understand your specific
goals, and I'll show you what that actually looks like.

Beautifully yours,
Sarah
───────────────────────────────────────────────────────────

STATUS: ✓ READY TO SEND

NEXT: Copy the response above and paste to your customer chat
```

**What to do:** Jump to Phase 6 and send the response.

---

### Outcome B: Response Acceptable But Could Be Better (Score 70-84/100)

```
═══════════════════════════════════════════════════════════
~ RESPONSE ACCEPTABLE BUT COULD BE BETTER
═══════════════════════════════════════════════════════════

BRAND: Carisma Aesthetics
VALIDATION SCORE: 78/100

IMPROVEMENT SUGGESTIONS:
  ⚠ Could be more personalized to customer's specific concern
  ⚠ Missing naturalness guarantee (add: "You'll look like yourself...")
  ⚠ Tone could feel more warm and consultative

GENERATED RESPONSE:
───────────────────────────────────────────────────────────
[Response text here]
───────────────────────────────────────────────────────────

OPTION 1: Send as-is (still acceptable quality)
OPTION 2: Rerun /crmrespond to try for higher score
OPTION 3: Manually edit to address suggestions above
```

**What to do:** Either:
1. **Send as-is** if you're comfortable with it (78/100 is acceptable)
2. **Rerun** `/crmrespond` to try for improvement
3. **Manually edit** by addressing the suggestions

Most agents choose option 2: rerun to try for higher score. No penalty for trying again.

---

### Outcome C: Response Needs Revision (Score < 70/100)

```
═══════════════════════════════════════════════════════════
✗ RESPONSE NEEDS REVISION — Violations Found
═══════════════════════════════════════════════════════════

BRAND: Carisma Aesthetics
VALIDATION SCORE: 65/100 ✗

VIOLATIONS FOUND:

❌ VIOLATION #1: Forbidden Phrase Detected
   Found phrase: "fix your wrinkles"
   Issue: "Fix" is forbidden language for Aesthetics
   Fix: Use "soften lines" or "enhance" instead

❌ VIOLATION #2: Missing Required Element
   Issue: No naturalness assurance in response
   Fix: Add a sentence like: "You'll look like yourself, just more refreshed"

GENERATED RESPONSE:
───────────────────────────────────────────────────────────
[Response text here]
───────────────────────────────────────────────────────────

ACTION REQUIRED:
1. Read violations above
2. Either: (A) Manually edit response to fix violations OR
           (B) Rerun /crmrespond for fresh attempt
3. When score reaches ≥85, you can send
```

**What to do:** You must fix this before sending:
1. Read the violations carefully
2. Either manually edit the response to fix them, OR
3. Rerun `/crmrespond` to let the system try again

**Don't send anything below 85/100** — it means brand rules were violated.

---

## Understanding Validation Scores

| Score | Meaning | Action |
|-------|---------|--------|
| 90-100 | Excellent | Send immediately |
| 85-89 | Good | Send (brand-safe) |
| 78-84 | Acceptable | Send or rerun |
| 70-77 | Borderline | Consider revising |
| < 70 | Violation | Must revise |

**Golden Rule:** Only send responses at 85 or above. Below 85, brand rules were compromised.

---

## Phase 6: Send Response to Customer

### Step 1: Select Response Text

In Claude Code, locate the section labeled "GENERATED RESPONSE:" and everything below it until the next section header.

Highlight this text by:
- Clicking at the start of the response
- Dragging to the end
- Or triple-click to select the paragraph

**What to select:**
```
I completely understand that concern—and it's smart that you're
thinking about this carefully.

The "frozen look" happens when Botox is over-treated...

[all the way down to the signature]

Beautifully yours,
Sarah
```

**What NOT to select:**
- Don't include "GENERATED RESPONSE:" header
- Don't include "STATUS:" line
- Just the actual response text

### Step 2: Copy Response

```bash
# Mac:
Cmd+C

# Windows/Linux:
Ctrl+C
```

### Step 3: Go to Customer Chat

Switch to the platform where this customer messaged you:
- WhatsApp
- Email
- Customer support chat
- SMS
- Facebook Messenger
- Whatever platform you use

### Step 4: Paste Response

```bash
# Mac:
Cmd+V

# Windows/Linux:
Ctrl+V
```

The response appears in the message field.

### Step 5: Send

Click send or press Enter (depending on the platform).

**Done!** That customer now has a brand-perfect response.

---

## Complete Workflow (Visual)

```
┌─────────────────────────────────────────┐
│ Agent opens terminal                    │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ cd CRM/CRM-AES (or SPA or SLIM)        │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ claude                                  │
│ (Claude Code opens, CLAUDE.md loads)    │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ Agent copies customer message           │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ /crmrespond                             │
│ (run in Claude Code)                    │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ Agent pastes customer message           │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ System generates response + validates   │
│ (15-30 seconds)                         │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ Agent sees validation score             │
└────────────────┬────────────────────────┘
                 ↓
        ┌────────┴────────┐
        ↓                 ↓
    ✓ SEND          ~ or ✗ REVISE
   (≥85)             (< 85)
        ↓                 ↓
    [Copy]         [Rerun or Edit]
        ↓                 ↓
    [Paste]              ↓
        ↓         [Return to validation]
    [Send]


Ready for next customer message
```

---

## Real-Time Workflow Examples

### Example 1: First-Try Success (2 minutes)

```
Customer message:
"Hey! Can I come in for a spa day? I need to relax!"

/crmrespond → [Paste] →
[15 seconds] →
SCORE: 96/100 ✓
[Copy] → [Paste to customer] → [Send]

Time: 2 minutes
```

### Example 2: Needs Revision (3 minutes)

```
Customer message:
"Botox didn't work last time... should I try a different clinic?"

/crmrespond → [Paste] →
[15 seconds] →
SCORE: 72/100 ~ (suggestions shown)
/crmrespond → [Paste again] →
[15 seconds] →
SCORE: 89/100 ✓
[Copy] → [Paste to customer] → [Send]

Time: 3 minutes
```

### Example 3: Violation Needs Fixing (4 minutes)

```
Customer message:
"I want to look younger. How much does a full face lift cost?"

/crmrespond → [Paste] →
[15 seconds] →
SCORE: 62/100 ✗ (forbidden phrase "younger" detected)
[Manually edit: "younger" → "refreshed"] →
✓ Now ready to send

Time: 4 minutes
```

---

## Keyboard Shortcuts (Speed Up Your Work)

### Essential Shortcuts

| Action | Mac | Windows/Linux |
|--------|-----|---------------|
| Copy | Cmd+C | Ctrl+C |
| Paste | Cmd+V | Ctrl+V |
| Select All | Cmd+A | Ctrl+A |
| Switch Apps | Cmd+Tab | Alt+Tab |
| New Terminal Tab | Cmd+T | Ctrl+Shift+T |

### VS Code Shortcuts (If Editing Within Claude Code)

| Action | Shortcut |
|--------|----------|
| Find | Cmd+F (Mac) or Ctrl+F (Windows) |
| Replace | Cmd+H (Mac) or Ctrl+H (Windows) |
| Select Word | Cmd+D (Mac) or Ctrl+D (Windows) |
| Comment Line | Cmd+/ (Mac) or Ctrl+/ (Windows) |

---

## Tips for Speed & Accuracy

### Tip 1: Keep Claude Code Open All Day

Don't close it between customers. Just run `/crmrespond` again for the next message.

**Why?** CLAUDE.md stays loaded, brand context is hot, no reload time needed.

**Setup:** When you start your shift, do this once:
```bash
cd CRM/CRM-AES  # (or your brand)
claude
```

Then leave it open. Each `/crmrespond` takes 15-30 seconds.

### Tip 2: Arrange Windows Side-by-Side

**Optimal workspace setup:**

```
┌──────────────────┬──────────────────┐
│  Claude Code     │  Customer Chat   │
│  (left 50%)      │  (right 50%)     │
│                  │                  │
│  /crmrespond →   │ ← Paste response │
│  Paste message   │                  │
│  See score       │                  │
│  Copy response   │                  │
└──────────────────┴──────────────────┘
```

**On Mac:**
- Open Claude Code
- Open your chat platform (WhatsApp, email, etc.)
- Use keyboard shortcut: Cmd+Ctrl+Right Arrow to snap window to right side
- Then snap other window to left side

**On Windows:**
- Open Claude Code
- Open your chat platform
- Click and drag Claude Code window to left half of screen
- Click and drag chat window to right half of screen
- They'll snap into place

### Tip 3: Copy Exact Customer Message

Preserve everything:
- **Tone:** "Hi!" vs "Hey!" vs "HELLO???" — all matter
- **Punctuation:** "?" vs "??" vs "???" — shows urgency/emotion
- **Emoji:** 😊 tells the system the customer is happy
- **Typos:** "ur interested" tells system they're typing casually
- **Caps:** "HELP ME" tells system they're frustrated

The exact message helps Claude generate a response that matches their energy.

### Tip 4: If Validation Fails, Rerun It

Getting a score below 70? Run `/crmrespond` again.

**Why rerun often works:**
- Each run generates slightly different response
- One version might avoid the forbidden phrase
- One version might include the missing element

**Example workflow:**
```
Run 1: SCORE 65/100 ✗ (forbidden phrase "fix")
Run 2: SCORE 72/100 ~ (closer, but still low)
Run 3: SCORE 87/100 ✓ (ready to send!)
```

Most agents need 1-2 reruns if first attempt has issues. This is normal and expected.

### Tip 5: Track Your Time

Challenge yourself to improve:

| Stage | Week 1 | Week 4 | Goal |
|-------|--------|--------|------|
| First response | 3-4 min | 1-2 min | Speed up setup |
| Subsequent responses | 1.5-2 min | 30-45 sec | Get faster |
| Validation passes | 60-70% | 90%+ | Fewer reruns |
| Average per message | 2 min | 45 sec | 3x faster |

By Week 4, most agents handle 15-20 messages per day at high quality.

---

## Brand Signatures (Know These!)

Always use the correct signature for your brand:

**Carisma Aesthetics:**
```
Beautifully yours,
Sarah
```

**Carisma Spa:**
```
Peacefully,
Sarah
```

**Carisma Slimming:**
```
With you every step,
Katya
```

**Note:** Spa and Aesthetics use "Sarah" — different roles, same person. Slimming uses "Katya" because she's the wellness specialist for that program.

---

## Troubleshooting

### Problem: "Claude Code won't open"

**Symptoms:**
- Terminal shows error when you type `claude`
- "command not found" message

**Solution:**

Check if Claude Code is installed:
```bash
which claude
# Should show a path like /usr/local/bin/claude
```

If not installed, install it:
```bash
# On Mac (using Homebrew):
brew install anthropic/tap/claude

# On Windows/Linux:
# Visit https://claude.com/claude-code and follow installation
```

---

### Problem: "Brand not detected"

**Symptoms:**
- Claude Code opens but shows "Brand: Unknown"
- No context loading message

**Solution:**

Make sure you're in the correct folder:

```bash
# Check where you are
pwd

# Should show something like:
# /Users/yourname/path/to/carisma-crm/CRM/CRM-AES

# If not, navigate to correct folder
cd CRM/CRM-AES  # Aesthetics
# or
cd CRM/CRM-SPA  # Spa
# or
cd CRM/CRM-SLIM # Slimming

# Verify CLAUDE.md exists
ls CLAUDE.md
# Should show: CLAUDE.md

# Then open Claude Code again
claude
```

If CLAUDE.md is missing, update your repository:
```bash
git pull origin main
```

---

### Problem: "/crmrespond not found"

**Symptoms:**
- You type `/crmrespond` but get error
- System doesn't recognize the command

**Solution:**

The skill might not be loaded. Try:

```bash
# Close Claude Code (Cmd+C or Ctrl+C in terminal)
# Wait 5 seconds
# Reopen it
claude
```

If that doesn't work, make sure your repo is up to date:
```bash
git pull origin main
```

If problem persists, contact your team lead.

---

### Problem: "Response score too low (< 70)"

**Symptoms:**
- Validation shows score below 70
- Violations listed (forbidden phrases, missing elements)
- Can't send response

**Solution:**

This is fixable. Try in order:

**Option 1: Rerun /crmrespond (Recommended)**
```
/crmrespond
[Paste customer message again]
```

Different phrasing might work better. Most agents get 85+ on second try.

**Option 2: Manually Fix Violations**

Read the violations listed. If it says:
```
❌ Forbidden phrase detected: "fix your wrinkles"
Fix: Use "soften lines" instead
```

Edit the response to change "fix your wrinkles" to "soften lines", then it's ready to send.

**Option 3: Ask for Help**

If you rerun 3 times and still under 70, contact your team lead. They can review the customer message and help troubleshoot.

---

### Problem: "Can't select or copy response text"

**Symptoms:**
- Highlighting doesn't work
- Copy command does nothing
- Text won't paste to chat

**Solution:**

Try alternative copy methods:

**Method 1: Triple-click to select paragraph**
```
Triple-click on the response paragraph
This selects the whole paragraph
Then Cmd+C or Ctrl+C to copy
```

**Method 2: Click-drag to select**
```
Click at start of response
Hold and drag to end of response
Then Cmd+C or Ctrl+C
```

**Method 3: Use keyboard selection**
```
Click at start of response
Hold Shift
Click at end of response
Then Cmd+C or Ctrl+C
```

**Method 4: Select all and copy manually**
```
Cmd+A (or Ctrl+A) to select all
Manually delete the parts you don't need
Cmd+C to copy what remains
```

---

### Problem: "Response is grammatically wrong" or "doesn't sound right"

**Symptoms:**
- Validation passes (score ≥ 85) but response sounds odd
- Grammar feels off
- Doesn't match customer's energy

**Solution:**

You have two options:

**Option 1: Rerun /crmrespond**
Different run might produce better response.

**Option 2: Edit the response**
If validation passed but you want better phrasing:
- Keep the core message (what makes it brand-safe)
- Improve the grammar or flow yourself
- The core message is what was validated, not every word

Example:
```
Original:
"The frozen look happens when Botox is over-treated.
We use just enough amount to soften lines."

Your edit:
"The frozen look happens when Botox is over-treated.
We use just the right amount to soften lines."
```

Both are brand-safe. Your edit improves readability.

---

### Problem: "Customer asks about something unusual"

**Symptoms:**
- Customer asks about something not covered in standard skills
- Validation keeps failing
- Response feels forced

**Solution:**

You have options:

**Option 1: Pick closest matching skill**
- Look at the 14 skills list in your CLAUDE.md
- Even if it's not perfect, pick closest match
- Let `/crmrespond` adapt it

**Option 2: Contact team lead**
- Some situations need a human decision
- That's okay. Not every message fits templates
- Loop in your manager for guidance

**Option 3: Use validation failures as guides**
- Validation tells you exactly what's missing
- Add what it says is missing
- Rerun until it passes

---

## Quality Checklist (Before Sending)

Before you hit "Send" to the customer, verify:

```
QUALITY CHECKLIST - Before Sending

[ ] Validation Score
    Is score ≥ 85? If not, don't send.

[ ] Signature
    Correct brand signature included?
    Aesthetics: "Beautifully yours, Sarah"
    Spa: "Peacefully, Sarah"
    Slimming: "With you every step, Katya"

[ ] Customer's Question
    Does response actually answer what they asked?
    Compare: Original question → Your response

[ ] Tone Match
    Does your tone match theirs?
    Happy customer → warm, uplifting response?
    Worried customer → calm, reassuring response?
    Frustrated customer → empathetic, problem-solving?

[ ] Forbidden Phrases
    No language like: "fix," "younger," "pamper"
    No clinical jargon: "myofascial," "lymphatic drainage"
    No urgency: "limited time," "book now"

[ ] Personalization
    Does it feel like a response TO THIS PERSON?
    Not generic copy-paste?

[ ] Next Step
    Does it suggest what happens next?
    Invite to consultation? Schedule? Call?

[ ] Grammar
    Spelling correct? Punctuation good? Reads smoothly?
```

If all checked, send it. If any unchecked, revise or rerun.

---

## Daily Workflow Example

Here's what a typical shift looks like:

### 9:00 AM - Start Shift

```bash
cd CRM/CRM-AES
claude
# Claude Code opens, CLAUDE.md loads
```

Claude Code stays open all day. ✓

### 9:05 AM - Customer 1

```
Customer message (WhatsApp):
"Hi! I'm interested in Botox. Is it safe?"

/crmrespond
[Paste message]
[15 seconds]
SCORE: 96/100 ✓
[Copy] → [Paste to WhatsApp] → [Send]
Time: 1.5 minutes
```

### 9:10 AM - Customer 2

```
Customer message (Email):
"I'm worried about looking artificial..."

/crmrespond
[Paste message]
[15 seconds]
SCORE: 78/100 ~ (could be better)
/crmrespond
[Paste message again]
[15 seconds]
SCORE: 89/100 ✓
[Copy] → [Paste to email] → [Send]
Time: 2.5 minutes
```

### 9:15 AM - Customer 3

```
Customer message (Chat):
"How much do treatments cost?"

/crmrespond
[Paste message]
[15 seconds]
SCORE: 85/100 ✓
[Copy] → [Paste to chat] → [Send]
Time: 1.5 minutes
```

### 9:25 AM - Customer 4

```
Customer message (Facebook):
"What's the difference between you and [competitor]?"

/crmrespond
[Paste message]
[15 seconds]
SCORE: 65/100 ✗ (missing competitive differentiator)
[Rerun]
[15 seconds]
SCORE: 88/100 ✓
[Copy] → [Paste to Facebook] → [Send]
Time: 2 minutes
```

### 10:00 AM - Stats

```
Messages handled: 4
Time spent: 7.5 minutes
Average per message: 1.9 minutes
Validation score average: 87/100
First-pass success: 75% (3 of 4 passed first try)
```

By lunch, you'll have handled 12-15 customers. By end of shift (8 hours), 20-25 messages.

---

## Advanced: Understanding Your Skills Library

Once you're comfortable with the basic workflow, you can get faster by understanding which skill applies to which situation.

Your brand has 14 skills. The system automatically picks the best one, but it helps to know them:

### For Aesthetics (CRM-AES):

1. **consult-and-pitch.md** — First-time inquiry, "Tell me more"
2. **first-time-converter.md** — Ready to decide, needs final reassurance
3. **objection-buster.md** — "But what about..." concerns
4. **close-the-booking.md** — Customer ready to book, warm close
5. **competitor-defense.md** — "Why you instead of [competitor]?"
6. **complaint-handler.md** — Something went wrong, trust recovery
7. **upsell-booking.md** — Upgrade existing booking
8. **re-engagement.md** — Old customer, been 6+ months
9. **testimonial-request.md** — Ask happy customer for review
10. **referral-incentive.md** — Refer friend, get discount
11. **bundle-builder.md** — Suggest package deals
12. **close-detector.md** — Customer showing "ready to buy" signals
13. **pricing-breakdown.md** — Explain investment clearly
14. **scheduling-facilitation.md** — Help pick date/time

### For Spa (CRM-SPA):

Similar 14 skills, tuned for wellness/relaxation focus instead of medical aesthetics.

### For Slimming (CRM-SLIM):

Similar 14 skills, tuned for weight loss journey and nutrition focus.

**How to use this:**

When you see a customer message coming in, you can guess which skill will be used:

```
Customer: "I want to book a massage for my mom as a gift"
→ Likely skill: close-the-booking.md or referral-incentive.md

Customer: "Your facial made my skin worse"
→ Likely skill: complaint-handler.md

Customer: "Is Botox worth the money?"
→ Likely skill: pricing-breakdown.md or objection-buster.md
```

When `/crmrespond` runs, it picks the best one automatically. But knowing them helps you understand why certain response style was chosen.

---

## Performance Tracking

Keep track of these metrics to watch your progress:

### Daily Metrics

| Metric | What to Track |
|--------|---------------|
| Messages handled | How many customer messages per day |
| Avg validation score | Sum all scores ÷ number of messages |
| First-pass pass rate | % of messages passing validation on first try |
| Rerun rate | How many needed a second `/crmrespond` |
| Time per message | (Total time ÷ messages handled) |

### Weekly Goals

| Week | Target | Reality |
|------|--------|---------|
| **Week 1** | 8-10 messages/day, 75+ avg score | |
| **Week 2** | 12-15 messages/day, 82+ avg score | |
| **Week 3** | 15-20 messages/day, 87+ avg score | |
| **Week 4** | 20-25 messages/day, 90+ avg score | |

### Example Tracking Log

```
DATE: 2026-02-24

Messages: 12
Scores: 96, 78→89, 88, 72→85, 91, 85, 79→87, 92, 84, 88, 91, 86
Average score: 87.1/100
First-pass passes: 9 of 12 (75%)
Total time: 19 minutes
Per message: 1.6 minutes

NOTES:
- Complaint handler skill was tricky (score 72, needed rerun)
- Otherwise pretty smooth
- Getting faster as familiar with skills
```

---

## When to Ask for Help

Contact your team lead if:

- [ ] Validation keeps failing (< 70) after 3+ reruns
- [ ] Claude Code crashes or won't open
- [ ] Brand rules seem contradictory or confusing
- [ ] Customer situation doesn't fit any of 14 skills
- [ ] You're unsure if response is safe to send (score borderline)
- [ ] You have feedback on skill accuracy

**Your team lead's role:**
- Help troubleshoot technical issues
- Clarify brand rules if confusing
- Review unusual customer situations
- Validate your judgment on edge cases
- Help improve your efficiency

**What to provide when asking for help:**
1. The exact customer message
2. The response generated
3. The validation score
4. What you think the issue is

---

## Keyboard Shortcut Cheat Sheet

Print this and keep at your desk:

```
╔═══════════════════════════════════════╗
║   CARISMA CRM QUICK SHORTCUTS         ║
╚═══════════════════════════════════════╝

START SHIFT:
  cd CRM/CRM-AES (or SPA or SLIM)
  claude

GENERATE RESPONSE:
  /crmrespond
  [Paste customer message]

COPY & PASTE:
  Cmd+C (Mac) or Ctrl+C (Windows) = Copy
  Cmd+V (Mac) or Ctrl+V (Windows) = Paste

SWITCH WINDOWS:
  Cmd+Tab (Mac) or Alt+Tab (Windows)

SIGNATURES:
  Aesthetics: Beautifully yours, Sarah
  Spa: Peacefully, Sarah
  Slimming: With you every step, Katya

VALIDATION SCORE GUIDE:
  ✓ ≥85 = SEND IT
  ~ 70-84 = OK OR REVISE
  ✗ <70 = MUST REVISE

STILL HERE? RERUN /crmrespond
```

---

## First Week Checklist

Print this and check off as you complete:

```
WEEK 1 ONBOARDING - Carisma CRM Agent

Setup (Do Once):
  [ ] Claude Code installed and working
  [ ] Repository cloned to computer
  [ ] Correct brand folder identified (AES/SPA/SLIM)
  [ ] CLAUDE.md loads when opening in folder
  [ ] Team lead confirmed you can see it loading

First Day (30 minutes):
  [ ] Run 5 practice /crmrespond commands
  [ ] Get validation scores for all 5
  [ ] Understand what score ≥85 means
  [ ] Know your brand signature by heart
  [ ] Arrange windows side-by-side

First Week (Throughout):
  [ ] Handle 8+ customer messages
  [ ] Get 75%+ first-pass validation success
  [ ] Hit average score of 80+
  [ ] Finish each response in under 3 minutes
  [ ] Copy-paste workflow feels natural
  [ ] Windows shortcuts feel automatic

Ask Team Lead If:
  [ ] Claude Code won't open after setup
  [ ] Brand not detected (showing "Unknown")
  [ ] /crmrespond command not recognized
  [ ] Validation score confuses you
  [ ] Unsure which customer message needs help

By End of Week 1:
  [ ] Comfortable with basic workflow
  [ ] Know your 14 skills by category
  [ ] Understand validation score meanings
  [ ] Handling 10-15 messages per day
  [ ] Asking team lead for clarification (not feeling lost)

Ready to move forward when:
  [ ] All checkboxes above are checked
  [ ] Team lead says "looks good"
  [ ] You feel confident handling messages independently
```

---

## Common Questions & Answers

**Q: Do I have to send the response exactly as generated?**

A: No. If validation passes (score ≥85), the response is brand-safe. You can make small edits for grammar or flow, but don't change the core message that makes it brand-safe.

---

**Q: What if a customer asks something the skills don't cover?**

A: The system will pick the closest matching skill and adapt it. If validation keeps failing after 2-3 tries, contact your team lead. Some situations need human judgment.

---

**Q: Can I send a response with score 80?**

A: Technically yes, but not recommended. Scores below 85 mean brand rules were slightly compromised. Rerun or revise to get it to 85+. It usually takes just one rerun.

---

**Q: How long should I wait before sending?**

A: No rule, but most agents wait 1-2 minutes. That's enough time for /crmrespond to generate, validate, and copy the response. Faster is better if the quality is there.

---

**Q: What if I accidentally send a response with violations?**

A: That's rare because you validate before sending. If it happens, follow up immediately with a clarification message. Then report it to your team lead so they can help you understand what went wrong.

---

**Q: Can I use Claude Code for other tasks?**

A: Yes. Your CLAUDE.md instructions are just for /crmrespond. You can use Claude Code for other work too. But for customer responses, always use /crmrespond to ensure brand consistency.

---

**Q: Do I need to read all the skill files?**

A: No. The system reads them automatically and picks the best one. You only need to read them if you're curious about how a response was structured.

---

**Q: What if my brand folder is different?**

A: Ask your team lead. You should have CRM-AES, CRM-SPA, or CRM-SLIM. If different structure, they'll guide you to the right folder.

---

## Resources

**Need to look something up?**

In your brand folder:

- **Brand voice rules:** `knowledge/brand-voice.md` — DO's and DON'Ts
- **Validation rules:** `hooks/brand-voice-validation-rules.json` — Exact forbidden phrases
- **Skills library:** `skills/` folder → Each skill is a `.md` file
- **Agent instructions:** `CLAUDE.md` — Complete instructions

**Need technical help?**

Contact your team lead with:
1. The exact error message
2. What you were doing when it happened
3. Screenshot if possible

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-22 | Initial comprehensive guide |

**Questions or feedback?** Contact your team lead.

---

**You're ready. Start with a customer message. Trust the validation score. Hit send. You've got this.**
