# Workflow: GHL Data Operations

Common data tasks performed via MCP tools or Python scripts.

---

## Search & Retrieve Contacts

```python
# Search by name/email/phone
ToolSearch → mcp__ghl__search_contacts
mcp__ghl__search_contacts(
  locationId="<LOC_ID>",
  query="john@example.com",
  limit=20
)

# Get full contact record
mcp__ghl__get_contact(contactId="<CONTACT_ID>")
```

## Update Contact Fields

```python
ToolSearch → mcp__ghl__update_contact
mcp__ghl__update_contact(
  contactId="<CONTACT_ID>",
  firstName="John",
  lastName="Doe",
  email="john@example.com",
  phone="+35699123456",
  customFields=[
    { "key": "followup_count", "value": 2 },
    { "key": "task_type", "value": "Follow-up 2" }
  ]
)
```

## Add / Remove Tags

```python
# Add tags
mcp__ghl__add_contact_tags(contactId="...", tags=["hot-lead", "aesthetics"])

# Remove tags
mcp__ghl__remove_contact_tags(contactId="...", tags=["cold-lead"])
```

## Move Opportunity Stage

```python
ToolSearch → mcp__ghl__update_opportunity
mcp__ghl__update_opportunity(
  opportunityId="<OPP_ID>",
  pipelineStageId="<STAGE_ID>"
)

# Or update status (won/lost)
mcp__ghl__update_opportunity_status(
  opportunityId="<OPP_ID>",
  status="won"  # open | won | lost | abandoned
)
```

## Create a Task

```python
ToolSearch → mcp__ghl__create_contact_task
mcp__ghl__create_contact_task(
  contactId="<CONTACT_ID>",
  title="📞 First Contact — John Doe",
  dueDate="2026-04-22T09:00:00Z",
  assignedTo="<USER_ID>",
  description="Priority: 100"
)
```

## Complete a Task

```python
mcp__ghl__update_task_completion(
  contactId="<CONTACT_ID>",
  taskId="<TASK_ID>",
  completed=True
)
```

## Send a Message

```python
# SMS
mcp__ghl__send_sms(
  contactId="<CONTACT_ID>",
  message="Hi {{contact.first_name}}, ..."
)

# Email
mcp__ghl__send_email(
  contactId="<CONTACT_ID>",
  subject="Your appointment confirmation",
  html="<p>Hi {{contact.first_name}}...</p>"
)
```

## Book an Appointment

```python
# 1. Get available slots
mcp__ghl__get_free_slots(
  calendarId="<CAL_ID>",
  startDate="2026-04-22",
  endDate="2026-04-29",
  timezone="Europe/Malta"
)

# 2. Create appointment
mcp__ghl__create_appointment(
  calendarId="<CAL_ID>",
  contactId="<CONTACT_ID>",
  startTime="2026-04-24T10:00:00Z",
  endTime="2026-04-24T10:30:00Z",
  title="Consultation - John Doe"
)
```

## Add a Contact Note

```python
mcp__ghl__create_contact_note(
  contactId="<CONTACT_ID>",
  body="Called 3 times, no answer. Leaving voicemail."
)
```

## Bulk Tag Update

```python
mcp__ghl__bulk_update_contact_tags(
  locationId="<LOC_ID>",
  contactIds=["id1", "id2", "id3"],
  tags=["reactivation-2026"],
  action="add"  # add | remove
)
```

## Pagination Pattern

GHL paginates large result sets. Use `startAfterId` or `startAfter` cursor:

```python
results = []
start_after = None
while True:
    resp = client.search_contacts(start_after_id=start_after)
    contacts = resp.get("contacts", [])
    results.extend(contacts)
    meta = resp.get("meta", {})
    if not meta.get("nextPageUrl"):
        break
    start_after = contacts[-1]["id"]
```

---

## Error Handling

| HTTP Code | Meaning | Action |
|-----------|---------|--------|
| 400 | Bad request — missing/invalid field | Check parameter names and types |
| 401 | Unauthorized — bad API key | Check `.env` GHL_API_KEY |
| 404 | Not found — wrong ID | Verify contactId/opportunityId |
| 422 | Validation error | Read error body for field details |
| 429 | Rate limited | Exponential backoff (built into client.py) |
| 500 | GHL server error | Retry after 5s |
