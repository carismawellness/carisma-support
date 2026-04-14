# Workflow: Score Conversation

## Purpose

Orchestrate 6 sub-agents to produce a complete, QC-approved scorecard for a single normalized conversation. This is the core scoring pipeline.

---

## Prerequisites

Before starting this workflow:
- The conversation has been ingested and normalized per `workflows/ingest-conversation.md`.
- Brand, channel, and scenario type have been detected and confirmed.
- The normalized conversation object is available with all required fields.
- Brand is NOT `unknown`. If it is, stop and resolve per the ingest workflow.

---

## Step 1: Load Knowledge

Based on the detected brand, read all required knowledge files into context before dispatching agents. Each agent needs specific files -- load the full set so you can pass the right subset to each agent.

### Files to Load

**Always load (all brands):**
- `rubric/scoring-rubric.md`
- `rubric/brand-criteria.md`
- `rubric/benchmarks.md`
- `knowledge/sales-excellence/methodology.md`
- `knowledge/hospitality-program/reception.md`
- `knowledge/hospitality-program/consultation.md`
- `knowledge/hospitality-program/retention.md`
- `knowledge/hospitality-program/general.md`
- `knowledge/domain/pricing-reference.md`

**Brand-specific (load the matching set):**

| Brand | Brand Intelligence | Scripts | Domain |
|-------|--------------------|---------|--------|
| `spa` | `knowledge/brand-intelligence/spa.md` | `knowledge/scripts/spa-scripts.md` | `knowledge/domain/spa-operations.md` |
| `aesthetics` | `knowledge/brand-intelligence/aesthetics.md` | `knowledge/scripts/aesthetics-scripts.md` | `knowledge/domain/aesthetics-protocols.md` |
| `slimming` | `knowledge/brand-intelligence/slimming.md` | `knowledge/scripts/slimming-scripts.md` | `knowledge/domain/slimming-sops.md` |

**For Agent 1 (Brand Intelligence) only:** Also load the other two brand intelligence files for cross-brand awareness.

---

## Step 2: Dispatch Scoring Agents (Parallel)

Dispatch all 4 scoring agents simultaneously. They are independent and do not depend on each other's output.

### Agent 1: Brand Intelligence

**Invoke:** Read and execute `skills/brand-intelligence.md`

**Provide:**
- Full normalized transcript
- Brand identifier
- Channel identifier
- The brand's own brand intelligence file (primary)
- The other two brand intelligence files (for cross-brand bleed detection)

**Expected output structure:**
- Brand Voice Score (1-10)
- Overall Compliance (PASS/FAIL)
- On-Brand Moments (with quotes and message numbers)
- Off-Brand Moments (with quotes, issues, and rewrites)
- Tone Consistency assessment
- Persona Fidelity assessment
- Sign-Off Check (expected, found, verdict)
- Forbidden Phrase Check

### Agent 2: Script Compliance

**Invoke:** Read and execute `skills/script-compliance.md`

**Provide:**
- Full normalized transcript
- Brand identifier
- Scenario type
- The brand's script file

**Expected output structure:**
- Script Compliance Score (1-10)
- Scenario Detected
- Script Selection Check (expected vs actual)
- Element Checklist (each element: HIT/MISSED with notes)
- Hit Rate (X/Y, Z%)
- Ordering Assessment
- Delivery Quality (Robotic/Stilted/Natural/Masterful)
- Key Missed Elements with coaching

### Agent 3: Sales Excellence

**Invoke:** Read and execute `skills/sales-excellence.md`

**Provide:**
- Full normalized transcript
- Brand identifier
- Conversation outcome (booked/no-show/lost/pending/unknown)
- Sales excellence methodology file
- All four hospitality program files (reception, consultation, retention, general)

**Expected output structure:**
- Discovery Quality Score (1-10)
- Objection Handling Score (1-10 or N/A)
- Close Execution Score (1-10)
- Follow-Up Appropriateness Score (1-10 or N/A)
- Strongest Moment (with quote and analysis)
- Weakest Moment (with quote and analysis)
- Coaching for Weakest Area (with suggested script)

### Agent 4: Domain Knowledge

**Invoke:** Read and execute `skills/domain-knowledge.md`

**Provide:**
- Full normalized transcript
- Brand identifier
- The brand's domain file (spa-operations / aesthetics-protocols / slimming-sops)
- Pricing reference file

**Expected output structure:**
- Factual Accuracy (PASS/FAIL)
- Total Claims Checked, Accurate, Inaccurate, Misleading, Unverifiable counts
- Claims Audit tables (accurate, inaccurate, misleading, unverifiable)
- Missed Upsell Opportunities
- Priority Corrections (if FAIL)

---

## Step 3: Collect Results

Wait for all 4 agents to complete. If any agent fails:
- Log the error with the agent name and error details.
- Continue with the outputs from the remaining agents.
- Note which agent failed -- this information passes to Agent 5.

### Validation Checks

Before passing to Agent 5, verify each output:
1. **Agent 1:** Has a Brand Voice score (number 1-10) and a compliance verdict (PASS/FAIL).
2. **Agent 2:** Has a Script Compliance score (number 1-10) and a hit rate.
3. **Agent 3:** Has at least Discovery and Close scores (numbers 1-10). Objection Handling and Follow-Up may be N/A.
4. **Agent 4:** Has a Factual Accuracy verdict (PASS/FAIL).

If an output is present but missing its score, flag it and ask the agent to re-evaluate that specific section only.

---

## Step 4: Scoring & Feedback (Agent 5)

**Invoke:** Read and execute `skills/scoring-feedback.md`

**Provide:**
- All 4 agent outputs (or however many succeeded)
- Brand identifier
- SDR name (from normalized conversation)
- Conversation date
- Channel
- Scenario type
- Conversation outcome
- The rubric files: `rubric/scoring-rubric.md`, `rubric/brand-criteria.md`, `rubric/benchmarks.md`
- The brand's script file (for coaching script suggestions)

**Expected output:** Complete scorecard per the format defined in `skills/scoring-feedback.md`, including:
- Composite score (out of 100, rounded to 1 decimal)
- Grade label (Elite/Strong/Developing/Needs Improvement/Critical)
- All dimension scores with weights and weighted values
- Brand-specific adjustments applied
- Factual accuracy flag
- Top strength with specific example
- 2 improvement areas with: what happened (quote), why it matters, coaching, suggested script
- Summary

### Weight Calculation Verification

Before passing to QC, verify the composite score arithmetic yourself:
1. Read the dimension weights from `rubric/brand-criteria.md` for this brand (adjusted weights if applicable).
2. If any dimension is N/A, redistribute its weight proportionally per the formula in `rubric/scoring-rubric.md`.
3. Multiply each score by its weight, sum, and multiply by 10.
4. Confirm the result matches Agent 5's stated composite score (within 0.1 tolerance).
5. If it does not match, send Agent 5 the correct calculation and ask for revision before proceeding to QC.

---

## Step 5: QC Review (Agent 6)

**Invoke:** Read and execute `skills/qc-reviewer.md`

**Provide:**
- The complete scorecard from Agent 5
- All original outputs from Agents 1-4
- `rubric/benchmarks.md`

**Expected output:** QC verdict with detailed checks:
- Completeness (PASS/FAIL)
- Score-Evidence Alignment (PASS/FAIL)
- Feedback Specificity (PASS/FAIL)
- Fairness and Tone (PASS/FAIL)
- Consistency (PASS/FAIL)
- Arithmetic Verification (recalculated composite, matches yes/no)
- Verdict: APPROVED or REVISION NEEDED
- If REVISION NEEDED: specific changes required

---

## Step 6: Handle QC Result

### If APPROVED
- The scorecard is final. Proceed to `workflows/deliver-feedback.md`.

### If REVISION NEEDED (Attempt 1)
1. Pass the QC feedback (specific required changes) back to Agent 5.
2. Agent 5 revises the scorecard based on the QC instructions.
3. Re-run Agent 6 (QC) on the revised scorecard.
4. If now APPROVED: proceed to delivery.
5. If still REVISION NEEDED: go to Attempt 2.

### If REVISION NEEDED (Attempt 2)
1. Pass the second round of QC feedback back to Agent 5.
2. Agent 5 revises again.
3. Re-run Agent 6 one final time.
4. If APPROVED: proceed to delivery.
5. If still rejected: deliver the latest version with a warning note: "This scorecard required multiple QC revision cycles. Manual review is recommended."

### Maximum Revision Loops: 2
Never loop more than twice. After 2 failed QC rounds, deliver the best available version with a manual review flag.

---

## Step 7: Return Approved Scorecard

The final output of this workflow is:
1. The QC-approved (or manually-flagged) scorecard.
2. The conversation ID.
3. All metadata (brand, channel, scenario, rep name, date, outcome).

Pass this complete package to `workflows/deliver-feedback.md`.

---

## Timing Expectations

| Phase | Expected Duration |
|-------|-------------------|
| Knowledge loading | 5-10 seconds |
| Parallel agent dispatch (Agents 1-4) | 30-60 seconds |
| Scoring & Feedback (Agent 5) | 15-30 seconds |
| QC Review (Agent 6) | 10-20 seconds |
| Revision loop (if needed) | 30-60 seconds per loop |
| **Total (no revisions)** | **1-2 minutes** |
| **Total (with 1 revision)** | **2-3 minutes** |

---

## Error Recovery

| Error | Recovery |
|-------|----------|
| Agent times out | Retry once. If still fails, proceed without that agent's output. |
| Agent returns malformed output | Parse what is usable. Flag missing fields. |
| All agents fail | Do not produce a scorecard. Notify the user: "Scoring pipeline failed. [Error details]. Please try again." |
| Composite score calculation mismatch | Use the manually verified calculation. Note the discrepancy in the QC pass. |
| QC finds arithmetic error | Fix the arithmetic in revision. This is a hard failure that must be corrected. |
