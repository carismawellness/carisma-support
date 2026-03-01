# Knowledge Base Monthly Update Cycle

## Schedule
- **First Monday of each month** — Review cycle begins
- **By end of first week** — All entries verified or flagged
- **By end of second week** — Changes committed
- **Ongoing** — Logged in UPDATES-LOG.md

## Monthly Process (14 Days)

### Phase 1: Verification (Days 1-5)

Each brand owner reviews their KB entries:

**For Tier 1 entries (critical):**
- [ ] Read each Tier 1 entry
- [ ] Verify information is current (check website if needed)
- [ ] Mark verification date in JSON
- [ ] Flag any outdated information

**For Tier 2-4 entries:**
- [ ] Spot-check 50% of entries randomly
- [ ] Flag if any seem outdated

**For new Q&As:**
- [ ] Review customer support logs
- [ ] Note frequently asked questions not in KB
- [ ] Create backlog items for new questions

**Checklist:**
- [ ] SPA owner verified Tier 1 entries
- [ ] AES owner verified Tier 1 entries
- [ ] SLIM owner verified Tier 1 entries
- [ ] All flagged entries noted with reason

### Phase 2: Updates (Days 6-10)

Implement flagged changes:

1. Update outdated answers (based on flags from Phase 1)
2. Add new Q&As from backlog (if frequency ≥ 3)
3. Remove obsolete entries
4. Refine keywords if needed
5. Run validation tests

**Checklist:**
- [ ] XX updates applied to kb-data.json
- [ ] XX new entries added
- [ ] All JSON validates
- [ ] Integration tests pass (8+/10)

### Phase 3: Commit (Days 11-14)

Document and commit changes:

```bash
git add CRM/knowledge-base/kb-data.json CRM/knowledge-base/UPDATES-LOG.md
git commit -m "docs: monthly KB update - $(date +%B\ %Y)

Summary:
- Updated XX entries for current accuracy
- Added XX new Q&As from customer inquiries
- Removed XX obsolete entries
- Improved keywords for YY entries

Verification:
- ✅ All entries validated
- ✅ 9+/10 integration tests passing
- ✅ SPA owner verified: $(date +%Y-%m-%d)
- ✅ AES owner verified: $(date +%Y-%m-%d)
- ✅ SLIM owner verified: $(date +%Y-%m-%d)

Owner: [Brand Owner Name]"
```

## Roles

- **Brand Owners:** Review Tier 1, flag outdated info, suggest new Q&As
- **KB Manager:** Implement updates, run tests, commit changes, track history

## Escalation

If ≥30% of Tier 1 entries are outdated → Halt new features, perform deep review
If integration tests drop <70% → Review KB accuracy, consider restructuring
