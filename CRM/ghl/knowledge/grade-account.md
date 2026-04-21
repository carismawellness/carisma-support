# "Grade" GHL Account — Full Configuration Reference

**Account name:** Carisma Aesthetics (managed by business partner — "Forever Booked" framework)  
**Location ID:** `KL2MApDIOBuILVr0Gx7E`  
**API Key:** `pit-b1084c22-1462-43b9-b355-b6aa4859c553`  
**Framework:** Forever Booked (foreverbooked.com) — AI-driven med spa automation system  
**Booking platform:** bookmyupgrade.com (external booking, not native GHL calendar)  
**Pulled:** April 2026

This account represents the partner's GHL configuration for Carisma Aesthetics. The core philosophy is **AI-first lead engagement** — every new lead is touched by an AI agent before any human involvement.

---

## Key Insight: The Forever Booked System

This is not a standard GHL setup. It's a templated med spa automation framework built around:
1. **AI agent** handles all initial contact via SMS
2. **Pipeline stages** reflect AI engagement state, not human sales stages
3. **Tag-based routing** controls which workflows run (ai engaged, hotlead, stop ai, disengage)
4. **"ForeverBooked HQ"** Google Sheets acts as external ops dashboard
5. **Referral system** built into custom fields (capture 5 referrals per client)
6. **Custom values** act as a config layer — changing one value updates all workflows

---

## Pipeline: Sales Pipeline
**ID:** `fIKuQdHSvHaOLmkWOFR0`

| Position | Stage Name | ID | Meaning |
|----------|-----------|-----|---------|
| 0 | ❄️ COLD Leads (AI Engaged) | `227bc9d7-3ee9-457f-85e0-cc9c97b43afe` | AI has reached out, no response yet |
| 1 | 👋 Warm Leads | `e73424b5-23ad-4848-8a84-4b22a162f0f0` | AI detected interest/engagement |
| 2 | 🔥 HOT Leads | `e1abbcd6-0d7d-4c23-93ef-bb74b7d17f17` | High intent — ready to book |
| 3 | ✍️ Manual Followup | `195b60df-3467-4a26-b316-df60ae5479bb` | Human rep takes over |
| 4 | ✨ AI Followup | `8b36da00-ead9-4b58-a3de-534f4b03a497` | AI re-engaged after manual attempt |
| 5 | ♻️ Recycle List | `6b72201e-2b08-4dd5-b343-3436ea4eff1d` | No response after all attempts — long-term nurture |
| 6 | 📆 Appt Booked | `5629912d-580e-4f6a-8eea-3cca7f77d4ee` | Appointment confirmed |
| 7 | ❌ Cancel/No-Show | `bd0e67a9-7aa1-4c46-a8d5-ef35fc10dc4f` | Cancelled or no-showed |
| 8 | ✅ Showed (add sale value) | `7701a36d-df1f-41b6-887a-dacca63b6f70` | Attended — enter sale value here |

**Stage logic:**
- Leads enter at COLD (AI Engaged) when opt-in form is submitted
- AI moves them to Warm or HOT based on reply sentiment
- HOT leads trigger manual human follow-up
- If human can't close, AI Followup restarts
- Recycle List = long-term drip (30–90 day re-engage cadence)

---

## Workflows (18 total)

### Published (Active)

| Workflow | ID | Purpose |
|----------|-----|---------|
| **AI Outreach** | `5c056f78-2e91-4a5a-8054-7e45c8223d82` | Initial AI SMS sequence when new lead opts in |
| **AI Responder** | `af5345dd-fe7b-457a-abe3-73b5c71dd5a6` | AI handles inbound replies — books appointments |
| **Ad Optin SMS Sequence** | `3f1d2544-7fe2-49bc-9d8b-965ca289deda` | Follow-up SMS sequence after ad form submission |
| **Agent Timeout/Warm Lead** | `1bbc7fc5-8257-4e1e-b621-ed24cc479178` | Fires when AI times out — moves to Warm Leads stage |
| **Campaign Error Auditor** | `3c86723b-615b-49fd-b974-f7c4e702ee14` | Monitors for campaign delivery errors |
| **Cancel/Unsubscribe** | `0fb4e9a4-c3bc-4016-99e5-da981bf82d87` | Handles STOP/cancel replies — tags, removes from workflows |
| **Contact Not Interested** | `3729f3c1-eb8e-43a5-b8e7-dbfb3afd3006` | Fires when lead explicitly says not interested |
| **Disengage AI** | `ed4b1d95-7ca2-48a1-8964-d203ac48f495` | Stops AI when `stop ai` tag is added |
| **Hot Lead** | `acc82b09-43ce-48c4-b10c-151eb1b1023e` | Triggered when AI detects HOT intent — alerts team |
| **Mark "N" As Read** | `659fda31-a01a-4a05-8e75-50cd21a4c70d` | Marks unread SMS conversations as read automatically |
| **RSVP Event Booster Shot** | `a376ab18-f0b7-4e84-b812-207996a0542e` | Re-engagement campaign for event invites |
| **Re-engage AI** | `8cab6e18-6936-492d-96d9-04c8988318ff` | Restarts AI outreach for cold/recycled leads |
| **Standard Booster Shot** | `16de7b31-770e-438e-9f48-57e647b2c4dc` | Periodic re-engagement blast for entire list |

### Draft (Inactive)

| Workflow | ID | Purpose |
|----------|-----|---------|
| AI Integration [Template] | `adb3b2c9-8187-4550-bf0c-a015b161b11e` | Template for AI setup |
| Drip Booster Shot - 1 | `d619da5d-1a00-44db-9931-81d76c99629d` | Drip sequence part 1 |
| Drip Booster Shot - 2 | `d00af348-4cdb-4322-8338-99a3bea433f0` | Drip sequence part 2 |
| Drip Booster Shot - 3 | `3e35f401-9909-4127-8ca5-1d478ca65e2b` | Drip sequence part 3 |
| mailgun | `9ef07714-e4ff-4837-aec7-74338c1a9128` | Email delivery setup (draft) |

### Workflow Architecture (How They Connect)

```
New Lead Opts In (Meta/Google form)
         ↓
  Ad Optin SMS Sequence (immediate SMS)
         ↓
  AI Outreach (AI starts conversation)
         ↓
     Reply received?
     ├── YES → AI Responder (AI handles conversation)
     │           ├── HOT intent → Hot Lead workflow (alert team)
     │           │                     → Manual Followup stage
     │           ├── Timeout → Agent Timeout → Warm Lead stage
     │           └── Booked → Appt Booked stage
     └── NO → Booster Shot / Re-engage AI (after N days)
                     ↓
              No response → Recycle List
```

**Tag-based flow control:**
- `ai engaged` — added when AI starts; prevents duplicate outreach
- `hotlead` — added when HOT; triggers human alert
- `stop ai` — added when human takes over; triggers Disengage AI
- `disengage` / `disengage1` — AI fully stopped
- `cancel` — contact unsubscribed (STOP reply)
- `timeout` — AI timed out waiting for reply
- `fallback_reached` — maximum follow-up attempts reached
- `email list` — on email nurture list
- `mailgun` — email delivery flagged

---

## Custom Fields (24 fields)

### Referral Capture System

The most distinctive feature — built to capture 5 referrals per client.

| Field | Key | Type |
|-------|-----|------|
| Referred By | `contact.referred_by` | TEXT |
| Referred By Phone | `contact.referred_by_phone` | TEXT |
| Referral Name 1 | `contact.referral_name_1` | TEXT |
| Referral Phone 1 | `contact.referral_phone_1` | PHONE |
| Referral Name 2 | `contact.referral_name_2` | TEXT |
| Referral Phone 2 | `contact.referral_phone_2` | PHONE |
| Referral Name 3 | `contact.referral_name_3` | TEXT |
| Referral Phone 3 | `contact.referral_phone_3` | PHONE |
| Referral Name 4 | `contact.referral_name_4` | TEXT |
| Referral Phone 4 | `contact.referral_phone_4` | PHONE |
| Referral Name 5 | `contact.referral_name_5` | TEXT |
| Referral Phone 5 | `contact.referral_phone_5` | TEXT |
| Referral Image | `contact.referral_image` | TEXT |
| Referral Selfie | `contact.referral_selfie` | FILE_UPLOAD |

### Campaign Tracking

| Field | Key | Type | Purpose |
|-------|-----|------|---------|
| Customer Campaign Name | `contact.customer_campaign_name` | TEXT | Which ad campaign they came from |
| Customer Campaign Details | `contact.customer_campaign_details` | TEXT | Campaign detail/ad set |
| Key | `contact.key` | TEXT | Internal system key |

### Consent & Preferences

| Field | Key | Type |
|-------|-----|------|
| I agree to receive text communications | `contact.text_permission` | CHECKBOX |
| SMS Content | `contact.sms_content` | CHECKBOX |
| Preferred Time | `contact.preferred_time` | CHECKBOX |
| Day | `contact.day` | CHECKBOX |
| When is the best time for an appointment? | `contact.when_is_the_best_time_for_an_appointment` | MULTIPLE_OPTIONS |
| Dropdown (M) — Service selector | `contact.dropdown_m` | MULTIPLE_OPTIONS |
| Additional Notes | `contact.additional_notes` | LARGE_TEXT |

---

## Custom Values (30 values — The Config Layer)

These act as centralized variables referenced inside workflows and messages. Change here → updates everywhere.

### Business Identity
```
Business Name           = Carisma Aesthetics
Clinic Phone Number     = +356 27802062
Logo                    = (empty — needs URL)
```

### Email Sender Identity
```
Email Sending First Name = (empty)
Email Sending Last Name  = (empty)
Email Sending Email      = (empty)
Email Sending Position   = (empty)
```

### URLs
```
Booking Page URL         = https://carismaaesthetics.bookmyupgrade.com/meta-ty
Google Review Page       = https://maps.app.goo.gl/dHXUGEo9pHG4wMvWA
Instagram Page           = https://www.instagram.com/carismaaesthetics/?hl=en
Privacy Policy           = https://carismaaesthetics.bookmyupgrade.com/t&c-privacy
Terms and Conditions     = https://carismaaesthetics.bookmyupgrade.com/t&c-privacy
Proof Page URL           = (empty)
```

### Client Notification Recipients
```
Client Email Notification #1 = +356 27802062  (phone — probably SMS notify)
Client Email Notification #2 = (empty)
Client Email Notification #3 = (empty)
Client SMS Notification #1   = info@carismaaesthetics.com
Client SMS Notification #2   = (empty)
Client SMS Notification #3   = (empty)
```

### AI Configuration
```
Assistant Name           = Sarah
AI Knowledge Value       = Clinic Name: Carisma Aesthetics Phone: +356 27802062
                           Email Address: info@carisma... [truncated — full doc in Knowledge URL]
Knowledge URL            = https://docs.google.com/document/d/1M4-79XB3H5ANfMlrYEfDSrGH8nTv_ZoEK6c9ajKLXZ0/
```

### Operations (ForeverBooked System)
```
ForeverBooked HQ         = https://docs.google.com/spreadsheets/d/1dxY4MJN_pvymkTTnzm5VwEcxXWhmh7IEt2AKYu1K...
Referral System Link     = https://link.foreverbooked.com/widget/form/rPlJKiOdQ21dml54TtCA
Treatment Plan Link      = https://docs.google.com/spreadsheets/d/1wBSLNsr7VovuFYNd-KT3DscJVgqbg2aJmRefnkr-...
Competitor Analysis      = https://just-chill1.github.io/ClientSEO/?workbookId=1zofmN5lTTMEdZXIkyR4qjx1KZEL...
Collab Doc               = https://request.foreverbooked.com/go
Twilio Phone Number      = (empty)
CRM API Key              = eyJhbGci... [JWT — the legacy API key for this location]
```

---

## Calendars (3)

| Name | ID | Type | Slot | Buffer | Auto-confirm |
|------|-----|------|------|--------|-------------|
| Unlimited Bookings Calendar | `8mAL5B37oWH5aIuaE0CQ` | Round Robin | 30 min | 0 min | ✅ Yes |
| Mert Gulen's Personal Calendar | `TqitZuYXMiIyPO4dQJqf` | Personal | 30 min | – | ✅ Yes |
| Muhammad Ali Aleem's Personal Calendar | `dnGmfMjU77bxbj6DQGeE` | Personal | 30 min | – | – |

**Calendar Group:** "Our Calendar" | ID: `stSK1JngAtEXy1OBeUtk`
- Slug: `main-calendar-link-b5687ca3-53fc-4923-b3fe-6595de7e2823`

Note: The primary booking link used in workflows is `bookmyupgrade.com`, not the native GHL calendar. The "Unlimited Bookings Calendar" (round robin) appears to be the intended GHL booking entry point.

---

## Forms (3)

| Form | ID | Source |
|------|----|--------|
| Meta Ads Optin | `yBOVXOsoltRYczQH2McH` | Facebook/Instagram ads |
| Google Ads Optin | `11o8XoKZYCxMYbl42r5z` | Google Ads |
| Website Appointment Request | `bbdQ4YXtJ7KJTRLtwvOx` | Website embed |

Each form submission triggers "Ad Optin SMS Sequence" and then "AI Outreach".

---

## Tags (10)

| Tag | ID | Role in System |
|-----|----|----------------|
| ai engaged | `AroUcaYPzAJeqmtXU12Q` | AI has started outreach — prevents re-entry |
| hotlead | `02k1dpbDPZDBGztS6Dup` | High-intent — triggers human alert |
| stop ai | `bMvIKjKHuqaEf8bxGWwQ` | Pauses AI — added when human takes over |
| disengage | `j6HBa6FNE2lMrPxdMQyi` | AI fully stopped |
| disengage1 | `bI2rmrJfCvOlzYJ8LzKt` | Secondary disengage state |
| timeout | `ZGVCoMOm2cxFrexXjnOq` | AI timed out waiting for response |
| cancel | `jGKYUnf32745DsFVieeT` | Contact replied STOP |
| fallback_reached | `KAKDchzpYe3ThplmCm4V` | Max follow-up attempts hit |
| email list | `l2yJSlEmGpllgEy9NkLO` | On email nurture |
| mailgun | `cUmcFOO05B2Sp36N7JHo` | Email delivery test/flag |
