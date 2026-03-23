# Zoho Books Cost Reference

## MCP Tool Status

**Status:** Zoho Books MCP server is configured in `.mcp.json` (zoho-books via `uvx zoho-books-mcp`) but the tools are **not currently loaded** in Claude Code sessions. The MCP server does not appear in the deferred tools list, meaning it is either not starting correctly or the package has issues.

**Workaround:** Until the Zoho Books MCP tools are operational, cost data is extracted manually from Zoho Books P&L exports pasted into the Google Sheet input tabs (`Raw - Zoho Spa P&L`, `Raw - Zoho Aesthetics P&L`, `Raw - SG&A Detail`).

**MCP Config:**
```json
{
  "zoho-books": {
    "command": "uvx",
    "args": ["zoho-books-mcp"],
    "env": {
      "ZOHO_CLIENT_ID": "1000.T2JSUQRVK983MOFY28ZYQV2H39W3IK",
      "ZOHO_CLIENT_SECRET": "[redacted]",
      "ZOHO_REFRESH_TOKEN": "[redacted]",
      "ZOHO_ORGANIZATION_ID": "20071987640",
      "ZOHO_REGION": "EU"
    }
  }
}
```

**To troubleshoot:** Restart Claude Code and check if `zoho-books` tools appear. If not, try running `uvx zoho-books-mcp` manually in terminal to check for errors. The refresh token may need regeneration if expired.

---

## Organization

- **Legal Entity:** Carisma Spa & Wellness International Ltd.
- **Zoho Organization ID:** `20071987640`
- **Region:** EU (books.zoho.eu)
- **Currency:** EUR

---

## 1. Rent Accounts

Rent is tracked in Zoho under parent account code `619000` with sub-accounts per location.

| Account Name | Account Code | Spa | Feb 2026 | Jan 2026 | Dec 2025 |
|---|---|---|---|---|---|
| Rent (parent) | 619000 | -- | 0 | 0 | 0 |
| Rent - InterContinental | 619140 | InterContinental | 5,100.00 | 5,100.00 | 5,100.00 |
| Rent - Hyatt Regency | 619150 | Hyatt | 2,814.00 | 0 | 1,407.00 |
| Rent - Labranda | 000 | Labranda | 1,000.00 | 1,000.00 | 1,000.00 |
| Rent - Excelsior | 619121 | Excelsior | 0 | 8,111.81 | 10,606.42 |
| Rent - Sunny Coast | 10001 | Sunny Coast | 0 | 0 | 2,833.34 |
| **Total Rent** | | | **8,914.00** | **14,211.81** | **20,946.76** |
| Rent - Motor Vehicle | 619500 | Centre | 0 | 0 | -250.00 |

### Rent Notes
- InterContinental is the only spa with **consistent** monthly rent (5,100/month since Jul 2024).
- Other spa rents are **irregular** -- they appear some months and not others. This likely reflects quarterly/semi-annual billing or negotiated payment schedules.
- Total rent varies significantly month to month: 8,914 (Feb 26) vs 14,212 (Jan 26) vs 20,947 (Dec 25).
- The `config/rent-schedule.json` currently shows total_rent as 18,452.15 -- this is likely an average or a specific month's snapshot. It should be updated to use the actual Zoho P&L value each period.
- **IMPORTANT:** For weekly EBITDA, use the actual monthly rent from the Zoho P&L for that period, NOT a fixed annualized figure. Rent is not stable enough to annualize.

### Rent for EBITDA Calculation
- **Per-spa rent:** Read each sub-account from the Zoho Spa P&L export
- **Weekly conversion:** `monthly_rent / weeks_in_month` (typically 4 or 4.33)
- **Allocation:** Each rent sub-account maps directly to its spa. No allocation needed.

---

## 2. Utilities (Water & Electricity) Accounts

Utilities are tracked under parent account code `100` with sub-accounts per location.

| Account Name | Account Code | Spa | Feb 2026 | Jan 2026 | Dec 2025 |
|---|---|---|---|---|---|
| Water & Electricity (parent) | 100 | -- | 0 | 0 | 0 |
| Water & Electricity - Hugo's | 611531 | Hugos | 74.03 | 233.22 | 58.85 |
| Water & Electricity - Hyatt | 611521 | Hyatt | 50.00 | 0 | 25.00 |
| Water & Electricity - InterContinental | 611511 | InterContinental | 141.48 | 257.57 | 216.73 |
| Water & Electricity - Novotel | 611563 | Novotel | 65.92 | 30.61 | 0 |
| Water & Electricity office | 611561 | Centre/Office | 0 | 28.85 | 0 |
| Water & Electricity - Sunny Coast | 12346 | Sunny Coast | 16.48 | 30.61 | 40.02 |
| Water & Electricity - Labranda | 611562 | Labranda | 81.00 | 209.80 | 133.85 |
| **Total Utilities** | | | **428.91** | **790.66** | **474.45** |

### Utilities Notes
- Utilities are **very small** relative to other costs (under 1,000/month total).
- Allocation: Each sub-account maps directly to its spa. The "office" line goes to Centre.
- No utility accounts exist for Ramla or Excelsior -- these may be included in the hotel service agreement or bundled into rent.
- For weekly EBITDA: `monthly_utility / weeks_in_month`
- These are already **direct allocations** in the SG&A split (each marked with its spa name).

---

## 3. Cost of Goods Sold (COGS) Accounts

### Spa COGS

| Account Name | Account Code | Feb 2026 | Jan 2026 | Dec 2025 | Allocation |
|---|---|---|---|---|---|
| Cost of Goods Sold | (no code) | 151,575.74 | 98,069.96 | -417,776.53 | **DO NOT USE -- has wholesale errors** |
| General Purchases - Professional Products | 651110 | 0 | 816.02 | 663.90 | Split by sales ratio |
| General Purchases - Retail Products | 651120 | 4,744.71 | 4,456.54 | 3,543.08 | (unspecified) |
| Linen Cost | 147806 | 2,165.48 | 2,165.48 | 2,165.48 | Split by sales ratio |

### COGS Notes
- **CRITICAL:** The main "Cost of Goods Sold" line in Zoho is **unreliable** -- it includes wholesale cost errors (confirmed in workbook cell G29 annotation). December 2025 shows a negative value of -417K, which is clearly erroneous.
- **Authoritative COGS source:** Lapis POS product reports, NOT Zoho. COGS per spa comes from Lapis data broken down by Phytomer, Purest Solutions, and Others.
- General Purchases (Professional + Retail) are central costs allocated by sales ratio.
- Linen Cost is a fixed monthly amount (2,165.48) allocated by sales ratio.

### Aesthetics COGS

| Account Name | Account Code | Feb 2026 | Jan 2026 | Dec 2025 |
|---|---|---|---|---|
| Cost of Goods Sold | (no code) | 0 | 0 | 16,946.15 |

- Aesthetics COGS was significant in 2025 (7K-17K/month) but shows 0 for Jan-Feb 2026. This may indicate a change in how COGS is recorded or a timing issue.
- Historical COGS rate: ~22-31% of Aesthetics revenue (target gross margin ~73%).

### Slimming COGS
- Slimming started Feb 2026. COGS data should come from the Slimming P&L in Zoho (separate entity or tracked within the same org -- needs confirmation).

---

## 4. SG&A (Selling, General & Administrative) Accounts

All operating expenses from the Zoho Spa P&L that are NOT classified as Rent, Utilities, Wages, or Marketing fall into SG&A. Below is the complete chart of SG&A accounts extracted from the Zoho P&L export.

### SG&A Line Items -- Complete List

| Account Name | Account Code | Feb 2026 | Allocation Method |
|---|---|---|---|
| **Professional Services** | | | |
| Accounting - Professional Services | 611191 | 514.04 | Equal split (8 spas) |
| Consulting - Professional Services | 611193 | 12,146.30 | Sales ratio |
| Legal - Professional Services | 611194 | 0 | (direct) |
| Legal Charges | 98765 | 470.00 | Equal split (8 spas) |
| Professional Fees | 651180 | 0 | Equal split (8 spas) |
| **Banking & Finance** | | | |
| Bank Fees and Charges | 616780 | 1,373.50 | Equal split (8 spas) |
| **Transport & Vehicle** | | | |
| Car - Fuel | 611151 | 205.00 | Salary ratio |
| Travel - General | 616610 | 4,305.67 | Sales ratio |
| Hammam - Fuel | 611152 | 152.00 | Sales ratio |
| **Cleaning** | | | |
| Cleaning Products General (parent) | 616770 | 0 | -- |
| Cleaning - Labranda | 616771 | 448.00 | Direct (Labranda) |
| **Laundry** | | | |
| Laundry Expenses (parent) | 612520 | 0 | -- |
| Laundry - Hugo's | 611534 | 2,120.00 | Direct (Hugos) |
| Laundry - InterContinental | 611514 | 1,274.58 | Direct (InterContinental) |
| Laundry - Novotel | 611572 | 340.68 | Direct (Novotel) |
| Laundry - Ramla Bay | 611554 | 355.97 | Direct (Ramla) |
| Laundry - Seashells & Qawra | 611544 | 537.54 | Direct (Sunny Coast) |
| **Repairs & Maintenance** | | | |
| Repairs & Maintenance (parent) | 999 | 0 | -- |
| Repairs & Maintenance - Labranda | 1566 | 128.00 | Direct (Labranda) |
| Repairs & Maintenance - Novotel | 14575 | 0 | (direct) |
| Repairs & Maintenance - General | 611559 | 971.87 | Sales ratio |
| **IT & Software** | | | |
| Computer running cost - The Purest Solutions | 659173 | 0 | Salary ratio |
| Membership & Subscriptions Fee | 616680 | 2,715.14 | Equal split (8 spas) |
| Subscription - The Purest Solutions | 659174 | 97.12 | Sales ratio |
| **Telephone & Communications** | | | |
| Telephone & Communications | 611530 | 44.84 | Sales ratio |
| **Meals & Entertainment** | | | |
| Meals & Entertainment (parent) | 611539 | 0 | -- |
| Meals & Entertainment - General | 616630 | 362.70 | Sales ratio |
| Meals & Entertainment - InterContinental | 611516 | 32.40 | Direct (InterContinental) |
| Meals & Entertainment - Labranda | 60007 | 12.95 | Direct (Labranda) |
| Meals & Entertainment - Hyatt | 611526 | 0 | (direct) |
| **Office & Supplies** | | | |
| Office Supplies | (no code) | 408.75 | Salary ratio |
| Stationery | 616670 | 0 | Sales ratio |
| **Training** | | | |
| Training - General | 616620 | 0 | Sales ratio |
| **Freight & Shipping** | | | |
| Freight Charges | 616710 | 680.19 | Sales ratio |
| **General / Miscellaneous** | | | |
| General Expenses | 616611 | 459.01 | Sales ratio |
| Charges | 611230 | 58.23 | Equal split (8 spas) |
| Company Registration Fee | 611196 | 0 | (once-off) |
| Gift Voucher - Staff | 2222 | 0 | Salary ratio |

### SG&A Summary by Allocation Pool (Feb 2026)

| Pool | Total Amount |
|---|---|
| Split by salary cost | 613.75 |
| Split by sales ratio | 28,247.84 |
| Split equally among 8 spas | 5,130.91 |
| Direct allocations (by spa) | varies per spa |
| **Total SG&A** | **33,992.50** (pools) + direct allocations |

### SG&A by Spa (Feb 2026 Actual)

| Spa | By Salary | By Sales | Equal Split | Direct | Total SG&A |
|---|---|---|---|---|---|
| Hugos | 122.81 | 6,301.83 | 641.36 | 2,194.03 | 9,260.03 |
| Hyatt | 60.80 | 2,621.15 | 641.36 | 50.00 | 3,373.31 |
| InterContinental | 122.08 | 5,776.70 | 641.36 | 1,448.46 | 7,988.60 |
| Labranda | 25.14 | 2,279.00 | 641.36 | 669.95 | 3,615.46 |
| Ramla | 108.44 | 4,431.88 | 641.36 | 355.97 | 5,537.65 |
| Excelsior | 86.82 | 2,919.30 | 641.36 | 0 | 3,647.48 |
| Novotel | 22.63 | 1,812.64 | 641.36 | 406.60 | 2,883.24 |
| Sunny Coast | 65.02 | 2,105.34 | 641.36 | 554.02 | 3,365.75 |

---

## 5. Accounts EXCLUDED from SG&A (Handled Separately in EBITDA)

These accounts appear in the Zoho Operating Expense section but are NOT part of SG&A allocation:

### Salaries & Wages

| Account Name | Account Code | Spa | Feb 2026 |
|---|---|---|---|
| Salaries & Wages (parent) | 616100 | -- | 0 |
| Salaries & Wages - Directors | 616110 | Centre | 11,939.21 |
| Salaries & Wages - Excelsior | 602221 | Excelsior | 13,445.89 |
| Salaries & Wages - Hugo's | 30002 | Hugos | 19,020.29 |
| Salaries & Wages - Hyatt | 30003 | Hyatt | 9,416.46 |
| Salaries & Wages - Inter | 30001 | InterContinental | 18,907.42 |
| Salaries & Wages - Labranda | 30006 | Labranda | 3,893.86 |
| Salaries & Wages - Novotel | 602222 | Novotel | 3,504.95 |
| Salaries & Wages - Ramla | 30005 | Ramla | 16,794.35 |
| Salaries & Wages - Sunny | 30004 | Sunny Coast | 10,069.57 |
| Salary & Wages - Center | 602220 | Centre | 3,606.72 |
| Salary & payroll taxes (FS5) | 616113 | Corporate | 6,815.64 |
| **Total Salaries** | | | **117,414.36** |

### Marketing & Advertising

| Account Name | Account Code | Feb 2026 | Allocation |
|---|---|---|---|
| Marketing - Digital | 611111 | 5,362.66 | Sales ratio |
| Marketing - Advertising | 611113 | 1,500.00 | Sales ratio |
| Marketing - Print | 611112 | 0 | -- |
| Advertising - The Purest Solutions | 659168 | 0 | -- |

Note: Marketing costs are allocated by sales ratio in the SG&A split sheet, but they could also be tracked separately as a line item in the EBITDA P&L (as "Advertising" appears as a separate row in the Spa Detail output tab).

---

## 6. Aesthetics Operating Expenses (from Zoho Aesthetics Entity)

| Account Name | Account Code | Feb 2026 | Jan 2026 |
|---|---|---|---|
| Bank Fees and Charges | (no code) | 131.58 | 651.30 |
| Consulting - Professional Services | 611193 | 12,202.70 | 10,801.23 |
| Digital - Marketing | 611111 | 5,403.72 | 4,246.71 |
| Freight Charges | 616710 | 0 | 0 |
| General Expenses | 616611 | 0 | 0 |
| Membership & Subscriptions Fee | 616680 | 1,542.77 | 504.98 |
| Salaries and Employee Wages | (no code) | 7,112.50 | 8,976.44 |
| Salary & payroll taxes (FS5) | 616113 | 480.00 | 480.00 |
| Travel | 616610 | 0 | 0 |
| **Total Operating Expense** | | **26,873.27** | **25,660.66** |

Note: Aesthetics consulting fees are very large (10-12K/month) -- these likely include doctor payouts. Needs verification.

---

## 7. Non-Operating Items (Excluded from EBITDA)

| Account Name | Account Code | Feb 2026 | Notes |
|---|---|---|---|
| Interest Income from Investments | 000004 | 0 | Centre |
| Unprocessed transactions | 000025 | 0 | Centre |

These are excluded from EBITDA calculation per standard EBITDA methodology.

---

## 8. SG&A Categorization Buckets

The following is the comprehensive SG&A bucket list for the EBITDA P&L, mapped to Zoho account codes:

| SG&A Bucket | Zoho Accounts | Typical Allocation |
|---|---|---|
| Cleaning cost | 616770, 616771 | Direct per spa |
| General expenses | 616611 | Sales ratio |
| Software & subscriptions | 616680, 659174, 659173 | Equal split / Salary ratio |
| Insurance | (not yet in Zoho) | -- |
| General repairs & maintenance | 999, 611559, 1566, 14575 | Sales ratio / Direct |
| Telephone / internet | 611530, 611540 | Sales ratio |
| Staff events / entertainment | 611539, 616630, 611516, 611526, 60007 | Sales ratio / Direct |
| IT repairs & maintenance | 659173 | Salary ratio |
| Professional fees (legal, accounting, audit) | 611191, 611193, 611194, 98765, 651180 | Equal split / Sales ratio |
| Bank charges | 616780 | Equal split |
| Travel & transportation | 616610, 611151, 611152 | Sales ratio / Salary ratio |
| Office supplies / stationery | (no code), 616670 | Salary ratio / Sales ratio |
| Licensing & permits | 611196 | One-off |
| Depreciation | (not in current Zoho P&L) | Excluded from EBITDA |
| Freight charges | 616710 | Sales ratio |
| Training | 616620 | Sales ratio |
| Laundry | 612520, 611534, 611514, 611572, 611554, 611544 | Direct per spa |
| Linen cost | 147806 | Sales ratio |
| General purchases (professional products) | 651110 | Sales ratio |
| General purchases (retail products) | 651120 | (unspecified) |
| Miscellaneous charges | 611230 | Equal split |
| Gift vouchers (staff) | 2222 | Salary ratio |
| Rent - Motor Vehicle | 619500 | Centre |

---

## 9. Data Gaps & Action Items

### Available Data (can be extracted from Zoho P&L export)
- [x] Full chart of expense accounts with codes
- [x] Rent per location (per month, with sub-accounts)
- [x] Utilities per location (per month, with sub-accounts)
- [x] SG&A line items with allocation categories
- [x] Salary accounts per spa
- [x] Marketing expense accounts
- [x] Aesthetics operating expenses

### Missing / Needs Resolution
- [ ] **Zoho Books MCP tools not loading** -- Cannot automate extraction. Need to troubleshoot `uvx zoho-books-mcp` server.
- [ ] **COGS in Zoho is unreliable** -- Must continue using Lapis POS as authoritative COGS source. The Zoho COGS line has known wholesale cost errors.
- [ ] **Insurance account** -- No insurance line visible in current Zoho P&L. May be recorded under a different name or paid annually outside the P&L period.
- [ ] **Depreciation** -- Not present in current Zoho P&L. Excluded from EBITDA by definition, but should be confirmed.
- [ ] **Slimming costs** -- Need to confirm whether Slimming has a separate Zoho entity or is tracked within the Spa entity.
- [ ] **Rent variability** -- Rent is NOT stable month-to-month. The annualize-then-distribute approach won't work. Use actual monthly amounts from Zoho P&L.
- [ ] **Aesthetics consulting fees** -- The 10-12K/month "Consulting - Professional Services" for Aesthetics needs clarification: is this doctor payouts, or actual consulting?
- [ ] **General Purchases - Retail Products (651120)** -- Feb 2026 shows 4,744.71 but has no allocation method assigned in the SG&A split. Needs categorization.

---

## 10. Annualization Warning

The original task mentioned "annualized, then distributed monthly -> weekly" for rent and utilities. Based on the actual data:

- **Rent:** Varies significantly month to month (8.9K to 20.9K). Annualizing would be misleading. **Recommendation:** Use actual monthly Zoho P&L rent figures, divided by weeks in that month.
- **Utilities:** Also varies but is very small (<1K/month). Could be annualized with less risk, but using actual monthly figures is more accurate.

---

## Last Updated
2026-03-23 -- Initial creation from manual extraction of `EBITA Working_Jan 2026 and Feb 2026.xlsx` Zoho export sheets.
