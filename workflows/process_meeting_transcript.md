# Workflow: Process Meeting Transcript

## Trigger
User pastes a raw meeting transcript or says "process meeting" and provides a transcript file.

## Inputs Required
- Raw transcript (pasted text or file path)
- Meeting topic (ask if not obvious from transcript)
- Date (extract from transcript or ask)

## Steps

### 1. Save Raw Transcript
Save the raw transcript to `miscellaneous/meetings/raw/YYYY-MM-DD-topic-slug.md` as an archive.
- Use lowercase, hyphens for spaces in the slug
- Prefix with the meeting date
- This is the unedited source of truth

### 2. Read Context
Before processing, search the vault for related notes:
- Check `strategy/` for related strategy documents
- Check `miscellaneous/meetings/` for previous meetings on the same topic or with the same people
- Check active project folders (`slimming/`, `aesthetics/`, `spa/`, `marketing/`, `CRM/`, `finance/`)
- Check `config/` for brand or offer context if relevant

This context is what makes the summary useful — it connects new information to existing knowledge.

### 3. Process Into Structured Note
Create the meeting note at `miscellaneous/meetings/YYYY-MM-DD-topic-slug.md` using the template in `miscellaneous/meetings/templates/meeting-note.md`.

**Summary (5-10 bullets):**
- Extract the actual substance — decisions, new information, disagreements, changes in direction
- Skip small talk, repetition, filler
- Each bullet should be something worth knowing a month from now

**Decisions Made:**
- Only include explicit decisions, not suggestions or ideas
- Include the reasoning/context behind the decision
- Note who made or approved the decision

**Action Items:**
- Extract every commitment made ("I'll send that over", "let's schedule a follow-up", "we need to update the contract")
- Assign an owner (the person who said they'd do it)
- Include deadlines if mentioned, otherwise leave blank

**Key Quotes:**
- Only preserve exact wording when it matters: commitments, numbers, terms, strong opinions
- 2-5 quotes maximum per meeting
- These are for "what exactly did they say?" moments

**Context & Notes:**
- How does this meeting relate to ongoing projects or past decisions?
- Does anything discussed contradict or update a previous decision?
- Link to related vault notes using [[wikilinks]]

### 4. Link to Related Notes
Add links in the processed note to any related documents in the vault.
Use Obsidian wikilink format: `[[folder/filename]]`

### 5. Surface Conflicts or Follow-ups
After processing, flag to the user:
- Anything that contradicts a previous decision or document
- Action items that overlap with existing commitments
- Topics that came up that have no existing documentation (potential new notes)

## Output
- Raw transcript saved: `miscellaneous/meetings/raw/YYYY-MM-DD-topic-slug.md`
- Processed note saved: `miscellaneous/meetings/YYYY-MM-DD-topic-slug.md`
- Verbal summary of key takeaways and any conflicts/follow-ups

## Quality Check
The processed note should:
- Be under 500 words (excluding quotes)
- Be useful to someone who wasn't in the meeting
- Link to at least one other note in the vault (if related content exists)
- Have zero filler or obvious information

---

## Known Issues & Learnings

> Updated when this workflow encounters failures, edge cases, or better methods.
> Always check this section before executing the workflow.
> Log full context in `miscellaneous/learnings/LEARNINGS.md` under Workflow Learnings.

<!--
Entry format:
### [YYYY-MM-DD] — [Issue Title]
**What happened:** Brief description
**Root cause:** Why it happened
**Fix:** What was changed
**Rule:** ALWAYS/NEVER directive (also added to root CLAUDE.md if universal)
-->

_No issues logged yet._
