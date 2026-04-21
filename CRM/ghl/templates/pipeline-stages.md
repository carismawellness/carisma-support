# Pipeline Stage Templates

Reusable pipeline configurations for each Carisma brand.

---

## Aesthetics — Setter Pipeline

Optimized for a team of setters converting leads to consultation bookings.

| # | Stage Name | Type | Notes |
|---|-----------|------|-------|
| 1 | `lead nuevo` | Active | First contact not yet made |
| 2 | `contactado dia 1` | Active | No answer on day 1 |
| 3 | `contactado dia 2` | Active | No answer on day 2 |
| 4 | `contactado dia 3` | Active | No answer on day 3 |
| 5 | `contactado dia 7` | Active | No answer on day 7 |
| 6 | `conversacion` | Active | Connected — qualifying |
| 7 | `no show` | Active | Scheduled, didn't attend |
| 8 | `cita confirmada` | Won | Booking confirmed ✓ |
| 9 | `cualificado` | Won | Qualified/attended ✓ |
| 10 | `showed` | Won | Showed to consultation ✓ |
| 11 | `nurturing` | Nurture | Long-term (120+ day re-engage) |

---

## Spa — Booking Pipeline

Optimized for converting inquiries into spa bookings.

| # | Stage Name | Type | Notes |
|---|-----------|------|-------|
| 1 | `New Inquiry` | Active | First contact |
| 2 | `Contacted` | Active | Reached the lead |
| 3 | `Interested` | Active | Expressed interest |
| 4 | `Booking Pending` | Active | In booking process |
| 5 | `Booking Confirmed` | Won | Paid/confirmed ✓ |
| 6 | `No Show` | Active | Needs rescheduling |
| 7 | `Lost` | Lost | Not interested |

---

## Slimming — Consultation Pipeline

Optimized for wellness/slimming program consultations.

| # | Stage Name | Type | Notes |
|---|-----------|------|-------|
| 1 | `New Lead` | Active | Just entered |
| 2 | `First Contact Made` | Active | Called/messaged |
| 3 | `Consultation Scheduled` | Active | Date set |
| 4 | `Consultation Complete` | Active | Attended meeting |
| 5 | `Proposal Sent` | Active | Program offer sent |
| 6 | `Enrolled` | Won | Signed up ✓ |
| 7 | `No Show` | Active | Missed consultation |
| 8 | `Lost — Price` | Lost | Too expensive |
| 9 | `Lost — Not Interested` | Lost | Not interested |
| 10 | `Nurture` | Nurture | Long-term re-engage |

---

## Notes

- Stage names must match **exactly** what's in GHL (case-sensitive).
- After creating stages in GHL UI, run `mcp__ghl__get_pipelines` to get the stage IDs.
- Update `CRM/ghl/config.py` with the actual IDs.
- Won/Lost stages should have `status: "won"` or `status: "lost"` set when moving leads there.
