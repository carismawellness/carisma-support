# 05 — Allocate SG&A and Proportional Fixed Costs

## Objective

Allocate central SG&A costs to individual spas using the configured allocation methods. Also allocate proportional fixed costs (towels, linens, slippers) by revenue ratio.

## Required Inputs

- Data from `Raw - SG&A Detail` tab (ingested in Skill 01)
- Data from `Raw - Fixed Costs` tab (ingested in Skill 01)
- Per-spa revenue from Skill 02
- Per-spa salary totals from Skill 04
- `config/sga-split-config.json` — allocation rules
- `config/proportional-fixed-costs.json` — fixed cost items
- `config/spa-list.json` — active spas
- `knowledge/sga-allocation-rules.md` — methodology explanation

## Execution Steps — SG&A Allocation

### Step 1: Read Configuration

Read `config/sga-split-config.json` for current allocation rules.
Read `knowledge/sga-allocation-rules.md` for methodology context.

### Step 2: Categorize SG&A Line Items

From `Raw - SG&A Detail` data, categorize each line item into one of:
1. **by_salary_ratio pool** — items categorized as "Split by salary cost"
2. **by_sales_ratio pool** — items categorized as "Split by sales ratio among all the Spa's"
3. **equal_split pool** — items categorized as "Split equally among all 8 Spa"
4. **Direct allocation** — items where a specific spa name appears in the description

Sum each pool total.

### Step 3: Calculate Salary Ratio Allocation

For each spa:
1. Get spa salary from Skill 04 results
2. Get total salary (sum of all spas, excluding Corporate)
3. `ratio = spa_salary / total_salary`
4. `allocation = ratio * salary_pool_total`

### Step 4: Calculate Sales Ratio Allocation

For each spa:
1. Get spa revenue from Skill 02 results
2. Get total revenue (sum of all spas)
3. `ratio = spa_revenue / total_revenue`
4. `allocation = ratio * sales_pool_total`

### Step 5: Calculate Equal Split

For each spa:
1. Get number of active spas from `config/spa-list.json`
2. `allocation = equal_pool_total / number_of_active_spas`

### Step 6: Apply Direct Allocations

For each direct-allocation line item:
1. Match spa name (or short_name) in the description
2. Allocate the full amount to that spa
3. If no spa matches: flag for review and add to equal split pool

### Step 7: Sum Per-Spa SG&A

For each spa:
`Total SG&A = salary_ratio_allocation + sales_ratio_allocation + equal_split_allocation + direct_allocations`

### Step 8: Verify Allocation

`sum(all_spa_sga) should equal sum(all_sga_source_items)`
- If variance < €1.00: PASS
- If variance >= €1.00: FLAG — some items may not have been categorized

## Execution Steps — Proportional Fixed Costs

### Step 9: Read Fixed Costs

Read `config/proportional-fixed-costs.json` for the item list.
Read `Raw - Fixed Costs` tab for weekly amounts.

### Step 10: Allocate by Revenue Ratio

For each cost item with a weekly amount:
1. Get each spa's revenue from Skill 02
2. `spa_share = (spa_revenue / total_revenue) * cost_item_amount`
3. Sum all cost items per spa

### Step 11: Add to SG&A or Track Separately

Add proportional fixed costs to each spa's overhead. These flow into the EBITDA calculation alongside SG&A.

## Output

### Write SG&A Allocation Audit Trail

Write to the `SG&A Allocation` output tab in the Google Sheet:

| Spa | Salary | SG&A by Salary | Revenue | SG&A by Sales | SG&A Equal | Direct | Prop. Fixed Costs | Total Overhead |
|-----|--------|----------------|---------|---------------|------------|--------|-------------------|----------------|
| InterContinental | [val] | [val] | [val] | [val] | [val] | [val] | [val] | [val] |
| Hugos | [val] | [val] | [val] | [val] | [val] | [val] | [val] | [val] |
| Hyatt | [val] | [val] | [val] | [val] | [val] | [val] | [val] | [val] |
| Ramla | [val] | [val] | [val] | [val] | [val] | [val] | [val] | [val] |
| Labranda | [val] | [val] | [val] | [val] | [val] | [val] | [val] | [val] |
| Sunny Coast | [val] | [val] | [val] | [val] | [val] | [val] | [val] | [val] |
| Excelsior | [val] | [val] | [val] | [val] | [val] | [val] | [val] | [val] |
| Novotel | [val] | [val] | [val] | [val] | [val] | [val] | [val] | [val] |

### Report

Present allocation summary and verification status.

## Known Quirks

- Pool totals come from the SG&A source data, not from the config (config just defines the methodology)
- When a new spa is added, it changes the equal split denominator and the ratio denominators
- Some SG&A items may have ambiguous descriptions — when in doubt, add to the sales ratio pool

---

## Known Issues & Learnings

> Updated when this skill encounters failures, edge cases, or better methods.
> Always check this section before executing the skill.
> Log full context in `miscellaneous/learnings/LEARNINGS.md` under Skill Learnings.

<!--
Entry format:
### [YYYY-MM-DD] — [Issue Title]
**What happened:** Brief description
**Root cause:** Why it happened
**Fix:** What was changed
**Rule:** ALWAYS/NEVER directive (also added to root CLAUDE.md if universal)
-->

_No issues logged yet._
