# Speed to Lead — Zoho CRM Deluge Functions & Deployment Guide

Deluge custom functions for tracking lead response time across all 3 CRMs (Spa, Aesthetics, Slimming).

**Status:** Fields created via API on 2026-04-17. Workflow rules + scheduled functions need manual deployment in Zoho CRM UI.

---

## Custom Fields (CREATED)

All 4 fields are now live on all 3 CRMs with identical API names:

| Field Label | API Name | Type | Spa ID | Aesthetics ID | Slimming ID |
|---|---|---|---|---|---|
| First Contacted Time | `First_Contacted_Time` | DateTime | 189957000054218001 | 524228000043846049 | 956933000003982041 |
| Response Time (Minutes) | `Response_Time_Minutes` | Double | 189957000054204222 | 524228000043446015 | 956933000004007045 |
| Response Status | `Response_Status` | Picklist | 189957000054210224 | 524228000043447003 | 956933000003948019 |
| Campaign Entry Time | `Campaign_Entry_Time` | DateTime | 189957000054202018 | 524228000043442002 | 956933000003969079 |

**TODO:** Set `Response_Status` default value to **Not Called** in each CRM's field properties (Setup > Customization > Modules > Leads > Fields > Response Status > Properties).

---

## Function 1: `stampFirstContact`

**Type:** Workflow Custom Function
**Trigger:** When Lead_Status changes to any "contacted" status
**Input Parameter:** `leadId` (String)

This is the primary function to deploy. It stamps the first contact time and calculates response time in one shot.

```java
// ============================================================
// stampFirstContact
// ============================================================
// Stamps First_Contacted_Time on a lead when its status changes
// to a "contacted" status, then calculates Response_Time_Minutes.
//
// Input:  leadId (String) — the record ID of the lead
// Trigger: Workflow rule on Lead_Status field change
// ============================================================

// Fetch the lead record
leadResp = zoho.crm.getRecordById("Leads", leadId.toLong());

if (leadResp == null)
{
    info "stampFirstContact: Lead not found — ID: " + leadId;
    return;
}

createdTime = leadResp.get("Created_Time");
firstContactedTime = leadResp.get("First_Contacted_Time");

// Only stamp if First_Contacted_Time has not been set yet.
// This ensures we capture the FIRST contact, not subsequent ones.
if (firstContactedTime == null || firstContactedTime == "")
{
    now = zoho.currenttime;
    
    // Calculate response time in minutes
    // Created_Time comes as a string; parse it to a date-time object
    createdDT = createdTime.toTime();
    diffMillis = now.toLong() - createdDT.toLong();
    diffMinutes = (diffMillis / 1000 / 60).round(1);
    
    // Determine response status
    responseStatus = "Called";
    
    // Build the update map
    updateMap = Map();
    updateMap.put("First_Contacted_Time", now.toString("yyyy-MM-dd'T'HH:mm:ssZ"));
    updateMap.put("Response_Time_Minutes", diffMinutes);
    updateMap.put("Response_Status", responseStatus);
    
    // Update the lead
    updateResp = zoho.crm.updateRecord("Leads", leadId.toLong(), updateMap);
    
    info "stampFirstContact: Lead " + leadId + " — Response time: " + diffMinutes + " min | Status: " + responseStatus;
    info "stampFirstContact: Update response: " + updateResp;
}
else
{
    info "stampFirstContact: Lead " + leadId + " already has First_Contacted_Time = " + firstContactedTime + ". Skipping.";
}
```

---

## Function 2: `calculateResponseTime`

**Type:** Workflow Custom Function (standalone calculator)
**Input Parameter:** `leadId` (String)

Use this if you want a separate function that only calculates response time (e.g., called from other automations). In most cases, `stampFirstContact` above is sufficient.

```java
// ============================================================
// calculateResponseTime
// ============================================================
// Calculates the response time in minutes between Created_Time
// and First_Contacted_Time. Sets Response_Status to "Called".
//
// Input:  leadId (String) — the record ID of the lead
// ============================================================

leadResp = zoho.crm.getRecordById("Leads", leadId.toLong());

if (leadResp == null)
{
    info "calculateResponseTime: Lead not found — ID: " + leadId;
    return;
}

createdTime = leadResp.get("Created_Time");
firstContactedTime = leadResp.get("First_Contacted_Time");

// If First_Contacted_Time is not set, stamp it now
if (firstContactedTime == null || firstContactedTime == "")
{
    firstContactedTime = zoho.currenttime;
    info "calculateResponseTime: No First_Contacted_Time found. Using current time.";
}
else
{
    firstContactedTime = firstContactedTime.toTime();
}

// Calculate difference in minutes
createdDT = createdTime.toTime();
diffMillis = firstContactedTime.toLong() - createdDT.toLong();
diffMinutes = (diffMillis / 1000 / 60).round(1);

// Update the lead record
updateMap = Map();
updateMap.put("First_Contacted_Time", firstContactedTime.toString("yyyy-MM-dd'T'HH:mm:ssZ"));
updateMap.put("Response_Time_Minutes", diffMinutes);
updateMap.put("Response_Status", "Called");

updateResp = zoho.crm.updateRecord("Leads", leadId.toLong(), updateMap);

info "calculateResponseTime: Lead " + leadId + " — Response time: " + diffMinutes + " min";
info "calculateResponseTime: Update response: " + updateResp;
```

---

## Function 3: `markOverdueLeads`

**Type:** Scheduled Custom Function (runs every 15 minutes)
**Input Parameters:** None

```java
// ============================================================
// markOverdueLeads
// ============================================================
// Scheduled function that runs every 15 minutes.
// Finds leads with Response_Status = "Not Called" (or empty)
// whose Created_Time is more than 60 minutes ago, and marks
// them as "Overdue (60+ min)".
//
// Uses COQL for efficient querying with pagination.
// ============================================================

// 60-minute threshold: calculate the cutoff time
now = zoho.currenttime;
cutoffTime = now.subMinutes(60);
cutoffStr = cutoffTime.toString("yyyy-MM-dd'T'HH:mm:ss+00:00");

info "markOverdueLeads: Running at " + now + " | Cutoff: " + cutoffStr;

// ---- Batch 1: Response_Status = "Not Called" ----
page = 1;
moreRecords = true;
totalUpdated = 0;

while (moreRecords)
{
    offset = (page - 1) * 200;
    
    // COQL query to find leads that are "Not Called" and created before cutoff
    query = "SELECT id, Created_Time, Response_Status FROM Leads WHERE Response_Status = 'Not Called' AND Created_Time < '" + cutoffStr + "' LIMIT " + offset + ", 200";
    
    coqlResp = zoho.crm.invokeConnector("crm.coql", {"select_query": query});
    
    info "markOverdueLeads: COQL response (page " + page + "): " + coqlResp;
    
    if (coqlResp != null && coqlResp.get("data") != null)
    {
        records = coqlResp.get("data");
        recordCount = records.size();
        info "markOverdueLeads: Found " + recordCount + " 'Not Called' leads on page " + page;
        
        for each rec in records
        {
            recId = rec.get("id");
            updateMap = Map();
            updateMap.put("Response_Status", "Overdue (60+ min)");
            
            updateResp = zoho.crm.updateRecord("Leads", recId.toLong(), updateMap);
            totalUpdated = totalUpdated + 1;
            
            info "markOverdueLeads: Marked lead " + recId + " as Overdue";
        }
        
        // Check if there are more records
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
        info "markOverdueLeads: No more 'Not Called' records found on page " + page;
    }
}

// ---- Batch 2: Response_Status is null/empty ----
// Some leads may not have a Response_Status set at all
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
        info "markOverdueLeads: Found " + recordCount + " null-status leads on page " + page;
        
        for each rec in records
        {
            recId = rec.get("id");
            updateMap = Map();
            updateMap.put("Response_Status", "Overdue (60+ min)");
            
            updateResp = zoho.crm.updateRecord("Leads", recId.toLong(), updateMap);
            totalUpdated = totalUpdated + 1;
            
            info "markOverdueLeads: Marked lead " + recId + " as Overdue (was null)";
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
        info "markOverdueLeads: No more null-status records found on page " + page;
    }
}

info "markOverdueLeads: Complete. Total leads marked overdue: " + totalUpdated;
```

---

## Workflow Rule Configuration

### Step 1: Create the Custom Functions

Do this in **each CRM** (Spa, Aesthetics, Slimming):

1. Go to **Setup > Automation > Custom Functions**
2. Click **+ New Custom Function**
3. **Function Name:** `stampFirstContact`
4. **Module:** Leads
5. **Category:** Automation
6. Paste the `stampFirstContact` code from above
7. Click **Edit Arguments** and add:
   - **Name:** `leadId` | **Value:** `#Lead Id` (select from the Leads module merge fields)
8. Click **Save**

Repeat to create `markOverdueLeads` (no arguments needed — it is a scheduled function).

### Step 2: Workflow Rule for `stampFirstContact`

Create this workflow rule in **each CRM**. The criteria differ per brand.

1. Go to **Setup > Automation > Workflow Rules**
2. Click **+ Create Rule**
3. **Module:** Leads
4. **Rule Name:** `Speed to Lead — Stamp First Contact`
5. **Description:** `Stamps First_Contacted_Time and calculates response time when a lead is first contacted`
6. **When:** `A record is edited`
7. **Condition:** Field `Lead_Status` is modified

#### Criteria per CRM

**Aesthetics CRM:**

```
Lead_Status is any of:
  - Contacted us
  - Attempted to Contact
  - Pre-Qualified
  - No consult - Follow-up
  - Existing customer info
```

**Slimming CRM:**

```
Lead_Status is any of:
  - Contacted
  - Contacted us
  - Attempted to Contact
  - Pre-Qualified
  - No consult - Follow-up
  - Existing customer info
```

**Spa CRM:**

```
Lead_Status is any of:
  - Contacted
  - Must Contact
  - Pre-Qualified
  - Lead Created Via Email
  - Lead Created Via Social
  - Moved to Deal
```

8. **Instant Actions > Function:** Select `stampFirstContact`
9. Confirm the argument mapping: `leadId` = `#Lead Id`
10. Click **Save**

### Step 3: Schedule `markOverdueLeads`

1. Go to **Setup > Automation > Schedules**
2. Click **+ Create New Schedule**
3. **Schedule Name:** `Mark Overdue Leads`
4. **Function:** Select `markOverdueLeads`
5. **Frequency:** Every day, repeating every **15 minutes**
   - Zoho's scheduler UI: select **Minutes** interval and set to `15`
   - If the minimum interval available is 1 hour, set it to hourly and note the limitation
6. **Start Time:** Set to the next quarter-hour
7. Click **Save**

> **Note on Zoho Schedule Limits:** Zoho CRM allows a minimum schedule interval of **1 hour** on most plans. If 15-minute intervals are not available, set it to every 1 hour. For true 15-minute intervals, consider using Zoho Flow or an external cron service to call a standalone Deluge function via the CRM API.

---

## Testing Checklist

After deploying to each CRM:

- [ ] Create a test lead. Verify `Response_Status` defaults to "Not Called"
- [ ] Change the test lead's status to a "contacted" value. Verify:
  - `First_Contacted_Time` is stamped
  - `Response_Time_Minutes` is calculated correctly
  - `Response_Status` changes to "Called"
- [ ] Change the lead status again to another "contacted" value. Verify `First_Contacted_Time` does NOT change (preserves the first contact)
- [ ] Create a test lead and wait 60+ minutes (or temporarily change the threshold). Run `markOverdueLeads` manually from Setup > Schedules > Run Now. Verify `Response_Status` changes to "Overdue (60+ min)"
- [ ] Check function logs: Setup > Automation > Custom Functions > select function > Logs

---

## Architecture Notes

```
Lead Created (Created_Time auto-set, Response_Status = "Not Called")
       |
       v
  [Wait for sales rep to contact]
       |
       +---> Status changed to "contacted" value
       |         |
       |         v
       |     stampFirstContact fires:
       |       - Sets First_Contacted_Time = now
       |       - Calculates Response_Time_Minutes
       |       - Sets Response_Status = "Called"
       |
       +---> 60+ minutes pass with no contact
                 |
                 v
             markOverdueLeads (scheduled):
               - Sets Response_Status = "Overdue (60+ min)"
```

## Reporting

Once the fields are populated, create a custom report in each CRM:

1. **Setup > Reports > + Create Report**
2. **Module:** Leads
3. **Columns:** Lead Name, Created Time, First Contacted Time, Response Time (Minutes), Response Status, Lead Owner
4. **Group by:** Lead Owner
5. **Aggregate:** AVG of Response_Time_Minutes, COUNT of each Response_Status
6. **Filter:** Created Time = This Month

This gives you average response time per rep and the percentage of leads that went overdue.

---

## Phase 2: Escalation System (To Be Built)

The escalation system ensures no lead falls through the cracks. When a lead goes unanswered beyond defined thresholds, automatic escalation kicks in.

### Escalation Tiers

| Tier | Trigger | Action | Owner |
|---|---|---|---|
| **Tier 1 — Nudge** | Lead not contacted within 15 min | WhatsApp/push notification to assigned rep | Assigned Rep |
| **Tier 2 — Reassign** | Lead not contacted within 30 min | Auto-reassign to next available rep + alert team lead | Next Available Rep |
| **Tier 3 — Manager Alert** | Lead not contacted within 60 min | Email + WhatsApp to Sales Manager with lead details | Sales Manager |
| **Tier 4 — Escalation Log** | Lead not contacted within 2 hours | Log to escalation report, flag on CEO Cockpit dashboard | Management |

### Implementation Options

**Option A: Zoho CRM Native (Recommended for speed)**
- Workflow rules with time-based actions (Zoho supports "X minutes after trigger")
- Email alerts at each tier
- Field update to track escalation level (`Escalation_Level` picklist: None, Tier 1, Tier 2, Tier 3, Tier 4)
- Limitation: WhatsApp integration requires Zoho Flow or external webhook

**Option B: External Cron + WhatsApp MCP (Recommended for full control)**
- Scheduled Python script (every 5 min) queries leads via Zoho CRM MCP
- Checks `Created_Time` vs current time for uncontacted leads
- Sends WhatsApp messages via WhatsApp MCP at each tier threshold
- Updates `Escalation_Level` field via CRM MCP
- Logs all escalations to Supabase for CEO Cockpit reporting

**Option C: Hybrid (Best of both)**
- Zoho CRM time-based workflow for Tier 1 email alert (zero setup)
- External cron for Tier 2-4 with WhatsApp + reassignment + dashboard logging
- Keeps simple alerts in Zoho, complex logic in Python

### New Fields Needed for Escalation

| Field | API Name | Type | Values |
|---|---|---|---|
| Escalation Level | `Escalation_Level` | Picklist | None, Tier 1 - Nudge, Tier 2 - Reassigned, Tier 3 - Manager Alert, Tier 4 - Logged |
| Escalation Time | `Escalation_Time` | DateTime | When escalation was last triggered |
| Original Owner | `Original_Lead_Owner` | Lookup (Users) | Preserves who was originally assigned before reassignment |

### Decisions Needed From You

1. **Which option** (A/B/C) do you prefer?
2. **WhatsApp alerts** — Do you want escalation notifications via WhatsApp (requires Option B or C)?
3. **Auto-reassignment** — Should Tier 2 actually reassign the lead, or just alert?
4. **Thresholds** — Are 15/30/60/120 min the right tiers, or do you want different timing?
5. **Who gets escalated to** — Sales manager name/contact per brand?
6. **Business hours only** — Should escalation only run during working hours (e.g., 8am-8pm)?

### Implementation Estimate

| Component | Effort |
|---|---|
| Escalation fields (API creation) | 30 min |
| Zoho workflow rules (Tier 1) | 1 hour per CRM |
| Python escalation cron (Tier 2-4) | 2-3 hours |
| WhatsApp notification integration | 1 hour |
| CEO Cockpit escalation widget | 2 hours |
| Testing across all 3 brands | 1 hour |
