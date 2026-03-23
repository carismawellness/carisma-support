# EBITDA Structure

## Formula
Per-spa: `EBITDA = Gross Profit - Salaries - SG&A - Rent`

Where:
- `Gross Profit = Revenue - COGS`
- `Revenue = Service Revenue + Product Revenue` (all amounts VAT-exclusive)
- `COGS` = Cost of Goods Sold by product line (Phytomer, Purest, Others)
- `Salaries` = Payroll (bank-paid) + Cash payments, allocated per spa by employee assignment
- `SG&A` = Selling, General & Administrative expenses, centrally allocated via configurable methods (see `sga-allocation-rules.md`)
- `Rent` = Fixed per spa per period (see `config/rent-schedule.json`)
- `Proportional Fixed Costs` = Centrally purchased items (towels, linens, slippers) allocated by revenue ratio (see `config/proportional-fixed-costs.json`)

## Business Unit Hierarchy

```
Group EBITDA
├── Spa EBITDA (Total)
│   ├── InterContinental
│   ├── Hugos
│   ├── Hyatt
│   ├── Ramla
│   ├── Labranda
│   ├── Sunny Coast
│   ├── Excelsior
│   ├── Novotel
│   └── Corporate (Centre) — overhead, not revenue-generating
├── Aesthetics EBITDA
├── Slimming EBITDA
└── Velvet EBITDA
```

## Two EBITDA Variants

1. **Standard EBITDA** — Includes all spas + Corporate overhead. This is the true bottom line.
2. **EBITDA Excluding Center** — Strips out Corporate overhead. Shows operational EBITDA before HQ costs. Useful for evaluating spa-level performance independently.

## Key Metrics
- **EBITDA %** = EBITDA / Revenue (measures operational efficiency)
- **Gross Margin %** = Gross Profit / Revenue (measures product/service margin)

## Line Item Definitions

### Revenue
- Comes from Lapis POS system (Quick Service Search + Material Report)
- Split by: Service Revenue + Product Revenue per spa
- VAT is already excluded in Lapis exports for Spa
- For Aesthetics: VAT must be excluded manually (18% standard, 12% for doctor services)
- Includes: Regular sales, gift vouchers, packages
- Excludes: Sales Discounts (deducted), Sales Refunds (deducted)
- "Wholesale Product" goes to Centre (corporate sales, not spa-level)

### Cost of Goods Sold (COGS)
- Product lines: Phytomer (skincare), Purest Solutions, Others
- Calculated per spa based on product sales
- COGS rate varies by product line and spa
- Known issue: Zoho COGS line may include wholesale cost errors (see data-sources.md)

### Salaries
- Two components: Payroll (bank-paid, from payroll system) + Cash (cash-paid, from manual records)
- Each employee is assigned to a specific spa
- Corporate/Centre employees are overhead (not allocated to individual spas)
- Part-time/rotational staff may appear in multiple spas across periods

### SG&A
- Centrally incurred, allocated to spas using configurable split methods
- See `sga-allocation-rules.md` for methodology
- See `config/sga-split-config.json` for current rules

### Rent
- Fixed monthly amounts per spa
- Only InterContinental has a per-spa rent line (currently €5,100/month)
- Total rent is tracked at the consolidated Spa P&L level
- See `config/rent-schedule.json` for current schedule and history

### Proportional Fixed Costs
- Centrally purchased recurring items: towels, linens, slippers, amenities
- Allocated to each spa by revenue ratio each week
- See `config/proportional-fixed-costs.json` for current item list
