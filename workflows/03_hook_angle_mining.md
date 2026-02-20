# 03 - Hook & Angle Mining

## Objective

Extract, categorise, and rank advertising hooks and angles from two sources: competitor ads (workflow 01 output) and our own winning ads (workflow 02 output). Produce a ranked hook bank of 15-20 hooks per brand that will feed into script generation.

## Required Inputs

| Input | Source | Description |
|-------|--------|-------------|
| `.tmp/research/report_competitor_{brand}_{date}.md` | Workflow 01 output | Competitor research reports with extracted hooks |
| `.tmp/performance/analysis_{brand}_{date}.json` | Workflow 02 output | Own ad analysis with winner classifications |
| `config/brands.json` | Manual config | Brand voice guidelines and offer definitions |

**Prerequisite:** Workflows 01 and 02 must have completed successfully before running this workflow.

## Tools Used

| Tool | Purpose |
|------|---------|
| `tools/extract_hooks.py` | Parse competitor and own ad data, extract and categorise hooks |

## Step-by-Step Procedure

### Step 1: Gather Hook Sources

Collect hooks from two streams:

**Stream A: Competitor Hooks**
- Parse each `.tmp/research/report_competitor_{brand}_{date}.md`
- Extract the opening line / first sentence of every competitor ad
- Note which competitor and what spend range is associated with each hook
- Higher spend = higher confidence the hook is working

**Stream B: Own Winning Hooks**
- Parse `.tmp/performance/analysis_{brand}_{date}.json`
- Filter to ads classified as `winner` or `marginal` (not losers)
- Extract the opening hook from the ad name or the ad creative text
- Note the CPL and lead count for each

### Step 2: Categorise Hooks

Run `tools/extract_hooks.py`:

```
--competitor_reports ".tmp/research/report_competitor_{brand}_{date}.md"
--own_analysis ".tmp/performance/analysis_{brand}_{date}.json"
--brand_id "<brand_id>"
--brands_config "config/brands.json"
--output ".tmp/research/hooks_{brand}_{date}.json"
```

Categorise each hook into one of these types:

| Category | Description | Example |
|----------|-------------|---------|
| **Question** | Opens with a direct question to the viewer | "Tired of feeling stressed after work?" |
| **Bold Claim** | Makes a strong statement or promise | "The best spa experience in Malta. Period." |
| **Curiosity** | Creates an information gap | "Here's why 500 women in Malta are booking this treatment..." |
| **Social Proof** | Leads with others' experiences | "I was sceptical about fillers until I saw my friend's results" |
| **Urgency** | Creates time pressure or scarcity | "Only 3 spots left this week for our signature facial" |
| **Emotional** | Targets a feeling or desire | "You deserve a moment that's just for you" |
| **Pain Point** | Addresses a specific problem | "If your skincare routine isn't working, there's a reason" |
| **Transformation** | Highlights before/after change | "From exhausted mum to glowing in 90 minutes" |

### Step 3: Score and Rank Hooks

Each hook receives a composite score based on three factors:

**Performance Score (0-10):**
- Own winners: 10 points (proven performer)
- Own marginal: 6 points (shows promise)
- Competitor high-spend (top 25%): 8 points (inferred performance)
- Competitor medium-spend (25-75%): 5 points
- Competitor low-spend (bottom 25%): 3 points

**Frequency Score (0-10):**
- Used by 3+ competitors: 8-10 points (validated pattern)
- Used by 2 competitors: 5-7 points
- Used by 1 competitor: 3-4 points
- Unique to us (own winning): 6 points (proven for our audience)

**Novelty Score (0-10):**
- Never used by us before: 10 points
- Used by us but in a different format: 7 points
- Similar to something we've run: 4 points
- Exact repeat of our own ad: 1 point

**Composite Score** = (Performance x 0.4) + (Frequency x 0.3) + (Novelty x 0.3)

### Step 4: Filter for Brand Appropriateness

After scoring, filter hooks against the brand voice guidelines from `brands.json`:

**Carisma Spa filters:**
- Remove hooks that use clinical/medical language
- Remove hooks that sound salesy or pushy
- Remove hooks with excessive urgency (doesn't match warm, inviting tone)
- Prioritise hooks using sensory language and experience-focused framing

**Carisma Aesthetics filters:**
- Remove hooks that shame or create insecurity
- Remove hooks making specific medical claims without disclaimers
- Remove hooks promising specific results or timelines
- Prioritise hooks that emphasise safety, expertise, and empowerment

### Step 5: Compile Hook Bank

Select the top 15-20 hooks per brand, ensuring diversity across categories:

- Minimum 2 hooks per category (if available)
- No more than 5 hooks in any single category
- Balance between proven (own winners) and novel (competitor-inspired)
- Include at least 5 completely new hooks not yet tested

## Expected Outputs

| Output | Path | Description |
|--------|------|-------------|
| Hook bank | `.tmp/research/hooks_{brand}_{date}.json` | Ranked, categorised hook list |

### Output Structure

```json
{
  "brand_id": "carisma_spa",
  "generated_date": "2026-02-15",
  "total_hooks": 18,
  "sources": {
    "own_winners": 5,
    "competitor_inspired": 10,
    "own_marginal_adapted": 3
  },
  "hooks": [
    {
      "hook_id": "hook_001",
      "text": "When was the last time you did something just for you?",
      "category": "question",
      "source": "competitor_inspired",
      "source_detail": "Competitor Spa A, top spend ad, adapted for our voice",
      "performance_score": 8,
      "frequency_score": 7,
      "novelty_score": 9,
      "composite_score": 8.0,
      "brand_voice_check": "pass",
      "meta_policy_check": "pass",
      "suggested_formats": ["ugc_hook_body_cta", "static_offer"],
      "suggested_offers": ["spa_day_package", "gift_voucher"],
      "notes": "Strong emotional appeal, tested pattern across 3 competitors"
    },
    {
      "hook_id": "hook_002",
      "text": "500+ women in Malta trust us with their skin",
      "category": "social_proof",
      "source": "own_winner",
      "source_detail": "CS_SpaDay_UGC_SocialProof_v2, CPL EUR 5.80",
      "performance_score": 10,
      "frequency_score": 6,
      "novelty_score": 4,
      "composite_score": 7.0,
      "brand_voice_check": "pass",
      "meta_policy_check": "pass",
      "suggested_formats": ["ugc_hook_body_cta", "testimonial"],
      "suggested_offers": ["spa_day_package"],
      "notes": "Proven winner, consider new format variations"
    }
  ],
  "category_distribution": {
    "question": 4,
    "bold_claim": 2,
    "curiosity": 3,
    "social_proof": 3,
    "urgency": 1,
    "emotional": 3,
    "pain_point": 1,
    "transformation": 1
  }
}
```

## Edge Cases and Error Handling

### No Competitor Data Available
- If workflow 01 returned no results for a brand's competitors:
  - Rely entirely on own ad data (Stream B)
  - Supplement with generic hooks from `config/script_frameworks.json` hook templates
  - Clearly flag that the hook bank is based solely on own data

### No Own Winners
- If workflow 02 classified zero ads as winners:
  - Rely entirely on competitor hooks (Stream A)
  - Include own marginal ads as secondary source
  - Flag that we have no proven hooks and this week is more experimental

### Duplicate or Near-Duplicate Hooks
- Use fuzzy string matching (Levenshtein distance or similar) to detect near-duplicates
- If two hooks are > 80% similar, keep the one with the higher composite score
- Log deduplicated hooks for transparency

### Insufficient Hooks
- If fewer than 15 hooks survive filtering:
  - Lower the brand voice filter strictness (warn but don't hard-reject)
  - Include hooks from the "needs_data" category of own ads
  - Generate synthetic variations of the top hooks (same structure, different angle)
  - Clearly mark synthetic hooks as `source: "generated"`

### Hook-to-Offer Mismatch
- Some hooks only work with specific offers (e.g., urgency hooks need a time-limited offer)
- The `suggested_offers` field should reflect this
- If a hook doesn't naturally pair with any active offer, flag it as `limited_applicability`

## Approval Gate

This workflow feeds into **Gate 1** (Research Review) defined in `workflows/00_master_orchestration.md`.

The human should review:
- Hook quality and brand voice alignment
- Category distribution (is it diverse enough?)
- Any hooks that feel off-brand or could cause Meta policy issues
- Whether the suggested format/offer pairings make sense

## Notes

- The hook bank is the creative fuel for the entire week. Higher quality hooks here = better scripts downstream.
- Keep a cumulative hook archive (separate from weekly bank) to track which hooks have been tested and their results over time.
- Hooks that were winners should be iterated on, not simply repeated. The novelty score helps ensure we keep testing fresh approaches.
- For aesthetics hooks, always double-check Meta's advertising policies on health and appearance claims before including in the bank.
