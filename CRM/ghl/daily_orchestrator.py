"""
Daily CRM Orchestrator — Go High Level
=======================================
Runs every morning at 8am as a safety net to ensure every active
contact has an open task. Also force-closes stale leads and triggers
the reactivation sweep for dormant contacts.

Usage:
  python -m ghl.daily_orchestrator
  python -m ghl.daily_orchestrator --dry-run
  python -m ghl.daily_orchestrator --skip-reactivation
"""

import argparse
import logging
import os
import sys
from datetime import datetime, timedelta, timezone
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger(__name__)

from .client import GHLClient
from .config import (
    ACTIVE_STAGES,
    CUSTOM_FIELD_FOLLOWUP_COUNT,
    DORMANT_THRESHOLD_DAYS,
    MAX_FOLLOWUPS,
    TERMINAL_STAGES,
)
from .task_engine import (
    create_next_task,
    get_task_config,
    has_open_task,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_followup_count(opp: dict) -> int:
    """Extract followup_count from custom fields, defaulting to 0."""
    custom = opp.get("customFields") or opp.get("custom_fields") or []
    if isinstance(custom, list):
        for field in custom:
            if field.get("key") == CUSTOM_FIELD_FOLLOWUP_COUNT or \
               field.get("fieldKey") == CUSTOM_FIELD_FOLLOWUP_COUNT:
                try:
                    return int(field.get("value") or field.get("fieldValue") or 0)
                except (TypeError, ValueError):
                    return 0
    if isinstance(custom, dict):
        try:
            return int(custom.get(CUSTOM_FIELD_FOLLOWUP_COUNT) or 0)
        except (TypeError, ValueError):
            return 0
    return 0


def _days_since_str(dt_str: Optional[str]) -> Optional[int]:
    if not dt_str:
        return None
    for fmt in ("%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S+00:00", "%Y-%m-%d"):
        try:
            dt = datetime.strptime(dt_str[:26].rstrip("Z"), fmt.rstrip("Z"))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return max(0, (datetime.now(timezone.utc) - dt).days)
        except ValueError:
            continue
    return None


# ── Step 1: Force-close stale New Leads ──────────────────────────────────────

def force_close_stale_leads(client: GHLClient, pipeline_stage_map: dict, dry_run: bool) -> int:
    """
    Move contacts that are in 'New Lead' with followup_count >= MAX_FOLLOWUPS
    to 'Consultation Lost'.
    """
    log.info("Checking for stale New Leads (followup_count >= %d)...", MAX_FOLLOWUPS)
    closed = 0

    # Find the "new lead" stage — handles both English and Spanish names
    new_lead_stage_id = next(
        (v for k, v in pipeline_stage_map.items() if "lead" in k.lower() and "nuevo" in k.lower() or k.lower() == "new lead"),
        None
    )
    # Find any lost/closed terminal stage
    lost_stage_id = next(
        (v for k, v in pipeline_stage_map.items() if "lost" in k.lower() or "perdid" in k.lower()),
        None
    )
    pipeline_id = pipeline_stage_map.get("_pipeline_id")

    if not new_lead_stage_id:
        log.warning("Stage 'New Lead' / 'lead nuevo' not found in pipeline map — skipping force-close step.")
        return 0

    # Page through all opportunities in New Lead stage
    last_id: Optional[str] = None
    while True:
        resp = client.search_opportunities(
            pipeline_id=pipeline_id,
            stage_id=new_lead_stage_id,
            limit=100,
            start_after=last_id,
        )
        opps = resp.get("opportunities", [])
        if not opps:
            break

        for opp in opps:
            fn = _get_followup_count(opp)
            if fn < MAX_FOLLOWUPS:
                continue
            opp_id   = opp.get("id", "")
            opp_name = opp.get("name") or opp.get("contactName") or opp_id
            log.info("  Force-closing stale lead: %s (followup_count=%d)", opp_name, fn)
            if not dry_run and lost_stage_id:
                try:
                    client.update_opportunity(opp_id, {
                        "pipelineStageId": lost_stage_id,
                        "status": "lost",
                    })
                    closed += 1
                except Exception as exc:
                    log.error("    Failed to close %s: %s", opp_id, exc)
            else:
                closed += 1

        if len(opps) < 100:
            break
        last_id = opps[-1].get("id")
        if not last_id:
            break

    return closed


# ── Step 2: Fill missing tasks ────────────────────────────────────────────────

def fill_missing_tasks(
    client: GHLClient,
    pipeline_stage_map: dict,
    dry_run: bool,
) -> tuple[int, int, int]:
    """
    Find active opportunities with no open tasks and create the correct next task.
    Returns (created, skipped, errors).
    """
    log.info("Finding active opportunities with no open tasks...")
    created = skipped = errors = 0
    pipeline_id = pipeline_stage_map.get("_pipeline_id")

    for stage_name in ACTIVE_STAGES:
        stage_id = pipeline_stage_map.get(stage_name)
        if not stage_id:
            log.warning("Stage '%s' not found in pipeline map — skipping.", stage_name)
            continue

        last_id: Optional[str] = None
        while True:
            resp = client.search_opportunities(
                pipeline_id=pipeline_id,
                stage_id=stage_id,
                limit=100,
                start_after=last_id,
            )
            opps = resp.get("opportunities", [])
            if not opps:
                break

            for opp in opps:
                opp_id     = opp.get("id", "")
                contact_id = opp.get("contactId") or opp.get("contact", {}).get("id", "")
                opp_name   = opp.get("name") or opp.get("contactName") or opp_id
                assignee_id = opp.get("assignedTo") or opp.get("ownerId") or ""
                fn = _get_followup_count(opp)

                if fn >= MAX_FOLLOWUPS and "lead" in stage_name.lower():
                    skipped += 1
                    continue

                if has_open_task(client, contact_id):
                    skipped += 1
                    continue

                config = get_task_config(stage_name, fn)
                if not config:
                    skipped += 1
                    continue

                task_id = create_next_task(
                    client,
                    contact_id=contact_id,
                    contact_name=opp_name,
                    task_type=config["task_type"],
                    due_date=config["due_date"],
                    assignee_id=assignee_id,
                    opp_id=opp_id,
                    dry_run=dry_run,
                )
                if task_id:
                    created += 1
                    log.info("  ✓ %s [%s] → %s", opp_name, stage_name, config["task_type"])
                else:
                    errors += 1

            meta = resp.get("meta", {})
            if not meta.get("nextPageUrl") and not meta.get("startAfterRowNumber"):
                break
            last_id = opps[-1].get("id") if opps else None
            if not last_id:
                break

    return created, skipped, errors


# ── Step 3: Reactivation sweep ────────────────────────────────────────────────

def run_reactivation(client: GHLClient, dry_run: bool) -> tuple[int, int, int]:
    """
    Find contacts with no activity for 120+ days who are not in a terminal stage
    and have no open tasks. Creates a Reactivation task for each.
    Returns (found, created, skipped).
    """
    log.info("Searching for dormant contacts (no activity > %d days)...", DORMANT_THRESHOLD_DAYS)
    cutoff_date = (datetime.now(timezone.utc) - timedelta(days=DORMANT_THRESHOLD_DAYS)).strftime("%Y-%m-%d")

    found = created = skipped = 0
    last_id: Optional[str] = None

    while True:
        resp = client.search_contacts(limit=100, start_after_id=last_id)
        contacts = resp.get("contacts", [])
        if not contacts:
            break

        for contact in contacts:
            contact_id   = contact.get("id", "")
            contact_name = (contact.get("firstName", "") + " " + contact.get("lastName", "")).strip() or contact_id

            last_activity = contact.get("lastActivity") or contact.get("dateUpdated") or contact.get("dateAdded")
            days_inactive = _days_since_str(last_activity)

            if days_inactive is None or days_inactive < DORMANT_THRESHOLD_DAYS:
                continue

            tags = contact.get("tags") or []
            if any(t.lower() in ("won", "lost", "booking confirmed", "consultation lost") for t in tags):
                continue

            found += 1

            if has_open_task(client, contact_id):
                skipped += 1
                continue

            from .task_engine import create_next_task
            task_id = create_next_task(
                client,
                contact_id=contact_id,
                contact_name=contact_name,
                task_type="Reactivation",
                due_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                dry_run=dry_run,
            )
            if task_id:
                created += 1
                log.info("  ♻ Reactivation task created for: %s (%d days inactive)", contact_name, days_inactive)

        if len(contacts) < 100:
            break
        last_id = contacts[-1].get("id")
        if not last_id:
            break

    return found, created, skipped


# ── Pipeline stage map ────────────────────────────────────────────────────────

def build_pipeline_stage_map(client: GHLClient, pipeline_name: str = "Sales") -> dict:
    """
    Fetch all pipelines and return a {stage_name: stage_id, '_pipeline_id': pipeline_id} map
    for the given pipeline name.
    """
    pipelines = client.get_pipelines()
    for pipeline in pipelines:
        name = pipeline.get("name", "")
        if pipeline_name.lower() in name.lower():
            stage_map = {"_pipeline_id": pipeline["id"]}
            for stage in pipeline.get("stages", []):
                stage_map[stage["name"]] = stage["id"]
            log.info("Using pipeline '%s' with %d stages.", name, len(stage_map) - 1)
            return stage_map

    # Fallback: use the first pipeline found
    if pipelines:
        pipeline = pipelines[0]
        stage_map = {"_pipeline_id": pipeline["id"]}
        for stage in pipeline.get("stages", []):
            stage_map[stage["name"]] = stage["id"]
        log.warning("Pipeline '%s' not found — using '%s' instead.", pipeline_name, pipeline.get("name"))
        return stage_map

    log.error("No pipelines found for location %s.", client.location_id)
    return {}


# ── Main ──────────────────────────────────────────────────────────────────────

def run(dry_run: bool = False, skip_reactivation: bool = False) -> None:
    print("=" * 60)
    print("  Carisma Aesthetics — GHL Daily CRM Orchestrator")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M')}  |  dry_run={dry_run}")
    print("=" * 60)

    client = GHLClient()
    pipeline_stage_map = build_pipeline_stage_map(client, pipeline_name="setter")

    if not pipeline_stage_map:
        log.error("Cannot proceed without pipeline stage map.")
        sys.exit(1)

    # Step 1
    print("\n[1/3] Force-closing stale New Leads (followup_count >= 4)...")
    force_closed = force_close_stale_leads(client, pipeline_stage_map, dry_run)
    print(f"  → {force_closed} stale leads force-closed")

    # Step 2
    print("\n[2/3] Filling gaps — active opps with no open tasks...")
    created, skipped, errors = fill_missing_tasks(client, pipeline_stage_map, dry_run)
    print(f"  → {created} tasks created | {skipped} skipped | {errors} errors")

    # Step 3
    if not skip_reactivation:
        print(f"\n[3/3] Reactivation sweep (dormant > {DORMANT_THRESHOLD_DAYS} days)...")
        found, react_created, react_skipped = run_reactivation(client, dry_run)
        print(f"  → {found} dormant contacts found | {react_created} tasks created | {react_skipped} skipped")
    else:
        print("\n[3/3] Skipping reactivation (--skip-reactivation flag)")
        react_created = react_skipped = 0

    # Summary
    print("\n" + "=" * 60)
    print("  DAILY SUMMARY")
    print("=" * 60)
    print(f"  Force-closed (stale):    {force_closed}")
    print(f"  Tasks created:           {created + react_created}")
    print(f"  Tasks skipped:           {skipped + react_skipped}")
    print(f"  Errors:                  {errors}")
    print("=" * 60)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Carisma Aesthetics GHL daily CRM orchestrator")
    parser.add_argument("--dry-run", action="store_true", help="Preview without making changes")
    parser.add_argument("--skip-reactivation", action="store_true", help="Skip reactivation sweep")
    args = parser.parse_args()
    run(dry_run=args.dry_run, skip_reactivation=args.skip_reactivation)
