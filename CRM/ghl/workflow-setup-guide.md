# GHL Workflow Setup Guide — Carisma Setter Task System

> **Last updated:** 2026-04-21
> This guide covers everything to configure in GHL after the Python system is deployed.

---

## Architecture Overview

```
New Meta Lead
     │
     ▼
GHL Workflow: "🌱 New Lead → Webhook"
     │  POST /webhook/lead-optin
     ▼
Python Server (webhook_handler.py)
  → Completes all existing tasks
  → Resets followup_count = 0
  → Creates "First Contact" task (today, priority 100)
  → Patches opportunity monetary value
     │
     ▼
Setter works from Priority Queue Smart List
  Selects outcome when done:
    Follow Up → next follow-up task (1/2/3/7 days)
    Booking   → move to ✅ Booking Won
    Booking Lost → move to ❌ Booking Lost
    Nurture   → move to 🌿 Nurturing
     │
     ▼
GHL Workflow: "📋 Task Outcome → Webhook"
     │  POST /webhook/task-completed
     ▼
Python Server chains next task automatically
```

**Safety net:** Daily orchestrator runs at 8am via cron — fills any gaps, force-closes stale leads, sweeps 120-day dormant contacts.

---

## Step 1: Delete Old Workflows (Manual)

Go to **Automations → Workflows** and delete these 9 legacy workflows:

| Name | ID |
|------|----|
| Setter - Cambio de Stage  Cita No Show | 6357dc2a |
| Setter - Cambio de Stage  Cita Showed | e4be897a |
| Setter - Cambio de Stage - Contactado Conversación | 24d7d7ae |
| Setter - Cambio de Stage - Contactado Cualificado | f4bfba3d |
| Setter - Cambio de Stage - Contactado Nurturing | 9e3bb218 |
| Setter - Cambio de Stage Cita Agendada | d05dd773 |
| Setter - Cambio de Stage Contactado Manual | c689d8d9 |
| Setter -> Asignación de leads | f55d300d |
| Setter -> First Call measure | b3b32765 |

---

## Step 2: Deploy Python Webhook Server

```bash
cd "Carisma AI"
chmod +x CRM/ghl/start_webhook.sh
./CRM/ghl/start_webhook.sh
```

Note your **ngrok public URL** from the output (e.g., `https://abc123.ngrok.io`).

---

## Step 3: Build Workflow 1 — 🌱 New Lead → Webhook

**Purpose:** Every new lead that enters the "🌱 New Leads" stage instantly gets a First Contact task.

**In GHL Automations → Create Workflow:**

**Name:** `🌱 New Lead → First Contact Task`

**Trigger:**
- Type: `Opportunity Stage Changed`
- Pipeline: `Booking Pipeline`
- Stage: `🌱 New Leads`

**Actions (in order):**

1. **Webhook** action
   - URL: `https://<your-ngrok-url>/webhook/lead-optin`
   - Method: POST
   - Body (JSON):
     ```json
     {
       "contactId":     "{{contact.id}}",
       "contactName":   "{{contact.name}}",
       "opportunityId": "{{opportunity.id}}",
       "assignedTo":    "{{opportunity.assignedTo}}",
       "utmContent":    "{{contact.utm_content}}",
       "utmCampaign":   "{{contact.utm_campaign}}",
       "formName":      "{{contact.source}}",
       "brand":         "aesthetics"
     }
     ```

**Publish** the workflow.

---

## Step 4: Build Workflow 2 — 📋 Task Outcome Handler

**Purpose:** When a setter marks a task complete with an outcome, fire the webhook to chain the next task.

**Name:** `📋 Task Outcome → Chain Next Task`

**Trigger:**
- Type: `Contact Field Changed`
- Field: `task_outcome` (the custom field)

**Actions:**

1. **Webhook** action
   - URL: `https://<your-ngrok-url>/webhook/task-completed`
   - Method: POST
   - Body (JSON):
     ```json
     {
       "contactId":     "{{contact.id}}",
       "contactName":   "{{contact.name}}",
       "opportunityId": "{{opportunity.id}}",
       "taskOutcome":   "{{contact.task_outcome}}",
       "taskType":      "{{contact.task_type}}",
       "followupCount": "{{contact.followup_count}}",
       "assignedTo":    "{{opportunity.assignedTo}}"
     }
     ```

**Publish** the workflow.

---

## Step 5: Build Workflow 3 — 🌿 Nurturing 90-Day Re-engagement

**Purpose:** 90 days after a lead enters Nurturing, if they're still there and have no open task, create a re-engagement task.

**Name:** `🌿 Nurturing 90-Day Re-engagement`

**Trigger:**
- Type: `Opportunity Stage Changed`
- Pipeline: `Booking Pipeline`
- Stage: `🌿 Nurturing`

**Actions:**

1. **Wait** — 90 days

2. **If/Else** — Condition: Opportunity stage is still `🌿 Nurturing`
   - **YES branch:**
     1. **Webhook** action
        - URL: `https://<your-ngrok-url>/webhook/lead-optin`
        - Method: POST
        - Body:
          ```json
          {
            "contactId":     "{{contact.id}}",
            "contactName":   "{{contact.name}}",
            "opportunityId": "{{opportunity.id}}",
            "assignedTo":    "{{opportunity.assignedTo}}",
            "brand":         "aesthetics"
          }
          ```

**Publish** the workflow.

---

## Step 6: Configure Setter Dropdown — task_outcome field

The setter needs a dropdown on the contact to record their outcome. This drives Workflow 2.

**In GHL → Settings → Custom Fields → Contacts:**

If `task_outcome` doesn't exist yet:
- Name: `Task Outcome`
- API Key: `task_outcome`
- Type: `Single Dropdown`
- Options (exact values — case sensitive):
  - `Follow Up`
  - `Booking`
  - `Booking Lost`
  - `Nurture`
  - `Lost`

---

## Step 7: Create Smart Lists

### Smart List 1 — 🎯 Priority Queue (Setter Daily View)

This is the main view setters open every morning.

**In GHL → Contacts → Saved Filters → Create New:**

**Name:** `🎯 Priority Queue`

**Filters:**
- `Task Status` = `incomplete` (has open task)
- `Task Due Date` = `on or before today`
- `Opportunity Stage` ≠ `✅ Booking Won`
- `Opportunity Stage` ≠ `❌ Booking Lost`

**Sort by:** Custom field `priority_score` → Descending

**Columns to show:** Name, Phone, Stage, Task, Task Due, Priority Score, Task Type

---

### Smart List 2 — 🌿 Nurturing Queue

**Name:** `🌿 Nurturing Queue`

**Filters:**
- `Opportunity Stage` = `🌿 Nurturing`
- `Task Status` = `incomplete`
- `Task Due Date` = `on or before today`

**Sort by:** `Date Added` → Ascending (oldest first)

---

## Step 8: Configure Daily Orchestrator Cron (8am)

Add to crontab:

```bash
crontab -e
```

Add line:
```
0 8 * * * cd "/path/to/Carisma AI/CRM" && python3 -m ghl.daily_orchestrator >> /tmp/ghl_orchestrator.log 2>&1
```

Or test manually:
```bash
cd "Carisma AI/CRM"
python3 -m ghl.daily_orchestrator --dry-run   # preview
python3 -m ghl.daily_orchestrator             # live run
```

---

## Step 9: Register Webhooks in GHL (Alternative trigger method)

For immediate real-time firing without building GHL workflows, register webhooks directly:

**GHL → Settings → Integrations → Webhooks → Add Webhook:**

| Event | URL |
|-------|-----|
| TaskCompleted | `https://<ngrok-url>/webhook/task-completed` |
| OpportunityCreated | `https://<ngrok-url>/webhook/lead-optin` |
| OpportunityStageChanged | `https://<ngrok-url>/webhook/lead-optin` |

> **Note:** Using native GHL webhooks (Settings → Integrations) rather than workflow-embedded webhooks is simpler and fires for all contacts automatically. The workflow approach (Steps 3-5) gives you more control over which events trigger.

---

## Custom Fields Required on Contact

| Field Name | API Key | Type | Values |
|-----------|---------|------|--------|
| Task Type | `task_type` | Text | Set automatically |
| Task Outcome | `task_outcome` | Dropdown | Follow Up, Booking, Booking Lost, Nurture, Lost |
| Priority Score | `priority_score` | Number | Set automatically (10–100) |
| Follow-up Count | `followup_count` | Number | Set automatically (0–4) |

---

## Priority Score Reference

| Task Type | Score | Due |
|-----------|-------|-----|
| First Contact | 100 | Today |
| Reschedule Call | 95 | Today |
| Scheduled Callback | 90 | As set |
| Follow-up 1 | 70 | +1 day |
| Follow-up 2 | 60 | +2 days |
| Follow-up 3 | 50 | +3 days |
| Follow-up 4 | 40 | +7 days |
| Nurturing Re-engagement | 20 | Today |
| Reactivation | 10 | Today |

---

## Testing End-to-End

```bash
# 1. Start webhook server with ngrok
./CRM/ghl/start_webhook.sh

# 2. Simulate a new lead opt-in
curl -X POST http://localhost:8000/webhook/lead-optin \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "<real-contact-id>",
    "contactName": "Test Lead",
    "opportunityId": "<real-opp-id>",
    "brand": "aesthetics"
  }'

# 3. Simulate a Follow Up outcome
curl -X POST http://localhost:8000/webhook/task-completed \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "<real-contact-id>",
    "contactName": "Test Lead",
    "taskOutcome": "Follow Up",
    "taskType": "First Contact",
    "followupCount": 0
  }'

# 4. Run the daily orchestrator dry-run
cd CRM && python3 -m ghl.daily_orchestrator --dry-run
```
