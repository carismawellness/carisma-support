# Windows Agent Setup Guide

**For:** Carisma support agents (1-5 users on Windows)
**Time Required:** 15 minutes
**Difficulty:** Easy (no command line needed)

---

## What You're Setting Up

A one-click system that:
- Pulls the latest scripts and skill files
- Opens Claude Code ready to draft customer responses
- Keeps your version always current
- Never requires manual git commands

**Result:** Double-click `start.bat` → Claude Code opens, ready to work

---

## Prerequisites

- **Windows 10 or later**
- **GitHub Desktop** (free, GUI-based)
- **Claude Code** (installed + API key configured)
- **Internet connection**

---

## Step 1: Install GitHub Desktop (5 min)

If you already have GitHub Desktop, skip to Step 2.

### Download & Install

1. Go to: https://desktop.github.com
2. Click **Download for Windows**
3. Run the installer and follow prompts
4. Launch GitHub Desktop when complete

### Sign In

1. Click **File** → **Options**
2. Go to **Accounts**
3. Click **Sign in with GitHub**
4. Enter your GitHub username/password
5. Click **Authorize desktop**
6. Close options

---

## Step 2: Clone the Carisma Repo (5 min)

### In GitHub Desktop

1. Click **File** → **Clone a Repository**
2. Click the **URL** tab
3. Paste this URL:
   ```
   https://github.com/[ORGANIZATION]/carisma-support.git
   ```
   *(Your manager will give you the exact URL)*

4. Choose where to save locally:
   ```
   C:\Users\[YOUR_USERNAME]\carisma-support
   ```
   *(Keep this path simple, no special characters)*

5. Click **Clone** and wait (first time takes ~1 min)

6. When complete, you'll see the folder structure on the left

### Verify

1. Go to **File Explorer**
2. Navigate to your carisma-support folder
3. Verify you see these folders:
   ```
   carisma-support/
   ├── CLAUDE.md
   ├── SKILL_INVENTORY.md
   ├── skills/
   ├── knowledge/
   ├── locations/
   ├── templates/
   ├── hooks/
   └── start.bat
   ```

If everything is there, you're ready!

---

## Step 3: Test the Launcher (2 min)

### First Time Launch

1. Open **File Explorer**
2. Navigate to your carisma-support folder
3. Find **start.bat**
4. **Right-click** → **Run as administrator**

### What Happens

You'll see a command window that:
1. Pulls latest files from GitHub
2. Checks system integrity
3. Opens Claude Code

### If It Works

✅ Claude Code opens
✅ A terminal window shows "Claude Code" prompt
✅ No error messages

### If There's an Issue

See **Troubleshooting** section below

---

## Step 4: Create Desktop Shortcut (Optional but Recommended)

### Make It Even Easier

1. Open **File Explorer**
2. Navigate to your carisma-support folder
3. Right-click **start.bat**
4. Select **Create shortcut**
5. Rename it to: `Carisma Support`
6. Move the shortcut to your **Desktop**

### From Now On

Just double-click **Carisma Support** on your desktop to start working.

---

## Using Claude Code

### First Time Ever?

Type this command in Claude Code:

```
/onboard
```

This runs a 5-minute walkthrough of how to use the system.

### Standard Workflow

1. **Start with the intake format:**
   ```
   CHANNEL: WhatsApp
   CUSTOMER: Maria
   CONTEXT: First-time visitor, interested in massage
   ---
   [paste customer messages here]
   ```

2. **Claude responds with suggestions**

3. **Review, personalize, and send to customer**

### Common Commands

- `/onboard` — New agent walkthrough
- `[skill-name]` — Manually invoke a skill (e.g., `[consult-and-pitch]`)
- `/help` — Get help with Claude Code

---

## Keeping Everything Updated

### Every Day

When you start your shift:
1. Double-click **Carisma Support** shortcut
2. `start.bat` automatically pulls latest version
3. You're always current

### In GitHub Desktop

If you want to see changes being synced:
1. Open GitHub Desktop
2. Click the **carisma-support** repo
3. You'll see "Fetched X seconds ago"

---

## Troubleshooting

### Problem: "Git pull failed"

**What it means:** Your connection to GitHub failed

**Fix:**
1. Check you have internet connection
2. Close GitHub Desktop and reopen it
3. Try `start.bat` again

---

### Problem: Claude Code doesn't open

**What it means:** Claude Code might not be installed or PATH isn't set

**Fix:**
1. Close the command window
2. Open PowerShell (right-click → Run as administrator)
3. Type: `claude --version`
4. If it works, you'll see version number
5. If it doesn't, reinstall Claude Code

---

### Problem: Error "CLAUDE.md not found"

**What it means:** You're running `start.bat` from the wrong directory

**Fix:**
1. Make sure you're running it from the carisma-support folder
2. You should see the file `start.bat` in that folder
3. Double-check the path shows `carisma-support` in the file explorer

---

### Problem: Hooks not working

**What it means:** Hooks might not be registered

**Fix:**
1. Close Claude Code
2. Verify `.claude/settings.json` exists in your carisma-support folder
3. Restart Claude Code
4. Type: `/help` to confirm settings loaded
5. Try generating a message with "Certainly!" to test

---

## First Week Checklist

- [ ] GitHub Desktop installed
- [ ] Repo cloned to local machine
- [ ] `start.bat` tested and works
- [ ] Desktop shortcut created (optional)
- [ ] Run `/onboard` walkthrough
- [ ] Successfully drafted 3 customer responses
- [ ] Used at least 2 different skills
- [ ] Read CLAUDE.md completely
- [ ] Familiar with SKILL_INVENTORY.md

---

## Tips for Success

✅ **DO:**
- Always start with the intake format (CHANNEL / CUSTOMER / CONTEXT)
- Type `/onboard` if you ever feel lost
- Review Claude's suggestions before sending (don't send verbatim)
- Ask your manager if you're unsure about something

❌ **DON'T:**
- Edit `.claude/settings.json` unless you know what you're doing
- Manually commit changes to git (let `start.bat` handle it)
- Leave sensitive customer data in Claude Code terminal
- Run `start.bat` from different folders each time

---

## Getting Help

### Quick Questions?
- Type `/onboard` for any reminder
- Read `CLAUDE.md` for core rules
- Read `SKILL_INVENTORY.md` for skill reference

### Need Help With a Customer?
- Use the relevant skill (e.g., `[complaint-handler]`)
- Claude will guide you through the process

### Technical Issue?
- Check **Troubleshooting** section above
- Ask your manager for help
- Verify your GitHub credentials are correct

---

## System Architecture

**What's actually happening behind the scenes:**

```
Your Computer (Windows)
    ↓
GitHub Desktop (manages files)
    ↓
Local carisma-support folder
    ↓
start.bat (pulls latest + opens Claude Code)
    ↓
Claude Code (your terminal)
    ↓
Claude AI + 14 Skills + Knowledge Base
    ↓
Recommendations to send to customers
```

Each time you click `start.bat`, it pulls the latest version from GitHub and you get the newest skills, fixes, and knowledge updates automatically.

---

## Next Steps

1. ✅ Complete this setup guide
2. ✅ Run `/onboard` in Claude Code
3. ✅ Draft your first customer response using intake format
4. ✅ Reference a skill (e.g., `[consult-and-pitch]`) for your first inquiry
5. ✅ Ask your manager to review your first few drafts

---

**Welcome to Carisma Support! You've got this. 🤍**

*Setup Guide — Windows Version 1.0*
*Last Updated: 2026-02-20*
