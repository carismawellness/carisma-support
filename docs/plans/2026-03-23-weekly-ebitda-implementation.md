# Weekly EBITDA Calculation — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a knowledge-driven agent system that automates weekly EBITDA reconciliation and compilation for Carisma Wellness Group across Spa (8 locations), Aesthetics, Slimming, and Velvet business units.

**Architecture:** WAT (Workflows, Agents, Tools) — Skills define step-by-step instructions, knowledge base provides business context, config files hold evolving rules (SG&A allocation, rent, spa list). The Google Sheet is the I/O surface: user pastes raw exports into input tabs, agent reads via MCP, computes EBITDA, writes results to output tabs. No new Python tools required — uses Google Sheets MCP directly.

**Tech Stack:** Markdown skills + knowledge, JSON config, Google Sheets MCP (read/write), existing `tools/read_google_sheet.py` and `tools/update_google_sheet.py` for reference patterns.

**Reference Design:** `docs/plans/2026-03-23-weekly-ebitda-calculation-design.md`

---

## Task 1: Create Folder Structure

**Files:**
- Create: `finance/Weekly EBITDA Calculation/CLAUDE.md`
- Create: `finance/Weekly EBITDA Calculation/knowledge/.gitkeep`
- Create: `finance/Weekly EBITDA Calculation/skills/.gitkeep`
- Create: `finance/Weekly EBITDA Calculation/config/.gitkeep`

**Step 1: Create directories and placeholder CLAUDE.md**

Create the folder structure with a CLAUDE.md that defines the agent's role, references knowledge and config, and establishes the self-improvement loop. Follow the pattern from `finance/CLAUDE.md` but specific to EBITDA.

The CLAUDE.md should contain:
- Purpose: Weekly EBITDA calculation and reconciliation agent
- Scope: All 3 business units (Spa, Aesthetics/Slimming, Velvet)
- How it works: Read raw data from Google Sheet input tabs → apply business logic → write EBITDA output → run reconciliation
- Reference to knowledge/, skills/, and config/ for context
- Approval gate: Always present summary before writing output
- Self-improvement loop section with Active Rules (empty initially)
- Instruction to read `skills/00-weekly-ebitda.md` when user says "run weekly EBITDA"

**Step 2: Commit**

```bash
git add "finance/Weekly EBITDA Calculation/"
git commit -m "feat: scaffold Weekly EBITDA Calculation folder structure"
```

---

## Task 2: Write Config Files

**Files:**
- Create: `finance/Weekly EBITDA Calculation/config/spa-list.json`
- Create: `finance/Weekly EBITDA Calculation/config/rent-schedule.json`
- Create: `finance/Weekly EBITDA Calculation/config/sga-split-config.json`
- Create: `finance/Weekly EBITDA Calculation/config/sheet-mapping.json`

**Step 1: Write `spa-list.json`**

Active spas with metadata. Source: the EBITDA and Spa specific P&L sheets from the reference workbook.

```json
{
  "spas": [
    {
      "name": "InterContinental",
      "short_name": "Inter",
      "status": "active",
      "has_rent": true,
      "notes": "Largest spa by revenue"
    },
    {
      "name": "Hugos",
      "short_name": "Hugos",
      "status": "active",
      "has_rent": false,
      "notes": "No separate rent line"
    },
    {
      "name": "Hyatt",
      "short_name": "Hyatt",
      "status": "active",
      "has_rent": false,
      "notes": ""
    },
    {
      "name": "Ramla",
      "short_name": "Ramla",
      "status": "active",
      "has_rent": false,
      "notes": ""
    },
    {
      "name": "Labranda",
      "short_name": "Labranda",
      "status": "active",
      "has_rent": false,
      "notes": "Seasonal variation"
    },
    {
      "name": "Sunny Coast",
      "short_name": "Sunny",
      "status": "active",
      "has_rent": false,
      "notes": "Also referred to as Seashells/Sunny Coast & Qawra"
    },
    {
      "name": "Excelsior",
      "short_name": "Excelsior",
      "status": "active",
      "has_rent": false,
      "notes": "Added Jul 2025"
    },
    {
      "name": "Novotel",
      "short_name": "Novotel",
      "status": "active",
      "has_rent": false,
      "notes": "Added Oct 2025"
    }
  ],
  "corporate": {
    "name": "Corporate",
    "short_name": "Centre",
    "notes": "Central overhead — not a revenue-generating spa. Also called 'Center' or 'Centre'."
  },
  "other_units": [
    {
      "name": "Aesthetics",
      "status": "active",
      "vat_rate_services": 0.18,
      "vat_rate_doctors": 0.12,
      "notes": "Doctor payouts are a separate cost line. VAT varies by service type."
    },
    {
      "name": "Slimming",
      "status": "active",
      "notes": "Added Feb 2026. Separate P&L."
    },
    {
      "name": "Velvet",
      "status": "dormant",
      "notes": "Currently showing 0 EBITDA. May become active again."
    }
  ]
}
```

**Step 2: Write `rent-schedule.json`**

Fixed rent amounts per spa per period. Source: Spa specific P&L rows 21/43/etc.

```json
{
  "description": "Fixed monthly rent by spa. Update when rent changes.",
  "current_period": "2026-02",
  "rents": {
    "InterContinental": 5100,
    "Hugos": 0,
    "Hyatt": 0,
    "Ramla": 0,
    "Labranda": 0,
    "Sunny Coast": 0,
    "Excelsior": 0,
    "Novotel": 0
  },
  "total_rent": 18452.15,
  "notes": "Total rent from Spa P&L row 12. InterContinental is the only spa with a direct rent line in the per-spa breakdown. The remainder (18452.15 - 5100 = 13352.15) is allocated at the consolidated Spa P&L level.",
  "history": [
    { "period": "2024-01 to 2024-06", "InterContinental": 4400, "total": 8233 },
    { "period": "2024-07 to 2024-12", "InterContinental": 5100, "total": 8933 },
    { "period": "2025-01 to 2025-06", "InterContinental": 5100, "total": 10299 },
    { "period": "2025-07 to 2025-11", "InterContinental": 5100, "total": 10340 },
    { "period": "2025-12", "InterContinental": 5100, "total": 20946.42 },
    { "period": "2026-01 to present", "InterContinental": 5100, "total": 18452.15 }
  ]
}
```

**Step 3: Write `sga-split-config.json`**

SG&A allocation rules. Source: SG&A Split sheets.

```json
{
  "description": "SG&A allocation configuration. Update when methodology changes.",
  "current_period": "2026-02",
  "active_spas": ["Hugos", "Hyatt", "InterContinental", "Labranda", "Ramla", "Excelsior", "Novotel", "Sunny Coast"],
  "allocation_methods": {
    "by_salary_ratio": {
      "enabled": true,
      "pool_amount": null,
      "description": "Split proportionally by each spa's salary cost / total salary cost. Pool amount read from Raw - SG&A Detail tab, category 'Split by salary cost'."
    },
    "by_sales_ratio": {
      "enabled": true,
      "pool_amount": null,
      "description": "Split proportionally by each spa's revenue / total revenue. Pool amount read from Raw - SG&A Detail tab, category 'Split by sales ratio among all the Spas'."
    },
    "equal_split": {
      "enabled": true,
      "pool_amount": null,
      "description": "Split equally among all active spas. Pool amount read from Raw - SG&A Detail tab, category 'Split equally among all 8 Spa'."
    }
  },
  "direct_allocations": {
    "description": "Line items allocated directly to a specific spa by name match in the description field. Read from Raw - SG&A Detail tab where the spa name appears in the row.",
    "matching_rules": "Match spa name (or short_name from spa-list.json) in the SG&A line item description. Items not matching any spa go into the allocation pools above."
  },
  "formula": {
    "per_spa_sga": "SG&A_salary_ratio + SG&A_sales_ratio + SG&A_equal_split + direct_allocations",
    "salary_ratio_formula": "(spa_salary / total_salary) * salary_pool_amount",
    "sales_ratio_formula": "(spa_revenue / total_revenue) * sales_pool_amount",
    "equal_split_formula": "equal_pool_amount / number_of_active_spas"
  }
}
```

**Step 4: Write `sheet-mapping.json`**

Google Sheet tab names and structure. The spreadsheet_id will be filled in once the Google Sheet is created.

```json
{
  "description": "Google Sheet mapping for the Weekly EBITDA workbook. Update spreadsheet_id after creating the sheet.",
  "spreadsheet_id": "PLACEHOLDER — fill after creating Google Sheet",
  "input_tabs": {
    "zoho_spa_pl": {
      "tab_name": "Raw - Zoho Spa P&L",
      "description": "Full P&L export from Zoho Books for Carisma Spa & Wellness International Ltd.",
      "expected_columns": ["Account", "Account Code", "Total"],
      "source": "Zoho Books → Reports → Profit and Loss → Export"
    },
    "zoho_aesthetics_pl": {
      "tab_name": "Raw - Zoho Aesthetics P&L",
      "description": "Full P&L export from Zoho Books for Aesthetics entity.",
      "expected_columns": ["Account", "Account Code", "Total"],
      "source": "Zoho Books → Reports → Profit and Loss → Export"
    },
    "lapis_revenue": {
      "tab_name": "Raw - Lapis Revenue",
      "description": "Revenue by spa location, split by Service vs Product. Already VAT-exclusive from Lapis.",
      "expected_columns": ["Spa", "Type", "Amount"],
      "source": "Lapis POS → Quick Service Search + Material Report"
    },
    "lapis_cogs": {
      "tab_name": "Raw - Lapis COGS",
      "description": "Cost of goods sold by product line (Phytomer, Purest, Others) per spa.",
      "expected_columns": ["Spa", "Product Line", "Amount"],
      "source": "Lapis POS → Product reports"
    },
    "payroll": {
      "tab_name": "Raw - Payroll",
      "description": "Monthly payroll data by employee with spa assignment.",
      "expected_columns": ["Employee", "Salary", "Spa/Department"],
      "source": "Payroll Google Sheet (bank-paid salaries)"
    },
    "cash_salaries": {
      "tab_name": "Raw - Cash Salaries",
      "description": "Cash salary payments by employee with spa assignment.",
      "expected_columns": ["Employee ID", "Employee Name", "Cash Amount", "Spa/Department"],
      "source": "Manual entry"
    },
    "sga_detail": {
      "tab_name": "Raw - SG&A Detail",
      "description": "SG&A line items with allocation categories. Must include the 3 pool totals and any direct allocations.",
      "expected_columns": ["Description", "Amount", "Category"],
      "source": "Zoho Books → SG&A expense report"
    },
    "aesthetics_data": {
      "tab_name": "Raw - Aesthetics Data",
      "description": "Aesthetics-specific data: revenue, doctor payouts, staff costs, COGS.",
      "expected_columns": ["Line Item", "Amount"],
      "source": "Manual/Zoho composite"
    }
  },
  "output_tabs": {
    "ebitda_summary": {
      "tab_name": "EBITDA Summary",
      "description": "Group-level EBITDA by period. Spa total + Aesthetics + Slimming + Velvet."
    },
    "spa_pl": {
      "tab_name": "Spa P&L",
      "description": "Consolidated Spa P&L: Revenue, COGS, Gross Profit, Salaries, SG&A, Rent, EBITDA."
    },
    "spa_detail": {
      "tab_name": "Spa Detail",
      "description": "Per-spa P&L breakdown for all 8 locations + Corporate."
    },
    "aesthetics_pl": {
      "tab_name": "Aesthetics P&L",
      "description": "Aesthetics and Slimming P&L with doctor payouts."
    },
    "sga_allocation": {
      "tab_name": "SG&A Allocation",
      "description": "Full SG&A allocation audit trail showing each method and direct allocations."
    },
    "reconciliation": {
      "tab_name": "Reconciliation",
      "description": "Revenue, Salaries, SG&A, and Rent checks with pass/fail and variance."
    }
  }
}
```

**Step 5: Commit**

```bash
git add "finance/Weekly EBITDA Calculation/config/"
git commit -m "feat: add EBITDA config files (spas, rent, SG&A rules, sheet mapping)"
```

---

## Task 3: Write Knowledge Base

**Files:**
- Create: `finance/Weekly EBITDA Calculation/knowledge/ebitda-structure.md`
- Create: `finance/Weekly EBITDA Calculation/knowledge/spa-locations.md`
- Create: `finance/Weekly EBITDA Calculation/knowledge/aesthetics-slimming.md`
- Create: `finance/Weekly EBITDA Calculation/knowledge/sga-allocation-rules.md`
- Create: `finance/Weekly EBITDA Calculation/knowledge/data-sources.md`
- Create: `finance/Weekly EBITDA Calculation/knowledge/reconciliation-rules.md`
- Create: `finance/Weekly EBITDA Calculation/knowledge/velvet.md`

**Step 1: Write `ebitda-structure.md`**

This is the core reference document. It must define:
- The EBITDA formula: `EBITDA = Revenue - COGS - Salaries - SG&A - Rent`
- The business unit hierarchy: Spa (8 locations + Corporate) → Aesthetics → Slimming → Velvet → Group
- Line item definitions for each component:
  - **Revenue**: Service + Product, VAT-exclusive. Spa revenue comes from Lapis. Aesthetics has different VAT rates.
  - **COGS**: By product line (Phytomer, Purest, Others). Calculated per spa.
  - **Gross Profit**: Revenue - COGS. Track gross margin %.
  - **Salaries**: Payroll (bank) + Cash. Each employee mapped to a spa. Corporate/Centre employees are overhead.
  - **SG&A**: Centrally allocated via configurable split methods. See `sga-allocation-rules.md`.
  - **Rent**: Fixed per spa per period. See `config/rent-schedule.json`.
- The two EBITDA variants: Standard (includes Corporate overhead) and "Excluding Center" (strips out Corporate)
- EBITDA % = EBITDA / Revenue
- Group EBITDA = Spa Total + Aesthetics + Slimming + Velvet

Source all numbers from the reference workbook: `finance/EBITA Working_Jan 2026 and Feb 2026.xlsx`

**Step 2: Write `spa-locations.md`**

Per-spa reference:
- For each of the 8 spas: full name, short name, Zoho account codes for Service and Product revenue (from Spa Zoho sheets), which hotel it's in, when it was added (Excelsior Jul 2025, Novotel Oct 2025), any quirks
- Corporate/Centre: not a revenue spa, absorbs overhead salaries and costs
- Revenue account codes per spa (from Spa Zoho Jan 26 sheet):
  - Inter: Service 501100, Product 501200
  - Hugos: Service 503100, Product 503200
  - Hyatt: Service 502100, Product 502200
  - Ramla: Service 505100, Product 505200
  - Labranda: Service 4008, Product 4007
  - Sunny Coast: Service 504100, Product 504200
  - Excelsior: Service 504102, Product 504101
  - Novotel: Service 506204, Product 504103
- Cash Salary employee → spa mapping (from Cash Salary sheet)
- Lapis revenue categories per spa

**Step 3: Write `aesthetics-slimming.md`**

- Aesthetics P&L structure: Revenue (12% VAT for doctors, 18% for others) → COGS → Gross Profit → Doctor Payouts → Staff Salaries → SG&A → EBITDA
- Slimming: newly added Feb 2026, separate P&L line
- Combined "Aesthetics & Slimming" total
- Key staff: doctor payouts are variable costs based on procedures performed
- Salary structure: specific named employees (from the spreadsheet)

**Step 4: Write `sga-allocation-rules.md`**

Detailed explanation of the 3-method + direct allocation system:
1. **By salary ratio**: Each spa's share of total payroll determines its share of this pool. Formula: `(spa_salary / total_salary) * pool_amount`
2. **By sales ratio**: Each spa's share of total revenue determines its share. Formula: `(spa_revenue / total_revenue) * pool_amount`
3. **Equal split**: Pool divided equally among all active spas. Formula: `pool_amount / num_spas`
4. **Direct allocations**: Line items with a spa name in the description go directly to that spa

The 3 pools come from the SG&A source data, categorized by type. Reference `config/sga-split-config.json` for current rules.

Explain when and why the methodology changes (new spas change the denominator, different expense categories may shift between pools).

**Step 5: Write `data-sources.md`**

Document every data source:
- **Lapis POS**: What it provides (revenue by spa, product sales, refunds, discounts). How to export. What to look for.
- **Zoho Books**: P&L by entity. How to export. Account code reference.
- **Payroll Google Sheet**: Link (from cell B10 of Spa P&L). Structure: employee, salary, department.
- **Cash Salaries**: Manual record of cash-paid employees. Structure: employee ID, name, cash amount, spa assignment.
- **Zoho People**: Employee lifecycle reports (for turnover/tenure, referenced in EBITDA row B17).

For each source, document: what format the export comes in, which Google Sheet input tab it maps to, and any gotchas (e.g., "Sales" line in Zoho is a catch-all, "Cost of goods sold" in Zoho includes wholesale errors per the note in the spreadsheet).

**Step 6: Write `reconciliation-rules.md`**

The 4 reconciliation checks:
1. **Revenue Check**: Sum of per-spa revenues must equal total Spa P&L revenue. Threshold: < 1.00 absolute variance (near-zero floating point).
2. **Salaries Check**: Total payroll + cash must match total salary line in Spa P&L. Threshold: < 1.00.
3. **SG&A Check**: Sum of allocated SG&A across all spas must equal total SG&A from source. Threshold: < 1.00.
4. **Rent Check**: Expected rent (from config) must match actual rent in P&L. Threshold: exact match.

For each check: what to do when it fails (common causes, where to look, how to fix).

Also document the "Revenue Check (diff between Total P&L and each Spa level P&L)" row from the EBITDA sheet — this catches mismatches between Zoho totals and Lapis-derived per-spa totals.

**Step 7: Write `velvet.md`**

Brief doc for Velvet:
- Separate business unit with its own EBITDA line
- Currently showing 0 EBITDA since Nov 2025
- Structure: EBITDA and EBITDA % tracked monthly
- Historical data available from Jan 2024 onwards
- When Velvet becomes active again, it feeds into Group EBITDA total

**Step 8: Commit**

```bash
git add "finance/Weekly EBITDA Calculation/knowledge/"
git commit -m "feat: add EBITDA knowledge base (structure, spas, aesthetics, SG&A, sources, reconciliation, velvet)"
```

---

## Task 4: Write Skills — Data Ingestion (Skills 00, 01)

**Files:**
- Create: `finance/Weekly EBITDA Calculation/skills/00-weekly-ebitda.md`
- Create: `finance/Weekly EBITDA Calculation/skills/01-ingest-data.md`

**Step 1: Write `00-weekly-ebitda.md` (master orchestration)**

Follow the pattern from `workflows/00_master_orchestration.md`. This skill:

- **Trigger**: User says "run weekly EBITDA" or "calculate EBITDA for [month]"
- **Required inputs**: All `Raw -` tabs populated in the Google Sheet
- **Sequence**: Run skills 01 → 02 → 03 → 04 → 05 → 06 → 07 in order
- **Approval gate**: After skill 06, present EBITDA summary to user. After approval, run skill 07 (reconciliation) and then write output.
- **Error handling**: If any skill fails, stop and report. Do not proceed to next skill.
- **Output**: All output tabs populated in the Google Sheet

Include the dependency graph:
```
01 (Ingest) → 02 (Revenue) → 03 (COGS) → 04 (Salaries) → 05 (SG&A) → 06 (EBITDA) → 07 (Reconcile)
```

**Step 2: Write `01-ingest-data.md`**

This skill reads all input tabs and validates data:

- **Objective**: Read all `Raw -` tabs from the Google Sheet and validate the target period has data
- **How to execute**:
  1. Read `config/sheet-mapping.json` to get spreadsheet ID and tab names
  2. For each input tab: use Google Sheets MCP `sheets_read_values` to read the data
  3. Validate: tab exists, has data, has expected column structure
  4. Identify the target period (ask user if ambiguous)
  5. Report: which tabs have data, which are missing, row counts
- **Expected output**: Confirmation that all required input data is present
- **Failure mode**: If any required tab is empty, stop and tell the user which data to paste

**Step 3: Commit**

```bash
git add "finance/Weekly EBITDA Calculation/skills/00-weekly-ebitda.md" "finance/Weekly EBITDA Calculation/skills/01-ingest-data.md"
git commit -m "feat: add master orchestration and data ingestion skills"
```

---

## Task 5: Write Skills — Revenue and COGS (Skills 02, 03)

**Files:**
- Create: `finance/Weekly EBITDA Calculation/skills/02-calculate-revenue.md`
- Create: `finance/Weekly EBITDA Calculation/skills/03-calculate-cogs.md`

**Step 1: Write `02-calculate-revenue.md`**

- **Objective**: Calculate revenue per spa (Service + Product) from Lapis data
- **How to execute**:
  1. Read `Raw - Lapis Revenue` tab
  2. For each spa in `config/spa-list.json`: sum Service revenue + Product revenue
  3. For Aesthetics: apply VAT exclusion (18% standard, 12% for doctor services). Formula: `amount / (1 + vat_rate)`
  4. For Slimming: separate revenue line (Services + Book/Product)
  5. Cross-reference totals against `Raw - Zoho Spa P&L` operating income total
  6. Handle known items: Sales Discount, Sales Refund, Wholesale Product (Centre sales)
  7. Report per-spa revenue breakdown
- **Refer to**: `knowledge/spa-locations.md` for account codes, `knowledge/ebitda-structure.md` for definitions
- **Known quirks**: The "Sales" line (no spa designation) in Zoho is a catch-all — note from workbook says "Taken from Lapis"

**Step 2: Write `03-calculate-cogs.md`**

- **Objective**: Calculate cost of goods sold by product line per spa
- **How to execute**:
  1. Read `Raw - Lapis COGS` tab
  2. For each spa: separate COGS into Phytomer, Purest, Others
  3. Calculate Gross Profit per spa: `Revenue - COGS`
  4. Calculate Gross Margin %: `Gross Profit / Revenue`
  5. For Aesthetics: COGS from the Aesthetics data tab
  6. Report per-spa gross profit and margin
- **Refer to**: `knowledge/ebitda-structure.md` for product line definitions
- **Known quirks**: Zoho COGS may include wholesale errors (per note in workbook cell G29)

**Step 3: Commit**

```bash
git add "finance/Weekly EBITDA Calculation/skills/02-calculate-revenue.md" "finance/Weekly EBITDA Calculation/skills/03-calculate-cogs.md"
git commit -m "feat: add revenue and COGS calculation skills"
```

---

## Task 6: Write Skills — Salaries and SG&A (Skills 04, 05)

**Files:**
- Create: `finance/Weekly EBITDA Calculation/skills/04-process-salaries.md`
- Create: `finance/Weekly EBITDA Calculation/skills/05-allocate-sga.md`

**Step 1: Write `04-process-salaries.md`**

- **Objective**: Combine payroll and cash salaries, allocate to spas
- **How to execute**:
  1. Read `Raw - Payroll` tab (bank-paid salaries by employee with department)
  2. Read `Raw - Cash Salaries` tab (cash payments by employee with spa)
  3. For each employee: look up spa assignment from the data
  4. Sum total salary (bank + cash) per spa
  5. Corporate/Centre employees: aggregate separately (these are overhead)
  6. For Aesthetics: separate salary lines (specific employees like Leticia, Adrianne, plus doctor payouts)
  7. For Slimming: separate salary lines
  8. Report per-spa salary totals, total payroll, total cash
- **Refer to**: `knowledge/spa-locations.md` for employee → spa mapping, Cash Salary sheet structure
- **Known quirks**: Some employees are part-time/rotational (e.g., Kemi — "Part time rotational, we call only when we need"). Cash employees have an ID number that may change.

**Step 2: Write `05-allocate-sga.md`**

This is the most complex skill — the SG&A allocation.

- **Objective**: Allocate central SG&A costs to individual spas using configurable methods
- **How to execute**:
  1. Read `config/sga-split-config.json` for current allocation rules
  2. Read `Raw - SG&A Detail` tab
  3. Categorize each SG&A line item into one of: by_salary_ratio pool, by_sales_ratio pool, equal_split pool, or direct allocation (spa name match)
  4. Calculate pool totals for each allocation method
  5. For **salary ratio**: get each spa's salary from Step 04 results. Calculate ratio = `spa_salary / total_salary`. Allocation = `ratio * salary_pool`
  6. For **sales ratio**: get each spa's revenue from Step 02 results. Calculate ratio = `spa_revenue / total_revenue`. Allocation = `ratio * sales_pool`
  7. For **equal split**: allocation = `equal_pool / num_active_spas`
  8. For **direct allocations**: match spa name in description, allocate directly
  9. Per-spa total SG&A = sum of all 4 components
  10. Write allocation audit trail to `SG&A Allocation` output tab
  11. Verify: sum of all spa allocations = total SG&A from source
- **Refer to**: `knowledge/sga-allocation-rules.md` for methodology, `config/sga-split-config.json` for rules
- **Output format for audit trail**:

| Spa | Salary | SG&A by Salary | Revenue | SG&A by Sales | SG&A Equal | Direct | Total SG&A |
|-----|--------|---------------|---------|---------------|------------|--------|-----------|

**Step 3: Commit**

```bash
git add "finance/Weekly EBITDA Calculation/skills/04-process-salaries.md" "finance/Weekly EBITDA Calculation/skills/05-allocate-sga.md"
git commit -m "feat: add salary processing and SG&A allocation skills"
```

---

## Task 7: Write Skills — EBITDA Calculation and Reconciliation (Skills 06, 07)

**Files:**
- Create: `finance/Weekly EBITDA Calculation/skills/06-calculate-ebitda.md`
- Create: `finance/Weekly EBITDA Calculation/skills/07-reconcile.md`

**Step 1: Write `06-calculate-ebitda.md`**

- **Objective**: Calculate EBITDA per spa, per business unit, and group total
- **How to execute**:
  1. For each spa: `EBITDA = Gross Profit - Salaries - SG&A - Rent`
     - Gross Profit from skill 03
     - Salaries from skill 04
     - SG&A from skill 05
     - Rent from `config/rent-schedule.json`
  2. Calculate EBITDA % per spa: `EBITDA / Revenue`
  3. Calculate Spa Total: sum of all 8 spas + Corporate
  4. Calculate "EBITDA Excluding Center": Spa Total without Corporate overhead (this shows operational EBITDA before HQ costs)
  5. For Aesthetics: `EBITDA = Gross Profit - Doctor Payouts - Salaries - SG&A`
  6. For Slimming: same structure as Aesthetics
  7. For Velvet: read current period value (may be 0)
  8. Group Total: `Spa EBITDA + Aesthetics EBITDA + Slimming EBITDA + Velvet EBITDA`
  9. Present summary to user for approval:
     - Per-spa EBITDA with % (formatted like current sheet: "10,388    20%")
     - Business unit totals
     - Group total
     - Month-over-month comparison if previous month data available
  10. **APPROVAL GATE**: Wait for user confirmation before writing to output tabs
- **Output structure**: Mirrors the current EBITDA sheet layout
- **Refer to**: `knowledge/ebitda-structure.md` for formula definitions

**Step 2: Write `07-reconcile.md`**

- **Objective**: Run all reconciliation checks and flag discrepancies
- **How to execute**:
  1. **Revenue Check**: Compare total revenue from Zoho P&L vs sum of per-spa Lapis revenues. Variance should be < 1.00.
  2. **Salaries Check**: Compare total salary (payroll + cash) calculated in skill 04 vs salary line from Zoho P&L. Variance should be < 1.00.
  3. **SG&A Check**: Compare sum of allocated SG&A (from skill 05) vs total SG&A from Zoho P&L. Variance should be < 1.00.
  4. **Rent Check**: Compare expected rent (from config) vs rent line in Zoho P&L. Should be exact match.
  5. For each check: report PASS/FAIL, expected value, actual value, variance
  6. If any check fails: flag it with context on where to investigate
  7. Write results to `Reconciliation` output tab
- **Refer to**: `knowledge/reconciliation-rules.md` for thresholds and troubleshooting
- **Output format**:

| Check | Status | Expected | Actual | Variance | Notes |
|-------|--------|----------|--------|----------|-------|
| Revenue | PASS | 277,091.36 | 277,091.36 | 0.00 | |
| Salaries | PASS | 138,920.36 | 138,920.36 | 0.00 | |
| SG&A | PASS | 39,671.53 | 39,671.53 | 0.00 | |
| Rent | PASS | 18,452.15 | 18,452.15 | 0.00 | |

**Step 3: Commit**

```bash
git add "finance/Weekly EBITDA Calculation/skills/06-calculate-ebitda.md" "finance/Weekly EBITDA Calculation/skills/07-reconcile.md"
git commit -m "feat: add EBITDA calculation and reconciliation skills"
```

---

## Task 8: Write Output to Google Sheet Output Tabs

**Files:**
- Modify: `finance/Weekly EBITDA Calculation/skills/06-calculate-ebitda.md` (add output writing instructions)
- Modify: `finance/Weekly EBITDA Calculation/config/sheet-mapping.json` (fill in spreadsheet_id once created)

**Step 1: Add output writing instructions to skill 06**

After the approval gate in skill 06, add detailed instructions for writing to each output tab using Google Sheets MCP `sheets_update_values`:

- **EBITDA Summary tab**: Layout mirrors the current EBITDA sheet — rows for each spa/unit, columns for each period
- **Spa P&L tab**: Revenue, COGS, Gross Profit, Salaries, SG&A, Rent, EBITDA rows with per-period columns
- **Spa Detail tab**: One section per spa, each with the full P&L breakdown
- **Aesthetics P&L tab**: Revenue, COGS, Gross Profit, Doctor Payouts, Salaries, SG&A, EBITDA
- **SG&A Allocation tab**: Written during skill 05 execution
- **Reconciliation tab**: Written during skill 07 execution

For each tab: specify the exact cell ranges, headers, and formatting conventions.

**Step 2: Commit**

```bash
git add "finance/Weekly EBITDA Calculation/skills/06-calculate-ebitda.md" "finance/Weekly EBITDA Calculation/config/sheet-mapping.json"
git commit -m "feat: add output writing instructions to EBITDA skills"
```

---

## Task 9: Final Review and Integration

**Step 1: Cross-reference all files**

Read through every file created to verify:
- All knowledge docs reference each other correctly
- All skills reference the right knowledge docs and config files
- Config files contain accurate data from the reference workbook
- CLAUDE.md correctly routes to the master skill
- No circular dependencies or missing references

**Step 2: Verify against reference workbook**

Spot-check 3-5 data points from the config files against the original Excel workbook to ensure accuracy:
- InterContinental rent matches
- SG&A allocation totals match for Feb 2026
- Spa revenue account codes match Zoho
- Cash salary employee → spa mappings match

**Step 3: Update parent finance CLAUDE.md**

Add a reference to the new EBITDA subfolder in `finance/CLAUDE.md` so the agent knows it exists.

**Step 4: Commit**

```bash
git add "finance/"
git commit -m "feat: complete Weekly EBITDA Calculation system — knowledge, skills, config"
```
