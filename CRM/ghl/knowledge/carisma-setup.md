# Carisma GHL Setup Reference

This file documents all Carisma-specific GHL configuration: location IDs, pipeline IDs, stage IDs, custom field keys, and API credentials.

---

## Authentication

**Method:** Private Integration Token (PIT)  
**Header:** `Authorization: Bearer <GHL_API_KEY>`  
**Version Header:** `Version: 2021-07-28`  
**Base URL:** `https://services.leadconnectorhq.com`

Credentials are stored in `.env`:
```
GHL_API_KEY=<private integration token>
GHL_LOCATION_ID=<sub-account location ID>
GHL_BASE_URL=https://services.leadconnectorhq.com
```

To get your Location ID: log into GHL → select sub-account → URL will show `locationId=XXXX`.

---

## Sub-Accounts (Locations)

Carisma runs three brands, each as a separate GHL sub-account (location):

| Brand | Location Name | Location ID |
|-------|--------------|-------------|
| Carisma Aesthetics | Carisma Aesthetics | *(run `mcp__ghl__search_locations` to confirm)* |
| Carisma Spa | Carisma Spa & Wellness | *(run `mcp__ghl__search_locations` to confirm)* |
| Carisma Slimming | Carisma Slimming | *(run `mcp__ghl__search_locations` to confirm)* |

**To look up IDs:**
```
ToolSearch → mcp__ghl__search_locations
mcp__ghl__search_locations(query="Carisma")
```

---

## Pipelines

### Aesthetics Pipeline

Pipeline stages (Spanish — must match exactly in code):

| Stage Name | Meaning |
|-----------|---------|
| `lead nuevo` | New lead, first contact not made |
| `contactado dia 1` | Contacted day 1, no answer |
| `contactado dia 2` | Contacted day 2 |
| `contactado dia 3` | Contacted day 3 |
| `contactado dia 7` | Contacted day 7 |
| `conversacion` | Connected and interested |
| `no show` | Scheduled but didn't attend |
| `cita confirmada` | Booking confirmed ✓ |
| `cualificado` | Qualified/won ✓ |
| `showed` | Showed up for consultation ✓ |
| `nurturing` | Long-term nurture |

**To get pipeline and stage IDs:**
```
ToolSearch → mcp__ghl__get_pipelines
mcp__ghl__get_pipelines(locationId="<LOCATION_ID>")
```

---

## Custom Fields

### Aesthetics Contact Custom Fields

| Label | API Key | Type | Purpose |
|-------|---------|------|---------|
| Followup Count | `followup_count` | Number | Tracks no-answer count (0–4) |
| Task Type | `task_type` | Text | Current active task type |
| Task Outcome | `task_outcome` | Dropdown | Last task outcome |
| Priority Score | `priority_score` | Number | Queue sort order (10–100) |

**Task Outcome dropdown values:**
- `No Answer`
- `Connected - Call Back`
- `Connected - Interested`
- `Connected - Booked`
- `Connected - Reschedule`
- `Connected - Not Interested`

**To get custom field IDs:**
```
ToolSearch → mcp__ghl__get_location_custom_fields
mcp__ghl__get_location_custom_fields(locationId="<LOCATION_ID>")
```

---

## Merge Tags (Personalization Variables)

Use these in SMS/email templates and workflow messages:

### Contact Fields
```
{{contact.first_name}}
{{contact.last_name}}
{{contact.full_name}}
{{contact.email}}
{{contact.phone}}
{{contact.address1}}
{{contact.city}}
{{contact.country}}
{{contact.date_of_birth}}
{{contact.company_name}}
{{contact.source}}
{{contact.tags}}
```

### Custom Field Merge Tags
```
{{contact.followup_count}}
{{contact.task_type}}
{{contact.task_outcome}}
{{contact.priority_score}}
```

### Appointment Fields
```
{{appointment.start_time}}
{{appointment.end_time}}
{{appointment.title}}
{{appointment.notes}}
{{appointment.staff_name}}
```

### Location/Business Fields
```
{{location.name}}
{{location.phone}}
{{location.email}}
{{location.address}}
{{location.website}}
```

---

## Webhook Configuration

The task automation webhook is configured in each sub-account under:
**Settings → Integrations → Webhooks**

Or via a Workflow action: **Webhook → POST** to the handler URL.

Expected payload format:
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

## Staff Users & Roles

GHL roles per location:
- **Admin** — Full access to all features
- **User** — Standard rep access (contacts, tasks, conversations)
- **Agency Admin** — Cross-location agency access

To list users: `mcp__ghl__get_location` returns user assignments.

---

## n8n Integration

The daily orchestrator can be scheduled via n8n:
- **Trigger:** Schedule (cron `0 8 * * *`)
- **Action:** Execute Command → `python -m ghl.daily_orchestrator`
- **Or:** HTTP Request → POST to webhook handler

See `Tech/CEO-Cockpit/n8n/` for n8n configuration.

---

## Quick Reference Commands

```bash
# Run daily orchestrator (dry run)
python -m ghl.daily_orchestrator --dry-run

# Run daily orchestrator (live)
python -m ghl.daily_orchestrator

# Start webhook server
uvicorn ghl.webhook_handler:app --host 0.0.0.0 --port 8000

# Install dependencies
pip install -r CRM/ghl/requirements.txt
```

---

## Environment Variables

```bash
# Required
GHL_API_KEY=pit_xxxxxxxxxxxx
GHL_LOCATION_ID=xxxxxxxxxxxxxxxxxxxx

# Optional (defaults shown)
GHL_BASE_URL=https://services.leadconnectorhq.com
```

Copy `.env.example` → `.env` and fill in values before running any scripts.
