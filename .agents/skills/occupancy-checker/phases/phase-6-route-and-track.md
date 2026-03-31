# Phase 6 — Route, Track, and Document

## Objective

Route the Dynamic Reallocation proposals generated in Phase 4 to the correct specialists via the Paperclip messaging system. Track each proposal's response status. Follow up when deadlines pass without a response. Document all outcomes for the learning loop.

## Prerequisites

- Phase 4 complete
- `.tmp/performance/reallocation-alerts-[date].json` exists and contains at least one alert
- If no alerts file exists or it contains zero alerts, skip this phase entirely and log: "Phase 6 skipped — no TRU alerts triggered"

---

## Procedure

### Step 1: Load the alert summary

Read `.tmp/performance/reallocation-alerts-[date].json`.

For each alert in the `alerts` array:
- Note the `tier`, `brand`, `location`, `proposal_file`, and `routed_to` fields
- Read the corresponding `.md` proposal file
- Confirm the proposal is complete (contains all required sections from the Phase 4 format)

If a proposal file is missing or incomplete, log the issue and skip that alert — do not route an incomplete brief.

---

### Step 2: Compose the Paperclip message

For each alert, compose a message body using this template:

**Subject line format:**
```
[TIER LABEL] — Occupancy Alert: [Brand] / [Location] — [Date]
```

Examples:
- `[YELLOW ALERT] — Occupancy Alert: Carisma Spa / Sliema — 2026-03-31`
- `[URGENT RED ALERT] — Occupancy Alert: Carisma Aesthetics / St Julian's — 2026-03-31`
- `[CRITICAL ALERT] — Occupancy Alert: Carisma Slimming / Floriana — 2026-03-31`

**Message body:**
```
Hi [Recipient Name],

The Occupancy Checker has detected a [Yellow / Red / Critical] alert at [Location] for [Brand].

Current Treatment Room Utilization: [X]%
Target TRU: 70%
Alert Tier: [1 / 2 / 3]

The full reallocation proposal is below. Please review and respond with:
  APPROVE — I will implement as proposed
  MODIFY — I will implement with the following changes: [describe]
  REJECT — I will not implement. Reason: [describe]

Response required within: [4 hours for Yellow / 2 hours for Red or Critical]

---

[Paste full proposal from the .md file here]

---

Flagged by: Occupancy Checker (automated)
Run ID: [generated_at timestamp from alert summary]
```

---

### Step 3: Route to correct recipients

Use the Paperclip messaging system to send the composed message.

**Routing rules by tier:**

| Tier | Send to | CC |
|------|---------|-----|
| Tier 1 (Yellow) | Meta Strategist (`934e4f63-5928-48c2-848a-389164a2740c`) + Google Ads Specialist (`b22a67f6-e6bb-4b22-8323-e07d1fb00345`) | None |
| Tier 2 (Red) | Meta Strategist + Google Ads Specialist | CMO |
| Tier 3 (Critical) | Meta Strategist + Google Ads Specialist + CMO | Email Manager |

After sending each message:
- Update the alert entry in the JSON: set `routing_status` to `"sent"` and record `routed_at` timestamp
- Log: "Routed [Tier Label] brief for [Brand] / [Location] to [recipients]"

---

### Step 4: Track response status

After routing, the agent enters a tracking state for each open proposal. The tracking state is stored in:

`.tmp/performance/reallocation-tracking-[date].json`

Structure:
```json
{
  "tracking_date": "2026-03-31",
  "proposals": [
    {
      "brand": "carisma_spa",
      "location": "Sliema",
      "tier": 2,
      "label": "Red Alert",
      "tru_at_alert": 42.5,
      "routed_at": "2026-03-31T10:15:00",
      "response_deadline": "2026-03-31T12:15:00",
      "meta_strategist_response": null,
      "google_ads_response": null,
      "cmo_notified": true,
      "implementation_confirmed": false,
      "tru_followup_scheduled": "2026-04-02T10:00:00",
      "tru_at_followup": null,
      "outcome_documented": false
    }
  ]
}
```

---

### Step 5: Follow-up if no response by deadline

If the response deadline passes without a confirmed response from either specialist:

**For Tier 1 (Yellow) — no response after 4 hours:**
- Send a follow-up message to the same recipients:
  ```
  REMINDER: The [Yellow Alert] proposal for [Brand] / [Location] (TRU: [X]%) was sent [X] hours ago.
  Response deadline has passed. Please APPROVE / MODIFY / REJECT at your earliest opportunity.
  The window for same-day impact is closing.
  ```
- Do NOT escalate further for Yellow — log as "awaiting response"

**For Tier 2 (Red) — no response after 2 hours:**
- Send follow-up to Meta Strategist + Google Ads Specialist
- Escalate to CMO: "Red Alert follow-up: [Brand] / [Location] — no response from specialists after 2 hours. CMO action may be needed."
- Log as "escalated"

**For Tier 3 (Critical) — no response after 1 hour:**
- Send follow-up to all original recipients
- Escalate directly to CEO: "CRITICAL: [Brand] / [Location] TRU at [X]%. Proposals sent [X] hours ago. No confirmed implementation. Immediate human decision required."
- Log as "escalated to CEO"

---

### Step 6: Confirm implementation

When a specialist replies with APPROVE or MODIFY:
- Update the tracking JSON: set `meta_strategist_response` or `google_ads_response` to `"approved"` or `"modified"` with a note
- Set `implementation_confirmed: true` once both specialists have responded
- Log: "[Brand] / [Location] proposal approved and confirmed for implementation"

If a specialist replies with REJECT:
- Record the rejection reason in the tracking JSON
- Set `implementation_confirmed: false`
- Log: "[Brand] / [Location] proposal rejected by [recipient]. Reason: [reason]"
- Notify CMO of the rejection with the full context

---

### Step 7: 48-hour TRU follow-up

For every proposal where `implementation_confirmed: true`:

At the scheduled `tru_followup_scheduled` time (48 hours after routing):
1. Re-run Phase 1 (Fresha scrape) for the specific location
2. Record the new TRU in the tracking JSON: `tru_at_followup`
3. Compute the delta: `tru_delta = tru_at_followup - tru_at_alert`
4. Compute the budget delta: how much spend increased vs what budget change was actually implemented
5. Save to the learning log (Step 8)

---

### Step 8: Document outcomes for the learning loop

After each completed proposal cycle (routed → implemented → followed up), append an entry to:

`.agents/skills/occupancy-checker/references/reallocation-outcomes.md`

Entry format:
```markdown
## [Date] — [Brand] / [Location]

**Alert:** Tier [X] — [Label]
**TRU at alert:** [X]%
**TRU at 48h follow-up:** [X]%
**TRU delta:** +/-[X]pp

**Budget change implemented:**
- Meta: [X]% increase (EUR/USD [old] → [new]/day)
- Google: [X]% increase (EUR/USD [old] → [new]/day)

**Response time:** [X] hours from routing to approval
**Outcome:** [Improved / No change / Declined further]
**Notes:** [Any relevant context — e.g., "Thursday afternoon low-demand window, budget increase had limited same-day effect"]

**Elasticity estimate:** +[X]% budget → +[Y]pp TRU (n=[run count for this location])
```

---

## Monthly Reallocation Effectiveness Report

On the first Monday of each month, compile a Reallocation Effectiveness Report from all outcome entries in `reallocation-outcomes.md`.

### Report structure

```
REALLOCATION EFFECTIVENESS REPORT — [Month] [Year]
=======================================================
Reporting period: [start date] to [end date]
Total alerts triggered: [N]
  - Tier 1 (Yellow): [N]
  - Tier 2 (Red): [N]
  - Tier 3 (Critical): [N]

Proposals routed: [N]
Proposals approved: [N] ([X]%)
Proposals modified: [N] ([X]%)
Proposals rejected: [N] ([X]%)

Average response time: [X] hours
Escalations required: [N]

TRU OUTCOMES (48-hour measurement):
  - Average TRU delta after Tier 1 response: +[X]pp
  - Average TRU delta after Tier 2 response: +[X]pp
  - Average TRU delta after Tier 3 response: +[X]pp

ELASTICITY ESTIMATES (budget % increase → TRU pp gain):
  Location | Budget +20% → TRU | Budget +35% → TRU | Budget +50% → TRU
  ---
  [Location 1] | +[X]pp | +[X]pp | +[X]pp
  [Location 2] | +[X]pp | +[X]pp | +[X]pp

TOP INSIGHT THIS MONTH:
[1-2 sentence observation from the data — e.g., "Friday afternoon Red Alerts at Sliema responded better to Google Ads demand-flex than Meta spend increases."]

RECOMMENDATION FOR NEXT MONTH:
[1-2 sentence suggestion — e.g., "Consider pre-emptively increasing Sliema budgets on Thursdays to prevent Friday Red Alerts."]
```

Deliver the report to: CMO, all 3 GMs, Meta Strategist, Google Ads Specialist.
Publish to Google Sheet: "Reallocation Effectiveness" tab in the Carisma Analytics spreadsheet.

---

## Output

- Updated `.tmp/performance/reallocation-alerts-[date].json` (routing_status fields populated)
- `.tmp/performance/reallocation-tracking-[date].json` (response and follow-up tracking)
- Appended entries in `.agents/skills/occupancy-checker/references/reallocation-outcomes.md`
- Monthly Reallocation Effectiveness Report (first Monday of each month)
- Phase status: COMPLETE (all alerts routed) / PARTIAL (some alerts failed to route) / SKIPPED (no alerts)
