# Sales Feedback Agent -- QC Report

**Date:** 2026-04-14
**Reviewer:** QC Sub-Agent
**Files Reviewed:** 31 (15 knowledge + 6 skills + 3 rubric + 3 templates + 3 workflows + 1 orchestrator CLAUDE.md)
**Design Doc Checked Against:** `docs/plans/2026-04-14-sales-feedback-agent-design.md`

## Overall Assessment

**NEEDS WORK -- High-quality foundation with specific issues to fix before production.**

The system is exceptionally well-built. Knowledge files are thorough, skills are well-structured with clear input/output specs, the rubric is detailed with realistic benchmark examples, and the orchestration flow is coherent. However, there are concrete issues that must be addressed: incorrect file path references in a skill file, dimension naming inconsistencies between the scoring-feedback skill and the rubric, a weight mismatch in the CLAUDE.md dimension listing vs the rubric, missing Slimming pricing in the pricing reference, self-correcting math errors in benchmarks.md, and several knowledge gaps flagged by the files themselves.

---

## Knowledge Base Review

| File | Completeness | Accuracy | Issues |
|------|-------------|----------|--------|
| `knowledge/brand-intelligence/spa.md` | Complete | Accurate | All required sections present: identity, voice summary, tone keywords, DO/DON'T patterns, response rules, pricing psychology, scoring indicators. No issues. |
| `knowledge/brand-intelligence/aesthetics.md` | Complete | Accurate | All required sections present. Includes "no emojis in brand-voice communications" rule unique to Aesthetics. No issues. |
| `knowledge/brand-intelligence/slimming.md` | Complete | Accurate | All required sections present including the 5 brand pillars, pricing psychology with payment plans, and comprehensive red flags. No issues. |
| `knowledge/scripts/spa-scripts.md` | Partial | Accurate | Call script is complete (10 steps with scoring notes). **WhatsApp/text scripts section is empty** with a note that scripts have not been developed yet. This is acknowledged in the file itself. Script compliance scoring for Spa WhatsApp conversations will have no reference material. |
| `knowledge/scripts/aesthetics-scripts.md` | Complete | Accurate | Call script (10 steps) plus 12 WhatsApp scenarios fully documented with key elements checklists. Most complete of the three. No issues. |
| `knowledge/scripts/slimming-scripts.md` | Partial | Accurate | Call script is complete (11 steps). WhatsApp scenarios: only 4 of 12 are populated (Scenarios 1-2 reference "New Leads sheet", Scenarios 4, 7, 8 have scripts). **Scenarios 3, 5, 6, 9, 10, 11, 12 are unpopulated** with notes to follow Aesthetics structure. |
| `knowledge/sales-excellence/methodology.md` | Complete | Accurate | Excellent synthesis covering all 8 sections (Greeting through Referrals) with principles, techniques, example language, and scoring criteria per section. Cross-cutting standards appendix covers hospitality language, team accountability, and awareness-level matching. Includes its own scoring weight guide (internal to methodology -- distinct from the rubric weights). |
| `knowledge/hospitality-program/reception.md` | Partial | Accurate | Key principles, verbiage standards, and AOA protocols captured. **8 .docx files could not be read** (inbound/outbound call flows, phone audit templates, KPI logs, receptionist questions). Content loss acknowledged. |
| `knowledge/hospitality-program/consultation.md` | Partial | Accurate | Consultation flow, GBB Playbook with 3 package examples, Open House framework captured. **9 .docx files could not be read** including objection handling scripts and discovery question banks. Content loss acknowledged. |
| `knowledge/hospitality-program/retention.md` | Complete | Accurate | Full 9-step framework, complete Verbiage Swap guide, Friendly Bust system, CHEF method, AOA system. Only 1 unreadable .docx (Team Member Goals). Most complete hospitality file. |
| `knowledge/hospitality-program/general.md` | Partial | Accurate | Advertising principles, awareness levels, market sophistication stages, Open House framework. **7 .docx files could not be read** (Hero's Journey templates, Patient Journey Checklist, Brand Identity Questions). |
| `knowledge/domain/spa-operations.md` | Complete | Accurate | Treatments, pricing framework, booking policy, vouchers, FAQ, factual claims checklist, Beyond the Spa philosophy, upsell matrix, response protocol. **Note:** Exact per-treatment prices not populated (only tier framework ranges). This is documented. |
| `knowledge/domain/aesthetics-protocols.md` | Complete | Accurate | Comprehensive treatment list with 30+ treatments, full pricing (member/regular with low/high ranges), booking policy, vouchers, FAQ, factual claims with critical/treatment/pricing categories, upsell matrix, response protocol. Most data-rich domain file. |
| `knowledge/domain/slimming-sops.md` | Complete | Accurate | Excellent coverage: medical positioning, core philosophy (5 pillars, 3 anchors), consultation flow (5 steps), treatment knowledge (6 treatments with pricing), nutrition methodology (4 pillars), pricing packages, booking policy with Fresha links, Extended Care Commitment guarantee, critical claims section, red flags. |
| `knowledge/domain/pricing-reference.md` | Nearly Complete | Accurate | Aesthetics pricing is fully populated with all treatments, member/regular rates, duration. **Spa pricing is framework only** (not exact prices). Includes active promotional offer packages, product inventory cost basis (internal), cross-brand vouchers, and a pricing verification checklist. **Missing: Slimming treatment pricing is not consolidated here** -- it exists only in slimming-sops.md. |

---

## Skills Review

| Skill | Clarity | Specificity | Path Accuracy | Issues |
|-------|---------|-------------|---------------|--------|
| `skills/brand-intelligence.md` | Excellent | Excellent | Correct | All paths resolve. Clear 5-tier scoring table. Comprehensive edge cases. No issues. |
| `skills/script-compliance.md` | Excellent | Excellent | Correct | All paths resolve. 5-tier scoring with percentage thresholds. Good naturalness assessment (Robotic/Stilted/Natural/Masterful). Edge case for "no matching script" is well-handled. |
| `skills/sales-excellence.md` | Excellent | Excellent | **INCORRECT** | **4 knowledge source paths are wrong.** The skill references: `knowledge/hospitality-program/welcome-experience.md`, `knowledge/hospitality-program/consultation-framework.md`, `knowledge/hospitality-program/objection-psychology.md`. These files do not exist. The actual files are: `knowledge/hospitality-program/reception.md`, `knowledge/hospitality-program/consultation.md`, `knowledge/hospitality-program/retention.md`, `knowledge/hospitality-program/general.md`. The CLAUDE.md orchestrator lists the correct paths, but the skill file itself has wrong paths. |
| `skills/domain-knowledge.md` | Excellent | Excellent | Correct | All paths resolve. Clear PASS/FAIL binary with severity categories. Good "misleading by omission" concept. No issues. |
| `skills/scoring-feedback.md` | Excellent | Excellent | Correct | All paths resolve. Clear 8-step process. Grade table uses letter grades (A/B/C/D/F) with numeric ranges (8.5-10.0 scale) which differ from the rubric's 100-point labels (see Rubric Consistency below). Edge case handling is thorough. |
| `skills/qc-reviewer.md` | Excellent | Excellent | Correct | Path resolves. 5-check framework (completeness, score-evidence alignment, feedback specificity, fairness, consistency). Arithmetic verification step is a strong design choice. Edge cases cover near-perfect and very-low scores. |

---

## Rubric Review

### Dimension Names and Weights

The 6 dimensions are defined in `rubric/scoring-rubric.md`. I checked every file that references them for naming and weight consistency.

**Dimension naming comparison:**

| # | scoring-rubric.md | scoring-feedback.md (output format) | CLAUDE.md (orchestrator) | templates/per-conversation-report.md | Design doc |
|---|------------------|-------------------------------------|--------------------------|--------------------------------------|------------|
| 1 | Script Compliance | Script Compliance | Script Compliance | Script Compliance | Script Compliance |
| 2 | Brand Voice and Positioning | Brand Voice | Brand Voice and Positioning | Brand Voice | Brand Voice & Positioning |
| 3 | Discovery and Needs Assessment | Discovery Quality | Discovery and Needs Assessment | Discovery | Discovery & Needs Assessment |
| 4 | Objection Handling and Persuasion | Objection Handling | Objection Handling and Persuasion | Objection Handling | Objection Handling & Persuasion |
| 5 | Close and Next Steps | Close Execution | Close and Next Steps | Close | Close & Next Steps |
| 6 | Follow-Up and Re-engagement | Follow-Up | Follow-Up and Re-engagement | Follow-Up | Follow-Up & Re-engagement |

**Issue:** The scoring-feedback.md skill uses shorter/different names in its output template compared to the rubric. "Brand Voice" vs "Brand Voice and Positioning", "Discovery Quality" vs "Discovery and Needs Assessment", "Close Execution" vs "Close and Next Steps". While these are close enough for human readability, for programmatic consistency (Google Sheets logging, weekly aggregation) these should be standardized.

**Weight consistency:**

| # | scoring-rubric.md | brand-criteria.md (Spa) | brand-criteria.md (Aesthetics) | brand-criteria.md (Slimming) | Design doc |
|---|------------------|------------------------|-------------------------------|------------------------------|------------|
| 1 (Script) | 20% | 17.5% | 20% | 15% | 20% |
| 2 (Brand Voice) | 15% | 20% | 15% | 17.5% | 15% |
| 3 (Discovery) | 20% | 20% | 20% | 25% | 20% |
| 4 (Objection) | 20% | 20% | 22.5% | 20% | 20% |
| 5 (Close) | 15% | 15% | 15% | 15% | 15% |
| 6 (Follow-Up) | 10% | 7.5% | 7.5% | 7.5% | 10% |

**Finding:** The brand-specific weight adjustments in brand-criteria.md are internally consistent (each brand's adjusted weights sum to 100%). The standard weights match the design doc. No arithmetic errors.

### Score Level Descriptions

The rubric uses score labels: Elite (9-10), Strong (7-8), Developing (5-6), Needs Improvement (3-4), Critical (1-2). These are consistent across all 6 dimensions in the rubric and all 6 skill files.

The composite score interpretation table in the rubric uses different ranges: Elite (90-100), Strong (75-89), Developing (60-74), Needs Improvement (40-59), Critical (0-39).

The scoring-feedback.md skill uses letter grades with a different scale: A (8.5-10.0), B (7.0-8.4), C (5.5-6.9), D (4.0-5.4), F (Below 4.0). **Issue:** This is a different scale from the rubric's composite score ranges. If the composite is on a 100-point scale, the A/B/C/D/F thresholds at 8.5/7.0/5.5/4.0 seem to be on a 10-point scale. The scoring-feedback skill multiplies by 10 in the output ("Composite Score: [X.X]/10"), but the rubric's composite formula produces a score out of 100. **This is a scale inconsistency.** The rubric says composite = weighted average x 10 (producing 0-100), but the scoring-feedback skill output format says "/10" and uses thresholds appropriate for a 10-point scale. The templates and delivery workflow use "/100". This needs to be clarified.

### Benchmark Examples

The benchmarks file contains 15 examples (3 per tier as promised in the header) covering all 3 brands. **Issue:** Three examples required mid-stream recalibration because the initial conversation scored differently than intended:
- Example 3.1 (Developing) initially scored 48.1 (Needs Improvement) and was rewritten
- Example 3.2 (Developing) initially scored 52.5 (Needs Improvement) and was adjusted
- Example 4.1 (Needs Improvement) initially scored 26.2 (Critical) and was rewritten
- Example 4.2 (Needs Improvement) initially scored 37.0 (Critical) and was adjusted

The recalibrations are transparent (the file shows the original, explains why it needed correction, and provides the adjusted version). However, this means the file contains both incorrect and corrected examples, which could confuse a scoring agent. **Recommendation:** Remove the incorrect versions and keep only the corrected examples.

### Brand Criteria Pass/Fail Gates

Each brand has mandatory pass/fail checks in brand-criteria.md. These are well-differentiated:
- Spa: 7 checks (persona, AI tells, em-dashes, response length, referrals, urgency, pricing framework)
- Aesthetics: 8 checks (adds "enhance not fix" language and medical accuracy)
- Slimming: 9 checks (adds shame-free, no toxic positivity, validation before solution, medical-first positioning, no fear-mongering)

All gates are specific and testable. The Slimming longer-response exception (up to 100 words for empathy) is a thoughtful carve-out.

---

## Template Review

### per-conversation-report.md

- **WhatsApp version:** Template is under 2000 characters (approximately 950 characters with placeholders). When populated with real data, will need the overflow handling rules specified in the template (truncation priority: trim coaching first, remove improvement 2, shorten strength). These rules are clearly documented.
- **Email version:** Comprehensive. All scoring-feedback skill outputs are represented. Includes additional fields not in WhatsApp: per-dimension explanations, expanded coaching, rubric references, checklists.
- **Variable reference tables:** Both versions have complete variable documentation with examples.
- **Issue:** The email template references `{rubric_reference}` fields (e.g., `{improvement_1_rubric_ref}`) which map coaching to rubric criteria. This is a nice feature but the scoring-feedback skill output format does not include a `rubric_reference` field. The template expects data the skill does not currently produce.
- **Tone guidelines:** Well-written coaching tone guide with specific do/don't table. Consistent with brand voice philosophy.

### weekly-summary.md

- **Completeness:** Thorough. Includes conversation counts by channel, overall scores with trends, dimension averages with week-over-week comparison, 4-week history, top 3 patterns to improve, top 3 strengths, focus area with drill and target, quick wins, compliance summary.
- **Selection logic:** Clearly documented (how patterns are ranked, how focus areas are chosen, trajectory calculation).
- **Delivery rules:** Monday 8am Malta time, email to rep+manager, condensed WhatsApp version, handling for 0-conversation weeks, declining trajectory manager flag.
- **No issues found.** This is a well-designed template.

### manager-dashboard.md

- **Completeness:** Comprehensive team view. Rep rankings table, dimension heatmap, top performers (most improved + highest scorer), reps needing attention (with criteria), team-wide patterns, training topic recommendations, brand comparison matrix, compliance summary.
- **Selection logic:** Documented for each section (attention criteria, training topic selection, brand comparison minimum 3 conversations).
- **Delivery rules:** Monday 8am, email to manager, WhatsApp condensed option, "[ACTION NEEDED]" subject prefix trigger, 3-week escalation for flagged reps.
- **No issues found.** Exceptionally thorough.

---

## Orchestration Review

### CLAUDE.md

- **Identity section:** Clear role definition as hub orchestrator, not scorer.
- **Brand detection logic:** 6 rules in priority order, from explicit name to user fallback. Well-designed.
- **Scenario detection:** 10 scenario types with detection signals. Multi-scenario handling documented.
- **Knowledge loading:** Per-brand file lists. All paths verified -- they all resolve to existing files.
- **Sub-agent dispatch:** All 6 agents documented with skill file paths, input specs, knowledge to provide, and expected output structure.
- **Issue:** The Agent 3 (Sales Excellence) dispatch section in CLAUDE.md lists the correct hospitality program file paths (`reception.md`, `consultation.md`, `retention.md`, `general.md`), but the skill file itself (`skills/sales-excellence.md`) lists different, non-existent paths. The orchestrator is correct; the skill is wrong.
- **Error handling:** Covers transcript too short, brand unknown, agent failure, anomalous scores, QC revision loop exceeded. All reasonable.
- **Weekly reports:** References correct templates. Monday 8am delivery.
- **Feedback delivery:** WhatsApp primary, email secondary (CC manager), Sheets logging, fallback to local file/CSV.

### workflows/ingest-conversation.md

- **Input sources:** 5 channels documented (WhatsApp, Email, Phone, In-Person, Direct Paste) with MCP tools and extraction methods.
- **Normalization:** Standard conversation format is well-defined with all fields.
- **Brand detection:** Mirrors the CLAUDE.md rules (consistent).
- **Scenario classification:** Mirrors the CLAUDE.md scenarios with additional detail on multi-scenario handling.
- **Validation checks:** 4 pre-scoring checks (brand known, 1+ SDR message, speaker labels, date present).
- **Edge cases:** Group chats, voice notes, media, automated messages, non-English. All reasonable.
- **No issues found.**

### workflows/score-conversation.md

- **Knowledge loading:** Correctly specifies which files to load per brand. Cross-brand loading for Agent 1 noted.
- **Agent dispatch:** 4 parallel agents with correct skill paths and expected outputs.
- **Validation checks:** Post-dispatch verification that each agent returned required fields.
- **Weight calculation verification:** Explicit step to verify arithmetic before QC. Good design.
- **QC loop:** Max 2 revision rounds, then deliver with warning. Correctly documented.
- **Timing expectations:** Realistic (1-2 minutes without revisions, 2-3 with).
- **Error recovery:** Covers timeout, malformed output, all-agent failure, calculation mismatch.
- **No issues found.**

### workflows/deliver-feedback.md

- **WhatsApp formatting:** References correct template. 2000-char limit enforcement with specific truncation priority.
- **Email construction:** CC manager, subject line prefix logic (CRITICAL > ACCURACY ALERT > BRAND ALERT > none).
- **Sheet logging:** 20 columns defined (A-T). Comprehensive.
- **Alert conditions:** Critical (<40), Needs Improvement (40-59), Brand compliance fail, Domain accuracy fail, Elite (90+). Each has specific action.
- **Fallback:** Local file saves for WhatsApp, email, and sheet failures. Pending CSV upload on next run.
- **Issue:** The Critical Score Alert threshold is "below 40" in deliver-feedback.md. The rubric defines Critical as "0-39" (the per-conversation report template uses "1-29" for the Critical emoji tier). **The score ranges for "Critical" are inconsistent:** rubric says 0-39, deliver-feedback says below 40 (same thing), but per-conversation-report emoji mapping says 1-29. The "Needs Improvement" range is 30-49 in the emoji mapping but 40-59 in the rubric. **The WhatsApp template emoji mapping ranges do not match the rubric's score interpretation table.**

---

## Cross-File Consistency

### Dimension Names
As documented in the Rubric Review, the scoring-feedback skill uses abbreviated dimension names ("Brand Voice", "Discovery Quality", "Close Execution") while the rubric and CLAUDE.md use full names ("Brand Voice and Positioning", "Discovery and Needs Assessment", "Close and Next Steps"). These should be unified.

### Weight Percentages
Consistent across rubric, brand-criteria, and design doc. The brand-specific adjustments sum to 100% for each brand.

### File Path References
All paths in CLAUDE.md, score-conversation.md, ingest-conversation.md, deliver-feedback.md resolve to existing files. **One exception:** `skills/sales-excellence.md` references 3 files that do not exist (see Skills Review).

### Terminology
- "Composite score" is used consistently across scoring-rubric.md, scoring-feedback.md, brand-criteria.md, benchmarks.md, deliver-feedback.md, and templates.
- "Overall score" appears in templates as `{overall_score}` and is treated as synonymous with composite score. No conflict.
- "Factual Accuracy" is consistently PASS/FAIL across domain-knowledge skill, scoring-feedback skill, and templates.
- "Brand Compliance" is consistently PASS/FAIL across brand-intelligence skill, scoring-feedback skill, and templates.

### Scoring Scale
The scoring-feedback skill output shows the composite as `/10` with an A-F letter grade scale (8.5/7.0/5.5/4.0 boundaries), while everywhere else (rubric, templates, delivery, sheets logging) the composite is `/100` with word labels (Elite/Strong/Developing/Needs Improvement/Critical at 90/75/60/40 boundaries). **This must be reconciled.**

### Methodology Internal Weights
`knowledge/sales-excellence/methodology.md` includes its own "Scoring Weight Guide" in the appendix (Discovery 25%, Consultation 20%, Objection 15%, Closing 15%, Greeting 10%, Follow-Up 5%, Upselling 5%, Referrals 5%). These are internal methodology weights for conceptual guidance and differ from the rubric's 6-dimension weights. This is not a conflict -- the methodology weights describe relative importance of sales skills, while the rubric weights describe scoring dimensions. However, a scoring agent reading both files could be confused. **Recommendation:** Add a note to methodology.md clarifying these are educational weights, not scoring weights.

---

## Recommendations

1. **`skills/sales-excellence.md` -- Fix knowledge source paths.** Change `knowledge/hospitality-program/welcome-experience.md` to `knowledge/hospitality-program/reception.md`, change `knowledge/hospitality-program/consultation-framework.md` to `knowledge/hospitality-program/consultation.md`, change `knowledge/hospitality-program/objection-psychology.md` to `knowledge/hospitality-program/retention.md` and add `knowledge/hospitality-program/general.md`. **Priority: HIGH** (agent will fail to load knowledge without this fix).

2. **`skills/scoring-feedback.md` -- Reconcile composite score scale.** The output format says `/10` with letter grades (A/B/C/D/F), but the rubric and all downstream consumers expect `/100` with word labels (Elite/Strong/Developing/Needs Improvement/Critical). Align the output format to use `/100` and the rubric's word labels. **Priority: HIGH** (scoring agents and delivery pipeline will produce mismatched data).

3. **`templates/per-conversation-report.md` -- Fix WhatsApp emoji mapping score ranges.** The emoji mapping shows Critical at 1-29, Needs Improvement at 30-49, Developing at 50-69, Strong at 70-89, Elite at 90-100. The rubric defines: Critical 0-39, Needs Improvement 40-59, Developing 60-74, Strong 75-89, Elite 90-100. **Use the rubric's ranges.** **Priority: HIGH** (incorrect emoji colors will confuse reps and managers).

4. **`rubric/benchmarks.md` -- Remove incorrect examples, keep only corrected versions.** Examples 3.1, 3.2, 4.1, and 4.2 each contain an initial version that scored in the wrong tier plus a corrected version. Remove the incorrect versions and their recalibration notes to prevent scoring agent confusion. **Priority: MEDIUM** (scoring agents could calibrate against the wrong examples).

5. **Standardize dimension names across all files.** Choose either the full names ("Brand Voice and Positioning") or the short names ("Brand Voice") and use them everywhere -- rubric, skills, templates, CLAUDE.md, delivery workflow, and sheet column headers. **Priority: MEDIUM** (programmatic aggregation will fail if names do not match exactly).

6. **`skills/scoring-feedback.md` -- Add `rubric_reference` field to output.** The per-conversation-report email template expects `{improvement_1_rubric_ref}` and `{improvement_2_rubric_ref}` but the scoring-feedback skill output does not produce these fields. Either add them to the skill output or remove them from the template. **Priority: MEDIUM** (email will have unfilled placeholders).

7. **`knowledge/domain/pricing-reference.md` -- Add Slimming pricing section.** Slimming treatment pricing (starter packs at EUR 199, program tiers at EUR 199/549/999, standalone Tanita at EUR 60, individual treatment sessions at EUR 100) exists in slimming-sops.md but is not consolidated into the unified pricing reference. The Domain Knowledge Agent references pricing-reference.md as the single source of truth. **Priority: MEDIUM** (domain agent may miss Slimming price verification).

8. **`knowledge/scripts/spa-scripts.md` -- Flag WhatsApp script gap prominently.** Spa has no WhatsApp/text scripts, which means the Script Compliance Agent will have no reference for scoring Spa WhatsApp conversations. Add a prominent note that until scripts are developed, WhatsApp conversations for Spa should use the call script structure as a baseline, and the scoring agent should note the gap. **Priority: MEDIUM** (Spa WhatsApp scoring has no reference).

9. **`knowledge/scripts/slimming-scripts.md` -- Flag 8 unpopulated WhatsApp scenarios.** Scenarios 3, 5, 6, 9, 10, 11, 12 are empty. Same recommendation as item 8. **Priority: LOW** (each scenario is documented as "not yet populated" with guidance to follow Aesthetics structure).

10. **`knowledge/sales-excellence/methodology.md` -- Add note clarifying internal weights.** The appendix "Scoring Weight Guide" (Discovery 25%, Consultation 20%, etc.) could be confused with the rubric's dimension weights. Add a 1-line note: "These weights describe relative importance in sales methodology, not the scoring rubric weights. See rubric/scoring-rubric.md for actual scoring weights." **Priority: LOW** (risk of agent confusion is moderate).

11. **Hospitality program .docx files -- Plan conversion.** 18 .docx files across reception, consultation, and general folders could not be read. These include objection handling scripts, phone audit templates, discovery question banks, and patient journey checklists that would significantly enrich the knowledge base. **Priority: LOW** (system functions without them, but quality would improve with them).

12. **`knowledge/domain/spa-operations.md` -- Resolve opening hours discrepancy.** The file notes "9am-8pm, Monday-Sunday. NOT 9am-9pm (some agent prompts say 9pm but KB says 8pm -- verify current hours)." This discrepancy should be resolved with a definitive answer. **Priority: LOW** (the file already flags this, just needs confirmation).

---

*QC Report generated 2026-04-14. This report covers the complete file set of the Sales Feedback Agent system.*
