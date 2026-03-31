# Phase 4: Revenue Attribution

## Purpose

Match ad spend to revenue data. Compute ROI by brand, by channel, and by campaign type (evergreen vs. seasonal). This connects marketing activity to business outcomes.

## Inputs Required

- Spend data from Phase 2 (or pull fresh)
- Performance data from Phase 3
- Revenue data from Carisma Analytics sheet `1q_aqO9QpCaRoqhOI0Fd41YPO7NMrRAlv5EjShmZK6RM`
  - "Revenue Improved" sheet (ID: `856432233`)

## Procedure

### Step 1: Pull Revenue Data

Use Google Sheets MCP to read from the Carisma Analytics sheet:
- Spreadsheet: `1q_aqO9QpCaRoqhOI0Fd41YPO7NMrRAlv5EjShmZK6RM`
- Sheet: "Revenue Improved" (ID: `856432233`)
- Extract weekly revenue per brand for the current period

### Step 2: Match Spend to Revenue by Brand

For each brand:
```
total_spend = meta_spend + google_spend
total_revenue = brand_weekly_revenue
roi = (total_revenue - total_spend) / total_spend * 100
roas = total_revenue / total_spend
```

### Step 3: Break Down by Channel

| Brand | Channel | Spend | Revenue (attributed) | ROAS | ROI |
|-------|---------|-------|---------------------|------|-----|
| Spa | Meta | EUR X | EUR X | X.Xx | X% |
| Spa | Google | EUR X | EUR X | X.Xx | X% |
| ... | ... | ... | ... | ... | ... |

**Attribution method:** Last-click for Meta (standard Meta attribution window). Google attribution via Google Analytics UTM tracking where available.

### Step 4: Break Down by Campaign Type

| Brand | Type | Spend | Revenue | ROAS |
|-------|------|-------|---------|------|
| Spa | Evergreen | EUR X | EUR X | X.Xx |
| Spa | Seasonal | EUR X | EUR X | X.Xx |
| ... | ... | ... | ... | ... |

### Step 5: Trend Comparison

Compare current week's ROI vs. previous 4-week average:
```
trend = current_roi - avg_4week_roi
direction = "improving" if trend > 0 else "declining"
```

## Output

- ROI table by brand and channel
- ROI table by brand and campaign type
- 4-week trend direction per brand
- Key insight: which brand/channel combination is most and least efficient

## Limitations

- Revenue attribution is approximate — Fresha bookings don't always tie directly to ad clicks
- Slimming has a longer sales cycle (weeks, not days) — ROI for recent campaigns may be understated
- Google revenue attribution depends on UTM parameter consistency
