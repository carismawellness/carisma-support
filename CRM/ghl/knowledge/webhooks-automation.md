# GHL Webhooks & Workflow Automation

*Last updated: April 2026. Sourced from official GHL documentation.*

---

## 1. Webhook System

### Configuration

**GHL UI path:** Settings → Integrations → Webhooks → Add New Webhook

Enter your endpoint URL and select which event types to subscribe to. GHL fires a POST request to your URL for each subscribed event.

### All Webhook Event Types

**Contact Events**
- `ContactCreate` — new contact created
- `ContactUpdate` — contact fields updated
- `ContactDelete` — contact deleted
- `ContactDndUpdate` — Do Not Disturb status changed
- `ContactTagUpdate` — tag added or removed

**Opportunity Events**
- `OpportunityCreate` — new opportunity created
- `OpportunityUpdate` — opportunity fields updated
- `OpportunityDelete` — opportunity deleted
- `OpportunityStageUpdate` — moved to a different stage
- `OpportunityStatusUpdate` — status changed (open/won/lost/abandoned)
- `OpportunityMonetaryValueUpdate` — monetary value changed
- `OpportunityAssignedToUpdate` — assigned user changed

**Appointment Events**
- `AppointmentCreate` — appointment booked
- `AppointmentUpdate` — appointment modified
- `AppointmentDelete` — appointment deleted/cancelled
- `AppointmentNoShow` — marked as no-show
- `AppointmentRescheduled` — rescheduled to new time

**Invoice/Payment Events**
- `InvoiceCreate` — invoice created
- `InvoiceSent` — invoice sent to contact
- `InvoicePaid` — invoice fully paid
- `InvoicePartiallyPaid` — partial payment received
- `InvoiceVoided` — invoice voided
- `InvoiceOverdue` — invoice past due date
- `InvoicePaymentFailed` — payment attempt failed

**Message/Conversation Events**
- `InboundMessage` — new message received from contact
- `OutboundMessage` — message sent to contact
- `ConversationUnread` — unread conversation threshold reached
- `LiveChatTyping` — contact typing in live chat

**Task Events**
- `TaskCreate` — task created
- `TaskComplete` — task marked complete
- `TaskDelete` — task deleted

**Note Events**
- `NoteCreate` — note added to contact
- `NoteUpdate` — note updated
- `NoteDelete` — note deleted

**User Events**
- `UserCreate` — new staff user created
- `UserUpdate` — user details updated
- `UserDelete` — user removed

**Form/Survey Events**
- `FormSubmission` — form submitted
- `SurveySubmission` — survey submitted

---

### Webhook Payload Structure

Every webhook fires a POST with `Content-Type: application/json`:

```json
{
  "type": "OpportunityStageUpdate",
  "timestamp": "2026-04-22T08:00:00.000Z",
  "webhookId": "wh_abc123",
  "locationId": "loc_xxx",
  "data": {
    // Contact data (for contact events):
    "id": "cont_xxx",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+35699123456",
    "tags": ["lead", "aesthetics"],
    "customFields": [
      { "id": "field_id", "key": "followup_count", "value": "2" }
    ],
    "assignedTo": "user_xxx",
    "locationId": "loc_xxx",
    "source": "form",
    "dateAdded": "2026-04-01T10:00:00.000Z",

    // Opportunity data (for opportunity events):
    "opportunityId": "opp_xxx",
    "pipelineId": "pipe_xxx",
    "pipelineStageId": "stage_xxx",
    "pipelineStageName": "conversacion",
    "status": "open",
    "monetaryValue": 500,
    "contactId": "cont_xxx",

    // Appointment data (for appointment events):
    "appointmentId": "apt_xxx",
    "calendarId": "cal_xxx",
    "startTime": "2026-04-25T10:00:00+02:00",
    "endTime": "2026-04-25T11:00:00+02:00",
    "appointmentStatus": "confirmed",
    "assignedUserId": "user_xxx"
  }
}
```

---

### Security: Webhook Signature Verification

GHL signs every webhook with an Ed25519 signature (current method):

**Header:** `X-GHL-Signature: <base64_signature>`

```python
import base64
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
from cryptography.hazmat.primitives.serialization import load_pem_public_key

GHL_PUBLIC_KEY = """-----BEGIN PUBLIC KEY-----
<your_public_key_from_ghl_settings>
-----END PUBLIC KEY-----"""

def verify_webhook(request_body: bytes, signature_header: str) -> bool:
    try:
        pub_key = load_pem_public_key(GHL_PUBLIC_KEY.encode())
        signature = base64.b64decode(signature_header)
        pub_key.verify(signature, request_body)
        return True
    except Exception:
        return False
```

> Legacy `X-WH-Signature` (RSA-SHA256) header is deprecated and will be removed July 2026.

---

### Retry Behavior

- GHL only retries on HTTP `429` responses (6 retries, 10-minute intervals with jitter)
- HTTP `5xx` is treated as a **permanent failure** — GHL does **not** retry
- Always return `200` immediately on receipt, process async
- Use `deliveryId` header for idempotency (prevent duplicate processing)

```python
# FastAPI pattern — return 200 immediately, process async
@app.post("/webhook")
async def handle_webhook(request: Request, background_tasks: BackgroundTasks):
    body = await request.json()
    background_tasks.add_task(process_event, body)
    return {"status": "received"}
```

---

## 2. Workflow Automation

### Workflow Triggers (90+)

**Contact Triggers**
- Contact Created
- Contact Changed (any field)
- Tag Added / Tag Removed
- DND Status Changed
- Birthday Reminder (N days before)
- Smart List Entry / Exit
- Custom Date Field (relative trigger)
- Contact Score Updated
- Custom Webhook Received (inbound)

**Communication Triggers**
- Inbound Message Received (SMS/Email/WhatsApp/IG/FB/GMB/LiveChat)
- Missed Call
- Voicemail Received
- Email Opened / Email Clicked
- Link Clicked
- Outbound Call Status (answered/busy/no answer)
- Live Chat Widget Opened
- Google Review Received
- Facebook/Instagram Comment/DM

**Appointment Triggers**
- Appointment Booked
- Appointment Cancelled
- Appointment Rescheduled
- Appointment No-Show
- Appointment Status Changed
- Appointment Reminder (N days/hours before)
- Service Booking Created/Updated

**Opportunity Triggers**
- Opportunity Created
- Opportunity Stage Changed
- Opportunity Status Changed (Won/Lost)
- Opportunity Monetary Value Changed
- Opportunity Assigned To Changed

**Payment/Invoice Triggers**
- Invoice Created / Sent / Paid / Overdue / Failed
- Order Created / Fulfilled
- Subscription Created / Renewed / Cancelled
- Payment Received

**Form/Survey Triggers**
- Form Submitted
- Survey Submitted

---

### Workflow Actions (All Categories)

**Communication**
- Send SMS
- Send Email
- Send WhatsApp Message
- Send Instagram DM
- Send Facebook DM
- Send GMB Message
- Make Outbound Call
- Drop Voicemail
- Send Internal Notification (to staff)
- Send Slack Notification
- Send Review Request

**CRM Updates**
- Add Tag / Remove Tag
- Update Contact Field
- Update Opportunity (stage, value, status, assignee)
- Create Opportunity
- Create Task
- Update Task (complete, assign)
- Add Note to Contact
- Assign Contact to User
- Remove Contact from Workflow
- Add to / Remove from Smart List

**Scheduling**
- Create Appointment
- Cancel Appointment
- Update Appointment

**Payments**
- Send Invoice
- Charge Credit Card (stored payment method)

**AI Actions**
- AI Conversation Response (Conversation AI replies)
- Intent Detection (classify message → branch)
- AI Prompt Response (GPT action — Premium plan)
- Lead Score Update

**Control Flow**
- Wait (time delay: minutes/hours/days/weeks)
- Wait for Event (holds until contact takes action)
- If/Else Branch (conditional logic)
- Go To (jump to another step in same workflow)
- A/B Split Test (percentage-based split)
- End Workflow

**Integrations**
- Webhook (outbound HTTP call to any URL)
- Google Sheet (add/update row)
- Custom Code (JavaScript execution)
- Math Operation (increment/decrement field values)

---

### If/Else Condition Operators

Available operators in If/Else branches:

| Operator | Use |
|----------|-----|
| `is` / `is not` | Exact match |
| `contains` / `does not contain` | Substring match |
| `starts with` / `ends with` | Prefix/suffix match |
| `is empty` / `is not empty` | Field existence |
| `greater than` / `less than` | Numeric comparison |
| `before` / `after` | Date comparison |
| `has tag` / `does not have tag` | Tag check |
| `in stage` / `not in stage` | Pipeline stage check |
| `has appointment` / `no appointment` | Calendar check |

---

### Wait Steps

**Time delay:** Wait a fixed duration before next action.
```
Wait → 24 hours → Send Follow-up SMS
```

**Wait for event:** Pause workflow until the contact takes a specific action (or timeout expires).
```
Wait for: "Email Opened" within 3 days
  → If opened: go to Interested branch
  → If timeout: go to Reminder branch
```

---

### Workflow Design Best Practices

1. **One trigger per intent** — keep workflows focused on a single goal (e.g., "New Lead Onboarding" separate from "Post-Consultation Follow-up")
2. **Use If/Else at decision points** — never chain separate workflows when branching logic applies
3. **Always add a timeout to Wait-for-Event steps** — prevents contacts getting stuck forever
4. **Test with internal contacts before going live** — use a test contact with your own phone/email
5. **Name workflows clearly** — format: `[Brand] [Trigger] [Goal]` e.g., "AES New Lead → Setter Queue"
6. **Use Go To for loops** — e.g., daily check-in until booking confirmed
7. **Set "Don't allow re-enrollment"** on one-shot workflows (welcome sequences, post-purchase) to prevent duplicate sends

---

## 3. Integration Patterns

### GHL + n8n (Recommended for Carisma)

**Receiving GHL webhooks in n8n:**
1. Add "Webhook" trigger node in n8n → copy URL
2. In GHL: Settings → Integrations → Webhooks → add the n8n URL
3. In n8n: parse `{{$json.type}}` to route different event types via Switch node

**Calling GHL API from n8n:**
```json
// HTTP Request node setup
{
  "method": "PUT",
  "url": "https://services.leadconnectorhq.com/contacts/{{$json.contactId}}",
  "headers": {
    "Authorization": "Bearer {{ $env.GHL_API_KEY }}",
    "Version": "2021-07-28",
    "Content-Type": "application/json"
  },
  "body": {
    "customFields": [
      { "key": "followup_count", "value": "{{$json.followupCount}}" }
    ]
  }
}
```

**Native n8n HighLevel node:**
n8n has a built-in "HighLevel" node with OAuth2 auth. Use for: contacts, opportunities, tasks, calendar events. For advanced endpoints not covered by the native node, use HTTP Request.

---

### Custom Outbound Webhook Payload

When using the "Webhook" action in a GHL workflow, map merge fields in the JSON body:

```json
{
  "contactId": "{{contact.id}}",
  "contactName": "{{contact.full_name}}",
  "email": "{{contact.email}}",
  "phone": "{{contact.phone}}",
  "opportunityId": "{{opportunity.id}}",
  "pipelineStage": "{{opportunity.pipeline_stage}}",
  "taskOutcome": "{{contact.custom.task_outcome}}",
  "taskType": "{{contact.custom.task_type}}",
  "followupCount": "{{contact.custom.followup_count}}",
  "assignedTo": "{{assigned_to.id}}",
  "appointmentStart": "{{appointment.start_time}}",
  "locationId": "{{location.id}}"
}
```

---

### Inbound Webhook Trigger

GHL workflows can be triggered by an external system posting to GHL:
1. Create workflow → Trigger: "Custom Webhook"
2. GHL provides a unique URL to POST to
3. External system (n8n, Zapier, your server) POST JSON → GHL fires the workflow

This is the recommended pattern for triggering GHL automations from external code.

---

### Two-Way Sync (Deduplication Pattern)

When syncing between GHL and another system (e.g., Zoho CRM), prevent feedback loops:

```python
# In webhook payload from GHL, include a sync marker:
{
  "sync_source": "ghl",
  "contactId": "...",
  ...
}

# In your sync handler — skip if already came from GHL:
if payload.get("sync_source") == "ghl":
    return  # don't write back to GHL

# When writing TO GHL, mark as sync operation:
client.update_contact(contact_id, {
  "customFields": [
    { "key": "last_sync_source", "value": "zoho" }
  ]
})
```

---

## 4. Quick Reference

### API Base URLs
```
https://services.leadconnectorhq.com    ← main v2 API
https://marketplace.gohighlevel.com     ← OAuth auth endpoint
https://services.leadconnectorhq.com/mcp/  ← MCP server (for AI agent tools)
```

### Required Headers
```http
Authorization: Bearer <token>
Content-Type: application/json
Version: 2021-07-28
```

### Merge Field Syntax Cheat Sheet
```
{{contact.first_name}}              Standard field
{{contact.custom.field_key}}        Custom contact field
{{opportunity.custom.field_key}}    Custom opportunity field
{{appointment.start_time}}          Appointment field
{{location.name}}                   Location/business field
{{user.name}}                       Assigned staff member
{{right_now.little_endian_date}}    Today's date (DD/MM/YYYY)
```
