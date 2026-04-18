# Auto-Assign Deal Values from Meta Ads Campaigns

**Purpose:** Automatically set the Deal Amount when a new deal is created, based on which Meta Ads campaign brought the lead in.

**Last Updated:** 2026-04-17

---

## Architecture

Two layers of automation ensure no deal goes without a value:

### Layer 1: Zoho CRM Workflow Rule (Real-time)
- Triggers instantly when a new Deal is created
- Calls a Custom Function (Deluge) that looks up the campaign from the related Lead
- Sets Deal Amount based on the campaign → package mapping

### Layer 2: Python Script Catchall (Periodic)
- `Tools/assign_deal_values.py` runs periodically to catch any misses
- Handles deals created from non-standard flows
- Can be run manually or via cron

---

## Setup: Zoho CRM Workflow Rule

**Do this for each CRM org: Slimming, Aesthetics, Spa**

### Step 1: Create the Custom Function

1. Go to **Setup → Developer Space → Functions**
2. Click **+ New Function**
3. Name: `auto_assign_deal_value`
4. Category: `Automation`
5. Module: `Deals`
6. Paste the Deluge script below (brand-specific versions provided)

### Step 2: Create the Workflow Rule

1. Go to **Setup → Automation → Workflow Rules**
2. Click **+ Create Rule**
3. Module: **Deals**
4. Rule Name: `Auto-Assign Deal Value from Campaign`
5. When to Execute: **On a record action → Create**
6. Condition: `Amount is empty`
7. Instant Action: **Function → auto_assign_deal_value**
8. Pass `dealId` = `${Deals.Deal Id}`

---

## Deluge Scripts

### SLIMMING CRM

```deluge
// Auto-assign deal value based on Meta Ads campaign
// Triggered when a new Deal is created with empty Amount

dealId = input.dealId.toLong();
deal = zoho.crm.getRecordById("Deals", dealId);
dealName = deal.get("Deal_Name").toLowerCase().trim();

// Search for matching lead by name
searchCriteria = "(Full_Name:equals:" + deal.get("Deal_Name") + ")";
leads = zoho.crm.searchRecords("Leads", searchCriteria);

if(leads.size() > 0)
{
    lead = leads.get(0);
    campaign = ifnull(lead.get("Ad_Campaign"), "");

    // Campaign → Deal Value mapping
    campaignMap = Map();
    campaignMap.put("CBO_FatFreeze", 199);
    campaignMap.put("CBO_MuscleStim", 199);
    campaignMap.put("CBO_SkinTight", 199);
    campaignMap.put("CBO_MWL_RiskReversal", 199);
    campaignMap.put("CBO_MWL_Menopause", 199);
    campaignMap.put("CBO_MWL_Pain-Solution", 199);
    campaignMap.put("CBO_MWL_AfterBaby", 199);

    if(campaignMap.containsKey(campaign))
    {
        dealValue = campaignMap.get(campaign);
        updateMap = Map();
        updateMap.put("Amount", dealValue);
        zoho.crm.updateRecord("Deals", dealId, updateMap);
        info "Deal " + dealId + " updated with Amount: " + dealValue + " (Campaign: " + campaign + ")";
    }
}
```

### AESTHETICS CRM

```deluge
dealId = input.dealId.toLong();
deal = zoho.crm.getRecordById("Deals", dealId);

searchCriteria = "(Full_Name:equals:" + deal.get("Deal_Name") + ")";
leads = zoho.crm.searchRecords("Leads", searchCriteria);

if(leads.size() > 0)
{
    lead = leads.get(0);
    campaign = ifnull(lead.get("Ad_Campaign"), "");

    campaignMap = Map();
    campaignMap.put("Lead | Snatch Jawline – Cost Cap 5", 149);
    campaignMap.put("Lead | LHR January", 139);
    campaignMap.put("Lead | Hair Regrowth", 399);
    campaignMap.put("Lead | Ultimate Facelift", 239);
    campaignMap.put("Lead | 4-in-1 Hydrafacial Glow", 99);
    campaignMap.put("Lead | Lip & Glow Evergreen", 219);

    if(campaignMap.containsKey(campaign))
    {
        dealValue = campaignMap.get(campaign);
        updateMap = Map();
        updateMap.put("Amount", dealValue);
        zoho.crm.updateRecord("Deals", dealId, updateMap);
        info "Deal " + dealId + " updated with Amount: " + dealValue;
    }
}
```

### SPA CRM

```deluge
dealId = input.dealId.toLong();
deal = zoho.crm.getRecordById("Deals", dealId);

searchCriteria = "(Full_Name:equals:" + deal.get("Deal_Name") + ")";
leads = zoho.crm.searchRecords("Leads", searchCriteria);

if(leads.size() > 0)
{
    lead = leads.get(0);
    campaign = ifnull(lead.get("Ad_Campaign"), "");

    campaignMap = Map();
    campaignMap.put("CBO_Leads | Gifting", 75);
    campaignMap.put("CBO_Leads | Couples Package", 199);
    campaignMap.put("CBO_Leads | Massage", 99);
    campaignMap.put("CBO_Leads | Spa Day", 99);

    if(campaignMap.containsKey(campaign))
    {
        dealValue = campaignMap.get(campaign);
        updateMap = Map();
        updateMap.put("Amount", dealValue);
        zoho.crm.updateRecord("Deals", dealId, updateMap);
        info "Deal " + dealId + " updated with Amount: " + dealValue;
    }
}
```

---

## Maintenance

### When a new campaign is added:
1. Update `Config/campaign_deal_value_mapping.json` with the new campaign name, ID, and deal value
2. Update the Deluge script's `campaignMap` in the relevant CRM org
3. Run `python3 Tools/assign_deal_values.py --brand <brand>` to backfill any existing leads

### When pricing changes:
1. Update the deal value in both the JSON config and the Deluge script
2. Note: existing deals keep their original values (only new deals get the new price)

---

## Related Files
- **Config:** `Config/campaign_deal_value_mapping.json`
- **Tool:** `Tools/assign_deal_values.py`
- **Offers:** `Config/offers.json`, `Config/carisma_slimming_evergreen_offers.md`
