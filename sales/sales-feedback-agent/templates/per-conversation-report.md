# Per-Conversation Feedback Report

Template for the feedback delivered to a rep after every scored conversation. Two versions: a compact WhatsApp format and a full email format.

---

## WhatsApp Version (Under 2000 Characters)

The WhatsApp version is the primary delivery format. It must be scannable on a mobile screen, use emojis as visual anchors, and stay under 2000 characters total.

### Template

```
{rep_name} -- {brand} {channel} Review
{date} | {scenario_type}

{overall_score}/100 {score_label} {score_emoji}

-- Scores --
{dim1_emoji} Script Compliance: {dim1_score}/10
{dim2_emoji} Brand Voice: {dim2_score}/10
{dim3_emoji} Discovery: {dim3_score}/10
{dim4_emoji} Objection Handling: {dim4_score}/10
{dim5_emoji} Close: {dim5_score}/10
{dim6_emoji} Follow-Up: {dim6_score}/10

{strength_emoji} What you nailed:
{top_strength_summary}
"{top_strength_quote}"

{improve_emoji} Work on this:
1. {improvement_1_title}
You said: "{improvement_1_quote}"
Try instead: "{improvement_1_script}"

2. {improvement_2_title}
You said: "{improvement_2_quote}"
Try instead: "{improvement_2_script}"

{domain_emoji} Domain accuracy: {domain_status}
{brand_emoji} Brand compliance: {brand_status}

Keep going -- you're {encouragement_line}
```

### Variable Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `{rep_name}` | Rep's first name | Maria |
| `{brand}` | Carisma brand | Carisma Aesthetics |
| `{channel}` | Conversation channel | WhatsApp / Phone / Email / In-Person |
| `{date}` | Conversation date | 14 Apr 2026 |
| `{scenario_type}` | Type of interaction | New Lead / Follow-Up / Consultation / Rebook / Objection Recovery |
| `{overall_score}` | Composite score out of 100 | 74 |
| `{score_label}` | Label based on score range | Elite / Strong / Developing / Needs Improvement / Critical |
| `{score_emoji}` | Visual indicator for score tier | See emoji mapping below |
| `{dim1_score}` through `{dim6_score}` | Per-dimension score (1-10) | 7 |
| `{dim1_emoji}` through `{dim6_emoji}` | Per-dimension color indicator | See emoji mapping below |
| `{top_strength_summary}` | 1-sentence description of what the rep did well | Warm, name-first greeting that made the patient feel expected |
| `{top_strength_quote}` | Direct quote from the conversation showing the strength | Welcome! You must be Anna -- we've been looking forward to meeting you. |
| `{improvement_1_title}` | Short label for improvement area | Discovery depth |
| `{improvement_1_quote}` | Direct quote showing the missed moment | So you're interested in Botox? |
| `{improvement_1_script}` | Suggested alternative script | What specific concerns have you noticed lately that you'd like to improve? |
| `{improvement_2_title}` | Short label for second improvement area | Closing with next step |
| `{improvement_2_quote}` | Direct quote from conversation | Let me know if you want to book |
| `{improvement_2_script}` | Suggested alternative script | What day and time usually works best for you? I'll get you booked in right now. |
| `{domain_status}` | Pass or fail with detail | Pass / Fail -- stated 6 sessions needed, protocol requires 8 |
| `{brand_status}` | Pass or fail | Pass / Fail -- used "cheap" instead of "accessible" |
| `{encouragement_line}` | Personalized closing note based on trend | improving every week / building great habits / on the right track |

### Emoji Mapping

**Overall score:**

| Score Range | Label | Emoji |
|-------------|-------|-------|
| 80-100 | Elite | star |
| 65-79 | Strong | green circle |
| 50-64 | Developing | yellow circle |
| 30-49 | Needs Improvement | orange circle |
| 0-29 | Critical | red circle |

**Per-dimension scores:**

| Score | Emoji |
|-------|-------|
| 8-10 | green square |
| 5-7 | yellow square |
| 1-4 | red square |

**Section markers:**

| Section | Emoji |
|---------|-------|
| Top Strength | green checkmark |
| Improvement Areas | wrench |
| Domain accuracy | stethoscope |
| Brand compliance | paintbrush |

---

## Email Version (Full Report)

The email version is a longer, more detailed report sent to the rep (with a CC to their manager). It includes everything in the WhatsApp version plus expanded coaching commentary.

### Template

```
Subject: Sales Review -- {rep_name} -- {brand} {channel} -- {date} ({overall_score}/100 {score_label})

---

SALES CONVERSATION REVIEW

Rep: {rep_name}
Brand: {brand}
Channel: {channel}
Date: {date}
Scenario: {scenario_type}
Conversation ID: {conversation_id}

---

OVERALL SCORE: {overall_score}/100 -- {score_label}

---

DIMENSION BREAKDOWN

1. Script Compliance ({dim1_weight}% weight): {dim1_score}/10
   {dim1_explanation}

2. Brand Voice & Positioning ({dim2_weight}% weight): {dim2_score}/10
   {dim2_explanation}

3. Discovery & Needs Assessment ({dim3_weight}% weight): {dim3_score}/10
   {dim3_explanation}

4. Objection Handling & Persuasion ({dim4_weight}% weight): {dim4_score}/10
   {dim4_explanation}

5. Close & Next Steps ({dim5_weight}% weight): {dim5_score}/10
   {dim5_explanation}

6. Follow-Up & Re-engagement ({dim6_weight}% weight): {dim6_score}/10
   {dim6_explanation}

---

TOP STRENGTH

{top_strength_summary}

Quote from the conversation:
> "{top_strength_quote}"

Why this matters: {top_strength_impact}

---

IMPROVEMENT AREA #1: {improvement_1_title}

What happened:
> "{improvement_1_quote}"

Why this matters:
{improvement_1_impact}

What to do instead:
{improvement_1_coaching}

Suggested script:
> "{improvement_1_script}"

---

IMPROVEMENT AREA #2: {improvement_2_title}

What happened:
> "{improvement_2_quote}"

Why this matters:
{improvement_2_impact}

What to do instead:
{improvement_2_coaching}

Suggested script:
> "{improvement_2_script}"

---

DOMAIN ACCURACY CHECK

Status: {domain_status}
{domain_details}

---

BRAND COMPLIANCE CHECK

Status: {brand_status}
{brand_details}

---

CHECKLIST SUMMARY

Script Compliance Hits:
{script_checklist}

Discovery Checklist:
{discovery_checklist}

Close Checklist:
{close_checklist}

---

This feedback was generated by the Sales Feedback Agent.
Questions? Reply to this message or speak with your manager.
```

### Additional Email Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{conversation_id}` | Unique ID for this conversation | WA-AES-20260414-0023 |
| `{dim1_weight}` through `{dim6_weight}` | Dimension weight percentage | 20 |
| `{dim1_explanation}` through `{dim6_explanation}` | 2-3 sentence explanation per dimension | Opened with brand identification and name confirmation. Missed the hospitality language in the greeting -- used "Hey" instead of a warm welcome. |
| `{top_strength_impact}` | Why this behavior matters for outcomes | Patients who feel personally expected are 3x more likely to complete a booking in the same call. |
| `{improvement_1_impact}` | Business impact of the gap | Closed-ended questions skip discovery and lead to mismatched recommendations. Patients feel "sold to" rather than understood. |
| `{improvement_1_coaching}` | Expanded coaching guidance (2-3 sentences) | Start with an open question about their concern before mentioning any treatment. Let them describe their situation in their own words -- this builds trust and gives you the language to use when presenting the solution. |
| `{domain_details}` | Expanded domain accuracy notes | All treatment claims were accurate. Pricing quoted matched current menu. Session counts aligned with protocol. |
| `{brand_details}` | Expanded brand compliance notes | Tone was warm and on-brand throughout. Used "investment" framing correctly. One instance of "cheap" should be replaced with "accessible." |
| `{script_checklist}` | Which script points were hit/missed | Hit: brand ID, name confirmation, opening warmth. Missed: refreshment offer, closing "Is there anything else?" |
| `{discovery_checklist}` | Discovery checklist results | Hit: open-ended question, treatment history. Missed: emotional dimension, timeline awareness. |
| `{close_checklist}` | Close checklist results | Hit: asked for booking, confirmed details. Missed: deposit explanation, confirmation text. |

---

## Tone Guidelines

All feedback must follow these principles:

1. **Coaching, not grading.** The purpose is to help the rep improve, not to judge them. Frame everything as opportunity.
2. **Specific, not vague.** Every piece of feedback references a direct quote and offers a concrete alternative.
3. **Strength first.** Always lead with what went well before addressing improvements. People learn faster when they feel recognized.
4. **One voice.** Feedback should read like it comes from a supportive senior colleague, not a robot or a disciplinarian.
5. **Forward-looking.** End on encouragement. Tie back to their trend -- are they improving? Maintaining? Let them know you see the trajectory.

### Language Do's and Don'ts

| Do | Don't |
|----|-------|
| "Try this instead" | "You should have said" |
| "Next time, consider" | "You failed to" |
| "Great job on" | "At least you" |
| "This is a common challenge" | "This is a basic mistake" |
| "Your score is improving" | "Your score is still low" |
| "Here's a script that works well" | "You need to follow the script" |

---

## Rendering Rules

1. **WhatsApp version** is always sent first via WhatsApp MCP. It is the primary feedback channel.
2. **Email version** is sent simultaneously via Gmail MCP, with the rep's manager CC'd.
3. If the overall score is **Critical (0-39)**, the manager also receives a separate WhatsApp alert.
4. If the overall score is **Elite (90-100)**, the feedback includes a congratulatory note and the conversation is flagged as a training example.
5. The WhatsApp version must never exceed 2000 characters. If content overflows, prioritize: score > strength > improvement #1 > improvement #2 > domain/brand checks.
6. All quotes must be exact excerpts from the conversation transcript. Never paraphrase or fabricate quotes.
