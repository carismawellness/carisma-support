# Skill: crm-aesthetics

**Type:** Rigid Skill — follow exactly, do not improvise steps  
**Invoke when:** User asks to manage Carisma Aesthetics leads, check pipeline health, create tasks, run reactivation, handle no-shows, mark deals lost, or query CRM data  
**MCP server:** `mcp__zoho-crm-aesthetics` (all CRM operations go through this server)  
**Script directory:** `CRM/scripts/`

---

## 1. Overview

The Carisma Aesthetics CRM is a task-driven pipeline in Zoho CRM. Every deal progresses through stages by completing tasks — a rep never manually drags a deal to a new stage. The Blueprint layer enforces stage transitions, required fields, and automated actions. The task layer tells reps what to do next and in what order.

**Pipeline stages (in order):**

```
New Leads → Contacted → Consultation Scheduled → Booking Confirmed
```

**Loss exits (deals can exit to these from specific stages):**

```
Consultation Lost   ← from New Leads, Contacted, No Show
Booking Lost        ← from Consultation Scheduled
No Show             ← from Consultation Scheduled (intermediate, not terminal)
```

**Core philosophy:** The pipeline is only as accurate as the tasks. Every deal should have exactly one open task at any time — the next action. When a rep completes a task and records an outcome, the next task is created automatically. The agent's job is to keep this system clean: no deal without a task, no duplicate tasks, no deals stuck in stale stages.

**Module naming in Zoho CRM API:**
- Deals module: `Deals`
- Tasks module: `Tasks`
- Stage field on Deals: `Stage`
- Follow-up counter: `Followup_Number` (integer)
- Last contact datetime: `Last_Contact_Attempt` (datetime)
- Callback requested flag: `Callback_Requested` (boolean)
- Callback scheduled for: `Callback_Date_Time` (datetime)
- Loss reason: `Reason_For_Loss__s` (picklist)

---

## 2. Available Scripts

| Script | Path | When to use |
|--------|------|-------------|
| `priority_task_manager.py` | `CRM/scripts/priority_task_manager.py` | Create the correct next task for a specific deal. Pass a single deal ID. Checks for existing open tasks before creating. |
| `reactivation_engine.py` | `CRM/scripts/reactivation_engine.py` | Scan all open deals inactive for 120+ days and create Reactivation tasks. Run with `--dry-run` first to preview. |

**Run scripts with:**
```bash
python CRM/scripts/priority_task_manager.py <deal_id>
python CRM/scripts/reactivation_engine.py --dry-run
python CRM/scripts/reactivation_engine.py
```

Both scripts read credentials from environment variables (`ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_API_DOMAIN`). Confirm `.env` is loaded before running.

---

## 3. Priority Algorithm

Task priority is determined by the deal's current stage and its `Followup_Number`. Apply this algorithm in order — use the first rule that matches.

| Condition | Task Type | Priority | Due |
|-----------|-----------|----------|-----|
| Stage = No Show | Reschedule Call | Highest | Today |
| Stage = New Leads AND Followup_Number = 0 | First Contact | Highest | Today |
| Task_Type = Scheduled Callback (Callback_Date_Time is set) | Scheduled Callback | High | Callback_Date_Time |
| Stage = Contacted (post-first-contact follow-up) | Post-Contact Follow-up | High | Tomorrow |
| Stage = New Leads AND Followup_Number = 1 | Follow-up 1 | High | Tomorrow |
| Stage = New Leads AND Followup_Number = 2 | Follow-up 2 | Normal | +1 day |
| Stage = New Leads AND Followup_Number = 3 | Follow-up 3 | Normal | +4 days |
| Stage = New Leads AND Followup_Number >= 4 | Final Attempt | Low | Today |
| Stage = Booking Lost (recovery) | Post-Interest Follow-up | Normal | +2 days |
| Deal inactive 120+ days, any open stage | Reactivation | Lowest | Today |

**Rule:** Never create a new task if an open (not Completed, not Deferred) task already exists for that deal. Always check first.

---

## 4. Common Operations

### 4a. Create a First-Contact Task for a New Lead Manually

Use this when a new deal was created but no task was auto-generated (e.g., bulk import, API ingestion without webhook).

**Step 1.** Fetch the deal to confirm its stage and Followup_Number:
```
Tool: zoho_get_record
Module: Deals
Record ID: <deal_id>
```

**Step 2.** Confirm Stage = "New Leads" and Followup_Number = 0 (or null). If Followup_Number is null, treat it as 0.

**Step 3.** Check for existing open tasks:
```
Tool: zoho_coql_query
Query: SELECT id, Status, Subject FROM Tasks WHERE What_Id = '<deal_id>' AND Status NOT IN ('Completed', 'Deferred') LIMIT 1
```

**Step 4.** If an open task exists, stop. Report: "Open task already exists for this deal — no action taken."

**Step 5.** If no open task exists, run the priority task manager script:
```bash
python CRM/scripts/priority_task_manager.py <deal_id>
```

**Step 6.** Confirm the script returns `"success": true` and a task ID. Report the task ID and type to the user.

---

### 4b. Running the Reactivation Engine

Use this when asked to re-engage dormant leads, run the reactivation sweep, or find leads that have gone cold.

**Step 1.** Always run dry-run first:
```bash
python CRM/scripts/reactivation_engine.py --dry-run
```

**Step 2.** Report the dry-run summary to the user: how many dormant deals were found, how many would have tasks created, how many would be skipped (already have open tasks).

**Step 3.** Ask the user: "The dry run found [N] dormant leads with no open tasks. [M] already have open tasks and will be skipped. Shall I run the live reactivation now?"

**Step 4.** Only proceed with the live run after explicit confirmation:
```bash
python CRM/scripts/reactivation_engine.py
```

**Step 5.** Report the final summary: tasks created, skipped, any failures.

**Do not run the live reactivation without user confirmation. This creates tasks for potentially hundreds of deals and cannot be undone in bulk.**

---

### 4c. Checking Pipeline Health

Run these COQL queries to assess the state of the pipeline. Execute each one using `zoho_coql_query`.

**Query 1 — Deals by stage (count):**
```sql
SELECT Stage, count(id) FROM Deals GROUP BY Stage
```
Report back a table of stage counts. Flag any stage with an unusually high count (e.g., more than 20 deals stuck in New Leads with high Followup_Number).

**Query 2 — Deals with no open tasks (stuck deals):**
```sql
SELECT id, Deal_Name, Stage, Followup_Number, Last_Contact_Attempt
FROM Deals
WHERE Stage NOT IN ('Booking Confirmed', 'Consultation Lost', 'Booking Lost')
AND id NOT IN (
  SELECT What_Id FROM Tasks WHERE Status NOT IN ('Completed', 'Deferred')
)
LIMIT 50
```
Any deal returned by this query is "stuck" — open stage, no active task. For each, run `priority_task_manager.py <deal_id>` to create the correct task.

**Query 3 — Overdue tasks (due date in the past, not completed):**
```sql
SELECT id, Subject, Due_Date, Priority, Status, What_Id
FROM Tasks
WHERE Due_Date < today()
AND Status NOT IN ('Completed', 'Deferred')
ORDER BY Due_Date ASC
LIMIT 50
```
Report count of overdue tasks and list the top 10 by oldest due date. These represent missed follow-ups.

**Query 4 — Callbacks due today or overdue:**
```sql
SELECT id, Deal_Name, Callback_Date_Time, Owner
FROM Deals
WHERE Callback_Requested = true
AND Callback_Date_Time <= today()
AND Stage NOT IN ('Booking Confirmed', 'Consultation Lost', 'Booking Lost')
LIMIT 50
```
Any deal returned needs a callback actioned now.

**Query 5 — No-show deals with no open task:**
```sql
SELECT id, Deal_Name, Last_Activity_Time
FROM Deals
WHERE Stage = 'No Show'
AND id NOT IN (
  SELECT What_Id FROM Tasks WHERE Status NOT IN ('Completed', 'Deferred')
)
LIMIT 20
```
Each result needs an immediate Reschedule Call task. Run `priority_task_manager.py <deal_id>` for each.

**Standard pipeline health report format:**

Present results as:
```
Pipeline Health — Carisma Aesthetics — [Date]

Stage Distribution:
  New Leads:                [N]
  Contacted:                [N]
  Consultation Scheduled:   [N]
  Booking Confirmed:        [N]
  No Show:                  [N]
  Booking Lost:             [N]
  Consultation Lost:        [N]

Issues:
  Stuck deals (no task):    [N]  ← action required
  Overdue tasks:            [N]  ← action required
  Overdue callbacks:        [N]  ← action required
  No-shows without task:    [N]  ← action required
```

---

### 4d. Handling a No-Show

Use this when a rep reports that a lead missed their consultation.

**Step 1.** Confirm the deal is currently in "Consultation Scheduled" stage:
```
Tool: zoho_get_record
Module: Deals
Record ID: <deal_id>
```

**Step 2.** If Stage is not "Consultation Scheduled", stop and report: "This deal is in [Stage] stage. The No Show transition is only available from Consultation Scheduled. Confirm the correct deal ID."

**Step 3.** Execute the Blueprint transition to move the deal to No Show stage:
```
Tool: zoho_blueprint_transition
Deal ID: <deal_id>
Transition: "No Show"
```

**Step 4.** Verify the deal is now in "No Show" stage:
```
Tool: zoho_get_record
Module: Deals
Record ID: <deal_id>
```
Confirm `Stage` = "No Show".

**Step 5.** Check if a Reschedule Call task was auto-created by Blueprint:
```
Tool: zoho_coql_query
Query: SELECT id, Subject, Priority, Due_Date FROM Tasks WHERE What_Id = '<deal_id>' AND Status NOT IN ('Completed', 'Deferred') LIMIT 5
```

**Step 6.** If no task exists, create one manually:
```bash
python CRM/scripts/priority_task_manager.py <deal_id>
```

**Step 7.** Report to user: "Deal moved to No Show. Reschedule Call task created with Highest priority, due today. Task ID: [id]."

---

### 4e. Marking a Deal as Lost with Reason

Use this when a rep confirms a deal is permanently lost and it needs to be closed.

**Step 1.** Confirm the current stage of the deal. The allowed loss transitions depend on the stage:
- From New Leads → use transition "Wrong Number / Declined" → stage becomes Consultation Lost
- From Contacted → use transition "Not Interested" → stage becomes Consultation Lost
- From Consultation Scheduled → use transition "Attended — Not Booked" → stage becomes Booking Lost
- From No Show → use transition "Unresponsive" → stage becomes Consultation Lost

**Step 2.** Ask the user: "What is the reason for loss?" Do not proceed without a reason. Valid reasons (picklist values — confirm against the live Reason_For_Loss__s field):
- Price too high
- Went elsewhere
- Not interested — no reason given
- Wrong number
- Max attempts — no answer
- No show — unresponsive
- Needs more time
- Partner/family disapproval
- Medical contraindication

**Step 3.** First update the Reason_For_Loss__s field on the deal:
```
Tool: zoho_update_records
Module: Deals
Record ID: <deal_id>
Fields: { "Reason_For_Loss__s": "<reason>" }
```

**Step 4.** Execute the Blueprint transition appropriate for the current stage (see Step 1 mapping).

**Step 5.** Mark any open tasks on this deal as Deferred (not Completed — they were never actioned):
```
Tool: zoho_coql_query
Query: SELECT id FROM Tasks WHERE What_Id = '<deal_id>' AND Status NOT IN ('Completed', 'Deferred') LIMIT 10
```
For each task returned:
```
Tool: zoho_update_records
Module: Tasks
Record ID: <task_id>
Fields: { "Status": "Deferred" }
```

**Step 6.** Confirm the deal is in a loss stage and all tasks are closed. Report: "Deal [name] marked as [Consultation Lost / Booking Lost]. Reason: [reason]. [N] open tasks deferred."

---

## 5. Blueprint Transitions Reference

Quick lookup table for every allowed transition. Use this to determine which Blueprint transition name to pass to `zoho_blueprint_transition`.

| Current Stage | Transition Name | Destination Stage | Mandatory Field |
|--------------|-----------------|-------------------|-----------------|
| New Leads | No Answer | New Leads (stays) | None |
| New Leads | Connected | Contacted | None |
| New Leads | Booked Consultation | Consultation Scheduled | Consultation_Date |
| New Leads | Wrong Number / Declined | Consultation Lost | Reason_For_Loss__s |
| Contacted | Call Back | Contacted (stays) | Callback_Date_Time |
| Contacted | Book Consultation | Consultation Scheduled | Consultation_Date |
| Contacted | Not Interested | Consultation Lost | Reason_For_Loss__s |
| Contacted | Interested in Future | Contacted (stays) | Interested_in_Future_Date |
| Contacted | Booked Directly | Booking Confirmed | Treatment field |
| Consultation Scheduled | Attended — Booked | Booking Confirmed | None |
| Consultation Scheduled | Attended — Not Booked | Booking Lost | Reason_For_Loss__s |
| Consultation Scheduled | No Show | No Show | None |
| Consultation Scheduled | Rescheduled | Consultation Scheduled (stays) | Consultation_Date |
| No Show | Rescheduled | Consultation Scheduled | Consultation_Date |
| No Show | Unresponsive | Consultation Lost | Reason_For_Loss__s |

**Important:** Any transition not listed in this table does not exist in the system. Do not attempt to use `zoho_blueprint_transition` with a transition name not in this table — it will return an error.

---

## 6. What Reps Should Never Do

Enforce these guardrails when reviewing rep actions or when asked to assist a rep.

**NEVER manually update the Stage field directly on a deal.** Stage must only change via Blueprint transitions. Direct field updates bypass mandatory field checks and skip automation actions. If asked to update Stage via `zoho_update_records`, refuse and use the appropriate Blueprint transition instead.

**NEVER create a task without checking for an existing open task first.** Duplicate tasks cause reps to work the same lead twice and corrupt follow-up sequencing. Always run the open-task COQL check before calling `create_records` for Tasks or running `priority_task_manager.py`.

**NEVER mark a task Complete without recording Task_Outcome.** Completing a task without an outcome means the reason for closure is unknown, which breaks performance reporting. If asked to complete a task, first update Task_Outcome, then set Status = Completed.

**NEVER close a deal as lost without a Reason_For_Loss__s value.** Loss reasons drive product and positioning decisions. An empty reason is not acceptable. Require a reason before executing any loss transition.

**NEVER run the reactivation engine live without first running dry-run.** The live run creates tasks across potentially hundreds of deals. Always present the dry-run preview to the user for approval first.

**NEVER activate any Zoho campaigns, email blasts, or bulk actions without explicit human approval.** The agent can prepare and preview bulk operations but not execute them unilaterally.

**NEVER reassign a deal to a different owner without manager confirmation.** Use `zoho_transfer_owner` only when explicitly instructed by a manager.

---

## 7. Escalation Path

### Handle autonomously (no escalation needed)

- Creating or checking tasks for individual deals
- Running reactivation dry-run and reporting results
- Running pipeline health queries and reporting findings
- Fetching deal details or task lists
- Marking individual tasks as Complete or Deferred
- Updating single non-critical fields (e.g., Last_Contact_Attempt, Callback_Requested)

### Ask for confirmation before proceeding

- Running reactivation engine live (must show dry-run summary first)
- Marking any deal as lost (confirm deal ID, current stage, and loss reason with user)
- Executing Blueprint transitions that move deals backward in the pipeline
- Any bulk operation affecting more than 5 deals at once
- Creating tasks for deals the user did not specifically mention

### Escalate to manager immediately (stop and flag)

- Any deal where the lead is a real patient (has a Booking Confirmed history) being marked as lost
- Discrepancies between what a rep reported and what the CRM data shows (potential data integrity issue)
- A deal stuck in "No Show" for more than 7 days with no activity
- Followup_Number exceeding 4 without the deal being closed (Blueprint enforcement failure)
- Any error from Zoho API that suggests data was written in an inconsistent state (partial update, 500 error during a multi-step operation)
- Requests to delete deal records — never delete, always close as lost
