"""
Setter roster and smart task assignment.

Logic:
  1. Look up today's day + current Malta time
  2. Filter to SDRs whose shift covers right now
  3. Count each on-duty SDR's open tasks in GHL
  4. Assign to the one with fewest open tasks (lowest load)
  5. Fallback: round-robin all SDRs if nobody is on duty

Timezone: Europe/Malta (UTC+1 winter / UTC+2 summer)
"""

from __future__ import annotations

import logging
from datetime import datetime, time
from typing import Optional
from zoneinfo import ZoneInfo

log = logging.getLogger(__name__)

MALTA_TZ = ZoneInfo("Europe/Malta")

# ── GHL user ID map ────────────────────────────────────────────────────────────
# Scraped from GHL My Staff page (Carisma Spa location)
GHL_USER_IDS: dict[str, str] = {
    "Nicci":    "t2uLjii6p3ycaszt4fzU",
    "Juliana":  "3tDq7tR9jecTuf6epR6G",
    "Dorianne": "hYfDew2aWx5o1Uh8ATnt",
    # Angela — add her GHL user ID once she's invited
    "Anni":     "3lpQILgSVF91TbTwiBlI",
    "Natalia":  "Ypo1TeQBm197dIrt8Ht0",
    "Rana":     "mMQC91w9FA9W4YzUrgg3",
    "Abid":     "pjVAD6VyXkUpa4uaLxKU",
    "Adeel":    "rsPBpCjBiIgmVhwXVRQL",
    "Mannan":   "EaXikMwHgfFTDN6lIKTd",
}

# ── Weekly schedule ────────────────────────────────────────────────────────────
# Sourced from CRM Master Google Sheet — Roster tab.
# Each entry: (start_time, end_time) in Malta local time, or None = OFF.
# Days: Mon Tue Wed Thu Fri Sat Sun

_T = time  # alias

SDR_SCHEDULE: dict[str, dict] = {
    "Nicci": {
        "role": "SDR",
        "schedule": {
            "Mon": (_T(8, 0),  _T(17, 0)),
            "Tue": (_T(8, 0),  _T(17, 0)),
            "Wed": (_T(8, 0),  _T(17, 0)),
            "Thu": None,
            "Fri": None,
            "Sat": (_T(8, 0),  _T(17, 0)),
            "Sun": (_T(8, 0),  _T(17, 0)),
        },
    },
    "Juliana": {
        "role": "SDR",
        "schedule": {
            "Mon": (_T(12, 0), _T(21, 0)),
            "Tue": (_T(12, 0), _T(21, 0)),
            "Wed": None,
            "Thu": (_T(12, 0), _T(21, 0)),
            "Fri": (_T(12, 0), _T(21, 0)),
            "Sat": (_T(12, 0), _T(21, 0)),
            "Sun": (_T(12, 0), _T(21, 0)),
        },
    },
    "Dorianne": {
        "role": "SDR",
        "schedule": {
            "Mon": None,
            "Tue": (_T(8, 0),  _T(12, 0)),
            "Wed": (_T(8, 0),  _T(12, 0)),
            "Thu": (_T(8, 0),  _T(12, 0)),
            "Fri": (_T(8, 0),  _T(12, 0)),
            "Sat": (_T(8, 0),  _T(12, 0)),
            "Sun": None,
        },
    },
    # Angela — add schedule once she has a GHL account
    "Anni": {
        "role": "SDR",
        "schedule": {
            "Mon": (_T(8, 0),  _T(17, 0)),
            "Tue": (_T(8, 0),  _T(17, 0)),
            "Wed": (_T(8, 0),  _T(17, 0)),
            "Thu": (_T(8, 0),  _T(17, 0)),
            "Fri": (_T(8, 0),  _T(17, 0)),
            "Sat": None,
            "Sun": None,
        },
    },
    "Natalia": {
        "role": "SDR",
        "schedule": {
            "Mon": (_T(12, 0), _T(21, 0)),
            "Tue": None,
            "Wed": (_T(12, 0), _T(21, 0)),
            "Thu": (_T(12, 0), _T(21, 0)),
            "Fri": (_T(12, 0), _T(21, 0)),
            "Sat": (_T(12, 0), _T(21, 0)),
            "Sun": (_T(12, 0), _T(21, 0)),
        },
    },
}

# SDR names (the roles that handle outbound call tasks)
SDR_NAMES: list[str] = list(SDR_SCHEDULE.keys())


# ── On-duty check ──────────────────────────────────────────────────────────────

def get_on_duty_sdrs(now: Optional[datetime] = None) -> list[str]:
    """
    Return GHL user IDs of SDRs currently on shift in Malta time.
    """
    if now is None:
        now = datetime.now(MALTA_TZ)

    day = now.strftime("%a")          # "Mon", "Tue", …
    current = now.time().replace(second=0, microsecond=0)

    on_duty = []
    for name, info in SDR_SCHEDULE.items():
        shift = info["schedule"].get(day)
        if not shift:
            continue
        start, end = shift
        if start <= current < end:
            uid = GHL_USER_IDS.get(name)
            if uid:
                on_duty.append(uid)
                log.debug("  On duty: %s (%s–%s)", name, start, end)

    return on_duty


# ── Smart assignment ───────────────────────────────────────────────────────────

def pick_assignee(client, now: Optional[datetime] = None) -> str:
    """
    Pick the on-duty SDR with the fewest open tasks.

    Falls back to all SDRs (round-robin by lowest task count) if nobody
    is currently on shift.

    Returns a GHL user ID string.
    """
    if now is None:
        now = datetime.now(MALTA_TZ)

    candidates = get_on_duty_sdrs(now)

    if not candidates:
        log.warning("No SDRs on duty at %s — falling back to all SDRs.", now.strftime("%a %H:%M"))
        candidates = [uid for name, uid in GHL_USER_IDS.items() if name in SDR_NAMES]

    # Count open tasks per candidate
    task_counts: dict[str, int] = {}
    for uid in candidates:
        try:
            count = client.count_open_tasks_for_user(uid)
            task_counts[uid] = count
        except Exception as exc:
            log.warning("Could not count tasks for user %s: %s — assuming 0", uid, exc)
            task_counts[uid] = 0

    chosen = min(task_counts, key=lambda uid: task_counts[uid])

    # Resolve name for logging
    name = next((n for n, i in GHL_USER_IDS.items() if i == chosen), chosen)
    log.info(
        "Assignee selected: %s (open tasks: %d) from %d candidates",
        name, task_counts[chosen], len(candidates),
    )
    return chosen
