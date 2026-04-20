# Setter Queue — Zoho CRM Setup Guide

**Apply these steps identically to all 3 CRM orgs:** Spa, Aesthetics, Slimming.

## What's Already Done (via API)

- [x] Custom fields created on Tasks module (12 new fields)
- [x] Stage/Follow Up Date/Follow Up Reason added to Spa & Slimming
- [x] Treatment field added to Spa Leads
- [x] Task_Outcome picklist updated (4 new values)
- [x] "Setter Queue" custom view created and configured

## What Needs Manual Setup

Blueprints, workflow rules, custom functions, and scheduled functions **cannot be created via the Zoho CRM REST API**. Follow these steps in each CRM org.

---

## Step 1: Create Custom Functions

Go to **Setup > Automation > Custom Functions** (or create them inline during Blueprint/Workflow setup).

Create these standalone functions (they'll be referenced by blueprints and workflows):

### 1.1 calculate_priority_score
- **Name:** calculate_priority_score
- **Module:** Tasks
- **Parameters:** taskId (string)
- **Code:** Copy from `deluge/calculate_priority_score.dg`

### 1.2 populate_mirror_fields
- **Name:** populate_mirror_fields
- **Module:** Tasks
- **Parameters:** taskId (string)
- **Code:** Copy from `deluge/populate_mirror_fields.dg`

---

## Step 2: Create the Blueprint

Go to **Setup > Automation > Blueprint**

### 2.1 Create Blueprint
- **Module:** Tasks
- **Layout:** Standard
- **Field:** Status
- **Name:** Setter Queue Blueprint

### 2.2 Define States
Add these states to the blueprint canvas:
- **Not Started** (entry state)
- **In Progress**
- **Completed** (end state)

### 2.3 Define Transitions

Create these transitions (connect states on the canvas):

#### Transition 1: "Pick Up"
- **From:** Not Started → **To:** In Progress
- **Before transition:** None
- **During transition:** No required fields
- **After transition:** Custom function → `on_pick_up.dg` code
  - Stamps First_Contacted_At

#### Transition 2: "Connected - Booked"
- **From:** In Progress → **To:** Completed
- **During transition required fields:** Setter_Notes (mandatory)
- **After transition:** Custom function → `on_connected_booked.dg` code

#### Transition 3: "Connected - Call Back"
- **From:** In Progress → **To:** Completed
- **During transition required fields:** Callback_Date_Time (mandatory), Setter_Notes (mandatory)
- **After transition:** Custom function → `on_connected_callback.dg` code

#### Transition 4: "Connected - Needs Info"
- **From:** In Progress → **To:** Completed
- **During transition required fields:** Setter_Notes (mandatory)
- **After transition:** Custom function → `on_connected_needs_info.dg` code

#### Transition 5: "Connected - Thinking"
- **From:** In Progress → **To:** Completed
- **During transition required fields:** Setter_Notes (mandatory)
- **After transition:** Custom function → `on_connected_thinking.dg` code

#### Transition 6: "Connected - Reschedule"
- **From:** In Progress → **To:** Completed
- **During transition required fields:** Setter_Notes (mandatory)
- **After transition:** Custom function → `on_connected_reschedule.dg` code

#### Transition 7: "Connected - Not Interested"
- **From:** In Progress → **To:** Completed
- **During transition required fields:** Setter_Notes (mandatory)
- **After transition:** Custom function → `on_connected_not_interested.dg` code

#### Transition 8: "No Answer"
- **From:** In Progress → **To:** Completed
- **During transition:** No required fields
- **After transition:** Custom function → `on_no_answer.dg` code

#### Transition 9: "Voicemail Left"
- **From:** In Progress → **To:** Completed
- **During transition:** No required fields
- **After transition:** Custom function → `on_voicemail.dg` code

#### Transition 10: "Wrong Number"
- **From:** In Progress → **To:** Completed
- **During transition required fields:** Setter_Notes (mandatory)
- **After transition:** Custom function → `on_wrong_number.dg` code

#### Transition 11: "Inbound Received"
- **From:** In Progress → **To:** Completed
- **During transition required fields:** Setter_Notes (mandatory)
- **After transition:** Custom function → `on_inbound_received.dg` code

### 2.4 Important Blueprint Settings
- **Common fields for all transitions:** Task_Outcome (display but don't make mandatory — the function sets it)
- **GDPR guidance:** Add help text to the Setter_Notes field during transitions: "Log treatment interest only. Do not record medical details."

---

## Step 3: Create Workflow Rules

Go to **Setup > Automation > Workflow Rules**

### 3.1 Mirror Fields on Manual Task Creation
- **Module:** Tasks
- **Trigger:** When a record is Created
- **Condition:** Who_Id is not empty
- **Action:** Custom Function → `populate_mirror_fields` (pass {taskId: ${Tasks.Id}})
- Then call: `calculate_priority_score` (pass {taskId: ${Tasks.Id}})

### 3.2 Lead Phone Change Sync
- **Module:** Leads
- **Trigger:** When a record is Edited — field "Phone" is modified
- **Action:** Custom Function (inline):
```
// Find all open tasks for this lead and update Contact_Phone
leadId = input.leadId;
phone = ifnull(input.phone, "");
tasks = zoho.crm.searchRecords("Tasks", "(Who_Id:equals:" + leadId + ")and(Status:not_equal:Completed)");
for each t in tasks
{
    tid = t.get("id");
    updateMap = Map();
    updateMap.put("Contact_Phone", phone);
    zoho.crm.updateRecord("Tasks", tid.toLong(), updateMap);
}
```
- Parameters: leadId = ${Leads.Id}, phone = ${Leads.Phone}

---

## Step 4: Create Scheduled Functions

Go to **Setup > Automation > Schedules**

### 4.1 Daily Morning Score Recalculation
- **Name:** Daily Score Recalc (Morning)
- **Frequency:** Every Day at 7:00 AM
- **Function:** Create new function with code from `deluge/daily_score_recalc.dg`

### 4.2 Daily Mid-day Score Recalculation
- **Name:** Daily Score Recalc (Midday)
- **Frequency:** Every Day at 1:00 PM
- **Function:** Same code as `deluge/daily_score_recalc.dg`

### 4.3 Stuck Task Reset
- **Name:** Stuck Task Reset
- **Frequency:** Every Day at 6:00 PM
- **Function:** Create new function with code from `deluge/stuck_task_reset.dg`

### 4.4 Weekly Reactivation Scan
- **Name:** Weekly Reactivation Scan
- **Frequency:** Every Monday at 8:00 AM
- **Function:** Create new function with code from `deluge/weekly_reactivation_scan.dg`

---

## Step 5: Verify

After setup on each brand:

1. **Create a test task** manually with Who_Id linked to a test lead
   - Verify mirror fields populate automatically
   - Verify Priority_Score is calculated

2. **Walk through the blueprint**:
   - Pick Up the task → verify First_Contacted_At is stamped
   - Try "No Answer" → verify follow-up task is auto-created
   - Try "Connected - Call Back" → verify callback task is created with correct date
   - Try "Connected - Booked" → verify lead status changes

3. **Check the Setter Queue view** → verify tasks appear sorted by Priority_Score

4. **Wait for scheduled functions** or trigger them manually to verify score recalculation

---

## Repeat for All 3 Brands

This entire setup must be done 3 times:
1. **Carisma Spa** CRM
2. **Carisma Aesthetics** CRM
3. **Carisma Slimming** CRM

Use the same Deluge scripts, same blueprint configuration, same workflow rules. The only difference is the treatment field content (spa vs aesthetics vs slimming treatments).
