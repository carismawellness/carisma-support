# Carisma CRM Knowledge Base Integration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to execute this plan task-by-task.

**Goal:** Convert existing PDF knowledge base into a queryable, maintainable system integrated with /crmrespond skill that automatically pulls relevant company information when responding to customer questions.

**Architecture:** Three-tier knowledge architecture (JSON for AI querying → Markdown for agent reference → SQL for backend storage) with automatic keyword-based matching, monthly update cycles, and comprehensive validation scoring.

**Tech Stack:** JSON (queryable), Markdown (agent-friendly), Python (ingestion/validation), Git (version tracking)

---

## PHASE 1: Knowledge Base Cleanup & JSON Conversion (Week 1)

### Task 1: Audit and Status-Mark All Q&A Entries

**Files:**
- Create: `CRM/knowledge-base/KB-AUDIT-LOG.md`
- Reference: Knowledge base PDF (17 sections, 100+ Q&As, Tier 1-4 structure)

**Step 1: Create audit log structure**

Create `CRM/knowledge-base/KB-AUDIT-LOG.md` with table tracking each Q&A's status (COMPLETE, INCOMPLETE, NOT_APPLICABLE, DUPLICATE).

**Step 2: Extract all Q&As from PDF into audit table**

Populate the audit log with all 100+ entries from your knowledge base PDF, capturing QID, section, question, status, and owner.

Expected output: Complete audit log with all entries and their status.

**Step 3: Mark all "TO CHECK IN WEBSITE" entries**

For each incomplete entry, visit the brand website and update the answer. Mark as COMPLETE.

Expected result: 0 entries with "TO CHECK IN WEBSITE" status.

**Step 4: Resolve all "Not Applicable" entries**

For each "Not Applicable" entry, either move to correct section, reword question, or mark for deletion.

Expected result: 0 entries with "Not Applicable" status.

**Step 5: Identify and merge duplicates**

Find exact duplicate entries and merge into single canonical entries.

Expected result: Deduplicated knowledge base.

**Step 6: Commit audit log**

```bash
git add CRM/knowledge-base/KB-AUDIT-LOG.md
git commit -m "docs: initial knowledge base audit with status tracking"
```

---

### Task 2: Create Queryable JSON Schema and Master KB

**Files:**
- Create: `CRM/knowledge-base/schema.json`
- Create: `CRM/knowledge-base/kb-data.json`

**Step 1: Create JSON schema**

Create `CRM/knowledge-base/schema.json` defining the structure for entries:
- qid, section, tier, brands, question, answer, keywords, status, owner, verified_date, confidence_level
- Tier: 1-4 priority levels
- Brands: SPA, AES, SLIM, or ALL
- Confidence: 0-100 score for current accuracy

**Step 2: Convert audit entries to JSON**

Populate `CRM/knowledge-base/kb-data.json` with all verified entries from the audit log, converting to JSON format with proper metadata.

Expected: 80+ entries in queryable JSON format.

**Step 3: Validate JSON structure**

Run validation to ensure all entries conform to schema.

```bash
python3 -c "import json; f=open('CRM/knowledge-base/kb-data.json'); d=json.load(f); print(f'✅ Valid: {len(d[\"entries\"])} entries')"
```

**Step 4: Commit JSON files**

```bash
git add CRM/knowledge-base/schema.json CRM/knowledge-base/kb-data.json
git commit -m "feat: convert knowledge base to queryable JSON with schema"
```

---

### Task 3: Create Brand-Specific KB Splits

**Files:**
- Create: `CRM/CRM-SPA/knowledge/kb-spa.json`
- Create: `CRM/CRM-AES/knowledge/kb-aes.json`
- Create: `CRM/CRM-SLIM/knowledge/kb-slim.json`
- Create: `tools/kb_split_by_brand.py`

**Step 1: Create brand split script**

Create `tools/kb_split_by_brand.py` that:
- Loads master KB
- Filters entries for each brand (matching "brands" field)
- Creates brand-specific JSON files

**Step 2: Run brand split**

```bash
python3 tools/kb_split_by_brand.py
```

Expected output: Three brand KB files created with correct entry counts for each brand.

**Step 3: Verify splits**

Check that each brand has appropriate entries (no 0 counts, balanced distribution).

**Step 4: Commit**

```bash
git add CRM/CRM-SPA/knowledge/kb-spa.json CRM/CRM-AES/knowledge/kb-aes.json CRM/CRM-SLIM/knowledge/kb-slim.json tools/kb_split_by_brand.py
git commit -m "feat: split master KB into brand-specific files"
```

---

## PHASE 2: Keyword Tagging & /crmrespond Integration (Week 2)

### Task 4: Add Keyword Tags to All Entries

**Files:**
- Modify: `CRM/knowledge-base/kb-data.json`
- Create: `CRM/knowledge-base/KEYWORD-GUIDE.md`

**Step 1: Create keyword guidelines**

Document in `CRM/knowledge-base/KEYWORD-GUIDE.md`:
- Minimum 5 keywords per entry
- Mix of broad (booking) → narrow (emergency same-day)
- Include synonyms and misspellings
- Brand-specific keywords (SPA: wellness, massage; AES: skincare, clinical; SLIM: weight-loss, journey)

**Step 2: Tag all entries**

Add 5+ keyword tags to each KB entry, targeting diverse specificity levels.

Expected: All entries have rich keyword sets for matching.

**Step 3: Commit**

```bash
git add CRM/knowledge-base/KEYWORD-GUIDE.md CRM/knowledge-base/kb-data.json
git commit -m "docs: add keyword tagging guide; tag all KB entries"
```

---

### Task 5: Create KB Query Engine & /crmrespond Integration

**Files:**
- Create: `.agents/skills/crmrespond/kb-query.py`
- Modify: `.agents/skills/crmrespond/AGENT.md`
- Modify: `.agents/skills/crmrespond/config.json`

**Step 1: Create KB query engine**

Create `.agents/skills/crmrespond/kb-query.py` with KBQueryEngine class:
- Load KB from JSON
- Query by extracting keywords from customer question
- Score entries: keyword match (40%) + question similarity (40%) + tier priority (20%)
- Return top 3 matches with relevance scores

**Step 2: Test query engine**

Verify it can query KB and return relevant results.

**Step 3: Integrate with /crmrespond**

Update `.agents/skills/crmrespond/AGENT.md` to add KB query as Phase 2 of the 7-phase process:
1. Detect brand
2. **Query KB for relevant entries** ← New
3. Analyze customer state
4. Route to skill
5. Generate response
6. Validate
7. Output

**Step 4: Update config.json**

Add:
- Input: `kb_source` (optional path to KB file)
- Output: `kb_matches` (array of matched entries with relevance scores)

**Step 5: Commit**

```bash
git add .agents/skills/crmrespond/kb-query.py .agents/skills/crmrespond/AGENT.md .agents/skills/crmrespond/config.json
git commit -m "feat: add KB query engine; integrate with /crmrespond Phase 2"
```

---

### Task 6: Test KB Integration with Sample Queries

**Files:**
- Create: `CRM/knowledge-base/TEST-QUERIES.json`
- Create: `tests/test_crmrespond_kb_integration.py`

**Step 1: Define 10 test cases**

Create `CRM/knowledge-base/TEST-QUERIES.json`:
```json
{
  "test_cases": [
    {
      "test_id": "KB-TEST-001",
      "brand": "SPA",
      "question": "How do I book an appointment?",
      "expected_qid": "S1.1",
      "min_relevance": 85
    }
    // ... 9 more test cases covering all brands and question types
  ]
}
```

**Step 2: Create test suite**

Create `tests/test_crmrespond_kb_integration.py` that:
- Runs each test query through KB query engine
- Checks if top result matches expected QID and relevance threshold
- Reports pass/fail for each test

**Step 3: Run tests**

```bash
python3 tests/test_crmrespond_kb_integration.py
```

Expected: 9+ of 10 tests passing.

**Step 4: Commit**

```bash
git add CRM/knowledge-base/TEST-QUERIES.json tests/test_crmrespond_kb_integration.py
git commit -m "test: add KB integration test suite with 10 sample queries"
```

---

## PHASE 3: Automation & Maintenance (Week 3)

### Task 7: Establish Monthly Update Cycle

**Files:**
- Create: `CRM/knowledge-base/UPDATE-CYCLE.md`
- Create: `tools/kb_monthly_update.py`
- Create: `CRM/knowledge-base/UPDATES-LOG.md`

**Step 1: Document monthly process**

Create `CRM/knowledge-base/UPDATE-CYCLE.md` documenting:
- First Monday of month: Review cycle begins
- Days 1-5: Verify Tier 1 entries, flag outdated information
- Days 6-10: Implement updates, add new Q&As
- Days 11-14: Commit changes and tag release

**Step 2: Create monthly automation**

Create `tools/kb_monthly_update.py` that:
- Runs verification report (shows Tier 1 status, recent reviews)
- Validates all entries
- Reports statistics by tier and brand
- Suggests actions if confidence or verification rates are low

**Step 3: Initialize update log**

Create `CRM/knowledge-base/UPDATES-LOG.md` to track all changes monthly.

**Step 4: Test monthly cycle**

```bash
python3 tools/kb_monthly_update.py
```

Expected: Report showing KB health, verification status, and recommendations.

**Step 5: Commit**

```bash
git add CRM/knowledge-base/UPDATE-CYCLE.md tools/kb_monthly_update.py CRM/knowledge-base/UPDATES-LOG.md
git commit -m "docs: establish monthly KB update cycle"
```

---

### Task 8: Create New Q&A Backlog System

**Files:**
- Create: `CRM/knowledge-base/BACKLOG.md`
- Create: `CRM/knowledge-base/.backlog.json`
- Create: `tools/kb_backlog_manager.py`

**Step 1: Document backlog workflow**

Create `CRM/knowledge-base/BACKLOG.md`:
- Capture new questions when customers ask something not in KB
- Track frequency (how many times asked)
- When frequency ≥ 3, promote to KB
- Brand owner reviews and approves

**Step 2: Create backlog structure**

Create `CRM/knowledge-base/.backlog.json` with candidate entries tracking:
- backlog_id, brand, question, frequency, date_added, owner, status
- Statuses: NEW, READY_TO_PROMOTE, PROMOTED_TO_KB

**Step 3: Create backlog manager**

Create `tools/kb_backlog_manager.py` with commands:
- `add "question" brand` — Add new candidate
- `match "similar question"` — Increment frequency if similar exists
- `promote BL-001` — Promote to KB
- `status` — Show backlog stats

**Step 4: Test backlog system**

```bash
python3 tools/kb_backlog_manager.py add "How long does treatment last?" SPA
python3 tools/kb_backlog_manager.py status
```

Expected: Candidates tracked, ready for frequency-based promotion.

**Step 5: Commit**

```bash
git add CRM/knowledge-base/BACKLOG.md CRM/knowledge-base/.backlog.json tools/kb_backlog_manager.py
git commit -m "feat: add new Q&A backlog system with promotion workflow"
```

---

## PHASE 4: Analytics & Documentation (Ongoing)

### Task 9: Create Analytics Dashboard

**Files:**
- Create: `tools/kb_analytics.py`
- Create: `CRM/knowledge-base/ANALYTICS.md`

Create analytics script that shows:
- Content health (total entries by tier/brand, average confidence)
- Verification status (% recently verified, entries needing review)
- Query performance (top matched Q&As, average relevance)
- Health recommendations (what to focus on)

### Task 10: Create Reference Guides

**Files:**
- Create: `CRM/knowledge-base/QUICK-REFERENCE.md`
- Create: `CRM/knowledge-base/MAINTENANCE-GUIDE.md`

Create quick reference for agents and maintenance guide for KB owners.

---

## Execution Options

**Plan complete and saved to `docs/plans/2026-02-22-knowledge-base-integration.md`.**

**Two execution options:**

**1. Subagent-Driven (this session)** — I dispatch fresh subagent per task, review each task's work, fast iteration

**2. Parallel Session (separate)** — Open new session with executing-plans, batch execution with checkpoints

**Which approach would you prefer?**
