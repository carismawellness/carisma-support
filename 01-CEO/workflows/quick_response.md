# Quick Response Workflow

**Objective:** Send message to contact without leaving Claude

**Duration:** 2-3 minutes

**Use Case:** Reply to urgent messages, coordinate with team

## Steps

### 1. Get Message Context (Optional)

If you need context from recent conversation:

```bash
python CEO/tools/summarize_chat.py --chat "[Contact]" --hours 1
```

### 2. Draft Response

Claude helps draft based on:
- Conversation history
- Tone of recent messages
- Relationship with contact

### 3. Review & Approve

You review:
- Tone (professional, warm, urgent?)
- Accuracy (facts correct?)
- Implications (anything this might affect?)

### 4. Send

```bash
# Preview first
python CEO/tools/send_message.py --to "[Contact]" --message "[Message]" --dry-run

# Send when ready
python CEO/tools/send_message.py --to "[Contact]" --message "[Message]"
```

### 5. Log (Optional)

Add note to Google Sheet or internal tracking if important for later reference.

## Best Practices

- Always preview (`--dry-run`) before sending
- Double-check contact name spelling
- Use exact message formatting
- Keep tone consistent with previous messages
- For sensitive messages, request human review
