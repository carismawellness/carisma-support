# Speed to Lead + Escalation System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deploy Speed to Lead tracking and a 4-tier escalation system across all 3 Zoho CRM instances (Spa, Aesthetics, Slimming).

**Architecture:** Hybrid system — Zoho native workflow rules handle Tier 1 email alerts and speed-to-lead stamping; a Python cron script (`escalation_check.py`) handles Tier 2-4 WhatsApp escalation. All custom fields already exist on all 3 CRMs. Code is written — this plan covers deployment, configuration, and testing.

**Tech Stack:** Zoho CRM (Deluge functions, workflow rules, schedules), Python 3.11+, WhatsApp bridge (localhost:8080), Supabase (PostgreSQL), macOS launchd

---

## What's Already Built

| Component | Path | Status |
|---|---|---|
| Custom fields (6 per CRM) | Created via API | DONE |
| Deluge function code | `03-Sales/speed-to-lead/zoho_deluge_functions.md` | Written, needs deploy |
| ETL (updated) | `Tech/CEO-Cockpit/etl/etl_zoho_crm.py` | DONE |
| Escalation script | `Tools/escalation_check.py` | Written, tested |
| Supabase migration | `Tech/CEO-Cockpit/supabase/migrations/019_create_escalation_log.sql` | Written, needs run |
| launchd plist | `~/Library/LaunchAgents/com.carisma.escalation-check.plist` | Written, needs load |
| Design doc | `Docs/plans/2026-04-17-escalation-system-design.md` | DONE |

## Field Reference (All CRMs)

| Field | API Name | Spa ID | Aesthetics ID | Slimming ID |
|---|---|---|---|---|
| First Contacted Time | `First_Contacted_Time` | 189957000054218001 | 524228000043846049 | 956933000003982041 |
| Response Time (Minutes) | `Response_Time_Minutes` | 189957000054204222 | 524228000043446015 | 956933000004007045 |
| Response Status | `Response_Status` | 189957000054210224 | 524228000043447003 | 956933000003948019 |
| Campaign Entry Time | `Campaign_Entry_Time` | 189957000054202018 | 524228000043442002 | 956933000003969079 |
| Escalation Level | `Escalation_Level` | 189957000055486505 | 524228000043855416 | 956933000003933034 |
| Escalation Time | `Escalation_Time` | 189957000055627779 | 524228000043841251 | 956933000003961261 |

---

## Task 1: Set Field Defaults in Zoho CRM UI (All 3 CRMs)

**Where:** Zoho CRM > Setup > Customization > Modules and Fields > Leads

Do this in each CRM (Spa, Aesthetics, Slimming):

**Step 1: Set Response_Status default to "Not Called"**

1. Go to **Setup** (gear icon top-right)
2. Click **Customization > Modules and Fields**
3. Select **Leads** module
4. Find **Response Status** field in the layout
5. Click the field to edit it
6. Under **Properties**, set **Default Value** to `Not Called`
7. Click **Save**

**Step 2: Set Escalation_Level default to "None"**

1. Same path: Setup > Customization > Modules and Fields > Leads
2. Find **Escalation Level** field
3. Set **Default Value** to `None`
4. Click **Save**

**Step 3: Verify**

Create a test lead in each CRM. Confirm:
- Response Status = "Not Called" automatically
- Escalation Level = "None" automatically

**Commit:** N/A (Zoho UI config only)

---

## Task 2: Deploy `stampFirstContact` Deluge Function (All 3 CRMs)

**Source:** `03-Sales/speed-to-lead/zoho_deluge_functions.md` → Function 1

Do this in each CRM (Spa, Aesthetics, Slimming):

**Step 1: Create the custom function**

1. Go to **Setup > Automation > Custom Functions**
2. Click **+ New Custom Function**
3. Set:
   - **Function Name:** `stampFirstContact`
   - **Display Name:** `Stamp First Contact`
   - **Module:** Leads
   - **Category:** Automation
4. Paste the `stampFirstContact` code from the Deluge doc (lines 32-85)
5. Click **Edit Arguments**
6. Add argument:
   - **Name:** `leadId`
   - **Parameter Type:** String
   - **Value:** Select **Leads** > **Lead Id** (the `${Leads.Lead Id}` merge field)
7. Click **Save & Close**

**Step 2: Verify function saved**

Check it appears in the Custom Functions list with correct name and argument.

---

## Task 3: Deploy `markOverdueLeads` Deluge Function (All 3 CRMs)

**Source:** `03-Sales/speed-to-lead/zoho_deluge_functions.md` → Function 3

Do this in each CRM:

**Step 1: Create the custom function**

1. Go to **Setup > Automation > Custom Functions**
2. Click **+ New Custom Function**
3. Set:
   - **Function Name:** `markOverdueLeads`
   - **Display Name:** `Mark Overdue Leads`
   - **Module:** Leads
   - **Category:** Automation
4. Paste the `markOverdueLeads` code from the Deluge doc (lines 153-271)
5. **No arguments needed** — this is a standalone scheduled function
6. Click **Save & Close**

---

## Task 4: Create Workflow Rule — "Stamp First Contact" (All 3 CRMs)

**Where:** Zoho CRM > Setup > Automation > Workflow Rules

Do this in each CRM. The **criteria differ per brand**.

**Step 1: Create the rule**

1. Go to **Setup > Automation > Workflow Rules**
2. Click **+ Create Rule**
3. Set:
   - **Module:** Leads
   - **Rule Name:** `Speed to Lead — Stamp First Contact`
   - **Description:** `Stamps First_Contacted_Time and calculates Response_Time_Minutes when a lead is first contacted`
4. **When should this rule trigger?**
   - Select: `On a record action` > `Edit`
5. **Which records should this rule apply to?**
   - Select: `Records matching certain conditions`
6. Set the **condition**:

**For Aesthetics CRM:**
```
Lead_Status is any of:
  Contacted us
  Attempted to Contact
  Pre-Qualified
  No consult - Follow-up
  Existing customer info
```

**For Slimming CRM:**
```
Lead_Status is any of:
  Contacted
  Contacted us
  Attempted to Contact
  Pre-Qualified
  No consult - Follow-up
  Existing customer info
```

**For Spa CRM:**
```
Lead_Status is any of:
  Contacted
  Must Contact
  Pre-Qualified
  Lead Created Via Email
  Lead Created Via Social
  Moved to Deal
```

7. Under **Instant Actions**, click **Function**
8. Select `stampFirstContact`
9. Confirm the argument mapping: `leadId` = Lead Id
10. Click **Save**

**Step 2: Verify rule is active**

Check the rule appears in the Workflow Rules list with status "Active".

---

## Task 5: Create Schedule — "Mark Overdue Leads" (All 3 CRMs)

**Where:** Zoho CRM > Setup > Automation > Schedules

Do this in each CRM:

**Step 1: Create the schedule**

1. Go to **Setup > Automation > Schedules**
2. Click **+ Create New Schedule**
3. Set:
   - **Schedule Name:** `Mark Overdue Leads`
   - **Custom Function:** Select `markOverdueLeads`
4. **Frequency:**
   - Select **Every day**
   - Set interval to **1 hour** (Zoho minimum on most plans)
   - Start time: next hour mark
5. Click **Save**

**Note:** Zoho CRM's minimum schedule interval is typically 1 hour. The Deluge doc mentions 15 minutes, but that requires Zoho Flow or an external cron. 1 hour is sufficient — the Python escalation script (every 5 min) catches time-sensitive leads.

---

## Task 6: Create Workflow Rule — "Tier 1 Email Alert" (All 3 CRMs)

**Where:** Zoho CRM > Setup > Automation > Workflow Rules

Do this in each CRM:

**Step 1: Create the rule**

1. Go to **Setup > Automation > Workflow Rules**
2. Click **+ Create Rule**
3. Set:
   - **Module:** Leads
   - **Rule Name:** `Escalation — Tier 1 Email Nudge`
   - **Description:** `Sends email to lead owner 15 minutes after lead creation if still uncontacted`
4. **When should this rule trigger?**
   - Select: `On a record action` > `Create`
5. **Which records?**
   - All records (every new lead gets this)
6. Under **Scheduled Actions**, click **+ Add**:
   - **Execution Time:** `15 minutes after rule trigger`
   - **Action:** Email Notification
7. **Configure the email:**
   - **To:** `Lead Owner`
   - **Subject:** `⏰ Speed to Lead Alert — ${Leads.Last Name} needs contact`
   - **Body:**
   ```
   Hi ${Leads.Lead Owner},

   The following lead has been waiting 15+ minutes without contact:

   Name: ${Leads.Last Name}
   Phone: ${Leads.Phone}
   Campaign: ${Leads.Ad Campaign}
   Created: ${Leads.Created Time}

   Please contact them immediately. Speed to lead directly impacts conversion rates.

   — Carisma CRM
   ```
8. **Add a condition** to the scheduled action:
   - Only execute if `Response_Status` equals `Not Called` (this prevents the email if the lead was already contacted within the 15 minutes)
9. Click **Save**

---

## Task 7: Run Supabase Migration

**File:** `Tech/CEO-Cockpit/supabase/migrations/019_create_escalation_log.sql`

**Step 1: Run the migration**

```bash
cd Tech/CEO-Cockpit
npx supabase db push
```

Or if using the Supabase dashboard:
1. Go to SQL Editor
2. Paste the contents of `019_create_escalation_log.sql`
3. Click **Run**

**Step 2: Verify**

```sql
SELECT * FROM escalation_log LIMIT 1;
-- Should return empty results (no error)
```

**Commit:**
```bash
git add Tech/CEO-Cockpit/supabase/migrations/019_create_escalation_log.sql
git commit -m "feat(cockpit): add escalation_log table for speed-to-lead tracking"
```

---

## Task 8: Load and Activate launchd Plist

**File:** `~/Library/LaunchAgents/com.carisma.escalation-check.plist`

**Step 1: Load the plist**

```bash
launchctl load ~/Library/LaunchAgents/com.carisma.escalation-check.plist
```

**Step 2: Verify it's loaded**

```bash
launchctl list | grep carisma.escalation
```

Expected: Shows `com.carisma.escalation-check` with a PID or `-` status.

**Step 3: Test a manual run**

```bash
python3 "/Users/mertgulen/Library/CloudStorage/GoogleDrive-mertgulen98@gmail.com/My Drive/Carisma Wellness Group/Carisma AI /Carisma AI/Tools/escalation_check.py"
```

Expected output (if during business hours):
```
HH:MM:SS [escalation] Escalation check starting at 2026-04-17 HH:MM Malta
HH:MM:SS [escalation] [spa] 0 escalations
HH:MM:SS [escalation] [aesthetics] 0 escalations
HH:MM:SS [escalation] [slimming] 0 escalations
HH:MM:SS [escalation] Done. Total escalations: 0
```

If outside business hours:
```
HH:MM:SS [escalation] Outside business hours (HH:MM Malta). Exiting.
```

**Step 4: Check logs**

```bash
tail -f /tmp/carisma-escalation.log
```

---

## Task 9: End-to-End Test (All 3 CRMs)

Test the full pipeline with a real lead in each CRM.

**Step 1: Create a test lead in Aesthetics CRM**

Via Zoho CRM UI or API — create a lead with:
- Last Name: `TEST-STL-Delete-Me`
- Phone: `+356 0000 0000`
- Lead Status: leave as default (null or "Not Contacted")

**Step 2: Verify defaults**

Check the lead record:
- `Response_Status` = "Not Called" ✓
- `Escalation_Level` = "None" ✓
- `First_Contacted_Time` = null ✓

**Step 3: Wait 15 minutes — verify Tier 1 email**

- After 15 min, the lead owner should receive the Tier 1 email alert
- Check inbox of the assigned lead owner

**Step 4: Change Lead_Status to "Contacted us"**

Edit the test lead and change Lead_Status to "Contacted us".

**Step 5: Verify stampFirstContact fired**

Check the lead record:
- `First_Contacted_Time` = timestamp of the status change ✓
- `Response_Time_Minutes` = minutes between creation and now ✓
- `Response_Status` = "Called" ✓

**Step 6: Verify no further escalation**

Run the escalation script manually:
```bash
python3 Tools/escalation_check.py
```
Confirm the test lead is NOT escalated (it was contacted).

**Step 7: Test escalation flow**

Create another test lead and do NOT contact it.
- Wait 30+ min → verify WhatsApp arrives to +356 99503020
- Check `Escalation_Level` updated to "Tier 2" on the lead
- Check `escalation_log` table in Supabase has a row

**Step 8: Repeat for Spa and Slimming CRMs**

Same flow, adjusting Lead_Status values per brand.

**Step 9: Clean up test leads**

Delete all `TEST-STL-*` leads from each CRM.

---

## Task 10: Commit All Remaining Code

**Step 1: Stage and commit**

```bash
git add Tools/escalation_check.py
git add Docs/plans/2026-04-17-escalation-system-design.md
git add Docs/plans/2026-04-17-stl-escalation-implementation.md
git add 03-Sales/speed-to-lead/zoho_deluge_functions.md
git add Tech/CEO-Cockpit/etl/etl_zoho_crm.py
git commit -m "feat(sales): speed to lead tracking + escalation system across all 3 CRMs

- Custom fields deployed on Spa, Aesthetics, Slimming via API
- Deluge functions: stampFirstContact, markOverdueLeads
- Escalation script with 4-tier WhatsApp alerts (8am-8pm Malta)
- Business-hours-aware timer for overnight leads
- Supabase escalation_log table for dashboard tracking
- ETL updated to use First_Contacted_Time field"
```

---

## Post-Deployment Checklist

| Item | Spa | Aesthetics | Slimming |
|---|---|---|---|
| Response_Status default = "Not Called" | [ ] | [ ] | [ ] |
| Escalation_Level default = "None" | [ ] | [ ] | [ ] |
| `stampFirstContact` function deployed | [ ] | [ ] | [ ] |
| `markOverdueLeads` function deployed | [ ] | [ ] | [ ] |
| "Stamp First Contact" workflow rule active | [ ] | [ ] | [ ] |
| "Mark Overdue Leads" schedule active | [ ] | [ ] | [ ] |
| "Tier 1 Email Nudge" workflow rule active | [ ] | [ ] | [ ] |
| Test lead → contacted → fields populated | [ ] | [ ] | [ ] |
| Test lead → 30 min → WhatsApp received | [ ] | [ ] | [ ] |
| Supabase migration applied | [ ] | N/A | N/A |
| launchd plist loaded | [ ] | N/A | N/A |
