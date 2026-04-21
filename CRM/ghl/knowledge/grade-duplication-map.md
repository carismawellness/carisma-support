# Duplication Map: Grade Account → Carisma GHL

**Source:** Grade account (`KL2MApDIOBuILVr0Gx7E`) — Forever Booked AI framework on Carisma Aesthetics  
**Targets:** Carisma Aesthetics (`TrtSnBSSKBOkVVNxJ3AM`) + optionally Spa + Slimming

This document tells you exactly what to copy, how to do it, and in what order. Always do it in dependency order — items at the top must exist before items below them can be created.

---

## What Is Worth Copying

| Component | Copy? | Why |
|-----------|-------|-----|
| Pipeline stages | ✅ Yes | The AI-driven stage structure (COLD → Warm → HOT → Booked → Showed) is more sophisticated than the current setter queue |
| Tags | ✅ Yes | The tag-based flow control is the backbone of the AI system |
| Custom fields — Referral system | ✅ Yes | 5-referral capture per client is a high-value retention mechanic |
| Custom fields — Campaign tracking | ✅ Yes | `customer_campaign_name` + `customer_campaign_details` for attribution |
| Custom fields — Consent | ✅ Yes | `text_permission` required for GDPR/SMS compliance |
| Custom values | ✅ Yes (adapt) | The config-layer pattern is excellent — adapt values for each brand |
| Workflow: AI Outreach | ✅ Yes | Core AI SMS sequence for new leads |
| Workflow: AI Responder | ✅ Yes | Handles inbound AI conversations |
| Workflow: Ad Optin SMS Sequence | ✅ Yes | Immediate post-optin SMS |
| Workflow: Hot Lead | ✅ Yes | Human alert when AI detects HOT intent |
| Workflow: Agent Timeout/Warm Lead | ✅ Yes | State management when AI stalls |
| Workflow: Re-engage AI | ✅ Yes | Recycle/restart cold leads |
| Workflow: Disengage AI | ✅ Yes | Stop AI cleanly when human takes over |
| Workflow: Cancel/Unsubscribe | ✅ Yes | Required for SMS compliance |
| Workflow: Contact Not Interested | ✅ Yes | Clean lead disposition |
| Workflow: Standard Booster Shot | ✅ Yes | Periodic list re-engagement |
| Workflow: Mark "N" As Read | ✅ Yes | Operational hygiene |
| Workflow: Campaign Error Auditor | ✅ Yes | Catches delivery failures |
| Workflow: Drip Booster Shots 1-3 | ⚠️ Optional | Draft — adapt for Carisma's offer |
| Forms (Meta/Google/Website) | ✅ Yes | Recreate with Carisma branding |
| Calendar config | ✅ Yes | Round-robin, 30-min slots, auto-confirm |
| Referral System form | ✅ Yes | The ForeverBooked referral form captures post-visit referrals |
| AI Knowledge Base doc | ✅ Yes | Create per-brand version of the Knowledge URL doc |

---

## Duplication Order

Follow this exact sequence — each step depends on the previous.

---

### Phase 1 — Foundation (do in GHL UI — cannot be done via API)

**Step 1.1 — Create/update pipeline stages**

In GHL → CRM → Pipelines, create or update the pipeline for each brand with these stages (in order):

```
❄️ COLD Leads (AI Engaged)
👋 Warm Leads
🔥 HOT Leads
✍️ Manual Followup
✨ AI Followup
♻️ Recycle List
📆 Appt Booked
❌ Cancel/No-Show
✅ Showed (add sale value)
```

After creating, run `mcp__ghl__get_pipelines` to capture the stage IDs.

**Step 1.2 — Create tags**

In GHL → Contacts → Tags (or via API), create all 8 control tags:
```
ai engaged
hotlead
stop ai
disengage
disengage1
timeout
cancel
fallback_reached
email list
```

Via API:
```python
for tag_name in ["ai engaged", "hotlead", "stop ai", "disengage", "disengage1",
                  "timeout", "cancel", "fallback_reached", "email list"]:
    mcp__ghl__create_location_tag(locationId="<LOC_ID>", name=tag_name)
```

---

### Phase 2 — Custom Fields (via API)

Create these custom fields on the target location. Run in order so field folders can be set if needed.

**Referral capture fields (create all 10):**
```python
fields_to_create = [
    {"name": "Referred By",       "fieldKey": "contact.referred_by",       "dataType": "TEXT"},
    {"name": "Referred By Phone", "fieldKey": "contact.referred_by_phone",  "dataType": "TEXT"},
    {"name": "Referral Name 1",   "fieldKey": "contact.referral_name_1",    "dataType": "TEXT"},
    {"name": "Referral Phone 1",  "fieldKey": "contact.referral_phone_1",   "dataType": "PHONE"},
    {"name": "Referral Name 2",   "fieldKey": "contact.referral_name_2",    "dataType": "TEXT"},
    {"name": "Referral Phone 2",  "fieldKey": "contact.referral_phone_2",   "dataType": "PHONE"},
    {"name": "Referral Name 3",   "fieldKey": "contact.referral_name_3",    "dataType": "TEXT"},
    {"name": "Referral Phone 3",  "fieldKey": "contact.referral_phone_3",   "dataType": "PHONE"},
    {"name": "Referral Name 4",   "fieldKey": "contact.referral_name_4",    "dataType": "TEXT"},
    {"name": "Referral Phone 4",  "fieldKey": "contact.referral_phone_4",   "dataType": "PHONE"},
    {"name": "Referral Name 5",   "fieldKey": "contact.referral_name_5",    "dataType": "TEXT"},
    {"name": "Referral Phone 5",  "fieldKey": "contact.referral_phone_5",   "dataType": "TEXT"},
    {"name": "Referral Image",    "fieldKey": "contact.referral_image",     "dataType": "TEXT"},
    {"name": "Referral Selfie",   "fieldKey": "contact.referral_selfie",    "dataType": "FILE_UPLOAD"},
]

# Campaign tracking
campaign_fields = [
    {"name": "Customer Campaign Name",    "fieldKey": "contact.customer_campaign_name",    "dataType": "TEXT"},
    {"name": "Customer Campaign Details", "fieldKey": "contact.customer_campaign_details", "dataType": "TEXT"},
]

# Consent
consent_fields = [
    {"name": "I agree to receive text communications",
     "fieldKey": "contact.text_permission", "dataType": "CHECKBOX"},
    {"name": "When is the best time for an appointment?",
     "fieldKey": "contact.when_is_the_best_time_for_an_appointment",
     "dataType": "MULTIPLE_OPTIONS",
     "options": [
         {"label": "Morning (9am-12pm)"},
         {"label": "Afternoon (12pm-5pm)"},
         {"label": "Evening (5pm-8pm)"},
     ]},
    {"name": "Additional Notes", "fieldKey": "contact.additional_notes", "dataType": "LARGE_TEXT"},
]
```

Call `mcp__ghl__create_location_custom_field` for each.

---

### Phase 3 — Custom Values (the config layer)

Create these 15 custom values per brand location. They act as variables inside all workflows — set them correctly and the whole system is personalized.

```python
custom_values_to_create = [
    # Identity
    {"name": "Business Name",             "value": "<brand name>"},
    {"name": "Clinic Phone Number",       "value": "<brand phone>"},
    {"name": "Logo",                      "value": "<logo URL>"},

    # Email sender
    {"name": "Email Sending First Name",  "value": "Sarah"},  # or brand persona name
    {"name": "Email Sending Last Name",   "value": ""},
    {"name": "Email Sending Email",       "value": "<brand email>"},
    {"name": "Email Sending Position",    "value": ""},

    # URLs
    {"name": "Booking Page URL",          "value": "<booking URL>"},
    {"name": "Google Review Page",        "value": "<google maps review URL>"},
    {"name": "Instagram Page",            "value": "<instagram URL>"},
    {"name": "Privacy Policy",            "value": "<privacy policy URL>"},
    {"name": "Terms and Conditions",      "value": "<T&C URL>"},

    # Notifications (who gets alerted on HOT leads)
    {"name": "Client Email Notification #1", "value": "<manager phone or email>"},
    {"name": "Client SMS Notification #1",   "value": "<manager email or phone>"},

    # AI config
    {"name": "Assistant Name",            "value": "Sarah"},  # adjust per brand voice
    {"name": "AI Knowledge Value",        "value": "<AI knowledge base text>"},
    {"name": "Knowledge URL",             "value": "<Google Doc URL with full AI knowledge>"},

    # Operations
    {"name": "Referral System Link",      "value": "<referral form URL>"},
    {"name": "Treatment Plan Link",       "value": "<Google Sheets URL>"},
]
```

---

### Phase 4 — Calendars (via API or UI)

Create the round-robin booking calendar:

```python
mcp__ghl__create_calendar(
    locationId="<LOC_ID>",
    name="Unlimited Bookings Calendar",
    calendarType="round_robin",
    slotDuration=30,
    slotInterval=30,
    slotBuffer=0,
    autoConfirm=True,
    eventColor="#039BE5"
)
```

Then create a Calendar Group "Our Calendar" and add the new calendar to it.

---

### Phase 5 — Forms (via GHL UI)

Recreate the 3 forms in each sub-account (GHL UI → Sites → Forms):

**Meta Ads Optin** — Fields: First Name, Last Name, Phone, Email, text_permission checkbox
**Google Ads Optin** — Fields: First Name, Last Name, Phone, Email, text_permission checkbox
**Website Appointment Request** — Fields: above + when_is_the_best_time + additional_notes

Connect each form's submission trigger to "Ad Optin SMS Sequence" workflow.

---

### Phase 6 — Workflows

Workflows cannot be copied via API — they must be recreated in the UI or copied via GHL Snapshots.

**Recommended approach: GHL Snapshot**

1. In the Grade account: Agency → Snapshots → Create Snapshot from this location
2. In each target location: Install the snapshot
3. After install: update all custom values (Phase 3) to replace placeholders with brand-specific values

**If Snapshots are not available, recreate workflows in this priority order:**

1. `Cancel/Unsubscribe` — must exist before any outreach starts (compliance)
2. `Disengage AI` — safety off-switch
3. `Ad Optin SMS Sequence` — fires on form submit
4. `AI Outreach` — core AI sequence
5. `AI Responder` — handles replies
6. `Agent Timeout/Warm Lead` — state management
7. `Hot Lead` — human alert
8. `Contact Not Interested` — disposition
9. `Re-engage AI` — recycle/restart
10. `Standard Booster Shot` — periodic re-engagement
11. `Mark "N" As Read` — housekeeping
12. `Campaign Error Auditor` — monitoring

---

## Per-Brand Adaptation Notes

| What to change | Aesthetics | Spa | Slimming |
|----------------|-----------|-----|---------|
| Assistant Name | Sarah (already) | Sarah Caballeri | Katya |
| Booking URL | carismaaesthetics.com | carismaspa.com | carismaslimming.com |
| Knowledge doc | Aesthetics treatments + pricing | Spa services + pricing | Slimming programs + pricing |
| Pipeline name | Aesthetics AI Pipeline | Spa AI Pipeline | Slimming AI Pipeline |
| Notification recipients | Aesthetics manager | Spa manager | Slimming manager |

---

## What NOT to Copy

| Item | Reason |
|------|--------|
| `contact.key` field | Internal system key for Grade account — unknown purpose |
| `CRM API Key` custom value | The JWT in Grade account — contains their location credentials |
| `Dropdown (M)` field | Generic name with no options — recreate as "Service Interest" with proper options |
| `Day` / `Preferred Time` / `SMS Content` CHECKBOX fields | Unclear purpose — likely leftover from form builder |
| Muhammad Ali Aleem's calendar | Personal calendar for the funnel designer — remove |
| `mailgun` tag/workflow | Draft email setup — not yet configured |
| `Drip Booster Shot` workflows | Drafts — adapt content for Carisma's offer before enabling |

---

## Quick Copy Script

The following creates all custom fields and tags via the Carisma client automatically:

```bash
# Save the Grade account credentials
cp .env .env.grade.backup
GHL_API_KEY=pit-b1084c22-1462-43b9-b355-b6aa4859c553
GHL_LOCATION_ID=KL2MApDIOBuILVr0Gx7E

# Run copy (to be built as Tools/ghl_copy_config.py)
python Tools/ghl_copy_config.py \
  --source-location KL2MApDIOBuILVr0Gx7E \
  --source-key pit-b1084c22-1462-43b9-b355-b6aa4859c553 \
  --target-location TrtSnBSSKBOkVVNxJ3AM \
  --target-key pit-2c7dae96-6718-4011-a9c2-d2931072e223 \
  --copy fields,tags,custom-values
```

> `Tools/ghl_copy_config.py` needs to be built. See `workflows/duplicate-grade-config.md`.
