"""
GHL Master Template Rebrand: Raviva → Carisma
- Renames all Spanish content to English
- Removes all Raviva references, replaces with Carisma
- Updates pipeline stages, custom fields, tags, custom values, calendar
"""

import os, time, json, requests
from dotenv import load_dotenv

load_dotenv()

API_KEY     = os.getenv("GHL_API_KEY")
LOCATION_ID = os.getenv("GHL_LOCATION_ID")
BASE        = "https://services.leadconnectorhq.com"
HEADERS     = {
    "Authorization": f"Bearer {API_KEY}",
    "Version": "2021-07-28",
    "Content-Type": "application/json",
}

def put(path, data):
    r = requests.put(f"{BASE}{path}", headers=HEADERS, json=data)
    time.sleep(0.15)  # stay under 100 req/10s
    return r

def patch(path, data):
    r = requests.patch(f"{BASE}{path}", headers=HEADERS, json=data)
    time.sleep(0.15)
    return r

results = {"ok": [], "fail": []}

def log(label, r):
    if r.status_code in (200, 201):
        results["ok"].append(label)
        print(f"  ✅ {label}")
    else:
        results["fail"].append(f"{label}: {r.status_code} {r.text[:120]}")
        print(f"  ❌ {label}: {r.status_code} {r.text[:120]}")


# ─────────────────────────────────────────────────────────────────────────────
# 1. PIPELINE — rename "setter" pipeline + translate all 13 stages
# ─────────────────────────────────────────────────────────────────────────────
print("\n── PIPELINE ──")

SETTER_PIPELINE_ID = "7eeuR5VNp3abBC4VcHaR"

pipeline_payload = {
    "name": "Booking Pipeline",
    "stages": [
        {"id": "3849893b-89f9-4185-bc4a-1ceea48d3d07", "name": "Auto Appointment",    "position": 0,  "showInFunnel": False, "showInPieChart": True,  "stageWinProbability": 7.14},
        {"id": "8e4b31f7-74c9-4026-9011-8019848c69a8", "name": "New Lead",             "position": 1,  "showInFunnel": True,  "showInPieChart": True,  "stageWinProbability": 14.29},
        {"id": "9f112e51-d942-4969-9503-8d24b2544165", "name": "Contacted Day 1",      "position": 2,  "showInFunnel": False, "showInPieChart": True,  "stageWinProbability": 21.43},
        {"id": "81bce41d-24e4-472a-bc9a-3250d75267c5", "name": "Contacted Day 2",      "position": 3,  "showInFunnel": False, "showInPieChart": True,  "stageWinProbability": 28.57},
        {"id": "841372bd-245d-4f43-964d-9012f7d818da", "name": "Contacted Day 3",      "position": 4,  "showInFunnel": False, "showInPieChart": True,  "stageWinProbability": 35.71},
        {"id": "1b2c0137-a577-4129-a550-07e6b5cb4375", "name": "Contacted Day 7",      "position": 5,  "showInFunnel": False, "showInPieChart": True,  "stageWinProbability": 42.86},
        {"id": "36f92c98-c1fe-4d27-9a51-87f56ded0789", "name": "Conversation",         "position": 6,  "showInFunnel": True,  "showInPieChart": True,  "stageWinProbability": 50.0},
        {"id": "2c408073-d1d8-400b-acf0-31273d4d9237", "name": "Qualified",            "position": 7,  "showInFunnel": True,  "showInPieChart": True,  "stageWinProbability": 57.14},
        {"id": "792b1849-bbb9-4e44-b6d1-27be084f9eeb", "name": "Nurturing",            "position": 8,  "showInFunnel": True,  "showInPieChart": True,  "stageWinProbability": 64.29},
        {"id": "e7718692-af46-4594-b2f1-026383b9297a", "name": "Appointment Booked",   "position": 9,  "showInFunnel": True,  "showInPieChart": True,  "stageWinProbability": 71.43},
        {"id": "3c2f5de3-b934-4249-887a-455c36e46bbc", "name": "Appointment Confirmed","position": 10, "showInFunnel": True,  "showInPieChart": True,  "stageWinProbability": 78.57},
        {"id": "52543fc7-b4ca-43c4-97ec-cd35afde1f0e", "name": "No Show",              "position": 11, "showInFunnel": False, "showInPieChart": False, "stageWinProbability": 85.71},
        {"id": "be2d374d-3b89-4d0c-b5e3-3c75e1c885d9", "name": "Showed",              "position": 12, "showInFunnel": True,  "showInPieChart": True,  "stageWinProbability": 92.86},
    ]
}
r = put(f"/opportunities/pipelines/{SETTER_PIPELINE_ID}", pipeline_payload)
log("Pipeline: setter → Booking Pipeline (all stages translated)", r)


# ─────────────────────────────────────────────────────────────────────────────
# 2. CUSTOM FIELDS
# ─────────────────────────────────────────────────────────────────────────────
print("\n── CUSTOM FIELDS ──")

FIELD_UPDATES = [
    # (field_id, new_name, optional_picklist_options)
    ("2zl5lMJfjTM10DcExe8I", "Bulk Send Channel",        ["whatsapp", "sms", "email"]),
    ("H421tc4uOwVdS5iTUBeW", "Channel",                  None),
    ("FXcxaZdQiVuhc3p9DPAY", "Partner",                  None),
    ("FnX3YP95fN8OtJLz7VE1", "Position",                 None),
    ("qUISS0j3B2KITy9WpfYQ", "Language",                 None),
    ("r7LGbXT39RAHtjX7YTt8", "Send Date",                None),
    ("rVMfpy5VTGXKC7mqIXfS", "Industry",                 None),
    ("Up5ymdT7ptet3CC7m9U8", "Size",                     None),
    ("K7KXdibRx2icP07VNNuu", "Deposit Amount Paid",      None),
    ("O082pAK1KfbK9mzfqCwh", "Practitioner",             None),
    ("j5xvR9VXuqF1FPxX12ka", "Date of Birth",            None),
    ("cHlJcNtPIKabuC7C04I3", "External Appointment ID",  None),
    ("jeCX8aUDZOVh2Ds0SVIk", "Preferred Booking Time",   [
        "Today if possible",
        "This week",
        "In a few weeks",
        "I only want to receive information"
    ]),
    ("vpT3O7JiJAZrJelWvmVa", "Promotion Interest",       [
        "Facial & Skin Treatment",
        "Body Contouring",
        "Wellness & IV Therapy",
        "Slimming Consultation",
        "Aesthetics Consultation",
        "Spa Package"
    ]),
]

for field_id, new_name, picks in FIELD_UPDATES:
    payload = {"name": new_name}
    if picks:
        payload["picklistOptions"] = picks
    r = put(f"/locations/{LOCATION_ID}/customFields/{field_id}", payload)
    log(f"Field → '{new_name}'", r)


# ─────────────────────────────────────────────────────────────────────────────
# 3. CUSTOM VALUES
# ─────────────────────────────────────────────────────────────────────────────
print("\n── CUSTOM VALUES ──")

r = put(f"/locations/{LOCATION_ID}/customValues/uS1T77yyo8ub4dsfnCFS", {
    "name": "Centre Address",
    "value": "Carisma Wellness Group, Malta"
})
log("Custom Value: Dirección del Centro → Centre Address", r)


# ─────────────────────────────────────────────────────────────────────────────
# 4. TAGS
# ─────────────────────────────────────────────────────────────────────────────
print("\n── TAGS ──")

TAG_UPDATES = [
    # (tag_id, new_name)

    # appt_ — appointment type/status tags
    ("rkY7bONUDOWhIoS11EXp", "appt_cancelled"),
    ("tA0JQAUClCJdS0wYZDw8", "appt_invoice_sent"),
    ("dwMRXA5bp4BiVUCPTPQH", "appt_invoice_accepted"),
    ("Id1AggLgirVENFUf2HO7", "appt_invoice_rejected"),
    ("MAVFWkwLsLFdTTVVaZPc", "appt_consultation_intake"),
    ("e0xhz9tX1CBFlWJGydu2", "appt_consultation_followup"),
    ("t7cQdH2QxljqkGc4CX0r", "appt_wellness_assessment"),
    ("EuZBNYokKVzyaCztSL1N", "appt_facial_treatment"),
    ("ib9zudl9pk9gvOH9937D", "appt_treatment_session"),
    ("VcdfKSAyLy1i2RydUR3j", "appt_lip_treatment"),
    ("1XHdvvUSvgueu9P1P3zY", "appt_massage_treatment"),
    ("oFxBgyGevjVvqEBc1zsq", "appt_membership_premium"),
    ("f6gFRR1MLJJQ5MwwqU48", "appt_membership_platinum"),
    ("xI8i9L9jilaNJnzaW5KL", "appt_iv_therapy"),
    ("ZcOae2jFf2jNcOhvDqKe", "appt_body_treatment"),      # was shockware (typo)
    ("SKwK4CkUs3xsYpqC7f0J", "appt_body_contouring"),     # was shockwave
    ("xHKaT7hYnhEeQ5BSOFhG", "appt_iv_detox"),
    ("yfVuY42XnAuKPSIakOb7", "appt_iv_immune_boost"),

    # bbdd_ — database/import tags
    ("sjHb0yTN9L27X9YYNwTo", "db_clients_13-03-26"),
    ("y82sD9dF7UxQeKN7n4GE", "db_clients_06-11-25"),

    # audio_ tag
    ("m2m5IQ10bHGpdfB8NhmZ", "audio_carisma_treatment_explanation"),

    # dsc_ → disq_ (disqualification reasons)
    ("uTK58GNo9IEAJZdSNO4L", "disq_dns_block"),
    ("UBklAO6rsFrw0LBfEvhV", "disq_invalid_data"),
    ("ZdKPcNKN6xpVSgNUmZLO", "disq_duplicate"),
    ("9UdzogLOeDrg4nNeuGMn", "disq_undecided"),
    ("iBhYkyWzzSts34luMpXI", "disq_not_interested"),
    ("Ad1rYRtqx8t6L6G1Magt", "disq_no_response_post_appt"),
    ("JAbxRtlmHLGtw9m1PXn8", "disq_other"),
    ("Prr7F9dOm1znKoHZuwjC", "disq_wrong_service"),
    ("kRtTj2M5Udgkwm2X85DU", "disq_no_budget"),

    # evento_ tag
    ("GbzDGZwgk2RBbp31DkqB", "event_scheduled"),

    # paid_ tag
    ("t6c6wKM0Pph6ozxknWW9", "paid_force_send"),

    # src_ — lead source tags
    ("7IgCvM9kD10VRiWpgEvR", "src_wellness_assessment_funnel"),
    ("jMEXDkIOh7IbW0Iqj6fv", "src_facial_funnel"),
    ("6nCxYgszqAJkwb4AWZ0C", "src_facebook_form"),
    ("lKK9OwtlxsfQuwLtytJ4", "src_language_en"),
    ("dYcH5ttIGLUh51uX73NC", "src_language_es"),
    ("G62i8qA65WOMO7oI4Cfd", "src_aesthetics_funnel"),
    ("D8s9Bf3LZYiWa1mflnXr", "src_chat_widget"),
    ("o8hQm9NHyJqdqvmE7U1k", "src_landing_form"),
    ("hGLPUwZS08Epcn1rzdem", "src_service_a_funnel"),
    ("7gmOp5tdxIjeZwTbZAU8", "src_body_treatment_funnel"),
    ("IF5d2dtcoxycSZkXQiyK", "src_wellness_funnel"),

    # stg_ — stage mirror tags
    ("BnBF8MPeXIaFJ2WqOwZl", "stg_appt_booked"),
    ("24gnpo87eAGNaPdcNhZB", "stg_appt_confirmed"),
    ("qE22EwCtTkLCv543zADU", "stg_contacted_d1"),
    ("plPROMlcGBgvIHyOJpiO", "stg_contacted_d2"),
    ("kGVvk6wFOWs4uuvtHMFC", "stg_contacted_d3"),
    ("sNGtgvZx6Fiw1w8PoOor", "stg_contacted_d7"),
    ("tKzhyugIpWey2UfaHv2F", "stg_conversation"),
    ("GFv3zTdw833j0YCFydO9", "stg_qualified"),
    ("IlvIH2UZ9Mo41KYwqaQN", "stg_disqualified"),
    ("oi9oI1eBTSkZdHNaZ5nz", "stg_no_response"),

    # other misc
    ("0SoCvMUb5dNTkz8fKXXR", "whatsapp_promo"),
    ("k5UEmZVtYYliBupZ05xK", "membership"),             # already English-ish
]

for tag_id, new_name in TAG_UPDATES:
    r = put(f"/locations/{LOCATION_ID}/tags/{tag_id}", {"name": new_name})
    log(f"Tag → '{new_name}'", r)


# ─────────────────────────────────────────────────────────────────────────────
# 5. CALENDAR — remove Raviva, update to Carisma
# ─────────────────────────────────────────────────────────────────────────────
print("\n── CALENDAR ──")

FACIAL_CALENDAR_ID = "WTDZQQsUxCtr6uglWSBe"

new_description = """<p>✨ FACIAL & SKIN TREATMENT | Carisma Aesthetics</p>
<p>50-60 minute facial rejuvenation treatment combining advanced aesthetic technology with Carisma's personalised approach to skin health.</p>
<p></p>
<p>✅ WHAT'S INCLUDED:</p>
<p>- Personalised skin analysis</p>
<p>- Cleansing & skin preparation</p>
<p>- Advanced treatment (Oxygenation + Exfoliation + Infusion)</p>
<p>- LED Therapy (bonus)</p>
<p>- Personalised skincare recommendations</p>
<p></p>
<p>⚡ RESULTS:</p>
<p>- Immediate glow effect from the first session</p>
<p>- Zero needles | Zero pain | Zero downtime</p>
<p>—</p>
<p>📋 APPOINTMENT PROCESS:</p>
<p>1️⃣ BOOKING — Select your preferred date and time on this calendar.</p>
<p>2️⃣ CONFIRMATION — Our team will confirm your date and time within 24 hours via WhatsApp or phone call.</p>
<p>3️⃣ YOUR APPOINTMENT — Arrive with a clean face, no makeup. Get ready to leave glowing!</p>
<p>—</p>
<p>📍 LOCATION:</p>
<p>Carisma Aesthetics, Malta</p>
<p></p>
<p>📞 Questions? Text us on WhatsApp or call us directly. We can't wait to see you!</p>"""

r = put(f"/calendars/{FACIAL_CALENDAR_ID}", {
    "name": "Carisma Aesthetics - First Consultation",
    "description": new_description,
    "eventTitle": "{{contact.name}} - Carisma Aesthetics",
    "formSubmitRedirectUrl": "",
    "formSubmitThanksMessage": "Thank you for booking with Carisma Aesthetics. Our team will contact you shortly to confirm your appointment. Please reach out on WhatsApp if you have any questions.",
})
log("Calendar: Facial Glow Reset → Carisma Aesthetics - First Consultation", r)


# ─────────────────────────────────────────────────────────────────────────────
# SUMMARY
# ─────────────────────────────────────────────────────────────────────────────
print(f"\n{'='*60}")
print(f"  DONE — {len(results['ok'])} updated, {len(results['fail'])} failed")
if results["fail"]:
    print("\n  FAILURES:")
    for f in results["fail"]:
        print(f"    {f}")
print(f"{'='*60}")
