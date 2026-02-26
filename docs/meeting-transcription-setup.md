# Meeting Transcription → Obsidian: Setup Guide

This sets up a fully automatic pipeline:
**Meeting happens → tl;dv transcribes → Google Drive → Obsidian vault → Claude Code processes**

Total setup time: ~10 minutes. After that, zero manual steps.

---

## Step 1: Set Up tl;dv (3 min)

1. Go to [tl;dv.io](https://tldv.io) and create a free account
2. Install the [tl;dv Chrome extension](https://chromewebstore.google.com/detail/record-transcribe-chatgpt/lknmjhcajhfbbglglccadlfdjbaiifig)
3. Connect your Google account (the same one you use for Google Meet)
4. In tl;dv settings, enable **auto-record** for all Google Meet calls

tl;dv will now automatically join and transcribe every Google Meet call.

## Step 2: Enable tl;dv → Google Docs Integration (2 min)

1. In tl;dv, go to **Settings → Integrations → Google Docs**
2. Enable the integration and authorize access
3. tl;dv will create a folder called **"tl;dv Meetings"** (or similar) in your Google Drive
4. Every completed meeting transcript will auto-save as a Google Doc in that folder

## Step 3: Deploy the Google Apps Script (5 min)

1. Go to [script.google.com](https://script.google.com) → **New Project**
2. Name it "Meeting Transcript to Vault"
3. Delete the default code
4. Open the file `tools/google-apps-script/transcript-to-vault.gs` and copy the entire contents
5. Paste it into the Apps Script editor
6. **No configuration needed** — the script finds your folders automatically
7. Click the **Run** dropdown at the top → select **setup**
8. Click **Run**
9. A popup will ask for authorization:
   - Click **Review permissions**
   - Select your Google account
   - Click **Advanced** → **Go to Meeting Transcript to Vault (unsafe)**
   - Click **Allow**
10. Check the execution log at the bottom — it should say "Trigger created. Setup complete."

That's it. The script runs every hour automatically.

**Note:** If tl;dv creates a folder with a different name than "tl;dv Meetings", update the `SOURCE_FOLDER_NAME` variable at the top of the script to match.

## How It Works After Setup

```
You have a Google Meet call
    ↓ (automatic)
tl;dv records and transcribes it
    ↓ (automatic)
tl;dv saves transcript as Google Doc on your Drive
    ↓ (automatic, hourly)
Google Apps Script converts to .md in meetings/raw/
    ↓ (automatic, via Google Drive sync)
File appears in your local Obsidian vault
    ↓ (automatic, when you open Claude Code)
Claude Code detects new transcript and processes it
    ↓ (automatic)
Structured meeting note appears in meetings/ folder in Obsidian
```

---

## Troubleshooting

**tl;dv not joining meetings?**
- Make sure the Chrome extension is active
- Check that auto-record is enabled in tl;dv settings

**Transcripts not appearing in Google Drive?**
- Check tl;dv Settings → Integrations → Google Docs is connected
- Transcripts may take a few minutes after the meeting ends

**Apps Script not converting files?**
- Go to script.google.com → your project → Executions to see logs
- Make sure the SOURCE_FOLDER_NAME matches the exact folder name tl;dv created
- Run `runNow()` manually from the script editor to test

**Files not syncing locally?**
- Check Google Drive for Desktop is running and syncing
- The file should appear in your vault within a few minutes of being created
