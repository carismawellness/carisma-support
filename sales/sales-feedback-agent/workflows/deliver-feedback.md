# Workflow: Deliver Feedback

## Purpose

Send the QC-approved scorecard to the rep via WhatsApp, email the full report to the rep and their manager, log the scored conversation to Google Sheets, and handle any alert conditions.

---

## Prerequisites

- A QC-approved scorecard from `workflows/score-conversation.md`.
- Conversation metadata: conversation_id, brand, channel, scenario_type, rep_name, prospect_name, conversation_date, outcome.
- All dimension scores and composite score available.
- Template files: `templates/per-conversation-report.md`.

---

## Step 1: Format for WhatsApp

Use the WhatsApp Version template from `templates/per-conversation-report.md`.

### Formatting Rules
1. Fill all template variables from the scorecard data.
2. Apply the emoji mapping from the template (score tier emojis for overall and per-dimension).
3. Replace all `{variable}` placeholders with actual values.
4. Verify the total message length is **under 2000 characters**. If it exceeds 2000 characters:
   - First, shorten the improvement area coaching (trim "Try instead" quotes to 1 sentence each).
   - If still over, remove Improvement Area #2 entirely.
   - If still over, shorten the strength summary to 1 sentence.
   - Never remove: scores, domain accuracy status, brand compliance status.
5. All quotes must be exact excerpts from the conversation transcript. Never paraphrase or fabricate.

### Encouragement Line
Select the `{encouragement_line}` based on the score tier:
- Elite (90-100): "setting the standard for the team"
- Strong (70-89): "building great habits"
- Developing (50-69): "improving every conversation"
- Needs Improvement (40-49): "on the right track -- keep practicing"
- Critical (below 40): "working through a tough stretch -- your next conversation is a fresh start"

---

## Step 2: Send to Rep via WhatsApp

**MCP tool:** `send_message`

**Recipient:** The SDR's WhatsApp phone number.

**Message:** The formatted WhatsApp version from Step 1.

### How to Get the Rep's Number
1. If the conversation was pulled from WhatsApp, use the chat context to identify the SDR.
2. If the rep's number is known from prior conversations or configuration, use it directly.
3. If the number is not available, skip WhatsApp delivery and send via email only. Note: "WhatsApp delivery skipped -- rep phone number not available."

### Send Confirmation
After sending, verify the message was delivered (no error returned from MCP). If the send fails:
- Log the error.
- Fall back to email delivery (include the compact WhatsApp-format content in the email body as well).

---

## Step 3: Send Full Report to Rep + Manager via Email

**MCP tool:** `gmail_send_email`

### Email Construction

**To:** Rep's email address
**CC:** Rep's manager email address
**Subject:** `Sales Review -- {rep_name} -- {brand} {channel} -- {date} ({overall_score}/100 {score_label})`

**Body:** The Email Version template from `templates/per-conversation-report.md`, fully populated.

### Conditional Manager Notification Rules

| Condition | Manager CC | Separate Manager Alert |
|-----------|-----------|----------------------|
| Score 60-100 | Yes (on the standard email) | No |
| Score 40-59 (Needs Improvement) | Yes (on the standard email) | No, but flagged in weekly summary |
| Score below 40 (Critical) | Yes (on the standard email) | Yes -- separate WhatsApp alert to manager |
| Brand compliance FAIL | Yes (on the standard email) | Yes -- note in email subject: "[BRAND ALERT]" prefix |
| Domain accuracy FAIL | Yes (on the standard email) | Yes -- note in email subject: "[ACCURACY ALERT]" prefix |

### Subject Line Prefixes
Apply in this priority order (use only the highest-priority prefix):
1. `[CRITICAL]` -- composite score below 40
2. `[ACCURACY ALERT]` -- domain accuracy FAIL
3. `[BRAND ALERT]` -- brand compliance FAIL
4. No prefix -- all other cases

### Email Fallback
If Gmail MCP fails:
- Save the full report to a local file: `.tmp/feedback/{conversation_id}-report.md`
- Notify the user: "Email delivery failed for {conversation_id}. Report saved to .tmp/feedback/. Error: {error_details}."

---

## Step 4: Log to Google Sheet

**MCP tool:** `sheets_append_values`

**Target sheet:** The Sales Feedback tracking spreadsheet (sheet ID to be configured on first run).

### Row Data

Append one row with these columns in order:

| Column | Value |
|--------|-------|
| A: Date | `{conversation_date}` (YYYY-MM-DD format) |
| B: Rep | `{rep_name}` |
| C: Brand | `{brand}` |
| D: Channel | `{channel}` |
| E: Scenario | `{scenario_type}` |
| F: Composite Score | `{overall_score}` (number, out of 100) |
| G: Grade | `{score_label}` |
| H: Script Compliance | `{dim1_score}` (1-10) |
| I: Brand Voice | `{dim2_score}` (1-10) |
| J: Discovery | `{dim3_score}` (1-10) |
| K: Objection Handling | `{dim4_score}` (1-10 or "N/A") |
| L: Close | `{dim5_score}` (1-10) |
| M: Follow-Up | `{dim6_score}` (1-10 or "N/A") |
| N: Domain Accuracy | `{factual_accuracy}` ("PASS" or "FAIL") |
| O: Brand Compliance | `{brand_compliance}` ("PASS" or "FAIL") |
| P: Top Improvement Area | `{top_improvement_area}` (dimension name) |
| Q: Conversation ID | `{conversation_id}` |
| R: Outcome | `{outcome}` |
| S: QC Status | "APPROVED" or "APPROVED WITH WARNING" |
| T: Timestamp | ISO timestamp of when this row was logged |

### Sheet Fallback
If Sheets MCP fails:
- Save the row data to a local CSV: `.tmp/feedback/feedback-log.csv` (append mode).
- Notify the user: "Sheet logging failed for {conversation_id}. Data saved to local CSV. Error: {error_details}."
- On the next successful run, attempt to upload any pending CSV rows.

---

## Step 5: Handle Alerts

Check these conditions after all delivery steps complete. Alerts are additional notifications beyond the standard email CC.

### Critical Score Alert (Composite below 40)
- **Action:** Send an immediate WhatsApp message to the rep's manager.
- **MCP tool:** `send_message`
- **Message:**
  ```
  [CRITICAL] Sales Review Alert

  Rep: {rep_name}
  Brand: {brand}
  Date: {conversation_date}
  Score: {overall_score}/100 (Critical)

  Lowest dimension: {weakest_dimension} ({weakest_score}/10)
  
  Full report sent via email. Recommend scheduling a 1-on-1 coaching session.
  ```

### Needs Improvement Flag (Composite 40-59)
- **Action:** No immediate alert. Flag the conversation for inclusion in the weekly summary under "Reps Needing Attention."
- **How:** The Google Sheet log entry is sufficient. The weekly report generator will query scores below 60.

### Brand Compliance Failure
- **Action:** Regardless of composite score, ensure the email subject includes "[BRAND ALERT]" and the coaching feedback emphasizes the brand violation.
- **Additional:** If the same rep has 3+ brand compliance failures in a rolling 7-day window, send a separate manager WhatsApp alert:
  ```
  [BRAND PATTERN] {rep_name} has failed brand compliance in {count} conversations this week.
  
  Most common issue: {most_common_violation}
  
  Recommend reviewing brand voice guidelines with this rep.
  ```

### Domain Accuracy Failure
- **Action:** Ensure the email subject includes "[ACCURACY ALERT]" and the priority corrections from Agent 4 are prominently listed.
- **Additional:** Domain accuracy failures always warrant a check -- is the pricing reference up to date? If the SDR quoted a price not in the reference, flag for knowledge base review rather than penalizing the SDR.

### Elite Score Recognition (Composite 90+)
- **Action:** Add a congratulatory note to the WhatsApp and email feedback.
- **WhatsApp addition:** Append to the message: "This conversation is being flagged as a training example. Outstanding work."
- **Email addition:** Include in the summary section: "This conversation scored in the Elite range and has been flagged as a potential training example for the team."
- **Sheet:** Mark in an additional column or note for weekly summary inclusion under "Top Performers."

---

## Delivery Sequence

Execute these steps in this order:

1. **Format WhatsApp message** (Step 1)
2. **Send WhatsApp to rep** (Step 2) and **Send email to rep + manager** (Step 3) -- these can run in parallel
3. **Log to Google Sheet** (Step 4) -- can run in parallel with Step 2/3
4. **Handle alerts** (Step 5) -- runs after Steps 2-4 complete, because alert decisions may depend on delivery success

---

## Confirmation

After all delivery steps complete, output a summary:

```
Feedback delivered for {conversation_id}:
- WhatsApp: [Sent / Failed / Skipped]
- Email: [Sent / Failed]
- Sheet log: [Logged / Failed (saved to CSV)]
- Alerts: [None / Critical alert sent / Brand alert sent / Domain alert sent / Elite flagged]
- Composite score: {overall_score}/100 ({score_label})
```

---

## Edge Cases

- **Rep has no WhatsApp number and no email:** Save the report to `.tmp/feedback/{conversation_id}-report.md` and notify the user. Do not discard the scorecard.
- **Manager contact not configured:** Send email to rep only (no CC). Note: "Manager CC skipped -- manager email not configured."
- **Multiple conversations scored in batch:** Process each conversation through the full delivery pipeline independently. Do not batch WhatsApp messages -- each conversation gets its own message.
- **Duplicate conversation ID detected in sheet:** If the conversation_id already exists in the sheet, do not append a duplicate. Instead, update the existing row. Notify the user: "Conversation {conversation_id} was already logged. Row updated with latest scores."
