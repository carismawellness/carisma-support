# WhatsApp MCP Tools Reference

## Available Operations

### Messaging

| Tool | Purpose | Example |
|------|---------|---------|
| send_text | Send text message | send_text(contact="Alice", message="Hi") |
| send_media | Send image/video | send_media(contact="Alice", path="/path/image.jpg") |
| read_messages | Fetch messages from chat | read_messages(chat="Strategy Team", limit=50) |
| search_messages | Search message history | search_messages(query="decision", chat="Strategy Team") |

### Contacts

| Tool | Purpose | Example |
|------|---------|---------|
| search_contact | Find contact | search_contact(name="Alice") |
| get_contact_info | Get contact details | get_contact_info(name="Alice") |
| list_contacts | List all contacts | list_contacts() |

### Groups

| Tool | Purpose | Example |
|------|---------|---------|
| list_groups | List group chats | list_groups() |
| get_group_info | Get group details | get_group_info(name="Strategy Team") |
| search_group_messages | Search in group | search_group_messages(group="Board", query="deadline") |

## Common Patterns

### Get Last 24 Hours from Group

```python
messages = read_messages(chat="Strategy Team", hours=24)
summary = extract_summary(messages)
```

### Send with Context

```python
history = read_messages(chat="Alice", limit=5)
draft = generate_response(history, "Alice's message")
send_text("Alice", draft)
```

### Monitor Key Terms

```python
for group in ["Strategy Team", "Board Updates"]:
    messages = read_messages(chat=group, hours=24)
    decisions = filter_decisions(messages)
    if decisions:
        alert(f"Decision in {group}: {decisions}")
```

## Limitations & Notes

- Rate limits: ~100 messages/minute per operation
- QR auth valid for 7 days (can re-scan anytime)
- Media downloads limited to 10 per request
- Group operations require bot status in group
- Older messages (>3 months) may not be searchable via MCP

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Contact not found" | Verify exact name spelling in WhatsApp |
| "Unauthorized" | Check WHATSAPP_AUTH_TOKEN in .env |
| "Rate limited" | Wait 60 seconds before retry |
| "Message failed" | Check internet connection, verify contact is active |
