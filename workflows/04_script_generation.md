# 04 - Script Generation

## Objective

Generate ad scripts by combining hooks from the hook bank with active offers, brand voice guidelines, and proven script frameworks. Produce 2 variations per hook+offer+format combination, validate for brand voice and Meta policy compliance, and output structured script files ready for creative briefing.

## Required Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `.tmp/research/hooks_{brand}_{date}.json` | Workflow 03 output | Ranked hook bank (15-20 hooks per brand) |
| `config/offers.json` | Manual config | Active offers per brand with details |
| `config/script_frameworks.json` | Manual config | Script structure templates by format |
| `config/brands.json` | Manual config | Brand voice guidelines, creative formats |

### offers.json Structure (Expected)

```json
{
  "carisma_spa": {
    "active_offers": [
      {
        "offer_id": "spa_day_package",
        "name": "Spa Day Package",
        "description": "Full day spa experience including massage, facial, and pool access",
        "price": "EUR 89",
        "original_price": "EUR 120",
        "discount_percent": 26,
        "landing_page": "https://www.carismaspa.com/spa-day",
        "cta": "Book Your Spa Day",
        "valid_until": "2026-03-31",
        "restrictions": "Subject to availability. Cannot be combined with other offers."
      }
    ]
  }
}
```

### script_frameworks.json Structure (Expected)

```json
{
  "frameworks": [
    {
      "format_id": "ugc_hook_body_cta",
      "name": "UGC Hook-Body-CTA",
      "duration_seconds": 30,
      "structure": [
        {"section": "hook", "duration": "3-5s", "description": "Opening hook that stops the scroll"},
        {"section": "problem", "duration": "5-7s", "description": "Relatable problem or desire"},
        {"section": "solution", "duration": "8-10s", "description": "Present the offer as the solution"},
        {"section": "proof", "duration": "5-7s", "description": "Social proof or result"},
        {"section": "cta", "duration": "3-5s", "description": "Clear call to action with urgency"}
      ],
      "production_type": "manual",
      "notes": "Requires UGC talent or founder on camera"
    },
    {
      "format_id": "static_offer",
      "name": "Static Offer Card",
      "structure": [
        {"section": "headline", "description": "Hook text as headline"},
        {"section": "subheadline", "description": "Offer details"},
        {"section": "visual", "description": "Product/service image"},
        {"section": "cta_button", "description": "Call to action button"}
      ],
      "production_type": "automated",
      "notes": "Can be produced via Figma template"
    }
  ]
}
```

## Tools Used

| Tool | Purpose |
|------|---------|
| `tools/generate_script.py` | Generate scripts from hooks + offers + frameworks |

## Step-by-Step Procedure

### Step 1: Determine Script Matrix

For each brand, build a matrix of what scripts to generate:

1. **Select hooks:** Take the top 6-8 hooks from the hook bank (highest composite scores)
2. **Select offers:** All active offers from `config/offers.json`
3. **Select formats:** Creative formats listed in the brand's `brands.json` entry
4. **Build combos:** Not every hook x offer x format combination makes sense

Decision logic for valid combinations:
- Question hooks work with all formats
- Bold claim hooks work best with video (UGC, founder-led)
- Social proof hooks work best with testimonial format
- Urgency hooks require an offer with a deadline (`valid_until`)
- Static offer format pairs with any hook but needs a strong visual offer

Aim for 8-12 scripts per brand per week (manageable production volume).

### Step 2: Generate Scripts

Run `tools/generate_script.py` for each valid combination:

```
--hook_bank ".tmp/research/hooks_{brand}_{date}.json"
--hook_id "<selected_hook_id>"
--offer_id "<offer_id>"
--format_id "<format_id>"
--brands_config "config/brands.json"
--brand_id "<brand_id>"
--frameworks_config "config/script_frameworks.json"
--offers_config "config/offers.json"
--variations 2
--output ".tmp/scripts/script_{brand}_{offer}_{format}_{date}.json"
```

For each combination, generate **2 variations**:
- **Variation A:** Faithful to the hook and framework structure
- **Variation B:** Same hook but different body approach (e.g., different problem angle, different proof point)

### Step 3: Script Content Generation

The AI (this agent) generates the actual script text following the framework structure. For each section of the script:

**UGC Hook-Body-CTA Example:**

```
HOOK (3-5s):
"When was the last time you did something just for you?"
[Talent speaks directly to camera, casual setting]

PROBLEM (5-7s):
"Between work, the kids, and everything else... you keep putting yourself last.
And honestly? It shows. Not on the outside, but in how you feel."
[Talent walking, relatable daily life b-roll]

SOLUTION (8-10s):
"That's why I booked the Spa Day Package at Carisma Spa.
89 euro for a full day -- massage, facial, pool access.
It's like pressing pause on everything."
[Cut to spa footage, treatment rooms, relaxation]

PROOF (5-7s):
"I went last month and I'm already going back.
It's become my thing. My reset."
[Talent looking refreshed, genuine smile]

CTA (3-5s):
"Book your spa day. Link in the description.
You deserve this."
[Carisma Spa logo, link overlay]
```

### Step 4: Validate Brand Voice

For each generated script, check against brand voice guidelines:

**Automated checks:**
- [ ] No words from the "don't" list used (clinical, salesy, pushy, etc.)
- [ ] Sensory/empowering language present (per brand guidelines)
- [ ] Correct British English spelling (colour, favourite, specialise)
- [ ] Offer details match `offers.json` exactly (price, name, restrictions)
- [ ] CTA matches the offer's specified CTA text
- [ ] Script length matches framework duration target (+/- 15%)

**Flag for human review if:**
- Script makes medical claims (aesthetics brand)
- Before/after language is used (Meta policy risk)
- Specific results or timelines are promised
- Script exceeds duration target by more than 20%

### Step 5: Validate Meta Policy Compliance

Check each script against known Meta Advertising Policies:

| Policy Area | Check | Action if Violated |
|-------------|-------|-------------------|
| Personal attributes | No "Are you..." questions about health/appearance | Rewrite to third person |
| Before/after | No implied transformation promises | Use "feel" not "look" framing |
| Health claims | No specific medical outcome claims | Add "results may vary" or rewrite |
| Misleading claims | No false urgency or fake scarcity | Ensure scarcity is real |
| Discrimination | No exclusionary language | Review targeting alignment |

### Step 6: Output Scripts

Each script file contains:

```json
{
  "script_id": "CS_SpaDay_UGC_Question_20260215_v1",
  "brand_id": "carisma_spa",
  "hook_id": "hook_001",
  "offer_id": "spa_day_package",
  "format_id": "ugc_hook_body_cta",
  "variation": "A",
  "generated_date": "2026-02-15",
  "ad_name": "CS_SpaDay_UGC_QuestionHook_v1",
  "script": {
    "hook": {
      "text": "When was the last time you did something just for you?",
      "duration_seconds": 4,
      "visual_direction": "Talent speaks directly to camera, natural lighting, casual setting"
    },
    "problem": {
      "text": "Between work, the kids, and everything else... you keep putting yourself last. And honestly? It shows. Not on the outside, but in how you feel.",
      "duration_seconds": 6,
      "visual_direction": "Talent walking through daily routine, relatable b-roll"
    },
    "solution": {
      "text": "That's why I booked the Spa Day Package at Carisma Spa. 89 euro for a full day: massage, facial, pool access. It's like pressing pause on everything.",
      "duration_seconds": 9,
      "visual_direction": "Cut to spa footage: treatment rooms, pool, relaxation areas"
    },
    "proof": {
      "text": "I went last month and I'm already going back. It's become my thing. My reset.",
      "duration_seconds": 5,
      "visual_direction": "Talent looking refreshed, genuine smile, spa environment"
    },
    "cta": {
      "text": "Book your spa day. Link in the description. You deserve this.",
      "duration_seconds": 4,
      "visual_direction": "Carisma Spa logo, booking link overlay, soft music fade"
    }
  },
  "total_duration_seconds": 28,
  "production_type": "manual",
  "brand_voice_check": {
    "passed": true,
    "flags": []
  },
  "meta_policy_check": {
    "passed": true,
    "flags": []
  },
  "notes": "Strong emotional hook with proven competitor pattern. Consider filming in two locations for variation B."
}
```

## Expected Outputs

| Output | Path | Description |
|--------|------|-------------|
| Script files | `.tmp/scripts/script_{brand}_{offer}_{format}_{date}.json` | One file per script, 2 variations each |
| Script index | `.tmp/scripts/index_{brand}_{date}.json` | Summary of all generated scripts with status |

### Script Index Structure

```json
{
  "brand_id": "carisma_spa",
  "generated_date": "2026-02-15",
  "total_scripts": 10,
  "by_format": {
    "ugc_hook_body_cta": 4,
    "founder_led": 2,
    "testimonial": 2,
    "static_offer": 2
  },
  "by_offer": {
    "spa_day_package": 6,
    "gift_voucher": 4
  },
  "scripts": [
    {
      "script_id": "CS_SpaDay_UGC_Question_20260215_v1",
      "file": ".tmp/scripts/script_carisma_spa_spa_day_ugc_20260215_v1.json",
      "status": "pending_review",
      "brand_voice_passed": true,
      "meta_policy_passed": true
    }
  ]
}
```

## Edge Cases and Error Handling

### Hook Bank Too Small
- If the hook bank has fewer than 6 hooks, use all available hooks
- Generate 3 variations instead of 2 to maintain volume
- Flag that this week's scripts are less diverse than ideal

### Offer Expired or Invalid
- Before generating, check `valid_until` on each offer
- If an offer has expired, skip it and log a warning
- If all offers for a brand are expired, halt and alert the human

### Script Too Long/Short
- If a generated script exceeds the framework duration by more than 20%, auto-trim
- If a script is more than 20% short, expand the body section
- Log any scripts that required length adjustment

### Brand Voice Violations
- If a script fails brand voice checks, attempt one automatic rewrite
- If the rewrite also fails, flag it for human review with the specific violations noted
- Do not silently pass scripts that violate brand guidelines

### Meta Policy Red Flags
- For aesthetics brand: any script mentioning specific treatments must include appropriate framing
- Never include before/after promises in ad copy (even implied)
- If a hook references personal attributes ("Are you unhappy with your skin?"), rewrite to avoid Meta rejection

## APPROVAL GATE

**This workflow has a mandatory approval gate.**

After all scripts are generated:

1. Present the script index to the human
2. For each script, show: hook, format, offer, key phrases, any flags
3. Human reviews and marks each script as:
   - **Approved** -- proceed to creative brief
   - **Revise** -- agent rewrites based on feedback
   - **Rejected** -- script is dropped from this week's production
4. Only approved scripts proceed to workflow 05 (Creative Briefs)

**Do NOT proceed to workflow 05 until the human has reviewed and approved scripts.**

## Notes

- Quality over quantity. 6 strong scripts are better than 12 mediocre ones.
- The naming convention (`{BrandCode}_{Offer}_{Format}_{HookType}_{Version}`) is critical for downstream analysis. Enforce it strictly.
- Scripts for manual production (UGC, founder-led) need to be practical to film. Avoid complex multi-location shoots or elaborate setups.
- Static offer scripts are simpler but still need compelling copy. Don't treat them as afterthoughts.
