"""
GHL Webhook Handler — FastAPI endpoint for task-completed events.

GHL fires a webhook when a task is marked complete. This handler:
  1. Parses the contact ID, task type, and outcome from the payload
  2. Calls handle_task_outcome() to chain the next task

To configure in GHL:
  Settings → Integrations → Webhooks → Add Webhook
  URL: https://<your-domain>/webhook/task-completed
  Events: Task Completed (or use "Custom" trigger via Workflow)

Run with:
  uvicorn ghl.webhook_handler:app --host 0.0.0.0 --port 8000

Environment variables:
  GHL_WEBHOOK_SECRET  — optional HMAC secret for signature verification
"""

import hashlib
import hmac
import logging
import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException, Request
from pydantic import BaseModel

load_dotenv()

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

GHL_WEBHOOK_SECRET = os.getenv("GHL_WEBHOOK_SECRET", "")

app = FastAPI(title="Carisma GHL Task Webhook", version="1.0.0")


# ── Payload schema ─────────────────────────────────────────────────────────────

class TaskCompletedPayload(BaseModel):
    """
    Expected fields from GHL webhook. GHL payload structure varies by trigger type.
    These are the fields we extract — all others are ignored.
    """
    contactId: Optional[str] = None
    contact_id: Optional[str] = None           # alternate key
    opportunityId: Optional[str] = None
    taskId: Optional[str] = None
    task_id: Optional[str] = None
    taskTitle: Optional[str] = None            # task subject — used to infer task_type
    taskOutcome: Optional[str] = None          # custom field value
    task_outcome: Optional[str] = None
    taskType: Optional[str] = None             # custom field value
    task_type: Optional[str] = None
    callbackDate: Optional[str] = None         # for Scheduled Callback tasks
    assignedTo: Optional[str] = None
    contactName: Optional[str] = None
    followupCount: Optional[int] = None

    class Config:
        extra = "allow"                         # ignore unknown fields


# ── Signature verification ─────────────────────────────────────────────────────

def _verify_signature(raw_body: bytes, signature_header: Optional[str]) -> None:
    if not GHL_WEBHOOK_SECRET:
        return  # Verification disabled
    if not signature_header:
        raise HTTPException(status_code=401, detail="Missing X-GHL-Signature header")
    expected = hmac.new(GHL_WEBHOOK_SECRET.encode(), raw_body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, signature_header):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")


# ── Task-type inference from subject ──────────────────────────────────────────

_SUBJECT_TO_TYPE = {
    "first contact":          "First Contact",
    "follow-up day 2":        "Follow-up 1",
    "follow-up day 3":        "Follow-up 2",
    "follow-up day 7":        "Follow-up 3",
    "final attempt":          "Final Attempt",
    "post-contact follow-up": "Post-Contact Follow-up",
    "reschedule call":        "Reschedule Call",
    "scheduled callback":     "Scheduled Callback",
    "reactivation":           "Reactivation",
}


def _infer_task_type(title: Optional[str]) -> Optional[str]:
    if not title:
        return None
    lower = title.lower()
    for keyword, task_type in _SUBJECT_TO_TYPE.items():
        if keyword in lower:
            return task_type
    return None


# ── Webhook endpoint ───────────────────────────────────────────────────────────

@app.post("/webhook/task-completed")
async def task_completed(
    request: Request,
    x_ghl_signature: Optional[str] = Header(default=None, alias="X-GHL-Signature"),
):
    raw_body = await request.body()
    _verify_signature(raw_body, x_ghl_signature)

    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    payload = TaskCompletedPayload(**data)

    contact_id  = payload.contactId or payload.contact_id
    opp_id      = payload.opportunityId
    task_id     = payload.taskId or payload.task_id
    assignee_id = payload.assignedTo
    contact_name = payload.contactName or "Unknown"
    followup_count = payload.followupCount or 0

    # Resolve task type
    task_type = (
        payload.taskType
        or payload.task_type
        or _infer_task_type(payload.taskTitle)
    )

    # Resolve outcome
    outcome = payload.taskOutcome or payload.task_outcome

    if not contact_id:
        log.warning("Webhook received with no contactId — ignoring. Payload: %s", data)
        return {"status": "ignored", "reason": "no contactId"}

    if not outcome:
        log.warning("Webhook for contact %s has no outcome — ignoring.", contact_id)
        return {"status": "ignored", "reason": "no outcome"}

    if not task_type:
        log.warning("Could not determine task_type for contact %s task %s", contact_id, task_id)
        return {"status": "ignored", "reason": "unknown task_type"}

    log.info(
        "Webhook: contact=%s | task=%s | type=%s | outcome=%s",
        contact_id, task_id, task_type, outcome
    )

    from .client import GHLClient
    from .task_engine import handle_task_outcome

    client = GHLClient()
    new_task_id = handle_task_outcome(
        client=client,
        outcome=outcome,
        current_task_type=task_type,
        contact_id=contact_id,
        contact_name=contact_name,
        followup_count=followup_count,
        assignee_id=assignee_id,
        opp_id=opp_id,
        callback_date=payload.callbackDate,
    )

    return {
        "status": "ok",
        "contact_id": contact_id,
        "outcome": outcome,
        "next_task_id": new_task_id,
    }


@app.get("/health")
def health():
    return {"status": "ok"}
