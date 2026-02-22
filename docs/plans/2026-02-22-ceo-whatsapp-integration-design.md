# CEO WhatsApp MCP Integration Design

**Date:** February 22, 2026
**Owner:** CEO (Personal Account Integration)
**Status:** Approved Design → Implementation Planning

---

## Overview

A dedicated WhatsApp MCP server integration that connects your personal WhatsApp account to Claude Code, enabling you to send messages, read/search conversations, summarize group chats, and manage executive workflows—all within your private account space, separate from customer-facing CRM integrations.

---

## Architecture

### MCP Server Integration

Add a new WhatsApp MCP server to `.mcp.json` that:
- Connects via QR code authentication (one-time setup)
- Bridges your personal WhatsApp to Claude Code
- Provides 60+ tools for message operations (send, read, search, manage)
- Stores credentials securely in `.env` (gitignored)

### Recommended MCP Implementation

Using **lharries/whatsapp-mcp** (Go bridge + Python server):
- Stable, community-maintained
- QR code auth (no password storage)
- Full feature coverage for personal use
- Easy to configure and troubleshoot

---

## Folder Structure

```
CEO/
├── config/
│   ├── whatsapp_config.md          # WhatsApp MCP setup & credentials
│   └── ceo_workflows.md             # Your executive workflows & patterns
├── tools/
│   ├── summarize_chat.py            # Read & summarize a specific chat
│   ├── send_message.py              # Send message to contact/group
│   ├── monitor_groups.py            # Watch key group chats for patterns
│   └── draft_response.py            # Draft message with context
├── workflows/
│   ├── daily_whatsapp_sync.md       # Daily message summary routine
│   ├── quick_response.md             # Quick send/reply workflow
│   └── group_monitoring.md           # Track key conversations
├── skills/
│   ├── summarize-chat.md            # /ceo:summarize-chat skill
│   └── send-message.md              # /ceo:send-message skill
├── knowledge/
│   └── whatsapp_tools.md             # MCP server tools reference
└── README.md                         # CEO folder overview & quick start
```

**Access Model:**
- You (CEO) have full access to read/send from your WhatsApp
- Will has access to the `CEO/` folder to help manage workflows and build automation
- WhatsApp integration only connects to your personal account (not customer-facing)

---

## Integration Points

### 1. MCP Configuration (`.mcp.json`)

New server entry:
```json
"whatsapp": {
  "command": "uvx",
  "args": ["whatsapp-mcp@latest"],
  "env": {
    "WHATSAPP_BRIDGE_URL": "${WHATSAPP_BRIDGE_URL}",
    "WHATSAPP_AUTH_TOKEN": "${WHATSAPP_AUTH_TOKEN}"
  }
}
```

### 2. Environment Variables (`.env`)

Store credentials securely:
- `WHATSAPP_BRIDGE_URL` — Local bridge address
- `WHATSAPP_AUTH_TOKEN` — QR-authenticated token

### 3. Existing Tools Integration

Works alongside:
- Meta Ads MCP (marketing coordination)
- Google Sheets (log summaries, track follow-ups)
- Filesystem (store conversation transcripts)
- Playwright (no conflicts)

---

## Use Cases Enabled

### 1. Executive Summaries
- "Summarize the last 24 hours from [Group Name]"
- Pulls key decisions, action items, blockers
- Saves to Google Sheet for reference

### 2. Quick Outreach
- Send message directly from Claude without leaving workspace
- Draft message → review → send workflow
- Maintains personal tone and context

### 3. Group Monitoring
- Track decisions in critical group chats (strategy, partnerships, etc.)
- Flag messages mentioning specific topics or contacts
- Daily digest of important discussions

### 4. Message Context & History
- "What did [Contact] say about [Topic] last week?"
- Search across your message history
- Retrieve full context for decisions

### 5. Draft & Collaborate
- Claude drafts response based on conversation history
- You review tone, content, implications
- Send with confidence

---

## Capabilities

The WhatsApp MCP server provides **60+ tools** including:

| Category | Examples |
|----------|----------|
| **Messages** | Send text/media, read messages, search, forward, delete |
| **Contacts** | Search contacts, get contact info, block/unblock |
| **Chats** | List chats, get chat history, mute/archive, create groups |
| **Groups** | Get group info, add/remove members, promote/demote, leave |
| **Media** | Send images/videos/documents, download media |
| **Status** | Update status, view statuses |

---

## Authentication & Security

### Initial Setup
1. Start WhatsApp MCP server
2. Server generates QR code
3. Scan QR with your WhatsApp phone (WhatsApp Web login)
4. Token stored in `.env`, never in code

### Ongoing Security
- **Token expiry:** Auto-refreshes via bridge
- **Credentials:** Stored in `.env` (gitignored)
- **Access logs:** Document all message operations
- **Account isolation:** Your personal WhatsApp ≠ Customer CRM accounts
- **Revocation:** Can regenerate token anytime by re-scanning QR

---

## Data Flow

```
You (CLI)
  ↓
Claude Code
  ↓
WhatsApp MCP Server (Python)
  ↓
WhatsApp Bridge (Go) ← QR authenticated connection
  ↓
Your WhatsApp Account (Phone sync)
```

---

## Next Steps

1. **Write implementation plan** → Define exact setup steps, scripts, config
2. **Set up folder structure** → Create CEO/ with subdirectories
3. **Configure .mcp.json** → Add whatsapp-mcp entry
4. **Authenticate via QR** → Connect your WhatsApp account
5. **Build first tools** → summarize_chat.py, send_message.py
6. **Create executable skills** → /ceo:summarize-chat, /ceo:send-message
7. **Test workflows** → Daily sync, quick response scenarios
8. **Document in README** → Quick start guide for you and Will

---

## Success Criteria

- ✅ WhatsApp MCP server successfully authenticated
- ✅ Can read messages from personal chats via Claude
- ✅ Can send messages to contacts/groups via Claude
- ✅ Can summarize recent conversations
- ✅ Tools work without TLS/auth issues
- ✅ CEO/ folder is organized and documented
- ✅ Will can access and help manage workflows
- ✅ No credential leaks or security issues

---

## Assumptions & Constraints

- Your WhatsApp is installed on your phone (for multi-device sync)
- Internet connection stable (for bridge connection)
- QR code available at setup (printed or on second device)
- `.env` file is properly gitignored (existing setup)
- No rate limits expected for personal account (light usage)

---

## Related Documents

- [WAT Framework Architecture](../CLAUDE.md) — Workflows, Agents, Tools separation
- [MCP Configuration](../.mcp.json) — Current MCP servers
- [Environment Setup](./.env) — Credential storage

