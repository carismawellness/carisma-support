# Blog Production Pipeline — Orchestrator

**Skill name:** `blog-production-pipeline`
**Role:** Coordinates all 8 pipeline steps. Routes inputs to the right agents, enforces gates, tracks revision cycles.

---

## The Pipeline

```
┌─────────────────────────────────────────────────────┐
│              BLOG PRODUCTION PIPELINE               │
│                                                     │
│  [1] RESEARCH        seo-blog-content-researcher   │
│         ↓                                           │
│      GATE 1: Topic brief approved by human          │
│         ↓                                           │
│  [2] WRITE (parallel if multiple brands)            │
│      ├─ blog-writer-spa (spa topics)                │
│      ├─ blog-writer-aesthetics (aesthetics topics)  │
│      └─ blog-writer-slimming (slimming topics)      │
│         ↓                                           │
│  [3] SEO QC          seo-blog-qc-expert            │
│         ↓                                           │
│      GATE 2: All 10 SEO dimensions pass             │
│         ↓           (or return to writer)           │
│  [4] HUMANIZE        blog-tone-humanizer            │
│         ↓                                           │
│  [5] INTERNAL LINK   blog-internal-linker           │
│         ↓                                           │
│  [6] FORMAT QC       blog-final-format-qc           │
│         ↓                                           │
│  [7] GOOGLE DOC      blog-google-doc-publisher      │
│         ↓                                           │
│      GATE 3: Human final read before publish        │
│         ↓                                           │
│  [8] PUBLISH         Human uploads to CMS           │
└─────────────────────────────────────────────────────┘
```

---

## How to Activate the Pipeline

### Option A: Full Pipeline (Research → Publish-Ready)

User says: "Run the blog pipeline for [brand(s)] — [month/quarter]"

1. Invoke `seo-blog-content-researcher` → deliver topic briefs
2. Wait for GATE 1 (human approves topics)
3. Invoke brand writer(s) in parallel with approved briefs
4. Invoke `seo-blog-qc-expert` on each draft
5. Route failures back to writer; send passes to humanizer
6. Invoke `blog-tone-humanizer` on each SEO-approved draft
7. Invoke `blog-internal-linker` on each humanized draft
8. Invoke `blog-final-format-qc` on each linked draft
9. Invoke `blog-google-doc-publisher` for each clean draft
10. Run `python3 tools/add_docs_hyperlinks.py` to add real clickable links
11. Present Gate 3 package to human

### Option B: Mid-Pipeline Entry

User provides an existing draft that skipped research.

| Draft State | Next Agent |
|---|---|
| Raw draft, no QC | `seo-blog-qc-expert` |
| SEO-approved, not humanized | `blog-tone-humanizer` |
| Humanized, no internal links | `blog-internal-linker` |
| Internal links done, no format QC | `blog-final-format-qc` |
| Format clean, no Google Doc | `blog-google-doc-publisher` |
| Topic idea only, no brief | `seo-blog-content-researcher` |
| Brief only, no draft | Brand writer |

### Option C: Single Post

User says: "Write a blog about [topic] for [brand]"

1. Check if topic brief exists. If not → `seo-blog-content-researcher` first
2. Brief → writer → SEO QC → humanizer → internal linker → format QC → Google Doc → Gate 3

---

## Gate Protocols

### GATE 1 — Topic Approval (Human)

**Present:** Ranked topic list (up to 8), primary keywords, why selected, brand assignment, proposed schedule.
**Required:** Explicit human approval. No writers briefed without Gate 1.

### GATE 2 — SEO QC Pass (Automated)

**Pass condition:** All 10 SEO dimensions score PASS or CONDITIONAL PASS.
**Fail:** Return to brand writer with audit report.
**Escalate to human at Cycle 3+.**

Revision log per post:
```
Post: [title]
Cycle 1: [date] — FAIL — Dimensions: [n] — Returned to writer
Cycle 2: [date] — PASS — Sent to humanizer
```

### GATE 3 — Final Human Read (Human)

Present Google Doc URL(s) + metadata. Human reads and approves. **No CMS publish without Gate 3 sign-off.**

---

## Status Tracker Template

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PIPELINE STATUS — [Month Year]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Post title] | [Brand] | [Stage] | [Status]
─────────────────────────────────────────
Post A  | Aesthetics | SEO QC    | ✅ PASS — awaiting humanizer
Post B  | Slimming   | Writing   | ⏳ In progress
Post C  | Spa        | Humanizer | ✅ PASS — awaiting Gate 3
Post D  | Aesthetics | SEO QC    | ❌ FAIL — returned to writer (cycle 1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Parallel Execution

When producing multiple posts in the same run:

- Research all brands first (one researcher session)
- Brief all writers simultaneously (parallel invocation)
- SEO QC each draft as it's ready (don't wait for all drafts)
- Humanize as QC approvals come in
- Internal Link → Format QC → Google Doc for each post as it reaches Step 5

A 4-post batch completes in ~5 layers instead of 4 × 8 sequential steps.

---

## Monthly Production Schedule

| Week | Brand | Posts |
|---|---|---|
| Week 1 | Aesthetics | 1 post |
| Week 2 | Slimming + Spa | 1 post each |
| Week 3 | Aesthetics | 1 post |
| Week 4 | Spa | 1 post |

**Total: 5 posts/month** (2× Aesthetics, 2× Spa, 1× Slimming)

---

## Common Pipeline Failures

| Failure | Resolution |
|---|---|
| Writer submits without full brief | Return to `seo-blog-content-researcher` |
| SEO QC fails same dimension twice | Escalate to human |
| Humanizer flags SEO issue | Route back to `seo-blog-qc-expert` |
| Post goes live without Gate 3 | Critical failure — log in LEARNINGS.md |
| Brief has no internal link suggestions | Researcher must provide them |
