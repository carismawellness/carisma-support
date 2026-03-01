# Knowledge Base Backlog

## Purpose
Capture customer inquiries that aren't yet in KB. When inquiry comes up ≥3 times, promote to KB.

## Promotion Workflow

### 1️⃣ Capture Stage
When customer asks something not in KB:
```
Command: python3 tools/kb_backlog_manager.py add "Question?" BRAND
System: Creates BL-001 with status=NEW, frequency=1
```

### 2️⃣ Track Stage
If same question comes up again:
```
Command: python3 tools/kb_backlog_manager.py match "Similar?"
System: Matches to BL-001, increments frequency
```

### 3️⃣ Promotion Stage
When frequency ≥ 3 OR brand owner votes:
```
System: Question refined, tier/section assigned, draft answer created
Status: READY_TO_PROMOTE
```

### 4️⃣ Integration Stage
Brand owner reviews and approves:
```
Command: python3 tools/kb_backlog_manager.py promote BL-001
System: Creates new entry in kb-data.json, removes from backlog
Status: PROMOTED_TO_KB
```

## Commands

```bash
# Add new backlog item
python3 tools/kb_backlog_manager.py add "Question text?" BRAND

# Show backlog status
python3 tools/kb_backlog_manager.py status

# Promote item to KB
python3 tools/kb_backlog_manager.py promote BL-001
```

## Metrics
- **Daily new candidates:** [Auto-tracked]
- **Promotion rate:** [% that make it to KB]
- **Time-to-promotion:** [Average days]

## Monthly Review
During monthly update cycle, promote high-frequency backlog items (frequency ≥ 3).
