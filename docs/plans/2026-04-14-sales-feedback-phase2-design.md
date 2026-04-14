# Sales Feedback Agent — Phase 2: Live Channel Integration

**Date:** 2026-04-14
**Status:** Approved
**Approach:** Hybrid — WhatsApp first, calibrate, expand

---

## Stage 1: WhatsApp Pilot

### 1.1 Create Score Tracking Google Sheet
- New spreadsheet: "Sales Feedback Agent — Score Tracker"
- Tab 1: **Raw Scores** — one row per scored conversation
  - Columns: Date, Rep Name, Brand, Channel, Scenario Type, Composite Score, Script Compliance, Brand Voice, Discovery, Objection Handling, Close, Follow-Up, Top Strength, Top Improvement, Domain Check (Pass/Fail), Brand Check (Pass/Fail), Conversation ID
- Tab 2: **Rep Summary** — aggregated view per rep (populated by formulas)
- Tab 3: **Team Dashboard** — team-wide metrics

### 1.2 Pull & Score WhatsApp Conversations
- Use WhatsApp MCP to list recent sales chats across all 3 brands
- Select 3-5 completed conversations (mix of brands and scenarios)
- Run each through the full 6-agent scoring pipeline
- Deliver scored output for user review

### 1.3 Calibrate
- User reviews scores against their own judgment
- Adjust rubric weights, scoring criteria, or benchmarks as needed
- Re-score if calibration changes are significant

### 1.4 Set Up WhatsApp Cron
- Frequency: Every 2 hours
- Action: Pull new completed WhatsApp conversations → score → deliver feedback to rep → log to Sheet
- Alert: Score < 40 triggers immediate manager WhatsApp notification

---

## Stage 2: Expand Channels (future session)

| Channel | Frequency | Method |
|---------|-----------|--------|
| Email (Gmail) | Every 4 hours | Pull sales-tagged threads via Gmail MCP |
| Phone transcripts | Daily | Scan Google Drive folder for new files |
| Weekly rep report | Monday 8am | Aggregate, send to manager |
| Monthly calibration | 1st of month | Consistency check |

---

## Stage 3: Full Automation (future session)

All channels active, feedback flowing, dashboards updating, monthly calibration.
