"""
Constants and configuration for the GHL task automation system.
"""

from typing import Final

# ── Pipeline stages (must match exact GHL stage names) ────────────────────────
# Setter pipeline stages (Spanish names as configured in GHL)
ACTIVE_STAGES: Final[list[str]] = [
    "lead nuevo",           # New Lead — first contact not yet made
    "contactado dia 1",     # Contacted day 1 — no answer → follow-up
    "contactado dia 2",     # Contacted day 2
    "contactado dia 3",     # Contacted day 3
    "contactado dia 7",     # Contacted day 7
    "conversacion",         # Conversation — connected and interested
    "no show",              # No Show — scheduled but didn't attend
]

TERMINAL_STAGES: Final[list[str]] = [
    "cita confirmada",      # Booking Confirmed
    "cualificado",          # Qualified / won
    "showed",               # Showed up for consultation
    "nurturing",            # Long-term nurture (treat as terminal for task purposes)
]

# Logical stage → task type mapping used by get_task_config()
# Maps actual GHL stage names to the task logic category
STAGE_TASK_MAP: Final[dict[str, str]] = {
    "lead nuevo":       "New Lead",
    "contactado dia 1": "New Lead",    # followup_count drives the task type
    "contactado dia 2": "New Lead",
    "contactado dia 3": "New Lead",
    "contactado dia 7": "New Lead",
    "conversacion":     "Contacted",
    "no show":          "No Show",
}

OPEN_TASK_STATUSES: Final[list[str]] = [
    "pending",
    "in_progress",
]

# ── Thresholds ─────────────────────────────────────────────────────────────────
MAX_FOLLOWUPS: Final[int] = 4
DORMANT_THRESHOLD_DAYS: Final[int] = 120

# ── Priority scores (DESC sort = highest priority at top of queue) ─────────────
PRIORITY_SCORES: Final[dict[str, int]] = {
    "First Contact":          100,
    "Reschedule Call":        100,
    "Scheduled Callback":      90,
    "Post-Contact Follow-up":  80,
    "Follow-up 1":             70,
    "Follow-up 2":             60,
    "Follow-up 3":             50,
    "Final Attempt":           40,
    "Reactivation":            10,
}

# ── Task subject templates ─────────────────────────────────────────────────────
TASK_SUBJECTS: Final[dict[str, str]] = {
    "First Contact":          "📞 First Contact — {name}",
    "Follow-up 1":            "📞 Follow-up Day 2 — {name}",
    "Follow-up 2":            "📞 Follow-up Day 3 — {name}",
    "Follow-up 3":            "📞 Follow-up Day 7 — {name}",
    "Final Attempt":          "🔴 FINAL Attempt — {name}",
    "Post-Contact Follow-up": "📞 Post-Contact Follow-up — {name}",
    "Reschedule Call":        "🚨 Reschedule Call — {name}",
    "Scheduled Callback":     "📞 Scheduled Callback — {name}",
    "Reactivation":           "♻ Reactivation — {name}",
}

# ── Task outcomes ─────────────────────────────────────────────────────────────
TASK_OUTCOMES = {
    "NO_ANSWER":            "No Answer",
    "CALL_BACK":            "Connected - Call Back",
    "INTERESTED":           "Connected - Interested",
    "BOOKED":               "Connected - Booked",
    "RESCHEDULE":           "Connected - Reschedule",
    "NOT_INTERESTED":       "Connected - Not Interested",
}

# ── GHL custom field API names (set these to match your GHL field keys) ────────
CUSTOM_FIELD_FOLLOWUP_COUNT = "followup_count"
CUSTOM_FIELD_TASK_TYPE      = "task_type"
CUSTOM_FIELD_TASK_OUTCOME   = "task_outcome"
CUSTOM_FIELD_PRIORITY_SCORE = "priority_score"
