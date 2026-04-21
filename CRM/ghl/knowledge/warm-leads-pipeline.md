# Warm Leads AI Pipeline — Carisma Aesthetics

**Pipeline name:** Warm Leads AI Pipeline  
**Location:** Carisma Aesthetics (`TrtSnBSSKBOkVVNxJ3AM`)  
**Purpose:** AI-first lead engagement for all new opt-in leads. The AI handles initial contact and qualifies leads through conversation; humans only get involved at HOT stage.  
**Modelled on:** Grade account Forever Booked framework (`KL2MApDIOBuILVr0Gx7E`)

> **Pipeline must be created in GHL UI** — GHL does not support pipeline creation via API. After creating, run `mcp__ghl__get_pipelines` to capture the stage IDs, then update `carisma-setup.md`.

---

## Pipeline Stages

Create this pipeline in **GHL → CRM → Pipelines → New Pipeline** named **"Warm Leads AI Pipeline"**. Add stages in this exact order:

| # | Stage Name | Emoji | Meaning |
|---|-----------|-------|---------|
| 0 | ❄️ COLD Leads (AI Engaged) | ❄️ | AI has reached out; no reply yet |
| 1 | 👋 Warm Leads | 👋 | AI detected interest/engagement |
| 2 | 🔥 HOT Leads | 🔥 | High intent — human alert triggered |
| 3 | ✍️ Manual Followup | ✍️ | Human rep takes over |
| 4 | ✨ AI Followup | ✨ | AI re-engaged after human stall |
| 5 | ♻️ Recycle List | ♻️ | No response after all attempts |
| 6 | 📆 Appt Booked | 📆 | Appointment confirmed |
| 7 | ❌ Cancel/No-Show | ❌ | Cancelled or no-showed |
| 8 | ✅ Showed | ✅ | Attended — enter sale value here |

---

## AI Routing Tags

All 9 tags have been created in Carisma Aesthetics. These control which workflow runs for each lead:

| Tag | ID | Role |
|-----|----|------|
| `ai engaged` | `M2S6yumBAHAX8nyKm5Nv` | Added when AI starts outreach — prevents duplicate sequences |
| `hotlead` | `86mmrekqeVqEjjHOnryp` | Added when HOT intent detected — triggers human alert |
| `stop ai` | `iTprzmcIHB16WaqAdeUO` | Added when human takes over — triggers Disengage AI |
| `disengage` | `3nbE6aR4uH1rxG0Np61g` | AI fully stopped |
| `disengage1` | `nKMWRDyxIhS9ApnceFIS` | Secondary disengage state (safety) |
| `timeout` | `iENnhpox8UxLzzNPk8J9` | AI timed out waiting for reply |
| `cancel` | `9awtrnVGDljZamFfHCJH` | Contact replied STOP — unsubscribed |
| `fallback_reached` | `vBEmuUQi6A664AMFo2e6` | Max follow-up attempts hit |
| `email list` | `J11faWmUt5wPA9yDUIMG` | On long-term email nurture |

**Existing tag that integrates:**
| `warm lead` | `eYKlSXHuTWHmvIlaZ1CP` | Legacy warm lead tag — map to 👋 Warm Leads stage |

---

## How the System Works — Flow Map

```
New Lead Opts In (Meta/Google ad form)
         ↓
  [Ad Optin SMS Sequence] — immediate confirmation SMS
         ↓
  [AI Outreach] — AI starts SMS conversation
   + Tags: ai engaged
   + Stage: ❄️ COLD Leads (AI Engaged)
         ↓
     Reply received?
     │
     ├── YES → [AI Responder] handles conversation
     │              │
     │              ├── HOT signals detected
     │              │     → add tag: hotlead
     │              │     → stage: 🔥 HOT Leads
     │              │     → [Hot Lead] → SMS/email alert to team
     │              │     → team books manually or shares booking link
     │              │
     │              ├── Soft interest / questions answered
     │              │     → stage: 👋 Warm Leads
     │              │
     │              ├── Timeout (no reply after N hours)
     │              │     → add tag: timeout
     │              │     → [Agent Timeout] → stage: 👋 Warm Leads
     │              │
     │              └── Booked via AI
     │                    → stage: 📆 Appt Booked
     │
     └── NO reply (after full sequence)
               → add tag: fallback_reached
               → stage: ♻️ Recycle List
               → [Standard Booster Shot] after 30 days

Human at 🔥 HOT Leads stage:
     ├── Closes → stage: 📆 Appt Booked
     ├── Stalls → [AI Followup] restarts → stage: ✨ AI Followup
     └── Lost → stage: ❌ Cancel/No-Show or ♻️ Recycle List

Contact replies STOP at any time:
     → add tag: cancel
     → [Cancel/Unsubscribe] removes from all sequences
```

---

## Workflow Blueprints

Build these workflows in **GHL → Automations → Workflows** in the order listed (compliance-critical ones first).

---

### 1. Cancel / Unsubscribe ⚠️ (Build First — Compliance)

**Trigger:** Inbound message received  
**Filter:** Message body contains any of: STOP, UNSUBSCRIBE, CANCEL, END, QUIT

**Actions:**
1. Add tag: `cancel`
2. Remove tag: `ai engaged`
3. Remove contact from all campaigns
4. Remove contact from all active workflows
5. Update opportunity stage → ❌ Cancel/No-Show
6. Send SMS: `You've been unsubscribed. Reply START to opt back in.`

---

### 2. Disengage AI

**Trigger:** Tag added → `stop ai`

**Actions:**
1. Remove contact from workflow: AI Outreach (if active)
2. Remove contact from workflow: AI Responder (if active)
3. Add tag: `disengage`
4. Remove tag: `ai engaged`
5. Update opportunity stage → ✍️ Manual Followup
6. Internal notification (SMS/email to manager): `🛑 AI disengaged for {{contact.first_name}} — human taking over`

---

### 3. Ad Optin SMS Sequence

**Trigger:** Form submitted (Meta Ads Optin OR Google Ads Optin)

**Actions:**
1. Create opportunity in pipeline: Warm Leads AI Pipeline → ❄️ COLD Leads (AI Engaged)
2. Wait: 1 minute
3. Send SMS:
   ```
   Hi {{contact.first_name}}! It's Sarah from Carisma Aesthetics 👋 
   I saw you were interested in our treatments — I'd love to help you find 
   the right one for your goals. What are you looking to improve?
   ```
4. Add tag: `ai engaged`
5. Wait: 30 minutes
6. IF no reply: enroll in AI Outreach workflow

---

### 4. AI Outreach

**Trigger:** Enrolled from Ad Optin SMS Sequence (or manually)  
**Condition:** Tag does NOT contain `cancel`, `disengage`, `stop ai`

**Actions:**
1. Wait: 1 hour (if no reply from Ad Optin SMS)
2. Send SMS (follow-up 1):
   ```
   Hey {{contact.first_name}}, just checking in — Carisma Aesthetics here. 
   We have some amazing results with [treatment] right now. 
   Want me to send you more info? 🌟
   ```
3. Wait: 1 day
4. IF no reply — Send SMS (follow-up 2):
   ```
   {{contact.first_name}}, I don't want you to miss out — we have limited 
   availability this week at Carisma Aesthetics. 
   What's your biggest concern about starting treatment?
   ```
5. Wait: 2 days
6. IF no reply — Send SMS (follow-up 3):
   ```
   Last message from me, {{contact.first_name}} 🤍 
   If you ever want to explore what Carisma can do for you, 
   just reply here and I'll be waiting.
   — Sarah, Carisma Aesthetics
   ```
7. Add tag: `fallback_reached`
8. Update opportunity stage → ♻️ Recycle List

---

### 5. AI Responder

**Trigger:** Inbound message received  
**Condition:** Tag contains `ai engaged` AND does NOT contain `cancel`, `stop ai`, `disengage`

**Actions:**
1. Activate GHL Conversation AI (Sarah) — connects to Knowledge URL
2. IF AI detects HOT signals (intent words: "book", "how much", "appointment", "when can I", "ready", "yes", "interested"):
   - Add tag: `hotlead`
   - Update opportunity stage → 🔥 HOT Leads
   - Trigger: Hot Lead workflow
3. IF AI response times out (no lead reply for 4 hours):
   - Add tag: `timeout`
   - Update opportunity stage → 👋 Warm Leads
   - Trigger: Agent Timeout workflow
4. IF AI detects disinterest ("not interested", "stop", "no thanks", "remove me"):
   - Trigger: Contact Not Interested workflow

---

### 6. Hot Lead (Human Alert)

**Trigger:** Tag added → `hotlead`

**Actions:**
1. Update opportunity stage → 🔥 HOT Leads
2. Send internal SMS to manager:
   ```
   🔥 HOT LEAD: {{contact.first_name}} {{contact.last_name}}
   Phone: {{contact.phone}}
   Source: {{contact.source}}
   Last message: [last inbound message]
   → Book now: {{contact.id}}
   ```
3. Send internal email to manager:
   - Subject: `🔥 HOT Lead — {{contact.first_name}} {{contact.last_name}}`
   - Body: Contact details + conversation link
4. Create task assigned to manager:
   - Title: `CALL HOT LEAD — {{contact.first_name}}`
   - Due: 2 hours from now
   - Priority: High

---

### 7. Agent Timeout / Warm Lead

**Trigger:** Tag added → `timeout`

**Actions:**
1. Update opportunity stage → 👋 Warm Leads
2. Wait: 24 hours
3. Condition: IF tag still contains `timeout` AND does NOT contain `hotlead`, `disengage`
4. Send SMS:
   ```
   Hey {{contact.first_name}} 👋 Just wanted to circle back — 
   is there anything I can help you with at Carisma Aesthetics? 
   We're here whenever you're ready 🌸
   ```
5. Remove tag: `timeout`
6. Wait: 3 days
7. If no reply → update stage → ♻️ Recycle List

---

### 8. Contact Not Interested

**Trigger:** Tag added → `disq_not_interested` (use existing tag)  
OR: AI Responder triggers it directly

**Actions:**
1. Remove tag: `ai engaged`
2. Add tag: `disengage`
3. Update opportunity stage → ♻️ Recycle List
4. Send SMS:
   ```
   No problem at all, {{contact.first_name}} 🙂 
   We'll leave you in peace. If you ever change your mind, 
   we're always here. Take care!
   — Sarah, Carisma Aesthetics
   ```
5. Remove from all active workflows

---

### 9. Re-engage AI

**Trigger:** Manual enrollment OR scheduled booster  
**Condition:** Tag does NOT contain `cancel`, `disengage`, `ai engaged`

**Actions:**
1. Add tag: `ai engaged`
2. Update opportunity stage → ❄️ COLD Leads (AI Engaged)
3. Send SMS:
   ```
   Hi {{contact.first_name}}! It's Sarah from Carisma Aesthetics 👋 
   It's been a while — I wanted to reach out because we have some 
   exciting new treatments available. Interested in learning more?
   ```
4. Enroll in AI Outreach (from step 2)

---

### 10. Standard Booster Shot

**Trigger:** Date/time based — run manually or on schedule  
**Filter:** Tag contains `email list` OR stage = ♻️ Recycle List  
**Condition:** Does NOT contain `cancel`, `disengage`

**Actions:**
1. Send SMS (customise per campaign):
   ```
   {{contact.first_name}}, it's Sarah from Carisma Aesthetics 🌟 
   We're running a special [offer] this [month]. 
   Reply YES and I'll send you all the details!
   ```
2. IF reply received → trigger Re-engage AI

---

### 11. Mark Conversations as Read

**Trigger:** Inbound message received  
**Condition:** Message is marked unread AND tag contains `disengage` OR `cancel`

**Actions:**
1. Update conversation status → Read

---

## Setup Order (Dependency Sequence)

Follow this exact order to avoid broken workflow references:

1. ✅ **Create tags** — Done (9 tags created via API)
2. ⬜ **Create pipeline in GHL UI** — 9 stages, exact names above
3. ⬜ **Create custom values** (Business Name, Clinic Phone, Booking URL, Knowledge URL, Assistant Name, notification emails) — Phase 3 of `grade-duplication-map.md`
4. ⬜ **Create forms** (Meta Ads Optin, Google Ads Optin) in GHL → Sites → Forms
5. ⬜ **Configure Conversation AI** (GHL → Settings → Conversation AI) — attach knowledge base URL
6. ⬜ **Build workflows in order:** Cancel/Unsubscribe → Disengage AI → Ad Optin SMS → AI Outreach → AI Responder → Hot Lead → Agent Timeout → Contact Not Interested → Re-engage AI → Standard Booster Shot → Mark as Read
7. ⬜ **Connect form triggers** to Ad Optin SMS Sequence workflow
8. ⬜ **Test with a dummy contact** — submit form, verify: tag added, stage moved, SMS sent, AI responds

---

## Integration with Existing Setter System

The Warm Leads AI Pipeline runs **parallel to** the existing setter queue, not as a replacement:

| System | Pipeline | Who works it | Leads |
|--------|----------|-------------|-------|
| Setter Queue | setter pipeline | Human setters | Inbound + booked leads |
| AI Pipeline | Warm Leads AI Pipeline | AI (Sarah) first, human at HOT | New ad opt-ins |

**Handoff point:** When a lead hits 🔥 HOT Leads, the Hot Lead workflow fires and a setter picks it up. The setter adds tag `stop ai` → Disengage AI fires → AI stops → setter works the lead in the setter queue.

**Mapping existing tags to new pipeline:**
- `warm lead` (existing `eYKlSXHuTWHmvIlaZ1CP`) → maps to 👋 Warm Leads stage
- `stg_new_lead` → maps to ❄️ COLD Leads stage
- `stg_contacted` → maps to 👋 Warm Leads stage
- `disq_not_interested` → triggers Contact Not Interested workflow

---

## Conversation AI Configuration

After building the pipeline, configure GHL's native Conversation AI:

1. **GHL → Settings → Conversation AI**
2. Set **Assistant Name:** `Sarah`
3. Set **Knowledge Source:** URL → paste the Knowledge URL from custom values
   - Currently: `https://docs.google.com/document/d/1M4-79XB3H5ANfMlrYEfDSrGH8nTv_ZoEK6c9ajKLXZ0/`
   - Replace content with `/CRM/ghl/knowledge/ai-knowledge-base.md`
4. Set **Auto-reply:** SMS channel only
5. Set **Handoff condition:** When AI confidence < 70% OR when keywords trigger `stop ai` tag

See full knowledge base content: `CRM/ghl/knowledge/ai-knowledge-base.md`

---

## Custom Values Needed

Before activating any workflows, create these custom values in GHL → Settings → Custom Values:

| Name | Value |
|------|-------|
| Business Name | Carisma Aesthetics |
| Clinic Phone Number | +356 27802062 |
| Booking Page URL | https://carismaaesthetics.bookmyupgrade.com/meta-ty |
| Google Review Page | https://maps.app.goo.gl/dHXUGEo9pHG4wMvWA |
| Instagram Page | https://www.instagram.com/carismaaesthetics/ |
| Privacy Policy | https://carismaaesthetics.bookmyupgrade.com/t&c-privacy |
| Terms and Conditions | https://carismaaesthetics.bookmyupgrade.com/t&c-privacy |
| Assistant Name | Sarah |
| Knowledge URL | https://docs.google.com/document/d/1M4-79XB3H5ANfMlrYEfDSrGH8nTv_ZoEK6c9ajKLXZ0/ |
| Client SMS Notification #1 | +356 27802062 |
| Client Email Notification #1 | info@carismaaesthetics.com |
| Email Sending First Name | Sarah |
| Email Sending Email | info@carismaaesthetics.com |

Use `mcp__ghl__create_location_custom_value` for each, or run the quick copy via `Tools/ghl_copy_config.py` (see `grade-duplication-map.md`).
