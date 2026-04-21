# GHL Best Practices

*Sourced from official GHL documentation. Last updated: April 2026.*

---

## Custom Fields

### Field Types

| Type | API dataType | Use Case |
|------|-------------|----------|
| Single Line | `TEXT` | Short text (referral name, treatment interest) |
| Multi Line | `LARGE_TEXT` | Notes, intake responses |
| Number | `NUMERICAL` | Session count, visit number, age |
| Monetary | `MONETARY` | Package value, estimated spend |
| Phone | `PHONE` | Secondary phone number |
| Dropdown (Single) | `SINGLE_OPTIONS` | Brand interest, lead temperature |
| Dropdown (Multi) | `MULTIPLE_OPTIONS` | Interested treatments |
| Radio | (same as SINGLE_OPTIONS) | Visual single-option selector |
| Checkbox | `CHECKBOX` | Boolean yes/no (consent, opt-in) |
| Date Picker | `DATE` | Consultation date, renewal date |
| File Upload | `FILE_UPLOAD` | Documents, before/after photos |
| Signature | `SIGNATURE` | Consent forms |

> File Upload and Signature cannot be used in automation filters.

### Contact vs. Opportunity Fields

| Dimension | Contact Field | Opportunity Field |
|-----------|--------------|-------------------|
| Attached to | The person (persists across all deals) | A specific deal |
| Use case | Lead type, language, treatment interest | Budget, consultation notes, package |
| Merge tag prefix | `{{contact.custom.field_key}}` | `{{opportunity.custom.field_key}}` |

**Rule:** If it describes the person → Contact. If it describes this specific sale → Opportunity.

### Field Key Rules

- Auto-generated from label: lowercase, spaces → underscores, no special chars
- **Cannot be changed after creation**
- Must be unique per location

### Folder Organisation

Create folders at Settings → Custom Fields → Folders. Recommended for Carisma:

- **Lead Intel** — source, referral, brand interest, campaign
- **Consultation** — consultation date, notes, treatment selected, therapist
- **Membership** — tier, renewal date, package value
- **Compliance** — consent date, opt-in source, language preference
- **Opportunity** — budget, urgency, timeline, package quoted

### Recommended Fields for Carisma

**Contact fields:**
```
brand_interest          Dropdown: Spa / Aesthetics / Slimming
treatment_interest      Multi-select: list of treatments
preferred_language      Dropdown: EN / MT / FR / IT / DE / ES
lead_temperature        Dropdown: Cold / Warm / Hot
consultation_date       Date Picker
last_visited_date       Date Picker
membership_tier         Dropdown: None / Bronze / Silver / Gold
consent_date            Date Picker
referral_source         Single Line
```

**Opportunity fields:**
```
package_quoted          Dropdown: list of packages
quoted_value            Monetary
consultation_outcome    Dropdown: Interested / Not Ready / Booked / Declined
follow_up_date          Date Picker
lost_reason             Dropdown: Price / Timing / Competitor / No Show / Other
```

---

## Pipeline Best Practices

### Recommended Stage Structure

**Lead Flow pipeline (Spa/Aesthetics):**
1. New Lead → Auto-SMS within 5 min
2. Contacted → Connected, in conversation
3. Consultation Booked → Confirmation + reminder sequence
4. Consultation Done → Treatment proposal
5. Package Proposed → 3-day follow-up sequence
6. Closed Won → Client pipeline
7. Closed Lost → Re-engagement list

**Slimming Programme:**
1. Assessment Booked → Low-barrier first step
2. Assessment Done → Programme explained
3. Programme Active → Weekly check-in sequence
4. Programme Completed → Upsell trigger
5. Lapsed → Re-engagement needed

### Opportunity Value Tracking

- Assign monetary value at "Consultation Booked" stage
- Update to actual paid amount at "Won"
- Use Monetary custom fields to feed into pipeline revenue reporting

### Stage Automation

- Use "Opportunity Stage Changed" trigger + filter by stage name
- Always automate:
  - Entering "Consultation Booked" → confirmation SMS + reminder sequence
  - Stale in stage too long → alert workflow
  - Moving to Won → welcome sequence + review request

---

## Contact Merge Tags — Complete Reference

### Core Contact
```
{{contact.first_name}}
{{contact.last_name}}
{{contact.name}}
{{contact.email}}
{{contact.phone}}
{{contact.phone_raw}}              ← unformatted, use in tel: links
{{contact.company_name}}
{{contact.full_address}}
{{contact.city}}
{{contact.state}}
{{contact.postal_code}}
{{contact.date_of_birth}}
{{contact.source}}
{{contact.timezone}}
{{contact.id}}
```

### Appointment
```
{{appointment.title}}
{{appointment.start_time}}         ← date + time
{{appointment.end_time}}
{{appointment.only_start_date}}
{{appointment.only_start_time}}
{{appointment.day_of_week}}
{{appointment.month}}
{{appointment.timezone}}
{{appointment.meeting_location}}
{{appointment.notes}}
{{appointment.cancellation_link}}
{{appointment.reschedule_link}}
{{appointment.add_to_google_calendar}}
{{appointment.add_to_ical}}
{{appointment.user.name}}          ← assigned therapist
{{appointment.user.email}}
{{appointment.user.phone}}
```

### Service Booking (Spa-specific)
```
{{servicebooking.title}}
{{servicebooking.start_time}}
{{servicebooking.end_time}}
{{servicebooking.start_date}}
{{servicebooking.total_price}}
{{servicebooking.reschedule_link}}
{{servicebooking.cancellation_link}}
{{this.name}}                      ← per-service name in multi-service booking
{{this.price}}
{{this.duration}}
{{this.user.name}}                 ← therapist per service
```

### Location/Business
```
{{location.name}}
{{location.phone}}
{{location.email}}
{{location.full_address}}
{{location.website}}
{{location.logo_url}}
{{location_owner.first_name}}
```

### Staff/User
```
{{user.name}}
{{user.first_name}}
{{user.email}}
{{user.phone}}
{{user.calendar_link}}             ← booking link for that staff member
{{user.email_signature}}
```

### Real-Time Date
```
{{right_now.day_of_week}}
{{right_now.day}}
{{right_now.month_name}}
{{right_now.year}}
{{right_now.little_endian_date}}   ← DD/MM/YYYY — correct format for Malta
{{right_now.middle_endian_date}}   ← MM/DD/YYYY
```

### Custom Fields
```
{{contact.custom.field_key}}
{{opportunity.custom.field_key}}

# With fallback:
{{contact.custom.treatment_interest || "our services"}}
```

### Attribution
```
{{contact.attributionSource.utmSource}}
{{contact.attributionSource.utmMedium}}
{{contact.attributionSource.utmCampaign}}
{{contact.lastAttributionSource.utmCampaign}}
```

---

## SMS Best Practices

### Character Limits
- 1 SMS segment = **160 characters** (GSM-7 encoding)
- With Unicode (emojis, accented chars) = **70 characters** per segment
- Multi-segment is fine, but increases cost — target under 320 chars

### Compliance (Non-Negotiable)
- Include opt-out in every first message: `Reply STOP to unsubscribe`
- Accepted keywords: STOP, STOPALL, CANCEL, UNSUBSCRIBE, END, QUIT
- GHL auto-suppresses contacts who reply with any of these
- Re-insert opt-out language every 30–60 days in ongoing sequences
- For Malta/EU: capture GDPR consent **before** first commercial message
- US carriers: A2P 10DLC brand + campaign registration required

### Deliverability Thresholds
- Error rate: keep below 6% (suspension triggered at 10%)
- Opt-out rate: keep below 1% (suspension at 3%)
- Never use public URL shorteners (bit.ly, tinyurl) — blocked by carriers; use branded short domains
- Enable Number Intelligence to filter landlines

---

## Email Best Practices

### Deliverability Setup
- Authenticate sending domain: SPF, DKIM, DMARC records required
- Warm up new sending domains gradually (start 50/day, increase 20–30% per week)
- Always include an unsubscribe link
- Use double opt-in for list sign-ups
- Keep bounce rate below 2%, spam complaint rate below 0.1%

### Template Tips
- Use `{{contact.first_name}}` in subject lines (improves open rates)
- Subject line: under 50 characters for mobile preview
- Avoid ALL-CAPS spam triggers (FREE, GUARANTEE, URGENT)
- Always have a plain text fallback alongside HTML

---

## Reporting & Attribution

### UTM Setup
UTM params are captured natively when a contact completes a GHL-native action on the same page they landed on (form submit, booking, chat widget). They are **not** captured if the contact navigates to a second page first.

### Key Metrics per Pipeline
| Metric | Source |
|--------|--------|
| Stage conversion rate | Pipeline → Reporting tab |
| Average time in stage | Pipeline → Reporting tab |
| Total pipeline value | Pipeline header |
| Lead-to-consultation rate | Opportunities Won / Contacts Created |
| Cost per consultation | Combine with Meta/Google Ads via UTM |

### Dashboard Widgets to Build
- Opportunity count by stage
- Revenue by attribution source
- SMS/email delivery rates
- Appointments: booked vs. showed vs. no-show

---

## Security & Multi-Location

### User Roles

**Agency level:**
- `Agency Admin` — full access to all locations, billing, settings
- `Agency User` — access only to granted locations

**Location level:**
- `Admin` — full access within that location
- `User` — permissions configured per module

### Recommended Staff Setup for Carisma
| Role | GHL Level | Key Settings |
|------|-----------|-------------|
| Therapist | Location User | Only Assigned Data ON; Contacts + Calendar + Conversations only |
| Receptionist | Location User | Only Assigned Data OFF; Contacts + Calendar + Conversations + Opportunities |
| Location Manager | Location Admin | All modules |
| Mert (Owner) | Agency Admin | Access to all locations |

### Location Isolation
- Contacts do **not** sync across locations automatically
- Pipelines, custom fields, and workflows must be created per sub-account
- Use **Snapshots** (Agency → Snapshots) to clone a complete setup across all three brands — this is the correct way to standardise configuration
