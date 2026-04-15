# Google Ads Specialist Reference

Channel specialist guidance for Google campaign planning within the marketing calendar.

**Persona:** PPC expert

---

## Campaign Naming Convention

Google campaigns in the calendar follow these patterns:

```
Search: keyword | CPC XX | XXx        (Search campaigns)
Pmax | description | CPC xxx          (Performance Max)
Maps: description                      (Google Maps / Local)
Remarketing: description               (Remarketing campaigns)
```

**In the spreadsheet:** Google campaigns go in the Google Campaign rows per brand (see config.json for exact row positions).

---

## Proven Campaigns by Brand

**Full details:** Invoke the `google-ads-strategist` skill or reference `~/.claude/skills/google-ads-strategist/SKILL.md`.

### Spa
| Campaign | Type | Status |
|----------|------|--------|
| Search: Spa Day | Search | Always-on |
| Pmax: Remarketing | Performance Max | Always-on |
| Search: LHR | Search | DEMAND-TOGGLE (check occupancy) |
| Maps: Local | Maps/Local | Always-on |

### Aesthetics
| Campaign | Type | Status |
|----------|------|--------|
| Search: Botox | Search | Always-on |
| Search: Fillers | Search | Always-on |
| Search: LHR | Search | Always-on |
| Remarketing: LHR | Remarketing | Always-on |
| Search: Micro-needling & Mesotherapy | Search | Always-on (TOP PERFORMER) |

### Slimming
| Campaign | Type | Status |
|----------|------|--------|
| Search: Medical Weight Loss | Search | Always-on |
| Search: Weight Loss | Search | Always-on |

---

## Demand-Toggle Decisions

Before recommending a demand-toggle campaign ON or OFF:

| Question | If YES | If NO |
|----------|--------|-------|
| Is the treatment fully booked? | Turn OFF | Turn ON |
| Seasonal demand spike? | Scale budget UP | Maintain current |
| Leads converting to appointments? | Keep running | Investigate |

**Current known status:**
- Spa LHR: FULLY BOOKED — recommend OFF
- Aesthetics LHR: Running, not booked — keep ON

---

## Key Principles

1. Google captures people already searching — unlike Meta (interruption-based)
2. Google runs ALONGSIDE Meta, never as a replacement
3. Always-on campaigns do NOT pause for occasion campaigns
4. Seasonal copy updates within existing campaigns (don't change structure)
5. Do NOT invent budget numbers — only reference documented budgets

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Forgetting Google Ads in the calendar entirely | Google rows MUST have entries every month. |
| Making up campaigns that don't exist | Only use proven campaigns documented here. |
| Leaving Spa LHR on when fully booked | Check occupancy before including. |
| Ignoring Micro-needling & Mesotherapy | Top performer for Aesthetics. Always include. |
| Adding speculative new campaigns | Stick to proven roster. New campaigns need separate testing. |
