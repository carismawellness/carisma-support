# Lead Qualification Scoring

## Objective
Automatically score every lead (0–105) across all three CRMs and display a consolidated **Qualification Score** and **Lead Temperature** (Hot / Warm / Nurture) on the lead card.

## Scoring Model (max 105 pts)

| Factor | Field | Answer | Points |
|--------|-------|--------|--------|
| **Experienced before** | `Is_this_something_you_ve_experienced_before` | "Yes, it's something I do regularly" | +20 |
| | | "Yes, I've tried it before" | +15 |
| | | "No, this would be a first for me" | +5 |
| **Timeline** | `How_soon_would_you_like_to_get_started` | "This week" | +30 |
| | | "Within 2 weeks" | +20 |
| | | "This month" | +10 |
| **Response time** | `Response_Time_Minutes` | ≤ 60 min | +25 |
| | | 61–240 min | +10 |
| **Referral** | `Lead_Source` | "External Referral" or "Employee Referral" | +15 |
| **Intent** | `What_would_help_you_most_right_now` | "I'm ready to book" | +15 |
| | | "I'd like to speak with someone" | +10 |
| | | "I'd like to know more" | +5 |

## Temperature Thresholds

| Score | Temperature | Action |
|-------|-------------|--------|
| 60+ | **Hot** | Book consultation same day |
| 30–59 | **Warm** | Standard cadence |
| <30 | **Nurture** | Nurture sequence |

## Fields Created (all 3 CRMs)

| Field | API Name | Type | Purpose |
|-------|----------|------|---------|
| Qualification Score | `Qualification_Score` | Integer | The numeric score (0–105) |
| Lead Temperature | `Lead_Temperature` | Picklist | Hot / Warm / Nurture |
| Response Time (Minutes) | `Response_Time_Minutes` | Double | Minutes from lead creation to first contact |

All fields are visible on the Standard lead layout in the "Lead Information" section.

## Auto-Scoring New Leads

### Deploy the Deluge Function

Repeat these steps in each CRM (Spa, Aesthetics, Slimming):

1. Go to **Settings → Automation → Workflow Rules**
2. Click **+ Create Rule**, select module **Leads**
3. Name: `Auto Lead Qualification Score`
4. Execute on: **Create or Edit**
5. Condition: **All Leads** (no filter)
6. Under **Instant Actions**, click **Custom Function**
7. Name: `calculateLeadScore`
8. Argument: `leadId` → mapped to **Lead Id**
9. Paste the code from `Tools/deluge_lead_scoring_function.dg`
10. Save & activate

### What the function does
- Reads the 5 scoring factors from the lead
- Calculates total score (0–105)
- Sets `Qualification_Score` and `Lead_Temperature`
- Runs on every lead create/edit

## Bulk Scoring Script

For re-scoring all existing leads (e.g. after changing the model):

```bash
python3 Tools/setup_lead_scoring.py           # All brands
python3 Tools/setup_lead_scoring.py spa        # Single brand
```

The script:
- Creates any missing fields
- Uses COQL to find unscored leads
- Batch-updates scores in groups of 100
- Handles Zoho API rate limits

## Maintenance

- **Changing score weights**: Update both `Tools/setup_lead_scoring.py` and `Tools/deluge_lead_scoring_function.dg`, then re-run the bulk script
- **Adding new factors**: Add the field to the CRM, update both scoring files, deploy updated Deluge function
- **Re-scoring**: Run `python3 Tools/setup_lead_scoring.py` — it will re-score all leads with null scores. To force re-score all, temporarily set scores to null via COQL
