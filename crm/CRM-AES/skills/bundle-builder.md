# [SALES] Bundle Builder

> **Invoke When:** (Medical Aesthetics Edition) The patient has multiple concerns or a multi-phase treatment path is indicated ("she wants to address lines AND volume loss"), patient asks "what would you recommend?", a progressive treatment sequence is identified, or the patient would benefit from understanding how treatments complement each other. **In medical aesthetics, bundles are treatment PLANS, not spa day packages. They address clinical progression and patient psychology about results, not just financial savings.**

---

## Research Foundation — Medical Aesthetics Edition

Three evidence-based frameworks underpin bundling in medical aesthetics. In this context, bundling is not just about price — it's about clinical sequencing, psychological readiness, and treatment efficacy.

**1. Anchoring & Progressive Treatment Psychology**
Ariely's anchoring principle applies, but with clinical modification: In medical aesthetics, the "anchor" is not just a number. It's the first treatment and the patient's response to it. The sequence matters. Conservative first treatments build confidence for follow-up treatments. Patients who start with a small procedure and see natural results are more willing to invest in complementary treatments. Presenting treatment sequencing as "Phase 1, Phase 2" with specific clinical rationales is vastly more persuasive than presenting a menu. The anchoring here is medical logic, not just price contrast.

**2. Clinical Efficacy & Synergy — Medical Evidence**
In medical aesthetics, combining treatments often produces exponentially better results than isolated treatments. Example: Botox alone is good; Botox + filler for volume restoration is transformative. Laser + skincare protocol gives sustained results. The bundle is not a sales device — it's clinical best practice. Presenting treatments as a coordinated plan signals medical expertise and increases perceived value through clinical logic, not just price anchoring.

**3. Patient Psychology of Medical Progression — Results & Confidence Building**
Research on medical aesthetics patient satisfaction shows: Patients who follow a recommended treatment sequence and see progressive results have significantly higher lifetime value and satisfaction than "one-shot" procedure patients. The bundled, phased approach:
- Reduces fear of over-treatment (starting conservative)
- Builds confidence through visible results
- Creates natural touch points for follow-up care
- Improves clinical outcomes through synergy
The bundle is not about maximizing the initial transaction — it's about establishing a long-term care relationship.

---

## Overview — Medical Aesthetics Edition

A medical aesthetics treatment plan that is presented as a coordinated, progressive journey feels profoundly different from isolated, reactive booking-by-booking appointments.

The first feels like expert care with a clear path forward. The second feels like guesswork and hesitation.

This is the central psychology the bundle builder works with in medical aesthetics. When a patient books individual treatments separately, she holds multiple decisions in her head and experiences multiple moments of uncertainty. When the same treatments are presented as a recommended PLAN — with clinical sequencing, expected outcomes, and transparent pricing — she holds one clear vision and makes one informed decision. She feels that Carisma understands her comprehensive needs and has a clinical strategy, not just selling individual procedures.

In medical aesthetics, the bundle is NOT a discount play. It is a clinical recommendation backed by medical logic.

The bundle builder exists for one purpose: to turn a multi-concern patient into one who commits to a coordinated treatment plan — and feels confident in the clinical strategy, not just booking because she was sold to.

**What this skill is not:** It is not a way to upsell multiple procedures at a patient who expressed one clear need. It is for patients whose situation genuinely calls for multiple elements. Using it incorrectly — building a plan around a patient who clearly expressed wanting one focused treatment — creates pressure and damages trust. Read the clinical picture first.

---

## When to Use — Medical Aesthetics Edition

Activate this skill when any of the following signals appear:

**The patient explicitly signals multiple concerns or asks for a plan:**
- "I'm concerned about lines AND I feel like I've lost volume"
- "What would you recommend to refresh my whole face?"
- "I want to see results, but I'm nervous about looking overdone"
- "Can you create a plan? I want to start conservative and build"
- "What's the best approach for what I'm describing?"
- "I want to address this, but I'm not sure if injectables alone will do it"

**The agent identifies a multi-phase treatment opportunity:**
- Patient describes fine lines AND mentions wanting radiant skin → Micro-Botox + Skin quality treatment (laser)
- Patient describes volume loss AND fine lines → Filler + Botox, sequenced
- Patient describes aging concern AND expresses fear of looking overdone → Conservative Phase 1, potential Phase 2
- Patient is first-timer and nervous → Educational introduction to conservative progression
- Patient wants natural results → Build a "subtle enhancement" plan that shows restraint

**The clinical question is asked:**
- "What would you recommend?"
- "What's the best starting point?"
- "How would you approach this?"
- "Can we do something that looks natural?"
- "What's your philosophy on treatment sequencing?"

**Do NOT use this skill when:**
- The patient has a single, clear concern (deep forehead lines → Botox only; this is the right answer, not upsell into more)
- The patient has explicitly expressed wanting one treatment only ("I just want Botox")
- The patient has signalled budget constraints that don't accommodate multi-phase treatment
- The patient has expressed fear of over-treatment or pressure (they need reassurance, not bundling)
- Clinical appropriateness does not support it (e.g., patient not yet ready for progression)

---

## The Bundle Builder Process

### Step 1: Scan — Agent Briefs Claude

The agent passes Claude a structured context note. This does not need to be formal — a few sentences is enough. The goal is to give Claude what it needs to build the right experience.

**Agent prompt format:**

```
Bundle request:
- Primary need: [what she explicitly asked for]
- Secondary interest: [what she mentioned or what the agent noticed]
- Occasion: [birthday / anniversary / honeymoon / solo day / group / none mentioned]
- Hotel: [which hotel / day visitor]
- Experience level: [first-timer / returning guest / unknown]
- Approximate budget signal: [if any — "seems comfortable", "asked about cheaper options", "no signal"]
- Any constraints: [time, physical limitations, pregnancy, etc.]
```

Even three lines of context is enough. Claude will work with what it has.

---

### Step 2: Match — Claude Scans the Knowledge Base

Claude checks the following before building:

- **Treatment catalogue**: Available treatments, durations, and individual prices
- **Seasonal or active promotions**: Anything currently active that is relevant (from `seasonal-promotions.md` if available)
- **Couples and shared experiences**: Any co-treatment options applicable (from `couples-and-shared.md` if available)
- **Occasion relevance**: Whether the occasion signals a specific archetype (see Bundle Archetypes below)
- **Presenter's paradox check**: Does every proposed element belong at the same quality tier?

If the knowledge base files are not accessible in this session, Claude builds the experience using the pricing architecture established in `consult-and-pitch.md` (individual treatments: €60–€180; experiences: €120–€280) and the archetypes below.

---

### Step 3: Build — The Experience Formula

Every crafted experience is built on this formula:

```
CORE TREATMENT (addresses the primary need)
  + ENHANCEMENT (an upgrade to the core — deeper, longer, or richer)
  + COMPLEMENT (addresses the secondary need or adds an occasion element)
  + OCCASION TOUCH (if relevant — champagne, rose petals, a dedicated suite, a gift)
  ──────────────────────────────────────────────────────────────
  INDIVIDUAL TOTAL: €[sum of all parts at full price]
  EXPERIENCE PRICE: €[unified price, lower than individual total]
  THE DIFFERENCE: €[saving] — framed as a gift, not a discount
```

**The naming step:** Before writing the pitch, give the experience a name. Not a product name — a moment name. Something specific to this customer and this occasion.

Examples:
- "The Sunday Restoration" (solo guest, stressed, full afternoon)
- "The Anniversary Evening" (couple, marking a year together)
- "Your First Full Day" (first-timer, open afternoon, first-timer energy)
- "The Celebration Journey" (birthday guest, group energy, champagne mood)

The name is not used as a sales label. It is used internally to anchor the pitch tone, and optionally shared with the customer as "I have put something together for you — I am thinking of it as your [name]."

---

### Step 4: Pitch — Draft in Carisma Voice

Claude drafts the complete message, ready for the agent to send directly or adapt minimally. The pitch structure always follows this arc:

1. **Acknowledge her situation** — name what she described, make her feel heard
2. **Introduce the experience by occasion/feeling, not by name** — "I have been thinking about what would suit your afternoon..."
3. **Paint the arc** — describe the experience as a journey from arrival to departure, in present tense
4. **Reveal the individual-parts price (the anchor)** — "Individually, these would come to..."
5. **Reveal the experience price** — "As a complete experience, [price]"
6. **Name the saving as a gift** — "That is €[X] you keep — I wanted to make sure it felt right"
7. **Soft close** — one clear, friction-free next step

The pitch is written for WhatsApp / DM by default (warm, conversational, not too long). Agents adapt length for email (fuller) or live chat (shorter).

---

## Bundle Archetypes

Five pre-built experience frames for the most common multi-need scenarios. Use these as starting points — personalise every pitch.

---

### Archetype 1: The Couple's Journey

**For:** Two people visiting together — anniversary, honeymoon, Valentine's Day, a spontaneous romantic afternoon

**What it includes:**
- Side-by-side couples treatment (full body, 60–90 min) — the centrepiece
- Shared thermal circuit access before treatment (minimum 30 min, sauna, steam, hydrotherapy pool)
- Champagne or sparkling welcome on arrival
- Extended relaxation time together after treatment, in a dedicated quiet space
- Optional: rose petal room setup, a small gift of a Carisma product to take home

**Individual parts price:** Approximately €180–€240 (two treatments + facilities + champagne separately)
**Experience price:** Approximately €210–€260 (as a complete journey)
**The gift:** €20–€40 — framed as "a detail I wanted to include, at no extra cost"

**Pitch angle:** The experience arc — "You arrive together, the world slips away, and you leave the same way — only lighter."

**Pitch script:**

"For what you are describing — [anniversary / being in Malta together / a moment just for the two of you] — I have been thinking about something a little more complete than a single booking.

What I have in mind begins before the treatment even starts. You would arrive to a space that has been prepared for you — warmth, stillness, a glass of something cold. From there, you move into our thermal facilities together, letting the day unwind before the real work begins. Then a full couples treatment — both of you, the same room, attended to simultaneously.

After, there is no rush. The relaxation space is yours for as long as you need it.

Individually, these elements would come to €[X]. As the complete experience I have described — €[Y]. That is €[Z] I wanted to make sure stayed in your pocket.

When were you thinking of coming? I would love to hold something for you."

*Peacefully,*
*Sarah*

---

### Archetype 2: The Solo Restoration

**For:** A guest coming alone who has described being overwhelmed, burned out, or in need of a genuine reset — not a quick treatment, a full pause

**What it includes:**
- Primary body treatment (deep relaxation or deep tissue, 90 min — the centrepiece)
- Thermal circuit access before treatment (45 min — warms the muscle, primes the mind)
- Scalp ritual or warm oil hair treatment (30 min — often dismissed, always transformative)
- Post-treatment rest in the silent room with herbal tea and a light snack

**Individual parts price:** Approximately €160–€200
**Experience price:** Approximately €175–€210
**The gift:** €15–€30

**Pitch angle:** The full permission slip — "You do not need to manage anything today. We have done that already."

**Pitch script:**

"Everything you have described tells me this is not an afternoon for a single treatment and a quick exit. What your body is asking for is a proper pause.

Here is what I would suggest.

You arrive with nothing to arrange — it is all in place. Before the treatment begins, you spend time in the thermal space: the warmth of the sauna, the still water of the pool, the steam that asks nothing of you. By the time you reach the treatment room, you have already started to let go.

Ninety minutes of unhurried, intentional work through the full body. And then — the part most people remember most — the quiet room afterwards, with a cup of something warm and no reason to move.

Individually, these come to €[X]. As the day I am describing — €[Y].

This is a complete experience. Nothing missing, nothing to add.

Shall I find you a time?"

*Peacefully,*
*Sarah*

---

### Archetype 3: The Special Occasion Day

**For:** A birthday, anniversary, hen party for one, "I deserve this" visit — any occasion where the customer has named a reason to celebrate

**What it includes:**
- Signature facial or body treatment of her choice (60–75 min)
- Champagne or celebratory welcome ritual on arrival
- Occasion touch in the treatment room (candles, flowers, a handwritten card — all prepared before arrival)
- A small Carisma product to take home (a ritual to continue)
- Optional upgrade: thermal circuit access or a second express treatment

**Individual parts price:** Approximately €130–€180
**Experience price:** Approximately €140–€190
**The gift:** €15–€30 — presented as "we wanted to mark the occasion properly"

**Pitch angle:** The occasion deserves a proper frame — "A birthday is not a Tuesday. I want to make sure we treat it as the day it is."

**Pitch script:**

"A [birthday / anniversary / the fact that you finally said yes to yourself] is not something to mark with a standard booking.

What I would like to put together for you begins the moment you arrive — a small ritual of welcome that says this day is different. The treatment itself is [chosen treatment], and the space will be prepared for you: warm, quiet, and yours.

There is something to take home with you too — a small piece of Carisma to keep the feeling alive when you are back in the world.

The individual elements here would be €[X] if booked separately. As the occasion experience — €[Y]. The difference is the detail, and the detail matters on a day like this.

When is the day? I would love to have everything ready for you."

*Peacefully,*
*Sarah*

---

### Archetype 4: The First Full Experience

**For:** A first-time visitor who has never been to Carisma (or to a luxury spa at this level) and has indicated openness to a full experience — or an agent who senses this is the right introduction

**What it includes:**
- Signature Carisma Journey (the hero treatment — full body, 60–75 min, multi-element)
- Thermal circuit access (45 min before treatment — introduces the full ritual space)
- Brief orientation on arrival — a team member walks her through the space, removes all uncertainty
- Herbal tea and seated rest after the treatment

**Individual parts price:** Approximately €140–€180
**Experience price:** Approximately €150–€185
**The gift:** €10–€25

**Pitch angle:** The complete introduction — "Carisma is more than a treatment room. I want to make sure you feel the whole of it."

**Pitch script:**

"For a first visit — especially here — I would love to make sure you experience what Carisma actually is, not just one part of it.

What I have in mind starts before the treatment. You arrive, and rather than being handed a robe and pointed to a changing room, someone walks you through the space — the thermal facilities, the relaxation areas, the quieter corners that most guests take two or three visits to discover. Then the treatment: our Signature Journey, which is designed precisely as a first experience. Multi-element, complete, and nothing you need to prepare for.

Afterwards, the quiet room is yours. There is no hurry at the end.

If you booked these elements separately, you would be looking at €[X]. As the complete first experience I have described — €[Y].

For a first time, this is what I would want for you.

Shall I check what is available?"

*Peacefully,*
*Sarah*

---

### Archetype 5: The Group Celebration

**For:** A group of three or more — hen party, birthday group, girls' trip, corporate wellness group

**What it includes:**
- Individual treatment for each guest (tailored per person where possible, or a standardised group treatment)
- Access to a private or semi-private relaxation area for the group
- A shared celebratory moment — champagne, a light grazing platter, or a toast ritual
- A group coordinator (one named point of contact for the day, removing all logistics from the guests)
- Optional: a group activity element — a guided meditation, a skin consultation bar, a nail finishing station

**Individual parts price:** Varies by group size — typically €80–€120 per person for treatments + extras
**Experience price:** Group rate, typically 10–15% below individual sum
**The gift:** Framed as "for a group of [X], we are able to offer the complete day at €[Y per person] — everything included"

**Pitch angle:** One experience, zero logistics — "You focus on the occasion. We take care of everything else."

**Pitch script:**

"For a group like yours, the most important thing — more than any individual treatment — is that you all arrive somewhere that is already ready for you, and that someone is handling every detail so that no one in the group has to be the organiser.

Here is what I have in mind.

Each of you would have [treatment description]. You would have access to [private space or relaxation area] together — a place to gather before and after that is yours for the afternoon. And at [a named moment in the day], we would bring [champagne / the platter / the ritual] to you, as a group.

For a group of [X], individually this would come to €[total individual price]. As the complete group experience — €[Y] per person.

The difference is not just the cost — it is the fact that you arrive as guests, and leave as guests, without anyone having had to coordinate a thing.

How many of you are coming, and when were you thinking?"

*Peacefully,*
*Sarah*

---

## Script Bank — Carisma Voice

Eight complete scripts, ready to send or adapt. Every script is written in Carisma voice: warm, poetic, specific, and never transactional.

---

### Script 1 — The Couple's Journey Opener

**Use when:** A customer mentions two people, a romantic occasion, or "we were thinking of doing something together."

---

"There is something quite beautiful about two people choosing this together.

Before I suggest anything, can I ask — is this a particular moment you are marking, or simply the kind of afternoon that does not happen often enough?

Either way, I have something in mind. I just want to make sure it fits."

*Peacefully,*
*Sarah*

---

### Script 2 — The Full-Day Experience Pitch

**Use when:** Customer has a full afternoon or day free and has indicated openness to more than a single treatment.

---

"You have given yourself a proper amount of time — and that changes what is possible.

Rather than suggesting a single treatment and sending you on your way, I would like to offer something that uses the full arc of your afternoon.

It begins in the thermal space — warmth, water, and quiet — before moving into a full body treatment. After, there is no rush. The rest of the day belongs to you, in a space designed for exactly this.

Individually, the elements of what I have described would come to €[X]. As a complete, uninterrupted day — €[Y].

When were you thinking of coming?"

*Peacefully,*
*Sarah*

---

### Script 3 — "Best Value for What You've Described" Opener

**Use when:** The customer has directly asked "what's the best value?" or "what would you recommend if I want to make the most of my time?"

---

"The best value I can offer you is not a lower price — it is making sure that every hour you spend here is working for you.

Based on what you have described, I have been putting something together.

Your visit would include [core treatment], which addresses [her primary need]. Your experience also includes [complement], which means by the time you leave, you have covered [secondary benefit] as well — something that would otherwise require a separate visit.

Separately, you would pay €[X] for these. Together, as one experience — €[Y].

Shall I share the detail?"

*Peacefully,*
*Sarah*

---

### Script 4 — Occasion Bundle Pitch (Birthday or Anniversary)

**Use when:** A customer has named an occasion — birthday, anniversary, honeymoon, first trip together.

---

"A [birthday / anniversary] changes what the right answer looks like.

On an ordinary afternoon, a single treatment is sometimes exactly right. On a day like this, the experience should have a shape — a beginning, a full middle, and an ending that stays with you.

What I have in mind for [her name / you] begins with [arrival ritual]. From there — [treatment description]. Your experience also includes [complement or occasion touch], which I wanted to be in place before you arrived.

The elements, priced individually, would be €[X]. As the [occasion] experience I have described — €[Y].

I would love to hold this for you. When is the day?"

*Peacefully,*
*Sarah*

---

### Script 5 — Group Booking Bundle Pitch

**Use when:** A group inquiry arrives and the customer is asking how to structure the visit.

---

"For a group, the most important thing is that nobody ends the day feeling like they spent it organising the day.

Here is what I can put together.

Each of your guests would have [individual treatment]. You would have access to [group space] together throughout — before, during, and after. And at [named moment], we will bring [champagne / the occasion touch] to you as a group.

For [X] people, the individual cost would be €[total]. As the complete group experience — €[Y per person], everything included.

Who would I be coordinating with, and when is the celebration?"

*Peacefully,*
*Sarah*

---

### Script 6 — First-Timer Complete Experience Pitch

**Use when:** The customer has indicated (or the agent has identified) that this is a first visit and there is openness to a full experience.

---

"I want to make sure your first time with us is the full thing — not just a treatment, but an understanding of what this place actually is.

What I have in mind starts with the thermal space: warmth, water, the kind of quiet that a day in the world rarely offers. From there, you move into our Signature Journey — designed precisely as a first experience. Complete, unhurried, and nothing required of you.

Afterwards, the quiet room is yours.

Individually, €[X]. As the full introduction — €[Y].

This is what I would want for a first visit.

Shall I look at availability?"

*Peacefully,*
*Sarah*

---

### Script 7 — Individual-to-Experience Upgrade Pivot

**Use when:** A customer has already named one treatment and the agent sees an opportunity to broaden to a fuller experience.

---

"The [treatment she named] is a beautiful choice — and there is a version of this afternoon that I think would make even more sense for what you have described.

If you were open to arriving a little earlier, your experience also includes our thermal facilities before the treatment, which most guests tell us changes the quality of what comes after. The [treatment] works more deeply when the body has already let go of the first layer.

Adding that access, the full afternoon would come to €[X] individually. As one experience — €[Y].

It is entirely your choice — the [treatment] alone is wonderful. But if you have the time, the full arc is where this place really shows itself."

*Peacefully,*
*Sarah*

---

### Script 8 — Graceful Response if the Experience is Declined

**Use when:** The customer has heard the experience pitch and opted for the simpler, single-treatment booking instead.

---

"Of course — the [chosen treatment] is exactly right for that.

Let me find you the best available time.

And if at any point during your visit you would like to extend the afternoon, just let any member of our team know — we are always happy to see what we can arrange for you on the day.

Looking forward to welcoming you."

*Peacefully,*
*Sarah*

*Note: No pressure. No re-pitch. She has chosen. Close warmly and move to logistics. The graceful exit preserves the relationship and often results in an in-spa upgrade or a future return at the fuller experience level.*

---

## The Anchoring Formula

This is the single most important technique in the bundle builder. Use it in every experience pitch, without exception.

**The formula in three steps:**

**Step 1 — Paint the experience first (before any price is mentioned)**
Describe what the customer will experience in full sensory and emotional terms. Let her feel the day in her body before she knows what it costs. The mental purchase happens here. Price has not entered the conversation yet.

**Step 2 — Anchor with the individual-parts total**
"If you were to book each of these separately, the total would be €[X]."
This number — the sum of parts — becomes the reference point. It is always shown first. It is always true (do not inflate it). Its purpose is to make the experience price feel rational by contrast.

**Step 3 — Reveal the experience price as a conclusion**
"As the complete [name of experience] — €[Y]."
Then: "That is €[Z] I wanted to make sure stayed with you."
Or: "Your experience also includes [final detail] — at no addition."

**Example of the formula in full:**

---
"The day I have in mind begins with forty-five minutes in the thermal space — the sauna, the steam room, the hydrotherapy pool — before moving into ninety minutes of full-body treatment using warm oils and long, unhurried strokes. After, the quiet room is yours, with herbal tea and no reason to move.

If you were to book each of these separately — the thermal access at €45, the treatment at €140, the relaxation room at €20 — you would be looking at €205.

As the complete afternoon I have described — €175.

The difference is €30 I wanted to make sure felt like what it is: a gift, not a calculation."

---

**The rules of the anchoring formula:**
- Never lead with the experience price. Always anchor first.
- The individual-parts total must be honest. Do not invent inflated retail prices.
- The saving is always framed as a gift or a consideration — never as a discount, a deal, or a promotion.
- State the saving explicitly. Do not leave the customer to calculate it. Name it, and name what it is.
- If the experience price is identical to the individual-parts total (e.g. when the saving is embedded in an occasion touch rather than a price reduction), frame the value differently: "At the same price, your experience also includes [occasion element] — which I wanted to be in place for you."

---

## Quick Decision Reference

| Customer signal | Likely archetype | Pitch approach | Lead script |
|---|---|---|---|
| "We want to do something together" / couple / romantic occasion | The Couple's Journey | Paint the shared arc; anchor on combined individual prices | Script 1 or Script 4 |
| "I have the whole afternoon free" / "I want to make the most of the day" | The Solo Restoration | Full-day arc; permission to receive without managing | Script 2 |
| "What's the best value?" / "What do you recommend for the full experience?" | Depends on profile — default to Solo Restoration or First Full Experience | Lead with outcome, not price; anchor individual total, reveal experience price | Script 3 |
| "It's my birthday" / "our anniversary" / "honeymoon" | The Special Occasion Day (solo) or The Couple's Journey | Lead with occasion acknowledgment; shape must have a beginning and an ending | Script 4 |
| "There are a few of us" / group inquiry | The Group Celebration | Lead with logistics relief; per-person pricing; name the group coordinator offer | Script 5 |
| First-timer, open to being guided | The First Full Experience | Lead with the orientation offer; "I want you to see the whole of it" | Script 6 |
| Customer has already named one treatment but there is a clear second need | Individual-to-Experience upgrade | Pivot from the named treatment; introduce the addition as an enhancement, not a replacement | Script 7 |
| Customer declines the experience and opts for single treatment | — | Close warmly; suggest in-spa upgrade option on the day | Script 8 |

---

## What NOT to Do

**1. Use the word "bundle", "deal", "package", or "discount" as the primary frame.**
These are retail words. They signal a transaction. Say "experience", "journey", "complete afternoon", "crafted for you". The language determines the frame. The frame determines the perceived value.

**2. Lead with the price.**
If the first number the customer sees is the experience price, the anchor does not exist. The contrast that makes the price feel like a gift disappears. Always paint the experience first. Always anchor with the individual total. Always reveal the experience price last.

**3. Say "and we'll throw in..."**
This phrase signals improvisation and discounting. It makes the included element feel like a leftover, not a feature. Use: "your experience also includes...", "which includes...", "I have also arranged...". Every element was chosen. Present it that way.

**4. Stack a low-quality element with high-quality ones.**
The presenter's paradox is real: adding an element that feels cheap to a luxury bundle reduces the perceived value of the entire experience. If an add-on does not belong at the same tier, do not include it. Fewer premium elements beat more mixed-tier elements every time.

**5. Offer more than two experience options.**
Present one crafted experience. If she pushes back on price or scope, offer one alternative. Never present three or more options — this transfers the decision burden back to the customer and eliminates the "I know what's right for you" confidence that makes the pitch work.

**6. Re-pitch after a graceful decline.**
If the customer chooses a single treatment after the experience has been presented, close warmly and move to logistics. A second pitch signals that the first was not a recommendation — it was a sales script. The relationship is more valuable than the upgrade.

**7. Frame the saving as a discount.**
"We normally charge €200 but you only pay €170" positions Carisma as a shop with a sale rack. The saving is not a markdown. It is a consideration — something given because the complete experience is worth offering as a whole. "That is €30 I wanted to make sure stayed with you" communicates the same saving in a way that feels like care, not commerce.

**8. Name the experience something generic.**
"The Spa Package" is not an experience name. "Your Anniversary Morning" is. Naming creates ownership. A customer who hears the name of what has been crafted for her is already partially committed before she has said yes.

---

## Sarah's Signature Moves

Three advanced techniques that elevate a competent bundle pitch into a distinctly Carisma one.

---

### Signature Move 1: The "Crafted for You" Personalisation Frame

Before presenting the experience, Sarah uses one sentence to signal that what is coming was not retrieved from a list — it was assembled with this specific customer in mind.

**The phrase:** "Based on everything you have shared, I have been putting something together for you."

Or: "I have been thinking about what your afternoon could look like. Can I share it?"

Or: "What you have described points me toward something specific. Give me a moment — I want to make sure it is right before I suggest it."

The pause (even in text — a short delay before the next message, or an ellipsis) signals deliberation. The customer feels attended to. The recommendation that follows lands not as a product but as a considered gift.

This technique requires no additional information to execute. It is pure frame. But it changes the entire psychological posture of what follows.

---

### Signature Move 2: The Experience Arc — Arrival to Departure

Most pitches describe treatments in isolation. Sarah describes the full shape of the day — from the moment of arrival to the moment of departure — as a continuous, curated arc. The customer does not experience a list of services. She experiences a story.

**How to construct the arc:**

- **Opening:** Arrival (what greets her — warmth, a face, a ritual, no decisions required)
- **First movement:** The thermal space or preparation phase (the world slows down)
- **Centrepiece:** The treatment (the heart of the day)
- **Closing:** The rest (the quiet room, the tea, the unrequested time)
- **Coda:** The departure (she leaves different — lighter, restored, carrying something)

**Example arc sentence:** "You arrive, and the day is already arranged. You move through warmth before the treatment begins. Ninety minutes later, there is no hurry. The quiet room is yours. By the time you leave, you have had a complete day — not a booking."

The arc matters because it answers the question a customer is always asking but rarely says aloud: "What will this actually feel like?" Treatments are abstract. A day with a shape is concrete and desirable.

---

### Signature Move 3: The Named Moment

Every crafted experience gets a name in the pitch — not a product code or a formal package title, but a moment name: something that captures what this particular afternoon is.

The name is offered in passing, not announced. It is woven into the pitch as if it has always existed for her.

**Examples:**
- "I am thinking of this as your Sunday Restoration — a full afternoon that asks nothing of you."
- "What I have in mind feels like a proper Anniversary Morning — unhurried, complete, and made for two."
- "This is your First Full Day with us — designed to introduce you to the whole of what we are."
- "For a group like yours, I think of this as The Celebration Afternoon — everything arranged, everyone attended to."

The named moment does three things:
1. It signals bespoke creation — this was made for her
2. It creates psychological ownership before commitment — she is already thinking of "my Sunday Restoration"
3. It elevates the entire conversation from a service inquiry to a pre-experience — she is already inside it

Use it once, naturally, and let it land. Do not repeat the name insistently. Its job is done the moment it creates a flicker of recognition — "yes, that is exactly what this is."

---

*Skill maintained by: Sarah / Carisma Aesthetics*
*Last reviewed: 2026-02-22 [OPTIMIZED FOR MEDICAL AESTHETICS]*
*Applies to: WhatsApp, Facebook DM, Instagram DM, Email, Live Chat*
*Primary goal: Convert multi-concern patients into coordinated treatment PLANS that show clinical expertise, not just sales bundling*
*Target average order value per visit: €250–€500 (first phase); €100–€300 per follow-up visit (progressive plan)*
*Estimated coverage: 25–35% of all inbound Aesthetics interactions (high % due to multi-concern nature of aesthetic goals)*
*CRITICAL MEDICAL ETHICS: Bundle builder is a clinical tool, not just sales. Never bundle to maximize revenue — bundle to demonstrate best clinical approach. Conservative-first philosophy always.*
*Companion skill: [CONSULT] Consult & Pitch (for diagnostic); [SALES] Upsell Booking (for add-ons within a booking)*

---

## Edge Cases Discovered

> Updated when this skill encounters scenarios it didn't handle well.
> Log full context in `miscellaneous/learnings/LEARNINGS.md` under Skill Learnings.

<!--
Entry format:
- **[YYYY-MM-DD]**: Customer asked [X], skill responded [Y], should have [Z].
  Rule added: ALWAYS/NEVER [directive]
-->

_No edge cases logged yet._
