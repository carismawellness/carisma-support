# WhatsApp MCP Configuration

## Setup Instructions

### 1. Install WhatsApp MCP Bridge

```bash
# Option A: Using uvx (recommended)
uvx whatsapp-mcp@latest

# Option B: Clone and run locally
git clone https://github.com/lharries/whatsapp-mcp.git
cd whatsapp-mcp
go build -o whatsapp-bridge ./cmd/bridge
./whatsapp-bridge
```

### 2. Authenticate

When the bridge starts, it will display a QR code in terminal.

**On your phone:**
1. Open WhatsApp
2. Go to Settings → Linked Devices
3. Tap "Link a Device"
4. Use phone camera to scan the QR code from terminal

### 3. Verify Connection

```bash
# Check if bridge is responding
curl http://localhost:3000/health
# Expected: {"status":"connected","authenticated":true}
```

### 4. Store Auth Token

After successful QR scan, the bridge generates an auth token.

**In `.env`:**
```
WHATSAPP_BRIDGE_URL=http://localhost:3000
WHATSAPP_AUTH_TOKEN=<token_from_bridge>
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| QR code won't scan | Make terminal window larger, reduce zoom |
| "Not authenticated" | Re-scan QR code, ensure phone camera can see it |
| "Connection refused" | Verify bridge is running on port 3000 |
| Message send fails | Check contact name spelling, verify number format |

## Security Notes

- Credentials stored in `.env` (gitignored)
- Token auto-refreshes, no manual renewal needed
- Can revoke access anytime by re-scanning QR
- All operations logged in tools
