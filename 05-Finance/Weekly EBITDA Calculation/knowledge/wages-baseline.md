# Wages Baseline - Weekly EBITDA P&L

**Last Updated:** 2026-03-23
**Data Sources:**
- Salary Master Sheet (`1AAnfm-SAYso6RpJhbdhJbTbcGDH1Ftlk0FHBPHfN98w`) - Staff Master tab
- Roster Tracker (`1f9jN365qmF6u6dP3oacycLKfo1WPvKnVSovgaNXePc0`) - Roster tab
- HC Payroll Overview tab (Salary Master Sheet)
- March 2026 (C) payroll tab (Salary Master Sheet)

---

## Methodology

### Employer Cost Calculation
- **Gross employees:** Base salary x 1.10 (employer NI contribution ~10%)
- **Cash/Net employees:** Cash amount x 1.10 (employer burden estimate)
- Malta employer contributions include: National Insurance (~10%), FSS withholding, Maternity Fund
- Rule of thumb: Total employer cost = Gross salary x 1.10

### Weekly Conversion
- Monthly employer cost / 4.33 (average weeks per month) = Weekly wage allocation

### Regional Manager Allocation
Regional Managers oversee multiple spas. Their costs are allocated proportionally by revenue weight:
- **RM1 (Neli Radeva):** InterContinental 42%, Hugo's 39%, Hyatt 19%
- **RM2 (Kristina Alisauskaite):** Ramla 47%, Labranda 27%, Odycy 26%
- **RM3 (Melanie Mitic Vella):** Excelsior 71%, Novotel 29%

### Float Pool
14 employees (float therapists, part-timers, rotating advisors) are allocated proportionally across all 8 spas based on each spa's employer cost share. These are NOT included in the per-spa weekly wage written to the Spa Detail tab; they are included only in COMPANY WIDE.

### What Is Written to Spa Detail
The per-spa weekly wage includes:
1. Direct employee employer costs for that spa
2. Regional Manager allocation for that spa
3. Does NOT include float pool (those are in COMPANY WIDE only)

The COMPANY WIDE row includes everything: all spa staff + float pool + corporate/HQ.

---

## Per-Spa Weekly Wages Summary

| Spa | HC | Monthly Base | RM Alloc | Monthly Employer Cost | Weekly Wage | Cell |
|---|---|---|---|---|---|---|
| INTER | 11 | 16,300 | 924 | 18,854 | 4,354 | B5:M5 |
| HUGOS | 9 | 12,500 | 858 | 14,608 | 3,374 | B16:M16 |
| HYATT | 4 | 5,950 | 418 | 6,963 | 1,608 | B27:M27 |
| RAMLA | 6 | 8,180 | 827 | 9,825 | 2,269 | B38:M38 |
| LABRANDA | 4 | 5,240 | 475 | 6,239 | 1,441 | B49:M49 |
| ODYCY | 4 | 5,600 | 458 | 6,618 | 1,528 | B60:M60 |
| NOVOTEL | 3 | 3,900 | 581 | 4,871 | 1,125 | B71:M71 |
| EXCELSIOR | 5 | 6,900 | 1,421 | 9,011 | 2,081 | B82:M82 |
| **Spa Total** | **46** | **64,570** | | **76,989** | **17,780** | |
| Float Pool | 14 | | | 16,793 | 3,878 | (allocated) |
| Corporate/HQ | 11 | | | 20,799 | 4,804 | |
| **COMPANY WIDE** | **71** | | | **114,581** | **26,462** | B93:M93 |

---

## Active Employee Detail by Spa

### INTERCONTINENTAL (11 staff + RM allocation)
| Name | Role | Base | Type | Employer Cost |
|---|---|---|---|---|
| Anna Maria Mirisola | Spa Manager | 2,000 | Gross | 2,200 |
| NATASHA MARJANOVIC | Trainer Therapist / Receptionist | 1,500 | Gross | 1,650 |
| NATHALIA BARRETO | Spa Advisor / TIC | 1,250 | Gross | 1,375 |
| Ni Made Sudarmini | Therapist (Sr.) | 1,550 | Gross | 1,705 |
| PAKINEE Kriamthaisong | Therapist | 1,300 | Gross | 1,430 |
| CHRISTOPHER RYON OBIEN | Therapist | 1,400 | Gross | 1,540 |
| Valeri Kiseev | Trainer Therapist | 1,700 | Gross | 1,870 |
| janejira khochasanee | Therapist | 1,400 | Gross | 1,540 |
| MADE ANDORIANI | Therapist | 1,200 | Gross | 1,320 |
| MATILDE RICORDA | Therapist | 1,300 | Gross | 1,430 |
| Milena Lazorova | Trainer Therapist (PT) | 1,700 | Gross | 1,870 |
| *RM1 allocation (Neli 42%)* | | | | *924* |
| **Subtotal** | | **16,300** | | **18,854** |

### HUGO'S (9 staff + RM allocation)
| Name | Role | Base | Type | Employer Cost |
|---|---|---|---|---|
| Alana Donovan | Spa Advisor / Receptionist | 1,400 | Gross | 1,540 |
| MAILA MAILA | Spa Advisor / TIC | 1,400 | Gross | 1,540 |
| Lourdes M. De Leon | Therapist | 1,400 | Gross | 1,540 |
| Lovely Sison | Therapist | 1,500 | Gross | 1,650 |
| TESSA LAURIO | Therapist | 1,300 | Gross | 1,430 |
| Tamara Videc | Therapist | 1,500 | Gross | 1,650 |
| WARAPORN PONGRAT | Therapist | 1,300 | Gross | 1,430 |
| Lenara Ribeiro | Spa Advisor | 1,400 | Gross | 1,540 |
| JULIANA DEVES | Therapist | 1,300 | Gross | 1,430 |
| *RM1 allocation (Neli 39%)* | | | | *858* |
| **Subtotal** | | **12,500** | | **14,608** |

### HYATT (4 staff + RM allocation)
| Name | Role | Base | Type | Employer Cost |
|---|---|---|---|---|
| FLORA SANTANA | Ass. Manager / TIC | 1,400 | Gross | 1,540 |
| Ni Made Ety Diantari | Therapist (Sr.) | 1,550 | Gross | 1,705 |
| CLAUDIA GARCIA | Therapist | 1,300 | Gross | 1,430 |
| Natasha Naumcheska | Therapist (Sr.) | 1,700 | Gross | 1,870 |
| *RM1 allocation (Neli 19%)* | | | | *418* |
| **Subtotal** | | **5,950** | | **6,963** |

### RAMLA (6 staff + RM allocation)
| Name | Role | Base | Type | Employer Cost |
|---|---|---|---|---|
| Natalia Linares | Spa Supervisor / Receptionist | 1,700 | Gross | 1,870 |
| KARLA CABRERA | Therapist | 1,300 | Gross | 1,430 |
| Laura Camila | Therapist | 1,400 | Gross | 1,540 |
| Marivic Arana Clavo | Therapist | 1,280 | Gross | 1,408 |
| Komang Budarsi | Therapist | 1,200 | Gross | 1,320 |
| Karen Tobongbanua | Therapist | 1,300 | Gross | 1,430 |
| *RM2 allocation (Kristina 47%)* | | | | *827* |
| **Subtotal** | | **8,180** | | **9,825** |

### LABRANDA / RIVIERA (4 staff + RM allocation)
| Name | Role | Base | Type | Employer Cost |
|---|---|---|---|---|
| Sylvia Arana Gaa | Therapist / TIC | 1,280 | Gross | 1,408 |
| BLAGOJCHE DAMEVSKI | Therapist | 1,400 | Gross | 1,540 |
| RITA SMITH AZIAH | Therapist | 1,280 | Cash | 1,408 |
| SUJINDA. PHEREEWONG | Therapist | 1,280 | Gross | 1,408 |
| *RM2 allocation (Kristina 27%)* | | | | *475* |
| **Subtotal** | | **5,240** | | **6,239** |

### ODYCY (4 staff + RM allocation)
| Name | Role | Base | Type | Employer Cost |
|---|---|---|---|---|
| JOVANA MARKOVIC | Ass. Manager / TIC | 1,700 | Gross | 1,870 |
| ELIZABETA ZDRAVKOV | Therapist | 1,400 | Gross | 1,540 |
| Deborah Deborah | Therapist | 1,300 | Gross | 1,430 |
| KONSTANTINA TSIRONI | Spa Advisor | 1,200 | Gross | 1,320 |
| *RM2 allocation (Kristina 26%)* | | | | *458* |
| **Subtotal** | | **5,600** | | **6,618** |

### EXCELSIOR (5 staff + RM allocation)
| Name | Role | Base | Type | Employer Cost |
|---|---|---|---|---|
| Sofia Gonzalez Fernandez | Spa Advisor / TIC | 1,300 | Gross | 1,430 |
| SEBASTIJAN LOMSEK | Therapist | 1,500 | Gross | 1,650 |
| Kunyapak phonsing | Therapist | 1,300 | Gross | 1,430 |
| Cindy Lorena Varon Prieto | Therapist | 1,500 | Gross | 1,650 |
| Viviane Alexandre | Therapist | 1,300 | Gross | 1,430 |
| *RM3 allocation (Melanie 71%)* | | | | *1,421* |
| **Subtotal** | | **6,900** | | **9,011** |

### NOVOTEL (3 staff + RM allocation)
| Name | Role | Base | Type | Employer Cost |
|---|---|---|---|---|
| NATALIA ROMERO | Spa Advisor / TIC | 1,400 | Gross | 1,540 |
| Vanessa Escobar | Therapist | 1,300 | Gross | 1,430 |
| THAIS LIMA | Therapist | 1,200 | Cash | 1,320 |
| *RM3 allocation (Melanie 29%)* | | | | *581* |
| **Subtotal** | | **3,900** | | **4,871** |

### REGIONAL MANAGERS (allocated above)
| Name | Region | Base | Employer Cost | Allocated To |
|---|---|---|---|---|
| Neli Radeva | Region 1 | 2,000 | 2,200 | Inter/Hugos/Hyatt |
| Kristina Alisauskaite | Region 2 | 1,600 | 1,760 | Ramla/Labranda/Odycy |
| Melanie Mitic Vella | Region 3 | 1,820 | 2,002 | Excelsior/Novotel |

### CORPORATE / HQ (11 staff)
| Name | Role | Base | Type | Employer Cost |
|---|---|---|---|---|
| Sinan Tefik | CEO / Management | 3,600 | Gross | 3,960 |
| Melissa Castellino | HR | 2,000 | Gross | 2,200 |
| Mandar Rajesh Talele | Operations | 1,500 | Gross | 1,650 |
| Can Artar | Growth | 1,850 | Gross | 2,035 |
| Valentina Pieri | Growth | 1,800 | Gross | 1,980 |
| Ruksana Shakir | Senior Accountant | 1,100 | Gross | 1,210 |
| Kath Concio | CRM | 842 | Gross | 926 |
| Leticia Bonassi | Aesthetics | 1,800 | Gross | 1,980 |
| Gianni Marcal Casotti | Aesthetics | 1,700 | Gross | 1,870 |
| Adriene Paula | Aesthetics | 1,300 | Gross | 1,430 |
| Diana Patricia HERRERA CUMARIN | Slimming | 1,417 | Cash | 1,559 |
| **Subtotal** | | | | **20,799** |

### FLOAT POOL (14 staff - allocated proportionally)
| Name | Role | Base | Type | Employer Cost |
|---|---|---|---|---|
| Benjawan Phereewong | Therapist | 1,300 | Gross | 1,430 |
| ANJA BOGDANOVIC | Spa Advisor | 1,400 | Cash | 1,540 |
| DANIELA XAVIER | Spa Advisor | 1,400 | Cash | 1,540 |
| GABRIELY PRADO | Spa Advisor | 1,400 | Cash | 1,540 |
| SANGAY WANGMO | Therapist | 1,466 | Cash | 1,613 |
| GLECILA DETICIO | Therapist | 1,300 | Cash | 1,430 |
| PATRICIA TOMEI | Therapist | 1,300 | Cash | 1,430 |
| Maria Oliveira | Spa Advisor | 1,400 | Gross | 1,540 |
| Gulnaz Khanam | Spa Advisor | 1,400 | Gross | 1,540 |
| PRAISE UWAGBOE | Spa Advisor | 1,300 | Cash | 1,430 |
| Kemi Onakoya | Spa Advisor (PT) | ~400 | Cash | 440 |
| Ihebeddin Slama | Therapist (PT) | ~400 | Cash | 440 |
| IGOR GOLUBOVIC | Therapist (PT) | ~400 | Cash | 440 |
| STACY RODERNO | Spa Advisor (PT) | ~400 | Cash | 440 |
| **Subtotal** | | | | **16,793** |

---

## Assumptions and Caveats

1. **Employer NI rate of 10%** is a simplified estimate. Actual Malta employer NI varies by income band (ranges 8-10%). The 10% multiplier is conservative and directionally correct for budgeting.

2. **Cash/Net employees** may not have formal employer NI obligations if they are on service agreements or informal arrangements. The 10% uplift is applied uniformly for conservative EBITDA budgeting.

3. **Part-time hourly employees** (8 hrs/week markers) are estimated at ~400 EUR/month based on typical part-time patterns observed in the March payroll data.

4. **Float pool allocation** is proportional to spa employer cost. In reality, float therapists may work more at busier spas. This is a reasonable approximation for weekly EBITDA purposes.

5. **Commission and bonuses** are NOT included in the base wage figures. The March 2026 payroll shows actual total earnings averaging 15-25% above base for therapists due to commissions. The base + employer NI figure represents the fixed wage obligation.

6. **Kath Concio salary** updated to 841.55 as of 01.03.2026 (reduced from 1,350 - possibly moved to part-time/reduced hours).

7. **The "Labranda" spa** in the P&L corresponds to the "Riviera" location referenced in the HC Payroll Overview. Both names are used interchangeably.

8. **Wages are held constant** across all 12 weeks in the Spa Detail tab. In practice, wages may fluctuate slightly due to commission payments, overtime, new hires, or departures. These figures represent the baseline fixed cost.

---

## Update Triggers

This baseline should be refreshed when:
- New employees are hired or existing ones leave
- Salary reviews occur (next expected: mid-2026)
- Regional Manager structure changes
- Spa locations are added or closed
- Malta NI rates change

---

## Cross-Reference with HC Payroll Overview

The HC Payroll Overview (dated March 8, 2026) in the Salary Master Sheet projected annual payroll at:
- Inter: 225,480/yr (18,790/mo) -- our figure: 18,854/mo (close match, slight differences in loaded rates)
- Hugo's: 202,476/yr (16,873/mo) -- our figure: 14,608/mo (we have 9 vs their 9+PT, difference is PT allocation)
- Hyatt: 97,536/yr (8,128/mo) -- our figure: 6,963/mo (HC overview had higher loaded rates)
- Ramla: 156,912/yr (13,076/mo) -- our figure: 9,825/mo (HC overview included intern + higher loaded rates)
- Labranda/Riviera: 90,252/yr (7,521/mo) -- our figure: 6,239/mo (HC overview had TBD PT therapist)
- Odycy: 89,832/yr (7,486/mo) -- our figure: 6,618/mo (HC overview had TBD PT therapist)
- Excelsior: 118,812/yr (9,901/mo) -- our figure: 9,011/mo (close match)
- Novotel: 58,068/yr (4,839/mo) -- our figure: 4,871/mo (very close)

Note: The HC Payroll Overview uses a standardized "loaded" rate of 1,815/mo for FT Therapists regardless of actual base salary, which accounts for average commissions and all employer contributions. Our calculation uses actual base salaries + 10% NI, resulting in lower figures for spas with more junior/lower-paid staff. The HC Payroll Overview figures represent the BUDGET target; our figures represent the current ACTUAL baseline cost.
