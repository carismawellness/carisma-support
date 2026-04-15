# Daily WhatsApp Sync Workflow

**Objective:** Get executive summary of key WhatsApp messages each morning

**Duration:** 5-10 minutes

**Frequency:** Daily (9 AM, manual trigger for now)

## Steps

### 1. Summarize Key Groups

Run summarize tool for each key group:

```bash
python CEO/tools/summarize_chat.py --chat "Strategy Team" --hours 24 --output /tmp/strategy.txt
python CEO/tools/summarize_chat.py --chat "Board Updates" --hours 24 --output /tmp/board.txt
```

### 2. Review Summaries

Read outputs:

```bash
cat /tmp/strategy.txt
cat /tmp/board.txt
```

### 3. Extract Action Items

Look for:
- Decisions made
- Tasks assigned to you
- Urgent issues
- Deadlines

### 4. Log in Google Sheet (Optional)

Add summary row to "Daily WhatsApp Log" sheet with:
- Date
- Key decisions
- Action items
- Follow-up needed

### 5. Respond to Urgent Items

If urgent items found:

```bash
python CEO/tools/send_message.py --to "[Contact]" --message "[Response]" --dry-run
# Review output
python CEO/tools/send_message.py --to "[Contact]" --message "[Response]"
```

## Notes

- Always use `--dry-run` first to review message
- Use exact contact names as they appear in WhatsApp
- Save summaries to Google Sheet for audit trail
- Flag decisions for strategy review if needed
