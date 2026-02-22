# CEO WhatsApp Setup Checklist

> Complete this after authentication is successful

## Pre-Flight Checklist

- [ ] .mcp.json updated with whatsapp entry
- [ ] .env has WHATSAPP_AUTH_TOKEN (not placeholder)
- [ ] WhatsApp MCP bridge running (terminal window)
- [ ] Phone connected (Linked Device shows active)
- [ ] CEO/ folder created with all subdirectories

## Verification Tests

Run these commands to verify setup:

### Test 1: Python Dependencies

```bash
python3 CEO/tools/summarize_chat.py --chat "Test" --hours 1
```

Should output: Tool structure (not error)

### Test 2: Environment Variables

```bash
grep WHATSAPP .env | grep -v "^#"
```

Should show both variables set with actual values.

### Test 3: Bridge Connectivity

```bash
curl -s http://localhost:3000/health | jq .
```

Should show: `{"status":"connected","authenticated":true}`

## First Real Operation

When all tests pass, try:

```bash
python3 CEO/tools/summarize_chat.py --chat "[Real Contact]" --hours 1
```

Should return actual message summary from WhatsApp.

## Ready for Integration

If all tests pass, you're ready to:
1. Use /ceo:summarize-chat skill
2. Use /ceo:send-message skill
3. Run daily workflows
4. Have Will build additional tools/workflows

## Troubleshooting

See `config/whatsapp_config.md` for common issues.
