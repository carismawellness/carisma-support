# SG&A Allocation Rules

## Overview

SG&A (Selling, General & Administrative) expenses are incurred centrally and must be allocated to individual spas. The allocation uses a multi-method approach defined in `config/sga-split-config.json`.

## Allocation Methods

### 1. By Salary Ratio
**Formula:** `(spa_salary / total_salary) * salary_pool_amount`

Each spa receives a share of this pool proportional to its payroll cost. Spas with more staff absorb more central overhead. The salary_pool is read from the Raw - SG&A Detail tab, category "Split by salary cost".

### 2. By Sales Ratio
**Formula:** `(spa_revenue / total_revenue) * sales_pool_amount`

Each spa receives a share proportional to its revenue. Higher-revenue spas absorb more. The sales_pool is read from the Raw - SG&A Detail tab, category "Split by sales ratio among all the Spa's".

### 3. Equal Split
**Formula:** `equal_pool_amount / number_of_active_spas`

Certain overhead costs are split equally regardless of size. Currently 8 active spas. The equal_pool is read from the Raw - SG&A Detail tab, category "Split equally among all 8 Spa".

### 4. Direct Allocations
Line items in the SG&A detail that reference a specific spa by name are allocated directly to that spa. No splitting required. Matched by spa name or short_name appearing in the description.

## Total Per-Spa SG&A
`SG&A_salary_ratio + SG&A_sales_ratio + SG&A_equal_split + direct_allocations`

## Verification
After allocation, verify: sum of all spa SG&A allocations = total SG&A from source. Variance should be < €1.00.

## When Rules Change
The methodology evolves when:
- New spas are added (changes denominators for all ratios + equal split count)
- Expense categories shift between pools
- New allocation methods are introduced

When this happens, update `config/sga-split-config.json` and document the change in this file's history section below.

## Feb 2026 Reference Values (for validation)

| Spa | Salary | SG&A by Salary | Revenue | SG&A by Sales | SG&A Equal | Direct | Total SG&A |
|-----|--------|---------------|---------|---------------|------------|--------|-----------|
| Hugos | 20,192 | 122.81 | 55,034 | 6,301.83 | 641.36 | 2,194.03 | 9,260.03 |
| Hyatt | 9,997 | 60.80 | 22,890 | 2,621.15 | 641.36 | 50.00 | 3,373.31 |
| InterContinental | 20,073 | 122.08 | 50,448 | 5,776.70 | 641.36 | 1,448.46 | 7,988.60 |
| Labranda | 4,134 | 25.14 | 19,903 | 2,279.01 | 641.36 | 669.95 | 3,615.46 |
| Ramla | 17,829 | 108.44 | 38,704 | 4,431.88 | 641.36 | 355.97 | 5,537.65 |
| Excelsior | 14,274 | 86.82 | 25,494 | 2,919.30 | 641.36 | 0 | 3,647.48 |
| Novotel | 3,721 | 22.63 | 15,830 | 1,812.64 | 641.36 | 406.60 | 2,883.24 |
| Sunny Coast | 10,690 | 65.02 | 18,386 | 2,105.34 | 641.36 | 554.02 | 3,365.75 |

Pool totals (Feb 2026): Salary pool €613.75, Sales pool €28,247.84, Equal pool €5,130.91

## History

_No changes logged yet._
