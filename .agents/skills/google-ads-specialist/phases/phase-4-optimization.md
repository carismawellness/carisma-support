# Phase 4: Optimization Recommendations (Optimize)

## Purpose

Analyse Google Ads search terms, keyword performance, bid efficiency, and quality scores. Produce an optimization brief with specific, actionable recommendations for GM Marketing Agents.

## Procedure

1. **Pull search term reports** per campaign per brand
2. **Analyse keyword performance:**
   - Which keywords drive conversions vs. waste spend
   - Search terms triggering ads that don't match intent
   - Negative keyword opportunities (irrelevant queries)
3. **Analyse bid efficiency:**
   - CPC trends (rising/falling)
   - Position vs. CPC trade-offs
   - Smart bidding performance (if using automated strategies)
4. **Check quality scores:**
   - Ad relevance
   - Landing page experience
   - Expected CTR
5. **Identify opportunities:**
   - New keyword ideas from search term data
   - Ad copy test recommendations
   - Landing page improvements
   - Budget reallocation within Google channel
6. **Output** the optimization brief

## Output Format

### Negative Keyword Recommendations

| Brand | Campaign | Search Term | Impressions | Clicks | Spend | Recommendation |
|-------|----------|-------------|-------------|--------|-------|----------------|
| ... | ... | ... | ... | ... | ... | Add as negative |

### Keyword Performance

| Brand | Campaign | Keyword | CPC | Conversions | Conv. Rate | Action |
|-------|----------|---------|-----|-------------|------------|--------|
| ... | ... | ... | ... | ... | ... | Keep / Pause / Increase bid / Decrease bid |

### Ad Copy Recommendations
- Which ads are underperforming within each campaign
- Suggested headline/description tests
- Seasonal copy rotation suggestions

### Budget Reallocation
- Shift budget FROM underperforming campaigns TO high-performers
- Example: "Aesthetics Micro-needling CPC is 40% below average — consider +20% budget"

### Quality Score Issues
- Campaigns with low quality scores and recommended fixes
- Landing page improvements needed

## Data Source

**Current state:** Until Google Ads MCP is available, this phase relies on:
- Exported search term reports (CSV/Google Sheets)
- Google Ads dashboard screenshots via Playwright
- Manual data entry from Mandar's monthly reviews

**Future state:** Automated search term pulls and analysis via Google Ads API.

## Frequency

- **Bi-weekly:** Search term review and negative keyword cleanup
- **Monthly:** Full optimization audit with keyword, bid, and quality score analysis
- **On-demand:** When CPL spikes or performance drops are flagged in Phase 3

## Escalation Rules

| Finding | Action |
|---------|--------|
| New high-volume keyword opportunity | Recommend to CMO for GM action |
| CPC spike >50% on a campaign | Flag immediately in performance report |
| Quality score drop below 5 on any campaign | Recommend landing page review |
| Competitor bidding on brand terms | Flag to CMO with recommended defensive strategy |
