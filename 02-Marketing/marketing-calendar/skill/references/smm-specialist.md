# SMM (Social Media Marketing) Specialist Reference

Channel specialist guidance for organic social media planning within the marketing calendar.

**Persona:** Organic content expert

**Full skill:** Invoke `social-media-content-strategy` at `marketing/marketing-calendar/social-media/SKILL.md`. That skill contains the complete content pillar system with hook templates, script skeletons, and voice checks. This reference summarises what the calendar strategy agent needs.

---

## Calendar Placement

- **SMM Post row:** One post per brand per weekday (Mon-Fri)
- **SMM Story row:** One story per brand per weekday (Mon-Fri)
- **Weekend:** No regular posting (unless special occasion)

See config.json for exact row positions per brand:
- Spa: Post row 53, Story row 54
- Aesthetics: Post row 141, Story row 142
- Slimming: Post row 221, Story row 222

---

## Content Pillars by Brand (from social-media-content-strategy)

The SMM skill defines brand-specific pillars with strict ratios. The calendar agent MUST follow these when planning the monthly rotation.

### Spa (4 Pillars)
| Pillar | Purpose | Ratio |
|--------|---------|-------|
| Pain-Solution | Lifestyle frustrations a spa visit solves | 30% |
| Hooked Insight | Surprising wellness/spa science facts | 25% |
| Objection Flip | Dismantle objections to treating yourself | 20% |
| Viral Replication | Trending formats adapted for spa | 25% |

**Pillar file:** `marketing/marketing-calendar/social-media/spa-pillars.md`

### Aesthetics (4 Pillars)
| Pillar | Purpose | Ratio |
|--------|---------|-------|
| Pain-Solution | Skin/face concerns and clinical fixes | 30% |
| Hooked Insight | Treatment myths and surprising truths | 30% |
| Objection Flip | Fear of looking fake, pain, side effects | 20% |
| Viral Replication | Trending aesthetics content formats | 20% |

**Pillar file:** `marketing/marketing-calendar/social-media/aesthetics-pillars.md`

### Slimming (5 Pillars)
| Pillar | Purpose | Ratio |
|--------|---------|-------|
| Pain-Solution | Body frustrations and what actually works | 25% |
| Hooked Insight | Weight loss myths and science | 20% |
| Objection Flip | "Fat freezing is a scam" and other myths | 20% |
| Viral Replication | Trending weight loss content formats | 15% |
| Behind-the-Clinic | Educational authority-building content | 20% |

**Pillar file:** `marketing/marketing-calendar/social-media/slimming-pillars.md`

---

## Daily Themed Rotation

### Spa
| Day | Post Theme | Story Theme |
|-----|-----------|-------------|
| Mon | Wellness Monday -- self-care tips, weekly intention | Behind the scenes -- spa setup, morning routine |
| Tue | Treatment Spotlight -- feature a specific treatment | Client transformation / relaxation moment |
| Wed | Midweek Escape -- escape messaging, "you deserve" | Poll / Quiz -- wellness trivia, "what's your vibe?" |
| Thu | Team Thursday -- staff spotlight, therapist feature | Offer teaser -- upcoming weekend special |
| Fri | Feel Good Friday -- uplifting quote, weekend prep | Weekend plans -- "book your Saturday spa day" |

### Aesthetics
| Day | Post Theme | Story Theme |
|-----|-----------|-------------|
| Mon | Confidence Monday -- empowerment, beauty philosophy | Quick tip -- skincare routine, prep for treatment |
| Tue | Treatment Tuesday -- specific treatment education | Before/After or results showcase |
| Wed | Myth Buster -- debunk beauty myths, education | Poll -- "have you tried X?", engagement hook |
| Thu | Testimonial Thursday -- client story, social proof | Sarah's pick -- founder recommends a treatment |
| Fri | Glow Friday -- aspirational content, weekend glow-up | Weekend availability -- "last spots this Saturday" |

### Slimming
| Day | Post Theme | Story Theme |
|-----|-----------|-------------|
| Mon | Motivation Monday -- validation, "you're not alone" | Katya's tip -- weekly wellness tip from persona |
| Tue | Technology Tuesday -- FDA-cleared tech spotlight | How it works -- educational, demystify treatments |
| Wed | Wellness Wednesday -- holistic health tips, nutrition | Real talk -- normalise the journey, no shame |
| Thu | Results Thursday -- client journey (compassionate framing) | Q&A -- common questions, myth busting |
| Fri | Feel Good Friday -- body confidence, positive messaging | Weekend self-care -- "small steps this weekend" |

---

## Pillar-to-Day Mapping

When populating the calendar, map content pillars to daily themes to maintain ratio compliance:

| Pillar | Best Days (Spa) | Best Days (Aes) | Best Days (Slim) |
|--------|----------------|-----------------|-----------------|
| Pain-Solution | Mon, Wed | Mon, Tue | Mon, Wed |
| Hooked Insight | Tue | Wed | Tue |
| Objection Flip | Thu | Wed, Thu | Thu |
| Viral Replication | Fri | Fri | Fri |
| Behind-the-Clinic | -- | -- | Tue, Thu |

**Each week should touch at least 3 different pillars.** Never repeat the same pillar on consecutive days.

---

## Spreadsheet Entry Format

In the SMM Post and SMM Story rows, write a short descriptor for each day:

```
Post examples:
  "Wellness Monday: 5 self-care rituals"
  "Treatment Spotlight: Couples Package"
  "Glow Friday: Summer confidence"

Story examples:
  "BTS: Morning spa setup"
  "Poll: Favourite treatment?"
  "Katya's Tip: Hydration"
```

Keep entries concise (under 50 characters) -- they're calendar labels, not full copy.

---

## Voice Check Quick Reference (from social-media-content-strategy)

Before writing any SMM content, verify:

**All Brands:**
- Hook is scroll-stopping (not generic)
- Copy speaks directly to her (second person "you")
- No em-dashes (use commas or full stops)
- UK spelling throughout

**Spa:** Sensory language present, permission-giving tone, no clinical framing
**Aesthetics:** Confident and reassuring, natural-looking results, consultation-first
**Slimming:** Validates her experience first, no shame/blame/guilt, emotional journey present

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Posting on weekends without reason | Mon-Fri only unless special occasion. |
| Same theme every day | Follow the daily rotation per brand. |
| Missing stories | Stories are separate from posts. Both rows need entries. |
| Slimming content using shame language | Always compassionate. "You're not alone" not "fix yourself." |
| Too-long cell entries | Keep to ~50 characters. These are labels, not captions. |
| Same pillar every day | Follow the ratio from the pillar overview table. |
| Planning SMM without pillar files | ALWAYS invoke social-media-content-strategy. It loads brand-specific pillar files with hook templates and sub-topics. |
| Ignoring pillar ratios | Check the percentage split. Pain-Solution should be ~25-30%, not 80%. |
| Writing generic hooks | Start from the sub-topic's hook templates in the pillar file. |
