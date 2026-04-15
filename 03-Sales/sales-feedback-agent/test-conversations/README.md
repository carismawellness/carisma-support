# Test Conversations for Pipeline Calibration

5 realistic test conversations designed to validate the full 6-agent scoring pipeline. Each targets a specific score tier with a mix of brands, channels, and scenarios.

| # | Expected Tier | Brand | Channel | Scenario | File |
|---|---------------|-------|---------|----------|------|
| 1 | Elite (80-100) | Slimming | WhatsApp | New Lead (Consultation) | `01-elite-slimming-whatsapp.md` |
| 2 | Strong (65-79) | Aesthetics | Phone Call | Booking Follow-Up | `02-strong-aesthetics-phone.md` |
| 3 | Developing (50-64) | Spa | WhatsApp | New Inquiry (Package) | `03-developing-spa-whatsapp.md` |
| 4 | Needs Improvement (30-49) | Slimming | Phone Call | Re-engagement | `04-needs-improvement-slimming-phone.md` |
| 5 | Critical (0-29) | Aesthetics | WhatsApp | New Lead (Offer) | `05-critical-aesthetics-whatsapp.md` |

## Purpose

These conversations are NOT real customer data. They are calibration conversations designed to:
1. Verify the full pipeline runs end-to-end (ingest → score → QC → deliver)
2. Test that scores land in the expected tier
3. Surface any rubric/weighting issues before connecting to live data

## After Calibration

Once scoring is validated against these 5 conversations, connect to real channels (WhatsApp business number, Gmail CRM accounts) for live scoring.
