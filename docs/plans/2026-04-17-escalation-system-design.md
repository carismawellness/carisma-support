# Speed to Lead Escalation System — Design Document

**Date:** 2026-04-17
**Author:** Claude Code + Mert
**Status:** Approved, ready for implementation

---

## Overview

Hybrid escalation system (Option C) that ensures no lead goes uncontacted. Zoho CRM handles Tier 1 email alerts natively; a Python cron script handles Tier 2-4 via WhatsApp to Mert.

## Escalation Tiers

| Tier | Threshold | Channel | Recipient | Message Tone |
|---|---|---|---|---|
| Tier 1 | 15 min | Email | Assigned rep | Reminder |
| Tier 2 | 30 min | WhatsApp | Mert (+356 99503020) | Alert |
| Tier 3 | 60 min | WhatsApp | Mert (+356 99503020) | Urgent |
| Tier 4 | 120 min | WhatsApp | Mert (+356 99503020) | Critical + dashboard flag |

## Business Hours

- **Active:** 08:00 - 20:00 Malta time (Europe/Malta, CET/CEST)
- **Outside hours:** No escalation. Timer pauses at 20:00 and resumes at 08:00.
- **Overnight leads:** Escalation clock starts at 08:00 the next business day.

### Effective Elapsed Time Calculation

```
effective_elapsed = 0

For each minute between lead creation and now:
    if minute falls within 08:00-20:00 Malta time:
        effective_elapsed += 1

# Simplified: count business-hours minutes only
```

Examples:
- Lead at 10:00, now 10:35 → 35 min → Tier 2
- Lead at 02:00, now 08:20 → 20 min → Tier 1
- Lead at 19:45, now 08:30+1 → 45 min (15 + 30) → Tier 2
- Lead at 21:00, now 21:30 → 0 min → No escalation

## Architecture

### Layer 1: Zoho Native (Tier 1)

Per-CRM workflow rule:
- **Trigger:** Lead created with Lead_Status = null or "Not Contacted"
- **Time-based action:** Wait 15 minutes, then send email to Lead Owner
- **Note:** Fires 24/7 (Zoho limitation). Overnight emails are low-noise — rep sees at 8am.

### Layer 2: Python Cron (Tier 2-4)

**Script:** `Tools/escalation_check.py`
**Schedule:** Every 5 minutes via macOS launchd
**Flow:**

```
1. Check if current time is within business hours (8am-8pm Malta)
   - If not → exit immediately (no processing)

2. For each brand (Spa, Aesthetics, Slimming):
   a. Query Zoho CRM via COQL:
      SELECT id, Last_Name, Phone, Ad_Campaign, Lead_Owner, 
             Created_Time, Escalation_Level, Lead_Status
      FROM Leads
      WHERE Response_Status != 'Called'
        AND (Lead_Status is null OR Lead_Status = 'Not Contacted' 
             OR Lead_Status = 'Attempted to Contact')
        AND Created_Time > [7 days ago]

   b. For each uncontacted lead:
      - Calculate effective_minutes_elapsed (business hours only)
      - Determine target tier based on elapsed time
      - If target tier > current Escalation_Level:
        * Send WhatsApp to Mert
        * Update Escalation_Level and Escalation_Time on lead
        * Log to Supabase escalation_log table

3. Print summary: "Checked X leads, escalated Y"
```

### WhatsApp Integration

Uses existing WhatsApp MCP server at `~/.claude/mcp-servers/whatsapp-mcp/`
- **Tool:** `send_message(recipient, message)`
- **Recipient:** `35699503020` (Mert, all brands)
- **Bridge:** Go WhatsApp bridge at localhost:8080 must be running

Since the cron runs as a standalone Python script (not inside Claude Code), it calls the WhatsApp bridge HTTP API directly at `http://localhost:8080/api/send` instead of going through MCP.

### Message Templates

**Tier 2 (30 min):**
```
⏰ SPEED TO LEAD — {brand}
Lead: {name} ({phone})
Campaign: {ad_campaign}
Waiting: {minutes} min
Rep: {rep_name}
```

**Tier 3 (60 min):**
```
🔴 URGENT — {brand}
{name} waiting {minutes} min — NO CONTACT
Phone: {phone}
Campaign: {ad_campaign}
This lead is going cold.
```

**Tier 4 (120 min):**
```
🚨 CRITICAL — {brand}
{name} — {minutes} MIN, NO CONTACT
Phone: {phone}
Campaign: {ad_campaign}
Flagged on CEO Cockpit.
```

## Data Model

### Zoho CRM Fields (on Leads module, all 3 CRMs)

| Field | API Name | Type | IDs |
|---|---|---|---|
| Escalation Level | `Escalation_Level` | Picklist (None/Tier 1-4) | Spa: 189957000055486505, Aes: 524228000043855416, Slim: 956933000003933034 |
| Escalation Time | `Escalation_Time` | DateTime | Spa: 189957000055627779, Aes: 524228000043841251, Slim: 956933000003961261 |

### Supabase Table

```sql
CREATE TABLE escalation_log (
    id BIGSERIAL PRIMARY KEY,
    brand_id INT NOT NULL REFERENCES brands(id),
    lead_id TEXT NOT NULL,
    lead_name TEXT,
    lead_phone TEXT,
    campaign TEXT,
    assigned_rep TEXT,
    tier INT NOT NULL CHECK (tier BETWEEN 1 AND 4),
    minutes_elapsed NUMERIC(8,1),
    escalated_at TIMESTAMPTZ DEFAULT now(),
    channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp'))
);

CREATE INDEX idx_escalation_log_brand_date ON escalation_log (brand_id, escalated_at);
CREATE INDEX idx_escalation_log_lead ON escalation_log (lead_id);
```

## File Structure

```
Tools/escalation_check.py                                    -- Main cron script
Tech/CEO-Cockpit/supabase/migrations/019_create_escalation_log.sql
~/Library/LaunchAgents/com.carisma.escalation-check.plist     -- macOS scheduler
```

## Dependencies

- Python 3.11+ with `httpx` (already available)
- WhatsApp bridge running at localhost:8080
- Zoho CRM OAuth credentials (from .mcp.json)
- Supabase credentials (from .env or existing etl config)
- `pytz` or `zoneinfo` for Malta timezone handling

## What This Does NOT Do

- No auto-reassignment of leads
- No escalation outside 8am-8pm Malta time
- No SMS — WhatsApp only
- No per-brand escalation contacts — all go to Mert
- No CEO Cockpit widget (Phase 2)

## Decisions Made

| Decision | Choice | Rationale |
|---|---|---|
| Timer for overnight leads | Starts at 8am | Leads at 2am shouldn't trigger escalation at 2:15am |
| Cron interval | 5 minutes | Fast enough to catch 15-min tier; avoids excessive API calls |
| Direct HTTP vs MCP | Direct HTTP to WA bridge | Cron runs outside Claude Code, can't use MCP tools |
| Escalation idempotency | Track Escalation_Level per lead | Never re-send same tier; only escalate upward |
| Tier 1 via Zoho | Email only | Simple, zero-maintenance, works even if cron is down |
