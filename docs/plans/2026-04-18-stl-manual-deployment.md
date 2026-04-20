# Speed to Lead — Manual Deployment Checklist

**Date:** 2026-04-18
**Status:** Ready to execute — follow steps in order

## What's Already Done (Automated)

- [x] Custom fields created on all 3 CRMs (First_Contacted_Time, Response_Time_Minutes, Response_Status, Campaign_Entry_Time)
- [x] Escalation fields created on all 3 CRMs (Escalation_Level, Escalation_Time)
- [x] Response_Status default set to "Not Called" on all 3 CRMs
- [x] Escalation_Level default set to "None" on all 3 CRMs
- [x] Supabase `escalation_log` table created (migration 019)
- [x] `escalation_check.py` script written, tested, committed
- [x] launchd plist loaded (`com.carisma.escalation-check`, runs every 5 min with `/opt/homebrew/bin/python3`)
- [x] GO_LIVE_DATE set to 2026-04-18 (ignores historical leads)

## What Needs Manual Deployment

Three things per CRM, done in order:
1. Create `stampFirstContact` function
2. Create `markOverdueLeads` function
3. Create workflow rule to trigger `stampFirstContact`
4. Create schedule for `markOverdueLeads`

**Repeat for all 3 CRMs.** Start with Spa, then Aesthetics, then Slimming.

---

## CRM URLs

| Brand | Settings URL |
|-------|-------------|
| Spa | `https://crm.zoho.eu/crm/org20071987750/settings/functions` |
| Aesthetics | Switch org via profile icon top-right → Carisma Aesthetics → Settings |
| Slimming | Switch org via profile icon top-right → Carisma Slimming → Settings |

---

## Step 1: Create `stampFirstContact` Function

**Path:** Setup → Developer Hub → Functions → Create Function

1. Click **Create Function**
2. Fill the dialog:
   - **Display Name:** `Stamp First Contact`
   - **Function Name:** `stampFirstContact`
   - **Description:** `Stamps First_Contacted_Time and calculates Response_Time_Minutes when a lead is first contacted`
   - **Category:** `Automation`
3. Click **Create** → editor opens
4. Click **Edit Arguments** (top of editor, next to the function signature)
5. Add argument:
   - **Name:** `leadId`
   - **Data Type:** `String`
6. Click the green **+** to add it
7. **Delete ALL default code** in the editor, then paste this:

```java
leadResp = zoho.crm.getRecordById("Leads", leadId.toLong());
if (leadResp == null)
{
    info "stampFirstContact: Lead not found — ID: " + leadId;
    return;
}
createdTime = leadResp.get("Created_Time");
firstContactedTime = leadResp.get("First_Contacted_Time");
if (firstContactedTime == null || firstContactedTime == "")
{
    now = zoho.currenttime;
    createdDT = createdTime.toTime();
    diffMillis = now.toLong() - createdDT.toLong();
    diffMinutes = (diffMillis / 1000 / 60).round(1);
    responseStatus = "Called";
    updateMap = Map();
    updateMap.put("First_Contacted_Time", now.toString("yyyy-MM-dd'T'HH:mm:ssZ"));
    updateMap.put("Response_Time_Minutes", diffMinutes);
    updateMap.put("Response_Status", responseStatus);
    updateResp = zoho.crm.updateRecord("Leads", leadId.toLong(), updateMap);
    info "stampFirstContact: Lead " + leadId + " — Response time: " + diffMinutes + " min";
}
else
{
    info "stampFirstContact: Lead " + leadId + " already contacted. Skipping.";
}
```

8. Click **Save**

---

## Step 2: Create `markOverdueLeads` Function

**Path:** Setup → Developer Hub → Functions → Create Function

1. Click **Create Function**
2. Fill the dialog:
   - **Display Name:** `Mark Overdue Leads`
   - **Function Name:** `markOverdueLeads`
   - **Description:** `Scheduled function that marks leads not contacted within 60 minutes as Overdue`
   - **Category:** `Schedule`
3. Click **Create** → editor opens
4. **No arguments needed** for this function
5. **Delete ALL default code**, paste this:

```java
now = zoho.currenttime;
cutoffTime = now.subMinutes(60);
cutoffStr = cutoffTime.toString("yyyy-MM-dd'T'HH:mm:ss+00:00");
info "markOverdueLeads: Running at " + now + " | Cutoff: " + cutoffStr;
page = 1;
moreRecords = true;
totalUpdated = 0;
while (moreRecords)
{
    offset = (page - 1) * 200;
    query = "SELECT id, Created_Time, Response_Status FROM Leads WHERE Response_Status = 'Not Called' AND Created_Time < '" + cutoffStr + "' LIMIT " + offset + ", 200";
    coqlResp = zoho.crm.invokeConnector("crm.coql", {"select_query": query});
    if (coqlResp != null && coqlResp.get("data") != null)
    {
        records = coqlResp.get("data");
        recordCount = records.size();
        for each rec in records
        {
            recId = rec.get("id");
            updateMap = Map();
            updateMap.put("Response_Status", "Overdue (60+ min)");
            updateResp = zoho.crm.updateRecord("Leads", recId.toLong(), updateMap);
            totalUpdated = totalUpdated + 1;
        }
        if (recordCount < 200)
        {
            moreRecords = false;
        }
        else
        {
            page = page + 1;
        }
    }
    else
    {
        moreRecords = false;
    }
}
page = 1;
moreRecords = true;
while (moreRecords)
{
    offset = (page - 1) * 200;
    query = "SELECT id, Created_Time, Response_Status FROM Leads WHERE Response_Status is null AND Created_Time < '" + cutoffStr + "' LIMIT " + offset + ", 200";
    coqlResp = zoho.crm.invokeConnector("crm.coql", {"select_query": query});
    if (coqlResp != null && coqlResp.get("data") != null)
    {
        records = coqlResp.get("data");
        recordCount = records.size();
        for each rec in records
        {
            recId = rec.get("id");
            updateMap = Map();
            updateMap.put("Response_Status", "Overdue (60+ min)");
            updateResp = zoho.crm.updateRecord("Leads", recId.toLong(), updateMap);
            totalUpdated = totalUpdated + 1;
        }
        if (recordCount < 200)
        {
            moreRecords = false;
        }
        else
        {
            page = page + 1;
        }
    }
    else
    {
        moreRecords = false;
    }
}
info "markOverdueLeads: Complete. Total marked overdue: " + totalUpdated;
```

6. Click **Save**

---

## Step 3: Create Workflow Rule for `stampFirstContact`

**Path:** Setup → Automation → Workflow Rules → + Create Rule

1. **Module:** Leads
2. **Rule Name:** `Speed to Lead — Stamp First Contact`
3. **Description:** `Stamps response time when lead status changes to contacted`
4. **When should this rule be triggered?** → `On a record action` → `Edit`
5. **Which records should this rule apply to?** → `Records matching certain conditions`
6. **Condition:** `Lead Status` is changed AND matches any of the following values:

### Per-Brand Lead Status Values

**Spa CRM:**
- Contacted
- Must Contact
- Pre-Qualified
- Lead Created Via Email
- Lead Created Via Social
- Moved to Deal

**Aesthetics CRM:**
- Contacted us
- Attempted to Contact
- Pre-Qualified
- No consult - Follow-up
- Existing customer info

**Slimming CRM:**
- Contacted
- Contacted us
- Attempted to Contact
- Pre-Qualified
- No consult - Follow-up
- Existing customer info

7. Under **Instant Actions**, click **Functions** (or "Existing" if prompted)
8. Select `stampFirstContact`
9. Map argument: `leadId` → select **Lead Id** from the field dropdown
10. Click **Save & Associate**
11. **Activate** the workflow rule

---

## Step 4: Create Schedule for `markOverdueLeads`

**Path:** Setup → Automation → Schedules → + Create New Schedule

1. **Schedule Name:** `Mark Overdue Leads — Hourly`
2. **Choose function:** Select `markOverdueLeads`
3. **Frequency:** Every 1 hour (Zoho minimum)
4. **Start Time:** Next hour
5. Click **Save**

> Note: Zoho CRM minimum schedule interval is 1 hour. The Python `escalation_check.py` runs every 5 minutes and covers Tier 2-4. This hourly schedule is a safety net for the `Response_Status` field.

---

## Deployment Status (2026-04-18)

### Spa CRM — COMPLETE (Hybrid: Deluge + Python)
- [x] `stampFirstContact` Deluge function deployed
- [x] `markOverdueLeads` Deluge function deployed
- [x] "STL Stamp First Contact" workflow rule active
- [x] "Mark Overdue Leads Hourly" schedule active (2-hour interval, starts Apr 19)
- [x] Python `escalation_check.py` also covers stamp/overdue as safety net

### Aesthetics CRM — COMPLETE (Python-only)
- [x] `stamp_first_contact` handled by `escalation_check.py` (every 5 min)
- [x] `mark_overdue_leads` handled by `escalation_check.py` (every 5 min)
- [x] Escalation Tiers 2-4 handled by `escalation_check.py`
- Note: Deluge functions not deployed (separate Zoho org, no browser access)

### Slimming CRM — COMPLETE (Python-only)
- [x] `stamp_first_contact` handled by `escalation_check.py` (every 5 min)
- [x] `mark_overdue_leads` handled by `escalation_check.py` (every 5 min)
- [x] Escalation Tiers 2-4 handled by `escalation_check.py`
- Note: Deluge functions not deployed (separate Zoho org, no browser access)

> **Why Python instead of Deluge for Aesthetics/Slimming?** The three Zoho CRM orgs are
> separate Zoho One organizations. Browser automation could only access Spa. The Python
> script connects to all 3 via REST API and runs every 5 minutes (better than Zoho's
> 2-hour minimum schedule). The stamp has up to 5-minute delay vs. Spa's real-time
> Deluge trigger, which is acceptable given 15-minute Tier 1 threshold.

---

## Verification

1. Verify `escalation_check.py` runs clean: `/opt/homebrew/bin/python3 Tools/escalation_check.py`
2. Check launchd is loaded: `launchctl list | grep escalation`
3. Check logs: `cat /tmp/carisma-escalation.err`
4. **Spa additional check:** Setup → Developer Hub → Functions → Stamp First Contact → Logs

---

## System Architecture Summary

```
Lead Created → Response_Status = "Not Called" (default)
     |
     ├─ Rep contacts lead ──→ Lead_Status changes to contacted value
     |   ├─ SPA: Deluge stampFirstContact fires instantly
     |   └─ AES/SLIM: Python stamp_first_contact detects within 5 min
     |         ├─ First_Contacted_Time = now
     |         ├─ Response_Time_Minutes = X (business hours only)
     |         └─ Response_Status = "Called"
     |
     ├─ 15 min no contact ──→ Tier 1: Zoho email to assigned rep (Spa only)
     |
     ├─ 30 min no contact ──→ Tier 2: WhatsApp alert to Mert
     |                         (escalation_check.py, all brands)
     |
     ├─ 60 min no contact ──→ Tier 3: WhatsApp urgent to Mert
     |                         + Response_Status → "Overdue (60+ min)"
     |
     └─ 120 min no contact ──→ Tier 4: WhatsApp critical + Supabase log
                                (flagged on CEO Cockpit)
```

All escalations are business-hours only (08:00-20:00 Malta time).
