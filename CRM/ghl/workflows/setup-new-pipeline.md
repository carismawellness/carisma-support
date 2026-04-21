# Workflow: Set Up a New GHL Pipeline

**When to use:** When onboarding a new brand or creating a new sales pipeline in GHL.

---

## Inputs Required

- Brand name (Spa / Aesthetics / Slimming)
- Pipeline stage names (ordered list)
- Custom fields needed on contacts

---

## Steps

### 1. Get location ID

```python
ToolSearch → mcp__ghl__search_locations
mcp__ghl__search_locations(query="Carisma <Brand>")
# Note the locationId from the response
```

### 2. List existing pipelines

```python
ToolSearch → mcp__ghl__get_pipelines
mcp__ghl__get_pipelines(locationId="<LOCATION_ID>")
# Check if a pipeline already exists to avoid duplicates
```

### 3. Create custom fields (if needed)

For each custom field required:
```python
ToolSearch → mcp__ghl__create_location_custom_field
mcp__ghl__create_location_custom_field(
  locationId="<LOCATION_ID>",
  name="Followup Count",
  fieldKey="followup_count",
  dataType="NUMBER"
)
```

Supported `dataType` values: `TEXT`, `NUMBER`, `DROPDOWN`, `DATE`, `CHECKBOX`, `MONETARY`, `FILE_UPLOAD`

### 4. Create opportunity pipeline (via GHL UI)

Pipelines cannot be created via API — use the GHL web UI:
1. Go to **CRM → Pipelines → Add Pipeline**
2. Name the pipeline (e.g., "Aesthetics Setter Pipeline")
3. Add stages in order — names must match exactly what's in `config.py`
4. Save

### 5. Get pipeline and stage IDs

After creating in UI, pull IDs for use in code:
```python
mcp__ghl__get_pipelines(locationId="<LOCATION_ID>")
# Response: { pipelines: [{ id, name, stages: [{ id, name }] }] }
```

### 6. Update config.py

Add the pipeline ID and stage IDs to `CRM/ghl/config.py`:
```python
PIPELINE_ID = "abc123..."
STAGE_IDS = {
    "lead nuevo": "stage-id-1",
    "contactado dia 1": "stage-id-2",
    ...
}
```

### 7. Test with a dry run

```bash
python -m ghl.daily_orchestrator --dry-run
```

Review output — should show contacts and tasks without making changes.

---

## Notes

- Pipeline stage names are case-sensitive. Match exactly.
- Custom field `fieldKey` must be snake_case, no spaces.
- GHL enforces unique field keys per location.
