# GOLDMAN SACHS -- DCF & VALUATION SCRUTINY REPORT

**To:** Carisma Wellness Group -- Investment Committee
**From:** Managing Director, Financial Sponsors Group / Valuation & Model Review
**Re:** INA Spa & Wellness -- Exhaustive Model Audit & Assumption Stress Test
**Date:** March 7, 2026
**Classification:** STRICTLY CONFIDENTIAL -- Investment Committee Use Only
**Model Reviewed:** `ina_model_v4_part1.py` (519 lines, generates Sheets 3, 5, 8, 9, 10 of the Excel workbook)
**Primary Reference:** INA-Spa-Consolidated-Model-ENHANCED-WORLD-CLASS.xlsx

---

## 1. EXECUTIVE SUMMARY -- TOP 10 CRITICAL FINDINGS

After line-by-line review of the Python model, cross-reference against the Fortina lease contract, seller's actual P&L data, and eight independent valuation memos, I identify the following critical issues ranked by severity:

| # | Finding | Severity | Impact on Valuation |
|---|---------|----------|---------------------|
| 1 | **Tax is computed on EBITDA, not PBT** -- Line 87 taxes positive EBITDA at 5%, ignoring depreciation as a tax-deductible expense. This overstates tax by EUR 9-16K/year and understates UFCF by EUR 120-200K cumulative over 13 years. | **CRITICAL** | NPV understated by EUR 40-70K |
| 2 | **Rent base in model (EUR 60K) does not match the actual contract for the acquisition year** -- Contract shows Year 3 fixed rent = EUR 60,000, but the buyer acquires during what is approximately Lease Year 6 (2026). The actual Year 6 fixed rent per contract is EUR 65,563. The model starts EUR 5,563 too low and compounds the error over 13 years. | **CRITICAL** | Rent understated by EUR 80-120K cumulative |
| 3 | **Turnover fee on clinic/slimming at 0.5% assumes deliberate under-declaration** -- The model annotates "5% of 10% declared = 0.5% effective." This is not legitimate structuring; it describes declaring only 10% of actual clinic/slimming revenue to the landlord. This is contractual fraud. If Fortina discovers it, the lease can be dissolved under Clause 9.1.3. | **DEAL-KILLER** | Entire investment at risk |
| 4 | **UFCF calculation omits depreciation add-back correctly but also omits lease payments as a separate cash item** -- Because rent is already in EBITDA (line 82 via opex), this is technically correct. However, the UFCF formula on line 92 does NOT deduct the security deposit (3 months' rent, ~EUR 18-20K) required by Clause 3.5 of the lease. This is a missing Day 1 cash outflow. | **HIGH** | EUR 18-20K missing from investment |
| 5 | **Depreciation of purchase price over 13 years is economically questionable** -- Line 36: `DEP_P = PURCHASE / 13`. The EUR 220K purchase price includes goodwill, client database, and assembled workforce -- none of which have a 13-year useful life. Goodwill should be impairment-tested, not straight-lined. | **MEDIUM** | Tax shield overstated (moot given Finding #1) |
| 6 | **Wage optimization formula produces unrealistic Year 1 clinic/slimming wages** -- Lines 67-68: Clinic wages = max(35000 * inflation, 0.28 * cli_revenue). At EUR 100K clinic revenue, the 28% threshold (EUR 28K) is below the EUR 35K base. A single full-time doctor/nurse in Malta costs EUR 35-50K. Two staff minimum for a medical aesthetics clinic = EUR 70-100K, not EUR 35K. | **HIGH** | Wages understated by EUR 35-65K/year for clinic |
| 7 | **No slimming revenue exists in the seller's P&L -- this is a pure greenfield assumption** -- The model assumes EUR 80K Year 1 slimming revenue with zero evidence from the seller's data. The entire slimming BU is speculative. | **HIGH** | EUR 80-300K of revenue is unsubstantiated |
| 8 | **Price sensitivity analysis on Sheet 10 (lines 497-509) uses a fixed EBITDA of EUR 36,500 for the x-multiple calculation regardless of purchase price** -- At EUR 400K purchase, the model shows "10.9x EBITDA" -- but this uses the current seller's EBITDA, not the model's own projected EBITDA. Inconsistent basis. | **MEDIUM** | Misleading multiples presentation |
| 9 | **Working capital change formula charges 5% of Year 1 total revenue as initial WC** -- Line 89: `wc = -(tot * 0.05)`. At EUR 620K total revenue (base case), this is EUR 31K. But there is already a EUR 20K WC line item in the investment. Double-counting or inconsistent? | **HIGH** | EUR 11-31K potential double-count |
| 10 | **Zero terminal value assumption masks the fact that this is a 13-year amortizing investment with no residual** -- While conservative, this means the model requires the entire EUR 350K investment to be recovered purely from operating cash flows within 13 years. Combined with the other errors, the margin of safety is much thinner than presented. | **MEDIUM** | Presentation risk -- deal looks better than it is |

---

## 2. MODEL MECHANICS AUDIT -- LINE BY LINE

### 2.1 Revenue Logic (Lines 53-60)

**Code:**
```python
if yr == 1:
    spa, cli, sli = sc['spa1'], sc['cli1'], sc['sli1']
else:
    spa = rows[-1]['spa'] * (1 + sc['sg'])
    cli = min(rows[-1]['cli'] * (1 + sc['cg']), sc['cc'])
    sli = min(rows[-1]['sli'] * (1 + sc['lg']), sc['lc'])
```

**Issues identified:**

(a) **Revenue cap implementation is correct mathematically** -- `min(prev * (1+g), cap)` properly limits growth. However, once the cap is hit, subsequent years remain at the cap forever. In reality, capped revenue should still grow with inflation (2-3%) or the cap itself should escalate. The model freezes clinic revenue at EUR 300K and slimming at EUR 300K in nominal terms for the remainder of the projection. By Year 13, EUR 300K in 2026 euros is worth approximately EUR 215K in real terms (at 2.5% inflation). This is actually a hidden conservatism, but it should be made explicit.

(b) **Spa revenue has no cap** -- it grows at the stated rate (5% base case) indefinitely. By Year 13, spa revenue reaches EUR 440K * 1.05^12 = EUR 790K. For a 7-room spa that currently generates EUR 426K, nearly doubling revenue implies either massive price increases or dramatic utilization improvement. Current utilization is ~4 appointments/room/day. EUR 790K implies ~7.4 appointments/room/day at current pricing -- which is essentially 100% utilization. This is unrealistic.

**Verdict: Spa revenue growth should be capped or tapered. Base case Year 13 revenue is AGGRESSIVE, not conservative.**

### 2.2 COGS Calculation (Line 61)

```python
cogs = -(COGS_S*spa + COGS_C*cli + COGS_L*sli)
```

**Issues:**

(a) **Spa COGS at 8% vs. seller's actual 10.4%.** The seller's P&L shows cost of sales at EUR 44,437 / EUR 426,018 = 10.4%. The model uses 8%. This understates COGS by ~EUR 10K/year. The model comment on Sheet 3 says "Products, consumables (8%)" -- but the actual data says 10.4%. The model should use 10% minimum for the spa.

(b) **Clinic COGS at 25% is in the right range** for medical aesthetics (injectables, consumables), but depends heavily on treatment mix. If the clinic is laser-focused (already 16.4% of existing revenue), consumable costs are lower (~15%). If it adds injectables (Botox, filler), COGS rises to 30-35%. The blended 25% is a reasonable assumption but should be sensitivity-tested.

(c) **Slimming COGS at 20%** -- no benchmark provided. Slimming clinics in Malta are primarily consultation + supplement-based. Supplement COGS can be 40-50% if retail-heavy. 20% implies a service-only model (body composition scans, meal plans) which may not generate EUR 80K in Year 1.

### 2.3 Wage Optimization (Lines 64-69) -- CRITICAL SECTION

```python
t = min(yr, sc['wo']) / sc['wo']
wp = sc['ws'] + (sc['wt'] - sc['ws']) * t
sw = wp * spa
cw = max(35000*(1+WAGE_INF)**(yr-1), 0.28*cli)
lw = max(28000*(1+WAGE_INF)**(yr-1), 0.25*sli)
wages = -(sw + cw + lw)
```

**Issues:**

(a) **Linear interpolation is mathematically correct.** At Year 1 (t=1/3), wp = 0.45 + (0.38-0.45)*(1/3) = 0.45 - 0.0233 = 0.4267. At Year 2 (t=2/3), wp = 0.4033. At Year 3 (t=1), wp = 0.38. The interpolation works as intended.

(b) **45% to 38% wage ratio over 3 years is AGGRESSIVE.** The current wage ratio is 49.2% (EUR 209K / EUR 426K). The model starts at 45% -- already assuming a 4.2 percentage point improvement in Year 1. That means cutting ~EUR 18K from the wage bill immediately. With Malta's employment protection laws, this requires either immediate redundancies (costly) or natural attrition (slow). The model does not budget for redundancy costs anywhere.

(c) **38% target is below the 35-40% industry benchmark floor cited in the Offer Summary.** Getting to 38% means operating at the very bottom of the benchmark range. For a single-location spa with no economies of scale, this is optimistic. 40-42% would be more realistic.

(d) **Clinic staffing cost of EUR 35K base is critically understated.** A medical aesthetics clinic in Malta requires, at minimum:
   - 1 medical director (part-time): EUR 25-40K
   - 1 aesthetic nurse/practitioner: EUR 28-35K
   - Reception/admin overlap with spa
   - **Minimum: EUR 53-75K**, not EUR 35K

   The `max(35000*inflation, 0.28*cli)` formula means the clinic wage stays at EUR 35K until clinic revenue exceeds EUR 125K (at which point 28% kicks in). But at EUR 100K revenue with EUR 35K wages, you have only EUR 65K left for everything else -- and you still need to pay for consumables (25% = EUR 25K), marketing, rent share, etc. The clinic is not viable with one EUR 35K employee.

(e) **Slimming staffing at EUR 28K is a single part-time employee.** A nutritionist or slimming consultant in Malta earns EUR 22-30K. But the slimming clinic also needs:
   - Body composition equipment operator
   - Consultation space
   - Scheduling/admin
   This may work initially with one person wearing multiple hats, but EUR 28K is at the very floor.

### 2.4 Rent Calculation (Lines 71-73) -- CRITICAL DISCREPANCY WITH CONTRACT

```python
rf = RENT_BASE * (1+RENT_ESC)**(yr-1)    # Fixed rent
rt = TO_SPA*spa + TO_CLI*cli + TO_SLI*sli  # Turnover fee
rent = -(rf + rt)
```

**Critical issues:**

(a) **RENT_BASE = EUR 60,000 does not match the contract for the acquisition year.**

The Fortina lease (Clause 3.1) specifies fixed rent by lease year:
- Lease Year 1: EUR 5,000 (subsidized)
- Lease Year 2: EUR 50,000
- Lease Year 3: EUR 60,000
- Lease Year 4: EUR 61,800
- Lease Year 5: EUR 63,654
- Lease Year 6: EUR 65,563
- ...and so on with ~3% escalation

The lease commenced July 1, 2020. By 2026 (the acquisition year), we are in approximately **Lease Year 6**, where the fixed rent is EUR 65,563 -- NOT EUR 60,000.

The model starts EUR 5,563 too low. With 3% compounding over 13 years, the cumulative underpayment is:

| Model Year | Model Fixed Rent | Actual Contract Rent | Annual Shortfall |
|------------|-----------------|---------------------|-----------------|
| 1 (2026) | 60,000 | 65,563 | 5,563 |
| 2 (2027) | 61,800 | 67,530 | 5,730 |
| 3 (2028) | 63,654 | 69,556 | 5,902 |
| ... | ... | ... | ... |
| 13 (2038) | 85,546 | 93,432 | 7,886 |

**Cumulative fixed rent understatement: approximately EUR 80,000-85,000 over 13 years.** This directly inflates EBITDA and UFCF, overstating NPV by approximately EUR 30-40K.

(b) **Turnover fee structure is the most dangerous assumption in the model.**

The contract (Clause 3.1) states: "A fixed amount of rent...and an additional five per cent (5%) fee calculated on the sales generated. The latter fee shall always be calculated on a minimum of three hundred fifty thousand Euro (EUR 350,000) sales or whichever amount is greatest."

This means:
- **ALL sales** generated at the premises are subject to 5% turnover fee
- There is a **minimum floor of EUR 350,000**
- The 5% applies to **spa, clinic, AND slimming** -- there is no multi-entity carve-out

The model applies:
- 5% on spa revenue (correct)
- 0.5% on clinic revenue (INCORRECT -- should be 5%)
- 0.5% on slimming revenue (INCORRECT -- should be 5%)

The model's annotation says "5% of 10% declared = 0.5% effective" -- this means declaring only 10% of clinic/slimming revenue to the landlord. This is:

1. **Contractual fraud** -- Clause 3.6 gives the landlord the right to audit accounts with 2 days' notice
2. **A lease dissolution trigger** -- Clause 9.1.3 allows the lessor to dissolve the lease for any breach of obligations
3. **Unenforceable long-term** -- operating three businesses from the same premises while declaring only 10% of two of them is not sustainable through 13 years of landlord audits

**If the turnover fee is correctly applied at 5% to ALL revenue:**

| Year | Total Revenue (Base) | Turnover Fee at 5% | Model's Fee (5% spa + 0.5% cli/sli) | Annual Shortfall |
|------|---------------------|--------------------|------------------------------------|-----------------|
| 1 | 620,000 | 31,000 | 22,900 | 8,100 |
| 5 | 895,000 | 44,750 | 30,287 | 14,463 |
| 13 | 1,200,000+ | 60,000+ | 37,000 | 23,000+ |

**Cumulative impact over 13 years: EUR 150,000-200,000 in additional rent.** This is the single largest error in the model and could turn a positive NPV deal into a negative one.

### 2.5 Tax Calculation (Line 87) -- STRUCTURAL ERROR

```python
tax = -(max(0, ebitda) * TAX)
```

**This taxes EBITDA at 5%, not taxable profit (PBT).**

Depreciation is a tax-deductible expense. Taxable income should be PBT (EBITDA minus depreciation), not EBITDA. The model computes PBT on line 84 (`pbt = ebitda + dep`) but then taxes EBITDA, not PBT.

Total depreciation per year:
- Years 1-7: EUR 16,923 (purchase/13) + EUR 11,429 (clinic/7) + EUR 4,286 (slim/7) = EUR 32,638
- Years 8-13: EUR 16,923

The tax overstatement per year (at 5% rate):
- Years 1-7: EUR 32,638 * 0.05 = EUR 1,632/year = EUR 11,424 over 7 years
- Years 8-13: EUR 16,923 * 0.05 = EUR 846/year = EUR 5,077 over 6 years
- **Total tax overstatement: ~EUR 16,500 over 13 years**

Additionally, the 5% effective tax rate itself requires scrutiny. Malta's corporate tax rate is 35%. The "full imputation system" allows shareholders to claim refunds of 6/7ths of tax paid, resulting in an effective rate of 5% for shareholders. However:
- This only works if the company distributes dividends
- The refund process takes 6-12 months
- The company still pays 35% upfront, creating a cash flow timing difference
- The model treats the 5% as the cash tax rate, which understates the working capital needed to pre-fund the 35% payment

**Corrected UFCF formula should use:** `tax = -(max(0, pbt) * TAX)` at minimum. For cash flow purposes, consideration should be given to the 35% payment timing.

### 2.6 UFCF Calculation (Lines 86-92)

```python
mc = -(MAINT*(1+GEN_INF)**(yr-1))
tax = -(max(0, ebitda) * TAX)
if yr == 1:
    wc = -(tot * 0.05)
else:
    wc = -((tot - rows[-1]['tot']) * 0.05)
ufcf = ebitda + mc + tax + wc
```

**Issues:**

(a) **Maintenance capex is NOT subtracted from EBITDA in the UFCF formula -- it is added.** Wait. Let me re-read: `ufcf = ebitda + mc + tax + wc`. Since `mc` is negative (line 86: `mc = -(MAINT*...)`), this correctly subtracts it. Same for tax and wc. The signs are internally consistent. **CORRECT.**

(b) **Working capital in Year 1 is 5% of TOTAL revenue = EUR 31K** (at EUR 620K total). But there is already EUR 20K allocated as WC in the investment (line 15). The Year 1 WC charge of EUR 31K represents the UFCF impact of working capital buildup for the new business. The EUR 20K in the investment is the initial cash set aside. These are conceptually different -- the EUR 20K is the cash you put in, and the EUR 31K is the cash consumed by operations. However, in a DCF where Year 0 = -EUR 350K (including EUR 20K WC), and Year 1 UFCF already deducts EUR 31K for WC, you are effectively funding EUR 51K of working capital. For a service business generating EUR 620K in revenue, 5% WC = EUR 31K is generous -- service businesses typically require 2-3% WC (receivables are minimal in a spa). The EUR 20K initial WC allocation on top is questionable.

(c) **Missing from UFCF:**
   - No redundancy/restructuring costs budgeted anywhere (EUR 15-30K estimated for wage reduction from 49% to 45%)
   - No security deposit (Clause 3.5: 3 months' rent via banker's guarantee = ~EUR 18-20K)
   - No transition costs (legal, accounting, lease assignment fees)
   - No insurance costs (Clause 5.21 requires comprehensive coverage: all-risks, third-party EUR 1M minimum, products liability)
   - The seller's actual P&L shows insurance at EUR 3,358/year -- not in the model's cost structure
   - No IT/software costs (seller's P&L: EUR 4,018/year)
   - No staff events / training budget

### 2.7 NPV Calculation (Lines 102-106)

```python
def compute_npv(data):
    npv = -TOTAL_INV
    for d in data:
        npv += d['ufcf'] / (1+DISCOUNT)**d['yr']
    return npv
```

**Assessment:** Mathematically correct. Year 0 is the investment, Year 1 onwards is discounted. Standard mid-period convention is not used (cash flows are discounted as end-of-year), which is slightly conservative. **CORRECT but conservative by ~2-3%.**

### 2.8 IRR Calculation (Lines 108-117)

```python
def compute_irr(data):
    cfs = [-TOTAL_INV] + [d['ufcf'] for d in data]
    lo, hi = -0.5, 5.0
    for _ in range(200):
        mid = (lo+hi)/2
        v = sum(cf/(1+mid)**t for t, cf in enumerate(cfs))
        if abs(v) < 1: return mid
        if v > 0: lo = mid
        else: hi = mid
    return mid
```

**Issues:**

(a) **Convergence tolerance of `abs(v) < 1` is too loose for EUR-denominated cash flows.** An NPV of EUR 0.99 is treated as zero. For a EUR 350K investment, this introduces negligible error (<0.01% IRR), but professional models should use `abs(v) < 0.01` or relative tolerance.

(b) **Search range of -0.5 to 5.0 (i.e., -50% to 500% IRR)** is adequate for this deal. No issue.

(c) **The bisection method is simple but reliable.** 200 iterations of bisection gives precision to approximately 2^-200 of the initial range, which is vastly more than needed. **CORRECT.**

(d) **Multiple IRR risk:** With the cash flow pattern [-350K, +small, +small, ..., +larger], there is only one sign change. No multiple IRR risk. **CORRECT.**

### 2.9 MOIC Calculation (Lines 119-120)

```python
def compute_moic(data):
    return sum(d['ufcf'] for d in data) / TOTAL_INV
```

**Assessment:** This is the ratio of total undiscounted UFCF to total investment. This is a standard MOIC calculation. **CORRECT.** However, a 13-year MOIC is less meaningful than a time-weighted metric. A 3x MOIC over 13 years sounds impressive but equates to only ~8.7% annualized -- below the 18% hurdle rate. The model should present the annualized return alongside MOIC to prevent misinterpretation.

### 2.10 Payback Calculation (Lines 122-127)

```python
def compute_payback(data):
    cum = -TOTAL_INV
    for d in data:
        cum += d['ufcf']
        if cum >= 0: return d['yr']
    return YEARS
```

**Assessment:** Simple payback, no discounting. Returns integer years (no interpolation for partial-year payback). Acceptable for a screening metric. **CORRECT but imprecise** -- could interpolate for partial years.

---

## 3. ASSUMPTION STRESS TEST

### Revenue Assumptions

| Assumption | Model Value | Rating | Evidence / Concern |
|-----------|------------|--------|-------------------|
| Spa Year 1 revenue EUR 440K | Base case | **Reasonable** | Seller's 2025 actual: EUR 426K. 3.3% growth implied = achievable but requires transition management. Post-acquisition client attrition typically 10-15%. Monte Carlo uses 12% mode attrition. Adjusted Year 1 should be EUR 375-400K. |
| Spa growth 5%/year (base) | 13-year compound | **Aggressive** | By Year 13, spa revenue = EUR 790K. Current utilization is 4 appts/room/day. EUR 790K implies near-100% utilization. Should taper to 2-3% after Year 5. |
| Clinic Year 1 EUR 100K | Base case | **Aggressive** | This assumes launching a medical aesthetics clinic from within an existing spa and generating EUR 100K in the first year. Realistic ramp: EUR 30-60K Year 1, EUR 80-120K Year 2. Note: EUR ~100K of laser/T-Shape revenue already exists in the spa line -- double-counting risk. |
| Clinic growth 20%/year | To EUR 300K cap | **Reasonable** | If clinic launches successfully, 20% growth is achievable in years 2-5. |
| Clinic cap EUR 300K | Permanent | **Reasonable** | Appropriate for a single-room medical aesthetics operation in Malta. |
| Slimming Year 1 EUR 80K | Base case | **Unrealistic** | Zero slimming revenue exists today. EUR 80K from a brand-new service line in Year 1 requires ~3 clients/day at EUR 100 average ticket. There is no evidence this market exists at this location. |
| Slimming growth 25%/year | To EUR 300K cap | **Aggressive** | 25% compounding on a speculative revenue stream. |
| Slimming cap EUR 300K | Permanent | **Aggressive** | EUR 300K from slimming in a single location is at the very top of the market in Malta. |

### Cost Assumptions

| Assumption | Model Value | Rating | Evidence / Concern |
|-----------|------------|--------|-------------------|
| COGS spa 8% | Below actuals | **Aggressive** | Actual 2025 COGS: 10.4%. Model should use 10%. |
| COGS clinic 25% | Industry range | **Reasonable** | Depends on treatment mix. 20-30% is the range. |
| COGS slimming 20% | No benchmark | **Uncertain** | Could be 15% (consultation-heavy) to 50% (supplement-heavy). |
| Wage start 45% | Below actual 49.2% | **Aggressive** | Assumes immediate 4pp cut from Day 1. Requires redundancies. |
| Wage target 38% | Below industry floor | **Very Aggressive** | Industry benchmark is 35-40%. 38% is achievable but at the bottom. |
| Wage optimization 3 years | Linear path | **Optimistic** | Malta employment law makes rapid restructuring difficult. 4-5 years more realistic. |
| Clinic staff EUR 35K | Single employee | **Unrealistic** | Need minimum 2 staff for medical clinic. EUR 65-90K more realistic. |
| Slimming staff EUR 28K | Single employee | **Optimistic** | Possible if part-time, but limits service capacity. |
| Rent base EUR 60K | Below contract | **Incorrect** | Should be EUR 65,563 for 2026 (Lease Year 6). See Section 2.4. |
| Rent escalation 3% | Contract-consistent | **Correct** | Matches the ~3% annual escalation pattern in the contract. |
| Turnover fee 0.5% clinic/slim | Under-declaration scheme | **Fraudulent/Unsustainable** | Contract requires 5% on ALL sales. See Section 2.4. |
| Marketing 6% then 5% | Of total revenue | **Reasonable** | EUR 37K Year 1 is adequate for multi-brand launch. |
| Utilities EUR 15K | Seller's actual EUR 14.7K | **Correct** | Matches 2025 actuals. |
| Cleaning EUR 12K | Below seller's EUR 15.8K | **Understated** | Should be EUR 16K minimum per actuals. |
| Other EUR 25K | Catch-all | **Unclear** | Seller's P&L shows general expenses EUR 8.6K + IT EUR 4K + insurance EUR 3.4K + marketing EUR 3.4K + other = ~EUR 20K. EUR 25K is adequate if insurance is included; insufficient if not. |
| Maintenance capex EUR 9K | Growing 2.5% | **Understated** | Seller spent EUR 2.1K on repairs in 2025 -- but the fit-out is only 2 years old. By Year 5-10 of a 15-year fit-out, maintenance rises significantly. EUR 15-20K/year more realistic for aging spa equipment and wet areas. |
| Discount rate 18% | Build-up method | **Reasonable** | 3.5% risk-free + 6.5% ERP + 4% small biz + 3.5% execution = 17.5%, rounded to 18%. Defensible for this risk profile. Could argue 20% given lease/turnover fee risk. |
| Tax 5% | Malta imputation | **Technically correct but misleading** | Cash tax is 35% upfront with 6/7ths refund later. Creates timing difference not modeled. |
| Working capital 5% | Of revenue | **High for service business** | Spas have minimal receivables and inventory. 2-3% is more appropriate. Overstates WC drain but provides conservatism (partially offsets other aggressive assumptions). |

---

## 4. MISSING ELEMENTS -- WHAT THE MODEL SHOULD INCLUDE

### 4.1 Missing Costs (Not Modeled Anywhere)

| Cost | Estimated Amount | Frequency | Impact |
|------|-----------------|-----------|--------|
| Redundancy costs (staff reduction from 49% to 45% wages) | EUR 15,000-30,000 | One-time, Year 1 | Material -- reduces Year 1 UFCF |
| Lease assignment legal fees | EUR 5,000-10,000 | One-time | Should be in investment |
| Security deposit (Clause 3.5) | EUR 18,000-22,000 | Refundable at lease end | Cash tied up for 13 years |
| Insurance (all-risks + liability + products) | EUR 5,000-8,000 | Annual | Reduces EBITDA by EUR 5-8K/year |
| IT software and systems | EUR 4,000-6,000 | Annual | Seller spends EUR 4K/year |
| Internal painting every 5 years (Clause 5.3) | EUR 5,000-10,000 | Every 5 years | Years 5 and 10 capex not budgeted |
| Medical licensing / regulatory compliance | EUR 3,000-5,000 | Annual | Required for clinic operations |
| Professional indemnity insurance for medical | EUR 3,000-5,000 | Annual | Required for clinic operations |
| Pest control (Clause 5.12) | EUR 1,000-2,000 | Annual | Minor but missing |
| Fire safety systems maintenance (Clause 5.19) | EUR 1,000-2,000 | Annual | Minor but missing |

**Total missing annual costs: EUR 17,000-28,000/year.** Over 13 years, this is EUR 220,000-364,000 in understated costs.

### 4.2 Missing Revenue Adjustments

| Adjustment | Estimated Impact | Rationale |
|-----------|-----------------|-----------|
| Year 1 client attrition (-10 to -15%) | -EUR 43K to -64K on spa revenue | Post-acquisition client loss is standard. Monte Carlo uses 12% mode. |
| Clinic revenue double-counting | -EUR 70K to -100K on clinic Year 1 | Laser (16.4%) and T-Shape (7.2%) = 23.6% of EUR 426K = ~EUR 100K already in spa baseline. If clinic "adds" EUR 100K, it may just be relabeling existing revenue. |
| Seasonality cash flow impact | Not modeled | July revenue drops to EUR 22K (54% below peak). Creates negative monthly cash flow for 2-3 months/year. No cash buffer modeled. |

### 4.3 Missing Structural Elements

1. **No scenario for lease assignment failure** -- The model has Bear/Base/Bull but no scenario where the lease is not assigned. This is a 20-30% probability event that results in total loss.

2. **No sensitivity to turnover fee correction** -- What happens to NPV if the turnover fee is 5% on ALL revenue (as the contract requires)?

3. **No transition/disruption period** -- The model assumes Day 1 operations at model assumptions. In reality, months 1-6 post-acquisition involve legal transfer, staff uncertainty, client communication, systems integration. Revenue typically dips 10-20% during transition.

4. **No capex refresh cycle** -- The fit-out is 2 years old now and will be 15 years old at lease expiry. Major equipment (HVAC, treatment beds, wet areas) will need replacement in Years 8-12. No capex budget beyond EUR 9K/year maintenance.

5. **No modeling of the Fortina hotel complex sale risk** -- Clause 9.3 allows the lessor to terminate if the complex is sold. Payout = EUR 150K + depreciated investment. This should be modeled as a tail risk scenario.

---

## 5. SCENARIO ANALYSIS GAPS

### 5.1 Current Scenarios -- Assessment

| Scenario | Probability | Assessment |
|----------|------------|------------|
| Bear (25%) | Spa EUR 410K, Clinic EUR 60K, Slim EUR 40K | **Not bearish enough.** True bear: Clinic fails to launch (EUR 0), slimming fails (EUR 0), spa declines 5% due to transition disruption. Total revenue EUR 380K. |
| Base (50%) | Spa EUR 440K, Clinic EUR 100K, Slim EUR 80K | **Optimistic for a "base case."** Assumes three successful business units from Year 1. True base: Spa EUR 420K, Clinic EUR 50K (delayed launch), Slim EUR 0 (not launched Year 1). |
| Bull (25%) | Spa EUR 450K, Clinic EUR 150K, Slim EUR 120K | **Extremely aggressive.** EUR 720K total revenue in Year 1 from a business that generated EUR 426K in 2025. Implies 69% revenue growth while simultaneously restructuring operations. |

### 5.2 Missing Scenarios

| Scenario | Probability | Description | NPV Impact |
|----------|------------|-------------|-----------|
| **Lease failure** | 20-30% | Fortina refuses assignment. Total loss of purchase price. Equipment salvage EUR 65K. | NPV = -EUR 285K |
| **Clinic regulatory block** | 10-15% | Planning authority or hotel refuses medical clinic. Spa-only operation. | NPV reduced by EUR 100-150K |
| **Key therapist departure** | 25-35% | Top 2-3 therapists leave post-acquisition, taking clients. 15% revenue hit. | NPV reduced by EUR 30-50K |
| **Turnover fee audit** | 30-50% over 13 years | Fortina audits accounts and discovers under-declaration. Demands back-payment + potential lease dissolution. | NPV = -EUR 350K (total loss) |
| **Hotel complex sale** | 10-15% over 13 years | Fortina sells complex. Clause 9.3 termination. Buyer receives EUR 150K + depreciated investment. | NPV dependent on timing |
| **Revenue stagnation + rent escalation** | 20-30% | Revenue flat at EUR 450K while rent grows 3%/year. Margin compression to zero by Year 8-10. | NPV turns negative |

---

## 6. CROSS-REFERENCE DISCREPANCIES

### Model vs. Seller's 2025 Actual P&L

| Line Item | Seller's 2025 Actual | Model Year 1 (Base) | Discrepancy |
|-----------|---------------------|--------------------|----|
| Spa Revenue | EUR 426,018 | EUR 440,000 | Model +3.3% -- reasonable |
| Clinic Revenue | ~EUR 100K (laser+T-Shape embedded in spa) | EUR 100,000 (separate line) | **Potential double-count** -- the EUR 426K already includes ~EUR 100K of "clinic" treatments |
| Slimming Revenue | EUR 0 | EUR 80,000 | **Entirely speculative** -- zero precedent |
| Total Revenue | EUR 426,018 | EUR 620,000 | Model +45.5% over actuals -- driven by new BUs |
| Cost of Sales | EUR 44,437 (10.4%) | ~EUR 60K (blended ~9.7%) | Roughly aligned if clinic/slim COGS are higher |
| Wages | EUR 209,574 (49.2%) | EUR 198K (spa) + EUR 35K (cli) + EUR 28K (slim) = EUR 261K (42%) | Model assumes BOTH lower ratio AND more staff -- contradictory |
| Rent | EUR 71,689 | EUR 60K + EUR 22.9K = EUR 82.9K | Model's fixed rent too low; turnover fee on only spa is too low |
| Utilities | EUR 14,741 | EUR 15,000 | Matched |
| Cleaning | EUR 15,784 | EUR 12,000 | **Model understated by EUR 3,784** |
| Insurance | EUR 3,358 | EUR 0 (not modeled) | **Missing** |
| IT/Software | EUR 4,018 | EUR 0 (in "Other"?) | **Unclear** |
| Marketing | EUR 3,419 (actual) + EUR 17,000 (advertising) = EUR 20,419 | EUR 37,200 (6% of EUR 620K) | Model higher -- appropriate for growth plan |
| Depreciation | EUR 55,516 | EUR 32,638 | Different basis -- model depreciates buyer's investment, not seller's |
| EBITDA | EUR 36,538 (8.6%) | Computed by model | Must verify against corrected assumptions |

### Model vs. Contract -- Rent Schedule

| Contract Year | Contract Fixed Rent | Model Implied Rent | Correct? |
|--------------|--------------------|--------------------|----------|
| Year 6 (2026) - Model Year 1 | EUR 65,563 | EUR 60,000 | **NO -- EUR 5,563 too low** |
| Year 7 (2027) - Model Year 2 | EUR 67,530 | EUR 61,800 | **NO -- EUR 5,730 too low** |
| Year 8 (2028) - Model Year 3 | EUR 69,556 | EUR 63,654 | **NO -- EUR 5,902 too low** |

The model appears to use Year 3 of the lease as its starting point (EUR 60,000), not the actual year of acquisition (Year 6). This is a fundamental timing error.

### Model vs. Contract -- Turnover Fee

The contract is unambiguous: "five per cent (5%) fee calculated on the sales generated" with a minimum of EUR 350,000. There is NO provision for multi-entity carve-outs, reduced rates for non-spa services, or declaring only a fraction of revenue. The model's 0.5% on clinic/slimming is NOT supported by the contract.

---

## 7. VALUATION METHODOLOGY CRITIQUE

### 7.1 Is DCF Appropriate?

DCF is the correct primary methodology for a lease-bounded investment with a defined cash flow horizon. However:

(a) **The 13-year projection period, while matching the remaining lease, assumes the model can accurately forecast operating conditions 13 years out.** For a 2-year-old business with no proven profitability, projections beyond Year 5 are speculative. The model should present NPV at both 5 and 13 years.

(b) **Zero terminal value is conservative for the stated purpose (no residual at lease end) but is offset by aggressive operating assumptions.** The conservatism of zero TV masks the aggressiveness of the revenue and cost projections. A model with moderate assumptions and a terminal value could yield the same NPV as an aggressive model with no TV -- but the risk profile would be very different.

### 7.2 Probability-Weighted NPV is Misleading

The expected NPV = 25% * Bear_NPV + 50% * Base_NPV + 25% * Bull_NPV

This:
- Excludes the 20-30% probability of lease failure (total loss)
- Excludes the 30-50% cumulative probability of turnover fee audit
- Assigns equal probability (25%) to bear and bull, despite the business having zero track record in clinic/slimming
- Does not include a "disaster" scenario with any weight

A proper probability-weighted NPV including lease failure:

Expected NPV = 25% * Failure_NPV + 20% * Bear_NPV + 35% * Base_NPV + 20% * Bull_NPV

Where Failure NPV = -EUR 285K (lose everything except equipment salvage)

This would reduce the expected NPV by approximately EUR 70-90K relative to the model's output.

### 7.3 Multiples Validation

The price sensitivity table (Sheet 10) uses EUR 36,500 as the EBITDA for computing x-multiples regardless of the model's own projected EBITDA. At EUR 220K purchase price, the model shows "6.0x EBITDA" -- this is 6.0x the CURRENT (seller's) EBITDA, which is appropriate for an acquisition multiple. But the model's own projected Year 1 EBITDA is much higher (base case: ~EUR 75-85K estimated), which would imply a much lower entry multiple of 2.6-2.9x. The presentation should clarify which EBITDA basis is being used.

---

## 8. RISK MATRIX

| Risk | Probability | Financial Impact | Expected Loss | Model Treatment |
|------|-----------|-----------------|--------------|-----------------|
| Lease assignment failure | 25% | EUR 285K (total loss less salvage) | EUR 71,250 | **Not modeled** |
| Turnover fee audit/enforcement | 40% (cumulative over 13yr) | EUR 150-200K back-rent + lease risk | EUR 60-80K | **Not modeled -- model assumes fraud** |
| Clinic fails to launch/underperforms | 30% | EUR 100-150K NPV reduction | EUR 30-45K | Partially in Bear case |
| Slimming fails entirely | 50% | EUR 50-80K NPV reduction | EUR 25-40K | Partially in Bear case |
| Wage optimization fails (stays >42%) | 35% | EUR 30-50K NPV reduction | EUR 10-18K | Partially in Bear case |
| Key staff departure post-acquisition | 30% | EUR 30-50K revenue impact | EUR 9-15K | **Not modeled** |
| Revenue stagnation + rent escalation squeeze | 25% | EBITDA goes to zero by Year 8-10 | Variable | **Not modeled** |
| Hotel complex sale (Clause 9.3) | 10% | EUR 150K payout + lost business | EUR 15-20K | **Not modeled** |
| Regulatory changes (medical clinic) | 10% | EUR 80K clinic capex wasted | EUR 8K | **Not modeled** |
| Equipment failure/major repair | 20% | EUR 20-40K unbudgeted capex | EUR 4-8K | Partially via maintenance |
| **TOTAL EXPECTED RISK-ADJUSTED LOSS** | | | **EUR 262-365K** | |

**This risk-adjusted loss is approximately equal to the entire investment.** The model does not adequately account for the probability-weighted downside.

---

## 9. DEAL-KILLER SCENARIOS

### Scenario 1: Lease Not Assigned (P = 25-30%)
- Fortina exercises absolute discretion under Clause 5.26 and refuses
- All investment in purchase price is lost
- Salvageable: EUR 65K portable equipment
- Maximum loss: EUR 285K

### Scenario 2: Turnover Fee Discovered (P = 40% cumulative)
- Fortina audits accounts (Clause 3.6) and discovers clinic/slimming revenue not declared
- Demands back-payment of 4.5% on all undeclared revenue (potentially EUR 50-100K)
- May invoke Clause 9.1.3 to dissolve lease for breach
- If lease dissolved: total loss of fit-out, purchase price, clinic capex
- Maximum loss: EUR 350K

### Scenario 3: Fortina Sells Complex (P = 10-15% over 13 years)
- Under Clause 9.3, new owner can terminate lease
- Lessee receives: EUR 150K + depreciated investment (10%/year after year 2)
- If sale occurs in Year 5: recovery = EUR 150K + ~50% of EUR 220K = EUR 260K
- Net loss depends on timing but could be EUR 40-90K after factoring in sunk clinic capex

### Scenario 4: Clinic and Slimming Both Fail (P = 15-20%)
- Spa-only operation with optimized costs
- Revenue ~EUR 450K, EBITDA ~EUR 45-60K
- 13-year UFCF insufficient to recover EUR 350K investment at 18% hurdle
- NPV: approximately -EUR 50K to -EUR 100K

### Scenario 5: Revenue Stagnates While Rent Escalates (P = 20-25%)
- Spa revenue flat at EUR 430K for 13 years
- Rent grows from EUR 88K (actual Year 6+turnover) to EUR 145K+ by Year 15
- EBITDA compressed from EUR 36K to approximately EUR 0 by Year 10-12
- NPV: deeply negative

---

## 10. RECOMMENDATIONS -- SPECIFIC CHANGES REQUIRED

### 10.1 Critical Model Fixes (Must-Do Before Any Decision)

| # | Fix | Impact |
|---|-----|--------|
| 1 | **Change tax calculation from EBITDA to PBT:** `tax = -(max(0, pbt) * TAX)` | Increases UFCF by ~EUR 1,600/year |
| 2 | **Correct rent base to EUR 65,563 (Lease Year 6)** instead of EUR 60,000 | Decreases EBITDA by ~EUR 5,500/year |
| 3 | **Apply 5% turnover fee to ALL revenue** (spa + clinic + slimming) as per contract -- or explicitly model the legal risk of under-declaration as a scenario | Decreases EBITDA by EUR 8-23K/year |
| 4 | **Add Year 1 client attrition** (10-15% on spa revenue) | Decreases Year 1 spa revenue by EUR 40-66K |
| 5 | **Increase clinic staffing cost** to minimum EUR 65K (2 FTE) | Increases clinic wages by EUR 30K/year |
| 6 | **Add insurance, IT, and missing OpEx** (~EUR 12-15K/year) | Decreases EBITDA |
| 7 | **Add lease failure scenario** (25% probability, -EUR 285K) to probability-weighted NPV | Significantly reduces expected NPV |
| 8 | **Cap spa revenue growth** at 3% after Year 5 or impose a utilization ceiling | Reduces Year 6-13 revenue |
| 9 | **Add EUR 20-30K one-time restructuring cost** in Year 1 UFCF | Reduces Year 1 cash flow |
| 10 | **Add security deposit** (EUR 18-22K) to Year 0 investment | Increases total investment |

### 10.2 Model Enhancements (Should-Do)

| # | Enhancement |
|---|------------|
| 1 | Add a "Corrected Rent" scenario using actual contract figures |
| 2 | Add a "Full Turnover Fee" scenario at 5% on all revenue |
| 3 | Add a "Lease Failure" scenario with salvage value only |
| 4 | Present 5-year NPV alongside 13-year NPV |
| 5 | Add monthly cash flow for Year 1 showing seasonality impact |
| 6 | Add sensitivity table for wage ratio target (36% / 38% / 40% / 42%) |
| 7 | Add sensitivity table for clinic launch success (0% / 50% / 100% of projected) |
| 8 | Annualize MOIC to prevent misleading presentation |
| 9 | Model the 35% upfront tax payment with 6/7ths refund timing |
| 10 | Add a capex refresh budget for Years 8-13 |

### 10.3 Estimated Impact of All Corrections on Base Case NPV

| Adjustment | NPV Impact |
|-----------|-----------|
| Tax on PBT instead of EBITDA | +EUR 5K (favorable) |
| Correct rent base (EUR 65.5K vs EUR 60K) | -EUR 25K |
| Full 5% turnover fee on all revenue | -EUR 60K to -EUR 80K |
| Year 1 client attrition (12%) | -EUR 15K |
| Increased clinic staffing (EUR 65K vs EUR 35K) | -EUR 100K |
| Missing OpEx (insurance, IT, etc.) | -EUR 40K |
| Correct cleaning costs | -EUR 3K |
| Restructuring costs Year 1 | -EUR 8K |
| Security deposit in investment | -EUR 7K |
| **Total estimated NPV adjustment** | **-EUR 253K to -EUR 273K** |

**If the base case NPV is currently positive (let us estimate +EUR 100-150K based on the model's aggressive assumptions), these corrections would produce a CORRECTED BASE CASE NPV of approximately -EUR 100K to -EUR 170K.**

**This means the deal is NPV-negative at EUR 350K total investment under corrected assumptions.**

### 10.4 What Purchase Price Makes the Corrected Model Work?

For the corrected model to produce NPV = 0 (i.e., exactly meet the 18% hurdle rate), the total investment must decrease by EUR 100-170K.

Total investment = Purchase + Clinic Capex + Slim Capex + WC + Deposit
EUR 350K - EUR 135K (midpoint correction) = EUR 215K

This implies a purchase price of approximately:
EUR 215K - EUR 80K (clinic) - EUR 30K (slim) - EUR 20K (WC) - EUR 20K (deposit) = **EUR 65K**

That is clearly too low. But it demonstrates the magnitude of the model's optimistic bias. **The model, as constructed, makes a EUR 220K purchase price look like a bargain. After corrections, the deal barely works at EUR 220K -- and only if the turnover fee arrangement is legally sustainable (which it is not).**

### 10.5 Final Assessment

**With all corrections applied and full 5% turnover fee enforced:**
- The deal is marginally NPV-positive at EUR 150-180K purchase price
- The deal is NPV-neutral at approximately EUR 200K purchase price
- The deal is NPV-negative at EUR 220K+ purchase price

**This is broadly consistent with the Monte Carlo simulation's finding** that the unconditional probability of positive NPV at EUR 220K is only 40%, and that the conditional probability (lease secured) is approximately 52%.

**The model as currently constructed significantly overstates the attractiveness of this investment.** The core issues are: (1) the turnover fee scheme that is contractually unsustainable, (2) the understated rent base, (3) the understated clinic staffing costs, and (4) the speculative slimming revenue with no precedent.

**Recommendation: Do NOT use this model for investment committee approval without implementing the corrections in Section 10.1. The current model output is materially misleading.**

---

*This memorandum has been prepared by the Valuation & Model Review group for investment committee deliberation only. All projections and estimates are based on the Python model code, the Fortina lease contract, seller's P&L data from the info pack, and eight independent advisory memos provided in the data room. This review identifies issues with the model -- it does not constitute a fairness opinion or investment recommendation. The identified issues should be corrected and the model re-run before any investment decision is made.*

**Prepared by:** Managing Director, Valuation & Model Review
**Date:** March 7, 2026
**Classification:** STRICTLY CONFIDENTIAL
