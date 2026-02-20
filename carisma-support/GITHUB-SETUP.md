# GitHub Infrastructure Setup

**For:** Manager/Admin setting up the private GitHub repository
**Time Required:** 20 minutes
**Difficulty:** Intermediate

---

## Overview

This guide covers:
1. Creating the private GitHub repository
2. Setting up branch protection rules
3. Configuring team access
4. Initial commit of codebase
5. Ongoing maintenance

---

## Step 1: Create Private Repository

### On GitHub.com

1. Log in to GitHub (or your organization account)
2. Click **+** (top right) → **New repository**
3. Fill in details:
   - **Repository name:** `carisma-support`
   - **Description:** "Claude Code support system for Carisma Spa sales & support agents"
   - **Visibility:** 🔒 **Private** (critical — this contains business logic)
   - **Initialize with README:** ❌ No (we'll add ours)
   - **License:** ❌ No license needed

4. Click **Create repository**

### Result

You now have an empty private repo at:
```
https://github.com/[YOUR_ORG]/carisma-support
```

---

## Step 2: Initial Commit & Push

### From Your Local Machine

```bash
# Navigate to carisma-support folder
cd ~/carisma-support

# Initialize git (if not already done)
git init
git remote add origin https://github.com/[YOUR_ORG]/carisma-support.git

# Stage all files
git add .

# Create initial commit
git commit -m "Initial Carisma Support System setup
- 14 deduplicated skills
- Knowledge base structure
- Message templates
- Windows hooks (message-quality-check, sentiment-check)
- Agent setup guide"

# Push to GitHub
git branch -M main
git push -u origin main
```

### Verify

On GitHub.com:
- [ ] You see all folders (skills/, knowledge/, templates/, etc.)
- [ ] All files are visible in the repo browser
- [ ] No `.env` or `credentials.json` (blocked by `.gitignore`)

---

## Step 3: Set Up Branch Protection Rules

### Why Branch Protection?

Prevents accidental overwrites of core system files. Agents can't directly push to `main` — their changes are reviewed first.

### Configure Rules

1. Go to **Settings** → **Branches**
2. Under "Branch protection rules", click **Add rule**
3. Fill in:

   **Branch name pattern:** `main`

   **Protect matching branches:**
   - [x] Require a pull request before merging
   - [x] Require approvals (1 required)
   - [x] Dismiss stale pull request approvals when new commits are pushed
   - [x] Require status checks to pass before merging
   - [ ] Include administrators *(leave unchecked — admins can override)*
   - [x] Restrict who can push to matching branches (only admins)

4. Click **Create**

### Result

- Agents can read and use files
- Agents can't directly commit to main
- Changes require approval (prevents accidents)
- Admins can override if needed

---

## Step 4: Add Team Members (Agents)

### Invite Agents to Repository

1. Go to **Settings** → **Collaborators**
2. Click **Add people**
3. Enter each agent's GitHub username
4. Set role:
   - **Maintain** — Can manage repo, merge PRs (recommended for managers)
   - **Push** — Can commit directly *(only if you skip branch protection)*
   - **Pull** — Read-only *(not recommended for active team)*
   - **Triage** — Can manage issues/PRs without pushing *(good for reviewers)*

### Recommended Setup (1-5 agents)

| Role | Type | Count |
|------|------|-------|
| **Admin** | Manager/Lead agent | 1 |
| **Maintain** | Senior agents | 0-2 |
| **Push** | Regular agents | 2-5 |

### Notification Settings

Each agent should configure GitHub notifications:
1. Settings → Notifications
2. Select: "Only notify for activities on repositories I'm maintaining or collaborating on"
3. Set frequency: "As it happens" (real-time alerts for merged changes)

---

## Step 5: Ongoing Maintenance

### Weekly Workflow

**Manager responsibilities:**

1. **Review PRs** from agents
   - Check for accuracy in knowledge base updates
   - Verify no sensitive data in changes
   - Approve if good, request changes if issues

2. **Merge to main**
   - Approved PRs get merged
   - Triggers automatic file updates for all agents

3. **Communicate changes**
   - Send team message: "Updated knowledge base: [what changed]"
   - Agents see it automatically on their next `start.bat`

### Version Management

Track versions in `SKILL_INVENTORY.md` header:
```markdown
# Carisma Support System — Skill Inventory Summary
**Version:** 1.0
**Last Updated:** 2026-02-20
**Status:** Production Ready
```

Update version on major changes:
- `1.0` → `1.1` for knowledge base updates
- `1.0` → `2.0` for significant skill changes

---

## Step 6: GitHub Actions (Optional Automation)

### Create Auto-Sync Workflow

To automatically alert agents when changes are merged to main:

1. Create folder: `.github/workflows/`
2. Create file: `.github/workflows/notify-agents.yml`

```yaml
name: Notify Agents of Updates

on:
  push:
    branches:
      - main

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Notify team
        run: echo "Changes merged to main - agents will see updates on next 'start.bat'"
```

This is optional but useful for larger teams.

---

## Security Checklist

Before going live:

- [ ] Repository is **Private** (not public)
- [ ] `.gitignore` blocks `.env`, `credentials.json`, `token.json`
- [ ] Branch protection enabled on `main`
- [ ] Only trusted team members have push access
- [ ] No API keys committed to repo
- [ ] No customer data in commits
- [ ] All agents understand: "Don't commit sensitive data"

---

## Troubleshooting

### Problem: "Repository not found"

**Cause:** Wrong URL or no access

**Fix:**
```bash
# Verify correct URL
git remote -v

# Should show:
# origin  https://github.com/[ORG]/carisma-support.git

# Re-add if wrong
git remote remove origin
git remote add origin https://github.com/[ORG]/carisma-support.git
```

---

### Problem: "Permission denied (publickey)"

**Cause:** SSH key not configured or GitHub credentials needed

**Fix:**
1. Use GitHub Desktop instead (GUI-based, easier)
2. Or set up SSH key: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

---

### Problem: Agents can't clone the repo

**Cause:** Repository is private and they don't have access

**Fix:**
1. Verify their GitHub account is invited to the repo
2. They should accept the invitation email
3. They should use GitHub Desktop to clone (easier than command line)

---

## Ongoing Best Practices

### Commit Messages

Keep commits clear and atomic:

```
Good:
✅ "Update pricing: increased massage rates 5% effective Feb 20"
✅ "Add Valentine's Day campaign offer to seasonal-promotions.md"

Bad:
❌ "various updates"
❌ "fixed stuff"
```

### Review Process

When agents submit changes:

1. **Manager reviews:**
   - Is the information accurate?
   - Is formatting consistent?
   - Are there any security issues?

2. **Approval or feedback:**
   - Approve → Merge to main
   - Request changes → Agent updates PR

3. **Communication:**
   - "Merged: updated booking policy for new locations"

### Backup Strategy

GitHub is your backup, but:
- Keep local copies of critical files
- Export SKILL_INVENTORY.md monthly
- Screenshot CLAUDE.md quarterly

---

## GitHub Dashboard Recommendations

Set up GitHub project board for tracking:

1. Go to **Projects** → **New project**
2. Choose **Table** layout
3. Add columns: **To Do**, **In Progress**, **In Review**, **Done**
4. Create issues for KB updates agents should prioritize

Example issues:
- "Fill in booking-policy.md with real data"
- "Update pricing-and-menu.md with February prices"
- "Add Valentine's Day to seasonal-promotions.md"

---

## Team Communication About GitHub

### For Your Team:

> "We use GitHub to keep the system updated. Here's what that means for you:
>
> **When you start your shift:** Click `start.bat` — it automatically pulls the latest version. You always have the newest skills and knowledge.
>
> **When you find new information:** Tell your manager. They'll update the knowledge base and it syncs to everyone.
>
> **You don't need to understand GitHub.** It works in the background. Your job is to use Claude Code to draft great responses."

---

## Ready to Go Live?

Before agents start using the system:

- [ ] Private repo created on GitHub
- [ ] All files committed and pushed to main
- [ ] Branch protection rules enabled
- [ ] All agents invited to repo
- [ ] Each agent has GitHub Desktop installed
- [ ] Each agent has cloned the repo locally
- [ ] Each agent has tested `start.bat`
- [ ] Each agent has run `/onboard` walkthrough
- [ ] You've reviewed first 3 agent responses

---

## Support Resources

**GitHub Help:**
- Docs: https://docs.github.com
- Private repositories: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility

**GitHub Desktop:**
- Download: https://desktop.github.com
- Getting started: https://docs.github.com/en/desktop/installing-and-configuring-github-desktop

**Claude Code:**
- Help: Type `/help` in Claude Code terminal

---

*GitHub Setup Guide — Carisma Support System*
*Last Updated: 2026-02-20*
