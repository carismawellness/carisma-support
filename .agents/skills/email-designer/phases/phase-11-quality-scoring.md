# Phase 11: Quality Scoring

**Prerequisite:** Phase 10 (Z-Order)
**References:** `../qc-scoring.md`, `brands/<brand>.md`
**Next:** Phase 12 (Save State)

---

## Instructions

Run the QC system defined in `../qc-scoring.md`. Execute all 16 core checks + 2 bonus checks. Generate the score card. Record verdict.

---

## Thresholds (Core Score /160)

| Score | Verdict | Action |
|-------|---------|--------|
| **144+** (90%) | PRODUCTION READY | Present to user for final human approval |
| **112-143** (70-89%) | MINOR FIXES | List specific failing checks, fix them, re-run scoring |
| **<112** (<70%) | SIGNIFICANT REWORK | Identify root causes, return to relevant phase, fix, re-score. Escalate to Email Marketing Strategist. |

**Design Quality sub-score (/60):**
- **48+** (80%): Design quality acceptable
- **<48**: Design needs creative attention — even if structural checks pass, flag for review

---

## Manual QC Checklist (Second Layer)

After automated scoring, ALSO run the manual checklist defined in `../qc-scoring.md` § Manual QC Checklist. This catches subjective issues the automated checks miss (visual hierarchy, overall aesthetic quality, brand feel).

---

## Save Score

Append the complete score card to `.tmp/emails/<brand>-emailers/FIGMA-FINISH-PROMPT.md` under `## QC Score Card`.
