# /ceo:send-message

Send message to a WhatsApp contact.

## Syntax

/ceo:send-message --to [contact] --message [text] [--dry-run]

## Parameters

- --to (required) — Contact name or number
- --message (required) — Message text
- --dry-run (optional) — Preview without sending

## Examples

Send to contact:
/ceo:send-message --to Alice --message "Can you send me the report?"

Preview first:
/ceo:send-message --to Strategy Team --message "Meeting at 3pm" --dry-run

Send to group:
/ceo:send-message --to "Board Updates" --message "Quarterly review complete"

## Best Practices

1. Always use --dry-run first to preview
2. Verify contact name spelling
3. Keep messages concise
4. For sensitive messages, request human review

## Implementation

Calls: python CEO/tools/send_message.py --to "[contact]" --message "[text]"

## Output

Confirmation with timestamp if sent successfully.
