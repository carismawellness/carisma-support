# CEO Workflows & Patterns

## Daily WhatsApp Review

**Objective:** Each morning, get a summary of important messages from key contacts/groups

**Frequency:** Daily at 9 AM (manual trigger for now)

**Pattern:**
1. Summarize "Strategy Team" group (last 24h)
2. Summarize "Board Updates" group (last 24h)
3. Search for mentions of specific topics (partnerships, competitors)
4. Flag action items and decisions

**Execution:** `workflows/daily_whatsapp_sync.md`

## Quick Response

**Objective:** Send a message to a contact directly from Claude without opening phone

**Use Case:** Reply to urgent messages, coordinate with team leads

**Pattern:**
1. User provides: contact name + message
2. Claude searches recent conversation with contact for context
3. Claude drafts response (if needed)
4. User reviews and approves
5. Send via WhatsApp

**Execution:** `workflows/quick_response.md`

## Group Monitoring

**Objective:** Track decisions and discussions in 2-3 key group chats

**Key Groups:**
- Strategy Team
- Board Updates
- (Add as needed)

**Pattern:**
1. Monitor for mentions of: decisions, deadlines, risks, competitive intel
2. Daily summary of key discussions
3. Flag consensus changes or blockers
4. Surface to CEO for quick review
