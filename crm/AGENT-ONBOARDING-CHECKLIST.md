# Carisma CRM Agent Onboarding Checklist

**For:** New support agents joining Carisma CRM
**Duration:** 3-5 days (with daily practice)
**Last Updated:** February 22, 2026

---

## Day 1: Setup & Understanding (2-3 hours)

### Morning: Technical Setup

- [ ] **Introduction to Claude Code**
  - What: AI-powered assistant in terminal
  - Why: Generates brand-perfect responses automatically
  - Where: Downloaded from https://claude.com/claude-code

- [ ] **Installation**
  ```bash
  brew install anthropic/tap/claude  # Mac
  # or Windows: Follow installation guide
  ```
  - [ ] Installation successful (test with `claude --version`)

- [ ] **Repository Access**
  - [ ] GitHub access confirmed
  - [ ] Repository URL obtained from team lead
  - [ ] Repository cloned locally
  ```bash
  git clone [URL]
  cd carisma-crm
  ```

- [ ] **Brand Folder Assignment**
  - [ ] You've been assigned to ONE brand:
    - [ ] CRM-AES (Aesthetics)
    - [ ] CRM-SPA (Spa)
    - [ ] CRM-SLIM (Slimming)
  - [ ] Navigated to your brand folder
  ```bash
  cd CRM/CRM-[YOUR-BRAND]
  pwd  # Verify you're in right place
  ```

- [ ] **First Claude Code Open**
  ```bash
  claude
  ```
  - [ ] Claude Code opens without errors
  - [ ] CLAUDE.md appears in editor
  - [ ] You see your brand name in the interface

### Afternoon: Documentation Review

Read these documents in order (1 hour total):

1. [ ] **Read:** `QUICK-START-GUIDE.md` (5 minutes)
   - What it covers: 1-page reference for daily workflow
   - Action: Get familiar with the basic steps

2. [ ] **Read:** `AGENT-WORKFLOW-SETUP.md` (30 minutes)
   - What it covers: Complete step-by-step setup guide
   - Sections to focus on:
     - [ ] Phase 2: Open Claude Code
     - [ ] Phase 4: Generate Response
     - [ ] Phase 5: Review Validation Score
     - [ ] Phase 6: Send Response

3. [ ] **Read:** Your brand's `CLAUDE.md` (15 minutes)
   - Located: `CRM/CRM-[YOUR-BRAND]/CLAUDE.md`
   - What to understand:
     - [ ] Your brand's identity
     - [ ] Your persona name
     - [ ] Your signature
     - [ ] Non-negotiable rules
     - [ ] Response patterns

4. [ ] **Scan:** `knowledge/brand-voice.md` (10 minutes)
   - Located: `CRM/CRM-[YOUR-BRAND]/knowledge/brand-voice.md`
   - What to understand: DO's and DON'Ts for your brand

### End of Day 1

- [ ] Team lead reviews setup
- [ ] You can open Claude Code without help
- [ ] You understand the 4-step workflow (copy → generate → validate → send)
- [ ] You know your brand signature by heart

**Day 1 Success Criteria:** ✓ Comfortable with setup, understand the basic process

---

## Day 2: First Practice Responses (2-3 hours)

### Morning: 5 Practice Runs

With team lead present:

**Practice 1: Standard First-Time Inquiry**
```
Customer: "Hi! I'm interested in learning more about Botox"
/crmrespond → [Paste] → [Review score] → [Discuss]
```
- [ ] Ran `/crmrespond` without error
- [ ] Understood validation score displayed
- [ ] Could identify what made response brand-safe
- [ ] Score was ≥85

**Practice 2: Objection/Concern**
```
Customer: "I'm worried about looking fake..."
/crmrespond → [Paste] → [Review score] → [Discuss]
```
- [ ] Response addressed the concern directly
- [ ] Understood why this skill was chosen
- [ ] Score was ≥85

**Practice 3: Pricing Question**
```
Customer: "How much does this cost?"
/crmrespond → [Paste] → [Review score] → [Discuss]
```
- [ ] Response positioned pricing as investment
- [ ] No discount language
- [ ] Score was ≥85

**Practice 4: Competitor Question**
```
Customer: "What's different about you vs [competitor]?"
/crmrespond → [Paste] → [Review score] → [Discuss]
```
- [ ] Response differentiated without negativity
- [ ] Stayed focused on your brand's values
- [ ] Score was ≥85

**Practice 5: Low Score Scenario**
```
Customer: "Can you make me look younger?"
/crmrespond → [Paste] → [Score <85] → Discuss what violated → Rerun
```
- [ ] Understood why score was low
- [ ] Reran and got improvement
- [ ] Got to ≥85 on second run
- [ ] Understood the violation (forbidden phrase, missing element, etc.)

### Afternoon: Independent Practice (with safety net)

5 more practice runs, you lead, team lead reviews each one:

- [ ] **Practice 6:** Copy customer message → Run workflow → Show team lead
  - [ ] Score ≥85? Yes
  - [ ] Signature correct? Yes
  - [ ] Answers customer's question? Yes

- [ ] **Practice 7:** Copy customer message → Run workflow → Show team lead
  - [ ] Score ≥85? Yes
  - [ ] Tone matches customer? Yes
  - [ ] No forbidden phrases? Yes

- [ ] **Practice 8:** Copy customer message → Run workflow → Show team lead
  - [ ] All checks passed? Yes

- [ ] **Practice 9:** Copy customer message → Run workflow → Show team lead
  - [ ] All checks passed? Yes

- [ ] **Practice 10:** Copy customer message → Run workflow → Show team lead
  - [ ] All checks passed? Yes

### End of Day 2

- [ ] You've run /crmrespond 10 times
- [ ] Average validation score: 80+
- [ ] You understand what violations mean
- [ ] Team lead says "you're ready"

**Day 2 Success Criteria:** ✓ Can independently run workflow, understand validation

---

## Day 3: Real Customer Messages (with supervision)

### Morning: Live Responses (with team lead watching)

With team lead sitting beside you or reviewing messages:

- [ ] **Customer 1:** Real message from actual customer
  - [ ] Copy → Generate → Validate → Send
  - [ ] Time: ~2 minutes
  - [ ] Score: 85+
  - [ ] Team lead approved: ✓

- [ ] **Customer 2:** Real customer message
  - [ ] Copy → Generate → Validate → Send
  - [ ] Time: ~2 minutes
  - [ ] Score: 85+
  - [ ] Team lead approved: ✓

- [ ] **Customer 3:** Real customer message
  - [ ] Time: <2 minutes (getting faster)
  - [ ] Score: 85+
  - [ ] Team lead approved: ✓

- [ ] **Customer 4:** Real customer message
  - [ ] If score <85, rerun to get improvement
  - [ ] Don't send anything below 85
  - [ ] Team lead approved: ✓

- [ ] **Customer 5:** Real customer message
  - [ ] Demonstration of full workflow
  - [ ] Score: 85+
  - [ ] Team lead approved: ✓

### Afternoon: Semi-Independent (team lead checks every response)

5-10 more real customers, you generate, team lead reviews before sending:

- [ ] **Customers 6-10:** Messages generated and validated
  - [ ] Each one reviewed by team lead before sending
  - [ ] Average score: 86+
  - [ ] All sent with approval

### Metrics Check

- [ ] Total responses handled: 10-15
- [ ] Average validation score: 85+
- [ ] First-pass success (≥85 first try): 70%+
- [ ] Average time per response: 1.5-2 minutes

### End of Day 3

- [ ] You've handled 10-15 real customer messages
- [ ] Most passed validation on first try
- [ ] You're getting faster
- [ ] Team lead confidence: High

**Day 3 Success Criteria:** ✓ Handling real customers with oversight

---

## Day 4: Independent Work (with spot checks)

### Morning: Handle Messages Independently

You process messages on your own. Team lead spot-checks:

- [ ] **Customers 1-5:** Independent generation and sending
  - [ ] Team lead randomly reviews 2 of the 5
  - [ ] All passed validation before sending: ✓
  - [ ] Signatures correct: ✓
  - [ ] Customer questions addressed: ✓

### Afternoon: Build Speed

5-10 more messages with focus on efficiency:

- [ ] **Customers 6-12:** Track your time
  - [ ] Target: Get to 1-1.5 minutes per response
  - [ ] Actual average: _____ minutes
  - [ ] Quality maintained (all ≥85 validation): ✓

### Daily Stats

- [ ] Messages handled: 12-15
- [ ] Average score: 87+
- [ ] First-pass success: 80%+
- [ ] Average time: 1.5 minutes or less

### Autonomy Check

- [ ] You can open Claude Code without guidance: ✓
- [ ] You understand when to rerun vs. send: ✓
- [ ] You know which brand rules apply: ✓
- [ ] You can explain a validation score: ✓

### End of Day 4

- [ ] You're working independently
- [ ] Quality remains high (87+)
- [ ] Speed is improving
- [ ] Team lead checked 2-3 messages, all good

**Day 4 Success Criteria:** ✓ Independent operation, quality maintained

---

## Day 5: Full Autonomy (with check-ins)

### Morning: Full Shift

You work your first full 4-hour shift independently:

- [ ] **Hour 1:** First 4-5 messages
  - [ ] Feeling comfortable: ✓
  - [ ] All sent with ≥85 validation: ✓
  - [ ] Average time: _____ minutes

- [ ] **Hour 2:** Next 4-5 messages
  - [ ] Getting into rhythm: ✓
  - [ ] Maintaining quality: ✓
  - [ ] Average time: _____ minutes

- [ ] **Hour 3:** Next 4-5 messages
  - [ ] Flow feels natural: ✓
  - [ ] Windows arrangement working: ✓
  - [ ] Average time: _____ minutes

- [ ] **Hour 4:** Next 4-5 messages
  - [ ] Tired but maintaining quality: ✓
  - [ ] Average time: _____ minutes

### Afternoon: Full Shift

4-hour shift with minimal oversight:

- [ ] **Total messages handled:** 15-20
- [ ] **Average validation score:** 88+
- [ ] **First-pass success:** 85%+
- [ ] **Average time per message:** 1.2 minutes or less

### End-of-Week Metrics

- [ ] **Total messages this week:** 30-40
- [ ] **Average validation score:** 87+
- [ ] **First-pass success rate:** 80%+
- [ ] **Average time per message:** 1-1.5 minutes
- [ ] **Zero violations sent:** ✓
- [ ] **Team lead feedback:** Positive ✓

### End of Day 5

- [ ] You've completed a full week of training
- [ ] You're ready for independent operation
- [ ] You understand the system deeply
- [ ] Quality is consistently high

**Day 5 Success Criteria:** ✓ Full independent operation, metrics on track

---

## Week 2-4: Continuous Improvement

### Weekly Check-ins (Ongoing)

Each week, review these metrics with team lead:

| Metric | Week 1 | Week 2 | Week 3 | Week 4 |
|--------|--------|--------|--------|--------|
| Messages/day | 8-10 | 12-15 | 15-20 | 20-25 |
| Avg score | 85+ | 86+ | 88+ | 90+ |
| First-pass % | 70%+ | 75%+ | 85%+ | 90%+ |
| Time/message | 2 min | 1.5 min | 1 min | 45 sec |

### Monthly Goals

- [ ] **End of Month 1:**
  - 20-25 messages per day
  - 90+ average validation score
  - 90%+ first-pass success
  - 45-60 seconds per message
  - Zero brand violations

- [ ] **End of Month 2:**
  - 25-30 messages per day
  - 92+ average validation score
  - 95%+ first-pass success
  - 30-45 seconds per message
  - Zero brand violations

- [ ] **End of Month 3:**
  - Expert-level operation
  - Can handle complex edge cases
  - Can help train new agents
  - Can provide feedback on skill accuracy

---

## Post-Training Support

### Resources Available

- [ ] **Quick reference:** `QUICK-START-GUIDE.md` (keep at desk)
- [ ] **Full guide:** `AGENT-WORKFLOW-SETUP.md` (for deep dives)
- [ ] **Brand voice:** `knowledge/brand-voice.md` (DO's and DON'Ts)
- [ ] **Skills library:** `skills/` folder (14 skill files)
- [ ] **Validation rules:** `hooks/brand-voice-validation-rules.json` (exact rules)

### When to Ask for Help

You should reach out to team lead if:
- [ ] Claude Code crashes repeatedly
- [ ] Brand detection keeps failing
- [ ] Validation score stuck below 70 after 3 reruns
- [ ] Unsure if response is safe (score 80-84 borderline)
- [ ] Customer situation doesn't fit any skill
- [ ] Feedback on skill accuracy (spot errors)

### Escalation Process

1. **Try yourself first** → Rerun /crmrespond, check brand rules
2. **Check documentation** → Review `CLAUDE.md` and brand-voice.md
3. **Ask team lead** → With specific context (customer message, response, score)
4. **Document learning** → If team lead provides new insight, note it

---

## Knowledge Assessment (Optional, for validation)

After training, confirm you understand:

### Brand & Voice

- [ ] You know your brand's 3-5 key personality traits
- [ ] You can list 2-3 DO's and DON'Ts for your brand
- [ ] You know your brand signature by heart
- [ ] You understand your brand's unique positioning

### Process & Workflow

- [ ] You can explain the 4-step workflow (copy → generate → validate → send)
- [ ] You know what validation score means
- [ ] You understand when to rerun vs. send
- [ ] You can identify violations before team lead points them out

### Speed & Efficiency

- [ ] You're getting 20+ messages/day by week 2
- [ ] Your first-pass success is 80%+
- [ ] You're under 1.5 minutes per message
- [ ] You can copy/paste/send workflow without thinking

### Troubleshooting

- [ ] You know what to do if Claude Code won't open
- [ ] You know what to do if brand isn't detected
- [ ] You know what to do if score is under 70
- [ ] You know when to ask for help

---

## Graduation Criteria

You're ready to work independently when:

- [ ] ✓ Completed all 5 days of training
- [ ] ✓ Handling 15-20 messages per day
- [ ] ✓ Average validation score is 87+
- [ ] ✓ First-pass success is 80%+
- [ ] ✓ Average time is 1.5 minutes or less
- [ ] ✓ Team lead feedback: Ready for independent operation
- [ ] ✓ Zero brand violations sent
- [ ] ✓ You feel confident handling messages independently

---

## Onboarding Sign-Off

When all criteria above are met:

**Agent Name:** ___________________________

**Brand Assigned:** ___________________________

**Onboarding Completed By:** ___________________________

**Team Lead Name:** ___________________________

**Team Lead Signature:** ___________________________

**Date:** ___________________________

**Next Review Date:** ___________________________

---

## First 30 Days Milestones

### Week 1
- [ ] Setup complete
- [ ] Running /crmrespond independently
- [ ] Handling 8-10 messages/day
- [ ] Understanding validation system

### Week 2
- [ ] Hitting 12-15 messages/day
- [ ] 80%+ first-pass success
- [ ] Average score 86+
- [ ] Speed 1.5 minutes per message

### Week 3
- [ ] 15-20 messages/day
- [ ] 85%+ first-pass success
- [ ] Average score 88+
- [ ] Speed 1 minute per message

### Week 4
- [ ] 20-25 messages/day
- [ ] 90%+ first-pass success
- [ ] Average score 90+
- [ ] Speed 45 seconds per message
- [ ] Ready to mentor others

---

## Quick Troubleshooting During Training

| Issue | Solution |
|-------|----------|
| "I keep getting score <70" | Normal in training. Team lead will help identify pattern. Rerun 2-3 times. |
| "I'm slower than other agents" | That's okay. Speed comes with practice (week 2-3). Focus on quality. |
| "My signature keeps being wrong" | Print the signature card. Keep at desk. Check before every send first 3 days. |
| "I don't understand validation" | Ask team lead to review one response with you. Then you'll get it. |
| "Claude Code keeps crashing" | Close and reopen. If continues, reinstall or ask team lead. |

---

## Feedback Loop

### Daily (First 3 Days)

Team lead provides immediate feedback:
- "Great work on that response"
- "This violated [rule]. Here's why."
- "Try rerunning that instead of editing"

### Weekly (Weeks 2-4)

Review metrics:
- "You're at X messages/day, goal is Y"
- "Your score improved from 85 to 88"
- "First-pass success is at Z%, keep it up"

### Monthly (Month 2+)

Performance review:
- Metrics review
- Quality spot-check
- Training needs assessment

---

## Print & Post

This checklist should be:
- [ ] Printed for new agent
- [ ] Posted in onboarding area
- [ ] Referenced daily during training
- [ ] Filed in agent personnel file
- [ ] Used for performance tracking

---

**Version:** 1.0 Production
**Last Updated:** February 22, 2026
**Questions?** Contact your team lead

**Remember:** By day 5, you should feel comfortable. By week 2, you should feel fast. By month 1, you should feel expert. We'll be here to support you the whole way.
