# Carisma Slimming — Meta Ads Reference

## Ad Account

| Field | Value |
|---|---|
| **Account Name** | Carisma Slimming |
| **Account ID** | `act_1496776195316716` |
| **Account Status** | Active |
| **Currency** | USD |
| **Total Spent** | $1,163.20 |
| **Timezone** | Europe/Malta |
| **Business Location** | Swieqi, Malta |
| **Payment Method** | Mastercard *9011 |

> **Note:** This account uses USD, not EUR. Keep this in mind when comparing budgets and CPL across brands.

## Facebook Page

| Field | Value |
|---|---|
| **Page Name** | Carisma Slimming |
| **Page ID** | `923445584188552` |
| **Username** | @carismaslimming |
| **Category** | Weight loss centre |
| **Followers** | 180 |
| **URL** | https://www.facebook.com/carismaslimming |

## Active Campaigns (as of Feb 26, 2026)

| Campaign | ID | Objective | Daily Budget | Bid Strategy | Started |
|---|---|---|---|---|---|
| CBO_MWL_AfterBaby | `120243268136690017` | Leads | $10.00 | Lowest Cost | Feb 26, 2026 |
| CBO_MWL_Pain-Solution | `120242920452760017` | Leads | $20.00 | Lowest Cost | Feb 18, 2026 |
| CBO_MWL_Menopause | `120242919964590017` | Leads | $13.00 | Lowest Cost | Feb 18, 2026 |
| CBO_MWL_RiskReversal | `120242919520010017` | Leads | $15.00 | Lowest Cost | Feb 18, 2026 |
| CBO_SkinTight | `120242760708010017` | Leads | $5.00 | Lowest Cost | Feb 13, 2026 |
| CBO_MuscleStim | `120242760574090017` | Leads | $15.00 | Lowest Cost | Feb 13, 2026 |
| CBO_FatFreeze | `120242759417850017` | Leads | $15.00 | Lowest Cost | Feb 13, 2026 |

**Total daily budget across active campaigns: $93.00**

## How to Use This Reference

When working on Slimming marketing tasks, always use:
- **Ad Account:** `act_1496776195316716`
- **Page ID:** `923445584188552` (required when creating ad creatives)

### Pulling Insights
```
Use: get_insights(object_id="act_1496776195316716", level="campaign", time_range="last_30d")
```

### Checking Campaign Performance
```
Use: get_campaigns(account_id="act_1496776195316716", status_filter="ACTIVE")
```

### Creating New Campaigns
All campaigns must be created in **PAUSED** status. Follow CBO structure. Naming convention: `CBO_[Treatment/Angle]`

## Related Files
- Brand voice: `../../config/branding_guidelines.md` (Slimming section)
- Offers: `../../config/carisma_slimming_evergreen_offers.md`
- Creative angles: `../../config/performance_marketing_angles.md`
- Competitive intel: `../../config/creative_strategy_competitive_intelligence.md`
