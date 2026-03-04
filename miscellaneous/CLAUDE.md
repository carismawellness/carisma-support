# Miscellaneous

Shared resources that don't belong to a specific department. Houses the master learnings log and meeting transcripts/notes.

---

## Purpose

Central repository for cross-departmental resources — the self-improvement loop learnings and processed meeting notes.

## Folder Structure

| Folder | Purpose |
|--------|---------|
| `learnings/` | Master learnings log (`LEARNINGS.md`) — self-improvement loop documentation |
| `meetings/` | Processed meeting notes and raw transcripts |
| `meetings/raw/` | Raw unedited transcripts (archived) |
| `meetings/templates/` | Meeting note templates |
| `knowledge/` | Cross-departmental reference materials |
| `skills/` | Shared utility skills |
| `hooks/` | Shared triggers and templates |

## Key Files

- `learnings/LEARNINGS.md` — Master log of all system learnings, mistakes, and rules

## Meeting Processing

Meeting transcripts are automatically detected and processed:
1. Raw transcripts land in `meetings/raw/`
2. `tools/check_unprocessed_meetings.py` detects new files at session start
3. Claude processes each into a structured note in `meetings/`
4. Raw transcripts stay archived in `meetings/raw/`
