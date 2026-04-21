"""
Core task logic — priority scoring, chaining, and creation.

This module is the single source of truth for:
  - What task to create given a pipeline stage + followup count
  - What task to create given a completed task outcome
  - Whether a contact already has an open task
  - New-lead supersede (create_first_contact_task)
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from .client import GHLClient
from .roster import pick_assignee
from .config import (
    ACTIVE_STAGES,
    CUSTOM_FIELD_FIRST_CONTACT_DATE,
    CUSTOM_FIELD_FOLLOWUP_COUNT,
    CUSTOM_FIELD_PRIORITY_SCORE,
    CUSTOM_FIELD_TASK_OUTCOME,
    CUSTOM_FIELD_TASK_TYPE,
    MAX_FOLLOWUPS,
    OPEN_TASK_STATUSES,
    PRIORITY_SCORES,
    STAGE_ID_BOOKING_LOST,
    STAGE_ID_BOOKING_WON,
    STAGE_ID_NURTURING,
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


# ── Follow-up sequence config ─────────────────────────────────────────────────
# Maps followup_count (before incrementing) → (task_type, due_days_out)
_FOLLOWUP_SEQUENCE = [
    (0, "Follow-up 1", 1),
    (1, "Follow-up 2", 2),
    (2, "Follow-up 3", 3),
    (3, "Follow-up 4", 7),
]


def _followup_config(followup_count: int) -> Optional[dict]:
    """
    Return {task_type, priority_score, due_date} for the next follow-up step,
    or None if followup_count >= MAX_FOLLOWUPS (should be treated as Lost).
    """
    for threshold, task_type, days in _FOLLOWUP_SEQUENCE:
        if followup_count == threshold:
            return {
                "task_type":      task_type,
                "priority_score": PRIORITY_SCORES[task_type],
                "due_date":       _days_out(days),
            }
    return None  # followup_count >= MAX_FOLLOWUPS


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
        if followup_count == 0:
            task_type = "First Contact"
            return {
                "task_type":      task_type,
                "priority_score": PRIORITY_SCORES[task_type],
                "due_date":       _today(),
            }
        return _followup_config(followup_count)

    if logical == "Contacted":
        # Contacted stage: use follow-up sequence based on followup_count
        if followup_count == 0:
            task_type = "Follow-up 1"
            return {
                "task_type":      task_type,
                "priority_score": PRIORITY_SCORES[task_type],
                "due_date":       _days_out(1),
            }
        return _followup_config(followup_count)

    if logical == "No Show":
        task_type = "Reschedule Call"
        return {
            "task_type":      task_type,
            "priority_score": PRIORITY_SCORES[task_type],
            "due_date":       _today(),
        }

    if logical == "Nurturing":
        task_type = "Nurturing Re-engagement"
        return {
            "task_type":      task_type,
            "priority_score": PRIORITY_SCORES[task_type],
            "due_date":       _today(),
        }

    return None


# ── Outcome → next task ───────────────────────────────────────────────────────

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
    Given the outcome of a completed task, take the correct action:
      - "Follow Up"    → chain next follow-up task (based on followup_count)
      - "Booking"      → move opp to Booking Won / won
      - "Booking Lost" → move opp to Booking Lost / lost
      - "Lost"         → move opp to Booking Lost / lost (used when followup_count >= 4)
      - "Nurture"      → move opp to Nurturing stage (GHL workflow handles wait)

    Returns the new task ID if a task was created, else None.
    """
    log.info(
        "Outcome='%s' (task_type='%s') for contact=%s (followup_count=%d)",
        outcome, current_task_type, contact_id, followup_count
    )

    # ── Record first_contact_date on the very first call attempt ─────────────
    if current_task_type == "First Contact" and not dry_run:
        today = _today()
        try:
            client.update_contact(contact_id, {
                "customFields": [
                    {"key": CUSTOM_FIELD_FIRST_CONTACT_DATE, "field_value": today},
                ]
            })
            log.info("  Set first_contact_date=%s for contact %s", today, contact_id)
        except Exception as exc:
            log.error("  Failed to set first_contact_date for contact %s: %s", contact_id, exc)

    # ── "Follow Up" ────────────────────────────────────────────────────────────
    if outcome == "Follow Up":
        if followup_count >= MAX_FOLLOWUPS:
            # Treat same as Lost
            log.info(
                "Follow Up with followup_count=%d >= %d — treating as Lost for contact %s",
                followup_count, MAX_FOLLOWUPS, contact_id
            )
            if not dry_run and opp_id:
                try:
                    client.update_opportunity(opp_id, {
                        "pipelineStageId": STAGE_ID_BOOKING_LOST,
                        "status": "lost",
                    })
                except Exception as exc:
                    log.error("Failed to move opp %s to Booking Lost: %s", opp_id, exc)
            return None

        cfg = _followup_config(followup_count)
        if not cfg:
            log.warning("No follow-up config for followup_count=%d", followup_count)
            return None

        new_followup_count = followup_count + 1
        log.info(
            "Follow Up %d → %s (due %s, score %d)",
            followup_count + 1, cfg["task_type"], cfg["due_date"], cfg["priority_score"]
        )

        if not dry_run:
            # Increment followup_count on the contact
            try:
                client.update_contact(contact_id, {
                    "customFields": [
                        {"key": CUSTOM_FIELD_FOLLOWUP_COUNT, "field_value": str(new_followup_count)},
                    ]
                })
            except Exception as exc:
                log.error("Failed to update followup_count for contact %s: %s", contact_id, exc)

        return create_next_task(
            client,
            contact_id=contact_id,
            contact_name=contact_name,
            task_type=cfg["task_type"],
            due_date=cfg["due_date"],
            assignee_id=assignee_id,
            opp_id=opp_id,
            dry_run=dry_run,
        )

    # ── "Booking" ──────────────────────────────────────────────────────────────
    if outcome == "Booking":
        log.info("Booking won for contact %s — moving opp to Booking Won", contact_id)
        if not dry_run and opp_id:
            try:
                client.update_opportunity(opp_id, {
                    "pipelineStageId": STAGE_ID_BOOKING_WON,
                    "status": "won",
                })
            except Exception as exc:
                log.error("Failed to move opp %s to Booking Won: %s", opp_id, exc)
        return None

    # ── "Booking Lost" ─────────────────────────────────────────────────────────
    if outcome == "Booking Lost":
        log.info("Booking lost for contact %s — moving opp to Booking Lost", contact_id)
        if not dry_run and opp_id:
            try:
                client.update_opportunity(opp_id, {
                    "pipelineStageId": STAGE_ID_BOOKING_LOST,
                    "status": "lost",
                })
            except Exception as exc:
                log.error("Failed to move opp %s to Booking Lost: %s", opp_id, exc)
        return None

    # ── "Lost" ─────────────────────────────────────────────────────────────────
    if outcome == "Lost":
        log.info("Lost for contact %s — moving opp to Booking Lost", contact_id)
        if not dry_run and opp_id:
            try:
                client.update_opportunity(opp_id, {
                    "pipelineStageId": STAGE_ID_BOOKING_LOST,
                    "status": "lost",
                })
            except Exception as exc:
                log.error("Failed to move opp %s to Booking Lost: %s", opp_id, exc)
        return None

    # ── "Nurture" ──────────────────────────────────────────────────────────────
    if outcome == "Nurture":
        log.info("Nurture for contact %s — moving opp to Nurturing stage", contact_id)
        if not dry_run and opp_id:
            try:
                client.update_opportunity(opp_id, {
                    "pipelineStageId": STAGE_ID_NURTURING,
                })
            except Exception as exc:
                log.error("Failed to move opp %s to Nurturing: %s", opp_id, exc)
        return None

    # ── Scheduled Callback (legacy / direct) ──────────────────────────────────
    if outcome == "Scheduled Callback":
        due_date = callback_date or _today()
        return create_next_task(
            client,
            contact_id=contact_id,
            contact_name=contact_name,
            task_type="Scheduled Callback",
            due_date=due_date,
            assignee_id=assignee_id,
            opp_id=opp_id,
            dry_run=dry_run,
        )

    log.warning("Unrecognised outcome '%s' for contact %s — ignoring", outcome, contact_id)
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

    # Smart assignment: if no assignee given, pick the least-loaded on-duty SDR
    if not assignee_id and not dry_run:
        try:
            assignee_id = pick_assignee(client)
        except Exception as exc:
            log.warning("Smart assignment failed, leaving unassigned: %s", exc)

    if dry_run:
        log.info("[DRY RUN] Would create: '%s' | score=%d | due=%s | assignee=%s", subject, priority_score, due_date, assignee_id or "unassigned")
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


# ── New Lead Supersede ────────────────────────────────────────────────────────

def create_first_contact_task(
    client: GHLClient,
    contact_id: str,
    contact_name: str,
    assignee_id: Optional[str] = None,
    opp_id: Optional[str] = None,
    dry_run: bool = False,
) -> Optional[str]:
    """
    New Lead Supersede — ensures a new lead always gets immediate priority.

    1. Gets all open tasks for the contact and marks every incomplete task complete.
    2. Resets followup_count to 0 on the contact.
    3. Creates a new "First Contact" task due today with priority_score=100.
    4. Returns the new task ID.
    """
    log.info("create_first_contact_task: superseding tasks for contact %s (%s)", contact_id, contact_name)

    if not dry_run:
        # Step 1: Complete all open tasks
        try:
            tasks = client.get_tasks(contact_id)
            for task in tasks:
                if not task.get("completed", False):
                    task_id = task.get("id")
                    if task_id:
                        try:
                            client.complete_task(contact_id, task_id)
                            log.info("  Completed existing task %s for contact %s", task_id, contact_id)
                        except Exception as exc:
                            log.error("  Failed to complete task %s: %s", task_id, exc)
        except Exception as exc:
            log.error("  Failed to fetch tasks for contact %s: %s", contact_id, exc)

        # Step 2: Reset followup_count to 0
        try:
            client.update_contact(contact_id, {
                "customFields": [
                    {"key": CUSTOM_FIELD_FOLLOWUP_COUNT, "field_value": "0"},
                ]
            })
            log.info("  Reset followup_count=0 for contact %s", contact_id)
        except Exception as exc:
            log.error("  Failed to reset followup_count for contact %s: %s", contact_id, exc)
    else:
        log.info("[DRY RUN] Would complete all open tasks and reset followup_count for contact %s", contact_id)

    # Step 3: Create First Contact task due today
    return create_next_task(
        client,
        contact_id=contact_id,
        contact_name=contact_name,
        task_type="First Contact",
        due_date=_today(),
        assignee_id=assignee_id,
        opp_id=opp_id,
        dry_run=dry_run,
    )
