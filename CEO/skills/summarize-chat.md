# /ceo:summarize-chat

Summarize messages from a WhatsApp chat.

## Syntax

/ceo:summarize-chat [chat_name] [--hours HOURS] [--save]

## Parameters

- chat_name (required) — Chat or contact name (e.g., "Strategy Team", "Alice")
- --hours (optional) — How many hours back (default: 24)
- --save (optional) — Save summary to file for reference

## Examples

Summarize last 24 hours from a group:
/ceo:summarize-chat Strategy Team

Summarize last 48 hours:
/ceo:summarize-chat Board Updates --hours 48

Save to file:
/ceo:summarize-chat Alice --hours 7 --save

## Implementation

Calls: python CEO/tools/summarize_chat.py --chat "[name]" --hours [hours]

## Output

Returns:
- Key discussion points
- Decisions made
- Action items
- Next steps
