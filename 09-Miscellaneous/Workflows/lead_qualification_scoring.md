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

## Architecture

The scoring system uses **two layers** for full automation:

### Layer 1: Native Zoho Scoring Rules (auto-scores new leads)
- **Deployed via**: `Tools/deploy_scoring_rules.py` (Zoho CRM v8 API)
- **Field updated**: `Positive_Score` (Zoho system field)
- **Trigger**: Automatic on every lead create/edit
- **No manual action required** — Zoho evaluates all 12 field rules automatically

### Layer 2: Temperature Workflow Rules (sets Hot/Warm/Nurture)
- **Deployed via**: `Tools/deploy_temperature_rules.py` (Zoho CRM v8 API)
- **3 rules per CRM**: one each for Hot (≥60), Warm (30–59), Nurture (<30)
- **Trigger**: create_or_edit on Leads
- **Criteria**: checks `Positive_Score` thresholds
- **Action**: field_update → sets `Lead_Temperature` picklist

### Legacy: Bulk Scoring Script (backfill + custom field)
- **Script**: `Tools/setup_lead_scoring.py`
- **Field updated**: `Qualification_Score` (custom integer field)
- **Use**: One-time backfill of existing leads, or re-scoring after model changes
- **Also sets**: `Lead_Temperature` directly

## Fields (all 3 CRMs)

| Field | API Name | Type | Source |
|-------|----------|------|--------|
| Positive Score | `Positive_Score` | System | Native scoring rules (auto) |
| Qualification Score | `Qualification_Score` | Integer (custom) | Bulk script (backfill) |
| Lead Temperature | `Lead_Temperature` | Picklist (custom) | Workflow rules (auto) |
| Response Time (Minutes) | `Response_Time_Minutes` | Double (custom) | Speed-to-Lead system |

## Scoring Rule IDs

| Brand | Scoring Rule | Temp Hot Rule | Temp Warm Rule | Temp Nurture Rule |
|-------|-------------|---------------|----------------|-------------------|
| Spa | 189957000060763091 | 189957000060754051 | 189957000060779001 | 189957000060741017 |
| Aesthetics | 524228000043990049 | 524228000043982010 | 524228000043970035 | 524228000043954046 |
| Slimming | 956933000004073068 | 956933000004126033 | 956933000004105015 | 956933000004118010 |

## Deployment

### Deploy scoring rules (one-time)
```bash
python3 Tools/deploy_scoring_rules.py           # All brands
python3 Tools/deploy_scoring_rules.py spa        # Single brand
```

### Deploy temperature workflow rules (one-time)
```bash
python3 Tools/deploy_temperature_rules.py        # All brands
python3 Tools/deploy_temperature_rules.py spa    # Single brand
```

### Bulk score existing leads (backfill)
```bash
python3 Tools/setup_lead_scoring.py              # All brands
python3 Tools/setup_lead_scoring.py spa           # Single brand
```

## How It Works for SDRs

1. **New lead comes in** → Native scoring rule calculates `Positive_Score` automatically
2. **Workflow rules fire** → `Lead_Temperature` set to Hot/Warm/Nurture based on score
3. **SDR sees on lead card**: score number + temperature label
4. **No manual action needed** — everything is automated

## Maintenance

- **Changing score weights**: Update `Tools/deploy_scoring_rules.py` field_rules, delete old scoring rule via API, redeploy
- **Adding new factors**: Add the field to CRM, add a new field_rule to the scoring rule
- **Re-scoring existing leads**: Run `python3 Tools/deploy_scoring_rules.py` (includes execute step)
- **Backfill Qualification_Score**: Run `python3 Tools/setup_lead_scoring.py`
