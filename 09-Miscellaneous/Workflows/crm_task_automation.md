# CRM Task Automation — Operational Guide

## What Changed

We replaced the old pipeline-based follow-up system (separate pipelines for Call Back, Follow-up 1, Follow-up 2, Follow-up 3) with a **task-driven workflow**. Leads stay in their pipeline stage. Follow-ups are managed as **Tasks** with automated sequencing.

This is deployed on all 3 CRMs: Spa, Aesthetics, and Slimming.

## What Was Deployed (via API)

### New Custom Fields on Tasks Module

| Field | API Name | Type | Values |
|---|---|---|---|
| Task Outcome | `Task_Outcome` | Picklist | Connected - Booked, Connected - Interested, Connected - Not Interested, Connected - Call Back, No Answer, Voicemail Left, Wrong Number |
| Task Type | `Task_Type` | Picklist | First Contact, Follow-up 1, Follow-up 2, Follow-up 3, Final Attempt, Scheduled Callback, Post-Interest Follow-up |
| Callback Date Time | `Callback_Date_Time` | DateTime | — |

### New Custom Fields on Deals Module

| Field | API Name | Type | Values |
|---|---|---|---|
| Last Contact Attempt | `Last_Contact_Attempt` | DateTime | — |
| Callback Requested | `Callback_Requested` | Boolean | — |
| Loss Reason (Spa only) | `Loss_Reason` | Picklist | Unresponsive, Too Expensive, Chose Competitor, Not Ready, Wrong Number, Other |

> **Note:** Aesthetics and Slimming already had `Reason_For_Loss__s` — no duplicate was created.

### Already Existing Fields (used by automation)

All 3 CRMs already had these fields — no changes made:
- `Followup_Number` (integer) on Deals
- `Next_Schedule_Date_Time` (datetime) on Deals
- `Speed_to_Lead_Minutes` (double) on Deals
- `First_Contact_Time` (datetime) on Deals

## What Requires Manual Setup in Zoho CRM UI

### Workflow Rules (7 per brand = 21 total)

Go to **Settings > Automation > Workflow Rules** in each CRM.

Full specs saved in `Config/crm_workflow_rules.json`. Here is the summary:

#### Rule 1: Auto-Task on New Lead
- **Module:** Deals
- **Trigger:** When a Deal is created or edited
- **Condition:** Stage = "New Leads"
- **Action:** Create Task
  - Subject: "First Contact Attempt"
  - Due Date: Rule trigger date (immediate)
  - Priority: Urgent (Highest)
  - Task_Type: First Contact
  - Owner: Same as Deal Owner

#### Rule 2: Follow-up 1 on No Answer
- **Module:** Tasks
- **Trigger:** When a Task is edited
- **Condition:** Task_Outcome = "No Answer" AND Task_Type = "First Contact"
- **Action:** Create Task
  - Subject: "Follow-up Call #1"
  - Due Date: +1 day
  - Priority: High
  - Task_Type: Follow-up 1

#### Rule 3: Follow-up 2 on No Answer
- **Module:** Tasks
- **Trigger:** When a Task is edited
- **Condition:** Task_Outcome = "No Answer" AND Task_Type = "Follow-up 1"
- **Action:** Create Task
  - Subject: "Follow-up Call #2 + WhatsApp"
  - Due Date: +2 days
  - Priority: Normal
  - Task_Type: Follow-up 2

#### Rule 4: Follow-up 3 on No Answer
- **Module:** Tasks
- **Trigger:** When a Task is edited
- **Condition:** Task_Outcome = "No Answer" AND Task_Type = "Follow-up 2"
- **Action:** Create Task
  - Subject: "Follow-up Call #3 + SMS"
  - Due Date: +2 days
  - Priority: Normal
  - Task_Type: Follow-up 3

#### Rule 5: Final Attempt on No Answer
- **Module:** Tasks
- **Trigger:** When a Task is edited
- **Condition:** Task_Outcome = "No Answer" AND Task_Type = "Follow-up 3"
- **Action:** Create Task
  - Subject: "FINAL Attempt — Call + Last Chance WhatsApp"
  - Due Date: +3 days
  - Priority: Low
  - Task_Type: Final Attempt

#### Rule 6: Scheduled Callback
- **Module:** Tasks
- **Trigger:** When a Task is edited
- **Condition:** Task_Outcome = "Connected - Call Back"
- **Action:** Create Task
  - Subject: "Scheduled Callback"
  - Due Date: Use Callback_Date_Time field
  - Priority: High
  - Task_Type: Scheduled Callback

#### Rule 7: Post-Interest Follow-up
- **Module:** Tasks
- **Trigger:** When a Task is edited
- **Condition:** Task_Outcome = "Connected - Interested"
- **Action:** Create Task
  - Subject: "Follow up on Interest — Book Appointment"
  - Due Date: +1 day
  - Priority: High
  - Task_Type: Post-Interest Follow-up

### Important: Zoho CRM Limitation

Zoho CRM workflow rules on the **Tasks module** may not support "Create Task" as an instant action in all editions. If this is the case, use **Deluge Custom Functions** instead:

```
// Example: Auto-create follow-up task when Task_Outcome = "No Answer"
taskOutcome = input.Task_Outcome;
taskType = input.Task_Type;
relatedTo = input.What_Id;
owner = input.Owner;

if (taskOutcome == "No Answer" && taskType == "First Contact")
{
    newTask = Map();
    newTask.put("Subject", "Follow-up Call #1");
    newTask.put("Due_Date", today.addDay(1));
    newTask.put("Priority", "High");
    newTask.put("Status", "Not Started");
    newTask.put("Task_Type", "Follow-up 1");
    newTask.put("What_Id", relatedTo);
    newTask.put("Owner", owner);
    createResp = zoho.crm.createRecord("Tasks", newTask);
}
```

---

## How CRM Reps Use the New System

### Daily Workflow

1. **Open "My Tasks" view** — filter by "Due Today" and sort by Priority (Urgent first)
2. **Work top to bottom** — new leads (Urgent priority) always appear at the top
3. **After each interaction:** Mark the task as Completed and set the **Task Outcome** dropdown
4. **The system auto-creates the next task** based on the outcome

### Task Outcome Quick Reference

| Outcome | What It Means | What Happens Next |
|---------|--------------|-------------------|
| **Connected - Booked** | They booked an appointment | No more tasks. Move deal to Booking Confirmed. |
| **Connected - Interested** | They're interested but didn't book yet | Auto-creates "Post-Interest Follow-up" task due tomorrow |
| **Connected - Not Interested** | They declined | Move deal to Closed Lost. Set Loss Reason. |
| **Connected - Call Back** | They said "call me later" | Fill in Callback Date Time. Auto-creates callback task for that date. |
| **No Answer** | No response to call/message | Auto-creates next follow-up task in sequence (FU1 → FU2 → FU3 → Final) |
| **Voicemail Left** | Left a voicemail | Same as No Answer — treat as an unsuccessful contact |
| **Wrong Number** | Number is invalid | Move deal to Closed Lost. Set Loss Reason = Wrong Number. |

### Follow-Up Cadence (Automatic)

| Task | Timing | Channel |
|------|--------|---------|
| First Contact | Immediate (within 5 min) | Phone call + WhatsApp if no answer |
| Follow-up 1 | +1 day | Phone call |
| Follow-up 2 | +2 days | Phone call + WhatsApp with social proof |
| Follow-up 3 | +2 days | Phone call + SMS |
| Final Attempt | +3 days | Phone call + "last chance" WhatsApp |
| After Final — No Answer | — | Move to Closed Lost (Unresponsive) |

### Reps Should NEVER

- Manually move deals between follow-up stages/pipelines
- Create their own follow-up reminders or calendar events
- Skip the Task Outcome dropdown (the automation chain breaks)
- Stare at the Kanban pipeline view as their daily workspace

### Reps Should ALWAYS

- Work from the Tasks view (Activities > My Tasks > Due Today)
- Complete tasks immediately after each interaction
- Set the correct Task Outcome every time
- Fill in Callback Date Time when selecting "Connected - Call Back"
- Update Deal stage when a booking is confirmed or lost

---

## System Architecture

```
LEAD ARRIVES
    │
    ▼
Deal created in "New Leads" stage
    │
    ▼ (Workflow Rule 1 fires)
    │
Task created: "First Contact Attempt"
Priority: Urgent, Due: NOW
    │
    ▼ Rep completes task, selects outcome
    │
    ├─ "Connected - Booked" → Deal → Booking Confirmed. Done.
    ├─ "Connected - Interested" → Rule 7 → Post-Interest Follow-up task
    ├─ "Connected - Call Back" → Rule 6 → Callback task on specified date
    ├─ "Connected - Not Interested" → Deal → Closed Lost
    ├─ "No Answer" → Rule 2 → Follow-up 1 task (+1 day)
    │       └─ "No Answer" → Rule 3 → Follow-up 2 (+2 days)
    │               └─ "No Answer" → Rule 4 → Follow-up 3 (+2 days)
    │                       └─ "No Answer" → Rule 5 → Final Attempt (+3 days)
    │                               └─ "No Answer" → Closed Lost (Unresponsive)
    └─ "Wrong Number" → Deal → Closed Lost
```

## Key Metrics to Track

| Metric | How to Measure | Target |
|--------|---------------|--------|
| Speed-to-Lead | Time from deal creation to first task completed | < 5 minutes |
| Contact Rate | % of leads that reach "Connected" outcome | > 60% |
| Booking Rate | % of connected leads that book | > 30% |
| Task Completion Rate | % of tasks completed on or before due date | > 90% |
| Follow-up Compliance | Are reps completing all follow-up tasks? | 100% |

## Reference Files

- **Field IDs:** `Config/crm_field_ids.json`
- **Workflow Rule Specs:** `Config/crm_workflow_rules.json`
- **Deployment Script:** `Tools/deploy_crm_workflow_rules.py` (validates fields, generates specs)

## Future Enhancements (Phase 2)

1. **Pipeline stage consolidation** — Migrate existing deals from 14-17 stages to 4 clean stages
2. **Blueprint enforcement** — Lock stage transitions so reps can't skip steps
3. **CarismaSoft sync** — Auto-update deal with booking outcome (attended/no-show) and revenue
4. **Meta CAPI integration** — Feed attended + revenue data back to Meta for algorithm optimization
5. **Auto-close unresponsive** — After Final Attempt with "No Answer", auto-move deal to Closed Lost
