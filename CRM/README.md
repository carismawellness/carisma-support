# Carisma Aesthetics — CRM System

Single source of truth for the Zoho CRM task-driven pipeline for Carisma Aesthetics.

## Folder Structure

```
CRM/
├── README.md                         ← You are here
├── scripts/
│   ├── daily_orchestrator.py         ← Run every morning (main entry point)
│   ├── priority_task_manager.py      ← Creates the correct task for a deal
│   └── reactivation_engine.py        ← Finds dormant leads and queues them
├── blueprints/
│   └── aesthetics_blueprint_setup.md ← Step-by-step UI guide to configure Blueprint
├── views/
│   └── priority_queue_view.md        ← How to set up the rep task queue view
└── skills/
    └── crm-aesthetics.md             ← Agent skill: how Claude operates this CRM
```

## Pipeline Stages

```
NEW LEAD ──→ CONTACTED ──→ CONSULTATION SCHEDULED ──→ BOOKING CONFIRMED ✓
   │              │                  │
   │              │                  ├──→ BOOKING LOST ✗
   │              │                  └──→ NO SHOW ──→ Rescheduled or CONSULTATION LOST ✗
   │              └──→ CONSULTATION LOST ✗
   └──→ CONSULTATION LOST ✗ (after 4 no-answers)
```

## Priority Algorithm

Tasks are created with the following priority levels so the rep's queue is always correct:

| Situation | Task Type | Zoho Priority | Due |
|---|---|---|---|
| New lead arrives | First Contact | **Highest** | NOW |
| No answer on Day 1 | Follow-up 1 | **High** | +1 day |
| No answer on Day 2 | Follow-up 2 | **Normal** | +1 day |
| No answer on Day 3 | Follow-up 3 | **Normal** | +4 days |
| No answer on Day 7 | Final Attempt | **Low** | today |
| Connected, not booked | Post-Contact Follow-up | **High** | +1 day |
| Lead said "call me back" | Scheduled Callback | **High** | specified date |
| No-show on consultation | Reschedule Call | **Highest** | NOW |
| Old lead (120+ days) | Reactivation | **Lowest** | today |

**The rep always sees:** Highest → High → Normal → Low → Lowest

## One-Task-at-a-Time System

Tasks are not pre-created. Each task is created ONLY when the previous task is completed and an outcome is logged. The rep's queue naturally shows only their current task — the next one doesn't exist yet.

This is enforced by:
1. Workflow rules that create the next task on task completion (based on Task_Outcome)
2. The daily orchestrator that fills in any gaps (deals with no open tasks)

## Running the Scripts

```bash
# Daily run (every morning at 8am)
python3 CRM/scripts/daily_orchestrator.py

# Preview without making changes
python3 CRM/scripts/daily_orchestrator.py --dry-run

# Reactivation only
python3 CRM/scripts/reactivation_engine.py

# Create task for a specific deal
python3 CRM/scripts/priority_task_manager.py <deal_id>
```

## Setup Checklist

- [ ] Custom fields deployed on Tasks (Task_Outcome, Task_Type, Callback_Date_Time)
- [ ] Custom fields deployed on Deals (Last_Contact_Attempt, Callback_Requested)
- [ ] Blueprint configured (see `blueprints/aesthetics_blueprint_setup.md`)
- [ ] Workflow rules created in Zoho CRM UI (7 rules — see `blueprints/aesthetics_blueprint_setup.md`)
- [ ] Priority Queue view created in Zoho CRM (see `views/priority_queue_view.md`)
- [ ] Daily orchestrator scheduled (n8n, cron, or Zoho Functions)
- [ ] Reps trained on task-driven workflow (see `skills/crm-aesthetics.md`)

## Key Field IDs (Aesthetics CRM)

| Field | Module | API Name | ID |
|---|---|---|---|
| Task Outcome | Tasks | Task_Outcome | 524228000043855452 |
| Task Type | Tasks | Task_Type | 524228000043857103 |
| Callback Date Time | Tasks | Callback_Date_Time | 524228000043828108 |
| Last Contact Attempt | Deals | Last_Contact_Attempt | 524228000043832086 |
| Callback Requested | Deals | Callback_Requested | 524228000043832105 |
| Followup Number | Deals | Followup_Number | 524228000033280096 |
| Stage | Deals | Stage | 524228000000000547 |
| Loss Reason | Deals | Reason_For_Loss__s | (standard field) |
