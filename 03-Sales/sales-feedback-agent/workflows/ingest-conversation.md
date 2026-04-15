# Workflow: Ingest Conversation

## Purpose

Receive conversation data from any channel, normalize it into a standard format, and auto-detect brand, channel, and scenario type so the scoring pipeline can process it consistently.

---

## Input Sources

### WhatsApp
- **MCP tools:** `get_direct_chat_by_contact` (preferred, use when you have the contact name or number), `get_chat` (use when you have the chat ID), `list_messages` (use for browsing recent messages)
- **Pull method:** Retrieve the full conversation thread by contact name, phone number, or chat ID.
- **Extract:** All messages with timestamps, sender identification (SDR vs prospect), message content, media attachments (note but do not score media).
- **Handling multi-day threads:** If the thread spans multiple days, include all messages in the thread. The scoring agents will evaluate the full thread as one conversation.

### Email (Gmail)
- **MCP tools:** `gmail_list_threads` (to find relevant threads), `gmail_read_thread` (to pull full content)
- **Pull method:** Search for threads involving the SDR's email address and sales-related keywords. Filter by date range if specified.
- **Extract:** Full thread with all replies, timestamps, sender/recipient, subject line, and body text.
- **Handling forwarded threads:** If the email includes forwarded content, separate the SDR's own messages from forwarded material. Score only the SDR's authored messages.

### Phone Transcripts
- **Source:** Uploaded transcript file (Google Drive, local file, or pasted directly).
- **Supported formats:** Plain text with speaker labels, VTT/SRT subtitle format, or structured JSON.
- **Extract:** Full conversation text with speaker labels (SDR vs Prospect) and timestamps.
- **Speaker identification:** If the transcript does not label speakers, identify the SDR by looking for: brand greeting, brand name mention, treatment knowledge, booking language. The other speaker is the prospect.

### In-Person Notes
- **Source:** Notes entered into CRM, Google Doc, or pasted directly by the user.
- **Extract:** Whatever narrative or structured notes are available.
- **Limitations:** In-person notes are typically less detailed. Flag this in the normalized output so scoring agents adjust expectations.

### Direct Paste
- **Source:** User pastes the conversation directly into the chat.
- **Extract:** Parse the pasted text into individual messages. Look for speaker indicators (name prefixes, "SDR:", "Client:", timestamps, etc.).

---

## Normalization Process

Every conversation, regardless of source, must be normalized into this standard format before passing to scoring agents.

### Standard Conversation Format

```
conversation_id: [generated unique ID]
brand: [spa | aesthetics | slimming | unknown]
channel: [whatsapp | phone | email | instagram-dm | facebook-messenger | in-person]
scenario_type: [new-inquiry | follow-up | re-engagement | objection-response | booking-confirmation | post-treatment | consultation | no-show-recovery | complaint | referral-request]
rep_name: [SDR's first name, extracted from conversation]
prospect_name: [prospect's first name if available, otherwise "Unknown"]
conversation_date: [YYYY-MM-DD]
conversation_time: [HH:MM if available, otherwise "Unknown"]
outcome: [booked | no-show | lost | pending | unknown]
message_count: [total number of messages]
sdr_message_count: [number of SDR messages only]
transcript:
  - speaker: [SDR | Prospect]
    message: "[message content]"
    timestamp: "[ISO timestamp or relative position]"
  - speaker: [SDR | Prospect]
    message: "[message content]"
    timestamp: "[ISO timestamp or relative position]"
  ...
```

### Conversation ID Generation

Format: `{CHANNEL_CODE}-{BRAND_CODE}-{DATE}-{SEQUENCE}`

- Channel codes: `WA` (WhatsApp), `PH` (Phone), `EM` (Email), `IG` (Instagram DM), `FB` (Facebook Messenger), `IP` (In-Person)
- Brand codes: `SPA`, `AES`, `SLIM`
- Date: `YYYYMMDD`
- Sequence: 4-digit zero-padded number, incrementing per day

Example: `WA-AES-20260414-0001`

---

## Brand Detection

Apply these rules in order. Stop at the first confident match.

### Rule 1: Explicit Brand Name
Scan the transcript for exact matches:
- "Carisma Spa" or "Carisma Spa & Wellness" or "Carisma Spa and Wellness" --> `spa`
- "Carisma Aesthetics" --> `aesthetics`
- "Carisma Slimming" --> `slimming`

### Rule 2: Persona Name
- SDR identifies as **Katya** --> `slimming`
- SDR uses sign-off "Peacefully, Sarah" --> `spa`
- SDR uses sign-off "Beautifully yours, Sarah" --> `aesthetics`
- SDR identifies as **Sarah** without a distinguishing sign-off --> proceed to Rule 3

### Rule 3: Treatment Keywords
Count keyword matches against each brand's treatment vocabulary:

**Spa keywords:** massage, facial, body wrap, hot stone, aromatherapy, relaxation, spa day, wellness retreat, deep tissue, Swedish massage, reflexology, manicure, pedicure, hammam, sauna, steam room, body scrub, spa package

**Aesthetics keywords:** Botox, botulinum, filler, dermal filler, microneedling, chemical peel, laser, skin tightening, jawline, lip filler, anti-wrinkle, PRP, mesotherapy, LED therapy, acne scar, skin rejuvenation, Snatch Your Jawline, thread lift, fat dissolving (in face context), hydrafacial

**Slimming keywords:** weight loss, slimming, body contouring, metabolism, GLP-1, Ozempic, Saxenda, medical weight management, body composition, fat dissolving (in body context), cavitation, appetite support, BMI, medical consultation, diet, weight management program, EMS sculpt

Assign the brand with the highest keyword count. If tied, proceed to Rule 4.

### Rule 4: Operational Details
- EUR 50 deposit, card-over-phone, 8 locations, multiple spas --> `spa`
- Fresha deposit process, InterContinental, St Julian's, Eden car park, Leticia --> `aesthetics`
- EUR 70 medical consultation fee, Mon-Fri 9-7 Sat 9-1, doctor-led, medically supervised weight --> `slimming`

### Rule 5: User Specification
If the user explicitly states the brand when providing the conversation, use their specification regardless of auto-detection.

### Rule 6: Cannot Determine
If no confident match after Rules 1-4 and the user has not specified:
- Set brand to `unknown`.
- Present the evidence to the user: "I detected [X] spa keywords, [Y] aesthetics keywords, [Z] slimming keywords. The SDR identified as [name]. Which brand is this conversation for?"
- Wait for user confirmation before proceeding.

---

## Scenario Classification

Analyze the conversation content to classify the interaction type.

### Classification Rules

| Scenario | Primary Signals |
|----------|----------------|
| `new-inquiry` | Prospect's first message asks about treatments, pricing, or availability. No reference to prior interaction. SDR uses new-inquiry greeting. |
| `follow-up` | SDR opens with "following up on your inquiry" or references a previous conversation. Conversation thread shows prior messages. |
| `re-engagement` | Gap of 7+ days between last interaction and this one. SDR opens with re-engagement language ("wanted to check in", "it's been a while"). |
| `objection-response` | Core of the conversation is addressing a specific objection (price, timing, trust, competitor). May start mid-thread. |
| `booking-confirmation` | Conversation is focused on logistics: confirming date, time, deposit payment, what to bring, directions. |
| `post-treatment` | SDR is following up after a treatment. References the treatment that was done. Asks about satisfaction, results, rebooking. |
| `consultation` | Extended discovery conversation with detailed treatment recommendation. Typically longer than other types. |
| `no-show-recovery` | Prospect missed a scheduled appointment. SDR is re-engaging without guilt. |
| `complaint` | Prospect opens with dissatisfaction, negative experience, or request for resolution. |
| `referral-request` | SDR is asking for referrals, or prospect is referring someone to the brand. |

### Multi-Scenario Conversations
If a conversation transitions between scenarios (e.g., starts as `follow-up`, becomes `objection-response`, ends with `booking-confirmation`):
- Set `scenario_type` to the **primary** scenario (the one that occupies the most of the conversation).
- Add a `secondary_scenario` field noting the transition.

---

## Output

The normalized conversation object is the input to `workflows/score-conversation.md`. Pass the complete object including all fields, even if some are "Unknown."

### Validation Checks Before Passing to Scoring

1. **Brand is not unknown.** If brand is `unknown`, stop and ask the user.
2. **Transcript has at least 1 SDR message.** If zero SDR messages, the conversation cannot be scored. Notify the user.
3. **Speaker labels are assigned.** Every message must be labeled SDR or Prospect. If ambiguous, flag for user confirmation.
4. **Conversation date is present.** If not extractable, use today's date and note "Date estimated."

---

## Edge Cases

- **Group chats:** If the WhatsApp thread is a group chat (multiple prospects or multiple SDRs), identify each unique participant and score only the SDR's messages. Note which SDR if multiple.
- **Voice notes:** If the conversation includes voice notes (WhatsApp), note them as "[Voice note -- content not transcribed]" in the transcript. Flag for the user that voice notes could not be evaluated.
- **Images and media:** Note media messages as "[Image sent]" or "[Document sent]" in the transcript. Do not score media content, but note if the SDR sent relevant materials (brochures, price lists) as a positive operational indicator.
- **Automated messages:** If any messages appear to be automated (exact template matches, sent at unusual hours), flag them. Scoring agents should still evaluate them -- the SDR is responsible for what goes out under their name.
- **Non-English conversations:** Process as normal. All scoring criteria apply regardless of language. Note the language in the normalized output. Brand voice evaluation should account for the language used.
