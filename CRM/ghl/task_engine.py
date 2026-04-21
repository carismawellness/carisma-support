"""
Core task logic — priority scoring, chaining, and creation.

This module is the single source of truth for:
  - What task to create given a pipeline stage + followup count
  - What task to create given a completed task outcome
  - Whether a contact already has an open task
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from .client import GHLClient
from .config import (
    ACTIVE_STAGES,
    CUSTOM_FIELD_FOLLOWUP_COUNT,
    CUSTOM_FIELD_PRIORITY_SCORE,
    CUSTOM_FIELD_TASK_OUTCOME,
    CUSTOM_FIELD_TASK_TYPE,
    MAX_FOLLOWUPS,
    OPEN_TASK_STATUSES,
    PRIORITY_SCORES,
    STAGE_TASK_MAP,
    TASK_SUBJECTS,
    TERMINAL_STAGES,
)

log = logging.getLogger(__name__)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _days_out(n: int) -> str:
    return (datetime.now(timezone.utc) + timedelta(days=n)).strftime("%Y-%m-%d")


def _subject(task_type: str, contact_name: str) -> str:
    template = TASK_SUBJECTS.get(task_type, "Task — {name}")
    return template.format(name=contact_name)


# ── Stage → task config ───────────────────────────────────────────────────────

def get_task_config(stage: str, followup_count: int) -> Optional[dict]:
    """
    Return {task_type, priority_score, due_date} for a given stage + followup count,
    or None if the stage does not need a task (terminal or unrecognised).
    """
    if stage in TERMINAL_STAGES or stage not in ACTIVE_STAGES:
        return None

    logical = STAGE_TASK_MAP.get(stage)

    if logical == "New Lead":
        fn = min(followup_count, MAX_FOLLOWUPS)
        rules = [
            (0, "First Contact",  _today()),
            (1, "Follow-up 1",    _days_out(1)),
            (2, "Follow-up 2",    _days_out(1)),
            (3, "Follow-up 3",    _days_out(4)),
            (4, "Final Attempt",  _today()),
        ]
        for threshold, task_type, due in rules:
            if fn <= threshold:
                return {"task_type": task_type, "priority_score": PRIORITY_SCORES[task_type], "due_date": due}
        task_type = "Final Attempt"
        return {"task_type": task_type, "priority_score": PRIORITY_SCORES[task_type], "due_date": _today()}

    if logical == "Contacted":
        task_type = "Post-Contact Follow-up"
        return {"task_type": task_type, "priority_score": PRIORITY_SCORES[task_type], "due_date": _days_out(1)}

    if logical == "No Show":
        task_type = "Reschedule Call"
        return {"task_type": task_type, "priority_score": PRIORITY_SCORES[task_type], "due_date": _today()}

    return None


# ── Outcome → next task ───────────────────────────────────────────────────────

# Maps (outcome, current_task_type) → next_task_type.
# Use "*" as a wildcard for current_task_type.
_OUTCOME_CHAIN: dict[tuple[str, str], Optional[str]] = {
    ("No Answer", "First Contact"):          "Follow-up 1",
    ("No Answer", "Follow-up 1"):            "Follow-up 2",
    ("No Answer", "Follow-up 2"):            "Follow-up 3",
    ("No Answer", "Follow-up 3"):            "Final Attempt",
    ("No Answer", "Final Attempt"):          None,          # mark lost
    ("Connected - Call Back",     "*"):      "Scheduled Callback",
    ("Connected - Interested",    "*"):      "Post-Contact Follow-up",
    ("Connected - Reschedule",    "*"):      "Reschedule Call",
    ("Connected - Booked",        "*"):      None,          # won
    ("Connected - Not Interested","*"):      None,          # lost
}


def get_next_task_type(outcome: str, current_task_type: str) -> Optional[str]:
    """Return the next task type for a given outcome+current_task_type, or None."""
    key = (outcome, current_task_type)
    if key in _OUTCOME_CHAIN:
        return _OUTCOME_CHAIN[key]
    wildcard = (outcome, "*")
    if wildcard in _OUTCOME_CHAIN:
        return _OUTCOME_CHAIN[wildcard]
    return None


# ── Open task check ───────────────────────────────────────────────────────────

def has_open_task(client: GHLClient, contact_id: str) -> bool:
    """Return True if the contact has any task that is not completed."""
    try:
        tasks = client.get_tasks(contact_id)
        for task in tasks:
            if not task.get("completed", False):
                return True
        return False
    except Exception as exc:
        log.error("Error checking open tasks for contact %s: %s", contact_id, exc)
        return False


# ── Task creation ─────────────────────────────────────────────────────────────

def create_next_task(
    client: GHLClient,
    contact_id: str,
    contact_name: str,
    task_type: str,
    due_date: str,
    assignee_id: Optional[str] = None,
    opp_id: Optional[str] = None,
    dry_run: bool = False,
) -> Optional[str]:
    """
    Create a task on the GHL contact. Returns the new task ID, or None on failure.
    """
    subject = _subject(task_type, contact_name)
    priority_score = PRIORITY_SCORES.get(task_type, 50)

    if dry_run:
        log.info("[DRY RUN] Would create: '%s' | score=%d | due=%s", subject, priority_score, due_date)
        return "dry-run"

    payload: dict = {
        "title": subject,
        "dueDate": f"{due_date}T09:00:00+00:00",
        "completed": False,
    }
    if assignee_id:
        payload["assignedTo"] = assignee_id

    try:
        resp = client.create_task(contact_id, payload)
        task_id = resp.get("task", {}).get("id") or resp.get("id")
        if task_id:
            log.info("Created task '%s' (id=%s) for contact %s", subject, task_id, contact_id)
            # Store priority_score and task_type as custom fields on the contact
            client.update_contact(contact_id, {
                "customFields": [
                    {"key": CUSTOM_FIELD_TASK_TYPE,      "field_value": task_type},
                    {"key": CUSTOM_FIELD_PRIORITY_SCORE, "field_value": str(priority_score)},
                ]
            })
            return task_id
        log.error("Task creation returned unexpected payload: %s", resp)
        return None
    except Exception as exc:
        log.error("Failed to create task for contact %s: %s", contact_id, exc)
        return None


# ── Outcome handler (called by webhook) ──────────────────────────────────────

def handle_task_outcome(
    client: GHLClient,
    outcome: str,
    current_task_type: str,
    contact_id: str,
    contact_name: str,
    followup_count: int,
    assignee_id: Optional[str] = None,
    opp_id: Optional[str] = None,
    callback_date: Optional[str] = None,
    dry_run: bool = False,
) -> Optional[str]:
    """
    Given the outcome of a completed task, create the correct next task.
    Returns the new task ID, or None if no task should be created.
    """
    next_type = get_next_task_type(outcome, current_task_type)
    log.info(
        "Outcome='%s' on '%s' → next task: %s",
        outcome, current_task_type, next_type or "(none)"
    )

    if next_type is None:
        if outcome in ("Connected - Not Interested", "No Answer") and current_task_type == "Final Attempt":
            log.info("Final Attempt exhausted for contact %s — mark as lost", contact_id)
        return None

    # Use callback_date for Scheduled Callback if provided
    due_date = callback_date if (next_type == "Scheduled Callback" and callback_date) else _today()
    if next_type == "Post-Contact Follow-up":
        due_date = _days_out(1)

    return create_next_task(
        client, contact_id, contact_name, next_type, due_date,
        assignee_id=assignee_id, opp_id=opp_id, dry_run=dry_run,
    )
