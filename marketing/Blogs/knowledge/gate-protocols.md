# Gate Protocols — Blog Production Pipeline

Three human approval gates exist in the pipeline. No gate may be bypassed.

---

## GATE 1 — Topic Approval

**When:** After Step 1 (Research) — before writing begins
**Who approves:** Human (Mert or CMO)
**Automated:** No

### What to Present to the Human

1. **Ranked topic list** (up to 8 topics) with:
   - Primary keyword for each topic
   - Why each was selected (search intent, Malta relevance, content gap filled)
   - Recommended brand assignment (Spa / Aesthetics / Slimming)
   - Recommended word count
   - Proposed publication schedule (week by week)

2. **Prioritisation rationale** — top 3 topics with brief explanation

3. **Offer alignment** — which topics support currently active offers from `config/offers.json`

### What You Need Before Proceeding

- Explicit human approval of each topic
- "Yes to all", "Yes to topics 1, 2, 4", or specific feedback incorporated
- If a topic is rejected: remove it from the queue before briefing writers

### Hard Rule

**Do NOT brief any writer until Gate 1 approval is received.** Writers with unapproved briefs waste pipeline time.

---

## GATE 2 — SEO QC Pass

**When:** After Step 3 (SEO QC) — before humanization
**Who approves:** `seo-blog-qc-expert` (automated gate — no human required)
**Automated:** Yes

### Pass Conditions

All 10 SEO dimensions must score PASS or CONDITIONAL PASS.

A CONDITIONAL PASS means:
- Minor improvement recommended but not blocking
- The post can proceed with a note for the humanizer to address

### Fail Handling

If ANY dimension fails:
1. `seo-blog-qc-expert` returns the draft to the brand writer with the audit report
2. Writer revises based on the specific FAIL dimensions listed
3. Draft is re-submitted to `seo-blog-qc-expert` for re-review
4. Cycle repeats until all dimensions pass

### Revision Cycle Tracking

Track cycles per post. Escalate at Cycle 3+:

```
Post: [title]
Cycle 1: [date] — FAIL — Dimensions: 5, 9 — Returned to writer
Cycle 2: [date] — FAIL — Dimension 5 — Returned to writer
Cycle 3: [date] — ESCALATE TO HUMAN — Same dimension failing. Brief may be flawed.
```

**Cycle 3+ escalation protocol:**
- Do not continue cycling without human input
- Present the brief, the draft, and all QC reports to the human
- Ask: "Should the brief be revised? Is the keyword target achievable?"

---

## GATE 3 — Final Human Review

**When:** After Step 7 (Google Doc creation) — before CMS publish
**Who approves:** Human (Mert or CMO)
**Automated:** No

### What to Present to the Human

Gate 3 package for each post:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GATE 3 PACKAGE — READY FOR HUMAN REVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Post 1: [Meta Title]
  Brand:      [Brand]
  Keyword:    [Primary keyword]
  Words:      [word count]
  Google Doc: [URL]
  Slug:       /blog/[slug]
  QC cycles:  [n]
  Status:     Awaiting Gate 3 approval
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

For a batch of multiple posts, list all posts in one Gate 3 package.

### What Happens at Gate 3

1. Human opens each Google Doc
2. Human reads the full article
3. Human may:
   - **Approve** → proceed to CMS upload (Publication Checklist)
   - **Request minor edits** → AI makes edits in the Google Doc directly
   - **Request full revision** → rare; returns to pipeline at appropriate step

### What Triggers Gate 3 Rejection

- Brand voice is off (detected after humanization)
- Factual error found (incorrect claim, wrong statistic)
- SEO issue missed by automated QC
- Content not aligned with current campaign or offer
- Formatting issue in the Google Doc itself

### Hard Rule

**No post goes live without explicit Gate 3 approval.** Even if all automated gates pass. Even if the post is perfect. The human reads every article before it publishes.

If a post publishes without Gate 3 sign-off, log this as a critical process failure in `miscellaneous/learnings/LEARNINGS.md`.

---

## Gate Summary Table

| Gate | Trigger | Who Approves | Hard Rule |
|---|---|---|---|
| Gate 1 | After Research | Human | No writing without approval |
| Gate 2 | After SEO QC | Automated (QC expert) | No humanization until all 10 pass |
| Gate 3 | After Google Doc | Human | No publishing without approval |
