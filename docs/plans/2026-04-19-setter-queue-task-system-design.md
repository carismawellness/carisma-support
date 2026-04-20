# Setter Queue Task System — Design Document

**Date:** 2026-04-19
**Status:** Approved
**Scope:** All 3 Zoho CRM orgs (Spa, Aesthetics, Slimming)

## Overview

Redesign the Zoho CRM Tasks module into a priority-driven "Setter Queue" — a single list view where setters work top-to-bottom, calling leads in algorithmically-determined order. Blueprint transitions guide every call outcome and auto-create follow-up tasks.

## Architecture: Mirror Fields + Priority Score + Blueprint

- **Mirror fields** on Tasks bring Lead data (name, phone, treatment) into the task list view
- **Priority_Score** (integer) drives sort order — calculated by Deluge custom functions
- **Blueprint** enforces the call lifecycle with 11 transitions
- **All automation logic lives inside blueprint custom functions** (no overlapping workflow rules)

---

## 1. Custom Fields to Add to Tasks Module

### New Fields (all 3 brands)

| API Name | Display Label | Type | Notes |
|---|---|---|---|
| `Priority_Score` | Priority Score | Integer | Workflow-calculated, drives sort |
| `Attempt_Number` | Attempt | Integer | e.g., 3 (of 5 max) |
| `Brand_Mirror` | Brand | Single-line (100) | Mirror from Lead.Brand |
| `Contact_First_Name` | First Name | Single-line (100) | Mirror from Lead.First_Name |
| `Contact_Last_Name` | Last Name | Single-line (100) | Mirror from Lead.Last_Name |
| `Contact_Phone` | Phone | Single-line (50) | Mirror from Lead.Phone or Lead.Mobile |
| `Interested_Treatment` | Treatment | Single-line (255) | Mirror from Lead.What_are_you_mainly_looking_to_treat |
| `Setter_Notes` | Notes | Multi-line (2000) | Setter fills manually during/after call |
| `Lead_Temperature_Mirror` | Lead Temp | Picklist | Hot, Warm, Nurture |
| `Lead_Source_Mirror` | Lead Source | Single-line (100) | Mirror from Lead.Lead_Source |
| `Last_Contacted_Mirror` | Last Contacted | DateTime | Mirror from Lead.Last_Activity_Time |
| `First_Contacted_At` | First Contacted At | DateTime | Auto-stamped on "Pick Up" transition |

### Existing Fields to Standardize

Add to **Spa** and **Slimming** (already exist on Aesthetics):

| API Name | Display Label | Type | Picklist Values |
|---|---|---|---|
| `Stage` | Stage | Picklist | Booking Closed Lost, Booking Closed Won, Consultation - Follow Up, Consultation Won, Consultation Closed Lost, Booking - Follow Up, Existing customer Info, Interested-in Future |
| `follow_Up_Date` | Follow Up Date | Date | — |
| `Follow_Up_Reason` | Follow Up Reason | Picklist | Missed, Disconnected, Needs more time |

### Leads Module Gap

**Spa** needs a new field: `What_are_you_mainly_looking_to_treat` (Single-line text, 255 chars) — already exists on Aesthetics and Slimming.

### Standardized Status Picklist (all 3 brands)

| Value | Meaning |
|---|---|
| Not Started | Task created, not yet touched |
| In Progress | Setter is actively working this |
| Waiting for Input | Blocked on something external |
| Completed | Done — booked or closed |
| Deferred | Pushed to later |

Remove: "Follow-up not required" (Spa), "Follow Up Required" (Aesthetics).

### Updated Task_Outcome Picklist (all 3 brands)

| Value |
|---|
| Connected - Booked |
| Connected - Call Back |
| Connected - Needs Info |
| Connected - Thinking |
| Connected - Reschedule |
| Connected - Not Interested |
| No Answer |
| Voicemail Left |
| Wrong Number |
| Inbound Received |

---

## 2. Setter Queue — Custom View

**View Name:** Setter Queue
**Filter:** Status != Completed AND Status != Deferred
**Sort:** Priority_Score DESC, Due_Date ASC
**Default:** Set as default view for setter users

### Column Order (16 columns)

| # | Column | API Name |
|---|---|---|
| 1 | Priority Score | `Priority_Score` |
| 2 | Task Type | `Task_Type` |
| 3 | Attempt | `Attempt_Number` |
| 4 | Brand | `Brand_Mirror` |
| 5 | First Name | `Contact_First_Name` |
| 6 | Last Name | `Contact_Last_Name` |
| 7 | Phone | `Contact_Phone` |
| 8 | Treatment | `Interested_Treatment` |
| 9 | Due Date | `Due_Date` |
| 10 | Callback Time | `Callback_Date_Time` |
| 11 | Last Outcome | `Task_Outcome` |
| 12 | Notes | `Setter_Notes` |
| 13 | Lead Temp | `Lead_Temperature_Mirror` |
| 14 | Lead Source | `Lead_Source_Mirror` |
| 15 | Last Contacted | `Last_Contacted_Mirror` |
| 16 | Status | `Status` |

---

## 3. Priority Algorithm

### Base Scores

| Task Type | Base Score |
|---|---|
| First Contact (new lead) | 100 |
| Scheduled Callback | 95 |
| Post-Interest Follow-up (Needs Info) | 75 |
| Post-Interest Follow-up (Thinking) | 65 |
| Follow-up 1 | 60 |
| Follow-up 2 | 50 |
| Follow-up 3 | 40 |
| Final Attempt | 30 |
| Reactivation (90-day) | 25 |
| Reactivation (180-day) | 15 |

### Bonus Modifiers

| Condition | Modifier |
|---|---|
| Overdue (Due_Date < today) | +15 |
| Callback time passed (Callback_Date_Time < now) | +10 |
| Lead Temperature = Hot | +5 |
| Lead Temperature = Warm | +2 |
| Due today | +3 |

### Implementation

Calculated by Deluge custom function. Recalculated on:
- Task creation (via mirror field workflow)
- Blueprint transitions (built into each function)
- Daily scheduled function at 7:00 AM and 1:00 PM (Malta time)

Uses `zoho.crm.bulkUpdate` for scheduled recalculations (50x API efficiency).

---

## 4. Blueprint Lifecycle

### State Machine

```
Not Started → [Pick Up] → In Progress → [11 outcome transitions] → Completed
```

### Transitions

| # | Transition | Required Fields | After-Transition Actions |
|---|---|---|---|
| 1 | Pick Up | — | Stamp `First_Contacted_At`, set `Attempt_Number` |
| 2 | Connected - Booked | `Setter_Notes` | Lead → "Moved to Deal", suggest Deal creation |
| 3 | Connected - Call Back | `Callback_Date_Time`, `Setter_Notes` | Auto-create Scheduled Callback task |
| 4 | Connected - Needs Info | `Setter_Notes` | Auto-create Post-Interest follow-up (due tomorrow) |
| 5 | Connected - Thinking | `Setter_Notes` | Auto-create Post-Interest follow-up (due +2 days) |
| 6 | Connected - Reschedule | `Setter_Notes` | Auto-create booking follow-up (due tomorrow) |
| 7 | Connected - Not Interested | `Setter_Notes` | Lead → "Lost Lead", temp → Nurture |
| 8 | No Answer | — | Auto-create next in follow-up ladder |
| 9 | Voicemail Left | — | Same as No Answer |
| 10 | Wrong Number | `Setter_Notes` | Lead → "Junk Lead", no follow-up |
| 11 | Inbound Received | `Setter_Notes` | Route to appropriate next step |

### Follow-up Ladder (72-hour compression)

| From | Next Task Type | Due |
|---|---|---|
| First Contact → No Answer | Follow-up 1 | +4 hours (same day) |
| Follow-up 1 → No Answer | Follow-up 2 | +1 day |
| Follow-up 2 → No Answer | Follow-up 3 | +2 days |
| Follow-up 3 → No Answer | Final Attempt | +3 days |
| Final Attempt → No Answer | None | Lead → "Contact in Future" |

### Safety Guards in All Auto-Create Functions

1. **Duplicate guard:** Check for existing open tasks for same Lead before creating
2. **Phone guard:** Skip task creation if Lead has no Phone AND no Mobile
3. **`ifnull()` everything:** Null-safe field access in all Deluge functions

---

## 5. Automation Architecture

### Blueprint Custom Functions (primary logic — 11 functions)

Each transition has its own Deluge function handling:
- Setting Task_Outcome
- Updating parent Lead status
- Creating follow-up tasks (with duplicate guard)
- Copying mirror fields to new tasks
- Calculating Priority_Score on new tasks

### Workflow Rules (2 only — no overlap with blueprint)

| Rule | Trigger | Action |
|---|---|---|
| Mirror Fields on Manual Task | Task created (no blueprint) | Custom function: read Who_Id Lead, populate mirror fields |
| Lead Phone Change Sync | Lead.Phone updated | Custom function: update Contact_Phone on all open related Tasks |

### Scheduled Functions (4)

| Function | Schedule | Action |
|---|---|---|
| Morning Score Recalc | Daily 7:00 AM | bulkUpdate Priority_Score for all open tasks |
| Mid-day Score Recalc | Daily 1:00 PM | Same — catches morning web leads |
| Stuck Task Reset | Daily 6:00 PM | Tasks In Progress >2 hours → Not Started |
| Reactivation Scan | Monday 8:00 AM | Create tasks for leads inactive 90+ and 180+ days |

---

## 6. Cross-Brand Consistency

All 3 brands get identical:
- Custom field set on Tasks
- Blueprint with same transitions
- Custom view "Setter Queue" with same columns
- Same workflow rules and scheduled functions
- Same Deluge custom functions

Only difference: treatment field values will naturally differ per brand (spa treatments vs aesthetics vs slimming).

---

## 7. GDPR Compliance

- Field-level security on `Setter_Notes`: restricted to Setter and Manager roles
- Blueprint transition screens include guidance: "Do not record medical details. Log treatment interest only."
- Notes are activity-level data, not health records — keep them factual and treatment-focused

---

## 8. Reporting Enabled By This Design

| Metric | How |
|---|---|
| Speed-to-lead | `First_Contacted_At` - Lead.Created_Time |
| Setter conversion rate | Tasks with outcome "Booked" / total tasks per setter |
| Attempt distribution | Aggregate by Attempt_Number |
| No-answer rate | Tasks with outcome "No Answer" / total |
| Lead source quality | Conversion rate grouped by Lead_Source_Mirror |
| Follow-up effectiveness | Conversion rate by Task_Type |
| Reactivation ROI | Bookings from Reactivation tasks |

---

## Implementation Order

1. Create custom fields on Tasks (all 3 brands)
2. Create treatment field on Spa Leads
3. Standardize Status and Task_Outcome picklists (all 3 brands)
4. Add Stage/Follow Up Date/Follow Up Reason to Spa and Slimming Tasks
5. Create "Setter Queue" custom view (all 3 brands)
6. Create Blueprint on Tasks (all 3 brands)
7. Create Deluge custom functions for each transition
8. Create workflow rules (2)
9. Create scheduled functions (4)
10. Final QC: verify consistency across all 3 brands
