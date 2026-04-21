# GHL — Carisma Knowledge Base & Automation System

Go High Level (GHL) knowledge base and task automation system for all three Carisma brands. Includes complete API documentation, platform knowledge, agent skills, templates, and the Aesthetics setter queue automation.

---

## Knowledge Base

Start here for any GHL work:

| File | Contents |
|------|----------|
| `knowledge/api-reference.md` | All v2 endpoints, auth, pagination, error codes |
| `knowledge/platform-overview.md` | GHL features, channels, AI, automation |
| `knowledge/webhooks-automation.md` | Webhook events, payloads, workflow triggers/actions |
| `knowledge/best-practices.md` | Custom fields, merge tags, SMS/email compliance |
| `knowledge/carisma-setup.md` | Carisma-specific IDs, pipelines, env vars |
| `knowledge/mcp-tool-reference.md` | All 200+ MCP tools by category |
| `workflows/setup-new-pipeline.md` | SOP: create a new pipeline |
| `workflows/data-operations.md` | Common data patterns with code examples |
| `templates/pipeline-stages.md` | Pipeline configs for all 3 brands |
| `templates/message-templates.md` | SMS/email templates with merge tags |
| `skills/ghl-operator.md` | Agent skill: how Claude operates GHL |

---

## Setter Queue Automation (Aesthetics)

Priority-ordered task queue for the setter team. Every contact always has exactly one open task. Reps work top-to-bottom with zero decision-making required.

---

## How It Works

1. **Priority Queue** — Tasks have a numeric `priority_score`. Higher = shown first.
2. **Task Chaining** — When a setter marks a task complete and sets the outcome, the next task is auto-created.
3. **Daily Orchestrator** — Runs at 8am as a safety net. Fills any gaps, force-closes stale leads, and triggers the reactivation sweep.
4. **Webhook Handler** — FastAPI server that receives GHL task-completed events and chains the next task in real time.

---

## Setup

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure credentials

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required:
- `GHL_API_KEY` — Private integration key from GHL → Settings → Integrations → API Keys
- `GHL_LOCATION_ID` — Sub-account location ID (visible in the URL when inside a location)

### 3. Create custom fields in GHL

Go to **Settings → Custom Fields** and create these on **Contacts**:

| Field Label | Field Key | Type | Notes |
|---|---|---|---|
| Followup Count | `followup_count` | Number | Incremented on each No Answer |
| Task Type | `task_type` | Text | Current active task type |
| Task Outcome | `task_outcome` | Dropdown | See outcomes list below |
| Priority Score | `priority_score` | Number | 10–100, used for queue sorting |

**Task Outcome dropdown values:**
- No Answer
- Connected - Call Back
- Connected - Interested
- Connected - Booked
- Connected - Reschedule
- Connected - Not Interested

### 4. Name your pipeline stages to match exactly

The orchestrator looks for these stage names (case-sensitive):
- `New Lead`
- `Contacted`
- `Consultation Scheduled`
- `No Show`
- `Booking Confirmed`
- `Consultation Lost`
- `Booking Lost`

---

## Running the Daily Orchestrator

```bash
# Dry run (preview only, no changes)
python -m ghl.daily_orchestrator --dry-run

# Live run
python -m ghl.daily_orchestrator

# Skip reactivation sweep
python -m ghl.daily_orchestrator --skip-reactivation
```

**To schedule at 8am daily (cron):**

```cron
0 8 * * * cd /path/to/project && python -m ghl.daily_orchestrator >> logs/orchestrator.log 2>&1
```

**Via n8n:** Add a Schedule trigger (cron `0 8 * * *`) → Execute Command node.

---

## Running the Webhook Server

```bash
uvicorn ghl.webhook_handler:app --host 0.0.0.0 --port 8000
```

Health check: `GET /health`

Webhook endpoint: `POST /webhook/task-completed`

---

## Configuring the Webhook in GHL

### Option A — GHL Webhook (native)

1. GHL → Settings → Integrations → Webhooks
2. Add webhook URL: `https://your-domain.com/webhook/task-completed`
3. Event: **Task** (if available in your GHL plan)

### Option B — GHL Workflow (recommended)

1. Automations → Workflows → Create Workflow
2. Trigger: **Task Status Changed** (or "Task Completed")
3. Action: **Webhook** → POST to `https://your-domain.com/webhook/task-completed`
4. Map these fields in the webhook body:
   ```json
   {
     "contactId": "{{contact.id}}",
     "contactName": "{{contact.name}}",
     "opportunityId": "{{opportunity.id}}",
     "taskId": "{{task.id}}",
     "taskTitle": "{{task.title}}",
     "taskOutcome": "{{contact.task_outcome}}",
     "taskType": "{{contact.task_type}}",
     "followupCount": "{{contact.followup_count}}",
     "assignedTo": "{{task.assignedTo}}",
     "callbackDate": "{{contact.callback_date}}"
   }
   ```

---

## Priority Scores Reference

| Task Type | Score | Priority |
|---|---|---|
| First Contact | 100 | Highest |
| Reschedule Call | 100 | Highest |
| Scheduled Callback | 90 | Very High |
| Post-Contact Follow-up | 80 | High |
| Follow-up 1 | 70 | Medium-High |
| Follow-up 2 | 60 | Medium |
| Follow-up 3 | 50 | Normal |
| Final Attempt | 40 | Low |
| Reactivation | 10 | Lowest |

---

## Task Chaining Logic

| Outcome | Current Task | Next Task |
|---|---|---|
| No Answer | First Contact | Follow-up 1 |
| No Answer | Follow-up 1 | Follow-up 2 |
| No Answer | Follow-up 2 | Follow-up 3 |
| No Answer | Follow-up 3 | Final Attempt |
| No Answer | Final Attempt | *(mark lost)* |
| Connected - Call Back | Any | Scheduled Callback |
| Connected - Interested | Any | Post-Contact Follow-up |
| Connected - Reschedule | Any | Reschedule Call |
| Connected - Booked | Any | *(won — no task)* |
| Connected - Not Interested | Any | *(lost — no task)* |

---

## File Structure

```
CRM/ghl/
│
├── knowledge/                        ← GHL knowledge base
│   ├── api-reference.md
│   ├── platform-overview.md
│   ├── webhooks-automation.md
│   ├── best-practices.md
│   ├── carisma-setup.md
│   └── mcp-tool-reference.md
│
├── workflows/                        ← SOPs
│   ├── setup-new-pipeline.md
│   └── data-operations.md
│
├── skills/
│   └── ghl-operator.md
│
├── templates/
│   ├── pipeline-stages.md
│   └── message-templates.md
│
├── __init__.py
├── client.py             — GHL API wrapper (contacts, opps, tasks)
├── config.py             — All constants (stages, scores, subjects)
├── task_engine.py        — Core logic: chaining, priority, creation
├── daily_orchestrator.py — 8am safety net script
├── webhook_handler.py    — FastAPI webhook endpoint
├── requirements.txt
├── .env.example
└── README.md
```
