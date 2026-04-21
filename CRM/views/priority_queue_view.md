# Priority Queue View — Zoho CRM Setup

This is the view reps work from every day. It shows only their open tasks, ordered by priority, with the highest-priority task always at the top.

## Create the View

**Go to:** Activities module → Tasks → click the view dropdown → "Create View"

### View Name
`My Priority Queue`

### Filters (ALL must be true)
| Field | Condition | Value |
|---|---|---|
| Task Owner | is | Current User |
| Status | is not | Completed |
| Status | is not | Deferred |
| Due Date | is before | Tomorrow + 1 day (or "Today and Overdue") |

### Sort Order
1. **Priority** — Descending (Highest first)
2. **Due Date** — Ascending (earliest first)

> **Note:** Zoho CRM sorts Priority alphabetically by default (High, Highest, Low, Lowest, Normal). To get the correct order (Highest → High → Normal → Low → Lowest), you need to create a custom numeric field or use a workaround. The recommended workaround: prefix task subjects with a number during creation — the priority field still sorts the view, but it may not be in the exact order. Verify in your Zoho edition.

### Columns to Show
- Subject
- Related To (the deal name)
- Due Date
- Priority
- Task_Type
- Status

### Save as default
Check "Set as default view" so reps land here every time they open Activities.

---

## What Reps See

```
┌──────────────────────────────────────────────────────────────┐
│  MY PRIORITY QUEUE                              8 tasks      │
├──────────────┬──────────────────┬──────────┬───────────────  │
│ Subject      │ Related To       │ Due      │ Priority        │
├──────────────┼──────────────────┼──────────┼─────────────── │
│ 📞 First     │ Anna Borg        │ Today    │ Highest ← START │
│    Contact   │                  │ 09:00    │ HERE            │
├──────────────┼──────────────────┼──────────┼─────────────── │
│ 🚨 Reschedule│ Maria Cassar     │ Today    │ Highest         │
│    Call      │                  │ 09:00    │                 │
├──────────────┼──────────────────┼──────────┼─────────────── │
│ 📞 Follow-up │ Diana Farrugia   │ Today    │ High            │
│    Day 2     │                  │ 10:00    │                 │
├──────────────┼──────────────────┼──────────┼─────────────── │
│ 📞 Scheduled │ Elena Vella      │ Today    │ High            │
│    Callback  │                  │ 11:00    │                 │
├──────────────┼──────────────────┼──────────┼─────────────── │
│ 📞 Follow-up │ Sara Borg        │ Today    │ Normal          │
│    Day 3     │                  │ 14:00    │                 │
├──────────────┼──────────────────┼──────────┼─────────────── │
│ 🔴 FINAL     │ Lara Mifsud      │ Today    │ Low             │
│    Attempt   │                  │ 14:00    │                 │
├──────────────┼──────────────────┼──────────┼─────────────── │
│ ♻ Reactivation│ Carmen Scicluna │ Today    │ Lowest          │
│              │                  │          │                 │
└──────────────┴──────────────────┴──────────┴─────────────── ┘
```

Rep works **top to bottom**. No decisions needed about who to call next.

---

## Rep Workflow From This View

1. Click the top task
2. Open the linked Deal (click "Related To")
3. Make the call / send the WhatsApp
4. Return to the task
5. Click **"Mark as Complete"**
6. Set **Task_Outcome** (the dropdown — this is mandatory)
7. If outcome = "Connected - Call Back", fill **Callback_Date_Time**
8. Save → Blueprint transition buttons appear on the Deal
9. Click the correct Blueprint transition
10. Return to Priority Queue → next task is now at the top

---

## Manager View: Team Pipeline Health

Create a second view for managers only:

**View Name:** `Team Pipeline Health`

**Filters:**
| Field | Condition | Value |
|---|---|---|
| Status | is not | Completed |
| Due Date | is before | Today |

**Sort:** Owner → Due Date ascending

This shows all overdue tasks across the team — your lead indicator for reps falling behind.
