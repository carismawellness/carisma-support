# Scoring Benchmarks -- Annotated Examples

**Version:** 1.0
**Last Updated:** 2026-04-14
**Purpose:** Calibration reference for AI scoring agents. Each example shows what a specific score level looks and feels like in a real conversation. Use these to ensure consistency across all scoring decisions.

---

## How to Use This File

Each benchmark includes:
1. A realistic conversation snippet (3-6 exchanges)
2. Inline annotations in `[ANNOTATION]` format showing what is good or bad
3. A full score breakdown per dimension
4. A brief explanation of why this lands at this score level and not the one above or below it

There are 3 examples per score tier, 15 examples total, covering a mix of brands, channels, and scenarios.

---

## Tier 1: Elite (90-100)

### Example 1.1 -- Spa, Phone Call, New Lead (Package Enquiry)

> **SDR:** "Hi, this is Rana calling from Carisma Spa. Is this Christine?"
> `[CORRECT: Brand name, SDR's own name, caller confirmation]`
>
> **Client:** "Yes, that's me!"
>
> **SDR:** "I'm reaching out because you enquired about our couples retreat package. Have you been to any of our spas before?"
> `[CORRECT: References specific package, asks treatment history]`
>
> **Client:** "No, it would be our first time. It's our anniversary."
>
> **SDR:** "That's a lovely way to celebrate. What is it about the couples retreat that caught your eye?"
> `[CORRECT: Acknowledges the occasion warmly, asks the "why" question, one question only]`
>
> **Client:** "We just want to completely switch off together. Work has been insane."
>
> **SDR:** "I hear you. This package is designed for exactly that. You'll each enjoy a 60-minute full-body massage with warm oils, followed by a private relaxation session together with a welcome drink. Is there a particular budget you had in mind?"
> `[CORRECT: Acknowledges concern, walks through package, value before price, asks budget, 2 sentences + 1 question, under 80 words]`
>
> **Client:** "Not really, what are the options?"
>
> **SDR:** "We have three levels. The 30-minute express for EUR 70 per person, the 60-minute full experience at EUR 120 per person, and the 90-minute signature ritual for EUR 185. For a special occasion like yours, the 60-minute is where you get the full experience without rushing."
> `[CORRECT: 3-tier framework, Tier 2 reaffirmed, framed around their specific situation]`
>
> **Client:** "The 60-minute sounds perfect."
>
> **SDR:** "Wonderful. We have 8 spas across the island. Which area works best for you?"
> `[CORRECT: Mentions 8 locations, asks location preference]`

**Score Breakdown:**

| Dimension | Score | Notes |
|-----------|-------|-------|
| Script Compliance | 10 | Every step in correct order. Package reference, history check, why question, value walkthrough, 3-tier pricing, location ask. |
| Brand Voice | 10 | Peaceful, soothing tone. No violations. Under 80 words per response. One question per message. No em-dashes. No forbidden phrases. Sensory language (warm oils, private relaxation). |
| Discovery | 9 | Treatment history checked, motivation explored, occasion noted. Could have asked one more question about preferences (pressure, temperature). |
| Objection Handling | 9 | No objection arose. Persuasion was strong: value framed around their anniversary, Tier 2 reaffirmed with personal context. |
| Close | 9 | Booking flow initiated naturally. Location asked. (Conversation continues to time/deposit.) |
| Follow-Up | N/A | First contact. |

**Composite (adjusted):** (10x0.194 + 10x0.222 + 9x0.222 + 9x0.222 + 9x0.139) x 10 = **94.4**

**Why Elite, not Strong:** Every script step is executed in perfect sequence. Brand voice is flawless. The SDR adapts the pitch to the client's specific situation (anniversary) without being scripted about it.

---

### Example 1.2 -- Aesthetics, WhatsApp, Objection Handling (Price Concern)

> **SDR:** "Hi Elena, this is Sarah from Carisma Aesthetics. I saw your enquiry about our Skin Revival Package and wanted to help you get started. Have you had any aesthetic treatments before?"
> `[CORRECT: Brand name, persona, references specific offer, asks history]`
>
> **Client:** "Just facials at another place. Nothing medical."
>
> **SDR:** "That's a great foundation. What specific concerns have you noticed that made you look into the Skin Revival Package?"
> `[CORRECT: Validates experience, asks specific concern question]`
>
> **Client:** "My skin texture is uneven and I have some acne scarring from years ago. I feel like my skin looks dull."
>
> **SDR:** "Many of our patients come in with exactly that, and the results with microneedling are really impressive. The Skin Revival Package has a total value of over EUR 400, and we're offering it at EUR 99. You'll get a personalized consultation with our doctor, a microneedling or mesotherapy session, LED therapy, and a EUR 40 credit toward your next visit. How does this sound?"
> `[CORRECT: Empathy + social proof, perceived value BEFORE price (anchoring), full package walkthrough, soft close]`
>
> **Client:** "EUR 99 is fine but I looked at your regular prices and follow-up treatments are way more expensive. I don't want to get hooked into something I can't afford."
>
> **SDR:** "That's a really fair concern. The consultation is where everything becomes clear, because our doctor will map out exactly what your skin needs and what results you can realistically expect. There's no obligation to continue after the package. Many patients find that even one session gives them visible improvement."
> `[CORRECT: Acknowledges objection immediately, empathy ("really fair"), addresses the UNDERLYING concern (commitment fear, not just price), no discount offered, reassurance without pressure]`
>
> **Client:** "Okay, that makes me feel better. Let's do it."
>
> **SDR:** "Lovely. We're in St Julian's inside the InterContinental, open Monday to Saturday 9am to 7pm. What day works best for you?"
> `[CORRECT: Location, hours, assumptive close]`

**Score Breakdown:**

| Dimension | Score | Notes |
|-----------|-------|-------|
| Script Compliance | 10 | Perceived value before price, full walkthrough, correct deposit flow incoming, location and hours stated. |
| Brand Voice | 10 | Warm, confident, clinical expertise conveyed without jargon. "Enhance" framing. No forbidden words. No em-dashes. Under 80 words per response. |
| Discovery | 9 | History checked, specific concern explored, emotional dimension touched ("I feel like my skin looks dull"). |
| Objection Handling | 10 | Textbook. Empathy before redirect. Addressed underlying fear (commitment/cost lock-in), not just surface price. No discount. Social proof. Client's emotional state shifted from worried to reassured. |
| Close | 9 | Assumptive close, location and hours. Deposit via Fresha pending. |
| Follow-Up | N/A | First contact. |

**Composite (adjusted):** (10x0.194 + 10x0.194 + 9x0.222 + 10x0.250 + 9x0.139) x 10 = **96.4**

**Why Elite:** The objection handling is the standout. The SDR identified the real concern (commitment fear, not EUR 99) and addressed it without offering a discount or pressuring. This is training material quality.

---

### Example 1.3 -- Slimming, Phone Call, New Lead (Emotional Discovery)

> **SDR:** "Hi, this is Katya from Carisma Slimming. Is this Rachel?"
> `[CORRECT: Brand name, persona name, caller confirmation]`
>
> **Client:** "Yes, hi."
>
> **SDR:** "I'm calling because you enquired about medical weight loss. To make sure I recommend the best fit, are you looking for general weight loss, targeted body contouring, or medically supervised weight management?"
> `[CORRECT: References enquiry, classifies need into 3 categories]`
>
> **Client:** "Weight loss. I need to lose about 20 kilos."
>
> **SDR:** "What's your main goal? Is it overall weight loss, stubborn fat, metabolism support, or something like appetite management?"
> `[CORRECT: Follow-up goal question with specific options]`
>
> **Client:** "Overall. I've done Weight Watchers, I've done keto, I've done gym memberships. I lose 5 kilos and then gain 8 back. Every single time."
>
> **SDR:** "Rachel, you haven't failed. Those programs failed you. The fact that you kept trying tells me you're committed. What changes is the approach."
> `[CORRECT: Validation ("you haven't failed"), reframes failure as the program's fault, compassionate truth, uses her name, all 5 pillars present: compassionate truth, gentle structure (implied), evidence-led (implied), shame-free, future-focused]`
>
> **Client:** "That actually means a lot to hear. I feel like everyone just tells me to try harder."
>
> **SDR:** "We hear that all the time. And it's not true. Our program is doctor-led and medically supervised. You'll start with a full body composition and metabolism assessment. Then we build a plan that works for YOUR life, not a template. How does that sound?"
> `[CORRECT: Social proof, medical-first positioning, personalized assessment, gentle structure, direct language, under 80 words, one question]`
>
> **Client:** "Yes. What does it cost?"
>
> **SDR:** "How much time are you willing to invest? We have three options. The 4-week Starter at EUR 199, proves the system works for you. The 12-week Core Protocol at EUR 549, where real sustainable change happens. And the 24-week Complete Reset at EUR 999 for full transformation. For where you are, the 12-week Core is where women like you see lasting results."
> `[CORRECT: Commitment framing before price, 3-tier, Tier 2 reaffirmed, "women like you" social proof]`

**Score Breakdown:**

| Dimension | Score | Notes |
|-----------|-------|-------|
| Script Compliance | 10 | Every step, correct sequence, 3-tier pricing with commitment framing. |
| Brand Voice | 10 | All 5 pillars present. Shame-free. Compassionate. Evidence-led. No violations. Katya persona perfect. |
| Discovery | 10 | Classified need, asked goals, explored history, validated past struggles, emotional moment created. Client felt heard. |
| Objection Handling | 9 | No objection yet, but preemptive persuasion ("you haven't failed, those programs failed you") is masterful reframing. |
| Close | 9 | 3-tier pricing delivered, commitment framing used. Booking flow pending. |
| Follow-Up | N/A | First contact. |

**Composite (adjusted):** (10x0.167 + 10x0.194 + 10x0.278 + 9x0.222 + 9x0.139) x 10 = **96.4**

**Why Elite:** The emotional discovery is the benchmark for Slimming. "You haven't failed. Those programs failed you." That single line encapsulates the entire brand. The client's response ("That actually means a lot") confirms the impact.

---

## Tier 2: Strong (75-89)

### Example 2.1 -- Aesthetics, Phone Call, New Lead (Hydrafacial Enquiry)

> **SDR:** "Hi, is this Daniela? This is Sarah from Carisma Aesthetics."
> `[MINOR: Correct elements but order is slightly off. Script says "Hi, this is [Name] from Carisma Aesthetics. Is this [Name]?" SDR led with the client's name instead of introducing herself first.]`
>
> **Client:** "Yes, hi!"
>
> **SDR:** "Great, I'm calling about your Hydrafacial enquiry. Have you had any treatments before?"
> `[CORRECT: References specific treatment, asks history. Slight miss: "any treatments" is vague. Script says "aesthetic treatments" and suggests "even something simple like a facial or Botox" to calibrate.]`
>
> **Client:** "No, this would be my first time."
>
> **SDR:** "What made you interested in the Hydrafacial specifically?"
> `[CORRECT: Asks the "why" question]`
>
> **Client:** "My skin just looks tired. I want something that makes it glow without anything invasive."
>
> **SDR:** "I completely get that. The Hydrafacial is perfect for a first treatment. We have three levels. The Fresh at EUR 99 for a 30-minute deep cleanse, the Glow at EUR 139 for 50 minutes with a serum boost, and the Signature at EUR 199 for the full 80-minute experience. The Glow is what most of our clients go with for that radiant result."
> `[CORRECT: 3-tier with specific names and prices, Tier 2 reaffirmed. Minor: Did not ask about budget first, which the script calls for. Did not state perceived value before price (no anchoring because Hydrafacial is menu-priced, not a package).]`
>
> **Client:** "The Glow sounds good."
>
> **SDR:** "Wonderful. We're in St Julian's inside the InterContinental. What day works best?"
> `[CORRECT: Location mentioned, assumptive close. Minor miss: Hours not stated.]`

**Score Breakdown:**

| Dimension | Score | Notes |
|-----------|-------|-------|
| Script Compliance | 7 | Greeting order slightly off, history question could be more specific, budget not asked before pricing, hours not stated. Core flow is correct. |
| Brand Voice | 8 | On-brand tone, no violations, "radiant" language used. Could be more distinctive. |
| Discovery | 7 | Why question asked, history checked. But no follow-up on the emotional dimension ("tired skin" could have been explored: "How long has it felt that way?"). |
| Objection Handling | 8 | No objection arose. Persuasion was solid: right treatment matched to stated need, Tier 2 reaffirmed with social proof. |
| Close | 7 | Location mentioned, assumptive close. Missing hours, parking, and Fresha deposit mention. |
| Follow-Up | N/A | First contact. |

**Composite (adjusted):** (7x0.194 + 8x0.194 + 7x0.222 + 8x0.250 + 7x0.139) x 10 = **74.6**

**Why Strong, not Elite:** Competent execution with clear coaching points: ask budget before pricing, state hours, deeper emotional discovery. Nothing wrong, but nothing that would be used as training material.

---

### Example 2.2 -- Slimming, WhatsApp, No-Show Recovery

> **SDR:** "Hi Maria, this is Katya from Carisma Slimming. I noticed you weren't able to make it to your consultation today. I completely understand that things come up!"
> `[CORRECT: Persona, brand name, non-judgmental tone, normalizes the no-show]`
>
> **Client:** "Yes sorry, something came up at work. I still want to come."
>
> **SDR:** "No need to apologize at all. Life happens. Would you prefer to rebook for later this week or next week?"
> `[CORRECT: Zero guilt, offers specific rebook options]`
>
> **Client:** "Next week would be better. Thursday if possible."
>
> **SDR:** "Thursday works well. We're open 9am to 7pm. Would morning or afternoon suit you?"
> `[CORRECT: Hours stated (Mon-Fri, though didn't specify). Offers morning/afternoon choice.]`
>
> **Client:** "Morning please. Around 10?"
>
> **SDR:** "Done. Thursday at 10am with the doctor. You'll get a confirmation through Fresha. The consultation fee is EUR 70 to secure your spot."
> `[CORRECT: Confirmed time, mentioned doctor, Fresha, consultation fee framed correctly. Minor: Could have used "medical consultation fee" to reinforce medical positioning.]`

**Score Breakdown:**

| Dimension | Score | Notes |
|-----------|-------|-------|
| Script Compliance | 8 | No-show recovery follows the correct pattern. Fresha and fee mentioned. Minor: "consultation fee" instead of "medical consultation fee". |
| Brand Voice | 8 | Compassionate, shame-free, zero guilt. Good Katya voice. Minor: Could have added a forward-looking element ("We'll get you started on the right path"). |
| Discovery | 7 | This is a recovery call, not an initial discovery. No new discovery needed, but the SDR could have briefly confirmed her goals are still the same. |
| Objection Handling | N/A | No objection arose in this context. Score on persuasion: effective, maintained rapport, but minimal persuasion needed. Scored as 8 for maintaining motivation. |
| Close | 8 | Time confirmed, Fresha mentioned, fee stated. Minor: Did not confirm location or send a "we look forward to seeing you" close. |
| Follow-Up | 9 | This IS the follow-up. Timely (same day), personalized, non-judgmental, successful rebook. Could have mentioned the doctor by name for continuity. |

**Composite:** (8x0.15 + 8x0.175 + 7x0.25 + 8x0.20 + 8x0.15 + 9x0.075) x 10 = **78.3**

**Why Strong:** Clean no-show recovery with no guilt. The client rebooked immediately. Minor coaching points around medical framing and adding forward momentum language.

---

### Example 2.3 -- Spa, WhatsApp, Booking Follow-Up

> **SDR:** "Hi Julia, this is Sarah from Carisma Spa. Just checking in after our chat about the hot stone massage. Were you still thinking of booking?"
> `[CORRECT: Persona, brand, references previous conversation, natural follow-up question. Minor: "Were you still thinking" is slightly passive. Better: "I wanted to help you find the perfect time."]`
>
> **Client:** "Yes! I just haven't had time to decide. Which spa is closest to Sliema?"
>
> **SDR:** "Our spas at the AX The Palace and AX Ximenes are both close to Sliema. Either would be convenient. What day are you thinking?"
> `[CORRECT: Answered the factual question immediately. Offered two nearby options. Asked one question. Under 80 words.]`
>
> **Client:** "Saturday ideally."
>
> **SDR:** "I can do Saturday morning at 10am or afternoon at 2pm at The Palace. Which works better?"
> `[CORRECT: Two specific time options offered, location confirmed]`
>
> **Client:** "2pm please."
>
> **SDR:** "Lovely. Saturday at 2pm at AX The Palace for your hot stone massage. To secure your spot, we take a EUR 50 deposit. I can take your card details now, or I can send you a payment link. Which do you prefer?"
> `[CORRECT: Confirmed all details (day, time, location, treatment), correct deposit amount, both payment options offered, personalized by naming their chosen treatment]`

**Score Breakdown:**

| Dimension | Score | Notes |
|-----------|-------|-------|
| Script Compliance | 8 | Strong flow. All booking steps covered. References treatment by name. Deposit handled correctly with both options. Minor: No mention of confirmation text. |
| Brand Voice | 8 | Peaceful, efficient, warm. Under 80 words. One question per message. No violations. Could have added more sensory language around the treatment. |
| Discovery | N/A | Follow-up booking, no new discovery needed. Scored as 8 for confirming stated preference. |
| Objection Handling | N/A | No objection. Persuasion minimal but appropriate for a booking follow-up. Scored as 8. |
| Close | 9 | Confirmed day, time, location, treatment. Two payment options. Clean and confident. Missing only confirmation text promise. |
| Follow-Up | 8 | This is the follow-up. Timely, references previous chat, successful booking. Could be more personal ("I remember you mentioned needing a break from work"). |

**Composite:** (8x0.175 + 8x0.20 + 8x0.222 + 8x0.222 + 9x0.167 + 8x0.075) x 10 = **81.7** (with Discovery and Objection scored at 8)

**Why Strong:** Efficient, on-brand booking completion. The SDR answered the location question immediately (the single most important Spa skill), offered two options, and handled the deposit correctly. Minor coaching: add a confirmation text promise and a warmer personal touch.

---

## Tier 3: Developing (60-74)

### Example 3.1 -- Aesthetics, Phone Call, Glass Skin Package

> **SDR:** "Hi Sophie, this is Rana from Carisma Aesthetics. I'm calling about your Glass Skin enquiry. Have you had aesthetic treatments before?"
> `[CORRECT: Greeting, SDR name, brand, references enquiry, asks history]`
>
> **Client:** "Just regular facials."
>
> **SDR:** "Great! What made you interested in the Glass Skin Package?"
> `[PARTIAL: Good "why" question. But "Great!" is an AI voice tell.]`
>
> **Client:** "My skin looks dull and I want that glowy look."
>
> **SDR:** "The Glass Skin Package is perfect for that. It includes dermaplaning, a face mask, LED therapy, and a EUR 40 credit toward your next visit. It's normally over EUR 295 but we're running it at EUR 69 right now. Sound good?"
> `[PARTIAL: Perceived value anchor used (295 vs 69). Package walkthrough present. But skipped reiteration of client's concern ("dull skin, glowy look") before the pitch. "Sound good?" is an acceptable soft close but more abrupt than "How does this sound?"]`
>
> **Client:** "EUR 69 is pretty good actually. When can I come?"
>
> **SDR:** "We're in St Julian's, open Monday to Saturday. When works for you?"
> `[PARTIAL: Location mentioned. But hours not stated (9am-7pm). No specific time options offered.]`
>
> **Client:** "Wednesday afternoon?"
>
> **SDR:** "I can book you for Wednesday at 3pm. I'll send the deposit through Fresha to confirm."
> `[PARTIAL: Time confirmed. Fresha mentioned. But did not collect personal details or promise a confirmation text.]`

**Score Breakdown:**

| Dimension | Score | Notes |
|-----------|-------|-------|
| Script Compliance | 6 | Greeting correct but AI tell. History checked. Value anchor used. Missing: concern reiteration, specific hours, time options, personal details collection, confirmation text. |
| Brand Voice | 6 | "Great!" AI voice tell. Tone is professional but not distinctively Aesthetics (lacking warmth, confidence, clinical expertise signals). No em-dashes, no forbidden words beyond "Great!". |
| Discovery | 6 | History checked, why question asked. But only surface-level. Did not explore emotional dimension ("How does dull skin make you feel?") or timeline. |
| Objection Handling | 7 | No objection arose. Persuasion was adequate: value anchor was effective, client responded positively. But no social proof or credential building. |
| Close | 5 | Time confirmed, Fresha mentioned. Missing: hours, personal details, confirmation text, warm close, offer of further assistance. |
| Follow-Up | N/A | First contact. |

**Composite (adjusted):** (6x0.194 + 6x0.194 + 6x0.222 + 7x0.250 + 5x0.139) x 10 = **61.2**

**Why Developing:** The SDR hits the basic checkpoints but misses the details that separate competent from strong. Discovery is surface-level, closing is incomplete, and the AI voice tell breaks brand voice. With coaching on deeper discovery and complete closing steps, this SDR could move to Strong.

---

### Example 3.2 -- Slimming, Phone Call, Incomplete Discovery

> **SDR:** "Hi, this is Katya from Carisma Slimming. Is this Laura?"
> `[CORRECT: Brand, persona, confirmation]`
>
> **Client:** "Yes."
>
> **SDR:** "I'm following up on your enquiry about weight loss. Are you looking for general weight loss, body contouring, or medical weight management?"
> `[CORRECT: References enquiry, 3-category classification]`
>
> **Client:** "General weight loss. I need to lose about 15 kilos."
>
> **SDR:** "What's been your biggest challenge so far? Have you tried programs before?"
> `[ACCEPTABLE: Asks about history and challenge. Two questions in one message (minor violation) but captures essential discovery.]`
>
> **Client:** "I've tried lots of things. Keto, gym, meal plans. I always fall off after a month."
>
> **SDR:** "That's really common. The programs weren't designed around your life. Our approach is different because it's doctor-led and medically supervised."
> `[PARTIAL: "That's really common" is decent validation but thin. "Programs weren't designed around your life" is a good reframe. But jumped past deeper exploration of what specifically failed. No commitment framing before pricing.]`
>
> **Client:** "I've tried lots of things before. Nothing works long-term."
>
> **SDR:** "You're not alone in that. Our 12-week Core Protocol is designed for lasting results. It's EUR 549 and includes a full assessment, medical supervision, and a personalized plan. We also have a 4-week Starter at EUR 199 if you'd prefer to try it first."
> `[PARTIAL: "You're not alone" continues the validation. Mentioned 2 of 3 tiers (missing the 24-week). Pricing presented without commitment framing ("How much time are you willing to invest?"). Did not reaffirm Tier 2.]`
>
> **Client:** "The 4-week seems safer. Let me try that."
>
> **SDR:** "The 4-week is a great way to start. What day works for you? We're open Monday to Friday 9 to 7 and Saturdays 9 to 1."
> `[PARTIAL: "Great" is borderline. Hours correctly stated. But did not reaffirm Tier 2 or explain why the 12-week delivers better results.]`

**Score Breakdown:**

| Dimension | Score | Notes |
|-----------|-------|-------|
| Script Compliance | 5 | Classification done, history asked (minor two-question violation), but only 2 of 3 tiers presented, no commitment framing before price, no Tier 2 reaffirmation. |
| Brand Voice | 5 | Validation present but thin. Katya voice is present but not distinctive. Two questions in one message is a minor violation. |
| Discovery | 6 | Classification done, history and challenge asked, some empathetic reframe. But did not explore emotional dimension or specific past failures in depth. |
| Objection Handling | 6 | No objection arose. Client chose the lower tier, which could indicate price hesitation that was not explored. SDR missed the chance to gently guide toward Tier 2. |
| Close | 7 | Hours correctly stated, booking flow initiated. Missing: consultation fee framing, Fresha mention, personal details. |
| Follow-Up | N/A | First contact. |

**Composite (adjusted):** (5x0.167 + 5x0.194 + 6x0.278 + 6x0.222 + 7x0.139) x 10 = **61.0**

**Why Developing:** The SDR asks discovery questions and validates the client's experience, but the exploration is surface-level. Moving to pricing without commitment framing and presenting only 2 of 3 tiers shows incomplete script execution. With coaching on deeper discovery and the 3-tier framework, this SDR could reach Strong.

---

### Example 3.3 -- Spa, Phone Call, Missed Location Step

> **SDR:** "Hi, this is Sarah from Carisma Spa. Is this Natalie?"
> `[CORRECT: Greeting, brand, persona, confirmation]`
>
> **Client:** "Yes, that's me."
>
> **SDR:** "I'm calling about your enquiry for a massage. Have you been to any of our spas before?"
> `[CORRECT: References enquiry, asks history. Minor: "a massage" is generic. Script says to reference the specific package.]`
>
> **Client:** "Yes, I went to the one at Hilton last year."
>
> **SDR:** "Lovely. What are you looking for this time?"
> `[ACCEPTABLE: Asks the "why" but in a more closed/generic way than the script's "What is it that interests you in [package] today?"]`
>
> **Client:** "I have really bad tension in my neck and shoulders from sitting at a desk all day."
>
> **SDR:** "A deep tissue massage would be ideal for that. We have a 30-minute focused session for EUR 70, a 60-minute full treatment for EUR 120, or a 90-minute session for EUR 185 that covers everything thoroughly. The 60-minute is the sweet spot for neck and shoulder work."
> `[PARTIAL: 3-tier framework used, Tier 2 reaffirmed with a personal recommendation. But no budget question asked first. Also jumped from discovery to pricing without the value explanation step (no package walkthrough, no "How does this sound?" soft close).]`
>
> **Client:** "The 60-minute sounds right."
>
> **SDR:** "When would you like to come in? I have availability Thursday and Friday this week."
> `[MISS: Did NOT ask which of the 8 spa locations works best. This is a critical Spa-specific step. Also did not mention that there are 8 locations.]`
>
> **Client:** "Friday afternoon?"
>
> **SDR:** "I'll book you Friday at 3pm. We take a EUR 50 deposit to secure it. I can take your card number now or send a link. Which works better?"
> `[CORRECT: Deposit amount right, both payment options offered. But still no location confirmed. Client could show up at the wrong spa.]`

**Score Breakdown:**

| Dimension | Score | Notes |
|-----------|-------|-------|
| Script Compliance | 5 | Missing: specific package reference, budget question, value walkthrough, soft close, location question (8 spas). Deposit handled correctly. |
| Brand Voice | 7 | On-brand tone, no violations, no em-dashes. Language is clean but not particularly sensory or distinctive. |
| Discovery | 6 | History checked (returning client). Concern identified. But no emotional exploration and the "why" question was generic. |
| Objection Handling | 7 | No objection. Tier 2 recommendation was well-connected to the stated concern (neck and shoulder work). |
| Close | 5 | Deposit correct. But no location confirmed (critical for Spa with 8 locations). No confirmation text promised. |
| Follow-Up | N/A | First contact. |

**Composite (adjusted):** (5x0.194 + 7x0.222 + 6x0.222 + 7x0.222 + 5x0.139) x 10 = **61.0**

**Why Developing:** The missing location question is the key differentiator. For a brand with 8 physical locations, not confirming which one the client should visit is a significant operational gap, not just a script miss. This is the kind of coaching opportunity the system is designed to catch.

---

## Tier 4: Needs Improvement (40-59)

### Example 4.1 -- Aesthetics, WhatsApp, Weak But Present

> **SDR:** "Hi Jessica, this is Sarah from Carisma Aesthetics. I saw your message about Botox. Have you had it before?"
> `[CORRECT: Greeting, persona, brand, references enquiry, asks history]`
>
> **Client:** "No, first time."
>
> **SDR:** "That's exciting! Botox is one of our most popular treatments. For one area it starts at EUR 139, or for the full upper face it's EUR 249-299. Would you like to book a consultation?"
> `[MISSES: "That's exciting!" is hype language off-brand. Jumped past discovery (no "what concerns" question). Two price points but no 3-tier framework. No perceived value anchor. No budget question. Premature close.]`
>
> **Client:** "What does the consultation involve?"
>
> **SDR:** "You'll meet with our doctor who will assess your facial structure and recommend the best approach. It's free and there's no obligation."
> `[PARTIAL: Explains consultation. Free + no obligation is good. But "assess your facial structure" is clinical without warmth. Could mention personalization, goals, natural results.]`
>
> **Client:** "Okay, when are you available?"
>
> **SDR:** "We're in St Julian's. I have Thursday or Friday this week. Which works?"
> `[PARTIAL: Location mentioned. Two options offered. Missing: specific hours, Fresha deposit, personal details collection.]`

**Score Breakdown:**

| Dimension | Score | Notes |
|-----------|-------|-------|
| Script Compliance | 5 | Greeting correct. History asked. But discovery skipped, no value walkthrough, no 3-tier pricing, no perceived value anchor, no soft close before booking. |
| Brand Voice | 4 | "That's exciting!" is hype/off-brand. Consultation description is clinical. Persona is present but voice lacks warmth and confidence. |
| Discovery | 3 | Only asked if they've had Botox before. No concern exploration, no goals, no emotional dimension. Client is a blank slate going into consultation. |
| Objection Handling | 5 | Client asked "what does the consultation involve" (mild objection/hesitation). SDR answered adequately but missed chance to build value and excitement. |
| Close | 5 | Location mentioned, two options. Missing deposit, hours, details, confirmation text. |
| Follow-Up | N/A | |

**Composite (adjusted):** (5x0.194 + 4x0.194 + 3x0.222 + 5x0.250 + 5x0.139) x 10 = **43.3**

**Why Needs Improvement:** The SDR knows the basics (greeting, history question, consultation mention) but skips the entire discovery and value-building sequence. Without understanding Jessica's concerns, any recommendation is a shot in the dark. The hype language and clinical tone suggest brand voice training is needed.

---

### Example 4.2 -- Slimming, Phone Call, Weak Discovery

> **SDR:** "Hi, this is Katya from Carisma Slimming. Is this Diana?"
> **Client:** "Yes."
> **SDR:** "I'm calling about your weight loss enquiry. Are you looking for general weight loss, body contouring, or medically supervised management?"
> `[CORRECT: 3-category classification]`
> **Client:** "General weight loss. Maybe 15-20 kilos."
> **SDR:** "I understand. Our program is doctor-led. The 12-week Core Protocol is EUR 549 and the 4-week Starter is EUR 199. Would you like to come in for a consultation?"
> `[MISSES: Jumped from classification to pricing. No goals question, no history, no validation. Only 2 tiers. No commitment framing. No value explanation. But no forbidden language.]`
> **Client:** "Let me think about it."
> **SDR:** "Of course. The consultation is a good first step to understand what would work for you. No pressure."
> `[PARTIAL: Not a strong recovery but not bad. "Of course" is borderline. "No pressure" is appropriate. Did not offer specific next step or address hesitation.]`

**Scores:** Script Compliance 5, Brand Voice 5, Discovery 3, Objection Handling 4, Close 4, Follow-Up N/A.

**Composite (adjusted):** (5x0.167 + 5x0.194 + 3x0.278 + 4x0.222 + 4x0.139) x 10 = **41.1**

**Why Needs Improvement:** The SDR uses the right persona and avoids forbidden language but rushes past discovery entirely. The client says "Maybe 15-20 kilos" which is an invitation to explore their story, and the SDR responds with pricing. The lead says "let me think about it" and likely will not come back.

---

### Example 4.3 -- Spa, WhatsApp, Over-Explaining

> **SDR:** "Hi Claire, this is Sarah from Carisma Spa. I'm reaching out about your massage enquiry. At Carisma, we offer a truly unique experience that goes beyond a traditional spa visit. Our therapists are trained in multiple modalities including Swedish, deep tissue, hot stone, and aromatherapy techniques. We use only premium organic oils sourced from sustainable suppliers. Each session is tailored to your specific needs and preferences. Whether you're looking for relaxation, pain relief, or a combination of both, our team will create the perfect treatment for you."
> `[CRITICAL: This response is approximately 80 words and 5 sentences, exceeding the 2-3 sentence max. It reads like a brochure, not a conversation. No question asked. No treatment history check. Flowery language ("truly unique experience"). Generic marketing speak ("goes beyond a traditional spa visit"). Multiple modalities listed (bullet-list thinking in paragraph form). PASS/FAIL: Response length violated.]`
>
> **Client:** "Okay, sounds nice. How much?"
>
> **SDR:** "Our signature 90-minute experience is EUR 185, our classic 60-minute session is EUR 120, and we also have a 30-minute express option at EUR 70. I'd recommend the 60-minute as it gives our therapists enough time to really work through any tension areas."
> `[PARTIAL: 3-tier framework present. Tier 2 reaffirmed. But no budget question asked. Price presented top-down (Premium first) instead of anchor-up. Response is long again at 50+ words and 2 sentences but within limits.]`
>
> **Client:** "The 60-minute is fine. How do I book?"
>
> **SDR:** "We have spas in several locations. Which area of Malta are you in?"
> `[MISS: "Several locations" instead of "8 spas across the island." Phrasing is vague.]`

**Score Breakdown:**

| Dimension | Score | Notes |
|-----------|-------|-------|
| Script Compliance | 4 | No history check. No "why" question. No soft close. Location question vague. First response skipped to a brochure pitch. |
| Brand Voice | 3 | Pass/fail failed: first response exceeds 3 sentences. Flowery brochure language. Generic marketing copy. Reads like a chatbot, not Sarah. |
| Discovery | 3 | Zero discovery. First response was a monologue. Client asked "how much?" because there was nothing else to respond to. |
| Objection Handling | 6 | No objection. Tier 2 reaffirmation was reasonable. Client self-selected. |
| Close | 5 | Booking initiated but location question is vague. No deposit discussed yet. |
| Follow-Up | N/A | |

**Pass/fail override:** Response length violated. Composite capped at 59.

**Composite (adjusted, before cap):** (4x0.194 + 3x0.222 + 3x0.222 + 6x0.222 + 5x0.139) x 10 = **41.7**

**Why Needs Improvement:** The first response is a textbook example of over-explaining. In the Spa voice, every word should earn its place. Five sentences about therapist training and organic oils is the opposite of "calm, deliberate language that breathes."

---

## Tier 5: Critical (0-39)

### Example 5.1 -- Aesthetics, WhatsApp, Brand-Damaging Language

> **SDR:** "Hey babe! I saw you're interested in our facial treatments. We can totally fix those wrinkles and get you looking AMAZING again! Our doctors are the BEST in Malta. Book now before all the spots are gone this week!"
> `[EVERY SENTENCE VIOLATES BRAND STANDARDS: (1) "Hey babe" is unprofessional. (2) "Fix those wrinkles" uses forbidden word "fix" and negative correction framing. (3) "AMAZING" in caps is hype. (4) "BEST in Malta" is boastful. (5) "Book now before spots are gone" is aggressive urgency. (6) No persona name. (7) No brand name. (8) Entire response is one message dump with no questions.]`

**Score Breakdown:**

| Dimension | Score | Notes |
|-----------|-------|-------|
| Script Compliance | 1 | No script element followed. No greeting, no history, no discovery, no value framework. |
| Brand Voice | 1 | "Fix", "wrinkles", "AMAZING", "BEST", "Book now before spots are gone", "Hey babe". Every forbidden category hit. Multiple pass/fail violations. |
| Discovery | 1 | Zero. |
| Objection Handling | 1 | N/A (no conversation happened). The message itself would create objections. |
| Close | 1 | "Book now" is an aggressive demand, not a close. |
| Follow-Up | N/A | |

**Composite (adjusted):** (1x0.194 + 1x0.194 + 1x0.222 + 1x0.250 + 1x0.139) x 10 = **10.0**

**Why Critical:** This message would damage the brand if a client screenshotted and shared it. It violates every brand standard simultaneously. The SDR needs to be removed from live conversations immediately and fully retrained.

---

### Example 5.2 -- Slimming, Phone Call, Shame and Fear

> **SDR:** "Hi, is this Karen? It's Katya from Carisma Slimming."
> `[ACCEPTABLE: Basic greeting present]`
>
> **Client:** "Yes, hi."
>
> **SDR:** "I'm calling about your weight loss enquiry. So you want to lose weight. How long have you been struggling with this?"
> `[MISS: "Struggling with this" frames weight as a deficiency. Better: "How long have you been thinking about making a change?"]`
>
> **Client:** "Years. Probably 10 years now."
>
> **SDR:** "Wow, 10 years. You know, the longer you wait, the harder it gets. Your metabolism slows down as you age and it becomes much more difficult to lose weight. If you don't start now, you could be dealing with serious health problems down the line. Diabetes, joint issues, heart problems. It's really important that you take action."
> `[CRITICAL: (1) Fear-mongering about health consequences. (2) "The longer you wait, the harder it gets" creates urgency through fear. (3) Listing diseases is intimidation. (4) "If you don't start now" is "now or never" pressure. (5) Zero compassion, zero validation, zero shame-free language. This is the opposite of every Slimming brand pillar.]`
>
> **Client:** "..." (silence)
>
> **SDR:** "Look, I'm not trying to scare you. I just want to help. Our program is guaranteed to work if you follow it properly."
> `[CRITICAL: (1) "I'm not trying to scare you" confirms the SDR knows they scared them. (2) "Guaranteed" is a forbidden word. (3) "If you follow it properly" implies blame if it doesn't work. (4) Zero recovery from the damage done.]`

**Score Breakdown:**

| Dimension | Score | Notes |
|-----------|-------|-------|
| Script Compliance | 2 | Basic greeting only. No 3-category classification, no proper discovery, no value explanation, no pricing framework. |
| Brand Voice | 1 | Fear-mongering. "Guaranteed." "If you follow it properly" (blame). Every Slimming pillar violated. Multiple pass/fail failures. |
| Discovery | 2 | Asked one question ("how long") but used the answer to fear-monger instead of validate. |
| Objection Handling | 1 | The silence IS an objection (the client shut down). SDR's "recovery" made it worse with "guaranteed" and conditional blame. |
| Close | 1 | No close attempted. The conversation was effectively dead after the fear-mongering paragraph. |
| Follow-Up | N/A | |

**Composite (adjusted):** (2x0.167 + 1x0.194 + 2x0.278 + 1x0.222 + 1x0.139) x 10 = **14.0**

**Why Critical:** This conversation could cause genuine emotional harm. A person who has struggled with weight for 10 years does not need to be told they will develop diabetes if they do not act now. The silence from the client speaks volumes. This SDR needs immediate removal and retraining, with a specific focus on the Slimming brand pillars.

---

### Example 5.3 -- Spa, WhatsApp, Referral to External Channel

> **SDR:** "Hi there! Thanks for your interest in Carisma Spa. For pricing and availability, please visit our website at www.carismaspa.com or call us at +356 XXXX XXXX. You can also book directly through Fresha. Looking forward to welcoming you!"
> `[CRITICAL: (1) "Hi there!" with no name. (2) No persona name, no personalization. (3) THREE referrals to external channels: website, phone number, and Fresha. All explicitly forbidden. (4) Zero engagement, zero discovery, zero sales activity. This is a template copy-paste, not a conversation. (5) "Looking forward to welcoming you!" is generic and impersonal.]`

**Score Breakdown:**

| Dimension | Score | Notes |
|-----------|-------|-------|
| Script Compliance | 1 | Not a single script step followed. This is not a sales conversation, it is a redirect. |
| Brand Voice | 1 | Three external referrals (any one of which is a pass/fail failure). No persona. Generic template. No brand voice whatsoever. |
| Discovery | 1 | Zero. |
| Objection Handling | 1 | N/A (no conversation occurred). |
| Close | 1 | The "close" was telling the client to go somewhere else. |
| Follow-Up | N/A | |

**Composite (adjusted):** (1x0.194 + 1x0.222 + 1x0.222 + 1x0.222 + 1x0.139) x 10 = **10.0**

**Why Critical:** This is the most common Critical failure mode. An SDR who redirects a warm lead to a website or Fresha link has essentially handed the lead a reason not to engage further. The entire point of the SDR role is to handle everything directly. Sarah never refers customers elsewhere. This is a training fundamental that must be corrected before the SDR handles any conversations.

---

## Calibration Summary Table

| Example | Brand | Channel | Scenario | Composite | Tier |
|---------|-------|---------|----------|-----------|------|
| 1.1 | Spa | Phone | New lead, package enquiry | 94.4 | Elite |
| 1.2 | Aesthetics | WhatsApp | Offer lead, price objection | 96.4 | Elite |
| 1.3 | Slimming | Phone | New lead, emotional discovery | 96.4 | Elite |
| 2.1 | Aesthetics | Phone | Hydrafacial enquiry | 74.6 | Strong |
| 2.2 | Slimming | WhatsApp | No-show recovery | 78.3 | Strong |
| 2.3 | Spa | WhatsApp | Booking follow-up | 81.7 | Strong |
| 3.1 | Aesthetics | Phone | Glass Skin package | 61.2 | Developing |
| 3.2 | Slimming | Phone | Incomplete discovery | 61.0 | Developing |
| 3.3 | Spa | Phone | Missed location step | 61.0 | Developing |
| 4.1 | Aesthetics | WhatsApp | Weak but present | 43.3 | Needs Improvement |
| 4.2 | Slimming | Phone | Weak discovery | 41.1 | Needs Improvement |
| 4.3 | Spa | WhatsApp | Over-explaining / brochure dump | 41.7 | Needs Improvement |
| 5.1 | Aesthetics | WhatsApp | Brand-damaging language | 10.0 | Critical |
| 5.2 | Slimming | Phone | Shame and fear | 14.0 | Critical |
| 5.3 | Spa | WhatsApp | External referral redirect | 10.0 | Critical |

---

## Key Calibration Lessons for Scoring Agents

1. **Discovery is the heaviest anchor.** A score of 3 or below on Discovery makes it nearly impossible to reach Developing (60+), regardless of how well other dimensions perform. This is by design.

2. **Pass/fail violations override everything.** A single forbidden word in Slimming (shame language) or Aesthetics ("fix") caps the composite at 59 even if every other dimension scores 10.

3. **The gap between Strong and Elite is intentionality.** Strong SDRs follow the script correctly. Elite SDRs adapt the script to the client's specific situation (anniversary, specific concern, past history) in a way that feels natural.

4. **The gap between Developing and Needs Improvement is discovery.** Developing SDRs ask at least some questions and gather basic information. Needs Improvement SDRs skip discovery and jump to pricing.

5. **Critical means brand damage.** Reserve Critical for conversations that, if screenshotted and posted publicly, would damage Carisma's reputation. Shame language, aggressive urgency, external referrals, and fear-mongering all qualify.

6. **No objection is not a free pass.** When no objection arises, score Dimension 4 on persuasion quality. A conversation with no objection and weak persuasion scores 5-6, not 9-10.

7. **Channel matters for script expectations.** A WhatsApp follow-up does not need a full 10-step call script. Score against the appropriate scenario script, not the call script.

---

*Scoring Benchmarks v1.0*
*Review schedule: Quarterly, or when new scoring patterns emerge that need calibration*
