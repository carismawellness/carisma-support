"""
Constants and configuration for the GHL task automation system.
"""

from typing import Final

# ── Pipeline stages (must match exact GHL stage names) ────────────────────────
ACTIVE_STAGES: Final[list[str]] = [
    "🌱 New Leads",
    "📞 Contacted",
    "🚫 No Show",
    "🌿 Nurturing",
]

TERMINAL_STAGES: Final[list[str]] = [
    "✅ Booking Won",
    "❌ Booking Lost",
]

# Logical stage → task type mapping used by get_task_config()
STAGE_TASK_MAP: Final[dict[str, str]] = {
    "🌱 New Leads":  "New Lead",
    "📞 Contacted":  "Contacted",
    "🚫 No Show":    "No Show",
    "🌿 Nurturing":  "Nurturing",
}

OPEN_TASK_STATUSES: Final[list[str]] = [
    "pending",
    "in_progress",
]

# ── Thresholds ─────────────────────────────────────────────────────────────────
MAX_FOLLOWUPS: Final[int] = 4
DORMANT_THRESHOLD_DAYS: Final[int] = 120
NURTURING_DAYS: Final[int] = 90
REACTIVATION_DAYS: Final[int] = 120

# ── Pipeline & Stage IDs (Carisma Aesthetics — Call Pipeline) ─────────────────
PIPELINE_ID:           Final[str] = "4vgVsqiN12VGdloyzyxD"
STAGE_ID_NEW_LEADS:    Final[str] = "188e01d4-99aa-43e2-8b9a-8997a2557568"
STAGE_ID_CONTACTED:    Final[str] = "1269df45-f393-475b-a126-8db9e4f2f283"
STAGE_ID_BOOKING_WON:  Final[str] = "aa3b53ac-dc6e-47e2-bc05-4cfe8e65251c"
STAGE_ID_BOOKING_LOST: Final[str] = "5bb020b3-8f55-43d9-9778-4ba14d331fc1"
STAGE_ID_NO_SHOW:      Final[str] = "18b99532-66c1-4ecd-8af8-52cbd59c6d92"
STAGE_ID_NURTURING:    Final[str] = "fabe2304-7331-44e9-bdfb-ee26097fc96e"

# ── Priority scores (DESC sort = highest priority at top of queue) ─────────────
PRIORITY_SCORES: Final[dict[str, int]] = {
    "First Contact":              100,
    "Reschedule Call":             95,
    "Scheduled Callback":          90,
    "Follow-up 1":                 70,
    "Follow-up 2":                 60,
    "Follow-up 3":                 50,
    "Follow-up 4":                 40,
    "Nurturing Re-engagement":     20,
    "Reactivation":                10,
}

# ── Task subject templates ─────────────────────────────────────────────────────
TASK_SUBJECTS: Final[dict[str, str]] = {
    "First Contact":              "📞 First Contact — {name}",
    "Follow-up 1":                "📞 Follow-up 1 — {name}",
    "Follow-up 2":                "📞 Follow-up 2 — {name}",
    "Follow-up 3":                "📞 Follow-up 3 — {name}",
    "Follow-up 4":                "📞 Follow-up 4 — {name}",
    "Reschedule Call":            "🚨 Reschedule Call — {name}",
    "Scheduled Callback":         "📞 Scheduled Callback — {name}",
    "Nurturing Re-engagement":    "🌿 Nurturing Check-in — {name}",
    "Reactivation":               "♻ Reactivation — {name}",
}

# ── Task outcomes (setter dropdown values — must match GHL field exactly) ───────
TASK_OUTCOMES: Final[dict[str, str]] = {
    "FOLLOW_UP":      "Follow Up",
    "BOOKING":        "Booking",
    "BOOKING_LOST":   "Booking Lost",
    "NURTURE":        "Nurture",
    "LOST":           "Lost",
}

# ── GHL custom field API names (set these to match your GHL field keys) ────────
CUSTOM_FIELD_FOLLOWUP_COUNT      = "followup_count"
CUSTOM_FIELD_TASK_TYPE           = "task_type"
CUSTOM_FIELD_TASK_OUTCOME        = "task_outcome"
CUSTOM_FIELD_PRIORITY_SCORE      = "priority_score"
CUSTOM_FIELD_FIRST_CONTACT_DATE  = "first_contact_date"
CUSTOM_FIELD_TREATMENT_INTEREST  = "treatment_interest"
CUSTOM_FIELD_LEAD_VALUE          = "lead_value"

# ── Lead Valuation Rules ────────────────────────────────────────────────────────
# Maps UTM content slug / form-name fragment → opportunity monetary value (EUR).
# Matching is substring-based, case-insensitive, first match wins.
# These fire from the /webhook/lead-optin endpoint when a new Meta Ads lead
# arrives, so the CRM card shows the correct expected revenue immediately.

SPA_LEAD_VALUES: Final[dict[str, int]] = {
    "couples":        139,   # Couples Retreat (€280 value → €139 offer)
    "mothers_day":    115,   # Mother's Day Package
    "mother":         115,
    "signature":       99,   # Signature Spa Day
    "glow_reset":      99,   # Facial Glow Reset
    "facial_glow":     99,
    "facial":          99,
    "hammam":          99,   # Hammam / Body Treatment
    "contrast":        65,   # Contrast Therapy first session
    "massage":         80,   # Massage session
    "package":         99,   # Generic spa package
}
SPA_LEAD_VALUE_DEFAULT: Final[int] = 99

AESTHETICS_LEAD_VALUES: Final[dict[str, int]] = {
    "botox":          239,   # Botox + medical facial (€489 value → €239 offer)
    "thread":         199,   # Thread Lift (€600 value → €199 offer)
    "filler":         239,   # Dermal Fillers
    "fat_dissolv":    239,   # Fat Dissolving
    "skin_booster":   199,   # Skin Booster / PRP
    "prp":            199,
    "laser":          199,   # Laser Hair Removal
    "microneedling":  150,   # Microneedling
    "chemical_peel":  150,   # Chemical Peel
    "peel":           150,
    "hydrafacial":     99,   # HydraFacial (€180 value → €99 first session)
    "hydra":           99,
    "consultation":   150,   # Free consult — expected first-treatment value
}
AESTHETICS_LEAD_VALUE_DEFAULT: Final[int] = 150

SLIMMING_LEAD_VALUES: Final[dict[str, int]] = {
    "coolsculpt":     199,   # CoolSculpting Starter Pack (€625 value → €199)
    "emsculpt":       199,   # EMSculpt NEO 3-in-1 Protocol
    "skin_tight":     199,   # Skin Tightening VelaShape
    "velashape":      199,
    "medical_weight": 199,   # Medical Weight Loss Consult → likely upsells to €199 pkg
    "weight_loss":    199,
    "slimming":       199,
}
SLIMMING_LEAD_VALUE_DEFAULT: Final[int] = 199

# Combined lookup used by the webhook — brand key must match GHL_BRAND env var
BRAND_LEAD_VALUES: Final[dict[str, dict]] = {
    "spa":        {"values": SPA_LEAD_VALUES,         "default": SPA_LEAD_VALUE_DEFAULT},
    "aesthetics": {"values": AESTHETICS_LEAD_VALUES,  "default": AESTHETICS_LEAD_VALUE_DEFAULT},
    "slimming":   {"values": SLIMMING_LEAD_VALUES,    "default": SLIMMING_LEAD_VALUE_DEFAULT},
}


# ── Treatment name lookup (human-readable label for the Smart List column) ────
_TREATMENT_NAMES: Final[dict[str, str]] = {
    # Spa
    "couples":        "Couples Retreat",
    "mothers_day":    "Mother's Day Package",
    "mother":         "Mother's Day Package",
    "signature":      "Signature Spa Day",
    "glow_reset":     "Facial Glow Reset",
    "facial_glow":    "Facial Glow Reset",
    "facial":         "Facial Treatment",
    "hammam":         "Hammam & Body Treatment",
    "contrast":       "Contrast Therapy",
    "massage":        "Massage Session",
    "package":        "Spa Package",
    # Aesthetics
    "botox":          "Botox + Medical Facial",
    "thread":         "Thread Lift",
    "filler":         "Dermal Fillers",
    "fat_dissolv":    "Fat Dissolving",
    "skin_booster":   "Skin Booster / PRP",
    "prp":            "PRP Treatment",
    "laser":          "Laser Hair Removal",
    "microneedling":  "Microneedling",
    "chemical_peel":  "Chemical Peel",
    "peel":           "Chemical Peel",
    "hydrafacial":    "HydraFacial",
    "hydra":          "HydraFacial",
    "consultation":   "Consultation",
    # Slimming
    "coolsculpt":     "CoolSculpting",
    "emsculpt":       "EMSculpt NEO",
    "skin_tight":     "Skin Tightening VelaShape",
    "velashape":      "VelaShape",
    "medical_weight": "Medical Weight Loss",
    "weight_loss":    "Weight Loss Program",
    "slimming":       "Slimming Treatment",
}


def resolve_treatment_name(utm_content: str = "", form_name: str = "") -> str:
    """Return a human-readable treatment name from UTM/form signal. Empty string if unknown."""
    signal = (utm_content + " " + form_name).lower()
    for keyword, name in _TREATMENT_NAMES.items():
        if keyword in signal:
            return name
    return ""


def resolve_lead_value(brand: str, utm_content: str = "", form_name: str = "") -> int:
    """
    Return the opportunity monetary value (EUR) for a new Meta Ads lead.

    Checks utm_content first, then form_name, using substring matching against
    the brand's LEAD_VALUES map. Returns the brand default if nothing matches.
    """
    brand_cfg = BRAND_LEAD_VALUES.get(brand.lower())
    if not brand_cfg:
        return 0

    signal = (utm_content + " " + form_name).lower()
    for keyword, value in brand_cfg["values"].items():
        if keyword in signal:
            return value

    return brand_cfg["default"]
