# Carisma Aesthetics — Zoho CRM Blueprint Configuration Guide

**Document type:** Admin Setup Guide  
**System:** Zoho CRM — Process Automation > Blueprint  
**Pipeline:** Carisma Aesthetics Deal Pipeline  
**Last updated:** 2026-04-20

---

## 1. What Blueprint Is and Why We Use It

Blueprint is Zoho CRM's process enforcement layer. Without it, a deal can jump between any stages in any order, reps can skip mandatory fields, and no automated actions fire on transitions. With Blueprint, every move a deal makes through the pipeline is gated: the system checks that required information has been captured before allowing the stage change, fires actions automatically (updating fields, setting flags, triggering task creation), and prevents reps from taking shortcuts that corrupt the pipeline data.

For Carisma Aesthetics, Blueprint solves three specific problems. First, it ensures every "No Answer" attempt is counted — Followup_Number cannot be ignored because Blueprint enforces the increment workflow rule. Second, it guarantees that loss exits always capture a reason, which means our lost-lead analytics are reliable. Third, it prevents a rep from manually dragging a deal to "Booking Confirmed" without going through the consultation step, which would destroy conversion-rate data. In short, Blueprint is what makes the pipeline trustworthy enough to report on.

---

## 2. Pre-requisites — Confirm These Before Touching Blueprint

Before configuring Blueprint, verify that all custom fields are deployed in your Zoho CRM org. If any field is missing, Blueprint transitions that reference it will fail to save.

**Custom fields on the Tasks module:**

- [ ] `Task_Outcome` — Picklist with values: Connected - Booked, Connected - Interested, Connected - Not Interested, Connected - Call Back, No Answer, Voicemail Left, Wrong Number
- [ ] `Task_Type` — Picklist with values: First Contact, Follow-up 1, Follow-up 2, Follow-up 3, Final Attempt, Scheduled Callback, Post-Interest Follow-up, Reactivation
- [ ] `Callback_Date_Time` — DateTime field

**Custom fields on the Deals module:**

- [ ] `Last_Contact_Attempt` — DateTime field
- [ ] `Callback_Requested` — Boolean (checkbox) field
- [ ] `Followup_Number` — Integer field (confirmed already exists)

**To check field deployment:** Navigate to Setup > Developer Space > APIs > CRM API > Modules > [Module name] > Fields. All fields above must appear in the list. If any are missing, create them under Setup > Customization > Modules and Fields before proceeding.

**Also confirm:**

- [ ] The Aesthetics pipeline exists in Zoho CRM (Setup > CRM > Pipeline)
- [ ] All stage names match exactly: New Leads, Contacted, Consultation Scheduled, Booking Confirmed, Consultation Lost, Booking Lost, No Show
- [ ] You have CRM Administrator access (not just Manager)

---

## 3. How to Access Blueprint

Follow these steps exactly. Zoho's navigation labels change slightly between plan tiers; these steps are correct for Zoho CRM Enterprise and above.

1. Click the **gear icon** (Settings) in the top-right corner of Zoho CRM.
2. In the left sidebar, scroll down to the section labelled **Process Management**.
3. Click **Blueprint**.
4. You will see a list of any existing Blueprints. Click **+ New Blueprint** (top-right button).
5. In the "Select Module" dropdown, choose **Deals**.
6. In the "Select Pipeline" dropdown, choose **Carisma Aesthetics** (not the default pipeline).
7. Give the Blueprint a name: `Carisma Aesthetics — Deal Pipeline`.
8. Click **Create**.
9. You will enter the Blueprint canvas — a visual flowchart editor where each box represents a pipeline stage. The canvas will automatically show all stages from the Aesthetics pipeline.

**Important:** The Blueprint canvas is per-pipeline. If you do not select the correct pipeline in Step 6, you will be editing the wrong Blueprint and your changes will have no effect on Aesthetics deals.

---

## 4. Stage-by-Stage Blueprint Configuration

For each stage, you will click the stage box on the canvas, then click **Configure Transitions**. Each transition is a button a rep can click to move (or keep) the deal. For each transition, you define: (a) which stage the deal moves to, (b) which fields must be filled before the button is available, and (c) which automated actions fire when the button is clicked.

### How to add a transition (general steps)

1. Click the stage box on the canvas.
2. Click **+ Add Transition**.
3. In the "Transition Name" field, type the label exactly as specified below.
4. In the "Move to Stage" dropdown, select the destination stage.
5. Click **Before** tab — add any "During Transition" fields that must be filled in (the rep sees a popup asking for these before the stage changes).
6. Click **After** tab — add any field update actions or task-creation actions that fire immediately after the transition completes.
7. Click **Save**.

---

### Stage: NEW LEADS

This stage holds all freshly created deals. The primary action here is calling the lead. Each unanswered attempt increments the follow-up counter. After four unanswered attempts, the deal must exit to Consultation Lost.

---

#### Transition 1: "No Answer"

**What it does:** Records a failed contact attempt. Deal stays in New Leads. Followup_Number increments (handled by a workflow rule that fires after this transition — see Section 5, Workflow Rule 1).

**Destination stage:** New Leads (stays)

**Before — Required fields:** None. The rep can click this button immediately after an unanswered call.

**After — Actions:**
- Field update: Set `Last_Contact_Attempt` = Current DateTime

**Hard stop configuration (Condition-based transition visibility):**  
This transition must be hidden once Followup_Number reaches 4. To enforce this:
1. On the "No Answer" transition, click the **Criteria** tab.
2. Add condition: `Followup_Number` is less than `4`.
3. This means the button only appears when Followup_Number < 4. Once it hits 4, the rep cannot click "No Answer" — they must use "Wrong Number / Declined" to close the deal.

Note: Zoho Blueprint does not natively auto-move a deal when a threshold is reached. The hard stop is enforced by hiding the "No Answer" transition at Followup_Number = 4 AND by the Workflow Rule 2 (see Section 5) which forces the stage to Consultation Lost when Followup_Number reaches 4. Both mechanisms together create the hard stop.

---

#### Transition 2: "Connected"

**What it does:** Records that the rep reached the lead. Deal moves to Contacted.

**Destination stage:** Contacted

**Before — Required fields:** None. Connection is enough to proceed.

**After — Actions:**
- Field update: Set `Last_Contact_Attempt` = Current DateTime

---

#### Transition 3: "Booked Consultation"

**What it does:** Lead was reached and immediately agreed to a consultation. Skips the Contacted stage entirely.

**Destination stage:** Consultation Scheduled

**Before — Required fields:**
- `Consultation_Date` — the rep must enter the consultation date before this transition saves. Add this as a "During Transition" mandatory field.

**After — Actions:** None.

---

#### Transition 4: "Wrong Number / Declined"

**What it does:** Lead is permanently unworkable — bad number, aggressive refusal, or national opt-out. Deal exits to Consultation Lost.

**Destination stage:** Consultation Lost

**Before — Required fields:**
- `Reason_For_Loss__s` — mandatory picklist. The rep cannot complete this transition without selecting a reason.

**After — Actions:** None.

---

### Stage: CONTACTED

This stage holds deals where the rep has spoken to the lead at least once. The goal is to convert the conversation into a scheduled consultation or direct booking.

---

#### Transition 1: "Call Back"

**What it does:** Lead asked to be called back at a specific time. Deal stays in Contacted with a callback flag set.

**Destination stage:** Contacted (stays)

**Before — Required fields:**
- `Callback_Date_Time` — mandatory DateTime. The rep must enter the exact callback date and time. Without this, the callback will be forgotten.

**After — Actions:**
- Field update: Set `Callback_Requested` = true

---

#### Transition 2: "Book Consultation"

**What it does:** Lead has agreed to a consultation. Deal moves to Consultation Scheduled.

**Destination stage:** Consultation Scheduled

**Before — Required fields:**
- `Consultation_Date` — mandatory. The rep must enter the consultation date.

**After — Actions:** None.

---

#### Transition 3: "Not Interested"

**What it does:** Lead explicitly declined. Deal exits to Consultation Lost.

**Destination stage:** Consultation Lost

**Before — Required fields:**
- `Reason_For_Loss__s` — mandatory. A reason must be selected before this transition saves.

**After — Actions:** None.

---

#### Transition 4: "Interested in Future"

**What it does:** Lead is interested but not ready now. Deal stays in Contacted for a future follow-up. A date must be captured to prevent the deal from floating indefinitely.

**Destination stage:** Contacted (stays)

**Before — Required fields:**
- `Interested_in_Future_Date` — mandatory DateTime. This is when the rep should follow up.

**After — Actions:** None.

Note: You will need to create the `Interested_in_Future_Date` field on Deals if it does not already exist. Go to Setup > Customization > Modules and Fields > Deals > Add Field > Date.

---

#### Transition 5: "Booked Directly"

**What it does:** Lead skipped the consultation and booked a treatment directly (uncommon but possible for returning-patient-style leads). Deal jumps straight to Booking Confirmed.

**Destination stage:** Booking Confirmed

**Before — Required fields:**
- `Treatment_s` (or whichever field holds the booked treatment name) — mandatory. The treatment must be recorded for revenue attribution.

**After — Actions:** None.

---

### Stage: CONSULTATION SCHEDULED

This stage holds deals with a confirmed consultation date. After the consultation date passes, the rep must record the outcome.

---

#### Transition 1: "Attended — Booked"

**What it does:** Lead attended the consultation and booked a treatment on the spot. Deal moves to Booking Confirmed.

**Destination stage:** Booking Confirmed

**Before — Required fields:** None. Attending and booking is sufficient.

**After — Actions:** None.

---

#### Transition 2: "Attended — Not Booked"

**What it does:** Lead attended the consultation but did not book. This is a soft loss — the lead is recoverable. Deal moves to Booking Lost. A recovery follow-up task is automatically created.

**Destination stage:** Booking Lost

**Before — Required fields:**
- `Reason_For_Loss__s` — mandatory. A reason must be selected (e.g., "Price", "Needs to think", "Partner consultation needed").

**After — Actions:**
- Create task: Subject = "Recovery Follow-up — [Deal Name]", Type = "Post-Interest Follow-up", Priority = Normal, Due = +48 hours from now.

Note: Zoho Blueprint "After" actions support creating tasks directly. Set the "Due Date" to a relative formula: `today() + 2`. Set Priority field to "Normal". Set Task_Type picklist to "Post-Interest Follow-up".

---

#### Transition 3: "No Show"

**What it does:** Lead did not attend the scheduled consultation without cancelling. Deal moves to No Show stage. An immediate reschedule call task is created — this is the highest-priority task in the system.

**Destination stage:** No Show

**Before — Required fields:** None. The rep marks this as soon as they confirm the lead didn't appear.

**After — Actions:**
- Create task: Subject = "Reschedule Call — [Deal Name]", Type = "Reschedule Call", Priority = Highest, Due = today (due NOW, same day).

---

#### Transition 4: "Rescheduled"

**What it does:** Lead called ahead to reschedule. Deal stays in Consultation Scheduled with a new date.

**Destination stage:** Consultation Scheduled (stays)

**Before — Required fields:**
- `Consultation_Date` — mandatory. The new date must be entered before the transition saves. This overwrites the previous consultation date.

**After — Actions:** None.

---

### Stage: NO SHOW

This stage holds leads who missed a consultation. The window for re-engagement is narrow — same-day or next-day contact is critical.

---

#### Transition 1: "Rescheduled"

**What it does:** Rep reached the no-show lead and they agreed to a new date. Deal moves back to Consultation Scheduled.

**Destination stage:** Consultation Scheduled

**Before — Required fields:**
- `Consultation_Date` — mandatory. The new consultation date must be entered.

**After — Actions:** None.

---

#### Transition 2: "Unresponsive"

**What it does:** Rep attempted contact multiple times and could not reach the no-show lead. Deal exits to Consultation Lost.

**Destination stage:** Consultation Lost

**Before — Required fields:**
- `Reason_For_Loss__s` — mandatory. Select "No Show — Unresponsive" or equivalent.

**After — Actions:** None.

---

### Stages with no outbound Blueprint transitions

The following stages are terminal exits. No transitions are needed out of them because they represent closed outcomes. You do not need to configure anything for these stages in Blueprint.

- **Booking Confirmed** — Active client. No CRM action needed.
- **Consultation Lost** — Permanently closed. Handled by reactivation engine after 120 days.
- **Booking Lost** — Soft loss. Recovery task created by Blueprint. After that, reactivation engine handles it.

---

## 5. Workflow Rules to Configure

These seven workflow rules must be configured in **Setup > Automation > Workflow Rules** (not in Blueprint). They complement Blueprint by firing on field-change triggers. Configure them in order.

---

### Workflow Rule 1: Auto-Create Next Task on No Answer

**Module:** Deals  
**Trigger:** Field Edit — when `Followup_Number` is edited  
**Additional condition:** Stage = "New Leads" AND Followup_Number is less than 4  
**Action:** Call the `priority_task_manager.py` script via a webhook, passing the Deal ID.  
**Purpose:** Every time a rep clicks "No Answer" in Blueprint (which increments Followup_Number), this rule fires and creates the next appropriately typed and prioritised follow-up task for the deal.

To configure the webhook action:
1. In the workflow action, choose "Webhook".
2. Method: POST
3. URL: Your n8n or server endpoint that calls `python CRM/scripts/priority_task_manager.py ${deal_id}`.
4. Pass `${Deals.id}` as a parameter in the request body.

---

### Workflow Rule 2: Force Close After 4 No-Answers

**Module:** Deals  
**Trigger:** Field Edit — when `Followup_Number` is edited  
**Additional condition:** Followup_Number equals 4 AND Stage = "New Leads"  
**Action:** Field update — set Stage = "Consultation Lost", set `Reason_For_Loss__s` = "Max Attempts — No Answer"  
**Purpose:** Enforces the hard stop. When Followup_Number reaches 4, the deal auto-closes. The "No Answer" Blueprint transition is also hidden at this point (see Section 4), creating a belt-and-suspenders enforcement.

---

### Workflow Rule 3: Auto-Create No-Show Reschedule Task

**Module:** Deals  
**Trigger:** Stage changed to "No Show"  
**Additional condition:** None  
**Action:** Create Task — Subject = "Reschedule Call — {Deal Name}", Priority = Highest, Due = Today, Task_Type = "Reschedule Call"  
**Purpose:** Backs up the Blueprint "After" action for No Show. If Blueprint's built-in task creation fails for any reason, this workflow rule catches it.

Note: Having both the Blueprint action and the workflow rule creates a risk of duplicate tasks. To mitigate: add a condition to this workflow rule — only create the task if no open task of type "Reschedule Call" exists. This requires a lookup condition; alternatively, the `priority_task_manager.py` script handles duplicate-check logic if invoked via webhook.

---

### Workflow Rule 4: Auto-Create Post-Interest Recovery Task

**Module:** Deals  
**Trigger:** Stage changed to "Booking Lost"  
**Additional condition:** None  
**Action:** Create Task — Subject = "Recovery Follow-up — {Deal Name}", Priority = Normal, Due Date = Today + 2 days, Task_Type = "Post-Interest Follow-up"  
**Purpose:** Backs up the Blueprint "Attended — Not Booked" after-action. Ensures recovery follow-up always exists even if Blueprint action fails.

---

### Workflow Rule 5: Set Callback_Requested on Callback_Date_Time Entry

**Module:** Deals  
**Trigger:** Field Edit — when `Callback_Date_Time` is edited and is not empty  
**Additional condition:** Stage = "Contacted"  
**Action:** Field update — set `Callback_Requested` = true  
**Purpose:** Ensures the boolean flag is always in sync with whether a callback date exists. Useful for building custom views that filter on `Callback_Requested = true`.

---

### Workflow Rule 6: Clear Callback_Requested After Callback Completed

**Module:** Deals  
**Trigger:** Field Edit — when `Callback_Date_Time` is cleared (set to empty)  
**Additional condition:** None  
**Action:** Field update — set `Callback_Requested` = false  
**Purpose:** Keeps the flag accurate when a callback has been completed and the rep clears the date.

---

### Workflow Rule 7: Reactivation Engine Scheduler

**Module:** Deals  
**Trigger:** Scheduled — runs daily at 08:00 Malta time  
**Additional condition:** None  
**Action:** Webhook — POST to your automation endpoint which runs `python CRM/scripts/reactivation_engine.py`  
**Purpose:** Every morning, the reactivation engine scans all deals inactive for 120+ days and creates "Reactivation" (Lowest priority) tasks for them. This ensures dormant leads are never permanently forgotten.

---

## 6. Custom Views to Create

After Blueprint is live, create the following custom view so reps see their tasks in the correct priority order.

### View: "My Tasks — Priority Queue"

**How to create:**
1. Navigate to **Activities** > **Tasks** in the top navigation.
2. Click the **All Tasks** dropdown (top left of the task list).
3. Click **+ New View**.
4. Name the view: `My Tasks — Priority Queue`.
5. Set visibility to: **Only Me** (each rep creates their own) or **All Users** (if you want a shared view for managers).

**Filter conditions (apply all):**

| Field | Operator | Value |
|-------|----------|-------|
| Assigned To | is | Current User |
| Status | is not | Completed |
| Status | is not | Deferred |

**Sort order:**

| Sort level | Field | Direction |
|-----------|-------|-----------|
| Primary | Priority | Ascending |
| Secondary | Due Date | Ascending |

Note: Zoho's Priority field sorts alphabetically by default (High, Highest, Low, Lowest, Normal). To get true priority ordering, you will need to either (a) rename the values with numeric prefixes (e.g., "1-Highest", "2-High") or (b) accept alphabetical sort and train reps to know the order: Highest > High > Normal > Low > Lowest.

**Columns to display (in order):**
1. Subject
2. Due Date
3. Priority
4. Task_Type
5. Related To (Deal Name)
6. Status

**Save the view.** It will appear in the task view dropdown for the selected users.

---

## 7. Testing Checklist

After configuring Blueprint and all workflow rules, test every path before going live. Use a test deal (name it "TEST — Do Not Contact") and walk through each scenario.

**Test 1: New Lead — Full No-Answer sequence**
- [ ] Create a test deal in "New Leads" stage. Confirm a First Contact task (Priority: Highest) exists.
- [ ] Click the "No Answer" Blueprint transition. Confirm Followup_Number increments to 1. Confirm a Follow-up 1 task (Priority: High) is created.
- [ ] Click "No Answer" again. Confirm Followup_Number = 2. Confirm Follow-up 2 task (Priority: Normal) is created.
- [ ] Click "No Answer" again. Confirm Followup_Number = 3. Confirm Follow-up 3 task (Priority: Normal) is created.
- [ ] Click "No Answer" again. Confirm Followup_Number = 4. Confirm deal automatically moves to Consultation Lost. Confirm "No Answer" button is no longer visible (or deal is already closed).

**Test 2: New Lead — Connected flow**
- [ ] Create a test deal in "New Leads". Click "Connected". Confirm deal moves to Contacted. Confirm Last_Contact_Attempt is set to current datetime.

**Test 3: Contacted — Call Back**
- [ ] With deal in Contacted stage, attempt to click "Call Back" without entering Callback_Date_Time. Confirm the system blocks the transition with a validation error.
- [ ] Enter a Callback_Date_Time value and click "Call Back". Confirm deal stays in Contacted. Confirm Callback_Requested = true.

**Test 4: Contacted — Not Interested**
- [ ] Attempt "Not Interested" without selecting Reason_For_Loss__s. Confirm blocked.
- [ ] Select a reason and proceed. Confirm deal moves to Consultation Lost.

**Test 5: Consultation Scheduled — No Show**
- [ ] Move test deal to Consultation Scheduled (use "Book Consultation" transition, enter a date).
- [ ] Click "No Show". Confirm deal moves to No Show stage. Confirm a task with Priority = Highest and Task_Type = "Reschedule Call" is created due today.

**Test 6: Consultation Scheduled — Attended, Not Booked**
- [ ] Click "Attended — Not Booked". Confirm system requires Reason_For_Loss__s. Confirm deal moves to Booking Lost. Confirm a Post-Interest Follow-up task is created with Priority = Normal and Due Date = today + 2 days.

**Test 7: No Show — Rescheduled**
- [ ] With deal in No Show stage, click "Rescheduled". Confirm system requires new Consultation_Date. Confirm deal moves back to Consultation Scheduled.

**Test 8: Priority Queue view**
- [ ] Open "My Tasks — Priority Queue" view. Create one task of each priority manually for yourself. Confirm Highest appears at the top when sorted by Priority ascending.

**Test 9: Reactivation engine**
- [ ] Run `python CRM/scripts/reactivation_engine.py --dry-run` from the terminal. Confirm it returns a list without errors. Confirm no tasks are created in CRM (dry run only).

**Sign-off:** Once all 9 tests pass, delete the test deal and mark this guide as configured in the CRM project notes.
