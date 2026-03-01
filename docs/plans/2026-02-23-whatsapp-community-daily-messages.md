# WhatsApp Community Daily Messages — Design Doc

**Date:** 2026-02-23
**Status:** Approved
**Location:** `slimming/whatsapp-community/`

---

## Objective

Build a self-contained folder system that generates daily WhatsApp community messages for Carisma Slimming members. Messages are copy-paste ready, brand-voice enforced (Katya), and follow a fixed 7-day theme rhythm.

---

## Folder Structure

```
slimming/whatsapp-community/
├── CLAUDE.md                        # System prompt: persona, rules, output format
├── knowledge/
│   ├── daily-themes.md              # 7-day theme definitions + format specs
│   ├── message-examples.md          # 3-5 gold-standard examples per day type
│   ├── recipe-bank.md               # Protein-first, points-friendly recipes
│   ├── science-facts.md             # Myth-busts, nutrition science, metabolism facts
│   ├── motivation-bank.md           # Curated quotes, reframes, mindset shifts
│   └── tips-and-tools.md            # Practical hacks, meal prep, kitchen tools
├── skills/
│   ├── generate-daily-message.md    # Main skill: pick theme → generate → validate
│   ├── recipe-formatter.md          # WhatsApp-ready recipe formatting
│   └── self-check.md                # 5-question brand voice validation
└── templates/
    ├── motivation-monday.md
    ├── tip-tuesday.md
    ├── whats-cooking-wednesday.md
    ├── science-thursday.md
    ├── feel-good-friday.md
    ├── saturday-strategy.md
    └── sunday-reset.md
```

---

## Daily Theme Schedule

| Day | Theme | Length | Format |
|-----|-------|--------|--------|
| Monday | Motivation Monday | Short (2-4 lines) | Hook + mindset reset + closing |
| Tuesday | Tip Tuesday | Medium (5-8 lines) | Hook + practical tip + why it works |
| Wednesday | What's Cooking Wednesday | Medium (8-12 lines) | Hook + recipe (ingredients + method) |
| Thursday | Science Thursday | Medium (5-8 lines) | Hook + myth-bust/fact + takeaway |
| Friday | Feel-Good Friday | Short (2-4 lines) | Hook + celebration/gratitude + closing |
| Saturday | Saturday Strategy | Medium (5-8 lines) | Hook + meal prep/planning tip |
| Sunday | Sunday Reset | Short (3-5 lines) | Reflection + intention for the week |

---

## Output Rules

- Copy-paste ready for WhatsApp (no markdown, proper line breaks)
- Single emoji per message: 💪
- Signature: "With you every step, Katya"
- Pass the North Star test before output
- No AI voice tells, no cliches, no urgency language
- Second-person ("you") always
- Short sentences with breathing room

---

## Implementation Plan

8 parallel sub-agents, each handling one domain:

1. **CLAUDE.md Agent** — System prompt with persona, rules, output format
2. **Daily Themes + Templates Agent** — daily-themes.md + 7 template files
3. **Message Examples Agent** — 3-5 gold-standard examples per day type
4. **Recipe Bank Agent** — 15-20 protein-first recipes
5. **Science Facts Agent** — 20+ myth-busts and nutrition facts
6. **Motivation Bank Agent** — 20+ mindset quotes and reframes
7. **Tips & Tools Agent** — 20+ practical hacks, tools, strategies
8. **Skills Agent** — generate-daily-message.md, recipe-formatter.md, self-check.md
