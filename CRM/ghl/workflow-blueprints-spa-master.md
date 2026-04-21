# GHL Workflow Blueprints — Carisma Spa (Master)
> Replaces 10 clinic-specific Spanish workflows from onboarded snapshot.
> Built for Spa brand. Duplicate and swap treatment names + persona for Aesthetics (Sarah) and Slimming (Katya).

---

## WORKFLOW 1: New Lead - Inbound (Paid Ads)
**Replaces:** Paid -> New Lead -> FACIAL GLOW, Paid -> New Lead - Wasap -> FACIAL GLOW

**Trigger:** Contact Created (Facebook Lead Ad / Form Submit)

**Steps:**
1. Set Custom Field: `Lead Source` = `{{contact.utm_campaign}}`
2. Set Custom Field: `Funnel` = `{{contact.utm_content}}`
3. Set Custom Field: `Channel` = Paid Social
4. Add to Pipeline: **setter** → Stage: **🌱 New Leads**
5. Assign Contact (Round Robin — Setter team)
6. Wait: 0 min
7. → **Trigger Workflow: WhatsApp Opener** (Workflow 2)
8. Create Task: Type = "First Contact" | Due = Now + 5 min | Priority = High
9. Internal notification to assigned setter: "New lead assigned — {{contact.first_name}}, reply within 5 min"

**Filters / Conditions:**
- Only run if `Phone` field is not empty (required for WhatsApp)
- Skip if contact already exists with tag `active-lead`

---

## WORKFLOW 2: WhatsApp Opener
**Replaces:** WhatsApp --> Apertura ➡️FACIAL GLOW

**Trigger:** Called from Workflow 1 (or manually triggered by setter)

**Steps:**
1. Send WhatsApp Message (template below)
2. Wait: 24 hours
3. If no reply → Send Follow-up Message (template below)
4. If still no reply after 48 hours → Add tag: `no-reply-24h` | Notify setter

---

### WhatsApp Opener — Message Template

```
Hi {{contact.first_name}} 🌿

Thank you for reaching out to Carisma Spa & Wellness.

I'm Sarah, and I'd love to help you find the perfect treatment for you.

Could I ask — what are you looking for today? Whether it's deep relaxation, a specific treatment, or simply some time for yourself — I'm here to guide you.

Take your time. We're here whenever you're ready. 🤍

Peacefully,
Sarah
Carisma Spa & Wellness
```

---

### WhatsApp Follow-up — 24h No Reply

```
Hi {{contact.first_name}} 🌿

I just wanted to gently check in.

Sometimes life gets busy — and that's exactly why we're here when you need us.

If you'd like to explore what Carisma has to offer, or if you have any questions, I'm just a message away.

No rush. We'll be here. 🤍

Peacefully,
Sarah
```

---

## WORKFLOW 3: Treatment Explanation
**Replaces:** Audio - Maria - Explicacion doctora

**Trigger:** Manually triggered by setter (or triggered when contact replies with interest in specific treatment)

**Steps:**
1. Setter selects treatment type from dropdown (via internal note or custom field)
2. Send corresponding WhatsApp message (see templates below)

---

### Treatment Explanation Templates

**Massage (General)**
```
{{contact.first_name}}, let me tell you a little about what to expect 🌿

Our massage therapists use a blend of traditional techniques — tailored entirely to your body and what it needs that day.

Whether you're carrying tension from a long week, or simply craving stillness, we'll find the right balance for you.

Sessions run from 30 to 90 minutes. We can also discuss the best option for you once you arrive.

Shall I help you reserve a time? 🤍
```

**Facial**
```
{{contact.first_name}}, here's a little about our facial treatments 🌿

We use premium, natural-ingredient products suited to your skin type — from deep cleansing to hydration and anti-ageing care.

Each facial is a moment of quiet restoration for your skin and your mind.

I'd love to match you with the right treatment. Could you tell me a little about your skin goals?

Peacefully,
Sarah 🤍
```

**Hammam / Body Treatment**
```
{{contact.first_name}}, our hammam experience is unlike anything else 🌿

Rooted in centuries of Turkish spa tradition — steam, exfoliation, and a full-body cleanse that leaves you feeling completely renewed.

It's more than a treatment. It's a ritual.

If you'd like to know more, or if you're ready to book — I'm here.

Peacefully,
Sarah 🤍
```

**Spa Package / Couple's Experience**
```
{{contact.first_name}}, a little about our spa packages 🌿

We offer curated experiences — from single sessions to full-day retreats. Our couple's experiences are particularly beloved for those who want to share stillness with someone special.

Every package can be tailored to what you need most.

Would you like me to walk you through what we currently have available? 🤍
```

---

## WORKFLOW 4: Appointment Booked / Confirmed / Rescheduled
**Replaces:** Setter - Cita Agendada / Confirmada / re agendas 3.0 Facial Glow Reset

**Trigger:** Appointment Status = Confirmed (or Scheduled)

**Steps:**
1. Move pipeline stage → **✅ Booking One**
2. Set Custom Field: `Task Outcome` = Booked
3. Remove tag: `no-reply-24h` (if present)
4. Add tag: `appointment-confirmed`
5. Send WhatsApp confirmation (template below)
6. Wait: 24 hours before appointment
7. Send reminder message (template below)
8. Wait: 1 hour before appointment
9. Send final reminder (template below)

---

### Appointment Confirmed — WhatsApp

```
{{contact.first_name}}, you're all set 🌿

Your appointment at Carisma Spa & Wellness is confirmed.

📅 {{appointment.start_time}}
📍 {{location_name}}

We look forward to welcoming you and giving you the time you deserve.

If anything changes, just reply here and we'll take care of it.

Peacefully,
Sarah 🤍
Carisma Spa & Wellness
```

---

### 24h Reminder — WhatsApp

```
{{contact.first_name}} 🌿

A gentle reminder — your Carisma experience is tomorrow.

📅 {{appointment.start_time}}
📍 {{location_name}}

We recommend arriving a few minutes early so you can settle in and fully unwind from the moment you arrive.

We can't wait to see you. 🤍

Peacefully,
Sarah
```

---

### 1h Reminder — WhatsApp

```
{{contact.first_name}} 🌿

Your appointment at Carisma is in about an hour.

📅 {{appointment.start_time}}
📍 {{location_name}}

Take a breath. The world can wait.

See you soon. 🤍
```

---

### Appointment Rescheduled — WhatsApp

```
{{contact.first_name}}, no problem at all 🌿

Your appointment has been rescheduled.

📅 {{appointment.start_time}}
📍 {{location_name}}

We'll be ready for you. See you then. 🤍

Peacefully,
Sarah
```

---

## WORKFLOW 5: No-Show Recovery
**Replaces:** Setter - Cambio de Stage Cita No Show

**Trigger:** Appointment Status = No Show

**Steps:**
1. Move pipeline stage → **🚫 No Show**
2. Set Custom Field: `Task Outcome` = No Show
3. Add tag: `no-show`
4. Wait: 30 minutes
5. Send WhatsApp (template below)
6. Create Task: Type = "Follow-up 1" | Due = Now + 24h | Note = "No show recovery"
7. Notify setter internally

---

### No-Show Recovery — WhatsApp

```
{{contact.first_name}} 🌿

We noticed you weren't able to make your appointment today — and that's completely okay. Life happens.

Whenever you're ready, we'd love to welcome you in.

Just reply here and I'll help you find a new time that works for you.

No pressure. No rush. 🤍

Peacefully,
Sarah
Carisma Spa & Wellness
```

---

### No-Show — 48h Follow-up (if no reply)

```
{{contact.first_name}} 🌿

I'm just checking in one more time.

Your wellbeing matters to us — and we'd genuinely love for you to experience what Carisma has to offer.

If there's a better time, or if there's anything I can help with, I'm here.

Peacefully,
Sarah 🤍
```

---

## Snapshot Notes (for Aesthetics & Slimming duplicates)

When duplicating this snapshot:

**Aesthetics:** Replace `Sarah` persona with `Sarah` (same name, different tone — warmer, confidence-focused). Replace treatment names with: Botox, Fillers, Skin Boosters, PRP, Hydrafacial, Chemical Peels. Replace signature with "Beautifully yours, Sarah". Adjust tagline to "Glow with Confidence".

**Slimming:** Replace persona with `Katya`. Replace treatment names with: Body Contouring, Cavitation, Cryolipolysis, Nutritional Coaching, Slimming Packages. Replace signature with "With you every step, Katya". Tone is compassionate and shame-free — remove any urgency language and add empathy phrases.

---
*Last updated: 2026-04-21 | Master brand: Carisma Spa & Wellness*
