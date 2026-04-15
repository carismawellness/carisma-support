# Carisma Aesthetics — Meta Ads Reference

## Ad Account

| Field | Value |
|---|---|
| **Account Name** | Carisma Aesthetics- Mar |
| **Account ID** | `act_382359687910745` |
| **Account Status** | Active |
| **Currency** | EUR |
| **Total Spent** | €45,194.27 |
| **Timezone** | America/Los_Angeles |
| **Business Location** | Malta |
| **Payment Method** | Mastercard *9011 |

## Facebook Page

| Field | Value |
|---|---|
| **Page Name** | Carisma Aesthetics |
| **Page ID** | `117681807972195` |
| **Username** | @carismaaesthetics |
| **Category** | Beauty, cosmetic & personal care |
| **Followers** | 4,546 |
| **URL** | https://www.facebook.com/carismaaesthetics |

## Active Campaigns (as of Feb 26, 2026)

| Campaign | ID | Objective | Daily Budget | Bid Strategy | Started |
|---|---|---|---|---|---|
| Lead \| LHR January | `120237487977490408` | Leads | €10.00 | Lowest Cost | Jan 13, 2026 |
| Recruitement Campaign | `120235570645790408` | Leads | CBO (adset level) | — | Dec 4, 2025 |
| Lead \| Snatch Jawline - Cost Cap 5 | `120233988990660408` | Leads | €10.00 | Cost Cap | Nov 5, 2025 |
| Lead \| Ultimate Facelift | `120232937282910408` | Leads | €8.00 | Lowest Cost | Oct 20, 2025 |
| Lead \| 4-in-1 Hydrafacial Glow | `120232934997300408` | Leads | €10.00 | Lowest Cost | Oct 20, 2025 |

**Total daily budget across active campaigns: ~€38.00+**

## How to Use This Reference

When working on Aesthetics marketing tasks, always use:
- **Ad Account:** `act_382359687910745`
- **Page ID:** `117681807972195` (required when creating ad creatives)

### Pulling Insights
```
Use: get_insights(object_id="act_382359687910745", level="campaign", time_range="last_30d")
```

### Checking Campaign Performance
```
Use: get_campaigns(account_id="act_382359687910745", status_filter="ACTIVE")
```

### Creating New Campaigns
All campaigns must be created in **PAUSED** status. Follow CBO structure. Naming convention: `Lead | [Treatment Name]`

## Related Files
- Brand voice: `../../config/branding_guidelines.md` (Aesthetics section)
- Creative angles: `../../config/performance_marketing_angles.md`
- Competitive intel: `../../config/creative_strategy_competitive_intelligence.md`
