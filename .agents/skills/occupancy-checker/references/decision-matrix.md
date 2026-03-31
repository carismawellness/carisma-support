# Decision Matrix — Capacity x Ad Spend

## Capacity Classification

Thresholds from `config/fresha_venues.json` -> `scraper_config.capacity_thresholds`:

| Level | Avg Slots/Day | Fully Booked % | Classification |
|-------|--------------|----------------|----------------|
| Full | 0 | 90%+ | PAUSE |
| Limited | < 3 | 60%+ | REDUCE |
| Moderate | 3-6 | < 60% | MAINTAIN |
| Open | 6+ | < 60% | SCALE |

## Reallocation Rules

| Capacity | Current Ad Status | Proposed Action | Budget Impact |
|----------|-------------------|-----------------|---------------|
| PAUSE | Running campaigns | Pause all campaigns for this service | Save EUR X/day |
| PAUSE | No campaigns | No action needed | None |
| REDUCE | High budget (>EUR 20/day) | Reduce to EUR 5/day awareness minimum | Save EUR (X-5)/day |
| REDUCE | Low budget (<EUR 10/day) | Keep as-is | None |
| REDUCE | No campaigns | No action needed | None |
| MAINTAIN | Running campaigns | Keep current budget | None |
| MAINTAIN | No campaigns | Consider launching (low priority) | Allocate from savings |
| SCALE | Running at low budget | Increase budget from savings pool | Spend EUR Y/day more |
| SCALE | Running at high budget | Keep current budget | None |
| SCALE | No campaigns | **Launch Opportunity** — recommend new campaign | Allocate from savings |

## Override Rule

**Capacity ALWAYS overrides performance.**

A winning ad (CPL below target, 5+ leads) should still be REDUCED or PAUSED if its service has no available slots. Present both data points:
- Performance verdict: WINNER / LOSER / MARGINAL
- Capacity verdict: PAUSE / REDUCE / MAINTAIN / SCALE
- Final action: Capacity verdict wins

## Budget Redistribution Logic

1. Calculate total savings from PAUSE + REDUCE actions
2. Rank SCALE opportunities by: open capacity (highest first), then CPL efficiency (lowest first)
3. Distribute savings to SCALE opportunities proportionally
4. Never exceed 30% budget increase per service in a single cycle
5. Keep EUR 5/day minimum for REDUCE services (brand awareness)
6. Flag any reallocation >EUR 50/day for CEO approval

## Service-to-Campaign Mapping

Use `config/naming_conventions.json` to map:
- Campaign offer code -> Fresha service name
- Brand code (CS/CA) -> Venue (slimming/aesthetics)

Mapping table (extend as new campaigns launch):

| Campaign Offer Code | Fresha Service | Venue |
|---------------------|----------------|-------|
| LIPO | Lipocavitation | slimming |
| COOLSC | CoolSculpting - Fat Freezing 30 mins | slimming |
| COOLSC40 | CoolSculpting - Fat Freezing 40 mins | slimming |
| CELLULITE | Anti-cellulite treatment | slimming |
| VELA | VelaShape - Radiofrequency Skin Tightening 40 mins | slimming |
| EMSC | Emsculpt NEO - Muscle Stimulation, RF Tightening & Fat Reduction 45 mins | slimming |
| MEDWL | Medical Weight Loss Consultation | slimming |
| TANITA | Free Initial Tanita Body Composition Analysis | slimming |
| BODYWRAP | Slimming Body wrap | slimming |
| HYDRA | 4-1 hydrafacial | aesthetics |
| FACELIFT | Ultimate facelift | aesthetics |
| JAWLINE | Snatch jawline - 1st session | aesthetics |
| LIPGLOW | Lip & Glow | aesthetics |

**Note:** This mapping will grow as new campaigns launch. When a campaign can't be mapped, flag it in the report as "unmapped" and fall back to brand-level analysis.
