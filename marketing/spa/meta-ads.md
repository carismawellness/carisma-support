# Carisma Spa & Wellness — Meta Ads Reference

## Ad Account

| Field | Value |
|---|---|
| **Account Name** | Carisma Spa & Wellness Ad Account |
| **Account ID** | `act_654279452039150` |
| **Account Status** | Active |
| **Currency** | EUR |
| **Total Spent** | €143,480.76 |
| **Timezone** | America/Los_Angeles |
| **Business Location** | Ta'Xbiex, Malta |
| **Payment Method** | Mastercard *0318 |

## Facebook Page

| Field | Value |
|---|---|
| **Page Name** | Carisma Spa & Wellness |
| **Page ID** | `375775105843811` |
| **Username** | @carismaspa |
| **Category** | Health/beauty |
| **Followers** | 13,285 |
| **URL** | https://www.facebook.com/carismaspa |

## Active Campaigns (as of Feb 26, 2026)

| Campaign | ID | Objective | Daily Budget | Bid Strategy | Started |
|---|---|---|---|---|---|
| CBO_Leads \| Couples Package | `120244771947410093` | Leads | €10.00 | Lowest Cost | Feb 22, 2026 |
| CBO_Leads \| Spa Day | `120243020862770093` | Leads | €15.00 | Lowest Cost | Jan 20, 2026 |
| CBO_Leads \| Massage | `120243020781260093` | Leads | €10.00 | Lowest Cost | Jan 20, 2026 |
| CBO_Leads \| Gifting | `120243020613500093` | Leads | €10.00 | Lowest Cost | Jan 20, 2026 |

**Total daily budget across active campaigns: €45.00**

## How to Use This Reference

When working on Spa marketing tasks, always use:
- **Ad Account:** `act_654279452039150`
- **Page ID:** `375775105843811` (required when creating ad creatives)

### Pulling Insights
```
Use: get_insights(object_id="act_654279452039150", level="campaign", time_range="last_30d")
```

### Checking Campaign Performance
```
Use: get_campaigns(account_id="act_654279452039150", status_filter="ACTIVE")
```

### Creating New Campaigns
All campaigns must be created in **PAUSED** status. Follow CBO structure. Naming convention: `CBO_Leads | [Offer Name]`

## Related Files
- Brand voice: `../../config/branding_guidelines.md` (Spa section)
- Offers: `../../config/carisma_slimming_evergreen_offers.md` (for Slimming — Spa offers TBD)
- Creative angles: `../../config/performance_marketing_angles.md`
- Competitive intel: `../../config/creative_strategy_competitive_intelligence.md`
