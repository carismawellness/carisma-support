# GoHighLevel (GHL) Webhooks & Workflow Automation — Technical Knowledge Base

**Last updated:** April 2026  
**Sources:** Official GHL API docs (marketplace.gohighlevel.com), GHL Support Portal, n8n docs

---

## 1. Webhook System

### 1.1 What GHL Webhooks Are

GHL fires webhooks (HTTP POST requests) to your endpoint URL whenever a specific event occurs in a sub-account or marketplace app. Webhooks are the primary way external systems receive real-time data from GHL without polling the API.

There are two webhook contexts:
- **Marketplace/App webhooks** — Configured at the app level via `Settings → Integrations → Webhooks`. Sent system-wide when any covered event fires.
- **Workflow Webhook Action** — An outbound webhook inside a workflow that fires only when that workflow step is reached (see Section 4).

---

### 1.2 Complete Webhook Event Types

#### Contact Events
| Event Type | Description |
|---|---|
| `ContactCreate` | New contact record created |
| `ContactUpdate` | Any field on a contact changes |
| `ContactDelete` | Contact deleted |
| `ContactDndUpdate` | Contact's Do Not Disturb status toggled |
| `ContactTagUpdate` | Tag added to or removed from a contact |

#### Opportunity Events
| Event Type | Description |
|---|---|
| `OpportunityCreate` | New opportunity created |
| `OpportunityUpdate` | Any field on an opportunity changes |
| `OpportunityDelete` | Opportunity deleted |
| `OpportunityStageUpdate` | Opportunity moved to a new pipeline stage |
| `OpportunityStatusUpdate` | Status changed (open, won, lost, abandoned) |
| `OpportunityAssignedToUpdate` | Opportunity reassigned to a different user |
| `OpportunityMonetaryValueUpdate` | Deal value updated |

#### Appointment Events
| Event Type | Description |
|---|---|
| `AppointmentCreate` | Appointment booked |
| `AppointmentUpdate` | Appointment rescheduled, status changed, etc. |
| `AppointmentDelete` | Appointment deleted |

#### Invoice Events
| Event Type | Description |
|---|---|
| `InvoiceCreate` | New invoice created |
| `InvoiceUpdate` | Invoice updated |
| `InvoiceDelete` | Invoice deleted |
| `InvoiceSent` | Invoice sent to customer |
| `InvoicePaid` | Invoice fully paid |
| `InvoicePartiallyPaid` | Partial payment received |
| `InvoiceVoid` | Invoice voided |

#### Message Events
| Event Type | Description |
|---|---|
| `InboundMessage` | Message received (SMS, email, FB, WhatsApp, etc.) |
| `OutboundMessage` | Message sent from GHL |
| `ProviderOutboundMessage` | Provider-level outbound message |

#### Task Events
| Event Type | Description |
|---|---|
| `TaskCreate` | Task created |
| `TaskComplete` | Task marked as completed |
| `TaskDelete` | Task deleted |

#### Note Events
| Event Type | Description |
|---|---|
| `NoteCreate` | Note added to a contact |
| `NoteUpdate` | Note edited |
| `NoteDelete` | Note deleted |

#### User Events
| Event Type | Description |
|---|---|
| `UserCreate` | New user added to sub-account |
| `UserUpdate` | User profile updated |
| `UserDelete` | User removed |

#### App Events (Marketplace Only)
| Event Type | Description |
|---|---|
| `AppInstall` | Your marketplace app installed on a sub-account |
| `AppUninstall` | App uninstalled |
| `AppUpdate` | App updated to a new version |

#### Additional Events
- `ProductCreate`, `ProductUpdate`, `ProductDelete`
- `PriceCreate`, `PriceUpdate`, `PriceDelete`
- `OrderCreate`, `OrderUpdate`
- `AssociationCreate`, `AssociationDelete`
- `ObjectRecordCreate`, `ObjectRecordUpdate`, `ObjectRecordDelete`

---

### 1.3 Webhook Payload Structure

All GHL webhook payloads share this top-level structure:

```json
{
  "type": "ContactCreate",
  "timestamp": "2026-04-21T10:35:00.000Z",
  "webhookId": "wh_abc123xyz",
  "locationId": "loc_XXXXX",
  "data": { ... }
}
```

**Top-level fields:**

| Field | Type | Description |
|---|---|---|
| `type` | string | Event type (e.g., `ContactCreate`, `OpportunityStageUpdate`) |
| `timestamp` | ISO 8601 string | When the event occurred (UTC) |
| `webhookId` | string | Unique ID for this delivery — use for deduplication |
| `locationId` | string | Sub-account ID that fired the event |
| `data` | object | Event-specific payload (see below) |

**Contact data fields (inside `data`):**

```json
{
  "id": "abc123",
  "firstName": "Jane",
  "lastName": "Doe",
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+35699123456",
  "tags": ["lead", "spa-inquiry"],
  "address1": "123 Main St",
  "city": "Valletta",
  "state": "VLT",
  "country": "MT",
  "postalCode": "VLT1000",
  "timezone": "Europe/Malta",
  "dateCreated": "2026-04-21T10:35:00.000Z",
  "companyName": "Acme",
  "website": "https://example.com",
  "dateOfBirth": "1990-01-15",
  "source": "Facebook Ad",
  "contactType": "lead",
  "gclid": null,
  "customFields": {
    "treatment_interest": "Botox",
    "lead_score": "75"
  }
}
```

**Opportunity data fields (inside `data`):**

```json
{
  "id": "opp_xyz",
  "name": "Jane Doe - Botox",
  "contactId": "abc123",
  "locationId": "loc_XXXXX",
  "pipelineId": "pipe_XXXXX",
  "pipelineStageId": "stage_XXXXX",
  "assignedTo": "user_XXXXX",
  "status": "open",
  "monetaryValue": 350.00,
  "dateAdded": "2026-04-21T10:35:00.000Z",
  "lastStageChangeAt": "2026-04-21T11:00:00.000Z"
}
```

**Context rule:** Contact and location data are always present. Opportunity data is only included when the trigger is opportunity-related. Appointment details are only included when the trigger is appointment-related.

---

### 1.4 Configuring Webhooks in GHL

**Path:** Settings → Integrations → Webhooks (sub-account level)

Steps:
1. Go to the sub-account Settings
2. Click **Integrations** in the left menu
3. Click **Webhooks** (or **Custom Webhooks**)
4. Click **Add Webhook**
5. Enter the endpoint URL
6. Select which event types to subscribe to
7. Save — GHL will begin sending POST requests to that URL

For marketplace apps, webhooks are registered via the developer portal at `marketplace.gohighlevel.com` and scoped to the events your app declares in its manifest.

---

### 1.5 Security & Payload Verification

GHL signs every webhook delivery with two headers. Always verify before processing:

**Current standard — Ed25519 signature:**
```
X-GHL-Signature: <base64-encoded signature>
```
- Verify against GHL's published Ed25519 public key
- Preferred when present; use this going forward

**Legacy — RSA-SHA256 (deprecated July 1, 2026):**
```
X-WH-Signature: <base64-encoded HMAC>
```

**Replay attack prevention:**
- Each payload includes `timestamp` (UTC ISO 8601)
- Each delivery includes a `deliveryId` header for idempotency
- Reject payloads where timestamp is >5 minutes old

**Recommended endpoint logic:**
```python
import base64
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey

def verify_ghl_webhook(request):
    signature = request.headers.get("X-GHL-Signature")
    public_key = Ed25519PublicKey.from_public_bytes(GHL_PUBLIC_KEY_BYTES)
    public_key.verify(base64.b64decode(signature), request.body)
    return True  # raises InvalidSignature if tampered
```

---

### 1.6 Retry Behavior

GHL only retries when your endpoint returns **HTTP 429 (Too Many Requests)**. All other response codes (2xx, 4xx, 5xx) are treated as final — no retry.

| Parameter | Value |
|---|---|
| Trigger condition | HTTP 429 only |
| Retry interval | 10 minutes + randomized jitter |
| Maximum retries | 6 |
| Total retry window | ~1 hour 10 minutes |
| Deduplication header | `deliveryId` |

**Key behaviors:**
- 5xx responses = permanent failure, GHL stops immediately (no retry, no thundering herd)
- Jitter prevents synchronized bursts across many sub-accounts
- Retry logic cannot be disabled per app — design endpoints for idempotency using `deliveryId`

**Best practice:** Always return `200 OK` immediately and process asynchronously. Use `deliveryId` to deduplicate if your worker processes the job more than once.

---

## 2. Workflow Automation (Automations → Workflows)

GHL Workflows are visual automation builders. A workflow consists of one or more **Triggers** (what starts it) and a sequence of **Actions** (what happens).

---

### 2.1 Workflow Triggers — Complete List

GHL has **14 trigger categories** with **90+ individual triggers**.

#### Contact Triggers
| Trigger | Description |
|---|---|
| Contact Created | New contact added to CRM |
| Contact Changed | Specified contact fields change to defined values |
| Contact Tag | Tag added or removed from a contact |
| Contact DND | Do Not Disturb status toggled on/off |
| Birthday Reminder | Fires on/before/after contact's birthday |
| Custom Date Reminder | Fires relative to a custom date field on the contact |
| Note Added | New note added to a contact |
| Note Changed | Existing note edited |
| Task Added | New task created for a contact |
| Task Reminder | Task due-date reminder fires |
| Task Completed | Task marked complete |
| Contact Engagement Score | Engagement score crosses a threshold |

#### Events / Communication Triggers
| Trigger | Description |
|---|---|
| Form Submitted | GHL form submitted |
| Survey Submitted | GHL survey submitted |
| Quiz Submitted | GHL quiz submitted |
| Inbound Webhook | External system POSTs to GHL-provided webhook URL (premium) |
| Trigger Link Clicked | Contact clicks a tracked trigger link |
| Customer Replied | Contact replies to any channel message |
| Email Events | Email opened, clicked, bounced, etc. |
| Call Details | Call completed with outcome data |
| Facebook Lead Form Submitted | FB Lead Ad form submitted |
| TikTok Form Submitted | TikTok lead gen form submitted |
| LinkedIn Lead Form Submitted | LinkedIn Lead Gen form submitted |
| Click To WhatsApp Ads | WhatsApp ad click triggers workflow |
| Video Tracking | Viewer reaches X% of a tracked video |
| Funnel/Website PageView | Contact views a specific page or URL/UTM pattern |
| Number Validation | Phone number validation result |
| Messaging Error — SMS | Outbound SMS returns an error code |
| New Review Received | New review arrives in Reputation module |
| Prospect Generated | New prospect identified |
| External Tracking Event | Custom event from external tracking pixel |
| Scheduler | Cron-like time-based trigger (e.g., daily at 9am) |
| Conversation AI Trigger | AI conversation reaches a condition |
| Custom Trigger | Custom-built trigger via marketplace |

#### Appointment Triggers
| Trigger | Description |
|---|---|
| Customer Booked Appointment | Appointment newly created |
| Appointment Status | Status changes (confirmed, cancelled, no-show, etc.) |
| Service Booking | Service-type appointment booked |
| Rental Booking | Rental/resource booking created |

#### Opportunity Triggers
| Trigger | Description |
|---|---|
| Opportunity Created | New opportunity created |
| Opportunity Status Changed | Status changes (open/won/lost/abandoned) |
| Opportunity Changed | Any field on an opportunity changes |
| Pipeline Stage Changed | Opportunity moved to new stage |
| Stale Opportunities | Opportunity has not moved in X days |

#### Payment Triggers (12)
Invoice paid, invoice sent, subscription started/renewed/cancelled, order placed, charge failed, product purchased, etc.

#### Course Triggers (12)
Course accessed, lesson completed, course completed, offer granted, certificate issued, etc.

#### Affiliate Triggers (4)
Affiliate signed up, conversion attributed, commission earned, etc.

#### Other Trigger Categories
- **Ecommerce Stores** (6): Order created, order fulfilled, cart abandoned, etc.
- **Facebook/Instagram** (2): Comment on post, ad lead form
- **Communities** (5): Member joined, post created, comment added
- **IVR** (1): IVR step completed
- **Certificates** (1): Certificate issued

---

### 2.2 Workflow Actions — Complete List

Actions execute sequentially after the trigger fires. GHL has **13 action categories**.

#### Contact Actions (14)
| Action | Description |
|---|---|
| Create Contact | Add a new contact record |
| Find Contact | Look up existing contact |
| Update Contact Field | Modify any standard or custom field |
| Add Tag | Apply a tag to the contact |
| Remove Tag | Remove a tag from the contact |
| Assign to User | Assign contact to a team member |
| Remove from Workflow | Remove contact from a specific workflow |
| Add to Workflow | Enroll contact in another workflow |
| Add to Campaign | Add contact to a Campaigns nurture sequence |
| Remove from Campaign | Remove contact from a campaign |
| Remove from All Campaigns | Remove contact from every active campaign |
| Manage DND | Set or clear Do Not Disturb |
| Create Task | Create a task assigned to a user |
| Send Internal Notification | Alert team member via app/email |

#### Communication Actions (16)
| Action | Description |
|---|---|
| Send SMS | Send text message to contact |
| Send Email | Send email to contact |
| Send WhatsApp | Send WhatsApp message |
| Send Facebook Message | Send Facebook Messenger message |
| Send Instagram DM | Send Instagram direct message |
| Live Chat Message | Send message in live chat widget |
| Call Connect | Auto-dial contact and connect to agent |
| Voicemail Drop | Leave pre-recorded voicemail |
| Send Email from Custom SMTP | Use external SMTP server |
| Send Review Request | Prompt contact to leave a review |
| Send Document/Contract | Send e-signature document |
| Send Invoice | Send invoice to contact |
| Send Estimate | Send estimate to contact |
| Chat Widget — Set Availability | Toggle chat widget online/offline |
| Manual SMS — Assign to Agent | Queue SMS for manual reply |
| Manual Call — Assign to Agent | Queue call for manual follow-up |

#### Internal Tools / Workflow Control Actions (11)
| Action | Description |
|---|---|
| Wait | Delay workflow execution (time delay or wait-for-event) |
| If/Else | Conditional branching based on contact/opportunity data |
| Go To | Jump to a specific step in the workflow |
| Split Test (A/B) | Send contacts down different paths |
| End Workflow | Stop execution for this contact |
| Remove from Workflow (Self) | Remove contact from the current workflow |
| Set Contact Priority | Mark contact as high/medium/low priority |
| Math Operation | Perform arithmetic on a numeric custom field |
| Custom Code (JS) | Execute JavaScript with contact data |
| Date/Time Formatter | Format date fields for downstream use |
| Conversation AI | Invoke AI to handle conversation |

#### Wait Step Details
Two wait modes:
- **Time Delay**: Wait X minutes/hours/days/weeks before proceeding
- **Wait for Event**: Pause until a specific event occurs (e.g., contact replies, appointment confirmed). You set a timeout — if the event doesn't occur in time, the workflow continues on a fallback path.

#### If/Else Branching Details
Conditions can check:
- Contact fields (standard or custom): equals, contains, is empty, greater than, etc.
- Tags: has tag / does not have tag
- Opportunity fields: stage, status, value
- Email/SMS: opened, clicked, bounced
- Appointment status
- Date calculations

Multiple conditions can be combined with AND/OR logic. Each branch executes its own action sequence. Branches reconnect at a merge point or diverge permanently.

#### Send Data Actions
| Action | Description |
|---|---|
| Webhook (Outbound) | POST contact/opportunity data to external URL |
| Google Sheets | Add, update, or look up rows in a Google Sheet |
| HTTP Request | Custom API call with configurable method/headers/body |

#### Opportunity Actions
| Action | Description |
|---|---|
| Create Opportunity | Add a new pipeline opportunity |
| Update Opportunity | Modify status, stage, value, or assigned user |
| Remove Opportunity | Delete an opportunity |
| Add Followers to Opportunity | Add watchers to an opportunity |

#### Appointment Actions
| Action | Description |
|---|---|
| Update Appointment Status | Mark as confirmed, cancelled, no-show, etc. |
| Create Booking Link | Generate personalized calendar link |

#### Marketing Actions
| Action | Description |
|---|---|
| Add to Facebook Custom Audience | Sync contact to FB custom audience |
| Remove from Facebook Custom Audience | Remove from FB audience |
| Google Analytics Event | Fire a GA event for the contact |
| Google Ads Conversion | Report a conversion to Google Ads |

#### AI / Eliza Actions
| Action | Description |
|---|---|
| AI Prompt Response (GPT) | Generate AI text based on a prompt + contact data |
| Eliza — Book Appointment | Use Eliza AI agent to book appointment via conversation |
| Eliza — Transfer to Agent | Hand off from Eliza AI to a human agent |

#### Other Action Categories
- **Payments**: Stripe charge, create invoice, one-time payment
- **Courses**: Grant or revoke course/offer access
- **Affiliates**: Assign to affiliate campaign
- **Communities**: Grant or revoke group access
- **IVR**: Gather input, transfer call, play audio, record voicemail
- **Certificates**: Issue certificate to contact

---

### 2.3 Workflow Filters & Conditions

When adding a trigger, you apply **filters** to narrow which contacts enter the workflow:

- **Contact field filters**: e.g., `source = "Facebook"`, `city = "Valletta"`
- **Tag filters**: contact has/does not have specific tag
- **Pipeline filters**: opportunity is in a specific pipeline
- **Date filters**: contact was created in last X days
- **Form-specific**: which form was submitted

Filters are AND-logic by default. Without filters, every contact matching the trigger event enters the workflow.

---

### 2.4 If/Else Logic Deep Dive

```
[Trigger: Form Submitted]
       ↓
[Wait: 5 minutes]
       ↓
[If/Else: Does contact have tag "existing-client"?]
  ├── YES → [Send SMS: "Welcome back!"] → [Add Tag: "re-engaged"]
  └── NO  → [Send Email: "First visit welcome"] → [Add to Campaign: "New Lead Nurture"]
       ↓
[Merge Point]
       ↓
[Update Opportunity: Stage = "Intro Call Scheduled"]
```

You can nest If/Else steps. Each branch is independent and can have its own Wait steps, additional conditions, or early exits.

---

### 2.5 Best Practices for Workflow Design

1. **Use "Contact Changed" sparingly** — it fires on every field update, which can create loops if your workflow itself updates fields. Use filters to narrow the exact field and value.
2. **Always add an end condition** — use tags or a "Remove from Workflow" action to prevent re-entry loops.
3. **Separate communication from logic** — build one workflow per objective. Do not combine lead nurture, appointment reminders, and post-visit follow-up into one massive workflow.
4. **Use Wait-for-Event over time delays for replies** — pausing until a customer replies (with a 48hr timeout fallback) is more responsive than a fixed 24hr delay.
5. **Test with real contacts in a test sub-account** — use the "Test Workflow" feature to trace execution before publishing.
6. **Log everything to Sheets via webhook** — add a Google Sheets action or outbound webhook on key workflow steps for external visibility and debugging.
7. **Tag on entry and exit** — tag contacts when they enter a workflow (`in-workflow-name`) and remove it on exit. This makes filtering and debugging much easier.

---

## 3. Integration Patterns

### 3.1 GHL + n8n

**Pattern A: GHL fires → n8n receives (GHL as event source)**

1. In n8n, create a new workflow and add a **Webhook** node
2. Set method to `POST`, copy the Test URL
3. In GHL Automation → Workflows, create a workflow with the appropriate trigger (e.g., Appointment Status)
4. Add a **Webhook** action, paste the n8n URL
5. Change appointment status in GHL to fire the event
6. In n8n, the Webhook node receives the JSON payload — inspect it, map fields to downstream nodes

**Pattern B: n8n calls GHL API (n8n as orchestrator)**

1. Use the n8n **HTTP Request** node
2. Base URL: `https://services.leadconnectorhq.com` (GHL's API)
3. Auth: Add a header `Authorization: Bearer YOUR_API_KEY`
4. Common endpoints:
   - `POST /contacts/` — create contact
   - `PUT /contacts/{id}` — update contact
   - `POST /opportunities/` — create opportunity
   - `GET /contacts/search?query=email` — search contacts

**Pattern C: n8n native HighLevel node**

n8n ships a built-in HighLevel node (OAuth-based). It supports contacts, opportunities, tasks, calendar events. Use this for simple CRUD. Use the HTTP Request node for anything more advanced.

**Authentication setup:**
- GHL API key: Sub-account Settings → Business Info → API Key
- For OAuth apps: use the GHL Marketplace developer portal to create an OAuth app, then configure n8n's HighLevel credential with Client ID + Secret

**Practical n8n + GHL workflows:**
- New GHL contact → create row in Google Sheets + send Slack alert
- GHL appointment no-show → trigger re-engagement SMS sequence via n8n
- n8n receives Zoho CRM webhook → create GHL contact + enroll in workflow
- GHL form submitted → n8n calls OpenAI → update GHL contact custom field with AI score

---

### 3.2 GHL + Make (Integromat)

Make has a native GoHighLevel module. Patterns:
- **Watch Contacts** module: polls or webhook-receives new/updated contacts
- **Create/Update Contact** module: writes back to GHL
- Use **HTTP module** for endpoints not covered by the native module
- Two-way sync: Make listens to GHL webhook → transforms data → writes to external CRM, and vice versa

---

### 3.3 GHL + Zapier

Zapier's GHL app (listed as "HighLevel" or "LeadConnector") supports:
- Triggers: New Contact, New Opportunity, Form Submission, Appointment Booked
- Actions: Create Contact, Add Tag, Update Contact, Create Opportunity, Add to Campaign

For events Zapier doesn't support natively, use GHL's Workflow → Webhook Action → Zapier's "Catch Hook" trigger URL.

---

### 3.4 Custom Webhook Payloads from GHL Workflows

The GHL **Webhook (Outbound)** action lets you POST custom data:

```
URL: https://your-endpoint.com/ghl-events
Method: POST
Body:
  contact_id:       {{contact.id}}
  contact_name:     {{contact.full_name}}
  contact_email:    {{contact.email}}
  contact_phone:    {{contact.phone}}
  tag_added:        spa-lead
  pipeline_stage:   {{opportunity.pipeline_stage}}
  appointment_time: {{appointment.start_time}}
  custom_field:     {{custom_fields.treatment_interest}}
  timestamp:        {{now}}
```

Available merge fields in webhook body: all contact standard fields (`{{contact.*}}`), custom fields (`{{custom_fields.*}}`), opportunity fields (`{{opportunity.*}}`), appointment fields (`{{appointment.*}}`), location fields (`{{location.*}}`).

You can also set **custom HTTP headers** for auth tokens:
```
Authorization: Bearer your-secret-token
X-Source: gohighlevel
```

---

### 3.5 Inbound Webhook Trigger (GHL receives from external)

GHL supports **inbound webhooks** as a premium workflow trigger. This lets external systems push data into GHL:

1. In Workflow Builder, select **Inbound Webhook** as the trigger
2. GHL generates a unique endpoint URL (e.g., `https://services.leadconnectorhq.com/hooks/XXXXX/webhook-trigger/XXXXX`)
3. Your external system POSTs JSON to that URL
4. The workflow fires and the incoming payload is available as merge fields in actions

Use case: n8n processes data from multiple sources → sends structured payload to GHL inbound webhook → GHL updates contact and fires follow-up sequence.

---

### 3.6 Two-Way Sync Pattern

```
[External CRM / n8n / Zapier]
        ↕  (HTTP REST)
[GHL REST API]  ←→  [GHL Webhook Events]
        ↕
[GHL Workflows]
```

For reliable two-way sync:
1. **Deduplication**: Track `webhookId` / `deliveryId` in your external system to avoid processing the same event twice
2. **Avoid feedback loops**: When GHL updates a contact, it fires `ContactUpdate`. If your sync writes that back to GHL, it fires again. Add a "sync_source" custom field and filter webhooks/workflows to ignore updates made by your sync agent.
3. **Idempotent writes**: Use `PUT /contacts/{id}` with full field state, not incremental patches, so re-processing the same webhook is safe.

---

## 4. Quick Reference

### Key GHL API Base URLs
- REST API: `https://services.leadconnectorhq.com`
- Marketplace/Webhooks docs: `https://marketplace.gohighlevel.com/docs/webhook/`
- Support portal: `https://help.gohighlevel.com`

### Webhook Headers to Always Check
```
X-GHL-Signature       # Ed25519 — verify this (current)
X-WH-Signature        # RSA-SHA256 — legacy, deprecated July 2026
deliveryId            # For idempotency
```

### Workflow Merge Field Syntax
```
{{contact.first_name}}
{{contact.email}}
{{contact.phone}}
{{contact.tags}}
{{custom_fields.field_key}}
{{opportunity.name}}
{{opportunity.pipeline_stage}}
{{appointment.start_time}}
{{appointment.status}}
{{location.name}}
{{now}}
```

---

## Sources

- [Webhook Integration Guide — HighLevel API](https://marketplace.gohighlevel.com/docs/webhook/WebhookIntegrationGuide/index.html)
- [Webhook Event Types — HighLevel API](https://marketplace.gohighlevel.com/docs/category/webhook/index.html)
- [Automated Webhook Retries — GHL Support](https://help.gohighlevel.com/support/solutions/articles/155000007071-automated-webhook-retries)
- [Webhook Logs Dashboard — GHL Support](https://help.gohighlevel.com/support/solutions/articles/155000007078-developer-guide-to-highlevel-s-webhook-logs-dashboard)
- [Complete List of Workflow Triggers — GHL Support](https://help.gohighlevel.com/support/solutions/articles/155000002292-a-list-of-workflow-triggers)
- [Complete List of Workflow Actions — GHL Support](https://help.gohighlevel.com/support/solutions/articles/155000002294-what-are-workflow-actions-complete-list-)
- [Workflow Action: Webhook Outbound — GHL Support](https://help.gohighlevel.com/support/solutions/articles/155000003299-workflow-action-webhook-outbound-)
- [Inbound Webhook Trigger — GHL Support](https://help.gohighlevel.com/support/solutions/articles/155000003147-workflow-trigger-inbound-webhook)
- [Custom Webhook Action — GHL Support](https://help.gohighlevel.com/support/solutions/articles/155000003305-workflow-action-custom-webhook)
- [n8n HighLevel Integration](https://n8n.io/integrations/highlevel/)
- [GHL + n8n Step-by-Step Guide — WebSensePro](https://websensepro.com/blog/how-to-connect-go-high-level-with-n8n-step-by-step/)
- [Webhooks in n8n + GHL — OptimizeSmart](https://www.optimizesmart.com/understanding-webhooks-in-n8n-gohighlevel-and-other-ai-automation-workflows/)
