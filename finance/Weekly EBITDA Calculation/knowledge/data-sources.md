# Data Sources

## Lapis POS

**What it provides:** Revenue by spa (Service + Product), product sales detail, refunds, discounts
**Export method:** Manual export from Lapis reporting interface
**Maps to:** `Raw - Lapis Revenue` tab (revenue) and `Raw - Lapis COGS` tab (cost of goods)
**Key reports:** Quick Service Search, Material Report

**Gotchas:**
- Revenue is already VAT-exclusive for Spa locations
- The "Sales" line (no spa designation) in Zoho is a catch-all — actual per-spa revenue comes from Lapis
- Sales Discounts and Sales Refunds are separate line items that must be deducted
- "Whole Sales Product" (account 506200) is Centre/corporate sales, not spa revenue

## Zoho Books

**What it provides:** Full P&L per entity, SG&A detail, expense categorization
**Export method:** Manual export from Reports → Profit and Loss (will be automated via Zoho Books MCP in future)
**Maps to:** `Raw - Zoho Spa P&L`, `Raw - Zoho Aesthetics P&L`, `Raw - SG&A Detail` tabs

**Entity names:**
- Spa: "Carisma Spa & Wellness International Ltd."
- Aesthetics: separate Zoho entity

**Gotchas:**
- Cost of Goods Sold in Zoho may include wholesale cost errors (noted in workbook cell G29: "There is error in the cost of goods for wholesale purpose")
- SG&A lines must be categorized by allocation method (salary ratio, sales ratio, equal split, direct)
- P&L period must match the target EBITDA period exactly

## Payroll Google Sheet

**What it provides:** Bank-paid salaries by employee with department/spa assignment
**Location:** https://docs.google.com/spreadsheets/d/1AAnfm-SAYso6RpJhbdhJbTbcGDH1Ftlk0FHBPHfN98w/edit?gid=459731817#gid=459731817
**Maps to:** `Raw - Payroll` tab

**Gotchas:**
- This is the authoritative source for bank-paid salaries
- Employee department assignments may change — always use current month's data

## Cash Salaries

**What it provides:** Cash payment records for employees paid outside payroll
**Source:** Manual records maintained by HR/Finance
**Maps to:** `Raw - Cash Salaries` tab

**Structure:** Employee ID, Name, Cash Amount, Spa/Department assignment
**Gotchas:**
- Employee IDs may change or be absent
- Part-time/rotational staff (e.g., Kemi, Ihebeddin) may not appear every month
- "Riveira/Labranda" in the data maps to the Labranda spa
- Some employees appear with different ID numbers across months

## Zoho People

**What it provides:** Employee lifecycle reports, turnover/tenure data
**Used for:** Turnover Tenure metric (referenced in EBITDA sheet row B17)
**Report path:** People's Section → Employee Lifecycle Reports → Terminated Employee Tenure Report
**Note:** Not used in core EBITDA calculation, but referenced for context
