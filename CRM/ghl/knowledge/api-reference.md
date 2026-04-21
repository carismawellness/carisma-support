# GHL v2 API — Complete Reference

**Base URL:** `https://services.leadconnectorhq.com`  
**Version Header (required):** `Version: 2021-07-28`  
**V1 APIs:** End-of-life December 31, 2025 — use v2 only.

---

## Authentication

### Option 1: Private Integration Token (PIT) — Use for Carisma

A static Bearer token generated inside each sub-account. Best for internal tools, scripts, and automation that access a single location.

**How to generate:**
1. GHL → Settings → Integrations → Private Integrations
2. Create new Integration, select scopes, copy token (shown only once)

**Every request:**
```http
Authorization: Bearer <YOUR_PRIVATE_INTEGRATION_TOKEN>
Content-Type: application/json
Version: 2021-07-28
```

**Key properties:**
- Does not expire on a 24-hour cycle (static until rotated)
- Scopes configurable post-creation without regenerating
- 7-day rotation overlap window when rotating
- Security practice: rotate every 90 days

### Option 2: OAuth 2.0 — Use for marketplace apps

Required for multi-location apps or anything published to the GHL marketplace.

**Auth URL:**
```
https://marketplace.gohighlevel.com/oauth/chooselocation
  ?response_type=code
  &redirect_uri=<CALLBACK>
  &client_id=<ID>
  &scope=contacts.readonly contacts.write opportunities.write
```

**Token exchange:**
```http
POST https://services.leadconnectorhq.com/oauth/token
Content-Type: application/x-www-form-urlencoded

client_id=<id>&client_secret=<secret>&grant_type=authorization_code
&code=<code>&redirect_uri=<CALLBACK>&user_type=Location
```

**Token lifetimes:** Access = ~24h, Refresh = 1 year (rolling — each use resets it)

---

## Universal Headers

Every API call requires all three:
```http
Authorization: Bearer <token>
Content-Type: application/json
Version: 2021-07-28
```

---

## Endpoints

### Contacts

| Method | Path | Description |
|--------|------|-------------|
| GET | `/contacts/{contactId}` | Get single contact |
| POST | `/contacts/` | Create contact |
| PUT | `/contacts/{contactId}` | Update contact |
| DELETE | `/contacts/{contactId}` | Delete contact |
| POST | `/contacts/upsert` | Create or update (email/phone match) |
| GET | `/contacts/search` | Search contacts (preferred) |
| GET | `/contacts/business/{businessId}` | Contacts by business |

**Create/update body:**
```json
{
  "locationId": "abc123",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+35699123456",
  "tags": ["lead", "spa"],
  "source": "form",
  "assignedTo": "user_id",
  "customFields": [
    { "id": "field_id", "value": "custom value" }
  ],
  "city": "Valletta",
  "country": "MT",
  "timezone": "Europe/Malta"
}
```

**Search query params:** `locationId` (required), `query`, `limit` (max 100), `startAfter`, `startAfterId`, `email`, `phone`

---

### Opportunities

| Method | Path | Description |
|--------|------|-------------|
| GET | `/opportunities/{id}` | Get opportunity |
| POST | `/opportunities/` | Create opportunity |
| PUT | `/opportunities/{id}` | Update opportunity |
| DELETE | `/opportunities/{id}` | Delete opportunity |
| GET | `/opportunities/search` | Search/filter opportunities |
| PUT | `/opportunities/{id}/status` | Update status only |
| POST | `/opportunities/upsert` | Upsert opportunity |

**Create body:**
```json
{
  "pipelineId": "pipe_xxx",
  "stageId": "stage_xxx",
  "locationId": "loc_xxx",
  "contactId": "cont_xxx",
  "title": "New Lead",
  "monetaryValue": 500,
  "assignedTo": "user_id",
  "status": "open"
}
```

**Status values:** `open` | `won` | `lost` | `abandoned`

---

### Pipelines

| Method | Path | Description |
|--------|------|-------------|
| GET | `/opportunities/pipelines` | List all pipelines + stages |

**Response:**
```json
{
  "pipelines": [{
    "id": "pipe_xxx",
    "name": "Aesthetics Pipeline",
    "stages": [
      { "id": "stage_xxx", "name": "lead nuevo", "position": 0 }
    ]
  }]
}
```

> Pipelines cannot be created via API — use GHL UI.

---

### Tasks

| Method | Path | Description |
|--------|------|-------------|
| GET | `/contacts/{contactId}/tasks` | List all tasks |
| POST | `/contacts/{contactId}/tasks` | Create task |
| GET | `/contacts/{contactId}/tasks/{taskId}` | Get task |
| PUT | `/contacts/{contactId}/tasks/{taskId}` | Update task |
| DELETE | `/contacts/{contactId}/tasks/{taskId}` | Delete task |
| PUT | `/contacts/{contactId}/tasks/{taskId}/completed` | Mark complete |

**Create body:**
```json
{
  "title": "📞 First Contact — Jane Smith",
  "body": "New lead from Facebook ad",
  "dueDate": "2026-04-25T10:00:00+02:00",
  "assignedTo": "user_id",
  "completed": false
}
```

---

### Conversations & Messages

| Method | Path | Description |
|--------|------|-------------|
| GET | `/conversations/{id}` | Get conversation |
| POST | `/conversations/` | Create conversation |
| PUT | `/conversations/{id}` | Update conversation |
| DELETE | `/conversations/{id}` | Delete conversation |
| GET | `/conversations/search` | Search conversations |
| GET | `/conversations/{id}/messages` | Get messages |
| POST | `/conversations/messages` | Send message |
| PUT | `/conversations/messages/{id}/status` | Update status |

**Send message body:**
```json
{
  "type": "SMS",
  "contactId": "cont_xxx",
  "conversationId": "conv_xxx",
  "message": "Hi {{contact.first_name}}, ...",
  "subject": "...",
  "html": "<p>...</p>"
}
```

**type values:** `SMS` | `Email` | `WhatsApp` | `GMB` | `IG` | `FB` | `Live_Chat`

---

### Calendars & Appointments

| Method | Path | Description |
|--------|------|-------------|
| GET | `/calendars/` | List calendars |
| POST | `/calendars/` | Create calendar |
| GET | `/calendars/{id}` | Get calendar |
| GET | `/calendars/{id}/free-slots` | Get free booking slots |
| GET | `/calendars/events` | Get calendar events |
| POST | `/calendars/events/appointments` | Create appointment |
| GET | `/calendars/events/appointments/{id}` | Get appointment |
| PUT | `/calendars/events/appointments/{id}` | Update appointment |
| DELETE | `/calendars/events/appointments/{id}` | Delete appointment |
| GET | `/contacts/{contactId}/appointments` | Contact's appointments |

**Appointment status values:** `confirmed` | `cancelled` | `showed` | `noshow` | `invalid`

**Free slots query params:** `startDate`, `endDate`, `timezone`, `userId`

---

### Locations (Sub-accounts)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/locations/{locationId}` | Get location details |
| GET | `/locations/search` | Search locations |
| POST | `/locations/` | Create location |
| PUT | `/locations/{locationId}` | Update location |

---

### Custom Fields

| Method | Path | Description |
|--------|------|-------------|
| GET | `/locations/{locationId}/customFields` | List all |
| POST | `/locations/{locationId}/customFields` | Create field |
| GET | `/locations/{locationId}/customFields/{id}` | Get field |
| PUT | `/locations/{locationId}/customFields/{id}` | Update field |
| DELETE | `/locations/{locationId}/customFields/{id}` | Delete field |

**dataType values:** `TEXT` | `LARGE_TEXT` | `NUMERICAL` | `PHONE` | `MONETARY` | `CHECKBOX` | `SINGLE_OPTIONS` | `MULTIPLE_OPTIONS` | `FLOAT` | `TIME` | `DATE` | `TEXTBOX_LIST` | `FILE_UPLOAD` | `SIGNATURE`

---

### Workflows

| Method | Path | Description |
|--------|------|-------------|
| GET | `/workflows/` | List workflows |
| POST | `/contacts/{contactId}/workflow/{workflowId}` | Add contact to workflow |

---

### Tags (Contact)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/contacts/{contactId}/tags` | Add tags: `{"tags": ["vip"]}` |
| DELETE | `/contacts/{contactId}/tags` | Remove tags |
| GET | `/locations/{locationId}/tags` | List location tags |

---

## Pagination

GHL uses cursor-based pagination.

**Request params:** `limit` (max 100, default 20), `startAfter` (timestamp cursor), `startAfterId` (ID cursor)

**Response meta:**
```json
{
  "meta": {
    "total": 542,
    "nextPage": 2,
    "startAfter": 1714000000000,
    "startAfterId": "cont_abc123"
  }
}
```

**Iteration pattern:**
```python
start_after = None
start_after_id = None
all_contacts = []

while True:
    params = {"locationId": LOC_ID, "limit": 100}
    if start_after:
        params["startAfter"] = start_after
        params["startAfterId"] = start_after_id
    resp = client.get("/contacts/search", params=params)
    contacts = resp.get("contacts", [])
    if not contacts:
        break
    all_contacts.extend(contacts)
    meta = resp.get("meta", {})
    if not meta.get("nextPage"):
        break
    start_after = meta["startAfter"]
    start_after_id = meta["startAfterId"]
    time.sleep(1)  # avoid burst limit
```

---

## Rate Limits

| Type | Limit |
|------|-------|
| Burst | 100 requests / 10 seconds / app / resource |
| Daily | 200,000 requests / day / app / resource |

"Per resource" = per location — each location gets its own full allocation.

**Rate limit headers:**
```
X-RateLimit-Remaining           # requests left in burst window
X-RateLimit-Daily-Remaining     # requests left today
X-RateLimit-Max                 # burst window max (100)
X-RateLimit-Interval-Milliseconds  # burst window duration (10000)
```

HTTP `429` = rate limited. Use exponential backoff starting at 1 second (already implemented in `client.py`).

---

## Error Codes

| Status | Meaning | Common Cause |
|--------|---------|--------------|
| 400 | Bad Request | Missing required field, malformed JSON |
| 401 | Unauthorized | Bad/expired token, wrong Version header |
| 403 | Forbidden | Token lacks required scope |
| 404 | Not Found | Wrong resource ID |
| 422 | Unprocessable Entity | Validation failed (e.g., contactId not in this location) |
| 429 | Rate Limited | Exponential backoff |
| 500 | Server Error | GHL-side; retry after 5s |

**Error shape:**
```json
{
  "statusCode": 422,
  "error": "Unprocessable Entity",
  "message": ["contactId must be a valid contact in this location"],
  "traceId": "abc-def-123"
}
```

---

## Critical Notes

- `locationId` is required on virtually every endpoint
- `Version: 2021-07-28` header is required — requests fail without it
- Always use ISO 8601 with timezone for Malta: `+02:00` (CEST) or `+01:00` (CET)
- Upsert respects the sub-account's "Allow Duplicate Contact" setting (email match first, then phone)
- GHL has an official MCP server at `https://services.leadconnectorhq.com/mcp/` — this is what the `mcp__ghl__*` tools use
